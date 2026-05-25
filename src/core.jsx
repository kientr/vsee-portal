// Shared UI components, store/router, demo data
import React, { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from 'react';
import { Icon } from './icons.jsx';

// ----- Router (hash-based) -----
const RouterContext = createContext(null);
export const RouterProvider = ({ children }) => {
  const [path, setPath] = useState(() => window.location.hash.replace(/^#/, '') || '/login');
  useEffect(() => {
    const onHash = () => setPath(window.location.hash.replace(/^#/, '') || '/login');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const nav = useCallback((to) => { window.location.hash = to; }, []);
  return <RouterContext.Provider value={{ path, nav }}>{children}</RouterContext.Provider>;
};
export const useRouter = () => useContext(RouterContext);

// ----- Toasts -----
const ToastContext = createContext(null);
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message, kind = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, message, kind }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }, []);
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="toast-stack">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.kind === 'error' ? 'error' : ''}`}>
            <Icon name={t.kind === 'error' ? 'alert' : 'checkCircle'} size={18} />
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
export const useToast = () => useContext(ToastContext);

// ----- App state store -----
const StoreContext = createContext(null);
const initialStore = {
  user: {
    name: 'Sarah Johnson',
    initials: 'SJ',
    dob: '1988-01-12',
    gender: 'Female',
    email: 'sarah.johnson@email.com',
    phone: '(555) 123-4567',
    address: '128 Magnolia Ave, Apt 4B',
    cityStateZip: 'Austin, TX 78701',
    language: 'English',
    pharmacy: 'CVS Pharmacy — 901 Congress Ave',
    emergencyName: 'Michael Johnson',
    emergencyPhone: '(555) 987-6543',
    emergencyRelation: 'Spouse',
    communications: { email: true, sms: true, push: false },
  },
  forms: [
    { id: 'f1', name: 'Pre-Visit Intake Form', desc: 'Required for your upcoming visit with Dr. Carter', due: 'Due May 27, 2026', status: 'Not started', progress: 0 },
    { id: 'f2', name: 'PHQ-9 Mood Screening', desc: 'Annual mental health screening', due: 'Due Jun 5, 2026', status: 'Not started', progress: 0 },
    { id: 'f3', name: 'Medication Reconciliation', desc: 'Confirm your current medications', due: 'Due Jun 12, 2026', status: 'Draft saved', progress: 40 },
  ],
  submittedForms: [
    { id: 'fs1', name: 'Annual Health History', submitted: 'Apr 12, 2026' },
    { id: 'fs2', name: 'Telehealth Consent', submitted: 'Mar 03, 2026' },
  ],
  documents: [
    { id: 'd1', name: 'Driver License — Front.jpg', type: 'image', kind: 'ID Card', date: 'May 18, 2026', status: 'Verified' },
    { id: 'd2', name: 'Insurance Card.pdf', type: 'pdf', kind: 'Insurance', date: 'May 18, 2026', status: 'Verified' },
    { id: 'd3', name: 'Lab Results — Apr 2026.pdf', type: 'pdf', kind: 'Lab Result', date: 'Apr 22, 2026', status: 'Shared with care team' },
    { id: 'd4', name: 'Referral — Endocrinology.pdf', type: 'pdf', kind: 'Referral', date: 'Mar 15, 2026', status: 'Reviewed' },
  ],
  requests: [
    { id: 'r1', title: 'Question about Metformin side effects', type: 'Medical Question', status: 'Waiting for Patient', created: 'May 23, 2026', updated: '2 hours ago', assigned: 'Dr. Emily Carter',
      description: "I've been feeling nauseous in the mornings after taking Metformin. Is this normal during the first weeks? Should I take it with food?",
      messages: [
        { from: 'patient', name: 'Sarah Johnson', date: 'May 23, 10:14 AM', body: "I've been feeling nauseous in the mornings after taking Metformin. Is this normal during the first weeks? Should I take it with food?" },
        { from: 'team', name: 'Nurse Practitioner Lisa Ng', date: 'May 23, 1:32 PM', body: 'Mild nausea is common in the first 1–2 weeks. Please take Metformin with a full meal and a glass of water. Could you share when you started and how often it has happened?' },
      ],
      timeline: [
        { label: 'Submitted', date: 'May 23, 10:14 AM', state: 'done' },
        { label: 'In Review', date: 'May 23, 11:02 AM', state: 'done' },
        { label: 'Waiting for Patient', date: 'May 23, 1:32 PM', state: 'active' },
        { label: 'Resolved', date: '—', state: 'pending' },
      ],
    },
    { id: 'r2', title: 'Refill request — Lisinopril', type: 'Prescription Question', status: 'In Review', created: 'May 21, 2026', updated: 'Yesterday', assigned: 'Pharmacy Team',
      description: 'Running low on Lisinopril 10mg. Can I get a 90-day refill sent to my preferred pharmacy?',
      messages: [
        { from: 'patient', name: 'Sarah Johnson', date: 'May 21, 9:00 AM', body: 'Running low on Lisinopril 10mg. Can I get a 90-day refill sent to my preferred pharmacy?' },
      ],
      timeline: [
        { label: 'Submitted', date: 'May 21, 9:00 AM', state: 'done' },
        { label: 'In Review', date: 'May 22, 2:11 PM', state: 'active' },
        { label: 'Waiting for Patient', date: '—', state: 'pending' },
        { label: 'Resolved', date: '—', state: 'pending' },
      ],
    },
    { id: 'r3', title: 'Update insurance on file', type: 'Insurance Question', status: 'Resolved', created: 'May 10, 2026', updated: 'May 12, 2026', assigned: 'Patient Services',
      description: 'Switched insurance plans this month — uploaded the new card.',
      messages: [
        { from: 'patient', name: 'Sarah Johnson', date: 'May 10', body: 'Switched insurance plans — uploaded the new card.' },
        { from: 'team', name: 'Patient Services', date: 'May 12', body: 'Got it. Your new plan is on file and verified for your next visit.' },
      ],
      timeline: [
        { label: 'Submitted', date: 'May 10', state: 'done' },
        { label: 'In Review', date: 'May 11', state: 'done' },
        { label: 'Resolved', date: 'May 12', state: 'done' },
      ],
    },
  ],
  messages: [
    { id: 'm1', from: 'Dr. Emily Carter', initials: 'EC', subject: 'Your lab results are in',
      preview: "Hi Sarah — your A1C came back at 6.4%, which is a noticeable improvement from last quarter. Let's discuss next steps on our call Thursday.",
      date: 'May 24', unread: true,
      thread: [
        { from: 'them', name: 'Dr. Emily Carter', date: 'May 24, 4:18 PM', body: "Hi Sarah — your A1C came back at 6.4%, which is a noticeable improvement from last quarter (it was 7.1 in February). I'd like to keep you on the current Metformin dose for now and revisit at our follow-up." },
        { from: 'them', name: 'Dr. Emily Carter', date: 'May 24, 4:19 PM', body: "Your cholesterol panel was also within range. Full results are attached to your medical record. We'll discuss everything Thursday." },
      ],
    },
    { id: 'm2', from: 'Care Team', initials: 'CT', subject: 'Reminder: Pre-visit intake form',
      preview: "Just a friendly reminder to complete your pre-visit intake form before your appointment on May 28.",
      date: 'May 23', unread: true,
      thread: [
        { from: 'them', name: 'Care Team Bot', date: 'May 23, 9:00 AM', body: "Hi Sarah — just a friendly reminder to complete your pre-visit intake form before your appointment with Dr. Carter on May 28, 10:30 AM." },
      ],
    },
    { id: 'm3', from: 'Lisa Ng, NP', initials: 'LN', subject: 'Re: Metformin question',
      preview: "Thanks for the update. If symptoms continue past two weeks let's switch to extended-release.",
      date: 'May 22', unread: false,
      thread: [
        { from: 'me', name: 'Sarah Johnson', date: 'May 22, 8:14 AM', body: "Symptoms have been better since I started taking it with breakfast." },
        { from: 'them', name: 'Lisa Ng, NP', date: 'May 22, 10:02 AM', body: "Thanks for the update. If symptoms continue past two weeks let's switch to extended-release." },
      ],
    },
    { id: 'm4', from: 'Patient Services', initials: 'PS', subject: 'Insurance card on file updated',
      preview: 'Your new BlueCross plan is now on file. Member ID ending 8821.',
      date: 'May 12', unread: false,
      thread: [
        { from: 'them', name: 'Patient Services', date: 'May 12, 2:30 PM', body: 'Your new BlueCross plan is now on file. Member ID ending 8821. No action needed — see you at your next visit.' },
      ],
    },
  ],
  visits: [
    { id: 'v1', when: 'May 28, 2026', time: '10:30 AM', kind: 'Virtual Follow-up', provider: 'Dr. Emily Carter', specialty: 'Primary Care', mode: 'Virtual', status: 'Ready to join', tense: 'upcoming',
      reason: 'Diabetes follow-up — review labs and Metformin response',
      diagnosis: null, plan: null,
    },
    { id: 'v2', when: 'Jun 14, 2026', time: '2:15 PM', kind: 'Annual Physical', provider: 'Dr. Emily Carter', specialty: 'Primary Care', mode: 'In-Person', status: 'Scheduled', tense: 'upcoming',
      reason: 'Annual wellness exam', diagnosis: null, plan: null,
    },
    { id: 'v3', when: 'Apr 18, 2026', time: '11:00 AM', kind: 'Virtual Visit', provider: 'Dr. Emily Carter', specialty: 'Primary Care', mode: 'Virtual', status: 'Completed', tense: 'past',
      reason: 'Diabetes management & medication review',
      diagnosis: ['Type 2 Diabetes Mellitus — stable', 'Essential Hypertension — controlled'],
      plan: [
        'Continue Metformin 500mg twice daily — take with food to reduce nausea',
        'Continue Lisinopril 10mg once daily',
        'Repeat A1C and lipid panel in 3 months',
        'Begin 30 minutes of walking 4–5 days/week',
      ],
      followup: 'Telehealth follow-up scheduled for May 28, 2026',
      meds: [{ name: 'Metformin', dose: '500mg', freq: 'Twice daily' }, { name: 'Lisinopril', dose: '10mg', freq: 'Once daily' }],
      attachments: ['Visit Summary.pdf', 'After-Visit Instructions.pdf'],
    },
    { id: 'v4', when: 'Feb 02, 2026', time: '9:00 AM', kind: 'In-Person Visit', provider: 'Dr. Raj Patel', specialty: 'Endocrinology', mode: 'In-Person', status: 'Completed', tense: 'past',
      reason: 'Endocrinology consultation',
      diagnosis: ['Type 2 Diabetes Mellitus, newly diagnosed'],
      plan: ['Start Metformin 500mg twice daily', 'Lifestyle counseling — nutrition referral', 'Recheck A1C in 8 weeks'],
      meds: [{ name: 'Metformin', dose: '500mg', freq: 'Twice daily — new' }],
      attachments: ['Endocrinology Consult Note.pdf'],
    },
    { id: 'v5', when: 'Jan 15, 2026', time: '3:30 PM', kind: 'In-Person Visit', provider: 'Dr. Emily Carter', specialty: 'Primary Care', mode: 'In-Person', status: 'Cancelled', tense: 'cancelled',
      reason: 'Cancelled due to scheduling conflict', diagnosis: null, plan: null,
    },
  ],
  medical: {
    problems: [
      { name: 'Type 2 Diabetes Mellitus', status: 'Active', since: 'Feb 2026', provider: 'Dr. Raj Patel' },
      { name: 'Essential Hypertension', status: 'Active', since: 'Aug 2023', provider: 'Dr. Emily Carter' },
      { name: 'Seasonal Allergic Rhinitis', status: 'Active', since: 'Apr 2019', provider: 'Dr. Emily Carter' },
    ],
    meds: [
      { name: 'Metformin', dose: '500mg tablet', freq: 'Twice daily, with meals', since: 'Feb 2026', status: 'Active' },
      { name: 'Lisinopril', dose: '10mg tablet', freq: 'Once daily', since: 'Aug 2023', status: 'Active' },
      { name: 'Cetirizine', dose: '10mg tablet', freq: 'As needed for allergies', since: 'Apr 2019', status: 'Active' },
    ],
    allergies: [
      { name: 'Penicillin', reaction: 'Rash', severity: 'Moderate', updated: 'May 2024' },
      { name: 'Peanuts', reaction: 'Throat swelling', severity: 'Severe', updated: 'Feb 2022' },
    ],
    vitals: { bp: '124/78 mmHg', hr: '76 bpm', temp: '98.4°F', weight: '146 lb', spo2: '98%', height: '5\'6"', bmi: '23.6', recorded: 'Apr 18, 2026' },
    labs: [
      { id: 'l1', name: 'A1C (Glycated Hemoglobin)', value: '6.4%', ref: '< 5.7% normal', flag: 'High', trend: 'improving', date: 'May 20, 2026', orderedBy: 'Dr. Emily Carter', prev: '7.1% (Feb 2026)' },
      { id: 'l2', name: 'Fasting Glucose', value: '104 mg/dL', ref: '70–99 mg/dL', flag: 'Borderline', trend: 'improving', date: 'May 20, 2026', orderedBy: 'Dr. Emily Carter', prev: '122 mg/dL (Feb 2026)' },
      { id: 'l3', name: 'LDL Cholesterol', value: '102 mg/dL', ref: '< 100 mg/dL', flag: 'Borderline', trend: 'stable', date: 'May 20, 2026', orderedBy: 'Dr. Emily Carter', prev: '108 mg/dL (Feb 2026)' },
      { id: 'l4', name: 'HDL Cholesterol', value: '58 mg/dL', ref: '> 50 mg/dL', flag: 'Normal', trend: 'stable', date: 'May 20, 2026', orderedBy: 'Dr. Emily Carter', prev: '55 mg/dL (Feb 2026)' },
      { id: 'l5', name: 'Triglycerides', value: '128 mg/dL', ref: '< 150 mg/dL', flag: 'Normal', trend: 'stable', date: 'May 20, 2026', orderedBy: 'Dr. Emily Carter', prev: '134 mg/dL (Feb 2026)' },
      { id: 'l6', name: 'eGFR (Kidney function)', value: '84 mL/min', ref: '> 60 mL/min', flag: 'Normal', trend: 'stable', date: 'May 20, 2026', orderedBy: 'Dr. Emily Carter', prev: '86 mL/min (Feb 2026)' },
      { id: 'l7', name: 'Creatinine', value: '0.82 mg/dL', ref: '0.5–1.1 mg/dL', flag: 'Normal', trend: 'stable', date: 'May 20, 2026', orderedBy: 'Dr. Emily Carter', prev: null },
      { id: 'l8', name: 'Vitamin D (25-OH)', value: '28 ng/mL', ref: '30–100 ng/mL', flag: 'Low', trend: 'stable', date: 'May 20, 2026', orderedBy: 'Dr. Emily Carter', prev: '26 ng/mL (Feb 2026)' },
    ],
    immunizations: [
      { name: 'Influenza (Flu)', date: 'Oct 14, 2025' },
      { name: 'COVID-19 Booster (Bivalent)', date: 'Sep 21, 2025' },
      { name: 'Tdap', date: 'Jun 02, 2023' },
      { name: 'MMR', date: '1989 (childhood)' },
    ],
  },
};

export const StoreProvider = ({ children }) => {
  const [store, setStore] = useState(initialStore);
  const value = useMemo(() => ({ store, setStore }), [store]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};
export const useStore = () => useContext(StoreContext);

// ----- Small components -----
export const Button = ({ variant = 'primary', size = 'md', icon, iconRight, children, className = '', block, ...rest }) => {
  const cls = ['btn', `btn-${variant}`, size === 'sm' && 'btn-sm', size === 'lg' && 'btn-lg', block && 'btn-block', className].filter(Boolean).join(' ');
  return (
    <button className={cls} {...rest}>
      {icon && <Icon name={icon} size={size === 'lg' ? 18 : 16} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === 'lg' ? 18 : 16} />}
    </button>
  );
};

export const Badge = ({ status, children }) => {
  const map = {
    'Ready to join': 'green',
    'Scheduled': 'blue',
    'Completed': 'gray',
    'Cancelled': 'gray',
    'Submitted': 'blue',
    'In Review': 'amber',
    'Waiting for Patient': 'orange',
    'Resolved': 'green',
    'Closed': 'gray',
    'Active': 'green',
    'Verified': 'green',
    'Not started': 'gray',
    'Draft saved': 'amber',
    'Severe': 'red',
    'Moderate': 'amber',
    'Mild': 'gray',
    'Virtual': 'teal',
    'In-Person': 'blue',
    'Normal': 'green',
    'High': 'red',
    'Low': 'amber',
    'Borderline': 'amber',
    'Improving': 'green',
  };
  const color = map[children || status] || 'gray';
  return (
    <span className={`badge badge-${color}`}>
      {children || status}
    </span>
  );
};

export const Card = ({ title, action, children, className = '', flush = false }) => (
  <div className={`card ${flush ? 'card-flush' : ''} ${className}`}>
    {(title || action) && (
      <div className="card-header" style={flush ? { padding: '18px 20px 12px', marginBottom: 0 } : {}}>
        {title && <h3 className="card-title">{title}</h3>}
        {action}
      </div>
    )}
    {children}
  </div>
);

export const Modal = ({ open, onClose, title, children, footer, wide }) => {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal ${wide ? 'wide' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ fontSize: 17 }}>{title}</h3>
          <button className="icon-btn" onClick={onClose} style={{ width: 32, height: 32 }}>
            <Icon name="x" size={16} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

export const Avatar = ({ initials, name, size = 'md', color }) => {
  const sz = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : size === 'xl' ? 'xl' : '';
  return (
    <div className={`avatar ${sz}`} style={color ? { background: color } : {}}>
      {initials || (name ? name.split(' ').map(n => n[0]).slice(0, 2).join('') : '?')}
    </div>
  );
};

export const StatBlock = ({ label, value, sub, icon, color = 'var(--primary)' }) => (
  <div className="card" style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
    {icon && (
      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}1A`, color, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <Icon name={icon} size={18} />
      </div>
    )}
    <div className="stat" style={{ flex: 1 }}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  </div>
);
