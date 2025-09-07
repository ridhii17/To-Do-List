document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const todoInput = document.getElementById("todo-input");
  const addTaskBtn = document.getElementById("add-task-btn");
  const todoList = document.getElementById("todo-list");
  const clearAllBtn = document.getElementById("clear-all-btn");
  const toggleThemeBtn = document.getElementById("toggle-theme");
  const exportJsonBtn = document.getElementById("export-json-btn");
  const exportPdfBtn = document.getElementById("export-pdf-btn");
  const exportWordBtn = document.getElementById("export-word-btn");
  const importBtn = document.getElementById("import-btn");
  const importFile = document.getElementById("import-file");
  const searchInput = document.getElementById("search-input");
  const priorityInput = document.getElementById("priority");
  const dueDateInput = document.getElementById("due-date");
  const progressBar = document.getElementById("task-progress");
  const progressText = document.getElementById("progress-text");
  const welcomeMsg = document.getElementById("welcome-msg");
  const taskDetails = document.getElementById("task-details-content");

  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

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
    if(task.dueDate && new Date(task.dueDate) < new Date() && !task.completed) li.classList.add("overdue");

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
    span.textContent = task.text + (task.dueDate ? ` (Due: ${task.dueDate})` : '') + ` [${task.priority}]`;
    if(task.completed) li.classList.add("completed");

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
    delBtn.addEventListener("click", () => {
      tasks = tasks.filter(t => t.id !== task.id);
      saveTasks();
      li.remove();
      updateProgress();
      taskDetails.innerHTML = "<p>Select a task to view details</p>";
    });

    const detailsBtn = document.createElement("button");
    detailsBtn.textContent = "Details";
    detailsBtn.classList.add("edit-btn");
    detailsBtn.addEventListener("click", () => showTaskDetails(task));

    btnContainer.appendChild(editBtn);
    btnContainer.appendChild(delBtn);
    btnContainer.appendChild(detailsBtn);

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
      span.textContent = task.text + (task.dueDate ? ` (Due: ${task.dueDate})` : '') + ` [${task.priority}]`;
      input.replaceWith(span);
    });
    input.addEventListener("keypress", e => { if(e.key==="Enter") input.blur(); });
  }

  // Task Details Panel
  function showTaskDetails(task) {
    taskDetails.innerHTML = `
      <p><strong>Task:</strong> ${task.text}</p>
      <p><strong>Priority:</strong> ${task.priority}</p>
      <p><strong>Due Date:</strong> ${task.dueDate || "N/A"}</p>
      <p><strong>Completed:</strong> ${task.completed ? "Yes" : "No"}</p>
      <div id="subtasks-section">
        <strong>Subtasks:</strong>
        <ul id="subtasks-list">${task.subtasks.map(st => `<li>${st}</li>`).join("")}</ul>
        <input type="text" id="new-subtask" placeholder="Add subtask">
        <button id="add-subtask-btn">Add Subtask</button>
      </div>
    `;
    document.getElementById("add-subtask-btn").addEventListener("click", () => {
      const val = document.getElementById("new-subtask").value.trim();
      if(val) {
        task.subtasks.push(val);
        saveTasks();
        showTaskDetails(task);
      }
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
      updateProgress();
      taskDetails.innerHTML = "<p>Select a task to view details</p>";
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

  // Export JSON
  exportJsonBtn.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(tasks,null,2)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tasks.json";
    a.click();
  });

  // Export PDF
  exportPdfBtn.addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("My Tasks", 14, 20);
    tasks.forEach((task, index) => {
      const status = task.completed ? "✔ Completed" : "⏳ Pending";
      doc.setFontSize(12);
      doc.text(`${index+1}. ${task.text} [${task.priority}] (Due: ${task.dueDate || "N/A"}) - ${status}`, 14, 30 + index*10);
      if(task.subtasks.length){
        task.subtasks.forEach((st,i)=>{doc.text(`   - ${st}`, 18, 35 + index*10 + i*8)});
      }
    });
    doc.save("tasks.pdf");
  });

  // Export Word
  exportWordBtn.addEventListener("click", () => {
    let content = "<h1>My Tasks</h1>";
    tasks.forEach((task,index)=>{
      content += `<p>${index+1}. ${task.text} [${task.priority}] (Due: ${task.dueDate || "N/A"}) - ${task.completed ? "✔ Completed" : "⏳ Pending"}</p>`;
      if(task.subtasks.length){
        content += "<ul>";
        task.subtasks.forEach(st=>content+=`<li>${st}</li>`);
        content += "</ul>";
      }
    });
    const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tasks.doc";
    a.click();
  });

  // Import
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
  const chatBox = document.getElementById("chat-box");
  const chatMessages = document.getElementById("chat-messages");
  const chatInput = document.getElementById("chat-input");
  const openChatBtn = document.getElementById("open-chat");
  const closeChatBtn = document.getElementById("close-chat");

  openChatBtn.addEventListener("click", () => chatBox.style.display="flex");
  closeChatBtn.addEventListener("click", () => chatBox.style.display="none");

  chatInput.addEventListener("keypress", e => {
    if(e.key==="Enter" && chatInput.value.trim()!==""){
      const userMsg = chatInput.value.trim();
      appendChat(`You: ${userMsg}`,"user");
      appendChat(`Bot: ${smartBotResponse(userMsg)}`,"bot");
      chatInput.value="";
      chatMessages.scrollTop=chatMessages.scrollHeight;
    }
  });

  function appendChat(msg,type){
    const div = document.createElement("div");
    div.textContent = msg;
    div.style.color = type==="bot" ? "blue" : "black";
    chatMessages.appendChild(div);
  }

  function smartBotResponse(msg){
    msg = msg.toLowerCase();
    if(msg.includes("add")) return "To add a task, type your task in the input box and click 'Add Task'.";
    if(msg.includes("edit")) return "Click the 'Edit' button next to a task to modify it.";
    if(msg.includes("delete")) return "Click 'Delete' to remove a task.";
    if(msg.includes("clear")) return "Use 'Clear All' to remove all tasks at once.";
    if(msg.includes("theme")) return "Click the Dark Mode button to toggle theme.";
    if(msg.includes("progress") || msg.includes("completed")) return `${tasks.filter(t=>t.completed).length} out of ${tasks.length} tasks are completed.`;
    if(msg.includes("export")) return "You can export your tasks in JSON, PDF, or Word format using the buttons in the sidebar.";
    return "I can guide you: add, edit, delete, clear, theme, progress, export, subtasks.";
  }
});
