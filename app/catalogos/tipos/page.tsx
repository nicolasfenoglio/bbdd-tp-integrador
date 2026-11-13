import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Avisos } from "@/components/ui/avisos";
import { Cargando } from "@/components/ui/cargando";
import { AccionesFormulario, Campo } from "@/components/ui/formulario";
import { AccionesFila, Tabla, Td } from "@/components/ui/tabla";
import { Tarjeta, TarjetaFormulario } from "@/components/ui/tarjeta";
import { eliminarTipo, guardarTipo } from "@/lib/actions/catalogos";
import { listarTiposConUso } from "@/lib/data/catalogos";
import { param, paramId } from "@/lib/format";

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

  const tipos = await listarTiposConUso();
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
          <Tabla columnas={["Tipo", "Propiedades", ""]} vacia={tipos.length === 0}>
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
                <AccionesFila
                  id={t.id}
                  eliminar={eliminarTipo}
                  mensaje={`¿Eliminar el tipo "${t.descripcion}"?`}
                />
              </tr>
            ))}
          </Tabla>
        </Tarjeta>

        <TarjetaFormulario titulo={editando ? `Editar tipo #${editando.id}` : "Nuevo tipo"}>
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
            <AccionesFormulario
              enviar={editando ? "Guardar cambios" : "Crear tipo"}
              cancelar={editando ? "/catalogos/tipos" : undefined}
            />
          </form>
        </TarjetaFormulario>
      </div>
    </>
  );
}
