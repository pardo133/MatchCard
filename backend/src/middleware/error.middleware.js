export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  console.error(`[ERROR] ${err.message}`);
  res.status(status).json({ message: err.message || 'Error interno del servidor' });
}
