// Dashboard specific variables
let currentUser = null;
let isLoggedIn = false;

// Function to check login status from localStorage
function checkLoginStatus() {
    const storedLoginStatus = localStorage.getItem('isLoggedIn');
    const storedUser = localStorage.getItem('currentUser');
    
    console.log("Checking login status:", storedLoginStatus);
    
    if (storedLoginStatus === 'true' && storedUser) {
        try {
            isLoggedIn = true;
            currentUser = JSON.parse(storedUser);
            updateUIWithUserData();
        } catch (error) {
            console.error('Error parsing stored user data:', error);
            redirectToHome(); // Redirect to home if data is invalid
        }
    } else {
        // Not logged in, redirect to home page
        redirectToHome();
    }
}

// Redirect to home page if not logged in
function redirectToHome() {
    console.log("User not logged in, redirecting to home...");
    window.location.href = "index.html";
}

// Update UI with user data
function updateUIWithUserData() {
    // Update all user display name elements
    const userDisplayNames = document.querySelectorAll('.user-display-name');
    userDisplayNames.forEach(el => {
        el.textContent = currentUser.name || currentUser.email;
    });
    
    // Fill profile form
    fillProfileForm();
}

// Fill profile form with user data
function fillProfileForm() {
    if (currentUser) {
        const nameInput = document.getElementById('profile-name');
        const emailInput = document.getElementById('profile-email');
        const phoneInput = document.getElementById('profile-phone');
        
        if (nameInput) nameInput.value = currentUser.name || '';
        if (emailInput) emailInput.value = currentUser.email || '';
        if (phoneInput) phoneInput.value = currentUser.phone || '';
    }
}

// Function to handle tab switching
function switchTab(tabName) {
    console.log(`Switching to tab: ${tabName}`);
    
    // Get all tab buttons and content
    const tabBtns = document.querySelectorAll('.dashboard-tab');
    const tabContents = document.querySelectorAll('.dashboard-content');
    
    // Hide all tabs and remove active classes
    tabContents.forEach(content => {
        content.classList.add('hidden');
    });
    
    tabBtns.forEach(btn => {
        btn.classList.remove('text-primary-400', 'border-primary-400', 'active');
        btn.classList.add('text-gray-400', 'hover:text-primary-300', 'border-transparent');
        btn.setAttribute('aria-selected', 'false');
    });
    
    // Show the selected tab
    const selectedContent = document.getElementById(`${tabName}-tab-content`);
    const selectedBtn = document.getElementById(`${tabName}-tab-btn`);
    
    if (selectedContent) {
        selectedContent.classList.remove('hidden');
    }
    
    if (selectedBtn) {
        selectedBtn.classList.add('text-primary-400', 'border-primary-400', 'active');
        selectedBtn.classList.remove('text-gray-400', 'hover:text-primary-300', 'border-transparent');
        selectedBtn.setAttribute('aria-selected', 'true');
    }
}

// Function to show notifications
function showConfirmation(message, isError = false) {
    const confirmationMessage = document.getElementById('confirmation-message');
    const confirmationText = document.getElementById('confirmation-text');
    const confirmationIcon = document.getElementById('confirmation-icon');
    
    if (!confirmationMessage || !confirmationText) return;

    confirmationText.textContent = message;
    
    // Show/hide the appropriate icon
    if (confirmationIcon) {
        confirmationIcon.innerHTML = isError ? '&#xea0e;' : '&#xe96c;';
        confirmationIcon.classList.remove('hidden');
    }
    
    confirmationMessage.classList.remove('opacity-0', 'translate-y-6');
    confirmationMessage.classList.add('opacity-100', 'translate-y-0');

    if(isError) {
        confirmationMessage.classList.remove('bg-green-600');
        confirmationMessage.classList.add('bg-red-600');
    } else {
         confirmationMessage.classList.remove('bg-red-600');
         confirmationMessage.classList.add('bg-green-600');
    }

    // Clear any existing timeout
    if (window.confirmationTimeout) {
        clearTimeout(window.confirmationTimeout);
    }
    
    // Set a new timeout
    window.confirmationTimeout = setTimeout(() => {
         confirmationMessage.classList.remove('opacity-100', 'translate-y-0');
         confirmationMessage.classList.add('opacity-0', 'translate-y-6');
    }, 5000); 
}

