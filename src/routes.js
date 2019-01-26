import React, { lazy, Suspense } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'

const AsyncPureD3ForceGraph = lazy(() => import('./pages/pureD3'))

const LoadingMessage = () => `Loading...`

export const Routes = () => (
  <Suspense fallback={<LoadingMessage />}>
    <Switch>
      <Redirect from={'/'} to={'/pureD3'} exact />
      <Route path={'/pureD3'}>
        <AsyncPureD3ForceGraph />
      </Route>
    </Switch>
  </Suspense>
)
