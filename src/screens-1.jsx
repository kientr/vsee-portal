// Login + Dashboard screens
import React, { useState } from 'react';
import { Icon } from './icons.jsx';
import { useRouter, useStore, useToast, usePicker, Button, Card, Avatar, Badge } from './core.jsx';

const LoginScreen = () => {
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
  <button className="quick-action" onClick={onClick}>
    <div className="quick-action-icon" style={{ background: `${color}1A`, color }}>
      <Icon name={icon} size={18} />
    </div>
    <div>
      <div className="quick-action-label">{label}</div>
      <div className="quick-action-sub">{sub}</div>
    </div>
  </button>
);

const UpcomingVisitCard = () => {
  const { nav } = useRouter();
  const { store } = useStore();
  const v = store.visits.find(x => x.tense === 'upcoming' && x.status === 'Ready to join') || store.visits[0];
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
    </Card>
  );
};

const OpenEConsultsCard = () => {
  const { nav } = useRouter();
  const { store } = useStore();
  const open = store.visits.filter(v => v.async && v.tense === 'upcoming');
  return (
    <Card title="Open e-consults" action={<a href="#" onClick={(e) => { e.preventDefault(); nav('/visits'); }} style={{ fontSize: 13 }}>View all</a>}>
      <div className="stack">
        {open.length === 0 ? (
          <div className="muted" style={{ fontSize: 13, padding: '6px 0' }}>No open e-consults.</div>
        ) : open.map(r => (
          <button key={r.id} onClick={() => nav(`/visits/${r.id}`)} style={{ background: 'transparent', border: 'none', textAlign: 'left', padding: '10px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer', width: '100%' }}>
            <div className="row-between" style={{ marginBottom: 4 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{r.kind.replace('E-consult — ', '')}</div>
              <Badge>{r.status}</Badge>
            </div>
            <div className="muted" style={{ fontSize: 12 }}>{r.reason} · {r.assigned}</div>
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
          <div className="card-eyebrow">Latest vitals</div>
          <div className="stack" style={{ gap: 4 }}>
            <div style={{ fontSize: 13.5 }}><span className="muted">BP</span> <strong>{m.vitals.bp}</strong></div>
            <div style={{ fontSize: 13.5 }}><span className="muted">HR</span> <strong>{m.vitals.hr}</strong></div>
            <div style={{ fontSize: 13.5 }}><span className="muted">Weight</span> <strong>{m.vitals.weight}</strong></div>
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

const DashboardScreen = () => {
  const { nav } = useRouter();
  const { store } = useStore();
  const toast = useToast();
  const { openPicker } = usePicker();

  const upcoming = store.visits.filter(v => v.tense === 'upcoming' && !v.async);
  const openEconsults = store.visits.filter(v => v.async && v.tense === 'upcoming');
  const pendingForms = store.forms.filter(f => f.status !== 'Completed');

  const SHORTCUTS = [
    { label: 'Open visits', count: upcoming.length, sub: upcoming[0] ? `Next: ${upcoming[0].when}` : 'None scheduled', icon: 'calendar', color: '#196CD2', to: '/visits' },
    { label: 'Open e-consults', count: openEconsults.length, sub: openEconsults[0] ? `Latest: ${openEconsults[0].status}` : 'All caught up', icon: 'message', color: '#92400E', to: '/visits' },
    { label: 'Pending forms', count: pendingForms.length, sub: pendingForms[0] ? pendingForms[0].due : 'Nothing due', icon: 'fileText', color: '#0D875C', to: '/forms' },
  ];

  return (
    <div className="content-narrow">
      <div className="page-header">
        <div>
          <div className="page-title">Good morning, {store.user.name.split(' ')[0]}.</div>
          <div className="page-subtitle">Here's what needs your attention today.</div>
        </div>
        <div className="row gap-sm">
          <Button variant="secondary" icon="refresh" onClick={() => toast('Refreshed')}>Refresh</Button>
          <Button icon="plus" onClick={openPicker}>See a provider</Button>
        </div>
      </div>

      {/* Top: upcoming visit takes full width */}
      <div style={{ marginBottom: 20 }}>
        <UpcomingVisitCard />
      </div>

      {/* Analysis area — at-a-glance shortcuts */}
      <div className="grid grid-3" style={{ marginBottom: 20 }}>
        {SHORTCUTS.map((s, i) => (
          <button key={i} className="card" onClick={() => nav(s.to)} style={{ textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${s.color}1A`, color: s.color, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <Icon name={s.icon} size={22} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="row" style={{ gap: 8, alignItems: 'baseline' }}>
                <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>{s.count}</span>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-secondary)' }}>{s.label}</span>
              </div>
              <div className="muted" style={{ fontSize: 12.5, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.sub}</div>
            </div>
            <Icon name="chevronRight" size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          </button>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-3" style={{ marginBottom: 20 }}>
        <QuickAction icon="calendar" label="Schedule a visit" sub="Video, phone, or in person" color="#196CD2" onClick={() => nav('/visits/schedule')} />
        <QuickAction icon="message" label="Send an e-consult" sub="Async — reply within 24h" color="#92400E" onClick={() => nav('/visits/econsult')} />
        <QuickAction icon="upload" label="Upload a document" sub="Send a record or ID" color="#0A6B49" onClick={() => nav('/forms')} />
      </div>

      <div className="grid-dashboard">
        <div className="stack" style={{ gap: 20 }}>
          <PendingFormsCard />
          <OpenEConsultsCard />
          <HealthSummaryCard />
        </div>
        <div className="stack" style={{ gap: 20 }}>
          <RecentMessagesCard />
          <Card title="Care team">
            <div className="stack" style={{ gap: 14 }}>
              <div className="row">
                <Avatar initials="EC" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Dr. Emily Carter</div>
                  <div className="muted" style={{ fontSize: 12 }}>Primary Care Physician</div>
                </div>
                <button className="icon-btn" style={{ width: 34, height: 34 }} onClick={() => nav('/messages')}><Icon name="message" size={15} /></button>
              </div>
              <div className="row">
                <Avatar initials="LN" color="linear-gradient(135deg, #196CD2, #1E40AF)" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Lisa Ng, NP</div>
                  <div className="muted" style={{ fontSize: 12 }}>Nurse Practitioner</div>
                </div>
                <button className="icon-btn" style={{ width: 34, height: 34 }} onClick={() => nav('/messages')}><Icon name="message" size={15} /></button>
              </div>
              <div className="row">
                <Avatar initials="RP" color="linear-gradient(135deg, #92400E, #B45309)" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Dr. Raj Patel</div>
                  <div className="muted" style={{ fontSize: 12 }}>Endocrinology</div>
                </div>
                <button className="icon-btn" style={{ width: 34, height: 34 }} onClick={() => nav('/messages')}><Icon name="message" size={15} /></button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export { LoginScreen, DashboardScreen, UpcomingVisitCard };