// Function to handle logout
function handleLogout() {
    // Clear user data from localStorage
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    
    // Redirect to home page
    window.location.href = "index.html";
}

// Function to toggle user dropdown menu
function toggleUserDropdown() {
    const dropdownMenu = document.getElementById('user-dropdown-menu');
    if (dropdownMenu) {
        dropdownMenu.classList.toggle('hidden');
        
        // Add event listener to close dropdown when clicking outside
        if (!dropdownMenu.classList.contains('hidden')) {
            setTimeout(() => {
                document.addEventListener('click', closeUserDropdownOnClickOutside);
            }, 10);
        }
    }
}

// Function to close user dropdown when clicking outside
function closeUserDropdownOnClickOutside(e) {
    const dropdownBtn = document.getElementById('user-dropdown-btn');
    const dropdownMenu = document.getElementById('user-dropdown-menu');
    
    if (dropdownBtn && dropdownMenu && 
        !dropdownBtn.contains(e.target) && 
        !dropdownMenu.contains(e.target)) {
        
        dropdownMenu.classList.add('hidden');
        document.removeEventListener('click', closeUserDropdownOnClickOutside);
    }
}

// Function to toggle mobile menu
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const menuButton = document.getElementById('mobile-menu-btn');
    
    if (mobileMenu && menuButton) {
        const isExpanded = menuButton.getAttribute('aria-expanded') === 'true';
        
        if (isExpanded) {
            // Close the menu
            mobileMenu.classList.add('hidden');
            menuButton.setAttribute('aria-expanded', 'false');
        } else {
            // Open the menu
            mobileMenu.classList.remove('hidden');
            menuButton.setAttribute('aria-expanded', 'true');
        }
    }
}

// Function to open modal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent scrolling behind modal
        
        // Add animation classes for smooth entry
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.classList.remove('animate-slide-down');
            modalContent.classList.add('animate-slide-up');
        }
    }
}

// Function to close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        // Add animation for smooth exit
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.classList.remove('animate-slide-up');
            modalContent.classList.add('animate-slide-down');
            
            // After animation completes, hide the modal
            setTimeout(() => {
                modal.style.display = 'none';
                document.body.style.overflow = ''; // Restore scrolling
                if (modalContent) {
                    modalContent.classList.remove('animate-slide-down');
                }
            }, 300);
        } else {
            // If no modal content found, just hide it immediately
            modal.style.display = 'none';
            document.body.style.overflow = ''; 
        }
    }
}

// Function to initialize date inputs
function initScheduleForm() {
    // Set minimum date to today for schedule form
    const scheduleDate = document.getElementById('schedule-date');
    if (scheduleDate) {
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        scheduleDate.min = formattedDate;
        scheduleDate.value = formattedDate;
    }
    
    // Set default time to current time + 30 minutes
    const scheduleTime = document.getElementById('schedule-time');
    if (scheduleTime) {
        const now = new Date();
        now.setMinutes(now.getMinutes() + 30);
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        scheduleTime.value = `${hours}:${minutes}`;
    }
}

// Function to check network status
function checkNetworkStatus() {
    const offlineAlert = document.getElementById('offline-alert');
    
    if (!navigator.onLine) {
        // We're offline
        if (offlineAlert) {
            offlineAlert.classList.remove('translate-y-full');
            offlineAlert.classList.add('translate-y-0');
        }
        showConfirmation("You're offline. Some features may be unavailable.", true);
    } else {
        // We're online
        if (offlineAlert) {
            offlineAlert.classList.remove('translate-y-0');
            offlineAlert.classList.add('translate-y-full');
        }
    }
}

