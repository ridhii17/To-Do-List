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
  const priorityInput = document.getElementById("priority");
  const dueDateInput = document.getElementById("due-date");
  const progressBar = document.getElementById("task-progress");
  const progressText = document.getElementById("progress-text");
  const welcomeMsg = document.getElementById("welcome-msg");
  const taskDetailsContent = document.getElementById("task-details-content");

  // Chatbot Elements
  const chatBox = document.getElementById("chat-box");
  const chatMessages = document.getElementById("chat-messages");
  const chatInput = document.getElementById("chat-input");
  const openChatBtn = document.getElementById("open-chat");
  const closeChatBtn = document.getElementById("close-chat");

  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  let selectedTaskId = null;

  // Username
  const username = localStorage.getItem("username") || prompt("Enter your name:") || "User";
  localStorage.setItem("username", username);
  welcomeMsg.textContent = `Welcome, ${username}!`;

  // Render existing tasks
  tasks.forEach(task => renderTask(task));
  updateProgress();

  // Add Task
  function addTask() {
    const text = todoInput.value.trim();
    if (!text) return;

    const newTask = {
      id: Date.now(),
      text,
      completed: false,
      priority: priorityInput.value,
      dueDate: dueDateInput.value,
      subtasks: []
    };

    tasks.push(newTask);
    saveTasks();
    renderTask(newTask);
    todoInput.value = "";
    dueDateInput.value = "";
    updateProgress();
  }

  addTaskBtn.addEventListener("click", addTask);
  todoInput.addEventListener("keypress", e => { if(e.key==="Enter") addTask(); });

  // Render Task
  function renderTask(task) {
    const li = document.createElement("li");
    li.classList.add(task.priority);
    li.dataset.id = task.id;
    if(task.dueDate && new Date(task.dueDate) < new Date() && !task.completed) li.classList.add("overdue");
    if(task.completed) li.classList.add("completed");

    // Checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      li.classList.toggle("completed", task.completed);
      saveTasks();
      updateProgress();
    });

    // Task text
    const span = document.createElement("span");
    span.textContent = task.text;
    span.style.cursor = "pointer";
    span.addEventListener("click", () => showTaskDetails(task));

    // Buttons
    const btnContainer = document.createElement("div");
    btnContainer.classList.add("task-buttons");

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.classList.add("edit-btn");
    editBtn.addEventListener("click", () => editTask(task, span));

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.classList.add("delete-btn");
    delBtn.addEventListener("click", () => deleteTask(task.id, li));

    btnContainer.appendChild(editBtn);
    btnContainer.appendChild(delBtn);

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(btnContainer);
    todoList.appendChild(li);
  }

  // Edit Task
  function editTask(task, span) {
    const input = document.createElement("input");
    input.type = "text";
    input.value = task.text;
    span.replaceWith(input);
    input.focus();
    input.addEventListener("blur", () => {
      task.text = input.value.trim() || task.text;
      saveTasks();
      span.textContent = task.text;
      input.replaceWith(span);
    });
    input.addEventListener("keypress", e => { if(e.key==="Enter") input.blur(); });
  }

  // Delete Task
  function deleteTask(id, li) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    li.remove();
    taskDetailsContent.innerHTML = "<p>Select a task to view details</p>";
    updateProgress();
  }

  // Show Task Details
  function showTaskDetails(task) {
    selectedTaskId = task.id;
    taskDetailsContent.innerHTML = `
      <h4>${task.text}</h4>
      <p><strong>Priority:</strong> ${task.priority}</p>
      <p><strong>Due Date:</strong> ${task.dueDate || "Not set"}</p>
      <div>
        <strong>Subtasks:</strong>
        <ul id="subtasks-list"></ul>
        <input type="text" id="subtask-input" placeholder="Add subtask" />
        <button id="add-subtask-btn">Add</button>
      </div>
      <button id="save-task-btn">Save</button>
      <button id="delete-task-btn">Delete</button>
    `;

    const subtasksList = document.getElementById("subtasks-list");
    task.subtasks.forEach(st => {
      const li = document.createElement("li");
      li.textContent = st;
      subtasksList.appendChild(li);
    });

    document.getElementById("add-subtask-btn").addEventListener("click", () => {
      const input = document.getElementById("subtask-input");
      const val = input.value.trim();
      if(val) {
        task.subtasks.push(val);
        const li = document.createElement("li");
        li.textContent = val;
        subtasksList.appendChild(li);
        input.value = "";
        saveTasks();
      }
    });

    document.getElementById("save-task-btn").addEventListener("click", () => {
      saveTasks();
      todoList.innerHTML = "";
      tasks.forEach(renderTask);
      alert("Task saved!");
    });

    document.getElementById("delete-task-btn").addEventListener("click", () => {
      const liToRemove = [...todoList.children].find(li => li.dataset.id == task.id);
      deleteTask(task.id, liToRemove);
    });
  }

  // Save tasks
  function saveTasks() { localStorage.setItem("tasks", JSON.stringify(tasks)); }

  // Clear All
  clearAllBtn.addEventListener("click", () => {
    if(confirm("Are you sure you want to clear all tasks?")) {
      tasks = [];
      saveTasks();
      todoList.innerHTML = "";
      taskDetailsContent.innerHTML = "<p>Select a task to view details</p>";
      updateProgress();
    }
  });

  // Theme Toggle
  toggleThemeBtn.addEventListener("click", () => { document.body.classList.toggle("dark"); });

  // Update Progress
  function updateProgress() {
    const completed = tasks.filter(t => t.completed).length;
    const total = tasks.length;
    progressBar.value = total ? (completed/total*100) : 0;
    progressText.textContent = `${completed} / ${total} tasks completed`;
  }

  // Search
  searchInput.addEventListener("input", () => {
    const term = searchInput.value.toLowerCase();
    Array.from(todoList.children).forEach(li => {
      li.style.display = li.textContent.toLowerCase().includes(term) ? "" : "none";
    });
  });

  // Export / Import
  exportBtn.addEventListener("click", () => {
    const dataStr = JSON.stringify(tasks, null, 2);
    const blob = new Blob([dataStr], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tasks.json";
    a.click();
  });

  importBtn.addEventListener("click", () => importFile.click());
  importFile.addEventListener("change", e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      tasks = JSON.parse(reader.result);
      saveTasks();
      todoList.innerHTML = "";
      tasks.forEach(renderTask);
      updateProgress();
    };
    reader.readAsText(file);
  });

  // Chatbot
  openChatBtn.addEventListener("click", () => chatBox.style.display="flex");
  closeChatBtn.addEventListener("click", () => chatBox.style.display="none");

  chatInput.addEventListener("keypress", e => {
    if(e.key === "Enter" && chatInput.value.trim() !== "") {
      const userMsg = chatInput.value.trim();
      appendChat(`You: ${userMsg}`, "user");
      appendChat(`Bot: ${getBotResponse(userMsg)}`, "bot");
      chatInput.value = "";
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  });

  function appendChat(msg, type) {
    const div = document.createElement("div");
    div.textContent = msg;
    div.style.color = type==="bot" ? "blue" : "black";
    chatMessages.appendChild(div);
  }

  function getBotResponse(msg) {
    msg = msg.toLowerCase();
    if(msg.includes("add")) return "Use the input box and click 'Add Task' to create a new task.";
    if(msg.includes("edit")) return "Click the 'Edit' button beside a task to modify it.";
    if(msg.includes("delete")) return "Click 'Delete' to remove a task.";
    if(msg.includes("clear")) return "Use 'Clear All' button to remove all tasks.";
    if(msg.includes("theme")) return "Use the Dark Mode button to switch theme.";
    if(msg.includes("progress") || msg.includes("completed")) return `${tasks.filter(t=>t.completed).length} out of ${tasks.length} tasks are completed.`;
    if(msg.includes("subtask")) return "Click on a task to open details and add subtasks.";
    return "I can guide you: add, edit, delete, clear, theme, progress, subtasks.";
  }
});
