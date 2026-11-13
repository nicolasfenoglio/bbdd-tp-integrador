import { prisma } from "@/lib/prisma";

/* Lecturas de Contrato. */

export type BusquedaContratos = {
  q?: string;
  estado?: string;
  inquilino?: number;
};

/** Listado de contratos con los filtros de búsqueda de la pantalla Contratos. */
export function buscarContratos({ q, estado, inquilino }: BusquedaContratos) {
  const contiene = q ? { contains: q, mode: "insensitive" as const } : undefined;
  return prisma.contrato.findMany({
    where: {
      estado,
      idInquilino: inquilino,
      ...(contiene && {
        OR: [
          { propiedad: { direccion: contiene } },
          { inquilino: { apellido: contiene } },
          { inquilino: { nombre: contiene } },
        ],
      }),
    },
    include: { propiedad: { include: { zona: true } }, inquilino: true },
    orderBy: [{ estado: "desc" }, { fechaFin: "asc" }],
  });
}

/** Ficha de un contrato con la propiedad (y su propietario) y el inquilino. */
export function obtenerContrato(id: number) {
  return prisma.contrato.findUnique({
    where: { id },
    include: {
      inquilino: true,
      propiedad: {
        include: { propietario: true, tipo: true, zona: { include: { localidad: true } } },
      },
    },
  });
}

export type ContratoListado = Awaited<ReturnType<typeof buscarContratos>>[number];
export type ContratoDetalle = NonNullable<Awaited<ReturnType<typeof obtenerContrato>>>;
