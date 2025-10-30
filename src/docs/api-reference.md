# API Reference

Complete reference for Pounce-TS APIs and utilities.

## Core APIs

### `bindApp(app, selector?)`

Automated app initialization helper. Handles the common pattern of waiting for DOMContentLoaded and binding to a container element.

**Parameters:**
- `app` - The JSX app object (before calling `.render()`)
- `container` - CSS selector, HTMLElement, or function returning HTMLElement (defaults to `'#app'`)

**Returns:** Function that can be used to re-bind the app

**Example:**
```tsx
const app = <MyApp />
bindApp(app, '#my-container')
```

### `bindChildren(parent, newChildren)`

Binds children elements to a parent element with automatic reconciliation.

**Parameters:**
- `parent` - The parent DOM node
- `newChildren` - The new children (Node, Node[], or undefined)

**Example:**
```tsx
bindChildren(document.getElementById('app'), [node1, node2])
```

### `h(tag, props?, ...children)`

The JSX pragma function that creates JSX elements. Automatically transforms JSX into calls to this function.

**Parameters:**
- `tag` - HTML tag name or component function
- `props` - Element properties/attributes
- `...children` - Child elements

**Returns:** JSX element object with `.render()` method

## Component Registration

### `registerComponent(tagName, ctor)`

Register a component for use with a custom tag name.

**Parameters:**
- `tagName` - The custom tag name (e.g., 'my-button')
- `ctor` - Component constructor function

**Example:**
```tsx
registerComponent('my-button', MyButton)
// Now use as: <my-button>Click</my-button>
```

### `getComponent(tagName)`

Get a registered component by tag name.

**Parameters:**
- `tagName` - The custom tag name

**Returns:** Component constructor or undefined

### `hasComponent(tagName)`

Check if a component is registered.

**Parameters:**
- `tagName` - The custom tag name

**Returns:** Boolean

## Utility Functions

### `defaulted(value, defaults)`

Creates a proxy that provides default values for undefined properties.

**Parameters:**
- `value` - The object to wrap
- `defaults` - Object with default values

**Returns:** Proxy with default values

**Example:**
```tsx
const props = defaulted(inputProps, {
  label: 'Click me',
  disabled: false
})
```

### `propsInto(props, into?)`

Converts props descriptor into a target object, handling reactive values and bindings.

**Parameters:**
- `props` - Props descriptor object
- `into` - Target object (optional)

**Returns:** Object with reactive properties

### `classNames(input)`

Generates CSS class name string from various inputs.

**Parameters:**
- `input` - String, array, or object with boolean values

**Returns:** Space-separated class string

**Example:**
```tsx
classNames(['container', { active: true, disabled: false }])
// Returns: "container active"
```

## Array Utilities

### `array.computed(computer)`

Creates a reactive computed array.

**Parameters:**
- `computer` - Function that returns an array

**Returns:** Reactive array

**Example:**
```tsx
const doubled = array.computed(() => items.map(x => x * 2))
```

### `array.remove(array, item)`

Removes an item from an array.

**Parameters:**
- `array` - The array to modify
- `item` - The item to remove

**Returns:** Boolean indicating success

### `array.filter(array, filterFn)`

Filters an array in-place.

**Parameters:**
- `array` - The array to filter
- `filterFn` - Filter function

**Returns:** Boolean (false when done)

### `array.into(towards, from)`

Copies elements from one array to another.

**Parameters:**
- `towards` - Target array
- `from` - Source array

**Returns:** Target array

## Debug Utilities

### `namedEffect(name, fn)`

Creates an effect with a custom name for debugging.

**Parameters:**
- `name` - Effect name
- `fn` - Effect function

**Returns:** Cleanup function

### `trackEffect(callback)`

Tracks all reactive changes in a component.

**Parameters:**
- `callback` - Function called with (obj, evolution)

**Example:**
```tsx
trackEffect((obj, evolution) => {
  console.log('State changed:', obj, evolution)
})
```

## JSX Special Props

### Conditional Rendering

- `if:name={value}` - Render if condition is truthy
- `else:name={value}` - Render if condition is falsy
- `when:name={fn}` - Render if function returns true

**Example:**
```tsx
<div if:user={true}>Visible</div>
<div else:user={true}>Hidden</div>
```

### Update Syntax

- `update:prop={fn}` - Two-way binding setter

**Example:**
```tsx
<input value={state.count} update:value={(v) => state.count = v} />
```

## Control Flow Components

### `<for each={array}>`

Iterate over a reactive array.

**Example:**
```tsx
<for each={items}>
  {(item) => <div>{item.name}</div>}
</for>
```

### `<Scope>`

Creates a scope for conditional rendering.

**Example:**
```tsx
<Scope user="Alice" role="admin">
  <Component1 />
  <Component2 />
</Scope>
```

### `<Fragment>` or `<>`

Group multiple elements without adding a wrapper.

**Example:**
```tsx
<>
  <h1>Title</h1>
  <p>Content</p>
</>
```

## Event Handlers

Use camelCase event handler names:

- `onClick` - Click events
- `onInput` - Input events
- `onKeypress` - Key press events
- `onChange` - Change events
- `onSubmit` - Form submission

**Example:**
```tsx
<button onClick={() => console.log('clicked')}>Click</button>
<input onInput={(e) => state.value = e.target.value} />
```

## Reactive API (from mutts)

### `reactive(obj)`

Creates a reactive proxy object.

**Example:**
```tsx
const state = reactive({ count: 0 })
```

### `computed(fn)`

Creates a computed reactive value.

**Example:**
```tsx
const doubled = computed(() => state.count * 2)
```

### `computed.map(array, fn)`

Maps over a reactive array.

**Example:**
```tsx
{computed.map(items, (item) => <div>{item.name}</div>)}
```

### `computed.memo(array, fn)`

Memos a computed mapping over an array.

**Example:**
```tsx
const processed = computed.memo(items, expensiveProcess)
```

### `effect(fn)`

Creates a reactive effect.

**Example:**
```tsx
effect(() => {
  console.log('Count:', state.count)
  return () => console.log('Cleaned up')
})
```

### `watch(fn, callback)`

Watches a reactive value for changes.

**Example:**
```tsx
watch(() => state.count, (newVal, oldVal) => {
  console.log(`Changed from ${oldVal} to ${newVal}`)
})
```

### `trackEffect(callback)`

Tracks all reactive changes in the current context.

**Example:**
```tsx
trackEffect((obj, evolution) => {
  console.log('State changed:', obj, evolution)
})
```

### `atomic(fn)`

Creates an atomic wrapper for event handlers.

**Example:**
```tsx
const handler = atomic(() => state.count++)
element.addEventListener('click', handler)
```


