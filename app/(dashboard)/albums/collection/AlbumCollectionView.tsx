"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

type CollectionItem = {
  id: string;
  albumId: string;
  versionId: string | null;
  notes: string | null;
  album: Album;
  version: AlbumVersion | null;
};

export function AlbumCollectionView({
  collection,
  availableAlbums,
  userAlbumIds,
}: {
  collection: CollectionItem[];
  availableAlbums: Album[];
  userAlbumIds: string[];
}) {
  const router = useRouter();
  const [showAddAlbum, setShowAddAlbum] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const editingItem = editingId ? collection.find((c) => c.id === editingId) : null;
  
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-[var(--text)]">
          Mi Colección de Álbumes
        </h1>
        <button
          onClick={() => setShowAddAlbum(true)}
          className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--text)] hover:opacity-90"
        >
          + Añadir Álbum
        </button>
      </div>
      
      {showAddAlbum && (
        <AddAlbumToCollectionForm
          albums={availableAlbums}
          userAlbumIds={userAlbumIds}
          onClose={() => setShowAddAlbum(false)}
          onSuccess={() => {
            setShowAddAlbum(false);
            router.refresh();
          }}
        />
      )}
      
      {editingItem && (
        <EditCollectionItemForm
          item={editingItem}
          album={editingItem.album}
          onClose={() => setEditingId(null)}
          onSuccess={() => {
            setEditingId(null);
            router.refresh();
          }}
        />
      )}
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {collection.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-[var(--accent-secondary)]/30 bg-[var(--bg-secondary)] overflow-hidden group relative"
          >
            <div className="aspect-square bg-[var(--bg)] relative">
              {item.album.imageUrl ? (
                <img src={item.album.imageUrl} alt={item.album.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl text-[var(--text-muted)]">
                  💿
                </div>
              )}
              <button
                onClick={() => setEditingId(item.id)}
                className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition"
              >
                ✏️ Editar
              </button>
            </div>
            <div className="p-4">
              <p className="font-medium text-[var(--text)] truncate">{item.album.name}</p>
              <p className="text-sm text-[var(--text-muted)] truncate">{item.album.group.name}</p>
              {item.version && (
                <div className="mt-2 flex items-center gap-2">
                  {item.version.color && (
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: item.version.color }}
                    />
                  )}
                  <span className="text-xs text-[var(--text-muted)]">{item.version.name}</span>
                </div>
              )}
              {item.notes && (
                <p className="text-xs text-[var(--text-muted)] mt-2 line-clamp-2">{item.notes}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {collection.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[var(--accent-secondary)]/40 bg-[var(--bg-secondary)] p-8 text-center">
          <p className="text-4xl mb-2">💿</p>
          <p className="text-[var(--text-muted)]">Tu colección de álbumes está vacía.</p>
        </div>
      )}
    </div>
  );
}

function AddAlbumToCollectionForm({
  albums,
  userAlbumIds,
  onClose,
  onSuccess,
}: {
  albums: Album[];
  userAlbumIds: string[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({ albumId: "", versionId: "", notes: "" });
  const [loading, setLoading] = useState(false);
  
  const selectedAlbum = albums.find((a) => a.id === form.albumId);
  const availableVersions = selectedAlbum?.versions || [];
  
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.albumId) {
      alert("Por favor selecciona un álbum");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/albums/collection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          albumId: form.albumId,
          versionId: form.versionId || null,
          notes: form.notes.trim() || null,
        }),
      });
      if (res.ok) {
        onSuccess();
      } else {
        const error = await res.json();
        alert(error.error || "Error al añadir");
      }
    } catch (err) {
      alert("Error al añadir. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-[var(--bg-secondary)] p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="font-display text-lg font-semibold text-[var(--text)] mb-4">
          Añadir Álbum a Mi Colección
        </h2>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <select
            value={form.albumId}
            onChange={(e) => {
              setForm((f) => ({ ...f, albumId: e.target.value, versionId: "" }));
            }}
            required
            className="rounded-xl border border-[var(--accent-secondary)]/40 bg-[var(--bg)] px-3 py-2 text-sm"
          >
            <option value="">Selecciona un álbum *</option>
            {albums.map((album) => (
              <option key={album.id} value={album.id} disabled={userAlbumIds.includes(album.id)}>
                {album.group.name} - {album.name} {userAlbumIds.includes(album.id) ? "(ya en colección)" : ""}
              </option>
            ))}
          </select>
          {selectedAlbum && selectedAlbum.versions.length > 0 && (
            <select
              value={form.versionId}
              onChange={(e) => setForm((f) => ({ ...f, versionId: e.target.value }))}
              className="rounded-xl border border-[var(--accent-secondary)]/40 bg-[var(--bg)] px-3 py-2 text-sm"
            >
              <option value="">Sin versión específica</option>
              {availableVersions.map((version) => (
                <option key={version.id} value={version.id}>
                  {version.name}
                </option>
              ))}
            </select>
          )}
          <textarea
            placeholder="Notas (opcional)"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            className="rounded-xl border border-[var(--accent-secondary)]/40 bg-[var(--bg)] px-3 py-2 text-sm"
            rows={2}
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
              {loading ? "Añadiendo…" : "Añadir"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditCollectionItemForm({
  item,
  album,
  onClose,
  onSuccess,
}: {
  item: CollectionItem;
  album: Album;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    versionId: item.versionId || "",
    notes: item.notes || "",
  });
  const [loading, setLoading] = useState(false);
  
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/albums/collection/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          versionId: form.versionId || null,
          notes: form.notes.trim() || null,
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
  
  async function handleDelete() {
    if (!confirm("¿Estás seguro de eliminar este álbum de tu colección?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/albums/collection/${item.id}`, {
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
          Editar Álbum en Colección
        </h2>
        <p className="text-xs text-[var(--text-muted)] mb-4">
          {album.group.name} - {album.name}
        </p>
        <form onSubmit={submit} className="flex flex-col gap-3">
          {album.versions.length > 0 && (
            <select
              value={form.versionId}
              onChange={(e) => setForm((f) => ({ ...f, versionId: e.target.value }))}
              className="rounded-xl border border-[var(--accent-secondary)]/40 bg-[var(--bg)] px-3 py-2 text-sm"
            >
              <option value="">Sin versión específica</option>
              {album.versions.map((version) => (
                <option key={version.id} value={version.id}>
                  {version.name}
                </option>
              ))}
            </select>
          )}
          <textarea
            placeholder="Notas"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            className="rounded-xl border border-[var(--accent-secondary)]/40 bg-[var(--bg)] px-3 py-2 text-sm"
            rows={3}
          />
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 rounded-xl border border-red-500/40 text-red-500 py-2 text-sm disabled:opacity-50"
            >
              Eliminar
            </button>
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
