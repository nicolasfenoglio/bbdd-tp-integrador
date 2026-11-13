"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

/** Botón de envío que se deshabilita mientras el servidor procesa el formulario. */
export function BotonEnviar({
  children,
  className = "btn",
  pendiente = "Guardando…",
}: {
  children: ReactNode;
  className?: string;
  pendiente?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendiente : children}
    </button>
  );
}

/** Botón de envío que pide confirmación antes de ejecutar una acción destructiva. */
export function BotonConfirmar({
  children = "Eliminar",
  mensaje = "¿Seguro que querés eliminar este registro? Esta acción no se puede deshacer.",
  className = "btn-danger",
  pendiente = "Procesando…",
}: {
  children?: ReactNode;
  mensaje?: string;
  className?: string;
  pendiente?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
      onClick={(e) => {
        if (!window.confirm(mensaje)) e.preventDefault();
      }}
    >
      {pending ? pendiente : children}
    </button>
  );
}
