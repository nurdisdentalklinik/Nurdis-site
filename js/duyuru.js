/* =====================================================================
   📢 DUYURULAR — Trendyol / Hepsiburada tarzı duyuru sistemi
   =====================================================================
   NEDEN YENİDEN YAZILDI
   ---------------------
   Eski hâli: ana sayfada 3 tane düz kart, hepsi aynı görünümde, hepsinin
   başında aynı "📢" ikonu. Yönetici tarafında sadece "ekle" ve "sil" vardı;
   düzenleme, kategori, sabitleme, tarih aralığı, önizleme YOKTU.

   YENİ YAPI (popüler e-ticaret sitelerinin duyuru mantığı)
   --------------------------------------------------------
   KULLANICI TARAFI
     • Kategori renkleri: Kampanya (turuncu), Bilgilendirme (mavi),
       Acil (kırmızı), Yeni (yeşil) — kartın solunda renkli şerit + etiket
     • Sabitlenen duyuru en üstte "📌 SABİT" rozetiyle
     • Büyük görselli "öne çıkan" duyuru (banner) + küçük kartlar
     • Okundu/okunmadı takibi (cihazda) → "YENİ" rozeti
     • Tarih aralığı: başlangıç/bitiş dışındaysa gösterilmez
     • "Tümünü gör" → tüm duyurular listesi
     • Karta dokun → tam ekran detay (görsel + video + metin)

   YÖNETİCİ TARAFI
     • Ekleme formu: başlık, metin, kategori, görsel, video, sabitle,
       başlangıç/bitiş tarihi, aktif/pasif
     • Listede DÜZENLE (kalem) + SİL + ÖNİZLE
     • Canlı önizleme (kullanıcının göreceği kart birebir)
     • Aktif/pasif anahtarı tek dokunuşla

   VERİ MODELİ (geriye dönük uyumlu — eski duyurular bozulmaz)
     { id, title, text, imageUrl, videoUrl, createdAt,
       kategori, sabit, aktif, baslangic, bitis }
   ===================================================================== */

/* ---------------------------------------------------------------------
   KATEGORİLER
   --------------------------------------------------------------------- */
const DUYURU_KATEGORI = {
  kampanya: { ad: "Kampanya",       ikon: "🔥", renk: "#E65100", arka: "#FFF3E0", kenar: "#FFB74D" },
  bilgi:    { ad: "Bilgilendirme",  ikon: "ℹ️", renk: "#0D47A1", arka: "#E3F2FD", kenar: "#90CAF9" },
  acil:     { ad: "Acil",           ikon: "⚠️", renk: "#B71C1C", arka: "#FFEBEE", kenar: "#EF9A9A" },
  yeni:     { ad: "Yeni",           ikon: "✨", renk: "#1B5E20", arka: "#E8F5E9", kenar: "#A5D6A7" }
};

function duyuruKat(k) {
  return DUYURU_KATEGORI[k] || DUYURU_KATEGORI.bilgi;
}

/* ---------------------------------------------------------------------
   OKUNDU TAKİBİ (cihazda)
   --------------------------------------------------------------------- */
function duyuruOkunanlar() {
  try { return JSON.parse(localStorage.getItem("nurdis_okunan_duyurular") || "[]"); }
  catch (e) { return []; }
}

function duyuruOkunduIsaretle(id) {
  try {
    const l = duyuruOkunanlar();
    if (l.indexOf(id) === -1) {
      l.unshift(id);
      localStorage.setItem("nurdis_okunan_duyurular", JSON.stringify(l.slice(0, 200)));
    }
  } catch (e) {}
}

/* ---------------------------------------------------------------------
   YAYINDA OLAN DUYURULAR (tarih + aktif filtresi + sıralama)
   --------------------------------------------------------------------- */
function yayindakiDuyurular() {
  const simdi = Date.now();
  const liste = (state.announcements || []).filter((a) => {
    if (!a) return false;
    if (a.aktif === false) return false;
    if (a.baslangic) {
      const b = new Date(a.baslangic).getTime();
      if (!isNaN(b) && b > simdi) return false;          /* henüz başlamadı */
    }
    if (a.bitis) {
      const bit = new Date(a.bitis).getTime();
      if (!isNaN(bit) && bit < simdi) return false;      /* süresi doldu */
    }
    return true;
  });

  /* Sabitlenenler önce, sonra tarihe göre yeniden eskiye */
  return liste.sort((a, b) => {
    const sa = a.sabit ? 1 : 0, sb = b.sabit ? 1 : 0;
    if (sa !== sb) return sb - sa;
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });
}

