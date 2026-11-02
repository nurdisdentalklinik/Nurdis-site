/* =====================================================================
   ↩️ İADE / DEĞİŞİM TALEBİ  +  ⭐ ÜRÜN YORUMLARI  +  🗺️ ADRES HARİTASI
   ---------------------------------------------------------------------
   1) İADE: müşteri sipariş için iade/değişim talebi açar, yönetici
      onaylar/reddeder. Durum takibi iki tarafta da görünür.
   2) YORUM: satın almış müşteri ürüne 1-5 yıldız + yorum + foto yazar.
      Yönetici onaylar/siler. Ürün sayfasında ortalama puan görünür.
   3) HARİTA: adres kaydederken konum alınır (GPS veya elle),
      OpenStreetMap önizlemesi gösterilir, kargo etiketine konum linki
      eklenir.
   ===================================================================== */

/* ---------------------------------------------------------------------
   YARDIMCI: zaman aşımı olan promise
   Firestore çevrimdışıyken yazma isteği sonsuza kadar bekler ve kullanıcı
   "Gönderiliyor…" ekranında kalır. Bu sarmalayıcı belirtilen süre sonunda
   vazgeçip işlemi cihazda tamamlar (yerel kayıt zaten tutuluyor).
   --------------------------------------------------------------------- */
function _zamanliPromise(promise, ms) {
  return Promise.race([
    promise,
    new Promise((resolve) => setTimeout(() => resolve({ _zamanAsimi: true, id: null }), ms || 6000))
  ]).catch(() => ({ _zamanAsimi: true, id: null }));
}

/* ---------------------------------------------------------------------
   1. İADE / DEĞİŞİM
   --------------------------------------------------------------------- */

const IADE_NEDEN = [
  { id: "hasarli",   ad: "Ürün hasarlı geldi" },
  { id: "yanlis",    ad: "Yanlış ürün gönderildi" },
  { id: "eksik",     ad: "Ürün eksik geldi" },
  { id: "uygun",     ad: "Ürünü beğenmedim / uygun değil" },
  { id: "beklenti",  ad: "Beklentimi karşılamadı" },
  { id: "skt",       ad: "Son kullanma tarihi yakın" },
  { id: "diger",     ad: "Diğer" }
];

const IADE_DURUM = {
  bekliyor:   { ad: "Talep alındı",   ikon: "⏳", renk: "#E65100", arka: "#FFF3E0" },
  inceleniyor:{ ad: "İnceleniyor",    ikon: "🔍", renk: "#1565C0", arka: "#E3F2FD" },
  onaylandi:  { ad: "Onaylandı",      ikon: "✅", renk: "#2E7D32", arka: "#E8F5E9" },
  reddedildi: { ad: "Reddedildi",     ikon: "✖️", renk: "#C62828", arka: "#FFEBEE" },
  tamamlandi: { ad: "Tamamlandı",     ikon: "🏁", renk: "#455A64", arka: "#ECEFF1" }
};

function iadeDurum(id) {
  return IADE_DURUM[id] || IADE_DURUM.bekliyor;
}

/* Müşterinin iade talepleri */
function benimIadelerim() {
  const uid = state.user && state.user.uid;
  if (!uid) return [];
  return (state.iadeler || [])
    .filter(x => x.uid === uid)
    .sort((a, b) => new Date(b.zaman || 0) - new Date(a.zaman || 0));
}

/* Bir sipariş için açık iade talebi var mı? */
function siparisIadesi(siparisId) {
  return (state.iadeler || []).find(x => x.siparisId === siparisId && x.durum !== "reddedildi" && x.durum !== "tamamlandi") || null;
}

/* ---------------------------------------------------------------------
   2. ÜRÜN YORUMLARI
   --------------------------------------------------------------------- */

function urunYorumlari(urunId) {
  return (state.urunYorumlar || [])
    .filter(y => y.urunId === urunId && y.onay !== false)
    .sort((a, b) => new Date(b.zaman || 0) - new Date(a.zaman || 0));
}

