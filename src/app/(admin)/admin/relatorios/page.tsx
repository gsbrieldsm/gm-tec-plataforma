import { AdminHeader } from "@/components/admin/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Users } from "lucide-react";

const monthlyData = [
  { month: "Abr", revenue: 8200, orders: 68 },
  { month: "Mai", revenue: 9500, orders: 82 },
  { month: "Jun", revenue: 7800, orders: 65 },
  { month: "Jul", revenue: 11200, orders: 94 },
  { month: "Ago", revenue: 10800, orders: 89 },
  { month: "Set", revenue: 12580, orders: 104 },
];

const topProducts = [
  { name: "Vestido Floral Verão", sold: 45, revenue: 8545.50 },
  { name: "Blusa Básica Algodão", sold: 38, revenue: 2276.20 },
  { name: "Saia Midi Plissada", sold: 22, revenue: 2637.80 },
  { name: "Calça Jeans Skinny", sold: 18, revenue: 2698.20 },
];

const maxRevenue = Math.max(...monthlyData.map((d) => d.revenue));

export default function RelatoriosPage() {
  const current = monthlyData[monthlyData.length - 1];
  const previous = monthlyData[monthlyData.length - 2];
  const growthPct = (((current.revenue - previous.revenue) / previous.revenue) * 100).toFixed(1);
  const isGrowth = current.revenue >= previous.revenue;

  return (
    <>
      <AdminHeader title="Relatórios" description="Análise de desempenho do negócio" />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-xs text-muted-foreground">Receita (Set)</span>
            </div>
            <p className="text-xl font-bold">{formatCurrency(12580)}</p>
            <div className="flex items-center gap-1 mt-1">
              {isGrowth ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span className={`text-xs ${isGrowth ? "text-green-600" : "text-red-600"}`}>
                {isGrowth ? "+" : ""}{growthPct}% vs mês anterior
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCart className="h-4 w-4 text-blue-600" />
              <span className="text-xs text-muted-foreground">Pedidos (Set)</span>
            </div>
            <p className="text-xl font-bold">104</p>
            <p className="text-xs text-muted-foreground mt-1">Ticket médio: {formatCurrency(120.96)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-purple-600" />
              <span className="text-xs text-muted-foreground">Peças Vendidas</span>
            </div>
            <p className="text-xl font-bold">268</p>
            <p className="text-xs text-muted-foreground mt-1">2.58 por pedido</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-orange-600" />
              <span className="text-xs text-muted-foreground">Novos Clientes</span>
            </div>
            <p className="text-xl font-bold">18</p>
            <p className="text-xs text-muted-foreground mt-1">+4 vs mês anterior</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Receita Mensal (últimos 6 meses)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-3 h-48">
                {monthlyData.map((d) => {
                  const height = Math.round((d.revenue / maxRevenue) * 100);
                  const isLast = d.month === "Set";
                  return (
                    <div key={d.month} className="flex flex-col items-center flex-1 gap-1">
                      <span className="text-xs text-muted-foreground">{formatCurrency(d.revenue).replace("R$ ", "")}</span>
                      <div className="w-full flex items-end" style={{ height: "140px" }}>
                        <div
                          className={`w-full rounded-t-md transition-all ${isLast ? "bg-primary" : "bg-primary/30"}`}
                          style={{ height: `${height}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium">{d.month}</span>
                      <span className="text-xs text-muted-foreground">{d.orders} ped.</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Products */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mais Vendidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((p, i) => {
                  const maxSold = topProducts[0].sold;
                  const pct = Math.round((p.sold / maxSold) * 100);
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium truncate flex-1">{p.name}</span>
                        <span className="text-xs text-muted-foreground ml-2 shrink-0">{p.sold} un.</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{formatCurrency(p.revenue)}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
