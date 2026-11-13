import { prisma } from "@/lib/prisma";

/* Lecturas de los catálogos: Localidad, Zona y Tipo. */

/** Zonas con su localidad, para filtros y selects. */
export function listarZonas() {
  return prisma.zona.findMany({
    include: { localidad: true },
    orderBy: [{ localidad: { descripcion: "asc" } }, { nombre: "asc" }],
  });
}

export function listarTipos() {
  return prisma.tipo.findMany({ orderBy: { descripcion: "asc" } });
}

export function listarLocalidades() {
  return prisma.localidad.findMany({ orderBy: { descripcion: "asc" } });
}

/** Localidades con sus zonas, para el select agrupado del formulario de propiedad. */
export function listarLocalidadesConZonas() {
  return prisma.localidad.findMany({
    orderBy: { descripcion: "asc" },
    include: { zonas: { orderBy: { nombre: "asc" } } },
  });
}

/* Listados de las pantallas de ABM, con la cantidad de propiedades que usan cada registro. */

export function listarLocalidadesConUso() {
  return prisma.localidad.findMany({
    include: { zonas: { select: { _count: { select: { propiedades: true } } } } },
    orderBy: { descripcion: "asc" },
  });
}

export function listarZonasConUso() {
  return prisma.zona.findMany({
    include: { localidad: true, _count: { select: { propiedades: true } } },
    orderBy: [{ localidad: { descripcion: "asc" } }, { nombre: "asc" }],
  });
}

export function listarTiposConUso() {
  return prisma.tipo.findMany({
    include: { _count: { select: { propiedades: true } } },
    orderBy: { descripcion: "asc" },
  });
}

export type ZonaConLocalidad = Awaited<ReturnType<typeof listarZonas>>[number];
export type Tipo = Awaited<ReturnType<typeof listarTipos>>[number];
