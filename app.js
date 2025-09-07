// app.js

// DOM Elements
const todoInput = document.getElementById('todo-input');
const addTaskBtn = document.getElementById('add-task-btn');
const todoList = document.getElementById('todo-list');
const clearAllBtn = document.getElementById('clear-all-btn');
const progressText = document.getElementById('progress-text');
const taskProgress = document.getElementById('task-progress');
const exportPdfBtn = document.getElementById('export-pdf-btn');
const exportWordBtn = document.getElementById('export-word-btn');
const toggleThemeBtn = document.getElementById('toggle-theme');
const calendarDate = document.getElementById('calendar-date');
const chatbotBtn = document.getElementById('open-chat');
const chatbotBox = document.getElementById('chat-box');
const closeChatBtn = document.getElementById('close-chat');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');

// Task Data
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Theme Data
const themes = {
  light: {
    '--bg-color': '#ffffff',
    '--text-color': '#000000',
    '--btn-bg': '#007bff',
    '--btn-hover': '#0056b3',
    '--card-bg': '#f8f9fa',
  },
  dark: {
    '--bg-color': '#343a40',
    '--text-color': '#ffffff',
    '--btn-bg': '#6c757d',
    '--btn-hover': '#5a6268',
    '--card-bg': '#495057',
  },
};

// Initialize Theme
function setTheme(theme) {
  const root = document.documentElement;
  Object.keys(themes[theme]).forEach((key) => {
    root.style.setProperty(key, themes[theme][key]);
  });
  localStorage.setItem('theme', theme);
}

// Load Theme
const savedTheme = localStorage.getItem('theme') || 'light';
setTheme(savedTheme);

// Toggle Theme
toggleThemeBtn.addEventListener('click', () => {
  const newTheme = savedTheme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
  savedTheme = newTheme;
});

// Add Task
addTaskBtn.addEventListener('click', () => {
  const taskText = todoInput.value.trim();
  if (taskText) {
    const task = {
      id: Date.now(),
      text: taskText,
      completed: false,
      dueDate: calendarDate.value,
      category: 'General',
    };
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
    todoInput.value = '';
  }
});

// Render Tasks
function renderTasks() {
  todoList.innerHTML = '';
  tasks.forEach((task) => {
    const li = document.createElement('li');
    li.classList.add('task');
    if (task.completed) li.classList.add('completed');
    li.innerHTML = `
      <span>${task.text}</span>
      <span class="due-date">${task.dueDate}</span>
      <span class="category">${task.category}</span>
      <button class="edit-btn">✏️</button>
      <button class="delete-btn">🗑️</button>
    `;
    li.querySelector('.edit-btn').addEventListener('click', () => editTask(task.id));
    li.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));
    li.addEventListener('click', () => toggleCompletion(task.id));
    todoList.appendChild(li);
  });
  updateProgress();
}

// Edit Task
function editTask(id) {
  const task = tasks.find((task) => task.id === id);
  todoInput.value = task.text;
  calendarDate.value = task.dueDate;
  // Add logic to update task
}

// Delete Task
function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  localStorage.setItem('tasks', JSON.stringify(tasks));
  renderTasks();
}

// Toggle Task Completion
function toggleCompletion(id) {
  const task = tasks.find((task) => task.id === id);
  task.completed = !task.completed;
  localStorage.setItem('tasks', JSON.stringify(tasks));
  renderTasks();
}

// Update Progress
function updateProgress() {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  progressText.textContent = `${completedTasks} / ${totalTasks} tasks completed`;
  taskProgress.value = (completedTasks / totalTasks) * 100;
}

// Clear All Tasks
clearAllBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to clear all tasks?')) {
    tasks = [];
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
  }
});

// Export to PDF
exportPdfBtn.addEventListener('click', () => {
  // Implement PDF export functionality
});

// Export to Word
exportWordBtn.addEventListener('click', () => {
  // Implement Word export functionality
});

// Chatbot
chatbotBtn.addEventListener('click', () => {
  chatbotBox.style.display = 'flex';
});

closeChatBtn.addEventListener('click', () => {
  chatbotBox.style.display = 'none';
});

chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const userMessage = chatInput.value.trim();
    if (userMessage) {
      chatMessages.innerHTML += `<div class="user-msg">${userMessage}</div>`;
      chatInput.value = '';
      // Add logic to handle chatbot responses
    }
  }
});

// Initialize
renderTasks();
