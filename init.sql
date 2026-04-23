USE ferreteria;

CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100),
  precio DECIMAL(10,2),
  stock INT
);

INSERT INTO productos (nombre, precio, stock) VALUES
('Martillo', 120.50, 10),
('Clavos', 15.00, 200),
('Taladro', 950.00, 5),
('Destornillador', 45.00, 50),
('Sierra', 300.00, 8);
