/**
 * Attaches req.userId from Clerk-verified token (populated by ClerkExpressWithAuth in app.js).
 */
export const requireAuth = (req, res, next) => {
  if (!req.auth || !req.auth.userId) {
    return res.status(401).json({ 
      success: false, 
      error: "Session expired or invalid token" 
    });
  }
  
  req.userId = req.auth.userId;
  next();
};
