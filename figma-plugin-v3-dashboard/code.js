/* ============================================================================
 * VSee Patient Portal — V3 Flow → Figma (native editable layers)
 * Rebuilds the current v3 prototype (https://kientr.github.io/vsee-portal/v3/)
 * as real Figma frames/text/shapes using the app's design tokens.
 * Run: Plugins → Development → "VSee Patient Portal — V3 Flow".
 * ==========================================================================*/

// ---------- design tokens ----------
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
function grad(a, b) {
  return { type: 'GRADIENT_LINEAR', gradientTransform: [[0.7, 0.7, -0.2], [-0.7, 0.7, 0.5]],
    gradientStops: [{ position: 0, color: Object.assign(hexToRgb(a || '#0D875C'), { a: 1 }) }, { position: 1, color: Object.assign(hexToRgb(b || '#0A6B49'), { a: 1 }) }] };
}
let FBTN = { family: 'Inter', style: 'Bold' };
async function loadFonts() {
  for (const s of ['Regular', 'Medium', 'Semi Bold', 'Bold']) await figma.loadFontAsync({ family: 'Inter', style: s });
  try { await figma.loadFontAsync({ family: 'Figtree', style: 'Bold' }); FBTN = { family: 'Figtree', style: 'Bold' }; }
  catch (e) { FBTN = { family: 'Inter', style: 'Bold' }; }
}
const FW = { reg: 'Regular', med: 'Medium', semi: 'Semi Bold', bold: 'Bold' };
function font(w) { return { family: 'Inter', style: FW[w] || 'Regular' }; }

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
  fr.fills = o.fill ? [solid(o.fill, o.fillOpacity)] : (o.gradient ? [grad()] : []);
  fr.cornerRadius = o.radius != null ? o.radius : 0;
  if (o.stroke) { fr.strokes = [solid(o.stroke)]; fr.strokeWeight = o.strokeWeight || 1; }
  if (o.shadow) fr.effects = [{ type: 'DROP_SHADOW', color: { r: 0, g: 0, b: 0, a: 0.04 }, offset: { x: 0, y: 2 }, radius: 4, spread: 0, visible: true, blendMode: 'NORMAL' }];
  (kids || []).flat(Infinity).forEach(k => { if (!k) return; fr.appendChild(k); if (k.__stretch) k.layoutAlign = 'STRETCH'; if (k.__grow) k.layoutGrow = 1; });
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
  r.resize(Math.max(w, 0.01), Math.max(h, 0.01));
  r.fills = o.fill ? [solid(o.fill, o.fillOpacity)] : (o.gradient ? [grad()] : []);
  r.cornerRadius = o.radius != null ? o.radius : 0;
  if (o.stroke) { r.strokes = [solid(o.stroke)]; r.strokeWeight = o.strokeWeight || 1; }
  r.name = o.name || 'Rect';
  if (o.stretch) r.__stretch = true;
  return r;
}
function divider() { return rect(1, 1, { fill: C.border, name: 'Divider', stretch: true }); }
function dot(d, hex) { const e = figma.createEllipse(); e.resize(d, d); e.fills = [solid(hex)]; e.name = 'Dot'; return e; }

// ---------- components ----------
function badge(label, kind) {
  const map = { gray: [C.grey300, C.textSecondary, C.border], green: [C.primaryLight, C.primaryDark, C.primaryLight], blue: [C.infoLight, C.infoDark, C.infoLight], amber: [C.warningLight, C.warningDark, C.warningLight], red: [C.dangerLight, C.danger, C.dangerLight], orange: [C.warningLight, C.warningDark, C.warningLight] };
  const m = map[kind || 'gray'];
  return H({ name: 'Badge', radius: R.pill, fill: m[0], stroke: m[2], px: 10, py: 3, counterAlign: 'CENTER' }, T(label, { size: 12, weight: 'semi', color: m[1] }));
}
function button(label, variant, opts) {
  opts = opts || {};
  const v = variant || 'primary';
  let bg = null, fg = C.text, stroke = null;
  if (v === 'primary') { bg = C.primary; fg = C.white; }
  else if (v === 'secondary') { bg = C.surface; fg = C.primary; stroke = C.primary; }
  else if (v === 'ghost') { fg = C.textSecondary; stroke = C.border; }
  else if (v === 'danger') { bg = C.danger; fg = C.white; }
  else if (v === 'whiteOnGreen') { bg = C.white; fg = C.primaryDark; }
  const b = H({ name: 'Button/' + v, radius: R.btn, fill: bg, stroke: stroke, h: 38, px: 18, gap: 8, counterAlign: 'CENTER', primaryAlign: 'CENTER' }, T(label, { btn: true, size: 14, color: fg }));
  if (opts.full) b.__stretch = true;
  if (opts.w) { b.primaryAxisSizingMode = 'FIXED'; b.resize(opts.w, 38); }
  return b;
}
function avatar(initials, size, hex) {
  size = size || 36;
  return H({ name: 'Avatar', w: size, h: size, gradient: hex ? false : true, fill: hex || null, radius: size / 2, counterAlign: 'CENTER', primaryAlign: 'CENTER' },
    T(initials, { size: Math.round(size * 0.36), weight: 'bold', color: C.white, align: 'CENTER' }));
}
function iconTile(glyph, bgHex, fgHex, size) {
  size = size || 40;
  return H({ name: 'Icon', w: size, h: size, fill: bgHex, radius: 10, counterAlign: 'CENTER', primaryAlign: 'CENTER' }, T(glyph, { size: Math.round(size * 0.45), color: fgHex }));
}
function field(label, value, ph) {
  return V({ name: 'Field', gap: 6, stretch: true },
    T(label, { size: 13, weight: 'semi', stretch: true }),
    H({ name: 'Input', stretch: true, h: 40, radius: R.sm, fill: C.surface, stroke: C.borderStrong, px: 12, counterAlign: 'CENTER' }, T(value || ph || '', { size: 14, color: value ? C.text : C.textMuted, stretch: true })));
}
function card(o) {
  const kids = Array.prototype.slice.call(arguments, 1);
  return box('v', Object.assign({ name: 'Card', fill: C.surface, stroke: C.border, radius: R.card, p: 20, gap: 14, shadow: true, stretch: true }, o), kids);
}
function eyebrow(label) { return T(label, { size: 11, weight: 'bold', color: C.textMuted, case: 'UPPER', ls: 8, stretch: true }); }
function backLink(label) { return T('←  ' + label, { size: 12, color: C.textSecondary, stretch: true }); }
function pageTitle(title, sub, action) {
  return H({ name: 'PageHead', stretch: true, counterAlign: 'CENTER' },
    gr(V({ gap: 4 }, T(title, { size: 26, weight: 'bold', ls: -2 }), sub ? T(sub, { size: 14, color: C.textSecondary, w: 620 }) : null)),
    action || null);
}

