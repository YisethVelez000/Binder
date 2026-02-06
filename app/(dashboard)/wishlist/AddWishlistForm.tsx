"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type CatalogItem = {
  id: string;
  groupName: string;
  albumName: string;
  memberName: string;
  imageUrl: string;
};

export function AddWishlistForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"manual" | "catalog">("manual");
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [form, setForm] = useState({
    catalogId: "",
    groupName: "",
    albumName: "",
    memberName: "",
    imageUrl: "",
    notes: "",
    addToCatalog: false,
  });

  useEffect(() => {
    if (mode === "catalog" && open) {
      fetch("/api/catalog")
        .then((res) => res.json())
        .then((data) => setCatalogItems(data.slice(0, 50)));
    }
  }, [mode, open]);

  const filteredCatalog = catalogItems.filter(
    (item) =>
      item.groupName.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      item.memberName.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      item.albumName.toLowerCase().includes(catalogSearch.toLowerCase())
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        catalogId: mode === "catalog" && form.catalogId ? form.catalogId : undefined,
        groupName: mode === "manual" ? form.groupName : undefined,
        albumName: mode === "manual" ? form.albumName : undefined,
        memberName: mode === "manual" ? form.memberName : undefined,
        imageUrl: mode === "manual" ? form.imageUrl || undefined : undefined,
        notes: form.notes || undefined,
        addToCatalog: mode === "manual" ? form.addToCatalog : false,
      }),
    });
    setLoading(false);
    if (res.ok) {
      setOpen(false);
      setForm({ catalogId: "", groupName: "", albumName: "", memberName: "", imageUrl: "", notes: "", addToCatalog: false });
      setMode("manual");
      setCatalogSearch("");
      router.refresh();
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--text)] hover:opacity-90"
      >
        + Añadir a wishlist
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-[var(--bg-secondary)] p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="font-display text-lg font-semibold text-[var(--text)] mb-4">
          Añadir a wishlist
        </h2>
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setMode("catalog")}
            className={`flex-1 rounded-xl py-2 text-sm font-medium ${
              mode === "catalog"
                ? "bg-[var(--accent)] text-[var(--text)]"
                : "border border-[var(--accent-secondary)]/40"
            }`}
          >
            Del Catálogo
          </button>
          <button
            type="button"
            onClick={() => setMode("manual")}
            className={`flex-1 rounded-xl py-2 text-sm font-medium ${
              mode === "manual"
                ? "bg-[var(--accent)] text-[var(--text)]"
                : "border border-[var(--accent-secondary)]/40"
            }`}
          >
            Manual
          </button>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-3">
          {mode === "catalog" ? (
            <>
              <input
                placeholder="Buscar en catálogo..."
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                className="rounded-xl border border-[var(--accent-secondary)]/40 bg-[var(--bg)] px-3 py-2 text-sm"
              />
              <div className="max-h-60 overflow-y-auto space-y-2">
                {filteredCatalog.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, catalogId: item.id }))}
                    className={`w-full rounded-xl border p-3 text-left ${
                      form.catalogId === item.id
                        ? "border-[var(--accent)] bg-[var(--accent)]/20"
                        : "border-[var(--accent-secondary)]/40 bg-[var(--bg)]"
                    }`}
                  >
                    <p className="font-medium text-sm">{item.groupName}</p>
                    <p className="text-xs text-[var(--text-muted)]">{item.memberName} - {item.albumName}</p>
                  </button>
                ))}
                {filteredCatalog.length === 0 && (
                  <p className="text-sm text-[var(--text-muted)] text-center py-4">
                    No se encontraron resultados
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              <input
                placeholder="Nombre del grupo *"
                value={form.groupName}
                onChange={(e) => setForm((f) => ({ ...f, groupName: e.target.value }))}
                required
                className="rounded-xl border border-[var(--accent-secondary)]/40 bg-[var(--bg)] px-3 py-2 text-sm"
              />
              <input
                placeholder="Nombre del álbum"
                value={form.albumName}
                onChange={(e) => setForm((f) => ({ ...f, albumName: e.target.value }))}
                className="rounded-xl border border-[var(--accent-secondary)]/40 bg-[var(--bg)] px-3 py-2 text-sm"
              />
              <input
                placeholder="Nombre del miembro *"
                value={form.memberName}
                onChange={(e) => setForm((f) => ({ ...f, memberName: e.target.value }))}
                required
                className="rounded-xl border border-[var(--accent-secondary)]/40 bg-[var(--bg)] px-3 py-2 text-sm"
              />
              <input
                placeholder="URL imagen (opcional)"
                value={form.imageUrl}
                onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                className="rounded-xl border border-[var(--accent-secondary)]/40 bg-[var(--bg)] px-3 py-2 text-sm"
              />
              <label className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                <input
                  type="checkbox"
                  checked={form.addToCatalog}
                  onChange={(e) => setForm((f) => ({ ...f, addToCatalog: e.target.checked }))}
                  className="rounded"
                />
                Añadir al catálogo global automáticamente
              </label>
            </>
          )}
          <textarea
            placeholder="Notas"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            className="rounded-xl border border-[var(--accent-secondary)]/40 bg-[var(--bg)] px-3 py-2 text-sm"
            rows={2}
          />
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setMode("manual");
                setCatalogSearch("");
              }}
              className="flex-1 rounded-xl border border-[var(--accent-secondary)]/40 py-2 text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || (mode === "catalog" && !form.catalogId)}
              className="flex-1 rounded-xl bg-[var(--accent)] py-2 text-sm font-medium disabled:opacity-50"
            >
              {loading ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
