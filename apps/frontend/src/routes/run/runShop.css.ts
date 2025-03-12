import { style } from "@vanilla-extract/css"
import { primary } from "@/styles/fontFamily.css"
import { fontSize } from "@/styles/fontSize"
import { alpha, color } from "@/styles/colors"
import { recipe } from "@vanilla-extract/recipes"
import { materialColors } from "@/styles/materialColors"
import { getSideSize, TILE_HEIGHT } from "@/state/constants"

const sideSize = getSideSize(TILE_HEIGHT)

export const shopClass = style({
  display: "grid",
  gridTemplateAreas: `
    "title next"
    "items details"
    "deck details"
  `,
  gap: 32,
  minHeight: "100vh",
  fontFamily: "system-ui",
  background: `url(/halftone.png) ${color.tile10}`,
  backgroundBlendMode: "hard-light",
  padding: 32,
})

export const titleClass = style({
  gridArea: "title",
  ...fontSize.hero3,
  fontFamily: primary,
  color: materialColors.jade[10],
})

export const deckClass = style({
  gridArea: "deck",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  padding: 16,
  border: `2px solid ${alpha(color.bamboo50, 0.1)}`,
  borderRadius: 8,
  background: `linear-gradient(to bottom, ${alpha(color.bamboo70, 0.4)}, ${alpha(color.bamboo70, 0.5)})`,
})

export const deckRowsClass = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "center",
  padding: sideSize * 2,
})

export const deckRowClass = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
})

export const deckItemClass = recipe({
  base: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    cursor: "pointer",
    transitionProperty: "top, left",
    transitionDuration: "0.2s",
    transitionTimingFunction: "ease-in-out",
    left: 0,
    top: 0,
    ":hover": {
      filter: "brightness(1.1)",
    },
  },
  variants: {
    selected: {
      true: {
        filter: "brightness(1.1)",
        left: 4,
        top: -4,
      },
    },
  },
})

export const statusClass = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  ...fontSize.h2,
  fontFamily: primary,
  color: color.bamboo20,
})

export const moneyClass = style({
  ...fontSize.h3,
  fontFamily: primary,
  background: `linear-gradient(to bottom, ${materialColors.gold[60]}, ${materialColors.gold[50]})`,
  boxShadow: `1px -1px 0px 0 inset ${materialColors.gold[60]},
    0px 0px 0px 1px ${materialColors.gold[30]},
    0px 0px 3px -1px ${materialColors.gold[10]},
    0px 0px 10px -5px ${materialColors.gold[10]}`,
  color: color.tile10,
  paddingInline: 16,
  paddingBlock: 8,
  fontVariantLigatures: "none",
  borderRadius: 8,
})

export const pairClass = style({
  position: "absolute",
  zIndex: -1,
  top: sideSize,
  left: -sideSize,
})

export const itemsContainerClass = style({
  gridArea: "items",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  gap: 16,
  padding: 16,
  border: `2px solid ${alpha(color.circle50, 0.1)}`,
  borderRadius: 8,
  background: `linear-gradient(to bottom, ${alpha(color.circle70, 0.4)}, ${alpha(color.circle70, 0.5)})`,
})

export const itemsTitleClass = style({
  ...fontSize.h2,
  fontFamily: primary,
  color: color.circle30,
})

export const itemsClass = style({
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
  gap: 32,
})

export const itemClass = recipe({
  base: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
    justifyContent: "center",
    border: "none",
    background: "none",
    padding: 0,
    color: color.circle10,
    position: "relative",
    transition: "all 0.2s ease-in-out",
    left: 0,
    top: 0,
  },
  variants: {
    disabled: {
      true: {
        filter: "brightness(0.8) saturate(0.8)",
      },
      false: {
        cursor: "pointer",
        ":hover": {
          filter: "brightness(1.1)",
        },
      },
    },
    selected: {
      true: {
        filter: `brightness(1.1) drop-shadow(0 0 10px ${alpha(color.circle10, 0.3)})`,
        left: 4,
        top: -4,
        ":hover": {
          filter: `brightness(1.1) drop-shadow(0 0 10px ${alpha(color.circle10, 0.3)})`,
        },
      },
    },
  },
})

export const itemTitleClass = style({
  ...fontSize.m,
  color: color.circle30,
  fontFamily: primary,
})

export const itemCostClass = style({
  ...fontSize.m,
  fontFamily: primary,
  background: `linear-gradient(to bottom, ${materialColors.gold[60]}, ${materialColors.gold[50]})`,
  boxShadow: `1px -1px 0px 0 inset ${materialColors.gold[60]},
    0px 0px 0px 1px ${materialColors.gold[30]},
    0px 0px 3px -1px ${materialColors.gold[10]},
    0px 0px 10px -5px ${materialColors.gold[10]}`,
  color: color.tile10,
  paddingInline: 12,
  paddingBlock: 2,
  borderRadius: 16,
})

export const shopExtraClass = recipe({
  base: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    alignSelf: "flex-end",
    gap: 16,
  },
  variants: {
    disabled: {
      true: {
        filter: "brightness(0.8) saturate(0.8)",
      },
    },
  },
})

