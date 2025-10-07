document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const todoList = document.getElementById('todo-list');
    const tasksCounter = document.getElementById('tasks-counter');
    const clearCompletedBtn = document.getElementById('clear-completed');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const sortSelect = document.getElementById('sort-select');
    const confirmModal = document.getElementById('confirm-modal');
    const cancelDeleteBtn = document.getElementById('cancel-delete');
    const confirmDeleteBtn = document.getElementById('confirm-delete');
    const progressFill = document.getElementById('progress-fill');
    const progressPercent = document.getElementById('progress-percent');
    const xpProgress = document.getElementById('xp-progress');
    const xpText = document.getElementById('xp-text');
    const userLevel = document.getElementById('user-level');
    const streakCount = document.getElementById('streak-count');
    const confettiCanvas = document.getElementById('confetti-canvas');
    const chatbotMessages = document.getElementById('chatbot-messages');
    const chatbotInput = document.getElementById('chatbot-input');
    const sendMessageBtn = document.getElementById('send-message');
    const minimizeChatbotBtn = document.getElementById('minimize-chatbot');
    const chatbotContainer = document.querySelector('.chatbot-container');
    
    // State
    let todos = [];
    let currentFilter = 'all';
    let taskToDelete = null;
    let userStats = {
        xp: 0,
        level: 1,
        xpToNextLevel: 100,
        streak: 0,
        lastCompleted: null
    };
    let chatbotMinimized = false;
    
    // Load data from localStorage
    function loadData() {
        const storedTodos = localStorage.getItem('todos');
        if (storedTodos) {
            todos = JSON.parse(storedTodos);
        }
        
        const storedStats = localStorage.getItem('userStats');
        if (storedStats) {
            userStats = JSON.parse(storedStats);
        }
        
        updateUserStatsDisplay();
    }
    
    // Save data to localStorage
    function saveData() {
        localStorage.setItem('todos', JSON.stringify(todos));
        localStorage.setItem('userStats', JSON.stringify(userStats));
    }
    
    // Update the counter of remaining tasks and progress bar
    function updateTasksCounter() {
        const activeTasks = todos.filter(todo => !todo.completed).length;
        tasksCounter.textContent = `${activeTasks} item${activeTasks !== 1 ? 's' : ''} left`;
        
        // Update progress bar
        const totalTasks = todos.length;
        const completedTasks = todos.filter(todo => todo.completed).length;
        
        if (totalTasks > 0) {
            const progressPercentage = Math.floor((completedTasks / totalTasks) * 100);
            progressFill.style.width = `${progressPercentage}%`;
            progressPercent.textContent = `${progressPercentage}%`;
            
            // Check if all tasks are completed
            if (completedTasks === totalTasks && totalTasks > 0) {
                celebrateCompletion();
            }
        } else {
            progressFill.style.width = '0%';
            progressPercent.textContent = '0%';
        }
    }
    
    // Celebrate completion with confetti
    function celebrateCompletion() {
        confettiCanvas.style.display = 'block';
        const ctx = confettiCanvas.getContext('2d');
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
        
        const pieces = [];
        const colors = ['#f39c12', '#e74c3c', '#3498db', '#2ecc71', '#9b59b6'];
        
        for (let i = 0; i < 200; i++) {
            pieces.push({
                x: Math.random() * confettiCanvas.width,
                y: Math.random() * -confettiCanvas.height,
                size: Math.random() * 10 + 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                speed: Math.random() * 3 + 2
            });
        }
        
        function drawConfetti() {
            ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
            
            pieces.forEach(piece => {
                ctx.save();
                ctx.translate(piece.x, piece.y);
                ctx.rotate(piece.rotation * Math.PI / 180);
                ctx.fillStyle = piece.color;
                ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size);
                ctx.restore();
                
                piece.y += piece.speed;
                piece.rotation += 2;
                
                if (piece.y > confettiCanvas.height) {
                    piece.y = Math.random() * -confettiCanvas.height;
                    piece.x = Math.random() * confettiCanvas.width;
                }
            });
            
            if (confettiCanvas.style.display === 'block') {
                requestAnimationFrame(drawConfetti);
            }
        }
        
        drawConfetti();
        
        // Add chatbot congratulation message
        addBotMessage("🎉 Awesome job! You've completed all your tasks for today!");
        
        // Hide confetti after 3 seconds
        setTimeout(() => {
            confettiCanvas.style.display = 'none';
        }, 3000);
    }
    
    // Create a new todo item element
    function createTodoElement(todo) {
        const template = document.getElementById('task-template');
        const clone = document.importNode(template.content, true);
        
        const li = clone.querySelector('.todo-item');
        li.dataset.id = todo.id;
        
        if (todo.completed) {
            li.classList.add('completed');
        }
        
        const checkbox = clone.querySelector('.todo-checkbox');
        checkbox.checked = todo.completed;
        
        const text = clone.querySelector('.todo-text');
        text.textContent = todo.text;
        
        const date = clone.querySelector('.todo-date');
        date.textContent = formatDate(todo.created);
        
        return clone;
    }
    
    // Format date for display
    function formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit' 
        });
    }
    
    // Sort todos based on selected option
    function sortTodos(todos) {
        const sortValue = sortSelect.value;
        
        if (sortValue === 'newest') {
            return [...todos].sort((a, b) => b.created - a.created);
        } else if (sortValue === 'oldest') {
            return [...todos].sort((a, b) => a.created - b.created);
        } else if (sortValue === 'status') {
            return [...todos].sort((a, b) => {
                if (a.completed === b.completed) return 0;
                return a.completed ? 1 : -1;
            });
        }
        
        return todos;
    }
    
    // Render the todo list based on the current filter and sort
    function renderTodoList() {
        todoList.innerHTML = '';
        
        let filteredTodos = todos;
        
        if (currentFilter === 'pending') {
            filteredTodos = todos.filter(todo => !todo.completed);
        } else if (currentFilter === 'completed') {
            filteredTodos = todos.filter(todo => todo.completed);
        }
        
        // Sort todos
        filteredTodos = sortTodos(filteredTodos);
        
        filteredTodos.forEach(todo => {
            const todoElement = createTodoElement(todo);
            todoList.appendChild(todoElement);
        });
        
        updateTasksCounter();
    }
    
    // Add a new todo
    function addTodo(text) {
        if (text.trim() === '') {
            showValidationMessage();
            return;
        }
        
        const newTodo = {
            id: Date.now().toString(),
            text: text,
            completed: false,
            created: Date.now()
        };
        
        todos.push(newTodo);
        saveData();
        renderTodoList();
        taskInput.value = '';
        
        // Chatbot acknowledgment for todoapp
        addBotMessage(`✅ Task added: "${text}"`);
    }
    
    // Show validation message for empty task
    function showValidationMessage() {
        taskInput.classList.add('invalid');
        taskInput.placeholder = "Task cannot be empty!";
        
        setTimeout(() => {
            taskInput.classList.remove('invalid');
            taskInput.placeholder = "Add a new task...";
        }, 2000);
    }
    
    // Toggle todo completion status
    function toggleTodoComplete(id) {
        todos = todos.map(todo => {
            if (todo.id === id) {
                const newTodo = { ...todo, completed: !todo.completed };
                
                // Award XP for completing a task
                if (newTodo.completed && !todo.completed) {
                    addXP(10);
                    checkStreak();
                }
                
                return newTodo;
            }
            return todo;
        });
        
        saveData();
        renderTodoList();
    }
    
    // Edit a todo app
    function editTodo(id, newText) {
        if (newText.trim() === '') {
            return;
        }
        
        todos = todos.map(todo => {
            if (todo.id === id) {
                return { ...todo, text: newText };
            }
            return todo;
        });
        
        saveData();
        renderTodoList();
    }
    
    // Start editing mode for a todo
    function startEditMode(todoItem) {
        const todoId = todoItem.dataset.id;
        const todoTextEl = todoItem.querySelector('.todo-text');
        const todoText = todoTextEl.textContent;
        
        todoItem.classList.add('edit-mode');
        
        const inputEl = document.createElement('input');
        inputEl.type = 'text';
        inputEl.className = 'edit-input';
        inputEl.value = todoText;
        
        todoTextEl.after(inputEl);
        inputEl.focus();
        
        const finishEditing = () => {
            const newText = inputEl.value;
            todoItem.classList.remove('edit-mode');
            inputEl.remove();
            
            if (newText !== todoText) {
                editTodo(todoId, newText);
            }
        };
        
        inputEl.addEventListener('blur', finishEditing);
        inputEl.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                finishEditing();
            }
        });
    }
    
    // Delete a todo app
    function deleteTodo(id) {
        todos = todos.filter(todo => todo.id !== id);
        saveData();
        renderTodoList();
    }
    
    // Show delete confirmation modal
    function showDeleteConfirmation(id) {
        taskToDelete = id;
        confirmModal.classList.add('active');
    }
    
    // Hide delete confirmation modal
    function hideDeleteConfirmation() {
        confirmModal.classList.remove('active');
        taskToDelete = null;
    }
    
    // Clear all completed todos
    function clearCompleted() {
        todos = todos.filter(todo => !todo.completed);
        saveData();
        renderTodoList();
    }
    
    // Set the current filter
    function setFilter(filter) {
        currentFilter = filter;
        
        // Update active filter button
        filterButtons.forEach(btn => {
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        renderTodoList();
    }
    
    // Add XP to user stats
    function addXP(amount) {
        userStats.xp += amount;
        
        // Check for level up
        if (userStats.xp >= userStats.xpToNextLevel) {
            levelUp();
        }
        
        updateUserStatsDisplay();
        saveData();
    }
    
    // Level up the user
    function levelUp() {
        userStats.level += 1;
        userStats.xp = userStats.xp - userStats.xpToNextLevel;
        userStats.xpToNextLevel = Math.floor(userStats.xpToNextLevel * 1.2);
        
        // Chatbot congratulation
        addBotMessage(`🏆 Congratulations! You've reached level ${userStats.level}!`);
    }
    
    // Update the user stats display (XP, level, streak)
    function updateUserStatsDisplay() {
        userLevel.textContent = userStats.level;
        
        const xpPercent = Math.floor((userStats.xp / userStats.xpToNextLevel) * 100);
        xpProgress.style.width = `${xpPercent}%`;
        xpText.textContent = `${userStats.xp}/${userStats.xpToNextLevel} XP`;
        
        streakCount.textContent = userStats.streak;
    }
    
    // Check and update streak
    function checkStreak() {
        const today = new Date().toDateString();
        
        if (!userStats.lastCompleted) {
            userStats.lastCompleted = today;
            userStats.streak = 1;
        } else if (userStats.lastCompleted !== today) {
            const lastDate = new Date(userStats.lastCompleted);
            const currentDate = new Date(today);
            
            // Calculate the difference in days
            const timeDiff = currentDate.getTime() - lastDate.getTime();
            const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
            
            if (dayDiff === 1) {
                // Consecutive day
                userStats.streak += 1;
                
                // Bonus XP for maintaining streak
                if (userStats.streak % 5 === 0) {
                    addXP(50);
                    addBotMessage(`🔥 ${userStats.streak} day streak! You earned 50 bonus XP!`);
                }
            } else if (dayDiff > 1) {
                // Streak broken
                userStats.streak = 1;
            }
            
            userStats.lastCompleted = today;
        }
        
        updateUserStatsDisplay();
        saveData();
    }
    
    // Chatbot functions
    
    // Add a bot message to the chat
    function addBotMessage(text) {
        const messageEl = document.createElement('div');
        messageEl.className = 'message bot-message';
        messageEl.innerHTML = text;
        
        chatbotMessages.appendChild(messageEl);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
    
    // Add a user message to the chat
    function addUserMessage(text) {
        const messageEl = document.createElement('div');
        messageEl.className = 'message user-message';
        messageEl.textContent = text;
        
        chatbotMessages.appendChild(messageEl);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
    
    // Process user message and respond
    function processChatbotMessage(message) {
        const lowerMessage = message.toLowerCase().trim();
        
        // Add the user message to the chat
        addUserMessage(message);
        
        // Process commands
        if (lowerMessage === 'show my tasks' || lowerMessage === 'list tasks' || lowerMessage === 'what do i have to do' || lowerMessage === 'what\'s on my list') {
            addBotMessage("Let me pull up your to-do list real quick! Here's what you've got:");
            showTasksInChatbot();
        } else if (lowerMessage === 'show completed tasks' || lowerMessage === 'what have i finished' || lowerMessage === 'what did i complete') {
            addBotMessage("Nice job on knocking these out! Here's what you've completed so far:");
            showTasksInChatbot('completed');
        } else if (lowerMessage === 'remind me about pending tasks' || lowerMessage === 'what\'s left' || lowerMessage === 'what do i still need to do') {
            addBotMessage("No worries, we all need reminders sometimes! Here's what's still on your plate:");
            showTasksInChatbot('pending');
        } else if (lowerMessage.startsWith('add a new task:') || lowerMessage.startsWith('add task:') || lowerMessage.startsWith('i need to:') || lowerMessage.startsWith('remind me to:')) {
            const taskText = message.split(':')[1].trim();
            if (taskText) {
                addTodo(taskText);
                const responses = [
                    `✅ Got it! Added "${taskText}" to your list. You're on top of things!`,
                    `✅ "${taskText}" is now on your radar. You're crushing it today!`,
                    `✅ Added "${taskText}" to your to-dos. One step closer to getting organized!`
                ];
                addBotMessage(responses[Math.floor(Math.random() * responses.length)]);
            } else {
                addBotMessage("Hey, what's the task you want me to add? Just say something like 'remind me to: go for a run' or 'I need to: call mom'");
            }
        } else if (lowerMessage === 'help' || lowerMessage === 'commands' || lowerMessage === 'what can you do' || lowerMessage === 'i\'m stuck') {
            showChatbotHelp();
        } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            const greetings = [
                "Hey there! How's your day going? Need help with your tasks?",
                "Hi friend! Ready to be productive today or just checking in?",
                "Hello! Great to see you! What can I help you with today?"
            ];
            addBotMessage(greetings[Math.floor(Math.random() * greetings.length)]);
        } else if (lowerMessage.includes('thank') || lowerMessage.includes('thanks') || lowerMessage.includes('thx')) {
            const thanks = [
                "No problem at all! That's what friends are for! 😊",
                "Anytime! I'm always here to help you stay on track!",
                "You're welcome! Let me know if you need anything else!"
            ];
            addBotMessage(thanks[Math.floor(Math.random() * thanks.length)]);
        } else if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye') || lowerMessage.includes('see you')) {
            const goodbyes = [
                "Catch you later! Don't forget about those tasks! 👋",
                "Talk to you soon! I'll keep an eye on your to-dos while you're gone!",
                "Bye for now! Come back when you need to tackle more tasks!"
            ];
            addBotMessage(goodbyes[Math.floor(Math.random() * goodbyes.length)]);
        } else if (lowerMessage.includes('joke') || lowerMessage.includes('funny')) {
            const jokes = [
                "Why don't scientists trust atoms? Because they make up everything... including excuses for not finishing tasks! 😂",
                "What did one task say to the other task? 'You've been checked off... I'm next!' ✅",
                "I told my to-do list it was stressing me out. It just laughed and said 'You think YOU have a lot on your plate?!' 🍽️"
            ];
            addBotMessage(jokes[Math.floor(Math.random() * jokes.length)]);
        } else if (lowerMessage.includes('motivate') || lowerMessage.includes('motivation') || lowerMessage.includes('inspire')) {
            const motivation = [
                "You've got this! Remember, productivity isn't about doing everything - it's about doing what matters! 💪",
                "Each task you complete is one step closer to your goals. Small progress is still progress! 🌱",
                "The difference between a dream and a goal is a deadline and a to-do list. You're already halfway there! 🚀"
            ];
            addBotMessage(motivation[Math.floor(Math.random() * motivation.length)]);
        } else {
            // General response
            const responses = [
                "I'm all ears! Need help with your tasks or just want to chat? Either way, I'm here for you!",
                "Not sure what you mean, but I'm happy to help with your to-dos! Try asking me 'what's left on my list' or tell me 'I need to: finish that report'",
                "Hey friend! I might have missed what you meant there. I can help you track tasks, offer some motivation, or even tell a joke if you need a break!",
                "Hmm, I'm not quite following. But no worries! You can ask me 'what can you do' and I'll show you all the ways I can help!"
            ];
            
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            addBotMessage(randomResponse);
        }
    }
    
    // Show tasks in chatbot as a table
    function showTasksInChatbot(filter = 'all') {
        let filteredTasks = todos;
        let title = 'All Tasks';
        
        if (filter === 'completed') {
            filteredTasks = todos.filter(todo => todo.completed);
            title = 'Completed Tasks';
        } else if (filter === 'pending') {
            filteredTasks = todos.filter(todo => !todo.completed);
            title = 'Pending Tasks';
        }
        
        if (filteredTasks.length === 0) {
            addBotMessage(`No ${filter} tasks found.`);
            return;
        }
        
        let tableHTML = `<p><strong>${title}</strong></p>
        <table class="chatbot-table">
            <thead>
                <tr>
                    <th>Task</th>
                    <th>Status</th>
                    <th>Created Date</th>
                </tr>
            </thead>
            <tbody>`;
        
        filteredTasks.forEach(task => {
            tableHTML += `
                <tr>
                    <td>${task.text}</td>
                    <td>${task.completed ? '<span class="badge completed">Completed ✅</span>' : '<span class="badge pending">Pending ⏳</span>'}</td>
                    <td>${formatDate(task.created)}</td>
                </tr>`;
        });
        
        tableHTML += `
            </tbody>
        </table>`;
        
        addBotMessage(tableHTML);
    }
    
    // Show chatbot help
    function showChatbotHelp() {
        const helpText = `
        <p><strong>Hey friend! Here's what we can chat about:</strong></p>
        <ul style="padding-left: 20px; list-style-type: disc;">
            <li>Say "What's on my list" or "Show my tasks" to see everything</li>
            <li>Ask "What have I finished?" to celebrate your completed tasks</li>
            <li>Wonder "What's left?" to see what's still pending</li>
            <li>Tell me "I need to: [something]" to add a new task</li>
            <li>Ask for a joke if you need a quick laugh</li>
            <li>Say "motivate me" when you need a boost</li>
        </ul>
        <p>I'm here to make your day more productive and a little more fun! 😊</p>`;
        
        addBotMessage(helpText);
    }
    
    // Toggle chatbot minimized state
    function toggleChatbotMinimize() {
        chatbotMinimized = !chatbotMinimized;
        
        if (chatbotMinimized) {
            chatbotContainer.style.height = '60px';
            chatbotContainer.querySelector('.chatbot-messages').style.display = 'none';
            chatbotContainer.querySelector('.chatbot-input').style.display = 'none';
            minimizeChatbotBtn.innerHTML = '<i class="fas fa-plus"></i>';
        } else {
            chatbotContainer.style.height = '';
            chatbotContainer.querySelector('.chatbot-messages').style.display = '';
            chatbotContainer.querySelector('.chatbot-input').style.display = '';
            minimizeChatbotBtn.innerHTML = '<i class="fas fa-minus"></i>';
        }
    }
    
    // Event Listeners
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addTodo(taskInput.value);
    });
    
    todoList.addEventListener('click', (e) => {
        const todoItem = e.target.closest('.todo-item');
        if (!todoItem) return;
        
        const todoId = todoItem.dataset.id;
        
        // Handle checkbox click
        if (e.target.classList.contains('todo-checkbox')) {
            toggleTodoComplete(todoId);
        }
        
        // Handle edit button click
        if (e.target.classList.contains('fa-edit') || e.target.classList.contains('edit-btn')) {
            startEditMode(todoItem);
        }
        
        // Handle delete button click
        if (e.target.classList.contains('fa-trash-alt') || e.target.classList.contains('delete-btn')) {
            showDeleteConfirmation(todoId);
        }
    });
    
    clearCompletedBtn.addEventListener('click', clearCompleted);
    
    // Filter buttons event listeners
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            setFilter(filter);
        });
    });
    
    // Sort select event listener
    sortSelect.addEventListener('change', renderTodoList);
    
    // Confirmation modal event listeners
    cancelDeleteBtn.addEventListener('click', hideDeleteConfirmation);
    
    confirmDeleteBtn.addEventListener('click', () => {
        if (taskToDelete) {
            deleteTodo(taskToDelete);
            hideDeleteConfirmation();
        }
    });
    
    // Chatbot event listeners
    sendMessageBtn.addEventListener('click', () => {
        const message = chatbotInput.value.trim();
        if (message) {
            processChatbotMessage(message);
            chatbotInput.value = '';
        }
    });
    
    chatbotInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const message = chatbotInput.value.trim();
            if (message) {
                processChatbotMessage(message);
                chatbotInput.value = '';
            }
        }
    });
    
    minimizeChatbotBtn.addEventListener('click', toggleChatbotMinimize);
    
    // Initialize chatbot with welcome message
    function initChatbot() {
        const welcomeMessages = [
            "👋 Hey there friend! How's it going today?",
            "I'm your task buddy! Think of me as that friend who helps you stay on track but also makes it fun!",
            "Got anything on your mind you need to get done? I can help you keep track of it all!"
        ];
        
        // Add a small delay between messages for better UX
        welcomeMessages.forEach((msg, index) => {
            setTimeout(() => {
                addBotMessage(msg);
            }, index * 800);
        });
        
        setTimeout(() => {
            addBotMessage("Just chat with me naturally - tell me what you need to do, ask what's on your list, or even ask for a joke if you need a break! 😊");
        }, welcomeMessages.length * 800);
    }
    
    // Initialize the app
    function init() {
        loadData();
        renderTodoList();
        initChatbot();
        
        // Check if it's a new day for streak purposes
        checkStreak();
    }
    
    init();
});

