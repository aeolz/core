import { Cache } from "../lib/CacheManager"

const cache = new Cache({ global: true, name: "hello" })
cache.destroy()
cache.set("asd", 1)
console.log(cache)
