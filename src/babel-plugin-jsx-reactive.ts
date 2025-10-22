import { type NodePath, type PluginObj, types as t } from '@babel/core'
import { type JSXElement } from '@babel/types'

interface BabelPluginOptions {
	types: typeof t
}

interface BabelPluginState {
	opts?: Record<string, any>
}

export function babelPluginJsxReactive({
	types: t,
}: BabelPluginOptions): PluginObj<BabelPluginState> {
	return {
		name: 'jsx-reactive',
		visitor: {
			JSXElement(path: NodePath<JSXElement>) {
				// Traverse all JSX children and attributes
				for (let index = 0; index < path.node.children.length; index++) {
					const child = path.node.children[index]
					if (t.isJSXExpressionContainer(child)) {
						const expression = child.expression
						// Check if the expression is a reactive reference (e.g., `this.counter`)
						if (!t.isJSXEmptyExpression(expression)) {
							// Rewrite `this.counter` into `() => this.counter`
							const arrowFunction = t.arrowFunctionExpression(
								[], // No args
								expression // Body is `this.counter`
							)
							path.node.children[index] = t.jsxExpressionContainer(arrowFunction)
						}
					}
				}

				// Also check props (e.g., `<Component prop={this.counter} />`)
				if (t.isJSXOpeningElement(path.node.openingElement)) {
					// Check if this is a component (PascalCase) or DOM element (lowercase)
					const isComponent =
						t.isJSXIdentifier(path.node.openingElement.name) &&
						typeof path.node.openingElement.name.name === 'string' &&
						/^[A-Z]/.test(path.node.openingElement.name.name)

					for (const attr of path.node.openingElement.attributes) {
						if (t.isJSXAttribute(attr)) {
							// Transform on:click to onClick, on:input to onInput, etc.
							if (
								attr.name.name &&
								typeof attr.name.name === 'string' &&
								attr.name.name.startsWith('on:')
							) {
								if (isComponent) {
									// For components, keep the on: prefix for component events
									// No transformation needed - the h() function will handle it
								} else {
									// For DOM elements, convert to camelCase (e.g., 'click' -> 'onClick')
									const eventName = attr.name.name.slice(3) // Remove the 'on:'
									const onEventName = `on${eventName.charAt(0).toUpperCase()}${eventName.slice(1)}`
									attr.name.name = onEventName
								}
							}

							// Handle reactive expressions in attributes
							if (t.isJSXExpressionContainer(attr.value)) {
								const expression = attr.value.expression
								if (!t.isJSXEmptyExpression(expression)) {
									// Rewrite `prop={this.counter}` into `prop={() => this.counter}`
									const arrowFunction = t.arrowFunctionExpression([], expression)
									attr.value = t.jsxExpressionContainer(arrowFunction)
								}
							}
						}
					}
				}
			},
		},
	}
}
