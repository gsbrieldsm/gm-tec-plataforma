import { AdminHeader } from "@/components/admin/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Tag } from "lucide-react";

const mockCategories = [
  { id: "1", name: "Vestidos", slug: "vestidos", products: 24, active: true },
  { id: "2", name: "Blusas", slug: "blusas", products: 18, active: true },
  { id: "3", name: "Calças", slug: "calcas", products: 12, active: true },
  { id: "4", name: "Saias", slug: "saias", products: 9, active: true },
  { id: "5", name: "Acessórios", slug: "acessorios", products: 5, active: false },
];

export default function CategoriasPage() {
  return (
    <>
      <AdminHeader title="Categorias" description="Organize os produtos em categorias">
        <Button>
          <Plus className="h-4 w-4" />
          Nova Categoria
        </Button>
      </AdminHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockCategories.map((cat) => (
          <Card key={cat.id}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Tag className="h-5 w-5 text-primary" />
                </div>
                <Badge variant={cat.active ? "success" : "secondary"}>
                  {cat.active ? "Ativa" : "Inativa"}
                </Badge>
              </div>
              <h3 className="font-semibold">{cat.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">/{cat.slug}</p>
              <p className="text-sm text-muted-foreground mt-2">{cat.products} produtos</p>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="h-3 w-3 mr-1" />
                  Editar
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
