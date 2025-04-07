import { style } from "@vanilla-extract/css"

export const mountainsClass = style({
  position: "fixed",
  bottom: 0,
  left: 0,
  width: "100dvw",
  height: "100dvh",
  background: "url(/mountains.webp)",
  backgroundPosition: "bottom",
  backgroundRepeat: "no-repeat",
  maskImage:
    "radial-gradient(ellipse 700px 1000px at bottom, black 20%, transparent 90%)",
  zIndex: 2,
  mixBlendMode: "color-burn",
  pointerEvents: "none",
})
