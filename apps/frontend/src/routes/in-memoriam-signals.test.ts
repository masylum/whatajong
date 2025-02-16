import { beforeEach, describe, expect, it } from "vitest"
import { Database } from "./in-memoriam-signals"
import { createMemo } from "solid-js"
import { createRoot } from "solid-js"

type Element = {
  id: string
  a: number
  b: number
  name: string
}
const indexes = ["a", "b"] as const
type Indexes = (typeof indexes)[number]

describe("database", () => {
  let db: Database<Element, Indexes>

  beforeEach(() => {
    db = new Database<Element, Indexes>({ indexes })
    db.set("1", { id: "1", a: 1, b: 10, name: "alice" })
    db.set("2", { id: "2", a: 1, b: 10, name: "bob" })
    db.set("3", { id: "3", a: 2, b: 20, name: "charlie" })
    db.set("4", { id: "4", a: 2, b: 30, name: "dan" })
    db.set("5", { id: "5", a: 3, b: 40, name: "eve" })
  })

  it("has the correct size", () => {
    expect(db.size).toBe(5)
  })

  it("gets an element by id", () => {
    expect(db.get("1")!.name).toBe("alice")
  })

  it("updates an element", () => {
    db.set("1", { id: "1", a: 1, b: 10, name: "Alice" })
    expect(db.get("1")!.name).toBe("Alice")
  })

  it("can filter by index", () => {
    expect(db.filterBy({ a: 1 }).length).toBe(2)
    expect(db.filterBy({ a: 4 }).length).toBe(0)
    expect(db.filterBy({ b: 10 }).length).toBe(2)
    expect(db.filterBy({ b: 40 }).length).toBe(1)
    expect(db.filterBy({ a: 1, b: 10 }).length).toBe(2)
    expect(db.filterBy({ a: 2, b: 20 }).length).toBe(1)
    expect(db.findBy({ a: 1, b: 10 })).not.toBeNull()
    expect(db.findBy({ a: 4 })).toBeNull()
  })

  it("can delete an element", () => {
    db.del("2")
    expect(db.size).toBe(4)
    expect(db.get("2")).toBeNull()
    expect(db.filterBy({ a: 1 }).length).toBe(1)
  })

  it("updates first element while tracking the updates", () => {
    const item = db.get("1")!

    createRoot((dispose) => {
      const name = createMemo(() => item.name)
      const a = createMemo(() => item.a)

      expect(name()).toBe("alice")
      expect(a()).toBe(1)

      db.set("1", { id: "1", a: 2, b: 20, name: "Alice" })

      expect(name()).toBe("Alice")
      expect(a()).toBe(2)

      expect(db.size).toBe(5)
      expect(db.filterBy({ a: 2 }).length).toBe(3)

      dispose()
    })
  })
})
