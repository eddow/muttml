// Registry to link JSX custom tags to component classes
const componentRegistry = new Map<string, new (...args: any[]) => any>()

export function registerComponent(tagName: string, ctor: new (...args: any[]) => any) {
	componentRegistry.set(tagName, ctor)
}

export function getComponent(tagName: string) {
	return componentRegistry.get(tagName)
}

export function hasComponent(tagName: string) {
	return componentRegistry.has(tagName)
}