// ---------- nav (v3 IA) ----------
const NAV = [
  { group: null, items: [['Dashboard', '🏠']] },
  { group: 'Care', items: [['Visits', '📅'], ['Requests', '📥', '1'], ['Messages', '💬', '2']] },
  { group: 'Health', items: [['Forms & Documents', '📄'], ['Medical Records', '🗂']] },
  { group: 'Account', items: [['Profile', '👤'], ['Settings', '⚙']] },
];
function navItem(label, glyph, active, badgeTxt) {
  return H({ name: 'Nav/' + label, stretch: true, h: 38, radius: 8, px: 12, gap: 11, counterAlign: 'CENTER', fill: active ? C.primaryLight : null },
    T(glyph, { size: 15, color: active ? C.primary : C.textSecondary }),
    gr(T(label, { size: 14, weight: active ? 'semi' : 'med', color: active ? C.primaryDark : C.textSecondary })),
    badgeTxt ? H({ w: 18, h: 18, radius: 9, fill: C.danger, counterAlign: 'CENTER', primaryAlign: 'CENTER' }, T(badgeTxt, { size: 10, weight: 'bold', color: C.white })) : null);
}
function sidebar(active) {
  const items = [];
  items.push(H({ name: 'Brand', stretch: true, gap: 10, counterAlign: 'CENTER', pl: 6, pt: 4, pb: 4 },
    H({ w: 32, h: 32, radius: 8, gradient: true, counterAlign: 'CENTER', primaryAlign: 'CENTER' }, T('V', { size: 14, weight: 'bold', color: C.white })),
    V({ gap: 0 }, T('VSee Health', { size: 14, weight: 'bold' }), T('Patient Portal', { size: 11, color: C.textMuted }))));
  items.push(st(rect(1, 12, { fill: null })));
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
    H({ name: 'Search', w: 360, h: 38, radius: R.sm, fill: C.grey200, stroke: C.border, px: 12, gap: 8, counterAlign: 'CENTER' }, T('🔍', { size: 13, color: C.textMuted }), T('Search records, messages, visits…', { size: 13.5, color: C.textMuted })),
    spacer(), iconTile('🔔', C.grey200, C.textSecondary, 38), iconTile('?', C.grey200, C.textSecondary, 38), iconTile('⤴', C.grey200, C.textSecondary, 38));
}
function shell(active, children, contentOpts) {
  const content = box('v', Object.assign({ name: 'Content', grow: true, stretch: true, p: 28, gap: 18, fill: C.bg }, contentOpts || {}), children);
  const main = V({ name: 'Main', grow: true, stretch: true, fill: C.bg }, st(topbar()), gr(content));
  return H({ name: 'Screen', w: SCREEN_W, fill: C.bg }, st(sidebar(active)), gr(main));
}

// ---------- shared rows ----------
function attnItem(glyph, color, light, title, meta, cta, primary) {
  return st(card({ p: 16, gap: 0 }, st(H({ stretch: true, gap: 14, counterAlign: 'CENTER' },
    iconTile(glyph, light, color, 40),
    gr(V({ gap: 2 }, T(title, { size: 14, weight: 'semi', w: 230 }), T(meta, { size: 12.5, color: C.textSecondary, w: 230 }))),
    button(cta, primary ? 'primary' : 'secondary')))));
}
function apptRow(mon, day, title, meta, status, kind, ready) {
  return st(card({ p: 14, gap: 0 }, st(H({ stretch: true, gap: 14, counterAlign: 'CENTER' },
    V({ w: 52, h: 48, radius: 8, fill: C.bg, stroke: C.border, counterAlign: 'CENTER', primaryAlign: 'CENTER' }, T(mon, { size: 10.5, weight: 'bold', color: C.textMuted, case: 'UPPER', align: 'CENTER' }), T(day, { size: 19, weight: 'bold', align: 'CENTER' })),
    gr(V({ gap: 2 }, T(title, { size: 14, weight: 'semi' }), T(meta, { size: 12.5, color: C.textSecondary }))),
    badge(status, kind),
    ready ? button('🎥 Join', 'primary') : button('View', 'secondary')))));
}
function msgRow(ini, name, date, subj, unread, last) {
  return st(V({ stretch: true, gap: 0 },
    st(H({ stretch: true, gap: 10, pt: 8, pb: 8, counterAlign: 'CENTER' }, avatar(ini, 32, C.info),
      gr(V({ gap: 1 }, st(H({ stretch: true, counterAlign: 'CENTER' }, gr(T((unread ? '● ' : '') + name, { size: 13, weight: 'semi' })), T(date, { size: 11.5, color: C.textMuted }))), T(subj, { size: 12.5, color: C.textMuted, w: 240 }))))),
    last ? null : st(divider())));
}
function providerRow(ini, color, name, spec, avail, online) {
  return st(H({ stretch: true, gap: 12, p: 14, radius: 10, stroke: C.border, fill: C.surface, counterAlign: 'CENTER' },
    avatar(ini, 40, color),
    gr(V({ gap: 1 }, T(name, { size: 15, weight: 'bold' }), T(spec, { size: 13, color: C.textSecondary }))),
    H({ gap: 6, counterAlign: 'CENTER', radius: R.pill, fill: online ? C.primaryLight : C.grey200, px: 10, py: 4 }, online ? dot(7, C.primary) : null, T(avail, { size: 11.5, weight: 'semi', color: online ? C.primaryDark : C.textSecondary })),
    T('›', { size: 18, color: C.textMuted })));
}
function choiceRow(glyph, title, desc, tag) {
  const titleRow = H({ gap: 8, counterAlign: 'CENTER' }, T(title, { size: 15, weight: 'semi' }), tag ? badge(tag, 'blue') : null);
  return st(H({ stretch: true, gap: 14, p: 14, radius: 10, stroke: C.border, fill: C.surface, counterAlign: 'CENTER' },
    iconTile(glyph, C.primaryLight, C.primaryDark, 40),
    gr(V({ gap: 3 }, titleRow, T(desc, { size: 13, color: C.textSecondary, w: 430 }))),
    T('›', { size: 18, color: C.textMuted })));
}
function timeline(items) {
  const rows = items.map((t, i) => st(H({ stretch: true, gap: 10 },
    H({ w: 24, h: 24, radius: 12, fill: t.state === 'done' ? C.primary : (t.state === 'active' ? C.primaryLight : C.grey300), counterAlign: 'CENTER', primaryAlign: 'CENTER' }, T(t.state === 'done' ? '✓' : '', { size: 12, weight: 'bold', color: C.white })),
    gr(V({ gap: 0, pb: i < items.length - 1 ? 14 : 0 }, T(t.label, { size: 13.5, weight: 'semi' }), T(t.when, { size: 12, color: C.textMuted }))))));
  return box('v', { name: 'Timeline', stretch: true, gap: 0 }, rows);
}
function reviewRows(rows) {
  return box('v', { stretch: true, gap: 0 }, rows.map((r, i) => st(H({ stretch: true, py: 12, counterAlign: 'CENTER', stroke: i < rows.length - 1 ? null : null },
    gr(T(r[0], { size: 13.5, color: C.textSecondary })), T(r[1], { size: 13.5, weight: 'semi' })))));
}
function progress(step, total) {
  const segs = [];
  for (let i = 0; i < total; i++) segs.push(gr(rect(1, 4, { radius: 2, fill: i < step ? C.success || C.primary : (i === step ? C.primary : C.border) })));
  return H({ stretch: true, gap: 8 }, segs);
}

// ============================================================================
// SCREENS
// ============================================================================
const SCREENS = [];
function screen(name, node) { node.name = 'V3 · ' + name; SCREENS.push(node); }
function wizard(stepIdx, qChildren, footerLabel) {
  const body = V({ w: 820, gap: 18 },
    T('✕  Cancel', { size: 12, color: C.textSecondary }),
    V({ gap: 4 }, T('See a provider', { size: 26, weight: 'bold', ls: -2 }), T('Choose someone from your care team, then select an available care option. · Step ' + (stepIdx + 1) + ' of 4', { size: 14, color: C.textSecondary, w: 700 })),
    st(progress(stepIdx, 4)),
    card({}, ...qChildren, st(rect(1, 6, { fill: null })), st(divider()),
      st(H({ stretch: true, counterAlign: 'CENTER' }, button(stepIdx === 0 ? '← Cancel' : '← Back', 'ghost'), spacer(), button(footerLabel || 'Continue', 'primary')))));
  return body;
}

