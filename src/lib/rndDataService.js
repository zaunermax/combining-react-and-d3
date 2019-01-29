import * as jz from 'jeezy'

const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'.split('')

export const randomizeData = () =>
  jz.arr
    .shuffle(alphabet)
    .slice(jz.num.randBetween(1, alphabet.length))
    .map((char) => ({ name: char, size: jz.num.randBetween(5, 50) }))

export const findSameLink = (key) => ({ source: { name: s }, target: { name: t } }) =>
  s + t === key || t + s === key

export const randomizeLinks = (data = []) => {
  const { length } = data
  const nrOfLinks = jz.num.randBetween(1, length)

  return new Array(nrOfLinks)
    .fill(0)
    .reduce((acc) => {
      const firstIdx = jz.num.randBetween(0, length - 1)
      const secondIdx = jz.num.randBetween(0, length - 1)

      const d1 = data[firstIdx]
      const d2 = data[secondIdx]

      return firstIdx !== secondIdx && !acc.find(findSameLink(d1.name + d2.name))
        ? acc.concat({
            source: data[firstIdx],
            target: data[secondIdx],
          })
        : acc
    }, [])
    .filter(Boolean)
}
