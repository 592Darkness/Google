// Global variables
let map; 
let pickupAutocomplete, dropoffAutocomplete, schedulePickupAutocomplete, scheduleDropoffAutocomplete;
let geocoder;
let isGoogleMapsLoaded = false;
let currentRideId = null;
let offlineMode = false;

// --- Constants ---
const FARE_BASE_RATES = {
    standard: 1000,
    suv: 1500,
    premium: 2000
};

const FARE_MULTIPLIERS = {
    standard: 1.0,
    suv: 1.5,
    premium: 2.0
};

// --- Initialization Function for Google Maps API ---
function initMap() {
    console.log("Initializing Google Maps...");
    
    if (typeof google === 'undefined' || typeof google.maps === 'undefined' || typeof google.maps.places === 'undefined') {
        console.error("Google Maps API not loaded correctly. Check API key and script tag.");
        showMapFallback();
        showConfirmation("Error loading map features. Please reload the page or try again later.", true);
        return; 
    }

    console.log("Google Maps API loaded successfully.");
    isGoogleMapsLoaded = true;
    geocoder = new google.maps.Geocoder(); // Initialize the geocoder

    const guyanaCenter = { lat: 6.8013, lng: -58.1551 }; 

    // Dark mode map styles
    const mapStyles = [ 
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] }, 
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] }, 
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] }, 
        { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] }, 
        { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] }, 
        { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] }, 
        { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] }, 
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] }, 
        { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] }, 
        { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] }, 
        { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] }, 
        { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] }, 
        { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] }, 
        { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] }, 
        { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] }, 
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] }, 
        { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] }, 
        { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] }, 
    ];

    const mapElement = document.getElementById('map-canvas');
    if (mapElement) {
         try {
            map = new google.maps.Map(mapElement, {
                center: guyanaCenter,
                zoom: 12, 
                mapTypeId: 'roadmap',
                styles: mapStyles, 
                disableDefaultUI: true, 
                zoomControl: true,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
                gestureHandling: 'cooperative', // Improved mobile handling
                // Add custom map controls
                mapTypeControlOptions: {
                    position: google.maps.ControlPosition.TOP_RIGHT
                },
                zoomControlOptions: {
                    position: google.maps.ControlPosition.RIGHT_BOTTOM
                }
            });
            console.log("Map initialized.");
            
            // Add a custom marker for the center
            const centerMarker = new google.maps.Marker({
                position: guyanaCenter,
                map: map,
                title: "Georgetown, Guyana",
                animation: google.maps.Animation.DROP,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: "#10b981",
                    fillOpacity: 1,
                    strokeColor: "#ffffff",
                    strokeWeight: 2,
                }
            });
            
         } catch (error) {
             console.error("Error initializing Google Map:", error);
             showMapFallback();
             showConfirmation("Could not display the map.", true);
         }
    } else {
        console.error("Map canvas element not found.");
    }

    // Initialize the autocomplete fields
    initAutocompleteFields();
}

