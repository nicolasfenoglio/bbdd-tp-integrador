import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ErrorValidacion } from "@/lib/validacion";

/* =====================================================================
 * Ejecución común de las Server Actions: corre la operación y redirige
 * con un mensaje de éxito (?ok=) o de error (?error=) que muestra <Avisos>.
 * ===================================================================== */

function conParam(url: string, clave: string, valor: string) {
  const [base, hash] = url.split("#");
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}${clave}=${encodeURIComponent(valor)}${hash ? `#${hash}` : ""}`;
}

/** Traduce los errores de validación y de Prisma a un mensaje para el usuario. */
function mensajeError(e: unknown, enUso?: string) {
  if (e instanceof ErrorValidacion) return e.message;
  const code = (e as { code?: string })?.code;
  if (code === "P2002") return "Ya existe un registro con ese documento o email.";
  if (code === "P2003") return enUso ?? "No se puede eliminar porque tiene registros asociados.";
  if (code === "P2025") return "El registro no existe o ya fue eliminado.";
  console.error(e);
  return "Ocurrió un error inesperado. Revisá los datos e intentá de nuevo.";
}

export async function ejecutar<T>(
  operacion: () => Promise<T>,
  opciones: {
    exito: string;
    destino: string | ((resultado: T) => string);
    siFalla: string;
    enUso?: string;
  },
) {
  let url: string;
  try {
    const resultado = await operacion();
    const destino =
      typeof opciones.destino === "function" ? opciones.destino(resultado) : opciones.destino;
    url = conParam(destino, "ok", opciones.exito);
  } catch (e) {
    url = conParam(opciones.siFalla, "error", mensajeError(e, opciones.enUso));
  }
  revalidatePath("/", "layout");
  // redirect() lanza una excepción propia de Next: va fuera del try/catch.
  redirect(url);
}
