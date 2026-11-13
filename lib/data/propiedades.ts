import { listarLocalidadesConZonas, listarTipos } from "@/lib/data/catalogos";
import { listarPropietarios } from "@/lib/data/personas";
import { prisma } from "@/lib/prisma";

/* Lecturas de Propiedad. */

export type BusquedaPropiedades = {
  q?: string;
  zona?: number;
  tipo?: number;
  propietario?: number;
  estado?: string;
};

/** Listado de propiedades con los filtros de búsqueda de la pantalla Propiedades. */
export function buscarPropiedades({ q, zona, tipo, propietario, estado }: BusquedaPropiedades) {
  return prisma.propiedad.findMany({
    where: {
      direccion: q ? { contains: q, mode: "insensitive" } : undefined,
      idZona: zona,
      idTipo: tipo,
      idPropietario: propietario,
      estado,
    },
    include: { propietario: true, tipo: true, zona: { include: { localidad: true } } },
    orderBy: [{ estado: "asc" }, { direccion: "asc" }],
  });
}

/** Ficha de una propiedad con su historial de contratos (el más reciente primero). */
export function obtenerPropiedad(id: number) {
  return prisma.propiedad.findUnique({
    where: { id },
    include: {
      propietario: true,
      tipo: true,
      zona: { include: { localidad: true } },
      contratos: { include: { inquilino: true }, orderBy: { fechaInicio: "desc" } },
    },
  });
}

/** Propiedades que se pueden alquilar (para el alta de contratos). */
export function listarPropiedadesDisponibles() {
  return prisma.propiedad.findMany({
    where: { estado: "Disponible" },
    include: { zona: { include: { localidad: true } }, tipo: true },
    orderBy: [{ zona: { nombre: "asc" } }, { direccion: "asc" }],
  });
}

/** Opciones de los selects del formulario de propiedad. */
export async function opcionesPropiedad() {
  const [propietarios, tipos, localidades] = await Promise.all([
    listarPropietarios(),
    listarTipos(),
    listarLocalidadesConZonas(),
  ]);
  return { propietarios, tipos, localidades };
}

export type PropiedadListado = Awaited<ReturnType<typeof buscarPropiedades>>[number];
export type PropiedadDetalle = NonNullable<Awaited<ReturnType<typeof obtenerPropiedad>>>;
export type PropiedadDisponible = Awaited<ReturnType<typeof listarPropiedadesDisponibles>>[number];
export type OpcionesPropiedad = Awaited<ReturnType<typeof opcionesPropiedad>>;
