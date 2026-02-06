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
  
  // Encontrar el grupo y miembro actuales (comparación case-insensitive)
  const currentGroup = initialGroups.find((g) => 
    g.name.toLowerCase().trim() === item.groupName.toLowerCase().trim()
  );
  const currentMember = currentGroup?.members.find((m) => 
    m.name.toLowerCase().trim() === item.memberName.toLowerCase().trim()
  );
  
  const [selectedGroupId, setSelectedGroupId] = useState<string>(() => {
    return currentGroup?.id || "";
  });
  
  const [form, setForm] = useState({
    albumName: item.albumName,
    memberId: currentMember?.id || "",
    version: item.version || "",
    imageUrl: item.imageUrl,
    rarity: item.rarity || "common",
  });

  const selectedGroup = initialGroups.find((g) => g.id === selectedGroupId);
  const availableMembers = selectedGroup?.members || [];

  // Actualizar memberId cuando cambia el grupo seleccionado
  useEffect(() => {
    if (selectedGroupId && selectedGroupId !== currentGroup?.id) {
      setForm((f) => ({ ...f, memberId: "" }));
    }
  }, [selectedGroupId, currentGroup?.id]);

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
      const res = await fetch(`/api/catalog/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupName: selectedGroup.name,
          albumName: form.albumName.trim(),
          memberName: selectedMember.name,
          version: form.version.trim() || undefined,
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
                No hay grupos disponibles
              </option>
            )}
          </select>
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
