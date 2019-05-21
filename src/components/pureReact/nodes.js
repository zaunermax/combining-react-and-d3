import { nodeId } from 'lib/d3/force'
import React from 'react'

const getNodePosition = (node, nodePositions) => nodePositions[nodeId(node)]

export const Nodes = ({ nodes, nodePositions }) =>
  nodes &&
  nodes.map((node) => {
    const pos = getNodePosition(node, nodePositions)
    const id = nodeId(node)
    return node && pos ? <circle id={id} r={node.size} fill={'#45b29d'} key={id} {...pos} /> : null
  })
