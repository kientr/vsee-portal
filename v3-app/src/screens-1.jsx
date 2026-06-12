// Login + Dashboard screens
import React, { useState } from 'react';
import { Icon } from './icons.jsx';
import { useRouter, useStore, useToast, Button, Card, Avatar, Badge } from './core.jsx';

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
// ----- Dashboard (v3 patient action center) -----
const AttnItem = ({ icon, color, title, meta, cta, onClick, primary }) => (
  <button className="card hover-stroke" onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left', cursor: 'pointer', width: '100%', borderLeft: `3px solid ${color}` }}>
    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}1A`, color, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
      <Icon name={icon} size={18} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontWeight: 600, fontSize: 14 }}>{title}</div>
      <div className="muted" style={{ fontSize: 12.5 }}>{meta}</div>
    </div>
    <span className={`btn ${primary ? 'btn-primary' : 'btn-secondary'} btn-sm`} style={{ flexShrink: 0 }}>
      {primary && icon === 'video' && <Icon name="video" size={14} />}{cta}
    </span>
  </button>
);

// Table-style row inside a section card (divider between rows, status + CTA).
const ApptRow = ({ v, onView, last }) => {
  const [mon, day] = v.when.split(',')[0].split(' ');
  const method = v.mode === 'Virtual' ? 'Video visit' : v.mode === 'In-Person' ? 'In-person' : v.mode + ' visit';
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '14px 0', borderBottom: last ? 'none' : '1px solid var(--border)' }}>
      <div style={{ width: 46, textAlign: 'center', flexShrink: 0, padding: '5px 0', borderRadius: 8, background: 'var(--bg)', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{mon}</div>
        <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.1 }}>{day}</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="title-link" style={{ fontWeight: 600, fontSize: 14, display: 'inline-block' }} onClick={onView} title="View details">{v.kind}</div>
        <div className="muted" style={{ fontSize: 12.5 }}>{v.time} · {method} · {v.provider}</div>
      </div>
      <Badge>{v.status}</Badge>
      <Button variant="secondary" size="sm" onClick={onView}>View details</Button>
    </div>
  );
};

const ActivityRow = ({ icon, color, title, meta, cta, onClick, last }) => (
  <div style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '14px 0', borderBottom: last ? 'none' : '1px solid var(--border)' }}>
    <div style={{ width: 42, height: 42, borderRadius: 10, background: `${color}1A`, color, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
      <Icon name={icon} size={18} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div className="title-link" style={{ fontWeight: 600, fontSize: 14, display: 'inline-block' }} onClick={onClick} title={cta}>{title}</div>
      <div className="muted" style={{ fontSize: 12.5 }}>{meta}</div>
    </div>
    <Button variant="secondary" size="sm" onClick={onClick}>{cta}</Button>
  </div>
);

const DashboardScreen = () => {
  const { nav } = useRouter();
  const { store } = useStore();
  const F = store.features;
  const firstName = store.user.name.split(' ')[0];

  const readyVisit = store.visits.find(v => v.tense === 'upcoming' && v.status === 'Ready to join' && !v.async);
  const upcoming = store.visits.filter(v => v.tense === 'upcoming' && !v.async).slice(0, 4);
  const unreadMsg = F.messages ? store.messages.find(m => m.unread) : null;
  const repliedEconsult = F.econsult ? store.visits.find(v => v.async && v.status === 'Provider Responded') : null;
  const pendingForms = F.forms ? store.forms.filter(f => f.status !== 'Completed') : [];
  const intakeForm = pendingForms.find(f => f.id === 'f1');
  const openRequest = store.requests.find(r => r.open);

  // Action Center — every immediate action in one place, most urgent first.
  const attn = [];
  if (readyVisit && F.video) attn.push({ icon: 'video', color: '#196CD2', title: 'Join your video visit', meta: `Virtual Follow-up · ${readyVisit.provider} · today ${readyVisit.time}`, cta: 'Join video visit', primary: true, onClick: () => nav('/telemedicine/call') });
  if (intakeForm) attn.push({ icon: 'fileText', color: '#92400E', title: 'Complete pre-visit intake', meta: `Required for your Virtual Follow-up · May 28, ${readyVisit ? readyVisit.time : '10:30 AM'}`, cta: 'Continue intake', onClick: () => nav('/forms/intake') });
  if (repliedEconsult) attn.push({ icon: 'message', color: '#92400E', title: 'Review e-consult response', meta: `${repliedEconsult.assigned} responded · ${repliedEconsult.kind.replace('E-consult — ', '')}`, cta: 'Review response', onClick: () => nav('/visits/' + repliedEconsult.id) });
  if (unreadMsg) attn.push({ icon: 'mail', color: '#0D875C', title: `New message from ${unreadMsg.from}`, meta: unreadMsg.subject, cta: 'Read message', onClick: () => nav('/messages/' + unreadMsg.id) });

  // Recent activity feed (table rows)
  const activity = [
    { icon: 'fileText', color: '#0D875C', title: 'Visit summary ready', meta: 'From your Apr 18 visit with Dr. Carter', cta: 'View summary', to: '/visits/v3' },
    openRequest && { icon: 'inbox', color: '#6B7280', title: 'Request update', meta: `${openRequest.title} · in review`, cta: 'View request', to: '/requests/' + openRequest.id },
    F.messages && { icon: 'mail', color: '#196CD2', title: 'Message from Dr. Carter', meta: 'Your lab results are in', cta: 'Read', to: '/messages/m1' },
    { icon: 'droplet', color: '#196CD2', title: 'Lab results available', meta: 'A1C and lipid panel are now in your record', cta: 'View results', to: '/medical-records' },
  ].filter(Boolean);

  return (
    <div className="content-narrow">
      <div className="page-header" style={{ alignItems: 'flex-start' }}>
        <div>
          <div className="page-title">Good morning, {firstName}</div>
          <div className="page-subtitle">Here's what needs your attention today.</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
          <div className="muted" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)' }}></span> Updated just now
          </div>
          <span className="tip" data-tip="See a provider. Choose from your care team, then an available option.">
            <Button icon="plus" onClick={() => nav('/see-provider')}>See a provider</Button>
          </span>
        </div>
      </div>

      {/* 1 · Action Center — the single, prominent place for things to do now */}
      <div className="card-eyebrow" style={{ marginBottom: 10 }}>Needs your attention</div>
      {attn.length > 0 ? (
        <div className="grid grid-2" style={{ gap: 12, marginBottom: 28 }}>
          {attn.map((a, i) => <AttnItem key={i} {...a} />)}
        </div>
      ) : (
        <div className="card" style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'var(--green-light)', border: 'none', marginBottom: 28 }}>
          <Icon name="checkCircle" size={22} style={{ color: 'var(--success-dark)' }} />
          <div>
            <div style={{ fontWeight: 700 }}>You're all caught up.</div>
            <div className="muted" style={{ fontSize: 13 }}>No visits, forms, messages, or care tasks need your attention right now.</div>
          </div>
        </div>
      )}

      <div className="split-even">
        {/* Upcoming care — titled card, table rows divided by dividers */}
        <Card title="Upcoming care">
          {upcoming.length === 0 ? (
            <div className="empty-state" style={{ padding: '16px 0' }}>
              <div style={{ fontWeight: 600, color: 'var(--text)' }}>No upcoming visits</div>
              <div>You can schedule care with your provider when needed.</div>
            </div>
          ) : (
            upcoming.map((v, i) => <ApptRow key={v.id} v={v} onView={() => nav('/visits/' + v.id)} last={i === upcoming.length - 1} />)
          )}
        </Card>

        {/* Recent activity — titled card, table rows divided by dividers */}
        <Card title="Recent activity">
          {activity.map((a, i) => <ActivityRow key={i} {...a} onClick={() => nav(a.to)} last={i === activity.length - 1} />)}
        </Card>
      </div>
    </div>
  );
};


export { LoginScreen, DashboardScreen, UpcomingVisitCard };
