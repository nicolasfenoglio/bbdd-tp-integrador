import Link from "next/link";
import { BotonEnviar } from "@/app/components/botones";
import { Campo, Tarjeta } from "@/app/components/ui";

type Persona = {
  id: number;
  nombre: string;
  apellido: string;
  documento: string;
  telefono: string | null;
  email: string | null;
};

/** Filtro de búsqueda por nombre, apellido, documento o email (sirve para ambas tablas). */
export function filtroPersona(q?: string) {
  if (!q) return undefined;
  const contiene = { contains: q, mode: "insensitive" as const };
  return {
    OR: [
      { nombre: contiene },
      { apellido: contiene },
      { documento: contiene },
      { email: contiene },
    ],
  };
}

/** Formulario de alta/edición compartido entre Propietarios e Inquilinos. */
export function FormPersona({
  accion,
  editando,
  entidad,
  ruta,
}: {
  accion: (form: FormData) => Promise<void>;
  editando?: Persona;
  entidad: string;
  ruta: string;
}) {
  return (
    <Tarjeta
      id="formulario"
      titulo={editando ? `Editar ${entidad} #${editando.id}` : `Nuevo ${entidad}`}
      className="order-first lg:sticky lg:top-20 lg:order-none"
    >
      <form
        action={accion}
        key={editando?.id ?? "nuevo"}
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1"
      >
        {editando && <input type="hidden" name="id" value={editando.id} />}
        <Campo label="Nombre">
          <input name="nombre" required defaultValue={editando?.nombre} className="input" />
        </Campo>
        <Campo label="Apellido">
          <input name="apellido" required defaultValue={editando?.apellido} className="input" />
        </Campo>
        <Campo label="Documento (DNI o CUIT)">
          <input
            name="documento"
            required
            inputMode="numeric"
            pattern="[0-9.\- ]{7,14}"
            title="Entre 7 y 11 dígitos"
            defaultValue={editando?.documento}
            className="input"
          />
        </Campo>
        <Campo label="Teléfono">
          <input
            name="telefono"
            type="tel"
            defaultValue={editando?.telefono ?? ""}
            className="input"
          />
        </Campo>
        <Campo label="Email" className="sm:col-span-2 lg:col-span-1">
          <input name="email" type="email" defaultValue={editando?.email ?? ""} className="input" />
        </Campo>
        <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
          <BotonEnviar>{editando ? "Guardar cambios" : `Crear ${entidad}`}</BotonEnviar>
          {editando && (
            <Link href={ruta} className="btn-secondary">
              Cancelar
            </Link>
          )}
        </div>
      </form>
    </Tarjeta>
  );
}

export function Contacto({ persona }: { persona: Persona }) {
  return (
    <div className="text-right md:text-left">
      <div>{persona.telefono ?? "-"}</div>
      {persona.email && <div className="text-xs text-zinc-500">{persona.email}</div>}
    </div>
  );
}
