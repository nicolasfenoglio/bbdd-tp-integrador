"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/propiedades", label: "Propiedades" },
  { href: "/contratos", label: "Contratos" },
  { href: "/propietarios", label: "Propietarios" },
  { href: "/inquilinos", label: "Inquilinos" },
  { href: "/catalogos", label: "Catálogos" },
  { href: "/consultas", label: "Consultas" },
];

function IconoCasa({ className = "size-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
    >
      <path d="M3 11.5 12 4l9 7.5M5.5 10v9.5h13V10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Marca() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="grid size-8 place-items-center rounded-lg bg-indigo-500 text-white">
        <IconoCasa />
      </span>
      <span className="text-[15px] font-semibold text-white">Gestión Inmobiliaria</span>
    </Link>
  );
}

export function Nav() {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);
  const activo = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const cerrar = () => setAbierto(false);

  // Con el panel abierto: bloquea el scroll de la página y cierra con Escape.
  useEffect(() => {
    if (!abierto) return;
    const alPresionar = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", alPresionar);
    return () => {
      document.body.style.overflow = overflowAnterior;
      document.removeEventListener("keydown", alPresionar);
    };
  }, [abierto]);

  return (
    <>
      {/* Escritorio: links en la barra */}
      <nav className="hidden items-center gap-0.5 lg:flex">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              activo(l.href)
                ? "bg-slate-800 text-white"
                : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </nav>

      {/* Celular / tablet: botón que abre el panel lateral */}
      <button
        type="button"
        className="grid size-10 place-items-center rounded-lg text-slate-200 transition hover:bg-slate-800 lg:hidden"
        aria-label="Abrir menú"
        aria-expanded={abierto}
        aria-controls="menu-lateral"
        onClick={() => setAbierto(true)}
      >
        <svg
          viewBox="0 0 24 24"
          className="size-6"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
        </svg>
      </button>

      <div
        className={`fixed inset-0 z-50 lg:hidden ${abierto ? "" : "pointer-events-none"}`}
        inert={!abierto}
      >
        {/* Fondo oscuro: tocarlo cierra el menú */}
        <div
          className={`absolute inset-0 bg-slate-950/60 transition-opacity duration-300 ${
            abierto ? "opacity-100" : "opacity-0"
          }`}
          onClick={cerrar}
        />

        <aside
          id="menu-lateral"
          role="dialog"
          aria-modal="true"
          aria-label="Menú"
          className={`absolute inset-y-0 right-0 flex h-dvh w-80 max-w-[85vw] flex-col bg-slate-900 shadow-2xl transition-transform duration-300 ease-out ${
            abierto ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800 px-5">
            <span className="text-sm font-semibold tracking-wider text-slate-400 uppercase">
              Menú
            </span>
            <button
              type="button"
              className="grid size-10 place-items-center rounded-lg text-slate-300 transition hover:bg-slate-800 hover:text-white"
              aria-label="Cerrar menú"
              onClick={cerrar}
            >
              <svg
                viewBox="0 0 24 24"
                className="size-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <ul className="space-y-1">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={cerrar}
                    className={`flex items-center justify-between rounded-lg px-4 py-3 text-base font-medium transition ${
                      activo(l.href)
                        ? "bg-indigo-500 text-white"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    {l.label}
                    <span aria-hidden className="text-lg opacity-60">
                      ›
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>
    </>
  );
}

/** Pestañas de una sección (ej. Catálogos). */
export function Pestanas({ items }: { items: { href: string; label: string }[] }) {
  const pathname = usePathname();
  return (
    <div className="mb-6 inline-flex max-w-full gap-1 overflow-x-auto rounded-xl bg-slate-200 p-1">
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
