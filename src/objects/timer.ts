import { PureSignal } from "./PureSignal"

export abstract class Timer {
  protected _timer: any
  readonly isRunning = PureSignal(false)

  abstract callback(cb: Function): void
  abstract run(): Timer
  abstract stop(): Timer
}
