let db; 

try {
    // 1. Check if auth.js successfully created the client
    if (typeof supabase !== 'undefined') {
        db = supabase; // Link 'db' to the existing connection
        console.log("✅ SYSTEM ONLINE: Database Linked via Auth Core.");
    } else {
        // Safety Fallback: Should not happen if index.html is correct
        throw new Error("Auth Core missing. Database not initialized.");
    }

    // 2. Check Supabase SDK Integrity
    if (typeof window.supabase === 'undefined') {
        throw new Error("Supabase SDK Missing from <head>");
    }

} catch (err) {
    console.error("FATAL:", err);
    alert("Critical Failure: Database connection lost. Reload page.");
}

// B. Anti-XSS Sanitizer
const Security = {
    safeText: (str) => {
        if (str === null || str === undefined) return '';
        const div = document.createElement('div');
        div.textContent = String(str); 
        return div.innerHTML;
    },
    safeURL: (url) => {
        if (!url) return '#';
        try {
            const parsed = new URL(url, window.location.origin);
            return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : '#';
        } catch { return '#'; }
    }
};

/* =========================================
   2. UI ENGINE (Visual Override)
   ========================================= */
const ui = {
    toast: (msg, type = 'neutral') => {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = "fixed top-5 right-5 z-[99999] flex flex-col items-end pointer-events-none";
            document.body.appendChild(container);
        }

        const box = document.createElement('div');
        const styles = {
            success: 'border-l-4 border-green-500 bg-[#064e3b]/95 text-green-400',
            error:   'border-l-4 border-red-500 bg-[#450a0a]/95 text-red-400',
            neutral: 'border-l-4 border-blue-500 bg-[#1e3a8a]/95 text-blue-400'
        };
        const icons = { success: 'fa-check-circle', error: 'fa-exclamation-triangle', neutral: 'fa-info-circle' };

        box.className = `pointer-events-auto flex items-center gap-4 px-6 py-4 rounded-r-xl shadow-2xl backdrop-blur-xl translate-x-10 opacity-0 transition-all duration-500 ease-out mb-3 min-w-[320px] ${styles[type] || styles.neutral}`;
        
        // Auto-Sanitize Message
        box.innerHTML = `<i class="fas ${icons[type] || icons.neutral} text-xl"></i><span class="font-bold text-xs tracking-widest text-white uppercase">${Security.safeText(msg)}</span>`;

        container.appendChild(box);
        requestAnimationFrame(() => box.classList.remove('translate-x-10', 'opacity-0'));
        setTimeout(() => { box.classList.add('translate-x-10', 'opacity-0'); setTimeout(() => box.remove(), 500); }, 4000);
    },

    alert: (title, msg) => new Promise(r => ui._showModal(title, msg, 'info', [{ text: 'ACKNOWLEDGE', class: 'col-span-2 btn-primary', click: r }])),

    confirm: (title, msg, type = 'danger') => new Promise(resolve => {
        const btnStyle = type === 'danger' ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-green-600 hover:bg-green-500 text-white';
        ui._showModal(title, msg, type, [
            { text: 'CANCEL', class: 'bg-white/5 text-slate-400 hover:bg-white/10', click: () => resolve(false) },
            { text: 'CONFIRM', class: `${btnStyle} w-full py-3 rounded-lg font-black text-xs transition shadow-lg`, click: () => resolve(true) }
        ]);
    }),

    _showModal: (title, msg, type, buttons) => {
        const overlay = document.getElementById('ui-modal-overlay');
        if (!overlay) return buttons.length > 1 ? window.confirm(`${title}\n${msg}`) : window.alert(`${title}\n${msg}`);

        document.getElementById('ui-title').innerText = title;
        document.getElementById('ui-msg').innerText = msg;
        const actionsEl = document.getElementById('ui-actions');
        actionsEl.innerHTML = '';

        const iconEl = document.getElementById('ui-icon');
        const icons = { info: '✨', danger: '⚠️', success: '🚀' };
        if(iconEl) iconEl.innerText = icons[type] || '✨';

        buttons.forEach(btn => {
            const b = document.createElement('button');
            b.className = btn.class;
            b.innerText = btn.text;
            b.onclick = () => { ui._closeModal(); btn.click(); };
            actionsEl.appendChild(b);
        });

        overlay.classList.remove('hidden');
        requestAnimationFrame(() => {
            overlay.classList.remove('opacity-0');
            document.getElementById('ui-modal-box')?.classList.remove('scale-90');
            document.getElementById('ui-modal-box')?.classList.add('scale-100');
        });
    },

    _closeModal: () => {
        const overlay = document.getElementById('ui-modal-overlay');
        if(!overlay) return;
        overlay.classList.add('opacity-0');
        document.getElementById('ui-modal-box')?.classList.remove('scale-100');
        document.getElementById('ui-modal-box')?.classList.add('scale-90');
        setTimeout(() => overlay.classList.add('hidden'), 300);
    }
};

