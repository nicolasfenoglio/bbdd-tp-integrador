-- Datos de ejemplo. ATENCIÓN: borra todos los datos y vuelve a cargar.
-- Las fechas de los contratos son relativas a CURRENT_DATE para que siempre haya
-- contratos por vencer, vigentes, finalizados y uno vencido sin cerrar.
-- Regla de consistencia: cada propiedad 'Alquilada' tiene exactamente un contrato 'Vigente'.


TRUNCATE contrato, propiedad, zona, localidad, tipo, inquilino, propietario RESTART IDENTITY CASCADE;

-- ---------------------------------------------------------------- Localidades (4)
INSERT INTO localidad (descripcion) VALUES
  ('San Francisco'),   -- 1
  ('Frontera'),        -- 2
  ('Córdoba'),         -- 3
  ('Rafaela');         -- 4

-- ---------------------------------------------------------------- Zonas (9)
INSERT INTO zona (nombre, id_localidad, descripcion) VALUES
  ('Centro',              1, 'Microcentro y alrededores de la plaza Vélez Sarsfield'),  -- 1
  ('Barrio Iturraspe',    1, 'Zona residencial al sur, cerca del hospital'),            -- 2
  ('Barrio Catedral',     1, 'Zona residencial al norte'),                              -- 3
  ('Barrio Jardín',       1, 'Casas con patio, zona tranquila'),                        -- 4
  ('Centro',              2, 'Centro comercial de Frontera'),                           -- 5
  ('Nueva Córdoba',       3, 'Zona universitaria, alta demanda de departamentos'),      -- 6
  ('Güemes',              3, 'Barrio histórico con locales y ferias'),                  -- 7
  ('Cerro de las Rosas',  3, 'Zona residencial premium'),                               -- 8
  ('Centro',              4, 'Centro de Rafaela');                                      -- 9

-- ---------------------------------------------------------------- Tipos (6)
INSERT INTO tipo (descripcion) VALUES
  ('Departamento'),     -- 1
  ('Casa'),             -- 2
  ('Local comercial'),  -- 3
  ('Oficina'),          -- 4
  ('Dúplex'),           -- 5
  ('Cochera');          -- 6

-- ---------------------------------------------------------------- Propietarios (8)
INSERT INTO propietario (nombre, apellido, documento, telefono, email) VALUES
  ('Laura',     'Gómez',      '20111222', '3564-401122', 'laura.gomez@mail.com'),     -- 1
  ('Carlos',    'Fernández',  '18333444', '3564-405566', 'cfernandez@mail.com'),      -- 2
  ('Marta',     'Rossi',      '25555666', '3564-409988', NULL),                       -- 3
  ('Jorge',     'Bianchi',    '17777888', NULL,          'jbianchi@mail.com'),        -- 4
  ('Silvia',    'Moreno',     '22444555', '3564-412233', 'silvia.moreno@mail.com'),   -- 5
  ('Raúl',      'Castro',     '16888999', '351-4556677', 'rcastro@mail.com'),         -- 6
  ('Inversiones del Centro', 'S.A.', '30712345678', '351-4223344', 'admin@idcentro.com.ar'), -- 7
  ('Patricia',  'Giménez',    '23666777', '3492-445566', NULL);                       -- 8

-- ---------------------------------------------------------------- Inquilinos (12)
INSERT INTO inquilino (nombre, apellido, documento, telefono, email) VALUES
  ('Sofía',     'Martínez',  '40111222', '3564-501122', 'sofi.martinez@mail.com'),   -- 1
  ('Tomás',     'López',     '38222333', '3564-503344', 'tlopez@mail.com'),          -- 2
  ('Valentina', 'Pérez',     '42333444', '3564-505566', NULL),                       -- 3
  ('Lucas',     'García',    '39444555', '351-6507788', 'lucas.garcia@mail.com'),    -- 4
  ('Camila',    'Sosa',      '41555666', NULL,          'camisosa@mail.com'),        -- 5
  ('Martín',    'Romero',    '36666777', '3564-509900', NULL),                       -- 6
  ('Agustina',  'Díaz',      '37777888', '3564-511223', 'agus.diaz@mail.com'),       -- 7
  ('Federico',  'Ruiz',      '35888999', '3564-513344', 'fruiz@mail.com'),           -- 8
  ('Julieta',   'Álvarez',   '43999000', '351-6515566', 'juli.alvarez@mail.com'),    -- 9
  ('Diego',     'Torres',    '33123456', '351-4517788', 'dtorres@mail.com'),         -- 10
  ('Micaela',   'Benítez',   '44234567', '3492-519900', NULL),                       -- 11
  ('Nicolás',   'Acosta',    '34345678', '3564-521122', 'nacosta@mail.com');         -- 12

