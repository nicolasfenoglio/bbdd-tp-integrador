"use server";

import { ejecutar } from "@/lib/actions/ejecutar";
import { hoyUTC, sumarMeses } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import {
  decimal,
  decimalOpcional,
  entero,
  ErrorValidacion,
  fecha,
  fechaOpcional,
  id,
  texto,
  validarRango,
} from "@/lib/validacion";

export async function crearContrato(form: FormData) {
  const idPropiedadForm = texto(form, "idPropiedad");
  await ejecutar(
    async () => {
      const idPropiedad = id(form, "idPropiedad", "Propiedad");
      const idInquilino = id(form, "idInquilino", "Inquilino");
      const fechaInicio = fecha(form, "fechaInicio", "Fecha de inicio");
      const fechaFin = fechaOpcional(form, "fechaFin", "Fecha de fin");
      validarRango(fechaInicio, fechaFin);

      // Alta del contrato + cambio de estado de la propiedad en una sola transacción.
      return prisma.$transaction(async (tx) => {
        const propiedad = await tx.propiedad.findUniqueOrThrow({ where: { id: idPropiedad } });
        if (propiedad.estado !== "Disponible")
          throw new ErrorValidacion("La propiedad seleccionada no está disponible.");

        const mensualidad =
          decimalOpcional(form, "mensualidad", "Mensualidad") ??
          propiedad.precioAlquiler.toFixed(2);
        const contrato = await tx.contrato.create({
          data: {
            idPropiedad,
            idInquilino,
            fechaInicio,
            fechaFin,
            mensualidad,
            deposito: decimalOpcional(form, "deposito", "Depósito") ?? mensualidad,
            estado: "Vigente",
          },
        });
        await tx.propiedad.update({ where: { id: idPropiedad }, data: { estado: "Alquilada" } });
        return contrato;
      });
    },
    {
      exito: "Contrato creado. La propiedad quedó como Alquilada.",
      destino: (c) => `/contratos/${c.id}`,
      siFalla: idPropiedadForm
        ? `/contratos/nuevo?propiedad=${idPropiedadForm}`
        : "/contratos/nuevo",
    },
  );
}

export async function actualizarContrato(form: FormData) {
  const idContrato = id(form);
  await ejecutar(
    () => {
      const fechaInicio = fecha(form, "fechaInicio", "Fecha de inicio");
      const fechaFin = fechaOpcional(form, "fechaFin", "Fecha de fin");
      validarRango(fechaInicio, fechaFin);
      return prisma.contrato.update({
        where: { id: idContrato },
        data: {
          fechaInicio,
          fechaFin,
          mensualidad: decimal(form, "mensualidad", "Mensualidad", { positivo: true }),
          deposito: decimal(form, "deposito", "Depósito"),
        },
      });
    },
    {
      exito: "Contrato actualizado.",
      destino: `/contratos/${idContrato}`,
      siFalla: `/contratos/${idContrato}`,
    },
  );
}

/** Finaliza o rescinde un contrato vigente y libera la propiedad. */
export async function cerrarContrato(form: FormData) {
  const idContrato = id(form);
  const estado = texto(form, "estado") === "Rescindido" ? "Rescindido" : "Finalizado";
  await ejecutar(
    () =>
      prisma.$transaction(async (tx) => {
        const contrato = await tx.contrato.findUniqueOrThrow({ where: { id: idContrato } });
        if (contrato.estado !== "Vigente")
          throw new ErrorValidacion("Solo se pueden cerrar contratos vigentes.");

        // Al rescindir (o finalizar sin fecha de fin) el contrato termina hoy.
        const hoy = hoyUTC();
        const fechaFin =
          !contrato.fechaFin || (estado === "Rescindido" && contrato.fechaFin > hoy)
            ? hoy
            : contrato.fechaFin;

        await tx.contrato.update({ where: { id: idContrato }, data: { estado, fechaFin } });
        await tx.propiedad.update({
          where: { id: contrato.idPropiedad },
          data: { estado: "Disponible" },
        });
      }),
    {
      exito: `Contrato ${estado.toLowerCase()}. La propiedad quedó Disponible.`,
      destino: `/contratos/${idContrato}`,
      siFalla: `/contratos/${idContrato}`,
    },
  );
}

/** Extiende la fecha de fin de un contrato vigente y, opcionalmente, actualiza la mensualidad. */
export async function renovarContrato(form: FormData) {
  const idContrato = id(form);
  await ejecutar(
    async () => {
      const meses = entero(form, "meses", "Meses", 1, 60);
      const nuevaMensualidad = decimalOpcional(form, "mensualidad", "Nueva mensualidad");
      const contrato = await prisma.contrato.findUniqueOrThrow({ where: { id: idContrato } });
      if (contrato.estado !== "Vigente")
        throw new ErrorValidacion("Solo se pueden renovar contratos vigentes.");

      const base = contrato.fechaFin && contrato.fechaFin > hoyUTC() ? contrato.fechaFin : hoyUTC();
      return prisma.contrato.update({
        where: { id: idContrato },
        data: {
          fechaFin: sumarMeses(base, meses),
          ...(nuevaMensualidad ? { mensualidad: nuevaMensualidad } : {}),
        },
      });
    },
    {
      exito: "Contrato renovado.",
      destino: `/contratos/${idContrato}`,
      siFalla: `/contratos/${idContrato}`,
    },
  );
}

export async function eliminarContrato(form: FormData) {
  const idContrato = id(form);
  await ejecutar(
    () =>
      prisma.$transaction(async (tx) => {
        const contrato = await tx.contrato.delete({ where: { id: idContrato } });
        // Si se borra un contrato vigente, la propiedad vuelve a quedar disponible.
        if (contrato.estado === "Vigente")
          await tx.propiedad.update({
            where: { id: contrato.idPropiedad },
            data: { estado: "Disponible" },
          });
      }),
    {
      exito: "Contrato eliminado.",
      destino: "/contratos",
      siFalla: `/contratos/${idContrato}`,
    },
  );
}
