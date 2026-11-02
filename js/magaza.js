/* =========================================================
   NUR DİŞ — MAĞAZA v18 (Trendyol tarzı)
   • Ürün kartları, kategori filtresi, arama
   • Ürün detay sayfası, favoriler, stok/discount
   • Yönetici: tam ürün yönetimi (görsel yükleme, stok, indirim)
========================================================= */

/* ---------------- ÜRÜN MODELİ ---------------- */

const MAGAZA_KATEGORI = [
  "Çocuk Ürünleri", "Yetişkin Ürünleri", "Ağız Bakım", "Beyazlatma",
  "Ortodonti", "Protez Bakım", "Cihaz", "Diğer"
];

/* Varsayılan ürünleri state.products'a aktar (ilk kurulum) */
function magazaSeed() {
  /* Mevcut ürünlerde eksik görsel/açıklama varsa varsayılandan tamamla */
  if (state.products && state.products.length) {
    let degisti = false;
    const varsayilan = {};
    PRODUCT_CATEGORIES.forEach(cat => cat.items.forEach(p => { varsayilan[p.id] = p; }));
    state.products.forEach(p => {
      const v = varsayilan[p.id];
      if (!v) return;
      if (!p.gorsel && v.gorsel) { p.gorsel = v.gorsel; degisti = true; }
      if (!p.aciklama && v.aciklama) { p.aciklama = v.aciklama; degisti = true; }
      if (!p.marka && v.marka) { p.marka = v.marka; degisti = true; }
    });
    if (degisti) {
      localStorage.setItem("nurdis_products", JSON.stringify(state.products));
    }
    return;
  }
  const liste = [];
  PRODUCT_CATEGORIES.forEach(cat => {
    cat.items.forEach(p => {
      liste.push({
        id: p.id,
        ad: p.name,
        kategori: cat.name,
        fiyat: p.price,
        indirimFiyat: null,
        stok: 15,
        aciklama: p.aciklama || "",
        marka: p.marka || "Nur Diş",
        gorsel: p.gorsel || "",
        aktif: true,
        favori: false,
        puan: 0,
        yorumSayisi: 0,
        satis: 0,
        olusturma: new Date().toISOString()
      });
    });
  });
  state.products = liste;
  localStorage.setItem("nurdis_products", JSON.stringify(liste));
}

function urunler() {
  magazaSeed();
  return (state.products || []).filter(p => p.aktif !== false);
}

function tumUrunler() {
  magazaSeed();
  return state.products || [];
}

function urunBul(id) {
  return (state.products || []).find(p => p.id === id);
}

/* Etkin fiyat (indirim varsa) */
function urunFiyat(p) {
  if (!p) return 0;
  const ind = accNum(p.indirimFiyat);
  const asil = accNum(p.fiyat);
  return (ind > 0 && ind < asil) ? ind : asil;
}

function urunIndirimYuzde(p) {
  const asil = accNum(p.fiyat);
  const ind = accNum(p.indirimFiyat);
  if (!(ind > 0 && ind < asil)) return 0;
  return Math.round((1 - ind / asil) * 100);
}

function urunStokta(p) {
  return accNum(p && p.stok) > 0;
}

function urunKaydet() {
  localStorage.setItem("nurdis_products", JSON.stringify(state.products || []));
  if (typeof saveAccountingToFirebase === "function") saveAccountingToFirebase();
}

/* ---------------- RENDER: MAĞAZA (Trendyol tarzı) ---------------- */

