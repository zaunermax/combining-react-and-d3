import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components/macro'

const getAddUp = (key) => (total, obj) => total + obj[key]

const ResultContainer = styled.div`
  display: flex;
`

const IterationContainer = styled.div`
  margin: 10px;
  padding: 5px 15px;
  border: 1px solid lightgrey;
  border-radius: 5px;
  min-width: 150px;
`

const ItHeadline = styled.div`
  padding: 10px 0;
  text-align: center;
  font-size: 1.1rem;
  color: #09131e;
`

const ResultFieldContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px 5px;
`

const Type = styled.div`
  color: #6b7677;
`

const Result = styled.div`
  color: #09131e;
  font-size: 1.5rem;
  font-weight: bolder;
  margin: 3px 0;
`

const ResultField = ({ type, result, unit = '' }) => (
  <ResultFieldContainer>
    <Type>{type} </Type>
    <Result>
      {result}
      {unit}
    </Result>
  </ResultFieldContainer>
)

const BenchmarkResults = ({ iterations }) => (
  <ResultContainer>
    {iterations.map((it, idx) => {
      const avgTime = it.reduce(getAddUp('time'), 0) / it.length
      const avgFPS = it.reduce(getAddUp('avgFPS'), 0) / it.length
      const avgFrameTime = it.reduce(getAddUp('avgFrameTime'), 0) / it.length
      const avgHighestFrameTime = it.reduce(getAddUp('highestFrameTime'), 0) / it.length

      return (
        <IterationContainer key={idx}>
          <ItHeadline>AVG of {it.length} iterations:</ItHeadline>
          <ResultField type={'FPS'} result={Math.round(avgFPS)} />
          <ResultField type={'Time'} result={Math.round(avgTime)} unit={'ms'} />
          <ResultField type={'Frame time'} result={Math.round(avgFrameTime)} unit={'ms'} />
          <ResultField
            type={'Max frame time'}
            result={Math.round(avgHighestFrameTime)}
            unit={'ms'}
          />
        </IterationContainer>
      )
    })}
  </ResultContainer>
)

BenchmarkResults.propTypes = {
  iterations: PropTypes.arrayOf(
    PropTypes.arrayOf(
      PropTypes.shape({
        time: PropTypes.number,
        avgFPS: PropTypes.number,
        avgFrameTime: PropTypes.number,
        highestFrameTime: PropTypes.number,
      }),
    ),
  ),
}

export default BenchmarkResults
