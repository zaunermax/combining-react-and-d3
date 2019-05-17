import seedrandom from 'seedrandom'

const STATIC_SEED = 'Combining React and D3'
const rnd = seedrandom(STATIC_SEED)

export const randBetween = (min, max) => Math.floor(rnd() * (max - min + 1) + min)

export const createRndNode = () => ({
  name: `Node_${rnd()}`,
  size: randBetween(5, 50),
})

export const isSameLink = (key) => ({ source: { name: s }, target: { name: t } }) =>
  s + t === key || t + s === key

export const randomizeLinks = (data = [], nrOfLinks) =>
  Array(nrOfLinks)
    .fill(0)
    .reduce((acc) => {
      const firstIdx = randBetween(0, data.length - 1)
      const secondIdx = randBetween(0, data.length - 1)

      const d1 = data[firstIdx]
      const d2 = data[secondIdx]

      return firstIdx !== secondIdx && !acc.find(isSameLink(d1.name + d2.name))
        ? acc.concat({
            source: data[firstIdx],
            target: data[secondIdx],
          })
        : acc
    }, [])
    .filter(Boolean)

export const generateRandomNodeData = (nrOfNodes, nrOfLinks) => {
  const nodes = Array.from(Array(+nrOfNodes), () => createRndNode())
  const links = randomizeLinks(nodes, +nrOfLinks)
  return { nodes, links }
}
