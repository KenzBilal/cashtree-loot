/* =========================================================
   CASH TREE — LOGIN UI CONTROLLER
   UI ONLY • ZERO AUTHORITY • SECURITY-BRICKED
   ========================================================= */

(() => {

  /* =========================================
     ELEMENTS
     ========================================= */
  const form = document.getElementById('loginForm');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const box = document.querySelector('.login-box');

  if (!form || !usernameInput || !passwordInput) {
    console.warn('Login UI not initialized');
    return;
  }

  /* =========================================
     TOAST SYSTEM (MATCHES CASH TREE STYLE)
     ========================================= */
  function showToast(message, type = 'neutral') {
    let container = document.getElementById('toast-container');

    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.position = 'fixed';
      container.style.top = '20px';
      container.style.right = '20px';
      container.style.zIndex = '9999';
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.gap = '10px';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const colors = {
      success: '#22c55e',
      error: '#ef4444',
      neutral: '#3b82f6'
    };

    toast.style.background = 'rgba(0,0,0,0.75)';
    toast.style.border = `1px solid ${colors[type] || colors.neutral}`;
    toast.style.color = colors[type] || colors.neutral;
    toast.style.padding = '14px 18px';
    toast.style.borderRadius = '14px';
    toast.style.fontSize = '12px';
    toast.style.fontWeight = '800';
    toast.style.letterSpacing = '1px';
    toast.style.backdropFilter = 'blur(12px)';
    toast.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = '0.35s';

    toast.textContent = message;
    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(0)';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  /* =========================================
     SHAKE EFFECT (ERROR FEEDBACK)
     ========================================= */
  function shakeBox() {
    if (!box) return;
    box.classList.add('shake');
    setTimeout(() => box.classList.remove('shake'), 450);
  }

  // Inject shake animation once
  const style = document.createElement('style');
  style.innerHTML = `
    .shake {
      animation: shake 0.4s cubic-bezier(.36,.07,.19,.97);
    }
    @keyframes shake {
      10%, 90% { transform: translateX(-1px); }
      20%, 80% { transform: translateX(2px); }
      30%, 50%, 70% { transform: translateX(-4px); }
      40%, 60% { transform: translateX(4px); }
    }
  `;
  document.head.appendChild(style);

  /* =========================================
     LOGIN HANDLER (SERVER-DECIDED)
     ========================================= */
  async function handleLogin(e) {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
      showToast('ENTER PARTNER CODE AND ACCESS KEY', 'error');
      shakeBox();
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;

    submitBtn.disabled = true;
    submitBtn.innerText = 'VERIFYING…';
    submitBtn.style.opacity = '0.7';

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include', // 🔒 REQUIRED FOR COOKIE
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'ACCESS DENIED');
      }

      const result = await res.json();

      showToast('ACCESS GRANTED', 'success');

      // Server decides destination
      setTimeout(() => {
        window.location.href = result.redirect;
      }, 600);

    } catch (err) {
      showToast(err.message || 'LOGIN FAILED', 'error');
      shakeBox();

      submitBtn.disabled = false;
      submitBtn.innerText = originalText;
      submitBtn.style.opacity = '1';
    }
  }

  /* =========================================
     ENTER KEY SUPPORT
     ========================================= */
  passwordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      form.dispatchEvent(new Event('submit', { cancelable: true }));
    }
  });

  /* =========================================
     INIT
     ========================================= */
  form.addEventListener('submit', handleLogin);

})();
