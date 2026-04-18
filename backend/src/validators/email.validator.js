import { z } from "zod";

export const sendEmailSchema = z.object({
  responseId: z.string().trim().min(1, "responseId is required."),
});