export const buttonClass = recipe({
  base: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingInline: 12,
    paddingBlock: 8,
    borderRadius: 8,
    fontFamily: primary,
    whiteSpace: "nowrap",
    fontVariantLigatures: "none",
  },
  variants: {
    disabled: {
      false: {
        cursor: "pointer",
        ":hover": {
          filter: "brightness(1.1)",
        },
      },
    },
    suit: {
      tile: {
        background: `linear-gradient(to bottom, ${color.tile40}, ${color.tile30})`,
        border: `1px solid ${color.tile20}`,
        color: color.tile90,
        boxShadow: `
          1px -1px 1px 0 inset ${color.tile20},
          -1px 1px 1px 0 inset ${color.tile50},
          0px 0px 5px -3px ${color.tile10},
          0px 0px 10px -5px ${color.tile10}
        `,
      },
      bamboo: {
        background: `linear-gradient(to bottom, ${color.bamboo60}, ${color.bamboo50})`,
        border: `1px solid ${color.bamboo40}`,
        color: color.bamboo90,
        boxShadow: `
          1px -1px 1px 0 inset ${color.bamboo40},
          -1px 1px 1px 0 inset ${color.bamboo70},
          0px 0px 5px -3px ${color.bamboo10},
          0px 0px 10px -5px ${color.bamboo10}
        `,
      },
      circle: {
        background: `linear-gradient(to bottom, ${color.circle60}, ${color.circle50})`,
        border: `1px solid ${color.circle40}`,
        color: color.circle90,
        boxShadow: `
          1px -1px 1px 0 inset ${color.circle40},
          -1px 1px 1px 0 inset ${color.circle70},
          0px 0px 5px -3px ${color.circle10},
          0px 0px 10px -5px ${color.circle10}
        `,
      },
      character: {
        background: `linear-gradient(to bottom, ${color.character60}, ${color.character50})`,
        border: `1px solid ${color.character40}`,
        color: color.character90,
        boxShadow: `
          1px -1px 1px 0 inset ${color.character40},
          -1px 1px 1px 0 inset ${color.character70},
          0px 0px 5px -3px ${color.character10},
          0px 0px 10px -5px ${color.character10}
        `,
      },
    },
  },
})

export const continueClass = style({
  gridArea: "next",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
})

export const detailsClass = style({
  gridArea: "details",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  border: `2px solid ${alpha(color.tile30, 0.1)}`,
  borderRadius: 8,
  background: `linear-gradient(to bottom, ${alpha(color.tile50, 0.4)}, ${alpha(color.tile50, 0.5)})`,
  padding: 16,
  width: 300,
})

export const detailsContentClass = style({
  display: "flex",
  flexDirection: "column",
  gap: 24,
})

export const buttonsClass = style({
  display: "flex",
  gap: 12,
  justifyContent: "space-between",
  alignItems: "end",
})

export const detailTitleClass = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  gap: 24,
  ...fontSize.h2,
  fontFamily: primary,
  color: color.tile10,
})

export const detailInfoClass = style({
  padding: 12,
  borderRadius: 8,
  background: `linear-gradient(to bottom, ${alpha(color.tile90, 0.2)}, ${alpha(color.tile90, 0.4)})`,
})

export const detailFreedomClass = style({
  display: "flex",
  flexDirection: "column",
  gap: 12,
  padding: 12,
  borderRadius: 8,
  background: `linear-gradient(to bottom, ${alpha(materialColors.bronze[50], 0.2)}, ${alpha(materialColors.bronze[50], 0.4)})`,
})

export const detailFreedomTitleClass = style({
  ...fontSize.m,
  fontFamily: primary,
  color: materialColors.bronze[10],
})

export const detailListClass = recipe({
  base: {
    display: "grid",
    gridGap: 12,
    width: "100%",
    gridTemplateColumns: "max-content",
    padding: 12,
    borderRadius: 8,
    fontVariantLigatures: "none",
  },
  variants: {
    type: {
      points: {
        background: `linear-gradient(to bottom, ${alpha(color.circle50, 0.1)}, ${alpha(color.circle50, 0.2)})`,
      },
      multiplier: {
        background: `linear-gradient(to bottom, ${alpha(color.character50, 0.1)}, ${alpha(color.character50, 0.2)})`,
      },
      total: {
        background: `linear-gradient(to bottom, ${alpha(color.bamboo50, 0.1)}, ${alpha(color.bamboo50, 0.2)})`,
      },
      bronze: {
        background: `linear-gradient(to bottom, ${alpha(materialColors.bronze[40], 0.2)}, ${alpha(materialColors.bronze[40], 0.3)})`,
      },
      gold: {
        background: `linear-gradient(to bottom, ${alpha(materialColors.gold[40], 0.2)}, ${alpha(materialColors.gold[40], 0.3)})`,
      },
    },
  },
})

export const detailTermClass = style({
  ...fontSize.m,
  fontFamily: primary,
  justifySelf: "start",
  selectors: {
    [`${detailListClass.classNames.variants.type.points} &`]: {
      color: color.circle30,
    },
    [`${detailListClass.classNames.variants.type.multiplier} &`]: {
      color: color.character30,
    },
    [`${detailListClass.classNames.variants.type.total} &`]: {
      color: color.bamboo30,
    },
    [`${detailListClass.classNames.variants.type.bronze} &`]: {
      color: color.tile30,
    },
    [`${detailListClass.classNames.variants.type.gold} &`]: {
      color: color.tile30,
    },
  },
})

export const detailDescriptionClass = style({
  ...fontSize.l,
  fontFamily: primary,
  justifySelf: "end",
  gridColumnStart: 2,
  selectors: {
    [`${detailListClass.classNames.variants.type.points} &`]: {
      color: color.circle10,
    },
    [`${detailListClass.classNames.variants.type.multiplier} &`]: {
      color: color.character10,
    },
    [`${detailListClass.classNames.variants.type.total} &`]: {
      color: color.bamboo10,
    },
    [`${detailListClass.classNames.variants.type.bronze} &`]: {
      color: color.tile10,
    },
    [`${detailListClass.classNames.variants.type.gold} &`]: {
      color: color.tile10,
    },
  },
})
