(function() {
  // ========== CONFIGURATION & CONSTANTS ==========
  const CONFIG_SELECTORS = {
    pageTitle: '#pageTitle',
    subtitle: '#subtitle',
    message: '#message',
    copyright: '#copyright',
    progressBar: '#progressBar',
    progressText: '#progressText',
    clockTime: '#clockTime',
    themeSwitch: '#themeSwitch',
    constructionCard: '#constructionCard',
    tiltCard: '#tiltCard',
    particleCanvas: '#particle-canvas',
    notifyMe: '#notifyMe'
  };

  const ANIMATION_CONFIG = {
    tiltStrength: 8,
    particleMouseRadius: 80,
    particleRepelForce: 1.2,
    clockUpdateInterval: 1000,
    initialParticleCount: 80,
    progressUpdateDuration: 2000, // ms
    progressUpdateSteps: 60
  };

  // ========== UTILITY FUNCTIONS ==========
  function safeGetElement(selector) {
    const element = document.querySelector(selector);
    if (!element) console.warn(`Element not found: ${selector}`);
    return element;
  }

  function safeSetContent(selector, content, useHTML = false) {
    const element = safeGetElement(selector);
    if (element) {
      if (useHTML) element.innerHTML = content;
      else element.textContent = content;
    }
  }

  function safeSetAttribute(selector, attribute, value) {
    const element = safeGetElement(selector);
    if (element) element.setAttribute(attribute, value);
  }

  // ========== POPULATE DYNAMIC CONTENT FROM CONFIG ==========
  function initializePageContent() {
    if (typeof CONFIG === 'undefined') {
      console.error('CONFIG object not found');
      return;
    }

    safeSetContent(CONFIG_SELECTORS.pageTitle, CONFIG.page.title);
    safeSetContent(CONFIG_SELECTORS.subtitle, CONFIG.page.subtitle);
    safeSetContent(CONFIG_SELECTORS.message, CONFIG.page.message, true); // Allow HTML for line breaks
    safeSetContent(CONFIG_SELECTORS.copyright, `<i class="far fa-copyright"></i> ${CONFIG.page.copyright}`, true);
    safeSetAttribute(CONFIG_SELECTORS.notifyMe, 'href', CONFIG.notifyUrl);
  }

  // ========== PROGRESS BAR ANIMATION ==========
  function animateProgress(targetPercentage) {
    const progressBar = safeGetElement(CONFIG_SELECTORS.progressBar);
    const progressText = safeGetElement(CONFIG_SELECTORS.progressText);
    if (!progressBar || !progressText) return;

    let current = 0;
    const step = targetPercentage / ANIMATION_CONFIG.progressUpdateSteps;
    const interval = ANIMATION_CONFIG.progressUpdateDuration / ANIMATION_CONFIG.progressUpdateSteps;

    const timer = setInterval(() => {
      current += step;
      if (current >= targetPercentage) {
        current = targetPercentage;
        clearInterval(timer);
      }
      const percent = Math.floor(current);
      progressBar.style.width = `${percent}%`;
      progressText.textContent = `${percent}%`;
    }, interval);
  }

  // ========== DYNAMIC CLOCK & GREETING ==========
  function updateClock() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHour = hours % 12 || 12;
    const timeStr = `${formattedHour}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    safeSetContent(CONFIG_SELECTORS.clockTime, timeStr);
  }

  function initializeClock() {
    updateClock();
    setInterval(updateClock, ANIMATION_CONFIG.clockUpdateInterval);
  }

  // ========== 3D TILT EFFECT ==========
  function initializeTiltEffect() {
    const card = safeGetElement(CONFIG_SELECTORS.constructionCard);
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
  let mouseX = null, mouseY = null;
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
        const dist = Math.sqrt(dx*dx + dy*dy);
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
    if (!ctx) return;

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    for (let i = 0; i < ANIMATION_CONFIG.initialParticleCount; i++) {
      particles.push(new Particle(canvas));
    }

    function animateParticles() {
      if (!particleAnimationActive) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
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
    document.addEventListener('mouseleave', () => { mouseX = null; mouseY = null; });
    document.addEventListener('visibilitychange', () => {
      particleAnimationActive = !document.hidden;
      if (particleAnimationActive) animateParticles();
    });
  }

  // ========== INITIALIZATION ==========
  function init() {
    try {
      initializePageContent();
      initializeClock();
      initializeTiltEffect();
      initializeThemeToggle();
      initializeParticles();
      // Start progress animation after a short delay (ensure DOM ready)
      setTimeout(() => {
        if (typeof CONFIG !== 'undefined' && CONFIG.progressTarget) {
          animateProgress(CONFIG.progressTarget);
        } else {
          animateProgress(42); // fallback
        }
      }, 300);
    } catch (error) {
      console.error('Error during initialization:', error);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
