/* ============================================================================
   בניית עמוד חדש (כתבת בלוג או עמוד נחיתה) מתוך מעטפת של עמוד קיים: head משותף,
   header ו-footer נלקחים מהעמוד shellFrom, ה-main וה-JSON-LD מגיעים מבחוץ.
   ה-FAQPage נגזר אוטומטית מהשאלות הגלויות, כדי שהניסוח יהיה זהה (סעיף 8).
   הרצה:  node tools-build-page.js <config.json>
   config: { root, out, shellFrom, title, description, ogDescription, canonical,
             ogType?, main, ld }   ld = מערך צמתים ל-@graph, בלי FAQPage ו-Person
   ============================================================================ */
const fs = require('fs');
const cfg = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const R = cfg.root;
const sib = fs.readFileSync(R + '/' + cfg.shellFrom, 'utf8');
const strip = s => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

/* תוכן עניינים: <!--TOC--> מוחלף ברשימה של כל ה-H2 שיש להם id, לפי הסדר */
let main = fs.readFileSync(cfg.main, 'utf8');
if (main.includes('<!--TOC-->')) {
  const items = [...main.matchAll(/<h2 id="([^"]+)">([\s\S]*?)<\/h2>/g)]
    .map(m => `            <li><a href="#${m[1]}">${strip(m[2])}</a></li>`).join('\n');
  main = main.replace('<!--TOC-->', `<nav class="toc" aria-labelledby="toc-title">
          <h2 id="toc-title">תוכן העניינים</h2>
          <ol>
${items}
          </ol>
        </nav>`);
}

const faq = [...main.matchAll(/<summary>([\s\S]*?)<span class="plus"[\s\S]*?<div class="faq__body"><p>([\s\S]*?)<\/p><\/div>/g)]
  .map(m => ({ '@type': 'Question', name: strip(m[1]), acceptedAnswer: { '@type': 'Answer', text: strip(m[2]) } }));

const person = JSON.parse(sib.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph']
  .find(n => n['@type'] === 'Person');

const graph = JSON.parse(fs.readFileSync(cfg.ld, 'utf8'));
if (faq.length) graph.push({ '@type': 'FAQPage', '@id': cfg.canonical + '#faq', mainEntity: faq });
graph.push(person);
const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2);

const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
let head = sib.slice(0, sib.indexOf('<script type="application/ld+json">'));
head = head
  .replace(/<title>[^<]*<\/title>/, `<title>${cfg.title}</title>`)
  .replace(/(<meta name="description" content=")[^"]*/, `$1${esc(cfg.description)}`)
  .replace(/(<link rel="canonical" href=")[^"]*/, `$1${cfg.canonical}`)
  .replace(/(<meta property="og:title" content=")[^"]*/, `$1${esc(cfg.title)}`)
  .replace(/(<meta name="twitter:title" content=")[^"]*/, `$1${esc(cfg.title)}`)
  .replace(/(<meta property="og:description" content=")[^"]*/, `$1${esc(cfg.ogDescription)}`)
  .replace(/(<meta name="twitter:description" content=")[^"]*/, `$1${esc(cfg.ogDescription)}`)
  .replace(/(<meta property="og:url" content=")[^"]*/, `$1${cfg.canonical}`);
if (cfg.ogType) head = head.replace(/(<meta property="og:type" content=")[^"]*/, `$1${cfg.ogType}`);

const ldEnd = sib.indexOf('</script>', sib.indexOf('<script type="application/ld+json">')) + '</script>'.length;
const between = sib.slice(ldEnd, sib.indexOf('<main id="main">'));
const after = sib.slice(sib.indexOf('</main>') + '</main>'.length);

fs.mkdirSync(R + '/' + cfg.out.replace(/\/index\.html$/, ''), { recursive: true });
fs.writeFileSync(R + '/' + cfg.out,
  head + '<script type="application/ld+json">\n' + json + '\n</script>' + between + main.trimEnd() + after);
console.log(cfg.out, '| faq', faq.length, '| title', [...cfg.title].length, '| desc', [...cfg.description].length);
