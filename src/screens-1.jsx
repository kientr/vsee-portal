// Login + Dashboard screens
import React, { useState } from 'react';
import { Icon } from './icons.jsx';
import { useRouter } from './core.jsx';
import { useStore } from './core.jsx';
import { useToast } from './core.jsx';
import { Button, Badge, Card, Avatar } from './core.jsx';

export const LoginScreen = () => {
  const { nav } = useRouter();
  const [email, setEmail] = useState('sarah.johnson@email.com');
  const [password, setPassword] = useState('••••••••••');
  const [loading, setLoading] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); nav('/dashboard'); }, 600);
  };

  return (
    <div className="login-shell">
      <div className="login-art">
        <div className="login-art-brand">
          <div className="mark">V</div>
          <span>VSee Patient Portal</span>
        </div>
        <h1>Your health, in one calm place.</h1>
        <p>Manage your visits, message your care team, complete forms, and access your medical records — all in one secure portal.</p>
        <div className="login-art-features">
          {[
            { icon: 'video', text: 'Join telemedicine visits in one click' },
            { icon: 'fileText', text: 'Complete intake forms before your visit' },
            { icon: 'records', text: 'View your medical record anytime' },
            { icon: 'shieldCheck', text: 'HIPAA-compliant. Your data stays yours.' },
          ].map((f, i) => (
            <div className="login-art-feature" key={i}>
              <div className="check"><Icon name={f.icon} size={12} /></div>
              <span>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="login-form-wrap">
        <form className="login-form" onSubmit={submit}>
          <h2>Welcome back</h2>
          <p className="sub">Sign in to your patient portal.</p>

          <div className="form-row">
            <label>Email address</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-row">
            <div className="row-between">
              <label>Password</label>
              <a href="#" onClick={(e) => e.preventDefault()} style={{ fontSize: 13 }}>Forgot password?</a>
            </div>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <Button type="submit" block size="lg" iconRight="arrowRight" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>

          <div className="login-divider">or</div>

          <Button type="button" variant="secondary" block size="lg" icon="shield">
            Sign in with Health ID
          </Button>

          <p className="sub" style={{ marginTop: 28, textAlign: 'center', fontSize: 13 }}>
            New patient? <a href="#" onClick={(e) => { e.preventDefault(); nav('/dashboard'); }}>Create an account</a>
          </p>
          <p style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--text-muted)', marginTop: 24 }}>
            <Icon name="shield" size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Secured with 256-bit encryption · HIPAA compliant
          </p>
        </form>
      </div>
    </div>
  );
};

// ----- Dashboard -----
const QuickAction = ({ icon, label, sub, color, onClick }) => (
  <button className="quick-action" onClick={onClick}
    onMouseEnter={(e) => { e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = `0 4px 14px ${color}18`; }}
    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}>
    <div className="quick-action-icon" style={{ background: `${color}1A`, color }}>
      <Icon name={icon} size={18} />
    </div>
    <div>
      <div className="quick-action-label">{label}</div>
      <div className="quick-action-sub">{sub}</div>
    </div>
  </button>
);

const daysUntil = (dateStr) => {
  const today = new Date(); today.setHours(0,0,0,0);
  const target = new Date(dateStr); target.setHours(0,0,0,0);
  const d = Math.round((target - today) / 86400000);
  if (d === 0) return 'Today';
  if (d === 1) return 'Tomorrow';
  if (d < 0) return null;
  return `In ${d} days`;
};

export const UpcomingVisitCard = () => {
  const { nav } = useRouter();
  const { store } = useStore();
  const v = store.visits.find(x => x.tense === 'upcoming' && x.status === 'Ready to join') || store.visits[0];
  const countdown = daysUntil(v.when);
  return (
    <div className="card" style={{ background: 'linear-gradient(135deg, #0D875C 0%, #074D35 100%)', color: 'white', border: 'none', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }}></div>
      <div style={{ position: 'absolute', right: 80, bottom: -60, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }}></div>
      <div style={{ position: 'relative' }}>
        <div className="row" style={{ marginBottom: 12 }}>
          <span className="badge" style={{ background: 'rgba(255,255,255,0.18)', color: 'white', border: 'none' }}>
            <span className="dot" style={{ background: '#86EFAC', boxShadow: '0 0 0 3px rgba(134, 239, 172, 0.25)' }}></span>
            {v.status}
          </span>
          <span style={{ opacity: 0.8, fontSize: 13 }}>{v.mode} visit</span>
          {countdown && (
            <span style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.18)', color: 'white', fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 999 }}>
              {countdown}
            </span>
          )}
        </div>
        <h2 style={{ color: 'white', fontSize: 22, marginBottom: 4 }}>{v.kind} with {v.provider}</h2>
        <p style={{ opacity: 0.85, marginBottom: 18 }}>{v.specialty} · {v.when} at {v.time}</p>
        <div className="row gap-sm">
          <Button variant="secondary" icon="video" onClick={() => nav('/telemedicine/call')} style={{ background: 'white', color: 'var(--primary-dark)', borderColor: 'transparent', fontWeight: 700 }}>
            Join Visit
          </Button>
          <Button variant="ghost" onClick={() => nav(`/visits/${v.id}`)} style={{ color: 'white' }}>
            View details
          </Button>
        </div>
      </div>
    </div>
  );
};

