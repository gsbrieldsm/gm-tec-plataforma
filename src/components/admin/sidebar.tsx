"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  ShoppingCart,
  BarChart3,
  Settings,
  Factory,
  Tag,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Pedidos",
    href: "/admin/pedidos",
    icon: ShoppingCart,
  },
  {
    title: "Produtos",
    href: "/admin/produtos",
    icon: ShoppingBag,
  },
  {
    title: "Estoque",
    href: "/admin/estoque",
    icon: Package,
  },
  {
    title: "Produção",
    href: "/admin/producao",
    icon: Factory,
  },
  {
    title: "Clientes",
    href: "/admin/clientes",
    icon: Users,
  },
  {
    title: "Categorias",
    href: "/admin/categorias",
    icon: Tag,
  },
  {
    title: "Relatórios",
    href: "/admin/relatorios",
    icon: BarChart3,
  },
  {
    title: "Configurações",
    href: "/admin/configuracoes",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 border-r bg-card flex flex-col">
      <div className="p-6 border-b">
        <Link href="/admin" className="flex items-center gap-2">
          <ShoppingBag className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">Moda Store</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.title}</span>
              {isActive && <ChevronRight className="h-3 w-3" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <ShoppingBag className="h-4 w-4" />
          <span>Ver Loja</span>
        </Link>
      </div>
    </aside>
  );
}