// Initialize all autocomplete fields
function initAutocompleteFields() {
    const autocompleteOptions = {
        componentRestrictions: { country: "gy" }, 
        fields: ["address_components", "geometry", "icon", "name", "formatted_address"], 
        strictBounds: false, 
    };

    const pickupInput = document.getElementById('pickup-address');
    const dropoffInput = document.getElementById('dropoff-address');
    const schedulePickupInput = document.getElementById('schedule-pickup-address');
    const scheduleDropoffInput = document.getElementById('schedule-dropoff-address');

    const initAutocomplete = (inputElement, options) => {
        if (!inputElement || !isGoogleMapsLoaded) {
            console.warn(`Cannot initialize autocomplete for ${inputElement?.id || 'unknown input'}`);
            return null;
        }
        
        try {
            const autocomplete = new google.maps.places.Autocomplete(inputElement, options);
            
            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                if (place && place.formatted_address) {
                    console.log(`${inputElement.id} Place Selected:`, place.formatted_address);
                    
                    // If this is a fare-relevant field, update the fare estimate
                    if (inputElement.id === 'pickup-address' || inputElement.id === 'dropoff-address') {
                        updateFareEstimate();
                    } else if (inputElement.id === 'schedule-pickup-address' || inputElement.id === 'schedule-dropoff-address') {
                        updateScheduleFareEstimate();
                    }
                    
                    // If it's a pickup location, adjust the map
                    if (inputElement.id === 'pickup-address' || inputElement.id === 'schedule-pickup-address') {
                        if (place.geometry && place.geometry.location && map) {
                            map.setCenter(place.geometry.location);
                            map.setZoom(15);
                            
                            // Add a marker for the selected location
                            new google.maps.Marker({
                                position: place.geometry.location,
                                map: map,
                                title: "Pickup Location",
                                animation: google.maps.Animation.DROP,
                                icon: {
                                    path: google.maps.SymbolPath.CIRCLE,
                                    scale: 8,
                                    fillColor: "#10b981",
                                    fillOpacity: 1,
                                    strokeColor: "#ffffff",
                                    strokeWeight: 2,
                                }
                            });
                        }
                    }
                    
                } else {
                    console.log("Autocomplete selection cleared or invalid place.");
                    if (inputElement.id === 'pickup-address' || inputElement.id === 'dropoff-address') {
                        document.getElementById('fare-estimate').textContent = ''; 
                    } else if (inputElement.id === 'schedule-pickup-address' || inputElement.id === 'schedule-dropoff-address') {
                        document.getElementById('schedule-fare-estimate').textContent = '';
                    }
                }
            });
            
            return autocomplete; 
        } catch (error) {
            console.error(`Error initializing autocomplete for ${inputElement.id}:`, error);
            return null;
        }
    };

    try {
        pickupAutocomplete = initAutocomplete(pickupInput, autocompleteOptions);
        dropoffAutocomplete = initAutocomplete(dropoffInput, autocompleteOptions);
        schedulePickupAutocomplete = initAutocomplete(schedulePickupInput, autocompleteOptions);
        scheduleDropoffAutocomplete = initAutocomplete(scheduleDropoffInput, autocompleteOptions);
    } catch (error) {
        console.error("Error initializing autocomplete:", error);
        showConfirmation("Error setting up address search. Please try again later.", true);
    }
}

// --- Geolocation Function ---
function getCurrentLocation(inputId, buttonElement) {
    if (!navigator.geolocation) {
        showConfirmation("Geolocation is not supported by your browser.", true);
        return;
    }

    if (!geocoder) {
        showConfirmation("Map services are still loading, please try again shortly.", true);
        return;
    }

    const inputElement = document.getElementById(inputId);
    if (!inputElement) {
        console.error(`Input element with ID ${inputId} not found.`);
        return;
    }

    // Provide visual feedback for the button and input
    const originalPlaceholder = inputElement.placeholder;
    inputElement.placeholder = "Fetching location...";
    if (buttonElement) {
        buttonElement.disabled = true;
        buttonElement.classList.add('opacity-50');
    }
    
    // Show loading indicator for better UX
    showLoadingIndicator();

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const latLng = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            };

            geocoder.geocode({ location: latLng }, (results, status) => {
                // Restore the input and button to normal state
                inputElement.placeholder = originalPlaceholder;
                if (buttonElement) {
                    buttonElement.disabled = false;
                    buttonElement.classList.remove('opacity-50');
                }
                
                // Hide the loading indicator
                hideLoadingIndicator();

                if (status === "OK") {
                    if (results[0]) {
                        inputElement.value = results[0].formatted_address;
                        console.log("Geocoded Address:", results[0].formatted_address);
                        showConfirmation("Location set!");
                        
                        // Optionally center map and add marker for better UX
                        if(map) {
                            map.setCenter(latLng);
                            map.setZoom(15);
                            
                            // Add a marker for the current location
                            new google.maps.Marker({
                                position: latLng,
                                map: map,
                                title: "Your Location",
                                animation: google.maps.Animation.DROP,
                                icon: {
                                    path: google.maps.SymbolPath.CIRCLE,
                                    scale: 8,
                                    fillColor: "#10b981",
                                    fillOpacity: 1,
                                    strokeColor: "#ffffff",
                                    strokeWeight: 2,
                                }
                            });
                        }
                        
                        // Update fare if it's the main booking form pickup or dropoff
                        if (inputId === 'pickup-address' || inputId === 'dropoff-address') {
                            updateFareEstimate();
                        } else if (inputId === 'schedule-pickup-address' || inputId === 'schedule-dropoff-address') {
                            updateScheduleFareEstimate();
                        }
                    } else {
                        showConfirmation("No address found for your location.", true);
                    }
                } else {
                    console.error("Geocoder failed due to: " + status);
                    showConfirmation("Could not determine address from location.", true);
                }
            });
        },
        (error) => {
            // Restore the input and button to normal state
            inputElement.placeholder = originalPlaceholder;
            if (buttonElement) {
                buttonElement.disabled = false;
                buttonElement.classList.remove('opacity-50');
            }
            
            // Hide the loading indicator
            hideLoadingIndicator();
            
            let errorMsg = "Error getting location: ";
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMsg += "Permission denied.";
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMsg += "Location information unavailable.";
                    break;
                case error.TIMEOUT:
                    errorMsg += "Request timed out.";
                    break;
                default:
                    errorMsg += "An unknown error occurred.";
                    break;
            }
            console.error(errorMsg, error);
            showConfirmation(errorMsg, true);
        },
        {
            enableHighAccuracy: true, // Try for better accuracy
            timeout: 10000,         // Wait 10 seconds
            maximumAge: 0           // Don't use cached position
        }
    );
}

