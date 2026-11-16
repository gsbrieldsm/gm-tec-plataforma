/** Dinheiro trafega e é guardado em centavos. Real só aparece na tela. */

export function fmtCents(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** "129,90" ou "R$ 1.299,90" → 12990 */
export function parseMoney(input: string): number {
  const clean = input.replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3}\b)/g, "").replace(",", ".");
  const n = Number(clean);
  return Number.isFinite(n) ? Math.max(0, Math.round(n * 100)) : 0;
}

/** Centavos → "129,90", para preencher campo de formulário. */
export function centsToInput(cents: number) {
  return cents === 0 ? "" : (cents / 100).toFixed(2).replace(".", ",");
}

/** Parcelamento sem juros, como o mercado mostra: "6x de R$ 21,65". */
export function installment(cents: number, max = 6, minCents = 2000) {
  if (cents < minCents * 2) return null;
  const n = Math.min(max, Math.floor(cents / minCents));
  if (n < 2) return null;
  return { n, cents: Math.floor(cents / n) };
}