-- ---------------------------------------------------------------- Propiedades (24)
INSERT INTO propiedad (direccion, superficie, ambientes, precio_alquiler, estado, id_propietario, id_tipo, id_zona) VALUES
  ('Bv. 25 de Mayo 1450, 3°B',          55.00, 2,  280000.00, 'Alquilada',     1, 1, 1),  -- 1
  ('Iturraspe 2210',                   120.00, 4,  450000.00, 'Disponible',    1, 2, 2),  -- 2
  ('Belgrano 845',                      80.00, 1,  600000.00, 'Alquilada',     2, 3, 1),  -- 3
  ('Pellegrini 1320, PB',               42.50, 1,  210000.00, 'Disponible',    2, 1, 1),  -- 4
  ('Av. Libertador 3150',              150.00, 5,  520000.00, 'Alquilada',     3, 2, 3),  -- 5
  ('Salta 670, 2°A',                    60.00, 2,  300000.00, 'Disponible',    3, 1, 3),  -- 6
  ('San Martín 120',                    95.00, 3,  380000.00, 'Disponible',    4, 2, 5),  -- 7
  ('Obispo Trejo 900, 5°C',             38.00, 1,  350000.00, 'Alquilada',     4, 1, 6),  -- 8
  ('Bv. Illia 450, 8°D',                48.00, 2,  400000.00, 'Disponible',    4, 1, 6),  -- 9
  ('Mitre 210, Of. 3',                  35.00, 1,  250000.00, 'No disponible', 2, 4, 1),  -- 10
  ('Dante Alighieri 1780',             110.00, 3,  420000.00, 'Alquilada',     5, 5, 4),  -- 11
  ('Av. Rosario de Santa Fe 380, Cochera 12', 14.00, 1, 60000.00, 'Alquilada', 5, 6, 1), -- 12
  ('Belgrano 640, Local 2',             70.00, 1,  650000.00, 'Disponible',    6, 3, 7),  -- 13
  ('Fructuoso Rivera 220, 1°A',         52.00, 2,  380000.00, 'Alquilada',     6, 1, 7),  -- 14
  ('Av. Rafael Núñez 4500',            210.00, 6, 1200000.00, 'Alquilada',     7, 2, 8),  -- 15
  ('Av. Rafael Núñez 3900, Of. 5',      45.00, 1,  480000.00, 'Disponible',    7, 4, 8),  -- 16
  ('Bv. Santa Fe 520, 4°B',             65.00, 2,  320000.00, 'Alquilada',     8, 1, 9),  -- 17
  ('Sarmiento 280',                    130.00, 4,  470000.00, 'Disponible',    8, 2, 9),  -- 18
  ('Cabrera 1650',                     100.00, 3,  400000.00, 'Alquilada',     1, 5, 3),  -- 19
  ('Echeverría 980',                    85.00, 3,  360000.00, 'Disponible',    3, 2, 4),  -- 20
  ('Bv. 9 de Julio 2050, 6°A',          70.00, 3,  340000.00, 'Alquilada',     6, 1, 1),  -- 21
  ('Av. Argentina 1500',                90.00, 1,  300000.00, 'No disponible', 4, 3, 5),  -- 22
  ('Ituzaingó 1120, 2°C',               40.00, 1,  370000.00, 'Alquilada',     7, 1, 6),  -- 23
  ('Iturraspe 1980, Cochera 4',         13.00, 1,   55000.00, 'Disponible',    5, 6, 2);  -- 24

-- ---------------------------------------------------------------- Contratos (20)
-- Vigentes (12): uno por cada propiedad Alquilada.
INSERT INTO contrato (fecha_inicio, fecha_fin, mensualidad, deposito, estado, id_propiedad, id_inquilino) VALUES
  (CURRENT_DATE - 700, CURRENT_DATE + 20,  260000.00,  260000.00, 'Vigente',  1,  1),
  (CURRENT_DATE - 300, CURRENT_DATE + 430, 600000.00,  600000.00, 'Vigente',  3,  2),
  (CURRENT_DATE - 690, CURRENT_DATE + 45,  480000.00,  480000.00, 'Vigente',  5,  3),
  (CURRENT_DATE - 650, CURRENT_DATE + 80,  330000.00,  330000.00, 'Vigente',  8,  4),
  (CURRENT_DATE - 430, CURRENT_DATE + 300, 420000.00,  420000.00, 'Vigente', 11,  7),
  (CURRENT_DATE - 215, CURRENT_DATE + 150,  60000.00,   60000.00, 'Vigente', 12,  8),
  (CURRENT_DATE - 718, CURRENT_DATE + 12,  350000.00,  350000.00, 'Vigente', 14,  9),
  (CURRENT_DATE - 190, CURRENT_DATE + 540, 1200000.00, 2400000.00, 'Vigente', 15, 10),
  (CURRENT_DATE - 665, CURRENT_DATE + 65,  300000.00,  300000.00, 'Vigente', 17, 11),
  (CURRENT_DATE - 720, CURRENT_DATE - 5,   380000.00,  380000.00, 'Vigente', 19, 12),  -- vencido sin cerrar
  (CURRENT_DATE - 160, CURRENT_DATE + 200, 340000.00,  340000.00, 'Vigente', 21,  6),
  (CURRENT_DATE - 260, CURRENT_DATE + 100, 370000.00,  370000.00, 'Vigente', 23,  5);

-- Historial (8): contratos ya cerrados de propiedades que hoy están disponibles u ocupadas por otro inquilino.
INSERT INTO contrato (fecha_inicio, fecha_fin, mensualidad, deposito, estado, id_propiedad, id_inquilino) VALUES
  (CURRENT_DATE - 1100, CURRENT_DATE - 370,  180000.00, 180000.00, 'Finalizado',  2,  5),
  (CURRENT_DATE - 500,  CURRENT_DATE - 200,  190000.00, 190000.00, 'Rescindido',  4,  6),
  (CURRENT_DATE - 1450, CURRENT_DATE - 730,  150000.00, 150000.00, 'Finalizado',  1,  3),
  (CURRENT_DATE - 1090, CURRENT_DATE - 360,  210000.00, 210000.00, 'Finalizado',  6,  9),
  (CURRENT_DATE - 1100, CURRENT_DATE - 700,  400000.00, 400000.00, 'Rescindido', 13, 11),
  (CURRENT_DATE - 1400, CURRENT_DATE - 660,  250000.00, 250000.00, 'Finalizado',  9,  4),
  (CURRENT_DATE - 1500, CURRENT_DATE - 725,  220000.00, 220000.00, 'Finalizado',  7, 12),
  (CURRENT_DATE - 1500, CURRENT_DATE - 710,  700000.00, 700000.00, 'Finalizado', 15,  1);

