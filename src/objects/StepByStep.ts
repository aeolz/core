export namespace StepByStep {
  export type Step = {
    worker: (() => void) | (() => Promise<void>)
    await?: boolean
    onError?: (err: Error) => void
  }

  class SBT {
    private _query: Step[] = []
    private _working = false

    get length() {
      return this._query.length
    }

    isWorking() {
      return this._working
    }

    take(step: Step): SBT {
      this._query.push(step)
      this._checkWorking()
      return this
    }

    private async _checkWorking() {
      if (this.length === 0 || this.isWorking()) return
      const nextStep = this._query.shift()
      this._working = true
      try {
        if (nextStep.await) {
          await nextStep.worker()
        } else {
          nextStep.worker()
        }
      } catch (err) {
        nextStep?.onError?.(err)
      }
      this._working = false
      this._checkWorking()
    }
  }

  export const create = (): SBT => {
    return new SBT()
  }
}
