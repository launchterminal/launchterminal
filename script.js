/* ============================================================
   LaunchTerminal — Interactive Scripts
   ============================================================ */

// ---------- Particle Background ----------
(function initParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, particles;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function createParticles() {
    const count = Math.min(Math.floor((w * h) / 12000), 120);
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.5 + 0.3,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.5 + 0.1,
        hue: Math.random() > 0.5 ? 220 : 270,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      p.x += p.dx;
      p.y += p.dy;

      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 70%, 65%, ${p.opacity})`;
      ctx.fill();
    }

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(100, 130, 255, ${0.06 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  resize();
  createParticles();
  draw();
  window.addEventListener('resize', () => { resize(); createParticles(); });
})();


// ---------- Navbar Scroll Effect ----------
(function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        navbar.classList.toggle('scrolled', window.scrollY > 40);
        ticking = false;
      });
      ticking = true;
    }
  });
})();


// ---------- Terminal Typing Animation ----------
(function initTerminal() {
  const commandEl = document.getElementById('typed-command');
  const bodyEl = document.getElementById('terminal-body');
  if (!commandEl || !bodyEl) return;

  const sequences = [
    {
      command: 'npx create-openclaw@latest my-bot',
      outputs: [
        { text: '', delay: 300 },
        { text: '  Creating OpenClaw bot in ./my-bot...', cls: 'info' },
        { text: '  Installing dependencies...', cls: '' },
        { text: '  Added 142 packages in 4.2s', cls: '' },
        { text: '', delay: 200 },
        { text: '  \u2713 Bot scaffolded successfully!', cls: 'success' },
      ],
    },
    {
      command: 'claw config --personality friendly',
      outputs: [
        { text: '', delay: 300 },
        { text: '  Loading config from claw.config.yml...', cls: 'info' },
        { text: '  Setting personality: friendly', cls: '' },
        { text: '  \u2713 Configuration updated!', cls: 'success' },
      ],
    },
    {
      command: 'claw deploy --prod',
      outputs: [
        { text: '', delay: 300 },
        { text: '  Building bot...', cls: 'info' },
        { text: '  Optimizing for production...', cls: '' },
        { text: '  Deploying to edge network...', cls: 'accent' },
        { text: '', delay: 200 },
        { text: '  \u2713 Bot is live at openclaw.dev/my-bot', cls: 'success' },
        { text: '  \u2713 Latency: 23ms | Uptime: 99.99%', cls: 'success' },
      ],
    },
  ];

  let seqIndex = 0;

  async function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  async function typeCommand(text) {
    commandEl.textContent = '';
    for (let i = 0; i < text.length; i++) {
      commandEl.textContent += text[i];
      await sleep(35 + Math.random() * 40);
    }
  }

  async function showOutputs(outputs) {
    for (const out of outputs) {
      if (out.text === '') {
        await sleep(out.delay || 200);
        continue;
      }
      await sleep(100 + Math.random() * 200);
      const line = document.createElement('div');
      line.className = 'output-line' + (out.cls ? ' ' + out.cls : '');
      line.textContent = out.text;
      bodyEl.appendChild(line);
    }
  }

  function clearTerminal() {
    const outputs = bodyEl.querySelectorAll('.output-line');
    outputs.forEach(el => el.remove());
  }

  async function runSequence() {
    const seq = sequences[seqIndex];
    clearTerminal();
    await typeCommand(seq.command);
    await sleep(600);
    document.querySelector('.cursor').style.display = 'none';
    await showOutputs(seq.outputs);
    await sleep(2500);
    document.querySelector('.cursor').style.display = '';
    seqIndex = (seqIndex + 1) % sequences.length;
    await sleep(800);
    runSequence();
  }

  // Start after a short delay
  setTimeout(runSequence, 1200);
})();


// ---------- Counter Animation ----------
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        animateCounter(el, target);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));

  function animateCounter(el, target) {
    const duration = 2000;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      el.textContent = current.toLocaleString();
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target.toLocaleString();
      }
    }

    requestAnimationFrame(update);
  }
})();


// ---------- Scroll Reveal ----------
(function initReveal() {
  // Add reveal class to elements
  const revealSelectors = [
    '.feature-card',
    '.step',
    '.deploy-card',
    '.community-card',
  ];

  revealSelectors.forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = `${i * 0.08}s`;
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();


// ---------- Smooth Scroll for Nav Links ----------
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
})();


// ---------- Feature Card Tilt Effect ----------
(function initTilt() {
  document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / centerY * -4;
      const rotateY = (x - centerX) / centerX * 4;

      card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(600px) rotateX(0) rotateY(0) translateY(0)';
    });
  });
})();
