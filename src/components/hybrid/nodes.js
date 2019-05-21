import { NodeGroup } from 'react-move'
import React from 'react'

const renderFn = ({ id, fill, size }) => <circle key={id} id={id} fill={fill} r={size} />

const renderAnimation = ({ key, state: { fill, r } }) => renderFn({ id: key, fill, size: r })
const renderNodes = ({ name, size }) => renderFn({ id: name, fill: '#45b29d', size })

const renderAnimatedNodes = (nodes) => <>{nodes.map(renderAnimation)}</>
const renderNormalNodes = (nodes) => nodes.map(renderNodes)

export const Nodes = ({ animation, data }) =>
  animation ? (
    <NodeGroup data={data} {...animation}>
      {renderAnimatedNodes}
    </NodeGroup>
  ) : (
    renderNormalNodes(data)
  )
