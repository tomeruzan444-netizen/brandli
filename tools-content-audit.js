/* ============================================================================
   ביקורת תוכן - בודקת את כללי מדריך התוכן (CONTENT-GUIDE.md) על כל עמודי האתר.
   הרצה:  node tools-content-audit.js
   ============================================================================ */
const fs = require('fs');
const path = require('path');
const ROOT = __dirname;

const PAGES = [
  { f: 'index.html',                      url: '/',                      kw: 'בניית אתרים',        minLinks: 5 },
  { f: 'website-building/index.html',     url: '/website-building/',     kw: 'בניית אתרים',        minLinks: 3 },
  { f: 'website-maintenance/index.html',  url: '/website-maintenance/',  kw: 'תחזוקת אתרים',       minLinks: 3 },
  { f: 'website-management/index.html',   url: '/website-management/',   kw: 'ניהול אתרים',        minLinks: 3 },
  { f: 'websites-for-doctors/index.html', url: '/websites-for-doctors/', kw: 'בניית אתרים לרופאים', minLinks: 3 },
  { f: 'about/index.html',                url: '/about/',                kw: 'ברנדלי',             minLinks: 3 },
  { f: 'contact/index.html',              url: '/contact/',              kw: 'צרו קשר',            minLinks: 2 },
  { f: 'privacy-policy/index.html',       url: '/privacy-policy/',       kw: 'מדיניות פרטיות',     minLinks: 2 },
  { f: 'accessibility/index.html',        url: '/accessibility/',        kw: 'הצהרת נגישות',       minLinks: 2 },

  /* עמודי נחיתה לפי ביטוי */
  { f: 'websites-for-lawyers/index.html', url: '/websites-for-lawyers/', kw: 'בניית אתרים לעורכי דין', minLinks: 3 },
  { f: 'websites-for-accountants/index.html', url: '/websites-for-accountants/', kw: 'בניית אתרים לרואי חשבון', minLinks: 3 },
  { f: 'websites-for-locksmiths/index.html', url: '/websites-for-locksmiths/', kw: 'בניית אתרים למנעולנים', minLinks: 3 },
  { f: 'websites-for-electricians/index.html', url: '/websites-for-electricians/', kw: 'בניית אתרים לחשמלאים', minLinks: 3 },
  { f: 'websites-for-business-consultants/index.html', url: '/websites-for-business-consultants/', kw: 'בניית אתרים ליועצים עסקיים', minLinks: 3 },
  { f: 'ecommerce-websites/index.html', url: '/ecommerce-websites/', kw: 'בניית אתרי מסחר', minLinks: 3 },
  { f: 'business-automation/index.html', url: '/business-automation/', kw: 'אוטומציות לעסקים', minLinks: 3 },
  { f: 'organic-seo/index.html', url: '/organic-seo/', kw: 'קידום אורגני לעסקים', minLinks: 3 },
  { f: 'seo-consultant/index.html', url: '/seo-consultant/', kw: 'יועץ קידום אתרים', minLinks: 3 },
  { f: 'ai-website-building/index.html', url: '/ai-website-building/', kw: 'בניית אתרים בבינה מלאכותית', minLinks: 3 },
  { f: 'brochure-website/index.html', url: '/brochure-website/', kw: 'בניית אתר תדמית', minLinks: 3 },
];

const MIN_KW = 5;
const MIN_FAQ = 4;
const MAX_P_WORDS = 60;

/* גוף שלישי על עצמנו. המדריך מחייב גוף ראשון רבים בכל גוף הטקסט. */
const THIRD_PERSON = /ברנדלי\s+(?:בונה|מספקת|מציעה|מלווה|אינה|פועלת|מחזיקה|מנהלת|עוסקת|מסייעת|רואה|נותנת|כותבת|מתחברת|בודקת|מאחסנת|מתחזקת|מוודאת|לא מוכרת|לא עושה)/g;

/* חריגים מאושרים (סעיף 2 במדריך): הביוגרפיה של תומר נכתבת בגוף שלישי */
const VOICE_ALLOW = ['ברנדלי נולדה'];

/* ------------------------- עזרים ------------------------- */
const mainOf = html => {
  const m = html.match(/<main[^>]*>([\s\S]*?)<\/main>/);
  return m ? m[1] : '';
};

const visibleText = frag => frag
  .replace(/<script[\s\S]*?<\/script>/g, ' ')
  .replace(/<style[\s\S]*?<\/style>/g, ' ')
  .replace(/<!--[\s\S]*?-->/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/\s+/g, ' ')
  .trim();

