/**
 * Todo Web Component using inline JSX templating
 */

import { h, MuttComponent } from '../muttml'
import TodoCSS from './Todo.scss?inline'

interface Todo {
	id: number
	text: string
	completed: boolean
	createdAt: Date
}

class TodoWebComponent extends MuttComponent<{}> {
	private todos: Todo[] = []
	private filter: 'all' | 'active' | 'completed' = 'all'
	private newTodoText: string = ''

  constructor(props: Record<string, any> = {}, children: any[] = [], host: HTMLElement) {
    super(props, children, host)
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
		const filteredTodos = this.getFilteredTodos()
		const activeCount = this.todos.filter(t => !t.completed).length
		const completedCount = this.todos.filter(t => t.completed).length

		return (
			<div>
				<div>
					<h2>Todo Component (JSX)</h2>
					
					{/* Input section */}
					<div class="input-section">
						<input
							type="text"
							class="todo-input"
							placeholder="Add a new todo..."
							value={this.newTodoText}
							on:input={(e: Event) => this.updateNewTodoText(e)}
							on:keypress={(e: KeyboardEvent) => e.key === 'Enter' && this.addTodo()}
						/>
						<button class="add-button" on:click={() => this.addTodo()}>
							Add
						</button>
					</div>
					
					{/* Filter buttons */}
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
							Active ({activeCount})
						</button>
						<button
							class={['filter-button', { active: this.filter === 'completed' }]}
							on:click={() => this.setFilter('completed')}
						>
							Completed ({completedCount})
						</button>
					</div>
					
					{/* Todo list */}
					<div class="todo-list">
						{filteredTodos.length === 0 ? (
							<div class="empty-message">
								{this.todos.length === 0 
									? 'No todos yet. Add one above!' 
									: `No ${this.filter} todos.`
								}
							</div>
						) : (
							filteredTodos.map(todo => (
								<div key={todo.id.toString()} class="todo-item">
									<input
										type="checkbox"
										checked={todo.completed}
										on:change={() => this.toggleTodo(todo.id)}
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
					
					{/* Clear completed section */}
					{completedCount > 0 && (
						<div class="clear-section">
							<button
								class="clear-button"
								on:click={() => this.clearCompleted()}
							>
								Clear {completedCount} completed
							</button>
						</div>
					)}
				</div>
			</div>
		)
	}

	private addTodo(): void {
		const text = this.newTodoText.trim()
		if (!text) return

		const newTodo: Todo = {
			id: Date.now(),
			text,
			completed: false,
			createdAt: new Date()
		}

		this.todos.push(newTodo)
		this.newTodoText = ''
	}

	private toggleTodo(id: number): void {
		const todo = this.todos.find(t => t.id === id)
		if (todo) {
			todo.completed = !todo.completed
		}
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

	private getFilteredTodos(): Todo[] {
		switch (this.filter) {
			case 'active':
				return this.todos.filter(todo => !todo.completed)
			case 'completed':
				return this.todos.filter(todo => todo.completed)
			default:
				return this.todos
		}
	}
}

export default TodoWebComponent
