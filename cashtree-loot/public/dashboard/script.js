/* =========================================
   1. SYSTEM CONFIGURATION & CONNECTION
   ========================================= */
const supabaseUrl = 'https://qzjvratinjirrcmgzjlx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6anZyYXRpbmppcnJjbWd6amx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMzAxMDksImV4cCI6MjA4MzgwNjEwOX0.W01Pmbokf20stTgkUsmI3TZahXYK4PPbU0v_2Ziy9YA'; 
const db = supabase.createClient(supabaseUrl, supabaseKey);

/* =========================================
   2. UI ENGINE (10/10 THEME MATCH)
   ========================================= */
const ui = {
    // 🔔 TOAST NOTIFICATIONS (Glass Pills)
    toast: (msg, type = 'neutral') => {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = "position: fixed; top: 20px; right: 20px; z-index: 99999; display: flex; flex-direction: column; gap: 10px;";
            document.body.appendChild(container);
        }

        const box = document.createElement('div');
        
        // Theme Colors based on Type
        const colors = {
            success: 'border-left: 4px solid #22c55e; color: #fff;',
            error:   'border-left: 4px solid #ef4444; color: #fff;',
            neutral: 'border-left: 4px solid #3b82f6; color: #fff;'
        };

        const icons = {
            success: '<i class="fas fa-check-circle" style="color:#22c55e"></i>',
            error:   '<i class="fas fa-exclamation-triangle" style="color:#ef4444"></i>',
            neutral: '<i class="fas fa-info-circle" style="color:#3b82f6"></i>'
        };

        // 10/10 Glass Style
        box.style.cssText = `
            background: rgba(15, 23, 42, 0.95);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255,255,255,0.1);
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            gap: 12px;
            min-width: 280px;
            transform: translateX(50px);
            opacity: 0;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            font-family: 'Inter', sans-serif;
            font-size: 13px;
            font-weight: 600;
            ${colors[type] || colors.neutral}
        `;

        box.innerHTML = `${icons[type] || icons.neutral} <span>${msg}</span>`;

        container.appendChild(box);

        // Animation In
        setTimeout(() => {
            box.style.transform = 'translateX(0)';
            box.style.opacity = '1';
        }, 10);

        // Animation Out
        setTimeout(() => {
            box.style.transform = 'translateX(50px)';
            box.style.opacity = '0';
            setTimeout(() => box.remove(), 400);
        }, 4000);
    },

    // 🛑 CONFIRMATION MODAL (Command Center Style)
    confirm: (title, msg, type = 'neutral') => {
        return new Promise((resolve) => {
            // Create Overlay
            const overlay = document.createElement('div');
            overlay.id = 'custom-modal-overlay';
            overlay.style.cssText = `
                position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(5px);
                z-index: 10000; display: flex; align-items: center; justify-content: center;
                opacity: 0; transition: opacity 0.3s;
            `;

            // Icon Selection
            const icon = type === 'error' ? '⚠️' : (type === 'success' ? '🚀' : '✨');
            
            // Create Box
            const box = document.createElement('div');
            box.style.cssText = `
                background: #0f172a; border: 1px solid rgba(255,255,255,0.1);
                padding: 30px; border-radius: 20px; width: 90%; max-width: 350px;
                text-align: center; transform: scale(0.9); transition: transform 0.3s;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            `;

            box.innerHTML = `
                <div style="font-size: 40px; margin-bottom: 15px;">${icon}</div>
                <h3 style="color:white; margin:0 0 10px 0; font-size: 18px; font-weight:800; text-transform: uppercase;">${title}</h3>
                <p style="color:#94a3b8; font-size:13px; margin:0 0 25px 0; line-height:1.5;">${msg}</p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <button id="modal-cancel" style="padding: 12px; background: rgba(255,255,255,0.05); color: #94a3b8; border: none; border-radius: 10px; font-weight: bold; cursor: pointer;">CANCEL</button>
                    <button id="modal-confirm" style="padding: 12px; background: #22c55e; color: #022c22; border: none; border-radius: 10px; font-weight: 800; cursor: pointer;">CONFIRM</button>
                </div>
            `;

            overlay.appendChild(box);
            document.body.appendChild(overlay);

            // Animate In
            setTimeout(() => { overlay.style.opacity = '1'; box.style.transform = 'scale(1)'; }, 10);

            // Handlers
            document.getElementById('modal-cancel').onclick = () => {
                overlay.style.opacity = '0';
                setTimeout(() => overlay.remove(), 300);
                resolve(false);
            };

            document.getElementById('modal-confirm').onclick = () => {
                overlay.style.opacity = '0';
                setTimeout(() => overlay.remove(), 300);
                resolve(true);
            };
        });
    }
};

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

    if (!rawInput || !passInput) return ui.toast("⚠️ Enter credentials", "neutral");

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

        // 🚦 SMART REDIRECT SYSTEM
        setTimeout(() => {
            if (pCode === "ADMIN") {
                window.location.href = "../admin/index.html"; 
            } else {
                window.location.href = "index.html"; 
            }
        }, 1000);

    } catch (err) {
        console.error("Login Failed:", err);
        ui.toast("❌ Invalid Credentials", "error");
        loginBtn.innerHTML = "UNLOCK DASHBOARD";
        loginBtn.disabled = false;
    }
}

