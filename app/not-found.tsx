import Link from "next/link";

export default function NotFound() {
  return (
    <div className="card mx-auto max-w-md py-10 text-center">
      <p className="text-4xl font-semibold text-slate-300">404</p>
      <h1 className="mt-2 text-lg font-semibold">No encontramos lo que buscás</h1>
      <p className="mt-1 text-sm text-slate-500">El registro no existe o fue eliminado.</p>
      <Link href="/" className="btn mt-5">
        Volver al inicio
      </Link>
    </div>
  );
}
