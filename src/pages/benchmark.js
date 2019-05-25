import React, { Component } from 'react'
import styled from 'styled-components/macro'
import AutoSizer from 'react-virtualized-auto-sizer'
import { LINK_TYPES } from 'lib/d3/linkPath'
import { generateRandomNodeData, reseed } from 'lib/rndHelpers'
import { Link, Route, Switch } from 'react-router-dom'
import { PureD3ForceGraph } from 'components/pureD3/forceGraph'
import { HybridForceGraph } from 'components/hybrid/forceGraph'
import { PureReactForceGraph } from 'components/pureReact/forceGraph'
import { RequestAnimationFramePerformance } from 'lib/rafPerformance'
import BenchmarkResults from 'components/performance/benchmarkResult'

const D3_ROUTE = '/d3'
const HYBRID_ROUTE = '/hybrid'
const REACT_ROUTE = '/react'

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

export const TestIterations = Object.freeze([
  { nrOfNodes: 10, nrOfLinks: 5 },
  { nrOfNodes: 50, nrOfLinks: 30 },
  { nrOfNodes: 100, nrOfLinks: 100 },
  { nrOfNodes: 250, nrOfLinks: 150 },
  { nrOfNodes: 500, nrOfLinks: 250 },
  { nrOfNodes: 1000, nrOfLinks: 500 },
])

const forceVariations = Object.freeze([
  { path: D3_ROUTE, ForceComponent: PureD3ForceGraph },
  { path: HYBRID_ROUTE, ForceComponent: HybridForceGraph },
  { path: REACT_ROUTE, ForceComponent: PureReactForceGraph },
])

const forceOptions = Object.freeze({
  radiusMultiplier: 1.2,
})

const generateRandData = ({ nrOfNodes, nrOfLinks }) => {
  reseed()
  return generateRandomNodeData(nrOfNodes, nrOfLinks)
}

const calcNewItData = ({ iterationCnt, currentIteration }, nrIterations) => ({
  newCurrIt: iterationCnt === nrIterations ? currentIteration + 1 : currentIteration,
  newItCnt: iterationCnt < nrIterations ? iterationCnt + 1 : 1,
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
      iterations: Array.from(Array(TestIterations.length), () => Array(props.nrIterations)),
    }
  }

  componentDidUpdate({ location }, oldState) {
    this.setState((state, { nrIterations }) => {
      const itData = calcNewItData(state, nrIterations)
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

  render() {
    const { component: ForceComponent } = this.props
    const { displayName } = ForceComponent
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
          <div>{displayName}</div>
          <div>Current iteration: {currentIteration + 1}</div>
          <div>Iteration cnt: {iterationCnt}</div>
        </IterationCnt>
        <AutoSizer>
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
        </AutoSizer>
      </>
    ) : !benchmarkFinished ? null : (
      <BenchmarkResults
        iterations={iterations}
        componentType={displayName}
        testIterations={TestIterations}
      />
    )
  }
}

const BenchmarkRouting = ({
  match: {
    path,
    url,
    params: { nrIterations = 1 },
  },
}) => (
  <Container>
    <Switch>
      {forceVariations.map(({ path: nestedPath, ForceComponent }) => {
        const newPath = path + nestedPath
        return (
          <Route
            exact
            key={newPath}
            path={newPath}
            render={() => (
              <BenchmarkContainer
                component={ForceComponent}
                nrIterations={Number(nrIterations) || 1}
              />
            )}
          />
        )
      })}
      <Route
        path={path}
        render={() => (
          <ul>
            <li>
              <Link to={url + D3_ROUTE}>Pure D3</Link>
            </li>
            <li>
              <Link to={url + HYBRID_ROUTE}>D3 React Hybrid</Link>
            </li>
            <li>
              <Link to={url + REACT_ROUTE}>Pure React</Link>
            </li>
          </ul>
        )}
      />
    </Switch>
  </Container>
)

export default BenchmarkRouting
