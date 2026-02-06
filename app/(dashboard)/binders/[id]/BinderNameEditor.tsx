"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function BinderNameEditor({ binderId, initialName }: { binderId: string; initialName: string }) {
  const [name, setName] = useState(initialName);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function save() {
    if (!name.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/binders/${binderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setLoading(false);
    if (res.ok) {
      setEditing(false);
      router.refresh();
    }
  }

  if (editing) {
    return (
      <div className="mb-6 flex items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") {
              setName(initialName);
              setEditing(false);
            }
          }}
          autoFocus
          className="font-display text-2xl font-semibold text-[var(--text)] bg-transparent border-b border-[var(--accent-secondary)]/40 focus:outline-none focus:border-[var(--accent)]"
        />
        {loading && <span className="text-sm text-[var(--text-muted)]">Guardando...</span>}
      </div>
    );
  }

  return (
    <h1
      className="font-display text-2xl font-semibold text-[var(--text)] mb-6 cursor-pointer hover:opacity-80"
      onClick={() => setEditing(true)}
      title="Haz clic para editar"
    >
      {name} ✏️
    </h1>
  );
}
