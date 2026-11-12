import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { eliminarLocalidad, guardarLocalidad } from "@/app/actions";
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

export const metadata: Metadata = { title: "Localidades" };

export default function LocalidadesPage(props: PageProps<"/catalogos/localidades">) {
  return (
    <Suspense fallback={<Cargando />}>
      <Contenido {...props} />
    </Suspense>
  );
}

async function Contenido({ searchParams }: PageProps<"/catalogos/localidades">) {
  await connection();
  const sp = await searchParams;
  const editarId = paramId(sp, "editar");

  const localidades = await prisma.localidad.findMany({
    include: { zonas: { select: { _count: { select: { propiedades: true } } } } },
    orderBy: { descripcion: "asc" },
  });
  const editando = localidades.find((l) => l.id === editarId);

  return (
    <>
      <Avisos ok={param(sp, "ok")} error={param(sp, "error")} />
      <div className="grid items-start gap-6 lg:grid-cols-3">
        <Tarjeta
          sinPadding
          className="overflow-hidden lg:col-span-2"
          titulo={`${localidades.length} localidades`}
        >
          <table className="tabla">
            <thead>
              <tr>
                <th>Localidad</th>
                <th>Zonas</th>
                <th>Propiedades</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {localidades.length === 0 && <FilaVacia columnas={4} />}
              {localidades.map((l) => (
                <tr key={l.id} className={l.id === editarId ? "bg-indigo-50/60" : ""}>
                  <Td l="Localidad" className="font-medium">
                    {l.descripcion}
                  </Td>
                  <Td l="Zonas">{l.zonas.length}</Td>
                  <Td l="Propiedades">
                    {l.zonas.reduce((total, z) => total + z._count.propiedades, 0)}
                  </Td>
                  <Td>
                    <div className="flex justify-end gap-1">
                      <Link href={`?editar=${l.id}#formulario`} className="btn-secondary btn-sm">
                        Editar
                      </Link>
                      <FormConfirmar
                        accion={eliminarLocalidad}
                        id={l.id}
                        mensaje={`¿Eliminar la localidad "${l.descripcion}"?`}
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
          titulo={editando ? `Editar localidad #${editando.id}` : "Nueva localidad"}
          className="order-first lg:sticky lg:top-20 lg:order-none"
        >
          <form action={guardarLocalidad} key={editando?.id ?? "nueva"} className="space-y-3">
            {editando && <input type="hidden" name="id" value={editando.id} />}
            <Campo label="Nombre">
              <input
                name="descripcion"
                required
                defaultValue={editando?.descripcion}
                className="input"
              />
            </Campo>
            <div className="flex gap-2">
              <BotonEnviar>{editando ? "Guardar cambios" : "Crear localidad"}</BotonEnviar>
              {editando && (
                <Link href="/catalogos/localidades" className="btn-secondary">
                  Cancelar
                </Link>
              )}
            </div>
          </form>
        </Tarjeta>
      </div>
    </>
  );
}
