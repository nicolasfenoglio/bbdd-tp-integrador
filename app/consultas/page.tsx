import { Suspense } from "react";
import { connection } from "next/server";
import type { ReactNode } from "react";
import { Cargando, Campo, SinDatos, Titulo } from "@/app/components/ui";
import { diasHasta, formatFecha, formatMoneda, hoyUTC } from "@/lib/format";
import { prisma } from "@/lib/prisma";

const PLAZOS = [30, 60, 90, 180];

function Consulta(props: { numero: number; titulo: string; sql: string; children: ReactNode }) {
  return (
    <section className="card mb-6">
      <h2 className="mb-1 text-lg font-semibold">
        {props.numero}. {props.titulo}
      </h2>
      <details className="mb-4">
        <summary className="cursor-pointer text-xs text-zinc-500">Ver SQL</summary>
        <pre className="mt-2 overflow-x-auto rounded-md bg-zinc-900 p-3 font-mono text-xs text-zinc-100">
          {props.sql.trim()}
        </pre>
      </details>
      {props.children}
    </section>
  );
}

const SQL_DISPONIBLES = `
SELECT p.direccion, t.descripcion AS tipo, z.nombre AS zona, l.descripcion AS localidad,
       p.ambientes, p.superficie, p.precio_alquiler
FROM propiedad p
JOIN tipo t      ON t.id = p.id_tipo
JOIN zona z      ON z.id = p.id_zona
JOIN localidad l ON l.id = z.id_localidad
WHERE p.estado = 'Disponible'
  AND p.id_zona = $1            -- solo si se elige una zona
ORDER BY z.nombre, p.precio_alquiler;`;

const SQL_POR_VENCER = `
SELECT c.id, p.direccion, i.apellido, i.nombre, i.telefono, c.fecha_fin, c.mensualidad
FROM contrato c
JOIN propiedad p ON p.id = c.id_propiedad
JOIN inquilino i ON i.id = c.id_inquilino
WHERE c.estado = 'Vigente'
  AND c.fecha_fin BETWEEN CURRENT_DATE AND CURRENT_DATE + $1   -- $1 = días
ORDER BY c.fecha_fin;`;

const SQL_RESUMEN_ZONA = `
SELECT z.nombre AS zona, l.descripcion AS localidad,
       COUNT(p.id)                                        AS total,
       COUNT(p.id) FILTER (WHERE p.estado = 'Disponible') AS disponibles,
       COUNT(p.id) FILTER (WHERE p.estado = 'Alquilada')  AS alquiladas,
       AVG(p.precio_alquiler)                             AS precio_promedio
FROM zona z
JOIN localidad l      ON l.id = z.id_localidad
LEFT JOIN propiedad p ON p.id_zona = z.id
GROUP BY z.id, z.nombre, l.descripcion
ORDER BY l.descripcion, z.nombre;`;

const SQL_INGRESOS = `
SELECT pr.apellido, pr.nombre,
       COUNT(c.id)        AS contratos_vigentes,
       SUM(c.mensualidad) AS ingreso_mensual
FROM propietario pr
JOIN propiedad p ON p.id_propietario = pr.id
JOIN contrato c  ON c.id_propiedad = p.id
WHERE c.estado = 'Vigente'
GROUP BY pr.id, pr.apellido, pr.nombre
ORDER BY ingreso_mensual DESC;`;

type ResumenZona = {
  zona: string;
  localidad: string;
  total: number;
  disponibles: number;
  alquiladas: number;
  precio_promedio: number | null;
};

type IngresoPropietario = {
  apellido: string;
  nombre: string;
  contratos_vigentes: number;
  ingreso_mensual: number;
};

