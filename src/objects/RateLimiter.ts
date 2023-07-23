export class RateLimiter {
  private calls: number[]
  private readonly timeWindow: number
  private readonly maxCalls: number

  constructor(maxCalls: number, timeWindow: number) {
    this.calls = []
    this.maxCalls = maxCalls
    this.timeWindow = timeWindow
  }

  public call(): boolean {
    const now = Date.now()
    this.calls = this.calls.filter(
      (timestamp) => now - timestamp <= this.timeWindow
    )

    if (this.calls.length < this.maxCalls) {
      this.calls.push(now)
      return true
    }
    return false
  }
}
