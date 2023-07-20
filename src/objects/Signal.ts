import { EventEmitter, Listener } from "../utils/event-emitter"
import { PureSignalCreator, SignalDefaultEvents } from "./PureSignal"

export type SignalPipe<T> = (value: T) => T

export type SignalMiddleware<T> = (value: T) => T

export interface SignalOptions {
  /**
   * No middlewares, no pipes, optimized get set
   */
  pure?: boolean
}

/**
 * Please use only primitive types, because it will be unable to reset to initial value
 */
export class SignalCreator<T extends any> extends PureSignalCreator<T> {
  constructor(initialValue: T) {
    super(initialValue)
  }

  pipes: SignalPipe<T>[] = []
  middlewares: SignalMiddleware<T>[] = []

  /**
   * Middlewares will run before setting the new value
   * Useful for filtering
   *
   * @param {(...middlewares: SignalMiddleware<T>[])} middlewares
   * @returns {this}
   */
  middleware(...middlewares: SignalMiddleware<T>[]): this {
    this.middlewares.push(...middlewares)
    return this
  }

  /**
   * Pipe value before Getting the value
   *
   * @param {(...pipes: SignalPipe<T>[])} pipes
   * @returns {this}
   */
  pipe(...pipes: SignalPipe<T>[]): this {
    this.pipes.push(...pipes)
    return this
  }

  /**
   * Use collected middlewares for a value
   *
   * @param {T} value
   * @returns {T} the given value after middleware actions
   */
  useMiddlewares(value: T): T {
    this.middlewares.forEach((m) => (value = m(value)))
    return value
  }

  /**
   * Use collected pipes for a value
   *
   * @param {T} value
   * @returns {T} the given value after pipe actions
   */
  usePipes(value: T): T {
    this.pipes.forEach((p) => (value = p(value)))
    return value
  }

  static createSignal<T>(initialValue: T, options: SignalOptions = {}) {
    const { pure = false } = options || {}
    const signal = new SignalCreator<T>(initialValue)
    const fn = <Signal<T>>function (val?: T): T | Signal<T> {
      if (val === undefined) {
        let value = signal.value
        if (!pure) value = signal.usePipes(signal.value)
        return value
      }
      if (!pure) val = signal.useMiddlewares(val)
      signal.setValue(val)
      return <Signal<T>>fn
    }
    fn.pipe = (...pipes: SignalPipe<T>[]): Signal<T> => {
      if (pure) return <Signal<T>>fn
      signal.pipe(...pipes)
      return <Signal<T>>fn
    }
    fn.middleware = (...middlewares: SignalMiddleware<T>[]): Signal<T> => {
      if (pure) return <Signal<T>>fn
      signal.middleware(...middlewares)
      return <Signal<T>>fn
    }
    fn.on = <K extends keyof SignalDefaultEvents<T>>(
      event: K,
      cb: (...args: SignalDefaultEvents<T>[K]) => void
    ): Listener<SignalDefaultEvents<T>, K> => {
      return signal.emitter.on(event, cb)
    }
    fn.off = (
      listener: Listener<SignalDefaultEvents<T>, keyof SignalDefaultEvents<T>>
    ): Signal<T> => {
      signal.emitter.off(listener)
      return <Signal<T>>fn
    }
    fn.clearListeners = () => {
      signal.emitter.listeners = []
      return <Signal<T>>fn
    }

    return fn
  }
}

export function Signal<T extends any>(initialValue: T): Signal<T>
export function Signal<T extends any>(
  initialValue: T,
  options: SignalOptions
): Signal<T>
export function Signal<T extends any>(
  initialValue: T,
  options: SignalOptions = {}
): Signal<T> {
  return SignalCreator.createSignal(initialValue, options)
}

export interface Signal<T> {
  /**
   * Get the value
   */
  (): T
  /**
   * Set a new value
   */
  (newVal: T): Signal<T>
  /**
   * Set a new value with some options
   */
  (newVal: T, options: SignalOptions): Signal<T>
  /**
   * Register pipes
   *
   * @param {(...pipes: SignalPipe<T>[])} pipes
   * @returns {Signal<T>}
   */
  pipe: (...pipes: SignalPipe<T>[]) => Signal<T>
  /**
   * Register middlewares
   *
   * @param {(...middlewaress: SignalMiddleware<T>[])} middlewaress
   * @returns {Signal<T>}
   */
  middleware: (...middlewaress: SignalMiddleware<T>[]) => Signal<T>
  /**
   * Listen an event
   *
   * @param {keyof SignalDefaultEvents} event
   * @param {((...args: SignalDefaultEvents<T>[keyof SignalDefaultEvents]) => void)} cb
   * @returns {Listener<SignalDefaultEvents<T>, keyof SignalDefaultEvents>}
   */
  on: <K extends keyof SignalDefaultEvents<T>>(
    event: K,
    cb: (...args: SignalDefaultEvents<T>[K]) => void
  ) => Listener<SignalDefaultEvents<T>, K>
  /**
   * Remove event listener
   *
   * @param {Listener<SignalDefaultEvents<T>, keyof SignalDefaultEvents<T>>}  listener
   * @returns {Signal<T>}
   */
  off: (
    listener: Listener<SignalDefaultEvents<T>, keyof SignalDefaultEvents<T>>
  ) => Signal<T>
  /**
   * Remove all event listeners
   *
   * @returns {Signal<T>}
   */
  clearListeners: () => Signal<T>
}
