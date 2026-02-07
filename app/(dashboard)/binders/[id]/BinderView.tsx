"use client";

import { useState, useEffect } from "react";
import { CoverPage } from "./CoverPage";
import { PocketsPage } from "./PocketsPage";
import { ArrowLeft, X } from "react-bootstrap-icons";

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
  pageType?: string;
  slots: Slot[];
};

type Binder = {
  id: string;
  name: string;
  theme: string;
  primaryColor: string | null;
  secondaryColor: string | null;
  accentColor: string | null;
  coverImageUrl: string | null;
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
  
  // Colores del binder con valores por defecto estilo macaroon
  const primaryColor = binder.primaryColor || "#FFB6C1";
  const secondaryColor = binder.secondaryColor || "#E6E6FA";
  const accentColor = binder.accentColor || "#FFD700";

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
    (card) => !page?.slots.some((slot) => slot.photocardId === card.id)
  );

  // Renderizar portada
  if (page?.pageType === "cover") {
    return (
      <div>
        <CoverPage
          pageId={page.id}
          binderId={binder.id}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          accentColor={accentColor}
          coverImageUrl={binder.coverImageUrl}
        />
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
            disabled={pageIndex === 0}
            className="rounded-2xl px-5 py-2.5 text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
            style={{
              background: pageIndex === 0 
                ? `${secondaryColor}30` 
                : `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
              color: pageIndex === 0 ? "var(--text-muted)" : "white",
              boxShadow: pageIndex === 0 ? "none" : `0 4px 12px ${primaryColor}40`,
            }}
          >
            <ArrowLeft size={16} className="inline mr-1" /> Anterior
          </button>
          <span 
            className="text-sm font-medium px-4 py-2 rounded-2xl"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}20, ${secondaryColor}20)`,
              color: accentColor,
            }}
          >
            Portada
          </span>
          <button
            onClick={() => setPageIndex((i) => Math.min(totalPages - 1, i + 1))}
            disabled={pageIndex === totalPages - 1}
            className="rounded-2xl px-5 py-2.5 text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
            style={{
              background: pageIndex === totalPages - 1
                ? `${secondaryColor}30`
                : `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
              color: pageIndex === totalPages - 1 ? "var(--text-muted)" : "white",
              boxShadow: pageIndex === totalPages - 1 ? "none" : `0 4px 12px ${primaryColor}40`,
            }}
          >
            Siguiente →
          </button>
        </div>
      </div>
    );
  }

  // Renderizar página con bolsillos
  if (page?.pageType === "pockets") {
    return (
      <div>
        <PocketsPage
          pageId={page.id}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          accentColor={accentColor}
        />
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
            disabled={pageIndex === 0}
            className="rounded-2xl px-5 py-2.5 text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
            style={{
              background: pageIndex === 0 
                ? `${secondaryColor}30` 
                : `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
              color: pageIndex === 0 ? "var(--text-muted)" : "white",
              boxShadow: pageIndex === 0 ? "none" : `0 4px 12px ${primaryColor}40`,
            }}
          >
            <ArrowLeft size={16} className="inline mr-1" /> Anterior
          </button>
          <span 
            className="text-sm font-medium px-4 py-2 rounded-2xl"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}20, ${secondaryColor}20)`,
              color: accentColor,
            }}
          >
            {pageIndex + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPageIndex((i) => Math.min(totalPages - 1, i + 1))}
            disabled={pageIndex === totalPages - 1}
            className="rounded-2xl px-5 py-2.5 text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
            style={{
              background: pageIndex === totalPages - 1
                ? `${secondaryColor}30`
                : `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
              color: pageIndex === totalPages - 1 ? "var(--text-muted)" : "white",
              boxShadow: pageIndex === totalPages - 1 ? "none" : `0 4px 12px ${primaryColor}40`,
            }}
          >
            Siguiente →
          </button>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div 
        className="rounded-3xl p-12 text-center shadow-2xl border-2 border-dashed"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}10, ${secondaryColor}10)`,
          borderColor: `${accentColor}40`,
          boxShadow: `0 20px 60px ${primaryColor}20`,
        }}
      >
        <p 
          className="mb-6 font-medium"
          style={{ color: accentColor }}
        >
          Este binder no tiene páginas aún.
        </p>
        <button
          onClick={addPage}
          className="rounded-2xl px-6 py-3 text-sm font-medium transition-all shadow-lg hover:scale-105"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
            color: "white",
            boxShadow: `0 4px 12px ${primaryColor}40`,
          }}
        >
          + Añadir página
        </button>
      </div>
    );
  }

  return (
    <div>
      <div 
        className="rounded-3xl p-8 shadow-2xl transition-all"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}15, ${secondaryColor}15)`,
          border: `3px solid ${accentColor}30`,
          boxShadow: `0 20px 60px ${primaryColor}20, 0 0 0 1px ${secondaryColor}40`,
        }}
      >
        <div className="grid grid-cols-2 gap-6">
          {page.slots.map((slot) => (
            <div
              key={slot.id}
              className="aspect-[3/4] rounded-2xl flex items-center justify-center overflow-hidden cursor-pointer transition-all transform hover:scale-[1.02] hover:shadow-xl"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}20, ${secondaryColor}20)`,
                border: `2px solid ${accentColor}40`,
                boxShadow: `0 8px 24px ${primaryColor}15`,
              }}
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          style={{ background: `linear-gradient(135deg, ${primaryColor}40, ${secondaryColor}40)` }}
          onClick={() => setSelectedSlotId(null)}
        >
          <div
            className="rounded-3xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl border-2"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}15, ${secondaryColor}15)`,
              borderColor: `${accentColor}40`,
              boxShadow: `0 20px 60px ${primaryColor}30`,
            }}
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
                <X size={20} />
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
                    <div 
                      className="absolute bottom-0 left-0 right-0 text-white text-xs p-2 backdrop-blur-sm"
                      style={{
                        background: `linear-gradient(to top, ${primaryColor}E6, ${secondaryColor}E6)`,
                      }}
                    >
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

      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
          disabled={pageIndex === 0}
          className="rounded-2xl px-5 py-2.5 text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
          style={{
            background: pageIndex === 0 
              ? `${secondaryColor}30` 
              : `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
            color: pageIndex === 0 ? "var(--text-muted)" : "white",
            boxShadow: pageIndex === 0 ? "none" : `0 4px 12px ${primaryColor}40`,
          }}
        >
          ← Anterior
        </button>
        <span 
          className="text-sm font-medium px-4 py-2 rounded-2xl"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}20, ${secondaryColor}20)`,
            color: accentColor,
          }}
        >
          {pageIndex + 1} / {totalPages}
        </span>
        <button
          onClick={() => setPageIndex((i) => Math.min(totalPages - 1, i + 1))}
          disabled={pageIndex === totalPages - 1}
          className="rounded-2xl px-5 py-2.5 text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
          style={{
            background: pageIndex === totalPages - 1
              ? `${secondaryColor}30`
              : `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
            color: pageIndex === totalPages - 1 ? "var(--text-muted)" : "white",
            boxShadow: pageIndex === totalPages - 1 ? "none" : `0 4px 12px ${primaryColor}40`,
          }}
        >
          Siguiente →
        </button>
      </div>
      <button
        onClick={addPage}
        className="mt-4 rounded-2xl px-5 py-2.5 text-sm font-medium transition-all shadow-lg hover:scale-105"
        style={{
          background: `linear-gradient(135deg, ${accentColor}20, ${primaryColor}20)`,
          border: `2px solid ${accentColor}40`,
          color: accentColor,
          boxShadow: `0 4px 12px ${accentColor}30`,
        }}
      >
        + Añadir página
      </button>
    </div>
  );
}
