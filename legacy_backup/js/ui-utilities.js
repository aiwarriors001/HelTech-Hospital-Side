// ============================================
// TOAST NOTIFICATION SYSTEM
// ============================================

let toastContainer = null;

function createToastContainer() {
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    return toastContainer;
}

function showToast(message, type = 'info', duration = 3000) {
    const container = createToastContainer();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: 'ph-check-circle',
        error: 'ph-x-circle',
        warning: 'ph-warning-circle',
        info: 'ph-info'
    };

    toast.innerHTML = `
        <i class="ph-fill ${icons[type] || icons.info}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove after duration
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ============================================
// LOADING PROGRESS BAR
// ============================================

function showLoadingBar() {
    let progressBar = document.getElementById('global-progress-bar');
    if (!progressBar) {
        progressBar = document.createElement('div');
        progressBar.id = 'global-progress-bar';
        progressBar.className = 'loading-progress-bar';
        progressBar.innerHTML = '<div class="loading-progress-fill"></div>';
        document.body.appendChild(progressBar);
    }

    progressBar.style.display = 'block';
    const fill = progressBar.querySelector('.loading-progress-fill');
    fill.style.width = '0%';

    // Animate to 90%
    setTimeout(() => fill.style.width = '90%', 50);
}

function hideLoadingBar() {
    const progressBar = document.getElementById('global-progress-bar');
    if (progressBar) {
        const fill = progressBar.querySelector('.loading-progress-fill');
        fill.style.width = '100%';
        setTimeout(() => {
            progressBar.style.display = 'none';
            fill.style.width = '0%';
        }, 200);
    }
}

// ============================================
// CONFETTI CELEBRATION
// ============================================

function celebrateWithConfetti() {
    const colors = ['#00796b', '#26a69a', '#ffca28', '#ff6f00', '#d32f2f'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';

        document.body.appendChild(confetti);

        setTimeout(() => confetti.remove(), 4000);
    }
}

// ============================================
// PROFILE COMPLETION CIRCLE
// ============================================

function createProgressRing(percentage, size = 120) {
    const radius = (size - 10) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return `
        <svg class="progress-ring" width="${size}" height="${size}">
            <circle
                class="progress-ring-bg"
                stroke="#e2e8f0"
                stroke-width="8"
                fill="transparent"
                r="${radius}"
                cx="${size / 2}"
                cy="${size / 2}"
            />
            <circle
                class="progress-ring-circle"
                stroke="url(#gradient)"
                stroke-width="8"
                fill="transparent"
                r="${radius}"
                cx="${size / 2}"
                cy="${size / 2}"
                style="
                    stroke-dasharray: ${circumference} ${circumference};
                    stroke-dashoffset: ${offset};
                    transform: rotate(-90deg);
                    transform-origin: 50% 50%;
                    transition: stroke-dashoffset 1s ease;
                "
                stroke-linecap="round"
            />
            <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#00796b;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#26a69a;stop-opacity:1" />
                </linearGradient>
            </defs>
        </svg>
        <div class="progress-ring-value">${percentage}%</div>
    `;
}

function calculateProfileCompletion(userData) {
    const fields = [
        'name', 'email', 'phone',
        'dateOfBirth', 'gender', 'bloodGroup',
        'address', 'emergencyName', 'emergencyPhone', 'allergies'
    ];

    const filledFields = fields.filter(field => userData[field] && userData[field].toString().trim() !== '');
    return Math.round((filledFields.length / fields.length) * 100);
}

// ============================================
// SMOOTH PAGE TRANSITIONS
// ============================================

function transitionToPage(url) {
    showLoadingBar();

    // Add fade-out to current page
    document.body.style.opacity = '0';

    setTimeout(() => {
        window.location.href = url;
    }, 300);
}

// ============================================
// BUTTON LOADING STATE
// ============================================

function setButtonLoading(buttonElement, isLoading) {
    if (isLoading) {
        buttonElement.classList.add('button-loading');
        buttonElement.setAttribute('disabled', 'true');
        buttonElement.dataset.originalText = buttonElement.textContent;
    } else {
        buttonElement.classList.remove('button-loading');
        buttonElement.removeAttribute('disabled');
        if (buttonElement.dataset.originalText) {
            buttonElement.textContent = buttonElement.dataset.originalText;
        }
    }
}

// ============================================
// FORM VALIDATION ANIMATIONS
// ============================================

function showFieldSuccess(inputElement) {
    const wrapper = inputElement.closest('.floating-label-input') || inputElement.parentElement;
    wrapper.classList.remove('error');
    wrapper.classList.add('success');

    setTimeout(() => wrapper.classList.remove('success'), 2000);
}

function showFieldError(inputElement, message) {
    const wrapper = inputElement.closest('.floating-label-input') || inputElement.parentElement;
    wrapper.classList.remove('success');
    wrapper.classList.add('error');

    // Shake animation
    inputElement.style.animation = 'shake 0.5s ease';
    setTimeout(() => inputElement.style.animation = '', 500);

    if (message) {
        showToast(message, 'error');
    }
}

// ============================================
// INITIALIZE ON PAGE LOAD
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Fade in body
    document.body.style.opacity = '1';

    // Add ripple effect to all buttons with ripple-button class
    document.querySelectorAll('.ripple-button').forEach(button => {
        button.addEventListener('click', function (e) {
            const ripple = document.createElement('span');
            ripple.className = 'ripple-effect';

            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = e.clientX - rect.left - size / 2 + 'px';
            ripple.style.top = e.clientY - rect.top - size / 2 + 'px';

            this.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });
    });
});

// ============================================
// SKELETON LOADING
// ============================================

function showSkeleton(containerElement) {
    containerElement.innerHTML = `
        <div class="skeleton skeleton-card" style="margin-bottom: 16px;"></div>
        <div class="skeleton skeleton-text" style="width: 80%; margin-bottom: 8px;"></div>
        <div class="skeleton skeleton-text" style="width: 60%; margin-bottom: 8px;"></div>
        <div class="skeleton skeleton-text" style="width: 90%;"></div>
    `;
}

// ============================================
// SMOOTH SCROLL
// ============================================

function smoothScrollTo(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Export functions for global use
window.showToast = showToast;
window.showLoadingBar = showLoadingBar;
window.hideLoadingBar = hideLoadingBar;
window.celebrateWithConfetti = celebrateWithConfetti;
window.createProgressRing = createProgressRing;
window.calculateProfileCompletion = calculateProfileCompletion;
window.transitionToPage = transitionToPage;
window.setButtonLoading = setButtonLoading;
window.showFieldSuccess = showFieldSuccess;
window.showFieldError = showFieldError;
window.showSkeleton = showSkeleton;
window.smoothScrollTo = smoothScrollTo;
