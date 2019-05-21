import { ForceLink } from 'components/pureReact/pureLink'
import { linkId } from 'lib/d3/force'
import React from 'react'

const getLinkPath = (link, linkPositions) => linkPositions[linkId(link)]

export const Links = ({ links, linkPositions }) =>
  links &&
  links.map((link) => {
    const path = getLinkPath(link, linkPositions)
    return path && link ? <ForceLink key={linkId(link)} link={link} path={path} /> : null
  })
