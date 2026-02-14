'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, Zap, Smartphone, Briefcase, CreditCard, Copy, Check } from 'lucide-react';

// --- YOUR EXACT OFFERS (Converted to Data Structure) ---
const CAMPAIGNS = [
  {
    id: 101,
    name: "Rio Money",
    category: "Finance",
    payout: "₹800",
    difficulty: "High Reward",
    time: "Verified",
    link: "https://campguruji.in/camp/j8kam6c9",
    color: "from-orange-500 to-red-500"
  },
  {
    id: 102,
    name: "Credilio Flash",
    category: "Finance",
    payout: "₹900",
    difficulty: "High Reward",
    time: "Verified",
    link: "https://campguruji.in/camp/u1phzg18",
    color: "from-blue-600 to-indigo-600"
  },
  {
    id: 103,
    name: "IndusInd Bank",
    category: "Banking",
    payout: "₹500",
    difficulty: "Premium",
    time: "Video KYC",
    link: "#", // You marked this as YOUR_INDUSIND_REFERRAL_LINK
    color: "from-red-700 to-red-900"
  },
  {
    id: 104,
    name: "Bajaj EMI Card",
    category: "Finance",
    payout: "₹500",
    difficulty: "Medium",
    time: "Approval",
    link: "https://campguruji.in/camp/im6robpt",
    color: "from-blue-400 to-cyan-500"
  },
  {
    id: 105,
    name: "5Paisa Demat",
    category: "Demat",
    payout: "₹380",
    difficulty: "Medium",
    time: "24 Hrs",
    link: "https://clickmudra.co/camp/MBVZJME",
    color: "from-orange-400 to-orange-600"
  },
  {
    id: 106,
    name: "Tide Business",
    category: "Banking",
    payout: "₹300",
    difficulty: "Easy",
    time: "Verified",
    link: "https://rfox.in/l/rmopqjkx",
    color: "from-indigo-800 to-blue-900"
  },
  {
    id: 107,
    name: "Kotak 811",
    category: "Banking",
    payout: "₹200",
    difficulty: "Easy",
    time: "Instant",
    link: "https://cgrj.in/c/rnf6yrzd",
    color: "from-red-500 to-red-600"
  },
  {
    id: 108,
    name: "Upstox Demat",
    category: "Demat",
    payout: "₹200",
    difficulty: "Medium",
    time: "24-48 Hrs",
    link: "https://campguruji.in/camp/hw52jghh",
    color: "from-purple-500 to-indigo-500"
  },
  {
    id: 109,
    name: "AU Credit Card",
    category: "Credit Card",
    payout: "₹180",
    difficulty: "Limit Check",
    time: "Instant",
    link: "https://campguruji.in/camp/uctpuhvp",
    color: "from-orange-500 to-yellow-500"
  },
  {
    id: 110,
    name: "Angel One",
    category: "Demat",
    payout: "₹150",
    difficulty: "Medium",
    time: "Approved",
    link: "https://lootcampaign.in?camp=Aone&ref=SueeEI63",
    color: "from-blue-500 to-blue-700"
  },
  {
    id: 111,
    name: "CoinSwitch",
    category: "Crypto",
    payout: "₹150",
    difficulty: "Trade",
    time: "Instant",
    link: "https://campaigns.fast2cash.in/camp/o3t1X8zCeW9S3W3",
    color: "from-emerald-500 to-teal-600"
  },
  {
    id: 112,
    name: "PhonePe",
    category: "App",
    payout: "₹150",
    difficulty: "Easy",
    time: "Signup",
    link: "/phonepay/",
    color: "from-purple-600 to-purple-800"
  },
  {
    id: 113,
    name: "Bajaj EMI App",
    category: "Finance",
    payout: "₹125",
    difficulty: "Easy",
    time: "Instant",
    link: "https://rechargefox.com/camp/rzryyek5",
    color: "from-blue-400 to-blue-600"
  },
  {
    id: 114,
    name: "Airtel Thanks",
    category: "App Task",
    payout: "₹100",
    difficulty: "Easy",
    time: "Task",
    link: "https://lootcampaign.in?camp=Atl&ref=VMIZAvSI",
    color: "from-red-500 to-pink-600"
  },
  {
    id: 115,
    name: "Qoneqt",
    category: "Referral",
    payout: "₹85",
    difficulty: "Code Req",
    time: "Bonus",
    link: "/qoneqt/",
    color: "from-cyan-500 to-blue-500",
    specialCode: "8424042254214049" // Added Logic for this
  },
  {
    id: 116,
    name: "Motwal",
    category: "App",
    payout: "₹70",
    difficulty: "Easy",
    time: "Install",
    link: "/motwal",
    color: "from-green-500 to-emerald-600"
  },
  {
    id: 117,
    name: "Nielsen",
    category: "Survey",
    payout: "₹70",
    difficulty: "Easy",
    time: "3 Days",
    link: "https://lootcampaign.in?camp=nsn3d&ref=OGkUSDyw",
    color: "from-blue-400 to-indigo-400"
  },
  {
    id: 118,
    name: "Royal Laminates",
    category: "Form",
    payout: "₹70",
    difficulty: "Easy",
    time: "Call",
    link: "https://campguruji.in/camp/xu6fxt8y",
    color: "from-yellow-600 to-yellow-800"
  },
  {
    id: 119,
    name: "Bajaj Demat",
    category: "Demat",
    payout: "₹60",
    difficulty: "Easy",
    time: "Instant",
    link: "https://campguruji.com/camp/kgwnocyl",
    color: "from-blue-500 to-cyan-600"
  },
  {
    id: 120,
    name: "Media Rewards",
    category: "App",
    payout: "₹50",
    difficulty: "Login",
    time: "7 Days",
    link: "https://campaign.cashwala.in/campaigns/Sh4sct2s7?as=2n0tg1g1i",
    color: "from-pink-500 to-rose-500"
  },
  {
    id: 121,
    name: "ZebPay",
    category: "Crypto",
    payout: "₹40",
    difficulty: "KYC",
    time: "Instant",
    link: "https://campaigns.fast2cash.in/camp/tp32keOzRAxFzM1",
    color: "from-blue-500 to-blue-600"
  },
  {
    id: 122,
    name: "TimesPrime",
    category: "Subscription",
    payout: "₹750+",
    difficulty: "Purchase",
    time: "Instant",
    link: "https://campguruji.com/camp/qbjybwmw",
    color: "from-gray-700 to-black"
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
    <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500/30">
      
      {/* --- HEADER --- */}
      <header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="font-bold text-black">C</span>
            </div>
            <span className="font-bold text-xl tracking-tight">Cash<span className="text-emerald-400">Tree</span></span>
          </Link>
          <div className="flex gap-4">
            <Link href="/" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Home</Link>
          </div>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <div className="pt-32 pb-12 px-6 text-center border-b border-white/5 bg-[url('/grid.svg')]">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">
          Live Offers Inventory
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-lg">
          Verified high-payout campaigns. Click to apply directly.
        </p>
      </div>

      {/* --- CONTROLS --- */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          
          {/* Tabs */}
          <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
            {['All', 'Finance', 'Apps'].map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  filter === tab 
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-64 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search offer..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all placeholder:text-gray-600"
            />
          </div>
        </div>

        {/* --- GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((c) => (
            <div 
              key={c.id}
              className="group relative bg-zinc-900/50 border border-white/5 rounded-2xl p-6 hover:border-emerald-500/30 hover:bg-zinc-900 transition-all duration-300 overflow-hidden flex flex-col justify-between"
            >
              {/* Glow Effect */}
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${c.color} opacity-10 blur-[50px] group-hover:opacity-20 transition-opacity`} />

              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    {/* Avatar Placeholder */}
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center text-xl font-bold text-white shadow-lg`}>
                      {c.name[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg group-hover:text-emerald-400 transition-colors">{c.name}</h3>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        {['Finance','Banking','Demat','Crypto','Credit Card'].includes(c.category) ? <Briefcase size={12}/> : <Smartphone size={12}/>}
                        {c.category}
                      </span>
                    </div>
                  </div>
                  
                  {/* Verified Badge */}
                  <div className="bg-emerald-500/10 px-2 py-1 rounded text-[10px] font-bold text-emerald-400 border border-emerald-500/20 tracking-wider">
                    VERIFIED
                  </div>
                </div>

                {/* Special Code Logic (For Qoneqt) */}
                {c.specialCode && (
                  <div className="mb-4 bg-white/5 p-3 rounded-lg border border-dashed border-white/20 flex justify-between items-center">
                    <div className="text-xs text-gray-400">
                      Code: <span className="text-white font-mono font-bold ml-1">{c.specialCode}</span>
                    </div>
                    <button onClick={() => copyCode(c.specialCode)} className="text-gray-400 hover:text-white transition-colors">
                      {copied ? <Check size={14} className="text-emerald-500"/> : <Copy size={14}/>}
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-black/40 rounded-lg p-3 border border-white/5">
                    <div className="text-xs text-gray-500 mb-1">Payout</div>
                    <div className="text-emerald-400 font-bold text-xl">{c.payout}</div>
                  </div>
                  <div className="bg-black/40 rounded-lg p-3 border border-white/5">
                    <div className="text-xs text-gray-500 mb-1">Settlement</div>
                    <div className="text-white font-medium flex items-center gap-1">
                      <Zap size={12} className="text-yellow-400"/> {c.time}
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTON */}
              <a 
                href={c.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <button className="w-full py-3 bg-white text-black rounded-xl text-sm font-bold hover:bg-emerald-500 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/5">
                  Start Campaign <ArrowRight size={16} />
                </button>
              </a>

            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCampaigns.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            No campaigns found matching your filter.
          </div>
        )}
      </div>

    </div>
  );
}