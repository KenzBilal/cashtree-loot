// ==========================================
// 🚀 KOTAK 811 LEAD LOGIC (FINAL BOSS)
// ==========================================
const supabaseUrl = 'https://qzjvratinjirrcmgzjlx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6anZyYXRpbmppcnJjbWd6amx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMzAxMDksImV4cCI6MjA4MzgwNjEwOX0.W01Pmbokf20stTgkUsmI3TZahXYK4PPbU0v_2Ziy9YA'; 
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// Your Kotak Affiliate Link
const OFFER_LINK = "https://cgrj.in/c/rnf6yrzd"; 

// Update File Name UI on selection
document.getElementById('screenshot').onchange = function() {
    if (this.files.length > 0) {
        document.getElementById('fileName').innerText = "✅ " + this.files[0].name;
        document.getElementById('fileLabel').style.borderColor = "#22c55e";
    }
};

document.getElementById("submitBtn").addEventListener("click", async function() {
    const btn = this;
    const phone = document.getElementById("phone").value.trim();
    const upi = document.getElementById("upi").value.trim();
    const fileInput = document.getElementById("screenshot");
    const refCode = new URLSearchParams(window.location.search).get('ref'); 

    // 1. Validation
    if(!phone || !upi || fileInput.files.length === 0) {
        alert("❌ Error: All fields + Screenshot are required!");
        return;
    }

    btn.innerText = "System: Syncing Data...";
    btn.disabled = true;

    try {
        // --- STEP 1: FETCH CAMPAIGN ID ---
        const { data: camp, error: e1 } = await supabaseClient
            .from('campaigns')
            .select('id')
            .eq('title', 'Kotak 811') 
            .maybeSingle();
        
        if (!camp) throw new Error("Kotak 811 campaign not found in database!");

        // --- STEP 2: UPLOAD SCREENSHOT ---
        btn.innerText = "System: Uploading Proof...";
        const file = fileInput.files[0];
        const fileName = `proof_${Date.now()}_${phone}.${file.name.split('.').pop()}`;
        const filePath = `payout-proofs/${fileName}`; // Ensure bucket folder is correct

        const { error: uploadError } = await supabaseClient
            .storage.from('campaign-proofs')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabaseClient.storage.from('campaign-proofs').getPublicUrl(filePath);
        const screenshotUrl = urlData.publicUrl;

        // --- STEP 3: GET PROMOTER ID (FK SAFE) ---
        let promoterUuid = null;
        if (refCode && refCode !== "DIRECT") {
            const { data: prom } = await supabaseClient
                .from('promoters')
                .select('id')
                .eq('username', refCode)
                .maybeSingle();
            
            if (prom) promoterUuid = prom.id;
        }

        // --- STEP 4: PREPARE DATA OBJECT ---
        const leadData = {
            phone: String(phone),
            upi_id: String(upi),
            campaign_id: camp.id,
            screenshot_url: screenshotUrl,
            status: 'pending',
            created_at: new Date().toISOString()
        };

        // Only attach user_id if valid UUID exists
        if (promoterUuid) {
            leadData.user_id = promoterUuid;
        }

        // --- STEP 5: SAVE LEAD ---
        btn.innerText = "System: Finalizing...";
        const { error: dbError } = await supabaseClient.from('leads').insert([leadData]);

        if (dbError) throw dbError;

        // --- STEP 6: SUCCESS ---
        alert("✅ PROOF RECEIVED! Redirecting to Kotak...");
        window.location.href = OFFER_LINK;

    } catch (err) {
        alert("❌ Access Denied: " + err.message);
        console.error(err);
    } finally {
        btn.disabled = false;
        btn.innerText = "Submit & Start Task";
    }
});