import Link from "next/link";
import type { ReactNode } from "react";

/** Encabezado de página: título, subtítulo, enlace para volver y acciones a la derecha. */
export function Titulo({
  titulo,
  subtitulo,
  acciones,
  volver,
}: {
  titulo: ReactNode;
  subtitulo?: ReactNode;
  acciones?: ReactNode;
  volver?: { href: string; label: string };
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {volver && (
          <Link
            href={volver.href}
            className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-indigo-700"
          >
            <span aria-hidden>←</span> {volver.label}
          </Link>
        )}
        <h1 className="text-2xl font-bold tracking-tight wrap-break-word text-slate-900 sm:text-[32px]">
          {titulo}
        </h1>
        {subtitulo && <p className="mt-1.5 text-sm text-slate-500 sm:text-base">{subtitulo}</p>}
      </div>
      {acciones && <div className="flex flex-wrap gap-2">{acciones}</div>}
    </div>
  );
}
