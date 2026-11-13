import type { ReactNode } from "react";

/** Sección de una consulta: título, descripción, filtros opcionales, SQL desplegable y resultado. */
export function Consulta(props: {
  id: string;
  numero: number;
  titulo: string;
  descripcion: string;
  sql: string;
  filtros?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={props.id} className="card mb-6 scroll-mt-20 overflow-hidden p-0 sm:p-0">
      <div className="space-y-3 border-b border-slate-200 px-4 py-4 sm:px-5">
        <div>
          <h2 className="text-lg font-semibold">
            <span className="mr-2 text-slate-400">{props.numero}.</span>
            {props.titulo}
          </h2>
          <p className="text-sm text-slate-500">{props.descripcion}</p>
        </div>
        {props.filtros}
        <details>
          <summary className="cursor-pointer text-xs font-medium text-indigo-700">Ver SQL</summary>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-900 p-3 font-mono text-xs leading-relaxed text-slate-100">
            {props.sql.trim()}
          </pre>
        </details>
      </div>
      {props.children}
    </section>
  );
}
