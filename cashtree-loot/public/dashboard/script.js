/* =========================================
   1. DATABASE CONNECTION (GOD-MODE)
   ========================================= */
const supabaseUrl = 'https://qzjvratinjirrcmgzjlx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6anZyYXRpbmppcnJjbWd6amx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMzAxMDksImV4cCI6MjA4MzgwNjEwOX0.W01Pmbokf20stTgkUsmI3TZahXYK4PPbU0v_2Ziy9YA'; 
const db = supabase.createClient(supabaseUrl, supabaseKey);

/* =========================================
   2. PAGE INITIALIZATION & ROUTING
   ========================================= */
document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("loginBtn");
    const partnerId = localStorage.getItem("p_id");

    if (loginBtn) {
        // --- LOGIN PAGE LOGIC ---
        loginBtn.addEventListener("click", handleLogin);
    } else {
        // --- DASHBOARD PAGE LOGIC ---
        if (!partnerId) {
            window.location.href = "login.html"; 
            return;
        }
        
        // Start the Empire
        initDashboard(partnerId);
        
        // Start the God-Mode Heartbeat (Every 10 seconds)
        applyGodModeLaws();
        setInterval(applyGodModeLaws, 10000);
        // Refresh Broadcast every 60s
        setInterval(checkBroadcast, 60000);
    }
});

/* =========================================
   3. THE GOD-MODE PULSE (REAL-TIME CONTROL)
   ========================================= */
async function applyGodModeLaws() {
    const { data: config, error } = await db.from('system_config').select('*');
    if (error || !config) return;

    const laws = {};
    config.forEach(c => laws[c.key] = c.value);

    const maintenanceOverlay = document.getElementById('maintenanceScreen');
    const mainDashboard = document.querySelector('.dashboard');

    // 🛑 MAINTENANCE ENFORCEMENT
    if (laws.site_status === 'MAINTENANCE') {
        if (maintenanceOverlay) {
            maintenanceOverlay.style.display = 'flex';
            maintenanceOverlay.classList.remove('hidden');
        }
        if (mainDashboard) mainDashboard.style.display = 'none';
        return; 
    } else {
        if (maintenanceOverlay) {
            maintenanceOverlay.style.display = 'none';
            maintenanceOverlay.classList.add('hidden');
        }
        if (mainDashboard) mainDashboard.style.display = 'block';
    }

    // 💰 WITHDRAWAL ENFORCEMENT
    const displayMin = document.getElementById('display_min_payout');
    const btn = document.getElementById('withdrawBtn');
    const balEl = document.getElementById("balanceDisplay");

    if (displayMin && btn && balEl) {
        const minRequired = parseInt(laws.min_payout || 500);
        displayMin.innerText = `₹${minRequired}`;
        const currentBalance = parseFloat(balEl.innerText.replace('₹', '')) || 0;

        if (currentBalance >= minRequired) {
            btn.disabled = false;
            btn.style.opacity = "1";
            btn.style.background = "linear-gradient(180deg, #22c55e, #16a34a)";
            btn.style.cursor = "pointer";
            btn.innerText = "WITHDRAW NOW";
        } else {
            btn.disabled = true;
            btn.style.opacity = "0.5";
            btn.style.cursor = "not-allowed";
            btn.innerText = `NEED ₹${Math.max(0, minRequired - currentBalance)} MORE`;
        }
    }
}

/* =========================================
   4. CORE DASHBOARD LOGIC
   ========================================= */
async function initDashboard(id) {
    const { data: user, error } = await db.from('promoters').select('*').eq('id', id).single();

    if (user) {
        // 1. Basic Stats
        document.getElementById("balanceDisplay").innerText = "₹" + (user.wallet_balance || 0);
        document.getElementById("partnerName").innerText = user.username;
        document.getElementById("userInitial").innerText = user.username.charAt(0).toUpperCase();
        const teamEarnEl = document.getElementById("teamEarnings");
        if (teamEarnEl) teamEarnEl.innerText = "₹" + (user.referral_earnings || 0);

        // 2. Generate Referral Link
        const referInput = document.getElementById("referralLinkInput");
        if (referInput) {
            referInput.value = `${window.location.origin}/promoter/?ref=${user.username}`;
        }

        // 3. Initialize Hubs
        loadOffers(user.username);
        loadPowerIntelligence(id, user.username); 
        checkBroadcast(); 
    } else {
        logout();
    }
}



