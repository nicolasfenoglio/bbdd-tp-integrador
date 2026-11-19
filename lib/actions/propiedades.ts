"use server";

import { ejecutar } from "@/lib/actions/ejecutar";
import { prisma } from "@/lib/prisma";
import { decimal, entero, id, idOpcional, obligatorio, texto } from "@/lib/validacion";
import { eliminarObjeto, subirObjeto } from "@/lib/minio";
import { randomUUID } from "node:crypto";

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

export async function subirImagenPropiedad(form: FormData) {
  const idPropiedad = id(form, "idPropiedad", "Propiedad");
  const archivos = form
    .getAll("imagenes")
    .filter((archivo): archivo is File => archivo instanceof File);

  await ejecutar(
    async () => {
      if (archivos.length === 0) throw new Error("Seleccioná al menos una imagen.");
      if (archivos.some((archivo) => !archivo.type.startsWith("image/")))
        throw new Error("Todos los archivos deben ser imágenes.");
      if (archivos.some((archivo) => archivo.size === 0))
        throw new Error("No se pueden subir imágenes vacías.");
      if (archivos.some((archivo) => archivo.size > 10 * 1024 * 1024))
        throw new Error("Cada imagen debe pesar como máximo 10 MB.");

      const propiedad = await prisma.propiedad.findUnique({ where: { id: idPropiedad } });
      if (!propiedad) throw new Error("La propiedad no existe.");

      const existentes = await prisma.recurso.count({ where: { idPropiedad } });
      const tienePrincipal = await prisma.recurso.count({
        where: { idPropiedad, principal: true },
      });

      for (const [indice, archivo] of archivos.entries()) {
        const extension = archivo.name.includes(".")
          ? archivo.name.substring(archivo.name.lastIndexOf(".")).toLowerCase()
          : "";
        const clave = `propiedades/${idPropiedad}/${randomUUID()}${extension}`;

        await subirObjeto(clave, Buffer.from(await archivo.arrayBuffer()), archivo.type);
        try {
          await prisma.recurso.create({
            data: {
              nombre: archivo.name,
              clave,
              tipoContenido: archivo.type,
              tamano: archivo.size,
              orden: existentes + indice,
              principal: tienePrincipal === 0 && indice === 0,
              idPropiedad,
            },
          });
        } catch (error) {
          await eliminarObjeto(clave);
          throw error;
        }
      }
    },
    {
      exito: "Imagen agregada.",
      destino: `/propiedades/${idPropiedad}`,
      siFalla: `/propiedades/${idPropiedad}`,
    },
  );
}

export async function establecerImagenPrincipal(form: FormData) {
  const idRecurso = id(form, "idRecurso", "Recurso");
  await ejecutar(
    async () => {
      const recurso = await prisma.recurso.findUnique({ where: { id: idRecurso } });
      if (!recurso) throw new Error("El recurso no existe.");

      await prisma.$transaction([
        prisma.recurso.updateMany({
          where: { idPropiedad: recurso.idPropiedad, principal: true },
          data: { principal: false },
        }),
        prisma.recurso.update({
          where: { id: idRecurso },
          data: { principal: true, orden: 0 },
        }),
      ]);
      return recurso.idPropiedad;
    },
    {
      exito: "Imagen principal actualizada.",
      destino: (idPropiedad) => `/propiedades/${idPropiedad}`,
      siFalla: "/propiedades",
    },
  );
}

export async function moverImagenPropiedad(form: FormData) {
  const idRecurso = id(form, "idRecurso", "Recurso");
  const direccion = texto(form, "direccion");

  await ejecutar(
    async () => {
      const recurso = await prisma.recurso.findUnique({ where: { id: idRecurso } });
      if (!recurso) throw new Error("El recurso no existe.");
      if (direccion !== "arriba" && direccion !== "abajo")
        throw new Error("Dirección de orden inválida.");

      const recursos = await prisma.recurso.findMany({
        where: { idPropiedad: recurso.idPropiedad },
        orderBy: [{ principal: "desc" }, { orden: "asc" }, { id: "asc" }],
      });
      const indice = recursos.findIndex((item) => item.id === idRecurso);
      const destino = direccion === "arriba" ? indice - 1 : indice + 1;
      if (indice < 0 || destino < 0 || destino >= recursos.length) return recurso.idPropiedad;

      const actual = recursos[indice];
      const vecino = recursos[destino];
      await prisma.$transaction([
        prisma.recurso.update({ where: { id: actual.id }, data: { orden: vecino.orden } }),
        prisma.recurso.update({ where: { id: vecino.id }, data: { orden: actual.orden } }),
      ]);
      return recurso.idPropiedad;
    },
    {
      exito: "Orden actualizado.",
      destino: (idPropiedad) => `/propiedades/${idPropiedad}`,
      siFalla: "/propiedades",
    },
  );
}

export async function eliminarImagenPropiedad(form: FormData) {
  const idRecurso = id(form, "idRecurso", "Recurso");
  await ejecutar(
    async () => {
      const recurso = await prisma.recurso.findUnique({ where: { id: idRecurso } });
      if (!recurso) throw new Error("El recurso no existe.");

      await prisma.recurso.delete({ where: { id: idRecurso } });
      await eliminarObjeto(recurso.clave);
      if (recurso.principal) {
        const siguiente = await prisma.recurso.findFirst({
          where: { idPropiedad: recurso.idPropiedad },
          orderBy: [{ orden: "asc" }, { id: "asc" }],
        });
        if (siguiente) {
          await prisma.recurso.update({
            where: { id: siguiente.id },
            data: { principal: true, orden: 0 },
          });
        }
      }
      return recurso.idPropiedad;
    },
    {
      exito: "Imagen eliminada.",
      destino: (idPropiedad) => `/propiedades/${idPropiedad}`,
      siFalla: "/propiedades",
    },
  );
}
