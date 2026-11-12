import Link from "next/link";
import type { ReactNode } from "react";
import { BotonConfirmar } from "@/app/components/botones";

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

export function Tarjeta({
  titulo,
  descripcion,
  acciones,
  children,
  className = "",
  sinPadding = false,
  id,
}: {
  titulo?: ReactNode;
  descripcion?: ReactNode;
  acciones?: ReactNode;
  children: ReactNode;
  className?: string;
  sinPadding?: boolean;
  id?: string;
}) {
  return (
    <section id={id} className={`card scroll-mt-20 ${sinPadding ? "p-0 sm:p-0" : ""} ${className}`}>
      {(titulo || acciones) && (
        <div
          className={`flex flex-wrap items-start justify-between gap-2 ${
            sinPadding ? "border-b border-slate-200 px-4 py-4 sm:px-6" : "mb-5"
          }`}
        >
          <div>
            {titulo && <h2 className="font-semibold text-slate-900">{titulo}</h2>}
            {descripcion && <p className="mt-0.5 text-xs text-slate-500">{descripcion}</p>}
          </div>
          {acciones}
        </div>
      )}
      {children}
    </section>
  );
}

const coloresEstado: Record<string, [string, string]> = {
  Disponible: ["bg-emerald-50 text-emerald-700 ring-emerald-600/20", "bg-emerald-500"],
  Vigente: ["bg-emerald-50 text-emerald-700 ring-emerald-600/20", "bg-emerald-500"],
  Alquilada: ["bg-indigo-50 text-indigo-700 ring-indigo-600/20", "bg-indigo-500"],
  Finalizado: ["bg-slate-100 text-slate-600 ring-slate-500/20", "bg-slate-400"],
  "No disponible": ["bg-amber-50 text-amber-800 ring-amber-600/20", "bg-amber-500"],
  Rescindido: ["bg-red-50 text-red-700 ring-red-600/20", "bg-red-500"],
};

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

/** Celda de tabla con etiqueta para la vista de tarjetas en celulares. */
export function Td({
  l,
  children,
  className,
}: {
  l?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <td data-label={l} className={className}>
      {children}
    </td>
  );
}

export function FilaVacia({
  columnas,
  texto = "No hay registros.",
}: {
  columnas: number;
  texto?: string;
}) {
  return (
    <tr>
      <td colSpan={columnas} className="justify-center! py-8 text-center text-slate-400">
        {texto}
      </td>
    </tr>
  );
}

export function Campo({
  label,
  children,
  ayuda,
  className,
}: {
  label: string;
  children: ReactNode;
  ayuda?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="label">{label}</span>
      {children}
      {ayuda && <span className="mt-1 block text-xs text-slate-400">{ayuda}</span>}
    </label>
  );
}

export function Dato({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-500">{etiqueta}</dt>
      <dd className="mt-0.5 text-sm">{children}</dd>
    </div>
  );
}

/** Formulario con un único botón que pide confirmación (eliminar, finalizar, etc.). */
export function FormConfirmar({
  accion,
  id,
  extra,
  mensaje,
  children,
  className,
}: {
  accion: (form: FormData) => Promise<void>;
  id: number;
  extra?: Record<string, string>;
  mensaje?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <form action={accion}>
      <input type="hidden" name="id" value={id} />
      {extra &&
        Object.entries(extra).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <BotonConfirmar mensaje={mensaje} className={className}>
        {children}
      </BotonConfirmar>
    </form>
  );
}

export function Cargando() {
  return (
    <div className="animate-pulse space-y-4" aria-label="Cargando">
      <div className="h-10 rounded-lg bg-slate-200/70" />
      <div className="h-64 rounded-xl bg-slate-200/60" />
    </div>
  );
}

/** Buscador simple por GET: conserva los filtros adicionales como campos ocultos. */
export function Buscador({
  placeholder,
  valor,
  children,
  limpiar,
}: {
  placeholder: string;
  valor?: string;
  children?: ReactNode;
  limpiar: string;
}) {
  return (
    <form className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
      <input
        name="q"
        defaultValue={valor}
        placeholder={placeholder}
        className="input sm:max-w-xs"
        type="search"
      />
      {children}
      <div className="flex gap-2">
        <button className="btn-secondary">Buscar</button>
        <Link href={limpiar} className="btn-secondary">
          Limpiar
        </Link>
      </div>
    </form>
  );
}
