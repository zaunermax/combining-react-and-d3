import React, { lazy, Suspense } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'

export const ROOT = '/'
export const OVERVIEW = '/overview'
export const BAR_CHART = '/barchart'
export const BENCHMARK = '/bench'
export const D3_BENCH = BENCHMARK + '/d3'
export const HYBRID_BENCH = BENCHMARK + '/hybrid'
export const PURE_BENCH = BENCHMARK + '/react'

const DEFAULT = OVERVIEW

const OverViewPage = lazy(() => import('./pages/overview'))
const AsyncBarChartExample = lazy(() => import('./pages/barChart'))
const AsyncBenchmark = lazy(() => import('./pages/benchmark'))

const LoadingMessage = () => `Loading...`

export const Routes = () => (
  <Suspense fallback={<LoadingMessage />}>
    <Switch>
      <Redirect from={ROOT} to={DEFAULT} exact />
      <Route path={BAR_CHART}>
        <AsyncBarChartExample />
      </Route>
      <Route path={OVERVIEW}>
        <OverViewPage />
      </Route>
      <Route path={BENCHMARK} component={(props) => <AsyncBenchmark {...props} />} />
    </Switch>
  </Suspense>
)
