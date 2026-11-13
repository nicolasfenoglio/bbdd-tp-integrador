import { Suspense } from "react";
import { Pestanas } from "@/components/nav";
import { Titulo } from "@/components/ui/titulo";

const PESTANAS = [
  { href: "/catalogos/zonas", label: "Zonas" },
  { href: "/catalogos/localidades", label: "Localidades" },
  { href: "/catalogos/tipos", label: "Tipos de propiedad" },
];

export default function CatalogosLayout({ children }: LayoutProps<"/catalogos">) {
  return (
    <>
      <Titulo
        titulo="Catálogos"
        subtitulo="Datos de referencia que usan las propiedades: zonas, localidades y tipos."
      />
      <Suspense fallback={<div className="mb-6 h-10 w-80 max-w-full rounded-xl bg-slate-200/60" />}>
        <Pestanas items={PESTANAS} />
      </Suspense>
      {children}
    </>
  );
}
