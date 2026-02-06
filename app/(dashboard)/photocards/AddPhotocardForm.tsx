"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Member = {
  id: string;
  slug: string;
  name: string;
};

type AlbumVersion = {
  id: string;
  slug: string;
  name: string;
};

type Album = {
  id: string;
  slug: string;
  name: string;
  versions: AlbumVersion[];
};

type Group = {
  id: string;
  slug: string;
  name: string;
  members: Member[];
  albums: Album[];
};

export function AddPhotocardForm({ groups: initialGroups }: { groups: Group[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [form, setForm] = useState({
    albumId: "",
    memberId: "",
    versionId: "",
    imageUrl: "",
    addToCatalog: false,
  });

  const selectedGroup = initialGroups.find((g) => g.id === selectedGroupId);
  const availableMembers = selectedGroup?.members || [];
  const availableAlbums = selectedGroup?.albums || [];
  const selectedAlbum = availableAlbums.find((a) => a.id === form.albumId);
  const availableVersions = selectedAlbum?.versions || [];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedGroup || !form.memberId || !form.albumId) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }
    const selectedMember = availableMembers.find((m) => m.id === form.memberId);
    const selectedAlbum = availableAlbums.find((a) => a.id === form.albumId);
    const selectedVersion = form.versionId ? availableVersions.find((v) => v.id === form.versionId) : null;
    
    if (!selectedMember || !selectedAlbum) {
      alert("Por favor selecciona un miembro y álbum válidos");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/photocards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupName: selectedGroup.name,
          albumName: selectedAlbum.name,
          memberName: selectedMember.name,
          version: selectedVersion?.name || null,
          imageUrl: form.imageUrl.trim() || undefined,
          addToCatalog: form.addToCatalog,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.catalogId) {
          alert("Photocard añadida al catálogo global. Añádela a tu colección desde el catálogo si la quieres.");
        }
        setOpen(false);
        setSelectedGroupId("");
        setForm({ albumId: "", memberId: "", versionId: "", imageUrl: "", addToCatalog: false });
        router.refresh();
      } else {
        const error = await res.json();
        alert(error.error || "Error al guardar");
      }
    } catch (err) {
      alert("Error al guardar. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--text)] hover:opacity-90"
      >
        + Añadir photocard
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-[var(--bg-secondary)] p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="font-display text-lg font-semibold text-[var(--text)] mb-4">
          Añadir photocard
        </h2>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <select
            value={selectedGroupId}
            onChange={(e) => {
              setSelectedGroupId(e.target.value);
              setForm((f) => ({ ...f, memberId: "" }));
            }}
            required
            className="rounded-xl border border-[var(--accent-secondary)]/40 bg-[var(--bg)] px-3 py-2 text-sm"
          >
            <option value="">Selecciona un grupo *</option>
            {initialGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
          {selectedGroup && (
            <select
              value={form.memberId}
              onChange={(e) => setForm((f) => ({ ...f, memberId: e.target.value }))}
              required
              className="rounded-xl border border-[var(--accent-secondary)]/40 bg-[var(--bg)] px-3 py-2 text-sm"
            >
              <option value="">Selecciona un miembro *</option>
              {availableMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          )}
          <input
            placeholder="Nombre del álbum *"
            value={form.albumName}
            onChange={(e) => setForm((f) => ({ ...f, albumName: e.target.value }))}
            required
            className="rounded-xl border border-[var(--accent-secondary)]/40 bg-[var(--bg)] px-3 py-2 text-sm"
          />
          <input
            placeholder="Versión (opcional)"
            value={form.version}
            onChange={(e) => setForm((f) => ({ ...f, version: e.target.value }))}
            className="rounded-xl border border-[var(--accent-secondary)]/40 bg-[var(--bg)] px-3 py-2 text-sm"
          />
          <input
            placeholder="URL de imagen (opcional)"
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
            Añadir al catálogo global (solo al catálogo, no a tu colección automáticamente)
          </label>
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setSelectedGroupId("");
                setForm({ albumId: "", memberId: "", versionId: "", imageUrl: "", addToCatalog: false });
              }}
              className="flex-1 rounded-xl border border-[var(--accent-secondary)]/40 py-2 text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
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
