import { storiesOf } from '@storybook/react'
import { GraphContainer } from 'components/app/stateContainer'
import { HybridForceGraph } from 'components/hybrid/forceGraph'
import React from 'react'
import { applyPropsToComponent } from 'lib/reactUtil'

const rectTickHandler = (nodeSel) => nodeSel.attr('x', (d) => d.x).attr('y', (d) => d.y)
const rectNodeRenderer = ({ id, size }) => (
  <rect className={'node'} id={id} key={id} width={size} height={size} fill={'palevioletred'} />
)

const GraphWoAnimation = applyPropsToComponent({ animation: null })(HybridForceGraph)
const CustomRender = applyPropsToComponent({
  nodeTickHandler: rectTickHandler,
  renderNode: rectNodeRenderer,
  animation: null,
})(HybridForceGraph)

storiesOf('React & D3 Hybrid', module)
  .add('Standard hybrid graph', () => <GraphContainer component={HybridForceGraph} />)
  .add('Hybrid graph without animation', () => <GraphContainer component={GraphWoAnimation} />)
  .add('Custom render animation', () => <GraphContainer component={CustomRender} />)
