#!/usr/bin/env node
/* ============================================================================
   תמונות לבלוג של ברנדלי: שער לכתבה, ואיורים לתוך הכתבה. ממלא את template.html
   ומצלם אותו עם Chrome בלי ממשק, כדי שהעברית והפונט Heebo ייראו כמו באתר
   (מנועי SVG שוברים טקסט מימין לשמאל).

   הרצה:  node .claude/skills/blog-cover/scripts/cover.js <spec.json> <out-dir>

   שער (kind: "cover", ברירת מחדל), רקע כהה, כמעט בלי טקסט:
     { "tag": "AI וחיפוש", "accent": "cyan",
       "badge": { "value": "8%", "label": "קליקים כשיש סקירת AI" },     לא חובה
       "kicker": "כמה קליקים <em>נשארים</em>?",                          לא חובה, עד 30 תווים
       "scene": { "type": "serp", ... } }
     פלט: cover.jpg (1200x630) ו-card.webp (600x315)

   איור לכתבה (kind: "figure"), רקע בהיר:
     { "kind": "figure", "name": "serp-ai-box", "accent": "cyan", "scene": { ... } }
     פלט: <name>.webp (1200x675)

   סוגי scene: serp, dashboard, browser-a11y, chat, bars, icon. פירוט ב-SKILL.md.
   ============================================================================ */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const SKILL = path.resolve(__dirname, '..');
const ROOT = path.resolve(SKILL, '..', '..', '..');
const [specPath, outDir] = process.argv.slice(2);
if (!specPath || !outDir) { console.error('usage: cover.js <spec.json> <out-dir>'); process.exit(1); }
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const fail = msg => { console.error('spec: ' + msg); process.exit(1); };
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const ACCENTS = { brand: '#7C6CF9', cyan: '#22D3EE', rose: '#FB7185', amber: '#FBBF24', emerald: '#34D399' };
/* על רקע בהיר צריך גוון כהה יותר כדי שיהיה ניגוד */
const ACCENTS_LIGHT = { brand: '#4F39F6', cyan: '#0891B2', rose: '#E11D48', amber: '#D97706', emerald: '#059669' };

