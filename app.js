const input = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const list = document.getElementById('todo-list');
const countEl = document.getElementById('count');
const clearBtn = document.getElementById('clear-btn');
const filterBtns = document.querySelectorAll('.filter-btn');

let todos = JSON.parse(localStorage.getItem('todos') || '[]');
let filter = 'all';

function save() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

function render() {
  const visible = todos.filter(t => {
    if (filter === 'active') return !t.done;
    if (filter === 'done') return t.done;
    return true;
  });

  list.innerHTML = '';

  if (visible.length === 0) {
    list.innerHTML = '<li class="empty">항목이 없습니다</li>';
  } else {
    visible.forEach(todo => {
      const li = document.createElement('li');
      li.className = 'todo-item' + (todo.done ? ' done' : '');

      li.innerHTML = `
        <input type="checkbox" ${todo.done ? 'checked' : ''} data-id="${todo.id}" />
        <span class="text">${escapeHtml(todo.text)}</span>
        <button class="delete-btn" data-id="${todo.id}">✕</button>
      `;

      list.appendChild(li);
    });
  }

  const remaining = todos.filter(t => !t.done).length;
  countEl.textContent = `남은 항목: ${remaining}개`;
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function addTodo() {
  const text = input.value.trim();
  if (!text) return;
  todos.unshift({ id: Date.now(), text, done: false });
  input.value = '';
  save();
  render();
}

addBtn.addEventListener('click', addTodo);
input.addEventListener('keydown', e => { if (e.key === 'Enter') addTodo(); });

list.addEventListener('change', e => {
  if (e.target.type === 'checkbox') {
    const id = Number(e.target.dataset.id);
    const todo = todos.find(t => t.id === id);
    if (todo) { todo.done = e.target.checked; save(); render(); }
  }
});

list.addEventListener('click', e => {
  if (e.target.classList.contains('delete-btn')) {
    const id = Number(e.target.dataset.id);
    todos = todos.filter(t => t.id !== id);
    save();
    render();
  }
});

clearBtn.addEventListener('click', () => {
  todos = todos.filter(t => !t.done);
  save();
  render();
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filter = btn.dataset.filter;
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    render();
  });
});

render();
