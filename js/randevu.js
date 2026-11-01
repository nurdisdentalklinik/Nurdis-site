/* =========================================================
   NUR DİŞ — RANDEVU — 24 saat, misafir randevu, yönetim
   app.js'ten bölündü · index.html yükleme sırası önemli
========================================================= */

/* =========================================================
   NUR DİŞ — RANDEVU YÖNETİM SİSTEMİ v9
   • Misafir randevu (giriş gerekmez)
   • Randevu sonrası WhatsApp konum mesajı
   • Yönetici paneli: düzenle, sil, ara, mesaj at, konum gönder
   • Durum takibi (bekliyor / geldi / gelmedi / iptal)
========================================================= */

/* ---------------- KLİNİK KONUM ---------------- */

const KLINIK_KONUM = {
  adres: "Mardin, Kızıltepe, TOKİ Mahallesi",
  lat: null, lon: null,
  telefon: "05051050302"
};

function klinikKonumAyar() {
  return Object.assign({}, KLINIK_KONUM, state.konumAyar || {});
}

/* Google Maps konum linki */
function konumLinki() {
  const k = klinikKonumAyar();
  if (k.lat && k.lon) {
    return "https://www.google.com/maps/search/?api=1&query=" + k.lat + "," + k.lon;
  }
  return "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent("Nur Diş & Dental Klinik " + (k.adres || ""));
}

/* Konumun kısa önizlemesi */
function konumKisa() {
  const k = klinikKonumAyar();
  return k.adres || "Mardin, Kızıltepe, TOKİ";
}

/* ---------------- RANDEVU DURUMLARI ---------------- */

const RANDEVU_DURUM = {
  bekliyor: { ad: "Bekliyor", renk: "#1565C0", bg: "#E3F2FD", ikon: "🕐" },
  onaylandi: { ad: "Onaylandı", renk: "#2E7D32", bg: "#E8F5E9", ikon: "✅" },
  geldi: { ad: "Geldi", renk: "#00695C", bg: "#E0F2F1", ikon: "🟢" },
  gelmedi: { ad: "Gelmedi", renk: "#C62828", bg: "#FFEBEE", ikon: "🔴" },
  iptal: { ad: "İptal", renk: "#757575", bg: "#F5F5F5", ikon: "⚪" }
};

function randevuDurum(r) {
  return RANDEVU_DURUM[r.status] || RANDEVU_DURUM.bekliyor;
}

/* Randevu zamanı geçti mi */
function randevuGecti(r) {
  const d = new Date((r.date || "") + "T" + (r.time || "23:59"));
  return d < new Date();
}

/* Yaklaşma durumu (bugün / yarın / geçmiş) */
function randevuYakinlik(r) {
  const bugun = new Date(); bugun.setHours(0, 0, 0, 0);
  const d = new Date(r.date + "T00:00:00");
  const gun = Math.round((d - bugun) / 86400000);
  if (gun < 0) return { gun, etiket: Math.abs(gun) + " gün önce", renk: "#999" };
  if (gun === 0) return { gun, etiket: "BUGÜN", renk: "#C62828" };
  if (gun === 1) return { gun, etiket: "Yarın", renk: "#E65100" };
  if (gun <= 7) return { gun, etiket: gun + " gün sonra", renk: "#F9A825" };
  return { gun, etiket: gun + " gün sonra", renk: "#2E7D32" };
}

/* ---------------- RANDEVU MESAJLARI ---------------- */

