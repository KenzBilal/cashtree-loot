/* =========================================================
   CASH TREE — DASHBOARD UI (PROMOTER)
   UI ONLY • ZERO AUTHORITY • SECURITY-BRICKED
   ========================================================= */

(() => {

  /* =====================================================
     ELEMENT REFERENCES
     ===================================================== */
  const el = (id) => document.getElementById(id);

  const els = {
    partnerName: el('partnerName'),
    userInitial: el('userInitial'),
    balance: el('balanceDisplay'),
    minPayout: el('minPayout'),
    withdrawBtn: el('withdrawBtn'),
    referralLink: el('referralLink'),
    copyReferralBtn: el('copyReferralBtn'),
    copyShareBtn: el('copyShareBtn'),
    teamCount: el('teamCount'),
    teamEarnings: el('teamEarnings'),
    offersContainer: el('offersContainer'),
    broadcastContainer: el('broadcastContainer'),
    broadcastText: el('broadcastText'),
    passwordForm: el('passwordForm'),
    newPassword: el('newPassword'),
    logoutBtn: el('logoutBtn')
  };

  /* =====================================================
     TOAST SYSTEM (PREMIUM)
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
     FETCH HELPERS (SERVER IS AUTHORITY)
     ===================================================== */
  async function api(path, options = {}) {
    const res = await fetch(path, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Request failed');
    }
    return res.json();
  }

  /* =====================================================
     LOAD DASHBOARD CORE
     ===================================================== */
  async function loadDashboard() {
    try {
      const data = await api('/api/dashboard/summary');

      els.partnerName.textContent = data.username;
      els.userInitial.textContent = data.username.charAt(0).toUpperCase();

      els.balance.textContent = `₹${Number(data.balance).toLocaleString()}`;
      els.teamCount.textContent = data.teamCount;
      els.teamEarnings.textContent =
        `₹${Number(data.teamEarnings).toLocaleString()}`;
      els.minPayout.textContent =
        `₹${Number(data.minPayout).toLocaleString()}`;

      els.referralLink.value = data.referralLink;

      updateWithdrawState(data);

      renderOffers(data.campaigns);
      renderBroadcast(data.broadcast);

    } catch {
      toast('DASHBOARD UNAVAILABLE', 'error');
      location.href = '/login';
    }
  }

  /* =====================================================
     WITHDRAW BUTTON STATE (UI ONLY)
     ===================================================== */
  function updateWithdrawState(data) {
    if (data.withdrawalPending) {
      els.withdrawBtn.disabled = true;
      els.withdrawBtn.innerHTML = '<i class="fas fa-lock"></i> REQUEST PENDING';
      return;
    }

    if (data.balance >= data.minPayout) {
      els.withdrawBtn.disabled = false;
      els.withdrawBtn.innerHTML = 'WITHDRAW NOW';
      els.withdrawBtn.classList.add('bg-green-600', 'text-white');
    } else {
      els.withdrawBtn.disabled = true;
      els.withdrawBtn.innerHTML = '<i class="fas fa-lock"></i> LOCKED';
    }
  }

  /* =====================================================
     CAMPAIGNS RENDERER
     ===================================================== */
  function renderOffers(offers) {
    if (!offers || offers.length === 0) {
      els.offersContainer.innerHTML = `
        <div class="glass-panel p-6 text-center opacity-50">
          <i class="fas fa-folder-open mb-2"></i>
          <p class="text-xs font-bold uppercase">No active campaigns</p>
        </div>`;
      return;
    }

    els.offersContainer.innerHTML = offers.map(o => `
      <div class="glass-panel p-4 flex items-center justify-between">
        <div>
          <div class="font-bold text-white">${o.title}</div>
          <div class="text-[10px] text-green-400 font-black mt-1">
            YOU: ₹${Number(o.payout).toLocaleString()}
          </div>
        </div>
        <button class="bg-blue-600 px-3 py-2 rounded-lg text-xs font-black"
                onclick="navigator.clipboard.writeText('${o.link}')
                  .then(()=>toast('LINK COPIED','success'))">
          COPY
        </button>
      </div>
    `).join('');
  }

  /* =====================================================
     BROADCAST
     ===================================================== */
  function renderBroadcast(text) {
    if (!text) {
      els.broadcastContainer.classList.add('hidden');
      return;
    }
    els.broadcastText.textContent = text;
    els.broadcastContainer.classList.remove('hidden');
  }

  /* =====================================================
     ACTIONS (SERVER DECIDES)
     ===================================================== */

  // 🔥 FIXED: withdraw now sends AMOUNT (required by backend)
  els.withdrawBtn?.addEventListener('click', async () => {
    const amount = prompt('Enter withdrawal amount');
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      toast('INVALID AMOUNT', 'error');
      return;
    }

    try {
      await api('/api/dashboard/request-withdraw', {
        method: 'POST',
        body: JSON.stringify({ amount: Number(amount) })
      });
      toast('REQUEST SENT', 'success');
      loadDashboard();
    } catch (e) {
      toast(e.message || 'WITHDRAW FAILED', 'error');
    }
  });

  els.copyReferralBtn?.addEventListener('click', () => {
    navigator.clipboard.writeText(els.referralLink.value)
      .then(() => toast('REFERRAL LINK COPIED', 'success'));
  });

  els.copyShareBtn?.addEventListener('click', () => {
    const msg = `🔥 Earn with CashTree\nRegister here:\n${els.referralLink.value}`;
    navigator.clipboard.writeText(msg)
      .then(() => toast('SHARE MESSAGE COPIED', 'success'));
  });

  els.passwordForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (els.newPassword.value.length < 6) {
      toast('MIN 6 CHARACTERS', 'error');
      return;
    }
    try {
      await api('/api/dashboard/update-password', {
        method: 'POST',
        body: JSON.stringify({ password: els.newPassword.value })
      });
      els.newPassword.value = '';
      toast('ACCESS KEY UPDATED', 'success');
    } catch {
      toast('UPDATE FAILED', 'error');
    }
  });

  els.logoutBtn?.addEventListener('click', async () => {
    await api('/api/auth/logout', { method: 'POST' });
    location.href = '/login';
  });

  /* =====================================================
     INIT
     ===================================================== */
  document.addEventListener('DOMContentLoaded', loadDashboard);

})();
