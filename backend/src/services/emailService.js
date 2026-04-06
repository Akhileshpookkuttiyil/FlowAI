import axios from "axios";
import { config } from "../config/env.js";

const BREVO_API_BASE_URL = "https://api.brevo.com/v3";
const BREVO_REQUEST_TIMEOUT_MS = 10000;
const BREVO_CONFIG_CACHE_TTL_MS = 5 * 60 * 1000;

class BrevoEmailError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.name = "BrevoEmailError";
    this.status = status;
  }
}

let brevoConfigCache = {
  validatedAt: 0,
  senderEmail: "",
};

const getBrevoHeaders = () => ({
  "api-key": config.brevoApiKey,
  "content-type": "application/json",
  accept: "application/json",
});

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

const isCacheValid = () =>
  brevoConfigCache.senderEmail === normalizeEmail(config.brevoSenderEmail) &&
  Date.now() - brevoConfigCache.validatedAt < BREVO_CONFIG_CACHE_TTL_MS;

const getBrevoErrorMessage = (error, fallbackMessage) => {
  const responseData = error?.response?.data;

  if (typeof responseData?.message === "string" && responseData.message.trim()) {
    return responseData.message.trim();
  }

  if (typeof responseData?.code === "string" && responseData.code.trim()) {
    return `${fallbackMessage} (${responseData.code.trim()})`;
  }

  if (typeof error?.message === "string" && error.message.trim()) {
    return error.message.trim();
  }

  return fallbackMessage;
};

const verifyBrevoConfiguration = async () => {
  if (!config.brevoApiKey) {
    throw new BrevoEmailError("BREVO_API_KEY is not configured.", 500);
  }

  if (!config.brevoSenderEmail) {
    throw new BrevoEmailError("BREVO_SENDER_EMAIL is not configured.", 500);
  }

  if (isCacheValid()) {
    return;
  }

  try {
    await axios.get(`${BREVO_API_BASE_URL}/account`, {
      headers: getBrevoHeaders(),
      timeout: BREVO_REQUEST_TIMEOUT_MS,
    });
  } catch (error) {
    throw new BrevoEmailError(
      getBrevoErrorMessage(error, "Brevo API key validation failed. Check BREVO_API_KEY."),
      error?.response?.status === 401 ? 500 : 502
    );
  }

  let senders = [];

  try {
    const response = await axios.get(`${BREVO_API_BASE_URL}/senders`, {
      headers: getBrevoHeaders(),
      timeout: BREVO_REQUEST_TIMEOUT_MS,
    });

    senders = Array.isArray(response?.data?.senders) ? response.data.senders : [];
  } catch (error) {
    throw new BrevoEmailError(
      getBrevoErrorMessage(error, "Failed to verify Brevo sender configuration."),
      error?.response?.status === 401 ? 500 : 502
    );
  }

  const sender = senders.find(
    (item) => normalizeEmail(item?.email) === normalizeEmail(config.brevoSenderEmail)
  );

  if (!sender) {
    throw new BrevoEmailError(
      `BREVO_SENDER_EMAIL (${config.brevoSenderEmail}) is not registered in your Brevo account.`,
      500
    );
  }

  if (sender.active === false) {
    throw new BrevoEmailError(
      `BREVO_SENDER_EMAIL (${config.brevoSenderEmail}) exists in Brevo but is not active or verified yet.`,
      500
    );
  }

  brevoConfigCache = {
    validatedAt: Date.now(),
    senderEmail: normalizeEmail(config.brevoSenderEmail),
  };
};

export const sendEmail = async ({ to, subject, message }) => {
  await verifyBrevoConfiguration();

  const data = {
    sender: { name: config.brevoSenderName, email: config.brevoSenderEmail },
    to: [{ email: to }],
    subject: subject,
    textContent: message,
  };

  try {
    const response = await axios.post("https://api.brevo.com/v3/smtp/email", data, {
      headers: getBrevoHeaders(),
      timeout: BREVO_REQUEST_TIMEOUT_MS,
    });

    const messageId = response?.data?.messageId || response?.data?.messageIds?.[0] || null;

    if (!messageId) {
      throw new BrevoEmailError(
        "Brevo accepted the request but did not return a message ID. Delivery status is unknown.",
        502
      );
    }

    return response.data;
  } catch (error) {
    if (error instanceof BrevoEmailError) {
      throw error;
    }

    console.error("Brevo API Error:", error.response?.data || error.message);

    const isConfigError = error?.response?.status === 401 || error?.response?.status === 403;

    throw new BrevoEmailError(
      getBrevoErrorMessage(error, "Failed to send email via Brevo API."),
      isConfigError ? 500 : 502
    );
  }
};
