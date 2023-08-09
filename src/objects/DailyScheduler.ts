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

  constructor(options: DailySchedulerOptions) {
    this.getLastCheckTime = options.getLastCheckTime
    this.setLastCheckTime = options.setLastCheckTime
    this.checkEverySeconds = options.checkEverySeconds
    this.targetHour = options.targetHour
    this.cacheGetter = !!options.cacheGetter
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

    const currentTime = Date.now()
    const oneDayInMilliseconds = 24 * 60 * 60 * 1000 // 24 hours

    const today = new Date(currentTime)
    today.setHours(this.targetHour, 0, 0, 0)
    if (
      currentTime - lastCheckTime >= oneDayInMilliseconds &&
      currentTime >= today.getTime()
    ) {
      this.checkFunction.forEach((fn) => fn())
      this._lastCheck = today.getTime()
      this.setLastCheckTime(today.getTime())
      // Update the last check time
      // You need to implement the logic to update the last check time using your storage mechanism.
    }
  }
}
