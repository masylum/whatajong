import { DustParticles } from "./dustParticles"
import { didPlayerWin, getWinningSuit, type Game } from "@repo/game/game"
import { bamboo, character, circle, getDeck, type Card } from "@repo/game/deck"
import {
  bouncingCardClass,
  gameOverClass,
  pointsClass,
  pointsContainerClass,
  screenClass,
  timeClass,
  titleClass,
  totalPointsClass,
  startX,
  endX,
  rotation,
  duration,
  playerTitleClass,
  playerNameClass,
  playersContainerClass,
  winningSuitClass,
  wreathClass,
  winningSuitTileClass,
  winningSuitTilesClass,
} from "./gameOver.css"
import { For, Show, createMemo, type ParentProps } from "solid-js"
import { assignInlineVars } from "@vanilla-extract/dynamic"
import { db, userId } from "@/state/db"
import { Avatar } from "@/components/avatar"
import { isMultiplayer, type Player } from "@repo/game/player"
import { Button, LinkButton } from "@/components/button"
import { BasicTile } from "./basicTile"
import { huesAndShades } from "@/styles/colors"
import { nanoid } from "nanoid"
import { Rotate } from "../icon"

// biome-ignore format:
const WIN_TITLES = [ "Victory!", "Success!", "Champion!", "You Did It!", "Mission Accomplished!", "Winner!", "Glorious!", "Well Played!", "You Conquered!" ]
// biome-ignore format:
const DEFEAT_TITLES = [ "Defeat!", "Game Over", "Try Again", "You Failed", "You Fell Short", "Crushed!", "Wasted!", "Out of Moves" ]
const SUIT_TITLES = { b: "bamboo", c: "character", o: "circle" }

type Props = {
  game: Game
  ws: WebSocket
}

export function GameOver(props: Props) {
  return (
    <div class={gameOverClass}>
      <Show
        when={isMultiplayer(db.players)}
        fallback={<GameOverSinglePlayer game={props.game} />}
      >
        <GameOverMultiPlayer game={props.game} ws={props.ws} />
      </Show>
      <BouncingCards game={props.game} />
      <DustParticles />
    </div>
  )
}

