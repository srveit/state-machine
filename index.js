'use strict';
const _ = require('lodash'),
  moment = require('moment');

const nullLogger = {
  trace: () => true,
  debug: () => true,
  info: () => true,
  warn: () => true,
  error: () => true,
  fatal: () => true
};

const createStateMachine = ({states, logger}) => {
  const methods = {},
    timers = [],
    log = logger || nullLogger;
  let currentState = states[0];
  log.info({action: 'stateChange', state: currentState.name});

  const addMethod = (name, method) => methods[name] = method;

  const setTimer = duration => {
    timers.push(setTimeout(
      () => {
        handleEvent('timer expired');
      },
      duration
    ));
  };

  const clearTimers = () => {
    while (timers.length > 0) {
      clearTimeout(timers.pop());
    }
  };

  const handleEvent = event => {
    log.info({action: 'handleEvent', event});
    const eventHandler = currentState.events[event];
    if (!eventHandler) {
      log.debug({message: 'no event handler found', event});
      return;
    }
    if (eventHandler.nextState) {
      let previousStateName = currentState && currentState.name;
      clearTimers();
      currentState =
        states.find(state => state.name === eventHandler.nextState);
      log.info({
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
        log.info({action: method, args});
        methods[method].apply(null, args);
      } else {
        log.log({message: 'no method found', method});
      }
    });
  };

  addMethod(
    'setTimer',
    setTimer
  );

  return Object.freeze({
    addMethod,
    handleEvent,
    currentState: () => currentState
  });
};

exports.createStateMachine = createStateMachine;
