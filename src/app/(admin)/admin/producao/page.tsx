import React from "react";
import { AdminHeader } from "@/components/admin/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Plus, Factory, Eye, CheckCircle, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info"; icon: React.ElementType }> = {
  DRAFT: { label: "Rascunho", variant: "secondary", icon: Clock },
  PLANNED: { label: "Planejado", variant: "info", icon: Clock },
  IN_PROGRESS: { label: "Em Andamento", variant: "warning", icon: Factory },
  COMPLETED: { label: "Concluído", variant: "success", icon: CheckCircle },
  CANCELLED: { label: "Cancelado", variant: "destructive", icon: AlertCircle },
};

const priorityMap: Record<string, { label: string; color: string }> = {
  LOW: { label: "Baixa", color: "text-gray-500" },
  NORMAL: { label: "Normal", color: "text-blue-500" },
  HIGH: { label: "Alta", color: "text-orange-500" },
  URGENT: { label: "Urgente", color: "text-red-500" },
};

const mockProductions = [
  {
    id: "1",
    orderNumber: "PROD-001",
    status: "IN_PROGRESS",
    priority: "HIGH",
    dueDate: new Date("2026-09-20"),
    items: [
      { name: "Vestido Floral Verão", sku: "VFV-001-P-ROSA", qty: 20, done: 12 },
      { name: "Vestido Floral Verão", sku: "VFV-001-M-ROSA", qty: 20, done: 8 },
    ],
    notes: "Prioridade para reposição de estoque",
  },
  {
    id: "2",
    orderNumber: "PROD-002",
    status: "PLANNED",
    priority: "NORMAL",
    dueDate: new Date("2026-09-30"),
    items: [
      { name: "Blusa Básica Algodão", sku: "BBA-002-M-BRANCO", qty: 50, done: 0 },
      { name: "Blusa Básica Algodão", sku: "BBA-002-G-PRETO", qty: 50, done: 0 },
    ],
    notes: null,
  },
  {
    id: "3",
    orderNumber: "PROD-003",
    status: "COMPLETED",
    priority: "URGENT",
    dueDate: new Date("2026-09-10"),
    items: [
      { name: "Saia Midi Plissada", sku: "SMP-004-U-VERDE", qty: 30, done: 30 },
    ],
    notes: null,
  },
];

function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground w-12 text-right">{done}/{total}</span>
    </div>
  );
}

export default function ProducaoPage() {
  return (
    <>
      <AdminHeader title="Produção" description="Controle de pedidos de produção e confecção">
        <Button asChild>
          <Link href="/admin/producao/novo">
            <Plus className="h-4 w-4" />
            Novo Pedido
          </Link>
        </Button>
      </AdminHeader>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">3</p>
            <p className="text-xs text-muted-foreground">Ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">1</p>
            <p className="text-xs text-muted-foreground">Em Andamento</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">1</p>
            <p className="text-xs text-muted-foreground">Concluídos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">220</p>
            <p className="text-xs text-muted-foreground">Peças em Produção</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {mockProductions.map((prod) => {
          const status = statusMap[prod.status];
          const priority = priorityMap[prod.priority];
          const totalQty = prod.items.reduce((s, i) => s + i.qty, 0);
          const totalDone = prod.items.reduce((s, i) => s + i.done, 0);
          const StatusIcon = status.icon;

          return (
            <Card key={prod.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Factory className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium">{prod.orderNumber}</span>
                        <Badge variant={status.variant}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                        <span className={`text-xs font-medium ${priority.color}`}>
                          ● {priority.label}
                        </span>
                      </div>
                      {prod.notes && (
                        <p className="text-xs text-muted-foreground mt-0.5">{prod.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Prazo</p>
                      <p className="text-sm font-medium">{formatDate(prod.dueDate)}</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/producao/${prod.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        Detalhes
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Progresso total</span>
                    <span className="text-xs font-medium">{totalDone}/{totalQty} peças</span>
                  </div>
                  <ProgressBar done={totalDone} total={totalQty} />
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50 border-b">
                        <th className="text-left p-3 text-xs font-medium text-muted-foreground">Produto</th>
                        <th className="text-left p-3 text-xs font-medium text-muted-foreground">SKU</th>
                        <th className="text-center p-3 text-xs font-medium text-muted-foreground">Qtd.</th>
                        <th className="p-3 text-xs font-medium text-muted-foreground w-40">Progresso</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prod.items.map((item, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="p-3 text-sm">{item.name}</td>
                          <td className="p-3 text-xs font-mono text-muted-foreground">{item.sku}</td>
                          <td className="p-3 text-sm text-center font-medium">{item.qty}</td>
                          <td className="p-3">
                            <ProgressBar done={item.done} total={item.qty} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
