import React, { Component } from 'react'
import * as jz from 'jeezy'
import { randomizeData, randomizeLinks } from 'lib/legacyRndHelpers'
import { LINK_TYPES } from 'lib/d3/linkPath'

const STD_WIDTH = 900
const STD_HEIGHT = 900

const forceOptions = {
  radiusMultiplier: 1.2,
}

export class GraphContainer extends Component {
  state = {
    data: [],
    links: [],
    tmpForceLinks: [],
    width: STD_WIDTH,
    forceLinkToggle: false,
    linkType: LINK_TYPES.CURVED,
    selNode: '',
  }

  componentDidMount() {
    this.updateForce()
  }

  updateForce = () =>
    this.setState(({ forceLinkToggle }) => {
      const nodes = randomizeData()
      const newLinks = randomizeLinks(nodes)
      return {
        nodes,
        links: forceLinkToggle ? newLinks : [],
        tmpForceLinks: forceLinkToggle ? [] : newLinks,
      }
    })

  onUpdateForce = () => this.updateForce()

  onChangeWidth = () =>
    this.setState(({ width }) => ({ width: width === STD_WIDTH ? STD_WIDTH / 2 : STD_WIDTH }))

  onUpdateRandomData = () =>
    this.setState(({ nodes }) => {
      const { length } = nodes
      const rndIdx = jz.num.randBetween(0, length - 1)
      const plusOrMinus = jz.num.randBetween(0, 1)
      const {
        [rndIdx]: { size },
      } = nodes

      nodes[rndIdx].size = (plusOrMinus < 1 && size > 10) || size > 60 ? size - 10 : size + 10

      return { nodes: nodes.concat([]) }
    })

  onShuffleIdxes = () => this.setState(({ nodes }) => ({ nodes: jz.arr.shuffle(nodes).concat([]) }))

  onToggleLinks = () =>
    this.setState(({ forceLinkToggle, links, tmpForceLinks }) => ({
      forceLinkToggle: !forceLinkToggle,
      tmpForceLinks: forceLinkToggle ? links : [],
      links: forceLinkToggle ? [] : tmpForceLinks,
    }))

  onRandomizeLinks = () =>
    this.setState(({ links, tmpForceLinks, nodes }) => ({
      links: links.length ? randomizeLinks(nodes) : [],
      tmpForceLinks: tmpForceLinks.length ? randomizeLinks(nodes) : [],
    }))

  onToggleLinkType = () =>
    this.setState(({ linkType }) => ({
      linkType: linkType === LINK_TYPES.STRAIGHT ? LINK_TYPES.CURVED : LINK_TYPES.STRAIGHT,
    }))

  onCheckData = () => {
    console.log('force data', this.state.nodes)
    console.log('force links', this.state.links)
  }

  render() {
    const { width, nodes, links, linkType, selNode } = this.state
    const { component: C } = this.props

    return (
      <div>
        <div>
          <button onClick={this.onUpdateForce}>update force</button>
          <button onClick={this.onUpdateRandomData}>update rnd data</button>
          <button onClick={this.onShuffleIdxes}>rnd shuffle data</button>
          <button onClick={this.onChangeWidth}>change width</button>
          <button onClick={this.onToggleLinks}>toggle links</button>
          <button onClick={this.onRandomizeLinks}>randomize links</button>
          <button onClick={this.onToggleLinkType}>toggle link type</button>
          <button onClick={this.onCheckData}>check data</button>
        </div>
        <C
          nodes={nodes}
          links={links}
          width={width}
          height={STD_HEIGHT}
          linkType={linkType}
          selNode={selNode}
          forceOptions={forceOptions}
        />
      </div>
    )
  }
}
