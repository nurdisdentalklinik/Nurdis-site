/* =========================================================
   NUR DİŞ — DOKTORLAR v19
   • Yönetici panelinden doktor ekleme / düzenleme
   • Fotoğraf, diploma/sertifika yükleme
   • Uzmanlık, deneyim, eğitim bilgileri
   • Hasta puanlama ve yorum
   • Randevu → hekim seçimi entegrasyonu
========================================================= */

const DOKTOR_UZMANLIK = [
  "İmplantoloji", "Çene Cerrahisi", "Kanal Tedavisi (Endodonti)",
  "Ortodonti", "Protez (Protetik Diş Tedavisi)", "Periodontoloji",
  "Pedodonti (Çocuk Diş Hekimliği)", "Estetik Diş Hekimliği",
  "Ağız, Diş ve Çene Radyolojisi", "Restoratif Diş Tedavisi", "Genel Diş Hekimliği"
];

const DOKTOR_UNVAN = [
  "Diş Hekimi", "Dt.", "Doç. Dr.", "Prof. Dr.", "Dr. Öğr. Üyesi", "Uzm. Dt."
];

/* ---------------- VERİ KATMANI ---------------- */

function doktorSeed() {
  if (state.doctors && state.doctors.length) {
    // Eski kayıtlara eksik alanları tamamla
    let d = false;
    state.doctors.forEach(x => {
      if (!x.uzmanliklar) { x.uzmanliklar = []; d = true; }
      if (x.aktif === undefined) { x.aktif = true; d = true; }
      if (!x.puanlar) { x.puanlar = []; d = true; }
      if (!x.diplomalar) { x.diplomalar = []; d = true; }
    });
    if (d) doktorKaydet();
    return;
  }

  /* İlk kurulum: mevcut DOCTORS dizisinden aktar */
  state.doctors = (typeof DOCTORS !== "undefined" ? DOCTORS : []).map((d, i) => ({
    id: d.id || ("dr_" + i),
    unvan: "Dt.",
    adSoyad: (d.name || "").replace(/^(Dt\.|Doç\. Dr\.|Prof\. Dr\.)\s*/, "").trim(),
    brans: "Genel Diş Hekimliği",
    uzmanliklar: ["Genel Diş Hekimliği"],
    unvanTam: d.title || "Diş Hekimi",
    foto: d.photo || "",
    mezuniyet: d.school || "",
    deneyim: d.experience || "",
    ilgiAlanlari: d.focus || "",
    biyografi: d.bio || "",
    diplomalar: [],
    puanlar: [],
    hastaSayisi: 0,
    sira: i,
    aktif: true
  }));
  doktorKaydet();
}

function doktorlar() {
  doktorSeed();
  return (state.doctors || []).filter(d => d.aktif !== false).sort((a, b) => accNum(a.sira) - accNum(b.sira));
}

function tumDoktorlar() {
  doktorSeed();
  return (state.doctors || []).sort((a, b) => accNum(a.sira) - accNum(b.sira));
}

function doktorBul(id) {
  return (state.doctors || []).find(d => d.id === id);
}

function doktorKaydet() {
  localStorage.setItem("nurdis_doctors", JSON.stringify(state.doctors || []));
  if (typeof saveAccountingToFirebase === "function") saveAccountingToFirebase();
}

/* Ortalama puan */
function doktorPuan(d) {
  const p = (d.puanlar || []).map(x => accNum(x.puan)).filter(x => x > 0);
  if (!p.length) return { ort: 0, adet: 0, dagilim: [0, 0, 0, 0, 0] };
  const dagilim = [0, 0, 0, 0, 0];
  p.forEach(x => { if (x >= 1 && x <= 5) dagilim[x - 1]++; });
  return {
    ort: p.reduce((a, b) => a + b, 0) / p.length,
    adet: p.length,
    dagilim
  };
}

/* Bu doktorun hastaları (randevulardan) */
function doktorHastaSayisi(d) {
  const set = new Set();
  (state.appointments || []).forEach(a => {
    if (a.doctor === d.id && a.name) set.add((a.phone || a.name).trim());
  });
  (state.accounting && state.accounting.incomes || []).forEach(x => {
    if (x.doctor === d.id) set.add((x.firm || x.description || "").trim());
  });
  return set.size;
}

/* ---------------- RENDER: DOKTORLAR (hasta tarafı) ---------------- */

