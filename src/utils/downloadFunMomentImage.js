/**
 * @param {{
 *   imageUrl: string;
 *   emocion?: string;
 *   nombreArchivo?: string | null;
 *   time?: string;
 * }} item
 */
export function buildFunMomentDownloadName(item) {
  if (item.nombreArchivo?.trim()) {
    return item.nombreArchivo.trim();
  }
  const emocion = String(item.emocion ?? "captura")
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^\w.-]+/g, "");
  const time = String(item.time ?? "").replace(":", "");
  return `momento-${emocion || "captura"}${time ? `-${time}` : ""}.png`;
}

/**
 * Descarga la imagen procesada al dispositivo del usuario.
 * @param {{
 *   imageUrl: string;
 *   emocion?: string;
 *   nombreArchivo?: string | null;
 *   time?: string;
 * }} item
 */
export async function downloadFunMomentImage(item) {
  const filename = buildFunMomentDownloadName(item);
  const res = await fetch(item.imageUrl);
  if (!res.ok) {
    throw new Error("No se pudo obtener la imagen");
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
