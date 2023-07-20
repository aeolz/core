import { Gettable } from "./Gettable"

export type TickOptions = {
  reverse?: boolean
  immediately?: boolean
}

export class Tick {
  last: number

  constructor(seconds: Gettable<number>)
  constructor(seconds: Gettable<number>, options: TickOptions)
  constructor(
    readonly seconds: Gettable<number>,
    readonly options: TickOptions = {}
  ) {
    if (!this.options.immediately) this.next()
  }

  next() {
    this.last = Date.now() + Gettable(this.seconds) * 1000
  }

  limited(): boolean {
    return this.options.reverse
      ? this.last < Date.now()
      : this.last > Date.now()
  }
}
