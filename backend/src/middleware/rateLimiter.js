import { asyncHandler } from "../utils/asyncHandler.js";

const rateLimitMap = new Map();

export const emailRateLimiter = asyncHandler(async (req, res, next) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  const now = Date.now();
  const ONE_HOUR = 60 * 60 * 1000;
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const COOLDOWN = 30 * 1000;

  if (!rateLimitMap.has(userId)) {
    rateLimitMap.set(userId, []);
  }

  const timestamps = rateLimitMap.get(userId);

  // Clean old timestamps
  const validTimestamps = timestamps.filter(t => now - t < ONE_DAY);
  rateLimitMap.set(userId, validTimestamps);

  // Check cooldown
  if (validTimestamps.length > 0) {
    const lastRequest = validTimestamps[validTimestamps.length - 1];
    if (now - lastRequest < COOLDOWN) {
      return res.status(429).json({ success: false, error: "Please wait 30 seconds before sending another email." });
    }
  }

  // Check hourly limit (5 emails/hour)
  const hourlyCount = validTimestamps.filter(t => now - t < ONE_HOUR).length;
  if (hourlyCount >= 5) {
    return res.status(429).json({ success: false, error: "Hourly limit exceeded (5 emails/hour)." });
  }

  // Check daily limit (20 emails/day)
  if (validTimestamps.length >= 20) {
    return res.status(429).json({ success: false, error: "Daily limit exceeded (20 emails/day)." });
  }

  validTimestamps.push(now);
  next();
});
