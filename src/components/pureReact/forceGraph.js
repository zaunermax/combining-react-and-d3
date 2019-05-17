import React, { Component, createRef } from 'react'
import PropTypes from 'prop-types'
import { LINK_TYPES, LinkTypePropType } from 'lib/d3/linkPath'
import {
  buildForceSimulation,
  getLinkPaths,
  getNodePositions,
  linkId,
  nodeId,
  SIMULATION_TYPE,
} from 'lib/d3/forcePure'
import { shallowCompare } from 'lib/util/shallow'
import styled from 'styled-components/macro'
import { ForceLink } from 'components/pureReact/pureLink'

const Container = styled.span`
  position: relative;
  display: inline-block;
`

const G = styled.g`
  stroke: #ffffff;
  stroke-width: 1.5px;
`

export class PureReactForceGraph extends Component {
  state = {
    linkPositions: {},
    nodePositions: {},
  }

  static propTypes = {
    data: PropTypes.array,
    links: PropTypes.array,
    width: PropTypes.number,
    height: PropTypes.number,
    linkType: LinkTypePropType,
    selectNode: PropTypes.func,
    forceOptions: PropTypes.shape({
      radiusMultiplier: PropTypes.number,
    }),
  }

  static defaultProps = {
    mode: '',
    data: [],
    links: [],
    width: 500,
    height: 500,
    linkType: LINK_TYPES.STRAIGHT,
    forceOptions: {
      radiusMultiplier: 1.2,
    },
  }

  // Lifecycle

  constructor(props) {
    super(props)
    this.initSimulation()
    this.startSimulationTicks()
    this.linksRef = createRef()
    this.nodesRef = createRef()
    this.perf = performance.now()
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.handlePossibleSimulationUpdate(nextProps, nextState)
  }

  componentWillUnmount() {
    this.cancelSimulationTicks()
  }

  // Utility

  onSimulationTick = () => {
    this.frame = requestAnimationFrame(this.updatePositions)
  }

  startSimulationTicks = () => {
    this.simulation.on('tick', this.onSimulationTick)
  }

  cancelSimulationTicks = () => {
    this.simulation.on('tick', null)
    this.frame = this.frame && cancelAnimationFrame(this.frame)
  }

  getNodePosition = (node) => {
    return this.state.nodePositions[nodeId(node)]
  }

  getLinkPath = (link) => {
    return this.state.linkPositions[linkId(link)]
  }

  onEnd = () => {
    console.log('Pure react simulation has finished.', performance.now() - this.perf)
  }

  extractSimOptions = (overrideProps = null) => {
    const { nodesRef, props } = this
    const { data: nodes, links, forceOptions } = overrideProps || props
    return {
      nodes: nodes || [],
      links: links || [],
      nodesRef,
      endHandler: this.onEnd,
      ...forceOptions,
    }
  }

  extractSimUpdateParams = (overrideProps = null) => ({
    simulation: this.simulation,
    options: this.extractSimOptions(overrideProps),
  })

  // Simulation

  initSimulation = () => {
    const { simulation, updateSimulation } = buildForceSimulation({
      type: SIMULATION_TYPE.PURE_REACT,
      ...this.extractSimOptions(),
    })
    this.updateSimulation = updateSimulation
    this.simulation = simulation
  }

  handlePossibleSimulationUpdate = (nextProps, nextState) => {
    const propsChanged = shallowCompare(this.props, nextProps)
    const stateChanged = shallowCompare(this.state, nextState)
    const shouldUpdate = propsChanged || stateChanged
    propsChanged && this.handleSimulationUpdate(nextProps)
    return shouldUpdate
  }

  handleSimulationUpdate = (overrideProps) =>
    this.updateSimulation(this.extractSimUpdateParams(overrideProps))

  updatePositions = () => {
    this.setState({
      linkPositions: getLinkPaths(this.simulation),
      nodePositions: getNodePositions(this.simulation),
    })
  }

  // Rendering

  render() {
    const { height, width, data: nodes, links } = this.props
    return (
      <Container>
        <svg height={height} width={width}>
          <G transform={`translate(${width / 2},${height / 2})`}>
            <g ref={this.linksRef} className={'links'}>
              {links &&
                links.map((link) => {
                  const path = this.getLinkPath(link)
                  return path && link ? (
                    <ForceLink key={linkId(link)} link={link} path={this.getLinkPath(link)} />
                  ) : null
                })}
            </g>
            <g ref={this.nodesRef} className={'nodes'}>
              {nodes &&
                nodes.map((node) => {
                  const pos = this.getNodePosition(node)
                  const id = nodeId(node)
                  return node && pos ? (
                    <circle id={id} r={node.size} fill={'#45b29d'} key={id} {...pos} />
                  ) : null
                })}
            </g>
          </G>
        </svg>
      </Container>
    )
  }
}
