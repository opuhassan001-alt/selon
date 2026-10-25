/**
 * SalonBD — Online Booking & Salon Directory Engine
 * 100% English Language Architecture.
 * Interactive directory, BST live clock sync, and 5-step advance booking engine.
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. NATIONWIDE SALON DATABASE
  // --------------------------------------------------------------------------
  const SALON_DATABASE = [
    {
      id: 'sln-dhn-01',
      name: 'The Haven Luxury Grooming Studio',
      image: 'assets/studio-haven.jpg',
      division: 'Dhaka',
      district: 'Dhaka',
      area: 'Dhanmondi',
      address: 'Road 27 (Old 16), Dhanmondi, Dhaka-1209',
      phone: '+880 1711-904421',
      openTime: '10:00',
      closeTime: '22:30',
      totalHours: '12.5 Hours Daily',
      startingPrice: 350,
      rating: '4.92',
      reviewsCount: 340,
      verified: true,
      services: ['Executive Haircut', 'Beard Art', 'Hot Towel Shave', 'Charcoal Deep Facial']
    },
    {
      id: 'sln-ban-02',
      name: 'Barberia Craft Studio',
      image: 'assets/studio-barberia.jpg',
      division: 'Dhaka',
      district: 'Dhaka',
      area: 'Banani',
      address: 'Road 11, Block D, Banani, Dhaka-1213',
      phone: '+880 1844-229910',
      openTime: '09:30',
      closeTime: '23:00',
      totalHours: '13.5 Hours Daily',
      startingPrice: 400,
      rating: '4.95',
      reviewsCount: 520,
      verified: true,
      services: ['Skin Fade & Texture', 'Beard Sculpting', 'Scalp Spa', 'Full Grooming']
    },
    {
      id: 'sln-gul-03',
      name: 'Kingsman Barbershop & Spa',
      image: 'assets/service-shave.jpg',
      division: 'Dhaka',
      district: 'Dhaka',
      area: 'Gulshan',
      address: 'Avenue 2, Circle 2, Gulshan, Dhaka-1212',
      phone: '+880 1977-889901',
      openTime: '10:00',
      closeTime: '23:30',
      totalHours: '13.5 Hours Daily',
      startingPrice: 450,
      rating: '4.88',
      reviewsCount: 410,
      verified: true,
      services: ['Royal Shave', 'VIP Styling Cabin', 'Anti-Hairfall Spa', 'Charcoal Facial']
    },
    {
      id: 'sln-mir-04',
      name: 'Vintage Cut Club Mirpur',
      image: 'assets/service-hair.jpg',
      division: 'Dhaka',
      district: 'Dhaka',
      area: 'Mirpur',
      address: 'Near Metro Pillar 240, Mirpur 10, Dhaka-1216',
      phone: '+880 1722-334455',
      openTime: '09:00',
      closeTime: '22:30',
      totalHours: '13.5 Hours Daily',
      startingPrice: 200,
      rating: '4.85',
      reviewsCount: 290,
      verified: true,
      services: ['Classic Scissor Cut', 'Beard Shaping', 'Head Massage', 'Mint Face Wash']
    },
    {
      id: 'sln-utt-05',
      name: 'Gentlemen Groomers Uttara',
      image: 'assets/service-style.jpg',
      division: 'Dhaka',
      district: 'Dhaka',
      area: 'Uttara',
      address: 'Sector 4, Road 7, Rabindra Sarani, Uttara, Dhaka-1230',
      phone: '+880 1611-556677',
      openTime: '09:00',
      closeTime: '22:00',
      totalHours: '13 Hours Daily',
      startingPrice: 250,
      rating: '4.79',
      reviewsCount: 310,
      verified: true,
      services: ['Korean Texture Cut', 'Beard Art', 'Keratin Therapy', 'Charcoal Facial']
    },
    {
      id: 'sln-ctg-06',
      name: 'Royal Cut Lounge & Spa',
      image: 'assets/service-trim.jpg',
      division: 'Chattogram',
      district: 'Chattogram',
      area: 'Outside',
      address: 'Nasirabad CDA Avenue, GEC Circle, Chattogram-4000',
      phone: '+880 1819-876543',
      openTime: '09:30',
      closeTime: '23:00',
      totalHours: '13.5 Hours Daily',
      startingPrice: 250,
      rating: '4.91',
      reviewsCount: 460,
      verified: true,
      services: ['Full Grooming Package', 'Skin Fade & Texture', 'Hair Colouring', 'Beard Art']
    }
  ];

  const MASTER_SERVICES_CATALOG = [
    { name: '01 · Classic Cut (Scissor/Clipper)', price: 350 },
    { name: '02 · Cut & Beard Sculpt', price: 550 },
    { name: '03 · Hot Towel Straight Razor Shave', price: 400 },
    { name: '04 · Precision Skin Fade', price: 400 },
    { name: '05 · Shape & Clean Lineup', price: 250 },
    { name: '06 · The Works (Cut, Beard & Facial)', price: 950 }
  ];

  let currentFilter = 'all';
  let activeBookingSalon = SALON_DATABASE[0];
  let selectedServices = [MASTER_SERVICES_CATALOG[0]];

  // --------------------------------------------------------------------------
  // 2. BST (UTC+6) LIVE TIME ENGINE
  // --------------------------------------------------------------------------
  function getBSTDate() {
    const now = new Date();
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    return new Date(utcTime + (6 * 3600000));
  }

  function formatTimeAmPm(hours, minutes) {
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${displayHours}:${displayMinutes} ${ampm}`;
  }

  function formatTimeString(timeStr) {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    return formatTimeAmPm(h, m);
  }

  function calculateSalonStatus(openTimeStr, closeTimeStr) {
    const bstNow = getBSTDate();
    const currentHour = bstNow.getHours();
    const currentMinute = bstNow.getMinutes();
    const currentTotalMinutes = (currentHour * 60) + currentMinute;

    const [openH, openM] = openTimeStr.split(':').map(Number);
    const [closeH, closeM] = closeTimeStr.split(':').map(Number);

    const openTotalMinutes = (openH * 60) + openM;
    const closeTotalMinutes = (closeH * 60) + closeM;

    const isOpen = currentTotalMinutes >= openTotalMinutes && currentTotalMinutes < closeTotalMinutes;
    const openFormatted = formatTimeAmPm(openH, openM);
    const closeFormatted = formatTimeAmPm(closeH, closeM);
    const hoursRange = `${openFormatted} – ${closeFormatted}`;

    if (isOpen) {
      const minutesRemaining = closeTotalMinutes - currentTotalMinutes;
      const hLeft = Math.floor(minutesRemaining / 60);
      const mLeft = minutesRemaining % 60;
      const timeLeftStr = hLeft > 0 ? `${hLeft}h ${mLeft}m` : `${mLeft}m`;
      return {
        isOpen: true,
        hoursRange: hoursRange,
        statusText: 'Open now',
        hint: `Closes in ${timeLeftStr}`
      };
    } else {
      return {
        isOpen: false,
        hoursRange: hoursRange,
        statusText: 'Closed',
        hint: `Opens at ${openFormatted}`
      };
    }
  }

  function updateBSTClock() {
    const clockEl = document.getElementById('live-bst-clock');
    if (!clockEl) return;
    const bst = getBSTDate();
    const formatted = formatTimeAmPm(bst.getHours(), bst.getMinutes());
    clockEl.innerText = `Dhaka Time · ${formatted}`;
  }

  // --------------------------------------------------------------------------
  // 3. RENDER SALON DIRECTORY GRID (FRESHA LIGHT AESTHETIC)
  // --------------------------------------------------------------------------
  function renderSalonDirectoryGrid(filterArea = 'all', searchQuery = '') {
    const gridEl = document.getElementById('salon-directory-grid');
    if (!gridEl) return;

    let filtered = SALON_DATABASE;

    if (filterArea !== 'all') {
      if (filterArea === 'Outside') {
        filtered = filtered.filter(s => !['Dhanmondi', 'Banani', 'Gulshan', 'Mirpur', 'Uttara'].includes(s.area));
      } else {
        filtered = filtered.filter(s => s.area.toLowerCase().includes(filterArea.toLowerCase()) || s.district.toLowerCase().includes(filterArea.toLowerCase()));
      }
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.area.toLowerCase().includes(q) || 
        s.district.toLowerCase().includes(q) ||
        s.services.some(srv => srv.toLowerCase().includes(q))
      );
    }

    if (filtered.length === 0) {
      gridEl.innerHTML = `
        <div class="col-span-full py-16 text-center border border-dashed border-[#243050] rounded bg-[#111a2e] text-xs text-[#7e8aa8] font-mono">
          No verified studios found matching your criteria. Try selecting another district or service.
        </div>
      `;
      return;
    }

    gridEl.innerHTML = filtered.map((salon) => {
      const status = calculateSalonStatus(salon.openTime, salon.closeTime);

      return `
        <div class="kingston-card bg-[#111a2e] border border-[#243050] rounded overflow-hidden flex flex-col justify-between group hover:border-[#e8220a]/50 transition-all duration-300">
          
          <!-- Card Image & Overlay Badges -->
          <div class="relative h-52 overflow-hidden bg-[#0c1220]">
            <img 
              src="${salon.image || 'assets/studio-haven.jpg'}" 
              alt="${salon.name}" 
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-[0.85]"
            />
            
            <!-- Category Tag (Top Left) -->
            <div class="absolute top-3.5 left-3.5">
              <span class="font-mono text-[10px] px-2.5 py-1 uppercase tracking-wider font-bold bg-[#172138]/90 border border-[#243050] text-[#e8220a] backdrop-blur-sm">
                Master Studio
              </span>
            </div>

            <!-- Rating Pill (Top Right) -->
            <div class="absolute top-3.5 right-3.5 px-2.5 py-1 rounded bg-[#172138]/90 border border-[#243050] text-white text-xs font-mono font-bold flex items-center gap-1 backdrop-blur-sm">
              <span class="text-[#e8220a]">★</span>
              <span>${salon.rating}</span>
              <span class="text-[#7e8aa8] font-normal">(${salon.reviewsCount})</span>
            </div>
          </div>

          <!-- Card Content Body -->
          <div class="p-5 flex-1 flex flex-col justify-between">
            <div>
              <div class="mb-3">
                <h3 class="font-display text-lg font-bold text-white group-hover:text-[#e8220a] transition-colors leading-snug">
                  ${salon.name}
                </h3>
                <p class="font-sans text-xs text-[#7e8aa8] mt-1 leading-relaxed">
                  ${salon.area}, ${salon.district} • ${salon.address}
                </p>
              </div>

              <!-- Operating Hours: Single Clean Line -->
              <div class="flex items-center gap-2 py-2 px-3 rounded bg-[#172138] border border-[#243050] my-3 font-mono text-xs">
                <span class="w-2 h-2 rounded-full ${status.isOpen ? 'bg-emerald-400' : 'bg-rose-500'}"></span>
                <span class="font-bold ${status.isOpen ? 'text-emerald-400' : 'text-rose-400'}">${status.statusText}</span>
                <span class="text-[#243050]">·</span>
                <span class="text-[#7e8aa8]">${status.hoursRange}</span>
              </div>

              <!-- Service Tags -->
              <div class="flex flex-wrap gap-1.5 mb-4">
                ${salon.services.slice(0, 3).map(srv => `
                  <span class="font-mono text-[10px] px-2 py-0.5 rounded bg-[#172138] border border-[#243050] text-[#7e8aa8]">
                    ${srv}
                  </span>
                `).join('')}
              </div>
            </div>

            <!-- Card Bottom Bar (Starting Price & Actions) -->
            <div class="pt-4 border-t border-[#243050] flex items-center justify-between mt-auto">
              <div>
                <span class="font-mono text-[9px] text-[#7e8aa8] block uppercase tracking-wider">From</span>
                <span class="font-mono text-base font-black text-white">BDT ${salon.startingPrice}</span>
              </div>

              <div class="flex items-center gap-2">
                <a 
                  href="tel:${salon.phone.replace(/[^0-9+]/g, '')}" 
                  class="p-2 rounded border border-[#243050] hover:border-[#e8220a] text-[#7e8aa8] hover:text-white transition-colors flex items-center gap-1 font-mono text-xs"
                  title="Direct Call: ${salon.phone}"
                >
                  <svg class="w-3.5 h-3.5 text-[#e8220a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                  <span class="hidden sm:inline">Call</span>
                </a>
                
                <button 
                  onclick="window.selectSalonForBooking('${salon.name}', '${salon.area}')" 
                  class="btn-barber-primary px-4 py-2 font-mono text-xs uppercase tracking-wider font-bold"
                >
                  Book Chair →
                </button>
              </div>
            </div>

          </div>

        </div>
      `;
    }).join('');
  }

  // --------------------------------------------------------------------------
  // 4. ADVANCE BOOKING ENGINE CONTROLLER
  // --------------------------------------------------------------------------
  function initBookingEngine() {
    populateBookingSalonDropdown();
    renderBookingServicesCheckboxes();
    generateDynamicTimeSlots();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateInput = document.getElementById('booking-date-input');
    if (dateInput) {
      dateInput.value = tomorrow.toISOString().split('T')[0];
      dateInput.min = new Date().toISOString().split('T')[0];
    }

    updateActiveSalonCard();
  }

  function populateBookingSalonDropdown() {
    const salonSelect = document.getElementById('booking-salon-select');
    if (!salonSelect) return;

    salonSelect.innerHTML = SALON_DATABASE.map(s => `
      <option value="${s.id}" ${s.id === activeBookingSalon.id ? 'selected' : ''}>${s.name} (${s.area})</option>
    `).join('');
  }

  function renderBookingServicesCheckboxes() {
    const container = document.getElementById('booking-services-checkboxes');
    if (!container) return;

    container.innerHTML = MASTER_SERVICES_CATALOG.map((srv, idx) => {
      const isSelected = selectedServices.some(s => s.name === srv.name);
      return `
        <label class="flex items-center justify-between p-4 rounded bg-[#172138] border ${isSelected ? 'border-[#e8220a]' : 'border-[#243050]'} hover:border-[#e8220a]/60 cursor-pointer text-xs transition-colors">
          <div class="flex items-center gap-3">
            <input type="checkbox" value="${srv.name}" data-price="${srv.price}" ${isSelected ? 'checked' : ''} onchange="window.onServiceCheckChange()" class="w-4 h-4 rounded text-[#e8220a] accent-[#e8220a]">
            <span class="text-white font-medium">${srv.name}</span>
          </div>
          <span class="font-mono text-xs font-bold text-[#e8220a]">BDT ${srv.price}</span>
        </label>
      `;
    }).join('');
  }

  window.onServiceCheckChange = function () {
    const checked = document.querySelectorAll('#booking-services-checkboxes input[type="checkbox"]:checked');
    selectedServices = [];
    checked.forEach(c => {
      selectedServices.push({
        name: c.value,
        price: Number(c.dataset.price) || 0
      });
    });
    if (selectedServices.length === 0) {
      selectedServices.push(MASTER_SERVICES_CATALOG[0]);
    }
    updateOrderSummaryBox();
  };

  window.filterBookingSalonsByArea = function (area) {
    let filtered = SALON_DATABASE;
    if (area !== 'all') {
      if (area === 'Outside') {
        filtered = filtered.filter(s => !['Dhanmondi', 'Banani', 'Gulshan', 'Mirpur', 'Uttara'].includes(s.area));
      } else {
        filtered = filtered.filter(s => s.area.toLowerCase().includes(area.toLowerCase()));
      }
    }
    const salonSelect = document.getElementById('booking-salon-select');
    if (salonSelect) {
      salonSelect.innerHTML = filtered.map(s => `<option value="${s.id}">${s.name} (${s.area})</option>`).join('');
      if (filtered.length > 0) {
        activeBookingSalon = filtered[0];
        updateActiveSalonCard();
        generateDynamicTimeSlots();
      }
    }
  };

  window.onBookingSalonChange = function (salonId) {
    const found = SALON_DATABASE.find(s => s.id === salonId);
    if (found) {
      activeBookingSalon = found;
      updateActiveSalonCard();
      generateDynamicTimeSlots();
    }
  };

  function updateActiveSalonCard() {
    const cardEl = document.getElementById('booking-active-salon-card');
    const badgeEl = document.getElementById('booking-salon-window-badge');
    if (!activeBookingSalon) return;

    if (cardEl) {
      const openFormatted = formatTimeString(activeBookingSalon.openTime);
      const closeFormatted = formatTimeString(activeBookingSalon.closeTime);
      cardEl.innerHTML = `
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 w-full">
          <div>
            <h4 class="font-display text-white font-bold text-base">${activeBookingSalon.name}</h4>
            <span class="text-[#7e8aa8] text-xs block font-sans mt-0.5">${activeBookingSalon.address}</span>
            <span class="font-mono text-[#e8220a] text-xs block mt-1 font-semibold">Direct Helpline: ${activeBookingSalon.phone}</span>
          </div>
          <div class="sm:text-right">
            <span class="font-mono text-emerald-400 font-bold text-xs block">Verified Kingston Branch</span>
            <span class="font-mono text-[#7e8aa8] text-xs">${openFormatted} – ${closeFormatted}</span>
          </div>
        </div>
      `;
    }

    if (badgeEl) {
      badgeEl.innerHTML = `
        <span>Schedule: ${activeBookingSalon.openTime} AM – ${activeBookingSalon.closeTime} PM</span>
        <span class="text-[#7e8aa8]">(${activeBookingSalon.totalHours})</span>
      `;
    }

    updateOrderSummaryBox();
  }

  function updateOrderSummaryBox() {
    const box = document.getElementById('booking-order-summary-box');
    if (!box) return;

    const total = selectedServices.reduce((acc, curr) => acc + curr.price, 0);

    box.innerHTML = `
      <div class="flex justify-between text-xs pb-2 border-b border-[#243050]">
        <span class="text-[#7e8aa8]">Selected Studio:</span>
        <strong class="text-white font-display">${activeBookingSalon.name}</strong>
      </div>
      <div class="flex justify-between text-xs py-1">
        <span class="text-[#7e8aa8]">Selected Items:</span>
        <span class="text-white font-mono text-[11px] text-right max-w-[200px]">${selectedServices.map(s => s.name).join(', ')}</span>
      </div>
      <div class="flex justify-between text-xs pt-3 border-t border-[#243050] items-center">
        <span class="text-[#7e8aa8] uppercase font-mono text-[10px] tracking-wider">Estimated Total:</span>
        <strong class="text-[#e8220a] font-mono text-lg font-black">BDT ${total}</strong>
      </div>
    `;
  }

  window.generateDynamicTimeSlots = function () {
    const container = document.getElementById('dynamic-time-slots-container');
    if (!container || !activeBookingSalon) return;

    const [openH, openM] = activeBookingSalon.openTime.split(':').map(Number);
    const [closeH, closeM] = activeBookingSalon.closeTime.split(':').map(Number);

    const slots = [];
    let curMinute = (openH * 60) + openM;
    const endMinute = (closeH * 60) + closeM;

    while (curMinute < endMinute) {
      const h = Math.floor(curMinute / 60);
      const m = curMinute % 60;
      slots.push(formatTimeAmPm(h, m));
      curMinute += 30;
    }

    container.innerHTML = slots.map((timeStr, idx) => `
      <label class="time-slot-pill flex items-center justify-center py-2.5 px-3 rounded bg-[#172138] border border-[#243050] hover:border-[#e8220a] text-[#7e8aa8] hover:text-white cursor-pointer text-center font-mono text-xs transition-all shadow-sm">
        <input type="radio" name="booking-slot" value="${timeStr}" class="sr-only" ${idx === 2 ? 'checked' : ''} onchange="window.handleSlotSelection(this)">
        <span class="w-full text-center slot-label-text">
          ${timeStr}
        </span>
      </label>
    `).join('');

    const initial = container.querySelector('input[name="booking-slot"]:checked');
    if (initial) window.handleSlotSelection(initial);
  };

  window.handleSlotSelection = function (radioEl) {
    document.querySelectorAll('.time-slot-pill').forEach(pill => {
      pill.classList.remove('border-[#e8220a]', 'bg-[#e8220a]', 'text-white', 'shadow-md');
      pill.classList.add('border-[#243050]', 'bg-[#172138]', 'text-[#7e8aa8]');
      const text = pill.querySelector('.slot-label-text');
      if (text) {
        text.classList.remove('text-white', 'font-bold');
        text.classList.add('text-[#7e8aa8]');
      }
    });
    if (radioEl.parentElement) {
      radioEl.parentElement.classList.remove('border-[#243050]', 'bg-[#172138]', 'text-[#7e8aa8]');
      radioEl.parentElement.classList.add('border-[#e8220a]', 'bg-[#e8220a]', 'text-white', 'shadow-md');
      const text = radioEl.parentElement.querySelector('.slot-label-text');
      if (text) {
        text.classList.remove('text-[#7e8aa8]');
        text.classList.add('text-white', 'font-bold');
      }
    }
  };

  window.goToBookingStep = function (stepNumber) {
    for (let i = 1; i <= 5; i++) {
      const panel = document.getElementById(`booking-step-${i}`);
      const navBtn = document.getElementById(`step-nav-${i}`);
      if (panel) panel.classList.add('hidden');
      if (navBtn) {
        if (i < stepNumber) {
          navBtn.className = "relative z-10 w-10 h-10 rounded-full bg-[#172138] border border-[#e8220a] text-[#e8220a] font-mono text-xs font-bold flex items-center justify-center transition-all cursor-pointer";
        } else if (i === stepNumber) {
          navBtn.className = "relative z-10 w-10 h-10 rounded-full bg-[#e8220a] text-white font-mono text-xs font-bold flex items-center justify-center shadow-lg shadow-[#e8220a]/30 cursor-pointer";
        } else {
          navBtn.className = "relative z-10 w-10 h-10 rounded-full bg-[#111a2e] border-2 border-[#243050] text-[#7e8aa8] font-mono text-xs font-bold flex items-center justify-center transition-all cursor-pointer";
        }
      }
    }

    const targetPanel = document.getElementById(`booking-step-${stepNumber}`);
    if (targetPanel) targetPanel.classList.remove('hidden');

    updateOrderSummaryBox();
  };

  // Direct selection helpers for Kingston's sections
  window.selectServiceDirect = function (serviceName, price) {
    const foundService = MASTER_SERVICES_CATALOG.find(s => 
      s.name.toLowerCase().includes(serviceName.toLowerCase()) || 
      serviceName.toLowerCase().includes(s.name.toLowerCase())
    );
    if (foundService) {
      selectedServices = [foundService];
    } else {
      selectedServices = [{ name: serviceName, price: price || 350 }];
    }
    renderBookingServicesCheckboxes();
    updateOrderSummaryBox();
    const engineEl = document.getElementById('booking-engine');
    if (engineEl) engineEl.scrollIntoView({ behavior: 'smooth' });
    window.goToBookingStep(3);
    window.showToast(`Selected: ${serviceName}`);
  };

  window.selectBarberDirect = function (barberName) {
    const stylistSelect = document.getElementById('booking-stylist-select');
    if (stylistSelect) {
      for (let i = 0; i < stylistSelect.options.length; i++) {
        if (stylistSelect.options[i].text.toLowerCase().includes(barberName.toLowerCase())) {
          stylistSelect.selectedIndex = i;
          break;
        }
      }
    }
    const engineEl = document.getElementById('booking-engine');
    if (engineEl) engineEl.scrollIntoView({ behavior: 'smooth' });
    window.goToBookingStep(3);
    window.showToast(`Master Barber selected: ${barberName}`);
  };

  window.selectServiceAndBook = function (serviceName) {
    const foundService = MASTER_SERVICES_CATALOG.find(s => s.name.toLowerCase().includes(serviceName.toLowerCase()) || serviceName.toLowerCase().includes(s.name.toLowerCase()));
    if (foundService) {
      selectedServices = [foundService];
      renderBookingServicesCheckboxes();
    }
    const engineEl = document.getElementById('booking-engine');
    if (engineEl) engineEl.scrollIntoView({ behavior: 'smooth' });
    window.goToBookingStep(3);
    window.showToast(`Service selected: ${serviceName}`);
  };

  window.selectSalonForBooking = function (salonName, area) {
    const found = SALON_DATABASE.find(s => s.name === salonName || s.area === area);
    if (found) {
      activeBookingSalon = found;
      populateBookingSalonDropdown();
      updateActiveSalonCard();
      generateDynamicTimeSlots();
    }
    const engineEl = document.getElementById('booking-engine');
    if (engineEl) engineEl.scrollIntoView({ behavior: 'smooth' });
    window.goToBookingStep(2);
  };

  window.selectStylistBooking = function (stylistName, salonName) {
    window.selectSalonForBooking(salonName, '');
    const stylistSelect = document.getElementById('booking-stylist-select');
    if (stylistSelect) {
      for (let i = 0; i < stylistSelect.options.length; i++) {
        if (stylistSelect.options[i].text.includes(stylistName)) {
          stylistSelect.selectedIndex = i;
          break;
        }
      }
    }
    window.goToBookingStep(3);
  };

  window.submitBookingForm = function () {
    const name = document.getElementById('customer-name').value.trim();
    const phone = document.getElementById('customer-phone').value.trim();
    const date = document.getElementById('booking-date-input').value;
    const slotRadio = document.querySelector('input[name="booking-slot"]:checked');
    const slotTime = slotRadio ? slotRadio.value : '04:30 PM';
    const stylistSelect = document.getElementById('booking-stylist-select');
    const stylist = stylistSelect ? stylistSelect.value : 'Any Master Barber';

    const areaCode = activeBookingSalon.area.substring(0, 3).toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const tokenId = `SLN-${areaCode}-${randomNum}`;

    document.getElementById('slip-token-id').innerText = tokenId;
    document.getElementById('slip-salon-name').innerText = activeBookingSalon.name;
    document.getElementById('slip-salon-address').innerText = activeBookingSalon.address;
    document.getElementById('slip-slot-time').innerText = `${date} @ ${slotTime}`;
    document.getElementById('slip-stylist').innerText = stylist;
    document.getElementById('slip-customer-name').innerText = name;
    document.getElementById('slip-customer-phone').innerText = phone;

    window.goToBookingStep(5);
    window.showToast(`Booking confirmed! Verification Token ID: ${tokenId}`);
  };

  window.resetBookingEngine = function () {
    window.goToBookingStep(1);
  };

  window.printBookingToken = function () {
    window.print();
  };

  window.copyTokenId = function () {
    const tokenId = document.getElementById('slip-token-id').innerText;
    navigator.clipboard.writeText(tokenId).then(() => {
      window.showToast(`Token ID copied to clipboard: ${tokenId}`);
    });
  };

  // --------------------------------------------------------------------------
  // 5. SEARCH & FILTER DISPATCHERS
  // --------------------------------------------------------------------------
  window.handleHeroSearch = function () {
    const q = document.getElementById('hero-search-query').value;
    const area = document.getElementById('hero-area-select').value;
    
    document.querySelectorAll('.filter-tab-btn').forEach(btn => {
      btn.classList.remove('active', 'bg-freshaDark', 'text-white', 'border-freshaDark');
      btn.classList.add('border-freshaBorder', 'bg-white', 'text-freshaDark');
    });

    renderSalonDirectoryGrid(area, q);

    const dirSection = document.getElementById('around-you');
    if (dirSection) dirSection.scrollIntoView({ behavior: 'smooth' });
  };

  window.filterByNavLocation = function (area) {
    currentFilter = area;
    renderSalonDirectoryGrid(area, '');
    const dirSection = document.getElementById('around-you');
    if (dirSection) dirSection.scrollIntoView({ behavior: 'smooth' });
  };

  function setupFilterTabs() {
    const buttons = document.querySelectorAll('.filter-tab-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => {
          b.classList.remove('active', 'bg-freshaDark', 'text-white', 'border-freshaDark');
          b.classList.add('border-freshaBorder', 'bg-white', 'text-freshaDark');
        });
        btn.classList.add('active', 'bg-freshaDark', 'text-white', 'border-freshaDark');
        btn.classList.remove('border-freshaBorder', 'bg-white', 'text-freshaDark');

        const filter = btn.dataset.filter;
        currentFilter = filter;
        renderSalonDirectoryGrid(filter, '');
      });
    });
  }

  // --------------------------------------------------------------------------
  // 7. MODALS, SYNDICATE, NEWSLETTER & TOASTS
  // --------------------------------------------------------------------------
  window.openSyndicateModal = function () {
    const modal = document.getElementById('syndicate-modal');
    if (modal) modal.classList.remove('hidden');
  };

  window.closeSyndicateModal = function () {
    const modal = document.getElementById('syndicate-modal');
    if (modal) modal.classList.add('hidden');
  };

  window.copySyndicateInvite = function () {
    navigator.clipboard.writeText('https://discord.gg/thetrimrealm-syndicate').then(() => {
      window.showToast('Syndicate invite link copied to clipboard!');
    });
  };

  window.openRegisterModal = function () {
    const modal = document.getElementById('register-salon-modal');
    if (modal) modal.classList.remove('hidden');
  };

  window.closeRegisterModal = function () {
    const modal = document.getElementById('register-salon-modal');
    if (modal) modal.classList.add('hidden');
  };

  window.handleSalonRegistration = function () {
    const name = document.getElementById('reg-salon-name').value;
    const division = document.getElementById('reg-division').value;
    const area = document.getElementById('reg-area').value;
    const phone = document.getElementById('reg-phone').value;
    const openT = document.getElementById('reg-open-time').value;
    const closeT = document.getElementById('reg-close-time').value;

    const newSalon = {
      id: `sln-${area.toLowerCase().substring(0, 3)}-${Date.now()}`,
      name: name,
      division: division,
      district: division,
      area: area,
      address: `${area}, ${division}`,
      phone: phone,
      openTime: openT,
      closeTime: closeT,
      totalHours: '13 Hours Daily',
      startingPrice: 300,
      rating: '5.0',
      reviewsCount: 1,
      verified: true,
      services: ['Executive Haircut', 'Beard Trim']
    };

    SALON_DATABASE.unshift(newSalon);
    renderSalonDirectoryGrid('all', '');
    populateBookingSalonDropdown();
    window.closeRegisterModal();
    window.showToast(`Congratulations! "${name}" has been registered successfully.`);
  };

  window.handleNewsletter = function () {
    window.showToast('Thank you! You have successfully subscribed to priority grooming slots & offers.');
  };

  window.copySalonPhone = function (phone, salonName) {
    navigator.clipboard.writeText(phone).then(() => {
      window.showToast(`Phone number copied to clipboard: ${phone} (${salonName})`);
    });
  };

  window.showToast = function (message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'p-3.5 px-5 rounded-full bg-freshaDark text-white text-xs font-medium shadow-2xl flex items-center gap-2.5 pointer-events-auto border border-white/10 animate-fadeIn';
    toast.innerHTML = `<span class="inline-block w-2 h-2 rounded-full bg-freshaGreen"></span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  };

  // --------------------------------------------------------------------------
  // 8. INITIALIZATION
  // --------------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    renderSalonDirectoryGrid('all');
    initBookingEngine();
    setupFilterTabs();

    updateBSTClock();
    setInterval(updateBSTClock, 1000);

    setInterval(() => {
      renderSalonDirectoryGrid(currentFilter);
      updateActiveSalonCard();
    }, 60000);

    const openRegBtn = document.getElementById('open-register-modal-btn');
    if (openRegBtn) openRegBtn.addEventListener('click', window.openRegisterModal);

    // Navbar transparency handler: fully transparent over hero, frosted dark glass when scrolled down
    const mainHeader = document.getElementById('main-header');
    if (mainHeader) {
      const handleNavScroll = () => {
        if (window.scrollY > 60) {
          mainHeader.classList.remove('bg-transparent', 'border-transparent');
          mainHeader.classList.add('bg-[#050508]/90', 'backdrop-blur-md', 'border-[#00F0FF]/20', 'shadow-lg');
        } else {
          mainHeader.classList.add('bg-transparent', 'border-transparent');
          mainHeader.classList.remove('bg-[#050508]/90', 'backdrop-blur-md', 'border-[#00F0FF]/20', 'shadow-lg');
        }
      };
      window.addEventListener('scroll', handleNavScroll, { passive: true });
      handleNavScroll();
    }
  });

})();
