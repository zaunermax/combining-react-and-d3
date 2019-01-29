import { createNodeGroup } from 'react-move'
import { interpolate, interpolateTransformSvg } from 'd3-interpolate'

function getInterpolator(begValue, endValue, attr, namespace) {
  if (attr === 'transform') {
    return interpolateTransformSvg(begValue, endValue)
  }

  return interpolate(begValue, endValue)
}

export const NodeGroup = createNodeGroup(getInterpolator, 'NodeGroupDisplayName') // displayName is optional
