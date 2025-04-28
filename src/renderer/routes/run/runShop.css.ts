import {
  ANIMATION_FAST,
  ANIMATION_MEDIUM,
  easeBounce,
  fromBelowAnimation,
  fromLeftAnimation,
} from "@/styles/animations.css"
import { heightQueries, mediaQuery } from "@/styles/breakpoints"
import { alpha, color, hueVariants } from "@/styles/colors"
import { primary, secondary } from "@/styles/fontFamily.css"
import { fontSize } from "@/styles/fontSize"
import { createVar, keyframes, style } from "@vanilla-extract/css"
import { recipe } from "@vanilla-extract/recipes"

const MAX_WIDTH = 1000
const MAX_HEIGHT = 1000
const FLIP_DURATION = 100

const overlayShow = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
})

export const backgroundClass = style({
  height: "100dvh",
  background: `url(/halftone.png) ${color.bone10}`,
  backgroundBlendMode: "hard-light",
})

export const shopClass = style({
  display: "flex",
  maxWidth: MAX_WIDTH,
  maxHeight: MAX_HEIGHT,
  flexDirection: "column",
  margin: "0 auto",
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
  WebkitTapHighlightColor: "transparent",
  ":hover": {
    transform: "translate(-5%, -5%)",
    filter: "brightness(1.1)",
  },
})

export const areaTitleClass = recipe({
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
    hue: hueVariants((kolor) => ({
      color: kolor(30),
    })),
  },
})

export const coinsClass = style({
  fontFamily: primary,
  fontVariantLigatures: "none",
  display: "inline-block",
  borderRadius: 999,
  ...fontSize.s,
  paddingInline: 8,
  paddingBlock: 1,
  background: `linear-gradient(to bottom, ${color.gold80}, ${color.gold70})`,
  boxShadow: `1px -1px 0px 0 inset ${color.gold90},
        0px 0px 0px 1px ${color.gold50},
        0px 0px 3px -1px ${color.gold30},
        0px 0px 10px -5px ${color.gold30}
      `,
  color: color.gold10,
  "@media": {
    [mediaQuery({ p: "m", l: "s" })]: {
      ...fontSize.m,
      paddingInline: 12,
      paddingBlock: 2,
    },
  },
})