window.alert = (msg) => ui.alert("System Notice", msg);

/* =========================================
   3. SECURE AUTHENTICATION
   ========================================= */
/* =========================================
   3. SECURE AUTHENTICATION (Modal Based)
   ========================================= */
async function verifyAdminAccess() {
    // 1. Check Session
    const { data: { session } } = await db.auth.getSession();

    // 2. Define Failure Action (Show Login Modal)
    const denyAccess = async () => {
        console.warn("⛔ Access Denied: Admin privileges required.");
        
        // Hide Dashboard UI (Optional: Add a blur effect or hide main container)
        document.body.classList.remove("admin-unlocked");
        
        // Show Login Modal (Matches your auth.js logic)
        const loginModal = document.getElementById("loginModal");
        if (loginModal) {
            loginModal.classList.remove("hidden");
            loginModal.style.display = "flex"; // Ensure it's visible
        }
        
        // Kill session to be safe
        await db.auth.signOut();
        return false;
    };

    if (!session) return await denyAccess();

    // 3. Strict Role Check (Must be 'admin')
    // We check app_metadata because it cannot be faked by the user in the browser console.
    const role = session.user.app_metadata?.role;
    
    if (role !== 'admin') {
        return await denyAccess();
    }

    console.log("✅ Admin Clearance Verified.");
    document.body.classList.add("admin-unlocked"); // Unlock UI
    return true;
}

async function logout() {
    if(await ui.confirm("SECURE LOGOUT?", "End admin session?", "neutral")) {
        ui.toast("Terminating...", "neutral");
        await db.auth.signOut();
        
        // Re-lock UI and Show Login Modal
        document.body.classList.remove("admin-unlocked");
        document.getElementById("loginModal")?.classList.remove("hidden");
        
        // Optional: Reload to clear memory
        setTimeout(() => window.location.reload(), 500);
    }
}

/* =========================================
   VIEW CONTROLLER (With URL Sync)
   ========================================= */
function showSection(id) {
    if (!id) return;

    // 1. UI: Switch Sections
    document.querySelectorAll('.section').forEach(el => el.classList.add('hidden'));
    document.getElementById(id)?.classList.remove('hidden');

    // 2. UX: Reset Scroll to Top (With safety check)
    const mainContainer = document.querySelector('main');
    if (mainContainer) mainContainer.scrollTop = 0;
    
    // 3. NAV: Update Active State (Desktop)
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById('nav-' + id)?.classList.add('active');
    
    // 4. NAV: Update Active State (Mobile)
    document.querySelectorAll('.md\\:hidden .nav-item').forEach(btn => {
        // Checks if the button's onclick contains the current ID
        if (btn.getAttribute('onclick')?.includes(`'${id}'`)) {
            btn.classList.add('active');
        }
    });

    // 5. 🌟 NEW FEATURE: Update URL without reloading
    // This saves your spot. If you are on "Leads", the URL becomes "?section=leads"
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('section', id);
    window.history.pushState({}, '', newUrl);
}

/* =========================================
   4. INITIALIZATION (Auto-Auth)
   ========================================= */
