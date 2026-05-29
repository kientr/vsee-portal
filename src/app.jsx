// App shell — sidebar, topbar, router outlet, mount
import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './icons.jsx';
import { RouterProvider, useRouter, StoreProvider, useStore, ToastProvider, useToast, Avatar, Modal, Button } from './core.jsx';
import { LoginScreen, DashboardScreen } from './screens-1.jsx';
import { VisitsScreen, VisitDetailScreen, ScheduleVisitScreen, TelemedicineScreen, TelemedCallScreen, RequestsScreen, NewRequestScreen, RequestDetailScreen } from './screens-2.jsx';
import { MessagesScreen, FormsScreen, IntakeFormScreen, MedicalRecordsScreen, ProfileScreen, SettingsScreen } from './screens-3.jsx';

const NAV_ITEMS = [
  { to: '/dashboard', icon: 'home', label: 'Dashboard' },
  { to: '/visits', icon: 'calendar', label: 'Visits' },
  { to: '/requests', icon: 'inbox', label: 'Requests' },
  { to: '/messages', icon: 'message', label: 'Messages' },
  { to: '/forms', icon: 'fileText', label: 'Forms & Documents' },
  { to: '/medical-records', icon: 'records', label: 'Medical Records' },
  { to: '/profile', icon: 'user', label: 'Profile' },
  { to: '/settings', icon: 'settings', label: 'Settings' },
];

const Sidebar = () => {
  const { path, nav } = useRouter();
  const { store } = useStore();

  // Dynamic badges from live store
  const openRequests = store.requests.filter(r => r.status !== 'Resolved' && r.status !== 'Closed').length;
  const unreadMessages = store.messages.filter(m => m.unread).length;

  const badges = {
    '/requests': openRequests || null,
    '/messages': unreadMessages || null,
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark">V</div>
        <div>
          <div className="sidebar-brand-name">VSee Health</div>
          <div className="sidebar-brand-sub">Patient Portal</div>
        </div>
      </div>

      <div className="nav-section-label">Main</div>
      {NAV_ITEMS.slice(0, 2).map(n => (
        <button key={n.to} className={`nav-item ${path.startsWith(n.to) ? 'active' : ''}`} onClick={() => nav(n.to)}>
          <Icon name={n.icon} />
          {n.label}
        </button>
      ))}

      <div className="nav-section-label">Care</div>
      {NAV_ITEMS.slice(2, 6).map(n => (
        <button key={n.to} className={`nav-item ${path.startsWith(n.to) ? 'active' : ''}`} onClick={() => nav(n.to)}>
          <Icon name={n.icon} />
          {n.label}
          {badges[n.to] && <span className="badge-dot">{badges[n.to]}</span>}
        </button>
      ))}

      <div className="nav-section-label">Account</div>
      {NAV_ITEMS.slice(6).map(n => (
        <button key={n.to} className={`nav-item ${path.startsWith(n.to) ? 'active' : ''}`} onClick={() => nav(n.to)}>
          <Icon name={n.icon} />
          {n.label}
        </button>
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
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'center', opacity: 0.5 }}>
          <Icon name="shield" size={11} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: 10.5, color: 'var(--text-muted)', fontWeight: 500 }}>HIPAA Compliant · Encrypted</span>
        </div>
      </div>
    </aside>
  );
};

const NOTIFICATION_DATA = [
  { id: 'n1', icon: 'activity', color: '#0D875C', title: 'Lab results available', body: 'Your A1C came back at 6.4% — an improvement.', time: '2 min ago', unread: true, href: '/messages/m1' },
  { id: 'n2', icon: 'fileText', color: '#92400E', title: 'Intake form due soon', body: 'Pre-Visit Intake Form due May 27.', time: '1 hr ago', unread: true, href: '/forms/intake' },
  { id: 'n3', icon: 'message', color: '#196CD2', title: 'New message', body: 'Dr. Carter replied to your message.', time: 'May 24', unread: false, href: '/messages/m1' },
  { id: 'n4', icon: 'calendar', color: '#6B7280', title: 'Appointment reminder', body: 'Virtual Follow-up tomorrow at 10:30 AM.', time: 'May 24', unread: false, href: '/visits' },
];

