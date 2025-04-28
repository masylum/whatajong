import {
  ANIMATION_MEDIUM,
  easeBounce,
  overshot,
  tileFallingAnimation,
} from "@/styles/animations.css"
import { alpha, color, hueVariants } from "@/styles/colors"
import { primary } from "@/styles/fontFamily.css"
import { fontSize } from "@/styles/fontSize"
import { createVar, keyframes, style } from "@vanilla-extract/css"
import { type RecipeVariants, recipe } from "@vanilla-extract/recipes"

export const SHAKE_DURATION = 150
export const SHAKE_REPEAT = 3
const DELETED_DURATION = 300
export const MUTATE_DURATION = 500
export const FLOATING_NUMBER_DURATION = 1_500

const shakeKeyframes = keyframes({
  "0%, 100%": { transform: "translate(0, 0) rotate(0deg)" },
  "25%": { transform: "translate(-2px, 0) rotate(-1deg)" },
  "75%": { transform: "translate(2px, 0) rotate(1deg)" },
})

const mutateKeyframes = keyframes({
  "0%": {
    transform: "scale(1, 1)",
  },
  "20%": {
    transform: "scale(1.05, 0.9)",
  },
  "50%": {
    transform: "scale(0.9, 1.05)",
  },
  "100%": {
    transform: "scale(1, 1)",
  },
})

const deletedKeyframes = keyframes({
  "0%": {
    transform: "scale(1, 1)",
    opacity: 1,
  },
  "20%": {
    transform: "scale(1.05, 0.9)",
    opacity: 0.9,
  },
  "50%": {
    transform: "scale(0.9, 1.05)",
    opacity: 0.5,
  },
  "100%": {
    transform: "scale(0.3, 1) translate(0, -10px)",
    opacity: 0,
  },
})

const floatingNumberKeyframes = keyframes({
  "0%": {
    transform: "translate(-50%, -50%)",
    opacity: 1,
  },
  "50%": {
    opacity: 0.8,
  },
  "100%": {
    transform: "translate(-50%, calc(-50% - 100px))",
    opacity: 0,
  },
})

const pulseVar = createVar()
const combinedPulseKeyframes = keyframes({
  "0%": {
    transform: "translate(-50%, -50%) scale(0.8)",
  },
  "50%": {
    transform: "translate(-50%, -50%) scale(2)",
  },
  "100%": {
    transform: "translate(-50%, -50%) scale(0.8)",
  },
})

export const scoreClass = style({
  position: "absolute",
  zIndex: 9999,
  animation: `${floatingNumberKeyframes} ${FLOATING_NUMBER_DURATION}ms ${overshot} forwards`,
  ...fontSize.h3,
  lineHeight: 1,
  fontWeight: "bold",
  userSelect: "none",
  fontFamily: primary,
  transformOrigin: "50% 50%",
  pointerEvents: "none",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 8,
})

export const scoreCoinsClass = style({
  borderRadius: 24,
  padding: "4px 8px",
  background: `linear-gradient(to bottom, ${alpha(color.crack50, 0.9)}, ${alpha(color.crack40, 0.9)})`,
  boxShadow: `
    1px -1px 1px 0 inset ${color.crack60},
    0px 0px 0px 1px ${color.crack30},
    0px 0px 3px -1px ${color.crack10},
    0px 0px 10px -5px ${color.crack10}
  `,
  color: color.crack90,
})

export const pulseClass = recipe({
  base: {
    width: 20,
    height: 20,
    borderRadius: "50%",
    zIndex: 9998,
    position: "absolute",
    transform: "translate(-50%, -50%)",
    animation: `${combinedPulseKeyframes} 2000ms ease-in-out infinite`,
  },
  variants: {
    hue: hueVariants((kolor) => ({
      backgroundColor: alpha(kolor(50), 0.2),
    })),
  },
})

export const scorePointsClass = style({
  borderRadius: 8,
  padding: "4px 8px",
  background: `linear-gradient(to bottom, ${color.bam50}, ${color.bam40})`,
  boxShadow: `
    1px -1px 0px 0 inset ${color.bam50},
    0px 0px 0px 1px ${color.bam30},
    0px 0px 3px -1px ${color.bam10},
    0px 0px 10px -5px ${color.bam10}
  `,
  color: "white",
})

export const tileAnimationDelayVar = createVar()

export const tileClass = recipe({
  base: {
    pointerEvents: "none",
    outline: "none",
    transformOrigin: "50% 50%",
    WebkitTapHighlightColor: "transparent",
    transitionProperty: "top, left",
    transitionDuration: `${DELETED_DURATION}ms`,
    transitionTimingFunction: "ease-in",
  },
  variants: {
    animation: {
      joker: {
        animationName: tileFallingAnimation,
        animationTimingFunction: easeBounce,
        animationDuration: ANIMATION_MEDIUM,
        animationDirection: "reverse",
        animationDelay: tileAnimationDelayVar,
        animationFillMode: "forwards",
        pointerEvents: "none",
      },
      fall: {
        animationName: tileFallingAnimation,
        animationTimingFunction: easeBounce,
        animationDuration: ANIMATION_MEDIUM,
        animationDelay: tileAnimationDelayVar,
        animationFillMode: "backwards",
        pointerEvents: "none",
      },
      shake: {
        animation: `${shakeKeyframes} ${SHAKE_DURATION}ms ease-in-out ${SHAKE_REPEAT}`,
      },
      mutate: {
        animation: `${mutateKeyframes} ${MUTATE_DURATION}ms ease-in-out forwards`,
      },
      deleted: {
        animation: `${deletedKeyframes} ${DELETED_DURATION}ms ease-out forwards`,
        pointerEvents: "none",
      },
    },
  },
})
export type TileVariants = NonNullable<RecipeVariants<typeof tileClass>>

export const tileSvgClass = style({
  overflow: "visible",
})

export const clickableClass = recipe({
  base: {
    pointerEvents: "auto",
    selectors: {
      [`${tileClass.classNames.variants.animation.deleted} &`]: {
        pointerEvents: "none",
      },
    },
  },
  variants: {
    canBeSelected: {
      true: { cursor: "pointer" },
    },
  },
})
