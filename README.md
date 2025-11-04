# Pounce-TS

> A lightweight, reactive web framework built with TypeScript and JSX

Pounce-TS is a minimal, performant framework for building reactive web applications. It combines the simplicity of direct DOM manipulation with the power of automatic reactivity, two-way binding, and component-based architecture.

Redoing one was done to have something simple, who is simply reactive without hacks (`reactive(...)` is enough) and still keep a simple and intuitive way of describing relations with no need to have two names per state for example.

## 🌟 Features

- **🚀 Lightweight**: No virtual DOM, minimal overhead
- **⚡ Reactive**: Automatic reactivity powered by `mutts` reactivity engine
- **🔄 Two-Way Binding**: Automatic detection and setup of two-way data binding
- **🎨 JSX Support**: Write components using familiar JSX syntax
- **💪 Type-Safe**: Full TypeScript support with type safety
- **🧩 Component-Based**: Create reusable, composable components
- **📦 No Runtime**: Works directly with the DOM

## 📖 Documentation

Complete documentation is available in the [docs folder](src/docs):

- **[Getting Started](src/docs/getting-started.md)** - Introduction and quick start guide
- **[Components](src/docs/components.md)** - Building and using components
- **[Reactivity](src/docs/reactivity.md)** - Understanding reactive state and effects
- **[Two-Way Binding](src/docs/binding.md)** - Form inputs and data binding
- **[Advanced Features](src/docs/advanced.md)** - Conditional rendering, scopes, and more
- **[API Reference](src/docs/api-reference.md)** - Complete API documentation
- **[Migration Guide](src/docs/migration.md)** - Migrating to the new bindApp pattern
- **[Examples](src/docs/examples.md)** - Complete working examples

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## 💡 Example

Here's a simple counter component:

```tsx
import { reactive } from 'mutts/src'
import { bindApp } from './lib/renderer'

function Counter() {
  const state = reactive({ count: 0 })
  
  return (
    <>
      <h1>Counter: {state.count}</h1>
      <button onClick={() => state.count++}>Increment</button>
      <button onClick={() => state.count--}>Decrement</button>
    </>
  )
}

bindApp(<Counter />)
```

## 🎯 Key Concepts

### Components

Components are TypeScript functions that return JSX:

```tsx
function Greeting(props: { name: string }) {
  return <h1>Hello, {props.name}!</h1>
}
```

### Reactive State

Use `reactive()` to create reactive state:

```tsx
const state = reactive({
  count: 0,
  message: 'Hello World'
})
```

### Two-Way Binding

Bind form inputs and component properties automatically:

```tsx
<input value={props.name} />
```

### Event Handlers

Use camelCase event handlers:

```tsx
<button onClick={() => state.count++}>Click me</button>
```

Components use optional callbacks.

### Illustration

```tsx
function Counter(props: { value: number, onReset?(): void }) {
  return <>
    <p>{props.value}</p>
    <button onClick={()=> props.value++}>Increment</button>
    <button onClick={onReset}>Reset</button>
  </>
}
```

## 📚 Learn More

- Read the [Getting Started Guide](src/docs/getting-started.md)
- Explore [Components](src/docs/components.md)
- Understand [Reactivity](src/docs/reactivity.md)
- Master [Two-Way Binding](src/docs/binding.md)
- Check out [Advanced Features](src/docs/advanced.md)
- Browse the [API Reference](src/docs/api-reference.md)
- Follow the [Migration Guide](src/docs/migration.md)
- See [Examples](src/docs/examples.md)

## 🛠️ Tech Stack

- **TypeScript** - Type safety and modern JavaScript
- **JSX** - Familiar component syntax
- **mutts** - Reactive state management
- **Vite** - Fast development and build tool
- **Babel** - JSX transformation and reactive enhancements

## 📝 License

ISC

# TODOs

- Some GC cleanups are still called