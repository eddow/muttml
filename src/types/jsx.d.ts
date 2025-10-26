import { attributesSymbol } from '../lib/component'

declare global {
	// Global h function for JSX
	const h: any
	namespace JSX {
		type Element = { mount(context?: Record<PropertyKey, any>): Node }
		interface ElementClass {
			template: any
		}
		interface ElementAttributesProperty {
			[attributesSymbol]: any
		}
		interface ElementChildrenAttribute {
			children: any
		}
		// Override the default JSX children handling
		interface IntrinsicAttributes {
			children?: any
		}

		// Custom class type for conditional classes
		type ClassValue = string | ClassValue[] | Record<string, boolean> | null | undefined

		// Base interface for common HTML attributes
		type BaseHTMLAttributes = IntrinsicAttributes & {
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
			// Common events for all elements
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
			onFocus?: (event: FocusEvent) => void
			onBlur?: (event: FocusEvent) => void
			onKeydown?: (event: KeyboardEvent) => void
			onKeyup?: (event: KeyboardEvent) => void
			onKeypress?: (event: KeyboardEvent) => void
		}

		interface IntrinsicElements {
			// Form Elements
			input: BaseHTMLAttributes & {
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
				value?: any
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
				checked?: boolean
				// Events
				onInput?: (event: Event) => void
				onChange?: (event: Event) => void
				onFocus?: (event: FocusEvent) => void
				onBlur?: (event: FocusEvent) => void
				onKeydown?: (event: KeyboardEvent) => void
				onKeyup?: (event: KeyboardEvent) => void
				onKeypress?: (event: KeyboardEvent) => void
				onSelect?: (event: Event) => void
				onInvalid?: (event: Event) => void
				onReset?: (event: Event) => void
				onSearch?: (event: Event) => void
			}

			textarea: BaseHTMLAttributes & {
				value?: any
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
				onFocus?: (event: FocusEvent) => void
				onBlur?: (event: FocusEvent) => void
				onKeydown?: (event: KeyboardEvent) => void
				onKeyup?: (event: KeyboardEvent) => void
				onKeypress?: (event: KeyboardEvent) => void
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
				onFocus?: (event: FocusEvent) => void
				onBlur?: (event: FocusEvent) => void
				onKeydown?: (event: KeyboardEvent) => void
				onKeyup?: (event: KeyboardEvent) => void
				onKeypress?: (event: KeyboardEvent) => void
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
				// Events
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
				onFocus?: (event: FocusEvent) => void
				onBlur?: (event: FocusEvent) => void
				onKeydown?: (event: KeyboardEvent) => void
				onKeyup?: (event: KeyboardEvent) => void
				onKeypress?: (event: KeyboardEvent) => void
				onInvalid?: (event: Event) => void
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
				// Events
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

			fieldset: BaseHTMLAttributes & {
				disabled?: boolean
				form?: string
				name?: string
				// Events
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

			legend: BaseHTMLAttributes & {
				// Events
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
				// Events
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