function renderStoreV2() {
  if (state.checkoutStatus === "form") return renderCheckout();

  const arama = (state.magazaArama || "").toLowerCase().trim();
  const seciliKat = state.magazaKategori || "tumu";
  const sirala = state.magazaSirala || "onerilen";

  let liste = urunler();

  if (arama) {
    liste = liste.filter(p =>
      (p.ad || "").toLowerCase().includes(arama) ||
      (p.marka || "").toLowerCase().includes(arama) ||
      (p.kategori || "").toLowerCase().includes(arama) ||
      (p.aciklama || "").toLowerCase().includes(arama)
    );
  }
  if (seciliKat !== "tumu") liste = liste.filter(p => p.kategori === seciliKat);
  if (state.magazaFavori) liste = liste.filter(p => p.favori);

  /* Sıralama */
  if (sirala === "fiyatArtan") liste.sort((a, b) => urunFiyat(a) - urunFiyat(b));
  else if (sirala === "fiyatAzalan") liste.sort((a, b) => urunFiyat(b) - urunFiyat(a));
  else if (sirala === "indirim") liste.sort((a, b) => urunIndirimYuzde(b) - urunIndirimYuzde(a));
  else if (sirala === "yeni") liste.sort((a, b) => new Date(b.olusturma || 0) - new Date(a.olusturma || 0));

  const kategoriler = ["tumu", ...MAGAZA_KATEGORI];
  const katVar = kategoriler.filter(k => k === "tumu" || tumUrunler().some(p => p.kategori === k));

  const katChip = katVar.map(k => {
    const aktif = seciliKat === k;
    const ad = k === "tumu" ? "Tümü" : k;
    return `<button data-action="magaza-kategori" data-k="${escapeAttr(k)}" style="flex:0 0 auto;padding:7px 13px;border-radius:18px;font-size:10.5px;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif;white-space:nowrap;border:1px solid ${aktif ? "#F27A1A" : "var(--line)"};background:${aktif ? "#F27A1A" : "rgba(255,255,255,.85)"};color:${aktif ? "#fff" : "var(--ink)"};cursor:pointer;">${escapeHtml(ad)}</button>`;
  }).join("");

  const siralaChip = (v, l) => {
    const aktif = sirala === v;
    return `<button data-action="magaza-sirala" data-v="${v}" style="flex:0 0 auto;padding:5px 10px;border-radius:14px;font-size:9.5px;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif;white-space:nowrap;border:1px solid ${aktif ? "#333" : "var(--line)"};background:${aktif ? "#333" : "transparent"};color:${aktif ? "#fff" : "#666"};cursor:pointer;">${l}</button>`;
  };

  /* Ürün kartı — 2 sütun grid */
  const kartlar = liste.map(p => {
    const fiyat = urunFiyat(p);
    const ind = urunIndirimYuzde(p);
    const stok = urunStokta(p);
    const adet = state.cart[p.id] || 0;

    return `<div style="background:#fff;border-radius:12px;overflow:hidden;border:1px solid #EDEDED;box-shadow:0 1px 4px rgba(0,0,0,.04);position:relative;display:flex;flex-direction:column;">
      ${ind > 0 ? `<div style="position:absolute;top:6px;left:6px;background:#F27A1A;color:#fff;font-size:9px;font-weight:800;padding:3px 6px;border-radius:5px;z-index:2;">%${ind} İNDİRİM</div>` : ""}
      <button data-action="magaza-favori" data-id="${p.id}" style="position:absolute;top:6px;right:6px;background:rgba(255,255,255,.95);border:none;width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:14px;z-index:2;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 3px rgba(0,0,0,.1);">${p.favori ? "❤️" : "🤍"}</button>

      <div data-action="magaza-urun" data-id="${p.id}" style="cursor:pointer;">
        ${p.gorsel
          ? `<img src="${p.gorsel}" alt="" style="width:100%;aspect-ratio:1;object-fit:cover;display:block;background:#F7F7F7;" />`
          : `<div style="width:100%;aspect-ratio:1;background:linear-gradient(135deg,#F1FBF6,#E3F2F7);display:flex;align-items:center;justify-content:center;font-size:38px;">${urunEmoji(p.kategori)}</div>`}
      </div>

      <div style="padding:8px 9px 10px;flex:1;display:flex;flex-direction:column;">
        <p data-action="magaza-urun" data-id="${p.id}" style="font-size:11px;font-weight:600;margin:0 0 3px;line-height:1.35;color:#333;cursor:pointer;height:30px;overflow:hidden;">${escapeHtml(p.ad)}</p>
        ${p.marka ? `<p style="font-size:9px;color:#999;margin:0 0 4px;">${escapeHtml(p.marka)}</p>` : ""}

        <div style="display:flex;align-items:center;gap:3px;margin-bottom:4px;min-height:14px;">
          ${accNum(p.puan) > 0
            ? `<span style="font-size:12px;color:#FFB300;">★</span><span style="font-size:9.5px;color:#666;font-weight:700;">${accNum(p.puan).toFixed(1)}</span><span style="font-size:9px;color:#999;">(${accNum(p.yorumSayisi)})</span>`
            : `<span style="font-size:9px;color:#bbb;">Yeni ürün</span>`}
        </div>

        <div style="margin-top:auto;">
          ${ind > 0 ? `<p style="font-size:9.5px;color:#999;text-decoration:line-through;margin:0;">${accTL0(p.fiyat)}</p>` : ""}
          <p style="font-size:13.5px;font-weight:800;color:#F27A1A;margin:0 0 6px;">${accTL0(fiyat)}</p>

          ${stok
            ? (adet > 0
              ? `<div style="display:flex;align-items:center;justify-content:space-between;background:#F27A1A;border-radius:7px;padding:2px;">
                   <button data-action="cart-dec" data-id="${p.id}" style="background:none;border:none;color:#fff;font-size:15px;font-weight:700;width:26px;height:24px;cursor:pointer;">−</button>
                   <span style="color:#fff;font-size:11.5px;font-weight:800;">${adet}</span>
                   <button data-action="cart-inc" data-id="${p.id}" style="background:none;border:none;color:#fff;font-size:15px;font-weight:700;width:26px;height:24px;cursor:pointer;">+</button>
                 </div>`
              : `<button data-action="cart-inc" data-id="${p.id}" style="width:100%;background:#fff;border:1.5px solid #F27A1A;color:#F27A1A;border-radius:7px;padding:6px;font-size:10.5px;font-weight:800;cursor:pointer;font-family:inherit;">Sepete Ekle</button>`)
            : `<button disabled style="width:100%;background:#F0F0F0;border:none;color:#999;border-radius:7px;padding:6px;font-size:10.5px;font-weight:700;">Tükendi</button>`}
        </div>
      </div>
    </div>`;
  }).join("");

  const count = cartCount();
  const toplam = cartTotal();

  return `
    <div class="topbar" style="background:linear-gradient(135deg,#F27A1A,#FF9F43);">
      <div class="topbar-inner">
        <button class="backbtn" data-action="goto" data-screen="home" style="position:relative;">←</button>
        <img src="icon-192.png" class="logo-badge-img" alt="" />
        <div>
          <p class="eyebrow" style="color:rgba(255,255,255,.85);">Nur Diş Mağaza</p>
          <h1 class="title">Ağız Bakım Ürünleri</h1>
        </div>
      </div>
      ${scallop()}
    </div>

    <div class="content" style="padding-bottom:${count > 0 ? "150px" : "30px"};">

      <!-- ARAMA -->
      <div style="position:relative;margin-bottom:10px;">
        <input class="input" id="magaza-arama" placeholder="🔍 Ürün, marka veya kategori ara..." value="${escapeAttr(state.magazaArama || "")}" data-action-blur="magaza-ara" style="font-size:12.5px;padding:11px 12px;border-radius:11px;border:1px solid #E0E0E0;background:#fff;" />
        ${state.magazaArama ? `<button data-action="magaza-arama-temizle" style="position:absolute;right:9px;top:50%;transform:translateY(-50%);background:#EEE;border:none;width:22px;height:22px;border-radius:50%;cursor:pointer;font-size:12px;color:#666;display:flex;align-items:center;justify-content:center;">✕</button>` : ""}
      </div>

      <!-- KATEGORİ -->
      <div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:8px;margin-bottom:4px;">${katChip}</div>

      <!-- SIRALAMA + FAVORİ -->
      <div style="display:flex;gap:5px;overflow-x:auto;padding-bottom:10px;align-items:center;">
        ${siralaChip("onerilen", "Önerilen")}
        ${siralaChip("fiyatArtan", "Fiyat ↑")}
        ${siralaChip("fiyatAzalan", "Fiyat ↓")}
        ${siralaChip("indirim", "İndirim")}
        ${siralaChip("yeni", "Yeni")}
        <button data-action="magaza-favoriler" style="flex:0 0 auto;padding:5px 10px;border-radius:14px;font-size:9.5px;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif;white-space:nowrap;border:1px solid ${state.magazaFavori ? "#E91E63" : "var(--line)"};background:${state.magazaFavori ? "#E91E63" : "transparent"};color:${state.magazaFavori ? "#fff" : "#666"};cursor:pointer;">${state.magazaFavori ? "❤️ Favoriler" : "🤍 Favoriler"}</button>
      </div>

      <p style="font-size:10.5px;color:#888;margin:0 0 10px;">${liste.length} ürün${arama ? ' · "' + escapeHtml(state.magazaArama) + '"' : ""}</p>

      ${liste.length
        ? `<div style="display:grid;grid-template-columns:1fr 1fr;gap:9px;">${kartlar}</div>`
        : `<div class="card p5" style="text-align:center;">
             <div style="font-size:40px;margin-bottom:10px;">🔍</div>
             <p class="name" style="font-size:14px;margin:0 0 4px;">Ürün bulunamadı</p>
             <p class="desc" style="margin:0;">Arama kriterlerinizi değiştirin</p>
           </div>`}

      <div style="background:#FFF8F0;border:1px solid #FFE0C2;border-radius:11px;padding:11px;margin-top:14px;">
        <p style="font-size:10px;color:#B25E00;margin:0;line-height:1.65;">
          🚚 <b>Teslimat:</b> Klinikten teslim veya kargo<br/>
          💳 <b>Ödeme:</b> Nakit, kredi kartı, havale<br/>
          🛡️ <b>Orijinal ürün garantisi</b>
        </p>
      </div>
    </div>

    ${count > 0 ? `
    <div style="position:fixed;bottom:70px;left:0;right:0;max-width:430px;margin:0 auto;padding:0 12px;z-index:18;">
      <button data-action="goto-checkout" style="width:100%;background:#F27A1A;border:none;border-radius:11px;padding:13px;color:#fff;font-size:13px;font-weight:800;font-family:inherit;cursor:pointer;display:flex;justify-content:space-between;align-items:center;box-shadow:0 4px 14px rgba(242,122,26,.35);">
        <span>🛒 ${count} ürün</span>
        <span>${accTL(toplam)} →</span>
      </button>
    </div>` : ""}`;
}

