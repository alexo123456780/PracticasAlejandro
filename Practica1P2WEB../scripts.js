document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskList = document.getElementById('task-list');
    const searchTerm = document.getElementById('search-term');

    taskForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const taskName = document.getElementById('task-name').value;
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        const responsible = document.getElementById('responsible').value;

        if (new Date(startDate) > new Date(endDate)) {
            alert('La fecha de inicio no puede ser mayor a la fecha de fin, verifique los datos por favor.');
            return;
        }

        const task = {
            id: Date.now(),
            name: taskName,
            startDate: startDate,
            endDate: endDate,
            responsible: responsible,
            completed: false
        };

        saveTask(task);
        renderTask(task);
        taskForm.reset();
    });

    taskList.addEventListener('click', (event) => {
        if (event.target.classList.contains('delete-task')) {
            const taskId = event.target.parentElement.parentElement.dataset.id;
            deleteTask(taskId);
        } else if (event.target.classList.contains('complete-task')) {
            const taskId = event.target.parentElement.parentElement.dataset.id;
            toggleCompleteTask(taskId);
        } else if (event.target.classList.contains('uncomplete-task')) {
            const taskId = event.target.parentElement.parentElement.dataset.id;
            toggleCompleteTask(taskId);
        }
    });

    searchTerm.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            searchTasks(event.target.value);
        }
    });

    loadTasks().forEach(renderTask);

    function saveTask(task) {
        const tasks = loadTasks();
        tasks.push(task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        return JSON.parse(localStorage.getItem('tasks')) || [];
    }

    function deleteTask(taskId) {
        if (!confirm('¿Está seguro de eliminar esta tarea?')) return;
        let tasks = loadTasks();
        tasks = tasks.filter(task => task.id !== parseInt(taskId));
        localStorage.setItem('tasks', JSON.stringify(tasks));
        document.querySelector(`[data-id='${taskId}']`).remove();
    }

    function toggleCompleteTask(taskId) {
        let tasks = loadTasks();
        const task = tasks.find(task => task.id === parseInt(taskId));
        task.completed = !task.completed;
        localStorage.setItem('tasks', JSON.stringify(tasks));
        const taskElement = document.querySelector(`[data-id='${taskId}']`);
        taskElement.classList.toggle('pending', !task.completed);
        taskElement.classList.toggle('completed', task.completed);
        taskElement.classList.toggle('expired', new Date(task.endDate) < new Date());
        taskElement.querySelector('.complete-task').classList.toggle('d-none', task.completed);
        taskElement.querySelector('.uncomplete-task').classList.toggle('d-none', !task.completed);
        taskElement.querySelector('.delete-task').classList.toggle('d-none', new Date(task.endDate) < new Date());
    }

    function renderTask(task) {
        const taskItem = document.createElement('li');
        taskItem.className = 'list-group-item d-flex justify-content-between align-items-center pending';
        taskItem.dataset.id = task.id;
        taskItem.innerHTML = `
            <div>
                <h5>${task.name}</h5>
                <p class="mb-1">Responsable: ${task.responsible}</p>
                <small>Inicio: ${task.startDate} | Fin: ${task.endDate}</small>
            </div>
            <div>
                <button class="btn btn-success btn-sm complete-task ${task.completed ? 'd-none' : ''}">Marcar como Resuelta</button>
                <button class="btn btn-warning btn-sm uncomplete-task ${!task.completed ? 'd-none' : ''}">Desmarcar</button>
                <button class="btn btn-danger btn-sm delete-task ${new Date(task.endDate) < new Date() ? 'd-none' : ''}">Eliminar</button>
            </div>
        `;

        if (new Date(task.endDate) < new Date()) {
            taskItem.classList.add('expired');
        } else if (task.completed) {
            taskItem.classList.add('completed');
        } else {
            taskItem.classList.add('pending');
        }

        taskList.appendChild(taskItem);
    }

    function searchTasks(term) {
        const tasks = loadTasks();
        const filteredTasks = tasks.filter(task => task.name.toLowerCase().includes(term.toLowerCase()) || task.startDate.toLowerCase().includes(term.toLowerCase()) || task.endDate.toLowerCase().includes(term.toLowerCase()));

        taskList.innerHTML = '';

        if (filteredTasks.length > 0) {
            filteredTasks.forEach(renderTask);
        } else {
            const noResults = document.createElement('li');
            noResults.className = 'list-group-item text-center';
            noResults.textContent = 'No se ha registrado ninguna tarea con ese nombre.';
            taskList.appendChild(noResults);
        }
    }
});