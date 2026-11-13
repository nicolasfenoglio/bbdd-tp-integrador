const CONSULTAS = [
  { id: "c1", titulo: "Propiedades disponibles por zona" },
  { id: "c2", titulo: "Contratos por vencer" },
  { id: "c3", titulo: "Resumen por zona" },
  { id: "c4", titulo: "Ingreso por propietario" },
  { id: "c5", titulo: "Contratos vencidos sin cerrar" },
];

/** Accesos rápidos a cada consulta de la página. */
export function IndiceConsultas() {
  return (
    <nav className="mb-6 flex flex-wrap gap-2">
      {CONSULTAS.map((c, i) => (
        <a key={c.id} href={`#${c.id}`} className="btn-secondary btn-sm rounded-full">
          {i + 1}. {c.titulo}
        </a>
      ))}
    </nav>
  );
}
