import { config } from "../config/env.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendEmail as brevoEmailAction } from "../services/emailService.js";

export const sendEmail = asyncHandler(async (req, res) => {
  const { to, subject, message } = req.body;

  if (!config.brevoApiKey || !config.brevoSenderEmail) {
    return res.status(500).json({
      success: false,
      error: "Brevo email is not configured. Set BREVO_API_KEY and BREVO_SENDER_EMAIL.",
    });
  }

  try {
    const brevoResult = await brevoEmailAction({ to, subject, message });
    return res.status(200).json({
      success: true,
      provider: "brevo",
      message: "Email accepted by Brevo for delivery.",
      messageId: brevoResult?.messageId || brevoResult?.messageIds?.[0] || null,
    });
  } catch (error) {
    console.error("Brevo email failed:", error.message);
    return res.status(error.status || 502).json({
      success: false,
      error: error.message || "Failed to send email via Brevo API.",
    });
  }
});
