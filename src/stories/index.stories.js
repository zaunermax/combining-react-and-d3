import React from 'react'
import { storiesOf } from '@storybook/react'
import { GraphContainer } from 'components/app/stateContainer'
import { PureD3ForceGraph } from 'components/pureD3/forceGraph'
import { HybridForceGraph } from 'components/hybrid/forceGraph'
import { PureReactForceGraph } from 'components/pureReact/forceGraph'

storiesOf('Force Graph', module)
  .add('Pure D3', () => <GraphContainer component={PureD3ForceGraph} />)
  .add('Pure React', () => <GraphContainer component={PureReactForceGraph} />)
  .add('React & D3 hybrid', () => <GraphContainer component={HybridForceGraph} />)
