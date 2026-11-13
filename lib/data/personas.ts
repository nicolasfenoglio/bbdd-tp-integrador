import { prisma } from "@/lib/prisma";

/* Lecturas de Propietario e Inquilino. */

/** Filtro de búsqueda por nombre, apellido, documento o email (sirve para ambas tablas). */
function filtroPersona(q?: string) {
  if (!q) return undefined;
  const contiene = { contains: q, mode: "insensitive" as const };
  return {
    OR: [
      { nombre: contiene },
      { apellido: contiene },
      { documento: contiene },
      { email: contiene },
    ],
  };
}

export function listarPropietarios() {
  return prisma.propietario.findMany({ orderBy: [{ apellido: "asc" }, { nombre: "asc" }] });
}

export function listarInquilinos() {
  return prisma.inquilino.findMany({ orderBy: [{ apellido: "asc" }, { nombre: "asc" }] });
}

export function obtenerPropietario(id: number) {
  return prisma.propietario.findUnique({ where: { id } });
}

export function obtenerInquilino(id: number) {
  return prisma.inquilino.findUnique({ where: { id } });
}

/** Propietarios que coinciden con la búsqueda, con el estado de sus propiedades. */
export function buscarPropietarios(q?: string) {
  return prisma.propietario.findMany({
    where: filtroPersona(q),
    orderBy: [{ apellido: "asc" }, { nombre: "asc" }],
    include: { propiedades: { select: { estado: true } } },
  });
}

/** Inquilinos que coinciden con la búsqueda, con sus contratos (el más reciente primero). */
export function buscarInquilinos(q?: string) {
  return prisma.inquilino.findMany({
    where: filtroPersona(q),
    orderBy: [{ apellido: "asc" }, { nombre: "asc" }],
    include: {
      contratos: {
        select: { estado: true, propiedad: { select: { direccion: true } } },
        orderBy: { fechaInicio: "desc" },
      },
    },
  });
}

export type Propietario = Awaited<ReturnType<typeof listarPropietarios>>[number];
export type Inquilino = Awaited<ReturnType<typeof listarInquilinos>>[number];
