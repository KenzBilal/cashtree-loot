'use client';

import { useState, useEffect, useRef, useId } from 'react';
import Link from 'next/link';
import { MessageCircle, ChevronDown, CheckCircle2, Briefcase, ArrowLeft } from 'lucide-react';

const NEON = '#00ff88';

const CATEGORIES = [
  'General Inquiry',
  'Advertiser Partnership (Traffic Source)',
  'Publisher Support (Tracking/Payouts)',
  'Bug Bounty / Security Report',
  'Legal & Compliance',
];

const EMPTY = {
  name: '', email: '', phone: '',
  company: '', category: CATEGORIES[0], message: '',
};

const MAX_MESSAGE_LENGTH = 2000;

// ── STYLES ──────────────────────────────────────────────────────────────────
const styles = `
  @keyframes fadeUp   { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes dropIn   { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin     { to { transform:rotate(360deg); } }
  @keyframes popIn    { from { transform:scale(0.95); opacity:0; } to { transform:scale(1); opacity:1; } }

  .ct-input, .ct-textarea {
    width:100%; background:#000; border:1px solid #1e1e1e;
    border-radius:11px; padding:12px 14px; color:#fff;
    font-size:13px; font-weight:600; outline:none;
    font-family:inherit; transition:border-color 0.18s, box-shadow 0.18s;
    box-sizing:border-box;
  }
  .ct-input::placeholder, .ct-textarea::placeholder { color:#333; }
  .ct-input:focus, .ct-textarea:focus {
    border-color:#2e2e2e; box-shadow:0 0 0 3px rgba(0,255,136,0.05);
  }
  .ct-textarea {
    resize:vertical; min-height:120px; line-height:1.6;
  }

  .ct-method:hover { border-color:#2a2a2a !important; background:rgba(255,255,255,0.03) !important; }
  .ct-method-tg:hover { border-color:rgba(34,158,217,0.4) !important; background:rgba(34,158,217,0.08) !important; }
  .ct-submit:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 10px 30px rgba(0,255,136,0.25) !important; }
  .ct-submit:disabled { opacity:0.7; cursor:wait; }
  .ct-back:hover { color:#fff !important; }

  .ct-drop-opt:hover { background:rgba(0,255,136,0.08) !important; color:#00ff88 !important; }
  .ct-drop-opt.active { color:#00ff88; background:rgba(0,255,136,0.05); }
  .ct-drop-opt:focus-visible {
    outline: 2px solid rgba(0,255,136,0.6);
    outline-offset: -2px;
    background:rgba(0,255,136,0.08) !important;
    color:#00ff88 !important;
  }

  .ct-card { animation: fadeUp 0.5s ease-out; }
  .ct-success { animation: popIn 0.4s cubic-bezier(0.16,1,0.3,1); }

  @media(max-width:900px) {
    .ct-split { grid-template-columns:1fr !important; }
    .ct-left { order:2; }
    .ct-right { order:1; }
  }
  @media(max-width:560px) {
    .ct-form-row { grid-template-columns:1fr !important; }
  }
`;

