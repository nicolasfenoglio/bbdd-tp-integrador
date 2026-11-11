import { Suspense } from "react";
import { crearInquilino, eliminarInquilino } from "@/app/actions";
import { Cargando, CamposPersona, MensajeError, SinDatos, Titulo } from "@/app/components/ui";
import { prisma } from "@/lib/prisma";

async function Contenido({ searchParams }: PageProps<"/inquilinos">) {
  const { error } = await searchParams;
  const inquilinos = await prisma.inquilino.findMany({
    orderBy: [{ apellido: "asc" }, { nombre: "asc" }],
    include: { contratos: { where: { estado: "Vigente" }, select: { id: true } } },
  });

  return (
    <>
      <Titulo subtitulo="Personas que alquilan o alquilaron propiedades.">Inquilinos</Titulo>
      <MensajeError error={typeof error === "string" ? error : undefined} />

      <form action={crearInquilino} className="card mb-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
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
              <th>Contratos vigentes</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {inquilinos.length === 0 && <SinDatos columnas={6} />}
            {inquilinos.map((i) => (
              <tr key={i.id}>
                <td>
                  {i.apellido}, {i.nombre}
                </td>
                <td>{i.documento}</td>
                <td>{i.telefono ?? "-"}</td>
                <td>{i.email ?? "-"}</td>
                <td>{i.contratos.length}</td>
                <td className="text-right">
                  <form action={eliminarInquilino}>
                    <input type="hidden" name="id" value={i.id} />
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

export default function InquilinosPage(props: PageProps<"/inquilinos">) {
  return (
    <Suspense fallback={<Cargando />}>
      <Contenido {...props} />
    </Suspense>
  );
}
