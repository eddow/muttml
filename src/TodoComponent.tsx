/**
 * Todo Web Component using inline JSX templating
 */

import { h } from './h.js'
import MuttComponent from './MuttComponent.js'

interface Todo {
	id: number
	text: string
	completed: boolean
	createdAt: Date
}

class TodoWebComponent extends MuttComponent {
	private todos: Todo[] = []
	private filter: 'all' | 'active' | 'completed' = 'all'
	private newTodoText: string = ''

	constructor() {
		super()
	}

	public static style = `
		:host { display: block; }
	`

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
			
			h2 {
				color: #333;
				margin-top: 0;
			}
			
			.input-section {
				display: flex;
				gap: 10px;
				margin-bottom: 20px;
			}
			
			.todo-input {
				flex: 1;
				padding: 10px;
				border: 1px solid #ddd;
				border-radius: 4px;
				font-size: 16px;
			}
			
			.add-button {
				padding: 10px 20px;
				background: #4caf50;
				color: white;
				border: none;
				border-radius: 4px;
				cursor: pointer;
				font-size: 16px;
				transition: all 0.2s ease;
			}
			
			.add-button:hover {
				transform: translateY(-1px);
				box-shadow: 0 2px 5px rgba(0,0,0,0.2);
			}
			
			.filters {
				display: flex;
				gap: 10px;
				margin-bottom: 20px;
			}
			
			.filter-button {
				padding: 8px 16px;
				border: 1px solid #ddd;
				border-radius: 4px;
				cursor: pointer;
				background: white;
				color: #333;
				transition: all 0.2s ease;
			}
			
			.filter-button.active {
				background: #667eea;
				color: white;
			}
			
			.filter-button:hover {
				background: #f0f0f0;
			}
			
			.filter-button.active:hover {
				background: #5a6fd8;
			}
			
			.todo-list {
				min-height: 100px;
			}
			
			.todo-item {
				display: flex;
				align-items: center;
				gap: 10px;
				padding: 10px;
				border-bottom: 1px solid #eee;
			}
			
			.todo-text {
				flex: 1;
			}
			
			.todo-text.completed {
				text-decoration: line-through;
				color: #888;
			}
			
			.delete-button {
				padding: 5px 10px;
				background: #ff6b6b;
				color: white;
				border: none;
				border-radius: 4px;
				cursor: pointer;
				font-size: 12px;
				transition: all 0.2s ease;
			}
			
			.delete-button:hover {
				transform: translateY(-1px);
				box-shadow: 0 2px 5px;
			}
			
			.clear-section {
				margin-top: 20px;
				text-align: right;
			}
			
			.clear-button {
				padding: 8px 16px;
				background: #ffa726;
				color: white;
				border: none;
				border-radius: 4px;
				cursor: pointer;
				transition: all 0.2s ease;
			}
			
			.clear-button:hover {
				transform: translateY(-1px);
				box-shadow: 0 2px 5px rgba(0,0,0,0.2);
			}
			
			.empty-message {
				color: #666;
				font-style: italic;
				text-align: center;
				padding: 20px;
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
					<div className="input-section">
						<input
							type="text"
							className="todo-input"
							placeholder="Add a new todo..."
							value={this.newTodoText}
							onInput={(e: Event) => this.updateNewTodoText(e)}
							onKeypress={(e: KeyboardEvent) => e.key === 'Enter' && this.addTodo()}
						/>
						<button className="add-button" onClick={() => this.addTodo()}>
							Add
						</button>
					</div>
					
					{/* Filter buttons */}
					<div className="filters">
						<button
							className={`filter-button ${this.filter === 'all' ? 'active' : ''}`}
							onClick={() => this.setFilter('all')}
						>
							All
						</button>
						<button
							className={`filter-button ${this.filter === 'active' ? 'active' : ''}`}
							onClick={() => this.setFilter('active')}
						>
							Active ({activeCount})
						</button>
						<button
							className={`filter-button ${this.filter === 'completed' ? 'active' : ''}`}
							onClick={() => this.setFilter('completed')}
						>
							Completed ({completedCount})
						</button>
					</div>
					
					{/* Todo list */}
					<div className="todo-list">
						{filteredTodos.length === 0 ? (
							<div className="empty-message">
								{this.todos.length === 0 
									? 'No todos yet. Add one above!' 
									: `No ${this.filter} todos.`
								}
							</div>
						) : (
							filteredTodos.map(todo => (
								<div key={todo.id.toString()} className="todo-item">
									<input
										type="checkbox"
										checked={todo.completed}
										onChange={() => this.toggleTodo(todo.id)}
									/>
									<span className={`todo-text ${todo.completed ? 'completed' : ''}`}>
										{todo.text}
									</span>
									<button
										className="delete-button"
										onClick={() => this.deleteTodo(todo.id)}
									>
										Delete
									</button>
								</div>
							))
						)}
					</div>
					
					{/* Clear completed section */}
					{completedCount > 0 && (
						<div className="clear-section">
							<button
								className="clear-button"
								onClick={() => this.clearCompleted()}
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