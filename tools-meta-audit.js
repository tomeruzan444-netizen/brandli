/* ביקורת מטא: אורך, מיקום ביטוי המפתח, ייחודיות, התאמה ל-H1 ול-OG */
const fs = require('fs');
const path = require('path');
const ROOT = 'c:\\d-e-v\\brandli';

const PAGES = [
  { f: 'index.html',                       url: '/',                       kw: 'בניית אתרים' },
  { f: 'website-building/index.html',      url: '/website-building/',      kw: 'בניית אתרים' },
  { f: 'website-maintenance/index.html',   url: '/website-maintenance/',   kw: 'תחזוקת אתרים' },
  { f: 'website-management/index.html',    url: '/website-management/',    kw: 'ניהול אתרים' },
  { f: 'websites-for-doctors/index.html',  url: '/websites-for-doctors/',  kw: 'בניית אתרים לרופאים' },
  { f: 'about/index.html',                 url: '/about/',                 kw: 'חברת בניית אתרים' },
  { f: 'contact/index.html',               url: '/contact/',               kw: 'צרו קשר' },
  { f: 'privacy-policy/index.html',        url: '/privacy-policy/',        kw: 'מדיניות פרטיות' },
  { f: 'accessibility/index.html',         url: '/accessibility/',         kw: 'הצהרת נגישות' },
  { f: 'websites-for-lawyers/index.html', url: '/websites-for-lawyers/', kw: 'בניית אתרים לעורכי דין' },
  { f: 'websites-for-accountants/index.html', url: '/websites-for-accountants/', kw: 'בניית אתרים לרואי חשבון' },
  { f: 'websites-for-locksmiths/index.html', url: '/websites-for-locksmiths/', kw: 'בניית אתרים למנעולנים' },
  { f: 'websites-for-electricians/index.html', url: '/websites-for-electricians/', kw: 'בניית אתרים לחשמלאים' },
  { f: 'websites-for-business-consultants/index.html', url: '/websites-for-business-consultants/', kw: 'בניית אתרים ליועצים עסקיים' },
  { f: 'websites-for-architects/index.html', url: '/websites-for-architects/', kw: 'בניית אתרים לאדריכלים' },
  { f: 'blog/index.html', url: '/blog/', kw: 'בלוג בניית אתרים' },
  { f: 'blog/google-ai-overviews-clicks/index.html', url: '/blog/google-ai-overviews-clicks/', kw: 'סקירות AI של גוגל' },
  { f: 'blog/accessibility-overlays/index.html', url: '/blog/accessibility-overlays/', kw: 'תוסף נגישות לאתר' },
  { f: 'ecommerce-websites/index.html', url: '/ecommerce-websites/', kw: 'בניית אתרי מסחר' },
  { f: 'business-automation/index.html', url: '/business-automation/', kw: 'אוטומציות לעסקים' },
  { f: 'crm-system/index.html', url: '/crm-system/', kw: 'בניית מערכת CRM לעסק' },
  { f: 'ai-agents/index.html', url: '/ai-agents/', kw: 'שירות סוכני AI' },
  { f: 'automation-consulting/index.html', url: '/automation-consulting/', kw: 'ייעוץ אוטומציה' },
  { f: 'organic-seo/index.html', url: '/organic-seo/', kw: 'קידום אורגני לעסקים' },
  { f: 'seo-consultant/index.html', url: '/seo-consultant/', kw: 'יועץ קידום אתרים' },
  { f: 'ai-website-building/index.html', url: '/ai-website-building/', kw: 'בניית אתרים בבינה מלאכותית' },
  { f: 'websites-for-cosmeticians/index.html', url: '/websites-for-cosmeticians/', kw: 'בניית אתר לקוסמטיקאיות' },
  { f: 'brochure-website/index.html', url: '/brochure-website/', kw: 'בניית אתר תדמית' },
  { f: 'sales-website/index.html', url: '/sales-website/', kw: 'בניית אתר מכירות' },
];

const strip = s => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const grab = (html, re) => { const m = html.match(re); return m ? m[1].trim() : null; };

const titles = new Map(), descs = new Map();
let issues = 0;

for (const p of PAGES) {
  const html = fs.readFileSync(path.join(ROOT, p.f), 'utf8');
  const title = grab(html, /<title>([\s\S]*?)<\/title>/);
  const desc  = grab(html, /<meta name="description" content="([^"]*)"/);
  const ogT   = grab(html, /<meta property="og:title" content="([^"]*)"/);
  const ogD   = grab(html, /<meta property="og:description" content="([^"]*)"/);
  const h1    = strip(grab(html, /<h1[^>]*>([\s\S]*?)<\/h1>/) || '');

  const flags = [];
  if (title.length > 60) flags.push(`כותרת ארוכה (${title.length})`);
  if (title.length < 30) flags.push(`כותרת קצרה (${title.length})`);
  if (desc.length > 160) flags.push(`תיאור ארוך (${desc.length})`);
  if (desc.length < 150) flags.push(`תיאור קצר (${desc.length})`);
  if (!title.includes(p.kw)) flags.push('ביטוי המפתח חסר בכותרת');
  else if (title.indexOf(p.kw) > 12) flags.push(`ביטוי המפתח לא בהתחלה (תו ${title.indexOf(p.kw)})`);
  if (!desc.includes(p.kw)) flags.push('ביטוי המפתח חסר בתיאור');
  if (!h1.includes(p.kw) && p.kw !== 'חברת בניית אתרים' && p.kw !== 'צרו קשר') flags.push('ביטוי המפתח חסר ב-H1');
  /* BRAND_IN_TITLE: שם המותג לא מופיע בכותרות. המקום שלו הוא og:site_name וה-JSON-LD */
  if (/ברנדלי|Brandli/i.test(title)) flags.push('שם המותג בכותרת');
  if (titles.has(title)) flags.push('כותרת כפולה עם ' + titles.get(title));
  if (descs.has(desc)) flags.push('תיאור כפול עם ' + descs.get(desc));
  if (!ogT) flags.push('חסר og:title');
  if (!ogD) flags.push('חסר og:description');
  titles.set(title, p.url); descs.set(desc, p.url);

  issues += flags.length;
  console.log(`\n${p.url}   [${p.kw}]`);
  console.log(`  title (${title.length}): ${title}`);
  console.log(`  desc  (${desc.length}): ${desc}`);
  console.log(`  h1        : ${h1}`);
  console.log(`  ${flags.length ? '⚠  ' + flags.join(' | ') : '✓  תקין'}`);
}

console.log(`\n===== סה"כ ממצאים: ${issues} =====`);
