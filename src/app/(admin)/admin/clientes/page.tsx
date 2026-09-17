import { AdminHeader } from "@/components/admin/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Search, Eye, Phone, Mail, Star } from "lucide-react";
import Link from "next/link";

const mockCustomers = [
  {
    id: "1",
    name: "Maria Silva",
    email: "maria@email.com",
    phone: "(11) 99999-0001",
    totalOrders: 12,
    totalSpent: 2580.50,
    lastOrder: new Date("2026-09-10"),
    tags: ["VIP", "Fiel"],
  },
  {
    id: "2",
    name: "João Santos",
    email: "joao@email.com",
    phone: "(11) 99999-0002",
    totalOrders: 5,
    totalSpent: 780.00,
    lastOrder: new Date("2026-09-08"),
    tags: [],
  },
  {
    id: "3",
    name: "Ana Oliveira",
    email: "ana@email.com",
    phone: "(11) 99999-0003",
    totalOrders: 28,
    totalSpent: 6420.90,
    lastOrder: new Date("2026-09-12"),
    tags: ["VIP", "Atacado"],
  },
  {
    id: "4",
    name: "Carlos Lima",
    email: null,
    phone: "(11) 99999-0004",
    totalOrders: 1,
    totalSpent: 95.00,
    lastOrder: new Date("2026-09-14"),
    tags: ["Novo"],
  },
];

function CustomerTier({ spent }: { spent: number }) {
  if (spent >= 5000) return <Badge variant="default" className="bg-yellow-500 text-white border-0"><Star className="h-3 w-3 mr-1" />Gold</Badge>;
  if (spent >= 1000) return <Badge variant="secondary">Silver</Badge>;
  return <Badge variant="outline">Bronze</Badge>;
}

export default function ClientesPage() {
  return (
    <>
      <AdminHeader title="Clientes" description="CRM — gerencie toda a base de clientes">
        <Button asChild>
          <Link href="/admin/clientes/novo">
            <Plus className="h-4 w-4" />
            Novo Cliente
          </Link>
        </Button>
      </AdminHeader>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">248</p>
            <p className="text-xs text-muted-foreground">Total Clientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">18</p>
            <p className="text-xs text-muted-foreground">Clientes VIP</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">12</p>
            <p className="text-xs text-muted-foreground">Novos este mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{formatCurrency(320.50)}</p>
            <p className="text-xs text-muted-foreground">Ticket Médio</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome, email, telefone..." className="pl-9" />
        </div>
        <Button variant="outline">Tags</Button>
        <Button variant="outline">Nível</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Cliente</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Contato</th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">Pedidos</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Total Gasto</th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">Nível</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Últ. Compra</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Tags</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {mockCustomers.map((customer) => (
                <tr key={customer.id} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {customer.name.charAt(0)}
                      </div>
                      <span className="font-medium text-sm">{customer.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      {customer.email && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {customer.email}
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {customer.phone}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-sm font-medium">{customer.totalOrders}</span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-sm font-medium">{formatCurrency(customer.totalSpent)}</span>
                  </td>
                  <td className="p-4 text-center">
                    <CustomerTier spent={customer.totalSpent} />
                  </td>
                  <td className="p-4">
                    <span className="text-xs text-muted-foreground">{formatDate(customer.lastOrder)}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1 flex-wrap">
                      {customer.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/clientes/${customer.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </>
  );
}
