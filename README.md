# ברנדלי - אתר תדמית (HTML סטטי)

אתר מלא בעברית (RTL) לחברת ברנדלי - בניית אתרים, אחסון, אבטחה, ניהול ותחזוקת אתרים.
אפס תלויות, אפס שלב build, כתובות נקיות (`/about/` ולא `/about.html`).

> **חובה להריץ דרך שרת.** בגלל הכתובות הנקיות והנתיבים המוחלטים (`/assets/...`),
> פתיחה ישירה של קובץ ב-`file://` כבר לא עובדת. ראו "הרצה מקומית" למטה.

---

## ⚠️ מה חייבים להחליף לפני עלייה לאוויר

כל פרטי החברה באתר **הומצאו** לצורך ההדגמה. יש להחליף אותם לפני פרסום:

| מה | ערך נוכחי (מומצא) | איפה |
|---|---|---|
| שם משפטי + ח.פ. | ברנדלי טכנולוגיות בע״מ, 516482301 | JSON-LD, פוטר, מדיניות פרטיות |
| טלפון ראשי | 073-374-2200 | כל העמודים (header, footer, CTA) |
| תמיכה טכנית | 073-374-2201 | contact.html |
| מוקד חירום | 073-374-2299 | contact.html |
| וואטסאפ | 054-800-2200 (`wa.me/972548002200`) | כפתור צף בכל עמוד + contact.html |
| דוא״ל | info@ / support@ / privacy@ / accessibility@brandli.co.il | כל העמודים |
| כתובת | יגאל אלון 94, מגדל אלון 1, קומה 12, תל אביב-יפו | פוטר, JSON-LD, contact, legal |
| קואורדינטות | 32.0715, 34.7938 | JSON-LD ב-index.html |
| רשתות חברתיות | `linkedin.com/company/brandli` וכו׳ | פוטר + `sameAs` ב-JSON-LD |
| רכז נגישות | "אורי לביא" | accessibility.html |
| מחירים | 349-24,900 ₪ | עמודי השירותים + llms.txt |
| נתונים סטטיסטיים | +420 אתרים, 99.9%, 8 שנים, 96% | index.html, about.html |

> **חריג אחד:** פרטי המייסד בעמוד אודות (תומר אוזן, הרקע והחזון) הם **אמיתיים**
> ואין להחליף אותם. מה שכן חסר שם הוא תמונה אמיתית: יש להחליף את הריבוע עם
> האות בקובץ `about/index.html` בתמונה של המייסד. ראו את ההערה בקוד.

**דרך מהירה למצוא הכל:** חפשו בפרויקט את המחרוזות `073-374`, `brandli.co.il`, `יגאל אלון`, `516482301`.

### שלושה דברים נוספים שחייבים טיפול

1. **ההמלצות ב-`index.html`** (סעיף `#testimonials`) הן טקסט דמה. יש להחליף בהמלצות
   אמיתיות ומאושרות בכתב. מסיבה זו **לא הוטמע** `Review` / `AggregateRating` ב-Schema -
   סימון כזה על המלצות שאינן אמיתיות מפר את הנחיות גוגל.
2. **טופס יצירת הקשר** (`contact.html`) עושה כרגע ולידציה בצד לקוח בלבד ומציג הודעת הצלחה
   מדומה. יש לחבר אותו ל-endpoint אמיתי ולהוסיף הגנת ספאם. ראו `assets/js/main.js`, סעיף 7.
3. **מסמכים משפטיים** - `privacy-policy.html` ו-`accessibility.html` נכתבו כתשתית מקצועית
   אך אינם ייעוץ משפטי. יש להעביר אותם לבדיקת עו״ד בתחום הגנת הפרטיות והנגישות.

---

## בקרת איכות

שלוש בדיקות אוטומטיות, ללא תלויות. מריצים אותן לפני כל פרסום:

```bash
node tools-structure-audit.js   # JSON-LD, קישורים שבורים, עוגנים, canonical, sitemap
node tools-content-audit.js     # כללי מדריך התוכן
node tools-meta-audit.js        # אורכי כותרות ותיאורים, ביטוי מפתח
```