// --- Fare Calculation Functions ---

function calculateDistance(pickup, dropoff) {
    // This is a simplified distance calculation.
    // In a real app, this would use Google's Distance Matrix API
    
    // For demonstration, return a random distance between 2 and 25 kilometers
    return Math.floor(Math.random() * 23) + 2;
}

function calculateFare(vehicleType, distance = null) {
    // Base fare + distance calculation
    const baseFare = FARE_BASE_RATES[vehicleType] || FARE_BASE_RATES.standard;
    
    // If no distance provided, use a random one
    const km = distance || Math.floor(Math.random() * 15) + 2;
    
    // Calculate rate based on distance and vehicle type
    const distanceFare = km * 200; // G$200 per km
    
    // Apply vehicle type multiplier
    const multiplier = FARE_MULTIPLIERS[vehicleType] || FARE_MULTIPLIERS.standard;
    
    // Calculate final fare
    const finalFare = Math.round((baseFare + distanceFare) * multiplier);
    
    // Return fare in Guyanese dollars
    return `Est. Fare: G$${finalFare.toLocaleString()}`;
}

function updateFareEstimate() {
    const pickup = document.getElementById('pickup-address').value;
    const dropoff = document.getElementById('dropoff-address').value;
    const fareEstimateDiv = document.getElementById('fare-estimate');
    const selectedVehicleType = document.querySelector('input[name="vehicleType"]:checked');

    if (pickup && dropoff && selectedVehicleType && fareEstimateDiv) {
        const distance = calculateDistance(pickup, dropoff);
        fareEstimateDiv.textContent = calculateFare(selectedVehicleType.value, distance);
        fareEstimateDiv.classList.add('bg-gray-700/50', 'p-2', 'rounded-lg', 'animate-pulse-slow');
    } else if (fareEstimateDiv) {
        fareEstimateDiv.textContent = ''; 
        fareEstimateDiv.classList.remove('bg-gray-700/50', 'p-2', 'rounded-lg', 'animate-pulse-slow');
    }
}

function updateScheduleFareEstimate() {
    const pickup = document.getElementById('schedule-pickup-address').value;
    const dropoff = document.getElementById('schedule-dropoff-address').value;
    const fareEstimateDiv = document.getElementById('schedule-fare-estimate');
    const selectedVehicleType = document.querySelector('input[name="scheduleVehicleType"]:checked');

    if (pickup && dropoff && selectedVehicleType && fareEstimateDiv) {
        const distance = calculateDistance(pickup, dropoff);
        
        // Add a small premium for scheduled rides
        const scheduledFare = calculateFare(selectedVehicleType.value, distance);
        fareEstimateDiv.textContent = scheduledFare;
        fareEstimateDiv.classList.add('bg-gray-700/50', 'p-2', 'rounded-lg', 'animate-pulse-slow');
    } else if (fareEstimateDiv) {
        fareEstimateDiv.textContent = ''; 
        fareEstimateDiv.classList.remove('bg-gray-700/50', 'p-2', 'rounded-lg', 'animate-pulse-slow');
    }
}

