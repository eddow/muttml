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
	console.log('🚀 Babel plugin loaded!')
	return {
		name: 'jsx-reactive',
		visitor: {
			JSXElement(path: NodePath<JSXElement>) {
				console.log('JSXElement', path.node)
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
					for (const attr of path.node.openingElement.attributes) {
						if (t.isJSXAttribute(attr) && t.isJSXExpressionContainer(attr.value)) {
							const expression = attr.value.expression
							if (!t.isJSXEmptyExpression(expression)) {
								// Rewrite `prop={this.counter}` into `prop={() => this.counter}`
								const arrowFunction = t.arrowFunctionExpression([], expression)
								attr.value = t.jsxExpressionContainer(arrowFunction)
							}
						}
					}
				}
			},
		},
	}
}
