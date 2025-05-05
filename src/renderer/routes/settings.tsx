import { play, useMusic } from "@/components/audio"
import { LinkButton } from "@/components/button"
import { ArrowLeft, Check, ChevronUpAndDown } from "@/components/icon"
import { useTranslation } from "@/i18n/useTranslation"
import { throttle } from "@/lib/throttle"
import { useGlobalState } from "@/state/globalState"
import { Select } from "@kobalte/core/select"
import { Slider } from "@kobalte/core/slider"
import {
  backButtonClass,
  containerClass,
  contentClass,
  selectContentClass,
  selectIconClass,
  selectItemClass,
  selectItemIndicatorClass,
  selectListboxClass,
  selectTriggerClass,
  selectValueClass,
  sliderLabelClass,
  sliderRangeClass,
  sliderRootClass,
  sliderThumbClass,
  sliderTrackClass,
  titleClass,
} from "./settings.css"

const LOCALES = {
  es: "Spanish",
  en: "English",
} as const

export function Settings() {
  const globalState = useGlobalState()
  const t = useTranslation()

  useMusic("shop")

  return (
    <div class={containerClass}>
      <div class={contentClass}>
        <div class={backButtonClass}>
          <LinkButton href="/" hue="dot">
            <ArrowLeft />
          </LinkButton>
        </div>
        <h1 class={titleClass}>{t.settings.title()}</h1>
        <VolumeSlider
          label={t.settings.soundVolume()}
          value={Math.round(globalState.soundVolume * 100)}
          onChange={(value) => {
            globalState.soundVolume = value / 100
          }}
        />
        <VolumeSlider
          label={t.settings.musicVolume()}
          value={Math.round(globalState.musicVolume * 100)}
          onChange={(value) => {
            globalState.musicVolume = value / 100
          }}
        />
        <Select
          options={Object.keys(LOCALES)}
          value={globalState.locale}
          selectionBehavior="replace"
          disallowEmptySelection
          onChange={(value) => {
            globalState.locale = value!
          }}
          placeholder="Select Language"
          itemComponent={(props) => (
            <Select.Item item={props.item} class={selectItemClass}>
              <Select.ItemLabel>
                {LOCALES[props.item.rawValue as keyof typeof LOCALES]}
              </Select.ItemLabel>
              <Select.ItemIndicator class={selectItemIndicatorClass}>
                <Check width={20} height={20} />
              </Select.ItemIndicator>
            </Select.Item>
          )}
        >
          <Select.Trigger aria-label="Language" class={selectTriggerClass}>
            <Select.Value class={selectValueClass}>
              {(state: any) =>
                LOCALES[state.selectedOption() as keyof typeof LOCALES]
              }
            </Select.Value>
            <Select.Icon class={selectIconClass}>
              <ChevronUpAndDown width={20} height={20} />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content class={selectContentClass}>
              <Select.Listbox class={selectListboxClass} />
            </Select.Content>
          </Select.Portal>
        </Select>
      </div>
    </div>
  )
}

const playClick = throttle(() => play("click2"), 60)

function VolumeSlider(props: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  function onChange(value: number[]) {
    playClick()
    props.onChange(value[0]!)
  }

  return (
    <Slider value={[props.value]} class={sliderRootClass} onChange={onChange}>
      <div class={sliderLabelClass}>
        <Slider.Label>{props.label}</Slider.Label>
        <Slider.ValueLabel />
      </div>
      <Slider.Track class={sliderTrackClass}>
        <Slider.Fill class={sliderRangeClass} />
        <Slider.Thumb class={sliderThumbClass}>
          <Slider.Input />
        </Slider.Thumb>
      </Slider.Track>
      <Slider.Description />
      <Slider.ErrorMessage />
    </Slider>
  )
}
