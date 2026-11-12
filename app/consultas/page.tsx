import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { Campo, Cargando, FilaVacia, Td, Titulo } from "@/app/components/ui";
import {
  diasHasta,
  formatFecha,
  formatMoneda,
  formatNumero,
  hoyUTC,
  nombreCompleto,
  paramId,
  sumarDias,
  textoDias,
} from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Consultas" };

const PLAZOS = [30, 60, 90, 180];

const CONSULTAS = [
  { id: "c1", titulo: "Propiedades disponibles por zona" },
  { id: "c2", titulo: "Contratos por vencer" },
  { id: "c3", titulo: "Resumen por zona" },
  { id: "c4", titulo: "Ingreso por propietario" },
  { id: "c5", titulo: "Contratos vencidos sin cerrar" },
];

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

const SQL_VENCIDOS = `
SELECT c.id, p.direccion, i.apellido, i.nombre, c.fecha_fin,
       CURRENT_DATE - c.fecha_fin AS dias_vencido
FROM contrato c
JOIN propiedad p ON p.id = c.id_propiedad
JOIN inquilino i ON i.id = c.id_inquilino
WHERE c.estado = 'Vigente'
  AND c.fecha_fin < CURRENT_DATE
ORDER BY c.fecha_fin;`;

type ResumenZona = {
  id: number;
  zona: string;
  localidad: string;
  total: number;
  disponibles: number;
  alquiladas: number;
  precio_promedio: number | null;
};

type IngresoPropietario = {
  id: number;
  apellido: string;
  nombre: string;
  contratos_vigentes: number;
  ingreso_mensual: number;
};

function Consulta(props: {
  id: string;
  numero: number;
  titulo: string;
  descripcion: string;
  sql: string;
  filtros?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={props.id} className="card mb-6 scroll-mt-20 overflow-hidden p-0 sm:p-0">
      <div className="space-y-3 border-b border-slate-200 px-4 py-4 sm:px-5">
        <div>
          <h2 className="text-lg font-semibold">
            <span className="mr-2 text-slate-400">{props.numero}.</span>
            {props.titulo}
          </h2>
          <p className="text-sm text-slate-500">{props.descripcion}</p>
        </div>
        {props.filtros}
        <details>
          <summary className="cursor-pointer text-xs font-medium text-indigo-700">Ver SQL</summary>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-900 p-3 font-mono text-xs leading-relaxed text-slate-100">
            {props.sql.trim()}
          </pre>
        </details>
      </div>
      {props.children}
    </section>
  );
}

export default function ConsultasPage(props: PageProps<"/consultas">) {
  return (
    <>
      <Titulo
        titulo="Consultas"
        subtitulo="Reportes sobre propiedades y contratos. Cada uno muestra la consulta SQL que lo genera."
      />
      <nav className="mb-6 flex flex-wrap gap-2">
        {CONSULTAS.map((c, i) => (
          <a key={c.id} href={`#${c.id}`} className="btn-secondary btn-sm rounded-full">
            {i + 1}. {c.titulo}
          </a>
        ))}
      </nav>
      <Suspense fallback={<Cargando />}>
        <Contenido {...props} />
      </Suspense>
    </>
  );
}

