'use strict'
const util = require('util')
const generateDot = ({ name, states, inputOptions }) => {
  const options = Object.assign(
    {
      size: {
        width: 7.5,
        height: 10,
      },
      page: {
        width: 8.5,
        height: 11,
      },
      rotate: 0,
      center: 1,
    },
    inputOptions
  )
  const lines = []
  const capitalize = (word) => word.substr(0, 1).toUpperCase() + word.substr(1)
  const camelCase = (string) =>
    (string || '').split(/[- ]/).map(capitalize).join('')
  const objectToString = (object) =>
    Object.entries(object)
      .map(([key, value]) => `${key}=${value}`)
      .join(', ')
  const styleToString = (style) => (style ? ` [${objectToString(style)}]` : '')
  const stateToString = (state) =>
    `${camelCase(state.name)}${styleToString(state.style)};`
  const transition = (stateName, event) =>
    `${camelCase(stateName)} -> ${camelCase(event.nextState)}`
  const transistionLabel = (name, event) => {
    const elements = [
      '<TABLE BORDER="0">',
      `<TR><TD><FONT FACE="Helvetica" POINT-SIZE="14">${name}</FONT></TD></TR>`,
      '<TR><TD HEIGHT="1" CELLPADDING="0" BGCOLOR="gray"></TD></TR>',
    ]
    if (event.actions) {
      event.actions.map((action) => {
        const str = Array.isArray(action)
          ? `${action[0]}(${action
              .slice(1)
              .map((param) => util.inspect(param))
              .join(', ')})`
          : action
        elements.push(`<TR><TD CELLPADDING="0">${str}</TD></TR>`)
      })
    }
    elements.push('</TABLE>')

    return `label=<${elements.join('')}>`
  }
  const transitionLine = (stateName, event, name) =>
    `  ${transition(stateName, event)} [${transistionLabel(name, event)}];`
  const transitions = (states) =>
    states.reduce(
      (trans, state) =>
        trans.concat(
          Object.entries(state.events).map(([name, event]) =>
            transitionLine(state.name, event, name)
          )
        ),
      []
    )

  lines.push(`digraph "${name}" {`)
  lines.push(`  size="${options.size.width},${options.size.height}";`)
  lines.push(`  page="${options.page.width},${options.page.height}";`)
  lines.push(`  rotate=${options.rotate};`)
  lines.push(`  center=${options.center};`)
  states.map((state) => lines.push(`  ${stateToString(state)}`))
  lines.push('  edge [fontsize="12" fontname="Times-Roman"]')
  transitions(states).map((line) => lines.push(line))
  lines.push(`}`)
  return lines.join('\n')
}

module.exports = generateDot
