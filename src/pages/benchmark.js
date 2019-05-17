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

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  overflow: hidden;
`

const Result = styled.div`
  font-size: 2em;
`

const forceVariations = Object.freeze([
  { path: D3_BENCH, ForceComponent: PureD3ForceGraph },
  { path: HYBRID_BENCH, ForceComponent: HybridForceGraph },
  { path: PURE_BENCH, ForceComponent: PureReactForceGraph },
])

const forceOptions = Object.freeze({
  radiusMultiplier: 1.2,
})

class BenchmarkContainer extends Component {
  constructor(props) {
    super(props)
    const nrOfNodes = props.match.params.nrOfNodes || 0
    const nrOfLinks = props.match.params.nrOfLinks || 0
    this.state = {
      ...generateRandomNodeData(nrOfNodes, nrOfLinks),
      benchmarkRunning: false,
    }
  }

  onStartHandler = () => {
    this.perf = performance.now()
  }

  onEndHandler = () => {
    this.setState(() => ({
      benchmarkRunning: false,
      time: performance.now() - this.perf,
    }))
  }

  render() {
    const { nodes = [], links = [], benchmarkRunning, time } = this.state
    return benchmarkRunning ? (
      <Container>
        <Autosizer>
          {({ height, width }) => (
            <Switch>
              {forceVariations.map(({ path, ForceComponent }) => (
                <Route
                  key={path}
                  path={path}
                  render={() => (
                    <ForceComponent
                      data={nodes}
                      links={links}
                      linkType={LINK_TYPES.CURVED}
                      height={height}
                      width={width}
                      forceOptions={forceOptions}
                      performance={{
                        startHandler: this.onStartHandler,
                        endHandler: this.onEndHandler,
                      }}
                    />
                  )}
                />
              ))}
            </Switch>
          )}
        </Autosizer>
      </Container>
    ) : (
      <Result>ForceGraph took {time}ms to complete</Result>
    )
  }
}

export default BenchmarkContainer
