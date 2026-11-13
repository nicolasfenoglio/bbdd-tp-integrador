import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Avisos } from "@/components/ui/avisos";
import { Cargando } from "@/components/ui/cargando";
import { Tarjeta } from "@/components/ui/tarjeta";
import { Titulo } from "@/components/ui/titulo";
import { listarTipos, listarZonas } from "@/lib/data/catalogos";
import { listarPropietarios } from "@/lib/data/personas";
import { buscarPropiedades } from "@/lib/data/propiedades";
import { param, paramId, plural } from "@/lib/format";
import { FiltrosPropiedades } from "./_components/filtros-propiedades";
import { TablaPropiedades } from "./_components/tabla-propiedades";

export const metadata: Metadata = { title: "Propiedades" };

export default function PropiedadesPage(props: PageProps<"/propiedades">) {
  return (
    <>
      <Titulo
        titulo="Propiedades"
        subtitulo="Registros de la tabla propiedad con su tipo, zona y propietario."
        acciones={
          <Link href="/propiedades/nueva" className="btn">
            + Nueva propiedad
          </Link>
        }
      />
      <Suspense fallback={<Cargando />}>
        <Contenido {...props} />
      </Suspense>
    </>
  );
}

async function Contenido({ searchParams }: PageProps<"/propiedades">) {
  await connection();
  const sp = await searchParams;
  const busqueda = {
    q: param(sp, "q"),
    zona: paramId(sp, "zona"),
    tipo: paramId(sp, "tipo"),
    propietario: paramId(sp, "propietario"),
    estado: param(sp, "estado"),
  };
  const hayFiltros = Object.values(busqueda).some(Boolean);

  const [propiedades, zonas, tipos, propietarios] = await Promise.all([
    buscarPropiedades(busqueda),
    listarZonas(),
    listarTipos(),
    listarPropietarios(),
  ]);

  return (
    <>
      <Avisos ok={param(sp, "ok")} error={param(sp, "error")} />
      <FiltrosPropiedades
        busqueda={busqueda}
        zonas={zonas}
        tipos={tipos}
        propietarios={propietarios}
        hayFiltros={hayFiltros}
      />
      <Tarjeta
        sinPadding
        className="overflow-hidden"
        titulo={plural(propiedades.length, "propiedad", "propiedades")}
        descripcion={hayFiltros ? "Con los filtros aplicados." : undefined}
      >
        <TablaPropiedades propiedades={propiedades} />
      </Tarjeta>
    </>
  );
}
