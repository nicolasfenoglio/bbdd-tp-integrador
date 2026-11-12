import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { eliminarPropietario, guardarPropietario } from "@/app/actions";
import { Contacto, filtroPersona, FormPersona } from "@/app/components/personas";
import {
  Avisos,
  Buscador,
  Cargando,
  FilaVacia,
  FormConfirmar,
  Tarjeta,
  Td,
  Titulo,
} from "@/app/components/ui";
import { nombreCompleto, param, paramId } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Propietarios" };

export default function PropietariosPage(props: PageProps<"/propietarios">) {
  return (
    <>
      <Titulo
        titulo="Propietarios"
        subtitulo="Personas o empresas dueñas de las propiedades registradas."
      />
      <Suspense fallback={<Cargando />}>
        <Contenido {...props} />
      </Suspense>
    </>
  );
}

async function Contenido({ searchParams }: PageProps<"/propietarios">) {
  await connection();
  const sp = await searchParams;
  const q = param(sp, "q");
  const editarId = paramId(sp, "editar");

  const [propietarios, editando] = await Promise.all([
    prisma.propietario.findMany({
      where: filtroPersona(q),
      orderBy: [{ apellido: "asc" }, { nombre: "asc" }],
      include: { propiedades: { select: { estado: true } } },
    }),
    editarId ? prisma.propietario.findUnique({ where: { id: editarId } }) : null,
  ]);

  return (
    <>
      <Avisos ok={param(sp, "ok")} error={param(sp, "error")} />
      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Buscador
            placeholder="Buscar por nombre, documento o email"
            valor={q}
            limpiar="/propietarios"
          />
          <Tarjeta
            sinPadding
            className="overflow-hidden"
            titulo={`${propietarios.length} ${propietarios.length === 1 ? "propietario" : "propietarios"}`}
          >
            <table className="tabla">
              <thead>
                <tr>
                  <th>Propietario</th>
                  <th>Documento</th>
                  <th>Contacto</th>
                  <th>Propiedades</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {propietarios.length === 0 && (
                  <FilaVacia columnas={5} texto={q ? "No hay coincidencias." : undefined} />
                )}
                {propietarios.map((p) => {
                  const alquiladas = p.propiedades.filter((x) => x.estado === "Alquilada").length;
                  return (
                    <tr key={p.id} className={p.id === editarId ? "bg-indigo-50/60" : ""}>
                      <Td l="Propietario" className="font-medium">
                        {nombreCompleto(p)}
                      </Td>
                      <Td l="Documento">{p.documento}</Td>
                      <Td l="Contacto">
                        <Contacto persona={p} />
                      </Td>
                      <Td l="Propiedades">
                        <Link href={`/propiedades?propietario=${p.id}`} className="link">
                          {p.propiedades.length}
                        </Link>
                        {p.propiedades.length > 0 && (
                          <span className="ml-1 text-xs text-slate-500">
                            ({alquiladas} alquiladas)
                          </span>
                        )}
                      </Td>
                      <Td>
                        <div className="flex justify-end gap-1">
                          <Link
                            href={`?editar=${p.id}#formulario`}
                            className="btn-secondary btn-sm"
                          >
                            Editar
                          </Link>
                          <FormConfirmar
                            accion={eliminarPropietario}
                            id={p.id}
                            mensaje={`¿Eliminar a ${nombreCompleto(p)}?`}
                          />
                        </div>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Tarjeta>
        </div>

        <FormPersona
          accion={guardarPropietario}
          editando={editando ?? undefined}
          entidad="propietario"
          ruta="/propietarios"
        />
      </div>
    </>
  );
}