function urunPuanOzet(urunId) {
  const liste = urunYorumlari(urunId);
  if (!liste.length) return { ort: 0, adet: 0, dagilim: [0, 0, 0, 0, 0] };
  const dagilim = [0, 0, 0, 0, 0];
  let toplam = 0;
  liste.forEach(y => {
    const p = parseInt(y.puan) || 0;
    if (p >= 1 && p <= 5) { dagilim[p - 1]++; toplam += p; }
  });
  const adet = dagilim.reduce((a, b) => a + b, 0);
  return { ort: adet ? toplam / adet : 0, adet, dagilim };
}

/* Bu ürünü satın almış mı? (doğrulanmış yorum için) */
function urunSatinAlindi(urunId) {
  const uid = state.user && state.user.uid;
  if (!uid) return false;
  return (state.orders || []).some(o =>
    o.uid === uid && (o.items || []).some(i => i.id === urunId || i.name === urunId));
}

/* Kullanıcı bu ürüne zaten yorum yazmış mı? */
function urunYorumum(urunId) {
  const uid = state.user && state.user.uid;
  if (!uid) return null;
  return (state.urunYorumlar || []).find(y => y.urunId === urunId && y.uid === uid) || null;
}

/* ---------------------------------------------------------------------
   3. HARİTA
   --------------------------------------------------------------------- */

/* OpenStreetMap gömme linki — API anahtarı GEREKMEZ */
function haritaEmbed(lat, lon, zoom) {
  if (lat === undefined || lon === undefined || lat === null || lon === null) return "";
  const z = zoom || 0.008;
  const la = parseFloat(lat), lo = parseFloat(lon);
  if (isNaN(la) || isNaN(lo)) return "";
  const bbox = [lo - z, la - z, lo + z, la + z].join(",");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${la},${lo}`;
}

function haritaLink(lat, lon) {
  if (lat === undefined || lon === undefined || lat === null || lon === null) return "";
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=17/${lat}/${lon}`;
}

/* Cihazdan konum al */
function konumAl() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) { reject(new Error("Cihaz konum desteklemiyor")); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude, hassas: pos.coords.accuracy }),
      (err) => reject(new Error(err.code === 1 ? "Konum izni verilmedi" : "Konum alınamadı")),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  });
}

/* ---------------------------------------------------------------------
   EKRAN: İADE TALEBİ OLUŞTUR
   --------------------------------------------------------------------- */

