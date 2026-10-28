/**
 * THE MENTALIST — Progressive Enhancement Script
 * Features:
 * 1. Web Audio API woodwind synthesizer (for Flute acoustic notes - strictly user-triggered, NO autoplay).
 * 2. Dynamic Investigation Mode sync and LocalStorage persistence.
 * 3. Confidential Dispatch Contact form handling with validation and fallback.
 * 4. Interactive detective typewriter sound feedback (optional, user toggleable).
 */

document.addEventListener('DOMContentLoaded', () => {
  initModeSwitcher();
  initFluteSynthesizer();
  initContactForm();
  initSmoothScroll();
});

/* -------------------------------------------------------------
 * 1. Investigation Mode Toggle
 * ------------------------------------------------------------- */
function initModeSwitcher() {
  const modeToggle = document.getElementById('mode-toggle');
  const modeBtn = document.getElementById('mode-switch-btn');
  const storedMode = localStorage.getItem('mentalist_portfolio_mode');

  if (storedMode === 'clean' && modeToggle) {
    modeToggle.checked = true;
  }

  if (modeBtn && modeToggle) {
    modeBtn.addEventListener('click', () => {
      modeToggle.checked = !modeToggle.checked;
      localStorage.setItem('mentalist_portfolio_mode', modeToggle.checked ? 'clean' : 'investigation');
      playMechanicalClick();
    });
  }

  if (modeToggle) {
    modeToggle.addEventListener('change', () => {
      localStorage.setItem('mentalist_portfolio_mode', modeToggle.checked ? 'clean' : 'investigation');
    });
  }
}

/* -------------------------------------------------------------
 * 2. Web Audio API: Flute Acoustics Synthesizer (Zero Autoplay)
 * ------------------------------------------------------------- */
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Play a synthesized flute tone with soft attack, harmonics, and breath envelope
function playFluteNote(frequency) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const duration = 1.4;

  // Primary fundamental oscillator
  const osc1 = ctx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(frequency, now);

  // Subtle overtone (2nd harmonic) for woodwind realism
  const osc2 = ctx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(frequency * 2, now);

  // Gain nodes
  const gain1 = ctx.createGain();
  const gain2 = ctx.createGain();
  const masterGain = ctx.createGain();

  // Gentle breath envelope: soft attack, sustained body, smooth decay
  masterGain.gain.setValueAtTime(0.001, now);
  masterGain.gain.exponentialRampToValueAtTime(0.25, now + 0.12);
  masterGain.gain.exponentialRampToValueAtTime(0.18, now + 0.8);
  masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  gain1.gain.value = 0.8;
  gain2.gain.value = 0.2; // Overtones

  osc1.connect(gain1);
  osc2.connect(gain2);
  gain1.connect(masterGain);
  gain2.connect(masterGain);
  masterGain.connect(ctx.destination);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + duration);
  osc2.stop(now + duration);
}

// Gentle typewriter / camera click
function playMechanicalClick() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.04);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  } catch (e) {
    // Audio unsupported or blocked, ignore gracefully
  }
}

function initFluteSynthesizer() {
  const noteButtons = document.querySelectorAll('.flute-tone-btn');
  noteButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const freq = parseFloat(btn.getAttribute('data-freq'));
      if (freq) {
        playFluteNote(freq);
        btn.classList.add('playing');
        setTimeout(() => btn.classList.remove('playing'), 600);
      }
    });
  });
}

/* -------------------------------------------------------------
 * 3. Confidential Dispatch Contact Form
 * ------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('confidential-dispatch-form');
  const alertBox = document.getElementById('dispatch-alert');
  const submitBtn = document.getElementById('dispatch-submit-btn');

  if (!form || !alertBox) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const subject = document.getElementById('contact-subject').value.trim();
    const message = document.getElementById('contact-message').value.trim();

    if (!name || !email || !message) {
      alertBox.className = 'form-status-alert alert-error';
      alertBox.textContent = 'ERROR // CLASSIFIED DISPATCH REQUIRES NAME, EMAIL, AND MESSAGE.';
      alertBox.style.display = 'block';
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alertBox.className = 'form-status-alert alert-error';
      alertBox.textContent = 'ERROR // INVALID INVESTIGATIVE FREQUENCY (CHECK EMAIL ADDRESS).';
      alertBox.style.display = 'block';
      return;
    }

    // Realistic cryptographic dispatch simulation
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span>TRANSMITTING ENCRYPTED DISPATCH...</span>';
    submitBtn.disabled = true;

    playMechanicalClick();

    setTimeout(() => {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;

      alertBox.className = 'form-status-alert alert-success';
      alertBox.innerHTML = `
        <strong>DISPATCH CONFIRMED // EVIDENCE LOGGED</strong><br>
        Thank you, <strong>${escapeHtml(name)}</strong>. Your message has been encrypted into the investigation ledger.<br>
        <em>Direct mail dispatch fallback opened.</em>
      `;
      alertBox.style.display = 'block';

      // Fallback mailto trigger for genuine local delivery
      const mailtoUrl = `mailto:?subject=${encodeURIComponent('[PORTFOLIO DOSSIER] ' + subject)}&body=${encodeURIComponent('From: ' + name + ' (' + email + ')\n\n' + message)}`;
      window.open(mailtoUrl, '_blank');

      form.reset();
    }, 900);
  });
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

/* -------------------------------------------------------------
 * 4. Smooth Anchor Link Handling & Active Tab Indicator
 * ------------------------------------------------------------- */
function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');
  const navToggle = document.getElementById('nav-toggle');

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      // If it's a modal target, allow native CSS target behavior
      if (targetId.startsWith('#case-modal') || targetId.startsWith('#exhibit-modal')) {
        playMechanicalClick();
        return;
      }

      if (targetId === '#' || targetId === '#cases') {
        return;
      }

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        playMechanicalClick();

        // Close mobile drawer if open
        if (navToggle) {
          navToggle.checked = false;
        }

        const headerOffset = 80;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}
