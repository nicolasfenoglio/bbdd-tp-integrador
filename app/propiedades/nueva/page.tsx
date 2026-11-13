import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { Avisos } from "@/components/ui/avisos";
import { Cargando } from "@/components/ui/cargando";
import { Tarjeta } from "@/components/ui/tarjeta";
import { Titulo } from "@/components/ui/titulo";
import { opcionesPropiedad } from "@/lib/data/propiedades";
import { param, paramId } from "@/lib/format";
import { FormPropiedad } from "../_components/form-propiedad";

export const metadata: Metadata = { title: "Nueva propiedad" };

export default function NuevaPropiedadPage(props: PageProps<"/propiedades/nueva">) {
  return (
    <>
      <Titulo
        titulo="Nueva propiedad"
        subtitulo="Cargá los datos del inmueble. Quedará Disponible para alquilar."
        volver={{ href: "/propiedades", label: "Propiedades" }}
      />
      <Suspense fallback={<Cargando />}>
        <Contenido {...props} />
      </Suspense>
    </>
  );
}

async function Contenido({ searchParams }: PageProps<"/propiedades/nueva">) {
  await connection();
  const sp = await searchParams;
  const opciones = await opcionesPropiedad();

  return (
    <>
      <Avisos error={param(sp, "error")} />
      <Tarjeta className="max-w-3xl">
        <FormPropiedad
          opciones={opciones}
          propietarioInicial={paramId(sp, "propietario")}
          cancelar="/propiedades"
        />
      </Tarjeta>
    </>
  );
}
