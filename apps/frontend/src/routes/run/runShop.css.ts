import { keyframes, style } from "@vanilla-extract/css"
import { primary } from "@/styles/fontFamily.css"
import { fontSize } from "@/styles/fontSize"
import { alpha, color } from "@/styles/colors"
import { recipe } from "@vanilla-extract/recipes"
import { materialColors } from "@/styles/materialColors"
import { getSideSize, TILE_HEIGHT } from "@/state/constants"
import { EMPEROR_HEIGHT, EMPEROR_WIDTH } from "@/components/emperor.css"

const sideSize = getSideSize(TILE_HEIGHT)
const MAX_WIDTH = 1000

const overlayShow = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
})

const contentShow = keyframes({
  from: {
    opacity: 0,
    transform: "scale(0.96)",
  },
  to: {
    opacity: 1,
    transform: "scale(1)",
  },
})

export const shopClass = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 32,
  minHeight: "100vh",
  fontFamily: "system-ui",
  background: `url(/halftone.png) ${color.tile10}`,
  backgroundBlendMode: "hard-light",
  margin: "0 auto",
  padding: 32,
})

export const shopHeaderClass = style({
  maxWidth: MAX_WIDTH,
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
})

export const titleClass = style({
  gridArea: "title",
  ...fontSize.hero3,
  fontFamily: primary,
  color: materialColors.jade[20],
})

export const deckClass = style({
  display: "flex",
  maxWidth: MAX_WIDTH,
  width: "100%",
  flexDirection: "column",
  justifyContent: "space-between",
  padding: 16,
  gap: 16,
  borderRadius: 12,
  background: `linear-gradient(to bottom, ${alpha(color.bamboo70, 0.2)}, ${alpha(color.bamboo70, 0.3)})`,
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

export const deckItemClass = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  transitionProperty: "top, left",
  transitionDuration: "0.2s",
  transitionTimingFunction: "ease-in-out",
  left: 0,
  top: 0,
})

export const deckTitleClass = style({
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
  background: `linear-gradient(to bottom, ${materialColors.gold[90]}, ${materialColors.gold[80]})`,
  boxShadow: `1px -1px 0px 0 inset ${materialColors.gold[90]},
    0px 0px 0px 1px ${materialColors.gold[60]},
    0px 0px 3px -1px ${materialColors.gold[30]},
    0px 0px 10px -5px ${materialColors.gold[30]}`,
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
  left: sideSize,
})

export const itemPairClass = style({
  position: "relative",
  zIndex: 1,
})

