/* =========================================================
   NUR DİŞ — ANKET & HATIRLATMA — memnuniyet anketi, randevu hatırlatma
   app.js'ten bölündü · index.html yükleme sırası önemli
========================================================= */

/* =========================================================
   NUR DİŞ — ANKET ve HATIRLATMA v10
   • Tedavi sonrası memnuniyet anketi (WhatsApp 1-5 yıldız)
   • Randevu hatırlatma (bugün / yarın / 1 saat kala)
========================================================= */

/* ---------------- ANKET MESAJLARI ---------------- */

const ANKET_MSG =
`İyi günler Sayın {ad}

Bugün kliniğimizi tercih ettiğiniz için teşekkür ederiz 🤍

Deneyiminizi 1-5 yıldız ile puanlar mısınız?
1 ⭐ · 2 ⭐⭐ · 3 ⭐⭐⭐ · 4 ⭐⭐⭐⭐ · 5 ⭐⭐⭐⭐⭐

Görüşünüz bizim için çok değerli.

Nur Diş & Dental Klinik`;

const ANKET_MSG_KOTU =
`Sayın {ad}

Görüşünüz için teşekkür ederiz. Yaşadığınız memnuniyetsizliği düzeltmek isteriz.

Sizi tekrar kliniğimize bekliyoruz, dilerseniz bize yazabilirsiniz.

Nur Diş & Dental Klinik`;

function anketMesaj(ad, kotu) {
  const ozel = (state.anketSablon || {})[kotu ? "kotu" : "normal"];
  let m = (ozel && ozel.trim()) ? ozel : (kotu ? ANKET_MSG_KOTU : ANKET_MSG);
  return m.replace(/\{ad\}/g, ad || "hastamız");
}

/* Anket kaydı oluştur (randevu "geldi" işaretlenince) */
function anketOlustur(randevu) {
  if (!state.anketler) state.anketler = [];
  const varMi = state.anketler.find(a => a.randevuId === randevu.id);
  if (varMi) return varMi;

  const kayit = {
    id: "ank_" + Date.now() + "_" + Math.random().toString(36).slice(2, 5),
    randevuId: randevu.id,
    name: randevu.name || "",
    phone: randevu.phone || "",
    service: randevu.service || "Muayene",
    tarih: randevu.date || accToday(),
    gonderildi: false,
    gonderimTarihi: null,
    puan: null,
    yorum: "",
    yanitTarihi: null
  };
  state.anketler.unshift(kayit);
  return kayit;
}

function anketKaydet() {
  localStorage.setItem("nurdis_anketler", JSON.stringify((state.anketler || []).slice(0, 1500)));
  if (typeof saveAccountingToFirebase === "function") saveAccountingToFirebase();
}

/* Anket istatistikleri */
function anketIstatistik() {
  const l = state.anketler || [];
  const yanitli = l.filter(a => a.puan !== null && a.puan !== undefined);
  const gonderilen = l.filter(a => a.gonderildi);
  const ort = yanitli.length ? yanitli.reduce((s, a) => s + accNum(a.puan), 0) / yanitli.length : 0;
  const dagilim = [1, 2, 3, 4, 5].map(p => ({ puan: p, adet: yanitli.filter(a => accNum(a.puan) === p).length }));
  const memnun = yanitli.filter(a => accNum(a.puan) >= 4).length;
  const memnunOran = yanitli.length ? (memnun / yanitli.length) * 100 : 0;
  const yanitOran = gonderilen.length ? (yanitli.length / gonderilen.length) * 100 : 0;
  const dusuk = yanitli.filter(a => accNum(a.puan) <= 2);

  return { toplam: l.length, gonderilen: gonderilen.length, yanitli: yanitli.length, ort, dagilim, memnunOran, yanitOran, dusuk };
}

/* =========================================================
   RENDER: ANKET SEKMESİ
========================================================= */

