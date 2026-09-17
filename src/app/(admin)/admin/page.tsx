import { AdminHeader } from "@/components/admin/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  DollarSign,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

// TODO: substituir por dados reais do banco
const stats = [
  {
    title: "Receita do Mês",
    value: formatCurrency(12580.5),
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    title: "Pedidos Hoje",
    value: "23",
    change: "+3 vs ontem",
    trend: "up",
    icon: ShoppingCart,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    title: "Produtos com Estoque Baixo",
    value: "7",
    change: "Atenção necessária",
    trend: "down",
    icon: Package,
    color: "text-yellow-600",
    bg: "bg-yellow-50",
  },
  {
    title: "Novos Clientes",
    value: "18",
    change: "+5 esta semana",
    trend: "up",
    icon: Users,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
];

const recentOrders = [
  { id: "PED-001", customer: "Maria Silva", total: 289.90, status: "PENDING", time: "há 5min" },
  { id: "PED-002", customer: "João Santos", total: 159.00, status: "CONFIRMED", time: "há 23min" },
  { id: "PED-003", customer: "Ana Oliveira", total: 420.50, status: "SHIPPED", time: "há 1h" },
  { id: "PED-004", customer: "Carlos Lima", total: 95.00, status: "DELIVERED", time: "há 2h" },
  { id: "PED-005", customer: "Fernanda Costa", total: 320.00, status: "IN_PRODUCTION", time: "há 3h" },
];

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" }> = {
  PENDING: { label: "Pendente", variant: "warning" },
  CONFIRMED: { label: "Confirmado", variant: "info" },
  IN_PRODUCTION: { label: "Em Produção", variant: "secondary" },
  READY: { label: "Pronto", variant: "success" },
  SHIPPED: { label: "Enviado", variant: "info" },
  DELIVERED: { label: "Entregue", variant: "success" },
  CANCELLED: { label: "Cancelado", variant: "destructive" },
};

export default function DashboardPage() {
  return (
    <>
      <AdminHeader
        title="Dashboard"
        description="Bem-vindo de volta! Aqui está o resumo do seu negócio."
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {stat.trend === "up" ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-yellow-600" />
                    )}
                    <span className="text-xs text-muted-foreground">{stat.change}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Pedidos Recentes</CardTitle>
              <a href="/admin/pedidos" className="text-sm text-primary hover:underline">
                Ver todos
              </a>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentOrders.map((order) => {
                  const status = statusMap[order.status];
                  return (
                    <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <ShoppingCart className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{order.customer}</p>
                          <p className="text-xs text-muted-foreground">{order.id}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={status.variant}>{status.label}</Badge>
                        <div className="text-right">
                          <p className="text-sm font-medium">{formatCurrency(order.total)}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {order.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Alertas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-100">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900">Estoque Baixo</p>
                    <p className="text-xs text-yellow-700">7 produtos com menos de 5 unidades</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
                  <Package className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Produção em Andamento</p>
                    <p className="text-xs text-blue-700">3 pedidos de produção ativos</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 border border-orange-100">
                  <Clock className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-orange-900">Pedidos Pendentes</p>
                    <p className="text-xs text-orange-700">5 pedidos aguardando confirmação</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
