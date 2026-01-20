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
    toast: (msg, type = 'neutral') => {
        const container = document.getElementById('toast-container');
        if(!container) return alert(msg);

        const box = document.createElement('div');
        const colors = {
            success: 'border-green-500 bg-green-500/20 text-green-400',
            error: 'border-red-500 bg-red-500/20 text-red-400',
            neutral: 'border-blue-500 bg-blue-500/20 text-blue-400'
        };
        let icon = type === 'success' ? 'fa-check-circle' : (type === 'error' ? 'fa-exclamation-triangle' : 'fa-info-circle');

        box.className = `pointer-events-auto px-6 py-3 rounded-xl border-l-4 backdrop-blur-md shadow-lg translate-x-10 opacity-0 transition-all duration-300 font-bold text-xs ${colors[type] || colors.neutral}`;
        box.innerHTML = `<i class="fas ${icon} mr-2"></i>${msg}`;

        container.appendChild(box);
        setTimeout(() => box.classList.remove('translate-x-10', 'opacity-0'), 10);
        setTimeout(() => {
            box.classList.add('translate-x-10', 'opacity-0');
            setTimeout(() => box.remove(), 300);
        }, 3000);
    },

    confirm: (title, msg, type = 'neutral') => {
        return new Promise((resolve) => {
            ui._showModal(title, msg, type, [
                { text: 'CANCEL', class: 'bg-white/5 text-slate-500 hover:text-white', click: () => resolve(false) },
                { text: 'CONFIRM', class: 'bg-white text-black hover:bg-slate-200 shadow-lg', click: () => resolve(true) }
            ]);
        });
    },

    _showModal: (title, msg, type, buttons) => {
        const overlay = document.getElementById('ui-modal-overlay');
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
        setTimeout(() => { overlay.classList.remove('opacity-0'); document.getElementById('ui-modal-box').classList.remove('scale-90'); }, 10);
    },

    _closeModal: () => {
        const overlay = document.getElementById('ui-modal-overlay');
        overlay.classList.add('opacity-0');
        setTimeout(() => overlay.classList.add('hidden'), 300);
    }
};

function showToast(msg) {
    const type = msg.toLowerCase().includes('error') || msg.includes('❌') || msg.includes('⚠️') ? 'error' : 'success';
    ui.toast(msg, type);
}

/* =========================================
   3. ROUTER & INITIALIZATION
   ========================================= */
document.addEventListener("DOMContentLoaded", async function() {
    // 1. Remove Preloader
    setTimeout(() => {
        const loader = document.getElementById('app-loader');
        if(loader) { loader.style.opacity = '0'; setTimeout(() => loader.remove(), 500); }
    }, 800);

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
    
    // Start Realtime Checks
    setInterval(applyGodModeLaws, 5000);
    setInterval(checkBroadcast, 30000);
});

/* =========================================
   4. SMART LOGIN (10/10 SECURITY)
   ========================================= */
async function handleLogin() {
    const rawInput = document.getElementById("code").value.trim();
    const passInput = document.getElementById("pass").value.trim();
    const loginBtn = document.getElementById("loginBtn");

    if (!rawInput || !passInput) return showToast("⚠️ Enter credentials");

    loginBtn.innerHTML = "<i class='fas fa-circle-notch fa-spin'></i> VERIFYING...";
    loginBtn.disabled = true;

    try {
        let secureEmail;
        let pCode;

        // A. ADMIN LOGIN (Direct Email)
        if (rawInput.includes('@')) {
            secureEmail = rawInput; 
            pCode = "ADMIN"; 
        } 
        // B. PROMOTER LOGIN (Username Code)
        else {
            const username = rawInput.toUpperCase();
            // 🟢 THE INVISIBLE TAG: Adds @cashttree.internal automatically
            secureEmail = `${username}@cashttree.internal`;
            pCode = username;
        }

        // 🟢 AUTHENTICATE WITH SUPABASE
        const { data, error } = await db.auth.signInWithPassword({
            email: secureEmail,
            password: passInput
        });

        if (error) throw error;

        // Success
        localStorage.setItem("p_id", data.user.id);
        localStorage.setItem("p_code", pCode);
        
        loginBtn.innerHTML = "✅ ACCESS GRANTED";
        loginBtn.classList.remove("bg-green-600");
        loginBtn.classList.add("bg-emerald-500");

        // Redirect Admin vs User
        setTimeout(() => {
            // if(pCode === "ADMIN") window.location.href = "admin.html"; // Uncomment if you have an admin file
            window.location.href = "admin/index.html"; 
        }, 1000);

    } catch (err) {
        console.error("Login Failed:", err);
        showToast("❌ Invalid Credentials", "error");
        loginBtn.innerHTML = "UNLOCK DASHBOARD";
        loginBtn.disabled = false;
    }
}

