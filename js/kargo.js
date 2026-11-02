/* =====================================================================
   🚚 KARGO TAKİP — müşteri tarafı
   ---------------------------------------------------------------------
   ÖNEMLİ TEKNİK GERÇEK:
   Türkiye'deki kargo firmalarının (Aras, Yurtiçi, MNG, PTT, Sürat…)
   ÜCRETSİZ ve HERKESE AÇIK bir takip API'si YOKTUR. Hepsi sözleşmeli
   ticari API kullanır (e-ticaret hesabı + kimlik bilgisi gerekir).

   Bu yüzden iki katmanlı çözüm uyguluyoruz:

   KATMAN 1 (her zaman çalışır · bugün hazır)
     Müşteri takip numarasını girer → firma otomatik tahmin edilir →
     uygulama doğrudan kargo firmasının CANLI takip sayfasını açar.
     Yani gerçek durum bilgisi gelir, bizim bir şey tutmamıza gerek yok.

   KATMAN 2 (opsiyonel · sözleşme olursa hazır)
     Yönetici kargo ayarlarına bir API adresi şablonu yapıştırırsa
     ({no} yerine takip numarası konur), uygulama cevabı çekip durumu
     KENDİ ekranında gösterir. Sözleşme yoksa bu katman sessizce atlanır.

   AYRICA: Giriş yapmış müşteri "Siparişlerim" listesinde kendi siparişinin
   yönetici tarafından güncellenen durumunu ve takip linkini görür.
   ===================================================================== */

/* ---------------------------------------------------------------------
   Takip numarasından firma tahmini
   --------------------------------------------------------------------- */

function kargoFirmaTahmin(no) {
  const s = (no || "").toString().trim().toUpperCase();
  if (!s) return null;

  // UPS: 1Z ile başlar (18 karakter)
  if (/^1Z[0-9A-Z]{16}$/.test(s)) return { id: "ups", guven: 95 };

  // PTT / uluslararası: 2 harf + 9 rakam + TR  (örn. RR123456789TR)
  if (/^[A-Z]{2}\d{9}TR$/.test(s)) return { id: "ptt", guven: 92 };

  // Trendyol Express: TY ile başlayan alfanümerik
  if (/^TY[0-9A-Z]{8,}$/.test(s)) return { id: "tyexpress", guven: 90 };

  // HepsiJet: HJ ile başlayan
  if (/^HJ[0-9A-Z]{8,}$/.test(s)) return { id: "hepsijet", guven: 88 };

  // Sendeo
  if (/^SN[0-9A-Z]{8,}$/.test(s)) return { id: "sendeo", guven: 82 };

  // Sadece rakam: uzunluğa göre
  if (/^\d+$/.test(s)) {
    if (s.length === 13) return { id: "yurtici", guven: 62 };   // 13 hane çoğunlukla Yurtiçi
    if (s.length === 12) return { id: "surat",   guven: 55 };
    if (s.length === 11) return { id: "aras",    guven: 60 };   // 11 hane çoğunlukla Aras
    if (s.length === 10) return { id: "mng",     guven: 58 };
    return { id: "aras", guven: 35 };
  }

  return null;
}

/* ---------------------------------------------------------------------
   Sorgulama
   --------------------------------------------------------------------- */

/* KATMAN 1: kargo firmasının canlı takip sayfasını aç */
function kargoSayfaAc(no, firmaId) {
  const f = kargoFirmaBul(firmaId);
  if (!f || !f.url) {
    alert("Bu firma için takip linki tanımlı değil.\n\nYönetici panelinden ekleyebilirsiniz.");
    return false;
  }
  const url = f.url.replace("{no}", encodeURIComponent(no));
  try { window.open(url, "_blank", "noopener"); return true; }
  catch (e) { alert("Tarayıcı yeni pencere açamadı.\n\n" + url); return false; }
}

/* KATMAN 2: sözleşmeli API varsa durumu uygulama içinde göster */
async function kargoApiSorgula(no, firmaId) {
  const f = kargoFirmaBul(firmaId);
  if (!f || !f.api) return null;              // API tanımlı değil → sessizce geç
  const url = f.api.replace("{no}", encodeURIComponent(no));
  try {
    const ctrl = new AbortController();
    const zaman = setTimeout(() => ctrl.abort(), 12000);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(zaman);
    if (!res.ok) return null;
    const data = await res.json();
    return _kargoCevapCoz(data);
  } catch (e) {
    return null;
  }
}

