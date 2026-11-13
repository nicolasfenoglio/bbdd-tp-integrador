import { Campo, FormFiltros, SelectFiltro } from "@/components/ui/formulario";
import type { Tipo, ZonaConLocalidad } from "@/lib/data/catalogos";
import type { Propietario } from "@/lib/data/personas";
import type { BusquedaPropiedades } from "@/lib/data/propiedades";
import { ESTADOS_PROPIEDAD, nombreCompleto } from "@/lib/format";

/** Barra de filtros del listado de propiedades: dirección, zona, tipo, estado y propietario. */
export function FiltrosPropiedades({
  busqueda,
  zonas,
  tipos,
  propietarios,
  hayFiltros,
}: {
  busqueda: BusquedaPropiedades;
  zonas: ZonaConLocalidad[];
  tipos: Tipo[];
  propietarios: Propietario[];
  hayFiltros: boolean;
}) {
  return (
    <FormFiltros columnas="lg:grid-cols-6" limpiar={hayFiltros ? "/propiedades" : undefined}>
      <Campo label="Dirección" className="sm:col-span-2 lg:col-span-1">
        <input
          name="q"
          type="search"
          defaultValue={busqueda.q}
          placeholder="Buscar…"
          className="input"
        />
      </Campo>
      <Campo label="Zona">
        <SelectFiltro name="zona" valor={busqueda.zona} todos="Todas">
          {zonas.map((z) => (
            <option key={z.id} value={z.id}>
              {z.nombre} ({z.localidad.descripcion})
            </option>
          ))}
        </SelectFiltro>
      </Campo>
      <Campo label="Tipo">
        <SelectFiltro name="tipo" valor={busqueda.tipo} todos="Todos">
          {tipos.map((t) => (
            <option key={t.id} value={t.id}>
              {t.descripcion}
            </option>
          ))}
        </SelectFiltro>
      </Campo>
      <Campo label="Estado">
        <SelectFiltro name="estado" valor={busqueda.estado} todos="Todos">
          {ESTADOS_PROPIEDAD.map((e) => (
            <option key={e}>{e}</option>
          ))}
        </SelectFiltro>
      </Campo>
      <Campo label="Propietario">
        <SelectFiltro name="propietario" valor={busqueda.propietario} todos="Todos">
          {propietarios.map((p) => (
            <option key={p.id} value={p.id}>
              {nombreCompleto(p)}
            </option>
          ))}
        </SelectFiltro>
      </Campo>
    </FormFiltros>
  );
}
