/* =========================================
   1. SYSTEM CONFIGURATION & CONNECTION
   ========================================= */
let db;

// 1. Try to link to the existing connection from auth.js (Preferred)
if (window.supabaseClient) {
    db = window.supabaseClient;
    console.log("✅ PROMOTER DASHBOARD: Linked to Auth Core.");
} 
// 2. Fallback: Create a new connection using the secure config
else if (window.env && window.env.SUPABASE_URL) {
    db = window.supabase.createClient(window.env.SUPABASE_URL, window.env.SUPABASE_KEY);
    console.log("✅ PROMOTER DASHBOARD: Initialized via Secure Config.");
} 
// 3. Hard Fail: No keys found
else {
    console.error("❌ CRITICAL: config.js is missing!");
    alert("System Error: Configuration missing. Please refresh.");
}
/* =========================================
   2. UI ENGINE (GLASS THEME 10/10)
   ========================================= */
const ui = {
    // 🔔 TOAST NOTIFICATIONS
    toast: (msg, type = 'neutral') => {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = "position: fixed; top: 20px; right: 20px; z-index: 99999; display: flex; flex-direction: column; gap: 10px;";
            document.body.appendChild(container);
        }

        const box = document.createElement('div');
        
        const colors = {
            success: 'border-l-4 border-green-500 text-green-400 bg-[#064e3b]/90',
            error:   'border-l-4 border-red-500 text-red-400 bg-[#450a0a]/90',
            neutral: 'border-l-4 border-blue-500 text-blue-400 bg-[#1e3a8a]/90'
        };
        const icons = {
            success: '<i class="fas fa-check-circle"></i>',
            error:   '<i class="fas fa-exclamation-triangle"></i>',
            neutral: '<i class="fas fa-info-circle"></i>'
        };

        box.className = `flex items-center gap-3 px-5 py-4 rounded-r-lg shadow-2xl backdrop-blur-md translate-x-10 opacity-0 transition-all duration-300 ${colors[type] || colors.neutral}`;
        box.innerHTML = `${icons[type] || icons.neutral} <span class="font-bold text-xs uppercase tracking-wide text-white">${msg}</span>`;

        container.appendChild(box);

        requestAnimationFrame(() => box.classList.remove('translate-x-10', 'opacity-0'));
        setTimeout(() => {
            box.classList.add('translate-x-10', 'opacity-0');
            setTimeout(() => box.remove(), 400);
        }, 3000);
    },

    // 🛑 CONFIRMATION MODAL
    confirm: (title, msg, type = 'neutral') => {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = "fixed inset-0 bg-black/90 backdrop-blur-sm z-[10000] flex items-center justify-center p-4 transition-opacity duration-300 opacity-0";
            
            const btnColor = type === 'error' ? 'bg-red-600' : 'bg-green-600';
            const icon = type === 'error' ? '⚠️' : '🚀';

            overlay.innerHTML = `
                <div class="bg-[#0f172a] border border-white/10 p-8 rounded-2xl max-w-sm w-full text-center shadow-2xl transform scale-90 transition-transform duration-300">
                    <div class="text-4xl mb-4">${icon}</div>
                    <h3 class="text-white text-lg font-black uppercase tracking-wider mb-2">${title}</h3>
                    <p class="text-slate-400 text-xs font-bold mb-6 leading-relaxed">${msg}</p>
                    <div class="grid grid-cols-2 gap-3">
                        <button id="modal-cancel" class="py-3 rounded-xl bg-white/5 text-slate-400 font-bold text-xs hover:bg-white/10">CANCEL</button>
                        <button id="modal-confirm" class="py-3 rounded-xl ${btnColor} text-white font-black text-xs shadow-lg">CONFIRM</button>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);
            requestAnimationFrame(() => { overlay.classList.remove('opacity-0'); overlay.firstElementChild.classList.remove('scale-90'); });

            document.getElementById('modal-cancel').onclick = () => close(false);
            document.getElementById('modal-confirm').onclick = () => close(true);

            function close(val) {
                overlay.classList.add('opacity-0');
                setTimeout(() => overlay.remove(), 300);
                resolve(val);
            }
        });
    }
};

/* =========================================
   3. ROUTER & INITIALIZATION
   ========================================= */
document.addEventListener("DOMContentLoaded", async function() {
    const loginBtn = document.getElementById("loginBtn");
    const p_id = localStorage.getItem("p_id");

    // ROUTE A: LOGIN PAGE
    if (loginBtn) {
        loginBtn.addEventListener("click", handleLogin);
        // Allow Enter key
        document.addEventListener("keypress", (e) => { if(e.key === "Enter") handleLogin(); });
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
    setInterval(checkBroadcast, 15000); // Check broadcast every 15s
});

/* =========================================
   4. SMART LOGIN (10/10 SECURITY)
   ========================================= */
async function handleLogin() {
    const rawInput = document.getElementById("code").value.trim();
    const passInput = document.getElementById("pass").value.trim();
    const loginBtn = document.getElementById("loginBtn");

    if (!rawInput || !passInput) return ui.toast("⚠️ Enter credentials", "error");

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
        }, 800);

    } catch (err) {
        console.error("Login Failed:", err);
        ui.toast("❌ Invalid Credentials", "error");
        loginBtn.innerHTML = "UNLOCK DASHBOARD";
        loginBtn.disabled = false;
    }
}

/* =========================================
   5. DASHBOARD CONTROLLER
   ========================================= */
async function loadUserProfile(userId) {
    // 1. Fetch Data
    const { data: user, error } = await db
        .from('promoters')
        .select('*, withdrawal_requested') 
        .eq('id', userId)
        .single();

    if (error || !user) {
        console.error("Sync Error:", error);
        // Don't auto-logout, just warn. Network might be flaky.
        ui.toast("⚠️ Connection unstable. Retrying...", "neutral");
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
            btn.classList.add("opacity-50", "cursor-not-allowed");
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

    // Fetch active campaigns
    const { data: offers } = await db.from('campaigns').select('*').eq('is_active', true).order('id', {ascending: false});
    
    // Empty State
    if (!offers || offers.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 opacity-50">
                <i class="fas fa-folder-open text-2xl mb-2"></i>
                <p class="text-[10px] font-bold uppercase">No active missions</p>
            </div>`;
        return;
    }

    // Render Cards
    container.innerHTML = offers.map(offer => {
        let dbUrl = offer.target_url || "#";
        let fullUrl = dbUrl.startsWith('http') ? dbUrl : `${window.location.origin}/${dbUrl}`;
        const separator = fullUrl.includes('?') ? '&' : '?';
        const finalLink = `${fullUrl}${separator}ref=${partnerCode}`;
        
        const imgUrl = offer.image_url || 'https://placehold.co/80x80/1e293b/FFF?text=TASK';

        return `
            <div class="glass-panel p-4 flex items-center justify-between border-white/5 hover:bg-white/5 transition">
                <div class="flex items-center gap-3 overflow-hidden">
                    <img src="${imgUrl}" class="w-10 h-10 rounded-lg bg-black/50 object-cover border border-white/10 shrink-0">
                    
                    <div class="min-w-0">
                        <h4 class="font-bold text-sm text-white truncate pr-2">${offer.title}</h4>
                        
                        <div class="flex items-center gap-3 mt-1">
                            <div class="text-[10px] font-bold text-green-400 flex items-center gap-1">
                                <span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                YOU: ₹${offer.payout_amount ?? 0}
                            </div>
                            ${offer.user_reward > 0 ? `
                            <div class="text-[10px] font-bold text-yellow-500 flex items-center gap-1 border-l border-white/10 pl-2">
                                USER: ₹${offer.user_reward}
                            </div>` : ''}
                        </div>

                    </div>
                </div>

                <button onclick="copyLink('${finalLink}')" 
                        class="bg-white/5 hover:bg-white/10 text-blue-400 border border-blue-500/30 px-3 py-2 rounded-lg text-[10px] font-black uppercase transition shrink-0 ml-2">
                    <i class="fas fa-link mr-1"></i> COPY
                </button>
            </div>
        `;
    }).join('');
}

