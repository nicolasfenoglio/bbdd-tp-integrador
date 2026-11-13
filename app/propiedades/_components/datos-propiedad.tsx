import Link from "next/link";
import { ContactoFicha } from "@/components/personas";
import { Dato } from "@/components/ui/dato";
import { Estado } from "@/components/ui/estado";
import { Tarjeta } from "@/components/ui/tarjeta";
import type { PropiedadDetalle } from "@/lib/data/propiedades";
import { formatMoneda, formatNumero, nombreCompleto } from "@/lib/format";

/** Ficha con los datos de la propiedad, su ubicación y su propietario. */
export function DatosPropiedad({ propiedad: p }: { propiedad: PropiedadDetalle }) {
  const precioM2 = Number(p.precioAlquiler) / Number(p.superficie);

  return (
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
            <span className="block text-xs text-slate-500">{p.zona.descripcion}</span>
          )}
        </Dato>
        <Dato etiqueta="Localidad">{p.zona.localidad.descripcion}</Dato>
        <Dato etiqueta="Propietario">
          <Link href={`/propietarios?editar=${p.propietario.id}#formulario`} className="link">
            {nombreCompleto(p.propietario)}
          </Link>
        </Dato>
        <Dato etiqueta="Contacto del propietario">
          <ContactoFicha persona={p.propietario} />
        </Dato>
      </dl>
    </Tarjeta>
  );
}
