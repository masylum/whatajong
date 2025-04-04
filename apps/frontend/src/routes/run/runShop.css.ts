import {
  createContainer,
  createVar,
  keyframes,
  style,
} from "@vanilla-extract/css"
import { primary, secondary } from "@/styles/fontFamily.css"
import { fontSize } from "@/styles/fontSize"
import { alpha, color, hueSelectors, hueVariants } from "@/styles/colors"
import { recipe } from "@vanilla-extract/recipes"
import { heightQueries, mediaQuery } from "@/styles/breakpoints"
import {
  ANIMATION_MEDIUM,
  easeBounce,
  fromBelowAnimation,
} from "@/styles/animations.css"

const MAX_WIDTH = 1000
const MAX_HEIGHT = 600
const FLIP_DURATION = 100

const overlayShow = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
})

export const backgroundClass = style({
  height: "100vh",
  background: `url(/halftone.png) ${color.bone10}`,
  backgroundBlendMode: "hard-light",
  display: "flex",
  justifyContent: "center",
})

export const shopClass = style({
  display: "flex",
  maxWidth: MAX_WIDTH,
  maxHeight: MAX_HEIGHT,
  flexDirection: "column",
  fontFamily: secondary,
  gap: 12,
  padding: 12,
  height: "100%",
  "@media": {
    [mediaQuery({ p: "s", l: "xs" })]: {
      gap: 16,
      padding: 16,
    },
    [mediaQuery({ p: "m", l: "s" })]: {
      gap: 20,
      padding: 20,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      gap: 24,
      padding: 24,
    },
  },
})

export const deckClass = style({
  display: "flex",
  flexDirection: "column",
  padding: 8,
  gap: 8,
  borderRadius: 12,
  width: "70%",
  background: `linear-gradient(to bottom, ${alpha(color.bam70, 0.2)}, ${alpha(color.bam70, 0.3)})`,
  "@media": {
    [mediaQuery({ p: "s", l: "xs" })]: {
      padding: 12,
    },
    [mediaQuery({ p: "m", l: "s" })]: {
      padding: 16,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      padding: 20,
    },
  },
})

export const deckRowsClass = style({
  display: "flex",
  alignItems: "flex-start",
  flexWrap: "wrap",
  justifyContent: "flex-start",
  position: "relative",
  zIndex: 0,
})

export const deckItemClass = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  cursor: "pointer",
  transition: `transform ${FLIP_DURATION}ms, filter ${FLIP_DURATION}ms`,
  ":hover": {
    transform: "translate(-5%, -5%)",
    filter: "brightness(1.1)",
  },
})

export const deckTitleClass = recipe({
  base: {
    ...fontSize.s,
    fontFamily: primary,
    display: "flex",
    alignItems: "center",
    gap: 12,
    "@media": {
      [mediaQuery({ p: "s", l: "xs" })]: {
        ...fontSize.m,
      },
      [mediaQuery({ p: "m", l: "s" })]: {
        ...fontSize.l,
      },
    },
  },
  variants: {
    full: {
      true: {
        color: color.bam40,
      },
      false: {
        color: color.bam30,
      },
    },
  },
})

export const pillClass = recipe({
  base: {
    fontFamily: primary,
    fontVariantLigatures: "none",
    display: "inline-block",
    borderRadius: 999,
    ...fontSize.s,
    paddingInline: 8,
    paddingBlock: 1,
    "@media": {
      [mediaQuery({ p: "m", l: "s" })]: {
        ...fontSize.m,
        paddingInline: 12,
        paddingBlock: 2,
      },
    },
  },
  variants: {
    hue: hueVariants((kolor) => ({
      background: `linear-gradient(to bottom, ${kolor(80)}, ${kolor(70)})`,
      boxShadow: `1px -1px 0px 0 inset ${kolor(90)},
        0px 0px 0px 1px ${kolor(50)},
        0px 0px 3px -1px ${kolor(30)},
        0px 0px 10px -5px ${kolor(30)}
      `,
      color: kolor(10),
    })),
  },
  defaultVariants: {
    hue: "gold",
  },
})

export const shopItemsClass = style({
  width: "100%",
  display: "flex",
  justifyContent: "center",
  background: `linear-gradient(to bottom, ${alpha(color.dot70, 0.2)}, ${alpha(color.dot70, 0.3)})`,
  padding: 8,
  borderRadius: 12,
  gap: 12,
  "@media": {
    [mediaQuery({ p: "s", l: "xs" })]: {
      gap: 20,
      padding: 12,
    },
    [mediaQuery({ p: "m", l: "s" })]: {
      gap: 24,
      padding: 16,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      gap: 28,
      padding: 20,
    },
  },
})

