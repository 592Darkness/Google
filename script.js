let map; 
let pickupAutocomplete, dropoffAutocomplete, schedulePickupAutocomplete, scheduleDropoffAutocomplete;
let geocoder; // Declare geocoder globally

// --- Initialization Function for Google Maps API ---
function initMap() {
    if (typeof google === 'undefined' || typeof google.maps === 'undefined' || typeof google.maps.places === 'undefined') {
        console.error("Google Maps API not loaded correctly. Check API key and script tag.");
        showConfirmation("Error loading map features. Please check your connection or API key configuration.", true);
        return; 
    }

    console.log("Google Maps API loaded successfully.");
    geocoder = new google.maps.Geocoder(); // Initialize the geocoder

    const guyanaCenter = { lat: 6.8013, lng: -58.1551 }; 

    const mapStyles = [ { elementType: "geometry", stylers: [{ color: "#242f3e" }] }, { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] }, { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] }, { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }], }, { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }], }, { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }], }, { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }], }, { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }], }, { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }], }, { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }], }, { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }], }, { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }], }, { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }], }, { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }], }, { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }], }, { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }], }, { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }], }, { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }], }, ];

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
                fullscreenControl: false
            });
            console.log("Map initialized.");
         } catch (error) {
             console.error("Error initializing Google Map:", error);
             showConfirmation("Could not display the map.", true);
         }
    } else {
        console.error("Map canvas element not found.");
    }

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
        if (inputElement && typeof google !== 'undefined' && google.maps && google.maps.places) {
            const autocomplete = new google.maps.places.Autocomplete(inputElement, options);
            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                if (place && place.formatted_address) {
                    console.log(`${inputElement.id} Place Selected:`, place.formatted_address);
                    if (inputElement.id === 'pickup-address' || inputElement.id === 'dropoff-address') {
                        updateFareEstimate();
                    }
                } else {
                    console.log("Autocomplete selection cleared or invalid place.");
                     if (inputElement.id === 'pickup-address' || inputElement.id === 'dropoff-address') {
                         document.getElementById('fare-estimate').textContent = ''; 
                     }
                }
            });
            return autocomplete; 
        } else {
            console.error(`Input field #${inputElement?.id} not found or Google Maps API not ready.`);
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

    // Provide visual feedback
    const originalPlaceholder = inputElement.placeholder;
    inputElement.placeholder = "Fetching location...";
    if (buttonElement) buttonElement.disabled = true;

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const latLng = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            };

            geocoder.geocode({ location: latLng }, (results, status) => {
                inputElement.placeholder = originalPlaceholder; // Restore placeholder
                if (buttonElement) buttonElement.disabled = false; // Re-enable button

                if (status === "OK") {
                    if (results[0]) {
                        inputElement.value = results[0].formatted_address;
                        console.log("Geocoded Address:", results[0].formatted_address);
                        showConfirmation("Location set!", false);
                        // Optionally center map
                        if(map) {
                            map.setCenter(latLng);
                            map.setZoom(15); // Zoom in a bit
                        }
                        // Update fare if it's the main booking form pickup
                        if (inputId === 'pickup-address') {
                            updateFareEstimate();
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
            inputElement.placeholder = originalPlaceholder; // Restore placeholder
            if (buttonElement) buttonElement.disabled = false; // Re-enable button
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

// --- Helper Functions ---

function calculateMockFare(vehicleType) {
    const baseFare = Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000; 
    let multiplier = 1;
    if (vehicleType === 'suv') {
        multiplier = 1.5;
    } else if (vehicleType === 'premium') {
        multiplier = 2.0;
    }
    const finalFare = Math.round(baseFare * multiplier);
    return `Est. Fare: G$${finalFare}`;
}

function showConfirmation(message, isError = false) {
    const confirmationMessage = document.getElementById('confirmation-message');
    const confirmationText = document.getElementById('confirmation-text');
    if (!confirmationMessage || !confirmationText) return;

    confirmationText.textContent = message;
    confirmationMessage.classList.remove('hide');
    confirmationMessage.classList.add('show');

    if(isError) {
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
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex'; 
        document.body.style.overflow = 'hidden'; 
    }
}

function closeModal(modalId) {
     const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = ''; 
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
        signupBtn.classList.add('text-gray-400', 'hover:text-primary-300', 'border-transparent');
        signupBtn.classList.remove('text-primary-400', 'border-primary-400');

    } else if (tabName === 'signup') {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
        signupBtn.classList.add('text-primary-400', 'border-primary-400');
        signupBtn.classList.remove('text-gray-400', 'hover:text-primary-300', 'border-transparent');
        loginBtn.classList.add('text-gray-400', 'hover:text-primary-300', 'border-transparent');
        loginBtn.classList.remove('text-primary-400', 'border-primary-400');
    }
}

function updateFareEstimate() {
    const pickup = document.getElementById('pickup-address').value;
    const dropoff = document.getElementById('dropoff-address').value;
    const fareEstimateDiv = document.getElementById('fare-estimate');
    const selectedVehicleType = document.querySelector('input[name="vehicleType"]:checked');

    if (pickup && dropoff && selectedVehicleType && fareEstimateDiv) {
        fareEstimateDiv.textContent = calculateMockFare(selectedVehicleType.value);
    } else if (fareEstimateDiv) {
        fareEstimateDiv.textContent = ''; 
    }
}

// --- Event Listeners ---

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('current-year').textContent = new Date().getFullYear();

    const bookingForm = document.getElementById('booking-form');
    const loginSignupBtn = document.getElementById('login-signup-btn');
    const joinRewardsBtn = document.getElementById('join-rewards-btn');
    const accountModal = document.getElementById('account-modal');
    const scheduleModal = document.getElementById('schedule-modal');
    const scheduleRideLink = document.getElementById('schedule-ride-link');
    const scheduleRideNav = document.getElementById('schedule-ride-nav');
    const scheduleForm = document.getElementById('schedule-form');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const bookingSection = document.getElementById('booking-section');
    const rideStatusSection = document.getElementById('ride-status');
    const cancelRideBtn = document.getElementById('cancel-ride-btn');
    const mapCanvas = document.getElementById('map-canvas');
    const vehicleTypeRadios = document.querySelectorAll('input[name="vehicleType"]');
    const currentLocationBtnMain = document.getElementById('use-current-location-main');
    const currentLocationBtnSchedule = document.getElementById('use-current-location-schedule');

    // Fix schedule form date and time default values
    const scheduleDate = document.getElementById('schedule-date');
    const scheduleTime = document.getElementById('schedule-time');
    
    if (scheduleDate) {
        // Set minimum date to today
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        scheduleDate.min = formattedDate;
    }

    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault(); 
            const pickup = document.getElementById('pickup-address').value;
            const dropoff = document.getElementById('dropoff-address').value;
            const vehicleType = document.querySelector('input[name="vehicleType"]:checked')?.value;

            if (pickup && dropoff && vehicleType) {
                console.log('Booking submitted:', { pickup, dropoff, vehicleType });
                
                if (bookingSection && rideStatusSection && mapCanvas) {
                    bookingSection.classList.add('hidden'); 
                    mapCanvas.classList.add('hidden'); 
                    rideStatusSection.classList.remove('hidden'); 

                    document.getElementById('status-message').textContent = 'Searching for nearby drivers...';
                    document.getElementById('driver-name').textContent = '---';
                    document.getElementById('driver-rating').textContent = '---';
                    document.getElementById('driver-vehicle').textContent = '---';
                    document.getElementById('driver-eta').textContent = '---';

                    setTimeout(() => {
                        document.getElementById('status-message').textContent = 'Driver En Route!';
                        document.getElementById('driver-name').textContent = 'John K.';
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
        });
    }
    
    if (vehicleTypeRadios) {
        vehicleTypeRadios.forEach(radio => {
            radio.addEventListener('change', updateFareEstimate);
        });
    }
    
    if (scheduleForm) {
        scheduleForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const pickup = document.getElementById('schedule-pickup-address').value;
            const dropoff = document.getElementById('schedule-dropoff-address').value;
            const date = document.getElementById('schedule-date').value;
            const time = document.getElementById('schedule-time').value;
            const vehicleType = document.querySelector('input[name="scheduleVehicleType"]:checked')?.value;


            if (pickup && dropoff && date && time && vehicleType) {
                console.log('Scheduling submitted:', { pickup, dropoff, date, time, vehicleType });
                closeModal('schedule-modal');
                showConfirmation(`Ride scheduled for ${date} at ${time}!`);
                scheduleForm.reset();
            } else {
                 showConfirmation('Please fill in all required fields for scheduling.', true);
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Login attempt');
            closeModal('account-modal');
            showConfirmation('Logged in successfully!');
            loginForm.reset();
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Sign up attempt');
            closeModal('account-modal');
            showConfirmation('Account created successfully!');
            signupForm.reset();
        });
    }

    if (loginSignupBtn) {
        loginSignupBtn.addEventListener('click', () => openModal('account-modal'));
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

     if (cancelRideBtn && bookingSection && rideStatusSection && mapCanvas && bookingForm) {
         cancelRideBtn.addEventListener('click', () => {
             rideStatusSection.classList.add('hidden'); 
             bookingSection.classList.remove('hidden'); 
             mapCanvas.classList.remove('hidden'); 
             bookingForm.reset(); 
             document.getElementById('fare-estimate').textContent = ''; 
             showConfirmation('Ride cancelled.');
         });
     }

     // Add listeners for the current location buttons
     if(currentLocationBtnMain) {
         currentLocationBtnMain.addEventListener('click', function() {
             getCurrentLocation('pickup-address', this); // Pass input ID and the button itself
         });
     }
     if(currentLocationBtnSchedule) {
         currentLocationBtnSchedule.addEventListener('click', function() {
             getCurrentLocation('schedule-pickup-address', this); // Pass input ID and the button itself
         });
     }

    window.addEventListener('click', (event) => {
        if (event.target == accountModal) {
            closeModal('account-modal');
        }
         if (event.target == scheduleModal) {
            closeModal('schedule-modal');
        }
    });

    const animatedElements = document.querySelectorAll('.fade-in');
    function checkFadeIn() {
        const triggerBottom = window.innerHeight * 0.9; 
        animatedElements.forEach(el => {
            const boxTop = el.getBoundingClientRect().top;
            if (boxTop < triggerBottom) {
                if (el.style.opacity !== '1') {
                     el.style.opacity = '1';
                }
            }
        });
    }

    window.addEventListener('scroll', checkFadeIn);
    window.addEventListener('load', checkFadeIn);

    // Initialize the specific elements in the schedule form
    initScheduleForm();
});

// Special function to fix the schedule form
function initScheduleForm() {
    // Fix the location button in the pickup location field
    const pickupLocationInput = document.getElementById('pickup-location');
    const dropoffLocationInput = document.getElementById('dropoff-location');
    
    if (pickupLocationInput) {
        // Create location button if it doesn't exist
        const locationButton = document.createElement('button');
        locationButton.type = 'button';
        locationButton.className = 'location-icon';
        locationButton.innerHTML = '<span class="lucide">&#xe9cd;</span>';
        locationButton.title = 'Use Current Location';
        
        // Make sure the parent has position: relative
        pickupLocationInput.parentElement.style.position = 'relative';
        
        // Append the button
        pickupLocationInput.parentElement.appendChild(locationButton);
        
        // Add event listener
        locationButton.addEventListener('click', function() {
            getCurrentLocation('pickup-location', this);
        });
    }
    
    // Fix the vehicle option selection
    const vehicleOptions = document.querySelectorAll('.vehicle-option');
    if (vehicleOptions && vehicleOptions.length) {
        vehicleOptions.forEach(option => {
            option.addEventListener('click', function() {
                // Remove selected class from all options
                vehicleOptions.forEach(opt => opt.classList.remove('selected'));
                // Add selected class to clicked option
                this.classList.add('selected');
                // Update the hidden input value
                const hiddenInput = document.querySelector('input[name="vehicleType"]');
                if (hiddenInput) {
                    hiddenInput.value = this.getAttribute('data-value');
                }
            });
        });
    }
    
    // Set default time to current time + 30 minutes
    const timeInput = document.getElementById('schedule-time');
    if (timeInput) {
        const now = new Date();
        now.setMinutes(now.getMinutes() + 30);
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        timeInput.value = `${hours}:${minutes}`;
    }
}

// Make sure initMap is globally accessible
window.initMap = initMap;