// --- UI Helper Functions ---

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

function showMapFallback() {
    const mapElement = document.getElementById('map-canvas');
    const mapFallback = document.getElementById('map-fallback');
    
    if (mapElement && mapFallback) {
        mapFallback.classList.remove('hidden');
        mapElement.style.backgroundColor = '#1f2937';
        mapElement.style.border = '1px solid #4b5563';
    }
}

function showLoadingIndicator() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.classList.remove('hidden');
    }
}

function hideLoadingIndicator() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
    }
}

function toggleOfflineAlert(isOffline) {
    const offlineAlert = document.getElementById('offline-alert');
    if (offlineAlert) {
        if (isOffline) {
            offlineAlert.classList.remove('translate-y-full');
            offlineAlert.classList.add('translate-y-0');
        } else {
            offlineAlert.classList.remove('translate-y-0');
            offlineAlert.classList.add('translate-y-full');
        }
    }
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex'; 
        document.body.style.overflow = 'hidden'; 
        
        // Add animation classes for smooth entry
        setTimeout(() => {
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.classList.add('animate-slide-up');
            }
        }, 10);
        
        // Set focus on first focusable element for accessibility
        const firstInput = modal.querySelector('input, button:not(.modal-close-btn)');
        if (firstInput) {
            firstInput.focus();
        }
    }
}

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
                document.body.style.overflow = ''; 
                modalContent.classList.remove('animate-slide-down');
            }, 300);
        } else {
            modal.style.display = 'none';
            document.body.style.overflow = ''; 
        }
    }
}

function switchTab(tabName) {
    const loginBtn = document.getElementById('login-tab-btn');
    const signupBtn = document.getElementById('signup-tab-btn');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    
    if (!loginBtn || !signupBtn || !loginForm || !signupForm) return;

    if (tabName === 'login') {
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
        loginBtn.classList.add('text-primary-400', 'border-primary-400');
        loginBtn.classList.remove('text-gray-400', 'hover:text-primary-300', 'border-transparent');
        loginBtn.setAttribute('aria-selected', 'true');
        signupBtn.classList.add('text-gray-400', 'hover:text-primary-300', 'border-transparent');
        signupBtn.classList.remove('text-primary-400', 'border-primary-400');
        signupBtn.setAttribute('aria-selected', 'false');

    } else if (tabName === 'signup') {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
        signupBtn.classList.add('text-primary-400', 'border-primary-400');
        signupBtn.classList.remove('text-gray-400', 'hover:text-primary-300', 'border-transparent');
        signupBtn.setAttribute('aria-selected', 'true');
        loginBtn.classList.add('text-gray-400', 'hover:text-primary-300', 'border-transparent');
        loginBtn.classList.remove('text-primary-400', 'border-primary-400');
        loginBtn.setAttribute('aria-selected', 'false');
    }
}

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

function togglePasswordVisibility(inputId, buttonId) {
    const passwordInput = document.getElementById(inputId);
    const toggleButton = document.getElementById(buttonId);
    
    if (passwordInput && toggleButton) {
        const icon = toggleButton.querySelector('.toggle-password-icon');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            if (icon) icon.innerHTML = '&#xea76;'; // Eye-slash icon
        } else {
            passwordInput.type = 'password';
            if (icon) icon.innerHTML = '&#xea30;'; // Eye icon
        }
    }
}

// --- Ride Booking Functions ---