const ICONS = {
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  ai: '<path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
  bot: '<rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 4v4M9 13h.01M15 13h.01M9 17h6"/>',
  accessibility: '<circle cx="12" cy="4.5" r="1.8"/><path d="M5 8.5c2.2.8 4.5 1.2 7 1.2s4.8-.4 7-1.2M12 9.7V14m0 0l-3 6.5M12 14l3 6.5"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  speed: '<path d="M12 14l4-4"/><path d="M3.5 18a9 9 0 1 1 17 0"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  ads: '<path d="M3 11v2a1 1 0 0 0 1 1h3l5 4V6L7 10H4a1 1 0 0 0-1 1z"/><path d="M16 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  mobile: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
  code: '<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/>',
  pin: '<path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  link: '<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
  cursor: '<path d="M5 3l14 8-6 1.5L10 19z"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  check: '<path d="M5 12l5 5 9-10"/>',
};
const svg = (name, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${extra}>${ICONS[name]}</svg>`;
const sk = (w, cls = '', style = '') => `<span class="sk ${cls}" style="width:${w};${style}"></span>`;
const winBar = '<div class="win__bar"><i></i><i></i><i></i><span class="win__url"></span></div>';

/* ============================== סצנות ============================== */
const SCENES = {
  /* דף תוצאות של מנוע חיפוש, עם תשובת AI שתופסת את החלק העליון ודוחפת את התוצאות למטה */
  serp(s, A) {
    const results = [0, 1, 2].map(n => `
      <div style="padding:18px 0;border-top:1px solid var(--line);opacity:${1 - n * 0.28}">
        ${sk('34%', 'sk--url')}<div style="height:10px"></div>${sk('58%', 'sk--title')}<div style="height:12px"></div>
        ${sk('92%')}<div style="height:8px"></div>${sk('76%')}
      </div>`).join('');
    return `<div class="win" style="inset:0">${winBar}
      <div style="padding:26px 34px 0">
        <div style="display:flex;align-items:center;gap:14px;height:54px;border-radius:27px;border:1.5px solid var(--line);padding:0 22px;box-shadow:0 6px 18px -10px rgba(27,24,64,.25)">
          <span style="color:#8288A1;display:flex">${svg('search', 'width="24" height="24"')}</span>
          ${s.query ? `<span style="font-size:21px;font-weight:600">${esc(s.query)}</span>` : sk('46%', 'sk--dark')}
        </div>
        <div style="margin-top:22px;border-radius:18px;padding:20px 22px 22px;border:2.5px solid ${A};background:color-mix(in srgb, ${A} 9%, #fff);position:relative">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
            <span style="width:34px;height:34px;border-radius:10px;background:${A};color:#fff;display:grid;place-items:center">${svg('ai', 'width="20" height="20"')}</span>
            ${sk('22%', 'sk--dark', 'height:14px')}
          </div>
          ${sk('96%', 'sk--dark')}<div style="height:10px"></div>${sk('90%', 'sk--dark')}<div style="height:10px"></div>
          ${sk('94%', 'sk--dark')}<div style="height:10px"></div>${sk('62%', 'sk--dark')}
          <div style="display:flex;gap:10px;margin-top:18px">${[0, 1, 2].map(() => `<span style="width:120px;height:34px;border-radius:10px;background:#fff;border:1px solid var(--line)"></span>`).join('')}</div>
        </div>
        ${results}
      </div>
    </div>`;
  },

  /* גרף ביצועים בסגנון Search Console: חשיפות עולות, קליקים יורדים */
  dashboard(s, A, theme) {
    const up = s.impressions || [30, 34, 33, 40, 46, 52, 58, 66, 72, 80];
    const down = s.clicks || [62, 60, 61, 55, 50, 46, 41, 37, 33, 30];
    const W = 860, H = 300, max = 100;
    const pts = arr => arr.map((v, i) => [Math.round(i * W / (arr.length - 1)), Math.round(H - v / max * H)]);
    const line = arr => pts(arr).map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ');
    const area = arr => `${line(arr)} L${W} ${H} L0 ${H} Z`;
    const brand = theme === 'light' ? '#4F39F6' : '#7C6CF9';
    const legend = (color, label) => `<span class="pill" style="background:color-mix(in srgb, ${color} 12%, #fff);color:var(--ink)">
      <span style="width:12px;height:12px;border-radius:4px;background:${color}"></span>${esc(label)}</span>`;
    return `<div class="win" style="inset:0">${winBar}
      <div style="padding:28px 36px">
        <div style="display:flex;gap:12px;align-items:center">
          ${legend(brand, s.upLabel || 'חשיפות')}${legend(A, s.downLabel || 'קליקים')}
          <span style="margin-right:auto">${sk('120px', '', 'height:30px;border-radius:15px')}</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin:24px 0 26px">
          ${[brand, A, '#C9CCE0', '#C9CCE0'].map((c, i) => `<div style="border-radius:14px;padding:16px;background:${i < 2 ? `color-mix(in srgb, ${c} 10%, #fff)` : 'var(--sk-2)'}">
            ${sk('50%', '', `height:10px;background:${i < 2 ? c : '#C9CCE0'};opacity:.7`)}<div style="height:12px"></div>${sk('70%', 'sk--dark', 'height:18px')}</div>`).join('')}
        </div>
        <svg viewBox="-6 -10 ${W + 12} ${H + 20}" width="100%" height="${s.compact ? 230 : 270}" preserveAspectRatio="none" style="direction:ltr">
          <defs>
            <linearGradient id="gu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${brand}" stop-opacity=".22"/><stop offset="1" stop-color="${brand}" stop-opacity="0"/></linearGradient>
            <linearGradient id="gd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${A}" stop-opacity=".18"/><stop offset="1" stop-color="${A}" stop-opacity="0"/></linearGradient>
          </defs>
          ${[0, 1, 2, 3].map(i => `<line x1="0" x2="${W}" y1="${i * H / 3}" y2="${i * H / 3}" stroke="#E6E8F2" stroke-width="1.5"/>`).join('')}
          <path d="${area(up)}" fill="url(#gu)"/><path d="${area(down)}" fill="url(#gd)"/>
          <path d="${line(up)}" fill="none" stroke="${brand}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="${line(down)}" fill="none" stroke="${A}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
          ${[[up, brand], [down, A]].map(([a, c]) => { const [x, y] = pts(a).at(-1); return `<circle cx="${x}" cy="${y}" r="9" fill="#fff" stroke="${c}" stroke-width="5"/>`; }).join('')}
        </svg>
      </div>
    </div>`;
  },

  /* אתר עם תפריט נגישות פתוח, והבעיות שנשארו בקוד מסומנות */
  'browser-a11y'(s, A) {
    const row = (icon, on) => `<div style="display:flex;align-items:center;gap:12px;padding:11px 0;border-top:1px solid var(--line)">
      <span style="width:34px;height:34px;border-radius:10px;background:var(--sk-2);color:#4F39F6;display:grid;place-items:center">${svg(icon, 'width="18" height="18"')}</span>
      ${sk('48%', 'sk--dark')}<span style="margin-right:auto;width:46px;height:26px;border-radius:13px;background:${on ? '#4F39F6' : '#D5D8E8'};position:relative">
      <span style="position:absolute;top:3px;${on ? 'left:3px' : 'right:3px'};width:20px;height:20px;border-radius:50%;background:#fff"></span></span></div>`;
    return `<div class="win" style="inset:0 0 0 150px">${winBar}
      <div style="padding:22px 30px">
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:26px">
          <span style="width:42px;height:42px;border-radius:12px;background:#4F39F6"></span>${sk('16%', 'sk--dark')}
          <span style="margin-right:auto;display:flex;gap:16px">${sk('60px')}${sk('60px')}${sk('60px')}</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:26px;align-items:center">
          <div>${sk('86%', 'sk--dark', 'height:22px')}<div style="height:12px"></div>${sk('64%', 'sk--dark', 'height:22px')}<div style="height:20px"></div>
            ${sk('94%')}<div style="height:9px"></div>${sk('88%')}<div style="height:9px"></div>${sk('70%')}
            <div style="position:relative;margin-top:22px;width:150px;height:46px;border-radius:12px;background:#C9CCE0">
              <span class="mark" style="top:-14px;left:-14px">!</span></div></div>
          <div style="position:relative;height:200px;border-radius:16px;background:linear-gradient(135deg,#E6E8F2,#F1F2F8);display:grid;place-items:center;color:#B4B8CF">
            ${svg('image', 'width="70" height="70" stroke-width="1.5"')}<span class="mark" style="top:-14px;right:-14px">!</span></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:28px">
          <div style="position:relative;height:50px;border-radius:12px;border:1.5px solid var(--line)"><span class="mark" style="top:-14px;right:-14px">!</span></div>
          <div style="height:50px;border-radius:12px;border:1.5px solid var(--line)"></div>
        </div>
      </div>
    </div>
    <div class="win" style="left:0;top:96px;width:300px;padding:20px 22px 12px;border-radius:20px;z-index:2">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <span style="width:40px;height:40px;border-radius:50%;background:#4F39F6;color:#fff;display:grid;place-items:center">${svg('accessibility', 'width="22" height="22"')}</span>
        ${sk('46%', 'sk--dark', 'height:14px')}</div>
      ${row('search', true)}${row('chart', false)}${row('link', true)}${row('cursor', false)}
    </div>
    <span style="position:absolute;left:118px;bottom:18px;width:72px;height:72px;border-radius:50%;background:#4F39F6;color:#fff;display:grid;place-items:center;box-shadow:0 18px 36px -12px rgba(79,57,246,.7);z-index:3">${svg('accessibility', 'width="36" height="36"')}</span>`;
  },

  /* שיחה עם צ'טבוט, והתשובה ממליצה על עסקים */
  chat(s, A) {
    const biz = n => `<div style="display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:12px;background:#fff;border:1px solid var(--line)">
      <span style="width:38px;height:38px;border-radius:10px;background:${n === 0 ? A : '#E6E8F2'}"></span>
      <div style="flex:1">${sk(n === 0 ? '60%' : '50%', 'sk--dark', 'height:13px')}<div style="height:8px"></div>
        <span style="display:flex;gap:3px;color:#FBBF24">${[0, 1, 2, 3, 4].map(() => svg('star', 'width="15" height="15" fill="currentColor" stroke-width="0"')).join('')}</span></div></div>`;
    return `<div class="win" style="inset:0">${winBar}
      <div style="padding:30px 38px;display:flex;flex-direction:column;gap:22px">
        <div style="align-self:flex-start;max-width:62%;padding:18px 22px;border-radius:20px 20px 6px 20px;background:#4F39F6">
          ${s.question ? `<span style="color:#fff;font-size:21px;font-weight:600">${esc(s.question)}</span>`
            : `${sk('240px', '', 'background:rgba(255,255,255,.55)')}<div style="height:10px"></div>${sk('170px', '', 'background:rgba(255,255,255,.55)')}`}
        </div>
        <div style="display:flex;gap:14px;align-items:flex-start;align-self:flex-end;width:80%;direction:ltr">
          <span style="flex:none;width:44px;height:44px;border-radius:50%;background:${A};color:#fff;display:grid;place-items:center">${svg('ai', 'width="24" height="24"')}</span>
          <div style="flex:1;direction:rtl;padding:20px 22px;border-radius:20px 20px 20px 6px;background:var(--sk-2)">
            ${sk('92%', 'sk--dark')}<div style="height:10px"></div>${sk('78%', 'sk--dark')}
            <div style="display:grid;gap:10px;margin-top:18px">${biz(0)}${biz(1)}${biz(2)}</div>
          </div>
        </div>
      </div>
    </div>`;
  },

  /* עמודות אופקיות עם תוויות וערכים. לאיור נתונים בתוך כתבה */
  bars(s, A) {
    const items = s.items || [];
    if (items.length < 2 || items.length > 7) fail('bars צריך בין 2 ל-7 items');
    const nums = items.map(i => parseFloat(String(i.value).replace(/[^\d.]/g, '')));
    if (nums.some(isNaN)) fail('כל value ב-bars חייב להכיל מספר');
    const max = s.max || Math.max(...nums);
    const rowH = Math.min(62, Math.floor(430 / items.length));
    return `<div class="win" style="inset:0;padding:34px 44px">
      ${s.title ? `<div style="font-size:26px;font-weight:800;margin-bottom:22px">${esc(s.title)}</div>` : ''}
      <div style="display:grid;gap:${Math.round(rowH * 0.32)}px">
        ${items.map((it, n) => `<div style="display:grid;grid-template-columns:300px 1fr 96px;align-items:center;gap:18px">
          <span style="font-size:${rowH > 50 ? 22 : 19}px;font-weight:600">${esc(it.label)}</span>
          <span style="height:${Math.round(rowH * 0.5)}px;border-radius:999px;background:var(--sk-2);overflow:hidden;display:flex">
            <i style="display:block;width:${Math.max(3, nums[n] / max * 100)}%;border-radius:inherit;background:${it.key || n === 0 && s.highlightFirst ? A : '#B9C2F5'}"></i></span>
          <span style="font-size:${rowH > 50 ? 30 : 25}px;font-weight:900;direction:ltr;text-align:left;color:${it.key || n === 0 && s.highlightFirst ? A : 'var(--ink)'}">${esc(it.value)}</span>
        </div>`).join('')}
      </div>
    </div>`;
  },

  icon(s) {
    if (!ICONS[s.icon]) fail(`icon לא מוכר: ${s.icon}. קיימים: ${Object.keys(ICONS).join(', ')}`);
    return `<div class="iconart">
      ${[460, 340, 220].map((d, i) => `<span class="ring" style="width:${d}px;height:${d}px;${i === 2 ? 'background:color-mix(in srgb, var(--accent) 16%, transparent);border:0' : ''}"></span>`).join('')}
      ${svg(s.icon, 'stroke-width="1.5"')}</div>`;
  },
};

/* ============================== הרכבה ============================== */
const kind = spec.kind || 'cover';
if (!['cover', 'figure'].includes(kind)) fail(`kind לא מוכר: ${kind}`);
const theme = kind === 'cover' ? 'dark' : 'light';
const accentKey = spec.accent || 'brand';
const A = (theme === 'light' ? ACCENTS_LIGHT : ACCENTS)[accentKey] || fail(`accent לא מוכר: ${accentKey}`);
const scene = spec.scene || fail('חסר scene');
const render = SCENES[scene.type] || fail(`scene.type לא מוכר: ${scene.type}. קיימים: ${Object.keys(SCENES).join(', ')}`);
const sceneHtml = `<div class="scene">${render(scene, A, theme)}</div>`;

let body;
if (kind === 'cover') {
  if (!spec.tag) fail('חסר tag');
  if (spec.kicker && spec.kicker.replace(/<[^>]+>/g, '').length > 30) fail('kicker ארוך מדי (עד 30 תווים). בשער כמעט אין טקסט');
  if (spec.kicker && /<(?!\/?em>)/.test(spec.kicker)) fail('ב-kicker מותר רק <em>');
  if (spec.badge && (!spec.badge.value || !spec.badge.label)) fail('badge צריך value ו-label');
  if (spec.badge && spec.badge.label.length > 34) fail('badge.label ארוך מדי (עד 34 תווים)');
  body = `${sceneHtml}
    <div class="brandbar"><span class="logo"><img src="__ROOT__/assets/img/logo.webp" alt=""></span><span class="tag">${esc(spec.tag)}</span></div>
    ${spec.badge ? `<div class="badge"><div class="badge__value">${esc(spec.badge.value)}</div><div class="badge__label">${esc(spec.badge.label)}</div></div>` : ''}
    ${spec.kicker ? `<div class="kicker">${spec.kicker}</div>` : ''}`;
} else {
  if (!/^[a-z0-9-]+$/.test(spec.name || '')) fail('figure צריך name באותיות לטיניות קטנות, ספרות ומקפים');
  body = sceneHtml;
}

const size = kind === 'cover' ? { w: 1200, h: 630 } : { w: 1200, h: 675 };
const rootUrl = 'file:///' + ROOT.replace(/\\/g, '/').replace(/^\//, '');
const html = fs.readFileSync(path.join(SKILL, 'template.html'), 'utf8')
  .replace('__BODY__', body).replace(/__ROOT__/g, rootUrl).replace(/__W__/g, size.w).replace(/__H__/g, size.h)
  .replace('__THEME__', theme).replace('__KIND__', kind).replace('__ACCENT__', A);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'brandli-cover-'));
const page = path.join(tmp, 'page.html');
fs.writeFileSync(page, html);

/* ============================== Chrome ============================== */
function findChrome() {
  const known = [
    process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser',
  ].filter(Boolean);
  for (const p of known) if (fs.existsSync(p)) return p;
  /* סביבת ענן בלי דפדפן: מורידים chrome-headless-shell פעם אחת למטמון */
  const cache = path.join(os.homedir(), '.cache', 'brandli-chrome');
  const find = dir => {
    if (!fs.existsSync(dir)) return null;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) { const r = find(p); if (r) return r; }
      else if (/^chrome-headless-shell(\.exe)?$/.test(e.name)) return p;
    }
    return null;
  };
  let bin = find(cache);
  if (!bin) {
    console.error('Chrome לא נמצא, מוריד chrome-headless-shell...');
    execFileSync('npx', ['-y', '@puppeteer/browsers@2', 'install', 'chrome-headless-shell@stable', '--path', cache],
      { stdio: 'inherit', shell: process.platform === 'win32' });
    bin = find(cache);
  }
  if (!bin) fail('לא הצלחתי למצוא או להוריד Chrome. הגדירו CHROME_PATH');
  return bin;
}

