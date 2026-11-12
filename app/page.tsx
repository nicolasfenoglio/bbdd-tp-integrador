import type { ReactNode } from "react";
import { Estado } from "@/app/components/ui";

// Portada: no consulta la base. Los datos se ven entrando a cada sección desde el menú.

function Icono({ d }: { d: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden
    >
      <path d={d} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const PASOS: { titulo: string; texto: string; seccion: string; icono: string }[] = [
  {
    titulo: "Definí los catálogos",
    texto: "Cargá las localidades, sus zonas y los tipos de propiedad que vas a usar.",
    seccion: "Catálogos",
    icono: "M4 6h16M4 12h16M4 18h10",
  },
  {
    titulo: "Registrá propietarios y propiedades",
    texto: "Cada propiedad pertenece a un propietario y se ubica en una zona.",
    seccion: "Propietarios · Propiedades",
    icono: "M3 11.5 12 4l9 7.5M5.5 10v9.5h13V10",
  },
  {
    titulo: "Cargá inquilinos y contratos",
    texto: "Al firmar un contrato la propiedad pasa a Alquilada automáticamente.",
    seccion: "Inquilinos · Contratos",
    icono: "M8 4h8l3 3v13H5V4h3m0 8h8m-8 4h5",
  },
  {
    titulo: "Seguí los vencimientos",
    texto: "Revisá qué contratos vencen pronto y qué propiedades quedan libres.",
    seccion: "Consultas",
    icono: "M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  },
];

function Leyenda({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="card">
      <h2 className="font-semibold text-slate-900">{titulo}</h2>
      <dl className="mt-4 space-y-3">{children}</dl>
    </section>
  );
}

function ItemLeyenda({ estado, children }: { estado: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-4">
      <dt className="sm:w-32 sm:shrink-0">
        <Estado valor={estado} />
      </dt>
      <dd className="text-sm text-slate-600">{children}</dd>
    </div>
  );
}

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-indigo-600 px-6 py-10 text-white sm:px-10 sm:py-12">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Gestión Inmobiliaria</h1>
        <p className="mt-3 max-w-2xl text-base text-indigo-100 sm:text-lg">
          Administración de propiedades, propietarios, inquilinos y contratos de alquiler.
        </p>
        <p className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-700 px-3 py-2 text-sm text-white">
          <span className="hidden lg:inline">↑</span>
          <span className="lg:hidden">☰</span>
          <span>
            Elegí una sección en el <span className="hidden lg:inline">menú superior</span>
            <span className="lg:hidden">menú</span> para empezar.
          </span>
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Cómo se organiza</h2>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PASOS.map((p, i) => (
            <li key={p.titulo} className="card flex flex-col">
              <div className="flex items-center justify-between">
                <span className="grid size-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Icono d={p.icono} />
                </span>
                <span className="text-sm font-semibold text-slate-300">0{i + 1}</span>
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">{p.titulo}</h3>
              <p className="mt-1 flex-1 text-sm text-slate-600">{p.texto}</p>
              <p className="mt-4 border-t border-slate-100 pt-3 text-xs font-medium text-indigo-700">
                {p.seccion}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Leyenda titulo="Estados de una propiedad">
          <ItemLeyenda estado="Disponible">
            Lista para alquilar. Se puede crear un contrato.
          </ItemLeyenda>
          <ItemLeyenda estado="Alquilada">
            Tiene un contrato vigente. Lo asigna el sistema, no se cambia a mano.
          </ItemLeyenda>
          <ItemLeyenda estado="No disponible">
            Fuera de oferta por un tiempo, por ejemplo durante una refacción.
          </ItemLeyenda>
        </Leyenda>
        <Leyenda titulo="Estados de un contrato">
          <ItemLeyenda estado="Vigente">
            En curso. Se puede renovar, finalizar o rescindir.
          </ItemLeyenda>
          <ItemLeyenda estado="Finalizado">
            Terminó en la fecha pactada. La propiedad vuelve a quedar disponible.
          </ItemLeyenda>
          <ItemLeyenda estado="Rescindido">
            Se cortó antes de tiempo. La fecha de fin pasa a ser el día de la rescisión.
          </ItemLeyenda>
        </Leyenda>
      </div>
    </div>
  );
}
