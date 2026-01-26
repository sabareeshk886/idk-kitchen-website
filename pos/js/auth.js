// Authentication guard for POS system pages
// Add this to the top of billing.js, kitchen.js, and admin.js

function checkAuth() {
    const isAuthenticated = sessionStorage.getItem('posAuth') === 'true';

    if (!isAuthenticated) {
        // Store current page to redirect after login
        const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
        sessionStorage.setItem('targetPage', currentPage);

        // Redirect to login
        window.location.href = 'login.html';
        return false;
    }

    return true;
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.removeItem('posAuth');
        sessionStorage.removeItem('username');
        sessionStorage.removeItem('loginTime');
        window.location.href = 'login.html';
    }
}

// Session timeout after 8 hours
function checkSessionTimeout() {
    const loginTime = sessionStorage.getItem('loginTime');
    if (loginTime) {
        const elapsed = Date.now() - new Date(loginTime).getTime();
        const eightHours = 8 * 60 * 60 * 1000;

        if (elapsed > eightHours) {
            alert('Session expired. Please login again.');
            logout();
        }
    }
}

// Export functions
export { checkAuth, logout, checkSessionTimeout };
