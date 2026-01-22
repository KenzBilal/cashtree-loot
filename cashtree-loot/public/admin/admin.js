// =========================================
// 🎨 UI GOD ENGINE (Visual Override)
// =========================================
const ui = {
    // 1. TOAST NOTIFICATION (Sleek, Non-blocking)
    toast: (msg, type = 'neutral') => {
        const container = document.getElementById('toast-container');
        if (!container) return; // Safety check

        const box = document.createElement('div');
        
        // Enterprise Color Palette
        const styles = {
            success: 'border-l-4 border-green-500 bg-[#064e3b]/90 text-green-400', // Deep Green Glass
            error:   'border-l-4 border-red-500 bg-[#450a0a]/90 text-red-400',     // Deep Red Glass
            neutral: 'border-l-4 border-blue-500 bg-[#1e3a8a]/90 text-blue-400'   // Deep Blue Glass
        };
        const icons = {
            success: 'fa-check-circle',
            error:   'fa-exclamation-triangle',
            neutral: 'fa-info-circle'
        };

        // Apply Glassmorphism & Animation Classes
        box.className = `pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-r-lg shadow-2xl backdrop-blur-md translate-x-10 opacity-0 transition-all duration-300 mb-3 ${styles[type] || styles.neutral}`;
        
        box.innerHTML = `
            <i class="fas ${icons[type]} text-lg"></i>
            <span class="font-semibold text-xs tracking-wide text-white uppercase">${msg}</span>
        `;

        container.appendChild(box);

        // Animate Entry
        requestAnimationFrame(() => {
            box.classList.remove('translate-x-10', 'opacity-0');
        });

        // Auto-Dismiss Timer
        setTimeout(() => {
            box.classList.add('translate-x-10', 'opacity-0');
            setTimeout(() => box.remove(), 300);
        }, 3000);
    },

    // 2. CUSTOM ALERT (Async/Await)
    alert: (title, msg) => {
        return new Promise((resolve) => {
            ui._showModal(title, msg, 'info', [
                { 
                    text: 'ACKNOWLEDGE', 
                    class: 'col-span-2 btn-primary', // Uses your CSS class
                    click: resolve 
                }
            ]);
        });
    },

    // 3. CUSTOM CONFIRM (Async/Await)
    // Usage: if (await ui.confirm('Title', 'Message')) { ... }
    confirm: (title, msg, type = 'danger') => {
        return new Promise((resolve) => {
            // Determine button style based on urgency
            const confirmBtnStyle = type === 'danger' 
                ? 'bg-red-600 hover:bg-red-700 text-white w-full py-3 rounded-lg font-bold text-xs transition' 
                : 'btn-primary'; // Default Blue

            ui._showModal(title, msg, type, [
                { 
                    text: 'CANCEL', 
                    class: 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 w-full py-3 rounded-lg font-bold text-xs transition', 
                    click: () => resolve(false) 
                },
                { 
                    text: 'CONFIRM', 
                    class: confirmBtnStyle, 
                    click: () => resolve(true) 
                }
            ]);
        });
    },

    // INTERNAL MODAL CONTROLLER
    _showModal: (title, msg, type, buttons) => {
        const overlay = document.getElementById('ui-modal-overlay');
        const box = document.getElementById('ui-modal-box');
        
        // Safety: If HTML is missing, fallback to native alert to prevent lock-out
        if (!overlay || !box) {
            console.warn("UI Modal Missing in HTML. Falling back to native.");
            if(buttons.length > 1) return window.confirm(msg);
            return window.alert(msg);
        }

        // 1. Populate Content
        document.getElementById('ui-title').innerText = title;
        document.getElementById('ui-msg').innerText = msg;
        const actionsEl = document.getElementById('ui-actions');
        actionsEl.innerHTML = ''; // Clear previous buttons

        // 2. Set Icon
        const iconEl = document.getElementById('ui-icon');
        const icons = { info: '✨', danger: '⚠️', success: '🚀' };
        iconEl.innerText = icons[type] || '✨';

        // 3. Generate Buttons
        buttons.forEach(btn => {
            const b = document.createElement('button');
            b.className = btn.class; // Apply passed classes
            b.innerText = btn.text;
            b.onclick = () => {
                ui._closeModal();
                btn.click(); // Trigger callback
            };
            actionsEl.appendChild(b);
        });

        // 4. Reveal Animation
        overlay.classList.remove('hidden');
        // Small delay to allow display:block to apply before opacity transition
        requestAnimationFrame(() => {
            overlay.classList.remove('opacity-0');
            box.classList.remove('scale-90');
            box.classList.add('scale-100');
        });
    },

    _closeModal: () => {
        const overlay = document.getElementById('ui-modal-overlay');
        const box = document.getElementById('ui-modal-box');
        if(!overlay) return;

        // Hide Animation
        overlay.classList.add('opacity-0');
        box.classList.remove('scale-100');
        box.classList.add('scale-90');
        
        // Remove from DOM flow after animation
        setTimeout(() => overlay.classList.add('hidden'), 300);
    }
};

// OVERRIDE BROWSER DEFAULTS
window.alert = (msg) => ui.alert("System Notice", msg);

// =========================================
// 1. SUPABASE CONNECTION CORE
// =========================================
let db; 

