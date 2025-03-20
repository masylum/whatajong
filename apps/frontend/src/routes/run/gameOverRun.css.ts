import { style } from "@vanilla-extract/css"
import { alpha, color } from "@/styles/colors"
import { fontSize } from "@/styles/fontSize"
import { screenClass } from "@/components/game/gameOver.css"
import { primary } from "@/styles/fontFamily.css"
import { recipe } from "@vanilla-extract/recipes"
import { materialColors } from "@/styles/materialColors"

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

export const titleClass = style({
  ...fontSize.hero3,
  selectors: {
    [`${screenClass.classNames.variants.win.true} &`]: {
      color: color.bamboo90,
    },
    [`${screenClass.classNames.variants.win.false} &`]: {
      color: color.character90,
    },
  },
})

export const detailListClass = recipe({
  base: {
    display: "grid",
    rowGap: 16,
    columnGap: 64,
    justifyContent: "space-between",
    gridTemplateColumns: "max-content",
    padding: 16,
    borderRadius: 12,
    width: "100%",
  },
  variants: {
    hue: {
      bamb: {
        background: `linear-gradient(to bottom, ${alpha(color.bamboo50, 0.3)}, ${alpha(color.bamboo50, 0.2)})`,
        boxShadow: `
          1px 1px 1px 0px inset ${alpha(color.bamboo60, 0.4)},
          -1px -1px 1px 0px inset ${alpha(color.bamboo30, 0.4)}
        `,
      },
      crack: {
        background: `linear-gradient(to bottom, ${alpha(color.character50, 0.3)}, ${alpha(color.character50, 0.2)})`,
        boxShadow: `
          1px 1px 1px 0px inset ${alpha(color.character60, 0.4)},
          -1px -1px 1px 0px inset ${alpha(color.character30, 0.4)}
        `,
      },
      dot: {
        background: `linear-gradient(to bottom, ${alpha(color.circle50, 0.3)}, ${alpha(color.circle50, 0.2)})`,
        boxShadow: `
          1px 1px 1px 0px inset ${alpha(color.circle60, 0.4)},
          -1px -1px 1px 0px inset ${alpha(color.circle30, 0.4)}
        `,
      },
      gold: {
        background: `linear-gradient(to bottom, ${alpha(materialColors.gold[50], 0.3)}, ${alpha(materialColors.gold[50], 0.2)})`,
        boxShadow: `
          1px 1px 1px 0px inset ${alpha(materialColors.gold[60], 0.4)},
          -1px -1px 1px 0px inset ${alpha(materialColors.gold[30], 0.4)}
        `,
      },
    },
  },
})
export const detailTermClass = style({
  ...fontSize.h1,
  fontFamily: primary,
  selectors: {
    [`${detailListClass.classNames.variants.hue.bamb} &`]: {
      color: color.bamboo60,
    },
    [`${detailListClass.classNames.variants.hue.crack} &`]: {
      color: color.character60,
    },
    [`${detailListClass.classNames.variants.hue.dot} &`]: {
      color: color.circle60,
      ...fontSize.hero4,
    },
    [`${detailListClass.classNames.variants.hue.gold} &`]: {
      color: materialColors.gold[60],
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
      color: color.bamboo80,
    },
    [`${detailListClass.classNames.variants.hue.crack} &`]: {
      color: color.character80,
    },
    [`${detailListClass.classNames.variants.hue.dot} &`]: {
      color: color.circle80,
      ...fontSize.hero4,
    },
    [`${detailListClass.classNames.variants.hue.gold} &`]: {
      color: materialColors.gold[80],
    },
  },
})
