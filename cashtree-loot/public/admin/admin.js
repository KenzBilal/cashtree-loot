// =========================================
// 🎨 UI GOD ENGINE (Visual Override)
// =========================================
const ui = {
    // 1. TOAST NOTIFICATION (Non-blocking)
    toast: (msg, type = 'neutral') => {
        const container = document.getElementById('toast-container');
        const box = document.createElement('div');
        
        // Color Logic
        const colors = {
            success: 'border-green-500 bg-green-500/10 text-green-400',
            error: 'border-red-500 bg-red-500/10 text-red-400',
            neutral: 'border-blue-500 bg-blue-500/10 text-blue-400'
        };
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-triangle',
            neutral: 'fa-info-circle'
        };

        box.className = `pointer-events-auto flex items-center gap-3 px-6 py-4 rounded-xl border-l-4 backdrop-blur-md shadow-xl translate-x-10 opacity-0 transition-all duration-300 ${colors[type] || colors.neutral}`;
        box.innerHTML = `
            <i class="fas ${icons[type]} text-xl"></i>
            <span class="font-bold text-sm text-white">${msg}</span>
        `;

        container.appendChild(box);

        // Animate In
        setTimeout(() => box.classList.remove('translate-x-10', 'opacity-0'), 10);

        // Animate Out & Remove
        setTimeout(() => {
            box.classList.add('translate-x-10', 'opacity-0');
            setTimeout(() => box.remove(), 300);
        }, 3000);
    },

    // 2. CUSTOM ALERT (Promise-based)
    alert: (title, msg) => {
        return new Promise((resolve) => {
            ui._showModal(title, msg, 'info', [
                { text: 'ACKNOWLEDGED', class: 'col-span-2 bg-white text-black hover:bg-slate-200', click: resolve }
            ]);
        });
    },

    // 3. CUSTOM CONFIRM (Promise-based)
    // Usage: if (await ui.confirm('Title', 'Msg')) { ... }
    confirm: (title, msg, type = 'danger') => {
        return new Promise((resolve) => {
            const confirmBtnClass = type === 'danger' 
                ? 'bg-red-600 text-white hover:bg-red-500 shadow-red-900/50' 
                : 'bg-green-600 text-black hover:bg-green-500 shadow-green-900/50';

            ui._showModal(title, msg, type, [
                { text: 'CANCEL', class: 'bg-white/5 text-slate-400 hover:bg-white/10', click: () => resolve(false) },
                { text: 'CONFIRM', class: `${confirmBtnClass} shadow-lg`, click: () => resolve(true) }
            ]);
        });
    },

    // INTERNAL HELPER (Do not call directly)
    _showModal: (title, msg, type, buttons) => {
        const overlay = document.getElementById('ui-modal-overlay');
        const box = document.getElementById('ui-modal-box');
        const titleEl = document.getElementById('ui-title');
        const msgEl = document.getElementById('ui-msg');
        const iconEl = document.getElementById('ui-icon');
        const actionsEl = document.getElementById('ui-actions');

        // Set Content
        titleEl.innerText = title;
        msgEl.innerText = msg;
        actionsEl.innerHTML = '';

        // Set Icon
        const icons = { info: '✨', danger: '⚠️', success: '🚀' };
        iconEl.innerText = icons[type] || '✨';

        // Create Buttons
        buttons.forEach(btn => {
            const b = document.createElement('button');
            b.className = `py-3 rounded-xl font-black text-[10px] tracking-widest transition-all ${btn.class}`;
            b.innerText = btn.text;
            b.onclick = () => {
                ui._closeModal();
                btn.click();
            };
            actionsEl.appendChild(b);
        });

        // Show
        overlay.classList.remove('hidden');
        setTimeout(() => {
            overlay.classList.remove('opacity-0');
            box.classList.remove('scale-90');
            box.classList.add('scale-100');
        }, 10);
    },

    _closeModal: () => {
        const overlay = document.getElementById('ui-modal-overlay');
        const box = document.getElementById('ui-modal-box');
        
        overlay.classList.add('opacity-0');
        box.classList.remove('scale-100');
        box.classList.add('scale-90');
        
        setTimeout(() => overlay.classList.add('hidden'), 300);
    }
};

// OVERRIDE BROWSER DEFAULTS (Optional, but recommended)
window.alert = (msg) => ui.alert("System Notice", msg);

// =========================================
// 1. SUPABASE CONNECTION CORE
// =========================================
let db; 

