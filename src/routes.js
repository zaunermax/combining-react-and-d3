import React, { lazy, Suspense } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import { NotFound } from 'pages/404'

export const ROOT = '/'
export const BENCHMARK = '/bench'

const DEFAULT = BENCHMARK

const AsyncBenchmark = lazy(() => import('./pages/benchmark'))

const LoadingMessage = () => `Loading...`

export const Routes = () => (
  <Suspense fallback={<LoadingMessage />}>
    <Switch>
      <Redirect from={ROOT} to={DEFAULT} exact />
      <Route path={BENCHMARK} render={(props) => <AsyncBenchmark {...props} />} />
      <Route render={NotFound} />
    </Switch>
  </Suspense>
)
