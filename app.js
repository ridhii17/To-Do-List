document.addEventListener("DOMContentLoaded", () => {
  const todoInput = document.getElementById("todo-input");
  const addTaskBtn = document.getElementById("add-task-btn");
  const todoList = document.getElementById("todo-list");

  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  tasks.forEach(task => renderTask(task));

  // Add new task
  function addTask() {
    const taskText = todoInput.value.trim();
    if (!taskText) return;

    const newTask = {
      id: Date.now(),
      text: taskText,
      completed: false
    };

    tasks.push(newTask);
    saveTasks();
    renderTask(newTask);
    todoInput.value = "";
  }

  addTaskBtn.addEventListener("click", addTask);

  // Allow Enter key to add task
  todoInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addTask();
  });

  // Render a task
  function renderTask(task) {
    const li = document.createElement("li");

    // Checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      li.classList.toggle("completed", task.completed);
      saveTasks();
    });

    // Task text
    const span = document.createElement("span");
    span.textContent = task.text;

    if (task.completed) li.classList.add("completed");

    // Buttons container
    const btnContainer = document.createElement("div");
    btnContainer.classList.add("task-buttons");

    // Edit button
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
        span.textContent = task.text;
        input.replaceWith(span);
      });

      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") input.blur();
      });
    });

    // Delete button
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.classList.add("delete-btn");
    delBtn.addEventListener("click", () => {
      tasks = tasks.filter(t => t.id !== task.id);
      saveTasks();
      li.remove();
    });

    btnContainer.appendChild(editBtn);
    btnContainer.appendChild(delBtn);

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(btnContainer);
    todoList.appendChild(li);
  }

  // Save tasks to localStorage
  function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
});
