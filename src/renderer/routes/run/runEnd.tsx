import { LinkButton } from "@/components/button"
import { ArrowRight } from "@/components/icon"
import { useTranslation } from "@/i18n/useTranslation"
import { useLayoutSize } from "@/state/constants"
import { useRunState } from "@/state/runState"
import {
  containerClass,
  contentClass,
  detailListClass,
  detailsClass,
  itemKeyClass,
  itemValueClass,
  subtitleClass,
  titleClass,
  titleContainerClass,
} from "./runEnd.css"
import { Deck } from "./runShop"

export function RunEnd() {
  const run = useRunState()
  const size = useLayoutSize()
  const t = useTranslation()

  return (
    <div class={containerClass}>
      <div class={contentClass}>
        <div class={titleContainerClass}>
          <h1 class={titleClass}>{t.end.title()}</h1>
          <h2 class={subtitleClass}>{t.end.subtitle()}</h2>
        </div>
        <div class={detailsClass}>
          <dl class={detailListClass({ hue: "dot" })}>
            <dt class={itemKeyClass}>{t.end.totalPoints()}</dt>
            <dd class={itemValueClass}>
              {new Intl.NumberFormat().format(run.totalPoints)}
            </dd>
          </dl>
          <dl class={detailListClass({ hue: "crack" })}>
            <dt class={itemKeyClass}>{t.end.attempts()}</dt>
            <dd class={itemValueClass}>{run.attempts + 1}</dd>
          </dl>
          <dl class={detailListClass({ hue: "bam" })}>
            <dt class={itemKeyClass}>{t.end.difficulty()}</dt>
            <dd class={itemValueClass}>{run.difficulty}</dd>
          </dl>
        </div>
        <Deck size={size().width / 600} />
        <LinkButton hue="bam" type="button" href="/new">
          {t.end.newAdventure()}
          <ArrowRight />
        </LinkButton>
      </div>
    </div>
  )
}
