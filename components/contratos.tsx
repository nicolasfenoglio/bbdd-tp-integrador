import Link from "next/link";

/** Número de contrato con enlace a su ficha (#12). */
export function EnlaceContrato({ id }: { id: number }) {
  return (
    <Link href={`/contratos/${id}`} className="link">
      #{id}
    </Link>
  );
}
