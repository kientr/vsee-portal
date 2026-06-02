// App shell — sidebar, topbar, router outlet, mount
import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './icons.jsx';
import {
  RouterProvider, useRouter, StoreProvider, useStore,
  ToastProvider, useToast, PickerProvider, usePicker,
  Avatar, Button,
} from './core.jsx';
import { LoginScreen, DashboardScreen } from './screens-1.jsx';
import {
  VisitsScreen, VisitDetailScreen, TelemedicineScreen, TelemedCallScreen,
  ScheduleAppointmentScreen, EConsultScreen,
} from './screens-2.jsx';
import {
  MessagesScreen, FormsScreen, IntakeFormScreen,
  MedicalRecordsScreen, ProfileScreen, SettingsScreen,
} from './screens-3.jsx';

const NAV_GROUPS = [
  { label: 'Main', items: [
    { to: '/dashboard', icon: 'home', label: 'Dashboard' },
    { to: '/visits', icon: 'calendar', label: 'Visits & e-consults' },
  ]},
  { label: 'Care', items: [
    { to: '/messages', icon: 'message', label: 'Messages', badge: 2 },
    { to: '/forms', icon: 'fileText', label: 'Forms & Documents' },
    { to: '/medical-records', icon: 'records', label: 'Medical Records' },
  ]},
  { label: 'Account', items: [
    { to: '/profile', icon: 'user', label: 'Profile' },
    { to: '/settings', icon: 'settings', label: 'Settings' },
  ]},
];

