'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Mail, Search, CheckCircle2, Trash2, RefreshCw, 
  ShieldAlert, Building, Clock, X, AlertTriangle
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
  const [filter, setFilter] = useState('all'); 
  
  // NEW STATE: For the custom delete modal
  const [deleteTarget, setDeleteTarget] = useState(null); // Stores the ID of ticket to delete

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

  const markAsRead = async (id) => {
    setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: 'read' } : i));
    await supabase.from('contact_inquiries').update({ status: 'read' }).eq('id', id);
  };

  // 1. OPEN MODAL (Instead of window.confirm)
  const requestDelete = (id) => {
    setDeleteTarget(id);
  };

  // 2. ACTUAL DELETE ACTION
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    
    // Optimistic remove
    setInquiries(prev => prev.filter(i => i.id !== deleteTarget));
    
    // DB remove
    await supabase.from('contact_inquiries').delete().eq('id', deleteTarget);
    
    // Close modal
    setDeleteTarget(null);
  };

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
      filter === 'partnership' ? item.category?.toLowerCase().includes('partner') : true;

    return matchesSearch && matchesFilter;
  });

  return (
    <div style={{
      minHeight: '100vh', 
      background: '#050505', 
      color: 'white', 
      padding: '40px', 
      fontFamily: '"Inter", sans-serif',
      position: 'relative' // Needed for modal positioning
    }}>
      
      {/* --- HEADER --- */}
      <div style={{maxWidth: '1000px', margin: '0 auto', marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div>
          <h1 style={{fontSize: '2.2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '15px', margin: 0, textShadow: '0 0 30px rgba(0,255,136,0.2)'}}>
            <span style={{color: '#00ff88'}}>Inquiries</span> & Support
          </h1>
          <p style={{color: '#666', marginTop: '8px', fontSize: '1rem'}}>Manage incoming tickets and partnership requests.</p>
        </div>
        
        <button 
          onClick={fetchInquiries} 
          onMouseOver={(e) => e.target.style.background = '#222'}
          onMouseOut={(e) => e.target.style.background = '#111'}
          style={{
            background: '#111', border: '1px solid #333', color: '#fff', 
            padding: '12px 20px', borderRadius: '10px', cursor: 'pointer', 
            display: 'flex', alignItems: 'center', gap: '10px', transition: '0.2s',
            fontWeight: '600', fontSize: '0.9rem'
          }}
        >
          <RefreshCw size={18} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </div>

      {/* --- CONTROLS --- */}
      <div style={{
        maxWidth: '1000px', margin: '0 auto 30px', 
        background: '#0a0a0f', border: '1px solid #222', borderRadius: '16px', 
        padding: '20px', display: 'flex', gap: '20px', alignItems: 'center',
        boxShadow: '0 20px 50px -10px rgba(0,0,0,0.5)'
      }}>
        <div style={{flex: 1, position: 'relative'}}>
          <Search size={18} color="#666" style={{position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)'}}/>
          <input 
            type="text" 
            placeholder="Search tickets..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%', background: '#000', border: '1px solid #333', color: 'white',
              padding: '14px 14px 14px 45px', borderRadius: '10px', fontSize: '0.95rem', outline: 'none',
              transition: 'border 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#00ff88'}
            onBlur={(e) => e.target.style.borderColor = '#333'}
          />
        </div>

        <div style={{display: 'flex', gap: '10px'}}>
          {['all', 'unread', 'partnership'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', 
                fontWeight: '600', textTransform: 'capitalize', fontSize: '0.9rem',
                transition: '0.2s',
                background: filter === f ? '#00ff88' : '#111',
                color: filter === f ? '#000' : '#888',
                border: filter === f ? '1px solid #00ff88' : '1px solid #333',
                boxShadow: filter === f ? '0 0 20px rgba(0,255,136,0.3)' : 'none'
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* --- LIST --- */}
      <div style={{maxWidth: '1000px', margin: '0 auto', display: 'grid', gap: '20px'}}>
        {loading ? (
           <div style={{textAlign: 'center', padding: '60px', color: '#444'}}>Loading Secure Data...</div>
        ) : filteredData.length === 0 ? (
          <div style={{textAlign: 'center', padding: '60px', border: '2px dashed #222', borderRadius: '16px', color: '#444'}}>
            <ShieldAlert size={48} style={{opacity: 0.2, marginBottom: '20px'}}/>
            <h3>No tickets found matching your criteria.</h3>
          </div>
        ) : (
          filteredData.map((item) => (
            <div key={item.id} style={{
              background: item.status === 'unread' 
                ? 'linear-gradient(90deg, rgba(0,255,136,0.03) 0%, rgba(0,0,0,0) 100%)' 
                : 'rgba(255,255,255,0.02)',
              border: item.status === 'unread' ? '1px solid rgba(0,255,136,0.3)' : '1px solid #222',
              borderRadius: '16px', padding: '25px', position: 'relative',
              boxShadow: item.status === 'unread' ? '0 0 30px -10px rgba(0,255,136,0.1)' : 'none',
              transition: '0.2s'
            }}>
              {item.status === 'unread' && (
                <div style={{
                  position: 'absolute', top: '20px', right: '20px',
                  background: '#00ff88', color: '#000', fontSize: '0.7rem', fontWeight: '800',
                  padding: '5px 10px', borderRadius: '6px', letterSpacing: '1px'
                }}>
                  NEW
                </div>
              )}

              <div style={{display: 'flex', gap: '20px', alignItems: 'flex-start', marginBottom: '20px'}}>
                <div style={{
                  width: '50px', height: '50px', borderRadius: '50%', 
                  background: item.status === 'unread' ? 'rgba(0,255,136,0.1)' : '#111',
                  color: item.status === 'unread' ? '#00ff88' : '#666',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '700', fontSize: '1.2rem', border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  {item.name.charAt(0)}
                </div>

                <div style={{flex: 1}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px'}}>
                    <h3 style={{fontSize: '1.1rem', fontWeight: '700', color: 'white', margin: 0}}>{item.name}</h3>
                    <span style={{fontSize: '0.75rem', background: '#111', padding: '2px 8px', borderRadius: '4px', border: '1px solid #333', color: '#888'}}>
                      {item.category || 'General'}
                    </span>
                  </div>
                  
                  <div style={{display: 'flex', gap: '15px', color: '#666', fontSize: '0.85rem'}}>
                    <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}><Mail size={12}/> {item.email}</span>
                    {item.company && <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}><Building size={12}/> {item.company}</span>}
                    <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}><Clock size={12}/> {new Date(item.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div style={{
                background: '#000', padding: '20px', borderRadius: '12px', border: '1px solid #222',
                color: '#ccc', lineHeight: '1.6', fontSize: '0.95rem', marginBottom: '20px'
              }}>
                {item.message}
              </div>

              <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
                {item.status !== 'read' && (
                  <button 
                    onClick={() => markAsRead(item.id)}
                    onMouseOver={(e) => e.target.style.background = '#ddd'}
                    onMouseOut={(e) => e.target.style.background = '#fff'}
                    style={{
                      background: '#fff', color: '#000', border: 'none', padding: '8px 16px',
                      borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem',
                      display: 'flex', alignItems: 'center', gap: '6px', transition: '0.2s'
                    }}
                  >
                    <CheckCircle2 size={16}/> Mark Read
                  </button>
                )}
                <button 
                  onClick={() => requestDelete(item.id)} // <--- TRIGGER MODAL
                  onMouseOver={(e) => {e.target.style.background = 'rgba(255,0,0,0.15)'; e.target.style.borderColor = 'rgba(255,0,0,0.4)'}}
                  onMouseOut={(e) => {e.target.style.background = 'rgba(255,0,0,0.1)'; e.target.style.borderColor = 'rgba(255,0,0,0.2)'}}
                  style={{
                    background: 'rgba(255,0,0,0.1)', color: '#ff4444', border: '1px solid rgba(255,0,0,0.2)',
                    padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem',
                    display: 'flex', alignItems: 'center', gap: '6px', transition: '0.2s'
                  }}
                >
                  <Trash2 size={16}/> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- CUSTOM 10/10 DELETE MODAL --- */}
      {deleteTarget && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            width: '90%', maxWidth: '400px', background: '#0a0a0f',
            border: '1px solid #333', borderRadius: '20px', padding: '30px',
            textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
            transform: 'scale(1)', animation: 'popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <div style={{
              width: '60px', height: '60px', background: 'rgba(255,0,0,0.1)',
              color: '#ff4444', borderRadius: '50%', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
              border: '1px solid rgba(255,0,0,0.2)'
            }}>
              <AlertTriangle size={28} />
            </div>

            <h3 style={{color: 'white', fontSize: '1.4rem', fontWeight: '800', marginBottom: '10px'}}>
              Delete Ticket?
            </h3>
            <p style={{color: '#888', marginBottom: '30px', fontSize: '0.95rem', lineHeight: '1.5'}}>
              This action cannot be undone. This inquiry will be permanently removed from the database.
            </p>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
              <button 
                onClick={() => setDeleteTarget(null)}
                style={{
                  background: 'transparent', border: '1px solid #333', color: '#ccc',
                  padding: '14px', borderRadius: '10px', fontSize: '0.9rem', fontWeight: '600',
                  cursor: 'pointer', transition: '0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#111'}
                onMouseOut={(e) => e.target.style.background = 'transparent'}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                style={{
                  background: '#ff4444', border: 'none', color: '#000',
                  padding: '14px', borderRadius: '10px', fontSize: '0.9rem', fontWeight: '700',
                  cursor: 'pointer', boxShadow: '0 5px 20px rgba(255, 68, 68, 0.3)'
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ANIMATIONS --- */}
      <style jsx global>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}