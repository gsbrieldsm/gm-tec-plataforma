"use client";

import { Bell } from "lucide-react";

interface AdminHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function AdminHeader({ title, description, children }: AdminHeaderProps) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32 }}>
      <div>
        <h1 style={{
          fontSize: 18, fontWeight: 600, color: "var(--text-1)",
          margin: 0, letterSpacing: "-0.015em", lineHeight: 1.3,
          fontFamily: "var(--font-space), var(--font-geist-sans), sans-serif",
        }}>{title}</h1>
        {description && (
          <p style={{ fontSize: 13, color: "var(--text-2)", margin: "4px 0 0", lineHeight: 1.5 }}>{description}</p>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {children}
        <button style={{
          width: 32, height: 32, borderRadius: 8,
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", position: "relative",
          transition: "background 0.12s",
        }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "var(--surface-3)")}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "var(--surface-2)")}
        >
          <Bell size={14} color="var(--text-2)" />
          <span style={{
            position: "absolute", top: 7, right: 7,
            width: 5, height: 5, borderRadius: "50%",
            background: "var(--accent)",
          }} />
        </button>
      </div>
    </div>
  );
}
