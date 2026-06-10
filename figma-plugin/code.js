/* ============================================================================
 * VSee Patient Portal — V2 Pages → Figma (native editable layers)
 * Rebuilds the live V2 flow (https://kientr.github.io/vsee-portal/) as real
 * Figma frames/text/shapes using the app's actual design tokens.
 * Run from Figma: Plugins → Development → "VSee Patient Portal — V2 Pages".
 * ==========================================================================*/

// ---------- design tokens (from src/styles.css :root) ----------
const C = {
  primary: '#0D875C', primaryDark: '#0A6B49', primaryDarker: '#074D35',
  primaryLight: '#E6F5EE', primary100: '#F0FAF5',
  danger: '#DC2626', dangerLight: '#FEE2E2',
  warning: '#FFCB5A', warningLight: '#FEF3C7', warningDark: '#92400E',
  info: '#196CD2', infoLight: '#E0F2FE', infoDark: '#1E40AF',
  grey200: '#F8F9FA', grey300: '#F1F2F4', grey400: '#E8EAED',
  grey500: '#C9CED6', grey700: '#9CA3AF', grey800: '#6B7280',
  bg: '#F8F9FA', surface: '#FFFFFF', surface2: '#FCFCFD',
  border: '#E5E7EB', borderStrong: '#D1D5DB',
  text: '#111827', textSecondary: '#6B7280', textMuted: '#9CA3AF',
  white: '#FFFFFF',
};
const R = { card: 12, sm: 6, pill: 999, btn: 6 };
const SIDEBAR_W = 248, TOPBAR_H = 64, SCREEN_W = 1440;

// ---------- low-level helpers ----------
function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  return { r: parseInt(hex.slice(0, 2), 16) / 255, g: parseInt(hex.slice(2, 4), 16) / 255, b: parseInt(hex.slice(4, 6), 16) / 255 };
}
function solid(hex, opacity) {
  const p = { type: 'SOLID', color: hexToRgb(hex) };
  if (opacity != null) p.opacity = opacity;
  return p;
}
function brandGradient() {
  return {
    type: 'GRADIENT_LINEAR',
    gradientTransform: [[0.7, 0.7, -0.2], [-0.7, 0.7, 0.5]],
    gradientStops: [
      { position: 0, color: Object.assign(hexToRgb('#0D875C'), { a: 1 }) },
      { position: 1, color: Object.assign(hexToRgb('#0A6B49'), { a: 1 }) },
    ],
  };
}

let FBTN = { family: 'Inter', style: 'Bold' };
async function loadFonts() {
  for (const s of ['Regular', 'Medium', 'Semi Bold', 'Bold']) {
    await figma.loadFontAsync({ family: 'Inter', style: s });
  }
  try { await figma.loadFontAsync({ family: 'Figtree', style: 'Bold' }); FBTN = { family: 'Figtree', style: 'Bold' }; }
  catch (e) { FBTN = { family: 'Inter', style: 'Bold' }; }
}
const FW = { reg: 'Regular', med: 'Medium', semi: 'Semi Bold', bold: 'Bold' };
function font(weight) { return { family: 'Inter', style: FW[weight] || 'Regular' }; }

// text node
function T(chars, o) {
  o = o || {};
  const t = figma.createText();
  t.fontName = o.btn ? FBTN : font(o.weight || 'reg');
  t.characters = String(chars);
  t.fontSize = o.size || 14;
  t.fills = [solid(o.color || C.text)];
  if (o.lh) t.lineHeight = { value: o.lh, unit: 'PIXELS' };
  if (o.ls != null) t.letterSpacing = { value: o.ls, unit: 'PERCENT' };
  if (o.case) t.textCase = o.case;
  if (o.align) t.textAlignHorizontal = o.align;
  if (o.w) { t.textAutoResize = 'HEIGHT'; t.resize(o.w, t.height); }
  else t.textAutoResize = 'WIDTH_AND_HEIGHT';
  t.name = (o.name || String(chars)).slice(0, 28);
  if (o.stretch) t.__stretch = true;
  if (o.grow) t.__grow = true;
  return t;
}

// auto-layout frame
function box(dir, o, kids) {
  o = o || {};
  const fr = figma.createFrame();
  fr.name = o.name || (dir === 'h' ? 'Row' : 'Col');
  fr.layoutMode = dir === 'h' ? 'HORIZONTAL' : 'VERTICAL';
  fr.itemSpacing = o.gap != null ? o.gap : 0;
  fr.paddingTop = o.pt != null ? o.pt : (o.py != null ? o.py : (o.p || 0));
  fr.paddingBottom = o.pb != null ? o.pb : (o.py != null ? o.py : (o.p || 0));
  fr.paddingLeft = o.pl != null ? o.pl : (o.px != null ? o.px : (o.p || 0));
  fr.paddingRight = o.pr != null ? o.pr : (o.px != null ? o.px : (o.p || 0));
  fr.primaryAxisSizingMode = 'AUTO';
  fr.counterAxisSizingMode = 'AUTO';
  if (o.primaryAlign) fr.primaryAxisAlignItems = o.primaryAlign;
  if (o.counterAlign) fr.counterAxisAlignItems = o.counterAlign;
  fr.fills = o.fill ? [solid(o.fill, o.fillOpacity)] : (o.gradient ? [brandGradient()] : []);
  fr.cornerRadius = o.radius != null ? o.radius : 0;
  if (o.stroke) { fr.strokes = [solid(o.stroke)]; fr.strokeWeight = o.strokeWeight || 1; }
  if (o.shadow) fr.effects = [{ type: 'DROP_SHADOW', color: { r: 0, g: 0, b: 0, a: 0.04 }, offset: { x: 0, y: 2 }, radius: 4, spread: 0, visible: true, blendMode: 'NORMAL' }];
  (kids || []).forEach(k => {
    if (!k) return;
    fr.appendChild(k);
    if (k.__stretch) k.layoutAlign = 'STRETCH';
    if (k.__grow) k.layoutGrow = 1;
  });
  // sizing: width
  if (o.w != null) { if (fr.layoutMode === 'VERTICAL') fr.counterAxisSizingMode = 'FIXED'; else fr.primaryAxisSizingMode = 'FIXED'; }
  if (o.h != null) { if (fr.layoutMode === 'VERTICAL') fr.primaryAxisSizingMode = 'FIXED'; else fr.counterAxisSizingMode = 'FIXED'; }
  if (o.w != null || o.h != null) fr.resize(o.w != null ? o.w : fr.width, o.h != null ? o.h : fr.height);
  if (o.stretch) fr.__stretch = true;
  if (o.grow) fr.__grow = true;
  return fr;
}
function V(o) { return box('v', o, Array.prototype.slice.call(arguments, 1)); }
function H(o) { return box('h', o, Array.prototype.slice.call(arguments, 1)); }
function st(n) { n.__stretch = true; return n; }
function gr(n) { n.__grow = true; return n; }
function spacer() { return gr(rect(1, 1, { fill: null, name: 'spacer' })); }

