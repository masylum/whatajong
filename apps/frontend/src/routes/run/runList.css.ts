import { alpha, color, hueVariants } from "@/styles/colors"
import { primary, secondary } from "@/styles/fontFamily.css"
import { fontSize } from "@/styles/fontSize"
import { style } from "@vanilla-extract/css"
import { recipe } from "@vanilla-extract/recipes"

export const containerClass = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 64,
  padding: 64,
  height: "100vh",
  width: "100vw",
  background: `linear-gradient(to bottom, ${color.dot10}, black)`,
})

export const gamesClass = style({
  display: "flex",
  flexDirection: "column",
  gap: 32,
})

export const titleContainerClass = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 16,
})

export const titleClass = style({
  ...fontSize.hero3,
  fontFamily: primary,
  color: color.dot90,
  fontVariantLigatures: "none",
  textAlign: "center",
})

export const subtitleClass = style({
  ...fontSize.h1,
  fontFamily: primary,
  color: color.dot60,
  textAlign: "center",
  maxWidth: 1000,
})

export const tableClass = style({
  borderCollapse: "collapse",
  width: "100%",
  borderRadius: 12,
  overflow: "hidden",
})

export const tableHeaderClass = style({
  ...fontSize.h3,
  fontFamily: primary,
  color: color.dot60,
  background: alpha(color.dot40, 0.5),
})

export const tableRowClass = recipe({
  base: {
    ...fontSize.l,
    fontFamily: secondary,
  },
  variants: {
    hue: hueVariants((kolor) => ({
      background: alpha(kolor(20), 0.5),
      color: kolor(70),
    })),
  },
})

export const tableCellClass = style({
  padding: 24,
})

export const tableCellNameClass = style([
  tableCellClass,
  {
    fontFamily: primary,
    textTransform: "capitalize",
  },
])
