import { style } from "@vanilla-extract/css"
import { alpha, color } from "@/styles/colors"
import { fontSize } from "@/styles/fontSize"
import { primary } from "@/styles/fontFamily.css"
import { recipe } from "@vanilla-extract/recipes"
import { materialColors } from "@/styles/materialColors"

export const tooltipClass = style({
  position: "absolute",
  background: color.tile90,
  color: color.tile10,
  borderRadius: 8,
  border: `1px solid ${color.tile40}`,
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
      circle: {
        background: `linear-gradient(to bottom, ${alpha(color.circle50, 0.1)}, ${alpha(color.circle50, 0.2)})`,
      },
      character: {
        background: `linear-gradient(to bottom, ${alpha(color.character50, 0.1)}, ${alpha(color.character50, 0.2)})`,
      },
      bamboo: {
        background: `linear-gradient(to bottom, ${alpha(color.bamboo50, 0.1)}, ${alpha(color.bamboo50, 0.2)})`,
      },
      bronze: {
        background: `linear-gradient(to bottom, ${alpha(materialColors.bronze[70], 0.2)}, ${alpha(materialColors.bronze[70], 0.3)})`,
      },
      gold: {
        background: `linear-gradient(to bottom, ${alpha(materialColors.gold[70], 0.2)}, ${alpha(materialColors.gold[70], 0.3)})`,
      },
    },
  },
})

export const detailTermClass = style({
  ...fontSize.m,
  fontFamily: primary,
  justifySelf: "start",
  selectors: {
    [`${detailListClass.classNames.variants.type.circle} &`]: {
      color: color.circle30,
    },
    [`${detailListClass.classNames.variants.type.character} &`]: {
      color: color.character30,
    },
    [`${detailListClass.classNames.variants.type.bamboo} &`]: {
      color: color.bamboo30,
    },
    [`${detailListClass.classNames.variants.type.bronze} &`]: {
      color: materialColors.bronze[20],
    },
    [`${detailListClass.classNames.variants.type.gold} &`]: {
      color: materialColors.gold[20],
    },
  },
})

export const detailDescriptionClass = style({
  ...fontSize.m,
  fontFamily: primary,
  justifySelf: "end",
  gridColumnStart: 2,
  selectors: {
    [`${detailListClass.classNames.variants.type.circle} &`]: {
      color: color.circle10,
    },
    [`${detailListClass.classNames.variants.type.character} &`]: {
      color: color.character10,
    },
    [`${detailListClass.classNames.variants.type.bronze} &`]: {
      color: color.tile10,
    },
    [`${detailListClass.classNames.variants.type.gold} &`]: {
      color: color.tile10,
    },
  },
})

export const detailFreedomClass = style({
  display: "flex",
  flexDirection: "column",
  gap: 4,
  padding: 8,
  borderRadius: 4,
  background: `linear-gradient(to bottom, ${alpha(materialColors.bronze[80], 0.2)}, ${alpha(materialColors.bronze[80], 0.4)})`,
  fontFamily: "system-ui",
  ...fontSize.m,
})

export const detailFreedomTitleClass = style({
  ...fontSize.m,
  fontFamily: primary,
  color: materialColors.bronze[20],
})

export const detailInfoClass = style({
  padding: 8,
  borderRadius: 4,
  background: `linear-gradient(to bottom, ${alpha(materialColors.bone[50], 0.2)}, ${alpha(materialColors.bone[50], 0.4)})`,
  fontFamily: "system-ui",
  ...fontSize.m,
})
