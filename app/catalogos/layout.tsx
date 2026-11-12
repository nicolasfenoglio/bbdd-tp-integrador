import { Suspense } from "react";
import { Pestanas } from "@/app/components/nav";
import { Titulo } from "@/app/components/ui";

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
      <Suspense fallback={<div className="mb-6 h-10 border-b border-zinc-200" />}>
        <Pestanas items={PESTANAS} />
      </Suspense>
      {children}
    </>
  );
}
