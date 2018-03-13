const arrify = require('arrify')

function Package(name) {
  this.name = name
  this.filepaths = []
  this.exportNames = []
  this.filepathsForExports = {}
}

Package.prototype.addExports = function(exportNames, filepath) {
  this.exportNames = this.exportNames.concat(exportNames)

  exportNames.forEach(name => {
    if (!this.filepathsForExports[name]) {
      this.filepathsForExports[name] = []
    }

    this.filepathsForExports[name].push(filepath)
  })
}

Package.prototype.addFilepath = function(filepath) {
  this.filepaths.push(filepath)
}

Package.prototype.exportsUsage = function(exportName) {
  const usage = {}

  this.exportNames.forEach(exportName => {
    if (!usage[exportName]) {
      usage[exportName] = 0
    }

    usage[exportName]++
  })

  if (typeof exportName === 'string') {
    return usage[exportName] || 0
  }

  return Object.keys(usage)
    .sort((a, b) => {
      return usage[b] - usage[a]
    })
    .map(name => {
      return {
        name,
        usage: usage[name]
      }
    })
}

Package.prototype.toPlainObject = function() {
  return {
    name: this.name,
    // Files: this.filepaths.length,
    // exportsUsage: this.exportsUsage(),
    // exportNames: this.exportNames,
    filepathsForExports: this.filepathsForExports,
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
    const filepathsForExports = this.filepathsForExports[exportName] || []
    return {
      name: exportName,
      files: filepathsForExports.length,
      filepaths: filepathsForExports
    }
  })
}

module.exports = Package
