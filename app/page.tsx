// Portada: no consulta la base. Los datos se ven entrando a cada sección desde el menú.

const SECCIONES = [
  {
    nombre: "Propiedades",
    descripcion:
      "Alta, modificación y baja de inmuebles. Filtros por zona, tipo, estado y propietario.",
  },
  {
    nombre: "Contratos",
    descripcion: "Registro de alquileres: renovación, finalización y rescisión de contratos.",
  },
  {
    nombre: "Propietarios",
    descripcion: "Dueños de los inmuebles y cantidad de propiedades a su nombre.",
  },
  {
    nombre: "Inquilinos",
    descripcion: "Personas que alquilan, con su situación actual e historial de contratos.",
  },
  {
    nombre: "Catálogos",
    descripcion: "Tablas de referencia: zonas, localidades y tipos de propiedad.",
  },
  {
    nombre: "Consultas",
    descripcion: "Las consultas del trabajo práctico, cada una con su sentencia SQL.",
  },
];

const TABLAS = [
  { nombre: "propiedad", detalle: "→ propietario, tipo, zona" },
  { nombre: "contrato", detalle: "→ propiedad, inquilino" },
  { nombre: "propietario", detalle: "documento y email únicos" },
  { nombre: "inquilino", detalle: "documento y email únicos" },
  { nombre: "zona", detalle: "→ localidad" },
  { nombre: "localidad", detalle: "catálogo" },
  { nombre: "tipo", detalle: "catálogo" },
];

export default function Home() {
  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl bg-slate-900 px-6 py-10 text-white sm:px-10 sm:py-14">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-indigo-500/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 left-1/3 size-72 rounded-full bg-sky-500/10 blur-3xl"
        />
        <div className="relative max-w-2xl">
          <p className="text-xs font-semibold tracking-widest text-indigo-300 uppercase">
            Trabajo Práctico Integrador · Bases de Datos 2026
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Sistema de Gestión Inmobiliaria
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base">
            Aplicación que se conecta a una base de datos PostgreSQL para administrar propiedades,
            propietarios, inquilinos y contratos de alquiler, e incluye consultas sobre propiedades
            disponibles por zona y contratos por vencer.
          </p>
          <p className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm text-slate-200 ring-1 ring-white/10">
            <svg
              viewBox="0 0 24 24"
              className="size-4 shrink-0 text-indigo-300"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Elegí una sección en el menú superior para ver y administrar los datos.
          </p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card lg:col-span-2">
          <h2 className="font-semibold text-slate-900">Secciones</h2>
          <p className="mt-0.5 text-xs text-slate-500">Disponibles en el menú superior.</p>
          <dl className="mt-5 grid gap-x-6 gap-y-5 sm:grid-cols-2">
            {SECCIONES.map((s, i) => (
              <div key={s.nombre} className="flex gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-indigo-50 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-600/10">
                  {i + 1}
                </span>
                <div>
                  <dt className="text-sm font-medium text-slate-900">{s.nombre}</dt>
                  <dd className="mt-0.5 text-sm text-slate-500">{s.descripcion}</dd>
                </div>
              </div>
            ))}
          </dl>
        </section>

        <section className="card">
          <h2 className="font-semibold text-slate-900">Modelo de datos</h2>
          <p className="mt-0.5 text-xs text-slate-500">7 tablas relacionadas en PostgreSQL.</p>
          <ul className="mt-5 divide-y divide-slate-100">
            {TABLAS.map((t) => (
              <li key={t.nombre} className="flex items-baseline justify-between gap-3 py-2">
                <code className="font-mono text-sm font-medium text-slate-800">{t.nombre}</code>
                <span className="text-right text-xs text-slate-500">{t.detalle}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-slate-100 pt-4 text-xs text-slate-500">
            Next.js · Prisma ORM · PostgreSQL · Docker
          </p>
        </section>
      </div>
    </div>
  );
}
