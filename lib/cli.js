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
  --package      The package to return a usage report for.
  --export       The export to return a report for.
  --version      Prints the version.
  --help         Prints this message.

Examples
  $ dependency-report '**/*.js'
  `.trim()
  },
  {
    flags: {
      package: {
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
  // A glob is required
  if (cli.input.length === 0) {
    cli.showHelp()
    return
  }

  spinner = ora().start()

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

  if (cli.flags.package) {
    const myPackage = report.package(cli.flags.package)

    if (myPackage) {
      myPackage.usageReport()

      if (cli.flags.export) {
        console.log(toJSON(myPackage.exportReport(cli.flags.export)))
      } else {
        console.log(toJSON(myPackage.usageReport()))
      }
    }

    chalk.red(`no package found for: ${cli.flags.package}`)
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
