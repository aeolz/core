import Aeolz from "../index"
import { CacheManager } from "../objects/CacheManager"

const UserTemplate = new Aeolz.Template<[[string, number], string, string]>(
  [
    { key: "human", useTemplate: "human-template" },
    { key: "password" },
    { key: "email().txt().any" },
  ],
  { default: null }
)

const HumanTemplate = new Aeolz.Template<[string, number]>(["name", "age"], {
  global: true,
  name: "human-template",
})

// const a = UserTemplate.take()

const obj = {
  human: { name: "Vardan", age: 19 },
  password: "1234",
  email: () => ({ txt: () => ({ any: "vmaki@com" }) }),
}

// console.log(UserTemplate.toObject([["Vardan", 19], "1234", "vmaki@com"]))
// console.log(UserTemplate.take(obj))

const cache = new CacheManager({ initialValue: { map: [] } })

console.log(cache.get("map"))
cache.set("map", [1, 2, [1, 5]])
console.log(cache.get("map"))
cache.clear()
console.log(cache.get("map"))

Aeolz.Global.silence = true
// const loop = new Armory.Loop(null, { global: true, timeInSeconds: 10 })
