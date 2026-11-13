import { EnlaceContrato } from "@/components/contratos";
import { Tabla, Td } from "@/components/ui/tabla";
import { type ContratoConPartes, SQL_VENCIDOS } from "@/lib/data/consultas";
import { diasHasta, formatFecha, nombreCompleto } from "@/lib/format";
import { Consulta } from "./consulta";

/** Consulta 5: contratos que siguen vigentes aunque su fecha de fin ya pasó. */
export function ContratosVencidos({ contratos: vencidos }: { contratos: ContratoConPartes[] }) {
  return (
    <Consulta
      id="c5"
      numero={5}
      titulo="Contratos vencidos sin cerrar"
      descripcion="Contratos que siguen Vigentes aunque su fecha de fin ya pasó: hay que renovarlos o finalizarlos."
      sql={SQL_VENCIDOS}
    >
      <Tabla
        columnas={["#", "Propiedad", "Inquilino", "Venció", "Atraso"]}
        vacia={vencidos.length === 0}
        textoVacio="No hay contratos vencidos sin cerrar."
      >
        {vencidos.map((c) => (
          <tr key={c.id}>
            <Td l="Contrato">
              <EnlaceContrato id={c.id} />
            </Td>
            <Td l="Propiedad">{c.propiedad.direccion}</Td>
            <Td l="Inquilino">{nombreCompleto(c.inquilino)}</Td>
            <Td l="Venció">{formatFecha(c.fechaFin)}</Td>
            <Td l="Atraso" className="font-medium text-red-600">
              {-diasHasta(c.fechaFin!)} días
            </Td>
          </tr>
        ))}
      </Tabla>
    </Consulta>
  );
}
