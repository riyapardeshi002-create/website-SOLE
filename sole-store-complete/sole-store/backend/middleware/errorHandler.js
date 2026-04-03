// backend/middleware/errorHandler.js
const errorHandler = (err, req, res, _next) => {
  console.error(`[${req.method} ${req.path}]`, err.message);

  if (err.code === '23505') {
    const field = err.detail?.match(/\((.+?)\)/)?.[1] || 'field';
    return res.status(409).json({ success: false, message: `${field} already exists` });
  }
  if (err.code === '23503')
    return res.status(400).json({ success: false, message: 'Referenced record not found' });

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

const notFound = (req, res) =>
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });

module.exports = { errorHandler, notFound };
