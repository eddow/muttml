import { memoize, reactive } from 'mutts/src'

type AllOptional<T> = {
	[K in keyof T as undefined extends T[K] ? K : never]-?: T[K]
}

type Defaulted<T, D extends Partial<AllOptional<T>>> = Omit<T, keyof D> & Required<D>

export function defaulted<T extends Record<PropertyKey, any>, D extends Partial<AllOptional<T>>>(
	value: T,
	defaultValue: D
): Defaulted<T, D> {
	/*
	return new Proxy(value, {
		[Symbol.toStringTag]: 'Defaulted',
		get(target, key) {
			return key in target ? target[key] : defaultValue[key as keyof D]
		},
		set(target, key, value) {
			target[key as keyof T] = value
			return true
		},
		has(target, key) {
			return key in target || key in defaultValue
		},
	} as ProxyHandler<T>) as unknown as Defaulted<T, D>*/
	return Object.setPrototypeOf(value, reactive(defaultValue)) as Defaulted<T, D>
}
export function overridden<T extends Record<PropertyKey, any>, D extends Partial<AllOptional<T>>>(
	value: T,
	overrides: D
): Defaulted<T, D> {
	return new Proxy(value, {
		get(target, key) {
			return key in overrides ? overrides[key as keyof D] : target[key]
		},
		set(target, key, value) {
			target[key as keyof T] = value
			return true
		},
	}) as unknown as Defaulted<T, D>
}
type PropsDesc<P extends Record<string, any>> = {
	[K in keyof P]:
		| P[K]
		| (() => P[K])
		| {
				get: () => P[K]
				set: (value: P[K]) => void
		  }
}

export function copyObject(into: Record<string, any>, from: Record<string, any>) {
	for (const key of Object.keys(into)) if (!(key in from)) delete into[key]
	return Object.assign(into, from)
}

export function propsInto<P extends Record<string, any>, S extends Record<string, any>>(
	props: PropsDesc<P>,
	into: S = {} as S
): S & P {
	for (const [key, value] of Object.entries(props || {})) {
		if (key !== 'style' && !(key in into)) {
			// Check for 2-way binding object {get:, set:}
			// Properties must be configurable as the proxy might return a reactive version of it
			if (typeof value === 'object' && value !== null && 'get' in value && 'set' in value) {
				Object.defineProperty(into, key, {
					get: memoize(value.get),
					set: (newValue) => value.set(newValue),
					enumerable: true,
					configurable: true,
				})
			} else if (typeof value === 'function') {
				// One-way binding
				Object.defineProperty(into, key, {
					get: memoize(value),
					enumerable: true,
					configurable: true,
				})
			} else {
				// Static value
				Object.defineProperty(into, key, {
					value: value,
					enumerable: true,
					writable: false,
					configurable: true,
				})
			}
		}
	}
	return into as S & P
}

export const array = {
	into<T>(towards: T[], from: T[]) {
		towards.length = 0
		towards.push(...from)
		return towards
	},
	remove<T>(array: T[], item: T) {
		const index = array.indexOf(item)
		if (index !== -1) array.splice(index, 1)
		return true
	},
	filter<T>(array: T[], filter: (item: T) => boolean) {
		for (let i = 0; i < array.length; ) {
			if (!filter(array[i])) {
				array.splice(i, 1)
			} else {
				++i
			}
		}
		return false
	},
}

export function isElement(value: any): value is JSX.Element {
	return value && typeof value === 'object' && 'render' in value
}