// ── COMPONENT ────────────────────────────────────────────────────────────────
export default function ContactPage() {
  const [form, setForm]     = useState(EMPTY);
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const [dropOpen, setDrop] = useState(false);
  const [ticketId, setTicketId] = useState('');

  const dropRef = useRef(null);
  const dropTriggerId = useId();
  const dropListId = useId();

  // Generate ticket ID only on client to avoid hydration mismatch
  useEffect(() => {
    setTicketId(`CT-${Math.floor(10000 + Math.random() * 90000)}`);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropOpen) return;
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDrop(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropOpen]);

  // Close dropdown on Escape key
  useEffect(() => {
    if (!dropOpen) return;
    const handler = (e) => { if (e.key === 'Escape') setDrop(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [dropOpen]);

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    // Clear error banner as soon as user edits anything
    if (status === 'error') setStatus('idle');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, ticketId }),
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        // Use server-returned ticket ID if provided, else keep client-generated one
        if (data?.ticketId) setTicketId(data.ticketId);
        setStatus('success');
        setForm(EMPTY);
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data?.message || 'Something went wrong. Please try again or contact us via Telegram.');
        setStatus('error');
      }
    } catch {
      setErrorMsg('Network error. Please check your connection and try again.');
      setStatus('error');
    }
  };

  const isSubmitting = status === 'submitting';

  // Keyboard navigation for dropdown
  const handleDropKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setDrop(o => !o);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!dropOpen) { setDrop(true); return; }
      const idx = CATEGORIES.indexOf(form.category);
      set('category', CATEGORIES[Math.min(idx + 1, CATEGORIES.length - 1)]);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const idx = CATEGORIES.indexOf(form.category);
      set('category', CATEGORIES[Math.max(idx - 1, 0)]);
    }
  };

  return (
    <div style={{ paddingBottom: '80px' }}>
      <style>{styles}</style>

      {/* ── AMBIENT GLOW ── */}
      <div style={{
        position: 'fixed', top: '10%', left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(600px, 100vw)', height: '500px',
        background: 'rgba(0,255,136,0.04)',
        filter: 'blur(100px)', zIndex: 0, pointerEvents: 'none',
      }} />

      {/* ── BACK LINK ── */}
      <div style={{ marginBottom: '32px' }}>
        <Link
          href="/"
          className="ct-back"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            color: '#444', fontSize: '12px', fontWeight: '800',
            textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.8px',
            transition: 'color 0.18s',
          }}
        >
          <ArrowLeft size={13} /> Back to Home
        </Link>
      </div>

      {/* ── HEADER ── */}
      <div style={{ marginBottom: '40px', paddingBottom: '28px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <h1 style={{
          fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: '900',
          color: '#fff', margin: '0 0 6px', letterSpacing: '-0.8px',
        }}>
          Get in <span style={{ color: '#444' }}>Touch</span>
        </h1>
        <p style={{ margin: 0, fontSize: '11px', fontWeight: '700', color: '#444', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Enterprise support &amp; partnerships
        </p>
      </div>

      {/* ── SPLIT LAYOUT ── */}
      <div
        className="ct-split"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.6fr',
          gap: '28px',
          position: 'relative', zIndex: 1,
          alignItems: 'start',
        }}
      >

        {/* ── LEFT ── */}
        <div className="ct-left ct-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Intro card */}
          <div style={{
            background: '#080808', border: '1px solid #1a1a1a',
            borderRadius: '18px', padding: '28px 24px',
          }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '4px 10px', borderRadius: '20px',
              background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.15)',
              marginBottom: '20px',
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: NEON, boxShadow: `0 0 6px ${NEON}` }} />
              <span style={{ fontSize: '10px', fontWeight: '800', color: NEON, textTransform: 'uppercase', letterSpacing: '1px' }}>
                Enterprise Support
              </span>
            </div>

            <h2 style={{
              fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: '900',
              lineHeight: 1.1, color: '#fff', margin: '0 0 16px',
              letterSpacing: '-0.03em',
            }}>
              Scale with<br /><span style={{ color: NEON }}>Certainty.</span>
            </h2>

            <p style={{ color: '#666', fontSize: '13px', lineHeight: '1.7', margin: 0 }}>
              Connect directly with our network operations team. Whether you're an advertiser
              seeking traffic or a publisher reporting a tracking anomaly, we prioritize your ticket.
            </p>
          </div>

          {/* Email contact */}
          <a
            href="mailto:partners@cashttree.online"
            className="ct-method"
            style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '18px 20px',
              background: '#080808', border: '1px solid #1a1a1a',
              borderRadius: '16px', textDecoration: 'none',
              transition: 'border-color 0.2s, background 0.2s',
            }}
          >
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
              background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: NEON,
            }}>
              <Briefcase size={16} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#fff', marginBottom: '3px' }}>
                Business Partnerships
              </div>
              <div style={{ fontSize: '11px', color: '#555', fontWeight: '600' }}>
                partners@cashttree.online
              </div>
            </div>
          </a>

          {/* Telegram contact */}
          <a
            href="https://t.me/CashtTree_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="ct-method ct-method-tg"
            style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '18px 20px',
              background: 'rgba(34,158,217,0.04)',
              border: '1px solid rgba(34,158,217,0.18)',
              borderRadius: '16px', textDecoration: 'none',
              transition: 'border-color 0.2s, background 0.2s',
            }}
          >
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
              background: 'rgba(34,158,217,0.08)', border: '1px solid rgba(34,158,217,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#229ED9',
            }}>
              <MessageCircle size={16} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#229ED9', marginBottom: '3px' }}>
                Telegram Live Chat
              </div>
              <div style={{ fontSize: '11px', color: '#555', fontWeight: '600' }}>
                @CashTreeSupport · 24/7
              </div>
            </div>
          </a>

          {/* SSL badge */}
          <div style={{
            padding: '14px 18px',
            background: '#050505', border: '1px solid #111',
            borderRadius: '14px',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <span style={{ fontSize: '16px' }} aria-hidden="true">🔒</span>
            <span style={{ fontSize: '11px', color: '#444', fontWeight: '700' }}>
              All submissions are encrypted via 256-bit SSL
            </span>
          </div>
        </div>

        {/* ── RIGHT: FORM ── */}
        <div
          className="ct-right ct-card"
          style={{
            background: '#080808', border: '1px solid #1a1a1a',
            borderRadius: '20px', overflow: 'hidden',
          }}
        >
          {/* Form header */}
          <div style={{
            padding: '22px 28px', borderBottom: '1px solid #111',
            background: '#050505',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '900', color: '#fff', marginBottom: '2px' }}>
                Submit a Ticket
              </div>
              <div style={{ fontSize: '10px', color: '#444', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Response within 24 hours
              </div>
            </div>
            <div style={{
              padding: '5px 12px', borderRadius: '20px',
              background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.15)',
              fontSize: '10px', fontWeight: '800', color: NEON,
              textTransform: 'uppercase', letterSpacing: '0.8px',
            }}>
              Secure
            </div>
          </div>

          {/* SUCCESS STATE */}
          {status === 'success' ? (
            <div
              className="ct-success"
              style={{ textAlign: 'center', padding: '60px 28px' }}
              role="status"
              aria-live="polite"
            >
              <div style={{
                width: '72px', height: '72px', borderRadius: '22px',
                background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px',
              }}>
                <CheckCircle2 size={32} color={NEON} />
              </div>
              <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '900', margin: '0 0 10px', letterSpacing: '-0.03em' }}>
                Ticket Created
              </h3>
              <div style={{
                display: 'inline-block', padding: '6px 14px', borderRadius: '8px',
                background: '#111', border: '1px solid #222',
                fontFamily: 'monospace', fontSize: '13px', color: NEON,
                fontWeight: '700', marginBottom: '16px',
              }}>
                #{ticketId}
              </div>
              <p style={{ color: '#555', fontSize: '13px', lineHeight: '1.7', margin: '0 0 32px' }}>
                Our compliance team will review your submission shortly.
                Check your email for confirmation.
              </p>
              <button
                onClick={() => setStatus('idle')}
                style={{
                  background: 'transparent', border: '1px solid #222',
                  color: '#888', padding: '11px 24px', borderRadius: '11px',
                  fontSize: '11px', fontWeight: '800', cursor: 'pointer',
                  textTransform: 'uppercase', letterSpacing: '0.8px',
                }}
              >
                Submit Another
              </button>
            </div>
          ) : (

            /* ── FORM ── */
            <form onSubmit={handleSubmit} noValidate style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Name + Email */}
              <div className="ct-form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <Field label="Full Name" htmlFor="ct-name">
                  <input
                    id="ct-name"
                    type="text" required placeholder="Enter your name"
                    value={form.name} onChange={e => set('name', e.target.value)}
                    className="ct-input"
                    autoComplete="name"
                  />
                </Field>
                <Field label="Business Email" htmlFor="ct-email">
                  <input
                    id="ct-email"
                    type="email" required placeholder="name@company.com"
                    value={form.email} onChange={e => set('email', e.target.value)}
                    className="ct-input"
                    autoComplete="email"
                  />
                </Field>
              </div>

              {/* Phone + Company */}
              <div className="ct-form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <Field label="Phone (Optional)" htmlFor="ct-phone">
                  <input
                    id="ct-phone"
                    type="tel" placeholder="+1 (555) 000-0000"
                    value={form.phone} onChange={e => set('phone', e.target.value)}
                    className="ct-input"
                    autoComplete="tel"
                  />
                </Field>
                <Field label="Company / Network" htmlFor="ct-company">
                  <input
                    id="ct-company"
                    type="text" placeholder="Agency or network name"
                    value={form.company} onChange={e => set('company', e.target.value)}
                    className="ct-input"
                    autoComplete="organization"
                  />
                </Field>
              </div>

              {/* Department Dropdown */}
              <Field label="Department" htmlFor={dropTriggerId}>
                <div style={{ position: 'relative', zIndex: 50 }} ref={dropRef}>
                  <div
                    id={dropTriggerId}
                    role="combobox"
                    aria-haspopup="listbox"
                    aria-expanded={dropOpen}
                    aria-controls={dropListId}
                    aria-label="Department"
                    tabIndex={0}
                    onClick={() => setDrop(o => !o)}
                    onKeyDown={handleDropKeyDown}
                    className="ct-input"
                    style={{
                      cursor: 'pointer',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      background: dropOpen ? 'rgba(255,255,255,0.04)' : '#000',
                      userSelect: 'none',
                    }}
                  >
                    <span style={{ color: '#fff' }}>{form.category}</span>
                    <ChevronDown
                      size={15} color="#444"
                      style={{ transform: dropOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}
                    />
                  </div>

                  {dropOpen && (
                    <ul
                      id={dropListId}
                      role="listbox"
                      aria-label="Department options"
                      style={{
                        listStyle: 'none', margin: 0, padding: 0,
                        position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                        background: '#0a0a0a', border: '1px solid #222',
                        borderRadius: '13px', overflow: 'hidden',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                        animation: 'dropIn 0.15s ease-out',
                      }}
                    >
                      {CATEGORIES.map((opt) => (
                        <li
                          key={opt}
                          role="option"
                          aria-selected={form.category === opt}
                          tabIndex={0}
                          className={`ct-drop-opt ${form.category === opt ? 'active' : ''}`}
                          onClick={() => { set('category', opt); setDrop(false); }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              set('category', opt);
                              setDrop(false);
                            }
                          }}
                          style={{
                            padding: '11px 16px',
                            fontSize: '13px', fontWeight: '600',
                            color: form.category === opt ? NEON : '#888',
                            cursor: 'pointer',
                            borderBottom: '1px solid #111',
                            transition: 'background 0.15s, color 0.15s',
                          }}
                        >
                          {opt}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Field>

              {/* Message */}
              <Field label={`Detailed Description (${form.message.length}/${MAX_MESSAGE_LENGTH})`} htmlFor="ct-message">
                <textarea
                  id="ct-message"
                  required
                  placeholder="Please describe your request in detail…"
                  value={form.message}
                  onChange={e => set('message', e.target.value)}
                  maxLength={MAX_MESSAGE_LENGTH}
                  className="ct-textarea"
                />
              </Field>

              {/* Error */}
              {status === 'error' && (
                <div
                  role="alert"
                  style={{
                    padding: '12px 16px', borderRadius: '10px',
                    background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
                    fontSize: '12px', color: '#ef4444', fontWeight: '700',
                  }}
                >
                  {errorMsg}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="ct-submit"
                aria-busy={isSubmitting}
                style={{
                  width: '100%', padding: '14px',
                  background: isSubmitting ? '#1a1a1a' : '#fff',
                  color: isSubmitting ? '#555' : '#000',
                  border: 'none', borderRadius: '12px',
                  fontSize: '12px', fontWeight: '900',
                  cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  transition: 'transform 0.18s, box-shadow 0.18s, background 0.18s',
                  boxShadow: isSubmitting ? 'none' : '0 0 20px rgba(255,255,255,0.08)',
                  marginTop: '4px',
                }}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2.5" strokeLinecap="round"
                      style={{ animation: 'spin 0.8s linear infinite' }}
                      aria-hidden="true"
                    >
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Processing…
                  </>
                ) : 'Submit Request'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ── FIELD WRAPPER ──────────────────────────────────────────────────────────
function Field({ label, htmlFor, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
      <label
        htmlFor={htmlFor}
        style={{
          fontSize: '10px', fontWeight: '800', color: '#555',
          textTransform: 'uppercase', letterSpacing: '0.8px',
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}