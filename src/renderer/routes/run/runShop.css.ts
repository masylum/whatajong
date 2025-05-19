import { getTextureSrc } from "@/assets/assets"
import {
  ANIMATION_FAST,
  ANIMATION_MEDIUM,
  ANIMATION_SLOW,
  easeBounce,
  fromBelowAnimation,
  fromLeftAnimation,
  mildFloatAnimation,
  tileFallingAnimation,
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
  background: `url(${getTextureSrc("2")}) ${color.bone10}`,
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

export const delayVar = createVar()

export const deckItemClass = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  cursor: "pointer",
  transition: `transform ${FLIP_DURATION}ms, filter ${FLIP_DURATION}ms`,
  animationName: tileFallingAnimation,
  animationTimingFunction: easeBounce,
  animationDuration: ANIMATION_SLOW,
  animationFillMode: "backwards",
  animationDelay: delayVar,
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
    justifyContent: "space-between",
    gap: 12,
    position: "relative",
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

export const areaTitleTextClass = style({
  display: "flex",
  alignItems: "center",
  gap: 8,
})

export const coinsClass = style({
  fontFamily: primary,
  fontVariantLigatures: "none",
  display: "inline-block",
  borderRadius: 999,
  ...fontSize.s,
  paddingInline: 8,
  paddingBlock: 1,
  background: `linear-gradient(to bottom, ${alpha(color.crack50, 0.8)}, ${alpha(color.crack40, 0.9)})`,
  boxShadow: `
    1px -1px 1px 0 inset ${color.crack60},
    0px 0px 0px 1px ${color.crack30},
    0px 0px 3px -1px ${color.crack10},
    0px 0px 10px -5px ${color.crack10}
  `,
  color: color.crack90,
  "@media": {
    [mediaQuery({ p: "m", l: "s" })]: {
      ...fontSize.m,
      paddingInline: 12,
      paddingBlock: 2,
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
            ${mildFloatAnimation} 4s ease-in-out ${-i * 1}s infinite
          `,
        },
      ]),
    ),
  },
  variants: {
    sudo: {
      true: {
        zIndex: 9999,
      },
    },
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
    maxWidth: 45,
    position: "relative",
  },
  variants: {
    hue: hueVariants((kolor) => ({
      background: `linear-gradient(to bottom, ${alpha(kolor(50), 0.6)}, ${alpha(kolor(40), 0.9)})`,
      boxShadow: `
        1px 1px 2px 1px inset ${alpha(kolor(80), 0.5)},
        -1px -1px 2px 1px inset ${alpha(kolor(30), 0.5)},
        0px 0px 0px 1px ${kolor(30)},
        0px 0px 0px 3px ${alpha(kolor(30), 0.1)},
        0px 0px 5px -3px ${kolor(10)},
        0px 0px 10px -5px ${kolor(10)}
      `,
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
  },
  variants: {
    hue: hueVariants((kolor) => ({
      background: `linear-gradient(to bottom, ${alpha(kolor(50), 0.2)}, ${alpha(kolor(50), 0.3)})`,
    })),
  },
})

export const materialUpgradeBlockClass = style({
  display: "flex",
  gap: 16,
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
    gap: 20,
    borderRadius: 12,
    position: "relative",
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
      background: alpha(kolor(70), 0.3),
    })),
    full: {
      true: {
        flex: 1,
      },
    },
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

const fadeIn = keyframes({
  "0%": { opacity: 0 },
  "100%": { opacity: 1 },
})

export const tutorialClass = style({
  position: "absolute",
  inset: 0,
  background:
    "radial-gradient(circle, rgba(255, 255, 255, 0.95) 30%, rgba(255, 255, 255, 0.6))",
  zIndex: 2000,
  display: "flex",
  justifyContent: "center",
  flexDirection: "column",
  alignItems: "center",
  gap: 32,
  padding: 48,
  textAlign: "center",
  fontFamily: primary,
  ...fontSize.h2,
  lineHeight: 1.3,
  color: color.bone10,
  animation: `${fadeIn} 1s ease-in-out`,
  "@media": {
    [mediaQuery({ p: "m", l: "s" })]: {
      ...fontSize.h1,
      lineHeight: 1.3,
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      ...fontSize.hero4,
      lineHeight: 1.3,
    },
    [mediaQuery({ p: "xl", l: "l" })]: {
      ...fontSize.hero3,
      lineHeight: 1.3,
    },
  },
})

export const shop1ArrowClass = style({
  position: "absolute",
  top: 50,
  left: "calc(50% + 80px)",
  zIndex: 999999,
  "@media": {
    [mediaQuery({ p: "s", l: "xs" })]: {
      left: "calc(50% + 100px)",
    },
    [mediaQuery({ p: "m", l: "s" })]: {
      left: "calc(50% + 120px)",
    },
    [mediaQuery({ p: "l", l: "m" })]: {
      left: "calc(50% + 140px)",
    },
  },
})

export const shop2ArrowClass = style({
  position: "absolute",
  top: -50,
  right: 30,
})

export const crackClass = style({
  color: color.crack40,
})

export const dotClass = style({
  color: color.dot40,
})

export const bamClass = style({
  color: color.bam40,
})

export const buttonsClass = style({
  display: "flex",
  gap: 24,
  justifyContent: "flex-end",
})
