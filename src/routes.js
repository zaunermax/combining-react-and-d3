import React, { lazy, Suspense } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'

const ROOT = '/'
const OVERVIEW = '/overview'
const BAR_CHART = '/barchart'

const DEFAULT = OVERVIEW

const OverViewPage = lazy(() => import('./pages/overview'))
const AsyncBarChartExample = lazy(() => import('./pages/barChart'))

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
    </Switch>
  </Suspense>
)
