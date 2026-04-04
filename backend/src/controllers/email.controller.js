import nodemailer from "nodemailer";
import { config } from "../config/env.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const sendEmail = asyncHandler(async (req, res) => {
  const { to, subject, message } = req.body;

  if (!to || !subject || !message) {
    return res.status(400).json({
      success: false,
      error: "Missing recipient, subject, or message content",
    });
  }

  if (!config.gmailUser || !config.gmailAppPassword) {
    console.error("Critical: GMAIL_USER or GMAIL_APP_PASSWORD not configured in environment variables.");
    return res.status(500).json({
      success: false,
      error: "Server configuration error: Email credentials missing.",
    });
  }

  // Create transporter optimized for single-invocation Serverless functions
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.gmailUser,
      pass: config.gmailAppPassword,
    },
    // Serverless requires fast handshakes - no pooling
    logger: false,
    debug: false,
  });

  const mailOptions = {
    from: `"FlowAI Assistant" <${config.gmailUser}>`,
    to,
    subject,
    text: message,
  };

  try {
    console.log(`Attempting to send email to ${to}...`);
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");
    
    res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    console.error("Nodemailer Error Details:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to send email via SMTP.",
    });
  }
});
