import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Contacto, FormPersona } from "@/components/personas";
import { Avisos } from "@/components/ui/avisos";
import { Cargando } from "@/components/ui/cargando";
import { Buscador } from "@/components/ui/formulario";
import { AccionesFila, Tabla, Td } from "@/components/ui/tabla";
import { Tarjeta } from "@/components/ui/tarjeta";
import { Titulo } from "@/components/ui/titulo";
import { eliminarPropietario, guardarPropietario } from "@/lib/actions/personas";
import { buscarPropietarios, obtenerPropietario } from "@/lib/data/personas";
import { nombreCompleto, param, paramId, plural } from "@/lib/format";

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
    buscarPropietarios(q),
    editarId ? obtenerPropietario(editarId) : null,
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
            titulo={plural(propietarios.length, "propietario", "propietarios")}
          >
            <Tabla
              columnas={["Propietario", "Documento", "Contacto", "Propiedades", ""]}
              vacia={propietarios.length === 0}
              textoVacio={q ? "No hay coincidencias." : undefined}
            >
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
                    <AccionesFila
                      id={p.id}
                      eliminar={eliminarPropietario}
                      mensaje={`¿Eliminar a ${nombreCompleto(p)}?`}
                    />
                  </tr>
                );
              })}
            </Tabla>
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
