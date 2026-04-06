import { config } from "../config/env.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendEmail as brevoEmailAction } from "../services/emailService.js";
import nodemailer from "nodemailer";

export const sendEmail = asyncHandler(async (req, res) => {
  const { to, subject, message } = req.body;
  const canUseGmailSmtp = Boolean(config.gmailUser && config.gmailAppPassword);
  const wantsBrevo = config.emailProvider !== "gmail";
  const wantsGmailSmtp = config.emailProvider === "gmail";
  const canFallbackToGmailSmtp =
    canUseGmailSmtp &&
    (config.nodeEnv !== "production" || config.allowSmtpFallback || wantsGmailSmtp);

  if (!to || !subject || !message) {
    return res.status(400).json({ success: false, error: "Missing recipient, subject, or message" });
  }

  if (wantsBrevo && config.brevoApiKey) {
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

      if (!canFallbackToGmailSmtp) {
        return res.status(502).json({
          success: false,
          error:
            "Brevo email failed. Set a valid BREVO_API_KEY and verified BREVO_SENDER_EMAIL in production.",
        });
      }
    }
  }

  if (!canUseGmailSmtp) {
    return res.status(500).json({
      success: false,
      error: wantsGmailSmtp
        ? "Gmail SMTP credentials are missing."
        : "No working email provider is configured.",
    });
  }

  if (!canFallbackToGmailSmtp) {
    return res.status(502).json({
      success: false,
      error:
        "Gmail SMTP fallback is disabled in production. Configure Brevo or set ALLOW_SMTP_FALLBACK=true explicitly.",
    });
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
      error:
        error.message ||
        "Failed to send email via Gmail SMTP. Use Brevo in production for reliable delivery.",
    });
  }
});