const countAll = (hay, needle) => {
  let n = 0, i = 0;
  while ((i = hay.indexOf(needle, i)) !== -1) { n++; i += needle.length; }
  return n;
};

/* ------------------------- הביקורת ------------------------- */
let problems = 0;
const rows = [];

for (const p of PAGES) {
  const file = path.join(ROOT, p.f);
  if (!fs.existsSync(file)) { console.log(`חסר קובץ: ${p.f}`); problems++; continue; }

  const html = fs.readFileSync(file, 'utf8');
  const main = mainOf(html);
  const text = visibleText(main);
  const flags = [];

  /* 1. צפיפות הביטוי המרכזי */
  const kwCount = countAll(text, p.kw);
  if (kwCount < MIN_KW) flags.push(`ביטוי מרכזי ${kwCount}/${MIN_KW}`);

  /* 2. מקפים ארוכים */
  // U+2013 = מקף בינוני, U+2014 = מקף ארוך. נכתבים כקוד ולא כתו, כדי שהקובץ עצמו יישאר נקי.
  const emdash = (html.match(/[\u2013\u2014]/g) || []).length;
  if (emdash) flags.push(`${emdash} מקפים ארוכים`);

  /* 3. שאלות ותשובות + התאמה ל-JSON-LD */
  const faqQs = [...main.matchAll(/<summary>([\s\S]*?)<span class="plus"/g)]
    .map(m => visibleText(m[1]));
  if (faqQs.length < MIN_FAQ) flags.push(`רק ${faqQs.length} שאלות נפוצות (מינימום ${MIN_FAQ})`);

  const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map(m => { try { return JSON.parse(m[1]); } catch { return null; } })
    .filter(Boolean);
  const faqNode = ld.flatMap(o => o['@graph'] || [o]).find(n => n && n['@type'] === 'FAQPage');
  if (faqQs.length && !faqNode) flags.push('אין FAQPage ב-JSON-LD');
  else if (faqNode) {
    const ldQs = (faqNode.mainEntity || []).map(q => q.name);
    const missing = faqQs.filter(q => !ldQs.includes(q));
    if (missing.length) flags.push(`${missing.length} שאלות לא תואמות ל-JSON-LD: "${missing[0].slice(0, 34)}..."`);
  }

  /* 4. קישוריות פנימית מתוך הטקסט (בלי breadcrumbs) */
  const prose = main.replace(/<nav[\s\S]*?<\/nav>/g, ' ');
  const links = new Set(
    [...prose.matchAll(/href="(\/[a-z0-9-]*\/)"/g)].map(m => m[1]).filter(u => u !== p.url)
  );
  if (links.size < p.minLinks) flags.push(`רק ${links.size} קישורים פנימיים (מינימום ${p.minLinks})`);

  /* 5. אורך פסקאות */
  // שימו לב: הביטוי מחייב רווח או סוגר מיד אחרי ה-p, אחרת הוא תופס גם <path> של SVG
  const longPs = [...main.matchAll(/<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/g)]
    .map(m => visibleText(m[1]))
    .filter(t => t.split(' ').length > MAX_P_WORDS);
  if (longPs.length) flags.push(`${longPs.length} פסקאות ארוכות מ-${MAX_P_WORDS} מילים`);

  /* 6. רשימת תבליטים */
  const lists = (main.match(/<ul[^>]*>/g) || []).length;
  if (!lists) flags.push('אין אף רשימת תבליטים');

  /* 7. סימני קריאה */
  const bangs = (text.match(/!/g) || []).length;
  if (bangs) flags.push(`${bangs} סימני קריאה`);

  /* 8. גוף ראשון (סעיף 2 במדריך) */
  const thirdPerson = [...main.matchAll(/<(?:p|li|h2|h3)(?:\s[^>]*)?>([\s\S]*?)<\/(?:p|li|h2|h3)>/g)]
    .map(m => visibleText(m[1]))
    .flatMap(t => [...t.matchAll(THIRD_PERSON)].map(x => x[0]))
    .filter(hit => !VOICE_ALLOW.some(a => hit.startsWith(a)));
  if (thirdPerson.length) {
    flags.push(`${thirdPerson.length} מופעי גוף שלישי: "${thirdPerson[0]}"`);
  }

  if (flags.length) problems += flags.length;
  rows.push({ url: p.url, kw: `${kwCount}`, faq: `${faqQs.length}`, links: `${links.size}`, words: `${text.split(' ').length}`, flags });
}

