import { AccionesFormulario, Campo } from "@/components/ui/formulario";
import { Tarjeta } from "@/components/ui/tarjeta";
import { actualizarContrato } from "@/lib/actions/contratos";
import type { ContratoDetalle } from "@/lib/data/contratos";
import { fechaInput } from "@/lib/format";

/** Edición de fechas y montos de un contrato. */
export function FormEditarContrato({ contrato: c }: { contrato: ContratoDetalle }) {
  return (
    <Tarjeta titulo="Editar datos del contrato">
      <form action={actualizarContrato} className="grid gap-3 sm:grid-cols-2">
        <input type="hidden" name="id" value={c.id} />
        <Campo label="Fecha de inicio">
          <input
            name="fechaInicio"
            type="date"
            required
            defaultValue={fechaInput(c.fechaInicio)}
            className="input"
          />
        </Campo>
        <Campo label="Fecha de fin">
          <input
            name="fechaFin"
            type="date"
            defaultValue={fechaInput(c.fechaFin)}
            className="input"
          />
        </Campo>
        <Campo label="Mensualidad ($)">
          <input
            name="mensualidad"
            type="number"
            step="0.01"
            min="1"
            required
            defaultValue={c.mensualidad.toString()}
            className="input"
          />
        </Campo>
        <Campo label="Depósito ($)">
          <input
            name="deposito"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={c.deposito.toString()}
            className="input"
          />
        </Campo>
        <AccionesFormulario className="sm:col-span-2" enviar="Guardar cambios" />
      </form>
    </Tarjeta>
  );
}
