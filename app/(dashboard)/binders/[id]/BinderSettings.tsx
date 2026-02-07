"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Gear, Trash } from "react-bootstrap-icons";

type Binder = {
  id: string;
  name: string;
  theme: string;
  primaryColor: string | null;
  secondaryColor: string | null;
  accentColor: string | null;
};

export function BinderSettings({ binder }: { binder: Binder }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [colors, setColors] = useState({
    primaryColor: binder.primaryColor || "#FFB6C1",
    secondaryColor: binder.secondaryColor || "#E6E6FA",
    accentColor: binder.accentColor || "#FFD700",
  });

  async function saveColors() {
    // Validar que los colores sean válidos (formato hex)
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexColorRegex.test(colors.primaryColor) || 
        !hexColorRegex.test(colors.secondaryColor) || 
        !hexColorRegex.test(colors.accentColor)) {
      alert("Por favor ingresa colores válidos en formato hexadecimal (ej: #FFB6C1)");
      return;
    }

    setLoading(true);
    try {
      // Actualizar el binder con los nuevos colores
      const res = await fetch(`/api/binders/${binder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryColor: colors.primaryColor.trim(),
          secondaryColor: colors.secondaryColor.trim(),
          accentColor: colors.accentColor.trim(),
        }),
      });
      
      if (res.ok) {
        setOpen(false);
        router.refresh();
      } else {
        const errorData = await res.json().catch(() => ({ error: "Error desconocido" }));
        alert(`Error al guardar colores: ${errorData.error || "Error desconocido"}`);
      }
    } catch (err) {
      console.error("Error al guardar colores:", err);
      alert(`Error al guardar colores: ${err instanceof Error ? err.message : "Error desconocido"}`);
    } finally {
      setLoading(false);
    }
  }

  async function deleteBinder() {
    if (!confirm(`¿Estás seguro de eliminar "${binder.name}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/binders/${binder.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/binders");
      } else {
        const errorData = await res.json().catch(() => ({ error: "Error desconocido" }));
        alert(`Error al eliminar binder: ${errorData.error || "Error desconocido"}`);
      }
    } catch (err) {
      console.error("Error deleting binder:", err);
      alert(`Error al eliminar binder: ${err instanceof Error ? err.message : "Error de conexión"}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={() => setOpen(true)}
          className="rounded-xl border border-[var(--accent-secondary)]/40 px-4 py-2 text-sm text-[var(--text-muted)] hover:bg-[var(--bg-secondary)]"
        >
          ⚙️ Personalizar
        </button>
        <button
          onClick={deleteBinder}
          disabled={loading}
          className="rounded-xl border border-red-500/40 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 disabled:opacity-50"
        >
          <Trash size={16} className="inline mr-1" /> Eliminar Binder
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-3xl bg-[var(--bg-secondary)] p-6 shadow-2xl border border-[var(--accent-secondary)]/30">
            <h2 className="font-display text-xl font-semibold text-[var(--text)] mb-4">
              Personalizar Binder
            </h2>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              Personaliza los colores de tu binder con estilo macaroon
            </p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-2">
                  Color Principal
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={colors.primaryColor}
                    onChange={(e) => setColors((c) => ({ ...c, primaryColor: e.target.value }))}
                    className="w-16 h-12 rounded-xl border-2 border-[var(--accent-secondary)]/40 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={colors.primaryColor}
                    onChange={(e) => {
                      let value = e.target.value;
                      // Asegurar que comience con #
                      if (value && !value.startsWith("#")) {
                        value = "#" + value;
                      }
                      setColors((c) => ({ ...c, primaryColor: value }));
                    }}
                    className="flex-1 rounded-xl border border-[var(--accent-secondary)]/40 bg-[var(--bg)] px-3 py-2 text-sm"
                    placeholder="#FFB6C1"
                    pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-2">
                  Color Secundario
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={colors.secondaryColor}
                    onChange={(e) => setColors((c) => ({ ...c, secondaryColor: e.target.value }))}
                    className="w-16 h-12 rounded-xl border-2 border-[var(--accent-secondary)]/40 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={colors.secondaryColor}
                    onChange={(e) => setColors((c) => ({ ...c, secondaryColor: e.target.value }))}
                    className="flex-1 rounded-xl border border-[var(--accent-secondary)]/40 bg-[var(--bg)] px-3 py-2 text-sm"
                    placeholder="#E6E6FA"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-2">
                  Color de Acento
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={colors.accentColor}
                    onChange={(e) => setColors((c) => ({ ...c, accentColor: e.target.value }))}
                    className="w-16 h-12 rounded-xl border-2 border-[var(--accent-secondary)]/40 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={colors.accentColor}
                    onChange={(e) => {
                      let value = e.target.value;
                      // Asegurar que comience con #
                      if (value && !value.startsWith("#")) {
                        value = "#" + value;
                      }
                      setColors((c) => ({ ...c, accentColor: value }));
                    }}
                    className="flex-1 rounded-xl border border-[var(--accent-secondary)]/40 bg-[var(--bg)] px-3 py-2 text-sm"
                    placeholder="#FFD700"
                    pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                  />
                </div>
              </div>

              <div className="rounded-xl p-4 border-2 border-dashed" style={{
                background: `linear-gradient(135deg, ${colors.primaryColor}20, ${colors.secondaryColor}20)`,
                borderColor: `${colors.accentColor}40`,
              }}>
                <p className="text-xs text-[var(--text-muted)] text-center">
                  Vista previa del estilo macaroon
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setColors({
                    primaryColor: binder.primaryColor || "#FFB6C1",
                    secondaryColor: binder.secondaryColor || "#E6E6FA",
                    accentColor: binder.accentColor || "#FFD700",
                  });
                  setOpen(false);
                }}
                className="flex-1 rounded-xl border border-[var(--accent-secondary)]/40 py-2 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={saveColors}
                disabled={loading}
                className="flex-1 rounded-xl bg-[var(--accent)] py-2 text-sm font-medium disabled:opacity-50"
                style={{
                  background: `linear-gradient(135deg, ${colors.primaryColor}, ${colors.secondaryColor})`,
                }}
              >
                {loading ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
