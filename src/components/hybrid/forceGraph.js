import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components/macro'
import { NodeGroup } from 'react-move'
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
import { line, curveBasis } from 'd3-shape'

const G = styled.g`
  stroke: #ffffff;
  stroke-width: 1.5px;
`

const FloatRight = styled.div`
  float: right;
`

const getCurvedLinkPath = ({ source: { x: sx, y: sy }, target: { x: tx, y: ty } }) => {
  const offset = 50

  const midpoint_x = (sx + tx) / 2
  const midpoint_y = (sy + ty) / 2

  const dx = tx - sx
  const dy = ty - sy

  const normalise = Math.sqrt(dx * dx + dy * dy)

  const offSetX = midpoint_x + offset * (dy / normalise)
  const offSetY = midpoint_y - offset * (dx / normalise)

  return `M${sx},${sy}S${offSetX},${offSetY} ${tx},${ty}`
}

const getStraightLinkPath = ({ source: { x: sx, y: sy }, target: { x: tx, y: ty } }) =>
  `M${sx},${sy}L${tx},${ty}`

const getSmoothLinkPath = ({
  direction,
  source: { x: sx, y: sy, size: sr },
  target: { x: tx, y: ty, size: tr },
}) =>
  line().curve(curveBasis)([
    [sx, sy],
    [sx + Math.sin(direction) * sr * 2, sy + Math.cos(direction) * sr * 2],
    [tx + Math.sin(direction - Math.PI) * tr * 2, ty + Math.cos(direction - Math.PI) * tr * 2],
    [tx, ty],
  ])

const findName = (name) => ({ name: n }) => n === name

export const LINK_TYPES = {
  STRAIGHT: 'STRAIGHT',
  SMOOTH: 'SMOOTH',
  CURVED: 'CURVED',
}

export class HybirdForceGraph extends Component {
  state = { curSel: 'nix' }

  static propTypes = {
    data: PropTypes.array,
    links: PropTypes.array,
    width: PropTypes.number,
    height: PropTypes.number,
    linkType: PropTypes.oneOf(Object.keys(LINK_TYPES).map((key) => LINK_TYPES[key])),
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

  shouldComponentUpdate(nextProps) {
    return Object.keys(nextProps).some((key) => nextProps[key] !== this.props[key])
  }

  componentDidMount() {
    this.initSimulation()
  }

  componentDidUpdate() {
    this.refreshGraph()
  }

  getLinkPath = (d) => {
    switch (this.props.linkType) {
      case LINK_TYPES.CURVED:
        return getCurvedLinkPath(d)
      case LINK_TYPES.SMOOTH:
        return getSmoothLinkPath(d)
      default:
        return getStraightLinkPath(d)
    }
  }

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
      .alphaTarget(1)
      .on('tick', this.ticked)

    this.refreshGraph()
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

  refreshGraph = () => {
    const selection = select(this.ref)
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

    // the dragging should be handled by d3
    // position is a prop that is tracked by d3 NOT react
    select(this.ref)
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

  setRef = (ref) => (this.ref = ref)

  start = ({ size }) => ({
    r: size,
    fill: '#45b29d',
    timing: { duration: 750 },
  })

  update = ({ size }) => ({
    r: [size],
    fill: '#3a403d',
    timing: { duration: 750 },
  })

  leave = ({ name }) => {
    console.log('leaving', name)
    return {
      r: [0],
      fill: '#b26745',
      timing: { duration: 750 },
    }
  }

  render() {
    const { height, width, selNode } = this.props
    const { data, links } = this.state
    console.log('rerender force graph')
    return (
      <>
        <svg height={height} width={width}>
          <g transform={`translate(${width / 2},${height / 2})`}>
            <G ref={this.setRef}>
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
                      <circle key={key} id={key} onClick={this.logNode(key)} fill={fill} r={r} />
                    ))}
                  </>
                )}
              </NodeGroup>
            </G>
          </g>
        </svg>
        <FloatRight>
          <div>
            <div>SelectedNode:</div>
            <div>{selNode}</div>
            <div>---------------</div>
          </div>
          {data &&
            data.map(({ name }, idx) => (
              <div key={name}>
                [{idx}]: {name}
              </div>
            ))}
          <div>---------------</div>
          {links &&
            links.map(({ source: { name: s }, target: { name: t } }) => (
              <div key={s + t}>
                [{s}] -&gt; [{t}]
              </div>
            ))}
        </FloatRight>
      </>
    )
  }
}