/* =========================================
   TEAM INTELLIGENCE 2.0 (GOD MODE)
   ========================================= */
/* =========================================
   TEAM INTELLIGENCE 2.0 (GOD MODE)
   ========================================= */
async function loadTeamStats(userId) {
    try {
        // 1. Fetch EVERYTHING in parallel
        const [countRes, earnRes, recruitsRes, leadsRes] = await Promise.allSettled([
            // A. Count Recruits
            db.from('promoters').select('*', { count: 'exact', head: true }).eq('referred_by', userId),
            
            // B. Get Bonus Earnings (Correctly linked to Admin's 'referral_earnings')
            db.from('promoters').select('referral_earnings').eq('id', userId).single(),
            
            // C. Get Recruit List (Top 5 for roster)
            db.from('promoters').select('username, created_at, wallet_balance').eq('referred_by', userId).order('created_at', {ascending:false}),
            
            // D. Get User's Own Recent Leads (Activity Log)
            db.from('leads').select('phone, status, created_at').eq('user_id', userId).order('created_at', {ascending:false}).limit(5)
        ]);

        // 2. Update Header Stats
        if (countRes.status === 'fulfilled') document.getElementById("teamCount").innerText = countRes.value.count || 0;
        if (earnRes.status === 'fulfilled') document.getElementById("teamEarnings").innerText = `₹${earnRes.value.data?.referral_earnings || 0}`;

        // 3. VISUALIZATION ENGINE (The Missing Part)
        const container = document.getElementById("teamIntelligence");
        
        if (container) {
            const recruits = recruitsRes.status === 'fulfilled' ? recruitsRes.value.data : [];
            const leads = leadsRes.status === 'fulfilled' ? leadsRes.value.data : [];
            let html = "";

            // --- A. SQUADRON PREVIEW (Top 5) ---
            if (recruits && recruits.length > 0) {
                html += `<div style="padding:12px 15px; display:flex; justify-content:space-between; align-items:center; background:rgba(59,130,246,0.1); border-bottom:1px solid #1e293b;">
                    <span style="color:#60a5fa; font-size:11px; font-weight:800; letter-spacing:1px;">MY SQUADRON (${recruits.length})</span>
                </div>`;
                
                // Show Top 5
                recruits.slice(0, 5).forEach(r => html += renderRecruitRow(r));

                // "View All" Trigger
                if (recruits.length > 5) {
                    html += `<div onclick="openTeamModal()" style="padding:12px; text-align:center; cursor:pointer; color:#94a3b8; font-size:11px; font-weight:700; border-top:1px solid #1e293b; transition:0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.03)'" onmouseout="this.style.background='transparent'">
                        VIEW FULL ROSTER <i class="fas fa-arrow-right ml-1"></i>
                    </div>`;
                }
            }

            // --- B. MISSION LOGS ---
            if (leads && leads.length > 0) {
                html += `<div style="padding:12px 15px; margin-top:0px; background:rgba(234,179,8,0.1); border-top:1px solid #1e293b; border-bottom:1px solid #1e293b;">
                    <span style="color:#fbbf24; font-size:11px; font-weight:800; letter-spacing:1px;">RECENT ACTIVITY</span>
                </div>`;
                
                leads.forEach(l => {
                    const color = l.status === 'approved' ? '#22c55e' : (l.status === 'rejected' ? '#ef4444' : '#fbbf24');
                    const icon = l.status === 'approved' ? 'check-circle' : (l.status === 'rejected' ? 'times-circle' : 'clock');
                    
                    html += `<div style="padding:10px 15px; border-bottom:1px solid #1e293b; display:flex; justify-content:space-between; align-items:center;">
                        <div style="display:flex; align-items:center; gap:10px;">
                            <i class="fas fa-${icon}" style="color:${color}; font-size:14px;"></i>
                            <div>
                                <div style="color:white; font-size:12px; font-weight:600;">Task Submitted</div>
                                <div style="color:#64748b; font-size:10px;">${new Date(l.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                            </div>
                        </div>
                        <span style="color:${color}; font-size:10px; font-weight:800; padding:2px 6px; background:${color}10; border-radius:4px;">${l.status.toUpperCase()}</span>
                    </div>`;
                });
            }

            // --- C. EMPTY STATE ---
            if ((!recruits || recruits.length === 0) && (!leads || leads.length === 0)) {
                html = `<div style="padding:30px; text-align:center; color:#475569;">
                    <i class="fas fa-satellite-dish animate-pulse" style="font-size:24px; margin-bottom:10px; color:#334155;"></i>
                    <p style="font-size:12px; font-weight:600;">No network activity detected.</p>
                </div>`;
            }

            container.innerHTML = html;
        }

        // 4. Populate Modal (Hidden Data Source)
        if (recruitsRes.status === 'fulfilled' && recruitsRes.value.data) {
            window.fullTeamData = recruitsRes.value.data;
        }

    } catch (err) {
        console.error("Stats Error:", err);
    }
}

