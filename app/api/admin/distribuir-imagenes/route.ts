import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { eliminarObjeto, subirObjeto } from "@/lib/minio";

function autorizado(request: Request) {
  const secreto = process.env.DISTRIBUTOR_SECRET ?? "distributor-local";
  return request.headers.get("x-distributor-secret") === secreto;
}

export async function GET(request: Request) {
  if (!autorizado(request)) return Response.json({ error: "No autorizado" }, { status: 401 });

  const propiedades = await prisma.propiedad.findMany({
    orderBy: { id: "asc" },
    select: {
      id: true,
      direccion: true,
      _count: { select: { recursos: true } },
    },
  });

  return Response.json({
    propiedades: propiedades.map((propiedad) => ({
      id: propiedad.id,
      direccion: propiedad.direccion,
      recursos: propiedad._count.recursos,
    })),
  });
}

export async function POST(request: Request) {
  if (!autorizado(request)) return Response.json({ error: "No autorizado" }, { status: 401 });

  const form = await request.formData();
  const idPropiedad = Number(form.get("idPropiedad"));
  const archivo = form.get("imagen");

  if (!Number.isInteger(idPropiedad) || idPropiedad <= 0)
    return Response.json({ error: "Propiedad inválida" }, { status: 400 });
  if (!(archivo instanceof File) || !archivo.type.startsWith("image/"))
    return Response.json({ error: "Se requiere una imagen" }, { status: 400 });
  if (archivo.size > 10 * 1024 * 1024)
    return Response.json({ error: "La imagen supera los 10 MB" }, { status: 400 });

  const propiedad = await prisma.propiedad.findUnique({ where: { id: idPropiedad } });
  if (!propiedad) return Response.json({ error: "Propiedad inexistente" }, { status: 404 });

  const extension = archivo.name.includes(".")
    ? archivo.name.substring(archivo.name.lastIndexOf(".")).toLowerCase()
    : "";
  const clave = `propiedades/${idPropiedad}/${randomUUID()}${extension}`;

  await subirObjeto(clave, Buffer.from(await archivo.arrayBuffer()), archivo.type);
  try {
    const [cantidad, tienePrincipal] = await Promise.all([
      prisma.recurso.count({ where: { idPropiedad } }),
      prisma.recurso.count({ where: { idPropiedad, principal: true } }),
    ]);
    const recurso = await prisma.recurso.create({
      data: {
        nombre: archivo.name,
        clave,
        tipoContenido: archivo.type,
        tamano: archivo.size,
        orden: cantidad,
        principal: cantidad === 0 || tienePrincipal === 0,
        idPropiedad,
      },
    });

    return Response.json(
      { ok: true, recurso: { id: recurso.id, propiedadId: idPropiedad, clave } },
      { status: 201 },
    );
  } catch (error) {
    await eliminarObjeto(clave);
    throw error;
  }
}
