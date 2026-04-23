const express = require('express');
const router = express.Router();
const db = require('../db');
const { autenticarToken, verificarRolAdmin } = require('../middlewares/auth');

// GET productos (todos los roles)
router.get('/', autenticarToken, (req, res) => {
  db.query('SELECT * FROM productos', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// POST producto (solo admin)
router.post('/', autenticarToken, verificarRolAdmin, (req, res) => {
  const { nombre, precio, stock } = req.body;
  if (!nombre || precio <= 0 || stock < 0) {
    return res.status(400).json({ error: 'Datos inválidos' });
  }
  db.query('INSERT INTO productos (nombre, precio, stock) VALUES (?, ?, ?)',
    [nombre, precio, stock],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ id: result.insertId, nombre, precio, stock });
    });
});

// PUT producto (solo admin)
router.put('/:id', autenticarToken, verificarRolAdmin, (req, res) => {
  const { id } = req.params;
  const { nombre, precio, stock } = req.body;
  db.query('UPDATE productos SET nombre=?, precio=?, stock=? WHERE id=?',
    [nombre, precio, stock, id],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ id, nombre, precio, stock });
    });
});

// DELETE producto (solo admin)
router.delete('/:id', autenticarToken, verificarRolAdmin, (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM productos WHERE id=?', [id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ mensaje: `Producto ${id} eliminado` });
  });
});

module.exports = router;
