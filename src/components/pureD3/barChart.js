import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { select } from 'd3-selection'
import { max } from 'd3-array'
import { scaleLinear } from 'd3-scale'

class BarChart extends Component {
  static propTypes = {
    data: PropTypes.array,
    height: PropTypes.number,
    width: PropTypes.number,
  }

  static defaultProps = {
    height: 500,
    width: 500,
    data: [],
  }

  componentDidMount() {
    this.createBarChart()
  }

  componentDidUpdate() {
    this.createBarChart()
  }

  createBarChart() {
    const { data, height } = this.props
    const node = this.node
    const dataMax = max(data)
    const yScale = scaleLinear()
      .domain([0, dataMax])
      .range([0, height])

    select(node)
      .selectAll('rect')
      .data(data)
      .enter()
      .append('rect')

    select(node)
      .selectAll('rect')
      .data(data)
      .exit()
      .remove()

    select(node)
      .selectAll('rect')
      .data(data)
      .style('fill', '#fe9922')
      .attr('x', (d, i) => i * 25)
      .attr('y', (d) => height - yScale(d))
      .attr('height', (d) => yScale(d))
      .attr('width', 25)
      .on('click', (value) => console.log('clicked on bar with val', value))
  }

  setRef = (node) => (this.node = node)

  render() {
    return <svg ref={this.setRef} height={this.props.height} width={this.props.width} />
  }
}

export default BarChart
