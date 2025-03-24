import { keyframes, style } from "@vanilla-extract/css"
import { primary } from "@/styles/fontFamily.css"
import { fontSize } from "@/styles/fontSize"
import { alpha, color, hueVariants } from "@/styles/colors"
import { recipe } from "@vanilla-extract/recipes"
import { getSideSize, TILE_HEIGHT } from "@/state/constants"

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
  minHeight: "100vh",
  fontFamily: "system-ui",
  background: `url(/halftone.png) ${color.bone10}`,
  backgroundBlendMode: "hard-light",
  padding: 32,
})

export const shopGridClass = style({
  display: "flex",
  flexDirection: "column",
  gap: 32,
  maxWidth: MAX_WIDTH,
  margin: "0 auto",
})

export const shopHeaderClass = style({
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
})

export const titleClass = style({
  ...fontSize.hero3,
  fontFamily: primary,
  color: color.jade20,
})

export const deckClass = style({
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  padding: 16,
  gap: 16,
  borderRadius: 12,
  background: `linear-gradient(to bottom, ${alpha(color.bam70, 0.2)}, ${alpha(color.bam70, 0.3)})`,
})

export const deckContainerClass = style({
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
})

export const deckDescriptionClass = style({
  ...fontSize.m,
  color: color.bam10,
  maxWidth: 300,
})

export const deckRowsClass = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "center",
  padding: sideSize * 2,
  paddingRight: sideSize * 4,
  paddingBottom: sideSize * 4,
  position: "relative",
  zIndex: 0,
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
  ...fontSize.h2,
  fontFamily: primary,
  color: color.bam20,
})

export const moneyClass = style({
  ...fontSize.h3,
  fontFamily: primary,
  background: `linear-gradient(to bottom, ${color.gold80}, ${color.gold70})`,
  boxShadow: `1px -1px 0px 0 inset ${color.gold90},
    0px 0px 0px 1px ${color.gold50},
    0px 0px 3px -1px ${color.gold30},
    0px 0px 10px -5px ${color.gold30}`,
  color: color.bone10,
  paddingInline: 16,
  fontVariantLigatures: "none",
  borderRadius: 24,
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
  left: -sideSize,
})

export const itemsContainerClass = style({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  gap: 16,
  padding: 16,
  borderRadius: 12,
  background: `linear-gradient(to bottom, ${alpha(color.dot70, 0.2)}, ${alpha(color.dot70, 0.3)})`,
})

export const itemsTitleClass = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  ...fontSize.h2,
  fontFamily: primary,
  color: color.dot30,
})

export const itemsClass = style({
  display: "flex",
  alignItems: "flex-end",
  height: 120 + 28 + 16, // 28 is the coins height, 16 is the gap
  justifyContent: "center",
  gap: 32,
})

export const itemClass = recipe({
  base: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
    width: 80,
    justifyContent: "flex-end",
    border: "none",
    background: "none",
    padding: 0,
    color: color.dot10,
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
        filter: `brightness(1.1) drop-shadow(0 0 5px ${alpha(color.dot10, 0.3)})`,
        left: -4,
        top: -4,
        ":hover": {
          filter: `brightness(1.1) drop-shadow(0 0 5px ${alpha(color.dot10, 0.3)})`,
        },
      },
    },
  },
})

export const itemTitleClass = style({
  ...fontSize.m,
  color: color.dot30,
  fontFamily: primary,
})

export const itemCostClass = style({
  ...fontSize.m,
  fontFamily: primary,
  background: `linear-gradient(to bottom, ${color.gold80}, ${color.gold70})`,
  boxShadow: `1px -1px 0px 0 inset ${color.gold90},
    0px 0px 0px 1px ${color.gold50},
    0px 0px 3px -1px ${color.gold30},
    0px 0px 10px -5px ${color.gold30}`,
  color: color.bone10,
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
    hue: hueVariants((kolor) => ({
      background: `linear-gradient(to bottom, ${kolor(50)}, ${kolor(40)})`,
      border: `1px solid ${kolor(30)}`,
      color: kolor(90),
      ":focus": {
        outline: `2px solid ${kolor(90)}`,
      },
      boxShadow: `
          -1px -1px 1px 0 inset ${kolor(20)},
          1px 1px 1px 0 inset ${kolor(60)},
          0px 0px 5px -3px ${kolor(10)},
          0px 0px 10px -5px ${kolor(10)}
        `,
    })),
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
  border: `1px solid ${color.bone10}`,
  borderRadius: 24,
  padding: 24,
  backgroundColor: color.bone90,
  fontFamily: primary,
  boxShadow: `0 0 0 4px inset ${color.bone70}`,
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
    material: hueVariants((kolor) => ({
      color: kolor(20),
    })),
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
  color: color.bone10,
})