`tools-content-audit.js` בודק שבעה דברים בכל עמוד: צפיפות ביטוי המפתח, מקפים
ארוכים, התאמה בין השאלות הגלויות ל-`FAQPage` שב-JSON-LD, מספר קישורים פנימיים,
אורך פסקאות, קיום רשימות וסימני קריאה. בנוסף הוא מריץ שתי בדיקות רוחביות:

- **גוף ראשון.** מדווח על כל מקום שבו כתוב "ברנדלי עושה" במקום "אנחנו עושים".
- **תוכן כפול.** משווה כל פסקה באתר מול כל פסקה בשאר העמודים לפי חפיפת רצפים
  של 6 מילים, ומדווח על חפיפה מעל 55%. בלוקי פרטי קשר מוחרגים, כי עקביות
  בכתובת ובטלפון היא דווקא סיגנל חיובי.

### מדריך התוכן

[CONTENT-GUIDE.md](CONTENT-GUIDE.md) הוא מקור האמת לכל טקסט באתר. קוראים אותו
לפני כתיבה, מעדכנים אותו אחרי סבב תוכן. שם נמצאים קול המותג, כללי הייחודיות,
מפת ביטויי המפתח, בנק העובדות והצ׳קליסט.

### Skill לקישוריות פנימית

`.claude/skills/internal-linking/` מכיל Skill שמופעל בעבודה על קישורים פנימיים.
הוא מחזיק את מפת הבעלות על הנושאים, כללי טקסט עוגן, שלושה דפוסי קישור שעובדים
ותהליך עבודה עם אימות. העיקרון שבבסיסו: כותבים את הפסקה קודם ומחפשים קישור
אחר כך, לא להפך.

---

## מבנה הפרויקט

כל עמוד הוא תיקייה עם `index.html` בתוכה - כך הכתובת נקייה **בלי שום הגדרת שרת**,
בכל אחסון שהוא (Apache, nginx, Netlify, Vercel, S3, GitHub Pages).

```
brandli/
├── index.html                        →  /
├── about/index.html                  →  /about/
├── contact/index.html                →  /contact/
├── website-building/index.html       →  /website-building/        (#ai-seo, #plans)
├── website-maintenance/index.html    →  /website-maintenance/     (#security, #care-plans)
├── website-management/index.html     →  /website-management/      (#hosting)
├── websites-for-doctors/index.html   →  /websites-for-doctors/    (#med-includes)
├── privacy-policy/index.html         →  /privacy-policy/
├── accessibility/index.html          →  /accessibility/
├── 404.html                          עמוד שגיאה (נטען ע״י השרת, לא ע״י קישור)
│
│   עמודי נחיתה ממוקדי ביטוי, כל אחד עם זווית תוכן משלו:
├── websites-for-lawyers/             →  /websites-for-lawyers/
├── websites-for-accountants/         →  /websites-for-accountants/
├── websites-for-locksmiths/          →  /websites-for-locksmiths/
├── websites-for-electricians/        →  /websites-for-electricians/
├── websites-for-business-consultants/ → /websites-for-business-consultants/
├── brochure-website/                 →  /brochure-website/
├── ecommerce-websites/               →  /ecommerce-websites/
├── business-automation/              →  /business-automation/
├── organic-seo/                      →  /organic-seo/
├── seo-consultant/                   →  /seo-consultant/
├── ai-website-building/              →  /ai-website-building/
│
├── assets/
│   ├── css/style.css           מערכת העיצוב כולה (מקור אמת יחיד)
│   ├── js/main.js              ניווט, scroll-spy, סליידר, טפסים, נגישות
│   └── img/
│       ├── logo.webp           הלוגו בהדר ובפוטר, 382×112, רקע שקוף
│       ├── Brandli Logo-selection.png   קובץ המקור שממנו נגזר logo.webp
│       ├── favicon.svg
│       ├── icon-192/512, icon-maskable-512, apple-touch-icon   נוצרים מ-favicon.svg
│       ├── og-image.svg        מקור
│       └── og-image.png        1200×630 לשיתוף ברשתות
│
├── robots.txt                  כולל אישור מפורש לסוכני AI
├── sitemap.xml
├── llms.txt                    תקציר האתר לסוכני בינה מלאכותית
├── site.webmanifest
└── .htaccess                   HTTPS, דחיסה, קאשינג, כותרות אבטחה (Apache)
```

