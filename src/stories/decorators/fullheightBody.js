import React from 'react'
import { createGlobalStyle } from 'styled-components/macro'

const GlobalStyleInjector = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body,html,#root {
    min-height: 100%;
    height: 100%;
  }
`

export const GlobalStyle = (stories) => (
  <>
    <GlobalStyleInjector />
    {stories()}
  </>
)
