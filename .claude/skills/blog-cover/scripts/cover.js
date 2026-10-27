#!/usr/bin/env node
/* ============================================================================
   תמונת שער לכתבה בבלוג של ברנדלי. ממלא את template.html מתוך קובץ spec ומצלם
   אותו עם Chrome בלי ממשק, כדי שהעברית והפונט Heebo ייראו בדיוק כמו באתר (מנועי
   SVG שוברים טקסט מימין לשמאל). שני קבצים לתיקיית היעד:
     cover.jpg   1200x630, לשיתוף ברשתות (og:image) ול-JSON-LD
     card.webp   600x315, קל, לכרטיס הכתבה בעמוד הבלוג

   הרצה:  node .claude/skills/blog-cover/scripts/cover.js <spec.json> <out-dir>

   spec:
   {
     "title": "סקירות AI של גוגל: כמה קליקים הן לוקחות?",   חובה. עד כ-60 תווים
     "highlight": "כמה קליקים",                           לא חובה. מילים בצבע ההדגשה
     "tag": "AI וחיפוש",                                   חובה. תווית נושא קצרה
     "accent": "cyan",                                     brand|cyan|rose|amber|emerald
     "visual": { "type": "stat",    "value": "95.9%", "label": "...", "caption": "..." }
            |  { "type": "compare", "items": [{ "label": "...", "value": "15%", "key": false }, ...], "caption": "..." }
            |  { "type": "icon",    "icon": "search", "caption": "..." }
   }
   Chrome: CHROME_PATH, או נתיב מוכר, או הורדה של chrome-headless-shell דרך npx.
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

const ACCENTS = { brand: '#9D90FF', cyan: '#22D3EE', rose: '#FB7185', amber: '#FBBF24', emerald: '#34D399' };

/* אייקונים בקו, viewBox 24, בסגנון האייקונים שבאתר */
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
};

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fail = msg => { console.error('spec: ' + msg); process.exit(1); };

/* ---------- בדיקת ה-spec ---------- */
if (!spec.title) fail('חסר title');
if (!spec.tag) fail('חסר tag');
if ([...spec.title].length > 70) fail(`title ארוך מדי (${[...spec.title].length} תווים, עד 70). קצרו את הכותרת לתמונה`);
const accent = ACCENTS[spec.accent || 'brand'] || fail(`accent לא מוכר: ${spec.accent}`);
const v = spec.visual || { type: 'icon', icon: 'chart' };

let title = esc(spec.title);
if (spec.highlight) {
  if (!spec.title.includes(spec.highlight)) fail('highlight חייב להופיע בתוך title');
  /* מילים שלמות בלבד: "ומה" עם "מה" מודגש נראה כמו טעות. אותיות שימוש נכללות בהדגשה */
  const at = spec.title.indexOf(spec.highlight), end = at + spec.highlight.length;
  const isWordChar = ch => ch && /[\p{L}\p{N}]/u.test(ch);
  if (isWordChar(spec.title[at - 1]) || isWordChar(spec.title[end]))
    fail(`highlight מתחיל או נגמר באמצע מילה: "${spec.highlight}". כללו את המילה כולה, כולל אותיות כמו ו, ה, ב`);
  title = title.replace(esc(spec.highlight), `<em>${esc(spec.highlight)}</em>`);
}