function urunEmoji(kategori) {
  const m = {
    "Çocuk Ürünleri": "🧒", "Yetişkin Ürünleri": "🪥", "Ağız Bakım": "🦷",
    "Beyazlatma": "✨", "Ortodonti": "😁", "Protez Bakım": "🦿",
    "Cihaz": "⚙️", "Diğer": "📦"
  };
  return m[kategori] || "🦷";
}

/* ---------------- ÜRÜN DETAY ---------------- */

function renderMagazaUrun() {
  const p = urunBul(state.magazaUrunId);
  if (!p) return `${topbar("Ürün", "", { back: "store" })}<div class="content"><p class="footnote">Ürün bulunamadı.</p></div>`;

  const fiyat = urunFiyat(p);
  const ind = urunIndirimYuzde(p);
  const stok = accNum(p.stok);
  const adet = state.cart[p.id] || 0;

  return `
    <div class="topbar" style="background:linear-gradient(135deg,#F27A1A,#FF9F43);">
      <div class="topbar-inner">
        <button class="backbtn" data-action="goto" data-screen="store" style="position:relative;">←</button>
        <div style="flex:1;">
          <h1 class="title" style="font-size:15px;line-height:1.3;">${escapeHtml(p.ad)}</h1>
        </div>
        <button data-action="magaza-favori" data-id="${p.id}" style="background:rgba(255,255,255,.2);border:none;width:34px;height:34px;border-radius:50%;cursor:pointer;font-size:16px;">${p.favori ? "❤️" : "🤍"}</button>
      </div>
      ${scallop()}
    </div>

    <div class="content" style="padding-bottom:${adet > 0 ? "150px" : "30px"};">
      <div style="background:#fff;border-radius:13px;overflow:hidden;border:1px solid #EDEDED;margin-bottom:12px;">
        ${p.gorsel
          ? `<img src="${p.gorsel}" alt="" style="width:100%;aspect-ratio:1;object-fit:cover;display:block;" />`
          : `<div style="width:100%;aspect-ratio:1;background:linear-gradient(135deg,#F1FBF6,#E3F2F7);display:flex;align-items:center;justify-content:center;font-size:80px;">${urunEmoji(p.kategori)}</div>`}
      </div>

      ${ind > 0 ? `<div style="background:#FFF3E0;border:1px solid #FFCC80;border-radius:9px;padding:8px;margin-bottom:10px;text-align:center;">
        <span style="font-size:11px;font-weight:800;color:#E65100;">🔥 %${ind} İNDİRİM · ${accTL0(accNum(p.fiyat) - fiyat)} kazancınız</span>
      </div>` : ""}

      ${typeof urunYorumlarHTML === "function" ? urunYorumlarHTML(p.id) : ""}

      <div class="card p4 mb3">
        ${p.marka ? `<p style="font-size:10px;color:#F27A1A;font-weight:700;margin:0 0 4px;">${escapeHtml(p.marka)}</p>` : ""}
        <p style="font-size:14px;font-weight:700;margin:0 0 8px;line-height:1.4;color:#222;">${escapeHtml(p.ad)}</p>

        <div style="display:flex;align-items:center;gap:5px;margin-bottom:10px;">
          ${accNum(p.puan) > 0
            ? `<span style="font-size:14px;color:#FFB300;">${"★".repeat(Math.round(accNum(p.puan)))}</span>
               <span style="font-size:11px;color:#666;font-weight:700;">${accNum(p.puan).toFixed(1)}</span>
               <span style="font-size:10px;color:#999;">· ${accNum(p.yorumSayisi)} değerlendirme</span>`
            : `<span style="font-size:10px;color:#bbb;">Henüz değerlendirilmedi</span>`}
        </div>

        <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:10px;">
          ${ind > 0 ? `<span style="font-size:13px;color:#999;text-decoration:line-through;">${accTL0(p.fiyat)}</span>` : ""}
          <span style="font-size:24px;font-weight:800;color:#F27A1A;">${accTL0(fiyat)}</span>
        </div>

        <p style="font-size:10.5px;margin:0;color:${stok > 0 ? "#2E7D32" : "#C62828"};font-weight:700;">
          ${stok > 5 ? "✓ Stokta (" + stok + " adet)" : stok > 0 ? "⚠️ Son " + stok + " ürün!" : "✗ Tükendi"}
        </p>
      </div>

      ${p.aciklama ? `<div class="card p4 mb3">
        <p style="font-size:11.5px;font-weight:700;margin:0 0 6px;color:#333;">Ürün Açıklaması</p>
        <p style="font-size:11px;color:#555;margin:0;line-height:1.75;">${escapeHtml(p.aciklama).replace(/\n/g, "<br/>")}</p>
      </div>` : ""}

      <div class="card p4 mb3" style="background:#F7F7F7;">
        <p style="font-size:11px;font-weight:700;margin:0 0 8px;color:#333;">Teslimat & Ödeme</p>
        <p style="font-size:10.5px;color:#666;margin:0;line-height:1.8;">
          🚚 Klinikten teslim veya kargo<br/>
          💳 Nakit · Kredi kartı · Havale/EFT<br/>
          🛡️ Orijinal ürün garantisi<br/>
          ↩️ Açılmamış ürünlerde 14 gün iade
        </p>
      </div>

      ${stok > 0 ? `<div class="card p4 mb3">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <span style="font-size:12px;font-weight:700;color:#333;">Adet</span>
          <div style="display:flex;align-items:center;gap:10px;">
            <button data-action="cart-dec" data-id="${p.id}" style="width:34px;height:34px;background:#F0F0F0;border:none;border-radius:9px;font-size:18px;font-weight:700;cursor:pointer;color:#333;">−</button>
            <span style="font-size:15px;font-weight:800;min-width:24px;text-align:center;">${adet}</span>
            <button data-action="cart-inc" data-id="${p.id}" style="width:34px;height:34px;background:#F27A1A;border:none;border-radius:9px;font-size:18px;font-weight:700;cursor:pointer;color:#fff;">+</button>
          </div>
        </div>
      </div>` : ""}
    </div>

    ${adet > 0 ? `
    <div style="position:fixed;bottom:70px;left:0;right:0;max-width:430px;margin:0 auto;padding:0 12px;z-index:18;">
      <button data-action="goto-checkout" style="width:100%;background:#F27A1A;border:none;border-radius:11px;padding:13px;color:#fff;font-size:13px;font-weight:800;font-family:inherit;cursor:pointer;display:flex;justify-content:space-between;box-shadow:0 4px 14px rgba(242,122,26,.35);">
        <span>🛒 ${adet} adet · ${accTL(fiyat * adet)}</span>
        <span>Sepete Git →</span>
      </button>
    </div>` : ""}`;
}

