import { For, type JSXElement, type ParentProps } from "solid-js"
import { BasicTile } from "@/components/game/basicTile"
import {
  instructionsClass,
  headerClass,
  sectionClass,
  sectionTitleClass,
  sectionSubtitleClass,
  paragraphClass,
  tileIconClass,
  tileTextClass,
  highlightClass,
  boxClass,
  iconTextClass,
  tileColumnClass,
} from "./instructions.css"
import { getSideSize, TILE_HEIGHT, TILE_WIDTH } from "@/state/constants"
import {
  bams,
  cracks,
  dots,
  dragons,
  flowers,
  seasons,
  winds,
} from "@/lib/game"
import type { AccentHue } from "@/styles/colors"
import { LinkButton } from "@/components/button"
import { ArrowLeft } from "@/components/icon"
import { MiniTile } from "@/components/miniTile"

export function Instructions() {
  return (
    <div class={instructionsClass}>
      <h1 class={headerClass}>Whatajong Game Instructions</h1>

      <LinkButton href="/" hue="bamboo">
        <ArrowLeft />
        Back
      </LinkButton>

      <section class={sectionClass}>
        <h2 class={sectionTitleClass}>Basic Gameplay</h2>
        <p class={paragraphClass}>
          The goal of Whatajong is to remove all tiles from the board by
          matching pairs of identical tiles. The game ends when the board is
          cleared or there are no more free tiles to remove.
        </p>

        <h3 class={sectionSubtitleClass}>How to Remove Tiles</h3>
        <Box hue="tile">
          <IconText
            text={
              <>
                Click on two identical tiles to remove them from the board.
                Tiles must be{" "}
                <span class={highlightClass({ hue: "bamboo" })}>"free"</span> to
                be removed.
              </>
            }
          >
            <BasicTile card="b1" style={{ "z-index": 2 }} />
            <BasicTile card="b1" style={{ "z-index": 1 }} />
          </IconText>
        </Box>

        <p class={paragraphClass}>
          A tile is considered{" "}
          <span class={highlightClass({ hue: "bamboo" })}>free</span> when it
          meets these conditions:
        </p>
        <ul class={paragraphClass}>
          <li>
            <b>Not covered</b>: It has no tile directly on top of it.
          </li>
          <li>
            <b>Exposed</b>: It has at least one side exposed (left or right).
          </li>
        </ul>

        <h3 class={sectionSubtitleClass}>Examples</h3>
        <Box hue="tile">
          <IconText
            text={
              <>
                The <MiniTile card="dc" /> are free since they have at least one
                side exposed and don't have any tiles on top.
                <br />
                However, both <MiniTile card="o1" />
                pieces are covered by the <MiniTile card="dc" />
                so they can't be removed.
              </>
            }
          >
            <BasicTile card="o1" style={{ "z-index": 3 }} />
            <BasicTile
              card="dc"
              style={{
                "margin-left": `${-TILE_WIDTH / 2 + getSideSize(TILE_WIDTH)}px`,
                "margin-top": `${-getSideSize(TILE_HEIGHT)}px`,
                "z-index": 4,
              }}
            />
            <BasicTile
              card="o1"
              style={{
                "margin-left": `${-TILE_WIDTH / 2}px`,
                "z-index": 2,
              }}
            />
            <BasicTile card="dc" style={{ "z-index": 1 }} />
          </IconText>
        </Box>
        <Box hue="tile">
          <IconText
            text={
              <>
                You can remove the
                <MiniTile card="c1" />
                since they are exposed from the sides.
                <br />
                But the
                <MiniTile card="b5" /> tile is not free since it's surrounded by
                other tiles.
              </>
            }
          >
            <BasicTile card="c1" style={{ "z-index": 3 }} />
            <BasicTile card="b5" style={{ "z-index": 2 }} />
            <BasicTile card="c1" style={{ "z-index": 1 }} />
          </IconText>
        </Box>
      </section>

      <section class={sectionClass}>
        <h2 class={sectionTitleClass}>Scoring System</h2>
        <p class={paragraphClass}>
          Once you finish the game, your score will be based on the number of
          tiles you've removed minus the number of seconds remaining. Try to
          make a lot of points, while being as fast as you can!
        </p>

        <h3 class={sectionSubtitleClass}>Colors</h3>
        <Box hue="tile">
          <IconText
            text={
              <>
                <span class={highlightClass({ hue: "bamboo" })}>Bamboo</span>{" "}
                tiles are worth{" "}
                <span class={highlightClass({ hue: "bamboo" })}>1 point</span>{" "}
                each.
              </>
            }
          >
            <For each={bams}>
              {(card, i) => (
                <BasicTile
                  card={card}
                  style={{ "z-index": bams.length - i() }}
                />
              )}
            </For>
          </IconText>
          <IconText
            text={
              <>
                <span class={highlightClass({ hue: "character" })}>
                  Character
                </span>{" "}
                tiles are worth{" "}
                <span class={highlightClass({ hue: "character" })}>
                  2 points
                </span>{" "}
                each.
              </>
            }
          >
            <For each={cracks}>
              {(card, i) => (
                <BasicTile
                  card={card}
                  style={{ "z-index": cracks.length - i() }}
                />
              )}
            </For>
          </IconText>
          <IconText
            text={
              <>
                <span class={highlightClass({ hue: "circle" })}>Circle</span>{" "}
                tiles are worth{" "}
                <span class={highlightClass({ hue: "circle" })}>3 points</span>{" "}
                each.
              </>
            }
          >
            <For each={dots}>
              {(card, i) => (
                <BasicTile
                  card={card}
                  style={{ "z-index": dots.length - i() }}
                />
              )}
            </For>
          </IconText>
        </Box>

        <h3 class={sectionSubtitleClass}>Special Tiles</h3>
        <Box hue="tile">
          <IconText
            text={
              <>
                <span class={highlightClass({ hue: "bamboo" })}>Dragon</span>{" "}
                tiles are worth{" "}
                <span class={highlightClass({ hue: "bamboo" })}>4 points</span>{" "}
                each.
              </>
            }
          >
            <For each={dragons}>
              {(card, i) => (
                <BasicTile
                  card={card}
                  style={{ "z-index": dragons.length - i() }}
                />
              )}
            </For>
          </IconText>
          <IconText
            text={
              <>
                <span class={highlightClass({ hue: "flower" })}>Flower</span>{" "}
                tiles are worth{" "}
                <span class={highlightClass({ hue: "flower" })}>8 points</span>{" "}
                each.
              </>
            }
          >
            <For each={flowers}>
              {(card, i) => (
                <BasicTile
                  card={card}
                  style={{ "z-index": flowers.length - i() }}
                />
              )}
            </For>
          </IconText>
          <IconText
            text={
              <>
                <span class={highlightClass({ hue: "season" })}>
                  Profession
                </span>{" "}
                tiles are worth{" "}
                <span class={highlightClass({ hue: "season" })}>8 points</span>{" "}
                each.
              </>
            }
          >
            <For each={seasons}>
              {(card, i) => (
                <BasicTile
                  card={card}
                  style={{ "z-index": seasons.length - i() }}
                />
              )}
            </For>
          </IconText>
          <IconText
            text={
              <>
                <span class={highlightClass({ hue: "circle" })}>Wind</span>{" "}
                tiles are worth{" "}
                <span class={highlightClass({ hue: "circle" })}>16 points</span>{" "}
                each.
              </>
            }
          >
            <For each={winds}>
              {(card, i) => (
                <BasicTile
                  card={card}
                  style={{ "z-index": winds.length - i() }}
                />
              )}
            </For>
          </IconText>
        </Box>
      </section>

      <section class={sectionClass}>
        <h2 class={sectionTitleClass}>Dragon runs</h2>
        <p class={paragraphClass}>
          When you remove a pair of dragons, you start a{" "}
          <span class={highlightClass({ hue: "bamboo" })}>dragon run</span>,
          which allows you to earn extra points by removing tiles of the same
          color.
        </p>

        <Box hue="tile">
          <IconText
            text={
              <>
                The{" "}
                <span class={highlightClass({ hue: "bamboo" })}>
                  Green Dragon
                </span>{" "}
                leads bamboo tiles:
                <For each={bams}>{(card) => <MiniTile card={card} />}</For>
              </>
            }
          >
            <BasicTile card="df" />
          </IconText>
          <IconText
            text={
              <>
                The{" "}
                <span class={highlightClass({ hue: "character" })}>
                  Red Dragon
                </span>{" "}
                leads character tiles:
                <For each={cracks}>{(card) => <MiniTile card={card} />}</For>
              </>
            }
          >
            <BasicTile card="dc" />
          </IconText>
          <IconText
            text={
              <>
                The{" "}
                <span class={highlightClass({ hue: "circle" })}>
                  Blue Dragon
                </span>{" "}
                leads circle tiles:
                <For each={dots}>{(card) => <MiniTile card={card} />}</For>
              </>
            }
          >
            <BasicTile card="dp" />
          </IconText>
        </Box>

        <p class={paragraphClass}>
          After removing a pair of dragons (
          <For each={dragons}>{(card) => <MiniTile card={card} />}</For>), each
          removed pair of tiles from the matching color grants you an bonus. The
          more consecutive tiles you match, the bigger the bonus.
        </p>

        <p class={paragraphClass}>
          <span class={highlightClass({ hue: "flower" })}>Flower</span> (
          <For each={flowers}>{(card) => <MiniTile card={card} />}</For>) and{" "}
          <span class={highlightClass({ hue: "season" })}>Profession</span> (
          <For each={seasons}>{(card) => <MiniTile card={card} />}</For>) tiles
          act as jokers, so they can be used within any dragon run.
        </p>

        <p class={paragraphClass}>
          The dragon run ends when you select a tile that is not from the
          matching color nor is a a flower or profession tile.
        </p>
      </section>

      <section class={sectionClass}>
        <h2 class={sectionTitleClass}>Jokers</h2>
        <p class={paragraphClass}>
          <span class={highlightClass({ hue: "flower" })}>Flower</span> and{" "}
          <span class={highlightClass({ hue: "season" })}>Profession</span>{" "}
          tiles (the Jokers) are unique and do not have a pair. However, any
          tile of the same color can act as their pair.
        </p>

        <p class={paragraphClass}>
          When you remove a pair of{" "}
          <span class={highlightClass({ hue: "flower" })}>Flower</span> or{" "}
          <span class={highlightClass({ hue: "season" })}>Profession</span>{" "}
          tiles, in your next move you can remove tiles that are exposed from
          the top or bottom, even though they may be locked on the sides. This
          allows you to remove pieces that would otherwise be difficult to
          remove.
        </p>
        <Box hue="tile">
          <IconText
            text={
              <>
                In this position, you can remove <MiniTile card="wn" />,
                <MiniTile card="c1" />, <MiniTile card="f1" />,{" "}
                <MiniTile card="f2" />, since both tiles are exposed on at least
                one side. But you cannot remove <MiniTile card="b1" /> nor
                <MiniTile card="o1" /> since the tiles in the center are not
                exposed on either side.
              </>
            }
          >
            <div class={tileColumnClass}>
              <div class={tileIconClass}>
                <BasicTile
                  card="wn"
                  highlighted="tile"
                  style={{ "z-index": 3 }}
                />
                <BasicTile card="b1" style={{ "z-index": 2 }} />
                <BasicTile
                  card="wn"
                  highlighted="tile"
                  style={{ "z-index": 1 }}
                />
              </div>
              <div class={tileIconClass}>
                <BasicTile
                  card="c1"
                  highlighted="tile"
                  style={{ "z-index": 6 }}
                />
                <BasicTile card="o1" style={{ "z-index": 5 }} />
                <BasicTile
                  card="o1"
                  highlighted="tile"
                  style={{ "z-index": 4 }}
                />
              </div>
              <div class={tileIconClass}>
                <BasicTile
                  card="c1"
                  highlighted="tile"
                  style={{ "z-index": 9 }}
                />
                <BasicTile card="b1" style={{ "z-index": 8 }} />
                <BasicTile
                  card="f2"
                  highlighted="tile"
                  style={{ "z-index": 7 }}
                />
              </div>
              <div class={tileIconClass}>
                <BasicTile
                  card="f1"
                  highlighted="tile"
                  style={{ "z-index": 10 }}
                />
              </div>
            </div>
          </IconText>
          <IconText
            text={
              <>
                If you remove <MiniTile card="f1" /> and <MiniTile card="f2" />{" "}
                you will start a{" "}
                <span class={highlightClass({ hue: "flower" })}>Joker Run</span>
                .
                <br />
                Now you can remove <MiniTile card="b1" /> since it's exposed
                from the top.
                <br />
                You can't still remove the <MiniTile card="o1" /> in the center
                since it does not have any side exposed.
              </>
            }
          >
            <div class={tileColumnClass}>
              <div class={tileIconClass}>
                <BasicTile
                  card="wn"
                  highlighted="flower"
                  style={{ "z-index": 3 }}
                />
                <BasicTile
                  card="b1"
                  highlighted="flower"
                  style={{ "z-index": 2 }}
                />
                <BasicTile
                  card="wn"
                  highlighted="flower"
                  style={{ "z-index": 1 }}
                />
              </div>
              <div class={tileIconClass}>
                <BasicTile
                  card="c1"
                  highlighted="flower"
                  style={{ "z-index": 3 }}
                />
                <BasicTile card="o1" style={{ "z-index": 2 }} />
                <BasicTile
                  card="o1"
                  highlighted="flower"
                  style={{ "z-index": 1 }}
                />
              </div>
              <div class={tileIconClass}>
                <BasicTile
                  card="c1"
                  highlighted="flower"
                  style={{ "z-index": 3 }}
                />
                <BasicTile
                  card="b1"
                  highlighted="flower"
                  style={{ "z-index": 2 }}
                />
              </div>
            </div>
          </IconText>
        </Box>
      </section>

      <section class={sectionClass}>
        <h2 class={sectionTitleClass}>Wind Tiles</h2>
        <Box hue="tile">
          <IconText
            text={
              <>
                When removing a pair of wind tiles, pieces will be displaced
                along the corresponding direction (East, West, North, and
                South). This may cover or uncover tiles, so think carefully
                about your next move.
              </>
            }
          >
            <BasicTile card="we" style={{ "z-index": 4 }} />
            <BasicTile card="ww" style={{ "z-index": 3 }} />
            <BasicTile card="wn" style={{ "z-index": 2 }} />
            <BasicTile card="ws" style={{ "z-index": 1 }} />
          </IconText>
        </Box>

        <p class={paragraphClass}>
          If you are playing against another player, removing a pair of wind
          tiles will end your opponent's current dragon run (if they have one).
        </p>
      </section>

      <LinkButton href="/" hue="bamboo">
        <ArrowLeft />
        Back
      </LinkButton>
    </div>
  )
}

function Box(props: { hue: AccentHue } & ParentProps) {
  return <div class={boxClass({ hue: props.hue })}>{props.children}</div>
}

function IconText(props: { text: JSXElement } & ParentProps) {
  return (
    <div class={iconTextClass}>
      <div class={tileIconClass}>{props.children}</div>
      <div class={tileTextClass}>{props.text}</div>
    </div>
  )
}
