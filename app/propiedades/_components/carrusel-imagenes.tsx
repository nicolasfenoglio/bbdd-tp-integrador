"use client";

import { useState } from "react";

type Imagen = {
  id: number;
  nombre: string;
};

export function CarruselImagenes({
  imagenes,
  sinImagen = "La propiedad todavía no tiene imágenes.",
}: {
  imagenes: Imagen[];
  sinImagen?: string;
}) {
  const [indice, setIndice] = useState(0);

  if (imagenes.length === 0) {
    return (
      <div className="grid aspect-[16/10] place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-100 px-6 text-center text-sm text-slate-500">
        {sinImagen}
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-hidden rounded-2xl bg-slate-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/recursos/${imagenes[indice].id}`}
          alt={imagenes[indice].nombre}
          className="aspect-[16/10] w-full object-cover"
        />
      </div>

      {imagenes.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Seleccionar imagen">
          {imagenes.map((imagen, indiceMiniatura) => (
            <button
              key={imagen.id}
              type="button"
              onClick={() => setIndice(indiceMiniatura)}
              className={`shrink-0 overflow-hidden rounded-lg border-2 transition ${
                indice === indiceMiniatura
                  ? "border-indigo-600 ring-2 ring-indigo-100"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
              aria-label={`Mostrar imagen ${indiceMiniatura + 1}: ${imagen.nombre}`}
              aria-current={indice === indiceMiniatura ? "true" : undefined}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/recursos/${imagen.id}`}
                alt=""
                className="size-16 object-cover sm:size-20"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