function rect(w, h, o) {
  o = o || {};
  const r = figma.createRectangle();
  r.resize(w, h);
  r.fills = o.fill ? [solid(o.fill, o.fillOpacity)] : (o.gradient ? [brandGradient()] : []);
  r.cornerRadius = o.radius != null ? o.radius : 0;
  if (o.stroke) { r.strokes = [solid(o.stroke)]; r.strokeWeight = o.strokeWeight || 1; }
  r.name = o.name || 'Rect';
  if (o.stretch) r.__stretch = true;
  return r;
}
function divider(w) { return rect(w || 1, 1, { fill: C.border, name: 'Divider', stretch: true }); }
function dot(d, hex) {
  const e = figma.createEllipse(); e.resize(d, d); e.fills = [solid(hex)]; e.name = 'Dot'; return e;
}

// ---------- component builders ----------
function badge(label, kind) {
  const map = {
    gray: [C.grey300, C.textSecondary, C.border],
    green: [C.primaryLight, C.primaryDark, C.primaryLight],
    blue: [C.infoLight, C.infoDark, C.infoLight],
    amber: [C.warningLight, C.warningDark, C.warningLight],
    red: [C.dangerLight, C.danger, C.dangerLight],
  };
  const [bg, fg, br] = map[kind || 'gray'];
  return H({ name: 'Badge', radius: R.pill, fill: bg, stroke: br, px: 10, py: 3, counterAlign: 'CENTER' },
    T(label, { size: 12, weight: 'semi', color: fg }));
}
function button(label, variant, opts) {
  opts = opts || {};
  const v = variant || 'primary';
  let bg = null, fg = C.text, stroke = null, grad = false;
  if (v === 'primary') { bg = C.primary; fg = C.white; }
  else if (v === 'secondary') { bg = C.surface; fg = C.primary; stroke = C.primary; }
  else if (v === 'ghost') { bg = null; fg = C.textSecondary; stroke = C.border; }
  else if (v === 'danger') { bg = C.danger; fg = C.white; }
  else if (v === 'whiteOnGreen') { bg = C.white; fg = C.primaryDark; }
  const b = H({ name: 'Button/' + v, radius: R.btn, fill: bg, stroke: stroke, gradient: grad, h: 38, px: 18, gap: 8, counterAlign: 'CENTER', primaryAlign: 'CENTER' },
    T(label, { btn: true, size: 14, color: fg }));
  if (opts.full) b.__stretch = true;
  if (opts.w) { b.primaryAxisSizingMode = 'FIXED'; b.resize(opts.w, 38); }
  return b;
}
function avatar(initials, size, hex) {
  size = size || 36;
  const inner = T(initials, { size: Math.round(size * 0.36), weight: 'bold', color: C.white, align: 'CENTER' });
  const a = H({ name: 'Avatar', w: size, h: size, gradient: hex ? false : true, fill: hex || null, radius: size / 2, counterAlign: 'CENTER', primaryAlign: 'CENTER' }, inner);
  return a;
}
function iconTile(glyph, bgHex, fgHex, size) {
  size = size || 40;
  return H({ name: 'Icon', w: size, h: size, fill: bgHex, radius: 10, counterAlign: 'CENTER', primaryAlign: 'CENTER' },
    T(glyph, { size: Math.round(size * 0.45), color: fgHex }));
}
function field(label, value, ph) {
  return V({ name: 'Field', gap: 6, stretch: true },
    T(label, { size: 13, weight: 'semi', color: C.text, stretch: true }),
    H({ name: 'Input', stretch: true, h: 40, radius: R.sm, fill: C.surface, stroke: C.borderStrong, px: 12, counterAlign: 'CENTER' },
      T(value || ph || '', { size: 14, color: value ? C.text : C.textMuted, stretch: true })));
}
function card(o) {
  const kids = Array.prototype.slice.call(arguments, 1);
  return box('v', Object.assign({ name: 'Card', fill: C.surface, stroke: C.border, radius: R.card, p: 20, gap: 14, shadow: true, stretch: true }, o), kids);
}
function pageHeader(title, sub, action) {
  return H({ name: 'PageHeader', stretch: true, counterAlign: 'CENTER' },
    gr(V({ gap: 4 },
      T(title, { size: 26, weight: 'bold', color: C.text, ls: -2 }),
      sub ? T(sub, { size: 14, color: C.textSecondary, w: 560 }) : null)),
    action || null);
}
function eyebrow(label) { return T(label, { size: 11, weight: 'bold', color: C.textMuted, case: 'UPPER', ls: 8, stretch: true }); }