---

## הרצה מקומית

```bash
python -m http.server 4173
# או
npx serve .
```

ואז לפתוח `http://localhost:4173`. שני השרתים מגישים `about/index.html` בכתובת
`/about/` ומפנים אוטומטית מ-`/about`. **פתיחת קובץ ישירות (`file://`) לא תעבוד** -
הנתיבים באתר מוחלטים מהשורש.

### על הלוכסן בסוף

הכתובות הן `/about/` ולא `/about`. זה מה שמתקבל כשמגישים תיקייה עם `index.html`,
וזו התנהגות ברירת המחדל של Hugo, Jekyll, Astro ורוב מחוללי האתרים.
שרת שמקבל `/about` מפנה אוטומטית ל-`/about/` (301), כך שגם הכתובת הקצרה עובדת.

רוצים דווקא `/about` בלי לוכסן? זה אפשרי רק עם קבצים שטוחים (`about.html`) +
rewrite בצד השרת - כלומר תלות ב-Apache/nginx. בחרתי במבנה התיקיות כי הוא לא יכול
להישבר בהעברה בין אחסונים.

---

## העלאה לאוויר

### אחסון Apache (cPanel / Plesk - נפוץ בישראל)
העלו את כל התיקייה ל-`public_html`. הכתובות הנקיות יעבדו מיד גם בלי `.htaccess`,
כי מדובר בתיקיות אמיתיות. `.htaccess` מוסיף מעל זה: HTTPS, הסרת www, דחיסה,
קאשינג, כותרות אבטחה, עמוד 404, והפניות 301 מכתובות ישנות
(`/about.html` ו-`/about/index.html` → `/about/`) כדי למנוע תוכן כפול.
בדקו שהמודולים `mod_rewrite`, `mod_deflate`, `mod_expires` ו-`mod_headers` פעילים.

### Netlify / Vercel / Cloudflare Pages
גררו את התיקייה. אין build command ואין publish directory מיוחד, והכתובות הנקיות
עובדות מעצמן. `.htaccess` לא ייקרא - צרו במקומו `_headers` / `netlify.toml` /
`vercel.json` עם אותן כותרות אבטחה (ה-CSP נמצא ב-`.htaccess` ואפשר להעתיק ממנו כלשונו).

> **מצב נוכחי באוויר:** האתר מוגש מ-Vercel ואין בפרויקט `vercel.json`, כלומר
> **כותרות האבטחה שב-`.htaccess` אינן פעילות בפרודקשן**. נבדק מול התגובה החיה:
> חוזרת `Strict-Transport-Security` בלבד, ללא CSP, ללא `X-Content-Type-Options`
> וללא `Referrer-Policy`. ה-`.htaccess` נשמר מעודכן כדי שיהיה נכון אם יעברו
> לאחסון Apache, ובמקביל שווה ליצור `vercel.json` שיחיל את אותן כותרות.

### מדידה: Meta Pixel

הפיקסל של Meta מוטמע ב-`<head>` של כל 21 העמודים, מזהה `329110551037026`.
הוא שולח `PageView` בלבד. אירועי המרה כמו `Lead` עדיין לא מחוברים, כי טופס
יצירת הקשר אינו שולח לשום endpoint (ראו "שלושה דברים שחייבים טיפול").

**שלושה דברים שחשוב לדעת לפני שנוגעים בו:**

