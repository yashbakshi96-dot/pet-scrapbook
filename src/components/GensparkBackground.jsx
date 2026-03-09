import { useEffect, useRef } from 'react';
import './GensparkBackground.css';

const PAW_COLORS = [
  '#c49060', '#a06840', '#8a5a30', '#e8b060', '#d0c8b8',
  '#a0a0a0', '#787878', '#e8e0d0', '#d4a050', '#b88050',
];

const YARN_COLORS = [
  { base: '#e05a30', hi: '#f07850' },
  { base: '#e0802a', hi: '#f0a040' },
  { base: '#b04080', hi: '#d060a0' },
  { base: '#40a060', hi: '#60c080' },
  { base: '#5070c8', hi: '#7090e0' },
  { base: '#c04040', hi: '#e06060' },
];

const rand = (a, b) => Math.random() * (b - a) + a;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);

export default function GensparkBackground() {
  const containerRef = useRef(null);
  const pawFieldRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !pawFieldRef.current) return;

    // Clear any orphans from previous mounts (prevents static clumps in top-left)
    const existingPrey = containerRef.current.querySelectorAll('.gs-prey');
    existingPrey.forEach(p => p.remove());
    pawFieldRef.current.innerHTML = '';

    // Dynamically calculate height to handle growing page (gallery loading)
    const getFullHeight = () => Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight,
      document.body.clientHeight,
      document.documentElement.clientHeight
    );

    let W = window.innerWidth;
    let H = getFullHeight();
    let mx = W / 2, my = 0;

    const handleMouseMove = (e) => {
      mx = e.clientX;
      my = e.clientY + window.scrollY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Update dimensions on resize
    const handleResize = () => {
      W = window.innerWidth;
      H = getFullHeight();
    };
    window.addEventListener('resize', handleResize);

    // Paw SVG Generator
    const pawSVG = (size, color) => {
      const light = 'rgba(255,255,255,0.28)';
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 100 100">
          <ellipse cx="50" cy="65" rx="28" ry="22" fill="${color}"/>
          <ellipse cx="50" cy="60" rx="16" ry="11" fill="${light}"/>
          <ellipse cx="22" cy="38" rx="11" ry="13" fill="${color}"/>
          <ellipse cx="42" cy="28" rx="10" ry="12" fill="${color}"/>
          <ellipse cx="62" cy="28" rx="10" ry="12" fill="${color}"/>
          <ellipse cx="80" cy="38" rx="11" ry="13" fill="${color}"/>
        </svg>
      `;
    };

    // Yarn SVG Generator
    let yarnColorIdx = 0;
    const yarnSVG = (size) => {
      const c = YARN_COLORS[yarnColorIdx++ % YARN_COLORS.length];
      const id = `gs-yg${yarnColorIdx}`;
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 100 100">
          <defs>
            <radialGradient id="${id}" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stop-color="${c.hi}" />
              <stop offset="100%" stop-color="${c.base}" />
            </radialGradient>
            <filter id="fuzz${id}" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
            </filter>
          </defs>
          
          <!-- Shadow -->
          <circle cx="52" cy="52" r="40" fill="rgba(0,0,0,0.15)" />
          
          <!-- Core Ball -->
          <circle cx="50" cy="50" r="40" fill="url(#${id})" filter="url(#fuzz${id})" />
          
          <!-- Complex Thread Wraps for depth -->
          <g stroke="rgba(255,255,255,0.15)" stroke-width="1.5" fill="none">
            <ellipse cx="50" cy="50" rx="40" ry="12" transform="rotate(30 50 50)"/>
            <ellipse cx="50" cy="50" rx="40" ry="12" transform="rotate(-45 50 50)"/>
            <ellipse cx="50" cy="50" rx="12" ry="40" transform="rotate(15 50 50)"/>
            <ellipse cx="50" cy="50" rx="20" ry="40" transform="rotate(75 50 50)"/>
          </g>
          
          <!-- Overlapping "fuzzy" threads -->
          <path d="M20 40 Q50 20 80 40" stroke="rgba(0,0,0,0.05)" stroke-width="3" fill="none" transform="rotate(10 50 50)"/>
          <path d="M15 60 Q50 80 85 60" stroke="rgba(255,255,255,0.1)" stroke-width="2" fill="none" transform="rotate(-20 50 50)"/>
          
          <!-- High-light threads -->
          <path d="M35 30 Q50 45 65 30" stroke="${c.hi}" stroke-width="1.5" opacity="0.6" fill="none" />
          
          <!-- Loose tail -->
          <path d="M80 50 C 95 40, 105 70, 90 85" stroke="${c.hi}" stroke-width="3" stroke-linecap="round" fill="none" />
          <circle cx="90" cy="85" r="2" fill="${c.base}" />
        </svg>
      `;
    };

    // Effects
    const spawnRippleAt = (x, y) => {
      if (!containerRef.current) return;
      const r = document.createElement('div');
      r.className = 'gs-ripple';
      r.style.cssText = `left:${x}px;top:${y}px;width:70px;height:70px`;
      containerRef.current.appendChild(r);
      r.addEventListener('animationend', () => r.remove());
    };

    const spawnSparkles = (x, y, color, count = 10) => {
      if (!containerRef.current) return;
      for (let i = 0; i < count; i++) {
        const s = document.createElement('div');
        s.className = 'gs-sparkle';
        const angle = rand(0, Math.PI * 2);
        const d = rand(25, 75);
        const sz = rand(4, 9);
        s.style.cssText = `left:${x}px;top:${y}px;width:${sz}px;height:${sz}px;background:${color};box-shadow:0 0 5px ${color};--gs-dx:${Math.cos(angle) * d}px;--gs-dy:${Math.sin(angle) * d}px`;
        containerRef.current.appendChild(s);
        s.addEventListener('animationend', () => s.remove());
      }
    };

    // No more catch text popups as requested

    // Initialize Paws
    const pawData = [];
    const numPaws = 270; // Increased by 80% (150 * 1.8 = 270)
    for (let i = 0; i < numPaws; i++) {
      const el = document.createElement('div');
      el.className = 'gs-paw';
      const size = rand(22, 60);
      const rot = rand(0, 360);
      const color = PAW_COLORS[Math.floor(rand(0, PAW_COLORS.length))];
      // Randomly scatter across the full logical height
      const px = rand(1, 97);
      const py = rand(1, 97);
      const baseOp = rand(0.55, 0.90);
      const dur = rand(3, 7);
      const delay = rand(0, 7);

      el.style.cssText = `left:${px}%;top:${py}%;width:${size}px;height:${size}px;--gs-rot:${rot}deg;--gs-base-op:${baseOp};transform:rotate(${rot}deg);animation: gs-idlePulse ${dur}s ${delay}s ease-in-out infinite;`;
      el.style.setProperty('--gs-base-tf', `rotate(${rot}deg)`);
      el.innerHTML = pawSVG(size, color);
      pawFieldRef.current.appendChild(el);
      pawData.push({ el, px, py, size, rot, color, baseOp, swipeCooldown: 0, alerted: false, dur, delay });
    }

    // Initialize Yarn
    const preyList = [];
    // Decreased yarn balls by 50% (12 -> 6)
    for (let i = 0; i < 6; i++) {
      const el = document.createElement('div');
      el.className = 'gs-prey';
      const size = rand(50, 75); // Slightly larger for better detail
      el.innerHTML = yarnSVG(size);
      el.style.width = el.style.height = size + 'px';
      containerRef.current.appendChild(el);
      preyList.push({ 
        el, size, 
        x: rand(80, W - 80), 
        y: rand(80, H > 800 ? H - 80 : 2000),
        vx: rand(-1.5, 1.5), 
        vy: rand(-1.5, 1.5), 
        wobble: rand(0, Math.PI * 2), 
        wobbleSpeed: rand(0.015, 0.03), // Slower, more "weighted" wobble
        mouseAttr: rand(0.012, 0.025), 
        catchCooldown: 0 
      });
    }

    // Main Loop
    const ALERT_R = 175;
    const SWIPE_R = 62;
    const CATCH_R = 48;
    let lastTs = 0;

    const updateLoop = (ts) => {
      if (!containerRef.current) return;
      const dt = Math.min(ts - lastTs, 40);
      lastTs = ts;
      
      // Periodically refresh H in case site grows
      if (Math.random() < 0.05) H = getFullHeight();

      preyList.forEach(p => {
        if (p.catchCooldown > 0) p.catchCooldown -= dt;
        p.wobble += p.wobbleSpeed;
        
        const dxm = mx - p.x - p.size / 2;
        const dym = my - p.y - p.size / 2;
        const dm = Math.hypot(dxm, dym) + 0.001;
        if (dm < 400) {
          const f = p.mouseAttr * (dt / 16);
          p.vx += dxm / dm * f;
          p.vy += dym / dm * f;
        }
        
        // Slightly more subtle wander for "weighted" yarn feel
        p.vx += rand(-0.06, 0.06) * (dt / 16);
        p.vy += rand(-0.06, 0.06) * (dt / 16);
        const spd = Math.hypot(p.vx, p.vy);
        if (spd > 2.2) { p.vx = p.vx / spd * 2.2; p.vy = p.vy / spd * 2.2; }
        
        p.x += p.vx * (dt / 16);
        p.y += p.vy * (dt / 16);
        
        if (p.x < 10) { p.x = 10; p.vx = Math.abs(p.vx); }
        if (p.x > W - p.size - 10) { p.x = W - p.size - 10; p.vx = -Math.abs(p.vx); }
        if (p.y < 10) { p.y = 10; p.vy = Math.abs(p.vy); }
        if (p.y > H - p.size - 10) { p.y = H - p.size - 10; p.vy = -Math.abs(p.vy); }
        
        const bob = Math.sin(p.wobble) * 4;
        p.el.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.wobble * 45}deg) translateY(${bob}px)`;

        let chased = false;
        pawData.forEach(pw => {
          const cx = (pw.px / 100) * W + pw.size / 2;
          const cy = (pw.py / 100) * H + pw.size / 2;
          if (dist(cx, cy, p.x + p.size / 2, p.y + p.size / 2) < ALERT_R) chased = true;
        });
        p.el.classList.toggle('chased', chased);
      });

      pawData.forEach(pw => {
        if (pw.swipeCooldown > 0) { pw.swipeCooldown -= dt; return; }
        const currentW = window.innerWidth;
        const cx = (pw.px / 100) * currentW + pw.size / 2;
        const cy = (pw.py / 100) * H + pw.size / 2;

        let closestDist = Infinity, closestPrey = null;
        preyList.forEach(p => {
          const d = dist(cx, cy, p.x + p.size / 2, p.y + p.size / 2);
          if (d < closestDist) { closestDist = d; closestPrey = p; }
        });
        if (!closestPrey) return;

        const pcx = closestPrey.x + closestPrey.size / 2;
        const pcy = closestPrey.y + closestPrey.size / 2;

        if (closestDist < ALERT_R) {
          const angle = Math.atan2(pcy - cy, pcx - cx) * 180 / Math.PI;
          const lean = clamp((ALERT_R - closestDist) / ALERT_R, 0, 1);
          const scl = 1 + lean * 0.55;
          pw.el.style.transform = `rotate(${angle - 90}deg) scale(${scl})`;
          pw.el.style.opacity = Math.min(pw.baseOp + lean * 0.35, 1);
          pw.el.style.setProperty('--gs-base-tf', `rotate(${angle - 90}deg) scale(${scl})`);
          pw.el.style.animation = 'none';
          pw.alerted = true;

          if (closestDist < SWIPE_R && !pw.el.classList.contains('swipe')) {
            pw.el.classList.add('swipe');
            pw.swipeCooldown = 650;
            setTimeout(() => pw.el?.classList.remove('swipe'), 400);
            const nx = (pcx - cx) / (closestDist + 0.1);
            const ny = (pcy - cy) / (closestDist + 0.1);
            closestPrey.vx += nx * 2.8;
            closestPrey.vy += ny * 2.8;
          }

          if (closestDist < CATCH_R && closestPrey.catchCooldown <= 0) {
            closestPrey.catchCooldown = 2200;
            closestPrey.vx = rand(-3.5, 3.5);
            closestPrey.vy = rand(-3.5, -1);
            pw.el.classList.add('caught');
            setTimeout(() => pw.el?.classList.remove('caught'), 560);
            pw.swipeCooldown = 1300;
            spawnSparkles(pcx, pcy, pw.color, 14);
            spawnRippleAt(pcx, pcy);
            // showCatchText(pcx, pcy);  <-- Removed catch text as requested
          }
        } else if (pw.alerted) {
          pw.alerted = false;
          pw.el.style.transform = `rotate(${pw.rot}deg) scale(1)`;
          pw.el.style.opacity = pw.baseOp;
          pw.el.style.animation = `gs-idlePulse ${pw.dur}s ease-in-out infinite`;
        }
      });

      requestAnimationFrame(updateLoop);
    };

    const requestId = requestAnimationFrame(updateLoop);
    return () => {
      cancelAnimationFrame(requestId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="genspark-body" ref={containerRef}>
      <div id="gs-pawField" ref={pawFieldRef} />
    </div>
  );
}
