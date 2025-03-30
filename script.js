// Add Islamic UI enhancements and animations
document.addEventListener('DOMContentLoaded', function() {
    // Add Islamic greeting on page load
    createIslamicGreeting();
    
    // Add scroll reveal animation to sections
    addScrollRevealAnimation();
    
    // Add decorative elements
    addIslamicDecorativeElements();
    
    // Add prayer time reminder
    setupPrayerTimeReminder();
    
    // Add Qibla compass
    addQiblaCompass();
    
    // Enhance geolocation button
    enhanceLocationButtons();
    
    // Add scroll down arrow
    addScrollDownArrow();
    
    // Add Arabic font for Islamic text
    addArabicFont();
    
    // Set current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // Add vehicle type tooltips
    addVehicleTooltips();
    
    // Override existing form submissions
    overrideFormSubmissions();
});

// Create and show Islamic greeting on first visit
function createIslamicGreeting() {
    // Check if user has seen the greeting before
    if (localStorage.getItem('hasSeenGreeting')) {
        return;
    }
    
    const greeting = document.createElement('div');
    greeting.className = 'salam-greeting';
    greeting.innerHTML = `
        <div class="salam-greeting-content">
            <div class="arabic-text">السلام عليكم</div>
            <h1>Welcome to Salaam Rides</h1>
            <p>Safe and reliable transportation service in Guyana</p>
            <p>بسم الله الرحمن الرحيم</p>
            <button id="close-greeting">Begin Your Journey</button>
        </div>
    `;
    
    document.body.appendChild(greeting);
    
    // Show greeting with slight delay
    setTimeout(() => {
        greeting.classList.add('show');
    }, 500);
    
    // Close greeting
    document.getElementById('close-greeting').addEventListener('click', () => {
        greeting.classList.remove('show');
        setTimeout(() => {
            greeting.remove();
        }, 500);
        localStorage.setItem('hasSeenGreeting', 'true');
    });
}

// Add scroll reveal animation to all sections
function addScrollRevealAnimation() {
    // Add the scroll-reveal class to all sections
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.classList.add('scroll-reveal');
    });
    
    // Also add to feature cards, reward section, etc.
    const elements = document.querySelectorAll('.bg-gray-700\\/50, .max-w-lg');
    elements.forEach(el => {
        el.classList.add('scroll-reveal');
    });
    
    // Function to check if element is in viewport
    function checkReveal() {
        const revealElements = document.querySelectorAll('.scroll-reveal');
        const windowHeight = window.innerHeight;
        
        revealElements.forEach(el => {
            const revealTop = el.getBoundingClientRect().top;
            const revealPoint = 150;
            
            if (revealTop < windowHeight - revealPoint) {
                el.classList.add('revealed');
            }
        });
    }
    
    // Check on load and scroll
    window.addEventListener('scroll', checkReveal);
    window.addEventListener('load', checkReveal);
}

// Add Islamic decorative elements
function addIslamicDecorativeElements() {
    // Add dome-style borders to key containers
    const domeElements = document.querySelectorAll('.bg-gray-800\\/80, .bg-gradient-to-br, .modal-content');
    domeElements.forEach(el => {
        el.classList.add('dome-border');
    });
    
    // Add Islamic dividers before sections
    const sections = document.querySelectorAll('section');
    sections.forEach((section, index) => {
        if (index > 0) { // Skip first section
            const divider = document.createElement('div');
            divider.className = 'islamic-divider';
            section.parentNode.insertBefore(divider, section);
        }
    });
    
    // Add Islamic pattern to section backgrounds
    document.querySelectorAll('section').forEach(section => {
        section.style.position = 'relative';
        section.style.overflow = 'hidden';
    });
}

// Set up prayer time reminder
function setupPrayerTimeReminder() {
    const reminderContainer = document.createElement('div');
    reminderContainer.className = 'prayer-time-reminder';
    reminderContainer.innerHTML = `
        <span class="icon">☪</span>
        <span class="prayer-message">Prayer time reminder will appear here</span>
    `;
    document.body.appendChild(reminderContainer);
    
    // Mock prayer times (in a real app, these would come from an API)
    const prayerTimes = {
        fajr: '5:15 AM',
        dhuhr: '12:30 PM',
        asr: '3:45 PM',
        maghrib: '6:20 PM',
        isha: '7:45 PM'
    };
    
    // Show random prayer time reminder after a delay
    setTimeout(() => {
        const prayers = Object.keys(prayerTimes);
        const randomPrayer = prayers[Math.floor(Math.random() * prayers.length)];
        reminderContainer.querySelector('.prayer-message').textContent = 
            `${randomPrayer.charAt(0).toUpperCase() + randomPrayer.slice(1)} prayer time: ${prayerTimes[randomPrayer]}`;
        reminderContainer.classList.add('show');
        
        // Hide after 5 seconds
        setTimeout(() => {
            reminderContainer.classList.remove('show');
        }, 5000);
    }, 15000); // Show after 15 seconds
}

