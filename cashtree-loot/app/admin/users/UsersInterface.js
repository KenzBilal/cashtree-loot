'use client';

import { useState, useMemo } from 'react';
import { Search, Users, DollarSign, ShieldAlert, TrendingUp } from 'lucide-react';
import UserRow from './user-row';

const NEON = '#00ff88';

function StatCard({ icon, label, value, color = '#fff', sub }) {
  return (
    <div style={{
      background: '#080808', border: '1px solid #1a1a1a',
      borderRadius: '16px', padding: '18px 20px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: '14px', right: '14px', opacity: 0.08, color }}>
        {icon}
      </div>
      <div style={{ fontSize: '9px', fontWeight: '800', color: '#444', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>
        {label}
      </div>
      <div style={{ fontSize: 'clamp(20px,4vw,26px)', fontWeight: '900', color, letterSpacing: '-0.5px', marginBottom: '3px' }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: '11px', color: '#444', fontWeight: '600' }}>{sub}</div>}
    </div>
  );
}

export default function UsersInterface({ initialUsers, stats }) {
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('all');
  const [sortBy,  setSortBy]  = useState('date');
  const [sortDir, setSortDir] = useState('desc');

  const handleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortBy(col); setSortDir('desc'); }
  };

  const filtered = useMemo(() => {
    let list = [...initialUsers];
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(u =>
        u.username?.toLowerCase().includes(s) ||
        u.phone?.toLowerCase().includes(s) ||
        u.upi_id?.toLowerCase().includes(s) ||
        u.full_name?.toLowerCase().includes(s)
      );
    }
    // FIX: filter using pre-computed accurate counts
    if (filter === 'active') list = list.filter(u => !u.is_frozen && u.role !== 'admin');
    if (filter === 'frozen') list = list.filter(u => u.is_frozen);
    if (filter === 'admin')  list = list.filter(u => u.role === 'admin');

    list.sort((a, b) => {
      let av, bv;
      if      (sortBy === 'balance') { av = a.balance || 0;          bv = b.balance || 0; }
      else if (sortBy === 'leads')   { av = a.leads?.length || 0;    bv = b.leads?.length || 0; }
      else                           { av = new Date(a.created_at);  bv = new Date(b.created_at); }
      return sortDir === 'desc' ? bv - av : av - bv;
    });
    return list;
  }, [initialUsers, search, filter, sortBy, sortDir]);

  const SortArrow = ({ col }) => (
    <span style={{ marginLeft: '4px', opacity: sortBy === col ? 1 : 0.25, fontSize: '10px' }}>
      {sortBy === col ? (sortDir === 'desc' ? '↓' : '↑') : '↕'}
    </span>
  );

  const FILTERS = [
    { key: 'all',    label: `All (${stats.totalUsers})` },
    { key: 'active', label: `Active (${stats.activeCount})` },
    { key: 'frozen', label: `Frozen (${stats.frozenCount})` },
    { key: 'admin',  label: `Admins (${stats.adminCount})` },
  ];

  return (
    <div style={{ paddingBottom: '80px' }}>
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)} }

        .usr-search { width:100%; background:#000; border:1px solid #1e1e1e; border-radius:11px; padding:11px 14px 11px 40px; color:#fff; font-size:13px; font-weight:600; outline:none; box-sizing:border-box; transition:border-color 0.18s; font-family:inherit; }
        .usr-search::placeholder { color:#333; }
        .usr-search:focus { border-color:#2e2e2e; }

        .usr-filter { padding:8px 14px; border-radius:20px; border:1px solid #1a1a1a; background:transparent; color:#555; font-size:11px; font-weight:800; cursor:pointer; transition:all 0.18s; text-transform:uppercase; letter-spacing:0.6px; font-family:inherit; white-space:nowrap; }
        .usr-filter.on { background:rgba(0,255,136,0.08); border-color:rgba(0,255,136,0.25); color:${NEON}; }
        .usr-filter:hover:not(.on) { color:#fff; border-color:#333; }

        .usr-th { padding:12px 16px; background:#050505; color:#444; font-weight:800; font-size:10px; text-transform:uppercase; letter-spacing:1px; border-bottom:1px solid #111; white-space:nowrap; }
        .usr-th.sort { cursor:pointer; user-select:none; }
        .usr-th.sort:hover { color:#888; }
        .usr-row:hover td { background:rgba(255,255,255,0.01) !important; }
        .usr-empty { padding:60px 20px; text-align:center; color:#333; font-size:13px; font-weight:700; }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        marginBottom: '28px', paddingBottom: '24px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        flexWrap: 'wrap', gap: '16px',
      }}>
        <div>
          <h1 style={{ fontSize: 'clamp(22px,4vw,30px)', fontWeight: '900', color: '#fff', margin: '0 0 4px', letterSpacing: '-0.8px' }}>
            User <span style={{ color: '#333' }}>Control</span>
          </h1>
          <p style={{ margin: 0, fontSize: '11px', fontWeight: '700', color: '#444', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Full admin access · {stats.totalUsers} accounts
          </p>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '6px 12px', borderRadius: '20px',
          background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.15)',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: NEON, boxShadow: `0 0 6px ${NEON}` }} />
          <span style={{ fontSize: '10px', fontWeight: '800', color: NEON, textTransform: 'uppercase', letterSpacing: '1px' }}>
            {stats.newToday} new today
          </span>
        </div>
      </div>

      {/* ── STATS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: '10px', marginBottom: '24px' }}>
        <StatCard icon={<Users size={18}/>}       label="Total"     value={stats.totalUsers}  color="#fff" />
        <StatCard icon={<DollarSign size={18}/>}  label="Liability" value={`₹${stats.totalLiability.toLocaleString('en-IN')}`} color={NEON} sub="Total owed" />
        <StatCard icon={<ShieldAlert size={18}/>} label="Frozen"    value={stats.frozenCount} color="#ef4444" sub="Accounts" />
        <StatCard icon={<TrendingUp size={18}/>}  label="Active"    value={stats.activeCount} color="#3b82f6" sub="Promoters" />
      </div>

      {/* ── SEARCH + FILTERS ── */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={14} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#444', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search username, phone, UPI…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="usr-search"
          />
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} className={`usr-filter ${filter === f.key ? 'on' : ''}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── TABLE ── */}
      <div style={{ background: '#080808', border: '1px solid #111', borderRadius: '18px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr>
                <th className="usr-th" style={{ textAlign: 'left', paddingLeft: '20px' }}>User</th>
                <th className="usr-th" style={{ textAlign: 'left' }}>Contact</th>
                <th className="usr-th sort" style={{ textAlign: 'right' }} onClick={() => handleSort('balance')}>Balance <SortArrow col="balance" /></th>
                <th className="usr-th sort" style={{ textAlign: 'center' }} onClick={() => handleSort('leads')}>Leads <SortArrow col="leads" /></th>
                <th className="usr-th" style={{ textAlign: 'center' }}>Status</th>
                <th className="usr-th sort" style={{ textAlign: 'center' }} onClick={() => handleSort('date')}>Joined <SortArrow col="date" /></th>
                <th className="usr-th" style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((user, i) => <UserRow key={user.id} user={user} index={i} />)
              ) : (
                <tr><td colSpan="7" className="usr-empty">No users match your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filtered.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '11px', color: '#333', fontWeight: '700' }}>
          {filtered.length} of {stats.totalUsers} users
        </div>
      )}
    </div>
  );
}