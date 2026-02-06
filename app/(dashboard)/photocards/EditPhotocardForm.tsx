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

type Photocard = {
  id: string;
  groupName: string;
  albumName: string;
  version?: string | null;
  memberName: string;
  imageUrl: string;
  rarity: string;
  catalogId?: string | null;
};

export function EditPhotocardForm({
  photocard,
  groups: initialGroups,
  onClose,
}: {
  photocard: Photocard;
  groups: Group[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Debug: verificar que los grupos se están recibiendo
  useEffect(() => {
    console.log("Grupos recibidos:", initialGroups);
    console.log("Photocard actual:", photocard);
  }, [initialGroups, photocard]);
  
  // Encontrar el grupo, miembro y álbum actuales (comparación case-insensitive)
  const currentGroup = initialGroups.find((g) => 
    g.name.toLowerCase().trim() === photocard.groupName.toLowerCase().trim()
  );
  const currentMember = currentGroup?.members.find((m) => 
    m.name.toLowerCase().trim() === photocard.memberName.toLowerCase().trim()
  );
  const currentAlbum = currentGroup?.albums.find((a) => 
    a.name.toLowerCase().trim() === photocard.albumName.toLowerCase().trim()
  );
  const currentVersion = currentAlbum?.versions.find((v) => 
    photocard.version && v.name.toLowerCase().trim() === photocard.version.toLowerCase().trim()
  );
  
  const [selectedGroupId, setSelectedGroupId] = useState<string>(() => {
    return currentGroup?.id || "";
  });
  
  const [form, setForm] = useState({
    albumId: currentAlbum?.id || "",
    memberId: currentMember?.id || "",
    versionId: currentVersion?.id || "",
    imageUrl: photocard.imageUrl,
    rarity: photocard.rarity,
    addToCatalog: !photocard.catalogId,
  });

  const selectedGroup = initialGroups.find((g) => g.id === selectedGroupId);
  const availableMembers = selectedGroup?.members || [];
  const availableAlbums = selectedGroup?.albums || [];
  const selectedAlbum = availableAlbums.find((a) => a.id === form.albumId);
  const availableVersions = selectedAlbum?.versions || [];
  
  // Debug: verificar estado actual
  useEffect(() => {
    console.log("Grupo seleccionado:", selectedGroup);
    console.log("Miembros disponibles:", availableMembers);
    console.log("Miembro actual en form:", form.memberId);
  }, [selectedGroupId, selectedGroup, availableMembers, form.memberId]);

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

  // Si no hay grupos, mostrar mensaje
  if (!initialGroups || initialGroups.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-md rounded-2xl bg-[var(--bg-secondary)] p-6 shadow-xl">
          <h2 className="font-display text-lg font-semibold text-[var(--text)] mb-4">
            Editar photocard
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
      const res = await fetch(`/api/photocards/${photocard.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupName: selectedGroup.name,
          albumName: selectedAlbum.name,
          memberName: selectedMember.name,
          version: selectedVersion?.name || null,
          imageUrl: form.imageUrl.trim(),
          rarity: form.rarity,
          addToCatalog: form.addToCatalog && !photocard.catalogId,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-[var(--bg-secondary)] p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="font-display text-lg font-semibold text-[var(--text)] mb-4">
          Editar photocard
        </h2>
        {photocard.catalogId && (
          <p className="text-xs text-[var(--text-muted)] mb-3 bg-[var(--accent-secondary)]/20 px-3 py-2 rounded-lg">
            ⚠️ Esta photocard está en el catálogo global. Si no eres el creador, no puedes editarla aquí. 
            Edítala desde el catálogo si eres el creador.
          </p>
        )}
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
          {!photocard.catalogId && (
            <label className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <input
                type="checkbox"
                checked={form.addToCatalog}
                onChange={(e) => setForm((f) => ({ ...f, addToCatalog: e.target.checked }))}
                className="rounded"
              />
              Añadir al catálogo global (para que otros usuarios la vean)
            </label>
          )}
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
