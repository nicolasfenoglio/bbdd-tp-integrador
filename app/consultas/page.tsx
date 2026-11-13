import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { Cargando } from "@/components/ui/cargando";
import { Titulo } from "@/components/ui/titulo";
import { listarZonas } from "@/lib/data/catalogos";
import {
  contratosPorVencer,
  contratosVencidos,
  ingresosPorPropietario,
  propiedadesDisponibles,
  resumenPorZona,
} from "@/lib/data/consultas";
import { paramId } from "@/lib/format";
import { ContratosPorVencer, PLAZOS } from "./_components/contratos-por-vencer";
import { ContratosVencidos } from "./_components/contratos-vencidos";
import { DisponiblesPorZona } from "./_components/disponibles-por-zona";
import { IndiceConsultas } from "./_components/indice-consultas";
import { IngresosPorPropietario } from "./_components/ingresos-por-propietario";
import { ResumenPorZona } from "./_components/resumen-por-zona";

export const metadata: Metadata = { title: "Consultas" };

export default function ConsultasPage(props: PageProps<"/consultas">) {
  return (
    <>
      <Titulo
        titulo="Consultas"
        subtitulo="Reportes sobre propiedades y contratos. Cada uno muestra la consulta SQL que lo genera."
      />
      <IndiceConsultas />
      <Suspense fallback={<Cargando />}>
        <Contenido {...props} />
      </Suspense>
    </>
  );
}

/** Lee los filtros de la URL, ejecuta las cinco consultas en paralelo y muestra cada resultado. */
async function Contenido({ searchParams }: PageProps<"/consultas">) {
  await connection();
  const sp = await searchParams;
  const zona = paramId(sp, "zona");
  const dias = PLAZOS.includes(Number(sp.dias)) ? Number(sp.dias) : 60;

  const [zonas, disponibles, porVencer, resumenZonas, ingresos, vencidos] = await Promise.all([
    listarZonas(),
    propiedadesDisponibles(zona),
    contratosPorVencer(dias),
    resumenPorZona(),
    ingresosPorPropietario(),
    contratosVencidos(),
  ]);

  return (
    <>
      <DisponiblesPorZona propiedades={disponibles} zonas={zonas} zona={zona} dias={dias} />
      <ContratosPorVencer contratos={porVencer} zona={zona} dias={dias} />
      <ResumenPorZona filas={resumenZonas} />
      <IngresosPorPropietario filas={ingresos} />
      <ContratosVencidos contratos={vencidos} />
    </>
  );
}