1. **שינוי בסקריפט מחייב hash חדש ל-CSP.** ה-`script-src` שב-`.htaccess` מכיל
   `sha256` מדויק של הקוד. תו אחד שמשתנה, כולל רווח, והדפדפן יחסום את הפיקסל.
   לחישוב מחדש: לוקחים את הטקסט שבין `<script>` ל-`</script>` בדיוק כמו שהוא ומריצים
   `sha256` בקידוד base64.
2. **אין באתר מנגנון הסכמה.** הפיקסל נטען לכל מבקר מיד עם הכניסה. תיקון 13 לחוק
   הגנת הפרטיות ו-GDPR מצפים להסכמה מראש לעוגיות שיווק. מי שרוצה לסגור את הפער
   צריך באנר הסכמה שמפעיל את הפיקסל רק אחרי אישור.
3. **מדיניות הפרטיות עודכנה בהתאם** - סעיפים 3, 4 ו-5. אם מסירים את הפיקסל, יש
   להסיר גם את ההצהרות עליו.

### אחרי העלייה - צ׳קליסט SEO
1. עדכנו את הדומיין בכל מקום אם הוא אינו `brandli.co.il`
   (`<link rel="canonical">`, `og:url`, `sitemap.xml`, `robots.txt`, `llms.txt`, JSON-LD).