const RANDEVU_MSG = {
  onay:
`İyi günler Sayın {ad}

Randevunuz oluşturuldu ✓

📅 Tarih: {tarih}
🕐 Saat: {saat}
🏥 Nur Diş & Dental Klinik

📍 Konumumuz: {konum}

Randevunuzu iptal etmek veya değiştirmek için bize yazabilirsiniz.`,

  hatirlatma:
`İyi günler Sayın {ad}

Yarın saat {saat} randevunuzu hatırlatmak isteriz.

📅 {tarih}
📍 {konum}

Nur Diş & Dental Klinik`,

  konum:
`Nur Diş & Dental Klinik konumumuz 📍

{adres}

Haritada açmak için: {konum}

Randevu için bize yazabilirsiniz.`,

  iptal:
`Sayın {ad}

{saat} saatindeki randevunuz iptal edilmiştir.

Yeni randevu için bize yazabilirsiniz.

Nur Diş & Dental Klinik`,

  tesekkur:
`Sayın {ad}

Bugün kliniğimizi tercih ettiğiniz için teşekkür ederiz 🤍

Kontrol randevunuzu planlamak için bize yazabilirsiniz.

Nur Diş & Dental Klinik`
};

function randevuMesaj(tip, r) {
  const ozel = (state.randevuSablon || {})[tip];
  let m = (ozel && ozel.trim()) ? ozel : RANDEVU_MSG[tip];
  const k = klinikKonumAyar();
  let tarih = r.date || "";
  try {
    tarih = new Date(r.date + "T00:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", weekday: "long" });
  } catch (e) {}
  m = m.replace(/\{ad\}/g, r.name || "hastamız")
       .replace(/\{saat\}/g, r.time || "")
       .replace(/\{tarih\}/g, tarih)
       .replace(/\{konum\}/g, konumLinki())
       .replace(/\{adres\}/g, k.adres || "")
       .replace(/\{islem\}/g, r.service || "Muayene");
  return m;
}

/* =========================================================
   MİSAFİR RANDEVU — randevu ekranı
========================================================= */

