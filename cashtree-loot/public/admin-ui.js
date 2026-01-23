/* =========================================================
   CASH TREE — ADMIN UI CONTROLLER
   UI ONLY • ZERO AUTHORITY • SECURITY-BRICKED
   ========================================================= */

/* =========================================================
   1. GLOBAL STATE (UI ONLY)
========================================================= */
const AdminUI = {
  currentSection: 'dashboard'
};

/* =========================================================
   2. SAFE HELPERS
========================================================= */
const Safe = {
  text(v) {
    if (v === null || v === undefined) return '';
    const d = document.createElement('div');
    d.textContent = String(v);
    return d.innerHTML;
  },
  money(v) {
    return Number(v || 0).toLocaleString('en-IN', {
      maximumFractionDigits: 2
    });
  }
};

/* =========================================================
   3. TOAST SYSTEM
========================================================= */
const Toast = {
  show(msg, type = 'neutral') {
    const box = document.getElementById('toast-container');
    if (!box) return;

    const el = document.createElement('div');
    const map = {
      success: 'border-green-500 bg-[#064e3b]/90 text-green-400',
      error: 'border-red-500 bg-[#450a0a]/90 text-red-400',
      neutral: 'border-blue-500 bg-[#1e3a8a]/90 text-blue-400'
    };

    el.className = `
      px-6 py-4 rounded-xl shadow-2xl backdrop-blur-xl
      border-l-4 text-xs font-black tracking-widest uppercase
      ${map[type] || map.neutral}
    `;
    el.textContent = msg;

    box.appendChild(el);
    setTimeout(() => el.remove(), 3500);
  }
};

/* =========================================================
   4. API HELPER
========================================================= */
async function api(path, options = {}) {
  const res = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'REQUEST_FAILED');
  }
  return res.json();
}

/* =========================================================
   5. SECTION SWITCHER (SINGLE SOURCE OF TRUTH)
========================================================= */
function showSection(id) {
  if (!id) return;

  document.querySelectorAll('.section').forEach(sec =>
    sec.classList.toggle('hidden', sec.id !== id)
  );

  document.querySelectorAll('[data-section]').forEach(btn =>
    btn.classList.toggle('active', btn.dataset.section === id)
  );

  AdminUI.currentSection = id;

  if (id === 'dashboard') loadStats();
  if (id === 'campaigns') loadCampaigns();
  if (id === 'leads') loadLeads();
  if (id === 'withdrawals') loadWithdrawals();
  if (id === 'audit') loadAuditLogs();
}

/* =========================================================
   6. DATA LOADERS
========================================================= */
async function loadStats() {
  try {
    const data = await api('/api/admin/stats');
    document.getElementById('statLeads').innerText = data.totalLeads;
    document.getElementById('statPromoters').innerText = data.promoters;
    document.getElementById('statLiability').innerText = Safe.money(data.liability);
  } catch {
    Toast.show('Stats unavailable', 'error');
  }
}

async function loadCampaigns() {
  try {
    const list = await api('/api/admin/campaigns');
    const grid = document.getElementById('campaignGrid');
    grid.innerHTML = '';

    list.forEach(c => {
      const card = document.createElement('div');
      card.className = 'glass-panel p-6 rounded-2xl';
      card.innerHTML = `
        <h3 class="font-black mb-2">${Safe.text(c.title)}</h3>
        <div class="text-xs text-slate-400 mb-4">
          Payout: ₹${Safe.money(c.payout)}
        </div>
      `;
      grid.appendChild(card);
    });
  } catch {
    Toast.show('Campaign load failed', 'error');
  }
}

async function loadLeads() {
  try {
    const leads = await api('/api/admin/leads');
    const tbody = document.getElementById('leadsTable');
    tbody.innerHTML = '';

    leads.forEach(l => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${new Date(l.date).toLocaleDateString()}</td>
        <td>${Safe.text(l.campaign)}</td>
        <td>@${Safe.text(l.promoter)}</td>
        <td class="text-center">
          <button class="bg-green-600 px-3 py-1 text-xs rounded"
            onclick="approveLead('${l.id}')">APPROVE</button>
          <button class="text-red-500 px-2"
            onclick="rejectLead('${l.id}')">✖</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch {
    Toast.show('Leads unavailable', 'error');
  }
}

/* =========================================================
   7. LEAD ACTIONS
========================================================= */
async function approveLead(id) {
  if (!confirm('Approve this lead?')) return;
  try {
    await api('/api/admin/approve-lead', {
      method: 'POST',
      body: JSON.stringify({ leadId: id })
    });
    Toast.show('Lead approved', 'success');
    loadLeads(); loadStats();
  } catch {
    Toast.show('Approval failed', 'error');
  }
}

async function rejectLead(id) {
  if (!confirm('Reject this lead?')) return;
  try {
    await api('/api/admin/reject-lead', {
      method: 'POST',
      body: JSON.stringify({ leadId: id })
    });
    Toast.show('Lead rejected', 'neutral');
    loadLeads();
  } catch {
    Toast.show('Rejection failed', 'error');
  }
}

/* =========================================================
   8. WITHDRAWALS
========================================================= */
async function loadWithdrawals() {
  const tbody = document.getElementById('withdrawalsList');
  if (!tbody) return;

  tbody.innerHTML = '';

  try {
    const data = await api('/api/admin/withdrawals');

    data.forEach(w => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${Safe.text(w.accounts.username)}</td>
        <td>${Safe.text(w.accounts.upi_id || '-')}</td>
        <td class="text-right">₹${Safe.money(w.amount)}</td>
        <td>${new Date(w.created_at).toLocaleDateString()}</td>
        <td class="text-center">
          <button onclick="processWithdraw('${w.id}', true)">✔</button>
          <button onclick="processWithdraw('${w.id}', false)">✖</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch {
    Toast.show('Withdrawals failed', 'error');
  }
}

async function processWithdraw(id, approve) {
  if (!confirm(`Are you sure?`)) return;

  try {
    await api(
      approve ? '/api/admin/approve-withdraw' : '/api/admin/reject-withdraw',
      {
        method: 'POST',
        body: JSON.stringify({ requestId: id })
      }
    );
    Toast.show('Action completed', 'success');
    loadWithdrawals();
  } catch {
    Toast.show('Action failed', 'error');
  }
}

/* =========================================================
   9. AUDIT LOGS
========================================================= */
async function loadAuditLogs() {
  const table = document.getElementById('auditLogsTable');
  table.innerHTML = '';

  try {
    const logs = await api('/api/admin/audit-logs');

    logs.forEach(log => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${new Date(log.created_at).toLocaleString()}</td>
        <td>${log.actor_id || 'SYSTEM'}</td>
        <td>${log.actor_role}</td>
        <td>${log.action}</td>
        <td>${log.target_type || '-'}</td>
        <td><pre class="text-xs">${Safe.text(JSON.stringify(log.metadata || {}))}</pre></td>
      `;
      table.appendChild(tr);
    });
  } catch {
    Toast.show('Audit load failed', 'error');
  }
}

/* =========================================================
   10. BOOT
========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-section]').forEach(btn => {
    btn.addEventListener('click', () => showSection(btn.dataset.section));
  });

  showSection('dashboard');
});
