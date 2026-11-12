import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import {
  Avisos,
  Campo,
  Cargando,
  Estado,
  FilaVacia,
  Tarjeta,
  Td,
  Titulo,
} from "@/app/components/ui";
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
        subtitulo="Registros de la tabla propiedad con su tipo, zona y propietario."
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

      <Tarjeta
        sinPadding
        className="overflow-hidden"
        titulo={`${propiedades.length} ${propiedades.length === 1 ? "propiedad" : "propiedades"}`}
        descripcion={hayFiltros ? "Con los filtros aplicados." : undefined}
      >
        <table className="tabla">
          <thead>
            <tr>
              <th>Dirección</th>
              <th>Tipo</th>
              <th>Zona</th>
              <th>Amb.</th>
              <th>m²</th>
              <th>Alquiler</th>
              <th>Propietario</th>
              <th>Estado</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {propiedades.length === 0 && <FilaVacia columnas={9} />}
            {propiedades.map((p) => (
              <tr key={p.id}>
                <Td l="Dirección">
                  <Link href={`/propiedades/${p.id}`} className="link">
                    {p.direccion}
                  </Link>
                </Td>
                <Td l="Tipo">{p.tipo.descripcion}</Td>
                <Td l="Zona">
                  <div className="text-right md:text-left">
                    {p.zona.nombre}
                    <span className="block text-xs text-slate-400">
                      {p.zona.localidad.descripcion}
                    </span>
                  </div>
                </Td>
                <Td l="Ambientes">{p.ambientes}</Td>
                <Td l="Superficie">{formatNumero(p.superficie)}</Td>
                <Td l="Alquiler" className="whitespace-nowrap">
                  {formatMoneda(p.precioAlquiler)}
                </Td>
                <Td l="Propietario">{nombreCompleto(p.propietario)}</Td>
                <Td l="Estado">
                  <Estado valor={p.estado} />
                </Td>
                <Td>
                  <Link href={`/propiedades/${p.id}`} className="btn-secondary btn-sm">
                    Ver
                  </Link>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Tarjeta>
    </>
  );
}
