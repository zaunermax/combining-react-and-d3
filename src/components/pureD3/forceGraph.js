import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { forceManyBody, forceX, forceY, forceCenter, forceSimulation, forceCollide } from 'd3-force'
import { select } from 'd3-selection'
import { transition } from 'd3-transition'

const findName = (name) => ({ name: n }) => n === name

export class PureD3ForceGraph extends Component {
  state = {}

  static propTypes = {
    data: PropTypes.array,
    width: PropTypes.number,
    height: PropTypes.number,
  }

  static defaultProps = {
    data: [],
    width: 500,
    height: 500,
  }

  componentDidMount() {
    this.initGraph()
  }

  // I added this to prevent the outside data from being mutated
  static getDerivedStateFromProps({ data, links }, { data: stateData }) {
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

  componentDidUpdate({ width, height }) {
    const { width: newWidth, height: newHeight } = this.props
    if (width !== newWidth || height !== newHeight) this.updateDimensions()
    this.updateGraph()
  }

  updateDimensions = () => {
    const { height, width } = this.props
    select(this.ref)
      .select('g')
      .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')
  }

  ticked = () => {
    this.node.attr('cx', ({ x }) => x).attr('cy', ({ y }) => y)
  }

  initGraph = () => {
    const { width, height } = this.props
    const { data } = this.state

    // save the simulation in component so it is updatable
    this.simulation = forceSimulation(data)
      .force('charge', forceManyBody().strength(-150))
      .force('forceX', forceX().strength(0.1))
      .force('forceY', forceY().strength(0.1))
      .force('center', forceCenter())
      .alphaTarget(1)
      .on('tick', this.ticked)

    let svg = select(this.ref)

    let g = svg.append('g').attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')

    this.node = g
      .append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('.node')

    this.updateGraph()
  }

  updateGraph = () => {
    const { data } = this.state

    // transition
    let t = transition().duration(750)
    // Apply the general update pattern to the nodes.
    this.node = this.node.data(data, ({ name }) => name)

    this.node
      .exit()
      .style('fill', '#b26745')
      .transition(t)
      .attr('r', 1e-6)
      .remove()

    this.node
      .transition(t)
      .style('fill', '#3a403d')
      .attr('r', ({ size }) => size)

    this.node = this.node
      .enter()
      .append('circle')
      .style('fill', '#45b29d')
      .attr('r', ({ size }) => size)
      .merge(this.node)

    // Update and restart the simulation.
    this.simulation.nodes(data).force(
      'collide',
      forceCollide()
        .strength(1)
        .radius(({ size }) => size + 10)
        .iterations(1),
    )
  }

  setRef = (ref) => (this.ref = ref)

  render() {
    const { width, height } = this.props
    return <svg ref={this.setRef} width={width} height={height} />
  }
}
