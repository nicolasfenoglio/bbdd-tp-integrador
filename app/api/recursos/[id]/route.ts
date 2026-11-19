import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { notFound } from "next/navigation";
import { minioBucket, minioPublic } from "@/lib/minio";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const recursoId = Number(id);
  if (!Number.isInteger(recursoId) || recursoId <= 0) notFound();

  const recurso = await prisma.recurso.findUnique({ where: { id: recursoId } });
  if (!recurso) notFound();

  const url = await getSignedUrl(
    minioPublic,
    new GetObjectCommand({
      Bucket: minioBucket,
      Key: recurso.clave,
      ResponseContentType: recurso.tipoContenido,
    }),
    { expiresIn: 300 },
  );

  return Response.redirect(url, 307);
}