// 1. LOGIN
function buildLogin() {
  const cardNode = V({ name: 'LoginCard', w: 400, fill: C.surface, stroke: C.border, radius: 16, p: 32, gap: 16, shadow: true, counterAlign: 'CENTER' },
    H({ gap: 10, counterAlign: 'CENTER' }, H({ w: 36, h: 36, radius: 9, gradient: true, counterAlign: 'CENTER', primaryAlign: 'CENTER' }, T('V', { size: 16, weight: 'bold', color: C.white })), V({ gap: 0 }, T('VSee Health', { size: 16, weight: 'bold' }), T('Patient Portal', { size: 11.5, color: C.textMuted }))),
    st(rect(1, 4, { fill: null })),
    T('Welcome back', { size: 22, weight: 'bold', ls: -1, align: 'CENTER', stretch: true }),
    T('Sign in to your patient portal.', { size: 13.5, color: C.textSecondary, align: 'CENTER', stretch: true }),
    st(field('Email address', 'sarah.johnson@email.com')),
    st(field('Password', '', '••••••••••')),
    st(button('Sign in  →', 'primary', { full: true })),
    T('or', { size: 12, color: C.textMuted, align: 'CENTER', stretch: true }),
    st(button('Sign in with Health ID', 'secondary', { full: true })),
    T('New patient?  Create an account', { size: 13, color: C.textSecondary, align: 'CENTER', stretch: true }));
  const s = H({ name: 'wrap', w: SCREEN_W, h: 860, fill: C.bg, counterAlign: 'CENTER', primaryAlign: 'CENTER' }, cardNode);
  screen('Login', s);
}

// 2. DASHBOARD
function buildDashboard() {
  const nya = V({ stretch: true, gap: 12 },
    st(H({ stretch: true, gap: 12 }, gr(attnItem('🎥', C.info, C.infoLight, 'Join your video visit', 'Dr. Emily Carter · tomorrow, 10:30 AM', 'Join visit', true)), gr(attnItem('📝', C.warningDark, C.warningLight, 'Complete pre-visit intake', 'Required before your May 28 visit · due May 27', 'Complete intake', false)))),
    st(H({ stretch: true, gap: 12 }, gr(attnItem('💬', C.warningDark, C.warningLight, 'Review e-consult response', 'Lisa Ng, NP replied about metformin side effects', 'Review', false)), gr(attnItem('✉️', C.primary, C.primaryLight, 'New message from Dr. Carter', 'Your lab results are in', 'Read message', false)))));

  const upcoming = V({ stretch: true, gap: 10 },
    apptRow('MAY', '28', 'Virtual Follow-up', 'Dr. Emily Carter · 10:30 AM · Video visit', 'Ready to join', 'green', true),
    apptRow('JUN', '14', 'Annual Physical', 'Dr. Emily Carter · 2:15 PM · In-person', 'Scheduled', 'gray', false));
  const todoItems = ['Complete Pre-Visit Intake Form', 'Complete PHQ-9 Mood Screening', 'Reply to your care team message', 'Track request: Refill request — Metformin'];
  const todo = card({}, T('To-do list', { size: 17, weight: 'bold' }), st(divider()),
    ...todoItems.map((t, i) => st(H({ stretch: true, gap: 10, counterAlign: 'CENTER', pt: 8, pb: 8 }, rect(18, 18, { stroke: C.borderStrong, radius: 5 }), gr(T(t, { size: 13.5, weight: 'med' })), T('›', { size: 15, color: C.textMuted })))));
  const left = gr(V({ stretch: true, gap: 22 }, V({ stretch: true, gap: 10 }, eyebrow('Upcoming care'), upcoming), todo));

  const startCare = card({}, eyebrow('Start care'), T('See a provider', { size: 17, weight: 'bold' }), T('Choose from your care team, then an available option.', { size: 13, color: C.textSecondary, w: 300, stretch: true }),
    st(button('＋ See a provider', 'primary', { full: true })), st(button('✉️ Send an e-consult', 'secondary', { full: true })));
  const recent = card({}, st(H({ stretch: true, counterAlign: 'CENTER' }, gr(T('Recent messages', { size: 17, weight: 'bold' })), T('Inbox', { size: 13, color: C.primary }))), st(divider()),
    msgRow('EC', 'Dr. Emily Carter', 'May 24', 'Your lab results are in', true), msgRow('CT', 'Care Team', 'May 23', 'Reminder: Pre-visit intake form', true), msgRow('LN', 'Lisa Ng, NP', 'May 22', 'Re: Metformin question', false, true));
  const monitoring = card({}, st(H({ stretch: true, counterAlign: 'CENTER' }, gr(T('Monitoring', { size: 17, weight: 'bold' })), T('View trends', { size: 13, color: C.primary }))),
    st(H({ stretch: true, gap: 12, counterAlign: 'CENTER' }, iconTile('❤', C.primaryLight, C.primaryDark, 40), V({ gap: 1 }, T('124/78  mmHg', { size: 18, weight: 'bold' }), T('Latest blood pressure · today 8:02 AM', { size: 12, color: C.textMuted })))));
  const right = V({ w: 380, gap: 20 }, startCare, recent, monitoring);

  const head = st(H({ stretch: true, counterAlign: 'CENTER' },
    gr(V({ gap: 4 }, T('Good morning, Sarah', { size: 26, weight: 'bold', ls: -2 }), T("Here's your care at a glance.", { size: 14, color: C.textSecondary }))),
    H({ gap: 6, counterAlign: 'CENTER' }, dot(7, C.primary), T('Updated just now', { size: 12, color: C.textMuted }))));

  screen('Dashboard', shell('Dashboard', [head, eyebrow('Needs your attention'), st(nya), st(rect(1, 8, { fill: null })), st(H({ stretch: true, gap: 20 }, left, right))]));
}