// Expose this globally so auth.js can call it after successful login
window.initDashboard = async function() {
    // 1. Gatekeeper (Checks if user is logged in & is admin)
    const isAllowed = await verifyAdminAccess();
    
    // 2. If blocked, stop here. (verifyAdminAccess already showed the modal)
    if (!isAllowed) return;

    // 3. If allowed, Hide Modal & Load Data
    document.getElementById("loginModal")?.classList.add("hidden");
    console.log("🛰️ INITIALIZING DASHBOARD...");

    try {
        await Promise.allSettled([
            loadStats(), 
            loadCampaigns(), 
            loadLeads(), 
            loadPayouts(), 
            loadSystemConfig(), 
            updatePendingBadge()
        ]);
        
        console.log("✅ DASHBOARD ONLINE");
        ui.toast("Welcome Back, Admin", "success");

        // Handle URL Deep Links (?section=leads)
        const urlParams = new URLSearchParams(window.location.search);
        const section = urlParams.get('section');
        if (section) showSection(section);

        // Start Heartbeat (Updates every 30s)
        if (!window.heartbeatInterval) {
            window.heartbeatInterval = setInterval(() => {
                Promise.allSettled([loadStats(), loadLeads(), updatePendingBadge()]);
            }, 30000);
        }

    } catch (err) {
        console.error("Crash:", err);
        ui.toast("Critical Error: Load Failed", "error");
    }
};

async function updatePendingBadge() {
    if (!db) return;
    const { count } = await db.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'pending');
    ['navPendingBadge', 'mobilePendingBadge'].forEach(id => {
        const badge = document.getElementById(id);
        if (badge) {
            badge.innerText = count > 99 ? '99+' : count;
            count > 0 ? badge.classList.remove('hidden') : badge.classList.add('hidden');
        }
    });
}

/* =========================================
   5. CAMPAIGNS
   ========================================= */
async function loadCampaigns() {
    const { data: camps } = await db.from('campaigns').select('*').order('id', { ascending: false });
    const grid = document.getElementById("campaignGrid");
    if (!grid) return;
    grid.innerHTML = ""; 

    if (!camps || camps.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-10 opacity-50"><p>No Active Campaigns</p></div>`;
        return;
    }

    camps.forEach(c => {
        const safeTitle = Security.safeText(c.title);
        const safeUrl = Security.safeURL(c.target_url);
        const safeImg = Security.safeURL(c.image_url || 'https://placehold.co/100?text=IMG');
        const payout = parseFloat(c.payout_amount || 0);
        const reward = parseFloat(c.user_reward || 0);

        const card = document.createElement("div");
        card.className = `glass-panel p-6 rounded-2xl border transition-all duration-300 hover:bg-white/5 relative group ${c.is_active ? 'border-green-500/30' : 'border-white/5 opacity-60'}`;
        
        card.innerHTML = `
            <div class="flex justify-between items-start mb-5">
                <div class="relative">
                    <img src="${safeImg}" class="w-14 h-14 rounded-xl bg-black/40 object-cover border border-white/10">
                    ${c.is_active ? '<span class="absolute -top-1 -right-1 flex h-3 w-3"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span>' : ''}
                </div>
                <button onclick="toggleCampaign(${c.id}, ${!c.is_active})" class="p-2 ${c.is_active ? 'text-green-400' : 'text-slate-600'}"><i class="fas fa-power-off text-xl"></i></button>
            </div>
            <h3 class="font-black text-white text-lg tracking-tight mb-1 truncate">${safeTitle}</h3>
            <a href="${safeUrl}" target="_blank" class="flex items-center gap-2 mb-6 text-[10px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded w-fit"><i class="fas fa-link"></i> LINK</a>
            <div class="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                <div class="flex flex-col">
                    <span class="text-[9px] uppercase text-slate-500 font-bold tracking-wider mb-1">Payouts</span>
                    <div class="flex items-baseline gap-2">
                        <span class="text-green-400 font-black text-xl">₹${payout}</span>
                        <span class="text-slate-700">|</span>
                        <span class="text-yellow-500 font-bold text-sm">₹${reward}</span>
                    </div>
                </div>
                <button onclick="openEditModal(${c.id}, '${safeTitle.replace(/'/g, "\\'")}', ${payout}, ${reward})" class="text-slate-500 hover:text-white transition p-3"><i class="fas fa-edit"></i></button>
            </div>
        `;
        grid.appendChild(card);
    });
}

async function toggleCampaign(id, newStatus) {
    ui.toast(newStatus ? "Activating..." : "Pausing...", "neutral");
    const { error } = await db.from('campaigns').update({ is_active: newStatus }).eq('id', id);
    if (!error) {
        ui.toast(newStatus ? "Live" : "Paused", "success");
        loadCampaigns();
    }
}

function toggleCreateCampaign() { document.getElementById("createCampaignForm")?.classList.toggle("hidden"); }

