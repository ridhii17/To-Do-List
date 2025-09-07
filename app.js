document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const todoInput = document.getElementById("todo-input");
  const addTaskBtn = document.getElementById("add-task-btn");
  const todoList = document.getElementById("todo-list");
  const clearAllBtn = document.getElementById("clear-all-btn");
  const toggleThemeBtn = document.getElementById("toggle-theme");
  const exportWordBtn = document.getElementById("export-word-btn");
  const exportPdfBtn = document.getElementById("export-pdf-btn");
  const importBtn = document.getElementById("import-btn");
  const importFile = document.getElementById("import-file");
  const searchInput = document.getElementById("search-input");
  const priorityInput = document.getElementById("priority");
  const dueDateInput = document.getElementById("due-date");
  const categorySelect = document.getElementById("category-select");
  const progressBar = document.getElementById("task-progress");
  const progressText = document.getElementById("progress-text");
  const welcomeMsg = document.getElementById("welcome-msg");
  const listsTagsContainer = document.getElementById("lists-tags-container");
  const newTagInput = document.getElementById("new-tag-input");
  const addTagBtn = document.getElementById("add-tag-btn");

  // Chatbot
  const chatBox = document.getElementById("chat-box");
  const chatMessages = document.getElementById("chat-messages");
  const chatInput = document.getElementById("chat-input");
  const openChatBtn = document.getElementById("open-chat");
  const closeChatBtn = document.getElementById("close-chat");

  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  let tags = JSON.parse(localStorage.getItem("tags")) || [];

  // Username
  const username = localStorage.getItem("username") || prompt("Enter your name:") || "User";
  localStorage.setItem("username", username);
  welcomeMsg.textContent = `Welcome, ${username}!`;

  // Render tasks and tags
  renderAllTasks();
  renderTags();
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
      category: categorySelect.value,
      subtasks: []
    };

    tasks.push(newTask);
    saveTasks();
    renderTask(newTask);
    todoInput.value = "";
    dueDateInput.value = "";
    categorySelect.value = "";
    updateProgress();
  }

  addTaskBtn.addEventListener("click", addTask);
  todoInput.addEventListener("keypress", e => { if(e.key==="Enter") addTask(); });

  // Render All Tasks
  function renderAllTasks() {
    todoList.innerHTML = "";
    tasks.forEach(renderTask);
  }

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

    // Task Text
    const span = document.createElement("span");
    span.textContent = `${task.text} ${task.dueDate ? `(Due: ${task.dueDate})` : ''} [${task.priority}] ${task.category ? '['+task.category+']':''}`;
    if(task.completed) li.classList.add("completed");

    // Subtasks
    const subtaskContainer = document.createElement("ul");
    subtaskContainer.classList.add("subtasks");
    task.subtasks.forEach((sub, idx) => {
      const subLi = document.createElement("li");
      const subChk = document.createElement("input");
      subChk.type="checkbox";
      subChk.checked=sub.completed;
      subChk.addEventListener("change",()=>{
        sub.completed=subChk.checked;
        saveTasks();
        updateProgress();
      });
      subLi.appendChild(subChk);
      const subSpan=document.createElement("span");
      subSpan.textContent=sub.text;
      subLi.appendChild(subSpan);
      subtaskContainer.appendChild(subLi);
    });

    const addSubInput = document.createElement("input");
    addSubInput.type="text";
    addSubInput.placeholder="Add subtask";
    addSubInput.addEventListener("keypress", e=>{
      if(e.key==="Enter" && addSubInput.value.trim()!==""){
        const sub = { text:addSubInput.value.trim(), completed:false };
        task.subtasks.push(sub);
        saveTasks();
        renderAllTasks();
      }
    });

    // Buttons
    const btnContainer = document.createElement("div");
    btnContainer.classList.add("task-buttons");

    const editBtn = document.createElement("button");
    editBtn.textContent="Edit"; editBtn.classList.add("edit-btn");
    editBtn.addEventListener("click", ()=>{
      const input=document.createElement("input");
      input.type="text";
      input.value=task.text;
      span.replaceWith(input);
      input.focus();
      input.addEventListener("blur", ()=>{
        task.text=input.value.trim() || task.text;
        saveTasks();
        span.textContent = `${task.text} ${task.dueDate ? `(Due: ${task.dueDate})` : ''} [${task.priority}] ${task.category ? '['+task.category+']':''}`;
        input.replaceWith(span);
      });
      input.addEventListener("keypress", e=>{ if(e.key==="Enter") input.blur(); });
    });

    const delBtn=document.createElement("button");
    delBtn.textContent="Delete"; delBtn.classList.add("delete-btn");
    delBtn.addEventListener("click", ()=>{
      tasks = tasks.filter(t=>t.id!==task.id);
      saveTasks();
      li.remove();
      updateProgress();
    });

    btnContainer.appendChild(editBtn);
    btnContainer.appendChild(delBtn);

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(subtaskContainer);
    li.appendChild(addSubInput);
    li.appendChild(btnContainer);
    todoList.appendChild(li);
  }

  // Save tasks
  function saveTasks() { localStorage.setItem("tasks", JSON.stringify(tasks)); }

  // Clear All
  clearAllBtn.addEventListener("click", ()=>{
    if(confirm("Are you sure you want to clear all tasks?")){
      tasks=[];
      saveTasks();
      renderAllTasks();
      updateProgress();
    }
  });

  // Update Progress
  function updateProgress(){
    const total = tasks.length + tasks.reduce((acc,t)=>acc+t.subtasks.length,0);
    const completed = tasks.filter(t=>t.completed).length + tasks.reduce((acc,t)=>acc+t.subtasks.filter(s=>s.completed).length,0);
    progressBar.value = total ? (completed/total*100) : 0;
    progressText.textContent = `${completed} / ${total} tasks completed`;
  }

  // Search
  searchInput.addEventListener("input", ()=>{
    const term=searchInput.value.toLowerCase();
    Array.from(todoList.children).forEach(li=>{
      li.style.display=li.textContent.toLowerCase().includes(term) ? "" : "none";
    });
  });

  // Dark Mode
  toggleThemeBtn.addEventListener("click", ()=>document.body.classList.toggle("dark"));

  // Tags / Categories
  function renderTags(){
    listsTagsContainer.innerHTML="";
    categorySelect.innerHTML='<option value="">Select Category</option>';
    tags.forEach(tag=>{
      const li=document.createElement("li");
      li.textContent=tag;
      listsTagsContainer.appendChild(li);
      const option = document.createElement("option");
      option.value=tag;
      option.textContent=tag;
      categorySelect.appendChild(option);
    });
  }

  addTagBtn.addEventListener("click", ()=>{
    const val=newTagInput.value.trim();
    if(val && !tags.includes(val)){
      tags.push(val);
      localStorage.setItem("tags", JSON.stringify(tags));
      renderTags();
      newTagInput.value="";
    }
  });

  // Export Word
  exportWordBtn.addEventListener("click", ()=>{
    let htmlContent="<h1>My Tasks</h1><ul>";
    tasks.forEach(t=>{
      htmlContent+=`<li>${t.text} [${t.priority}] ${t.category? '['+t.category+']':''} ${t.dueDate? `(Due: ${t.dueDate})`:''}`;
      if(t.subtasks.length>0){
        htmlContent+="<ul>";
        t.subtasks.forEach(st=>{ htmlContent+=`<li>${st.text} ${st.completed? '(Completed)':''}</li>` });
        htmlContent+="</ul>";
      }
      htmlContent+="</li>";
    });
    htmlContent+="</ul>";
    const blob=new Blob([htmlContent], {type:"application/msword"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a"); a.href=url; a.download="tasks.doc"; a.click();
  });

  // Export PDF using html2pdf.js (needs CDN or local script)
  exportPdfBtn.addEventListener("click", ()=>{
    if(typeof html2pdf==="undefined"){ alert("PDF export library missing! Add html2pdf.min.js"); return; }
    html2pdf().from(todoList).set({margin:0.5, filename:'tasks.pdf'}).save();
  });

  // Import Tasks
  importBtn.addEventListener("click", ()=>importFile.click());
  importFile.addEventListener("change", e=>{
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload=()=>{
      tasks=JSON.parse(reader.result);
      saveTasks();
      renderAllTasks();
      updateProgress();
    };
    reader.readAsText(file);
  });

  // Chatbot
  openChatBtn.addEventListener("click", ()=>chatBox.style.display="flex");
  closeChatBtn.addEventListener("click", ()=>chatBox.style.display="none");

  chatInput.addEventListener("keypress", e=>{
    if(e.key==="Enter" && chatInput.value.trim()!==""){
      const userMsg=chatInput.value.trim();
      appendChat(`You: ${userMsg}`,"user");
      appendChat(`Bot: ${getBotResponse(userMsg)}`,"bot");
      chatInput.value="";
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  });

  function appendChat(msg,type){
    const div=document.createElement("div");
    div.textContent=msg;
    div.style.color=type==="bot" ? "blue":"black";
    chatMessages.appendChild(div);
  }

  function getBotResponse(msg){
    msg=msg.toLowerCase();
    if(msg.includes("add")) return "You can type your task in input box and click Add Task button.";
    if(msg.includes("edit")) return "Click the Edit button beside a task to modify it.";
    if(msg.includes("delete")) return "Click Delete to remove a task.";
    if(msg.includes("subtask")) return "You can add subtasks by typing below each task input.";
    if(msg.includes("progress") || msg.includes("completed")) return `${tasks.filter(t=>t.completed).length} out of ${tasks.length} tasks are completed.`;
    if(msg.includes("priority")) return "Tasks are color-coded by priority: Low (Green), Medium (Yellow), High (Red).";
    return "I can guide you: add, edit, delete, subtask, progress, priority, theme.";
  }

});
// End of app.js