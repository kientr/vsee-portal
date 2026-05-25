// Messages + Forms + Documents + Records + Profile + Settings
import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './icons.jsx';
import { useRouter, useStore, useToast, Button, Badge, Card, Modal, Avatar, StatBlock } from './core.jsx';

// ----- MESSAGES -----
export const MessagesScreen = ({ activeId }) => {
  const { nav } = useRouter();
  const { store, setStore } = useStore();
  const toast = useToast();
  const [reply, setReply] = useState('');
  const [composeOpen, setComposeOpen] = useState(false);
  const [typing, setTyping] = useState(false);
  const threadRef = useRef(null);
  const active = activeId ? store.messages.find(m => m.id === activeId) : store.messages[0];

  useEffect(() => {
    if (active?.unread) {
      setStore(s => ({ ...s, messages: s.messages.map(m => m.id === active.id ? { ...m, unread: false } : m) }));
    }
  }, [activeId]);

  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [active?.thread?.length, typing]);

  const send = () => {
    if (!reply.trim()) return;
    const body = reply;
    setStore(s => ({
      ...s,
      messages: s.messages.map(m => m.id === active.id ? {
        ...m, thread: [...m.thread, { from: 'me', name: s.user.name, date: 'Just now', body }],
      } : m),
    }));
    setReply('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setStore(s => ({
        ...s,
        messages: s.messages.map(m => m.id === active.id ? {
          ...m, thread: [...m.thread, { from: 'them', name: active.from, date: 'Just now', body: "Thanks for the message. I'll review this and get back to you shortly." }],
        } : m),
      }));
    }, 2200);
  };

  return (
    <div className="content-narrow" style={{ maxWidth: 1200 }}>
      <div className="page-header">
        <div>
          <div className="page-title">Messages</div>
          <div className="page-subtitle">Secure conversations with your care team.</div>
        </div>
        <Button icon="plus" onClick={() => setComposeOpen(true)}>New message</Button>
      </div>

      <div className="msg-shell">
        <div className="msg-list">
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontWeight: 700, fontSize: 13.5 }}>
              Inbox
              {store.messages.filter(m => m.unread).length > 0 && (
                <span style={{ marginLeft: 8, background: 'var(--primary)', color: 'white', fontSize: 10.5, fontWeight: 700, padding: '1px 7px', borderRadius: 999 }}>
                  {store.messages.filter(m => m.unread).length} new
                </span>
              )}
            </div>
            <button className="icon-btn" style={{ width: 28, height: 28, border: 'none' }} onClick={() => setComposeOpen(true)} title="New message">
              <Icon name="edit" size={14} />
            </button>
          </div>
          {store.messages.map(m => (
            <div key={m.id} className={`msg-list-item ${active?.id === m.id ? 'active' : ''}`} onClick={() => nav(`/messages/${m.id}`)}>
              <div className="msg-list-from">
                <span className={m.unread ? 'msg-unread' : ''}>{m.from}</span>
                <span className="msg-list-date">{m.date}</span>
              </div>
              <div className="msg-list-subject">{m.subject}</div>
              <div className="msg-list-preview">{m.preview}</div>
            </div>
          ))}
        </div>

        {active && (
          <div className="msg-thread">
            <div className="msg-thread-header">
              <div className="row" style={{ marginBottom: 6 }}>
                <Avatar initials={active.initials} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{active.from}</div>
                  <div className="muted" style={{ fontSize: 12 }}>Primary Care Team</div>
                </div>
                <button className="icon-btn" style={{ width: 34, height: 34 }}><Icon name="more" size={15} /></button>
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, marginTop: 6 }}>{active.subject}</div>
            </div>
            <div className="msg-thread-body" ref={threadRef}>
              {active.thread.map((t, i) => (
                <div key={i} className={`msg-bubble ${t.from === 'me' ? 'me' : ''}`}>
                  <Avatar size="sm" initials={t.from === 'me' ? 'SJ' : active.initials}
                    color={t.from === 'me' ? null : 'linear-gradient(135deg, #0D875C, #0A6B49)'} />
                  <div>
                    <div className="msg-bubble-body">{t.body}</div>
                    <div className="msg-bubble-meta">{t.name} · {t.date}</div>
                  </div>
                </div>
              ))}
              {typing && (
                <div className="msg-bubble">
                  <Avatar size="sm" initials={active.initials} color="linear-gradient(135deg, #0D875C, #0A6B49)" />
                  <div>
                    <div className="msg-bubble-body" style={{ padding: '12px 16px' }}>
                      <span className="typing-dots"><span></span><span></span><span></span></span>
                    </div>
                    <div className="msg-bubble-meta">{active.from} is typing…</div>
                  </div>
                </div>
              )}
            </div>
            <div className="msg-compose">
              <textarea placeholder="Write a reply…" value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send(); }} />
              <button className="icon-btn"><Icon name="paperclip" size={16} /></button>
              <Button icon="send" onClick={send} disabled={!reply.trim()}>Send</Button>
            </div>
          </div>
        )}
      </div>

      <Modal open={composeOpen} onClose={() => setComposeOpen(false)} title="New message"
        footer={
          <>
            <Button variant="ghost" onClick={() => setComposeOpen(false)}>Cancel</Button>
            <Button icon="send" onClick={() => { setComposeOpen(false); toast('Message sent'); }}>Send</Button>
          </>
        }
      >
        <div className="form-row">
          <label>To</label>
          <select className="select">
            <option>Dr. Emily Carter — Primary Care</option>
            <option>Lisa Ng, NP — Care Team</option>
            <option>Patient Services</option>
          </select>
        </div>
        <div className="form-row">
          <label>Subject</label>
          <input className="input" placeholder="What is this about?" />
        </div>
        <div className="form-row">
          <label>Message</label>
          <textarea className="textarea" placeholder="Write your message…" />
        </div>
      </Modal>
    </div>
  );
};

