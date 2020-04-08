const arrify = require('arrify')

function Package(name) {
  this.name = name
  this.filepaths = []
  this.exportNames = []
  this.filepathsForExports = new Map()
}

Package.prototype.addExports = function(exportNames, filepath) {
  this.exportNames = this.exportNames.concat(exportNames)

  exportNames.forEach(name => {
    if (!this.filepathsForExports.has(name)) {
      this.filepathsForExports.set(name, [])
    }

    this.filepathsForExports.get(name).push(filepath)
  })
}

Package.prototype.addFilepath = function(filepath) {
  this.filepaths.push(filepath)
}

Package.prototype.exportsUsage = function(exportName) {
  const usage = new Map()

  this.exportNames.forEach(exportName => {
    if (!usage.has(exportName)) {
      usage.set(exportName, 0)
    }

    usage.set(exportName, usage.get(exportName) + 1)
  })

  if (typeof exportName === 'string') {
    return usage.get(exportName) || 0
  }

  return Array.from(usage.keys())
    .sort((a, b) => {
      return usage.get(b) - usage.get(a)
    })
    .map(name => {
      return {
        name,
        usage: usage.get(name)
      }
    })
}

Package.prototype.toPlainObject = function() {
  // Convert filepathsForExports back to a plain object for serialization
  const filepathsForExportsPlain = {}
  for (const [key, value] of this.filepathsForExports) {
    filepathsForExportsPlain[key] = value
  }

  return {
    name: this.name,
    // Files: this.filepaths.length,
    // exportsUsage: this.exportsUsage(),
    // exportNames: this.exportNames,
    filepathsForExports: filepathsForExportsPlain,
    filepaths: this.filepaths
  }
}

Package.prototype.toJSON = function() {
  return JSON.stringify(this.toPlainObject(), null, 2)
}

Package.prototype.usageReport = function() {
  return {
    name: this.name,
    files: this.filepaths.length,
    exportsUsage: this.exportsUsage()
  }
}

Package.prototype.exportReport = function(exportNames) {
  return arrify(exportNames).map(exportName => {
    const filepathsForExports = this.filepathsForExports.get(exportName) || []
    return {
      name: exportName,
      files: filepathsForExports.length,
      filepaths: filepathsForExports
    }
  })
}

module.exports = Package
