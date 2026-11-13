import { hoyUTC, sumarDias } from "@/lib/format";
import { prisma } from "@/lib/prisma";

/* =====================================================================
 * Consultas del trabajo práctico (pantalla /consultas).
 * Cada una se acompaña de la sentencia SQL equivalente que se muestra en la
 * interfaz. Las consultas 1, 2 y 5 usan la API de Prisma; la 3 y la 4, SQL
 * nativo con prisma.$queryRaw (parámetros preparados).
 * ===================================================================== */

/* ---------------------------------------------------------------------
 * Consulta 1: propiedades disponibles por zona
 * ------------------------------------------------------------------- */

export const SQL_DISPONIBLES = `
SELECT p.direccion, t.descripcion AS tipo, z.nombre AS zona, l.descripcion AS localidad,
       p.ambientes, p.superficie, p.precio_alquiler
FROM propiedad p
JOIN tipo t      ON t.id = p.id_tipo
JOIN zona z      ON z.id = p.id_zona
JOIN localidad l ON l.id = z.id_localidad
WHERE p.estado = 'Disponible'
  AND p.id_zona = $1            -- solo si se elige una zona
ORDER BY z.nombre, p.precio_alquiler;`;

export function propiedadesDisponibles(zona?: number) {
  return prisma.propiedad.findMany({
    where: { estado: "Disponible", idZona: zona },
    include: { tipo: true, zona: { include: { localidad: true } } },
    orderBy: [{ zona: { nombre: "asc" } }, { precioAlquiler: "asc" }],
  });
}

/* ---------------------------------------------------------------------
 * Consulta 2: contratos vigentes que vencen en los próximos N días
 * ------------------------------------------------------------------- */

export const SQL_POR_VENCER = `
SELECT c.id, p.direccion, i.apellido, i.nombre, i.telefono, c.fecha_fin, c.mensualidad
FROM contrato c
JOIN propiedad p ON p.id = c.id_propiedad
JOIN inquilino i ON i.id = c.id_inquilino
WHERE c.estado = 'Vigente'
  AND c.fecha_fin BETWEEN CURRENT_DATE AND CURRENT_DATE + $1   -- $1 = días
ORDER BY c.fecha_fin;`;

export function contratosPorVencer(dias: number) {
  const hoy = hoyUTC();
  const limite = sumarDias(hoy, dias);
  return prisma.contrato.findMany({
    where: { estado: "Vigente", fechaFin: { gte: hoy, lte: limite } },
    include: { propiedad: true, inquilino: true },
    orderBy: { fechaFin: "asc" },
  });
}

/* ---------------------------------------------------------------------
 * Consulta 3: resumen de propiedades por zona (GROUP BY)
 * ------------------------------------------------------------------- */

export const SQL_RESUMEN_ZONA = `
SELECT z.nombre AS zona, l.descripcion AS localidad,
       COUNT(p.id)                                        AS total,
       COUNT(p.id) FILTER (WHERE p.estado = 'Disponible') AS disponibles,
       COUNT(p.id) FILTER (WHERE p.estado = 'Alquilada')  AS alquiladas,
       AVG(p.precio_alquiler)                             AS precio_promedio
FROM zona z
JOIN localidad l      ON l.id = z.id_localidad
LEFT JOIN propiedad p ON p.id_zona = z.id
GROUP BY z.id, z.nombre, l.descripcion
ORDER BY l.descripcion, z.nombre;`;

export type ResumenZona = {
  id: number;
  zona: string;
  localidad: string;
  total: number;
  disponibles: number;
  alquiladas: number;
  precio_promedio: number | null;
};

export function resumenPorZona() {
  return prisma.$queryRaw<ResumenZona[]>`
      SELECT z.id, z.nombre AS zona, l.descripcion AS localidad,
             COUNT(p.id)::int AS total,
             (COUNT(p.id) FILTER (WHERE p.estado = 'Disponible'))::int AS disponibles,
             (COUNT(p.id) FILTER (WHERE p.estado = 'Alquilada'))::int AS alquiladas,
             AVG(p.precio_alquiler)::float8 AS precio_promedio
      FROM zona z
      JOIN localidad l ON l.id = z.id_localidad
      LEFT JOIN propiedad p ON p.id_zona = z.id
      GROUP BY z.id, z.nombre, l.descripcion
      ORDER BY l.descripcion, z.nombre`;
}

/* ---------------------------------------------------------------------
 * Consulta 4: ingreso mensual por propietario (JOIN + SUM)
 * ------------------------------------------------------------------- */

export const SQL_INGRESOS = `
SELECT pr.apellido, pr.nombre,
       COUNT(c.id)        AS contratos_vigentes,
       SUM(c.mensualidad) AS ingreso_mensual
FROM propietario pr
JOIN propiedad p ON p.id_propietario = pr.id
JOIN contrato c  ON c.id_propiedad = p.id
WHERE c.estado = 'Vigente'
GROUP BY pr.id, pr.apellido, pr.nombre
ORDER BY ingreso_mensual DESC;`;

export type IngresoPropietario = {
  id: number;
  apellido: string;
  nombre: string;
  contratos_vigentes: number;
  ingreso_mensual: number;
};

export function ingresosPorPropietario() {
  return prisma.$queryRaw<IngresoPropietario[]>`
      SELECT pr.id, pr.apellido, pr.nombre,
             COUNT(c.id)::int AS contratos_vigentes,
             SUM(c.mensualidad)::float8 AS ingreso_mensual
      FROM propietario pr
      JOIN propiedad p ON p.id_propietario = pr.id
      JOIN contrato c ON c.id_propiedad = p.id
      WHERE c.estado = 'Vigente'
      GROUP BY pr.id, pr.apellido, pr.nombre
      ORDER BY ingreso_mensual DESC`;
}

/* ---------------------------------------------------------------------
 * Consulta 5: contratos vigentes cuya fecha de fin ya pasó
 * ------------------------------------------------------------------- */

export const SQL_VENCIDOS = `
SELECT c.id, p.direccion, i.apellido, i.nombre, c.fecha_fin,
       CURRENT_DATE - c.fecha_fin AS dias_vencido
FROM contrato c
JOIN propiedad p ON p.id = c.id_propiedad
JOIN inquilino i ON i.id = c.id_inquilino
WHERE c.estado = 'Vigente'
  AND c.fecha_fin < CURRENT_DATE
ORDER BY c.fecha_fin;`;

export function contratosVencidos() {
  return prisma.contrato.findMany({
    where: { estado: "Vigente", fechaFin: { lt: hoyUTC() } },
    include: { propiedad: true, inquilino: true },
    orderBy: { fechaFin: "asc" },
  });
}

export type PropiedadDisponibleConsulta = Awaited<
  ReturnType<typeof propiedadesDisponibles>
>[number];
/** Contrato con su propiedad e inquilino (consultas 2 y 5). */
export type ContratoConPartes = Awaited<ReturnType<typeof contratosPorVencer>>[number];
