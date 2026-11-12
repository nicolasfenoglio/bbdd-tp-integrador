import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { Marca, Nav } from "@/app/components/nav";
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
  title: { default: "Gestión Inmobiliaria", template: "%s | Gestión Inmobiliaria" },
  description: "Trabajo Práctico Integrador de Bases de Datos 2026 - UTN FRSFco",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      {/* suppressHydrationWarning: extensiones del navegador (p. ej. ColorZilla) agregan atributos al body */}
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <header className="sticky top-0 z-30 bg-slate-900 shadow-sm">
          <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
            <Marca />
            {/* usePathname puede suspender en rutas dinámicas: va dentro de Suspense */}
            <Suspense>
              <Nav />
            </Suspense>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:py-10">{children}</main>
        <footer className="border-t border-slate-200 bg-white/60">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 text-xs text-slate-500 sm:flex-row sm:justify-between">
            <span>Trabajo Práctico Integrador · Bases de Datos 2026</span>
            <span>UTN · Facultad Regional San Francisco</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
