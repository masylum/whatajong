import { useRunState } from "@/state/runState"
import {
  batch,
  createMemo,
  createSelector,
  createSignal,
  For,
  Match,
  Show,
  Switch,
} from "solid-js"
import {
  continueClass,
  deckClass,
  deckItemClass,
  deckItemCountClass,
  deckRowClass,
  deckRowsClass,
  explanationClass,
  itemClass,
  itemCostClass,
  itemsClass,
  itemsContainerClass,
  itemTitleClass,
  rerollButtonClass,
  rerollClass,
  shopClass,
  subtitleClass,
  titleClass,
} from "./runShop.css"
import { generateItems, type Item, type MaterialItem } from "@/state/itemState"
import { BasicTile } from "@/components/game/basicTile"
import { useDeckState } from "@/state/deckState"
import { entries, sumBy } from "remeda"
import {
  isBamboo,
  isCircle,
  isCharacter,
  type Card,
  type DeckTile,
} from "@repo/game/deck"
import type { Material } from "@repo/game/tile"
import { Button } from "@/components/button"
import { ArrowRight, Dices } from "@/components/icon"

const REROLL_COST = 1

export default function RunShop() {
  const run = useRunState()
  const deck = useDeckState()
  const items = createMemo(() => generateItems(run.get()))
  const [hoveredDeckTile, setHoveredDeckTile] = createSignal<DeckTile | null>(
    null,
  )
  const currentItem = createMemo(() => run.get().currentItem)
  const isHover = createSelector(hoveredDeckTile)
  const hoverMaterial = createMemo(() => {
    const item = currentItem()
    if (!item || item.type !== "material") return

    return item.id
  })

  const deckByRows = createMemo(() => {
    function getTilesByType<T>(filterFn: (card: Card) => T) {
      return deck.all.filter((deckTile) => filterFn(deckTile.card))
    }

    return {
      bamboos: getTilesByType(isBamboo),
      circles: getTilesByType(isCircle),
      characters: getTilesByType(isCharacter),
      honors: getTilesByType(
        (card) => !isBamboo(card) && !isCircle(card) && !isCharacter(card),
      ),
    }
  })

  function selectItem(item: Item) {
    run.set({
      currentItem: item,
    })
  }

  function buyMaterial(item: MaterialItem, deckTile: DeckTile) {
    const cost = item.cost
    const money = run.get().money
    if (cost > money) throw Error("You don't have enough money")

    batch(() => {
      run.set({
        money: money - cost,
        currentItem: null,
      })
      deck.set(deckTile.id, { ...deckTile, material: item.id })
    })
  }

  function reroll() {
    const cost = REROLL_COST
    const money = run.get().money
    if (cost > money) throw Error("You don't have enough money")

    run.set({
      money: money - cost,
      reroll: run.get().reroll + 1,
    })
  }

  function continueRun() {
    run.set({
      round: run.get().round + 1,
      roundStage: "select",
    })
  }

  function onHoverDeckTile(deckTile: DeckTile) {
    setHoveredDeckTile(deckTile)
  }

  function onLeaveDeckTile() {
    setHoveredDeckTile(null)
  }

  function onClickDeckTile(deckTile: DeckTile) {
    const item = currentItem()
    if (!item) return

    switch (item.type) {
      case "material":
        buyMaterial(item, deckTile)
        break
    }
  }

  return (
    <div class={shopClass}>
      <div>
        <h1 class={titleClass}>The parlor</h1>
        <p class={explanationClass}>
          Invest your money on items to make your next games easier.
        </p>

        <div>
          <div>
            <h3 class={subtitleClass}>
              <span>Money:</span> ${run.get().money}
            </h3>
          </div>
        </div>

        <div class={itemsContainerClass}>
          <Show
            when={currentItem()}
            fallback={
              <>
                <div class={itemsClass}>
                  <For each={items()}>
                    {(item) => (
                      <Switch>
                        <Match when={item.type === "material" && item}>
                          {(materialItem) => (
                            <ItemMaterial
                              item={materialItem()}
                              onClick={selectItem}
                            />
                          )}
                        </Match>
                      </Switch>
                    )}
                  </For>
                </div>
                <div class={itemsClass}>
                  <div class={rerollClass}>
                    <h3 class={itemTitleClass}>re-roll</h3>
                    <button
                      class={rerollButtonClass}
                      type="button"
                      onClick={reroll}
                    >
                      <Dices />
                    </button>
                    <span class={itemCostClass}>${REROLL_COST}</span>
                  </div>
                </div>
              </>
            }
          >
            {(item) => (
              <Switch>
                <Match when={item().type === "material"}>
                  <MaterialSelected item={item() as MaterialItem} />
                </Match>
              </Switch>
            )}
          </Show>
        </div>
        <div class={deckClass}>
          <h1 class={subtitleClass}>
            Your deck ({sumBy(deck.all, (d) => d.count)} tiles)
          </h1>
          <div class={deckRowsClass}>
            <For each={entries(deckByRows())}>
              {([_, deckTiles]) => (
                <div class={deckRowClass}>
                  <For each={deckTiles}>
                    {(deckTile) => (
                      <div
                        class={deckItemClass({ hoverable: !!currentItem() })}
                        onMouseEnter={() => onHoverDeckTile(deckTile)}
                        onMouseLeave={() => onLeaveDeckTile()}
                        onClick={() => onClickDeckTile(deckTile)}
                      >
                        <BasicTile
                          card={deckTile.card}
                          material={
                            currentItem() && isHover(deckTile)
                              ? hoverMaterial()
                              : deckTile.material
                          }
                        />
                        <span class={deckItemCountClass}>{deckTile.count}</span>
                      </div>
                    )}
                  </For>
                </div>
              )}
            </For>
          </div>
        </div>

        <div class={continueClass}>
          <Button hue="bamboo" onClick={continueRun}>
            Continue to Next Game
            <ArrowRight />
          </Button>
        </div>
      </div>
    </div>
  )
}

function MaterialSelected(props: { item: MaterialItem }) {
  return (
    <div>
      <p>Select a tile from your deck to convert to:</p>
      <div class={itemClass({ material: props.item.id })}>
        <h3>{props.item.id}</h3>
        <BasicTile material={props.item.id} />
        <span>${props.item.cost}</span>
      </div>
    </div>
  )
}

function ItemMaterial(props: {
  item: MaterialItem
  onClick: (item: MaterialItem) => void
}) {
  return (
    <button
      class={itemClass({ material: props.item.id as Material })}
      type="button"
      onClick={() => props.onClick(props.item)}
    >
      <h3 class={itemTitleClass}>{props.item.id}</h3>
      <BasicTile material={props.item.id} />
      <span class={itemCostClass}>${props.item.cost}</span>
    </button>
  )
}
