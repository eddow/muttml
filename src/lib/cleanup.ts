/**
 * WeakMap to store cleanup functions associated with HTMLElements
 */
const elementCleanupMap = new WeakMap<HTMLElement, Set<() => void>>()

/**
 * FinalizationRegistry to detect when elements are garbage collected
 */
const cleanupRegistry = new FinalizationRegistry((cleanups: Set<() => void>) => {
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
		// We register the element itself, and store both cleanup functions and component instance
		cleanupRegistry.register(element, cleanups)
	}
	cleanups.add(cleanup)

	// Debug logging (can be removed in production)
	if (typeof window !== 'undefined' && (window as any).DEBUG_CLEANUP) {
		console.log(`[Cleanup] Stored cleanup function for element:`, element.tagName, element)
	}
}