async function Contenido({ searchParams }: PageProps<"/consultas">) {
  await connection();
  const params = await searchParams;
  const zona = typeof params.zona === "string" && params.zona ? Number(params.zona) : undefined;
  const dias = PLAZOS.includes(Number(params.dias)) ? Number(params.dias) : 60;

  const hoy = hoyUTC();
  const limite = new Date(hoy);
  limite.setUTCDate(limite.getUTCDate() + dias);

  const [zonas, disponibles, porVencer, resumenZonas, ingresos] = await Promise.all([
    prisma.zona.findMany({ include: { localidad: true }, orderBy: { nombre: "asc" } }),

    // Consulta 1: propiedades disponibles por zona
    prisma.propiedad.findMany({
      where: { estado: "Disponible", idZona: zona },
      include: { tipo: true, zona: { include: { localidad: true } } },
      orderBy: [{ zona: { nombre: "asc" } }, { precioAlquiler: "asc" }],
    }),

    // Consulta 2: contratos por vencer
    prisma.contrato.findMany({
      where: { estado: "Vigente", fechaFin: { gte: hoy, lte: limite } },
      include: { propiedad: true, inquilino: true },
      orderBy: { fechaFin: "asc" },
    }),

    // Consulta 3: resumen por zona (SQL nativo con GROUP BY)
    prisma.$queryRaw<ResumenZona[]>`
      SELECT z.nombre AS zona, l.descripcion AS localidad,
             COUNT(p.id)::int AS total,
             (COUNT(p.id) FILTER (WHERE p.estado = 'Disponible'))::int AS disponibles,
             (COUNT(p.id) FILTER (WHERE p.estado = 'Alquilada'))::int AS alquiladas,
             AVG(p.precio_alquiler)::float8 AS precio_promedio
      FROM zona z
      JOIN localidad l ON l.id = z.id_localidad
      LEFT JOIN propiedad p ON p.id_zona = z.id
      GROUP BY z.id, z.nombre, l.descripcion
      ORDER BY l.descripcion, z.nombre`,

    // Consulta 4: ingreso mensual por propietario (SQL nativo con JOIN + SUM)
    prisma.$queryRaw<IngresoPropietario[]>`
      SELECT pr.apellido, pr.nombre,
             COUNT(c.id)::int AS contratos_vigentes,
             SUM(c.mensualidad)::float8 AS ingreso_mensual
      FROM propietario pr
      JOIN propiedad p ON p.id_propietario = pr.id
      JOIN contrato c ON c.id_propiedad = p.id
      WHERE c.estado = 'Vigente'
      GROUP BY pr.id, pr.apellido, pr.nombre
      ORDER BY ingreso_mensual DESC`,
  ]);

  return (
    <>
      <Titulo subtitulo="Consultas a la base de datos requeridas por el trabajo práctico.">
        Consultas
      </Titulo>

      <form className="card mb-6 flex flex-wrap items-end gap-3">
        <Campo label="Zona (consulta 1)">
          <select name="zona" defaultValue={zona ?? ""} className="input">
            <option value="">Todas</option>
            {zonas.map((z) => (
              <option key={z.id} value={z.id}>
                {z.nombre} ({z.localidad.descripcion})
              </option>
            ))}
          </select>
        </Campo>
        <Campo label="Vencen en (consulta 2)">
          <select name="dias" defaultValue={dias} className="input">
            {PLAZOS.map((d) => (
              <option key={d} value={d}>
                {d} días
              </option>
            ))}
          </select>
        </Campo>
        <button className="btn">Aplicar</button>
      </form>

      <Consulta numero={1} titulo="Propiedades disponibles por zona" sql={SQL_DISPONIBLES}>
        <div className="overflow-x-auto">
          <table className="tabla">
            <thead>
              <tr>
                <th>Zona</th>
                <th>Dirección</th>
                <th>Tipo</th>
                <th>Amb.</th>
                <th>m²</th>
                <th>Alquiler</th>
              </tr>
            </thead>
            <tbody>
              {disponibles.length === 0 && <SinDatos columnas={6} />}
              {disponibles.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.zona.nombre}
                    <span className="block text-xs text-zinc-400">
                      {p.zona.localidad.descripcion}
                    </span>
                  </td>
                  <td>{p.direccion}</td>
                  <td>{p.tipo.descripcion}</td>
                  <td>{p.ambientes}</td>
                  <td>{Number(p.superficie)}</td>
                  <td>{formatMoneda(p.precioAlquiler)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Consulta>

      <Consulta
        numero={2}
        titulo={`Contratos que vencen en los próximos ${dias} días`}
        sql={SQL_POR_VENCER}
      >
        <div className="overflow-x-auto">
          <table className="tabla">
            <thead>
              <tr>
                <th>#</th>
                <th>Propiedad</th>
                <th>Inquilino</th>
                <th>Teléfono</th>
                <th>Vence</th>
                <th>Restan</th>
                <th>Mensualidad</th>
              </tr>
            </thead>
            <tbody>
              {porVencer.length === 0 && <SinDatos columnas={7} />}
              {porVencer.map((c) => {
                const restan = diasHasta(c.fechaFin!);
                return (
                  <tr key={c.id}>
                    <td className="text-zinc-400">{c.id}</td>
                    <td>{c.propiedad.direccion}</td>
                    <td>
                      {c.inquilino.apellido}, {c.inquilino.nombre}
                    </td>
                    <td>{c.inquilino.telefono ?? "-"}</td>
                    <td>{formatFecha(c.fechaFin)}</td>
                    <td className={restan <= 30 ? "font-medium text-red-600" : ""}>
                      {restan} días
                    </td>
                    <td>{formatMoneda(c.mensualidad)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Consulta>

      <Consulta numero={3} titulo="Resumen de propiedades por zona" sql={SQL_RESUMEN_ZONA}>
        <div className="overflow-x-auto">
          <table className="tabla">
            <thead>
              <tr>
                <th>Zona</th>
                <th>Localidad</th>
                <th>Total</th>
                <th>Disponibles</th>
                <th>Alquiladas</th>
                <th>Alquiler promedio</th>
              </tr>
            </thead>
            <tbody>
              {resumenZonas.length === 0 && <SinDatos columnas={6} />}
              {resumenZonas.map((r) => (
                <tr key={`${r.localidad}-${r.zona}`}>
                  <td>{r.zona}</td>
                  <td>{r.localidad}</td>
                  <td>{r.total}</td>
                  <td>{r.disponibles}</td>
                  <td>{r.alquiladas}</td>
                  <td>{formatMoneda(r.precio_promedio)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Consulta>

      <Consulta
        numero={4}
        titulo="Ingreso mensual por propietario (contratos vigentes)"
        sql={SQL_INGRESOS}
      >
        <div className="overflow-x-auto">
          <table className="tabla">
            <thead>
              <tr>
                <th>Propietario</th>
                <th>Contratos vigentes</th>
                <th>Ingreso mensual</th>
              </tr>
            </thead>
            <tbody>
              {ingresos.length === 0 && <SinDatos columnas={3} />}
              {ingresos.map((r) => (
                <tr key={`${r.apellido}-${r.nombre}`}>
                  <td>
                    {r.apellido}, {r.nombre}
                  </td>
                  <td>{r.contratos_vigentes}</td>
                  <td>{formatMoneda(r.ingreso_mensual)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Consulta>
    </>
  );
}

export default function ConsultasPage(props: PageProps<"/consultas">) {
  return (
    <Suspense fallback={<Cargando />}>
      <Contenido {...props} />
    </Suspense>
  );
}