try {
    const supabaseUrl = 'https://qzjvratinjirrcmgzjlx.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6anZyYXRpbmppcnJjbWd6amx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMzAxMDksImV4cCI6MjA4MzgwNjEwOX0.W01Pmbokf20stTgkUsmI3TZahXYK4PPbU0v_2Ziy9YA';

    // CHECK: Integrity Validation
    if (typeof window.supabase === 'undefined') {
        throw new Error("Supabase SDK Missing. Check <head> tags.");
    }

    // SINGLETON: Prevent double-connection
    if (!window.supabaseInstance) {
        window.supabaseInstance = window.supabase.createClient(supabaseUrl, supabaseKey);
    }

    db = window.supabaseInstance;
    console.log("✅ SYSTEM ONLINE: Secure Database Connection Established.");

} catch (err) {
    console.error("❌ FATAL: Connection Refused", err);
    // Fallback alert because UI system might not be ready if DB fails
    alert("Critical System Failure: Database connection lost.");
}



function logout() {
    ui.toast("Securely Logging Out...", "neutral");
    setTimeout(() => location.reload(), 1000);
}


// =========================================
// 3. NAVIGATION & VIEW CONTROLLER
// =========================================
function showSection(id) {
    // 1. INPUT VALIDATION
    if (!id || typeof id !== 'string') return;

    // 2. SELECTORS
    const targetSection = document.getElementById(id);
    const mainContainer = document.querySelector('main'); // Required for scroll reset

    // 3. SAFETY CHECK: Stop if section is missing
    if (!targetSection) {
        console.warn(`⚠️ System Warning: Section '#${id}' not found.`);
        return;
    }

    // 4. RESET: Hide all sections
    document.querySelectorAll('.section').forEach(el => {
        el.classList.add('hidden');
    });

    // 5. ACTIVATE: Show target
    targetSection.classList.remove('hidden');

    // 6. UX: AUTO-SCROLL TO TOP
    // Instantly scroll content to top so user doesn't get lost
    if (mainContainer) mainContainer.scrollTop = 0;

    // 7. HIGHLIGHT SYNC (Dual-Mode)
    // A. Remove Active State from ALL Nav Items
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('active');
    });

    // B. Highlight Desktop Sidebar (ID Match)
    const desktopNav = document.getElementById('nav-' + id);
    if (desktopNav) desktopNav.classList.add('active');

    // C. Highlight Mobile Bottom Bar (Smart Attribute Match)
    // This finds the mobile button that triggers this specific section
    document.querySelectorAll('.md\\:hidden .nav-item').forEach(btn => {
        const onClickAttr = btn.getAttribute('onclick');
        if (onClickAttr && onClickAttr.includes(`'${id}'`)) {
            btn.classList.add('active');
        }
    });
}

// =========================================
// 3. CORE INITIALIZATION (HEARTBEAT)
// =========================================
async function initDashboard() {
    console.log("🛰️ INITIALIZING COMMAND CENTER...");

    // 1. SYSTEM CHECK: Does DB exist?
    if (!db) {
        console.error("❌ FATAL: Database connection lost before init.");
        ui.toast("System Error: Database disconnected.", "error");
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

        // 3. ERROR REPORTING (Silent diagnostics)
        const functions = ['Stats', 'Campaigns', 'Leads', 'Payouts', 'Config', 'Badges'];
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                console.warn(`⚠️ Module Failed: ${functions[index]}`, result.reason);
            }
        });

        console.log("✅ DASHBOARD ONLINE: All modules synchronized.");
        // Add this inside initDashboard(), right after the console.log("✅ DASHBOARD ONLINE") line:
const urlParams = new URLSearchParams(window.location.search);
const section = urlParams.get('section');
if (section) showSection(section);
        ui.toast("Dashboard Synchronized", "success");

        // 4. HEARTBEAT (The Pulse)
        // We set this ONLY after successful load to avoid "death loops"
        // Runs every 30 seconds to keep stats fresh without refreshing page
        setInterval(() => {
            Promise.allSettled([
                loadStats(),
                loadLeads(),
                updatePendingBadge()
            ]).catch(e => console.warn("Heartbeat Skip:", e));
        }, 30000); 

    } catch (err) {
        console.error("❌ DASHBOARD CRASH:", err);
        ui.toast("Critical Error: Dashboard failed to load.", "error");
    }
}

