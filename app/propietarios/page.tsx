import { Suspense } from "react";
import { crearPropietario, eliminarPropietario } from "@/app/actions";
import { Cargando, CamposPersona, MensajeError, SinDatos, Titulo } from "@/app/components/ui";
import { prisma } from "@/lib/prisma";

async function Contenido({ searchParams }: PageProps<"/propietarios">) {
  const { error } = await searchParams;
  const propietarios = await prisma.propietario.findMany({
    orderBy: [{ apellido: "asc" }, { nombre: "asc" }],
    include: { _count: { select: { propiedades: true } } },
  });

  return (
    <>
      <Titulo subtitulo="Dueños de las propiedades administradas.">Propietarios</Titulo>
      <MensajeError error={typeof error === "string" ? error : undefined} />

      <form
        action={crearPropietario}
        className="card mb-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-6"
      >
        <CamposPersona />
        <div className="flex items-end">
          <button className="btn w-full">Agregar</button>
        </div>
      </form>

      <div className="card overflow-x-auto p-0">
        <table className="tabla">
          <thead>
            <tr>
              <th>Apellido y nombre</th>
              <th>Documento</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Propiedades</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {propietarios.length === 0 && <SinDatos columnas={6} />}
            {propietarios.map((p) => (
              <tr key={p.id}>
                <td>
                  {p.apellido}, {p.nombre}
                </td>
                <td>{p.documento}</td>
                <td>{p.telefono ?? "-"}</td>
                <td>{p.email ?? "-"}</td>
                <td>{p._count.propiedades}</td>
                <td className="text-right">
                  <form action={eliminarPropietario}>
                    <input type="hidden" name="id" value={p.id} />
                    <button className="btn-danger">Eliminar</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function PropietariosPage(props: PageProps<"/propietarios">) {
  return (
    <Suspense fallback={<Cargando />}>
      <Contenido {...props} />
    </Suspense>
  );
}
