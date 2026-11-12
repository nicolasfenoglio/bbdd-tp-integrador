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
  description: "Administración de propiedades, propietarios, inquilinos y contratos de alquiler.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      {/* suppressHydrationWarning: extensiones del navegador (p. ej. ColorZilla) agregan atributos al body */}
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <header className="sticky top-0 z-30 bg-slate-900">
          <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
            <Marca />
            {/* usePathname puede suspender en rutas dinámicas: va dentro de Suspense */}
            <Suspense>
              <Nav />
            </Suspense>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:py-10">{children}</main>
      </body>
    </html>
  );
}
