/* =========================================
   1. SQL CONNECTION
   ========================================= */
const supabaseUrl = 'https://qzjvratinjirrcmgzjlx.supabase.co';
const supabaseKey = 'sb_publishable_AB7iUKxOU50vnoqllSfAnQ_Wdji8gEc';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener("DOMContentLoaded", () => {

    // --- A. DETECT PAGE ---
    const loginBtn = document.getElementById("loginBtn");
    const partnerId = localStorage.getItem("p_id");

    // --- B. LOGIN PAGE LOGIC ---
    if (loginBtn) {
        loginBtn.addEventListener("click", async () => {
            const codeInput = document.getElementById("code").value.trim();
            const passInput = document.getElementById("pass").value.trim();

            if (!codeInput || !passInput) {
                showToast("⚠️ Enter Code and Password");
                return;
            }

            loginBtn.innerHTML = "Verifying...";
            loginBtn.disabled = true;

            const { data, error } = await supabaseClient
                .from('partners')
                .select('*')
                .eq('code', codeInput)
                .eq('password', passInput)
                .single();

            if (error || !data) {
                showToast("❌ Invalid Credentials");
                loginBtn.innerHTML = "Unlock Dashboard";
                loginBtn.disabled = false;
            } else {
                localStorage.setItem("p_id", data.id);
                localStorage.setItem("p_code", data.code);
                
                loginBtn.innerHTML = "✅ Success!";
                setTimeout(() => window.location.href = "index.html", 1000);
            }
        });
    } 
    
    // --- C. DASHBOARD PAGE LOGIC ---
    else {
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
    // 1. Fetch Partner Data
    const { data: user, error } = await supabaseClient
        .from('partners')
        .select('*')
        .eq('id', id)
        .single();

    if (user) {
        // Update UI
        const balEl = document.getElementById("balanceDisplay");
        const nameEl = document.getElementById("partnerName");
        
        if (balEl) balEl.innerText = "₹" + (user.balance || 0);
        if (nameEl) nameEl.innerText = user.code;

        // 2. Load the Money Making Offers
        loadOffers(user.code);
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

    // 2. Render Cards using YOUR column names: title and payout_amount
    container.innerHTML = offers.map(offer => {
        // Safe slug creation for the link
        const appSlug = (offer.title || "offer").toLowerCase().replace(/\s+/g, '-');
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
        // Fallback for older browsers
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