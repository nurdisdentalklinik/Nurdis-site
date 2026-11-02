/* =====================================================================
   🎁 MAĞAZA EK ÖZELLİKLERİ
   ---------------------------------------------------------------------
   1) 📉 OTOMATİK STOK DÜŞÜMÜ — sipariş onaylanınca stok azalır,
      iade/iptal olunca geri eklenir.
   2) 🏷️ KARGO ETİKETİ — yazdırılabilir A6 etiket (tarayıcı yazdırma).
   3) 🔔 SİPARİŞ BİLDİRİMİ — yeni sipariş gelince sesli uyarı.
   4) 🎉 KAMPANYA SAYFASI — indirimli ürünler için ayrı vitrin.
   5) 💎 SADAKAT PUANI — her alışverişte puan, puanla indirim.
   ===================================================================== */

/* =====================================================================
   1. STOK OTOMATİK DÜŞÜMÜ
   ===================================================================== */

/* Siparişteki ürünleri stoktan düş */
function stokDusumSiparis(siparis) {
  if (!siparis || !(siparis.items || []).length) return { degisen: 0 };
  if (!Array.isArray(state.products)) return { degisen: 0 };
  let degisen = 0;

  siparis.items.forEach(i => {
    // Ürünü id veya isimle bul
    let p = state.products.find(x => x.id === i.id);
    if (!p && i.name) p = state.products.find(x => x.ad === i.name);
    if (!p) return;

    const adet = accNum(i.qty || i.adet) || 1;
    const mevcut = accNum(p.stok) || 0;
    p.stok = Math.max(0, mevcut - adet);
    degisen++;
  });

  if (degisen) {
    try { localStorage.setItem("nurdis_products", JSON.stringify(state.products)); } catch (e) {}
    // Buluta da yaz (yönetici oturumunda)
    if (typeof halkaAcikYayinla === "function") { try { halkaAcikYayinla(); } catch (e) {} }
  }
  return { degisen };
}

/* İade/iptalde stoğu geri ekle */
function stokIadeEkle(siparis) {
  if (!siparis || !(siparis.items || []).length) return { degisen: 0 };
  if (!Array.isArray(state.products)) return { degisen: 0 };
  let degisen = 0;

  siparis.items.forEach(i => {
    let p = state.products.find(x => x.id === i.id);
    if (!p && i.name) p = state.products.find(x => x.ad === i.name);
    if (!p) return;
    const adet = accNum(i.qty || i.adet) || 1;
    p.stok = (accNum(p.stok) || 0) + adet;
    degisen++;
  });

  if (degisen) {
    try { localStorage.setItem("nurdis_products", JSON.stringify(state.products)); } catch (e) {}
    if (typeof halkaAcikYayinla === "function") { try { halkaAcikYayinla(); } catch (e) {} }
  }
  return { degisen };
}

/* Stok düşük ürünler (yönetici uyarısı için) */
function dusukStokUrunler(esik) {
  const limit = esik || 5;
  return (state.products || [])
    .filter(p => p.aktif !== false && accNum(p.stok) <= limit)
    .sort((a, b) => accNum(a.stok) - accNum(b.stok));
}

/* =====================================================================
   2. KARGO ETİKETİ (yazdırılabilir)
   ===================================================================== */

