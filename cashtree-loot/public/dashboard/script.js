/* =========================================
   1. SYSTEM CONFIGURATION & CONNECTION
   ========================================= */
const supabaseUrl = 'https://qzjvratinjirrcmgzjlx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6anZyYXRpbmppcnJjbWd6amx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMzAxMDksImV4cCI6MjA4MzgwNjEwOX0.W01Pmbokf20stTgkUsmI3TZahXYK4PPbU0v_2Ziy9YA'; 
const db = supabase.createClient(supabaseUrl, supabaseKey);

/* =========================================
   2. UI ENGINE (Glassmorphism System)
   ========================================= */
const ui = {
    // A. TOAST NOTIFICATION
    toast: (msg, type = 'neutral') => {
        const container = document.getElementById('toast-container');
        if(!container) return alert(msg); // Fallback for login page if container missing

        const box = document.createElement('div');
        const colors = {
            success: 'border-green-500 bg-green-500/20 text-green-400',
            error: 'border-red-500 bg-red-500/20 text-red-400',
            neutral: 'border-blue-500 bg-blue-500/20 text-blue-400'
        };

        // Icon Logic
        let icon = 'fa-info-circle';
        if(type === 'success') icon = 'fa-check-circle';
        if(type === 'error') icon = 'fa-exclamation-triangle';

        box.className = `pointer-events-auto px-6 py-3 rounded-xl border-l-4 backdrop-blur-md shadow-lg translate-x-10 opacity-0 transition-all duration-300 font-bold text-xs ${colors[type] || colors.neutral}`;
        box.innerHTML = `<i class="fas ${icon} mr-2"></i>${msg}`;

        container.appendChild(box);
        setTimeout(() => box.classList.remove('translate-x-10', 'opacity-0'), 10);
        setTimeout(() => {
            box.classList.add('translate-x-10', 'opacity-0');
            setTimeout(() => box.remove(), 300);
        }, 3000);
    },

    // B. CONFIRMATION MODAL
    confirm: (title, msg, type = 'neutral') => {
        return new Promise((resolve) => {
            ui._showModal(title, msg, type, [
                { text: 'CANCEL', class: 'bg-white/5 text-slate-500 hover:text-white', click: () => resolve(false) },
                { text: 'CONFIRM', class: 'bg-white text-black hover:bg-slate-200 shadow-lg', click: () => resolve(true) }
            ]);
        });
    },

    // INTERNAL HELPER
    _showModal: (title, msg, type, buttons) => {
        const overlay = document.getElementById('ui-modal-overlay');
        const box = document.getElementById('ui-modal-box');
        
        // Fallback for pages without the modal HTML
        if(!overlay) return confirm(msg) ? buttons[1].click() : buttons[0].click(); 

        document.getElementById('ui-title').innerText = title;
        document.getElementById('ui-msg').innerText = msg;
        document.getElementById('ui-icon').innerText = type === 'error' ? '⚠️' : (type === 'success' ? '🚀' : '✨');
        
        const actions = document.getElementById('ui-actions');
        actions.innerHTML = '';
        
        buttons.forEach(btn => {
            const b = document.createElement('button');
            b.className = `py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${btn.class}`;
            b.innerText = btn.text;
            b.onclick = () => { ui._closeModal(); btn.click(); };
            actions.appendChild(b);
        });

        overlay.classList.remove('hidden');
        setTimeout(() => { overlay.classList.remove('opacity-0'); box.classList.remove('scale-90'); }, 10);
    },

    _closeModal: () => {
        const overlay = document.getElementById('ui-modal-overlay');
        overlay.classList.add('opacity-0');
        setTimeout(() => overlay.classList.add('hidden'), 300);
    }
};

// BRIDGE: Connects old calls to new UI
function showToast(msg) {
    const type = msg.toLowerCase().includes('error') || msg.includes('❌') || msg.includes('⚠️') ? 'error' : 'success';
    ui.toast(msg, type);
}

/* =========================================
   3. ROUTER (Login vs Dashboard)
   ========================================= */