async function createNewCampaign() {
    const titleInput = document.getElementById("newCampTitle");
    const payoutInput = document.getElementById("newCampPayout");
    const urlInput = document.getElementById("newCampUrl");
    const fileInput = document.getElementById("newCampFile");
    const btn = document.querySelector("#createCampaignForm button");

    const title = Security.safeText(titleInput?.value.trim());
    const payout = parseFloat(payoutInput?.value.trim());
    const url = Security.safeURL(urlInput?.value.trim());
    const userReward = parseFloat(document.getElementById("newCampUserReward")?.value.trim() || 0);

    if (!title || isNaN(payout) || !url) return ui.toast("Missing required fields", "error");

    if (btn) { btn.disabled = true; btn.innerHTML = `<i class="fas fa-circle-notch fa-spin"></i> UPLOADING...`; }

    try {
        let finalImgUrl = null;
        if (fileInput && fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const fileName = `logo_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '')}`;
            const { error: upErr } = await db.storage.from('campaign_logos').upload(fileName, file);
            if (upErr) throw upErr;
            const { data } = db.storage.from('campaign_logos').getPublicUrl(fileName);
            finalImgUrl = data.publicUrl;
        }

        const { error } = await db.from('campaigns').insert([{ title, payout_amount: payout, user_reward: userReward, target_url: url, image_url: finalImgUrl, is_active: true }]);
        if (error) throw error;

        ui.toast("Campaign Deployed", "success");
        titleInput.value = ""; payoutInput.value = ""; urlInput.value = "";
        toggleCreateCampaign();
        loadCampaigns();
    } catch (err) {
        ui.toast(err.message, "error");
    } finally {
        if (btn) { btn.disabled = false; btn.innerText = "PUBLISH CAMPAIGN"; }
    }
}

/* =========================================
   6. EDIT & LEADS
   ========================================= */
function openEditModal(id, title, payout, reward) {
    const modal = document.getElementById('editModal');
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    document.getElementById('editCampTitle').innerText = title;
    document.getElementById('editCampPayout').value = payout;
    document.getElementById('editCampUserReward').value = reward;
    window.currentEditingId = id;
}

function closeEditModal() { document.getElementById('editModal')?.classList.add('hidden'); }

async function saveCampaignUpdate() {
    if (!window.currentEditingId) return;
    const payout = parseFloat(document.getElementById('editCampPayout').value);
    const reward = parseFloat(document.getElementById('editCampUserReward').value);
    const btn = document.querySelector("#editModal .unlock-btn");

    if (btn) { btn.disabled = true; btn.innerText = "UPDATING..."; }

    try {
        const { error } = await db.from('campaigns').update({ payout_amount: payout, user_reward: reward }).eq('id', window.currentEditingId);
        if (error) throw error;
        ui.toast("Updated", "success");
        closeEditModal();
        loadCampaigns();
    } catch (err) {
        ui.toast("Update Failed", "error");
    } finally {
        if (btn) { btn.disabled = false; btn.innerText = "UPDATE"; }
    }
}

