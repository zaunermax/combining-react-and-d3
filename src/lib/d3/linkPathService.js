import PropTypes from 'prop-types'

export const LINK_TYPES = {
  STRAIGHT: 'STRAIGHT',
  SMOOTH: 'SMOOTH',
  CURVED: 'CURVED',
}

export const LinkTypePropType = PropTypes.oneOf(
  Object.keys(LINK_TYPES).map((key) => LINK_TYPES[key]),
)

export const getCurvedLinkPath = ({ source: { x: sx, y: sy }, target: { x: tx, y: ty } }) => {
  const offset = 50

  const midpoint_x = (sx + tx) / 2
  const midpoint_y = (sy + ty) / 2

  const dx = tx - sx
  const dy = ty - sy

  const normalise = Math.sqrt(dx * dx + dy * dy)

  const offSetX = midpoint_x + offset * (dy / normalise)
  const offSetY = midpoint_y - offset * (dx / normalise)

  return `M${sx},${sy}S${offSetX},${offSetY} ${tx},${ty}`
}

export const getStraightLinkPath = ({ source: { x: sx, y: sy }, target: { x: tx, y: ty } }) =>
  `M${sx},${sy}L${tx},${ty}`
