"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { AdminSidebar } from "./sidebar";

const UI = "var(--font-space), var(--font-geist-sans), sans-serif";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <AdminSidebar open={open} onClose={() => setOpen(false)} />

      <div
        className="admin-backdrop"
        data-open={open}
        onClick={() => setOpen(false)}
      />

      <main className="admin-main" style={{ flex: 1, minWidth: 0, overflowY: "auto" }}>
        {/* Só aparece quando a sidebar vira drawer */}
        <header className="admin-topbar">
          <button
            onClick={() => setOpen(true)}
            aria-label="Abrir menu"
            style={{
              width: 40, height: 40, borderRadius: 10, flexShrink: 0,
              background: "var(--surface)", border: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Menu size={18} color="var(--text-1)" />
          </button>
          <span style={{
            fontFamily: UI, fontSize: 13, fontWeight: 700,
            color: "var(--text-1)", letterSpacing: "-0.01em",
          }}>
            GM &amp; Co <span style={{ color: "var(--accent)" }}>Tec</span>
          </span>
        </header>

        <div className="admin-content">{children}</div>
      </main>
    </div>
  );
}
