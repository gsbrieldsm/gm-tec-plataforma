import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  // Em produção roda em /ecommerce no seu domínio.
  // Em dev roda na raiz (localhost:3040) para facilitar o desenvolvimento.
  basePath: isProd ? "/tec" : "",
  assetPrefix: isProd ? "/tec" : "",
};

export default nextConfig;
