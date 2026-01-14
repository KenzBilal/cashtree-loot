/* =========================================
   1. SQL CONNECTION*/
const supabaseUrl = 'https://qzjvratinjirrcmgzjlx.supabase.co';
const supabaseKey = 'sb_publishable_XXXX';

const supabaseClient = window.supabase.createClient(
  supabaseUrl,
  supabaseKey
);

/* =========================================
   2. CLICK SAFETY (Prevents Ads Blocking)
   ========================================= */
(function () {
  // Runs immediately to unblock buttons
  const style = document.createElement('style');
  style.innerHTML = 'a, button { pointer-events: auto !important; }';
  document.head.appendChild(style);
})();

/* =========================================
   3. MAIN SCRIPT (Waits for HTML to Load)
   ========================================= */
document.addEventListener("DOMContentLoaded", () => {

  // --- A. MOBILE MENU (The Fix) ---
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("navLinks");

  if (toggle && nav) {
    // 1. Toggle on Click
    toggle.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      nav.classList.toggle("nav-open");
    };

    // 2. Close when clicking OUTSIDE
    document.addEventListener("click", function(e) {
      if (!nav.contains(e.target) && !toggle.contains(e.target)) {
        nav.classList.remove("nav-open");
      }
    });

    // 3. Close when clicking A LINK
    nav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        nav.classList.remove("nav-open");
      });
    });
  } else {
    console.error("Menu Error: 'navToggle' or 'navLinks' ID not found in HTML.");
  }

  // --- B. FAQ ACCORDION ---
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(item => {
    const question = item.querySelector(".faq-question");
    if (question) {
      question.onclick = () => {
        const isActive = item.classList.contains("active");
        faqItems.forEach(other => other.classList.remove("active"));
        if (!isActive) item.classList.add("active");
      };
    }
  });

  // --- C. SMART CTA (Blue Button) ---
  const mobileCta = document.getElementById("mobileCta");
  const ctaClose = document.querySelector(".cta-close");
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  function checkCtaVisibility() {
    if (!mobileCta) return;
    const lastClosed = localStorage.getItem("ctaClosedTime");
    const now = new Date().getTime();
    if (lastClosed && (now - lastClosed < ONE_DAY_MS)) return;

    const scrollPercentage = ((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight) * 100;
    if (scrollPercentage > 50) mobileCta.classList.add("visible");
  }
  
  window.addEventListener("scroll", checkCtaVisibility);

  if (ctaClose && mobileCta) {
    ctaClose.onclick = () => {
      mobileCta.classList.remove("visible");
      localStorage.setItem("ctaClosedTime", new Date().getTime());
    };
  }

  // --- D. DASHBOARD REDIRECT ---
  const dashLink = document.getElementById("menuDashboardLink");
  const partnerId = localStorage.getItem("p_id");
  const oldCode = localStorage.getItem("cashttree_referral");
  
  if (dashLink) {
    if (partnerId) dashLink.href = "dashboard/index.html";
    else if (oldCode) dashLink.href = "dashboard/index.html?code=" + oldCode;
  }

});

