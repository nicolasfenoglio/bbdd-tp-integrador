-- CreateTable
CREATE TABLE "recurso" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "clave" TEXT NOT NULL,
    "tipo_contenido" TEXT NOT NULL,
    "tamano" INTEGER NOT NULL,
    "id_propiedad" INTEGER NOT NULL,

    CONSTRAINT "recurso_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "recurso_clave_key" ON "recurso"("clave");

-- AddForeignKey
ALTER TABLE "recurso" ADD CONSTRAINT "recurso_id_propiedad_fkey" FOREIGN KEY ("id_propiedad") REFERENCES "propiedad"("id") ON DELETE CASCADE ON UPDATE CASCADE;
