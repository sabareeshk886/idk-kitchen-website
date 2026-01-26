// IDK Kitchen - Admin Dashboard
let allOrders = [];
let currentFilter = 'all';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeAdmin();
    setupNavigation();
    loadDashboardData();
});

function initializeAdmin() {
    updateDate();
    loadOrders();
    setInterval(loadDashboardData, 5000); // Refresh every 5 seconds
}

function updateDate() {
    const now = new Date();
    const dateString = now.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('currentDate').textContent = dateString;
}

function setupNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;

            // Update active nav
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            item.classList.add('active');

            // Show section
            document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
            document.getElementById(`${section}-section`).classList.add('active');

            // Update title
            document.getElementById('sectionTitle').textContent =
                item.textContent.trim();

            // Load section specific data
            if (section === 'orders') loadOrdersSection();
            if (section === 'menu') loadMenuAnalytics();
        });
    });

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            loadOrdersSection();
        });
    });
}

function loadOrders() {
    allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
}

function loadDashboardData() {
    loadOrders();
    const today = new Date().toLocaleDateString('en-IN');
    const todayOrders = allOrders.filter(o => o.date === today);

    // Calculate stats
    const revenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
    const orderCount = todayOrders.length;
    const avgValue = orderCount > 0 ? Math.round(revenue / orderCount) : 0;
    const pending = todayOrders.filter(o => o.status === 'pending').length;

    // Update stats cards
    document.getElementById('todayRevenue').textContent = `₹${revenue.toLocaleString()}`;
    document.getElementById('todayOrders').textContent = orderCount;
    document.getElementById('avgOrderValue').textContent = `₹${avgValue}`;
    document.getElementById('pendingOrders').textContent = pending;

    // Update charts
    updatePaymentBreakdown(todayOrders);
    updateTopItems(todayOrders);
    updateRecentOrders(todayOrders);
}

function updatePaymentBreakdown(orders) {
    const breakdown = {
        cash: 0,
        upi: 0,
        card: 0
    };

    orders.forEach(order => {
        breakdown[order.paymentMethod] += order.total;
    });

    const total = Object.values(breakdown).reduce((a, b) => a + b, 0);

    const container = document.getElementById('paymentBreakdown');
    if (total === 0) {
        container.innerHTML = '<p class="placeholder">No payments yet today</p>';
        return;
    }

    container.innerHTML = `
        <div class="payment-item">
            <div class="payment-bar">
                <div class="payment-fill cash" style="width: ${(breakdown.cash / total * 100)}%">
                    ${breakdown.cash > 0 ? 'Cash' : ''}
                </div>
            </div>
            <div class="payment-amount">₹${breakdown.cash.toLocaleString()}</div>
        </div>
        <div class="payment-item">
            <div class="payment-bar">
                <div class="payment-fill upi" style="width: ${(breakdown.upi / total * 100)}%">
                    ${breakdown.upi > 0 ? 'UPI' : ''}
                </div>
            </div>
            <div class="payment-amount">₹${breakdown.upi.toLocaleString()}</div>
        </div>
        <div class="payment-item">
            <div class="payment-bar">
                <div class="payment-fill card" style="width: ${(breakdown.card / total * 100)}%">
                    ${breakdown.card > 0 ? 'Card' : ''}
                </div>
            </div>
            <div class="payment-amount">₹${breakdown.card.toLocaleString()}</div>
        </div>
    `;
}

function updateTopItems(orders) {
    const itemStats = {};

    orders.forEach(order => {
        order.items.forEach(item => {
            if (!itemStats[item.name]) {
                itemStats[item.name] = { count: 0, revenue: 0 };
            }
            itemStats[item.name].count += item.quantity;
            itemStats[item.name].revenue += item.price * item.quantity;
        });
    });

    const sorted = Object.entries(itemStats)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 5);

    const container = document.getElementById('topItems');

    if (sorted.length === 0) {
        container.innerHTML = '<p class="placeholder">No orders yet today</p>';
        return;
    }

    container.innerHTML = sorted.map(([name, stats], index) => `
        <div class="top-item">
            <div class="item-rank">${index + 1}</div>
            <div class="item-name">${name}</div>
            <div class="item-count">${stats.count} sold</div>
            <div class="item-revenue">₹${stats.revenue}</div>
        </div>
    `).join('');
}

function updateRecentOrders(orders) {
    const container = document.getElementById('recentOrders');
    const recent = orders.slice(-10).reverse();

    if (recent.length === 0) {
        container.innerHTML = '<p class="placeholder">No orders yet today</p>';
        return;
    }

    container.innerHTML = recent.map(order => `
        <div class="order-row">
            <div class="order-token">#${String(order.tokenNumber).padStart(3, '0')}</div>
            <div class="order-items-list">
                ${order.items.map(item => `${item.name} ×${item.quantity}`).join(', ')}
            </div>
            <div class="order-total">₹${order.total}</div>
            <div class="order-time">${order.time}</div>
            <div class="order-status ${order.status}">${order.status}</div>
        </div>
    `).join('');
}

