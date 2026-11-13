import { AccionesFormulario, Campo } from "@/components/ui/formulario";
import { crearContrato } from "@/lib/actions/contratos";
import type { Inquilino } from "@/lib/data/personas";
import type { PropiedadDisponible } from "@/lib/data/propiedades";
import { fechaInput, formatMoneda, hoyUTC, nombreCompleto, sumarMeses } from "@/lib/format";

/** Alta de contrato: por defecto empieza hoy y dura 24 meses. */
export function FormNuevoContrato({
  propiedades,
  inquilinos,
  propiedadInicial,
}: {
  propiedades: PropiedadDisponible[];
  inquilinos: Inquilino[];
  propiedadInicial?: number;
}) {
  const hoy = hoyUTC();

  return (
    <form action={crearContrato} className="grid gap-3 sm:grid-cols-2">
      <Campo label="Propiedad" className="sm:col-span-2">
        <select name="idPropiedad" required defaultValue={propiedadInicial} className="input">
          {propiedades.map((p) => (
            <option key={p.id} value={p.id}>
              {p.direccion} — {p.tipo.descripcion}, {p.zona.nombre} ({p.zona.localidad.descripcion})
              · {formatMoneda(p.precioAlquiler)}
            </option>
          ))}
        </select>
      </Campo>
      <Campo label="Inquilino" className="sm:col-span-2">
        <select name="idInquilino" required className="input">
          {inquilinos.map((i) => (
            <option key={i.id} value={i.id}>
              {nombreCompleto(i)} — DNI {i.documento}
            </option>
          ))}
        </select>
      </Campo>
      <Campo label="Fecha de inicio">
        <input
          name="fechaInicio"
          type="date"
          required
          defaultValue={fechaInput(hoy)}
          className="input"
        />
      </Campo>
      <Campo label="Fecha de fin" ayuda="Vacío = contrato sin fecha de finalización.">
        <input
          name="fechaFin"
          type="date"
          defaultValue={fechaInput(sumarMeses(hoy, 24))}
          className="input"
        />
      </Campo>
      <Campo label="Mensualidad ($)" ayuda="Vacío = precio de alquiler de la propiedad.">
        <input name="mensualidad" type="number" step="0.01" min="1" className="input" />
      </Campo>
      <Campo label="Depósito ($)" ayuda="Vacío = un mes de alquiler.">
        <input name="deposito" type="number" step="0.01" min="0" className="input" />
      </Campo>
      <AccionesFormulario
        className="flex gap-2 sm:col-span-2"
        enviar="Crear contrato"
        cancelar="/contratos"
      />
    </form>
  );
}
