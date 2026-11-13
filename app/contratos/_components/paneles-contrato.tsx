import Link from "next/link";
import { BotonEnviar } from "@/components/ui/botones";
import { Campo, FormConfirmar } from "@/components/ui/formulario";
import { Tarjeta } from "@/components/ui/tarjeta";
import { cerrarContrato, renovarContrato } from "@/lib/actions/contratos";
import type { ContratoDetalle } from "@/lib/data/contratos";

/* Paneles laterales de la ficha de contrato. */

/** Contrato vigente: extiende la fecha de fin y, opcionalmente, actualiza la mensualidad. */
export function PanelRenovar({ id }: { id: number }) {
  return (
    <Tarjeta titulo="Renovar" descripcion="Extiende la fecha de fin del contrato.">
      <form action={renovarContrato} className="space-y-3">
        <input type="hidden" name="id" value={id} />
        <Campo label="Extender">
          <select name="meses" defaultValue="12" className="input">
            {[6, 12, 24, 36].map((m) => (
              <option key={m} value={m}>
                {m} meses
              </option>
            ))}
          </select>
        </Campo>
        <Campo label="Nueva mensualidad ($)" ayuda="Vacío = mantiene la actual.">
          <input name="mensualidad" type="number" step="0.01" min="1" className="input" />
        </Campo>
        <BotonEnviar className="btn w-full">Renovar contrato</BotonEnviar>
      </form>
    </Tarjeta>
  );
}

/** Contrato vigente: finalizarlo o rescindirlo libera la propiedad. */
export function PanelCerrar({ id }: { id: number }) {
  return (
    <Tarjeta titulo="Cerrar contrato" descripcion="La propiedad vuelve a quedar Disponible.">
      <div className="grid gap-2">
        <FormConfirmar
          accion={cerrarContrato}
          id={id}
          extra={{ estado: "Finalizado" }}
          mensaje="¿Finalizar el contrato? La propiedad quedará Disponible."
          className="btn-secondary w-full"
        >
          Finalizar
        </FormConfirmar>
        <FormConfirmar
          accion={cerrarContrato}
          id={id}
          extra={{ estado: "Rescindido" }}
          mensaje="¿Rescindir el contrato? La fecha de fin pasa a ser hoy y la propiedad quedará Disponible."
          className="btn-secondary w-full text-red-600"
        >
          Rescindir
        </FormConfirmar>
      </div>
    </Tarjeta>
  );
}

/** Contrato finalizado o rescindido: ofrece crear uno nuevo si la propiedad quedó libre. */
export function PanelCerrado({ contrato: c }: { contrato: ContratoDetalle }) {
  return (
    <Tarjeta titulo="Contrato cerrado">
      <p className="text-sm text-slate-600">
        Este contrato está <strong>{c.estado.toLowerCase()}</strong>. Para volver a alquilar la
        propiedad creá un contrato nuevo.
      </p>
      {c.propiedad.estado === "Disponible" && (
        <Link href={`/contratos/nuevo?propiedad=${c.propiedad.id}`} className="btn mt-3 w-full">
          Nuevo contrato para esta propiedad
        </Link>
      )}
    </Tarjeta>
  );
}
