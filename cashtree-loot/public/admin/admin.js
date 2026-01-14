// admin.js
const supabaseUrl = 'https://qzjvratinjirrcmgzjlx.supabase.co';
const supabaseKey = 'sb_publishable_AB7iUKxOU50vnoqllSfAnQ_Wdji8gEc';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey); // Renamed to supabaseClient to avoid conflict

const MASTER_KEY = "znek7906";

// 1. LOGIN LOGIC
document.getElementById("loginBtn").addEventListener("click", () => {
    const pass = document.getElementById("adminPass").value;
    if(pass === MASTER_KEY) {
        document.getElementById("authLayer").style.display = "none";
        document.getElementById("adminPanel").style.display = "block";
        loadData();
    } else {
        alert("Incorrect Password!");
    }
});

// 2. TAB SWITCHING
window.switchTab = function(type) {
    document.getElementById("leadsSection").style.display = type === 'leads' ? 'block' : 'none';
    document.getElementById("payoutsSection").style.display = type === 'payouts' ? 'block' : 'none';
    document.getElementById("tabLeads").className = type === 'leads' ? 'tab active' : 'tab';
    document.getElementById("tabPayouts").className = type === 'payouts' ? 'tab active' : 'tab';
};

// 3. DATA LOADING
async function loadData() {
    const { data: leads, error: e1 } = await supabaseClient
        .from('leads')
        .select('*, promoters(full_name, upi_id), campaigns(app_name, promoter_payout, user_payout)')
        .eq('status', 'pending');

    document.getElementById("leadsList").innerHTML = (leads || []).map(l => {
        const isPromoter = l.promoter_id !== null;
        const amt = isPromoter ? l.campaigns.promoter_payout : l.campaigns.user_payout;
        const upi = isPromoter ? l.promoters?.upi_id : l.lead_upi;
        const source = isPromoter ? `PROMOTER: ${l.promoters?.full_name}` : `DIRECT USER`;

        return `
            <div class="card">
                <div>
                    <strong>${l.campaigns.app_name}</strong> | ${source}<br>
                    <small>User: ${l.lead_phone}</small><br>
                    <div style="margin-top:8px">
                        <span style="color:#00ff88">₹${amt}</span> | <code>${upi || 'No UPI'}</code>
                    </div>
                </div>
                <div>
                    <button class="btn" style="background:#00ff88; color:black;" onclick="handlePayout('${l.id}', '${l.promoter_id}', ${amt}, '${upi}')">PAID ✅</button>
                    <button class="btn" style="background:#ff4444; color:white;" onclick="updateStatus('${l.id}', 'rejected')">REJECT</button>
                </div>
            </div>
        `;
    }).join('') || "No pending leads.";

    const { data: promoters } = await supabaseClient
        .from('promoters')
        .select('*')
        .gt('wallet_balance', 99);

    document.getElementById("payoutsList").innerHTML = (promoters || []).map(p => `
        <div class="card">
            <div>
                <strong>${p.full_name}</strong><br>
                <code>${p.upi_id}</code>
            </div>
            <div style="text-align:right">
                <h2 style="margin:0; color:#00ff88">₹${p.wallet_balance}</h2>
                <button class="btn" style="background:#00ff88; color:black;" onclick="clearPromoterWallet('${p.id}', '${p.upi_id}', ${p.wallet_balance}, '${p.full_name}')">MARK PAID 💸</button>
            </div>
        </div>
    `).join('') || "No one to pay yet.";
}

// 4. ACTIONS
window.handlePayout = async function(leadId, promoterId, amount, upi) {
    window.location.href = `upi://pay?pa=${upi}&am=${amount}&cu=INR`;
    if(confirm("Confirm: Payment sent?")) {
        await supabaseClient.from('leads').update({ status: 'approved' }).eq('id', leadId);
        if (promoterId && promoterId !== "null") {
            await supabaseClient.rpc('increment_wallet', { row_id: promoterId, amount: amount });
        }
        loadData();
    }
};

window.clearPromoterWallet = async function(pId, upi, amt, name) {
    window.location.href = `upi://pay?pa=${upi}&pn=${encodeURIComponent(name)}&am=${amt}&cu=INR`;
    if(confirm("Reset wallet to 0?")) {
        await supabaseClient.rpc('process_payout', { p_id: pId });
        loadData();
    }
};

window.updateStatus = async function(id, stat) {
    await supabaseClient.from('leads').update({ status: stat }).eq('id', id);
    loadData();
};
