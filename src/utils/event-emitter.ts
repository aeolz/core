import { uniqueId } from "./uniqueId"

export class Listener<
  T extends Record<any, any[]> = {},
  K extends keyof T = any
> {
  readonly id: string = uniqueId("listener")

  constructor(readonly event: K, public cb: (...args: T[K]) => void) {}
}

export type EventObject = { [k: string | number | symbol]: any[] }

export class EventEmitter<T extends Record<any, any[]> = {}> {
  listeners: Listener<T, keyof T>[] = []

  on<K extends keyof T>(event: K, cb: (...args: T[K]) => void) {
    const l = new Listener(event, cb)
    this.listeners.push(l)
    return l
  }

  off(listener: Listener): void
  off(id: string): void
  off(listener: Listener | string) {
    const id = typeof listener === "string" ? listener : listener.id
    this.listeners = this.listeners.filter((lst) => lst.id !== id)
    return this
  }

  emit<K extends keyof T>(event: K, ...args: T[K]) {
    this.listeners.forEach((l) => l.event === event && l.cb(...args))
    return this
  }
}
