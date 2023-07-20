import { CacheManager } from "./objects/CacheManager"
import { Enumerable } from "./objects/Decorators"
import { Global } from "./objects/Global"
import { Loop } from "./objects/Loop"
import { PureSignal } from "./objects/PureSignal"
import { Signal } from "./objects/Signal"
import { Template } from "./objects/Template"
import { Tick } from "./objects/Tick"

const Aeolz = {
  Signal: Signal,
  PureSignal: PureSignal,
  Enumerable: Enumerable,
  Global: Global,
  CacheManager: CacheManager,
  Template: Template,
  Loop: Loop,
  Tick: Tick,
}

export default Aeolz
