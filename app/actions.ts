"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

function texto(form: FormData, campo: string) {
  return String(form.get(campo) ?? "").trim();
}

function opcional(form: FormData, campo: string) {
  return texto(form, campo) || null;
}

function entero(form: FormData, campo: string) {
  return Number.parseInt(texto(form, campo), 10);
}

function fecha(valor: string) {
  return valor ? new Date(`${valor}T00:00:00Z`) : null;
}

function mensajeError(e: unknown) {
  const code = (e as { code?: string })?.code;
  if (code === "P2002") return "Ya existe un registro con ese documento o email.";
  if (code === "P2003") return "No se puede eliminar: el registro tiene datos relacionados.";
  return e instanceof Error ? e.message : "Error inesperado.";
}

// Ejecuta la operación y vuelve a la página; si falla, muestra el error vía query string.
async function ejecutar(ruta: string, operacion: () => Promise<unknown>) {
  let error: string | null = null;
  try {
    await operacion();
  } catch (e) {
    error = mensajeError(e);
  }
  revalidatePath("/", "layout");
  redirect(error ? `${ruta}?error=${encodeURIComponent(error)}` : ruta);
}

/* ---------- Propietarios ---------- */

export async function crearPropietario(form: FormData) {
  await ejecutar("/propietarios", () =>
    prisma.propietario.create({
      data: {
        nombre: texto(form, "nombre"),
        apellido: texto(form, "apellido"),
        documento: texto(form, "documento"),
        telefono: opcional(form, "telefono"),
        email: opcional(form, "email"),
      },
    }),
  );
}

export async function eliminarPropietario(form: FormData) {
  await ejecutar("/propietarios", () =>
    prisma.propietario.delete({ where: { id: entero(form, "id") } }),
  );
}

/* ---------- Inquilinos ---------- */

export async function crearInquilino(form: FormData) {
  await ejecutar("/inquilinos", () =>
    prisma.inquilino.create({
      data: {
        nombre: texto(form, "nombre"),
        apellido: texto(form, "apellido"),
        documento: texto(form, "documento"),
        telefono: opcional(form, "telefono"),
        email: opcional(form, "email"),
      },
    }),
  );
}

export async function eliminarInquilino(form: FormData) {
  await ejecutar("/inquilinos", () =>
    prisma.inquilino.delete({ where: { id: entero(form, "id") } }),
  );
}

/* ---------- Propiedades ---------- */

export async function crearPropiedad(form: FormData) {
  await ejecutar("/propiedades", () =>
    prisma.propiedad.create({
      data: {
        direccion: texto(form, "direccion"),
        superficie: texto(form, "superficie"),
        ambientes: entero(form, "ambientes"),
        precioAlquiler: texto(form, "precioAlquiler"),
        estado: texto(form, "estado") || "Disponible",
        idPropietario: entero(form, "idPropietario"),
        idTipo: entero(form, "idTipo"),
        idZona: entero(form, "idZona"),
      },
    }),
  );
}

export async function cambiarEstadoPropiedad(form: FormData) {
  await ejecutar("/propiedades", () =>
    prisma.propiedad.update({
      where: { id: entero(form, "id") },
      data: { estado: texto(form, "estado") },
    }),
  );
}

export async function eliminarPropiedad(form: FormData) {
  await ejecutar("/propiedades", () =>
    prisma.propiedad.delete({ where: { id: entero(form, "id") } }),
  );
}

/* ---------- Contratos ---------- */

export async function crearContrato(form: FormData) {
  const idPropiedad = entero(form, "idPropiedad");
  const fechaInicio = fecha(texto(form, "fechaInicio"));
  const fechaFin = fecha(texto(form, "fechaFin"));

  await ejecutar("/contratos", async () => {
    if (!fechaInicio) throw new Error("La fecha de inicio es obligatoria.");
    if (fechaFin && fechaFin <= fechaInicio)
      throw new Error("La fecha de fin debe ser posterior a la de inicio.");

    // El alta del contrato y el cambio de estado de la propiedad van en una transacción.
    await prisma.$transaction(async (tx) => {
      const propiedad = await tx.propiedad.findUniqueOrThrow({ where: { id: idPropiedad } });
      if (propiedad.estado !== "Disponible")
        throw new Error("La propiedad seleccionada no está disponible.");

      await tx.contrato.create({
        data: {
          idPropiedad,
          idInquilino: entero(form, "idInquilino"),
          fechaInicio,
          fechaFin,
          mensualidad: texto(form, "mensualidad") || propiedad.precioAlquiler,
          deposito: texto(form, "deposito") || "0",
          estado: "Vigente",
        },
      });
      await tx.propiedad.update({ where: { id: idPropiedad }, data: { estado: "Alquilada" } });
    });
  });
}

export async function finalizarContrato(form: FormData) {
  const id = entero(form, "id");
  const estado = texto(form, "estado") === "Rescindido" ? "Rescindido" : "Finalizado";

  await ejecutar("/contratos", () =>
    prisma.$transaction(async (tx) => {
      const contrato = await tx.contrato.update({ where: { id }, data: { estado } });
      await tx.propiedad.update({
        where: { id: contrato.idPropiedad },
        data: { estado: "Disponible" },
      });
    }),
  );
}

export async function eliminarContrato(form: FormData) {
  await ejecutar("/contratos", () =>
    prisma.$transaction(async (tx) => {
      const contrato = await tx.contrato.delete({ where: { id: entero(form, "id") } });
      // Si se borra un contrato vigente, la propiedad vuelve a quedar disponible.
      if (contrato.estado === "Vigente")
        await tx.propiedad.update({
          where: { id: contrato.idPropiedad },
          data: { estado: "Disponible" },
        });
    }),
  );
}
