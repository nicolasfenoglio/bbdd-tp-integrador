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
  title: { default: "Inmobiliaria", template: "%s | Inmobiliaria" },
  description:
    "Sistema de gestión inmobiliaria · Trabajo Práctico Integrador de Base de Datos 2026",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      {/* suppressHydrationWarning: extensiones del navegador (p. ej. ColorZilla) agregan atributos al body */}
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur">
          <div className="relative mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
            <Marca />
            {/* usePathname puede suspender en rutas dinámicas: va dentro de Suspense */}
            <Suspense>
              <Nav />
            </Suspense>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">{children}</main>
        <footer className="border-t border-zinc-200 py-4 text-center text-xs text-zinc-400">
          Trabajo Práctico Integrador · Base de Datos 2026 · UTN FRSFco
        </footer>
      </body>
    </html>
  );
}
