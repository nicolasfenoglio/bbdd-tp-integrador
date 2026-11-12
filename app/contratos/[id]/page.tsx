import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import {
  actualizarContrato,
  cerrarContrato,
  eliminarContrato,
  renovarContrato,
} from "@/app/actions";
import { BotonEnviar } from "@/app/components/botones";
import {
  Avisos,
  Campo,
  Cargando,
  Dato,
  Estado,
  FormConfirmar,
  Tarjeta,
  Titulo,
} from "@/app/components/ui";
import {
  diasHasta,
  fechaInput,
  formatFecha,
  formatMoneda,
  nombreCompleto,
  param,
  textoDias,
} from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Contrato" };

export default function ContratoPage(props: PageProps<"/contratos/[id]">) {
  return (
    <Suspense fallback={<Cargando />}>
      <Contenido {...props} />
    </Suspense>
  );
}

async function Contenido({ params, searchParams }: PageProps<"/contratos/[id]">) {
  await connection();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const idContrato = Number(id);
  if (!Number.isInteger(idContrato) || idContrato <= 0) notFound();

  const c = await prisma.contrato.findUnique({
    where: { id: idContrato },
    include: {
      inquilino: true,
      propiedad: {
        include: { propietario: true, tipo: true, zona: { include: { localidad: true } } },
      },
    },
  });
  if (!c) notFound();

  const vigente = c.estado === "Vigente";
  const restan = vigente && c.fechaFin ? diasHasta(c.fechaFin) : null;
  const duracionMeses = c.fechaFin
    ? Math.round((c.fechaFin.getTime() - c.fechaInicio.getTime()) / (86_400_000 * 30.44))
    : null;

  return (
    <>
      <Titulo
        titulo={`Contrato #${c.id}`}
        subtitulo={`${c.propiedad.direccion} · ${nombreCompleto(c.inquilino)}`}
        volver={{ href: "/contratos", label: "Contratos" }}
        acciones={
          <FormConfirmar
            accion={eliminarContrato}
            id={c.id}
            mensaje={`¿Eliminar el contrato #${c.id}? Se borra del historial${vigente ? " y la propiedad vuelve a quedar Disponible" : ""}.`}
            className="btn-secondary text-red-600"
          >
            Eliminar
          </FormConfirmar>
        }
      />
      <Avisos ok={param(sp, "ok")} error={param(sp, "error")} />

      {restan !== null && restan <= 60 && (
        <div
          className={`mb-5 rounded-lg border px-4 py-3 text-sm ${
            restan < 0
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-amber-200 bg-amber-50 text-amber-800"
          }`}
        >
          {restan < 0
            ? `Este contrato ${textoDias(restan)} y sigue figurando como vigente. Renovalo o finalizalo.`
            : `Este contrato vence en ${textoDias(restan)}.`}
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Tarjeta titulo="Resumen" acciones={<Estado valor={c.estado} />}>
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Dato etiqueta="Mensualidad">
                <span className="text-base font-semibold">{formatMoneda(c.mensualidad)}</span>
              </Dato>
              <Dato etiqueta="Depósito">{formatMoneda(c.deposito)}</Dato>
              <Dato etiqueta="Duración">
                {duracionMeses !== null ? `${duracionMeses} meses` : "Sin fecha de fin"}
              </Dato>
              <Dato etiqueta="Inicio">{formatFecha(c.fechaInicio)}</Dato>
              <Dato etiqueta="Fin">{formatFecha(c.fechaFin)}</Dato>
              <Dato etiqueta="Días restantes">
                {restan === null ? "-" : restan < 0 ? textoDias(restan) : restan}
              </Dato>
            </dl>
          </Tarjeta>

          <div className="grid gap-6 sm:grid-cols-2">
            <Tarjeta titulo="Propiedad">
              <dl className="space-y-3">
                <Dato etiqueta="Dirección">
                  <Link href={`/propiedades/${c.propiedad.id}`} className="link">
                    {c.propiedad.direccion}
                  </Link>
                </Dato>
                <Dato etiqueta="Tipo y zona">
                  {c.propiedad.tipo.descripcion} · {c.propiedad.zona.nombre},{" "}
                  {c.propiedad.zona.localidad.descripcion}
                </Dato>
                <Dato etiqueta="Propietario">{nombreCompleto(c.propiedad.propietario)}</Dato>
              </dl>
            </Tarjeta>
            <Tarjeta titulo="Inquilino">
              <dl className="space-y-3">
                <Dato etiqueta="Nombre">
                  <Link href={`/inquilinos?editar=${c.inquilino.id}#formulario`} className="link">
                    {nombreCompleto(c.inquilino)}
                  </Link>
                </Dato>
                <Dato etiqueta="Documento">{c.inquilino.documento}</Dato>
                <Dato etiqueta="Contacto">
                  {c.inquilino.telefono ?? "-"}
                  {c.inquilino.email && (
                    <span className="block text-xs text-zinc-500">{c.inquilino.email}</span>
                  )}
                </Dato>
              </dl>
            </Tarjeta>
          </div>

          <Tarjeta titulo="Editar datos del contrato">
            <form action={actualizarContrato} className="grid gap-3 sm:grid-cols-2">
              <input type="hidden" name="id" value={c.id} />
              <Campo label="Fecha de inicio">
                <input
                  name="fechaInicio"
                  type="date"
                  required
                  defaultValue={fechaInput(c.fechaInicio)}
                  className="input"
                />
              </Campo>
              <Campo label="Fecha de fin">
                <input
                  name="fechaFin"
                  type="date"
                  defaultValue={fechaInput(c.fechaFin)}
                  className="input"
                />
              </Campo>
              <Campo label="Mensualidad ($)">
                <input
                  name="mensualidad"
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  defaultValue={c.mensualidad.toString()}
                  className="input"
                />
              </Campo>
              <Campo label="Depósito ($)">
                <input
                  name="deposito"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  defaultValue={c.deposito.toString()}
                  className="input"
                />
              </Campo>
              <div className="sm:col-span-2">
                <BotonEnviar>Guardar cambios</BotonEnviar>
              </div>
            </form>
          </Tarjeta>
        </div>

        <div className="space-y-6 lg:sticky lg:top-20">
          {vigente ? (
            <>
              <Tarjeta titulo="Renovar" descripcion="Extiende la fecha de fin del contrato.">
                <form action={renovarContrato} className="space-y-3">
                  <input type="hidden" name="id" value={c.id} />
                  <Campo label="Extender">
                    <select name="meses" defaultValue="12" className="input">
                      {[6, 12, 24, 36].map((m) => (
                        <option key={m} value={m}>
                          {m} meses
                        </option>
                      ))}
                    </select>
                  </Campo>
                  <Campo label="Nueva mensualidad ($)" ayuda="Vacío = mantiene la actual.">
                    <input name="mensualidad" type="number" step="0.01" min="1" className="input" />
                  </Campo>
                  <BotonEnviar className="btn w-full">Renovar contrato</BotonEnviar>
                </form>
              </Tarjeta>
              <Tarjeta
                titulo="Cerrar contrato"
                descripcion="La propiedad vuelve a quedar Disponible."
              >
                <div className="grid gap-2">
                  <FormConfirmar
                    accion={cerrarContrato}
                    id={c.id}
                    extra={{ estado: "Finalizado" }}
                    mensaje="¿Finalizar el contrato? La propiedad quedará Disponible."
                    className="btn-secondary w-full"
                  >
                    Finalizar
                  </FormConfirmar>
                  <FormConfirmar
                    accion={cerrarContrato}
                    id={c.id}
                    extra={{ estado: "Rescindido" }}
                    mensaje="¿Rescindir el contrato? La fecha de fin pasa a ser hoy y la propiedad quedará Disponible."
                    className="btn-secondary w-full text-red-600"
                  >
                    Rescindir
                  </FormConfirmar>
                </div>
              </Tarjeta>
            </>
          ) : (
            <Tarjeta titulo="Contrato cerrado">
              <p className="text-sm text-zinc-600">
                Este contrato está <strong>{c.estado.toLowerCase()}</strong>. Para volver a alquilar
                la propiedad creá un contrato nuevo.
              </p>
              {c.propiedad.estado === "Disponible" && (
                <Link
                  href={`/contratos/nuevo?propiedad=${c.propiedad.id}`}
                  className="btn mt-3 w-full"
                >
                  Nuevo contrato para esta propiedad
                </Link>
              )}
            </Tarjeta>
          )}
        </div>
      </div>
    </>
  );
}
