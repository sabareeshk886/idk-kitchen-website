// IDK Kitchen - Kitchen Display System
let orders = [];
let refreshInterval;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeKitchen();
    startAutoRefresh();
});

function initializeKitchen() {
    loadOrders();
    renderOrders();
    updateTime();
    setInterval(updateTime, 1000);
}

function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    document.getElementById('currentTime').textContent = timeString;
}

function startAutoRefresh() {
    // Refresh every 2 seconds
    refreshInterval = setInterval(() => {
        const previousCount = orders.filter(o => o.status === 'pending').length;
        loadOrders();
        const newCount = orders.filter(o => o.status === 'pending').length;

        // Play alert if new order
        if (newCount > previousCount) {
            playAlert();
        }

        renderOrders();
    }, 2000);
}

function loadOrders() {
    const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const today = new Date().toLocaleDateString('en-IN');

    // Filter today's orders that are not completed
    orders = allOrders.filter(order =>
        order.date === today && order.status !== 'completed'
    );
}

function renderOrders() {
    const container = document.getElementById('ordersContainer');

    const pendingOrders = orders.filter(o => o.status === 'pending');
    const readyOrders = orders.filter(o => o.status === 'ready');

    // Update stats
    document.getElementById('pendingCount').textContent = pendingOrders.length;
    document.getElementById('readyCount').textContent = readyOrders.length;

    if (orders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🍳</div>
                <h2>No Pending Orders</h2>
                <p>New orders will appear here automatically</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';

    // Render pending orders
    pendingOrders.forEach(order => {
        const orderCard = createOrderCard(order);
        container.appendChild(orderCard);
    });

    // Render ready orders section if any
    if (readyOrders.length > 0) {
        const readySection = document.createElement('div');
        readySection.className = 'ready-section';
        readySection.innerHTML = '<h2 class="ready-header">✅ Ready for Pickup</h2>';

        const readyGrid = document.createElement('div');
        readyGrid.className = 'ready-orders';

        readyOrders.forEach(order => {
            const readyCard = createReadyCard(order);
            readyGrid.appendChild(readyCard);
        });

        readySection.appendChild(readyGrid);
        container.appendChild(readySection);
    }
}

function createOrderCard(order) {
    const card = document.createElement('div');
    const waitTime = getWaitTime(order.timestamp);
    const urgency = getUrgency(waitTime);

    card.className = `order-card ${urgency}`;

    card.innerHTML = `
        <div class="order-header">
            <div class="token-number">#${String(order.tokenNumber).padStart(3, '0')}</div>
            <div class="order-time">
                <span class="time-label">Wait Time</span>
                <span class="time-value ${urgency}">${formatWaitTime(waitTime)}</span>
            </div>
        </div>
        
        <div class="order-info">
            <span class="info-badge ${order.orderType}">${order.orderType === 'dine-in' ? '🍽️ Dine-in' : '🥡 Takeaway'}</span>
            ${order.tableNumber ? `<span class="table-number">Table ${order.tableNumber}</span>` : ''}
        </div>
        
        <div class="order-items">
            ${order.items.map(item => `
                <div class="order-item">
                    <span class="item-name">${item.name}</span>
                    <span class="item-quantity">×${item.quantity}</span>
                </div>
            `).join('')}
        </div>
        
        <div class="order-total">Total: ₹${order.total}</div>
        
        <button class="btn-ready" onclick="markAsReady('${order.timestamp}')">
            ✓ Mark as Ready
        </button>
    `;

    return card;
}

function createReadyCard(order) {
    const card = document.createElement('div');
    card.className = 'ready-card';

    card.innerHTML = `
        <div class="order-header">
            <div class="token-number">#${String(order.tokenNumber).padStart(3, '0')}</div>
        </div>
        
        <div class="order-info">
            <span class="info-badge ${order.orderType}">${order.orderType === 'dine-in' ? '🍽️ Dine-in' : '🥡 Takeaway'}</span>
            ${order.tableNumber ? `<span class="table-number">Table ${order.tableNumber}</span>` : ''}
        </div>
        
        <button class="btn-complete" onclick="markAsCompleted('${order.timestamp}')">
            ✓ Delivered
        </button>
    `;

    return card;
}

function getWaitTime(timestamp) {
    const orderTime = new Date(timestamp);
    const now = new Date();
    return Math.floor((now - orderTime) / 1000 / 60); // minutes
}

function formatWaitTime(minutes) {
    if (minutes < 60) {
        return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
}

function getUrgency(minutes) {
    if (minutes < 5) return 'normal';
    if (minutes < 10) return 'warning';
    return 'urgent';
}

function markAsReady(timestamp) {
    const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const orderIndex = allOrders.findIndex(o => o.timestamp === timestamp);

    if (orderIndex !== -1) {
        allOrders[orderIndex].status = 'ready';
        allOrders[orderIndex].readyAt = new Date().toISOString();
        localStorage.setItem('orders', JSON.stringify(allOrders));

        loadOrders();
        renderOrders();
    }
}

function markAsCompleted(timestamp) {
    const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const orderIndex = allOrders.findIndex(o => o.timestamp === timestamp);

    if (orderIndex !== -1) {
        allOrders[orderIndex].status = 'completed';
        allOrders[orderIndex].completedAt = new Date().toISOString();
        localStorage.setItem('orders', JSON.stringify(allOrders));

        loadOrders();
        renderOrders();
    }
}

function playAlert() {
    const audio = document.getElementById('orderAlert');
    if (audio) {
        audio.play().catch(e => console.log('Audio play failed:', e));
    }
}

// Make functions global
window.markAsReady = markAsReady;
window.markAsCompleted = markAsCompleted;
