// Visits + Telemedicine + e-consult screens
import React, { useState, useEffect } from 'react';
import { Icon } from './icons.jsx';
import { useRouter, useStore, useToast, Button, Card, Badge, Avatar, Modal } from './core.jsx';
import { UpcomingVisitCard } from './screens-1.jsx';

// ----- VISITS -----
const VisitCard = ({ v, onView, onJoin }) => {
  const isAsync = v.mode === 'E-consult';
  return (
  <div className="card">
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
          {isAsync ? (
            <>
              <span><Icon name="message" size={13} style={{ verticalAlign: '-2px', marginRight: 4 }} />Async e-consult</span>
              <span>·</span>
              <span>Submitted {v.when}</span>
            </>
          ) : (
            <>
              <span><Icon name="clock" size={13} style={{ verticalAlign: '-2px', marginRight: 4 }} />{v.time}</span>
              <span>·</span>
              <span><Icon name={v.mode === 'Virtual' ? 'video' : 'mapPin'} size={13} style={{ verticalAlign: '-2px', marginRight: 4 }} />{v.mode === 'Virtual' ? 'Telehealth visit' : 'Main Clinic, Austin'}</span>
            </>
          )}
        </div>
      </div>
    </div>
    {(v.tense === 'upcoming' || v.tense === 'past') && (
      <>
        <hr className="divider" />
        <div className="row gap-sm">
          {isAsync ? (
            <Button variant={v.status === 'Provider replied' ? 'primary' : 'secondary'} icon="message" onClick={onView}>
              {v.status === 'Resolved' ? 'View conversation' : 'Open e-consult'}
            </Button>
          ) : (
            <>
              {v.tense === 'upcoming' && v.mode === 'Virtual' && v.status === 'Ready to join' && (
                <Button icon="video" onClick={onJoin}>Join visit</Button>
              )}
              <Button variant="secondary" onClick={onView}>View details</Button>
              {v.tense === 'upcoming' && <Button variant="ghost">Reschedule</Button>}
              {v.tense === 'upcoming' && <Button variant="ghost">Cancel</Button>}
              {v.tense === 'past' && <Button variant="ghost" icon="download">Download summary</Button>}
            </>
          )}
        </div>
      </>
    )}
  </div>
  );
};

