import { style } from "@vanilla-extract/css"
import { alpha, color } from "@/styles/colors"
import { fontSize } from "@/styles/fontSize"
import { primary } from "@/styles/fontFamily.css"
import { recipe } from "@vanilla-extract/recipes"

export const pointsContainerClass = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  paddingInline: 32,
  paddingBlock: 24,
  borderRadius: 32,
  gap: 16,
})

export const detailListClass = recipe({
  base: {
    display: "grid",
    rowGap: 16,
    columnGap: 64,
    justifyContent: "space-between",
    gridTemplateColumns: "max-content",
    padding: 16,
    borderRadius: 16,
    width: "100%",
  },
  variants: {
    hue: {
      bamb: {
        background: `linear-gradient(to bottom, ${alpha(color.bam50, 0.4)}, ${alpha(color.bam50, 0.2)})`,
      },
      crack: {
        background: `linear-gradient(to bottom, ${alpha(color.crack50, 0.4)}, ${alpha(color.crack50, 0.2)})`,
      },
      dot: {
        background: `linear-gradient(to bottom, ${alpha(color.dot50, 0.4)}, ${alpha(color.dot50, 0.2)})`,
      },
      gold: {
        background: `linear-gradient(to bottom, ${alpha(color.gold50, 0.4)}, ${alpha(color.gold50, 0.2)})`,
      },
    },
  },
})
export const detailTermClass = style({
  ...fontSize.h1,
  fontFamily: primary,
  selectors: {
    [`${detailListClass.classNames.variants.hue.bamb} &`]: {
      color: color.bam60,
    },
    [`${detailListClass.classNames.variants.hue.crack} &`]: {
      color: color.crack60,
    },
    [`${detailListClass.classNames.variants.hue.dot} &`]: {
      color: color.dot60,
      ...fontSize.hero4,
    },
    [`${detailListClass.classNames.variants.hue.gold} &`]: {
      color: color.gold60,
    },
  },
})

export const detailDescriptionClass = style({
  ...fontSize.h1,
  fontFamily: primary,
  justifySelf: "start",
  gridColumnStart: 2,
  selectors: {
    [`${detailListClass.classNames.variants.hue.bamb} &`]: {
      color: color.bam80,
    },
    [`${detailListClass.classNames.variants.hue.crack} &`]: {
      color: color.crack80,
    },
    [`${detailListClass.classNames.variants.hue.dot} &`]: {
      color: color.dot80,
      ...fontSize.hero4,
    },
    [`${detailListClass.classNames.variants.hue.gold} &`]: {
      color: color.gold80,
    },
  },
})
