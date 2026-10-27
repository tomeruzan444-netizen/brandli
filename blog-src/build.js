/* ============================================================================
   בניית הבלוג: עמוד הראשי וכל הכתבות. מקור כל כתבה ב-posts/<slug>.html (רק ה-main),
   והמטא שלה ברשימת POSTS למטה. כתבה חדשה = קובץ ב-posts ושורה בראש POSTS.
   הרצה:  node blog-src/build.js      ואחריה ארבעת כלי הבדיקה (CONTENT-GUIDE.md סעיף 12)
   ============================================================================ */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const R = path.resolve(__dirname, '..');
const SRC = __dirname;
const S = path.join(SRC, '.build');
fs.mkdirSync(S, { recursive: true });
const B = 'https://brandli.co.il';
const he = d => { const [y, m, day] = d.split('-').map(Number);
  return `${day} ב${['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'][m - 1]} ${y}`; };

/* חדש ראשון */
const POSTS = [
  {
    slug: 'accessibility-overlays', main: 'posts/accessibility-overlays.html', date: '2026-10-27',
    title: 'תוסף נגישות לאתר: מה הוא באמת עושה, ומה נשאר שבור מתחתיו',
    metaTitle: 'תוסף נגישות לאתר | מה הוא עושה ומה הוא לא מתקן',
    desc: 'תוסף נגישות לאתר לא מתקן את הקוד שמתחתיו. מה קבעה רשות הסחר האמריקאית על accessiBe, מה מצא דוח WebAIM, ובדיקה של 10 דקות שאפשר לעשות לבד באתר שלכם היום.',
    og: 'מה תוסף נגישות באמת עושה, מה קרה ל-accessiBe, ובדיקה של 10 דקות שאפשר לעשות לבד.',
    card: 'מה קבעה רשות הסחר האמריקאית על accessiBe, מה מצאנו כשבדקנו את האתר שלנו, ובדיקה של 10 דקות לאתר שלכם.',
    about: ['Web accessibility', 'Accessibility overlays', 'WCAG', 'IS 5568'],
  },
  {
    slug: 'google-ai-overviews-clicks', main: 'posts/google-ai-overviews-clicks.html', date: '2026-10-27',
    title: 'סקירות AI של גוגל: כמה קליקים הן לוקחות מהאתר שלכם?',
    metaTitle: 'סקירות AI של גוגל | כמה קליקים הן לוקחות, לפי המחקרים',
    desc: 'סקירות AI של גוגל מורידות קליקים לאתרים, בעיקר בחיפושי שאלה. מה מצאו Pew ו-Ahrefs, מה גוגל אומרת, ואיך בודקים ב-Search Console אם זה קורה גם באתר שלכם.',
    og: 'מה המחקרים העדכניים מראים על סקירות AI וקליקים, ואיך בודקים את זה באתר שלכם.',
    card: 'מה מצאו Pew ו-Ahrefs, אילו חיפושים נפגעים, ואיך בודקים ב-Search Console אם זה קורה גם אצלכם.',
    about: ['Google AI Overviews', 'AI Mode', 'Google Search Console'],
  },
];

for (const P of POSTS) {
  const PU = `${B}/blog/${P.slug}/`;
  fs.writeFileSync(`${S}/${P.slug}-ld.json`, JSON.stringify([
    { '@type': 'BlogPosting', '@id': PU + '#article', headline: P.title, description: P.desc, url: PU,
      mainEntityOfPage: { '@id': PU + '#webpage' }, inLanguage: 'he-IL', datePublished: P.date, dateModified: P.modified || P.date,
      author: { '@id': B + '/#founder' }, publisher: { '@id': B + '/#organization' }, image: B + '/assets/img/og-image.png',
      isPartOf: { '@id': B + '/blog/#blog' }, about: P.about },
    { '@type': 'WebPage', '@id': PU + '#webpage', url: PU, name: P.metaTitle, inLanguage: 'he-IL',
      isPartOf: { '@id': B + '/#website' }, breadcrumb: { '@id': PU + '#breadcrumb' }, mainEntity: { '@id': PU + '#article' } },
    { '@type': 'BreadcrumbList', '@id': PU + '#breadcrumb', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'בית', item: B + '/' },
      { '@type': 'ListItem', position: 2, name: 'בלוג', item: B + '/blog/' },
      { '@type': 'ListItem', position: 3, name: P.title } ] },
  ]));
  fs.writeFileSync(`${S}/${P.slug}.json`, JSON.stringify({ root: R, out: `blog/${P.slug}/index.html`, shellFrom: 'websites-for-architects/index.html',
    title: P.metaTitle, description: P.desc, ogDescription: P.og, canonical: PU, ogType: 'article', main: path.join(SRC, P.main), ld: `${S}/${P.slug}-ld.json` }));
}

