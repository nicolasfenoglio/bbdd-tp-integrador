import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const endpoint = process.env.MINIO_ENDPOINT ?? "http://localhost:9000";
export const minioBucket = process.env.MINIO_BUCKET ?? "propiedades";

export const minio = new S3Client({
  endpoint,
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.MINIO_ROOT_USER ?? "minioadmin",
    secretAccessKey: process.env.MINIO_ROOT_PASSWORD ?? "minioadmin",
  },
  forcePathStyle: true,
});

export const minioPublic = new S3Client({
  endpoint: process.env.MINIO_PUBLIC_ENDPOINT ?? endpoint,
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.MINIO_ROOT_USER ?? "minioadmin",
    secretAccessKey: process.env.MINIO_ROOT_PASSWORD ?? "minioadmin",
  },
  forcePathStyle: true,
});

export function subirObjeto(clave: string, archivo: Buffer, tipoContenido: string) {
  return minio.send(
    new PutObjectCommand({
      Bucket: minioBucket,
      Key: clave,
      Body: archivo,
      ContentType: tipoContenido,
    }),
  );
}

export function eliminarObjeto(clave: string) {
  return minio.send(
    new DeleteObjectCommand({
      Bucket: minioBucket,
      Key: clave,
    }),
  );
}
