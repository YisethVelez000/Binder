"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Member = {
  id: string;
  slug: string;
  name: string;
};

type Group = {
  id: string;
  slug: string;
  name: string;
  members: Member[];
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
  
  // Encontrar el grupo y miembro actuales (comparación case-insensitive)
  const currentGroup = initialGroups.find((g) => 
    g.name.toLowerCase().trim() === photocard.groupName.toLowerCase().trim()
  );
  const currentMember = currentGroup?.members.find((m) => 
    m.name.toLowerCase().trim() === photocard.memberName.toLowerCase().trim()
  );
  
  const [selectedGroupId, setSelectedGroupId] = useState<string>(() => {
    // Inicializar con el grupo actual si existe
    return currentGroup?.id || "";
  });
  
  const [form, setForm] = useState({
    albumName: photocard.albumName,
    memberId: currentMember?.id || "",
    version: photocard.version || "",
    imageUrl: photocard.imageUrl,
    rarity: photocard.rarity,
    addToCatalog: !photocard.catalogId,
  });

  const selectedGroup = initialGroups.find((g) => g.id === selectedGroupId);
  const availableMembers = selectedGroup?.members || [];
  
  // Debug: verificar estado actual
  useEffect(() => {
    console.log("Grupo seleccionado:", selectedGroup);
    console.log("Miembros disponibles:", availableMembers);
    console.log("Miembro actual en form:", form.memberId);
  }, [selectedGroupId, selectedGroup, availableMembers, form.memberId]);

  // Actualizar memberId cuando cambia el grupo seleccionado
  useEffect(() => {
    if (selectedGroupId && selectedGroupId !== currentGroup?.id) {
      setForm((f) => ({ ...f, memberId: "" }));
    }
  }, [selectedGroupId, currentGroup?.id]);

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
    if (!selectedGroup || !form.memberId || !form.albumName.trim()) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }
    const selectedMember = availableMembers.find((m) => m.id === form.memberId);
    if (!selectedMember) {
      alert("Por favor selecciona un miembro válido");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/photocards/${photocard.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupName: selectedGroup.name,
          albumName: form.albumName.trim(),
          memberName: selectedMember.name,
          version: form.version.trim() || undefined,
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
                {!initialGroups ? "Cargando grupos..." : "No hay grupos disponibles. Crea grupos desde la página de Grupos."}
              </option>
            )}
          </select>
          {Array.isArray(initialGroups) && initialGroups.length === 0 && (
            <p className="text-xs text-[var(--text-muted)] bg-yellow-500/20 px-3 py-2 rounded-lg">
              ⚠️ No hay grupos en la base de datos. Ve a la página de <a href="/groups" className="underline">Grupos</a> para crear algunos.
            </p>
          )}
          <label className="text-sm text-[var(--text-muted)]">Miembro *</label>
          {selectedGroupId ? (
            selectedGroup ? (
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
            ) : (
              <div className="text-sm text-[var(--text-muted)] bg-[var(--accent-secondary)]/20 px-3 py-2 rounded-lg">
                Este grupo no tiene miembros. Añade miembros desde la página de Grupos.
              </div>
            )
          ) : (
            <div className="text-sm text-[var(--text-muted)] bg-[var(--accent-secondary)]/20 px-3 py-2 rounded-lg">
              Selecciona un grupo primero para ver sus miembros.
            </div>
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
