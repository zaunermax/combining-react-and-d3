import React from 'react'
import { storiesOf } from '@storybook/react'
import { GraphContainer } from 'components/app/stateContainer'
import { PureD3ForceGraph } from 'components/pureD3/forceGraph'
import { HybirdForceGraph } from 'components/hybrid/forceGraph'

storiesOf('Force Graph', module)
  .add('Pure D3', () => <GraphContainer component={PureD3ForceGraph} />)
  .add('Pure React', () => <GraphContainer component={HybirdForceGraph} />)
  .add('React & D3 hybrid', () => <GraphContainer component={PureD3ForceGraph} />)