const NotificationPanel = ({ items, setItems, onClose }) => {
  const { nav } = useRouter();
  const unreadCount = items.filter(n => n.unread).length;

  return (
    <div style={{
      position: 'absolute', top: 48, right: 0,
      width: 360, background: 'var(--surface)',
      border: '1px solid var(--border)', borderRadius: 14,
      boxShadow: 'var(--shadow-lg)', zIndex: 200,
      overflow: 'hidden',
    }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontWeight: 700, fontSize: 15 }}>Notifications</div>
        {unreadCount > 0 && (
          <button onClick={() => setItems(i => i.map(n => ({ ...n, unread: false })))}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            Mark all read
          </button>
        )}
      </div>
      <div style={{ maxHeight: 360, overflowY: 'auto' }}>
        {items.map(n => (
          <button key={n.id} onClick={() => { setItems(i => i.map(x => x.id === n.id ? { ...x, unread: false } : x)); nav(n.href); onClose(); }}
            style={{ width: '100%', display: 'flex', gap: 12, padding: '12px 18px', background: n.unread ? 'var(--primary-100)' : 'transparent', border: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer', textAlign: 'left' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${n.color}1A`, color: n.color, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <Icon name={n.icon} size={16} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 6 }}>
                {n.title}
                {n.unread && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }}></span>}
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 1 }}>{n.body}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{n.time}</div>
            </div>
          </button>
        ))}
      </div>
      <div style={{ padding: '10px 18px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <button onClick={() => { nav('/messages'); onClose(); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          View all messages
        </button>
      </div>
    </div>
  );
};

const QUICK_LINKS = [
  { label: 'Dashboard', icon: 'home', href: '/dashboard' },
  { label: 'Join telemedicine visit', icon: 'video', href: '/telemedicine/call' },
  { label: 'New request', icon: 'plus', href: '/requests/new' },
  { label: 'Medical Records', icon: 'records', href: '/medical-records' },
  { label: 'Messages', icon: 'message', href: '/messages' },
  { label: 'Forms & Documents', icon: 'fileText', href: '/forms' },
];

