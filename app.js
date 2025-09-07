document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const todoInput = document.getElementById("todo-input");
  const addTaskBtn = document.getElementById("add-task-btn");
  const todoList = document.getElementById("todo-list");
  const clearAllBtn = document.getElementById("clear-all-btn");
  const toggleThemeBtn = document.getElementById("toggle-theme");
  const exportBtn = document.getElementById("export-btn");
  const importBtn = document.getElementById("import-btn");
  const importFile = document.getElementById("import-file");
  const searchInput = document.getElementById("search-input");
  const filterBtns = document.querySelectorAll(".filter-btn");
  const priorityInput = document.getElementById("priority");
  const dueDateInput = document.getElementById("due-date");
  const progressBar = document.getElementById("task-progress");
  const progressText = document.getElementById("progress-text");
  const welcomeMsg = document.getElementById("welcome-msg");

  // Chatbot
  const chatBox = document.getElementById("chat-box");
  const chatMessages = document.getElementById("chat-messages");
  const chatInput = document.getElementById("chat-input");
  const openChatBtn = document.getElementById("open-chat");
  const closeChatBtn = document.getElementById("close-chat");

  // Tasks
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  // User
  const username = localStorage.getItem("username") || prompt("Enter your name:") || "User";
  localStorage.setItem("username", username);
  welcomeMsg.textContent = `Welcome, ${username}!`;

  tasks.forEach(task => renderTask(task));
  updateProgress();

  // Add task
  function addTask() {
    const text = todoInput.value.trim();
    if (!text) return;

    const task = {
      id: Date.now(),
      text,
      completed: false,
      priority: priorityInput.value,
      dueDate: dueDateInput.value
    };
    tasks.push(task);
    saveTasks();
    renderTask(task);
    todoInput.value = "";
    dueDateInput.value = "";
    updateProgress();
  }

  addTaskBtn.addEventListener("click", addTask);
  todoInput.addEventListener("keypress", e => { if(e.key==="Enter") addTask
  });

  // Render task
  function renderTask(task) {
    const li = document.createElement("li");
    li.className = "todo-item";
    li.dataset.id = task.id;
    if (task.completed) li.classList.add("completed");
    if (task.priority) li.classList.add(task.priority.toLowerCase());
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", e => {
      task.completed = e.target.checked;
      saveTasks();
      updateProgress();
    });
    li.appendChild(checkbox);
    const span = document.createElement("span");
    span.className = "task-text";
    span.textContent = task.text;
    li.appendChild(span);
    const badge = document.createElement("span");
    badge.className = "task-badge";
    badge.textContent = task.priority;
    li.appendChild(badge);
    todoList.appendChild(li);
  }

  // Save tasks
  function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderTasks();
  }

  // Render tasks
  function renderTasks() {
    todoList.innerHTML = "";
    tasks.forEach(task => renderTask(task));
    updateProgress();
  }

  // Clear all tasks
  clearAllBtn.addEventListener("click", () => {
    tasks = [];
    saveTasks();
    renderTasks();
    updateProgress();
  });  

  // Toggle theme
  toggleThemeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    toggleThemeBtn.textContent = document.body.classList.contains("dark-mode") ? "🌞 Light Mode" : "🌙 Dark Mode";
  });

  // Export tasks
  exportBtn.addEventListener("click", () => {
    const data = JSON.stringify(tasks);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tasks.json";
    a.click();
    URL.revokeObjectURL(url);
  });

  // Import tasks
  importBtn.addEventListener("click", () => {
    importFile.click();
  });

  importFile.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      tasks = JSON.parse(e.target.result);
      saveTasks();
      renderTasks();
      updateProgress();
    };
    reader.readAsText(file);
  });

  // Search tasks
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    const filteredTasks = tasks.filter(task => task.text.toLowerCase().includes(query));
    renderTasks(filteredTasks);
  });

  // Filter tasks
  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;
      const filteredTasks = tasks.filter(task => {
        if (filter === "all") return true;
        if (filter === "completed" && task.completed) return true;
        if (filter === "pending" && !task.completed) return true;
        return false;
      });
      renderTasks(filteredTasks);
    });
  });

  // Chatbot
  openChatBtn.addEventListener("click", () => {
    chatBox.style.display = "block";
  });

  closeChatBtn.addEventListener("click", () => {
    chatBox.style.display = "none";
  });

  chatInput.addEventListener("keypress", e => {
    if (e.key === "Enter") {
      const message = chatInput.value.trim();
      if (!message) return;
      chatMessages.innerHTML += `<p class="chat-message">You: ${message}</p>`;
      chatInput.value = "";
    }
  });
});

  // Update progress
  function updateProgress() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    progressBar.style.width = `${percent}%`;
    progressText.textContent = `${percent}% Completed`;
  }

  // Load tasks
  function loadTasks() {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) tasks = JSON.parse(savedTasks);
    renderTasks();
  }

  loadTasks();
  updateProgress();

  // Initial theme
  if (document.body.classList.contains("dark-mode")) {
    toggleThemeBtn.textContent = "🌞 Light Mode"  
    } else {
    toggleThemeBtn.textContent = "🌙 Dark Mode"
    };
    