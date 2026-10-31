/* =========================================================
   NUR DİŞ — HASTA PORTALI v16
   • Tedavi geçmişi, hekim notu, maliyet/fatura görüntüleme
   • e-Nabız belgesi / röntgen yükleme
   • Doktora not iletme (iki yönlü)
   • Doktor ekranı: gelen talepler ve dosyalar
========================================================= */

/* ---------------- HASTA KİMLİĞİ ---------------- */

/* Telefonu sadece rakama indirger (05xx... / +905xx... → 5xxxxxxxxx) */
function normalizePhone(raw) {
  const d = String(raw || "").replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("0")) return d.slice(1);
  if (d.length === 12 && d.startsWith("90")) return d.slice(2);
  return d;
}


/* Giriş yapan hastanın kimlik bilgileri */
function hastaKimlik() {
  const u = state.user || {};
  const p = state.userProfile || {};
  const ad = ((p.firstName || "") + " " + (p.lastName || "")).trim();
  return {
    uid: u.uid || "",
    email: (u.email || p.email || "").toLowerCase().trim(),
    ad: ad || u.name || (u.email ? u.email.split("@")[0] : ""),
    telefon: (p.phone || "").replace(/\D/g, "")
  };
}

/* Bu hastaya ait tedavi kayıtlarını bul */
function hastaTedavileri() {
  const k = hastaKimlik();
  const norm = s => (s || "").toLowerCase().replace(/[^a-zğüşıöç0-9]/g, "");
  const adParca = norm(k.ad).split(" ")[0];

  return (state.treatments || []).filter(t => {
    if (k.email && (t.patientEmail || "").toLowerCase() === k.email) return true;
    if (k.uid && t.uid === k.uid) return true;
    if (k.telefon && normalizePhone(t.patientPhone || "") === k.telefon) return true;
    if (adParca && adParca.length > 2) {
      const hedef = norm(t.userName || "");
      if (hedef.includes(adParca)) return true;
    }
    return false;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));
}

/* Mali müşavir modülündeki gelir kayıtlarından hasta faturası */
function hastaFaturalari() {
  const k = hastaKimlik();
  const norm = s => (s || "").toLowerCase().replace(/[^a-zğüşıöç0-9]/g, "");
  const adParca = norm(k.ad).split(" ")[0];

  return ((state.accounting || {}).incomes || []).filter(x => {
    // Ödenmemiş (veresiye) kayıtlar hastaya gösterilmez — yalnızca yönetici görür
    if (x.paid === false) return false;
    const hedef = norm((x.firm || "") + " " + (x.description || ""));
    if (adParca && adParca.length > 2 && hedef.includes(adParca)) return true;
    return false;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));
}