/* ---------------------------------------------------------------------
   KULLANICI TARAFI — ANA SAYFA BÖLÜMÜ
   --------------------------------------------------------------------- */
function duyurularBolumuHTML() {
  const hepsi = yayindakiDuyurular();
  if (!hepsi.length) return "";

  const okunanlar = duyuruOkunanlar();
  const gosterHepsi = state.duyuruHepsi === true;
  const gosterilecek = gosterHepsi ? hepsi : hepsi.slice(0, 3);
  const okunmamisSayi = hepsi.filter((a) => okunanlar.indexOf(a.id) === -1).length;

  /* ---- Öne çıkan (ilk duyuru) büyük banner ---- */
  const one = hepsi[0];
  const oneKat = duyuruKat(one.kategori);
  const oneYeni = okunanlar.indexOf(one.id) === -1;

  const banner = `
    <button data-action="duyuru-ac" data-id="${escapeAttr(one.id)}"
      class="card mb3" style="padding:0;overflow:hidden;border:none;border-radius:16px;text-align:left;width:100%;
      background:${oneKat.arka};cursor:pointer;display:block;box-shadow:0 2px 10px rgba(0,0,0,.06);">
      ${one.imageUrl
        ? `<div style="position:relative;">
             <img src="${escapeAttr(one.imageUrl)}" alt="" style="width:100%;height:150px;object-fit:cover;display:block;" />
             <span style="position:absolute;top:10px;left:10px;background:${oneKat.renk};color:#fff;font-size:9px;font-weight:800;
               padding:4px 9px;border-radius:99px;letter-spacing:.04em;">${oneKat.ikon} ${oneKat.ad.toUpperCase()}</span>
             ${one.sabit ? `<span style="position:absolute;top:10px;right:10px;background:rgba(0,0,0,.55);color:#fff;font-size:9px;font-weight:800;padding:4px 8px;border-radius:99px;">📌 SABİT</span>` : ""}
           </div>`
        : `<div style="height:6px;background:${oneKat.renk};"></div>`}
      <div style="padding:13px 15px;">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px;">
          ${!one.imageUrl ? `<span style="background:${oneKat.renk};color:#fff;font-size:9px;font-weight:800;padding:3px 8px;border-radius:99px;">${oneKat.ikon} ${oneKat.ad.toUpperCase()}</span>` : ""}
          ${oneYeni ? `<span style="background:#D32F2F;color:#fff;font-size:8.5px;font-weight:800;padding:3px 7px;border-radius:99px;">YENİ</span>` : ""}
          <span style="font-size:10px;color:var(--muted);margin-left:auto;">${duyuruTarih(one.createdAt)}</span>
        </div>
        <p style="margin:0 0 4px;font-size:14.5px;font-weight:800;line-height:1.35;color:var(--ink);">${escapeHtml(one.title || "")}</p>
        <p style="margin:0;font-size:11.5px;line-height:1.55;color:var(--muted);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${escapeHtml(one.text || "")}</p>
        <p style="margin:7px 0 0;font-size:11px;font-weight:800;color:${oneKat.renk};">Devamını oku →</p>
      </div>
    </button>`;

  /* ---- Küçük kartlar (kalanlar) ---- */
  const kucukler = gosterilecek.slice(1).map((a) => {
    const k = duyuruKat(a.kategori);
    const yeni = okunanlar.indexOf(a.id) === -1;
    return `<button data-action="duyuru-ac" data-id="${escapeAttr(a.id)}"
      class="card mb2" style="padding:0;overflow:hidden;border:none;border-left:4px solid ${k.renk};border-radius:12px;
      text-align:left;width:100%;background:var(--surface);cursor:pointer;">
      <div style="display:flex;gap:10px;padding:11px 12px;align-items:center;">
        ${a.imageUrl
          ? `<img src="${escapeAttr(a.imageUrl)}" alt="" style="width:52px;height:52px;border-radius:9px;object-fit:cover;flex-shrink:0;" />`
          : `<div style="width:52px;height:52px;border-radius:9px;background:${k.arka};display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;">${k.ikon}</div>`}
        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;gap:5px;margin-bottom:2px;">
            <span style="font-size:8.5px;font-weight:800;color:${k.renk};background:${k.arka};padding:2px 6px;border-radius:99px;">${k.ad.toUpperCase()}</span>
            ${a.sabit ? `<span style="font-size:9px;">📌</span>` : ""}
            ${yeni ? `<span style="background:#D32F2F;color:#fff;font-size:7.5px;font-weight:800;padding:2px 5px;border-radius:99px;">YENİ</span>` : ""}
          </div>
          <p style="margin:0;font-size:12.5px;font-weight:700;line-height:1.35;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(a.title || "")}</p>
          <p style="margin:2px 0 0;font-size:10px;color:var(--muted);">${duyuruTarih(a.createdAt)}${a.videoUrl ? " · 🎥 video" : ""}</p>
        </div>
        <span style="color:var(--muted);font-size:15px;flex-shrink:0;">›</span>
      </div>
    </button>`;
  }).join("");

  const tumunuBtn = hepsi.length > 3
    ? `<button data-action="duyuru-hepsi" style="width:100%;background:none;border:1px dashed var(--line);border-radius:11px;
        padding:10px;font-family:inherit;font-size:11.5px;font-weight:700;color:var(--teal);cursor:pointer;margin-top:2px;">
        ${gosterHepsi ? "↑ Daha az göster" : `Tüm duyuruları gör (${hepsi.length})`}
      </button>` : "";

  return `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:9px;">
      <p class="section-label" style="margin:0;">📢 Duyurular</p>
      ${okunmamisSayi > 0 ? `<span style="background:#D32F2F;color:#fff;font-size:9px;font-weight:800;padding:2px 7px;border-radius:99px;">${okunmamisSayi} yeni</span>` : ""}
    </div>
    <div class="mb5">${banner}${kucukler}${tumunuBtn}</div>`;
}

