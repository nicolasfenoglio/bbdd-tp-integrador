"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/propiedades", label: "Propiedades" },
  { href: "/contratos", label: "Contratos" },
  { href: "/propietarios", label: "Propietarios" },
  { href: "/inquilinos", label: "Inquilinos" },
  { href: "/catalogos", label: "Catálogos" },
  { href: "/consultas", label: "Consultas" },
];

export function Marca() {
  return (
    <Link href="/" className="flex items-center gap-2 font-semibold text-zinc-900">
      <span className="grid size-8 place-items-center rounded-lg bg-blue-600 text-white">
        <svg
          viewBox="0 0 24 24"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
        >
          <path
            d="M3 11.5 12 4l9 7.5M5.5 10v9.5h13V10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      Inmobiliaria
    </Link>
  );
}

export function Nav() {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);
  const activo = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const clase = (href: string) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      activo(href)
        ? "bg-blue-50 text-blue-700"
        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
    }`;

  return (
    <>
      <nav className="hidden items-center gap-1 lg:flex">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className={clase(l.href)}>
            {l.label}
          </Link>
        ))}
      </nav>

      <button
        type="button"
        className="btn-secondary px-2.5 lg:hidden"
        aria-label="Abrir menú"
        aria-expanded={abierto}
        onClick={() => setAbierto((v) => !v)}
      >
        <svg
          viewBox="0 0 24 24"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          {abierto ? (
            <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          )}
        </svg>
      </button>

      {abierto && (
        <nav className="absolute inset-x-0 top-full z-20 grid gap-1 border-b border-zinc-200 bg-white px-4 py-3 shadow-sm lg:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={clase(l.href)}
              onClick={() => setAbierto(false)}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}

/** Pestañas de una sección (ej. Catálogos). */
export function Pestanas({ items }: { items: { href: string; label: string }[] }) {
  const pathname = usePathname();
  return (
    <div className="mb-6 flex gap-1 overflow-x-auto border-b border-zinc-200">
      {items.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium whitespace-nowrap transition ${
            pathname.startsWith(i.href)
              ? "border-blue-600 text-blue-700"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          {i.label}
        </Link>
      ))}
    </div>
  );
}
