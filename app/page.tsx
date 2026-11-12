import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Cargando, Estado, Tarjeta, Titulo } from "@/app/components/ui";
import {
  diasHasta,
  formatFecha,
  formatMoneda,
  hoyUTC,
  nombreCompleto,
  sumarDias,
  textoDias,
} from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default function Home() {
  return (
    <>
      <Titulo
        titulo="Panel general"
        subtitulo="Resumen de la actividad de la inmobiliaria."
        acciones={
          <>
            <Link href="/propiedades/nueva" className="btn-secondary">
              + Propiedad
            </Link>
            <Link href="/contratos/nuevo" className="btn">
              + Contrato
            </Link>
          </>
        }
      />
      <Suspense fallback={<Cargando />}>
        <Contenido />
      </Suspense>
    </>
  );
}

async function Contenido() {
  await connection(); // datos siempre frescos: no prerenderizar
  const hoy = hoyUTC();

  const [
    propiedades,
    disponibles,
    alquiladas,
    propietarios,
    inquilinos,
    vigentes,
    ingreso,
    proximos,
    vencidos,
    ultimasDisponibles,
  ] = await Promise.all([
    prisma.propiedad.count(),
    prisma.propiedad.count({ where: { estado: "Disponible" } }),
    prisma.propiedad.count({ where: { estado: "Alquilada" } }),
    prisma.propietario.count(),
    prisma.inquilino.count(),
    prisma.contrato.count({ where: { estado: "Vigente" } }),
    prisma.contrato.aggregate({ where: { estado: "Vigente" }, _sum: { mensualidad: true } }),
    prisma.contrato.findMany({
      where: { estado: "Vigente", fechaFin: { gte: hoy, lte: sumarDias(hoy, 90) } },
      include: { propiedad: true, inquilino: true },
      orderBy: { fechaFin: "asc" },
    }),
    prisma.contrato.count({ where: { estado: "Vigente", fechaFin: { lt: hoy } } }),
    prisma.propiedad.findMany({
      where: { estado: "Disponible" },
      include: { zona: true, tipo: true },
      orderBy: { id: "desc" },
      take: 6,
    }),
  ]);

  const ocupacion = propiedades ? Math.round((alquiladas / propiedades) * 100) : 0;

  const indicadores = [
    {
      label: "Propiedades",
      valor: propiedades,
      detalle: `${disponibles} disponibles`,
      href: "/propiedades",
    },
    {
      label: "Contratos vigentes",
      valor: vigentes,
      detalle: `${ocupacion}% de ocupación`,
      href: "/contratos?estado=Vigente",
    },
    {
      label: "Ingreso mensual",
      valor: formatMoneda(ingreso._sum.mensualidad),
      detalle: "por contratos vigentes",
      href: "/consultas#c4",
    },
    {
      label: "Propietarios",
      valor: propietarios,
      detalle: "dueños registrados",
      href: "/propietarios",
    },
    {
      label: "Inquilinos",
      valor: inquilinos,
      detalle: "personas registradas",
      href: "/inquilinos",
    },
    {
      label: "Vencen en 90 días",
      valor: proximos.length,
      detalle: vencidos ? `${vencidos} vencidos sin cerrar` : "ninguno vencido",
      href: "/consultas?dias=90#c2",
    },
  ];

  return (
    <>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {indicadores.map((i) => (
          <Link
            key={i.label}
            href={i.href}
            className="card min-w-0 transition hover:border-blue-300 hover:shadow-md"
          >
            <p className="truncate text-xs font-medium text-zinc-500 sm:text-sm">{i.label}</p>
            <p className="mt-1 truncate text-xl font-semibold sm:text-3xl">{i.valor}</p>
            <p className="mt-1 truncate text-xs text-zinc-400">{i.detalle}</p>
          </Link>
        ))}
      </div>

      <Tarjeta className="mb-6" titulo="Ocupación de la cartera">
        <div className="flex h-3 overflow-hidden rounded-full bg-zinc-200">
          <div className="bg-blue-600" style={{ width: `${ocupacion}%` }} />
          <div
            className="bg-green-500"
            style={{ width: `${propiedades ? (disponibles / propiedades) * 100 : 0}%` }}
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-600">
          <span>
            <span className="mr-1 inline-block size-2 rounded-full bg-blue-600" />
            Alquiladas: {alquiladas}
          </span>
          <span>
            <span className="mr-1 inline-block size-2 rounded-full bg-green-500" />
            Disponibles: {disponibles}
          </span>
          <span>
            <span className="mr-1 inline-block size-2 rounded-full bg-zinc-300" />
            No disponibles: {propiedades - alquiladas - disponibles}
          </span>
        </div>
      </Tarjeta>

      <div className="grid gap-6 lg:grid-cols-2">
        <Tarjeta
          sinPadding
          titulo="Próximos vencimientos"
          descripcion="Contratos vigentes que terminan en los próximos 90 días."
          acciones={
            <Link href="/consultas?dias=90#c2" className="link text-sm">
              Ver todos
            </Link>
          }
        >
          <ul className="divide-y divide-zinc-100">
            {proximos.length === 0 && (
              <li className="px-5 py-6 text-center text-sm text-zinc-400">Nada por vencer.</li>
            )}
            {proximos.slice(0, 6).map((c) => {
              const restan = diasHasta(c.fechaFin!);
              return (
                <li key={c.id}>
                  <Link
                    href={`/contratos/${c.id}`}
                    className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-zinc-50 sm:px-5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{c.propiedad.direccion}</p>
                      <p className="truncate text-xs text-zinc-500">
                        {nombreCompleto(c.inquilino)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p
                        className={`text-sm font-medium ${restan <= 30 ? "text-red-600" : "text-amber-600"}`}
                      >
                        {textoDias(restan)}
                      </p>
                      <p className="text-xs text-zinc-400">{formatFecha(c.fechaFin)}</p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Tarjeta>

        <Tarjeta
          sinPadding
          titulo="Propiedades disponibles"
          descripcion="Últimas propiedades listas para alquilar."
          acciones={
            <Link href="/propiedades?estado=Disponible" className="link text-sm">
              Ver todas
            </Link>
          }
        >
          <ul className="divide-y divide-zinc-100">
            {ultimasDisponibles.length === 0 && (
              <li className="px-5 py-6 text-center text-sm text-zinc-400">
                No hay propiedades disponibles.
              </li>
            )}
            {ultimasDisponibles.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/propiedades/${p.id}`}
                  className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-zinc-50 sm:px-5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{p.direccion}</p>
                    <p className="truncate text-xs text-zinc-500">
                      {p.tipo.descripcion} · {p.zona.nombre}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-medium">{formatMoneda(p.precioAlquiler)}</p>
                    <Estado valor={p.estado} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Tarjeta>
      </div>
    </>
  );
}
