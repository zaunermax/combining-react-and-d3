import React, { Component } from 'react'
import { select } from 'd3-selection'
import { transition } from 'd3-transition'
import { getCurvedLinkPath, getStraightLinkPath, LINK_TYPES } from 'lib/d3/linkPath'
import {
  buildForceSimulation,
  encapsulateOutsideData,
  ForceGraphDefaultProps,
  ForceGraphProps,
  SIMULATION_TYPE,
} from 'lib/d3/forcePure'

export class PureD3ForceGraph extends Component {
  static propTypes = {
    ...ForceGraphProps,
  }

  static defaultProps = {
    ...ForceGraphDefaultProps,
  }

  constructor(props) {
    super(props)
    this.state = {}
  }

  componentDidMount() {
    this.initGraph()
  }

  // I added this to prevent the outside data from being mutated
  static getDerivedStateFromProps(props, state) {
    return encapsulateOutsideData(props, state)
  }

  componentDidUpdate({ width, height }) {
    const { width: newWidth, height: newHeight } = this.props
    if (width !== newWidth || height !== newHeight) this.updateDimensions()
    this.updateGraph()
  }

  extractSimOptions = (additional = {}) => {
    const { forceOptions } = this.props
    const { data: nodes, links } = this.state
    return {
      ...forceOptions,
      ...additional,
      nodes: nodes || [],
      links: links || [],
      tickHandler: this.ticked,
      endHandler: this.onEnd,
      ref: this.ref,
    }
  }

  extractSimUpdateOptions = () => ({
    simulation: this.simulation,
    options: this.extractSimOptions({ update: true }),
  })

  updateDimensions = () => {
    const { height, width } = this.props
    select(this.ref)
      .select('g')
      .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')
  }

  ticked = () => {
    this.simulation.nodeSel.attr('cx', ({ x }) => x).attr('cy', ({ y }) => y)
    this.simulation.linkSel.attr('d', (d) =>
      this.props.linkType === LINK_TYPES.CURVED ? getCurvedLinkPath(d) : getStraightLinkPath(d),
    )
  }

  onEnd = () => {
    this.props.onSimulationEnd()
  }

  initGraph = () => {
    const { width, height, onSimulationStart } = this.props

    onSimulationStart()

    const svg = select(this.ref)
    svg.append('g').attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')

    const simOptions = this.extractSimOptions()
    const { simulation, updateSimulation } = buildForceSimulation({
      type: SIMULATION_TYPE.PURE_D3,
      ...simOptions,
    })

    this.simulation = simulation
    this.updateSimulation = updateSimulation

    this.updateGraph(true)
  }

  updateGraph = (omitUpdateCall = false) => {
    !omitUpdateCall && this.updateSimulation(this.extractSimUpdateOptions())

    // transition
    let t = transition().duration(750)

    this.simulation.linkSel.exit().remove()

    this.simulation.linkSel = this.simulation.linkSel
      .enter()
      .append('path')
      .attr('stroke', '#45b29d')
      .attr('fill', 'none')
      .attr('id', ({ source: { name: s }, target: { name: t } }) => s + t)
      .merge(this.simulation.linkSel)

    this.simulation.nodeSel
      .exit()
      .style('fill', '#b26745')
      .transition(t)
      .attr('r', 1e-6)
      .remove()

    this.simulation.nodeSel
      .transition(t)
      .style('fill', '#3a403d')
      .attr('r', ({ size }) => size)

    this.simulation.nodeSel = this.simulation.nodeSel
      .enter()
      .append('circle')
      .style('fill', '#45b29d')
      .attr('r', ({ size }) => size)
      .attr('id', ({ name }) => name)
      .merge(this.simulation.nodeSel)
  }

  setRef = (ref) => (this.ref = ref)

  render() {
    console.log('I only render once!')
    const { width, height } = this.props
    return <svg ref={this.setRef} width={width} height={height} />
  }
}