async function loadLeads() {
    const { data: leads } = await db.from('leads').select('*').eq('status', 'pending').order('created_at', { ascending: false });
    const tbody = document.getElementById("leadsTableBody");
    const noMsg = document.getElementById("noLeadsMsg");

    if (!leads || leads.length === 0) {
        if (tbody) tbody.innerHTML = "";
        noMsg?.classList.remove("hidden");
        return;
    }
    noMsg?.classList.add("hidden");

    // Bulk Fetch
    const campIds = [...new Set(leads.map(l => l.campaign_id))];
    const userIds = [...new Set(leads.map(l => l.user_id))];
    const { data: camps } = await db.from('campaigns').select('id, title, payout_amount').in('id', campIds);
    const { data: users } = await db.from('promoters').select('id, username').in('id', userIds);
    
    const campMap = Object.fromEntries(camps?.map(c => [c.id, c]) || []);
    const userMap = Object.fromEntries(users?.map(u => [u.id, u]) || []);

    if (tbody) {
        tbody.innerHTML = "";
        leads.forEach(lead => {
            const c = campMap[lead.campaign_id] || { title: 'Unknown', payout_amount: 0 };
            const u = userMap[lead.user_id];
            const safeUsername = u ? Security.safeText(u.username) : 'Direct';
            
            const row = document.createElement("tr");
            row.className = "border-b border-white/5 hover:bg-white/[0.02]";
            row.innerHTML = `
                <td class="p-5 text-xs text-slate-400">${new Date(lead.created_at).toLocaleDateString()}</td>
                <td class="p-5 text-sm font-bold text-white">${Security.safeText(c.title)}</td>
                <td class="p-5 text-sm text-blue-400 font-bold">@${safeUsername}</td>
                <td class="p-5 text-xs">
                    <div class="text-green-400 font-mono">${Security.safeText(lead.phone)}</div>
                    ${lead.screenshot_url ? `<a href="${Security.safeURL(lead.screenshot_url)}" target="_blank" class="text-blue-400 underline">PROOF</a>` : ''}
                </td>
                <td class="p-5 flex gap-2">
                    <button onclick="approveLead('${lead.id}', '${lead.user_id}', ${c.payout_amount})" class="bg-green-600 text-black px-3 py-1 rounded text-[10px] font-black">APPROVE</button>
                    <button onclick="rejectLead('${lead.id}')" class="text-red-500 bg-red-500/10 px-2 rounded"><i class="fas fa-times"></i></button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
}

async function approveLead(leadId, promoterId, amount) {
    if (!await ui.confirm("APPROVE LEAD?", `Pay ₹${amount}?`, "success")) return;

    try {
        const { data: user } = await db.from('promoters').select('wallet_balance, referred_by, id').eq('id', promoterId).single();
        if (!user) throw new Error("User not found");

        // Pay Promoter
        await db.from('promoters').update({ wallet_balance: (parseFloat(user.wallet_balance) || 0) + parseFloat(amount) }).eq('id', promoterId);

        // Activation Bonus
        if (user.referred_by) {
            const { count } = await db.from('leads').select('*', { count: 'exact', head: true }).eq('user_id', promoterId).eq('status', 'approved');
            if (count === 0) {
                const { data: boss } = await db.from('promoters').select('wallet_balance, referral_earnings').eq('id', user.referred_by).single();
                if (boss) {
                    await db.from('promoters').update({ 
                        wallet_balance: (parseFloat(boss.wallet_balance) || 0) + 20, 
                        referral_earnings: (parseFloat(boss.referral_earnings) || 0) + 20 
                    }).eq('id', user.referred_by);
                }
            }
        }

        await db.from('leads').update({ status: 'approved' }).eq('id', leadId);
        ui.toast("Lead Approved", "success");
        loadLeads(); loadStats(); updatePendingBadge();

    } catch (err) {
        ui.toast(err.message, "error");
    }
}

async function rejectLead(id) {
    if (await ui.confirm("REJECT LEAD?", "Mark as failed?", "danger")) {
        await db.from('leads').update({ status: 'rejected' }).eq('id', id);
        ui.toast("Rejected", "neutral");
        loadLeads(); updatePendingBadge();
    }
}

/* =========================================
   7. PAYOUTS & ANALYTICS
   ========================================= */
async function loadPayouts() {
    const { data: promoters } = await db.from('promoters').select('*').gt('wallet_balance', 0).order('wallet_balance', { ascending: false });
    const { data: users } = await db.from('leads').select('*, campaigns(title, user_reward)').eq('status', 'approved').eq('cashback_paid', false);
    
    const tbody = document.getElementById("payoutTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    const payableUsers = users?.filter(u => u.campaigns?.user_reward > 0) || [];

    if ((!promoters || promoters.length === 0) && payableUsers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="p-8 text-center text-slate-600">ALL SETTLED</td></tr>`;
        return;
    }

    payableUsers.forEach(u => {
        const reward = parseFloat(u.campaigns.user_reward).toFixed(2);
        const row = document.createElement("tr");
        row.className = "border-b border-white/5 bg-blue-900/10";
        row.innerHTML = `
            <td class="p-5 text-blue-200 font-bold">User Cashback<br><span class="text-[9px] text-blue-400">${Security.safeText(u.id)}</span></td>
            <td class="p-5 text-right font-black text-white">₹${reward}</td>
            <td class="p-5"><button onclick="payUser('${u.id}', ${reward}, '${Security.safeText(u.upi_id)}')" class="bg-blue-600 text-white w-full py-2 rounded text-xs font-bold">PAY</button></td>
        `;
        tbody.appendChild(row);
    });

    promoters?.forEach(p => {
        const balance = parseFloat(p.wallet_balance).toFixed(2);
        const isReq = p.withdrawal_requested;
        const row = document.createElement("tr");
        row.className = "border-b border-white/5";
        row.innerHTML = `
            <td class="p-5 text-white font-bold">${Security.safeText(p.username)} ${isReq ? '🔴' : ''}</td>
            <td class="p-5 text-right font-black text-green-400">₹${balance}</td>
            <td class="p-5">
                <button ${isReq ? `onclick="payPromoter('${p.id}', ${balance}, '${Security.safeText(p.upi_id)}')"` : 'disabled'} class="${isReq ? 'bg-green-600' : 'bg-white/10'} w-full py-2 rounded text-xs font-bold text-black">
                    ${isReq ? 'PAY SALARY' : 'LOCKED'}
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function payUser(id, amount, upi) {
    if(await ui.confirm("PAY CASHBACK?", `Send ₹${amount}?`, "success")) {
        if(/Android|iPhone/i.test(navigator.userAgent)) window.location.href = `upi://pay?pa=${encodeURIComponent(upi)}&pn=CashTree&am=${amount}&cu=INR`;
        await db.from('leads').update({ cashback_paid: true }).eq('id', id);
        ui.toast("Paid", "success");
        loadPayouts(); loadStats();
    }
}

async function payPromoter(id, amount, upi) {
    if(await ui.confirm("PAY SALARY?", `Reset wallet?`, "success")) {
        if(/Android|iPhone/i.test(navigator.userAgent)) window.location.href = `upi://pay?pa=${encodeURIComponent(upi)}&pn=CashTree&am=${amount}&cu=INR`;
        await db.from('promoters').update({ wallet_balance: 0, withdrawal_requested: false }).eq('id', id);
        ui.toast("Reset", "success");
        loadPayouts(); loadStats();
    }
}

async function loadStats() {
    const [leads, promoters, wallets, debt] = await Promise.all([
        db.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        db.from('promoters').select('*', { count: 'exact', head: true }),
        db.from('promoters').select('wallet_balance'),
        db.from('leads').select('campaigns(user_reward)').eq('status', 'approved').eq('cashback_paid', false)
    ]);

    const promoterDebt = (wallets.data || []).reduce((s, p) => s + (parseFloat(p.wallet_balance) || 0), 0);
    const userDebt = (debt.data || []).reduce((s, r) => s + (parseFloat(r.campaigns?.user_reward) || 0), 0);

    document.getElementById("statLeads").innerText = (leads.count || 0).toLocaleString();
    document.getElementById("statPromoters").innerText = (promoters.count || 0).toLocaleString();
    document.getElementById("statLiability").innerText = (promoterDebt + userDebt).toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

/* =========================================
   8. CONFIG & UTILS
   ========================================= */
async function loadSystemConfig() {
    const { data } = await db.from('system_config').select('*');
    if (!data) return;
    const map = { min_payout: 'cfg_min_payout', support_number: 'cfg_support', site_status: 'cfg_status' };
    data.forEach(i => { const el = document.getElementById(map[i.key]); if(el) el.value = i.value; });
}

async function saveSystemConfig() {
    const min = document.getElementById('cfg_min_payout').value;
    const support = Security.safeText(document.getElementById('cfg_support').value);
    const status = document.getElementById('cfg_status').value;
    
    await db.from('system_config').upsert([
        { key: 'min_payout', value: min },
        { key: 'support_number', value: support },
        { key: 'site_status', value: status }
    ]);
    ui.toast("Saved", "success");
}

function openBroadcastModal() { document.getElementById('broadcastModal')?.classList.remove('hidden'); }
function closeBroadcastModal() { document.getElementById('broadcastModal')?.classList.add('hidden'); }

async function sendBroadcast() {
    const msg = Security.safeText(document.getElementById('broadcastMsg').value);
    if(!msg) return;
    await db.from('system_config').upsert({ key: 'broadcast_message', value: msg });
    ui.toast("Sent", "success");
    closeBroadcastModal();
}

async function hardRefresh() {
    ui.toast("Syncing...", "neutral");
    localStorage.clear(); sessionStorage.clear();
    setTimeout(() => location.reload(true), 1000);
}

// IGNITION
window.addEventListener('error', e => console.warn(e.message));
document.addEventListener("DOMContentLoaded", window.initDashboard);