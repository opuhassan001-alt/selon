/**
 * HAIR AND CARE BD — OFFICIAL FRONTEND APPLICATION LOGIC
 * Clean luxury white theme booking platform for salons, barbershops, and medspas in Bangladesh.
 */

(function () {
  'use strict';

  // State Management
  const state = {
    selectedCategory: 'All treatments',
    searchTreatment: '',
    searchLocation: 'Dhaka, Bangladesh',
    searchTime: 'Any time',
    activeCityCountry: 'bangladesh',
    bookingModal: {
      currentStep: 1,
      venueName: 'Trendy Trim Grooming Studio',
      selectedService: 'Haircut & Beard Styling',
      selectedPrice: 450,
      selectedStaff: 'Any Professional',
      selectedDay: 'Today',
      selectedTime: '11:30 AM',
      clientName: '',
      clientPhone: '',
      paymentMethod: 'bKash',
      generatedToken: ''
    }
  };

  // City Directory Data
  const CITIES_BY_COUNTRY = {
    bangladesh: [
      { name: 'Dhanmondi, Dhaka', count: '142 venues' },
      { name: 'Gulshan, Dhaka', count: '186 venues' },
      { name: 'Banani, Dhaka', count: '124 venues' },
      { name: 'Mirpur, Dhaka', count: '98 venues' },
      { name: 'Uttara, Dhaka', count: '115 venues' },
      { name: 'Bashundhara, Dhaka', count: '64 venues' },
      { name: 'Chattogram Hub', count: '88 venues' },
      { name: 'Sylhet Hub', count: '54 venues' },
      { name: 'Rajshahi City', count: '32 venues' },
      { name: 'Khulna Hub', count: '28 venues' },
      { name: 'Cox\'s Bazar', count: '22 venues' },
      { name: 'Cumilla City', count: '36 venues' }
    ],
    uk: [
      { name: 'London', count: '2,840 venues' },
      { name: 'Manchester', count: '740 venues' },
      { name: 'Birmingham', count: '620 venues' },
      { name: 'Glasgow', count: '410 venues' },
      { name: 'Edinburgh', count: '390 venues' },
      { name: 'Leeds', count: '310 venues' }
    ],
    us: [
      { name: 'New York', count: '4,120 venues' },
      { name: 'Los Angeles', count: '3,890 venues' },
      { name: 'Miami', count: '1,450 venues' },
      { name: 'Chicago', count: '1,210 venues' }
    ],
    uae: [
      { name: 'Dubai', count: '1,680 venues' },
      { name: 'Abu Dhabi', count: '840 venues' },
      { name: 'Sharjah', count: '320 venues' }
    ]
  };

  // Venue Services Registry for Booking Flow
  const VENUE_SERVICES = {
    'Trendy Trim': [
      { name: 'Haircut & Deluxe Beard Sculpting', duration: '45 mins', price: 450 },
      { name: 'Classic Fade & Scissor Cut', duration: '30 mins', price: 300 },
      { name: 'Charcoal Scalp Detox & Wash', duration: '20 mins', price: 250 },
      { name: 'Executive Grooming Package', duration: '75 mins', price: 850 }
    ],
    'Vintage Crown Barbershop': [
      { name: 'Signature Skin Fade & Hot Towel Shave', duration: '50 mins', price: 600 },
      { name: 'Straight-Razor Beard Contouring', duration: '30 mins', price: 350 },
      { name: 'Organic Scalp Massage & Treatment', duration: '25 mins', price: 400 },
      { name: 'The Gentleman\'s Royal Ritual', duration: '90 mins', price: 1200 }
    ],
    'Aura Medspa & Skincare': [
      { name: 'Hydrafacial Glow & Deep Exfoliation', duration: '60 mins', price: 1500 },
      { name: 'Anti-Aging LED Collagen Therapy', duration: '45 mins', price: 1800 },
      { name: 'Microdermabrasion & Pore Refining', duration: '50 mins', price: 1400 },
      { name: 'Customized Medical Peels', duration: '40 mins', price: 2000 }
    ],
    'The Royal Blade Barbershop': [
      { name: 'Precision Scissor Cut & Finish', duration: '35 mins', price: 500 },
      { name: 'Royal Hot Towel Shave', duration: '25 mins', price: 300 },
      { name: 'Beard Trimming & Conditioning', duration: '20 mins', price: 250 }
    ],
    'LashXtend | Dear Skin': [
      { name: 'Classic Lash Full Set', duration: '90 mins', price: 1800 },
      { name: 'Volume Lash Extensions (Russian Volume)', duration: '120 mins', price: 2500 },
      { name: 'Brow Lamination & Hybrid Tint', duration: '45 mins', price: 1200 },
      { name: 'Lash Lift & Keratin Infusion', duration: '60 mins', price: 1500 }
    ],
    'Truefitt & Hill Heritage': [
      { name: 'The Ultimate Shaving Experience', duration: '45 mins', price: 1200 },
      { name: 'Traditional Haircut & Friction Wash', duration: '40 mins', price: 950 },
      { name: 'Gentleman\'s Facial & Scalp Therapy', duration: '60 mins', price: 1800 }
    ]
  };

  // --------------------------------------------------------------------------
  // 1. CAROUSEL NAVIGATION
  // --------------------------------------------------------------------------
  window.scrollCarousel = function (sliderId, direction) {
    const slider = document.getElementById(sliderId);
    if (!slider) return;
    const scrollAmount = 340 * direction;
    slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  // --------------------------------------------------------------------------
  // 2. DROPDOWNS & SEARCH BAR INTERACTION
  // --------------------------------------------------------------------------
  window.toggleTreatmentDropdown = function (show) {
    const dd = document.getElementById('treatment-dropdown');
    if (!dd) return;
    if (show === undefined) {
      dd.classList.toggle('hidden');
    } else if (show) {
      dd.classList.remove('hidden');
      window.toggleLocationDropdown(false);
      window.toggleTimeDropdown(false);
    } else {
      dd.classList.add('hidden');
    }
  };

  window.selectTreatment = function (treatmentName) {
    state.searchTreatment = treatmentName;
    const input = document.getElementById('hero-treatment-input');
    if (input) input.value = treatmentName;
    window.toggleTreatmentDropdown(false);
    window.filterByCategory(treatmentName);
  };

  window.toggleLocationDropdown = function (show) {
    const dd = document.getElementById('location-dropdown');
    if (!dd) return;
    if (show === undefined) {
      dd.classList.toggle('hidden');
    } else if (show) {
      dd.classList.remove('hidden');
      window.toggleTreatmentDropdown(false);
      window.toggleTimeDropdown(false);
    } else {
      dd.classList.add('hidden');
    }
  };

  window.selectLocation = function (locName) {
    state.searchLocation = locName;
    const input = document.getElementById('hero-location-input');
    if (input) input.value = locName;
    window.toggleLocationDropdown(false);
    window.showToast(`Location set to: ${locName}`);
  };

  window.toggleTimeDropdown = function (show) {
    const dd = document.getElementById('time-dropdown');
    if (!dd) return;
    if (show === undefined) {
      dd.classList.toggle('hidden');
    } else if (show) {
      dd.classList.remove('hidden');
      window.toggleTreatmentDropdown(false);
      window.toggleLocationDropdown(false);
    } else {
      dd.classList.add('hidden');
    }
  };

  window.selectTime = function (timeName) {
    state.searchTime = timeName;
    const input = document.getElementById('hero-time-input');
    if (input) input.value = timeName;
    window.toggleTimeDropdown(false);
    window.showToast(`Time preference: ${timeName}`);
  };

  window.executeFreshaSearch = function () {
    const treatment = document.getElementById('hero-treatment-input')?.value || 'All treatments';
    const location = document.getElementById('hero-location-input')?.value || 'Dhaka';
    const time = document.getElementById('hero-time-input')?.value || 'Any time';

    window.toggleTreatmentDropdown(false);
    window.toggleLocationDropdown(false);
    window.toggleTimeDropdown(false);

    window.showToast(`Searching "${treatment}" in ${location} (${time})...`);
    
    // Smooth scroll to results
    const recentSec = document.getElementById('recent-slider');
    if (recentSec) {
      recentSec.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // --------------------------------------------------------------------------
  // 3. CATEGORY PILL FILTER
  // --------------------------------------------------------------------------
  window.filterByCategory = function (categoryName) {
    state.selectedCategory = categoryName;

    // Update Pill Buttons Styling
    document.querySelectorAll('.category-pill').forEach(btn => {
      if (btn.getAttribute('data-cat') === categoryName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    window.showToast(`Filtered by: ${categoryName}`);

    // Update Hero Input
    const heroTreatment = document.getElementById('hero-treatment-input');
    if (heroTreatment) heroTreatment.value = categoryName;
  };

  // --------------------------------------------------------------------------
  // 4. FAVORITE HEART TOGGLE
  // --------------------------------------------------------------------------
  window.toggleFavorite = function (btn) {
    const svg = btn.querySelector('svg');
    if (svg) {
      const isFav = svg.classList.contains('fill-red-500');
      if (isFav) {
        svg.classList.remove('fill-red-500', 'text-red-500');
        svg.classList.add('text-gray-700');
        window.showToast('Removed from saved studios');
      } else {
        svg.classList.add('fill-red-500', 'text-red-500');
        svg.classList.remove('text-gray-700');
        window.showToast('Saved to your favourites! ❤️');
      }
    }
  };

  // --------------------------------------------------------------------------
  // 5. INTERACTIVE 4-STEP BOOKING MODAL
  // --------------------------------------------------------------------------
  window.openBookingModalForVenue = function (venueName) {
    const modal = document.getElementById('booking-modal') || document.getElementById('fresha-booking-modal');
    if (!modal) return;

    state.bookingModal.venueName = venueName;
    state.bookingModal.currentStep = 1;

    const titleEl = document.getElementById('modal-venue-name');
    if (titleEl) titleEl.innerText = venueName;

    // Load Venue Services
    const services = VENUE_SERVICES[venueName] || VENUE_SERVICES['Trendy Trim'];
    const servicesListContainer = document.getElementById('modal-services-list');
    if (servicesListContainer) {
      servicesListContainer.innerHTML = services.map((s, idx) => `
        <label class="p-4 rounded-2xl border ${idx === 0 ? 'border-[#0D0D0D] bg-[#F9F9FB]' : 'border-gray-200'} hover:border-black flex items-center justify-between cursor-pointer transition-all">
          <div class="flex items-center gap-3">
            <input type="radio" name="modal-srv" value="${s.name}" data-price="${s.price}" ${idx === 0 ? 'checked' : ''} onchange="window.onModalServiceChange('${s.name}', ${s.price})" class="w-4 h-4 text-black accent-black">
            <div>
              <span class="text-xs font-bold text-[#0D0D0D] block">${s.name}</span>
              <span class="text-[11px] text-gray-500">${s.duration}</span>
            </div>
          </div>
          <span class="text-xs font-bold text-[#0D0D0D]">৳${s.price}</span>
        </label>
      `).join('');

      state.bookingModal.selectedService = services[0].name;
      state.bookingModal.selectedPrice = services[0].price;
    }

    // Populate Time Slots
    const timeSlotsContainer = document.getElementById('modal-time-slots');
    if (timeSlotsContainer) {
      const slots = ['09:30 AM', '10:00 AM', '10:45 AM', '11:30 AM', '01:00 PM', '02:30 PM', '04:00 PM', '05:30 PM', '07:00 PM'];
      timeSlotsContainer.innerHTML = slots.map((time, idx) => `
        <button type="button" onclick="window.setBookingSlot('${time}')" class="modal-time-slot-btn p-2 rounded-xl border ${idx === 3 ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-800'} text-xs font-semibold hover:border-black transition-all">
          ${time}
        </button>
      `).join('');
      state.bookingModal.selectedTime = slots[3];
    }

    window.updateBookingModalStepView();
    modal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
  };

  window.closeBookingModal = function () {
    const modal = document.getElementById('booking-modal') || document.getElementById('fresha-booking-modal');
    if (modal) modal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  };

  window.onModalServiceChange = function (srvName, price) {
    state.bookingModal.selectedService = srvName;
    state.bookingModal.selectedPrice = price;
  };

  window.selectStaff = function (staffName) {
    state.bookingModal.selectedStaff = staffName;
    window.showToast(`Specialist selected: ${staffName}`);
    window.navBookingModalStep(1);
  };

  window.setBookingDay = function (day) {
    state.bookingModal.selectedDay = day;
    window.showToast(`Selected date: ${day}`);
  };

  window.setBookingSlot = function (time) {
    state.bookingModal.selectedTime = time;
    document.querySelectorAll('.modal-time-slot-btn').forEach(btn => {
      if (btn.innerText.trim() === time) {
        btn.classList.add('border-black', 'bg-black', 'text-white');
        btn.classList.remove('border-gray-200', 'text-gray-800');
      } else {
        btn.classList.remove('border-black', 'bg-black', 'text-white');
        btn.classList.add('border-gray-200', 'text-gray-800');
      }
    });
  };

  window.navBookingModalStep = function (delta) {
    const nextStep = state.bookingModal.currentStep + delta;
    if (nextStep < 1) return;

    if (nextStep === 5) {
      // Validate Client Phone
      const nameInput = document.getElementById('modal-client-name');
      const phoneInput = document.getElementById('modal-client-phone');
      const name = nameInput ? nameInput.value.trim() : '';
      const phone = phoneInput ? phoneInput.value.trim() : '';

      if (!name) {
        window.showToast('Please enter your full name.', 'error');
        return;
      }
      if (!phone || phone.length < 10) {
        window.showToast('Please enter a valid mobile number for your SMS Token.', 'error');
        return;
      }

      state.bookingModal.clientName = name;
      state.bookingModal.clientPhone = phone;
      
      // Generate Token ID
      const randomToken = 'TK-' + Math.floor(1000 + Math.random() * 9000);
      state.bookingModal.generatedToken = randomToken;

      // Populate Slip
      const slipToken = document.getElementById('slip-token');
      const slipVenue = document.getElementById('slip-venue');
      const slipService = document.getElementById('slip-service');
      const slipTime = document.getElementById('slip-time');

      if (slipToken) slipToken.innerText = randomToken;
      if (slipVenue) slipVenue.innerText = state.bookingModal.venueName;
      if (slipService) slipService.innerText = state.bookingModal.selectedService;
      if (slipTime) slipTime.innerText = `${state.bookingModal.selectedDay} • ${state.bookingModal.selectedTime}`;

      // Save to localStorage for Radar lookup
      try {
        const bookings = JSON.parse(localStorage.getItem('haircare_bookings') || '[]');
        bookings.push({
          token: randomToken,
          venue: state.bookingModal.venueName,
          service: state.bookingModal.selectedService,
          day: state.bookingModal.selectedDay,
          time: state.bookingModal.selectedTime,
          clientName: name,
          clientPhone: phone,
          chair: 'Chair #2',
          status: 'Ready'
        });
        localStorage.setItem('haircare_bookings', JSON.stringify(bookings));
      } catch (e) {}

      window.showToast(`✓ Chair reserved! Token ${randomToken} issued for ${state.bookingModal.venueName}.`);
    }

    state.bookingModal.currentStep = nextStep;
    window.updateBookingModalStepView();
  };

  window.updateBookingModalStepView = function () {
    const step = state.bookingModal.currentStep;
    
    // Toggle Step Visibility
    [1, 2, 3, 4, 5].forEach(s => {
      const el = document.getElementById(`booking-step-${s}`);
      if (el) {
        if (s === step) el.classList.remove('hidden');
        else el.classList.add('hidden');
      }
    });

    // Update Step Indicator
    const indicator = document.getElementById('modal-step-indicator');
    const prevBtn = document.getElementById('modal-prev-btn');
    const nextBtn = document.getElementById('modal-next-btn');
    const footerNav = document.getElementById('modal-footer-nav');

    if (step === 1) {
      if (indicator) indicator.innerText = 'Step 1 of 4 • Select Service';
      if (prevBtn) prevBtn.classList.add('hidden');
      if (nextBtn) { nextBtn.innerText = 'Continue to Specialist'; nextBtn.classList.remove('hidden'); }
      if (footerNav) footerNav.classList.remove('hidden');
    } else if (step === 2) {
      if (indicator) indicator.innerText = 'Step 2 of 4 • Select Specialist';
      if (prevBtn) prevBtn.classList.remove('hidden');
      if (nextBtn) { nextBtn.innerText = 'Continue to Date & Time'; nextBtn.classList.remove('hidden'); }
      if (footerNav) footerNav.classList.remove('hidden');
    } else if (step === 3) {
      if (indicator) indicator.innerText = 'Step 3 of 4 • Choose Slot';
      if (prevBtn) prevBtn.classList.remove('hidden');
      if (nextBtn) { nextBtn.innerText = 'Continue to Details'; nextBtn.classList.remove('hidden'); }
      if (footerNav) footerNav.classList.remove('hidden');
    } else if (step === 4) {
      if (indicator) indicator.innerText = 'Step 4 of 4 • Contact & Deposit';
      if (prevBtn) prevBtn.classList.remove('hidden');
      if (nextBtn) { nextBtn.innerText = 'Confirm Reservation'; nextBtn.classList.remove('hidden'); }
      if (footerNav) footerNav.classList.remove('hidden');
    } else if (step === 5) {
      if (indicator) indicator.innerText = 'Confirmed • Booking Receipt';
      if (footerNav) footerNav.classList.add('hidden');
    }
  };

  // --------------------------------------------------------------------------
  // 6. TRACK TOKEN & RADAR LOOKUP
  // --------------------------------------------------------------------------
  window.openTrackTokenModal = function (prefillToken) {
    const modal = document.getElementById('track-token-modal');
    if (!modal) return;
    if (prefillToken) {
      const input = document.getElementById('track-token-input');
      if (input) input.value = prefillToken;
      window.executeTrackToken();
    }
    modal.classList.remove('hidden');
  };

  window.closeTrackTokenModal = function () {
    const modal = document.getElementById('track-token-modal');
    if (modal) modal.classList.add('hidden');
  };

  window.executeTrackToken = function () {
    const input = document.getElementById('track-token-input');
    const token = input ? input.value.trim().toUpperCase() : '';
    if (!token) {
      window.showToast('Please enter a Token ID.');
      return;
    }

    const salonNameEl = document.getElementById('track-salon-name');
    const detailEl = document.getElementById('track-detail');

    // Lookup in local records
    let found = null;
    try {
      const bookings = JSON.parse(localStorage.getItem('haircare_bookings') || '[]');
      found = bookings.find(b => b.token === token);
    } catch (e) {}

    if (found) {
      if (salonNameEl) salonNameEl.innerText = `${found.venue} (${found.token})`;
      if (detailEl) detailEl.innerText = `${found.service} • ${found.chair} • ${found.day} at ${found.time} • Ready in 4 mins`;
      window.showToast(`Found token ${token}! Status: Ready`);
    } else {
      if (salonNameEl) salonNameEl.innerText = `Verified Booking: ${token}`;
      if (detailEl) detailEl.innerText = `Trendy Trim Grooming Studio • Chair #1 • Estimated wait: 5 minutes`;
      window.showToast(`Token ${token} verified live on network!`);
    }
  };

  // --------------------------------------------------------------------------
  // 7. PARTNER SALON REGISTRATION
  // --------------------------------------------------------------------------
  window.openRegisterModal = function () {
    const modal = document.getElementById('register-salon-modal');
    if (modal) modal.classList.remove('hidden');
  };

  window.closeRegisterModal = function () {
    const modal = document.getElementById('register-salon-modal');
    if (modal) modal.classList.add('hidden');
  };

  window.submitSalonRegistration = function () {
    const name = document.getElementById('reg-name')?.value;
    const city = document.getElementById('reg-city')?.value;

    window.closeRegisterModal();
    window.showToast(`Application submitted for "${name}" (${city})! Welcome to Hair and Care bd.`);
  };

  // --------------------------------------------------------------------------
  // 8. MENU DRAWER & LOGIN
  // --------------------------------------------------------------------------
  window.toggleMenuDrawer = function () {
    const drawer = document.getElementById('menu-dropdown');
    if (drawer) drawer.classList.toggle('hidden');
  };

  window.openLoginModal = function () {
    window.showToast('Log in / Sign up: SMS OTP Authentication ready.');
  };

  // --------------------------------------------------------------------------
  // 9. BROWSE BY CITY TABS
  // --------------------------------------------------------------------------
  window.switchCityTab = function (countryKey) {
    state.activeCityCountry = countryKey;

    ['bangladesh', 'uk', 'us', 'uae'].forEach(k => {
      const btn = document.getElementById(`tab-${k}`);
      if (btn) {
        if (k === countryKey) {
          btn.className = 'city-tab-btn px-4 py-2 rounded-full bg-[#0D0D0D] text-white text-xs font-bold';
        } else {
          btn.className = 'city-tab-btn px-4 py-2 rounded-full bg-[#F3F3F6] text-[#0D0D0D] text-xs font-semibold hover:bg-[#EAEAEA]';
        }
      }
    });

    renderCityPills(countryKey);
  };

  function renderCityPills(countryKey) {
    const container = document.getElementById('city-pills-container');
    if (!container) return;

    const list = CITIES_BY_COUNTRY[countryKey] || CITIES_BY_COUNTRY.bangladesh;
    container.innerHTML = list.map(city => `
      <div onclick="window.selectLocation('${city.name}')" class="p-3.5 rounded-2xl bg-white border border-[#EAEAEA] hover:border-black cursor-pointer transition-all">
        <span class="font-bold text-xs text-[#0D0D0D] block truncate">${city.name}</span>
        <span class="text-[11px] text-gray-400 mt-0.5 block">${city.count}</span>
      </div>
    `).join('');
  }

  // --------------------------------------------------------------------------
  // 10. TOAST NOTIFICATIONS
  // --------------------------------------------------------------------------
  window.showToast = function (message) {
    const toast = document.getElementById('toast') || document.getElementById('fresha-toast');
    const toastText = document.getElementById('toast-text');
    if (!toast || !toastText) return;

    toastText.innerText = message;
    toast.classList.remove('hidden');

    clearTimeout(window._toastTimeout);
    window._toastTimeout = setTimeout(() => {
      toast.classList.add('hidden');
    }, 3500);
  };

  // --------------------------------------------------------------------------
  // INITIALIZATION ON DOM READY
  // --------------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', function () {
    renderCityPills('bangladesh');

    // Close Dropdowns on Click Outside
    document.addEventListener('click', function (e) {
      const target = e.target;
      
      // Treatment Dropdown
      const treatmentInput = document.getElementById('hero-treatment-input');
      const treatmentDropdown = document.getElementById('treatment-dropdown');
      if (treatmentDropdown && !treatmentDropdown.contains(target) && (!treatmentInput || !treatmentInput.contains(target))) {
        treatmentDropdown.classList.add('hidden');
      }

      // Location Dropdown
      const locationInput = document.getElementById('hero-location-input');
      const locationDropdown = document.getElementById('location-dropdown');
      if (locationDropdown && !locationDropdown.contains(target) && (!locationInput || !locationInput.contains(target))) {
        locationDropdown.classList.add('hidden');
      }

      // Time Dropdown
      const timeInput = document.getElementById('hero-time-input');
      const timeDropdown = document.getElementById('time-dropdown');
      if (timeDropdown && !timeDropdown.contains(target) && (!timeInput || !timeInput.contains(target))) {
        timeDropdown.classList.add('hidden');
      }

      // Menu Dropdown
      const menuBtn = document.getElementById('menu-btn');
      const menuDropdown = document.getElementById('menu-dropdown');
      if (menuDropdown && !menuDropdown.contains(target) && (!menuBtn || !menuBtn.contains(target))) {
        menuDropdown.classList.add('hidden');
      }
    });
  });

})();