/* ---------------- YÖNETİCİ: ÜRÜN YÖNETİMİ ---------------- */

function renderAccMagaza() {
  const liste = tumUrunler();
  const aktifSayi = liste.filter(p => p.aktif !== false).length;
  const tukenenSayi = liste.filter(p => accNum(p.stok) <= 0 && p.aktif !== false).length;
  const indirimliSayi = liste.filter(p => urunIndirimYuzde(p) > 0).length;
  const toplamDeger = liste.filter(p => p.aktif !== false).reduce((s, p) => s + accNum(p.stok) * urunFiyat(p), 0);

  const ed = state.magazaUrunEdit;
  let formHtml = "";

  if (ed !== null && ed !== undefined) {
    const p = liste.find(x => x.id === ed) || {
      id: "", ad: "", kategori: "Yetişkin Ürünleri", fiyat: "", indirimFiyat: "",
      stok: 10, aciklama: "", marka: "", gorsel: "", aktif: true
    };

    formHtml = `<div class="card p4 mb3" style="border:2px solid #F27A1A;background:#FFF8F0;">
      <p style="font-size:13px;font-weight:700;margin:0 0 10px;color:#B25E00;">${p.id ? "✏️ Ürünü Düzenle" : "➕ Yeni Ürün"}</p>

      <div class="field"><label>Ürün adı *</label>
        <input class="input" id="mp-ad" value="${escapeAttr(p.ad || "")}" placeholder="Örn: Elektrikli Diş Fırçası Pro" style="font-size:12px;" />
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div class="field"><label>Kategori *</label>
          <select class="input" id="mp-kategori" style="font-size:11.5px;">
            ${MAGAZA_KATEGORI.map(k => `<option ${p.kategori === k ? "selected" : ""}>${k}</option>`).join("")}
          </select>
        </div>
        <div class="field"><label>Marka</label>
          <input class="input" id="mp-marka" value="${escapeAttr(p.marka || "")}" placeholder="Örn: Oral-B" style="font-size:11.5px;" />
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;">
        <div class="field"><label>Fiyat (₺) *</label>
          <input class="input" type="number" step="0.01" id="mp-fiyat" value="${accNum(p.fiyat) || ""}" style="font-size:11.5px;" />
        </div>
        <div class="field"><label>İndirimli (₺)</label>
          <input class="input" type="number" step="0.01" id="mp-indirim" value="${accNum(p.indirimFiyat) || ""}" placeholder="yok" style="font-size:11.5px;" />
        </div>
        <div class="field"><label>Stok</label>
          <input class="input" type="number" id="mp-stok" value="${accNum(p.stok)}" style="font-size:11.5px;" />
        </div>
      </div>

      <div class="field"><label>Ürün açıklaması</label>
        <textarea id="mp-aciklama" placeholder="Ürünün özellikleri, kullanım şekli, içerik..." style="width:100%;min-height:80px;font-size:11.5px;padding:9px;border:1px solid var(--line);border-radius:8px;font-family:inherit;line-height:1.5;resize:vertical;">${escapeHtml(p.aciklama || "")}</textarea>
      </div>

      <div class="field">
        <label>Ürün görseli</label>
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:6px;">
          ${p.gorsel
            ? `<img src="${p.gorsel}" alt="" style="width:60px;height:60px;object-fit:cover;border-radius:9px;border:1px solid var(--line);" />`
            : `<div style="width:60px;height:60px;border-radius:9px;background:#F0F0F0;display:flex;align-items:center;justify-content:center;font-size:24px;">📷</div>`}
          <div style="flex:1;">
            <input type="file" id="mp-gorsel-dosya" accept="image/*" style="font-size:10.5px;width:100%;" />
            <p style="font-size:8.5px;color:#888;margin:3px 0 0;">Galeriden seç · otomatik küçültülür</p>
          </div>
        </div>
        <input class="input" id="mp-gorsel-url" value="${escapeAttr(p.gorsel && !p.gorsel.startsWith("data:") ? p.gorsel : "")}" placeholder="veya görsel URL'si yapıştır" style="font-size:11px;" />
      </div>

      <label style="display:flex;align-items:center;gap:8px;font-size:11.5px;margin-bottom:12px;cursor:pointer;">
        <input type="checkbox" id="mp-aktif" ${p.aktif !== false ? "checked" : ""} />
        <span>Mağazada satışta (aktif)</span>
      </label>

      <div style="display:flex;gap:8px;">
        <button class="btn-primary" style="background:#F27A1A;font-size:12px;padding:11px;" data-action="mp-kaydet" data-id="${p.id || ""}">💾 Kaydet</button>
        <button class="btn-primary" style="background:#757575;font-size:12px;padding:11px;" data-action="mp-iptal">İptal</button>
      </div>
    </div>`;
  }

  const satirlar = liste.map(p => {
    const ind = urunIndirimYuzde(p);
    const stok = accNum(p.stok);
    const pasif = p.aktif === false;
    return `<div class="card p3 mb2" style="${pasif ? "opacity:.5;" : ""}">
      <div style="display:flex;gap:10px;">
        ${p.gorsel
          ? `<img src="${p.gorsel}" alt="" style="width:54px;height:54px;object-fit:cover;border-radius:9px;flex-shrink:0;border:1px solid var(--line);" />`
          : `<div style="width:54px;height:54px;border-radius:9px;background:#F5F5F5;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;">${urunEmoji(p.kategori)}</div>`}
        <div style="flex:1;min-width:0;">
          <p style="font-size:12px;font-weight:700;margin:0;line-height:1.3;">${escapeHtml(p.ad)} ${pasif ? "· <span style='color:#999;font-weight:400;'>(pasif)</span>" : ""}</p>
          <p style="font-size:9.5px;color:var(--muted);margin:2px 0 0;">${escapeHtml(p.kategori || "")}${p.marka ? " · " + escapeHtml(p.marka) : ""}</p>
          <div style="display:flex;gap:8px;margin-top:4px;font-size:10px;">
            <span style="color:#F27A1A;font-weight:800;">${accTL0(urunFiyat(p))}</span>
            ${ind > 0 ? `<span style="color:#999;text-decoration:line-through;">${accTL0(p.fiyat)}</span><span style="color:#E65100;font-weight:700;">%${ind}</span>` : ""}
            <span style="color:${stok > 0 ? "#2E7D32" : "#C62828"};font-weight:700;">${stok > 0 ? stok + " adet" : "Tükendi"}</span>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:4px;flex-shrink:0;">
          <button data-action="mp-duzenle" data-id="${p.id}" style="background:#FFF3E0;border:none;border-radius:6px;padding:5px 8px;cursor:pointer;font-size:11px;">✏️</button>
          <button data-action="mp-stok-arttir" data-id="${p.id}" style="background:#E8F5E9;border:none;border-radius:6px;padding:5px 8px;cursor:pointer;font-size:10px;">+10</button>
          <button data-action="mp-sil" data-id="${p.id}" style="background:#FFEBEE;border:none;border-radius:6px;padding:5px 8px;cursor:pointer;font-size:11px;color:#C62828;">🗑️</button>
        </div>
      </div>
    </div>`;
  }).join("") || `<p class="footnote">Henüz ürün yok.</p>`;

  return `
    <div class="card p4 mb3" style="background:linear-gradient(135deg,#E65100,#F27A1A);color:#fff;border:none;">
      <p style="font-size:13px;font-weight:700;margin:0 0 2px;">🛒 Mağaza Yönetimi</p>
      <p style="font-size:10.5px;opacity:.9;margin:0 0 10px;">${liste.length} ürün · ${aktifSayi} satışta</p>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;">
        <div style="background:rgba(255,255,255,.18);border-radius:9px;padding:7px;text-align:center;">
          <p style="font-size:8.5px;margin:0;opacity:.9;">TÜKENEN</p>
          <p style="font-size:15px;font-weight:800;margin:2px 0 0;">${tukenenSayi}</p>
        </div>
        <div style="background:rgba(255,255,255,.18);border-radius:9px;padding:7px;text-align:center;">
          <p style="font-size:8.5px;margin:0;opacity:.9;">İNDİRİMLİ</p>
          <p style="font-size:15px;font-weight:800;margin:2px 0 0;">${indirimliSayi}</p>
        </div>
        <div style="background:rgba(255,255,255,.18);border-radius:9px;padding:7px;text-align:center;">
          <p style="font-size:8.5px;margin:0;opacity:.9;">STOK DEĞERİ</p>
          <p style="font-size:12px;font-weight:800;margin:4px 0 0;">${accTL0(toplamDeger)}</p>
        </div>
      </div>
    </div>

    ${formHtml}
    ${ed === null || ed === undefined ? `<button class="btn-primary mb3" style="background:#F27A1A;font-size:12.5px;padding:12px;" data-action="mp-yeni">➕ Yeni Ürün Ekle</button>` : ""}

    <p class="section-label">Ürünler (${liste.length})</p>
    ${satirlar}

    <div class="card p4 mb3" style="background:#FFF8F0;border:1px solid #FFE0C2;margin-top:12px;">
      <p style="font-size:11.5px;font-weight:700;color:#B25E00;margin:0 0 6px;">💡 Ürün ekleme ipuçları</p>
      <p style="font-size:10.5px;color:#8D4E00;margin:0;line-height:1.7;">
        • <b>Görsel:</b> kare (1:1) fotoğraf en iyi görünür — galeriden seç, otomatik küçültülür<br/>
        • <b>İndirimli fiyat:</b> asıl fiyattan düşük girersen "%X İNDİRİM" etiketi otomatik çıkar<br/>
        • <b>Stok:</b> 0 girersen "Tükendi" görünür, satın alınamaz<br/>
        • <b>Pasif:</b> işaretini kaldırırsan ürün mağazada görünmez (silmeden gizle)
      </p>
    </div>

    <div class="card p4 mb3" style="background:#E3F2FD;border:1px solid #90CAF9;">
      <p style="font-size:11.5px;font-weight:700;color:#0D47A1;margin:0 0 6px;">🔗 Mağazayı Test Et</p>
      <p style="font-size:10.5px;color:#1565C0;margin:0 0 9px;line-height:1.6;">
        Müşterinin gördüğü ekranı kontrol et — görsel, fiyat, stok doğru mu?
      </p>
      <button class="btn-primary" style="background:#1565C0;font-size:11.5px;padding:10px;" data-action="goto" data-screen="store">🛒 Mağazayı Aç</button>
    </div>`;
}