/* ==========================================================================
   בדיקה חוצת-עמודים: תוכן כפול
   גוגל מוריד בדירוג עמודים שחוזרים זה על זה. כאן משווים כל פסקה מול כל פסקה
   בשאר העמודים לפי חפיפת רצפים של 6 מילים (shingles).
   ========================================================================== */
const SHINGLE = 6;
const DUP_THRESHOLD = 0.55;   // חפיפה מעל זה נחשבת לשכפול
const MIN_WORDS = 14;         // פסקאות קצרות מדי אינן מעניינות

const shingles = words => {
  const s = new Set();
  for (let i = 0; i + SHINGLE <= words.length; i++) s.add(words.slice(i, i + SHINGLE).join(' '));
  return s;
};
const overlap = (a, b) => {
  if (!a.size || !b.size) return 0;
  let hit = 0;
  for (const g of a) if (b.has(g)) hit++;
  return hit / Math.min(a.size, b.size);
};

/* בלוקי פרטי קשר (NAP) אמורים להיות זהים בין עמודים. עקביות בכתובת,
   בטלפון ובדוא״ל היא סיגנל חיובי ל-SEO מקומי, לא תוכן משוכפל. */
const isContactBlock = t =>
  /יגאל אלון 94/.test(t) || /0\d{2}-\d{3}-\d{4}/.test(t) || /@brandli\.co\.il/.test(t);

/* קרדיט המחבר הוא boilerplate שחוזר בכל עמוד, כמו הפוטר. הוא אינו תוכן גוף
   ואינו נחשב לשכפול. מוסר מהבדיקה כדי שלא יטביע ממצאים אמיתיים. */
const stripBoilerplate = m => m.replace(/<div class="byline">[\s\S]*?<\/div>\s*<\/div>/g, ' ');

const paras = [];
for (const p of PAGES) {
  const file = path.join(ROOT, p.f);
  if (!fs.existsSync(file)) continue;
  const main = stripBoilerplate(mainOf(fs.readFileSync(file, 'utf8')));
  [...main.matchAll(/<(?:p|li)(?:\s[^>]*)?>([\s\S]*?)<\/(?:p|li)>/g)].forEach(m => {
    const text = visibleText(m[1]);
    const words = text.split(' ').filter(Boolean);
    if (words.length < MIN_WORDS || isContactBlock(text)) return;
    paras.push({ url: p.url, text, sh: shingles(words) });
  });
}

const dups = [];
for (let i = 0; i < paras.length; i++) {
  for (let j = i + 1; j < paras.length; j++) {
    if (paras[i].url === paras[j].url) continue;          // חזרה בתוך עמוד אינה שכפול חוצה עמודים
    const score = overlap(paras[i].sh, paras[j].sh);
    if (score >= DUP_THRESHOLD) dups.push({ a: paras[i], b: paras[j], score });
  }
}
dups.sort((x, y) => y.score - x.score);

/* ------------------------- פלט ------------------------- */
const pad = (s, n) => String(s) + ' '.repeat(Math.max(0, n - String(s).length));
console.log(pad('עמוד', 26) + pad('מילים', 8) + pad('ביטוי', 8) + pad('שו״ת', 8) + pad('קישורים', 10) + 'סטטוס');
console.log('-'.repeat(78));
for (const r of rows) {
  console.log(pad(r.url, 26) + pad(r.words, 8) + pad(r.kw, 8) + pad(r.faq, 8) + pad(r.links, 10) +
    (r.flags.length ? 'X' : 'V'));
  for (const f of r.flags) console.log('    - ' + f);
}
console.log('-'.repeat(78));

console.log(`\nתוכן כפול בין עמודים (מתוך ${paras.length} פסקאות):`);
if (!dups.length) {
  console.log('  אין. כל פסקה באתר ייחודית לעמוד שלה.');
} else {
  problems += dups.length;
  for (const d of dups.slice(0, 12)) {
    console.log(`  ${Math.round(d.score * 100)}%  ${d.a.url}  <->  ${d.b.url}`);
    console.log(`        "${d.a.text.slice(0, 88)}..."`);
  }
  if (dups.length > 12) console.log(`  ...ועוד ${dups.length - 12} זוגות`);
}

console.log('-'.repeat(78));
console.log(problems ? `סה"כ ממצאים: ${problems}` : 'כל העמודים עומדים בכללי מדריך התוכן.');
process.exitCode = problems ? 1 : 0;