function duyuruTarih(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  const fark = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (fark === 0) return "Bugün";
  if (fark === 1) return "Dün";
  if (fark < 7) return fark + " gün önce";
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
}

/* ---------------------------------------------------------------------
   KULLANICI TARAFI — DETAY EKRANI (tam ekran kart)
   --------------------------------------------------------------------- */
function duyuruDetayHTML() {
  const a = (state.announcements || []).find((x) => x.id === state.duyuruAcik);
  if (!a) {
    return `${topbar("Duyurular", "Klinik duyuruları", { back: "home" })}
      <div class="content"><div class="card p4"><p class="desc" style="margin:0;">Duyuru bulunamadı.</p></div></div>`;
  }
  const k = duyuruKat(a.kategori);
  const ytId = (typeof youtubeEmbedUrl === "function") ? youtubeEmbedUrl(a.videoUrl) : null;

  return `${topbar("Duyurular", k.ad, { back: "home" })}
    <div class="content">
      <div class="card mb3" style="padding:0;overflow:hidden;border-radius:16px;border:none;">
        ${a.imageUrl ? `<img src="${escapeAttr(a.imageUrl)}" alt="" style="width:100%;display:block;" />`
                     : `<div style="height:7px;background:${k.renk};"></div>`}
        <div style="padding:16px;">
          <div style="display:flex;align-items:center;gap:7px;margin-bottom:9px;flex-wrap:wrap;">
            <span style="background:${k.arka};color:${k.renk};font-size:9.5px;font-weight:800;padding:4px 9px;border-radius:99px;">${k.ikon} ${k.ad.toUpperCase()}</span>
            ${a.sabit ? `<span style="background:#455A64;color:#fff;font-size:9px;font-weight:800;padding:4px 8px;border-radius:99px;">📌 SABİT</span>` : ""}
            <span style="font-size:10.5px;color:var(--muted);margin-left:auto;">${duyuruTarih(a.createdAt)}</span>
          </div>
          <h2 style="margin:0 0 10px;font-size:18px;line-height:1.35;font-family:inherit;">${escapeHtml(a.title || "")}</h2>
          <p style="margin:0;font-size:13px;line-height:1.75;color:var(--ink);white-space:pre-wrap;">${escapeHtml(a.text || "")}</p>

          ${ytId ? `<div style="margin-top:14px;"><iframe src="${ytId}" style="width:100%;aspect-ratio:16/9;border:none;border-radius:12px;" allowfullscreen loading="lazy"></iframe></div>` : ""}
          ${a.videoUrl && !ytId ? `<a href="${escapeAttr(a.videoUrl)}" target="_blank" rel="noopener" class="btn-primary" style="display:block;text-align:center;text-decoration:none;margin-top:14px;padding:11px;font-size:13px;">🎥 Videoyu İzle</a>` : ""}
        </div>
      </div>

      <div class="card p4 mb3" style="background:var(--bg);border-color:var(--line);">
        <p class="desc" style="margin:0 0 9px;font-size:11px;line-height:1.6;">Sorunuz mu var? Kliniğimizle iletişime geçin.</p>
        <div style="display:flex;gap:8px;">
          <a href="https://wa.me/905051050302" target="_blank" rel="noopener"
             style="flex:1;text-align:center;padding:10px;border-radius:10px;background:#25D366;color:#fff;font-size:12px;font-weight:700;text-decoration:none;">💬 WhatsApp</a>
          <a href="tel:+905051050302"
             style="flex:1;text-align:center;padding:10px;border-radius:10px;background:var(--teal);color:#fff;font-size:12px;font-weight:700;text-decoration:none;">📞 Ara</a>
        </div>
      </div>

      <button class="btn-primary" style="width:100%;background:var(--surface);color:var(--ink);border:1px solid var(--line);font-size:12.5px;padding:11px;"
        data-action="goto" data-screen="home">← Duyurulara dön</button>
    </div>`;
}