function renderAccAnket() {
  const ist = anketIstatistik();
  const liste = state.anketler || [];
  const altTab = state.anketTab || "bekleyen";

  const chip = (id, label, adet) => {
    const aktif = altTab === id;
    return `<button data-action="anket-tab" data-tab="${id}" style="flex:1;padding:8px 3px;border-radius:10px;font-size:10px;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif;border:1px solid ${aktif ? "#AD1457" : "var(--line)"};background:${aktif ? "#AD1457" : "rgba(255,255,255,.7)"};color:${aktif ? "#fff" : "var(--ink)"};cursor:pointer;line-height:1.3;">${label}<br/><span style="font-size:12px;">${adet}</span></button>`;
  };

  let icerik = "";

  if (altTab === "bekleyen") {
    const bekleyen = liste.filter(a => !a.gonderildi);
    icerik = bekleyen.length ? bekleyen.map(a => `
      <div class="card p3 mb2">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
          <div style="flex:1;min-width:0;">
            <p style="font-size:12.5px;font-weight:700;margin:0;">${escapeHtml(a.name)}</p>
            <p style="font-size:10px;color:var(--muted);margin:2px 0 0;">${escapeHtml(a.service)} · ${accTarihTR(a.tarih)}</p>
            <p style="font-size:9.5px;color:#888;margin:2px 0 0;">${escapeHtml(a.phone || "telefon yok")}</p>
          </div>
          ${a.phone
            ? `<button data-action="anket-gonder" data-id="${a.id}"
                 style="background:#25D366;color:#fff;border:none;border-radius:7px;padding:7px 10px;font-size:10.5px;font-weight:700;flex-shrink:0;cursor:pointer;">💬 Gönder</button>`
            : `<span style="font-size:18px;opacity:.3;">💬</span>`}
        </div>
      </div>`).join("") : `<div class="card p4" style="text-align:center;background:#E8F5E9;border:1px solid #A5D6A7;">
        <p style="font-size:12.5px;margin:0;color:#1B5E20;font-weight:700;">✅ Gönderilmeyi bekleyen anket yok</p>
        <p style="font-size:10px;color:#2E7D32;margin:4px 0 0;">Randevuyu "Geldi" işaretleyince anket otomatik oluşur.</p>
      </div>`;
  }

  if (altTab === "yanit") {
    const yanitBekleyen = liste.filter(a => a.gonderildi && (a.puan === null || a.puan === undefined));
    icerik = yanitBekleyen.length ? yanitBekleyen.map(a => `
      <div class="card p3 mb2">
        <p style="font-size:12.5px;font-weight:700;margin:0 0 2px;">${escapeHtml(a.name)}</p>
        <p style="font-size:10px;color:var(--muted);margin:0 0 8px;">${accTarihTR(a.gonderimTarihi)} gönderildi · ${escapeHtml(a.phone)}</p>
        <p style="font-size:10px;color:#555;margin:0 0 6px;">Hastanın verdiği puan:</p>
        <div style="display:flex;gap:4px;">
          ${[1, 2, 3, 4, 5].map(p => `<button data-action="anket-puan" data-id="${a.id}" data-puan="${p}"
            style="flex:1;background:${p >= 4 ? "#E8F5E9" : "#FFEBEE"};border:none;border-radius:7px;padding:9px 2px;cursor:pointer;font-size:11px;font-weight:700;color:${p >= 4 ? "#2E7D32" : "#C62828"};">${p}⭐</button>`).join("")}
        </div>
      </div>`).join("") : `<div class="card p4" style="text-align:center;"><p class="footnote" style="margin:0;">Yanıt bekleyen anket yok.</p></div>`;
  }

  if (altTab === "sonuc") {
    const yanitli = liste.filter(a => a.puan !== null && a.puan !== undefined)
      .sort((a, b) => new Date(b.yanitTarihi) - new Date(a.yanitTarihi));

    const dagilimBar = ist.dagilim.map(d => {
      const max = Math.max(1, ...ist.dagilim.map(x => x.adet));
      return `<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
        <span style="font-size:10px;width:26px;">${d.puan}⭐</span>
        <div style="flex:1;height:14px;background:#F0F0F0;border-radius:4px;overflow:hidden;">
          <div style="height:100%;width:${d.adet / max * 100}%;background:${d.puan >= 4 ? "#2E7D32" : d.puan === 3 ? "#F9A825" : "#C62828"};border-radius:4px;"></div>
        </div>
        <span style="font-size:10px;font-weight:700;width:22px;text-align:right;">${d.adet}</span>
      </div>`;
    }).join("");

    icerik = `
      <div class="card p4 mb3" style="background:linear-gradient(135deg,#880E4F,#AD1457);color:#fff;border:none;">
        <p style="font-size:13px;font-weight:700;margin:0 0 2px;">⭐ Memnuniyet Skoru</p>
        <p style="font-size:10.5px;opacity:.85;margin:0 0 10px;">${ist.yanitli} yanıt · ${ist.gonderilen} gönderim</p>
        <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:10px;text-align:center;">
          <p style="font-size:28px;font-weight:800;margin:0;">${ist.ort.toFixed(1)}<span style="font-size:15px;opacity:.7;">/5</span></p>
          <p style="font-size:11px;margin:3px 0 0;opacity:.9;">${"⭐".repeat(Math.round(ist.ort))}</p>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;">
          <div style="background:rgba(255,255,255,.15);border-radius:8px;padding:7px;text-align:center;">
            <p style="font-size:8.5px;margin:0;opacity:.85;">MEMNUN (4-5)</p>
            <p style="font-size:14px;font-weight:800;margin:2px 0 0;">%${ist.memnunOran.toFixed(0)}</p>
          </div>
          <div style="background:rgba(255,255,255,.15);border-radius:8px;padding:7px;text-align:center;">
            <p style="font-size:8.5px;margin:0;opacity:.85;">YANIT ORANI</p>
            <p style="font-size:14px;font-weight:800;margin:2px 0 0;">%${ist.yanitOran.toFixed(0)}</p>
          </div>
        </div>
      </div>

      <div class="card p4 mb3">
        <p style="font-size:12px;font-weight:700;margin:0 0 10px;">📊 Puan Dağılımı</p>
        ${dagilimBar}
      </div>

      ${ist.dusuk.length ? `<div class="card p3 mb3" style="background:#FFEBEE;border:1px solid #EF9A9A;">
        <p style="font-size:11.5px;font-weight:700;color:#C62828;margin:0;">⚠️ ${ist.dusuk.length} hasta düşük puan verdi</p>
        <p style="font-size:10px;color:#B71C1C;margin:3px 0 0;">Bu hastaları arayıp geri kazanmak sadakati artırır.</p>
      </div>` : ""}

      <p class="section-label">Yanıtlar (${yanitli.length})</p>
      ${yanitli.length ? yanitli.map(a => {
        const p = accNum(a.puan);
        const renk = p >= 4 ? "#2E7D32" : p === 3 ? "#F9A825" : "#C62828";
        return `<div class="card p3 mb2" style="border-left:3px solid ${renk};">
          <div style="display:flex;justify-content:space-between;gap:8px;">
            <div style="flex:1;min-width:0;">
              <p style="font-size:12px;font-weight:700;margin:0;">${escapeHtml(a.name)}</p>
              <p style="font-size:9.5px;color:var(--muted);margin:2px 0 0;">${escapeHtml(a.service)} · ${accTarihTR(a.yanitTarihi)}</p>
              ${a.yorum ? `<p style="font-size:10px;color:#555;margin:4px 0 0;font-style:italic;">"${escapeHtml(a.yorum)}"</p>` : ""}
            </div>
            <div style="text-align:right;flex-shrink:0;">
              <p style="font-size:14px;font-weight:800;margin:0;color:${renk};">${p}⭐</p>
              ${a.phone ? `<a href="${waLink(a.phone, p <= 3 ? anketMesaj(a.name, true) : "Teşekkür ederiz!")}" target="_blank" rel="noopener" style="display:inline-block;margin-top:4px;background:#25D366;color:#fff;text-decoration:none;border-radius:6px;padding:4px 7px;font-size:10px;">💬</a>` : ""}
            </div>
          </div>
        </div>`;
      }).join("") : `<p class="footnote">Henüz yanıt yok.</p>`}
    `;
  }

  return `
    <div style="display:flex;gap:5px;margin-bottom:12px;">
      ${chip("bekleyen", "Gönderilecek", liste.filter(a => !a.gonderildi).length)}
      ${chip("yanit", "Yanıt Gir", liste.filter(a => a.gonderildi && (a.puan === null || a.puan === undefined)).length)}
      ${chip("sonuc", "Sonuçlar", ist.yanitli)}
    </div>

    ${icerik}

    <div class="card p4 mb3" style="background:#FCE4EC;border:1px solid #F8BBD0;margin-top:12px;">
      <p style="font-size:11.5px;font-weight:700;color:#880E4F;margin:0 0 6px;">💡 Memnuniyet anketi neden önemli?</p>
      <p style="font-size:10.5px;color:#AD1457;margin:0;line-height:1.7;">
        • Memnun hasta <b>3 kat daha fazla</b> arkadaşına tavsiye eder<br/>
        • Düşük puan veren hastayı <b>hemen arayıp</b> geri kazanabilirsin<br/>
        • Google yorumlarına olumlu yansır<br/>
        • Hizmet kalitesindeki düşüşü erken fark edersin
      </p>
    </div>
  `;
}

/* =========================================================
   RENDER: HATIRLATMA (randevu bazlı)
========================================================= */

function renderAccRandevuHatirlatma() {
  const bugun = new Date(); bugun.setHours(0, 0, 0, 0);
  const appts = (state.appointments || []).filter(a => a.status !== "iptal");

  const bugunku = appts.filter(a => {
    const d = new Date(a.date + "T00:00:00");
    return Math.round((d - bugun) / 86400000) === 0;
  }).sort((a, b) => (a.time || "").localeCompare(b.time || ""));

  const yarin = appts.filter(a => {
    const d = new Date(a.date + "T00:00:00");
    return Math.round((d - bugun) / 86400000) === 1;
  }).sort((a, b) => (a.time || "").localeCompare(b.time || ""));

  const yaklasan1saat = bugunku.filter(a => {
    if (!a.time) return false;
    const [h, m] = a.time.split(":").map(Number);
    const t = new Date(); t.setHours(h, m, 0, 0);
    const fark = (t - new Date()) / 60000;
    return fark > 0 && fark <= 90;
  });

  const kart = (a, tip) => {
    const tel = (a.phone || "").replace(/\D/g, "");
    const telOk = tel.length >= 10;
    const mesaj = randevuMesaj(tip === "bugun" ? "hatirlatma" : "hatirlatma", a);
    return `<div class="card p3 mb2" style="border-left:3px solid ${tip === "saat" ? "#C62828" : "#0277BD"};">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
        <div style="flex:1;min-width:0;">
          <p style="font-size:12.5px;font-weight:700;margin:0;">${escapeHtml(a.name)}</p>
          <p style="font-size:11px;color:${tip === "saat" ? "#C62828" : "#0277BD"};font-weight:700;margin:2px 0 0;">${escapeHtml(a.time || "")} · ${escapeHtml(a.service || "Muayene")}</p>
          <p style="font-size:9.5px;color:#888;margin:2px 0 0;">${escapeHtml(a.phone || "telefon yok")}</p>
        </div>
        <div style="display:flex;gap:4px;flex-shrink:0;">
          ${telOk ? `<a href="tel:+9${tel.startsWith("0") ? tel : "0" + tel}" style="background:#E8F5E9;border-radius:7px;padding:7px 8px;text-decoration:none;font-size:12px;">📞</a>` : ""}
          ${telOk ? `<a href="${waLink(a.phone, mesaj)}" target="_blank" rel="noopener" data-action="hatirlat-gonderildi" data-id="${a.id}" style="background:#25D366;border-radius:7px;padding:7px 8px;text-decoration:none;font-size:12px;">💬</a>` : ""}
        </div>
      </div>
    </div>`;
  };

  const gonderilen = (state.hatirlatmaLog || []).slice(0, 10);

  return `
    ${yaklasan1saat.length ? `<div class="card p3 mb3" style="background:#FFEBEE;border:1px solid #EF9A9A;">
      <p style="font-size:12px;font-weight:700;color:#C62828;margin:0;">⏰ ${yaklasan1saat.length} randevu 1,5 saat içinde</p>
      <p style="font-size:10px;color:#B71C1C;margin:3px 0 0;">Hemen hatırlatma gönder.</p>
    </div>` : ""}

    <div class="card p4 mb3" style="background:linear-gradient(135deg,#01579B,#0277BD);color:#fff;border:none;">
      <p style="font-size:13px;font-weight:700;margin:0 0 2px;">⏰ Randevu Hatırlatma</p>
      <p style="font-size:10.5px;opacity:.85;margin:0 0 10px;">Bugün ${bugunku.length} · Yarın ${yarin.length}</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:8px;text-align:center;">
          <p style="font-size:9px;margin:0;opacity:.85;">BUGÜN</p>
          <p style="font-size:16px;font-weight:800;margin:2px 0 0;">${bugunku.length}</p>
        </div>
        <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:8px;text-align:center;">
          <p style="font-size:9px;margin:0;opacity:.85;">YARIN</p>
          <p style="font-size:16px;font-weight:800;margin:2px 0 0;">${yarin.length}</p>
        </div>
      </div>
    </div>

    ${yaklasan1saat.length ? `<p class="section-label">⏰ 1,5 Saat İçinde</p>${yaklasan1saat.map(a => kart(a, "saat")).join("")}` : ""}

    <p class="section-label">Bugünkü Randevular (${bugunku.length})</p>
    ${bugunku.length ? bugunku.map(a => kart(a, "bugun")).join("") : `<div class="card p4" style="text-align:center;"><p class="footnote" style="margin:0;">Bugün randevu yok.</p></div>`}

    <p class="section-label" style="margin-top:14px;">Yarınki Randevular (${yarin.length})</p>
    ${yarin.length ? yarin.map(a => kart(a, "yarin")).join("") : `<div class="card p4" style="text-align:center;"><p class="footnote" style="margin:0;">Yarın randevu yok.</p></div>`}

    ${gonderilen.length ? `<p class="section-label" style="margin-top:14px;">Son Gönderilenler</p>
    <div class="card p4 mb3">
      ${gonderilen.map(h => `<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--line);">
        <span style="font-size:11px;">${escapeHtml(h.name)}</span>
        <span style="font-size:9.5px;color:#888;">${accTarihTR(h.tarih)}</span>
      </div>`).join("")}
    </div>` : ""}

    <button class="btn-primary mb3" style="background:#0277BD;font-size:12px;padding:12px;" data-action="hatirlat-toplu">📤 Yarınki Tüm Hastalara Hatırlatma</button>

    <div class="card p4 mb3" style="background:#E1F5FE;border:1px solid #81D4FA;">
      <p style="font-size:11.5px;font-weight:700;color:#01579B;margin:0 0 6px;">💡 Hatırlatma etkisi</p>
      <p style="font-size:10.5px;color:#0277BD;margin:0;line-height:1.7;">
        Randevu hatırlatması <b>no-show oranını %50-65 azaltır</b>.
        WhatsApp'ın açılma oranı <b>%98</b> (SMS %20-30).<br/>
        En etkili zaman: <b>randevudan 1 gün önce</b> + <b>2 saat önce</b>.
      </p>
    </div>
  `;
}

function renderAppointmentsAdmin() {
  const filtre = state.rvFiltre || "gelecek";
  const ara = (state.rvArama || "").toLowerCase().trim();

  let liste = (state.appointments || []).filter(r => randevuFiltrele(r, filtre));
  if (ara) {
    liste = liste.filter(r =>
      (r.name || "").toLowerCase().includes(ara) ||
      (r.phone || "").replace(/\s/g, "").includes(ara.replace(/\s/g, ""))
    );
  }
  liste = liste.sort((a, b) => {
    const da = new Date(a.date + "T" + (a.time || "00:00"));
    const db = new Date(b.date + "T" + (b.time || "00:00"));
    return filtre === "gecmis" ? db - da : da - db;
  });

  /* İstatistikler */
  const bugun = (state.appointments || []).filter(r => randevuYakinlik(r).gun === 0 && r.status !== "iptal").length;
  const gelecek = (state.appointments || []).filter(r => randevuYakinlik(r).gun > 0 && r.status !== "iptal").length;
  const gelmedi = (state.appointments || []).filter(r => r.status === "gelmedi").length;
  const toplam = (state.appointments || []).length;
  const noShow = toplam ? (gelmedi / toplam) * 100 : 0;

  const filtreChip = (id, label, adet) => {
    const aktif = filtre === id;
    return `<button data-action="rv-filtre" data-f="${id}" style="flex:0 0 auto;padding:7px 12px;border-radius:16px;font-size:10.5px;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif;border:1px solid ${aktif ? "#0B6E86" : "var(--line)"};background:${aktif ? "#0B6E86" : "rgba(255,255,255,.7)"};color:${aktif ? "#fff" : "var(--ink)"};cursor:pointer;white-space:nowrap;">${label}${adet != null ? " " + adet : ""}</button>`;
  };

  const ed = state.rvEdit;
  let formHtml = "";
  if (ed !== null && ed !== undefined) {
    const r = (state.appointments || []).find(x => x.id === ed) || {
      id: "", date: accToday(), time: "09:00", name: "", phone: "", note: "", status: "bekliyor", service: "Muayene"
    };
    formHtml = `<div class="card p4 mb3" style="border:2px solid #0B6E86;background:#E0F7FA;">
      <p style="font-size:13px;font-weight:700;margin:0 0 10px;color:#006064;">${r.id ? "✏️ Randevuyu Düzenle" : "➕ Yeni Randevu"}</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div class="field"><label>Tarih</label><input class="input" type="date" id="rv-date" value="${escapeAttr(r.date)}" /></div>
        <div class="field"><label>Saat</label>
          <select class="input" id="rv-time">
            ${TIME_SLOTS.map(t => `<option ${r.time === t ? "selected" : ""}>${t}${geceMi(t) ? " 🌙" : ""}</option>`).join("")}
          </select>
        </div>
      </div>
      <div class="field"><label>Ad Soyad</label><input class="input" id="rv-name" value="${escapeAttr(r.name)}" placeholder="Hasta adı" /></div>
      <div class="field"><label>Telefon</label><input class="input" id="rv-phone" type="tel" value="${escapeAttr(r.phone)}" placeholder="05xx xxx xx xx" /></div>
      <div class="field"><label>Hizmet</label>
        <select class="input" id="rv-service">
          ${["Muayene", "Kontrol", "Dolgu", "Kanal Tedavisi", "İmplant", "Zirkonyum", "Beyazlatma", "Ortodonti", "Protez", "Çekim", "Diğer"].map(s => `<option ${r.service === s ? "selected" : ""}>${s}</option>`).join("")}
        </select>
      </div>
      <div class="field"><label>Durum</label>
        <select class="input" id="rv-status">
          ${Object.entries(RANDEVU_DURUM).map(([k, v]) => `<option value="${k}" ${r.status === k ? "selected" : ""}>${v.ikon} ${v.ad}</option>`).join("")}
        </select>
      </div>
      <div class="field"><label>Not</label><input class="input" id="rv-note" value="${escapeAttr(r.note || "")}" placeholder="Örn: diş ağrısı" /></div>
      <div style="display:flex;gap:8px;">
        <button class="btn-primary" style="background:#006064;" data-action="rv-save" data-id="${r.id || ""}">💾 Kaydet</button>
        <button class="btn-primary" style="background:#757575;" data-action="rv-cancel">İptal</button>
      </div>
    </div>`;
  }

  const kartlar = liste.slice(0, 60).map(r => {
    const d = randevuDurum(r);
    const y = randevuYakinlik(r);
    const tel = (r.phone || "").replace(/\D/g, "");
    const telOk = tel.length >= 10;
    return `<div class="card p3 mb2" style="border-left:4px solid ${d.renk};">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
        <div style="flex:1;min-width:0;">
          <p style="font-size:12.5px;font-weight:700;margin:0;">${escapeHtml(r.name || "-")}</p>
          <p style="font-size:11px;color:${y.renk};font-weight:700;margin:2px 0 0;">${d.ikon} ${escapeHtml(r.date || "")} · ${escapeHtml(r.time || "")} <span style="opacity:.7;font-weight:500;">(${y.etiket})</span></p>
          <p style="font-size:10px;color:var(--muted);margin:2px 0 0;">${escapeHtml(r.service || "Muayene")}${r.note ? " · " + escapeHtml(r.note) : ""}</p>
          <p style="font-size:10px;color:#888;margin:2px 0 0;">${escapeHtml(r.phone || "telefon yok")}</p>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:4px;margin-top:8px;">
        ${telOk
          ? `<a href="tel:+9${tel.startsWith("0") ? tel : "0" + tel}" style="background:#E8F5E9;border:none;border-radius:7px;padding:8px 2px;text-align:center;text-decoration:none;font-size:13px;">📞</a>`
          : `<span style="background:#F5F5F5;border-radius:7px;padding:8px 2px;text-align:center;opacity:.3;font-size:13px;">📞</span>`}
        ${telOk
          ? `<button data-action="rv-mesaj" data-id="${r.id}" style="background:#E8F5E9;border:none;border-radius:7px;padding:8px 2px;cursor:pointer;text-align:center;font-size:13px;">💬</button>`
          : `<span style="background:#F5F5F5;border-radius:7px;padding:8px 2px;text-align:center;opacity:.3;font-size:13px;">💬</span>`}
        ${telOk
          ? `<button data-action="rv-konum" data-id="${r.id}" style="background:#E3F2FD;border:none;border-radius:7px;padding:8px 2px;cursor:pointer;text-align:center;font-size:13px;">📍</button>`
          : `<span style="background:#F5F5F5;border-radius:7px;padding:8px 2px;text-align:center;opacity:.3;font-size:13px;">📍</span>`}
        <button data-action="rv-edit" data-id="${r.id}" style="background:#FFF3E0;border:none;border-radius:7px;padding:8px 2px;cursor:pointer;font-size:13px;">✏️</button>
        <button data-action="rv-delete" data-id="${r.id}" style="background:#FFEBEE;border:none;border-radius:7px;padding:8px 2px;cursor:pointer;font-size:13px;color:#C62828;">🗑️</button>
      </div>
      <div style="display:flex;gap:4px;margin-top:4px;">
        ${Object.entries(RANDEVU_DURUM).filter(([k]) => k !== r.status).map(([k, v]) =>
          `<button data-action="rv-durum" data-id="${r.id}" data-st="${k}" style="flex:1;background:${v.bg};border:none;border-radius:6px;padding:5px 2px;cursor:pointer;font-size:9px;color:${v.renk};font-weight:600;">${v.ikon} ${v.ad}</button>`
        ).join("")}
      </div>
    </div>`;
  }).join("") || `<div class="card p4" style="text-align:center;"><p class="footnote" style="margin:0;">Bu filtrede randevu yok.</p></div>`;

  return `
    <div class="card p4 mb3" style="background:linear-gradient(135deg,#004D40,#00695C);color:#fff;border:none;">
      <p style="font-size:13px;font-weight:700;margin:0 0 2px;">📅 Randevu Yönetimi</p>
      <p style="font-size:10.5px;opacity:.85;margin:0 0 10px;">${toplam} toplam randevu</p>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;">
        <div style="background:rgba(255,255,255,.15);border-radius:9px;padding:7px;text-align:center;">
          <p style="font-size:8.5px;margin:0;opacity:.85;">BUGÜN</p>
          <p style="font-size:15px;font-weight:800;margin:2px 0 0;">${bugun}</p>
        </div>
        <div style="background:rgba(255,255,255,.15);border-radius:9px;padding:7px;text-align:center;">
          <p style="font-size:8.5px;margin:0;opacity:.85;">GELECEK</p>
          <p style="font-size:15px;font-weight:800;margin:2px 0 0;">${gelecek}</p>
        </div>
        <div style="background:rgba(255,255,255,.15);border-radius:9px;padding:7px;text-align:center;">
          <p style="font-size:8.5px;margin:0;opacity:.85;">NO-SHOW</p>
          <p style="font-size:15px;font-weight:800;margin:2px 0 0;">%${noShow.toFixed(0)}</p>
        </div>
      </div>
    </div>

    <input class="input mb3" id="rv-arama" placeholder="🔍 İsim veya telefon ara..." value="${escapeAttr(state.rvArama || "")}" data-action-blur="rv-ara" style="font-size:12px;" />

    <div style="display:flex;gap:5px;overflow-x:auto;padding-bottom:8px;margin-bottom:10px;">
      ${filtreChip("bugun", "Bugün", bugun)}
      ${filtreChip("gelecek", "Gelecek")}
      ${filtreChip("gecmis", "Geçmiş")}
      ${filtreChip("gelmedi", "Gelmedi", gelmedi)}
      ${filtreChip("tumu", "Tümü", toplam)}
    </div>

    ${formHtml}
    ${ed === null || ed === undefined ? `<button class="btn-primary mb3" style="background:#00695C;" data-action="rv-new">➕ Yeni Randevu</button>` : ""}

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px;">
      <a href="${konumLinki()}" target="_blank" rel="noopener" class="btn-primary" style="text-decoration:none;background:#1565C0;font-size:11.5px;padding:10px;">📍 Kliniğin Konumu</a>
      <button class="btn-primary" style="background:#0E93AC;font-size:11.5px;padding:10px;" data-action="rv-csv">⬇️ CSV İndir</button>
    </div>

    <p class="section-label">Randevular (${liste.length})</p>
    ${kartlar}

    <div class="card p4 mb3" style="background:#E0F2F1;border:1px solid #80CBC4;margin-top:12px;">
      <p style="font-size:11.5px;font-weight:700;color:#00695C;margin:0 0 6px;">💡 Tek tıkla ne yapabilirsin?</p>
      <p style="font-size:10.5px;color:#00897B;margin:0;line-height:1.7;">
        <b>📞</b> Hastayı doğrudan ara<br/>
        <b>💬</b> WhatsApp'tan randevu onay mesajı gönder<br/>
        <b>📍</b> WhatsApp'tan konum linki gönder<br/>
        <b>✏️</b> Randevuyu düzenle · <b>🗑️</b> Sil<br/>
        Alttaki durum butonlarıyla tek dokunuşta <b>Geldi / Gelmedi / Onaylandı</b> işaretle.
      </p>
    </div>

    <div class="card p4 mb3">
      <p style="font-size:11.5px;font-weight:700;color:#004D40;margin:0 0 8px;">⚙️ Klinik Konumu</p>
      <div class="field" style="margin-bottom:8px;"><label style="font-size:10px;">Adres</label>
        <input class="input" id="kon-adres" value="${escapeAttr(klinikKonumAyar().adres || "")}" style="font-size:11px;padding:8px;" />
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div class="field" style="margin-bottom:8px;"><label style="font-size:10px;">Enlem (lat)</label>
          <input class="input" id="kon-lat" value="${escapeAttr(String(klinikKonumAyar().lat || ""))}" placeholder="37.1900" style="font-size:11px;padding:8px;" />
        </div>
        <div class="field" style="margin-bottom:8px;"><label style="font-size:10px;">Boylam (lon)</label>
          <input class="input" id="kon-lon" value="${escapeAttr(String(klinikKonumAyar().lon || ""))}" placeholder="40.5800" style="font-size:11px;padding:8px;" />
        </div>
      </div>
      <button class="btn-primary" style="background:#004D40;font-size:11.5px;padding:10px;" data-action="konum-kaydet">💾 Konumu Kaydet</button>
      <p style="font-size:9px;color:#888;margin:6px 0 0;line-height:1.5;">
        Koordinat girmezsen adresle arama yapılır. Google Maps'te kliniği bulup bağlantıdaki
        <b>@37.19,40.58</b> kısmından koordinatı alabilirsin.
      </p>
    </div>
  `;
}

