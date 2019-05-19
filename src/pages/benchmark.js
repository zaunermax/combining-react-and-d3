import React, { Component } from 'react'
import styled from 'styled-components/macro'
import Autosizer from 'react-virtualized-auto-sizer'
import { LINK_TYPES } from 'lib/d3/linkPath'
import { generateRandomNodeData } from 'lib/rndHelpers'
import { D3_BENCH, HYBRID_BENCH, PURE_BENCH } from 'routes'
import { Route, Switch } from 'react-router-dom'
import { PureD3ForceGraph } from 'components/pureD3/forceGraph'
import { HybridForceGraph } from 'components/hybrid/forceGraph'
import { PureReactForceGraph } from 'components/pureReact/forceGraph'
import { RequestAnimationFramePerformance } from 'lib/rafPerformance'

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

const NR_ITERATIONS = 3

const TestIterations = Object.freeze([
  { nrOfNodes: 10, nrOfLinks: 5 },
  //{ nrOfNodes: 50, nrOfLinks: 30 },
  //{ nrOfNodes: 100, nrOfLinks: 50 },
  //{ nrOfNodes: 250, nrOfLinks: 150 },
  //{ nrOfNodes: 500, nrOfLinks: 250 },
  //{ nrOfNodes: 1000, nrOfLinks: 500 },
])

const forceVariations = Object.freeze([
  { path: D3_BENCH, ForceComponent: PureD3ForceGraph },
  { path: HYBRID_BENCH, ForceComponent: HybridForceGraph },
  { path: PURE_BENCH, ForceComponent: PureReactForceGraph },
])

const forceOptions = Object.freeze({
  radiusMultiplier: 1.2,
})

const generateRandData = ({ nrOfNodes, nrOfLinks }) => generateRandomNodeData(nrOfNodes, nrOfLinks)

class BenchmarkContainer extends Component {
  constructor(props) {
    super(props)
    const currentIteration = 0
    this.state = {
      ...generateRandData(TestIterations[currentIteration]),
      currentIteration,
      iterationCnt: 1,
      benchmarkRunning: true,
      iterations: [],
    }
  }

  componentDidUpdate(
    _,
    {
      benchmarkRunning: oldRunningState,
      iterations: { length: oldLength },
    },
  ) {
    const {
      iterations: { length },
      benchmarkRunning,
    } = this.state

    oldRunningState === true &&
      benchmarkRunning === false &&
      length < TestIterations.length * NR_ITERATIONS &&
      this.setState(({ currentIteration, iterationCnt }) => {
        const newCurrIt = iterationCnt === NR_ITERATIONS ? currentIteration + 1 : currentIteration
        const newItCnt = iterationCnt < NR_ITERATIONS ? iterationCnt + 1 : 1

        return {
          ...generateRandData(TestIterations[newCurrIt]),
          benchmarkRunning: true,
          iterationCnt: newItCnt,
          currentIteration: newCurrIt,
        }
      })
  }

  onStartHandler = () => {
    this.rafp = new RequestAnimationFramePerformance()
    this.rafp.start()
  }

  onEndHandler = () => {
    this.rafp.end()
    this.setState(({ iterations }) => ({
      benchmarkRunning: false,
      iterations: iterations.concat({
        time: this.rafp.runtime,
        avgFPS: this.rafp.averageFPS,
        avgFrameTime: this.rafp.avgFrameTime,
        highestFrameTimes: this.rafp.getNHighestFrameTimes(5),
      }),
    }))
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
    const { benchmarkRunning, iterations, currentIteration, iterationCnt } = this.state

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
                />
              ))}
            </Switch>
          )}
        </Autosizer>
      </Container>
    ) : iterations.length < TestIterations.length * NR_ITERATIONS ? null : (
      <>
        <div>Total number of iterations: {iterations.length}</div>
        {iterations.map(({ time, avgFPS, avgFrameTime, highestFrameTimes }, idx) => (
          <div key={idx}>
            <div>Time: {time}</div>
            <div>Avg FPS: {avgFPS}</div>
            <div>Avg frame time: {avgFrameTime}</div>
            <div>Highest frame times: {highestFrameTimes.join(', ')}</div>
          </div>
        ))}
      </>
    )
  }
}

export default BenchmarkContainer