/* ---------------------------------------------------------------------
   YÖNETİCİ TARAFI — FORM + LİSTE
   --------------------------------------------------------------------- */
function yoneticiDuyurularHTML() {
  const hepsi = (state.announcements || []).slice().sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );
  const duzenlenen = state.duyuruDuzenle ? hepsi.find((x) => x.id === state.duyuruDuzenle) : null;
  const f = duzenlenen || {};

  const kategoriSecenekleri = Object.keys(DUYURU_KATEGORI).map((id) => {
    const k = DUYURU_KATEGORI[id];
    const secili = (f.kategori || "bilgi") === id;
    return `<button data-action="duyuru-kategori" data-k="${id}"
      style="padding:7px 12px;border-radius:99px;font-family:inherit;font-size:11px;font-weight:800;cursor:pointer;
      border:1.5px solid ${secili ? k.renk : "var(--line)"};background:${secili ? k.arka : "var(--surface)"};
      color:${secili ? k.renk : "var(--muted)"};">${k.ikon} ${k.ad}</button>`;
  }).join(" ");

  const tablo = hepsi.length ? hepsi.map((a) => {
    const k = duyuruKat(a.kategori);
    const suresiGecti = a.bitis && new Date(a.bitis).getTime() < Date.now();
    const pasif = a.aktif === false;
    return `<div class="card p3 mb2" style="border-left:3px solid ${k.renk};${pasif ? "opacity:.6;" : ""}">
      <div style="display:flex;gap:9px;align-items:flex-start;">
        ${a.imageUrl
          ? `<img src="${escapeAttr(a.imageUrl)}" style="width:44px;height:44px;border-radius:8px;object-fit:cover;flex-shrink:0;" />`
          : `<div style="width:44px;height:44px;border-radius:8px;background:${k.arka};display:flex;align-items:center;justify-content:center;font-size:19px;flex-shrink:0;">${k.ikon}</div>`}
        <div style="flex:1;min-width:0;">
          <div style="display:flex;gap:4px;align-items:center;flex-wrap:wrap;margin-bottom:2px;">
            <span style="font-size:8px;font-weight:800;color:${k.renk};background:${k.arka};padding:2px 6px;border-radius:99px;">${k.ad.toUpperCase()}</span>
            ${a.sabit ? `<span style="font-size:8px;font-weight:800;background:#455A64;color:#fff;padding:2px 6px;border-radius:99px;">📌 SABİT</span>` : ""}
            ${pasif ? `<span style="font-size:8px;font-weight:800;background:#9E9E9E;color:#fff;padding:2px 6px;border-radius:99px;">PASİF</span>` : ""}
            ${suresiGecti ? `<span style="font-size:8px;font-weight:800;background:#B71C1C;color:#fff;padding:2px 6px;border-radius:99px;">SÜRESİ GEÇTİ</span>` : ""}
          </div>
          <p style="margin:0;font-size:12.5px;font-weight:700;line-height:1.35;">${escapeHtml(a.title || "")}</p>
          <p style="margin:2px 0 0;font-size:10px;color:var(--muted);">${duyuruTarih(a.createdAt)}${a.videoUrl ? " · 🎥" : ""}${a.bitis ? " · bitiş: " + new Date(a.bitis).toLocaleDateString("tr-TR") : ""}</p>
        </div>
      </div>
      <div style="display:flex;gap:5px;margin-top:8px;">
        <button data-action="duyuru-duzenle" data-id="${a.id}"
          style="flex:1;padding:6px;border-radius:7px;border:1px solid var(--line);background:var(--surface);font-size:10px;font-weight:700;cursor:pointer;color:var(--ink);">✏️ Düzenle</button>
        <button data-action="duyuru-aktif" data-id="${a.id}"
          style="flex:1;padding:6px;border-radius:7px;border:1px solid ${pasif ? "#A5D6A7" : "#FFCC80"};background:${pasif ? "#E8F5E9" : "#FFF3E0"};font-size:10px;font-weight:700;cursor:pointer;color:${pasif ? "#1B5E20" : "#E65100"};">${pasif ? "▶ Yayınla" : "⏸ Yayından al"}</button>
        <button data-action="duyuru-onizle" data-id="${a.id}"
          style="padding:6px 10px;border-radius:7px;border:1px solid #90CAF9;background:#E3F2FD;font-size:10px;font-weight:700;cursor:pointer;color:#0D47A1;">👁</button>
        <button data-action="delete-announcement" data-id="${a.id}"
          style="padding:6px 10px;border-radius:7px;border:1px solid #EF9A9A;background:#FFEBEE;font-size:10px;font-weight:700;cursor:pointer;color:#B71C1C;">🗑</button>
      </div>
    </div>`;
  }).join("") : `<p class="footnote">Henüz duyuru yok. Yukarıdaki formdan ilk duyurunu oluştur.</p>`;

  return `
    <div class="card p3 mb3" style="background:#E3F2FD;border:1px solid #90CAF9;">
      <p style="margin:0 0 5px;font-size:11.5px;font-weight:800;color:#0D47A1;">📢 Duyuru Sistemi</p>
      <p style="margin:0;font-size:10px;color:#1565C0;line-height:1.65;">
        Yayınlanan duyuru <b>ana sayfada</b> kategori rengiyle, öne çıkan görseliyle ve "YENİ" rozetiyle görünür.
        Tarih aralığı verirsen duyuru o aralıkta otomatik yayınlanır, sonra kendiliğinden kalkar.
      </p>
    </div>

    <p class="section-label">${duzenlenen ? "✏️ Duyuruyu Düzenle" : "➕ Yeni Duyuru"}</p>
    <div class="card p4 mb4">
      <div class="field"><label>Başlık *</label>
        <input class="input" id="ann-title" value="${escapeAttr(f.title || "")}" placeholder="Örn: Bayramda çalışma saatlerimiz" /></div>

      <div class="field"><label>Metin *</label>
        <textarea id="ann-text" placeholder="Detaylı açıklama…" style="width:100%;min-height:90px;font-size:12px;padding:9px;border:1px solid var(--line);border-radius:8px;font-family:inherit;line-height:1.6;resize:vertical;">${escapeHtml(f.text || "")}</textarea></div>

      <div class="field"><label>Kategori</label>
        <div style="display:flex;gap:6px;flex-wrap:wrap;" id="ann-kategori-secim">${kategoriSecenekleri}</div></div>

      <div class="field"><label>Görsel (isteğe bağlı)</label>
        ${f.imageUrl ? `<img src="${escapeAttr(f.imageUrl)}" style="width:100%;max-height:120px;object-fit:cover;border-radius:9px;margin-bottom:7px;" />` : ""}
        <input type="file" id="ann-image" accept="image/*" style="font-size:11px;width:100%;" /></div>

      <div class="field"><label>Video linki (YouTube — isteğe bağlı)</label>
        <input class="input" id="ann-video" value="${escapeAttr(f.videoUrl || "")}" placeholder="https://youtube.com/watch?v=..." style="font-size:11.5px;" /></div>

      <div style="display:flex;gap:8px;">
        <div class="field" style="flex:1;"><label>Başlangıç</label>
          <input class="input" type="date" id="ann-baslangic" value="${f.baslangic ? String(f.baslangic).slice(0,10) : ""}" style="font-size:11px;" /></div>
        <div class="field" style="flex:1;"><label>Bitiş</label>
          <input class="input" type="date" id="ann-bitis" value="${f.bitis ? String(f.bitis).slice(0,10) : ""}" style="font-size:11px;" /></div>
      </div>

      <label style="display:flex;align-items:center;gap:8px;font-size:11.5px;margin:2px 0 8px;cursor:pointer;">
        <input type="checkbox" id="ann-sabit" ${f.sabit ? "checked" : ""} style="width:16px;height:16px;" />
        <span>📌 Ana sayfada en üste sabitle</span>
      </label>
      <label style="display:flex;align-items:center;gap:8px;font-size:11.5px;margin:0 0 12px;cursor:pointer;">
        <input type="checkbox" id="ann-aktif" ${f.aktif !== false ? "checked" : ""} style="width:16px;height:16px;" />
        <span>Yayında (kullanıcılar görsün)</span>
      </label>

      <div style="display:flex;gap:8px;">
        <button class="btn-primary" style="flex:1;font-size:12px;padding:11px;" data-action="add-announcement" data-id="${duzenlenen ? duzenlenen.id : ""}">
          ${duzenlenen ? "💾 Değişiklikleri Kaydet" : "📢 Duyuruyu Yayınla"}
        </button>
        ${duzenlenen ? `<button class="btn-primary" style="background:#757575;font-size:12px;padding:11px;" data-action="duyuru-duzenle-iptal">İptal</button>` : ""}
      </div>
    </div>

    <p class="section-label">Yayındaki ve Geçmiş Duyurular (${hepsi.length})</p>
    <div class="mb4">${tablo}</div>`;
}

