import Head from 'next/head';

export const metadata = {
  title: 'CashTree | Partner Command',
  robots: 'noindex, nofollow',
  themeColor: '#000000'
};

export default function DashboardPage() {
  return (
    <>
      {/* =========================
         HEAD ASSETS
      ========================== */}
      <Head>
        <link rel="icon" type="image/webp" href="/logo.webp" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
        <link rel="stylesheet" href="/dashboard.css" />
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>

      {/* =========================
         BODY CONTENT
      ========================== */}
      <main
        className="antialiased bg-black"
        dangerouslySetInnerHTML={{
          __html: `
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
        <i class="fas fa-certificate text-blue-500 text-[10px]"></i>
      </div>
    </div>
  </div>

  <button id="logoutBtn"
    class="w-10 h-10 rounded-full bg-red-500/5 border border-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500/20">
    <i class="fas fa-power-off"></i>
  </button>
</header>

<main class="pt-28 px-5 pb-24 max-w-lg mx-auto space-y-6">

  <div id="broadcastContainer" class="hidden"></div>

  <div class="grid grid-cols-2 gap-4">
    <div class="glass-panel p-5">
      <div class="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">
        Wallet Balance
      </div>
      <div id="balanceDisplay" class="text-3xl font-black text-white">₹0</div>
    </div>

    <div class="glass-panel p-5">
      <div class="flex justify-between text-[10px] uppercase font-black text-slate-400">
        <span>Min Payout</span>
        <span id="minPayout">—</span>
      </div>
      <button id="withdrawBtn" disabled class="mt-3 w-full py-2.5 rounded-lg">
        LOCKED
      </button>
    </div>
  </div>

  <div id="offersContainer"></div>

</main>
`
        }}
      />

      {/* =========================
         UI LOGIC
      ========================== */}
      <script src="/dashboard-ui.js"></script>
    </>
  );
}
