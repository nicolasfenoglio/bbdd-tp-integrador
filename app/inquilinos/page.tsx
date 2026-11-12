import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { eliminarInquilino, guardarInquilino } from "@/app/actions";
import { Contacto, filtroPersona, FormPersona } from "@/app/components/personas";
import {
  Avisos,
  Buscador,
  Cargando,
  Estado,
  FilaVacia,
  FormConfirmar,
  Tarjeta,
  Td,
  Titulo,
} from "@/app/components/ui";
import { nombreCompleto, param, paramId } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Inquilinos" };

export default function InquilinosPage(props: PageProps<"/inquilinos">) {
  return (
    <>
      <Titulo titulo="Inquilinos" subtitulo="Personas que alquilan o alquilaron propiedades." />
      <Suspense fallback={<Cargando />}>
        <Contenido {...props} />
      </Suspense>
    </>
  );
}

async function Contenido({ searchParams }: PageProps<"/inquilinos">) {
  await connection();
  const sp = await searchParams;
  const q = param(sp, "q");
  const editarId = paramId(sp, "editar");

  const [inquilinos, editando] = await Promise.all([
    prisma.inquilino.findMany({
      where: filtroPersona(q),
      orderBy: [{ apellido: "asc" }, { nombre: "asc" }],
      include: {
        contratos: {
          select: { estado: true, propiedad: { select: { direccion: true } } },
          orderBy: { fechaInicio: "desc" },
        },
      },
    }),
    editarId ? prisma.inquilino.findUnique({ where: { id: editarId } }) : null,
  ]);

  return (
    <>
      <Avisos ok={param(sp, "ok")} error={param(sp, "error")} />
      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Buscador
            placeholder="Buscar por nombre, documento o email"
            valor={q}
            limpiar="/inquilinos"
          />
          <Tarjeta
            sinPadding
            className="overflow-hidden"
            titulo={`${inquilinos.length} ${inquilinos.length === 1 ? "inquilino" : "inquilinos"}`}
          >
            <table className="tabla">
              <thead>
                <tr>
                  <th>Inquilino</th>
                  <th>Documento</th>
                  <th>Contacto</th>
                  <th>Situación</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {inquilinos.length === 0 && (
                  <FilaVacia columnas={5} texto={q ? "No hay coincidencias." : undefined} />
                )}
                {inquilinos.map((i) => {
                  const vigente = i.contratos.find((c) => c.estado === "Vigente");
                  return (
                    <tr key={i.id} className={i.id === editarId ? "bg-blue-50/60" : ""}>
                      <Td l="Inquilino" className="font-medium">
                        {nombreCompleto(i)}
                      </Td>
                      <Td l="Documento">{i.documento}</Td>
                      <Td l="Contacto">
                        <Contacto persona={i} />
                      </Td>
                      <Td l="Situación">
                        <div className="text-right md:text-left">
                          {vigente ? (
                            <>
                              <Estado valor="Vigente" />
                              <div className="mt-0.5 text-xs text-zinc-500">
                                {vigente.propiedad.direccion}
                              </div>
                            </>
                          ) : (
                            <span className="text-xs text-zinc-500">Sin contrato vigente</span>
                          )}
                          {i.contratos.length > 0 && (
                            <Link
                              href={`/contratos?inquilino=${i.id}`}
                              className="link mt-0.5 block text-xs"
                            >
                              Ver {i.contratos.length}{" "}
                              {i.contratos.length === 1 ? "contrato" : "contratos"}
                            </Link>
                          )}
                        </div>
                      </Td>
                      <Td>
                        <div className="flex justify-end gap-1">
                          <Link
                            href={`?editar=${i.id}#formulario`}
                            className="btn-secondary btn-sm"
                          >
                            Editar
                          </Link>
                          <FormConfirmar
                            accion={eliminarInquilino}
                            id={i.id}
                            mensaje={`¿Eliminar a ${nombreCompleto(i)}?`}
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
          accion={guardarInquilino}
          editando={editando ?? undefined}
          entidad="inquilino"
          ruta="/inquilinos"
        />
      </div>
    </>
  );
}
