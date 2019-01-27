import React, { Component } from 'react'
import * as jz from 'jeezy'
import { PureD3ForceGraph } from 'components/pureD3/forceGraph'
import { LINK_TYPES, HybirdForceGraph } from 'components/hybrid/forceGraph'

let alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

const randomizeData = () => {
  let d0 = jz.arr.shuffle(alphabet)
  let d1 = []
  let d2 = []

  for (let i = 0; i < jz.num.randBetween(1, alphabet.length); i++) {
    d1.push(d0[i])
  }

  d1.forEach((d) => d2.push({ name: d, size: jz.num.randBetween(5, 50) }))

  return d2
}

const findSameLink = (key) => ({ source: { name: s }, target: { name: t } }) =>
  s + t === key || t + s === key

const randomizeLinks = (data = []) => {
  const { length } = data
  const nrOfLinks = jz.num.randBetween(1, length)
  const links = []

  for (let i = 0; i < nrOfLinks; i++) {
    const firstIdx = jz.num.randBetween(0, length - 1)
    const secondIdx = jz.num.randBetween(0, length - 1)

    const d1 = data[firstIdx]
    const d2 = data[secondIdx]

    if (firstIdx !== secondIdx && !links.find(findSameLink(d1.name + d2.name)))
      links.push({
        source: data[firstIdx],
        target: data[secondIdx],
      })
  }

  return links
}

export default class extends Component {
  state = {
    forceData: [],
    forceLinks: [],
    tmpForceLinks: null,
    width: 500,
    forceLinkToggle: true,
    linkType: LINK_TYPES.STRAIGHT,
    selNode: '',
  }

  componentDidMount() {
    this.updateForce()
  }

  updateForce = () => {
    this.setState(({ forceLinkToggle }) => {
      const forceData = randomizeData()
      const newLinks = randomizeLinks(forceData)
      return {
        forceData,
        forceLinks: forceLinkToggle ? newLinks : null,
        tmpForceLinks: forceLinkToggle ? null : newLinks,
      }
    })
  }

  onUpdateForce = () => {
    this.updateForce()
  }

  onChangeWidth = () => {
    this.setState(({ width }) => ({ width: width === 500 ? 400 : 500 }))
  }

  onUpdateRandomData = () => {
    this.setState(({ forceData }) => {
      const { length } = forceData
      const rndIdx = jz.num.randBetween(0, length - 1)
      const plusOrMinus = jz.num.randBetween(0, 1)
      const {
        [rndIdx]: { size },
      } = forceData
      console.log('test', forceData[rndIdx])
      forceData[rndIdx].size = (plusOrMinus < 1 && size > 10) || size > 60 ? size - 10 : size + 10
      // concat only because of PureComponent todo: use seamless-immutable
      return { forceData: forceData.concat([]) }
    })
  }

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

  render() {
    const { width, forceData, forceLinks, linkType, selNode } = this.state

    return (
      <div>
        <PureD3ForceGraph data={forceData} width={width} />
        <HybirdForceGraph
          data={forceData}
          links={forceLinks}
          width={width}
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
        </div>
      </div>
    )
  }
}
