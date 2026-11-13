const coloresEstado: Record<string, [string, string]> = {
  Disponible: ["bg-emerald-50 text-emerald-700 ring-emerald-600/20", "bg-emerald-500"],
  Vigente: ["bg-emerald-50 text-emerald-700 ring-emerald-600/20", "bg-emerald-500"],
  Alquilada: ["bg-indigo-50 text-indigo-700 ring-indigo-600/20", "bg-indigo-500"],
  Finalizado: ["bg-slate-100 text-slate-600 ring-slate-500/20", "bg-slate-400"],
  "No disponible": ["bg-amber-50 text-amber-800 ring-amber-600/20", "bg-amber-500"],
  Rescindido: ["bg-red-50 text-red-700 ring-red-600/20", "bg-red-500"],
};

/** Etiqueta de color para el estado de una propiedad o de un contrato. */
export function Estado({ valor }: { valor: string }) {
  const [clase, punto] = coloresEstado[valor] ?? coloresEstado.Finalizado;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset ${clase}`}
    >
      <span className={`size-1.5 rounded-full ${punto}`} />
      {valor}
    </span>
  );
}