// Set up event listeners
function setupEventListeners() {
    // Set current year in footer
    const currentYearElement = document.getElementById('current-year');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }
    
    // Tab switching buttons
    const tabButtons = document.querySelectorAll('.dashboard-tab');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.id.replace('-tab-btn', '');
            switchTab(tabName);
        });
    });
    
    // User dropdown toggle
    const userDropdownBtn = document.getElementById('user-dropdown-btn');
    if (userDropdownBtn) {
        userDropdownBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleUserDropdown();
        });
    }
    
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }
    
    // Logout buttons
    const logoutLinks = document.querySelectorAll('#logout-link, #mobile-logout-link');
    logoutLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    });
    
    // Profile form submission
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('profile-name').value.trim();
            const email = document.getElementById('profile-email').value.trim();
            const phone = document.getElementById('profile-phone').value.trim();
            
            if (!name || !email) {
                showConfirmation('Please fill in all required fields.', true);
                return;
            }
            
            // Update user data
            currentUser = {
                ...currentUser,
                name,
                email,
                phone
            };
            
            // Update local storage
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Update UI
            updateUIWithUserData();
            
            // Show confirmation
            showConfirmation('Profile updated successfully!');
        });
    }
    
    // Add Place form submission
    const addPlaceForm = document.getElementById('add-place-form');
    if (addPlaceForm) {
        addPlaceForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('place-name').value.trim();
            const address = document.getElementById('place-address').value.trim();
            
            if (!name || !address) {
                showConfirmation('Please enter both name and address.', true);
                return;
            }
            
            // In a real app, this would save to the user's account
            showConfirmation(`Added "${name}" to your saved places.`);
            addPlaceForm.reset();
        });
    }
    
    // Close notification button
    const closeNotificationBtn = document.getElementById('close-notification');
    if (closeNotificationBtn) {
        closeNotificationBtn.addEventListener('click', () => {
            const confirmationMessage = document.getElementById('confirmation-message');
            if (confirmationMessage) {
                confirmationMessage.classList.remove('opacity-100', 'translate-y-0');
                confirmationMessage.classList.add('opacity-0', 'translate-y-6');
            }
        });
    }
    
    // Schedule ride link/button
    const scheduleRideLinks = document.querySelectorAll('#schedule-ride-nav, #schedule-ride-nav-mobile');
    scheduleRideLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('schedule-modal');
        });
    });
    
    // Modal close buttons
    const modalCloseBtns = document.querySelectorAll('.modal-close-btn');
    modalCloseBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const modal = btn.closest('[id]').id;
            closeModal(modal);
        });
    });
    
    // Modal overlays
    const modalOverlays = document.querySelectorAll('[id$="-modal-overlay"]');
    modalOverlays.forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                const modal = overlay.closest('[id]').id;
                closeModal(modal);
            }
        });
    });
    
    // Schedule form
    const scheduleForm = document.getElementById('schedule-form');
    if (scheduleForm) {
        scheduleForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // In a real app, this would schedule a ride
            showConfirmation('Your ride has been scheduled!');
            closeModal('schedule-modal');
        });
    }
    
    // Payment method button
    const addPaymentMethodBtn = document.getElementById('add-payment-method-btn');
    if (addPaymentMethodBtn) {
        addPaymentMethodBtn.addEventListener('click', () => {
            showConfirmation('Payment method functionality would be implemented with a payment processor.', true);
        });
    }
    
    // Network status listeners
    window.addEventListener('online', checkNetworkStatus);
    window.addEventListener('offline', checkNetworkStatus);
}

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    console.log("Dashboard page loaded");
    
    // Check if user is logged in
    checkLoginStatus();
    
    // Initialize form defaults
    initScheduleForm();
    
    // Set up event listeners
    setupEventListeners();
    
    // Check network status
    checkNetworkStatus();
});
