import Link from "next/link";
import type { ReactNode } from "react";
import { FormConfirmar } from "@/components/ui/formulario";

/*
 * Tablas de datos. En pantallas chicas cada fila se muestra como una tarjeta:
 * las celdas usan su etiqueta (data-label) como título (ver .tabla en globals.css).
 */

/** Tabla con encabezados y fila de "sin registros" cuando no hay datos. */
export function Tabla({
  columnas,
  vacia,
  textoVacio,
  children,
}: {
  /** Títulos de las columnas ("" para la columna de acciones). */
  columnas: string[];
  vacia: boolean;
  textoVacio?: string;
  children: ReactNode;
}) {
  return (
    <table className="tabla">
      <thead>
        <tr>
          {columnas.map((columna, i) => (
            <th key={i}>{columna}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {vacia && <FilaVacia columnas={columnas.length} texto={textoVacio} />}
        {children}
      </tbody>
    </table>
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

/** Última celda de los listados: botón para ver la ficha del registro. */
export function CeldaVer({ href }: { href: string }) {
  return (
    <Td>
      <Link href={href} className="btn-secondary btn-sm">
        Ver
      </Link>
    </Td>
  );
}

/** Última celda de las tablas de ABM: "Editar" (abre el formulario) y "Eliminar" (con confirmación). */
export function AccionesFila({
  id,
  eliminar,
  mensaje,
}: {
  id: number;
  eliminar: (form: FormData) => Promise<void>;
  mensaje: string;
}) {
  return (
    <Td>
      <div className="flex justify-end gap-1">
        <Link href={`?editar=${id}#formulario`} className="btn-secondary btn-sm">
          Editar
        </Link>
        <FormConfirmar accion={eliminar} id={id} mensaje={mensaje} />
      </div>
    </Td>
  );
}