function renderIadeTalebi() {
  const siparis = (state.orders || []).find(o => o.id === state.iadeSiparisId);
  if (!siparis) {
    return `${topbar("İade Talebi", "", { back: "account" })}
      <div class="content"><p class="footnote">Sipariş bulunamadı.</p></div>`;
  }

  const tip = state.iadeTip || "iade";
  const neden = state.iadeNeden || "";

  return `${topbar("İade / Değişim", "Sipariş #" + String(siparis.id).slice(-6), { back: "account" })}
    <div class="content">

      <div class="card p4 mb3">
        <p class="desc" style="margin:0 0 4px;font-size:11px;color:var(--muted);">Sipariş</p>
        <p class="name" style="font-size:13px;margin:0;">${escapeHtml(siparisUrunleri(siparis))}</p>
        <p class="desc" style="margin:3px 0 0;font-size:11.5px;">${siparisTarih(siparis)} · ${accTL(siparis.total || 0)}</p>
      </div>

      <div class="card p4 mb3">
        <p class="section-label" style="margin:0 0 9px;">Ne yapmak istiyorsunuz?</p>
        <div style="display:flex;gap:7px;">
          ${[["iade", "↩️ İade", "Ücreti geri almak istiyorum"], ["degisim", "🔄 Değişim", "Yenisiyle değiştirilsin"]].map(([id, ad, ac]) => {
            const aktif = tip === id;
            return `<button data-action="iade-tip" data-id="${id}"
              style="flex:1;padding:11px 8px;border-radius:10px;cursor:pointer;text-align:center;
              border:1.5px solid ${aktif ? "var(--teal)" : "var(--line)"};
              background:${aktif ? "#E0F3F7" : "var(--surface)"};">
              <p style="margin:0;font-size:13px;font-weight:800;color:${aktif ? "#006064" : "var(--ink)"};">${ad}</p>
              <p style="margin:2px 0 0;font-size:9.5px;color:var(--muted);line-height:1.3;">${ac}</p>
            </button>`;
          }).join("")}
        </div>
      </div>

      <div class="card p4 mb3">
        <p class="section-label" style="margin:0 0 9px;">Neden?</p>
        ${IADE_NEDEN.map(n => {
          const aktif = neden === n.id;
          return `<button data-action="iade-neden" data-id="${n.id}"
            style="width:100%;text-align:left;padding:9px 11px;border-radius:9px;margin-bottom:5px;cursor:pointer;font-size:12px;
            border:1.5px solid ${aktif ? "var(--teal)" : "var(--line)"};
            background:${aktif ? "#E0F3F7" : "var(--surface)"};
            color:${aktif ? "#006064" : "var(--ink)"};font-weight:${aktif ? "700" : "500"};">
            ${aktif ? "●" : "○"} ${escapeHtml(n.ad)}
          </button>`;
        }).join("")}
      </div>

      <div class="card p4 mb3">
        <p class="section-label" style="margin:0 0 6px;">Açıklama (isteğe bağlı)</p>
        <textarea class="input" id="iade-not" rows="3" placeholder="Durumu kısaca anlatın…">${escapeHtml(state.iadeNot || "")}</textarea>
      </div>

      ${state.iadeHata ? `<p class="status-err" style="margin-bottom:10px;">${escapeHtml(state.iadeHata)}</p>` : ""}

      <button class="btn-primary" style="width:100%;" data-action="iade-gonder" ${state.iadeBusy ? "disabled" : ""}>
        ${state.iadeBusy ? "Gönderiliyor…" : "Talebi Gönder"}
      </button>
      <button class="btn-primary" style="width:100%;margin-top:8px;background:var(--surface);color:var(--ink);border:1px solid var(--line);" data-action="iade-iptal">Vazgeç</button>

      <div class="card p4 mb3" style="margin-top:12px;background:#FFF8E8;border-color:#F0DFAF;">
        <p class="desc" style="margin:0;font-size:10.5px;color:#8A6D1D;line-height:1.55;">
          ℹ️ Talebiniz bize ulaştıktan sonra en geç 2 iş günü içinde değerlendirilir.
          Onaylanırsa ürünü kliniğe getirmeniz veya kargo ile göndermeniz istenir.
        </p>
      </div>
    </div>`;
}

/* ---------------------------------------------------------------------
   EKRAN: ÜRÜN YORUMU YAZ
   --------------------------------------------------------------------- */

function renderYorumYaz() {
  const p = (typeof urunBul === "function") ? urunBul(state.yorumUrunId) : null;
  if (!p) return `${topbar("Yorum Yaz", "", { back: "store" })}<div class="content"><p class="footnote">Ürün bulunamadı.</p></div>`;

  const puan = state.yorumPuan || 0;
  const dogrulanmis = urunSatinAlindi(p.id);

  return `${topbar("Değerlendirme", p.ad || "", { back: "store" })}
    <div class="content">

      <div class="card p4 mb3" style="text-align:center;">
        <p class="desc" style="margin:0 0 10px;font-size:12px;">Bu ürünü nasıl buldunuz?</p>
        <div style="display:flex;justify-content:center;gap:6px;margin-bottom:8px;">
          ${[1, 2, 3, 4, 5].map(i => `
            <button data-action="yorum-puan" data-id="${i}"
              style="background:none;border:none;font-size:30px;cursor:pointer;padding:0;line-height:1;opacity:${i <= puan ? 1 : 0.28};">
              ⭐
            </button>`).join("")}
        </div>
        <p style="font-size:11.5px;color:var(--muted);margin:0;">
          ${puan === 0 ? "Yıldız seçin" : puan === 1 ? "Çok kötü" : puan === 2 ? "Kötü" : puan === 3 ? "Orta" : puan === 4 ? "İyi" : "Mükemmel"}
        </p>
      </div>

      <div class="card p4 mb3">
        <p class="section-label" style="margin:0 0 6px;">Yorumunuz</p>
        <textarea class="input" id="yorum-metin" rows="4" placeholder="Ürünle ilgili deneyiminizi paylaşın…">${escapeHtml(state.yorumMetin || "")}</textarea>
        ${dogrulanmis ? `<p class="desc" style="margin:7px 0 0;font-size:10.5px;color:#2E7D32;">✅ Bu ürünü satın aldınız — yorumunuz "doğrulanmış" olarak işaretlenecek.</p>` : ""}
      </div>

      ${state.yorumHata ? `<p class="status-err" style="margin-bottom:10px;">${escapeHtml(state.yorumHata)}</p>` : ""}

      <button class="btn-primary" style="width:100%;" data-action="yorum-gonder" ${state.yorumBusy ? "disabled" : ""}>
        ${state.yorumBusy ? "Gönderiliyor…" : "Yorumu Gönder"}
      </button>
      <button class="btn-primary" style="width:100%;margin-top:8px;background:var(--surface);color:var(--ink);border:1px solid var(--line);" data-action="yorum-iptal">Vazgeç</button>
    </div>`;
}

