import { Eventful, EventsBase, reactive, unwrap } from 'mutts/src'

export abstract class PounceComponent<Events extends EventsBase> extends Eventful<Events> {
	public context: Record<PropertyKey, any> = {}

	constructor(
		protected readonly props: Record<string, any> = {},
		protected readonly children: any[] = [],
		protected readonly host: PounceElement
	) {
		super()
		const that = reactive(this)
		host.component = that
		// biome-ignore lint/correctness/noConstructorReturn: This is the whole point here
		return that
	}

	public on(events: Partial<Events>): void
	public on<EventType extends keyof Events>(event: EventType, cb: Events[EventType]): () => void
	public on(...args: any[]): Events[keyof Events] {
		return super.on.apply(unwrap(this), args as any) as Events[keyof Events]
	}

	public off(events: Partial<Events>): void
	public off<EventType extends keyof Events>(event: EventType, cb: Events[EventType]): void
	public off(...args: any[]): void {
		super.off.apply(unwrap(this), args as any)
	}

	public emit<EventType extends keyof Events>(event: EventType, ...args: any[]): void {
		super.emit.apply(unwrap(this), [event, ...args] as any)
	}

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
/**
 * Neutral custom element that does nothing but host Shadow DOM
 */
export class PounceElement extends HTMLElement {
	component?: PounceComponent<any>
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
