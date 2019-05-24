import { applyPropsToComponent } from 'lib/reactUtil'
import { HybridForceGraph } from 'components/hybrid/forceGraph'
import React from 'react'
import { GraphContainer } from 'components/app/stateContainer'

const groupTickHandler = (nodeSel) =>
  nodeSel.attr('transform', ({ x, y }) => `translate(${x},${y})`)

const groupNodeRenderer = ({ id, size }) => (
  <g id={id} key={id} className={'node'}>
    <circle r={size} fill={'lightblue'} />
    <circle r={size - 5} fill={'pink'} />
    <circle r={size - 10} fill={'palevioletred'} />
  </g>
)

const GroupRender = applyPropsToComponent({
  nodeTickHandler: groupTickHandler,
  renderNode: groupNodeRenderer,
  animation: null,
})(HybridForceGraph)

export const GroupContainer = () => <GraphContainer component={GroupRender} />
