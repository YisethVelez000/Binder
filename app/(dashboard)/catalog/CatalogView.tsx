"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EditCatalogForm } from "./EditCatalogForm";

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
  addedBy?: string | null;
};

export function CatalogView({
  catalog,
  userCatalogIds,
  userId,
  groups,
}: {
  catalog: CatalogItem[];
  userCatalogIds: string[];
  userId: string;
  groups: Group[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const filtered = catalog.filter((item) => {
    if (!search) return true;
    const query = search.toLowerCase();
    return (
      item.groupName.toLowerCase().includes(query) ||
      item.albumName.toLowerCase().includes(query) ||
      item.memberName.toLowerCase().includes(query)
    );
  });

  async function addToCollection(catalogId: string) {
    setLoading(catalogId);
    const res = await fetch("/api/catalog/add-to-collection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ catalogId }),
    });
    setLoading(null);
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error || "Error al añadir");
    }
  }

  const editingItem = editingId ? catalog.find((item) => item.id === editingId) : null;

  return (
    <div>
      <input
        type="text"
        placeholder="Buscar por grupo, álbum o miembro..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-xl border border-[var(--accent-secondary)]/40 bg-[var(--bg)] px-4 py-2 mb-6 text-[var(--text)]"
      />
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {filtered.map((item) => {
          const hasIt = userCatalogIds.includes(item.id);
          const isCreator = item.addedBy === userId;
          return (
            <div
              key={item.id}
              className="rounded-2xl border border-[var(--accent-secondary)]/30 bg-[var(--bg-secondary)] overflow-hidden group relative"
            >
              <div className="aspect-[3/4] bg-[var(--bg)] relative">
                <img
                  src={item.imageUrl}
                  alt={item.memberName}
                  className="w-full h-full object-cover"
                />
                {isCreator && (
                  <button
                    onClick={() => setEditingId(item.id)}
                    className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                  >
                    ✏️ Editar
                  </button>
                )}
              </div>
              <div className="p-3">
                <p className="font-medium text-[var(--text)] truncate">{item.groupName}</p>
                <p className="text-sm text-[var(--text-muted)] truncate">
                  {item.memberName} · {item.albumName}
                </p>
                {item.version && (
                  <p className="text-xs text-[var(--text-muted)]">{item.version}</p>
                )}
                <button
                  onClick={() => addToCollection(item.id)}
                  disabled={hasIt || loading === item.id}
                  className={`mt-2 w-full rounded-xl py-2 text-sm font-medium transition ${
                    hasIt
                      ? "bg-[var(--accent-secondary)]/30 text-[var(--text-muted)] cursor-not-allowed"
                      : "bg-[var(--accent)] text-[var(--text)] hover:opacity-90"
                  }`}
                >
                  {hasIt ? "✓ Ya en tu colección" : loading === item.id ? "Añadiendo…" : "+ Añadir a mi colección"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {filtered.length === 0 && (
        <p className="text-center text-[var(--text-muted)] py-8">
          {search ? "No se encontraron resultados" : "El catálogo está vacío"}
        </p>
      )}
      {editingItem && (
        <EditCatalogForm
          item={editingItem}
          groups={groups}
          onClose={() => setEditingId(null)}
        />
      )}
    </div>
  );
}
