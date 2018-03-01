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

  return usage
}

Package.prototype.toPlainObject = function() {
  return {
    name: this.name,
    filepaths: this.filepaths,
    exportNames: this.exportNames
  }
}

Package.prototype.toJSON = function() {
  return JSON.stringify(this.toPlainObject(), null, 2)
}

module.exports = Package
