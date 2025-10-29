/**
 * Todo Web Component using inline JSX templating
 */

import { computed, effect } from 'mutts/src'
import './Todo.scss'
import { array, compute, defaulted } from '../lib/utils'

interface Todo {
	id: number
	text: string
	completed: boolean
	createdAt: Date
}

export default function TodoWebComponent(props: {
	placeholder?: string
	showFilters?: boolean
	showClearCompleted?: boolean
	maxTodos?: number
	allowEmptyTodos?: boolean
	todos: Todo[]
	filter?: 'all' | 'active' | 'completed'
	newTodoText?: string
}, context: Record<PropertyKey, any>) {
	const state = defaulted(props, {
		placeholder: 'Add a new todo...',
		showFilters: true,
		showClearCompleted: true,
		filter: 'all',
		newTodoText: '',
	})

	console.log('🎯 Todo component mounted!', { context })
	effect(() => {
		return () => {
			console.log('👋 Todo component unmounted!', { todoCount: state.todos.length })
		}
	})

	function addTodo() {
		const text = state.newTodoText.trim()
		const allowEmptyTodos = state.allowEmptyTodos ?? false
		const maxTodos = state.maxTodos

		// Validate based on typed props
		if (!text && !allowEmptyTodos) return
		if (maxTodos && state.todos.length >= maxTodos) return

		const newTodo: Todo = {
			id: Date.now(),
			text,
			completed: false,
			createdAt: new Date(),
		}

		state.todos.push(newTodo)
		state.newTodoText = ''
	}

	function deleteTodo(id: number) {
		array.filter(state.todos, (t) => t.id !== id)
	}

	function clearCompleted() {
		array.filter(state.todos, (todo) => !todo.completed)
	}

	const activeCount = compute(() => state.todos.filter((todo) => !todo.completed).length)
	const completedCount = compute(() => state.todos.filter((todo) => todo.completed).length)

	const filteredTodos = compute(() => {
		switch (state.filter) {
		case 'active':
			return state.todos.filter((todo) => !todo.completed)
		case 'completed':
			return state.todos.filter((todo) => todo.completed)
		default:
			return state.todos
		}
	})
	function setFilter(filter: 'all' | 'active' | 'completed') {
		state.filter = filter
	}
	return (
		<>
			<h2>Todo Component (JSX)</h2>

			{/* Input section */}
			<div class="input-section">
				<input
					type="text"
					class="todo-input"
					placeholder={state.placeholder}
					value={state.newTodoText}
					onKeypress={(e: KeyboardEvent) => e.key === 'Enter' && addTodo()}
				/>
				<button class="add-button" onClick={addTodo}>
					Add
				</button>
			</div>

			{/* Filter buttons */}
			{state.showFilters && (
				<div class="filters">
					<button
						class={['filter-button', { active: state.filter === 'all' }]}
						onClick={() => setFilter('all')}
					>
						All
					</button>
					<button
						class={['filter-button', { active: state.filter === 'active' }]}
						onClick={() => setFilter('active')}
					>
						Active ({activeCount()})
					</button>
					<button
						class={['filter-button', { active: state.filter === 'completed' }]}
						onClick={() => setFilter('completed')}
					>
						Completed ({completedCount()})
					</button>
				</div>
			)}

			{/* Todo list */}
			<div class="todo-list">
				{filteredTodos.length === 0 ? (
					<div class="empty-message">
						{state.todos.length === 0 ? 'No todos yet. Add one above!' : `No ${state.filter} todos.`}
					</div>
				) : (
					computed.memo(filteredTodos, (todo) => (
						<div class="todo-item">
							{console.log('render', todo.text)}
							<input type="checkbox" checked={todo.completed} />
							<span class={['todo-text', { completed: todo.completed }]}>{todo.text}</span>
							<button class="delete-button" onClick={() => deleteTodo(todo.id)}>
								Delete
							</button>
						</div>
					))
				)}
			</div>
			<for each={filteredTodos()}>{(todo: Todo) => (
				<div class="todo-item">
					<input type="checkbox" checked={todo.completed} />
					<span class={['todo-text', { completed: todo.completed }]}>{todo.text}</span>
				</div>
			)}</for>

			{/* Clear completed section */}
			{state.showClearCompleted && completedCount() > 0 && (
				<div class="clear-section">
					<button class="clear-button" onClick={clearCompleted}>
						Clear {completedCount()} completed
					</button>
				</div>
			)}
		</>
	)
}
