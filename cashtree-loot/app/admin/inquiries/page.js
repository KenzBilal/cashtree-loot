'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Mail, Clock, CheckCircle } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInquiries();
  }, []);

  async function fetchInquiries() {
    const { data } = await supabase
      .from('contact_inquiries')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setInquiries(data);
    setLoading(false);
  }

  return (
    <div style={{padding: '40px', background: '#000', minHeight: '100vh', color: 'white'}}>
      <h1 style={{fontSize: '2rem', fontWeight: 'bold', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px'}}>
        <Mail color="#00ff88" /> Support Inquiries
      </h1>

      {loading ? (
        <div style={{color: '#888'}}>Loading messages...</div>
      ) : (
        <div style={{display: 'grid', gap: '20px'}}>
          {inquiries.map((msg) => (
            <div key={msg.id} style={{
              background: '#0a0a0f', border: '1px solid #333', padding: '25px', borderRadius: '16px'
            }}>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '15px'}}>
                <div>
                  <h3 style={{fontSize: '1.2rem', fontWeight: 'bold', color: 'white'}}>{msg.name}</h3>
                  <div style={{color: '#00ff88', fontSize: '0.9rem'}}>{msg.category}</div>
                </div>
                <div style={{textAlign: 'right', color: '#666', fontSize: '0.8rem'}}>
                  <div>{new Date(msg.created_at).toLocaleDateString()}</div>
                  <div>{new Date(msg.created_at).toLocaleTimeString()}</div>
                </div>
              </div>
              
              <div style={{background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', color: '#ddd', lineHeight: '1.6', marginBottom: '15px'}}>
                {msg.message}
              </div>

              <div style={{display: 'flex', gap: '20px', fontSize: '0.9rem', color: '#888'}}>
                <span>📧 {msg.email}</span>
                {msg.company && <span>🏢 {msg.company}</span>}
                {msg.phone && <span>📱 {msg.phone}</span>}
              </div>
            </div>
          ))}
          
          {inquiries.length === 0 && (
             <div style={{padding: '40px', textAlign: 'center', border: '1px dashed #333', borderRadius: '16px', color: '#666'}}>
                No inquiries found.
             </div>
          )}
        </div>
      )}
    </div>
  );
}