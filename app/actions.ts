"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hoyUTC, sumarMeses } from "@/lib/format";
import { prisma } from "@/lib/prisma";

/* =====================================================================
 * Utilidades de lectura y validación de formularios
 * ===================================================================== */

class ErrorValidacion extends Error {}

function texto(form: FormData, campo: string) {
  return String(form.get(campo) ?? "").trim();
}

function opcional(form: FormData, campo: string) {
  return texto(form, campo) || null;
}

function obligatorio(form: FormData, campo: string, etiqueta: string) {
  const valor = texto(form, campo);
  if (!valor) throw new ErrorValidacion(`${etiqueta}: es un campo obligatorio.`);
  return valor;
}

/** Id opcional (para formularios que sirven tanto para crear como para editar). */
function idOpcional(form: FormData, campo = "id") {
  const valor = texto(form, campo);
  if (!valor) return null;
  const n = Number(valor);
  if (!Number.isInteger(n) || n <= 0) throw new ErrorValidacion("Identificador inválido.");
  return n;
}

function id(form: FormData, campo = "id", etiqueta = "Registro") {
  const n = idOpcional(form, campo);
  if (n === null) throw new ErrorValidacion(`${etiqueta}: seleccioná una opción.`);
  return n;
}

function entero(form: FormData, campo: string, etiqueta: string, min = 0, max = 1_000_000) {
  const n = Number(obligatorio(form, campo, etiqueta));
  if (!Number.isInteger(n) || n < min || n > max)
    throw new ErrorValidacion(`${etiqueta}: debe ser un número entero entre ${min} y ${max}.`);
  return n;
}

/** Importe o medida decimal no negativa, como string con 2 decimales (lo acepta Prisma.Decimal). */
function decimal(form: FormData, campo: string, etiqueta: string, { positivo = false } = {}) {
  const n = Number(obligatorio(form, campo, etiqueta).replace(",", "."));
  if (!Number.isFinite(n) || n < 0 || (positivo && n === 0))
    throw new ErrorValidacion(
      `${etiqueta}: ingresá un número ${positivo ? "mayor a 0" : "válido"}.`,
    );
  if (n >= 1e10) throw new ErrorValidacion(`${etiqueta}: el valor es demasiado grande.`);
  return n.toFixed(2);
}

function decimalOpcional(form: FormData, campo: string, etiqueta: string) {
  return texto(form, campo) ? decimal(form, campo, etiqueta) : null;
}

function fecha(form: FormData, campo: string, etiqueta: string) {
  const valor = obligatorio(form, campo, etiqueta);
  const d = new Date(`${valor}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor) || Number.isNaN(d.getTime()))
    throw new ErrorValidacion(`${etiqueta}: fecha inválida.`);
  return d;
}

function fechaOpcional(form: FormData, campo: string, etiqueta: string) {
  return texto(form, campo) ? fecha(form, campo, etiqueta) : null;
}

function validarRango(inicio: Date, fin: Date | null) {
  if (fin && fin <= inicio)
    throw new ErrorValidacion("La fecha de fin debe ser posterior a la fecha de inicio.");
}

function datosPersona(form: FormData) {
  const documento = obligatorio(form, "documento", "Documento").replace(/[.\s-]/g, "");
  if (!/^\d{7,11}$/.test(documento))
    throw new ErrorValidacion("Documento: ingresá entre 7 y 11 dígitos (DNI o CUIT).");

  const email = opcional(form, "email")?.toLowerCase() ?? null;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new ErrorValidacion("Email: el formato no es válido.");

  return {
    nombre: obligatorio(form, "nombre", "Nombre"),
    apellido: obligatorio(form, "apellido", "Apellido"),
    documento,
    telefono: opcional(form, "telefono"),
    email,
  };
}

/* =====================================================================
 * Ejecución común: corre la operación y redirige con un mensaje
 * ===================================================================== */

function conParam(url: string, clave: string, valor: string) {
  const [base, hash] = url.split("#");
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}${clave}=${encodeURIComponent(valor)}${hash ? `#${hash}` : ""}`;
}

function mensajeError(e: unknown, enUso?: string) {
  if (e instanceof ErrorValidacion) return e.message;
  const code = (e as { code?: string })?.code;
  if (code === "P2002") return "Ya existe un registro con ese documento o email.";
  if (code === "P2003") return enUso ?? "No se puede eliminar porque tiene registros asociados.";
  if (code === "P2025") return "El registro no existe o ya fue eliminado.";
  console.error(e);
  return "Ocurrió un error inesperado. Revisá los datos e intentá de nuevo.";
}

async function ejecutar<T>(
  operacion: () => Promise<T>,
  opciones: {
    exito: string;
    destino: string | ((resultado: T) => string);
    siFalla: string;
    enUso?: string;
  },
) {
  let url: string;
  try {
    const resultado = await operacion();
    const destino =
      typeof opciones.destino === "function" ? opciones.destino(resultado) : opciones.destino;
    url = conParam(destino, "ok", opciones.exito);
  } catch (e) {
    url = conParam(opciones.siFalla, "error", mensajeError(e, opciones.enUso));
  }
  revalidatePath("/", "layout");
  // redirect() lanza una excepción propia de Next: va fuera del try/catch.
  redirect(url);
}

/* =====================================================================
 * Catálogos: Localidad, Zona y Tipo
 * ===================================================================== */

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

/* =====================================================================
 * Personas: Propietario e Inquilino
 * ===================================================================== */

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

/* =====================================================================
 * Propiedades
 * ===================================================================== */

export async function guardarPropiedad(form: FormData) {
  const idEditar = idOpcional(form);
  await ejecutar(
    async () => {
      const estadoForm = texto(form, "estado") === "No disponible" ? "No disponible" : "Disponible";
      const data = {
        direccion: obligatorio(form, "direccion", "Dirección"),
        superficie: decimal(form, "superficie", "Superficie", { positivo: true }),
        ambientes: entero(form, "ambientes", "Ambientes", 1, 50),
        precioAlquiler: decimal(form, "precioAlquiler", "Precio de alquiler", { positivo: true }),
        idPropietario: id(form, "idPropietario", "Propietario"),
        idTipo: id(form, "idTipo", "Tipo"),
        idZona: id(form, "idZona", "Zona"),
      };

      if (!idEditar) return prisma.propiedad.create({ data: { ...data, estado: estadoForm } });

      return prisma.$transaction(async (tx) => {
        // El estado "Alquilada" lo controlan los contratos: no se puede cambiar a mano.
        const vigentes = await tx.contrato.count({
          where: { idPropiedad: idEditar, estado: "Vigente" },
        });
        return tx.propiedad.update({
          where: { id: idEditar },
          data: { ...data, estado: vigentes > 0 ? "Alquilada" : estadoForm },
        });
      });
    },
    {
      exito: idEditar ? "Propiedad actualizada." : "Propiedad creada.",
      destino: (p) => `/propiedades/${p.id}`,
      siFalla: idEditar ? `/propiedades/${idEditar}` : "/propiedades/nueva",
    },
  );
}

export async function eliminarPropiedad(form: FormData) {
  const idPropiedad = id(form);
  await ejecutar(() => prisma.propiedad.delete({ where: { id: idPropiedad } }), {
    exito: "Propiedad eliminada.",
    destino: "/propiedades",
    siFalla: `/propiedades/${idPropiedad}`,
    enUso:
      'No se puede eliminar la propiedad porque tiene contratos registrados. Podés marcarla como "No disponible".',
  });
}

/* =====================================================================
 * Contratos
 * ===================================================================== */

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
