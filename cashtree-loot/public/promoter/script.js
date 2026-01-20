/* =========================================
   1. DATABASE CONNECTION
   ========================================= */
const supabaseUrl = 'https://qzjvratinjirrcmgzjlx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6anZyYXRpbmppcnJjbWd6amx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMzAxMDksImV4cCI6MjA4MzgwNjEwOX0.W01Pmbokf20stTgkUsmI3TZahXYK4PPbU0v_2Ziy9YA'; 
const db = supabase.createClient(supabaseUrl, supabaseKey);

/* =========================================
   2. UI ENGINE (TOASTS)
   ========================================= */
const ui = {
    toast: (msg, type = 'neutral') => {
        const container = document.getElementById('toast-container');
        if(!container) return alert(msg); 

        const box = document.createElement('div');
        const icon = type === 'success' ? 'fa-check-circle' : (type === 'error' ? 'fa-exclamation-triangle' : 'fa-info-circle');
        
        box.className = `toast-msg ${type}`;
        box.innerHTML = `<i class="fas ${icon}"></i> <span>${msg}</span>`;

        container.appendChild(box);

        // Remove after 3 seconds
        setTimeout(() => {
            box.style.opacity = '0';
            box.style.transform = 'translateY(-20px)';
            setTimeout(() => box.remove(), 300);
        }, 3000);
    }
};

/* =========================================
   3. SYSTEM INIT
   ========================================= */
window.addEventListener('load', async () => {
    // A. Remove Preloader
    setTimeout(() => {
        const loader = document.getElementById('app-loader');
        if(loader) { loader.style.opacity = '0'; setTimeout(() => loader.remove(), 500); }
    }, 800);

    // B. Check Maintenance Mode
    try {
        const { data: config } = await db.from('system_config').select('*');
        if (config) {
            const laws = {};
            config.forEach(r => laws[r.key] = r.value);
            
            if (laws.site_status === 'MAINTENANCE') {
                document.getElementById('maintenanceScreen').style.display = 'flex';
                document.querySelector('.login-card').style.display = 'none';
            }
        }
    } catch(e) { console.error("Sys Check:", e); }

    // C. Check URL for Referral Code
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref) {
        document.getElementById("referCode").value = ref.toUpperCase();
        ui.toast("Referral Code Applied", "success");
    }
});

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

    // 1. VALIDATION
    if (!name || !code || !phone || !upi || !pass) return ui.toast("⚠️ Please fill all fields.", "error");
    if (!/^[0-9]{10}$/.test(phone)) return ui.toast("⚠️ Invalid Phone Number.", "error");
    if (code.length < 3 || code.includes(" ")) return ui.toast("⚠️ Invalid Username (No spaces).", "error");
    if (pass.length < 6) return ui.toast("⚠️ Password too short (Min 6).", "error");

    // 2. LOCK UI
    const originalText = btn.innerHTML;
    btn.innerHTML = "<i class='fas fa-circle-notch fa-spin'></i> CREATING ID...";
    btn.disabled = true;

    try {
        // A. CHECK EXISTING USER (DB Query)
        const { data: existingUser } = await db.from('promoters').select('username').eq('username', code).maybeSingle();
        if (existingUser) {
            ui.toast("❌ Username taken. Try another.", "error");
            btn.innerHTML = originalText;
            btn.disabled = false;
            return;
        }

        // B. RESOLVE REFERRAL
        let referrerUuid = null;
        if (referCode) {
            const { data: refData } = await db.from('promoters').select('id').eq('username', referCode).maybeSingle();
            if (refData) referrerUuid = refData.id;
        }

        // 🟢 C. INVISIBLE EMAIL MAGIC (Security Core)
        // We create a fake email so Supabase Auth works, but user never sees it.
        const fakeEmail = `${code}@cashttree.internal`;

        const { data: authData, error: authError } = await db.auth.signUp({
            email: fakeEmail,
            password: pass
        });

        if (authError) throw authError;

        // D. INSERT PUBLIC PROFILE
        // We link the Auth ID to the Public Profile Table
        const { error: dbError } = await db.from('promoters').insert([{
            id: authData.user.id,
            full_name: name,
            username: code,
            phone: phone,
            upi_id: upi,
            password: pass, // Storing for user reference
            referred_by: referrerUuid, 
            wallet_balance: referrerUuid ? 20 : 0 // Bonus logic
        }]);

        if (dbError) throw dbError;

        // E. SUCCESS
        ui.toast("🚀 Setup Complete! Redirecting...", "success");
        
        setTimeout(() => {
            // 🟢 REDIRECT TO DASHBOARD LOGIN
            window.location.href = "../dashboard/login.html";
        }, 1500);

    } catch (err) {
        console.error("Signup Error:", err);
        if (err.message && err.message.includes("unique constraint")) {
            ui.toast("❌ Phone/Username already registered.", "error");
        } else {
            ui.toast("❌ Error: " + err.message, "error");
        }
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}