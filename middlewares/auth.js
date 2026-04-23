const jwt = require('jsonwebtoken');
const SECRET_KEY = 'clave_secreta';

function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requerido' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
}

function verificarRolAdmin(req, res, next) {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'No tienes permisos de administrador' });
  }
  next();
}

module.exports = { autenticarToken, verificarRolAdmin, SECRET_KEY };

function generateTokens(user) {
  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    SECRET_KEY,
    { expiresIn: '1h' }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
}1~function generateTokens(user) {
  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    SECRET_KEY,
    { expiresIn: '1h' }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
}
