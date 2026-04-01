import { z } from 'zod';

export const askAISchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(2000, 'Prompt too long'),
  modelId: z.string().nullable().optional(),
});

export const saveResponseSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  response: z.string().min(1, 'Response text is required'),
});

export const validateRequest = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.errors?.[0]?.message || 'Validation failed',
    });
  }
};
