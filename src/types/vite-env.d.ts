/// <reference types="vite/client" />

declare module '*.scss' {
	const content: string
	export default content
}

declare module '*.css' {
	const content: string
	export default content
}

declare module '*.scss?inline' {
	const content: string
	export default content
}

declare module '*.css?inline' {
	const content: string
	export default content
}

declare module '*.scss?raw' {
	const content: string
	export default content
}

declare module '*.css?raw' {
	const content: string
	export default content
}