/* Farklı API cevap şekillerini tek biçime çevir */
function _kargoCevapCoz(d) {
  if (!d) return null;
  // Yaygın alan adları denenir
  const durum = d.durum || d.status || d.state || d.durumAdi ||
                (Array.isArray(d.hareketler) && d.hareketler.length ? d.hareketler[0].durum : "") || "";
  const son = d.sonHareket || d.lastMovement || d.sonIslem || "";
  const asama = Array.isArray(d.hareketler) ? d.hareketler : (Array.isArray(d.events) ? d.events : []);
  return {
    durum: String(durum).slice(0, 120),
    sonHareket: String(son).slice(0, 200),
    asama: asama.slice(0, 12).map(x => ({
      tarih: String(x.tarih || x.date || "").slice(0, 20),
      metin: String(x.aciklama || x.text || x.durum || "").slice(0, 160)
    }))
  };
}

/* ---------------------------------------------------------------------
   Son sorgulamalar (cihazda)
   --------------------------------------------------------------------- */

function kargoGecmisAl() {
  try { return JSON.parse(localStorage.getItem("nurdis_kargo_gecmis") || "[]"); }
  catch (e) { return []; }
}

function kargoGecmiseEkle(no, firmaId) {
  try {
    let liste = kargoGecmisAl().filter(x => !(x.no === no && x.firma === firmaId));
    liste.unshift({ no: no, firma: firmaId, zaman: new Date().toISOString() });
    localStorage.setItem("nurdis_kargo_gecmis", JSON.stringify(liste.slice(0, 10)));
  } catch (e) {}
}

/* ---------------------------------------------------------------------
   EKRAN
   --------------------------------------------------------------------- */