const PendingFormsCard = () => {
  const { nav } = useRouter();
  const { store } = useStore();
  const pending = store.forms.filter(f => f.status !== 'Completed');
  return (
    <Card title="Pending forms" action={<a href="#" onClick={(e) => { e.preventDefault(); nav('/forms'); }} style={{ fontSize: 13 }}>View all</a>}>
      {pending.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-secondary)' }}>
          <Icon name="checkCircle" size={28} style={{ color: 'var(--primary)', marginBottom: 8, display: 'block', margin: '0 auto 8px' }} />
          <div style={{ fontWeight: 600, fontSize: 14 }}>All forms completed</div>
          <div style={{ fontSize: 12.5, marginTop: 2 }}>You're all caught up!</div>
        </div>
      ) : (
      <div className="stack">
        {pending.slice(0, 3).map(f => (
          <div key={f.id} className="row" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--amber-light)', color: '#92400E', display: 'grid', placeItems: 'center' }}>
              <Icon name="fileText" size={16} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{f.name}</div>
              <div className="muted" style={{ fontSize: 12 }}>{f.due}</div>
            </div>
            <Button variant="secondary" size="sm" onClick={() => nav(f.id === 'f1' ? '/forms/intake' : '/forms')}>
              {f.progress > 0 ? 'Continue' : 'Start'}
            </Button>
          </div>
        ))}
      </div>
      )}
    </Card>
  );
};

