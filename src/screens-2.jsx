// Visits + Telemedicine + e-consult screens
import React, { useState, useEffect } from 'react';
import { Icon } from './icons.jsx';
import { useRouter, useStore, useToast, usePicker, Button, Card, Badge, Avatar, Modal } from './core.jsx';
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
  const { openPicker } = usePicker();
  const [tab, setTab] = useState('upcoming');
  const visits = store.visits.filter(v => v.tense === tab);

  return (
    <div className="content-narrow">
      <div className="page-header">
        <div>
          <div className="page-title">Visits &amp; e-consults</div>
          <div className="page-subtitle">Every encounter in one place — video, phone, in-person, and async e-consults.</div>
        </div>
        <Button icon="plus" onClick={openPicker}>See a provider</Button>
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

// Schedule appointment (in-person & virtual)
// ─────────────────────────────────────────────
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Demo: assume current month is May 2026
const CURRENT_MONTH = 4; // May
const CURRENT_YEAR = 2026;
const TODAY = 27;

const buildCalendar = (year, month) => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
};

// Mock: which days in May/June 2026 have availability
const AVAILABLE_DAYS = {
  '2026-4': [27, 28, 29, 30],
  '2026-5': [1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20],
};

const SLOTS_BY_TIME = ['08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM'];

