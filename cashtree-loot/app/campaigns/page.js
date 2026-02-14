'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, Zap, Smartphone, Briefcase, Copy, Check } from 'lucide-react';

// --- CAMPAIGN DATA (Kept exactly the same) ---
const CAMPAIGNS = [
  {
    id: 101, name: "Rio Money", category: "Finance", payout: "₹800", difficulty: "High Reward", time: "Verified",
    link: "https://campguruji.in/camp/j8kam6c9", color: "#f97316"
  },
  {
    id: 102, name: "Credilio Flash", category: "Finance", payout: "₹900", difficulty: "High Reward", time: "Verified",
    link: "https://campguruji.in/camp/u1phzg18", color: "#3b82f6"
  },
  {
    id: 103, name: "IndusInd Bank", category: "Banking", payout: "₹500", difficulty: "Premium", time: "Video KYC",
    link: "#", color: "#ef4444"
  },
  {
    id: 104, name: "Bajaj EMI Card", category: "Finance", payout: "₹500", difficulty: "Medium", time: "Approval",
    link: "https://campguruji.in/camp/im6robpt", color: "#06b6d4"
  },
  {
    id: 105, name: "5Paisa Demat", category: "Demat", payout: "₹380", difficulty: "Medium", time: "24 Hrs",
    link: "https://clickmudra.co/camp/MBVZJME", color: "#f97316"
  },
  {
    id: 106, name: "Tide Business", category: "Banking", payout: "₹300", difficulty: "Easy", time: "Verified",
    link: "https://rfox.in/l/rmopqjkx", color: "#4338ca"
  },
  {
    id: 107, name: "Kotak 811", category: "Banking", payout: "₹200", difficulty: "Easy", time: "Instant",
    link: "https://cgrj.in/c/rnf6yrzd", color: "#ef4444"
  },
  {
    id: 108, name: "Upstox Demat", category: "Demat", payout: "₹200", difficulty: "Medium", time: "24-48 Hrs",
    link: "https://campguruji.in/camp/hw52jghh", color: "#a855f7"
  },
  {
    id: 109, name: "AU Credit Card", category: "Credit Card", payout: "₹180", difficulty: "Limit Check", time: "Instant",
    link: "https://campguruji.in/camp/uctpuhvp", color: "#f59e0b"
  },
  {
    id: 110, name: "Angel One", category: "Demat", payout: "₹150", difficulty: "Medium", time: "Approved",
    link: "https://lootcampaign.in?camp=Aone&ref=SueeEI63", color: "#3b82f6"
  },
  {
    id: 111, name: "CoinSwitch", category: "Crypto", payout: "₹150", difficulty: "Trade", time: "Instant",
    link: "https://campaigns.fast2cash.in/camp/o3t1X8zCeW9S3W3", color: "#10b981"
  },
  {
    id: 112, name: "PhonePe", category: "App", payout: "₹150", difficulty: "Easy", time: "Signup",
    link: "/phonepay/", color: "#6d28d9"
  },
  {
    id: 113, name: "Bajaj EMI App", category: "Finance", payout: "₹125", difficulty: "Easy", time: "Instant",
    link: "https://rechargefox.com/camp/rzryyek5", color: "#3b82f6"
  },
  {
    id: 114, name: "Airtel Thanks", category: "App Task", payout: "₹100", difficulty: "Easy", time: "Task",
    link: "https://lootcampaign.in?camp=Atl&ref=VMIZAvSI", color: "#ef4444"
  },
  {
    id: 115, name: "Qoneqt", category: "Referral", payout: "₹85", difficulty: "Code Req", time: "Bonus",
    link: "/qoneqt/", color: "#06b6d4", specialCode: "8424042254214049"
  },
  {
    id: 116, name: "Motwal", category: "App", payout: "₹70", difficulty: "Easy", time: "Install",
    link: "/motwal", color: "#10b981"
  },
  {
    id: 117, name: "Nielsen", category: "Survey", payout: "₹70", difficulty: "Easy", time: "3 Days",
    link: "https://lootcampaign.in?camp=nsn3d&ref=OGkUSDyw", color: "#3b82f6"
  },
  {
    id: 118, name: "Royal Laminates", category: "Form", payout: "₹70", difficulty: "Easy", time: "Call",
    link: "https://campguruji.in/camp/xu6fxt8y", color: "#ca8a04"
  },
  {
    id: 119, name: "Bajaj Demat", category: "Demat", payout: "₹60", difficulty: "Easy", time: "Instant",
    link: "https://campguruji.com/camp/kgwnocyl", color: "#3b82f6"
  },
  {
    id: 120, name: "Media Rewards", category: "App", payout: "₹50", difficulty: "Login", time: "7 Days",
    link: "https://campaign.cashwala.in/campaigns/Sh4sct2s7?as=2n0tg1g1i", color: "#ec4899"
  },
  {
    id: 121, name: "ZebPay", category: "Crypto", payout: "₹40", difficulty: "KYC", time: "Instant",
    link: "https://campaigns.fast2cash.in/camp/tp32keOzRAxFzM1", color: "#3b82f6"
  },
  {
    id: 122, name: "TimesPrime", category: "Subscription", payout: "₹750+", difficulty: "Purchase", time: "Instant",
    link: "https://campguruji.com/camp/qbjybwmw", color: "#333"
  }
];