// nav
const NAV = [
  { group: null, items: [['Dashboard', '🏠'], ['Visits & e-consults', '📅']] },
  { group: 'Care', items: [['Messages', '💬', '2'], ['Forms & Documents', '📄'], ['Medical Records', '🗂']] },
  { group: 'Account', items: [['Profile', '👤'], ['Settings', '⚙']] },
];
function navItem(label, glyph, active, badgeTxt) {
  const row = H({ name: 'Nav/' + label, stretch: true, h: 38, radius: 8, px: 12, gap: 11, counterAlign: 'CENTER', fill: active ? C.primaryLight : null },
    T(glyph, { size: 15, color: active ? C.primary : C.textSecondary }),
    gr(T(label, { size: 14, weight: active ? 'semi' : 'med', color: active ? C.primaryDark : C.textSecondary })),
    badgeTxt ? H({ w: 18, h: 18, radius: 9, fill: C.danger, counterAlign: 'CENTER', primaryAlign: 'CENTER' }, T(badgeTxt, { size: 10, weight: 'bold', color: C.white })) : null);
  return row;
}
function sidebar(active) {
  const items = [];
  items.push(H({ name: 'Brand', stretch: true, gap: 10, counterAlign: 'CENTER', pl: 6, pt: 4, pb: 4 },
    H({ w: 32, h: 32, radius: 8, gradient: true, counterAlign: 'CENTER', primaryAlign: 'CENTER' }, T('V', { size: 14, weight: 'bold', color: C.white })),
    V({ gap: 0 }, T('VSee Health', { size: 14, weight: 'bold' }), T('Patient Portal', { size: 11, color: C.textMuted }))));
  items.push(st(rect(1, 8, { fill: null, name: 'gap' })));
  items.push(st(button('  ＋  See a provider', 'primary', { full: true })));
  items.push(st(rect(1, 10, { fill: null, name: 'gap' })));
  NAV.forEach(g => {
    if (g.group) items.push(T(g.group, { size: 10.5, weight: 'bold', color: C.textMuted, case: 'UPPER', ls: 8, stretch: true }));
    g.items.forEach(it => items.push(st(navItem(it[0], it[1], active === it[0], it[2]))));
  });
  items.push(spacer());
  items.push(st(H({ name: 'User', stretch: true, gap: 10, counterAlign: 'CENTER', p: 8, radius: 8, fill: C.surface2, stroke: C.border },
    avatar('SJ', 34),
    gr(V({ gap: 1 }, T('Sarah Johnson', { size: 13, weight: 'semi' }), T('sarah.johnson@email.com', { size: 11, color: C.textMuted }))),
    T('›', { size: 16, color: C.textMuted }))));
  return box('v', { name: 'Sidebar', w: SIDEBAR_W, fill: C.surface, stroke: C.border, gap: 4, pt: 18, pb: 18, pl: 14, pr: 14, stretch: true }, items);
}
function topbar() {
  return H({ name: 'Topbar', stretch: true, h: TOPBAR_H, fill: C.surface, stroke: C.border, px: 28, gap: 16, counterAlign: 'CENTER' },
    H({ name: 'Search', w: 360, h: 38, radius: R.sm, fill: C.grey200, stroke: C.border, px: 12, gap: 8, counterAlign: 'CENTER' },
      T('🔍', { size: 13, color: C.textMuted }), T('Search records, messages, visits…', { size: 13.5, color: C.textMuted })),
    spacer(),
    iconTile('🔔', C.grey200, C.textSecondary, 38),
    iconTile('?', C.grey200, C.textSecondary, 38),
    iconTile('⤴', C.grey200, C.textSecondary, 38));
}
// app screen shell: sidebar + (topbar + content)
function shell(active, contentChildren, contentOpts) {
  const content = box('v', Object.assign({ name: 'Content', grow: true, stretch: true, p: 28, gap: 20, fill: C.bg }, contentOpts || {}), contentChildren);
  const main = V({ name: 'Main', grow: true, stretch: true, fill: C.bg }, st(topbar()), gr(content));
  return H({ name: 'Screen', w: SCREEN_W, fill: C.bg }, st(sidebar(active)), gr(main));
}

// visit list card
function visitCard(mode, modeKind, status, statusKind, m, d, title, meta, actions) {
  return card({ p: 18, gap: 0 },
    st(H({ stretch: true, counterAlign: 'CENTER' }, gr(H({ gap: 8 }, badge(mode, modeKind), badge(status, statusKind))), T('⋯', { size: 18, color: C.textMuted }))),
    st(rect(1, 14, { fill: null })),
    st(H({ stretch: true, gap: 14 },
      V({ w: 60, h: 56, radius: 10, fill: C.bg, stroke: C.border, counterAlign: 'CENTER', primaryAlign: 'CENTER', gap: 0 },
        T(m, { size: 11, weight: 'bold', color: C.textMuted, case: 'UPPER', align: 'CENTER' }),
        T(d, { size: 22, weight: 'bold', align: 'CENTER' })),
      gr(V({ gap: 4 },
        T(title, { size: 17, weight: 'bold' }),
        T(meta, { size: 13, color: C.textSecondary }))))),
    st(rect(1, 14, { fill: null })),
    st(divider()),
    st(rect(1, 14, { fill: null })),
    st(H({ stretch: true, gap: 8 }, ...(actions || []))));
}

// ============================================================================
// SCREENS
// ============================================================================
const SCREENS = [];
function screen(name, node) { node.name = 'V2 · ' + name; SCREENS.push(node); }

// 1. LOGIN ----------------------------------------------------------------
function buildLogin() {
  const cardNode = V({ name: 'LoginCard', w: 400, fill: C.surface, stroke: C.border, radius: 16, p: 32, gap: 18, shadow: true, counterAlign: 'CENTER' },
    H({ gap: 10, counterAlign: 'CENTER' },
      H({ w: 36, h: 36, radius: 9, gradient: true, counterAlign: 'CENTER', primaryAlign: 'CENTER' }, T('V', { size: 16, weight: 'bold', color: C.white })),
      V({ gap: 0 }, T('VSee Health', { size: 16, weight: 'bold' }), T('Patient Portal', { size: 11.5, color: C.textMuted }))),
    st(rect(1, 4, { fill: null })),
    T('Welcome back', { size: 22, weight: 'bold', ls: -1, align: 'CENTER', stretch: true }),
    T('Sign in to access your care.', { size: 13.5, color: C.textSecondary, align: 'CENTER', stretch: true }),
    st(field('Email', '', 'sarah.johnson@email.com')),
    st(field('Password', '', '••••••••')),
    st(button('Sign in', 'primary', { full: true })),
    T('Forgot your password?', { size: 13, weight: 'semi', color: C.primary, align: 'CENTER', stretch: true }),
    st(divider()),
    T("New here?  Create an account", { size: 13, color: C.textSecondary, align: 'CENTER', stretch: true }));
  const s = H({ name: 'wrap', w: SCREEN_W, h: 900, fill: C.bg, counterAlign: 'CENTER', primaryAlign: 'CENTER' }, cardNode);
  screen('Login', s);
}

