import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Contacto, FormPersona } from "@/components/personas";
import { Avisos } from "@/components/ui/avisos";
import { Cargando } from "@/components/ui/cargando";
import { Estado } from "@/components/ui/estado";
import { Buscador } from "@/components/ui/formulario";
import { AccionesFila, Tabla, Td } from "@/components/ui/tabla";
import { Tarjeta } from "@/components/ui/tarjeta";
import { Titulo } from "@/components/ui/titulo";
import { eliminarInquilino, guardarInquilino } from "@/lib/actions/personas";
import { buscarInquilinos, obtenerInquilino } from "@/lib/data/personas";
import { nombreCompleto, param, paramId, plural } from "@/lib/format";

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
    buscarInquilinos(q),
    editarId ? obtenerInquilino(editarId) : null,
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
            titulo={plural(inquilinos.length, "inquilino", "inquilinos")}
          >
            <Tabla
              columnas={["Inquilino", "Documento", "Contacto", "Situación", ""]}
              vacia={inquilinos.length === 0}
              textoVacio={q ? "No hay coincidencias." : undefined}
            >
              {inquilinos.map((i) => {
                const vigente = i.contratos.find((c) => c.estado === "Vigente");
                return (
                  <tr key={i.id} className={i.id === editarId ? "bg-indigo-50/60" : ""}>
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
                            <div className="mt-0.5 text-xs text-slate-500">
                              {vigente.propiedad.direccion}
                            </div>
                          </>
                        ) : (
                          <span className="text-xs text-slate-500">Sin contrato vigente</span>
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
                    <AccionesFila
                      id={i.id}
                      eliminar={eliminarInquilino}
                      mensaje={`¿Eliminar a ${nombreCompleto(i)}?`}
                    />
                  </tr>
                );
              })}
            </Tabla>
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
