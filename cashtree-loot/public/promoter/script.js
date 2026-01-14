// 1. Setup Connection
const supabaseUrl = 'https://qzjvratinjirrcmgzjlx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6anZyYXRpbmppcnJjbWd6amx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMzAxMDksImV4cCI6MjA4MzgwNjEwOX0.W01Pmbokf20stTgkUsmI3TZahXYK4PPbU0v_2Ziy9YA'; 

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

async function attemptSignup() {
    // 2. Get the input elements
    const nameInput = document.getElementById("newName");
    const codeInput = document.getElementById("newCode");
    const phoneInput = document.getElementById("newPhone"); // New field
    const upiInput = document.getElementById("newUpi");
    const passInput = document.getElementById("newPass");
    const referInput = document.getElementById("referCode");
    const btn = document.getElementById("signupBtn");

    // 3. Trim values
    const name = nameInput.value.trim();
    const code = codeInput.value.trim().toUpperCase();
    const phone = phoneInput.value.trim();
    const upi = upiInput.value.trim();
    const pass = passInput.value.trim();
    const referCode = referInput.value.trim().toUpperCase();

    // 4. Validation
    if (!name || !code || !phone || !upi || !pass) {
        alert("Please fill all required fields.");
        return;
    }
    if (!/^[0-9]{10}$/.test(phone)) {
        alert("Please enter a valid 10-digit phone number.");
        return;
    }

    btn.innerText = "Connecting to Database...";
    btn.disabled = true;

    try {
        // 5. Check if Username/Code already exists
        const { data: existingUser } = await supabaseClient
            .from('promoters')
            .select('username')
            .eq('username', code)
            .maybeSingle();

        if (existingUser) {
            alert("This Promoter Code is already taken. Try another!");
            return;
        }

        // 6. Referral UUID Lookup (Fixes the Foreign Key Error)
        let referrerUuid = null;
        if (referCode && referCode !== "DIRECT") {
            const { data: refData } = await supabaseClient
                .from('promoters')
                .select('id')
                .eq('username', referCode)
                .maybeSingle();
            
            if (refData) {
                referrerUuid = refData.id;
            } else {
                alert("Referral code not found. You can still join, but won't get the bonus.");
            }
        }

        // 7. Prepare data
        const promoterData = {
            full_name: name,
            username: code,
            phone: phone, // Real unique phone number
            upi_id: upi,
            password: pass,
            referred_by: referrerUuid, // Sends the UUID, not the name
            wallet_balance: referrerUuid ? 20 : 0
        };

        // 8. Insert into Supabase
        const { error } = await supabaseClient
            .from('promoters')
            .insert([promoterData]);

        if (error) throw error;

        // 9. Success
        alert("Welcome to the team! Registration Successful.");
        window.location.href = "../dashboard/login.html";

    } catch (err) {
        console.error("Signup Error:", err);
        alert("Error: " + err.message);
    } finally {
        btn.innerText = "Create Partner Account";
        btn.disabled = false;
    }
}
async function checkSystemStatus() {
    // 👑 GOD-MODE BYPASS: Don't lock the login/signup page
    const isAuthPage = window.location.pathname.includes('index.html') || window.location.pathname === '/';
    
    // If we are on the front door, don't show the maintenance screen
    if (isAuthPage) return; 

    const { data } = await supabase
        .from('system_config')
        .select('value')
        .eq('key', 'site_status')
        .single();

    if (data && data.value === 'MAINTENANCE') {
        document.getElementById('maintenanceScreen').classList.remove('hidden');
    }
}

// Run this as soon as the page opens
checkSystemStatus();

// GOD MODE: Check every 30 seconds so it unlocks automatically when you're done
setInterval(checkSystemStatus, 30000);