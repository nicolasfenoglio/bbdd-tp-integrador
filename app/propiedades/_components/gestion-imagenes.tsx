import {
  eliminarImagenPropiedad,
  establecerImagenPrincipal,
  moverImagenPropiedad,
  subirImagenPropiedad,
} from "@/lib/actions/propiedades";
import type { PropiedadDetalle } from "@/lib/data/propiedades";
import { Tarjeta } from "@/components/ui/tarjeta";
import { Campo } from "@/components/ui/formulario";
import { BotonConfirmar, BotonEnviar } from "@/components/ui/botones";

export function GestionImagenes({ propiedad }: { propiedad: PropiedadDetalle }) {
  return (
    <Tarjeta titulo="Imágenes de la propiedad">
      <form
        action={subirImagenPropiedad}
        className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <input type="hidden" name="idPropiedad" value={propiedad.id} />
        <Campo label="Agregar imágenes" className="sm:flex-1">
          <input name="imagenes" type="file" accept="image/*" multiple required className="input" />
        </Campo>
        <BotonEnviar>Subir imagen</BotonEnviar>
      </form>

      {propiedad.recursos.length === 0 ? (
        <p className="text-sm text-slate-500">Todavía no hay imágenes cargadas.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {propiedad.recursos.map((recurso, indice) => (
            <figure key={recurso.id} className="overflow-hidden rounded-xl border border-slate-200">
              {/* El route handler genera una URL firmada y evita exponer claves privadas. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/recursos/${recurso.id}`}
                alt={recurso.nombre}
                className="aspect-square w-full object-cover"
              />
              <div className="border-t border-slate-200 p-2">
                {recurso.principal && (
                  <span className="mb-2 block rounded-md bg-indigo-50 px-2 py-1 text-center text-xs font-semibold text-indigo-700">
                    Imagen principal
                  </span>
                )}
                <div className="mb-2 grid grid-cols-2 gap-1">
                  <form action={moverImagenPropiedad}>
                    <input type="hidden" name="idRecurso" value={recurso.id} />
                    <input type="hidden" name="direccion" value="arriba" />
                    <button
                      type="submit"
                      disabled={indice === 0}
                      className="btn-secondary w-full px-2"
                      aria-label={`Mover ${recurso.nombre} hacia arriba`}
                    >
                      ↑
                    </button>
                  </form>
                  <form action={moverImagenPropiedad}>
                    <input type="hidden" name="idRecurso" value={recurso.id} />
                    <input type="hidden" name="direccion" value="abajo" />
                    <button
                      type="submit"
                      disabled={indice === propiedad.recursos.length - 1}
                      className="btn-secondary w-full px-2"
                      aria-label={`Mover ${recurso.nombre} hacia abajo`}
                    >
                      ↓
                    </button>
                  </form>
                </div>
                {!recurso.principal && (
                  <form action={establecerImagenPrincipal} className="mb-2">
                    <input type="hidden" name="idRecurso" value={recurso.id} />
                    <button type="submit" className="btn-secondary w-full text-xs">
                      Usar como principal
                    </button>
                  </form>
                )}
                <form action={eliminarImagenPropiedad}>
                  <input type="hidden" name="idRecurso" value={recurso.id} />
                  <BotonConfirmar
                    mensaje={`¿Eliminar la imagen "${recurso.nombre}"?`}
                    className="btn-danger w-full"
                  >
                    Eliminar
                  </BotonConfirmar>
                </form>
              </div>
            </figure>
          ))}
        </div>
      )}
    </Tarjeta>
  );
}
