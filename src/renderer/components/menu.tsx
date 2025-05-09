import { Dialog } from "@/components/dialog"
import { useTranslation } from "@/i18n/useTranslation"
import { useRunState } from "@/state/runState"
import { createEffect } from "solid-js"
import { createSignal } from "solid-js"
import { Button, LinkButton } from "./button"
import {
  dialogContentClass,
  dialogItemClass,
  dialogItemsClass,
  dialogTitleClass,
} from "./dialog.css"
import { Home } from "./icon"
import { ArrowRight } from "./icon"
import { Gear, Help } from "./icon"

export function Menu() {
  const run = useRunState()
  const [open, setOpen] = createSignal(false)
  const t = useTranslation()

  // close the menu when the run changes
  createEffect((prevRunId: string) => {
    if (prevRunId !== run.runId) {
      setOpen(false)
    }

    return run.runId
  }, run.runId)

  return (
    <Dialog
      open={open()}
      onOpenChange={setOpen}
      trigger={
        <Button
          type="button"
          hue="dot"
          title="settings"
          onPointerDown={() => setOpen(true)}
        >
          <Gear />
        </Button>
      }
      content={
        <div class={dialogContentClass}>
          <h1 class={dialogTitleClass}>{t.settings.title()}</h1>
          <div class={dialogItemsClass}>
            <div class={dialogItemClass}>
              <LinkButton href="/" hue="bam" suave>
                <Home />
                {t.settings.goBack()}
              </LinkButton>
            </div>
            <div class={dialogItemClass}>
              <LinkButton href={"/new"} hue="dot" suave>
                <ArrowRight />
                {t.settings.newRun()}
              </LinkButton>
            </div>
            <div class={dialogItemClass}>
              <LinkButton hue="bone" suave href="/help">
                <Help />
                {t.common.help()}
              </LinkButton>
            </div>
          </div>
        </div>
      }
    />
  )
}
