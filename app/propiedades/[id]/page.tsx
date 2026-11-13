import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { Avisos } from "@/components/ui/avisos";
import { Cargando } from "@/components/ui/cargando";
import { FormConfirmar } from "@/components/ui/formulario";
import { Tarjeta } from "@/components/ui/tarjeta";
import { Titulo } from "@/components/ui/titulo";
import { eliminarPropiedad } from "@/lib/actions/propiedades";
import { obtenerPropiedad, opcionesPropiedad } from "@/lib/data/propiedades";
import { param } from "@/lib/format";
import { DatosPropiedad } from "../_components/datos-propiedad";
import { FormPropiedad } from "../_components/form-propiedad";
import { HistorialContratos } from "../_components/historial-contratos";

export const metadata: Metadata = { title: "Propiedad" };

export default function PropiedadPage(props: PageProps<"/propiedades/[id]">) {
  return (
    <Suspense fallback={<Cargando />}>
      <Contenido {...props} />
    </Suspense>
  );
}

async function Contenido({ params, searchParams }: PageProps<"/propiedades/[id]">) {
  await connection();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const idPropiedad = Number(id);
  if (!Number.isInteger(idPropiedad) || idPropiedad <= 0) notFound();

  const [p, opciones] = await Promise.all([obtenerPropiedad(idPropiedad), opcionesPropiedad()]);
  if (!p) notFound();

  return (
    <>
      <Titulo
        titulo={p.direccion}
        subtitulo={`${p.tipo.descripcion} · ${p.zona.nombre}, ${p.zona.localidad.descripcion}`}
        volver={{ href: "/propiedades", label: "Propiedades" }}
        acciones={
          <>
            {p.estado === "Disponible" && (
              <Link href={`/contratos/nuevo?propiedad=${p.id}`} className="btn">
                + Nuevo contrato
              </Link>
            )}
            <FormConfirmar
              accion={eliminarPropiedad}
              id={p.id}
              mensaje={`¿Eliminar la propiedad "${p.direccion}"?`}
              className="btn-secondary text-red-600"
            >
              Eliminar
            </FormConfirmar>
          </>
        }
      />
      <Avisos ok={param(sp, "ok")} error={param(sp, "error")} />

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <DatosPropiedad propiedad={p} />
          <HistorialContratos contratos={p.contratos} />
        </div>

        <Tarjeta titulo="Editar propiedad" className="lg:sticky lg:top-20">
          <FormPropiedad
            propiedad={p}
            opciones={opciones}
            columnas="sm:grid-cols-2 lg:grid-cols-1"
          />
        </Tarjeta>
      </div>
    </>
  );
}