function renderKargoTakip() {
  const no = state.kargoNo || "";
  const firmaId = state.kargoFirma || "";
  const tahmin = kargoFirmaTahmin(no);
  const secili = firmaId || (tahmin ? tahmin.id : "");
  const seciliFirma = kargoFirmaBul(secili);
  const gecmis = kargoGecmisAl();
  const sonuc = state.kargoSonuc || null;
  const aranıyor = !!state.kargoAraniyor;

  /* Giriş yapmış müşterinin kendi siparişleri */
  const benimSiparisler = (state.user && state.user.uid)
    ? (state.orders || []).filter(o => o.uid === state.user.uid)
    : [];

  const siparisKartlari = benimSiparisler.slice(0, 8).map(o => {
    const d = siparisDurum(o.durum || "yeni");
    const link = kargoTakipLinki(o);
    const firma = kargoFirmaAdi(o.kargoFirma);
    return `<div class="card p4 mb2">
      <div style="display:flex;justify-content:space-between;gap:8px;margin-bottom:6px;">
        <div style="flex:1;min-width:0;">
          <span style="font-size:9.5px;font-weight:800;background:${d.arka};color:${d.renk};padding:2px 7px;border-radius:5px;">${d.ikon} ${d.ad.toUpperCase()}</span>
          <p class="name" style="font-size:13px;margin:6px 0 0;">${escapeHtml(siparisUrunleri(o))}</p>
        </div>
        <p style="font-size:13px;font-weight:800;margin:0;white-space:nowrap;">${accTL(o.total || 0)}</p>
      </div>
      ${o.kargoNo ? `<p class="desc" style="margin:0 0 4px;font-size:11.5px;">🚚 ${escapeHtml(firma || "Kargo")} · ${escapeHtml(o.kargoNo)}</p>` : ""}
      <div style="display:flex;gap:6px;margin-top:8px;">
        ${link ? `<a href="${escapeAttr(link)}" target="_blank" rel="noopener" class="btn-primary"
          style="flex:1;text-align:center;text-decoration:none;font-size:11.5px;padding:8px;">🔗 Kargomu Takip Et</a>` : ""}
        <button data-action="kargo-siparis-ara" data-no="${escapeAttr(o.kargoNo || "")}" data-firma="${escapeAttr(o.kargoFirma || "")}"
          style="flex:1;padding:8px;border-radius:9px;border:1px solid var(--line);background:var(--surface);font-size:11.5px;font-weight:700;cursor:pointer;color:var(--ink);">
          🔍 Uygulamada Sorgula
        </button>
      </div>
    </div>`;
  }).join("");

  const gecmisKartlar = gecmis.length ? gecmis.map(g => {
    const f = kargoFirmaBul(g.firma);
    return `<button data-action="kargo-gecmis" data-no="${escapeAttr(g.no)}" data-firma="${escapeAttr(g.firma || "")}"
      style="width:100%;text-align:left;background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:9px 11px;margin-bottom:6px;cursor:pointer;">
      <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;">
        <div style="min-width:0;">
          <p style="margin:0;font-size:12.5px;font-weight:700;">${escapeHtml(g.no)}</p>
          <p class="desc" style="margin:1px 0 0;font-size:10.5px;">${f ? f.ikon + " " + escapeHtml(f.ad) : "Kargo"}</p>
        </div>
        <span style="font-size:14px;color:var(--muted);">→</span>
      </div>
    </button>`;
  }).join("") : "";

  return `${topbar("Kargo Takip", "Takip numaranızla kargonuzun nerede olduğunu görün.", { back: "more" })}
    <div class="content">

      <div class="card p4 mb3" style="background:linear-gradient(135deg,#1565C0,#1976D2);color:#fff;border:none;">
        <p style="font-size:13px;font-weight:800;margin:0 0 3px;">🚚 Kargonuz nerede?</p>
        <p style="font-size:11px;opacity:.92;margin:0;line-height:1.5;">
          Takip numaranızı girin; kargo firmasının canlı takip sayfası açılır.
        </p>
      </div>

      <!-- Sorgu kutusu -->
      <div class="card p4 mb3">
        <div class="field">
          <label>Takip numarası</label>
          <input class="input" id="kargo-no" value="${escapeAttr(no)}"
            placeholder="örn. 12345678901" inputmode="text" autocomplete="off"
            style="font-size:15px;letter-spacing:1px;font-weight:600;" />
        </div>

        <div class="field">
          <label>Kargo firması ${tahmin ? `<span style="color:var(--teal);font-weight:700;">· tahmin: ${escapeHtml((kargoFirmaBul(tahmin.id) || {}).ad || "")}</span>` : ""}</label>
          <select class="input" id="kargo-firma">
            <option value="">Firma seçin…</option>
            ${kargoFirmalari().map(f => `<option value="${f.id}" ${secili === f.id ? "selected" : ""}>${f.ikon} ${escapeHtml(f.ad)}</option>`).join("")}
          </select>
        </div>

        <button class="btn-primary" style="width:100%;margin-top:4px;" data-action="kargo-sorgula" ${aranıyor ? "disabled" : ""}>
          ${aranıyor ? "Sorgulanıyor…" : "🔍 Kargomu Sorgula"}
        </button>

        ${seciliFirma && seciliFirma.url ? `
        <p class="desc" style="margin:9px 0 0;font-size:10.5px;text-align:center;line-height:1.5;">
          ${escapeHtml(seciliFirma.ad)}'nın resmi takip sayfası açılacak.
        </p>` : ""}
      </div>

      <!-- Sonuç -->
      ${sonuc ? `
      <div class="card p4 mb3" style="border-left:3px solid var(--teal);">
        <p style="font-size:11px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin:0 0 6px;">Son durum</p>
        ${sonuc.durum ? `<p class="name" style="font-size:14px;margin:0 0 4px;">${escapeHtml(sonuc.durum)}</p>` : ""}
        ${sonuc.sonHareket ? `<p class="desc" style="margin:0 0 8px;font-size:12px;line-height:1.5;">${escapeHtml(sonuc.sonHareket)}</p>` : ""}
        ${(sonuc.asama || []).length ? `
        <div style="margin-top:8px;">
          ${sonuc.asama.map((a, i) => `
            <div style="display:flex;gap:9px;padding:6px 0;border-top:1px solid var(--line);">
              <span style="width:6px;height:6px;border-radius:50%;background:${i === 0 ? "var(--teal)" : "#B0BEC5"};margin-top:6px;flex-shrink:0;"></span>
              <div style="min-width:0;">
                <p style="margin:0;font-size:12px;line-height:1.4;">${escapeHtml(a.metin)}</p>
                ${a.tarih ? `<p class="desc" style="margin:1px 0 0;font-size:10px;">${escapeHtml(a.tarih)}</p>` : ""}
              </div>
            </div>`).join("")}
        </div>` : ""}
      </div>` : ""}

      <!-- API bilgilendirme -->
      ${!sonuc ? `
      <div class="card p4 mb3" style="background:#FFF8E8;border-color:#F0DFAF;">
        <p class="desc" style="margin:0;font-size:10.5px;color:#8A6D1D;line-height:1.55;">
          ℹ️ Canlı durum bilgisi kargo firmasının kendi sisteminde tutulur ve orada gösterilir.
          Kargo firmalarının ücretsiz takip servisi olmadığı için durum, firmanın resmi sayfasında açılır.
        </p>
      </div>` : ""}

      <!-- Siparişlerim -->
      ${benimSiparisler.length ? `
      <p class="section-label" style="margin:18px 0 8px;">📦 Siparişlerim</p>
      ${siparisKartlari}` : ""}

      <!-- Geçmiş -->
      ${gecmisKartlar ? `
      <p class="section-label" style="margin:18px 0 8px;">🕘 Son sorgulamalar</p>
      ${gecmisKartlar}` : ""}

      <div class="card p4 mb3" style="margin-top:16px;">
        <p class="section-label" style="margin:0 0 8px;">❓ Takip numaram yok</p>
        <p class="desc" style="margin:0 0 10px;font-size:11.5px;line-height:1.55;">
          Sipariş verdikten sonra kargo takip numarası WhatsApp üzerinden gönderilir.
          Numarayı bulamıyorsanız bize yazın.
        </p>
        <a href="https://wa.me/905051050302" target="_blank" rel="noopener" class="btn-primary"
          style="display:block;text-align:center;text-decoration:none;font-size:12.5px;padding:10px;">💬 WhatsApp'tan Sor</a>
      </div>
    </div>`;
}

