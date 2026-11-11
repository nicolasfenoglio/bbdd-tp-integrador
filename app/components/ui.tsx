import type { ReactNode } from "react";

export function Titulo({ children, subtitulo }: { children: ReactNode; subtitulo?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold">{children}</h1>
      {subtitulo && <p className="mt-1 text-sm text-zinc-500">{subtitulo}</p>}
    </div>
  );
}

export function Cargando() {
  return <p className="text-sm text-zinc-500">Cargando…</p>;
}

export function MensajeError({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
      {error}
    </div>
  );
}

const coloresEstado: Record<string, string> = {
  Disponible: "bg-green-100 text-green-800",
  Vigente: "bg-green-100 text-green-800",
  Alquilada: "bg-blue-100 text-blue-800",
  Finalizado: "bg-zinc-100 text-zinc-700",
  "No disponible": "bg-zinc-100 text-zinc-700",
  Rescindido: "bg-red-100 text-red-700",
};

export function Estado({ valor }: { valor: string }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${coloresEstado[valor] ?? "bg-zinc-100"}`}
    >
      {valor}
    </span>
  );
}

export function SinDatos({ columnas }: { columnas: number }) {
  return (
    <tr>
      <td colSpan={columnas} className="py-6 text-center text-zinc-400">
        No hay registros.
      </td>
    </tr>
  );
}

export function Campo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
    </label>
  );
}

// Formulario de persona compartido entre Propietarios e Inquilinos.
export function CamposPersona() {
  return (
    <>
      <Campo label="Nombre">
        <input name="nombre" required className="input" />
      </Campo>
      <Campo label="Apellido">
        <input name="apellido" required className="input" />
      </Campo>
      <Campo label="Documento">
        <input name="documento" required className="input" />
      </Campo>
      <Campo label="Teléfono">
        <input name="telefono" className="input" />
      </Campo>
      <Campo label="Email">
        <input name="email" type="email" className="input" />
      </Campo>
    </>
  );
}
