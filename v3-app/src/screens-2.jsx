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

// E-consult detail — structured healthcare support ticket
const EConsultDetail = ({ v }) => {
  const { nav } = useRouter();
  const { store, setStore } = useStore();
  const toast = useToast();
  const [reply, setReply] = useState('');
  const closed = v.status === 'Closed' || v.status === 'Resolved';

  const sendReply = () => {
    if (!reply.trim()) return;
    setStore(s => ({
      ...s,
      visits: s.visits.map(x => x.id === v.id ? {
        ...x, status: 'In Review',
        messages: [...x.messages, { from: 'patient', name: s.user.name, date: 'Just now', body: reply }],
      } : x),
    }));
    setReply('');
    toast('Follow-up sent to your care team');
  };
  const closeTicket = () => {
    setStore(s => ({ ...s, visits: s.visits.map(x => x.id === v.id ? { ...x, status: 'Closed', tense: 'past' } : x) }));
    toast('E-consult closed');
    nav('/visits');
  };

  return (
    <div className="content-narrow" style={{ maxWidth: 980 }}>
      <button className="btn btn-ghost" onClick={() => nav('/visits')} style={{ marginBottom: 10, padding: '4px 8px' }}>
        <Icon name="arrowLeft" size={14} /> Back to visits
      </button>
      <div className="page-header" style={{ alignItems: 'flex-start' }}>
        <div>
          <div className="row gap-sm" style={{ marginBottom: 8 }}>
            <Badge>E-consult</Badge>
            <Badge>{v.status}</Badge>
          </div>
          <div className="page-title">{v.kind.replace('E-consult — ', '')}</div>
          <div className="page-subtitle">Ticket {v.encounter} · Submitted {v.when} · {v.assigned}</div>
        </div>
      </div>

      <div className="split-grid">
        <div className="stack" style={{ gap: 20 }}>
          {/* Response-time commitment */}
          <div className="card" style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: 'var(--primary-100)', border: 'none' }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'white', color: 'var(--primary)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon name="clock" size={18} /></div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{closed ? 'This e-consult is closed' : `Expected response: ${v.expected || 'within 24–48 hours'}`}</div>
              <div className="muted" style={{ fontSize: 12.5 }}>For urgent symptoms, call emergency services or contact your clinic directly.</div>
            </div>
          </div>

          <Card title="Submitted concern">
            <div style={{ fontSize: 14 }}>{v.description}</div>
          </Card>

          {v.intake && (
            <Card title="Intake answers">
              <div className="stack" style={{ gap: 0 }}>
                {v.intake.map((q, i) => (
                  <div key={i} className="row-between" style={{ padding: '10px 0', borderBottom: i < v.intake.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'flex-start', gap: 16 }}>
                    <span className="muted" style={{ fontSize: 13 }}>{q.q}</span>
                    <span style={{ fontWeight: 600, fontSize: 13.5, textAlign: 'right' }}>{q.a}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {v.attachments && v.attachments.length > 0 && (
            <Card title="Attachments">
              <div className="stack">
                {v.attachments.map((a, i) => (
                  <div key={i} className="row" style={{ padding: '8px 0' }}>
                    <div className="doc-icon"><Icon name="fileImage" size={18} /></div>
                    <div style={{ flex: 1, fontWeight: 600, fontSize: 13.5 }}>{a}</div>
                    <button className="icon-btn" style={{ width: 32, height: 32 }}><Icon name="download" size={15} /></button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card title={v.response ? 'Provider response & activity' : 'Activity'}>
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
            {closed ? (
              <div className="row" style={{ gap: 10, alignItems: 'center', background: 'var(--green-light)', color: '#166534', padding: '12px 14px', borderRadius: 10 }}>
                <Icon name="checkCircle" size={18} />
                <div style={{ fontSize: 13.5 }}>This e-consult is closed. Need more help? <a href="#" onClick={(e) => { e.preventDefault(); nav('/see-provider'); }} style={{ fontWeight: 700 }}>Start a new visit</a>.</div>
              </div>
            ) : (
              <div className="stack" style={{ gap: 10 }}>
                <div className="card-eyebrow">Add a follow-up</div>
                <textarea className="textarea" placeholder="Reply to your care team…" value={reply} onChange={(e) => setReply(e.target.value)} />
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <Button variant="ghost" icon="paperclip">Attach file</Button>
                  <Button icon="send" onClick={sendReply} disabled={!reply.trim()}>Send follow-up</Button>
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
          <Card title="Actions">
            <div className="stack" style={{ gap: 8 }}>
              {!closed && <Button variant="secondary" icon="message" block onClick={() => { const el = document.querySelector('textarea'); if (el) el.focus(); }}>Add follow-up</Button>}
              <Button variant="secondary" icon="plus" block onClick={() => nav('/see-provider')}>Start a new visit</Button>
              {!closed && <Button variant="ghost" icon="check" block onClick={closeTicket}>Close this e-consult</Button>}
            </div>
          </Card>
          <Card title="Encounter">
            <div className="muted" style={{ fontSize: 12.5 }}>Filed to encounter <strong>{v.encounter}</strong> in the EMR. Everything you send here is recorded to it.</div>
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

      <div className="split-grid">
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
// "See a provider" — DOCTOR-FIRST flow (v3)
// provider → visit type (doctor-specific availability) → [slot] → intake → [payment] → review
// ─────────────────────────────────────────────
// Care team listed first; First Available at the bottom. Each provider exposes only
// the visit types actually available for them.
const CARE_TEAM = [
  { id: 'carter', name: 'Dr. Emily Carter', specialty: 'Primary Care', initials: 'EC', color: 'linear-gradient(135deg, #0D875C, #0A6B49)', avail: 'Available now for video', online: true, types: ['video-now', 'phone-now', 'video-sched', 'inperson', 'econsult'] },
  { id: 'ng', name: 'Lisa Ng, NP', specialty: 'Nurse Practitioner', initials: 'LN', color: 'linear-gradient(135deg, #196CD2, #1E40AF)', avail: 'Next available today 3:30 PM', online: false, types: ['video-sched', 'phone-sched', 'econsult'] },
  { id: 'patel', name: 'Dr. Raj Patel', specialty: 'Endocrinology', initials: 'RP', color: 'linear-gradient(135deg, #92400E, #B45309)', avail: 'Next available Jun 14', online: false, types: ['video-sched', 'inperson', 'econsult'] },
];
const FIRST_AVAIL = { id: 'first', name: 'First available provider', specialty: 'Fastest option across your care team', initials: '⚡', color: 'linear-gradient(135deg, #6B7280, #4B5563)', avail: 'Connect now', online: true, types: ['video-now', 'phone-now', 'econsult'] };
const VISIT_TYPES = {
  'video-now':   { label: 'Video visit now', icon: 'video', group: 'now', now: true, slot: false, pay: true, desc: 'Connect over secure video right away.' },
  'phone-now':   { label: 'Phone visit now', icon: 'phone', group: 'now', now: true, slot: false, pay: true, desc: "We'll call you at your number." },
  'video-sched': { label: 'Scheduled video visit', icon: 'video', group: 'later', slot: true, pay: true, desc: 'Pick a day and time for a video visit.' },
  'phone-sched': { label: 'Scheduled phone visit', icon: 'phone', group: 'later', slot: true, pay: true, desc: 'Pick a day and time for a phone call.' },
  'inperson':    { label: 'In-person visit', icon: 'building', group: 'later', slot: true, pay: true, desc: 'Visit a clinic location near you.' },
  'econsult':    { label: 'E-consult', icon: 'message', group: 'async', async: true, slot: false, pay: false, tag: 'Async · 24–48h', desc: 'Send your concern and intake for review. Response within 24–48 hours.' },
};
const SP_SLOTS = ['9:00', '9:30', '10:00', '10:30', '11:00', '11:30', '2:15', '2:45', '3:15'];
const SP_TAKEN = new Set(['9:00', '11:30']);
const ProviderRow = ({ p, selected, onClick }) => (
  <button className="picker-option" onClick={onClick}
    style={{ borderColor: selected ? 'var(--primary)' : undefined, background: selected ? 'var(--primary-100)' : undefined, cursor: 'pointer' }}>
    <div className="avatar" style={{ background: p.color, flexShrink: 0 }}>{p.initials}</div>
    <div style={{ flex: 1 }}>
      <div className="picker-option-title">{p.name}</div>
      <div className="muted" style={{ fontSize: 13 }}>{p.specialty}</div>
    </div>
    <div className="row gap-sm" style={{ alignItems: 'center' }}>
      <span className="badge" style={{ background: p.online ? 'var(--success-light)' : 'var(--grey-200)', color: p.online ? 'var(--success-dark)' : 'var(--text-secondary)', border: 'none', fontSize: 11.5 }}>
        {p.online && <span className="dot" style={{ background: 'var(--success)' }}></span>}{p.avail}
      </span>
      <Icon name="chevronRight" size={18} style={{ color: 'var(--text-muted)' }} />
    </div>
  </button>
);

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
  const { store, setStore } = useStore();
  const toast = useToast();
  const F = store.features;
  const [providerId, setProviderId] = useState(null);
  const [typeKey, setTypeKey] = useState(null);
  const [slot, setSlot] = useState('2:15');
  const [reason, setReason] = useState('');
  const [onset, setOnset] = useState('');
  const [severity, setSeverity] = useState('Mild');
  const [tried, setTried] = useState('');
  const [step, setStep] = useState(0);

  const provider = [...CARE_TEAM, FIRST_AVAIL].find(p => p.id === providerId) || null;
  const vtype = typeKey ? VISIT_TYPES[typeKey] : null;
  const availTypes = provider ? provider.types.filter(t => {
    if (t === 'econsult') return F.econsult;
    if (t === 'inperson') return F.inperson;
    if (t.indexOf('video') === 0) return F.video;
    if (!F.scheduling && VISIT_TYPES[t].slot) return false;
    return true;
  }) : [];
  const nowTypes = availTypes.filter(t => VISIT_TYPES[t].group === 'now');
  const laterTypes = availTypes.filter(t => VISIT_TYPES[t].group === 'later');
  const asyncTypes = availTypes.filter(t => VISIT_TYPES[t].group === 'async');

  const needsSlot = vtype && vtype.slot;
  const needsPay = vtype && vtype.pay && F.payment;
  const isEconsult = typeKey === 'econsult';
  const isNow = vtype && vtype.now;

  const steps = (() => {
    const s = ['provider', 'type'];
    if (needsSlot) s.push('slot');
    s.push('intake');
    if (needsPay) s.push('payment');
    s.push('review');
    return s;
  })();
  const idx = Math.min(step, steps.length - 1);
  const cur = steps[idx];
  const canNext = !((cur === 'provider' && !providerId) || (cur === 'type' && !typeKey));

  const back = () => { if (idx > 0) setStep(idx - 1); else nav('/dashboard'); };
  const next = () => { if (!canNext) return; if (idx < steps.length - 1) setStep(idx + 1); else doConfirm(); };
  const pickProvider = (id) => { setProviderId(id); setTypeKey(null); };

  const doConfirm = () => {
    if (isNow) { toast('Connecting you with ' + provider.name + '…'); nav('/telemedicine/call'); return; }
    if (isEconsult) {
      const id = 'ec' + Math.random().toString(36).slice(2, 6);
      const newEc = {
        id, when: 'Just now', time: '', kind: 'E-consult — ' + (reason || 'New concern'), provider: provider.name, specialty: provider.specialty,
        mode: 'E-consult', async: true, status: 'Open', expected: 'within 24–48 hours', tense: 'upcoming', encounter: 'ENC-' + Math.floor(4500 + Math.random() * 400),
        reason: reason || 'New concern', description: reason || 'New concern', assigned: provider.name,
        intake: [{ q: 'Main concern', a: reason || '—' }, { q: 'When did it start?', a: onset || '—' }, { q: 'Severity', a: severity }, { q: 'What have you tried?', a: tried || '—' }],
        response: null, diagnosis: null, plan: null,
        messages: [{ from: 'patient', name: store.user.name, date: 'Just now', body: reason || 'New concern' }],
        timeline: [
          { label: 'Submitted', date: 'Just now', state: 'done' },
          { label: 'Assigned to care team', date: 'Just now', state: 'done' },
          { label: 'Under review', date: '—', state: 'active' },
          { label: 'Provider responded', date: '—', state: 'pending' },
          { label: 'Closed', date: '—', state: 'pending' },
        ],
      };
      setStore(s => ({ ...s, visits: [newEc, ...s.visits], confirm: { title: 'E-consult submitted', detail: `${provider.name} · ${provider.specialty}`, note: "Your care team usually responds within 24–48 hours. You'll be notified and it appears in Visits. For urgent symptoms, call emergency services or contact your clinic directly.", primaryLabel: 'View e-consult', primaryTo: '/visits/' + id } }));
    } else {
      setStore(s => ({ ...s, confirm: { title: 'Appointment scheduled', detail: `${vtype.label} · ${provider.name} · Jun 14, ${slot} PM`, note: 'A reminder will be sent 24 hours before your visit. You can reschedule or cancel anytime from the visit details.', primaryLabel: 'View visit', primaryTo: '/visits/v2' } }));
    }
    nav('/confirm');
  };

  const reviewRows = () => {
    const rows = [['Provider', `${provider.name} · ${provider.specialty}`], ['Visit type', vtype.label]];
    if (isEconsult) rows.push(['Response', 'Expected within 24–48 hours']);
    else if (needsSlot) rows.push(['When', `Jun 14, 2026 · ${slot} PM`]);
    else rows.push(['When', 'Now — connect immediately']);
    rows.push(['Reason', reason || 'Added in intake']);
    rows.push(['Payment', needsPay ? '$25.00 copay · Visa ···· 4242' : isEconsult ? 'No payment required' : '$0 — covered']);
    return rows;
  };

  const TypeChoice = (t) => {
    const vt = VISIT_TYPES[t];
    return <ChoiceRow key={t} icon={vt.icon} title={vt.label} desc={vt.desc} tag={vt.tag} selected={typeKey === t} onClick={() => setTypeKey(t)} />;
  };

  return (
    <div className="content-narrow" style={{ maxWidth: 820 }}>
      <button className="btn btn-text" onClick={() => nav('/dashboard')} style={{ marginBottom: 10, padding: '4px 8px' }}>
        <Icon name="x" size={14} /> Cancel
      </button>
      <div className="page-header" style={{ marginBottom: 14 }}>
        <div>
          <div className="page-title">See a provider</div>
          <div className="page-subtitle">Choose someone from your care team, then select an available care option. · Step {idx + 1} of {steps.length}</div>
        </div>
      </div>

      {/* progress bar */}
      <div className="row gap-sm" style={{ marginBottom: 24 }}>
        {steps.map((s, i) => (
          <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: i < idx ? 'var(--success)' : i === idx ? 'var(--primary)' : 'var(--border)' }} />
        ))}
      </div>

      <div className="card">
        {cur === 'provider' && (
          <div className="stack" style={{ gap: 10 }}>
            <h3 className="card-title" style={{ marginBottom: 0 }}>Choose a provider</h3>
            <div className="card-eyebrow">Your care team</div>
            {CARE_TEAM.map(p => <ProviderRow key={p.id} p={p} selected={providerId === p.id} onClick={() => pickProvider(p.id)} />)}
            <div className="card-eyebrow" style={{ marginTop: 8 }}>Other options</div>
            <ProviderRow p={FIRST_AVAIL} selected={providerId === 'first'} onClick={() => pickProvider('first')} />
          </div>
        )}

        {cur === 'type' && (
          <div className="stack" style={{ gap: 10 }}>
            <h3 className="card-title" style={{ marginBottom: 0 }}>How would you like to see {provider.name}?</h3>
            {!provider.online && nowTypes.length === 0 && (
              <div className="row gap-sm" style={{ alignItems: 'flex-start', background: 'var(--bg)', border: '1px solid var(--border)', padding: '12px 14px', borderRadius: 10, fontSize: 13 }}>
                <Icon name="info" size={16} style={{ marginTop: 1, flexShrink: 0, color: 'var(--text-secondary)' }} />
                <span>{provider.name} isn't available for a walk-in right now. You can schedule a visit or send an e-consult.</span>
              </div>
            )}
            {nowTypes.length > 0 && <><div className="card-eyebrow">Available now</div>{nowTypes.map(TypeChoice)}</>}
            {laterTypes.length > 0 && <><div className="card-eyebrow" style={{ marginTop: 8 }}>Schedule later</div>{laterTypes.map(TypeChoice)}</>}
            {asyncTypes.length > 0 && <><div className="card-eyebrow" style={{ marginTop: 8 }}>Async option</div>{asyncTypes.map(TypeChoice)}</>}
          </div>
        )}

        {cur === 'slot' && (
          <div>
            <h3 className="card-title" style={{ marginBottom: 4 }}>Pick a time</h3>
            <p className="muted" style={{ fontSize: 13.5, marginBottom: 16 }}>{provider.name} · {vtype.label}</p>
            <div className="card-eyebrow" style={{ marginBottom: 10 }}>Available — Jun 14, 2026</div>
            <div className="time-slot-grid">
              {SP_SLOTS.map(t => (
                <button key={t} className={`time-slot ${slot === t ? 'selected' : ''}`} disabled={SP_TAKEN.has(t)} onClick={() => setSlot(t)}>{t}</button>
              ))}
            </div>
            {typeKey === 'inperson' && (
              <div className="form-row" style={{ marginTop: 16, marginBottom: 0 }}>
                <label>Location</label>
                <select className="select"><option>Main Clinic — 901 Congress Ave, Austin</option><option>North Austin Office — 12500 N Lamar Blvd</option></select>
              </div>
            )}
          </div>
        )}

        {cur === 'intake' && !isEconsult && (
          <div>
            <h3 className="card-title" style={{ marginBottom: 14 }}>Tell us what's going on</h3>
            <div className="form-row"><label>Reason for visit</label><input className="input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Diabetes follow-up, sore throat, rash" /></div>
            <div className="form-row"><label>Symptoms or concern</label><textarea className="textarea" placeholder="When did it start, what you've tried, anything else that helps." /></div>
            <div className="form-row" style={{ marginBottom: 0 }}>
              <label>Attach files or photos (optional)</label>
              <div className="upload-zone"><Icon name="upload" /><div style={{ fontWeight: 600, color: 'var(--text)' }}>Click to attach</div><div style={{ fontSize: 12 }}>PDF, JPG, PNG</div></div>
            </div>
          </div>
        )}

        {cur === 'intake' && isEconsult && (
          <div>
            <h3 className="card-title" style={{ marginBottom: 4 }}>Intake questionnaire</h3>
            <p className="muted" style={{ fontSize: 13.5, marginBottom: 14 }}>Answer a few questions so {provider.name} can review without a live visit.</p>
            <div className="form-row"><label>What's your main concern?</label><input className="input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Itchy rash on left forearm" /></div>
            <div className="form-row"><label>When did it start?</label><input className="input" value={onset} onChange={(e) => setOnset(e.target.value)} placeholder="e.g. 2 days ago" /></div>
            <div className="form-row"><label>How severe is it?</label>
              <select className="select" value={severity} onChange={(e) => setSeverity(e.target.value)}><option>Mild</option><option>Moderate</option><option>Severe</option></select>
            </div>
            <div className="form-row"><label>What have you tried so far?</label><textarea className="textarea" value={tried} onChange={(e) => setTried(e.target.value)} placeholder="Medications, home remedies, etc." /></div>
            <div className="form-row" style={{ marginBottom: 0 }}>
              <label>Upload files or photos (optional)</label>
              <div className="upload-zone"><Icon name="upload" /><div style={{ fontWeight: 600, color: 'var(--text)' }}>Click to attach</div><div style={{ fontSize: 12 }}>A clear photo helps your provider</div></div>
            </div>
          </div>
        )}

        {cur === 'payment' && (
          <div>
            <h3 className="card-title" style={{ marginBottom: 14 }}>Payment</h3>
            <div className="stack" style={{ gap: 0 }}>
              <div className="row-between" style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}><span className="muted">Estimated copay</span><strong>$25.00</strong></div>
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
            {isEconsult && (
              <div className="row gap-sm" style={{ alignItems: 'flex-start', background: 'var(--warning-light)', color: '#92400E', padding: '12px 14px', borderRadius: 10, fontSize: 12.5, marginTop: 14 }}>
                <Icon name="alert" size={15} style={{ marginTop: 1, flexShrink: 0 }} />
                <span>E-consults are not for emergencies. For urgent symptoms, call emergency services or contact your clinic directly.</span>
              </div>
            )}
          </div>
        )}

        <hr className="divider" />
        <div className="row-between sp-footer">
          <Button variant="text" icon="arrowLeft" onClick={back}>{idx > 0 ? 'Back' : 'Cancel'}</Button>
          <Button onClick={next} disabled={!canNext} iconRight={cur === 'review' ? null : 'arrowRight'} icon={cur === 'review' ? (isNow ? 'video' : isEconsult ? 'send' : 'check') : null}>
            {cur === 'review' ? (isNow ? 'Connect now' : isEconsult ? 'Submit e-consult' : 'Confirm appointment') : 'Continue'}
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
// ----- Refills (medication refill flow — replaces the removed Requests tab) -----
const RefillsScreen = () => {
  const { nav } = useRouter();
  const { store, setStore } = useStore();
  const toast = useToast();
  const refills = store.refills;
  const meds = store.medical.meds;

  const requestRefill = (med) => {
    const id = 'rf' + Math.random().toString(36).slice(2, 6);
    setStore(s => ({
      ...s,
      refills: [{ id, med: med.name, dose: med.dose, status: 'In Review', requested: 'Just now', pharmacy: s.user.pharmacy, needsAction: false,
        timeline: [{ label: 'Requested', when: 'Just now', state: 'done' }, { label: 'In review', when: 'Pharmacy Team', state: 'active' }, { label: 'Ready for pickup', when: '—', state: 'pending' }] }, ...s.refills],
    }));
    toast(`Refill requested for ${med.name}`);
  };
  const confirmPickup = (rf) => {
    setStore(s => ({ ...s, refills: s.refills.map(x => x.id === rf.id ? { ...x, status: 'In Review', needsAction: false, note: undefined,
      timeline: [{ label: 'Requested', when: rf.requested, state: 'done' }, { label: 'Confirmed pharmacy', when: 'Just now', state: 'done' }, { label: 'In review', when: 'Pharmacy Team', state: 'active' }, { label: 'Ready for pickup', when: '—', state: 'pending' }] } : x) }));
    toast('Pharmacy confirmed — refill is being processed');
  };

  return (
    <div className="content-narrow">
      <div className="page-header">
        <div>
          <div className="page-title">Refills</div>
          <div className="page-subtitle">Request medication refills and track their status. Usually processed within 24 hours.</div>
        </div>
      </div>

      <div className="card-eyebrow" style={{ marginBottom: 10 }}>Active refills</div>
      <div className="stack" style={{ gap: 12, marginBottom: 28 }}>
        {refills.length === 0 ? (
          <div className="card"><div className="empty-state"><div className="empty-state-icon"><Icon name="pill" size={22} /></div><div style={{ fontWeight: 600, color: 'var(--text)' }}>No active refills</div><div>Request a refill from your medication list below.</div></div></div>
        ) : refills.map(rf => (
          <div key={rf.id} className="card">
            <div className="row" style={{ alignItems: 'flex-start', gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--teal-light)', color: 'var(--teal)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon name="pill" size={18} /></div>
              <div style={{ flex: 1 }}>
                <div className="row-between">
                  <div style={{ fontWeight: 700 }}>{rf.med} <span className="muted" style={{ fontWeight: 400 }}>{rf.dose}</span></div>
                  <Badge>{rf.status}</Badge>
                </div>
                <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>Requested {rf.requested} · {rf.pharmacy}</div>
                {rf.needsAction && rf.note && (
                  <div className="row-between" style={{ background: 'var(--warning-light)', color: '#92400E', padding: '10px 12px', borderRadius: 8, marginTop: 10, gap: 12 }}>
                    <span style={{ fontSize: 12.5 }}>{rf.note}</span>
                    <Button size="sm" onClick={() => confirmPickup(rf)} style={{ flexShrink: 0 }}>Confirm pharmacy</Button>
                  </div>
                )}
                <div className="timeline" style={{ marginTop: 12 }}>
                  {rf.timeline.map((t, i) => (
                    <div key={i} className="timeline-item">
                      <div className={`timeline-dot ${t.state}`}>
                        {t.state === 'done' && <Icon name="check" size={14} />}
                        {t.state === 'active' && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor' }}></span>}
                      </div>
                      <div className="timeline-content"><div className="timeline-title">{t.label}</div><div className="timeline-meta">{t.when}</div></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card-eyebrow" style={{ marginBottom: 10 }}>Your medications</div>
      <div className="stack" style={{ gap: 12 }}>
        {meds.map((m, i) => {
          const pending = refills.some(r => r.med === m.name && r.status !== 'Ready for pickup');
          return (
            <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary-light)', color: 'var(--primary-dark)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon name="pill" size={18} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{m.name} <span className="muted" style={{ fontWeight: 400 }}>{m.dose}</span></div>
                <div className="muted" style={{ fontSize: 12.5 }}>{m.freq}</div>
              </div>
              <Button variant={pending ? 'ghost' : 'secondary'} size="sm" disabled={pending} onClick={() => requestRefill(m)}>
                {pending ? 'Requested' : 'Request refill'}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export {
  VisitsScreen, VisitDetailScreen, TelemedCallScreen,
  SeeProviderScreen, ConfirmScreen, RefillsScreen,
};
