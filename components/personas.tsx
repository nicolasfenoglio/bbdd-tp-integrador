import { AccionesFormulario, Campo } from "@/components/ui/formulario";
import { TarjetaFormulario } from "@/components/ui/tarjeta";

/* Componentes compartidos por Propietarios e Inquilinos (tienen la misma estructura). */

type Persona = {
  id: number;
  nombre: string;
  apellido: string;
  documento: string;
  telefono: string | null;
  email: string | null;
};

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
    <TarjetaFormulario titulo={editando ? `Editar ${entidad} #${editando.id}` : `Nuevo ${entidad}`}>
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
        <AccionesFormulario
          className="flex gap-2 sm:col-span-2 lg:col-span-1"
          enviar={editando ? "Guardar cambios" : `Crear ${entidad}`}
          cancelar={editando ? ruta : undefined}
        />
      </form>
    </TarjetaFormulario>
  );
}

/** Teléfono y email en una celda de tabla. */
export function Contacto({ persona }: { persona: Pick<Persona, "telefono" | "email"> }) {
  return (
    <div className="text-right md:text-left">
      <div>{persona.telefono ?? "-"}</div>
      {persona.email && <div className="text-xs text-slate-500">{persona.email}</div>}
    </div>
  );
}

/** Teléfono y email dentro de una ficha de detalle (<Dato>). */
export function ContactoFicha({ persona }: { persona: Pick<Persona, "telefono" | "email"> }) {
  return (
    <>
      {persona.telefono ?? "-"}
      {persona.email && <span className="block text-xs text-slate-500">{persona.email}</span>}
    </>
  );
}
