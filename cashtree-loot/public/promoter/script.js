// 1. Setup Connection (USE YOUR REAL VALUES FROM SUPABASE DASHBOARD)
const supabaseUrl = 'https://qzjvratinjirrcmgzjlx.supabase.co';
// Ensure this is your 'anon' 'public' key (the long one starting with 'eyJ')
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6anZyYXRpbmppcnJjbWd6amx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMzAxMDksImV4cCI6MjA4MzgwNjEwOX0.W01Pmbokf20stTgkUsmI3TZahXYK4PPbU0v_2Ziy9YA'; 

// Use 'supabaseClient' to avoid conflict with the 'supabase' library name
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

async function attemptSignup() {
    // 2. Get the input elements
    const nameInput = document.getElementById("newName");
    const codeInput = document.getElementById("newCode");
    const upiInput = document.getElementById("newUpi");
    const passInput = document.getElementById("newPass");
    const referInput = document.getElementById("referCode");
    const btn = document.getElementById("signupBtn");

    // 3. Trim values
    const name = nameInput.value.trim();
    const code = codeInput.value.trim().toUpperCase();
    const upi = upiInput.value.trim();
    const pass = passInput.value.trim();
    const referCode = referInput.value.trim().toUpperCase();

    // 4. Basic Validation
    if (!name || !code || !upi || !pass) {
        alert("Please fill all required fields.");
        return;
    }

    // UI Feedback
    btn.innerText = "Connecting to Database...";
    btn.disabled = true;

    try {
        // 5. Check if Username/Code already exists
        const { data: existingUser } = await supabaseClient
            .from('promoters')
            .select('username')
            .eq('username', code)
            .single();

        if (existingUser) {
            alert("This Promoter Code is already taken. Try another!");
            btn.innerText = "Create Partner Account";
            btn.disabled = false;
            return;
        }

       // 6. Prepare data (Matches your table columns exactly)
        const promoterData = {
            full_name: name,
            username: code,
            upi_id: upi,
            password: pass,
            phone: "0000000000", // You have a phone column, we must send SOMETHING
            referred_by: referCode || null,
            wallet_balance: referCode ? 20 : 0
        };

        // 7. Insert into Supabase
        const { error } = await supabaseClient
            .from('promoters')
            .insert([promoterData]);

        if (error) throw error;

        // 8. Success
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