function requestRide(formData) {
    // In a real app, this would make an API call to the backend
    showLoadingIndicator();
    
    // Generate a unique ride ID
    currentRideId = Date.now().toString();
    
    // Simulate API call delay
    setTimeout(() => {
        hideLoadingIndicator();
        
        // Show the ride status section and hide booking form
        const bookingSection = document.getElementById('booking-section');
        const rideStatusSection = document.getElementById('ride-status');
        const mapCanvas = document.getElementById('map-canvas');
        
        if (bookingSection && rideStatusSection) {
            bookingSection.classList.add('hidden');
            if (mapCanvas) mapCanvas.classList.add('hidden');
            rideStatusSection.classList.remove('hidden');
            
            // Initialize the status display
            document.getElementById('status-message').textContent = 'Searching for nearby drivers...';
            document.getElementById('driver-name').textContent = '---';
            document.getElementById('driver-rating').textContent = '---';
            document.getElementById('driver-vehicle').textContent = '---';
            document.getElementById('driver-eta').textContent = '---';
            
            // Show the loading animation
            const loadingElement = document.getElementById('ride-status-loading');
            if (loadingElement) loadingElement.classList.remove('hidden');
            
            // Hide driver card initially
            const driverCard = document.getElementById('driver-card');
            if (driverCard) driverCard.classList.add('hidden');
            
            // Simulate finding a driver
            setTimeout(() => {
                // Hide loading animation
                if (loadingElement) loadingElement.classList.add('hidden');
                
                // Update the status with driver information
                document.getElementById('status-message').textContent = 'Driver En Route!';
                document.getElementById('driver-name').textContent = 'John K.';
                document.getElementById('driver-rating').textContent = '4.9';
                document.getElementById('driver-vehicle').textContent = `Toyota Allion (${formData.vehicleType})`;
                document.getElementById('driver-eta').textContent = `${Math.floor(Math.random() * 5) + 3}`; 
                
                // Show driver card
                if (driverCard) {
                    driverCard.classList.remove('hidden');
                    document.getElementById('driver-card-name').textContent = 'John K.';
                    document.getElementById('driver-card-rating').textContent = '4.9';
                }
                
                // Show confirmation
                showConfirmation("Driver found! John K. is on the way.", false);
            }, 3000);
        }
    }, 2000);
}

function scheduleRide(formData) {
    // In a real app, this would make an API call to the backend
    showLoadingIndicator();
    
    // Simulate API call delay
    setTimeout(() => {
        hideLoadingIndicator();
        closeModal('schedule-modal');
        
        // Format the date and time for display
        const date = new Date(formData.date + 'T' + formData.time);
        const formattedDate = date.toLocaleDateString();
        const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        showConfirmation(`Ride scheduled for ${formattedDate} at ${formattedTime}!`);
    }, 1500);
}

function cancelRide() {
    if (!currentRideId) {
        console.error("No active ride to cancel");
        return;
    }
    
    // In a real app, this would make an API call to cancel the ride
    showLoadingIndicator();
    
    // Simulate API call delay
    setTimeout(() => {
        hideLoadingIndicator();
        
        // Reset the ride ID
        currentRideId = null;
        
        // Show the booking form again and hide ride status
        const bookingSection = document.getElementById('booking-section');
        const rideStatusSection = document.getElementById('ride-status');
        const mapCanvas = document.getElementById('map-canvas');
        
        if (bookingSection && rideStatusSection) {
            rideStatusSection.classList.add('hidden');
            bookingSection.classList.remove('hidden');
            if (mapCanvas) mapCanvas.classList.remove('hidden');
            
            // Reset the booking form
            const bookingForm = document.getElementById('booking-form');
            if (bookingForm) bookingForm.reset();
            
            // Clear fare estimate
            const fareEstimate = document.getElementById('fare-estimate');
            if (fareEstimate) fareEstimate.textContent = '';
            
            showConfirmation('Ride cancelled.');
        }
    }, 1000);
}

// --- Form Validation Functions ---

function validateBookingForm() {
    const pickup = document.getElementById('pickup-address').value.trim();
    const dropoff = document.getElementById('dropoff-address').value.trim();
    const vehicleType = document.querySelector('input[name="vehicleType"]:checked')?.value;
    
    if (!pickup) {
        showConfirmation('Please enter a pickup location.', true);
        return false;
    }
    
    if (!dropoff) {
        showConfirmation('Please enter a dropoff location.', true);
        return false;
    }
    
    if (!vehicleType) {
        showConfirmation('Please select a vehicle type.', true);
        return false;
    }
    
    return {
        pickup,
        dropoff,
        vehicleType
    };
}

