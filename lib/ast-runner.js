'use strict'
const recast = require('recast')

const visit = recast.types.visit
const types = recast.types.namedTypes

function getExportNames(specifiers) {
  const exportNames = []

  for (const specifier of specifiers) {
    const exportName = specifier.local.name

    if (types.ImportDefaultSpecifier.check(specifier)) {
      exportNames.push(exportName)
    } else {
      // Only non-default specifiers have `imported`
      exportNames.push(
        specifier.imported ? specifier.imported.name : exportName
      )
    }
  }

  return exportNames
}

module.exports = (contents, parserName) => {
  const parser =
    parserName === 'typescript'
      ? require('./typescript-tsx-parser') // Custom parse to set `isTSX: true` and provide `jsx` plugin
      : require(`recast/parsers/${parserName || 'babel'}`)

  const ast = recast.parse(contents, { isTSX: true, parser })
  const packages = []
  let exportNames = []

  // Loop over all the import statements
  visit(ast, {
    visitImportDeclaration(path) {
      const specifiers = path.node.specifiers
      const packageName = path.node.source.value
      this.traverse(path)

      const results = getExportNames(specifiers)

      exportNames = exportNames.concat(results)

      const packageObject = {
        name: packageName,
        exportNames: results
      }

      packages.push(packageObject)
    }
  })

  return {
    packages,
    exportNames
  }
}