function renderDoctorsV2() {
  const liste = doktorlar();

  const kartlar = liste.map(d => {
    const p = doktorPuan(d);
    const uzman = (d.uzmanliklar || []).length
      ? d.uzmanliklar
      : (d.brans ? [d.brans] : []);

    return `<div class="card p4 mb3" style="overflow:hidden;">
      <div data-action="doktor-detay" data-id="${d.id}" style="display:flex;gap:13px;cursor:pointer;align-items:flex-start;">
        ${d.foto
          ? `<img src="${d.foto}" alt="${escapeAttr(d.adSoyad || "")}" style="width:88px;height:88px;border-radius:16px;object-fit:cover;object-position:center 22%;flex-shrink:0;border:2px solid var(--line);background:#fff;" />`
          : `<div style="width:88px;height:88px;border-radius:16px;background:linear-gradient(135deg,#E3F2F7,#D5EBE7);display:flex;align-items:center;justify-content:center;font-size:34px;flex-shrink:0;">👨‍⚕️</div>`}
        <div style="flex:1;min-width:0;">
          <p style="font-size:15.5px;font-weight:800;margin:0;line-height:1.3;color:#123;">${escapeHtml((d.unvan ? d.unvan + " " : "") + (d.adSoyad || ""))}</p>
          <p style="font-size:11px;color:var(--tealLight);font-weight:600;margin:3px 0 0;">${escapeHtml(d.unvanTam || d.brans || "Diş Hekimi")}</p>

          ${p.adet > 0
            ? `<div style="display:flex;align-items:center;gap:4px;margin-top:5px;">
                 <span style="font-size:12px;color:#FFB300;">${"★".repeat(Math.round(p.ort))}${"☆".repeat(5 - Math.round(p.ort))}</span>
                 <span style="font-size:10.5px;font-weight:700;color:#555;">${p.ort.toFixed(1)}</span>
                 <span style="font-size:9.5px;color:#999;">(${p.adet})</span>
               </div>`
            : `<p style="font-size:9.5px;color:#bbb;margin:5px 0 0;">Henüz değerlendirilmedi</p>`}

          <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px;">
            ${uzman.slice(0, 2).map(u => `<span style="font-size:8.5px;background:#E0F2F1;color:#00695C;padding:2px 7px;border-radius:9px;font-weight:600;">${escapeHtml(u)}</span>`).join("")}
            ${uzman.length > 2 ? `<span style="font-size:8.5px;color:#888;padding:2px 4px;">+${uzman.length - 2}</span>` : ""}
          </div>
        </div>
        <span style="font-size:16px;color:#ccc;flex-shrink:0;">›</span>
      </div>

      ${d.deneyim ? `<p style="font-size:10.5px;color:#666;margin:9px 0 0;padding-top:9px;border-top:1px solid var(--line);">🎓 ${escapeHtml(d.deneyim)}</p>` : ""}
    </div>`;
  }).join("") || `<div class="card p5" style="text-align:center;">
      <div style="font-size:44px;margin-bottom:10px;">👨‍⚕️</div>
      <p class="name" style="font-size:14px;margin:0 0 4px;">Henüz doktor eklenmedi</p>
      <p class="desc" style="margin:0;">Yönetici panelinden eklenebilir</p>
    </div>`;

  return `${topbar("Doktorlarımız", "Kliniğimizde görev yapan uzman hekimler", { back: "home" })}
    <div class="content">
      ${kartlar}

      <div class="card p4" style="background:#E3F2FD;border:1px solid #90CAF9;">
        <p style="font-size:11px;color:#0D47A1;margin:0;line-height:1.65;">
          💡 <b>Doktorunu seç:</b> Randevu alırken hekim tercihini belirtebilirsin.
          Her hekimin uzmanlık alanı ve hasta değerlendirmeleri aşağıda.
        </p>
      </div>
    </div>`;
}

/* ---------------- DOKTOR DETAY ---------------- */

