const getBabelOptions = require('recast/parsers/_babel_options').default
const { parser } = require('recast/parsers/babel')

function parse(source, options) {
  const babelOptions = getBabelOptions(options)
  babelOptions.plugins.push(['typescript', { isTSX: true }], 'jsx')
  return parser.parse(source, babelOptions)
}

module.exports = {
  parse
}
