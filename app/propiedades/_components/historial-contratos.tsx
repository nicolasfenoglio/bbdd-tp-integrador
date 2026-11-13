import { EnlaceContrato } from "@/components/contratos";
import { Estado } from "@/components/ui/estado";
import { Tabla, Td } from "@/components/ui/tabla";
import { Tarjeta } from "@/components/ui/tarjeta";
import type { PropiedadDetalle } from "@/lib/data/propiedades";
import { formatFecha, formatMoneda, nombreCompleto, plural } from "@/lib/format";

/** Todos los contratos que tuvo la propiedad, del más reciente al más antiguo. */
export function HistorialContratos({ contratos }: { contratos: PropiedadDetalle["contratos"] }) {
  return (
    <Tarjeta
      sinPadding
      className="overflow-hidden"
      titulo="Historial de contratos"
      descripcion={plural(contratos.length, "contrato", "contratos")}
    >
      <Tabla
        columnas={["#", "Inquilino", "Período", "Mensualidad", "Estado"]}
        vacia={contratos.length === 0}
        textoVacio="Esta propiedad todavía no tuvo contratos."
      >
        {contratos.map((c) => (
          <tr key={c.id}>
            <Td l="Contrato">
              <EnlaceContrato id={c.id} />
            </Td>
            <Td l="Inquilino">{nombreCompleto(c.inquilino)}</Td>
            <Td l="Período">
              {formatFecha(c.fechaInicio)} – {formatFecha(c.fechaFin)}
            </Td>
            <Td l="Mensualidad">{formatMoneda(c.mensualidad)}</Td>
            <Td l="Estado">
              <Estado valor={c.estado} />
            </Td>
          </tr>
        ))}
      </Tabla>
    </Tarjeta>
  );
}
