<!DOCTYPE html>
<html lang="en">
<head>
  <!-- =========================
       CORE META
  ========================== -->
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <meta name="robots" content="noindex, nofollow" />

  <title>CashTree | Partner Command</title>

  <!-- =========================
       UI LIBRARIES (UI ONLY)
  ========================== -->
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
  <link rel="icon" type="image/webp" href="/logo.webp">

  <!-- =========================
       DASHBOARD THEME
  ========================== -->
  <link rel="stylesheet" href="/dashboard.css">

  <meta name="theme-color" content="#000000">
</head>

<body class="antialiased opacity-0 transition-opacity duration-700 bg-black"
      onload="document.body.classList.remove('opacity-0')">

<!-- =========================================================
     HEADER
========================================================= -->
<header class="fixed top-0 left-0 right-0 z-50 h-20 flex items-center justify-between px-6 bg-black/80 backdrop-blur-2xl border-b border-white/5">
  <div class="flex items-center gap-4">
    <div class="relative">
      <div class="absolute inset-0 bg-green-500 blur-xl opacity-20"></div>
      <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-green-900 flex items-center justify-center border border-green-400/30 text-white font-black text-sm relative z-10">
        <span id="userInitial">—</span>
      </div>
    </div>

    <div>
      <div class="flex items-center gap-2">
        <div class="text-[9px] text-green-400 font-bold uppercase tracking-[0.2em]">
          Partner
        </div>
        <div class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
      </div>
      <div class="text-base font-black text-white tracking-tight mt-1 flex items-center gap-2">
        <span id="partnerName">Loading…</span>
        <i class="fas fa-certificate text-blue-500 text-[10px]" title="Verified"></i>
      </div>
    </div>
  </div>

  <button id="logoutBtn"
          class="w-10 h-10 rounded-full bg-red-500/5 border border-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500/20 active:scale-95 transition-all">
    <i class="fas fa-power-off"></i>
  </button>
</header>

<!-- =========================================================
     MAIN
========================================================= -->
<main class="pt-28 px-5 pb-24 max-w-lg mx-auto space-y-6">

  <!-- =========================
       BROADCAST
  ========================== -->
  <div id="broadcastContainer" class="hidden">
    <div class="glass-panel p-5 border-l-4 border-yellow-500 flex gap-4 items-start">
      <i class="fas fa-bullhorn text-yellow-500"></i>
      <div class="flex-1">
        <div class="text-[9px] font-black text-yellow-500 uppercase tracking-[0.25em] mb-1">
          Official Update
        </div>
        <div id="broadcastText" class="text-sm text-slate-200">
          —
        </div>
      </div>
      <button onclick="this.closest('#broadcastContainer').classList.add('hidden')"
              class="text-slate-500 hover:text-white">
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>

  <!-- =========================
       BALANCE GRID
  ========================== -->
  <div class="grid grid-cols-2 gap-4">
    <div class="glass-panel p-5">
      <div class="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">
        Wallet Balance
      </div>
      <div id="balanceDisplay"
           class="text-3xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]">
        ₹0
      </div>
    </div>

    <div class="glass-panel p-5 flex flex-col justify-between">
      <div class="flex justify-between text-[10px] uppercase font-black text-slate-400">
        <span>Min Payout</span>
        <span id="minPayout" class="text-green-400">—</span>
      </div>
      <button id="withdrawBtn"
              disabled
              class="mt-3 w-full py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-500 text-[10px] font-black uppercase tracking-wider">
        <i class="fas fa-lock"></i> Locked
      </button>
    </div>
  </div>

  <!-- =========================
       REFERRAL
  ========================== -->
  <div class="glass-panel p-6">
    <div class="text-xs font-black uppercase tracking-wide text-green-400 mb-4">
      Referral Engine
    </div>

    <div class="flex gap-2 mb-4 bg-black/40 p-1.5 rounded-xl border border-white/5">
      <input id="referralLink"
             readonly
             class="bg-transparent flex-1 px-3 text-xs font-mono text-slate-300 outline-none"
             value="Generating secure link…" />
      <button id="copyReferralBtn"
              class="bg-blue-600 hover:bg-blue-500 text-white px-5 rounded-lg font-bold text-xs">
        COPY
      </button>
    </div>

    <button id="copyShareBtn"
            class="w-full py-3 rounded-xl bg-gradient-to-r from-green-900/20 to-green-800/20 border border-green-500/30 text-green-400 text-xs font-black uppercase tracking-widest">
      <i class="fab fa-whatsapp"></i> Copy Share Message
    </button>

    <div class="grid grid-cols-2 gap-4 mt-6 border-t border-white/5 pt-4">
      <div>
        <div class="text-[9px] uppercase font-black text-slate-500 tracking-widest">
          Team Size
        </div>
        <div id="teamCount" class="text-2xl font-black text-white">
          0
        </div>
      </div>
      <div class="text-right">
        <div class="text-[9px] uppercase font-black text-slate-500 tracking-widest">
          Team Earnings
        </div>
        <div id="teamEarnings" class="text-2xl font-black text-green-400">
          ₹0
        </div>
      </div>
    </div>
  </div>

  <!-- =========================
       ACTIVE CAMPAIGNS
  ========================== -->
  <div>
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-xs font-black uppercase tracking-widest text-slate-300">
        Active Campaigns
      </h3>
      <span class="text-[9px] text-green-500 font-bold uppercase">Live</span>
    </div>

    <div id="offersContainer" class="space-y-4">
      <div class="glass-panel p-6 text-center opacity-60">
        <i class="fas fa-circle-notch fa-spin text-2xl text-blue-500 mb-3"></i>
        <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Loading…
        </p>
      </div>
    </div>
  </div>

  <!-- =========================
       PASSWORD UPDATE
  ========================== -->
  <div class="glass-panel p-5 bg-red-900/5 border-red-500/10 mt-8">
    <div class="flex items-center gap-3 mb-4 text-slate-400">
      <i class="fas fa-shield-alt text-red-400"></i>
      <span class="text-[10px] font-black uppercase tracking-widest">
        Security
      </span>
    </div>
    <form id="passwordForm" class="flex gap-2">
      <input id="newPassword"
             type="password"
             placeholder="New Access Key"
             class="bg-black/40 border border-white/10 text-white rounded-lg flex-1 px-4 py-2 text-xs outline-none">
      <button type="submit"
              class="bg-slate-800 hover:bg-slate-700 text-white px-5 rounded-lg text-[10px] font-bold uppercase">
        Update
      </button>
    </form>
  </div>

  <!-- =========================
       FOOTER
  ========================== -->
  <footer class="mt-12 text-center opacity-40">
    <img src="/logo.webp" class="w-5 h-5 mx-auto mb-2 grayscale invert opacity-50">
    <p class="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em]">
      CashTree Secure Partner System
    </p>
  </footer>

</main>

<!-- =========================================================
     DASHBOARD UI CONTROLLER
========================================================= -->
<script src="/dashboard-ui.js"></script>

</body>
</html>
