'use strict';
const _ = require('lodash'),
  moment = require('moment');

const createStateMachine = definition => {
  definition = Object.assign({}, definition);
  let currentState = definition.states[0];
  console.info(moment().toISOString(), 'new state', currentState.name);
  const methods = {},
    timers = [];

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
    console.info(moment().toISOString(), 'event', event);
    const eventHandler = currentState.events[event];
    if (!eventHandler) {
//      console.warn('no event handler for', event);
      return;
    }
    if (eventHandler.nextState) {
      clearTimers();
      currentState =
        definition.states.find(state => state.name === eventHandler.nextState);
      console.info(moment().toISOString(), 'new state', currentState && currentState.name);
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
        console.info(moment().toISOString(), 'action', method, args);
        methods[method].apply(null, args);
      } else {
        console.log('no method for', method);
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
