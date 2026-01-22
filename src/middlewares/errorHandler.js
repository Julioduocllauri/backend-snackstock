export const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.stack);

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    success: false,
    error: {
      message,
      status
    }
  });
};