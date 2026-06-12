// Shared UI components, store/router, demo data
import React, { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from 'react';
import { Icon } from './icons.jsx';

// ----- Router (hash-based) -----
const RouterContext = createContext(null);
const RouterProvider = ({ children }) => {
  const [path, setPath] = useState(() => window.location.hash.replace(/^#/, '') || '/login');
  useEffect(() => {
    const onHash = () => setPath(window.location.hash.replace(/^#/, '') || '/login');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const nav = useCallback((to) => { window.location.hash = to; }, []);
  return <RouterContext.Provider value={{ path, nav }}>{children}</RouterContext.Provider>;
};
const useRouter = () => useContext(RouterContext);

// ----- Toasts -----
const ToastContext = createContext(null);
const ToastProvider = ({ children }) => {
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
const useToast = () => useContext(ToastContext);

// ----- "See a provider" picker (global modal state) -----
const PickerContext = createContext(null);
const PickerProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const value = useMemo(() => ({
    pickerOpen: open,
    openPicker: () => setOpen(true),
    closePicker: () => setOpen(false),
  }), [open]);
  return <PickerContext.Provider value={value}>{children}</PickerContext.Provider>;
};
const usePicker = () => useContext(PickerContext);

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
  config: {
    allowPatientMessages: true,  // feature flag: can patients initiate messages/requests?
  },
  // Clinic-configurable feature flags. When off: hidden from sidebar, dashboard, and flows.
  features: {
    messages: true,
    forms: true,
    rpm: true,        // optional dashboard Monitoring widget (RPM) — not a sidebar tab
    econsult: true,
    payment: true,
    scheduling: true,
    video: true,
    inperson: true,
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
  // v3: Requests are NON-VISIT / admin support only (documents, insurance, account, admin).
  // Clinical asks about symptoms go through "See a provider" → E-consult (a visit type).
  // No medication refills here — not in scope.
  confirm: null,
  requests: [
    { id: 'rq1', type: 'Document', title: 'Copy of visit record for work', status: 'Submitted', created: 'May 26, 2026', handledBy: 'Patient Services', updated: 'Sent yesterday · usually handled within 24 hours', open: true,
      thread: [
        { from: 'me', name: 'Sarah Johnson', date: 'May 26, 9:02 AM', body: 'Could I get a copy of my Apr 18 visit record for my employer?' },
      ],
      timeline: [{ label: 'Submitted', when: 'May 26, 9:02 AM', state: 'done' }, { label: 'In review', when: 'Patient Services', state: 'active' }, { label: 'Resolved', when: '—', state: 'pending' }] },
    { id: 'rq2', type: 'Insurance', title: 'Update insurance on file', status: 'Resolved', created: 'May 10, 2026', handledBy: 'Patient Services', updated: 'Patient Services · resolved May 12', open: false,
      thread: [{ from: 'me', name: 'Sarah Johnson', date: 'May 10', body: 'I have a new BlueCross plan — can you update my insurance on file?' }, { from: 'them', name: 'Patient Services', date: 'May 12', body: 'Your new BlueCross plan is now on file. Member ID ending 8821.' }],
      timeline: [{ label: 'Submitted', when: 'May 10', state: 'done' }, { label: 'Resolved', when: 'May 12 · Patient Services', state: 'done' }] },
    { id: 'rq3', type: 'Document', title: 'Request a visit record for work', status: 'Resolved', created: 'Apr 28, 2026', handledBy: 'Patient Services', updated: 'Patient Services · resolved Apr 30', open: false,
      thread: [{ from: 'me', name: 'Sarah Johnson', date: 'Apr 28', body: 'I need a record of my Apr 18 visit for my employer.' }, { from: 'them', name: 'Patient Services', date: 'Apr 30', body: "We've emailed your visit record. Let us know if you need anything else." }],
      timeline: [{ label: 'Submitted', when: 'Apr 28', state: 'done' }, { label: 'Resolved', when: 'Apr 30 · Patient Services', state: 'done' }] },
    { id: 'rq4', type: 'Account', title: 'Update preferred phone number', status: 'Resolved', created: 'Apr 20, 2026', handledBy: 'Patient Services', updated: 'Patient Services · resolved Apr 21', open: false,
      thread: [{ from: 'me', name: 'Sarah Johnson', date: 'Apr 20', body: 'Please update my preferred phone number to (555) 123-4567.' }, { from: 'them', name: 'Patient Services', date: 'Apr 21', body: 'Done — your contact number is updated.' }],
      timeline: [{ label: 'Submitted', when: 'Apr 20', state: 'done' }, { label: 'Resolved', when: 'Apr 21 · Patient Services', state: 'done' }] },
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
    // ── Async e-consults are first-class encounters and live in the same list as visits.
    //    Submitting one auto-opens an encounter on the EMR side (shown as `encounter`).
    { id: 'e1', when: 'May 23, 2026', time: '10:14 AM', kind: 'E-consult — Metformin side effects', provider: 'Lisa Ng, NP', specialty: 'Primary Care', mode: 'E-consult', async: true, status: 'Provider Responded', expected: 'within 24–48 hours', tense: 'upcoming', encounter: 'ENC-4471',
      reason: 'Medical question or symptom',
      description: "I've been feeling nauseous in the mornings after taking Metformin. Is this normal during the first weeks? Should I take it with food?",
      assigned: 'Lisa Ng, NP',
      intake: [
        { q: 'Main concern', a: 'Morning nausea after starting Metformin' },
        { q: 'When did it start?', a: 'About 1 week ago' },
        { q: 'Severity', a: 'Mild' },
        { q: 'What have you tried?', a: 'Taking it with a small snack' },
      ],
      response: 'Mild nausea is common in the first 1–2 weeks. Take Metformin with a full meal and a glass of water. If it persists past two weeks, we can switch you to the extended-release form. No need to stop in the meantime.',
      diagnosis: null, plan: null,
      messages: [
        { from: 'patient', name: 'Sarah Johnson', date: 'May 23, 10:14 AM', body: "I've been feeling nauseous in the mornings after taking Metformin. Is this normal during the first weeks? Should I take it with food?" },
        { from: 'team', name: 'Lisa Ng, NP', date: 'May 23, 1:32 PM', body: 'Mild nausea is common in the first 1–2 weeks. Please take Metformin with a full meal and a glass of water. Could you share when you started and how often it has happened?' },
      ],
      timeline: [
        { label: 'Submitted', date: 'May 23, 10:14 AM', state: 'done' },
        { label: 'Encounter opened', date: 'May 23, 10:14 AM', state: 'done' },
        { label: 'Provider replied', date: 'May 23, 1:32 PM', state: 'active' },
        { label: 'Resolved', date: '—', state: 'pending' },
      ],
    },
    { id: 'e2', when: 'May 26, 2026', time: '9:02 AM', kind: 'E-consult — New rash on forearm', provider: 'Dr. Anita Shah', specialty: 'Dermatology', mode: 'E-consult', async: true, status: 'In Review', expected: 'within 24–48 hours', tense: 'upcoming', encounter: 'ENC-4488',
      reason: 'Skin concern',
      description: 'A small itchy rash appeared on my left forearm two days ago. Not painful. Photo attached.',
      assigned: 'Dr. Anita Shah',
      intake: [
        { q: 'Main concern', a: 'Itchy rash on left forearm' },
        { q: 'When did it start?', a: '2 days ago' },
        { q: 'Severity', a: 'Mild' },
        { q: 'What have you tried?', a: 'Over-the-counter hydrocortisone once' },
      ],
      attachments: ['Forearm photo.jpg'],
      response: null,
      diagnosis: null, plan: null,
      messages: [
        { from: 'patient', name: 'Sarah Johnson', date: 'May 26, 9:02 AM', body: 'A small itchy rash appeared on my left forearm two days ago. Not painful. Photo attached.' },
      ],
      timeline: [
        { label: 'Submitted', date: 'May 26, 9:02 AM', state: 'done' },
        { label: 'Encounter opened', date: 'May 26, 9:02 AM', state: 'done' },
        { label: 'In review', date: 'May 26, 11:20 AM', state: 'active' },
        { label: 'Resolved', date: '—', state: 'pending' },
      ],
    },
    { id: 'v1', when: 'May 28, 2026', time: '10:30 AM', kind: 'Virtual Follow-up', provider: 'Dr. Emily Carter', specialty: 'Primary Care', mode: 'Virtual', status: 'Ready to join', tense: 'upcoming',
      reason: 'Diabetes follow-up — review labs and Metformin response',
      diagnosis: null, plan: null,
    },
    { id: 'v2', when: 'Jun 14, 2026', time: '2:15 PM', kind: 'Annual Physical', provider: 'Dr. Emily Carter', specialty: 'Primary Care', mode: 'In-Person', status: 'Scheduled', tense: 'upcoming',
      reason: 'Annual wellness exam', diagnosis: null, plan: null,
    },
    { id: 'v6', when: 'Jun 20, 2026', time: '9:30 AM', kind: 'Phone check-in', provider: 'Lisa Ng, NP', specialty: 'Primary Care', mode: 'Phone', status: 'Scheduled', tense: 'upcoming',
      reason: 'Medication tolerance check-in', diagnosis: null, plan: null,
    },
    { id: 'v7', when: 'Jun 27, 2026', time: '11:15 AM', kind: 'Dermatology follow-up', provider: 'Dr. Anita Shah', specialty: 'Dermatology', mode: 'Virtual', status: 'Scheduled', tense: 'upcoming',
      reason: 'Follow-up on forearm rash', diagnosis: null, plan: null,
    },
    { id: 'v8', when: 'Jul 08, 2026', time: '3:00 PM', kind: 'Endocrinology review', provider: 'Dr. Raj Patel', specialty: 'Endocrinology', mode: 'In-Person', status: 'Scheduled', tense: 'upcoming',
      reason: 'Quarterly diabetes review', diagnosis: null, plan: null,
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
    { id: 'e3', when: 'Apr 02, 2026', time: '8:40 AM', kind: 'E-consult — Glucose tracking question', provider: 'Dr. Raj Patel', specialty: 'Endocrinology', mode: 'E-consult', async: true, status: 'Closed', expected: 'within 24–48 hours', tense: 'past', encounter: 'ENC-4109',
      reason: 'Test or result follow-up',
      description: 'My fasting glucose has been around 110–120 most mornings. Is that where we want it, or should I adjust anything?',
      assigned: 'Dr. Raj Patel',
      intake: [
        { q: 'Main concern', a: 'Fasting glucose 110–120 in mornings' },
        { q: 'When did it start?', a: 'Tracking for ~3 weeks' },
        { q: 'Severity', a: 'Not bothersome' },
        { q: 'What have you tried?', a: 'Logging readings each morning' },
      ],
      response: 'That range is good progress and in line with our target. Keep tracking and we will review the full trend at your next visit. No medication change needed for now.',
      diagnosis: null, plan: null,
      messages: [
        { from: 'patient', name: 'Sarah Johnson', date: 'Apr 2, 8:40 AM', body: 'My fasting glucose has been around 110–120 most mornings. Is that where we want it, or should I adjust anything?' },
        { from: 'team', name: 'Dr. Raj Patel', date: 'Apr 2, 4:05 PM', body: 'That range is good progress and in line with our target. Keep tracking and we will review the full trend at your next visit. No medication change needed for now.' },
      ],
      timeline: [
        { label: 'Submitted', date: 'Apr 2, 8:40 AM', state: 'done' },
        { label: 'Encounter opened', date: 'Apr 2, 8:40 AM', state: 'done' },
        { label: 'Provider replied', date: 'Apr 2, 4:05 PM', state: 'done' },
        { label: 'Resolved', date: 'Apr 2, 4:06 PM', state: 'done' },
      ],
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
    immunizations: [
      { name: 'Influenza (Flu)', date: 'Oct 14, 2025' },
      { name: 'COVID-19 Booster (Bivalent)', date: 'Sep 21, 2025' },
      { name: 'Tdap', date: 'Jun 02, 2023' },
      { name: 'MMR', date: '1989 (childhood)' },
    ],
    rpm: [
      { label: 'Blood pressure', value: '124/78', sub: 'mmHg · today 8:02 AM' },
      { label: 'Glucose', value: '98', sub: 'mg/dL · today 7:40 AM' },
      { label: 'Weight', value: '146', sub: 'lb · yesterday' },
      { label: 'Heart rate', value: '76', sub: 'bpm · today 8:02 AM' },
    ],
  },
  providers: [
    { id: 'p1', name: 'Dr. Emily Carter', initials: 'EC', specialty: 'Primary Care', color: 'linear-gradient(135deg, #0D875C, #0A6B49)', nextSlots: ['Tue May 28', 'Wed May 29', 'Fri May 31'] },
    { id: 'p2', name: 'Dr. Raj Patel', initials: 'RP', specialty: 'Endocrinology', color: 'linear-gradient(135deg, #92400E, #B45309)', nextSlots: ['Thu May 30', 'Tue Jun 04', 'Wed Jun 05'] },
    { id: 'p3', name: 'Lisa Ng, NP', initials: 'LN', specialty: 'Primary Care', color: 'linear-gradient(135deg, #196CD2, #1E40AF)', nextSlots: ['Tue May 28', 'Thu May 30', 'Mon Jun 03'] },
    { id: 'p4', name: 'Dr. Marcus Chen', initials: 'MC', specialty: 'Cardiology', color: 'linear-gradient(135deg, #6B7280, #4B5563)', nextSlots: ['Mon Jun 03', 'Wed Jun 05', 'Thu Jun 06'] },
    { id: 'p5', name: 'Dr. Anita Shah', initials: 'AS', specialty: 'Dermatology', color: 'linear-gradient(135deg, #DC2626, #B91C1C)', nextSlots: ['Tue May 28', 'Fri May 31', 'Mon Jun 03'] },
  ],
  locations: [
    { id: 'loc1', name: 'Main Clinic — Downtown', address: '901 Congress Ave, Austin, TX 78701', distance: '1.2 mi' },
    { id: 'loc2', name: 'North Austin Office', address: '12500 N Lamar Blvd, Austin, TX 78753', distance: '6.4 mi' },
    { id: 'loc3', name: 'South Lamar Specialty Center', address: '2200 S Lamar Blvd, Austin, TX 78704', distance: '3.1 mi' },
  ],
  notifications: [
    { id: 'n1', kind: 'message', title: 'New message from Dr. Carter', body: 'Your lab results are in', when: '2 min ago', read: false, to: '/messages/m1', icon: 'mail', color: '#0D875C' },
    { id: 'n2', kind: 'appointment', title: 'Visit reminder', body: 'Virtual visit tomorrow at 10:30 AM with Dr. Carter', when: '1 hour ago', read: false, to: '/visits/v1', icon: 'calendar', color: '#196CD2' },
    { id: 'n3', kind: 'econsult', title: 'E-consult update', body: 'Lisa Ng replied to your Metformin question', when: '3 hours ago', read: false, to: '/visits/e1', icon: 'message', color: '#92400E' },
    { id: 'n4', kind: 'form', title: 'Form due soon', body: 'Complete your pre-visit intake form by May 27', when: 'Yesterday', read: false, to: '/forms/intake', icon: 'fileText', color: '#92400E' },
    { id: 'n5', kind: 'lab', title: 'Lab results available', body: 'A1C and lipid panel results are now in your record', when: '2 days ago', read: true, to: '/medical-records', icon: 'droplet', color: '#196CD2' },
    { id: 'n6', kind: 'appointment', title: 'Visit scheduled', body: 'Annual Physical with Dr. Carter on Jun 14', when: '4 days ago', read: true, to: '/visits/v2', icon: 'check', color: '#0D875C' },
    { id: 'n7', kind: 'message', title: 'Insurance card on file updated', body: 'Patient Services confirmed your new plan', when: '2 weeks ago', read: true, to: '/messages/m4', icon: 'mail', color: '#0D875C' },
  ],
};

const StoreProvider = ({ children }) => {
  const [store, setStore] = useState(initialStore);
  const value = useMemo(() => ({ store, setStore }), [store]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};
const useStore = () => useContext(StoreContext);

// ----- Small components -----
const Button = ({ variant = 'primary', size = 'md', icon, iconRight, children, className = '', block, ...rest }) => {
  const cls = ['btn', `btn-${variant}`, size === 'sm' && 'btn-sm', size === 'lg' && 'btn-lg', block && 'btn-block', className].filter(Boolean).join(' ');
  return (
    <button className={cls} {...rest}>
      {icon && <Icon name={icon} size={size === 'lg' ? 18 : 16} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === 'lg' ? 18 : 16} />}
    </button>
  );
};

const Badge = ({ status, children }) => {
  // Map known statuses to colors
  const map = {
    'Ready to join': 'green',
    'Scheduled': 'blue',
    'Completed': 'gray',
    'Cancelled': 'gray',
    'Submitted': 'blue',
    'Open': 'blue',
    'In Review': 'amber',
    'In review': 'amber',
    'Provider replied': 'orange',
    'Provider Responded': 'orange',
    'Waiting for Patient': 'orange',
    'Ready for pickup': 'green',
    'Resolved': 'green',
    'Closed': 'gray',
    'E-consult': 'teal',
    'Async': 'teal',
    'Phone': 'blue',
    'Active': 'green',
    'Verified': 'green',
    'Not started': 'gray',
    'Draft saved': 'amber',
    'Severe': 'red',
    'Moderate': 'amber',
    'Mild': 'gray',
    'Virtual': 'teal',
    'In-Person': 'blue',
  };
  const color = map[children || status] || 'gray';
  return (
    <span className={`badge badge-${color}`}>
      {children || status}
    </span>
  );
};

const Card = ({ title, action, children, className = '', flush = false }) => (
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

const Modal = ({ open, onClose, title, children, footer, wide }) => {
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

const Avatar = ({ initials, name, size = 'md', color }) => {
  const colorClass = color || '';
  const sz = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : size === 'xl' ? 'xl' : '';
  return (
    <div className={`avatar ${sz}`} style={color ? { background: color } : {}}>
      {initials || (name ? name.split(' ').map(n => n[0]).slice(0, 2).join('') : '?')}
    </div>
  );
};

const StatBlock = ({ label, value, sub, icon, color = 'var(--primary)' }) => (
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

export {
  RouterProvider, useRouter,
  ToastProvider, useToast,
  StoreProvider, useStore,
  Button, Badge, Card, Modal, Avatar, StatBlock,
  PickerProvider, usePicker,
};
