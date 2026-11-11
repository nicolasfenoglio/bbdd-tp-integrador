export const ESTADOS_PROPIEDAD = ["Disponible", "Alquilada", "No disponible"] as const;
export const ESTADOS_CONTRATO = ["Vigente", "Finalizado", "Rescindido"] as const;

const moneda = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" });

export function formatMoneda(valor: { toString(): string } | number | null | undefined) {
  if (valor == null) return "-";
  return moneda.format(Number(valor.toString()));
}

// Las columnas @db.Date vuelven como medianoche UTC: se formatean en UTC para no correr un día.
export function formatFecha(fecha: Date | null | undefined) {
  if (!fecha) return "-";
  return fecha.toLocaleDateString("es-AR", { timeZone: "UTC" });
}

export function diasHasta(fecha: Date) {
  const hoy = new Date();
  const hoyUTC = Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  return Math.round((fecha.getTime() - hoyUTC) / 86_400_000);
}

export function hoyUTC() {
  const hoy = new Date();
  return new Date(Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()));
}
