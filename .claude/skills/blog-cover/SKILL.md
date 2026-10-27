---
name: blog-cover
description: Create Brandli blog images in the brand's visual identity — a highly visual cover for every article (1200x630 share image + 600x315 blog card, almost no text) and illustrations inside the article (1200x675) — as clean UI mockups and data graphics drawn in code: search results page with an AI answer, Search Console trend, website with an accessibility overlay, AI chat, bar charts, icons. Use whenever a blog article is written or edited, or when asked for a cover, og:image, thumbnail, illustration, diagram or image for a blog post.
---

# תמונות לבלוג של ברנדלי

לכל כתבה יש שני סוגים של תמונות. שניהם מצוירים בקוד, בשפה של האתר, ומצולמים ב-Chrome כדי שהעברית תוצג נכון:

| סוג | גודל | רקע | איפה |
|---|---|---|---|
| **שער** (`kind: cover`) | `cover.jpg` 1200x630, `card.webp` 600x315 | כהה | שיתוף ברשתות, JSON-LD, הכרטיס בעמוד `/blog/` |
| **איור** (`kind: figure`) | `<name>.webp` 1200x675 | בהיר | בתוך הכתבה, ליד הפסקה שהוא מסביר |

**העיקרון: ויזואלי, כמעט בלי טקסט.** האיור מראה את מה שהכתבה מתארת, כמו דף תוצאות, גרף או אתר, ולא כותב אותו. טקסט מופיע רק כשהוא חלק מהתמונה עצמה: תווית בגרף, או שאילתת חיפוש בתוך מוקאפ.

**מה לא עושים:** תמונות AI, סטוק או צילומים גנריים. איור שמראה בדיוק את הרעיון של הכתבה אמין ורלוונטי יותר, וגם מזוהה מיד כברנדלי.

## איך מגדירים

הכול מוגדר ברשימת `POSTS` ב-`blog-src/build.js`, ו-`node blog-src/build.js` מייצר רק מה שהשתנה (`blog-src/covers.lock.json`).

```js
cover: { tag: 'AI וחיפוש', accent: 'cyan', scene: { type: 'serp' },
  badge: { value: '8%', label: 'לוחצים כשיש סקירת AI' } },
figures: [
  { name: 'serp-ai-box', accent: 'cyan', scene: { type: 'serp', query: 'כמה עולה להחליף צילינדר' } },
  { name: 'search-console-trend', accent: 'cyan', scene: { type: 'dashboard' } },
],
```

ובכתבה עצמה (`blog-src/posts/<slug>.html`), בתוך ה-`prose`, ליד הפסקה הרלוונטית:

```html
<figure class="post-figure">
  <img src="/blog/<slug>/serp-ai-box.webp" alt="תיאור מלא של מה שרואים" width="1200" height="675" loading="lazy" decoding="async">
  <figcaption>משפט אחד שמסביר למה האיור כאן. איור להמחשה.</figcaption>
</figure>
```

הבנייה נכשלת אם הכתבה מפנה לאיור שלא מוגדר ב-`figures`.

ניסוי של spec בודד, בלי לבנות את כל הבלוג:
`node .claude/skills/blog-cover/scripts/cover.js <spec.json> <out-dir>`

## הסצנות

| type | מה רואים | שדות | מתאים ל |
|---|---|---|---|
| `serp` | דף תוצאות, עם תיבת תשובת AI מודגשת מעל התוצאות | `query` (לא חובה) | חיפוש, סקירות AI, SEO |
| `dashboard` | גרף בסגנון Search Console, שני קווים | `upLabel`, `downLabel`, `impressions[]`, `clicks[]` (0-100) | מגמות, מדידה, ירידה בתנועה |
| `browser-a11y` | אתר עם תפריט נגישות פתוח ובעיות מסומנות באדום | (אין) | נגישות, בעיות קוד, תוספים |
| `chat` | שיחה עם צ׳טבוט שממליץ על עסקים | `question` (לא חובה) | ChatGPT, מנועי תשובות, AI |
| `bars` | עמודות אופקיות עם תוויות וערכים | `items[{label,value,key}]` (2-7), `title`, `max`, `highlightFirst` | נתונים אמיתיים מהכתבה |
| `icon` | אייקון גדול בטבעות | `icon` | כשאין סצנה שמתאימה |

