/* ==========================================================================
   GOD MODE LOGIN ENGINE v2.0
   Status: 10,000/10 (High-Speed Auth)
   ========================================================================== */

// 1. SECURITY HANDSHAKE
if (!window.env || !window.env.SUPABASE_URL) {
    console.error("❌ CRITICAL: config.js is missing!");
    alert("Security Error: Configuration file not found.");
}

const supabase = window.supabase.createClient(window.env.SUPABASE_URL, window.env.SUPABASE_KEY);
const ADMIN_WHATSAPP = "919778430867"; // <--- REPLACE THIS WITH YOUR NUMBER

/* =========================================
   2. AUTHENTICATION LOGIC
   ========================================= */
async function handleLogin() {
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
        // C. Database Query (Check Credentials)
        const { data, error } = await supabase
            .from('promoters')
            .select('*')
            .eq('username', username)
            .eq('password', password) // Assuming direct match for this system
            .single();

        if (error || !data) {
            throw new Error("⛔ Access Denied: Invalid Credentials");
        }

        if (data.status === 'banned') {
            throw new Error("🚫 This account has been deactivated.");
        }

        // D. Success Protocol
        // 1. Save Session
        localStorage.setItem('promoter_id', data.id);
        localStorage.setItem('promoter_name', data.name);
        
        // 2. Show Success
        showToast("✅ ACCESS GRANTED. WELCOME PARTNER.");
        btn.innerHTML = '<i class="fas fa-check"></i> UNLOCKED';
        btn.style.background = "#22c55e"; // Pure Green
        
        // 3. Redirect (The "New Access" Logic)
        setTimeout(() => {
            window.location.href = "index.html"; 
        }, 800);

    } catch (err) {
        // E. Failure Protocol
        console.error(err);
        showToast(err.message || "Connection Failed");
        
        // Reset Button
        btn.innerHTML = originalText;
        btn.style.opacity = "1";
        btn.disabled = false;
        
        // Shake Animation for wrong password
        document.querySelector('.login-box').classList.add('shake');
        setTimeout(() => document.querySelector('.login-box').classList.remove('shake'), 500);
    }
}

/* =========================================
   3. RECOVERY SYSTEM (WhatsApp)
   ========================================= */
function handlePasswordReset() {
    const username = document.getElementById('resetUsername').value.trim();
    
    if (!username) {
        showToast("⚠️ Please enter your Agent ID first.");
        return;
    }

    const msg = `URGENT: I am Agent ${username} and I have lost my access key. Please assist with recovery.`;
    const url = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(msg)}`;
    
    window.open(url, '_blank');
    closeResetModal();
}

/* =========================================
   4. UTILITIES & LISTENERS
   ========================================= */

// Toast Notification System
function showToast(msg) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast-box';
    
    // Icon Logic
    let icon = '<i class="fas fa-info-circle"></i>';
    if(msg.includes('✅')) icon = '<i class="fas fa-check-circle text-green-400"></i>';
    if(msg.includes('⛔') || msg.includes('⚠️')) icon = '<i class="fas fa-exclamation-triangle text-red-400"></i>';

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

// Modal Logic
window.openResetModal = function() {
    document.getElementById('resetModal').style.display = 'flex';
    document.getElementById('resetModal').classList.add('active');
};

window.closeResetModal = function() {
    document.getElementById('resetModal').style.display = 'none';
    document.getElementById('resetModal').classList.remove('active');
};

// "Enter" Key Listener (The Quality of Life Update)
document.addEventListener("DOMContentLoaded", () => {
    const passInput = document.getElementById('pass');
    
    // Trigger login when hitting Enter in password field
    passInput?.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            document.getElementById("loginBtn").click();
        }
    });

    // Check if user is already logged in?
    // Optional: Uncomment below if you want auto-redirect for logged-in users
    /*
    if(localStorage.getItem('promoter_id')) {
        window.location.href = "index.html";
    }
    */
});

/* Add CSS Shake Animation via JS */
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