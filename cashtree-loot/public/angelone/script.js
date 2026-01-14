// ==========================================
// 🚀 ANGEL ONE LEAD LOGIC (UUID LOOKUP VERSION)
// ==========================================
const supabaseUrl = 'https://qzjvratinjirrcmgzjlx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6anZyYXRpbmppcnJjbWd6amx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMzAxMDksImV4cCI6MjA4MzgwNjEwOX0.W01Pmbokf20stTgkUsmI3TZahXYK4PPbU0v_2Ziy9YA'; 
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// Update with your real Angel One tracking link
const OFFER_LINK = "https://trkkcoin.com/ITC65034934/JAM0MN?ln=English";

document.getElementById("submitBtn").addEventListener("click", async function() {
    const btn = document.getElementById("submitBtn");
    const msg = document.getElementById("statusMsg");
    
    const phone = document.getElementById("phone").value.trim();
    const upi = document.getElementById("upi").value.trim();

    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref') || "DIRECT"; 

    // 1. Validation
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
        // 2. LOOKUP CAMPAIGN UUID
        const { data: campaignData } = await supabaseClient
            .from('campaigns')
            .select('id')
            .eq('title', 'Angel One') // Must match exactly in Supabase
            .single();

        // 3. LOOKUP PROMOTER UUID (Fixes the JANNAH123 error)
        let promoterUuid = null;
        if (refCode !== "DIRECT") {
            const { data: promoterData } = await supabaseClient
                .from('promoters')
                .select('id')
                .eq('username', refCode)
                .single();
            if (promoterData) promoterUuid = promoterData.id;
        }

        // 4. INSERT INTO LEADS TABLE
        const { error } = await supabaseClient
          .from('leads')
          .insert([{
              phone: phone,
              upi_id: upi,
              user_id: promoterUuid,    // Sends the UUID, not the name
              campaign_id: campaignData ? campaignData.id : null,
              status: 'pending'
          }]);

        if (error) throw error;

        // 5. SUCCESS
        msg.style.display = "block";
        btn.style.display = "none";
        
        setTimeout(() => {
            window.location.href = OFFER_LINK;
        }, 1500);

    } catch (err) {
        console.error("Submission Error:", err);
        // Fail-safe: Redirect anyway so user doesn't get stuck
        window.location.href = OFFER_LINK;
    }
});