const VisitsScreen = () => {
  const { nav } = useRouter();
  const { store } = useStore();
  const [tab, setTab] = useState('upcoming');
  const visits = store.visits.filter(v => v.tense === tab);

  return (
    <div className="content-narrow">
      <div className="page-header">
        <div>
          <div className="page-title">Visits &amp; e-consults</div>
          <div className="page-subtitle">Every encounter in one place — video, phone, in-person, and async e-consults.</div>
        </div>
        <Button icon="plus" onClick={() => nav('/see-provider')}>See a provider</Button>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'upcoming' ? 'active' : ''}`} onClick={() => setTab('upcoming')}>
          Open ({store.visits.filter(v => v.tense === 'upcoming').length})
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
              <div style={{ fontWeight: 600, color: 'var(--text)' }}>No {tab === 'upcoming' ? 'open' : tab} encounters</div>
              <div>Your {tab === 'upcoming' ? 'open' : tab} visits and e-consults will appear here.</div>
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

const EConsultDetail = ({ v }) => {
  const { nav } = useRouter();
  const { store, setStore } = useStore();
  const toast = useToast();
  const [reply, setReply] = useState('');
  const resolved = v.status === 'Resolved';

  const sendReply = () => {
    if (!reply.trim()) return;
    setStore(s => ({
      ...s,
      visits: s.visits.map(x => x.id === v.id ? {
        ...x, status: 'In review', updated: 'Just now',
        messages: [...x.messages, { from: 'patient', name: s.user.name, date: 'Just now', body: reply }],
      } : x),
    }));
    setReply('');
    toast('Reply sent to your care team');
  };

  return (
    <div className="content-narrow" style={{ maxWidth: 980 }}>
      <button className="btn btn-ghost" onClick={() => nav('/visits')} style={{ marginBottom: 10, padding: '4px 8px' }}>
        <Icon name="arrowLeft" size={14} /> Back to visits &amp; e-consults
      </button>
      <div className="page-header" style={{ alignItems: 'flex-start' }}>
        <div>
          <div className="row gap-sm" style={{ marginBottom: 8 }}>
            <Badge>E-consult</Badge>
            <Badge>{v.status}</Badge>
          </div>
          <div className="page-title">{v.kind}</div>
          <div className="page-subtitle">Submitted {v.when} · Care team: {v.assigned}</div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <div className="stack" style={{ gap: 20 }}>
          <Card title="Conversation">
            <div className="stack" style={{ gap: 16 }}>
              {v.messages.map((m, i) => (
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
            {resolved ? (
              <div className="row" style={{ gap: 10, alignItems: 'center', background: 'var(--green-light)', color: '#166534', padding: '12px 14px', borderRadius: 10 }}>
                <Icon name="checkCircle" size={18} />
                <div style={{ fontSize: 13.5 }}>This e-consult is resolved. Need more help? <a href="#" onClick={(e) => { e.preventDefault(); nav('/visits/econsult'); }} style={{ fontWeight: 700 }}>Start a new e-consult</a>.</div>
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
          <Card title="Status">
            <div className="timeline">
              {v.timeline.map((t, i) => (
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
          <Card title="Encounter">
            <div className="stack" style={{ gap: 10 }}>
              <div className="row" style={{ gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary-light)', color: 'var(--primary-dark)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Icon name="fileText" size={15} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>Opened automatically</div>
                  <div className="muted" style={{ fontSize: 12.5 }}>Your e-consult opened encounter <strong>{v.encounter}</strong> in the EMR. Everything you send here is filed to it.</div>
                </div>
              </div>
              <hr className="divider" />
              <div><div className="card-eyebrow">About</div><div>{v.reason}</div></div>
              <div><div className="card-eyebrow">Care team</div><div>{v.assigned}</div></div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const VisitDetailScreen = ({ visitId }) => {
  const { nav } = useRouter();
  const { store } = useStore();
  const v = store.visits.find(x => x.id === visitId);
  if (!v) return <div>Visit not found</div>;
  if (v.async) return <EConsultDetail v={v} />;
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
          <Button size="lg" icon="video" onClick={() => nav('/telemedicine/call')}>Join visit</Button>
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
                  <div className="row" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--amber-light)', color: '#92400E', display: 'grid', placeItems: 'center' }}>
                      <Icon name="fileText" size={16} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>Complete intake form</div>
                      <div className="muted" style={{ fontSize: 12 }}>Required · About 5 minutes</div>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => nav('/forms/intake')}>Start</Button>
                  </div>
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
const TelemedicineScreen = () => {
  const { nav } = useRouter();
  const { store } = useStore();
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
          { icon: 'calendar', color: '#196CD2', title: 'Schedule appointment', desc: 'Book a future time with your provider.', cta: 'Pick a time', action: () => nav('/visits/schedule') },
          { icon: 'message', color: '#92400E', title: 'Async e-consult', desc: 'Describe your concern. A provider replies within 24h.', cta: 'Start message', action: () => nav('/visits/econsult') },
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

      <Card title="Before you start a visit">
        <div className="grid grid-3" style={{ gap: 16 }}>
          {[
            { icon: 'cam', title: 'Test your camera', desc: 'Make sure your camera works' },
            { icon: 'mic', title: 'Test your microphone', desc: 'Check audio input and output' },
            { icon: 'globe', title: 'Stable connection', desc: 'Wi-Fi works best for video' },
          ].map((t, i) => (
            <div key={i} className="row">
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--green-light)', color: '#166534', display: 'grid', placeItems: 'center' }}>
                <Icon name="check" size={16} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{t.title}</div>
                <div className="muted" style={{ fontSize: 12.5 }}>{t.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ----- TELEMEDICINE CALL MOCK -----
const TelemedCallScreen = () => {
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

  useEffect(() => {
    const t = setInterval(() => setDuration(d => d + 1), 1000);
    return () => clearInterval(t);
  }, []);

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
    // mock provider reply
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
          <span style={{ background: '#22C55E', width: 8, height: 8, borderRadius: '50%' }}></span>
          <span style={{ fontWeight: 500 }}>Connected · {fmt(duration)}</span>
          <span style={{ opacity: 0.6, marginLeft: 6 }}>|</span>
          <span style={{ opacity: 0.85 }}>Encrypted</span>
        </div>
        <div className="call-provider-label">
          <span className="live"></span>
          <span>Dr. Emily Carter</span>
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
            <div className="call-chat-messages">
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

// ─────────────────────────────────────────────
// "See a provider" multi-step wizard (v3)
// when → visit type → provider → intake → (schedule | e-consult) → payment → review
// ─────────────────────────────────────────────
const SP_METHOD_LABEL = { video: 'Video visit', phone: 'Phone visit', 'in-person': 'In-person visit', econsult: 'E-consult (async)' };
const SP_PROVIDER_LABEL = { first: 'First available provider', pcp: 'Dr. Emily Carter — Primary Care', specific: 'Dr. Raj Patel — Endocrinology' };
const SP_SLOTS = ['9:00', '9:30', '10:00', '10:30', '11:00', '11:30', '2:15', '2:45', '3:15'];
const SP_TAKEN = new Set(['9:00', '11:30']);

const ChoiceRow = ({ icon, title, desc, tag, selected, disabled, onClick }) => (
  <button className="picker-option" onClick={disabled ? undefined : onClick} disabled={disabled}
    style={{ borderColor: selected ? 'var(--primary)' : undefined, background: selected ? 'var(--primary-100)' : undefined, opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}>
    <div className="picker-option-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)' }}>
      <Icon name={icon} size={20} />
    </div>
    <div style={{ flex: 1 }}>
      <div className="row gap-sm" style={{ alignItems: 'center', marginBottom: 2 }}>
        <span className="picker-option-title">{title}</span>
        {tag && <span className="badge badge-teal" style={{ fontSize: 10.5 }}>{tag}</span>}
      </div>
      <div className="muted" style={{ fontSize: 13 }}>{desc}</div>
    </div>
    <Icon name="chevronRight" size={18} style={{ color: 'var(--text-muted)' }} />
  </button>
);

const SeeProviderScreen = () => {
  const { nav } = useRouter();
  const { setStore } = useStore();
  const toast = useToast();
  const [when, setWhen] = useState(null);
  const [method, setMethod] = useState(null);
  const [provider, setProvider] = useState(null);
  const [reason, setReason] = useState('');
  const [slot, setSlot] = useState('2:15');
  const [step, setStep] = useState(0);

  const steps = (() => {
    const s = ['when', 'method', 'provider', 'intake'];
    if (method === 'econsult') s.push('econsult');
    else if (when === 'later') s.push('schedule');
    s.push('payment', 'review');
    return s;
  })();
  const idx = Math.min(step, steps.length - 1);
  const cur = steps[idx];
  const isConnectNow = when === 'now' && (method === 'video' || method === 'phone');

  const canNext = !(
    (cur === 'when' && !when) ||
    (cur === 'method' && !method) ||
    (cur === 'provider' && !provider)
  );

  const back = () => { if (idx > 0) setStep(idx - 1); else nav('/dashboard'); };
  const next = () => {
    if (!canNext) return;
    if (idx < steps.length - 1) setStep(idx + 1);
    else doConfirm();
  };
  const doConfirm = () => {
    if (isConnectNow) { toast('Connecting you with the next available provider…'); nav('/telemedicine/call'); return; }
    if (method === 'econsult') {
      setStore(s => ({ ...s, confirm: { title: 'E-consult submitted', detail: `${SP_METHOD_LABEL.econsult} · ${SP_PROVIDER_LABEL[provider]}`, note: "Your care team usually responds within 24–48 hours. You'll be notified and it will appear in your Visits list. Not for urgent symptoms.", primaryLabel: 'View in visits', primaryTo: '/visits' } }));
    } else {
      setStore(s => ({ ...s, confirm: { title: 'Appointment scheduled', detail: `${SP_METHOD_LABEL[method]} · Jun 14, ${slot} PM · ${SP_PROVIDER_LABEL[provider]}`, note: 'A reminder will be sent 24 hours before your visit. You can reschedule or cancel anytime from the visit details.', primaryLabel: 'View visit', primaryTo: '/visits/v2' } }));
    }
    nav('/confirm');
  };

  const reviewRows = () => {
    const rows = [['Visit type', SP_METHOD_LABEL[method] || '—'], ['Provider', SP_PROVIDER_LABEL[provider] || '—']];
    if (method === 'econsult') rows.push(['Response', 'Expected in 24–48 hours']);
    else if (when === 'later') { rows.push(['When', `Jun 14, 2026 · ${slot} PM`]); if (method === 'in-person') rows.push(['Location', 'Main Clinic, Austin']); }
    else rows.push(['When', 'Now — connect immediately']);
    rows.push(['Reason', reason || 'Added in intake']);
    rows.push(['Payment', method === 'econsult' ? '$0 — covered' : '$25.00 copay · Visa ···· 4242']);
    return rows;
  };

  return (
    <div className="content-narrow" style={{ maxWidth: 820 }}>
      <button className="btn btn-text" onClick={() => nav('/dashboard')} style={{ marginBottom: 10, padding: '4px 8px' }}>
        <Icon name="x" size={14} /> Cancel
      </button>
      <div className="page-header" style={{ marginBottom: 14 }}>
        <div>
          <div className="page-title">See a provider</div>
          <div className="page-subtitle">Step {idx + 1} of {steps.length}</div>
        </div>
      </div>

      {/* progress bar */}
      <div className="row gap-sm" style={{ marginBottom: 24 }}>
        {steps.map((s, i) => (
          <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: i < idx ? 'var(--success)' : i === idx ? 'var(--primary)' : 'var(--border)' }} />
        ))}
      </div>

      <div className="card">
        {cur === 'when' && (
          <div className="stack" style={{ gap: 10 }}>
            <h3 className="card-title" style={{ marginBottom: 4 }}>When do you need care?</h3>
            <ChoiceRow icon="zap" title="Now" desc="Connect with an available provider right away." selected={when === 'now'} onClick={() => setWhen('now')} />
            <ChoiceRow icon="calendar" title="Later" desc="Schedule a day and time, or send an async e-consult." selected={when === 'later'} onClick={() => setWhen('later')} />
          </div>
        )}

        {cur === 'method' && (
          <div className="stack" style={{ gap: 10 }}>
            <h3 className="card-title" style={{ marginBottom: 4 }}>Choose a visit type</h3>
            <ChoiceRow icon="video" title="Video visit" desc="See your provider over secure video." selected={method === 'video'} onClick={() => setMethod('video')} />
            <ChoiceRow icon="phone" title="Phone visit" desc="We'll call you at your number." selected={method === 'phone'} onClick={() => setMethod('phone')} />
            <ChoiceRow icon="building" title="In-person visit" desc={when === 'now' ? 'Schedule for later — not available right now.' : 'At a clinic location near you.'} selected={method === 'in-person'} disabled={when === 'now'} onClick={() => setMethod('in-person')} />
            <ChoiceRow icon="message" title="E-consult" tag="Async" desc="Send your concern now. Care team usually responds in 24–48 hours." selected={method === 'econsult'} onClick={() => setMethod('econsult')} />
          </div>
        )}

        {cur === 'provider' && (
          <div className="stack" style={{ gap: 10 }}>
            <h3 className="card-title" style={{ marginBottom: 4 }}>Who would you like to see?</h3>
            <ChoiceRow icon="zap" title="First available provider" desc="Fastest option — next open provider on our team." selected={provider === 'first'} onClick={() => setProvider('first')} />
            <ChoiceRow icon="user" title="Dr. Emily Carter" desc="Your primary care provider." selected={provider === 'pcp'} onClick={() => setProvider('pcp')} />
            <ChoiceRow icon="user" title="Dr. Raj Patel" desc="Endocrinology · last seen Feb 14." selected={provider === 'specific'} onClick={() => setProvider('specific')} />
          </div>
        )}

        {cur === 'intake' && (
          <div>
            <h3 className="card-title" style={{ marginBottom: 14 }}>Tell us what's going on</h3>
            <div className="form-row"><label>Reason for visit</label><input className="input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Diabetes follow-up, sore throat, rash" /></div>
            <div className="form-row"><label>Symptoms or concern</label><textarea className="textarea" placeholder="When did it start, what you've tried, anything else that helps." /></div>
            <div className="form-row"><label>Any new medications or allergies?</label><input className="input" placeholder="Optional — list anything new since your last visit." /></div>
            <div className="form-row" style={{ marginBottom: 0 }}>
              <label>Attach files or photos (optional)</label>
              <div className="upload-zone"><Icon name="upload" /><div style={{ fontWeight: 600, color: 'var(--text)' }}>Click to attach</div><div style={{ fontSize: 12 }}>PDF, JPG, PNG</div></div>
            </div>
          </div>
        )}

        {cur === 'schedule' && (
          <div>
            <h3 className="card-title" style={{ marginBottom: 4 }}>Pick a time</h3>
            <p className="muted" style={{ fontSize: 13.5, marginBottom: 16 }}>{SP_PROVIDER_LABEL[provider]} · {SP_METHOD_LABEL[method]}</p>
            <div className="card-eyebrow" style={{ marginBottom: 10 }}>Available — Jun 14, 2026</div>
            <div className="time-slot-grid">
              {SP_SLOTS.map(t => (
                <button key={t} className={`time-slot ${slot === t ? 'selected' : ''}`} disabled={SP_TAKEN.has(t)} onClick={() => setSlot(t)}>{t}</button>
              ))}
            </div>
            {method === 'in-person' && (
              <div className="form-row" style={{ marginTop: 16, marginBottom: 0 }}>
                <label>Location</label>
                <select className="select"><option>Main Clinic — 901 Congress Ave, Austin</option><option>Northside Clinic — 12 Burnet Rd</option></select>
              </div>
            )}
          </div>
        )}

        {cur === 'econsult' && (
          <div className="stack" style={{ gap: 12 }}>
            <h3 className="card-title">What to expect</h3>
            <div className="card" style={{ background: 'var(--primary-100)', border: 'none' }}>
              <strong style={{ display: 'block', marginBottom: 4 }}>Async review</strong>
              <span className="muted" style={{ fontSize: 13.5 }}>Your care team usually responds within <strong>24–48 hours</strong>. You'll be notified when there's a reply, and it will appear in your Visits list.</span>
            </div>
            <div className="row gap-sm" style={{ alignItems: 'flex-start', background: 'var(--warning-light)', color: '#92400E', padding: '12px 14px', borderRadius: 10, fontSize: 13 }}>
              <Icon name="alert" size={16} style={{ marginTop: 1, flexShrink: 0 }} />
              <span>Not for urgent symptoms. For chest pain, trouble breathing, or other emergencies, call 911 or contact your clinic directly.</span>
            </div>
          </div>
        )}

        {cur === 'payment' && (
          <div>
            <h3 className="card-title" style={{ marginBottom: 14 }}>Payment</h3>
            <div className="stack" style={{ gap: 0 }}>
              <div className="row-between" style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}><span className="muted">Estimated copay</span><strong>{method === 'econsult' ? '$0 — covered' : '$25.00'}</strong></div>
              <div className="row-between" style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}><span className="muted">Insurance</span><strong>BlueCross · verified</strong></div>
            </div>
            <div className="form-row" style={{ marginTop: 14 }}>
              <label>Payment method</label>
              <select className="select"><option>Visa ···· 4242</option><option>Mastercard ···· 8819</option><option>Add a new card</option></select>
            </div>
            <div className="field-help">You won't be charged until the visit is complete.</div>
          </div>
        )}

        {cur === 'review' && (
          <div>
            <h3 className="card-title" style={{ marginBottom: 14 }}>Review &amp; confirm</h3>
            <div className="stack" style={{ gap: 0 }}>
              {reviewRows().map((r, i) => (
                <div key={i} className="row-between" style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <span className="muted">{r[0]}</span><span style={{ fontWeight: 600, textAlign: 'right' }}>{r[1]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <hr className="divider" />
        <div className="row-between">
          <Button variant="text" icon="arrowLeft" onClick={back}>{idx > 0 ? 'Back' : 'Cancel'}</Button>
          <Button onClick={next} disabled={!canNext} iconRight={cur === 'review' ? null : 'arrowRight'} icon={cur === 'review' ? (isConnectNow ? 'video' : 'check') : null}>
            {cur === 'review' ? (isConnectNow ? 'Connect now' : 'Confirm & submit') : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ----- Confirmation -----
const ConfirmScreen = () => {
  const { nav } = useRouter();
  const { store } = useStore();
  const c = store.confirm || { title: 'Done', detail: '', note: '', primaryLabel: 'Back to dashboard', primaryTo: '/dashboard' };
  return (
    <div className="content-narrow" style={{ maxWidth: 560, paddingTop: 32 }}>
      <div className="card" style={{ textAlign: 'center', padding: '40px 32px' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--success-light)', color: 'var(--success)', display: 'grid', placeItems: 'center', margin: '0 auto 18px' }}>
          <Icon name="checkCircle" size={32} />
        </div>
        <h2 style={{ fontSize: 22, marginBottom: 8 }}>{c.title}</h2>
        {c.detail && <div className="muted" style={{ fontSize: 14, marginBottom: 8 }}>{c.detail}</div>}
        {c.note && <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 420, margin: '0 auto 22px', lineHeight: 1.6 }}>{c.note}</p>}
        <div className="row gap-sm" style={{ justifyContent: 'center' }}>
          <Button variant="ghost" onClick={() => nav('/dashboard')}>Back to dashboard</Button>
          <Button onClick={() => nav(c.primaryTo)}>{c.primaryLabel}</Button>
        </div>
      </div>
    </div>
  );
};

// ----- Requests (non-visit work items) -----
const RequestsScreen = () => {
  const { nav } = useRouter();
  const { store } = useStore();
  const [tab, setTab] = useState('open');
  const list = store.requests.filter(r => (tab === 'open' ? r.open : !r.open));
  return (
    <div className="content-narrow">
      <div className="page-header">
        <div>
          <div className="page-title">Requests</div>
          <div className="page-subtitle">Non-visit help — refills, documents, insurance, and admin questions. Usually handled within 24 hours.</div>
        </div>
        <Button icon="plus" onClick={() => nav('/requests/new')}>Send a request</Button>
      </div>
      <div className="tabs">
        <button className={`tab ${tab === 'open' ? 'active' : ''}`} onClick={() => setTab('open')}>Open ({store.requests.filter(r => r.open).length})</button>
        <button className={`tab ${tab === 'resolved' ? 'active' : ''}`} onClick={() => setTab('resolved')}>Resolved ({store.requests.filter(r => !r.open).length})</button>
      </div>
      <div className="stack" style={{ gap: 12 }}>
        {list.length === 0 ? (
          <div className="card"><div className="empty-state"><div className="empty-state-icon"><Icon name="inbox" size={22} /></div><div style={{ fontWeight: 600, color: 'var(--text)' }}>No {tab} requests</div><div>Send a request for non-visit help.</div></div></div>
        ) : list.map(r => (
          <button key={r.id} className="card" onClick={() => nav(`/requests/${r.id}`)} style={{ display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left', cursor: 'pointer' }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--grey-300)', color: 'var(--text-secondary)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon name="inbox" size={18} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="row gap-sm" style={{ marginBottom: 4 }}><Badge>{r.type}</Badge><Badge>{r.status}</Badge></div>
              <div style={{ fontWeight: 600 }}>{r.title}</div>
              <div className="muted" style={{ fontSize: 12.5 }}>{r.updated}</div>
            </div>
            <Icon name="chevronRight" size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          </button>
        ))}
      </div>
    </div>
  );
};

const REQ_TYPES = ['Medication refill', 'Medical or admin question', 'Lab or result follow-up', 'Document or form request', 'Insurance issue', 'Other'];
const RequestNewScreen = () => {
  const { nav } = useRouter();
  const { setStore } = useStore();
  const [type, setType] = useState(REQ_TYPES[0]);
  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');
  const submit = (e) => {
    e.preventDefault();
    setStore(s => ({ ...s, confirm: { title: 'Request submitted', detail: "We'll handle this and update you here.", note: 'Most requests are handled within 24 hours. You can track status in Requests.', primaryLabel: 'View requests', primaryTo: '/requests' } }));
    nav('/confirm');
  };
  return (
    <div className="content-narrow" style={{ maxWidth: 720 }}>
      <button className="btn btn-text" onClick={() => nav('/requests')} style={{ marginBottom: 10, padding: '4px 8px' }}>
        <Icon name="arrowLeft" size={14} /> Back
      </button>
      <div className="page-header">
        <div>
          <div className="page-title">Send a request</div>
          <div className="page-subtitle">For non-visit help like refills, documents, or insurance. To talk to a provider about symptoms, <a href="#" onClick={(e) => { e.preventDefault(); nav('/see-provider'); }} style={{ fontWeight: 600 }}>see a provider</a> instead.</div>
        </div>
      </div>
      <form onSubmit={submit}>
        <div className="card">
          <div className="form-row"><label>What do you need?</label>
            <select className="select" value={type} onChange={(e) => setType(e.target.value)}>{REQ_TYPES.map(t => <option key={t}>{t}</option>)}</select>
          </div>
          <div className="form-row"><label>Subject</label><input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="A short summary, e.g. 'Refill Metformin 500mg'" required /></div>
          <div className="form-row"><label>Details</label><textarea className="textarea" value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Add anything that helps us handle this — pharmacy, dates, document type, etc." /></div>
          <div className="form-row"><label>Attachments (optional)</label>
            <div className="upload-zone"><Icon name="upload" /><div style={{ fontWeight: 600, color: 'var(--text)' }}>Click to attach files</div><div style={{ fontSize: 12 }}>PDF, JPG, PNG up to 25 MB each</div></div>
          </div>
          <div className="row gap-sm" style={{ alignItems: 'flex-start', background: 'var(--warning-light)', color: '#92400E', padding: '10px 14px', borderRadius: 10, fontSize: 12.5 }}>
            <Icon name="alert" size={15} style={{ marginTop: 1, flexShrink: 0 }} />
            <span>Requests are not for urgent or medical emergencies. If this is an emergency, call 911.</span>
          </div>
          <div className="row-between" style={{ marginTop: 14 }}>
            <Button type="button" variant="ghost" onClick={() => nav('/requests')}>Cancel</Button>
            <Button type="submit" icon="send" disabled={!subject.trim()}>Send request</Button>
          </div>
        </div>
      </form>
    </div>
  );
};

const RequestDetailScreen = ({ requestId }) => {
  const { nav } = useRouter();
  const { store } = useStore();
  const r = store.requests.find(x => x.id === requestId) || store.requests[0];
  if (!r) return <div>Request not found</div>;
  return (
    <div className="content-narrow" style={{ maxWidth: 980 }}>
      <button className="btn btn-text" onClick={() => nav('/requests')} style={{ marginBottom: 10, padding: '4px 8px' }}>
        <Icon name="arrowLeft" size={14} /> Back to requests
      </button>
      <div className="page-header" style={{ alignItems: 'flex-start' }}>
        <div>
          <div className="row gap-sm" style={{ marginBottom: 8 }}><Badge>{r.type}</Badge><Badge>{r.status}</Badge></div>
          <div className="page-title">{r.title}</div>
          <div className="page-subtitle">Submitted {r.created} · Handled by {r.handledBy}</div>
        </div>
      </div>
      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <div className="stack" style={{ gap: 20 }}>
          <Card title="Conversation">
            <div className="stack" style={{ gap: 16 }}>
              {r.thread.map((m, i) => (
                <div key={i} className={`msg-bubble ${m.from === 'me' ? 'me' : ''}`}>
                  <Avatar size="sm" initials={m.from === 'me' ? 'SJ' : m.name.split(' ').map(x => x[0]).slice(0, 2).join('')} color={m.from === 'me' ? null : 'linear-gradient(135deg, #196CD2, #1E40AF)'} />
                  <div><div className="msg-bubble-body">{m.body}</div><div className="msg-bubble-meta">{m.name} · {m.date}</div></div>
                </div>
              ))}
            </div>
            <hr className="divider" />
            <div className="row-between" style={{ background: 'var(--primary-100)', padding: '12px 14px', borderRadius: 10, gap: 14 }}>
              <div><strong style={{ display: 'block', fontSize: 14 }}>Need more help?</strong><span className="muted" style={{ fontSize: 12.5 }}>Send another request for a non-visit question.</span></div>
              <Button onClick={() => nav('/requests/new')} icon="plus" style={{ flexShrink: 0 }}>Send a request</Button>
            </div>
          </Card>
        </div>
        <div className="stack" style={{ gap: 20 }}>
          <Card title="Status">
            <div className="timeline">
              {r.timeline.map((t, i) => (
                <div key={i} className="timeline-item">
                  <div className={`timeline-dot ${t.state}`}>
                    {t.state === 'done' && <Icon name="check" size={14} />}
                    {t.state === 'active' && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor' }}></span>}
                  </div>
                  <div className="timeline-content"><div className="timeline-title">{t.label}</div><div className="timeline-meta">{t.when}</div></div>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Details">
            <div className="stack" style={{ gap: 6, fontSize: 13.5 }}>
              <div><span className="muted">Type:</span> {r.type}</div>
              <div><span className="muted">Handled by:</span> {r.handledBy}</div>
              <div><span className="muted">Submitted:</span> {r.created}</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export {
  VisitsScreen, VisitDetailScreen, TelemedCallScreen,
  SeeProviderScreen, ConfirmScreen,
  RequestsScreen, RequestNewScreen, RequestDetailScreen,
};