const ScheduleAppointmentScreen = () => {
  const { nav } = useRouter();
  const { store, setStore } = useStore();
  const toast = useToast();

  const [step, setStep] = useState(0);
  const [mode, setMode] = useState('Virtual'); // 'Virtual' | 'Phone' | 'In-Person'
  const [month, setMonth] = useState(CURRENT_MONTH);
  const [year, setYear] = useState(CURRENT_YEAR);
  const [day, setDay] = useState(28);
  const [time, setTime] = useState('10:30 AM');
  const [reason, setReason] = useState('');

  // Provider & location are pre-bound by the patient's registration / the link they
  // arrived through — there is no Event/Site/Program selection in the portal.
  const provider = store.providers.find(p => p.id === 'p1');
  const location = store.locations.find(l => l.id === 'loc1');

  const MODE_LABEL = { 'Virtual': 'Video visit', 'Phone': 'Phone visit', 'In-Person': 'In-person visit' };

  const submit = () => {
    const id = 'v' + Math.random().toString(36).slice(2, 6);
    const enc = 'ENC-' + Math.floor(4000 + Math.random() * 900);
    const whenStr = `${MONTH_NAMES[month].slice(0, 3)} ${day}, ${year}`;
    const newVisit = {
      id, when: whenStr, time,
      kind: mode === 'Virtual' ? 'Virtual Visit' : mode === 'Phone' ? 'Phone Visit' : 'In-Person Visit',
      provider: provider.name, specialty: provider.specialty, mode,
      status: 'Scheduled', tense: 'upcoming', encounter: enc,
      reason: reason || 'General consultation',
      diagnosis: null, plan: null,
    };
    const newNotif = {
      id: 'n' + Math.random().toString(36).slice(2, 6), kind: 'appointment',
      title: 'Visit scheduled', body: `${MODE_LABEL[mode]} with ${provider.name} on ${whenStr} at ${time}`,
      when: 'Just now', read: false, to: `/visits/${id}`, icon: 'check', color: '#0D875C',
    };
    setStore(s => ({ ...s, visits: [newVisit, ...s.visits], notifications: [newNotif, ...s.notifications] }));
    toast('Visit scheduled — an encounter has been opened');
    nav(`/visits/${id}`);
  };

  const canProceed = (() => {
    if (step === 0) return !!mode && !!reason.trim();
    if (step === 1) return !!day && !!time;
    return true;
  })();

  return (
    <div className="content-narrow" style={{ maxWidth: 820 }}>
      <button className="btn btn-text" onClick={() => nav('/visits')} style={{ marginBottom: 10, padding: '4px 8px' }}>
        <Icon name="arrowLeft" size={14} /> Back to visits &amp; e-consults
      </button>

      <div className="page-header" style={{ marginBottom: 18 }}>
        <div>
          <div className="page-title">Schedule a visit</div>
          <div className="page-subtitle">Pick how you'd like to be seen and a time that works. Your care team is already set.</div>
        </div>
      </div>

      <div className="steps">
        {['How & why', 'Date & time', 'Confirm'].map((label, i) => (
          <React.Fragment key={label}>
            <div className={`step ${i === step ? 'active' : i < step ? 'done' : ''}`}>
              <div className="step-num">{i < step ? <Icon name="check" size={14} /> : i + 1}</div>
              <span style={{ display: i === step ? 'inline' : 'none' }}>{label}</span>
            </div>
            {i < 2 && <div className={`step-line ${i < step ? 'done' : ''}`}></div>}
          </React.Fragment>
        ))}
      </div>

      <div className="card">
        {/* Step 0: how & why */}
        {step === 0 && (
          <div>
            <h3 className="card-title" style={{ marginBottom: 14 }}>How would you like to be seen?</h3>
            <div className="choice-cards" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
              <button className={`choice-card ${mode === 'Virtual' ? 'selected' : ''}`} onClick={() => setMode('Virtual')}>
                <div className="choice-card-icon"><Icon name="video" size={18} /></div>
                <div className="choice-card-title">Video</div>
                <div className="choice-card-sub">Secure video from anywhere</div>
              </button>
              <button className={`choice-card ${mode === 'Phone' ? 'selected' : ''}`} onClick={() => setMode('Phone')}>
                <div className="choice-card-icon"><Icon name="phone" size={18} /></div>
                <div className="choice-card-title">Phone</div>
                <div className="choice-card-sub">We'll call your number</div>
              </button>
              <button className={`choice-card ${mode === 'In-Person' ? 'selected' : ''}`} onClick={() => setMode('In-Person')}>
                <div className="choice-card-icon"><Icon name="building" size={18} /></div>
                <div className="choice-card-title">In person</div>
                <div className="choice-card-sub">At your registered clinic</div>
              </button>
            </div>

            <hr className="divider" />
            <div className="form-row">
              <label>What's the reason for your visit?</label>
              <textarea className="textarea" rows={3} value={reason} onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Follow-up on diabetes management and recent labs"></textarea>
              <div className="field-help">This opens the encounter and helps your provider prepare.</div>
            </div>

            <div className="provider-card" style={{ cursor: 'default' }}>
              <Avatar initials={provider.initials} color={provider.color} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{provider.name} <span className="badge badge-gray" style={{ fontSize: 10.5, marginLeft: 4 }}>Your care team</span></div>
                <div className="muted" style={{ fontSize: 12.5 }}>
                  {provider.specialty}{mode === 'In-Person' ? ` · ${location.name}` : ''}
                </div>
              </div>
            </div>
            <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>
              <Icon name="info" size={12} style={{ verticalAlign: '-1px', marginRight: 4 }} />
              Set from your registration. Need a different provider or location? <a href="#" onClick={(e) => { e.preventDefault(); nav('/messages'); }} style={{ fontWeight: 600 }}>Message Patient Services</a>.
            </div>
          </div>
        )}

        {/* Step 1: date + time */}
        {step === 1 && (
          <div>
            <h3 className="card-title" style={{ marginBottom: 4 }}>Pick a date &amp; time</h3>
            <p className="muted" style={{ fontSize: 13.5, marginBottom: 18 }}>{provider.name} · {MODE_LABEL[mode]}</p>

            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'flex-start' }}>
              <div>
                <div className="row-between" style={{ marginBottom: 12 }}>
                  <button className="icon-btn" style={{ width: 32, height: 32 }} onClick={() => {
                    if (month === 0) { setMonth(11); setYear(year - 1); }
                    else setMonth(month - 1);
                  }}>
                    <Icon name="chevronLeft" size={14} />
                  </button>
                  <div style={{ fontWeight: 700 }}>{MONTH_NAMES[month]} {year}</div>
                  <button className="icon-btn" style={{ width: 32, height: 32 }} onClick={() => {
                    if (month === 11) { setMonth(0); setYear(year + 1); }
                    else setMonth(month + 1);
                  }}>
                    <Icon name="chevronRight" size={14} />
                  </button>
                </div>
                <div className="calendar-grid">
                  {DAY_LABELS.map(d => <div key={d} className="calendar-day-label">{d}</div>)}
                  {buildCalendar(year, month).map((d, i) => {
                    if (d === null) return <div key={i} className="calendar-cell muted"></div>;
                    const isToday = year === CURRENT_YEAR && month === CURRENT_MONTH && d === TODAY;
                    const isPast = year < CURRENT_YEAR || (year === CURRENT_YEAR && (month < CURRENT_MONTH || (month === CURRENT_MONTH && d < TODAY)));
                    const hasSlots = (AVAILABLE_DAYS[`${year}-${month}`] || []).includes(d);
                    const isSelected = day === d;
                    return (
                      <button key={i}
                        className={`calendar-cell ${isToday ? 'today' : ''} ${hasSlots ? 'has-slots' : ''} ${isSelected ? 'selected' : ''}`}
                        disabled={isPast || !hasSlots}
                        onClick={() => setDay(d)}>
                        {d}
                      </button>
                    );
                  })}
                </div>
                <div className="row gap-sm" style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--primary)' }}></span>
                    Available
                  </span>
                </div>
              </div>

              <div>
                <div style={{ fontWeight: 700, marginBottom: 12 }}>{day ? `${MONTH_NAMES[month]} ${day}` : 'Pick a date'}</div>
                {day ? (
                  <div className="time-slot-grid">
                    {SLOTS_BY_TIME.map(t => {
                      const taken = (t.charCodeAt(0) + day) % 4 === 0;
                      return (
                        <button key={t} className={`time-slot ${time === t ? 'selected' : ''}`}
                          onClick={() => setTime(t)} disabled={taken} title={taken ? 'Unavailable' : ''}>
                          {t}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="muted" style={{ fontSize: 13, padding: 14, background: 'var(--grey-200)', borderRadius: 10 }}>
                    Choose a date to see available times.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: confirm */}
        {step === 2 && (
          <div>
            <h3 className="card-title" style={{ marginBottom: 14 }}>Confirm your visit</h3>

            <div className="card" style={{ background: 'var(--grey-200)', border: 'none', padding: 16, marginBottom: 16 }}>
              <div className="row" style={{ marginBottom: 12 }}>
                <Avatar initials={provider.initials} color={provider.color} size="lg" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{provider.name}</div>
                  <div className="muted" style={{ fontSize: 13.5 }}>{provider.specialty}</div>
                </div>
              </div>
              <div className="grid grid-2" style={{ gap: 12 }}>
                <div>
                  <div className="card-eyebrow">Date &amp; time</div>
                  <div style={{ fontWeight: 500 }}>{MONTH_NAMES[month]} {day}, {year} at {time}</div>
                </div>
                <div>
                  <div className="card-eyebrow">Visit type</div>
                  <div style={{ fontWeight: 500 }}>{MODE_LABEL[mode]}</div>
                </div>
                <div>
                  <div className="card-eyebrow">{mode === 'In-Person' ? 'Location' : 'Format'}</div>
                  <div style={{ fontWeight: 500 }}>{mode === 'In-Person' ? location.name : mode === 'Phone' ? 'We will call you' : 'Secure video visit'}</div>
                  {mode === 'In-Person' && <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>{location.address}</div>}
                </div>
                <div>
                  <div className="card-eyebrow">Reason</div>
                  <div style={{ fontWeight: 500 }}>{reason || '—'}</div>
                </div>
              </div>
            </div>

            <div className="card" style={{ background: 'var(--primary-100)', border: 'none', padding: 14, fontSize: 13, color: 'var(--text-secondary)' }}>
              <div className="row gap-sm" style={{ alignItems: 'flex-start' }}>
                <Icon name="info" size={16} style={{ color: 'var(--primary)', marginTop: 2 }} />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>What happens next?</div>
                  Confirming opens an encounter for this visit automatically. We'll send a confirmation by email and SMS{mode === 'Virtual' ? ' with a link to join.' : mode === 'Phone' ? ' and call you at your number.' : ', plus a reminder 24 hours before.'} You can reschedule or cancel anytime.
                </div>
              </div>
            </div>
          </div>
        )}

        <hr className="divider" />
        <div className="row-between">
          <Button variant="text" onClick={() => step > 0 ? setStep(step - 1) : nav('/visits')} icon={step > 0 ? 'arrowLeft' : null}>
            {step > 0 ? 'Back' : 'Cancel'}
          </Button>
          <Button
            onClick={() => step < 2 ? setStep(step + 1) : submit()}
            iconRight={step < 2 ? 'arrowRight' : null}
            icon={step === 2 ? 'check' : null}
            disabled={!canProceed}>
            {step < 2 ? 'Continue' : 'Confirm visit'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// E-consult compose (async clinical encounter). Replaces the old generic "request".
// Submitting opens an encounter and routes to the unified visit/e-consult detail.
// ─────────────────────────────────────────────
const ECONSULT_TYPES = ['Medical question or symptom', 'Prescription refill', 'Test or result follow-up'];

const EConsultScreen = () => {
  const { nav } = useRouter();
  const toast = useToast();
  const { store, setStore } = useStore();
  const [type, setType] = useState(ECONSULT_TYPES[0]);
  const [subject, setSubject] = useState('');
  const [desc, setDesc] = useState('');
  const [files, setFiles] = useState([]);

  const submit = (e) => {
    e.preventDefault();
    if (!subject.trim() || !desc.trim()) return;
    const id = 'e' + Math.random().toString(36).slice(2, 6);
    const enc = 'ENC-' + Math.floor(4000 + Math.random() * 900);
    const newEconsult = {
      id, when: 'Just now', time: 'Just now',
      kind: `E-consult — ${subject}`, provider: 'Care Team', specialty: 'Primary Care',
      mode: 'E-consult', async: true, status: 'Submitted', tense: 'upcoming', encounter: enc,
      reason: type, description: desc, assigned: 'Care Team', diagnosis: null, plan: null,
      messages: [{ from: 'patient', name: store.user.name, date: 'Just now', body: desc }],
      timeline: [
        { label: 'Submitted', date: 'Just now', state: 'done' },
        { label: 'Encounter opened', date: 'Just now', state: 'done' },
        { label: 'In review', date: '—', state: 'active' },
        { label: 'Resolved', date: '—', state: 'pending' },
      ],
    };
    setStore(s => ({ ...s, visits: [newEconsult, ...s.visits] }));
    toast('E-consult sent — an encounter has been opened');
    nav(`/visits/${id}`);
  };

  return (
    <div className="content-narrow" style={{ maxWidth: 720 }}>
      <button className="btn btn-ghost" onClick={() => nav('/visits')} style={{ marginBottom: 10, padding: '4px 8px' }}>
        <Icon name="arrowLeft" size={14} /> Back to visits &amp; e-consults
      </button>
      <div className="page-header">
        <div>
          <div className="page-title">Send an e-consult</div>
          <div className="page-subtitle">Describe your concern in writing. A provider on your care team reviews and replies — usually within 24 hours.</div>
        </div>
      </div>

      <form onSubmit={submit}>
        <div className="card stack" style={{ gap: 0 }}>
          <div className="form-row">
            <label>What's this about?</label>
            <select className="select" value={type} onChange={(e) => setType(e.target.value)}>
              {ECONSULT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <div className="field-help">For insurance, billing, or scheduling, <a href="#" onClick={(e) => { e.preventDefault(); nav('/messages'); }} style={{ fontWeight: 600 }}>message Patient Services</a> instead.</div>
          </div>
          <div className="form-row">
            <label>Subject</label>
            <input className="input" placeholder="A short summary, e.g. 'persistent headache for 3 days'" value={subject} onChange={(e) => setSubject(e.target.value)} required />
          </div>
          <div className="form-row">
            <label>What's going on?</label>
            <textarea className="textarea" placeholder="Describe your symptoms, when they started, what you've tried, and anything else helpful." value={desc} onChange={(e) => setDesc(e.target.value)} required />
          </div>
          <div className="form-row">
            <label>Attachments (optional)</label>
            <div className="upload-zone" onClick={() => setFiles(f => [...f, { name: 'photo.jpg', size: '420 KB' }])}>
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

          <div className="row gap-sm" style={{ alignItems: 'flex-start', background: 'var(--warning-light)', color: '#92400E', padding: '10px 12px', borderRadius: 10, fontSize: 12.5 }}>
            <Icon name="alert" size={15} style={{ marginTop: 1, flexShrink: 0 }} />
            <span>E-consults are for non-urgent concerns. If this is a medical emergency, call 911.</span>
          </div>

          <div className="row" style={{ gap: 10, alignItems: 'center', marginTop: 12 }}>
            <Avatar initials="EC" size="sm" />
            <span className="muted" style={{ fontSize: 12.5, flex: 1 }}>Goes to your care team — Dr. Emily Carter & Lisa Ng, NP</span>
          </div>

          <div className="row gap-sm" style={{ justifyContent: 'flex-end', marginTop: 12 }}>
            <Button type="button" variant="ghost" onClick={() => nav('/visits')}>Cancel</Button>
            <Button type="submit" icon="send" disabled={!subject.trim() || !desc.trim()}>Send e-consult</Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export {
  VisitsScreen, VisitDetailScreen,
  TelemedicineScreen, TelemedCallScreen,
  ScheduleAppointmentScreen, EConsultScreen,
};
