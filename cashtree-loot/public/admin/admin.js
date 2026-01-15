// =========================================
// 1. SUPABASE CONNECTION CORE
// =========================================
let db; 
try {
    const supabaseUrl = 'https://qzjvratinjirrcmgzjlx.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6anZyYXRpbmppcnJjbWd6amx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMzAxMDksImV4cCI6MjA4MzgwNjEwOX0.W01Pmbokf20stTgkUsmI3TZahXYK4PPbU0v_2Ziy9YA';
    
    if (!window.supabaseInstance) {
        window.supabaseInstance = window.supabase.createClient(supabaseUrl, supabaseKey);
    }
    db = window.supabaseInstance;
    console.log("✅ SYSTEM SECURE: Database Handshake Successful");
} catch (err) {
    console.error("❌ CRITICAL: Database Link Failure", err);
}

// =========================================
// 2. VAULT SECURITY PROTOCOLS
// =========================================
function checkAuth() {
    const keyInput = document.getElementById("masterKey");
    const btn = document.querySelector(".unlock-btn");
    const key = keyInput.value.trim();

    if(key === "znek7906") {
        btn.innerHTML = `<i class="fas fa-sync fa-spin mr-2"></i> AUTHORIZING...`;
        setTimeout(() => {
            document.getElementById("loginModal").classList.add("hidden");
            initDashboard();
        }, 800);
    } else {
        alert("❌ ACCESS DENIED: Identity Verification Failed");
        keyInput.value = "";
    }
}

