// ==========================================
// 🚀 SUPABASE CONFIGURATION
// ==========================================
const supabaseUrl = 'https://qzjvratinjirrcmgzjlx.supabase.co';
const supabaseKey = 'sb_publishable_AB7iUKxOU50vnoqllSfAnQ_Wdji8gEc';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

const OFFER_LINK = "https://trkkcoin.com/ITC65034934/JAM0MN?ln=English";

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
        // 5. SQL LOGIC: CONNECT LEAD TO PROMOTER & ANGEL ONE
        // A. Find Promoter UUID
        const { data: promoter } = await supabase
            .from('promoters')
            .select('id')
            .eq('username', refCode)
            .single();

        // B. Find Angel One Campaign UUID (Make sure it's named 'AngelOne' in your DB)
        const { data: campaign } = await supabase
            .from('campaigns')
            .select('id')
            .eq('app_name', 'AngelOne') 
            .single();

        // C. Insert into SQL Leads Table
       
const { error } = await supabase
  .from('leads')
  .insert([{
      promoter_id: promoter ? promoter.id : null, 
      campaign_id: campaign ? campaign.id : null,
      lead_phone: phone,
      lead_upi: upi, // <--- NEW: Saves the user's UPI
      status: 'pending'
  }]);
       

        if (error) throw error;

        // 6. SUCCESS: REDIRECT
        msg.style.display = "block";
        btn.style.display = "none";
        
        setTimeout(() => {
            window.location.href ="https://trkkcoin.com/ITC65034934/JAM0MN?ln=English";
        }, 1500);

    } catch (err) {
        console.error("Submission Error:", err);
        // Fail-safe: Always redirect so you don't lose the user
        window.location.href ="https://trkkcoin.com/ITC65034934/JAM0MN?ln=English";
    }
});
