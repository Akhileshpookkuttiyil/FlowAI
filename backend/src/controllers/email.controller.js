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

  // Create transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.gmailUser,
      pass: config.gmailAppPassword,
    },
  });

  const mailOptions = {
    from: `"FlowAI Assistant" <${config.gmailUser}>`,
    to,
    subject,
    text: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    console.error("Nodemailer Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send email via SMTP.",
    });
  }
});
