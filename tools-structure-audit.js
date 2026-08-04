/* ============================================================================
   ביקורת מבנה - JSON-LD תקין, קישורים שבורים, עוגנים, מזהים כפולים, canonical,
   כותרות H1 וכיסוי sitemap. הרצה:  node tools-structure-audit.js
   ============================================================================ */
const fs = require('fs');
const path = require('path');
const ROOT = __dirname;
const SITE = 'https://brandli.co.il';

/* כל קבצי ה-HTML, כולל אלה שבתיקיות */
function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'assets' || e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (e.name.endsWith('.html')) acc.push(p);
  }
  return acc;
}

/* הערות HTML אינן מוצגות, ולכן אינן נבדקות */
const stripComments = html => html.replace(/<!--[\s\S]*?-->/g, ' ');

const files = walk(ROOT);
let errors = 0, warn = 0;
const rel = f => path.relative(ROOT, f).replace(/\\/g, '/');

for (const file of files) {
  const f = rel(file);
  const raw = fs.readFileSync(file, 'utf8');
  const html = stripComments(raw);

  /* 1. JSON-LD תקין */
  [...raw.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].forEach((b, i) => {
    try { JSON.parse(b[1]); }
    catch (e) { console.log(`JSON-LD ERROR ${f} block ${i}: ${e.message}`); errors++; }
  });

  /* 2. אין קישורים יחסיים */
  [...html.matchAll(/(?:href|src)="(?!\/|https?:|mailto:|tel:|#|data:)([^"]+)"/g)].forEach(m => {
    console.log(`RELATIVE PATH ${f}: ${m[1]}`); errors++;
  });

  /* 3. אין שאריות .html בקישורים פנימיים */
  [...html.matchAll(/href="\/[^"]*\.html[^"]*"/g)].forEach(m => {
    console.log(`LEGACY .html LINK ${f}: ${m[0]}`); errors++;
  });

  /* 4. כל קישור שורש-מוחלט מצביע לקובץ קיים */
  [...html.matchAll(/(?:href|src)="(\/[^"#?]*)/g)].forEach(m => {
    const u = m[1];
    if (u === '/') return;
    const cands = u.endsWith('/')
      ? [path.join(ROOT, u, 'index.html')]
      : [path.join(ROOT, u), path.join(ROOT, u, 'index.html')];
    if (!cands.some(c => fs.existsSync(c))) { console.log(`BROKEN LINK ${f} -> ${u}`); errors++; }
  });

  /* 5. עוגנים באותו עמוד */
  new Set([...html.matchAll(/href="#([a-zA-Z][\w-]*)"/g)].map(m => m[1])).forEach(a => {
    if (!new RegExp(`id="${a}"`).test(html)) { console.log(`BROKEN ANCHOR ${f} -> #${a}`); errors++; }
  });

  /* 6. עוגנים בין עמודים */
  new Set([...html.matchAll(/href="(\/[\w-]*\/?)#([\w-]+)"/g)].map(m => m[1] + '|' + m[2])).forEach(pair => {
    const [u, id] = pair.split('|');
    const t = u === '/' ? path.join(ROOT, 'index.html') : path.join(ROOT, u, 'index.html');
    if (fs.existsSync(t) && !new RegExp(`id="${id}"`).test(fs.readFileSync(t, 'utf8'))) {
      console.log(`BROKEN X-ANCHOR ${f} -> ${u}#${id}`); errors++;
    }
  });

  /* 7. מזהים כפולים */
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
  [...new Set(ids.filter((v, i) => ids.indexOf(v) !== i))]
    .forEach(d => { console.log(`DUPLICATE ID ${f}: ${d}`); errors++; });

  /* 8. מטא בסיסי */
  const req = ['<title>', 'name="description"', 'lang="he" dir="rtl"'];
  if (f !== '404.html') req.push('rel="canonical"', 'property="og:title"');
  req.forEach(k => { if (!raw.includes(k)) { console.log(`MISSING META ${f}: ${k}`); warn++; } });

  /* 9. canonical תואם למיקום הקובץ */
  const can = raw.match(/rel="canonical" href="([^"]+)"/);
  if (can) {
    const expected = f === 'index.html' ? `${SITE}/` : `${SITE}/${path.dirname(f)}/`;
    if (can[1] !== expected) { console.log(`CANONICAL MISMATCH ${f}: ${can[1]} != ${expected}`); errors++; }
  }

  /* 10. H1 יחיד */
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) { console.log(`H1 COUNT ${f}: ${h1}`); warn++; }

  /* 11. תמונות עם alt */
  [...html.matchAll(/<img\b[^>]*>/g)].filter(m => !/\salt=/.test(m[0]))
    .forEach(m => { console.log(`IMG NO ALT ${f}: ${m[0].slice(0, 70)}`); errors++; });
}

/* 12. כיסוי sitemap */
const sm = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
if (/\.html<\/loc>/.test(sm)) { console.log('SITEMAP still contains .html'); errors++; }
files.filter(f => rel(f) !== '404.html').forEach(file => {
  const f = rel(file);
  const url = f === 'index.html' ? `${SITE}/` : `${SITE}/${path.dirname(f)}/`;
  if (!sm.includes(`<loc>${url}</loc>`)) { console.log(`SITEMAP MISSING: ${url}`); errors++; }
});

/* 13. llms.txt ו-webmanifest */
if (/brandli\.co\.il\/[\w-]+\.html/.test(fs.readFileSync(path.join(ROOT, 'llms.txt'), 'utf8'))) {
  console.log('llms.txt still contains .html URLs'); errors++;
}
try { JSON.parse(fs.readFileSync(path.join(ROOT, 'site.webmanifest'), 'utf8')); }
catch (e) { console.log(`JSON ERROR site.webmanifest: ${e.message}`); errors++; }

console.log(`\n== ${files.length} קבצי HTML | שגיאות: ${errors} | אזהרות: ${warn} ==`);
process.exitCode = errors ? 1 : 0;
