/** Mensajes de resultado que las acciones del servidor envían por query string (?ok= / ?error=). */
export function Avisos({ ok, error }: { ok?: string; error?: string }) {
  if (!ok && !error) return null;
  return (
    <div
      role="status"
      className={`mb-6 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
        error
          ? "border-red-200 bg-red-50 text-red-800"
          : "border-emerald-200 bg-emerald-50 text-emerald-800"
      }`}
    >
      <span
        aria-hidden
        className={`mt-px grid size-5 shrink-0 place-items-center rounded-full text-xs font-bold text-white ${
          error ? "bg-red-500" : "bg-emerald-500"
        }`}
      >
        {error ? "!" : "✓"}
      </span>
      <span>{error ?? ok}</span>
    </div>
  );
}
