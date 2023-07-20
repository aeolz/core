import Aeolz from "../index-types"
import { Global } from "./Global"
import { Tick } from "./Tick"
import { Utils } from "./Utils"

export type LoopOptions = {
  global?: boolean

  /**
   * Default: Infinity
   */
  maxRequests?: number

  /**
   * No throwing errors
   */
  silence?: boolean
} & (
  | { timeInSeconds: number }
  | {
      engine: (completeRequests: () => void) => void
      onDestroy: (this: Loop) => void
    }
)

export class Loop {
  private loopRequests: Global.LoopRequest[] = []
  private interval?: NodeJS.Timer

  constructor(
    readonly name: keyof Aeolz.LoopList,
    readonly options: LoopOptions
  ) {
    if (this.options.global) {
      if (!this.name) {
        Utils.createError("Loop must have a name for registering globally")
      } else {
        Global.registerLoop(this)
      }
    }
    if ("timeInSeconds" in options) {
      this.interval = setInterval(
        this.callback.bind(this),
        options.timeInSeconds * 1000
      )
    } else if ("engine" in options) {
      options.engine(this.callback)
    }
  }

  destroy(): this {
    clearInterval(this.interval)
    this.interval = null
    if ("engine" in this.options) this.options.onDestroy.call(this)
    Global.removeGlobalLoop(this)
    return this
  }

  request(req: Global.LoopRequest): this {
    if (
      this.options.maxRequests &&
      !isNaN(this.options.maxRequests) &&
      this.loopRequests.length >= this.options.maxRequests
    ) {
      Utils.createError("Too many requests")
    } else {
      this.loopRequests.push(req)
    }
    return this
  }

  private callback(): void {
    this.loopRequests.forEach((request) => {
      if (request.limitedTick && request.limitedTick.limited()) return
      request.callback()
    })
  }
}
