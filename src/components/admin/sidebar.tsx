"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

/* ── Nav model ───────────────────────────────────────────────────── */
type NavItem = { label: string; href: string };

const PRINCIPAL: NavItem[] = [
  { label: "Dashboard", href: "/admin" },
  { label: "Pedidos",   href: "/admin/pedidos" },
];

const OPERACOES: NavItem[] = [
  { label: "Produtos",   href: "/admin/produtos" },
  { label: "Estoque",    href: "/admin/estoque" },
  { label: "Produção",   href: "/admin/producao" },
  { label: "Operação",   href: "/admin/operacao" },
  { label: "Clientes",   href: "/admin/clientes" },
  { label: "Categorias", href: "/admin/categorias" },
];

const ANALYTICS: NavItem[] = [
  { label: "Relatórios",    href: "/admin/relatorios" },
  { label: "Configurações", href: "/admin/configuracoes" },
];

const CHANNELS = [
  { label: "Shopee",        href: "/admin/ecommerce/shopee",       color: "#EE4D2D" },
  { label: "Mercado Livre", href: "/admin/ecommerce/mercadolivre", color: "#FFE600" },
  { label: "Amazon",        href: "/admin/ecommerce/amazon",       color: "#FF9900" },
  { label: "Magalu",        href: "/admin/ecommerce/magalu",       color: "#0086FF" },
  { label: "Americanas",    href: "/admin/ecommerce/americanas",   color: "#EF2C33" },
];

/* ── Subcomponents ───────────────────────────────────────────────── */
const SYS_FONT = "var(--font-space), var(--font-geist-sans), sans-serif";

function SectionHeader({ prefix, label }: { prefix: string; label: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "0 10px", marginBottom: 3,
    }}>
      <span style={{
        fontFamily: SYS_FONT,
        fontSize: 8.5, fontWeight: 700,
        letterSpacing: "0.18em", textTransform: "uppercase",
        color: "#7c3fed", opacity: 0.7,
        lineHeight: 1,
      }}>{prefix}</span>
      <span style={{ flex: 1, height: 1, background: "rgba(123,63,237,0.18)" }} />
      <span style={{
        fontFamily: SYS_FONT,
        fontSize: 8.5, fontWeight: 600,
        letterSpacing: "0.16em", textTransform: "uppercase",
        color: "#535774",
        lineHeight: 1,
      }}>{label}</span>
    </div>
  );
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  const handleEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!active) (e.currentTarget as HTMLElement).style.color = "#b8bbd0";
  };
  const handleLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!active) (e.currentTarget as HTMLElement).style.color = "#535774";
  };

  return (
    <Link href={href} style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "6px 10px",
      borderRadius: 6,
      fontFamily: SYS_FONT,
      fontSize: 12.5,
      fontWeight: active ? 500 : 400,
      color: active ? "#e4e6f2" : "#535774",
      background: active ? "rgba(124,63,237,0.12)" : "transparent",
      borderLeft: active ? "2px solid #7c3fed" : "2px solid transparent",
      boxShadow: active ? "-2px 0 12px rgba(124,63,237,0.15)" : "none",
      transition: "all 0.1s",
      textDecoration: "none",
      letterSpacing: "-0.01em",
    }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {active && (
        <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#9d6ef8", flexShrink: 0 }} />
      )}
      {!active && (
        <span style={{ width: 3, height: 3, borderRadius: "50%", background: "transparent", flexShrink: 0 }} />
      )}
      {label}
    </Link>
  );
}

