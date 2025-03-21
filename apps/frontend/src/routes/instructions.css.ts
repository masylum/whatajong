import { style } from "@vanilla-extract/css"
import { recipe } from "@vanilla-extract/recipes"
import { color, alpha, hueVariants } from "@/styles/colors"
import { primary } from "@/styles/fontFamily.css"
import { fontSize } from "@/styles/fontSize"

export const instructionsClass = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  padding: "2rem",
  maxWidth: "1200px",
  margin: "0 auto",
  gap: "2rem",
  color: color.bone10,
  fontFamily: primary,
})

export const headerClass = style({
  textAlign: "center",
  ...fontSize.hero3,
  color: color.crack50,
  marginBottom: "1rem",
})

export const sectionClass = style({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  borderRadius: "8px",
  marginBottom: "5rem",
  maxWidth: "800px",
})

export const sectionTitleClass = style({
  ...fontSize.hero4,
  color: color.bam50,
  marginBottom: "1rem",
})

export const sectionSubtitleClass = style({
  ...fontSize.h2,
  color: color.bam20,
  marginBottom: "0.5rem",
})

export const paragraphClass = style({
  ...fontSize.readable,
  fontFamily: "system-ui",
  color: color.bone10,
  marginBottom: "1rem",
})

export const tilePointsClass = style({
  ...fontSize.s,
  color: color.bam50,
  fontWeight: "bold",
})

export const boxClass = recipe({
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
    paddingInline: "2rem",
    paddingBlock: "1rem",
    borderRadius: "8px",
    margin: "0.5rem 0",
  },
  variants: {
    hue: hueVariants((kolor) => ({
      backgroundColor: alpha(kolor(50), 0.2),
    })),
  },
})

export const iconTextClass = style({
  display: "flex",
  alignItems: "center",
  gap: "1rem",
})

export const tileIconClass = style({
  display: "flex",
  flexShrink: 0,
  position: "relative",
})

export const tileTextClass = style({
  ...fontSize.readable,
  color: color.bone10,
  fontFamily: "system-ui",
})

export const highlightClass = recipe({
  base: {
    fontWeight: "bold",
  },
  variants: {
    hue: hueVariants((kolor) => ({
      color: kolor(40),
    })),
  },
})

export const tileColumnClass = style({
  display: "flex",
  flexDirection: "column",
})
