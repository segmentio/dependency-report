'use strict'
const babylon = require('babylon')

// Wrapper to set babylon options
module.exports = {
  parse(code) {
    // Use babylon to support bleeding edge ES features (which esprima doesn't support)
    return babylon.parse(code, {
      sourceType: 'module',
      plugins: [
        'jsx',
        'flow',
        'doExpressions',
        'objectRestSpread',
        'decorators2',
        'classProperties',
        'classPrivateProperties',
        'classPrivateMethods',
        'exportDefaultFrom',
        'exportNamespaceFrom',
        'asyncGenerators',
        'functionBind',
        'functionSent',
        'dynamicImport',
        'numericSeparator',
        'optionalChaining',
        'importMeta',
        'bigInt',
        'optionalCatchBinding',
        'throwExpressions',
        'pipelineOperator',
        'nullishCoalescingOperator'
      ]
    })
  }
}
