import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Avisos, Campo, Cargando, Estado, Titulo } from "@/app/components/ui";
import {
  ESTADOS_PROPIEDAD,
  formatMoneda,
  formatNumero,
  nombreCompleto,
  param,
  paramId,
} from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Propiedades" };

export default function PropiedadesPage(props: PageProps<"/propiedades">) {
  return (
    <>
      <Titulo
        titulo="Propiedades"
        subtitulo="Inmuebles administrados por la inmobiliaria."
        acciones={
          <Link href="/propiedades/nueva" className="btn">
            + Nueva propiedad
          </Link>
        }
      />
      <Suspense fallback={<Cargando />}>
        <Contenido {...props} />
      </Suspense>
    </>
  );
}

async function Contenido({ searchParams }: PageProps<"/propiedades">) {
  await connection();
  const sp = await searchParams;
  const q = param(sp, "q");
  const zona = paramId(sp, "zona");
  const tipo = paramId(sp, "tipo");
  const propietario = paramId(sp, "propietario");
  const estado = param(sp, "estado");
  const hayFiltros = Boolean(q || zona || tipo || propietario || estado);

  const [propiedades, zonas, tipos, propietarios] = await Promise.all([
    prisma.propiedad.findMany({
      where: {
        direccion: q ? { contains: q, mode: "insensitive" } : undefined,
        idZona: zona,
        idTipo: tipo,
        idPropietario: propietario,
        estado,
      },
      include: { propietario: true, tipo: true, zona: { include: { localidad: true } } },
      orderBy: [{ estado: "asc" }, { direccion: "asc" }],
    }),
    prisma.zona.findMany({
      include: { localidad: true },
      orderBy: [{ localidad: { descripcion: "asc" } }, { nombre: "asc" }],
    }),
    prisma.tipo.findMany({ orderBy: { descripcion: "asc" } }),
    prisma.propietario.findMany({ orderBy: [{ apellido: "asc" }, { nombre: "asc" }] }),
  ]);

  return (
    <>
      <Avisos ok={param(sp, "ok")} error={param(sp, "error")} />

      <form className="card mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-6 lg:items-end">
        <Campo label="Dirección" className="sm:col-span-2 lg:col-span-1">
          <input name="q" type="search" defaultValue={q} placeholder="Buscar…" className="input" />
        </Campo>
        <Campo label="Zona">
          <select name="zona" defaultValue={zona ?? ""} className="input">
            <option value="">Todas</option>
            {zonas.map((z) => (
              <option key={z.id} value={z.id}>
                {z.nombre} ({z.localidad.descripcion})
              </option>
            ))}
          </select>
        </Campo>
        <Campo label="Tipo">
          <select name="tipo" defaultValue={tipo ?? ""} className="input">
            <option value="">Todos</option>
            {tipos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.descripcion}
              </option>
            ))}
          </select>
        </Campo>
        <Campo label="Estado">
          <select name="estado" defaultValue={estado ?? ""} className="input">
            <option value="">Todos</option>
            {ESTADOS_PROPIEDAD.map((e) => (
              <option key={e}>{e}</option>
            ))}
          </select>
        </Campo>
        <Campo label="Propietario">
          <select name="propietario" defaultValue={propietario ?? ""} className="input">
            <option value="">Todos</option>
            {propietarios.map((p) => (
              <option key={p.id} value={p.id}>
                {nombreCompleto(p)}
              </option>
            ))}
          </select>
        </Campo>
        <div className="flex gap-2">
          <button className="btn flex-1">Filtrar</button>
          {hayFiltros && (
            <Link href="/propiedades" className="btn-secondary">
              Limpiar
            </Link>
          )}
        </div>
      </form>

      <p className="mb-3 text-sm text-zinc-500">
        {propiedades.length} {propiedades.length === 1 ? "propiedad" : "propiedades"}
        {hayFiltros && " con los filtros aplicados"}
      </p>

      {propiedades.length === 0 ? (
        <div className="card py-12 text-center text-sm text-zinc-500">
          No hay propiedades para mostrar.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {propiedades.map((p) => (
            <Link
              key={p.id}
              href={`/propiedades/${p.id}`}
              className="card group flex flex-col gap-3 transition hover:border-blue-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                  {p.tipo.descripcion}
                </span>
                <Estado valor={p.estado} />
              </div>
              <div>
                <h3 className="font-semibold group-hover:text-blue-700">{p.direccion}</h3>
                <p className="text-sm text-zinc-500">
                  {p.zona.nombre} · {p.zona.localidad.descripcion}
                </p>
              </div>
              <div className="flex gap-4 text-sm text-zinc-600">
                <span>{p.ambientes} amb.</span>
                <span>{formatNumero(p.superficie)} m²</span>
              </div>
              <div className="mt-auto flex items-end justify-between gap-2 border-t border-zinc-100 pt-3">
                <span className="truncate text-xs text-zinc-500">
                  {nombreCompleto(p.propietario)}
                </span>
                <span className="font-semibold whitespace-nowrap">
                  {formatMoneda(p.precioAlquiler)}
                  <span className="text-xs font-normal text-zinc-500">/mes</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