/* ---------------------------------------------------------------------
   BLOK: Ürün sayfasında yorumlar
   --------------------------------------------------------------------- */

function urunYorumlarHTML(urunId) {
  const ozet = urunPuanOzet(urunId);
  const liste = urunYorumlari(urunId);
  const benim = urunYorumum(urunId);
  const girisVar = !!(state.user && state.user.uid);

  const yildiz = (n) => "★".repeat(Math.round(n)) + "☆".repeat(5 - Math.round(n));

  return `<div class="card p4 mb3" style="border:1px solid #EDEDED;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
      <p style="font-size:13px;font-weight:800;margin:0;color:#222;">⭐ Değerlendirmeler (${ozet.adet})</p>
      ${girisVar && !benim ? `<button data-action="yorum-yaz" data-id="${urunId}"
        style="background:#FFF3E0;border:1px solid #FFCC80;color:#E65100;border-radius:8px;padding:6px 10px;font-size:10.5px;font-weight:800;cursor:pointer;">Yorum Yaz</button>` : ""}
    </div>

    ${ozet.adet ? `
      <div style="display:flex;gap:14px;align-items:center;background:#FAFAFA;border-radius:10px;padding:11px;margin-bottom:10px;">
        <div style="text-align:center;flex-shrink:0;">
          <p style="font-size:26px;font-weight:800;margin:0;line-height:1;color:#F27A1A;">${ozet.ort.toFixed(1)}</p>
          <p style="font-size:12px;color:#FFB300;margin:3px 0 0;letter-spacing:1px;">${yildiz(ozet.ort)}</p>
        </div>
        <div style="flex:1;min-width:0;">
          ${[5, 4, 3, 2, 1].map(i => {
            const adet = ozet.dagilim[i - 1] || 0;
            const yuzde = ozet.adet ? Math.round(adet / ozet.adet * 100) : 0;
            return `<div style="display:flex;align-items:center;gap:6px;margin-bottom:2px;">
              <span style="font-size:9px;color:#999;width:8px;">${i}</span>
              <div style="flex:1;height:5px;background:#EEE;border-radius:3px;overflow:hidden;">
                <div style="height:100%;width:${yuzde}%;background:#FFB300;"></div>
              </div>
              <span style="font-size:9px;color:#999;width:18px;text-align:right;">${adet}</span>
            </div>`;
          }).join("")}
        </div>
      </div>

      ${liste.slice(0, 6).map(y => `
        <div style="padding:9px 0;border-top:1px solid #F0F0F0;">
          <div style="display:flex;justify-content:space-between;gap:8px;margin-bottom:3px;">
            <div style="display:flex;align-items:center;gap:5px;min-width:0;">
              <span style="font-size:11.5px;font-weight:700;color:#333;">${escapeHtml(y.ad || "Müşteri")}</span>
              ${y.dogrulanmis ? `<span style="font-size:8.5px;font-weight:800;background:#E8F5E9;color:#2E7D32;padding:1px 5px;border-radius:4px;">✓ SATIN ALDI</span>` : ""}
            </div>
            <span style="font-size:10px;color:#FFB300;white-space:nowrap;">${yildiz(accNum(y.puan))}</span>
          </div>
          <p style="margin:0;font-size:11.5px;line-height:1.5;color:#555;">${escapeHtml(y.metin || "")}</p>
          ${y.zaman ? `<p style="margin:3px 0 0;font-size:9.5px;color:#AAA;">${new Date(y.zaman).toLocaleDateString("tr-TR")}</p>` : ""}
        </div>`).join("")}

      ${benim ? `<p class="desc" style="margin:9px 0 0;font-size:10.5px;color:#2E7D32;">✓ Bu ürüne yorum yaptınız.</p>` : ""}
    ` : `
      <p class="desc" style="margin:0;font-size:11.5px;text-align:center;padding:10px 0;color:#999;">
        Henüz değerlendirme yok. İlk yorumu siz yazın!
      </p>
      ${!girisVar ? `<button class="btn-primary" style="width:100%;margin-top:6px;font-size:12px;padding:9px;" data-action="goto" data-screen="account">Yorum için giriş yapın</button>` : ""}
    `}
  </div>`;
}

