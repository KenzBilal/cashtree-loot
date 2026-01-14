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

    // 1. Fetch from 'campaigns' table
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

    // 2. Render Cards
    container.innerHTML = offers.map(offer => {
        const appSlug = (offer.title || "offer").toLowerCase().replace(/\s+/g, '-');
        // This generates your tracking link
        const link = `${window.location.origin}/offers/${appSlug}/?ref=${partnerCode}`;
        
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