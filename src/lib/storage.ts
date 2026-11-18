/**
 * Upload de imagem para o Supabase Storage, via REST — sem SDK novo.
 *
 * A chave de serviço nunca sai do servidor: o navegador manda o arquivo para a
 * nossa rota, que confere a sessão antes de encostar no bucket. Por isso o
 * bucket não precisa (nem deve) aceitar escrita anônima.
 */

const BUCKET = "produtos";

function config() {
  const url = process.env.SUPABASE_URL?.replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url, key };
}

/** Diz se o upload está configurado, sem revelar nada da chave. */
export function storageReady() {
  return config() !== null;
}

export type UploadResult =
  | { ok: true; url: string; path: string }
  | { ok: false; error: string };

export async function uploadImage(
  path: string,
  bytes: ArrayBuffer,
  contentType: string,
): Promise<UploadResult> {
  const cfg = config();
  if (!cfg) return { ok: false, error: "Envio de imagem ainda não configurado." };

  const res = await fetch(`${cfg.url}/storage/v1/object/${BUCKET}/${path}`, {
    method: "POST",
    headers: {
      // As chaves novas (sb_secret_…) pedem apikey; a service_role legada
      // aceita os dois. Mandar ambos faz as duas formas funcionarem.
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      "Content-Type": contentType,
      "x-upsert": "true",
    },
    body: bytes,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("storage upload falhou", res.status, detail);
    if (res.status === 404) return { ok: false, error: `Bucket "${BUCKET}" não existe no Supabase.` };
    return { ok: false, error: "Não consegui enviar a imagem. Tente de novo." };
  }

  return { ok: true, path, url: `${cfg.url}/storage/v1/object/public/${BUCKET}/${path}` };
}

/** Remove um arquivo nosso. Falha silenciosa: imagem órfã não quebra o produto. */
export async function deleteImage(path: string) {
  const cfg = config();
  if (!cfg) return;
  await fetch(`${cfg.url}/storage/v1/object/${BUCKET}/${path}`, {
    method: "DELETE",
    headers: { apikey: cfg.key, Authorization: `Bearer ${cfg.key}` },
  }).catch(() => {});
}
