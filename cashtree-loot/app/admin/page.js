<!DOCTYPE html>
<html lang="en">
<head>
  <!-- =========================
       CORE META
  ========================== -->
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <meta name="robots" content="noindex, nofollow" />
  <meta http-equiv="X-Content-Type-Options" content="nosniff" />
  <meta name="referrer" content="strict-origin-when-cross-origin" />

  <title>Admin Command | CashTree</title>

  <!-- =========================
       THEME & ASSETS
  ========================== -->
  <link rel="icon" type="image/webp" href="/logo.webp" />
  <link rel="manifest" href="/manifest.json" />

  <!-- =========================
       UI LIBRARIES (UI ONLY)
       No authority, no secrets
  ========================== -->
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
  <link rel="stylesheet" href="/style.css" />

  <!-- =========================
       HARD UI RULES
       Page is assumed AUTHORIZED
       BEFORE it is served.
  ========================== -->
  <style>
    body {
      background: #000;
      color: #fff;
      overflow: hidden;
    }
  </style>
</head>

<body class="min-h-screen flex">

<!-- =========================================================
     SIDEBAR (DESKTOP)
========================================================= -->
<aside class="hidden md:flex w-72 flex-col border-r border-white/10 bg-black/60 backdrop-blur-xl">
  <div class="p-6 flex items-center gap-4 border-b border-white/10">
    <img src="/logo.webp" class="w-10 h-10 object-contain drop-shadow-[0_0_12px_rgba(34,197,94,0.6)]" />
    <div>
      <div class="text-lg font-black tracking-wide">CashTree</div>
      <div class="text-[10px] uppercase tracking-widest text-green-500 font-bold">Administrator</div>
    </div>
  </div>

  <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
    <div class="text-[10px] uppercase tracking-widest text-slate-500 font-black px-3 pt-4">Overview</div>

    <button data-section="dashboard" class="nav-item active">
      <i class="fas fa-chart-line"></i><span>Dashboard</span>
    </button>

    <button data-section="campaigns" class="nav-item">
      <i class="fas fa-briefcase"></i><span>Campaigns</span>
    </button>

    <div class="text-[10px] uppercase tracking-widest text-slate-500 font-black px-3 pt-6">Management</div>

    <button data-section="leads" class="nav-item justify-between">
      <div class="flex items-center gap-3">
        <i class="fas fa-user-check"></i><span>Approvals</span>
      </div>
      <span id="pendingBadge" class="hidden bg-red-600 text-[9px] font-black px-2 py-0.5 rounded-full">0</span>
    </button>

    <button data-section="payouts" class="nav-item">
      <i class="fas fa-credit-card"></i><span>Settlements</span>
    </button>

    <button data-section="audit">Audit Logs</button>


    <div class="text-[10px] uppercase tracking-widest text-slate-500 font-black px-3 pt-6">System</div>

    <button data-section="settings" class="nav-item">
      <i class="fas fa-sliders-h"></i><span>Settings</span>
    </button>

    <button id="logoutBtn" class="nav-item mt-auto text-red-500">
      <i class="fas fa-power-off"></i><span>Logout</span>
    </button>
  </nav>
</aside>

<!-- =========================================================
     MAIN CONTENT
========================================================= -->
<main class="flex-1 h-screen overflow-y-auto p-6 md:p-10 bg-gradient-to-br from-black via-[#020617] to-black">

  <!-- DASHBOARD -->
  <section id="dashboard" class="section">
    <h1 class="text-3xl font-black mb-8">Overview</h1>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="stat-card border-green-500">
        <div class="label">Total Leads</div>
        <div class="value" id="statLeads">—</div>
      </div>
      <div class="stat-card border-red-500">
        <div class="label">Outstanding Liability</div>
        <div class="value">₹<span id="statLiability">—</span></div>
      </div>
      <div class="stat-card border-blue-500">
        <div class="label">Active Promoters</div>
        <div class="value" id="statPromoters">—</div>
      </div>
    </div>
  </section>

  <!-- CAMPAIGNS -->
  <section id="campaigns" class="section hidden">
    <div class="flex justify-between items-center mb-10">
      <h1 class="text-3xl font-black">Campaigns</h1>
      <button class="unlock-btn">New Campaign</button>
    </div>
    <div id="campaignGrid" class="grid grid-cols-1 md:grid-cols-3 gap-6"></div>
  </section>

  <!-- LEADS -->
  <section id="leads" class="section hidden">
    <h1 class="text-3xl font-black mb-8">Pending Approvals</h1>

    <div class="glass-panel overflow-x-auto rounded-2xl">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Campaign</th>
            <th>Promoter</th>
            <th>User</th>
            <th class="text-center">Action</th>
          </tr>
        </thead>
        <tbody id="leadsTable"></tbody>
      </table>
    </div>
  </section>

    <!-- WITHDRAWALS -->
  <section id="withdrawals" class="section hidden">
    <h1 class="text-3xl font-black mb-8">Withdrawal Requests</h1>

    <div class="glass-panel overflow-x-auto rounded-2xl">
      <table>
        <thead>
          <tr>
            <th>Promoter</th>
            <th>UPI</th>
            <th class="text-right">Amount</th>
            <th>Date</th>
            <th class="text-center">Action</th>
          </tr>
        </thead>
        <tbody id="withdrawalsList"></tbody>
      </table>
    </div>
  </section>

  <!-- AUDIT LOGS -->
<section id="audit" class="section hidden">
  <h1 class="text-3xl font-black mb-8">Audit Logs</h1>

  <div class="glass-panel overflow-x-auto rounded-2xl">
    <table>
      <thead>
        <tr>
          <th>Time</th>
          <th>Actor</th>
          <th>Role</th>
          <th>Action</th>
          <th>Target</th>
          <th>Details</th>
        </tr>
      </thead>
      <tbody id="auditLogsTable"></tbody>
    </table>
  </div>
</section>



  <!-- PAYOUTS -->
  <section id="payouts" class="section hidden">
    <h1 class="text-3xl font-black mb-8">Settlements</h1>

    <div class="glass-panel overflow-x-auto rounded-2xl">
      <table>
        <thead>
          <tr>
            <th>Payee</th>
            <th>Type</th>
            <th class="text-right">Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody id="payoutTable"></tbody>
      </table>
    </div>
  </section>

  <!-- SETTINGS -->
  <section id="settings" class="section hidden">
    <h1 class="text-3xl font-black mb-8">System Settings</h1>

    <div class="glass-panel p-8 rounded-2xl max-w-xl space-y-6">
      <div>
        <label class="label">Minimum Withdrawal</label>
        <input type="number" class="input-dark" />
      </div>
      <div>
        <label class="label">Support Number</label>
        <input type="tel" class="input-dark" />
      </div>
      <div>
        <label class="label">Platform Status</label>
        <select class="input-dark">
          <option>LIVE</option>
          <option>MAINTENANCE</option>
        </select>
      </div>

      <button class="unlock-btn w-full">Save Configuration</button>
    </div>
  </section>

</main>

<!-- =========================================================
     TOASTS / MODALS (UI ONLY)
========================================================= -->
<div id="toast-container" class="fixed top-6 right-6 z-50 flex flex-col gap-3"></div>

<!-- =========================================================
     UI CONTROLLER (NO AUTH, NO DB AUTHORITY)
========================================================= -->
<script src="/admin-ui.js"></script>

</body>
</html>
