import { computed, reactive } from 'mutts/src'

export const attributesSymbol = Symbol('attributes')

type PropsDesc<P extends Record<string, any>> = {
	[K in keyof P]:
		| P[K]
		| (() => P[K])
		| {
				get: () => P[K]
				set: (value: P[K]) => void
		  }
}

abstract class PounceComponentBase<Props extends Record<string, any> = Record<string, any>> {
	public context: Record<PropertyKey, any> = {}
	public declare [attributesSymbol]: Props
	constructor(
		props: PropsDesc<Props>,
		protected readonly children: Element[] = [],
		protected readonly host: PounceElement
	) {
		const that = reactive(this)
		host.component = that
		for (const [key, value] of Object.entries(props || {})) {
			if (key !== 'style') {
				// Check for 2-way binding object {get:, set:}
				if (typeof value === 'object' && value !== null && 'get' in value && 'set' in value) {
					Object.defineProperty(this, key, {
						get: () => computed(value.get),
						set: (newValue) => value.set(newValue),
						enumerable: true,
					})
				} else if (typeof value === 'function') {
					// One-way binding
					Object.defineProperty(this, key, {
						get: () => computed(value),
						enumerable: true,
					})
				} else {
					// Static value
					Object.defineProperty(this, key, {
						value: value,
						enumerable: true,
						writable: false,
					})
				}
			}
		}
		// biome-ignore lint/correctness/noConstructorReturn: This is the whole point here
		return that
	}

	// Event methods are inherited from Eventful base class

	static get style(): string | undefined {
		return undefined
	}

	public abstract get template(): any

	public get style(): string | undefined {
		return undefined
	}

	/**
	 * Lifecycle method called when the component is mounted
	 * Override this method in your components to perform setup tasks
	 */
	public mount(): void {
		// Default implementation - override in subclasses
	}

	/**
	 * Lifecycle method called when the component is unmounted
	 * Override this method in your components to perform cleanup tasks
	 */
	public unmount(): void {
		// Default implementation - override in subclasses
	}
}
/*
type AllOptional<T> = {
	[K in keyof T as undefined extends T[K] ? K : never]-?: T[K]
}

type AllDefined<T> = {
	[K in keyof T]-?: T[K]
}*/

export function PounceComponent<
	Props extends Record<string, any>,
	DefaultProps extends Record<string, any>,
>(defaultProps: (givenProps: Props) => DefaultProps) {
	type UsedProps = Props & Partial<DefaultProps>
	abstract class PounceComponent extends PounceComponentBase<UsedProps> {
		constructor(props: PropsDesc<UsedProps>, children: Element[], host: PounceElement) {
			super(props, children, host)
			console.log('New', new.target.name)
			for (const [name, value] of Object.entries(defaultProps(this as any)))
				if (!(name in this))
					Object.defineProperty(this, name, {
						value: value,
						enumerable: true,
						configurable: true,
						writable: true,
					})
		}
	}

	return PounceComponent as unknown as abstract new (
		attributes: PropsDesc<UsedProps>,
		children: Element[],
		host: PounceElement
	) => PounceComponentBase<UsedProps> & Props & DefaultProps
}
/**
 * Neutral custom element that does nothing but host Shadow DOM
 */
export class PounceElement extends HTMLElement {
	component?: PounceComponentBase
	constructor() {
		super()
		this.attachShadow({ mode: 'open' })
	}
	connectedCallback() {
		this.component?.mount()
	}
	disconnectedCallback() {
		this.component?.unmount()
	}
}

customElements.define('pounce-element', PounceElement)
