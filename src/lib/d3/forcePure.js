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
import { event, select } from 'd3-selection'
import { getCurvedLinkPath } from 'lib/d3/linkPath'
import { pipe, switchCase } from 'lib/fpUtil'

const onDragStarted = (simulation) => (d) => {
  simulation.alpha(0.3).restart()
  d.fx = d.x
  d.fy = d.y
}

const onDrag = (simulation) => (d) => {
  simulation.alpha(0.3).restart()
  d.fx = event.x
  d.fy = event.y
}

const onDragEnded = (simulation) => (d) => {
  simulation.alpha(1).restart()
  simulation.alphaMin(0.001)
  d.fx = null
  d.fy = null
}

// -------------- Util -------------- //

export const nodeId = ({ index }) => index

export const linkId = (link) => {
  const { source, target } = link
  const sourceId = source.index || source
  const targetId = target.index || target
  return `${sourceId}=>${targetId}`
}

const calcLinkDist = ({ source: { size: s }, target: { size: t } }) => (s > t ? s + 10 : t + 10)

// apply functions do not have to return args anymore
const applyArgs = (fn) => (args) => {
  console.log('ARGS:', args)
  fn(args)
  return args
}

// apply the arg returning function to all appliers that get passed into the pipe operator
const pipeAppliers = (...fns) => pipe(...fns.map(applyArgs))

// -------------- Apply Options -------------- //

const applyGeneralForce = ({ simulation }) => {
  if (!simulation.force('center')) {
    simulation
      .force('center', forceCenter())
      .force('charge', forceManyBody().strength(-150))
      .force('forceX', forceX().strength(0.1))
      .force('forceY', forceY().strength(0.1))
  }
}

const applyCollisionForce = ({ simulation, options: { radiusMultiplier, strength } }) => {
  if (!simulation.force('collide')) simulation.force('collide', forceCollide())

  if (radiusMultiplier && simulation.radiusMultiplier !== radiusMultiplier) {
    simulation.radiusMultiplier = radiusMultiplier
    simulation.force('collide').radius(({ size }) => size * radiusMultiplier)
  }

  if (!simulation.strength) simulation.strength = {}

  if (strength && simulation.strength.collide !== strength) {
    simulation.strength.collide = strength
    simulation.force('collide').strength(strength)
  }
}

const applyNewNodes = ({ simulation, options: { nodes } }) => simulation.nodes(nodes)

const applyLinkForce = ({ simulation, options: { links } }) => {
  if (!simulation.force('link')) {
    const fLink = forceLink()
    fLink.distance(250)
    fLink.strength(0.1)
    fLink.distance(calcLinkDist)
    fLink.id(nodeId)
    simulation.force('link', fLink)
  }

  simulation.force('link').links(links)
}

const applySimulationReheating = ({ simulation }) => {
  simulation.alpha(1).restart()
  simulation.alphaMin(0.001)
}

const applyNewRefs = (simulation, { ref }) => {
  const selection = select(ref.current)
  simulation.nodeSel = selection.selectAll('circle')
  simulation.linkSel = selection.selectAll('path')
}

const applyTickHandler = (simulation, { tickHandler }) => {
  simulation.on('tick', tickHandler)
}

// -------------- Simulation -------------- //

export const SIMULATION_TYPE = {
  PURE_REACT: 'pureReact',
  PURE_D3: 'pureD3',
  REACT_D3_HYBRID: 'reactD3Hybrid',
}

const pureD3Updater = pipeAppliers(
  applyGeneralForce,
  applyNewNodes,
  applyLinkForce,
  applyCollisionForce,
  applySimulationReheating,
)

const hybridUpdater = pipeAppliers(
  applyNewNodes,
  applyNewRefs,
  applyTickHandler,
  applyGeneralForce,
  applyLinkForce,
  applyCollisionForce,
  applySimulationReheating,
)

const getUpdaterFunction = switchCase({
  [SIMULATION_TYPE.PURE_REACT]: pureD3Updater,
  [SIMULATION_TYPE.REACT_D3_HYBRID]: hybridUpdater,
})(null)

export const buildForceSimulation = (options) => {
  const simulation = forceSimulation()
  const updateSimulation = getUpdaterFunction(options.type)
  updateSimulation({ simulation, options })
  return { simulation, updateSimulation }
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