// ----- FORMS & DOCUMENTS -----
export const FormsScreen = () => {
  const { nav } = useRouter();
  const { store, setStore } = useStore();
  const toast = useToast();
  const [tab, setTab] = useState('assigned');
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <div className="content-narrow">
      <div className="page-header">
        <div>
          <div className="page-title">Forms &amp; Documents</div>
          <div className="page-subtitle">Complete assigned forms and manage your uploaded documents.</div>
        </div>
        <Button icon="upload" onClick={() => setUploadOpen(true)}>Upload document</Button>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'assigned' ? 'active' : ''}`} onClick={() => setTab('assigned')}>
          Assigned forms ({store.forms.filter(f => f.status !== 'Completed').length})
        </button>
        <button className={`tab ${tab === 'submitted' ? 'active' : ''}`} onClick={() => setTab('submitted')}>
          Submitted forms ({store.submittedForms.length})
        </button>
        <button className={`tab ${tab === 'docs' ? 'active' : ''}`} onClick={() => setTab('docs')}>
          Documents ({store.documents.length})
        </button>
      </div>

      {tab === 'assigned' && (
        <div className="stack" style={{ gap: 14 }}>
          {store.forms.map(f => (
            <div key={f.id} className="card">
              <div className="row" style={{ alignItems: 'flex-start' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: f.status === 'Draft saved' ? 'var(--amber-light)' : 'var(--primary-light)', color: f.status === 'Draft saved' ? '#92400E' : 'var(--primary-dark)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Icon name="fileText" size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="row-between" style={{ marginBottom: 4 }}>
                    <h3 className="card-title">{f.name}</h3>
                    <Badge>{f.status}</Badge>
                  </div>
                  <p className="muted" style={{ fontSize: 13.5, marginBottom: 10 }}>{f.desc}</p>
                  {f.progress > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${f.progress}%`, height: '100%', background: 'var(--primary)', transition: 'width .4s ease' }}></div>
                      </div>
                      <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>{f.progress}% complete · {f.due}</div>
                    </div>
                  )}
                  {f.progress === 0 && (
                    <div className="muted" style={{ fontSize: 12.5 }}>
                      <Icon name="clock" size={12} style={{ verticalAlign: '-2px', marginRight: 4 }} />
                      {f.due}
                    </div>
                  )}
                </div>
                <Button onClick={() => f.id === 'f1' || f.id === 'f3' ? nav('/forms/intake') : toast('Opened form')}>
                  {f.progress > 0 ? 'Continue' : 'Start'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'submitted' && (
        <div className="stack" style={{ gap: 10 }}>
          {store.submittedForms.map(f => (
            <div key={f.id} className="card row">
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--green-light)', color: '#166534', display: 'grid', placeItems: 'center' }}>
                <Icon name="check" size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{f.name}</div>
                <div className="muted" style={{ fontSize: 12.5 }}>Submitted {f.submitted}</div>
              </div>
              <Button variant="secondary" size="sm" icon="download">PDF</Button>
              <Button variant="ghost" size="sm">View</Button>
            </div>
          ))}
        </div>
      )}

      {tab === 'docs' && (
        <div className="grid grid-2">
          {store.documents.map(d => (
            <div key={d.id} className="doc-tile">
              <div className={`doc-icon ${d.kind === 'Insurance' ? 'teal' : d.kind === 'ID Card' ? 'amber' : d.kind === 'Lab Result' ? 'green' : ''}`}>
                <Icon name={d.type === 'image' ? 'fileImage' : 'filePdf'} size={20} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
                <div className="muted" style={{ fontSize: 12 }}>{d.kind} · {d.date}</div>
                <div style={{ marginTop: 6 }}><Badge>{d.status}</Badge></div>
              </div>
              <div className="stack" style={{ gap: 4 }}>
                <button className="icon-btn" style={{ width: 32, height: 32 }}><Icon name="eye" size={15} /></button>
                <button className="icon-btn" style={{ width: 32, height: 32 }}><Icon name="download" size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload a document"
        footer={
          <>
            <Button variant="ghost" onClick={() => setUploadOpen(false)}>Cancel</Button>
            <Button icon="upload" onClick={() => {
              const newDoc = { id: 'd' + Math.random().toString(36).slice(2, 5), name: 'New Document.pdf', type: 'pdf', kind: 'Medical Record', date: 'Just now', status: 'Uploaded' };
              setStore(s => ({ ...s, documents: [newDoc, ...s.documents] }));
              setUploadOpen(false);
              setTab('docs');
              toast('Document uploaded successfully.');
            }}>Upload</Button>
          </>
        }
      >
        <div className="form-row">
          <label>Document type</label>
          <select className="select">
            <option>ID Card</option><option>Insurance Card</option><option>Medical Record</option><option>Lab Result</option><option>Referral</option><option>Other</option>
          </select>
        </div>
        <div className="form-row">
          <label>File</label>
          <div className="upload-zone">
            <Icon name="upload" />
            <div style={{ fontWeight: 600, color: 'var(--text)' }}>Click or drag files here</div>
            <div style={{ fontSize: 12 }}>PDF, JPG, PNG, HEIC up to 25 MB</div>
          </div>
        </div>
        <div className="form-row">
          <label>Note (optional)</label>
          <input className="input" placeholder="Add a note for your care team" />
        </div>
      </Modal>
    </div>
  );
};

// ----- INTAKE FORM (multi-step) -----
const STEPS = [
  'Personal', 'Contact', 'Reason', 'Medical history',
  'Medications', 'Allergies', 'Symptoms', 'Files', 'Consent',
];

export const IntakeFormScreen = () => {
  const { nav } = useRouter();
  const toast = useToast();
  const { store, setStore } = useStore();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [data, setData] = useState({
    firstName: 'Sarah', lastName: 'Johnson', dob: '1988-01-12', gender: 'Female',
    phone: '(555) 123-4567', email: 'sarah.johnson@email.com', address: '128 Magnolia Ave, Apt 4B', cityStateZip: 'Austin, TX 78701',
    reason: 'Diabetes follow-up — review A1C and Metformin response',
    conditions: { diabetes: true, hypertension: true, asthma: false, heartDisease: false, depression: false, anxiety: false },
    surgeries: 'Appendectomy (2008)',
    family: 'Mother: Type 2 Diabetes. Father: Hypertension.',
    meds: 'Metformin 500mg twice daily\nLisinopril 10mg once daily\nCetirizine 10mg as needed',
    allergies: 'Penicillin (rash, moderate)\nPeanuts (throat swelling, severe)',
    symptoms: 'Mild morning nausea after Metformin. Otherwise feeling well.',
    severity: 3,
    consent1: false, consent2: false,
  });

  const update = (k, v) => setData(d => ({ ...d, [k]: v }));

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else {
      setStore(s => ({
        ...s,
        forms: s.forms.map(f => f.id === 'f1' ? { ...f, status: 'Completed', progress: 100 } : f),
        submittedForms: [{ id: 'fs-new', name: 'Pre-Visit Intake Form', submitted: 'Just now' }, ...s.submittedForms],
      }));
      setSubmitted(true);
      setTimeout(() => { nav('/forms'); }, 3000);
    }
  };

  const save = () => {
    setStore(s => ({
      ...s,
      forms: s.forms.map(f => f.id === 'f1' ? { ...f, status: 'Draft saved', progress: Math.round((step / (STEPS.length - 1)) * 100) } : f),
    }));
    toast('Your form has been saved as draft.');
  };

  if (submitted) return (
    <div className="content-narrow" style={{ maxWidth: 520, paddingTop: 80 }}>
      <div className="card" style={{ textAlign: 'center', padding: '48px 40px' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--success-light)', color: 'var(--success)', display: 'grid', placeItems: 'center', margin: '0 auto 20px', animation: 'modal-in .3s ease-out' }}>
          <Icon name="checkCircle" size={36} />
        </div>
        <h2 style={{ fontSize: 24, marginBottom: 10 }}>Form submitted!</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6 }}>
          Your Pre-Visit Intake Form has been sent to Dr. Emily Carter's team. You'll be redirected to forms in a moment.
        </p>
        <div style={{ marginTop: 24 }}>
          <Badge>Pre-Visit Intake Form</Badge>
          <span style={{ marginLeft: 8, color: 'var(--text-muted)', fontSize: 13 }}>Submitted just now</span>
        </div>
        <Button variant="secondary" onClick={() => nav('/forms')} style={{ marginTop: 24 }}>Back to forms</Button>
      </div>
    </div>
  );

  return (
    <div className="content-narrow" style={{ maxWidth: 820 }}>
      <button className="btn btn-ghost" onClick={() => nav('/forms')} style={{ marginBottom: 10, padding: '4px 8px' }}>
        <Icon name="arrowLeft" size={14} /> Back to forms
      </button>
      <div className="page-header" style={{ marginBottom: 18 }}>
        <div>
          <div className="page-title">Pre-Visit Intake Form</div>
          <div className="page-subtitle">For your visit with Dr. Emily Carter on May 28, 2026</div>
        </div>
      </div>

      <div style={{ marginBottom: 28 }}>
        <div className="steps">
          {STEPS.map((label, i) => (
            <React.Fragment key={label}>
              <div className={`step ${i === step ? 'active' : i < step ? 'done' : ''}`} style={{ flexDirection: 'column', gap: 6, alignItems: 'center', minWidth: 0 }}>
                <div className="step-num">{i < step ? <Icon name="check" size={14} /> : i + 1}</div>
                <span style={{ fontSize: 10.5, fontWeight: i === step ? 700 : 500, color: i === step ? 'var(--primary)' : i < step ? 'var(--text-secondary)' : 'var(--text-muted)', whiteSpace: 'nowrap', display: 'block' }}>{label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`step-line ${i < step ? 'done' : ''}`} style={{ marginTop: '-14px' }}></div>}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 className="card-title" style={{ marginBottom: 18 }}>{step + 1}. {STEPS[step]}</h3>

        {step === 0 && (
          <div>
            <div className="input-row">
              <div className="form-row"><label>First name</label><input className="input" value={data.firstName} onChange={(e) => update('firstName', e.target.value)} /></div>
              <div className="form-row"><label>Last name</label><input className="input" value={data.lastName} onChange={(e) => update('lastName', e.target.value)} /></div>
            </div>
            <div className="input-row">
              <div className="form-row"><label>Date of birth</label><input className="input" type="date" value={data.dob} onChange={(e) => update('dob', e.target.value)} /></div>
              <div className="form-row">
                <label>Gender</label>
                <select className="select" value={data.gender} onChange={(e) => update('gender', e.target.value)}>
                  <option>Female</option><option>Male</option><option>Non-binary</option><option>Prefer not to say</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <div className="input-row">
              <div className="form-row"><label>Phone</label><input className="input" value={data.phone} onChange={(e) => update('phone', e.target.value)} /></div>
              <div className="form-row"><label>Email</label><input className="input" value={data.email} onChange={(e) => update('email', e.target.value)} /></div>
            </div>
            <div className="form-row"><label>Address</label><input className="input" value={data.address} onChange={(e) => update('address', e.target.value)} /></div>
            <div className="form-row"><label>City, State, ZIP</label><input className="input" value={data.cityStateZip} onChange={(e) => update('cityStateZip', e.target.value)} /></div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="form-row">
              <label>Reason for this visit</label>
              <textarea className="textarea" value={data.reason} onChange={(e) => update('reason', e.target.value)} />
              <div className="field-help">Briefly describe what you'd like to discuss.</div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="form-row">
              <label>Do you have any of these conditions? (Check all that apply)</label>
              <div className="grid grid-2" style={{ gap: 4, marginTop: 6 }}>
                {Object.entries({ diabetes: 'Diabetes', hypertension: 'High blood pressure', asthma: 'Asthma', heartDisease: 'Heart disease', depression: 'Depression', anxiety: 'Anxiety' }).map(([k, label]) => (
                  <label key={k} className="checkbox-row" style={{ cursor: 'pointer' }}>
                    <input type="checkbox" checked={data.conditions[k]} onChange={(e) => update('conditions', { ...data.conditions, [k]: e.target.checked })} />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="form-row">
              <label>Past surgeries</label>
              <textarea className="textarea" rows={2} value={data.surgeries} onChange={(e) => update('surgeries', e.target.value)} />
            </div>
            <div className="form-row">
              <label>Family history</label>
              <textarea className="textarea" rows={2} value={data.family} onChange={(e) => update('family', e.target.value)} />
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <div className="form-row">
              <label>Current medications</label>
              <textarea className="textarea" rows={6} value={data.meds} onChange={(e) => update('meds', e.target.value)} />
              <div className="field-help">Include over-the-counter and supplements. One per line.</div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <div className="form-row">
              <label>Known allergies</label>
              <textarea className="textarea" rows={5} value={data.allergies} onChange={(e) => update('allergies', e.target.value)} />
              <div className="field-help">List each allergy with reaction and severity.</div>
            </div>
          </div>
        )}

        {step === 6 && (
          <div>
            <div className="form-row">
              <label>Describe your symptoms</label>
              <textarea className="textarea" rows={4} value={data.symptoms} onChange={(e) => update('symptoms', e.target.value)} />
            </div>
            <div className="form-row">
              <label>How severe? <span className="muted" style={{ fontWeight: 400 }}>({data.severity}/10)</span></label>
              <input type="range" min="1" max="10" value={data.severity} onChange={(e) => update('severity', e.target.value)} style={{ width: '100%' }} />
              <div className="row-between" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                <span>Mild</span><span>Severe</span>
              </div>
            </div>
          </div>
        )}

        {step === 7 && (
          <div>
            <div className="form-row">
              <label>Upload any relevant files (optional)</label>
              <div className="upload-zone">
                <Icon name="upload" />
                <div style={{ fontWeight: 600, color: 'var(--text)' }}>Click or drag files here</div>
                <div style={{ fontSize: 12 }}>Recent labs, outside notes, or imaging</div>
              </div>
            </div>
          </div>
        )}

        {step === 8 && (
          <div>
            <div className="card" style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: 14, marginBottom: 14, fontSize: 13.5, color: 'var(--text-secondary)' }}>
              I understand that the information I provide will become part of my medical record and will be used by my care team to provide treatment. I confirm the information above is accurate to the best of my knowledge.
            </div>
            <label className="checkbox-row">
              <input type="checkbox" checked={data.consent1} onChange={(e) => update('consent1', e.target.checked)} />
              <span>I confirm the information I've provided is accurate.</span>
            </label>
            <label className="checkbox-row">
              <input type="checkbox" checked={data.consent2} onChange={(e) => update('consent2', e.target.checked)} />
              <span>I consent to share this information with my care team.</span>
            </label>
          </div>
        )}

        <hr className="divider" />
        <div className="row-between">
          <Button variant="ghost" onClick={() => step > 0 && setStep(step - 1)} disabled={step === 0} icon="arrowLeft">Back</Button>
          <div className="row gap-sm">
            <Button variant="secondary" onClick={save}>Save draft</Button>
            <Button onClick={next} iconRight={step === STEPS.length - 1 ? null : 'arrowRight'} disabled={step === STEPS.length - 1 && (!data.consent1 || !data.consent2)}>
              {step === STEPS.length - 1 ? 'Submit form' : 'Continue'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ----- MEDICAL RECORDS -----
const RECORD_SECTIONS = [
  { id: 'overview', label: 'Health overview', icon: 'activity' },
  { id: 'encounters', label: 'Encounter history', icon: 'calendar' },
  { id: 'meds', label: 'Medications', icon: 'pill' },
  { id: 'allergies', label: 'Allergies', icon: 'alert' },
  { id: 'problems', label: 'Problems', icon: 'records' },
  { id: 'vitals', label: 'Vitals', icon: 'heart' },
  { id: 'immun', label: 'Immunizations', icon: 'syringe' },
  { id: 'labs', label: 'Lab results', icon: 'droplet' },
  { id: 'docs', label: 'Documents', icon: 'fileText' },
];

export const MedicalRecordsScreen = () => {
  const { nav } = useRouter();
  const { store } = useStore();
  const [section, setSection] = useState('overview');
  const m = store.medical;

  const sectionCounts = {
    encounters: store.visits.filter(v => v.tense === 'past').length,
    meds: m.meds.length,
    allergies: m.allergies.length,
    problems: m.problems.length,
    immun: m.immunizations.length,
    labs: m.labs?.length,
    docs: store.documents.length,
  };

  return (
    <div className="content-narrow">
      <div className="page-header">
        <div>
          <div className="page-title">Medical Records</div>
          <div className="page-subtitle">A patient-friendly view of your health information.</div>
        </div>
        <Button variant="secondary" icon="download">Download summary</Button>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '220px 1fr', gap: 22 }}>
        <div className="card" style={{ padding: 12, alignSelf: 'flex-start', position: 'sticky', top: 0 }}>
          <div className="records-nav">
            {RECORD_SECTIONS.map(s => (
              <button key={s.id} className={`records-nav-item ${section === s.id ? 'active' : ''}`} onClick={() => setSection(s.id)}>
                <span className="row gap-sm"><Icon name={s.icon} size={15} /> {s.label}</span>
                {sectionCounts[s.id] && (
                  <span style={{ fontSize: 11, fontWeight: 600, color: section === s.id ? 'var(--primary)' : 'var(--text-muted)', background: section === s.id ? 'rgba(13,135,92,0.12)' : 'var(--grey-300)', padding: '1px 7px', borderRadius: 999 }}>
                    {sectionCounts[s.id]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="stack" style={{ gap: 20 }}>
          {section === 'overview' && (
            <>
              <div className="grid grid-4">
                <StatBlock label="Active problems" value={m.problems.length} icon="records" color="#0D875C" />
                <StatBlock label="Medications" value={m.meds.length} icon="pill" color="#196CD2" />
                <StatBlock label="Allergies" value={m.allergies.length} icon="alert" color="#DC2626" />
                <StatBlock label="Last visit" value="Apr 18" sub="Dr. Carter · Virtual" icon="calendar" color="#0A6B49" />
              </div>

              <Card title="Active problems" action={<Button variant="ghost" size="sm" onClick={() => setSection('problems')}>View all <Icon name="chevronRight" size={14} /></Button>}>
                <div className="stack">
                  {m.problems.map((p, i) => (
                    <div key={i} className="row" style={{ padding: '10px 0', borderBottom: i < m.problems.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary-light)', color: 'var(--primary-dark)', display: 'grid', placeItems: 'center' }}>
                        <Icon name="records" size={16} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                        <div className="muted" style={{ fontSize: 12.5 }}>Since {p.since} · {p.provider}</div>
                      </div>
                      <Badge>{p.status}</Badge>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="grid grid-2">
                <Card title="Recent labs" action={<Button variant="ghost" size="sm" onClick={() => setSection('labs')}>View all <Icon name="chevronRight" size={14} /></Button>}>
                  <div className="stack">
                    {m.labs.slice(0, 4).map((lab, i) => (
                      <div key={lab.id} className="row" style={{ padding: '8px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 13.5 }}>{lab.name}</div>
                          <div className="muted" style={{ fontSize: 12 }}>{lab.ref}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: lab.flag === 'Normal' ? 'var(--text)' : lab.flag === 'High' ? '#DC2626' : '#D97706' }}>{lab.value}</div>
                          <Badge>{lab.flag}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
                <Card title="Latest vitals" action={<span className="muted" style={{ fontSize: 12 }}>Apr 18, 2026</span>}>
                  <div className="grid grid-2" style={{ gap: 14 }}>
                    {[
                      { label: 'Blood pressure', value: m.vitals.bp },
                      { label: 'Heart rate', value: m.vitals.hr },
                      { label: 'Temperature', value: m.vitals.temp },
                      { label: 'Weight', value: m.vitals.weight },
                      { label: 'SpO₂', value: m.vitals.spo2 },
                      { label: 'BMI', value: m.vitals.bmi },
                    ].map((v, i) => (
                      <div key={i}>
                        <div className="muted" style={{ fontSize: 11.5, fontWeight: 500 }}>{v.label}</div>
                        <div style={{ fontSize: 18, fontWeight: 700, marginTop: 1 }}>{v.value}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </>
          )}

          {section === 'problems' && (
            <Card title="Active problems & diagnoses">
              <div className="stack">
                {m.problems.map((p, i) => (
                  <div key={i} className="row" style={{ padding: '14px 0', borderBottom: i < m.problems.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary-light)', color: 'var(--primary-dark)', display: 'grid', placeItems: 'center' }}>
                      <Icon name="records" size={18} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div className="muted" style={{ fontSize: 12.5 }}>Diagnosed {p.since} by {p.provider}</div>
                    </div>
                    <Badge>{p.status}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {section === 'meds' && (
            <Card title="Medications">
              <div className="stack">
                {m.meds.map((p, i) => (
                  <div key={i} className="row" style={{ padding: '14px 0', borderBottom: i < m.meds.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--teal-light)', color: 'var(--teal)', display: 'grid', placeItems: 'center' }}>
                      <Icon name="pill" size={18} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{p.name} <span className="muted" style={{ fontWeight: 400 }}>{p.dose}</span></div>
                      <div className="muted" style={{ fontSize: 12.5 }}>{p.freq} · Started {p.since}</div>
                    </div>
                    <div className="row gap-sm">
                      <Badge>{p.status}</Badge>
                      <Button variant="secondary" size="sm" onClick={() => nav('/requests/new')}>Request refill</Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {section === 'allergies' && (
            <Card title="Allergies">
              <div className="stack">
                {m.allergies.map((a, i) => (
                  <div key={i} className="row" style={{ padding: '14px 0', borderBottom: i < m.allergies.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--red-light)', color: '#991B1B', display: 'grid', placeItems: 'center' }}>
                      <Icon name="alert" size={18} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{a.name}</div>
                      <div className="muted" style={{ fontSize: 12.5 }}>Reaction: {a.reaction} · Updated {a.updated}</div>
                    </div>
                    <Badge>{a.severity}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {section === 'vitals' && (
            <Card title="Vital signs" action={<span className="muted" style={{ fontSize: 12 }}>Last recorded {m.vitals.recorded}</span>}>
              <div className="grid grid-3" style={{ gap: 16 }}>
                {[
                  { label: 'Blood pressure', value: m.vitals.bp, range: 'Normal range', icon: 'heart', color: '#0D875C' },
                  { label: 'Heart rate', value: m.vitals.hr, range: 'Normal range', icon: 'activity', color: '#0D875C' },
                  { label: 'Temperature', value: m.vitals.temp, range: 'Normal range', icon: 'thermometer', color: '#0D875C' },
                  { label: 'Weight', value: m.vitals.weight, range: m.vitals.bmi + ' BMI', icon: 'scale', color: '#196CD2' },
                  { label: 'Oxygen saturation', value: m.vitals.spo2, range: 'Normal range', icon: 'droplet', color: '#0D875C' },
                  { label: 'Height', value: m.vitals.height, range: '', icon: 'user', color: '#6B7280' },
                ].map((v, i) => (
                  <div key={i} className="card" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                    <div className="row" style={{ marginBottom: 8 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${v.color}1A`, color: v.color, display: 'grid', placeItems: 'center' }}>
                        <Icon name={v.icon} size={16} />
                      </div>
                      <div className="muted" style={{ fontSize: 12, fontWeight: 600 }}>{v.label}</div>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 700 }}>{v.value}</div>
                    {v.range && <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{v.range}</div>}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {section === 'immun' && (
            <Card title="Immunizations">
              <div className="stack">
                {m.immunizations.map((v, i) => (
                  <div key={i} className="row" style={{ padding: '14px 0', borderBottom: i < m.immunizations.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--green-light)', color: '#166534', display: 'grid', placeItems: 'center' }}>
                      <Icon name="syringe" size={18} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{v.name}</div>
                      <div className="muted" style={{ fontSize: 12.5 }}>Administered {v.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {section === 'encounters' && (
            <Card title="Encounter history">
              <div className="stack">
                {store.visits.filter(v => v.tense === 'past').map((v, i, arr) => (
                  <div key={v.id} className="row" style={{ padding: '14px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary-light)', color: 'var(--primary-dark)', display: 'grid', placeItems: 'center' }}>
                      <Icon name={v.mode === 'Virtual' ? 'video' : 'building'} size={18} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{v.kind} · {v.provider}</div>
                      <div className="muted" style={{ fontSize: 12.5 }}>{v.when} · {v.specialty} · {v.reason}</div>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => nav(`/visits/${v.id}`)}>View summary</Button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {section === 'labs' && (
            <>
              <div className="card" style={{ background: 'var(--primary-light)', border: '1px solid var(--primary-200)', padding: '12px 18px' }}>
                <div className="row" style={{ gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary)', color: 'white', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <Icon name="checkCircle" size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Latest results from May 20, 2026</div>
                    <div className="muted" style={{ fontSize: 12.5 }}>Ordered by Dr. Emily Carter · Your A1C improved to 6.4% from 7.1%</div>
                  </div>
                  <Badge>New</Badge>
                </div>
              </div>
              <Card title="Lab panel — May 20, 2026" action={<span className="muted" style={{ fontSize: 12 }}>Ordered by Dr. Emily Carter</span>}>
                <div className="stack">
                  {m.labs.map((lab, i) => {
                    const flagColor = lab.flag === 'Normal' ? 'var(--primary)' : lab.flag === 'High' ? '#DC2626' : '#D97706';
                    const trendIcon = lab.trend === 'improving' ? '↓' : lab.trend === 'stable' ? '→' : '↑';
                    const trendColor = lab.trend === 'improving' ? '#0D875C' : lab.trend === 'stable' ? '#6B7280' : '#DC2626';
                    return (
                      <div key={lab.id} style={{ padding: '14px 0', borderBottom: i < m.labs.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        <div className="row-between" style={{ marginBottom: 8 }}>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{lab.name}</div>
                          <div className="row gap-sm">
                            {lab.prev && (
                              <span style={{ fontSize: 12, color: trendColor, fontWeight: 600, background: `${trendColor}15`, padding: '2px 8px', borderRadius: 4 }}>
                                {trendIcon} {lab.trend}
                              </span>
                            )}
                            <Badge>{lab.flag}</Badge>
                          </div>
                        </div>
                        <div className="row" style={{ gap: 16, alignItems: 'baseline' }}>
                          <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: lab.flag === 'Normal' ? 'var(--text)' : flagColor }}>{lab.value}</span>
                          <span className="muted" style={{ fontSize: 12.5 }}>Ref: {lab.ref}</span>
                          {lab.prev && <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 'auto' }}>Prev: <strong>{lab.prev}</strong></span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </>
          )}

          {section === 'docs' && (
            <Card title="Documents in your record">
              <div className="grid grid-2">
                {store.documents.map(d => (
                  <div key={d.id} className="doc-tile" style={{ border: '1px solid var(--border)' }}>
                    <div className={`doc-icon ${d.kind === 'Insurance' ? 'teal' : d.kind === 'ID Card' ? 'amber' : d.kind === 'Lab Result' ? 'green' : ''}`}>
                      <Icon name={d.type === 'image' ? 'fileImage' : 'filePdf'} size={20} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{d.name}</div>
                      <div className="muted" style={{ fontSize: 12 }}>{d.kind} · {d.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

// ----- PROFILE -----
const FieldRow = ({ label, value, editing, last }) => (
  <div style={{ padding: '12px 0', borderBottom: last ? 'none' : '1px solid var(--border)' }}>
    <div className="card-eyebrow" style={{ marginBottom: editing ? 4 : 2 }}>{label}</div>
    <div style={{ fontSize: 14 }}>{value}</div>
  </div>
);

const Switch = ({ checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    style={{
      width: 44, height: 26, borderRadius: 999,
      background: checked ? 'var(--primary)' : 'var(--border)',
      border: 'none', position: 'relative', cursor: 'pointer',
      transition: 'background .15s',
    }}
  >
    <span style={{
      position: 'absolute', top: 3, left: checked ? 21 : 3,
      width: 20, height: 20, borderRadius: '50%', background: 'white',
      transition: 'left .15s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    }}></span>
  </button>
);

export const ProfileScreen = () => {
  const { store, setStore } = useStore();
  const toast = useToast();
  const u = store.user;

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(u);

  const save = () => { setStore(s => ({ ...s, user: draft })); setEditing(false); toast('Profile updated'); };

  return (
    <div className="content-narrow" style={{ maxWidth: 980 }}>
      <div className="page-header">
        <div>
          <div className="page-title">Profile</div>
          <div className="page-subtitle">Your personal, contact, and care preferences.</div>
        </div>
        {!editing
          ? <Button icon="edit" onClick={() => { setDraft(u); setEditing(true); }}>Edit profile</Button>
          : <div className="row gap-sm"><Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button><Button icon="check" onClick={save}>Save changes</Button></div>
        }
      </div>

      <Card>
        <div className="row" style={{ gap: 18 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <Avatar initials={u.initials} size="xl" />
            {editing && (
              <button style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,0.45)', border: 'none', color: 'white', display: 'grid', placeItems: 'center', cursor: 'pointer' }}
                onClick={() => toast('Photo upload coming soon')}>
                <Icon name="cam" size={22} />
              </button>
            )}
          </div>
          <div>
            <h2 style={{ fontSize: 22, marginBottom: 4 }}>{u.name}</h2>
            <div className="muted">Patient ID: PT-002841 · {u.gender} · DOB {new Date(u.dob).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
            <div className="row gap-sm" style={{ marginTop: 10 }}>
              <Badge>Active patient</Badge>
              <Badge>BlueCross verified</Badge>
            </div>
          </div>
        </div>
      </Card>

      <div style={{ height: 20 }}></div>

      <div className="grid grid-2">
        <Card title="Personal information">
          <FieldRow label="Full name" value={u.name} editing={false} />
          <FieldRow label="Date of birth" value={new Date(u.dob).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} editing={false} />
          <FieldRow label="Gender" value={u.gender} editing={false} />
          <FieldRow label="Preferred language" value={u.language} editing={false} last />
        </Card>

        <Card title="Contact information">
          <FieldRow label="Email" value={editing ? <input className="input" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} /> : u.email} editing={editing} />
          <FieldRow label="Phone" value={editing ? <input className="input" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} /> : u.phone} editing={editing} />
          <FieldRow label="Address" value={editing ? <input className="input" value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} /> : u.address} editing={editing} />
          <FieldRow label="City, State, ZIP" value={editing ? <input className="input" value={draft.cityStateZip} onChange={(e) => setDraft({ ...draft, cityStateZip: e.target.value })} /> : u.cityStateZip} editing={editing} last />
        </Card>

        <Card title="Emergency contact">
          <FieldRow label="Name" value={editing ? <input className="input" value={draft.emergencyName} onChange={(e) => setDraft({ ...draft, emergencyName: e.target.value })} /> : u.emergencyName} editing={editing} />
          <FieldRow label="Relationship" value={editing ? <input className="input" value={draft.emergencyRelation} onChange={(e) => setDraft({ ...draft, emergencyRelation: e.target.value })} /> : u.emergencyRelation} editing={editing} />
          <FieldRow label="Phone" value={editing ? <input className="input" value={draft.emergencyPhone} onChange={(e) => setDraft({ ...draft, emergencyPhone: e.target.value })} /> : u.emergencyPhone} editing={editing} last />
        </Card>

        <Card title="Preferred pharmacy">
          <FieldRow label="Pharmacy" value={editing ? <input className="input" value={draft.pharmacy} onChange={(e) => setDraft({ ...draft, pharmacy: e.target.value })} /> : u.pharmacy} editing={editing} last />
          <div className="muted" style={{ fontSize: 12.5, marginTop: 8 }}>
            <Icon name="info" size={12} style={{ verticalAlign: '-2px', marginRight: 4 }} />
            Prescriptions from your care team will be sent here.
          </div>
        </Card>

        <Card title="Communication preferences" style={{ gridColumn: '1 / -1' }}>
          <div className="stack">
            {[
              { key: 'email', label: 'Email', desc: 'Visit reminders, summaries, and replies from your care team' },
              { key: 'sms', label: 'Text message (SMS)', desc: 'Appointment reminders and time-sensitive alerts' },
              { key: 'push', label: 'Push notifications', desc: 'Real-time updates in your mobile app' },
            ].map(opt => (
              <div key={opt.key} className="row-between" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{opt.label}</div>
                  <div className="muted" style={{ fontSize: 12.5 }}>{opt.desc}</div>
                </div>
                <Switch checked={u.communications[opt.key]} onChange={(v) => setStore(s => ({ ...s, user: { ...s.user, communications: { ...s.user.communications, [opt.key]: v } } }))} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ----- SETTINGS -----
const NOTIF_ITEMS = [
  { key: 'visits', label: 'Visit reminders', desc: 'Reminders 24 hours and 1 hour before your appointment', email: true, sms: true },
  { key: 'messages', label: 'New messages', desc: 'When your care team sends you a secure message', email: true, sms: true },
  { key: 'labs', label: 'Lab results', desc: 'When new lab or imaging results are ready', email: true, sms: false },
  { key: 'replies', label: 'Care team replies', desc: 'Replies to your requests and questions', email: true, sms: false },
  { key: 'forms', label: 'Form due reminders', desc: 'When a form needs to be completed before a visit', email: true, sms: true },
  { key: 'billing', label: 'Billing & insurance', desc: 'Payment confirmations and insurance updates', email: false, sms: false },
];

const NotificationsTab = () => {
  const [prefs, setPrefs] = useState(() =>
    Object.fromEntries(NOTIF_ITEMS.map(n => [n.key, { email: n.email, sms: n.sms }]))
  );
  const toggle = (key, channel) => setPrefs(p => ({ ...p, [key]: { ...p[key], [channel]: !p[key][channel] } }));

  return (
    <Card title="Notification preferences">
      <div className="muted" style={{ marginBottom: 18, fontSize: 13.5 }}>
        Choose how and when you want to hear from your care team.
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px', gap: 0 }}>
        <div></div>
        {['Email', 'SMS'].map(c => (
          <div key={c} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', paddingBottom: 10 }}>{c}</div>
        ))}
        {NOTIF_ITEMS.map((item, i) => (
          <React.Fragment key={item.key}>
            <div style={{ padding: '14px 0', borderTop: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{item.label}</div>
              <div className="muted" style={{ fontSize: 12.5 }}>{item.desc}</div>
            </div>
            {['email', 'sms'].map(ch => (
              <div key={ch} style={{ display: 'grid', placeItems: 'center', borderTop: '1px solid var(--border)' }}>
                <Switch checked={prefs[item.key][ch]} onChange={() => toggle(item.key, ch)} />
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </Card>
  );
};

export const SettingsScreen = () => {
  const toast = useToast();
  const [tab, setTab] = useState('account');
  return (
    <div className="content-narrow" style={{ maxWidth: 880 }}>
      <div className="page-header">
        <div>
          <div className="page-title">Settings</div>
          <div className="page-subtitle">Account, security, and privacy options.</div>
        </div>
      </div>
      <div className="tabs">
        {['account', 'password', 'notifications', 'privacy'].map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)} style={{ textTransform: 'capitalize' }}>
            {t === 'privacy' ? 'Privacy & consent' : t}
          </button>
        ))}
      </div>
      {tab === 'account' && (
        <Card title="Account">
          <FieldRow label="Email" value="sarah.johnson@email.com" editing={false} />
          <FieldRow label="Member since" value="January 2023" editing={false} />
          <FieldRow label="Two-factor authentication" value={<Badge>Enabled</Badge>} editing={false} last />
          <hr className="divider" />
          <Button variant="danger" icon="logout">Sign out of all devices</Button>
        </Card>
      )}
      {tab === 'password' && (
        <Card title="Password">
          <div className="form-row"><label>Current password</label><input className="input" type="password" defaultValue="••••••••" /></div>
          <div className="form-row"><label>New password</label><input className="input" type="password" /></div>
          <div className="form-row"><label>Confirm new password</label><input className="input" type="password" /></div>
          <Button onClick={() => toast('Password updated')}>Update password</Button>
        </Card>
      )}
      {tab === 'notifications' && (
        <NotificationsTab />
      )}
      {tab === 'privacy' && (
        <Card title="Privacy & consent">
          <FieldRow label="Telehealth consent" value={<><Badge>Signed</Badge> <span className="muted" style={{ marginLeft: 8 }}>Mar 03, 2026</span></>} editing={false} />
          <FieldRow label="HIPAA Notice of Privacy Practices" value={<><Badge>Acknowledged</Badge> <span className="muted" style={{ marginLeft: 8 }}>Jan 15, 2023</span></>} editing={false} />
          <FieldRow label="Share data with research partners" value={<Switch checked={false} onChange={() => toast('Preference saved')} />} editing={false} />
          <FieldRow label="Allow family member access" value={<Switch checked={false} onChange={() => toast('Preference saved')} />} editing={false} last />
          <hr className="divider" />
          <Button variant="secondary" icon="download">Download my data (PDF)</Button>
        </Card>
      )}
    </div>
  );
};
