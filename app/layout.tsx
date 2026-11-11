import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Inmobiliaria | Base de Datos 2026",
  description: "Proyecto integrador de la materia Base de Datos 2026",
};

const links = [
  { href: "/", label: "Inicio" },
  { href: "/propiedades", label: "Propiedades" },
  { href: "/propietarios", label: "Propietarios" },
  { href: "/inquilinos", label: "Inquilinos" },
  { href: "/contratos", label: "Contratos" },
  { href: "/consultas", label: "Consultas" },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <header className="border-b border-zinc-200 bg-white">
          <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3">
            <span className="mr-4 font-semibold text-blue-700">Inmobiliaria</span>
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-zinc-600 hover:text-zinc-900"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
