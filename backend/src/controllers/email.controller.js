import { config } from "../config/env.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendEmail as brevoEmailAction } from "../services/emailService.js";
import nodemailer from "nodemailer";

export const sendEmail = asyncHandler(async (req, res) => {
  const { to, subject, message } = req.body;

  if (!to || !subject || !message) {
    return res.status(400).json({ success: false, error: "Missing recipient, subject, or message" });
  }

  // Strategy 1: High-Speed API (Recommended for Vercel < 2s response)
  if (config.brevoApiKey) {
    try {
      await brevoEmailAction({ to, subject, message });
      return res.status(200).json({ success: true, message: "Sent via High-Speed API" });
    } catch (error) {
      console.error("API Send Error:", error.message);
      // Fall through to SMTP if API fails
    }
  }

  // Strategy 2: Optimized Gmail SMTP (Fallback, slower)
  if (!config.gmailUser || !config.gmailAppPassword) {
    return res.status(500).json({ success: false, error: "SMTP credentials missing" });
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // Use SSL/TLS
    auth: { user: config.gmailUser, pass: config.gmailAppPassword },
    // Optimizations for Serverless: No pooling, fast handshake
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

  /**
   * FASTER RESPONSE ARCHITECTURE: 
   * On Vercel, we respond immediately and trigger the email in background.
   * Note: This carries a small risk of process termination before completion,
   * but is necessary for slow SMTP exchanges on Hobby plan (10s limit).
   */
  transporter.sendMail(mailOptions).catch(err => console.error("SMTP BG Error:", err));

  res.status(200).json({
    success: true,
    message: "Email signaled for dispatch. (Responded fast to prevent Vercel timeout)",
  });
});
