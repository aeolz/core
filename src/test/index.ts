import Aeolz from "../index"

const UserTemplate = new Aeolz.Template<[[string, number], string, string]>(
  [
    { key: "human", useTemplate: "human-template" },
    { key: "password" },
    { key: "email" },
  ],
  { default: null }
)

const HumanTemplate = new Aeolz.Template<[string, number]>(["name", "age"], {
  global: true,
  name: "human-template",
})

// const a = UserTemplate.take()

console.log(UserTemplate.toObject([["Vardan", 19], "1234", "vmaki@com"]))

Aeolz.Global.silence = true
// const loop = new Armory.Loop(null, { global: true, timeInSeconds: 10 })
