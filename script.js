let map; 
let pickupAutocomplete, dropoffAutocomplete, schedulePickupAutocomplete, scheduleDropoffAutocomplete;

function initMap() {
    if (typeof google === 'undefined' || typeof google.maps === 'undefined' || typeof google.maps.places === 'undefined') {
        console.error("Google Maps API not loaded correctly. Check API key and script tag.");
        showConfirmation("Error loading map features. Please check your connection or API key configuration.", true);
        return; 
    }

    console.log("Google Maps API loaded successfully.");

    const guyanaCenter = { lat: 6.8013, lng: -58.1551 }; 

    const mapStyles = [
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        {
            featureType: "administrative.locality",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
        },
        {
            featureType: "poi",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
        },
        {
            featureType: "poi.park",
            elementType: "geometry",
            stylers: [{ color: "#263c3f" }],
        },
        {
            featureType: "poi.park",
            elementType: "labels.text.fill",
            stylers: [{ color: "#6b9a76" }],
        },
        {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#38414e" }],
        },
        {
            featureType: "road",
            elementType: "geometry.stroke",
            stylers: [{ color: "#212a37" }],
        },
        {
            featureType: "road",
            elementType: "labels.text.fill",
            stylers: [{ color: "#9ca5b3" }],
        },
        {
            featureType: "road.highway",
            elementType: "geometry",
            stylers: [{ color: "#746855" }],
        },
        {
            featureType: "road.highway",
            elementType: "geometry.stroke",
            stylers: [{ color: "#1f2835" }],
        },
        {
            featureType: "road.highway",
            elementType: "labels.text.fill",
            stylers: [{ color: "#f3d19c" }],
        },
        {
            featureType: "transit",
            elementType: "geometry",
            stylers: [{ color: "#2f3948" }],
        },
        {
            featureType: "transit.station",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
        },
        {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#17263c" }],
        },
        {
            featureType: "water",
            elementType: "labels.text.fill",
            stylers: [{ color: "#515c6d" }],
        },
        {
            featureType: "water",
            elementType: "labels.text.stroke",
            stylers: [{ color: "#17263c" }],
        },
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

    try {
        if (pickupInput) {
            pickupAutocomplete = new google.maps.places.Autocomplete(pickupInput, autocompleteOptions);
            pickupAutocomplete.addListener('place_changed', () => {
                const place = pickupAutocomplete.getPlace();
                if (place && place.formatted_address) {
                    console.log("Pickup Place Selected:", place.formatted_address);
                } else {
                    console.log("Autocomplete selection cleared or invalid place.");
                }
            });
        } else {
            console.error("Pickup input field not found.");
        }

        if (dropoffInput) {
            dropoffAutocomplete = new google.maps.places.Autocomplete(dropoffInput, autocompleteOptions);
             dropoffAutocomplete.addListener('place_changed', () => {
                const place = dropoffAutocomplete.getPlace();
                if (place && place.formatted_address) {
                    console.log("Dropoff Place Selected:", place.formatted_address);
                } else {
                     console.log("Autocomplete selection cleared or invalid place.");
                }
            });
        } else {
             console.error("Dropoff input field not found.");
        }
    } catch (error) {
        console.error("Error initializing booking form autocomplete:", error);
        showConfirmation("Error setting up address search. Please try again later.", true);
    }


    try {
        if (schedulePickupInput) {
             schedulePickupAutocomplete = new google.maps.places.Autocomplete(schedulePickupInput, autocompleteOptions);
             schedulePickupAutocomplete.addListener('place_changed', () => {
                const place = schedulePickupAutocomplete.getPlace();
                if (place && place.formatted_address) {
                    console.log("Scheduled Pickup Place Selected:", place.formatted_address);
                } else {
                    console.log("Autocomplete selection cleared or invalid place.");
                }
            });
        } else {
             console.error("Schedule Pickup input field not found.");
        }

         if (scheduleDropoffInput) {
             scheduleDropoffAutocomplete = new google.maps.places.Autocomplete(scheduleDropoffInput, autocompleteOptions);
             scheduleDropoffAutocomplete.addListener('place_changed', () => {
                const place = scheduleDropoffAutocomplete.getPlace();
                if (place && place.formatted_address) {
                    console.log("Scheduled Dropoff Place Selected:", place.formatted_address);
                } else {
                    console.log("Autocomplete selection cleared or invalid place.");
                }
            });
        } else {
             console.error("Schedule Dropoff input field not found.");
        }
    } catch (error) {
         console.error("Error initializing schedule form autocomplete:", error);
    }

} 


document.getElementById('current-year').textContent = new Date().getFullYear();

const bookingForm = document.getElementById('booking-form');
const confirmationMessage = document.getElementById('confirmation-message');
const confirmationText = document.getElementById('confirmation-text');
const loginSignupBtn = document.getElementById('login-signup-btn');
const joinRewardsBtn = document.getElementById('join-rewards-btn');
const accountModal = document.getElementById('account-modal');
const scheduleModal = document.getElementById('schedule-modal');
const scheduleRideLink = document.getElementById('schedule-ride-link');
const scheduleRideNav = document.getElementById('schedule-ride-nav');
const scheduleForm = document.getElementById('schedule-form');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');


function showConfirmation(message, isError = false) {
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
    }, 3000);
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
    const loginBtn = document.querySelector('#account-modal button[onclick="switchTab(\'login\')"]');
    const signupBtn = document.querySelector('#account-modal button[onclick="switchTab(\'signup\')"]');
    
    if (!loginBtn || !signupBtn) return;

    if (tabName === 'login') {
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
        loginBtn.classList.add('text-primary-400', 'border-primary-400');
        loginBtn.classList.remove('text-gray-400', 'hover:text-primary-300');
        signupBtn.classList.add('text-gray-400', 'hover:text-primary-300');
        signupBtn.classList.remove('text-primary-400', 'border-primary-400');

    } else if (tabName === 'signup') {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
        signupBtn.classList.add('text-primary-400', 'border-primary-400');
        signupBtn.classList.remove('text-gray-400', 'hover:text-primary-300');
        loginBtn.classList.add('text-gray-400', 'hover:text-primary-300');
        loginBtn.classList.remove('text-primary-400', 'border-primary-400');
    }
}


if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault(); 
        const pickup = document.getElementById('pickup-address').value;
        const dropoff = document.getElementById('dropoff-address').value;

        if (pickup && dropoff) {
            console.log('Booking submitted:', { pickup, dropoff });
            showConfirmation(`Finding your ride from ${pickup} to ${dropoff}...`);
            bookingForm.reset();
        } else {
            showConfirmation('Please enter both pickup and dropoff locations.', true); 
        }
    });
}

if (scheduleForm) {
    scheduleForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pickup = document.getElementById('schedule-pickup-address').value;
        const dropoff = document.getElementById('schedule-dropoff-address').value;
        const date = document.getElementById('schedule-date').value;
        const time = document.getElementById('schedule-time').value;

        if (pickup && dropoff && date && time) {
            console.log('Scheduling submitted:', { pickup, dropoff, date, time });
            closeModal('schedule-modal');
            showConfirmation(`Ride scheduled for ${date} at ${time}!`);
            scheduleForm.reset();
        } else {
             alert('Please fill in all required fields (including selecting valid addresses) for scheduling.');
        }
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('Login attempt');
        closeModal('account-modal');
        showConfirmation('Logged in successfully! (Demo)');
        loginForm.reset();
    });
}

if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('Sign up attempt');
        closeModal('account-modal');
        showConfirmation('Account created successfully! (Demo)');
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

window.initMap = initMap;

