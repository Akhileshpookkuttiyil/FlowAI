export const errorHandler = (err, req, res, next) => {
  console.error("Global Error:", err.message || err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};