const caption = v.caption ? `<p class="caption">${esc(v.caption)}</p>` : '';
let visual;
if (v.type === 'stat') {
  if (!v.value || !v.label) fail('stat צריך value ו-label');
  visual = `<div class="stat"><div class="stat__value">${esc(v.value)}</div><div class="stat__label">${esc(v.label)}</div></div>${caption}`;
} else if (v.type === 'compare') {
  const items = v.items || [];
  if (items.length < 2 || items.length > 3) fail('compare צריך 2 או 3 items');
  const nums = items.map(i => parseFloat(String(i.value).replace(/[^\d.]/g, '')));
  if (nums.some(isNaN)) fail('כל value ב-compare חייב להכיל מספר');
  const max = Math.max(...nums);
  const rows = items.map((i, n) => `<div class="cmp__row${i.key ? ' is-key' : ''}">
      <div class="cmp__head"><span class="cmp__label">${esc(i.label)}</span><span class="cmp__value">${esc(i.value)}</span></div>
      <div class="cmp__bar"><i style="width:${Math.max(4, Math.round(nums[n] / max * 100))}%"></i></div></div>`).join('');
  visual = `<div class="cmp">${rows}</div>${caption}`;
} else if (v.type === 'icon') {
  const paths = ICONS[v.icon] || fail(`icon לא מוכר: ${v.icon}. קיימים: ${Object.keys(ICONS).join(', ')}`);
  visual = `<div class="icon"><span class="ring"></span><span class="ring"></span><span class="ring"></span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>
      <span class="orbit" style="top:22px;left:70px"></span><span class="orbit" style="bottom:46px;right:22px;width:10px;height:10px"></span></div>${caption}`;
} else fail(`visual.type לא מוכר: ${v.type}`);

/* ---------- מילוי התבנית ---------- */
const rootUrl = 'file:///' + ROOT.replace(/\\/g, '/').replace(/^\//, '');
const html = fs.readFileSync(path.join(SKILL, 'template.html'), 'utf8')
  .replace(/__ROOT__/g, rootUrl).replace('__ACCENT__', accent)
  .replace('__TAG__', esc(spec.tag)).replace('__TITLE__', title).replace('__VISUAL__', visual);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'brandli-cover-'));
const page = path.join(tmp, 'cover.html');
fs.writeFileSync(page, html);

/* ---------- Chrome ---------- */
function findChrome() {
  const fromEnv = process.env.CHROME_PATH;
  const known = [
    fromEnv,
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
    const kind = buf.toString('ascii', 12, 16);
    if (kind === 'VP8X') return { type: 'webp', w: 1 + buf.readUIntLE(24, 3), h: 1 + buf.readUIntLE(27, 3) };
    if (kind === 'VP8 ') return { type: 'webp', w: buf.readUInt16LE(26) & 0x3FFF, h: buf.readUInt16LE(28) & 0x3FFF };
    if (kind === 'VP8L') { const b = buf.readUInt32LE(21); return { type: 'webp', w: (b & 0x3FFF) + 1, h: ((b >> 14) & 0x3FFF) + 1 }; }
  }
  return { type: 'unknown', w: 0, h: 0 };
}

const chrome = findChrome();
const dir = path.resolve(outDir);
fs.mkdirSync(dir, { recursive: true });
const url = 'file:///' + page.replace(/\\/g, '/').replace(/^\//, '');
/* אותו עמוד, פעמיים: בגודל מלא, ובחצי גודל דרך device-scale-factor */
const shots = [
  { file: 'cover.jpg', scale: 1, w: 1200, h: 630, type: 'jpeg' },
  { file: 'card.webp', scale: 0.5, w: 600, h: 315, type: 'webp' },
];
for (const s of shots) {
  const out = path.join(dir, s.file);
  const args = [/headless-shell/.test(chrome) ? '--headless' : '--headless=new', '--disable-gpu', '--hide-scrollbars',
    '--no-sandbox', `--force-device-scale-factor=${s.scale}`, '--allow-file-access-from-files',
    '--window-size=1200,630', '--virtual-time-budget=6000', `--screenshot=${out}`, url];
  execFileSync(chrome, args, { stdio: ['ignore', 'ignore', 'pipe'] });
  const buf = fs.readFileSync(out);
  const d = dims(buf);
  if (d.type !== s.type || d.w !== s.w || d.h !== s.h) fail(`${s.file} יצא ${d.type} ${d.w}x${d.h}, צריך ${s.type} ${s.w}x${s.h}`);
  console.log(`${path.relative(ROOT, out)}  ${d.w}x${d.h}  ${Math.round(buf.length / 1024)}KB`);
}
fs.rmSync(tmp, { recursive: true, force: true });
