/* eslint-disable no-sequences */

export const curry = (fn) => (...args) => fn.bind(null, ...args)

export const map = curry((fn, arr) => arr.map(fn))

// export const join = curry((str, arr) => arr.join(str))

export const toLowerCase = (str) => str.toLowerCase()

// export const trim = (str) => str.trim()

export const split = curry((splitOn, str) => str.split(splitOn))

export const compose = (...fns) => (x) => fns.reduceRight((v, f) => f(v), x)

export const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x)

const executeFns = (fns, params) => fns.forEach((fn) => fn(...params))

// swallow event and defer execution of function until called with an event, event is optional
export const swallowEvent = (...fns) => (...params) => (event) => {
  event && event.stopPropagation && event.stopPropagation()
  executeFns(fns, params)
}

// this version of swallow event can be piped into an event processing composition
export const composableSwallowEvent = (...params) => (...fns) => (event) => {
  event && event.stopPropagation && event.stopPropagation()
  executeFns(fns, params)
}

// easily get the prop out of a styled component's css string literal
export const getProp = (property) => ({ [property]: prop }) => prop

// for anyone wondering: this stands for no-operation
export const noop = () => {}

const executeIfFunction = (f) => (typeof f === 'function' ? f() : f)

export const switchCase = (cases) => (defaultCase) => (key) =>
  executeIfFunction(cases.hasOwnProperty(key) ? cases[key] : defaultCase)

export const objectToArray = (object) => Object.keys(object).map((key) => object[key])
