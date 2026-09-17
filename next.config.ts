import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// Em produção roda em /tec no seu domínio.
// Em dev roda na raiz (localhost:3040) para facilitar o desenvolvimento.
const basePath = isProd ? "/tec" : "";

const nextConfig: NextConfig = {
  basePath,
  assetPrefix: basePath,
  // O client precisa do basePath para montar as URLs de /api — sem isso
  // o fetch vai para /api/... em vez de /tec/api/... e cai em 404.
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
