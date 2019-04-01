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
import { buildForceSimulation, SIMULATION_TYPE } from 'lib/d3/forcePure'
import { shallowCompare } from 'lib/util/shallow'

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
    const propsChanged = shallowCompare(this.props, nextProps)
    const stateChanged = shallowCompare(this.state, nextState)
    const updateParams = this.extractSimUpdateParams(nextProps)
    propsChanged && this.updateSimulation(updateParams)
    return propsChanged || stateChanged
  }

  componentDidMount() {
    debugger
    this.initSimulation()
  }

  getLinkPath = (d) =>
    this.props.linkType === LINK_TYPES.CURVED ? getCurvedLinkPath(d) : getStraightLinkPath(d)

  ticked = () => {
    const { links, data } = this.state

    this.simulation.nodeSel
      .data(data, function(d) {
        return d ? d.name : this.id
      })
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y)

    links &&
      this.simulation.linkSel
        .data(links, function(d) {
          return d ? d.source.name + d.target.name : this.id
        })
        .attr('d', this.getLinkPath)
  }

  extractSimOptions = (overrideProps = null) => {
    const { data: nodes, links, forceOptions } = overrideProps || this.props
    return {
      ...forceOptions,
      nodes: nodes || [],
      links: links || [],
      tickHandler: this.ticked,
      ref: this.ref,
    }
  }

  extractSimUpdateParams = (overrideProps = null) => ({
    simulation: this.simulation,
    options: this.extractSimOptions(overrideProps),
  })

  initSimulation = () => {
    const simOptions = this.extractSimOptions()
    const { simulation, updateSimulation } = buildForceSimulation({
      type: SIMULATION_TYPE.REACT_D3_HYBRID,
      ...simOptions,
    })
    this.simulation = simulation
    this.updateSimulation = updateSimulation
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
