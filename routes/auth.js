const express = require('express');
const jwt = require('jsonwebtoken');
const { generateTokens } = require('../middlewares/auth');
const { REFRESH_SECRET } = require('../config');

const router = express.Router();

// Login
router.post('/login', (req, res) => {
  const { usuario, password } = req.body;

  if (usuario === 'admin' && password === '1234') {
    const tokens = generateTokens({ id: 1, role: 'admin' });
    return res.json(tokens);
  }

  res.status(401).json({ error: true, message: 'Credenciales inválidas' });
});

// Refresh
router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: true, message: 'Falta refresh token' });

  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET);
    const tokens = generateTokens({ id: payload.id, role: 'admin' });
    res.json(tokens);
  } catch (err) {
    res.status(403).json({ error: true, message: 'Refresh token inválido o expirado' });
  }
});

module.exports = router;