async function Contenido({ searchParams }: PageProps<"/consultas">) {
  await connection();
  const sp = await searchParams;
  const zona = paramId(sp, "zona");
  const dias = PLAZOS.includes(Number(sp.dias)) ? Number(sp.dias) : 60;

  const hoy = hoyUTC();
  const limite = sumarDias(hoy, dias);

  const [zonas, disponibles, porVencer, resumenZonas, ingresos, vencidos] = await Promise.all([
    prisma.zona.findMany({
      include: { localidad: true },
      orderBy: [{ localidad: { descripcion: "asc" } }, { nombre: "asc" }],
    }),

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
      SELECT z.id, z.nombre AS zona, l.descripcion AS localidad,
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
      SELECT pr.id, pr.apellido, pr.nombre,
             COUNT(c.id)::int AS contratos_vigentes,
             SUM(c.mensualidad)::float8 AS ingreso_mensual
      FROM propietario pr
      JOIN propiedad p ON p.id_propietario = pr.id
      JOIN contrato c ON c.id_propiedad = p.id
      WHERE c.estado = 'Vigente'
      GROUP BY pr.id, pr.apellido, pr.nombre
      ORDER BY ingreso_mensual DESC`,

    // Consulta 5: contratos vigentes cuya fecha de fin ya pasó
    prisma.contrato.findMany({
      where: { estado: "Vigente", fechaFin: { lt: hoy } },
      include: { propiedad: true, inquilino: true },
      orderBy: { fechaFin: "asc" },
    }),
  ]);

  const totalIngresos = ingresos.reduce((t, r) => t + r.ingreso_mensual, 0);

  return (
    <>
      <Consulta
        id="c1"
        numero={1}
        titulo="Propiedades disponibles por zona"
        descripcion="Inmuebles en estado Disponible, ordenados por zona y precio."
        sql={SQL_DISPONIBLES}
        filtros={
          <form className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <input type="hidden" name="dias" value={dias} />
            <Campo label="Zona" className="sm:w-72">
              <select name="zona" defaultValue={zona ?? ""} className="input">
                <option value="">Todas las zonas</option>
                {zonas.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.nombre} ({z.localidad.descripcion})
                  </option>
                ))}
              </select>
            </Campo>
            <button className="btn">Aplicar</button>
          </form>
        }
      >
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
            {disponibles.length === 0 && <FilaVacia columnas={6} />}
            {disponibles.map((p) => (
              <tr key={p.id}>
                <Td l="Zona">
                  {p.zona.nombre}
                  <span className="ml-1 text-xs text-slate-400">
                    {p.zona.localidad.descripcion}
                  </span>
                </Td>
                <Td l="Dirección">
                  <Link href={`/propiedades/${p.id}`} className="link">
                    {p.direccion}
                  </Link>
                </Td>
                <Td l="Tipo">{p.tipo.descripcion}</Td>
                <Td l="Ambientes">{p.ambientes}</Td>
                <Td l="Superficie">{formatNumero(p.superficie)}</Td>
                <Td l="Alquiler" className="font-medium">
                  {formatMoneda(p.precioAlquiler)}
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Consulta>

      <Consulta
        id="c2"
        numero={2}
        titulo={`Contratos que vencen en los próximos ${dias} días`}
        descripcion="Contratos vigentes cuya fecha de fin cae dentro del plazo elegido."
        sql={SQL_POR_VENCER}
        filtros={
          <form action="#c2" className="flex flex-col gap-2 sm:flex-row sm:items-end">
            {zona && <input type="hidden" name="zona" value={zona} />}
            <Campo label="Plazo" className="sm:w-48">
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
        }
      >
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
            {porVencer.length === 0 && <FilaVacia columnas={7} />}
            {porVencer.map((c) => {
              const restan = diasHasta(c.fechaFin!);
              return (
                <tr key={c.id}>
                  <Td l="Contrato">
                    <Link href={`/contratos/${c.id}`} className="link">
                      #{c.id}
                    </Link>
                  </Td>
                  <Td l="Propiedad">{c.propiedad.direccion}</Td>
                  <Td l="Inquilino">{nombreCompleto(c.inquilino)}</Td>
                  <Td l="Teléfono">{c.inquilino.telefono ?? "-"}</Td>
                  <Td l="Vence">{formatFecha(c.fechaFin)}</Td>
                  <Td
                    l="Restan"
                    className={restan <= 30 ? "font-medium text-red-600" : "text-amber-700"}
                  >
                    {textoDias(restan)}
                  </Td>
                  <Td l="Mensualidad">{formatMoneda(c.mensualidad)}</Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Consulta>

      <Consulta
        id="c3"
        numero={3}
        titulo="Resumen de propiedades por zona"
        descripcion="Cantidad de propiedades por estado y alquiler promedio de cada zona (GROUP BY)."
        sql={SQL_RESUMEN_ZONA}
      >
        <table className="tabla">
          <thead>
            <tr>
              <th>Zona</th>
              <th>Localidad</th>
              <th>Total</th>
              <th>Disponibles</th>
              <th>Alquiladas</th>
              <th>Ocupación</th>
              <th>Alquiler promedio</th>
            </tr>
          </thead>
          <tbody>
            {resumenZonas.length === 0 && <FilaVacia columnas={7} />}
            {resumenZonas.map((r) => {
              const ocupacion = r.total ? Math.round((r.alquiladas / r.total) * 100) : 0;
              return (
                <tr key={r.id}>
                  <Td l="Zona" className="font-medium">
                    {r.zona}
                  </Td>
                  <Td l="Localidad">{r.localidad}</Td>
                  <Td l="Total">{r.total}</Td>
                  <Td l="Disponibles">{r.disponibles}</Td>
                  <Td l="Alquiladas">{r.alquiladas}</Td>
                  <Td l="Ocupación">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200">
                        <div className="h-full bg-indigo-600" style={{ width: `${ocupacion}%` }} />
                      </div>
                      <span className="text-xs text-slate-500">{ocupacion}%</span>
                    </div>
                  </Td>
                  <Td l="Alquiler promedio">{formatMoneda(r.precio_promedio)}</Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Consulta>

      <Consulta
        id="c4"
        numero={4}
        titulo="Ingreso mensual por propietario"
        descripcion={`Suma de las mensualidades de contratos vigentes (JOIN + SUM). Total: ${formatMoneda(totalIngresos)}.`}
        sql={SQL_INGRESOS}
      >
        <table className="tabla">
          <thead>
            <tr>
              <th>Propietario</th>
              <th>Contratos vigentes</th>
              <th>Ingreso mensual</th>
              <th>% del total</th>
            </tr>
          </thead>
          <tbody>
            {ingresos.length === 0 && <FilaVacia columnas={4} />}
            {ingresos.map((r) => (
              <tr key={r.id}>
                <Td l="Propietario" className="font-medium">
                  {nombreCompleto(r)}
                </Td>
                <Td l="Contratos vigentes">{r.contratos_vigentes}</Td>
                <Td l="Ingreso mensual">{formatMoneda(r.ingreso_mensual)}</Td>
                <Td l="% del total">
                  {totalIngresos ? Math.round((r.ingreso_mensual / totalIngresos) * 100) : 0}%
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Consulta>

      <Consulta
        id="c5"
        numero={5}
        titulo="Contratos vencidos sin cerrar"
        descripcion="Contratos que siguen Vigentes aunque su fecha de fin ya pasó: hay que renovarlos o finalizarlos."
        sql={SQL_VENCIDOS}
      >
        <table className="tabla">
          <thead>
            <tr>
              <th>#</th>
              <th>Propiedad</th>
              <th>Inquilino</th>
              <th>Venció</th>
              <th>Atraso</th>
            </tr>
          </thead>
          <tbody>
            {vencidos.length === 0 && (
              <FilaVacia columnas={5} texto="No hay contratos vencidos sin cerrar." />
            )}
            {vencidos.map((c) => (
              <tr key={c.id}>
                <Td l="Contrato">
                  <Link href={`/contratos/${c.id}`} className="link">
                    #{c.id}
                  </Link>
                </Td>
                <Td l="Propiedad">{c.propiedad.direccion}</Td>
                <Td l="Inquilino">{nombreCompleto(c.inquilino)}</Td>
                <Td l="Venció">{formatFecha(c.fechaFin)}</Td>
                <Td l="Atraso" className="font-medium text-red-600">
                  {-diasHasta(c.fechaFin!)} días
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Consulta>
    </>
  );
}
