// Re-export everything from the lib modules
export { storeCleanupForElement } from './lib/cleanup'
export { MuttComponent } from './lib/component'
export { NeutralHost } from './lib/host'
export { getComponent, hasComponent, registerComponent } from './lib/registry'
export { Fragment, h } from './lib/renderer'

// Import and set up global h function
import { h } from './lib/renderer'

// Make h available globally
;(globalThis as any).h = h
