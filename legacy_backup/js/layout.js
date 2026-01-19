document.addEventListener('DOMContentLoaded', () => {
    // Get user data from session
    const userData = getUserData();
    const appContainer = document.body;

    // Initialize role-based theme colors
    initializeRoleTheme(userData.role);

    // Detect if we're in a subfolder and adjust paths accordingly
    const currentPath = window.location.pathname;
    const pathPrefix = currentPath.includes('/patient/') || currentPath.includes('/hospital/') ? '../' : '';

    // Helper function to get initials (max 2 characters)
    function getInitials(name) {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length === 1) {
            return parts[0].charAt(0).toUpperCase();
        }
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }

    // 1. Build Sidebar based on role
    let sidebarHTML = '';

    if (userData.role === 'patient') {
        // PATIENT NAVIGATION
        sidebarHTML = `
        <nav class="sidebar">
            <div class="brand">
                <i class="ph-fill ph-plus-circle"></i>
                <h1>MedSmart</h1>
            </div>
            <div style="padding: 12px 16px; background: linear-gradient(135deg, var(--primary-light), #b2dfdb); border-radius: 8px; margin-bottom: 20px; text-align: center;">
                <i class="ph-fill ph-user-circle" style="font-size: 16px; color: var(--primary-color);"></i>
                <span style="font-size: 0.85rem; font-weight: 600; color: var(--primary-dark); margin-left: 8px;">Patient Mode</span>
            </div>
            <ul class="nav-menu">
                <a href="${pathPrefix}index.html" class="nav-item" data-page="index.html">
                    <i class="ph ph-house"></i> <span>Home</span>
                </a>
                <a href="${pathPrefix}dashboard.html" class="nav-item" data-page="dashboard.html">
                    <i class="ph ph-squares-four"></i> <span>Dashboard</span>
                </a>
                <a href="${pathPrefix}prescription.html" class="nav-item" data-page="prescription.html">
                    <i class="ph ph-file-text"></i> <span>Upload Prescription</span>
                </a>
                <a href="${pathPrefix}history.html" class="nav-item" data-page="history.html">
                    <i class="ph ph-folder-open"></i> <span>My History</span>
                </a>
                <a href="${pathPrefix}assistant.html" class="nav-item" data-page="assistant.html">
                    <i class="ph ph-chat-circle-dots"></i> <span>AI Assistant</span>
                </a>
                <a href="${pathPrefix}appointments.html" class="nav-item" data-page="appointments.html">
                    <i class="ph ph-calendar-check"></i> <span>My Appointments</span>
                </a>
                <a href="${pathPrefix}profile.html" class="nav-item" data-page="profile.html">
                    <i class="ph ph-user"></i> <span>Profile</span>
                </a>
            </ul>
        </nav>
        `;
    } else {
        // HOSPITAL NAVIGATION (No prescription upload or appointments booking)
        sidebarHTML = `
        <nav class="sidebar">
            <div class="brand">
                <i class="ph-fill ph-hospital"></i>
                <h1>MedSmart</h1>
            </div>
            <div style="padding: 12px 16px; background: linear-gradient(135deg, #e3f2fd, #bbdefb); border-radius: 8px; margin-bottom: 20px; text-align: center;">
                <i class="ph-fill ph-hospital" style="font-size: 16px; color: #0288d1;"></i>
                <span style="font-size: 0.85rem; font-weight: 600; color: #01579b; margin-left: 8px;">Hospital Mode</span>
            </div>
            <ul class="nav-menu">
                <a href="${pathPrefix}index.html" class="nav-item" data-page="index.html">
                    <i class="ph ph-house"></i> <span>Home</span>
                </a>
                <a href="${pathPrefix}dashboard.html" class="nav-item" data-page="dashboard.html">
                    <i class="ph ph-squares-four"></i> <span>Dashboard</span>
                </a>
                <a href="${pathPrefix}patients.html" class="nav-item" data-page="patients.html">
                    <i class="ph ph-users"></i> <span>Patient Management</span>
                </a>
                <a href="${pathPrefix}assistant.html" class="nav-item" data-page="assistant.html">
                    <i class="ph ph-chat-circle-dots"></i> <span>AI Assistant</span>
                </a>
                <a href="${pathPrefix}profile.html" class="nav-item" data-page="profile.html">
                    <i class="ph ph-hospital"></i> <span>Hospital Profile</span>
                </a>
            </ul>
        </nav>
        `;
    }

    // Prepend Sidebar
    document.body.insertAdjacentHTML('afterbegin', sidebarHTML);

    // 2. Inject Header functionality (if header exists)
    const headerHTML = `
        <header class="top-bar">
            <div class="page-title" id="page-title">
                Smart Patient Support & Navigation Platform
            </div>
            
            <div class="top-bar-right">
                <button class="theme-toggle" onclick="toggleTheme()" title="Toggle Theme">
                    <i class="ph ph-moon" id="theme-icon"></i>
                </button>
                <div class="user-profile-preview">
                    <span style="color: var(--text-main);">${userData.name}</span>
                    <div class="avatar">${getInitials(userData.name)}</div>
                </div>
            </div>
        </header>
    `;

    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.insertAdjacentHTML('afterbegin', headerHTML);
    }

    // 3. Set Active State
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        if (item.getAttribute('href') === currentPage) {
            item.classList.add('active');
        }
    });
});

// Function to initialize role-based theme
function initializeRoleTheme(role) {
    const root = document.documentElement;

    if (role === 'hospital') {
        // Hospital Blue Theme
        root.style.setProperty('--primary-color', '#0288d1');
        root.style.setProperty('--primary-light', '#e3f2fd');
        root.style.setProperty('--primary-dark', '#01579b');
    } else {
        // Patient Teal/Green Theme (default)
        root.style.setProperty('--primary-color', '#00796b');
        root.style.setProperty('--primary-light', '#e0f2f1');
        root.style.setProperty('--primary-dark', '#004d40');
    }
}
