// Registry to link JSX custom tags to component classes
const componentRegistry = new Map<string, ComponentFunction>()

export function registerComponent(tagName: string, ctor: ComponentFunction) {
	componentRegistry.set(tagName, ctor)
}

export function getComponent(tagName: string) {
	return componentRegistry.get(tagName)
}

export function hasComponent(tagName: string) {
	return componentRegistry.has(tagName)
}