// 1. Initialize Supabase with Safety Checks
try {
    const supabaseUrl = 'https://qzjvratinjirrcmgzjlx.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6anZyYXRpbmppcnJjbWd6amx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMzAxMDksImV4cCI6MjA4MzgwNjEwOX0.W01Pmbokf20stTgkUsmI3TZahXYK4PPbU0v_2Ziy9YA';

    // CHECK: Does the library exist?
    if (typeof window.supabase === 'undefined') {
        throw new Error("Supabase SDK not loaded. Check your HTML <script> tag.");
    }

    // CHECK: Singleton Pattern (Don't create 2 connections)
    if (!window.supabaseInstance) {
        window.supabaseInstance = window.supabase.createClient(supabaseUrl, supabaseKey);
    }

    db = window.supabaseInstance;
    console.log("✅ SYSTEM SECURE: Database Handshake Successful");

} catch (err) {
    console.error("❌ CRITICAL: Database Link Failure", err);
    alert("System Error: Database connection failed. Please refresh.");
}
// =========================================
// 2. VAULT SECURITY PROTOCOLS
// =========================================
function checkAuth() {
    // 1. SAFE ELEMENT SELECTION
    const keyInput = document.getElementById("masterKey");
    const btn = document.querySelector(".unlock-btn");
    const modal = document.getElementById("loginModal");

    // CHECK: Do elements exist? (Prevents silent console crash)
    if (!keyInput || !btn || !modal) {
        console.error("❌ DOM CRASH: Login elements not found. Check HTML IDs.");
        return;
    }

    const key = keyInput.value.trim();

    // 2. EMPTY CHECK
    if (!key) {
        alert("⚠️ Input Required: Enter Master Key.");
        keyInput.focus();
        return;
    }

    // 3. SOVEREIGN AUTHENTICATION
    if(key === "znek7906") {
        // UI FEEDBACK: Lock button to prevent double-click
        btn.disabled = true;
        btn.innerHTML = `<i class="fas fa-sync fa-spin mr-2"></i> DECRYPTING...`;

        setTimeout(() => {
            modal.classList.add("hidden");
            
            // 4. SAFE DASHBOARD LAUNCH
            // We check if the next function exists before running it
            if (typeof initDashboard === 'function') {
                initDashboard();
            } else {
                console.error("❌ CRITICAL: initDashboard() is missing or undefined.");
                alert("Login successful, but Dashboard failed to load.");
                // Unlock button in case of error so they can try again if needed
                btn.disabled = false;
                btn.innerHTML = "UNLOCK GOD MODE";
            }
        }, 800);

    } else {
        // 5. SECURITY ALERT
        alert("❌ ACCESS DENIED: Identity Verification Failed");
        keyInput.value = "";
        keyInput.focus(); // Reset cursor for quick retry
    }
}

// 6. ENTER KEY SUPPORT (Quality of Life)
document.getElementById("masterKey")?.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        checkAuth();
    }
});

function showSection(id) {
    // 1. INPUT VALIDATION
    if (!id || typeof id !== 'string') {
        console.error("❌ Navigation Error: Invalid ID passed to showSection()");
        return;
    }

    const targetSection = document.getElementById(id);

    // 2. SAFETY CHECK: Does the section actually exist?
    // This prevents the script from crashing if you make a typo in HTML
    if (!targetSection) {
        console.warn(`⚠️ System Warning: Section '#${id}' not found in DOM.`);
        return;
    }

    // 3. RESET: Hide all sections
    document.querySelectorAll('.section').forEach(el => {
        el.classList.add('hidden');
    });

    // 4. ACTIVATE: Show the target
    targetSection.classList.remove('hidden');

    // 5. NAVIGATION UI SYNC
    // Remove 'active' class from all buttons
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('active');
    });

    // Highlight the button that was clicked (if it exists)
    const activeNav = document.getElementById('nav-' + id);
    if (activeNav) {
        activeNav.classList.add('active');
    }
}

// =========================================
// 3. CORE INITIALIZATION (HEARTBEAT)
// =========================================
async function initDashboard() {
    console.log("🛰️ INITIALIZING COMMAND CENTER...");

    // 1. SYSTEM CHECK: Does DB exist?
    if (!db) {
        console.error("❌ FATAL: Database connection lost before init.");
        alert("System Error: Database not connected.");
        return;
    }

    try {
        // 2. PARALLEL LOADING (With Crash Protection)
        // We use allSettled so one failure doesn't kill the whole dashboard
        const results = await Promise.allSettled([
            loadStats(),
            loadCampaigns(),
            loadLeads(),
            loadPayouts(),
            loadSystemConfig(),
            updatePendingBadge()
        ]);

        // 3. ERROR REPORTING
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                const functions = ['Stats', 'Campaigns', 'Leads', 'Payouts', 'Config', 'Badges'];
                console.error(`⚠️ Module Failed: ${functions[index]}`, result.reason);
            }
        });

        console.log("✅ DASHBOARD ONLINE: All modules synchronized.");

        // 4. HEARTBEAT (The Pulse)
        // We set this ONLY after successful load to avoid "death loops"
        setInterval(() => {
            // Silent background refresh
            Promise.allSettled([
                loadStats(),
                loadLeads(),
                updatePendingBadge()
            ]).catch(e => console.warn("Heartbeat Skip:", e));
        }, 30000); // 30 Seconds

    } catch (err) {
        console.error("❌ DASHBOARD CRASH:", err);
        alert("Critical Error: Dashboard failed to initialize. Check console.");
    }
}