// 3. VISITS LIST
function buildVisits() {
  const tabs = H({ stretch: true, gap: 4, pb: 2 }, H({ px: 14, py: 10 }, T('Open (4)', { size: 14, weight: 'semi', color: C.primary })), H({ px: 14, py: 10 }, T('Past (2)', { size: 14, color: C.textSecondary })), H({ px: 14, py: 10 }, T('Cancelled', { size: 14, color: C.textSecondary })));
  screen('Visits & e-consults', shell('Visits', [
    st(pageTitle('Visits & e-consults', 'Every encounter in one place — video, phone, in-person, and async e-consults.', button('＋ See a provider', 'primary'))),
    st(tabs), st(divider()),
    st(visitCard('Video', 'blue', 'Ready to join', 'green', 'May', '28', 'Virtual Follow-up', 'Dr. Emily Carter · Primary Care · 10:30 AM', [button('🎥 Join visit', 'primary'), button('View details', 'secondary')])),
    st(visitCard('E-consult', 'green', 'Provider Responded', 'orange', 'May', '23', 'E-consult — Metformin side effects', 'Lisa Ng, NP · responded in 18 hours', [button('Open e-consult', 'primary')])),
    st(visitCard('E-consult', 'green', 'In Review', 'amber', 'May', '26', 'E-consult — New rash on forearm', 'Dr. Anita Shah · response expected in 24–48 hours', [button('Open e-consult', 'secondary')])),
    st(visitCard('In-Person', 'gray', 'Scheduled', 'gray', 'Jun', '14', 'Annual Physical', 'Dr. Emily Carter · Main Clinic, Austin · 2:15 PM', [button('View details', 'secondary'), button('Reschedule', 'ghost')])),
  ]));
}
function visitCard(mode, modeKind, status, statusKind, m, d, title, meta, actions) {
  return card({ p: 18, gap: 0 },
    st(H({ stretch: true, counterAlign: 'CENTER' }, gr(H({ gap: 8 }, badge(mode, modeKind), badge(status, statusKind))), T('⋯', { size: 18, color: C.textMuted }))),
    st(rect(1, 14, { fill: null })),
    st(H({ stretch: true, gap: 14 }, V({ w: 60, h: 56, radius: 10, fill: C.bg, stroke: C.border, counterAlign: 'CENTER', primaryAlign: 'CENTER' }, T(m, { size: 11, weight: 'bold', color: C.textMuted, case: 'UPPER', align: 'CENTER' }), T(d, { size: 22, weight: 'bold', align: 'CENTER' })),
      gr(V({ gap: 4 }, T(title, { size: 17, weight: 'bold' }), T(meta, { size: 13, color: C.textSecondary }))))),
    st(rect(1, 14, { fill: null })), st(divider()), st(rect(1, 14, { fill: null })),
    st(H({ stretch: true, gap: 8 }, actions)));
}

// 4. VISIT DETAIL (upcoming)
function buildVisitDetail() {
  const left = gr(V({ stretch: true, gap: 16 },
    card({}, T('Visit details', { size: 17, weight: 'bold' }), st(divider()),
      st(H({ stretch: true, gap: 24 }, gr(V({ gap: 2 }, eyebrow('Reason for visit'), T('Diabetes follow-up — review labs and Metformin response', { size: 13.5, w: 260 }))), gr(V({ gap: 2 }, eyebrow('When'), T('May 28, 2026 · 10:30 AM', { size: 13.5 }))))),
      st(H({ stretch: true, gap: 24 }, gr(V({ gap: 2 }, eyebrow('Visit type'), T('Virtual Follow-up · Video', { size: 13.5 }))), gr(V({ gap: 2 }, eyebrow('Format'), T('Secure video visit', { size: 13.5 })))))),
    card({}, T('Before your visit', { size: 17, weight: 'bold' }), st(divider()),
      st(H({ stretch: true, gap: 12, counterAlign: 'CENTER', pt: 4, pb: 4 }, iconTile('📝', C.warningLight, C.warningDark, 36), gr(V({ gap: 1 }, T('Complete intake form', { size: 14, weight: 'semi' }), T('Required · about 5 minutes', { size: 12, color: C.textMuted }))), button('Start', 'secondary'))),
      st(H({ stretch: true, gap: 12, counterAlign: 'CENTER', pt: 4, pb: 4 }, iconTile('⬆', C.primaryLight, C.primaryDark, 36), gr(V({ gap: 1 }, T('Upload recent records (optional)', { size: 14, weight: 'semi' }), T('Lab results, outside notes, imaging', { size: 12, color: C.textMuted }))), button('Upload', 'secondary'))),
      st(H({ stretch: true, gap: 12, counterAlign: 'CENTER', pt: 4, pb: 4 }, iconTile('✓', C.primaryLight, C.primaryDark, 36), gr(V({ gap: 1 }, T('Insurance card on file', { size: 14, weight: 'semi' }), T('BlueCross · verified May 12', { size: 12, color: C.textMuted }))), badge('Verified', 'green'))))));
  const right = V({ w: 320, gap: 16 },
    card({}, T('Provider', { size: 15, weight: 'bold' }), st(H({ gap: 12, counterAlign: 'CENTER' }, avatar('EC', 44, C.primary), V({ gap: 1 }, T('Dr. Emily Carter', { size: 14, weight: 'semi' }), T('Primary Care', { size: 12.5, color: C.textSecondary })))), st(button('Send message', 'secondary', { full: true }))),
    card({}, T('Actions', { size: 15, weight: 'bold' }), st(button('Reschedule', 'secondary', { full: true })), st(button('Cancel visit', 'ghost', { full: true }))));
  screen('Visit detail', shell('Visits', [
    backLink('Back to visits'),
    st(H({ gap: 8 }, badge('Video', 'blue'), badge('Ready to join', 'green'))),
    st(pageTitle('Virtual Follow-up', 'May 28, 2026 · 10:30 AM · Dr. Emily Carter, Primary Care', button('🎥 Join visit', 'primary'))),
    st(H({ stretch: true, gap: 20 }, left, right)),
  ]));
}

// 5. E-CONSULT TICKET DETAIL
function buildEConsult() {
  const banner = H({ stretch: true, gap: 12, p: 16, radius: R.card, fill: C.primary100, counterAlign: 'CENTER' },
    iconTile('⏱', C.white, C.primary, 38),
    gr(V({ gap: 2 }, T('Expected response: within 24–48 hours', { size: 14, weight: 'bold' }), T('For urgent symptoms, call emergency services or contact your clinic directly.', { size: 12.5, color: C.textSecondary, w: 500 }))));
  const concernCard = card({}, T('Submitted concern', { size: 15, weight: 'bold' }), T("I've been feeling nauseous in the mornings after taking Metformin. Is this normal during the first weeks? Should I take it with food?", { size: 14, w: 560 }));
  const intakeRows = [['Main concern', 'Morning nausea after starting Metformin'], ['When did it start?', 'About 1 week ago'], ['Severity', 'Mild'], ['What have you tried?', 'Taking it with a small snack']]
    .map(r => st(H({ stretch: true, py: 9, counterAlign: 'CENTER' }, gr(T(r[0], { size: 13, color: C.textSecondary })), T(r[1], { size: 13.5, weight: 'semi', w: 280, align: 'RIGHT' }))));
  const intakeCard = card({}, T('Intake answers', { size: 15, weight: 'bold' }), st(divider()), intakeRows);
  const respBubble = st(H({ stretch: true, gap: 10 }, avatar('LN', 30, C.info),
    gr(V({ gap: 3 }, H({ fill: C.grey300, radius: 10, p: 12 }, T('Mild nausea is common in the first 1–2 weeks. Take Metformin with a full meal and water. If it persists past two weeks, we can switch to extended-release.', { size: 13.5, w: 440 })), T('Lisa Ng, NP · May 23, 1:32 PM', { size: 11.5, color: C.textMuted })))));
  const activityCard = card({}, T('Provider response & activity', { size: 15, weight: 'bold' }), st(divider()), respBubble);
  const left = gr(V({ stretch: true, gap: 16 }, banner, concernCard, intakeCard, activityCard));
  const right = V({ w: 320, gap: 16 },
    card({}, T('Status', { size: 15, weight: 'bold' }), st(timeline([{ label: 'Submitted', when: 'May 23, 10:14 AM', state: 'done' }, { label: 'Assigned to care team', when: 'May 23, 10:14 AM', state: 'done' }, { label: 'Provider responded', when: 'May 23, 1:32 PM', state: 'active' }, { label: 'Closed', when: '—', state: 'pending' }]))),
    card({}, T('Actions', { size: 15, weight: 'bold' }), st(button('Add follow-up', 'secondary', { full: true })), st(button('＋ Start a new visit', 'secondary', { full: true })), st(button('Close this e-consult', 'ghost', { full: true }))),
    card({}, T('Encounter', { size: 15, weight: 'bold' }), T('Filed to encounter ENC-4471 in the EMR.', { size: 12.5, color: C.textSecondary, w: 280 })));
  screen('E-consult detail (ticket)', shell('Visits', [
    backLink('Back to visits'),
    st(H({ gap: 8 }, badge('E-consult', 'green'), badge('Provider Responded', 'orange'))),
    st(pageTitle('Metformin side effects', 'Ticket ENC-4471 · Submitted May 23, 2026 · Lisa Ng, NP')),
    st(H({ stretch: true, gap: 20 }, left, right)),
  ]));
}

