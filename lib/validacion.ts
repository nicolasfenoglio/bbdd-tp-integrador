/* =====================================================================
 * Lectura y validación de los campos que llegan de los formularios.
 * Se usa desde las Server Actions: cada función lee un campo del FormData,
 * lo normaliza y lanza ErrorValidacion con un mensaje para el usuario.
 * ===================================================================== */

/** Error de validación: su mensaje se muestra tal cual al usuario. */
export class ErrorValidacion extends Error {}

export function texto(form: FormData, campo: string) {
  return String(form.get(campo) ?? "").trim();
}

function opcional(form: FormData, campo: string) {
  return texto(form, campo) || null;
}

export function obligatorio(form: FormData, campo: string, etiqueta: string) {
  const valor = texto(form, campo);
  if (!valor) throw new ErrorValidacion(`${etiqueta}: es un campo obligatorio.`);
  return valor;
}

/** Id opcional (para formularios que sirven tanto para crear como para editar). */
export function idOpcional(form: FormData, campo = "id") {
  const valor = texto(form, campo);
  if (!valor) return null;
  const n = Number(valor);
  if (!Number.isInteger(n) || n <= 0) throw new ErrorValidacion("Identificador inválido.");
  return n;
}

export function id(form: FormData, campo = "id", etiqueta = "Registro") {
  const n = idOpcional(form, campo);
  if (n === null) throw new ErrorValidacion(`${etiqueta}: seleccioná una opción.`);
  return n;
}

export function entero(form: FormData, campo: string, etiqueta: string, min = 0, max = 1_000_000) {
  const n = Number(obligatorio(form, campo, etiqueta));
  if (!Number.isInteger(n) || n < min || n > max)
    throw new ErrorValidacion(`${etiqueta}: debe ser un número entero entre ${min} y ${max}.`);
  return n;
}

/** Importe o medida decimal no negativa, como string con 2 decimales (lo acepta Prisma.Decimal). */
export function decimal(
  form: FormData,
  campo: string,
  etiqueta: string,
  { positivo = false } = {},
) {
  const n = Number(obligatorio(form, campo, etiqueta).replace(",", "."));
  if (!Number.isFinite(n) || n < 0 || (positivo && n === 0))
    throw new ErrorValidacion(
      `${etiqueta}: ingresá un número ${positivo ? "mayor a 0" : "válido"}.`,
    );
  if (n >= 1e10) throw new ErrorValidacion(`${etiqueta}: el valor es demasiado grande.`);
  return n.toFixed(2);
}

export function decimalOpcional(form: FormData, campo: string, etiqueta: string) {
  return texto(form, campo) ? decimal(form, campo, etiqueta) : null;
}

export function fecha(form: FormData, campo: string, etiqueta: string) {
  const valor = obligatorio(form, campo, etiqueta);
  const d = new Date(`${valor}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor) || Number.isNaN(d.getTime()))
    throw new ErrorValidacion(`${etiqueta}: fecha inválida.`);
  return d;
}

export function fechaOpcional(form: FormData, campo: string, etiqueta: string) {
  return texto(form, campo) ? fecha(form, campo, etiqueta) : null;
}

export function validarRango(inicio: Date, fin: Date | null) {
  if (fin && fin <= inicio)
    throw new ErrorValidacion("La fecha de fin debe ser posterior a la fecha de inicio.");
}

/** Datos comunes de Propietario e Inquilino. */
export function datosPersona(form: FormData) {
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
