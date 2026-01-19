// Global Search Functionality
let searchData = [];

// Initialize search data
function initializeSearch() {
    searchData = [
        // Pages
        { type: 'page', title: 'Home', url: 'index.html', icon: 'ph-house', description: 'Dashboard home' },
        { type: 'page', title: 'Dashboard', url: 'dashboard.html', icon: 'ph-squares-four', description: 'View your health dashboard' },
        { type: 'page', title: 'Prescription AI', url: 'prescription.html', icon: 'ph-file-text', description: 'Upload and analyze prescriptions' },
        { type: 'page', title: 'Prescription History', url: 'history.html', icon: 'ph-folder-open', description: 'View past prescriptions' },

        { type: 'page', title: 'Medical Assistant', url: 'assistant.html', icon: 'ph-chat-circle-dots', description: 'Chat with AI assistant' },
        { type: 'page', title: 'Appointments', url: 'appointments.html', icon: 'ph-calendar-check', description: 'Manage appointments' },
        { type: 'page', title: 'Patient Management', url: 'patients.html', icon: 'ph-users', description: 'Manage patient records' }, // Added Patient Management
        { type: 'page', title: 'Profile', url: 'profile.html', icon: 'ph-user', description: 'Edit your profile' },

        // Features
        { type: 'action', title: 'Upload Prescription', action: () => window.location.href = 'prescription.html', icon: 'ph-upload-simple', description: 'Scan a new prescription' },
        { type: 'action', title: 'Book Appointment', action: () => window.location.href = 'appointments.html', icon: 'ph-calendar-plus', description: 'Schedule doctor visit' },
        { type: 'action', title: 'Chat with AI', action: () => window.location.href = 'assistant.html', icon: 'ph-robot', description: 'Ask health questions' },

        { type: 'action', title: 'Dark Mode', action: toggleTheme, icon: 'ph-moon', description: 'Toggle theme' },

        // Get prescriptions from localStorage
        ...getPrescriptionSearchData()
    ];
}

function getPrescriptionSearchData() {
    const prescriptions = JSON.parse(localStorage.getItem('prescriptions')) || [];
    return prescriptions.map(p => ({
        type: 'prescription',
        title: `Prescription from ${p.doctor}`,
        url: 'history.html',
        icon: 'ph-file-text',
        description: `${p.medicines.join(', ')} - ${p.date}`,
        data: p
    }));
}

// Add search bar to header
function addSearchToHeader() {
    const pageTitle = document.getElementById('page-title');
    if (!pageTitle) return;

    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    searchContainer.innerHTML = `
        <i class="ph-bold ph-magnifying-glass search-icon"></i>
        <input 
            type="text" 
            class="search-input" 
            placeholder="Search pages, prescriptions, actions..." 
            id="global-search"
            autocomplete="off"
        >
        <div class="search-results" id="search-results"></div>
    `;

    pageTitle.parentElement.insertBefore(searchContainer, pageTitle.nextSibling);

    const searchInput = document.getElementById('global-search');
    const searchResults = document.getElementById('search-results');

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();

        if (query.length === 0) {
            searchResults.classList.remove('active');
            return;
        }

        performSearch(query);
    });

    // Close search on outside click
    document.addEventListener('click', (e) => {
        if (!searchContainer.contains(e.target)) {
            searchResults.classList.remove('active');
        }
    });

    // Keyboard shortcut: Ctrl/Cmd + K
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            searchInput.focus();
        }

        if (e.key === 'Escape') {
            searchResults.classList.remove('active');
            searchInput.blur();
        }
    });
}

function performSearch(query) {
    const results = searchData.filter(item => {
        return item.title.toLowerCase().includes(query) ||
            (item.description && item.description.toLowerCase().includes(query));
    }).slice(0, 6); // Limit to 6 results

    displaySearchResults(results, query);
}

function displaySearchResults(results, query) {
    const searchResults = document.getElementById('search-results');

    if (results.length === 0) {
        searchResults.innerHTML = `
            <div class="search-result-item" style="text-align: center; color: var(--text-muted);">
                <i class="ph ph-magnifying-glass" style="font-size: 32px; opacity: 0.5;"></i>
                <p style="margin-top: 8px;">No results found for "${query}"</p>
            </div>
        `;
        searchResults.classList.add('active');
        return;
    }

    searchResults.innerHTML = results.map(item => {
        const highlightedTitle = highlightText(item.title, query);
        const highlightedDesc = item.description ? highlightText(item.description, query) : '';

        return `
            <div class="search-result-item" onclick="handleSearchClick(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                <i class="ph ${item.icon}" style="font-size: 20px; color: var(--primary-color); margin-right: 12px;"></i>
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: var(--text-main);">${highlightedTitle}</div>
                    ${highlightedDesc ? `<div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 2px;">${highlightedDesc}</div>` : ''}
                </div>
                <i class="ph ph-arrow-right" style="color: var(--text-muted);"></i>
            </div>
        `;
    }).join('');

    searchResults.classList.add('active');
}

function highlightText(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark style="background: var(--accent-color); padding: 2px 4px; border-radius: 3px;">$1</mark>');
}

function handleSearchClick(item) {
    const searchResults = document.getElementById('search-results');
    searchResults.classList.remove('active');
    document.getElementById('global-search').value = '';

    if (item.type === 'action' && item.action) {
        if (typeof item.action === 'string') {
            eval(item.action);
        } else {
            item.action();
        }
    } else if (item.url) {
        window.location.href = item.url;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for layout.js to inject header first
    setTimeout(() => {
        initializeSearch();
        addSearchToHeader();
    }, 100);
});
