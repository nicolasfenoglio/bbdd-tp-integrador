import type { ReactNode } from "react";

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

/**
 * Tarjeta del formulario de alta/edición en las pantallas de ABM: va primero en el
 * celular y queda fija a la derecha en pantallas grandes. Los enlaces "Editar"
 * apuntan a su ancla (#formulario).
 */
export function TarjetaFormulario({
  titulo,
  children,
}: {
  titulo: ReactNode;
  children: ReactNode;
}) {
  return (
    <Tarjeta
      id="formulario"
      titulo={titulo}
      className="order-first lg:sticky lg:top-20 lg:order-none"
    >
      {children}
    </Tarjeta>
  );
}
