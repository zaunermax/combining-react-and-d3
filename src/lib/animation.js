import { easeCubic } from 'd3-ease'

const ANIMATION_DURATION = 750

export const animateStart = ({ size }) => ({
  size: size,
  fill: '#45b29d',
  timing: { duration: ANIMATION_DURATION },
})

export const animateUpdate = ({ size }) => ({
  size: [size],
  fill: '#3a403d',
  timing: { duration: ANIMATION_DURATION },
})

export const animateLeave = () => ({
  size: [0],
  fill: '#b26745',
  timing: { duration: ANIMATION_DURATION, ease: easeCubic },
})
