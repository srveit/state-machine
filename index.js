'use strict';
const _ = require('lodash'),
  moment = require('moment'),
  generateDot = require('./generateDot');

const nullLogger = {
  trace: () => true,
  debug: () => true,
  info: () => true,
  warn: () => true,
  error: () => true,
  fatal: () => true
};

const createStateMachine = ({states, name, logger}) => {
  let currentState = states[0];
  log.info({name, action: 'stateChange', state: currentState.name});
  const methods = {},
    timers = [],
    log = logger || nullLogger,

    addMethod = (name, method) => methods[name] = method,

    setTimer = duration => {
      timers.push(setTimeout(
        () => {
          handleEvent('timer expired');
        },
        duration
      ));
    },
    
    clearTimers = () => {
      while (timers.length > 0) {
        clearTimeout(timers.pop());
      }
    },

    handleEvent = event => {
      log.info({name, action: 'handleEvent', event});
      const eventHandler = currentState.events[event];
      if (!eventHandler) {
        log.debug({name, message: 'no event handler found', event});
        return;
      }
      if (eventHandler.nextState) {
        let previousStateName = currentState && currentState.name;
        clearTimers();
        currentState =
          states.find(state => state.name === eventHandler.nextState);
        log.info({
          name,
          action: 'stateChange',
          state: currentState && currentState.name,
          previousState: previousStateName
        });
      }
      let actions = eventHandler.actions ||
        (eventHandler.action ? [eventHandler.action] : []);
      actions.forEach(action => {
        let method, args;
        if (_.isString(action)) {
          method = action;
          args = [];
        } else {
          method = action[0];
          args = action.slice(1);
        }
        if (methods[method]) {
          log.info({name, action: method, args});
          methods[method].apply(null, args);
        } else {
          log.log({name, message: 'no method found', method});
        }
      });
    },

    dot = () => generateDot(name, states);

  addMethod(
    'setTimer',
    setTimer
  );

  return Object.freeze({
    addMethod,
    currentState: () => currentState,
    dot,
    handleEvent
  });
};

exports.createStateMachine = createStateMachine;
exports.generateDot = generateDot;
