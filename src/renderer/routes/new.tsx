import { LinkButton } from "@/components/button"
import { BasicTile } from "@/components/game/basicTile"
import { ArrowLeft, ArrowRight } from "@/components/icon"
import type { CardId, Material } from "@/lib/game"
import { setMutable } from "@/state/persistantMutable"
import { TUTORIAL_SEED, initialRunState, useRunState } from "@/state/runState"
import type { AccentHue } from "@/styles/colors"
import { useNavigate } from "@solidjs/router"
import { nanoid } from "nanoid"
import {
  arrowClass,
  backButtonClass,
  containerClass,
  contentClass,
  floatingClass,
  itemClass,
  itemContentClass,
  itemDescriptionClass,
  itemTitleClass,
  itemsClass,
  titleClass,
} from "./new.css"

export default function New() {
  return (
    <div class={containerClass}>
      <div class={contentClass}>
        <div class={backButtonClass}>
          <LinkButton href="/" hue="dot">
            <ArrowLeft />
          </LinkButton>
        </div>
        <h1 class={titleClass}>Pick a difficulty</h1>
        <div class={itemsClass}>
          <Difficulty
            title="Tutorial"
            hue="black"
            cardId="elementk"
            material="quartz"
            i={1}
            seed={TUTORIAL_SEED}
            description="Learn to play the game, one tile at a time."
          />
          <Difficulty
            title="Gentle"
            hue="bam"
            cardId="elementg"
            material="jade"
            i={1}
            seed={`E-${nanoid()}`}
            description="Tap some tiles. Feel smart. No pressure. Just vibes."
          />
          <Difficulty
            title="Challenging"
            hue="dot"
            cardId="elementb"
            material="topaz"
            i={2}
            seed={`M-${nanoid()}`}
            description="Now we're thinking. It hurts a bit, but in a good way."
          />
          <Difficulty
            title="Hardcore"
            hue="crack"
            cardId="elementr"
            material="garnet"
            seed={`H-${nanoid()}`}
            i={3}
            description="Sure, it's beatable. We just haven't met the person who did. Yet."
          />
        </div>
      </div>
    </div>
  )
}

function Difficulty(props: {
  hue: AccentHue
  cardId: CardId
  material: Material
  seed: string
  title: string
  description: string
  i: number
}) {
  const run = useRunState()
  const navigate = useNavigate()

  function onNewRun(seed: string) {
    setMutable(run, initialRunState(seed))
    navigate("/play")
  }

  return (
    <button
      type="button"
      class={itemClass({ hue: props.hue })}
      onClick={() => onNewRun(props.seed)}
    >
      <div class={floatingClass({ stagger: (props.i % 3) as any })}>
        <BasicTile cardId={props.cardId} material={props.material} />
      </div>
      <div class={itemContentClass}>
        <div class={itemTitleClass}>{props.title}</div>
        <div class={itemDescriptionClass}>{props.description}</div>
      </div>
      <ArrowRight class={arrowClass} />
    </button>
  )
}
