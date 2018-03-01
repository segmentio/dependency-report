'use strict'
const recast = require('recast')
const parser = require('./parser')

const visit = recast.types.visit
const types = recast.types.namedTypes

function getExportNames(specifiers) {
  const exportNames = []

  for (const specifier of specifiers) {
    const exportName = specifier.local.name
    const asName = specifier.local.name

    if (types.ImportDefaultSpecifier.check(specifier)) {
      exportNames.push(exportName)
    } else if (asName === exportName) {
      exportNames.push(specifier.imported.name)
    } else {
      exportNames.push(exportName)
    }
  }

  return exportNames
}

function Package(name) {
  this.name = name
  this.filepaths = []
  this.exportNames = []
}

Package.prototype.addExports = function(exportNames) {
  this.exportNames = this.exportNames.concat(exportNames)
}

Package.prototype.addFilepath = function(filepath) {
  this.filepaths.push(filepath)
}

module.exports = contents => {
  const ast = recast.parse(contents, { parser })
  const packages = []
  let exportNames = []

  // Loop over all the import statements
  visit(ast, {
    visitImportDeclaration(path) {
      const specifiers = path.node.specifiers
      const packageName = path.node.source.value
      this.traverse(path)

      const results = getExportNames(specifiers, packageName)

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
