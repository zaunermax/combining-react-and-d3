import { drag } from 'd3-drag'
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
} from 'd3-force'
import { event } from 'd3-selection'
import { getCurvedLinkPath } from 'lib/d3/linkPath'

const onDragStarted = (d) => {
  d.fx = d.x
  d.fy = d.y
}

const onDrag = (d) => {
  d.fx = event.x
  d.fy = event.y
}

const onDragEnded = (d) => {
  d.fx = null
  d.fy = null
}

const applyGeneralForce = (simulation) => {
  if (!simulation.force('center')) {
    simulation
      .force('center', forceCenter())
      .force('charge', forceManyBody().strength(-150))
      .force('forceX', forceX().strength(0.1))
      .force('forceY', forceY().strength(0.1))
  }
}

const applyAlpha = (simulation) => {
  simulation.alphaTarget(1)
}

const applyCollisionForce = (simulation, { radiusMultiplier = 1.5, strength = 1 }) => {
  if (!simulation.force('collide')) simulation.force('collide', forceCollide())

  if (simulation.radiusMultiplier !== radiusMultiplier) {
    simulation.radiusMultiplier = radiusMultiplier
    simulation.force('collide').radius(({ size }) => size * radiusMultiplier)
  }

  if (simulation.strength.collide !== strength) {
    simulation.strength.collide = strength
    simulation.force('collide').strength(strength)
  }
}

const applyNewNodes = (simulation, { nodes }) => {
  simulation.nodes(nodes)
}

const applyLinkForce = (simulation, { links }) => {
  if (!simulation.force('link')) {
    const fLink = forceLink()
    fLink.distance(250)
    fLink.id(nodeId)
    simulation.force('link', fLink)
  }

  simulation.force('link').links(links)
}

export const nodeId = ({ index }) => index

export const linkId = (link) => {
  const { source, target } = link
  const sourceId = source.id || source
  const targetId = target.id || target
  return `${sourceId}=>${targetId}`
}

export const buildForceSimulation = (options) => {
  const simulation = forceSimulation()
  simulation.strength = {}
  return updateSimulation(simulation, options)
}

export const updateSimulation = (simulation, options = {}) => {
  applyAlpha(simulation, options)
  applyGeneralForce(simulation, options)
  applyNewNodes(simulation, options)
  applyLinkForce(simulation, options)
  applyCollisionForce(simulation, options)
  return simulation
}

export const updateDragAndDrop = (nodeSel) => {
  nodeSel.call(
    drag()
      .on('start', onDragStarted)
      .on('drag', onDrag)
      .on('end', onDragEnded),
  )
}

export const getNodePositions = (simulation) =>
  simulation.nodes().reduce(
    (obj, node) =>
      Object.assign(obj, {
        [nodeId(node)]: {
          cx: node.fx || node.x,
          cy: node.fy || node.y,
        },
      }),
    {},
  )

export const getLinkPaths = (simulation) =>
  simulation
    .force('link')
    .links()
    .reduce(
      (obj, link) =>
        Object.assign(obj, {
          [linkId(link)]: getCurvedLinkPath(link),
        }),
      {},
    )
