/**
 * Em produção o app é servido sob /tec (ver next.config.ts). O Next reescreve
 * links e assets sozinho, mas não o `fetch` nem as URLs que o client do
 * NextAuth monta — esses precisam do prefixo explícito.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const AUTH_BASE_PATH = `${BASE_PATH}/api/auth`;

export function apiUrl(path: string) {
  return `${BASE_PATH}${path}`;
}
