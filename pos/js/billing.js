// IDK Kitchen POS - Billing System
// Menu Data
const menu = {
    idly: [
        { id: 1, name: "Idly Sambar", price: 40, category: "idly" },
        { id: 2, name: "Ghee Kheema Idly", price: 80, category: "idly" },
        { id: 3, name: "Kheema Button Idly", price: 70, category: "idly" },
        { id: 4, name: "Kheema Thatte Idly", price: 90, category: "idly" },
        { id: 5, name: "Kheema Paddu", price: 75, category: "idly" },
        { id: 6, name: "Kheema Stuffed Idly", price: 85, category: "idly" },
        { id: 7, name: "Idly Kheema Gojju", price: 70, category: "idly" }
    ],
    dosa: [
        { id: 8, name: "Plain Dosa", price: 50, category: "dosa" },
        { id: 9, name: "Plain Dosa with Kheema Gojju", price: 90, category: "dosa" },
        { id: 10, name: "Kheema Masala Dosa", price: 110, category: "dosa" },
        { id: 11, name: "Kheema Open Dosa", price: 120, category: "dosa" }
    ],
    kheema: [
        { id: 12, name: "Chicken Kheema Uttapam", price: 100, category: "kheema", signature: true },
        { id: 13, name: "Chicken Kheema Upma", price: 95, category: "kheema", signature: true },
        { id: 14, name: "Kheema Vada", price: 60, category: "kheema" },
        { id: 15, name: "Kheema Pulav", price: 130, category: "kheema" },
        { id: 16, name: "Kheema Shavige", price: 85, category: "kheema" },
        { id: 17, name: "Kheema Bonda Soup", price: 70, category: "kheema" },
        { id: 18, name: "Kheema Stuffed Paratha", price: 90, category: "kheema" },
        { id: 19, name: "Kheema Pav", price: 80, category: "kheema" }
    ],
    rice: [
        { id: 20, name: "Poori with Kheema Gojju", price: 110, category: "rice" },
        { id: 21, name: "Ghee Rice with Kheema Gojju", price: 140, category: "rice" }
    ]
};

// State
let cart = [];
let currentCategory = 'all';
let selectedPaymentMethod = 'cash';
let tokenNumber = 1;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    loadTokenNumber();
    renderMenu();
    setupEventListeners();
    updateTime();
    setInterval(updateTime, 1000);
}

function loadTokenNumber() {
    const lastToken = localStorage.getItem('lastTokenNumber');
    if (lastToken) {
        tokenNumber = parseInt(lastToken) + 1;
    }
    updateTokenDisplay();
}

function updateTokenDisplay() {
    document.getElementById('tokenNumber').textContent = String(tokenNumber).padStart(3, '0');
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

function setupEventListeners() {
    // Category tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentCategory = tab.dataset.category;
            renderMenu();
        });
    });

    // Order type change
    document.getElementById('orderType').addEventListener('change', (e) => {
        const tableRow = document.getElementById('tableRow');
        if (e.target.value === 'takeaway') {
            tableRow.style.display = 'none';
        } else {
            tableRow.style.display = 'flex';
        }
    });

    // Payment methods
    document.querySelectorAll('.payment-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.payment-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedPaymentMethod = btn.dataset.method;
        });
    });
}

function renderMenu() {
    const menuGrid = document.getElementById('menuGrid');
    menuGrid.innerHTML = '';

    let items = [];
    if (currentCategory === 'all') {
        items = [...menu.idly, ...menu.dosa, ...menu.kheema, ...menu.rice];
    } else {
        items = menu[currentCategory] || [];
    }

    items.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'menu-item' + (item.signature ? ' signature' : '');
        itemEl.onclick = () => addToCart(item);

        itemEl.innerHTML = `
            <div class="item-name">${item.name}</div>
            <div class="item-price">₹${item.price}</div>
            ${item.signature ? '<div class="signature-badge">SIGNATURE</div>' : ''}
        `;

        menuGrid.appendChild(itemEl);
    });
}

