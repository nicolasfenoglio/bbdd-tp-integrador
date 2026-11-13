import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Avisos } from "@/components/ui/avisos";
import { Cargando } from "@/components/ui/cargando";
import { Tarjeta } from "@/components/ui/tarjeta";
import { Titulo } from "@/components/ui/titulo";
import { buscarContratos } from "@/lib/data/contratos";
import { listarInquilinos } from "@/lib/data/personas";
import { param, paramId, plural } from "@/lib/format";
import { FiltrosContratos } from "./_components/filtros-contratos";
import { TablaContratos } from "./_components/tabla-contratos";

export const metadata: Metadata = { title: "Contratos" };

export default function ContratosPage(props: PageProps<"/contratos">) {
  return (
    <>
      <Titulo
        titulo="Contratos"
        subtitulo="Contratos de alquiler entre inquilinos y propiedades."
        acciones={
          <Link href="/contratos/nuevo" className="btn">
            + Nuevo contrato
          </Link>
        }
      />
      <Suspense fallback={<Cargando />}>
        <Contenido {...props} />
      </Suspense>
    </>
  );
}

async function Contenido({ searchParams }: PageProps<"/contratos">) {
  await connection();
  const sp = await searchParams;
  const busqueda = {
    q: param(sp, "q"),
    estado: param(sp, "estado"),
    inquilino: paramId(sp, "inquilino"),
  };
  const hayFiltros = Object.values(busqueda).some(Boolean);

  const [contratos, inquilinos] = await Promise.all([
    buscarContratos(busqueda),
    listarInquilinos(),
  ]);

  return (
    <>
      <Avisos ok={param(sp, "ok")} error={param(sp, "error")} />
      <FiltrosContratos busqueda={busqueda} inquilinos={inquilinos} hayFiltros={hayFiltros} />
      <Tarjeta
        sinPadding
        className="overflow-hidden"
        titulo={plural(contratos.length, "contrato", "contratos")}
      >
        <TablaContratos contratos={contratos} />
      </Tarjeta>
    </>
  );
}