const SearchModal = ({ onClose }) => {
  const { nav } = useRouter();
  const { store } = useStore();
  const [q, setQ] = useState('');
  const [focusedIdx, setFocusedIdx] = useState(0);
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const results = q.trim() ? [
    ...store.visits.filter(v => [v.kind, v.provider, v.when].join(' ').toLowerCase().includes(q.toLowerCase()))
      .map(v => ({ type: 'Visit', label: v.kind, sub: `${v.provider} · ${v.when}`, href: `/visits/${v.id}`, icon: 'calendar' })),
    ...store.messages.filter(m => [m.subject, m.from].join(' ').toLowerCase().includes(q.toLowerCase()))
      .map(m => ({ type: 'Message', label: m.subject, sub: `From ${m.from}`, href: `/messages/${m.id}`, icon: 'message' })),
    ...store.requests.filter(r => r.title.toLowerCase().includes(q.toLowerCase()))
      .map(r => ({ type: 'Request', label: r.title, sub: r.type, href: `/requests/${r.id}`, icon: 'inbox' })),
  ] : [];

  const items = q.trim() ? results : QUICK_LINKS;

  useEffect(() => { setFocusedIdx(0); }, [q]);

  const go = (href) => { nav(href); onClose(); };

  const handleKey = (e) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setFocusedIdx(i => Math.min(i + 1, items.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setFocusedIdx(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && items[focusedIdx]) go(items[focusedIdx].href);
  };

  return (
    <div className="modal-overlay" style={{ alignItems: 'flex-start', paddingTop: '10vh' }} onClick={onClose}>
      <div style={{ background: 'var(--surface)', borderRadius: 16, width: '100%', maxWidth: 580, overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--border)' }}>
          <Icon name="search" size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} placeholder="Search visits, messages, requests…"
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15, background: 'transparent', color: 'var(--text)' }}
            onKeyDown={handleKey} />
          <kbd style={{ fontSize: 11, padding: '2px 6px', background: 'var(--grey-300)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-muted)', flexShrink: 0 }}>ESC</kbd>
        </div>
        <div style={{ maxHeight: 420, overflowY: 'auto', padding: '10px 12px' }}>
          {q.trim() === '' && (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', padding: '4px 8px 8px' }}>Quick navigation</div>
              {QUICK_LINKS.map((l, i) => (
                <button key={l.href} onClick={() => go(l.href)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '9px 10px', borderRadius: 8, border: 'none', background: focusedIdx === i ? 'var(--primary-light)' : 'transparent', cursor: 'pointer', textAlign: 'left' }}
                  onMouseEnter={() => setFocusedIdx(i)}
                  onMouseLeave={() => {}}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: focusedIdx === i ? 'var(--primary)' : 'var(--bg)', border: '1px solid var(--border)', display: 'grid', placeItems: 'center', color: focusedIdx === i ? 'white' : 'var(--text-secondary)', flexShrink: 0, transition: 'all .1s' }}>
                    <Icon name={l.icon} size={15} />
                  </div>
                  <span style={{ fontWeight: 500, fontSize: 14, color: focusedIdx === i ? 'var(--primary-dark)' : 'var(--text)' }}>{l.label}</span>
                  <Icon name="chevronRight" size={14} style={{ color: 'var(--text-muted)', marginLeft: 'auto' }} />
                </button>
              ))}
            </>
          )}
          {q.trim() !== '' && results.length === 0 && (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
              No results for <strong>"{q}"</strong>
            </div>
          )}
          {results.length > 0 && (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', padding: '4px 8px 8px' }}>Results</div>
              {results.map((r, i) => (
                <button key={i} onClick={() => go(r.href)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '9px 10px', borderRadius: 8, border: 'none', background: focusedIdx === i ? 'var(--primary-light)' : 'transparent', cursor: 'pointer', textAlign: 'left' }}
                  onMouseEnter={() => setFocusedIdx(i)}
                  onMouseLeave={() => {}}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary-light)', display: 'grid', placeItems: 'center', color: 'var(--primary-dark)', flexShrink: 0 }}>
                    <Icon name={r.icon} size={15} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{r.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.sub}</div>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)', background: 'var(--grey-300)', padding: '2px 8px', borderRadius: 4, flexShrink: 0 }}>{r.type}</span>
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const Topbar = ({ title }) => {
  const { nav } = useRouter();
  const toast = useToast();
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [items, setItems] = useState(NOTIFICATION_DATA);
  const notifUnread = items.filter(n => n.unread).length;

  // Cmd+K / Ctrl+K opens the search modal
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Close notification panel on outside click or Escape
  useEffect(() => {
    if (!notifOpen) return;
    const onMouse = (e) => { if (!e.target.closest('[data-notif-panel]')) setNotifOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setNotifOpen(false); };
    setTimeout(() => document.addEventListener('mousedown', onMouse), 0);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onMouse); document.removeEventListener('keydown', onKey); };
  }, [notifOpen]);

  return (
    <div className="topbar">
      <div className="topbar-title" style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{title}</div>
      <button className="topbar-search" onClick={() => setSearchOpen(true)} style={{ cursor: 'text', border: '1px solid var(--border)', background: 'var(--grey-200)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', flex: 1, maxWidth: 360, marginLeft: 24 }}>
        <Icon name="search" style={{ color: 'var(--text-muted)', flexShrink: 0 }} size={15} />
        <span style={{ flex: 1, textAlign: 'left', color: 'var(--text-muted)', fontSize: 13.5 }}>Search…</span>
        <kbd style={{ fontSize: 11, padding: '1px 5px', background: 'var(--grey-300)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-muted)' }}>⌘K</kbd>
      </button>
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
      <div className="topbar-actions" data-notif-panel>
        <div style={{ position: 'relative' }} data-notif-panel>
          <button className="icon-btn" onClick={() => setNotifOpen(o => !o)} style={{ position: 'relative' }}>
            <Icon name="bell" size={17} />
            {notifUnread > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -4,
                minWidth: 17, height: 17, borderRadius: 99,
                background: 'var(--danger)', color: '#fff',
                fontSize: 10, fontWeight: 700, lineHeight: '17px',
                textAlign: 'center', padding: '0 4px',
              }}>{notifUnread}</span>
            )}
          </button>
          {notifOpen && <NotificationPanel items={items} setItems={setItems} onClose={() => setNotifOpen(false)} />}
        </div>
        <button className="icon-btn" onClick={() => toast('Help center coming soon')}>
          <Icon name="helpCircle" size={17} />
        </button>
        <button className="icon-btn" onClick={() => nav('/login')} title="Sign out">
          <Icon name="logout" size={17} />
        </button>
      </div>
    </div>
  );
};

