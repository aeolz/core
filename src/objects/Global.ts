import Aeolz from "../index-types"
import { CacheManager } from "./CacheManager"
import { Loop } from "./Loop"
import { Template } from "./Template"
import { Tick } from "./Tick"
import { Utils } from "./Utils"

export namespace Global {
  // top level
  const loops: { [k in keyof Aeolz.LoopList]: Aeolz.LoopList[k] } = {}
  const caches: { [k in keyof Aeolz.CacheList]: Aeolz.CacheList[k] } = {}
  const templates: { [k in keyof Aeolz.TemplateList]: Aeolz.TemplateList[k] } =
    {}
  export let silence: boolean = false

  export type LoopRequest = {
    callback: () => void
    limitedTick?: Tick
  }

  export function registerTemplate<T extends Template>(template: T): T {
    templates[template.options?.name] = template
    return template
  }

  export function useTemplate<T extends keyof Aeolz.TemplateList>(
    templateName: T
  ): Aeolz.TemplateList[T] {
    if (templateName in templates) return templates[templateName]
    if (!silence) {
      Utils.createError(`No template with name '${templateName}' was found`)
    }
  }

  export function removeGlobalTemplate(template: Template): void {
    delete templates[template.options?.name]
  }

  export function registerCache<T extends CacheManager>(cache: T): T {
    caches[cache.options?.name] = cache
    return cache
  }

  export function removeGlobalCache(cache: CacheManager): void {
    delete caches[cache.options?.name]
  }

  export function useCache<T extends keyof Aeolz.CacheList>(
    cacheName: T
  ): Aeolz.CacheList[T] | undefined {
    if (cacheName in caches) return caches[cacheName]
    if (!silence) {
      Utils.createError(`No cache manager with name '${cacheName}' was found`)
    }
  }

  export function makeLoopRequest(
    loopName: keyof Aeolz.LoopList,
    request: LoopRequest["callback"] | LoopRequest
  ) {
    if (!(loopName in loops)) {
      if (silence) return
      Utils.createError(`No loop with name '${loopName}' was found`)
    }
    loops[loopName].createRequest(
      typeof request === "function" ? { callback: request } : request
    )
  }

  export function registerLoop(loop: Loop): Loop {
    loops[loop.name] = loop
    return loop
  }

  export function removeGlobalLoop(loop: Loop): void {
    delete loops[loop.name]
  }
}
