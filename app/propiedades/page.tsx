import { Suspense } from "react";
import Link from "next/link";
import { cambiarEstadoPropiedad, crearPropiedad, eliminarPropiedad } from "@/app/actions";
import { Cargando, Campo, Estado, MensajeError, SinDatos, Titulo } from "@/app/components/ui";
import { ESTADOS_PROPIEDAD, formatMoneda } from "@/lib/format";
import { prisma } from "@/lib/prisma";

async function Contenido({ searchParams }: PageProps<"/propiedades">) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : undefined;
  const zona = typeof params.zona === "string" && params.zona ? Number(params.zona) : undefined;
  const estado = typeof params.estado === "string" && params.estado ? params.estado : undefined;

  const [propiedades, propietarios, tipos, zonas] = await Promise.all([
    prisma.propiedad.findMany({
      where: { idZona: zona, estado },
      include: { propietario: true, tipo: true, zona: { include: { localidad: true } } },
      orderBy: { id: "asc" },
    }),
    prisma.propietario.findMany({ orderBy: { apellido: "asc" } }),
    prisma.tipo.findMany({ orderBy: { descripcion: "asc" } }),
    prisma.zona.findMany({ include: { localidad: true }, orderBy: { nombre: "asc" } }),
  ]);

  return (
    <>
      <Titulo subtitulo="Inmuebles administrados por la inmobiliaria.">Propiedades</Titulo>
      <MensajeError error={error} />

      <details className="card mb-6">
        <summary className="cursor-pointer text-sm font-medium">Nueva propiedad</summary>
        <form action={crearPropiedad} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Campo label="Dirección">
            <input name="direccion" required className="input" />
          </Campo>
          <Campo label="Superficie (m²)">
            <input name="superficie" type="number" step="0.01" min="0" required className="input" />
          </Campo>
          <Campo label="Ambientes">
            <input name="ambientes" type="number" min="1" required className="input" />
          </Campo>
          <Campo label="Precio de alquiler">
            <input
              name="precioAlquiler"
              type="number"
              step="0.01"
              min="0"
              required
              className="input"
            />
          </Campo>
          <Campo label="Propietario">
            <select name="idPropietario" required className="input">
              {propietarios.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.apellido}, {p.nombre}
                </option>
              ))}
            </select>
          </Campo>
          <Campo label="Tipo">
            <select name="idTipo" required className="input">
              {tipos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.descripcion}
                </option>
              ))}
            </select>
          </Campo>
          <Campo label="Zona">
            <select name="idZona" required className="input">
              {zonas.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.nombre} ({z.localidad.descripcion})
                </option>
              ))}
            </select>
          </Campo>
          <div className="flex items-end">
            <button className="btn w-full">Guardar</button>
          </div>
        </form>
      </details>

      <form className="mb-4 flex flex-wrap items-end gap-3">
        <Campo label="Zona">
          <select name="zona" defaultValue={zona ?? ""} className="input">
            <option value="">Todas</option>
            {zonas.map((z) => (
              <option key={z.id} value={z.id}>
                {z.nombre} ({z.localidad.descripcion})
              </option>
            ))}
          </select>
        </Campo>
        <Campo label="Estado">
          <select name="estado" defaultValue={estado ?? ""} className="input">
            <option value="">Todos</option>
            {ESTADOS_PROPIEDAD.map((e) => (
              <option key={e}>{e}</option>
            ))}
          </select>
        </Campo>
        <button className="btn">Filtrar</button>
        <Link href="/propiedades" className="btn-secondary py-1.5">
          Limpiar
        </Link>
      </form>

      <div className="card overflow-x-auto p-0">
        <table className="tabla">
          <thead>
            <tr>
              <th>Dirección</th>
              <th>Tipo</th>
              <th>Zona</th>
              <th>Amb.</th>
              <th>m²</th>
              <th>Alquiler</th>
              <th>Propietario</th>
              <th>Estado</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {propiedades.length === 0 && <SinDatos columnas={9} />}
            {propiedades.map((p) => (
              <tr key={p.id}>
                <td>{p.direccion}</td>
                <td>{p.tipo.descripcion}</td>
                <td>
                  {p.zona.nombre}
                  <span className="block text-xs text-zinc-400">
                    {p.zona.localidad.descripcion}
                  </span>
                </td>
                <td>{p.ambientes}</td>
                <td>{Number(p.superficie)}</td>
                <td>{formatMoneda(p.precioAlquiler)}</td>
                <td>
                  {p.propietario.apellido}, {p.propietario.nombre}
                </td>
                <td>
                  <form action={cambiarEstadoPropiedad} className="flex items-center gap-1">
                    <input type="hidden" name="id" value={p.id} />
                    {p.estado === "Alquilada" ? (
                      <Estado valor={p.estado} />
                    ) : (
                      <>
                        <select
                          name="estado"
                          defaultValue={p.estado}
                          className="input py-0.5 text-xs"
                        >
                          {ESTADOS_PROPIEDAD.filter((e) => e !== "Alquilada").map((e) => (
                            <option key={e}>{e}</option>
                          ))}
                        </select>
                        <button className="btn-secondary">OK</button>
                      </>
                    )}
                  </form>
                </td>
                <td className="text-right">
                  <form action={eliminarPropiedad}>
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

export default function PropiedadesPage(props: PageProps<"/propiedades">) {
  return (
    <Suspense fallback={<Cargando />}>
      <Contenido {...props} />
    </Suspense>
  );
}
