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
}

export class DailyScheduler {
  private checkFunction: Array<() => Promise<void> | void> = []
  private getLastCheckTime: () => Promise<number> | number
  private setLastCheckTime: (lastCheck: number) => Promise<void>
  private checkEverySeconds: number
  private loop: Loop

  constructor(options: DailySchedulerOptions) {
    this.getLastCheckTime = options.getLastCheckTime
    this.setLastCheckTime = options.setLastCheckTime
    this.checkEverySeconds = options.checkEverySeconds
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

  async schedule() {
    const lastCheckTime = await this.getLastCheckTime()

    const currentTime = Date.now()
    const oneDayInMilliseconds = 24 * 60 * 60 * 1000 // 24 hours
    if (currentTime - lastCheckTime >= oneDayInMilliseconds) {
      this.checkFunction.forEach((fn) => fn())
      this.setLastCheckTime(currentTime)
      // Update the last check time
      // You need to implement the logic to update the last check time using your storage mechanism.
    }
  }
}