// ----- Route matcher -----
const match = (path) => {
  if (path === '/login' || path === '/') return { name: 'login' };
  if (path === '/dashboard') return { name: 'dashboard' };
  if (path === '/visits') return { name: 'visits' };
  if (path === '/visits/schedule') return { name: 'visit-schedule' };
  const v = path.match(/^\/visits\/([^/]+)$/);
  if (v) return { name: 'visit-detail', id: v[1] };
  if (path === '/telemedicine') return { name: 'telemedicine' };
  if (path === '/telemedicine/call') return { name: 'telemed-call' };
  if (path === '/requests') return { name: 'requests' };
  if (path === '/requests/new') return { name: 'request-new' };
  const r = path.match(/^\/requests\/([^/]+)$/);
  if (r) return { name: 'request-detail', id: r[1] };
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
  dashboard:       { title: 'Dashboard',         chrome: true },
  visits:          { title: 'Visits',             chrome: true },
  'visit-detail':  { title: 'Visit details',      chrome: true },
  'visit-schedule':{ title: 'Schedule Appointment', chrome: true },
  telemedicine:    { title: 'Telemedicine',        chrome: true },
  'telemed-call':  { title: 'In visit',            chrome: false, fullBleed: true },
  requests:        { title: 'Requests',            chrome: true },
  'request-new':   { title: 'New request',         chrome: true },
  'request-detail':{ title: 'Request',             chrome: true },
  messages:        { title: 'Messages',            chrome: true },
  forms:           { title: 'Forms & Documents',   chrome: true },
  intake:          { title: 'Intake Form',         chrome: true },
  records:         { title: 'Medical Records',     chrome: true },
  profile:         { title: 'Profile',             chrome: true },
  settings:        { title: 'Settings',            chrome: true },
  login:           { title: 'Sign in',             chrome: false, fullBleed: true },
};

const Outlet = () => {
  const { path } = useRouter();
  const route = match(path);
  switch (route.name) {
    case 'login':          return <LoginScreen />;
    case 'dashboard':      return <DashboardScreen />;
    case 'visits':         return <VisitsScreen />;
    case 'visit-detail':   return <VisitDetailScreen visitId={route.id} />;
    case 'visit-schedule': return <ScheduleVisitScreen />;
    case 'telemedicine':   return <TelemedicineScreen />;
    case 'telemed-call':   return <TelemedCallScreen />;
    case 'requests':       return <RequestsScreen />;
    case 'request-new':    return <NewRequestScreen />;
    case 'request-detail': return <RequestDetailScreen requestId={route.id} />;
    case 'messages':       return <MessagesScreen activeId={route.id} />;
    case 'forms':          return <FormsScreen />;
    case 'intake':         return <IntakeFormScreen />;
    case 'records':        return <MedicalRecordsScreen />;
    case 'profile':        return <ProfileScreen />;
    case 'settings':       return <SettingsScreen />;
    default:               return <DashboardScreen />;
  }
};

const Shell = () => {
  const { path } = useRouter();
  const route = match(path);
  const meta = ROUTE_META[route.name] || ROUTE_META.dashboard;

  // Update document title on every navigation
  useEffect(() => {
    document.title = meta.title === 'Sign in'
      ? 'VSee Patient Portal — Sign in'
      : `${meta.title} — VSee Patient Portal`;
  }, [meta.title]);

  // Scroll to top on route change
  const contentRef = useRef(null);
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
  }, [path]);

  if (meta.fullBleed) return <Outlet />;

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <Topbar title={meta.title} />
        <div className="content" ref={contentRef}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const App = () => (
  <RouterProvider>
    <StoreProvider>
      <ToastProvider>
        <Shell />
      </ToastProvider>
    </StoreProvider>
  </RouterProvider>
);

export default App;
