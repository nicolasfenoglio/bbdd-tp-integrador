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
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {volver && (
          <Link
            href={volver.href}
            className="mb-1 inline-block text-sm text-zinc-500 hover:text-zinc-800"
          >
            ← {volver.label}
          </Link>
        )}
        <h1 className="text-2xl font-semibold tracking-tight break-words sm:text-3xl">{titulo}</h1>
        {subtitulo && <p className="mt-1 text-sm text-zinc-500">{subtitulo}</p>}
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
      className={`mb-5 rounded-lg border px-4 py-3 text-sm ${
        error
          ? "border-red-200 bg-red-50 text-red-800"
          : "border-green-200 bg-green-50 text-green-800"
      }`}
    >
      {error ?? ok}
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
            sinPadding ? "border-b border-zinc-200 px-4 py-3 sm:px-5" : "mb-4"
          }`}
        >
          <div>
            {titulo && <h2 className="font-semibold">{titulo}</h2>}
            {descripcion && <p className="mt-0.5 text-xs text-zinc-500">{descripcion}</p>}
          </div>
          {acciones}
        </div>
      )}
      {children}
    </section>
  );
}

const coloresEstado: Record<string, string> = {
  Disponible: "bg-green-100 text-green-800",
  Vigente: "bg-green-100 text-green-800",
  Alquilada: "bg-blue-100 text-blue-800",
  Finalizado: "bg-zinc-100 text-zinc-700",
  "No disponible": "bg-amber-100 text-amber-800",
  Rescindido: "bg-red-100 text-red-700",
  Vencido: "bg-red-100 text-red-700",
};

export function Estado({ valor }: { valor: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${
        coloresEstado[valor] ?? "bg-zinc-100 text-zinc-700"
      }`}
    >
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
      <td colSpan={columnas} className="!justify-center py-8 text-center text-zinc-400">
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
      {ayuda && <span className="mt-1 block text-xs text-zinc-400">{ayuda}</span>}
    </label>
  );
}

export function Dato({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-zinc-500">{etiqueta}</dt>
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
      <div className="h-10 rounded-lg bg-zinc-200/70" />
      <div className="h-64 rounded-xl bg-zinc-200/60" />
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
