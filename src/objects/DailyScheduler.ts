import luxon = require("luxon")
import { Loop } from "./Loop"

export type DailySchedulerOptions = {
  checkEverySeconds: number
  /**
   * Last checked time
   */
  getLastCheckTime: () => Promise<number> | number
  /**
   * New Check time
   */
  setLastCheckTime: (lastCheck: number) => Promise<void>
  /**
   * 24 hour format
   */
  targetHour: number
  /**
   * Whether or not to cache first time getLastCheckTime, to avoid external db calls
   */
  cacheGetter?: boolean
  timeZone: string
}

export class DailyScheduler {
  private checkFunction: Array<() => Promise<void> | void> = []
  private getLastCheckTime: () => Promise<number> | number
  private setLastCheckTime: (lastCheck: number) => Promise<void>
  private checkEverySeconds: number
  private loop: Loop
  private targetHour: number
  private _lastCheck: number
  private cacheGetter: boolean
  private timeZone: string

  constructor(options: DailySchedulerOptions) {
    this.getLastCheckTime = options.getLastCheckTime
    this.setLastCheckTime = options.setLastCheckTime
    this.checkEverySeconds = options.checkEverySeconds
    this.targetHour = options.targetHour
    this.cacheGetter = !!options.cacheGetter
    this.timeZone = options.timeZone
  }

  register(fn: () => Promise<void> | void) {
    this.checkFunction.push(fn)
    return this
  }

  start() {
    if (this.loop) return this
    this.loop = new Loop("daily-scheduler-" + Math.random(), {
      timeInSeconds: this.checkEverySeconds,
    }).request({ callback: () => this.schedule() })
    return this
  }

  private async cachedLastCheckTime(): Promise<number> {
    if (this.cacheGetter) {
      if (this._lastCheck) {
        return this._lastCheck
      } else {
        this._lastCheck = await this.getLastCheckTime()
        return this._lastCheck
      }
    } else {
      return await this.getLastCheckTime()
    }
  }

  async schedule() {
    const lastCheckTime = await this.cachedLastCheckTime()
    const currentTime = luxon.DateTime.now()

    const currentZoneTime = currentTime.setZone(this.timeZone)

    const nextUpdateTime = currentZoneTime.set({
      hour: this.targetHour,
      minute: 0,
      second: 0,
      millisecond: 0,
    })

    if (
      currentZoneTime.hour >= nextUpdateTime.hour &&
      currentTime.toMillis() - lastCheckTime >= 24 * 60 * 60 * 1000
    ) {
      await this.setLastCheckTime(currentTime.toMillis())
      this._lastCheck = currentTime.toMillis()
      this.checkFunction.forEach((fn) => fn())
    }
  }

  /**
   *
   * @returns milliseconds
   */
  getNextUpdateTime(): number {
    const currentTime = luxon.DateTime.now()

    const currentZoneTime = currentTime.setZone(this.timeZone)

    const nextUpdateTime = currentZoneTime
      .plus({ days: 1 })
      .set({ hour: this.targetHour, minute: 0, second: 0, millisecond: 0 })

    return nextUpdateTime.toMillis()
  }
}
