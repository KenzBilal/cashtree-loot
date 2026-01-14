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

// --- 🛑 ENFORCE MAINTENANCE (Login & Signup Gate) ---
    if (laws.site_status === 'MAINTENANCE') {
        // 1. Show the Maintenance Blanket
        if (maintenanceOverlay) {
            maintenanceOverlay.classList.remove('hidden');
            maintenanceOverlay.style.display = 'flex'; // Centering logic
        }
        
        // 2. Hide the Login/Signup Card (The Front Door)
        if (loginCard) loginCard.style.display = 'none';
        
        // 3. Hide Dashboard (if user is already inside)
        if (mainDashboard) mainDashboard.style.display = 'none';
        
        return; // Stop execution while locked
    } else {
        // --- ✅ SYSTEM IS LIVE ---
        if (maintenanceOverlay) {
            maintenanceOverlay.classList.add('hidden');
            maintenanceOverlay.style.display = 'none';
        }
        // Restore visibility to whichever page the user is on
        if (loginCard) loginCard.style.display = 'block';
        if (mainDashboard) mainDashboard.style.display = 'block';
    }