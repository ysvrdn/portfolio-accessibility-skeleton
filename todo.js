document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const todoInput = document.getElementById('todo-input');
    const addBtn = document.getElementById('add-btn');
    const todoList = document.getElementById('todo-list');
    const filtersContainer = document.getElementById('filters');

    // State Management: Load from localStorage or initialize empty array
    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    let currentFilter = 'all';

    // Core Functions (CRUD)
    const saveToLocalStorage = () => {
        localStorage.setItem('todos', JSON.stringify(todos));
    };

    const addTodo = (text) => {
        if (!text.trim()) return;
        
        const newTodo = {
            id: Date.now().toString(),
            text: text.trim(),
            completed: false
        };
        
        todos.push(newTodo);
        saveToLocalStorage();
        renderTodos();
        todoInput.value = '';
        todoInput.focus();
    };

    const deleteTodo = (id) => {
        todos = todos.filter(todo => todo.id !== id);
        saveToLocalStorage();
        renderTodos();
    };

    const toggleTodo = (id) => {
        todos = todos.map(todo => 
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        );
        saveToLocalStorage();
        renderTodos();
    };

    const editTodo = (id, newText) => {
        if (!newText.trim()) return;
        todos = todos.map(todo => 
            todo.id === id ? { ...todo, text: newText.trim() } : todo
        );
        saveToLocalStorage();
        renderTodos();
    };

    // Render Logic with Filtering
    const renderTodos = () => {
        todoList.innerHTML = '';
        
        let filteredTodos = todos;
        if (currentFilter === 'active') {
            filteredTodos = todos.filter(todo => !todo.completed);
        } else if (currentFilter === 'completed') {
            filteredTodos = todos.filter(todo => todo.completed);
        }

        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            li.dataset.id = todo.id; // Store ID on the element for delegation
            
            li.innerHTML = `
                <div class="todo-content">
                    <input type="checkbox" class="toggle-cb" ${todo.completed ? 'checked' : ''} aria-label="Toggle task completion">
                    <span class="todo-text">${todo.text}</span>
                </div>
                <div class="todo-actions">
                    <button class="edit-btn" aria-label="Edit task">Edit</button>
                    <button class="delete-btn" aria-label="Delete task">Delete</button>
                </div>
            `;
            todoList.appendChild(li);
        });
    };

    // Event Listeners
    
    // 1. Add Task Listener
    addBtn.addEventListener('click', () => addTodo(todoInput.value));
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo(todoInput.value);
    });

    // 2. Event Delegation for List Actions (Update, Delete)
    todoList.addEventListener('click', (e) => {
        // Find the closest li element to get the ID
        const li = e.target.closest('.todo-item');
        if (!li) return;
        
        const id = li.dataset.id;

        if (e.target.classList.contains('delete-btn')) {
            deleteTodo(id);
        } 
        else if (e.target.classList.contains('toggle-cb')) {
            toggleTodo(id);
        }
        else if (e.target.classList.contains('edit-btn')) {
            const currentText = todos.find(t => t.id === id).text;
            const newText = prompt('Edit task:', currentText);
            if (newText !== null) {
                editTodo(id, newText);
            }
        }
    });

    // 3. Event Delegation for Filters (Read/Sort)
    filtersContainer.addEventListener('click', (e) => {
        if (e.target.tagName !== 'BUTTON') return;
        
        // Update active class styling
        document.querySelectorAll('.todo-filters button').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        });
        e.target.classList.add('active');
        e.target.setAttribute('aria-pressed', 'true');

        // Update state and re-render
        currentFilter = e.target.dataset.filter;
        renderTodos();
    });

    // Initial Render
    renderTodos();
});
