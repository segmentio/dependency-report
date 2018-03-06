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
  --export       The export to return a report for.
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
      export: {
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
  const inputPackages = (cli.flags.packages || []).split(',')
  // A glob is required
  if (cli.input.length === 0) {
    cli.showHelp()
    return
  }

  spinner = ora().start(`Search for packages: ${inputPackages}`)

  let report
  try {
    report = new DependencyReport({
      files: cli.input
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
      if (cli.flags.export) {
        const result = packages.map(pack => pack.exportReport(cli.flags.export))
        console.log(toJSON(result))
      } else {
        const result = packages.map(pack => pack.usageReport())
        console.log(toJSON(result))
      }
    } else {
      chalk.red(`no packages found for: ${cli.flags.packages}`)
    }
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