async function updatePendingBadge() {
    // 1. SAFETY CHECK
    if (!db) return; // Silent exit if DB isn't ready

    try {
        // 2. EFFICIENT QUERY
        // We use { head: true } so we don't download the actual data, just the count.
        // This saves massive bandwidth.
        const { count, error } = await db
            .from('leads')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending');

        if (error) {
            console.warn("⚠️ Badge Sync Failed:", error.message);
            return;
        }

        // 3. UI UPDATE
        const badge = document.getElementById('navPendingBadge');
        
        // Only try to update if the element actually exists in HTML
        if (badge) {
            if (count > 0) {
                // Formatting: If over 99, show '99+'
                badge.innerText = count > 99 ? '99+' : count;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }

    } catch (err) {
        // We use console.warn instead of error so it doesn't clutter the logs
        // since this runs every 30 seconds.
        console.warn("Badge Update Error:", err);
    }
}
// =========================================
// 4. CAMPAIGN LAB (DEPLOYMENT)
// =========================================
async function loadCampaigns() {
    // 1. DATABASE SAFETY
    if (!db) return;

    try {
        // 2. FETCH DATA
        const { data: camps, error } = await db
            .from('campaigns')
            .select('*')
            .order('id', { ascending: false });

        if (error) {
            console.error("❌ Campaign Sync Failed:", error.message);
            return;
        }

        const grid = document.getElementById("campaignGrid");
        if (!grid) return;
        grid.innerHTML = ""; 

        if (!camps || camps.length === 0) {
            grid.innerHTML = `<div class="col-span-full text-center py-10 opacity-50"><p>No Campaigns Found</p></div>`;
            return;
        }

        camps.forEach(c => {
            const destLink = c.target_url || '#'; 
            const payoutVal = c.payout_amount || 0;
            const userReward = c.user_reward || 0; // <--- NEW: Get User Cashback
            const imgUrl = c.image_url || 'https://placehold.co/50';

            const card = document.createElement("div");
            card.className = `glass-panel p-6 rounded-2xl border transition-all hover:bg-white/5 ${c.is_active ? 'border-green-500/30' : 'border-white/5 opacity-75'}`;
            
            card.innerHTML = `
                <div class="flex justify-between items-start mb-4">
                    <img src="${imgUrl}" class="w-14 h-14 rounded-xl bg-black/40 object-cover" onerror="this.src='https://via.placeholder.com/50'">
                    
                    <button onclick="toggleCampaign(${c.id}, ${!c.is_active})" 
                            class="transition-colors p-2 rounded-lg hover:bg-white/10 ${c.is_active ? 'text-green-400' : 'text-slate-600'}">
                        <i class="fas fa-power-off text-xl"></i>
                    </button>
                </div>

                <h3 class="font-black text-white text-lg tracking-tight mb-1">${c.title}</h3>
                
                <div class="flex items-center gap-2 mb-4">
                     <span class="text-[10px] bg-white/5 px-2 py-1 rounded text-slate-400 font-mono truncate max-w-[150px]">
                        ${destLink}
                     </span>
                </div>

                <div class="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                    <div class="flex flex-col">
                        <span class="text-[10px] uppercase text-slate-500 font-bold">Promoter / User</span>
                        <div>
                            <span class="text-green-400 font-black text-xl">₹${payoutVal}</span>
                            <span class="text-slate-600 mx-1">/</span>
                            <span class="text-yellow-500 font-bold text-sm">₹${userReward}</span>
                        </div>
                    </div>
                    
                    <button onclick="openEditModal(${c.id}, '${c.title.replace(/'/g, "\\'")}', ${payoutVal}, ${userReward})" 
                            class="text-slate-400 hover:text-white transition p-2 hover:bg-white/10 rounded-lg">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            `;
            grid.appendChild(card);
        });

    } catch (err) {
        console.error("❌ CRITICAL: LoadCampaigns Crashed", err);
    }
}
   
// 1. UI TOGGLE (Safe Version)
function toggleCreateCampaign() {
    const form = document.getElementById("createCampaignForm");
    if (form) {
        form.classList.toggle("hidden");
        // Quality of Life: Focus on the title input when opening
        if (!form.classList.contains("hidden")) {
            document.getElementById("newCampTitle")?.focus();
        }
    } else {
        console.warn("⚠️ UI Error: Create Form not found in DOM.");
    }
}

// 2. SOVEREIGN DEPLOYMENT FUNCTION
// 2. SOVEREIGN DEPLOYMENT FUNCTION
async function createNewCampaign() {
    // A. SYSTEM CHECK
    if (!db) {
        alert("System Error: Database not connected.");
        return;
    }

    // B. SAFE ELEMENT SELECTION
    const titleInput = document.getElementById("newCampTitle");
    const payoutInput = document.getElementById("newCampPayout");
    const userRewardInput = document.getElementById("newCampUserReward"); // <--- NEW INPUT
    const urlInput = document.getElementById("newCampUrl");
    const imgInput = document.getElementById("newCampImg");
    const submitBtn = document.querySelector("#createCampaignForm button"); 

    // C. INPUT CAPTURE
    const title = titleInput?.value.trim();
    const payout = payoutInput?.value.trim();
    const userReward = userRewardInput?.value.trim(); // <--- NEW VALUE
    const url = urlInput?.value.trim();
    const img = imgInput?.value.trim();

    // D. STRICT VALIDATION
    if (!title || !payout || !url) {
        alert("⚠️ Validation Error: Title, Payout, and URL are required.");
        return;
    }

    if (isNaN(payout) || Number(payout) <= 0) {
        alert("⚠️ Validation Error: Payout must be a valid number greater than 0.");
        return;
    }

    // E. LOCK UI (Prevent Double-Submission)
    const originalText = submitBtn ? submitBtn.innerText : "Deploy";
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fas fa-rocket fa-bounce mr-2"></i> DEPLOYING...`;
    }

    try {
        const { error } = await db.from('campaigns').insert([{ 
            title: title, 
            payout_amount: parseInt(payout), 
            user_reward: parseInt(userReward) || 0, // <--- SAVING IT
            target_url: url,  
            image_url: img || null, 
            is_active: true 
        }]);

        if (error) throw error;

        // G. SUCCESS PROTOCOL
        alert("🚀 CAMPAIGN DEPLOYED: System Updated.");
        
        // Reset Form
        titleInput.value = "";
        payoutInput.value = "";
        if (userRewardInput) userRewardInput.value = ""; // Reset new input
        urlInput.value = "";
        if (imgInput) imgInput.value = "";
        
        // Close UI & Refresh Grid
        toggleCreateCampaign();
        
        if (typeof loadCampaigns === 'function') {
            loadCampaigns(); 
        }

    } catch (err) {
        console.error("❌ DEPLOYMENT FAILED:", err);
        alert("Error: " + err.message);
    } finally {
        // H. RESTORE UI
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = originalText;
        }
    }
}

