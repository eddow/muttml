# Components in Pounce-TS

Components are the building blocks of Pounce-TS applications. They are TypeScript functions that receive props and return JSX elements.

## Basic Component Syntax

A component is a function that returns JSX:

```tsx
function Greeting(props: { name: string }) {
  return <h1>Hello, {props.name}!</h1>
}
```

### Component Structure

Every component receives two parameters:

1. **`props`**: The component's properties
2. **`scope`**: The reactive scope for conditional rendering (advanced)

```tsx
function MyComponent(
  props: { title: string; count: number },
  scope: Record<PropertyKey, any>
) {
  return (
    <div>
      <h2>{props.title}</h2>
      <p>Count: {props.count}</p>
    </div>
  )
}
```

## Default Props

Use the `defaulted()` utility to provide default values for props:

```tsx
import { defaulted } from '../lib/utils'

function Button(props: {
  label?: string
  onClick?: () => void
  disabled?: boolean
}) {
  const state = defaulted(props, {
    label: 'Click me',
    disabled: false
  })

  return (
    <button onClick={state.onClick} disabled={state.disabled}>
      {state.label}
    </button>
  )
}
```

## Props Types

### Static Props

Simple values passed directly:

```tsx
<Greeting name="Alice" />
```

### Reactive Props

Props can be reactive functions or two-way bindings:

```tsx
// One-way binding
<Counter count={() => state.counter} />

// Two-way binding
<Counter count={state.counter} />
```

### Event Handler Props

Pass callback functions for component events:

```tsx
function TodoList(props: {
  todos: Todo[]
  onTodoClick?: (todo: Todo) => void
  onTodoDelete?: (id: number) => void
}) {
  return (
    <div>
      {props.todos.map(todo => (
        <div key={todo.id}>
          <span onClick={() => props.onTodoClick?.(todo)}>
            {todo.text}
          </span>
          <button onClick={() => props.onTodoDelete?.(todo.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  )
}
```

## Component Lifecycle

Use `effect()` from `mutts` for lifecycle hooks:

```tsx
import { effect } from 'mutts/src'

function MyComponent() {
  // Component mounted
  console.log('Component mounted')
  
  effect(() => {
    // Setup code
    
    return () => {
      // Cleanup on unmount
      console.log('Component unmounted')
    }
  })

  return <div>My Component</div>
}
```

### Tracking Effects

Use `trackEffect()` to monitor reactive changes:

```tsx
import { trackEffect } from 'mutts/src'

function MyComponent() {
  trackEffect((obj, evolution) => {
    console.log('State changed:', obj, evolution)
  })

  return <div>My Component</div>
}
```

## Children

Components can accept children elements:

```tsx
function Container(props: { children: JSX.Element | JSX.Element[] }) {
  const children = Array.isArray(props.children) 
    ? props.children 
    : [props.children]

  return (
    <div class="container">
      {children}
    </div>
  )
}

// Usage
<Container>
  <h1>Title</h1>
  <p>Content</p>
</Container>
```

## Composing Components

Build complex UIs by composing simple components:

```tsx
function App() {
  const state = reactive({
    todos: [
      { id: 1, text: 'Learn Pounce', done: false },
      { id: 2, text: 'Build app', done: false }
    ]
  })

  function addTodo(text: string) {
    state.todos.push({ id: Date.now(), text, done: false })
  }

  return (
    <div>
      <Header title="My Todo App" />
      <TodoInput onAdd={addTodo} />
      <TodoList todos={state.todos} />
    </div>
  )
}

function Header(props: { title: string }) {
  return <h1>{props.title}</h1>
}

function TodoInput(props: { onAdd: (text: string) => void }) {
  const state = reactive({ text: '' })
  
  return (
    <div>
      <input value={state.text} />
      <button onClick={() => {
        props.onAdd(state.text)
        state.text = ''
      }}>
        Add Todo
      </button>
    </div>
  )
}

function TodoList(props: { todos: Todo[] }) {
  return (
    <ul>
      {props.todos.map(todo => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  )
}
```

## Best Practices

1. **Keep components small**: Focus on single responsibility
2. **Use TypeScript types**: Define prop types for better IDE support
3. **Provide defaults**: Use `defaulted()` for optional props
4. **Handle events properly**: Use optional chaining for callbacks
5. **Clean up effects**: Return cleanup functions from `effect()`


