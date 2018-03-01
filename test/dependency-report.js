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
} from 'evergreen-ui'
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
  console.log()
  const report = new DependencyReport({
    files: [files[0]]
  })

  t.notThrows(async () => report.run())
})

test('run a report over a multiple files', async t => {
  const files = await setup()
  const report = new DependencyReport({
    files
  })

  t.notThrows(async () => report.run())
})

test('get the usage of a package over a single file', async t => {
  const files = await setup()

  const report = new DependencyReport({
    files
  })

  await report.run()

  const evergreenPackage = report.package('evergreen-ui')

  const usage = evergreenPackage.exportsUsage()

  t.deepEqual(usage, {
    Pane: 3,
    Text: 3,
    Card: 3,
    Table: 2,
    TableCell: 2,
    Popover: 1,
    SelectMenu: 1
  })
})

test('get the usage of a single export for a package', async t => {
  const files = await setup()

  const report = new DependencyReport({
    files
  })

  await report.run()

  const evergreenPackage = report.package('evergreen-ui')

  const usage = evergreenPackage.exportsUsage('Pane')

  t.is(usage, 3)
})
