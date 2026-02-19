'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { X, Copy, Check, Info, Settings, Save, Loader2 } from 'lucide-react';
import { savePayoutSettings } from './actions';

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Compute the effective payout split for a campaign, respecting any custom
 * settings the promoter has already saved.
 */
function getSplit(campaign, userSettings) {
  const custom = userSettings?.find((s) => s.campaign_id === campaign.id);
  const totalLimit = parseFloat(campaign.payout_amount);
  const userShare  = custom ? parseFloat(custom.user_bonus) : parseFloat(campaign.user_reward ?? 0);
  return {
    totalLimit,
    userShare:     Math.round(userShare * 100) / 100,
    promoterShare: Math.round((totalLimit - userShare) * 100) / 100,
  };
}

/**
 * Build a safe referral URL.
 * Returns null if the landing URL is missing or uses a non-http(s) scheme.
 */
function buildReferralLink(landingUrl, promoterUsername, origin) {
  if (!landingUrl || !promoterUsername) return null;

  let full = landingUrl.startsWith('http')
    ? landingUrl
    : `${origin}${landingUrl.startsWith('/') ? '' : '/'}${landingUrl}`;

  // Reject non-http(s) schemes (e.g. javascript:)
  try {
    const parsed = new URL(full);
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
  } catch {
    return null;
  }

  const sep = full.includes('?') ? '&' : '?';
  return `${full}${sep}ref=${encodeURIComponent(promoterUsername)}`;
}

/**
 * Split a description string into individual step strings, trimming whitespace.
 */
