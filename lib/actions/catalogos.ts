"use server";

import { ejecutar } from "@/lib/actions/ejecutar";
import { prisma } from "@/lib/prisma";
import { ErrorValidacion, id, idOpcional, obligatorio, texto } from "@/lib/validacion";

/* Catálogos: Localidad, Zona y Tipo. */

export async function guardarLocalidad(form: FormData) {
  const idEditar = idOpcional(form);
  await ejecutar(
    async () => {
      const descripcion = obligatorio(form, "descripcion", "Nombre de la localidad");
      const repetida = await prisma.localidad.findFirst({
        where: {
          descripcion: { equals: descripcion, mode: "insensitive" },
          NOT: { id: idEditar ?? 0 },
        },
      });
      if (repetida) throw new ErrorValidacion(`La localidad "${descripcion}" ya existe.`);
      return idEditar
        ? prisma.localidad.update({ where: { id: idEditar }, data: { descripcion } })
        : prisma.localidad.create({ data: { descripcion } });
    },
    {
      exito: idEditar ? "Localidad actualizada." : "Localidad creada.",
      destino: "/catalogos/localidades",
      siFalla: idEditar ? `/catalogos/localidades?editar=${idEditar}` : "/catalogos/localidades",
    },
  );
}

export async function eliminarLocalidad(form: FormData) {
  await ejecutar(() => prisma.localidad.delete({ where: { id: id(form) } }), {
    exito: "Localidad eliminada.",
    destino: "/catalogos/localidades",
    siFalla: "/catalogos/localidades",
    enUso: "No se puede eliminar la localidad porque tiene zonas asociadas.",
  });
}

export async function guardarZona(form: FormData) {
  const idEditar = idOpcional(form);
  await ejecutar(
    async () => {
      const nombre = obligatorio(form, "nombre", "Nombre de la zona");
      const idLocalidad = id(form, "idLocalidad", "Localidad");
      const repetida = await prisma.zona.findFirst({
        where: {
          nombre: { equals: nombre, mode: "insensitive" },
          idLocalidad,
          NOT: { id: idEditar ?? 0 },
        },
      });
      if (repetida) throw new ErrorValidacion(`Ya existe la zona "${nombre}" en esa localidad.`);
      const data = { nombre, idLocalidad, descripcion: texto(form, "descripcion") };
      return idEditar
        ? prisma.zona.update({ where: { id: idEditar }, data })
        : prisma.zona.create({ data });
    },
    {
      exito: idEditar ? "Zona actualizada." : "Zona creada.",
      destino: "/catalogos/zonas",
      siFalla: idEditar ? `/catalogos/zonas?editar=${idEditar}` : "/catalogos/zonas",
    },
  );
}

export async function eliminarZona(form: FormData) {
  await ejecutar(() => prisma.zona.delete({ where: { id: id(form) } }), {
    exito: "Zona eliminada.",
    destino: "/catalogos/zonas",
    siFalla: "/catalogos/zonas",
    enUso: "No se puede eliminar la zona porque tiene propiedades asociadas.",
  });
}

export async function guardarTipo(form: FormData) {
  const idEditar = idOpcional(form);
  await ejecutar(
    async () => {
      const descripcion = obligatorio(form, "descripcion", "Descripción");
      const repetido = await prisma.tipo.findFirst({
        where: {
          descripcion: { equals: descripcion, mode: "insensitive" },
          NOT: { id: idEditar ?? 0 },
        },
      });
      if (repetido) throw new ErrorValidacion(`El tipo "${descripcion}" ya existe.`);
      return idEditar
        ? prisma.tipo.update({ where: { id: idEditar }, data: { descripcion } })
        : prisma.tipo.create({ data: { descripcion } });
    },
    {
      exito: idEditar ? "Tipo actualizado." : "Tipo creado.",
      destino: "/catalogos/tipos",
      siFalla: idEditar ? `/catalogos/tipos?editar=${idEditar}` : "/catalogos/tipos",
    },
  );
}

export async function eliminarTipo(form: FormData) {
  await ejecutar(() => prisma.tipo.delete({ where: { id: id(form) } }), {
    exito: "Tipo eliminado.",
    destino: "/catalogos/tipos",
    siFalla: "/catalogos/tipos",
    enUso: "No se puede eliminar el tipo porque hay propiedades que lo usan.",
  });
}
