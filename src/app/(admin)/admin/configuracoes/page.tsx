import { AdminHeader } from "@/components/admin/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Store, CreditCard, Truck } from "lucide-react";

export default function ConfiguracoesPage() {
  return (
    <>
      <AdminHeader title="Configurações" description="Configure sua loja" />

      <div className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Informações da Loja</CardTitle>
            </div>
            <CardDescription>Dados básicos do negócio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nome da Loja</Label>
                <Input defaultValue="Moda Store" className="mt-1.5" />
              </div>
              <div>
                <Label>CNPJ / CPF</Label>
                <Input placeholder="00.000.000/0001-00" className="mt-1.5" />
              </div>
            </div>
            <div>
              <Label>Endereço</Label>
              <Input placeholder="Rua, número, bairro, cidade - UF" className="mt-1.5" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>WhatsApp</Label>
                <Input placeholder="(11) 99999-0000" className="mt-1.5" />
              </div>
              <div>
                <Label>Email</Label>
                <Input placeholder="contato@loja.com" className="mt-1.5" />
              </div>
            </div>
            <Button>Salvar</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Pagamentos</CardTitle>
            </div>
            <CardDescription>Configure as formas de pagamento aceitas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Mercado Pago — Access Token</Label>
              <Input type="password" placeholder="APP_USR-..." className="mt-1.5" />
            </div>
            <div>
              <Label>Mercado Pago — Public Key</Label>
              <Input type="password" placeholder="APP_USR-..." className="mt-1.5" />
            </div>
            <div>
              <Label>Chave PIX</Label>
              <Input placeholder="CPF, CNPJ, email ou chave aleatória" className="mt-1.5" />
            </div>
            <Button>Salvar</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Frete</CardTitle>
            </div>
            <CardDescription>Configure as opções de entrega</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Frete fixo (R$)</Label>
                <Input type="number" placeholder="15.00" className="mt-1.5" />
              </div>
              <div>
                <Label>Frete grátis acima de (R$)</Label>
                <Input type="number" placeholder="200.00" className="mt-1.5" />
              </div>
            </div>
            <Button>Salvar</Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
