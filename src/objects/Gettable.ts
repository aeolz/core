export type Gettable<
  T extends string | number | boolean | object | Array<any>
> = T | (() => T)

export const Gettable = <
  T extends string | number | boolean | object | Array<any>
>(
  data: Gettable<T>
): T => (typeof data !== "function" ? data : data())
