/**
 * Utility for generating CSS class names
 */

export type ClassInput = string | ClassInput[] | Record<string, boolean>

/**
 * Generates a CSS class name string from various inputs
 *
 * @param input - Can be a string, array (including nested arrays), or object with boolean values
 * @returns A space-separated string of class names
 */
export function classNames(input: ClassInput): string {
	const classes: string[] = []

	if (typeof input === 'string') {
		classes.push(input)
	} else if (Array.isArray(input)) {
		for (const item of input) {
			// Recursively call classNames for nested arrays
			const result = classNames(item)
			if (result) {
				classes.push(result)
			}
		}
	} else if (typeof input === 'object' && input !== null) {
		for (const [className, shouldInclude] of Object.entries(input)) {
			if (shouldInclude) {
				classes.push(className)
			}
		}
	}

	return classes.join(' ')
}

/**
 * Alternative function name for convenience
 */
export const cn = classNames