function kargoEtiketiHTML(siparis) {
  if (!siparis) return "";
  const firma = (typeof kargoFirmaAdi === "function") ? kargoFirmaAdi(siparis.kargoFirma) : "";
  const urunler = siparisUrunleri(siparis);

  return `<!doctype html>
<html lang="tr"><head><meta charset="utf-8">
<title>Kargo Etiketi — #${String(siparis.id).slice(-6)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Segoe UI", Roboto, Arial, sans-serif; margin: 0; padding: 16px; background: #f0f0f0; }
  .etiket {
    width: 105mm; min-height: 148mm; background: #fff; margin: 0 auto 22px;
    border: 2px solid #000; border-radius: 4px; padding: 10mm 8mm; page-break-after: always;
  }
  .ust { border-bottom: 2px solid #000; padding-bottom: 5mm; margin-bottom: 5mm; text-align: center; }
  .ust h1 { font-size: 15pt; margin: 0 0 2mm; letter-spacing: .5px; }
  .ust p { font-size: 9pt; margin: 0; color: #333; }
  .blok { margin-bottom: 4mm; }
  .etiket-bas { font-size: 7.5pt; font-weight: 800; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 1.5mm; }
  .alici { font-size: 13pt; font-weight: 800; line-height: 1.3; }
  .tel { font-size: 12pt; font-weight: 700; font-family: monospace; }
  .adres { font-size: 10pt; line-height: 1.5; }
  .kutu { border: 1.5px dashed #000; border-radius: 3px; padding: 4mm; text-align: center; margin: 5mm 0; }
  .kutu .kod { font-size: 16pt; font-weight: 800; letter-spacing: 2px; font-family: monospace; word-break: break-all; }
  .kutu .firma { font-size: 10pt; font-weight: 700; margin-bottom: 2mm; }
  table { width: 100%; border-collapse: collapse; font-size: 8.5pt; }
  td { padding: 1.2mm 0; border-bottom: 1px solid #ddd; }
  td.sag { text-align: right; font-weight: 700; }
  .alt { border-top: 1.5px solid #000; padding-top: 3mm; margin-top: 4mm; font-size: 8pt; text-align: center; color: #444; }
  .yazdir { display: block; width: 105mm; margin: 0 auto 16px; padding: 13px; background: #0B6E86; color: #fff;
            border: none; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; }
  @media print {
    body { background: #fff; padding: 0; margin: 0; }
    .etiket { border: 2px solid #000; margin: 0; width: 100%; min-height: auto; page-break-after: always; }
    .yazdir { display: none; }
    @page { size: A6; margin: 0; }
  }
</style></head>
<body>
<button class="yazdir" onclick="window.print()">🖨️ Yazdır</button>

<div class="etiket">
  <div class="ust">
    <h1>NUR DİŞ &amp; DENTAL KLİNİK</h1>
    <p>Kızıltepe / Mardin · 0505 105 03 02</p>
  </div>

  <div class="blok">
    <div class="etiket-bas">Alıcı</div>
    <div class="alici">${escapeHtml(siparis.name || "")}</div>
    <div class="tel">${escapeHtml(siparis.phone || "")}</div>
  </div>

  <div class="blok">
    <div class="etiket-bas">Teslimat Adresi</div>
    <div class="adres">${escapeHtml(siparis.address || "").replace(/\n/g, "<br>")}</div>
  </div>

  <div class="kutu">
    <div class="firma">${escapeHtml(firma || "KARGO")}</div>
    <div class="kod">${escapeHtml(siparis.kargoNo || "— — —")}</div>
  </div>

  <div class="blok">
    <div class="etiket-bas">İçerik</div>
    <table>
      ${(siparis.items || []).map(i => `
        <tr>
          <td>${escapeHtml(i.name || i.ad || "Ürün")} × ${i.qty || i.adet || 1}</td>
          <td class="sag">${accTL((i.price || 0) * (i.qty || i.adet || 1))}</td>
        </tr>`).join("")}
      <tr><td style="font-weight:800;border:none;">TOPLAM</td><td class="sag" style="border:none;">${accTL(siparis.total || 0)}</td></tr>
    </table>
  </div>

  <div class="alt">
    Sipariş #${String(siparis.id).slice(-6)} · ${siparisTarih(siparis)}<br>
    <span style="font-size:7pt;">Bu etiket Nur Diş Mağaza tarafından otomatik oluşturulmuştur.</span>
  </div>
</div>
</body></html>`;
}

/* Etiketi yeni sekmede aç ve yazdırma diyaloğuna hazırla */
function kargoEtiketiYazdir(siparis) {
  if (!siparis) { alert("Sipariş bulunamadı."); return false; }
  const html = kargoEtiketiHTML(siparis);
  const w = window.open("", "_blank");
  if (!w) { alert("Yazdırma penceresi açılamadı. Popup engelleyicisini kapatın."); return false; }
  w.document.write(html);
  w.document.close();
  setTimeout(() => { try { w.focus(); } catch (e) {} }, 200);
  return true;
}