// 2. DASHBOARD ------------------------------------------------------------
function buildDashboard() {
  const hero = box('h', { name: 'Hero', stretch: true, gradient: true, radius: R.card, p: 22, gap: 16, counterAlign: 'CENTER', shadow: true }, [
    gr(V({ gap: 8 },
      H({ gap: 8 }, badge('Video', 'blue'), badge('Ready to join', 'green')),
      T('Virtual follow-up with Dr. Emily Carter', { size: 19, weight: 'bold', color: C.white }),
      T('Tomorrow · 10:30 AM · Primary Care', { size: 13.5, color: C.white }))),
    button('🎥  Join visit', 'whiteOnGreen'),
  ]);
  const quick = H({ name: 'Quick', stretch: true, gap: 16 },
    gr(card({ gap: 8 }, iconTile('📅', C.infoLight, C.info), T('Schedule a visit', { size: 14, weight: 'bold' }), T('Video, phone, or in person', { size: 12.5, color: C.textSecondary }))),
    gr(card({ gap: 8 }, iconTile('✉️', C.primaryLight, C.primaryDark), T('Send an e-consult', { size: 14, weight: 'bold' }), T('Async — reply in ~24h', { size: 12.5, color: C.textSecondary }))),
    gr(card({ gap: 8 }, iconTile('💬', C.warningLight, C.warningDark), T('Message care team', { size: 14, weight: 'bold' }), T('Patient Services & providers', { size: 12.5, color: C.textSecondary }))));
  const econsult = card({},
    st(H({ stretch: true, counterAlign: 'CENTER' }, gr(T('Open e-consults', { size: 17, weight: 'bold' })), T('View all ›', { size: 13, color: C.primary }))),
    st(divider()),
    st(H({ stretch: true, gap: 12, counterAlign: 'CENTER', pt: 6 }, iconTile('✉️', C.primaryLight, C.primaryDark),
      gr(V({ gap: 2 }, T('Rash on forearm — async review', { size: 14, weight: 'semi' }), T('Dr. Maria Kim · response expected in 24–48h', { size: 12.5, color: C.textSecondary }))),
      badge('Submitted', 'blue'))));
  const forms = card({},
    st(H({ stretch: true, counterAlign: 'CENTER' }, gr(T('Pending forms', { size: 17, weight: 'bold' })), badge('3 due', 'amber'))),
    st(divider()),
    st(H({ stretch: true, gap: 12, counterAlign: 'CENTER', pt: 6 }, iconTile('📝', C.warningLight, C.warningDark),
      gr(V({ gap: 2 }, T('Pre-visit intake', { size: 14, weight: 'semi' }), T('Required before your May 28 visit · due May 27', { size: 12.5, color: C.textSecondary }))),
      button('Continue', 'secondary'))));
  const c = shell('Dashboard', [
    st(pageHeader('Good morning, Sarah', "Here's what needs your attention today.")),
    st(hero), st(eyebrow('Quick actions')), st(quick),
    st(econsult), st(forms),
  ]);
  screen('Dashboard', c);
}

// 3. VISITS ---------------------------------------------------------------
function buildVisits() {
  const tabs = H({ name: 'Tabs', stretch: true, gap: 4, pb: 2 },
    H({ px: 14, py: 10 }, T('Open (3)', { size: 14, weight: 'semi', color: C.primary })),
    H({ px: 14, py: 10 }, T('Past (2)', { size: 14, color: C.textSecondary })),
    H({ px: 14, py: 10 }, T('Cancelled', { size: 14, color: C.textSecondary })));
  const c = shell('Visits & e-consults', [
    st(pageHeader('Visits & e-consults', 'Every encounter in one place — video, phone, in-person, and async e-consults.', button('＋ See a provider', 'primary'))),
    st(tabs), st(divider()),
    st(visitCard('Video', 'blue', 'Ready to join', 'green', 'May', '28', 'Virtual follow-up', 'Dr. Emily Carter · Primary Care · 10:30 AM', [button('🎥 Join visit', 'primary'), button('View details', 'secondary')])),
    st(visitCard('In-person', 'gray', 'Scheduled', 'gray', 'Jun', '14', 'Annual physical', 'Dr. Emily Carter · Main Clinic, Austin · 2:15 PM', [button('View details', 'secondary'), button('Reschedule', 'ghost')])),
    st(visitCard('E-consult', 'green', 'Submitted', 'blue', 'May', '26', 'Rash on forearm — async review', 'Dr. Maria Kim · response expected in 24–48 hours', [button('Open e-consult', 'secondary')])),
  ]);
  screen('Visits', c);
}

// 4. VISIT DETAIL ---------------------------------------------------------
function buildVisitDetail() {
  const left = gr(V({ gap: 14 },
    card({ fill: C.primary100, stroke: C.primaryLight },
      eyebrow('Before joining'),
      st(H({ gap: 8 }, button('🎥 Join visit', 'primary'), button('Test camera & mic', 'ghost')))),
    eyebrow('Pre-visit forms'),
    card({ p: 14, gap: 2 }, T('Pre-visit intake — not started · required', { size: 13.5, weight: 'semi' }), T('Start →', { size: 11, color: C.primary })),
    card({ p: 14, gap: 2 }, T('Medication reconciliation — draft saved', { size: 13.5, weight: 'semi' }), T('Continue →', { size: 11, color: C.primary })),
    eyebrow('Files'),
    card({ p: 14 }, T('+ Upload a file · lab report, photo, etc.', { size: 13.5, weight: 'semi' }))));
  const right = V({ w: 360, gap: 14 },
    eyebrow('Reason for visit'),
    card({ p: 14 }, T('Follow-up on diabetes management and recent labs.', { size: 13.5, color: C.textSecondary, w: 320 })),
    eyebrow('Provider'),
    card({ p: 14 }, T('Dr. Emily Carter · Primary Care Physician', { size: 13.5, weight: 'semi' })),
    eyebrow('Actions'),
    st(button('Reschedule', 'secondary', { full: true })),
    st(button('Cancel visit', 'ghost', { full: true })),
    st(button('+ Invite a guest', 'ghost', { full: true })));
  const c = shell('Visits & e-consults', [
    T('← Back to visits & e-consults', { size: 12, color: C.textSecondary, stretch: true }),
    st(H({ gap: 8 }, badge('Video', 'blue'), badge('Ready to join', 'green'))),
    st(pageHeader('Virtual follow-up with Dr. Emily Carter', 'May 28, 2026 · 10:30 AM · Primary Care')),
    st(H({ stretch: true, gap: 22 }, left, right)),
  ]);
  screen('Visit detail', c);
}

// 5. SEE A PROVIDER (picker) ---------------------------------------------
function buildSeeProvider() {
  function opt(glyph, color, title, tag, desc) {
    return st(H({ stretch: true, gap: 14, p: 14, radius: 10, stroke: C.border, fill: C.surface, counterAlign: 'CENTER' },
      iconTile(glyph, color + '1A' === color ? color : C.primaryLight, color, 44),
      gr(V({ gap: 3 }, H({ gap: 8, counterAlign: 'CENTER' }, T(title, { size: 15, weight: 'bold' }), badge(tag, 'gray')), T(desc, { size: 13, color: C.textSecondary, w: 520 }))),
      T('›', { size: 18, color: C.textMuted })));
  }
  const modal = V({ name: 'Modal', w: 600, fill: C.surface, stroke: C.border, radius: 14, gap: 0, shadow: true },
    st(H({ stretch: true, p: 20, counterAlign: 'CENTER' }, gr(T('See a provider', { size: 18, weight: 'bold' })), T('✕', { size: 16, color: C.textMuted }))),
    st(divider()),
    st(V({ stretch: true, p: 24, gap: 10 },
      T("Pick how you'd like to be seen. We'll open the right encounter for you automatically.", { size: 13.5, color: C.textSecondary, w: 540, stretch: true }),
      st(rect(1, 4, { fill: null })),
      opt('⚡', C.primary, 'Connect now', 'Live video', 'Video with the next on-call provider. Avg wait under 5 min.'),
      opt('📅', C.info, 'Schedule for later', 'By appointment', 'Pick a time with your care team — video, phone, or in person.'),
      opt('✉️', C.warningDark, 'Send an e-consult', 'Async', 'Describe your concern in writing. A provider replies — usually within 24h.'),
      st(divider()),
      T('Insurance, billing, or scheduling help? Message Patient Services.', { size: 12.5, color: C.textSecondary, w: 540, stretch: true }))));
  const s = H({ name: 'wrap', w: SCREEN_W, h: 900, fill: '#111827', fillOpacity: 1, counterAlign: 'CENTER', primaryAlign: 'CENTER' }, modal);
  s.fills = [solid('#111827', 0.35)];
  // backdrop over a faded app — keep simple dark backdrop
  screen('See a provider', s);
}