2. **Google Search Console כבר מוכן לאימות.** תג האימות מוטמע ב-`<head>` של כל
   העמודים. אחרי שהאתר עולה לדומיין, נכנסים ל-[Search Console](https://search.google.com/search-console),
   בוחרים באפשרות **HTML tag** ולוחצים "אמת". **אין להסיר את התג** גם אחרי
   האימות: גוגל בודק אותו מחדש מדי פעם, והסרתו מבטלת את הבעלות.
   לאחר האימות הגישו את `sitemap.xml`.
3. אותו דבר ב-[Bing Webmaster Tools](https://www.bing.com/webmasters) (מזין גם את Copilot).
4. הריצו את [בודק התוצאות העשירות](https://search.google.com/test/rich-results) על כל עמוד שירות.
5. פתחו ואמתו **Google Business Profile** - קריטי ל-SEO מקומי בישראל.
6. חברו GA4 (זכרו להרחיב את ה-`script-src` וה-`connect-src` ב-CSP שב-`.htaccess`).
7. הריצו PageSpeed Insights וודאו ציון ירוק ב-Core Web Vitals.

---

## מה נעשה למען SEO ו-GEO (נראות במנועי AI)

### מפת ביטויי מפתח (עמוד = ביטוי אחד)

לכל עמוד ביטוי מרכזי אחד שהוא "בעליו". הביטוי מופיע **בתחילת ה-title, בתיאור וב-H1** -
שלושת הסיגנלים החזקים ביותר. כך נמנעת קניבליזציה בין עמודים שמתחרים על אותה מילה.

| עמוד | ביטוי מרכזי |
|---|---|
| `/` | בניית אתרים, אחסון ותחזוקת אתרים (ביטוי-מטרייה) |
| `/website-building/` | בניית אתרים לעסקים |
| `/website-maintenance/` | תחזוקת אתרים |
| `/website-management/` | ניהול אתרים / אחסון מנוהל |
| `/websites-for-doctors/` | בניית אתרים לרופאים |
| `/about/` · `/contact/` | מותג (ברנדלי) |

עמוד הבית מכוון בכוונה לביטוי המשולב ולא ל"בניית אתרים" לבדו - אחרת הוא היה מתחרה
בעמוד השירות הייעודי על אותה שאילתה.

**אורכים:** כל הכותרות 39-54 תווים, כל התיאורים 134-155 תווים - בטווח שגוגל מציג
בלי לקצץ. הרצת `node` על סקריפט הביקורת שב-README בודקת את זה מחדש.

### ביצועים

עמוד הבית שוקל **70KB דחוס** ונטען ב-**4 בקשות מדומיין אחד**: HTML, CSS ושני קבצי גופן.
אין אף משאב מדומיין חיצוני.

**הגופן מאוחסן מקומית.** `assets/fonts/` מכיל את Heebo Variable בשתי תת-קבוצות,
עברית ולטינית, שמכסות יחד את טווח המשקלים 400-900 בשני קבצים בלבד. זה חוסך שני
חיבורים חיצוניים (`fonts.googleapis.com` ו-`fonts.gstatic.com`) ומחזור תשובה של
גיליון סגנונות לפני שהדפדפן בכלל מגלה מה שם קובץ הגופן. שני הקבצים מוגדרים כ-`preload`
ומוגשים עם `font-display: swap`. הגופן ברישיון SIL OFL שמתיר אחסון עצמי, ראו
`assets/fonts/OFL.txt`.

**אנימציות רק כשיש JavaScript.** סקריפט inline קטן ב-`<head>` מוסיף מחלקה `js`
לתגית ה-`html`, וכל כללי אנימציית החשיפה תלויים בה (`.js .reveal`). כך מקטע שלם
לא נעלם אם הסקריפט נחסם, נכשל או טרם רץ. **אם משנים את הסקריפט הזה**, יש לעדכן את
ה-hash שלו ב-CSP שב-`.htaccess`, אחרת הדפדפן יחסום אותו:

```bash
node -e "console.log(require('crypto').createHash('sha256').update(\"document.documentElement.classList.add('js')\").digest('base64'))"
```

**SEO קלאסי**
- `<title>` ו-`description` ייחודיים לכל עמוד, `canonical` מוחלט, Open Graph ו-Twitter Card.
- HTML סמנטי: `header`/`nav`/`main`/`section`/`footer`, `h1` יחיד בכל עמוד, היררכיית כותרות תקינה.
- `sitemap.xml`, `robots.txt`, עמוד 404 מותאם, breadcrumbs ויזואליים + `BreadcrumbList`.
- טעינה מהירה: אפס JS חיצוני, CSS יחיד, גופן נטען ללא חסימת רינדור, SVG inline במקום תמונות.
- נגישות מלאה (ת״י 5568 / WCAG 2.0 AA) - משפיעה ישירות על דירוג.

**GEO - נראות ב-ChatGPT, Gemini, Perplexity ו-Copilot**
- `robots.txt` מאשר במפורש את `GPTBot`, `OAI-SearchBot`, `ClaudeBot`, `PerplexityBot`,
  `Google-Extended`, `Applebot-Extended` ועוד. (חסימה בשוגג של אלה היא הטעות הנפוצה ביותר.)
- `llms.txt` - תקציר מובנה של החברה, השירותים, המחירים והתשובות הנפוצות.
- JSON-LD מלא בכל עמוד: `Organization`, `WebSite`, `ProfessionalService`, `Service`,
  `FAQPage`, `BreadcrumbList`, `ContactPage`, `AboutPage`, `speakable` - עם `@id` מקושרים
  כדי שכל העמודים יזוהו כישות אחת.
- **בלוק הגדרה** (`.definition`) בראש כל עמוד שירות: תשובה מלאה ועצמאית בפסקה אחת -
  בדיוק הפורמט שמנועי תשובות מצטטים.
- טבלאות השוואה ומחירים כטקסט אמיתי (לא תמונות), ושאלות נפוצות בניסוח שאלה→תשובה.
- כל התוכן נמצא ב-HTML הראשוני ונקרא גם בלי JavaScript.

---

## מערכת העיצוב

כל הטוקנים נמצאים ב-`:root` בראש `assets/css/style.css`:

```css
--brand: #4F39F6;   /* אינדיגו - צבע ראשי           */
--ink:   #1B1840;   /* נייבי כהה - רקעים ומשטחים    */
--cyan:  #06B6D4;   /* ציאן - הדגשות ו-CTA משני     */
--rose:  #F43F5E;   /* ורוד-אדום - מספרים ונקודות   */
```

שינוי הצבעים בארבע השורות האלה משנה את כל האתר. הגופן הוא **Heebo** (Google Fonts).

### הלוגו

הלוגו הוא SVG מוטבע (inline) ולא קובץ תמונה - הוא נשאר חד בכל גודל ובכל מסך.
הוא מורכב משני חלקים:

1. **הסמל** - אריח מעוגל בכחול-לילה `#2E2870` עם מונוגרמה **B** גאומטרית בלבן.
   נמצא בכל קובץ HTML פעמיים (header + footer) וגם ב-`assets/img/favicon.svg`
   וב-`assets/img/og-image.svg`.
2. **שם המותג** - טקסט HTML רגיל (`Brandli`) שמעוצב ב-CSS כאותיות גדולות עם ריווח
   רחב (`.brand-logo__text`). מוגדר כטקסט ולא כתמונה כדי שיהיה נגיש, ניתן לבחירה
   ולחיפוש. מנעול הכיוון `direction: ltr` שומר על הסמל משמאל לשם גם באתר RTL.

**לשינוי צבע הסמל:** חפשו `#2E2870` בפרויקט (מופיע ב-HTML, ב-favicon וב-og-image).
**לשינוי גודל או ריווח השם:** `.brand-logo` ו-`.brand-logo__text` ב-`style.css`.
**גרסה על רקע כהה:** החליפו את מילוי ה-`rect` ל-`#fff` ואת מילוי ה-`path` ל-`#2E2870`,
והוסיפו `color:#fff` ל-`.brand-logo__text`.

**רכיבים לשימוש חוזר:** `.btn` (`-primary`/`-outline`/`-white`/`-ghost-light`),
`.card` (+`--feature`/`--row`), `.bento` (+`__wide`/`__full`), `.compare`, `.plan`,
`.faq`, `.definition`, `.callout`, `.timeline` (ציר אנכי), `.stat-band`, `.stats`,
`.cta-band`, `.quotes-grid` + `.quote`, `.eyebrow`, `.table-wrap` + `table.data`,
`.checklist`, `.scroll-progress`.

### הוספת עמוד חדש
צרו תיקייה חדשה (למשל `seo/`) והעתיקו לתוכה `index.html` מעמוד שירות קיים
(למשל `website-management/index.html`). אחר כך:
1. עדכנו `<title>`, `description`, `canonical` (`https://brandli.co.il/seo/`),
   `og:*` ואת כל כתובות ה-JSON-LD.
2. הוסיפו את העמוד ל-`sitemap.xml`, ל-`llms.txt` ולתפריט (ב-**כל** העמודים -
   ה-header משוכפל בכל קובץ, זו העלות של אתר ללא build).
3. הוסיפו breadcrumbs + `BreadcrumbList`.
4. כל הקישורים והנכסים בקובץ חייבים להיות מוחלטים מהשורש: `/assets/...`, `/contact/`.
   נתיב יחסי יישבר, כי הקובץ יושב עכשיו עמוק תיקייה אחת.

---

## נגישות

- תוסף נגישות מובנה (כפתור צף שמאלי): הגדלת טקסט, ניגודיות גבוהה, הדגשת קישורים,
  גופן קריא, עצירת אנימציות, סמן גדול. ההעדפות נשמרות ב-`localStorage`.
- קישור "דילוג לתוכן", ניווט מקלדת מלא, `:focus-visible` ברור, תוויות ARIA,
  טפסים עם `aria-invalid` ו-`role="alert"`, כיבוד `prefers-reduced-motion`.
- **חשוב:** התוסף אינו תחליף לבדיקת נגישות אנושית. לפני עלייה לאוויר מומלץ סקר
  נגישות של מורשה נגישות שירות (בהתאם לתקנות שוויון זכויות).

---

## תמיכה בדפדפנים

Chrome, Edge, Firefox ו-Safari בגרסאות עדכניות (מחשב ונייד).
נעשה שימוש ב-`inset-inline`, `dvh`, `:focus-visible` ו-`backdrop-filter` - כולם נתמכים
בכל הדפדפנים המודרניים ומתדרדרים בחן בגרסאות ישנות.
