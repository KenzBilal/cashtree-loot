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
        // 1. Find the Campaign UUID (Matches "Motwal" or "Angel One")
        const { data: campaignData } = await supabaseClient
            .from('campaigns')
            .select('id')
            .eq('title', 'Motwal') // Change to 'Angel One' for that script
            .single();

        // 2. Find the Promoter UUID (Matches the ref code "JANNAH123")
        const { data: promoterData } = await supabaseClient
            .from('promoters')
            .select('id')
            .eq('username', refCode)
            .single();

        // 3. Insert into 'leads' using the actual UUIDs
        const { error } = await supabaseClient
          .from('leads')
          .insert([{
              phone: phone,
              upi_id: upi,
              // If promoter not found, we use null so the database doesn't crash
              user_id: promoterData ? promoterData.id : null, 
              campaign_id: campaignData ? campaignData.id : null,
              status: 'pending'
          }]);

        if (error) throw error;

        // Success UI
        document.getElementById("statusMsg").style.display = "block";
        btn.style.display = "none";
        setTimeout(() => { window.location.href = OFFER_LINK; }, 1500);

    } catch (err) {
        console.error("Supabase Error:", err);
        // If the error is still about UUIDs, we alert the admin
        alert("Error saving lead: " + err.message);
        btn.disabled = false;
        btn.innerText = "Submit & Download App";
    }
});