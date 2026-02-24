/* ============================================================
   LaunchTerminal — Interactive Scripts (WOW Edition)
   ============================================================ */

// ---------- Enhanced Particle Background ----------
(function initParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, particles, mouseX = -1000, mouseY = -1000;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function createParticles() {
    const count = Math.min(Math.floor((w * h) / 14000), 100);
    particles = [];
    for (let i = 0; i < count; i++) {
      const type = Math.random();
      let hue, sat, light;
      if (type < 0.35) {
        hue = 160; sat = 100; light = 70; // neon green
      } else if (type < 0.6) {
        hue = 190; sat = 100; light = 60; // cyan
      } else if (type < 0.8) {
        hue = 275; sat = 80; light = 65; // purple
      } else {
        hue = 330; sat = 100; light = 60; // pink
      }
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.8 + 0.3,
        dx: (Math.random() - 0.5) * 0.3,
        dy: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.5 + 0.15,
        hue, sat, light,
        pulseSpeed: Math.random() * 0.02 + 0.005,
        pulseOffset: Math.random() * Math.PI * 2,
      });
    }
  }

  function draw(time) {
    ctx.clearRect(0, 0, w, h);

    for (const p of particles) {
      p.x += p.dx;
      p.y += p.dy;

      // Mouse attraction (gentle)
      const mdx = mouseX - p.x;
      const mdy = mouseY - p.y;
      const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
      if (mDist < 200) {
        p.x += mdx * 0.0008;
        p.y += mdy * 0.0008;
      }

      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      // Pulsing opacity
      const pulse = Math.sin(time * p.pulseSpeed + p.pulseOffset) * 0.15 + 0.85;
      const alpha = p.opacity * pulse;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, ${p.sat}%, ${p.light}%, ${alpha})`;
      ctx.fill();

      // Glow effect on larger particles
      if (p.r > 1) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, ${p.sat}%, ${p.light}%, ${alpha * 0.08})`;
        ctx.fill();
      }
    }

    // Draw connections with gradient colors
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          const alpha = 0.07 * (1 - dist / 130);
          const gradient = ctx.createLinearGradient(
            particles[i].x, particles[i].y,
            particles[j].x, particles[j].y
          );
          gradient.addColorStop(0, `hsla(${particles[i].hue}, 80%, 60%, ${alpha})`);
          gradient.addColorStop(1, `hsla(${particles[j].hue}, 80%, 60%, ${alpha})`);
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  resize();
  createParticles();
  requestAnimationFrame(draw);

  window.addEventListener('resize', () => { resize(); createParticles(); });
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
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
      await sleep(30 + Math.random() * 35);
    }
  }

  async function showOutputs(outputs) {
    for (const out of outputs) {
      if (out.text === '') {
        await sleep(out.delay || 200);
        continue;
      }
      await sleep(80 + Math.random() * 150);
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
    const duration = 2200;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
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
  const revealSelectors = [
    '.feature-card',
    '.step',
    '.deploy-card',
    '.community-card',
  ];

  revealSelectors.forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = `${i * 0.1}s`;
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

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


// ---------- Feature Card Tilt + Mouse Glow Effect ----------
(function initTilt() {
  document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / centerY * -5;
      const rotateY = (x - centerX) / centerX * 5;

      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;

      // Update CSS custom properties for the radial glow
      const percentX = (x / rect.width) * 100;
      const percentY = (y / rect.height) * 100;
      card.style.setProperty('--mouse-x', percentX + '%');
      card.style.setProperty('--mouse-y', percentY + '%');
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
      card.style.setProperty('--mouse-x', '50%');
      card.style.setProperty('--mouse-y', '50%');
    });
  });
})();


// ---------- Magnetic buttons (subtle hover attraction) ----------
(function initMagneticButtons() {
  document.querySelectorAll('.btn-primary.btn-lg').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px) scale(1.03)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
})();


// ---------- Parallax scroll on hero elements ----------
(function initParallax() {
  const heroGlow = document.querySelector('.hero-glow');
  const heroGrid = document.querySelector('.hero-grid-bg');
  const orbs = document.querySelectorAll('.floating-orb');

  if (!heroGlow) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        if (scrollY < window.innerHeight * 1.5) {
          heroGlow.style.transform = `translateX(-50%) translateY(${scrollY * 0.1}px)`;
          heroGrid.style.transform = `translateY(${scrollY * 0.05}px)`;
          orbs.forEach((orb, i) => {
            orb.style.transform = `translateY(${scrollY * (0.08 + i * 0.04)}px)`;
          });
        }
        ticking = false;
      });
      ticking = true;
    }
  });
})();


// ---------- Cursor glow trail (desktop only) ----------
(function initCursorGlow() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const glow = document.createElement('div');
  glow.style.cssText = `
    position: fixed;
    width: 400px;
    height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0, 255, 170, 0.04) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
    transform: translate(-50%, -50%);
    transition: opacity 0.3s;
    opacity: 0;
  `;
  document.body.appendChild(glow);

  let rafId;
  document.addEventListener('mousemove', (e) => {
    glow.style.opacity = '1';
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
    });
  });

  document.addEventListener('mouseleave', () => {
    glow.style.opacity = '0';
  });
})();
