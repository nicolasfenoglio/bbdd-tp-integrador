import Link from "next/link";
import { ContactoFicha } from "@/components/personas";
import { Dato } from "@/components/ui/dato";
import { Tarjeta } from "@/components/ui/tarjeta";
import type { ContratoDetalle } from "@/lib/data/contratos";
import { nombreCompleto } from "@/lib/format";

/** Las dos partes del contrato: la propiedad (con su propietario) y el inquilino. */
export function PartesContrato({ contrato: c }: { contrato: ContratoDetalle }) {
  return (
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
            <ContactoFicha persona={c.inquilino} />
          </Dato>
        </dl>
      </Tarjeta>
    </div>
  );
}