export const rotation = createVar()

export const shopItemClass = recipe({
  base: {
    borderRadius: 8,
    overflow: "hidden",
    flex: 1,
    boxShadow: `0 0 0 1px ${alpha(color.dot10, 0.2)}`,
    padding: 0,
    background: "none",
    display: "flex",
    flexDirection: "column",
    maxWidth: 50,
    transition: `transform ${FLIP_DURATION}ms, filter ${FLIP_DURATION}ms`,
    transform: `rotateZ(${rotation})`,
  },
  variants: {
    disabled: {
      true: {
        filter: "brightness(0.8) saturate(0.8)",
        ":hover": {
          transform: "rotateZ(0deg) scale(1.1)",
        },
      },
      false: {
        cursor: "pointer",
        ":hover": {
          transform: "rotateZ(0deg) scale(1.2)",
          filter: "brightness(1.1)",
        },
      },
    },
    hue: hueVariants((kolor) => ({
      background: `linear-gradient(to bottom, ${kolor(90)}, ${kolor(80)})`,
      border: `1px solid ${kolor(40)}`,
      color: kolor(30),
    })),
    frozen: {
      true: {
        filter: "brightness(0.9) saturate(0.8)",
        background: `linear-gradient(to bottom, ${color.glass90}, ${color.glass80})`,
        border: `1px solid ${color.glass40}`,
        color: color.glass30,
      },
    },
  },
})

export const shopItemContentClass = style({
  padding: 2,
  borderBottom: `1px solid ${alpha(color.dot10, 0.2)}`,
  flex: 1,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: 60,
})

export const shopItemCostClass = style({
  padding: 2,
  background: `linear-gradient(to bottom, ${color.gold80}, ${color.gold70})`,
  color: color.gold30,
  fontWeight: 700,
  ...fontSize.s,
  selectors: {
    [`${shopItemClass.classNames.variants.frozen.true} &`]: {
      background: `linear-gradient(to bottom, ${color.glass70}, ${color.glass60})`,
      color: color.glass30,
    },
  },
})

export const continueClass = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
})

export const dialogOverlayClass = style({
  position: "fixed",
  inset: 0,
  zIndex: 50,
  background: alpha(color.bone20, 0.2),
  selectors: {
    "&[data-expanded]": {
      animation: `${overlayShow} ${ANIMATION_MEDIUM} ${easeBounce}`,
    },
  },
})

export const dialogPositionerClass = style({
  position: "fixed",
  inset: 0,
  zIndex: 50,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  maxHeight: 600,
})

export const dialogContentClass = recipe({
  base: {
    zIndex: 50,
    borderRadius: 12,
    padding: 16,
    backgroundColor: color.bone90,
    fontFamily: primary,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    position: "relative",
    boxShadow: `
      0px 1px 1px 0px ${alpha(color.bone30, 0.3)},
      0px 1px 5px -2px ${alpha(color.bone30, 0.3)},
      0px 1px 10px -5px ${alpha(color.bone30, 0.3)},
      0px 1px 20px -10px ${alpha(color.bone30, 0.3)}
    `,
    "@media": {
      [mediaQuery({ p: "s", l: "xs" })]: {
        gap: 16,
      },
      [mediaQuery({ p: "m", l: "s" })]: {
        gap: 20,
      },
    },
    selectors: {
      "&[data-expanded]": {
        animationName: fromBelowAnimation,
        animationDuration: ANIMATION_MEDIUM,
        animationTimingFunction: easeBounce,
      },
    },
  },
  variants: {
    type: {
      tile: {
        width: 400,
      },
      upgrade: {
        width: 500,
      },
      emperor: {
        width: 450,
      },
      tileUpgrade: {
        width: 700,
      },
    },
  },
})

export const buttonsClass = style({
  display: "flex",
  gap: 24,
  justifyContent: "flex-end",
})

export const materialUpgradesClass = style({
  display: "flex",
  gap: 12,
  "@media": {
    [mediaQuery({ p: "s", l: "xs" })]: {
      gap: 16,
    },
    [mediaQuery({ p: "m", l: "s" })]: {
      gap: 20,
    },
  },
})
export const materialUpgradeClass = recipe({
  base: {
    border: "none",
    background: "none",
    transition: "all 0.2s ease-in-out",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 8,
  },
  variants: {
    hue: hueVariants((kolor) => ({
      background: `linear-gradient(to bottom, ${alpha(kolor(50), 0.2)}, ${alpha(kolor(50), 0.3)})`,
    })),
  },
})

