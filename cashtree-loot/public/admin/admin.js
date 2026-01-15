/* ======================================================
   FINAL BOSS ADMIN SCRIPT – CASH TREE
   Supabase v2 | Hardened | Production Grade
====================================================== */

/* ================== SUPABASE INIT ================== */
let db = null;

(function initSupabase() {
  try {
    const SUPABASE_URL = "https://qzjvratinjirrcmgzjlx.supabase.co";
    const SUPABASE_KEY =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6anZyYXRpbmppcnJjbWd6amx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMzAxMDksImV4cCI6MjA4MzgwNjEwOX0.W01Pmbokf20stTgkUsmI3TZahXYK4PPbU0v_2Ziy9YA";

    if (!window.supabase?.createClient) {
      throw new Error("Supabase library not loaded");
    }

    if (!window.__ct_supabase__) {
      window.__ct_supabase__ = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
      );
    }

    db = window.__ct_supabase__;
    console.log("✅ Supabase connected");
  } catch (err) {
    console.error("❌ Supabase init failed:", err);
  }
})();

/* ================== AUTH ================== */
function checkAuth() {
  const input = document.getElementById("masterKey");
  const modal = document.getElementById("loginModal");

  if (!input || !modal) return;

  if (input.value.trim() !== "znek7906") {
    alert("❌ ACCESS DENIED");
    input.value = "";
    return;
  }

  modal.classList.add("hidden");
  initDashboard();
}

/* ================== NAVIGATION ================== */
function showSection(id) {
  document.querySelectorAll(".section").forEach(s =>
    s.classList.add("hidden")
  );

  const target = document.getElementById(id);
  if (!target) {
    console.error("Missing section:", id);
    return;
  }
  target.classList.remove("hidden");

  document.querySelectorAll(".nav-item").forEach(n =>
    n.classList.remove("active")
  );
  const nav = document.getElementById("nav-" + id);
  if (nav) nav.classList.add("active");
}

/* ================== INIT ================== */
async function initDashboard() {
  await Promise.all([
    loadStats(),
    loadCampaigns(),
    loadLeads(),
    loadPayouts(),
    loadSystemConfig(),
    updatePendingBadge()
  ]);

  setInterval(() => {
    loadStats();
    loadLeads();
    updatePendingBadge();
  }, 30000);
}

/* ================== BADGE ================== */
async function updatePendingBadge() {
  const badge = document.getElementById("navPendingBadge");
  if (!badge) return;

  const { count } = await db
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  if (count > 0) {
    badge.textContent = count;
    badge.classList.remove("hidden");
  } else {
    badge.classList.add("hidden");
  }
}

/* ================== CAMPAIGNS ================== */
async function loadCampaigns() {
  const grid = document.getElementById("campaignGrid");
  if (!grid) return;

  const { data } = await db.from("campaigns").select("*").order("id");
  grid.innerHTML = "";

  data?.forEach(c => {
    const el = document.createElement("div");
    el.className = "glass-panel p-6 rounded-2xl";
    el.innerHTML = `
      <h3 class="text-xl font-black text-white mb-2">${c.title}</h3>
      <p class="text-slate-400 text-xs truncate">${c.url || ""}</p>
      <div class="mt-4 flex justify-between items-center">
        <span class="text-green-400 font-bold">₹${c.payout || 0}</span>
        <input type="checkbox" ${
          c.is_active ? "checked" : ""
        } onchange="toggleCampaign('${c.id}', this.checked)">
      </div>
    `;
    grid.appendChild(el);
  });
}

async function toggleCampaign(id, isActive) {
  await db.from("campaigns").update({ is_active: isActive }).eq("id", id);
}

function toggleCreateCampaign() {
  const f = document.getElementById("createCampaignForm");
  f?.classList.toggle("hidden");
}

async function createNewCampaign() {
  const title = document.getElementById("newCampTitle").value.trim();
  const payout = Number(document.getElementById("newCampPayout").value);
  const url = document.getElementById("newCampUrl").value.trim();
  const img = document.getElementById("newCampImg").value.trim();

  if (!title || !payout) {
    alert("Missing fields");
    return;
  }

  await db.from("campaigns").insert([
    {
      title,
      payout,
      url,
      image_url: img,
      is_active: true
    }
  ]);

  toggleCreateCampaign();
  loadCampaigns();
}

