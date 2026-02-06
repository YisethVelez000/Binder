"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Group = {
  id: string;
  name: string;
};

type AlbumVersion = {
  id: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  color: string | null;
};

type Album = {
  id: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  releaseDate: string | null;
  group: Group;
  versions: AlbumVersion[];
};

export function AlbumsView({
  groups: initialGroups,
  albums: initialAlbums,
}: {
  groups: Group[];
  albums: Album[];
}) {
  const router = useRouter();
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [showAddAlbum, setShowAddAlbum] = useState(false);
  const [editingAlbumId, setEditingAlbumId] = useState<string | null>(null);
  const [editingVersionId, setEditingVersionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const filteredAlbums = selectedGroupId
    ? initialAlbums.filter((a) => a.group.id === selectedGroupId)
    : initialAlbums;
  
  const editingAlbum = editingAlbumId ? initialAlbums.find((a) => a.id === editingAlbumId) : null;
  const editingVersion = editingAlbum && editingVersionId
    ? editingAlbum.versions.find((v) => v.id === editingVersionId)
    : null;
  
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-[var(--text)]">
          Álbumes
        </h1>
        <div className="flex gap-4">
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="rounded-xl border border-[var(--accent-secondary)]/40 bg-[var(--bg)] px-3 py-2 text-sm"
          >
            <option value="">Todos los grupos</option>
            {initialGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowAddAlbum(true)}
            className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--text)] hover:opacity-90"
          >
            + Añadir Álbum
          </button>
          <Link
            href="/albums/collection"
            className="rounded-xl border border-[var(--accent-secondary)]/40 px-4 py-2 text-sm font-medium text-[var(--text)] hover:opacity-90"
          >
            Mi Colección
          </Link>
        </div>
      </div>
      
      {showAddAlbum && (
        <AddAlbumForm
          groups={initialGroups}
          onClose={() => setShowAddAlbum(false)}
          onSuccess={() => {
            setShowAddAlbum(false);
            router.refresh();
          }}
        />
      )}
      
      {editingAlbum && !editingVersionId && (
        <EditAlbumForm
          album={editingAlbum}
          groups={initialGroups}
          onClose={() => setEditingAlbumId(null)}
          onSuccess={() => {
            setEditingAlbumId(null);
            router.refresh();
          }}
        />
      )}
      
      {editingVersion && (
        <EditVersionForm
          version={editingVersion}
          album={editingAlbum!}
          onClose={() => {
            setEditingVersionId(null);
            setEditingAlbumId(null);
          }}
          onSuccess={() => {
            setEditingVersionId(null);
            setEditingAlbumId(null);
            router.refresh();
          }}
        />
      )}
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredAlbums.map((album) => (
          <div
            key={album.id}
            className="rounded-2xl border border-[var(--accent-secondary)]/30 bg-[var(--bg-secondary)] overflow-hidden group relative"
          >
            <div className="aspect-square bg-[var(--bg)] relative">
              {album.imageUrl ? (
                <img src={album.imageUrl} alt={album.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl text-[var(--text-muted)]">
                  💿
                </div>
              )}
              <button
                onClick={() => setEditingAlbumId(album.id)}
                className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition"
              >
                ✏️ Editar
              </button>
            </div>
            <div className="p-4">
              <p className="font-medium text-[var(--text)] truncate">{album.name}</p>
              <p className="text-sm text-[var(--text-muted)] truncate">{album.group.name}</p>
              {album.releaseDate && (
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {new Date(album.releaseDate).getFullYear()}
                </p>
              )}
              <div className="mt-3">
                <p className="text-xs font-medium text-[var(--text-muted)] mb-2">
                  Versiones ({album.versions.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {album.versions.map((version) => (
                    <div
                      key={version.id}
                      className="flex items-center gap-1 rounded-lg bg-[var(--bg)] px-2 py-1 text-xs group/version relative"
                    >
                      {version.color && (
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: version.color }}
                        />
                      )}
                      <span>{version.name}</span>
                      <button
                        onClick={() => {
                          setEditingAlbumId(album.id);
                          setEditingVersionId(version.id);
                        }}
                        className="opacity-0 group-hover/version:opacity-100 text-[var(--accent)]"
                      >
                        ✏️
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setEditingAlbumId(album.id);
                      setEditingVersionId("new");
                    }}
                    className="rounded-lg bg-[var(--accent-secondary)]/30 px-2 py-1 text-xs text-[var(--text-muted)] hover:bg-[var(--accent-secondary)]/50"
                  >
                    + Versión
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredAlbums.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[var(--accent-secondary)]/40 bg-[var(--bg-secondary)] p-8 text-center">
          <p className="text-4xl mb-2">💿</p>
          <p className="text-[var(--text-muted)]">
            {selectedGroupId ? "Este grupo no tiene álbumes aún." : "No hay álbumes aún."}
          </p>
        </div>
      )}
    </div>
  );
}

