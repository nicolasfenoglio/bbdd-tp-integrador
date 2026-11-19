import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { tmpdir } from "node:os";

const baseUrl = (process.argv[2] ?? process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
const secreto = process.env.DISTRIBUTOR_SECRET ?? "distributor-local";
const carpeta = join(process.cwd(), "img");
const archivoEstado =
  process.env.IMAGE_DISTRIBUTION_STATE ?? join(tmpdir(), "bbdd-integrador-image-distribution.json");

async function leerEstado() {
  try {
    return JSON.parse(await readFile(archivoEstado, "utf8"));
  } catch {
    return { version: 1, imagenes: {} };
  }
}

async function guardarEstado(estado) {
  await writeFile(archivoEstado, `${JSON.stringify(estado, null, 2)}\n`, "utf8");
}

async function api(ruta, opciones = {}) {
  const respuesta = await fetch(`${baseUrl}${ruta}`, {
    ...opciones,
    headers: {
      "x-distributor-secret": secreto,
      ...opciones.headers,
    },
  });

  if (!respuesta.ok) {
    const cuerpo = await respuesta.text();
    throw new Error(`API ${respuesta.status}: ${cuerpo}`);
  }
  return respuesta.status === 204 ? null : respuesta.json();
}

const extensionesPermitidas = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const nombres = (await readdir(carpeta, { withFileTypes: true }))
  .filter((entrada) => entrada.isFile() && extensionesPermitidas.has(extname(entrada.name).toLowerCase()))
  .map((entrada) => entrada.name)
  .sort((a, b) => a.localeCompare(b, "es"));

if (nombres.length === 0) {
  console.log(`No hay imágenes nuevas o válidas en ${carpeta}`);
  process.exit(0);
}

const estado = await leerEstado();
const nuevas = [];

for (const nombre of nombres) {
  const ruta = join(carpeta, nombre);
  const contenido = await readFile(ruta);
  const hash = createHash("sha256").update(contenido).digest("hex");
  if (!estado.imagenes[hash]) nuevas.push({ nombre, ruta, hash, contenido });
}

if (nuevas.length === 0) {
  console.log("No hay imágenes nuevas: todas ya fueron cargadas.");
  console.log(`Estado: ${archivoEstado}`);
  process.exit(0);
}

const { propiedades } = await api("/api/admin/distribuir-imagenes");
if (propiedades.length === 0) {
  throw new Error("No hay propiedades en la base de datos.");
}

console.log(`Distribuyendo ${nuevas.length} imágenes nuevas...`);

for (const imagen of nuevas) {
  propiedades.sort((a, b) => a.recursos - b.recursos || a.id - b.id);
  const propiedad = propiedades[0];

  const form = new FormData();
  form.append("idPropiedad", String(propiedad.id));
  form.append(
    "imagen",
    new Blob([imagen.contenido], { type: mimetype(imagen.nombre) }),
    imagen.nombre,
  );

  const resultado = await api("/api/admin/distribuir-imagenes", {
    method: "POST",
    body: form,
  });

  propiedad.recursos += 1;
  estado.imagenes[imagen.hash] = {
    nombre: imagen.nombre,
    propiedadId: propiedad.id,
    recursoId: resultado.recurso.id,
    cargadaEn: new Date().toISOString(),
  };
  await guardarEstado(estado);
  console.log(`✓ ${basename(imagen.nombre)} -> propiedad ${propiedad.id} (${propiedad.direccion})`);
}

console.log(`Completado. Estado guardado en ${archivoEstado}`);

function mimetype(nombre) {
  switch (extname(nombre).toLowerCase()) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    default:
      return "application/octet-stream";
  }
}
