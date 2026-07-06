document.addEventListener('DOMContentLoaded', () => {

  // ===== Scroll Progress =====
  const scrollProgress = document.getElementById('scrollProgress');
  if (scrollProgress) {
    window.addEventListener('scroll', () => {
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      scrollProgress.style.width = (winScroll / height) * 100 + '%';
    });
  }

  // ===== Header Scroll Effect =====
  const header = document.getElementById('header');
  const backToTop = document.getElementById('backToTop');

  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 80);
      if (backToTop) {
        backToTop.classList.toggle('visible', window.scrollY > 500);
      }
    });
  }

  // ===== Mobile Nav Toggle =====
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');
  let navOverlay;

  if (hamburger && nav) {
    navOverlay = document.createElement('div');
    navOverlay.className = 'nav-overlay';
    document.body.appendChild(navOverlay);

    function closeNav() {
      hamburger.classList.remove('active');
      nav.classList.remove('open');
      navOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', () => {
      const isOpen = nav.classList.contains('open');
      hamburger.classList.toggle('active');
      nav.classList.toggle('open');
      navOverlay.classList.toggle('active');
      document.body.style.overflow = isOpen ? '' : 'hidden';
    });

    navOverlay.addEventListener('click', closeNav);

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', closeNav);
    });
  }

  // ===== Active Nav (based on current page) =====
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    }
  });

  // ===== Hero Slider (index page only) =====
  const slides = document.querySelectorAll('.slide');
  const slidePrev = document.getElementById('slidePrev');
  const slideNext = document.getElementById('slideNext');

  if (slides.length && slidePrev && slideNext) {
    let currentSlide = 0;
    let slideInterval;
    let initialLoad = true;

    function goToSlide(index) {
      slides.forEach((s, i) => {
        s.classList.remove('active');
        const video = s.querySelector('video');
        if (video) { video.pause(); video.preload = 'none'; }
      });
      currentSlide = (index + slides.length) % slides.length;
      slides[currentSlide].classList.add('active');
      const activeVideo = slides[currentSlide].querySelector('video');
      if (activeVideo) {
        activeVideo.preload = 'auto';
        if (!initialLoad) activeVideo.load();
        initialLoad = false;
        activeVideo.currentTime = 0;
        activeVideo.play().catch(() => {});
        // Preload the next slide's video
        const nextIndex = (currentSlide + 1) % slides.length;
        const nextVideo = slides[nextIndex].querySelector('video');
        if (nextVideo) { setTimeout(() => { nextVideo.preload = 'auto'; nextVideo.load(); }, 2000); }
      }
    }

    function nextSlide() { goToSlide(currentSlide + 1); }
    function prevSlide() { goToSlide(currentSlide - 1); }

    slideNext.addEventListener('click', () => { nextSlide(); resetInterval(); });
    slidePrev.addEventListener('click', () => { prevSlide(); resetInterval(); });

    function resetInterval() {
      clearInterval(slideInterval);
      slideInterval = setInterval(nextSlide, 6000);
    }
    slideInterval = setInterval(nextSlide, 6000);

    // Start first slide (triggers preload of next video)
    goToSlide(0);

    // Parallax on mouse move
    const hero = document.querySelector('.hero');
    if (hero) {
      hero.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 10;
        const y = (e.clientY / window.innerHeight - 0.5) * 10;
        slides.forEach(slide => {
          if (slide.classList.contains('active')) {
            slide.style.transform = `translate(${x}px, ${y}px) scale(1)`;
          }
        });
      });
      hero.addEventListener('mouseleave', () => {
        slides.forEach(slide => {
          if (slide.classList.contains('active')) {
            slide.style.transform = 'scale(1)';
          }
        });
      });
    }
  }

  // ===== Counter Animation =====
  const counters = document.querySelectorAll('.stat-number');
  let countersAnimated = false;

  function animateCounters() {
    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-count'));
      const parent = counter.closest('.stat-item, .stats-item');
      const suffix = parent ? (parent.querySelector('.stat-label')?.textContent.includes('%') ? '%' : '') : '';
      let current = 0;
      const increment = Math.ceil(target / 60);

      function update() {
        current += increment;
        if (current >= target) {
          counter.textContent = target + suffix;
          return;
        }
        counter.textContent = current + suffix;
        requestAnimationFrame(update);
      }
      update();
    });
  }

  // ===== Scroll Reveal =====
  const revealElements = document.querySelectorAll('.reveal');

  // Stagger reveal delay for gallery items
  document.querySelectorAll('.gallery-item.reveal').forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.08}s`;
  });
  document.querySelectorAll('.service-card.reveal').forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.1}s`;
  });

  function checkReveal() {
    const windowHeight = window.innerHeight;
    revealElements.forEach(el => {
      if (el.getBoundingClientRect().top < windowHeight - 120) {
        el.classList.add('visible');
      }
    });

    if (!countersAnimated && counters.length) {
      const firstCounter = counters[0];
      if (firstCounter.getBoundingClientRect().top < windowHeight - 100) {
        animateCounters();
        countersAnimated = true;
      }
    }
  }

  window.addEventListener('scroll', checkReveal);
  window.addEventListener('load', () => setTimeout(checkReveal, 200));
  checkReveal();

  // ===== Gallery Filter (gallery page) =====
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  if (filterBtns.length && galleryItems.length) {
    galleryItems.forEach(item => {
      item.style.transition = 'opacity 0.3s, transform 0.3s';
    });

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');

        galleryItems.forEach((item, i) => {
          if (filter === 'all' || item.getAttribute('data-category') === filter) {
            item.style.display = 'block';
            setTimeout(() => { item.style.opacity = '1'; item.style.transform = 'scale(1)'; }, 50 + i * 60);
          } else {
            item.style.opacity = '0';
            item.style.transform = 'scale(0.8)';
            setTimeout(() => { item.style.display = 'none'; }, 300);
          }
        });
      });
    });
  }

  // ===== Gallery Image Mouse Parallax =====
  galleryItems.forEach(item => {
    const img = item.querySelector('img');
    if (!img) return;

    item.addEventListener('mousemove', e => {
      const rect = item.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      img.style.transform = `scale(1.18) translate(${x * 20}px, ${y * 20}px)`;
    });

    item.addEventListener('mouseleave', () => {
      img.style.transform = '';
    });
  });

  // ===== Service Cards 3D Tilt =====
  const serviceCards = document.querySelectorAll('.service-card');
  serviceCards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotateX = (y - 0.5) * -12;
      const rotateY = (x - 0.5) * 12;
      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // ===== Testimonials Slider (index page) =====
  const track = document.getElementById('testimonialTrack');
  const testiDots = document.getElementById('testiDots');
  const testiPrev = document.getElementById('testiPrev');
  const testiNext = document.getElementById('testiNext');

  if (track && testiDots && testiPrev && testiNext) {
    const testiCards = track.querySelectorAll('.testimonial-card');
    let currentTesti = 0;

    testiCards.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.classList.add('dot');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goToTestimonial(i));
      testiDots.appendChild(dot);
    });

    function goToTestimonial(index) {
      currentTesti = (index + testiCards.length) % testiCards.length;
      track.style.transform = `translateX(-${currentTesti * 100}%)`;
      testiDots.querySelectorAll('.dot').forEach((d, i) => {
        d.classList.toggle('active', i === currentTesti);
      });
    }

    testiNext.addEventListener('click', () => goToTestimonial(currentTesti + 1));
    testiPrev.addEventListener('click', () => goToTestimonial(currentTesti - 1));

    let testiInterval = setInterval(() => goToTestimonial(currentTesti + 1), 5000);
    track.addEventListener('mouseenter', () => clearInterval(testiInterval));
    track.addEventListener('mouseleave', () => {
      testiInterval = setInterval(() => goToTestimonial(currentTesti + 1), 5000);
    });
  }

  // ===== Contact Form =====
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('.btn-submit');
      const originalText = btn.innerHTML;
      btn.innerHTML = '<span>Sending...</span><i class="fas fa-spinner fa-spin"></i>';
      btn.disabled = true;

      setTimeout(() => {
        btn.innerHTML = '<span>Message Sent!</span><i class="fas fa-check"></i>';
        btn.style.background = '#22c55e';
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.background = '';
          btn.disabled = false;
          contactForm.reset();
        }, 2000);
      }, 1500);
    });
  }

  // ===== Newsletter Form =====
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = newsletterForm.querySelector('input');
      const btn = newsletterForm.querySelector('.btn');
      const email = input.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        input.style.borderColor = '#ef4444';
        input.setAttribute('placeholder', 'Please enter a valid email (e.g., abc@gmail.com)');
        input.value = '';
        setTimeout(() => {
          input.style.borderColor = '';
          input.setAttribute('placeholder', 'Enter your email address');
        }, 3000);
        return;
      }

      input.style.borderColor = '';
      const originalText = btn.textContent;
      btn.textContent = 'Subscribed!';
      btn.style.background = '#22c55e';

      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        input.value = '';
        input.setAttribute('placeholder', 'Enter your email address');
      }, 2000);
    });
  }

  // ===== Destination Search & Filter (destinations page) =====
  const destSearch = document.getElementById('destSearch');
  const regionFilter = document.getElementById('regionFilter');
  const priceFilter = document.getElementById('priceFilter');
  const destCards = document.querySelectorAll('.dest-card');

  function filterDestinations() {
    const query = destSearch ? destSearch.value.toLowerCase() : '';
    const region = regionFilter ? regionFilter.value : 'all';
    const price = priceFilter ? priceFilter.value : 'all';

    destCards.forEach(card => {
      const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
      const tags = card.querySelector('.dest-tags')?.textContent.toLowerCase() || '';
      const cardRegion = card.getAttribute('data-region') || '';
      const cardPrice = parseInt(card.getAttribute('data-price')) || 0;

      const matchesSearch = title.includes(query) || tags.includes(query);
      const matchesRegion = region === 'all' || cardRegion === region;
      let matchesPrice = price === 'all';
      if (!matchesPrice) {
        if (price === 'budget') matchesPrice = cardPrice < 1000;
        else if (price === 'mid') matchesPrice = cardPrice >= 1000 && cardPrice <= 1500;
        else if (price === 'premium') matchesPrice = cardPrice > 1500;
      }

      if (matchesSearch && matchesRegion && matchesPrice) {
        card.style.display = 'block';
        setTimeout(() => { card.style.opacity = '1'; card.style.transform = ''; }, 50);
      } else {
        card.style.opacity = '0';
        card.style.transform = 'scale(0.9)';
        setTimeout(() => { card.style.display = 'none'; }, 300);
      }
    });
  }

  if (destCards.length) {
    destCards.forEach(c => { c.style.transition = 'opacity 0.3s, transform 0.3s'; });
    if (destSearch) destSearch.addEventListener('input', filterDestinations);
    if (regionFilter) regionFilter.addEventListener('change', filterDestinations);
    if (priceFilter) priceFilter.addEventListener('change', filterDestinations);
  }

  // ===== Package Pricing Toggle (packages page) =====
  const toggleBtns = document.querySelectorAll('.toggle-btn');
  if (toggleBtns.length) {
    const priceAmounts = document.querySelectorAll('.price-amount');
    const periods = document.querySelectorAll('.pkg-price .period');

    toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        toggleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const plan = btn.getAttribute('data-plan');

        priceAmounts.forEach(el => {
          const personPrice = el.getAttribute('data-person');
          const groupPrice = el.getAttribute('data-group');
          el.textContent = plan === 'monthly' ? personPrice : groupPrice;
        });

        periods.forEach(el => {
          el.textContent = plan === 'monthly' ? '/person' : '/group';
        });
      });
    });
  }

  // ===== Auth Forms =====
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = loginForm.querySelector('.btn-submit');
      const original = btn.innerHTML;
      btn.innerHTML = '<span>Signing In...</span><i class="fas fa-spinner fa-spin"></i>';
      btn.disabled = true;
      setTimeout(() => {
        btn.innerHTML = '<span>Welcome Back!</span><i class="fas fa-check"></i>';
        btn.style.background = '#22c55e';
        setTimeout(() => {
          btn.innerHTML = original;
          btn.style.background = '';
          btn.disabled = false;
          const role = document.querySelector('input[name="role"]:checked');
          const email = loginForm.querySelector('input[type="email"]').value;
          loginForm.reset();
          const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
          localStorage.setItem('userName', name);
          localStorage.setItem('userEmail', email);
          localStorage.setItem('userRole', role ? role.value : 'user');
          window.location.href = role && role.value === 'admin' ? 'admin-dashboard.html' : 'user-dashboard.html';
        }, 1200);
      }, 1500);
    });
  }

  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = signupForm.querySelector('.btn-submit');
      const original = btn.innerHTML;
      btn.innerHTML = '<span>Creating Account...</span><i class="fas fa-spinner fa-spin"></i>';
      btn.disabled = true;
      setTimeout(() => {
        btn.innerHTML = '<span>Account Created!</span><i class="fas fa-check"></i>';
        btn.style.background = '#22c55e';
        setTimeout(() => {
          btn.innerHTML = original;
          btn.style.background = '';
          btn.disabled = false;
          const role = document.querySelector('input[name="role"]:checked');
          const inputs = signupForm.querySelectorAll('.form-control');
          const fullName = inputs[0].value + ' ' + inputs[1].value;
          const signupEmail = inputs[2].value;
          signupForm.reset();
          localStorage.setItem('userName', fullName);
          localStorage.setItem('userEmail', signupEmail);
          localStorage.setItem('userRole', role ? role.value : 'user');
          window.location.href = role && role.value === 'admin' ? 'admin-dashboard.html' : 'user-dashboard.html';
        }, 1200);
      }, 1500);
    });
  }

  // ===== Dashboard Tab Switching =====
  const sidebarLinks = document.querySelectorAll('.sidebar-link');
  if (sidebarLinks.length) {
    sidebarLinks.forEach(link => {
      const tab = link.getAttribute('data-tab');
      if (!tab) return;
      link.addEventListener('click', (e) => {
        e.preventDefault();
        sidebarLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        document.querySelectorAll('.dash-tab').forEach(t => t.classList.remove('active'));
        const target = document.getElementById('tab-' + tab);
        if (target) target.classList.add('active');
      });
    });
  }

  // ===== Dashboard Logout =====
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'index.html';
    });
  }

  // ===== Dashboard Sidebar Toggle =====
  const dashHamburger = document.getElementById('dashHamburger');
  const dashSidebar = document.getElementById('dashSidebar');

  if (dashHamburger && dashSidebar) {
    dashHamburger.addEventListener('click', () => {
      dashHamburger.classList.toggle('active');
      dashSidebar.classList.toggle('open');
      document.body.style.overflow = dashSidebar.classList.contains('open') ? 'hidden' : '';
    });

    dashSidebar.querySelectorAll('.sidebar-link').forEach(link => {
      link.addEventListener('click', () => {
        dashHamburger.classList.remove('active');
        dashSidebar.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // ===== Dashboard User Initialization =====
  if (document.querySelector('.dash-sidebar')) {
    const userName = localStorage.getItem('userName') || 'User';
    const userEmail = localStorage.getItem('userEmail') || '';
    const sidebarUser = document.querySelector('.sidebar-user');
    if (sidebarUser) {
      const nameEl = sidebarUser.querySelector('h4');
      const emailEl = sidebarUser.querySelector('span');
      if (nameEl) nameEl.textContent = userName;
      if (emailEl && userEmail) emailEl.textContent = userEmail;
    }
    const welcomeHeading = document.querySelector('.dash-header h2');
    if (welcomeHeading && welcomeHeading.textContent.includes('Welcome back')) {
      welcomeHeading.textContent = 'Welcome back, ' + userName + '!';
    }
    const profileForm = document.querySelector('.profile-form');
    if (profileForm) {
      const inputs = profileForm.querySelectorAll('.form-control');
      const nameParts = userName.split(' ');
      if (inputs[0] && nameParts[0]) inputs[0].value = nameParts[0];
      if (inputs[1] && nameParts.slice(1).join(' ')) inputs[1].value = nameParts.slice(1).join(' ');
      if (inputs[2] && userEmail) inputs[2].value = userEmail;
    }
    const profileAvatarName = document.querySelector('.profile-avatar h4');
    const profileAvatarSub = document.querySelector('.profile-avatar span');
    if (profileAvatarName) profileAvatarName.textContent = userName;
    if (profileAvatarSub && userEmail) profileAvatarSub.textContent = userEmail;
  }

  // ===== Dashboard Charts =====
  if (typeof Chart !== 'undefined') {
    Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

    // Admin: Revenue Chart
    const revCtx = document.getElementById('revenueChart');
    if (revCtx) {
      new Chart(revCtx, {
        type: 'line',
        data: {
          labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
          datasets: [{
            label: 'Revenue ($K)',
            data: [18, 22, 28, 25, 32, 38, 35, 42, 48, 44, 52, 58],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59,130,246,0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#3b82f6',
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' } },
            x: { grid: { display: false } }
          }
        }
      });
    }

    // Admin: Booking Status Pie
    const pieCtx = document.getElementById('bookingPieChart');
    if (pieCtx) {
      new Chart(pieCtx, {
        type: 'doughnut',
        data: {
          labels: ['Confirmed', 'Pending', 'Cancelled'],
          datasets: [{
            data: [845, 278, 124],
            backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
            borderWidth: 0,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          cutout: '70%',
          plugins: {
            legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, pointStyle: 'circle' } }
          }
        }
      });
    }

    // Admin: Destinations Bar Chart
    const destCtx = document.getElementById('destChart');
    if (destCtx) {
      new Chart(destCtx, {
        type: 'bar',
        data: {
          labels: ['Bali', 'Paris', 'Maldives', 'Tokyo', 'Santorini', 'Barcelona'],
          datasets: [{
            label: 'Bookings',
            data: [342, 287, 218, 195, 167, 142],
            backgroundColor: ['#f97316','#3b82f6','#10b981','#8b5cf6','#f59e0b','#ec4899'],
            borderRadius: 6,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' } },
            x: { grid: { display: false } }
          }
        }
      });
    }

    // Admin: Growth Chart
    const growthCtx = document.getElementById('growthChart');
    if (growthCtx) {
      new Chart(growthCtx, {
        type: 'line',
        data: {
          labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
          datasets: [{
            label: 'Growth %',
            data: [3, 5, 8, 6, 12, 10, 14, 18, 22, 20, 25, 28],
            borderColor: '#8b5cf6',
            backgroundColor: 'rgba(139,92,246,0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointBackgroundColor: '#8b5cf6',
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' } },
            x: { grid: { display: false } }
          }
        }
      });
    }

    // User: Trips by Month
    const tripsCtx = document.getElementById('tripsChart');
    if (tripsCtx) {
      new Chart(tripsCtx, {
        type: 'bar',
        data: {
          labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
          datasets: [{
            label: 'Trips',
            data: [1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0],
            backgroundColor: '#3b82f6',
            borderRadius: 6,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: 'rgba(0,0,0,0.04)' } },
            x: { grid: { display: false } }
          }
        }
      });
    }

    // User: Travel Categories Pie
    const catCtx = document.getElementById('categoryChart');
    if (catCtx) {
      new Chart(catCtx, {
        type: 'doughnut',
        data: {
          labels: ['Beach', 'Mountain', 'City', 'Culture'],
          datasets: [{
            data: [5, 3, 7, 2],
            backgroundColor: ['#06b6d4', '#10b981', '#f97316', '#8b5cf6'],
            borderWidth: 0,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          cutout: '70%',
          plugins: {
            legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, pointStyle: 'circle' } }
          }
        }
      });
    }
  }

  console.log('%c Stackly ✈️ ', 'background: #f97316; color: #fff; font-size: 1.5rem; padding: 12px 24px; border-radius: 8px; font-weight: bold;');
  console.log('%c Your journey begins here! ', 'font-size: 1rem; color: #1e293b;');
});
