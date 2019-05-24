import React, { Component, createRef } from 'react'
import styled from 'styled-components/macro'
import { getCurvedLinkPath, getStraightLinkPath, LINK_TYPES } from 'lib/d3/linkPath'
import {
  buildForceSimulation,
  encapsulateOutsideData,
  ForceGraphDefaultProps,
  ForceGraphProps,
  SIMULATION_TYPE,
} from 'lib/d3/force'
import { shallowCompare } from 'lib/util/shallow'
import { stdAnimateLeave, stdAnimateStart, stdAnimateUpdate } from 'components/hybrid/animation'
import { Nodes } from 'components/hybrid/nodes'
import { Links } from 'components/hybrid/links'
import PropTypes from 'prop-types'

const G = styled.g`
  stroke: #ffffff;
  stroke-width: 1.5px;
`

const Container = styled.span`
  display: inline-block;
`

export class HybridForceGraph extends Component {
  static propTypes = {
    ...ForceGraphProps,
    renderNode: PropTypes.func,
    renderLink: PropTypes.func,
    animation: PropTypes.shape({
      start: PropTypes.func.isRequired,
      update: PropTypes.func.isRequired,
      leave: PropTypes.func.isRequired,
      keyAccessor: PropTypes.func.isRequired,
    }),
    nodeTickHandler: PropTypes.func,
    linkTickHandler: PropTypes.func,
  }

  static defaultProps = {
    ...ForceGraphDefaultProps,
    animation: {
      start: stdAnimateStart,
      update: stdAnimateUpdate,
      leave: stdAnimateLeave,
      keyAccessor: (d) => d.id,
    },
  }

  static displayName = 'HybridForceGraph'

  constructor(props) {
    super(props)
    this.ref = createRef()
    this.state = {}
  }

  static getDerivedStateFromProps(props, state) {
    return encapsulateOutsideData(props, state)
  }

  componentDidMount() {
    this.initSimulation()
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this.props, nextProps) || shallowCompare(this.state, nextState)
  }

  componentDidUpdate() {
    this.updateSimulation(this.extractSimUpdateParams())
  }

  initSimulation = () => {
    this.props.onSimulationStart()

    const simOptions = this.extractSimOptions()
    const { simulation, updateSimulation } = buildForceSimulation({
      type: SIMULATION_TYPE.REACT_D3_HYBRID,
      ...simOptions,
    })
    this.simulation = simulation
    this.updateSimulation = updateSimulation
  }

  getLinkPath = (d) =>
    this.props.linkType === LINK_TYPES.CURVED ? getCurvedLinkPath(d) : getStraightLinkPath(d)

  applyNodeTick = (nodeSel) => nodeSel.attr('cx', (d) => d.x).attr('cy', (d) => d.y)
  applyLinkTick = (linkSel) => linkSel.attr('d', this.getLinkPath)

  ticked = () => {
    const { nodeTickHandler, linkTickHandler } = this.props
    const { links, nodes } = this.state

    this.simulation.nodeSel.data(nodes, function(d) {
      return d ? d.id : this.id
    })

    this.simulation.linkSel.data(links, function(d) {
      return d ? d.source.id + d.target.id : this.id
    })

    nodeTickHandler
      ? nodeTickHandler(this.simulation.nodeSel)
      : this.applyNodeTick(this.simulation.nodeSel)

    linkTickHandler
      ? linkTickHandler(this.simulation.linkSel)
      : this.applyLinkTick(this.simulation.linkSel)
  }

  onEnd = () => {
    this.props.onSimulationEnd()
  }

  extractSimOptions = () => {
    const { forceOptions } = this.props
    const { nodes, links } = this.state
    return {
      ...forceOptions,
      nodes: nodes || [],
      links: links || [],
      tickHandler: this.ticked,
      endHandler: this.onEnd,
      ref: this.ref || {},
    }
  }

  extractSimUpdateParams = () => ({
    simulation: this.simulation,
    options: this.extractSimOptions(),
  })

  render() {
    const { height, width, animation, renderNode, renderLink } = this.props
    const { nodes, links } = this.state

    return (
      <Container>
        <svg height={height} width={width}>
          <G ref={this.ref} transform={`translate(${width / 2},${height / 2})`}>
            <Links links={links} renderLink={renderLink} />
            <Nodes animation={animation} nodes={nodes} renderer={renderNode} />
          </G>
        </svg>
      </Container>
    )
  }
}
