import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { Cargando } from "@/components/ui/cargando";
import { CarruselImagenes } from "@/app/propiedades/_components/carrusel-imagenes";
import { formatMoneda, formatNumero } from "@/lib/format";
import { obtenerPropiedad } from "@/lib/data/propiedades";

export const metadata: Metadata = { title: "Propiedad" };

export default function InmueblePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<Cargando />}>
      <Contenido params={params} />
    </Suspense>
  );
}

async function Contenido({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const idPropiedad = Number(id);
  if (!Number.isInteger(idPropiedad) || idPropiedad <= 0) notFound();

  const propiedad = await obtenerPropiedad(idPropiedad);
  if (!propiedad || propiedad.estado !== "Disponible") notFound();

  return (
    <div>
      <Link href="/#propiedades" className="link mb-5 inline-block text-sm">
        ← Volver a propiedades disponibles
      </Link>

      <div className="grid items-start gap-6 lg:grid-cols-[1.45fr_0.55fr]">
        <div>
          <CarruselImagenes
            imagenes={propiedad.recursos}
            sinImagen="Esta propiedad todavía no tiene fotografías disponibles."
          />
        </div>

        <aside className="card lg:sticky lg:top-20">
          <p className="text-xs font-semibold tracking-[0.18em] text-indigo-600 uppercase">
            {propiedad.tipo.descripcion}
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-950">{propiedad.direccion}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {propiedad.zona.nombre}, {propiedad.zona.localidad.descripcion}
          </p>

          <p className="mt-6 text-3xl font-bold text-slate-950">
            {formatMoneda(propiedad.precioAlquiler)}
            <span className="text-sm font-normal text-slate-500"> / mes</span>
          </p>

          <dl className="mt-6 grid grid-cols-2 gap-3 border-y border-slate-200 py-5">
            <div>
              <dt className="text-xs text-slate-500">Superficie</dt>
              <dd className="mt-1 font-semibold text-slate-900">
                {formatNumero(propiedad.superficie)} m²
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Ambientes</dt>
              <dd className="mt-1 font-semibold text-slate-900">{propiedad.ambientes}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Estado</dt>
              <dd className="mt-1 font-semibold text-emerald-700">Disponible</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Zona</dt>
              <dd className="mt-1 font-semibold text-slate-900">{propiedad.zona.nombre}</dd>
            </div>
          </dl>

          <p className="mt-5 text-sm leading-6 text-slate-600">
            Una propiedad diseñada para adaptarse a tu estilo de vida. Coordiná una visita con
            nuestro equipo y conocela personalmente.
          </p>

          <a
            href={`mailto:asesores@horizonteinmobiliaria.com.ar?subject=${encodeURIComponent(
              `Consulta por ${propiedad.direccion}`,
            )}`}
            className="btn mt-6 w-full"
          >
            Contactar con asesor comercial
          </a>
        </aside>
      </div>
    </div>
  );
}
