// ==========================================
// 🚀 PROMOTER SIGNUP LOGIC
// ==========================================
const supabaseUrl = 'https://qzjvratinjirrcmgzjlx.supabase.co';
const supabaseKey = 'sb_publishable_AB7iUKxOU50vnoqllSfAnQ_Wdji8gEc';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener("DOMContentLoaded", () => {
    const signupBtn = document.getElementById("signupBtn");
    if (signupBtn) {
        signupBtn.addEventListener("click", attemptSignup);
    }
});

async function attemptSignup() {
    const name = document.getElementById("newName").value.trim();
    const code = document.getElementById("newCode").value.trim().toUpperCase();
    const upi = document.getElementById("newUpi").value.trim();
    const pass = document.getElementById("newPass").value.trim();
    const referCode = document.getElementById("referCode").value.trim().toUpperCase();
    
    const btn = document.getElementById("signupBtn");

    // Basic Validation
    if (!name || !code || !upi || !pass) {
        alert("Please fill all required fields.");
        return;
    }

    btn.innerText = "Creating Account...";
    btn.disabled = true;

    try {
        // Prepare the data object
        const promoterData = {
            full_name: name,
            username: code,
            upi_id: upi,
            password: pass, // Stored in our new SQL column
            referred_by: referCode || null,
            wallet_balance: referCode ? 20 : 0 // Give ₹20 if they joined via someone
        };

        const { error } = await supabase
            .from('promoters')
            .insert([promoterData]);

        if (error) {
            if (error.code === '23505') {
                alert("This Promoter Code is already taken. Try another!");
            } else {
                alert("Error: " + error.message);
            }
            return;
        }

        // Success - Redirect to Login
        alert("Registration Successful! Now login with your code and password.");
        window.location.href = "../dashboard/login.html";

    } catch (err) {
        console.error(err);
        alert("Something went wrong. Please try again.");
    } finally {
        btn.innerText = "Sign Up as Promoter";
        btn.disabled = false;
    }
}
