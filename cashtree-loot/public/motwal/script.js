// 1. CONFIGURATION
// Replace these with your actual URL and Anon Key from .env.local
const supabaseUrl = 'https://qzjvratinjirrcmgzjlx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6anZyYXRpbmppcnJjbWd6amx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMzAxMDksImV4cCI6MjA4MzgwNjEwOX0.W01Pmbokf20stTgkUsmI3TZahXYK4PPbU0v_2Ziy9YA'; 

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
const OFFER_LINK = "https://trkkcoin.com/IT3779ZXP1/JAM0MN?ln=English"; // Your Motwal Link

// 2. MAIN LOGIC
document.getElementById("submitBtn").addEventListener("click", async function() {
    const btn = this;
    const phone = document.getElementById("phone").value.trim();
    const upi = document.getElementById("upi").value.trim();
    
    // Get 'ref' from URL (e.g. ?ref=USER123)
    const refCode = new URLSearchParams(window.location.search).get('ref'); 

    // Basic Validation
    if(phone.length < 10) { alert("Please enter a valid phone number."); return; }

    btn.innerText = "Processing...";
    btn.disabled = true;

    try {
        // --- A. FIND CAMPAIGN ID ---
        // We look for the campaign named 'Motwal' to get its ID
        const { data: camp, error: e1 } = await supabaseClient
            .from('campaigns')
            .select('id')
            .ilike('title', '%Motwal%') // Case-insensitive search
            .maybeSingle();
        
        if (!camp) { throw new Error("Campaign 'Motwal' not found in Admin panel."); }

        // --- B. FIND PROMOTER ID ---
        let promoterUuid = null;
        if (refCode) {
            // We search the 'accounts' table now (not promoters)
            const { data: acc, error: e2 } = await supabaseClient
                .from('accounts')
                .select('id')
                .eq('username', refCode.toUpperCase()) // Usernames are uppercase in DB
                .eq('role', 'promoter')
                .maybeSingle();
            
            if (acc) {
                promoterUuid = acc.id;
                console.log("Referral valid:", refCode);
            } else {
                console.warn("Invalid referral code:", refCode);
            }
        }

        // --- C. SAVE LEAD ---
        const { error: e3 } = await supabaseClient
            .from('leads')
            .insert({
                campaign_id: camp.id,
                referred_by: promoterUuid, // This can be null if no ref found
                status: 'pending',
                // We save the user details in metadata to keep the table clean
                metadata: { 
                    user_phone: phone, 
                    user_upi: upi 
                }
            });

        if (e3) throw e3;

        // --- D. SUCCESS ---
        document.getElementById("statusMsg").style.display = "block";
        setTimeout(() => {
            window.location.href = OFFER_LINK;
        }, 1500);

    } catch (err) {
        console.error(err);
        alert("Error: " + err.message);
        btn.disabled = false;
        btn.innerText = "Submit & Download App";
    }
});