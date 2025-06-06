CREATE DATABASE IF NOT EXISTS db_productos;
USE db_productos;

/* TABLA DE BODEGA */
CREATE TABLE IF NOT EXISTS Bodegas(
    id_bodega INT AUTO_INCREMENT PRIMARY KEY,
    nombre_bodega VARCHAR(100) NOT NULL
);

/* TABLA DE MONEDAS */
CREATE TABLE IF NOT EXISTS Monedas(
    id_moneda INT AUTO_INCREMENT PRIMARY KEY,
    nombre_moneda VARCHAR(50) NOT NULL
);

/* TABLA DE MATERIALES */
CREATE TABLE IF NOT EXISTS Materiales(
    id_material INT AUTO_INCREMENT PRIMARY KEY,
    nombre_material VARCHAR(100) NOT NULL UNIQUE
);

/* TABLA DE SUCURSALES */
CREATE TABLE IF NOT EXISTS Sucursales(
    id_sucursal INT AUTO_INCREMENT PRIMARY KEY,
    id_bodega INT NOT NULL,
    nombre_sucursal VARCHAR(100) NOT NULL,
    FOREIGN KEY(id_bodega) REFERENCES Bodegas(id_bodega) ON DELETE CASCADE
);

/* TABLA DE PRODUCTOS */
CREATE TABLE IF NOT EXISTS Productos(
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(15) NOT NULL UNIQUE,
    nombre_producto VARCHAR(50) NOT NULL,
    id_bodega INT NOT NULL,
    id_sucursal INT NOT NULL,
    id_moneda INT NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    descripcion TEXT NOT NULL,
    FOREIGN KEY(id_bodega) REFERENCES Bodegas(id_bodega) ON DELETE CASCADE,
    FOREIGN KEY(id_sucursal) REFERENCES Sucursales(id_sucursal) ON DELETE CASCADE,
    FOREIGN KEY(id_moneda) REFERENCES Monedas(id_moneda) ON DELETE CASCADE
);

/* TABLA PRODUCTOS-MATERIALES */
CREATE TABLE IF NOT EXISTS ProductoMaterial(
    id_producto INT NOT NULL,
    id_material INT NOT NULL,
    PRIMARY KEY(id_producto, id_material),
    FOREIGN KEY(id_producto) REFERENCES Productos(id_producto) ON DELETE CASCADE,
    FOREIGN KEY(id_material) REFERENCES Materiales(id_material) ON DELETE RESTRICT
);

/* INGRESO DE INFORMACION */
INSERT INTO Materiales(nombre_material)VALUES
('Plastico'), ('Metal'), ('Madera'), ('Vidrio'), ('Textil');

INSERT INTO Monedas(nombre_moneda)VALUES
('Dólar'),('Euro'),('Peso');

INSERT INTO Bodegas(nombre_bodega)VALUES
('Bodega Central'),('Bodega Norte'),('Bodega Sur');

INSERT INTO Sucursales(id_bodega, nombre_sucursal)VALUES
(1, 'Sucursal 1'),(2, 'Sucursal 2'),(3, 'Sucursal 3');