function validateScheduleForm() {
    const pickup = document.getElementById('schedule-pickup-address').value.trim();
    const dropoff = document.getElementById('schedule-dropoff-address').value.trim();
    const date = document.getElementById('schedule-date').value;
    const time = document.getElementById('schedule-time').value;
    const vehicleType = document.querySelector('input[name="scheduleVehicleType"]:checked')?.value;
    const notes = document.getElementById('schedule-notes').value.trim();
    
    if (!pickup) {
        showConfirmation('Please enter a pickup location.', true);
        return false;
    }
    
    if (!dropoff) {
        showConfirmation('Please enter a dropoff location.', true);
        return false;
    }
    
    if (!date) {
        showConfirmation('Please select a date.', true);
        return false;
    }
    
    if (!time) {
        showConfirmation('Please select a time.', true);
        return false;
    }
    
    // Validate that the selected date/time is not in the past
    const selectedDateTime = new Date(date + 'T' + time);
    const now = new Date();
    
    if (selectedDateTime <= now) {
        showConfirmation('Please select a future date and time.', true);
        return false;
    }
    
    if (!vehicleType) {
        showConfirmation('Please select a vehicle type.', true);
        return false;
    }
    
    return {
        pickup,
        dropoff,
        date,
        time,
        vehicleType,
        notes
    };
}

function validateLoginForm() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    
    if (!email) {
        showConfirmation('Please enter your email.', true);
        return false;
    }
    
    if (!isValidEmail(email)) {
        showConfirmation('Please enter a valid email address.', true);
        return false;
    }
    
    if (!password) {
        showConfirmation('Please enter your password.', true);
        return false;
    }
    
    return {
        email,
        password
    };
}

