// 1. CONFIGURATION
// Replace with your keys from .env.local
const supabaseUrl = 'https://qzjvratinjirrcmgzjlx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6anZyYXRpbmppcnJjbWd6amx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMzAxMDksImV4cCI6MjA4MzgwNjEwOX0.W01Pmbokf20stTgkUsmI3TZahXYK4PPbU0v_2Ziy9YA';

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// UPDATE THIS FOR EACH NEW CAMPAIGN
const CAMPAIGN_TITLE = 'Angel One'; 
const OFFER_LINK = "https://trkkcoin.com/ITC65034934/JAM0MN?ln=English";

// 2. MAIN LOGIC
document.getElementById("submitBtn").addEventListener("click", async function() {
    const btn = document.getElementById("submitBtn");
    const phone = document.getElementById("phone").value.trim();
    const upi = document.getElementById("upi").value.trim();
    
    // Get Ref Code from URL
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
        // A. FIND CAMPAIGN ID
        // We use 'ilike' for case-insensitive matching
        const { data: campaignData, error: campErr } = await supabaseClient
            .from('campaigns')
            .select('id')
            .ilike('title', `%${CAMPAIGN_TITLE}%`) 
            .maybeSingle();
        
        if (campErr || !campaignData) throw new Error("Campaign not found");

        // B. FIND PROMOTER ID
        let promoterUuid = null;
        if (refCode) {
            const { data: acc } = await supabaseClient
                .from('accounts')
                .select('id')
                .eq('username', refCode.toUpperCase()) // Usernames are stored uppercase
                .eq('role', 'promoter')
                .maybeSingle();
            
            if (acc) {
                promoterUuid = acc.id;
            }
        }

        // C. INSERT LEAD
        const { error: insertError } = await supabaseClient
            .from('leads')
            .insert({
                campaign_id: campaignData.id,
                referred_by: promoterUuid, // Can be null if no ref code
                status: 'pending',
                // Store PII in metadata to keep table clean
                metadata: {
                    user_phone: phone,
                    user_upi: upi
                }
            });

        if (insertError) throw insertError;

        // D. SUCCESS
        document.getElementById("statusMsg").style.display = "block";
        btn.innerText = "Redirecting...";
        
        setTimeout(() => { 
            window.location.href = OFFER_LINK; 
        }, 1500);

    } catch (err) {
        console.error("Tracking Error:", err);
        // Fallback: Redirect anyway so user doesn't get stuck
        window.location.href = OFFER_LINK; 
    }
});