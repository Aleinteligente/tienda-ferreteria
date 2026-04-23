// middlewares/errorHandler.js

// Manejo de errores 404 (ruta no encontrada)
function notFoundHandler(req, res, next) {
  res.status(404).json({
    error: true,
    message: 'Ruta no encontrada'
  });
}

// Manejo centralizado de errores
function errorHandler(err, req, res, next) {
  console.error('Error capturado:', err);

  // Si el error tiene un código de estado, úsalo; si no, 500
  const status = err.status || 500;

  res.status(status).json({
    error: true,
    message: err.message || 'Error interno del servidor'
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};
