import { effect, unwrap } from 'mutts/src'

/**
 * A child can be:
 * - A DOM node
 * - A reactive function that returns a child
 * - An array of children (from .map() operations)
 * - A primitive value (string, number)
 */
export type Child = Node | (() => Child) | Child[] | string | number

/**
 * Convert a value to a DOM Node
 * - If already a Node, return as-is
 * - If primitive (string/number), create text node
 */
function toNode(value: Node | string | number): Node {
	if (value instanceof Node) {
		return unwrap(value)
	}
	return document.createTextNode(String(value))
}

/**
 * Process children arrays, handling various child types including:
 * - Direct nodes
 * - Reactive functions
 * - Arrays of children
 * - Variable arrays from .map() operations
 *
 * Returns a flat array of DOM nodes suitable for replaceChildren()
 */
export function processChildren(children: Child[]): Node[] {
	if (!children || children.length === 0) {
		return []
	}

	// First loop: Process each child and collect results (Node | Node[])
	const tempResults: (Node | Node[])[] = new Array(children.length)

	effect(() => {
		for (let i = 0; i < children.length; i++) {
			const child = children[i]
			effect(() => {
				// Handle reactive functions
				if (typeof child === 'function') {
					const unwrappedResult = child()
					// If the result is an array (from .map()), process it recursively
					if (Array.isArray(unwrappedResult)) {
						tempResults[i] = processChildren(unwrappedResult)
					} else {
						// Convert single result to Node
						tempResults[i] = toNode(unwrappedResult as Node | string | number)
					}
				}
				// Handle arrays (including results from .map())
				else if (Array.isArray(child)) {
					tempResults[i] = processChildren(child)
				}
				// Handle direct nodes and primitives
				else {
					tempResults[i] = toNode(child)
				}
			})
		}
		return () => {
			tempResults.length = 0
		}
	})

	// Second loop: Flatten the temporary results into final Node[]
	const result: Node[] = []
	for (const item of tempResults) {
		if (Array.isArray(item)) {
			result.push(...item)
		} else {
			result.push(item)
		}
	}

	return result
}