/* Hastanın yüklediği dosyalar */
function hastaDosyalari() {
  const k = hastaKimlik();
  return (state.patientFiles || []).filter(f =>
    (k.uid && f.uid === k.uid) || (k.email && (f.email || "").toLowerCase() === k.email)
  ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/* Hastanın notları */
function hastaNotlari() {
  const k = hastaKimlik();
  return (state.patientNotes || []).filter(n =>
    (k.uid && n.uid === k.uid) || (k.email && (n.email || "").toLowerCase() === k.email)
  ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/* ---------------- DOSYA TÜRLERİ ---------------- */

const DOSYA_TURLERI = [
  { id: "enabiz", ad: "e-Nabız Belgesi", ikon: "🏥", kabul: ".pdf,image/*", aciklama: "e-Nabız'dan indirdiğiniz PDF veya ekran görüntüsü" },
  { id: "rontgen", ad: "Röntgen / Görüntü", ikon: "🩻", kabul: "image/*", aciklama: "e-Nabız'daki röntgen, panoramik veya tomografi görüntüsü" },
  { id: "recete", ad: "Reçete", ikon: "💊", kabul: ".pdf,image/*", aciklama: "Daha önce yazılmış reçeteler" },
  { id: "tahlil", ad: "Tahlil / Sonuç", ikon: "🧪", kabul: ".pdf,image/*", aciklama: "Kan tahlili, patoloji sonucu vb." },
  { id: "diger", ad: "Diğer Belge", ikon: "📄", kabul: ".pdf,image/*", aciklama: "Diğer tıbbi belgeler" }
];

function dosyaTurBilgi(id) {
  return DOSYA_TURLERI.find(x => x.id === id) || DOSYA_TURLERI[4];
}

/* ---------------- DOSYA İŞLEME ---------------- */

const DOSYA_MAX_KB = 700;   // Firestore tek doküman ~1MB — güvenli sınır

/* Görseli küçült, PDF'i olduğu gibi oku */
function dosyaHazirla(file, maxSide) {
  return new Promise((resolve, reject) => {
    if (!file) { reject(new Error("Dosya seçilmedi")); return; }
    if (file.size > 12 * 1024 * 1024) { reject(new Error("Dosya çok büyük (en fazla 12 MB)")); return; }

    const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
    const isImg = /^image\//.test(file.type);

    if (!isPdf && !isImg) { reject(new Error("Yalnızca PDF veya görsel yükleyebilirsiniz")); return; }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Dosya okunamadı"));
    reader.onload = () => {
      if (isPdf) {
        const dataUrl = reader.result;
        const kb = Math.round((dataUrl.length * 3 / 4) / 1024);
        if (kb > DOSYA_MAX_KB) {
          reject(new Error("PDF çok büyük (" + kb + " KB). En fazla " + DOSYA_MAX_KB + " KB olmalı.\n\nDaha küçük bir PDF seçin veya ekran görüntüsü alıp yükleyin."));
          return;
        }
        resolve({ dataUrl, tip: "pdf", boyutKB: kb });
        return;
      }

      // Görsel — küçült
      const img = new Image();
      img.onerror = () => reject(new Error("Görsel açılamadı"));
      img.onload = () => {
        const max = maxSide || 1200;
        let scale = Math.min(1, max / Math.max(img.width, img.height));
        const ciz = (s, kalite) => {
          const w = Math.max(1, Math.round(img.width * s));
          const h = Math.max(1, Math.round(img.height * s));
          const c = document.createElement("canvas");
          c.width = w; c.height = h;
          const ctx = c.getContext("2d");
          ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          return c.toDataURL("image/jpeg", kalite);
        };

        let url = ciz(scale, 0.82);
        let tryCount = 0;
        while (Math.round((url.length * 3 / 4) / 1024) > DOSYA_MAX_KB && tryCount < 6) {
          scale *= 0.78;
          url = ciz(scale, Math.max(0.5, 0.82 - tryCount * 0.06));
          tryCount++;
        }
        const kb = Math.round((url.length * 3 / 4) / 1024);
        if (kb > DOSYA_MAX_KB) {
          reject(new Error("Görsel küçültülemedi (" + kb + " KB). Daha küçük bir görsel deneyin."));
          return;
        }
        resolve({ dataUrl: url, tip: "image", boyutKB: kb });
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/* Dosya yükle */
function dosyaYukle(file, tur, baslik, not) {
  const k = hastaKimlik();
  return dosyaHazirla(file).then((r) => {
    const kayit = {
      uid: k.uid,
      email: k.email,
      hastaAd: k.ad,
      telefon: k.telefon,
      tur,
      baslik: baslik || dosyaTurBilgi(tur).ad,
      not: not || "",
      tip: r.tip,
      dataUrl: r.dataUrl,
      boyutKB: r.boyutKB,
      tarih: new Date().toISOString(),
      doktorGordu: false
    };

    if (window.fb && state.fbReady && window.fb.addPatientFile) {
      return window.fb.addPatientFile(kayit).then((ref) => {
        kayit.id = ref.id;
        if (!state.patientFiles) state.patientFiles = [];
        state.patientFiles.unshift(kayit);
        return kayit;
      });
    }

    kayit.id = "pf_" + Date.now();
    if (!state.patientFiles) state.patientFiles = [];
    state.patientFiles.unshift(kayit);
    localStorage.setItem("nurdis_patient_files", JSON.stringify(state.patientFiles.slice(0, 50)));
    return kayit;
  });
}

/* ---------------- RENDER: HASTA PORTALI ---------------- */

function renderPortal() {
  if (!state.user || (state.user.isGuest)) {
    return `${topbar("Hasta Portalı", "Kendi tedavi kayıtlarınızı görün", { back: "home" })}
      <div class="content">
        <div class="card p5" style="text-align:center;">
          <div style="font-size:56px;margin-bottom:14px;">🏥</div>
          <p class="name" style="font-size:17px;margin:0 0 6px;">Hasta Portalı</p>
          <p class="desc" style="margin:0 0 18px;">Tedavi geçmişinizi, faturalarınızı ve belgelerinizi görmek için giriş yapın.</p>
          <button class="btn-primary" data-action="goto" data-screen="account">Giriş Yap / Hesap Aç</button>
        </div>
        <div class="card p4" style="background:#E3F2FD;border:1px solid #90CAF9;">
          <p style="font-size:11px;color:#0D47A1;margin:0;line-height:1.7;">
            <b>Neler görebilirsiniz?</b><br/>
            • Geçmiş tedavileriniz ve hekim notları<br/>
            • Tedavi ücretleri ve faturalar<br/>
            • e-Nabız belgeleriniz, röntgenleriniz<br/>
            • Doktorunuza not gönderme
          </p>
        </div>
      </div>`;
  }

  const tab = state.portalTab || "tedaviler";
  const chip = (id, label, adet) => {
    const aktif = tab === id;
    return `<button data-action="portal-tab" data-tab="${id}" style="flex:1;padding:8px 2px;border-radius:9px;font-size:9.5px;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif;border:1px solid ${aktif ? "#00695C" : "var(--line)"};background:${aktif ? "#00695C" : "rgba(255,255,255,.7)"};color:${aktif ? "#fff" : "var(--ink)"};cursor:pointer;line-height:1.3;">${label}${adet != null ? "<br/><span style='font-size:11px;'>" + adet + "</span>" : ""}</button>`;
  };

  const tedaviler = hastaTedavileri();
  const faturalar = hastaFaturalari();
  const dosyalar = hastaDosyalari();
  const notlar = hastaNotlari();

  let icerik = "";

  /* ---- TEDAVİLER ---- */
  if (tab === "tedaviler") {
    const toplam = tedaviler.reduce((s, t) => s + accNum(t.amount), 0);
    const faturalarim = faturalar.slice(0, 20);

    icerik = `
      <div class="card p4 mb3" style="background:linear-gradient(135deg,#004D40,#00695C);color:#fff;border:none;">
        <p style="font-size:13px;font-weight:700;margin:0 0 2px;">🦷 Tedavi Geçmişim</p>
        <p style="font-size:10.5px;opacity:.85;margin:0 0 10px;">${tedaviler.length} işlem</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:8px;text-align:center;">
            <p style="font-size:9px;margin:0;opacity:.85;">TOPLAM</p>
            <p style="font-size:15px;font-weight:800;margin:2px 0 0;">${accTL0(toplam)}</p>
          </div>
          <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:8px;text-align:center;">
            <p style="font-size:9px;margin:0;opacity:.85;">İŞLEM</p>
            <p style="font-size:15px;font-weight:800;margin:2px 0 0;">${tedaviler.length}</p>
          </div>
        </div>
      </div>

      ${tedaviler.length ? tedaviler.map(t => {
        const malz = (t.stokDusum || []).length;
        return `<div class="card p3 mb2">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
            <div style="flex:1;min-width:0;">
              <p style="font-size:12.5px;font-weight:700;margin:0;">${escapeHtml(t.treatmentName || "Tedavi")}</p>
              <p style="font-size:10px;color:var(--muted);margin:2px 0 0;">📅 ${accTarihTR(t.date)}${t.invoiceNo ? " · 🧾 " + escapeHtml(t.invoiceNo) : ""}</p>
              ${t.notes ? `<p style="font-size:10.5px;color:#555;margin:5px 0 0;background:#F5F5F5;padding:6px 8px;border-radius:6px;line-height:1.5;"><b>Hekim notu:</b> ${escapeHtml(t.notes)}</p>` : ""}
              ${t.paymentMethod ? `<p style="font-size:9.5px;color:#888;margin:3px 0 0;">Ödeme: ${escapeHtml(t.paymentMethod)}${t.patientType === "mukellef" ? " · Vergi mükellefi" : ""}</p>` : ""}
            </div>
            <p style="font-size:13px;font-weight:800;margin:0;color:#00695C;flex-shrink:0;">${accTL0(t.amount)}</p>
          </div>
        </div>`;
      }).join("") : `<div class="card p4" style="text-align:center;"><p class="footnote" style="margin:0;">Henüz tedavi kaydınız yok.<br/>İlk ziyaretinizden sonra burada görünecek.</p></div>`}

      ${faturalarim.length ? `<p class="section-label" style="margin-top:16px;">🧾 Fatura / Ödeme Kayıtları (${faturalarim.length})</p>
      ${faturalarim.map(f => `
        <div class="card p3 mb2">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
            <div style="flex:1;min-width:0;">
              <p style="font-size:11.5px;font-weight:600;margin:0;">${escapeHtml(f.description || "")}</p>
              <p style="font-size:9.5px;color:var(--muted);margin:2px 0 0;">📅 ${accTarihTR(f.date)}${f.invoiceNo ? " · " + escapeHtml(f.invoiceNo) : ""}</p>
              <p style="font-size:9.5px;color:#888;margin:2px 0 0;">KDV dahil · ${accTarihTR(f.date)}</p>
            </div>
            <div style="text-align:right;flex-shrink:0;">
              <p style="font-size:11.5px;font-weight:700;margin:0;color:#00695C;">${accTL0(f.grossAmount || f.amount)}</p>
            </div>
          </div>
        </div>`).join("")}` : ""}

      <div class="card p4 mb3" style="background:#E0F2F1;border:1px solid #80CBC4;margin-top:12px;">
        <p style="font-size:11.5px;font-weight:700;color:#00695C;margin:0 0 6px;">📤 Bu Kayıtları Doktora Göster</p>
        <p style="font-size:10.5px;color:#00897B;margin:0;line-height:1.6;">
          Telefonunuzu doktora gösterin — hekim panelinden aynı kayıtları görebilir.
          Farklı bir klinikteyseniz "Doktora Gönder" butonuyla özet iletebilirsiniz.
        </p>
        <button class="btn-primary" style="margin-top:10px;background:#00695C;font-size:11.5px;padding:10px;" data-action="portal-doktora-gonder">📨 Doktora Özet Gönder</button>
      </div>
    `;
  }

  /* ---- BELGELERİM ---- */
  if (tab === "belgeler") {
    icerik = `
      <div class="card p4 mb3" style="background:linear-gradient(135deg,#0D47A1,#1565C0);color:#fff;border:none;">
        <p style="font-size:13px;font-weight:700;margin:0 0 2px;">📁 Belgelerim</p>
        <p style="font-size:10.5px;opacity:.85;margin:0;">${dosyalar.length} dosya yüklendi</p>
      </div>

      <div class="card p4 mb3">
        <p style="font-size:12px;font-weight:700;color:#1565C0;margin:0 0 10px;">➕ Yeni Belge Yükle</p>
        <div class="field">
          <label style="font-size:10.5px;">Belge türü</label>
          <select class="input" id="pf-tur" style="font-size:12px;">
            ${DOSYA_TURLERI.map(t => `<option value="${t.id}">${t.ikon} ${t.ad}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label style="font-size:10.5px;">Başlık (isteğe bağlı)</label>
          <input class="input" id="pf-baslik" placeholder="Örn: 2026 panoramik röntgen" style="font-size:12px;" />
        </div>
        <div class="field">
          <label style="font-size:10.5px;">Dosya</label>
          <input type="file" id="pf-dosya" accept=".pdf,image/*" style="font-size:11px;width:100%;" />
          <p style="font-size:9px;color:#888;margin:4px 0 0;">PDF veya görsel · en fazla 700 KB · görseller otomatik küçültülür</p>
        </div>
        <div class="field">
          <label style="font-size:10.5px;">Doktora not (isteğe bağlı)</label>
          <input class="input" id="pf-not" placeholder="Bu belgeyle ilgili notunuz" style="font-size:12px;" />
        </div>
        <button class="btn-primary" style="background:#1565C0;font-size:12px;padding:11px;" data-action="pf-yukle">📤 Yükle</button>
      </div>

      <p class="section-label">Yüklediğim Belgeler (${dosyalar.length})</p>
      ${dosyalar.length ? dosyalar.map(f => {
        const tur = dosyaTurBilgi(f.tur);
        return `<div class="card p3 mb2">
          <div style="display:flex;gap:10px;">
            ${f.tip === "image"
              ? `<img src="${f.dataUrl}" alt="" style="width:56px;height:56px;object-fit:cover;border-radius:8px;flex-shrink:0;border:1px solid var(--line);" />`
              : `<div style="width:56px;height:56px;border-radius:8px;background:#E3F2FD;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;">📄</div>`}
            <div style="flex:1;min-width:0;">
              <p style="font-size:12px;font-weight:700;margin:0;">${tur.ikon} ${escapeHtml(f.baslik || tur.ad)}</p>
              <p style="font-size:9.5px;color:var(--muted);margin:2px 0 0;">${accTarihTR(f.tarih)} · ${f.boyutKB} KB</p>
              ${f.not ? `<p style="font-size:9.5px;color:#666;margin:2px 0 0;">"${escapeHtml(f.not)}"</p>` : ""}
              <p style="font-size:9px;color:${f.doktorGordu ? "#2E7D32" : "#E65100"};margin:3px 0 0;font-weight:600;">${f.doktorGordu ? "✓ Doktor gördü" : "⏳ Doktor bekliyor"}</p>
            </div>
          </div>
          <div style="display:flex;gap:6px;margin-top:8px;">
            <button data-action="pf-goruntule" data-id="${f.id}" style="flex:1;background:#E0F2F1;border:none;border-radius:7px;padding:8px;font-size:10.5px;font-weight:700;color:#00695C;cursor:pointer;">👁️ Görüntüle</button>
            <button data-action="pf-sil" data-id="${f.id}" style="background:#FFEBEE;border:none;border-radius:7px;padding:8px 12px;font-size:10.5px;color:#C62828;cursor:pointer;">🗑️</button>
          </div>
        </div>`;
      }).join("") : `<div class="card p4" style="text-align:center;"><p class="footnote" style="margin:0;">Henüz belge yüklemediniz.</p></div>`}
    `;
  }

  /* ---- DOKTORA NOT ---- */
  if (tab === "not") {
    icerik = `
      <div class="card p4 mb3" style="background:linear-gradient(135deg,#4A148C,#6A1B9A);color:#fff;border:none;">
        <p style="font-size:13px;font-weight:700;margin:0 0 2px;">💬 Doktoruma Not</p>
        <p style="font-size:10.5px;opacity:.85;margin:0;">Şikayetinizi yazın, hekim görecek</p>
      </div>

      <div class="card p4 mb3">
        <div class="field">
          <label style="font-size:10.5px;">Konu</label>
          <select class="input" id="pn-konu" style="font-size:12px;">
            <option value="sikayet">🩺 Şikayet / Ağrı</option>
            <option value="soru">❓ Soru</option>
            <option value="randevu">📅 Randevu Talebi</option>
            <option value="belge">📄 Belge Hakkında</option>
            <option value="diger">💬 Diğer</option>
          </select>
        </div>
        <div class="field">
          <label style="font-size:10.5px;">Mesajınız</label>
          <textarea id="pn-metin" placeholder="Örn: Sol alt azı dişimde 3 gündür ağrı var, soğuk suyla artıyor..." style="width:100%;min-height:110px;font-size:12px;padding:9px;border:1px solid var(--line);border-radius:8px;font-family:inherit;line-height:1.5;resize:vertical;"></textarea>
        </div>
        <button class="btn-primary" style="background:#6A1B9A;font-size:12px;padding:11px;" data-action="pn-gonder">📨 Doktora Gönder</button>
      </div>

      <p class="section-label">Gönderdiğim Notlar (${notlar.length})</p>
      ${notlar.length ? notlar.map(n => `
        <div class="card p3 mb2" style="${n.doktorYanit ? "border-left:3px solid #2E7D32;" : "border-left:3px solid #E65100;"}">
          <p style="font-size:11.5px;font-weight:700;margin:0;">${escapeHtml((n.konuAd || n.konu || ""))}</p>
          <p style="font-size:10.5px;color:#333;margin:4px 0 0;line-height:1.5;">${escapeHtml(n.metin || "")}</p>
          <p style="font-size:9px;color:#888;margin:4px 0 0;">${accTarihTR(n.tarih)} · ${n.doktorYanit ? "✓ Yanıtlandı" : "⏳ Bekliyor"}</p>
          ${n.doktorYanit ? `<div style="background:#E8F5E9;border-radius:8px;padding:8px;margin-top:7px;border-left:3px solid #2E7D32;">
            <p style="font-size:9.5px;font-weight:700;color:#1B5E20;margin:0 0 3px;">Hekim yanıtı:</p>
            <p style="font-size:10.5px;color:#2E7D32;margin:0;line-height:1.5;">${escapeHtml(n.doktorYanit)}</p>
          </div>` : ""}
        </div>`).join("") : `<div class="card p4" style="text-align:center;"><p class="footnote" style="margin:0;">Henüz not göndermediniz.</p></div>`}
    `;
  }

  /* ---- e-NABIZ ---- */
  if (tab === "enabiz") {
    icerik = renderPortalEnabiz();
  }

  return `${topbar("Hasta Portalı", "Tedavi kayıtlarınız ve belgeleriniz", { back: "home" })}
    <div class="content">
      <div style="display:flex;gap:5px;margin-bottom:12px;">
        ${chip("tedaviler", "🦷 Tedaviler", tedaviler.length)}
        ${chip("belgeler", "📁 Belgeler", dosyalar.length)}
        ${chip("not", "💬 Not", notlar.length)}
        ${chip("enabiz", "🏥 e-Nabız", null)}
      </div>
      ${icerik}
    </div>`;
}

/* ---------------- e-NABIZ BÖLÜMÜ ---------------- */

function renderPortalEnabiz() {
  return `
    <div class="card p4 mb3" style="background:linear-gradient(135deg,#B71C1C,#C62828);color:#fff;border:none;">
      <p style="font-size:13px;font-weight:700;margin:0 0 2px;">🏥 e-Nabız Verileriniz</p>
      <p style="font-size:10.5px;opacity:.9;margin:0;">Kendi onayınızla, kendi belgelerinizi ekleyin</p>
    </div>

    <div class="card p4 mb3" style="background:#FFF8E1;border:1px solid #FFD54F;">
      <p style="font-size:11.5px;font-weight:700;color:#E65100;margin:0 0 8px;">⚠️ Önce şunu bilmeniz gerek</p>
      <p style="font-size:10.5px;color:#8D6E00;margin:0;line-height:1.75;">
        <b>e-Nabız verileri doğrudan uygulamaya bağlanamaz.</b><br/><br/>
        Bu, Sağlık Bakanlığı'nın güvenlik kuralıdır: e-Nabız verilerine yalnızca
        <b>yetkili sağlık kuruluşları</b> kendi sistemleri üzerinden erişebilir.
        Üçüncü taraf uygulamaların (bu uygulama dahil) e-Nabız'a doğrudan bağlanması
        <b>teknik olarak mümkün değildir ve yasal değildir.</b><br/><br/>
        <b>Ancak çözüm basit:</b> Kendi verinizi e-Nabız'dan indirip buraya yükleyebilirsiniz.
        Bu tamamen sizin onayınızla ve kontrolünüzde olur.
      </p>
    </div>

    <div class="card p4 mb3">
      <p style="font-size:12.5px;font-weight:700;color:#C62828;margin:0 0 10px;">📥 Nasıl İndirilir? (3 adım)</p>

      <div style="display:flex;gap:10px;margin-bottom:12px;">
        <div style="flex:0 0 28px;height:28px;border-radius:50%;background:#C62828;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;">1</div>
        <div style="flex:1;">
          <p style="font-size:11.5px;font-weight:700;margin:0;">e-Nabız'a giriş yapın</p>
          <p style="font-size:10px;color:#666;margin:3px 0 0;line-height:1.5;">
            <b>enabiz.gov.tr</b> adresine veya <b>e-Nabız mobil uygulamasına</b> e-Devlet şifrenizle giriş yapın.
          </p>
        </div>
      </div>

      <div style="display:flex;gap:10px;margin-bottom:12px;">
        <div style="flex:0 0 28px;height:28px;border-radius:50%;background:#C62828;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;">2</div>
        <div style="flex:1;">
          <p style="font-size:11.5px;font-weight:700;margin:0;">İlgili bölümü açın</p>
          <p style="font-size:10px;color:#666;margin:3px 0 0;line-height:1.5;">
            <b>Sağlık Geçmişi</b> · <b>Röntgen / Görüntüleme</b> · <b>Reçetelerim</b> · <b>Tahlil Sonuçları</b>
            bölümlerinden istediğinizi seçin.
          </p>
        </div>
      </div>

      <div style="display:flex;gap:10px;">
        <div style="flex:0 0 28px;height:28px;border-radius:50%;background:#C62828;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;">3</div>
        <div style="flex:1;">
          <p style="font-size:11.5px;font-weight:700;margin:0;">İndirin / ekran görüntüsü alın</p>
          <p style="font-size:10px;color:#666;margin:3px 0 0;line-height:1.5;">
            PDF olarak indirin veya ekran görüntüsü alın.
            Sonra aşağıdaki butonla buraya yükleyin.
          </p>
        </div>
      </div>
    </div>

    <a href="https://enabiz.gov.tr" target="_blank" rel="noopener" class="btn-primary" style="text-decoration:none;background:#C62828;margin-bottom:8px;">🔗 e-Nabız'ı Aç</a>
    <a href="https://www.turkiye.gov.tr/saglik-bakanligi-enabiz" target="_blank" rel="noopener" class="btn-primary" style="text-decoration:none;background:#1565C0;margin-bottom:12px;">🔗 e-Devlet'ten Giriş</a>

    <div class="card p4 mb3">
      <p style="font-size:12px;font-weight:700;color:#1565C0;margin:0 0 10px;">⬆️ Belge Yükle</p>
      <div class="field">
        <label style="font-size:10.5px;">Belge türü</label>
        <select class="input" id="en-tur" style="font-size:12px;">
          <option value="enabiz">🏥 e-Nabız Sağlık Geçmişi</option>
          <option value="rontgen">🩻 Röntgen / Görüntü</option>
          <option value="recete">💊 Reçete</option>
          <option value="tahlil">🧪 Tahlil Sonucu</option>
        </select>
      </div>
      <div class="field">
        <label style="font-size:10.5px;">Başlık</label>
        <input class="input" id="en-baslik" placeholder="Örn: 2026 Ekim panoramik" style="font-size:12px;" />
      </div>
      <div class="field">
        <label style="font-size:10.5px;">Dosya (PDF veya görsel)</label>
        <input type="file" id="en-dosya" accept=".pdf,image/*" style="font-size:11px;width:100%;" />
        <p style="font-size:9px;color:#888;margin:4px 0 0;">En fazla 700 KB · görseller otomatik küçültülür · PDF için küçük dosya seçin</p>
      </div>
      <button class="btn-primary" style="background:#1565C0;font-size:12px;padding:11px;" data-action="en-yukle">📤 Yükle ve Doktora Bildir</button>
    </div>

    <div class="card p4 mb3" style="background:#E3F2FD;border:1px solid #90CAF9;">
      <p style="font-size:11px;font-weight:700;color:#0D47A1;margin:0 0 6px;">🔐 Gizliliğiniz</p>
      <p style="font-size:10px;color:#1565C0;margin:0;line-height:1.7;">
        Yüklediğiniz belgeler yalnızca <b>sizin hesabınıza</b> ve <b>kliniğin yöneticisine</b> görünür.
        Üçüncü kişilerle paylaşılmaz, reklam için kullanılmaz.
        Dilediğiniz zaman <b>belgeler sekmesinden silebilirsiniz.</b>
      </p>
    </div>
  `;
}

/* ---------------- YÖNETİCİ: HASTA PORTALI ---------------- */

function renderAccPortal() {
  const dosyalar = (state.patientFiles || []).slice().sort((a, b) => new Date(b.createdAt || b.tarih) - new Date(a.createdAt || a.tarih));
  const notlar = (state.patientNotes || []).slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const yeniDosya = dosyalar.filter(f => !f.doktorGordu).length;
  const yeniNot = notlar.filter(n => !n.doktorYanit).length;

  const chip = (id, label, adet) => {
    const aktif = (state.portalAdminTab || "notlar") === id;
    return `<button data-action="portal-admin-tab" data-tab="${id}" style="flex:1;padding:8px 3px;border-radius:9px;font-size:10px;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif;border:1px solid ${aktif ? "#004D40" : "var(--line)"};background:${aktif ? "#004D40" : "rgba(255,255,255,.7)"};color:${aktif ? "#fff" : "var(--ink)"};cursor:pointer;line-height:1.3;">${label}<br/><span style="font-size:12px;">${adet}</span></button>`;
  };

  let icerik = "";

  if ((state.portalAdminTab || "notlar") === "notlar") {
    icerik = notlar.length ? notlar.slice(0, 60).map(n => `
      <div class="card p3 mb2" style="${n.doktorYanit ? "opacity:.7;" : "border-left:3px solid #E65100;"}">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
          <div style="flex:1;min-width:0;">
            <p style="font-size:12px;font-weight:700;margin:0;">${escapeHtml(n.konuAd || n.konu || "Not")}</p>
            <p style="font-size:10px;color:var(--muted);margin:2px 0 0;">${escapeHtml(n.hastaAd || n.email || "")}${n.telefon ? " · " + escapeHtml(n.telefon) : ""}</p>
            <p style="font-size:11px;color:#333;margin:5px 0 0;line-height:1.5;background:#F9F9F9;padding:6px 8px;border-radius:6px;">${escapeHtml(n.metin || "")}</p>
            <p style="font-size:9px;color:#888;margin:4px 0 0;">${accTarihTR(n.tarih)}</p>
            ${n.doktorYanit ? `<div style="background:#E8F5E9;border-radius:6px;padding:6px 8px;margin-top:6px;">
              <p style="font-size:9.5px;color:#1B5E20;margin:0;"><b>Yanıtınız:</b> ${escapeHtml(n.doktorYanit)}</p>
            </div>` : ""}
          </div>
        </div>
        ${!n.doktorYanit ? `
        <div style="margin-top:8px;">
          <textarea id="yn-${n.id}" placeholder="Yanıtınızı yazın..." style="width:100%;min-height:60px;font-size:11px;padding:8px;border:1px solid var(--line);border-radius:7px;font-family:inherit;resize:vertical;"></textarea>
          <div style="display:flex;gap:6px;margin-top:6px;">
            <button data-action="pn-yanitla" data-id="${n.id}" style="flex:1;background:#00695C;border:none;border-radius:7px;padding:8px;font-size:10.5px;font-weight:700;color:#fff;cursor:pointer;">✉️ Yanıtla</button>
            ${n.telefon ? `<a href="tel:+9${n.telefon.startsWith("0") ? n.telefon : "0" + n.telefon}" style="background:#E8F5E9;border-radius:7px;padding:8px 12px;text-decoration:none;font-size:12px;">📞</a>` : ""}
          </div>
        </div>` : ""}
      </div>`).join("") : `<div class="card p4" style="text-align:center;"><p class="footnote" style="margin:0;">Henüz hasta notu yok.</p></div>`;
  }

  if ((state.portalAdminTab || "notlar") === "dosyalar") {
    icerik = dosyalar.length ? dosyalar.slice(0, 40).map(f => {
      const tur = dosyaTurBilgi(f.tur);
      return `<div class="card p3 mb2" style="${f.doktorGordu ? "opacity:.7;" : "border-left:3px solid #1565C0;"}">
        <div style="display:flex;gap:10px;">
          ${f.tip === "image"
            ? `<img src="${f.dataUrl}" alt="" style="width:56px;height:56px;object-fit:cover;border-radius:8px;flex-shrink:0;border:1px solid var(--line);" />`
            : `<div style="width:56px;height:56px;border-radius:8px;background:#E3F2FD;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;">📄</div>`}
          <div style="flex:1;min-width:0;">
            <p style="font-size:12px;font-weight:700;margin:0;">${tur.ikon} ${escapeHtml(f.baslik || tur.ad)}</p>
            <p style="font-size:10px;color:var(--muted);margin:2px 0 0;">${escapeHtml(f.hastaAd || f.email || "")}</p>
            <p style="font-size:9.5px;color:#888;margin:2px 0 0;">${accTarihTR(f.tarih)} · ${f.boyutKB} KB</p>
            ${f.not ? `<p style="font-size:9.5px;color:#666;margin:3px 0 0;font-style:italic;">"${escapeHtml(f.not)}"</p>` : ""}
          </div>
        </div>
        <div style="display:flex;gap:6px;margin-top:8px;">
          <button data-action="pf-admin-gor" data-id="${f.id}" style="flex:1;background:#E3F2FD;border:none;border-radius:7px;padding:8px;font-size:10.5px;font-weight:700;color:#1565C0;cursor:pointer;">👁️ Aç</button>
          ${!f.doktorGordu ? `<button data-action="pf-goruldu" data-id="${f.id}" style="background:#E8F5E9;border:none;border-radius:7px;padding:8px 10px;font-size:10px;font-weight:700;color:#2E7D32;cursor:pointer;">✓ Gördüm</button>` : ""}
          <button data-action="pf-admin-sil" data-id="${f.id}" style="background:#FFEBEE;border:none;border-radius:7px;padding:8px 10px;font-size:10px;color:#C62828;cursor:pointer;">🗑️</button>
        </div>
      </div>`;
    }).join("") : `<div class="card p4" style="text-align:center;"><p class="footnote" style="margin:0;">Henüz hasta belgesi yüklenmedi.</p></div>`;
  }

  return `
    <div class="card p4 mb3" style="background:linear-gradient(135deg,#004D40,#00695C);color:#fff;border:none;">
      <p style="font-size:13px;font-weight:700;margin:0 0 2px;">🏥 Hasta Portalı</p>
      <p style="font-size:10.5px;opacity:.85;margin:0 0 10px;">Hastalardan gelen notlar ve belgeler</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:8px;text-align:center;">
          <p style="font-size:9px;margin:0;opacity:.85;">YENİ NOT</p>
          <p style="font-size:16px;font-weight:800;margin:2px 0 0;">${yeniNot}</p>
        </div>
        <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:8px;text-align:center;">
          <p style="font-size:9px;margin:0;opacity:.85;">YENİ BELGE</p>
          <p style="font-size:16px;font-weight:800;margin:2px 0 0;">${yeniDosya}</p>
        </div>
      </div>
    </div>

    <div style="display:flex;gap:5px;margin-bottom:12px;">
      ${chip("notlar", "💬 Notlar", notlar.length)}
      ${chip("dosyalar", "📁 Belgeler", dosyalar.length)}
    </div>

    ${icerik}

    <div class="card p4 mb3" style="background:#E0F2F1;border:1px solid #80CBC4;margin-top:12px;">
      <p style="font-size:11.5px;font-weight:700;color:#00695C;margin:0 0 6px;">💡 Nasıl çalışır?</p>
      <p style="font-size:10.5px;color:#00897B;margin:0;line-height:1.7;">
        Hastalar kendi hesaplarından <b>tedavi geçmişlerini görür</b>, size not yazar ve
        e-Nabız belgelerini/röntgenlerini yükler. Hepsi burada toplanır.<br/><br/>
        <b>Not:</b> e-Nabız verileri doğrudan bağlanamaz — hasta kendi belgesini indirip yükler.
        Bu, Sağlık Bakanlığı'nın güvenlik kuralıdır.
      </p>
    </div>
  `;
}


/* =========================================================
   PORTAL AKSİYONLARI
========================================================= */

function portalAction(action, el) {
  /* --- sekme --- */
  if (action === "portal-tab") { state.portalTab = el.dataset.tab; render(); window.scrollTo(0, 0); return true; }
  if (action === "portal-admin-tab") { state.portalAdminTab = el.dataset.tab; render(); return true; }

  /* --- BELGE YÜKLE (belgeler sekmesi) --- */
  if (action === "pf-yukle") {
    const inp = document.getElementById("pf-dosya");
    const file = inp && inp.files && inp.files[0];
    if (!file) { alert("Önce bir dosya seçin."); return true; }
    const tur = document.getElementById("pf-tur")?.value || "diger";
    const baslik = (document.getElementById("pf-baslik")?.value || "").trim();
    const not = (document.getElementById("pf-not")?.value || "").trim();
    if (inp) inp.disabled = true;
    dosyaYukle(file, tur, baslik, not).then(() => {
      alert("✅ Belge yüklendi.\n\nDoktorunuz panelinden görebilir.");
      render();
    }).catch((err) => {
      if (inp) inp.disabled = false;
      alert("❌ Yüklenemedi\n\n" + (err && err.message ? err.message : ""));
    });
    return true;
  }

  /* --- e-NABIZ YÜKLE --- */
  if (action === "en-yukle") {
    const inp = document.getElementById("en-dosya");
    const file = inp && inp.files && inp.files[0];
    if (!file) { alert("Önce bir dosya seçin."); return true; }
    const tur = document.getElementById("en-tur")?.value || "enabiz";
    const baslik = (document.getElementById("en-baslik")?.value || "").trim() || dosyaTurBilgi(tur).ad;
    if (inp) inp.disabled = true;
    dosyaYukle(file, tur, baslik, "e-Nabız'dan yüklendi").then(() => {
      alert("✅ Belge yüklendi ve doktorunuza bildirildi.\n\nBelgelerim sekmesinden görebilirsiniz.");
      state.portalTab = "belgeler";
      render();
    }).catch((err) => {
      if (inp) inp.disabled = false;
      alert("❌ Yüklenemedi\n\n" + (err && err.message ? err.message : ""));
    });
    return true;
  }

  /* --- BELGE GÖRÜNTÜLE (hasta) --- */
  if (action === "pf-goruntule") {
    const f = (state.patientFiles || []).find(x => x.id === el.dataset.id);
    if (!f) return true;
    if (f.tip === "image") {
      state.lightboxPhoto = f.dataUrl;
      render();
    } else {
      const w = window.open("", "_blank");
      if (w) {
        w.document.write('<html><head><meta charset="utf-8"><title>' + (f.baslik || "Belge") + '</title></head><body style="margin:0;"><iframe src="' + f.dataUrl + '" style="width:100%;height:100vh;border:none;"></iframe></body></html>');
        w.document.close();
      } else {
        alert("Açılır pencere engellendi. Lütfen izin verin.");
      }
    }
    return true;
  }

  /* --- BELGE SİL (hasta) --- */
  if (action === "pf-sil") {
    const f = (state.patientFiles || []).find(x => x.id === el.dataset.id);
    if (!f) return true;
    if (!confirm("Bu belge silinsin mi?\n\n" + (f.baslik || "") + "\n\nBu işlem geri alınamaz.")) return true;
    if (window.fb && state.fbReady && window.fb.deletePatientFile && f.id && !String(f.id).startsWith("pf_")) {
      window.fb.deletePatientFile(f.id).catch(() => {});
    }
    state.patientFiles = (state.patientFiles || []).filter(x => x.id !== el.dataset.id);
    localStorage.setItem("nurdis_patient_files", JSON.stringify(state.patientFiles.slice(0, 50)));
    alert("✅ Belge silindi.");
    render();
    return true;
  }

  /* --- NOT GÖNDER (hasta) --- */
  if (action === "pn-gonder") {
    const k = hastaKimlik();
    if (!k.uid && !k.email) { alert("Giriş yapmanız gerekiyor."); return true; }
    const metin = (document.getElementById("pn-metin")?.value || "").trim();
    if (metin.length < 5) { alert("Lütfen mesajınızı yazın."); return true; }
    const konu = document.getElementById("pn-konu")?.value || "diger";
    const konuAdlari = { sikayet: "🩺 Şikayet / Ağrı", soru: "❓ Soru", randevu: "📅 Randevu Talebi", belge: "📄 Belge Hakkında", diger: "💬 Diğer" };

    const kayit = {
      uid: k.uid, email: k.email, hastaAd: k.ad, telefon: k.telefon,
      konu, konuAd: konuAdlari[konu] || "Not",
      metin,
      tarih: new Date().toISOString(),
      doktorYanit: ""
    };

    const kaydet = () => {
      alert("✅ Notunuz doktorunuza iletildi.\n\nYanıt geldiğinde burada görünecek.");
      render();
    };

    if (window.fb && state.fbReady && window.fb.addPatientNote) {
      window.fb.addPatientNote(kayit).then((ref) => {
        kayit.id = ref.id;
        if (!state.patientNotes) state.patientNotes = [];
        state.patientNotes.unshift(kayit);
        kaydet();
      }).catch(() => {
        kayit.id = "pn_" + Date.now();
        if (!state.patientNotes) state.patientNotes = [];
        state.patientNotes.unshift(kayit);
        localStorage.setItem("nurdis_patient_notes", JSON.stringify(state.patientNotes.slice(0, 50)));
        alert("⚠️ Buluta gönderilemedi, bu cihaza kaydedildi.");
        render();
      });
    } else {
      kayit.id = "pn_" + Date.now();
      if (!state.patientNotes) state.patientNotes = [];
      state.patientNotes.unshift(kayit);
      localStorage.setItem("nurdis_patient_notes", JSON.stringify(state.patientNotes.slice(0, 50)));
      kaydet();
    }
    return true;
  }

  /* --- DOKTORA ÖZET GÖNDER (tedaviler sekmesi) --- */
  if (action === "portal-doktora-gonder") {
    const t = hastaTedavileri();
    if (!t.length) { alert("Gönderilecek tedavi kaydı yok."); return true; }
    const ozet = "NUR DİŞ — HASTA TEDAVİ ÖZETİ\n" +
      "Hasta: " + hastaKimlik().ad + "\n" +
      "Tarih: " + accTarihTR() + "\n" + "-".repeat(34) + "\n" +
      t.slice(0, 15).map((x, i) => (i + 1) + ". " + (x.date || "") + " · " + (x.treatmentName || "") +
        (x.amount ? " · " + accTL0(x.amount) : "") +
        (x.invoiceNo ? " · F:" + x.invoiceNo : "") +
        (x.notes ? "\n   Not: " + x.notes : "")).join("\n") +
      "\n" + "-".repeat(34) + "\nToplam: " + accTL(t.reduce((s, x) => s + accNum(x.amount), 0));
    accCopy(ozet);
    return true;
  }

  /* --- YÖNETİCİ: not yanıtla --- */
  if (action === "pn-yanitla") {
    const n = (state.patientNotes || []).find(x => x.id === el.dataset.id);
    if (!n) return true;
    const ta = document.getElementById("yn-" + n.id);
    const yanit = (ta && ta.value || "").trim();
    if (yanit.length < 2) { alert("Yanıt yazın."); return true; }
    n.doktorYanit = yanit;
    n.yanitTarihi = new Date().toISOString();
    if (window.fb && state.fbReady && window.fb.addPatientNote && n.id && !String(n.id).startsWith("pn_")) {
      // Mevcut dokümanı güncelle: yeni bir yanıt kaydı olarak ekle
      try { window.fb.addPatientNote({ ...n, tip: "yanit" }).catch(() => {}); } catch (e) {}
    }
    localStorage.setItem("nurdis_patient_notes", JSON.stringify((state.patientNotes || []).slice(0, 50)));
    if (n.telefon) {
      if (confirm("Yanıt kaydedildi.\n\nHastaya WhatsApp'tan da bildirmek ister misiniz?")) {
        guvenliWhatsApp(n.telefon,
          "Sayın " + (n.hastaAd || "hastamız") + "\n\n" + yanit + "\n\nNur Diş & Dental Klinik",
          "Hekim yanıtı");
      }
    } else {
      alert("✅ Yanıt kaydedildi.");
    }
    render();
    return true;
  }

  /* --- YÖNETİCİ: belge görüldü --- */
  if (action === "pf-goruldu") {
    const f = (state.patientFiles || []).find(x => x.id === el.dataset.id);
    if (!f) return true;
    f.doktorGordu = true;
    f.gorulmeTarihi = new Date().toISOString();
    localStorage.setItem("nurdis_patient_files", JSON.stringify((state.patientFiles || []).slice(0, 50)));
    render();
    return true;
  }

  /* --- YÖNETİCİ: belge aç --- */
  if (action === "pf-admin-gor") {
    const f = (state.patientFiles || []).find(x => x.id === el.dataset.id);
    if (!f) return true;
    if (f.tip === "image") {
      state.lightboxPhoto = f.dataUrl;
      render();
    } else {
      const w = window.open("", "_blank");
      if (w) {
        w.document.write('<html><head><meta charset="utf-8"><title>' + (f.baslik || "Belge") + '</title></head><body style="margin:0;"><iframe src="' + f.dataUrl + '" style="width:100%;height:100vh;border:none;"></iframe></body></html>');
        w.document.close();
      }
    }
    // Otomatik görüldü işaretle
    f.doktorGordu = true;
    localStorage.setItem("nurdis_patient_files", JSON.stringify((state.patientFiles || []).slice(0, 50)));
    return true;
  }

  /* --- YÖNETİCİ: belge sil --- */
  if (action === "pf-admin-sil") {
    const f = (state.patientFiles || []).find(x => x.id === el.dataset.id);
    if (!f) return true;
    if (!confirm("Bu hasta belgesi silinsin mi?\n\n" + (f.baslik || ""))) return true;
    if (window.fb && state.fbReady && window.fb.deletePatientFile && f.id && !String(f.id).startsWith("pf_")) {
      window.fb.deletePatientFile(f.id).catch(() => {});
    }
    state.patientFiles = (state.patientFiles || []).filter(x => x.id !== el.dataset.id);
    localStorage.setItem("nurdis_patient_files", JSON.stringify(state.patientFiles.slice(0, 50)));
    render();
    return true;
  }

  return false;
}