// 6-9. SEE A PROVIDER wizard
function buildSPProvider() {
  const q = [T('Choose a provider', { size: 17, weight: 'bold', stretch: true }),
    eyebrow('Your care team'),
    providerRow('EC', C.primary, 'Dr. Emily Carter', 'Primary Care', 'Available now for video', true),
    providerRow('LN', C.info, 'Lisa Ng, NP', 'Nurse Practitioner', 'Next available today 3:30 PM', false),
    providerRow('RP', C.warningDark, 'Dr. Raj Patel', 'Endocrinology', 'Next available Jun 14', false),
    st(rect(1, 4, { fill: null })), eyebrow('Other options'),
    providerRow('⚡', C.grey800, 'First available provider', 'Fastest option across your care team', 'Connect now', true)];
  screen('See a provider · 1 Provider', shell('Visits', [wizard(0, q)]));
}
function buildSPType() {
  const q = [T('How would you like to see Dr. Emily Carter?', { size: 17, weight: 'bold', stretch: true }),
    eyebrow('Available now'), choiceRow('🎥', 'Video visit now', 'Connect over secure video right away.'), choiceRow('📞', 'Phone visit now', "We'll call you at your number."),
    st(rect(1, 4, { fill: null })), eyebrow('Schedule later'), choiceRow('🎥', 'Scheduled video visit', 'Pick a day and time for a video visit.'), choiceRow('🏥', 'In-person visit', 'Visit a clinic location near you.'),
    st(rect(1, 4, { fill: null })), eyebrow('Async option'), choiceRow('✉️', 'E-consult', 'Send your concern and intake for review. Response within 24–48 hours.', 'Async · 24–48h')];
  screen('See a provider · 2 Visit type', shell('Visits', [wizard(1, q)]));
}
function buildSPSlot() {
  const slots = ['9:00', '9:30', '10:00', '10:30', '11:00', '11:30', '2:15', '2:45', '3:15'];
  const taken = { '9:00': 1, '11:30': 1 }; const sel = { '2:15': 1 };
  const grid = box('h', { name: 'Slots', stretch: true, gap: 10 }, slots.map(t => gr(H({ h: 40, radius: R.sm, fill: sel[t] ? C.primary : (taken[t] ? C.grey300 : C.surface), stroke: sel[t] ? C.primary : C.border, counterAlign: 'CENTER', primaryAlign: 'CENTER' }, T(t, { size: 13, weight: sel[t] ? 'bold' : 'reg', color: sel[t] ? C.white : (taken[t] ? C.textMuted : C.text) })))));
  // wrap slots into rows of 3
  const rows = [];
  for (let i = 0; i < slots.length; i += 3) {
    rows.push(st(H({ stretch: true, gap: 10 }, slots.slice(i, i + 3).map(t => gr(H({ h: 40, radius: R.sm, fill: sel[t] ? C.primary : (taken[t] ? C.grey300 : C.surface), stroke: sel[t] ? C.primary : C.border, counterAlign: 'CENTER', primaryAlign: 'CENTER' }, T(t, { size: 13, weight: sel[t] ? 'bold' : 'reg', color: sel[t] ? C.white : (taken[t] ? C.textMuted : C.text) })))))));
  }
  const q = [T('Pick a time', { size: 17, weight: 'bold', stretch: true }), T('Dr. Emily Carter · Scheduled video visit', { size: 13.5, color: C.textSecondary, stretch: true }), eyebrow('Available — Jun 14, 2026'), ...rows];
  screen('See a provider · 3 Pick a time', shell('Visits', [wizard(2, q)]));
}
function buildSPReview() {
  const q = [T('Review & confirm', { size: 17, weight: 'bold', stretch: true }),
    reviewRows([['Provider', 'Dr. Emily Carter · Primary Care'], ['Visit type', 'Scheduled video visit'], ['When', 'Jun 14, 2026 · 2:15 PM'], ['Reason', 'Diabetes follow-up'], ['Payment', '$25.00 copay · Visa ···· 4242']])];
  screen('See a provider · 4 Review', shell('Visits', [wizard(3, q, 'Confirm appointment')]));
}

// 10. CONFIRMATION
function buildConfirm() {
  const cardNode = V({ w: 560, fill: C.surface, stroke: C.border, radius: R.card, p: 40, gap: 0, shadow: true, counterAlign: 'CENTER' },
    H({ w: 64, h: 64, radius: 32, fill: C.primaryLight, counterAlign: 'CENTER', primaryAlign: 'CENTER' }, T('✓', { size: 30, weight: 'bold', color: C.primary })),
    st(rect(1, 18, { fill: null })),
    T('E-consult submitted', { size: 22, weight: 'bold', align: 'CENTER', stretch: true }),
    st(rect(1, 8, { fill: null })),
    T('Dr. Anita Shah · Dermatology', { size: 14, color: C.textSecondary, align: 'CENTER', stretch: true }),
    st(rect(1, 8, { fill: null })),
    T("Your care team usually responds within 24–48 hours. You'll be notified and it appears in Visits.", { size: 13, color: C.textSecondary, align: 'CENTER', w: 420 }),
    st(rect(1, 22, { fill: null })),
    H({ gap: 10, primaryAlign: 'CENTER' }, button('Back to dashboard', 'ghost'), button('View e-consult', 'primary')));
  const s = H({ name: 'wrap', w: SCREEN_W, h: 860, fill: C.bg, counterAlign: 'CENTER', primaryAlign: 'CENTER' }, cardNode);
  screen('Confirmation', s);
}

// 11. REQUESTS LIST
function buildRequests() {
  const tabs = H({ stretch: true, gap: 4, pb: 2 }, H({ px: 14, py: 10 }, T('Open (1)', { size: 14, weight: 'semi', color: C.primary })), H({ px: 14, py: 10 }, T('Resolved (3)', { size: 14, color: C.textSecondary })));
  const reqRow = (type, status, kind, title, meta) => st(H({ stretch: true, gap: 14, p: 16, radius: R.card, fill: C.surface, stroke: C.border, shadow: true, counterAlign: 'CENTER' },
    iconTile('📥', C.grey300, C.textSecondary, 44),
    gr(V({ gap: 4 }, H({ gap: 8 }, badge(type, 'gray'), badge(status, kind)), T(title, { size: 14, weight: 'semi' }), T(meta, { size: 12.5, color: C.textSecondary }))),
    T('›', { size: 16, color: C.textMuted })));
  screen('Requests', shell('Requests', [
    st(pageTitle('Requests', 'Non-visit help — refills, documents, insurance, and admin questions. Usually handled within 24 hours.', button('＋ New request', 'primary'))),
    st(tabs), st(divider()),
    reqRow('Refill', 'Submitted', 'blue', 'Refill request — Metformin', 'Sent yesterday · usually handled within 24 hours'),
    reqRow('Refill', 'Resolved', 'green', 'Refill request — Metformin', 'Pharmacy Team · resolved May 23'),
    reqRow('Insurance', 'Resolved', 'green', 'Update insurance on file', 'Patient Services · resolved May 12'),
    reqRow('Document', 'Resolved', 'green', 'Request a visit record for work', 'Patient Services · resolved Apr 30'),
  ]));
}

