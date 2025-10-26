import { effect, reactiveOptions } from 'mutts/src'

export function nf<T extends Function>(name: string, fn: T): T {
	Object.defineProperty(fn, 'name', { value: name })
	return fn
}
export function namedEffect(name: string, fn: () => void): () => void {
	return effect(nf(name, fn))
}
export class AssertionError extends Error {
	constructor(message: string) {
		super(`Assertion failure: ${message}`)
		this.name = 'AssertionError'
	}
}
export function assert(condition: any, message: string): asserts condition {
	if (!condition) throw new AssertionError(message)
}
export function defined<T>(value: T | undefined, message = 'Value is defined'): T {
	assert(value !== undefined, message)
	return value
}

export const traces: Record<string, typeof console | undefined> = {}
const counters: number[] = []
//traces.advertising = console
const debugMutts = true
if (debugMutts) {
	reactiveOptions.chain = (target: Function, caller?: Function) => {
		console.groupCollapsed(caller ? `${caller.name} -> ${target.name}` : `-> ${target.name}`)
		if (caller) console.log('caller:', caller)
		console.log('target:', target)
		console.groupEnd()
		counters[0]++
	}
	reactiveOptions.beginChain = (target: Function) => {
		console.groupCollapsed('begin', target)
		counters.unshift(0)
	}
	reactiveOptions.endChain = () => {
		console.groupEnd()
		console.log('Effects:', counters.shift())
	}
}
reactiveOptions.maxEffectChain = 100
reactiveOptions.maxEffectReaction = 'debug'