אייקונים: search, ai, bot, accessibility, chart, speed, lock, ads, mail, mobile, code, pin, star, link, image, cursor, shield, check.

**סצנה חדשה:** כשנושא חוזר ואין לו סצנה טובה, מוסיפים פונקציה ל-`SCENES` ב-`scripts/cover.js`. משתמשים ברכיבים הקיימים: `.win` לחלון עם סרגל, `sk()` לקווי טקסט אפורים, `.mark` לסימון בעיה, `.okmark` לסימון תקין, `.pill` לתווית. אחרי ההוספה מוסיפים שורה לטבלה הזו.

## השער

- **badge:** מספר אחד, ותווית של עד 34 תווים. המספר חייב להופיע בכתבה, אחרי שנבדק מול המקור (`CONTENT-GUIDE.md`, סעיף 12).
- **kicker:** במקום מספר, כשאין נתון מרכזי. עד 30 תווים, ומותר `<em>` להדגשה.
- **tag:** הנושא, בשתיים או שלוש מילים.
- בלי כותרת הכתבה על השער. היא כבר מופיעה ב-`og:title` ובכרטיס.

## צבע לפי נושא

| accent | נושא |
|---|---|
| `cyan` | AI, מנועי תשובות, חיפוש בגוגל |
| `brand` | קידום אורגני, תוכן, אסטרטגיה |
| `rose` | נגישות, פרטיות, דברים שבורים באתר |
| `amber` | פרסום ממומן, תקציבים, המרות |
| `emerald` | מדריכים מעשיים, כלים, "עשו את זה עכשיו" |

לכתבה יש צבע אחד, לשער ולאיורים. לשתי כתבות רצופות אין אותו צבע ואותה סצנת שער.

## איורים בתוך כתבה

- **1 עד 3 איורים לכתבה.** מוסיפים איור רק כשהוא מסביר משהו שקשה להסביר במילים. איור לקישוט לא נכנס.
- **alt מלא:** מה רואים ומה המשמעות, כמו בסעיף הנגישות של המדריך. בגרף נתונים, ה-alt מפנה לטקסט שמכיל את המספרים.
- **figcaption כנה:** במוקאפ כותבים "איור להמחשה". בגרף נתונים כותבים מי פרסם את הנתונים. לא מציגים מוקאפ כאילו הוא צילום מסך אמיתי.
- **`bars` רק עם נתונים אמיתיים** מהכתבה. מגמה כללית בלי נתונים מציגים ב-`dashboard`, וכותבים בכיתוב שזה איור.

## בדיקה לפני פרסום

פותחים כל תמונה חדשה עם כלי Read ובודקים בעין:

- הסצנה מתאימה לרעיון
- המספר תואם לכתבה
- שום דבר לא חתוך
- תוויות ה-`bars` נכנסות בשורה

הסקריפט עצמו נכשל על:

- גודל או פורמט שגויים
- סוג סצנה, אייקון או צבע לא מוכרים
- טקסט ארוך מדי בשער

## Chrome בסביבת ענן

הסקריפט מחפש Chrome מותקן או `CHROME_PATH`, ואם לא מוצא, מוריד את `chrome-headless-shell` דרך `npx @puppeteer/browsers` לתיקיית `~/.cache/brandli-chrome`. אם זה נכשל:

- כתבה בלי שער עולה עם תמונת ברירת המחדל של האתר.
- כתבה עם איור חסר לא עולה, כי התמונה תישבר בעמוד.
