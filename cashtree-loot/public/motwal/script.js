// --- 1. DEFINITIONS (This fixes the 'not defined' errors) ---
const supabaseUrl = 'https://qzjvratinjirrcmgzjlx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6anZyYXRpbmppcnJjbWd6amx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMzAxMDksImV4cCI6MjA4MzgwNjEwOX0.W01Pmbokf20stTgkUsmI3TZahXYK4PPbU0v_2Ziy9YA'; 

// Make sure the library is loaded before creating the client
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// Update this to your real Motwal link
const OFFER_LINK = "https://trkkcoin.com/IT3779ZXP1/JAM0MN?ln=English"; 

// --- 2. THE MAIN LOGIC ---
document.getElementById("submitBtn").addEventListener("click", async function() {
    const btn = document.getElementById("submitBtn");
    const phone = document.getElementById("phone").value.trim();
    const upi = document.getElementById("upi").value.trim();
    
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref'); 

    if (phone.length < 10) { alert("Please enter a valid phone number"); return; }

    btn.innerText = "Connecting...";
    btn.disabled = true;

    try {
        // Find Campaign ID
        const { data: campaignData, error: campErr } = await supabaseClient
            .from('campaigns')
            .select('id')
            .eq('title', 'Motwal') 
            .maybeSingle();
        
        if (campErr) throw campErr;

        // Find Promoter ID
        let promoterUuid = null;
        if (refCode) {
            const { data: pData } = await supabaseClient
                .from('promoters')
                .select('id')
                .eq('username', refCode)
                .maybeSingle();
            
            if (pData) promoterUuid = pData.id; 
        }

        // Prepare Data
        const leadData = {
            phone: phone,
            upi_id: upi,
            campaign_id: campaignData ? campaignData.id : null,
            status: 'pending'
        };

        if (promoterUuid) {
            leadData.user_id = promoterUuid;
        }

        // Insert into Supabase
        const { error: insertError } = await supabaseClient
            .from('leads')
            .insert([leadData]);

        if (insertError) throw insertError;

        // Success Flow
        document.getElementById("statusMsg").style.display = "block";
        btn.innerText = "Redirecting...";
        
        setTimeout(() => { 
            window.location.href = OFFER_LINK; 
        }, 1500);

    } catch (err) {
        console.error("Catch Block Error:", err);
        // Fallback: If it fails, still send user to the offer
        setTimeout(() => { 
            window.location.href = OFFER_LINK; 
        }, 2000);
    }
});