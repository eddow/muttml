const elementCleanupMap = new Map<HTMLElement, Set<() => void>>()

/**
 * Store a cleanup function for an element
 */
export function storeCleanupForElement(element: HTMLElement, cleanup: () => void) {
	let cleanups = elementCleanupMap.get(element)
	if (!cleanups) {
		cleanups = new Set()
		elementCleanupMap.set(element, cleanups)
	}
	cleanups.add(cleanup)

	// Debug logging (can be removed in production)
	if (typeof window !== 'undefined' && (window as any).DEBUG_CLEANUP) {
		console.log(`[Cleanup] Stored cleanup function for element:`, element.tagName, element)
	}
}

export function cleanupAllManagedChildren() {
	for (const [element, cleanups] of elementCleanupMap.entries()) {
		if (!element.isConnected) {
			element.style.backgroundColor = 'red'
			for (const cleanup of cleanups) cleanup()
			elementCleanupMap.delete(element)
		}
	}
}
