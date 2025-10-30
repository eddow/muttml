declare global {
	// Global h function for JSX
	const h: any
	const Fragment: any
	const Scope: (
		props: { children?: any; [key: string]: any },
		scope: Record<PropertyKey, any>
	) => JSX.Element
	const For: <T>(props: {
		each: T[] | (() => T[])
		children: (item: T) => JSX.Element
	}) => JSX.Element
	type ComponentFunction = (
		props: any,
		scope: Record<PropertyKey, any>
	) => JSX.Element | JSX.Element[]
	// biome-ignore lint/suspicious/noConfusingVoidType: Void ends up automatically
	type HTMLChild = Node | string | number | JSX.Element | void | false
	namespace JSX {
		// Specify the property name used for JSX children
		interface ElementChildrenAttribute {
			children: any
		}
		type Element = { render(scope?: Record<PropertyKey, any>): Node[] }
		interface ElementClass {
			template: any
		}
		// Override the default JSX children handling
		// Allow any children type so components can accept function-as-children
		interface IntrinsicAttributes {
			children?: any
			// Meta: capture component reference on render
			this?: Node | Node[]
			[`if:${ScopeName}`]?: boolean
			[`else:${ScopeName}`]?: boolean
			[`when:${ScopeName}`]?: (value: any) => boolean
			[`use:${ScopeName}`]?: any //(target: Node | Node[], value: any, scope: Record<PropertyKey, any>) => void
		}

		// Custom class type for conditional classes
		type ClassValue = string | ClassValue[] | Record<string, boolean> | null | undefined

		// Common, reusable HTML attributes shared by most elements
		type GlobalHTMLAttributes = {
			// Global attributes
			id?: string
			class?: ClassValue
			style?: string | Record<string, string | number>
			title?: string
			lang?: string
			dir?: 'ltr' | 'rtl' | 'auto'
			hidden?: boolean
			tabindex?: number
			accesskey?: string
			contenteditable?: boolean | 'true' | 'false' | 'inherit'
			spellcheck?: boolean | 'true' | 'false'
			translate?: 'yes' | 'no'
			autocapitalize?: 'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters'
			autocorrect?: 'on' | 'off'
			autocomplete?: string
			enterkeyhint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send'
			inputmode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search'
			is?: string
			itemid?: string
			itemprop?: string
			itemref?: string
			itemscope?: boolean
			itemtype?: string
			role?: string
		}

		// Reusable mouse event handlers for DOM elements
		type MouseReactiveHTMLAttributes = {
			onClick?: (event: MouseEvent) => void
			onMousedown?: (event: MouseEvent) => void
			onMouseup?: (event: MouseEvent) => void
			onMouseover?: (event: MouseEvent) => void
			onMouseout?: (event: MouseEvent) => void
			onMouseenter?: (event: MouseEvent) => void
			onMouseleave?: (event: MouseEvent) => void
			onMousemove?: (event: MouseEvent) => void
			onContextmenu?: (event: MouseEvent) => void
			onDblclick?: (event: MouseEvent) => void
		}

		// Base interface for common HTML attributes
		type BaseHTMLAttributes = IntrinsicAttributes &
			DefaultDirectiveProps &
			AllNamedDirectiveProps &
			GlobalHTMLAttributes &
			MouseReactiveHTMLAttributes & {
				children?: HTMLChild | HTMLChild[]
				// Additional common non-mouse events
				onFocus?: (event: FocusEvent) => void
				onBlur?: (event: FocusEvent) => void
				onKeydown?: (event: KeyboardEvent) => void
				onKeyup?: (event: KeyboardEvent) => void
				onKeypress?: (event: KeyboardEvent) => void
			}

		interface IntrinsicElements {
			// Form Elements
			input: BaseHTMLAttributes & {
				name?: string
				type?:
					| 'text'
					| 'password'
					| 'email'
					| 'number'
					| 'tel'
					| 'url'
					| 'search'
					| 'date'
					| 'time'
					| 'datetime-local'
					| 'month'
					| 'week'
					| 'color'
					| 'checkbox'
					| 'radio'
					| 'file'
					| 'hidden'
					| 'submit'
					| 'reset'
					| 'button'
					| 'range'
				value?: string | number
				checked?: boolean
				'update:checked'?: (value: boolean) => void
				'update:value'?: (value: string | number) => void
				placeholder?: string
				disabled?: boolean
				required?: boolean
				readonly?: boolean
				min?: number | string
				max?: number | string
				step?: number | string
				size?: number
				multiple?: boolean
				accept?: string
				autocomplete?: string
				autocorrect?: 'on' | 'off'
				autocapitalize?: 'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters'
				spellcheck?: boolean | 'true' | 'false'
				pattern?: string
				maxlength?: number
				minlength?: number
				// Events
				onInput?: (event: Event) => void
				onChange?: (event: Event) => void
				onSelect?: (event: Event) => void
				onInvalid?: (event: Event) => void
				onReset?: (event: Event) => void
				onSearch?: (event: Event) => void
			}

			textarea: BaseHTMLAttributes & {
				value?: string
				placeholder?: string
				disabled?: boolean
				required?: boolean
				readonly?: boolean
				rows?: number
				cols?: number
				maxlength?: number
				minlength?: number
				wrap?: 'soft' | 'hard' | 'off'
				autocomplete?: string
				autocorrect?: 'on' | 'off'
				autocapitalize?: 'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters'
				spellcheck?: boolean | 'true' | 'false'
				// Events
				onInput?: (event: Event) => void
				onChange?: (event: Event) => void
				onSelect?: (event: Event) => void
				onInvalid?: (event: Event) => void
			}

			select: BaseHTMLAttributes & {
				value?: any
				disabled?: boolean
				required?: boolean
				multiple?: boolean
				size?: number
				autocomplete?: string
				// Events
				onChange?: (event: Event) => void
				onSelect?: (event: Event) => void
				onInvalid?: (event: Event) => void
			}

			button: BaseHTMLAttributes & {
				type?: 'button' | 'submit' | 'reset'
				disabled?: boolean
				autofocus?: boolean
				form?: string
				formaction?: string
				formenctype?: string
				formmethod?: string
				formnovalidate?: boolean
				formtarget?: string
				name?: string
				value?: string
			}

			form: BaseHTMLAttributes & {
				action?: string
				method?: 'get' | 'post' | 'put' | 'delete' | 'patch'
				enctype?: string
				autocomplete?: string
				novalidate?: boolean
				target?: string
				name?: string
				accept?: string
				acceptCharset?: string
				// Events
				onSubmit?: (event: SubmitEvent) => void
				onReset?: (event: Event) => void
				onInvalid?: (event: Event) => void
			}

			label: BaseHTMLAttributes & {
				htmlFor?: string
				form?: string
			}

			fieldset: BaseHTMLAttributes & {
				disabled?: boolean
				form?: string
				name?: string
			}

			legend: BaseHTMLAttributes & {}

			// Media Elements
			img: BaseHTMLAttributes & {
				src?: string
				alt?: string
				width?: number | string
				height?: number | string
				crossorigin?: 'anonymous' | 'use-credentials'
				usemap?: string
				ismap?: boolean
				loading?: 'lazy' | 'eager'
				decoding?: 'sync' | 'async' | 'auto'
				// Events
				onLoad?: (event: Event) => void
				onError?: (event: Event) => void
				onAbort?: (event: Event) => void
			}

			video: BaseHTMLAttributes & {
				src?: string
				poster?: string
				preload?: 'none' | 'metadata' | 'auto'
				autoplay?: boolean
				loop?: boolean
				muted?: boolean
				controls?: boolean
				width?: number | string
				height?: number | string
				crossorigin?: 'anonymous' | 'use-credentials'
				playsinline?: boolean
				// Events
				onLoadstart?: (event: Event) => void
				onLoadeddata?: (event: Event) => void
				onLoadedmetadata?: (event: Event) => void
				onCanplay?: (event: Event) => void
				onCanplaythrough?: (event: Event) => void
				onPlay?: (event: Event) => void
				onPlaying?: (event: Event) => void
				onPause?: (event: Event) => void
				onEnded?: (event: Event) => void
				onError?: (event: Event) => void
				onAbort?: (event: Event) => void
				onEmptied?: (event: Event) => void
				onStalled?: (event: Event) => void
				onSuspend?: (event: Event) => void
				onWaiting?: (event: Event) => void
				onDurationchange?: (event: Event) => void
				onTimeupdate?: (event: Event) => void
				onProgress?: (event: Event) => void
				onRatechange?: (event: Event) => void
				onVolumechange?: (event: Event) => void
				onSeeked?: (event: Event) => void
				onSeeking?: (event: Event) => void
			}

			audio: BaseHTMLAttributes & {
				src?: string
				preload?: 'none' | 'metadata' | 'auto'
				autoplay?: boolean
				loop?: boolean
				muted?: boolean
				controls?: boolean
				crossorigin?: 'anonymous' | 'use-credentials'
				// Events
				onLoadstart?: (event: Event) => void
				onLoadeddata?: (event: Event) => void
				onLoadedmetadata?: (event: Event) => void
				onCanplay?: (event: Event) => void
				onCanplaythrough?: (event: Event) => void
				onPlay?: (event: Event) => void
				onPlaying?: (event: Event) => void
				onPause?: (event: Event) => void
				onEnded?: (event: Event) => void
				onError?: (event: Event) => void
				onAbort?: (event: Event) => void
				onEmptied?: (event: Event) => void
				onStalled?: (event: Event) => void
				onSuspend?: (event: Event) => void
				onWaiting?: (event: Event) => void
				onDurationchange?: (event: Event) => void
				onTimeupdate?: (event: Event) => void
				onProgress?: (event: Event) => void
				onRatechange?: (event: Event) => void
				onVolumechange?: (event: Event) => void
				onSeeked?: (event: Event) => void
				onSeeking?: (event: Event) => void
			}

			// Interactive Elements
			a: BaseHTMLAttributes & {
				href?: string
				target?: '_blank' | '_self' | '_parent' | '_top' | string
				rel?: string
				download?: string
				hreflang?: string
				type?: string
				referrerpolicy?: string
			}

			// Common HTML attributes for all elements
			[elemName: string]: BaseHTMLAttributes & {
				// 2-way binding specific attributes
				value?: any
				checked?: boolean
				selected?: boolean
			}
		}
	}
}
export {}
