#!/usr/bin/env node
'use strict'

const path = require('path')
const fs = require('fs')

const generateDot = require('../lib/generateDot')

function generateDotFile(stateMachineFile, outputFile) {
  const machineDefinition = require(stateMachineFile)
  const dotFile = generateDot(machineDefinition)
  fs.writeFileSync(outputFile, dotFile)
  console.log(`wrote ${outputFile}`)
}

function main() {
  if (process.argv.length < 3) {
    console.error('error - missing state machine file')
    console.error(`usage: node ${process.argv[1]} state-machine [output.dot]`)
    process.exit(1)
  }

  const stateMachineFile = path.resolve(process.argv[2])
  console.log(stateMachineFile)
  let outputFile = process.argv[3]
  if (!outputFile) {
    const inputPath = path.parse(stateMachineFile)
    outputFile = `${inputPath.dir}/${inputPath.name}.dot`
  }

  generateDotFile(stateMachineFile, outputFile)
}

main()
