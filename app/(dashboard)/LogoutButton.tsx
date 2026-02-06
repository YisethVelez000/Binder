"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] transition"
    >
      Cerrar sesión
    </button>
  );
}