/* ---------------- AKSİYONLAR ---------------- */

function magazaAction(action, el) {
  /* --- müşteri tarafı --- */
  if (action === "magaza-kategori") { state.magazaKategori = el.dataset.k; render(); window.scrollTo(0, 0); return true; }
  if (action === "magaza-sirala") { state.magazaSirala = el.dataset.v; render(); return true; }
  if (action === "magaza-favoriler") { state.magazaFavori = !state.magazaFavori; render(); return true; }
  if (action === "magaza-urun") { state.magazaUrunId = el.dataset.id; state.screen = "magaza-urun"; render(); window.scrollTo(0, 0); return true; }

  if (action === "magaza-favori") {
    const p = urunBul(el.dataset.id);
    if (!p) return true;
    p.favori = !p.favori;
    urunKaydet();
    render();
    return true;
  }

  if (action === "magaza-ara") {
    state.magazaArama = document.getElementById("magaza-arama")?.value || "";
    render();
    return true;
  }
  if (action === "magaza-arama-temizle") { state.magazaArama = ""; render(); return true; }

  /* --- yönetici tarafı --- */
  if (action === "mp-yeni") { state.magazaUrunEdit = ""; render(); window.scrollTo(0, 0); return true; }
  if (action === "mp-duzenle") { state.magazaUrunEdit = el.dataset.id; render(); window.scrollTo(0, 0); return true; }
  if (action === "mp-iptal") { state.magazaUrunEdit = undefined; render(); return true; }

  if (action === "mp-kaydet") {
    const id = el.dataset.id;
    const ad = (document.getElementById("mp-ad")?.value || "").trim();
    const fiyat = accNum(document.getElementById("mp-fiyat")?.value);
    if (!ad) { alert("Ürün adı gerekli."); return true; }
    if (!(fiyat > 0)) { alert("Geçerli bir fiyat girin."); return true; }

    const indirim = accNum(document.getElementById("mp-indirim")?.value);
    if (indirim > 0 && indirim >= fiyat) { alert("İndirimli fiyat, normal fiyattan düşük olmalı."); return true; }

    const urlGorsel = (document.getElementById("mp-gorsel-url")?.value || "").trim();
    const mevcut = id ? urunBul(id) : null;
    const mevcutGorsel = mevcut ? (mevcut.gorsel || "") : "";

    const rec = {
      id: id || ("u_" + Date.now()),
      ad,
      kategori: document.getElementById("mp-kategori")?.value || "Diğer",
      marka: (document.getElementById("mp-marka")?.value || "").trim(),
      fiyat,
      indirimFiyat: indirim > 0 ? indirim : null,
      stok: accNum(document.getElementById("mp-stok")?.value),
      aciklama: (document.getElementById("mp-aciklama")?.value || "").trim(),
      gorsel: urlGorsel || mevcutGorsel,
      aktif: !!document.getElementById("mp-aktif")?.checked,
      favori: mevcut ? mevcut.favori : false,
      puan: mevcut ? mevcut.puan : 0,
      yorumSayisi: mevcut ? mevcut.yorumSayisi : 0,
      satis: mevcut ? mevcut.satis : 0,
      olusturma: mevcut ? mevcut.olusturma : new Date().toISOString()
    };

    const kaydet = () => {
      if (!state.products) state.products = [];
      if (id) {
        const old = state.products.find(x => x.id === id);
        Object.assign(old, rec);
      } else {
        state.products.push(rec);
      }
      urunKaydet();
      state.magazaUrunEdit = undefined;
      alert("✅ Ürün kaydedildi.");
      render();
    };

    /* Görsel dosyası seçildiyse küçült ve kaydet */
    const dosyaInput = document.getElementById("mp-gorsel-dosya");
    const dosya = dosyaInput && dosyaInput.files && dosyaInput.files[0];
    if (dosya && typeof dosyaHazirla === "function") {
      dosyaInput.disabled = true;
      dosyaHazirla(dosya, 900, 110).then((r) => {
        rec.gorsel = r.dataUrl;
        kaydet();
      }).catch((err) => {
        dosyaInput.disabled = false;
        alert("Görsel yüklenemedi: " + (err && err.message ? err.message : ""));
      });
      return true;
    }

    kaydet();
    return true;
  }

  if (action === "mp-sil") {
    const p = urunBul(el.dataset.id);
    if (!p) return true;
    if (!confirm('"' + p.ad + '" silinsin mi?\n\n(Bu işlem geri alınamaz. Gizlemek isterseniz "Aktif" işaretini kaldırın.)')) return true;
    state.products = (state.products || []).filter(x => x.id !== el.dataset.id);
    delete state.cart[el.dataset.id];
    urunKaydet();
    render();
    return true;
  }

  if (action === "mp-stok-arttir") {
    const p = urunBul(el.dataset.id);
    if (!p) return true;
    p.stok = accNum(p.stok) + 10;
    urunKaydet();
    render();
    return true;
  }

  return false;
}
