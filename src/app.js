import React from 'react'
import { GlobalStyle } from './components/app/globalStyle'
import { BrowserRouter } from 'react-router-dom'
import { Routes } from './routes'

export const App = () => (
  <>
    <GlobalStyle />
    <BrowserRouter>
      <Routes />
    </BrowserRouter>
  </>
)
