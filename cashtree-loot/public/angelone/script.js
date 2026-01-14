const supabaseUrl = 'https://qzjvratinjirrcmgzjlx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6anZyYXRpbmppcnJjbWd6amx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMzAxMDksImV4cCI6MjA4MzgwNjEwOX0.W01Pmbokf20stTgkUsmI3TZahXYK4PPbU0v_2Ziy9YA'; 
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

const OFFER_LINK = "https://trkkcoin.com/ITC65034934/JAM0MN?ln=English";

document.getElementById("submitBtn").addEventListener("click", async function() {
    const btn = document.getElementById("submitBtn");
    const msg = document.getElementById("statusMsg");
    
    const phone = document.getElementById("phone").value.trim();
    const upi = document.getElementById("upi").value.trim();

    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref') || "DIRECT"; 

    if (!/^[0-9]{10}$/.test(phone)) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }
    if (upi.length < 5 || !upi.includes("@")) {
      alert("Please enter a valid UPI ID");
      return;
    }

    btn.innerText = "Processing...";
    btn.disabled = true;

    try {
        // --- MATCHING YOUR COLUMNS ---
        const { error } = await supabaseClient
          .from('leads')
          .insert([{
              phone: phone,
              upi_id: upi,          // Matches your 'upi_id' column
              user_id: refCode,     // Using 'user_id' to store the promoter code
              campaign_id: 'AngelOne', // Using 'campaign_id' to store the offer name
              status: 'pending'     // Matches your 'status' column
              // Note: 'phone' is missing from your column list, so it's not included here
          }]);

        if (error) throw error;

        msg.style.display = "block";
        btn.style.display = "none";
        
        setTimeout(() => {
            window.location.href = OFFER_LINK;
        }, 1500);

    } catch (err) {
        console.error("Submission Error:", err);
        window.location.href = OFFER_LINK;
    }
});