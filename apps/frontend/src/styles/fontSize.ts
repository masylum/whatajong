export function rem(px: number) {
  return `${px / 16}rem`
}

export const fontSize = {
  hero1: {
    fontSize: rem(160),
    lineHeight: rem(160),
    textWrap: "balance",
  },
  hero2: {
    fontSize: rem(90),
    lineHeight: rem(90),
    textWrap: "balance",
  },
  hero3: {
    fontSize: rem(60),
    lineHeight: rem(60),
    textWrap: "balance",
  },
  hero4: {
    fontSize: rem(48),
    lineHeight: rem(48),
    textWrap: "balance",
  },
  h1: {
    fontSize: rem(32),
    lineHeight: rem(36),
    textWrap: "balance",
  },
  h2: {
    fontSize: rem(24),
    lineHeight: rem(28),
    textWrap: "balance",
  },
  h3: {
    fontSize: rem(20),
    lineHeight: rem(24),
    textWrap: "balance",
  },
  readable: {
    fontSize: rem(20),
    lineHeight: rem(32),
    textWrap: "pretty",
  },
  l: {
    fontSize: rem(18),
    lineHeight: rem(26),
  },
  m: {
    fontSize: rem(16),
    lineHeight: rem(24),
  },
  s: {
    fontSize: rem(14),
    lineHeight: rem(20),
  },
} as const

export type FontSize = keyof typeof fontSize
