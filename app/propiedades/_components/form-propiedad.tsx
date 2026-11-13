import Link from "next/link";
import { AccionesFormulario, Campo } from "@/components/ui/formulario";
import { guardarPropiedad } from "@/lib/actions/propiedades";
import type { OpcionesPropiedad } from "@/lib/data/propiedades";

type PropiedadEditable = {
  id: number;
  direccion: string;
  superficie: { toString(): string };
  ambientes: number;
  precioAlquiler: { toString(): string };
  estado: string;
  idPropietario: number;
  idTipo: number;
  idZona: number;
};

/** Alta (sin `propiedad`) o edición de una propiedad. Las opciones salen de opcionesPropiedad(). */
export function FormPropiedad({
  propiedad,
  opciones,
  propietarioInicial,
  cancelar,
  columnas = "sm:grid-cols-2",
}: {
  propiedad?: PropiedadEditable;
  opciones: OpcionesPropiedad;
  propietarioInicial?: number;
  cancelar?: string;
  columnas?: string;
}) {
  const { propietarios, tipos, localidades } = opciones;
  const alquilada = propiedad?.estado === "Alquilada";
  const faltan = [
    propietarios.length === 0 && { href: "/propietarios", label: "un propietario" },
    tipos.length === 0 && { href: "/catalogos/tipos", label: "un tipo de propiedad" },
    localidades.every((l) => l.zonas.length === 0) && {
      href: "/catalogos/zonas",
      label: "una zona",
    },
  ].filter((x): x is { href: string; label: string } => Boolean(x));

  if (faltan.length > 0)
    return (
      <p className="text-sm text-slate-600">
        Para cargar propiedades primero necesitás{" "}
        {faltan.map((f, i) => (
          <span key={f.href}>
            {i > 0 && ", "}
            <Link href={f.href} className="link">
              {f.label}
            </Link>
          </span>
        ))}
        .
      </p>
    );

  return (
    <form action={guardarPropiedad} className={`grid gap-3 ${columnas}`}>
      {propiedad && <input type="hidden" name="id" value={propiedad.id} />}
      <Campo label="Dirección" className="sm:col-span-full">
        <input
          name="direccion"
          required
          defaultValue={propiedad?.direccion}
          placeholder="Calle, número, piso y depto."
          className="input"
        />
      </Campo>
      <Campo label="Tipo">
        <select name="idTipo" required defaultValue={propiedad?.idTipo} className="input">
          {tipos.map((t) => (
            <option key={t.id} value={t.id}>
              {t.descripcion}
            </option>
          ))}
        </select>
      </Campo>
      <Campo label="Zona">
        <select name="idZona" required defaultValue={propiedad?.idZona} className="input">
          {localidades
            .filter((l) => l.zonas.length > 0)
            .map((l) => (
              <optgroup key={l.id} label={l.descripcion}>
                {l.zonas.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.nombre}
                  </option>
                ))}
              </optgroup>
            ))}
        </select>
      </Campo>
      <Campo label="Superficie (m²)">
        <input
          name="superficie"
          type="number"
          step="0.01"
          min="1"
          required
          defaultValue={propiedad?.superficie.toString()}
          className="input"
        />
      </Campo>
      <Campo label="Ambientes">
        <input
          name="ambientes"
          type="number"
          min="1"
          max="50"
          required
          defaultValue={propiedad?.ambientes}
          className="input"
        />
      </Campo>
      <Campo label="Precio de alquiler mensual ($)">
        <input
          name="precioAlquiler"
          type="number"
          step="0.01"
          min="1"
          required
          defaultValue={propiedad?.precioAlquiler.toString()}
          className="input"
        />
      </Campo>
      <Campo label="Propietario">
        <select
          name="idPropietario"
          required
          defaultValue={propiedad?.idPropietario ?? propietarioInicial}
          className="input"
        >
          {propietarios.map((p) => (
            <option key={p.id} value={p.id}>
              {p.apellido}, {p.nombre}
            </option>
          ))}
        </select>
      </Campo>
      <Campo
        label="Estado"
        ayuda={alquilada ? "Se libera al finalizar o rescindir el contrato vigente." : undefined}
      >
        {alquilada ? (
          <select disabled className="input">
            <option>Alquilada</option>
          </select>
        ) : (
          <select name="estado" defaultValue={propiedad?.estado ?? "Disponible"} className="input">
            <option>Disponible</option>
            <option>No disponible</option>
          </select>
        )}
      </Campo>
      <AccionesFormulario
        className="flex gap-2 sm:col-span-full"
        enviar={propiedad ? "Guardar cambios" : "Crear propiedad"}
        cancelar={cancelar}
      />
    </form>
  );
}
