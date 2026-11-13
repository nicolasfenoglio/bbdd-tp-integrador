import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Avisos } from "@/components/ui/avisos";
import { Cargando } from "@/components/ui/cargando";
import { AccionesFormulario, Campo } from "@/components/ui/formulario";
import { AccionesFila, Tabla, Td } from "@/components/ui/tabla";
import { Tarjeta, TarjetaFormulario } from "@/components/ui/tarjeta";
import { eliminarZona, guardarZona } from "@/lib/actions/catalogos";
import { listarLocalidades, listarZonasConUso } from "@/lib/data/catalogos";
import { param, paramId } from "@/lib/format";

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

  const [zonas, localidades] = await Promise.all([listarZonasConUso(), listarLocalidades()]);
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
          <Tabla
            columnas={["Zona", "Localidad", "Descripción", "Propiedades", ""]}
            vacia={zonas.length === 0}
          >
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
                <AccionesFila
                  id={z.id}
                  eliminar={eliminarZona}
                  mensaje={`¿Eliminar la zona "${z.nombre}"?`}
                />
              </tr>
            ))}
          </Tabla>
        </Tarjeta>

        <TarjetaFormulario titulo={editando ? `Editar zona #${editando.id}` : "Nueva zona"}>
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
              <AccionesFormulario
                enviar={editando ? "Guardar cambios" : "Crear zona"}
                cancelar={editando ? "/catalogos/zonas" : undefined}
              />
            </form>
          )}
        </TarjetaFormulario>
      </div>
    </>
  );
}
