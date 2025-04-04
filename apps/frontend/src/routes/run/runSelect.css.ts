import { mediaQuery } from "@/styles/breakpoints"
import { alpha, color } from "@/styles/colors"
import { primary } from "@/styles/fontFamily.css"
import { fontSize } from "@/styles/fontSize"
import { style } from "@vanilla-extract/css"
import { recipe } from "@vanilla-extract/recipes"

export const containerClass = style({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  height: "100vh",
  width: "100vw",
  background: `linear-gradient(to bottom, ${color.dot10}, black)`,
  padding: 24,
  gap: 24,
  "@media": {
    [mediaQuery({ p: "s", l: "xs" })]: {
      padding: 32,
      gap: 32,
    },
    [mediaQuery({ p: "m", l: "s" })]: {
      padding: 48,
      gap: 48,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      gap: 64,
      padding: 64,
    },
  },
})

export const gamesClass = style({
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  "@media": {
    [mediaQuery({ p: "s", l: "xs" })]: {
      gap: 20,
    },
    [mediaQuery({ p: "m", l: "s" })]: {
      gap: 24,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      gap: 32,
    },
  },
})

export const gameClass = recipe({
  base: {
    borderRadius: 8,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
    padding: 12,
    gap: 16,
    "@media": {
      [mediaQuery({ p: "s", l: "xs" })]: {
        padding: 16,
        gap: 20,
      },
      [mediaQuery({ p: "m", l: "s" })]: {
        padding: 20,
        gap: 24,
      },
      [mediaQuery({ p: "l", l: "m" })]: {
        padding: 24,
        gap: 32,
      },
    },
  },
  variants: {
    current: {
      true: {
        background: `linear-gradient(to bottom, ${alpha(color.bam40, 0.6)}, ${alpha(color.bam40, 0.2)})`,
        boxShadow: `
          1px 1px 1px 0px inset ${color.bam40},
          -1px -1px 1px 0px inset ${color.bam10}
        `,
        color: color.bam80,
      },
      false: {
        background: `linear-gradient(to bottom, ${alpha(color.dot20, 0.6)}, ${alpha(color.dot20, 0)})`,
        color: color.dot80,
      },
    },
  },
})

export const gameTitleClass = style({
  ...fontSize.l,
  fontFamily: primary,
  "@media": {
    [mediaQuery({ p: "s", l: "xs" })]: {
      ...fontSize.h3,
    },
    [mediaQuery({ p: "m", l: "s" })]: {
      ...fontSize.h2,
    },
    [mediaQuery({ p: "s", l: "m" })]: {
      ...fontSize.h1,
    },
  },
  selectors: {
    [`${gameClass.classNames.variants.current.true} &`]: {
      color: color.bam60,
    },
    [`${gameClass.classNames.variants.current.false} &`]: {
      color: color.dot40,
    },
  },
})

export const titleContainerClass = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 4,
  "@media": {
    [mediaQuery({ p: "s", l: "xs" })]: {
      gap: 8,
    },
    [mediaQuery({ p: "m", l: "s" })]: {
      gap: 12,
    },
    [mediaQuery({ p: "s", l: "m" })]: {
      gap: 16,
    },
  },
})

export const titleClass = style({
  ...fontSize.h2,
  fontFamily: primary,
  color: color.dot90,
  fontVariantLigatures: "none",
  textAlign: "center",
  "@media": {
    [mediaQuery({ p: "s", l: "xs" })]: {
      ...fontSize.h1,
    },
    [mediaQuery({ p: "m", l: "s" })]: {
      ...fontSize.hero4,
    },
    [mediaQuery({ p: "s", l: "m" })]: {
      ...fontSize.hero3,
    },
  },
})
export const subtitleClass = style({
  ...fontSize.l,
  fontFamily: primary,
  color: color.dot60,
  textAlign: "center",
  maxWidth: 1000,
  "@media": {
    [mediaQuery({ p: "s", l: "xs" })]: {
      ...fontSize.h3,
    },
    [mediaQuery({ p: "m", l: "s" })]: {
      ...fontSize.h2,
    },
    [mediaQuery({ p: "s", l: "m" })]: {
      ...fontSize.h1,
    },
  },
})

export const detailListClass = style({
  display: "grid",
  gridGap: 12,
  width: "100%",
  gridTemplateColumns: "max-content",
})

export const detailTermClass = style({
  display: "flex",
  alignItems: "center",
  gap: 4,
  fontFamily: primary,
  ...fontSize.s,
  "@media": {
    [mediaQuery({ p: "s", l: "xs" })]: {
      ...fontSize.m,
    },
    [mediaQuery({ p: "m", l: "s" })]: {
      ...fontSize.l,
    },
  },
  selectors: {
    [`${gameClass.classNames.variants.current.true} &`]: {
      color: color.bam60,
    },
    [`${gameClass.classNames.variants.current.false} &`]: {
      color: color.dot40,
    },
  },
})

export const detailDescriptionClass = style({
  display: "flex",
  alignItems: "center",
  ...fontSize.s,
  fontFamily: primary,
  justifySelf: "start",
  gridColumnStart: 2,
  "@media": {
    [mediaQuery({ p: "s", l: "xs" })]: {
      ...fontSize.m,
    },
    [mediaQuery({ p: "m", l: "s" })]: {
      ...fontSize.l,
    },
  },
  selectors: {
    [`${gameClass.classNames.variants.current.true} &`]: {
      color: color.bam80,
    },
    [`${gameClass.classNames.variants.current.false} &`]: {
      color: color.dot50,
    },
  },
})
