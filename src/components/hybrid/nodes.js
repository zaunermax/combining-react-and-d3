import { NodeGroup } from 'react-move'
import React from 'react'

const STD_FILL = '#45b29d'

const stdRenderer = ({ id, size, fill }) => (
  <circle key={id} id={id} r={size} fill={fill || STD_FILL} />
)

const getAnimationData = (nodeRenderer) => ({ key, state }) => nodeRenderer({ id: key, ...state })
const getNormalData = (nodeRenderer) => (data) => nodeRenderer(data)

const getNodeRenderer = (accessor, h) => (nodes) => <>{nodes.map(accessor(h))}</>

export const Nodes = ({ animation, data, renderer = stdRenderer }) =>
  animation ? (
    <NodeGroup data={data} {...animation}>
      {getNodeRenderer(getAnimationData, renderer)}
    </NodeGroup>
  ) : (
    getNodeRenderer(getNormalData, renderer)(data)
  )
