import React, { Component } from 'react'
import * as jz from 'jeezy'
import { PureD3ForceGraph } from 'components/pureD3/forceGraph'
import { LINK_TYPES, HybirdForceGraph } from 'components/hybrid/forceGraph'
import { randomizeData, randomizeLinks } from 'lib/rndDataService'

const STD_WIDTH = 800
const STD_HEIGHT = 800

export default class extends Component {
  state = {
    forceData: [],
    forceLinks: [],
    tmpForceLinks: null,
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
      const forceData = randomizeData()
      const newLinks = randomizeLinks(forceData)
      return {
        forceData,
        forceLinks: forceLinkToggle ? newLinks : null,
        tmpForceLinks: forceLinkToggle ? null : newLinks,
      }
    })

  onUpdateForce = () => this.updateForce()

  onChangeWidth = () =>
    this.setState(({ width }) => ({ width: width === STD_WIDTH ? STD_WIDTH / 2 : STD_WIDTH }))

  onUpdateRandomData = () =>
    this.setState(({ forceData }) => {
      const { length } = forceData
      const rndIdx = jz.num.randBetween(0, length - 1)
      const plusOrMinus = jz.num.randBetween(0, 1)
      const {
        [rndIdx]: { size },
      } = forceData

      forceData[rndIdx].size = (plusOrMinus < 1 && size > 10) || size > 60 ? size - 10 : size + 10

      return { forceData: forceData.concat([]) }
    })

  onShuffleIdxes = () =>
    this.setState(({ forceData }) => ({ forceData: jz.arr.shuffle(forceData).concat([]) }))

  onToggleLinks = () =>
    this.setState(({ forceLinkToggle, forceLinks, tmpForceLinks }) => ({
      forceLinkToggle: !forceLinkToggle,
      tmpForceLinks: forceLinkToggle ? forceLinks : null,
      forceLinks: forceLinkToggle ? null : tmpForceLinks,
    }))

  onRandomizeLinks = () =>
    this.setState(({ forceLinks, tmpForceLinks, forceData }) => ({
      forceLinks: forceLinks ? randomizeLinks(forceData) : null,
      tmpForceLinks: tmpForceLinks ? randomizeLinks(forceData) : null,
    }))

  onToggleLinkType = () =>
    this.setState(({ linkType }) => ({
      linkType: linkType === LINK_TYPES.STRAIGHT ? LINK_TYPES.CURVED : LINK_TYPES.STRAIGHT,
    }))

  selectNode = (name) => this.setState({ selNode: name })

  onCheckData = () => {
    console.log('force data', this.state.forceData)
    console.log('force links', this.state.forceLinks)
  }

  render() {
    const { width, forceData, forceLinks, linkType, selNode } = this.state

    return (
      <div>
        <PureD3ForceGraph data={forceData} links={forceLinks} width={width} height={STD_HEIGHT} />
        <HybirdForceGraph
          data={forceData}
          links={forceLinks}
          width={width}
          height={STD_HEIGHT}
          linkType={linkType}
          selNode={selNode}
          selectNode={this.selectNode}
        />
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
      </div>
    )
  }
}