// 6. MESSAGES -------------------------------------------------------------
function buildMessages() {
  function convo(name, date, preview, active, unread) {
    return st(V({ stretch: true, gap: 3, p: 12, fill: active ? C.primary100 : null, radius: 8 },
      H({ stretch: true, counterAlign: 'CENTER' }, gr(T(name, { size: 13.5, weight: unread ? 'bold' : 'semi' })), T(date, { size: 11, color: C.textMuted })),
      T(preview, { size: 12.5, color: C.textSecondary, w: 280 })));
  }
  function bubble(who, when, body, me) {
    return st(V({ stretch: true, gap: 4, counterAlign: me ? 'MAX' : 'MIN' },
      H({ gap: 8, counterAlign: 'CENTER' }, me ? null : avatar('EC', 24, C.info), T((me ? 'You' : who) + ' · ' + when, { size: 11, color: C.textMuted })),
      H({ fill: me ? C.primaryLight : C.grey300, radius: 10, p: 12 }, T(body, { size: 13.5, w: 420, color: C.text }))));
  }
  const listPane = V({ name: 'List', w: 320, fill: C.surface, stroke: C.border, radius: R.card, gap: 4, p: 10 },
    st(H({ stretch: true, px: 6, py: 6, counterAlign: 'CENTER' }, gr(T('Inbox', { size: 14, weight: 'bold' })), T('4', { size: 11, color: C.textMuted }))),
    convo('Dr. Emily Carter', 'May 24', 'Your lab results are in — A1C came back…', true, true),
    convo('Nurse Lisa Ng', 'May 22', 'Re: Metformin question — take with a meal…', false, true),
    convo('Patient Services', 'May 12', 'Your new BlueCross plan is now on file…', false, false),
    convo('Dr. Raj Patel', 'Apr 2', 'Glucose trends look good — keep tracking…', false, false));
  const threadPane = gr(V({ name: 'Thread', stretch: true, fill: C.surface, stroke: C.border, radius: R.card, gap: 0 },
    st(H({ stretch: true, p: 16, counterAlign: 'CENTER', gap: 12 }, avatar('EC', 40, C.info), gr(V({ gap: 1 }, T('Dr. Emily Carter', { size: 15, weight: 'bold' }), T('Primary Care · last visit Apr 18', { size: 12, color: C.textMuted }))), badge('Replies within a day', 'green'))),
    st(divider()),
    st(V({ stretch: true, p: 18, gap: 16, grow: true },
      bubble('Dr. Emily Carter', 'May 24, 4:18 PM', "Hi Sarah — your A1C came back at 6.4%, a noticeable improvement from 7.1 in February. Let's keep the current Metformin dose.", false),
      bubble('You', 'May 24, 5:02 PM', "Thanks Dr. Carter, that's a relief. See you Thursday.", true))),
    st(divider()),
    st(H({ stretch: true, p: 14, gap: 8, counterAlign: 'CENTER' }, gr(H({ stretch: true, grow: true, h: 40, radius: R.sm, fill: C.grey200, stroke: C.border, px: 12, counterAlign: 'CENTER' }, T('Write a reply…', { size: 13.5, color: C.textMuted }))), button('Send', 'primary')))));
  const c = shell('Messages', [
    st(pageHeader('Messages', 'Ongoing conversations with providers you have a care relationship with.', button('＋ New message', 'primary'))),
    gr(st(H({ stretch: true, grow: true, gap: 16 }, listPane, threadPane))),
  ]);
  screen('Messages', c);
}

// 7. FORMS ----------------------------------------------------------------
function buildForms() {
  function formRow(title, meta, btn, progress) {
    return st(card({ p: 16, gap: 8 },
      st(H({ stretch: true, counterAlign: 'CENTER' },
        gr(V({ gap: 2 }, T(title, { size: 14, weight: 'bold' }), T(meta, { size: 12.5, color: C.textSecondary }))),
        btn)),
      progress != null ? st(H({ stretch: true, h: 4, radius: 2, fill: C.grey400, w: 200 }, rect(progress * 2, 4, { fill: C.primary, radius: 2 }))) : null));
  }
  const tabs = H({ stretch: true, gap: 4, pb: 2 },
    H({ px: 14, py: 10 }, T('Assigned forms (3)', { size: 14, weight: 'semi', color: C.primary })),
    H({ px: 14, py: 10 }, T('Submitted forms (2)', { size: 14, color: C.textSecondary })),
    H({ px: 14, py: 10 }, T('Documents (4)', { size: 14, color: C.textSecondary })));
  const c = shell('Forms & Documents', [
    st(pageHeader('Forms & Documents', 'Complete assigned forms and manage your documents.', button('↑ Upload document', 'secondary'))),
    st(tabs), st(divider()),
    formRow('Pre-Visit Intake Form', 'Required for your May 28 visit · due May 27', button('Start', 'primary')),
    formRow('PHQ-9 Mood Screening', 'Annual screening · due Jun 5', button('Start', 'primary')),
    formRow('Medication Reconciliation', '40% complete · due Jun 12', button('Continue', 'secondary'), 40),
  ]);
  screen('Forms & Documents', c);
}