function pick(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function GameOverSinglePlayer(props: { game: Game }) {
  const player = createMemo(() => db.players.byId[userId()]!)
  const win = createMemo(() => props.game.endCondition === "empty-board")

  return (
    <div class={screenClass({ win: win() })}>
      <Show when={win()} fallback={<Title>{pick(DEFEAT_TITLES)}</Title>}>
        <Title>{pick(WIN_TITLES)}</Title>
      </Show>
      <div class={pointsContainerClass({ multiplayer: false })}>
        <Points points={player().points} />
        <Time game={props.game} />
        <TotalPoints game={props.game} points={player().points} />
      </div>
      <LinkButton
        hue={win() ? "bamboo" : "character"}
        kind="dark"
        href={`/play/${nanoid()}`}
      >
        <Rotate />
        Play again
      </LinkButton>
    </div>
  )
}

function GameOverMultiPlayer(props: { game: Game; ws: WebSocket }) {
  const player = createMemo(() => db.players.byId[userId()]!)
  const otherPlayer = createMemo(
    () => db.players.all.find((player) => player.id !== userId())!,
  )
  const win = createMemo(() =>
    didPlayerWin(props.game, db.tiles, db.players, userId()),
  )
  const winningPlayer = createMemo(() => (win() ? player() : otherPlayer()))

  return (
    <div class={screenClass({ win: win() })}>
      <Show when={win()} fallback={<Title>{pick(DEFEAT_TITLES)}</Title>}>
        <Title>{pick(WIN_TITLES)}</Title>
      </Show>
      <div class={playersContainerClass}>
        <PlayerPoints
          player={player()}
          game={props.game}
          winningPlayer={winningPlayer()}
        />
        <PlayerPoints
          player={otherPlayer()}
          game={props.game}
          winningPlayer={winningPlayer()}
        />
      </div>
      <Button
        hue={win() ? "bamboo" : "character"}
        kind="dark"
        onClick={() => {
          props.ws.send(JSON.stringify({ type: "restart-game" }))
        }}
      >
        <Rotate />
        Play again
      </Button>
    </div>
  )
}

function PlayerPoints(props: {
  player: Player
  game: Game
  winningPlayer: Player
}) {
  const win = createMemo(() => props.winningPlayer === props.player)
  const winningSuit = createMemo(() =>
    getWinningSuit(db.tiles, props.player.id),
  )

  return (
    <div
      class={pointsContainerClass({
        multiplayer: true,
        win: win(),
      })}
    >
      <Show when={win()}>
        <img
          class={wreathClass}
          src="/wreath.svg"
          alt="winner"
          width="80"
          height="80"
        />
      </Show>
      <PlayerTitle
        player={props.player}
        win={props.winningPlayer.id === userId()}
      />
      <div>
        <Points points={props.player.points} />
        <Time game={props.game} />
        <TotalPoints game={props.game} points={props.player.points} />
      </div>
      <Show when={winningSuit()}>
        {(suit) => (
          <div class={winningSuitClass({ suit: suit() })}>
            <span>{`${SUIT_TITLES[suit()]} domination`}</span>
            <div class={winningSuitTilesClass}>
              <BasicTile
                card={`${suit()}1`}
                class={winningSuitTileClass({ order: 1 })}
              />
              <BasicTile
                card={`${suit()}2`}
                class={winningSuitTileClass({ order: 2 })}
              />
              <BasicTile
                card={`${suit()}3`}
                class={winningSuitTileClass({ order: 3 })}
              />
            </div>
          </div>
        )}
      </Show>
    </div>
  )
}
function BouncingCard(props: { card: Card }) {
  const cardStartX = createMemo(() => Math.random() * window.innerWidth)
  const cardEndX = createMemo(() => cardStartX() + (Math.random() - 0.5) * 400)
  const cardRotation = createMemo(() => (Math.random() - 0.5) * 720)
  const cardDuration = createMemo(() => 2 + Math.random() * 10)
  const delay = createMemo(() => Math.random() * 10)

  return (
    <BasicTile
      style={{
        ...assignInlineVars({
          [startX]: `${cardStartX()}px`,
          [endX]: `${cardEndX()}px`,
          [rotation]: `${cardRotation()}deg`,
          [duration]: `${cardDuration()}s`,
        }),
        "animation-delay": `${delay()}s`,
      }}
      class={bouncingCardClass}
      card={props.card}
    />
  )
}

function BouncingCards(props: { game: Game }) {
  const win = createMemo(() =>
    didPlayerWin(props.game, db.tiles, db.players, userId()),
  )
  const player = createMemo(() => db.players.byId[userId()]!)
  const otherPlayer = createMemo(
    () => db.players.all.find((player) => player.id !== userId())!,
  )
  const winningPlayer = createMemo(() => (win() ? player() : otherPlayer()))
  const winningSuit = createMemo(() => {
    const player = winningPlayer()
    if (!player) return null

    return getWinningSuit(db.tiles, winningPlayer().id)
  })

  const cards = createMemo<Card[]>(() => {
    switch (winningSuit()) {
      case "b":
        return [...bamboo]
      case "c":
        return [...character]
      case "o":
        return [...circle]
      default:
        return getDeck()
          .slice(0, 10)
          .flatMap(([p, _]) => p)
    }
  })
  return <For each={cards()}>{(card) => <BouncingCard card={card} />}</For>
}

function calculateSeconds(game: Game) {
  return Math.floor((game.endedAt! - game.startedAt!) / 1000)
}

function Title(props: ParentProps) {
  return <h1 class={titleClass}>{props.children}</h1>
}

function Time(props: { game: Game }) {
  return <h3 class={timeClass}>seconds : -{calculateSeconds(props.game)}</h3>
}

function Points(props: { points: number }) {
  return <h3 class={pointsClass}>points : +{props.points}</h3>
}

function TotalPoints(props: { game: Game; points: number }) {
  return (
    <h3 class={totalPointsClass}>
      total : {Math.max(props.points - calculateSeconds(props.game), 0)}
    </h3>
  )
}

function PlayerTitle(props: { player: Player; win: boolean }) {
  const colors = createMemo(() =>
    Object.values(props.win ? huesAndShades.bamboo : huesAndShades.character),
  )
  return (
    <div class={playerTitleClass}>
      <Avatar name={props.player.id} colors={colors()} />
      <h2 class={playerNameClass}>{props.player.id}</h2>
    </div>
  )
}
