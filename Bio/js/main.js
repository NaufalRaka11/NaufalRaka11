(function() {
  // ========== POPULATE DYNAMIC CONTENT FROM CONFIG ==========
  // Profile
  document.getElementById('profileName').innerText = CONFIG.profile.name;
  document.getElementById('profileAvatar').src = CONFIG.profile.avatar;
  document.getElementById('profileBio').innerHTML = CONFIG.profile.bio;
  document.getElementById('copyright').innerHTML = `<i class="far fa-copyright"></i> ${CONFIG.profile.copyright}`;

  // Links
  const linksContainer = document.getElementById('linksList');
  CONFIG.links.forEach((link, index) => {
    const linkItem = document.createElement('a');
    linkItem.className = 'link-item';
    linkItem.setAttribute('data-url', link.url);
    linkItem.setAttribute('data-original', link.url);
    linkItem.setAttribute('style', `--i:${index + 1}`);
    linkItem.href = '#';
    linkItem.innerHTML = `
      <div class="link-left">
        <div class="link-icon"><i class="${link.icon}"></i></div>
        <span class="link-text">${link.text} <span class="link-sub">${link.subtext}</span></span>
      </div>
      <div class="link-arrow"><i class="fas fa-arrow-right"></i></div>
    `;
    linksContainer.appendChild(linkItem);
  });

  // ========== DYNAMIC CLOCK & GREETING ==========
  function updateTimeAndGreeting() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHour = hours % 12 || 12;
    const timeStr = `${formattedHour}:${minutes.toString().padStart(2,'0')} ${ampm}`;
    document.getElementById('clockTime').innerText = timeStr;
    
    let greeting = '';
    let icon = '<i class="fas fa-sun"></i>';
    if (hours < 5) { greeting = 'Deep night'; icon = '<i class="fas fa-moon"></i>'; }
    else if (hours < 12) { greeting = 'Good morning'; icon = '<i class="fas fa-coffee"></i>'; }
    else if (hours < 18) { greeting = 'Good afternoon'; icon = '<i class="fas fa-sun"></i>'; }
    else { greeting = 'Good evening'; icon = '<i class="fas fa-cloud-moon"></i>'; }
    document.getElementById('greetingText').innerHTML = `${greeting}, creator`;
    document.querySelector('#greetingMsg i').outerHTML = icon;
  }
  updateTimeAndGreeting();
  setInterval(updateTimeAndGreeting, 1000);

  // ========== 3D TILT EFFECT ==========
  const card = document.getElementById('bioCard');
  const container = document.getElementById('tiltCard');
  if (card && container) {
    container.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;
      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(5px)`;
    });
    container.addEventListener('mouseleave', () => {
      card.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0px)';
    });
  }

  // ========== RIPPLE EFFECT & LINK HANDLING ==========
  let totalClicks = 0;
  const clickCountSpan = document.getElementById('clickCount');
  let storedClicks = localStorage.getItem('bio_interactions');
  if (storedClicks && !isNaN(parseInt(storedClicks))) {
    totalClicks = parseInt(storedClicks);
    clickCountSpan.innerText = totalClicks;
  } else {
    clickCountSpan.innerText = '0';
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
    setTimeout(() => ripple.remove(), 600);
  }
  
  function incrementCounter() {
    totalClicks++;
    clickCountSpan.innerText = totalClicks;
    localStorage.setItem('bio_interactions', totalClicks);
  }
  
  // Attach events to dynamically created links
  function attachLinkEvents() {
    const links = document.querySelectorAll('.link-item');
    links.forEach(link => {
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
        }, 120);
      });
    });
  }
  attachLinkEvents();

  // ========== THEME TOGGLE ==========
  const themeBtn = document.getElementById('themeSwitch');
  const body = document.body;
  let isLight = localStorage.getItem('bio_theme') === 'light';
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

  // ========== PARTICLE BACKGROUND ==========
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouseX = null, mouseY = null;
  
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  
  class Particle {
    constructor() {
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
      if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
      if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      if (mouseX && mouseY) {
        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 80) {
          const angle = Math.atan2(dy, dx);
          const force = (80 - dist) / 80;
          this.x += Math.cos(angle) * force * 1.2;
          this.y += Math.sin(angle) * force * 1.2;
        }
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }
  
  function initParticles(count = 70) {
    for (let i = 0; i < count; i++) particles.push(new Particle());
  }
  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animateParticles);
  }
  initParticles(90);
  animateParticles();
  
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  document.addEventListener('mouseleave', () => { mouseX = null; mouseY = null; });
