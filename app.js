document.addEventListener("DOMContentLoaded", () => {
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

  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  const username = localStorage.getItem("username") || prompt("Enter your name:") || "User";
  localStorage.setItem("username", username);
  welcomeMsg.textContent = `Welcome, ${username}!`;

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
      dueDate: dueDateInput.value
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

    // Highlight overdue
    if(task.dueDate && new Date(task.dueDate) < new Date() && !task.completed) {
      li.style.background = "#f8d7da"; // light red
    }

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      li.classList.toggle("completed", task.completed);
      saveTasks();
      updateProgress();
    });

    const span = document.createElement("span");
    span.textContent = task.text + (task.dueDate ? ` (Due: ${task.dueDate})` : '') + ` [${task.priority}]`;
    if(task.completed) li.classList.add("completed");

    const btnContainer = document.createElement("div");
    btnContainer.classList.add("task-buttons");

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.classList.add("edit-btn");
    editBtn.addEventListener("click", () => {
      const input = document.createElement("input");
      input.type = "text";
      input.value = task.text;
      span.replaceWith(input);
      input.focus();
      input.addEventListener("blur", () => {
        task.text = input.value.trim() || task.text;
        saveTasks();
        span.textContent = task.text + (task.dueDate ? ` (Due: ${task.dueDate})` : '') + ` [${task.priority}]`;
        input.replaceWith(span);
      });
      input.addEventListener("keypress", e => { if(e.key==="Enter") input.blur(); });
    });

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.classList.add("delete-btn");
    delBtn.addEventListener("click", () => {
      tasks = tasks.filter(t => t.id !== task.id);
      saveTasks();
      li.remove();
      updateProgress();
    });

    btnContainer.appendChild(editBtn);
    btnContainer.appendChild(delBtn);

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(btnContainer);
    todoList.appendChild(li);
  }

  // Save Tasks
  function saveTasks() { localStorage.setItem("tasks", JSON.stringify(tasks)); }

  // Clear All
  clearAllBtn.addEventListener("click", () => {
    if(confirm("Are you sure you want to clear all tasks?")) {
      tasks = [];
      saveTasks();
      todoList.innerHTML = "";
      updateProgress();
    }
  });

  // Theme Toggle
  toggleThemeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
  });

  // Progress Update
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

  // Filter Buttons
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;
      Array.from(todoList.children).forEach(li => {
        if(filter==="all") li.style.display = "";
        else if(filter==="completed") li.style.display = li.querySelector("input[type=checkbox]").checked ? "" : "none";
        else if(filter==="pending") li.style.display = li.querySelector("input[type=checkbox]").checked ? "none" : "";
      });
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

  // Chatbot (simple)
  const chatBox = document.getElementById("chat-box");
  const chatMessages = document.getElementById("chat-messages");
  const chatInput = document.getElementById("chat-input");
  const openChatBtn = document.getElementById("open-chat");
  const closeChatBtn = document.getElementById("close-chat");

  openChatBtn.addEventListener("click", () => chatBox.style.display="flex");
  closeChatBtn.addEventListener("click", () => chatBox.style.display="none");

  chatInput.addEventListener("keypress", e => {
    if(e.key === "Enter" && chatInput.value.trim() !== "") {
      const userMsg = chatInput.value.trim();
      const userDiv = document.createElement("div");
      userDiv.textContent = `You: ${userMsg}`;
      chatMessages.appendChild(userDiv);

      // Simple bot responses
      const botDiv = document.createElement("div");
      botDiv.style.color = "blue";
      botDiv.textContent = "Bot: " + simpleBotResponse(userMsg);
      chatMessages.appendChild(botDiv);

      chatMessages.scrollTop = chatMessages.scrollHeight;
      chatInput.value = "";
    }
  });

  function simpleBotResponse(msg) {
    msg = msg.toLowerCase();
    if(msg.includes("how") && msg.includes("add")) return "Use the input box and click 'Add' or press Enter.";
    if(msg.includes("edit")) return "Click the 'Edit' button beside the task to modify it.";
    if(msg.includes("delete")) return "Click 'Delete' to remove a task.";
    if(msg.includes("clear")) return "Use 'Clear All' to remove all tasks at once.";
    if(msg.includes("theme")) return "Use the Dark Mode button to toggle theme.";
    return "I can help with tasks: add, edit, delete, clear, theme.";
  }
});
