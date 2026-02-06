"use client";

import { useState, useEffect } from "react";
import { EditPhotocardForm } from "./EditPhotocardForm";

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
  memberName: string;
  albumName: string;
  imageUrl: string;
  catalogId?: string | null;
  groupSlug: string;
  albumSlug: string;
  memberSlug: string;
  version?: string | null;
  rarity: string;
};

export function PhotocardCard({ photocard, groups }: { photocard: Photocard; groups: Group[] }) {
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    console.log("PhotocardCard - Grupos recibidos:", groups);
    console.log("PhotocardCard - Número de grupos:", groups?.length || 0);
  }, [groups]);

  return (
    <>
      <div className="rounded-2xl border border-[var(--accent-secondary)]/30 bg-[var(--bg-secondary)] overflow-hidden group relative">
        <div className="aspect-[3/4] bg-[var(--bg)] relative">
          <img
            src={photocard.imageUrl}
            alt={photocard.memberName}
            className="w-full h-full object-cover"
          />
          {photocard.catalogId && (
            <div className="absolute top-2 right-2 bg-[var(--accent)]/90 text-white text-xs px-2 py-1 rounded-full">
              🌐 Global
            </div>
          )}
          <button
            onClick={() => setEditing(true)}
            className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition"
          >
            ✏️ Editar
          </button>
        </div>
        <div className="p-3">
          <p className="font-medium text-[var(--text)] truncate">{photocard.groupName}</p>
          <p className="text-sm text-[var(--text-muted)] truncate">
            {photocard.memberName} · {photocard.albumName}
          </p>
        </div>
      </div>
      {editing && (
        <EditPhotocardForm
          photocard={photocard}
          groups={groups}
          onClose={() => setEditing(false)}
        />
      )}
    </>
  );
}