/* ================== LEADS ================== */
async function loadLeads() {
  const body = document.getElementById("leadsTableBody");
  const empty = document.getElementById("noLeadsMsg");
  if (!body) return;

  const { data } = await db
    .from("leads")
    .select(
      `*, campaigns(title,payout), promoters(username,full_name)`
    )
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  body.innerHTML = "";

  if (!data || data.length === 0) {
    empty?.classList.remove("hidden");
    return;
  }
  empty?.classList.add("hidden");

  data.forEach(l => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${new Date(l.created_at).toLocaleDateString()}</td>
      <td>${l.campaigns?.title || ""}</td>
      <td>${l.promoters?.username || ""}</td>
      <td>${l.phone} <br><small>${l.upi_id}</small></td>
      <td>
        <button onclick="approveLead('${l.id}','${l.user_id}',${l.campaigns?.payout || 0})">PAY</button>
        <button onclick="rejectLead('${l.id}')">REJECT</button>
      </td>
    `;
    body.appendChild(tr);
  });
}

async function approveLead(leadId, userId, amount) {
  if (!confirm(`Approve ₹${amount}?`)) return;

  await db.from("leads").update({ status: "approved" }).eq("id", leadId);

  const { data: promoter } = await db
    .from("promoters")
    .select("wallet_balance,referred_by")
    .eq("id", userId)
    .single();

  const newBal = (promoter.wallet_balance || 0) + amount;
  await db.from("promoters").update({ wallet_balance: newBal }).eq("id", userId);

  if (promoter.referred_by) {
    const bonus = amount * 0.1;
    const { data: boss } = await db
      .from("promoters")
      .select("wallet_balance,referral_earnings")
      .eq("id", promoter.referred_by)
      .single();

    await db
      .from("promoters")
      .update({
        wallet_balance: (boss.wallet_balance || 0) + bonus,
        referral_earnings: (boss.referral_earnings || 0) + bonus
      })
      .eq("id", promoter.referred_by);
  }

  loadLeads();
  loadStats();
  loadPayouts();
}

async function rejectLead(id) {
  if (!confirm("Reject lead?")) return;
  await db.from("leads").update({ status: "rejected" }).eq("id", id);
  loadLeads();
}

/* ================== PAYOUTS ================== */
async function loadPayouts() {
  const body = document.getElementById("payoutTableBody");
  if (!body) return;

  const { data } = await db
    .from("promoters")
    .select("*")
    .gt("wallet_balance", 0)
    .order("wallet_balance", { ascending: false });

  body.innerHTML = "";
  data?.forEach(u => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${u.username}</td>
      <td>${u.upi_id}</td>
      <td>₹${u.wallet_balance}</td>
      <td><button onclick="markPaid('${u.id}',${u.wallet_balance})">MARK PAID</button></td>
    `;
    body.appendChild(tr);
  });
}

async function markPaid(id, amt) {
  if (!confirm(`Confirm ₹${amt}?`)) return;

  const { error } = await db.rpc("reset_wallet", {
    target_user_id: id
  });

  if (error) {
    await db
      .from("promoters")
      .update({ wallet_balance: 0, referral_earnings: 0 })
      .eq("id", id);
  }

  loadPayouts();
  loadStats();
}

/* ================== STATS ================== */
async function loadStats() {
  const { count: leads } = await db
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved");

  const { count: users } = await db
    .from("promoters")
    .select("*", { count: "exact", head: true });

  const { data: bal } = await db.from("promoters").select("wallet_balance");
  const total = bal?.reduce((s, p) => s + Number(p.wallet_balance || 0), 0);

  document.getElementById("statLeads").textContent = leads || 0;
  document.getElementById("statPromoters").textContent = users || 0;
  document.getElementById("statLiability").textContent =
    total?.toLocaleString("en-IN") || 0;
}

/* ================== BROADCAST ================== */
function openBroadcastModal() {
  document.getElementById("broadcastModal")?.classList.remove("hidden");
}
function closeBroadcastModal() {
  document.getElementById("broadcastModal")?.classList.add("hidden");
}

async function sendBroadcast() {
  const msg = document.getElementById("broadcastMsg").value.trim();
  if (!msg) return alert("Empty message");

  await db
    .from("system_config")
    .update({ broadcast_message: msg })
    .eq("key", "site_status");

  closeBroadcastModal();
}

/* ================== SYSTEM CONFIG ================== */
async function loadSystemConfig() {
  const { data } = await db.from("system_config").select("*");
  data?.forEach(c => {
    if (c.key === "min_payout")
      document.getElementById("cfg_min_payout").value = c.value;
    if (c.key === "support_number")
      document.getElementById("cfg_support").value = c.value;
    if (c.key === "site_status")
      document.getElementById("cfg_status").value = c.value;
  });
}

async function saveSystemConfig() {
  await Promise.all([
    db
      .from("system_config")
      .update({ value: document.getElementById("cfg_min_payout").value })
      .eq("key", "min_payout"),
    db
      .from("system_config")
      .update({ value: document.getElementById("cfg_support").value })
      .eq("key", "support_number"),
    db
      .from("system_config")
      .update({ value: document.getElementById("cfg_status").value })
      .eq("key", "site_status")
  ]);

  alert("System updated");
}
