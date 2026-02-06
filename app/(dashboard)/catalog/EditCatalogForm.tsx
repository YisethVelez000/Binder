"use client";

import { useState, useEffect } from "react";
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

type CatalogItem = {
  id: string;
  groupName: string;
  albumName: string;
  memberName: string;
  imageUrl: string;
  version?: string | null;
  rarity?: string;
};

export function EditCatalogForm({
  item,
  groups: initialGroups,
  onClose,
}: {
  item: CatalogItem;
  groups: Group[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Encontrar el grupo, miembro y álbum actuales (comparación case-insensitive)
  const currentGroup = initialGroups.find((g) => 
    g.name.toLowerCase().trim() === item.groupName.toLowerCase().trim()
  );
  const currentMember = currentGroup?.members.find((m) => 
    m.name.toLowerCase().trim() === item.memberName.toLowerCase().trim()
  );
  const currentAlbum = currentGroup?.albums.find((a) => 
    a.name.toLowerCase().trim() === item.albumName.toLowerCase().trim()
  );
  const currentVersion = currentAlbum?.versions.find((v) => 
    item.version && v.name.toLowerCase().trim() === item.version.toLowerCase().trim()
  );
  
  const [selectedGroupId, setSelectedGroupId] = useState<string>(() => {
    return currentGroup?.id || "";
  });
  
  const [form, setForm] = useState({
    albumId: currentAlbum?.id || "",
    memberId: currentMember?.id || "",
    versionId: currentVersion?.id || "",
    imageUrl: item.imageUrl,
    rarity: item.rarity || "common",
  });

  const selectedGroup = initialGroups.find((g) => g.id === selectedGroupId);
  const availableMembers = selectedGroup?.members || [];
  const availableAlbums = selectedGroup?.albums || [];
  const selectedAlbum = availableAlbums.find((a) => a.id === form.albumId);
  const availableVersions = selectedAlbum?.versions || [];

  // Actualizar memberId y albumId cuando cambia el grupo seleccionado
  useEffect(() => {
    if (selectedGroupId && selectedGroupId !== currentGroup?.id) {
      setForm((f) => ({ ...f, memberId: "", albumId: "", versionId: "" }));
    }
  }, [selectedGroupId, currentGroup?.id]);
  
  // Actualizar versionId cuando cambia el álbum seleccionado
  useEffect(() => {
    if (form.albumId && form.albumId !== currentAlbum?.id) {
      setForm((f) => ({ ...f, versionId: "" }));
    }
  }, [form.albumId, currentAlbum?.id]);

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
      const res = await fetch(`/api/catalog/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupName: selectedGroup.name,
          albumName: selectedAlbum.name,
          memberName: selectedMember.name,
          version: selectedVersion?.name || null,
          imageUrl: form.imageUrl.trim(),
          rarity: form.rarity,
        }),
      });
      if (res.ok) {
        router.refresh();
        onClose();
      } else {
        const data = await res.json();
        alert(data.error || "Error al editar");
      }
    } catch (err) {
      alert("Error al editar. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  // Si no hay grupos, mostrar mensaje
  if (!initialGroups || initialGroups.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-md rounded-2xl bg-[var(--bg-secondary)] p-6 shadow-xl">
          <h2 className="font-display text-lg font-semibold text-[var(--text)] mb-4">
            Editar photocard del catálogo global
          </h2>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            No hay grupos disponibles. Por favor crea grupos y miembros primero desde la página de Grupos.
          </p>
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-[var(--accent)] py-2 text-sm font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-[var(--bg-secondary)] p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="font-display text-lg font-semibold text-[var(--text)] mb-4">
          Editar photocard del catálogo global
        </h2>
        <p className="text-xs text-[var(--text-muted)] mb-4 bg-[var(--accent)]/10 px-3 py-2 rounded-lg">
          ⚠️ Esta edición se aplicará a todas las copias de esta photocard en todas las colecciones de usuarios.
        </p>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <label className="text-sm text-[var(--text-muted)]">Grupo *</label>
          <label className="text-sm text-[var(--text-muted)]">Grupo *</label>
          <select
            value={selectedGroupId}
            onChange={(e) => {
              setSelectedGroupId(e.target.value);
              setForm((f) => ({ ...f, memberId: "", albumId: "", versionId: "" }));
            }}
            required
            className="rounded-xl border border-[var(--accent-secondary)]/40 bg-[var(--bg)] px-3 py-2 text-sm"
          >
            <option value="">Selecciona un grupo *</option>
            {Array.isArray(initialGroups) && initialGroups.length > 0 ? (
              initialGroups.map((group) => {
                if (!group || !group.id) return null;
                return (
                  <option key={group.id} value={group.id}>
                    {group.name || "Sin nombre"} {group.id === currentGroup?.id ? "(actual)" : ""}
                  </option>
                );
              })
            ) : (
              <option disabled value="">
                No hay grupos disponibles
              </option>
            )}
          </select>
          {selectedGroup && (
            <>
              <label className="text-sm text-[var(--text-muted)]">Miembro *</label>
              <select
                value={form.memberId}
                onChange={(e) => setForm((f) => ({ ...f, memberId: e.target.value }))}
                required
                className="rounded-xl border border-[var(--accent-secondary)]/40 bg-[var(--bg)] px-3 py-2 text-sm"
              >
                <option value="">Selecciona un miembro *</option>
                {availableMembers && availableMembers.length > 0 ? (
                  availableMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} {member.id === currentMember?.id ? "(actual)" : ""}
                    </option>
                  ))
                ) : (
                  <option disabled>Este grupo no tiene miembros</option>
                )}
              </select>
              <label className="text-sm text-[var(--text-muted)]">Álbum *</label>
              <select
                value={form.albumId}
                onChange={(e) => {
                  setForm((f) => ({ ...f, albumId: e.target.value, versionId: "" }));
                }}
                required
                className="rounded-xl border border-[var(--accent-secondary)]/40 bg-[var(--bg)] px-3 py-2 text-sm"
              >
                <option value="">Selecciona un álbum *</option>
                {availableAlbums && availableAlbums.length > 0 ? (
                  availableAlbums.map((album) => (
                    <option key={album.id} value={album.id}>
                      {album.name} {album.id === currentAlbum?.id ? "(actual)" : ""}
                    </option>
                  ))
                ) : (
                  <option disabled>Este grupo no tiene álbumes</option>
                )}
              </select>
              {selectedAlbum && selectedAlbum.versions.length > 0 && (
                <>
                  <label className="text-sm text-[var(--text-muted)]">Versión</label>
                  <select
                    value={form.versionId}
                    onChange={(e) => setForm((f) => ({ ...f, versionId: e.target.value }))}
                    className="rounded-xl border border-[var(--accent-secondary)]/40 bg-[var(--bg)] px-3 py-2 text-sm"
                  >
                    <option value="">Sin versión específica</option>
                    {availableVersions.map((version) => (
                      <option key={version.id} value={version.id}>
                        {version.name} {version.id === currentVersion?.id ? "(actual)" : ""}
                      </option>
                    ))}
                  </select>
                </>
              )}
            </>
          )}
          <input
            placeholder="URL de imagen"
            value={form.imageUrl}
            onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
            required
            className="rounded-xl border border-[var(--accent-secondary)]/40 bg-[var(--bg)] px-3 py-2 text-sm"
          />
          <select
            value={form.rarity}
            onChange={(e) => setForm((f) => ({ ...f, rarity: e.target.value }))}
            className="rounded-xl border border-[var(--accent-secondary)]/40 bg-[var(--bg)] px-3 py-2 text-sm"
          >
            <option value="common">Común</option>
            <option value="limited">Limitada</option>
            <option value="pob">POB</option>
            <option value="special">Especial</option>
          </select>
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
              {loading ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
