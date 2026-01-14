/* =========================================
   1. DATABASE CONNECTION (GOD-MODE)
   ========================================= */
const supabaseUrl = 'https://qzjvratinjirrcmgzjlx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6anZyYXRpbmppcnJjbWd6amx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMzAxMDksImV4cCI6MjA4MzgwNjEwOX0.W01Pmbokf20stTgkUsmI3TZahXYK4PPbU0v_2Ziy9YA'; 
const db = supabase.createClient(supabaseUrl, supabaseKey);

/* =========================================
   2. PAGE INITIALIZATION
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
        // This ensures maintenance and laws sync instantly
        applyGodModeLaws();
        setInterval(applyGodModeLaws, 10000);
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

    // --- THE FIX LOGIC ---
    // --- UPDATED MAINTENANCE TOGGLE ---
    if (laws.site_status === 'MAINTENANCE') {
        if (maintenanceOverlay) {
            maintenanceOverlay.classList.remove('hidden');
            maintenanceOverlay.style.display = 'flex'; // Use flex for centering
        }
        if (mainDashboard) mainDashboard.style.display = 'none';
        return; 
    } else {
        if (maintenanceOverlay) {
            maintenanceOverlay.classList.add('hidden');
            maintenanceOverlay.style.display = 'none'; // Completely kill it
        }
        if (mainDashboard) {
            mainDashboard.style.display = 'block'; // Bring back the dashboard
        }
    }
    

    // (The rest of your withdrawal enforcement code follows here...)
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
            btn.style.background = "#22c55e";
            btn.innerText = "WITHDRAW NOW";
        } else {
            btn.disabled = true;
            btn.style.opacity = "0.5";
            btn.innerText = `NEED ₹${Math.max(0, minRequired - currentBalance)} MORE`;
        }
    }
}

/* =========================================
   4. CORE DASHBOARD LOGIC
   ========================================= */
async function initDashboard(id) {
    const { data: user, error } = await db
        .from('promoters')
        .select('*')
        .eq('id', id)
        .single();

    if (user) {
        // --- 1. POPULATE UI ---
        document.getElementById("balanceDisplay").innerText = "₹" + (user.wallet_balance || 0);
        document.getElementById("partnerName").innerText = user.username;
        
        const teamEarnEl = document.getElementById("teamEarnings");
        if (teamEarnEl) teamEarnEl.innerText = "₹" + (user.referral_earnings || 0);

        // --- 2. GENERATE REFERRAL LINK ---
        const referInput = document.getElementById("referralLinkInput");
        if (referInput) {
            referInput.value = `${window.location.origin}/promoter/?ref=${user.username}`;
        }

        // --- 3. INITIALIZE POWER MODULES ---
        loadOffers(user.username);
        loadTeamIntelligence(id, user.username); 
        checkBroadcast(); // <--- ACTIVATE GLOBAL ALERTS
        
    } else {
        logout();
    }
}
async function loadTeamIntelligence(myId, myUsername) {
    // 1. Fetch DATA: Sub-Promoters (Army) AND Leads (Task Workers)
    const [subPromotersRes, leadsRes] = await Promise.all([
        db.from('promoters').select('username, created_at').eq('referred_by', myId).order('created_at', { ascending: false }),
        db.from('leads').select('full_name, status, campaign_title').eq('promoter_id', myUsername).order('created_at', { ascending: false })
    ]);

    const subPromoters = subPromotersRes.data || [];
    const leads = leadsRes.data || [];

    // 2. Update Basic Stats
    const countEl = document.getElementById('teamCount');
    if (countEl) countEl.innerText = subPromoters.length;

    // 3. Populate Intelligence Hub (The UI Container)
    const intelEl = document.getElementById('teamIntelligence');
    if (!intelEl) return;

    let html = "";

    // --- CATEGORY: REFERRED PROMOTERS (PEOPLE WHO CREATED ACCOUNTS) ---
    if (subPromoters.length > 0) {
        html += `<div style="background: rgba(59, 130, 246, 0.15); padding: 8px 15px; font-size: 10px; font-weight: 900; color: #60a5fa; letter-spacing: 1px;">👑 REFERRED PROMOTERS</div>`;
        subPromoters.forEach(p => {
            html += `
            <div style="padding: 12px 15px; border-bottom: 1px solid #1e293b; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="color: #fff; font-size: 13px; font-weight: 600;">👤 ${p.username}</div>
                    <div style="font-size: 10px; color: #475569;">Joined ${new Date(p.created_at).toLocaleDateString()}</div>
                </div>
                <span style="background: rgba(34, 197, 94, 0.1); color: #22c55e; font-size: 9px; padding: 3px 8px; border-radius: 4px; font-weight: 800; border: 1px solid rgba(34, 197, 94, 0.2);">PROMOTER</span>
            </div>`;
        });
    }

    // --- CATEGORY: TASK TRACKER (PEOPLE DOING LEADS) ---
    if (leads.length > 0) {
        html += `<div style="background: rgba(234, 179, 8, 0.15); padding: 8px 15px; font-size: 10px; font-weight: 900; color: #fbbf24; margin-top: 5px; letter-spacing: 1px;">🎯 USER TASK TRACKER</div>`;
        leads.forEach(l => {
            const isDone = l.status === 'approved';
            const statusColor = isDone ? '#22c55e' : '#f87171';
            
            html += `
            <div style="padding: 12px 15px; border-bottom: 1px solid #1e293b;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #fff; font-size: 13px; font-weight: 600;">📱 ${l.full_name || 'Normal User'}</span>
                    <span style="color: ${statusColor}; font-size: 10px; font-weight: 900;">${l.status.toUpperCase()}</span>
                </div>
                <div style="font-size: 11px; color: #64748b; margin: 4px 0;">Campaign: ${l.campaign_title}</div>
                <div style="font-size: 11px; font-weight: 800; margin-top: 6px;">
                    ${isDone ? 
                        `<span style="color: #22c55e;"><i class="fas fa-check-circle"></i> Goal Reached!</span>` : 
                        `<span style="color: #f87171; animation: pulse 2s infinite;"><i class="fas fa-exclamation-triangle"></i> Half-way: Tell user to finish task!</span>`}
                </div>
            </div>`;
        });
    }

    if (!html) {
        html = `<div style="padding: 40px 20px; text-align: center; color: #475569; font-size: 13px;">No activity detected in your network yet.</div>`;
    }

    intelEl.innerHTML = html;
}

