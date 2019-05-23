import React from 'react'

export const Links = ({ links }) =>
  links &&
  links.map(({ source: { id: s }, target: { id: t } }) => (
    <path key={s + t} id={s + t} stroke={'#45b29d'} fill={'none'} />
  ))