function addToCart(item) {
    const existing = cart.find(i => i.id === item.id);

    if (existing) {
        existing.quantity++;
    } else {
        cart.push({
            ...item,
            quantity: 1
        });
    }

    renderCart();
}

function renderCart() {
    const cartItems = document.getElementById('cartItems');

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <p>🛒 Cart is empty</p>
                <small>Add items from menu</small>
            </div>
        `;
        updateTotals();
        return;
    }

    cartItems.innerHTML = '';
    cart.forEach((item, index) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item';

        itemEl.innerHTML = `
            <div class="item-details">
                <h4>${item.name}</h4>
                <div class="price">₹${item.price} each</div>
            </div>
            <div class="quantity-controls">
                <button class="qty-btn" onclick="decreaseQuantity(${index})">−</button>
                <span class="quantity">${item.quantity}</span>
                <button class="qty-btn" onclick="increaseQuantity(${index})">+</button>
            </div>
            <div class="item-total">₹${item.price * item.quantity}</div>
        `;

        cartItems.appendChild(itemEl);
    });

    updateTotals();
}

function increaseQuantity(index) {
    cart[index].quantity++;
    renderCart();
}

function decreaseQuantity(index) {
    if (cart[index].quantity > 1) {
        cart[index].quantity--;
    } else {
        cart.splice(index, 1);
    }
    renderCart();
}

function updateTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    document.getElementById('subtotal').textContent = `₹${subtotal}`;
    document.getElementById('total').textContent = `₹${subtotal}`;

    // Enable/disable submit button
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = cart.length === 0;
}

function clearCart() {
    if (cart.length === 0) return;

    if (confirm('Clear all items from cart?')) {
        cart = [];
        renderCart();
    }
}

async function placeOrder() {
    if (cart.length === 0) return;

    const orderType = document.getElementById('orderType').value;
    const tableNumber = document.getElementById('tableNumber').value;

    if (orderType === 'dine-in' && !tableNumber) {
        alert('Please enter table number');
        return;
    }

    const order = {
        tokenNumber: tokenNumber,
        orderType: orderType,
        tableNumber: orderType === 'dine-in' ? tableNumber : null,
        items: cart.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
        })),
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        paymentMethod: selectedPaymentMethod,
        status: 'pending',
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString('en-IN'),
        time: new Date().toLocaleTimeString('en-IN')
    };

    // Save to localStorage (will be replaced with Firebase)
    saveOrder(order);

    // Show confirmation
    showConfirmation(order);

    // Update token number
    tokenNumber++;
    localStorage.setItem('lastToken Number', tokenNumber - 1);
    updateTokenDisplay();

    // Clear cart
    cart = [];
    renderCart();

    // Reset form
    document.getElementById('tableNumber').value = '';
}

function saveOrder(order) {
    // Get existing orders
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Update today's sales
    updateDailySales(order);
}

function updateDailySales(order) {
    const today = new Date().toLocaleDateString('en-IN');
    const sales = JSON.parse(localStorage.getItem('dailySales') || '{}');

    if (!sales[today]) {
        sales[today] = {
            revenue: 0,
            orders: 0,
            cash: 0,
            upi: 0,
            card: 0
        };
    }

    sales[today].revenue += order.total;
    sales[today].orders += 1;
    sales[today][order.paymentMethod] += order.total;

    localStorage.setItem('dailySales', JSON.stringify(sales));
}

function showConfirmation(order) {
    const modal = document.getElementById('confirmModal');
    document.getElementById('confirmedToken').textContent = String(order.tokenNumber).padStart(3, '0');
    document.getElementById('confirmedType').textContent =
        order.orderType === 'dine-in'
            ? `Dine-in - Table ${order.tableNumber}`
            : 'Takeaway';

    modal.classList.add('show');

    // Play success sound (optional)
    // playSound('success');
}

function closeModal() {
    document.getElementById('confirmModal').classList.remove('show');
}

// Make functions global
window.addToCart = addToCart;
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
window.clearCart = clearCart;
window.placeOrder = placeOrder;
window.closeModal = closeModal;
