/**
 * WeakMap to store cleanup functions associated with HTMLElements
 */
const elementCleanupMap = new WeakMap<HTMLElement, Set<() => void>>()

/**
 * FinalizationRegistry to detect when elements are garbage collected
 */
const cleanupRegistry = new FinalizationRegistry((heldValue: Set<() => void>) => {
	const cleanups = heldValue

	if (cleanups && cleanups.size > 0) {
		// Debug logging (can be removed in production)
		if (typeof window !== 'undefined' && (window as any).DEBUG_CLEANUP) {
			console.log(`[Cleanup] Element garbage collected, cleaning up ${cleanups.size} functions`)
		}

		// Call all cleanup functions
		for (const cleanup of cleanups) {
			try {
				cleanup()
				if (typeof window !== 'undefined' && (window as any).DEBUG_CLEANUP) {
					console.log(`[Cleanup] ✓ Cleanup function executed successfully`)
				}
			} catch (error) {
				console.warn('Error during element cleanup:', error)
			}
		}
	}
})

/**
 * Store a cleanup function for an element
 */
export function storeCleanupForElement(element: HTMLElement, cleanup: () => void) {
	let cleanups = elementCleanupMap.get(element)
	if (!cleanups) {
		cleanups = new Set()
		elementCleanupMap.set(element, cleanups)

		// Register the element with FinalizationRegistry for GC cleanup
		// We register the element itself, and store the cleanup functions as the held value
		cleanupRegistry.register(element, cleanups)
	}
	cleanups.add(cleanup)

	// Debug logging (can be removed in production)
	if (typeof window !== 'undefined' && (window as any).DEBUG_CLEANUP) {
		console.log(`[Cleanup] Stored cleanup function for element:`, element.tagName, element)
	}
}

/**
 * Global hook to catch HTMLElement.toString() calls on proxied elements
 * This helps debug when elements are rendered as strings instead of being unwrapped
 */
function setupHTMLElementToStringHook() {
	const originalToString = HTMLElement.prototype.toString

	HTMLElement.prototype.toString = function () {
		// Check if this element is a proxy (has reactive properties)
		if (this && typeof this === 'object' && this.constructor === HTMLElement) {
			// Check for common proxy indicators
			const isProxy =
				Object.hasOwn(this, '__reactive__') ||
				Object.hasOwn(this, '__isProxy__') ||
				(this as any).__target !== undefined

			if (isProxy) {
				console.warn('🚨 HTMLElement.toString() called on proxied element:', {
					element: this,
					tagName: this.tagName,
					className: this.className,
					stack: new Error().stack,
				})
			}
		}

		return originalToString.call(this)
	}
}

// Set up the hook immediately
setupHTMLElementToStringHook()
