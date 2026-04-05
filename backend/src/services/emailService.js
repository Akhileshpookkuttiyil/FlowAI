import axios from "axios";
import { config } from "../config/env.js";

/**
 * Email Service using Brevo (formerly Sendinblue) API.
 * Why Brevo? 
 * 1. Fast REST API (avoids SMTP handshakes causing Vercel timeouts)
 * 2. Free tier (300/day)
 * 3. Allows sending from verified Gmail address without a paid domain.
 */
export const sendEmail = async ({ to, subject, message }) => {
  if (!config.brevoApiKey) {
    throw new Error("BREVO_API_KEY is not configured.");
  }

  const data = {
    sender: { name: "FlowAI Builder", email: config.gmailUser },
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