// Add Qibla compass
function addQiblaCompass() {
    const compass = document.createElement('div');
    compass.className = 'qibla-compass';
    compass.innerHTML = '<div class="qibla-compass-needle"></div>';
    compass.title = 'Qibla Direction (Demo Only)';
    document.body.appendChild(compass);
    
    // For demo purposes - rotate to random angle
    // In a real app, this would calculate the actual Qibla direction
    const needle = compass.querySelector('.qibla-compass-needle');
    const randomAngle = Math.floor(Math.random() * 360);
    needle.style.transform = `rotate(${randomAngle}deg)`;
    
    compass.addEventListener('click', () => {
        showConfirmation('This is a demo Qibla direction. In a real app, this would show the actual direction to Mecca.');
    });
}

// Enhance location buttons with additional visual cues
function enhanceLocationButtons() {
    const locationBtnMain = document.getElementById('use-current-location-main');
    const locationBtnSchedule = document.getElementById('use-current-location-schedule');
    
    if (locationBtnMain) {
        // Add a tooltip
        locationBtnMain.setAttribute('data-tooltip', 'Use Your Current Location');
        // Add pulsing animation when form is active
        document.getElementById('pickup-address').addEventListener('focus', () => {
            locationBtnMain.classList.add('animate-pulse');
        });
        document.getElementById('pickup-address').addEventListener('blur', () => {
            locationBtnMain.classList.remove('animate-pulse');
        });
    }
    
    if (locationBtnSchedule) {
        locationBtnSchedule.setAttribute('data-tooltip', 'Use Your Current Location');
        document.getElementById('schedule-pickup-address').addEventListener('focus', () => {
            locationBtnSchedule.classList.add('animate-pulse');
        });
        document.getElementById('schedule-pickup-address').addEventListener('blur', () => {
            locationBtnSchedule.classList.remove('animate-pulse');
        });
    }
}