async function loadPowerIntelligence(myId, myUsername) {
    const intelEl = document.getElementById('teamIntelligence');
    if (!intelEl) return;

    const [subPromotersRes, leadsRes] = await Promise.all([
        db.from('promoters').select('username, created_at').eq('referred_by', myId).order('created_at', { ascending: false }),
        db.from('leads').select('phone, status, campaign_id').eq('user_id', myUsername).order('created_at', { ascending: false })
    ]);

    const subPromoters = subPromotersRes.data || [];
    const leads = leadsRes.data || [];
    
    const countEl = document.getElementById('teamCount');
    if (countEl) countEl.innerText = subPromoters.length;

    let html = "";

    if (subPromoters.length > 0) {
        html += `<div style="background: rgba(59, 130, 246, 0.1); padding: 8px 15px; font-size: 11px; font-weight: bold; color: #60a5fa;">👑 REFERRED PROMOTERS</div>`;
        subPromoters.forEach(p => {
            html += `<div style="padding: 10px 15px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between;">
                <span style="color: white; font-weight: bold;">${p.username}</span>
                <span style="color: #22c55e; font-size: 10px; font-weight: 800;">ACTIVE</span>
            </div>`;
        });
    }

    if (leads.length > 0) {
        html += `<div style="background: rgba(234, 179, 8, 0.1); padding: 8px 15px; font-size: 11px; font-weight: bold; color: #fbbf24; margin-top: 5px;">🎯 USER TASK TRACKER</div>`;
        leads.forEach(l => {
            const isDone = l.status === 'approved';
            const maskedPhone = l.phone ? `User (***${l.phone.slice(-4)})` : 'Normal User';
            html += `
            <div style="padding: 12px 15px; border-bottom: 1px solid rgba(255,255,255,0.05);">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: white; font-size: 13px;">📱 ${maskedPhone}</span>
                    <span style="color: ${isDone ? '#22c55e' : '#f87171'}; font-size: 9px; font-weight: 900;">${l.status.toUpperCase()}</span>
                </div>
                <div style="font-size: 11px; font-weight: bold; margin-top: 5px;">
                    ${isDone ? '✅ Goal Reached!' : '<span style="color:#f87171; animation: pulse 2s infinite;">⚠️ Half-way: Tell user to finish!</span>'}
                </div>
            </div>`;
        });
    }

    intelEl.innerHTML = html || `<div style="padding: 30px; text-align: center; color: #475569;">No network activity detected.</div>`;
}

/* =========================================
   5. AUTH & BROADCAST HUB
   ========================================= */
async function handleLogin() {
    const codeInput = document.getElementById("code").value.trim().toUpperCase();
    const passInput = document.getElementById("pass").value.trim();
    const loginBtn = document.getElementById("loginBtn");

    if (!codeInput || !passInput) return showToast("⚠️ Enter credentials");

    loginBtn.innerHTML = "Verifying...";
    loginBtn.disabled = true;

    const { data, error } = await db.from('promoters').select('*').eq('username', codeInput).eq('password', passInput).single();

    if (error || !data) {
        showToast("❌ Invalid Credentials");
        loginBtn.innerHTML = "Unlock Dashboard";
        loginBtn.disabled = false;
    } else {
        localStorage.setItem("p_id", data.id);
        localStorage.setItem("p_code", data.username);
        loginBtn.innerHTML = "✅ Success!";
        setTimeout(() => window.location.href = "index.html", 1000);
    }
}

async function checkBroadcast() {
    const { data } = await db.from('system_config').select('broadcast_message').eq('key', 'site_status').single();
    const container = document.getElementById('broadcastContainer');
    const textEl = document.getElementById('broadcastText');

    if (container && textEl && data && data.broadcast_message && data.broadcast_message.toUpperCase() !== "OFF") {
        textEl.innerText = data.broadcast_message;
        container.classList.remove('hidden');
        container.style.display = 'block';
    } else if (container) {
        container.classList.add('hidden');
        container.style.display = 'none';
    }
}

/* =========================================
   6. UTILS & HELPERS
   ========================================= */
async function updatePassword() {
    const newPass = document.getElementById("newPass").value.trim();
    const promoterId = localStorage.getItem("p_id");

    if (!promoterId) return logout();
    if (newPass.length < 6) return alert("⚠️ Access key must be 6+ chars.");

    const { error } = await db.from('promoters').update({ password: newPass }).eq('id', promoterId);

    if (error) { alert("❌ Update failed."); } 
    else { alert("✅ Access Key Updated!"); document.getElementById("newPass").value = ""; }
}

