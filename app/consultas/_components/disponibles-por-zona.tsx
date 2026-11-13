import Link from "next/link";
import { Campo, SelectFiltro } from "@/components/ui/formulario";
import { Tabla, Td } from "@/components/ui/tabla";
import type { ZonaConLocalidad } from "@/lib/data/catalogos";
import { type PropiedadDisponibleConsulta, SQL_DISPONIBLES } from "@/lib/data/consultas";
import { formatMoneda, formatNumero } from "@/lib/format";
import { Consulta } from "./consulta";

/** Consulta 1: propiedades disponibles, con filtro por zona. */
export function DisponiblesPorZona({
  propiedades: disponibles,
  zonas,
  zona,
  dias,
}: {
  propiedades: PropiedadDisponibleConsulta[];
  zonas: ZonaConLocalidad[];
  zona?: number;
  dias: number;
}) {
  return (
    <Consulta
      id="c1"
      numero={1}
      titulo="Propiedades disponibles por zona"
      descripcion="Inmuebles en estado Disponible, ordenados por zona y precio."
      sql={SQL_DISPONIBLES}
      filtros={
        <form className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <input type="hidden" name="dias" value={dias} />
          <Campo label="Zona" className="sm:w-72">
            <SelectFiltro name="zona" valor={zona} todos="Todas las zonas">
              {zonas.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.nombre} ({z.localidad.descripcion})
                </option>
              ))}
            </SelectFiltro>
          </Campo>
          <button className="btn">Aplicar</button>
        </form>
      }
    >
      <Tabla
        columnas={["Zona", "Dirección", "Tipo", "Amb.", "m²", "Alquiler"]}
        vacia={disponibles.length === 0}
      >
        {disponibles.map((p) => (
          <tr key={p.id}>
            <Td l="Zona">
              {p.zona.nombre}
              <span className="ml-1 text-xs text-slate-400">{p.zona.localidad.descripcion}</span>
            </Td>
            <Td l="Dirección">
              <Link href={`/propiedades/${p.id}`} className="link">
                {p.direccion}
              </Link>
            </Td>
            <Td l="Tipo">{p.tipo.descripcion}</Td>
            <Td l="Ambientes">{p.ambientes}</Td>
            <Td l="Superficie">{formatNumero(p.superficie)}</Td>
            <Td l="Alquiler" className="font-medium">
              {formatMoneda(p.precioAlquiler)}
            </Td>
          </tr>
        ))}
      </Tabla>
    </Consulta>
  );
}
