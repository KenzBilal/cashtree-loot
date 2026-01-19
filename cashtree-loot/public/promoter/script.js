/* =========================================
   1. DATABASE CONNECTION (GOD-MODE)
   ========================================= */
const supabaseUrl = 'https://qzjvratinjirrcmgzjlx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6anZyYXRpbmppcnJjbWd6amx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMzAxMDksImV4cCI6MjA4MzgwNjEwOX0.W01Pmbokf20stTgkUsmI3TZahXYK4PPbU0v_2Ziy9YA'; 

const db = supabase.createClient(supabaseUrl, supabaseKey);

/* =========================================
   2. SYSTEM INIT (Maintenance Check)
   ========================================= */
// We run this immediately to lock the door if needed
(async function initSystem() {
    try {
        const { data: config, error } = await db.from('system_config').select('*');
        if (error) throw error;

        // Convert array to object for easy access
        const laws = {};
        config.forEach(row => { laws[row.key] = row.value; });

        // --- 🛑 ENFORCE MAINTENANCE ---
        const maintenanceOverlay = document.getElementById('maintenanceOverlay');
        const contentCard = document.querySelector('.glass-panel'); // Target the login/signup card

        if (laws.site_status === 'MAINTENANCE') {
            // 1. Show Screen
            if (maintenanceOverlay) {
                maintenanceOverlay.classList.remove('hidden');
                maintenanceOverlay.style.display = 'flex';
            }
            // 2. Hide Content
            if (contentCard) contentCard.style.display = 'none';
        } else {
            // ✅ SYSTEM LIVE
            if (maintenanceOverlay) maintenanceOverlay.classList.add('hidden');
            if (contentCard) contentCard.style.display = 'block';
        }
    } catch (err) {
        console.error("System Check Failed:", err);
    }
})();

/* =========================================
   3. SIGNUP LOGIC (THE GATEWAY)
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

    // VALIDATION
    if (!name || !code || !phone || !upi || !pass) {
        alert("⚠️ Please fill all required fields.");
        return;
    }
    if (!/^[0-9]{10}$/.test(phone)) {
        alert("⚠️ Please enter a valid 10-digit phone number.");
        return;
    }

    // LOCK UI
    const originalText = btn.innerText;
    btn.innerText = "Connecting...";
    btn.disabled = true;

    try {
        // A. CHECK EXISTING USER
        const { data: existingUser } = await db
            .from('promoters')
            .select('username')
            .eq('username', code)
            .maybeSingle();

        if (existingUser) {
            alert("❌ User Code taken. Try another.");
            return;
        }

        // B. REFERRAL LOGIC (Safe)
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
                // If invalid code, we just ignore it and proceed as DIRECT
                console.log("Invalid referral code, proceeding as direct.");
            }
        }

        // C. CREATE ACCOUNT
        const promoterData = {
            full_name: name,
            username: code,
            phone: phone,
            upi_id: upi,
            password: pass,
            referred_by: referrerUuid, // Can be UUID or null
            wallet_balance: referrerUuid ? 20 : 0 // Bonus logic
        };

        const { error } = await db.from('promoters').insert([promoterData]);
        
        if (error) throw error;

        // D. SUCCESS
        alert("🚀 Welcome to the team! Registration Successful.");
        window.location.href = "fdashboard/login.html"; // Ensure this path is correct relative to your file

    } catch (err) {
        console.error("Signup Error:", err);
        alert("❌ Error: " + err.message);
    } finally {
        // UNLOCK UI
        btn.innerText = originalText;
        btn.disabled = false;
    }
}