function renderDoktorDetay() {
  const d = doktorBul(state.doktorId);
  if (!d) return `${topbar("Doktor", "", { back: "doctors" })}<div class="content"><p class="footnote">Doktor bulunamadı.</p></div>`;

  const p = doktorPuan(d);
  const yorumlar = (d.puanlar || []).filter(x => x.yorum).slice().reverse();
  const hasta = doktorHastaSayisi(d);
  const uzman = (d.uzmanliklar || []).length ? d.uzmanliklar : [d.brans || "Genel Diş Hekimliği"];

  const dagilimBar = p.adet > 0 ? p.dagilim.slice().reverse().map((adet, i) => {
    const yildiz = 5 - i;
    const yuzde = p.adet ? (adet / p.adet) * 100 : 0;
    return `<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
      <span style="font-size:9.5px;width:22px;color:#777;">${yildiz}★</span>
      <div style="flex:1;height:8px;background:#F0F0F0;border-radius:4px;overflow:hidden;">
        <div style="height:100%;width:${yuzde}%;background:#FFB300;border-radius:4px;"></div>
      </div>
      <span style="font-size:9px;width:16px;text-align:right;color:#999;">${adet}</span>
    </div>`;
  }).join("") : "";

  const yorumKartlari = yorumlar.slice(0, 10).map(y => `
    <div class="card p3 mb2">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
        <div style="flex:1;min-width:0;">
          <p style="font-size:11.5px;font-weight:700;margin:0;">${escapeHtml(y.ad || "Hasta")}</p>
          <p style="font-size:9px;color:#999;margin:2px 0 0;">${accTarihTR(y.tarih)}</p>
          <p style="font-size:10.5px;color:#444;margin:5px 0 0;line-height:1.5;">"${escapeHtml(y.yorum)}"</p>
        </div>
        <span style="font-size:11px;color:#FFB300;flex-shrink:0;">${"★".repeat(accNum(y.puan))}</span>
      </div>
    </div>`).join("");

  const diplomalar = (d.diplomalar || []).map((dp, i) => `
    <div class="card p3 mb2">
      <div style="display:flex;gap:10px;align-items:center;">
        ${dp.tip === "image" && dp.dataUrl
          ? `<img src="${dp.dataUrl}" alt="" style="width:60px;height:60px;object-fit:cover;border-radius:8px;flex-shrink:0;border:1px solid var(--line);cursor:pointer;" data-action="diploma-gor" data-id="${d.id}" data-i="${i}" />`
          : `<div style="width:60px;height:60px;border-radius:8px;background:#FFF8E1;display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0;">📜</div>`}
        <div style="flex:1;min-width:0;">
          <p style="font-size:11.5px;font-weight:700;margin:0;">${escapeHtml(dp.ad || "Belge")}</p>
          <p style="font-size:9.5px;color:#888;margin:2px 0 0;">${escapeHtml(dp.kurum || "")}${dp.yil ? " · " + escapeHtml(dp.yil) : ""}</p>
        </div>
      </div>
    </div>`).join("");

  return `
    <div class="topbar" style="background:linear-gradient(135deg,#0B6E86,#0E93AC);">
      <div class="topbar-inner">
        <button class="backbtn" data-action="goto" data-screen="doctors" style="position:relative;">←</button>
        <div style="flex:1;">
          <p class="eyebrow" style="color:rgba(255,255,255,.8);">Nur Diş Kliniği</p>
          <h1 class="title" style="font-size:17px;line-height:1.3;">${escapeHtml((d.unvan ? d.unvan + " " : "") + (d.adSoyad || ""))}</h1>
          <p class="subtitle" style="margin:2px 0 0;">${escapeHtml(d.unvanTam || "")}</p>
        </div>
      </div>
      ${scallop()}
    </div>

    <div class="content" style="padding-bottom:90px;">
      ${d.foto
        ? `<img src="${d.foto}" alt="" style="width:140px;height:140px;border-radius:50%;object-fit:cover;object-position:center 22%;display:block;margin:0 auto 14px;border:4px solid #fff;box-shadow:0 4px 14px rgba(11,110,134,.15);cursor:zoom-in;" data-action="open-lightbox" data-src="${d.foto}" />`
        : `<div style="width:140px;height:140px;border-radius:50%;background:linear-gradient(135deg,#E3F2F7,#D5EBE7);display:flex;align-items:center;justify-content:center;font-size:56px;margin:0 auto 14px;">👨‍⚕️</div>`}

      ${p.adet > 0 ? `
      <div style="text-align:center;margin-bottom:16px;">
        <div style="font-size:19px;color:#FFB300;letter-spacing:2px;">${"★".repeat(Math.round(p.ort))}${"☆".repeat(5 - Math.round(p.ort))}</div>
        <p style="font-size:13px;font-weight:800;margin:3px 0 0;">${p.ort.toFixed(1)} / 5</p>
        <p style="font-size:10px;color:#888;margin:2px 0 0;">${p.adet} hasta değerlendirmesi</p>
      </div>` : ""}

      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:14px;">
        <div class="card p2" style="text-align:center;">
          <p style="font-size:8.5px;color:#666;margin:0;">DENEYİM</p>
          <p style="font-size:12px;font-weight:800;color:#0B6E86;margin:3px 0 0;">${escapeHtml((d.deneyim || "—").replace(/ yıllık klinik deneyim\.?/i, " yıl"))}</p>
        </div>
        <div class="card p2" style="text-align:center;">
          <p style="font-size:8.5px;color:#666;margin:0;">HASTA</p>
          <p style="font-size:12px;font-weight:800;color:#0B6E86;margin:3px 0 0;">${hasta}</p>
        </div>
        <div class="card p2" style="text-align:center;">
          <p style="font-size:8.5px;color:#666;margin:0;">UZMANLIK</p>
          <p style="font-size:12px;font-weight:800;color:#0B6E86;margin:3px 0 0;">${uzman.length}</p>
        </div>
      </div>

      <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:14px;">
        ${uzman.map(u => `<span style="font-size:10px;background:#E0F2F1;color:#00695C;padding:5px 11px;border-radius:14px;font-weight:700;">${escapeHtml(u)}</span>`).join("")}
      </div>

      ${d.biyografi ? `<div class="card p4 mb3">
        <p style="font-size:12px;font-weight:800;color:#0B6E86;margin:0 0 7px;">👨‍⚕️ Hakkında</p>
        <p style="font-size:11px;color:#444;margin:0;line-height:1.8;">${escapeHtml(d.biyografi).replace(/\n/g, "<br/>")}</p>
      </div>` : ""}

      ${d.mezuniyet ? `<div class="card p4 mb3">
        <p style="font-size:12px;font-weight:800;color:#0B6E86;margin:0 0 7px;">🎓 Eğitim</p>
        <p style="font-size:11px;color:#444;margin:0;line-height:1.7;">${escapeHtml(d.mezuniyet)}</p>
      </div>` : ""}

      ${d.ilgiAlanlari ? `<div class="card p4 mb3">
        <p style="font-size:12px;font-weight:800;color:#0B6E86;margin:0 0 7px;">🔬 İlgi Alanları</p>
        <p style="font-size:11px;color:#444;margin:0;line-height:1.7;">${escapeHtml(d.ilgiAlanlari)}</p>
      </div>` : ""}

      ${(d.diplomalar || []).length ? `<div class="mb3">
        <p class="section-label">📜 Diploma & Sertifikalar (${d.diplomalar.length})</p>
        ${diplomalar}
      </div>` : ""}

      ${p.adet > 0 ? `<div class="card p4 mb3">
        <p style="font-size:12px;font-weight:800;color:#0B6E86;margin:0 0 9px;">📊 Değerlendirme Dağılımı</p>
        ${dagilimBar}
      </div>` : ""}

      ${yorumlar.length ? `<div class="mb3">
        <p class="section-label">💬 Hasta Yorumları (${yorumlar.length})</p>
        ${yorumKartlari}
      </div>` : ""}

      <button class="btn-primary mb3" style="background:#FFB300;" data-action="doktor-puanla" data-id="${d.id}">⭐ Bu Doktoru Değerlendir</button>
      <button class="btn-primary" style="background:#0B6E86;" data-action="goto" data-screen="booking">📅 Randevu Al</button>
    </div>`;
}