function parseSteps(text) {
  if (!text) return [];
  return text
    .split(/\n|\d+\.\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// ── Sub-components ─────────────────────────────────────────────────────────

function Badge({ text, color, bg }) {
  return (
    <span style={{
      fontSize: '10px', fontWeight: '800', color,
      background: bg, padding: '4px 8px', borderRadius: '6px',
    }}>
      {text}
    </span>
  );
}

function CampaignCard({ campaign, userSettings, index, onClick }) {
  const split = getSplit(campaign, userSettings);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Open ${campaign.title} mission`}
      onClick={onClick}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
      style={{
        background: '#0a0a0f', border: '1px solid #1a1a1a',
        borderRadius: '24px', padding: '24px', cursor: 'pointer',
        position: 'relative', transition: 'border-color 0.2s',
        animation: `slideUp 0.5s ease-out ${index * 0.05}s backwards`,
        outline: 'none',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#333')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#1a1a1a')}
      onFocus={(e) => (e.currentTarget.style.borderColor = '#00ff88')}
      onBlur={(e) => (e.currentTarget.style.borderColor = '#1a1a1a')}
    >
      {/* Card header */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '20px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={campaign.icon_url}
          alt={`${campaign.title} icon`}
          width={60} height={60}
          style={{ borderRadius: '16px', border: '1px solid #222', objectFit: 'cover', flexShrink: 0 }}
        />
        <div>
          <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: '800', lineHeight: '1.2', marginBottom: '6px', margin: '0 0 6px' }}>
            {campaign.title}
          </h3>
          <span style={{
            fontSize: '11px', background: '#1a1a1a', color: '#888',
            padding: '4px 8px', borderRadius: '6px', fontWeight: '800',
            textTransform: 'uppercase',
          }}>
            {campaign.category || 'Offer'}
          </span>
        </div>
      </div>

      {/* Payout grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px',
        background: '#111', padding: '12px', borderRadius: '14px',
      }}>
        <div>
          <div style={{ fontSize: '10px', color: '#666', fontWeight: '800', textTransform: 'uppercase' }}>YOU EARN</div>
          <div style={{ color: '#00ff88', fontSize: '18px', fontWeight: '900' }}>₹{split.promoterShare}</div>
        </div>
        <div style={{ borderLeft: '1px solid #222', paddingLeft: '12px' }}>
          <div style={{ fontSize: '10px', color: '#666', fontWeight: '800', textTransform: 'uppercase' }}>USER GETS</div>
          <div style={{ color: '#fff', fontSize: '18px', fontWeight: '900' }}>₹{split.userShare}</div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function CampaignsInterface({ campaigns, promoterId, promoterUsername, userSettings }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [selectedTask, setSelectedTask] = useState(null);
  const [copied, setCopied]             = useState(false);
  const [copyError, setCopyError]       = useState(false);

  // Payout editor state
  const [isEditing, setIsEditing]       = useState(false);
  const [editUserReward, setEditUserReward] = useState(0);
  const [inputError, setInputError]     = useState('');
  const [saveError, setSaveError]       = useState('');
  const [isSaving, setIsSaving]         = useState(false);

  // Compute current split (memoised per selected task + settings)
  const activeSplit = selectedTask ? getSplit(selectedTask, userSettings) : null;

  // Live-computed "you keep" value in edit mode
  const livePromoterShare = activeSplit
    ? Math.round((activeSplit.totalLimit - editUserReward) * 100) / 100
    : 0;

  // ── Reset editor when a new task is opened ─────────────────────────────
  useEffect(() => {
    if (selectedTask) {
      setIsEditing(false);
      setSaveError('');
      setInputError('');
      setEditUserReward(getSplit(selectedTask, userSettings).userShare);
    }
  }, [selectedTask, userSettings]);

  // ── Close modal on Escape ──────────────────────────────────────────────
  useEffect(() => {
    if (!selectedTask) return;
    const handler = (e) => { if (e.key === 'Escape') setSelectedTask(null); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [selectedTask]);

  // ── Input validation (real-time) ───────────────────────────────────────
  const handleRewardChange = (raw) => {
    const val = parseFloat(raw);
    setEditUserReward(isNaN(val) ? 0 : val);
    if (isNaN(val) || val < 0) {
      setInputError('Must be a positive number.');
    } else if (activeSplit && val > activeSplit.totalLimit) {
      setInputError(`Cannot exceed ₹${activeSplit.totalLimit}.`);
    } else {
      setInputError('');
    }
  };

  // ── Copy referral link ─────────────────────────────────────────────────
  const handleCopy = useCallback(async () => {
    if (!selectedTask || !promoterUsername) return;
    const link = buildReferralLink(selectedTask.landing_url, promoterUsername, window.location.origin);
    if (!link) {
      setCopyError(true);
      setTimeout(() => setCopyError(false), 3000);
      return;
    }
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError(true);
      setTimeout(() => setCopyError(false), 3000);
    }
  }, [selectedTask, promoterUsername]);

  // ── Save payout split ──────────────────────────────────────────────────
  const handleSavePayout = async () => {
    if (inputError) return;
    setIsSaving(true);
    setSaveError('');

    // Only pass userBonus — server derives promoterShare from DB
    const res = await savePayoutSettings(selectedTask.id, editUserReward);

    if (res.success) {
      setIsEditing(false);
      // Use router.refresh() — no full page reload, preserves scroll & state
      startTransition(() => router.refresh());
    } else {
      setSaveError(res.error || 'Something went wrong. Please try again.');
    }
    setIsSaving(false);
  };

  // ── Empty state ────────────────────────────────────────────────────────
  if (!campaigns.length) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#444' }}>
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>🎯</div>
        <div style={{ fontSize: '16px', fontWeight: '800', color: '#666', marginBottom: '8px' }}>
          No missions available right now.
        </div>
        <div style={{ fontSize: '13px', color: '#444', fontWeight: '600' }}>
          Check back soon — new offers are added regularly.
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="fade-in">

      {/* ── Campaign Grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '20px',
      }}>
        {campaigns.map((camp, index) => (
          <CampaignCard
            key={camp.id}
            campaign={camp}
            userSettings={userSettings}
            index={index}
            onClick={() => setSelectedTask(camp)}
          />
        ))}
      </div>

      {/* ── Detail Modal ── */}
      {selectedTask && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedTask.title} mission details`}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setSelectedTask(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="slide-up"
            style={{
              width: '100%', maxWidth: '500px',
              background: '#0a0a0f', border: '1px solid #333',
              borderRadius: '30px', padding: '30px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
              maxHeight: '90vh', overflowY: 'auto',
            }}
          >

            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedTask.icon_url}
                  alt={`${selectedTask.title} icon`}
                  width={56} height={56}
                  style={{ borderRadius: '16px', border: '1px solid #333', objectFit: 'cover', flexShrink: 0 }}
                />
                <div>
                  <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: '900', margin: '0 0 6px' }}>
                    {selectedTask.title}
                  </h2>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <Badge text="Verified Offer" color="#3b82f6" bg="rgba(59,130,246,0.1)" />
                    <Badge text="Instant Track"  color="#00ff88" bg="rgba(0,255,136,0.1)" />
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedTask(null)}
                aria-label="Close modal"
                style={{
                  background: '#1a1a1a', border: 'none', borderRadius: '50%',
                  width: '36px', height: '36px', color: '#666',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* ── Payout Manager ── */}
            <div style={{
              background: isEditing ? '#111' : 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)',
              padding: '20px', borderRadius: '20px', marginBottom: '24px',
              border: isEditing ? '1px solid #333' : '1px solid #222',
              transition: 'background 0.3s, border-color 0.3s',
            }}>

              {/* View / Edit toggle row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isEditing ? '16px' : '0' }}>
                {!isEditing && (
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#888', fontWeight: '800', textTransform: 'uppercase' }}>Your Commission</div>
                      <div style={{ fontSize: '24px', color: '#00ff88', fontWeight: '900' }}>₹{activeSplit.promoterShare}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', color: '#888', fontWeight: '800', textTransform: 'uppercase' }}>User Bonus</div>
                      <div style={{ fontSize: '24px', color: '#fff', fontWeight: '900' }}>₹{activeSplit.userShare}</div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => { setIsEditing((v) => !v); setSaveError(''); setInputError(''); }}
                  title={isEditing ? 'Cancel editing' : 'Customize payout split'}
                  aria-label={isEditing ? 'Cancel editing' : 'Customize payout split'}
                  style={{
                    background: isEditing ? '#222' : 'transparent',
                    border: `1px solid ${isEditing ? '#444' : 'transparent'}`,
                    borderRadius: '8px', width: '30px', height: '30px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#666', cursor: 'pointer',
                    marginLeft: isEditing ? '0' : '10px',
                  }}
                >
                  {isEditing ? <X size={16} /> : <Settings size={18} />}
                </button>
              </div>

              {/* Edit mode */}
              {isEditing && (
                <div className="fade-in">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '8px' }}>

                    {/* User bonus input */}
                    <div>
                      <label
                        htmlFor="ct-user-bonus"
                        style={{ fontSize: '10px', color: '#3b82f6', fontWeight: '800', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}
                      >
                        User Gets
                      </label>
                      <input
                        id="ct-user-bonus"
                        type="number"
                        min="0"
                        max={activeSplit.totalLimit}
                        step="0.01"
                        value={editUserReward}
                        onChange={(e) => handleRewardChange(e.target.value)}
                        style={{
                          width: '100%', background: '#000',
                          border: `1px solid ${inputError ? '#ef4444' : '#333'}`,
                          padding: '10px', borderRadius: '8px',
                          color: '#fff', fontWeight: '800',
                          outline: 'none', boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    {/* Auto-calculated promoter share (read-only) */}
                    <div>
                      <label
                        htmlFor="ct-promoter-share"
                        style={{ fontSize: '10px', color: '#00ff88', fontWeight: '800', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}
                      >
                        You Keep
                      </label>
                      <input
                        id="ct-promoter-share"
                        type="number"
                        value={livePromoterShare}
                        readOnly
                        aria-label="Your share (auto-calculated)"
                        style={{
                          width: '100%', background: '#1a1a1a',
                          border: '1px solid #333',
                          padding: '10px', borderRadius: '8px',
                          color: '#888', fontWeight: '800',
                          cursor: 'not-allowed', boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>

                  {/* Input validation error */}
                  {inputError && (
                    <div role="alert" style={{ fontSize: '11px', color: '#ef4444', fontWeight: '700', marginBottom: '8px' }}>
                      {inputError}
                    </div>
                  )}

                  <div style={{ fontSize: '10px', color: '#666', textAlign: 'center', marginBottom: '12px' }}>
                    Max total budget: ₹{activeSplit.totalLimit}
                  </div>

                  {/* Save error */}
                  {saveError && (
                    <div role="alert" style={{
                      padding: '10px 14px', borderRadius: '8px', marginBottom: '12px',
                      background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
                      fontSize: '12px', color: '#ef4444', fontWeight: '700',
                    }}>
                      {saveError}
                    </div>
                  )}

                  <button
                    onClick={handleSavePayout}
                    disabled={isSaving || !!inputError || isPending}
                    aria-busy={isSaving || isPending}
                    style={{
                      width: '100%', background: '#fff', color: '#000',
                      padding: '12px', borderRadius: '10px', border: 'none',
                      fontWeight: '900', fontSize: '13px',
                      textTransform: 'uppercase', letterSpacing: '1px',
                      cursor: (isSaving || !!inputError || isPending) ? 'not-allowed' : 'pointer',
                      opacity: (isSaving || !!inputError || isPending) ? 0.7 : 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      transition: 'opacity 0.2s',
                    }}
                  >
                    {(isSaving || isPending)
                      ? <><Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> Saving…</>
                      : <><Save size={16} /> Save New Split</>
                    }
                  </button>
                </div>
              )}
            </div>

            {/* ── Steps ── */}
            {parseSteps(selectedTask.description).length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{
                  color: '#fff', fontSize: '13px', fontWeight: '800',
                  textTransform: 'uppercase', margin: '0 0 12px',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <Info size={14} color="#666" aria-hidden="true" /> Steps to Complete
                </h4>
                <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {parseSteps(selectedTask.description).map((step, i) => (
                    <li key={i} style={{ display: 'flex', gap: '12px', fontSize: '14px', color: '#ccc', lineHeight: '1.5' }}>
                      <div style={{
                        minWidth: '24px', height: '24px', background: '#222',
                        borderRadius: '50%', color: '#fff', fontSize: '11px',
                        fontWeight: '800', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', flexShrink: 0, marginTop: '1px',
                      }} aria-hidden="true">
                        {i + 1}
                      </div>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* ── Copy Referral Link ── */}
            <div style={{ background: '#111', padding: '16px', borderRadius: '16px', border: '1px dashed #333' }}>
              <div style={{ fontSize: '11px', color: '#666', fontWeight: '800', marginBottom: '10px', textTransform: 'uppercase' }}>
                Your Unique Share Link
              </div>

              {!promoterUsername && (
                <div style={{
                  padding: '12px', borderRadius: '10px', marginBottom: '10px',
                  background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
                  fontSize: '12px', color: '#ef4444', fontWeight: '700',
                }}>
                  ⚠️ No username set. Please update your profile to generate referral links.
                </div>
              )}

              {copyError && (
                <div role="alert" style={{
                  padding: '10px', borderRadius: '8px', marginBottom: '10px',
                  background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
                  fontSize: '12px', color: '#ef4444', fontWeight: '700',
                }}>
                  Could not copy link. Please copy it manually.
                </div>
              )}

              <button
                onClick={handleCopy}
                disabled={!promoterUsername}
                aria-label={copied ? 'Link copied!' : 'Copy your referral link'}
                style={{
                  width: '100%', padding: '16px', borderRadius: '12px', border: 'none',
                  background: copied ? '#00ff88' : '#fff',
                  color: '#000', fontWeight: '900', fontSize: '14px',
                  textTransform: 'uppercase',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  cursor: promoterUsername ? 'pointer' : 'not-allowed',
                  opacity: promoterUsername ? 1 : 0.5,
                  transition: 'background 0.2s, opacity 0.2s',
                }}
              >
                {copied ? <Check size={20} aria-hidden="true" /> : <Copy size={20} aria-hidden="true" />}
                {copied ? 'Link Copied!' : 'Copy Referral Link'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Spinner keyframe (used for Saving button) */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}