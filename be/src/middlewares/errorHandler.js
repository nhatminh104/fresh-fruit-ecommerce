export function errorHandler(err, req, res, next) {
  let status = err.status || 500;
  let message = err.message || 'Internal server error';
  if (err.name === 'CastError') { status = 400; message = `Invalid ${err.path || 'resource'} value`; }
  if (err.name === 'ValidationError') { status = 400; message = Object.values(err.errors).map((item) => item.message).join(', '); }
  if (err.code === 11000) { status = 409; message = 'A record with the same unique value already exists'; }
  if (status >= 500) console.error(err);
  res.status(status).json({ success: false, message });
}