function renderAccHastaHatirlatma() {
  const altTab = state.hhTab || "kontrol";
  const ayEsik = accNum((state.hhAyar || {}).ay) || 6;
  const kontrol = hastaKontrolListesi(ayEsik);
  const kayip = hastaKayipListesi(12);
  const randevu = yakinRandevular(3);

  const chip = (id, label, adet) => {
    const aktif = altTab === id;
    return `<button data-action="hh-tab" data-tab="${id}" style="flex:1;padding:8px 4px;border-radius:10px;font-size:10.5px;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif;border:1px solid ${aktif ? "#00695C" : "var(--line)"};background:${aktif ? "#00695C" : "rgba(255,255,255,.7)"};color:${aktif ? "#fff" : "var(--ink)"};cursor:pointer;line-height:1.3;">${label}<br/><span style="font-size:12px;">${adet}</span></button>`;
  };

  let icerik = "";

  if (altTab === "kontrol") {
    icerik = kontrol.length ? kontrol.map(h => {
      const mesaj = mesajDoldur("kontrol", {
        ad: h.ad,
        islem: h.sonIslemAdi || "tedavi",
        ay: Math.floor(h.ayFark)
      });
      return `<div class="card p3 mb2">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
          <div style="flex:1;min-width:0;">
            <p style="font-size:12.5px;font-weight:700;margin:0;">${escapeHtml(h.ad)}</p>
            <p style="font-size:10px;color:var(--muted);margin:2px 0 0;">${escapeHtml(h.sonIslemAdi || "")} · ${accTarihTR(h.sonIslemTarihi)}</p>
            <p style="font-size:10.5px;color:#E65100;font-weight:700;margin:3px 0 0;">${Math.floor(h.ayFark)} ay geçti (${h.gunFark} gün)</p>
            <p style="font-size:9.5px;color:#888;margin:2px 0 0;">${h.adet} işlem · ${accTL0(h.toplam)} ciro${h.tel ? " · " + escapeHtml(h.tel) : " · ⚠️ telefon yok"}</p>
          </div>
          ${h.tel
            ? `<a href="${waLink(h.tel, mesaj)}" target="_blank" rel="noopener" style="background:#25D366;color:#fff;text-decoration:none;border-radius:7px;padding:7px 10px;font-size:11px;font-weight:700;flex-shrink:0;">💬</a>`
            : `<span style="font-size:18px;opacity:.3;">💬</span>`}
        </div>
      </div>`;
    }).join("") : `<div class="card p4" style="text-align:center;background:#E8F5E9;border:1px solid #A5D6A7;">
        <p style="font-size:12.5px;margin:0;color:#1B5E20;font-weight:700;">✅ Kontrol zamanı gelen hasta yok</p>
        <p style="font-size:10px;color:#2E7D32;margin:4px 0 0;">Son ${ayEsik} ay içinde tüm hastalar geldi.</p>
      </div>`;

    if (kontrol.length) {
      icerik += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:10px;">
        <button class="btn-primary" style="background:#00695C;font-size:11px;padding:10px;" data-action="hh-kopyala" data-tip="kontrol">📋 Tümünü Kopyala</button>
        <button class="btn-primary" style="background:#0E93AC;font-size:11px;padding:10px;" data-action="hh-yazdir" data-tip="kontrol">🖨️ Liste Yazdır</button>
      </div>`;
    }
  }

  if (altTab === "randevu") {
    icerik = randevu.length ? randevu.map(a => {
      const d = new Date(a.date);
      const gunAdi = d.toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" });
      const mesaj = mesajDoldur("randevu", {
        ad: a.name,
        gun: gunAdi,
        saat: a.time || ""
      });
      return `<div class="card p3 mb2">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
          <div style="flex:1;min-width:0;">
            <p style="font-size:12.5px;font-weight:700;margin:0;">${escapeHtml(a.name)}</p>
            <p style="font-size:10.5px;color:#0277BD;font-weight:700;margin:2px 0 0;">${gunAdi} · ${escapeHtml(a.time || "")}</p>
            <p style="font-size:9.5px;color:#888;margin:2px 0 0;">${escapeHtml(a.phone || "telefon yok")}</p>
          </div>
          ${a.phone
            ? `<a href="${waLink(a.phone, mesaj)}" target="_blank" rel="noopener" style="background:#25D366;color:#fff;text-decoration:none;border-radius:7px;padding:7px 10px;font-size:11px;font-weight:700;flex-shrink:0;">💬</a>`
            : `<span style="font-size:18px;opacity:.3;">💬</span>`}
        </div>
      </div>`;
    }).join("") : `<div class="card p4" style="text-align:center;"><p class="footnote" style="margin:0;">Gelecek 3 günde randevu yok.</p></div>`;
  }

  if (altTab === "kayip") {
    icerik = kayip.length ? kayip.map(h => {
      const mesaj = mesajDoldur("kayip", {
        ad: h.ad,
        ay: Math.floor(h.gunFark / 30)
      });
      return `<div class="card p3 mb2" style="border-left:3px solid #C62828;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
          <div style="flex:1;min-width:0;">
            <p style="font-size:12.5px;font-weight:700;margin:0;">${escapeHtml(h.ad)}</p>
            <p style="font-size:10.5px;color:#C62828;font-weight:700;margin:2px 0 0;">${Math.floor(h.gunFark / 30)} ay gelmedi</p>
            <p style="font-size:9.5px;color:#888;margin:2px 0 0;">${h.adet} işlem · ${accTL0(h.toplam)} toplam ciro</p>
          </div>
          ${h.tel
            ? `<a href="${waLink(h.tel, mesaj)}" target="_blank" rel="noopener" style="background:#25D366;color:#fff;text-decoration:none;border-radius:7px;padding:7px 10px;font-size:11px;font-weight:700;flex-shrink:0;">💬</a>`
            : `<span style="font-size:18px;opacity:.3;">💬</span>`}
        </div>
      </div>`;
    }).join("") : `<div class="card p4" style="text-align:center;"><p class="footnote" style="margin:0;">Kayıp hasta yok.</p></div>`;
  }

  const kayipCiro = kayip.reduce((s, h) => s + h.toplam, 0);
  const kontrolPotansiyel = kontrol.length * (kontrol.length ? kontrol.reduce((s, h) => s + h.ortalama, 0) / kontrol.length : 0);

  return `
    <div class="card p4 mb3" style="background:linear-gradient(135deg,#004D40,#00695C);color:#fff;border:none;">
      <p style="font-size:13px;font-weight:700;margin:0 0 2px;">🔔 Hasta Hatırlatma</p>
      <p style="font-size:10.5px;opacity:.85;margin:0 0 10px;">${kontrol.length} kontrol · ${randevu.length} randevu · ${kayip.length} kayıp</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:8px;">
          <p style="font-size:9px;margin:0;opacity:.85;">KONTROL POTANSİYELİ</p>
          <p style="font-size:15px;font-weight:800;margin:2px 0 0;">${accTL0(kontrolPotansiyel)}</p>
        </div>
        <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:8px;">
          <p style="font-size:9px;margin:0;opacity:.85;">KAYIP HASTA CİROSU</p>
          <p style="font-size:15px;font-weight:800;margin:2px 0 0;">${accTL0(kayipCiro)}</p>
        </div>
      </div>
    </div>

    <div style="display:flex;gap:5px;margin-bottom:12px;">
      ${chip("kontrol", "Kontrol Zamanı", kontrol.length)}
      ${chip("randevu", "Yaklaşan Randevu", randevu.length)}
      ${chip("kayip", "Kayıp Hasta", kayip.length)}
    </div>

    <!-- MESAJ ŞABLONU DÜZENLEME -->
    <div class="card p4 mb3" style="background:#F1F8E9;border:1px solid #C5E1A5;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <p style="font-size:12px;font-weight:700;color:#33691E;margin:0;">✏️ Hazır Mesaj Metni</p>
        <button data-action="hh-sablon-ac" style="background:#7CB342;border:none;border-radius:7px;color:#fff;padding:6px 11px;font-size:10.5px;font-weight:700;cursor:pointer;">${state.hhSablonAcik ? "Kapat" : "Düzenle"}</button>
      </div>
      ${state.hhSablonAcik ? `
      <p style="font-size:9.5px;color:#558B2F;margin:0 0 8px;line-height:1.5;">
        Değişkenler: <b>{ad}</b> hasta adı · <b>{islem}</b> tedavi · <b>{ay}</b> geçen ay
      </p>
      <textarea id="hh-sablon" style="width:100%;min-height:170px;font-size:11px;padding:9px;border:1px solid #C5E1A5;border-radius:8px;font-family:inherit;line-height:1.5;resize:vertical;">${escapeHtml(mesajSablonu(state.hhTab === "kayip" ? "kayip" : state.hhTab === "randevu" ? "randevu" : "kontrol"))}</textarea>
      <div style="display:flex;gap:6px;margin-top:8px;">
        <button class="btn-primary" style="background:#558B2F;font-size:11px;padding:10px;flex:1;" data-action="hh-sablon-kaydet" data-tip="${state.hhTab === "kayip" ? "kayip" : state.hhTab === "randevu" ? "randevu" : "kontrol"}">💾 Kaydet</button>
        <button class="btn-primary" style="background:#9E9E9E;font-size:11px;padding:10px;flex:1;" data-action="hh-sablon-sifirla" data-tip="${state.hhTab === "kayip" ? "kayip" : state.hhTab === "randevu" ? "randevu" : "kontrol"}">↺ Varsayılan</button>
      </div>
      ` : `<div style="background:#fff;border-radius:8px;padding:9px;font-size:10.5px;color:#33691E;line-height:1.55;white-space:pre-wrap;min-height:40px;">${escapeHtml(mesajSablonu(state.hhTab === "kayip" ? "kayip" : state.hhTab === "randevu" ? "randevu" : "kontrol").replace(/\{ad\}/g, "Ayşe K.").replace(/\{islem\}/g, "Dolgu").replace(/\{ay\}/g, "8").replace(/\{gun\}/g, "5 Kasım Çarşamba").replace(/\{saat\}/g, "14:00"))}</div>`}
    </div>

    <div style="display:flex;align-items:center;gap:6px;margin-bottom:10px;">
      <span style="font-size:10px;color:#666;">Kontrol eşiği:</span>
      ${[6, 12, 18, 24].map(v => `<button data-action="hh-esik" data-ay="${v}" style="padding:5px 10px;border-radius:14px;font-size:10px;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif;border:1px solid ${(state.hhAyar||{}).ay === v || (!state.hhAyar && v === 6) ? "#00695C" : "var(--line)"};background:${(state.hhAyar||{}).ay === v || (!state.hhAyar && v === 6) ? "#00695C" : "rgba(255,255,255,.7)"};color:${(state.hhAyar||{}).ay === v || (!state.hhAyar && v === 6) ? "#fff" : "var(--ink)"};cursor:pointer;">${v} ay</button>`).join("")}
    </div>

    ${icerik}

    <div class="card p4 mb3" style="background:#E0F2F1;border:1px solid #80CBC4;margin-top:12px;">
      <p style="font-size:11.5px;font-weight:700;color:#00695C;margin:0 0 6px;">💡 Kontrol hatırlatması neden önemli?</p>
      <p style="font-size:10.5px;color:#00897B;margin:0;line-height:1.65;">
        6 ayda bir kontrol, hem ağız sağlığı hem de klinik cirosu için kritik.
        <b>Yeni hasta bulmak, eski hastayı geri getirmekten 5 kat pahalıdır.</b>
        Her hatırlatma mesajı ortalama <b>%10-15 geri dönüş</b> sağlar.
      </p>
    </div>
  `;
}
