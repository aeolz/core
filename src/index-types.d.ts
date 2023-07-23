import { Global as GlobalNamespace } from "./objects/Global"
import { TemplateItem } from "./objects/Template"

declare namespace Aeolz {
  export interface LoopList {
    [k: string]: Loop
  }
  export interface CacheList {
    [k: string]: CacheManager
  }
  export interface TemplateList {
    [k: string]: Template
  }

  export const Signal: typeof import("./objects/Signal").Signal
  export type Signal<T> = import("./objects/Signal").Signal<T>

  export const PureSignal: typeof import("./objects/PureSignal").PureSignal
  export type PureSignal<T> = import("./objects/PureSignal").PureSignal<T>

  export const Enumerable: typeof import("./objects/Decorators").Enumerable

  export import Global = GlobalNamespace

  export const CacheManager: typeof import("./objects/CacheManager").CacheManager
  export type CacheManager<T extends object = any> =
    import("./objects/CacheManager").CacheManager<T>

  export const Template: typeof import("./objects/Template").Template
  export type Template<
    T extends readonly TemplateItem<any>[] = readonly TemplateItem<any>[]
  > = import("./objects/Template").Template<T>

  export const Loop: typeof import("./objects/Loop").Loop
  export type Loop = import("./objects/Loop").Loop

  export const Tick: typeof import("./objects/Tick").Tick
  export type Tick = import("./objects/Tick").Tick

  export const Utils: typeof import("./objects/Utils").Utils
  export type Utils = import("./objects/Utils").Utils

  export const Interval: typeof import("./objects/Interval").Interval
  export type Interval = import("./objects/Interval").Interval

  export const Timeout: typeof import("./objects/Timeout").Timeout
  export type Timeout = import("./objects/Timeout").Timeout
}

export default Aeolz
