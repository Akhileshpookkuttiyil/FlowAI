import axios from "axios";
import { config } from "../config/env.js";
export const sendEmail = async ({ to, subject, message }) => {
  if (!config.brevoApiKey) {
    throw new Error("BREVO_API_KEY is not configured.");
  }
  if (!config.brevoSenderEmail) {
    throw new Error("BREVO_SENDER_EMAIL is not configured.");
  }

  const data = {
    sender: { name: config.brevoSenderName, email: config.brevoSenderEmail },
    to: [{ email: to }],
    subject: subject,
    textContent: message,
  };

  try {
    const response = await axios.post("https://api.brevo.com/v3/smtp/email", data, {
      headers: {
        "api-key": config.brevoApiKey,
        "content-type": "application/json",
        "accept": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Brevo API Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to send email via Brevo API.");
  }
};
