import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  forceManyBody,
  forceX,
  forceY,
  forceCenter,
  forceSimulation,
  forceCollide,
  forceLink,
} from 'd3-force'
import { event, select } from 'd3-selection'
import { transition } from 'd3-transition'
import { drag } from 'd3-drag'
import {
  getCurvedLinkPath,
  getStraightLinkPath,
  LINK_TYPES,
  LinkTypePropType,
} from 'lib/d3/linkPath'
import { encapsulateOutsideData } from 'lib/d3/forcePure'

export class PureD3ForceGraph extends Component {
  state = {}

  static propTypes = {
    data: PropTypes.array,
    links: PropTypes.array,
    width: PropTypes.number,
    height: PropTypes.number,
    linkType: LinkTypePropType,
    selNode: PropTypes.string,
    selectNode: PropTypes.func,
  }

  static defaultProps = {
    data: [],
    links: [],
    width: 500,
    height: 500,
    linkType: LINK_TYPES.STRAIGHT,
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

  updateDimensions = () => {
    const { height, width } = this.props
    select(this.ref)
      .select('g')
      .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')
  }

  ticked = () => {
    this.node.attr('cx', ({ x }) => x).attr('cy', ({ y }) => y)
    this.link.attr('d', (d) =>
      this.props.linkType === LINK_TYPES.CURVED ? getCurvedLinkPath(d) : getStraightLinkPath(d),
    )
  }

  onDragStarted = (d) => {
    d.fx = d.x
    d.fy = d.y
  }

  onDrag = (d) => {
    d.fx = event.x
    d.fy = event.y
  }

  onDragEnded = (d) => {
    d.fx = null
    d.fy = null
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

    this.link = g.append('g').selectAll('path')
    this.node = g.append('g').selectAll('.node')

    this.updateGraph()
  }

  updateGraph = () => {
    const { data, links } = this.state

    // transition
    let t = transition().duration(750)
    // Apply the general update pattern to the nodes.
    this.node = this.node.data(data, ({ name }) => name)
    this.link = this.link.data(links, ({ source: { name: s }, target: { name: t } }) => s + t)

    this.link.exit().remove()

    this.link = this.link
      .enter()
      .append('path')
      .attr('stroke', '#45b29d')
      .attr('fill', 'none')
      .attr('id', ({ source: { name: s }, target: { name: t } }) => s + t)
      .merge(this.link)

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
      .attr('id', ({ name }) => name)
      .merge(this.node)

    // Update and restart the simulation.
    this.simulation
      .nodes(data)
      .force(
        'collide',
        forceCollide()
          .strength(1)
          .radius(({ size }) => size + 10)
          .iterations(1),
      )
      .force(
        'link',
        forceLink(this.state.links)
          .distance(({ source: { size: s }, target: { size: t } }) => (s > t ? s + 10 : t + 10))
          .strength(0.1)
          .id((d) => d.name),
      )

    this.node.call(
      drag()
        .on('start', this.onDragStarted)
        .on('drag', this.onDrag)
        .on('end', this.onDragEnded),
    )
  }

  setRef = (ref) => (this.ref = ref)

  render() {
    const { width, height } = this.props
    return <svg ref={this.setRef} width={width} height={height} />
  }
}
