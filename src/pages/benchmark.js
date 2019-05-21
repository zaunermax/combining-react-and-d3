import React, { Component } from 'react'
import styled from 'styled-components/macro'
import Autosizer from 'react-virtualized-auto-sizer'
import { LINK_TYPES } from 'lib/d3/linkPath'
import { generateRandomNodeData, reseed } from 'lib/rndHelpers'
import { D3_BENCH, HYBRID_BENCH, PURE_BENCH } from 'routes'
import { Redirect, Route, Switch } from 'react-router-dom'
import { PureD3ForceGraph } from 'components/pureD3/forceGraph'
import { HybridForceGraph } from 'components/hybrid/forceGraph'
import { PureReactForceGraph } from 'components/pureReact/forceGraph'
import { RequestAnimationFramePerformance } from 'lib/rafPerformance'
import BenchmarkResults from 'components/performance/benchmarkResult'

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  overflow: hidden;
`

const IterationCnt = styled.div`
  position: fixed;
  z-index: 1;
  top: 0;
  left: 0;
`

const NR_ITERATIONS = 1

const TestIterations = Object.freeze([
  { nrOfNodes: 10, nrOfLinks: 5 },
  //{ nrOfNodes: 50, nrOfLinks: 30 },
  { nrOfNodes: 100, nrOfLinks: 100 },
  //{ nrOfNodes: 250, nrOfLinks: 150 },
  //{ nrOfNodes: 500, nrOfLinks: 250 },
  { nrOfNodes: 1000, nrOfLinks: 500 },
])

const forceVariations = Object.freeze([
  { path: D3_BENCH, ForceComponent: PureD3ForceGraph },
  { path: HYBRID_BENCH, ForceComponent: HybridForceGraph },
  { path: PURE_BENCH, ForceComponent: PureReactForceGraph },
])

const forceOptions = Object.freeze({
  radiusMultiplier: 1.2,
})

const generateRandData = ({ nrOfNodes, nrOfLinks }) => {
  reseed()
  return generateRandomNodeData(nrOfNodes, nrOfLinks)
}

const calcNewItData = ({ iterationCnt, currentIteration }) => ({
  newCurrIt: iterationCnt === NR_ITERATIONS ? currentIteration + 1 : currentIteration,
  newItCnt: iterationCnt < NR_ITERATIONS ? iterationCnt + 1 : 1,
})

const shouldDoNewIteration = (
  { benchmarkRunning: oldRunning },
  { benchmarkRunning: newRunning, benchmarkFinished },
  { newCurrIt },
) =>
  oldRunning === true &&
  newRunning === false &&
  newCurrIt < TestIterations.length &&
  !benchmarkFinished

const getNewIterationData = ({ newCurrIt, newItCnt }) => ({
  ...generateRandData(TestIterations[newCurrIt]),
  benchmarkRunning: true,
  iterationCnt: newItCnt,
  currentIteration: newCurrIt,
})

const iterationsFinished = ({ newCurrIt }) => newCurrIt >= TestIterations.length

class BenchmarkContainer extends Component {
  constructor(props) {
    super(props)
    const currentIteration = 0
    this.state = {
      ...generateRandData(TestIterations[currentIteration]),
      currentIteration,
      iterationCnt: 1,
      benchmarkRunning: true,
      iterations: Array.from(Array(TestIterations.length), () => Array(NR_ITERATIONS)),
    }
  }

  componentDidUpdate(_, oldState) {
    this.setState((state) => {
      const itData = calcNewItData(state)

      return state.benchmarkFinished
        ? null
        : shouldDoNewIteration(oldState, state, itData)
        ? getNewIterationData(itData)
        : iterationsFinished(itData)
        ? { benchmarkFinished: true }
        : null
    })
  }

  onStartHandler = () => {
    this.rafp = new RequestAnimationFramePerformance()
    this.rafp.start()
  }

  onEndHandler = () => {
    this.rafp.end()
    this.setState(({ iterations, currentIteration, iterationCnt }) => {
      iterations[currentIteration][iterationCnt - 1] = {
        time: this.rafp.runtime,
        avgFPS: this.rafp.averageFPS,
        avgFrameTime: this.rafp.avgFrameTime,
        highestFrameTime: this.rafp.highestFrameTime,
      }
      return {
        benchmarkRunning: false,
        iterations,
      }
    })
  }

  getForceComponentRenderer = ({ ForceComponent, height, width }) => () => {
    const { nodes = [], links = [] } = this.state
    return (
      <ForceComponent
        data={nodes}
        links={links}
        linkType={LINK_TYPES.CURVED}
        height={height}
        width={width}
        forceOptions={forceOptions}
        onSimulationStart={this.onStartHandler}
        onSimulationEnd={this.onEndHandler}
      />
    )
  }

  render() {
    const {
      benchmarkRunning,
      iterations,
      currentIteration,
      iterationCnt,
      benchmarkFinished,
    } = this.state

    return benchmarkRunning ? (
      <Container>
        <IterationCnt>
          <div>Current iteration: {currentIteration + 1}</div>
          <div>Iteration cnt: {iterationCnt}</div>
        </IterationCnt>
        <Autosizer>
          {({ height, width }) => (
            <Switch>
              {forceVariations.map(({ path, ForceComponent }) => (
                <Route
                  key={path}
                  path={path}
                  render={this.getForceComponentRenderer({ ForceComponent, height, width })}
                  exact
                />
              ))}
              <Redirect to={D3_BENCH} />
            </Switch>
          )}
        </Autosizer>
      </Container>
    ) : !benchmarkFinished ? null : (
      <BenchmarkResults iterations={iterations} />
    )
  }
}

export default BenchmarkContainer