/* ---------------------------------------------------------------------
   OLAYLAR
   --------------------------------------------------------------------- */

function kargoAction(el, action) {
  if (action === "kargo-sorgula") {
    const no = (document.getElementById("kargo-no")?.value || "").trim();
    let firmaId = (document.getElementById("kargo-firma")?.value || "").trim();
    if (!no) { alert("Takip numarasını girin."); return true; }
    if (!firmaId) {
      const tahmin = kargoFirmaTahmin(no);
      if (!tahmin) { alert("Kargo firmasını seçin."); return true; }
      firmaId = tahmin.id;
    }

    state.kargoNo = no;
    state.kargoFirma = firmaId;
    state.kargoAraniyor = true;
    state.kargoSonuc = null;
    render();

    (async () => {
      // KATMAN 2: API tanımlıysa uygulama içinde göster
      const apiSonuc = await kargoApiSorgula(no, firmaId);
      if (apiSonuc) {
        state.kargoSonuc = apiSonuc;
        state.kargoAraniyor = false;
        kargoGecmiseEkle(no, firmaId);
        render();
        return;
      }
      // KATMAN 1: firmanın resmi takip sayfasını aç
      state.kargoAraniyor = false;
      kargoGecmiseEkle(no, firmaId);
      render();
      kargoSayfaAc(no, firmaId);
    })();
    return true;
  }

  if (action === "kargo-gecmis") {
    state.kargoNo = el.dataset.no || "";
    state.kargoFirma = el.dataset.firma || "";
    state.kargoSonuc = null;
    render();
    setTimeout(() => {
      const b = document.querySelector('[data-action="kargo-sorgula"]');
      if (b) b.click();
    }, 200);
    return true;
  }

  if (action === "kargo-siparis-ara") {
    state.kargoNo = el.dataset.no || "";
    state.kargoFirma = el.dataset.firma || "";
    state.kargoSonuc = null;
    render();
    setTimeout(() => {
      const b = document.querySelector('[data-action="kargo-sorgula"]');
      if (b) b.click();
    }, 200);
    return true;
  }

  return false;
}
