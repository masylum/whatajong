import { style } from "@vanilla-extract/css"
import { alpha, color } from "@/styles/colors"
import { fontSize } from "@/styles/fontSize"
import { primary } from "@/styles/fontFamily.css"
import { recipe } from "@vanilla-extract/recipes"

export const tooltipClass = style({
  position: "absolute",
  background: color.bone90,
  color: color.bone10,
  borderRadius: 8,
  border: `1px solid ${color.bone40}`,
  padding: 8,
  ...fontSize.l,
  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
  zIndex: 10_000,
  pointerEvents: "none",
  transformOrigin: "center bottom",
  display: "flex",
  flexDirection: "column",
  width: 300,
  gap: 8,
})

export const emperorContainerClass = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  fontFamily: primary,
  ...fontSize.h3,
})

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
    type: {
      character: {
        background: `linear-gradient(to bottom, ${alpha(color.crack50, 0.1)}, ${alpha(color.crack50, 0.2)})`,
      },
    },
  },
})

export const detailTermClass = style({
  ...fontSize.m,
  fontFamily: primary,
  justifySelf: "start",
  selectors: {
    [`${detailListClass.classNames.variants.type.character} &`]: {
      color: color.crack30,
    },
  },
})

export const detailDescriptionClass = style({
  ...fontSize.m,
  fontFamily: primary,
  justifySelf: "end",
  gridColumnStart: 2,
  selectors: {
    [`${detailListClass.classNames.variants.type.character} &`]: {
      color: color.crack10,
    },
  },
})

export const detailInfoClass = style({
  padding: 8,
  borderRadius: 4,
  background: `linear-gradient(to bottom, ${alpha(color.crack50, 0.1)}, ${alpha(color.crack50, 0.2)})`,
  color: color.crack10,
  fontFamily: "system-ui",
  ...fontSize.m,
})
