export const ESTADOS_PROPIEDAD = ["Disponible", "Alquilada", "No disponible"] as const;
export const ESTADOS_CONTRATO = ["Vigente", "Finalizado", "Rescindido"] as const;

const moneda = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export function formatMoneda(valor: { toString(): string } | number | null | undefined) {
  if (valor == null) return "-";
  return moneda.format(Number(valor.toString()));
}

export function formatNumero(valor: { toString(): string } | number | null | undefined) {
  if (valor == null) return "-";
  return Number(valor.toString()).toLocaleString("es-AR");
}

// Las columnas @db.Date vuelven como medianoche UTC: se formatean en UTC para no correr un día.
export function formatFecha(fecha: Date | null | undefined) {
  if (!fecha) return "-";
  return fecha.toLocaleDateString("es-AR", { timeZone: "UTC" });
}

/** Valor para <input type="date">. */
export function fechaInput(fecha: Date | null | undefined) {
  return fecha ? fecha.toISOString().slice(0, 10) : "";
}

export function hoyUTC() {
  const hoy = new Date();
  return new Date(Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()));
}

export function sumarDias(fecha: Date, dias: number) {
  const d = new Date(fecha);
  d.setUTCDate(d.getUTCDate() + dias);
  return d;
}

export function sumarMeses(fecha: Date, meses: number) {
  const d = new Date(fecha);
  d.setUTCMonth(d.getUTCMonth() + meses);
  return d;
}

export function diasHasta(fecha: Date) {
  return Math.round((fecha.getTime() - hoyUTC().getTime()) / 86_400_000);
}

export function textoDias(dias: number) {
  if (dias === 0) return "vence hoy";
  if (dias < 0) return `venció hace ${-dias} ${-dias === 1 ? "día" : "días"}`;
  return `${dias} ${dias === 1 ? "día" : "días"}`;
}

export function nombreCompleto(p: { nombre: string; apellido: string }) {
  return `${p.apellido}, ${p.nombre}`;
}

type Params = Record<string, string | string[] | undefined>;

/** Lee un parámetro de búsqueda como string (o undefined). */
export function param(params: Params, clave: string) {
  const v = params[clave];
  return typeof v === "string" && v.trim() !== "" ? v.trim() : undefined;
}

/** Lee un parámetro de búsqueda como entero positivo (o undefined). */
export function paramId(params: Params, clave: string) {
  const n = Number(param(params, clave));
  return Number.isInteger(n) && n > 0 ? n : undefined;
}
