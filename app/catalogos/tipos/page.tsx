import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { eliminarTipo, guardarTipo } from "@/app/actions";
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

export const metadata: Metadata = { title: "Tipos de propiedad" };

export default function TiposPage(props: PageProps<"/catalogos/tipos">) {
  return (
    <Suspense fallback={<Cargando />}>
      <Contenido {...props} />
    </Suspense>
  );
}

async function Contenido({ searchParams }: PageProps<"/catalogos/tipos">) {
  await connection();
  const sp = await searchParams;
  const editarId = paramId(sp, "editar");

  const tipos = await prisma.tipo.findMany({
    include: { _count: { select: { propiedades: true } } },
    orderBy: { descripcion: "asc" },
  });
  const editando = tipos.find((t) => t.id === editarId);

  return (
    <>
      <Avisos ok={param(sp, "ok")} error={param(sp, "error")} />
      <div className="grid items-start gap-6 lg:grid-cols-3">
        <Tarjeta
          sinPadding
          className="overflow-hidden lg:col-span-2"
          titulo={`${tipos.length} tipos`}
        >
          <table className="tabla">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Propiedades</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {tipos.length === 0 && <FilaVacia columnas={3} />}
              {tipos.map((t) => (
                <tr key={t.id} className={t.id === editarId ? "bg-indigo-50/60" : ""}>
                  <Td l="Tipo" className="font-medium">
                    {t.descripcion}
                  </Td>
                  <Td l="Propiedades">
                    <Link href={`/propiedades?tipo=${t.id}`} className="link">
                      {t._count.propiedades}
                    </Link>
                  </Td>
                  <Td>
                    <div className="flex justify-end gap-1">
                      <Link href={`?editar=${t.id}#formulario`} className="btn-secondary btn-sm">
                        Editar
                      </Link>
                      <FormConfirmar
                        accion={eliminarTipo}
                        id={t.id}
                        mensaje={`¿Eliminar el tipo "${t.descripcion}"?`}
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
          titulo={editando ? `Editar tipo #${editando.id}` : "Nuevo tipo"}
          className="order-first lg:sticky lg:top-20 lg:order-none"
        >
          <form action={guardarTipo} key={editando?.id ?? "nuevo"} className="space-y-3">
            {editando && <input type="hidden" name="id" value={editando.id} />}
            <Campo label="Descripción">
              <input
                name="descripcion"
                required
                defaultValue={editando?.descripcion}
                placeholder="Ej.: Departamento"
                className="input"
              />
            </Campo>
            <div className="flex gap-2">
              <BotonEnviar>{editando ? "Guardar cambios" : "Crear tipo"}</BotonEnviar>
              {editando && (
                <Link href="/catalogos/tipos" className="btn-secondary">
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
