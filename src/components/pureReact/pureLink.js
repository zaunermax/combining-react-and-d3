import React from 'react'
import PropTypes from 'prop-types'

const pathStyles = {
  fill: 'none',
  strokeWidth: 1.5,
  stroke: '#45b29d',
}

export const ForceLink = ({ path }) => {
  return <path style={pathStyles} d={path} />
}

ForceLink.propTypes = {
  link: PropTypes.object.isRequired,
  path: PropTypes.string.isRequired,
}
