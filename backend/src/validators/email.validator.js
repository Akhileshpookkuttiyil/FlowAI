import { z } from "zod";

export const sendEmailSchema = z.object({
  to: z.string().trim().email("Recipient email is invalid."),
  subject: z
    .string()
    .trim()
    .min(1, "Subject is required.")
    .max(200, "Subject must be 200 characters or fewer."),
  message: z
    .string()
    .trim()
    .min(1, "Message is required.")
    .max(10000, "Message must be 10000 characters or fewer."),
});
