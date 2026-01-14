const supabaseUrl = 'https://qzjvratinjirrcmgzjlx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6anZyYXRpbmppcnJjbWd6amx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMzAxMDksImV4cCI6MjA4MzgwNjEwOX0.W01Pmbokf20stTgkUsmI3TZahXYK4PPbU0v_2Ziy9YA'; 
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

const OFFER_LINK = "https://trkkcoin.com/ITC65034934/JAM0MN?ln=English";

document.getElementById("submitBtn").addEventListener("click", async function() {
    const btn = document.getElementById("submitBtn");
    const phone = document.getElementById("phone").value.trim();
    const upi = document.getElementById("upi").value.trim();
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref'); 

    if (phone.length < 10 || !upi.includes("@")) {
      alert("Invalid details");
      return;
    }

    btn.innerText = "Processing...";
    btn.disabled = true;

    try {
        const { data: campaignData } = await supabaseClient
            .from('campaigns')
            .select('id')
            .eq('title', 'Angel One') 
            .single();

        let promoterUuid = null;
        if (refCode && refCode !== "DIRECT") {
            const { data: promoterData } = await supabaseClient
                .from('promoters')
                .select('id')
                .eq('username', refCode)
                .single();
            if (promoterData) promoterUuid = promoterData.id;
        }

        const leadData = {
            phone: phone,
            upi_id: upi,
            campaign_id: campaignData ? campaignData.id : null,
            status: 'pending'
        };

        if (promoterUuid) {
            leadData.user_id = promoterUuid;
        }

        const { error } = await supabaseClient.from('leads').insert([leadData]);
        if (error) throw error;

        document.getElementById("statusMsg").style.display = "block";
        btn.style.display = "none";
        setTimeout(() => { window.location.href = OFFER_LINK; }, 1500);

    } catch (err) {
        console.error("Error:", err.message);
        window.location.href = OFFER_LINK;
    }
});