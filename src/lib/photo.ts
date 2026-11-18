/**
 * Proporção única das fotos de produto.
 *
 * Vale para o corte no envio, para a miniatura do cadastro, para o card da
 * vitrine e para a galeria da peça — tudo lê daqui, então trocar a proporção
 * é mexer só neste arquivo.
 *
 * 9:16 é o formato de Stories e Reels: é como a foto sai do celular, então
 * nada de peça cortada no corte automático.
 */
export const PHOTO_W = 9;
export const PHOTO_H = 16;

/** largura ÷ altura — usado no canvas na hora de cortar. */
export const PHOTO_RATIO = PHOTO_W / PHOTO_H;

/** Valor pronto para a propriedade CSS aspect-ratio. */
export const PHOTO_ASPECT = `${PHOTO_W} / ${PHOTO_H}`;

/**
 * Largura máxima gravada. Em 9:16 isto dá 900×1600, que cobre com folga o
 * card da vitrine e a galeria ampliada sem pesar no 4G da cliente.
 */
export const PHOTO_MAX_W = 900;

/** Teto de altura da foto ampliada: 9:16 inteiro não cabe numa tela de notebook. */
export const PHOTO_DETAIL_MAX_H = "72vh";
