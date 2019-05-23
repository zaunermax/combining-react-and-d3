import * as jz from 'jeezy'

const elements = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'.split('')

export const randomizeData = () =>
  jz.arr
    .shuffle(elements)
    .slice(jz.num.randBetween(1, elements.length))
    .map((char) => ({ id: char, size: jz.num.randBetween(5, 50) }))

export const findSameLink = (key) => ({ source: { id: s }, target: { id: t } }) =>
  s + t === key || t + s === key

export const randomizeLinks = (nodes = []) => {
  const { length } = nodes
  const nrOfLinks = jz.num.randBetween(1, length)

  return new Array(nrOfLinks)
    .fill(0)
    .reduce((acc) => {
      const firstIdx = jz.num.randBetween(0, length - 1)
      const secondIdx = jz.num.randBetween(0, length - 1)

      const d1 = nodes[firstIdx]
      const d2 = nodes[secondIdx]

      return firstIdx !== secondIdx && !acc.find(findSameLink(d1.id + d2.id))
        ? acc.concat({
            source: nodes[firstIdx],
            target: nodes[secondIdx],
          })
        : acc
    }, [])
    .filter(Boolean)
}