/* --- blog index --- */
const cards = POSTS.map(P => `        <article class="card post-card reveal">
          <time datetime="${P.date}">${he(P.date)}</time>
          <h3>${P.title}</h3>
          <p>${P.card}</p>
          <a class="link-arrow card__link" href="/blog/${P.slug}/">
            לקריאת הכתבה
            <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            <span class="sr-only">- ${P.title}</span>
          </a>
        </article>`).join('\n');
fs.writeFileSync(S + '/blog-main.built.html', fs.readFileSync(path.join(SRC, 'index-template.html'), 'utf8').replace('__POSTS__', cards));
const BU = B + '/blog/';
const bdesc = 'בלוג בניית אתרים של ברנדלי: ניתוח של שינויים בגוגל ובכלי AI לפי המקור הראשוני, מקרי בוחן אמיתיים באישור הלקוח, ומדריכים שאפשר ליישם באתר שלכם עוד השבוע.';
fs.writeFileSync(S + '/blog-ld.json', JSON.stringify([
  { '@type': 'Blog', '@id': BU + '#blog', name: 'הבלוג של ברנדלי', url: BU, inLanguage: 'he-IL', description: bdesc,
    publisher: { '@id': B + '/#organization' },
    blogPost: POSTS.map(P => ({ '@id': `${B}/blog/${P.slug}/#article` })) },
  { '@type': 'CollectionPage', '@id': BU + '#webpage', url: BU, name: 'בלוג בניית אתרים | ניתוחים, מקרי בוחן ומדריכים לעסקים', inLanguage: 'he-IL',
    isPartOf: { '@id': B + '/#website' }, breadcrumb: { '@id': BU + '#breadcrumb' }, mainEntity: { '@id': BU + '#blog' } },
  { '@type': 'BreadcrumbList', '@id': BU + '#breadcrumb', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'בית', item: B + '/' },
    { '@type': 'ListItem', position: 2, name: 'בלוג' } ] },
]));
fs.writeFileSync(S + '/blog.json', JSON.stringify({ root: R, out: 'blog/index.html', shellFrom: 'websites-for-architects/index.html',
  title: 'בלוג בניית אתרים | ניתוחים, מקרי בוחן ומדריכים לעסקים', description: bdesc,
  ogDescription: 'מה השתנה בגוגל ובכלי AI, לפי המקור עצמו, ומה כדאי לבדוק באתר שלכם בעקבות זה.',
  canonical: BU, main: S + '/blog-main.built.html', ld: S + '/blog-ld.json' }));
/* --- בנייה --- */
const build = cfg => execFileSync(process.execPath, [path.join(R, 'tools-build-page.js'), cfg], { stdio: 'inherit' });
for (const P of POSTS) build(`${S}/${P.slug}.json`);
build(S + '/blog.json');
/* הבלוג מסומן כעמוד הנוכחי בתפריט */
const bi = path.join(R, 'blog/index.html');
fs.writeFileSync(bi, fs.readFileSync(bi, 'utf8').replace('<li><a href="/blog/">בלוג</a></li>', '<li><a href="/blog/" aria-current="page">בלוג</a></li>'));
