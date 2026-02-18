'use client';

import { useState, useEffect, useRef } from 'react';
import { toggleCampaignStatus, updateCampaign, deleteCampaign } from './actions';
import { Settings, ExternalLink, X, Save, Loader2, Trash2, Zap, Search } from 'lucide-react';

// ── Constants outside component ──
const NEON = '#00ff88';

const cardBase = {
  background: '#0a0a0f',
  borderRadius: '20px',
  padding: '24px',
  position: 'relative',
  transition: 'opacity 0.3s, border-color 0.3s',
};

const actionBtn = {
  background: '#141414',
  color: '#fff',
  border: '1px solid #222',
  borderRadius: '10px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background 0.15s',
};

export default function CampaignManager({ initialCampaigns }) {
  const [list, setList]       = useState(initialCampaigns);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Brand intelligence
  const [brandInput, setBrandInput]     = useState('');
  const [detectedIcon, setDetectedIcon] = useState('');

  // Keep a ref to editing.id so the async save can still reference it after modal closes
  const editingIdRef = useRef(null);

  // Sync icon state when opening edit modal
  useEffect(() => {
    if (editing) {
      setDetectedIcon(editing.icon_url || '');
      setBrandInput('');
      setSaveError(null);
      editingIdRef.current = editing.id;
    }
  }, [editing]);

  // Auto-fetch brand logo with 500ms debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!brandInput) return;
      const clean = brandInput.toLowerCase().trim();
      if (clean.includes('.')) {
        setDetectedIcon(
          `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${clean}&size=256`
        );
      } else {
        setDetectedIcon(`https://cdn.simpleicons.org/${clean}/white`);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [brandInput]);

  // ── 1. TOGGLE STATUS ──
  const handleToggle = async (id, currentStatus) => {
    // Optimistic update
    setList(prev => prev.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c));
    const res = await toggleCampaignStatus(id, currentStatus);
    if (!res.success) {
      // Roll back
      setList(prev => prev.map(c => c.id === id ? { ...c, is_active: currentStatus } : c));
    }
  };

  // ── 2. DELETE ──
  const handleDelete = async (id) => {
    if (!confirm('Are you sure? This will permanently delete this campaign.')) return;
    // Optimistic remove
    setList(prev => prev.filter(c => c.id !== id));
    const res = await deleteCampaign(id);
    if (!res.success) {
      // Can't easily restore — reload to re-sync
      alert('Delete failed: ' + res.error);
      window.location.reload();
    }
  };

  // ── 3. SAVE EDITS ──
  // Flow: validate client-side → show loading → call server → handle result
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSaveError(null);

    const formData = new FormData(e.target);
    if (detectedIcon) formData.set('icon_url', detectedIcon);

    const campaignId = editingIdRef.current;

    const res = await updateCampaign(campaignId, formData);

    if (!res.success) {
      // Show error INSIDE the modal — don't close it
      setSaveError(res.error);
      setLoading(false);
      return;
    }

    // Success — apply optimistic update then close
    const updates = Object.fromEntries(formData.entries());
    setList(prev => prev.map(c => c.id === campaignId ? { ...c, ...updates, icon_url: updates.icon_url || c.icon_url } : c));
    setLoading(false);
    setEditing(null);
  };

  return (
    <div>
      <style>{`
        .camp-card:hover { border-color: #2a2a2a !important; }
        .camp-action-btn:hover { background: #1e1e1e !important; }
        .delete-btn:hover { background: rgba(239,68,68,0.18) !important; }
        .ext-btn:hover { background: #1e1e1e !important; }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .modal-panel { animation: slideUp 0.22s ease-out; }
      `}</style>

      {/* ── CAMPAIGN GRID ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px',
      }}>
        {list.map((camp) => (
          <div
            key={camp.id}
            className="camp-card"
            style={{
              ...cardBase,
              border: camp.is_active ? '1px solid #222' : '1px solid #161616',
              opacity: camp.is_active ? 1 : 0.55,
            }}
          >
            {/* Card header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '12px', overflow: 'hidden', flex: 1 }}>
                <div style={{
                  flexShrink: 0,
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: '#111',
                  backgroundImage: camp.icon_url ? `url(${camp.icon_url})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: '1px solid #1e1e1e',
                }} />
                <div style={{ overflow: 'hidden' }}>
                  <div style={{
                    color: '#fff',
                    fontWeight: '700',
                    fontSize: '14px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {camp.title}
                  </div>
                  <div style={{
                    color: '#555',
                    fontSize: '10px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    marginTop: '3px',
                  }}>
                    {camp.category || 'Uncategorised'}
                  </div>
                </div>
              </div>

              {/* Toggle switch */}
              <button
                onClick={() => handleToggle(camp.id, camp.is_active)}
                aria-label={camp.is_active ? 'Deactivate' : 'Activate'}
                style={{
                  flexShrink: 0,
                  width: '44px',
                  height: '24px',
                  borderRadius: '20px',
                  background: camp.is_active ? NEON : '#2a2a2a',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background 0.25s',
                  boxShadow: camp.is_active ? `0 0 12px ${NEON}55` : 'none',
                }}
              >
                <div style={{
                  width: '18px',
                  height: '18px',
                  background: '#fff',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: '3px',
                  left: camp.is_active ? '23px' : '3px',
                  transition: 'left 0.25s',
                }} />
              </button>
            </div>

            {/* Metrics */}
            <div style={{
              display: 'flex',
              gap: '10px',
              background: '#060606',
              padding: '12px',
              borderRadius: '12px',
              marginBottom: '20px',
              border: '1px solid #111',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '9px', color: '#444', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Total Limit
                </div>
                <div style={{ color: NEON, fontWeight: '800', fontSize: '15px', marginTop: '3px' }}>
                  ₹{camp.payout_amount ?? 0}
                </div>
              </div>
              <div style={{ width: '1px', background: '#1a1a1a' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '9px', color: '#444', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Cashback
                </div>
                <div style={{ color: '#fff', fontWeight: '800', fontSize: '15px', marginTop: '3px' }}>
                  ₹{camp.user_reward ?? 0}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setEditing(camp)}
                className="camp-action-btn"
                style={{ ...actionBtn, flex: 1, padding: '11px', fontSize: '11px', fontWeight: '700', gap: '7px' }}
              >
                <Settings size={13} /> EDIT
              </button>

              <a
                href={camp.landing_url}
                target="_blank"
                rel="noreferrer"
                className="ext-btn"
                style={{ ...actionBtn, width: '40px', textDecoration: 'none', color: '#666' }}
              >
                <ExternalLink size={15} />
              </a>

              <button
                onClick={() => handleDelete(camp.id)}
                className="delete-btn"
                style={{
                  ...actionBtn,
                  width: '40px',
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.15)',
                  color: '#ef4444',
                }}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}

        {list.length === 0 && (
          <div style={{
            gridColumn: '1/-1',
            padding: '80px 20px',
            textAlign: 'center',
            color: '#333',
            fontSize: '14px',
          }}>
            No campaigns yet. Deploy your first one.
          </div>
        )}
      </div>

      {/* ── EDIT MODAL ── */}
      {editing && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          // Close on backdrop click
          onClick={(e) => { if (e.target === e.currentTarget) setEditing(null); }}
        >
          <div
            className="modal-panel"
            style={{
              background: '#0a0a0f',
              border: '1px solid #2a2a2a',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '460px',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: '28px',
              boxShadow: '0 30px 60px rgba(0,0,0,0.8)',
            }}
          >
            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ color: '#fff', margin: 0, fontSize: '16px', fontWeight: '800', letterSpacing: '-0.3px' }}>
                Edit Campaign
              </h2>
              <button
                onClick={() => setEditing(null)}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #222', color: '#888', cursor: 'pointer', borderRadius: '8px', padding: '6px', display: 'flex' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Inline error */}
            {saveError && (
              <div style={{
                padding: '12px 16px',
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: '10px',
                color: '#ef4444',
                fontSize: '13px',
                fontWeight: '600',
                marginBottom: '20px',
              }}>
                ⚠ {saveError}
              </div>
            )}

            <form onSubmit={handleSave} style={{ display: 'grid', gap: '14px' }}>

              {/* Brand Identity */}
              <div style={{ background: '#0f0f0f', padding: '16px', borderRadius: '14px', border: '1px dashed #2a2a2a' }}>
                <div style={{ fontSize: '10px', fontWeight: '800', color: '#444', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Zap size={11} color={NEON} /> Update Logo
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input
                    placeholder="Brand name or domain…"
                    value={brandInput}
                    onChange={(e) => setBrandInput(e.target.value)}
                    style={{
                      flex: 1,
                      background: '#000',
                      border: '1px solid #222',
                      borderRadius: '10px',
                      padding: '11px 14px',
                      color: '#fff',
                      outline: 'none',
                      fontSize: '13px',
                    }}
                  />
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: '#000',
                    border: `1px solid ${detectedIcon ? NEON : '#222'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'border-color 0.2s',
                    flexShrink: 0,
                  }}>
                    {detectedIcon
                      ? <img src={detectedIcon} alt="" style={{ width: '24px', height: '24px', objectFit: 'contain' }} onError={() => setDetectedIcon('')} />
                      : <Search size={15} color="#333" />
                    }
                  </div>
                </div>
                <input type="hidden" name="icon_url" value={detectedIcon} />
              </div>

              <ModalInput label="Title"                name="title"          defaultValue={editing.title} />
              <ModalInput label="URL Slug"             name="landing_url"    defaultValue={editing.landing_url} />
              <ModalInput label="Affiliate Link"       name="affiliate_link" defaultValue={editing.affiliate_link} placeholder="https://tracking..." />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <ModalInput label="Total Limit (₹)"   name="payout_amount"  type="number" defaultValue={editing.payout_amount} />
                <ModalInput label="Cashback (₹)"      name="user_reward"    type="number" defaultValue={editing.user_reward} />
              </div>

              <ModalInput label="Category" name="category" defaultValue={editing.category} />

              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#444', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  Instructions
                </label>
                <textarea
                  name="description"
                  defaultValue={editing.description}
                  rows={3}
                  style={{
                    width: '100%',
                    background: '#000',
                    border: '1px solid #1e1e1e',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    lineHeight: 1.5,
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  background: loading ? '#1a1a1a' : NEON,
                  color: loading ? '#666' : '#000',
                  border: 'none',
                  padding: '15px',
                  borderRadius: '12px',
                  fontWeight: '800',
                  fontSize: '13px',
                  cursor: loading ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  transition: 'background 0.2s, color 0.2s',
                  marginTop: '4px',
                }}
              >
                {loading
                  ? <><SpinnerIcon /> Saving…</>
                  : <><Save size={16} /> Update Campaign</>
                }
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Pure CSS spinner — no Tailwind required ──
function SpinnerIcon() {
  return (
    <svg
      width="16" height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      style={{ animation: 'spin 0.7s linear infinite' }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

// ── Modal input helper ──
function ModalInput({ label, name, defaultValue, type = 'text', placeholder }) {
  return (
    <div>
      <label style={{
        display: 'block',
        fontSize: '10px',
        fontWeight: '800',
        color: '#444',
        marginBottom: '6px',
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
      }}>
        {label}
      </label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue ?? ''}
        placeholder={placeholder}
        style={{
          width: '100%',
          background: '#000',
          border: '1px solid #1e1e1e',
          borderRadius: '10px',
          padding: '11px 14px',
          color: '#fff',
          outline: 'none',
          fontSize: '13px',
          fontWeight: '600',
        }}
        onFocus={(e)  => e.target.style.borderColor = '#333'}
        onBlur={(e)   => e.target.style.borderColor = '#1e1e1e'}
      />
    </div>
  );
}