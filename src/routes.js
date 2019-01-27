import React, { lazy, Suspense } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'

const AsyncPureD3ForceGraph = lazy(() => import('./pages/overview'))
const AsyncBarChartExample = lazy(() => import('./pages/barChart'))

const LoadingMessage = () => `Loading...`

export const Routes = () => (
  <Suspense fallback={<LoadingMessage />}>
    <Switch>
      <Redirect from={'/'} to={'/pureD3'} exact />
      <Route path={'/barChart'}>
        <AsyncBarChartExample />
      </Route>
      <Route path={'/pureD3'}>
        <AsyncPureD3ForceGraph />
      </Route>
    </Switch>
  </Suspense>
)
