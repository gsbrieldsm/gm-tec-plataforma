import { AdminHeader } from "@/components/admin/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Plus, Search, Filter, Eye } from "lucide-react";
import Link from "next/link";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" }> = {
  PENDING: { label: "Pendente", variant: "warning" },
  CONFIRMED: { label: "Confirmado", variant: "info" },
  IN_PRODUCTION: { label: "Em Produção", variant: "secondary" },
  READY: { label: "Pronto", variant: "success" },
  SHIPPED: { label: "Enviado", variant: "info" },
  DELIVERED: { label: "Entregue", variant: "success" },
  CANCELLED: { label: "Cancelado", variant: "destructive" },
  RETURNED: { label: "Devolvido", variant: "destructive" },
};

const paymentStatusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" }> = {
  PENDING: { label: "Aguardando", variant: "warning" },
  PAID: { label: "Pago", variant: "success" },
  PARTIALLY_PAID: { label: "Parcial", variant: "warning" },
  REFUNDED: { label: "Reembolsado", variant: "secondary" },
  FAILED: { label: "Falhou", variant: "destructive" },
};

const sourceMap: Record<string, string> = {
  WEBSITE: "Site",
  WHATSAPP: "WhatsApp",
  INSTAGRAM: "Instagram",
  IN_STORE: "Loja Física",
  OTHER: "Outro",
};

// TODO: buscar do banco via Server Component
const mockOrders = [
  {
    id: "1",
    orderNumber: "PED-001",
    customerName: "Maria Silva",
    status: "PENDING",
    paymentStatus: "PAID",
    total: 289.90,
    source: "WHATSAPP",
    createdAt: new Date("2026-09-14T10:00:00"),
    items: 3,
  },
  {
    id: "2",
    orderNumber: "PED-002",
    customerName: "João Santos",
    status: "IN_PRODUCTION",
    paymentStatus: "PAID",
    total: 159.00,
    source: "INSTAGRAM",
    createdAt: new Date("2026-09-14T09:30:00"),
    items: 2,
  },
  {
    id: "3",
    orderNumber: "PED-003",
    customerName: "Ana Oliveira",
    status: "SHIPPED",
    paymentStatus: "PAID",
    total: 420.50,
    source: "WEBSITE",
    createdAt: new Date("2026-09-13T14:00:00"),
    items: 5,
  },
  {
    id: "4",
    orderNumber: "PED-004",
    customerName: "Carlos Lima",
    status: "DELIVERED",
    paymentStatus: "PAID",
    total: 95.00,
    source: "WEBSITE",
    createdAt: new Date("2026-09-12T11:00:00"),
    items: 1,
  },
];

const statusFilters = [
  { label: "Todos", value: "" },
  { label: "Pendentes", value: "PENDING" },
  { label: "Em Produção", value: "IN_PRODUCTION" },
  { label: "Enviados", value: "SHIPPED" },
  { label: "Entregues", value: "DELIVERED" },
  { label: "Cancelados", value: "CANCELLED" },
];

export default function PedidosPage() {
  return (
    <>
      <AdminHeader title="Pedidos" description="Gerencie todos os pedidos da sua loja">
        <Button asChild>
          <Link href="/admin/pedidos/novo">
            <Plus className="h-4 w-4" />
            Novo Pedido
          </Link>
        </Button>
      </AdminHeader>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por pedido, cliente..." className="pl-9" />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </Button>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {statusFilters.map((filter) => (
          <Button
            key={filter.value}
            variant={filter.value === "" ? "default" : "outline"}
            size="sm"
            className="shrink-0"
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Pedido</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Cliente</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Pagamento</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Origem</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Itens</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Total</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Data</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {mockOrders.map((order) => {
                  const status = statusMap[order.status];
                  const payStatus = paymentStatusMap[order.paymentStatus];
                  return (
                    <tr key={order.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <span className="font-mono text-sm font-medium">{order.orderNumber}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm">{order.customerName}</span>
                      </td>
                      <td className="p-4">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant={payStatus.variant}>{payStatus.label}</Badge>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-muted-foreground">{sourceMap[order.source]}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm">{order.items} itens</span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-sm font-medium">{formatCurrency(order.total)}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-xs text-muted-foreground">{formatDateTime(order.createdAt)}</span>
                      </td>
                      <td className="p-4">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/pedidos/${order.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
