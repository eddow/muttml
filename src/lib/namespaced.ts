import { organize, organized } from 'mutts/src'

const NAME_SPACED_SYMBOL = Symbol.for('pounceTS.nameSpaced')
// TODO: check and fix the given prop with namespaced parts - which comes first, how it ends up
type UnionToIntersection<U> = (U extends unknown ? (arg: U) => void : never) extends (
	arg: infer R
) => void
	? R
	: never

type NamespacedEntries<
	Props extends Record<string, any>,
	Key extends keyof Props & string,
> = Key extends 'children'
	? {}
	: undefined extends Props[Key]
		? {} extends Props[Key]
			? NonNullable<Props[Key]> extends readonly any[]
				? {}
				: NonNullable<Props[Key]> extends (...args: any[]) => any
					? {}
					: NonNullable<Props[Key]> extends Record<string, any>
						? {
								[SubKey in keyof NonNullable<Props[Key]> &
									string as `${Key}:${SubKey}`]?: NonNullable<Props[Key]>[SubKey]
							}
						: {}
			: {}
		: {}

type EmptyObjectIfNever<T> = [T] extends [never] ? {} : T

export type NameSpacedProps<Props extends Record<string, any>> = Props &
	EmptyObjectIfNever<
		UnionToIntersection<
			{
				[K in keyof Props & string]: NamespacedEntries<Props, K>
			}[keyof Props & string]
		>
	>

export type NameSpacedComponent<Component extends (...args: any[]) => any> = Component extends (
	props: infer Props,
	...rest: infer Rest
) => infer Return
	? (
			props: Props extends Record<string, any> ? NameSpacedProps<Props> : Props,
			...rest: Rest
		) => Return
	: Component

export function restructureProps<Props extends Record<string, any> | undefined>(props: Props) {
	if (!props || typeof props !== 'object') return props
	return organized(props, ({ key, get, set }, target) => {
		if (typeof key !== 'string') return organize(target, key, { get, set })
		const match = key.match(/^([^:]+):(.+)$/)
		if (match && match.length === 3) {
			const [, namespace, subKey] = match
			target[namespace] ??= {}
			return organize(target[namespace], subKey, { get, set })
		}
		return organize(target, key, { get, set })
	})
}

export function isNameSpacedComponent(component: unknown): boolean {
	return Boolean(
		component && typeof component === 'function' && (component as any)[NAME_SPACED_SYMBOL]
	)
}

export function nameSpaced<Component extends (...args: any[]) => any>(
	component: Component
): NameSpacedComponent<Component> {
	if (typeof component !== 'function') return component as NameSpacedComponent<Component>
	if (isNameSpacedComponent(component)) return component as NameSpacedComponent<Component>

	const wrapped = ((props: any, ...rest: any[]) => {
		const normalized = restructureProps(props)
		return component(normalized, ...rest)
	}) as NameSpacedComponent<Component>

	Object.defineProperty(wrapped, NAME_SPACED_SYMBOL, {
		value: true,
		enumerable: false,
		configurable: false,
	})
	Object.defineProperty(wrapped, '__original', {
		value: component,
		enumerable: false,
		configurable: false,
	})
	Object.assign(wrapped, component)
	Object.setPrototypeOf(wrapped, Object.getPrototypeOf(component))

	return wrapped
}

export function ensureNameSpaced<Component extends (...args: any[]) => any>(
	component: Component
): NameSpacedComponent<Component> {
	return nameSpaced(component)
}