/* =========================================
   5. DASHBOARD CONTROLLER
   ========================================= */
async function loadUserProfile(userId) {
    const { data: user, error } = await db
        .from('promoters')
        .select('*, withdrawal_requested') 
        .eq('id', userId)
        .single();

    if (error || !user) return logout();

    document.getElementById("partnerName").innerText = user.username;
    document.getElementById("userInitial").innerText = user.username.charAt(0).toUpperCase();
    document.getElementById("balanceDisplay").innerText = `₹${user.wallet_balance}`;
    
    // Withdrawal Button State
    const btn = document.getElementById("withdrawBtn");
    if(btn) {
        if(user.withdrawal_requested) {
            btn.innerHTML = "REQUEST PENDING";
            btn.disabled = true;
            btn.setAttribute("data-status", "pending"); 
        } else {
            btn.setAttribute("data-status", "active");
        }
    }

    const refLink = `${window.location.origin}/login.html?ref=${user.username}`;
    const refInput = document.getElementById("referralLinkInput");
    if(refInput) refInput.value = refLink;

    loadOffers(user.username);
    loadTeamStats(userId);
    checkBroadcast();
}

/* =========================================
   6. MODULES (Offers, Stats, Withdraw)
   ========================================= */
async function loadOffers(partnerCode) {
    const container = document.getElementById("offersContainer");
    if (!container) return;

    const { data: offers } = await db.from('campaigns').select('*').eq('is_active', true);
    if (!offers || offers.length === 0) {
        container.innerHTML = "<p style='text-align:center; opacity:0.5; font-size:12px;'>No active missions.</p>";
        return;
    }

    container.innerHTML = offers.map(offer => {
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

async function loadTeamStats(userId) {
    const { count } = await db.from('promoters').select('*', { count: 'exact', head: true }).eq('referred_by', userId);
    const countEl = document.getElementById("teamCount");
    if(countEl) countEl.innerText = count || 0;

    const { data: userData } = await db.from('promoters').select('referral_earnings').eq('id', userId).single();
    const earnEl = document.getElementById("teamEarnings");
    if(earnEl) earnEl.innerText = `₹${userData?.referral_earnings || 0}`;
    
    const container = document.getElementById("teamIntelligence");
    if(container) {
        const { data: recruits } = await db.from('promoters').select('username, created_at').eq('referred_by', userId).order('created_at', {ascending:false}).limit(3);
        const { data: leads } = await db.from('leads').select('phone, status').eq('user_id', userId).order('created_at', {ascending:false}).limit(3);

        let html = "";
        if (recruits && recruits.length > 0) {
            html += `<div style="padding:10px 15px; color:#60a5fa; font-size:10px; font-weight:800; background:rgba(59,130,246,0.1);">🔥 RECENT RECRUITS</div>`;
            recruits.forEach(r => html += `<div style="padding:8px 15px; border-bottom:1px solid #1e293b; display:flex; justify-content:space-between; font-size:11px;"><span style="color:white;">${r.username}</span><span style="color:#64748b;">Joined</span></div>`);
        }
        if (leads && leads.length > 0) {
            html += `<div style="padding:10px 15px; color:#fbbf24; font-size:10px; font-weight:800; background:rgba(234,179,8,0.1); margin-top:5px;">🎯 RECENT TASKS</div>`;
            leads.forEach(l => {
                const statusColor = l.status === 'approved' ? '#22c55e' : (l.status === 'rejected' ? '#ef4444' : '#fbbf24');
                html += `<div style="padding:8px 15px; border-bottom:1px solid #1e293b; display:flex; justify-content:space-between; font-size:11px;"><span style="color:white;">User (...${l.phone.slice(-4)})</span><span style="color:${statusColor}; font-weight:bold;">${l.status.toUpperCase()}</span></div>`;
            });
        }
        container.innerHTML = html === "" ? `<div style="padding:30px; text-align:center; color:#475569; font-size:11px;">No network activity yet. Start promoting!</div>` : html;
    }
}

async function handleWithdraw() {
    const btn = document.getElementById("withdrawBtn");
    const balEl = document.getElementById("balanceDisplay");
    const minPayoutEl = document.getElementById("display_min_payout");
    const partnerId = localStorage.getItem("p_id");

    const currentBalance = parseFloat(balEl.innerText.replace('₹', '')) || 0;
    const minText = minPayoutEl ? minPayoutEl.innerText.replace('₹', '').trim() : "100";
    const minRequired = parseInt(minText) || 100;
    
    if (!partnerId) return logout();
    if (btn.disabled || currentBalance < minRequired) return ui.toast(`❌ Minimum withdrawal is ₹${minRequired}`, "error");

    btn.innerHTML = "<i class='fas fa-circle-notch fa-spin'></i> REQUESTING...";
    btn.disabled = true;

    try {
        const { error } = await db.from('promoters').update({ withdrawal_requested: true }).eq('id', partnerId);
        if (error) throw error;
        ui.toast("✅ Request Sent! Admin notified.", "success");
        btn.innerHTML = "REQUEST PENDING";
        btn.setAttribute("data-status", "pending");
    } catch (err) {
        console.error(err);
        ui.toast("❌ Request Failed", "error");
        btn.innerHTML = "RETRY";
        btn.disabled = false;
    }
}

/* =========================================
   7. UTILS & SYSTEM LAWS
   ========================================= */
function copyLink(text) { navigator.clipboard.writeText(text).then(() => ui.toast("Link Copied!", "success")); }
function copyReferralLink() { const el = document.getElementById("referralLinkInput"); el.select(); navigator.clipboard.writeText(el.value).then(() => ui.toast("Invite Link Copied!", "success")); }
function copyShareMessage() {
    const name = document.getElementById("partnerName").innerText;
    const link = document.getElementById("referralLinkInput").value;
    navigator.clipboard.writeText(`🔥 *PART TIME INCOME* 🔥\nVerified by: ${name}\n👇 *REGISTER FREE:*\n${link}`).then(() => ui.toast("Viral Ad Copied!", "success"));
}
async function logout() {
    const confirmed = await ui.confirm("SIGN OUT?", "You will need to login again.", "neutral");
    if (confirmed) { localStorage.clear(); window.location.href = "login.html"; }
}

// 🟢 NEW: SECURE PASSWORD UPDATE
async function updatePassword() {
    const newPass = document.getElementById("newPass").value.trim();
    if (newPass.length < 6) return ui.toast("⚠️ Key must be 6+ characters", "error");

    // Secure Auth Update
    const { error } = await db.auth.updateUser({ password: newPass });

    if (error) {
        ui.toast("❌ Update Failed: " + error.message, "error");
    } else {
        ui.toast("✅ Access Key Updated!", "success");
        document.getElementById("newPass").value = "";
    }
}

async function applyGodModeLaws() {
    const { data: config } = await db.from('system_config').select('*');
    if (!config) return;

    const laws = {};
    config.forEach(c => laws[c.key] = c.value);

    const overlay = document.getElementById('maintenanceScreen');
    if(overlay) laws.site_status === 'MAINTENANCE' ? overlay.classList.remove('hidden') : overlay.classList.add('hidden');

    const btn = document.getElementById('withdrawBtn');
    const displayMin = document.getElementById('display_min_payout');
    const balEl = document.getElementById("balanceDisplay");

    if (displayMin && btn && balEl) {
        const minRequired = parseInt(laws.min_payout || 100);
        displayMin.innerText = `₹${minRequired}`;
        
        if (btn.getAttribute("data-status") !== "pending") {
            const currentBalance = parseFloat(balEl.innerText.replace('₹', '')) || 0;
            if (currentBalance >= minRequired) {
                btn.disabled = false; btn.innerText = "WITHDRAW NOW"; btn.style.opacity = "1"; btn.style.cursor = "pointer";
            } else {
                btn.disabled = true; btn.innerText = "LOCKED"; btn.style.opacity = "0.5"; btn.style.cursor = "not-allowed";
            }
        }
    }
}
async function checkBroadcast() {
    const { data } = await db.from('system_config').select('broadcast_message').eq('key', 'site_status').single();
    const container = document.getElementById('broadcastContainer');
    const textEl = document.getElementById('broadcastText');
    if (container && textEl && data?.broadcast_message && data.broadcast_message !== "OFF") {
        textEl.innerText = data.broadcast_message; container.classList.remove('hidden');
    } else if (container) container.classList.add('hidden');
}

// Password Reset (Redirects to WhatsApp)
async function handlePasswordReset() {
    const usernameInput = document.getElementById("resetUsername").value.trim();
    if (!usernameInput) return alert("Enter username.");
    const adminWhatsApp = "919778430867"; 
    window.location.href = `https://wa.me/${adminWhatsApp}?text=${encodeURIComponent("RECOVERY: I forgot my access key for " + usernameInput)}`;
}
function openResetModal() { const m = document.getElementById('resetModal'); if(m){ m.classList.remove('hidden'); m.style.display='flex'; }}
function closeResetModal() { const m = document.getElementById('resetModal'); if(m){ m.classList.add('hidden'); m.style.display='none'; }}