/* =====================================================================
   3. SİPARİŞ BİLDİRİMİ (sesli)
   ===================================================================== */

/* Yeni sipariş sesi — randevu sesinden farklı, "kasa" hissi */
function siparisBildirimSesi() {
  try {
    const ctx = (typeof getAudioCtx === "function") ? getAudioCtx() : null;
    if (!ctx || typeof tone !== "function") return;
    // Yükselen 4'lü — satış/para sesi
    tone(ctx, 659.25, 0.00, 0.10, "sine", 0.10);   // Mi5
    tone(ctx, 880.00, 0.09, 0.10, "sine", 0.11);   // La5
    tone(ctx, 1046.50, 0.18, 0.10, "sine", 0.11);  // Do6
    tone(ctx, 1318.51, 0.27, 0.26, "sine", 0.12);  // Mi6
  } catch (e) {}
}

let _siparisSesiSonZaman = 0;

function siparisBildir(siparis, adet) {
  if (!siparis) return;
  // Üst üste bildirimleri engelle (10 sn içinde tek ses)
  const simdi = Date.now();
  if (simdi - _siparisSesiSonZaman < 10000) return;
  _siparisSesiSonZaman = simdi;

  siparisBildirimSesi();

  const baslik = adet > 1 ? `📦 ${adet} Yeni Sipariş!` : "📦 Yeni Sipariş!";
  const govde = `${siparis.name || "Müşteri"} — ${accTL(siparis.total || 0)}` +
                (siparis.items ? ` · ${(siparis.items || []).length} ürün` : "");

  // Uygulama içi + tarayıcı bildirimi
  try { if (typeof _showInAppNotif === "function") _showInAppNotif(baslik, govde); } catch (e) {}
  try {
    if ("Notification" in window && Notification.permission === "granted") {
      const n = new Notification(baslik, { body: govde, icon: "./icon-192.png", tag: "nurdis-siparis-" + Date.now(), renotify: true });
      n.onclick = () => {
        try {
          window.focus();
          state.screen = "admin-panel";
          state.adminTab = "orders";
          state.siparisAcik = siparis.id;
          render();
        } catch (e) {}
        n.close();
      };
      setTimeout(() => { try { n.close(); } catch (e) {} }, 15000);
    }
  } catch (e) {}
  try { if (navigator.vibrate) navigator.vibrate([300, 120, 300, 120, 300]); } catch (e) {}
  try { if (typeof _baslikYanipSonsun === "function") _baslikYanipSonsun(); } catch (e) {}
}

/* =====================================================================
   4. KAMPANYA SAYFASI
   ===================================================================== */

/* İndirimli ürünler (indirimFiyat < fiyat) */
function kampanyaliUrunler() {
  return (state.products || []).filter(p =>
    p.aktif !== false && accNum(p.indirimFiyat) > 0 && accNum(p.indirimFiyat) < accNum(p.fiyat)
  ).sort((a, b) => (typeof urunIndirimYuzde === "function" ? urunIndirimYuzde(b) - urunIndirimYuzde(a) : 0));
}

