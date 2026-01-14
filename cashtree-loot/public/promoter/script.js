/* =========================================
   1. DATABASE CONNECTION (GOD-MODE)
   ========================================= */
const supabaseUrl = 'https://qzjvratinjirrcmgzjlx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6anZyYXRpbmppcnJjbWd6amx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMzAxMDksImV4cCI6MjA4MzgwNjEwOX0.W01Pmbokf20stTgkUsmI3TZahXYK4PPbU0v_2Ziy9YA'; 

// Unified variable name 'db' to prevent "supabase is not defined" errors
const db = supabase.createClient(supabaseUrl, supabaseKey);

/* =========================================
   2. SIGNUP LOGIC (THE GATEWAY)
   ========================================= */
async function attemptSignup() {
    const nameInput = document.getElementById("newName");
    const codeInput = document.getElementById("newCode");
    const phoneInput = document.getElementById("newPhone");
    const upiInput = document.getElementById("newUpi");
    const passInput = document.getElementById("newPass");
    const referInput = document.getElementById("referCode");
    const btn = document.getElementById("signupBtn");

    const name = nameInput.value.trim();
    const code = codeInput.value.trim().toUpperCase();
    const phone = phoneInput.value.trim();
    const upi = upiInput.value.trim();
    const pass = passInput.value.trim();
    const referCode = referInput.value.trim().toUpperCase();

    if (!name || !code || !phone || !upi || !pass) {
        alert("⚠️ Please fill all required fields.");
        return;
    }
    if (!/^[0-9]{10}$/.test(phone)) {
        alert("⚠️ Please enter a valid 10-digit phone number.");
        return;
    }

    btn.innerText = "Connecting to Database...";
    btn.disabled = true;

    try {
        // Check if Username/Code already exists
        const { data: existingUser } = await db
            .from('promoters')
            .select('username')
            .eq('username', code)
            .maybeSingle();

        if (existingUser) {
            alert("❌ This Promoter Code is already taken. Try another!");
            btn.innerText = "Create Partner Account";
            btn.disabled = false;
            return;
        }

        // Referral UUID Lookup
        let referrerUuid = null;
        if (referCode && referCode !== "DIRECT") {
            const { data: refData } = await db
                .from('promoters')
                .select('id')
                .eq('username', referCode)
                .maybeSingle();
            
            if (refData) {
                referrerUuid = refData.id;
            } else {
                alert("ℹ️ Referral code not found. Continuing without bonus.");
            }
        }

        const promoterData = {
            full_name: name,
            username: code,
            phone: phone,
            upi_id: upi,
            password: pass,
            referred_by: referrerUuid,
            wallet_balance: referrerUuid ? 20 : 0
        };

        const { error } = await db.from('promoters').insert([promoterData]);
        if (error) throw error;

        alert("🚀 Welcome to the team! Registration Successful.");
        window.location.href = "../dashboard/login.html";

    } catch (err) {
        console.error("Signup Error:", err);
        alert("❌ Error: " + err.message);
    } finally {
        btn.innerText = "Create Partner Account";
        btn.disabled = false;
    }
}

/* =========================================
   3. THE GOD-MODE PULSE (GLOBAL LAWS)
   ========================================= */
async function applyGodModeLaws() {
    // Using the unified 'db' client
    const { data: config, error } = await db.from('system_config').select('*');

    if (error || !config) return;

    const laws = {};
    config.forEach(c => laws[c.key] = c.value);

    // Identify UI Elements
    const isDashboard = window.location.pathname.includes('dashboard') || document.querySelector('.dashboard');
    const maintenanceOverlay = document.getElementById('maintenanceScreen');
    const loginCard = document.querySelector('.login-card'); 
    const mainDashboard = document.querySelector('.dashboard');

    // ENFORCE MAINTENANCE
    if (laws.site_status === 'MAINTENANCE') {
        if (isDashboard) {
            if (maintenanceOverlay) maintenanceOverlay.classList.remove('hidden');
            if (mainDashboard) mainDashboard.style.display = 'none';
        } 
        // Signup page remains open unless you specifically want to lock it
    } else {
        if (maintenanceOverlay) maintenanceOverlay.classList.add('hidden');
        if (mainDashboard) mainDashboard.style.display = 'block';
        if (loginCard) loginCard.style.display = 'block';
    }

    // ENFORCE WITHDRAWAL LAW
    if (isDashboard && document.getElementById('withdrawBtn')) {
        const minRequired = parseInt(laws.min_payout || 500);
        const displayMin = document.getElementById('display_min_payout');
        const balanceElem = document.getElementById('balanceDisplay');
        const btn = document.getElementById('withdrawBtn');

        if(displayMin) displayMin.innerText = `₹${minRequired}`;

        if (balanceElem && btn) {
            const currentBalance = parseFloat(balanceElem.innerText.replace('₹', '')) || 0;
            
            if (currentBalance >= minRequired) {
                btn.disabled = false;
                btn.style.opacity = "1";
                btn.innerText = "WITHDRAW NOW";
                btn.style.background = "#22c55e";
                btn.style.cursor = "pointer";
            } else {
                btn.disabled = true;
                btn.style.opacity = "0.5";
                btn.innerText = `NEED ₹${Math.max(0, minRequired - currentBalance)} MORE`;
                btn.style.background = "#1e293b";
                btn.style.cursor = "not-allowed";
            }
        }
    }
}

/* =========================================
   4. INITIALIZATION
   ========================================= */
// Start the Heartbeat Pulse immediately
applyGodModeLaws();
setInterval(applyGodModeLaws, 10000); 

// Make functions globally available for HTML onclick events
window.attemptSignup = attemptSignup;