async function loadOffers(partnerCode) {
    const container = document.getElementById("offersContainer");
    if (!container) return;

    const { data: offers, error } = await db
        .from('campaigns')
        .select('*')
        .eq('is_active', true);

    if (error || !offers || offers.length === 0) {
        container.innerHTML = "<p style='color:#666;text-align:center'>No active offers right now.</p>";
        return;
    }

    container.innerHTML = offers.map(offer => {
        const folderName = (offer.title || "offer").toLowerCase().replace(/\s+/g, '');
        const link = `${window.location.origin}/${folderName}/?ref=${partnerCode}`;
        
        return `
        <div class="offer-card">
            <div class="offer-info">
                <h4>${offer.title}</h4>
                <span class="payout-tag">Earn ₹${offer.payout || 0}</span>
            </div>
            <button class="copy-btn" onclick="copyLink('${link}')">
                Copy Link 🔗
            </button>
        </div>
        `;
    }).join('');
}

/* =========================================
   5. AUTH & HELPERS
   ========================================= */
async function handleLogin() {
    const codeInput = document.getElementById("code").value.trim().toUpperCase();
    const passInput = document.getElementById("pass").value.trim();
    const loginBtn = document.getElementById("loginBtn");

    if (!codeInput || !passInput) return showToast("⚠️ Enter credentials");

    loginBtn.innerHTML = "Verifying...";
    loginBtn.disabled = true;

    const { data, error } = await db
        .from('promoters')
        .select('*')
        .eq('username', codeInput)
        .eq('password', passInput)
        .single();

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

function copyLink(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast("Link Copied! 🔗");
    }).catch(() => {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        showToast("Link Copied! 🔗");
    });
}

function showToast(msg) {
    let t = document.getElementById("toast");
    if (!t) {
        t = document.createElement("div");
        t.id = "toast";
        document.body.appendChild(t);
    }
    t.innerText = msg;
    t.className = "show";
    setTimeout(() => t.className = "", 3000);
}

function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}