function loadOrdersSection() {
    loadOrders();
    const today = new Date().toLocaleDateString('en-IN');
    let filteredOrders = allOrders.filter(o => o.date === today);

    if (currentFilter !== 'all') {
        filteredOrders = filteredOrders.filter(o => o.status === currentFilter);
    }

    const container = document.getElementById('ordersList');

    if (filteredOrders.length === 0) {
        container.innerHTML = '<p class="placeholder">No orders found</p>';
        return;
    }

    container.innerHTML = filteredOrders.reverse().map(order => `
        <div class="order-row">
            <div class="order-token">#${String(order.tokenNumber).padStart(3, '0')}</div>
            <div>
                <div><strong>${order.orderType === 'dine-in' ? '🍽️ Dine-in' : '🥡 Takeaway'}</strong>
                    ${order.tableNumber ? ` - Table ${order.tableNumber}` : ''}
                </div>
                <div class="order-items-list">
                    ${order.items.map(item => `${item.name} ×${item.quantity}`).join(', ')}
                </div>
            </div>
            <div class="order-total">₹${order.total}</div>
            <div>${order.paymentMethod.toUpperCase()}</div>
            <div class="order-status ${order.status}">${order.status}</div>
        </div>
    `).join('');
}

function loadMenuAnalytics() {
    loadOrders();
    const itemStats = {};

    allOrders.forEach(order => {
        order.items.forEach(item => {
            if (!itemStats[item.name]) {
                itemStats[item.name] = {
                    count: 0,
                    revenue: 0,
                    price: item.price
                };
            }
            itemStats[item.name].count += item.quantity;
            itemStats[item.name].revenue += item.price * item.quantity;
        });
    });

    const sorted = Object.entries(itemStats)
        .sort((a, b) => b[1].revenue - a[1].revenue);

    const container = document.getElementById('menuAnalytics');

    if (sorted.length === 0) {
        container.innerHTML = '<p class="placeholder">No sales data available</p>';
        return;
    }

    container.innerHTML = `
        <h3>Menu Performance</h3>
        <div class="menu-item-stat" style="font-weight: 700; background: var(--cream); border-bottom: 2px solid var(--dark);">
            <div>Item Name</div>
            <div>Units Sold</div>
            <div>Revenue</div>
            <div>Avg Price</div>
        </div>
        ${sorted.map(([name, stats]) => `
            <div class="menu-item-stat">
                <div>${name}</div>
                <div>${stats.count}</div>
                <div>₹${stats.revenue.toLocaleString()}</div>
                <div>₹${stats.price}</div>
            </div>
        `).join('')}
    `;
}

function generateReport() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    if (!startDate || !endDate) {
        alert('Please select both start and end dates');
        return;
    }

    loadOrders();

    const start = new Date(startDate);
    const end = new Date(endDate);

    const filteredOrders = allOrders.filter(order => {
        const orderDate = new Date(order.date.split('/').reverse().join('-'));
        return orderDate >= start && orderDate <= end;
    });

    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
    const orderCount = filteredOrders.length;
    const avgOrder = orderCount > 0 ? Math.round(totalRevenue / orderCount) : 0;

    const paymentBreakdown = {
        cash: filteredOrders.filter(o => o.paymentMethod === 'cash').reduce((sum, o) => sum + o.total, 0),
        upi: filteredOrders.filter(o => o.paymentMethod === 'upi').reduce((sum, o) => sum + o.total, 0),
        card: filteredOrders.filter(o => o.paymentMethod === 'card').reduce((sum, o) => sum + o.total, 0)
    };

    const container = document.getElementById('reportDisplay');
    container.innerHTML = `
        <h2>Sales Report</h2>
        <p><strong>Period:</strong> ${startDate} to ${endDate}</p>
        
        <div class="stats-grid" style="margin-top: 2rem;">
            <div class="stat-card revenue">
                <div class="stat-icon">💰</div>
                <div class="stat-info">
                    <div class="stat-label">Total Revenue</div>
                    <div class="stat-value">₹${totalRevenue.toLocaleString()}</div>
                </div>
            </div>
            <div class="stat-card orders">
                <div class="stat-icon">📦</div>
                <div class="stat-info">
                    <div class="stat-label">Total Orders</div>
                    <div class="stat-value">${orderCount}</div>
                </div>
            </div>
            <div class="stat-card average">
                <div class="stat-icon">📊</div>
                <div class="stat-info">
                    <div class="stat-label">Avg Order Value</div>
                    <div class="stat-value">₹${avgOrder}</div>
                </div>
            </div>
        </div>
        
        <h3 style="margin-top: 2rem;">Payment Breakdown</h3>
        <div style="margin-top: 1rem;">
            <p>💵 Cash: ₹${paymentBreakdown.cash.toLocaleString()}</p>
            <p>📱 UPI: ₹${paymentBreakdown.upi.toLocaleString()}</p>
            <p>💳 Card: ₹${paymentBreakdown.card.toLocaleString()}</p>
        </div>
    `;
}

function exportData() {
    loadOrders();
    const today = new Date().toLocaleDateString('en-IN');
    const todayOrders = allOrders.filter(o => o.date === today);

    // Prepare CSV data
    let csv = 'Token,Type,Table,Items,Total,Payment,Status,Time\n';

    todayOrders.forEach(order => {
        const items = order.items.map(i => `${i.name} x${i.quantity}`).join('; ');
        csv += `#${String(order.tokenNumber).padStart(3, '0')},`;
        csv += `${order.orderType},`;
        csv += `${order.tableNumber || 'N/A'},`;
        csv += `"${items}",`;
        csv += `${order.total},`;
        csv += `${order.paymentMethod},`;
        csv += `${order.status},`;
        csv += `${order.time}\n`;
    });

    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `idk-kitchen-orders-${today.replace(/\//g, '-')}.csv`;
    a.click();
}

// Make functions global
window.generateReport = generateReport;
window.exportData = exportData;