async function toggleCampaign(id, status) {
    await db.from('campaigns').update({ is_active: status }).eq('id', id);
    loadCampaigns();
}

// This opens your custom Glassmorphic box
function openEditModal(id, currentTitle, currentPayout) {
    // 1. SAFETY CHECK (Prevents console errors if HTML is missing)
    const modal = document.getElementById('editModal');
    const titleLabel = document.getElementById('editCampTitle');
    const payoutInput = document.getElementById('editCampPayout');

    if (!modal || !payoutInput) {
        console.error("❌ Edit Modal elements missing!");
        return;
    }

    // 2. SHOW MODAL
    modal.classList.remove('hidden');
    modal.style.display = 'flex';

    // 3. FILL DATA
    if (titleLabel) titleLabel.innerText = currentTitle;
    payoutInput.value = currentPayout;
    
    // Auto-focus so you can type immediately
    payoutInput.focus();

    // 4. SET GLOBAL ID
    window.currentEditingId = id;
}

async function saveCampaignUpdate() {
    // 1. SAFETY CHECKS
    if (!window.currentEditingId) {
        console.error("❌ System Error: No Campaign ID selected for edit.");
        return;
    }

    const payoutInput = document.getElementById('editCampPayout');
    const userRewardInput = document.getElementById('editCampUserReward'); // <--- NEW
    
    const saveBtn = document.querySelector("#editModal button.bg-green-600"); 

    const newPayout = payoutInput.value.trim();
    const newUserReward = userRewardInput ? userRewardInput.value.trim() : "0";

    // 2. VALIDATION
    if (!newPayout || isNaN(newPayout) || Number(newPayout) < 0) {
        alert("⚠️ Invalid Input: Payout must be a positive number.");
        return;
    }

    // 3. LOCK UI
    const originalText = saveBtn ? saveBtn.innerText : "Save Changes";
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = `<i class="fas fa-sync fa-spin mr-2"></i> SYNCING...`;
    }

    try {
        // 4. DATABASE UPDATE
        const { error } = await db
            .from('campaigns')
            .update({ 
                payout_amount: parseInt(newPayout),
                user_reward: parseInt(newUserReward) // <--- SAVING IT
            })
            .eq('id', window.currentEditingId);

        if (error) throw error;

        // 5. SUCCESS PROTOCOL
        console.log("✅ SYSTEM LAWS SYNCHRONIZED.");
        alert("✅ Update Successful: Payout & Cashback modified.");
        
        closeEditModal();
        
        // Refresh grid to show new price immediately
        if (typeof loadCampaigns === 'function') {
            loadCampaigns(); 
        }

    } catch (err) {
        console.error("❌ Edit Failed:", err);
        alert("Error: " + err.message);
    } finally {
        // 6. CLEANUP
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerText = originalText;
        }
        window.currentEditingId = null;
    }
}

// This opens your custom Glassmorphic box
// UPDATED: Accepts currentUserReward
function openEditModal(id, currentTitle, currentPayout, currentUserReward) {
    // 1. SAFETY CHECK (Prevents console errors if HTML is missing)
    const modal = document.getElementById('editModal');
    const titleLabel = document.getElementById('editCampTitle');
    const payoutInput = document.getElementById('editCampPayout');
    const userRewardInput = document.getElementById('editCampUserReward'); // <--- NEW

    if (!modal || !payoutInput) {
        console.error("❌ Edit Modal elements missing!");
        return;
    }

    // 2. SHOW MODAL
    modal.classList.remove('hidden');
    modal.style.display = 'flex';

    // 3. FILL DATA
    if (titleLabel) titleLabel.innerText = currentTitle;
    payoutInput.value = currentPayout;
    
    // Fill User Reward (Default to 0 if undefined)
    if (userRewardInput) {
        userRewardInput.value = currentUserReward || 0;
    }
    
    // Auto-focus so you can type immediately
    payoutInput.focus();

    // 4. SET GLOBAL ID
    window.currentEditingId = id;
}


