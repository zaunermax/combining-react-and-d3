import React from 'react'

const stdLinkRenderer = ({ source: { id: s }, target: { id: t } }) => (
  <path key={s + t} id={s + t} stroke={'#45b29d'} fill={'none'} />
)

export const Links = ({ links, renderLink = stdLinkRenderer }) => (
  <g className={'links'}>{links.map(renderLink)}</g>
)
