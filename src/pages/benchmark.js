import React, { Component } from 'react'
import styled from 'styled-components/macro'
import Autosizer from 'react-virtualized-auto-sizer'
import { LINK_TYPES } from 'lib/d3/linkPath'
import { generateRandomNodeData, reseed } from 'lib/rndHelpers'
import { Link, Route, Switch } from 'react-router-dom'
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
  { path: '/d3', ForceComponent: PureD3ForceGraph },
  { path: '/hybrid', ForceComponent: HybridForceGraph },
  { path: '/react', ForceComponent: PureReactForceGraph },
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

  componentDidUpdate({ location }, oldState) {
    this.setState((state) => {
      const itData = calcNewItData(state)

      return state.benchmarkFinished
        ? null
        : shouldDoNewIteration(oldState, state, itData)
        ? getNewIterationData(itData)
        : iterationsFinished(itData)
        ? { benchmarkFinished: true, componentType: location.pathname }
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

  getForceComponentRenderer = ({ ForceComponent }) => () => {
    const {
      nodes = [],
      links = [],
      currentIteration,
      iterationCnt,
      benchmarkRunning,
      iterations,
      benchmarkFinished,
    } = this.state

    return benchmarkRunning ? (
      <>
        <IterationCnt>
          <div>{this.props.location.pathname}</div>
          <div>Current iteration: {currentIteration + 1}</div>
          <div>Iteration cnt: {iterationCnt}</div>
        </IterationCnt>
        <Autosizer>
          {({ height, width }) => (
            <ForceComponent
              nodes={nodes}
              links={links}
              linkType={LINK_TYPES.CURVED}
              height={height}
              width={width}
              forceOptions={forceOptions}
              onSimulationStart={this.onStartHandler}
              onSimulationEnd={this.onEndHandler}
            />
          )}
        </Autosizer>
      </>
    ) : !benchmarkFinished ? null : (
      <BenchmarkResults iterations={iterations} />
    )
  }

  render() {
    const { match } = this.props

    return (
      <Container>
        <Switch>
          {forceVariations.map(({ path, ForceComponent }) => (
            <Route
              key={match.path + path}
              path={match.path + path}
              render={this.getForceComponentRenderer({ ForceComponent })}
              exact
            />
          ))}
          <Route
            path={match.path}
            render={() => (
              <ul>
                <li>
                  <Link to={match.url + '/d3'}>Pure D3</Link>
                </li>
                <li>
                  <Link to={match.url + '/hybrid'}>D3 React Hybrid</Link>
                </li>
                <li>
                  <Link to={match.url + '/react'}>Pure React</Link>
                </li>
              </ul>
            )}
          />
        </Switch>
      </Container>
    )
  }
}

export default BenchmarkContainer
