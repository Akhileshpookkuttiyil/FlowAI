import { config } from "../config/env.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendEmail as brevoEmailAction } from "../services/emailService.js";
import nodemailer from "nodemailer";

export const sendEmail = asyncHandler(async (req, res) => {
  const { to, subject, message } = req.body;

  if (!to || !subject || !message) {
    return res.status(400).json({ success: false, error: "Missing recipient, subject, or message" });
  }

  if (config.brevoApiKey) {
    try {
      const brevoResult = await brevoEmailAction({ to, subject, message });
      return res.status(200).json({
        success: true,
        provider: "brevo",
        message: "Email accepted by Brevo for delivery.",
        messageId: brevoResult?.messageId || brevoResult?.messageIds?.[0] || null,
      });
    } catch (error) {
      console.error("API Send Error:", error.message);
    }
  }

  if (!config.gmailUser || !config.gmailAppPassword) {
    return res.status(500).json({ success: false, error: "SMTP credentials missing" });
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: config.gmailUser, pass: config.gmailAppPassword },
    pool: false,
    connectionTimeout: 5000, 
    greetingTimeout: 5000,
    socketTimeout: 5000,
  });

  const mailOptions = {
    from: `"FlowAI [noreply]" <${config.gmailUser}>`,
    to,
    subject,
    text: message,
  };

  try {
    const smtpResult = await transporter.sendMail(mailOptions);
    return res.status(200).json({
      success: true,
      provider: "gmail-smtp",
      message: "Email accepted by Gmail SMTP for delivery.",
      messageId: smtpResult?.messageId || null,
    });
  } catch (error) {
    console.error("SMTP Send Error:", error);
    return res.status(502).json({
      success: false,
      error: error.message || "Failed to send email via Gmail SMTP.",
    });
  }
});
