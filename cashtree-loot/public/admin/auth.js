/* =========================================
   AUTH CORE (Singleton)
   ========================================= */
const supabaseUrl = 'https://qzjvratinjirrcmgzjlx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6anZyYXRpbmppcnJjbWd6amx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMzAxMDksImV4cCI6MjA4MzgwNjEwOX0.W01Pmbokf20stTgkUsmI3TZahXYK4PPbU0v_2Ziy9YA';

// 1. Initialize Supabase globally on the window object
// This prevents "Identifier already declared" errors
if (!window.supabaseClient) {
    window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
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