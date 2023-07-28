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
        const val = getValueFromObject(data, item.key)
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
  let lastKey = keys.pop()
  if (lastKey?.endsWith("()")) lastKey = lastKey.slice(0, -2)

  keys.reduce((nestedObj, nestedKey) => {
    if (nestedKey.endsWith("()")) nestedKey = nestedKey.slice(0, -2)
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
    let key = keyArr.shift()
    if (
      !val ||
      (typeof val !== "object" &&
        (!key.endsWith("()") || typeof val !== "function"))
    )
      return false

    let callable = false
    if (key.endsWith("()")) {
      key = key.slice(0, -2)
      callable = true
    }
    if (key in val) {
      val = callable ? val[key]() : val[key]
    } else {
      return false
    }
  }
  return true
}

function getValueFromObject(obj: any, key: string): any {
  const keys = key.split(".")

  return keys.reduce((acc, currKey) => {
    // Check if the key is a callable property (ends with ())
    if (currKey.endsWith("()")) {
      // Extract the actual key without ()
      currKey = currKey.slice(0, -2)

      if (typeof acc[currKey] === "function") {
        return acc[currKey]()
      } else {
        throw new Error(`Property '${currKey}' is not a function.`)
      }
    } else {
      if (!(currKey in acc)) {
        throw new Error(`Property '${currKey}' does not exist.`)
      }

      return acc[currKey]
    }
  }, obj)
}
