import { Prettify } from "../Type"
import Aeolz from "../index-types"
import { Gettable } from "./Gettable"
import { Global } from "./Global"
import { Utils } from "./Utils"

export type CacheOptions<T extends object> = {
  /**
   * Whether or not Cache will be registered globally
   * @default false
   */
  global?: boolean
  /**
   * Name of cache used to find the global cache
   */
  name?: keyof Aeolz.CacheList
  /**
   * Set initial value
   */
  initialValue?: Gettable<T>
} & Prettify<GlobalCache>

type GlobalCache = {}

export const enum CacheStatus {
  editable,
  readonly,
  destroyed,
}

export class CacheManager<T extends object = any> {
  private data = <{ [k: string | number | symbol]: any }>{}
  private _status: CacheStatus = CacheStatus.editable
  constructor(public options: CacheOptions<T> = {}) {
    if (options.global) {
      if (!options.name) {
        Utils.createError("Cache must have a name for registering globally")
      } else {
        Global.registerCache(this)
      }
    }
  }

  set<K extends keyof T>(key: K, data: T[K]): this
  set(key: string, data: any): this
  set<K extends keyof T>(key: K | string, data: any): this {
    if (this.status !== CacheStatus.editable) return this
    this.data[key] = data
    return this
  }

  get<K extends keyof T>(key: K): T[K]
  get(key: string): any
  get<K extends keyof T>(key: K | string): T[K] {
    if (this.status === CacheStatus.destroyed) return
    return this.data[key]
  }

  delete<K extends keyof T>(key: K): this
  delete(key: string): this
  delete(key: keyof T | string): this {
    if (this.status !== CacheStatus.editable) return this
    delete this.data[key]
    return this
  }

  switchToReadonly(): this {
    this._status = CacheStatus.readonly
    return this
  }

  switchToEditable() {
    this._status = CacheStatus.editable
    return this
  }

  destroy(): void {
    this._status = CacheStatus.destroyed
    if (this.options.global) Global.removeGlobalCache(this)
  }

  get status(): CacheStatus {
    return this._status
  }
}
