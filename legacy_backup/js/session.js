// Simple Session Management (No Authentication)

// Get user role from localStorage or default to 'patient'
function getUserRole() {
    return localStorage.getItem('userRole') || 'patient';
}

// Set user role
function setUserRole(role) {
    localStorage.setItem('userRole', role);
    // Reload to apply changes
    window.location.reload();
}

// Get user data - returns default profile based on role
function getUserData() {
    const role = getUserRole();

    if (role === 'hospital') {
        return {
            id: 'hospital_001',
            role: 'hospital',
            name: 'City General Hospital',
            hospitalName: 'City General Hospital',
            email: 'admin@cityhospital.com',
            phone: '+1 234 567 8900',
            address: '123 Medical Center Drive',
            profileComplete: true
        };
    } else {
        // Default patient profile
        return {
            id: 'patient_001',
            role: 'patient',
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+1 234 567 8901',
            dateOfBirth: '1990-01-15',
            gender: 'male',
            bloodGroup: 'O+',
            address: '456 Patient Street',
            emergencyName: 'Jane Doe',
            emergencyPhone: '+1 234 567 8902',
            allergies: 'None',
            profileComplete: true
        };
    }
}

// Initialize role based on current folder
function initializeRole() {
    const currentPath = window.location.pathname;

    // Auto-detect role from URL path
    if (currentPath.includes('/hospital/')) {
        localStorage.setItem('userRole', 'hospital');
    } else if (currentPath.includes('/patient/')) {
        localStorage.setItem('userRole', 'patient');
    }
    // If no role is set and not in a specific folder, default to patient
    else if (!localStorage.getItem('userRole')) {
        localStorage.setItem('userRole', 'patient');
    }
}

// Call this on page load
if (typeof window !== 'undefined') {
    initializeRole();
}
