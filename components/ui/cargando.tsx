/** Esqueleto que se muestra mientras se cargan los datos de la página. */
export function Cargando() {
  return (
    <div className="animate-pulse space-y-4" aria-label="Cargando">
      <div className="h-10 rounded-lg bg-slate-200/70" />
      <div className="h-64 rounded-xl bg-slate-200/60" />
    </div>
  );
}
