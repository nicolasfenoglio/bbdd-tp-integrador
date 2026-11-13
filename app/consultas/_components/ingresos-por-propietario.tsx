import { Tabla, Td } from "@/components/ui/tabla";
import { type IngresoPropietario, SQL_INGRESOS } from "@/lib/data/consultas";
import { formatMoneda, nombreCompleto } from "@/lib/format";
import { Consulta } from "./consulta";

/** Consulta 4: suma de las mensualidades vigentes de cada propietario y su % del total. */
export function IngresosPorPropietario({ filas: ingresos }: { filas: IngresoPropietario[] }) {
  const totalIngresos = ingresos.reduce((t, r) => t + r.ingreso_mensual, 0);

  return (
    <Consulta
      id="c4"
      numero={4}
      titulo="Ingreso mensual por propietario"
      descripcion={`Suma de las mensualidades de contratos vigentes (JOIN + SUM). Total: ${formatMoneda(totalIngresos)}.`}
      sql={SQL_INGRESOS}
    >
      <Tabla
        columnas={["Propietario", "Contratos vigentes", "Ingreso mensual", "% del total"]}
        vacia={ingresos.length === 0}
      >
        {ingresos.map((r) => (
          <tr key={r.id}>
            <Td l="Propietario" className="font-medium">
              {nombreCompleto(r)}
            </Td>
            <Td l="Contratos vigentes">{r.contratos_vigentes}</Td>
            <Td l="Ingreso mensual">{formatMoneda(r.ingreso_mensual)}</Td>
            <Td l="% del total">
              {totalIngresos ? Math.round((r.ingreso_mensual / totalIngresos) * 100) : 0}%
            </Td>
          </tr>
        ))}
      </Tabla>
    </Consulta>
  );
}