/* ── Sidebar ─────────────────────────────────────────────────────── */
export function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const name    = session?.user?.name ?? session?.user?.email ?? "Usuário";
  const initial = name.charAt(0).toUpperCase();
  const tenant  = session?.user?.tenantName ?? "";

  const active = (href: string) =>
    pathname === href || (href !== "/admin" && pathname.startsWith(href));

  return (
    <aside style={{
      position: "fixed", left: 0, top: 0,
      height: "100vh", width: 240,
      background: "linear-gradient(180deg, #04041a 0%, #03030f 100%)",
      borderRight: "1px solid rgba(123,63,237,0.18)",
      display: "flex", flexDirection: "column",
      zIndex: 50,
    }}>

      {/* ── Logo ─────────────────────────────────────── */}
      <div style={{
        padding: "18px 14px 16px",
        borderBottom: "1px solid rgba(123,63,237,0.1)",
        display: "flex", alignItems: "center", gap: 11,
      }}>
        {/* Geometric mark */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            {/* outer hex */}
            <path
              d="M16 3L28 9.5V22.5L16 29L4 22.5V9.5L16 3Z"
              stroke="rgba(124,63,237,0.5)"
              strokeWidth="1"
              fill="none"
            />
            {/* inner diamond */}
            <path
              d="M16 10L21 16L16 22L11 16L16 10Z"
              fill="rgba(124,63,237,0.15)"
              stroke="#9d6ef8"
              strokeWidth="1"
            />
            {/* center dot */}
            <circle cx="16" cy="16" r="1.5" fill="#9d6ef8" />
            {/* accent corner lines */}
            <path d="M4 9.5L7 11" stroke="rgba(124,63,237,0.4)" strokeWidth="0.8"/>
            <path d="M28 9.5L25 11" stroke="rgba(124,63,237,0.4)" strokeWidth="0.8"/>
            <path d="M16 29L16 26" stroke="rgba(124,63,237,0.4)" strokeWidth="0.8"/>
          </svg>
        </div>
        <div>
          <div style={{
            fontFamily: SYS_FONT,
            fontSize: 13.5, fontWeight: 600,
            color: "#e4e6f2", lineHeight: 1,
            letterSpacing: "-0.01em",
          }}>GM & Co</div>
          <div style={{
            fontFamily: SYS_FONT,
            fontSize: 8, fontWeight: 700,
            color: "#7c3fed",
            letterSpacing: "0.2em",
            lineHeight: 1, marginTop: 4,
            textTransform: "uppercase",
          }}>TEC PLATFORM</div>
        </div>
        {/* status pip */}
        <div style={{ marginLeft: "auto" }}>
          <span style={{
            display: "block",
            width: 5, height: 5, borderRadius: "50%",
            background: "#06b6d4",
            boxShadow: "0 0 8px #06b6d4",
            animation: "pulse-live 2.5s infinite",
          }} />
        </div>
      </div>

      {/* ── Nav ──────────────────────────────────────── */}
      <nav style={{
        flex: 1, overflowY: "auto",
        padding: "14px 6px",
        display: "flex", flexDirection: "column", gap: 22,
        scrollbarWidth: "none",
      }}>

        {/* PRINCIPAL */}
        <div>
          <SectionHeader prefix="SYS" label="Principal" />
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {PRINCIPAL.map(item => (
              <NavLink key={item.href} href={item.href} label={item.label} active={active(item.href)} />
            ))}
          </div>
        </div>

        {/* OPERAÇÕES */}
        <div>
          <SectionHeader prefix="SYS" label="Operações" />
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {OPERACOES.map(item => (
              <NavLink key={item.href} href={item.href} label={item.label} active={active(item.href)} />
            ))}
          </div>
        </div>

        {/* CANAIS */}
        <div>
          <SectionHeader prefix="NET" label="Canais" />
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {CHANNELS.map(ch => {
              const isActive = active(ch.href);
              return (
                <Link key={ch.href} href={ch.href} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "6px 10px",
                  borderRadius: 6,
                  fontFamily: SYS_FONT,
                  fontSize: 12.5,
                  fontWeight: isActive ? 500 : 400,
                  color: isActive ? "#e4e6f2" : "#535774",
                  background: isActive ? "rgba(124,63,237,0.12)" : "transparent",
                  borderLeft: isActive ? `2px solid ${ch.color}` : "2px solid transparent",
                  transition: "all 0.1s",
                  textDecoration: "none",
                  letterSpacing: "-0.01em",
                }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = "#b8bbd0"; }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = "#535774"; }}
                >
                  <span style={{
                    width: 5, height: 5, borderRadius: "50%",
                    background: ch.color,
                    flexShrink: 0,
                    opacity: isActive ? 1 : 0.4,
                    boxShadow: isActive ? `0 0 8px ${ch.color}` : "none",
                  }} />
                  <span style={{ flex: 1 }}>{ch.label}</span>
                  {!isActive && (
                    <span style={{
                      fontSize: 8.5, fontWeight: 600,
                      color: "#28304a", letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}>OFFLINE</span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* ANALYTICS */}
        <div>
          <SectionHeader prefix="INT" label="Analytics" />
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {ANALYTICS.map(item => (
              <NavLink key={item.href} href={item.href} label={item.label} active={active(item.href)} />
            ))}
          </div>
        </div>

      </nav>

      {/* ── User ─────────────────────────────────────── */}
      <div style={{
        padding: "8px 8px 10px",
        borderTop: "1px solid rgba(123,63,237,0.1)",
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "7px 8px",
          borderRadius: 8,
          background: "rgba(123,63,237,0.06)",
          border: "1px solid rgba(123,63,237,0.12)",
        }}>
          {/* avatar */}
          <div style={{
            width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg, #7c3fed 0%, #9d6ef8 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10.5, fontWeight: 700, color: "#fff",
            fontFamily: SYS_FONT,
          }}>{initial}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: SYS_FONT,
              fontSize: 11.5, fontWeight: 500,
              color: "#c8cad8", lineHeight: 1.2,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{name}</div>
            <div style={{
              fontFamily: SYS_FONT,
              fontSize: 8.5, fontWeight: 600,
              color: "#7c3fed", letterSpacing: "0.1em",
              textTransform: "uppercase",
              lineHeight: 1.2, marginTop: 2,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }} title={tenant}>{tenant || " "}</div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/demo" })}
            title="Sair"
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#28304a", padding: "3px 4px", borderRadius: 4,
              fontFamily: SYS_FONT,
              fontSize: 9, fontWeight: 600,
              letterSpacing: "0.08em", textTransform: "uppercase",
              transition: "color 0.12s",
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "#ef4444")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "#28304a")}
          >
            SAIR
          </button>
        </div>
      </div>
    </aside>
  );
}
