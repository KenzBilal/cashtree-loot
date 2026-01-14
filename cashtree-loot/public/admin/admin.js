const supabaseUrl = 'https://qzjvratinjirrcmgzjlx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6anZyYXRpbmppcnJjbWd6amx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMzAxMDksImV4cCI6MjA4MzgwNjEwOX0.W01Pmbokf20stTgkUsmI3TZahXYK4PPbU0v_2Ziy9YA';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

function checkAuth() {
    const key = document.getElementById("masterKey").value;
    if(key === "znek7906") {
        document.getElementById("loginModal").classList.add("hidden");
        initDashboard();
    } else {
        alert("❌ ACCESS DENIED");
        document.getElementById("masterKey").value = "";
    }
}
// ... rest of your code 
 function showSection(id) {
    document.querySelectorAll('.section').forEach(el => el.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById('nav-' + id).classList.add('active');
}

// --- INITIALIZATION ---
function initDashboard() {
    loadStats();
    loadCampaigns();
    loadLeads();
    loadPayouts();
    setInterval(() => { loadStats(); loadLeads(); }, 30000);
}

// --- CAMPAIGNS ---
async function loadCampaigns() {
    const { data: camps } = await supabase.from('campaigns').select('*').order('id');
    const grid = document.getElementById("campaignGrid");
    grid.innerHTML = "";
    
    camps.forEach(c => {
        const card = document.createElement("div");
        card.className = `glass-panel p-6 rounded-2xl border ${c.is_active ? 'border-green-500/30' : 'border-slate-700'}`;
        card.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <img src="${c.image_url || 'https://via.placeholder.com/50'}" class="w-14 h-14 rounded-lg bg-slate-800 object-cover">
                <label class="switch">
                    <input type="checkbox" ${c.is_active ? 'checked' : ''} onchange="toggleCampaign('${c.id}', this.checked)">
                    <span class="slider"></span>
                </label>
            </div>
            <h3 class="font-bold text-xl text-white">${c.title}</h3>
            <div class="text-xs text-slate-400 truncate mb-4">${c.url}</div>
            <div class="flex items-center justify-between mt-4 pt-4 border-t border-slate-700">
                <span class="text-green-400 font-bold bg-green-400/10 px-3 py-1 rounded">₹${c.payout}</span>
                <button class="text-slate-400 hover:text-white text-sm"><i class="fas fa-cog"></i> Edit</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

async function toggleCampaign(id, isActive) {
    await supabase.from('campaigns').update({ is_active: isActive }).eq('id', id);
}

function toggleCreateCampaign() {
    document.getElementById("createCampaignForm").classList.toggle("hidden");
}

async function createNewCampaign() {
    const title = document.getElementById("newCampTitle").value;
    const payout = document.getElementById("newCampPayout").value;
    const url = document.getElementById("newCampUrl").value;
    const img = document.getElementById("newCampImg").value;

    const { error } = await supabase.from('campaigns').insert([{
        title: title, payout: payout, url: url, image_url: img, is_active: true
    }]);

    if(!error) {
        alert("✅ Campaign Launched!");
        toggleCreateCampaign();
        loadCampaigns();
    }
}

// --- LEADS ---
async function loadLeads() {
    const { data: leads } = await supabase
        .from('leads')
        .select(`*, promoters(full_name, username), campaigns(title, payout)`)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

    const tbody = document.getElementById("leadsTableBody");
    const badge = document.getElementById("navPendingBadge");
    tbody.innerHTML = "";
    
    if(leads && leads.length > 0) {
        document.getElementById("noLeadsMsg").classList.add("hidden");
        badge.innerText = leads.length;
        badge.classList.remove("hidden");
        
        leads.forEach(lead => {
            const row = document.createElement("tr");
            row.className = "hover:bg-slate-800/50";
            row.innerHTML = `
                <td class="p-5 text-slate-400">${new Date(lead.created_at).toLocaleDateString()}</td>
                <td class="p-5 font-bold text-white">${lead.campaigns?.title || 'Unknown'}</td>
                <td class="p-5">
                    <div class="font-bold text-white">${lead.promoters?.username || 'User'}</div>
                    <div class="text-xs text-slate-500">${lead.promoters?.full_name || ''}</div>
                </td>
                <td class="p-5">
                    <div class="text-blue-300 font-mono">${lead.phone}</div>
                    <div class="text-xs text-slate-500">UPI: ${lead.upi_id}</div>
                </td>
                <td class="p-5 text-center flex gap-2 justify-center">
                    <button onclick="approveLead('${lead.id}', '${lead.user_id}', ${lead.campaigns?.payout || 100})" class="bg-green-600 px-3 py-1 rounded text-white text-xs font-bold">PAY</button>
                    <button onclick="rejectLead('${lead.id}')" class="bg-slate-700 px-3 py-1 rounded text-white text-xs font-bold">REJECT</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } else {
        document.getElementById("noLeadsMsg").classList.remove("hidden");
        badge.classList.add("hidden");
    }
}

async function approveLead(leadId, promoterId, amount) {
    if(!confirm(`Approve and credit ₹${amount}?`)) return;
    await supabase.from('leads').update({ status: 'approved' }).eq('id', leadId);
    const { data: p } = await supabase.from('promoters').select('wallet_balance').eq('id', promoterId).single();
    const newBal = (p.wallet_balance || 0) + Number(amount);
    await supabase.from('promoters').update({ wallet_balance: newBal }).eq('id', promoterId);
    loadLeads();
    loadStats();
}

async function rejectLead(leadId) {
    if(!confirm("Reject?")) return;
    await supabase.from('leads').update({ status: 'rejected' }).eq('id', leadId);
    loadLeads();
}

// --- PAYOUTS ---
async function loadPayouts() {
    const { data: users } = await supabase.from('promoters').select('*').gt('wallet_balance', 0).order('wallet_balance', { ascending: false });
    const tbody = document.getElementById("payoutTableBody");
    tbody.innerHTML = "";
    let totalLiability = 0;

    if(users) {
        users.forEach(u => {
            totalLiability += u.wallet_balance;
            const row = document.createElement("tr");
            row.className = "hover:bg-slate-800/50";
            row.innerHTML = `
                <td class="p-5"><div class="font-bold text-white">${u.full_name}</div><div class="text-xs text-slate-500">@${u.username}</div></td>
                <td class="p-5 font-mono text-yellow-400 select-all">${u.upi_id}</td>
                <td class="p-5 text-right font-bold text-green-400 text-xl">₹${u.wallet_balance}</td>
                <td class="p-5 text-center"><button onclick="markPaid('${u.id}', ${u.wallet_balance})" class="bg-blue-600 px-4 py-2 rounded text-white text-xs font-bold">MARK PAID</button></td>
            `;
            tbody.appendChild(row);
        });
    }
    document.getElementById("statLiability").innerText = totalLiability;
}

async function markPaid(userId, amount) {
    if(!confirm(`Paid ₹${amount}?`)) return;
    const { error } = await supabase.rpc('reset_wallet', { target_user_id: userId });
    if(error) await supabase.from('promoters').update({ wallet_balance: 0 }).eq('id', userId);
    loadPayouts();
    loadStats();
}

// --- STATS ---
async function loadStats() {
    const { count: leadCount } = await supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'approved');
    const { count: promoterCount } = await supabase.from('promoters').select('*', { count: 'exact', head: true });
    document.getElementById("statLeads").innerText = leadCount || 0;
    document.getElementById("statPromoters").innerText = promoterCount || 0;
}

// --- BROADCAST HUB LOGIC ---
function openBroadcastModal() {
    document.getElementById("broadcastModal").classList.remove("hidden");
}

function closeBroadcastModal() {
    document.getElementById("broadcastModal").classList.add("hidden");
}

async function sendBroadcast() {
    const msg = document.getElementById("broadcastMsg").value.trim();
    const btn = document.getElementById("sendBtn");

    if(!msg) {
        alert("Please type a message before blasting!");
        return;
    }

    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i> BLASTING...`;

    try {
        const { error } = await supabase.from('announcements').insert([{
            content: msg,
            created_by: 'Admin',
            type: 'global'
        }]);

        if(error) throw error;

        alert("🚀 SUCCESS: Message broadcasted to all promoters!");
        document.getElementById("broadcastMsg").value = "";
        closeBroadcastModal();
    } catch (err) {
        console.error(err);
        alert("Broadcast Error: " + err.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<i class="fas fa-paper-plane mr-2"></i> BLAST MESSAGE`;
    }
}