const ActiveRequestCard = () => {
  const { nav } = useRouter();
  const { store } = useStore();
  const active = store.requests.filter(r => r.status !== 'Resolved' && r.status !== 'Closed');
  return (
    <Card title="Active requests" action={<a href="#" onClick={(e) => { e.preventDefault(); nav('/requests'); }} style={{ fontSize: 13 }}>View all</a>}>
      <div className="stack">
        {active.map(r => (
          <button key={r.id} onClick={() => nav(`/requests/${r.id}`)} style={{ background: 'transparent', border: 'none', textAlign: 'left', padding: '10px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer', width: '100%' }}>
            <div className="row-between" style={{ marginBottom: 4 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{r.title}</div>
              <Badge>{r.status}</Badge>
            </div>
            <div className="muted" style={{ fontSize: 12 }}>{r.type} · Updated {r.updated}</div>
          </button>
        ))}
      </div>
    </Card>
  );
};

const HealthSummaryCard = () => {
  const { nav } = useRouter();
  const { store } = useStore();
  const m = store.medical;
  const a1c = m.labs?.find(l => l.name.startsWith('A1C'));
  return (
    <Card title="Health summary" action={<a href="#" onClick={(e) => { e.preventDefault(); nav('/medical-records'); }} style={{ fontSize: 13 }}>Open records</a>}>
      <div className="grid grid-2" style={{ gap: 14 }}>
        <div>
          <div className="card-eyebrow">Active problems</div>
          <div className="stack" style={{ gap: 4 }}>
            {m.problems.slice(0, 3).map((p, i) => <div key={i} style={{ fontSize: 13.5, fontWeight: 500 }}>{p.name}</div>)}
          </div>
        </div>
        <div>
          <div className="card-eyebrow">Medications</div>
          <div className="stack" style={{ gap: 4 }}>
            {m.meds.slice(0, 3).map((p, i) => <div key={i} style={{ fontSize: 13.5, fontWeight: 500 }}>{p.name} <span className="muted">{p.dose}</span></div>)}
          </div>
        </div>
        <div>
          <div className="card-eyebrow">Allergies</div>
          <div className="stack" style={{ gap: 4 }}>
            {m.allergies.map((a, i) => (
              <div key={i} style={{ fontSize: 13.5, fontWeight: 500 }}>
                {a.name} <Badge>{a.severity}</Badge>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="card-eyebrow">Key metrics</div>
          <div className="stack" style={{ gap: 4 }}>
            {a1c && (
              <div style={{ fontSize: 13.5 }}>
                <span className="muted">A1C</span> <strong style={{ color: '#D97706' }}>{a1c.value}</strong>
                <span style={{ fontSize: 11, color: '#0D875C', marginLeft: 6, fontWeight: 600 }}>↓ improving</span>
              </div>
            )}
            <div style={{ fontSize: 13.5 }}><span className="muted">BP</span> <strong>{m.vitals.bp}</strong></div>
            <div style={{ fontSize: 13.5 }}><span className="muted">HR</span> <strong>{m.vitals.hr}</strong></div>
          </div>
        </div>
      </div>
    </Card>
  );
};

const RecentMessagesCard = () => {
  const { nav } = useRouter();
  const { store } = useStore();
  return (
    <Card title="Recent messages" action={<a href="#" onClick={(e) => { e.preventDefault(); nav('/messages'); }} style={{ fontSize: 13 }}>Inbox</a>}>
      <div className="stack">
        {store.messages.slice(0, 3).map(m => (
          <button key={m.id} onClick={() => nav(`/messages/${m.id}`)} style={{ background: 'transparent', border: 'none', textAlign: 'left', padding: '10px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer', width: '100%', display: 'flex', gap: 12 }}>
            <Avatar initials={m.initials} size="sm" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="row-between">
                <span style={{ fontWeight: 600, fontSize: 13.5 }}>
                  {m.unread && <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', marginRight: 7, verticalAlign: 'middle' }}></span>}
                  {m.from}
                </span>
                <span className="muted" style={{ fontSize: 11.5 }}>{m.date}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, marginTop: 1 }}>{m.subject}</div>
              <div className="muted" style={{ fontSize: 12.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.preview}</div>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
};

export const DashboardScreen = () => {
  const { nav } = useRouter();
  const { store } = useStore();
  const toast = useToast();

  return (
    <div className="content-narrow">
      <div className="page-header">
        <div>
          <div className="page-title">{(() => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; })()}, {store.user.name.split(' ')[0]}.</div>
          <div className="page-subtitle">Here's what needs your attention today.</div>
        </div>
        <div className="row gap-sm">
          <Button variant="secondary" icon="refresh" onClick={() => toast('Refreshed')}>Refresh</Button>
          <Button icon="plus" onClick={() => nav('/requests/new')}>New request</Button>
        </div>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        {[
          { icon: 'calendar', label: 'Upcoming visits', value: store.visits.filter(v => v.tense === 'upcoming').length, color: '#0D875C', href: '/visits' },
          { icon: 'inbox', label: 'Open requests', value: store.requests.filter(r => r.status !== 'Resolved' && r.status !== 'Closed').length, color: '#196CD2', href: '/requests' },
          { icon: 'message', label: 'Unread messages', value: store.messages.filter(m => m.unread).length, color: '#92400E', href: '/messages' },
          { icon: 'fileText', label: 'Pending forms', value: store.forms.filter(f => f.status !== 'Completed').length, color: '#D97706', href: '/forms' },
        ].map(s => (
          <button key={s.href} onClick={() => nav(s.href)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', cursor: 'pointer', textAlign: 'left', transition: 'border-color .15s, box-shadow .15s', boxShadow: 'var(--shadow)' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = s.color; e.currentTarget.style.boxShadow = `0 4px 14px ${s.color}18`; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${s.color}1A`, color: s.color, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <Icon name={s.icon} size={18} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3, fontWeight: 500 }}>{s.label}</div>
            </div>
          </button>
        ))}
      </div>

      <div style={{ marginBottom: 20 }}>
        <UpcomingVisitCard />
      </div>

      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        <QuickAction icon="video" label="Start a visit" sub="Talk to a provider now" color="#0D875C" onClick={() => nav('/telemedicine')} />
        <QuickAction icon="calendar" label="Schedule visit" sub="Pick a time that works" color="#196CD2" onClick={() => nav('/visits')} />
        <QuickAction icon="fileText" label="Create a request" sub="Ask the care team" color="#92400E" onClick={() => nav('/requests/new')} />
        <QuickAction icon="upload" label="Upload a document" sub="Send a record or ID" color="#0A6B49" onClick={() => nav('/forms')} />
      </div>

      <div className="grid-dashboard">
        <div className="stack" style={{ gap: 20 }}>
          <PendingFormsCard />
          <ActiveRequestCard />
          <HealthSummaryCard />
        </div>
        <div className="stack" style={{ gap: 20 }}>
          <RecentMessagesCard />
          <Card title="Care team">
            <div className="stack" style={{ gap: 2 }}>
              {[
                { initials: 'EC', name: 'Dr. Emily Carter', role: 'Primary Care Physician', color: null, online: true },
                { initials: 'LN', name: 'Lisa Ng, NP', role: 'Nurse Practitioner', color: 'linear-gradient(135deg, #196CD2, #1E40AF)', online: true },
                { initials: 'RP', name: 'Dr. Raj Patel', role: 'Endocrinology', color: 'linear-gradient(135deg, #92400E, #B45309)', online: false },
              ].map(p => (
                <div key={p.name} className="row" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <Avatar initials={p.initials} color={p.color} />
                    <span style={{ position: 'absolute', bottom: 1, right: 1, width: 9, height: 9, borderRadius: '50%', background: p.online ? '#22C55E' : '#9CA3AF', border: '2px solid white' }}></span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{p.role}</div>
                  </div>
                  <button className="icon-btn" style={{ width: 32, height: 32 }} onClick={() => nav('/messages')} title="Send message">
                    <Icon name="message" size={14} />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