// Helper: Generates the beautiful row HTML
function renderRecruitRow(r) {
    const isActive = r.wallet_balance > 0;
    const statusColor = isActive ? 'text-green-400' : 'text-slate-500'; 
    const statusText = isActive ? `Active • ₹${r.wallet_balance}` : 'Sleeping';
    const initial = r.username.charAt(0).toUpperCase();
    const date = new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

    return `
    <div class="flex items-center justify-between p-3 border-b border-white/5 hover:bg-white/5 transition rounded-lg">
        <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-white font-bold text-xs border border-white/5">
                ${initial}
            </div>
            <div>
                <div class="text-xs font-bold text-white">${r.username}</div>
                <div class="text-[9px] font-bold ${statusColor} flex items-center gap-1">
                    <span class="w-1 h-1 rounded-full ${isActive ? 'bg-green-500' : 'bg-slate-500'}"></span>
                    ${statusText}
                </div>
            </div>
        </div>
        <div class="text-right">
            <div class="text-[9px] text-slate-500 font-bold uppercase">Joined</div>
            <div class="text-[10px] text-slate-300 font-mono">${date}</div>
        </div>
    </div>`;
}

/* =========================================
   7. UTILS & SYSTEM LAWS
   ========================================= */
function copyLink(text) { 
    navigator.clipboard.writeText(text).then(() => ui.toast("Link Copied!", "success")); 
}

