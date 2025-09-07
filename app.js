document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const todoInput = document.getElementById("todo-input");
  const addTaskBtn = document.getElementById("add-task-btn");
  const todoList = document.getElementById("todo-list");
  const clearAllBtn = document.getElementById("clear-all-btn");
  const toggleThemeBtn = document.getElementById("toggle-theme");
  const exportPdfBtn = document.getElementById("export-pdf-btn");
  const exportWordBtn = document.getElementById("export-word-btn");
  const searchInput = document.getElementById("search-input");
  const priorityInput = document.getElementById("priority");
  const dueDateInput = document.getElementById("due-date");
  const tagInput = document.getElementById("tag-input");
  const progressBar = document.getElementById("task-progress");
  const progressText = document.getElementById("progress-text");
  const welcomeMsg = document.getElementById("welcome-msg");

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
      tag: tagInput.value.trim(),
      subtasks: []
    };

    tasks.push(newTask);
    saveTasks();
    renderTask(newTask);
    todoInput.value = ""; dueDateInput.value = ""; tagInput.value = "";
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
    span.textContent = task.text + (task.dueDate ? ` (Due: ${task.dueDate})` : '') + (task.tag ? ` [${task.tag}]` : '');
    if(task.completed) li.classList.add("completed");

    // Buttons
    const btnContainer = document.createElement("div");
    btnContainer.classList.add("task-buttons");

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit"; editBtn.classList.add("edit-btn");
    editBtn.addEventListener("click", () => {
      const input = document.createElement("input");
      input.type = "text"; input.value = task.text;
      span.replaceWith(input); input.focus();
      input.addEventListener("blur", () => {
        task.text = input.value.trim() || task.text;
        saveTasks();
        span.textContent = task.text + (task.dueDate ? ` (Due: ${task.dueDate})` : '') + (task.tag ? ` [${task.tag}]` : '');
        input.replaceWith(span);
      });
      input.addEventListener("keypress", e => { if(e.key==="Enter") input.blur(); });
    });

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete"; delBtn.classList.add("delete-btn");
    delBtn.addEventListener("click", () => {
      tasks = tasks.filter(t => t.id !== task.id);
      saveTasks(); li.remove(); updateProgress();
    });

    btnContainer.appendChild(editBtn); btnContainer.appendChild(delBtn);

    // Subtasks
    const subtaskList = document.createElement("ul");
    task.subtasks.forEach(sub => {
      const subLi = document.createElement("li");
      subLi.textContent = sub.text;
      const subCheck = document.createElement("input"); subCheck.type="checkbox";
      subCheck.checked = sub.completed;
      subCheck.addEventListener("change", ()=>{
        sub.completed = subCheck.checked; saveTasks(); updateProgress();
      });
      subLi.prepend(subCheck); subtaskList.appendChild(subLi);
    });

    li.appendChild(checkbox); li.appendChild(span); li.appendChild(btnContainer); li.appendChild(subtaskList);
    todoList.appendChild(li);
  }

  // Save tasks
  function saveTasks() { localStorage.setItem("tasks", JSON.stringify(tasks)); }

  // Clear All
  clearAllBtn.addEventListener("click", () => {
    if(confirm("Are you sure you want to clear all tasks?")) {
      tasks = []; saveTasks(); todoList.innerHTML = ""; updateProgress();
    }
  });

  // Theme Toggle
  toggleThemeBtn.addEventListener("click", ()=>document.body.classList.toggle("dark"));

  // Update Progress
  function updateProgress() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed || t.subtasks.every(s=>s.completed)).length;
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

  // Export PDF
  exportPdfBtn.addEventListener("click", ()=>{
    if(tasks.length===0){alert("No tasks to export."); return;}
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(14);
    let y=10;
    tasks.forEach((t,i)=>{
      doc.text(`${i+1}. ${t.text} [${t.priority}]${t.tag? ' ['+t.tag+']':''}${t.dueDate? ' (Due:'+t.dueDate+')':''}`, 10, y);
      y+=8;
      t.subtasks.forEach(sub=>{ doc.text(`- ${sub.text} ${sub.completed? '[Done]':''}`, 15, y); y+=6; });
    });
    doc.save("tasks.pdf");
  });

  // Export Word
  exportWordBtn.addEventListener("click", ()=>{
    if(tasks.length===0){alert("No tasks to export."); return;}
    let html = "<html><head><meta charset='utf-8'><title>Tasks</title></head><body>";
    html += "<h2>Tasks</h2><ul>";
    tasks.forEach(t=>{
      html += `<li>${t.text} [${t.priority}]${t.tag? ' ['+t.tag+']':''}${t.dueDate? ' (Due:'+t.dueDate+')':''}<ul>`;
      t.subtasks.forEach(sub=> html+= `<li>${sub.text} ${sub.completed? '[Done]':''}</li>`);
      html+="</ul></li>";
    });
    html+="</ul></body></html>";
    const blob = new Blob([html], {type:"application/msword"});
    const url = URL.createObjectURL(blob);
    const a=document.createElement("a"); a.href=url; a.download="tasks.doc"; a.click();
  });

  // Chatbot
  const chatBox = document.getElementById("chat-box");
  const chatMessages = document.getElementById("chat-messages");
  const chatInput = document.getElementById("chat-input");
  const openChatBtn = document.getElementById("open-chat");
  const closeChatBtn = document.getElementById("close-chat");

  openChatBtn.addEventListener("click", ()=>chatBox.style.display="flex");
  closeChatBtn.addEventListener("click", ()=>chatBox.style.display="none");

  chatInput.addEventListener("keypress", e=>{
    if(e.key==="Enter" && chatInput.value.trim()!==""){
      const msg=chatInput.value.trim();
      appendChat(`You: ${msg}`, "user");
      appendChat(`Bot: ${getBotResponse(msg)}`, "bot");
      chatInput.value="";
      chatMessages.scrollTop=chatMessages.scrollHeight;
    }
  });

  function appendChat(msg,type){
    const div=document.createElement("div");
    div.textContent=msg; div.style.color=type==="bot"?"blue":"black";
    chatMessages.appendChild(div);
  }

  function getBotResponse(msg){
    msg=msg.toLowerCase();
    if(msg.includes("add")) return "You can add tasks using the input box. You can also add priority, due date, and tags!";
    if(msg.includes("edit")) return "Click the Edit button beside a task to modify it.";
    if(msg.includes("delete")) return "Click Delete to remove a task.";
    if(msg.includes("subtask")) return "You can create subtasks under any main task.";
    if(msg.includes("theme")) return "Use Dark Mode button to toggle themes.";
    if(msg.includes("progress") || msg.includes("completed")) return `${tasks.filter(t=>t.completed).length} out of ${tasks.length} tasks are completed.`;
    return "I can help you: add, edit, delete, subtasks, theme, progress, export PDF/Word.";
    
  }
});