import { NodeGroup } from 'react-move'
import React from 'react'

const STD_FILL = '#45b29d'

const stdRenderer = ({ id, size, fill }) => (
  <circle className={'node'} key={id} id={id} r={size} fill={fill || STD_FILL} />
)

const getAnimationData = (nodeRenderer) => ({ key, state }) => nodeRenderer({ id: key, ...state })
const getNormalData = (nodeRenderer) => (nodes) => nodeRenderer(nodes)

const getNodeRenderer = (accessor, h) => (nodes) => <>{nodes.map(accessor(h))}</>

export const Nodes = ({ animation, nodes, renderer = stdRenderer }) =>
  animation ? (
    <NodeGroup data={nodes} {...animation}>
      {getNodeRenderer(getAnimationData, renderer)}
    </NodeGroup>
  ) : (
    getNodeRenderer(getNormalData, renderer)(nodes)
  )
