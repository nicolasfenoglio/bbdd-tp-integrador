-- Datos de ejemplo. Borra todo y vuelve a cargar.
-- Las fechas de contratos son relativas a CURRENT_DATE para que siempre haya "contratos por vencer".

TRUNCATE contrato, propiedad, zona, localidad, tipo, inquilino, propietario RESTART IDENTITY CASCADE;

INSERT INTO localidad (descripcion) VALUES
  ('San Francisco'),
  ('Frontera'),
  ('Córdoba');

INSERT INTO zona (nombre, id_localidad, descripcion) VALUES
  ('Centro',          1, 'Microcentro y alrededores de la plaza'),
  ('Barrio Iturraspe', 1, 'Zona residencial al sur'),
  ('Barrio Catedral', 1, 'Zona residencial al norte'),
  ('Centro',          2, 'Centro de Frontera'),
  ('Nueva Córdoba',   3, 'Zona universitaria');

INSERT INTO tipo (descripcion) VALUES
  ('Departamento'),
  ('Casa'),
  ('Local comercial'),
  ('Oficina');

INSERT INTO propietario (nombre, apellido, documento, telefono, email) VALUES
  ('Laura',   'Gómez',     '20111222', '3564-401122', 'laura.gomez@mail.com'),
  ('Carlos',  'Fernández', '18333444', '3564-405566', 'cfernandez@mail.com'),
  ('Marta',   'Rossi',     '25555666', '3564-409988', NULL),
  ('Jorge',   'Bianchi',   '17777888', NULL,          'jbianchi@mail.com');

INSERT INTO inquilino (nombre, apellido, documento, telefono, email) VALUES
  ('Sofía',    'Martínez', '40111222', '3564-501122', 'sofi.martinez@mail.com'),
  ('Tomás',    'López',    '38222333', '3564-503344', 'tlopez@mail.com'),
  ('Valentina','Pérez',    '42333444', '3564-505566', NULL),
  ('Lucas',    'García',   '39444555', '3564-507788', 'lucas.garcia@mail.com'),
  ('Camila',   'Sosa',     '41555666', NULL,          'camisosa@mail.com'),
  ('Martín',   'Romero',   '36666777', '3564-509900', NULL);

INSERT INTO propiedad (direccion, superficie, ambientes, precio_alquiler, estado, id_propietario, id_tipo, id_zona) VALUES
  ('Bv. 25 de Mayo 1450, 3°B',  55.00, 2, 280000.00, 'Alquilada',     1, 1, 1),
  ('Iturraspe 2210',           120.00, 4, 450000.00, 'Disponible',    1, 2, 2),
  ('Belgrano 845',              80.00, 1, 600000.00, 'Alquilada',     2, 3, 1),
  ('Pellegrini 1320, PB',       42.50, 1, 210000.00, 'Disponible',    2, 1, 1),
  ('Av. Libertador 3150',      150.00, 5, 520000.00, 'Alquilada',     3, 2, 3),
  ('Salta 670, 2°A',            60.00, 2, 300000.00, 'Disponible',    3, 1, 3),
  ('San Martín 120',            95.00, 3, 380000.00, 'Disponible',    4, 2, 4),
  ('Obispo Trejo 900, 5°C',     38.00, 1, 350000.00, 'Alquilada',     4, 1, 5),
  ('Bv. Illia 450, 8°D',        48.00, 2, 400000.00, 'Disponible',    4, 1, 5),
  ('Mitre 210, Of. 3',          35.00, 1, 250000.00, 'No disponible', 2, 4, 1);

INSERT INTO contrato (fecha_inicio, fecha_fin, mensualidad, deposito, estado, id_propiedad, id_inquilino) VALUES
  (CURRENT_DATE - 700, CURRENT_DATE + 20,  280000.00, 280000.00, 'Vigente',    1, 1),
  (CURRENT_DATE - 300, CURRENT_DATE + 430, 600000.00, 600000.00, 'Vigente',    3, 2),
  (CURRENT_DATE - 690, CURRENT_DATE + 45,  520000.00, 520000.00, 'Vigente',    5, 3),
  (CURRENT_DATE - 650, CURRENT_DATE + 80,  350000.00, 350000.00, 'Vigente',    8, 4),
  (CURRENT_DATE - 1100, CURRENT_DATE - 370, 180000.00, 180000.00, 'Finalizado', 2, 5),
  (CURRENT_DATE - 500, CURRENT_DATE - 200, 190000.00, 190000.00, 'Rescindido', 4, 6);
