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
import { getCurvedLinkPath, LINK_TYPES, LinkTypePropType } from 'lib/d3/linkPath'
import { noop, pipe, switchCase } from 'lib/fpUtil'
import PropTypes from 'prop-types'

export const ForceGraphProps = Object.freeze({
  data: PropTypes.array,
  links: PropTypes.array,
  width: PropTypes.number,
  height: PropTypes.number,
  linkType: LinkTypePropType,
  selNode: PropTypes.string,
  selectNode: PropTypes.func,
  onSimulationStart: PropTypes.func,
  onSimulationEnd: PropTypes.func,
})

export const ForceGraphDefaultProps = Object.freeze({
  data: [],
  links: [],
  width: 500,
  height: 500,
  onSimulationStart: noop,
  onSimulationEnd: noop,
  linkType: LINK_TYPES.CURVED,
  forceOptions: {
    radiusMultiplier: 1.2,
  },
})

export const SIMULATION_TYPE = Object.freeze({
  PURE_REACT: 'pureReact',
  PURE_D3: 'pureD3',
  REACT_D3_HYBRID: 'reactD3Hybrid',
})

// -------------- Util -------------- //

const findName = (name) => ({ name: n }) => n === name

export const encapsulateOutsideData = ({ data, links }, { data: stateData = [] }) => {
  const newData = data.map(({ name, size }) => {
    const existing = stateData.find(({ name: n }) => name === n)
    return existing ? Object.assign(existing, { size }) : { name, size }
  })

  const newLinks = links
    ? links.map(({ source: { name: sName }, target: { name: tName } }) => {
        const source = newData.find(findName(sName))
        const target = newData.find(findName(tName))
        return { source, target }
      })
    : []

  return { data: newData, links: newLinks }
}

export const nodeId = ({ index }) => index

export const linkId = (link) => {
  const { source, target } = link
  const sourceId = source.index || source
  const targetId = target.index || target
  return `${sourceId}=>${targetId}`
}

const calcLinkDist = ({ source: { size: s }, target: { size: t } }) => (s > t ? s + 10 : t + 10)

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

const onDragStarted = (simulation) => (d) => {
  simulation.alpha(simulation.alpha()).restart()
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

// apply functions do not have to return args anymore
const applyArgs = (fn) => (args) => {
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

const applyNewNodeData = ({ simulation, options: { nodes } }) => simulation.nodes(nodes)

const applyLinkForce = ({ simulation, options: { links } }) => {
  if (!simulation.force('link')) {
    const fLink = forceLink()
    fLink.distance(250)
    fLink.strength(0.2)
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

const applyNewRefs = ({ simulation, options: { ref } }) => {
  const selection = select(ref.current)
  simulation.nodeSel = selection.selectAll('circle')
  simulation.linkSel = selection.selectAll('path')
}

const applyTickHandler = ({ simulation, options: { tickHandler } }) => {
  simulation.on('tick', tickHandler)
}

const applyDragHandlers = ({ simulation }) => {
  simulation.nodeSel.call(
    drag()
      .on('start', onDragStarted(simulation))
      .on('drag', onDrag(simulation))
      .on('end', onDragEnded(simulation)),
  )
}

const applyOnEndHandler = ({ simulation, options: { endHandler } }) => {
  simulation.on('end', endHandler)
}

const initialSelect = (simulation, { ref }) => {
  const selection = select(ref).select('g')

  simulation.linkSel = selection.selectAll('path')
  simulation.nodeSel = selection.selectAll('.node')
}

const applyUpdatePattern = (simulation, { nodes, links }) => {
  simulation.nodeSel = simulation.nodeSel.data(nodes, ({ name }) => name)
  simulation.linkSel = simulation.linkSel.data(
    links,
    ({ source: { name: s }, target: { name: t } }) => s + t,
  )
}

const applyPureD3Selection = ({ simulation, options }) => {
  !options.update && initialSelect(simulation, options)
  applyUpdatePattern(simulation, options)
}

// -------------- Simulation -------------- //

const pureD3Updater = pipeAppliers(
  applyNewNodeData,
  applyPureD3Selection,
  applyTickHandler,
  applyGeneralForce,
  applyLinkForce,
  applyCollisionForce,
  applyDragHandlers,
  applyOnEndHandler,
  applySimulationReheating,
)

const hybridUpdater = pipeAppliers(
  applyNewNodeData,
  applyNewRefs,
  applyTickHandler,
  applyGeneralForce,
  applyLinkForce,
  applyCollisionForce,
  applyDragHandlers,
  applyOnEndHandler,
  applySimulationReheating,
)

const pureReactUpdater = pipeAppliers(
  applyGeneralForce,
  applyNewNodeData,
  applyLinkForce,
  applyCollisionForce,
  applyOnEndHandler,
  applySimulationReheating,
)

const getUpdaterFunction = switchCase({
  [SIMULATION_TYPE.PURE_D3]: pureD3Updater,
  [SIMULATION_TYPE.REACT_D3_HYBRID]: hybridUpdater,
  [SIMULATION_TYPE.PURE_REACT]: pureReactUpdater,
})(null)

export const buildForceSimulation = (options) => {
  const simulation = forceSimulation()
  const updateSimulation = getUpdaterFunction(options.type)
  updateSimulation({ simulation, options })
  return { simulation, updateSimulation }
}