function renderBookingV2() {
  const f = state.bookingForm;

  /* Saat seçimi: 24 saat, 15 dk aralık. Seçili saat grubu state'te tutulur. */
  const seciliSaatGrubu = state.rvSaatGrup != null ? state.rvSaatGrup
    : (f.time ? parseInt(f.time.split(":")[0]) : new Date().getHours());

  const saatButonlari = Array.from({ length: 24 }, (_, h) => {
    const aktif = h === seciliSaatGrubu;
    const gece = h >= 22 || h < 7;
    return `<button data-action="saat-grup" data-h="${h}" style="flex:0 0 auto;min-width:44px;padding:7px 4px;border-radius:9px;font-size:11px;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif;border:1px solid ${aktif ? (gece ? "#4527A0" : "#0B6E86") : "var(--line)"};background:${aktif ? (gece ? "#4527A0" : "#0B6E86") : (gece ? "#F3E5F5" : "rgba(255,255,255,.75)")};color:${aktif ? "#fff" : "var(--ink)"};cursor:pointer;">${String(h).padStart(2, "0")}</button>`;
  }).join("");

  const dakikaButonlari = saatDilimGrubu(seciliSaatGrubu).map(t => {
    const aktif = f.time === t;
    return `<div class="slot ${aktif ? "active" : ""}" data-action="pick-time" data-time="${t}" style="margin:0;">${t.split(":")[1]}</div>`;
  }).join("");

  const geceUyari = (seciliSaatGrubu >= 22 || seciliSaatGrubu < 7)
    ? `<div class="card p3 mt2" style="background:#F3E5F5;border:1px solid #CE93D8;">
         <p style="font-size:11px;color:#4527A0;margin:0;line-height:1.5;">🌙 <b>Gece / acil saat</b> — kliniğimiz acil durumlar için açıktır. Randevunuz öncelikli işleme alınacaktır.</p>
       </div>`
    : "";

  const canSubmit = f.date && f.time && f.name && f.phone;

  let statusHtml = "";
  if (state.bookingStatus === "done" && state.lastBooking) {
    const b = state.lastBooking;
    statusHtml = `<div class="card p4 mt3" style="background:#E8F5E9;border:1px solid #A5D6A7;">
      <p style="font-size:14px;font-weight:700;color:#1B5E20;margin:0 0 4px;">✅ Randevunuz oluşturuldu</p>
      <p style="font-size:12px;color:#2E7D32;margin:0 0 10px;">${accTarihTR(b.date)} · saat ${b.time}</p>
      <p style="font-size:11px;color:#2E7D32;margin:0 0 12px;">Randevu detaylarını ve konumumuzu WhatsApp'ınıza gönderelim mi?</p>
      <a href="${waLink(b.phone, randevuMesaj("onay", b))}" target="_blank" rel="noopener" class="btn-primary" style="text-decoration:none;background:#25D366;font-size:13px;padding:12px;">💬 WhatsApp'a Gönder</a>
      <a href="${konumLinki()}" target="_blank" rel="noopener" class="btn-primary" style="text-decoration:none;background:#1565C0;font-size:12px;padding:11px;margin-top:8px;">📍 Konumu Aç</a>
    </div>`;
  }
  if (state.bookingStatus === "error") statusHtml = `<p class="status-err">Kaydedilemedi, lütfen tekrar deneyin.</p>`;
  if (state.bookingStatus === "done_offline") statusHtml = `<div class="card p3 mt2" style="background:#FFF8E1;border:1px solid #FFD54F;">
      <p style="font-size:11px;color:#8D6E00;margin:0;line-height:1.5;">⚠️ Randevunuz alındı ancak şu an sunucuya iletilemedi. Kliniğe ulaştığında bilgilendirileceksiniz. <b>Kayıt cihazınızda güvende.</b></p>
    </div>`;

  return `${topbar("Randevu Al", "Giriş yapmadan da randevu alabilirsiniz.")}
    <div class="content">
      ${state.user && !state.user.isGuest ? "" : `<div class="card p3 mb3" style="background:#E3F2FD;border:1px solid #90CAF9;">
        <p style="font-size:11.5px;color:#0D47A1;margin:0;line-height:1.5;">🎁 <b>Misafir olarak</b> randevu alabilirsiniz. Sadece ad ve telefon yeterli.</p>
      </div>`}

      <div class="card p5 mb4">
        <div class="field"><label>Hizmet</label><input class="input" value="Muayene" disabled style="background:#EEF6F4;color:var(--muted);" /></div>
        <div class="field"><label>Tarih</label><input class="input" type="date" id="f-date" value="${escapeAttr(f.date)}" min="${accToday()}" /></div>

        <div class="field">
          <label>Saat <span style="color:var(--muted);font-weight:400;">(24 saat açık · 15 dk aralık)</span></label>
          <div style="display:flex;gap:4px;overflow-x:auto;padding:2px 0 8px;">${saatButonlari}</div>
          <p style="font-size:9.5px;color:#888;margin:0 0 6px;">Saat seçin, ardından dakikayı seçin</p>
          <div class="slot-grid" style="grid-template-columns:repeat(4,1fr);">${dakikaButonlari}</div>
          ${f.time ? `<p style="font-size:12px;font-weight:700;color:${geceMi(f.time) ? "#4527A0" : "var(--teal)"};margin:8px 0 0;text-align:center;">Seçilen saat: ${escapeHtml(f.time)}${geceMi(f.time) ? " 🌙" : ""}</p>` : ""}
          ${geceUyari}
        </div>

        ${doktorlar().length ? `<div class="field">
          <label>Hekim Tercihi <span style="color:var(--muted);font-weight:400;">(isteğe bağlı)</span></label>
          <select class="input" id="f-doctor" onchange="state.bookingForm.doctor=this.value;">
            <option value="">— Fark etmez —</option>
            ${doktorlar().map(d => `<option value="${escapeAttr(d.id)}" ${f.doctor === d.id ? "selected" : ""}>${escapeHtml((d.unvan || "") + " " + (d.adSoyad || ""))}${(d.uzmanliklar||[])[0] ? " · " + escapeHtml((d.uzmanliklar||[])[0]) : ""}</option>`).join("")}
          </select>
          <p style="font-size:9px;color:#888;margin:4px 0 0;">Hekim seçmezseniz uygun hekim atanır</p>
        </div>` : ""}

        <div class="field"><label>Ad Soyad</label><input class="input" id="f-name" placeholder="Adınız Soyadınız" value="${escapeAttr(f.name)}" /></div>
        <div class="field"><label>Telefon</label><input class="input" id="f-phone" type="tel" placeholder="05xx xxx xx xx" value="${escapeAttr(f.phone)}" /></div>
        <div class="field"><label>Not (isteğe bağlı)</label><input class="input" id="f-note" placeholder="Örn: diş ağrım var" value="${escapeAttr(f.note || "")}" /></div>

        <div style="background:#F1F8E9;border:1px solid #C5E1A5;border-radius:10px;padding:10px;margin-bottom:12px;">
          <label style="display:flex;align-items:flex-start;gap:8px;cursor:pointer;">
            <input type="checkbox" id="f-kvkk" ${f.kvkk ? "checked" : ""} style="margin-top:2px;flex-shrink:0;" />
            <span style="font-size:10.5px;color:#33691E;line-height:1.6;">
              <b>Kişisel verilerimin işlenmesine onay veriyorum.</b><br/>
              Randevu ve tedavi amacıyla ad, telefon ve sağlık bilgilerimin
              <button type="button" data-action="goto" data-screen="kvkk" style="background:none;border:none;padding:0;color:#2E7D32;text-decoration:underline;font-size:10.5px;cursor:pointer;font-weight:700;">KVKK Aydınlatma Metni</button>
              kapsamında işlenmesini kabul ediyorum.
            </span>
          </label>
        </div>

        <button class="btn-primary" data-action="submit-booking" ${!canSubmit || !f.kvkk || state.bookingStatus === "saving" ? "disabled" : ""}>
          ${state.bookingStatus === "saving" ? "Kaydediliyor…" : "📅 Randevuyu Onayla"}
        </button>
        ${canSubmit && !f.kvkk ? `<p style="font-size:10.5px;color:#C62828;text-align:center;margin:8px 0 0;">⚠️ Devam etmek için KVKK onayını işaretleyin</p>` : ""}
        ${statusHtml}
      </div>

      <div class="card p4 mb3" style="background:#F1F8E9;border:1px solid #C5E1A5;">
        <p style="font-size:11.5px;font-weight:700;color:#33691E;margin:0 0 6px;">📍 Kliniğimiz</p>
        <p style="font-size:11px;color:#558B2F;margin:0 0 8px;">${escapeHtml(konumKisa())}</p>
        <a href="${konumLinki()}" target="_blank" rel="noopener" class="btn-primary" style="text-decoration:none;background:#558B2F;font-size:12px;padding:10px;">🗺️ Haritada Aç</a>
      </div>

      ${state.myAppointments.length ? `<p class="section-label">Bu oturumda aldığınız randevular</p>
      ${state.myAppointments.slice().reverse().map(a => `
        <div class="card p3 mb2">
          <p style="font-size:12.5px;font-weight:700;margin:0;">${escapeHtml(a.name)}</p>
          <p style="font-size:11px;color:var(--muted);margin:2px 0 0;">${accTarihTR(a.date)} · ${escapeHtml(a.time)}${geceMi(a.time) ? " 🌙" : ""}</p>
        </div>`).join("")}` : ""}
    </div>`;
}

/* =========================================================
   YÖNETİCİ: RANDEVU YÖNETİMİ
========================================================= */

function randevuFiltrele(r, filtre) {
  if (filtre === "tumu") return true;
  if (filtre === "bugun") { const y = randevuYakinlik(r); return y.gun === 0; }
  if (filtre === "gelecek") { const y = randevuYakinlik(r); return y.gun >= 0 && r.status !== "iptal"; }
  if (filtre === "gecmis") { const y = randevuYakinlik(r); return y.gun < 0; }
  return r.status === filtre;
}
