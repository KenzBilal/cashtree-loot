'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Mail, Search, Filter, CheckCircle, Clock, Trash2, RefreshCcw, Lock } from 'lucide-react';

// --- CONFIGURATION ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AdminConsole() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'partnership'

  useEffect(() => {
    fetchInquiries();
  }, []);

  async function fetchInquiries() {
    setLoading(true);
    const { data } = await supabase
      .from('contact_inquiries')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setInquiries(data);
    setLoading(false);
  }

  // --- ACTIONS ---
  const markAsRead = async (id) => {
    // Optimistic Update (Instant UI change)
    setInquiries(inquiries.map(i => i.id === id ? { ...i, status: 'read' } : i));
    
    await supabase.from('contact_inquiries').update({ status: 'read' }).eq('id', id);
  };

  const deleteInquiry = async (id) => {
    if (!confirm('Permanently delete this ticket?')) return;
    setInquiries(inquiries.filter(i => i.id !== id));
    await supabase.from('contact_inquiries').delete().eq('id', id);
  };

  // --- FILTER LOGIC ---
  const filteredData = inquiries.filter(item => {
    const matchesSearch = 
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.email?.toLowerCase().includes(search.toLowerCase()) ||
      item.message?.toLowerCase().includes(search.toLowerCase()) ||
      item.company?.toLowerCase().includes(search.toLowerCase());
      
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'unread' ? item.status !== 'read' :
      filter === 'partnership' ? item.category.includes('Partnership') : true;

    return matchesSearch && matchesFilter;
  });

  return (
    <div style={{minHeight: '100vh', background: '#050505', color: 'white', padding: '40px', fontFamily: 'sans-serif'}}>
      
      {/* HEADER */}
      <div style={{maxWidth: '1200px', margin: '0 auto'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px'}}>
          <div>
            <h1 style={{fontSize: '2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px', margin: 0}}>
              <Lock color="#00ff88" size={28}/> Admin Console
            </h1>
            <p style={{color: '#666', marginTop: '5px'}}>Secure Network Operations Center</p>
          </div>
          <button onClick={fetchInquiries} style={{background: '#111', border: '1px solid #333', color: '#fff', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'}}>
            <RefreshCcw size={16}/> Refresh Data
          </button>
        </div>

        {/* SEARCH & CONTROLS TOOLBAR */}
        <div style={{
          background: '#0a0a0f', border: '1px solid #222', padding: '20px', borderRadius: '16px',
          display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap'
        }}>
          
          {/* Search Bar */}
          <div style={{flex: 1, position: 'relative', minWidth: '300px'}}>
            <Search size={18} color="#666" style={{position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)'}}/>
            <input 
              type="text" 
              placeholder="Search by name, email, or message content..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%', background: '#000', border: '1px solid #333', color: 'white',
                padding: '12px 12px 12px 45px', borderRadius: '10px', fontSize: '0.95rem', outline: 'none'
              }}
            />
          </div>

          {/* Filters */}
          <div style={{display: 'flex', gap: '10px'}}>
            {['all', 'unread', 'partnership'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  background: filter === f ? '#00ff88' : '#111',
                  color: filter === f ? '#000' : '#888',
                  border: filter === f ? 'none' : '1px solid #333',
                  padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', textTransform: 'capitalize'
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* DATA GRID */}
        {loading ? (
          <div style={{textAlign: 'center', padding: '60px', color: '#444'}}>Loading Secure Data...</div>
        ) : (
          <div style={{display: 'grid', gap: '15px'}}>
            {filteredData.length === 0 ? (
              <div style={{textAlign: 'center', padding: '60px', border: '1px dashed #333', borderRadius: '16px', color: '#666'}}>
                No matching records found.
              </div>
            ) : (
              filteredData.map((item) => (
                <div key={item.id} style={{
                  background: item.status === 'read' ? 'rgba(255,255,255,0.02)' : 'rgba(0, 255, 136, 0.03)', 
                  border: item.status === 'read' ? '1px solid #222' : '1px solid rgba(0, 255, 136, 0.2)',
                  borderRadius: '16px', padding: '25px', position: 'relative', transition: '0.2s'
                }}>
                  
                  {/* Status Indicator */}
                  {item.status !== 'read' && (
                    <div style={{position: 'absolute', top: '25px', right: '25px', display: 'flex', gap: '10px'}}>
                      <span style={{background: '#00ff88', color: 'black', fontSize: '0.7rem', fontWeight: '800', padding: '4px 8px', borderRadius: '4px'}}>NEW</span>
                    </div>
                  )}

                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px'}}>
                    <div>
                      <h3 style={{fontSize: '1.2rem', fontWeight: '700', color: 'white', marginBottom: '5px'}}>{item.name}</h3>
                      <div style={{display: 'flex', gap: '15px', color: '#888', fontSize: '0.9rem'}}>
                        <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}><Mail size={14}/> {item.email}</span>
                        {item.company && <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}>🏢 {item.company}</span>}
                        <span style={{color: '#444'}}>• {new Date(item.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{background: '#000', padding: '15px', borderRadius: '10px', color: '#ccc', lineHeight: '1.6', fontSize: '0.95rem', border: '1px solid #222'}}>
                    <strong style={{display: 'block', color: '#00ff88', marginBottom: '8px', fontSize: '0.8rem', textTransform: 'uppercase'}}>{item.category}</strong>
                    {item.message}
                  </div>

                  {/* Action Footer */}
                  <div style={{marginTop: '20px', display: 'flex', gap: '15px', justifyContent: 'flex-end'}}>
                    {item.status !== 'read' && (
                      <button onClick={() => markAsRead(item.id)} style={{background: 'white', color: 'black', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px'}}>
                        <CheckCircle size={14}/> Mark Read
                      </button>
                    )}
                    <button onClick={() => deleteInquiry(item.id)} style={{background: 'rgba(255,0,0,0.1)', color: '#ff4444', border: '1px solid rgba(255,0,0,0.2)', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'}}>
                      <Trash2 size={14}/> Delete
                    </button>
                  </div>

                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}