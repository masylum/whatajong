import {
  ANIMATION_MEDIUM,
  ANIMATION_SLOW,
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
export const DELETED_DURATION = 300
export const MUTATE_DURATION = 500
export const FLOATING_NUMBER_DURATION = 1_500
export const MOVE_DURATION = 300

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

const jumpingInKeyframes = keyframes({
  "0%": {
    transform: "scale(1, 1)",
    opacity: 1,
  },
  "100%": {
    transform: "scale(1.3, 1.3)",
    opacity: 0.6,
  },
})

const jumpingOutKeyframes = keyframes({
  "0%": {
    transform: "scale(1.3, 1.3)",
    opacity: 0.6,
  },
  "100%": {
    transform: "scale(1, 1)",
    opacity: 1,
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
const pulseKeyframes = keyframes({
  "0%": {
    background: `rgba(from ${pulseVar} r g b / 0.05)`,
  },
  "50%": {
    background: `rgba(from ${pulseVar} r g b / 0.2)`,
    opacity: 1,
  },
  "100%": {
    background: `rgba(from ${pulseVar} r g b / 0.05)`,
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
    borderRadius: 4,
    position: "absolute",
    animation: `${pulseKeyframes} 3000ms ease-in-out infinite`,
    mixBlendMode: "multiply",
    pointerEvents: "none",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  variants: {
    hue: hueVariants((kolor) => ({
      vars: {
        [pulseVar]: kolor(50),
      },
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
    // TODO: optimize to use transform
    transitionProperty: "top, left",
    transitionDuration: `${MOVE_DURATION}ms`,
    transitionTimingFunction: "ease-in",
  },
  variants: {
    animation: {
      joker: {
        animationName: tileFallingAnimation,
        animationTimingFunction: easeBounce,
        animationDuration: ANIMATION_SLOW,
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
      jumpingIn: {
        animation: `${jumpingInKeyframes} ${MOVE_DURATION}ms ease-in-out forwards`,
        pointerEvents: "none",
      },
      jumpingOut: {
        animation: `${jumpingOutKeyframes} ${MOVE_DURATION}ms ease-in-out forwards`,
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