export const itemsContainerClass = style({
  maxWidth: MAX_WIDTH,
  width: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  gap: 16,
  padding: 16,
  borderRadius: 12,
  background: `linear-gradient(to bottom, ${alpha(color.circle70, 0.2)}, ${alpha(color.circle70, 0.3)})`,
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
        filter: `brightness(1.1) drop-shadow(0 0 5px ${alpha(color.circle10, 0.3)})`,
        left: -4,
        top: -4,
        ":hover": {
          filter: `brightness(1.1) drop-shadow(0 0 5px ${alpha(color.circle10, 0.3)})`,
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
  background: `linear-gradient(to bottom, ${materialColors.gold[90]}, ${materialColors.gold[80]})`,
  boxShadow: `1px -1px 0px 0 inset ${materialColors.gold[90]},
    0px 0px 0px 1px ${materialColors.gold[60]},
    0px 0px 3px -1px ${materialColors.gold[30]},
    0px 0px 10px -5px ${materialColors.gold[30]}`,
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
    outline: "none",
    outlineOffset: -2,
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
        ":focus": {
          outline: `2px solid ${color.tile90}`,
        },
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
        ":focus": {
          outline: `2px solid ${color.bamboo90}`,
        },
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
        ":focus": {
          outline: `2px solid ${color.circle90}`,
        },
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
        ":focus": {
          outline: `2px solid ${color.character90}`,
        },
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
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
})

export const detailsOverlayClass = style({
  position: "fixed",
  inset: 0,
  zIndex: 50,
  background: `radial-gradient(
    circle,
    ${alpha("#000000", 0.7)},
    ${alpha("#000000", 1)}
  )`,
  selectors: {
    "&[data-expanded]": {
      animation: `${overlayShow} 250ms ease`,
    },
  },
})

export const detailsPositionerClass = style({
  position: "fixed",
  inset: 0,
  zIndex: 50,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
})

export const detailsContentClass = style({
  zIndex: 50,
  width: 500,
  border: `1px solid ${materialColors.bone[10]}`,
  borderRadius: 24,
  padding: 24,
  backgroundColor: materialColors.bone[90],
  fontFamily: primary,
  boxShadow: `0 0 0 4px inset ${materialColors.bone[70]}`,
  display: "flex",
  flexDirection: "column",
  gap: 24,
  selectors: {
    "&[data-expanded]": {
      animation: `${contentShow} 300ms ease-out`,
    },
  },
})

export const buttonsClass = style({
  display: "flex",
  gap: 24,
  justifyContent: "space-between",
})

export const materialUpgradeClass = style({
  border: "none",
  background: "none",
  transition: "all 0.2s ease-in-out",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 12,
  padding: 0,
})

export const materialUpgradeTitleClass = recipe({
  base: {
    ...fontSize.l,
    fontFamily: primary,
  },
  variants: {
    material: {
      glass: {
        color: materialColors.glass[20],
      },
      jade: {
        color: materialColors.jade[20],
      },
      bone: {
        color: materialColors.bone[20],
      },
      bronze: {
        color: materialColors.bronze[20],
      },
      gold: {
        color: materialColors.gold[20],
      },
      bamboo: {},
    },
  },
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
  padding: 8,
  borderRadius: 4,
  background: `linear-gradient(to bottom, ${alpha(color.tile90, 0.2)}, ${alpha(color.tile90, 0.4)})`,
})

export const detailFreedomClass = style({
  display: "flex",
  flexDirection: "column",
  gap: 4,
  padding: 8,
  borderRadius: 4,
  background: `linear-gradient(to bottom, ${alpha(materialColors.bronze[80], 0.2)}, ${alpha(materialColors.bronze[80], 0.4)})`,
  fontFamily: "system-ui",
  color: materialColors.bronze[10],
})

export const detailFreedomTitleClass = style({
  ...fontSize.m,
  fontFamily: primary,
  color: materialColors.bronze[30],
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

export const upgradeTitleClass = style({
  ...fontSize.l,
  fontFamily: primary,
  color: color.bamboo20,
})

export const upgradeDescriptionClass = style({
  ...fontSize.m,
  fontFamily: "system-ui",
  color: color.bamboo10,
  background: `linear-gradient(to bottom, ${alpha(color.bamboo10, 0.1)}, ${alpha(color.bamboo10, 0.2)})`,
  padding: 8,
  borderRadius: 4,
})

export const emperorClass = recipe({
  base: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
    justifyContent: "center",
    border: "none",
    background: "none",
    padding: 0,
    color: color.character10,
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
        filter: `brightness(1.1) drop-shadow(0 0 10px ${alpha(color.character10, 0.3)})`,
        left: -4,
        top: -4,
        ":hover": {
          filter: `brightness(1.1) drop-shadow(0 0 10px ${alpha(color.character10, 0.3)})`,
        },
      },
    },
  },
})

export const emptyEmperorClass = style({
  width: EMPEROR_WIDTH,
  height: EMPEROR_HEIGHT,
  borderRadius: 16,
  background: alpha(color.character10, 0.1),
  boxShadow: `1px 1px 2px 0 inset ${alpha(color.character10, 0.1)}`,
})

export const modalDetailsClass = style({
  display: "flex",
  gap: 24,
})

export const modalDetailsContentClass = style({
  display: "flex",
  flexDirection: "column",
  gap: 24,
})

export const emperorDetailsTitleClass = style({
  ...fontSize.h2,
  fontFamily: primary,
  color: color.character10,
})

export const emperorDetailsDescriptionClass = style({
  padding: 8,
  borderRadius: 4,
  background: `linear-gradient(to bottom, ${alpha(color.character50, 0.1)}, ${alpha(color.character50, 0.2)})`,
  color: color.character20,
  ...fontSize.m,
})

export const ownedEmperorsClass = style({
  maxWidth: MAX_WIDTH,
  width: "100%",
  display: "flex",
  flexDirection: "column",
  padding: 16,
  borderRadius: 12,
  gap: 16,
  background: `linear-gradient(to bottom, ${alpha(color.character70, 0.2)}, ${alpha(color.character70, 0.3)})`,
})

export const ownedEmperorsTitleClass = style({
  ...fontSize.h2,
  fontFamily: primary,
  color: color.character20,
})

export const ownedEmperorsListClass = style({
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  justifyContent: "center",
})

export const MINI_TILE_SIZE = 24
