#!/usr/bin/env node
'use strict'
const meow = require('meow')
const ora = require('ora')
const chalk = require('chalk')
const DependencyReport = require('./dependency-report')

// Since we're CPU bound, loading lots of files at the same time just hurts performance
let spinner

const cli = meow(
  {
    help: `
Usage
  $ dependency-report '<glob>'

Options
  <glob>         Glob of files you want to report on (node_modules is automatically ignored).
  --packages     The packages to return a usage report for. Is a glob.
  --parser       The parser you want to use: \`typescript\` or \`babel\` (default)
  --exports      The export to return a report for.
  --version      Prints the version.
  --help         Prints this message.

Examples
  $ dependency-report '**/*.js'
  `.trim()
  },
  {
    flags: {
      packages: {
        type: 'string',
        alias: 'p'
      },
      exports: {
        type: 'string',
        alias: 'e'
      }
    }
  }
)

function toJSON(obj) {
  return JSON.stringify(obj, null, 2)
}

async function main() {
  const inputPackages = cli.flags.packages ? cli.flags.packages.split(',') : []
  const inputExports = cli.flags.exports ? cli.flags.exports.split(',') : []
  const parser = cli.flags.parser

  // A glob is required
  if (cli.input.length === 0) {
    cli.showHelp()
    return
  }

  if (inputPackages.length > 0 && inputExports.length > 0) {
    spinner = ora().start(
      `Search for packages: ${inputPackages}. With exports: ${inputExports}`
    )
  } else if (inputPackages.length > 0) {
    spinner = ora().start(`Search for packages: ${inputPackages}`)
  } else if (inputExports.length > 0) {
    spinner = ora().start(`Search for exports: ${inputExports}`)
  } else {
    spinner = ora().start(`Create report for ${cli.input}.`)
  }

  let report
  try {
    report = new DependencyReport({
      files: cli.input,
      parser
    })

    await report.run()
  } catch (err) {
    console.error(err)
    spinner.fail(err)
    process.exitCode = 2
    return
  }

  spinner.stop()

  if (inputPackages.length > 0) {
    const packages = report.getPackages(inputPackages)

    if (packages.length > 0) {
      if (cli.flags.exports) {
        const result = packages.map(pack => pack.exportReport(inputExports))
        console.log(toJSON(result))
      } else {
        const result = packages.map(pack => pack.toPlainObject())
        // Const result = packages.map(pack => pack.usageReport())
        console.log(toJSON(result))
      }
    } else {
      chalk.red(`no packages found for: ${cli.flags.packages}`)
    }
  } else if (inputExports.length > 0) {
    const exportsUsage = report.getByExportNames(inputExports)
    console.log(toJSON(exportsUsage))
  } else {
    console.log(toJSON(report.toPlainObject()))
  }
}

main().catch(err => {
  // Handle uncaught errors gracefully
  if (spinner) {
    spinner.fail()
  }
  console.error(err)
  process.exitCode = 1
})
