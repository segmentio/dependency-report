'use strict'
const path = require('path')
const globby = require('globby')
const fs = require('fs-extra')
const pLimit = require('p-limit')
const minimatch = require('minimatch')
const arrify = require('arrify')
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
  this.parser = options.parser || 'babel'
  this.exportNames = []
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
    filepaths
      .map(filepath =>
        limit(async () => {
          // Limit concurrency
          const contents = await fs.readFile(filepath, { encoding: 'utf-8' })

          let result
          try {
            result = astRunner(contents, this.parser)
          } catch (err) {
            console.error(`AST Runner failed on filepath: ${filepath}: ${err}`)
            return null
          }

          result.packages.forEach(packageObject => {
            /**
             * If the packageObject.name is a path, join it to the filepath.
             */
            const packageKey =
              packageObject.name.indexOf('./') > -1
                ? path.join(filepath, packageObject.name)
                : packageObject.name

            if (!packages[packageKey]) {
              packages[packageKey] = new Package(packageKey)
            }
            packages[packageKey].addExports(packageObject.exportNames, filepath)

            packages[packageKey].addFilepath(filepath)

            // By export
            packageObject.exportNames.forEach(exportName => {
              if (!exportNames[exportName]) {
                exportNames[exportName] = {
                  packages: {}
                }
              }

              if (!exportNames[exportName].packages[packageKey]) {
                exportNames[exportName].packages[packageKey] = {
                  usage: 0,
                  filepaths: []
                }
              }

              ++exportNames[exportName].packages[packageKey].usage
              exportNames[exportName].packages[packageKey].filepaths.push(
                filepath
              )
            })
          })

          return {
            filepath,
            result
          }
        })
      )
      .filter(Boolean)
  )

  this.packages = packages
  this.exportNames = exportNames

  return { packages, files, exportNames }
}

/**
 * @param {Array|String} packages — a list of minimatch globs.
 */
DependencyReport.prototype.getPackages = function(packages) {
  return Object.keys(this.packages)
    .filter(packageKey => {
      return (
        arrify(packages).filter(packageGlob => {
          return minimatch(packageKey, packageGlob)
        }).length > 0
      )
    })
    .map(packageKey => {
      return this.packages[packageKey]
    })
}

DependencyReport.prototype.toPlainObject = function() {
  const packages = {}

  Object.keys(this.packages).forEach(key => {
    packages[key] = this.packages[key].toPlainObject()
  })

  return {
    files: this.files,
    exportNames: this.exportNames,
    excludeGlob: this.excludeGlob,
    packages
  }
}

/**
 * @param {Array|String} exportNames — a list of names.
 */
DependencyReport.prototype.getByExportNames = function(exportNames) {
  return Object.keys(this.exportNames)
    .filter(exportName => {
      return (
        arrify(exportNames).filter(innerExportName => {
          return innerExportName === exportName
        }).length > 0
      )
    })
    .map(exportName => {
      return {
        name: exportName,
        ...this.exportNames[exportName]
      }
    })
}

module.exports = DependencyReport
