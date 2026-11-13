import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { Avisos } from "@/components/ui/avisos";
import { Cargando } from "@/components/ui/cargando";
import { FormConfirmar } from "@/components/ui/formulario";
import { Titulo } from "@/components/ui/titulo";
import { eliminarContrato } from "@/lib/actions/contratos";
import { obtenerContrato } from "@/lib/data/contratos";
import { diasHasta, nombreCompleto, param } from "@/lib/format";
import { AvisoVencimiento } from "../_components/aviso-vencimiento";
import { FormEditarContrato } from "../_components/form-editar-contrato";
import { PanelCerrado, PanelCerrar, PanelRenovar } from "../_components/paneles-contrato";
import { PartesContrato } from "../_components/partes-contrato";
import { ResumenContrato } from "../_components/resumen-contrato";

export const metadata: Metadata = { title: "Contrato" };

export default function ContratoPage(props: PageProps<"/contratos/[id]">) {
  return (
    <Suspense fallback={<Cargando />}>
      <Contenido {...props} />
    </Suspense>
  );
}

async function Contenido({ params, searchParams }: PageProps<"/contratos/[id]">) {
  await connection();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const idContrato = Number(id);
  if (!Number.isInteger(idContrato) || idContrato <= 0) notFound();

  const c = await obtenerContrato(idContrato);
  if (!c) notFound();

  const vigente = c.estado === "Vigente";
  const restan = vigente && c.fechaFin ? diasHasta(c.fechaFin) : null;

  return (
    <>
      <Titulo
        titulo={`Contrato #${c.id}`}
        subtitulo={`${c.propiedad.direccion} · ${nombreCompleto(c.inquilino)}`}
        volver={{ href: "/contratos", label: "Contratos" }}
        acciones={
          <FormConfirmar
            accion={eliminarContrato}
            id={c.id}
            mensaje={`¿Eliminar el contrato #${c.id}? Se borra del historial${vigente ? " y la propiedad vuelve a quedar Disponible" : ""}.`}
            className="btn-secondary text-red-600"
          >
            Eliminar
          </FormConfirmar>
        }
      />
      <Avisos ok={param(sp, "ok")} error={param(sp, "error")} />
      <AvisoVencimiento restan={restan} />

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ResumenContrato contrato={c} restan={restan} />
          <PartesContrato contrato={c} />
          <FormEditarContrato contrato={c} />
        </div>

        <div className="space-y-6 lg:sticky lg:top-20">
          {vigente ? (
            <>
              <PanelRenovar id={c.id} />
              <PanelCerrar id={c.id} />
            </>
          ) : (
            <PanelCerrado contrato={c} />
          )}
        </div>
      </div>
    </>
  );
}
