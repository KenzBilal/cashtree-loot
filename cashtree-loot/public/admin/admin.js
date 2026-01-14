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
};

// 3. DATA LOADING
async function loadData() {
    // Fetch leads and match our simple columns
    const { data: leads, error: e1 } = await supabaseClient
        .from('leads')
        .select('*')
        .eq('status', 'pending');

    document.getElementById("leadsList").innerHTML = (leads || []).map(l => {
        // Since we are storing the app name in campaign_id directly
        const appName = l.campaign_id || "Unknown App";
        const upi = l.upi_id;
        const phone = l.phone;
        const promoter = l.user_id; // This is the 'ref' code

        return `
            <div class="card" style="border-left: 5px solid #00ff88; margin-bottom: 10px; padding: 15px; background: #1a1a1a; color: white;">
                <div>
                    <strong>${appName}</strong> | <small>Promoter: ${promoter}</small><br>
                    <small>User Phone: ${phone}</small><br>
                    <div style="margin-top:8px">
                        <code style="background: #333; padding: 4px; border-radius: 4px;">${upi || 'No UPI'}</code>
                    </div>
                </div>
                <div style="margin-top: 10px;">
                    <button class="btn" style="background:#00ff88; color:black; border:none; padding: 5px 10px; cursor:pointer;" onclick="handlePayout('${l.id}', '${upi}')">PAID ✅</button>
                    <button class="btn" style="background:#ff4444; color:white; border:none; padding: 5px 10px; cursor:pointer;" onclick="updateStatus('${l.id}', 'rejected')">REJECT</button>
                </div>
            </div>
        `;
    }).join('') || "No pending leads.";

    // Load Promoters for the Payouts Tab
    const { data: promoters } = await supabaseClient
        .from('promoters')
        .select('*')
        .gt('wallet_balance', 0);

    document.getElementById("payoutsList").innerHTML = (promoters || []).map(p => `
        <div class="card" style="border-left: 5px solid #00d4ff; margin-bottom: 10px; padding: 15px; background: #1a1a1a; color: white;">
            <div>
                <strong>${p.full_name}</strong> (@${p.username})<br>
                <code>${p.upi_id}</code>
            </div>
            <div style="text-align:right">
                <h2 style="margin:0; color:#00ff88">₹${p.wallet_balance}</h2>
                <button class="btn" style="background:#00ff88; color:black; border:none; padding: 5px 10px; cursor:pointer;" onclick="clearPromoterWallet('${p.id}', '${p.upi_id}', ${p.wallet_balance}, '${p.full_name}')">MARK PAID 💸</button>
            </div>
        </div>
    `).join('') || "No one to pay yet.";
}

// 4. ACTIONS
window.handlePayout = async function(leadId, upi) {
    // Generate UPI deep link for easy payment on mobile
    window.location.href = `upi://pay?pa=${upi}&cu=INR`;
    
    if(confirm("Confirm: Payment sent? This will mark lead as approved.")) {
        await supabaseClient.from('leads').update({ status: 'approved' }).eq('id', leadId);
        loadData();
    }
};

window.clearPromoterWallet = async function(pId, upi, amt, name) {
    window.location.href = `upi://pay?pa=${upi}&pn=${encodeURIComponent(name)}&am=${amt}&cu=INR`;
    
    if(confirm("Reset promoter wallet to 0?")) {
        await supabaseClient.from('promoters').update({ wallet_balance: 0 }).eq('id', pId);
        loadData();
    }
};

window.updateStatus = async function(id, stat) {
    await supabaseClient.from('leads').update({ status: stat }).eq('id', id);
    loadData();
};