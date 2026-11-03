/* ============================================================================
   הטופס העליון: שם מלא, תחום העסק, טלפון.
   מקום קבוע בכל עמוד: מיד אחרי הכותרת הראשית והפסקה הראשונה (p.lead או p.hero__lead).
   tools-build-page.js מוסיף אותו לכל עמוד וכתבה שנבנים, כולל הפרסום האוטומטי.
   ============================================================================ */
const FORM = `<form class="top-lead" data-validate data-lead="טופס עליון" novalidate action="#" method="post">
          <p class="top-lead__title">השאירו פרטים ונחזור אליכם</p>
          <div class="field">
            <label for="tl-name">שם מלא</label>
            <input type="text" id="tl-name" name="name" autocomplete="name" required aria-describedby="tl-e-name">
            <span class="err" id="tl-e-name" role="alert" aria-live="polite"></span>
          </div>
          <div class="field">
            <label for="tl-business">תחום העסק</label>
            <input type="text" id="tl-business" name="business" required aria-describedby="tl-e-business">
            <span class="err" id="tl-e-business" role="alert" aria-live="polite"></span>
          </div>
          <div class="field">
            <label for="tl-phone">מספר טלפון</label>
            <input type="tel" id="tl-phone" name="phone" autocomplete="tel" required dir="ltr" aria-describedby="tl-e-phone">
            <span class="err" id="tl-e-phone" role="alert" aria-live="polite"></span>
          </div>
          <input class="hp-field" type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true">
          <button class="btn btn-primary" type="submit">שליחה</button>
          <p class="form-status" role="status" aria-live="polite" tabindex="-1"></p>
          <p class="top-lead__note">בשליחה אתם מאשרים את <a href="/privacy-policy/">מדיניות הפרטיות</a> ושניצור איתכם קשר בנוגע לפנייה.</p>
        </form>`;

/* מקבל HTML של עמוד או של main, ומחזיר אותו עם הטופס במקומו */
function addLeadForm(html) {
  if (html.includes('class="top-lead"')) return html;
  const h1 = html.indexOf('</h1>');
  const lead = html.slice(h1).search(/<p class="(?:lead|hero__lead)"/);
  if (h1 < 0 || lead < 0) throw new Error('הטופס העליון לא שובץ: אין כותרת ראשית ואחריה p.lead');
  const end = html.indexOf('</p>', h1 + lead) + '</p>'.length;
  const nl = html.includes('\r\n') ? '\r\n' : '\n';
  return html.slice(0, end) + nl + nl + '        ' + FORM.replace(/\n/g, nl) + html.slice(end);
}

module.exports = { addLeadForm };
