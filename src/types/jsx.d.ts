import type { StyleInput } from '@/lib/styles'

declare global {
	const h: (type: any, props?: any, ...children: any[]) => JSX.Element
	const Fragment: (props: { children: any }) => any
	const Scope: (
		props: { children?: JSX.Children; [key: string]: any },
		scope: Record<PropertyKey, any>
	) => JSX.Element
	const For: <T>(props: {
		each: T[] | (() => T[])
		children: (item: T) => JSX.Children
	}) => JSX.Element
	type ComponentFunction = (
		props: any,
		scope: Record<PropertyKey, any>
	) => JSX.Element | JSX.Element[]
	namespace JSX {
		// biome-ignore lint/suspicious/noConfusingVoidType: Void ends up automatically
		type Child = Node | string | number | JSX.Element | void | false
		type Children = Child | Child[]
		// Specify the property name used for JSX children
		interface ElementChildrenAttribute {
			children: any
		}
		type Element = {
			render(scope?: Record<PropertyKey, any>): Node[]
			if?: boolean
			else?: boolean
			when?: (value: any) => boolean
			this?: (partial: Node | Node[]) => void
			use?: Record<string, any>
		}
		interface ElementClass {
			template: any
		}
		// Override the default JSX children handling
		// Allow any children type so components can accept function-as-children
		type IntrinsicAttributes =
			| { children: Children }
			| ({
					children?: any
					// Meta: capture component reference on render
					this?: Node
					if?: boolean
					else?: boolean
					when?: (value: any) => boolean
			  } & {
					[K in `use:${string}`]: any
			  } & {
					[K in `if:${string}`]?: boolean
			  } & {
					[K in `else:${string}`]?: boolean
			  } & {
					[K in `when:${string}`]?: (value: any) => boolean
			  })

		// Custom class type for conditional classes
		type ClassValue = string | ClassValue[] | Record<string, boolean> | null | undefined

		type Booleanish = boolean | 'true' | 'false'

		type AriaAttributesBase = {
			'aria-activeDescendant'?: string
			'aria-atomic'?: Booleanish
			'aria-autoComplete'?: 'none' | 'inline' | 'list' | 'both'
			'aria-brailleLabel'?: string
			'aria-brailleRoleDescription'?: string
			'aria-busy'?: Booleanish
			'aria-checked'?: Booleanish | 'mixed'
			'aria-colCount'?: number
			'aria-colIndex'?: number
			'aria-colIndexText'?: string
			'aria-colSpan'?: number
			'aria-controls'?: string
			'aria-current'?: Booleanish | 'page' | 'step' | 'location' | 'date' | 'time'
			'aria-describedBy'?: string
			'aria-description'?: string
			'aria-details'?: string
			'aria-disabled'?: Booleanish
			'aria-dropEffect'?: 'none' | 'copy' | 'execute' | 'link' | 'move' | 'popup'
			'aria-errorMessage'?: string
			'aria-expanded'?: Booleanish
			'aria-flowTo'?: string
			'aria-grabbed'?: Booleanish
			'aria-hasPopup'?: Booleanish | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog'
			'aria-hidden'?: Booleanish
			'aria-invalid'?: Booleanish | 'grammar' | 'spelling'
			'aria-keyShortcuts'?: string
			'aria-label'?: string
			'aria-labelledBy'?: string
			'aria-level'?: number
			'aria-live'?: 'off' | 'assertive' | 'polite'
			'aria-modal'?: Booleanish
			'aria-multiLine'?: Booleanish
			'aria-multiSelectable'?: Booleanish
			'aria-orientation'?: 'horizontal' | 'vertical'
			'aria-owns'?: string
			'aria-placeholder'?: string
			'aria-posInSet'?: number
			'aria-pressed'?: Booleanish | 'mixed'
			'aria-readOnly'?: Booleanish
			'aria-relevant'?: 'additions' | 'additions text' | 'all' | 'removals' | 'text'
			'aria-required'?: Booleanish
			'aria-roleDescription'?: string
			'aria-rowCount'?: number
			'aria-rowIndex'?: number
			'aria-rowIndexText'?: string
			'aria-rowSpan'?: number
			'aria-selected'?: Booleanish
			'aria-setSize'?: number
			'aria-sort'?: 'none' | 'ascending' | 'descending' | 'other'
			'aria-valueMax'?: number
			'aria-valueMin'?: number
			'aria-valueNow'?: number
			'aria-valueText'?: string
		}

		type AriaAttributes = AriaAttributesBase & {
			[K in Exclude<`aria-${string}`, keyof AriaAttributesBase>]?:
				| string
				| number
				| boolean
				| undefined
		}

		type DataAttributes = {
			[K in `data-${string}`]?: string | number | boolean | null | undefined
		}

		// Common, reusable HTML attributes shared by most elements
		type GlobalHTMLAttributes = AriaAttributes &
			DataAttributes & {
				// Global attributes
				id?: string
				class?: ClassValue
				style?: string | StyleInput
				title?: string
				lang?: string
				dir?: 'ltr' | 'rtl' | 'auto'
				hidden?: boolean
				tabIndex?: number
				accessKey?: string
				contentEditable?: boolean | 'true' | 'false' | 'inherit'
				spellCheck?: boolean | 'true' | 'false'
				translate?: 'yes' | 'no'
				autoCapitalize?: 'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters'
				autoCorrect?: 'on' | 'off'
				autoComplete?: string
				enterKeyHint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send'
				inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search'
				is?: string
				itemId?: string
				itemProp?: string
				itemRef?: string
				itemScope?: boolean
				itemType?: string
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
			GlobalHTMLAttributes &
			MouseReactiveHTMLAttributes & {
				children?: Children
				// Additional common non-mouse events
				onFocus?: (event: FocusEvent) => void
				onBlur?: (event: FocusEvent) => void
				onKeydown?: (event: KeyboardEvent) => void
				onKeyup?: (event: KeyboardEvent) => void
				onKeypress?: (event: KeyboardEvent) => void
			}

		interface InputNumber {
			type: 'number' | 'range'
			value?: number
			min?: number
			max?: number
			step?: number
			'update:value'?(value: number): void
		}
		interface InputString {
			type?:
				| 'text'
				| 'password'
				| 'email'
				| 'tel'
				| 'url'
				| 'search'
				| 'date'
				| 'time'
				| 'datetime-local'
				| 'month'
				| 'week'
				| 'color'
				| 'radio'
				| 'file'
				| 'hidden'
				| 'submit'
				| 'reset'
				| 'button'
			value?: string
			'update:value'?(value: string): void
		}
		interface InputBoolean {
			type: 'checkbox' | 'radio'
			checked?: boolean
			value?: string
			'update:checked'?(value: boolean): void
		}
		interface IntrinsicElements {
			// Form Elements
			input: BaseHTMLAttributes &
				(InputNumber | InputString | InputBoolean) & {
					name?: string
					placeholder?: string
					disabled?: boolean
					required?: boolean
					readOnly?: boolean
					min?: number | string
					max?: number | string
					step?: number | string
					size?: number
					multiple?: boolean
					accept?: string
					autoComplete?: string
					autoCorrect?: 'on' | 'off'
					autoCapitalize?: 'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters'
					spellCheck?: boolean | 'true' | 'false'
					pattern?: string
					maxLength?: number
					minLength?: number
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
				readOnly?: boolean
				rows?: number
				cols?: number
				maxLength?: number
				minLength?: number
				wrap?: 'soft' | 'hard' | 'off'
				autoComplete?: string
				autoCorrect?: 'on' | 'off'
				autoCapitalize?: 'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters'
				spellCheck?: boolean | 'true' | 'false'
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
				autoComplete?: string
				// Events
				onChange?: (event: Event) => void
				onSelect?: (event: Event) => void
				onInvalid?: (event: Event) => void
			}

			button: BaseHTMLAttributes & {
				type?: 'button' | 'submit' | 'reset'
				disabled?: boolean
				autoFocus?: boolean
				form?: string
				formAction?: string
				formEnctype?: string
				formMethod?: string
				formNoValidate?: boolean
				formTarget?: string
				name?: string
				value?: string
			}

			form: BaseHTMLAttributes & {
				action?: string
				method?: 'get' | 'post' | 'put' | 'delete' | 'patch'
				enctype?: string
				autoComplete?: string
				noValidate?: boolean
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
				crossOrigin?: 'anonymous' | 'use-credentials'
				useMap?: string
				isMap?: boolean
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
				crossOrigin?: 'anonymous' | 'use-credentials'
				playsInline?: boolean
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
				crossOrigin?: 'anonymous' | 'use-credentials'
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
				hrefLang?: string
				type?: string
				referrerPolicy?: string
			}

			// Additional HTML elements with notable attributes
			dialog: BaseHTMLAttributes & {
				open?: boolean
				onCancel?: (event: Event) => void
				onClose?: (event: Event) => void
			}

			details: BaseHTMLAttributes & {
				open?: boolean
				onToggle?: (event: Event) => void
			}

			track: BaseHTMLAttributes & {
				default?: boolean
				kind?: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata'
				src?: string
				srclang?: string
				label?: string
			}

			script: BaseHTMLAttributes & {
				src?: string
				type?: string
				async?: boolean
				defer?: boolean
				nomodule?: boolean
				crossOrigin?: 'anonymous' | 'use-credentials'
				integrity?: string
				referrerPolicy?: string
				onLoad?: (event: Event) => void
				onError?: (event: Event) => void
			}

			iframe: BaseHTMLAttributes & {
				src?: string
				srcDoc?: string
				name?: string
				width?: number | string
				height?: number | string
				allow?: string
				sandbox?: string
				loading?: 'eager' | 'lazy'
				referrerPolicy?: string
				allowFullScreen?: boolean
				onLoad?: (event: Event) => void
				onError?: (event: Event) => void
			}

			ol: BaseHTMLAttributes & {
				reversed?: boolean
				start?: number
				type?: '1' | 'a' | 'A' | 'i' | 'I'
			}

			option: BaseHTMLAttributes & {
				disabled?: boolean
				selected?: boolean
				label?: string
				value?: string
			}

			optgroup: BaseHTMLAttributes & {
				disabled?: boolean
				label?: string
			}

			progress: BaseHTMLAttributes & {
				value?: number | string
				max?: number | string
			}

			meter: BaseHTMLAttributes & {
				value?: number | string
				min?: number | string
				max?: number | string
				low?: number | string
				high?: number | string
				optimum?: number | string
			}

			link: BaseHTMLAttributes & {
				rel?: string
				href?: string
				as?: string
				crossOrigin?: 'anonymous' | 'use-credentials'
				disabled?: boolean
				fetchPriority?: 'high' | 'low' | 'auto'
				imageSizes?: string
				imageSrcSet?: string
				media?: string
				referrerPolicy?: string
				integrity?: string
				type?: string
				sizes?: string
				onLoad?: (event: Event) => void
				onError?: (event: Event) => void
			}

			source: BaseHTMLAttributes & {
				src?: string
				type?: string
				srcSet?: string
				sizes?: string
				media?: string
			}

			area: BaseHTMLAttributes & {
				alt?: string
				coords?: string
				download?: string | boolean
				href?: string
				rel?: string
				shape?: 'rect' | 'circle' | 'poly' | 'default'
				target?: string
				referrerPolicy?: string
			}

			map: BaseHTMLAttributes & {
				name?: string
			}

			canvas: BaseHTMLAttributes & {
				width?: number | string
				height?: number | string
			}

			col: BaseHTMLAttributes & { span?: number }
			colgroup: BaseHTMLAttributes & { span?: number }
			/* thead/tbody/tfoot/tr omitted since they add no extra attributes */
			th: BaseHTMLAttributes & {
				abbr?: string
				colSpan?: number
				rowSpan?: number
				headers?: string
				scope?: 'row' | 'col' | 'rowgroup' | 'colgroup' | 'auto'
			}
			td: BaseHTMLAttributes & {
				colSpan?: number
				rowSpan?: number
				headers?: string
			}

			slot: BaseHTMLAttributes & { name?: string }

			// Common HTML attributes for all elements
			[elemName: string]: BaseHTMLAttributes
		}
	}
}
