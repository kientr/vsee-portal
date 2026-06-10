// App shell — sidebar, topbar, router outlet, mount (v3 IA)
import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './icons.jsx';
import {
  RouterProvider, useRouter, StoreProvider, useStore,
  ToastProvider, useToast, Avatar,
} from './core.jsx';
import { LoginScreen, DashboardScreen } from './screens-1.jsx';
import {
  VisitsScreen, VisitDetailScreen, TelemedCallScreen,
  SeeProviderScreen, ConfirmScreen,
  RequestsScreen, RequestNewScreen, RequestDetailScreen,
} from './screens-2.jsx';
import {
  MessagesScreen, FormsScreen, IntakeFormScreen,
  MedicalRecordsScreen, ProfileScreen, SettingsScreen,
} from './screens-3.jsx';

// v3 IA: Dashboard / Care (Visits, Requests, Messages) / Health (Forms, Records) / Account
// Visits, Requests, and Messages are distinct concepts. E-consult is a Visit type.
// Monitoring/RPM is an optional dashboard widget, never a sidebar tab.
const NAV_GROUPS = [
  { label: null, items: [
    { to: '/dashboard', icon: 'home', label: 'Dashboard' },
  ]},
  { label: 'Care', items: [
    { to: '/visits', icon: 'calendar', label: 'Visits' },
    { to: '/requests', icon: 'inbox', label: 'Requests' },
    { to: '/messages', icon: 'message', label: 'Messages', feature: 'messages' },
  ]},
  { label: 'Health', items: [
    { to: '/forms', icon: 'fileText', label: 'Forms & Documents', feature: 'forms' },
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
  const F = store.features;
  const openReqs = store.requests.filter(r => r.open).length;
  const unread = store.messages.filter(m => m.unread).length;
  const showSeeProvider = F.scheduling || F.econsult;
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark">V</div>
        <div>
          <div className="sidebar-brand-name">VSee Health</div>
          <div className="sidebar-brand-sub">Patient Portal</div>
        </div>
      </div>

      {showSeeProvider && (
        <button className="btn btn-primary btn-block see-provider-btn" onClick={() => nav('/see-provider')} style={{ margin: '4px 0 14px' }}>
          <Icon name="plus" size={16} /> See a provider
        </button>
      )}

      {NAV_GROUPS.map((group, gi) => {
        const items = group.items.filter(n => !n.feature || F[n.feature]);
        if (items.length === 0) return null;
        return (
        <React.Fragment key={group.label || `g${gi}`}>
          {group.label && <div className="nav-section-label">{group.label}</div>}
          {items.map(n => {
            const badge = n.to === '/messages' ? (unread || null)
              : n.to === '/requests' ? (openReqs || null) : null;
            const active = n.to === '/visits'
              ? (path.startsWith('/visits') || path.startsWith('/see-provider'))
              : path.startsWith(n.to);
            return (
              <button key={n.to} className={`nav-item ${active ? 'active' : ''}`} onClick={() => nav(n.to)}>
                <Icon name={n.icon} />
                {n.label}
                {badge && <span className="badge-dot">{badge}</span>}
              </button>
            );
          })}
        </React.Fragment>
        );
      })}

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

const Topbar = () => {
  const { nav } = useRouter();
  const toast = useToast();
  const { store, setStore } = useStore();
  const [notifOpen, setNotifOpen] = useState(false);
  const unreadCount = store.notifications.filter(n => !n.read).length;

  const popRef = useRef(null);
  useEffect(() => {
    if (!notifOpen) return;
    const onClick = (e) => { if (popRef.current && !popRef.current.contains(e.target)) setNotifOpen(false); };
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
            <button className="btn btn-text" style={{ height: 30, fontSize: 13 }} onClick={() => { setNotifOpen(false); nav('/settings'); }}>
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
  if (path === '/see-provider') return { name: 'see-provider' };
  if (path === '/confirm') return { name: 'confirm' };
  if (path === '/visits') return { name: 'visits' };
  // legacy v2 entry points fold into the wizard
  if (path === '/visits/schedule' || path === '/visits/econsult') return { name: 'see-provider' };
  const v = path.match(/^\/visits\/([^/]+)$/);
  if (v) return { name: 'visit-detail', id: v[1] };
  if (path === '/telemedicine/call') return { name: 'telemed-call' };
  if (path === '/requests') return { name: 'requests' };
  if (path === '/requests/new') return { name: 'request-new' };
  const rq = path.match(/^\/requests\/([^/]+)$/);
  if (rq) return { name: 'request-detail', id: rq[1] };
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
  dashboard: { title: 'Dashboard', chrome: true },
  'see-provider': { title: 'See a provider', chrome: true },
  confirm: { title: 'Confirmation', chrome: true },
  visits: { title: 'Visits', chrome: true },
  'visit-detail': { title: 'Details', chrome: true },
  'telemed-call': { title: 'In visit', chrome: false, fullBleed: true },
  requests: { title: 'Requests', chrome: true },
  'request-new': { title: 'New request', chrome: true },
  'request-detail': { title: 'Request', chrome: true },
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
    case 'see-provider': return <SeeProviderScreen />;
    case 'confirm': return <ConfirmScreen />;
    case 'visits': return <VisitsScreen />;
    case 'visit-detail': return <VisitDetailScreen visitId={route.id} />;
    case 'telemed-call': return <TelemedCallScreen />;
    case 'requests': return <RequestsScreen />;
    case 'request-new': return <RequestNewScreen />;
    case 'request-detail': return <RequestDetailScreen requestId={route.id} />;
    case 'messages': return <MessagesScreen activeId={route.id} />;
    case 'forms': return <FormsScreen />;
    case 'intake': return <IntakeFormScreen />;
    case 'records': return <MedicalRecordsScreen />;
    case 'profile': return <ProfileScreen />;
    case 'settings': return <SettingsScreen />;
    default: return <DashboardScreen />;
  }
};

// ----- Mobile navigation (§7.2) -----
const MOBILE_TABS = [
  { to: '/dashboard', icon: 'home', label: 'Home' },
  { to: '/visits', icon: 'calendar', label: 'Visits' },
  { to: '/messages', icon: 'message', label: 'Messages', feature: 'messages' },
  { to: '/medical-records', icon: 'records', label: 'Records' },
];
const MobileNav = ({ onMore }) => {
  const { path, nav } = useRouter();
  const { store } = useStore();
  const tabs = MOBILE_TABS.filter(t => !t.feature || store.features[t.feature]);
  const unread = store.messages.filter(m => m.unread).length;
  return (
    <nav className="mobile-nav">
      {tabs.map(t => {
        const active = t.to === '/visits' ? (path.startsWith('/visits') || path.startsWith('/see-provider')) : path.startsWith(t.to);
        return (
          <button key={t.to} className={active ? 'active' : ''} onClick={() => nav(t.to)}>
            <span style={{ position: 'relative' }}>
              <Icon name={t.icon} size={20} />
              {t.to === '/messages' && unread > 0 && <span className="mn-badge">{unread}</span>}
            </span>
            {t.label}
          </button>
        );
      })}
      <button onClick={onMore}><Icon name="menu" size={20} />More</button>
    </nav>
  );
};

const MobileMenu = ({ onClose }) => {
  const { nav } = useRouter();
  const { store } = useStore();
  const F = store.features;
  const go = (to) => { onClose(); nav(to); };
  const showSeeProvider = F.scheduling || F.econsult;
  return (
    <div className="mobile-menu-scrim" onClick={onClose}>
      <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
        <div className="mobile-menu-grip" />
        {showSeeProvider && (
          <button className="btn btn-primary btn-block" onClick={() => go('/see-provider')} style={{ marginBottom: 12 }}>
            <Icon name="plus" size={16} /> See a provider
          </button>
        )}
        {NAV_GROUPS.map((group, gi) => {
          const items = group.items.filter(n => !n.feature || F[n.feature]);
          if (items.length === 0) return null;
          return (
            <React.Fragment key={group.label || `g${gi}`}>
              {group.label && <div className="nav-section-label">{group.label}</div>}
              {items.map(n => (
                <button key={n.to} className="nav-item" onClick={() => go(n.to)}>
                  <Icon name={n.icon} /> {n.label}
                </button>
              ))}
            </React.Fragment>
          );
        })}
        <hr className="divider" />
        <button className="nav-item" onClick={() => go('/login')}><Icon name="logout" /> Sign out</button>
      </div>
    </div>
  );
};

const Shell = () => {
  const { path } = useRouter();
  const route = match(path);
  const meta = ROUTE_META[route.name];
  const [menuOpen, setMenuOpen] = useState(false);
  if (meta.fullBleed) return <Outlet />;
  // Hide bottom nav during the focused scheduling flow (it has its own sticky [Back][Continue]).
  const hideMobileNav = route.name === 'see-provider';
  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <Topbar />
        <div className="content">
          <Outlet />
        </div>
      </div>
      {!hideMobileNav && <MobileNav onMore={() => setMenuOpen(true)} />}
      {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
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
