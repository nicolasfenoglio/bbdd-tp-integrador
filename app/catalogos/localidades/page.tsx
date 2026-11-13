import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { Avisos } from "@/components/ui/avisos";
import { Cargando } from "@/components/ui/cargando";
import { AccionesFormulario, Campo } from "@/components/ui/formulario";
import { AccionesFila, Tabla, Td } from "@/components/ui/tabla";
import { Tarjeta, TarjetaFormulario } from "@/components/ui/tarjeta";
import { eliminarLocalidad, guardarLocalidad } from "@/lib/actions/catalogos";
import { listarLocalidadesConUso } from "@/lib/data/catalogos";
import { param, paramId } from "@/lib/format";

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

  const localidades = await listarLocalidadesConUso();
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
          <Tabla
            columnas={["Localidad", "Zonas", "Propiedades", ""]}
            vacia={localidades.length === 0}
          >
            {localidades.map((l) => (
              <tr key={l.id} className={l.id === editarId ? "bg-indigo-50/60" : ""}>
                <Td l="Localidad" className="font-medium">
                  {l.descripcion}
                </Td>
                <Td l="Zonas">{l.zonas.length}</Td>
                <Td l="Propiedades">
                  {l.zonas.reduce((total, z) => total + z._count.propiedades, 0)}
                </Td>
                <AccionesFila
                  id={l.id}
                  eliminar={eliminarLocalidad}
                  mensaje={`¿Eliminar la localidad "${l.descripcion}"?`}
                />
              </tr>
            ))}
          </Tabla>
        </Tarjeta>

        <TarjetaFormulario
          titulo={editando ? `Editar localidad #${editando.id}` : "Nueva localidad"}
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
            <AccionesFormulario
              enviar={editando ? "Guardar cambios" : "Crear localidad"}
              cancelar={editando ? "/catalogos/localidades" : undefined}
            />
          </form>
        </TarjetaFormulario>
      </div>
    </>
  );
}
