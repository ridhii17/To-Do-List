document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const todoInput = document.getElementById("todo-input");
  const addTaskBtn = document.getElementById("add-task-btn");
  const todoList = document.getElementById("todo-list");
  const clearAllBtn = document.getElementById("clear-all-btn");
  const toggleThemeBtn = document.getElementById("toggle-theme");
  const exportPDFBtn = document.getElementById("export-pdf-btn");
  const exportWordBtn = document.getElementById("export-word-btn");
  const searchInput = document.getElementById("search-input");
  const filterBtns = document.querySelectorAll(".filter-btn");
  const priorityInput = document.getElementById("priority");
  const dueDateInput = document.getElementById("due-date");
  const progressBar = document.getElementById("task-progress");
  const progressText = document.getElementById("progress-text");
  const welcomeMsg = document.getElementById("welcome-msg");

  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  // Username
  const username =
    localStorage.getItem("username") || prompt("Enter your name:") || "User";
  localStorage.setItem("username", username);
  welcomeMsg.textContent = `Welcome, ${username}!`;

  // Render existing tasks
  tasks.forEach((task) => renderTask(task));
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
      subtasks: [],
    };

    tasks.push(newTask);
    saveTasks();
    renderTask(newTask);
    todoInput.value = "";
    dueDateInput.value = "";
    updateProgress();
  }

  addTaskBtn.addEventListener("click", addTask);
  todoInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addTask();
  });

  // Render Task
  function renderTask(task) {
    const li = document.createElement("li");
    li.classList.add(task.priority);
    if (task.dueDate && new Date(task.dueDate) < new Date() && !task.completed)
      li.classList.add("overdue");

    // Checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      li.classList.toggle("completed", task.completed);
      updateProgress();
      saveTasks();
    });

    // Task text
    const span = document.createElement("span");
    span.textContent =
      task.text +
      (task.dueDate ? ` (Due: ${task.dueDate})` : "") +
      ` [${task.priority}]`;
    if (task.completed) li.classList.add("completed");

    // Buttons
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
        span.textContent =
          task.text +
          (task.dueDate ? ` (Due: ${task.dueDate})` : "") +
          ` [${task.priority}]`;
        input.replaceWith(span);
        saveTasks();
      });
      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") input.blur();
      });
    });

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.classList.add("delete-btn");
    delBtn.addEventListener("click", () => {
      tasks = tasks.filter((t) => t.id !== task.id);
      saveTasks();
      li.remove();
      updateProgress();
    });

    btnContainer.appendChild(editBtn);
    btnContainer.appendChild(delBtn);

    // Subtasks
    const subtaskList = document.createElement("ul");
    subtaskList.classList.add("subtask-list");

    task.subtasks.forEach((sub) => {
      const subLi = document.createElement("li");
      const subCheckbox = document.createElement("input");
      subCheckbox.type = "checkbox";
      subCheckbox.checked = sub.completed;
      subCheckbox.addEventListener("change", () => {
        sub.completed = subCheckbox.checked;
        subLi.classList.toggle("completed", sub.completed);
        updateProgress();
        saveTasks();
      });
      const subSpan = document.createElement("span");
      subSpan.textContent = sub.text;
      if (sub.completed) subLi.classList.add("completed");

      subLi.appendChild(subCheckbox);
      subLi.appendChild(subSpan);
      subtaskList.appendChild(subLi);
    });

    // Subtask input
    const subInput = document.createElement("input");
    subInput.type = "text";
    subInput.placeholder = "Add Subtask...";
    subInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && subInput.value.trim() !== "") {
        const newSub = { text: subInput.value.trim(), completed: false };
        task.subtasks.push(newSub);
        saveTasks();
        renderTaskSubtask(newSub, subtaskList, task);
        subInput.value = "";
        updateProgress();
      }
    });
    subtaskList.appendChild(subInput);

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(btnContainer);
    li.appendChild(subtaskList);

    todoList.appendChild(li);

    // Make tasks sortable
    new Sortable(todoList, {
      animation: 150,
      handle: "span",
      onEnd: (evt) => {
        const moved = tasks.splice(evt.oldIndex, 1)[0];
        tasks.splice(evt.newIndex, 0, moved);
        saveTasks();
      },
    });

    // Make subtasks sortable
    new Sortable(subtaskList, {
      animation: 100,
      onEnd: (evt) => {
        const movedSub = task.subtasks.splice(evt.oldIndex, 1)[0];
        task.subtasks.splice(evt.newIndex, 0, movedSub);
        saveTasks();
        updateProgress();
      },
    });
  }

  function renderTaskSubtask(sub, ul, task) {
    const li = document.createElement("li");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = sub.completed;
    checkbox.addEventListener("change", () => {
      sub.completed = checkbox.checked;
      li.classList.toggle("completed", sub.completed);
      updateProgress();
      saveTasks();
    });
    const span = document.createElement("span");
    span.textContent = sub.text;
    if (sub.completed) li.classList.add("completed");
    li.appendChild(checkbox);
    li.appendChild(span);
    ul.insertBefore(li, ul.querySelector("input"));
  }

  // Save tasks
  function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  // Clear All
  clearAllBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear all tasks?")) {
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

  // Update Progress
  function updateProgress() {
    let total = tasks.length,
      completed = tasks.filter((t) => t.completed).length;
    tasks.forEach(
      (t) => (completed += t.subtasks.filter((s) => s.completed).length)
    );
    let subTotal = tasks.reduce((sum, t) => sum + t.subtasks.length, 0);
    progressBar.value =
      total + subTotal ? (completed / (total + subTotal)) * 100 : 0;
    progressText.textContent = `${completed} / ${
      total + subTotal
    } tasks completed`;
  }

  // Search
  searchInput.addEventListener("input", () => {
    const term = searchInput.value.toLowerCase();
    Array.from(todoList.children).forEach((li) => {
      li.style.display = li.textContent.toLowerCase().includes(term)
        ? ""
        : "none";
    });
  });

  // Filter
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;
      Array.from(todoList.children).forEach((li) => {
        const checkbox = li.querySelector("input[type=checkbox]");
        if (filter === "all") li.style.display = "";
        else if (filter === "completed")
          li.style.display = checkbox.checked ? "" : "none";
        else if (filter === "pending")
          li.style.display = checkbox.checked ? "none" : "";
      });
    });
  });

  // Export PDF
  exportPDFBtn.addEventListener("click", () => {
    const doc = new jsPDF();
    let y = 10;
    tasks.forEach((t) => {
      doc.setFontSize(14);
      doc.text(
        `- ${t.text} [${t.priority}] ${
          t.dueDate ? "(Due: " + t.dueDate + ")" : ""
        }`,
        10,
        y
      );
      y += 10;
      t.subtasks.forEach((s) => {
        doc.setFontSize(12);
        doc.text(`   • ${s.text} [${s.completed ? "✔" : "✖"}]`, 10, y);
        y += 10;
      });
    });
    doc.save("tasks.pdf");
  });

  // Export Word
  exportWordBtn.addEventListener("click", () => {
    let content = "<h1>Tasks</h1><ul>";
    tasks.forEach((t) => {
      content += `<li>${t.text} [${t.priority}] ${
        t.dueDate ? "(Due: " + t.dueDate + ")" : ""
      }<ul>`;
      t.subtasks.forEach((s) => {
        content += `<li>${s.text} [${s.completed ? "✔" : "✖"}]</li>`;
      });
      content += "</ul></li>";
    });
    content += "</ul>";
    const blob = new Blob(["\ufeff", content], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tasks.doc";
    a.click();
  });

  // Chatbot
  const chatBox = document.getElementById("chat-box");
  const chatMessages = document.getElementById("chat-messages");
  const chatInput = document.getElementById("chat-input");
  const openChatBtn = document.getElementById("open-chat");
  const closeChatBtn = document.getElementById("close-chat");

  openChatBtn.addEventListener("click", () => (chatBox.style.display = "flex"));
  closeChatBtn.addEventListener(
    "click",
    () => (chatBox.style.display = "none")
  );

  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && chatInput.value.trim() !== "") {
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
    div.style.color = type === "bot" ? "blue" : "black";
    chatMessages.appendChild(div);
  }

  function getBotResponse(msg) {
    msg = msg.toLowerCase();
    if (msg.includes("add"))
      return "Use the input box or press Enter to add a new task. You can also add subtasks!";
    if (msg.includes("edit"))
      return "Click 'Edit' button beside a task to modify it.";
    if (msg.includes("delete")) return "Click 'Delete' to remove a task.";
    if (msg.includes("subtask"))
      return "Type in the 'Add Subtask...' input below a task and press Enter.";
    if (msg.includes("clear"))
      return "Use 'Clear All' button to remove all tasks.";
    if (msg.includes("theme"))
      return "Use the Dark Mode button to switch theme.";
    if (msg.includes("progress") || msg.includes("completed"))
      return `${
        tasks.filter((t) => t.completed).length
      } tasks completed so far.`;
    return `I can guide you: add, edit, delete, subtasks, clear, theme, progress.`;
  }
});
// Responsive adjustments
window.addEventListener("resize", () => {
  const chatBox = document.getElementById("chat-box");
  if (window.innerWidth < 400) {
    chatBox.style.width = "90vw";
    chatBox.style.right = "5vw";
  } else {
    chatBox.style.width = "300px";
    chatBox.style.right = "20px";
  }
});
// Initial adjustment
if (window.innerWidth < 400) {
  const chatBox = document.getElementById("chat-box");
  chatBox.style.width = "90vw";
  chatBox.style.right = "5vw";
}
