/**
 * Neutral custom element that does nothing but host Shadow DOM
 */
export class NeutralHost extends HTMLElement {
	constructor() {
		super()
		this.attachShadow({ mode: 'open' })
	}
}

customElements.define('neutral-host', NeutralHost)
