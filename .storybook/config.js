import { configure, addParameters } from '@storybook/react'

addParameters({
  options: {
    showPanel: false,
    isToolshown: false,
  },
})

// automatically import all files ending in *.stories.js
const req = require.context('../src/stories', true, /\.stories\.js$/)

function loadStories() {
  req.keys().forEach((filename) => req(filename))
}

configure(loadStories, module)
