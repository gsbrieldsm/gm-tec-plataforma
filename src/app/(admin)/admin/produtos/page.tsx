import { AdminHeader } from "@/components/admin/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { Plus, Search, Edit, Trash2, ImageIcon } from "lucide-react";
import Link from "next/link";

const mockProducts = [
  {
    id: "1",
    name: "Vestido Floral Verão",
    sku: "VFV-001",
    price: 189.90,
    stock: 45,
    category: "Vestidos",
    active: true,
    variants: 6,
  },
  {
    id: "2",
    name: "Blusa Básica Algodão",
    sku: "BBA-002",
    price: 59.90,
    stock: 3,
    category: "Blusas",
    active: true,
    variants: 12,
  },
  {
    id: "3",
    name: "Calça Jeans Skinny",
    sku: "CJS-003",
    price: 149.90,
    stock: 0,
    category: "Calças",
    active: false,
    variants: 8,
  },
  {
    id: "4",
    name: "Saia Midi Plissada",
    sku: "SMP-004",
    price: 119.90,
    stock: 22,
    category: "Saias",
    active: true,
    variants: 4,
  },
];

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) return <Badge variant="destructive">Sem estoque</Badge>;
  if (stock < 5) return <Badge variant="warning">Estoque baixo ({stock})</Badge>;
  return <Badge variant="success">{stock} unid.</Badge>;
}

export default function ProdutosPage() {
  return (
    <>
      <AdminHeader title="Produtos" description="Catálogo completo de produtos da loja">
        <Button asChild>
          <Link href="/admin/produtos/novo">
            <Plus className="h-4 w-4" />
            Novo Produto
          </Link>
        </Button>
      </AdminHeader>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar produto, SKU..." className="pl-9" />
        </div>
        <Button variant="outline">Categorias</Button>
        <Button variant="outline">Status</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {mockProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <div className="aspect-square bg-muted flex items-center justify-center border-b">
              <ImageIcon className="h-12 w-12 text-muted-foreground/30" aria-hidden="true" />
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.sku}</p>
                </div>
                <Badge variant={product.active ? "success" : "secondary"}>
                  {product.active ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{product.category}</p>
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-sm">{formatCurrency(product.price)}</span>
                <StockBadge stock={product.stock} />
              </div>
              <p className="text-xs text-muted-foreground mb-3">{product.variants} variações</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href={`/admin/produtos/${product.id}`}>
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
