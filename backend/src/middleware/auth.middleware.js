import { getAuth } from '@clerk/clerk-sdk-node';

/**
 * Middleware to strictly enforce Clerk authentication.
 * Attaches req.userId for downstream controller use.
 */
export const requireAuth = (req, res, next) => {
  const { userId } = getAuth(req);
  
  if (!userId) {
    return res.status(401).json({ 
      success: false, 
      error: "Session expired or invalid token" 
    });
  }
  
  req.userId = userId;
  next();
};
