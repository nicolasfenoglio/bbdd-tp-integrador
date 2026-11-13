"use server";

import { ejecutar } from "@/lib/actions/ejecutar";
import { prisma } from "@/lib/prisma";
import { decimal, entero, id, idOpcional, obligatorio, texto } from "@/lib/validacion";

export async function guardarPropiedad(form: FormData) {
  const idEditar = idOpcional(form);
  await ejecutar(
    async () => {
      const estadoForm = texto(form, "estado") === "No disponible" ? "No disponible" : "Disponible";
      const data = {
        direccion: obligatorio(form, "direccion", "Dirección"),
        superficie: decimal(form, "superficie", "Superficie", { positivo: true }),
        ambientes: entero(form, "ambientes", "Ambientes", 1, 50),
        precioAlquiler: decimal(form, "precioAlquiler", "Precio de alquiler", { positivo: true }),
        idPropietario: id(form, "idPropietario", "Propietario"),
        idTipo: id(form, "idTipo", "Tipo"),
        idZona: id(form, "idZona", "Zona"),
      };

      if (!idEditar) return prisma.propiedad.create({ data: { ...data, estado: estadoForm } });

      return prisma.$transaction(async (tx) => {
        // El estado "Alquilada" lo controlan los contratos: no se puede cambiar a mano.
        const vigentes = await tx.contrato.count({
          where: { idPropiedad: idEditar, estado: "Vigente" },
        });
        return tx.propiedad.update({
          where: { id: idEditar },
          data: { ...data, estado: vigentes > 0 ? "Alquilada" : estadoForm },
        });
      });
    },
    {
      exito: idEditar ? "Propiedad actualizada." : "Propiedad creada.",
      destino: (p) => `/propiedades/${p.id}`,
      siFalla: idEditar ? `/propiedades/${idEditar}` : "/propiedades/nueva",
    },
  );
}

export async function eliminarPropiedad(form: FormData) {
  const idPropiedad = id(form);
  await ejecutar(() => prisma.propiedad.delete({ where: { id: idPropiedad } }), {
    exito: "Propiedad eliminada.",
    destino: "/propiedades",
    siFalla: `/propiedades/${idPropiedad}`,
    enUso:
      'No se puede eliminar la propiedad porque tiene contratos registrados. Podés marcarla como "No disponible".',
  });
}
