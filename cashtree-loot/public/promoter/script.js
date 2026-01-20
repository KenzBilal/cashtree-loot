/* =========================================
   1. DATABASE CONNECTION (GOD-MODE)
   ========================================= */
const supabaseUrl = 'https://qzjvratinjirrcmgzjlx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6anZyYXRpbmppcnJjbWd6amx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMzAxMDksImV4cCI6MjA4MzgwNjEwOX0.W01Pmbokf20stTgkUsmI3TZahXYK4PPbU0v_2Ziy9YA'; 
const db = supabase.createClient(supabaseUrl, supabaseKey);

/* =========================================
   2. UI ENGINE (Glassmorphism System)
   ========================================= */
// Note: Ensure your index.html has the #toast-container div at bottom
const ui = {
    toast: (msg, type = 'neutral') => {
        const container = document.getElementById('toast-container');
        if(!container) return alert(msg); // Fallback

        const box = document.createElement('div');
        const colors = {
            success: 'border-green-500 bg-green-500/20 text-green-400',
            error: 'border-red-500 bg-red-500/20 text-red-400',
            neutral: 'border-blue-500 bg-blue-500/20 text-blue-400'
        };
        let icon = type === 'success' ? 'fa-check-circle' : (type === 'error' ? 'fa-exclamation-triangle' : 'fa-info-circle');

        box.className = `pointer-events-auto px-6 py-3 rounded-xl border-l-4 backdrop-blur-md shadow-lg translate-x-10 opacity-0 transition-all duration-300 font-bold text-xs ${colors[type] || colors.neutral}`;
        box.innerHTML = `<i class="fas ${icon} mr-2"></i>${msg}`;

        container.appendChild(box);
        setTimeout(() => box.classList.remove('translate-x-10', 'opacity-0'), 10);
        setTimeout(() => {
            box.classList.add('translate-x-10', 'opacity-0');
            setTimeout(() => box.remove(), 300);
        }, 3000);
    }
};

/* =========================================
   3. SYSTEM INIT (Maintenance Check)
   ========================================= */
// Auto-run immediately to lock the door if needed
(async function initSystem() {
    try {
        const { data: config, error } = await db.from('system_config').select('*');
        if (error) throw error;

        // Convert array to object
        const laws = {};
        config.forEach(row => { laws[row.key] = row.value; });

        // --- 🛑 ENFORCE MAINTENANCE ---
        const maintenanceOverlay = document.getElementById('maintenanceScreen');
        const contentCard = document.querySelector('.login-card'); 

        // CRITICAL: We only lock if Admin explicitly sets it to MAINTENANCE
        if (laws.site_status === 'MAINTENANCE') {
            if (maintenanceOverlay) {
                maintenanceOverlay.classList.remove('hidden');
                maintenanceOverlay.style.display = 'flex';
            }
            if (contentCard) contentCard.style.display = 'none';
        } else {
            // ✅ SYSTEM LIVE
            if (maintenanceOverlay) {
                maintenanceOverlay.classList.add('hidden');
                maintenanceOverlay.style.display = 'none';
            }
            if (contentCard) contentCard.style.display = 'block';
        }
    } catch (err) {
        console.error("System Check Failed:", err);
    }
})();

// Auto-fill Referral Code from URL
window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref) {
        const referInput = document.getElementById("referCode");
        if (referInput) {
            referInput.value = ref.toUpperCase();
            referInput.style.borderColor = "#22c55e"; // Visual cue
            ui.toast("Referral Code Applied!", "success");
        }
    }
};

/* =========================================
   4. SIGNUP LOGIC (THE GATEWAY)
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
    // 🟢 CASE INSENSITIVE: Force Uppercase for consistency
    const code = codeInput.value.trim().toUpperCase(); 
    const phone = phoneInput.value.trim();
    const upi = upiInput.value.trim();
    const pass = passInput.value.trim();
    const referCode = referInput.value.trim().toUpperCase();

    // VALIDATION
    if (!name || !code || !phone || !upi || !pass) {
        ui.toast("⚠️ Please fill all required fields.", "error");
        return;
    }
    if (!/^[0-9]{10}$/.test(phone)) {
        ui.toast("⚠️ Enter a valid 10-digit phone number.", "error");
        return;
    }
    if (code.includes(" ")) {
        ui.toast("⚠️ Username cannot have spaces.", "error");
        return;
    }

    // LOCK UI
    const originalText = btn.innerText;
    btn.innerHTML = "<i class='fas fa-circle-notch fa-spin'></i> CONNECTING...";
    btn.disabled = true;

    try {
        // A. CHECK EXISTING USER
        const { data: existingUser } = await db
            .from('promoters')
            .select('username')
            .eq('username', code)
            .maybeSingle();

        if (existingUser) {
            ui.toast("❌ Username taken. Try another.", "error");
            btn.innerText = originalText;
            btn.disabled = false;
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
            referred_by: referrerUuid, 
            wallet_balance: referrerUuid ? 20 : 0 // Bonus logic
        };

        const { error } = await db.from('promoters').insert([promoterData]);
        
        if (error) throw error;

        // D. SUCCESS
        ui.toast("🚀 Account Created! Redirecting...", "success");
        setTimeout(() => {
            window.location.href = "../dashboard/login.html";
        }, 1500);

    } catch (err) {
        console.error("Signup Error:", err);
        // Handle Unique Constraint (Phone Number) gracefully
        if (err.message.includes("unique constraint")) {
            ui.toast("❌ Phone number already registered.", "error");
        } else {
            ui.toast("❌ Error: " + err.message, "error");
        }
    } finally {
        // UNLOCK UI
        if(btn.disabled) {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    }
}