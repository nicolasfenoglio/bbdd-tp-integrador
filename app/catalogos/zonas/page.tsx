import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { eliminarZona, guardarZona } from "@/app/actions";
import { BotonEnviar } from "@/app/components/botones";
import {
  Avisos,
  Campo,
  Cargando,
  FilaVacia,
  FormConfirmar,
  Tarjeta,
  Td,
} from "@/app/components/ui";
import { param, paramId } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Zonas" };

export default function ZonasPage(props: PageProps<"/catalogos/zonas">) {
  return (
    <Suspense fallback={<Cargando />}>
      <Contenido {...props} />
    </Suspense>
  );
}

async function Contenido({ searchParams }: PageProps<"/catalogos/zonas">) {
  await connection();
  const sp = await searchParams;
  const editarId = paramId(sp, "editar");

  const [zonas, localidades] = await Promise.all([
    prisma.zona.findMany({
      include: { localidad: true, _count: { select: { propiedades: true } } },
      orderBy: [{ localidad: { descripcion: "asc" } }, { nombre: "asc" }],
    }),
    prisma.localidad.findMany({ orderBy: { descripcion: "asc" } }),
  ]);
  const editando = zonas.find((z) => z.id === editarId);

  return (
    <>
      <Avisos ok={param(sp, "ok")} error={param(sp, "error")} />
      <div className="grid items-start gap-6 lg:grid-cols-3">
        <Tarjeta
          sinPadding
          className="overflow-hidden lg:col-span-2"
          titulo={`${zonas.length} zonas`}
          descripcion="Cada zona pertenece a una localidad."
        >
          <table className="tabla">
            <thead>
              <tr>
                <th>Zona</th>
                <th>Localidad</th>
                <th>Descripción</th>
                <th>Propiedades</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {zonas.length === 0 && <FilaVacia columnas={5} />}
              {zonas.map((z) => (
                <tr key={z.id} className={z.id === editarId ? "bg-indigo-50/60" : ""}>
                  <Td l="Zona" className="font-medium">
                    {z.nombre}
                  </Td>
                  <Td l="Localidad">{z.localidad.descripcion}</Td>
                  <Td l="Descripción" className="text-slate-500">
                    {z.descripcion || "-"}
                  </Td>
                  <Td l="Propiedades">
                    <Link href={`/propiedades?zona=${z.id}`} className="link">
                      {z._count.propiedades}
                    </Link>
                  </Td>
                  <Td>
                    <div className="flex justify-end gap-1">
                      <Link href={`?editar=${z.id}#formulario`} className="btn-secondary btn-sm">
                        Editar
                      </Link>
                      <FormConfirmar
                        accion={eliminarZona}
                        id={z.id}
                        mensaje={`¿Eliminar la zona "${z.nombre}"?`}
                      />
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </Tarjeta>

        <Tarjeta
          id="formulario"
          titulo={editando ? `Editar zona #${editando.id}` : "Nueva zona"}
          className="order-first lg:sticky lg:top-20 lg:order-none"
        >
          {localidades.length === 0 ? (
            <p className="text-sm text-slate-500">
              Primero cargá una{" "}
              <Link href="/catalogos/localidades" className="link">
                localidad
              </Link>
              .
            </p>
          ) : (
            <form action={guardarZona} key={editando?.id ?? "nueva"} className="space-y-3">
              {editando && <input type="hidden" name="id" value={editando.id} />}
              <Campo label="Nombre">
                <input name="nombre" required defaultValue={editando?.nombre} className="input" />
              </Campo>
              <Campo label="Localidad">
                <select
                  name="idLocalidad"
                  required
                  defaultValue={editando?.idLocalidad}
                  className="input"
                >
                  {localidades.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.descripcion}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo label="Descripción (opcional)">
                <textarea
                  name="descripcion"
                  rows={2}
                  defaultValue={editando?.descripcion}
                  className="input"
                />
              </Campo>
              <div className="flex gap-2">
                <BotonEnviar>{editando ? "Guardar cambios" : "Crear zona"}</BotonEnviar>
                {editando && (
                  <Link href="/catalogos/zonas" className="btn-secondary">
                    Cancelar
                  </Link>
                )}
              </div>
            </form>
          )}
        </Tarjeta>
      </div>
    </>
  );
}
