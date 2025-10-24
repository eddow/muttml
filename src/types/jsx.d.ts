declare global {
	namespace JSX {
		type Element = { mount(context?: Record<PropertyKey, any>): Node }
		interface ElementClass {
			template: any
		}
		interface ElementAttributesProperty {
			props: any
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
			'on:click'?: (event: MouseEvent) => void
			'on:mousedown'?: (event: MouseEvent) => void
			'on:mouseup'?: (event: MouseEvent) => void
			'on:mouseover'?: (event: MouseEvent) => void
			'on:mouseout'?: (event: MouseEvent) => void
			'on:mouseenter'?: (event: MouseEvent) => void
			'on:mouseleave'?: (event: MouseEvent) => void
			'on:mousemove'?: (event: MouseEvent) => void
			'on:contextmenu'?: (event: MouseEvent) => void
			'on:dblclick'?: (event: MouseEvent) => void
			'on:focus'?: (event: FocusEvent) => void
			'on:blur'?: (event: FocusEvent) => void
			'on:keydown'?: (event: KeyboardEvent) => void
			'on:keyup'?: (event: KeyboardEvent) => void
			'on:keypress'?: (event: KeyboardEvent) => void
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
				'on:input'?: (event: Event) => void
				'on:change'?: (event: Event) => void
				'on:focus'?: (event: FocusEvent) => void
				'on:blur'?: (event: FocusEvent) => void
				'on:keydown'?: (event: KeyboardEvent) => void
				'on:keyup'?: (event: KeyboardEvent) => void
				'on:keypress'?: (event: KeyboardEvent) => void
				'on:select'?: (event: Event) => void
				'on:invalid'?: (event: Event) => void
				'on:reset'?: (event: Event) => void
				'on:search'?: (event: Event) => void
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
				'on:input'?: (event: Event) => void
				'on:change'?: (event: Event) => void
				'on:focus'?: (event: FocusEvent) => void
				'on:blur'?: (event: FocusEvent) => void
				'on:keydown'?: (event: KeyboardEvent) => void
				'on:keyup'?: (event: KeyboardEvent) => void
				'on:keypress'?: (event: KeyboardEvent) => void
				'on:select'?: (event: Event) => void
				'on:invalid'?: (event: Event) => void
			}

			select: BaseHTMLAttributes & {
				value?: any
				disabled?: boolean
				required?: boolean
				multiple?: boolean
				size?: number
				autocomplete?: string
				// Events
				'on:change'?: (event: Event) => void
				'on:focus'?: (event: FocusEvent) => void
				'on:blur'?: (event: FocusEvent) => void
				'on:keydown'?: (event: KeyboardEvent) => void
				'on:keyup'?: (event: KeyboardEvent) => void
				'on:keypress'?: (event: KeyboardEvent) => void
				'on:select'?: (event: Event) => void
				'on:invalid'?: (event: Event) => void
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
				'on:click'?: (event: MouseEvent) => void
				'on:mousedown'?: (event: MouseEvent) => void
				'on:mouseup'?: (event: MouseEvent) => void
				'on:mouseover'?: (event: MouseEvent) => void
				'on:mouseout'?: (event: MouseEvent) => void
				'on:mouseenter'?: (event: MouseEvent) => void
				'on:mouseleave'?: (event: MouseEvent) => void
				'on:mousemove'?: (event: MouseEvent) => void
				'on:contextmenu'?: (event: MouseEvent) => void
				'on:dblclick'?: (event: MouseEvent) => void
				'on:focus'?: (event: FocusEvent) => void
				'on:blur'?: (event: FocusEvent) => void
				'on:keydown'?: (event: KeyboardEvent) => void
				'on:keyup'?: (event: KeyboardEvent) => void
				'on:keypress'?: (event: KeyboardEvent) => void
				'on:invalid'?: (event: Event) => void
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
				'on:submit'?: (event: SubmitEvent) => void
				'on:reset'?: (event: Event) => void
				'on:invalid'?: (event: Event) => void
			}

			label: BaseHTMLAttributes & {
				htmlFor?: string
				form?: string
				// Events
				'on:click'?: (event: MouseEvent) => void
				'on:mousedown'?: (event: MouseEvent) => void
				'on:mouseup'?: (event: MouseEvent) => void
				'on:mouseover'?: (event: MouseEvent) => void
				'on:mouseout'?: (event: MouseEvent) => void
				'on:mouseenter'?: (event: MouseEvent) => void
				'on:mouseleave'?: (event: MouseEvent) => void
				'on:mousemove'?: (event: MouseEvent) => void
				'on:contextmenu'?: (event: MouseEvent) => void
				'on:dblclick'?: (event: MouseEvent) => void
			}

			fieldset: BaseHTMLAttributes & {
				disabled?: boolean
				form?: string
				name?: string
				// Events
				'on:click'?: (event: MouseEvent) => void
				'on:mousedown'?: (event: MouseEvent) => void
				'on:mouseup'?: (event: MouseEvent) => void
				'on:mouseover'?: (event: MouseEvent) => void
				'on:mouseout'?: (event: MouseEvent) => void
				'on:mouseenter'?: (event: MouseEvent) => void
				'on:mouseleave'?: (event: MouseEvent) => void
				'on:mousemove'?: (event: MouseEvent) => void
				'on:contextmenu'?: (event: MouseEvent) => void
				'on:dblclick'?: (event: MouseEvent) => void
			}

			legend: BaseHTMLAttributes & {
				// Events
				'on:click'?: (event: MouseEvent) => void
				'on:mousedown'?: (event: MouseEvent) => void
				'on:mouseup'?: (event: MouseEvent) => void
				'on:mouseover'?: (event: MouseEvent) => void
				'on:mouseout'?: (event: MouseEvent) => void
				'on:mouseenter'?: (event: MouseEvent) => void
				'on:mouseleave'?: (event: MouseEvent) => void
				'on:mousemove'?: (event: MouseEvent) => void
				'on:contextmenu'?: (event: MouseEvent) => void
				'on:dblclick'?: (event: MouseEvent) => void
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
				'on:load'?: (event: Event) => void
				'on:error'?: (event: Event) => void
				'on:abort'?: (event: Event) => void
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
				'on:loadstart'?: (event: Event) => void
				'on:loadeddata'?: (event: Event) => void
				'on:loadedmetadata'?: (event: Event) => void
				'on:canplay'?: (event: Event) => void
				'on:canplaythrough'?: (event: Event) => void
				'on:play'?: (event: Event) => void
				'on:playing'?: (event: Event) => void
				'on:pause'?: (event: Event) => void
				'on:ended'?: (event: Event) => void
				'on:error'?: (event: Event) => void
				'on:abort'?: (event: Event) => void
				'on:emptied'?: (event: Event) => void
				'on:stalled'?: (event: Event) => void
				'on:suspend'?: (event: Event) => void
				'on:waiting'?: (event: Event) => void
				'on:durationchange'?: (event: Event) => void
				'on:timeupdate'?: (event: Event) => void
				'on:progress'?: (event: Event) => void
				'on:ratechange'?: (event: Event) => void
				'on:volumechange'?: (event: Event) => void
				'on:seeked'?: (event: Event) => void
				'on:seeking'?: (event: Event) => void
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
				'on:loadstart'?: (event: Event) => void
				'on:loadeddata'?: (event: Event) => void
				'on:loadedmetadata'?: (event: Event) => void
				'on:canplay'?: (event: Event) => void
				'on:canplaythrough'?: (event: Event) => void
				'on:play'?: (event: Event) => void
				'on:playing'?: (event: Event) => void
				'on:pause'?: (event: Event) => void
				'on:ended'?: (event: Event) => void
				'on:error'?: (event: Event) => void
				'on:abort'?: (event: Event) => void
				'on:emptied'?: (event: Event) => void
				'on:stalled'?: (event: Event) => void
				'on:suspend'?: (event: Event) => void
				'on:waiting'?: (event: Event) => void
				'on:durationchange'?: (event: Event) => void
				'on:timeupdate'?: (event: Event) => void
				'on:progress'?: (event: Event) => void
				'on:ratechange'?: (event: Event) => void
				'on:volumechange'?: (event: Event) => void
				'on:seeked'?: (event: Event) => void
				'on:seeking'?: (event: Event) => void
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
				'on:click'?: (event: MouseEvent) => void
				'on:mousedown'?: (event: MouseEvent) => void
				'on:mouseup'?: (event: MouseEvent) => void
				'on:mouseover'?: (event: MouseEvent) => void
				'on:mouseout'?: (event: MouseEvent) => void
				'on:mouseenter'?: (event: MouseEvent) => void
				'on:mouseleave'?: (event: MouseEvent) => void
				'on:mousemove'?: (event: MouseEvent) => void
				'on:contextmenu'?: (event: MouseEvent) => void
				'on:dblclick'?: (event: MouseEvent) => void
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
