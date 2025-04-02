import { createContainer, keyframes, style } from "@vanilla-extract/css"
import { primary, secondary } from "@/styles/fontFamily.css"
import { fontSize } from "@/styles/fontSize"
import { alpha, color, hueSelectors, hueVariants } from "@/styles/colors"
import { recipe } from "@vanilla-extract/recipes"
import { heightQueries, mediaQuery } from "@/styles/breakpoints"

const MAX_WIDTH = 1000

const overlayShow = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
})

const contentShow = keyframes({
  from: {
    opacity: 0,
    transform: "scale(0.96) translateY(30px)",
  },
  to: {
    opacity: 1,
    transform: "scale(1) translateY(0)",
  },
})

export const backgroundClass = style({
  height: "100vh",
  background: `url(/halftone.png) ${color.bone10}`,
  backgroundBlendMode: "hard-light",
})

export const shopClass = style({
  display: "flex",
  maxWidth: MAX_WIDTH,
  margin: "0 auto",
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

export const shopHeaderClass = style({
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
})

export const deckClass = style({
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
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
      width: "100%",
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

export const pairClass = style({
  position: "absolute",
  zIndex: -1,
})

export const itemPairClass = style({
  position: "relative",
  zIndex: 1,
})

export const shopItemsClass = style({
  width: "100%",
  display: "grid",
  gridTemplateColumns: "repeat(8, 1fr)",
  justifyContent: "space-between",
  background: `linear-gradient(to bottom, ${alpha(color.dot70, 0.2)}, ${alpha(color.dot70, 0.3)})`,
  padding: 8,
  borderRadius: 12,
  gap: 8,
  "@media": {
    [mediaQuery({ p: "s", l: "xs" })]: {
      gap: 12,
      padding: 12,
    },
    [mediaQuery({ p: "m", l: "s" })]: {
      gap: 16,
      padding: 16,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      gap: 20,
      padding: 20,
    },
  },
})

export const tileItemClass = recipe({
  base: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: 0,
    gap: 8,
    justifyContent: "flex-end",
    border: "none",
    background: "none",
    color: color.dot10,
    transition: "all 0.2s ease-in-out",
    "@media": {
      [mediaQuery({ p: "s", l: "xs" })]: {
        gap: 12,
      },
      [mediaQuery({ p: "m", l: "s" })]: {
        gap: 16,
      },
    },
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
        transform: "translate(-4px, -4px)",
        ":hover": {
          filter: `brightness(1.1) drop-shadow(0 0 5px ${alpha(color.dot10, 0.3)})`,
        },
      },
    },
  },
})

export const shopExtraClass = recipe({
  base: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    alignSelf: "flex-end",
    gap: 8,
    "@media": {
      [mediaQuery({ p: "s", l: "xs" })]: {
        gap: 12,
      },
      [mediaQuery({ p: "m", l: "s" })]: {
        gap: 16,
      },
    },
  },
  variants: {
    disabled: {
      true: {
        filter: "brightness(0.8) saturate(0.8)",
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

export const detailsContentClass = recipe({
  base: {
    zIndex: 50,
    border: `1px solid ${color.bone10}`,
    borderRadius: 12,
    padding: 12,
    backgroundColor: color.bone90,
    fontFamily: primary,
    display: "flex",
    flexDirection: "column",
    gap: 12,
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
        animation: `${contentShow} 300ms ease-out`,
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
  justifyContent: "space-between",
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

export const emperorItemClass = recipe({
  base: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    paddingBlock: 0,
    paddingInline: 16,
    justifyContent: "center",
    border: "none",
    background: "none",
    color: color.crack10,
    transition: "all 0.2s ease-in-out",
    "@media": {
      [mediaQuery({ p: "s", l: "xs" })]: {
        gap: 12,
      },
      [mediaQuery({ p: "m", l: "s" })]: {
        gap: 16,
      },
    },
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
        transform: "translate(-4px, -4px)",
        ":hover": {
          filter: `brightness(1.1) drop-shadow(0 0 10px ${alpha(color.crack10, 0.3)})`,
        },
      },
    },
  },
})

export const modalDetailsClass = style({
  display: "grid",
  gridTemplateColumns: "minmax(50px, 1fr) minmax(70%, max-content)",
  gap: 24,
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
export const ownedEmperorsContainer = createContainer()

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
      width: "100%",
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

export const ownedEmperorsListClass = style({
  display: "flex",
  flexWrap: "wrap",
  minHeight: 0,
  gap: 4,
  gridTemplateRows: "repeat(3, 1fr)",
  gridAutoRows: "1fr",
  "@media": {
    [mediaQuery({ p: "s", l: "xs" })]: {
      gap: 8,
    },
    [mediaQuery({ p: "m", l: "s" })]: {
      gap: 12,
    },
  },
})

export const emperorWrapperClass = style({
  width: 30,
  "@container": {
    [`${ownedEmperorsContainer} (min-width: 300px)`]: {
      width: 40,
    },
    [`${ownedEmperorsContainer} (min-width: 500px)`]: {
      width: 50,
    },
    [`${ownedEmperorsContainer} (min-width: 700px)`]: {
      width: 60,
    },
  },
})

export const emptyEmperorClass = style({
  background: alpha(color.crack10, 0.1),
  boxShadow: `1px 1px 2px 0 inset ${alpha(color.crack10, 0.1)}`,
  borderRadius: 8,
  aspectRatio: "2 / 3",
  flex: 1,
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

export const emperorImageClass = recipe({
  base: {},
  variants: {
    frozen: {
      true: {
        filter: "hue-rotate(175deg) saturate(0.7) brightness(0.8)",
      },
    },
  },
})

export const propertiesClass = style({
  display: "flex",
  overflow: "hidden",
  minHeight: 0,
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
      flexDirection: "column",
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
