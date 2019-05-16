const path = require('path')

module.exports = ({ config }) => {
  config.resolve.modules = [...(config.resolve.modules || []), path.resolve('./src')]
  return config
}
