"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Member = {
  id: string;
  slug: string;
  name: string;
  imageUrl: string | null;
};

type Group = {
  id: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  members: Member[];
};

export function GroupsView({ groups: initialGroups }: { groups: Group[] }) {
  const router = useRouter();
  const [groups, setGroups] = useState(initialGroups);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [showAddMember, setShowAddMember] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [loading, setLoading] = useState(false);

  async function addGroup(e: React.FormEvent) {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    setLoading(true);
    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newGroupName }),
    });
    setLoading(false);
    if (res.ok) {
      const group = await res.json();
      setGroups([...groups, group]);
      setNewGroupName("");
      setShowAddGroup(false);
      router.refresh();
    }
  }

  async function addMember(groupId: string, e: React.FormEvent) {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/groups/${groupId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newMemberName }),
    });
    setLoading(false);
    if (res.ok) {
      const member = await res.json();
      setGroups(
        groups.map((g) =>
          g.id === groupId ? { ...g, members: [...g.members, member] } : g
        )
      );
      setNewMemberName("");
      setShowAddMember(null);
      router.refresh();
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-[var(--text)]">
          Grupos y Miembros
        </h1>
        <button
          onClick={() => setShowAddGroup(true)}
          className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--text)] hover:opacity-90"
        >
          + Añadir Grupo
        </button>
      </div>

      {showAddGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-[var(--bg-secondary)] p-6 shadow-xl">
            <h2 className="font-display text-lg font-semibold text-[var(--text)] mb-4">
              Añadir Grupo
            </h2>
            <form onSubmit={addGroup} className="flex flex-col gap-3">
              <input
                placeholder="Nombre del grupo"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                required
                className="rounded-xl border border-[var(--accent-secondary)]/40 bg-[var(--bg)] px-3 py-2 text-sm"
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddGroup(false)}
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
      )}

      <div className="space-y-4">
        {groups.map((group) => (
          <div
            key={group.id}
            className="rounded-xl border border-[var(--accent-secondary)]/40 bg-[var(--bg-secondary)] p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-[var(--text)]">
                {group.name}
              </h2>
              <button
                onClick={() => setShowAddMember(group.id)}
                className="rounded-lg bg-[var(--accent-secondary)] px-3 py-1 text-xs font-medium text-[var(--text)] hover:opacity-90"
              >
                + Miembro
              </button>
            </div>
            {showAddMember === group.id && (
              <form
                onSubmit={(e) => addMember(group.id, e)}
                className="mb-3 flex gap-2"
              >
                <input
                  placeholder="Nombre del miembro"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  required
                  className="flex-1 rounded-lg border border-[var(--accent-secondary)]/40 bg-[var(--bg)] px-3 py-1 text-sm"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-[var(--accent)] px-3 py-1 text-sm font-medium disabled:opacity-50"
                >
                  {loading ? "..." : "Añadir"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMember(null);
                    setNewMemberName("");
                  }}
                  className="rounded-lg border border-[var(--accent-secondary)]/40 px-3 py-1 text-sm"
                >
                  Cancelar
                </button>
              </form>
            )}
            <div className="flex flex-wrap gap-2">
              {group.members.map((member) => (
                <span
                  key={member.id}
                  className="rounded-lg bg-[var(--bg)] px-3 py-1 text-sm text-[var(--text)]"
                >
                  {member.name}
                </span>
              ))}
              {group.members.length === 0 && (
                <span className="text-sm text-[var(--text-muted)]">
                  No hay miembros aún
                </span>
              )}
            </div>
          </div>
        ))}
        {groups.length === 0 && (
          <p className="text-center text-[var(--text-muted)]">
            No hay grupos aún. Añade uno para empezar.
          </p>
        )}
      </div>
    </div>
  );
}
