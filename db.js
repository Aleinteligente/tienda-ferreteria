const mysql = require('mysql2');

function connectWithRetry() {
  const db = mysql.createConnection({
    host: 'db',
    user: 'root',
    password: 'uiop00',
    database: 'ferreteria'
  });

  db.connect(err => {
    if (err) {
      console.error('Error conectando a MySQL, reintentando en 5s...', err.message);
      setTimeout(connectWithRetry, 5000);
    } else {
      console.log('Conectado a MySQL');
    }
  });

  return db;
}

module.exports = connectWithRetry();