// Add scroll down arrow to first section
function addScrollDownArrow() {
    const firstSection = document.querySelector('section');
    if (firstSection) {
        const scrollArrow = document.createElement('div');
        scrollArrow.className = 'scroll-down-arrow';
        scrollArrow.innerHTML = '↓';
        scrollArrow.title = 'Scroll down to explore';
        firstSection.appendChild(scrollArrow);
        
        scrollArrow.addEventListener('click', () => {
            const featuresSection = document.getElementById('features');
            if (featuresSection) {
                featuresSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
}

// Add Arabic font for Islamic text
function addArabicFont() {
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap';
    document.head.appendChild(fontLink);
}

// Add tooltips to vehicle type options
function addVehicleTooltips() {
    const vehicleLabels = document.querySelectorAll('label:has(input[name="vehicleType"]), label:has(input[name="scheduleVehicleType"])');
    
    vehicleLabels.forEach(label => {
        const vehicleType = label.querySelector('input').value;
        let tooltipText = '';
        
        switch (vehicleType) {
            case 'standard':
                tooltipText = 'Affordable and comfortable sedan';
                break;
            case 'suv':
                tooltipText = 'Spacious vehicle for groups or luggage';
                break;
            case 'premium':
                tooltipText = 'Luxury experience with top-rated drivers';
                break;
        }
        
        if (tooltipText) {
            label.setAttribute('title', tooltipText);
        }
    });
}

// Add loader animation for ride requests
function showLoader(parentElement) {
    // Create loader
    const loader = document.createElement('div');
    loader.className = 'crescent-loader';
    
    // Clear parent and append loader
    if (parentElement) {
        parentElement.innerHTML = '';
        parentElement.appendChild(loader);
    }
    
    return loader;
}

// Override form submissions to add Islamic elements
function overrideFormSubmissions() {
    // Override the original showConfirmation function
    window.originalShowConfirmation = window.showConfirmation;
    window.showConfirmation = function(message, isError = false) {
        const confirmationMessage = document.getElementById('confirmation-message');
        const confirmationText = document.getElementById('confirmation-text');
        if (!confirmationMessage || !confirmationText) return;

        // Add Islamic symbol based on message type
        const symbol = isError ? '⚠️' : '☪️';
        confirmationText.innerHTML = `${symbol} ${message}`;
        
        confirmationMessage.classList.remove('hide');
        confirmationMessage.classList.add('show');

        if (isError) {
            confirmationMessage.classList.remove('bg-green-600');
            confirmationMessage.classList.add('bg-red-600');
        } else {
            confirmationMessage.classList.remove('bg-red-600');
            confirmationMessage.classList.add('bg-green-600');
        }

        setTimeout(() => {
            confirmationMessage.classList.remove('show');
            confirmationMessage.classList.add('hide');
        }, 3500);
    };

    // Override booking form submission
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const pickup = document.getElementById('pickup-address').value;
            const dropoff = document.getElementById('dropoff-address').value;
            const vehicleType = document.querySelector('input[name="vehicleType"]:checked')?.value;

            if (pickup && dropoff && vehicleType) {
                console.log('Booking submitted:', { pickup, dropoff, vehicleType });
                
                const bookingSection = document.getElementById('booking-section');
                const rideStatusSection = document.getElementById('ride-status');
                const mapCanvas = document.getElementById('map-canvas');
                
                if (bookingSection && rideStatusSection && mapCanvas) {
                    bookingSection.classList.add('hidden');
                    mapCanvas.classList.add('hidden');
                    
                    // Show loader before showing ride status
                    rideStatusSection.classList.remove('hidden');
                    const statusMessage = document.getElementById('status-message');
                    if (statusMessage) {
                        statusMessage.innerHTML = '<div class="crescent-loader"></div> Searching for drivers...';
                    }
                    
                    document.getElementById('driver-name').textContent = '---';
                    document.getElementById('driver-rating').textContent = '---';
                    document.getElementById('driver-vehicle').textContent = '---';
                    document.getElementById('driver-eta').textContent = '---';

                    // Show ride status after a delay with animation
                    setTimeout(() => {
                        if (statusMessage) {
                            statusMessage.innerHTML = '<span style="color: #f59e0b;">Alhamdulillah!</span> Driver En Route!';
                        }
                        document.getElementById('driver-name').textContent = 'Mohammed A.';
                        document.getElementById('driver-rating').textContent = '4.9';
                        document.getElementById('driver-vehicle').textContent = `Toyota Allion (${vehicleType})`;
                        document.getElementById('driver-eta').textContent = `${Math.floor(Math.random() * 5) + 3}`;
                    }, 2500);
                } else {
                    showConfirmation(`Finding your ${vehicleType} ride from ${pickup} to ${dropoff}...`);
                }
                
                document.getElementById('fare-estimate').textContent = '';
            } else {
                showConfirmation('Please enter pickup, dropoff, and select vehicle type.', true);
            }
        }, true); // Use capturing to override any existing handlers
    }

    // Override schedule form submission
    const scheduleForm = document.getElementById('schedule-form');
    if (scheduleForm) {
        scheduleForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const pickup = document.getElementById('schedule-pickup-address').value;
            const dropoff = document.getElementById('schedule-dropoff-address').value;
            const date = document.getElementById('schedule-date').value;
            const time = document.getElementById('schedule-time').value;
            const vehicleType = document.querySelector('input[name="scheduleVehicleType"]:checked')?.value;
            
            if (pickup && dropoff && date && time && vehicleType) {
                console.log('Scheduling submitted:', { pickup, dropoff, date, time, vehicleType });
                
                const formattedDate = new Date(date + 'T' + time).toLocaleString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                closeModal('schedule-modal');
                showConfirmation(`الحمد لله! Ride scheduled for ${formattedDate}!`);
                scheduleForm.reset();
            } else {
                showConfirmation('Please fill in all required fields for scheduling.', true);
            }
        }, true); // Use capturing to override any existing handlers
    }

    // Override login form submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            closeModal('account-modal');
            showConfirmation('مرحبا! Welcome back to Salaam Rides!');
            loginForm.reset();
        }, true);
    }

    // Override signup form submission
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            closeModal('account-modal');
            showConfirmation('As-salamu alaykum! Welcome to Salaam Rides!');
            signupForm.reset();
        }, true);
    }

    // Override cancel ride button
    const cancelRideBtn = document.getElementById('cancel-ride-btn');
    if (cancelRideBtn) {
        cancelRideBtn.addEventListener('click', function() {
            const rideStatusSection = document.getElementById('ride-status');
            const bookingSection = document.getElementById('booking-section');
            const mapCanvas = document.getElementById('map-canvas');
            const bookingForm = document.getElementById('booking-form');
            
            if (rideStatusSection && bookingSection && mapCanvas && bookingForm) {
                rideStatusSection.classList.add('hidden');
                bookingSection.classList.remove('hidden');
                mapCanvas.classList.remove('hidden');
                bookingForm.reset();
                document.getElementById('fare-estimate').textContent = '';
                showConfirmation('في أمان الله (Fee Amanullah) - Ride cancelled.');
            }
        }, true);
    }
}