export const shopContainerClass = style({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  background: `linear-gradient(to bottom, ${alpha(color.bam70, 0.2)}, ${alpha(color.bam70, 0.3)})`,
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

export const shopItemsClass = style({
  display: "flex",
  justifyContent: "center",
  gap: 8,
  "@media": {
    [mediaQuery({ p: "s", l: "xs" })]: {
      gap: 12,
    },
    [mediaQuery({ p: "m", l: "s" })]: {
      gap: 16,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      gap: 20,
    },
    [mediaQuery({ p: "xl", l: "l" })]: {
      gap: 24,
    },
  },
})

export const rotation = createVar()

const float = keyframes({
  "0%": { transform: "translateY(0px) rotate(0deg)" },
  "50%": { transform: "translateY(-5px) rotate(3deg)" },
  "100%": { transform: "translateY(0px) rotate(0deg)" },
})

export const shopItemClass = recipe({
  base: {
    flex: 1,
    padding: 0,
    gap: 12,
    background: "none",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    transition: `transform ${FLIP_DURATION}ms, filter ${FLIP_DURATION}ms`,
    transform: `rotateZ(${rotation})`,
    outline: "none",
    outlineOffset: 2,
    border: "none",
    WebkitTapHighlightColor: "transparent",
    maxWidth: 60,
    selectors: Object.fromEntries(
      Array.from({ length: 7 }, (_, i) => [
        `&:nth-child(${i + 1})`,
        {
          animation: `
            ${ANIMATION_FAST} ease-in-out ${i * 50}ms 1 backwards ${fromLeftAnimation},
            ${float} 4s ease-in-out ${-i * 1}s infinite
          `,
        },
      ]),
    ),
  },
  variants: {
    hoverable: { true: {}, false: {} },
    selected: {
      true: {
        transform: "rotateZ(0deg) scale(1.2)",
        filter: "brightness(1.1)",
      },
      false: {},
    },
    disabled: {
      true: {
        filter: "brightness(0.8) saturate(0.8)",
      },
      false: {},
    },
    frozen: {
      true: {
        filter: "brightness(0.9) sepia(1) hue-rotate(155deg)",
      },
    },
  },
  compoundVariants: [
    {
      variants: {
        hoverable: true,
        disabled: true,
      },
      style: {
        ":hover": {
          transform: "rotateZ(0deg) scale(1.1)",
        },
      },
    },
    {
      variants: {
        hoverable: true,
        disabled: false,
      },
      style: {
        cursor: "pointer",
        ":hover": {
          transform: "rotateZ(0deg) scale(1.2)",
          filter: "brightness(1.1)",
        },
      },
    },
  ],
})

export const shopItemContentClass = style({
  flex: 1,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "100%",
})

export const shopItemButtonClass = recipe({
  base: {
    background: "none",
    border: "none",
    padding: 0,
    margin: 0,
    borderRadius: 8,
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  variants: {
    hue: hueVariants((kolor) => ({
      background: `linear-gradient(to bottom, ${kolor(50)}, ${kolor(40)})`,
      border: `1px solid ${kolor(40)}`,
      color: kolor(90),
    })),
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
  padding: 16,
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
    gap: 32,
    position: "relative",
    minWidth: 300,
    minHeight: 0,
    maxHeight: "100%",
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
        maxWidth: 400,
      },
      upgrade: {
        maxWidth: 500,
      },
      tileUpgrade: {
        maxWidth: 700,
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
  flexDirection: "column",
  gap: 12,
  "@media": {
    [mediaQuery({ p: "s", l: "xs" })]: {
      gap: 16,
    },
    [mediaQuery({ p: "m", l: "s" })]: {
      gap: 20,
      flexDirection: "row",
    },
  },
})

export const materialUpgradeClass = recipe({
  base: {
    border: "none",
    background: "none",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 8,
    flex: 1,
    "@media": {
      [mediaQuery({ p: "m", l: "s" })]: {
        flexDirection: "column",
      },
    },
  },
  variants: {
    hue: hueVariants((kolor) => ({
      background: `linear-gradient(to bottom, ${alpha(kolor(50), 0.2)}, ${alpha(kolor(50), 0.3)})`,
    })),
  },
})

export const materialUpgradeBlockClass = style({
  display: "flex",
  gap: 24,
})

export const materialUpgradeTextClass = recipe({
  base: {
    ...fontSize.m,
    lineHeight: 1,
    fontFamily: secondary,
  },
  variants: {
    hue: hueVariants((kolor) => ({
      color: kolor(30),
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
    hue: hueVariants((kolor) => ({
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
  minHeight: 0,
  "@media": {
    [mediaQuery({ p: "s", l: "xs" })]: {
      gap: 24,
    },
  },
})

export const modalDetailsContentClass = style({
  display: "flex",
  flexDirection: "column",
  flex: 1,
  gap: 12,
  minHeight: 0,
})

export const areaClass = recipe({
  base: {
    display: "flex",
    flexDirection: "column",
    padding: 8,
    gap: 8,
    flex: 1,
    borderRadius: 12,
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
  },
  variants: {
    hue: hueVariants((kolor) => ({
      background: `linear-gradient(to bottom, ${alpha(kolor(70), 0.2)}, ${alpha(kolor(70), 0.3)})`,
    })),
  },
})

export const pairClass = style({
  position: "absolute",
  zIndex: -1,
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
    ...fontSize.s,
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
    hue: hueVariants((kolor) => ({
      background: `linear-gradient(to bottom, ${alpha(kolor(70), 0.2)}, ${alpha(kolor(70), 0.3)})`,
      color: kolor(30),
    })),
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

export const videoContainerClass = style({
  minHeight: 0,
  flex: 1,
})
