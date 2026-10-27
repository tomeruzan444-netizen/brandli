/* ============================================================================
   ביקורת קול - מאתרת דפוסי כתיבה שנשמעים כמו טקסט שיצא ממכונה, ודמיון בין
   עמודים שבדיקת הכפילויות לא תופסת (אותה תבנית, אותם ביטויי חתימה).
   הכללים עצמם: CONTENT-GUIDE.md, סעיף 2 ("לא להישמע כמו מכונה") וסעיף 3.

   הכלי מצביע על דפוסים, הוא לא פוסק. כל חריגה נבדקת בקריאה: ניגוד אחד
   במקום הנכון הוא כתיבה טובה, ורק ההצטברות הופכת אותו לחתימה של מכונה.

   הרצה:  node tools-voice-audit.js            דוח בלבד
          node tools-voice-audit.js --strict   יוצא עם שגיאה כשיש חריגות
   ============================================================================ */
const fs = require('fs');
const path = require('path');
const ROOT = __dirname;
const STRICT = process.argv.includes('--strict');

/* ---------------------------- ספים ---------------------------- */
const MAX_ANTITHESIS   = 2;    // "לא X אלא Y" ודומיו, לעמוד
const MAX_BOLD_CLOSERS = 1;    // פסקה שנגמרת במשפט מסקנה מודגש, לעמוד
const MAX_NUM_HEADINGS = 1;    // כותרת עם "שלושה", "ארבע" וכו', לעמוד
const MAX_YESNO_SHARE  = 0.3;  // שיעור תשובות שו"ת שנפתחות ב"כן," או "לא,"
const MAX_LABEL_PAGES  = 3;    // תווית eyebrow או מילת פתיחה של CTA, בכמה עמודים
const MAX_PHRASE_PAGES = 2;    // רצף של 5 מילים, בכמה עמודים לכל היותר
const SHINGLE = 5;

/* תוויות של רכיבים, לא של תוכן. מותר שיחזרו כמו כותרת "שאלות נפוצות" */
const COMPONENT_LABELS = new Set(['שאלות נפוצות', 'מחיר']);

/* ------------------------- דפוסים ------------------------- */
const ANTITHESIS = [
  /(?:^|\s)לא רק\s[^.;:?]{1,50}\sאלא גם\s/,      // לא רק X אלא גם Y
  /(?:^|\s)לא\s[^.;:?]{1,60}?(?:,\s*|\s)אלא\s/,   // לא X אלא Y
  /,\s*לא\s[^,;:?]{1,40}$/,                        // X, לא Y.
  /\sולא\s[^,;:?]{1,35}$/,                         // X ולא Y.
];
/* כנות שמוכרזת במקום להיות מוצגת */
const HONESTY = /לא לטובתנו|לא משרת אותנו|לא תמיד משרת|גם כשזה מוריד|נגיד לכם (?:את זה|בכנות)|ונגיד (?:לכם )?את זה|אנחנו נגיד את זה|אומרים משהו ש/g;
/* "הדבר שכולם מזניחים" */
const TROPE = /שכולם (?:מזניחים|מדלגים|שוכחים)|שהכי מזניחים|שאף אחד לא (?:סופר|קורא|עושה|מדבר)|כולם מדלגים עליו/g;
/* פתיחה בנוסח "הדבר הכי חשוב:" */
const REVEAL = /(?:^|\.\s)(?:השורה התחתונה|הסוד|הזווית|העיקר|הדבר הכי חשוב)[^.:]{0,25}:/g;
const NUMWORD = /(?:^|\s)(?:שתי|שני|שלוש|שלושה|ארבע|ארבעה|חמש|חמישה|שש|שישה|שבע|שבעה|שמונה|עשר|עשרה)(?:\s|$)/;
const BANNED = [
  'חשוב לציין', 'חשוב להדגיש', 'בעולם של היום', 'בעידן ה', 'יתרה מזאת', 'בנוסף לכך',
  'לסיכום', 'מהווה', 'מגוון רחב', 'פתרון מקיף', 'מקצה לקצה', 'חוויית משתמש',
  'באופן משמעותי', 'ללא ספק', 'אין ספק ש', 'המפתח להצלחה', 'ברמה הגבוהה ביותר',
  'מותאם אישית', 'בצורה מקצועית', 'הלכה למעשה', 'פורץ דרך', 'מהפכני',
];

/* ------------------------- עזרים ------------------------- */
const strip = s => s
  .replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<!--[\s\S]*?-->/g, ' ')
  .replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ').trim();

