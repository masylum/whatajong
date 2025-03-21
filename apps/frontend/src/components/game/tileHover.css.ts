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
  padding: 12,
  ...fontSize.l,
  maxWidth: "250px",
  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
  zIndex: 10_000,
  pointerEvents: "none",
  transformOrigin: "center bottom",
  display: "flex",
  flexDirection: "column",
  width: 200,
  gap: 12,
})

export const tileClass = style({
  display: "flex",
  alignItems: "center",
  gap: 16,
  fontFamily: primary,
  ...fontSize.h3,
})

export const miniTileClass = style({
  flexShrink: 0,
})

export const detailListClass = recipe({
  base: {
    display: "grid",
    gridGap: 12,
    width: "100%",
    gridTemplateColumns: "max-content",
    padding: 8,
    borderRadius: 4,
    fontVariantLigatures: "none",
  },
  variants: {
    type: {
      dot: {
        background: `linear-gradient(to bottom, ${alpha(color.dot50, 0.1)}, ${alpha(color.dot50, 0.2)})`,
      },
      crack: {
        background: `linear-gradient(to bottom, ${alpha(color.crack50, 0.1)}, ${alpha(color.crack50, 0.2)})`,
      },
      bam: {
        background: `linear-gradient(to bottom, ${alpha(color.bam50, 0.1)}, ${alpha(color.bam50, 0.2)})`,
      },
      bronze: {
        background: `linear-gradient(to bottom, ${alpha(color.bronze70, 0.2)}, ${alpha(color.bronze70, 0.3)})`,
      },
      gold: {
        background: `linear-gradient(to bottom, ${alpha(color.gold70, 0.2)}, ${alpha(color.gold70, 0.3)})`,
      },
    },
  },
})

export const detailTermClass = style({
  ...fontSize.m,
  fontFamily: primary,
  justifySelf: "start",
  selectors: {
    [`${detailListClass.classNames.variants.type.dot} &`]: {
      color: color.dot30,
    },
    [`${detailListClass.classNames.variants.type.crack} &`]: {
      color: color.crack30,
    },
    [`${detailListClass.classNames.variants.type.bam} &`]: {
      color: color.bam30,
    },
    [`${detailListClass.classNames.variants.type.bronze} &`]: {
      color: color.bronze20,
    },
    [`${detailListClass.classNames.variants.type.gold} &`]: {
      color: color.gold20,
    },
  },
})

export const detailDescriptionClass = style({
  ...fontSize.m,
  fontFamily: primary,
  justifySelf: "end",
  gridColumnStart: 2,
  selectors: {
    [`${detailListClass.classNames.variants.type.dot} &`]: {
      color: color.dot10,
    },
    [`${detailListClass.classNames.variants.type.crack} &`]: {
      color: color.crack10,
    },
    [`${detailListClass.classNames.variants.type.bronze} &`]: {
      color: color.bone10,
    },
    [`${detailListClass.classNames.variants.type.gold} &`]: {
      color: color.bone10,
    },
  },
})

export const detailFreedomClass = style({
  display: "flex",
  flexDirection: "column",
  gap: 4,
  padding: 8,
  borderRadius: 4,
  background: `linear-gradient(to bottom, ${alpha(color.bronze80, 0.2)}, ${alpha(color.bronze80, 0.4)})`,
  fontFamily: "system-ui",
  ...fontSize.m,
})

export const detailFreedomTitleClass = style({
  ...fontSize.m,
  fontFamily: primary,
  color: color.bronze20,
})

export const detailInfoClass = style({
  padding: 8,
  borderRadius: 4,
  background: `linear-gradient(to bottom, ${alpha(color.bone50, 0.2)}, ${alpha(color.bone50, 0.4)})`,
  fontFamily: "system-ui",
  ...fontSize.m,
})
