"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash, Vinyl } from "react-bootstrap-icons";

type BinderCardProps = {
  binder: {
    id: string;
    name: string;
    coverImageUrl: string | null;
    pagesCount: number;
    cardCount: number;
  };
};

export function BinderCard({ binder }: BinderCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm(`¿Estás seguro de eliminar "${binder.name}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    setLoading(true);
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/binders/${binder.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      } else {
        const errorData = await res.json().catch(() => ({ error: "Error desconocido" }));
        alert(`Error al eliminar binder: ${errorData.error || "Error desconocido"}`);
        setIsDeleting(false);
      }
    } catch (err) {
      console.error("Error deleting binder:", err);
      alert(`Error al eliminar binder: ${err instanceof Error ? err.message : "Error de conexión"}`);
      setIsDeleting(false);
    } finally {
      setLoading(false);
    }
  }

  if (isDeleting) {
    return (
      <div className="rounded-2xl border border-[var(--accent-secondary)]/30 bg-[var(--bg-secondary)] p-6 opacity-50">
        <div className="aspect-video rounded-xl bg-[var(--accent)]/20 mb-3 flex items-center justify-center">
          <span className="text-sm text-[var(--text-muted)]">Eliminando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative rounded-2xl border border-[var(--accent-secondary)]/30 bg-[var(--bg-secondary)] p-6 transition hover:border-[var(--accent)]/50">
      <Link href={`/binders/${binder.id}`} className="block">
        <div className="aspect-video rounded-xl bg-[var(--accent)]/20 mb-3 flex items-center justify-center text-[var(--text-muted)]">
          {binder.coverImageUrl ? (
            <img src={binder.coverImageUrl} alt="" className="h-full w-full object-cover rounded-xl" />
          ) : (
            <span className="text-4xl">📀</span>
          )}
        </div>
        <h2 className="font-display font-medium text-[var(--text)]">{binder.name}</h2>
        <p className="text-sm text-[var(--text-muted)]">
          {binder.pagesCount} página(s) · {binder.cardCount} photocards
        </p>
      </Link>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity rounded-full p-2 bg-red-500/90 hover:bg-red-500 text-white shadow-lg disabled:opacity-50"
        title="Eliminar binder"
      >
        <Trash size={16} />
      </button>
    </div>
  );
}