function copyReferralLink() {
    const linkInput = document.getElementById('referralLinkInput');
    if (!linkInput) return;

    linkInput.select(); // Select the text for mobile compatibility
    linkInput.setSelectionRange(0, 99999); // For mobile devices

    navigator.clipboard.writeText(linkInput.value).then(() => {
        showToast("Invite Link Copied! 🚀");
    }).catch(() => {
        // Fallback if clipboard fails
        showToast("Link Selected! Copy manually.");
    });
}
async function loadPowerIntelligence(myId, myUsername) {
    const intelEl = document.getElementById('teamIntelligence');
    if (!intelEl) return;

    // 1. Fetch SUB-PROMOTERS (People who created an account)
    const { data: subPromoters, error: pError } = await db.from('promoters')
        .select('username, created_at')
        .eq('referred_by', myId)
        .order('created_at', { ascending: false });

    // 2. Fetch LEADS (People doing tasks)
    // Map: user_id = your promoter username, campaign_id = the task
    const { data: leads, error: lError } = await db.from('leads')
        .select('phone, status, campaign_id, created_at')
        .eq('user_id', myUsername)
        .order('created_at', { ascending: false });

    if (pError || lError) {
        console.error("Intelligence Sync Error:", pError || lError);
    }

    let html = "";

    // --- CATEGORY 1: THE ARMY (SUB-PROMOTERS) ---
    if (subPromoters && subPromoters.length > 0) {
        html += `<div style="background: rgba(59, 130, 246, 0.1); padding: 8px 15px; font-size: 11px; font-weight: bold; color: #60a5fa; border-bottom: 1px solid #1e293b;">👑 REFERRED PROMOTERS (Account Created)</div>`;
        subPromoters.forEach(p => {
            html += `
            <div style="padding: 12px 15px; border-bottom: 1px solid #1e293b; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="color: white; font-weight: bold;">${p.username}</div>
                    <div style="font-size: 10px; color: #475569;">Manager Level • Joined ${new Date(p.created_at).toLocaleDateString()}</div>
                </div>
                <div style="text-align: right;">
                    <span style="color: #22c55e; font-size: 10px; font-weight: bold;">ACTIVE DASHBOARD</span>
                </div>
            </div>`;
        });
    }

    // --- CATEGORY 2: THE WORKERS (NORMAL USERS DOING LEADS) ---
    if (leads && leads.length > 0) {
        html += `<div style="background: rgba(234, 179, 8, 0.1); padding: 8px 15px; font-size: 11px; font-weight: bold; color: #fbbf24; border-bottom: 1px solid #1e293b; margin-top: 5px;">🎯 USER TASK TRACKER</div>`;
        
        leads.forEach(l => {
            const isDone = l.status === 'approved';
            const statusColor = isDone ? '#22c55e' : '#f87171';
            
            // Mask phone for privacy: 9876543210 -> User (***3210)
            const maskedPhone = l.phone ? `User (***${l.phone.slice(-4)})` : 'Normal User';
            
            const alertText = isDone ? 
                `<span style="color: #22c55e;">✅ Goal Reached!</span>` : 
                `<span style="color: #f87171; animation: pulse 2s infinite;"><i class="fas fa-exclamation-triangle"></i> Half-way: Tell user to finish task!</span>`;

            html += `
            <div style="padding: 12px 15px; border-bottom: 1px solid #1e293b;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <span style="color: white; font-size: 13px; font-weight: 600;">📱 ${maskedPhone}</span>
                    <span style="background: ${statusColor}22; color: ${statusColor}; font-size: 9px; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${l.status.toUpperCase()}</span>
                </div>
                <div style="font-size: 11px; color: #64748b;">Campaign ID: ${l.campaign_id}</div>
                <div style="font-size: 11px; font-weight: bold; margin-top: 5px;">${alertText}</div>
            </div>`;
        });
    }

    if (!html) {
        html = `<div style="padding: 30px; text-align: center; color: #475569; font-size: 13px;">No activity in your network yet.</div>`;
    }

    intelEl.innerHTML = html;
}


function openResetModal() {
    document.getElementById('resetModal').style.display = 'flex';
}

function closeResetModal() {
    document.getElementById('resetModal').style.display = 'none';
}

async function handlePasswordReset() {
    const username = document.getElementById("resetUsername").value.trim();
    if (!username) return alert("Please enter your username.");

    // 1. Verify user exists in Supabase
    const { data: user, error } = await db
        .from('promoters')
        .select('username')
        .eq('username', username)
        .single();

    if (error || !user) {
        return alert("Username not found. Please check and try again.");
    }

    // 2. The Power Move: Redirect to Admin WhatsApp with a Secure Token
    // Replace 919876543210 with your actual Support WhatsApp Number
    const adminWhatsApp = "919778430867"; 
    const message = `Hi Admin, I forgot my CashTree password. %0A%0AUsername: ${username}%0A%0APlease provide a temporary password.`;
    
    const waLink = `https://wa.me/${adminWhatsApp}?text=${message}`;
    
    alert("Verification Required: You will now be redirected to our WhatsApp Support to verify your identity.");
    window.location.href = waLink;
}
async function checkBroadcast() {
    const { data: config, error } = await db
        .from('system_config')
        .select('broadcast_message')
        .single();

    if (error) return;

    const container = document.getElementById('broadcastContainer');
    const textEl = document.getElementById('broadcastText');

    if (container && textEl && config.broadcast_message && config.broadcast_message.toUpperCase() !== "OFF") {
        textEl.innerText = config.broadcast_message;
        container.classList.remove('hidden');
        container.style.display = 'block'; // Ensure it's visible
    } else if (container) {
        container.classList.add('hidden');
        container.style.display = 'none';
    }
}
function copyShareMessage() {
    const partnerName = document.getElementById("partnerName").innerText;
    const referLink = document.getElementById("referralLinkInput").value;
    
    // The Viral Script
    const viralMessage = `🔥 *CASHTREE LOOT IS LIVE!* 🔥\n\n` +
                         `I'm making ₹500-1000 daily with simple tasks. 🚀\n\n` +
                         `✅ *Instant UPI Payouts*\n` +
                         `✅ *Verified by:* ${partnerName}\n` +
                         `✅ *No Investment Required*\n\n` +
                         `👇 *Join my team and start earning:* \n${referLink}\n\n` +
                         `Limited slots! Join now! 💰💰`;

    navigator.clipboard.writeText(viralMessage).then(() => {
        // Simple success feedback
        alert("✅ Viral Ad Copied! Now paste it on WhatsApp to grow your army.");
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}