// 12. REQUEST DETAIL
function buildRequestDetail() {
  const left = gr(card({}, T('Conversation', { size: 15, weight: 'bold' }), st(divider()),
    st(H({ stretch: true, gap: 10 }, spacer(), H({ fill: C.primaryLight, radius: 10, p: 12 }, T("I'm almost out of Metformin 500mg. Could I get a refill sent to my CVS on Congress Ave?", { size: 13.5, w: 380 })), avatar('SJ', 30))),
    st(H({ stretch: true, gap: 10 }, avatar('PT', 30, C.info), gr(H({ fill: C.grey300, radius: 10, p: 12 }, T('Your refill has been sent to CVS Pharmacy on Congress Ave and should be ready for pickup this afternoon.', { size: 13.5, w: 380 }))))),
    st(rect(1, 4, { fill: null })),
    st(H({ stretch: true, gap: 14, counterAlign: 'CENTER', p: 14, radius: 10, fill: C.primary100 }, gr(V({ gap: 1 }, T('Need more help?', { size: 14, weight: 'bold' }), T('Send another request for a non-visit question.', { size: 12.5, color: C.textSecondary }))), button('＋ New request', 'primary')))));
  const right = V({ w: 320, gap: 16 },
    card({}, T('Status', { size: 15, weight: 'bold' }), st(timeline([{ label: 'Submitted', when: 'May 23, 10:14 AM', state: 'done' }, { label: 'Picked up', when: 'May 23, 11:02 AM · Pharmacy Team', state: 'done' }, { label: 'Resolved', when: 'May 23, 1:32 PM', state: 'done' }]))),
    card({}, T('Details', { size: 15, weight: 'bold' }), V({ gap: 6 }, T('Type: Medication refill', { size: 13.5 }), T('Handled by: Pharmacy Team', { size: 13.5 }), T('Submitted: May 23, 2026', { size: 13.5 }))));
  screen('Request detail', shell('Requests', [
    backLink('Back to requests'),
    st(H({ gap: 8 }, badge('Refill', 'gray'), badge('Resolved', 'green'))),
    st(pageTitle('Refill request — Metformin', 'Submitted May 23, 2026 · Handled by Pharmacy Team')),
    st(H({ stretch: true, gap: 20 }, left, right)),
  ]));
}

// 13. NEW REQUEST
function buildNewRequest() {
  const form = card({ p: 24, gap: 16 },
    st(V({ gap: 6, stretch: true }, T('What do you need?', { size: 13, weight: 'semi' }), st(H({ stretch: true, h: 40, radius: R.sm, fill: C.surface, stroke: C.borderStrong, px: 12, counterAlign: 'CENTER' }, gr(T('Medication refill', { size: 14 })), T('▾', { size: 12, color: C.textMuted }))))),
    st(field('Subject', '', "A short summary, e.g. 'Refill Metformin 500mg'")),
    st(V({ gap: 6, stretch: true }, T('Details', { size: 13, weight: 'semi' }), st(V({ stretch: true, h: 100, radius: R.sm, fill: C.surface, stroke: C.borderStrong, p: 12 }, T('Add anything that helps us handle this — pharmacy, dates, document type, etc.', { size: 13.5, color: C.textMuted, w: 600 })))) ),
    st(V({ gap: 6, stretch: true }, T('Attachments (optional)', { size: 13, weight: 'semi' }), st(V({ stretch: true, h: 70, radius: R.sm, fill: C.bg, stroke: C.border, counterAlign: 'CENTER', primaryAlign: 'CENTER' }, T('⬆ Click to attach files · PDF, JPG, PNG up to 25 MB each', { size: 13, color: C.textMuted }))))),
    st(H({ stretch: true, gap: 10, counterAlign: 'CENTER', p: 10, radius: R.sm, fill: C.warningLight }, T('⚠', { size: 15, color: C.warningDark }), gr(T('Requests are not for urgent or medical emergencies. If this is an emergency, call 911.', { size: 12.5, color: C.warningDark })))),
    st(H({ stretch: true, counterAlign: 'CENTER' }, button('Cancel', 'ghost'), spacer(), button('Send request', 'primary'))));
  screen('New request', shell('Requests', [backLink('Back'), st(pageTitle('New request', 'For non-visit help like refills, documents, or insurance. To talk to a provider about symptoms, see a provider instead.')), V({ w: 720 }, form)]));
}

// 14. MESSAGES
function buildMessages() {
  const convo = (name, date, prev, active, unread) => st(V({ stretch: true, gap: 3, p: 12, fill: active ? C.primary100 : null, radius: 8 },
    H({ stretch: true, counterAlign: 'CENTER' }, gr(T(name, { size: 13.5, weight: unread ? 'bold' : 'semi' })), T(date, { size: 11, color: C.textMuted })), T(prev, { size: 12.5, color: C.textSecondary, w: 280 })));
  const listPane = V({ name: 'List', w: 320, fill: C.surface, stroke: C.border, radius: R.card, gap: 4, p: 10 },
    st(H({ stretch: true, px: 6, py: 6, counterAlign: 'CENTER' }, gr(T('Inbox', { size: 14, weight: 'bold' })), T('4', { size: 11, color: C.textMuted }))),
    convo('Dr. Emily Carter', 'May 24', 'Your lab results are in — A1C 6.4%…', true, true), convo('Care Team', 'May 23', 'Reminder: pre-visit intake form…', false, true), convo('Lisa Ng, NP', 'May 22', 'Re: Metformin question…', false, false), convo('Patient Services', 'May 12', 'Insurance card on file updated…', false, false));
  const bubble = (who, when, body, me) => st(V({ stretch: true, gap: 4, counterAlign: me ? 'MAX' : 'MIN' },
    T((me ? 'You' : who) + ' · ' + when, { size: 11, color: C.textMuted }), H({ fill: me ? C.primaryLight : C.grey300, radius: 10, p: 12 }, T(body, { size: 13.5, w: 420 }))));
  const thread = gr(V({ name: 'Thread', stretch: true, fill: C.surface, stroke: C.border, radius: R.card, gap: 0 },
    st(H({ stretch: true, p: 16, counterAlign: 'CENTER', gap: 12 }, avatar('EC', 40, C.primary), gr(V({ gap: 1 }, T('Dr. Emily Carter', { size: 15, weight: 'bold' }), T('Your lab results are in', { size: 12.5, color: C.textMuted }))))),
    st(divider()),
    st(V({ stretch: true, p: 18, gap: 16, grow: true }, bubble('Dr. Emily Carter', 'May 24, 4:18 PM', "Hi Sarah — your A1C came back at 6.4%, a noticeable improvement from 7.1 in February. Let's keep the current Metformin dose.", false), bubble('You', 'May 24, 5:02 PM', "Thanks Dr. Carter, that's a relief. See you Thursday.", true))),
    st(divider()),
    st(H({ stretch: true, p: 14, gap: 8, counterAlign: 'CENTER' }, gr(H({ stretch: true, grow: true, h: 40, radius: R.sm, fill: C.grey200, stroke: C.border, px: 12, counterAlign: 'CENTER' }, T('Write a reply…', { size: 13.5, color: C.textMuted }))), button('Send', 'primary')))));
  screen('Messages', shell('Messages', [st(pageTitle('Messages', 'Secure conversations with your care team.', button('＋ New message', 'primary'))), gr(st(H({ stretch: true, grow: true, gap: 16 }, listPane, thread)))]));
}