/* מה שחוזר בכוונה בכל עמוד לא נחשב: מסלול ניווט, חתימת הכותב, תגיות, כרטיס
   מחיר, כפתורים ושאלות השו"ת עצמן (חמש שאלות חוזרות מומלצות במדריך) */
const clean = main => main
  .replace(/<nav[\s\S]*?<\/nav>/g, ' ')
  .replace(/<div class="byline">[\s\S]*?<\/div>\s*<\/div>/g, ' ')
  .replace(/<div class="pill-tags">[\s\S]*?<\/div>/g, ' ')
  .replace(/<div class="plan"[\s\S]*?<\/div>/g, ' ')
  .replace(/<a class="btn[^"]*"[\s\S]*?<\/a>/g, ' ')
  .replace(/<summary>[\s\S]*?<\/summary>/g, ' ');

const sentences = t => t.split(/(?<=[.?!])\s+/)
  .map(s => s.replace(/[.?!]+$/, '').trim())
  .filter(s => s.split(' ').length >= 3);

const count = (t, re) => (t.match(re) || []).length;

/* ------------------------- איסוף העמודים ------------------------- */
const pages = [{ url: '/', f: 'index.html' }];
for (const e of fs.readdirSync(ROOT, { withFileTypes: true })) {
  if (!e.isDirectory() || ['assets', '.git', '.claude', 'node_modules'].includes(e.name)) continue;
  const f = path.join(e.name, 'index.html');
  if (fs.existsSync(path.join(ROOT, f))) pages.push({ url: `/${e.name}/`, f });
  /* כתבות הבלוג יושבות רמה אחת עמוק יותר: /blog/<slug>/ */
  if (e.name === 'blog') for (const s of fs.readdirSync(path.join(ROOT, 'blog'), { withFileTypes: true })) {
    const sf = path.join('blog', s.name, 'index.html');
    if (s.isDirectory() && fs.existsSync(path.join(ROOT, sf))) pages.push({ url: `/blog/${s.name}/`, f: sf });
  }
}

const rows = [], h1Template = [], ctaOpeners = new Map(), labels = new Map(), phrasePages = new Map();
const add = (map, key, url) => { if (!map.has(key)) map.set(key, new Set()); map.get(key).add(url); };

