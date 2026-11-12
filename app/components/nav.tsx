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
    <Link href="/" className="flex items-center gap-2.5">
      <span className="grid size-8 place-items-center rounded-lg bg-indigo-500 text-white ring-1 ring-white/20">
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
      <span className="leading-tight">
        <span className="block text-sm font-semibold text-white">Gestión Inmobiliaria</span>
        <span className="block text-[11px] text-slate-400">TP Integrador · Bases de Datos</span>
      </span>
    </Link>
  );
}

export function Nav() {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);
  const activo = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const clase = (href: string) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      activo(href) ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
    }`;

  return (
    <>
      <nav className="hidden items-center gap-0.5 lg:flex">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className={clase(l.href)}>
            {l.label}
          </Link>
        ))}
      </nav>

      <button
        type="button"
        className="grid size-9 place-items-center rounded-lg text-slate-200 ring-1 ring-white/15 transition hover:bg-white/10 lg:hidden"
        aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
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
        <nav className="absolute inset-x-0 top-full z-20 grid gap-1 border-t border-white/10 bg-slate-900 px-4 py-3 shadow-lg lg:hidden">
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
    <div className="mb-6 inline-flex max-w-full gap-1 overflow-x-auto rounded-xl bg-slate-200/60 p-1">
      {items.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          className={`rounded-lg px-4 py-1.5 text-sm font-medium whitespace-nowrap transition ${
            pathname.startsWith(i.href)
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          {i.label}
        </Link>
      ))}
    </div>
  );
}
