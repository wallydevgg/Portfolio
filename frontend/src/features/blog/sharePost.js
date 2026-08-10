/**
 * Comparte un post y dice qué acabó pasando.
 *
 * El botón "compartir" parecía no hacer nada: en escritorio `navigator.share`
 * no existe, así que caía al portapapeles y el error —o el éxito— se tragaba en
 * un catch vacío. Copiar sin decirlo es indistinguible de no hacer nada.
 *
 * Devuelve "shared" | "copied" | "cancelled" | "failed" para que quien llama
 * pueda dar respuesta visible.
 */
export async function sharePost({ url, title }) {
  if (navigator.share) {
    try {
      await navigator.share({ title, url });
      return "shared";
    } catch (err) {
      // AbortError es el usuario cerrando la hoja de compartir: no es un fallo
      // y no merece aviso.
      if (err?.name === "AbortError") return "cancelled";
      // Cualquier otro problema cae al portapapeles.
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    return "copied";
  } catch {
    // clipboard exige contexto seguro. Fuera de él queda el camino antiguo.
    return copyFallback(url) ? "copied" : "failed";
  }
}

function copyFallback(text) {
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}
