import { style } from "@vanilla-extract/css"
import { alpha, color, hueVariants } from "@/styles/colors"
import { fontSize } from "@/styles/fontSize"
import { primary } from "@/styles/fontFamily.css"
import { recipe } from "@vanilla-extract/recipes"

export const tooltipClass = style({
  position: "absolute",
  background: color.bone90,
  color: color.bone10,
  borderRadius: 12,
  border: `1px solid ${color.bone40}`,
  padding: 12,
  ...fontSize.l,
  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
  zIndex: 10_000,
  pointerEvents: "none",
  transformOrigin: "center bottom",
  display: "flex",
  width: 400,
  gap: 24,
})

export const emperorContainerClass = style({
  display: "flex",
  flexDirection: "column",
  gap: 16,
  fontFamily: primary,
  ...fontSize.h3,
})

// TODO: DRY
export const detailListClass = recipe({
  base: {
    display: "grid",
    gridGap: 12,
    width: "100%",
    gridTemplateColumns: "max-content 1fr",
    padding: 8,
    borderRadius: 4,
    fontVariantLigatures: "none",
  },
  variants: {
    hue: hueVariants((kolor) => ({
      background: `linear-gradient(to bottom, ${alpha(kolor(50), 0.1)}, ${alpha(kolor(50), 0.2)})`,
    })),
  },
})

// TODO: DRY
export const detailTermClass = style({
  ...fontSize.m,
  fontFamily: primary,
  justifySelf: "start",
  selectors: {
    [`${detailListClass.classNames.variants.hue.bone} &`]: {
      color: color.bone30,
    },
  },
})

// TODO: DRY
export const detailDescriptionClass = style({
  ...fontSize.m,
  fontFamily: primary,
  justifySelf: "end",
  gridColumnStart: 2,
  selectors: {
    [`${detailListClass.classNames.variants.hue.bone} &`]: {
      color: color.bone10,
    },
  },
})

// TODO: DRY
export const detailInfoClass = style({
  padding: 8,
  borderRadius: 4,
  background: `linear-gradient(to bottom, ${alpha(color.crack50, 0.1)}, ${alpha(color.crack50, 0.2)})`,
  color: color.crack10,
  fontFamily: "system-ui",
  ...fontSize.m,
})
