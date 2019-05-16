import React, { Component } from 'react'
import styled from 'styled-components/macro'
import Autosizer from 'react-virtualized-auto-sizer'
import { LINK_TYPES } from 'lib/d3/linkPath'
import { HybridForceGraph } from 'components/hybrid/forceGraph'
import { generateNRandomNodes } from 'lib/rndHelpers'
import { PureReactForceGraph } from 'components/pureReact/forceGraph'
import { D3_BENCH, HYBRID_BENCH, PURE_BENCH } from 'routes'
import { Route, Switch } from 'react-router-dom'
import { PureD3ForceGraph } from 'components/pureD3/forceGraph'

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  overflow: hidden;
`

class BenchmarkContainer extends Component {
  constructor(props) {
    super(props)
    const nrOfNodes = props.match.params.nrOfNodes || 0
    const nrOfLinks = props.match.params.nrOfLinks || 0
    this.state = {
      ...generateNRandomNodes(nrOfNodes, nrOfLinks),
    }
  }

  render() {
    const { nodes = [], links = [] } = this.state
    return (
      <Container>
        <Autosizer>
          {({ height, width }) => (
            <Switch>
              <Route
                path={D3_BENCH}
                render={() => (
                  <PureD3ForceGraph
                    data={nodes}
                    links={links}
                    linkType={LINK_TYPES.CURVED}
                    height={height}
                    width={width}
                  />
                )}
              />
              <Route
                path={HYBRID_BENCH}
                render={() => (
                  <HybridForceGraph
                    data={nodes}
                    links={links}
                    linkType={LINK_TYPES.CURVED}
                    height={height}
                    width={width}
                  />
                )}
              />
              <Route
                path={PURE_BENCH}
                render={() => (
                  <PureReactForceGraph
                    data={nodes}
                    links={links}
                    linkType={LINK_TYPES.CURVED}
                    height={height}
                    width={width}
                  />
                )}
              />
            </Switch>
          )}
        </Autosizer>
      </Container>
    )
  }
}

export default BenchmarkContainer
