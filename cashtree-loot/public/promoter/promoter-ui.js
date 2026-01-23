/* =========================================================
   CASH TREE — PROMOTER SIGNUP UI
   UI ONLY • ZERO AUTHORITY • SECURITY-BRICKED
   ========================================================= */

(() => {

  /* =====================================================
     ELEMENTS
     ===================================================== */
  const form = document.getElementById('promoterForm');
  if (!form) return;

  const el = id => document.getElementById(id);

  const inputs = {
    full_name: el('full_name'),
    username: el('username'),
    phone: el('phone'),
    upi_id: el('upi_id'),
    password: el('password'),
    ref: el('ref')
  };

  const submitBtn = form.querySelector('button[type="submit"]');

  /* =====================================================
     TOAST SYSTEM (PREMIUM, LIGHTWEIGHT)
     ===================================================== */
  function toast(msg, type = 'neutral') {
    let box = document.getElementById('toast-container');
    if (!box) {
      box = document.createElement('div');
      box.id = 'toast-container';
      box.style.cssText =
        'position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;';
      document.body.appendChild(box);
    }

    const t = document.createElement('div');
    const map = {
      success: 'border-green-500 text-green-400',
      error: 'border-red-500 text-red-400',
      neutral: 'border-blue-500 text-blue-400'
    };

    t.className = `
      px-5 py-4 rounded-xl backdrop-blur-xl bg-black/70
      border-l-4 shadow-2xl text-xs font-black uppercase tracking-widest
      translate-x-10 opacity-0 transition-all duration-300
      ${map[type] || map.neutral}
    `;
    t.textContent = msg;

    box.appendChild(t);
    requestAnimationFrame(() => t.classList.remove('translate-x-10', 'opacity-0'));

    setTimeout(() => {
      t.classList.add('translate-x-10', 'opacity-0');
      setTimeout(() => t.remove(), 350);
    }, 3000);
  }

  /* =====================================================
     PREFILL REFERRAL FROM URL (?ref=)
     ===================================================== */
  const params = new URLSearchParams(window.location.search);
  const refFromUrl = params.get('ref');
  if (refFromUrl && inputs.ref) {
    inputs.ref.value = refFromUrl.toUpperCase();
    toast('REFERRAL CODE APPLIED', 'success');
  }

  /* =====================================================
     BASIC VALIDATION
     ===================================================== */
  function validate() {
    if (!inputs.full_name.value.trim())
      return 'ENTER FULL NAME';

    if (!inputs.username.value.trim())
      return 'ENTER USERNAME';

    if (inputs.username.value.includes(' '))
      return 'USERNAME CANNOT CONTAIN SPACES';

    if (inputs.password.value.length < 6)
      return 'PASSWORD MINIMUM 6 CHARACTERS';

    if (inputs.phone.value && !/^[0-9]{10}$/.test(inputs.phone.value))
      return 'INVALID PHONE NUMBER';

    return null;
  }

  /* =====================================================
     SUBMIT HANDLER (SERVER DECIDES EVERYTHING)
     ===================================================== */
  async function handleSubmit(e) {
    e.preventDefault();

    const error = validate();
    if (error) {
      toast(error, 'error');
      return;
    }

    submitBtn.disabled = true;
    const originalText = submitBtn.innerText;
    submitBtn.innerText = 'CREATING ACCOUNT…';
    submitBtn.style.opacity = '0.7';

    try {
      const payload = {
        full_name: inputs.full_name.value.trim(),
        username: inputs.username.value.trim().toUpperCase(),
        phone: inputs.phone.value.trim() || null,
        upi_id: inputs.upi_id.value.trim() || null,
        password: inputs.password.value,
        ref: inputs.ref.value.trim().toUpperCase() || null
      };

      const res = await fetch('/api/promoter/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'SIGNUP FAILED');
      }

      toast('ACCOUNT CREATED — LOGIN NOW', 'success');

      setTimeout(() => {
        window.location.href = '/login';
      }, 1200);

    } catch (err) {
      toast(err.message || 'ERROR OCCURRED', 'error');
      submitBtn.disabled = false;
      submitBtn.innerText = originalText;
      submitBtn.style.opacity = '1';
    }
  }

  /* =====================================================
     INIT
     ===================================================== */
  form.addEventListener('submit', handleSubmit);

})();