/* מידות של JPEG ו-WebP מתוך הכותרות של הקובץ, בלי ספריות */
function dims(buf) {
  if (buf[0] === 0xFF && buf[1] === 0xD8) {
    for (let i = 2; i < buf.length - 9;) {
      if (buf[i] !== 0xFF) { i++; continue; }
      const m = buf[i + 1];
      if (m >= 0xC0 && m <= 0xC3) return { type: 'jpeg', h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
      i += 2 + buf.readUInt16BE(i + 2);
    }
  }
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
    const k = buf.toString('ascii', 12, 16);
    if (k === 'VP8X') return { type: 'webp', w: 1 + buf.readUIntLE(24, 3), h: 1 + buf.readUIntLE(27, 3) };
    if (k === 'VP8 ') return { type: 'webp', w: buf.readUInt16LE(26) & 0x3FFF, h: buf.readUInt16LE(28) & 0x3FFF };
    if (k === 'VP8L') { const b = buf.readUInt32LE(21); return { type: 'webp', w: (b & 0x3FFF) + 1, h: ((b >> 14) & 0x3FFF) + 1 }; }
  }
  return { type: 'unknown', w: 0, h: 0 };
}

const chrome = findChrome();
const dir = path.resolve(outDir);
fs.mkdirSync(dir, { recursive: true });
const url = 'file:///' + page.replace(/\\/g, '/').replace(/^\//, '');
const shots = kind === 'cover'
  ? [{ file: 'cover.jpg', scale: 1, w: 1200, h: 630, type: 'jpeg' }, { file: 'card.webp', scale: 0.5, w: 600, h: 315, type: 'webp' }]
  : [{ file: `${spec.name}.webp`, scale: 1, w: 1200, h: 675, type: 'webp' }];
for (const s of shots) {
  const out = path.join(dir, s.file);
  execFileSync(chrome, [/headless-shell/.test(chrome) ? '--headless' : '--headless=new', '--disable-gpu', '--hide-scrollbars',
    '--no-sandbox', `--force-device-scale-factor=${s.scale}`, '--allow-file-access-from-files',
    `--window-size=${size.w},${size.h}`, '--virtual-time-budget=6000', `--screenshot=${out}`, url],
    { stdio: ['ignore', 'ignore', 'pipe'] });
  const buf = fs.readFileSync(out);
  const d = dims(buf);
  if (d.type !== s.type || d.w !== s.w || d.h !== s.h) fail(`${s.file} יצא ${d.type} ${d.w}x${d.h}, צריך ${s.type} ${s.w}x${s.h}`);
  console.log(`${path.relative(ROOT, out)}  ${d.w}x${d.h}  ${Math.round(buf.length / 1024)}KB`);
}
fs.rmSync(tmp, { recursive: true, force: true });
