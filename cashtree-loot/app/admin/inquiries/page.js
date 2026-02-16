'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Mail, Search, Filter, CheckCircle2, Clock, Trash2, 
  RefreshCw, ShieldAlert, MoreVertical, Building, User
} from 'lucide-react';

// --- CONFIGURATION ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'partnership' | 'support'

  useEffect(() => {
    fetchInquiries();
  }, []);

  async function fetchInquiries() {
    setLoading(true);
    const { data, error } = await supabase
      .from('contact_inquiries')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setInquiries(data);
    setLoading(false);
  }

  // --- ACTIONS ---
  const markAsRead = async (id) => {
    // Optimistic Update (Instant UI change)
    setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: 'read' } : i));
    await supabase.from('contact_inquiries').update({ status: 'read' }).eq('id', id);
  };

  const deleteInquiry = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this ticket?')) return;
    setInquiries(prev => prev.filter(i => i.id !== id));
    await supabase.from('contact_inquiries').delete().eq('id', id);
  };

  // --- FILTER LOGIC ---
  const filteredData = inquiries.filter(item => {
    const term = search.toLowerCase();
    const matchesSearch = 
      item.name?.toLowerCase().includes(term) ||
      item.email?.toLowerCase().includes(term) ||
      item.message?.toLowerCase().includes(term) ||
      item.company?.toLowerCase().includes(term);
      
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'unread' ? item.status !== 'read' :
      filter === 'partnership' ? item.category?.toLowerCase().includes('partner') :
      filter === 'support' ? item.category?.toLowerCase().includes('support') : true;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 font-sans">
      
      {/* --- HEADER --- */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-3">
            <span className="p-2 bg-[#00ff88]/10 rounded-lg text-[#00ff88]">
              <Mail size={24} />
            </span>
            Inquiries & Support
          </h1>
          <p className="text-gray-500 mt-1 ml-1">Manage incoming tickets and partnership requests.</p>
        </div>
        
        <button 
          onClick={fetchInquiries} 
          className="flex items-center gap-2 px-4 py-2 bg-[#111] hover:bg-[#222] border border-[#333] rounded-lg transition-all text-sm font-medium text-gray-300"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh Data
        </button>
      </div>

      {/* --- CONTROLS TOOLBAR --- */}
      <div className="max-w-6xl mx-auto bg-[#0a0a0f] border border-[#222] rounded-xl p-4 mb-8 shadow-2xl">
        <div className="flex flex-col md:flex-row gap-4">
          
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, email, or message..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#000] border border-[#333] text-white pl-12 pr-4 py-3 rounded-lg focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] outline-none transition-all placeholder:text-gray-600"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {['all', 'unread', 'partnership', 'support'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-bold capitalize whitespace-nowrap transition-all border
                  ${filter === f 
                    ? 'bg-[#00ff88] text-black border-[#00ff88] shadow-[0_0_15px_rgba(0,255,136,0.3)]' 
                    : 'bg-[#111] text-gray-400 border-[#333] hover:bg-[#222] hover:text-white'}
                `}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- DATA GRID --- */}
      <div className="max-w-6xl mx-auto space-y-4">
        
        {/* LOADING SKELETON */}
        {loading && (
          [1,2,3].map(i => (
            <div key={i} className="h-32 bg-[#0a0a0f] rounded-xl animate-pulse border border-[#222]"></div>
          ))
        )}

        {/* EMPTY STATE */}
        {!loading && filteredData.length === 0 && (
          <div className="text-center py-20 border border-dashed border-[#333] rounded-xl bg-[#0a0a0f]/50">
            <div className="inline-flex p-4 rounded-full bg-[#111] mb-4">
              <ShieldAlert size={32} className="text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-300">No tickets found</h3>
            <p className="text-gray-600">Try adjusting your filters or search terms.</p>
          </div>
        )}

        {/* TICKET CARDS */}
        {!loading && filteredData.map((item) => (
          <div 
            key={item.id} 
            className={`
              relative group p-6 rounded-xl border transition-all duration-300
              ${item.status === 'unread' 
                ? 'bg-gradient-to-r from-[#0a0a0f] to-[#0f0f15] border-[#00ff88]/30 shadow-[0_4px_20px_-10px_rgba(0,255,136,0.1)]' 
                : 'bg-[#050505] border-[#222] opacity-75 hover:opacity-100'}
            `}
          >
            {/* NEW BADGE */}
            {item.status !== 'read' && (
              <div className="absolute top-4 right-4 flex gap-2">
                <span className="flex items-center gap-1 text-[10px] font-black tracking-wider bg-[#00ff88] text-black px-2 py-1 rounded shadow-[0_0_10px_rgba(0,255,136,0.4)]">
                  NEW
                </span>
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-6">
              
              {/* Avatar / Initials */}
              <div className={`
                hidden md:flex flex-shrink-0 w-12 h-12 rounded-full items-center justify-center font-bold text-lg border
                ${item.status === 'unread' ? 'bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/20' : 'bg-[#111] text-gray-500 border-[#333]'}
              `}>
                {item.name.charAt(0)}
              </div>

              <div className="flex-1">
                {/* Top Row: Name & Category */}
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-white">{item.name}</h3>
                  <span className="px-2 py-0.5 rounded text-xs font-medium border border-[#333] bg-[#111] text-gray-400">
                    {item.category || 'General'}
                  </span>
                </div>

                {/* Meta Info */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1.5 hover:text-white transition-colors">
                    <Mail size={14} /> {item.email}
                  </div>
                  {item.company && (
                    <div className="flex items-center gap-1.5 hover:text-white transition-colors">
                      <Building size={14} /> {item.company}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Clock size={14} /> {new Date(item.created_at).toLocaleString()}
                  </div>
                </div>

                {/* Message Body */}
                <div className="bg-[#000] p-4 rounded-lg border border-[#222] text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {item.message}
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex gap-3 justify-end opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.status !== 'read' && (
                    <button 
                      onClick={() => markAsRead(item.id)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-white text-black rounded hover:bg-gray-200 transition font-bold text-xs"
                    >
                      <CheckCircle2 size={14} /> MARK READ
                    </button>
                  )}
                  <button 
                    onClick={() => deleteInquiry(item.id)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded hover:bg-red-500/20 transition font-bold text-xs"
                  >
                    <Trash2 size={14} /> DELETE
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}