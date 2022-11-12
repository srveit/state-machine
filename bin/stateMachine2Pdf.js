#!/usr/bin/env node
'use strict'

const path = require('path')
const { spawn } = require('node:child_process')

const generateDot = require('../lib/generateDot')

function generateDotFile(stateMachineFile, outputFile) {
  const machineDefinition = require(stateMachineFile)
  const dotFile = generateDot(machineDefinition)

  const child = spawn('dot', ['-Tpdf', '-o', outputFile])
  child.stdout.pipe(process.stdout)
  child.stderr.pipe(process.stderr)

  child.on('error', (error) => {
    console.error(`error: ${error.message}`)
  })

  child.on('close', (code) => {
    if (code === 0) {
      console.log(`wrote ${outputFile}`)
    } else {
      console.log(`child process exited with code ${code}`)
      process.exit(code)
    }
  })

  child.stdin.setEncoding('utf-8')
  child.stdin.write(dotFile)
  child.stdin.end()
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
    outputFile = `${inputPath.dir}/${inputPath.name}.pdf`
  }

  generateDotFile(stateMachineFile, outputFile)
}

main()
