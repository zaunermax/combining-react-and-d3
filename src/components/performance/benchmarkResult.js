import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components/macro'

const BenchmarkResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`

const ComponentTypeHeadline = styled.div`
  padding: 10px;
  border: 1px solid lightgray;
  margin: 10px 10px 0 10px;
  border-radius: 5px;
  color: #09131e;
  font-size: 1.5rem;
  font-weight: bolder;
`

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

const getAddUp = (key) => (total, obj) => total + obj[key]

const ResultField = ({ type, result, unit = '' }) => (
  <ResultFieldContainer>
    <Type>{type} </Type>
    <Result>
      {result}
      {unit}
    </Result>
  </ResultFieldContainer>
)

const BenchmarkResults = ({ iterations, testIterations, componentType }) => (
  <BenchmarkResultsContainer>
    <ComponentTypeHeadline>{componentType}</ComponentTypeHeadline>
    <ResultContainer>
      {iterations.map((it, idx) => {
        const avgTime = it.reduce(getAddUp('time'), 0) / it.length
        const avgFPS = it.reduce(getAddUp('avgFPS'), 0) / it.length
        const avgFrameTime = it.reduce(getAddUp('avgFrameTime'), 0) / it.length
        const avgHighestFrameTime = it.reduce(getAddUp('highestFrameTime'), 0) / it.length
        const nrOfNodes = testIterations[idx].nrOfNodes
        const nrOfLinks = testIterations[idx].nrOfLinks

        return (
          <IterationContainer key={idx}>
            <ItHeadline>AVG of {it.length} iterations:</ItHeadline>
            <ResultField type={'Nodes/Links'} result={`${nrOfNodes}/${nrOfLinks}`} />
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
  </BenchmarkResultsContainer>
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
  ).isRequired,
  testIterations: PropTypes.arrayOf(
    PropTypes.shape({
      nrOfNodes: PropTypes.number.isRequired,
      nrOfLinks: PropTypes.number.isRequired,
    }),
  ).isRequired,
  componentType: PropTypes.string.isRequired,
}

export default BenchmarkResults
