import { EnlaceContrato } from "@/components/contratos";
import { Campo } from "@/components/ui/formulario";
import { Tabla, Td } from "@/components/ui/tabla";
import { type ContratoConPartes, SQL_POR_VENCER } from "@/lib/data/consultas";
import { diasHasta, formatFecha, formatMoneda, nombreCompleto, textoDias } from "@/lib/format";
import { Consulta } from "./consulta";

/** Plazos (en días) que se pueden elegir en el filtro. */
export const PLAZOS = [30, 60, 90, 180];

/** Consulta 2: contratos vigentes que vencen dentro del plazo elegido. */
export function ContratosPorVencer({
  contratos: porVencer,
  zona,
  dias,
}: {
  contratos: ContratoConPartes[];
  zona?: number;
  dias: number;
}) {
  return (
    <Consulta
      id="c2"
      numero={2}
      titulo={`Contratos que vencen en los próximos ${dias} días`}
      descripcion="Contratos vigentes cuya fecha de fin cae dentro del plazo elegido."
      sql={SQL_POR_VENCER}
      filtros={
        <form action="#c2" className="flex flex-col gap-2 sm:flex-row sm:items-end">
          {zona && <input type="hidden" name="zona" value={zona} />}
          <Campo label="Plazo" className="sm:w-48">
            <select name="dias" defaultValue={dias} className="input">
              {PLAZOS.map((d) => (
                <option key={d} value={d}>
                  {d} días
                </option>
              ))}
            </select>
          </Campo>
          <button className="btn">Aplicar</button>
        </form>
      }
    >
      <Tabla
        columnas={["#", "Propiedad", "Inquilino", "Teléfono", "Vence", "Restan", "Mensualidad"]}
        vacia={porVencer.length === 0}
      >
        {porVencer.map((c) => {
          const restan = diasHasta(c.fechaFin!);
          return (
            <tr key={c.id}>
              <Td l="Contrato">
                <EnlaceContrato id={c.id} />
              </Td>
              <Td l="Propiedad">{c.propiedad.direccion}</Td>
              <Td l="Inquilino">{nombreCompleto(c.inquilino)}</Td>
              <Td l="Teléfono">{c.inquilino.telefono ?? "-"}</Td>
              <Td l="Vence">{formatFecha(c.fechaFin)}</Td>
              <Td
                l="Restan"
                className={restan <= 30 ? "font-medium text-red-600" : "text-amber-700"}
              >
                {textoDias(restan)}
              </Td>
              <Td l="Mensualidad">{formatMoneda(c.mensualidad)}</Td>
            </tr>
          );
        })}
      </Tabla>
    </Consulta>
  );
}
