
const AuthModule = (() => {
    const getLocalUser = () => {
        const defaultUser = {
            id: "local_admin",
            name: "Admin User",
            email: "admin@nexus.local",
            role: "admin"
        };

        try {
            const savedUser = JSON.parse(localStorage.getItem('user')) || {};
            return { ...defaultUser, ...savedUser, role: 'admin' };
        } catch {
            return defaultUser;
        }
    };

    const updateUserUI = (user) => {
        const initials = user.name
            .split(' ')
            .map((namePart) => namePart[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);

        document.querySelector('#user-name-display').textContent = user.name;
        document.querySelectorAll('.avatar').forEach((avatar) => {
            avatar.textContent = initials;
        });
        document.getElementById('dropdown-user-name').textContent = user.name;
        document.getElementById('dropdown-user-email').textContent = user.email;
    };

    const checkAuth = async () => {
        const appWrapper = document.getElementById("app-wrapper");
        if (appWrapper) appWrapper.style.display = "flex";

        const user = getLocalUser();
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('userRole', 'admin');
        updateUserUI(user);

        await ThemeModule.loadPreferences();

        ChartModule.init();
        ChatBotModule.init();
        CalendarModule.init();

        Promise.all([
            OrdersModule.loadFromBackend(),
            CustomerModule.loadFromBackend(),
            KanbanApp.loadFromBackend(),
            CalendarModule.loadFromBackend()
        ]);
    };

    return { checkAuth };
})();
/**
 * MODULE 1: FLIPKART SERVICE (MOCK + REAL STRUCTURE)
 */
/**
 * MODULE 1: FLIPKART SERVICE (AI-POWERED REALTIME SIMULATION)
 */
const FlipkartModule = (() => {
    let liveInterval = null;
    let isOnline = navigator.onLine;

    // Update UI indicator
    const updateConnectionUI = (online) => {
        const indicator = document.getElementById('connection-status');
        if (indicator) {
            if (online) {
                indicator.className = 'connection-status online';
                indicator.innerHTML = '<i class="ph ph-wifi-high"></i><span>Online</span>';
            } else {
                indicator.className = 'connection-status offline';
                indicator.innerHTML = '<i class="ph ph-wifi-slash"></i><span>Offline</span>';
            }
        }
    };

    // Monitor connection status
    window.addEventListener('online', () => {
        isOnline = true;
        updateConnectionUI(true);
        Toastify({ text: "✓ Connection restored", style: { background: "#10b981" } }).showToast();
    });
    window.addEventListener('offline', () => {
        isOnline = false;
        updateConnectionUI(false);
        Toastify({ text: "⚠ No internet connection", style: { background: "#ef4444" } }).showToast();
    });

    // Initialize on load
    setTimeout(() => {
        updateConnectionUI(isOnline);
        // Test API connection on startup
        testAPIConnection();
    }, 500);

    const testAPIConnection = async () => {
        const indicator = document.getElementById('connection-status');
        if (indicator) {
            indicator.innerHTML = '<i class="ph ph-spinner ph-spin"></i><span>Testing...</span>';
        }

        // Always show as online since we use local data
        setTimeout(() => {
            console.log('✓ System: Ready (Local Mode)');
            updateConnectionUI(true);
            Toastify({
                text: "✓ System Ready - Using Local Data",
                style: { background: "#10b981" }
            }).showToast();
        }, 500);
    };

    const sync = async () => {
        const btn = document.getElementById("btn-sync-flipkart");
        const originalText = btn.innerHTML;
        btn.classList.add("loading");
        btn.innerHTML = `<i class="ph ph-spinner ph-spin"></i> Syncing...`;

        try {
            console.log('Generating new data...');
            const data = await generateRealtimeData();

            if (data && data.newOrders && data.newOrders.length > 0) {
                // Save to backend
                await authFetch(API.ordersBulk, {
                    method: 'POST',
                    body: JSON.stringify({ orders: data.newOrders })
                });

                await authFetch(API.customersBulk, {
                    method: 'POST',
                    body: JSON.stringify({ customers: data.newCustomers })
                });

                // Update UI
                ChartModule.updateSalesData(data.salesData);
                OrdersModule.addOrders(data.newOrders);
                CustomerModule.addFlipkartCustomers(data.newCustomers);

                console.log(`✓ Synced ${data.newOrders.length} orders successfully`);
                Toastify({
                    text: `✓ Synced ${data.newOrders.length} orders to backend`,
                    duration: 3000,
                    gravity: "top",
                    position: "right",
                    style: { background: "#10b981", borderRadius: "8px" },
                }).showToast();
                updateConnectionUI(true);
            }
        } catch (error) {
            console.error("✗ Sync failed:", error.message);
            Toastify({
                text: `✗ Sync Error: ${error.message}`,
                duration: 3000,
                style: { background: "#ef4444" }
            }).showToast();
        } finally {
            btn.classList.remove("loading");
            btn.innerHTML = originalText;
        }
    };

    const generateRealtimeData = async () => {
        // Generate mock data directly 
        const indianNames = [
            'Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Reddy',
            'Vikram Singh', 'Anjali Gupta', 'Rahul Verma', 'Pooja Iyer'
        ];

        const indianProducts = [
            'Samsung Galaxy S23', 'OnePlus 11', 'iPhone 14', 'Realme Narzo',
            'Boat Airdopes', 'Fire-Boltt Smartwatch', 'Noise ColorFit',
            'Puma Running Shoes', 'Adidas Sneakers', 'Nike Air Max',
            'Levi\'s Jeans', 'Allen Solly Shirt', 'Peter England Formal',
            'HP Laptop 15s', 'Dell Inspiron', 'Lenovo IdeaPad'
        ];

        const statuses = ['Shipped', 'Processing', 'Delivered', 'Pending'];

        const newOrders = [];
        const orderCount = 3 + Math.floor(Math.random() * 2);

        for (let i = 0; i < orderCount; i++) {
            const product = indianProducts[Math.floor(Math.random() * indianProducts.length)];
            const price = Math.floor(Math.random() * 50000) + 1000;
            const customer = indianNames[Math.floor(Math.random() * indianNames.length)];
            newOrders.push({
                orderId: `FK-${Date.now()}-${i}`,
                customer: customer,
                product: product,
                price: `₹${price.toLocaleString('en-IN')}`,
                date: new Date().toLocaleDateString('en-IN'),
                status: statuses[Math.floor(Math.random() * statuses.length)],
                source: 'Flipkart'
            });
        }

        const newCustomers = [];
        for (let i = 0; i < 2; i++) {
            const name = indianNames[Math.floor(Math.random() * indianNames.length)];
            newCustomers.push({
                name: name,
                email: name.toLowerCase().replace(' ', '.') + '@example.com',
                status: 'Active',
                joined: new Date().toLocaleDateString('en-IN')
            });
        }

        const salesData = Array.from({ length: 5 }, () =>
            Math.floor(Math.random() * 13000) + 2000
        );

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        return { salesData, newOrders, newCustomers };
    };

    const mockFetchOrders = () => {
        // Fallback (Offline)
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    salesData: [5000, 3000, 4500, 6000, 7500],
                    newCustomers: [{ name: "Amit Kumar", email: "amit@test.com", status: "Active" }],
                    newOrders: [
                        { id: "FK-OFFLINE-1", customer: "Offline User", product: "Backup Item", price: "$100", date: "Today", status: "Pending", source: "Flipkart" }
                    ]
                });
            }, 1000);
        });
    };

    const toggleLiveMode = (btn) => {
        if (liveInterval) {
            clearInterval(liveInterval);
            liveInterval = null;
            btn.classList.remove("active");
            btn.innerHTML = '<i class="ph ph-broadcast"></i> Live Mode';
        } else {
            btn.classList.add("active");
            btn.innerHTML = '<i class="ph ph-stop-circle"></i> Stop Live';
            liveInterval = setInterval(() => {
                const randomSale = Math.floor(Math.random() * 500) + 50;
                updateLiveTicker(randomSale);
            }, 3000);
        }
    };

    const updateLiveTicker = (amount) => {
        const salesEl = document.getElementById("live-sales-value");
        const revenueEl = document.getElementById("live-revenue-value");
        let currentRevenue = parseInt(salesEl.innerText.replace(/[^0-9]/g, "")) || 0;
        let currentSalesCount = parseInt(revenueEl.innerText.replace(/[^0-9]/g, "")) || 0;

        currentRevenue += amount;
        currentSalesCount += 1;

        salesEl.innerText = "$" + currentRevenue.toLocaleString();
        revenueEl.innerText = currentSalesCount.toLocaleString();
        salesEl.style.color = "#10B981";
        setTimeout(() => (salesEl.style.color = ""), 500);
    };

    return { sync, toggleLiveMode, testAPIConnection };
})();

/**
 * MODULE 2: CHART VISUALIZATIONS
 */
const ChartModule = (() => {
    let lineChartInstance = null;
    let revenueChartInstance = null;
    let isInitialized = false;

    const revenueData = {
        labels: ["Electronics", "Clothing", "Home", "Sports", "Beauty"],
        data: [45000, 32000, 28000, 19000, 12000],
        colors: ["#4F46E5", "#10B981", "#F59E0B", "#64748B", "#EF4444"],
    };

    const init = () => {
        if (isInitialized) return;
        const primaryColor = getComputedStyle(document.documentElement)
            .getPropertyValue("--primary")
            .trim();
        const ctxLine = document
            .getElementById("salesLineChart")
            .getContext("2d");
        lineChartInstance = new Chart(ctxLine, {
            type: "line",
            data: {
                labels: [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ],
                datasets: [
                    {
                        label: "Monthly Sales ($)",
                        data: [
                            12000, 15000, 14000, 18000, 22000, 26000, 24000, 29000,
                            32000, 35000, 38000, 42000,
                        ],
                        borderColor: primaryColor,
                        backgroundColor: "rgba(79, 70, 229, 0.1)",
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: "#FFFFFF",
                        pointBorderColor: primaryColor,
                        pointRadius: 4,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: "#E2E8F0" } },
                    x: { grid: { display: false } },
                },
            },
        });
        createRevenueChart("bar");
        isInitialized = true;
    };

    const createRevenueChart = (type) => {
        const ctx = document.getElementById("revenueChart").getContext("2d");
        if (revenueChartInstance) revenueChartInstance.destroy();
        let config = {
            type: type === "scatter" ? "line" : type,
            data: {
                labels: revenueData.labels,
                datasets: [
                    {
                        label: "Revenue ($)",
                        data: revenueData.data,
                        backgroundColor: revenueData.colors,
                        borderColor: revenueData.colors,
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: ["pie", "doughnut", "polarArea"].includes(type),
                        position: "right",
                    },
                },
            },
        };
        revenueChartInstance = new Chart(ctx, config);
    };

    const updateColors = (primary, primaryLight) => {
        if (lineChartInstance) {
            lineChartInstance.data.datasets[0].borderColor = primary;
            lineChartInstance.data.datasets[0].pointBorderColor = primary;
            lineChartInstance.data.datasets[0].backgroundColor = primaryLight;
            lineChartInstance.update();
        }
    };

    const updateSalesData = (additionalSales) => {
        if (lineChartInstance) {
            const currentData = lineChartInstance.data.datasets[0].data;
            for (let i = 0; i < additionalSales.length; i++) {
                const index = currentData.length - 1 - i;
                if (index >= 0) currentData[index] += additionalSales[i];
            }
            lineChartInstance.update();
        }
    };

    return {
        init,
        updateColors,
        updateSalesData,
        changeRevenueChartType: createRevenueChart,
    };
})();

/**
 * MODULE 3: KANBAN BOARD LOGIC
 */
