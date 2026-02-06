// Normalizar nombre a mayúsculas (para consistencia)
export function normalizeName(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

// Generar slug desde un nombre (normalizar para URLs)
export function generateSlug(name: string): string {
  return normalizeName(name)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
    .replace(/[^a-z0-9]+/g, "-") // Reemplazar caracteres especiales con guiones
    .replace(/^-+|-+$/g, ""); // Eliminar guiones al inicio y final
}
