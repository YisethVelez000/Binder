"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewBinderPage() {
  const router = useRouter();
  useEffect(() => {
    fetch("/api/binders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Mi Binder" }),
    })
      .then((r) => r.json())
      .then((b) => b.id && router.replace(`/binders/${b.id}`))
      .catch(() => router.replace("/binders"));
  }, [router]);
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <p className="text-[var(--text-muted)]">Creando binder…</p>
    </div>
  );
}
