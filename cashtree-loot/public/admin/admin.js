const supabaseUrl = 'https://qzjvratinjirrcmgzjlx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6anZyYXRpbmppcnJjbWd6amx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMzAxMDksImV4cCI6MjA4MzgwNjEwOX0.W01Pmbokf20stTgkUsmI3TZahXYK4PPbU0v_2Ziy9YA'; 
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

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
    loadData();
};

// 3. DATA LOADING
async function loadData() {
    // 1. Fetch Campaigns to map UUID -> Title
    const { data: campaignList } = await supabaseClient.from('campaigns').select('id, title');
    const campaignMap = {};
    if (campaignList) {
        campaignList.forEach(c => campaignMap[c.id] = c.title);
    }

    // 2. Fetch Promoters to map UUID -> Username
    const { data: promoterList } = await supabaseClient.from('promoters').select('id, username');
    const promoterMap = {};
    if (promoterList) {
        promoterList.forEach(p => promoterMap[p.id] = p.username);
    }

    // 3. Fetch Pending Leads
    const { data: leads, error: e1 } = await supabaseClient
        .from('leads')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

    if (e1) {
        console.error("Error fetching leads:", e1);
        return;
    }

    document.getElementById("leadsList").innerHTML = (leads || []).map(l => {
        // Use our maps to get the readable names
        const appName = campaignMap[l.campaign_id] || "Unknown Offer";
        const promoterUsername = promoterMap[l.user_id] || "DIRECT/UNKNOWN";
        const upi = l.upi_id;
        const phone = l.phone;

        return `
            <div class="card" style="border-left: 5px solid #00ff88; margin-bottom: 12px; padding: 15px; background: #1a1a1a; color: white; border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <strong style="font-size: 1.1em; color: #00ff88;">${appName}</strong><br>
                        <small style="color: #aaa;">Promoter: <b>@${promoterUsername}</b></small><br>
                        <span style="display: block; margin-top: 5px;">📞 ${phone}</span>
                        <code style="display: inline-block; background: #333; padding: 3px 8px; border-radius: 4px; margin-top: 8px; font-size: 0.9em;">${upi || 'No UPI'}</code>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <button class="btn" style="background:#00ff88; color:black; font-weight:bold; border:none; padding: 8px 15px; border-radius: 4px; cursor:pointer;" onclick="handlePayout('${l.id}', '${upi}')">PAID ✅</button>
                        <button class="btn" style="background:#ff4444; color:white; border:none; padding: 8px 15px; border-radius: 4px; cursor:pointer;" onclick="updateStatus('${l.id}', 'rejected')">REJECT</button>
                    </div>
                </div>
            </div>
        `;
    }).join('') || "<p style='text-align:center; color:#888;'>No pending leads found.</p>";

    // 4. Fetch Promoters with Balance
    const { data: promoters } = await supabaseClient
        .from('promoters')
        .select('*')
        .gt('wallet_balance', 0);

    document.getElementById("payoutsList").innerHTML = (promoters || []).map(p => `
        <div class="card" style="border-left: 5px solid #00d4ff; margin-bottom: 12px; padding: 15px; background: #1a1a1a; color: white; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>${p.full_name}</strong> (@${p.username})<br>
                    <code style="color: #00d4ff;">${p.upi_id}</code>
                </div>
                <div style="text-align:right">
                    <h2 style="margin:0; color:#00ff88">₹${p.wallet_balance}</h2>
                    <button class="btn" style="background:#00d4ff; color:black; font-weight:bold; border:none; padding: 8px 15px; border-radius: 4px; margin-top: 5px; cursor:pointer;" onclick="clearPromoterWallet('${p.id}', '${p.upi_id}', ${p.wallet_balance}, '${p.full_name}')">MARK PAID 💸</button>
                </div>
            </div>
        </div>
    `).join('') || "<p style='text-align:center; color:#888;'>No promoters waiting for payment.</p>";
}

// 4. ACTIONS
window.handlePayout = async function(leadId, upi) {
    if (!upi || upi === 'undefined') {
        alert("Cannot pay: No UPI ID found for this lead.");
        return;
    }
    // Deep link for mobile payment
    window.location.href = `upi://pay?pa=${upi}&cu=INR`;
    
    setTimeout(async () => {
        if(confirm("Confirm: Payment sent? This will mark lead as approved.")) {
            await supabaseClient.from('leads').update({ status: 'approved' }).eq('id', leadId);
            loadData();
        }
    }, 500);
};

window.clearPromoterWallet = async function(pId, upi, amt, name) {
    window.location.href = `upi://pay?pa=${upi}&pn=${encodeURIComponent(name)}&am=${amt}&cu=INR`;
    
    setTimeout(async () => {
        if(confirm(`Paid ₹${amt} to ${name}? Resetting wallet to 0.`)) {
            await supabaseClient.from('promoters').update({ wallet_balance: 0 }).eq('id', pId);
            loadData();
        }
    }, 500);
};

window.updateStatus = async function(id, stat) {
    if(confirm(`Are you sure you want to ${stat} this lead?`)) {
        await supabaseClient.from('leads').update({ status: stat }).eq('id', id);
        loadData();
    }
};