// 8. INTAKE (form fill) ---------------------------------------------------
function buildIntake() {
  function stepDot(n, label, state) {
    const bg = state === 'done' ? C.primary : state === 'active' ? C.primaryLight : C.grey300;
    const fg = state === 'active' ? C.primaryDark : state === 'done' ? C.white : C.textMuted;
    return H({ gap: 6, counterAlign: 'CENTER' }, H({ w: 22, h: 22, radius: 11, fill: bg, counterAlign: 'CENTER', primaryAlign: 'CENTER' }, T(state === 'done' ? '✓' : String(n), { size: 11, weight: 'bold', color: fg })), T(label, { size: 12, weight: state === 'active' ? 'semi' : 'reg', color: state === 'active' ? C.text : C.textMuted }));
  }
  const stepper = H({ stretch: true, gap: 10, counterAlign: 'CENTER' },
    stepDot(1, 'Personal', 'done'), stepDot(2, 'Contact', 'done'), stepDot(3, 'Reason', 'done'),
    stepDot(4, 'Med history', 'active'), stepDot(5, 'Meds', ''), stepDot(6, 'Allergies', ''));
  function check(label, on) {
    return H({ gap: 8, counterAlign: 'CENTER', p: 10, radius: R.sm, stroke: on ? C.primary : C.border, fill: on ? C.primary100 : C.surface, stretch: true },
      H({ w: 18, h: 18, radius: 4, fill: on ? C.primary : C.surface, stroke: on ? C.primary : C.borderStrong, counterAlign: 'CENTER', primaryAlign: 'CENTER' }, on ? T('✓', { size: 11, color: C.white, weight: 'bold' }) : null),
      T(label, { size: 13.5 }));
  }
  const c = shell('Forms & Documents', [
    T('← Back to forms', { size: 12, color: C.textSecondary, stretch: true }),
    st(pageHeader('Pre-Visit Intake Form', 'For your visit with Dr. Emily Carter on May 28, 2026')),
    st(stepper),
    st(card({ p: 22, gap: 14 },
      T('4. Medical history', { size: 17, weight: 'bold' }),
      T('Do you have any of these conditions? Check all that apply.', { size: 13, color: C.textSecondary, stretch: true }),
      st(H({ stretch: true, gap: 10 }, gr(check('Diabetes', true)), gr(check('High blood pressure', true)))),
      st(H({ stretch: true, gap: 10 }, gr(check('Asthma', false)), gr(check('Heart disease', false)))),
      st(field('Past surgeries', 'Appendectomy (2008)')),
      st(H({ stretch: true, counterAlign: 'CENTER' }, button('← Back', 'ghost'), spacer(), button('Save draft', 'secondary'), button('Continue →', 'primary'))))),
  ]);
  screen('Intake form', c);
}

// 9. MEDICAL RECORDS ------------------------------------------------------
function buildRecords() {
  function recNav(label, ct, active, disabled) {
    return st(H({ stretch: true, h: 34, radius: 8, px: 10, gap: 8, counterAlign: 'CENTER', fill: active ? C.primaryLight : null },
      gr(T(label, { size: 13.5, weight: active ? 'semi' : 'reg', color: disabled ? C.textMuted : active ? C.primaryDark : C.textSecondary })),
      ct ? badge(ct, active ? 'green' : 'gray') : null));
  }
  function stat(n, l) { return gr(card({ p: 14, gap: 2 }, T(n, { size: 22, weight: 'bold' }), T(l, { size: 12, color: C.textSecondary }))); }
  function problem(title, meta) { return st(card({ p: 12, gap: 0 }, H({ stretch: true, gap: 12, counterAlign: 'CENTER' }, iconTile('🗂', C.primaryLight, C.primaryDark, 36), gr(V({ gap: 1 }, T(title, { size: 14, weight: 'semi' }), T(meta, { size: 12, color: C.textSecondary }))), badge('Active', 'green')))); }
  const nav = V({ name: 'RecNav', w: 220, fill: C.surface, stroke: C.border, radius: R.card, gap: 2, p: 12 },
    recNav('Health overview', '', true), recNav('Encounter history', ''), recNav('Medications', '3'),
    recNav('Allergies', '2'), recNav('Problems', '3'), recNav('Vitals', ''),
    recNav('Immunizations', ''), recNav('Lab results', 'later', false, true), recNav('Documents', '4'));
  const vitalCell = (label, val) => gr(V({ gap: 1 }, T(label, { size: 11.5, color: C.textMuted }), T(val, { size: 18, weight: 'bold' })));
  const medsCard = gr(card({},
    T('Current medications', { size: 15, weight: 'bold' }),
    st(divider()),
    st(H({ stretch: true, gap: 10, counterAlign: 'CENTER' }, T('💊', { size: 16, color: C.info }), gr(T('Metformin 500mg · twice daily', { size: 13.5 })))),
    st(H({ stretch: true, gap: 10, counterAlign: 'CENTER' }, T('💊', { size: 16, color: C.info }), gr(T('Lisinopril 10mg · once daily', { size: 13.5 }))))));
  const vitalsCard = gr(card({},
    T('Latest vitals', { size: 15, weight: 'bold' }),
    st(divider()),
    st(H({ stretch: true }, vitalCell('Blood pressure', '124/78'), vitalCell('Heart rate', '76 bpm'))),
    st(H({ stretch: true }, vitalCell('Weight', '146 lb'), vitalCell('BMI', '23.6')))));
  const right = gr(V({ stretch: true, gap: 16 },
    st(H({ stretch: true, gap: 12 }, stat('3', 'Active problems'), stat('3', 'Medications'), stat('2', 'Allergies'), stat('Apr 18', 'Last visit'))),
    st(eyebrow('Active problems')),
    problem('Type 2 Diabetes Mellitus', 'Since Feb 2026 · Dr. Raj Patel'),
    problem('Essential hypertension', 'Since Aug 2023 · Dr. Emily Carter'),
    problem('Seasonal allergic rhinitis', 'Since Apr 2019'),
    st(H({ stretch: true, gap: 16 }, medsCard, vitalsCard))));
  const c = shell('Medical Records', [
    st(pageHeader('Medical Records', 'A patient-friendly view of your health information.', button('↓ Download summary', 'secondary'))),
    st(H({ stretch: true, gap: 22 }, nav, right)),
  ]);
  screen('Medical Records', c);
}