async function updatePendingBadge() {
    // 1. SAFETY CHECK
    if (!db) return; 

    try {
        // 2. EFFICIENT QUERY (Head only, no data download)
        const { count, error } = await db
            .from('leads')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending');

        if (error) {
            console.warn("⚠️ Badge Sync Failed:", error.message);
            return;
        }

        // 3. MULTI-UI UPDATE (Desktop & Mobile)
        // We update both badges defined in your index.html
        const badgeIDs = ['navPendingBadge', 'mobilePendingBadge'];

        badgeIDs.forEach(id => {
            const badge = document.getElementById(id);
            if (badge) {
                if (count > 0) {
                    // Formatting: If over 99, show '99+'
                    badge.innerText = count > 99 ? '99+' : count;
                    badge.classList.remove('hidden');
                } else {
                    badge.classList.add('hidden');
                }
            }
        });

    } catch (err) {
        console.warn("Badge Update Error:", err);
    }
}
// =========================================
// 4. CAMPAIGN LAB (DISPLAY & LOGIC)
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
            console.warn("⚠️ Campaign Sync Failed:", error.message);
            ui.toast("Failed to load campaigns", "error");
            return;
        }

        const grid = document.getElementById("campaignGrid");
        if (!grid) return;
        grid.innerHTML = ""; 

        // 3. EMPTY STATE
        if (!camps || camps.length === 0) {
            grid.innerHTML = `
                <div class="col-span-full flex flex-col items-center justify-center py-16 opacity-40 border-2 border-dashed border-slate-700 rounded-3xl">
                    <i class="fas fa-folder-open text-4xl mb-4"></i>
                    <p class="font-bold text-sm uppercase tracking-widest">No Active Campaigns</p>
                </div>`;
            return;
        }

        // 4. RENDER CARDS
        camps.forEach(c => {
            const destLink = c.target_url || '#'; 
            const payoutVal = c.payout_amount || 0;
            const userReward = c.user_reward || 0; // User Cashback
            const imgUrl = c.image_url || 'https://placehold.co/100x100/1e293b/FFF?text=IMG'; // Professional Placeholder

            // Sanitization for HTML attributes
            const safeTitle = c.title.replace(/'/g, "&apos;").replace(/"/g, "&quot;");

            const card = document.createElement("div");
            // Dynamic Border: Green if active, Dimmed if inactive
            card.className = `glass-panel p-6 rounded-2xl border transition-all duration-300 hover:bg-white/5 relative group ${c.is_active ? 'border-green-500/30 shadow-lg shadow-green-900/10' : 'border-white/5 opacity-60 grayscale-[0.5] hover:grayscale-0'}`;
            
            card.innerHTML = `
                <div class="flex justify-between items-start mb-5">
                    <div class="relative">
                        <img src="${imgUrl}" class="w-14 h-14 rounded-xl bg-black/40 object-cover border border-white/10" onerror="this.src='https://placehold.co/100?text=Err'">
                        ${c.is_active ? '<span class="absolute -top-1 -right-1 flex h-3 w-3"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span>' : ''}
                    </div>
                    
                    <button onclick="toggleCampaign(${c.id}, ${!c.is_active})" 
                            class="transition-all p-2 rounded-lg border border-transparent hover:border-white/10 hover:bg-white/5 ${c.is_active ? 'text-green-400' : 'text-slate-600'}">
                        <i class="fas fa-power-off text-xl"></i>
                    </button>
                </div>

                <h3 class="font-black text-white text-lg tracking-tight mb-1 truncate">${c.title}</h3>
                
                <div class="flex items-center gap-2 mb-6">
                     <a href="${destLink}" target="_blank" class="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded hover:bg-blue-500/20 transition font-mono truncate max-w-[200px]">
                        <i class="fas fa-link mr-1"></i> ${destLink}
                     </a>
                </div>

                <div class="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                    <div class="flex flex-col">
                        <span class="text-[9px] uppercase text-slate-500 font-bold tracking-wider mb-1">Payout Structure</span>
                        <div class="flex items-baseline gap-2">
                            <span class="text-green-400 font-black text-xl">₹${payoutVal}</span>
                            <span class="text-slate-600 text-xs">Promoter</span>
                            <span class="text-slate-700">|</span>
                            <span class="text-yellow-500 font-bold text-sm">₹${userReward}</span>
                            <span class="text-slate-600 text-xs">User</span>
                        </div>
                    </div>
                    
                    <button onclick="openEditModal(${c.id}, '${safeTitle}', ${payoutVal}, ${userReward})" 
                            class="text-slate-500 hover:text-white transition p-3 hover:bg-white/10 rounded-xl">
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

// Helper: Toggle Campaign Status
async function toggleCampaign(id, newStatus) {
    if (!db) return;
    
    // UI Feedback (Optimistic Update)
    ui.toast(newStatus ? "Activating Campaign..." : "Pausing Campaign...", "neutral");

    const { error } = await db
        .from('campaigns')
        .update({ is_active: newStatus })
        .eq('id', id);

    if (error) {
        ui.toast("Error updating status", "error");
        console.error(error);
    } else {
        ui.toast(newStatus ? "Campaign Live" : "Campaign Paused", newStatus ? "success" : "neutral");
        loadCampaigns(); // Refresh Grid
    }
}
   
// =========================================
// 5. DEPLOYMENT PROTOCOLS (WITH FILE UPLOAD)
// =========================================
function toggleCreateCampaign() {
    const form = document.getElementById("createCampaignForm");
    if (form) {
        form.classList.toggle("hidden");
        // UX: Auto-focus on title when opening
        if (!form.classList.contains("hidden")) {
            document.getElementById("newCampTitle")?.focus();
        }
    }
}

async function createNewCampaign() {
    // 1. SYSTEM CHECK
    if (!db) {
        ui.toast("System Error: Database disconnected.", "error");
        return;
    }

    // 2. ELEMENT SELECTION
    const titleInput = document.getElementById("newCampTitle");
    const payoutInput = document.getElementById("newCampPayout");
    const userRewardInput = document.getElementById("newCampUserReward");
    const urlInput = document.getElementById("newCampUrl");
    const fileInput = document.getElementById("newCampFile"); // <--- FILE INPUT
    const submitBtn = document.querySelector("#createCampaignForm button"); 

    // 3. INPUT CAPTURE
    const title = titleInput?.value.trim();
    const payout = payoutInput?.value.trim();
    const userReward = userRewardInput?.value.trim();
    const url = urlInput?.value.trim();

    // 4. STRICT VALIDATION
    if (!title || !payout || !url) {
        ui.toast("Missing Required Fields (Title, Payout, URL)", "error");
        return;
    }

    // 5. LOCK UI (Prevent Double-Submission)
    const originalText = submitBtn ? submitBtn.innerText : "PUBLISH CAMPAIGN";
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fas fa-circle-notch fa-spin mr-2"></i> UPLOADING...`;
    }

    try {
        let finalImgUrl = null;

        // 6. FILE UPLOAD LOGIC (The Magic)
        if (fileInput && fileInput.files.length > 0) {
            const file = fileInput.files[0];
            // Unique name to prevent overwrites: "logo_TIMESTAMP_filename"
            const fileName = `logo_${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
            
            // A. Upload to Supabase Storage
            const { data, error: uploadError } = await db.storage
                .from('campaign_logos')
                .upload(fileName, file);

            if (uploadError) {
                console.error("Upload Failed:", uploadError);
                throw new Error("Logo Upload Failed");
            }

            // B. Get Public URL
            const { data: publicUrlData } = db.storage
                .from('campaign_logos')
                .getPublicUrl(fileName);
                
            finalImgUrl = publicUrlData.publicUrl;
        }

        // 7. DATABASE INJECTION
        const { error } = await db.from('campaigns').insert([{ 
            title: title, 
            payout_amount: parseFloat(payout), 
            user_reward: parseFloat(userReward) || 0,
            target_url: url,  
            image_url: finalImgUrl, // Saves the uploaded URL (or null)
            is_active: true 
        }]);

        if (error) throw error;

        // 8. SUCCESS PROTOCOL
        ui.toast("Campaign Deployed Successfully", "success");
        
        // Reset Form
        titleInput.value = "";
        payoutInput.value = "";
        if (userRewardInput) userRewardInput.value = "";
        urlInput.value = "";
        if (fileInput) fileInput.value = ""; // Clear file selection
        
        // Close UI & Refresh
        toggleCreateCampaign();
        loadCampaigns(); 

    } catch (err) {
        console.error("❌ DEPLOYMENT FAILED:", err);
        ui.toast(err.message || "Deployment Failed", "error");
    } finally {
        // 9. RESTORE UI
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = originalText;
        }
    }
}



// =========================================
// 6. EDIT PROTOCOLS (PROMOTER & USER PAY)
// =========================================

// A. OPEN MODAL (With Data Injection)
function openEditModal(id, currentTitle, currentPayout, currentUserReward) {
    // 1. SAFETY CHECK (Prevents console errors if HTML is missing)
    const modal = document.getElementById('editModal');
    const titleLabel = document.getElementById('editCampTitle');
    const payoutInput = document.getElementById('editCampPayout');
    const rewardInput = document.getElementById('editCampUserReward'); // <--- NEW

    if (!modal || !payoutInput) {
        console.error("❌ Edit Modal elements missing!");
        return;
    }

    // 2. SHOW MODAL (Flex + Animation reset)
    modal.classList.remove('hidden');
    modal.style.display = 'flex';

    // 3. FILL DATA
    if (titleLabel) titleLabel.innerText = currentTitle;
    payoutInput.value = currentPayout;
    if (rewardInput) rewardInput.value = currentUserReward || 0; // Default to 0 if null
    
    // UX: Auto-focus on Payout so you can type immediately
    payoutInput.focus();

    // 4. SET GLOBAL ID (To know which campaign to update)
    window.currentEditingId = id;
}

// B. CLOSE MODAL
function closeEditModal() {
    const modal = document.getElementById('editModal');
    if (modal) {
        modal.classList.add('hidden');
        // Small delay to allow CSS transitions if you add them later
        setTimeout(() => { modal.style.display = 'none'; }, 100);
    }
}

async function saveCampaignUpdate() {
    // 1. SAFETY CHECKS
    if (!window.currentEditingId) {
        console.error("❌ System Error: No Campaign ID selected for edit.");
        return;
    }

    const payoutInput = document.getElementById('editCampPayout');
    const userRewardInput = document.getElementById('editCampUserReward'); 
    
    // Select the button that triggered this action (The one inside the modal)
    // We look for the button with the 'unlock-btn' class inside the edit modal
    const saveBtn = document.querySelector("#editModal .unlock-btn"); 

    const newPayout = payoutInput.value.trim();
    const newUserReward = userRewardInput ? userRewardInput.value.trim() : "0";

    // 2. VALIDATION
    if (!newPayout || isNaN(newPayout) || Number(newPayout) < 0) {
        ui.toast("Invalid Payout: Must be a positive number.", "error");
        payoutInput.focus();
        return;
    }

    // 3. LOCK UI
    const originalText = saveBtn ? saveBtn.innerHTML : "UPDATE LIVE";
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = `<i class="fas fa-circle-notch fa-spin mr-2"></i> SYNCING...`;
    }

    try {
        // 4. DATABASE UPDATE
        const { error } = await db
            .from('campaigns')
            .update({ 
                payout_amount: parseFloat(newPayout), // Use Float for currency precision
                user_reward: parseFloat(newUserReward) 
            })
            .eq('id', window.currentEditingId);

        if (error) throw error;

        // 5. SUCCESS PROTOCOL
        ui.toast("Campaign Rates Updated Successfully", "success");
        
        closeEditModal();
        
        // Refresh grid to show new prices immediately
        if (typeof loadCampaigns === 'function') {
            loadCampaigns(); 
        }

    } catch (err) {
        console.error("❌ Edit Failed:", err);
        ui.toast("Update Failed: " + err.message, "error");
    } finally {
        // 6. CLEANUP
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = originalText;
        }
        window.currentEditingId = null;
    }
}

// =========================================
// 7. LEADS QUEUE (SMART DATA MAPPING)
// =========================================
async function loadLeads() {
    // 1. FETCH DATA (Pending Only)
    // We order by newest first so you see recent activity at the top
    const { data: leads, error } = await db
        .from('leads')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

    if (error) {
        console.warn("⚠️ Leads Sync Failed:", error.message);
        return;
    }

    const tbody = document.getElementById("leadsTableBody");
    const noLeadsMsg = document.getElementById("noLeadsMsg");
    const badge = document.getElementById("navPendingBadge");

    // 2. EMPTY STATE HANDLING
    if (!leads || leads.length === 0) {
        if (tbody) tbody.innerHTML = "";
        if (noLeadsMsg) noLeadsMsg.classList.remove("hidden");
        // Hide red badge if no work to do
        if (badge) badge.classList.add("hidden");
        return;
    }

    // 3. UPDATE NOTIFICATION BADGE
    if (noLeadsMsg) noLeadsMsg.classList.add("hidden");
    if (badge) {
        badge.innerText = leads.length > 99 ? '99+' : leads.length;
        badge.classList.remove("hidden");
    }

    // 4. SMART MAPPING (The "No-Crash" Strategy)
    // We fetch related data in bulk to prevent 100+ database requests (N+1 Problem)
    const campaignIds = [...new Set(leads.map(l => l.campaign_id).filter(id => id))];
    const userIds = [...new Set(leads.map(l => l.user_id).filter(id => id))];

    // Bulk Fetch
    const { data: campaigns } = await db.from('campaigns').select('id, title, payout_amount, user_reward').in('id', campaignIds);
    const { data: promoters } = await db.from('promoters').select('id, username, full_name').in('id', userIds);

    // Create Instant Lookup Maps (O(1) Speed)
    const campMap = {};
    if (campaigns) campaigns.forEach(c => campMap[c.id] = c);

    const promMap = {};
    if (promoters) promoters.forEach(p => promMap[p.id] = p);

    // 5. RENDER ROWS
    if (tbody) {
        tbody.innerHTML = "";
        
        leads.forEach(lead => {
            const row = document.createElement("tr");
            row.className = "border-b border-white/5 hover:bg-white/[0.02] transition duration-200";
            
            // A. Resolve Campaign Data
            // Fallback object prevents crash if campaign was deleted
            const camp = campMap[lead.campaign_id] || { title: 'Unknown', payout_amount: 0, user_reward: 0 };
            
            // B. Resolve Promoter Data
            let userName = '<span class="text-slate-500 italic">Direct User</span>';
            let fullName = 'No Promoter';
            
            if (lead.user_id && promMap[lead.user_id]) {
                userName = `<span class="text-blue-400 font-bold">@${promMap[lead.user_id].username}</span>`;
                fullName = promMap[lead.user_id].full_name;
            }

            // C. Screenshot Link
            const proofLink = lead.screenshot_url 
                ? `<a href="${lead.screenshot_url}" target="_blank" class="flex items-center gap-1 text-[10px] font-bold bg-blue-500/10 text-blue-400 px-2 py-1 rounded hover:bg-blue-500 hover:text-white transition w-fit mt-1">
                     <i class="fas fa-external-link-alt"></i> PROOF
                   </a>` 
                : '<span class="text-red-500 text-[10px] font-bold bg-red-500/10 px-2 py-1 rounded">MISSING PROOF</span>';

            // D. Render Columns
            row.innerHTML = `
                <td class="p-5 text-slate-400 text-xs align-middle">
                    <div class="font-mono text-white">${new Date(lead.created_at).toLocaleDateString()}</div>
                    <div class="text-[10px] opacity-50 font-mono">${new Date(lead.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                </td>
                
                <td class="p-5 align-middle">
                    <div class="font-bold text-white tracking-wide text-sm">${camp.title}</div>
                    ${camp.user_reward > 0 ? `<div class="text-[10px] text-yellow-500 font-bold mt-1">+ ₹${camp.user_reward} User Cashback</div>` : ''}
                </td>
                
                <td class="p-5 align-middle">
                    <div class="text-sm">${userName}</div>
                    <div class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">${fullName}</div>
                </td>
                
                <td class="p-5 align-middle">
                    <div class="text-green-400 font-mono text-xs font-bold mb-1 select-all">${lead.phone}</div>
                    <div class="text-[10px] text-slate-500 font-bold">UPI: <span class="text-slate-300 select-all">${lead.upi_id || 'N/A'}</span></div>
                    ${proofLink}
                </td>
                
                <td class="p-5 text-center flex gap-3 justify-center items-center h-full">
                    <button onclick="approveLead('${lead.id}', '${lead.user_id || ''}', ${camp.payout_amount})" 
                            class="bg-green-600 text-black font-black px-4 py-2 rounded-lg text-[10px] hover:scale-105 hover:bg-green-500 transition shadow-lg shadow-green-900/20 flex items-center gap-2">
                        <i class="fas fa-check"></i> APPROVE
                    </button>
                    
                    <button onclick="rejectLead('${lead.id}')" 
                            class="text-slate-500 hover:text-red-500 hover:bg-red-500/10 px-3 py-2 rounded-lg transition">
                        <i class="fas fa-times text-lg"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
}


// =========================================
// 8. APPROVAL PROTOCOLS (PAYOUT ENGINE)
// =========================================
async function approveLead(leadId, promoterId, amount) {
    // 1. CONFIRMATION (Green Theme)
    const confirmed = await ui.confirm(
        "AUTHORIZE PAYOUT?", 
        `Approve this lead?\n\nPromoter gets: ₹${amount}\nThis cannot be undone.`,
        "success"
    );

    if (!confirmed) return;

    try {
        // 2. CHECK STATUS (Prevent Double Pay)
        const { data: leadStatus } = await db.from('leads').select('status').eq('id', leadId).single();
        if (leadStatus.status === 'approved') {
            ui.toast("Lead already approved!", "error");
            return;
        }

        // 3. FETCH PROMOTER DATA
        const { data: user, error: userError } = await db
            .from('promoters')
            .select('wallet_balance, referred_by, id')
            .eq('id', promoterId)
            .single();

        if (userError || !user) throw new Error("Promoter not found.");

        // 4. PAY PROMOTER (Primary Transaction)
        const payout = parseFloat(amount);
        const newBalance = (parseFloat(user.wallet_balance) || 0) + payout;
        
        const { error: payError } = await db
            .from('promoters')
            .update({ wallet_balance: newBalance })
            .eq('id', promoterId);

        if (payError) throw new Error("Wallet Transaction Failed.");

        // 5. ONE-TIME REFERRAL BONUS (Activation Logic)
        if (user.referred_by) {
            // Check: Is this their FIRST success?
            // We count how many approved leads they have. 
            // Since we haven't updated THIS lead to 'approved' yet, the count should be 0.
            const { count } = await db
                .from('leads')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', promoterId)
                .eq('status', 'approved');

            if (count === 0) {
                // It's their first time! Pay the Boss.
                const REFERRAL_BONUS = 20; // <--- CONFIGURABLE BONUS AMOUNT

                const { data: boss } = await db
                    .from('promoters')
                    .select('wallet_balance, referral_earnings')
                    .eq('id', user.referred_by)
                    .single();
                
                if (boss) {
                    await db.from('promoters').update({ 
                        wallet_balance: (boss.wallet_balance || 0) + REFERRAL_BONUS,
                        referral_earnings: (boss.referral_earnings || 0) + REFERRAL_BONUS 
                    }).eq('id', user.referred_by);
                    
                    console.log(`✅ Activation Bonus: ₹${REFERRAL_BONUS} sent to Upline.`);
                }
            }
        }

        // 6. UPDATE LEAD STATUS (Finalize)
        // Note: cashback_paid is FALSE by default (User debt starts now)
        const { error: closeError } = await db
            .from('leads')
            .update({ status: 'approved' })
            .eq('id', leadId);

        if (closeError) console.error("⚠️ Close Status Failed");

        // 7. SUCCESS
        ui.toast(`✅ Approved: ₹${payout} sent to Wallet`, "success");

        // Refresh Lists
        loadLeads();
        if (typeof loadStats === 'function') loadStats();
        if (typeof updatePendingBadge === 'function') updatePendingBadge();

    } catch (err) {
        console.error("❌ APPROVAL FAILED:", err);
        ui.toast("Transaction Failed: " + err.message, "error");
    }
}


// =========================================
// 8b. REJECTION LOGIC
// =========================================
async function rejectLead(leadId) {
    // 1. CUSTOM CONFIRMATION
    const confirmed = await ui.confirm(
        "REJECT SUBMISSION?", 
        "This will permanently mark the task as failed.\nThe user will receive ₹0.\n\nProceed?",
        "danger"
    );

    if (!confirmed) return;

    try {
        // 2. DATABASE UPDATE
        const { error } = await db
            .from('leads')
            .update({ status: 'rejected' })
            .eq('id', leadId);

        if (error) throw error;

        // 3. SUCCESS FEEDBACK
        ui.toast("🚫 Task Rejected", "neutral");

        // 4. REFRESH DASHBOARD
        loadLeads(); 
        if (typeof loadStats === 'function') loadStats();
        // <--- CRITICAL: Update the red badge immediately
        if (typeof updatePendingBadge === 'function') updatePendingBadge();

    } catch (err) {
        console.error("Reject Error:", err);
        ui.toast("Error: " + err.message, "error");
    }
}

// =========================================
// 9. HYBRID SETTLEMENTS (PROMOTERS + USERS)
// =========================================
async function loadPayouts() {
    if (!db) return;

    try {
        // 1. FETCH PROMOTERS (Who have money)
        const { data: promoters } = await db
            .from('promoters')
            .select('*')
            .gt('wallet_balance', 0)
            .order('wallet_balance', { ascending: false });

        // 2. FETCH USERS (Who are owed Cashback)
        // We filter for leads that are approved but NOT paid yet
        const { data: users } = await db
            .from('leads')
            .select('*, campaigns(title, user_reward)')
            .eq('status', 'approved')
            .eq('cashback_paid', false);

        // Filter out leads where the campaign has 0 user reward
        const payableUsers = users?.filter(u => u.campaigns?.user_reward > 0) || [];

        const tbody = document.getElementById("payoutTableBody");
        if (!tbody) return;
        tbody.innerHTML = "";

        // 3. EMPTY STATE
        if ((!promoters || promoters.length === 0) && payableUsers.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="p-8 text-center text-slate-600 font-mono text-xs uppercase tracking-widest">All Settlements Cleared</td></tr>`;
            return;
        }

        // =================================
        // SECTION A: PRIORITY QUEUE (USERS)
        // =================================
        // New Users always appear at the top because they don't have a dashboard to "Request" money.
        payableUsers.forEach(u => {
            const reward = u.campaigns.user_reward;
            
            const row = document.createElement("tr");
            row.className = "border-b border-white/5 bg-blue-900/10 hover:bg-blue-900/20 transition-colors";
            
            row.innerHTML = `
                <td class="p-5">
                    <div class="font-bold text-blue-200">New User (Task: ${u.campaigns.title})</div>
                    <div class="text-[10px] text-blue-400/60 uppercase">Lead ID: ${u.id}</div>
                </td>
                <td class="p-5 text-blue-400 font-bold text-[10px] uppercase tracking-wider">
                    CASHBACK
                </td>
                <td class="p-5 text-right font-black text-white text-lg">
                    ₹${reward}
                </td>
                <td class="p-5 text-center">
                    <button onclick="payUser('${u.id}', ${reward}, '${u.upi_id}')" 
                            class="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 font-black px-4 py-2 rounded-lg text-[10px] transition-all w-full">
                        PAY CASHBACK
                    </button>
                    <div class="text-[9px] text-blue-400/50 mt-1 font-mono">${u.upi_id}</div>
                </td>
            `;
            tbody.appendChild(row);
        });

        // =================================
        // SECTION B: PROMOTERS
        // =================================
        promoters?.forEach(p => {
            const isRequested = p.withdrawal_requested;
            const btnClass = isRequested 
                ? "bg-green-600 hover:bg-green-500 text-black shadow-lg shadow-green-900/20 cursor-pointer" 
                : "bg-white/5 text-slate-500 cursor-not-allowed opacity-50";

            const row = document.createElement("tr");
            row.className = "border-b border-white/5 hover:bg-white/[0.02] transition-colors";
            
            row.innerHTML = `
                <td class="p-5">
                    <div class="font-bold text-white">${p.username}</div>
                    <div class="text-[10px] text-slate-500 uppercase">${isRequested ? '<span class="text-green-400 animate-pulse">● REQUESTED</span>' : 'Sleeping'}</div>
                </td>
                <td class="p-5 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                    SALARY
                </td>
                <td class="p-5 text-right font-black text-green-400 text-lg">
                    ₹${p.wallet_balance}
                </td>
                <td class="p-5 text-center">
                     <button ${isRequested ? `onclick="payPromoter('${p.id}', ${p.wallet_balance}, '${p.upi_id}')"` : 'disabled'} 
                            class="${btnClass} font-black px-4 py-2 rounded-lg text-[10px] transition-all w-full">
                        ${isRequested ? 'PAY SALARY' : 'LOCKED'}
                    </button>
                    <div class="text-[9px] text-slate-600 mt-1 font-mono select-all">${p.upi_id}</div>
                </td>
            `;
            tbody.appendChild(row);
        });

    } catch (err) {
        console.error("Payout Loader Crashed", err);
    }
}

// ------------------------------------------
// ACTION 1: PAY CASHBACK (For Users)
// ------------------------------------------
async function payUser(leadId, amount, upiId) {
    if(await ui.confirm("PAY CASHBACK?", `Send ₹${amount} to ${upiId}?\n\nThis will mark the debt as paid.`, "success")) {
        // Open UPI
        const isMobile = /Android|iPhone/i.test(navigator.userAgent);
        if(isMobile) window.location.href = `upi://pay?pa=${upiId}&pn=CashTreeUser&am=${amount}&cu=INR`;

        // Update DB
        const { error } = await db.from('leads').update({ cashback_paid: true }).eq('id', leadId);
        
        if(!error) {
            ui.toast("Cashback Marked Paid", "success");
            loadPayouts(); // Refresh List
            if(typeof loadStats === 'function') loadStats(); // Update Liability Calc
        } else {
            ui.toast("Error updating database", "error");
        }
    }
}

// ------------------------------------------
// ACTION 2: PAY SALARY (For Promoters)
// ------------------------------------------
async function payPromoter(userId, amount, upiId) {
    if(await ui.confirm("PAY SALARY?", `Reset ${userId}'s wallet to ₹0?\nConfirm you sent ₹${amount} to ${upiId}.`, "success")) {
         // Open UPI
         const isMobile = /Android|iPhone/i.test(navigator.userAgent);
         if(isMobile) window.location.href = `upi://pay?pa=${upiId}&pn=CashTreePromoter&am=${amount}&cu=INR`;

         // Reset Wallet
         const { error } = await db.from('promoters').update({ wallet_balance: 0, withdrawal_requested: false }).eq('id', userId);

         if(!error) {
            ui.toast("Wallet Reset Successfully", "success");
            loadPayouts();
            if(typeof loadStats === 'function') loadStats();
         } else {
            ui.toast("Error resetting wallet", "error");
         }
    }
}

// =========================================
// 12. UTILITIES: WALLET RESET (The Ledger)
// =========================================
async function executeWalletReset(userId) {
    // 1. DATABASE UPDATE
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
        ui.toast("Database Error: " + error.message, "error");
    } else {
        ui.toast("Settlement Complete: Wallet Reset", "success");
        
        // Refresh UI
        if (typeof loadPayouts === 'function') loadPayouts();
        if (typeof loadStats === 'function') loadStats();
    }
}

// =========================================
// 13. ANALYTICS ENGINE (TRUE LIABILITY)
// =========================================
async function loadStats() {
    if (!db) return;

    try {
        // 1. PARALLEL DATA FETCHING (Speed Boost)
        const [leadsRes, promotersRes, walletRes, debtRes] = await Promise.all([
            // A. Count Approved Leads
            db.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
            
            // B. Count Total Promoters
            db.from('promoters').select('*', { count: 'exact', head: true }),
            
            // C. Get All Promoter Wallets
            db.from('promoters').select('wallet_balance'),
            
            // D. Get All Unpaid User Cashback (Join with Campaigns to get amount)
            db.from('leads')
              .select('campaigns(user_reward)')
              .eq('status', 'approved')
              .eq('cashback_paid', false)
        ]);

        // 2. PROCESS COUNTS
        const leadsCount = leadsRes.count || 0;
        const promoterCount = promotersRes.count || 0;
        
        // 3. LIABILITY MATH (The "True Debt" Calculation)
        // A. Promoter Salary Debt
        const promoterDebt = (walletRes.data || []).reduce((sum, p) => sum + (parseFloat(p.wallet_balance) || 0), 0);
        
        // B. User Cashback Debt
        const userDebt = (debtRes.data || []).reduce((sum, record) => {
            return sum + (parseFloat(record.campaigns?.user_reward) || 0);
        }, 0);

        const totalLiability = promoterDebt + userDebt;

        // 4. UPDATE DOM
        const elLeads = document.getElementById("statLeads");
        const elPromoters = document.getElementById("statPromoters");
        const elLiability = document.getElementById("statLiability");

        if (elLeads) elLeads.innerText = leadsCount.toLocaleString();
        if (elPromoters) elPromoters.innerText = promoterCount.toLocaleString();
        
        if (elLiability) {
            elLiability.innerText = totalLiability.toLocaleString('en-IN');
            // Visual Alert: If debt is high (>10k), add a warning color
            if(totalLiability > 10000) elLiability.classList.add('text-red-400');
        }

    } catch (err) {
        console.error("❌ ANALYTICS CRASH:", err);
    }
}

// =========================================
// 14. SYSTEM CONFIG (GOD CONFIG)
// =========================================
async function loadSystemConfig() {
    const { data } = await db.from('system_config').select('*');
    if (!data) return;

    data.forEach(item => {
        // Map DB keys to HTML IDs
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
}

async function saveSystemConfig() {
    // 1. UI LOCK
    const btn = document.querySelector("button[onclick='saveSystemConfig()']");
    const originalText = btn ? btn.innerText : "SAVE CHANGES";

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<i class="fas fa-circle-notch fa-spin mr-2"></i> SAVING...`;
    }

    try {
        // 2. CAPTURE INPUTS
        const minPayout = document.getElementById('cfg_min_payout').value.trim();
        const supportNum = document.getElementById('cfg_support').value.trim();
        const siteStatus = document.getElementById('cfg_status').value;

        // 3. VALIDATION
        if (!minPayout || isNaN(minPayout)) throw new Error("Invalid Minimum Payout");
        if (!supportNum) throw new Error("Support Number Required");

        // 4. PARALLEL UPSERT (Create if missing, Update if exists)
        const updates = [
            { key: 'min_payout', value: minPayout },
            { key: 'support_number', value: supportNum },
            { key: 'site_status', value: siteStatus }
        ];

        const { error } = await db.from('system_config').upsert(updates);

        if (error) throw error;

        ui.toast("System Settings Synchronized", "success");

    } catch (err) {
        console.error("Save Failed:", err);
        ui.toast(err.message, "error");
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerText = originalText;
        }
    }
}

// =========================================
// 15. BROADCAST SYSTEM
// =========================================
function openBroadcastModal() { 
    const modal = document.getElementById("broadcastModal");
    if (modal) {
        modal.classList.remove("hidden");
        modal.style.display = 'flex';
        document.getElementById("broadcastMsg")?.focus();
    }
}

function closeBroadcastModal() { 
    const modal = document.getElementById("broadcastModal");
    if (modal) {
        modal.classList.add("hidden");
        setTimeout(() => { modal.style.display = 'none'; }, 100);
    }
}

async function sendBroadcast() {
    const msgInput = document.getElementById("broadcastMsg");
    const msg = msgInput.value.trim();
    const btn = document.getElementById("sendBtn");

    if (!msg) {
        ui.toast("Message cannot be empty", "error");
        return;
    }

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<i class="fas fa-tower-broadcast fa-fade mr-2"></i> SENDING...`;
    }

    try {
        // We save the message as a config key so the user app can fetch it
        const { error } = await db
            .from('system_config')
            .upsert({ key: 'broadcast_message', value: msg });

        if (error) throw error;

        ui.toast("Announcement Sent Live", "success");
        msgInput.value = ""; 
        closeBroadcastModal();

    } catch (err) {
        ui.toast("Failed to send: " + err.message, "error");
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerText = "SEND BROADCAST";
        }
    }
}

// =========================================
// 16. NUCLEAR REFRESH
// =========================================
async function hardRefresh() {
    // Visual Feedback
    const icons = document.querySelectorAll('.fa-sync-alt');
    icons.forEach(i => i.classList.add('fa-spin'));
    
    ui.toast("Resyncing System Core...", "neutral");

    try {
        // 1. Clear Caches
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name)));
        }

        // 2. Unregister Service Workers
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (let registration of registrations) {
                await registration.unregister();
            }
        }

        // 3. Force Reload
        setTimeout(() => {
            window.location.reload(true);
        }, 1000);

    } catch (error) {
        console.error("Refresh Failed:", error);
        window.location.reload();
    }
}

// =========================================
// 17. SYSTEM IGNITION (EVENT LISTENERS)
// =========================================

// Allow "Enter" key to trigger login
document.getElementById("masterKey")?.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        checkAuth();
    }
});

// Global Error Catcher
window.addEventListener('error', function(event) {
    console.warn("⚠️ System Glitch Intercepted:", event.message);
});

console.log("✅ CASHTREE ADMIN SYSTEM: ONLINE & READY.");