function renderKampanya() {
  const urunler = kampanyaliUrunler();
  const enBuyuk = urunler.length && typeof urunIndirimYuzde === "function" ? urunIndirimYuzde(urunler[0]) : 0;

  const kartlar = urunler.map(p => {
    const fiyat = (typeof urunFiyat === "function") ? urunFiyat(p) : accNum(p.fiyat);
    const yuzde = (typeof urunIndirimYuzde === "function") ? urunIndirimYuzde(p) : 0;
    const stok = accNum(p.stok);
    return `<div data-action="magaza-urun-ac" data-id="${p.id}"
      style="background:#fff;border-radius:13px;overflow:hidden;border:1px solid #EDEDED;cursor:pointer;position:relative;">
      <div style="position:absolute;top:7px;left:7px;background:#E53935;color:#fff;font-size:10px;font-weight:800;padding:3px 8px;border-radius:6px;z-index:2;">
        %${yuzde} İNDİRİM
      </div>
      ${p.gorsel
        ? `<img src="${escapeAttr(p.gorsel)}" alt="" style="width:100%;aspect-ratio:1;object-fit:cover;display:block;background:#F7F7F7;" />`
        : `<div style="width:100%;aspect-ratio:1;background:linear-gradient(135deg,#F1FBF6,#E3F2F7);display:flex;align-items:center;justify-content:center;font-size:44px;">🦷</div>`}
      <div style="padding:9px 10px 11px;">
        <p style="font-size:11.5px;font-weight:600;margin:0 0 5px;line-height:1.35;color:#222;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:31px;">${escapeHtml(p.ad || "")}</p>
        <div style="display:flex;align-items:baseline;gap:6px;flex-wrap:wrap;">
          <span style="font-size:14.5px;font-weight:800;color:#E53935;">${accTL(fiyat)}</span>
          <span style="font-size:11px;color:#999;text-decoration:line-through;">${accTL(accNum(p.fiyat))}</span>
        </div>
        ${stok <= 0
          ? `<p style="margin:5px 0 0;font-size:9.5px;color:#C62828;font-weight:700;">Tükendi</p>`
          : stok <= 5
          ? `<p style="margin:5px 0 0;font-size:9.5px;color:#E65100;font-weight:700;">Son ${stok} adet</p>`
          : `<p style="margin:5px 0 0;font-size:9.5px;color:#2E7D32;font-weight:700;">Stokta</p>`}
      </div>
    </div>`;
  }).join("");

  /* Kuponlar (vitrin) */
  const kuponlar = (typeof kuponlarim === "function") ? kuponlarim().filter(k => !k.kullanildi) : [];
  const kuponHTML = kuponlar.length ? `
    <p class="section-label" style="margin:18px 0 8px;">🎟️ Kupon Fırsatları</p>
    ${kuponlar.slice(0, 3).map(k => `
      <div class="card p4 mb2" style="border-left:3px solid #E53935;">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
          <div>
            <p style="margin:0;font-size:14px;font-weight:800;letter-spacing:1px;color:#E53935;">${escapeHtml(k.kod)}</p>
            <p class="desc" style="margin:2px 0 0;font-size:11px;">
              ${k.tip === "yuzde" ? "%" + accNum(k.deger) + " indirim" : accTL(k.deger) + " indirim"}
              ${k.minTutar ? " · min " + accTL(k.minTutar) : ""}
            </p>
          </div>
          <button data-action="kupon-kopyala" data-kod="${escapeAttr(k.kod)}"
            style="padding:8px 12px;border-radius:8px;border:1px solid var(--line);background:#fff;font-size:10.5px;font-weight:700;cursor:pointer;color:var(--ink);white-space:nowrap;">📋 Kopyala</button>
        </div>
      </div>`).join("")}` : "";

  return `${topbar("Kampanyalar", "İndirimli ürünler ve kupon fırsatları.", { back: "store" })}
    <div class="content">

      <div class="card p4 mb3" style="background:linear-gradient(135deg,#E53935,#FF6F60);color:#fff;border:none;">
        <p style="font-size:13px;font-weight:800;margin:0 0 3px;">🔥 Kampanya Zamanı</p>
        <p style="font-size:11px;opacity:.92;margin:0;line-height:1.5;">
          ${urunler.length ? `${urunler.length} üründe indirim — en fazla %${enBuyuk}'e varan fırsatlar.` : "Şu an aktif kampanya yok."}
        </p>
      </div>

      ${urunler.length ? `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:9px;">${kartlar}</div>`
      : `<div class="card p4" style="text-align:center;padding:30px 20px;">
          <p style="font-size:34px;margin:0 0 8px;">🎉</p>
          <p class="name" style="font-size:13.5px;margin:0 0 4px;">Şu an kampanya yok</p>
          <p class="desc" style="margin:0 0 14px;font-size:11.5px;">Yeni fırsatlar için mağazamıza göz atın.</p>
          <button class="btn-primary" style="width:100%;" data-action="goto" data-screen="store">Mağazaya Git</button>
        </div>`}

      ${kuponHTML}

      <div class="card p4 mb3" style="margin-top:16px;background:#E3F2FD;border-color:#90CAF9;">
        <p style="font-size:11px;font-weight:800;color:#1565C0;margin:0 0 4px;">💎 Sadakat puanınız</p>
        <p class="desc" style="margin:0;font-size:11px;color:#1565C0;line-height:1.5;">
          Her alışverişinizde puan kazanırsınız. Hesabınızdan puanlarınızı görüp sepette kullanabilirsiniz.
        </p>
        <button class="btn-primary" style="width:100%;margin-top:9px;font-size:11.5px;padding:8px;background:#1565C0;"
          data-action="goto" data-screen="account">Puanlarımı Gör</button>
      </div>
    </div>`;
}

/* =====================================================================
   5. SADAKAT PUANI
   ===================================================================== */

const SADAKAT_AYAR = {
  kazancOrani: 1,      // her 1 ₺ = 1 puan
  puanDegeri: 100,     // 100 puan = 1 ₺ indirim
  minKullan: 500       // sepette en az 500 puan kullanılabilir
};

function sadakatAnahtar() {
  const uid = (state.user && state.user.uid) || "misafir";
  return "nurdis_puan_" + uid;
}

function puanlarim() {
  try {
    const d = JSON.parse(localStorage.getItem(sadakatAnahtar()) || "null");
    return d || { bakiye: 0, toplam: 0, gecmis: [] };
  } catch (e) { return { bakiye: 0, toplam: 0, gecmis: [] }; }
}

function puanlarimKaydet(d) {
  try { localStorage.setItem(sadakatAnahtar(), JSON.stringify(d)); } catch (e) {}
  try {
    if (window.fb && window.fb.saveUserProfile && state.user && state.user.uid) {
      const p = Object.assign({}, state.userProfile || {}, { puan: d.bakiye, puanToplam: d.toplam });
      window.fb.saveUserProfile(state.user.uid, p).catch(() => {});
    }
  } catch (e) {}
}

/* Sipariş tamamlandığında puan kazan */
function puanKazan(siparis) {
  if (!siparis) return 0;
  const harcanan = accNum(siparis.total) || 0;
  const kazanilan = Math.floor(harcanan * SADAKAT_AYAR.kazancOrani);
  if (kazanilan <= 0) return 0;

  const d = puanlarim();
  d.bakiye = (d.bakiye || 0) + kazanilan;
  d.toplam = (d.toplam || 0) + kazanilan;
  if (!d.gecmis) d.gecmis = [];
  d.gecmis.unshift({
    tip: "kazanc", puan: kazanilan,
    aciklama: "Sipariş #" + String(siparis.id).slice(-6),
    zaman: new Date().toISOString()
  });
  d.gecmis = d.gecmis.slice(0, 60);
  puanlarimKaydet(d);
  return kazanilan;
}

/* Puan harca (sepette) */
function puanHarca(puan, aciklama) {
  const d = puanlarim();
  const miktar = Math.min(accNum(puan), d.bakiye || 0);
  if (miktar <= 0) return 0;
  d.bakiye = (d.bakiye || 0) - miktar;
  if (!d.gecmis) d.gecmis = [];
  d.gecmis.unshift({
    tip: "harcama", puan: -miktar,
    aciklama: aciklama || "Sepette kullanıldı",
    zaman: new Date().toISOString()
  });
  d.gecmis = d.gecmis.slice(0, 60);
  puanlarimKaydet(d);
  return miktar;
}

/* Puanı paraya çevir */
function puanParaDegeri(puan) {
  return accNum(puan) / SADAKAT_AYAR.puanDegeri;
}

/* Seviye (motivasyon için) */
function sadakatSeviye(toplam) {
  const t = accNum(toplam);
  if (t >= 10000) return { ad: "Elmas", ikon: "💎", renk: "#7B1FA2", sonraki: null };
  if (t >= 5000) return { ad: "Altın", ikon: "🥇", renk: "#F9A825", sonraki: 10000 };
  if (t >= 2000) return { ad: "Gümüş", ikon: "🥈", renk: "#78909C", sonraki: 5000 };
  return { ad: "Bronz", ikon: "🥉", renk: "#A1887F", sonraki: 2000 };
}

/* Hesap merkezi için puan bölümü */
function hesapPuanHTML() {
  const d = puanlarim();
  const sev = sadakatSeviye(d.toplam);
  const bakiyeTL = puanParaDegeri(d.bakiye);
  const ilerleme = sev.sonraki ? Math.min(100, Math.round((d.toplam / sev.sonraki) * 100)) : 100;

  return `<div class="card p4 mb3" style="background:linear-gradient(135deg,#1565C0,#1976D2);color:#fff;border:none;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div>
          <p style="font-size:10.5px;opacity:.85;margin:0 0 2px;text-transform:uppercase;letter-spacing:.06em;">Puan Bakiyem</p>
          <p style="font-size:30px;font-weight:800;margin:0;line-height:1.1;">${accNum(d.bakiye).toLocaleString("tr-TR")}</p>
          <p style="font-size:11px;opacity:.9;margin:3px 0 0;">≈ ${accTL(bakiyeTL)} indirim değeri</p>
        </div>
        <div style="text-align:center;">
          <p style="font-size:24px;margin:0;">${sev.ikon}</p>
          <p style="font-size:10px;font-weight:800;margin:2px 0 0;">${sev.ad}</p>
        </div>
      </div>
      ${sev.sonraki ? `
      <div style="margin-top:12px;">
        <div style="display:flex;justify-content:space-between;font-size:9.5px;opacity:.9;margin-bottom:4px;">
          <span>${accNum(d.toplam).toLocaleString("tr-TR")} puan</span>
          <span>${sev.sonraki.toLocaleString("tr-TR")} puan → ${sadakatSeviye(sev.sonraki).ad}</span>
        </div>
        <div style="height:6px;background:rgba(255,255,255,.25);border-radius:3px;overflow:hidden;">
          <div style="height:100%;width:${ilerleme}%;background:#FFD54F;border-radius:3px;"></div>
        </div>
      </div>` : `<p style="font-size:10px;opacity:.9;margin:10px 0 0;">🎉 En üst seviyedesiniz!</p>`}
    </div>

    <div class="card p4 mb3">
      <p class="section-label" style="margin:0 0 8px;">Nasıl çalışır?</p>
      <p class="desc" style="margin:0 0 4px;font-size:11px;line-height:1.6;">• Her <b>1 ₺</b> alışveriş = <b>1 puan</b></p>
      <p class="desc" style="margin:0 0 4px;font-size:11px;line-height:1.6;">• <b>100 puan</b> = <b>1 ₺</b> indirim</p>
      <p class="desc" style="margin:0;font-size:11px;line-height:1.6;">• Sepette en az <b>${SADAKAT_AYAR.minKullan} puan</b> kullanılabilir</p>
    </div>

    ${(d.gecmis || []).length ? `
    <div class="card p4 mb3">
      <p class="section-label" style="margin:0 0 8px;">Puan Geçmişi</p>
      ${(d.gecmis || []).slice(0, 15).map(g => `
        <div style="display:flex;justify-content:space-between;gap:8px;padding:6px 0;border-bottom:1px solid var(--line);">
          <div style="min-width:0;">
            <p style="margin:0;font-size:11.5px;font-weight:600;">${escapeHtml(g.aciklama || "")}</p>
            <p class="desc" style="margin:1px 0 0;font-size:9.5px;">${g.zaman ? new Date(g.zaman).toLocaleDateString("tr-TR") : ""}</p>
          </div>
          <span style="font-size:12px;font-weight:800;white-space:nowrap;color:${g.puan > 0 ? "#2E7D32" : "#C62828"};">
            ${g.puan > 0 ? "+" : ""}${accNum(g.puan).toLocaleString("tr-TR")}
          </span>
        </div>`).join("")}
    </div>` : ""}`;
}