const KanbanApp = (() => {
    let tasks = [];

    const loadFromBackend = async () => {
        try {
            const response = await authFetch(API.tasks);
            if (response.ok) {
                tasks = await response.json();
                renderTasks();
            }
        } catch (error) {
            console.error('Failed to load tasks:', error);
        }
    };

    const renderTasks = () => {
        // Clear all columns
        ['todo', 'progress', 'done'].forEach(status => {
            const col = document.getElementById(status);
            if (col) {
                const existing = col.querySelectorAll('.kanban-card');
                existing.forEach(card => card.remove());
            }
        });

        // Render tasks
        tasks.forEach(task => {
            const col = document.getElementById(task.status);
            if (col) {
                const card = createTaskCard(task);
                col.appendChild(card);
            }
        });
        updateTaskCounts();
    };

    const createTaskCard = (task) => {
        const card = document.createElement('div');
        card.className = 'kanban-card';
        card.draggable = true;
        card.id = task.taskId;
        card.setAttribute('data-db-id', task._id);
        card.setAttribute('ondragstart', 'KanbanApp.drag(event)');
        card.innerHTML = `
                    <div class="card-header-row">
                        <span class="task-tag tag-${task.tag}">${task.tag}</span>
                        <div class="card-actions">
                            <button class="btn-action-sm" onclick="KanbanApp.openEditModal('${task.taskId}')"><i class="ph ph-pencil-simple"></i></button>
                            <button class="btn-action-sm delete" onclick="KanbanApp.deleteTask('${task.taskId}')"><i class="ph ph-trash"></i></button>
                        </div>
                    </div>
                    <h4 class="task-title">${task.title}</h4>
                    <div class="task-footer">
                        <span><i class="ph ph-clock"></i> ${new Date(task.createdAt).toLocaleDateString()}</span>
                    </div>
                `;
        return card;
    };

    const allowDrop = (ev) => ev.preventDefault();
    const drag = (ev) => {
        ev.target.classList.add("dragging");
        ev.dataTransfer.setData("text", ev.target.id);
    };
    const drop = async (ev) => {
        ev.preventDefault();
        const data = ev.dataTransfer.getData("text");
        const draggedElement = document.getElementById(data);
        if (draggedElement) {
            draggedElement.classList.remove("dragging");
            let targetColumn = ev.target;
            while (
                targetColumn &&
                !targetColumn.classList.contains("kanban-column")
            ) {
                targetColumn = targetColumn.parentElement;
            }
            if (targetColumn) {
                const newStatus = targetColumn.id;
                targetColumn.appendChild(draggedElement);
                updateTaskCounts();

                // Update in backend
                const dbId = draggedElement.getAttribute('data-db-id');
                if (dbId) {
                    try {
                        await authFetch(`${API.tasks}/${dbId}`, {
                            method: 'PUT',
                            body: JSON.stringify({ status: newStatus })
                        });
                    } catch (error) {
                        console.error('Failed to update task:', error);
                    }
                }
            }
        }
    };
    const updateTaskCounts = () => {
        document.querySelectorAll(".kanban-column").forEach((col) => {
            const count = col.querySelectorAll(".kanban-card").length;
            const badge = col.querySelector(".task-count");
            if (badge) badge.innerText = count;
        });
    };
    const addTask = async () => {
        const newTask = {
            taskId: 'task-' + Date.now(),
            title: 'New Item Created',
            status: 'todo',
            tag: 'marketing'
        };

        try {
            const response = await authFetch(API.tasks, {
                method: 'POST',
                body: JSON.stringify(newTask)
            });

            if (response.ok) {
                const savedTask = await response.json();
                tasks.push(savedTask);
                const todoCol = document.getElementById("todo");
                const card = createTaskCard(savedTask);
                todoCol.appendChild(card);
                updateTaskCounts();
            }
        } catch (error) {
            console.error('Failed to add task:', error);
        }
    };
    const deleteTask = async (id) => {
        if (confirm("Delete this task?")) {
            const el = document.getElementById(id);
            if (el) {
                const dbId = el.getAttribute('data-db-id');
                if (dbId) {
                    try {
                        await authFetch(`${API.tasks}/${dbId}`, {
                            method: 'DELETE'
                        });
                    } catch (error) {
                        console.error('Failed to delete task:', error);
                    }
                }
                el.remove();
                updateTaskCounts();
            }
        }
    };
    const openEditModal = (id) => {
        const el = document.getElementById(id);
        if (!el) return;
        const title = el.querySelector(".task-title").innerText;
        document.getElementById("editTaskId").value = id;
        document.getElementById("editTaskTitle").value = title;
        document.getElementById("editModalOverlay").style.display = "flex";
    };
    const closeEditModal = () => {
        document.getElementById("editModalOverlay").style.display = "none";
    };
    const saveEdit = () => {
        const id = document.getElementById("editTaskId").value;
        const newTitle = document.getElementById("editTaskTitle").value;
        const el = document.getElementById(id);
        if (el) el.querySelector(".task-title").innerText = newTitle;
        closeEditModal();
    };
    return {
        allowDrop,
        drag,
        drop,
        addTask,
        deleteTask,
        openEditModal,
        closeEditModal,
        saveEdit,
        loadFromBackend,
    };
})();

/**
 * MODULE: CALENDAR MODULE
 */
const CalendarModule = (() => {
    let currentDate = new Date();
    let events = [];
    let selectedColor = '#4f46e5';
    const storageKey = 'nexus_calendar_events';

    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    const normalizeEvent = (event) => ({
        ...event,
        eventId: event.eventId || event._id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        color: event.color || '#4f46e5',
        description: event.description || ''
    });

    const saveLocalEvents = () => {
        localStorage.setItem(storageKey, JSON.stringify(events));
    };

    const loadLocalEvents = () => {
        try {
            events = (JSON.parse(localStorage.getItem(storageKey)) || []).map(normalizeEvent);
        } catch {
            events = [];
        }
    };

    const loadFromBackend = async () => {
        try {
            const response = await authFetch(API.events);
            if (response.ok) {
                events = (await response.json()).map(normalizeEvent);
                saveLocalEvents();
                render();
            }
        } catch (error) {
            console.error('Failed to load events:', error);
            render();
        }
    };

    const init = () => {
        loadLocalEvents();
        render();
        loadFromBackend();
    };

    const render = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        document.getElementById("cal-month-year").innerText =
            `${monthNames[month]} ${year}`;

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();

        const grid = document.getElementById("calendar-days");
        grid.innerHTML = "";

        // Add empty boxes for previous month days
        for (let i = 0; i < firstDay; i++) {
            const div = document.createElement("div");
            div.className = "calendar-day empty";
            grid.appendChild(div);
        }

        // Add current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const div = document.createElement("div");
            div.className = "calendar-day";

            const dayNumber = document.createElement("div");
            dayNumber.className = "day-number";
            dayNumber.innerText = day;
            div.appendChild(dayNumber);

            // Re-use day styling, but remove onclick from module 0

            const currentFullDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            if (
                day === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear()
            ) {
                div.classList.add("today");
            }

            // Render Events for this day
            const dayEvents = events.filter(e => e.date === currentFullDate);
            dayEvents.forEach(event => {
                const eventEl = document.createElement("div");
                eventEl.className = "calendar-event";
                eventEl.innerText = event.title;
                eventEl.style.backgroundColor = event.color;
                eventEl.title = event.description || event.title;
                eventEl.onclick = (e) => {
                    e.stopPropagation();
                    openModal(currentFullDate, event);
                };
                div.appendChild(eventEl);
            });

            // Click on day to add event
            div.onclick = () => {
                openModal(currentFullDate);
            };

            grid.appendChild(div);
        }
    };

    const openModal = (dateStr, event = null) => {
        const modal = document.getElementById("calendarEventModalOverlay");
        const titleInput = document.getElementById("eventTitle");
        const dateInput = document.getElementById("eventDate");
        const descInput = document.getElementById("eventDescription");
        const idInput = document.getElementById("eventId");
        const deleteBtn = document.getElementById("btnDeleteEvent");
        const modalTitle = document.getElementById("eventModalTitle");

        modal.style.display = 'flex';

        // Reset colors
        document.querySelectorAll('.event-color-option').forEach(el => el.classList.remove('selected'));

        if (event) {
            modalTitle.innerText = "Edit Event";
            idInput.value = event.eventId;
            titleInput.value = event.title;
            dateInput.value = event.date;
            descInput.value = event.description || '';
            selectedColor = event.color;
            deleteBtn.style.display = 'block';

            // Set color selection
            document.querySelectorAll('.event-color-option').forEach(el => {
                el.classList.remove('selected');
                if (el.getAttribute('onclick').includes(event.color)) {
                    el.classList.add('selected');
                }
            });
        } else {
            // ADD
            modalTitle.innerText = "Add Event";
            idInput.value = '';
            titleInput.value = '';
            dateInput.value = dateStr;
            descInput.value = '';
            deleteBtn.style.display = 'none';
            selectedColor = '#4f46e5';
            const defaultColorDot = document.querySelector('.event-color-option[style*="#4f46e5"]');
            if (defaultColorDot) defaultColorDot.classList.add('selected');
        }
    };

    const closeModal = () => {
        document.getElementById("calendarEventModalOverlay").style.display = 'none';
    };

    const selectColor = (el, color) => {
        document.querySelectorAll('.event-color-option').forEach(d => d.classList.remove('selected'));
        el.classList.add('selected');
        selectedColor = color;
    };

    const saveEvent = async () => {
        const id = document.getElementById("eventId").value;
        const title = document.getElementById("eventTitle").value;
        const date = document.getElementById("eventDate").value;
        const description = document.getElementById("eventDescription").value;

        if (!title || !date) {
            Toastify({ text: "Please fill in title and date", style: { background: "#ef4444" } }).showToast();
            return;
        }

        try {
            if (id) {
                // Edit existing event
                const event = events.find(e => e.eventId === id);
                if (event) {
                    const index = events.findIndex(e => e.eventId === id);
                    let updated = { ...event, title, date, description, color: selectedColor };

                    if (event._id) {
                        try {
                            const response = await authFetch(`${API.events}/${event._id}`, {
                                method: 'PUT',
                                body: JSON.stringify({ title, date, description, color: selectedColor })
                            });
                            if (response.ok) {
                                updated = normalizeEvent(await response.json());
                            }
                        } catch (error) {
                            console.warn('Updating calendar event locally:', error);
                        }
                    }

                    events[index] = updated;
                    saveLocalEvents();
                    Toastify({ text: "Event Updated", style: { background: "#10b981" } }).showToast();
                }
            } else {
                // Add new event
                let newEvent = {
                    eventId: Date.now().toString(),
                    title,
                    date,
                    description,
                    color: selectedColor
                };

                try {
                    const response = await authFetch(API.events, {
                        method: 'POST',
                        body: JSON.stringify(newEvent)
                    });
                    if (response.ok) {
                        newEvent = normalizeEvent(await response.json());
                    }
                } catch (error) {
                    console.warn('Saving calendar event locally:', error);
                }

                events.push(newEvent);
                saveLocalEvents();
                Toastify({ text: "Event Added", style: { background: "#10b981" } }).showToast();
            }
        } catch (error) {
            console.error('Failed to save event:', error);
            Toastify({ text: "Failed to save event", style: { background: "#ef4444" } }).showToast();
        }

        closeModal();
        render();
    };

    const deleteEvent = async () => {
        const id = document.getElementById("eventId").value;
        if (confirm("Are you sure you want to delete this event?")) {
            try {
                const event = events.find(e => e.eventId === id);
                if (event) {
                    if (event._id) {
                        try {
                            await authFetch(`${API.events}/${event._id}`, {
                                method: 'DELETE'
                            });
                        } catch (error) {
                            console.warn('Deleting calendar event locally:', error);
                        }
                    }
                    events = events.filter(e => e.eventId !== id);
                    saveLocalEvents();
                    Toastify({ text: "Event Deleted", style: { background: "#10b981" } }).showToast();
                }
            } catch (error) {
                console.error('Failed to delete event:', error);
            }
            closeModal();
            render();
        }
    };

    const nextMonth = () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        render();
    };

    const prevMonth = () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        render();
    };

    const today = () => {
        currentDate = new Date();
        render();
    };

    return { init, nextMonth, prevMonth, today, closeModal, selectColor, saveEvent, deleteEvent, loadFromBackend };
})();

