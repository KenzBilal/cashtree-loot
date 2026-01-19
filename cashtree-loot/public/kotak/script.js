// ==========================================
// 🚀 KOTAK 811 LEAD LOGIC (2-STEP SPLIT)
// ==========================================
const supabaseUrl = 'https://qzjvratinjirrcmgzjlx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6anZyYXRpbmppcnJjbWd6amx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMzAxMDksImV4cCI6MjA4MzgwNjEwOX0.W01Pmbokf20stTgkUsmI3TZahXYK4PPbU0v_2Ziy9YA'; 
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// Your Specific Kotak Link
const OFFER_LINK = "https://biitly.in/l/re76yb0u"; 

// --- UI HELPER: Unlock Upload Button when file is chosen ---
document.getElementById('screenshot').onchange = function() {
    if (this.files.length > 0) {
        document.getElementById('fileName').innerText = "✅ " + this.files[0].name;
        document.getElementById('fileLabel').style.borderColor = "#22c55e";
        
        // Unlock Step 2 Button
        const upBtn = document.getElementById('uploadBtn');
        upBtn.disabled = false;
        upBtn.style.opacity = "1";
        upBtn.style.cursor = "pointer";
    }
};

// ==========================================
// 👉 STEP 1: START TASK (Save Details & Redirect)
// ==========================================
document.getElementById("startBtn").addEventListener("click", async function() {
    const btn = this;
    const phone = document.getElementById("phone").value.trim();
    const upi = document.getElementById("upi").value.trim();
    const refCode = new URLSearchParams(window.location.search).get('ref'); 

    // 1. Validation
    if (phone.length < 10 || !upi.includes("@")) {
        return alert("⚠️ Please enter a valid Phone Number and UPI ID to start.");
    }

    btn.innerText = "System: Processing...";
    btn.disabled = true;

    try {
        // 2. Fetch Campaign ID
        const { data: camp } = await supabaseClient
            .from('campaigns')
            .select('id')
            .eq('title', 'Kotak 811')
            .maybeSingle();
        
        if (!camp) throw new Error("Campaign inactive or not found.");

        // 3. Get Promoter ID (if referral exists)
        let promoterUuid = null;
        if (refCode && refCode !== "DIRECT") {
            const { data: prom } = await supabaseClient
                .from('promoters')
                .select('id')
                .eq('username', refCode)
                .maybeSingle();
            if (prom) promoterUuid = prom.id;
        }

        // 4. Save "Clicked" Lead (No screenshot yet)
        const leadData = {
            phone: String(phone),
            upi_id: String(upi),
            campaign_id: camp.id,
            status: 'clicked', // Mark as started
            created_at: new Date().toISOString()
        };
        if (promoterUuid) leadData.user_id = promoterUuid;

        const { error } = await supabaseClient.from('leads').insert([leadData]);
        if (error) throw error;

        // 5. Redirect to Offer
        alert("✅ Details Saved! Opening Kotak 811...");
        window.open(OFFER_LINK, '_blank'); // Opens in new tab
        
        btn.innerText = "Task Started";
        // We do NOT re-enable the button to prevent double-clicks

    } catch (err) {
        alert("❌ Error: " + err.message);
        console.error(err);
        btn.innerText = "👉 Step 1: Submit Details & Start Task";
        btn.disabled = false;
    }
});

// ==========================================
// ✅ STEP 2: UPLOAD PROOF (Update Lead)
// ==========================================
document.getElementById("uploadBtn").addEventListener("click", async function() {
    const btn = this;
    const phone = document.getElementById("phone").value.trim();
    const fileInput = document.getElementById("screenshot");

    // 1. Validation
    if (!phone || fileInput.files.length === 0) {
        return alert("⚠️ Please enter the SAME Phone Number you used in Step 1 and select a Screenshot.");
    }

    btn.innerText = "System: Uploading Proof...";
    btn.disabled = true;

    try {
        // 2. Upload Image to Storage
        const file = fileInput.files[0];
        const fileName = `proof_${Date.now()}_${phone}.${file.name.split('.').pop()}`;
        const filePath = `payout-proofs/${fileName}`;

        const { error: uploadError } = await supabaseClient
            .storage.from('campaign-proofs')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabaseClient.storage.from('campaign-proofs').getPublicUrl(filePath);
        const screenshotUrl = urlData.publicUrl;

        // 3. Find Campaign ID again (for safety)
        const { data: camp } = await supabaseClient.from('campaigns').select('id').eq('title', 'Kotak 811').single();

        // 4. Update the Existing Lead
        // We find the row where phone matches AND campaign matches
        const { error: updateError } = await supabaseClient
            .from('leads')
            .update({ 
                screenshot_url: screenshotUrl,
                status: 'pending', // Change status to pending for admin review
                created_at: new Date().toISOString() // Update time so it appears at top of list
            })
            .eq('phone', String(phone))
            .eq('campaign_id', camp.id);

        if (updateError) throw updateError;

        // 5. Success
        alert("🎉 SUCCESS! Proof uploaded. Your payment will be processed within 24 hours.");
        location.reload(); // Refresh page to clear form

    } catch (err) {
        alert("❌ Upload Failed: " + err.message);
        console.error(err);
        btn.innerText = "✅ Submit Proof & Finish";
        btn.disabled = false;
    }
});