
if (!window.supabaseClient) {
    
    // Safety Check: Did config.js load?
    if (!window.env || !window.env.SUPABASE_URL) {
        console.error("❌ CRITICAL: config.js is missing!");
        alert("System Error: Configuration missing.");
    } else {
        // Initialize using the keys from config.js
        window.supabaseClient = window.supabase.createClient(
            window.env.SUPABASE_URL, 
            window.env.SUPABASE_KEY
        );
    }
}

// 2. Helper for Login
async function handleLogin() {
    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value.trim();
    const btn = document.querySelector(".unlock-btn");
    const originalText = btn ? btn.innerText : "LOGIN";

    if (!email || !password) {
        alert("Enter email and password");
        return;
    }

    if(btn) { btn.disabled = true; btn.innerText = "VERIFYING..."; }

    try {
        const { data, error } = await window.supabaseClient.auth.signInWithPassword({
            email,
            password
        });

        if (error || !data.user) throw new Error("Invalid credentials");

        // Check Role
        const role = data.user.app_metadata?.role;
        if (role !== "admin") {
            await window.supabaseClient.auth.signOut();
            throw new Error("Unauthorized account");
        }

        // SUCCESS: Unlock Dashboard
        if(typeof window.initDashboard === 'function') {
            window.initDashboard();
        } else {
            console.error("Dashboard Init function missing");
            location.reload();
        }

    } catch (err) {
        alert(err.message);
        if(btn) { btn.disabled = false; btn.innerText = originalText; }
    }
}

// 3. Auto-Check on Load (If already logged in)
document.addEventListener("DOMContentLoaded", async () => {
    const { data } = await window.supabaseClient.auth.getSession();
    if (data.session?.user?.app_metadata?.role === "admin") {
        if(typeof window.initDashboard === 'function') {
            window.initDashboard();
        }
    }
});