import { Global } from "./Global"

export class Utils {
  static isNumber(n: any): boolean {
    return typeof n === "number" && (!!n || n === 0)
  }

  /**
   *
   * @param percentage percentage example: 12%
   * @param of of number example: 300
   * @returns 300 * 12 / 100 === 36
   */
  percentOf(percentage: number, of: number) {
    return (of * percentage) / 100 || 0
  }

  /**
   * @param target target number example: 12
   * @param from from number example: 30
   * @returns 12/30*100 === 40%
   */
  percentFrom(target: number, from: number) {
    return (target / from) * 100 || 0
  }

  static createError(msg: string) {
    if (Global.silence) return
    throw new Error(msg)
  }
}
