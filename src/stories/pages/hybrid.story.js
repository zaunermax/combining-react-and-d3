import React from 'react'
import { storiesOf } from '@storybook/react'
import { GraphContainer } from 'components/app/stateContainer'
import { HybridForceGraph } from 'components/hybrid/forceGraph'
import { applyPropsToComponent } from 'lib/reactUtil'
import { DogeContainer } from 'components/app/dogeContainer'
import { GlobalStyle } from 'stories/decorators/fullheightBody'

const rectTickHandler = (nodeSel) => nodeSel.attr('x', (d) => d.x).attr('y', (d) => d.y)
const rectNodeRenderer = ({ id, size }) => (
  <rect className={'node'} id={id} key={id} width={size} height={size} fill={'palevioletred'} />
)

const groupTickHandler = (nodeSel) =>
  nodeSel.attr('transform', ({ x, y }) => `translate(${x},${y})`)

const groupNodeRenderer = ({ id, size }) => (
  <g id={id} key={id} className={'node'}>
    <circle r={size} fill={'palevioletred'} />
  </g>
)

const GraphWoAnimation = applyPropsToComponent({ animation: null })(HybridForceGraph)
const CustomRender = applyPropsToComponent({
  nodeTickHandler: rectTickHandler,
  renderNode: rectNodeRenderer,
  forceOptions: { radiusMultiplier: 1.5 },
  animation: null,
})(HybridForceGraph)

const GroupRender = applyPropsToComponent({
  nodeTickHandler: groupTickHandler,
  renderNode: groupNodeRenderer,
  animation: null,
})(HybridForceGraph)

storiesOf('React & D3 Hybrid', module)
  .addDecorator(GlobalStyle)
  .add('Standard hybrid graph', () => <GraphContainer component={HybridForceGraph} />)
  .add('Hybrid graph without animation', () => <GraphContainer component={GraphWoAnimation} />)
  .add('Custom render animation', () => <GraphContainer component={CustomRender} />)
  .add('Group render animation', () => <GraphContainer component={GroupRender} />)
  .add('Company hierarchy animation', () => <DogeContainer />)