// 15. FORMS
function buildForms() {
  const tabs = H({ stretch: true, gap: 4, pb: 2 }, H({ px: 14, py: 10 }, T('Assigned forms (3)', { size: 14, weight: 'semi', color: C.primary })), H({ px: 14, py: 10 }, T('Submitted forms (2)', { size: 14, color: C.textSecondary })), H({ px: 14, py: 10 }, T('Documents (4)', { size: 14, color: C.textSecondary })));
  const formRow = (title, meta, btn, prog) => st(card({ p: 16, gap: 10 },
    st(H({ stretch: true, gap: 14, counterAlign: 'CENTER' }, iconTile('📝', C.warningLight, C.warningDark, 44), gr(V({ gap: 2 }, T(title, { size: 14, weight: 'bold' }), T(meta, { size: 12.5, color: C.textSecondary }))), btn)),
    prog != null ? st(H({ stretch: true, h: 6, radius: 3, fill: C.grey400, w: 240 }, rect(prog * 2.4, 6, { fill: C.primary, radius: 3 }))) : null));
  screen('Forms & Documents', shell('Forms & Documents', [
    st(pageTitle('Forms & Documents', 'Complete assigned forms and manage your uploaded documents.', button('⬆ Upload document', 'secondary'))),
    st(tabs), st(divider()),
    formRow('Pre-Visit Intake Form', 'Required for your May 28 visit · due May 27', button('Start', 'primary')),
    formRow('PHQ-9 Mood Screening', 'Annual screening · due Jun 5', button('Start', 'primary')),
    formRow('Medication Reconciliation', '40% complete · due Jun 12', button('Continue', 'secondary'), 40),
  ]));
}

// 16. INTAKE
function buildIntake() {
  const dot2 = (n, label, state) => H({ gap: 6, counterAlign: 'CENTER' }, H({ w: 22, h: 22, radius: 11, fill: state === 'done' ? C.primary : (state === 'active' ? C.primaryLight : C.grey300), counterAlign: 'CENTER', primaryAlign: 'CENTER' }, T(state === 'done' ? '✓' : String(n), { size: 11, weight: 'bold', color: state === 'active' ? C.primaryDark : (state === 'done' ? C.white : C.textMuted) })), T(label, { size: 12, weight: state === 'active' ? 'semi' : 'reg', color: state === 'active' ? C.text : C.textMuted }));
  const stepper = H({ stretch: true, gap: 10, counterAlign: 'CENTER' }, dot2(1, 'Personal', 'done'), dot2(2, 'Contact', 'done'), dot2(3, 'Reason', 'done'), dot2(4, 'Med history', 'active'), dot2(5, 'Meds', ''), dot2(6, 'Allergies', ''));
  const check = (label, on) => H({ gap: 8, counterAlign: 'CENTER', p: 10, radius: R.sm, stroke: on ? C.primary : C.border, fill: on ? C.primary100 : C.surface, stretch: true }, H({ w: 18, h: 18, radius: 4, fill: on ? C.primary : C.surface, stroke: on ? C.primary : C.borderStrong, counterAlign: 'CENTER', primaryAlign: 'CENTER' }, on ? T('✓', { size: 11, color: C.white, weight: 'bold' }) : null), T(label, { size: 13.5 }));
  screen('Intake form', shell('Forms & Documents', [
    backLink('Back to forms'),
    st(pageTitle('Pre-Visit Intake Form', 'For your visit with Dr. Emily Carter on May 28, 2026')),
    st(stepper),
    st(card({ p: 22, gap: 14 }, T('4. Medical history', { size: 17, weight: 'bold' }), T('Do you have any of these conditions? Check all that apply.', { size: 13, color: C.textSecondary, stretch: true }),
      st(H({ stretch: true, gap: 10 }, gr(check('Diabetes', true)), gr(check('High blood pressure', true)))),
      st(H({ stretch: true, gap: 10 }, gr(check('Asthma', false)), gr(check('Heart disease', false)))),
      st(field('Past surgeries', 'Appendectomy (2008)')),
      st(H({ stretch: true, counterAlign: 'CENTER' }, button('← Back', 'ghost'), spacer(), button('Save draft', 'secondary'), button('Continue →', 'primary'))))),
  ]));
}

// 17. MEDICAL RECORDS
function buildRecords() {
  const recNav = (label, ct, active, dis) => st(H({ stretch: true, h: 34, radius: 8, px: 10, gap: 8, counterAlign: 'CENTER', fill: active ? C.primaryLight : null }, gr(T(label, { size: 13.5, weight: active ? 'semi' : 'reg', color: dis ? C.textMuted : (active ? C.primaryDark : C.textSecondary) })), ct ? badge(ct, active ? 'green' : 'gray') : null));
  const stat = (n, l) => gr(card({ p: 14, gap: 2 }, T(n, { size: 22, weight: 'bold' }), T(l, { size: 12, color: C.textSecondary })));
  const problem = (t, m) => st(card({ p: 12, gap: 0 }, H({ stretch: true, gap: 12, counterAlign: 'CENTER' }, iconTile('🗂', C.primaryLight, C.primaryDark, 36), gr(V({ gap: 1 }, T(t, { size: 14, weight: 'semi' }), T(m, { size: 12, color: C.textSecondary }))), badge('Active', 'green'))));
  const nav = V({ name: 'RecNav', w: 220, fill: C.surface, stroke: C.border, radius: R.card, gap: 2, p: 12 },
    recNav('Health overview', '', true), recNav('Medications', '3'), recNav('Allergies', '2'), recNav('Problems', '3'), recNav('Vitals', ''), recNav('Health data / RPM', 'live'), recNav('Documents', '4'), recNav('Lab results', 'later', false, true));
  const rpm = card({}, st(H({ stretch: true, counterAlign: 'CENTER' }, gr(T('Latest readings · Health data / RPM', { size: 15, weight: 'bold' })), badge('Live', 'green'))), st(H({ stretch: true, gap: 14 }, ...[['124/78', 'Blood pressure'], ['98 mg/dL', 'Glucose'], ['146 lb', 'Weight'], ['76', 'Heart rate']].map(r => gr(V({ gap: 1 }, T(r[0], { size: 20, weight: 'bold' }), T(r[1], { size: 11.5, color: C.textMuted })))))));
  const right = gr(V({ stretch: true, gap: 16 },
    st(H({ stretch: true, gap: 12 }, stat('3', 'Active problems'), stat('3', 'Medications'), stat('2', 'Allergies'), stat('Apr 18', 'Last visit'))),
    eyebrow('Active problems'), problem('Type 2 Diabetes Mellitus', 'Since Feb 2026 · Dr. Raj Patel'), problem('Essential Hypertension', 'Since Aug 2023 · Dr. Emily Carter'), problem('Seasonal Allergic Rhinitis', 'Since Apr 2019'),
    rpm));
  screen('Medical Records', shell('Medical Records', [st(pageTitle('Medical Records', 'A patient-friendly view of your health information.', button('↓ Download summary', 'secondary'))), st(H({ stretch: true, gap: 22 }, nav, right))]));
}

