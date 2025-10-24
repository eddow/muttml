// Re-export everything from the lib modules
export { storeCleanupForElement } from './lib/cleanup'
export { PounceComponent, PounceElement, type Properties } from './lib/component'
export { getComponent, hasComponent, registerComponent } from './lib/registry'
export { Fragment, h } from './lib/renderer'

// Import and set up global h function
import { h } from './lib/renderer'

// Make h available globally
;(globalThis as any).h = h
