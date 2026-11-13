import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Avisos } from "@/components/ui/avisos";
import { Cargando } from "@/components/ui/cargando";
import { Tarjeta } from "@/components/ui/tarjeta";
import { Titulo } from "@/components/ui/titulo";
import { listarInquilinos } from "@/lib/data/personas";
import { listarPropiedadesDisponibles } from "@/lib/data/propiedades";
import { param, paramId } from "@/lib/format";
import { FormNuevoContrato } from "../_components/form-nuevo-contrato";

export const metadata: Metadata = { title: "Nuevo contrato" };

export default function NuevoContratoPage(props: PageProps<"/contratos/nuevo">) {
  return (
    <>
      <Titulo
        titulo="Nuevo contrato"
        subtitulo="Solo se pueden alquilar propiedades en estado Disponible."
        volver={{ href: "/contratos", label: "Contratos" }}
      />
      <Suspense fallback={<Cargando />}>
        <Contenido {...props} />
      </Suspense>
    </>
  );
}

async function Contenido({ searchParams }: PageProps<"/contratos/nuevo">) {
  await connection();
  const sp = await searchParams;

  const [disponibles, inquilinos] = await Promise.all([
    listarPropiedadesDisponibles(),
    listarInquilinos(),
  ]);

  if (disponibles.length === 0 || inquilinos.length === 0)
    return (
      <Tarjeta className="max-w-3xl">
        <p className="text-sm text-slate-600">
          {disponibles.length === 0 ? (
            <>
              No hay propiedades disponibles. Podés{" "}
              <Link href="/propiedades/nueva" className="link">
                cargar una nueva
              </Link>{" "}
              o finalizar un contrato vigente.
            </>
          ) : (
            <>
              Primero cargá un{" "}
              <Link href="/inquilinos" className="link">
                inquilino
              </Link>
              .
            </>
          )}
        </p>
      </Tarjeta>
    );

  return (
    <>
      <Avisos error={param(sp, "error")} />
      <Tarjeta className="max-w-3xl">
        <FormNuevoContrato
          propiedades={disponibles}
          inquilinos={inquilinos}
          propiedadInicial={paramId(sp, "propiedad")}
        />
      </Tarjeta>
    </>
  );
}
