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
  nodes: PropTypes.array,
  links: PropTypes.array,
  width: PropTypes.number,
  height: PropTypes.number,
  linkType: LinkTypePropType,
  selNode: PropTypes.string,
  selectNode: PropTypes.func,
  onSimulationStart: PropTypes.func,
  onSimulationEnd: PropTypes.func,
  forceOptions: PropTypes.shape({
    radiusMultiplier: PropTypes.number,
    strength: PropTypes.number,
    linkStrength: PropTypes.number,
    linkDistance: PropTypes.number,
  }),
})

export const ForceGraphDefaultProps = Object.freeze({
  nodes: [],
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

const findId = (id) => ({ id: n }) => n === id

export const encapsulateOutsideData = ({ nodes, links }, { nodes: stateNodes = [] }) => {
  const newNodes = nodes.map(({ id, ...rest }) => {
    const existing = stateNodes.find(({ id: n }) => id === n)
    return existing ? Object.assign(existing, { ...rest }) : { id, ...rest }
  })

  const newLinks = links
    ? links.map(({ source: { id: sId }, target: { id: tId } }) => {
        const source = newNodes.find(findId(sId))
        const target = newNodes.find(findId(tId))
        return { source, target }
      })
    : []

  return { nodes: newNodes, links: newLinks }
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
  simulation.alphaTarget(0.5).restart()
  d.fx = d.x
  d.fy = d.y
}

const onDrag = () => (d) => {
  d.fx = event.x
  d.fy = event.y
}

const onDragEnded = (simulation, { reheatAlpha }) => (d) => {
  simulation.alphaTarget(0).restart()
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

const applyLinkForce = ({ simulation, options: { links, linkStrength, linkDistance } }) => {
  if (!simulation.force('link')) {
    const fLink = forceLink()
    fLink.distance(linkDistance || 250)
    fLink.strength(linkStrength || 0.2)
    fLink.distance(calcLinkDist)
    fLink.id(nodeId)
    simulation.force('link', fLink)
  }

  simulation.force('link').links(links)
}

const applySimulationReheating = ({ simulation, options: { reheatAlpha } }) => {
  simulation.alpha(reheatAlpha || 1).restart()
  simulation.alphaMin(0.001)
}

const applyNewRefs = ({ simulation, options: { ref } }) => {
  const selection = select(ref.current)
  simulation.nodeSel = selection.selectAll('.node')
  simulation.linkSel = selection.selectAll('path')
}

const applyTickHandler = ({ simulation, options: { tickHandler } }) => {
  simulation.on('tick', tickHandler)
}

const applyDragHandlers = ({ simulation, options }) => {
  simulation.nodeSel.call(
    drag()
      .on('start', onDragStarted(simulation, options))
      .on('drag', onDrag(simulation, options))
      .on('end', onDragEnded(simulation, options)),
  )
}

const applyOnEndHandler = ({ simulation, options: { endHandler } }) => {
  simulation.on('end', endHandler)
}

const initialSelect = (simulation, { ref }) => {
  const selection = select(ref.current).select('g')

  simulation.linkSel = selection.append('g').selectAll('path')
  simulation.nodeSel = selection.append('g').selectAll('.node')
}

const applyUpdatePattern = ({ simulation, options: { nodes, links } }) => {
  simulation.nodeSel = simulation.nodeSel.data(nodes, function(d) {
    return d ? d.id : this.id
  })
  simulation.linkSel = simulation.linkSel.data(links, function(d) {
    return d ? d.source.id + d.target.id : this.id
  })
}

const applyPureD3Selection = ({ simulation, options }) => {
  !options.update && initialSelect(simulation, options)
  applyUpdatePattern({ simulation, options })
  options.nodeUpdateCycle(simulation)
}

// -------------- Simulation -------------- //

const applyForceHandlers = pipeAppliers(applyGeneralForce, applyLinkForce, applyCollisionForce)
const applyEndHandlers = pipeAppliers(applyOnEndHandler, applySimulationReheating)

const pureD3Updater = pipeAppliers(
  applyNewNodeData,
  applyPureD3Selection,
  applyTickHandler,
  applyForceHandlers,
  applyDragHandlers,
  applyEndHandlers,
)

const hybridUpdater = pipeAppliers(
  applyNewNodeData,
  applyNewRefs,
  applyUpdatePattern,
  applyTickHandler,
  applyForceHandlers,
  applyDragHandlers,
  applyEndHandlers,
)

const pureReactUpdater = pipeAppliers(applyNewNodeData, applyForceHandlers, applyEndHandlers)

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
