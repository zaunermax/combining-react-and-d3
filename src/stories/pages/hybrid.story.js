import React from 'react'
import { storiesOf } from '@storybook/react'
import { GraphContainer } from 'components/app/stateContainer'
import { HybridForceGraph } from 'components/hybrid/forceGraph'
import { applyPropsToComponent } from 'lib/reactUtil'
import { DogeContainer } from 'components/app/dogeContainer'
import { GlobalStyle } from 'stories/decorators/fullheightBody'
import { RectContainer } from 'components/app/rectContainer'
import { GroupContainer } from 'components/app/groupRenderer'

const GraphWoAnimation = applyPropsToComponent({ animation: null })(HybridForceGraph)

storiesOf('React & D3 Hybrid', module)
  .addDecorator(GlobalStyle)
  .add('Standard hybrid graph', () => <GraphContainer component={HybridForceGraph} />)
  .add('Hybrid graph without animation', () => <GraphContainer component={GraphWoAnimation} />)
  .add('Custom render animation', () => <RectContainer />)
  .add('Group render animation', () => <GroupContainer />)
  .add('Company hierarchy animation', () => <DogeContainer />)
