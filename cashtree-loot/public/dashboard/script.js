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
    // Fetch Laws using the unified 'db' client
    const { data: config, error } = await db.from('system_config').select('*');
    
    if (error) {
        console.error("Sync Error:", error.message);
        return;
    }

    if (!config) return;

    // Map database rows to a laws object
    const laws = {};
    config.forEach(c => laws[c.key] = c.value);

    const maintenanceOverlay = document.getElementById('maintenanceScreen');
    const mainDashboard = document.querySelector('.dashboard');
    const displayMin = document.getElementById('display_min_payout');
    const btn = document.getElementById('withdrawBtn');
    const balEl = document.getElementById("balanceDisplay");

    // A. ENFORCE MAINTENANCE LOCKDOWN
    if (laws.site_status === 'MAINTENANCE') {
        if(maintenanceOverlay) maintenanceOverlay.classList.remove('hidden');
        if(mainDashboard) mainDashboard.style.display = 'none';
        // We pause here so users can't interact while you work
        return; 
    } else {
        // System is LIVE - Restore visibility
        if(maintenanceOverlay) maintenanceOverlay.classList.add('hidden');
        if(mainDashboard) mainDashboard.style.display = 'block';
    }

    // B. ENFORCE WITHDRAWAL LAW
    if (displayMin && btn && balEl) {
        const minRequired = parseInt(laws.min_payout || 500);
        displayMin.innerText = `₹${minRequired}`;

        // Get current balance from text safely
        const currentBalance = parseFloat(balEl.innerText.replace('₹', '')) || 0;

        if (currentBalance >= minRequired) {
            // UNLOCKED
            btn.disabled = false;
            btn.style.opacity = "1";
            btn.style.cursor = "pointer";
            btn.style.background = "#22c55e"; // Success Green
            btn.innerText = "WITHDRAW NOW";
        } else {
            // LOCKED
            btn.disabled = true;
            btn.style.opacity = "0.5";
            btn.style.cursor = "not-allowed";
            btn.style.background = "#1e293b"; // Slate Dark
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
        const balEl = document.getElementById("balanceDisplay");
        const nameEl = document.getElementById("partnerName");
        
        if (balEl) balEl.innerText = "₹" + (user.wallet_balance || 0);
        if (nameEl) nameEl.innerText = user.username;

        loadOffers(user.username);
    } else {
        logout();
    }
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