/**
 * Todo Web Component using inline JSX templating
 */

import { computed } from 'mutts/src'
import { h, PounceComponent, PounceElement } from '..'
import TodoCSS from './Todo.scss?inline'

interface Todo {
	id: number
	text: string
	completed: boolean
	createdAt: Date
}

// Define the props interface for type validation
interface TodoProps {
	initialTodos?: Todo[]
	placeholder?: string
	showFilters?: boolean
	showClearCompleted?: boolean
	maxTodos?: number
	allowEmptyTodos?: boolean
}

class TodoWebComponent extends PounceComponent<{}, TodoProps> {
	private todos: Todo[] = []
	private filter: 'all' | 'active' | 'completed' = 'all'
	private newTodoText: string = ''

	constructor(props: TodoProps = {}, children: any[] = [], host: PounceElement) {
		super(props, children, host)
		// Initialize with provided todos if any
		if (props.initialTodos) {
			this.todos = [...props.initialTodos]
		}
	}

	public mount(): void {
		console.log('🎯 Todo component mounted!', {
			context: this.context
		})
	}

	public unmount(): void {
		console.log('👋 Todo component unmounted!', {
			todoCount: this.todos.length
		})
	}

	static readonly style = TodoCSS

	public get style() {
		return `
			:host {
				display: block;
				padding: 20px;
				border: 2px solid #764ba2;
				border-radius: 8px;
				margin: 20px 0;
				font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
			}
		`
	}

	public get template() {
		const placeholder = ()=> this.props.placeholder ?? 'Add a new todo...'
		const showFilters = ()=> this.props.showFilters ?? true
		const showClearCompleted = ()=> this.props.showClearCompleted ?? true

		return (
			<div>
				<div>
					<h2>Todo Component (JSX)</h2>
					
					{/* Input section */}
					<div class="input-section">
						<input
							type="text"
							class="todo-input"
							placeholder={placeholder()}
							value={this.newTodoText}
							on:input={(e: Event) => this.updateNewTodoText(e)}
							on:keypress={(e: KeyboardEvent) => e.key === 'Enter' && this.addTodo()}
						/>
						<button class="add-button" on:click={() => this.addTodo()}>
							Add
						</button>
					</div>
					
					{/* Filter buttons */}
					{showFilters() && (
						<div class="filters">
							<button
								class={['filter-button', { active: this.filter === 'all' }]}
								on:click={() => this.setFilter('all')}
							>
								All
							</button>
							<button
								class={['filter-button', { active: this.filter === 'active' }]}
								on:click={() => this.setFilter('active')}
							>
								Active ({this.activeCount})
							</button>
							<button
								class={['filter-button', { active: this.filter === 'completed' }]}
								on:click={() => this.setFilter('completed')}
							>
								Completed ({this.completedCount})
							</button>
						</div>
					)}
					
					{/* Todo list */}
					<div class="todo-list">
						{this.filteredTodos.length === 0 ? (
							<div class="empty-message">
								{this.todos.length === 0 
									? 'No todos yet. Add one above!' 
									: `No ${this.filter} todos.`
								}
							</div>
						) : (
							computed.map(this.filteredTodos, todo => (
								<div class="todo-item">
									{console.log('render',todo.text)}
									<input
										type="checkbox"
										checked={todo.completed}
									/>
									<span class={['todo-text', { completed: todo.completed }]}>
										{todo.text}
									</span>
									<button
										class="delete-button"
										on:click={() => this.deleteTodo(todo.id)}
									>
										Delete
									</button>
								</div>
							))
						)}
					</div>
					{/*
					<div class="todo-list">
						<case of={this.filteredTodos.length === 0}>{{
							true: 
								<div class="empty-message">
									{this.todos.length === 0 
										? 'No todos yet. Add one above!' 
										: `No ${this.filter} todos.`
									}
								</div>,
							false: 
								<for in={this.filteredTodos}>{
									(todo: Todo) => (
										<div class="todo-item">
											<input
												type="checkbox"
												checked={todo.completed}
											/>
											<span class={['todo-text', { completed: todo.completed }]}>
												{todo.text}
											</span>
											<button
												class="delete-button"
												on:click={() => this.deleteTodo(todo.id)}
											>
												Delete
											</button>
										</div>
									)
								}</for>
						}}</case>
					</div>
					*/}
					
					{/* Clear completed section */}
					{showClearCompleted() && this.completedCount > 0 && (
						<div class="clear-section">
							<button
								class="clear-button"
								on:click={() => this.clearCompleted()}
							>
								Clear {this.completedCount} completed
							</button>
						</div>
					)}
				</div>
			</div>
		)
	}

	private addTodo(): void {
		const text = this.newTodoText.trim()
		const allowEmptyTodos = this.props.allowEmptyTodos ?? false
		const maxTodos = this.props.maxTodos
		
		// Validate based on typed props
		if (!text && !allowEmptyTodos) return
		if (maxTodos && this.todos.length >= maxTodos) return
		
		let completed = false

		const newTodo: Todo = {
			id: Date.now(),
			text,
			get completed() {
				return completed
			},
			set completed(value) { completed = value },
			createdAt: new Date()
		}

		this.todos.push(newTodo)
		this.newTodoText = ''
	}

	private deleteTodo(id: number): void {
		this.todos = this.todos.filter(t => t.id !== id)
	}

	private setFilter(filter: 'all' | 'active' | 'completed'): void {
		this.filter = filter
	}

	private clearCompleted(): void {
		this.todos = this.todos.filter(todo => !todo.completed)
	}

	private updateNewTodoText(event: Event): void {
		const target = event.target as HTMLInputElement
		this.newTodoText = target.value
	}

	@computed
	private get activeCount(): number {
		return computed.filter(this.todos, todo => !todo.completed).length
	}

	@computed
	private get completedCount(): number {
		return computed.filter(this.todos, todo => todo.completed).length
	}

	@computed
	private get filteredTodos(): Todo[] {
		switch (this.filter) {
			case 'active':
				return computed.filter(this.todos, todo => !todo.completed)
			case 'completed':
				return computed.filter(this.todos, todo => todo.completed)
			default:
				return this.todos
		}
	}
}

export default TodoWebComponent
