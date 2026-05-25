// Visits + Telemedicine + Requests screens
import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './icons.jsx';
import { useRouter, useStore, useToast, Button, Badge, Card, Modal, Avatar } from './core.jsx';
import { UpcomingVisitCard } from './screens-1.jsx';

// ----- VISITS -----
const VisitCard = ({ v, onView, onJoin }) => (
  <div className="card" style={v.status === 'Ready to join' ? { borderLeftWidth: 4, borderLeftColor: 'var(--primary)', paddingLeft: 16 } : {}}>
    <div className="row-between" style={{ marginBottom: 14 }}>
      <div className="row gap-sm">
        <Badge>{v.mode}</Badge>
        <Badge>{v.status}</Badge>
      </div>
      <button className="icon-btn" style={{ width: 32, height: 32 }}><Icon name="more" size={16} /></button>
    </div>
    <div className="row" style={{ alignItems: 'flex-start', gap: 14 }}>
      <div style={{
        width: 60, textAlign: 'center', flexShrink: 0,
        padding: '8px 0', borderRadius: 10, background: 'var(--bg)', border: '1px solid var(--border)',
      }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
          {v.when.split(',')[0].split(' ')[0]}
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          {v.when.split(',')[0].split(' ')[1]}
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <h3 className="card-title">{v.kind}</h3>
        <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>{v.provider} · {v.specialty}</div>
        <div className="row gap-sm muted" style={{ fontSize: 13, marginTop: 6 }}>
          <span><Icon name="clock" size={13} style={{ verticalAlign: '-2px', marginRight: 4 }} />{v.time}</span>
          <span>·</span>
          <span><Icon name={v.mode === 'Virtual' ? 'video' : 'mapPin'} size={13} style={{ verticalAlign: '-2px', marginRight: 4 }} />{v.mode === 'Virtual' ? 'Telehealth visit' : 'Main Clinic, Austin'}</span>
        </div>
      </div>
    </div>
    {(v.tense === 'upcoming' || v.tense === 'past') && (
      <>
        <hr className="divider" />
        <div className="row gap-sm">
          {v.tense === 'upcoming' && v.mode === 'Virtual' && v.status === 'Ready to join' && (
            <Button icon="video" onClick={onJoin}>Join visit</Button>
          )}
          <Button variant="secondary" onClick={onView}>View details</Button>
          {v.tense === 'upcoming' && <Button variant="ghost">Reschedule</Button>}
          {v.tense === 'upcoming' && <Button variant="ghost">Cancel</Button>}
          {v.tense === 'past' && <Button variant="ghost" icon="download">Download summary</Button>}
        </div>
      </>
    )}
  </div>
);

export const VisitsScreen = () => {
  const { nav } = useRouter();
  const { store } = useStore();
  const [tab, setTab] = useState('upcoming');
  const visits = store.visits.filter(v => v.tense === tab);

  return (
    <div className="content-narrow">
      <div className="page-header">
        <div>
          <div className="page-title">Visits</div>
          <div className="page-subtitle">Your upcoming and past visits with the care team.</div>
        </div>
        <Button icon="plus" onClick={() => nav('/telemedicine')}>Schedule visit</Button>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'upcoming' ? 'active' : ''}`} onClick={() => setTab('upcoming')}>
          Upcoming ({store.visits.filter(v => v.tense === 'upcoming').length})
        </button>
        <button className={`tab ${tab === 'past' ? 'active' : ''}`} onClick={() => setTab('past')}>
          Past ({store.visits.filter(v => v.tense === 'past').length})
        </button>
        <button className={`tab ${tab === 'cancelled' ? 'active' : ''}`} onClick={() => setTab('cancelled')}>
          Cancelled
        </button>
      </div>

      <div className="stack" style={{ gap: 14 }}>
        {visits.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon"><Icon name="calendar" size={22} /></div>
              <div style={{ fontWeight: 600, color: 'var(--text)' }}>No {tab} visits</div>
              <div>Your {tab} visits will appear here.</div>
            </div>
          </div>
        ) : visits.map(v => (
          <VisitCard key={v.id} v={v}
            onView={() => nav(`/visits/${v.id}`)}
            onJoin={() => nav('/telemedicine/call')}
          />
        ))}
      </div>
    </div>
  );
};

export const VisitDetailScreen = ({ visitId }) => {
  const { nav } = useRouter();
  const { store } = useStore();
  const v = store.visits.find(x => x.id === visitId);
  if (!v) return <div>Visit not found</div>;
  const isPast = v.tense === 'past';

  return (
    <div className="content-narrow" style={{ maxWidth: 980 }}>
      <button className="btn btn-ghost" onClick={() => nav('/visits')} style={{ marginBottom: 10, padding: '4px 8px' }}>
        <Icon name="arrowLeft" size={14} /> Back to visits
      </button>

      <div className="page-header" style={{ alignItems: 'flex-start' }}>
        <div>
          <div className="row gap-sm" style={{ marginBottom: 8 }}>
            <Badge>{v.mode}</Badge>
            <Badge>{v.status}</Badge>
          </div>
          <div className="page-title">{v.kind}</div>
          <div className="page-subtitle">{v.when} at {v.time} · {v.provider}, {v.specialty}</div>
        </div>
        {!isPast && v.status === 'Ready to join' && (
          <Button size="lg" icon="video" onClick={() => nav('/telemedicine/call')} className="btn-join-pulse">Join visit now</Button>
        )}
        {isPast && <Button variant="secondary" icon="download">Download summary</Button>}
      </div>

      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <div className="stack" style={{ gap: 20 }}>
          {!isPast ? (
            <>
              <Card title="Visit details">
                <div className="grid grid-2" style={{ gap: 16 }}>
                  <div>
                    <div className="card-eyebrow">Reason for visit</div>
                    <div>{v.reason}</div>
                  </div>
                  <div>
                    <div className="card-eyebrow">Visit type</div>
                    <div>{v.kind}</div>
                  </div>
                  <div>
                    <div className="card-eyebrow">When</div>
                    <div>{v.when}, {v.time}</div>
                  </div>
                  <div>
                    <div className="card-eyebrow">{v.mode === 'Virtual' ? 'Format' : 'Location'}</div>
                    <div>{v.mode === 'Virtual' ? 'Secure video visit' : 'Main Clinic — 901 Congress Ave, Austin TX'}</div>
                  </div>
                </div>
              </Card>

              <Card title="Before your visit">
                <div className="stack">
                  {(() => {
                    const intakeForm = store.forms.find(f => f.id === 'f1');
                    const done = intakeForm?.status === 'Completed';
                    return (
                      <div className="row" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: done ? 'var(--green-light)' : 'var(--amber-light)', color: done ? '#166534' : '#92400E', display: 'grid', placeItems: 'center' }}>
                          <Icon name={done ? 'check' : 'fileText'} size={16} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>Complete intake form</div>
                          <div className="muted" style={{ fontSize: 12 }}>
                            {done ? 'Completed · Submitted to care team' : `Required · ${intakeForm?.progress > 0 ? `${intakeForm.progress}% done` : 'About 5 minutes'}`}
                          </div>
                        </div>
                        {done ? <Badge>Done</Badge> : <Button variant="secondary" size="sm" onClick={() => nav('/forms/intake')}>{intakeForm?.progress > 0 ? 'Continue' : 'Start'}</Button>}
                      </div>
                    );
                  })()}
                  <div className="row" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary-light)', color: 'var(--primary-dark)', display: 'grid', placeItems: 'center' }}>
                      <Icon name="upload" size={16} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>Upload recent records (optional)</div>
                      <div className="muted" style={{ fontSize: 12 }}>Lab results, outside notes, imaging</div>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => nav('/forms')}>Upload</Button>
                  </div>
                  <div className="row" style={{ padding: '10px 0' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--green-light)', color: '#166534', display: 'grid', placeItems: 'center' }}>
                      <Icon name="check" size={16} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>Insurance card on file</div>
                      <div className="muted" style={{ fontSize: 12 }}>BlueCross · Verified May 12</div>
                    </div>
                    <Badge>Verified</Badge>
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <>
              <Card title="Visit summary">
                <div className="stack" style={{ gap: 16 }}>
                  <div>
                    <div className="card-eyebrow">Reason for visit</div>
                    <div>{v.reason}</div>
                  </div>
                  <div>
                    <div className="card-eyebrow">Diagnosis</div>
                    <div className="stack" style={{ gap: 6 }}>
                      {v.diagnosis.map((d, i) => <div key={i}>· {d}</div>)}
                    </div>
                  </div>
                  <div>
                    <div className="card-eyebrow">Care plan</div>
                    <div className="stack" style={{ gap: 6 }}>
                      {v.plan.map((p, i) => <div key={i}>· {p}</div>)}
                    </div>
                  </div>
                  {v.followup && (
                    <div>
                      <div className="card-eyebrow">Follow-up</div>
                      <div>{v.followup}</div>
                    </div>
                  )}
                </div>
              </Card>

              {v.meds && (
                <Card title="Prescribed medications">
                  <div className="stack" style={{ gap: 10 }}>
                    {v.meds.map((m, i) => (
                      <div key={i} className="row" style={{ padding: '10px 0', borderBottom: i < v.meds.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--teal-light)', color: 'var(--teal)', display: 'grid', placeItems: 'center' }}>
                          <Icon name="pill" size={16} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600 }}>{m.name} <span className="muted" style={{ fontWeight: 400 }}>{m.dose}</span></div>
                          <div className="muted" style={{ fontSize: 13 }}>{m.freq}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {v.attachments && (
                <Card title="Attachments">
                  <div className="stack">
                    {v.attachments.map((a, i) => (
                      <div key={i} className="row" style={{ padding: '10px 0', borderBottom: i < v.attachments.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        <div className="doc-icon"><Icon name="filePdf" size={18} /></div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{a}</div>
                          <div className="muted" style={{ fontSize: 12 }}>PDF · 1.2 MB</div>
                        </div>
                        <button className="icon-btn" style={{ width: 32, height: 32 }}><Icon name="download" size={15} /></button>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </>
          )}
        </div>

        <div className="stack" style={{ gap: 20 }}>
          <Card title="Provider">
            <div className="row" style={{ marginBottom: 14 }}>
              <Avatar initials={v.provider.split(' ').slice(-1)[0][0] + (v.provider.split(' ').length > 2 ? v.provider.split(' ')[1][0] : v.provider.split(' ')[0][0])} size="lg" />
              <div>
                <div style={{ fontWeight: 600 }}>{v.provider}</div>
                <div className="muted" style={{ fontSize: 13 }}>{v.specialty}</div>
              </div>
            </div>
            <Button variant="secondary" icon="message" block onClick={() => nav('/messages')}>Send message</Button>
          </Card>

          <Card title="Need help?">
            <div className="stack" style={{ gap: 8 }}>
              <div className="row" style={{ padding: '8px 0' }}>
                <Icon name="phone" size={16} style={{ color: 'var(--text-secondary)' }} />
                <span style={{ fontWeight: 500 }}>(512) 555-0199</span>
              </div>
              <div className="row" style={{ padding: '8px 0' }}>
                <Icon name="mail" size={16} style={{ color: 'var(--text-secondary)' }} />
                <span style={{ fontWeight: 500 }}>support@vsee-clinic.com</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// ----- TELEMEDICINE -----
export const TelemedicineScreen = () => {
  const { nav } = useRouter();
  const { store } = useStore();
  const toast = useToast();
  const [checks, setChecks] = useState({ cam: false, mic: false, net: false });
  const next = store.visits.find(v => v.tense === 'upcoming' && v.mode === 'Virtual');

  return (
    <div className="content-narrow" style={{ maxWidth: 1000 }}>
      <div className="page-header">
        <div>
          <div className="page-title">Telemedicine</div>
          <div className="page-subtitle">Connect with a provider — by video, by appointment, or by message.</div>
        </div>
      </div>

      {next && (
        <div style={{ marginBottom: 24 }}>
          <UpcomingVisitCard />
        </div>
      )}

      <h3 style={{ fontSize: 16, marginBottom: 14 }}>Start a new visit</h3>
      <div className="grid grid-3" style={{ marginBottom: 24 }}>
        {[
          { icon: 'zap', color: '#0D875C', title: 'Walk-in visit', desc: 'Talk to an on-call provider now. Avg wait under 5 min.', cta: 'Start now', primary: true, action: () => nav('/telemedicine/call') },
          { icon: 'calendar', color: '#196CD2', title: 'Schedule appointment', desc: 'Book a future time with your provider.', cta: 'Pick a time', action: () => {} },
          { icon: 'message', color: '#92400E', title: 'Async e-consult', desc: 'Describe your concern. A provider replies within 24h.', cta: 'Start message', action: () => nav('/requests/new') },
        ].map((opt, i) => (
          <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${opt.color}1A`, color: opt.color, display: 'grid', placeItems: 'center', marginBottom: 14 }}>
              <Icon name={opt.icon} size={20} />
            </div>
            <h3 style={{ fontSize: 16, marginBottom: 4 }}>{opt.title}</h3>
            <p className="muted" style={{ fontSize: 13.5, flex: 1, marginBottom: 14 }}>{opt.desc}</p>
            <Button variant={opt.primary ? 'primary' : 'secondary'} onClick={opt.action} iconRight="arrowRight">{opt.cta}</Button>
          </div>
        ))}
      </div>

      <Card title="Device check — confirm before joining">
        <div className="grid grid-3" style={{ gap: 12 }}>
          {[
            { key: 'cam', icon: 'cam', title: 'Camera', desc: 'Click to test your camera' },
            { key: 'mic', icon: 'mic', title: 'Microphone', desc: 'Click to test your microphone' },
            { key: 'net', icon: 'globe', title: 'Connection', desc: 'Click to check your network' },
          ].map((t) => {
            const done = checks[t.key];
            return (
              <button key={t.key} onClick={() => { setChecks(c => ({ ...c, [t.key]: true })); toast(`${t.title} check passed`); }}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: done ? 'var(--green-light)' : 'var(--bg)', border: `1px solid ${done ? '#BBF7D0' : 'var(--border)'}`, borderRadius: 10, cursor: 'pointer', textAlign: 'left', transition: 'all .15s' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: done ? '#166534' : 'var(--primary-light)', color: done ? 'white' : 'var(--primary-dark)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Icon name={done ? 'check' : t.icon} size={16} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: done ? '#166534' : 'var(--text)' }}>{t.title}</div>
                  <div style={{ fontSize: 12, color: done ? '#166534' : 'var(--text-muted)' }}>{done ? 'Ready' : t.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
        {Object.values(checks).every(Boolean) && (
          <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--green-light)', borderRadius: 8, color: '#166534', fontWeight: 600, fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="checkCircle" size={16} /> All checks passed — you're ready to join
          </div>
        )}
      </Card>
    </div>
  );
};

// ----- TELEMEDICINE CALL MOCK -----
export const TelemedCallScreen = () => {
  const { nav } = useRouter();
  const toast = useToast();
  const [muted, setMuted] = useState(false);
  const [cam, setCam] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);
  const [duration, setDuration] = useState(0);
  const [chat, setChat] = useState([
    { who: 'them', name: 'Dr. Carter', body: "Hi Sarah, can you hear me okay?" },
    { who: 'me', name: 'You', body: 'Yes, clearly.' },
    { who: 'them', name: 'Dr. Carter', body: "Great. I'm pulling up your latest labs now." },
  ]);
  const [input, setInput] = useState('');
  const [showLeave, setShowLeave] = useState(false);
  const chatBodyRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setDuration(d => d + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (chatBodyRef.current) chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
  }, [chat.length]);

  const fmt = (s) => {
    const m = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${m}:${ss}`;
  };

  const send = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setChat(c => [...c, { who: 'me', name: 'You', body: input }]);
    setInput('');
    setTimeout(() => {
      setChat(c => [...c, { who: 'them', name: 'Dr. Carter', body: "Got it. I'll add that to your chart." }]);
    }, 1400);
  };

  return (
    <div className="call-shell">
      <div className="call-main">
        <div className="call-provider-video">
          <div className="call-provider-avatar">EC</div>
        </div>
        <div className="call-meta">
          <span style={{ background: '#22C55E', width: 8, height: 8, borderRadius: '50%', flexShrink: 0 }}></span>
          <span style={{ fontWeight: 600 }}>{fmt(duration)}</span>
          <span style={{ opacity: 0.4 }}>|</span>
          <Icon name="shield" size={13} style={{ opacity: 0.7 }} />
          <span style={{ opacity: 0.8, fontSize: 13 }}>End-to-end encrypted</span>
        </div>
        <div className="call-provider-label">
          <span className="live live-pulse" style={{ position: 'relative', zIndex: 2 }}></span>
          <span>Dr. Emily Carter · Primary Care</span>
        </div>
        <div className="call-self">
          {cam ? (
            <span>SJ</span>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500 }}>
              <Icon name="camOff" size={28} />
              Camera off
            </div>
          )}
          <div className="call-self-label">You {muted && '· muted'}</div>
        </div>

        {chatOpen && (
          <div className="call-chat">
            <div className="call-chat-header">
              <span>Chat</span>
              <button onClick={() => setChatOpen(false)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)' }}>
                <Icon name="x" size={16} />
              </button>
            </div>
            <div className="call-chat-messages" ref={chatBodyRef}>
              {chat.map((m, i) => (
                <div key={i} className={`chat-msg ${m.who}`}>
                  <div className="who">{m.name}</div>
                  <div className="body">{m.body}</div>
                </div>
              ))}
            </div>
            <form className="call-chat-input" onSubmit={send}>
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message…" />
              <button type="submit" className="call-control-btn" style={{ width: 38, height: 38 }}>
                <Icon name="send" size={15} />
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="call-controls">
        <button className={`call-control-btn ${muted ? 'off' : ''}`} onClick={() => setMuted(m => !m)} title={muted ? 'Unmute' : 'Mute'}>
          <Icon name={muted ? 'micOff' : 'mic'} size={20} />
        </button>
        <button className={`call-control-btn ${!cam ? 'off' : ''}`} onClick={() => setCam(c => !c)} title={cam ? 'Turn camera off' : 'Turn camera on'}>
          <Icon name={cam ? 'cam' : 'camOff'} size={20} />
        </button>
        <button className="call-control-btn" onClick={() => setChatOpen(c => !c)} title="Chat">
          <Icon name="message" size={20} />
        </button>
        <button className="call-control-btn" onClick={() => toast('Guest invite link copied')} title="Invite guest">
          <Icon name="users" size={20} />
        </button>
        <button className="call-control-btn" onClick={() => toast('Attachment sent to provider')} title="Attach file">
          <Icon name="paperclip" size={20} />
        </button>
        <button className="call-control-btn" title="More">
          <Icon name="more" size={20} />
        </button>
        <button className="call-control-btn leave" onClick={() => setShowLeave(true)} title="Leave call">
          <Icon name="phoneOff" size={18} />
          <span>Leave</span>
        </button>
      </div>

      <Modal open={showLeave} onClose={() => setShowLeave(false)} title="Leave visit?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowLeave(false)}>Stay in visit</Button>
            <Button variant="danger" onClick={() => { setShowLeave(false); toast('Visit ended. Summary coming soon.'); nav('/visits/v1'); }}>End visit</Button>
          </>
        }
      >
        <p>You'll be returned to your visit details. A summary will appear in your portal once the provider signs off.</p>
      </Modal>
    </div>
  );
};

// ----- REQUESTS -----
const th = { textAlign: 'left', padding: '12px 18px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' };
const td = { padding: '14px 18px', fontSize: 14, verticalAlign: 'middle' };

export const RequestsScreen = () => {
  const { nav } = useRouter();
  const { store } = useStore();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = store.requests.filter(r => {
    if (filter === 'open' && (r.status === 'Resolved' || r.status === 'Closed')) return false;
    if (filter === 'closed' && r.status !== 'Resolved' && r.status !== 'Closed') return false;
    if (search.trim()) return r.title.toLowerCase().includes(search.toLowerCase()) || r.type.toLowerCase().includes(search.toLowerCase());
    return true;
  });

  return (
    <div className="content-narrow">
      <div className="page-header">
        <div>
          <div className="page-title">Requests</div>
          <div className="page-subtitle">Ask questions, request refills, or send a message that doesn't need a visit.</div>
        </div>
        <Button icon="plus" onClick={() => nav('/requests/new')}>New request</Button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        <div className="tabs" style={{ marginBottom: 0, borderBottom: 'none', flex: 1 }}>
          <button className={`tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All ({store.requests.length})</button>
          <button className={`tab ${filter === 'open' ? 'active' : ''}`} onClick={() => setFilter('open')}>Open ({store.requests.filter(r => r.status !== 'Resolved' && r.status !== 'Closed').length})</button>
          <button className={`tab ${filter === 'closed' ? 'active' : ''}`} onClick={() => setFilter('closed')}>Closed</button>
        </div>
        <div style={{ position: 'relative', width: 220 }}>
          <Icon name="search" size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter requests…"
            style={{ paddingLeft: 32, height: 36, fontSize: 13 }} />
        </div>
      </div>
      <div style={{ borderBottom: '1px solid var(--border)', marginBottom: 0 }}></div>

      <div className="card card-flush">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
              <th style={th}>Request</th>
              <th style={th}>Type</th>
              <th style={th}>Status</th>
              <th style={th}>Assigned</th>
              <th style={th}>Updated</th>
              <th style={{ ...th, width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} onClick={() => nav(`/requests/${r.id}`)} style={{ cursor: 'pointer', borderBottom: '1px solid var(--border)' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <td style={td}><div style={{ fontWeight: 600 }}>{r.title}</div><div className="muted" style={{ fontSize: 12, marginTop: 2 }}>Created {r.created}</div></td>
                <td style={td}><span className="muted">{r.type}</span></td>
                <td style={td}><Badge>{r.status}</Badge></td>
                <td style={td}><span className="muted">{r.assigned}</span></td>
                <td style={td}><span className="muted">{r.updated}</span></td>
                <td style={td}><Icon name="chevronRight" size={16} style={{ color: 'var(--text-muted)' }} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon"><Icon name="inbox" size={22} /></div>
            <div style={{ fontWeight: 600, color: 'var(--text)' }}>No requests yet</div>
            <div>Start a new request to ask your care team a question.</div>
          </div>
        )}
      </div>
    </div>
  );
};

export const NewRequestScreen = () => {
  const { nav } = useRouter();
  const toast = useToast();
  const { store, setStore } = useStore();
  const AUTO_SUBJECTS = {
    'Medical Question': '',
    'Prescription Question': 'Question about my prescription',
    'Appointment Request': 'Request to schedule an appointment',
    'Document Request': 'Request for medical records / documents',
    'Insurance Question': 'Question about my insurance coverage',
    'Billing Question': 'Question about a billing statement',
  };
  const [type, setType] = useState('Medical Question');
  const [subject, setSubject] = useState('');
  const [desc, setDesc] = useState('');
  const handleTypeChange = (newType) => {
    setType(newType);
    if (!subject || Object.values(AUTO_SUBJECTS).includes(subject)) {
      setSubject(AUTO_SUBJECTS[newType] || '');
    }
  };
  const [related, setRelated] = useState('');
  const [files, setFiles] = useState([]);

  const submit = (e) => {
    e.preventDefault();
    const id = 'r' + Math.random().toString(36).slice(2, 6);
    const newReq = {
      id, title: subject || `${type} request`, type, status: 'Submitted',
      created: 'Just now', updated: 'Just now', assigned: 'Care Team',
      description: desc,
      messages: [{ from: 'patient', name: store.user.name, date: 'Just now', body: desc }],
      timeline: [
        { label: 'Submitted', date: 'Just now', state: 'active' },
        { label: 'In Review', date: '—', state: 'pending' },
        { label: 'Resolved', date: '—', state: 'pending' },
      ],
    };
    setStore(s => ({ ...s, requests: [newReq, ...s.requests] }));
    toast('Your request has been submitted.');
    nav(`/requests/${id}`);
  };

  return (
    <div className="content-narrow" style={{ maxWidth: 720 }}>
      <button className="btn btn-ghost" onClick={() => nav('/requests')} style={{ marginBottom: 10, padding: '4px 8px' }}>
        <Icon name="arrowLeft" size={14} /> Back to requests
      </button>
      <div className="page-header">
        <div>
          <div className="page-title">New request</div>
          <div className="page-subtitle">Send a non-urgent question or request to your care team.</div>
        </div>
      </div>

      <form onSubmit={submit}>
        <div className="card stack" style={{ gap: 0 }}>
          <div className="form-row">
            <label>Request type</label>
            <select className="select" value={type} onChange={(e) => handleTypeChange(e.target.value)}>
              <option>Medical Question</option>
              <option>Prescription Question</option>
              <option>Appointment Request</option>
              <option>Document Request</option>
              <option>Insurance Question</option>
              <option>Billing Question</option>
              <option>Other</option>
            </select>
          </div>
          <div className="form-row">
            <label>Subject</label>
            <input className="input" placeholder="Briefly describe what you need" value={subject} onChange={(e) => setSubject(e.target.value)} required />
          </div>
          <div className="form-row">
            <label>Description</label>
            <textarea className="textarea" placeholder="Tell us what's going on. Include symptoms, timing, and anything else helpful." value={desc} onChange={(e) => setDesc(e.target.value)} required />
            <div className="field-help">If this is an emergency, call 911.</div>
          </div>
          <div className="form-row">
            <label>Related visit (optional)</label>
            <select className="select" value={related} onChange={(e) => setRelated(e.target.value)}>
              <option value="">None</option>
              {store.visits.filter(v => v.tense !== 'cancelled').map(v => (
                <option key={v.id} value={v.id}>{v.kind} — {v.when} ({v.provider})</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label>Attachments</label>
            <div className="upload-zone" onClick={() => setFiles(f => [...f, { name: 'screenshot.png', size: '320 KB' }])}>
              <Icon name="upload" />
              <div style={{ fontWeight: 600, color: 'var(--text)' }}>Click to attach files</div>
              <div style={{ fontSize: 12 }}>PDF, JPG, PNG up to 25 MB each</div>
            </div>
            {files.length > 0 && (
              <div className="stack" style={{ marginTop: 8 }}>
                {files.map((f, i) => (
                  <div key={i} className="row" style={{ padding: '8px 10px', background: 'var(--bg)', borderRadius: 8 }}>
                    <Icon name="fileImage" size={16} />
                    <span style={{ fontSize: 13, flex: 1 }}>{f.name}</span>
                    <span className="muted" style={{ fontSize: 12 }}>{f.size}</span>
                    <button type="button" onClick={() => setFiles(fs => fs.filter((_, j) => j !== i))} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)' }}>
                      <Icon name="x" size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="row gap-sm" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
            <Button type="button" variant="ghost" onClick={() => nav('/requests')}>Cancel</Button>
            <Button type="submit" icon="send">Submit request</Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export const RequestDetailScreen = ({ requestId }) => {
  const { nav } = useRouter();
  const { store, setStore } = useStore();
  const toast = useToast();
  const r = store.requests.find(x => x.id === requestId);
  const [reply, setReply] = useState('');

  if (!r) return <div className="content-narrow">Request not found</div>;

  const sendReply = () => {
    if (!reply.trim()) return;
    setStore(s => ({
      ...s,
      requests: s.requests.map(x => x.id === r.id ? {
        ...x, status: 'Submitted', updated: 'Just now',
        messages: [...x.messages, { from: 'patient', name: s.user.name, date: 'Just now', body: reply }],
        timeline: [...x.timeline.filter(t => t.state === 'done'), { label: 'Patient reply', date: 'Just now', state: 'active' }, ...x.timeline.filter(t => t.state === 'pending').slice(0) ],
      } : x),
    }));
    setReply('');
    toast('Reply sent to care team');
  };

  return (
    <div className="content-narrow" style={{ maxWidth: 980 }}>
      <button className="btn btn-ghost" onClick={() => nav('/requests')} style={{ marginBottom: 10, padding: '4px 8px' }}>
        <Icon name="arrowLeft" size={14} /> Back to requests
      </button>
      <div className="page-header" style={{ alignItems: 'flex-start' }}>
        <div>
          <div className="row gap-sm" style={{ marginBottom: 8 }}>
            <Badge>{r.type}</Badge>
            <Badge>{r.status}</Badge>
          </div>
          <div className="page-title">{r.title}</div>
          <div className="page-subtitle">Created {r.created} · Assigned to {r.assigned}</div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <div className="stack" style={{ gap: 20 }}>
          <Card title="Conversation">
            <div className="stack" style={{ gap: 16 }}>
              {r.messages.map((m, i) => (
                <div key={i} className={`msg-bubble ${m.from === 'patient' ? 'me' : ''}`}>
                  <Avatar size="sm" initials={m.from === 'patient' ? 'SJ' : m.name.split(' ').map(x => x[0]).slice(0, 2).join('')}
                    color={m.from === 'patient' ? null : 'linear-gradient(135deg, #196CD2, #1E40AF)'} />
                  <div>
                    <div className="msg-bubble-body">{m.body}</div>
                    <div className="msg-bubble-meta">{m.name} · {m.date}</div>
                  </div>
                </div>
              ))}
            </div>
            <hr className="divider" />
            {r.status === 'Resolved' || r.status === 'Closed' ? (
              <div style={{ padding: '14px 16px', background: 'var(--green-light)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                <Icon name="checkCircle" size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#166534' }}>This request has been resolved</div>
                  <div style={{ fontSize: 12.5, color: '#166534', opacity: 0.8 }}>If you have a follow-up question, open a new request.</div>
                </div>
                <Button variant="secondary" size="sm" onClick={() => nav('/requests/new')}>New request</Button>
              </div>
            ) : (
              <div className="stack" style={{ gap: 10 }}>
                <textarea className="textarea" placeholder="Write a reply…" value={reply} onChange={(e) => setReply(e.target.value)} />
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <Button variant="ghost" icon="paperclip">Attach file</Button>
                  <Button icon="send" onClick={sendReply} disabled={!reply.trim()}>Send reply</Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className="stack" style={{ gap: 20 }}>
          <Card title="Status timeline">
            <div className="timeline">
              {r.timeline.map((t, i) => (
                <div key={i} className="timeline-item">
                  <div className={`timeline-dot ${t.state}`}>
                    {t.state === 'done' && <Icon name="check" size={14} />}
                    {t.state === 'active' && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor' }}></span>}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-title">{t.label}</div>
                    <div className="timeline-meta">{t.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Details">
            <div className="stack" style={{ gap: 10 }}>
              <div><div className="card-eyebrow">Type</div><div>{r.type}</div></div>
              <div><div className="card-eyebrow">Assigned</div><div>{r.assigned}</div></div>
              <div><div className="card-eyebrow">Created</div><div>{r.created}</div></div>
              <div><div className="card-eyebrow">Last update</div><div>{r.updated}</div></div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