// =========================================
// 5. APPROVAL PROTOCOL (PASSIVE INCOME LOGIC)
// =========================================
async function loadLeads() {
    // 1. FETCH DATA (Simple Query First)
    const { data: leads, error } = await db
        .from('leads')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

    if (error) return console.error("❌ Leads Load Error:", error.message);

    const tbody = document.getElementById("leadsTableBody");
    const noLeadsMsg = document.getElementById("noLeadsMsg");
    const badge = document.getElementById("navPendingBadge");

    // 2. EMPTY STATE HANDLING
    if (!leads || leads.length === 0) {
        if (tbody) tbody.innerHTML = "";
        if (noLeadsMsg) noLeadsMsg.classList.remove("hidden");
        if (badge) badge.classList.add("hidden");
        return;
    }

    // 3. UPDATE NOTIFICATION BADGE
    if (noLeadsMsg) noLeadsMsg.classList.add("hidden");
    if (badge) {
        badge.innerText = leads.length;
        badge.classList.remove("hidden");
    }

    // 4. SMART MAPPING (The "No-Crash" Strategy)
    // Get unique IDs only. Filter out nulls to prevent DB errors.
    const campaignIds = [...new Set(leads.map(l => l.campaign_id).filter(id => id))];
    const userIds = [...new Set(leads.map(l => l.user_id).filter(id => id))];

    // Fetch Names Separately
    const { data: campaigns } = await db.from('campaigns').select('id, title, payout_amount').in('id', campaignIds);
    const { data: promoters } = await db.from('promoters').select('id, username, full_name').in('id', userIds);

    // Create Lookup Maps (O(1) Speed)
    const campMap = {};
    if (campaigns) campaigns.forEach(c => campMap[c.id] = c);

    const promMap = {};
    if (promoters) promoters.forEach(p => promMap[p.id] = p);

    // 5. RENDER ROWS
    if (tbody) {
        tbody.innerHTML = "";
        leads.forEach(lead => {
            const row = document.createElement("tr");
            row.className = "border-b border-white/5 hover:bg-white/[0.02] transition";
            
            // A. Resolve Campaign
            const camp = campMap[lead.campaign_id] || { title: 'Unknown Campaign', payout_amount: 0 };
            
            // B. Resolve User (Handle Direct Visitors)
            let userName = '<span class="text-slate-500 italic">Direct Visitor</span>';
            let fullName = 'No Promoter';
            
            // If we have a user ID and found them in the map
            if (lead.user_id && promMap[lead.user_id]) {
                userName = promMap[lead.user_id].username;
                fullName = promMap[lead.user_id].full_name;
            }

            // C. Screenshot Link Logic
            const proofLink = lead.screenshot_url 
                ? `<a href="${lead.screenshot_url}" target="_blank" class="text-blue-400 text-[10px] font-bold underline ml-2 hover:text-blue-300">VIEW PROOF ↗</a>` 
                : '<span class="text-red-500 text-[10px]">No Proof</span>';

            // D. Render HTML
            row.innerHTML = `
                <td class="p-6 text-slate-400 text-xs">
                    ${new Date(lead.created_at).toLocaleDateString()}
                    <div class="text-[10px] opacity-50 font-mono">${new Date(lead.created_at).toLocaleTimeString()}</div>
                </td>
                <td class="p-6 font-bold text-white tracking-wide">${camp.title}</td>
                <td class="p-6">
                    <div class="font-black text-white text-sm">${userName}</div>
                    <div class="text-[10px] text-slate-500 font-bold uppercase">${fullName}</div>
                </td>
                <td class="p-6">
                    <div class="text-green-400 font-mono text-xs font-bold">${lead.phone}</div>
                    <div class="text-[10px] text-slate-500 font-bold">UPI: <span class="text-slate-300">${lead.upi_id}</span></div>
                    ${proofLink}
                </td>
                <td class="p-6 text-center flex gap-2 justify-center">
                    <button onclick="approveLead('${lead.id}', '${lead.user_id}', ${camp.payout_amount})" 
                            class="bg-green-600 text-black font-black px-4 py-2 rounded-lg text-[10px] hover:scale-105 hover:bg-green-500 transition shadow-lg shadow-green-900/20">
                        PAY ₹${camp.payout_amount}
                    </button>
                    <button onclick="rejectLead('${lead.id}')" 
                            class="bg-white/5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 px-3 py-2 rounded-lg text-[10px] font-bold transition border border-transparent hover:border-red-500/30">
                        REJECT
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
}

async function approveLead(leadId, promoterId, amount) {
    // 1. CUSTOM GLASS CONFIRMATION (Matches Reject Logic)
    const confirmed = await ui.confirm(
        "AUTHORIZE PAYOUT?", 
        `You are about to credit ₹${amount} to this promoter.\n\nThis action cannot be undone. Proceed?`,
        "success" // Green styling
    );

    if (!confirmed) return;

    // Find button for loading state
    // Note: Since we use a modal, 'document.activeElement' might be the modal button
    // So we skip the button loading state here to keep it clean, 
    // or we'd need to pass the button element into the function.
    
    try {
        // 2. CHECK STATUS (Race Condition)
        const { data: leadStatus } = await db.from('leads').select('status').eq('id', leadId).single();
        if (leadStatus.status === 'approved') {
            ui.toast("❌ STOP: Lead already approved!", "error");
            return;
        }

        // 3. FETCH USER
        const { data: user, error: userError } = await db.from('promoters').select('wallet_balance, referred_by').eq('id', promoterId).single();
        if (userError || !user) throw new Error("Promoter wallet not found.");

        // 4. CALC BALANCE
        const payout = parseFloat(amount);
        const newBalance = (parseFloat(user.wallet_balance) || 0) + payout;

        // 5. PAY USER
        const { error: payError } = await db.from('promoters').update({ wallet_balance: newBalance }).eq('id', promoterId);
        if (payError) throw new Error("Payment Transaction Failed.");

        // 6. REFERRAL BONUS (10%)
        if (user.referred_by) {
            const bonus = payout * 0.10;
            const { data: boss } = await db.from('promoters').select('wallet_balance, referral_earnings').eq('id', user.referred_by).single();
            if (boss) {
                await db.from('promoters').update({ 
                    wallet_balance: (boss.wallet_balance || 0) + bonus,
                    referral_earnings: (boss.referral_earnings || 0) + bonus 
                }).eq('id', user.referred_by);
                console.log(`✅ Passive Income: ₹${bonus} sent.`);
            }
        }

        // 7. CLOSE LEAD
        const { error: closeError } = await db.from('leads').update({ status: 'approved' }).eq('id', leadId);
        if (closeError) console.error("⚠️ Close Status Failed");

        // 8. SUCCESS TOAST
        ui.toast(`✅ ₹${payout} Credited Successfully`, "success");

        // Refresh Tables
        loadLeads();
        if (typeof loadStats === 'function') loadStats();

    } catch (err) {
        console.error("❌ FAILURE:", err);
        ui.toast("Transaction Failed: " + err.message, "error");
    }
}
// =========================================
//  REJECT LOGIC (Must be present!)
// =========================================
async function rejectLead(leadId) {
    // 1. CUSTOM GLASS CONFIRMATION
    // We use 'await' so the code pauses until they click a button in the modal
    const confirmed = await ui.confirm(
        "REJECT SUBMISSION?", 
        "This will permanently mark the task as failed. The user will receive ₹0.\n\nAre you sure you want to proceed?",
        "danger" // Triggers Red styling
    );

    // If they clicked "CANCEL", we stop immediately
    if (!confirmed) return;

    try {
        // 2. DATABASE UPDATE
        const { error } = await db
            .from('leads')
            .update({ status: 'rejected' })
            .eq('id', leadId);

        if (error) throw error;

        // 3. SUCCESS FEEDBACK
        // Shows a beautiful notification in the top right
        ui.toast("🚫 Task Rejected Successfully", "success");

        // 4. REFRESH DASHBOARD
        // Instantly remove the row and update stats
        loadLeads(); 
        if (typeof loadStats === 'function') loadStats();

    } catch (err) {
        console.error("Reject Error:", err);
        ui.toast("❌ Error: " + err.message, "error");
    }
}

// =========================================
// 6. SETTLEMENTS (PAYOUTS)
// =========================================
async function loadPayouts() {
    if (!db) return;

    try {
        // Fetch users with money
        const { data: users, error } = await db
            .from('promoters')
            .select('*')
            .gt('wallet_balance', 0)
            .order('wallet_balance', { ascending: false });

        if (error) return console.error("Payout Sync Failed:", error);

        const tbody = document.getElementById("payoutTableBody");
        if (!tbody) return;

        tbody.innerHTML = "";

        if (!users || users.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="p-8 text-center text-slate-600 font-mono text-xs uppercase">All Settlements Complete</td></tr>`;
            return;
        }

        users.forEach(u => {
            const row = document.createElement("tr");
            row.className = "border-b border-white/5 hover:bg-white/[0.02] transition-colors";
            
            const safeUpi = u.upi_id ? u.upi_id.replace(/'/g, "\\'") : '';
            const safeId = u.id;
            
            // 🟢 LOGIC: Check the Signal
            const isRequested = u.withdrawal_requested === true;

            // 🎨 BUTTON STYLING
            // Green if requested, Grey if not.
            const btnClass = isRequested 
                ? "bg-green-600 hover:bg-green-500 text-black shadow-lg shadow-green-900/20 cursor-pointer" 
                : "bg-slate-800 text-slate-500 opacity-50 cursor-not-allowed";

            const btnText = isRequested ? "PAY NOW" : "NOT REQUESTED";
            
            // Only add onclick if it is requested
            const btnAction = isRequested 
                ? `onclick="markPaid('${safeId}', ${u.wallet_balance}, '${safeUpi}')"` 
                : "disabled";

            row.innerHTML = `
                <td class="p-6">
                    <div class="font-bold text-white">${u.username}</div>
                    <div class="text-[10px] text-slate-500 uppercase">ID: ${u.id.substring(0,8)}...</div>
                    ${isRequested ? '<span class="text-[9px] text-green-400 font-bold animate-pulse">● REQUEST PENDING</span>' : ''}
                </td>
                
                <td class="p-6">
                    <button onclick="navigator.clipboard.writeText('${safeUpi}').then(() => alert('UPI Copied!'))" 
                            class="font-mono text-yellow-500 text-xs hover:text-yellow-400 hover:underline cursor-pointer" 
                            title="Click to Copy">
                        ${u.upi_id} <i class="fas fa-copy ml-1 opacity-50"></i>
                    </button>
                </td>
                
                <td class="p-6 text-right">
                    <span class="font-black text-green-400 text-lg">₹${u.wallet_balance}</span>
                </td>
                
                <td class="p-6 text-center">
                    <button ${btnAction} 
                            class="${btnClass} font-black px-4 py-2 rounded-lg text-[10px] transition-all">
                        ${btnText}
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

    } catch (err) {
        console.error("Payout Loader Crashed", err);
    }
}

async function markPaid(userId, amount, upiId) {
    // 1. MOBILE PROTOCOL (Deep Link)
    const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
    
    if (isMobile && upiId) {
        // Create the UPI Command
        const upiUrl = `upi://pay?pa=${upiId}&pn=CashTreePromoter&am=${amount}&cu=INR`;
        
        if (confirm(`💸 Launch Payment App for ₹${amount}?`)) {
            // Open GPay / PhonePe / Paytm
            window.location.href = upiUrl;
            
            // 2. VERIFICATION DELAY
            // We wait 3 seconds for them to switch apps, then ask for confirmation
            setTimeout(async () => {
                // UPDATED TEXT: Confirms that the request will be closed
                if (confirm("✅ Did the payment succeed?\n\nClick OK to reset wallet to ₹0 and close the request.")) {
                    await executeWalletReset(userId);
                }
            }, 3000);
            return;
        }
    }

    // 3. DESKTOP/MANUAL FALLBACK
    // UPDATED TEXT
    if (confirm(`Confirm manual settlement of ₹${amount}?\n\nThis will clear the user's withdrawal request.`)) {
        await executeWalletReset(userId);
    }
}

// Helper Function to update Database
async function executeWalletReset(userId) {
    // We reset wallet to 0 AND turn off the withdrawal flag
    const { error } = await db
        .from('promoters')
        .update({ 
            wallet_balance: 0,
            withdrawal_requested: false 
        })
        .eq('id', userId);

    if (error) {
        console.error("Settlement Error:", error);
        alert("❌ Database Error: " + error.message);
    } else {
        alert("✅ SETTLEMENT COMPLETE: Wallet reset.");
        
        // Refresh UI
        if (typeof loadPayouts === 'function') loadPayouts();
        if (typeof loadStats === 'function') loadStats();
    }
}

async function completeSettlement(userId) {
    // 1. EXECUTE RESET (Set Wallet to 0)
    const { error } = await db
        .from('promoters')
        .update({ wallet_balance: 0 })
        .eq('id', userId);

    if (error) {
        console.error("❌ Ledger Update Failed:", error);
        alert("Error: Failed to reset wallet. Check console.");
        return;
    }

    // 2. SURGICAL REFRESH (Only reload money tables)
    // We don't need to reload Campaigns or Config here.
    if (typeof loadPayouts === 'function') loadPayouts();
    if (typeof loadStats === 'function') loadStats();

    // 3. SUCCESS FEEDBACK
    console.log(`✅ User ${userId} settled successfully.`);
    alert("📊 EMPIRE LEDGER UPDATED: Balance Reset.");
}

// =========================================
// 7. GOD CONFIG & ANALYTICS
// =========================================
async function loadStats() {
    // 1. SAFETY CHECK
    if (!db) return;

    try {
        // 2. PARALLEL EXECUTION (Speed Boost)
        const [leadsRes, armyRes, balRes] = await Promise.all([
            db.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
            db.from('promoters').select('*', { count: 'exact', head: true }),
            db.from('promoters').select('wallet_balance')
        ]);

        // 3. DATA PROCESSING
        const leadsCount = leadsRes.count || 0;
        const armyCount = armyRes.count || 0;
        const balData = balRes.data || []; 

        // Calculate Total Liability
        const liability = balData.reduce((sum, p) => sum + (Number(p.wallet_balance) || 0), 0);

        // 4. DOM UPDATES
        const elLeads = document.getElementById("statLeads");
        const elArmy = document.getElementById("statPromoters");
        const elLiability = document.getElementById("statLiability");

        if (elLeads) elLeads.innerText = leadsCount.toLocaleString();
        if (elArmy) elArmy.innerText = armyCount.toLocaleString();
        
        // FIX: Removed the manual "₹" symbol here. 
        // We let your HTML handle the symbol, or just show the raw number.
        if (elLiability) elLiability.innerText = liability.toLocaleString('en-IN');

    } catch (err) {
        console.error("❌ ANALYTICS CRASH:", err);
    }
}
// Load current config when admin opens settings
async function loadSystemConfig() {
    console.log("⚙️ Syncing God Config...");

    // 1. Fetch with Error Handling
    const { data, error } = await db.from('system_config').select('*');

    if (error) {
        console.error("❌ Config Sync Failed:", error.message);
        return;
    }

    // 2. Safety Check (Prevent Crash if table is empty)
    if (data && data.length > 0) {
        data.forEach(item => {
            // Map database keys to HTML Input IDs
            if (item.key === 'min_payout') {
                const el = document.getElementById('cfg_min_payout');
                if(el) el.value = item.value;
            }
            if (item.key === 'support_number') {
                const el = document.getElementById('cfg_support');
                if(el) el.value = item.value;
            }
            if (item.key === 'site_status') {
                const el = document.getElementById('cfg_status');
                if(el) el.value = item.value;
            }
        });
        console.log("✅ God Config Loaded.");
    }
}
async function saveSystemConfig() {
    // 1. UI FEEDBACK (Lock the button)
    // We try to find the button that called this function
    const btn = document.querySelector("button[onclick='saveSystemConfig()']") || document.activeElement;
    const originalText = btn ? btn.innerText : "SAVE CHANGES";

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<i class="fas fa-cog fa-spin mr-2"></i> WRITING LAWS...`;
    }

    try {
        // 2. CAPTURE INPUTS
        const minPayout = document.getElementById('cfg_min_payout').value.trim();
        const supportNum = document.getElementById('cfg_support').value.trim();
        const siteStatus = document.getElementById('cfg_status').value;

        // 3. STRICT VALIDATION
        if (!minPayout || isNaN(minPayout) || Number(minPayout) < 0) {
            throw new Error("Minimum Payout must be a positive number.");
        }
        if (!supportNum) {
            throw new Error("Support Number cannot be empty.");
        }

        // 4. PARALLEL EXECUTION (Speed)
        // We run all updates at the same time
        const results = await Promise.all([
            db.from('system_config').update({ value: minPayout }).eq('key', 'min_payout'),
            db.from('system_config').update({ value: supportNum }).eq('key', 'support_number'),
            db.from('system_config').update({ value: siteStatus }).eq('key', 'site_status')
        ]);

        // 5. ERROR CHECKING
        // If any of the 3 updates failed, we throw an error
        const failed = results.find(r => r.error);
        if (failed) throw failed.error;

        // 6. SUCCESS
        console.log("✅ Config Update Complete");
        alert("🌍 SYSTEM LAWS UPDATED: Global Protocol Synced.");

    } catch (err) {
        console.error("❌ Save Failed:", err);
        alert("Update Error: " + err.message);
    } finally {
        // 7. UNLOCK UI
        if (btn) {
            btn.disabled = false;
            btn.innerText = originalText;
        }
    }
}

// Broadcast Hub
// 1. MODAL CONTROLS (Safe)
function openBroadcastModal() { 
    const modal = document.getElementById("broadcastModal");
    if (modal) {
        modal.classList.remove("hidden");
        // Auto-focus the text area so you can start typing immediately
        document.getElementById("broadcastMsg")?.focus();
    }
}

function closeBroadcastModal() { 
    const modal = document.getElementById("broadcastModal");
    if (modal) modal.classList.add("hidden");
}

// 2. SEND BROADCAST LOGIC
async function sendBroadcast() {
    const msgInput = document.getElementById("broadcastMsg");
    const msg = msgInput.value.trim();
    // Select the button to add the loading spinner
    const btn = document.getElementById("sendBtn");

    // A. VALIDATION
    if (!msg) {
        alert("⚠️ Cannot send empty broadcast.");
        return;
    }

    // B. LOCK UI (Prevent Double-Send)
    const originalText = btn ? btn.innerText : "BLAST MESSAGE";
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<i class="fas fa-tower-broadcast fa-fade mr-2"></i> TRANSMITTING...`;
    }

    try {
        // C. EXECUTE UPDATE (Targeting the 'site_status' row)
        // We update the 'broadcast_message' column where key is 'site_status'
        const { error } = await db
            .from('system_config')
            .update({ broadcast_message: msg }) 
            .eq('key', 'site_status');

        if (error) throw error;

        // D. SUCCESS
        console.log("✅ Broadcast Sent:", msg);
        alert("📢 BROADCAST LIVE: All dashboards updated.");
        
        // Cleanup
        msgInput.value = ""; 
        closeBroadcastModal();

    } catch (err) {
        console.error("❌ Broadcast Error:", err);
        alert("Failed to send: " + err.message);
    } finally {
        // E. RESTORE UI
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }
}

async function hardRefresh() {
    // 1. START ANIMATION (Visual Feedback)
    // We try to find a specific button, or just use any sync icon we find
    const btn = document.getElementById('hardRefreshBtn'); 
    
    // Select ALL sync icons (desktop & mobile) and make them spin
    const icons = document.querySelectorAll('.fa-sync-alt');
    icons.forEach(i => i.classList.add('fa-spin'));

    // Lock the button if it exists
    if (btn) btn.disabled = true;

    console.log("🚀 INITIALIZING HARD SYSTEM SYNC...");

    try {
        // 2. CLEAR BROWSER CACHE (The real "Nuclear" option)
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames.map(name => caches.delete(name))
            );
            console.log("✅ Cache Storage Wiped.");
        }

        // 3. KILL SERVICE WORKERS (Prevents "Ghost" versions of the app)
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (let registration of registrations) {
                await registration.unregister();
            }
            console.log("✅ Service Workers Terminated.");
        }

        // 4. FORCE RELOAD (Cache-Busting Strategy)
        // We append ?v=timestamp so the browser treats it as a brand new page
        const timestamp = new Date().getTime();
        const freshUrl = window.location.pathname + "?v=" + timestamp;
        
        console.log("🔄 Reloading System...");
        window.location.href = freshUrl;

    } catch (error) {
        console.error("❌ Refresh Protocol Failed:", error);
        // Fallback: Standard browser reload (Force Get)
        window.location.reload(true);
    }
}
// =========================================
// SYSTEM IGNITION (ADD AT THE VERY BOTTOM)
// =========================================

// 1. LOGIN SHORTCUT: Allow "Enter" key to trigger checkAuth()
document.getElementById("masterKey")?.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault(); // Stop the form from submitting normally
        checkAuth();
    }
});

// 2. GLOBAL ERROR SAFETY: Logs any crashes you might miss
window.addEventListener('error', function(event) {
    console.warn("⚠️ System Glitch Intercepted:", event.message);
});

console.log("✅ CASHTREE ADMIN SYSTEM: ONLINE & READY.");