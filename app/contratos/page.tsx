import { Suspense } from "react";
import { crearContrato, eliminarContrato, finalizarContrato } from "@/app/actions";
import { Cargando, Campo, Estado, MensajeError, SinDatos, Titulo } from "@/app/components/ui";
import { formatFecha, formatMoneda } from "@/lib/format";
import { prisma } from "@/lib/prisma";

async function Contenido({ searchParams }: PageProps<"/contratos">) {
  const { error } = await searchParams;

  const [contratos, disponibles, inquilinos] = await Promise.all([
    prisma.contrato.findMany({
      include: { propiedad: { include: { zona: true } }, inquilino: true },
      orderBy: [{ estado: "desc" }, { fechaInicio: "desc" }],
    }),
    prisma.propiedad.findMany({
      where: { estado: "Disponible" },
      include: { zona: true },
      orderBy: { direccion: "asc" },
    }),
    prisma.inquilino.findMany({ orderBy: { apellido: "asc" } }),
  ]);

  return (
    <>
      <Titulo subtitulo="Contratos de alquiler entre inquilinos y propiedades.">Contratos</Titulo>
      <MensajeError error={typeof error === "string" ? error : undefined} />

      <details className="card mb-6">
        <summary className="cursor-pointer text-sm font-medium">Nuevo contrato</summary>
        {disponibles.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">
            No hay propiedades disponibles para alquilar.
          </p>
        ) : (
          <form action={crearContrato} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Campo label="Propiedad (disponibles)">
              <select name="idPropiedad" required className="input">
                {disponibles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.direccion} – {p.zona.nombre} ({formatMoneda(p.precioAlquiler)})
                  </option>
                ))}
              </select>
            </Campo>
            <Campo label="Inquilino">
              <select name="idInquilino" required className="input">
                {inquilinos.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.apellido}, {i.nombre}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo label="Fecha de inicio">
              <input name="fechaInicio" type="date" required className="input" />
            </Campo>
            <Campo label="Fecha de fin">
              <input name="fechaFin" type="date" className="input" />
            </Campo>
            <Campo label="Mensualidad (vacío = precio de la propiedad)">
              <input name="mensualidad" type="number" step="0.01" min="0" className="input" />
            </Campo>
            <Campo label="Depósito">
              <input name="deposito" type="number" step="0.01" min="0" className="input" />
            </Campo>
            <div className="flex items-end">
              <button className="btn w-full">Crear contrato</button>
            </div>
          </form>
        )}
      </details>

      <div className="card overflow-x-auto p-0">
        <table className="tabla">
          <thead>
            <tr>
              <th>#</th>
              <th>Propiedad</th>
              <th>Inquilino</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Mensualidad</th>
              <th>Depósito</th>
              <th>Estado</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {contratos.length === 0 && <SinDatos columnas={9} />}
            {contratos.map((c) => (
              <tr key={c.id}>
                <td className="text-zinc-400">{c.id}</td>
                <td>
                  {c.propiedad.direccion}
                  <span className="block text-xs text-zinc-400">{c.propiedad.zona.nombre}</span>
                </td>
                <td>
                  {c.inquilino.apellido}, {c.inquilino.nombre}
                </td>
                <td>{formatFecha(c.fechaInicio)}</td>
                <td>{formatFecha(c.fechaFin)}</td>
                <td>{formatMoneda(c.mensualidad)}</td>
                <td>{formatMoneda(c.deposito)}</td>
                <td>
                  <Estado valor={c.estado} />
                </td>
                <td>
                  <div className="flex justify-end gap-1">
                    {c.estado === "Vigente" && (
                      <>
                        <form action={finalizarContrato}>
                          <input type="hidden" name="id" value={c.id} />
                          <input type="hidden" name="estado" value="Finalizado" />
                          <button className="btn-secondary">Finalizar</button>
                        </form>
                        <form action={finalizarContrato}>
                          <input type="hidden" name="id" value={c.id} />
                          <input type="hidden" name="estado" value="Rescindido" />
                          <button className="btn-secondary">Rescindir</button>
                        </form>
                      </>
                    )}
                    <form action={eliminarContrato}>
                      <input type="hidden" name="id" value={c.id} />
                      <button className="btn-danger">Eliminar</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function ContratosPage(props: PageProps<"/contratos">) {
  return (
    <Suspense fallback={<Cargando />}>
      <Contenido {...props} />
    </Suspense>
  );
}
