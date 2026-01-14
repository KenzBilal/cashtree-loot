/* =========================================
   1. SQL CONNECTION
   ========================================= */
const supabaseUrl = 'https://qzjvratinjirrcmgzjlx.supabase.co';
// REPLACE THE KEY BELOW WITH YOUR LONG ANON KEY STARTING WITH 'eyJ'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6anZyYXRpbmppcnJjbWd6amx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMzAxMDksImV4cCI6MjA4MzgwNjEwOX0.W01Pmbokf20stTgkUsmI3TZahXYK4PPbU0v_2Ziy9YA'; 
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener("DOMContentLoaded", () => {

    // --- A. DETECT PAGE ---
    const loginBtn = document.getElementById("loginBtn");
    const partnerId = localStorage.getItem("p_id");

    // --- B. LOGIN PAGE LOGIC ---
    if (loginBtn) {
        loginBtn.addEventListener("click", async () => {
            const codeInput = document.getElementById("code").value.trim().toUpperCase();
            const passInput = document.getElementById("pass").value.trim();

            if (!codeInput || !passInput) {
                showToast("⚠️ Enter Code and Password");
                return;
            }

            loginBtn.innerHTML = "Verifying...";
            loginBtn.disabled = true;

            // Query the 'promoters' table using 'username'
            const { data, error } = await supabaseClient
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
                // Save session info
                localStorage.setItem("p_id", data.id);
                localStorage.setItem("p_code", data.username);
                
                loginBtn.innerHTML = "✅ Success!";
                setTimeout(() => window.location.href = "index.html", 1000);
            }
        });
    } 
    
    // --- C. DASHBOARD PAGE LOGIC ---
    else {
        // If on index.html and not logged in, redirect to login
        if (!partnerId) {
            window.location.href = "login.html";
            return;
        }
        initDashboard(partnerId);
    }
});

/* =========================================
   DASHBOARD FUNCTIONS
   ========================================= */
async function initDashboard(id) {
    // 1. Fetch Promoter Data from the correct table
    const { data: user, error } = await supabaseClient
        .from('promoters')
        .select('*')
        .eq('id', id)
        .single();

    if (user) {
        // Update UI Elements
        const balEl = document.getElementById("balanceDisplay");
        const nameEl = document.getElementById("partnerName");
        
        // Match your database column names
        if (balEl) balEl.innerText = "₹" + (user.wallet_balance || 0);
        if (nameEl) nameEl.innerText = user.username;

        // 2. Load the Offers
        loadOffers(user.username);
    } else {
        // If user ID is invalid, logout
        logout();
    }
}

async function loadOffers(partnerCode) {
    const container = document.getElementById("offersContainer");
    if (!container) return;

    const { data: offers, error } = await supabaseClient
        .from('campaigns')
        .select('*')
        .eq('is_active', true);

    if (error) {
        console.error("Supabase Error:", error);
        container.innerHTML = "<p style='color:red;'>Error loading campaigns.</p>";
        return;
    }

    if (!offers || offers.length === 0) {
        container.innerHTML = "<p style='color:#666;text-align:center'>No active offers right now.</p>";
        return;
    }

    container.innerHTML = offers.map(offer => {
        const folderName = (offer.title || "offer").toLowerCase().replace(/\s+/g, '');
        
        
        // Result: https://cashtree.online/motwal/?ref=KENZB
        const link = `${window.location.origin}/${folderName}/?ref=${partnerCode}`;
        
        return `
        <div class="offer-card">
            <div class="offer-info">
                <h4>${offer.title}</h4>
                <span class="payout-tag">Earn ₹${offer.payout_amount}</span>
            </div>
            <button class="copy-btn" onclick="copyLink('${link}')">
                Copy Link 🔗
            </button>
        </div>
        `;
    }).join('');
}

/* =========================================
   HELPER FUNCTIONS
   ========================================= */
function copyLink(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast("Link Copied! 🔗");
    }).catch(err => {
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
    localStorage.removeItem("p_id");
    localStorage.removeItem("p_code");
    window.location.href = "login.html";
}

// Add these to your initialization inside script.js
async function applyGodModeLaws() {
    // 1. Fetch Laws from system_config
    const { data: config } = await supabase
        .from('system_config')
        .select('*');

    if (!config) return;

    // Convert array to a handy object
    const laws = {};
    config.forEach(c => laws[c.key] = c.value);

    // 2. CHECK MAINTENANCE STATUS
    if (laws.site_status === 'MAINTENANCE') {
        document.getElementById('maintenanceScreen').classList.remove('hidden');
        document.querySelector('.dashboard').style.display = 'none';
        return; // Stop here
    } else {
        document.getElementById('maintenanceScreen').classList.add('hidden');
        document.querySelector('.dashboard').style.display = 'block';
    }

    // 3. ENFORCE WITHDRAWAL LAW
    const minRequired = parseInt(laws.min_payout || 500);
    document.getElementById('display_min_payout').innerText = `₹${minRequired}`;

    // Fetch user balance (assuming you have user data)
    // const userBalance = parseFloat(userData.wallet_balance); 
    const balanceText = document.getElementById('balanceDisplay').innerText.replace('₹', '');
    const currentBalance = parseFloat(balanceText);
    const btn = document.getElementById('withdrawBtn');

    if (currentBalance >= minRequired) {
        btn.disabled = false;
        btn.style.opacity = "1";
        btn.style.cursor = "pointer";
        btn.style.background = "#22c55e";
        btn.style.color = "white";
        btn.innerText = "WITHDRAW NOW";
    } else {
        btn.innerText = `NEED ₹${minRequired - currentBalance} MORE`;
    }
}

// RUN LAWS EVERY 30 SECONDS FOR REAL-TIME CONTROL
applyGodModeLaws();
setInterval(applyGodModeLaws, 30000);