export default function CampaignsPage() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);

  // Filter Logic
  const filteredCampaigns = CAMPAIGNS.filter(c => {
    const matchesCategory = filter === 'All' || 
                            (filter === 'Finance' && ['Finance','Banking','Credit Card','Demat','Crypto'].includes(c.category)) ||
                            (filter === 'Apps' && ['App','App Task','Survey','Form','Referral'].includes(c.category));
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="main-wrapper">
      
      {/* --- HEADER --- */}
      <header className="nav">
        <div className="nav-inner">
          <Link href="/" className="brand">Cash<span>Tree</span></Link>
          <div className="nav-links">
             <Link href="/">Back to Home</Link>
          </div>
        </div>
      </header>

      {/* --- HERO --- */}
      <div className="campaign-header">
        <h1 style={{fontSize: '3rem', fontWeight: '900', marginBottom: '10px', background: 'linear-gradient(to right, #fff, #888)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
          Live Offers Inventory
        </h1>
        <p style={{color: '#888'}}>Verified high-payout campaigns. Click to apply directly.</p>
      </div>

      {/* --- CONTROLS --- */}
      <div className="controls-bar">
        <div className="filter-tabs">
          {['All', 'Finance', 'Apps'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`filter-tab ${filter === tab ? 'active' : ''}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="search-box">
          <Search size={16} color="#666" />
          <input 
            type="text" 
            placeholder="Search offer..." 
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* --- GRID --- */}
      <div className="campaign-grid animate-fluent">
        {filteredCampaigns.map((c) => (
          <div key={c.id} className="campaign-card">
            
            <div>
              <div className="card-top">
                <div className="card-icon" style={{color: c.color, borderColor: c.color}}>
                  {c.name[0]}
                </div>
                <span className="verified-badge">VERIFIED</span>
              </div>

              <h3 className="card-title">{c.name}</h3>
              <div className="card-cat">
                {['Finance','Banking'].includes(c.category) ? <Briefcase size={14}/> : <Smartphone size={14}/>}
                {c.category}
              </div>

              {/* Special Code Logic */}
              {c.specialCode && (
                <div className="code-box">
                  <span>Code: <b>{c.specialCode}</b></span>
                  <button onClick={() => copyCode(c.specialCode)} className="copy-btn">
                    {copied ? <Check size={14} color="#00ff88"/> : <Copy size={14}/>}
                  </button>
                </div>
              )}

              <div className="stats-box">
                <div className="stat-mini">
                  <div className="stat-label">Payout</div>
                  <div className="stat-val">{c.payout}</div>
                </div>
                <div className="stat-mini">
                  <div className="stat-label">Settlement</div>
                  <div className="stat-val white flex items-center gap-1">
                    <Zap size={12} color="#fbbf24"/> {c.time}
                  </div>
                </div>
              </div>
            </div>

            <a href={c.link} target="_blank" rel="noopener noreferrer" className="btn-start">
              Start Campaign <ArrowRight size={18} />
            </a>

          </div>
        ))}
      </div>

    </div>
  );
}