function copyReferralLink() { 
    const el = document.getElementById("referralLinkInput"); 
    el.select(); 
    navigator.clipboard.writeText(el.value).then(() => ui.toast("Invite Link Copied!", "success")); 
}

function copyShareMessage() {
    const name = document.getElementById("partnerName").innerText;
    const link = document.getElementById("referralLinkInput").value;
    const msg = `🔥 *PART TIME INCOME* 🔥\nVerified by: ${name}\n👇 *REGISTER FREE:*\n${link}`;
    navigator.clipboard.writeText(msg).then(() => ui.toast("Viral Ad Copied!", "success"));
}

async function logout() {
    const confirmed = await ui.confirm("SIGN OUT?", "You will need to login again.", "neutral");
    if (confirmed) { 
        localStorage.clear(); 
        window.location.href = "login.html"; 
    }
}

// 🟢 SECURE PASSWORD UPDATE
async function updatePassword() {
    const newPass = document.getElementById("newPass").value.trim();
    if (newPass.length < 6) return ui.toast("⚠️ Key must be 6+ characters", "error");

    // Secure Auth Update
    const { error } = await db.auth.updateUser({ password: newPass });

    if (error) {
        ui.toast("Update Failed: " + error.message, "error");
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

    // 1. Maintenance Check
    const overlay = document.getElementById('maintenanceScreen');
    if(overlay) {
        laws.site_status === 'MAINTENANCE' ? overlay.classList.remove('hidden', 'flex') : overlay.classList.add('hidden');
        if(laws.site_status === 'MAINTENANCE') overlay.style.display = 'flex';
    }

    // 2. Minimum Payout Check
    const btn = document.getElementById('withdrawBtn');
    const displayMin = document.getElementById('display_min_payout');
    const balEl = document.getElementById("balanceDisplay");

    if (displayMin && btn && balEl) {
        const minRequired = parseInt(laws.min_payout || 100);
        displayMin.innerText = `₹${minRequired}`;
        
        if (btn.getAttribute("data-status") !== "pending") {
            const currentBalance = parseFloat(balEl.innerText.replace('₹', '')) || 0;
            if (currentBalance >= minRequired) {
                btn.disabled = false; 
                btn.innerText = "WITHDRAW NOW"; 
                btn.classList.remove("opacity-50", "cursor-not-allowed");
                btn.classList.add("bg-green-600", "text-white", "hover:bg-green-500", "cursor-pointer");
            } else {
                btn.disabled = true; 
                btn.innerText = "LOCKED"; 
                btn.classList.add("opacity-50", "cursor-not-allowed");
                btn.classList.remove("bg-green-600", "text-white", "hover:bg-green-500", "cursor-pointer");
            }
        }
    }
}

async function checkBroadcast() {
    // Correctly fetch the 'value' where key is 'broadcast_message'
    const { data } = await db.from('system_config').select('value').eq('key', 'broadcast_message').single();
    
    const container = document.getElementById('broadcastContainer');
    const textEl = document.getElementById('broadcastText');
    
    if (container && textEl && data?.value && data.value !== "OFF") {
        textEl.innerText = data.value; 
        container.classList.remove('hidden');
    } else if (container) {
        container.classList.add('hidden');
    }
}

// Logic: Opens the "View All" Modal
function openTeamModal() {
    const modal = document.getElementById('teamModal');
    const list = document.getElementById('fullTeamList');
    
    if (modal && list && window.fullTeamData) {
        // We re-render here to be safe
        list.innerHTML = window.fullTeamData.length > 0 
            ? window.fullTeamData.map(r => renderRecruitRow(r)).join('')
            : '<p class="text-center text-slate-500 text-xs py-10">No recruits found.</p>';
        modal.style.display = 'flex';
    }
}

// Handle Withdraw Request
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
        btn.classList.add("opacity-50", "cursor-not-allowed");
    } catch (err) {
        console.error(err);
        ui.toast("❌ Request Failed", "error");
        btn.innerHTML = "RETRY";
        btn.disabled = false;
    }
}