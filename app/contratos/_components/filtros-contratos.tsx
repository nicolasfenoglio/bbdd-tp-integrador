import { Campo, FormFiltros, SelectFiltro } from "@/components/ui/formulario";
import type { BusquedaContratos } from "@/lib/data/contratos";
import type { Inquilino } from "@/lib/data/personas";
import { ESTADOS_CONTRATO, nombreCompleto } from "@/lib/format";

/** Barra de filtros del listado de contratos: texto, estado e inquilino. */
export function FiltrosContratos({
  busqueda,
  inquilinos,
  hayFiltros,
}: {
  busqueda: BusquedaContratos;
  inquilinos: Inquilino[];
  hayFiltros: boolean;
}) {
  return (
    <FormFiltros columnas="lg:grid-cols-4" limpiar={hayFiltros ? "/contratos" : undefined}>
      <Campo label="Buscar">
        <input
          name="q"
          type="search"
          defaultValue={busqueda.q}
          placeholder="Dirección o inquilino"
          className="input"
        />
      </Campo>
      <Campo label="Estado">
        <SelectFiltro name="estado" valor={busqueda.estado} todos="Todos">
          {ESTADOS_CONTRATO.map((e) => (
            <option key={e}>{e}</option>
          ))}
        </SelectFiltro>
      </Campo>
      <Campo label="Inquilino">
        <SelectFiltro name="inquilino" valor={busqueda.inquilino} todos="Todos">
          {inquilinos.map((i) => (
            <option key={i.id} value={i.id}>
              {nombreCompleto(i)}
            </option>
          ))}
        </SelectFiltro>
      </Campo>
    </FormFiltros>
  );
}
