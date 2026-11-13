import { Tabla, Td } from "@/components/ui/tabla";
import { type ResumenZona, SQL_RESUMEN_ZONA } from "@/lib/data/consultas";
import { formatMoneda } from "@/lib/format";
import { Consulta } from "./consulta";

/** Consulta 3: cantidad de propiedades por estado y alquiler promedio de cada zona. */
export function ResumenPorZona({ filas: resumenZonas }: { filas: ResumenZona[] }) {
  return (
    <Consulta
      id="c3"
      numero={3}
      titulo="Resumen de propiedades por zona"
      descripcion="Cantidad de propiedades por estado y alquiler promedio de cada zona (GROUP BY)."
      sql={SQL_RESUMEN_ZONA}
    >
      <Tabla
        columnas={[
          "Zona",
          "Localidad",
          "Total",
          "Disponibles",
          "Alquiladas",
          "Ocupación",
          "Alquiler promedio",
        ]}
        vacia={resumenZonas.length === 0}
      >
        {resumenZonas.map((r) => {
          const ocupacion = r.total ? Math.round((r.alquiladas / r.total) * 100) : 0;
          return (
            <tr key={r.id}>
              <Td l="Zona" className="font-medium">
                {r.zona}
              </Td>
              <Td l="Localidad">{r.localidad}</Td>
              <Td l="Total">{r.total}</Td>
              <Td l="Disponibles">{r.disponibles}</Td>
              <Td l="Alquiladas">{r.alquiladas}</Td>
              <Td l="Ocupación">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full bg-indigo-600" style={{ width: `${ocupacion}%` }} />
                  </div>
                  <span className="text-xs text-slate-500">{ocupacion}%</span>
                </div>
              </Td>
              <Td l="Alquiler promedio">{formatMoneda(r.precio_promedio)}</Td>
            </tr>
          );
        })}
      </Tabla>
    </Consulta>
  );
}