function validateSignupForm() {
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const phone = document.getElementById('signup-phone').value.trim();
    
    if (!name) {
        showConfirmation('Please enter your full name.', true);
        return false;
    }
    
    if (!email) {
        showConfirmation('Please enter your email.', true);
        return false;
    }
    
    if (!isValidEmail(email)) {
        showConfirmation('Please enter a valid email address.', true);
        return false;
    }
    
    if (!password) {
        showConfirmation('Please enter a password.', true);
        return false;
    }
    
    if (password.length < 8) {
        showConfirmation('Password must be at least 8 characters.', true);
        return false;
    }
    
    if (!phone) {
        showConfirmation('Please enter your phone number.', true);
        return false;
    }
    
    return {
        name,
        email,
        password,
        phone
    };
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// --- Network and Offline Handling ---

function checkNetworkStatus() {
    if (navigator.onLine) {
        if (offlineMode) {
            // We're back online after being offline
            offlineMode = false;
            toggleOfflineAlert(false);
            showConfirmation("You're back online!", false);
        }
    } else {
        // We're offline
        offlineMode = true;
        toggleOfflineAlert(true);
        showConfirmation("You're offline. Some features may be unavailable.", true);
    }
}

// --- Initialize Schedule Form ---
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

// --- Event Listeners Setup ---
function setupEventListeners() {
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // Booking form submission
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault(); 
            const formData = validateBookingForm();
            if (formData) {
                requestRide(formData);
            }
        });
    }
    
    // Schedule form submission
    const scheduleForm = document.getElementById('schedule-form');
    if (scheduleForm) {
        scheduleForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = validateScheduleForm();
            if (formData) {
                scheduleRide(formData);
            }
        });
    }
    
    // Login form submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = validateLoginForm();
            if (formData) {
                // In a real app, this would make an API call to authenticate
                showLoadingIndicator();
                setTimeout(() => {
                    hideLoadingIndicator();
                    closeModal('account-modal');
                    showConfirmation('Logged in successfully!');
                    loginForm.reset();
                }, 1500);
            }
        });
    }
    
    // Signup form submission
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = validateSignupForm();
            if (formData) {
                // In a real app, this would make an API call to create account
                showLoadingIndicator();
                setTimeout(() => {
                    hideLoadingIndicator();
                    closeModal('account-modal');
                    showConfirmation('Account created successfully!');
                    signupForm.reset();
                }, 1500);
            }
        });
    }
    
    // Modal open/close buttons
    const loginSignupBtn = document.getElementById('login-signup-btn');
    const loginSignupBtnMobile = document.getElementById('login-signup-btn-mobile');
    const joinRewardsBtn = document.getElementById('join-rewards-btn');
    const scheduleRideLink = document.getElementById('schedule-ride-link');
    const scheduleRideNav = document.getElementById('schedule-ride-nav');
    const scheduleRideNavMobile = document.getElementById('schedule-ride-nav-mobile');
    
    if (loginSignupBtn) {
        loginSignupBtn.addEventListener('click', () => openModal('account-modal'));
    }
    
    if (loginSignupBtnMobile) {
        loginSignupBtnMobile.addEventListener('click', () => {
            toggleMobileMenu(); // Close mobile menu first
            openModal('account-modal');
        });
    }
    
    if (joinRewardsBtn) {
        joinRewardsBtn.addEventListener('click', () => openModal('account-modal'));
    }
    
    if (scheduleRideLink) {
        scheduleRideLink.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('schedule-modal');
        });
    }
    
    if (scheduleRideNav) {
        scheduleRideNav.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('schedule-modal');
        });
    }
    
    if (scheduleRideNavMobile) {
        scheduleRideNavMobile.addEventListener('click', (e) => {
            e.preventDefault();
            toggleMobileMenu(); // Close mobile menu first
            openModal('schedule-modal');
        });
    }
    
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }
    
    // Modal overlay click to close
    const accountModalOverlay = document.getElementById('account-modal-overlay');
    const scheduleModalOverlay = document.getElementById('schedule-modal-overlay');
    
    if (accountModalOverlay) {
        accountModalOverlay.addEventListener('click', () => closeModal('account-modal'));
    }
    
    if (scheduleModalOverlay) {
        scheduleModalOverlay.addEventListener('click', () => closeModal('schedule-modal'));
    }
    
    // Cancel ride button
    const cancelRideBtn = document.getElementById('cancel-ride-btn');
    if (cancelRideBtn) {
        cancelRideBtn.addEventListener('click', cancelRide);
    }
    
    // Location buttons
    const currentLocationBtnMain = document.getElementById('use-current-location-main');
    const currentLocationBtnSchedule = document.getElementById('use-current-location-schedule');
    
    if (currentLocationBtnMain) {
        currentLocationBtnMain.addEventListener('click', function() {
            getCurrentLocation('pickup-address', this);
        });
    }
    
    if (currentLocationBtnSchedule) {
        currentLocationBtnSchedule.addEventListener('click', function() {
            getCurrentLocation('schedule-pickup-address', this);
        });
    }
    
    // Vehicle type selection for fare estimate
    const vehicleTypeRadios = document.querySelectorAll('input[name="vehicleType"]');
    if (vehicleTypeRadios) {
        vehicleTypeRadios.forEach(radio => {
            radio.addEventListener('change', updateFareEstimate);
        });
    }
    
    // Vehicle type selection for schedule fare estimate
    const scheduleVehicleTypeRadios = document.querySelectorAll('input[name="scheduleVehicleType"]');
    if (scheduleVehicleTypeRadios) {
        scheduleVehicleTypeRadios.forEach(radio => {
            radio.addEventListener('change', updateScheduleFareEstimate);
        });
    }
    
    // Password toggle buttons
    const togglePasswordBtn = document.getElementById('toggle-password');
    const toggleSignupPasswordBtn = document.getElementById('toggle-signup-password');
    
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', () => 
            togglePasswordVisibility('login-password', 'toggle-password')
        );
    }
    
    if (toggleSignupPasswordBtn) {
        toggleSignupPasswordBtn.addEventListener('click', () => 
            togglePasswordVisibility('signup-password', 'toggle-signup-password')
        );
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
    
    // Scroll animations for feature cards
    const observeElements = () => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in');
                }
            });
        }, { threshold: 0.1 });
        
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach(card => {
            card.classList.remove('animate-fade-in');
            observer.observe(card);
        });
    };
    
    // Network status listeners
    window.addEventListener('online', checkNetworkStatus);
    window.addEventListener('offline', checkNetworkStatus);
    
    // Defer non-critical initializations
    setTimeout(() => {
        observeElements();
        checkNetworkStatus();
    }, 500);
}

// --- Document Ready Event Listener ---
document.addEventListener('DOMContentLoaded', () => {
    // Initialize schedule form with defaults
    initScheduleForm();
    
    // Set up all event listeners
    setupEventListeners();
    
    // Initial check of network status
    checkNetworkStatus();
});

// Make initMap globally accessible for Google Maps callback
window.initMap = initMap;
