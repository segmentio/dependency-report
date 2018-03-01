'use strict'
const globby = require('globby')
const fs = require('fs-extra')
const pLimit = require('p-limit')
const astRunner = require('./ast-runner')
const Package = require('./package')

// Since we're CPU bound, loading lots of files at the same time just hurts performance
const limit = pLimit(5)

function DependencyReport(options) {
  if (!options) {
    throw new Error('No options object being passed to DependencyReport.')
  }

  if (!Object.hasOwnProperty.call(options, 'files')) {
    throw new Error('No files being passed to DependencyReport.')
  }

  this.files = options.files
  this.excludeGlob = options.excludeGlob
    ? `!${options.excludeGlob}`
    : '!**/node_modules/**'
}

/**
 * Run over all the files and parse the AST.
 */
DependencyReport.prototype.run = async function() {
  const filepaths = await globby([...this.files, this.excludeGlob])
  const packages = {}
  const exportNames = {}

  if (filepaths.length === 0) {
    throw new Error('No matching files found.')
  }

  const files = await Promise.all(
    filepaths.map(filepath =>
      limit(async () => {
        // Limit concurrency
        const contents = await fs.readFile(filepath, { encoding: 'utf-8' })

        const result = astRunner(contents)

        result.packages.forEach(packageObject => {
          if (!packages[packageObject.name]) {
            packages[packageObject.name] = new Package(packageObject.name)
          }
          packages[packageObject.name].addExports(packageObject.exportNames)
          packages[packageObject.name].addFilepath(filepath)
        })

        result.exportNames.forEach(exportName => {
          if (!exportNames[exportName]) {
            exportNames[exportName] = {
              filepaths: []
            }
          }

          exportNames[exportName].filepaths.push(filepath)
        })

        return {
          filepath,
          result
        }
      })
    )
  )

  this.packages = packages
  this.files = files

  return { packages, files, exportNames }
}

DependencyReport.prototype.package = function(packageName) {
  return this.packages[packageName]
}

module.exports = DependencyReport
