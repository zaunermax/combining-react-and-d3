import React from 'react'
import { HybridForceGraph } from 'components/hybrid/forceGraph'
import styled from 'styled-components/macro'
import Autosizer from 'react-virtualized-auto-sizer'
import normalDoge from 'assets/doge.jpg'
import bossDoge from 'assets/bossDoge.jpg'
import curiousDoge from 'assets/curiousDoge.jpg'
import lazyDoge from 'assets/lazyDoge.jpg'
import coolDoge from 'assets/coolDoge.png'
import youngDoge from 'assets/youngDoge.jpg'
import angryDoge from 'assets/angryDoge.jpg'
import rainyDoge from 'assets/rainyDoge.jpg'

const dogeNodes = [
  { id: 'doge_boss', size: 80, img: bossDoge },
  { id: 'doge_employee_001', size: 60, img: curiousDoge },
  { id: 'doge_employee_002', size: 60, img: normalDoge },
  { id: 'doge_employee_003', size: 60, img: lazyDoge },
  { id: 'doge_employee_004', size: 60, img: coolDoge },
  { id: 'doge_employee_005', size: 60, img: youngDoge },
  { id: 'doge_employee_006', size: 60, img: angryDoge },
  { id: 'doge_employee_007', size: 60, img: rainyDoge },
]

const dogeLinks = [
  { source: dogeNodes[0], target: dogeNodes[1] },
  { source: dogeNodes[0], target: dogeNodes[2] },
  { source: dogeNodes[0], target: dogeNodes[3] },
  { source: dogeNodes[0], target: dogeNodes[4] },
  { source: dogeNodes[0], target: dogeNodes[5] },
  { source: dogeNodes[0], target: dogeNodes[6] },
  { source: dogeNodes[0], target: dogeNodes[7] },
]

const simulationOptions = {
  radiusMultiplier: 1.5,
  strength: 0.3,
  linkDistance: 250,
  linkStrength: 0.6,
}

const DOGE_COLOR = '#ebd9ab'

const nodeTickHandler = (nodeSel) => nodeSel.attr('transform', ({ x, y }) => `translate(${x},${y})`)

const renderNode = ({ id, size, img }) => (
  <g id={id} key={id} className={'node'}>
    <defs>
      <pattern id={`doge_img_${id}`} width={1} height={1} patternContentUnits={'objectBoundingBox'}>
        <image
          xlinkHref={img}
          x={0}
          y={0}
          height={1}
          width={1}
          preserveAspectRatio={'xMinYMin slice'}
        />
      </pattern>
    </defs>
    <circle r={size + 5} fill={DOGE_COLOR} />
    <circle r={size} fill={`url(#doge_img_${id})`} />
  </g>
)

const customLinkRenderer = ({ source: { id: s }, target: { id: t } }) => (
  <path key={s + t} id={s + t} stroke={DOGE_COLOR} fill={'none'} />
)

const Container = styled.div`
  height: 100%;
  overflow: hidden;
`

export const DogeContainer = () => (
  <Container>
    <Autosizer>
      {({ width, height }) => (
        <HybridForceGraph
          nodes={dogeNodes}
          links={dogeLinks}
          height={height}
          width={width}
          forceOptions={simulationOptions}
          nodeTickHandler={nodeTickHandler}
          renderNode={renderNode}
          renderLink={customLinkRenderer}
          animation={null}
        />
      )}
    </Autosizer>
  </Container>
)