/* ---------------- RENDER: YÖNETİCİ DOKTOR YÖNETİMİ ---------------- */

function renderAccDoktor() {
  const liste = tumDoktorlar();
  const aktif = liste.filter(d => d.aktif !== false).length;

  const ed = state.doktorEdit;
  let formHtml = "";

  if (ed !== null && ed !== undefined) {
    const d = liste.find(x => x.id === ed) || {
      id: "", unvan: "Dt.", adSoyad: "", brans: "Genel Diş Hekimliği",
      unvanTam: "Diş Hekimi", foto: "", mezuniyet: "", deneyim: "",
      ilgiAlanlari: "", biyografi: "", uzmanliklar: [], aktif: true
    };

    formHtml = `<div class="card p4 mb3" style="border:2px solid #0B6E86;background:#E0F7FA;">
      <p style="font-size:13px;font-weight:700;margin:0 0 10px;color:#006064;">${d.id ? "✏️ Doktoru Düzenle" : "➕ Yeni Doktor"}</p>

      <div style="display:grid;grid-template-columns:80px 1fr;gap:8px;">
        <div class="field"><label>Ünvan</label>
          <select class="input" id="dp-unvan" style="font-size:11px;">
            ${DOKTOR_UNVAN.map(u => `<option ${d.unvan === u ? "selected" : ""}>${u}</option>`).join("")}
          </select>
        </div>
        <div class="field"><label>Ad Soyad *</label>
          <input class="input" id="dp-ad" value="${escapeAttr(d.adSoyad || "")}" placeholder="Ramazan DAĞ" />
        </div>
      </div>

      <div class="field"><label>Görev / Ünvan (mağaza kartında görünür)</label>
        <input class="input" id="dp-unvantam" value="${escapeAttr(d.unvanTam || "")}" placeholder="Diş Hekimi — Klinik Sorumlusu" />
      </div>

      <div class="field"><label>Ana Branş</label>
        <select class="input" id="dp-brans" style="font-size:12px;">
          ${DOKTOR_UZMANLIK.map(u => `<option ${d.brans === u ? "selected" : ""}>${u}</option>`).join("")}
        </select>
      </div>

      <div class="field">
        <label>Uzmanlık Alanları (birden fazla seçilebilir)</label>
        <div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:4px;">
          ${DOKTOR_UZMANLIK.map(u => {
            const sec = (d.uzmanliklar || []).includes(u);
            return `<label style="display:flex;align-items:center;gap:4px;font-size:10px;background:${sec ? "#B2DFDB" : "#F5F5F5"};padding:4px 9px;border-radius:12px;cursor:pointer;">
              <input type="checkbox" class="dp-uzmanlik" value="${escapeAttr(u)}" ${sec ? "checked" : ""} style="margin:0;" />
              <span>${escapeHtml(u)}</span>
            </label>`;
          }).join("")}
        </div>
      </div>

      <div class="field">
        <label>Fotoğraf</label>
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:6px;">
          ${d.foto
            ? `<img src="${d.foto}" alt="" style="width:60px;height:60px;border-radius:50%;object-fit:cover;object-position:center 22%;border:2px solid var(--line);" />`
            : `<div style="width:60px;height:60px;border-radius:50%;background:#F0F0F0;display:flex;align-items:center;justify-content:center;font-size:24px;">👨‍⚕️</div>`}
          <div style="flex:1;">
            <input type="file" id="dp-foto-dosya" accept="image/*" style="font-size:10.5px;width:100%;" />
            <p style="font-size:8.5px;color:#888;margin:3px 0 0;">Galeriden seç · otomatik küçültülür</p>
          </div>
        </div>
      </div>

      <div class="field"><label>Mezuniyet</label>
        <input class="input" id="dp-mezuniyet" value="${escapeAttr(d.mezuniyet || "")}" placeholder="Çukurova Üniversitesi Diş Hekimliği Fakültesi" style="font-size:11.5px;" />
      </div>

      <div class="field"><label>Deneyim</label>
        <input class="input" id="dp-deneyim" value="${escapeAttr(d.deneyim || "")}" placeholder="10 yıllık klinik deneyim" style="font-size:11.5px;" />
      </div>

      <div class="field"><label>İlgi Alanları</label>
        <input class="input" id="dp-ilgi" value="${escapeAttr(d.ilgiAlanlari || "")}" placeholder="İmplantoloji, estetik diş hekimliği, kanal tedavisi" style="font-size:11.5px;" />
      </div>

      <div class="field"><label>Biyografi</label>
        <textarea id="dp-bio" placeholder="Hekim hakkında kısa tanıtım..." style="width:100%;min-height:90px;font-size:11.5px;padding:9px;border:1px solid var(--line);border-radius:8px;font-family:inherit;line-height:1.5;resize:vertical;">${escapeHtml(d.biyografi || "")}</textarea>
      </div>

      <label style="display:flex;align-items:center;gap:8px;font-size:11.5px;margin-bottom:12px;cursor:pointer;">
        <input type="checkbox" id="dp-aktif" ${d.aktif !== false ? "checked" : ""} />
        <span>Doktorlarımız bölümünde göster (aktif)</span>
      </label>

      <div style="display:flex;gap:8px;">
        <button class="btn-primary" style="background:#006064;" data-action="dp-kaydet" data-id="${d.id || ""}">💾 Kaydet</button>
        <button class="btn-primary" style="background:#757575;" data-action="dp-iptal">İptal</button>
      </div>
    </div>`;
  }

  const satirlar = liste.map(d => {
    const p = doktorPuan(d);
    const pasif = d.aktif === false;
    return `<div class="card p3 mb2" style="${pasif ? "opacity:.5;" : ""}">
      <div style="display:flex;gap:10px;">
        ${d.foto
          ? `<img src="${d.foto}" alt="" style="width:54px;height:54px;border-radius:50%;object-fit:cover;object-position:center 22%;flex-shrink:0;border:2px solid var(--line);" />`
          : `<div style="width:54px;height:54px;border-radius:50%;background:#F0F0F0;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">👨‍⚕️</div>`}
        <div style="flex:1;min-width:0;">
          <p style="font-size:12px;font-weight:700;margin:0;line-height:1.3;">${escapeHtml((d.unvan || "") + " " + (d.adSoyad || ""))} ${pasif ? "· <span style='color:#999;font-weight:400;'>(pasif)</span>" : ""}</p>
          <p style="font-size:9.5px;color:var(--muted);margin:2px 0 0;">${escapeHtml(d.unvanTam || d.brans || "")}</p>
          <div style="display:flex;gap:8px;margin-top:3px;font-size:9.5px;">
            ${p.adet > 0 ? `<span style="color:#FFB300;">★ ${p.ort.toFixed(1)} (${p.adet})</span>` : `<span style="color:#bbb;">puan yok</span>`}
            ${(d.diplomalar || []).length ? `<span style="color:#00695C;">📜 ${d.diplomalar.length} belge</span>` : ""}
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:4px;flex-shrink:0;">
          <button data-action="dp-duzenle" data-id="${d.id}" style="background:#E0F7FA;border:none;border-radius:6px;padding:5px 8px;cursor:pointer;font-size:11px;">✏️</button>
          <button data-action="dp-diploma" data-id="${d.id}" style="background:#FFF8E1;border:none;border-radius:6px;padding:5px 8px;cursor:pointer;font-size:10px;">📜</button>
          <button data-action="dp-sil" data-id="${d.id}" style="background:#FFEBEE;border:none;border-radius:6px;padding:5px 8px;cursor:pointer;font-size:11px;color:#C62828;">🗑️</button>
        </div>
      </div>
    </div>`;
  }).join("") || `<p class="footnote">Henüz doktor yok.</p>`;

  /* Diploma modal */
  let diplomaHtml = "";
  if (state.doktorDiplomaId) {
    const d = doktorBul(state.doktorDiplomaId);
    if (d) {
      const liste2 = (d.diplomalar || []).map((dp, i) => `
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--line);">
          <div style="flex:1;min-width:0;">
            <p style="font-size:11px;font-weight:600;margin:0;">${escapeHtml(dp.ad || "Belge")}</p>
            <p style="font-size:9px;color:#888;margin:2px 0 0;">${escapeHtml(dp.kurum || "")}${dp.yil ? " · " + escapeHtml(dp.yil) : ""}</p>
          </div>
          <button data-action="dp-diploma-sil" data-id="${d.id}" data-i="${i}" style="background:#FFEBEE;border:none;border-radius:6px;padding:4px 7px;font-size:10px;color:#C62828;cursor:pointer;">🗑️</button>
        </div>`).join("") || `<p class="footnote">Henüz belge eklenmedi.</p>`;

      diplomaHtml = `<div class="card p4 mb3" style="border:2px solid #F9A825;background:#FFF8E1;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <p style="font-size:12.5px;font-weight:700;margin:0;color:#E65100;">📜 ${escapeHtml((d.unvan || "") + " " + (d.adSoyad || ""))}</p>
          <button data-action="dp-diploma-kapat" style="background:none;border:none;font-size:16px;cursor:pointer;color:#E65100;">✕</button>
        </div>
        ${liste2}
        <div style="margin-top:12px;padding-top:10px;border-top:2px dashed #FFE0B2;">
          <p style="font-size:11px;font-weight:700;margin:0 0 7px;color:#E65100;">Yeni Belge Ekle</p>
          <div class="field" style="margin-bottom:7px;"><label style="font-size:10px;">Belge adı</label>
            <input class="input" id="dip-ad" placeholder="Örn: Diş Hekimliği Diploması" style="font-size:11px;padding:8px;" />
          </div>
          <div style="display:grid;grid-template-columns:1fr 70px;gap:6px;margin-bottom:7px;">
            <input class="input" id="dip-kurum" placeholder="Kurum" style="font-size:11px;padding:8px;" />
            <input class="input" id="dip-yil" placeholder="Yıl" style="font-size:11px;padding:8px;" />
          </div>
          <input type="file" id="dip-dosya" accept="image/*,.pdf" style="font-size:10.5px;width:100%;margin-bottom:7px;" />
          <button class="btn-primary" style="background:#F9A825;font-size:11.5px;padding:9px;" data-action="dp-diploma-ekle" data-id="${d.id}">📤 Belge Ekle</button>
        </div>
      </div>`;
    }
  }

  return `
    <div class="card p4 mb3" style="background:linear-gradient(135deg,#004D40,#00695C);color:#fff;border:none;">
      <p style="font-size:13px;font-weight:700;margin:0 0 2px;">👨‍⚕️ Doktor Yönetimi</p>
      <p style="font-size:10.5px;opacity:.85;margin:0 0 10px;">${liste.length} doktor · ${aktif} aktif</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:8px;text-align:center;">
          <p style="font-size:9px;margin:0;opacity:.85;">AKTİF</p>
          <p style="font-size:16px;font-weight:800;margin:2px 0 0;">${aktif}</p>
        </div>
        <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:8px;text-align:center;">
          <p style="font-size:9px;margin:0;opacity:.85;">BELGE</p>
          <p style="font-size:16px;font-weight:800;margin:2px 0 0;">${liste.reduce((s, d) => s + (d.diplomalar || []).length, 0)}</p>
        </div>
      </div>
    </div>

    ${diplomaHtml}
    ${formHtml}
    ${ed === null || ed === undefined ? `<button class="btn-primary mb3" style="background:#00695C;font-size:12.5px;padding:12px;" data-action="dp-yeni">➕ Yeni Doktor Ekle</button>` : ""}

    <p class="section-label">Doktorlar (${liste.length})</p>
    ${satirlar}

    <div class="card p4 mb3" style="background:#E0F2F1;border:1px solid #80CBC4;margin-top:12px;">
      <p style="font-size:11.5px;font-weight:700;color:#00695C;margin:0 0 6px;">💡 İpuçları</p>
      <p style="font-size:10.5px;color:#00897B;margin:0;line-height:1.7;">
        • <b>Fotoğraf:</b> net yüz fotoğrafı, kare çerçeve — otomatik yuvarlanır<br/>
        • <b>Uzmanlık:</b> birden fazla seçebilirsin, hasta kartında etiket olarak görünür<br/>
        • <b>📜 Diploma:</b> diploma/sertifika fotoğrafı yükle — hasta detayda görür<br/>
        • <b>Pasif:</b> işareti kaldırırsan listede görünmez ama kayıt silinmez<br/>
        • Puanlar hastaların değerlendirmelerinden otomatik hesaplanır
      </p>
    </div>

    <div class="card p4 mb3" style="background:#E3F2FD;border:1px solid #90CAF9;">
      <p style="font-size:11.5px;font-weight:700;color:#0D47A1;margin:0 0 6px;">🔗 Hastaların Göreceği Ekran</p>
      <button class="btn-primary" style="background:#1565C0;font-size:11.5px;padding:10px;" data-action="goto" data-screen="doctors">👁️ Doktorlarımız Sayfası</button>
    </div>`;
}

