// --- 1. CONFIGURATION (Defined at the top to prevent ReferenceErrors) ---
const supabaseUrl = 'https://qzjvratinjirrcmgzjlx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6anZyYXRpbmppcnJjbWd6amx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMzAxMDksImV4cCI6MjA4MzgwNjEwOX0.W01Pmbokf20stTgkUsmI3TZahXYK4PPbU0v_2Ziy9YA'; 

// Initialize Supabase Client
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// Update with your actual Angel One tracking link
const OFFER_LINK = "https://trkkcoin.com/ITC65034934/JAM0MN?ln=English";

// --- 2. THE MAIN LOGIC ---
document.getElementById("submitBtn").addEventListener("click", async function() {
    const btn = document.getElementById("submitBtn");
    const phone = document.getElementById("phone").value.trim();
    const upi = document.getElementById("upi").value.trim();
    
    // Capture the ?ref= code from URL
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref'); 

    // Validation
    if (phone.length < 10) { 
        alert("Please enter a valid 10-digit phone number"); 
        return; 
    }

    btn.innerText = "Connecting...";
    btn.disabled = true;

    try {
        // A. Find Campaign UUID for "Angel One"
        const { data: campaignData, error: campErr } = await supabaseClient
            .from('campaigns')
            .select('id')
            .eq('title', 'Angel One') 
            .maybeSingle();
        
        if (campErr) throw campErr;

        // B. Find Promoter UUID for the ref code (e.g., JANNAH123)
        let promoterUuid = null;
        if (refCode && refCode !== "DIRECT") {
            const { data: pData } = await supabaseClient
                .from('promoters')
                .select('id')
                .eq('username', refCode)
                .maybeSingle();
            
            if (pData) {
                promoterUuid = pData.id;
                console.log("✅ Promoter Found:", promoterUuid);
            }
        }

        // C. Prepare the Lead Data
        const leadData = {
            phone: phone,
            upi_id: upi,
            campaign_id: campaignData ? campaignData.id : null,
            status: 'pending'
        };

        // Attach user_id ONLY if we found a valid matching UUID in the database
        if (promoterUuid) {
            leadData.user_id = promoterUuid;
        }

        // D. Insert into 'leads' table
        const { error: insertError } = await supabaseClient
            .from('leads')
            .insert([leadData]);

        if (insertError) throw insertError;

        // E. Success Flow
        document.getElementById("statusMsg").style.display = "block";
        btn.innerText = "Success! Redirecting...";
        
        setTimeout(() => { 
            window.location.href = OFFER_LINK; 
        }, 1500);

    } catch (err) {
        console.error("Catch Block Error:", err);
        // Fail-safe: Redirect to offer anyway so the user experience isn't broken
        setTimeout(() => { 
            window.location.href = OFFER_LINK; 
        }, 2000);
    }
});