/* =========================================
   5. DASHBOARD CONTROLLER (FIXED)
   ========================================= */
async function loadUserProfile(userId) {
    // 1. Fetch Data
    const { data: user, error } = await db
        .from('promoters')
        .select('*, withdrawal_requested') 
        .eq('id', userId)
        .single();

    // 🛑 THE FIX: Do NOT logout immediately. Just warn the user.
    if (error || !user) {
        console.error("Critical Sync Error:", error);
        ui.toast("⚠️ Profile Sync Failed. Please refresh.", "error");
        return; 
    }

    // 2. Render Profile
    document.getElementById("partnerName").innerText = user.username;
    document.getElementById("userInitial").innerText = user.username.charAt(0).toUpperCase();
    document.getElementById("balanceDisplay").innerText = `₹${user.wallet_balance}`;
    
    // 3. Withdrawal Button State
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

    // 4. Referral Link Generator
    const refLink = `${window.location.origin}/promoter/index.html?ref=${user.username}`;
    const refInput = document.getElementById("referralLinkInput");
    if(refInput) refInput.value = refLink;

    // 5. Load Modules
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
    try {
        // 1. Parallel Fetching (Faster & Safer)
        const [countResult, earningsResult, recruitsResult, leadsResult] = await Promise.allSettled([
            db.from('promoters').select('*', { count: 'exact', head: true }).eq('referred_by', userId),
            db.from('promoters').select('referral_earnings').eq('id', userId).single(),
            db.from('promoters').select('username, created_at').eq('referred_by', userId).order('created_at', {ascending:false}).limit(3),
            db.from('leads').select('phone, status').eq('user_id', userId).order('created_at', {ascending:false}).limit(3)
        ]);

        // 2. Process Team Count
        const countEl = document.getElementById("teamCount");
        if (countEl && countResult.status === 'fulfilled') {
            countEl.innerText = countResult.value.count || 0;
        }

        // 3. Process Earnings
        const earnEl = document.getElementById("teamEarnings");
        if (earnEl && earningsResult.status === 'fulfilled' && earningsResult.value.data) {
            earnEl.innerText = `₹${earningsResult.value.data.referral_earnings || 0}`;
        }

        // 4. Process Intelligence Feed (Recruits + Leads)
        const container = document.getElementById("teamIntelligence");
        if (container) {
            let html = "";
            
            // Recruits Section
            const recruits = recruitsResult.status === 'fulfilled' ? recruitsResult.value.data : [];
            if (recruits && recruits.length > 0) {
                html += `<div style="padding:10px 15px; color:#60a5fa; font-size:10px; font-weight:800; background:rgba(59,130,246,0.1);">🔥 RECENT RECRUITS</div>`;
                recruits.forEach(r => {
                    html += `<div style="padding:8px 15px; border-bottom:1px solid #1e293b; display:flex; justify-content:space-between; font-size:11px;">
                        <span style="color:white; font-weight:600;">${r.username}</span>
                        <span style="color:#64748b;">Joined</span>
                    </div>`;
                });
            }

            // Leads Section
            const leads = leadsResult.status === 'fulfilled' ? leadsResult.value.data : [];
            if (leads && leads.length > 0) {
                html += `<div style="padding:10px 15px; color:#fbbf24; font-size:10px; font-weight:800; background:rgba(234,179,8,0.1); margin-top:5px;">🎯 RECENT TASKS</div>`;
                leads.forEach(l => {
                    const statusColor = l.status === 'approved' ? '#22c55e' : (l.status === 'rejected' ? '#ef4444' : '#fbbf24');
                    // Mask phone number for privacy (e.g. ...4321)
                    const maskedPhone = l.phone ? `...${l.phone.slice(-4)}` : 'Unknown';
                    
                    html += `<div style="padding:8px 15px; border-bottom:1px solid #1e293b; display:flex; justify-content:space-between; font-size:11px;">
                        <span style="color:white;">Task (${maskedPhone})</span>
                        <span style="color:${statusColor}; font-weight:bold;">${l.status.toUpperCase()}</span>
                    </div>`;
                });
            }

            // Empty State
            container.innerHTML = html === "" 
                ? `<div style="padding:30px; text-align:center; color:#475569; font-size:11px; font-style:italic;">No network activity yet. Start promoting!</div>` 
                : html;
        }

    } catch (err) {
        console.error("Team Stats Error:", err);
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

// 🟢 SECURE PASSWORD UPDATE
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