function AddAlbumForm({
  groups,
  onClose,
  onSuccess,
}: {
  groups: Group[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({ groupId: "", name: "", imageUrl: "", releaseDate: "" });
  const [loading, setLoading] = useState(false);
  
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.groupId || !form.name.trim()) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/albums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: form.groupId,
          name: form.name.trim(),
          imageUrl: form.imageUrl.trim() || undefined,
          releaseDate: form.releaseDate || undefined,
        }),
      });
      if (res.ok) {
        onSuccess();
      } else {
        const error = await res.json();
        alert(error.error || "Error al crear");
      }
    } catch (err) {
      alert("Error al crear. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-[var(--bg-secondary)] p-6 shadow-xl">
        <h2 className="font-display text-lg font-semibold text-[var(--text)] mb-4">
          Añadir Álbum
        </h2>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <select
            value={form.groupId}
            onChange={(e) => setForm((f) => ({ ...f, groupId: e.target.value }))}
            required
            className="rounded-xl border border-[var(--accent-secondary)]/40 bg-[var(--bg)] px-3 py-2 text-sm"
          >
            <option value="">Selecciona un grupo *</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
          <input
            placeholder="Nombre del álbum *"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
            className="rounded-xl border border-[var(--accent-secondary)]/40 bg-[var(--bg)] px-3 py-2 text-sm"
          />
          <input
            placeholder="URL de imagen (opcional)"
            value={form.imageUrl}
            onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
            className="rounded-xl border border-[var(--accent-secondary)]/40 bg-[var(--bg)] px-3 py-2 text-sm"
          />
          <input
            type="date"
            placeholder="Fecha de lanzamiento (opcional)"
            value={form.releaseDate}
            onChange={(e) => setForm((f) => ({ ...f, releaseDate: e.target.value }))}
            className="rounded-xl border border-[var(--accent-secondary)]/40 bg-[var(--bg)] px-3 py-2 text-sm"
          />
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
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

function EditAlbumForm({
  album,
  groups,
  onClose,
  onSuccess,
}: {
  album: Album;
  groups: Group[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    name: album.name,
    imageUrl: album.imageUrl || "",
    releaseDate: album.releaseDate ? new Date(album.releaseDate).toISOString().split("T")[0] : "",
  });
  const [loading, setLoading] = useState(false);
  
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/albums/${album.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          imageUrl: form.imageUrl.trim() || null,
          releaseDate: form.releaseDate || null,
        }),
      });
      if (res.ok) {
        onSuccess();
      } else {
        const error = await res.json();
        alert(error.error || "Error al editar");
      }
    } catch (err) {
      alert("Error al editar. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-[var(--bg-secondary)] p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="font-display text-lg font-semibold text-[var(--text)] mb-4">
          Editar Álbum
        </h2>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            placeholder="Nombre del álbum *"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
            className="rounded-xl border border-[var(--accent-secondary)]/40 bg-[var(--bg)] px-3 py-2 text-sm"
          />
          <input
            placeholder="URL de imagen"
            value={form.imageUrl}
            onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
            className="rounded-xl border border-[var(--accent-secondary)]/40 bg-[var(--bg)] px-3 py-2 text-sm"
          />
          <input
            type="date"
            placeholder="Fecha de lanzamiento"
            value={form.releaseDate}
            onChange={(e) => setForm((f) => ({ ...f, releaseDate: e.target.value }))}
            className="rounded-xl border border-[var(--accent-secondary)]/40 bg-[var(--bg)] px-3 py-2 text-sm"
          />
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
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

function EditVersionForm({
  version,
  album,
  onClose,
  onSuccess,
}: {
  version: AlbumVersion | null;
  album: Album;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const isNew = !version;
  const [form, setForm] = useState({
    name: version?.name || "",
    imageUrl: version?.imageUrl || "",
    color: version?.color || "",
  });
  const [loading, setLoading] = useState(false);
  
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      alert("Por favor completa el nombre");
      return;
    }
    setLoading(true);
    try {
      const url = isNew
        ? `/api/albums/${album.id}/versions`
        : `/api/albums/versions/${version.id}`;
      const method = isNew ? "POST" : "PATCH";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          imageUrl: form.imageUrl.trim() || null,
          color: form.color.trim() || null,
        }),
      });
      if (res.ok) {
        onSuccess();
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
  
  async function handleDelete() {
    if (!version || !confirm("¿Estás seguro de eliminar esta versión?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/albums/versions/${version.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        onSuccess();
      } else {
        const error = await res.json();
        alert(error.error || "Error al eliminar");
      }
    } catch (err) {
      alert("Error al eliminar. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-[var(--bg-secondary)] p-6 shadow-xl">
        <h2 className="font-display text-lg font-semibold text-[var(--text)] mb-4">
          {isNew ? "Añadir Versión" : "Editar Versión"}
        </h2>
        <p className="text-xs text-[var(--text-muted)] mb-4">
          Álbum: <strong>{album.name}</strong>
        </p>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            placeholder="Nombre de la versión *"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
            className="rounded-xl border border-[var(--accent-secondary)]/40 bg-[var(--bg)] px-3 py-2 text-sm"
          />
          <input
            placeholder="URL de imagen (opcional)"
            value={form.imageUrl}
            onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
            className="rounded-xl border border-[var(--accent-secondary)]/40 bg-[var(--bg)] px-3 py-2 text-sm"
          />
          <input
            type="color"
            placeholder="Color (opcional)"
            value={form.color || "#ffffff"}
            onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
            className="rounded-xl border border-[var(--accent-secondary)]/40 bg-[var(--bg)] px-3 py-2 text-sm h-12"
          />
          <div className="flex gap-2 mt-2">
            {!isNew && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 rounded-xl border border-red-500/40 text-red-500 py-2 text-sm disabled:opacity-50"
              >
                Eliminar
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
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