// 10. PROFILE -------------------------------------------------------------
function buildProfile() {
  function infoBox(label, body) { return gr(card({ p: 16, gap: 6 }, T(label, { size: 11, weight: 'bold', color: C.textMuted, case: 'UPPER', ls: 6 }), T(body, { size: 13.5, color: C.text, w: 300, lh: 21 }))); }
  const c = shell('Profile', [
    st(pageHeader('Profile', 'Your personal, contact, and care preferences.', button('✎ Edit profile', 'secondary'))),
    st(card({ p: 16, gap: 14 }, st(H({ gap: 14, counterAlign: 'CENTER' }, avatar('SJ', 56),
      gr(V({ gap: 4 }, T('Sarah Johnson', { size: 17, weight: 'bold' }), T('Patient ID PT-002841 · DOB Jan 12, 1988 · Female', { size: 12, color: C.textSecondary }),
        H({ gap: 6, pt: 2 }, badge('Active patient', 'green'), badge('BlueCross verified', 'blue')))))))),
    st(H({ stretch: true, gap: 16 }, infoBox('Personal information', 'Full name: Sarah Johnson\nDOB: Jan 12, 1988\nSex: Female\nPreferred language: English'), infoBox('Contact information', 'Email: sarah.johnson@email.com\nPhone: (555) 123-4567\n128 Magnolia Ave, Apt 4B\nAustin, TX 78701'))),
    st(H({ stretch: true, gap: 16 }, infoBox('Emergency contact', 'Michael Johnson (Spouse)\n(555) 987-6543'), infoBox('Preferred pharmacy', 'CVS Pharmacy — 901 Congress Ave\nPrescriptions sent here automatically.'))),
  ]);
  screen('Profile', c);
}

// 11. SETTINGS ------------------------------------------------------------
function buildSettings() {
  function toggle(on) { return H({ w: 40, h: 22, radius: 11, fill: on ? C.primary : C.grey500, counterAlign: 'CENTER', primaryAlign: on ? 'MAX' : 'MIN', px: 3 }, dot(16, C.white)); }
  function prefRow(label, desc, on, last) {
    return st(V({ stretch: true, gap: 0 },
      st(H({ stretch: true, py: 14, counterAlign: 'CENTER' }, gr(V({ gap: 2 }, T(label, { size: 14, weight: 'semi' }), T(desc, { size: 12.5, color: C.textSecondary, w: 480 }))), toggle(on))),
      last ? null : st(divider())));
  }
  const tabs = H({ stretch: true, gap: 4, pb: 2 },
    H({ px: 14, py: 10 }, T('Account', { size: 14, color: C.textSecondary })),
    H({ px: 14, py: 10 }, T('Password', { size: 14, color: C.textSecondary })),
    H({ px: 14, py: 10 }, T('Notifications', { size: 14, weight: 'semi', color: C.primary })),
    H({ px: 14, py: 10 }, T('Privacy & consent', { size: 14, color: C.textSecondary })));
  const c = shell('Settings', [
    st(pageHeader('Settings', 'Account, security, and privacy options.')),
    st(tabs), st(divider()),
    st(card({ gap: 0 },
      T('Notification preferences', { size: 17, weight: 'bold' }),
      T('Choose how you want to hear from your care team.', { size: 13, color: C.textSecondary, stretch: true, name: 'sub' }),
      st(rect(1, 8, { fill: null })),
      prefRow('Visit reminders', '24 hours and 1 hour before your appointment', true),
      prefRow('New messages', 'When a provider sends you a chat message', true),
      prefRow('Lab results available', 'When new results are posted to your record', true),
      prefRow('Care team replies', 'When your e-consult is reviewed or replied to', false),
      prefRow('Billing & insurance', 'Statements and insurance updates', false, true))),
  ]);
  screen('Settings', c);
}

// 12. IN-CALL (telemedicine) ---------------------------------------------
function buildInCall() {
  const ctrl = (g, end) => H({ w: end ? 64 : 48, h: 48, radius: end ? 24 : 24, fill: end ? C.danger : '#FFFFFF', fillOpacity: end ? 1 : 0.12, counterAlign: 'CENTER', primaryAlign: 'CENTER' }, T(g, { size: 18, color: C.white }));
  const stage = gr(V({ name: 'Stage', stretch: true, fill: '#0D1B1E', radius: 0, gap: 0, p: 18, counterAlign: 'CENTER' },
    st(H({ stretch: true, counterAlign: 'CENTER' }, H({ gap: 6, counterAlign: 'CENTER', fill: '#FFFFFF', fillOpacity: 0.1, radius: R.pill, px: 12, py: 6 }, dot(8, C.primary), T('00:43 · End-to-end encrypted', { size: 12, color: C.white })), spacer())),
    gr(V({ stretch: true, grow: true, counterAlign: 'CENTER', primaryAlign: 'CENTER', gap: 12 },
      avatar('EC', 110, C.info),
      T('Dr. Emily Carter · Primary Care', { size: 15, weight: 'semi', color: C.white }))),
    st(H({ gap: 14, primaryAlign: 'CENTER', stretch: true, py: 10 }, ctrl('🎙'), ctrl('📷'), ctrl('💬'), ctrl('👤'), ctrl('📎'), ctrl('⋯'), ctrl('Leave', true)))));
  const chat = V({ name: 'Chat', w: 300, fill: '#0F2024', gap: 0, p: 0 },
    st(H({ stretch: true, p: 14, counterAlign: 'CENTER' }, gr(T('Chat', { size: 14, weight: 'bold', color: C.white })), T('✕', { size: 14, color: C.grey700 }))),
    st(V({ stretch: true, p: 14, gap: 12, grow: true },
      V({ gap: 3 }, T('Dr. Carter', { size: 11, color: C.grey700 }), H({ fill: '#1B3035', radius: 8, p: 10 }, T('Hi Sarah, can you hear me okay?', { size: 13, color: C.white, w: 200 }))),
      V({ gap: 3, counterAlign: 'MAX' }, T('You', { size: 11, color: C.grey700 }), H({ fill: C.primary, radius: 8, p: 10 }, T('Yes, clearly.', { size: 13, color: C.white }))))),
    st(H({ stretch: true, p: 12, gap: 8, counterAlign: 'CENTER' }, gr(H({ stretch: true, grow: true, h: 38, radius: R.sm, fill: '#1B3035', px: 12, counterAlign: 'CENTER' }, T('Type a message…', { size: 13, color: C.grey700 }))), T('▶', { size: 14, color: C.primary }))));
  const s = H({ name: 'wrap', w: SCREEN_W, h: 900, fill: '#0D1B1E' }, stage, chat);
  screen('In-call (telemedicine)', s);
}