/**
 * MODULE 4: CUSTOMER MANAGEMENT
 */
const CustomerModule = (() => {
    let customers = [];

    const loadFromBackend = async () => {
        try {
            const response = await authFetch(API.customers);
            if (response.ok) {
                customers = await response.json();
                render();
                DashboardInsightsModule.refresh();
            }
        } catch (error) {
            console.error('Failed to load customers:', error);
        }
    };

    const render = () => {
        const tbody = document.getElementById("customers-table-body");
        tbody.innerHTML = customers
            .map(
                (c) => `
            <tr class="table-row">
              <td><div style="display: flex; align-items: center; gap: 12px;"><div class="avatar" style="width:32px; height:32px; font-size:12px">${c.name.charAt(0)}</div>${c.name}</div></td>
              <td style="color:var(--text-muted)">${c.email}</td>
              <td><span class="status-badge ${c.status === "Active" ? "status-active" : "status-inactive"}">${c.status}</span></td>
              <td style="color:var(--text-muted)">${c.joined}</td>
              <td><div class="card-actions" style="justify-content:flex-end"><button class="btn-action-sm" onclick="CustomerModule.editCustomer('${c.id}')"><i class="ph ph-pencil-simple"></i></button></div></td>
            </tr>
          `,
            )
            .join("");
    };
    const openModal = () =>
    (document.getElementById("customerModalOverlay").style.display =
        "flex");
    const closeModal = () =>
    (document.getElementById("customerModalOverlay").style.display =
        "none");
    const saveCustomer = () => {
        closeModal();
        render();
    };
    return {
        init: render,
        render,
        loadFromBackend,
        openModal,
        closeModal,
        saveCustomer,
        getCustomers: () => customers,
        addFlipkartCustomers: (newList) => {
            customers = [...newList, ...customers];
            render();
            DashboardInsightsModule.refresh();
        },
    };
})();

/**
 * MODULE 5: ORDERS MODULE
 */
