// eslint-disable unicorn/no-abusive-eslint-disable
import test from 'ava'
import fs from 'fs-extra'
import tempy from 'tempy'
import DependencyReport from '../lib/dependency-report'

const fileContents = []

fileContents.push(`
import React from 'react'
import {
  Pane as EGPane,
  Text,
  Card
} from 'evergreen-ui'
import Dialog from 'ui/Dialog'

function justSomeCode() {

}
`)

fileContents.push(`
import React, { PropTypes } from 'react'
import { filter } from 'lodash'
import {
  Pane as EGPane,
  Text,
  Card,
  Table,
  TableCell
} from 'evergreen-ui'
import Dialog from 'ui/Dialog'

function justSomeCode() {

}
`)

fileContents.push(`
import React from 'react'
import _ from 'lodash'
import {
  Pane as EGPane,
  Text,
  Card,
  Table,
  TableCell,
  Popover,
  SelectMenu,
  Dialog
} from 'evergreen-ui'

function justSomeCode() {

}
`)

fileContents.push(`
import React from 'react'
import { Text } from 'evergreen-ui'

// TypeScript
function mcCode(value: string): number {
  return 1
}
`)

const setup = async () => {
  const arr = fileContents.map(async content => {
    const filePath = tempy.file()
    await fs.writeFile(filePath, content)
    return filePath
  })
  const files = Promise.all(arr)

  return files
}

test('run a report over a single file', async t => {
  const files = await setup()

  const report = new DependencyReport({
    files: [files[0]]
  })

  t.notThrows(async () => report.run())
})

test('run a report over a multiple files', async t => {
  const files = await setup()
  const report = new DependencyReport({
    files,
    parser: 'typescript'
  })

  t.notThrows(async () => report.run())
})

test('get the usage of a package over a single file', async t => {
  const files = await setup()

  const report = new DependencyReport({
    files,
    parser: 'typescript'
  })

  await report.run()

  const evergreenPackage = report.getPackages('evergreen-ui')[0]

  const usage = evergreenPackage.exportsUsage()

  t.deepEqual(usage, [
    { name: 'Text', usage: 4 },
    { name: 'Pane', usage: 3 },
    { name: 'Card', usage: 3 },
    { name: 'Table', usage: 2 },
    { name: 'TableCell', usage: 2 },
    { name: 'Popover', usage: 1 },
    { name: 'SelectMenu', usage: 1 },
    { name: 'Dialog', usage: 1 }
  ])
})

test('get the usage of a single export for a package', async t => {
  const files = await setup()

  const report = new DependencyReport({
    files,
    parser: 'typescript'
  })

  await report.run()

  const evergreenPackage = report.getPackages('evergreen-ui')[0]

  const usage = evergreenPackage.exportsUsage('Pane')

  t.is(usage, 3)
})

test('get the usage by export name', async t => {
  const files = await setup()

  const report = new DependencyReport({
    files,
    parser: 'typescript'
  })

  await report.run()

  const exportUsage = report.getByExportNames('Dialog')[0]

  t.is(exportUsage.packages['ui/Dialog'].usage, 2)
  t.is(exportUsage.packages['evergreen-ui'].usage, 1)
})

test('get the complete snapshot', async t => {
  const files = await setup()

  const report = new DependencyReport({
    files,
    parser: 'typescript'
  })

  await report.run()

  t.notThrows(() => JSON.stringify(report.toPlainObject(), null, 2))
})
