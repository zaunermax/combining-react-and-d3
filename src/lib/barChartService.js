import * as jz from 'jeezy'

export const getRndChartData = (len = jz.num.randBetween(1, 10)) =>
  new Array(len).fill(0).map(() => jz.num.randBetween(0, 15))

export const getOnClickHandler = (setData) => () => setData(getRndChartData())
