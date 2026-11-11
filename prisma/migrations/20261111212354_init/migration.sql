-- CreateTable
CREATE TABLE "contrato" (
    "id" SERIAL NOT NULL,
    "fecha_inicio" DATE NOT NULL,
    "fecha_fin" DATE,
    "mensualidad" DECIMAL(12,2) NOT NULL,
    "deposito" DECIMAL(12,2) NOT NULL,
    "estado" TEXT NOT NULL,
    "id_propiedad" INTEGER NOT NULL,
    "id_inquilino" INTEGER NOT NULL,

    CONSTRAINT "contrato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "propietario" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "telefono" TEXT,
    "email" TEXT,

    CONSTRAINT "propietario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inquilino" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "telefono" TEXT,
    "email" TEXT,

    CONSTRAINT "inquilino_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "propiedad" (
    "id" SERIAL NOT NULL,
    "direccion" TEXT NOT NULL,
    "superficie" DECIMAL(10,2) NOT NULL,
    "ambientes" INTEGER NOT NULL,
    "precio_alquiler" DECIMAL(12,2) NOT NULL,
    "estado" TEXT NOT NULL,
    "id_propietario" INTEGER NOT NULL,
    "id_tipo" INTEGER NOT NULL,
    "id_zona" INTEGER NOT NULL,

    CONSTRAINT "propiedad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipo" (
    "id" SERIAL NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "tipo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zona" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "id_localidad" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "zona_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "localidad" (
    "id" SERIAL NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "localidad_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "propietario_documento_key" ON "propietario"("documento");

-- CreateIndex
CREATE UNIQUE INDEX "propietario_email_key" ON "propietario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "inquilino_documento_key" ON "inquilino"("documento");

-- CreateIndex
CREATE UNIQUE INDEX "inquilino_email_key" ON "inquilino"("email");

-- AddForeignKey
ALTER TABLE "contrato" ADD CONSTRAINT "contrato_id_propiedad_fkey" FOREIGN KEY ("id_propiedad") REFERENCES "propiedad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrato" ADD CONSTRAINT "contrato_id_inquilino_fkey" FOREIGN KEY ("id_inquilino") REFERENCES "inquilino"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propiedad" ADD CONSTRAINT "propiedad_id_propietario_fkey" FOREIGN KEY ("id_propietario") REFERENCES "propietario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propiedad" ADD CONSTRAINT "propiedad_id_tipo_fkey" FOREIGN KEY ("id_tipo") REFERENCES "tipo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propiedad" ADD CONSTRAINT "propiedad_id_zona_fkey" FOREIGN KEY ("id_zona") REFERENCES "zona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zona" ADD CONSTRAINT "zona_id_localidad_fkey" FOREIGN KEY ("id_localidad") REFERENCES "localidad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
