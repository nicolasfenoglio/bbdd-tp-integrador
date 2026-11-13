import Link from "next/link";
import type { ReactNode } from "react";
import { BotonConfirmar, BotonEnviar } from "@/components/ui/botones";

/** Campo de formulario: etiqueta, control y texto de ayuda opcional. */
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

/** Botones al pie de un formulario: enviar y, si se indica a dónde volver, "Cancelar". */
export function AccionesFormulario({
  enviar,
  cancelar,
  className = "flex gap-2",
}: {
  enviar: ReactNode;
  cancelar?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <BotonEnviar>{enviar}</BotonEnviar>
      {cancelar && (
        <Link href={cancelar} className="btn-secondary">
          Cancelar
        </Link>
      )}
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

/**
 * Barra de filtros por GET de los listados. `columnas` define la grilla en pantallas
 * grandes (ej. "lg:grid-cols-4") y `limpiar`, si está, muestra el botón para quitar filtros.
 */
export function FormFiltros({
  columnas,
  limpiar,
  children,
}: {
  columnas: string;
  limpiar?: string;
  children: ReactNode;
}) {
  return (
    <form className={`card mb-6 grid gap-3 sm:grid-cols-2 ${columnas} lg:items-end`}>
      {children}
      <div className="flex gap-2">
        <button className="btn flex-1">Filtrar</button>
        {limpiar && (
          <Link href={limpiar} className="btn-secondary">
            Limpiar
          </Link>
        )}
      </div>
    </form>
  );
}

/** Select de filtro con una primera opción vacía ("Todos", "Todas"...) que no filtra. */
export function SelectFiltro({
  name,
  valor,
  todos,
  children,
}: {
  name: string;
  valor?: string | number;
  todos: string;
  children: ReactNode;
}) {
  return (
    <select name={name} defaultValue={valor ?? ""} className="input">
      <option value="">{todos}</option>
      {children}
    </select>
  );
}
