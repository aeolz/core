import Aeolz from "../index-types"
import { Global } from "./Global"
import { Utils } from "./Utils"

export type TemplateItem<T extends any = any> = {
  required?: boolean
  key: string
  default?: T
  useTemplate?: keyof Aeolz.TemplateList | Template
  each?: boolean
}

export type TemplateItemString<T extends any = any> = TemplateItem<T> | string

// export type TypedTemplateItems<T extends readonly TemplateItem[]> = {
//   [P in keyof T]: T[P] extends TemplateItem<infer U> ? U : never
// }

export type TemplateOptions = {
  default?: any
  requireAll?: boolean
  global?: boolean
  name?: keyof Aeolz.TemplateList
}

export class Template<I extends readonly any[] = readonly any[]> {
  items: TemplateItem[]
  constructor(
    items: TemplateItemString[],
    public options: TemplateOptions = {}
  ) {
    this.items = items.map((item) =>
      typeof item === "string" ? { key: item } : item
    )

    if (options.global) {
      if (!options.name) {
        Utils.createError("Template must have a name for registering globally")
      } else {
        Global.registerTemplate(this)
      }
    }
  }

  take(data: object): I {
    const items: any = []
    if (!data || typeof data !== "object" || Array.isArray(data)) return null
    for (let item of this.items) {
      const templateToUse =
        typeof item.useTemplate === "string"
          ? Global.useTemplate(item.useTemplate)
          : item.useTemplate
      if (!recursiveKeyExists(item.key, data)) {
        if ("required" in item ? item.required : !!this.options.requireAll)
          return null

        if ("default" in item) {
          items.push(
            templateToUse instanceof Template
              ? templateToUse.take(item.default)
              : item.default
          )
        } else if ("default" in this.options) {
          items.push(this.options.default)
        }
      } else {
        const val = recursiveKey(item.key, data)
        items.push(
          templateToUse instanceof Template
            ? item.each && Array.isArray(val)
              ? val.map((v) => templateToUse.take(v))
              : templateToUse.take(val)
            : val
        )
      }
    }
    return items
  }

  /**
   * This method makes all items required
   */
  toObject<O extends object = object>(template: I): O {
    const object: object = {}
    if (!Array.isArray(template) || template.length > this.items.length)
      return object as O
    this.items.forEach((item, i) => {
      const itemData = template[i]
      const templateToUse =
        typeof item.useTemplate === "string"
          ? Global.useTemplate(item.useTemplate)
          : item.useTemplate
      assignValue(
        object,
        item.key,
        templateToUse instanceof Template
          ? item.each && Array.isArray(itemData)
            ? itemData.map((itemD) => templateToUse.toObject(itemD))
            : templateToUse.toObject(itemData)
          : itemData
      )
    })
    return object as O
  }
}

function assignValue(obj: object, key: string, value: any): void {
  const keys = key.split(".")
  const lastKey = keys.pop()

  keys.reduce((nestedObj, nestedKey) => {
    if (!nestedObj[nestedKey]) {
      nestedObj[nestedKey] = {}
    }
    return nestedObj[nestedKey]
  }, obj)[lastKey] = value
}

function recursiveKeyExists(key: string, obj: object) {
  const keyArr = key.split(".")
  if (keyArr.length === 0) return false
  let val: any = obj
  while (keyArr.length > 0) {
    if (!val || typeof val !== "object") return false
    const key = keyArr.shift()
    if (key in val) {
      val = val[key]
    } else {
      return false
    }
  }
  return true
}

function recursiveKey(key: string, obj: object) {
  const keyArr = key.split(".")
  let val: any = obj
  while (keyArr.length > 0) {
    const key = keyArr.shift()
    if (!val || typeof val !== "object") return undefined
    if (key in val) {
      val = val[key]
    } else {
      return undefined
    }
  }
  return val
}
