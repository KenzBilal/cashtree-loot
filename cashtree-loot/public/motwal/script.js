const supabaseUrl = 'https://qzjvratinjirrcmgzjlx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6anZyYXRpbmppcnJjbWd6amx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMzAxMDksImV4cCI6MjA4MzgwNjEwOX0.W01Pmbokf20stTgkUsmI3TZahXYK4PPbU0v_2Ziy9YA'; 
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
const OFFER_LINK = "https://trkkcoin.com/IT3779ZXP1/JAM0MN?ln=English";

document.getElementById("submitBtn").addEventListener("click", async function() {
    const btn = this;
    const phone = document.getElementById("phone").value.trim();
    const upi = document.getElementById("upi").value.trim();
    const refCode = new URLSearchParams(window.location.search).get('ref'); 

    btn.innerText = "Step 1: Checking...";
    btn.disabled = true;

    try {
        // --- STEP 1: CAMPAIGN ---
        const { data: camp, error: e1 } = await supabaseClient
            .from('campaigns').select('id').eq('title', 'Motwal').maybeSingle();
        
        if (!camp) { alert("❌ Error: Could not find 'Motwal' in Campaigns table!"); return; }
        btn.innerText = "Step 2: Promoter...";

        // --- STEP 2: PROMOTER ---
        let promoterId = null;
        if (refCode) {
            const { data: prom, error: e2 } = await supabaseClient
                .from('promoters').select('id').eq('username', refCode).maybeSingle();
            
            if (prom) {
                promoterId = prom.id;
                console.log("Found Promoter:", promoterId);
            } else {
                alert("⚠️ Warning: Promoter '" + refCode + "' not found. Saving as direct lead.");
            }
        }
        btn.innerText = "Step 3: Saving...";

        // --- STEP 3: INSERT ---
        const leadData = {
            phone: phone,
            upi_id: upi,
            campaign_id: camp.id,
            status: 'pending',
            user_id: promoterId // This will be null if no promoter found
        };

        const { error: e3 } = await supabaseClient.from('leads').insert([leadData]);

        if (e3) {
            alert("❌ Database Error: " + e3.message);
            console.error(e3);
        } else {
            alert("✅ SUCCESS! Lead saved. Redirecting now...");
            window.location.href = OFFER_LINK;
        }

    } catch (err) {
        alert("❌ Script Crashed: " + err.message);
    } finally {
        btn.disabled = false;
        btn.innerText = "Submit & Download";
    }
});