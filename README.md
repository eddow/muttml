# MuttML - JSX Web Components

Web components built with TypeScript, JSX, and custom h() function. This provides a React-like development experience with custom elements and Shadow DOM.

## Features

- **JSX Support**: React-like JSX syntax with custom h() function
- **TypeScript Support**: Full type safety and enhanced developer experience
- **Custom h() Function**: Our own implementation for JSX rendering
- **Web Components**: Components are implemented as custom elements with Shadow DOM
- **Vite Integration**: Fast development server with hot module replacement
- **Modern Decorators**: Uses 2023-05 decorator specification with Babel transformation
- **Clean Architecture**: Simple, extensible component structure
- **Shadow DOM**: Component isolation and encapsulation

## Project Structure

```
muttml/
├── src/
│	 ├── h.ts							# Custom h() function for JSX rendering
│	 ├── CounterComponent.tsx # Counter web component with inline JSX
│	 ├── TodoComponent.tsx	 # Todo web component with inline JSX
│	 └── main.tsx					# Application entry point with inline JSX
├── index.html						# HTML entry point
├── vite.config.js				# Vite configuration with Babel decorators
├── tsconfig.json				 # TypeScript configuration with JSX support
└── package.json					# Dependencies and scripts
```

## Getting Started

1. Install dependencies:
	 ```bash
	 npm install
	 ```

2. Start the development server:
	 ```bash
	 npm run dev
	 ```

3. Open your browser to `http://localhost:3000`

## Core Concepts

### Custom h() Function

Our custom h() function provides JSX-like syntax for creating virtual DOM elements:

```typescript
import { h, render } from './h.js'

const element = h('div', { className: 'container' },
	h('h1', {}, 'Hello World'),
	h('p', { style: { color: 'blue' } }, 'This is JSX-like syntax!')
)

const domElement = render(element, container)
```

### Inline JSX Web Components

Components use inline JSX syntax with our custom h() function:

```typescript
class MyComponent extends HTMLElement {
	private render() {
		const jsxElement = (
			<div>
				<style innerHTML={styles} />
				<div>
					<h2>My Component</h2>
					<button onClick={() => this.handleClick()}>
						Click me
					</button>
				</div>
			</div>
		)

		this.shadowRoot!.innerHTML = ''
		const renderedElement = render(jsxElement, this.shadowRoot!)
		this.shadowRoot!.appendChild(renderedElement)
	}
}
```

### Shadow DOM

Components use Shadow DOM for style and markup isolation:

```typescript
// Styles are scoped to the component
this.shadowRoot!.innerHTML = `
	<style>
		:host {
			display: block;
			/* Host element styles */
		}
		.internal {
			/* Internal component styles */
		}
	</style>
	<!-- Component content -->
`
```

### TypeScript Integration

Full TypeScript support with interfaces and type safety:

```typescript
interface Todo {
	id: number
	text: string
	completed: boolean
	createdAt: Date
}

class TodoComponent extends HTMLElement {
	private todos: Todo[] = []
	// ...
}
```

## Examples

The project includes two example components built with inline JSX:

1. **Counter Component**: Counter with increment/decrement/reset functionality using inline JSX templating
2. **Todo Component**: Todo list with add/delete/toggle/filter functionality using inline JSX syntax

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Dependencies

- **vite**: Build tool and development server
- **typescript**: TypeScript compiler and type definitions
- **@babel/core**: Babel core for decorator transformation
- **@babel/plugin-proposal-decorators**: Modern decorator support

## License

ISC
