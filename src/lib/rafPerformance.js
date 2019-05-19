const addUp = (total, curr) => total + curr
const sortDescending = (a, b) => b - a

export class RequestAnimationFramePerformance {
  #FPSList = []
  #frameTimes = []
  #cycleStart
  #currentFPS
  #latestFPS
  #highestFPS = 0
  #running = false
  #lastFrameTime
  #runtime

  #startNewCycle = () => {
    this.#currentFPS = 0
    this.#cycleStart = performance.now()
    this.#lastFrameTime = this.#cycleStart
    requestAnimationFrame(this.#cycle)
  }

  #cycle = () => {
    if (!this.#running) return

    const currentTime = performance.now()

    this.#frameTimes.push(currentTime - this.#lastFrameTime)

    if (currentTime - this.#cycleStart < 1000) {
      this.#currentFPS += 1
      this.#lastFrameTime = currentTime
      requestAnimationFrame(this.#cycle)
    } else {
      this.#latestFPS = this.#currentFPS
      this.#highestFPS = Math.max(this.#currentFPS, this.#highestFPS)
      this.#FPSList.unshift(this.#currentFPS)
      this.#startNewCycle()
    }
  }

  start = () => {
    this.#running = true
    this.#runtime = performance.now()
    this.#startNewCycle()
  }

  end = () => {
    this.#running = false
    this.#runtime = performance.now() - this.#runtime
  }

  get averageFPS() {
    const totalFPS = [...this.#FPSList].reduce(addUp, 0)
    return Math.round(totalFPS / this.#FPSList.length)
  }

  get avgFrameTime() {
    const totalTime = this.#frameTimes.reduce(addUp, 0)
    return Math.round(totalTime / this.#frameTimes.length)
  }

  get runtime() {
    return this.#runtime
  }

  getNHighestFrameTimes = (n) => {
    return [...this.#frameTimes].sort(sortDescending).slice(0, n)
  }
}