/* ---------------- AKSİYONLAR ---------------- */

function doktorAction(action, el) {
  /* --- hasta tarafı --- */
  if (action === "doktor-detay") { state.doktorId = el.dataset.id; state.screen = "doktor-detay"; render(); window.scrollTo(0, 0); return true; }

  if (action === "doktor-puanla") {
    const d = doktorBul(el.dataset.id);
    if (!d) return true;
    const ad = (state.user && !state.user.isGuest) ? (state.userProfile?.firstName || state.user.email || "Hasta") : "";
    const isim = prompt("Adınız (isteğe bağlı):", ad) || "Hasta";
    const puanStr = prompt("Puanınız (1-5 yıldız):", "5");
    if (!puanStr) return true;
    const puan = parseInt(puanStr);
    if (!(puan >= 1 && puan <= 5)) { alert("1 ile 5 arasında bir puan girin."); return true; }
    const yorum = prompt("Yorumunuz (isteğe bağlı):", "") || "";
    if (!d.puanlar) d.puanlar = [];
    d.puanlar.push({
      puan, yorum, ad: isim.trim(),
      tarih: new Date().toISOString(),
      uid: state.user ? state.user.uid : ""
    });
    doktorKaydet();
    const p = doktorPuan(d);
    alert("✅ Değerlendirmeniz kaydedildi.\n\nYeni ortalama: " + p.ort.toFixed(1) + " / 5 (" + p.adet + " değerlendirme)");
    render();
    return true;
  }

  if (action === "diploma-gor") {
    const d = doktorBul(el.dataset.id);
    if (!d) return true;
    const dp = (d.diplomalar || [])[parseInt(el.dataset.i)];
    if (!dp) return true;
    if (dp.tip === "image") {
      state.lightboxPhoto = dp.dataUrl;
      render();
    } else {
      const w = window.open("", "_blank");
      if (w) {
        w.document.write('<html><head><meta charset="utf-8"></head><body style="margin:0;"><iframe src="' + dp.dataUrl + '" style="width:100%;height:100vh;border:none;"></iframe></body></html>');
        w.document.close();
      }
    }
    return true;
  }

  /* --- yönetici --- */
  if (action === "dp-yeni") { state.doktorEdit = ""; render(); window.scrollTo(0, 0); return true; }
  if (action === "dp-duzenle") { state.doktorEdit = el.dataset.id; render(); window.scrollTo(0, 0); return true; }
  if (action === "dp-iptal") { state.doktorEdit = undefined; render(); return true; }

  if (action === "dp-kaydet") {
    const id = el.dataset.id;
    const adSoyad = (document.getElementById("dp-ad")?.value || "").trim();
    if (!adSoyad) { alert("Ad Soyad gerekli."); return true; }

    const uzmanliklar = [...document.querySelectorAll(".dp-uzmanlik:checked")].map(x => x.value);
    const mevcut = id ? doktorBul(id) : null;

    const rec = {
      id: id || ("dr_" + Date.now()),
      unvan: document.getElementById("dp-unvan")?.value || "Dt.",
      adSoyad,
      unvanTam: (document.getElementById("dp-unvantam")?.value || "").trim() || "Diş Hekimi",
      brans: document.getElementById("dp-brans")?.value || "Genel Diş Hekimliği",
      uzmanliklar,
      foto: mevcut ? (mevcut.foto || "") : "",
      mezuniyet: (document.getElementById("dp-mezuniyet")?.value || "").trim(),
      deneyim: (document.getElementById("dp-deneyim")?.value || "").trim(),
      ilgiAlanlari: (document.getElementById("dp-ilgi")?.value || "").trim(),
      biyografi: (document.getElementById("dp-bio")?.value || "").trim(),
      diplomalar: mevcut ? (mevcut.diplomalar || []) : [],
      puanlar: mevcut ? (mevcut.puanlar || []) : [],
      aktif: !!document.getElementById("dp-aktif")?.checked,
      sira: mevcut ? accNum(mevcut.sira) : tumDoktorlar().length
    };

    const kaydet = () => {
      if (!state.doctors) state.doctors = [];
      if (id) {
        const old = state.doctors.find(x => x.id === id);
        Object.assign(old, rec);
      } else {
        state.doctors.push(rec);
      }
      doktorKaydet();
      state.doktorEdit = undefined;
      alert("✅ Doktor kaydedildi.");
      render();
    };

    const dosyaInput = document.getElementById("dp-foto-dosya");
    const dosya = dosyaInput && dosyaInput.files && dosyaInput.files[0];
    if (dosya && typeof dosyaHazirla === "function") {
      dosyaInput.disabled = true;
      dosyaHazirla(dosya, 900, 90).then((r) => {
        rec.foto = r.dataUrl;
        kaydet();
      }).catch((err) => {
        dosyaInput.disabled = false;
        alert("Fotoğraf yüklenemedi: " + (err && err.message ? err.message : ""));
      });
      return true;
    }

    kaydet();
    return true;
  }

  if (action === "dp-sil") {
    const d = doktorBul(el.dataset.id);
    if (!d) return true;
    if (!confirm((d.adSoyad || "") + " silinsin mi?\n\n(Gizlemek isterseniz 'Aktif' işaretini kaldırın.)")) return true;
    state.doctors = (state.doctors || []).filter(x => x.id !== el.dataset.id);
    // Fotoğraf/diploma bulut dokümanını da temizle, boşuna yer kaplamasın
    if (window.fb && window.fb.deleteMedya) window.fb.deleteMedya("doktor", el.dataset.id);
    if (typeof _medyaCache !== "undefined") delete _medyaCache["doktor_" + el.dataset.id];
    doktorKaydet();
    render();
    return true;
  }

  /* --- diploma --- */
  if (action === "dp-diploma") { state.doktorDiplomaId = el.dataset.id; render(); window.scrollTo(0, 0); return true; }
  if (action === "dp-diploma-kapat") { state.doktorDiplomaId = null; render(); return true; }

  if (action === "dp-diploma-ekle") {
    const d = doktorBul(el.dataset.id);
    if (!d) return true;
    const ad = (document.getElementById("dip-ad")?.value || "").trim() || "Diploma / Sertifika";
    const kurum = (document.getElementById("dip-kurum")?.value || "").trim();
    const yil = (document.getElementById("dip-yil")?.value || "").trim();
    const inp = document.getElementById("dip-dosya");
    const dosya = inp && inp.files && inp.files[0];

    if (!dosya) {
      if (!d.diplomalar) d.diplomalar = [];
      d.diplomalar.push({ ad, kurum, yil, tip: null, dataUrl: "" });
      doktorKaydet();
      alert("✅ Belge kaydedildi (görselsiz).");
      render();
      return true;
    }

    if (typeof dosyaHazirla !== "function") { alert("Dosya yükleme kullanılamıyor."); return true; }
    inp.disabled = true;
    dosyaHazirla(dosya, 1100, 250).then((r) => {
      if (!d.diplomalar) d.diplomalar = [];
      d.diplomalar.push({ ad, kurum, yil, tip: r.tip, dataUrl: r.dataUrl, boyutKB: r.boyutKB });
      doktorKaydet();
      alert("✅ Belge eklendi.");
      render();
    }).catch((err) => {
      inp.disabled = false;
      alert("Belge yüklenemedi: " + (err && err.message ? err.message : ""));
    });
    return true;
  }

  if (action === "dp-diploma-sil") {
    const d = doktorBul(el.dataset.id);
    if (!d) return true;
    if (!confirm("Bu belge silinsin mi?")) return true;
    d.diplomalar = (d.diplomalar || []).filter((x, i) => i !== parseInt(el.dataset.i));
    doktorKaydet();
    render();
    return true;
  }

  return false;
}