// 18. PROFILE
function buildProfile() {
  const infoBox = (label, body) => gr(card({ p: 16, gap: 6 }, eyebrow(label), T(body, { size: 13.5, w: 300, lh: 21 })));
  screen('Profile', shell('Profile', [
    st(pageTitle('Profile', 'Your personal, contact, and care preferences.', button('✎ Edit profile', 'secondary'))),
    st(card({ p: 16, gap: 0 }, st(H({ gap: 14, counterAlign: 'CENTER' }, avatar('SJ', 56), gr(V({ gap: 4 }, T('Sarah Johnson', { size: 17, weight: 'bold' }), T('Patient ID PT-002841 · DOB Jan 12, 1988 · Female', { size: 12, color: C.textSecondary }), H({ gap: 6, pt: 2 }, badge('Active patient', 'green'), badge('BlueCross verified', 'blue')))))))),
    st(H({ stretch: true, gap: 16 }, infoBox('Personal information', 'Full name: Sarah Johnson\nDOB: Jan 12, 1988\nSex: Female\nPreferred language: English'), infoBox('Contact information', 'Email: sarah.johnson@email.com\nPhone: (555) 123-4567\n128 Magnolia Ave, Apt 4B\nAustin, TX 78701'))),
    st(H({ stretch: true, gap: 16 }, infoBox('Emergency contact', 'Michael Johnson (Spouse)\n(555) 987-6543'), infoBox('Preferred pharmacy', 'CVS Pharmacy — 901 Congress Ave\nPrescriptions sent here automatically.'))),
  ]));
}

// 19. SETTINGS (Features)
function buildSettings() {
  const tabs = H({ stretch: true, gap: 4, pb: 2 }, H({ px: 14, py: 10 }, T('Account', { size: 14, color: C.textSecondary })), H({ px: 14, py: 10 }, T('Password', { size: 14, color: C.textSecondary })), H({ px: 14, py: 10 }, T('Notifications & Reminders', { size: 14, color: C.textSecondary })), H({ px: 14, py: 10 }, T('Permissions', { size: 14, color: C.textSecondary })), H({ px: 14, py: 10 }, T('Features', { size: 14, weight: 'semi', color: C.primary })));
  const toggle = (on) => H({ w: 40, h: 22, radius: 11, fill: on ? C.primary : C.grey500, counterAlign: 'CENTER', primaryAlign: on ? 'MAX' : 'MIN', px: 3 }, dot(16, C.white));
  const feat = (label, desc, on, last) => st(V({ stretch: true, gap: 0 }, st(H({ stretch: true, py: 14, counterAlign: 'CENTER' }, gr(V({ gap: 2 }, T(label, { size: 14, weight: 'semi' }), T(desc, { size: 12.5, color: C.textSecondary, w: 520 }))), toggle(on))), last ? null : st(divider())));
  screen('Settings · Features', shell('Settings', [
    st(pageTitle('Settings', 'Account, notifications, and permissions.')),
    st(tabs), st(divider()),
    st(card({ gap: 0 }, T('Clinic features', { size: 17, weight: 'bold' }), T('Turn features on or off. When a feature is off it disappears from the sidebar, dashboard, and scheduling — the layout adjusts automatically.', { size: 13, color: C.textSecondary, stretch: true }), st(rect(1, 8, { fill: null })),
      feat('Messages', 'Conversations and replies from your care team', true),
      feat('E-consult', 'Asynchronous visit type, reviewed within 24–48 hours', true),
      feat('Forms & Documents', 'Assigned forms and document uploads', true),
      feat('Monitoring widget (RPM)', 'Optional remote-monitoring card on the dashboard', true),
      feat('Scheduling', 'Book scheduled video, phone, and in-person visits', true),
      feat('Payment', 'Collect copays during scheduling', true, true))),
  ]));
}

// 20. IN-CALL
function buildInCall() {
  const ctrl = (g, end) => H({ w: end ? 72 : 48, h: 48, radius: 24, fill: end ? C.danger : '#FFFFFF', fillOpacity: end ? 1 : 0.12, counterAlign: 'CENTER', primaryAlign: 'CENTER' }, T(end ? 'Leave' : g, { size: end ? 13 : 18, color: C.white, btn: !!end }));
  const stage = gr(V({ name: 'Stage', stretch: true, fill: '#0D1B1E', gap: 0, p: 18, counterAlign: 'CENTER' },
    st(H({ stretch: true, counterAlign: 'CENTER' }, H({ gap: 6, counterAlign: 'CENTER', fill: '#FFFFFF', fillOpacity: 0.1, radius: R.pill, px: 12, py: 6 }, dot(8, C.primary), T('Connected · 00:43 · Encrypted', { size: 12, color: C.white })), spacer())),
    gr(V({ stretch: true, grow: true, counterAlign: 'CENTER', primaryAlign: 'CENTER', gap: 12 }, avatar('EC', 110, C.info), T('Dr. Emily Carter', { size: 15, weight: 'semi', color: C.white }))),
    st(H({ gap: 14, primaryAlign: 'CENTER', stretch: true, py: 10 }, ctrl('🎙'), ctrl('📷'), ctrl('💬'), ctrl('👤'), ctrl('📎'), ctrl('⋯'), ctrl('', true)))));
  const chat = V({ name: 'Chat', w: 300, fill: '#0F2024', gap: 0 },
    st(H({ stretch: true, p: 14, counterAlign: 'CENTER' }, gr(T('Chat', { size: 14, weight: 'bold', color: C.white })), T('✕', { size: 14, color: C.grey700 }))),
    st(V({ stretch: true, p: 14, gap: 12, grow: true }, V({ gap: 3 }, T('Dr. Carter', { size: 11, color: C.grey700 }), H({ fill: '#1B3035', radius: 8, p: 10 }, T('Hi Sarah, can you hear me okay?', { size: 13, color: C.white, w: 200 }))), V({ gap: 3, counterAlign: 'MAX' }, T('You', { size: 11, color: C.grey700 }), H({ fill: C.primary, radius: 8, p: 10 }, T('Yes, clearly.', { size: 13, color: C.white }))))),
    st(H({ stretch: true, p: 12, gap: 8, counterAlign: 'CENTER' }, gr(H({ stretch: true, grow: true, h: 38, radius: R.sm, fill: '#1B3035', px: 12, counterAlign: 'CENTER' }, T('Type a message…', { size: 13, color: C.grey700 }))), T('▶', { size: 14, color: C.primary }))));
  screen('In-call (telemedicine)', H({ name: 'wrap', w: SCREEN_W, h: 860, fill: '#0D1B1E' }, stage, chat));
}

// ============================================================================
// LAYOUT + RUN
// ============================================================================
function pageOf(n) { while (n && n.type !== 'PAGE') n = n.parent; return n; }
async function main() {
  await loadFonts();
  let ox = 0, oy = 0, page = figma.currentPage;
  try {
    const target = figma.getNodeById('1:2');
    if (target) { const pg = pageOf(target); if (pg) { figma.currentPage = pg; page = pg; } if ('x' in target) { ox = target.x; oy = target.y + ('height' in target ? target.height : 0) + 80; } }
  } catch (e) { /* default origin */ }
  buildDashboard();
  const frame = SCREENS[SCREENS.length - 1];
  frame.x = ox; frame.y = oy; page.appendChild(frame);
  figma.currentPage.selection = [frame];
  figma.viewport.scrollAndZoomIntoView([frame]);
  figma.closePlugin('Done — added the V3 desktop dashboard.');
}
main().catch(err => { figma.notify('Error: ' + err.message); figma.closePlugin('Error: ' + err.message); });
