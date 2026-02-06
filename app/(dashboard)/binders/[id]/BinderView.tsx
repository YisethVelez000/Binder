"use client";

import { useState, useEffect } from "react";

type Slot = {
  id: string;
  slotIndex: number;
  photocardId: string | null;
  photocard: {
    id: string;
    memberName: string;
    groupName: string;
    imageUrl: string;
  } | null;
};

type Page = {
  id: string;
  pageIndex: number;
  slots: Slot[];
};

type Binder = {
  id: string;
  name: string;
  pages: Page[];
};

type Photocard = {
  id: string;
  groupName: string;
  memberName: string;
  albumName: string;
  imageUrl: string;
};

export function BinderView({ binder }: { binder: Binder }) {
  const [pageIndex, setPageIndex] = useState(0);
  const [photocards, setPhotocards] = useState<Photocard[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const page = binder.pages[pageIndex];
  const totalPages = binder.pages.length;

  useEffect(() => {
    fetch("/api/photocards")
      .then((r) => r.json())
      .then((data) => setPhotocards(data))
      .catch(() => {});
  }, []);

  async function addPage() {
    await fetch(`/api/binders/${binder.id}/pages`, { method: "POST" });
    window.location.reload();
  }

  async function assignPhotocard(slotId: string, photocardId: string | null) {
    setLoading(true);
    const res = await fetch("/api/slots", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slotId, photocardId }),
    });
    setLoading(false);
    if (res.ok) {
      window.location.reload();
    }
  }

  const availablePhotocards = photocards.filter(
    (card) => !page.slots.some((slot) => slot.photocardId === card.id)
  );

  if (!page) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--accent-secondary)]/40 bg-[var(--bg-secondary)] p-8 text-center">
        <p className="text-[var(--text-muted)] mb-4">Este binder no tiene páginas aún.</p>
        <button
          onClick={addPage}
          className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--text)]"
        >
          Añadir página
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-2xl border border-[var(--accent-secondary)]/30 bg-[var(--bg-secondary)] p-6">
        <div className="grid grid-cols-2 gap-4">
          {page.slots.map((slot) => (
            <div
              key={slot.id}
              className="aspect-[3/4] rounded-xl bg-[var(--bg)] border border-[var(--accent-secondary)]/20 flex items-center justify-center overflow-hidden cursor-pointer hover:border-[var(--accent)] transition"
              onClick={() => setSelectedSlotId(slot.id)}
            >
              {slot.photocard ? (
                <div className="w-full h-full relative group">
                  <img
                    src={slot.photocard.imageUrl}
                    alt={slot.photocard.memberName}
                    className="object-cover w-full h-full"
                  />
                  <p className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 truncate">
                    {slot.photocard.groupName} · {slot.photocard.memberName}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      assignPhotocard(slot.id, null);
                    }}
                    className="absolute top-2 right-2 bg-red-500/80 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                    disabled={loading}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <span className="text-3xl text-[var(--text-muted)]">+</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {selectedSlotId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setSelectedSlotId(null)}
        >
          <div
            className="bg-[var(--bg-secondary)] rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display text-lg font-semibold text-[var(--text)]">
                Seleccionar photocard
              </h3>
              <button
                onClick={() => setSelectedSlotId(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text)]"
              >
                ✕
              </button>
            </div>
            {availablePhotocards.length === 0 ? (
              <p className="text-[var(--text-muted)] text-center py-8">
                No hay photocards disponibles. Todas están asignadas o no tienes ninguna.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {availablePhotocards.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => {
                      assignPhotocard(selectedSlotId, card.id);
                      setSelectedSlotId(null);
                    }}
                    className="aspect-[3/4] rounded-xl overflow-hidden border-2 border-[var(--accent-secondary)]/30 hover:border-[var(--accent)] transition relative"
                    disabled={loading}
                  >
                    <img
                      src={card.imageUrl}
                      alt={card.memberName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2">
                      <p className="font-medium truncate">{card.groupName}</p>
                      <p className="truncate">{card.memberName} · {card.albumName}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
          disabled={pageIndex === 0}
          className="rounded-xl bg-[var(--accent-secondary)]/50 px-4 py-2 text-sm disabled:opacity-40"
        >
          Anterior
        </button>
        <span className="text-sm text-[var(--text-muted)]">
          {pageIndex + 1} / {totalPages}
        </span>
        <button
          onClick={() => setPageIndex((i) => Math.min(totalPages - 1, i + 1))}
          disabled={pageIndex === totalPages - 1}
          className="rounded-xl bg-[var(--accent-secondary)]/50 px-4 py-2 text-sm disabled:opacity-40"
        >
          Siguiente
        </button>
      </div>
      <button
        onClick={addPage}
        className="mt-4 rounded-xl border border-[var(--accent-secondary)]/40 px-4 py-2 text-sm text-[var(--text-muted)] hover:bg-[var(--bg-secondary)]"
      >
        + Añadir página
      </button>
    </div>
  );
}
