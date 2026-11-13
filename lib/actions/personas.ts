"use server";

import { ejecutar } from "@/lib/actions/ejecutar";
import { prisma } from "@/lib/prisma";
import { datosPersona, id, idOpcional } from "@/lib/validacion";

/* Personas: Propietario e Inquilino. */

export async function guardarPropietario(form: FormData) {
  const idEditar = idOpcional(form);
  await ejecutar(
    () => {
      const data = datosPersona(form);
      return idEditar
        ? prisma.propietario.update({ where: { id: idEditar }, data })
        : prisma.propietario.create({ data });
    },
    {
      exito: idEditar ? "Propietario actualizado." : "Propietario creado.",
      destino: "/propietarios",
      siFalla: idEditar
        ? `/propietarios?editar=${idEditar}#formulario`
        : "/propietarios#formulario",
    },
  );
}

export async function eliminarPropietario(form: FormData) {
  await ejecutar(() => prisma.propietario.delete({ where: { id: id(form) } }), {
    exito: "Propietario eliminado.",
    destino: "/propietarios",
    siFalla: "/propietarios",
    enUso: "No se puede eliminar el propietario porque tiene propiedades a su nombre.",
  });
}

export async function guardarInquilino(form: FormData) {
  const idEditar = idOpcional(form);
  await ejecutar(
    () => {
      const data = datosPersona(form);
      return idEditar
        ? prisma.inquilino.update({ where: { id: idEditar }, data })
        : prisma.inquilino.create({ data });
    },
    {
      exito: idEditar ? "Inquilino actualizado." : "Inquilino creado.",
      destino: "/inquilinos",
      siFalla: idEditar ? `/inquilinos?editar=${idEditar}#formulario` : "/inquilinos#formulario",
    },
  );
}

export async function eliminarInquilino(form: FormData) {
  await ejecutar(() => prisma.inquilino.delete({ where: { id: id(form) } }), {
    exito: "Inquilino eliminado.",
    destino: "/inquilinos",
    siFalla: "/inquilinos",
    enUso: "No se puede eliminar el inquilino porque tiene contratos registrados.",
  });
}