export const materialUpgradeTitleClass = recipe({
  base: {
    ...fontSize.l,
    fontFamily: primary,
    display: "flex",
    alignItems: "center",
    gap: 12,
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
  ...fontSize.l,
  fontFamily: primary,
  color: color.bone10,
  "@media": {
    [heightQueries.s]: {
      ...fontSize.h3,
    },
    [heightQueries.m]: {
      ...fontSize.h2,
    },
  },
})

export const detailListClass = recipe({
  base: {
    display: "grid",
    gridGap: 8,
    width: "100%",
    gridTemplateColumns: "max-content",
    padding: 8,
    borderRadius: 4,
    fontVariantLigatures: "none",
    "@media": {
      [mediaQuery({ p: "s", l: "xs" })]: {
        gridGap: 12,
      },
    },
  },
  variants: {
    type: hueVariants((kolor) => ({
      background: `linear-gradient(to bottom, ${alpha(kolor(50), 0.1)}, ${alpha(kolor(50), 0.2)})`,
    })),
  },
})

export const detailTermClass = style({
  ...fontSize.s,
  fontFamily: primary,
  justifySelf: "start",
  selectors: hueSelectors(
    (hue) => `${detailListClass.classNames.variants.type[hue]} &`,
    (kolor) => ({
      color: kolor(30),
    }),
  ),
  "@media": {
    [heightQueries.s]: {
      ...fontSize.m,
    },
  },
})

export const detailDescriptionClass = style({
  ...fontSize.s,
  fontFamily: primary,
  justifySelf: "end",
  gridColumnStart: 2,
  selectors: hueSelectors(
    (hue) => `${detailListClass.classNames.variants.type[hue]} &`,
    (kolor) => ({
      color: kolor(10),
    }),
  ),
  "@media": {
    [heightQueries.s]: {
      ...fontSize.m,
    },
  },
})

export const upgradeTitleClass = style({
  ...fontSize.l,
  textAlign: "center",
  fontFamily: primary,
  color: color.bone40,
  "@media": {
    [mediaQuery({ p: "s", l: "xs" })]: {
      ...fontSize.h3,
    },
    [mediaQuery({ p: "m", l: "s" })]: {
      ...fontSize.h2,
    },
  },
})

export const upgradeDescriptionClass = style({
  ...fontSize.s,
  textAlign: "center",
  fontFamily: secondary,
  color: color.bone30,
  display: "flex",
  flexDirection: "column",
  gap: 4,
  "@media": {
    [mediaQuery({ p: "s", l: "xs" })]: {
      ...fontSize.m,
      gap: 8,
    },
  },
})

export const modalDetailsClass = style({
  display: "flex",
  gap: 16,
  minWidth: 0,
  "@media": {
    [mediaQuery({ p: "s", l: "xs" })]: {
      gap: 24,
    },
  },
})

export const modalEmperorClass = style({
  aspectRatio: "2 / 3",
  width: "100%",
  maxWidth: 100,
  cursor: "pointer",
  minWidth: 0,
  borderRadius: 8,
  border: `1px solid ${color.bone40}`,
})

export const modalDetailsContentClass = style({
  display: "flex",
  flexDirection: "column",
  flex: 1,
  gap: 12,
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
  color: color.crack10,
  fontFamily: secondary,
  ...fontSize.m,
})

const ownedEmperorsContainer = createContainer()

export const ownedEmperorsClass = style({
  display: "flex",
  flexDirection: "column",
  containerName: ownedEmperorsContainer,
  containerType: "inline-size",
  padding: 8,
  gap: 8,
  borderRadius: 12,
  width: "30%",
  minHeight: 0,
  background: `linear-gradient(to bottom, ${alpha(color.crack70, 0.2)}, ${alpha(color.crack70, 0.3)})`,
  "@media": {
    [mediaQuery({ p: "s", l: "xs" })]: {
      padding: 12,
    },
    [mediaQuery({ p: "m", l: "s" })]: {
      padding: 16,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      padding: 20,
    },
  },
})

export const ownedEmperorsTitleClass = recipe({
  base: {
    ...fontSize.s,
    fontFamily: primary,
    display: "flex",
    alignItems: "center",
    gap: 12,
    whiteSpace: "nowrap",
    "@media": {
      [mediaQuery({ p: "s", l: "xs" })]: {
        ...fontSize.m,
      },
      [mediaQuery({ p: "m", l: "s" })]: {
        ...fontSize.l,
      },
    },
  },
  variants: {
    full: {
      true: {
        color: color.crack40,
      },
      false: {
        color: color.crack30,
      },
    },
  },
})

export const ownedEmperorsListClass = style({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(30px, 1fr))",
  minHeight: 0,
  gap: 4,
  "@media": {
    [mediaQuery({ p: "s", l: "xs" })]: {
      gap: 8,
    },
    [mediaQuery({ p: "m", l: "s" })]: {
      gap: 12,
    },
  },
})

