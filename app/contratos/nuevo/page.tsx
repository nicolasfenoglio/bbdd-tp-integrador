import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { crearContrato } from "@/app/actions";
import { BotonEnviar } from "@/app/components/botones";
import { Avisos, Campo, Cargando, Tarjeta, Titulo } from "@/app/components/ui";
import {
  fechaInput,
  formatMoneda,
  hoyUTC,
  nombreCompleto,
  param,
  paramId,
  sumarMeses,
} from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Nuevo contrato" };

export default function NuevoContratoPage(props: PageProps<"/contratos/nuevo">) {
  return (
    <>
      <Titulo
        titulo="Nuevo contrato"
        subtitulo="Solo se pueden alquilar propiedades en estado Disponible."
        volver={{ href: "/contratos", label: "Contratos" }}
      />
      <Suspense fallback={<Cargando />}>
        <Contenido {...props} />
      </Suspense>
    </>
  );
}

async function Contenido({ searchParams }: PageProps<"/contratos/nuevo">) {
  await connection();
  const sp = await searchParams;
  const propiedadInicial = paramId(sp, "propiedad");

  const [disponibles, inquilinos] = await Promise.all([
    prisma.propiedad.findMany({
      where: { estado: "Disponible" },
      include: { zona: { include: { localidad: true } }, tipo: true },
      orderBy: [{ zona: { nombre: "asc" } }, { direccion: "asc" }],
    }),
    prisma.inquilino.findMany({ orderBy: [{ apellido: "asc" }, { nombre: "asc" }] }),
  ]);

  const hoy = hoyUTC();

  if (disponibles.length === 0 || inquilinos.length === 0)
    return (
      <Tarjeta className="max-w-3xl">
        <p className="text-sm text-zinc-600">
          {disponibles.length === 0 ? (
            <>
              No hay propiedades disponibles. Podés{" "}
              <Link href="/propiedades/nueva" className="link">
                cargar una nueva
              </Link>{" "}
              o finalizar un contrato vigente.
            </>
          ) : (
            <>
              Primero cargá un{" "}
              <Link href="/inquilinos" className="link">
                inquilino
              </Link>
              .
            </>
          )}
        </p>
      </Tarjeta>
    );

  return (
    <>
      <Avisos error={param(sp, "error")} />
      <Tarjeta className="max-w-3xl">
        <form action={crearContrato} className="grid gap-3 sm:grid-cols-2">
          <Campo label="Propiedad" className="sm:col-span-2">
            <select name="idPropiedad" required defaultValue={propiedadInicial} className="input">
              {disponibles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.direccion} — {p.tipo.descripcion}, {p.zona.nombre} (
                  {p.zona.localidad.descripcion}) · {formatMoneda(p.precioAlquiler)}
                </option>
              ))}
            </select>
          </Campo>
          <Campo label="Inquilino" className="sm:col-span-2">
            <select name="idInquilino" required className="input">
              {inquilinos.map((i) => (
                <option key={i.id} value={i.id}>
                  {nombreCompleto(i)} — DNI {i.documento}
                </option>
              ))}
            </select>
          </Campo>
          <Campo label="Fecha de inicio">
            <input
              name="fechaInicio"
              type="date"
              required
              defaultValue={fechaInput(hoy)}
              className="input"
            />
          </Campo>
          <Campo label="Fecha de fin" ayuda="Vacío = contrato sin fecha de finalización.">
            <input
              name="fechaFin"
              type="date"
              defaultValue={fechaInput(sumarMeses(hoy, 24))}
              className="input"
            />
          </Campo>
          <Campo label="Mensualidad ($)" ayuda="Vacío = precio de alquiler de la propiedad.">
            <input name="mensualidad" type="number" step="0.01" min="1" className="input" />
          </Campo>
          <Campo label="Depósito ($)" ayuda="Vacío = un mes de alquiler.">
            <input name="deposito" type="number" step="0.01" min="0" className="input" />
          </Campo>
          <div className="flex gap-2 sm:col-span-2">
            <BotonEnviar>Crear contrato</BotonEnviar>
            <Link href="/contratos" className="btn-secondary">
              Cancelar
            </Link>
          </div>
        </form>
      </Tarjeta>
    </>
  );
}
