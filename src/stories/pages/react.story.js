import { storiesOf } from '@storybook/react'
import { GraphContainer } from 'components/app/stateContainer'
import { PureReactForceGraph } from 'components/pureReact/forceGraph'
import React from 'react'

storiesOf('Pure React', module).add('Pure React', () => (
  <GraphContainer component={PureReactForceGraph} />
))
