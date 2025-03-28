import { createEffect, createMemo } from "solid-js"
import {
  suitName,
  getAvailablePairs,
  getOwnedEmperors,
  getRank,
  isDragon,
  isWind,
  type Dragon,
} from "@/lib/game"
import { useGlobalState } from "@/state/globalState"

import { Boarding } from "boarding.js"
import "boarding.js/styles/main.css"
import "./createGameTour.css"

import { useTileState } from "@/state/tileState"
import { useGameState } from "@/state/gameState"

let boarding: Boarding
resetBoarding()

export default function createGameTour() {
  const globalState = useGlobalState()
  const tiles = useTileState()
  const deletedTiles = createMemo(
    () => tiles.filterBy({ deleted: true }).length,
  )

  createEffect(() => {
    switch (globalState.tourGame.state) {
      case "select-tiles":
        firstTiles(globalState.tourGame.pair)
        return
      case "board":
        if (deletedTiles() < 4) return
        board()
        return
      case "select-dragons":
        if (deletedTiles() < 8) return
        selectDragons(globalState.tourGame.pair)
        return
      case "emperor":
        if (deletedTiles() < 12) return
        emperor()
        return
      case "select-winds":
        if (deletedTiles() < 16) return
        selectWinds(globalState.tourGame.pair)
        return
    }
  })
}

function firstTiles(pair: [string, string] | undefined) {
  const globalState = useGlobalState()
  const tiles = useTileState()
  const game = useGameState()

  if (!pair) {
    const pair = getAvailablePairs(tiles, game).find(
      ([t1]) => !isDragon(t1.card) && !isWind(t1.card),
    )
    if (pair) {
      globalState.tourGame = {
        state: "select-tiles",
        pair: [pair[0].id, pair[1].id],
      }
    }
  } else {
    const t1 = tiles.get(pair[0])!
    const t2 = tiles.get(pair[1])!

    if (t1.deleted && t2.deleted) {
      resetBoarding()
      globalState.tourGame = { state: "board" }
      return
    }

    if (!t1.selected) {
      boarding.highlight({
        element: `[data-id="${t1.id}"]`,
        popover: {
          title: "Click to select this tile",
          description:
            "Only tiles with one or more free sides can be selected.",
        },
      })
    } else {
      boarding.highlight({
        element: `[data-id="${t2.id}"]`,
        popover: {
          title: "Now click this other tile",
          description:
            "Match identical tiles to clear them from the board and earn points.",
        },
      })
    }
  }
}

function board() {
  const globalState = useGlobalState()

  boarding.defineSteps([
    {
      element: `[data-tour="points"]`,
      popover: {
        title: "Points",
        description: "Your current points are displayed here.",
      },
    },
    {
      element: `[data-tour="penalty"]`,
      popover: {
        title: "Time penalty",
        description:
          "The time penalty represents the points you lose as time passes.",
      },
    },
    {
      element: `[data-tour="moves"]`,
      popover: {
        title: "Moves",
        description:
          "This shows your remaining moves. If it reaches 0, the board is unsolvable and you lose the round.",
      },
      onDeselected: () => {
        resetBoarding()
        globalState.tourGame = { state: "select-dragons" }
      },
    },
  ])

  boarding.start()
}

function selectDragons(pair: [string, string] | undefined) {
  const globalState = useGlobalState()
  const tiles = useTileState()
  const game = useGameState()

  if (!pair) {
    const pair = getAvailablePairs(tiles, game).find(([t1]) =>
      isDragon(t1.card),
    )
    if (pair) {
      globalState.tourGame = {
        state: "select-dragons",
        pair: [pair[0].id, pair[1].id],
      }
    }
  } else {
    const t1 = tiles.get(pair[0])!
    const t2 = tiles.get(pair[1])!

    if (t1.deleted && t2.deleted) {
      boarding.highlight({
        element: `[data-tour="dragon-run"]`,
        popover: {
          title: "Dragon Run",
          description: `Match ${suitName(getRank(t1.card as Dragon))} tiles to increase your multiplier. Matching a different suit or a wind ends the run.`,
        },
        onDeselected: () => {
          resetBoarding()
          const emperors = getOwnedEmperors()
          if (emperors.length > 0) {
            globalState.tourGame = { state: "emperor" }
          } else {
            globalState.tourGame = { state: "select-winds" }
          }
        },
      })
      return
    }

    if (!t1.selected) {
      boarding.highlight({
        element: `[data-id="${t1.id}"]`,
        popover: {
          title: "Dragon tile",
          description: `This tile is a ${suitName(getRank(t1.card as Dragon))} Dragon. Click to select it.`,
        },
      })
    } else {
      boarding.highlight({
        element: `[data-id="${t2.id}"]`,
        popover: {
          title: "Dragons and suits",
          description:
            "Dragons are linked to suits. Matching a pair begins a Dragon Run of that suit.<br /><br />Click it to start a Dragon Run.",
        },
      })
    }
  }
}

function emperor() {
  const globalState = useGlobalState()

  boarding.highlight({
    element: `[data-tour="emperors"]`,
    popover: {
      title: "Crew members",
      description:
        "Hover over a card to see its effect. Click a crew member to reveal the shuffle button. If you click on shuffle, your crew member will be discarded.",
      prefferedSide: "left",
    },
    onDeselected: () => {
      resetBoarding()
      globalState.tourGame = { state: "select-winds" }
    },
  })
}

function selectWinds(pair: [string, string] | undefined) {
  const globalState = useGlobalState()
  const tiles = useTileState()
  const game = useGameState()

  if (!pair) {
    const pair = getAvailablePairs(tiles, game).find(([t1]) => isWind(t1.card))
    if (pair) {
      globalState.tourGame = {
        state: "select-winds",
        pair: [pair[0].id, pair[1].id],
      }
    }
  } else {
    const t1 = tiles.get(pair[0])!
    const t2 = tiles.get(pair[1])!

    if (t1.deleted && t2.deleted) {
      resetBoarding()
      globalState.tourGame = { state: "done" }
      return
    }

    if (!t1.selected) {
      boarding.highlight({
        element: `[data-id="${t1.id}"]`,
        popover: {
          title: "Wind tile",
          description:
            "This is a Wind tile. Wind tiles will move the tiles to the cardinal direction indicated (North, East, West, South)",
        },
      })
    } else {
      boarding.highlight({ element: `[data-id="${t2.id}"]` })
    }
  }
}

function resetBoarding() {
  if (boarding?.isActivated) {
    boarding.reset()
  }

  boarding = new Boarding({
    allowClose: false,
    overlayClickNext: true,
    padding: 24,
    opacity: 0.5,
    showButtons: false,
  })
}
