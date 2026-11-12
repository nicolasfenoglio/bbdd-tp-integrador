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
  diasHasta,
  ESTADOS_CONTRATO,
  formatFecha,
  formatMoneda,
  nombreCompleto,
  param,
  paramId,
  textoDias,
} from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Contratos" };

export default function ContratosPage(props: PageProps<"/contratos">) {
  return (
    <>
      <Titulo
        titulo="Contratos"
        subtitulo="Contratos de alquiler entre inquilinos y propiedades."
        acciones={
          <Link href="/contratos/nuevo" className="btn">
            + Nuevo contrato
          </Link>
        }
      />
      <Suspense fallback={<Cargando />}>
        <Contenido {...props} />
      </Suspense>
    </>
  );
}

async function Contenido({ searchParams }: PageProps<"/contratos">) {
  await connection();
  const sp = await searchParams;
  const q = param(sp, "q");
  const estado = param(sp, "estado");
  const inquilino = paramId(sp, "inquilino");
  const hayFiltros = Boolean(q || estado || inquilino);
  const contiene = q ? { contains: q, mode: "insensitive" as const } : undefined;

  const [contratos, inquilinos] = await Promise.all([
    prisma.contrato.findMany({
      where: {
        estado,
        idInquilino: inquilino,
        ...(contiene && {
          OR: [
            { propiedad: { direccion: contiene } },
            { inquilino: { apellido: contiene } },
            { inquilino: { nombre: contiene } },
          ],
        }),
      },
      include: { propiedad: { include: { zona: true } }, inquilino: true },
      orderBy: [{ estado: "desc" }, { fechaFin: "asc" }],
    }),
    prisma.inquilino.findMany({ orderBy: [{ apellido: "asc" }, { nombre: "asc" }] }),
  ]);

  return (
    <>
      <Avisos ok={param(sp, "ok")} error={param(sp, "error")} />

      <form className="card mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
        <Campo label="Buscar">
          <input
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Dirección o inquilino"
            className="input"
          />
        </Campo>
        <Campo label="Estado">
          <select name="estado" defaultValue={estado ?? ""} className="input">
            <option value="">Todos</option>
            {ESTADOS_CONTRATO.map((e) => (
              <option key={e}>{e}</option>
            ))}
          </select>
        </Campo>
        <Campo label="Inquilino">
          <select name="inquilino" defaultValue={inquilino ?? ""} className="input">
            <option value="">Todos</option>
            {inquilinos.map((i) => (
              <option key={i.id} value={i.id}>
                {nombreCompleto(i)}
              </option>
            ))}
          </select>
        </Campo>
        <div className="flex gap-2">
          <button className="btn flex-1">Filtrar</button>
          {hayFiltros && (
            <Link href="/contratos" className="btn-secondary">
              Limpiar
            </Link>
          )}
        </div>
      </form>

      <Tarjeta
        sinPadding
        className="overflow-hidden"
        titulo={`${contratos.length} ${contratos.length === 1 ? "contrato" : "contratos"}`}
      >
        <table className="tabla">
          <thead>
            <tr>
              <th>#</th>
              <th>Propiedad</th>
              <th>Inquilino</th>
              <th>Período</th>
              <th>Mensualidad</th>
              <th>Estado</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {contratos.length === 0 && <FilaVacia columnas={7} />}
            {contratos.map((c) => {
              const restan = c.estado === "Vigente" && c.fechaFin ? diasHasta(c.fechaFin) : null;
              return (
                <tr key={c.id}>
                  <Td l="Contrato" className="text-zinc-400">
                    #{c.id}
                  </Td>
                  <Td l="Propiedad">
                    <div className="text-right md:text-left">
                      <Link href={`/propiedades/${c.propiedad.id}`} className="link">
                        {c.propiedad.direccion}
                      </Link>
                      <span className="block text-xs text-zinc-500">{c.propiedad.zona.nombre}</span>
                    </div>
                  </Td>
                  <Td l="Inquilino">{nombreCompleto(c.inquilino)}</Td>
                  <Td l="Período" className="whitespace-nowrap">
                    <div className="text-right md:text-left">
                      {formatFecha(c.fechaInicio)} – {formatFecha(c.fechaFin)}
                      {restan !== null && (
                        <span
                          className={`block text-xs ${
                            restan < 0
                              ? "font-medium text-red-600"
                              : restan <= 60
                                ? "font-medium text-amber-600"
                                : "text-zinc-500"
                          }`}
                        >
                          {restan < 0 ? textoDias(restan) : `restan ${textoDias(restan)}`}
                        </span>
                      )}
                    </div>
                  </Td>
                  <Td l="Mensualidad">{formatMoneda(c.mensualidad)}</Td>
                  <Td l="Estado">
                    <Estado valor={c.estado} />
                  </Td>
                  <Td>
                    <Link href={`/contratos/${c.id}`} className="btn-secondary btn-sm">
                      Ver
                    </Link>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Tarjeta>
    </>
  );
}
