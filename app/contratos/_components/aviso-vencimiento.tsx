import { textoDias } from "@/lib/format";

/** Alerta de la ficha cuando un contrato vigente vence en 60 días o menos, o ya venció. */
export function AvisoVencimiento({ restan }: { restan: number | null }) {
  if (restan === null || restan > 60) return null;
  return (
    <div
      className={`mb-5 rounded-lg border px-4 py-3 text-sm ${
        restan < 0
          ? "border-red-200 bg-red-50 text-red-800"
          : "border-amber-200 bg-amber-50 text-amber-800"
      }`}
    >
      {restan < 0
        ? `Este contrato ${textoDias(restan)} y sigue figurando como vigente. Renovalo o finalizalo.`
        : `Este contrato vence en ${textoDias(restan)}.`}
    </div>
  );
}
