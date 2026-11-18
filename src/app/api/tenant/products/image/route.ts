import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { currentTenantId, unauthorized, badRequest } from "@/lib/tenant-scope";
import { uploadImage, storageReady } from "@/lib/storage";

/** O navegador já converte para WebP antes de enviar; os outros são rede de segurança. */
const ALLOWED: Record<string, string> = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png":  "png",
};

const MAX_BYTES = 4 * 1024 * 1024;

export async function GET() {
  // A tela usa isto para saber se mostra o botão de enviar ou o campo de link.
  const tenantId = await currentTenantId();
  if (!tenantId) return unauthorized();
  return NextResponse.json({ ready: storageReady() });
}

export async function POST(req: NextRequest) {
  const tenantId = await currentTenantId();
  if (!tenantId) return unauthorized();

  if (!storageReady()) {
    return badRequest("Envio de imagem ainda não configurado nesta instalação.");
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return badRequest("Nenhum arquivo recebido.");

  const ext = ALLOWED[file.type];
  if (!ext) return badRequest("Use uma imagem JPG, PNG ou WebP.");
  if (file.size > MAX_BYTES) return badRequest("Imagem muito grande (máximo 4 MB).");

  const bytes = await file.arrayBuffer();
  // Caminho começa pelo tenant: uma loja nunca escreve na pasta da outra,
  // porque quem monta o caminho é o servidor, não o navegador.
  const result = await uploadImage(`${tenantId}/${randomUUID()}.${ext}`, bytes, file.type);

  if (!result.ok) return badRequest(result.error);
  return NextResponse.json({ url: result.url, path: result.path }, { status: 201 });
}
