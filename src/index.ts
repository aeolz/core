import { CacheManager } from "./objects/CacheManager"
import { DailyScheduler } from "./objects/DailyScheduler"
import { Enumerable } from "./objects/Decorators"
import { Global } from "./objects/Global"
import { Interval } from "./objects/Interval"
import { Loop } from "./objects/Loop"
import { PureSignal } from "./objects/PureSignal"
import { RateLimiter } from "./objects/RateLimiter"
import { Signal } from "./objects/Signal"
import { Template } from "./objects/Template"
import { Tick } from "./objects/Tick"
import { Timeout } from "./objects/Timeout"
import { Utils } from "./objects/Utils"

const Aeolz = {
  Signal: Signal,
  PureSignal: PureSignal,
  Enumerable: Enumerable,
  Global: Global,
  CacheManager: CacheManager,
  Template: Template,
  Loop: Loop,
  Tick: Tick,
  Utils: Utils,
  Timeout: Timeout,
  Interval: Interval,
  RateLimiter: RateLimiter,
  DailyScheduler: DailyScheduler,
}

export default Aeolz
