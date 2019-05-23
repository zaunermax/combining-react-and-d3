import { storiesOf } from '@storybook/react'
import { GraphContainer } from 'components/app/stateContainer'
import { HybridForceGraph } from 'components/hybrid/forceGraph'
import React from 'react'
import { applyPropsToComponent } from 'lib/reactUtil'

const GraphWoAnimation = applyPropsToComponent({ animation: null })(HybridForceGraph)

storiesOf('React & D3 Hybrid', module)
  .add('Standard hybrid graph', () => <GraphContainer component={HybridForceGraph} />)
  .add('Hybrid graph without animation', () => <GraphContainer component={GraphWoAnimation} />)