/* ---------------------------------------------------------------------
   OLAYLAR
   --------------------------------------------------------------------- */

function iadeAction(el, action) {
  /* ---- İADE ---- */
  if (action === "iade-baslat") {
    state.iadeSiparisId = el.dataset.id;
    state.iadeTip = "iade";
    state.iadeNeden = "";
    state.iadeNot = "";
    state.iadeHata = "";
    state.screen = "iade-talebi";
    render();
    window.scrollTo(0, 0);
    return true;
  }

  if (action === "iade-tip") { state.iadeTip = el.dataset.id; render(); return true; }
  if (action === "iade-neden") { state.iadeNeden = el.dataset.id; render(); return true; }
  if (action === "iade-iptal") { state.screen = "account"; state.hesapSekme = "siparisler"; render(); return true; }

  if (action === "iade-gonder") {
    const sip = (state.orders || []).find(o => o.id === state.iadeSiparisId);
    if (!sip) return true;
    if (!state.iadeNeden) { state.iadeHata = "Lütfen bir neden seçin."; render(); return true; }
    if (!state.user || !state.user.uid) { state.iadeHata = "Giriş yapmanız gerekir."; render(); return true; }

    state.iadeBusy = true; state.iadeHata = ""; render();

    const kayit = {
      siparisId: sip.id,
      siparisOzet: siparisUrunleri(sip),
      tutar: sip.total || 0,
      tip: state.iadeTip || "iade",
      neden: state.iadeNeden,
      nedenAd: (IADE_NEDEN.find(n => n.id === state.iadeNeden) || {}).ad || "",
      not: (document.getElementById("iade-not")?.value || "").trim(),
      durum: "bekliyor",
      zaman: new Date().toISOString(),
      uid: state.user.uid,
      musteri: (state.userProfile || {}).firstName || state.user.name || "",
      telefon: (state.userProfile || {}).phone || sip.phone || ""
    };

    /* OFFLINE-FIRST: talep ÖNCE cihaza yazılır, kullanıcı anında onay görür.
       Buluta gönderim arka planda olur; başarısız olursa yerel kayıt kalır
       ve senkron kuyruğu daha sonra tekrar dener.
       (Eskiden bulut yanıtı bekleniyordu → çevrimdışıyken ekran donuyordu.) */
    kayit.id = "i" + Date.now();
    if (!state.iadeler) state.iadeler = [];
    state.iadeler.unshift(kayit);
    try { localStorage.setItem("nurdis_iadeler", JSON.stringify(state.iadeler)); } catch (e) {}

    state.iadeBusy = false;
    state.screen = "account";
    state.hesapSekme = "iadelerim";
    if (typeof showNotif === "function") showNotif("✅ Talep alındı", "İade talebiniz bize ulaştı.");
    render();

    /* Arka planda buluta gönder */
    if (window.fb && state.fbReady && window.fb.addIade) {
      window.fb.addIade(kayit).then((ref) => {
        if (ref && ref.id) {
          kayit.bulutId = ref.id;
          try { localStorage.setItem("nurdis_iadeler", JSON.stringify(state.iadeler)); } catch (e) {}
        }
      }).catch(() => {
        /* Başarısız → senkron kuyruğuna ekle */
        try {
          if (typeof bulutaYaz === "function") bulutaYaz("returns", kayit);
        } catch (e) {}
      });
    }
    return true;
  }

  /* ---- YORUM ---- */
  if (action === "yorum-yaz") {
    state.yorumUrunId = el.dataset.id;
    state.yorumPuan = 0;
    state.yorumMetin = "";
    state.yorumHata = "";
    state.screen = "yorum-yaz";
    render();
    window.scrollTo(0, 0);
    return true;
  }

  if (action === "yorum-puan") { state.yorumPuan = parseInt(el.dataset.id); render(); return true; }
  if (action === "yorum-iptal") { state.screen = "magaza-urun"; render(); return true; }

  if (action === "yorum-gonder") {
    const metin = (document.getElementById("yorum-metin")?.value || "").trim();
    if (!state.yorumPuan) { state.yorumHata = "Lütfen yıldız seçin."; render(); return true; }
    if (metin.length < 5) { state.yorumHata = "Lütfen birkaç kelime yazın."; render(); return true; }
    if (!state.user || !state.user.uid) { state.yorumHata = "Giriş yapmanız gerekir."; render(); return true; }

    state.yorumBusy = true; state.yorumHata = ""; render();

    const kayit = {
      urunId: state.yorumUrunId,
      puan: state.yorumPuan,
      metin: metin.slice(0, 700),
      ad: ((state.userProfile || {}).firstName || state.user.name || "Müşteri"),
      dogrulanmis: urunSatinAlindi(state.yorumUrunId),
      zaman: new Date().toISOString(),
      uid: state.user.uid,
      onay: true
    };

    /* OFFLINE-FIRST: yorum önce cihaza yazılır, anında görünür */
    kayit.id = "y" + Date.now();
    if (!state.urunYorumlar) state.urunYorumlar = [];
    state.urunYorumlar.unshift(kayit);
    try { localStorage.setItem("nurdis_urun_yorumlar", JSON.stringify(state.urunYorumlar)); } catch (e) {}

    state.yorumBusy = false;
    state.screen = "magaza-urun";
    if (typeof showNotif === "function") showNotif("⭐ Teşekkürler!", "Değerlendirmeniz yayınlandı.");
    render();

    if (window.fb && state.fbReady && window.fb.addUrunYorum) {
      window.fb.addUrunYorum(kayit).then((ref) => {
        if (ref && ref.id) {
          kayit.bulutId = ref.id;
          try { localStorage.setItem("nurdis_urun_yorumlar", JSON.stringify(state.urunYorumlar)); } catch (e) {}
        }
      }).catch(() => {
        try { if (typeof bulutaYaz === "function") bulutaYaz("product_reviews", kayit); } catch (e) {}
      });
    }
    return true;
  }

  /* ---- HARİTA (adres formunda) ---- */
  if (action === "adres-konum-al") {
    if (typeof konumAl !== "function") return true;
    const btn = el;
    btn.disabled = true;
    btn.textContent = "📍 Konum alınıyor…";
    konumAl().then((k) => {
      state.adresKonum = { lat: k.lat.toFixed(6), lon: k.lon.toFixed(6) };
      render();
      if (typeof showNotif === "function") showNotif("📍 Konum alındı", "Haritada kontrol edin.");
    }).catch((e) => {
      alert("Konum alınamadı.\n\n" + e.message + "\n\nKonumu elle de girebilirsiniz.");
      btn.disabled = false;
      btn.textContent = "📍 Konumumu Kullan";
    });
    return true;
  }

  if (action === "adres-konum-temizle") {
    state.adresKonum = null;
    render();
    return true;
  }

  if (action === "harita-ac") {
    const link = el.dataset.link || "";
    if (link) window.open(link, "_blank", "noopener");
    return true;
  }

  return false;
}