for (const p of pages) {
  const html = fs.readFileSync(path.join(ROOT, p.f), 'utf8');
  const main = (html.match(/<main[^>]*>([\s\S]*?)<\/main>/) || [, ''])[1];
  const body = clean(main);
  const text = strip(body);

  const anti = sentences(text).filter(s => ANTITHESIS.some(re => re.test(s))).length;
  const honesty = count(text, HONESTY);
  const trope = count(text, TROPE);
  const reveal = count(text, REVEAL);
  const banned = BANNED.reduce((n, w) => n + text.split(w).length - 1, 0);

  /* 25 תווים ומעלה: משפט מסקנה. הדגשה קצרה של מונח או שם אינה מסקנה */
  const boldClosers = [...body.matchAll(/<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/g)]
    .filter(m => /<strong>[^<]{25,}<\/strong>\s*\.?\s*$/.test(m[1].trim())).length;

  const numHeadings = [...body.matchAll(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/g)]
    .filter(m => NUMWORD.test(strip(m[1]))).length;

  const answers = [...main.matchAll(/<div class="faq__body"><p>([\s\S]*?)<\/p><\/div>/g)].map(m => strip(m[1]));
  const yesNo = answers.length ? answers.filter(a => /^(?:כן|לא)[,.]/.test(a)).length / answers.length : 0;

  /* כותרת ראשית בתבנית "ביטוי.<br>מטבע לשון." */
  const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [, ''])[1];
  const segs = h1.split(/<br\s*\/?>/i).map(strip).filter(Boolean);
  if (segs.length === 2 && segs.every(s => s.endsWith('.'))) h1Template.push(p.url);

  const cta = (main.match(/<div class="cta-band">[\s\S]*?<h2>([\s\S]*?)<\/h2>/) || [, ''])[1];
  if (cta) add(ctaOpeners, strip(cta).split(' ')[0], p.url);

  for (const m of main.matchAll(/<span class="eyebrow[^"]*">([^<]+)<\/span>/g))
    if (!COMPONENT_LABELS.has(m[1].trim())) add(labels, m[1].trim(), p.url);

  /* ביטויי חתימה: רצפים של 5 מילים בתוך אותו משפט ואותו רכיב בלבד, כדי שסוף
     פסקה וכותרת שאחריה לא יתחברו לביטוי שלא קיים. מחירים ותקנים מותר שיחזרו */
  const segmented = strip(body.replace(/<\/(?:p|li|h[1-6]|td|th|span|div)>/g, ' ¶ '));
  const seen = new Set();
  for (const seg of segmented.split(/[.?!:;¶]/)) {
    const tokens = seg.replace(/[,"()\[\]]/g, ' ').replace(/\d[\d,%]*/g, '#').split(/\s+/).filter(Boolean);
    for (let i = 0; i + SHINGLE <= tokens.length; i++) {
      const sh = tokens.slice(i, i + SHINGLE).join(' ');
      if (/₪|מע״מ|ת״י|#/.test(sh) || seen.has(sh)) continue;
      seen.add(sh);
      add(phrasePages, sh, p.url);
    }
  }

  const flags = [];
  if (anti > MAX_ANTITHESIS) flags.push(`${anti} ניגודים`);
  if (honesty) flags.push(`${honesty} כנות מוכרזת`);
  if (trope) flags.push(`${trope} "כולם מזניחים"`);
  if (reveal) flags.push(`${reveal} פתיחת נקודתיים`);
  if (banned) flags.push(`${banned} מילים אסורות`);
  if (boldClosers > MAX_BOLD_CLOSERS) flags.push(`${boldClosers} סיומים מודגשים`);
  if (numHeadings > MAX_NUM_HEADINGS) flags.push(`${numHeadings} כותרות ממוספרות`);
  if (yesNo > MAX_YESNO_SHARE) flags.push(`${Math.round(yesNo * 100)}% תשובות "כן,/לא,"`);
  rows.push({ url: p.url, anti, honesty, trope, boldClosers, numHeadings, yesNo, flags });
}

/* ---------------------------- דוח ---------------------------- */
const pad = (s, n) => String(s) + ' '.repeat(Math.max(0, n - String(s).length));
console.log(pad('עמוד', 36) + pad('ניגודים', 9) + pad('כנות', 6) + pad('מסקנה', 7) + pad('ממוספר', 8) + pad('כן/לא', 7) + 'סטטוס');
console.log('-'.repeat(84));
let pageViolations = 0;
for (const r of rows) {
  if (r.flags.length) pageViolations++;
  console.log(pad(r.url, 36) + pad(r.anti, 9) + pad(r.honesty, 6) + pad(r.boldClosers, 7) +
    pad(r.numHeadings, 8) + pad(Math.round(r.yesNo * 100) + '%', 7) + (r.flags.length ? 'X' : 'V'));
}

const over = (map, max) => [...map].filter(([, s]) => s.size > max).sort((a, b) => b[1].size - a[1].size);
const phrases = over(phrasePages, MAX_PHRASE_PAGES);
const badLabels = over(labels, MAX_LABEL_PAGES);
const badCta = over(ctaOpeners, MAX_LABEL_PAGES);
const h1Limit = Math.ceil(pages.length / 3);

console.log('\n' + '='.repeat(84));
console.log(`\nעמודים עם חריגות קול: ${pageViolations}/${pages.length}`);
console.log(`\nכותרת ראשית בתבנית "ביטוי. מטבע לשון.": ${h1Template.length}/${pages.length} עמודים (מותר עד ${h1Limit})`);
console.log(`\nמילת פתיחה של CTA שחוזרת ביותר מ-${MAX_LABEL_PAGES} עמודים:`);
if (!badCta.length) console.log('  אין');
badCta.forEach(([w, s]) => console.log(`  "${w}" ב-${s.size} עמודים`));
console.log(`\nתוויות eyebrow שחוזרות ביותר מ-${MAX_LABEL_PAGES} עמודים:`);
if (!badLabels.length) console.log('  אין');
badLabels.forEach(([w, s]) => console.log(`  "${w}" ב-${s.size} עמודים`));
console.log(`\nרצפים של ${SHINGLE} מילים שמופיעים ביותר מ-${MAX_PHRASE_PAGES} עמודים: ${phrases.length}`);
phrases.slice(0, 20).forEach(([sh, s]) => console.log(`  ${s.size} עמודים: "${sh}"`));

const siteViolations = (h1Template.length > h1Limit ? 1 : 0) + badCta.length + badLabels.length + phrases.length;
const total = pageViolations + siteViolations;
console.log('\n' + '-'.repeat(84));
console.log(total ? `סה"כ חריגות: ${total}` : 'אין חריגות קול.');
if (STRICT && total) process.exit(1);
