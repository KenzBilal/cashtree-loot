document.getElementById("submitBtn").addEventListener("click", async function() {
    const btn = document.getElementById("submitBtn");
    const phone = document.getElementById("phone").value.trim();
    const upi = document.getElementById("upi").value.trim();
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref'); 

    if (phone.length < 10) { alert("Invalid Phone"); return; }

    btn.innerText = "Processing...";
    btn.disabled = true;

    try {
        // 1. Get Campaign UUID
        const { data: campaignData } = await supabaseClient
            .from('campaigns')
            .select('id')
            .eq('title', 'Motwal') 
            .single();

        // 2. The Promoter UUID Lookup
        let promoterUuid = null;
        if (refCode) {
            // Search the 'username' column for the refCode from the URL
            const { data: pData, error: pErr } = await supabaseClient
                .from('promoters')
                .select('id')
                .eq('username', refCode)
                .maybeSingle();
            
            if (pData) {
                promoterUuid = pData.id; 
                console.log("✅ Promoter Match Found. UUID:", promoterUuid);
            } else {
                console.warn("❌ No promoter found with username:", refCode);
            }
        }

        // 3. Prepare the Lead Object
        const leadData = {
            phone: phone,
            upi_id: upi,
            campaign_id: campaignData ? campaignData.id : null,
            status: 'pending'
        };

        // ONLY attach user_id if we have a valid UUID to satisfy the Foreign Key
        if (promoterUuid) {
            leadData.user_id = promoterUuid;
        }

        // 4. Insert into 'leads'
        const { error: insertError } = await supabaseClient
            .from('leads')
            .insert([leadData]);

        if (insertError) {
            console.error("🔥 Database Insert Error:", insertError.message);
            alert("Save Failed: " + insertError.message);
            throw insertError;
        }

        // 5. Success Flow
        document.getElementById("statusMsg").style.display = "block";
        btn.style.display = "none";
        setTimeout(() => { window.location.href = OFFER_LINK; }, 1500);

    } catch (err) {
        console.error("Catch Block Error:", err);
        // We still redirect so you don't lose the user
        setTimeout(() => { window.location.href = OFFER_LINK; }, 3000);
    }
});