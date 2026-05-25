let todos = JSON.parse(localStorage.getItem('todos') || '[]');
let filter = 'all';
let calendarYear, calendarMonth, selectedDate;

const today = new Date();
calendarYear = today.getFullYear();
calendarMonth = today.getMonth();
selectedDate = null;

const input     = document.getElementById('todo-input');
const dateInput = document.getElementById('date-input');
const addBtn    = document.getElementById('add-btn');
const list      = document.getElementById('todo-list');
const countEl   = document.getElementById('count');
const clearBtn  = document.getElementById('clear-btn');
const filterBtns = document.querySelectorAll('.filter-btn');
const tabBtns    = document.querySelectorAll('.tab-btn');
const detailList = document.getElementById('detail-list');

dateInput.value = today.toISOString().split('T')[0];

function save() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${y}.${m}.${d}`;
}

// ── 목록 탭 ──────────────────────────────────────────────
function render() {
  let visible = todos.filter(t => {
    if (filter === 'active') return !t.done;
    if (filter === 'done')   return t.done;
    return true;
  });

  visible.sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return a.date.localeCompare(b.date);
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
        <div class="todo-content">
          <span class="text">${escapeHtml(todo.text)}</span>
          ${todo.date ? `<span class="todo-date">${formatDate(todo.date)}</span>` : ''}
        </div>
        <button class="delete-btn" data-id="${todo.id}">✕</button>
      `;
      list.appendChild(li);
    });
  }

  countEl.textContent = `남은 항목: ${todos.filter(t => !t.done).length}개`;
}

function addTodo() {
  const text = input.value.trim();
  if (!text) return;
  todos.unshift({ id: Date.now(), text, done: false, date: dateInput.value || null });
  input.value = '';
  save();
  render();
}

addBtn.addEventListener('click', addTodo);
input.addEventListener('keydown', e => { if (e.key === 'Enter') addTodo(); });

list.addEventListener('change', e => {
  if (e.target.type === 'checkbox') {
    const todo = todos.find(t => t.id === Number(e.target.dataset.id));
    if (todo) { todo.done = e.target.checked; save(); render(); renderCalendar(); }
  }
});

list.addEventListener('click', e => {
  if (e.target.classList.contains('delete-btn')) {
    todos = todos.filter(t => t.id !== Number(e.target.dataset.id));
    save(); render(); renderCalendar();
  }
});

clearBtn.addEventListener('click', () => {
  todos = todos.filter(t => !t.done);
  save(); render(); renderCalendar();
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filter = btn.dataset.filter;
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    render();
  });
});

// ── 달력 탭 ──────────────────────────────────────────────
function renderCalendar() {
  const titleEl = document.getElementById('calendar-title');
  const daysEl  = document.getElementById('calendar-days');

  titleEl.textContent = `${calendarYear}년 ${calendarMonth + 1}월`;

  const firstDay    = new Date(calendarYear, calendarMonth, 1).getDay();
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const todayStr    = today.toISOString().split('T')[0];

  const byDate = {};
  todos.forEach(t => {
    if (t.date) {
      (byDate[t.date] = byDate[t.date] || []).push(t);
    }
  });

  daysEl.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'calendar-days-grid';

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    empty.className = 'calendar-day empty';
    grid.appendChild(empty);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayTodos = byDate[dateStr] || [];
    const done  = dayTodos.filter(t => t.done).length;
    const total = dayTodos.length;

    const cell = document.createElement('div');
    cell.className = 'calendar-day';
    if (dateStr === todayStr)    cell.classList.add('today');
    if (dateStr === selectedDate) cell.classList.add('selected');

    cell.innerHTML = `
      <span class="day-num">${d}</span>
      ${total > 0 ? `<span class="day-badge${done === total ? ' all-done' : ''}">${done}/${total}</span>` : ''}
    `;
    cell.addEventListener('click', () => {
      selectedDate = dateStr;
      renderCalendar();
      renderDetail(dateStr);
    });
    grid.appendChild(cell);
  }

  daysEl.appendChild(grid);

  if (selectedDate) {
    const [sy, sm] = selectedDate.split('-').map(Number);
    if (sy === calendarYear && sm === calendarMonth + 1) {
      renderDetail(selectedDate);
    } else {
      document.getElementById('calendar-detail').style.display = 'none';
    }
  }
}

function renderDetail(dateStr) {
  const detail  = document.getElementById('calendar-detail');
  const dateEl  = document.getElementById('detail-date');
  const [y, m, d] = dateStr.split('-');
  dateEl.textContent = `${y}년 ${m}월 ${d}일`;

  const dayTodos = todos.filter(t => t.date === dateStr);
  detail.style.display = 'block';
  detailList.innerHTML = '';

  if (dayTodos.length === 0) {
    detailList.innerHTML = '<li class="empty">이 날의 할 일이 없습니다</li>';
    return;
  }

  dayTodos.forEach(todo => {
    const li = document.createElement('li');
    li.className = 'todo-item' + (todo.done ? ' done' : '');
    li.innerHTML = `
      <input type="checkbox" ${todo.done ? 'checked' : ''} data-id="${todo.id}" />
      <span class="text">${escapeHtml(todo.text)}</span>
      <button class="delete-btn" data-id="${todo.id}">✕</button>
    `;
    detailList.appendChild(li);
  });
}

detailList.addEventListener('change', e => {
  if (e.target.type === 'checkbox') {
    const todo = todos.find(t => t.id === Number(e.target.dataset.id));
    if (todo) { todo.done = e.target.checked; save(); render(); renderCalendar(); }
  }
});

detailList.addEventListener('click', e => {
  if (e.target.classList.contains('delete-btn')) {
    todos = todos.filter(t => t.id !== Number(e.target.dataset.id));
    save(); render(); renderCalendar();
  }
});

document.getElementById('prev-month').addEventListener('click', () => {
  calendarMonth--;
  if (calendarMonth < 0) { calendarMonth = 11; calendarYear--; }
  renderCalendar();
});

document.getElementById('next-month').addEventListener('click', () => {
  calendarMonth++;
  if (calendarMonth > 11) { calendarMonth = 0; calendarYear++; }
  renderCalendar();
});

// ── 탭 전환 ──────────────────────────────────────────────
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
    if (btn.dataset.tab === 'calendar') renderCalendar();
  });
});

render();
