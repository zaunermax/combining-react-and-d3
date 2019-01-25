import styled, { keyframes } from 'styled-components/macro'
import logo from '../logo.svg'
import React from 'react'

const AppContainer = styled.div`
  text-align: center;
`

const StyledAppHeader = styled.header`
  background-color: #282c34;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  color: white;
`

const appLogoSpin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

const AppLogo = styled.img`
  animation: ${appLogoSpin} infinite 20s linear;
  height: 40vmin;
`

const AppLink = styled.a`
  color: #61dafb;
`

export const StdCraComponent = () => (
  <AppContainer>
    <StyledAppHeader>
      <AppLogo src={logo} alt="logo"/>
      <p>
        Edit <code>src/App.js</code> and save to reload.
      </p>
      <AppLink
        className="App-link"
        href="https://reactjs.org"
        target="_blank"
        rel="noopener noreferrer"
      >
        Learn React
      </AppLink>
    </StyledAppHeader>
  </AppContainer>
)