export const detailInfoClass = style({
  padding: 8,
  borderRadius: 4,
  background: `linear-gradient(to bottom, ${alpha(color.bone90, 0.2)}, ${alpha(color.bone90, 0.4)})`,
})

export const detailFreedomClass = style({
  display: "flex",
  flexDirection: "column",
  gap: 4,
  padding: 8,
  borderRadius: 4,
  background: `linear-gradient(to bottom, ${alpha(color.bronze80, 0.2)}, ${alpha(color.bronze80, 0.4)})`,
  fontFamily: "system-ui",
  color: color.bronze10,
})

export const detailFreedomTitleClass = style({
  ...fontSize.m,
  fontFamily: primary,
  color: color.bronze30,
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
    type: hueVariants((kolor) => ({
      background: `linear-gradient(to bottom, ${alpha(kolor(50), 0.1)}, ${alpha(kolor(50), 0.2)})`,
    })),
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
      color: color.bronze10,
    },
    [`${detailListClass.classNames.variants.type.gold} &`]: {
      color: color.gold10,
    },
  },
})

export const upgradeTitleClass = style({
  ...fontSize.l,
  fontFamily: primary,
  color: color.bam20,
})

export const upgradeDescriptionClass = style({
  ...fontSize.m,
  fontFamily: "system-ui",
  color: color.bam10,
  background: `linear-gradient(to bottom, ${alpha(color.bam10, 0.1)}, ${alpha(color.bam10, 0.2)})`,
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
    color: color.crack10,
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
        filter: `brightness(1.1) drop-shadow(0 0 10px ${alpha(color.crack10, 0.3)})`,
        left: -4,
        top: -4,
        ":hover": {
          filter: `brightness(1.1) drop-shadow(0 0 10px ${alpha(color.crack10, 0.3)})`,
        },
      },
    },
  },
})

export const emptyEmperorClass = style({
  width: 80,
  height: 120,
  borderRadius: 16,
  background: alpha(color.crack10, 0.1),
  boxShadow: `1px 1px 2px 0 inset ${alpha(color.crack10, 0.1)}`,
})

export const modalDetailsClass = style({
  display: "flex",
  justifyContent: "space-between",
  gap: 24,
})

export const modalDetailsContentClass = style({
  display: "flex",
  flexDirection: "column",
  flex: 1,
  gap: 24,
})

export const emperorDetailsTitleClass = style({
  ...fontSize.h2,
  fontFamily: primary,
  color: color.crack10,
})

export const emperorDetailsDescriptionClass = style({
  padding: 8,
  borderRadius: 4,
  background: `linear-gradient(to bottom, ${alpha(color.crack50, 0.1)}, ${alpha(color.crack50, 0.2)})`,
  color: color.crack20,
  ...fontSize.m,
})

export const ownedEmperorsClass = style({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  padding: 16,
  borderRadius: 12,
  gap: 16,
  background: `linear-gradient(to bottom, ${alpha(color.crack70, 0.2)}, ${alpha(color.crack70, 0.3)})`,
})

export const ownedEmperorsTitleClass = style({
  ...fontSize.h2,
  fontFamily: primary,
  color: color.crack20,
})

export const ownedEmperorsListClass = style({
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  justifyContent: "center",
})

export const MINI_TILE_SIZE = 24

export const nextRoundClass = style({
  display: "flex",
  alignItems: "center",
  borderRadius: 12,
  padding: 12,
  background: `linear-gradient(to bottom, ${alpha(color.bone70, 0.2)}, ${alpha(color.bone70, 0.3)})`,
  gap: 24,
})

export const nextRoundTitleClass = style({
  ...fontSize.h2,
  fontFamily: primary,
  color: color.bone30,
  whiteSpace: "nowrap",
})

export const nextRoundDetailListClass = style({
  display: "grid",
  columnGap: 8,
  rowGap: 4,
  width: "100%",
  gridTemplateColumns: "max-content",
  alignItems: "center",
})

export const nextRoundDetailTermClass = style({
  color: color.bone40,
  display: "flex",
  alignItems: "center",
})

export const nextRoundDetailDescriptionClass = style({
  color: color.bone30,
  ...fontSize.s,
  fontFamily: primary,
  gridColumnStart: 2,
})