// 13. SCHEDULE ------------------------------------------------------------
function buildSchedule() {
  function slot(t, state) { const sel = state === 'sel'; const taken = state === 'taken'; return gr(H({ h: 36, radius: R.sm, fill: sel ? C.primary : taken ? C.grey300 : C.surface, stroke: sel ? C.primary : C.border, counterAlign: 'CENTER', primaryAlign: 'CENTER' }, T(t, { size: 13, weight: sel ? 'bold' : 'reg', color: sel ? C.white : taken ? C.textMuted : C.text }))); }
  function calCell(d, state) { const sel = state === 'sel'; const has = state === 'has'; return gr(V({ h: 34, radius: R.sm, fill: sel ? C.primary : null, counterAlign: 'CENTER', primaryAlign: 'CENTER', gap: 1 }, T(d, { size: 12.5, color: sel ? C.white : state === 'dis' ? C.textMuted : C.text, weight: sel ? 'bold' : 'reg' }), has ? dot(4, C.primary) : null)); }
  const cal = gr(card({ gap: 10 },
    st(H({ stretch: true, counterAlign: 'CENTER' }, gr(T('June 2026', { size: 14, weight: 'bold' })), T('← →', { size: 13, color: C.textSecondary }))),
    st(H({ stretch: true, gap: 4 }, ...['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => gr(T(d, { size: 11, color: C.textMuted, align: 'CENTER' }))))),
    st(H({ stretch: true, gap: 4 }, calCell('31', 'dis'), calCell('1'), calCell('2', 'has'), calCell('3'), calCell('4', 'has'), calCell('5'), calCell('6'))),
    st(H({ stretch: true, gap: 4 }, calCell('7'), calCell('8'), calCell('9'), calCell('10', 'has'), calCell('11'), calCell('12'), calCell('13'))),
    st(H({ stretch: true, gap: 4 }, calCell('14', 'sel'), calCell('15'), calCell('16'), calCell('17'), calCell('18'), calCell('19'), calCell('20')))));
  const slots = gr(V({ gap: 10 },
    eyebrow('Available — Jun 14'),
    st(H({ stretch: true, gap: 8 }, slot('9:00', 'taken'), slot('9:30'), slot('10:00'))),
    st(H({ stretch: true, gap: 8 }, slot('10:30'), slot('11:00'), slot('11:30', 'taken'))),
    st(H({ stretch: true, gap: 8 }, slot('2:15', 'sel'), slot('2:45'), slot('3:15')))));
  const c = shell('Visits & e-consults', [
    T('← Back', { size: 12, color: C.textSecondary, stretch: true }),
    st(pageHeader('Schedule a visit', 'Pick a provider, date, and time. Video, phone, or in person.')),
    st(H({ gap: 8 }, badge('Video', 'blue'), badge('Dr. Emily Carter · Primary Care', 'gray'))),
    st(H({ stretch: true, gap: 20 }, cal, slots)),
    st(H({ stretch: true, counterAlign: 'CENTER' }, spacer(), button('Cancel', 'ghost'), button('Confirm appointment', 'primary'))),
  ]);
  screen('Schedule a visit', c);
}

// 14. E-CONSULT -----------------------------------------------------------
function buildEConsult() {
  const formCard = st(card({ p: 24, gap: 16 },
    st(field('Who is this for?', 'Sarah Johnson (me)')),
    st(field('Subject', '', 'A short summary, e.g. "Rash on forearm"')),
    st(V({ gap: 6, stretch: true }, T('Describe your concern', { size: 13, weight: 'semi' }),
      st(V({ stretch: true, h: 120, radius: R.sm, fill: C.surface, stroke: C.borderStrong, p: 12 }, T('When did it start, what you’ve tried, anything else that helps…', { size: 13.5, color: C.textMuted, w: 600 })))) ),
    st(V({ gap: 6, stretch: true }, T('Attachments (optional)', { size: 13, weight: 'semi' }),
      st(V({ stretch: true, h: 70, radius: R.sm, fill: C.bg, stroke: C.border, counterAlign: 'CENTER', primaryAlign: 'CENTER' }, T('↑ Click to attach files · PDF, JPG, PNG', { size: 13, color: C.textMuted })))),
    st(H({ stretch: true, gap: 10, counterAlign: 'CENTER', p: 12, radius: R.sm, fill: C.warningLight }, T('⚠', { size: 15, color: C.warningDark }), gr(T('E-consults are not for emergencies. If this is urgent, call 911.', { size: 12.5, color: C.warningDark })))),
    st(H({ stretch: true, counterAlign: 'CENTER' }, spacer(), button('Cancel', 'ghost'), button('Send e-consult', 'primary'))))));
  const c = shell('Visits & e-consults', [
    T('← Back', { size: 12, color: C.textSecondary, stretch: true }),
    st(pageHeader('Send an e-consult', 'Describe your concern in writing. A provider reviews and replies — usually within 24 hours.')),
    formCard,
  ]);
  screen('Send an e-consult', c);
}

// ============================================================================
// LAYOUT + RUN
// ============================================================================
function findPageOf(node) {
  let n = node;
  while (n && n.type !== 'PAGE') n = n.parent;
  return n;
}

async function main() {
  await loadFonts();

  // origin: near node 1:2 if present, else current page (0,0)
  let originX = 0, originY = 0, page = figma.currentPage;
  try {
    const target = figma.getNodeById('1:2');
    if (target) {
      const p = findPageOf(target);
      if (p) { figma.currentPage = p; page = p; }
      if ('x' in target && 'y' in target) {
        originX = target.x;
        originY = target.y + ('height' in target ? target.height : 0) + 120;
      }
    }
  } catch (e) { /* ignore — fall back to current page */ }

  // title
  const title = T('VSee Patient Portal — V2 flow (all pages)', { size: 40, weight: 'bold', color: C.text, ls: -2 });
  title.x = originX; title.y = originY; page.appendChild(title);
  const subtitle = T('Rebuilt as native, editable Figma layers from https://kientr.github.io/vsee-portal/', { size: 16, color: C.textSecondary });
  subtitle.x = originX; subtitle.y = originY + 52; page.appendChild(subtitle);

  // build all screens
  buildLogin(); buildDashboard(); buildVisits(); buildVisitDetail(); buildSeeProvider();
  buildMessages(); buildForms(); buildIntake(); buildRecords(); buildProfile();
  buildSettings(); buildInCall(); buildSchedule(); buildEConsult();

  // grid layout: 3 columns, per-column y cursors
  const cols = 3, gapX = 120, gapY = 120;
  const startY = originY + 110;
  const yCol = [startY, startY, startY];
  SCREENS.forEach((s, i) => {
    const col = i % cols;
    s.x = originX + col * (SCREEN_W + gapX);
    s.y = yCol[col];
    page.appendChild(s);
    yCol[col] += s.height + gapY;
  });

  // select + zoom to fit
  figma.currentPage.selection = SCREENS;
  figma.viewport.scrollAndZoomIntoView(SCREENS.concat([title]));
  figma.notify('VSee V2: created ' + SCREENS.length + ' page frames ✓');
  figma.closePlugin('Done — ' + SCREENS.length + ' V2 pages added as editable layers.');
}

main().catch(err => { figma.notify('Error: ' + err.message); figma.closePlugin('Error: ' + err.message); });
