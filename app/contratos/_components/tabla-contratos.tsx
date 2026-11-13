import Link from "next/link";
import { Estado } from "@/components/ui/estado";
import { CeldaVer, Tabla, Td } from "@/components/ui/tabla";
import type { ContratoListado } from "@/lib/data/contratos";
import { diasHasta, formatFecha, formatMoneda, nombreCompleto, textoDias } from "@/lib/format";

/** Listado de contratos. Los vencidos se marcan en rojo y los que vencen en 60 días, en ámbar. */
export function TablaContratos({ contratos }: { contratos: ContratoListado[] }) {
  return (
    <Tabla
      columnas={["#", "Propiedad", "Inquilino", "Período", "Mensualidad", "Estado", ""]}
      vacia={contratos.length === 0}
    >
      {contratos.map((c) => {
        const restan = c.estado === "Vigente" && c.fechaFin ? diasHasta(c.fechaFin) : null;
        return (
          <tr key={c.id}>
            <Td l="Contrato" className="text-slate-400">
              #{c.id}
            </Td>
            <Td l="Propiedad">
              <div className="text-right md:text-left">
                <Link href={`/propiedades/${c.propiedad.id}`} className="link">
                  {c.propiedad.direccion}
                </Link>
                <span className="block text-xs text-slate-500">{c.propiedad.zona.nombre}</span>
              </div>
            </Td>
            <Td l="Inquilino">{nombreCompleto(c.inquilino)}</Td>
            <Td l="Período" className="whitespace-nowrap">
              <div className="text-right md:text-left">
                {formatFecha(c.fechaInicio)} – {formatFecha(c.fechaFin)}
                {restan !== null && (
                  <span
                    className={`block text-xs ${
                      restan < 0
                        ? "font-medium text-red-600"
                        : restan <= 60
                          ? "font-medium text-amber-600"
                          : "text-slate-500"
                    }`}
                  >
                    {restan < 0 ? textoDias(restan) : `restan ${textoDias(restan)}`}
                  </span>
                )}
              </div>
            </Td>
            <Td l="Mensualidad">{formatMoneda(c.mensualidad)}</Td>
            <Td l="Estado">
              <Estado valor={c.estado} />
            </Td>
            <CeldaVer href={`/contratos/${c.id}`} />
          </tr>
        );
      })}
    </Tabla>
  );
}