/* ---------------------------------------------------------------------
   OLAYLAR
   --------------------------------------------------------------------- */
function duyuruAction(el, action) {
  if (action === "duyuru-ac") {
    const id = el.dataset.id;
    duyuruOkunduIsaretle(id);
    state.duyuruAcik = id;
    state.screen = "duyuru-detay";
    render();
    window.scrollTo(0, 0);
    return true;
  }

  if (action === "duyuru-hepsi") {
    state.duyuruHepsi = !state.duyuruHepsi;
    render();
    return true;
  }

  if (action === "duyuru-kategori") {
    state.duyuruFormKat = el.dataset.k;
    /* Formdaki seçili kategoriyi görsel olarak güncelle (yeniden çiz) */
    render();
    return true;
  }

  if (action === "duyuru-duzenle") {
    state.duyuruDuzenle = el.dataset.id;
    state.adminTab = "announcements";
    render();
    window.scrollTo(0, 0);
    return true;
  }

  if (action === "duyuru-duzenle-iptal") {
    state.duyuruDuzenle = null;
    render();
    return true;
  }

  if (action === "duyuru-onizle") {
    const a = (state.announcements || []).find((x) => x.id === el.dataset.id);
    if (!a) return true;
    state.duyuruAcik = a.id;
    state.screen = "duyuru-detay";
    render();
    window.scrollTo(0, 0);
    return true;
  }

  if (action === "duyuru-aktif") {
    const a = (state.announcements || []).find((x) => x.id === el.dataset.id);
    if (!a) return true;
    a.aktif = a.aktif === false;
    if (window.fb && window.fb.updateAnnouncement) {
      window.fb.updateAnnouncement(a.id, { aktif: a.aktif }).catch(() => {});
    }
    render();
    return true;
  }

  return false;
}
