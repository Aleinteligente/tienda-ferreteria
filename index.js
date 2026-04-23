const express = require('express');
const jwt = require('jsonwebtoken');
const { swaggerUi, swaggerSpec } = require('./swagger');
const productosRouter = require('./routes/productos');
const { SECRET_KEY } = require('./middlewares/auth');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

const authRouter = require('./routes/auth');
app.use('/auth', authRouter);

// rate limitng max 100 request cada 15 min por ip
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const app = express();
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: { error: true, message: 'Demasiadas peticiones, intenta más tarde' }
});

app.use(limiter);

// CORS (solo permite tu frontend local)
app.use(cors({ origin: 'http://localhost:3000' }));



// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rutas de productos (CRUD modularizado)
app.use('/productos', productosRouter);

// Middleware para rutas no encontradas
app.use(notFoundHandler);

// Middleware centralizado de errores
app.use(errorHandler);

// Middleware de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Clave secreta para JWT


// Middleware de autenticación
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


// Ruta de login
app.post('/login', (req, res) => {
  const { usuario, password } = req.body;

  // Validación simple (puedes reemplazar con DB más adelante)
  if (usuario === 'admin' && password === '1234') {
    const token = jwt.sign({ usuario, rol: 'admin' }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } else if (usuario === 'cliente' && password === '1234') {
    const token = jwt.sign({ usuario, rol: 'usuario' }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Credenciales inválidas' });
  }
});

//CRUD de productos protegido
app.get('/productos', autenticarToken, (req, res) => {
  db.query('SELECT * FROM productos', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

app.post('/productos', autenticarToken, verificarRolAdmin, (req, res) => {
  const { nombre, precio, stock } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });

  db.query('INSERT INTO productos (nombre, precio, stock) VALUES (?, ?, ?)',
    [nombre, precio, stock],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ id: result.insertId, nombre, precio, stock });
    });
});

app.put('/productos/:id', autenticarToken, verificarRolAdmin, (req, res) => {
  const { id } = req.params;
  const { nombre, precio, stock } = req.body;

  db.query('UPDATE productos SET nombre=?, precio=?, stock=? WHERE id=?',
    [nombre, precio, stock, id],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ id, nombre, precio, stock });
    });
});

// Endpoint: listar productos
app.get('/productos', (req, res) => {
  db.query('SELECT * FROM productos', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Endpoint: agregar producto
app.post('/productos',  autenticarToken, verificarRolAdmin, (req, res) => {
  const { nombre, precio, stock } = req.body;

  // Validaciones
  if (!nombre || nombre.trim() === '') {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }
  if (precio == null || precio < 0) {
    return res.status(400).json({ error: 'El precio debe ser positivo' });
  }
  if (stock == null || stock < 0) {
    return res.status(400).json({ error: 'El stock debe ser positivo' });
  }

  if (!nombre || precio == null || stock == null) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }
  if (precio < 0 || stock < 0) {
    return res.status(400).json({ error: 'Precio y stock deben ser positivos' });
  }

  db.query('INSERT INTO productos (nombre, precio, stock) VALUES (?, ?, ?)',
    [nombre, precio, stock],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: 'Producto agregado correctamente', id: result.insertId });
    }
  );
});

// 🔹 PUT: actualizar producto
app.put('/productos/:id',  autenticarToken, verificarRolAdmin, (req, res) => {
  const { id } = req.params;
  const { nombre, precio, stock } = req.body;
  db.query(
    'UPDATE productos SET nombre = ?, precio = ?, stock = ? WHERE id = ?',
    [nombre, precio, stock, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      res.json({ message: 'Producto actualizado correctamente' });
    }
  );
});

// 🔹 DELETE: eliminar producto
app.delete('/productos/:id',  autenticarToken, verificarRolAdmin, (req, res) => {
  const { id } = req.params;
  db.query(
    'DELETE FROM productos WHERE id = ?',
    [id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: 'Producto eliminado correctamente' });
    }
  );
});
//Servidor
app.listen(5000, () => {
  console.log('API Ferretería corriendo en puerto 5000');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});


/**
 * @swagger
 * /productos:
 *   get:
 *     summary: Obtiene todos los productos
 *     responses:
 *       200:
 *         description: Lista de productos
 */


/**
 * @swagger
 * /productos:
 *   post:
 *     summary: Crea un nuevo producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               precio:
 *                 type: number
 *               stock:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Producto creado correctamente
 */


/**
 * @swagger
 * /productos/{id}:
 *   put:
 *     summary: Actualiza un producto existente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               precio:
 *                 type: number
 *               stock:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Producto actualizado correctamente
 *       404:
 *         description: Producto no encontrado
 */


/**
 * @swagger
 * /productos/{id}:
 *   delete:
 *     summary: Elimina un producto por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto eliminado correctamente
 *       404:
 *         description: Producto no encontrado
 */