function showSection(id) {
    document.querySelectorAll('.section').forEach(el => el.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const activeNav = document.getElementById('nav-' + id);
    if(activeNav) activeNav.classList.add('active');
}

// =========================================
// 3. CORE INITIALIZATION (HEARTBEAT)
// =========================================
async function initDashboard() {
    console.log("🛰️ Synchronizing Command Center...");
    await Promise.all([
        loadStats(),
        loadCampaigns(),
        loadLeads(),
        loadPayouts(),
        loadSystemConfig(),
        updatePendingBadge()
    ]);

    // Live Heartbeat every 30 seconds
    setInterval(() => {
        loadStats();
        loadLeads();
        updatePendingBadge();
    }, 30000); 
}

async function updatePendingBadge() {
    const { count } = await db.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'pending');
    const badge = document.getElementById('navPendingBadge');
    if (badge) {
        if (count > 0) {
            badge.innerText = count;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }
}

// =========================================
// 4. CAMPAIGN LAB (DEPLOYMENT)
// =========================================
async function loadCampaigns() {
    const { data: camps } = await db.from('campaigns').select('*').order('id');
    const grid = document.getElementById("campaignGrid");
    if (!grid) return;
    grid.innerHTML = "";
    
    camps.forEach(c => {
        const card = document.createElement("div");
        card.className = `glass-panel p-6 rounded-2xl border ${c.is_active ? 'border-green-500/30' : 'border-white/5'}`;
        card.innerHTML = `
    <div class="flex justify-between items-start mb-4">
        <img src="${c.image_url || 'https://via.placeholder.com/50'}" class="w-14 h-14 rounded-xl bg-black/40 object-cover border border-white/10">
        <button onclick="toggleCampaign('${c.id}', ${!c.is_active})" class="${c.is_active ? 'text-green-500' : 'text-slate-600'} text-xl">
            <i class="fas fa-power-off"></i>
        </button>
    </div>
    <h3 class="font-black text-white text-lg">${c.title}</h3>
    <div class="text-[10px] text-slate-500 truncate mb-4 font-mono">${c.url || 'No Destination Set'}</div>
    <div class="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
        <span class="text-green-400 font-black text-xl">₹${c.payout_amount}</span>
        
        <button onclick="openEditModal('${c.id}', '${c.title}', ${c.payout_amount})" class="text-slate-400 hover:text-white transition">
            <i class="fas fa-edit"></i>
        </button>
    </div>
`;
        grid.appendChild(card);
    });
}

function toggleCreateCampaign() {
    document.getElementById("createCampaignForm").classList.toggle("hidden");
}

async function createNewCampaign() {
    const title = document.getElementById("newCampTitle").value;
    const payout = document.getElementById("newCampPayout").value;
    const url = document.getElementById("newCampUrl").value;
    const img = document.getElementById("newCampImg").value;

    const { error } = await db.from('campaigns').insert([{ 
    title, 
    payout_amount: parseInt(payout), // Match your DB column name
    url, 
    image_url: img, 
    is_active: true 
    }]);

    if(!error) { 
        alert("🚀 CAMPAIGN DEPLOYED"); 
        toggleCreateCampaign(); 
        loadCampaigns(); 
    }
}

async function toggleCampaign(id, status) {
    await db.from('campaigns').update({ is_active: status }).eq('id', id);
    loadCampaigns();
}

// This opens your custom Glassmorphic box
function openEditModal(id, currentTitle, currentPayout) {
    // 1. Show the hidden modal
    document.getElementById('editModal').classList.remove('hidden');
    document.getElementById('editModal').style.display = 'flex';

    // 2. Fill the inputs with current data
    document.getElementById('editCampTitle').innerText = currentTitle;
    document.getElementById('editCampPayout').value = currentPayout;

    // 3. Store the ID globally so the Save function knows what to update
    window.currentEditingId = id;
}

async function saveCampaignUpdate() {
    const id = window.currentEditingId;
    const newPayout = document.getElementById('editCampPayout').value;

    // Execute Database Update
    const { error } = await db
        .from('campaigns')
        .update({ 
            payout_amount: parseInt(newPayout)
        })
        .eq('id', id);

    // Handle Result
    if (!error) {
        // Use a clean console log or a custom toast instead of alert for OG feel
        console.log("✅ System laws synchronized.");
        closeEditModal(); // Hide the box
        loadCampaigns(); // Refresh your grid
    } else {
        console.error("❌ Edit Failed:", error);
    }
}

function closeEditModal() {
    document.getElementById('editModal').classList.add('hidden');
    document.getElementById('editModal').style.display = 'none';
}


// =========================================
// 5. APPROVAL PROTOCOL (PASSIVE INCOME LOGIC)
// =========================================
async function loadLeads() {
    const { data: leads } = await db.from('leads').select(`*, promoters(full_name, username), campaigns(title, payout)`).eq('status', 'pending');
    const tbody = document.getElementById("leadsTableBody");
    tbody.innerHTML = "";
    
    if(!leads || leads.length === 0) {
        document.getElementById("noLeadsMsg").classList.remove("hidden");
        return;
    }
    document.getElementById("noLeadsMsg").classList.add("hidden");

    leads.forEach(lead => {
        const row = document.createElement("tr");
        row.className = "border-b border-white/5 hover:bg-white/[0.02]";
        row.innerHTML = `
            <td class="p-6 text-slate-400 text-xs">${new Date(lead.created_at).toLocaleDateString()}</td>
            <td class="p-6 font-bold text-white">${lead.campaigns?.title || '??'}</td>
            <td class="p-6">
                <div class="font-black text-white text-sm">${lead.promoters?.username}</div>
                <div class="text-[10px] text-slate-500 font-bold uppercase">${lead.promoters?.full_name}</div>
            </td>
            <td class="p-6">
                <div class="text-green-400 font-mono text-xs">${lead.phone}</div>
                <div class="text-[10px] text-slate-500 font-bold">UPI: ${lead.upi_id}</div>
            </td>
            <td class="p-6 text-center">
                <button onclick="approveLead('${lead.id}', '${lead.user_id}', ${lead.campaigns?.payout || 0})" class="bg-green-600 text-black font-black px-4 py-2 rounded-lg text-[10px] mr-2">PAY</button>
                <button onclick="rejectLead('${lead.id}')" class="bg-white/5 text-slate-400 px-4 py-2 rounded-lg text-[10px]">REJECT</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function approveLead(leadId, promoterId, amount) {
    if(!confirm(`Authorize ₹${amount} Settlement?`)) return;

    // 1. Mark Lead Approved
    await db.from('leads').update({ status: 'approved' }).eq('id', leadId);

    // 2. Fetch User & Referrer
    const { data: user } = await db.from('promoters').select('wallet_balance, referred_by').eq('id', promoterId).single();
    
    // 3. Credit Main User
    const newBal = (user.wallet_balance || 0) + Number(amount);
    await db.from('promoters').update({ wallet_balance: newBal }).eq('id', promoterId);

    // 4. Handle 10% Army Passive Commission
    if (user.referred_by) {
        const bonus = Number(amount) * 0.10;
        const { data: boss } = await db.from('promoters').select('wallet_balance, referral_earnings').eq('id', user.referred_by).single();
        if (boss) {
            await db.from('promoters').update({ 
                wallet_balance: (boss.wallet_balance || 0) + bonus,
                referral_earnings: (boss.referral_earnings || 0) + bonus 
            }).eq('id', user.referred_by);
        }
    }
    initDashboard();
    alert("✅ PROTOCOL EXECUTED: Settlement Dispersed");
}

// =========================================
// 6. SETTLEMENTS (PAYOUTS)
// =========================================
async function loadPayouts() {
    const { data: users } = await db.from('promoters').select('*').gt('wallet_balance', 0).order('wallet_balance', { ascending: false });
    const tbody = document.getElementById("payoutTableBody");
    tbody.innerHTML = "";

    users.forEach(u => {
        const row = document.createElement("tr");
        row.className = "border-b border-white/5";
        row.innerHTML = `
            <td class="p-6 font-bold text-white">${u.username}</td>
            <td class="p-6 font-mono text-yellow-500 text-xs">${u.upi_id}</td>
            <td class="p-6 text-right font-black text-green-400">₹${u.wallet_balance}</td>
            <td class="p-6 text-center">
                <button onclick="markPaid('${u.id}', ${u.wallet_balance}, '${u.upi_id}')"blue-600 text-white font-black px-4 py-2 rounded-lg text-[10px]">MARK PAID</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function markPaid(userId, amount, upiId) {
    // 1. Mobile "Deep Link" Protocol
    const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
    
    if (isMobile && upiId) {
        // Construct standard UPI Intent URL
        const upiUrl = `upi://pay?pa=${upiId}&pn=CashTreePromoter&am=${amount}&cu=INR`;
        
        if (confirm(`💸 Launch Payment App for ₹${amount}?`)) {
            window.location.href = upiUrl;
            
            // Post-payment verification prompt
            setTimeout(() => {
                if (confirm("✅ Verification: Did you complete the payment? Click OK to reset their wallet.")) {
                    completeSettlement(userId);
                }
            }, 2500);
            return;
        }
    }

    // 2. Desktop/Manual Fallback
    if (confirm(`Confirm manual settlement of ₹${amount}?`)) {
        completeSettlement(userId);
    }
}

async function completeSettlement(userId) {
    const { error } = await db.from('promoters').update({ wallet_balance: 0 }).eq('id', userId);
    if(!error) {
        initDashboard();
        alert("📊 Empire Ledger Updated.");
    }
}

// =========================================
// 7. GOD CONFIG & ANALYTICS
// =========================================
async function loadStats() {
    const { count: leads } = await db.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'approved');
    const { count: army } = await db.from('promoters').select('*', { count: 'exact', head: true });
    const { data: balData } = await db.from('promoters').select('wallet_balance');
    const liability = balData.reduce((sum, p) => sum + (Number(p.wallet_balance) || 0), 0);

    document.getElementById("statLeads").innerText = leads || 0;
    document.getElementById("statPromoters").innerText = army || 0;
    document.getElementById("statLiability").innerText = liability.toLocaleString('en-IN');
}

async function loadSystemConfig() {
    const { data } = await db.from('system_config').select('*');
    data.forEach(item => {
        if (item.key === 'min_payout') document.getElementById('cfg_min_payout').value = item.value;
        if (item.key === 'support_number') document.getElementById('cfg_support').value = item.value;
        if (item.key === 'site_status') document.getElementById('cfg_status').value = item.value;
    });
}

async function saveSystemConfig() {
    const vals = {
        min_payout: document.getElementById('cfg_min_payout').value,
        support_number: document.getElementById('cfg_support').value,
        site_status: document.getElementById('cfg_status').value
    };
    await Promise.all([
        db.from('system_config').update({ value: vals.min_payout }).eq('key', 'min_payout'),
        db.from('system_config').update({ value: vals.support_number }).eq('key', 'support_number'),
        db.from('system_config').update({ value: vals.site_status }).eq('key', 'site_status')
    ]);
    alert("🌍 SYSTEM LAWS UPDATED");
}

// Broadcast Hub
function openBroadcastModal() { document.getElementById("broadcastModal").classList.remove("hidden"); }
function closeBroadcastModal() { document.getElementById("broadcastModal").classList.add("hidden"); }
async function sendBroadcast() {
    const msg = document.getElementById("broadcastMsg").value;
    await db.from('system_config').update({ broadcast_message: msg }).eq('key', 'site_status');
    alert("📢 BROADCAST LIVE");
    closeBroadcastModal();
}

async function hardRefresh() {
    // 1. Start the Spin Animation
    const icon = document.getElementById('refresh-icon');
    icon.classList.add('fa-spin'); 
    
    console.log("🚀 Initializing Hard System Sync...");
    
    try {
        // 2. Clear the Browser's "Cache Storage" (The real cache killer)
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames.map(name => caches.delete(name))
            );
        }

        // 3. Unregister Service Workers (Crucial for mobile apps/PWAs)
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (let registration of registrations) {
                await registration.unregister();
            }
        }

        // 4. Force Reload with Cache-Buster
        // The "?v=" tricks the server into sending fresh files
        const timestamp = new Date().getTime();
        window.location.href = window.location.pathname + "?v=" + timestamp;
        
    } catch (error) {
        console.error("Refresh Failed:", error);
        window.location.reload(true); // Fallback
    }
}