const OrdersModule = (() => {
    let orders = [];

    const loadFromBackend = async () => {
        try {
            const response = await authFetch(API.orders);
            if (response.ok) {
                orders = await response.json();
                render();
                DashboardInsightsModule.refresh();
            }
        } catch (error) {
            console.error('Failed to load orders:', error);
        }
    };

    const render = () => {
        const tbody = document.getElementById("orders-table-body");
        if (!tbody) return;

        const userRole = localStorage.getItem('userRole') || 'user';

        if (userRole === 'user') {
            // User view: Simple order tracking
            tbody.innerHTML = orders
                .map((o) => `
                <tr class="table-row">
                  <td>
                    <div style="font-weight: 600; color: var(--primary);">${o.product}</div>
                    <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
                      Order ID: ${o.orderId}
                    </div>
                  </td>
                  <td>
                    <div style="font-weight: 600; color: #10b981;">${o.price}</div>
                    <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
                      ${o.date}
                    </div>
                  </td>
                  <td>
                    <span class="status-badge ${o.status === 'Delivered' ? 'status-delivered' : o.status === 'Shipped' ? 'status-shipped' : o.status === 'Processing' ? 'status-processing' : 'status-pending'}">
                      ${o.status}
                    </span>
                  </td>
                  <td>
                    <button class="btn-action-sm" onclick="OrdersModule.viewUserOrderTracking('${o._id || o.orderId}')" title="Track Order">
                      <i class="ph ph-map-pin"></i>
                    </button>
                  </td>
                </tr>
              `)
                .join("");
        } else {
            // Admin view: Full details
            tbody.innerHTML = orders
                .map((o) => `
                <tr class="table-row">
                  <td>
                    <div style="font-weight: 600; color: var(--primary);">${o.orderId}</div>
                    <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
                      <i class="ph ph-user" style="font-size: 10px;"></i> ${o.userName || 'N/A'}
                    </div>
                  </td>
                  <td>
                    <div style="font-weight: 500;">${o.customer}</div>
                    <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
                      <i class="ph ph-envelope" style="font-size: 10px;"></i> ${o.userEmail || 'N/A'}
                    </div>
                  </td>
                  <td>
                    <div style="font-weight: 500;">${o.product}</div>
                    <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
                      <i class="ph ph-tag" style="font-size: 10px;"></i> ${o.source || 'Flipkart'}
                    </div>
                  </td>
                  <td>
                    <div style="font-weight: 600; color: #10b981;">${o.price}</div>
                    <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
                      <i class="ph ph-calendar" style="font-size: 10px;"></i> ${o.date}
                    </div>
                  </td>
                  <td>
                    <span class="status-badge ${o.status === 'Delivered' ? 'status-delivered' : o.status === 'Shipped' ? 'status-shipped' : o.status === 'Processing' ? 'status-processing' : 'status-pending'}">
                      ${o.status}
                    </span>
                  </td>
                  <td>
                    <button class="btn-action-sm" onclick="OrdersModule.viewDetails('${o._id || o.orderId}')" title="View Details">
                      <i class="ph ph-eye"></i>
                    </button>
                  </td>
                </tr>
              `)
                .join("");
        }
    };

    const viewDetails = (orderId) => {
        const order = orders.find(o => o._id === orderId || o.orderId === orderId);
        if (!order) return;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.display = 'flex';
        modal.innerHTML = `
                    <div class="modal-content" style="max-width: 600px;">
                        <div class="modal-header">
                            <h3>Order Details</h3>
                            <button onclick="this.closest('.modal-overlay').remove()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: var(--text-muted);">&times;</button>
                        </div>
                        <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
                            <div style="display: grid; gap: 20px;">
                                <!-- Order Info -->
                                <div style="background: var(--bg-body); padding: 16px; border-radius: 8px;">
                                    <h4 style="margin: 0 0 12px 0; color: var(--primary); font-size: 14px; text-transform: uppercase;">Order Information</h4>
                                    <div style="display: grid; gap: 8px;">
                                        <div style="display: flex; justify-content: space-between;">
                                            <span style="color: var(--text-muted); font-size: 13px;">Order ID:</span>
                                            <span style="font-weight: 600; font-size: 13px;">${order.orderId}</span>
                                        </div>
                                        <div style="display: flex; justify-content: space-between;">
                                            <span style="color: var(--text-muted); font-size: 13px;">Date:</span>
                                            <span style="font-weight: 500; font-size: 13px;">${order.date}</span>
                                        </div>
                                        <div style="display: flex; justify-content: space-between;">
                                            <span style="color: var(--text-muted); font-size: 13px;">Status:</span>
                                            <span class="status-badge ${order.status === 'Delivered' ? 'status-delivered' : order.status === 'Shipped' ? 'status-shipped' : order.status === 'Processing' ? 'status-processing' : 'status-pending'}">${order.status}</span>
                                        </div>
                                        <div style="display: flex; justify-content: space-between;">
                                            <span style="color: var(--text-muted); font-size: 13px;">Source:</span>
                                            <span style="font-weight: 500; font-size: 13px;">${order.source || 'Flipkart'}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- User Info -->
                                <div style="background: var(--bg-body); padding: 16px; border-radius: 8px;">
                                    <h4 style="margin: 0 0 12px 0; color: var(--primary); font-size: 14px; text-transform: uppercase;">User Information</h4>
                                    <div style="display: grid; gap: 8px;">
                                        <div style="display: flex; justify-content: space-between;">
                                            <span style="color: var(--text-muted); font-size: 13px;">User ID:</span>
                                            <span style="font-weight: 500; font-size: 11px; font-family: monospace;">${order.userId || 'N/A'}</span>
                                        </div>
                                        <div style="display: flex; justify-content: space-between;">
                                            <span style="color: var(--text-muted); font-size: 13px;">Name:</span>
                                            <span style="font-weight: 600; font-size: 13px;">${order.userName || 'N/A'}</span>
                                        </div>
                                        <div style="display: flex; justify-content: space-between;">
                                            <span style="color: var(--text-muted); font-size: 13px;">Email:</span>
                                            <span style="font-weight: 500; font-size: 13px;">${order.userEmail || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Product Info -->
                                <div style="background: var(--bg-body); padding: 16px; border-radius: 8px;">
                                    <h4 style="margin: 0 0 12px 0; color: var(--primary); font-size: 14px; text-transform: uppercase;">Product Details</h4>
                                    <div style="display: grid; gap: 8px;">
                                        <div style="display: flex; justify-content: space-between;">
                                            <span style="color: var(--text-muted); font-size: 13px;">Product:</span>
                                            <span style="font-weight: 600; font-size: 13px;">${order.product}</span>
                                        </div>
                                        <div style="display: flex; justify-content: space-between;">
                                            <span style="color: var(--text-muted); font-size: 13px;">Price:</span>
                                            <span style="font-weight: 700; font-size: 16px; color: #10b981;">${order.price}</span>
                                        </div>
                                        <div style="display: flex; justify-content: space-between;">
                                            <span style="color: var(--text-muted); font-size: 13px;">Customer:</span>
                                            <span style="font-weight: 500; font-size: 13px;">${order.customer}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Timestamps -->
                                ${order.createdAt ? `
                                <div style="background: var(--bg-body); padding: 16px; border-radius: 8px;">
                                    <h4 style="margin: 0 0 12px 0; color: var(--primary); font-size: 14px; text-transform: uppercase;">Timestamps</h4>
                                    <div style="display: grid; gap: 8px;">
                                        <div style="display: flex; justify-content: space-between;">
                                            <span style="color: var(--text-muted); font-size: 13px;">Created:</span>
                                            <span style="font-weight: 500; font-size: 12px;">${new Date(order.createdAt).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                        <div class="modal-footer" style="justify-content: flex-end;">
                            <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Close</button>
                        </div>
                    </div>
                `;
        document.body.appendChild(modal);
    };

    const viewUserOrderTracking = (orderId) => {
        const order = orders.find(o => o._id === orderId || o.orderId === orderId);
        if (!order) return;

        const statusMap = {
            'Pending': 1,
            'Processing': 2,
            'Shipped': 3,
            'Delivered': 4
        };

        const currentStage = statusMap[order.status] || 1;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.display = 'flex';
        modal.innerHTML = `
                    <div class="modal-content" style="max-width: 700px;">
                        <div class="modal-header">
                            <h3>Track Your Order</h3>
                            <button onclick="this.closest('.modal-overlay').remove()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: var(--text-muted);">&times;</button>
                        </div>
                        <div class="modal-body" style="padding: 30px;">
                            <div style="background: var(--bg-body); padding: 20px; border-radius: 12px; margin-bottom: 30px;">
                                <h4 style="margin: 0 0 12px 0; font-size: 18px;">${order.product}</h4>
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div>
                                        <div style="font-size: 13px; color: var(--text-muted);">Order ID: ${order.orderId}</div>
                                        <div style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">Placed on: ${order.date}</div>
                                    </div>
                                    <div style="font-size: 24px; font-weight: 700; color: #10b981;">${order.price}</div>
                                </div>
                            </div>
                            
                            <div style="position: relative; padding-left: 40px;">
                                <div style="position: absolute; left: 15px; top: 0; bottom: 0; width: 3px; background: #e5e7eb;"></div>
                                <div style="position: absolute; left: 15px; top: 0; width: 3px; height: ${currentStage * 25}%; background: var(--primary); transition: height 0.5s;"></div>
                                
                                <div style="position: relative; margin-bottom: 40px;">
                                    <div style="position: absolute; left: -33px; width: 24px; height: 24px; border-radius: 50%; background: ${currentStage >= 1 ? 'var(--primary)' : '#e5e7eb'}; display: flex; align-items: center; justify-content: center;">
                                        <i class="ph ph-check" style="color: white; font-size: 14px; font-weight: bold;"></i>
                                    </div>
                                    <div>
                                        <h4 style="margin: 0; font-size: 16px;">Order Placed</h4>
                                        <p style="margin: 4px 0 0 0; font-size: 13px; color: var(--text-muted);">Your order has been confirmed</p>
                                    </div>
                                </div>
                                
                                <div style="position: relative; margin-bottom: 40px;">
                                    <div style="position: absolute; left: -33px; width: 24px; height: 24px; border-radius: 50%; background: ${currentStage >= 2 ? 'var(--primary)' : '#e5e7eb'}; display: flex; align-items: center; justify-content: center;">
                                        <i class="ph ph-check" style="color: white; font-size: 14px;"></i>
                                    </div>
                                    <div>
                                        <h4 style="margin: 0; font-size: 16px;">Processing</h4>
                                        <p style="margin: 4px 0 0 0; font-size: 13px; color: var(--text-muted);">Order is being prepared</p>
                                    </div>
                                </div>
                                
                                <div style="position: relative; margin-bottom: 40px;">
                                    <div style="position: absolute; left: -33px; width: 24px; height: 24px; border-radius: 50%; background: ${currentStage >= 3 ? 'var(--primary)' : '#e5e7eb'}; display: flex; align-items: center; justify-content: center;">
                                        <i class="ph ph-check" style="color: white; font-size: 14px;"></i>
                                    </div>
                                    <div>
                                        <h4 style="margin: 0; font-size: 16px;">Shipped</h4>
                                        <p style="margin: 4px 0 0 0; font-size: 13px; color: var(--text-muted);">Package is on the way</p>
                                    </div>
                                </div>
                                
                                <div style="position: relative;">
                                    <div style="position: absolute; left: -33px; width: 24px; height: 24px; border-radius: 50%; background: ${currentStage >= 4 ? '#10b981' : '#e5e7eb'}; display: flex; align-items: center; justify-content: center;">
                                        <i class="ph ph-check" style="color: white; font-size: 14px;"></i>
                                    </div>
                                    <div>
                                        <h4 style="margin: 0; font-size: 16px; color: ${currentStage >= 4 ? '#10b981' : 'inherit'}">Delivered</h4>
                                        <p style="margin: 4px 0 0 0; font-size: 13px; color: var(--text-muted);">Order has been delivered</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Close</button>
                        </div>
                    </div>
                `;
        document.body.appendChild(modal);
    };

    return {
        init: render,
        loadFromBackend,
        getOrders: () => orders,
        addOrders: (newList) => {
            orders = [...newList, ...orders];
            render();
            DashboardInsightsModule.refresh();
            updateGoalProgress();
        },
        viewDetails,
        viewUserOrderTracking
    };
})();

/**
 * MODULE 5A: DASHBOARD INSIGHTS
 */
const DashboardInsightsModule = (() => {
    const monthlyGoal = 500000;
    const statusOrder = [
        { key: 'Pending', label: 'Pending', color: '#f59e0b' },
        { key: 'Processing', label: 'Processing', color: '#4f46e5' },
        { key: 'Shipped', label: 'Shipped', color: '#0ea5e9' },
        { key: 'Delivered', label: 'Delivered', color: '#10b981' }
    ];

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount || 0);

    const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    })[char]);

    const parseAmount = (value) => {
        const cleaned = String(value ?? '').replace(/,/g, '').replace(/[^0-9.]/g, '');
        return Number.parseFloat(cleaned) || 0;
    };

    const parseOrderDate = (value) => {
        if (!value) return null;
        const text = String(value).trim();
        if (text.toLowerCase() === 'today') return new Date();

        const parts = text.match(/^(\d{1,4})[/-](\d{1,2})[/-](\d{1,4})$/);
        if (parts) {
            const first = Number(parts[1]);
            const second = Number(parts[2]);
            const third = Number(parts[3]);
            const year = parts[1].length === 4 ? first : third < 100 ? 2000 + third : third;
            const month = parts[1].length === 4 ? second - 1 : second - 1;
            const day = parts[1].length === 4 ? third : first;
            const parsed = new Date(year, month, day);
            return Number.isNaN(parsed.getTime()) ? null : parsed;
        }

        const parsed = new Date(text);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    };

    const isSameDay = (a, b) =>
        a &&
        b &&
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();

    const getStats = () => {
        const orders = OrdersModule.getOrders() || [];
        const customers = CustomerModule.getCustomers() || [];
        const today = new Date();
        const statusCounts = statusOrder.reduce((acc, item) => ({ ...acc, [item.key]: 0 }), {});
        const productMap = new Map();
        let totalRevenue = 0;
        let todayRevenue = 0;
        let todayOrders = 0;

        orders.forEach((order) => {
            const amount = parseAmount(order.price);
            const status = order.status || 'Pending';
            const productName = order.product || 'Unknown product';
            const orderDate = parseOrderDate(order.date);

            totalRevenue += amount;
            statusCounts[status] = (statusCounts[status] || 0) + 1;

            if (isSameDay(orderDate, today)) {
                todayRevenue += amount;
                todayOrders += 1;
            }

            const currentProduct = productMap.get(productName) || {
                name: productName,
                count: 0,
                revenue: 0
            };
            currentProduct.count += 1;
            currentProduct.revenue += amount;
            productMap.set(productName, currentProduct);
        });

        const deliveredOrders = statusCounts.Delivered || 0;
        const openOrders =
            (statusCounts.Pending || 0) +
            (statusCounts.Processing || 0) +
            (statusCounts.Shipped || 0);
        const activeCustomers = customers.filter((customer) => customer.status === 'Active').length;
        const averageOrderValue = orders.length ? Math.round(totalRevenue / orders.length) : 0;
        const forecastRevenue = totalRevenue + averageOrderValue * Math.max(openOrders, 1);
        const deliveryRate = orders.length ? Math.round((deliveredOrders / orders.length) * 100) : 0;
        const goalPercent = Math.min(Math.round((totalRevenue / monthlyGoal) * 100), 100);
        const topProducts = Array.from(productMap.values())
            .sort((a, b) => b.revenue - a.revenue || b.count - a.count)
            .slice(0, 5);

        return {
            orders,
            customers,
            statusCounts,
            topProducts,
            totalRevenue,
            todayRevenue,
            todayOrders,
            deliveredOrders,
            openOrders,
            activeCustomers,
            averageOrderValue,
            forecastRevenue,
            deliveryRate,
            goalPercent
        };
    };

    const updateMainStats = (stats) => {
        const revenueEl = document.getElementById('stat-revenue');
        const salesEl = document.getElementById('stat-sales');
        const customersEl = document.getElementById('stat-customers');
        const goalFill = document.getElementById('goal-fill');
        const goalPct = document.getElementById('goal-pct');

        if (revenueEl) revenueEl.textContent = formatCurrency(stats.totalRevenue);
        if (salesEl) salesEl.textContent = stats.orders.length.toLocaleString('en-IN');
        if (customersEl) customersEl.textContent = stats.customers.length.toLocaleString('en-IN');
        if (goalFill) goalFill.style.width = `${stats.goalPercent}%`;
        if (goalPct) goalPct.textContent = `${stats.goalPercent}%`;
    };

    const renderSummaryCards = (stats) => {
        const container = document.getElementById('insight-summary-grid');
        if (!container) return;

        const cards = [
            {
                icon: 'ph-currency-inr',
                label: "Today's Revenue",
                value: formatCurrency(stats.todayRevenue),
                trend: stats.todayOrders ? `${stats.todayOrders} orders today` : 'No orders recorded today',
                trendClass: stats.todayOrders ? '' : 'warning'
            },
            {
                icon: 'ph-truck',
                label: 'Delivery Rate',
                value: `${stats.deliveryRate}%`,
                trend: `${stats.deliveredOrders} delivered of ${stats.orders.length || 0}`,
                trendClass: stats.deliveryRate >= 60 || !stats.orders.length ? '' : 'warning'
            },
            {
                icon: 'ph-clock-countdown',
                label: 'Open Orders',
                value: stats.openOrders.toLocaleString('en-IN'),
                trend: stats.openOrders ? 'Needs fulfillment focus' : 'Queue is clear',
                trendClass: stats.openOrders ? 'warning' : ''
            },
            {
                icon: 'ph-chart-line-up',
                label: 'Projected Revenue',
                value: formatCurrency(stats.forecastRevenue),
                trend: `${stats.goalPercent}% of monthly goal`,
                trendClass: stats.goalPercent >= 70 ? '' : 'warning'
            }
        ];

        container.innerHTML = cards.map((card) => `
            <div class="insight-mini-card">
                <div class="insight-mini-top">
                    <div>
                        <div class="insight-label">${escapeHtml(card.label)}</div>
                        <div class="insight-value">${escapeHtml(card.value)}</div>
                    </div>
                    <div class="insight-icon"><i class="ph ${card.icon}"></i></div>
                </div>
                <div class="insight-trend ${card.trendClass}">${escapeHtml(card.trend)}</div>
            </div>
        `).join('');
    };

    const renderPipeline = (stats) => {
        const container = document.getElementById('order-pipeline-list');
        if (!container) return;

        if (!stats.orders.length) {
            container.innerHTML = '<div class="insight-empty">No orders yet. Use Sync to generate dashboard data.</div>';
            return;
        }

        const maxCount = Math.max(...statusOrder.map((item) => stats.statusCounts[item.key] || 0), 1);
        container.innerHTML = statusOrder.map((item) => {
            const count = stats.statusCounts[item.key] || 0;
            const width = Math.max(Math.round((count / maxCount) * 100), count ? 8 : 0);
            return `
                <div class="pipeline-row">
                    <div class="pipeline-label">${escapeHtml(item.label)}</div>
                    <div class="pipeline-track">
                        <div class="pipeline-fill" style="width:${width}%;background:${item.color}"></div>
                    </div>
                    <div class="pipeline-count">${count}</div>
                </div>
            `;
        }).join('');
    };

    const renderTopProducts = (stats) => {
        const container = document.getElementById('top-products-list');
        if (!container) return;

        if (!stats.topProducts.length) {
            container.innerHTML = '<div class="insight-empty">Top products will appear after orders are synced.</div>';
            return;
        }

        container.innerHTML = stats.topProducts.map((product, index) => `
            <div class="top-product-item">
                <div class="product-rank">#${index + 1}</div>
                <div class="product-info">
                    <div class="product-name" title="${escapeHtml(product.name)}">${escapeHtml(product.name)}</div>
                    <div class="product-meta">${product.count} orders - ${escapeHtml(formatCurrency(product.revenue))}</div>
                </div>
            </div>
        `).join('');
    };

    const getActions = (stats) => {
        const actions = [];

        if (!stats.orders.length) {
            actions.push({
                icon: 'ph-arrows-clockwise',
                title: 'Sync store data',
                copy: 'Generate fresh orders and customers for the dashboard.',
                button: 'Sync Now',
                action: 'DashboardInsightsModule.syncData()'
            });
        }

        if (stats.statusCounts.Pending) {
            actions.push({
                icon: 'ph-warning-circle',
                title: 'Review pending orders',
                copy: `${stats.statusCounts.Pending} orders are waiting for movement.`,
                button: 'View Pending',
                action: "DashboardInsightsModule.openOrdersByStatus('Pending')"
            });
        }

        if (stats.openOrders && stats.deliveryRate < 60) {
            actions.push({
                icon: 'ph-truck',
                title: 'Improve fulfillment speed',
                copy: 'Open orders are outpacing delivered orders.',
                button: 'Open Orders',
                action: 'DashboardInsightsModule.openOrders()'
            });
        }

        if (!stats.customers.length) {
            actions.push({
                icon: 'ph-user-plus',
                title: 'Add customer records',
                copy: 'Customer health metrics need customer data.',
                button: 'Customers',
                action: 'DashboardInsightsModule.openCustomers()'
            });
        }

        actions.push({
            icon: 'ph-file-text',
            title: 'Prepare performance report',
            copy: 'Use the current insights in the financial reports view.',
            button: 'Reports',
            action: 'DashboardInsightsModule.openReports()'
        });

        return actions.slice(0, 4);
    };

    const renderActions = (stats) => {
        const container = document.getElementById('dashboard-actions-list');
        if (!container) return;

        container.innerHTML = getActions(stats).map((item) => `
            <div class="dashboard-action-item">
                <div class="action-icon"><i class="ph ${item.icon}"></i></div>
                <div class="action-info">
                    <div class="action-title">${escapeHtml(item.title)}</div>
                    <div class="action-copy">${escapeHtml(item.copy)}</div>
                </div>
                <button class="action-button" onclick="${item.action}">${escapeHtml(item.button)}</button>
            </div>
        `).join('');
    };

    const refresh = (showToast = false) => {
        const stats = getStats();
        updateMainStats(stats);
        renderSummaryCards(stats);
        renderPipeline(stats);
        renderTopProducts(stats);
        renderActions(stats);

        if (showToast) {
            Toastify({
                text: 'Dashboard insights refreshed',
                duration: 1600,
                style: { background: '#10b981' }
            }).showToast();
        }
    };

    const openOrders = () => {
        NavigationModule.navigate('orders', document.querySelector('[onclick*="orders"]'));
    };

    const openOrdersByStatus = (status) => {
        openOrders();
        setTimeout(() => {
            if (OrdersModule.filterByStatus) OrdersModule.filterByStatus(status);
        }, 0);
    };

    const openCustomers = () => {
        NavigationModule.navigate('customers', document.querySelector('[onclick*="customers"]'));
    };

    const openReports = () => {
        NavigationModule.navigate('reports', document.querySelector('[onclick*="reports"]'));
    };

    const syncData = async () => {
        await FlipkartModule.sync();
        setTimeout(() => refresh(true), 800);
    };

    const exportSnapshot = () => {
        const stats = getStats();
        const lines = [
            `Nexus Dashboard Snapshot - ${new Date().toLocaleString()}`,
            '',
            `Total revenue: ${formatCurrency(stats.totalRevenue)}`,
            `Projected revenue: ${formatCurrency(stats.forecastRevenue)}`,
            `Total orders: ${stats.orders.length}`,
            `Open orders: ${stats.openOrders}`,
            `Delivery rate: ${stats.deliveryRate}%`,
            `Customers: ${stats.customers.length}`,
            `Active customers: ${stats.activeCustomers}`,
            '',
            'Order pipeline:',
            ...statusOrder.map((item) => `- ${item.label}: ${stats.statusCounts[item.key] || 0}`),
            '',
            'Top products:',
            ...(stats.topProducts.length
                ? stats.topProducts.map((item, index) => `${index + 1}. ${item.name} - ${item.count} orders - ${formatCurrency(item.revenue)}`)
                : ['No product data available'])
        ];

        const link = document.createElement('a');
        link.href = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/plain' }));
        link.download = `dashboard-snapshot-${new Date().toISOString().split('T')[0]}.txt`;
        link.click();
        URL.revokeObjectURL(link.href);

        Toastify({ text: 'Dashboard snapshot exported', style: { background: '#10b981' } }).showToast();
        if (typeof ActivityModule !== 'undefined') {
            ActivityModule.add('ph-download-simple', 'Exported dashboard snapshot', '#10b981');
        }
    };

    return {
        refresh,
        exportSnapshot,
        openOrders,
        openOrdersByStatus,
        openCustomers,
        openReports,
        syncData
    };
})();

/**
 * MODULE 6: THEME MANAGER
 */
const ThemeModule = (() => {
    const toggleDarkMode = async () => {
        document.body.classList.toggle("dark-mode");
        const isDark = document.body.classList.contains("dark-mode");

        // Save to backend
        try {
            await authFetch(API.preferences, {
                method: 'PUT',
                body: JSON.stringify({ theme: { darkMode: isDark } })
            });
        } catch (error) {
            console.error('Failed to save dark mode:', error);
        }
    };

    const setTheme = async (primary, primaryLight, gradient, element) => {
        // Apply theme immediately
        document.documentElement.style.setProperty("--primary", primary);
        document.documentElement.style.setProperty("--primary-light", primaryLight);
        document.documentElement.style.setProperty("--primary-gradient", gradient);

        document.querySelectorAll(".theme-dot-lg").forEach((d) => d.classList.remove("active"));
        element.classList.add("active");

        ChartModule.updateColors(primary, primaryLight);

        // Save to backend
        try {
            await authFetch(API.preferences, {
                method: 'PUT',
                body: JSON.stringify({
                    theme: {
                        primaryColor: primary,
                        primaryLight: primaryLight,
                        gradient: gradient,
                        darkMode: document.body.classList.contains("dark-mode")
                    }
                })
            });
            console.log('✓ Theme saved:', primary);
        } catch (error) {
            console.error('Failed to save theme:', error);
        }
    };

    const loadPreferences = async () => {
        try {
            const response = await authFetch(API.preferences);
            if (response.ok) {
                const prefs = await response.json();

                // Apply theme immediately
                if (prefs.theme) {
                    if (prefs.theme.primaryColor) {
                        document.documentElement.style.setProperty("--primary", prefs.theme.primaryColor);
                    }
                    if (prefs.theme.primaryLight) {
                        document.documentElement.style.setProperty("--primary-light", prefs.theme.primaryLight);
                    }
                    if (prefs.theme.gradient) {
                        document.documentElement.style.setProperty("--primary-gradient", prefs.theme.gradient);
                    }
                    if (prefs.theme.darkMode) {
                        document.body.classList.add("dark-mode");
                    } else {
                        document.body.classList.remove("dark-mode");
                    }

                    // Update charts with saved colors
                    if (prefs.theme.primaryColor && prefs.theme.primaryLight) {
                        ChartModule.updateColors(prefs.theme.primaryColor, prefs.theme.primaryLight);
                    }

                    // Update active theme dot
                    setTimeout(() => {
                        document.querySelectorAll(".theme-dot-lg").forEach((dot) => {
                            dot.classList.remove("active");
                            const onclick = dot.getAttribute('onclick');
                            if (onclick && prefs.theme.primaryColor && onclick.includes(prefs.theme.primaryColor)) {
                                dot.classList.add("active");
                            }
                        });
                    }, 100);
                }
            }
        } catch (error) {
            console.error('Failed to load preferences:', error);
        }
    };

    return { toggleDarkMode, setTheme, loadPreferences };
})();

/**
 * MODULE 7: NAVIGATION MANAGER
 */
const NavigationModule = (() => {
    const navigate = (viewId, linkElement) => {
        document
            .querySelectorAll(".nav-link")
            .forEach((el) => el.classList.remove("active"));
        if (linkElement) linkElement.classList.add("active");
        document
            .querySelectorAll(".view-section")
            .forEach((el) => el.classList.remove("active-view"));
        const target = document.getElementById("view-" + viewId);
        if (target) target.classList.add("active-view");
        document.getElementById("page-title").innerText =
            viewId.charAt(0).toUpperCase() + viewId.slice(1).replace("-", " ");
        SidebarModule.closeSidebar();

        // Trigger Reports Render
        if (viewId === 'reports') {
            if (typeof ReportModule !== 'undefined') ReportModule.show();
        }

        if (viewId === 'dashboard') {
            DashboardInsightsModule.refresh();
        }
    };
    return { navigate };
})();

/**
 * MODULE 8: SIDEBAR MANAGER
 */
const SidebarModule = (() => {
    const toggleSidebar = () => {
        document.getElementById("sidebar").classList.toggle("open");
        document.getElementById("sidebar-overlay").classList.toggle("active");
    };
    const closeSidebar = () => {
        document.getElementById("sidebar").classList.remove("open");
        document.getElementById("sidebar-overlay").classList.remove("active");
    };
    return { toggleSidebar, closeSidebar };
})();

/**
 * HELPER: Context Gatherer for AI
 */
const ContextModule = (() => {
    const getSnapshot = () => {
        const orders = OrdersModule.getOrders();
        const customers = CustomerModule.getCustomers();
        // We don't have direct access to Kanban tasks easily without refactoring, 
        // but we can scrape the counts from the DOM or just use orders/customers/sales for now.

        const salesVal = document.getElementById('stat-sales').innerText;
        const revVal = document.getElementById('stat-revenue').innerText;

        let context = `Current Dashboard State:\n`;
        context += `- Total Sales Count: ${salesVal}\n`;
        context += `- Total Revenue: ${revVal}\n`;
        context += `- Recent Orders (${orders.length} total):\n`;
        orders.slice(0, 5).forEach(o => {
            context += `  * ID: ${o.id}, Product: ${o.product}, Price: ${o.price}, Status: ${o.status}\n`;
        });
        context += `- Customers (${customers.length} total):\n`;
        customers.slice(0, 5).forEach(c => {
            context += `  * Name: ${c.name}, Email: ${c.email}, Status: ${c.status}\n`;
        });

        return context;
    };
    return { getSnapshot };
})();

/**
 * MODULE 10: ENHANCED CHAT BOT MODULE (AI + Voice + Smart Features)
 */
const ChatBotModule = (() => {
    const history = document.getElementById("chat-history");
    const input = document.getElementById("chat-input");
    let apiKey = localStorage.getItem("nexus_ai_key") || "";
    let isThinking = false;
    let chatHistory = JSON.parse(localStorage.getItem('nexus_chat_history')) || [];
    let conversationContext = [];
    let recognition = null;
    let synthesis = window.speechSynthesis;

    const init = () => {
        if (history) {
            // Add toolbar buttons
            const titleContainer = document.querySelector("#view-help-ai .section-header");
            if (titleContainer && !titleContainer.querySelector('.btn-settings')) {
                titleContainer.style.display = "flex";
                titleContainer.style.alignItems = "center";
                titleContainer.style.gap = "8px";

                const btnGroup = document.createElement("div");
                btnGroup.style.marginLeft = "auto";
                btnGroup.style.display = "flex";
                btnGroup.style.gap = "12px";

                // Voice button
                const voiceBtn = document.createElement("button");
                voiceBtn.className = "btn-ai-action btn-voice";
                voiceBtn.innerHTML = '<i class="ph ph-microphone"></i><span>Voice</span>';
                voiceBtn.title = "Voice Input";
                voiceBtn.onclick = startVoiceInput;

                // Export button
                const exportBtn = document.createElement("button");
                exportBtn.className = "btn-ai-action btn-export";
                exportBtn.innerHTML = '<i class="ph ph-download"></i><span>Export</span>';
                exportBtn.title = "Export Chat";
                exportBtn.onclick = exportChat;

                // Clear button
                const clearBtn = document.createElement("button");
                clearBtn.className = "btn-ai-action btn-clear";
                clearBtn.innerHTML = '<i class="ph ph-trash"></i><span>Clear</span>';
                clearBtn.title = "Clear History";
                clearBtn.onclick = clearHistory;

                // Settings button
                const settingsBtn = document.createElement("button");
                settingsBtn.className = "btn-ai-action btn-settings";
                settingsBtn.innerHTML = '<i class="ph ph-gear"></i><span>Settings</span>';
                settingsBtn.title = "Settings";
                settingsBtn.onclick = openSettings;

                btnGroup.appendChild(voiceBtn);
                btnGroup.appendChild(exportBtn);
                btnGroup.appendChild(clearBtn);
                btnGroup.appendChild(settingsBtn);
                titleContainer.appendChild(btnGroup);
            }

            loadChatHistory();
            showSmartSuggestions();
        }
    };

    const loadChatHistory = () => {
        if (chatHistory.length > 0) {
            history.innerHTML = chatHistory.map(msg =>
                `<div class="chat-message ${msg.type}">${msg.text}</div>`
            ).join('');
        } else {
            history.innerHTML = '<div class="chat-message bot">👋 Hello! I am Nexus AI with voice support. Ask me anything!</div>';
        }
    };

    const showSmartSuggestions = () => {
        // Suggestions are now in HTML, no need to dynamically add them
    };

    const sendSuggestion = (query) => {
        input.value = query;
        handleUserMessage();
    };

    const startVoiceInput = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            Toastify({ text: "Voice input not supported in this browser", style: { background: "#ef4444" } }).showToast();
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.continuous = false;

        recognition.onstart = () => {
            input.placeholder = "🎤 Listening...";
            Toastify({ text: "Listening... Speak now!", style: { background: "#4f46e5" } }).showToast();
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            input.value = transcript;
            input.placeholder = "Ask about orders, refunds, or returns...";
            handleUserMessage();
        };

        recognition.onerror = () => {
            input.placeholder = "Ask about orders, refunds, or returns...";
            Toastify({ text: "Voice input failed", style: { background: "#ef4444" } }).showToast();
        };

        recognition.start();
    };

    const speakResponse = (text) => {
        if (synthesis && localStorage.getItem('nexus_voice_enabled') === 'true') {
            synthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text.replace(/<[^>]*>/g, ''));
            utterance.rate = 1.1;
            utterance.pitch = 1;
            synthesis.speak(utterance);
        }
    };

    const exportChat = () => {
        const text = chatHistory.map(m => `[${m.type.toUpperCase()}]: ${m.text}`).join('\n\n');
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nexus-chat-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        Toastify({ text: "Chat exported successfully", style: { background: "#10b981" } }).showToast();
    };

    const clearHistory = () => {
        if (confirm('Clear all chat history?')) {
            chatHistory = [];
            conversationContext = [];
            localStorage.removeItem('nexus_chat_history');
            history.innerHTML = '<div class="chat-message bot">Chat cleared. How can I help you?</div>';
            Toastify({ text: "Chat history cleared", style: { background: "#10b981" } }).showToast();
        }
    };

    const saveChatMessage = (type, text) => {
        chatHistory.push({ type, text, timestamp: Date.now() });
        if (chatHistory.length > 100) chatHistory = chatHistory.slice(-100);
        localStorage.setItem('nexus_chat_history', JSON.stringify(chatHistory));
    };

    const openSettings = () => {
        document.getElementById("geminiApiKey").value = apiKey;
        const voiceToggle = document.getElementById("voiceToggle");
        if (voiceToggle) {
            voiceToggle.checked = localStorage.getItem('nexus_voice_enabled') === 'true';
        }
        document.getElementById("aiSettingsModalOverlay").style.display = "flex";
    };

    const closeSettings = () => {
        document.getElementById("aiSettingsModalOverlay").style.display = "none";
    };

    const saveSettings = () => {
        const key = document.getElementById("geminiApiKey").value.trim();
        if (key) {
            apiKey = key;
            localStorage.setItem("nexus_ai_key", apiKey);
            Toastify({ text: "API Key Saved", style: { background: "#10b981" } }).showToast();
            closeSettings();
        } else {
            alert("Please enter a valid key");
        }
    };

    const handleUserMessage = async () => {
        if (isThinking) return;
        const text = input.value.trim();
        if (!text) return;

        // Add User Message
        history.innerHTML += `<div class="chat-message user">${text}</div>`;
        saveChatMessage('user', text);
        conversationContext.push({ role: 'user', content: text });
        input.value = "";
        history.scrollTop = history.scrollHeight;

        isThinking = true;
        const loadingId = "loading-" + Date.now();
        history.innerHTML += `<div class="chat-message bot" id="${loadingId}">
                    <div class="typing-indicator">
                        <span></span><span></span><span></span>
                    </div>
                </div>`;
        history.scrollTop = history.scrollHeight;

        try {
            let responseText = "";

            if (apiKey) {
                // OPTION A: User's Gemini Key (Highest Quality/Privacy)
                try {
                    const context = ContextModule.getSnapshot();
                    responseText = await callGemini(text, context);
                } catch (apiErr) {
                    console.warn("Gemini API failed, falling back...", apiErr);
                    // Fallback to Free AI if Gemini fails
                    responseText = await callFreeAI(text, ContextModule.getSnapshot());
                }
            } else {
                // OPTION B: Free Cloud AI (Pollinations.ai - No Key Required)
                try {
                    const context = ContextModule.getSnapshot();
                    responseText = await callFreeAI(text, context);
                } catch (freeErr) {
                    console.warn("Free AI failed, using offline mode", freeErr);
                    // Fallback to Local Regex if Cloud fails
                    responseText = generateLocalResponse(text) + "<br><br><em style='color:var(--text-muted); font-size: 0.8em;'>(Offline mode: Network error)</em>";
                }
            }

            // Replace loading with response
            const formattedResponse = formatResponse(responseText);
            document.getElementById(loadingId).innerHTML = formattedResponse;
            saveChatMessage('bot', responseText);
            conversationContext.push({ role: 'assistant', content: responseText });

            // Add quick actions if relevant
            addQuickActions(text, loadingId);

            // Voice output
            speakResponse(responseText);

        } catch (err) {
            console.error("Critical Chat Error", err);
            document.getElementById(loadingId).innerText = "Sorry, I encountered a critical error.";
        } finally {
            isThinking = false;
            history.scrollTop = history.scrollHeight;
        }
    };

    const addQuickActions = (query, messageId) => {
        const q = query.toLowerCase();
        let actions = [];

        if (q.includes('order') || q.includes('track')) {
            actions.push({ icon: 'ph-package', text: 'View Orders', action: "NavigationModule.navigate('orders', document.querySelector('[onclick*=orders]'))" });
        }
        if (q.includes('refund') || q.includes('return')) {
            actions.push({ icon: 'ph-arrow-counter-clockwise', text: 'Refund Policy', action: "ChatBotModule.sendSuggestion('What is the refund policy?')" });
        }
        if (q.includes('customer')) {
            actions.push({ icon: 'ph-users', text: 'View Customers', action: "NavigationModule.navigate('customers', document.querySelector('[onclick*=customers]'))" });
        }

        if (actions.length > 0) {
            const actionsHTML = `
                        <div class="quick-actions" style="display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap;">
                            ${actions.map(a => `
                                <button onclick="${a.action}" class="btn-secondary" 
                                    style="font-size: 12px; padding: 6px 12px; display: flex; align-items: center; gap: 6px;">
                                    <i class="ph ${a.icon}"></i> ${a.text}
                                </button>
                            `).join('')}
                        </div>
                    `;
            document.getElementById(messageId).innerHTML += actionsHTML;
        }
    };

    const callFreeAI = async (prompt, context) => {
        // Use Hugging Face Inference API (Free, No Key Required)
        const url = 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium';

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                inputs: `Context: ${context}\n\nUser: ${prompt}\nAssistant:`,
                parameters: {
                    max_length: 200,
                    temperature: 0.7
                }
            })
        });

        if (!response.ok) throw new Error("AI_API_ERROR");
        const data = await response.json();
        return data[0]?.generated_text || generateLocalResponse(prompt);
    };

    const generateLocalResponse = (query) => {
        const text = query.toLowerCase();

        // --- 1. DYNAMIC DATA QUERIES (High Priority) ---

        // REVENUE / SALES
        if (text.includes("revenue") || text.includes("sales") || text.includes("money")) {
            const sales = document.getElementById('stat-sales').innerText;
            const revenue = document.getElementById('stat-revenue').innerText;
            return `Currently, your total sales count is **${sales}** and total revenue is **${revenue}**.`;
        }

        // ORDERS
        if (text.includes("order")) {
            const orders = OrdersModule.getOrders();
            if (text.includes("how many") || text.includes("count") || text.includes("total")) {
                return `You have a total of **${orders.length} orders** in the system.`;
            }
            if (text.includes("status") || text.includes("latest") || text.includes("recent")) {
                const recent = orders.slice(0, 3);
                let msg = `Here are your last 3 orders:\n`;
                recent.forEach(o => msg += `- **${o.product}** (${o.price}) - ${o.status}\n`);
                return msg;
            }
        }

        // CUSTOMERS
        if (text.includes("customer") || text.includes("user")) {
            const customers = CustomerModule.getCustomers();
            if (text.includes("how many") || text.includes("count")) {
                return `You have **${customers.length} registered customers**.`;
            }
        }

        // --- 2. STATIC KNOWLEDGE BASE (Refunds, Delivery, Policy) ---

        const knowledgeBase = [
            {
                keywords: ["refund", "money back", "return", "reimbursement"],
                response: "Our **Refund Policy** is simple: \n\n1. Returns are accepted within **30 days** of delivery.\n2. Items must be unused and in original packaging.\n3. Refunds are processed to the original payment method within **5-7 business days** after we receive the item."
            },
            {
                keywords: ["delivery", "shipping", "shipped", "arrive", "track"],
                response: "Standard delivery takes **3-5 business days**. Express shipping (1-2 days) is available for select items. You can track your order status in the 'Orders' tab of this dashboard."
            },
            {
                keywords: ["payment", "credit card", "upi", "pay"],
                response: "We accept all major **Credit/Debit Cards**, **UPI**, and Net Banking. Cash on Delivery (COD) is available for orders under $500."
            },
            {
                keywords: ["cancel", "cancellation"],
                response: "You can cancel an order **within 24 hours** of placing it, provided it hasn't been shipped yet. Go to the Orders section, select the order, and click 'Cancel'."
            },
            {
                keywords: ["contact", "support", "help", "email"],
                response: "You can reach our 24/7 support team at **support@flipkart-admin.com** or call us at **1-800-FLIPKART**."
            },
            {
                keywords: ["damaged", "broken", "defect"],
                response: "We're sorry to hear that! If you received a damaged item, please initiate a return immediately and select 'Item Defective' as the reason. We will arrange a free replacement."
            },
            {
                keywords: ["greet", "hello", "hi", "hey", "morning"],
                response: "Hello! I am your Nexus Support Bot. I can help you with orders, refunds, delivery queries, and more. What do you need help with?"
            }
        ];

        // Search Knowledge Base
        for (const item of knowledgeBase) {
            if (item.keywords.some(k => text.includes(k))) {
                return item.response;
            }
        }

        // FALLBACK
        return `I am not sure about that. I can help with:\n- **Order Status & Revenue**\n- **Refund & Return Policy**\n- **Delivery & Shipping**\n- **Cancellations**\n\nTry asking simply, like "What is the refund policy?"`;
    };

    const callGemini = async (prompt, context) => {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

        const systemInstruction = `You are a helpful AI assistant for the Nexus Admin Dashboard. 
                 You have access to the current dashboard data provided below. 
                 Answer the user's questions based strictly on this data. 
                 If the info is missing, say you don't know. 
                 Keep answers concise, professional, and friendly.
                 
                 DATA CONTEXT:
                 ${context}`;

        const data = {
            contents: [{
                parts: [{
                    text: systemInstruction + "\n\nUser Question: " + prompt
                }]
            }]
        };

        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!res.ok) throw new Error("API_ERROR");
        const json = await res.json();
        return json.candidates[0].content.parts[0].text;
    };

    const formatResponse = (text) => {
        // Simple markdown-like to HTML
        return text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
            .replace(/\n/g, '<br>');
    };

    return {
        init,
        handleUserMessage,
        openSettings,
        closeSettings,
        saveSettings,
        callFreeAI,
        sendSuggestion,
        startVoiceInput,
        exportChat,
        clearHistory
    };
})();

/**
 * MODULE 11: REPORT MODULE
 */
/**
 * MODULE 11: ANALYTICS & REPORTS
 */
const ReportModule = (() => {

    // 1. DATA PROCESSING
    const getAnalytics = () => {
        const orders = OrdersModule.getOrders();

        // A. Monthly Revenue
        const monthlyRev = {};
        orders.forEach(o => {
            const month = new Date(o.date).toLocaleString('default', { month: 'short', year: 'numeric' });
            const price = parseFloat(o.price.replace(/[^0-9.]/g, ''));
            monthlyRev[month] = (monthlyRev[month] || 0) + price;
        });
        // Sort months? For now, object keys might be unordered, let's assume chronological or just list them.
        // Better to map to array for Table
        const monthlyData = Object.entries(monthlyRev).map(([month, rev]) => ({ month, rev }));

        // B. Top Products
        const productCounts = {};
        const productRev = {};
        orders.forEach(o => {
            const p = o.product;
            const price = parseFloat(o.price.replace(/[^0-9.]/g, ''));
            productCounts[p] = (productCounts[p] || 0) + 1;
            productRev[p] = (productRev[p] || 0) + price;
        });
        const topProducts = Object.keys(productCounts)
            .map(p => ({
                name: p,
                count: productCounts[p],
                revenue: productRev[p]
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        // C. Top Categories
        const catCounts = {};
        orders.forEach(o => {
            const p = o.product.toLowerCase();
            let cat = 'Other';
            if (p.match(/phone|laptop|watch|sony|electronics|camera/)) cat = 'Electronics';
            else if (p.match(/shirt|shoe|nike|adidas|fashion|cloth/)) cat = 'Fashion';
            else if (p.match(/chair|lamp|home|furniture|desk/)) cat = 'Home & Decor';
            else if (p.match(/book|pen|paper/)) cat = 'Stationery';

            catCounts[cat] = (catCounts[cat] || 0) + 1;
        });
        const topCategories = Object.entries(catCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        // D. Summary Defaults
        const totalRev = orders.reduce((acc, o) => acc + parseFloat(o.price.replace(/[^0-9.]/g, '')), 0);

        return { monthlyData, topProducts, topCategories, totalRev, totalOrders: orders.length };
    };

    // 2. RENDER UI
    const render = () => {
        const container = document.getElementById("view-reports");
        const stats = getAnalytics();

        container.innerHTML = `
                    <style>
                        @media print {
                            .sidebar, .header, #ai-report-box button, .header-actions { display: none !important; }
                            .main-content { margin-left: 0 !important; padding: 0 !important; }
                            body { background: white; color: black; }
                            .card { box-shadow: none; border: 1px solid #ddd; break-inside: avoid; }
                        }
                    </style>

                    <div class="section-header">
                        <h3 class="section-title">Sales Performance Report</h3>
                        <div class="header-actions">
                             <button class="btn-primary" style="background: #f59e0b; border-color: #f59e0b;" onclick="ReportModule.fetchFlipkartData()">
                                <i class="ph ph-arrows-clockwise"></i> Sync Flipkart API
                            </button>
                             <button class="btn-primary" onclick="ReportModule.generateAIReport()">
                                <i class="ph ph-magic-wand"></i> AI Analysis
                            </button>
                             <button class="btn-secondary" onclick="window.print()">
                                <i class="ph ph-printer"></i> Print / Save PDF
                            </button>
                        </div>
                    </div>

                    <!-- AI INSIGHT BOX -->
                    <div id="ai-report-box" style="display:none; background: #f8fafc; border-left: 4px solid var(--primary); padding: 20px; border-radius: 8px; margin-bottom: 24px;">
                        <h4 style="margin:0 0 10px 0; color: var(--primary);"><i class="ph ph-sparkle"></i> AI Executive Summary</h4>
                        <div id="ai-report-content" style="font-size: 0.95em; line-height: 1.6; color: var(--text-main);">Generating insights...</div>
                    </div>

                    <!-- SUMMARY CARDS -->
                     <div class="stats-grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 24px;">
                        <div class="card" style="text-align: center;">
                            <div class="stat-label">Total Revenue</div>
                            <div class="stat-value" style="color: var(--primary);">$${stats.totalRev.toLocaleString()}</div>
                        </div>
                        <div class="card" style="text-align: center;">
                            <div class="stat-label">Total Orders</div>
                            <div class="stat-value">${stats.totalOrders}</div>
                        </div>
                        <div class="card" style="text-align: center;">
                            <div class="stat-label">Avg Order Value</div>
                            <div class="stat-value">$${Math.round(stats.totalRev / (stats.totalOrders || 1))}</div>
                        </div>
                    </div>

                    <div class="overview-grid" style="grid-template-columns: 1fr; gap: 32px;">
                        
                        <!-- 1. MONTHLY SALES TABLE -->
                        <div class="card">
                            <h3>Monthly Sales Data</h3>
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Month</th>
                                        <th>Revenue</th>
                                        <th>% Contribution</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${stats.monthlyData.map(m => `
                                        <tr>
                                            <td>${m.month}</td>
                                            <td>$${m.rev.toLocaleString()}</td>
                                            <td>${Math.round((m.rev / stats.totalRev) * 100)}%</td>
                                        </tr>
                                    `).join('')}
                                    ${stats.monthlyData.length === 0 ? '<tr><td colspan="3">No data available</td></tr>' : ''}
                                </tbody>
                            </table>
                        </div>

                        <!-- 2. TOP PRODUCTS TABLE -->
                        <div class="card">
                            <h3>Top Selling Products</h3>
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Rank</th>
                                        <th>Product Name</th>
                                        <th>Units Sold</th>
                                        <th>Revenue Generated</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${stats.topProducts.map((p, i) => `
                                        <tr>
                                            <td>#${i + 1}</td>
                                            <td><b>${p.name}</b></td>
                                            <td>${p.count}</td>
                                            <td>$${p.revenue.toLocaleString()}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>

                        <!-- 3. TOP CATEGORIES TABLE -->
                        <div class="card">
                            <h3>Top Categories</h3>
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Rank</th>
                                        <th>Category</th>
                                        <th>Orders Count</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${stats.topCategories.map((c, i) => `
                                        <tr>
                                            <td>#${i + 1}</td>
                                            <td>${c.name}</td>
                                            <td>${c.count}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>

                    </div>
                `;
    };

    const fetchFlipkartData = async () => {
        Toastify({ text: "Connecting to Flipkart API...", style: { background: "#f59e0b" } }).showToast();
        try {
            // Reuse the existing Flickr/Flipkart API simulation logic
            await FlipkartModule.sync();
            // Re-render after data update
            setTimeout(() => {
                render();
                Toastify({ text: "Report Updated with API Data", style: { background: "#10b981" } }).showToast();
            }, 1500); // Wait for sync to complete (it has some internal delays)
        } catch (e) {
            Toastify({ text: "API Sync Failed", style: { background: "#ef4444" } }).showToast();
        }
    };

    // 3. AI REPORT GENERATION
    const generateAIReport = async () => {
        const box = document.getElementById('ai-report-box');
        const content = document.getElementById('ai-report-content');
        box.style.display = 'block';
        content.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Analyzing Flipkart data...';

        const stats = getAnalytics();
        const prompt = `Analyze this Flipkart sales report and write an executive summary:
                - Total Revenue: $${stats.totalRev}
                - Top 3 Best Sellers: ${stats.topProducts.slice(0, 3).map(p => p.name).join(', ')}
                - Leading Category: ${stats.topCategories[0]?.name || 'N/A'}
                
                Format:
                1. **Performance Overview**: Brief summary of revenue and growth.
                2. **Top Performers**: Mention the best selling items and why they might be trending.
                3. **Strategic Action**: One recommendation for next month.`;

        try {
            const response = await ChatBotModule.callFreeAI(prompt, "N/A");
            content.innerHTML = response.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
        } catch (e) {
            content.innerText = "Could not generate AI report. Please check connection.";
        }
    };

    return { show: render, generateAIReport, fetchFlipkartData };
})();

document.addEventListener("DOMContentLoaded", () => {
    // Check if user is already logged in
    AuthModule.checkAuth();

    CustomerModule.init();
    OrdersModule.init();
    DashboardInsightsModule.refresh();
});


// Toggle user dropdown menu
function toggleUserMenu() {
    const dropdown = document.getElementById('user-dropdown');
    dropdown.classList.toggle('show');
    event.stopPropagation();
}

// Close dropdown when clicking outside
document.addEventListener('click', function (event) {
    const dropdown = document.getElementById('user-dropdown');
    const userProfile = document.querySelector('.user-profile');

    if (dropdown && !userProfile.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});


// ============================================================
// SEARCH MODULE (Global Ctrl+K Search)
// ============================================================
const SearchModule = (() => {
    const open = () => {
        const wrap = document.getElementById('global-search-wrap');
        wrap.style.display = 'flex';
        document.getElementById('global-search-input').focus();
    };
    const close = () => {
        document.getElementById('global-search-wrap').style.display = 'none';
        document.getElementById('search-results').innerHTML = '';
        document.getElementById('global-search-input').value = '';
    };
    const search = (query) => {
        const q = query.toLowerCase().trim();
        const results = document.getElementById('search-results');
        if (!q) { results.innerHTML = ''; return; }

        const orders = OrdersModule.getOrders().filter(o =>
            o.orderId?.toLowerCase().includes(q) || o.product?.toLowerCase().includes(q) || o.customer?.toLowerCase().includes(q)
        ).slice(0, 4);

        const customers = CustomerModule.getCustomers().filter(c =>
            c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)
        ).slice(0, 4);

        if (!orders.length && !customers.length) {
            results.innerHTML = `<div class="search-empty">No results for "<b>${query}</b>"</div>`;
            return;
        }

        results.innerHTML = [
            orders.length ? `<div class="search-group-label">Orders</div>` + orders.map(o => `
                <div class="search-item" onclick="NavigationModule.navigate('orders', document.querySelector('[onclick*=orders]')); SearchModule.close()">
                    <i class="ph ph-shopping-cart"></i>
                    <div><div class="search-item-title">${o.product}</div><div class="search-item-sub">${o.orderId} · ${o.status}</div></div>
                </div>`).join('') : '',
            customers.length ? `<div class="search-group-label">Customers</div>` + customers.map(c => `
                <div class="search-item" onclick="NavigationModule.navigate('customers', document.querySelector('[onclick*=customers]')); SearchModule.close()">
                    <i class="ph ph-user"></i>
                    <div><div class="search-item-title">${c.name}</div><div class="search-item-sub">${c.email}</div></div>
                </div>`).join('') : ''
        ].join('');
    };

    // Ctrl+K shortcut
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); open(); }
        if (e.key === 'Escape') close();
    });

    return { open, close, search };
})();

// ============================================================
// NOTIFICATION MODULE
// ============================================================
const NotifModule = (() => {
    let notifications = JSON.parse(localStorage.getItem('nexus_notifs')) || [
        { id: 1, icon: 'ph-shopping-cart', text: 'New order synced from Flipkart', time: '2 min ago', read: false },
        { id: 2, icon: 'ph-user-plus', text: 'New customer registered', time: '15 min ago', read: false },
        { id: 3, icon: 'ph-chart-line-up', text: 'Revenue milestone reached!', time: '1 hr ago', read: false },
    ];

    const render = () => {
        const list = document.getElementById('notif-list');
        const badge = document.getElementById('notif-badge');
        const unread = notifications.filter(n => !n.read).length;
        badge.textContent = unread;
        badge.style.display = unread ? 'flex' : 'none';

        list.innerHTML = notifications.length ? notifications.map(n => `
            <div class="notif-item ${n.read ? 'read' : ''}" onclick="NotifModule.markRead(${n.id})">
                <div class="notif-icon"><i class="ph ${n.icon}"></i></div>
                <div class="notif-body">
                    <div class="notif-text">${n.text}</div>
                    <div class="notif-time">${n.time}</div>
                </div>
                ${!n.read ? '<div class="notif-dot"></div>' : ''}
            </div>`).join('')
            : `<div class="search-empty">No notifications</div>`;
    };

    const toggle = () => {
        const dd = document.getElementById('notif-dropdown');
        dd.classList.toggle('show');
        render();
    };

    const markRead = (id) => {
        notifications = notifications.map(n => n.id === id ? { ...n, read: true } : n);
        save(); render();
    };

    const clearAll = () => {
        notifications = [];
        save(); render();
        document.getElementById('notif-dropdown').classList.remove('show');
    };

    const add = (text, icon = 'ph-bell') => {
        notifications.unshift({ id: Date.now(), icon, text, time: 'Just now', read: false });
        if (notifications.length > 20) notifications = notifications.slice(0, 20);
        save(); render();
    };

    const save = () => localStorage.setItem('nexus_notifs', JSON.stringify(notifications));

    document.addEventListener('click', (e) => {
        if (!document.getElementById('notif-wrap')?.contains(e.target))
            document.getElementById('notif-dropdown')?.classList.remove('show');
    });

    setTimeout(render, 500);
    return { toggle, markRead, clearAll, add };
})();

// ============================================================
// ACTIVITY FEED MODULE
// ============================================================
const ActivityModule = (() => {
    let activities = JSON.parse(localStorage.getItem('nexus_activity')) || [];

    const add = (icon, text, color = 'var(--primary)') => {
        activities.unshift({ icon, text, color, time: new Date().toLocaleTimeString() });
        if (activities.length > 8) activities = activities.slice(0, 8);
        localStorage.setItem('nexus_activity', JSON.stringify(activities));
        render();
    };

    const render = () => {
        const feed = document.getElementById('activity-feed');
        if (!feed) return;
        if (!activities.length) { feed.style.display = 'none'; return; }
        feed.style.display = 'flex';
        feed.innerHTML = `
            <div class="activity-title"><i class="ph ph-activity"></i> Recent Activity</div>
            ${activities.map(a => `
                <div class="activity-item">
                    <div class="activity-icon" style="background:${a.color}20;color:${a.color}"><i class="ph ${a.icon}"></i></div>
                    <div class="activity-text">${a.text}</div>
                    <div class="activity-time">${a.time}</div>
                </div>`).join('')}`;
    };

    setTimeout(render, 600);
    return { add, render };
})();

// ============================================================
// SCROLL TO TOP
// ============================================================
document.querySelector('.main-content')?.addEventListener('scroll', function () {
    const btn = document.getElementById('scroll-top-btn');
    if (btn) btn.classList.toggle('visible', this.scrollTop > 300);
});

// ============================================================
// ORDERS: filter + CSV export
// ============================================================
OrdersModule.filterTable = (query) => {
    const q = query.toLowerCase();
    document.querySelectorAll('#orders-table-body .table-row').forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(q) ? '' : 'none';
    });
};

OrdersModule.exportCSV = () => {
    const orders = OrdersModule.getOrders();
    if (!orders.length) { Toastify({ text: 'No orders to export', style: { background: '#ef4444' } }).showToast(); return; }
    const headers = ['Order ID', 'Customer', 'Product', 'Price', 'Date', 'Status'];
    const rows = orders.map(o => [o.orderId, o.customer, o.product, o.price, o.date, o.status].join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    Toastify({ text: '✓ Orders exported as CSV', style: { background: '#10b981' } }).showToast();
    ActivityModule.add('ph-download-simple', `Exported ${orders.length} orders to CSV`, '#10b981');
};

// ============================================================
// CUSTOMERS: filter table
// ============================================================
CustomerModule.filterTable = (query) => {
    const q = query.toLowerCase();
    document.querySelectorAll('#customers-table-body .table-row').forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(q) ? '' : 'none';
    });
};

// ============================================================
// COPY ORDER ID TO CLIPBOARD
// ============================================================
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        Toastify({ text: '✓ Copied to clipboard!', duration: 1500, style: { background: '#10b981' } }).showToast();
    });
}

// ============================================================
// PAGE TITLE UPDATE
// ============================================================
const _origNavigate = NavigationModule.navigate;
NavigationModule.navigate = (viewId, linkElement) => {
    _origNavigate(viewId, linkElement);
    document.title = `${viewId.charAt(0).toUpperCase() + viewId.slice(1).replace('-', ' ')} · Nexus Admin`;
};


// ============================================================
// CLOCK WIDGET
// ============================================================
(function () {
    const tick = () => {
        const now = new Date();
        const cl = document.getElementById('live-clock');
        const dt = document.getElementById('live-date');
        if (cl) cl.textContent = now.toLocaleTimeString();
        if (dt) dt.textContent = now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
    };
    tick();
    setInterval(tick, 1000);
})();

// ============================================================
// WEATHER WIDGET
// ============================================================
(function () {
    const show = (temp, city) => {
        const t = document.getElementById('weather-temp');
        const c = document.getElementById('weather-city');
        if (t) t.textContent = `${Math.round(temp)}°C`;
        if (c) c.textContent = city;
    };
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            const { latitude: lat, longitude: lon } = pos.coords;
            fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
                .then(r => r.json())
                .then(d => {
                    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
                        .then(r => r.json())
                        .then(loc => show(d.current_weather.temperature, loc.address?.city || loc.address?.town || 'Your City'))
                        .catch(() => show(d.current_weather.temperature, 'Your City'));
                }).catch(() => show(28, 'Mumbai'));
        }, () => show(28, 'Mumbai'));
    } else {
        show(28, 'Mumbai');
    }
})();

// ============================================================
// SESSION TIMER
// ============================================================
(function () {
    const start = Date.now();
    setInterval(() => {
        const el = document.getElementById('session-timer');
        if (!el) return;
        const s = Math.floor((Date.now() - start) / 1000);
        el.textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
    }, 1000);
})();

// ============================================================
// AUTO-SAVE INDICATOR
// ============================================================
function showAutoSave() {
    const el = document.getElementById('autosave-status');
    if (!el) return;
    el.textContent = 'Saving...';
    el.style.color = '#f59e0b';
    setTimeout(() => { el.textContent = 'Saved ✓'; el.style.color = '#10b981'; }, 1200);
}

// ============================================================
// GOAL PROGRESS BAR
// ============================================================
function updateGoalProgress() {
    const orders = OrdersModule.getOrders();
    const total = orders.reduce((s, o) => s + parseFloat(o.price.replace(/[^0-9.]/g, '') || 0), 0);
    const target = 500000;
    const pct = Math.min(Math.round((total / target) * 100), 100);
    const fill = document.getElementById('goal-fill');
    const pctEl = document.getElementById('goal-pct');
    if (fill) fill.style.width = pct + '%';
    if (pctEl) pctEl.textContent = pct + '%';
}
setTimeout(updateGoalProgress, 2000);

// ============================================================
// UPCOMING EVENTS (below calendar)
// ============================================================
const _origCalRender = CalendarModule;
function renderUpcomingEvents(events) {
    const container = document.getElementById('upcoming-events');
    if (!container) return;
    const today = new Date();
    const upcoming = events
        .filter(e => new Date(e.date) >= today)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5);
    if (!upcoming.length) { container.innerHTML = ''; return; }
    container.innerHTML = `
        <div class="upcoming-title"><i class="ph ph-calendar-check"></i> Upcoming Events</div>
        ${upcoming.map(e => `
            <div class="upcoming-item">
                <div class="upcoming-dot" style="background:${e.color}"></div>
                <div class="upcoming-info">
                    <div class="upcoming-name">${e.title}</div>
                    <div class="upcoming-date">${new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                </div>
            </div>`).join('')}`;
}

// Patch CalendarModule to also render upcoming events
const _origLoadFromBackend = CalendarModule.loadFromBackend;

// ============================================================
// ORDERS: Status filter
// ============================================================
OrdersModule.filterByStatus = (status) => {
    document.querySelectorAll('#orders-table-body .table-row').forEach(row => {
        row.style.display = !status || row.innerText.includes(status) ? '' : 'none';
    });
};

// ============================================================
// CUSTOMERS: Export CSV
// ============================================================
CustomerModule.exportCSV = () => {
    const customers = CustomerModule.getCustomers();
    if (!customers.length) return;
    const csv = ['Name,Email,Status,Joined', ...customers.map(c => `${c.name},${c.email},${c.status},${c.joined}`)].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    Toastify({ text: '✓ Customers exported', style: { background: '#10b981' } }).showToast();
};

// ============================================================
// THEME: Font size, Compact mode, Reset
// ============================================================
ThemeModule.setFontSize = (size) => {
    document.documentElement.style.setProperty('font-size', size);
    localStorage.setItem('nexus_font_size', size);
    Toastify({ text: `Font size set to ${size}`, style: { background: '#10b981' } }).showToast();
};

ThemeModule.toggleCompact = (on) => {
    document.body.classList.toggle('compact-mode', on);
    localStorage.setItem('nexus_compact', on);
};

ThemeModule.resetAll = () => {
    if (!confirm('Reset all settings to default?')) return;
    document.documentElement.style.setProperty('--primary', '#4f46e5');
    document.documentElement.style.setProperty('--primary-light', '#eef2ff');
    document.documentElement.style.setProperty('--primary-gradient', 'linear-gradient(135deg,#6366f1 0%,#4f46e5 100%)');
    document.documentElement.style.setProperty('font-size', '15px');
    document.body.classList.remove('dark-mode', 'compact-mode');
    localStorage.removeItem('nexus_font_size');
    localStorage.removeItem('nexus_compact');
    Toastify({ text: '✓ Settings reset to default', style: { background: '#10b981' } }).showToast();
};

// Load saved font size & compact on startup
(function () {
    const fs = localStorage.getItem('nexus_font_size');
    if (fs) document.documentElement.style.setProperty('font-size', fs);
    if (localStorage.getItem('nexus_compact') === 'true') document.body.classList.add('compact-mode');
})();

// ============================================================
// EMPTY STATE HELPER
// ============================================================
function showEmptyState(tbodyId, cols, icon, msg) {
    const tbody = document.getElementById(tbodyId);
    if (tbody && !tbody.children.length) {
        tbody.innerHTML = `<tr><td colspan="${cols}" style="text-align:center;padding:48px;color:var(--text-muted);">
            <div style="font-size:48px;margin-bottom:12px">${icon}</div>
            <div style="font-size:15px;font-weight:600;margin-bottom:6px">${msg}</div>
            <div style="font-size:13px">Data will appear here once synced</div>
        </td></tr>`;
    }
}
setTimeout(() => {
    showEmptyState('orders-table-body', 6, '📦', 'No orders yet');
    showEmptyState('customers-table-body', 5, '👥', 'No customers yet');
}, 2500);

// ============================================================
// CONFETTI ON LOGIN
// ============================================================
function launchConfetti() {
    const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    for (let i = 0; i < 80; i++) {
        const el = document.createElement('div');
        el.style.cssText = `position:fixed;top:-10px;left:${Math.random() * 100}vw;width:${6 + Math.random() * 8}px;height:${6 + Math.random() * 8}px;background:${colors[Math.floor(Math.random() * colors.length)]};border-radius:${Math.random() > 0.5 ? '50%' : '2px'};z-index:9999;pointer-events:none;animation:confettiFall ${1.5 + Math.random() * 2}s ease-in forwards;animation-delay:${Math.random() * 0.8}s;`;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 4000);
    }
}

// ============================================================
// KEYBOARD SHORTCUTS
// ============================================================
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === '?') document.getElementById('shortcutsModal').style.display = 'flex';
    if (e.ctrlKey && e.key === 'd') { e.preventDefault(); NavigationModule.navigate('dashboard', document.querySelector('[onclick*="dashboard"]')); }
    if (e.ctrlKey && e.key === 'o') { e.preventDefault(); NavigationModule.navigate('orders', document.querySelector('[onclick*="orders"]')); }
    if (e.ctrlKey && e.key === 'u') { e.preventDefault(); NavigationModule.navigate('customers', document.querySelector('[onclick*="customers"]')); }
    if (e.ctrlKey && e.key === 't') { e.preventDefault(); NavigationModule.navigate('tasks', document.querySelector('[onclick*="tasks"]')); }
});

