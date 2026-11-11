import { Suspense } from "react";
import Link from "next/link";
import { Cargando, Titulo } from "@/app/components/ui";
import { hoyUTC } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { connection } from "next/server";

async function Contenido() {
  await connection(); // datos siempre frescos: no prerenderizar
  const hoy = hoyUTC();
  const en60 = new Date(hoy);
  en60.setUTCDate(en60.getUTCDate() + 60);

  const [propiedades, disponibles, propietarios, inquilinos, vigentes, porVencer] =
    await Promise.all([
      prisma.propiedad.count(),
      prisma.propiedad.count({ where: { estado: "Disponible" } }),
      prisma.propietario.count(),
      prisma.inquilino.count(),
      prisma.contrato.count({ where: { estado: "Vigente" } }),
      prisma.contrato.count({ where: { estado: "Vigente", fechaFin: { gte: hoy, lte: en60 } } }),
    ]);

  const tarjetas = [
    { label: "Propiedades", valor: propiedades, href: "/propiedades" },
    { label: "Disponibles", valor: disponibles, href: "/consultas" },
    { label: "Propietarios", valor: propietarios, href: "/propietarios" },
    { label: "Inquilinos", valor: inquilinos, href: "/inquilinos" },
    { label: "Contratos vigentes", valor: vigentes, href: "/contratos" },
    { label: "Vencen en 60 días", valor: porVencer, href: "/consultas?dias=60" },
  ];

  return (
    <>
      <Titulo subtitulo="Sistema de gestión inmobiliaria · Trabajo Práctico Integrador de Bases de Datos">
        Panel general
      </Titulo>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tarjetas.map((t) => (
          <Link key={t.label} href={t.href} className="card transition hover:border-blue-300">
            <p className="text-sm text-zinc-500">{t.label}</p>
            <p className="mt-1 text-3xl font-semibold">{t.valor}</p>
          </Link>
        ))}
      </div>
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<Cargando />}>
      <Contenido />
    </Suspense>
  );
}
