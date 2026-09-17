import { AdminHeader } from "@/components/admin/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ArrowUp, ArrowDown, RotateCcw, AlertTriangle } from "lucide-react";

const stockItems = [
  { id: "1", product: "Vestido Floral Verão", sku: "VFV-001-PP-ROSA", size: "PP", color: "Rosa", stock: 12, minStock: 5 },
  { id: "2", product: "Vestido Floral Verão", sku: "VFV-001-P-ROSA", size: "P", color: "Rosa", stock: 8, minStock: 5 },
  { id: "3", product: "Blusa Básica Algodão", sku: "BBA-002-M-BRANCO", size: "M", color: "Branco", stock: 3, minStock: 10 },
  { id: "4", product: "Blusa Básica Algodão", sku: "BBA-002-G-PRETO", size: "G", color: "Preto", stock: 0, minStock: 10 },
  { id: "5", product: "Calça Jeans Skinny", sku: "CJS-003-36-AZUL", size: "36", color: "Azul", stock: 15, minStock: 5 },
  { id: "6", product: "Saia Midi Plissada", sku: "SMP-004-U-VERDE", size: "Único", color: "Verde", stock: 4, minStock: 5 },
];

const recentMovements = [
  { product: "Blusa Básica Algodão M/Branco", type: "IN", qty: 20, reason: "Compra fornecedor", time: "hoje 09:00" },
  { product: "Vestido Floral Verão PP/Rosa", type: "OUT", qty: 2, reason: "Venda #PED-001", time: "hoje 10:15" },
  { product: "Calça Jeans Skinny 36/Azul", type: "ADJUSTMENT", qty: -1, reason: "Ajuste inventário", time: "ontem 16:30" },
];

function StockStatus({ stock, min }: { stock: number; min: number }) {
  if (stock === 0) return <Badge variant="destructive">Zerado</Badge>;
  if (stock < min) return <Badge variant="warning">Baixo</Badge>;
  return <Badge variant="success">OK</Badge>;
}

export default function EstoquePage() {
  return (
    <>
      <AdminHeader title="Controle de Estoque" description="Gerencie o estoque de todas as variações">
        <Button variant="outline">
          <ArrowDown className="h-4 w-4 mr-2" />
          Entrada
        </Button>
        <Button variant="outline">
          <ArrowUp className="h-4 w-4 mr-2" />
          Saída
        </Button>
        <Button variant="outline">
          <RotateCcw className="h-4 w-4 mr-2" />
          Ajuste
        </Button>
      </AdminHeader>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">156</p>
            <p className="text-xs text-muted-foreground mt-1">Total de SKUs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">7</p>
            <p className="text-xs text-muted-foreground mt-1">Estoque Baixo</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">4</p>
            <p className="text-xs text-muted-foreground mt-1">Sem Estoque</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">1.248</p>
            <p className="text-xs text-muted-foreground mt-1">Peças em Estoque</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">SKUs em Estoque</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar SKU..." className="pl-9 w-60" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Produto</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Tam.</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Cor</th>
                    <th className="text-center p-4 text-sm font-medium text-muted-foreground">Estoque</th>
                    <th className="text-center p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {stockItems.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-muted/30">
                      <td className="p-4">
                        <p className="text-sm font-medium">{item.product}</p>
                        <p className="text-xs text-muted-foreground font-mono">{item.sku}</p>
                      </td>
                      <td className="p-4 text-sm">{item.size}</td>
                      <td className="p-4 text-sm">{item.color}</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {item.stock < item.minStock && item.stock > 0 && (
                            <AlertTriangle className="h-3 w-3 text-yellow-500" />
                          )}
                          <span className={`font-bold text-sm ${item.stock === 0 ? "text-red-600" : item.stock < item.minStock ? "text-yellow-600" : ""}`}>
                            {item.stock}
                          </span>
                          <span className="text-xs text-muted-foreground">/ mín. {item.minStock}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <StockStatus stock={item.stock} min={item.minStock} />
                      </td>
                      <td className="p-4">
                        <Button variant="ghost" size="sm">Ajustar</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Recent Movements */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Movimentações Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentMovements.map((mv, i) => (
                  <div key={i} className="flex items-start gap-3 pb-3 border-b last:border-0">
                    <div className={`p-1.5 rounded-full mt-0.5 ${
                      mv.type === "IN" ? "bg-green-100" :
                      mv.type === "OUT" ? "bg-red-100" : "bg-gray-100"
                    }`}>
                      {mv.type === "IN" ? (
                        <ArrowDown className="h-3 w-3 text-green-600" />
                      ) : mv.type === "OUT" ? (
                        <ArrowUp className="h-3 w-3 text-red-600" />
                      ) : (
                        <RotateCcw className="h-3 w-3 text-gray-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{mv.product}</p>
                      <p className="text-xs text-muted-foreground">{mv.reason}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs font-bold ${
                          mv.type === "IN" ? "text-green-600" :
                          mv.qty < 0 ? "text-red-600" : "text-red-600"
                        }`}>
                          {mv.type === "IN" ? "+" : ""}{mv.qty} unid.
                        </span>
                        <span className="text-xs text-muted-foreground">{mv.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
