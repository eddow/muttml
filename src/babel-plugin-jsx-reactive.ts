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
					// Pass 1: support `update:attr` paired with base `attr`
					const attrs = path.node.openingElement.attributes
					for (let i = 0; i < attrs.length; i++) {
						const attr = attrs[i]
						if (t.isJSXAttribute(attr) && t.isJSXNamespacedName(attr.name)) {
							const ns = attr.name.namespace.name
							const local = attr.name.name.name
							if (ns === 'update') {
								const baseIndex = attrs.findIndex(
									(a) => t.isJSXAttribute(a) && t.isJSXIdentifier(a.name) && a.name.name === local
								)
								if (baseIndex !== -1) {
									const baseAttr = attrs[baseIndex] as t.JSXAttribute
									// getter from base
									let getterExpr: t.Expression | null = null
									if (baseAttr.value == null) {
										getterExpr = t.booleanLiteral(true)
									} else if (
										t.isStringLiteral(baseAttr.value) ||
										t.isNumericLiteral(baseAttr.value) ||
										t.isBooleanLiteral(baseAttr.value)
									) {
										getterExpr = baseAttr.value
									} else if (t.isJSXExpressionContainer(baseAttr.value)) {
										const exp = baseAttr.value.expression
										if (!t.isJSXEmptyExpression(exp)) getterExpr = exp
									}
									// setter from update:attr
									let setterExpr: t.Expression | null = null
									if (t.isJSXExpressionContainer(attr.value)) {
										const exp = attr.value.expression
										if (
											!t.isJSXEmptyExpression(exp) &&
											(t.isArrowFunctionExpression(exp) || t.isFunctionExpression(exp))
										) {
											setterExpr = exp
										}
									}
									if (getterExpr && setterExpr) {
										const getter = t.arrowFunctionExpression([], getterExpr)
										const bindingObject = t.objectExpression([
											t.objectProperty(t.identifier('get'), getter),
											t.objectProperty(t.identifier('set'), setterExpr),
										])
										baseAttr.value = t.jsxExpressionContainer(bindingObject)
										// remove update:attr
										attrs.splice(i, 1)
										i--
									}
								}
							}
						}
					}

					// Pass 2: existing reactive transforms
					for (const attr of path.node.openingElement.attributes) {
						if (t.isJSXAttribute(attr)) {
							// Transform onEvent syntax - no transformation needed as we're using onEvent directly
							// The h() function will handle both component events and DOM events

							// Handle reactive expressions in attributes
							if (t.isJSXExpressionContainer(attr.value)) {
								const expression = attr.value.expression
								if (!t.isJSXEmptyExpression(expression)) {
									// Skip if already a binding object (from update: pass)
									if (t.isObjectExpression(expression)) {
										const hasGet = expression.properties.some(
											(prop) =>
												t.isObjectProperty(prop) &&
												t.isIdentifier(prop.key) &&
												prop.key.name === 'get'
										)
										const hasSet = expression.properties.some(
											(prop) =>
												t.isObjectProperty(prop) &&
												t.isIdentifier(prop.key) &&
												prop.key.name === 'set'
										)
										if (hasGet && hasSet) {
											// Already a binding object, skip transformation
											continue
										}
									}
									// Check if this is a simple property access for 2-way binding
									if (t.isMemberExpression(expression) || t.isIdentifier(expression)) {
										// Auto-detect 2-way binding: transform `{this.count}`, `{state.count}`, or `{state['count']}` to `{{get: () => this.count, set: (val) => this.count = val}}`
										const getter = t.arrowFunctionExpression([], expression)
										const setter = t.arrowFunctionExpression(
											[t.identifier('val')],
											t.assignmentExpression('=', expression, t.identifier('val'))
										)
										const bindingObject = t.objectExpression([
											t.objectProperty(t.identifier('get'), getter),
											t.objectProperty(t.identifier('set'), setter),
										])
										attr.value = t.jsxExpressionContainer(bindingObject)
									} else {
										// One-way binding: rewrite `prop={this.counter}` into `prop={() => this.counter}`
										const arrowFunction = t.arrowFunctionExpression([], expression)
										attr.value = t.jsxExpressionContainer(arrowFunction)
									}
								}
							}
						}
					}
				}
			},
		},
	}
}
