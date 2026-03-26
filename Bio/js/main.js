(function() {
  // ========== CONFIGURATION & CONSTANTS ==========
  const CONFIG_SELECTORS = {
    profileName: '#profileName',
    profileAvatar: '#profileAvatar',
    profileBio: '#profileBio',
    copyright: '#copyright',
    linksList: '#linksList',
    clockTime: '#clockTime',
    greetingText: '#greetingText',
    greetingIcon: '#greetingMsg i',
    clickCount: '#clickCount',
    themeSwitch: '#themeSwitch',
    bioCard: '#bioCard',
    tiltCard: '#tiltCard',
    particleCanvas: '#particle-canvas'
  };

  const ANIMATION_CONFIG = {
    tiltStrength: 8,
    particleMouseRadius: 80,
    particleRepelForce: 1.2,
    rippleAnimationTime: 600,
    linkOpenDelay: 120,
    clockUpdateInterval: 1000,
    initialParticleCount: 90
  };

  // ========== UTILITY FUNCTIONS ==========
  function safeGetElement(selector) {
    const element = document.querySelector(selector);
    if (!element) {
      console.warn(`Element not found: ${selector}`);
    }
    return element;
  }

  function safeSetContent(selector, content, useHTML = false) {
    const element = safeGetElement(selector);
    if (element) {
      if (useHTML) {
        element.innerHTML = content;
      } else {
        element.textContent = content;
      }
    }
  }

  function safeSetAttribute(selector, attribute, value) {
    const element = safeGetElement(selector);
    if (element) {
      element.setAttribute(attribute, value);
    }
  }

  // ========== POPULATE DYNAMIC CONTENT FROM CONFIG ==========
  function initializeProfile() {
    if (typeof CONFIG === 'undefined') {
      console.error('CONFIG object not found');
      return;
    }

    // Profile Information
    safeSetContent(CONFIG_SELECTORS.profileName, CONFIG.profile.name);
    safeSetAttribute(CONFIG_SELECTORS.profileAvatar, 'src', CONFIG.profile.avatar);
    safeSetContent(CONFIG_SELECTORS.profileBio, CONFIG.profile.bio, false); // Using textContent for security
    safeSetContent(
      CONFIG_SELECTORS.copyright,
      `<i class="far fa-copyright"></i> ${CONFIG.profile.copyright}`,
      true
    );

    // Links
    const linksContainer = safeGetElement(CONFIG_SELECTORS.linksList);
    if (linksContainer && CONFIG.links && Array.isArray(CONFIG.links)) {
      linksContainer.innerHTML = ''; // Clear existing links
      CONFIG.links.forEach((link, index) => {
        const linkItem = createLinkElement(link, index);
        linksContainer.appendChild(linkItem);
      });
    }
  }

  function createLinkElement(link, index) {
    const linkItem = document.createElement('a');
    linkItem.className = 'link-item';
    linkItem.setAttribute('data-url', link.url || '');
    linkItem.setAttribute('data-original', link.url || '');
    linkItem.setAttribute('style', `--i:${index + 1}`);
    linkItem.href = '#';
    linkItem.innerHTML = `
      <div class="link-left">
        <div class="link-icon"><i class="${link.icon || 'fas fa-link'}"></i></div>
        <span class="link-text">${link.text || ''} <span class="link-sub">${link.subtext || ''}</span></span>
      </div>
      <div class="link-arrow"><i class="fas fa-arrow-right"></i></div>
    `;
    return linkItem;
  }

  // ========== DYNAMIC CLOCK & GREETING ==========
  function updateTimeAndGreeting() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHour = hours % 12 || 12;
    const timeStr = `${formattedHour}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    safeSetContent(CONFIG_SELECTORS.clockTime, timeStr);

    let greeting = '';
    let icon = '<i class="fas fa-sun"></i>';
    if (hours < 5) {
      greeting = 'Deep night';
      icon = '<i class="fas fa-moon"></i>';
    } else if (hours < 12) {
      greeting = 'Good morning';
      icon = '<i class="fas fa-coffee"></i>';
    } else if (hours < 18) {
      greeting = 'Good afternoon';
      icon = '<i class="fas fa-sun"></i>';
    } else {
      greeting = 'Good evening';
      icon = '<i class="fas fa-cloud-moon"></i>';
    }

    safeSetContent(CONFIG_SELECTORS.greetingText, `${greeting}, creator`, true);
    
    const greetingIcon = safeGetElement(CONFIG_SELECTORS.greetingIcon);
    if (greetingIcon) {
      greetingIcon.outerHTML = icon;
    }
  }

  function initializeClock() {
    updateTimeAndGreeting();
    const clockInterval = setInterval(updateTimeAndGreeting, ANIMATION_CONFIG.clockUpdateInterval);
    
    // Clean up on page hide/unload
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        clearInterval(clockInterval);
      }
    });
  }

  // ========== 3D TILT EFFECT ==========
  function initializeTiltEffect() {
    const card = safeGetElement(CONFIG_SELECTORS.bioCard);
    const container = safeGetElement(CONFIG_SELECTORS.tiltCard);

    if (!card || !container) return;

    container.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -ANIMATION_CONFIG.tiltStrength;
      const rotateY = ((x - centerX) / centerX) * ANIMATION_CONFIG.tiltStrength;
      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(5px)`;
    });

    container.addEventListener('mouseleave', () => {
      card.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0px)';
    });
  }

  // ========== RIPPLE EFFECT & LINK HANDLING ==========
  let totalClicks = 0;
  let clickCountSpan = null;

  function initializeClickCounter() {
    clickCountSpan = safeGetElement(CONFIG_SELECTORS.clickCount);
    if (!clickCountSpan) return;

    const storedClicks = localStorage.getItem('bio_interactions');
    if (storedClicks && !isNaN(parseInt(storedClicks))) {
      totalClicks = parseInt(storedClicks);
      clickCountSpan.textContent = totalClicks;
    } else {
      clickCountSpan.textContent = '0';
    }
  }

  function createRipple(event, element) {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple-effect');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    element.style.position = 'relative';
    element.appendChild(ripple);
    setTimeout(() => ripple.remove(), ANIMATION_CONFIG.rippleAnimationTime);
  }

  function incrementCounter() {
    totalClicks++;
    if (clickCountSpan) {
      clickCountSpan.textContent = totalClicks;
    }
    localStorage.setItem('bio_interactions', totalClicks.toString());
  }

  function attachLinkEvents() {
    const links = document.querySelectorAll('.link-item');
    links.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        createRipple(e, link);
        incrementCounter();
        const targetUrl = link.getAttribute('data-url');
        setTimeout(() => {
          if (targetUrl && targetUrl !== '#') {
            window.open(targetUrl, '_blank', 'noopener,noreferrer');
          } else {
            alert('🔗 Please update this link URL in config.js');
          }
        }, ANIMATION_CONFIG.linkOpenDelay);
      });
    });
  }

  function initializeLinks() {
    attachLinkEvents();
  }

  // ========== THEME TOGGLE ==========
  function initializeThemeToggle() {
    const themeBtn = safeGetElement(CONFIG_SELECTORS.themeSwitch);
    const body = document.body;

    if (!themeBtn) return;

    const isLight = localStorage.getItem('bio_theme') === 'light';
    if (isLight) {
      body.classList.add('light');
      themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
      themeBtn.innerHTML = '<i class="fas fa-moon"></i>';
    }

    themeBtn.addEventListener('click', () => {
      body.classList.toggle('light');
      const nowLight = body.classList.contains('light');
      localStorage.setItem('bio_theme', nowLight ? 'light' : 'dark');
      themeBtn.innerHTML = nowLight ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    });
  }

  // ========== PARTICLE BACKGROUND ==========
  let animationFrameId = null;
  let particles = [];
  let mouseX = null;
  let mouseY = null;
  let particleAnimationActive = true;

  class Particle {
    constructor(canvas) {
      this.canvas = canvas;
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 1;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = (Math.random() - 0.5) * 0.3;
      this.color = `rgba(139, 92, 246, ${Math.random() * 0.4 + 0.2})`;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      if (this.x < 0 || this.x > this.canvas.width) this.speedX *= -1;
      if (this.y < 0 || this.y > this.canvas.height) this.speedY *= -1;

      if (mouseX !== null && mouseY !== null) {
        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < ANIMATION_CONFIG.particleMouseRadius) {
          const angle = Math.atan2(dy, dx);
          const force = (ANIMATION_CONFIG.particleMouseRadius - dist) / ANIMATION_CONFIG.particleMouseRadius;
          this.x += Math.cos(angle) * force * ANIMATION_CONFIG.particleRepelForce;
          this.y += Math.sin(angle) * force * ANIMATION_CONFIG.particleRepelForce;
        }
      }
    }

    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }

  function initializeParticles() {
    const canvas = safeGetElement(CONFIG_SELECTORS.particleCanvas);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Unable to get 2D context for particle canvas');
      return;
    }

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    particles = [];
    for (let i = 0; i < ANIMATION_CONFIG.initialParticleCount; i++) {
      particles.push(new Particle(canvas));
    }

    function animateParticles() {
      if (!particleAnimationActive) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update();
        p.draw(ctx);
      });
      animationFrameId = requestAnimationFrame(animateParticles);
    }

    animateParticles();

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    document.addEventListener('mouseleave', () => {
      mouseX = null;
      mouseY = null;
    });

    // Stop animation when page is hidden to save resources
    document.addEventListener('visibilitychange', () => {
      particleAnimationActive = !document.hidden;
      if (particleAnimationActive) {
        animateParticles();
      }
    });
  }

  // ========== INITIALIZATION ==========
  function init() {
    try {
      initializeProfile();
      initializeClock();
      initializeTiltEffect();
      initializeClickCounter();
      initializeLinks();
      initializeThemeToggle();
      initializeParticles();
    } catch (error) {
      console.error('Error during initialization:', error);
    }
  }

  // Run initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();