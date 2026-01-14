// ==========================================
// 🚀 MOTWAL LEAD LOGIC
// ==========================================
const supabaseUrl = 'https://qzjvratinjirrcmgzjlx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6anZyYXRpbmppcnJjbWd6amx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMzAxMDksImV4cCI6MjA4MzgwNjEwOX0.W01Pmbokf20stTgkUsmI3TZahXYK4PPbU0v_2Ziy9YA'; 
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// Update this with your actual Motwal affiliate/tracking link
const OFFER_LINK = "https://YOUR_MOTWAL_AFFILIATE_LINK_HERE";

document.getElementById("submitBtn").addEventListener("click", async function() {
    const btn = document.getElementById("submitBtn");
    const msg = document.getElementById("statusMsg");
    
    // 1. GET USER INPUT
    const phone = document.getElementById("phone").value.trim();
    const upi = document.getElementById("upi").value.trim();

    // 2. GET PROMOTER CODE FROM URL
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref') || "DIRECT"; 

    // 3. VALIDATION
    if (!/^[0-9]{10}$/.test(phone)) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }
    if (upi.length < 5 || !upi.includes("@")) {
      alert("Please enter a valid UPI ID");
      return;
    }

    // 4. LOCK BUTTON
    btn.innerText = "Processing...";
    btn.disabled = true;

    try {
        // 5. INSERT INTO LEADS TABLE
        const { error } = await supabaseClient
          .from('leads')
          .insert([{
              phone: phone,         // Ensure 'phone' column (text) exists in leads table
              upi_id: upi,          // Matches your column
              user_id: refCode,     // Stores the promoter code
              campaign_id: 'Motwal', // Stores the app name
              status: 'pending'
          }]);

        if (error) throw error;

        // 6. SUCCESS: REDIRECT
        msg.style.display = "block";
        btn.style.display = "none";
        
        setTimeout(() => {
            window.location.href = OFFER_LINK;
        }, 1500);

    } catch (err) {
        console.error("Submission Error:", err);
        // Fail-safe redirect
        window.location.href = OFFER_LINK;
    }
});