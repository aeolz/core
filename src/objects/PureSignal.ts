import { EventEmitter, Listener } from "../utils/event-emitter"
import { SignalCreator, SignalOptions } from "./Signal"

export type SignalDefaultEvents<T> = {
  change: [T]
}

/**
 * Please use only primitive types, because it will be unable to reset to initial value
 */
export class PureSignalCreator<T extends any> {
  value: T

  readonly emitter = new EventEmitter<SignalDefaultEvents<T>>()

  constructor(readonly initialValue: T) {
    this.value = initialValue
  }

  /**
   * Reset current value to initial value
   *
   * @returns {this}
   */
  reset(): this {
    this.value = this.initialValue
    return this
  }

  /**
   * Set a new value
   *
   * @param {T} val
   * @returns {this}
   */
  setValue(val: T): this {
    this.value = val
    this.emitter.emit("change", val)
    return this
  }

  static createPureSignal<T>(initialValue: T, options: SignalOptions = {}) {
    const signal = new PureSignalCreator(initialValue)
    const fn = <PureSignal<T>>function (this: PureSignal<T>, val?: T) {
      // Do your thing here. Use f instead of this!

      if (val === undefined) {
        let value = signal.value
        return value
      }
      signal.setValue(val)
      return fn
    }
    // Object.assign(fn, signal)
    // Object.setPrototypeOf(fn, PureSignalCreator.prototype)

    fn.on = <K extends keyof SignalDefaultEvents<T>>(
      event: K,
      cb: (...args: SignalDefaultEvents<T>[K]) => void
    ): Listener<SignalDefaultEvents<T>, K> => {
      return signal.emitter.on(event, cb)
    }
    fn.off = (
      listener: Listener<SignalDefaultEvents<T>, keyof SignalDefaultEvents<T>>
    ): PureSignal<T> => {
      signal.emitter.off(listener)
      return fn
    }
    fn.clearListeners = () => {
      signal.emitter.listeners = []
      return fn
    }

    return fn
  }
}

export function PureSignal<T extends any>(initialValue: T): PureSignal<T>
export function PureSignal<T extends any>(
  initialValue: T,
  options: SignalOptions
): PureSignal<T>
export function PureSignal<T extends any>(
  initialValue: T,
  options: SignalOptions = {}
): PureSignal<T> {
  return PureSignalCreator.createPureSignal(initialValue, options)
}

export interface PureSignal<T> {
  /**
   * Get the value
   */
  (): T
  /**
   * Set a new value
   */
  (newVal: T): PureSignal<T>
  /**
   * Set a new value with some options
   */
  (newVal: T, options: SignalOptions): PureSignal<T>

  on: <K extends keyof SignalDefaultEvents<T>>(
    event: K,
    cb: (...args: SignalDefaultEvents<T>[K]) => void
  ) => Listener<SignalDefaultEvents<T>, K>
  /**
   * Remove event listener
   *
   * @param {Listener<SignalDefaultEvents<T>, keyof SignalDefaultEvents<T>>}  listener
   * @returns {PureSignal<T>}
   */
  off: (
    listener: Listener<SignalDefaultEvents<T>, keyof SignalDefaultEvents<T>>
  ) => PureSignal<T>
  /**
   * Remove all event listeners
   *
   * @returns {PureSignal<T>}
   */
  clearListeners: () => PureSignal<T>
}
