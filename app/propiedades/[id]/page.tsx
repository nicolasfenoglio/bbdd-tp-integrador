import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { eliminarPropiedad } from "@/app/actions";
import {
  Avisos,
  Cargando,
  Dato,
  Estado,
  FilaVacia,
  FormConfirmar,
  Tarjeta,
  Td,
  Titulo,
} from "@/app/components/ui";
import { formatFecha, formatMoneda, formatNumero, nombreCompleto, param } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { FormPropiedad, opcionesPropiedad } from "../form-propiedad";

export const metadata: Metadata = { title: "Propiedad" };

export default function PropiedadPage(props: PageProps<"/propiedades/[id]">) {
  return (
    <Suspense fallback={<Cargando />}>
      <Contenido {...props} />
    </Suspense>
  );
}

async function Contenido({ params, searchParams }: PageProps<"/propiedades/[id]">) {
  await connection();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const idPropiedad = Number(id);
  if (!Number.isInteger(idPropiedad) || idPropiedad <= 0) notFound();

  const [propiedad, opciones] = await Promise.all([
    prisma.propiedad.findUnique({
      where: { id: idPropiedad },
      include: {
        propietario: true,
        tipo: true,
        zona: { include: { localidad: true } },
        contratos: { include: { inquilino: true }, orderBy: { fechaInicio: "desc" } },
      },
    }),
    opcionesPropiedad(),
  ]);
  if (!propiedad) notFound();

  const p = propiedad;
  const precioM2 = Number(p.precioAlquiler) / Number(p.superficie);

  return (
    <>
      <Titulo
        titulo={p.direccion}
        subtitulo={`${p.tipo.descripcion} · ${p.zona.nombre}, ${p.zona.localidad.descripcion}`}
        volver={{ href: "/propiedades", label: "Propiedades" }}
        acciones={
          <>
            {p.estado === "Disponible" && (
              <Link href={`/contratos/nuevo?propiedad=${p.id}`} className="btn">
                + Nuevo contrato
              </Link>
            )}
            <FormConfirmar
              accion={eliminarPropiedad}
              id={p.id}
              mensaje={`¿Eliminar la propiedad "${p.direccion}"?`}
              className="btn-secondary text-red-600"
            >
              Eliminar
            </FormConfirmar>
          </>
        }
      />
      <Avisos ok={param(sp, "ok")} error={param(sp, "error")} />

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Tarjeta titulo="Datos de la propiedad" acciones={<Estado valor={p.estado} />}>
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Dato etiqueta="Alquiler mensual">
                <span className="text-base font-semibold">{formatMoneda(p.precioAlquiler)}</span>
              </Dato>
              <Dato etiqueta="Superficie">{formatNumero(p.superficie)} m²</Dato>
              <Dato etiqueta="Ambientes">{p.ambientes}</Dato>
              <Dato etiqueta="Precio por m²">{formatMoneda(precioM2)}</Dato>
              <Dato etiqueta="Zona">
                {p.zona.nombre}
                {p.zona.descripcion && (
                  <span className="block text-xs text-zinc-500">{p.zona.descripcion}</span>
                )}
              </Dato>
              <Dato etiqueta="Localidad">{p.zona.localidad.descripcion}</Dato>
              <Dato etiqueta="Propietario">
                <Link href={`/propietarios?editar=${p.propietario.id}#formulario`} className="link">
                  {nombreCompleto(p.propietario)}
                </Link>
              </Dato>
              <Dato etiqueta="Contacto del propietario">
                {p.propietario.telefono ?? "-"}
                {p.propietario.email && (
                  <span className="block text-xs text-zinc-500">{p.propietario.email}</span>
                )}
              </Dato>
            </dl>
          </Tarjeta>

          <Tarjeta
            sinPadding
            className="overflow-hidden"
            titulo="Historial de contratos"
            descripcion={`${p.contratos.length} ${p.contratos.length === 1 ? "contrato" : "contratos"}`}
          >
            <table className="tabla">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Inquilino</th>
                  <th>Período</th>
                  <th>Mensualidad</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {p.contratos.length === 0 && (
                  <FilaVacia columnas={5} texto="Esta propiedad todavía no tuvo contratos." />
                )}
                {p.contratos.map((c) => (
                  <tr key={c.id}>
                    <Td l="Contrato">
                      <Link href={`/contratos/${c.id}`} className="link">
                        #{c.id}
                      </Link>
                    </Td>
                    <Td l="Inquilino">{nombreCompleto(c.inquilino)}</Td>
                    <Td l="Período">
                      {formatFecha(c.fechaInicio)} – {formatFecha(c.fechaFin)}
                    </Td>
                    <Td l="Mensualidad">{formatMoneda(c.mensualidad)}</Td>
                    <Td l="Estado">
                      <Estado valor={c.estado} />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Tarjeta>
        </div>

        <Tarjeta titulo="Editar propiedad" className="lg:sticky lg:top-20">
          <FormPropiedad
            propiedad={p}
            opciones={opciones}
            columnas="sm:grid-cols-2 lg:grid-cols-1"
          />
        </Tarjeta>
      </div>
    </>
  );
}
