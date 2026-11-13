import Link from "next/link";
import { Estado } from "@/components/ui/estado";
import { CeldaVer, Tabla, Td } from "@/components/ui/tabla";
import type { PropiedadListado } from "@/lib/data/propiedades";
import { formatMoneda, formatNumero, nombreCompleto } from "@/lib/format";

export function TablaPropiedades({ propiedades }: { propiedades: PropiedadListado[] }) {
  return (
    <Tabla
      columnas={[
        "Dirección",
        "Tipo",
        "Zona",
        "Amb.",
        "m²",
        "Alquiler",
        "Propietario",
        "Estado",
        "",
      ]}
      vacia={propiedades.length === 0}
    >
      {propiedades.map((p) => (
        <tr key={p.id}>
          <Td l="Dirección">
            <Link href={`/propiedades/${p.id}`} className="link">
              {p.direccion}
            </Link>
          </Td>
          <Td l="Tipo">{p.tipo.descripcion}</Td>
          <Td l="Zona">
            <div className="text-right md:text-left">
              {p.zona.nombre}
              <span className="block text-xs text-slate-400">{p.zona.localidad.descripcion}</span>
            </div>
          </Td>
          <Td l="Ambientes">{p.ambientes}</Td>
          <Td l="Superficie">{formatNumero(p.superficie)}</Td>
          <Td l="Alquiler" className="whitespace-nowrap">
            {formatMoneda(p.precioAlquiler)}
          </Td>
          <Td l="Propietario">{nombreCompleto(p.propietario)}</Td>
          <Td l="Estado">
            <Estado valor={p.estado} />
          </Td>
          <CeldaVer href={`/propiedades/${p.id}`} />
        </tr>
      ))}
    </Tabla>
  );
}
