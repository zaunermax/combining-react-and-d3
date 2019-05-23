import { storiesOf } from '@storybook/react'
import { GraphContainer } from 'components/app/stateContainer'
import { PureD3ForceGraph } from 'components/pureD3/forceGraph'
import React from 'react'

storiesOf('Pure D3', module).add('Pure D3', () => <GraphContainer component={PureD3ForceGraph} />)