export const emperorClass = style({
  aspectRatio: "2 / 3",
  maxHeight: "100%",
  cursor: "pointer",
  minHeight: 0,
  borderRadius: 8,
  transition: `transform ${FLIP_DURATION}ms, filter ${FLIP_DURATION}ms`,
  border: `1px solid ${color.bone40}`,
  ":hover": {
    transform: "scale(1.1)",
    filter: "brightness(1.1)",
  },
  "@container": {
    [`${ownedEmperorsContainer} (min-width: 300px)`]: {
      borderRadius: 12,
    },
    [`${ownedEmperorsContainer} (min-width: 500px)`]: {
      borderRadius: 16,
    },
  },
})

export const emptyEmperorClass = style({
  aspectRatio: "2 / 3",
  maxHeight: "100%",
  background: alpha(color.crack10, 0.1),
  boxShadow: `1px 1px 2px 0 inset ${alpha(color.crack10, 0.1)}`,
  borderRadius: 8,
  "@container": {
    [`${ownedEmperorsContainer} (min-width: 300px)`]: {
      borderRadius: 12,
    },
    [`${ownedEmperorsContainer} (min-width: 500px)`]: {
      borderRadius: 16,
    },
  },
})

export const MINI_TILE_SIZE = 24

export const fullExplanationClass = recipe({
  base: {
    ...fontSize.s,
    fontFamily: secondary,
    paddingInline: 12,
    paddingBlock: 4,
    borderRadius: 4,
  },
  variants: {
    hue: hueVariants((kolor) => ({
      color: kolor(40),
      background: `linear-gradient(to bottom, ${alpha(kolor(50), 0.1)}, ${alpha(kolor(50), 0.2)})`,
    })),
  },
})

export const shopHeaderClass = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
})

export const shopHeaderItemsClass = style({
  display: "flex",
  alignItems: "center",
  gap: 12,
  "@media": {
    [mediaQuery({ p: "s", l: "xs" })]: {
      gap: 16,
    },
    [mediaQuery({ p: "m", l: "s" })]: {
      gap: 20,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      gap: 24,
    },
  },
})
export const shopHeaderItemClass = recipe({
  base: {
    display: "flex",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
    fontFamily: primary,
    gap: 12,
  },
  variants: {
    hue: hueVariants((kolor) => ({
      background: `linear-gradient(to bottom, ${alpha(kolor(70), 0.2)}, ${alpha(kolor(70), 0.3)})`,
      color: kolor(30),
    })),
  },
})

export const propertiesClass = style({
  display: "flex",
  overflow: "hidden",
  minHeight: 0,
  gap: 12,
  flex: 1,
  "@media": {
    [mediaQuery({ p: "s", l: "xs" })]: {
      gap: 16,
    },
    [mediaQuery({ p: "m", l: "s" })]: {
      gap: 20,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      gap: 24,
    },
  },
})

export const shopHeaderTitleClass = style({
  ...fontSize.h3,
  fontFamily: primary,
  color: color.bone10,
  "@media": {
    [mediaQuery({ p: "s", l: "xs" })]: {
      ...fontSize.h2,
    },
    [mediaQuery({ p: "m", l: "s" })]: {
      ...fontSize.h1,
    },
  },
})

export const closeButtonClass = style({
  position: "absolute",
  display: "flex",
  background: "none",
  border: "none",
  top: 8,
  right: 8,
  zIndex: 2002,
  cursor: "pointer",
  padding: 4,
  color: color.bone10,
  outline: "none",
  ":hover": {
    color: color.bone30,
  },
})

export const upgradeCardPreviewClass = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
})
