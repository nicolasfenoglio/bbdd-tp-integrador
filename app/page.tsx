import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Cargando } from "@/components/ui/cargando";
import { formatMoneda, formatNumero } from "@/lib/format";
import { listarPropiedadesLanding } from "@/lib/data/propiedades";

export const metadata: Metadata = {
  title: "Inmobiliaria Horizonte",
  description: "Encontrá tu próxima casa con Inmobiliaria Horizonte.",
};

export default function Home() {
  return (
    <Suspense fallback={<Cargando />}>
      <Contenido />
    </Suspense>
  );
}

async function Contenido() {
  await connection();
  const propiedades = await listarPropiedadesLanding();

  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-14 text-white sm:px-12 sm:py-16">
        <div className="absolute -top-24 right-[-6rem] size-72 rounded-full bg-indigo-500/30 blur-2xl" />
        <div className="relative max-w-2xl">
          <p className="mb-3 text-xs font-semibold tracking-[0.25em] text-indigo-300 uppercase">
            Inmobiliaria Horizonte
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Encontrá el lugar donde empieza tu próxima etapa
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
            Te acompañamos en cada decisión: alquileres, tasaciones y asesoramiento personalizado
            para propietarios e inquilinos.
          </p>
          <a href="#propiedades" className="btn mt-7">
            Ver propiedades disponibles
          </a>
        </div>
      </section>

      <section id="propiedades" className="scroll-mt-24">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-indigo-600 uppercase">
              Oportunidades destacadas
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
              Propiedades disponibles
            </h2>
          </div>
          <p className="text-sm text-slate-500">
            {propiedades.length} {propiedades.length === 1 ? "propiedad" : "propiedades"}
          </p>
        </div>

        {propiedades.length === 0 ? (
          <div className="card text-center text-sm text-slate-500">
            En este momento no hay propiedades disponibles. Consultanos para recibir novedades.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {propiedades.map((propiedad) => {
              const principal =
                propiedad.recursos.find((recurso) => recurso.principal) ?? propiedad.recursos[0];
              return (
                <Link
                  key={propiedad.id}
                  href={`/inmuebles/${propiedad.id}`}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  {principal ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/api/recursos/${principal.id}`}
                      alt={propiedad.direccion}
                      className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="grid aspect-[4/3] place-items-center bg-slate-100 text-sm text-slate-400">
                      Sin fotografías
                    </div>
                  )}
                  <div className="p-5">
                    <p className="text-xs font-medium text-indigo-600">
                      {propiedad.tipo.descripcion} · {propiedad.zona.nombre}
                    </p>
                    <h3 className="mt-1 font-semibold text-slate-900">{propiedad.direccion}</h3>
                    <p className="mt-2 text-sm text-slate-500">
                      {propiedad.ambientes} ambientes · {formatNumero(propiedad.superficie)} m²
                    </p>
                    <p className="mt-4 text-xl font-bold text-slate-950">
                      {formatMoneda(propiedad.precioAlquiler)}
                      <span className="text-xs font-normal text-slate-500"> / mes</span>
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl bg-indigo-50 p-7 sm:p-10">
          <p className="text-xs font-semibold tracking-[0.2em] text-indigo-600 uppercase">
            Nuestra inmobiliaria
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            Más de 15 años haciendo simples las mudanzas
          </h2>
          <p className="mt-4 max-w-2xl leading-7 text-slate-600">
            Horizonte nace con una idea clara: brindar atención cercana, información transparente y
            soluciones reales. Nuestro equipo conoce cada barrio y acompaña propietarios e
            inquilinos desde la primera consulta hasta la entrega de llaves.
          </p>
          <div className="mt-7 grid grid-cols-3 gap-3">
            {[
              ["350+", "Operaciones"],
              ["12", "Barrios"],
              ["4.9/5", "Satisfacción"],
            ].map(([valor, etiqueta]) => (
              <div key={etiqueta} className="rounded-xl bg-white p-4 text-center">
                <strong className="block text-lg text-indigo-700 sm:text-2xl">{valor}</strong>
                <span className="text-xs text-slate-500">{etiqueta}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-slate-900 p-7 text-white sm:p-10">
          <p className="text-xs font-semibold tracking-[0.2em] text-indigo-300 uppercase">
            Compromiso Horizonte
          </p>
          <h2 className="mt-2 text-2xl font-bold">Tu propiedad, en buenas manos</h2>
          <ul className="mt-5 space-y-4 text-sm text-slate-300">
            <li>✓ Tasación profesional y publicación estratégica</li>
            <li>✓ Selección y verificación de inquilinos</li>
            <li>✓ Gestión documental y seguimiento de contratos</li>
            <li>✓ Atención personalizada durante todo el proceso</li>
          </ul>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {[
          [
            "Elegí con confianza",
            "Recorré opciones reales, conocé cada detalle y compará sin presión.",
          ],
          ["Resolvé rápido", "Nuestro equipo comercial responde consultas y coordina visitas."],
          [
            "Mudate tranquilo",
            "Te acompañamos con asesoramiento claro en contratos y documentación.",
          ],
        ].map(([titulo, texto]) => (
          <div key={titulo} className="card">
            <h3 className="font-semibold text-slate-900">{titulo}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{texto}</p>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-indigo-100 bg-white px-6 py-10 text-center sm:px-10">
        <h2 className="text-2xl font-bold text-slate-900">¿No encontrás lo que buscás?</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
          Contanos qué necesitás y un asesor comercial te ayudará a encontrar la propiedad ideal.
        </p>
        <a
          href="mailto:asesores@horizonteinmobiliaria.com.ar?subject=Consulta%20sobre%20propiedades"
          className="btn mt-6"
        >
          Contactar con asesor comercial
        </a>
      </section>
    </div>
  );
}
