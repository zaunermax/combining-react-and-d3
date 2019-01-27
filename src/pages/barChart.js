import React, { useState } from 'react'
import BarChart from 'components/pureD3/barChart'
import { getOnClickHandler, getRndChartData } from 'lib/barChartService'

export default () => {
  const [data, setData] = useState(getRndChartData())
  const clickHandler = getOnClickHandler(setData)

  return (
    <>
      <BarChart data={data} height={500} width={500} />
      <div>
        <button onClick={clickHandler}>Randomize Data</button>
      </div>
    </>
  )
}
