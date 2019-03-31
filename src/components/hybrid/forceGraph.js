import React, { Component, createRef } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components/macro'
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
} from 'd3-force'
import { select, event } from 'd3-selection'
import { drag } from 'd3-drag'
import { NodeGroup } from 'components/app/reactMove'
import { easeCubic } from 'd3-ease'
import {
  getCurvedLinkPath,
  getStraightLinkPath,
  LINK_TYPES,
  LinkTypePropType,
} from 'lib/d3/linkPath'

const ANIMATION_DURATION = 750

const G = styled.g`
  stroke: #ffffff;
  stroke-width: 1.5px;
`

const Container = styled.span`
  position: relative;
  display: inline-block;
`

const findName = (name) => ({ name: n }) => n === name

export class HybridForceGraph extends Component {
  state = { curSel: 'nix' }

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

  constructor(props) {
    super(props)
    this.ref = createRef()
  }

  // TODO: create a hoc out of this
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

  shouldComponentUpdate(nextProps, nextState) {
    return (
      Object.keys(nextProps).some((key) => nextProps[key] !== this.props[key]) ||
      Object.keys(nextState).some((key) => nextState[key] !== this.state[key])
    )
  }

  componentDidMount() {
    this.initSimulation()
  }

  componentDidUpdate() {
    this.refreshGraph()
  }

  getLinkPath = (d) =>
    this.props.linkType === LINK_TYPES.CURVED ? getCurvedLinkPath(d) : getStraightLinkPath(d)

  ticked = () => {
    const { links, data } = this.state

    this.nodeSel
      .data(data, function(d) {
        return d ? d.name : this.id
      })
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y)

    links &&
      this.linkSel
        .data(links, function(d) {
          return d ? d.source.name + d.target.name : this.id
        })
        .attr('d', this.getLinkPath)
  }

  initSimulation = () => {
    this.simulation = forceSimulation()
      .force('charge', forceManyBody().strength(-150))
      .force('forceX', forceX().strength(0.1))
      .force('forceY', forceY().strength(0.1))
      .force('center', forceCenter())
      .on('tick', this.ticked)

    this.refreshGraph()
  }

  onDragStarted = (d) => {
    this.simulation.alpha(0.3).restart()
    d.fx = d.x
    d.fy = d.y
  }

  onDrag = (d) => {
    this.simulation.alpha(0.3).restart()
    d.fx = event.x
    d.fy = event.y
  }

  onDragEnded = (d) => {
    this.simulation.alpha(0.3).restart()
    this.simulation.alphaMin(0.001)
    d.fx = null
    d.fy = null
  }

  refreshGraph = () => {
    const selection = select(this.ref.current)

    this.nodeSel = selection.selectAll('circle')
    this.linkSel = selection.selectAll('path')

    this.simulation
      .nodes(this.state.data)
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

    this.simulation.alpha(1).restart()
    this.simulation.alphaMin(0.001)

    // the dragging should be handled by d3
    // position is a prop that is tracked by d3 NOT react
    select(this.ref.current)
      .selectAll('circle')
      .call(
        drag()
          .on('start', this.onDragStarted)
          .on('drag', this.onDrag)
          .on('end', this.onDragEnded),
      )
  }

  logNode = (name) => () => {
    const { selectNode } = this.props
    selectNode(name)
    console.log('name', name)
  }

  start = ({ size }) => ({
    r: size,
    fill: '#45b29d',
    timing: { duration: ANIMATION_DURATION },
  })

  update = ({ size }) => ({
    r: [size],
    fill: '#3a403d',
    timing: { duration: ANIMATION_DURATION },
  })

  leave = () => ({
    r: [0],
    fill: '#b26745',
    timing: { duration: ANIMATION_DURATION, ease: easeCubic },
  })

  render() {
    const { height, width, selNode } = this.props
    const { data, links } = this.state

    return (
      <Container>
        <svg height={height} width={width}>
          <G ref={this.ref} transform={`translate(${width / 2},${height / 2})`}>
            {links &&
              links.map(({ source: { name: s }, target: { name: t } }) => (
                <path key={s + t} id={s + t} stroke={'#45b29d'} fill={'none'} />
              ))}
            <NodeGroup
              data={data}
              keyAccessor={(d) => d.name}
              start={this.start}
              update={this.update}
              leave={this.leave}
            >
              {(nodes) => (
                <>
                  {nodes.map(({ key, state: { fill, r } }) => (
                    <circle
                      key={key}
                      id={key}
                      onClick={this.logNode(key)}
                      fill={key === selNode ? 'red' : fill}
                      r={r}
                    />
                  ))}
                </>
              )}
            </NodeGroup>
          </G>
        </svg>
      </Container>
    )
  }
}
