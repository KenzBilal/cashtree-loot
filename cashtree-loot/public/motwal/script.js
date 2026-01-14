const supabaseUrl = 'https://qzjvratinjirrcmgzjlx.supabase.co';
// Using the long Key for maximum permissions
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6anZyYXRpbmppcnJjbWd6amx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMzAxMDksImV4cCI6MjA4MzgwNjEwOX0.W01Pmbokf20stTgkUsmI3TZahXYK4PPbU0v_2Ziy9YA'; 
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

const OFFER_LINK = "https://YOUR_OFFICIAL_MOTWAL_LINK"; // Put your link here

document.getElementById("submitBtn").addEventListener("click", async function() {
    const btn = document.getElementById("submitBtn");
    const phone = document.getElementById("phone").value.trim();
    const upi = document.getElementById("upi").value.trim();

    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref') || "DIRECT"; 

    if (phone.length < 10 || !upi.includes("@")) {
      alert("Please enter valid details");
      return;
    }

    btn.innerText = "Saving...";
    btn.disabled = true;

    try {
        // 1. Get the real ID for "Motwal" from the campaigns table
        const { data: campaignData } = await supabaseClient
            .from('campaigns')
            .select('id')
            .eq('title', 'Motwal')
            .single();

        if (!campaignData) {
            console.error("Campaign 'Motwal' not found in database.");
            alert("Configuration error. Please contact admin.");
            return;
        }

        // 2. Insert into 'leads' using the real campaign ID
        const { error } = await supabaseClient
          .from('leads')
          .insert([{
              phone: phone,
              upi_id: upi,
              user_id: refCode,
              campaign_id: campaignData.id, // This is the UUID it wants!
              status: 'pending'
          }]);

        if (error) throw error;

        // Success UI
        document.getElementById("statusMsg").style.display = "block";
        btn.style.display = "none";
        setTimeout(() => { window.location.href = OFFER_LINK; }, 1500);

    } catch (err) {
        console.error("Supabase Error:", err);
        alert("Error saving lead: " + err.message);
        btn.disabled = false;
        btn.innerText = "Submit & Download App";
    }
});