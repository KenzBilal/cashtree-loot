/* ==========================================================================
   GOD MODE LOGIN ENGINE v2.1 (Fixed)
   ========================================================================== */

// 1. SECURITY HANDSHAKE
if (!window.env || !window.env.SUPABASE_URL) {
    console.error("❌ CRITICAL: config.js is missing!");
    alert("Security Error: Configuration file not found.");
}

// FIX: We use 'authClient' instead of 'supabase' to prevent naming conflicts
const authClient = window.supabase.createClient(window.env.SUPABASE_URL, window.env.SUPABASE_KEY);
const ADMIN_WHATSAPP = "919876543210"; // <--- REPLACE THIS WITH YOUR NUMBER

/* =========================================
   2. AUTHENTICATION LOGIC
   ========================================= */
// We attach functions to 'window' to ensure HTML can see them
window.handleLogin = async function() {
    const codeInput = document.getElementById('code');
    const passInput = document.getElementById('pass');
    const btn = document.getElementById('loginBtn');

    const username = codeInput.value.trim();
    const password = passInput.value.trim();

    // A. Validation
    if (!username || !password) {
        showToast("⚠️ Enter both ID and Access Key");
        return;
    }

    // B. UI Feedback (Loading State)
    const originalText = btn.innerText;
    btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> VERIFYING...';
    btn.style.opacity = "0.7";
    btn.disabled = true;

    try {
        // C. Database Query (Using authClient)
        const { data, error } = await authClient
            .from('promoters')
            .select('*')
            .eq('username', username)
            .eq('password', password)
            .single();

        if (error || !data) {
            throw new Error("⛔ Access Denied: Invalid Credentials");
        }

        if (data.status === 'banned') {
            throw new Error("🚫 This account has been deactivated.");
        }

        // D. Success Protocol
        localStorage.setItem('promoter_id', data.id);
        localStorage.setItem('promoter_name', data.name);
        
        showToast("✅ ACCESS GRANTED. WELCOME PARTNER.");
        btn.innerHTML = '<i class="fas fa-check"></i> UNLOCKED';
        btn.style.background = "#22c55e"; 
        
        // Redirect
        setTimeout(() => {
            window.location.href = "index.html"; 
        }, 800);

    } catch (err) {
        console.error(err);
        showToast(err.message || "Connection Failed");
        
        btn.innerHTML = originalText;
        btn.style.opacity = "1";
        btn.disabled = false;
        
        // Shake Animation
        const box = document.querySelector('.login-box') || document.querySelector('.login-card');
        if(box) {
            box.classList.add('shake');
            setTimeout(() => box.classList.remove('shake'), 500);
        }
    }
};

/* =========================================
   3. RECOVERY SYSTEM (WhatsApp)
   ========================================= */
window.handlePasswordReset = function() {
    const username = document.getElementById('resetUsername').value.trim();
    
    if (!username) {
        showToast("⚠️ Please enter your Agent ID first.");
        return;
    }

    const msg = `URGENT: I am Agent ${username} and I have lost my access key. Please assist with recovery.`;
    const url = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(msg)}`;
    
    window.open(url, '_blank');
    if(typeof closeResetModal === 'function') closeResetModal(); // Close if modal logic exists
    
    // Also try removing active class if using CSS toggle
    const modal = document.getElementById('resetModal');
    if(modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
    }
};

/* =========================================
   4. UTILITIES
   ========================================= */
function showToast(msg) {
    const container = document.getElementById('toast-container');
    if(!container) return;
    
    const toast = document.createElement('div');
    toast.className = 'toast-box';
    
    let icon = '<i class="fas fa-info-circle"></i>';
    if(msg.includes('✅')) icon = '<i class="fas fa-check-circle" style="color:#4ade80"></i>';
    if(msg.includes('⛔') || msg.includes('⚠️')) icon = '<i class="fas fa-exclamation-triangle" style="color:#f87171"></i>';

    toast.innerHTML = `${icon} <span>${msg}</span>`;
    container.appendChild(toast);

    // Slide In
    setTimeout(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateX(0)";
    }, 10);

    // Remove
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(20px)";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Shake CSS Injector
const style = document.createElement('style');
style.innerHTML = `
    .shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
    @keyframes shake {
        10%, 90% { transform: translate3d(-1px, 0, 0); }
        20%, 80% { transform: translate3d(2px, 0, 0); }
        30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
        40%, 60% { transform: translate3d(4px, 0, 0); }
    }
`;
document.head.appendChild(style);

// Enter Key Listener
document.addEventListener("DOMContentLoaded", () => {
    const passInput = document.getElementById('pass');
    if(passInput) {
        passInput.addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                document.getElementById("loginBtn").click();
            }
        });
    }
});