document.addEventListener("DOMContentLoaded", async function() {
    const loginBtn = document.getElementById("loginBtn");
    const p_id = localStorage.getItem("p_id");

    // ROUTE A: LOGIN PAGE
    if (loginBtn) {
        loginBtn.addEventListener("click", handleLogin);
        return;
    }

    // ROUTE B: DASHBOARD
    if (!p_id) {
        window.location.href = "login.html";
        return;
    }

    // Initialize Dashboard
    await loadUserProfile(p_id);
    await applyGodModeLaws();
    
    // Start Realtime Laws (Every 5s)
    setInterval(applyGodModeLaws, 5000);
    setInterval(checkBroadcast, 30000);
});

/* =========================================
   4. LOGIN LOGIC
   ========================================= */
async function handleLogin() {
    // Removed .toUpperCase() to allow Case Sensitive login
    const codeInput = document.getElementById("code").value.trim(); 
    const passInput = document.getElementById("pass").value.trim();
    const loginBtn = document.getElementById("loginBtn");

    if (!codeInput || !passInput) return showToast("⚠️ Enter credentials");

    loginBtn.innerHTML = "Verifying...";
    loginBtn.disabled = true;

    const { data, error } = await db.from('promoters').select('*').eq('username', codeInput).eq('password', passInput).maybeSingle();

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

async function handlePasswordReset() {
    const usernameInput = document.getElementById("resetUsername").value.trim();
    if (!usernameInput) return alert("Enter username.");

    // Smart Search (Case Insensitive)
    const { data, error } = await db
        .from('promoters')
        .select('username')
        .ilike('username', usernameInput) 
        .maybeSingle(); 

    if (error || !data) return alert("User not found.");

    const adminWhatsApp = "919778430867"; 
    const message = `RECOVERY: I forgot my access key. Username: ${data.username}`;
    window.location.href = `https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(message)}`;
}

function openResetModal() {
    const modal = document.getElementById('resetModal');
    if (modal) { modal.classList.remove('hidden'); modal.style.display = 'flex'; }
}
function closeResetModal() {
    const modal = document.getElementById('resetModal');
    if (modal) { modal.classList.add('hidden'); modal.style.display = 'none'; }
}

/* =========================================
   5. DASHBOARD CONTROLLER
   ========================================= */
async function loadUserProfile(userId) {
    const { data: user, error } = await db
        .from('promoters')
        .select('*')
        .eq('id', userId)
        .single();

    if (error || !user) return logout();

    // 1. Update Identity Cluster
    document.getElementById("partnerName").innerText = user.username;
    document.getElementById("userInitial").innerText = user.username.charAt(0).toUpperCase();
    document.getElementById("balanceDisplay").innerText = `₹${user.wallet_balance}`;
    
    // 2. Generate Referral Link
    const refLink = `${window.location.origin}/login.html?ref=${user.username}`;
    const refInput = document.getElementById("referralLinkInput");
    if(refInput) refInput.value = refLink;

    // 3. Load Modules
    loadOffers(user.username);
    loadTeamStats(userId, user.username);
    checkBroadcast();
}

async function loadOffers(partnerCode) {
    const container = document.getElementById("offersContainer");
    if (!container) return;

    const { data: offers } = await db.from('campaigns').select('*').eq('is_active', true);

    if (!offers || offers.length === 0) {
        container.innerHTML = "<p style='text-align:center; opacity:0.5; font-size:12px;'>No active missions.</p>";
        return;
    }

    container.innerHTML = offers.map(offer => {
        // Smart Link Logic
        let dbUrl = offer.target_url || "#";
        let fullUrl = dbUrl.startsWith('http') ? dbUrl : `${window.location.origin}/${dbUrl.startsWith('/') ? dbUrl.substring(1) : dbUrl}`;
        const separator = fullUrl.includes('?') ? '&' : '?';
        const finalLink = `${fullUrl}${separator}ref=${partnerCode}`;
        
        return `
            <div class="offer-card">
                <div class="offer-info">
                    <h4>${offer.title}</h4>
                    <div class="payout-tag">EARN ₹${offer.payout_amount ?? 0}</div>
                </div>
                <button class="copy-btn" onclick="copyLink('${finalLink}')">
                    <i class="fas fa-link mr-1"></i> COPY
                </button>
            </div>
        `;
    }).join('');
}

/* =========================================
   6. INTELLIGENCE HUB (TEAM STATS)
   ========================================= */
async function loadTeamStats(userId, username) {
    // 1. Team Count
    const { count } = await db.from('promoters').select('*', { count: 'exact', head: true }).eq('referred_by', userId);
    const countEl = document.getElementById("teamCount");
    if(countEl) countEl.innerText = count || 0;

    // 2. Earnings
    const { data: userData } = await db.from('promoters').select('referral_earnings').eq('id', userId).single();
    const earnEl = document.getElementById("teamEarnings");
    if(earnEl) earnEl.innerText = `₹${userData?.referral_earnings || 0}`;
    
    // 3. Network Scanner (Recent Activity)
    const container = document.getElementById("teamIntelligence");
    if(container) {
        // Fetch last 3 recruits
        const { data: recruits } = await db.from('promoters').select('username, created_at').eq('referred_by', userId).order('created_at', {ascending:false}).limit(3);
        // Fetch last 3 leads
        const { data: leads } = await db.from('leads').select('phone, status').eq('user_id', userId).order('created_at', {ascending:false}).limit(3);

        let html = "";

        if (recruits && recruits.length > 0) {
            html += `<div style="padding:10px 15px; color:#60a5fa; font-size:10px; font-weight:800; background:rgba(59,130,246,0.1);">🔥 RECENT RECRUITS</div>`;
            recruits.forEach(r => {
                html += `<div style="padding:8px 15px; border-bottom:1px solid #1e293b; display:flex; justify-content:space-between; font-size:11px;">
                            <span style="color:white;">${r.username}</span>
                            <span style="color:#64748b;">Joined</span>
                         </div>`;
            });
        }

        if (leads && leads.length > 0) {
            html += `<div style="padding:10px 15px; color:#fbbf24; font-size:10px; font-weight:800; background:rgba(234,179,8,0.1); margin-top:5px;">🎯 RECENT TASKS</div>`;
            leads.forEach(l => {
                const statusColor = l.status === 'approved' ? '#22c55e' : (l.status === 'rejected' ? '#ef4444' : '#fbbf24');
                html += `<div style="padding:8px 15px; border-bottom:1px solid #1e293b; display:flex; justify-content:space-between; font-size:11px;">
                            <span style="color:white;">User (...${l.phone.slice(-4)})</span>
                            <span style="color:${statusColor}; font-weight:bold;">${l.status.toUpperCase()}</span>
                         </div>`;
            });
        }

        if (html === "") {
             container.innerHTML = `<div style="padding:30px; text-align:center; color:#475569; font-size:11px;">No network activity yet. Start promoting!</div>`;
        } else {
            container.innerHTML = html;
        }
    }
}

/* =========================================
   7. WITHDRAWAL SYSTEM (SIGNAL PROTOCOL)
   ========================================= */
async function handleWithdraw() {
    const btn = document.getElementById("withdrawBtn");
    const balEl = document.getElementById("balanceDisplay");
    const minPayoutEl = document.getElementById("display_min_payout");
    const partnerId = localStorage.getItem("p_id");

    // 1. GET VALUES
    const currentBalance = parseFloat(balEl.innerText.replace('₹', '')) || 0;
    const minText = minPayoutEl ? minPayoutEl.innerText.replace('₹', '').trim() : "100";
    const minRequired = parseInt(minText) || 100;
    
    // 2. VALIDATION
    if (!partnerId) return logout();
    
    if (btn.disabled || currentBalance < minRequired) { 
        return ui.toast(`❌ Minimum withdrawal is ₹${minRequired}`, "error");
    }

    // 3. LOCK UI
    btn.innerHTML = "<i class='fas fa-circle-notch fa-spin'></i> REQUESTING...";
    btn.disabled = true;

    try {
        // 4. SEND SIGNAL TO ADMIN
        const { error } = await db
            .from('promoters')
            .update({ withdrawal_requested: true })
            .eq('id', partnerId);

        if (error) throw error;

        // 5. SUCCESS
        ui.toast("✅ Request Sent! Admin notified.", "success");
        btn.innerHTML = "✅ SENT";
        
        // Keep disabled to prevent spamming
        setTimeout(() => {
            btn.innerHTML = "REQUEST PENDING";
        }, 2000);

    } catch (err) {
        console.error(err);
        ui.toast("❌ Request Failed", "error");
        btn.innerHTML = "RETRY";
        btn.disabled = false;
    }
}

/* =========================================
   8. UTILITIES (VIRAL, SECURITY, LAWS)
   ========================================= */
function copyLink(text) {
    navigator.clipboard.writeText(text).then(() => ui.toast("Link Copied!", "success"));
}

function copyReferralLink() {
    const input = document.getElementById("referralLinkInput");
    input.select();
    input.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(input.value).then(() => ui.toast("Invite Link Copied!", "success"));
}

function copyShareMessage() {
    const partnerName = document.getElementById("partnerName").innerText;
    const referLink = document.getElementById("referralLinkInput").value;
    const viralMessage = `🔥 *PART TIME INCOME* 🔥\n\nEarn ₹500-₹2000 daily with your phone!\nVerified by: ${partnerName}\n\n✅ Instant Payouts\n✅ No Investment\n\n👇 *REGISTER FREE:*\n${referLink}`;
    
    navigator.clipboard.writeText(viralMessage).then(() => ui.toast("Viral Ad Copied!", "success"));
}

async function updatePassword() {
    const newPass = document.getElementById("newPass").value.trim();
    const partnerId = localStorage.getItem("p_id");

    if (newPass.length < 6) return ui.toast("⚠️ Key must be 6+ characters", "error");

    const { error } = await db.from('promoters').update({ password: newPass }).eq('id', partnerId);
    if (error) {
        ui.toast("❌ Update Failed", "error");
    } else {
        ui.toast("✅ Access Key Updated!", "success");
        document.getElementById("newPass").value = "";
    }
}

async function logout() {
    const confirmed = await ui.confirm("SIGN OUT?", "You will need to enter your access key again.", "neutral");
    if (confirmed) {
        localStorage.clear();
        window.location.href = "login.html";
    }
}

async function applyGodModeLaws() {
    const { data: config } = await db.from('system_config').select('*');
    if (!config) return;

    const laws = {};
    config.forEach(c => laws[c.key] = c.value);

    // Maintenance Check
    const overlay = document.getElementById('maintenanceScreen');
    if (laws.site_status === 'MAINTENANCE') {
        if(overlay) overlay.classList.remove('hidden');
    } else {
        if(overlay) overlay.classList.add('hidden');
    }

    // Withdrawal Limit Sync
    const displayMin = document.getElementById('display_min_payout');
    const withdrawBtn = document.getElementById('withdrawBtn');
    const balEl = document.getElementById("balanceDisplay");

    if (displayMin && withdrawBtn && balEl) {
        const minRequired = parseInt(laws.min_payout || 100);
        displayMin.innerText = `₹${minRequired}`;
        
        const currentBalance = parseFloat(balEl.innerText.replace('₹', '')) || 0;
        
        // Only update styling if user hasn't already clicked it (button not disabled by JS)
        if (withdrawBtn.innerText !== "REQUEST PENDING" && withdrawBtn.innerText !== "✅ SENT") {
            if (currentBalance >= minRequired) {
                withdrawBtn.disabled = false;
                withdrawBtn.style.opacity = "1";
                withdrawBtn.style.cursor = "pointer";
                withdrawBtn.innerText = "WITHDRAW NOW";
                withdrawBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            } else {
                withdrawBtn.disabled = true;
                withdrawBtn.style.opacity = "0.5";
                withdrawBtn.style.cursor = "not-allowed";
                withdrawBtn.innerText = "LOCKED";
            }
        }
    }
}

async function checkBroadcast() {
    const { data } = await db.from('system_config').select('broadcast_message').eq('key', 'site_status').single();
    const container = document.getElementById('broadcastContainer');
    const textEl = document.getElementById('broadcastText');

    if (container && textEl && data?.broadcast_message && data.broadcast_message !== "OFF") {
        textEl.innerText = data.broadcast_message;
        container.classList.remove('hidden');
    } else if (container) {
        container.classList.add('hidden');
    }
}