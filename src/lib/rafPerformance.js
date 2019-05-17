export const rafp = () => {
  const FPSlist = []
  const notes = []
  const support = !!window.requestAnimationFrame

  let cycleStart
  let currentFPS
  let latestFPS
  let currentNotes = []
  let highestFPS = 0
  let running = false
  let maxDetections = 60

  function startNewCycle() {
    currentFPS = 0
    currentNotes = []
    cycleStart = performance.now()
    requestAnimationFrame(cycle)
  }

  function cycle() {
    if (running) {
      const currentTime = performance.now()
      if (currentTime - cycleStart < 1000) {
        currentFPS += 1
        requestAnimationFrame(cycle)
      } else {
        latestFPS = currentFPS
        highestFPS = Math.max(currentFPS, highestFPS)
        FPSlist.unshift(currentFPS)
        notes.unshift(currentNotes.join(', '))
        startNewCycle()
      }
    }
  }

  function chop() {
    const copy = []
    for (let i = 0; i < maxDetections && FPSlist[i]; i += 1) {
      copy.push(FPSlist[i])
    }
    return copy
  }

  return {
    start: function() {
      if (support) {
        running = true
        startNewCycle()
      } else {
        this.getCurrentFPS = this.getAverageFPS = this.getMedianFPS = function() {
          return 'not supported'
        }
      }
    },
    end: function() {
      running = false
    },
    supported: support,
    setPeriod: function(number) {
      maxDetections = number * 1 || 60
    },
    addNote: function(note) {
      if (running) {
        currentNotes.push(note)
      }
    },
    getCurrentFPS: function() {
      return running ? latestFPS : 'not running'
    },
    getAverageFPS: function() {
      const data = chop()
      let totalTime = 0

      for (let i = 0; i < data.length; i += 1) {
        totalTime += data[i]
      }

      return Math.round(totalTime / data.length)
    },
    getMedianFPS: function() {
      const data = chop()

      data.sort(function(a, b) {
        return a - b
      })

      if (data.length === 1) {
        return data[0]
      }

      const middle = data.length / 2

      if (middle % 1) {
        return Math.round((data[middle - 0.5] + data[middle + 0.5]) / 2)
      } else {
        return data[middle]
      }
    },
    getFullDump: function() {
      const dump = []

      for (let i = FPSlist.length - 1; i >= 0; i -= 1) {
        dump.push({
          fps: FPSlist[i],
          notes: notes[i],
        })
      }

      return dump
    },
  }
}
