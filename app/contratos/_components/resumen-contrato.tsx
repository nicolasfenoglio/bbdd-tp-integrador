import { Dato } from "@/components/ui/dato";
import { Estado } from "@/components/ui/estado";
import { Tarjeta } from "@/components/ui/tarjeta";
import type { ContratoDetalle } from "@/lib/data/contratos";
import { formatFecha, formatMoneda, textoDias } from "@/lib/format";

/** Resumen económico y de fechas del contrato. */
export function ResumenContrato({
  contrato: c,
  restan,
}: {
  contrato: ContratoDetalle;
  restan: number | null;
}) {
  const duracionMeses = c.fechaFin
    ? Math.round((c.fechaFin.getTime() - c.fechaInicio.getTime()) / (86_400_000 * 30.44))
    : null;

  return (
    <Tarjeta titulo="Resumen" acciones={<Estado valor={c.estado} />}>
      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Dato etiqueta="Mensualidad">
          <span className="text-base font-semibold">{formatMoneda(c.mensualidad)}</span>
        </Dato>
        <Dato etiqueta="Depósito">{formatMoneda(c.deposito)}</Dato>
        <Dato etiqueta="Duración">
          {duracionMeses !== null ? `${duracionMeses} meses` : "Sin fecha de fin"}
        </Dato>
        <Dato etiqueta="Inicio">{formatFecha(c.fechaInicio)}</Dato>
        <Dato etiqueta="Fin">{formatFecha(c.fechaFin)}</Dato>
        <Dato etiqueta="Días restantes">
          {restan === null ? "-" : restan < 0 ? textoDias(restan) : restan}
        </Dato>
      </dl>
    </Tarjeta>
  );
}
