import { alpha, color } from "@/styles/colors"
import { recipe } from "@vanilla-extract/recipes"

export const pointsContainerClass = recipe({
  base: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    paddingInline: 32,
    paddingBlock: 24,
    borderRadius: 32,
    gap: 40,
  },
  variants: {
    win: {
      true: {
        background: `linear-gradient(to bottom, ${alpha(color.bam30, 0.6)}, ${alpha(color.bam30, 0)})`,
      },
      false: {
        background: `linear-gradient(to bottom, ${alpha(color.crack30, 0.6)}, ${alpha(color.crack30, 0)})`,
      },
    },
  },
})