async function handlePasswordReset() {
    const username = document.getElementById("resetUsername").value.trim();
    if (!username) return alert("Enter username.");
    const { data, error } = await db.from('promoters').select('username').eq('username', username).single();
    if (error || !data) return alert("User not found.");

    const adminWhatsApp = "919778430867"; 
    const message = `RECOVERY: I forgot my access key. Username: ${username}`;
    window.location.href = `https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(message)}`;
}

function copyShareMessage() {
    const partnerName = document.getElementById("partnerName").innerText;
    const referLink = document.getElementById("referralLinkInput").value;
    const viralMessage = `🔥 *CASHTREE LOOT LIVE* 🔥\n\nEarn ₹1000 daily. Verified by: ${partnerName}\n\n👇 *Join Now:*\n${referLink}`;
    navigator.clipboard.writeText(viralMessage).then(() => alert("✅ Viral Ad Copied!"));
}

async function loadOffers(partnerCode) {
    const container = document.getElementById("offersContainer");
    if (!container) return;
    const { data: offers } = await db.from('campaigns').select('*').eq('is_active', true);
    if (!offers || offers.length === 0) {
        container.innerHTML = "<p>No active offers.</p>";
        return;
    }
   container.innerHTML = offers.map(offer => {
    const folder = (offer.title || "offer").toLowerCase().replace(/\s+/g, '');
    const link = `${window.location.origin}/${folder}/?ref=${partnerCode}`;
    
    return `
        <div class="offer-card">
            <div class="offer-info">
                <h4>${offer.title}</h4>
                <div class="payout-tag">
                     EARN ₹${offer.payout_amount ?? 0}
                </div>


            </div>
            <button class="copy-btn" onclick="copyLink('${link}')">
                <i class="fas fa-link mr-1"></i> COPY
            </button>
        </div>
    `;
}).join('');

}

function copyLink(text) { navigator.clipboard.writeText(text).then(() => showToast("Copied!")); }

function showToast(msg) {
    const t = document.getElementById("toast");
    if (!t) return; // Guard clause in case the element isn't found

    t.innerText = msg;
    t.classList.add("show"); // Uses the CSS animation we built

    // Remove the 'show' class after 3 seconds to slide it back down
    setTimeout(() => {
        t.classList.remove("show");
    }, 3000);
}

function logout() { localStorage.clear(); window.location.href = "login.html"; }
function copyReferralLink() { const el = document.getElementById('referralLinkInput'); navigator.clipboard.writeText(el.value).then(() => showToast("Invite Link Copied!")); }
function openResetModal() { document.getElementById('resetModal').style.display = 'flex'; }
function closeResetModal() { document.getElementById('resetModal').style.display = 'none'; }

/* =========================================
   7. WITHDRAWAL PROTOCOL
   ========================================= */
async function handleWithdraw() {
    const btn = document.getElementById("withdrawBtn");
    const balEl = document.getElementById("balanceDisplay");
    const nameEl = document.getElementById("partnerName");
    
    // 1. Get Values
    const currentBalance = parseFloat(balEl.innerText.replace('₹', '')) || 0;
    const username = nameEl.innerText;
    
    // 2. Safety Check (Double Verification)
    if (btn.disabled || currentBalance < 500) { // Hardcoded 500 safety or read from laws
        return showToast("❌ Requirement not met.");
    }

    // 3. Lock Button
    btn.innerHTML = "<i class='fas fa-circle-notch fa-spin'></i> PROCESSING...";
    btn.disabled = true;

    // 4. Fetch Support Number & Execute
    try {
        const { data } = await db.from('system_config').select('value').eq('key', 'support_number').single();
        const adminNumber = data?.value || "919778430867"; // Fallback to your number

        const message = `💰 *PAYOUT REQUEST* 💰\n\nUser: ${username}\nBalance: ₹${currentBalance}\n\nPlease credit my registered UPI ID.`;
        
        // 5. Open WhatsApp
        setTimeout(() => {
            window.location.href = `https://wa.me/${adminNumber}?text=${encodeURIComponent(message)}`;
            
            // Reset Button after redirect
            setTimeout(() => {
                btn.innerHTML = "WITHDRAW NOW";
                btn.disabled = false;
            }, 2000);
        }, 1000);

    } catch (err) {
        console.error(err);
        showToast("❌ Connection Error");
        btn.innerHTML = "RETRY";
        btn.disabled = false;
    }
}