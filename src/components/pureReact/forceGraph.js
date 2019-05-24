import React, { Component } from 'react'
import {
  buildForceSimulation,
  ForceGraphDefaultProps,
  ForceGraphProps,
  getLinkPaths,
  getNodePositions,
  SIMULATION_TYPE,
} from 'lib/d3/force'
import { shallowCompare } from 'lib/util/shallow'
import { Nodes } from 'components/pureReact/nodes'
import { Links } from 'components/pureReact/links'

const gStyle = {
  stroke: '#ffffff',
  strokeWidth: '1.5px',
}

const containerStyle = {
  display: 'inline-block',
}

export class PureReactForceGraph extends Component {
  static propTypes = {
    ...ForceGraphProps,
  }

  static defaultProps = {
    ...ForceGraphDefaultProps,
  }

  static displayName = 'PureReactForceGraph'

  // Lifecycle

  constructor(props) {
    super(props)
    this.initSimulation()
    this.startSimulationTicks()
    this.state = {
      linkPositions: {},
      nodePositions: {},
    }
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

  onEnd = () => {
    this.props.onSimulationEnd()
  }

  extractSimOptions = (overrideProps = null) => {
    const { nodesRef, props } = this
    const { nodes, links, forceOptions } = overrideProps || props
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
    this.props.onSimulationStart()
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
    const { height, width, nodes, links } = this.props
    const { linkPositions, nodePositions } = this.state

    return (
      <span style={containerStyle}>
        <svg height={height} width={width}>
          <g style={gStyle} transform={`translate(${width / 2},${height / 2})`}>
            <Links links={links} linkPositions={linkPositions} />
            <Nodes nodes={nodes} nodePositions={nodePositions} />
          </g>
        </svg>
      </span>
    )
  }
}