const Sidebar = () => {
  const { path, nav } = useRouter();
  const { store } = useStore();
  const { openPicker } = usePicker();
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark">V</div>
        <div>
          <div className="sidebar-brand-name">VSee Health</div>
          <div className="sidebar-brand-sub">Patient Portal</div>
        </div>
      </div>

      <button className="btn btn-primary btn-block see-provider-btn" onClick={openPicker} style={{ margin: '4px 0 14px' }}>
        <Icon name="plus" size={16} /> See a provider
      </button>

      {NAV_GROUPS.map(group => (
        <React.Fragment key={group.label}>
          <div className="nav-section-label">{group.label}</div>
          {group.items.map(n => {
            const badge = n.to === '/messages'
              ? (store.messages.filter(m => m.unread).length || null)
              : n.badge;
            return (
            <button key={n.to} className={`nav-item ${path.startsWith(n.to) ? 'active' : ''}`} onClick={() => nav(n.to)}>
              <Icon name={n.icon} />
              {n.label}
              {badge && <span className="badge-dot">{badge}</span>}
            </button>
            );
          })}
        </React.Fragment>
      ))}

      <div className="sidebar-footer">
        <button className="sidebar-user" onClick={() => nav('/profile')}>
          <Avatar initials={store.user.initials} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{store.user.name}</div>
            <div className="muted" style={{ fontSize: 11.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{store.user.email}</div>
          </div>
          <Icon name="chevronRight" size={14} style={{ color: 'var(--text-muted)' }} />
        </button>
      </div>
    </aside>
  );
};

const Topbar = ({ title }) => {
  const { nav } = useRouter();
  const toast = useToast();
  const { store, setStore } = useStore();
  const [notifOpen, setNotifOpen] = useState(false);
  const unreadCount = store.notifications.filter(n => !n.read).length;

  // Close popover on outside click
  const popRef = useRef(null);
  useEffect(() => {
    if (!notifOpen) return;
    const onClick = (e) => {
      if (popRef.current && !popRef.current.contains(e.target)) setNotifOpen(false);
    };
    setTimeout(() => document.addEventListener('mousedown', onClick), 0);
    return () => document.removeEventListener('mousedown', onClick);
  }, [notifOpen]);

  const markAllRead = () => {
    setStore(s => ({ ...s, notifications: s.notifications.map(n => ({ ...n, read: true })) }));
    toast('All notifications marked as read');
  };

  const handleNotifClick = (n) => {
    setStore(s => ({ ...s, notifications: s.notifications.map(x => x.id === n.id ? { ...x, read: true } : x) }));
    setNotifOpen(false);
    nav(n.to);
  };

  return (
    <div className="topbar">
      <div className="topbar-search">
        <Icon name="search" />
        <input placeholder="Search records, messages, visits…" />
      </div>
      <div className="topbar-actions">
        <div style={{ position: 'relative' }}>
          <button className="icon-btn" onClick={() => setNotifOpen(o => !o)}>
            <Icon name="bell" size={17} />
            {unreadCount > 0 && <span className="dot"></span>}
          </button>
        </div>
        <button className="icon-btn" onClick={() => toast('Help center coming soon')}>
          <Icon name="helpCircle" size={17} />
        </button>
        <button className="icon-btn" onClick={() => nav('/login')} title="Sign out">
          <Icon name="logout" size={17} />
        </button>
      </div>

      {notifOpen && (
        <div className="notif-pop" ref={popRef}>
          <div className="notif-pop-header">
            <h4>
              Notifications
              {unreadCount > 0 && <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 600, color: 'var(--primary)' }}>· {unreadCount} new</span>}
            </h4>
            {unreadCount > 0 && (
              <button className="btn btn-text" style={{ height: 28, padding: '0 8px', fontSize: 12 }} onClick={markAllRead}>
                Mark all read
              </button>
            )}
          </div>
          <div className="notif-pop-list">
            {store.notifications.length === 0 ? (
              <div className="notif-empty">
                <div className="empty-state-icon" style={{ margin: '0 auto 10px' }}><Icon name="bell" size={20} /></div>
                <div style={{ fontWeight: 600, color: 'var(--text)' }}>You're all caught up</div>
                <div style={{ fontSize: 13 }}>New notifications will appear here.</div>
              </div>
            ) : (
              store.notifications.map(n => (
                <button key={n.id} className={`notif-row ${!n.read ? 'unread' : ''}`} onClick={() => handleNotifClick(n)}>
                  <div className="notif-row-icon" style={{ background: `${n.color}1A`, color: n.color }}>
                    <Icon name={n.icon} size={18} />
                  </div>
                  <div className="notif-row-body">
                    <div className="notif-row-title">
                      <span>{n.title}</span>
                      <span className="notif-row-when">{n.when}</span>
                    </div>
                    <div className="notif-row-sub">{n.body}</div>
                  </div>
                </button>
              ))
            )}
          </div>
          <div className="notif-pop-footer">
            <button className="btn btn-text" style={{ height: 30, fontSize: 13 }} onClick={() => { setNotifOpen(false); toast('Notification settings opened'); nav('/settings'); }}>
              Notification settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ----- Route matcher -----
const match = (path) => {
  if (path === '/login' || path === '/') return { name: 'login' };
  if (path === '/dashboard') return { name: 'dashboard' };
  if (path === '/visits') return { name: 'visits' };
  if (path === '/visits/schedule') return { name: 'schedule' };
  if (path === '/visits/econsult') return { name: 'econsult-new' };
  const v = path.match(/^\/visits\/([^/]+)$/);
  if (v) return { name: 'visit-detail', id: v[1] };
  if (path === '/telemedicine') return { name: 'telemedicine' };
  if (path === '/telemedicine/call') return { name: 'telemed-call' };
  if (path === '/messages') return { name: 'messages' };
  const m = path.match(/^\/messages\/([^/]+)$/);
  if (m) return { name: 'messages', id: m[1] };
  if (path === '/forms') return { name: 'forms' };
  if (path === '/forms/intake') return { name: 'intake' };
  if (path === '/medical-records') return { name: 'records' };
  if (path === '/profile') return { name: 'profile' };
  if (path === '/settings') return { name: 'settings' };
  return { name: 'dashboard' };
};

const ROUTE_META = {
  schedule: { title: 'Schedule a visit', chrome: true },
  'econsult-new': { title: 'Send an e-consult', chrome: true },
  dashboard: { title: 'Dashboard', chrome: true },
  visits: { title: 'Visits & e-consults', chrome: true },
  'visit-detail': { title: 'Details', chrome: true },
  telemedicine: { title: 'Telemedicine', chrome: true },
  'telemed-call': { title: 'In visit', chrome: false, fullBleed: true },
  messages: { title: 'Messages', chrome: true },
  forms: { title: 'Forms & Documents', chrome: true },
  intake: { title: 'Intake Form', chrome: true },
  records: { title: 'Medical Records', chrome: true },
  profile: { title: 'Profile', chrome: true },
  settings: { title: 'Settings', chrome: true },
  login: { title: 'Sign in', chrome: false, fullBleed: true },
};

const Outlet = () => {
  const { path } = useRouter();
  const route = match(path);
  switch (route.name) {
    case 'login': return <LoginScreen />;
    case 'dashboard': return <DashboardScreen />;
    case 'visits': return <VisitsScreen />;
    case 'schedule': return <ScheduleAppointmentScreen />;
    case 'econsult-new': return <EConsultScreen />;
    case 'visit-detail': return <VisitDetailScreen visitId={route.id} />;
    case 'telemedicine': return <TelemedicineScreen />;
    case 'telemed-call': return <TelemedCallScreen />;
    case 'messages': return <MessagesScreen activeId={route.id} />;
    case 'forms': return <FormsScreen />;
    case 'intake': return <IntakeFormScreen />;
    case 'records': return <MedicalRecordsScreen />;
    case 'profile': return <ProfileScreen />;
    case 'settings': return <SettingsScreen />;
    default: return <DashboardScreen />;
  }
};

const Shell = () => {
  const { path } = useRouter();
  const route = match(path);
  const meta = ROUTE_META[route.name];

  if (meta.fullBleed) {
    return (
      <>
        <Outlet />
        <SeeProviderModal />
      </>
    );
  }

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <Topbar title={meta.title} />
        <div className="content">
          <Outlet />
        </div>
      </div>
      <SeeProviderModal />
    </div>
  );
};

// ─────────────────────────────────────────────
// "See a provider" — single entry point, three peer paths
// (Connect now · Schedule · Send an e-consult). No Event/Site/Program.
// ─────────────────────────────────────────────
const SeeProviderModal = () => {
  const { pickerOpen, closePicker } = usePicker();
  const { nav } = useRouter();
  const toast = useToast();
  const [stage, setStage] = useState('choose'); // 'choose' | 'connect'
  const [reason, setReason] = useState('');

  useEffect(() => { if (!pickerOpen) { setStage('choose'); setReason(''); } }, [pickerOpen]);
  if (!pickerOpen) return null;

  const goTo = (to) => { closePicker(); nav(to); };
  const startNow = () => {
    closePicker();
    toast('Connecting you with the next available provider…');
    nav('/telemedicine/call');
  };

  const OPTIONS = [
    { key: 'now', icon: 'zap', color: '#0D875C', title: 'Connect now', desc: 'Video with the next on-call provider. Avg wait under 5 min.', tag: 'Live video', onClick: () => setStage('connect') },
    { key: 'sched', icon: 'calendar', color: '#196CD2', title: 'Schedule for later', desc: 'Pick a time with your care team — video, phone, or in person.', tag: 'By appointment', onClick: () => goTo('/visits/schedule') },
    { key: 'econsult', icon: 'message', color: '#92400E', title: 'Send an e-consult', desc: 'Describe your concern in writing. A provider reviews and replies — usually within 24h.', tag: 'Async', onClick: () => goTo('/visits/econsult') },
  ];

  return (
    <div className="modal-overlay" onClick={closePicker}>
      <div className="modal wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ fontSize: 18 }}>{stage === 'choose' ? 'See a provider' : 'Connect now'}</h3>
          <button className="icon-btn" onClick={closePicker} style={{ width: 32, height: 32 }}><Icon name="x" size={16} /></button>
        </div>
        <div className="modal-body">
          {stage === 'choose' ? (
            <>
              <p className="muted" style={{ marginTop: -4, marginBottom: 16, fontSize: 13.5 }}>
                Pick how you'd like to be seen. We'll open the right encounter for you automatically — no need to choose a program or location.
              </p>
              <div className="stack" style={{ gap: 10 }}>
                {OPTIONS.map(o => (
                  <button key={o.key} className="picker-option" onClick={o.onClick}>
                    <div className="picker-option-icon" style={{ background: `${o.color}1A`, color: o.color }}>
                      <Icon name={o.icon} size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="row gap-sm" style={{ alignItems: 'center', marginBottom: 2 }}>
                        <span className="picker-option-title">{o.title}</span>
                        <span className="badge badge-gray" style={{ fontSize: 10.5 }}>{o.tag}</span>
                      </div>
                      <div className="muted" style={{ fontSize: 13 }}>{o.desc}</div>
                    </div>
                    <Icon name="chevronRight" size={18} style={{ color: 'var(--text-muted)' }} />
                  </button>
                ))}
              </div>
              <hr className="divider" />
              <div className="muted" style={{ fontSize: 12.5, lineHeight: 1.6 }}>
                Insurance, billing, or scheduling help? <a href="#" onClick={(e) => { e.preventDefault(); goTo('/messages'); }} style={{ fontWeight: 600 }}>Message Patient Services</a>.<br />
                <span style={{ color: 'var(--danger)' }}>If this is an emergency, call 911.</span>
              </div>
            </>
          ) : (
            <>
              <p className="muted" style={{ marginTop: -4, marginBottom: 16, fontSize: 13.5 }}>
                A provider is standing by. Tell us briefly what's going on so they can prepare — this starts your encounter.
              </p>
              <div className="form-row">
                <label>What's this visit about?</label>
                <textarea className="textarea" placeholder="e.g. Sore throat and mild fever since yesterday" value={reason} onChange={(e) => setReason(e.target.value)} style={{ minHeight: 90 }} />
                <div className="field-help">Helps the provider get up to speed before you connect.</div>
              </div>
              <div className="row" style={{ gap: 8, marginTop: 4 }}>
                <Icon name="video" size={15} style={{ color: 'var(--text-secondary)' }} />
                <span className="muted" style={{ fontSize: 13 }}>Video · next available provider · avg wait under 5 min</span>
              </div>
            </>
          )}
        </div>
        {stage === 'connect' && (
          <div className="modal-footer">
            <Button variant="ghost" onClick={() => setStage('choose')}>Back</Button>
            <Button icon="video" onClick={startNow} disabled={!reason.trim()}>Start visit</Button>
          </div>
        )}
      </div>
    </div>
  );
};

const App = () => (
  <RouterProvider>
    <StoreProvider>
      <ToastProvider>
        <PickerProvider>
          <Shell />
        </PickerProvider>
      </ToastProvider>
    </StoreProvider>
  </RouterProvider>
);

export default App;
