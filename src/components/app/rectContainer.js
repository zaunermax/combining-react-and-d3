import React from 'react'
import { easeCubic } from 'd3-ease'
import { applyPropsToComponent } from 'lib/reactUtil'
import { HybridForceGraph } from 'components/hybrid/forceGraph'
import { GraphContainer } from 'components/app/stateContainer'

const getSize = (size) => size * 1.5

const rectTickHandler = (nodeSel) =>
  nodeSel
    .attr('x', ({ x, size }) => x - getSize(size) / 2)
    .attr('y', ({ y, size }) => y - getSize(size) / 2)

const rectNodeRenderer = ({ id, size, fill }) => (
  <rect
    className={'node'}
    id={id}
    key={id}
    width={getSize(size)}
    height={getSize(size)}
    fill={fill}
  />
)

const customLinkRenderer = ({ source: { id: s }, target: { id: t } }) => (
  <path key={s + t} id={s + t} stroke={'palevioletred'} fill={'none'} />
)

const animateStart = ({ size }) => ({
  size: [size],
  fill: 'palevioletred',
  timing: { duration: 1500 },
})

const animationUpdate = ({ size }) => ({
  size: [size],
  fill: '#f27670',
  timing: { duration: 1500 },
})

const animationLeave = () => ({
  size: [0],
  fill: '#d16be8',
  timing: { duration: 1500, ease: easeCubic },
})

const keyAccessor = ({ id }) => id

const RectangleGraph = applyPropsToComponent({
  nodeTickHandler: rectTickHandler,
  renderNode: rectNodeRenderer,
  renderLink: customLinkRenderer,
  forceOptions: { radiusMultiplier: 1.5 },
  animation: { start: animateStart, update: animationUpdate, leave: animationLeave, keyAccessor },
})(HybridForceGraph)

export const RectContainer = () => <GraphContainer component={RectangleGraph} />
