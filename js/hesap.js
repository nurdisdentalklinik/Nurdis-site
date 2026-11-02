/* =====================================================================
   👤 HESABIM — Trendyol mantığında müşteri hesap merkezi
   ---------------------------------------------------------------------
   BÖLÜMLER
     🔐 Kayıt / Giriş ekranı (e-posta + şifre, Google, şifremi unuttum)
     📦 Siparişlerim  — durum, kargo takibi, takip no kopyala + kısayol
     📍 Adreslerim    — adres kartları, varsayılan adres, ekle/düzenle/sil
     🎟️ Kuponlarım    — indirim kuponları, kullan/kopyala
     ❤️ Favorilerim   — beğenilen ürünler
     ⚙️ Bilgilerim    — ad, telefon, doğum tarihi, şifre değiştir
   ===================================================================== */

/* ---------------------------------------------------------------------
   VERİ KATMANI
   --------------------------------------------------------------------- */

const HESAP_SEKME = [
  { id: "siparisler", ad: "Siparişlerim", ikon: "📦" },
  { id: "adresler",   ad: "Adreslerim",   ikon: "📍" },
  { id: "iadelerim",  ad: "İadelerim",    ikon: "↩️" },
  { id: "puanlar",    ad: "Puanlarım",    ikon: "💎" },
  { id: "kuponlar",   ad: "Kuponlarım",   ikon: "🎟️" },
  { id: "favoriler",  ad: "Favorilerim",  ikon: "❤️" },
  { id: "bilgiler",   ad: "Bilgilerim",   ikon: "⚙️" }
];

/* --- Adresler (kullanıcıya özel, cihazda + bulutta) --- */
function adresAnahtar() {
  const uid = (state.user && state.user.uid) || "misafir";
  return "nurdis_adresler_" + uid;
}

function adreslerim() {
  try { return JSON.parse(localStorage.getItem(adresAnahtar()) || "[]"); }
  catch (e) { return []; }
}

function adreslerimKaydet(liste) {
  try { localStorage.setItem(adresAnahtar(), JSON.stringify(liste)); } catch (e) {}
  // Buluta da yaz (profil içinde)
  try {
    if (window.fb && window.fb.saveUserProfile && state.user && state.user.uid) {
      const p = Object.assign({}, state.userProfile || {}, { adresler: liste });
      window.fb.saveUserProfile(state.user.uid, p).catch(() => {});
    }
  } catch (e) {}
}

function varsayilanAdres() {
  const l = adreslerim();
  return l.find(a => a.varsayilan) || l[0] || null;
}

/* --- Kuponlar (yönetici tanımlar, müşteri görür) --- */
function kuponlarim() {
  const hepsi = state.kuponlar || [];
  const kullanilan = state.kullanilanKuponlar || [];
  return hepsi.filter(k => k.aktif !== false).map(k => {
    const kod = (k.kod || "").toUpperCase();
    return Object.assign({}, k, { kod, kullanildi: kullanilan.indexOf(kod) !== -1 });
  });
}

function kuponGecerliMi(k, sepetTutar) {
  if (!k) return { ok: false, mesaj: "Kupon yok" };
  if (k.kullanildi) return { ok: false, mesaj: "Bu kuponu kullandınız" };
  if (k.sonTarih) {
    const son = new Date(k.sonTarih);
    if (!isNaN(son) && son < new Date()) return { ok: false, mesaj: "Süresi dolmuş" };
  }
  if (k.minTutar && sepetTutar < k.minTutar) {
    return { ok: false, mesaj: "En az " + accTL(k.minTutar) + " alışveriş gerekir" };
  }
  return { ok: true, mesaj: "Kullanılabilir" };
}

/* Kupon indirimi hesapla */
function kuponIndirimi(k, tutar) {
  if (!k) return 0;
  if (k.tip === "yuzde") return Math.round(tutar * accNum(k.deger) / 100);
  return Math.min(tutar, accNum(k.deger) || 0);
}

/* --- Siparişlerim (giriş yapmış müşterinin kendi siparişleri) --- */
function benimSiparislerim() {
  const uid = state.user && state.user.uid;
  if (!uid) return [];
  return (state.orders || [])
    .filter(o => o.uid === uid)
    .sort((a, b) => siparisZaman(b) - siparisZaman(a));
}

/* ---------------------------------------------------------------------
   🔐 KAYIT / GİRİŞ EKRANI
   --------------------------------------------------------------------- */

function renderHesapGiris() {
  const mod = state.hesapMod || "giris";     // "giris" | "kayit" | "sifre"
  const f = state.hesapForm || {};

  const sekme = (id, ad) => {
    const aktif = mod === id;
    return `<button data-action="hesap-mod" data-id="${id}"
      style="flex:1;padding:9px;border-radius:9px;font-size:12.5px;font-weight:800;cursor:pointer;border:none;
      background:${aktif ? "var(--teal)" : "transparent"};color:${aktif ? "#fff" : "var(--muted)"};">${ad}</button>`;
  };

  return `${topbar("Hesabım", "Siparişlerinizi takip etmek için giriş yapın.", { back: "home" })}
    <div class="content">

      <div class="card p4 mb3" style="background:linear-gradient(135deg,#0B6E86,#0E8FA8);color:#fff;border:none;text-align:center;">
        <p style="font-size:30px;margin:0 0 4px;">🛍️</p>
        <p style="font-size:14px;font-weight:800;margin:0 0 3px;">Nur Diş Mağaza</p>
        <p style="font-size:11px;opacity:.9;margin:0;">Siparişleriniz, adresleriniz ve kuponlarınız tek yerde.</p>
      </div>

      <div class="card p2 mb3" style="display:flex;gap:4px;padding:5px;">
        ${sekme("giris", "Giriş Yap")}${sekme("kayit", "Kayıt Ol")}
      </div>

      ${mod === "kayit" ? `
      <div class="card p4 mb3">
        <div class="field"><label>Ad Soyad *</label>
          <input class="input" id="hs-ad" value="${escapeAttr(f.ad || "")}" placeholder="Adınız Soyadınız" autocomplete="name" /></div>
        <div class="field"><label>E-posta *</label>
          <input class="input" id="hs-email" type="email" value="${escapeAttr(f.email || "")}" placeholder="ornek@eposta.com" autocomplete="email" inputmode="email" /></div>
        <div class="field"><label>Şifre *</label>
          <input class="input" id="hs-sifre" type="password" placeholder="En az 6 karakter" autocomplete="new-password" /></div>
        <div class="field"><label>Şifre (tekrar) *</label>
          <input class="input" id="hs-sifre2" type="password" placeholder="Şifreyi tekrar girin" autocomplete="new-password" /></div>

        <div style="display:flex;gap:8px;align-items:flex-start;margin:10px 0 14px;">
          <input type="checkbox" id="hs-onay" style="width:17px;height:17px;margin-top:2px;flex-shrink:0;" />
          <label for="hs-onay" style="font-size:11px;line-height:1.5;color:var(--muted);">
            <a href="#" data-action="goto" data-screen="kvkk" style="color:var(--teal);">KVKK aydınlatma metnini</a>
            ve <a href="#" data-action="goto" data-screen="kvkk" style="color:var(--teal);">gizlilik politikasını</a> okudum, onaylıyorum.
          </label>
        </div>

        ${state.hesapHata ? `<p class="status-err" style="margin-bottom:10px;">${escapeHtml(state.hesapHata)}</p>` : ""}
        <button class="btn-primary" style="width:100%;" data-action="hesap-kayit" ${state.hesapBusy ? "disabled" : ""}>
          ${state.hesapBusy ? "Kayıt yapılıyor…" : "Hesap Oluştur"}
        </button>
        <p class="footnote" style="margin:10px 0 0;text-align:center;">Hesabınız yoksa 10 saniyede oluşturabilirsiniz.</p>
      </div>` : mod === "sifre" ? `
      <div class="card p4 mb3">
        <p class="name" style="font-size:14px;margin:0 0 4px;">Şifremi unuttum</p>
        <p class="desc" style="margin:0 0 14px;font-size:11.5px;">E-posta adresinizi girin, sıfırlama bağlantısı gönderelim.</p>
        <div class="field"><label>E-posta</label>
          <input class="input" id="hs-email" type="email" value="${escapeAttr(f.email || "")}" placeholder="ornek@eposta.com" inputmode="email" /></div>
        ${state.hesapHata ? `<p class="status-err">${escapeHtml(state.hesapHata)}</p>` : ""}
        <button class="btn-primary" style="width:100%;" data-action="hesap-sifre-sifirla">Sıfırlama Bağlantısı Gönder</button>
        <button class="btn-primary" style="width:100%;margin-top:8px;background:var(--surface);color:var(--ink);border:1px solid var(--line);" data-action="hesap-mod" data-id="giris">Geri Dön</button>
      </div>` : `
      <div class="card p4 mb3">
        <div class="field"><label>E-posta</label>
          <input class="input" id="hs-email" type="email" value="${escapeAttr(f.email || "")}" placeholder="ornek@eposta.com" autocomplete="email" inputmode="email" /></div>
        <div class="field"><label>Şifre</label>
          <input class="input" id="hs-sifre" type="password" placeholder="Şifreniz" autocomplete="current-password" /></div>
        ${state.hesapHata ? `<p class="status-err" style="margin-bottom:10px;">${escapeHtml(state.hesapHata)}</p>` : ""}
        <button class="btn-primary" style="width:100%;" data-action="hesap-giris" ${state.hesapBusy ? "disabled" : ""}>
          ${state.hesapBusy ? "Giriş yapılıyor…" : "Giriş Yap"}
        </button>
        <button class="btn-primary" style="width:100%;margin-top:8px;background:var(--surface);color:var(--muted);border:1px solid var(--line);font-size:12px;" data-action="hesap-mod" data-id="sifre">Şifremi unuttum</button>
      </div>`}

      <div style="display:flex;align-items:center;gap:10px;margin:6px 0 14px;">
        <div style="flex:1;height:1px;background:var(--line);"></div>
        <span style="font-size:10.5px;color:var(--muted);font-weight:600;">veya</span>
        <div style="flex:1;height:1px;background:var(--line);"></div>
      </div>

      <button data-action="sign-in-google"
        style="width:100%;padding:13px;border-radius:12px;background:#fff;color:#3c4043;border:1px solid #dadce0;display:flex;align-items:center;justify-content:center;gap:10px;font-size:13.5px;font-weight:600;cursor:pointer;">
        <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
        Google ile devam et
      </button>

      <p class="footnote" style="margin-top:16px;text-align:center;line-height:1.6;">
        Hesabınız yoksa önce <b>Kayıt Ol</b> sekmesinden oluşturun.<br/>
        Sipariş vermek için hesap gereklidir.
      </p>
    </div>`;
}

/* ---------------------------------------------------------------------
   👤 HESAP MERKEZİ (giriş yapılmış)
   --------------------------------------------------------------------- */

function renderHesapMerkezi() {
  const sekme = state.hesapSekme || "siparisler";
  const u = state.user || {};
  const p = state.userProfile || {};
  const adSoyad = (p.firstName && p.lastName) ? (p.firstName + " " + p.lastName)
                 : (u.name || (u.email ? u.email.split("@")[0] : "Müşteri"));
  const siparisler = benimSiparislerim();
  const adr = adreslerim();
  const kup = kuponlarim();
  const favoriAdet = (state.products || []).filter(x => x.favori).length;

  const sekmeler = HESAP_SEKME.map(s => {
    const aktif = sekme === s.id;
    let sayi = 0;
    if (s.id === "siparisler") sayi = siparisler.length;
    if (s.id === "adresler") sayi = adr.length;
    if (s.id === "iadelerim") sayi = benimIadelerim().length;
    if (s.id === "puanlar") sayi = puanlarim().bakiye || 0;
    if (s.id === "kuponlar") sayi = kup.filter(k => !k.kullanildi).length;
    if (s.id === "favoriler") sayi = favoriAdet;
    return `<button data-action="hesap-sekme" data-id="${s.id}"
      style="white-space:nowrap;flex-shrink:0;padding:8px 13px;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;
      border:1px solid ${aktif ? "var(--teal)" : "var(--line)"};
      background:${aktif ? "var(--teal)" : "var(--surface)"};
      color:${aktif ? "#fff" : "var(--ink)"};">
      ${s.ikon} ${s.ad}${sayi ? ` (${sayi})` : ""}
    </button>`;
  }).join("");

  let govde = "";
  if (sekme === "siparisler") govde = hesapSiparislerHTML();
  else if (sekme === "adresler") govde = hesapAdreslerHTML();
  else if (sekme === "iadelerim") govde = hesapIadelerHTML();
  else if (sekme === "puanlar") govde = (typeof hesapPuanHTML === "function" ? hesapPuanHTML() : "");
  else if (sekme === "kuponlar") govde = hesapKuponlarHTML();
  else if (sekme === "favoriler") govde = hesapFavorilerHTML();
  else if (sekme === "bilgiler") govde = hesapBilgilerHTML();

  return `${topbar("Hesabım", "Siparişleriniz, adresleriniz ve kuponlarınız.", { back: "home" })}
    <div class="content">

      <!-- Profil kartı -->
      <div class="card p4 mb3" style="background:linear-gradient(135deg,#0B6E86,#0E8FA8);color:#fff;border:none;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,.22);display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;flex-shrink:0;">
            ${escapeHtml((adSoyad || "M").charAt(0).toUpperCase())}
          </div>
          <div style="flex:1;min-width:0;">
            <p style="font-size:14.5px;font-weight:800;margin:0;">${escapeHtml(adSoyad)}</p>
            <p style="font-size:11px;opacity:.9;margin:2px 0 0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(u.email || "")}</p>
          </div>
          <button data-action="hesap-cikis"
            style="background:rgba(255,255,255,.2);border:none;color:#fff;border-radius:8px;padding:6px 10px;font-size:10.5px;font-weight:700;cursor:pointer;">
            Çıkış
          </button>
        </div>
      </div>

      <div class="chip-row mb3" style="flex-wrap:nowrap;overflow-x:auto;gap:6px;padding-bottom:4px;">${sekmeler}</div>

      ${govde}
    </div>`;
}

/* -------------------- 📦 SİPARİŞLERİM -------------------- */
function hesapSiparislerHTML() {
  const liste = benimSiparislerim();

  if (!liste.length) {
    return `<div class="card p4" style="text-align:center;padding:30px 20px;">
      <p style="font-size:38px;margin:0 0 10px;">📦</p>
      <p class="name" style="font-size:14px;margin:0 0 4px;">Henüz siparişiniz yok</p>
      <p class="desc" style="margin:0 0 16px;font-size:11.5px;">Mağazamızdan ilk siparişinizi verebilirsiniz.</p>
      <button class="btn-primary" style="width:100%;" data-action="goto" data-screen="store">Mağazaya Git</button>
    </div>`;
  }

  return liste.map(o => {
    const d = siparisDurum(o.durum || "yeni");
    const link = (typeof kargoTakipLinki === "function") ? kargoTakipLinki(o) : "";
    const firma = (typeof kargoFirmaAdi === "function") ? kargoFirmaAdi(o.kargoFirma) : "";
    const acik = state.hesapSiparisAcik === o.id;

    return `<div class="card p4 mb2" style="padding:0;overflow:hidden;border-left:3px solid ${d.renk};">
      <button data-action="hesap-siparis-ac" data-id="${o.id}"
        style="width:100%;background:none;border:none;text-align:left;padding:12px 14px;cursor:pointer;">
        <div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start;">
          <div style="flex:1;min-width:0;">
            <span style="font-size:9.5px;font-weight:800;background:${d.arka};color:${d.renk};padding:2px 7px;border-radius:5px;">${d.ikon} ${d.ad.toUpperCase()}</span>
            <p class="name" style="font-size:12.5px;margin:6px 0 0;line-height:1.4;">${escapeHtml(siparisUrunleri(o))}</p>
            <p class="desc" style="margin:2px 0 0;font-size:10.5px;">#${String(o.id).slice(-6)} · ${siparisTarih(o)}</p>
          </div>
          <p style="font-size:14px;font-weight:800;margin:0;white-space:nowrap;">${accTL(o.total || 0)}</p>
        </div>
      </button>

      ${o.kargoNo ? `
      <div style="padding:0 14px 10px;">
        <div style="background:#E3F2FD;border-radius:9px;padding:9px 11px;">
          <p style="margin:0 0 6px;font-size:10.5px;color:#1565C0;font-weight:700;">🚚 ${escapeHtml(firma || "Kargo")} · ${escapeHtml(o.kargoNo)}</p>
          <div style="display:flex;gap:6px;">
            <button data-action="kargo-no-kopyala" data-no="${escapeAttr(o.kargoNo)}"
              style="flex:1;padding:7px;border-radius:7px;border:1px solid #90CAF9;background:#fff;color:#1565C0;font-size:10.5px;font-weight:700;cursor:pointer;">
              📋 Kodu Kopyala
            </button>
            ${link ? `<a href="${escapeAttr(link)}" target="_blank" rel="noopener"
              style="flex:1;padding:7px;border-radius:7px;background:#1565C0;color:#fff;font-size:10.5px;font-weight:700;text-decoration:none;text-align:center;">
              🔗 Takip Et</a>` : ""}
          </div>
        </div>
      </div>` : ""}

      ${acik ? `
      <div style="padding:0 14px 14px;border-top:1px solid var(--line);padding-top:12px;">
        <p style="font-size:10px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin:0 0 5px;">Ürünler</p>
        <div style="background:var(--bg);border-radius:9px;padding:9px 11px;margin-bottom:10px;">
          ${(o.items || []).map(i => `
            <div style="display:flex;justify-content:space-between;font-size:12px;padding:2px 0;">
              <span>${escapeHtml(i.name || i.ad || "Ürün")} × ${i.qty || i.adet || 1}</span>
              <span style="font-weight:700;">${accTL((i.price || 0) * (i.qty || i.adet || 1))}</span>
            </div>`).join("")}
          <div style="display:flex;justify-content:space-between;font-size:12.5px;font-weight:800;border-top:1px solid var(--line);margin-top:6px;padding-top:6px;">
            <span>Toplam</span><span>${accTL(o.total || 0)}</span>
          </div>
        </div>
        <p style="font-size:10px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin:0 0 4px;">Teslimat</p>
        <p class="desc" style="margin:0 0 12px;font-size:11.5px;line-height:1.5;">${escapeHtml(o.address || "—")}</p>
        <div style="display:flex;gap:6px;">
          <a href="https://wa.me/905051050302?text=${encodeURIComponent("Siparişim hakkında bilgi almak istiyorum: #" + String(o.id).slice(-6))}"
            target="_blank" rel="noopener"
            style="flex:1;text-align:center;padding:9px;border-radius:9px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font-size:11px;font-weight:700;text-decoration:none;">
            💬 Sor
          </a>
          ${(o.durum === "teslim" || o.durum === "kargoda") && !siparisIadesi(o.id) ? `
          <button data-action="iade-baslat" data-id="${o.id}"
            style="flex:1;padding:9px;border-radius:9px;border:1px solid #FFCC80;background:#FFF3E0;color:#E65100;font-size:11px;font-weight:700;cursor:pointer;">
            ↩️ İade / Değişim
          </button>` : ""}
        </div>
      </div>` : ""}
    </div>`;
  }).join("");
}

/* -------------------- 📍 ADRESLERİM -------------------- */
function hesapAdreslerHTML() {
  const liste = adreslerim();

  if (state.adresForm) {
    const a = state.adresForm === true ? {} : state.adresForm;
    return `<div class="card p4 mb3">
      <p class="name" style="font-size:14px;margin:0 0 12px;">${a.id ? "Adresi Düzenle" : "Yeni Adres"}</p>
      <div class="field"><label>Adres Başlığı</label>
        <input class="input" id="adr-baslik" value="${escapeAttr(a.baslik || "")}" placeholder="Ev, İş, Klinik…" /></div>
      <div class="field"><label>Alıcı Adı Soyadı *</label>
        <input class="input" id="adr-ad" value="${escapeAttr(a.ad || (state.userProfile || {}).firstName || "")}" placeholder="Ad Soyad" /></div>
      <div class="field"><label>Telefon *</label>
        <input class="input" id="adr-tel" type="tel" value="${escapeAttr(a.tel || "")}" placeholder="05xx xxx xx xx" inputmode="tel" /></div>
      <div class="field"><label>İl / İlçe</label>
        <input class="input" id="adr-il" value="${escapeAttr(a.il || "")}" placeholder="Mardin / Kızıltepe" /></div>
      <div class="field"><label>Açık Adres *</label>
        <textarea class="input" id="adr-acik" rows="3" placeholder="Mahalle, sokak, no, daire…">${escapeHtml(a.acik || "")}</textarea></div>
      <!-- 🗺️ Konum -->
      <p class="section-label" style="margin:4px 0 6px;">Konum (isteğe bağlı)</p>
      <p class="desc" style="margin:0 0 8px;font-size:10.5px;line-height:1.5;">
        Konum ekleyince kargo teslimatı kolaylaşır. Haritada doğru yeri işaretleyebilirsiniz.
      </p>
      ${state.adresKonum ? `
        <div style="border-radius:10px;overflow:hidden;border:1px solid var(--line);margin-bottom:8px;">
          <iframe src="${escapeAttr(haritaEmbed(state.adresKonum.lat, state.adresKonum.lon))}"
            width="100%" height="180" style="border:0;display:block;" loading="lazy" title="Adres konumu"></iframe>
        </div>
        <div style="display:flex;gap:6px;margin-bottom:14px;">
          <button data-action="harita-ac" data-link="${escapeAttr(haritaLink(state.adresKonum.lat, state.adresKonum.lon))}"
            style="flex:1;padding:8px;border-radius:8px;border:1px solid var(--line);background:var(--surface);font-size:10.5px;font-weight:700;cursor:pointer;color:var(--ink);">
            🗺️ Haritada Aç
          </button>
          <button data-action="adres-konum-temizle"
            style="padding:8px 12px;border-radius:8px;border:1px solid #EF9A9A;background:#FFEBEE;color:#C62828;font-size:10.5px;font-weight:700;cursor:pointer;">
            Kaldır
          </button>
        </div>` : `
        <button data-action="adres-konum-al"
          style="width:100%;padding:11px;border-radius:9px;border:1.5px dashed var(--line);background:var(--surface);font-size:11.5px;font-weight:700;cursor:pointer;color:var(--teal);margin-bottom:14px;">
          📍 Konumumu Kullan
        </button>`}

      <div style="display:flex;gap:8px;align-items:center;margin:6px 0 14px;">
        <input type="checkbox" id="adr-varsayilan" ${a.varsayilan ? "checked" : ""} style="width:17px;height:17px;" />
        <label for="adr-varsayilan" style="font-size:11.5px;color:var(--muted);">Varsayılan adresim olsun</label>
      </div>
      <button class="btn-primary" style="width:100%;" data-action="adres-kaydet" data-id="${escapeAttr(a.id || "")}">Kaydet</button>
      <button class="btn-primary" style="width:100%;margin-top:8px;background:var(--surface);color:var(--ink);border:1px solid var(--line);" data-action="adres-iptal">Vazgeç</button>
    </div>`;
  }

  const kartlar = liste.map(a => `
    <div class="card p4 mb2" style="border-left:3px solid ${a.varsayilan ? "var(--teal)" : "var(--line)"};">
      <div style="display:flex;justify-content:space-between;gap:8px;margin-bottom:6px;">
        <div style="min-width:0;">
          <p style="margin:0;font-size:12.5px;font-weight:800;">${escapeHtml(a.baslik || "Adres")}</p>
          ${a.varsayilan ? `<span style="font-size:9px;font-weight:800;background:#E0F3F7;color:#006064;padding:1px 6px;border-radius:4px;">VARSAYILAN</span>` : ""}
        </div>
      </div>
      <p class="desc" style="margin:0 0 3px;font-size:11.5px;">👤 ${escapeHtml(a.ad || "—")}</p>
      <p class="desc" style="margin:0 0 3px;font-size:11.5px;">📞 ${escapeHtml(a.tel || "—")}</p>
      <p class="desc" style="margin:0 0 6px;font-size:11.5px;line-height:1.5;">📍 ${escapeHtml(a.il || "")} ${escapeHtml(a.acik || "")}</p>
      ${a.lat && a.lon ? `<button data-action="harita-ac" data-link="${escapeAttr(haritaLink(a.lat, a.lon))}"
        style="background:none;border:none;color:var(--teal);font-size:10.5px;font-weight:700;cursor:pointer;padding:0;margin-bottom:8px;text-decoration:underline;">
        🗺️ Haritada gör</button>` : ""}
      <div style="display:flex;gap:6px;">
        ${!a.varsayilan ? `<button data-action="adres-varsayilan" data-id="${a.id}"
          style="flex:1;padding:7px;border-radius:8px;border:1px solid var(--line);background:var(--surface);font-size:10.5px;font-weight:700;cursor:pointer;color:var(--ink);">Varsayılan Yap</button>` : ""}
        <button data-action="adres-duzenle" data-id="${a.id}"
          style="flex:1;padding:7px;border-radius:8px;border:1px solid var(--line);background:var(--surface);font-size:10.5px;font-weight:700;cursor:pointer;color:var(--ink);">✏️ Düzenle</button>
        <button data-action="adres-sil" data-id="${a.id}"
          style="padding:7px 11px;border-radius:8px;border:1px solid #EF9A9A;background:#FFEBEE;color:#C62828;font-size:10.5px;font-weight:700;cursor:pointer;">🗑️</button>
      </div>
    </div>`).join("");

  return `${kartlar || `<div class="card p4" style="text-align:center;padding:26px 20px;">
      <p style="font-size:32px;margin:0 0 8px;">📍</p>
      <p class="desc" style="margin:0;font-size:11.5px;">Kayıtlı adresiniz yok. Sipariş verirken bu adresleri kullanabilirsiniz.</p>
    </div>`}
    <button class="btn-primary" style="width:100%;margin-top:10px;" data-action="adres-ekle">+ Yeni Adres Ekle</button>`;
}

/* -------------------- ↩️ İADELERİM -------------------- */
function hesapIadelerHTML() {
  const liste = benimIadelerim();

  if (!liste.length) {
    return `<div class="card p4" style="text-align:center;padding:28px 20px;">
      <p style="font-size:32px;margin:0 0 8px;">↩️</p>
      <p class="name" style="font-size:13.5px;margin:0 0 4px;">İade/değişim talebiniz yok</p>
      <p class="desc" style="margin:0;font-size:11.5px;line-height:1.5;">
        Teslim edilen veya kargodaki bir siparişiniz için
        <b>Siparişlerim</b> bölümünden talep oluşturabilirsiniz.
      </p>
    </div>`;
  }

  return liste.map(x => {
    const d = iadeDurum(x.durum);
    return `<div class="card p4 mb2" style="border-left:3px solid ${d.renk};">
      <div style="display:flex;justify-content:space-between;gap:8px;margin-bottom:6px;">
        <div style="min-width:0;">
          <span style="font-size:9.5px;font-weight:800;background:${d.arka};color:${d.renk};padding:2px 7px;border-radius:5px;">${d.ikon} ${d.ad.toUpperCase()}</span>
          <p class="name" style="font-size:12.5px;margin:6px 0 0;">${escapeHtml(x.siparisOzet || "Sipariş")}</p>
        </div>
        <p style="font-size:13px;font-weight:800;margin:0;white-space:nowrap;">${accTL(x.tutar || 0)}</p>
      </div>
      <p class="desc" style="margin:0 0 3px;font-size:11px;">
        ${x.tip === "degisim" ? "🔄 Değişim" : "↩️ İade"} · ${escapeHtml(x.nedenAd || "")}
      </p>
      ${x.not ? `<p class="desc" style="margin:0 0 3px;font-size:10.5px;line-height:1.45;">${escapeHtml(x.not)}</p>` : ""}
      ${x.yoneticiNot ? `
      <div style="background:#F5F5F5;border-radius:7px;padding:7px 9px;margin-top:6px;">
        <p style="margin:0;font-size:10px;font-weight:800;color:#666;">KLİNİK YANITI</p>
        <p class="desc" style="margin:2px 0 0;font-size:10.5px;line-height:1.45;">${escapeHtml(x.yoneticiNot)}</p>
      </div>` : ""}
      <p class="desc" style="margin:6px 0 0;font-size:9.5px;color:#AAA;">
        ${x.zaman ? new Date(x.zaman).toLocaleString("tr-TR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : ""}
      </p>
    </div>`;
  }).join("");
}

/* -------------------- 🎟️ KUPONLARIM -------------------- */
function hesapKuponlarHTML() {
  const liste = kuponlarim();

  if (!liste.length) {
    return `<div class="card p4" style="text-align:center;padding:26px 20px;">
      <p style="font-size:32px;margin:0 0 8px;">🎟️</p>
      <p class="desc" style="margin:0;font-size:11.5px;line-height:1.5;">
        Şu an kuponunuz yok. Kampanyalarımızı kaçırmamak için sosyal medyada bizi takip edin.
      </p>
    </div>`;
  }

  return liste.map(k => {
    const far = kkOlcu(k, cartTotalGuvvenli());
    return `<div class="card p4 mb2" style="border-left:3px solid ${far.ok ? "#2E7D32" : "#B0BEC5"};${k.kullanildi ? "opacity:.55;" : ""}">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;">
        <div style="min-width:0;">
          <p style="margin:0;font-size:15px;font-weight:800;letter-spacing:1px;color:${far.ok ? "#2E7D32" : "#78909C"};">${escapeHtml(k.kod)}</p>
          <p class="desc" style="margin:3px 0 0;font-size:11.5px;">
            ${k.tip === "yuzde" ? "%" + accNum(k.deger) + " indirim" : accTL(k.deger) + " indirim"}
            ${k.minTutar ? " · min " + accTL(k.minTutar) : ""}
          </p>
          ${k.sonTarih ? `<p class="desc" style="margin:2px 0 0;font-size:10px;">Son: ${escapeHtml(k.sonTarih)}</p>` : ""}
          <p class="desc" style="margin:3px 0 0;font-size:10px;color:${far.ok ? "#2E7D32" : "#C62828"};">${escapeHtml(far.mesaj)}</p>
        </div>
        <button data-action="kupon-kopyala" data-kod="${escapeAttr(k.kod)}"
          style="padding:9px 13px;border-radius:9px;border:1px solid var(--line);background:var(--surface);font-size:11px;font-weight:700;cursor:pointer;color:var(--ink);white-space:nowrap;">
          📋 Kopyala
        </button>
      </div>
    </div>`;
  }).join("");
}

/* Kupon uygunluk ölçüsü (sepet tutarına göre) */
function kkOlcu(k, tutar) {
  if (typeof kuponGecerliMi === "function") return kuponGecerliMi(k, tutar);
  return { ok: true, mesaj: "" };
}

function cartTotalGuvvenli() {
  try { return (typeof cartTotal === "function") ? cartTotal() : 0; } catch (e) { return 0; }
}

/* -------------------- ❤️ FAVORİLERİM -------------------- */
function hesapFavorilerHTML() {
  const liste = (state.products || []).filter(p => p.favori);

  if (!liste.length) {
    return `<div class="card p4" style="text-align:center;padding:26px 20px;">
      <p style="font-size:32px;margin:0 0 8px;">❤️</p>
      <p class="desc" style="margin:0 0 14px;font-size:11.5px;">Beğendiğiniz ürünleri kalp ile işaretleyin, burada saklanır.</p>
      <button class="btn-primary" style="width:100%;" data-action="goto" data-screen="store">Mağazaya Git</button>
    </div>`;
  }

  return liste.map(p => {
    const fiyat = (typeof urunFiyat === "function") ? urunFiyat(p) : (p.fiyat || 0);
    return `<div class="card p4 mb2" style="display:flex;gap:11px;align-items:center;padding:10px 12px;">
      ${p.gorsel ? `<img src="${escapeAttr(p.gorsel)}" style="width:54px;height:54px;border-radius:9px;object-fit:cover;flex-shrink:0;" alt="" />` : `<div style="width:54px;height:54px;border-radius:9px;background:var(--bg);flex-shrink:0;"></div>`}
      <div style="flex:1;min-width:0;">
        <p class="name" style="font-size:12.5px;margin:0;line-height:1.35;">${escapeHtml(p.ad || "")}</p>
        <p style="margin:3px 0 0;font-size:13px;font-weight:800;color:var(--teal);">${accTL(fiyat)}</p>
      </div>
      <button data-action="magaza-urun" data-id="${p.id}"
        style="padding:7px 11px;border-radius:8px;background:var(--teal);color:#fff;border:none;font-size:10.5px;font-weight:700;cursor:pointer;">İncele</button>
    </div>`;
  }).join("");
}

/* -------------------- ⚙️ BİLGİLERİM -------------------- */
function hesapBilgilerHTML() {
  const p = state.userProfile || {};
  const u = state.user || {};

  return `<div class="card p4 mb3">
    <p class="section-label" style="margin:0 0 12px;">Kişisel Bilgiler</p>
    <div class="field"><label>Ad</label>
      <input class="input" id="hb-ad" value="${escapeAttr(p.firstName || "")}" placeholder="Adınız" /></div>
    <div class="field"><label>Soyad</label>
      <input class="input" id="hb-soyad" value="${escapeAttr(p.lastName || "")}" placeholder="Soyadınız" /></div>
    <div class="field"><label>Telefon</label>
      <input class="input" id="hb-tel" type="tel" value="${escapeAttr(p.phone || "")}" placeholder="05xx xxx xx xx" inputmode="tel" /></div>
    <div class="field"><label>Doğum tarihi</label>
      <input class="input" id="hb-dogum" type="date" value="${escapeAttr(p.dogum || "")}" /></div>
    <div class="field"><label>E-posta</label>
      <input class="input" value="${escapeAttr(u.email || "")}" disabled style="background:var(--bg);color:var(--muted);" /></div>
    <button class="btn-primary" style="width:100%;" data-action="hesap-bilgi-kaydet">Bilgileri Kaydet</button>
  </div>

  <div class="card p4 mb3">
    <p class="section-label" style="margin:0 0 10px;">Güvenlik</p>
    <button class="btn-primary" style="width:100%;background:var(--surface);color:var(--ink);border:1px solid var(--line);font-size:12.5px;"
      data-action="hesap-sifre-degistir">🔑 Şifre Değiştir / Sıfırla</button>
  </div>

  <div class="card p4 mb3">
    <p class="section-label" style="margin:0 0 10px;">Diğer</p>
    <button class="btn-primary" style="width:100%;background:var(--surface);color:var(--ink);border:1px solid var(--line);font-size:12.5px;margin-bottom:8px;"
      data-action="goto" data-screen="kvkk">📄 KVKK & Gizlilik</button>
    <button class="btn-primary" style="width:100%;background:var(--surface);color:var(--ink);border:1px solid var(--line);font-size:12.5px;margin-bottom:8px;"
      data-action="goto" data-screen="kargo-takip">🚚 Kargo Takip</button>
    <button class="btn-primary" style="width:100%;background:#FFEBEE;color:#C62828;border:1px solid #EF9A9A;font-size:12.5px;"
      data-action="hesap-cikis">Çıkış Yap</button>
  </div>`;
}

/* ---------------------------------------------------------------------
   OLAYLAR
   --------------------------------------------------------------------- */

function hesapAction(el, action) {
  /* ---- Giriş / Kayıt ---- */
  if (action === "hesap-mod") {
    state.hesapMod = el.dataset.id;
    state.hesapHata = "";
    render();
    return true;
  }

  if (action === "hesap-kayit") {
    const ad = (document.getElementById("hs-ad")?.value || "").trim();
    const email = (document.getElementById("hs-email")?.value || "").trim();
    const s1 = (document.getElementById("hs-sifre")?.value || "");
    const s2 = (document.getElementById("hs-sifre2")?.value || "");
    const onay = document.getElementById("hs-onay")?.checked;

    if (!ad) { state.hesapHata = "Ad soyad girin."; render(); return true; }
    if (!email) { state.hesapHata = "E-posta girin."; render(); return true; }
    if (s1.length < 6) { state.hesapHata = "Şifre en az 6 karakter olmalı."; render(); return true; }
    if (s1 !== s2) { state.hesapHata = "Şifreler birbiriyle uyuşmuyor."; render(); return true; }
    if (!onay) { state.hesapHata = "Devam etmek için KVKK onayı gerekli."; render(); return true; }
    if (!window.fb || !window.fb.musteriKayit) { state.hesapHata = "Kayıt sistemi hazır değil, birkaç saniye sonra deneyin."; render(); return true; }

    state.hesapBusy = true; state.hesapHata = ""; render();
    window.fb.musteriKayit(ad, email, s1).then((res) => {
      state.hesapBusy = false;
      if (res.ok) {
        // Profili oluştur
        const parca = ad.split(" ");
        state.userProfile = Object.assign({}, state.userProfile || {}, {
          firstName: parca[0] || "", lastName: parca.slice(1).join(" ") || "",
          email: email.toLowerCase()
        });
        try { localStorage.setItem("nurdis_profile", JSON.stringify(state.userProfile)); } catch (e) {}
        try {
          if (window.fb.saveUserProfile && res.user && res.user.uid) {
            window.fb.saveUserProfile(res.user.uid, state.userProfile).catch(() => {});
          }
        } catch (e) {}
        state.user = { uid: res.user.uid, email: res.user.email, name: ad };
        state.hesapForm = {};
        state.hesapSekme = "siparisler";
        state.hesapHata = "";
        if (typeof showNotif === "function") showNotif("🎉 Hoş geldiniz!", "Hesabınız oluşturuldu.");
        if (typeof gvDenetim === "function") gvDenetim("musteri-kayit", email);
        render();
      } else {
        state.hesapHata = res.error || "Kayıt başarısız.";
        render();
      }
    }).catch(() => { state.hesapBusy = false; state.hesapHata = "Bağlantı hatası."; render(); });
    return true;
  }

  if (action === "hesap-giris") {
    const email = (document.getElementById("hs-email")?.value || "").trim();
    const sifre = (document.getElementById("hs-sifre")?.value || "");
    if (!email || !sifre) { state.hesapHata = "E-posta ve şifre girin."; render(); return true; }
    if (!window.fb || !window.fb.musteriGiris) { state.hesapHata = "Giriş sistemi hazır değil."; render(); return true; }

    state.hesapBusy = true; state.hesapHata = ""; render();
    window.fb.musteriGiris(email, sifre).then((res) => {
      state.hesapBusy = false;
      if (res.ok) {
        state.user = { uid: res.user.uid, email: res.user.email, name: res.user.displayName || "" };
        state.hesapForm = {}; state.hesapHata = "";
        state.hesapSekme = "siparisler";
        render();
      } else {
        state.hesapHata = res.error || "Giriş başarısız.";
        render();
      }
    }).catch(() => { state.hesapBusy = false; render(); });
    return true;
  }

  if (action === "hesap-sifre-sifirla") {
    const email = (document.getElementById("hs-email")?.value || "").trim();
    if (!email) { state.hesapHata = "E-posta girin."; render(); return true; }
    if (!window.fb || !window.fb.sifreSifirla) return true;
    window.fb.sifreSifirla(email).then((res) => {
      state.hesapHata = res.ok ? "" : (res.error || "");
      alert(res.ok ? "✅ Sıfırlama bağlantısı e-postanıza gönderildi.\n\nGelen kutunuzu (ve spam klasörünü) kontrol edin." : "Gönderilemedi.");
      if (res.ok) state.hesapMod = "giris";
      render();
    });
    return true;
  }

  /* ---- Hesap merkezi ---- */
  if (action === "hesap-sekme") {
    state.hesapSekme = el.dataset.id;
    state.adresForm = null;
    render();
    window.scrollTo(0, 0);
    return true;
  }

  if (action === "hesap-cikis") {
    if (!confirm("Çıkış yapmak istediğinize emin misiniz?")) return true;
    if (window.fb && window.fb.signOutUser) { try { window.fb.signOutUser(); } catch (e) {} }
    state.user = null; state.userProfile = null; state.hesapSekme = "siparisler";
    state.hesapMod = "giris";
    render();
    return true;
  }

  if (action === "hesap-siparis-ac") {
    state.hesapSiparisAcik = (state.hesapSiparisAcik === el.dataset.id) ? null : el.dataset.id;
    render();
    return true;
  }

  /* Takip numarasını panoya kopyala */
  if (action === "kargo-no-kopyala") {
    const no = el.dataset.no || "";
    const kopyala = () => {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(no).then(() => alert("📋 Takip kodu kopyalandı:\n\n" + no)).catch(yedek);
        } else yedek();
      } catch (e) { yedek(); }
    };
    const yedek = () => {
      const t = document.createElement("textarea");
      t.value = no; t.style.position = "fixed"; t.style.left = "-9999px";
      document.body.appendChild(t); t.select();
      try { document.execCommand("copy"); alert("📋 Takip kodu kopyalandı:\n\n" + no); }
      catch (e) { alert("Kopyalanamadı. Kod: " + no); }
      document.body.removeChild(t);
    };
    kopyala();
    return true;
  }

  if (action === "kupon-kopyala") {
    const kod = el.dataset.kod || "";
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(kod);
      else {
        const t = document.createElement("textarea"); t.value = kod;
        t.style.position = "fixed"; t.style.left = "-9999px";
        document.body.appendChild(t); t.select(); document.execCommand("copy"); document.body.removeChild(t);
      }
    } catch (e) {}
    alert("🎟️ Kupon kodu kopyalandı:\n\n" + kod + "\n\nSepette kullanabilirsiniz.");
    return true;
  }

  /* ---- Adresler ---- */
  if (action === "adres-ekle") { state.adresForm = true; state.adresKonum = null; render(); return true; }
  if (action === "adres-iptal") { state.adresForm = null; state.adresKonum = null; render(); return true; }
  if (action === "adres-duzenle") {
    const a = adreslerim().find(x => x.id === el.dataset.id);
    state.adresForm = a || true;
    state.adresKonum = (a && a.lat && a.lon) ? { lat: a.lat, lon: a.lon } : null;
    render();
    return true;
  }

  if (action === "adres-kaydet") {
    const id = el.dataset.id || "";
    const baslik = (document.getElementById("adr-baslik")?.value || "").trim() || "Adres";
    const ad = (document.getElementById("adr-ad")?.value || "").trim();
    const tel = (document.getElementById("adr-tel")?.value || "").trim();
    const il = (document.getElementById("adr-il")?.value || "").trim();
    const acik = (document.getElementById("adr-acik")?.value || "").trim();
    const varsayilan = !!document.getElementById("adr-varsayilan")?.checked;

    if (!ad) { alert("Alıcı adı gerekli."); return true; }
    if (!tel) { alert("Telefon gerekli."); return true; }
    if (!acik) { alert("Açık adres gerekli."); return true; }

    let liste = adreslerim();
    const kayit = { id: id || ("a" + Date.now()), baslik, ad, tel, il, acik, varsayilan,
      lat: state.adresKonum ? state.adresKonum.lat : null,
      lon: state.adresKonum ? state.adresKonum.lon : null };

    if (id) {
      liste = liste.map(x => x.id === id ? kayit : x);
    } else {
      liste.push(kayit);
    }
    // Tek varsayılan kuralı
    if (varsayilan) liste = liste.map(x => Object.assign({}, x, { varsayilan: x.id === kayit.id }));
    else if (!liste.some(x => x.varsayilan) && liste.length) liste[0].varsayilan = true;

    adreslerimKaydet(liste);
    state.adresForm = null;
    alert("✅ Adres kaydedildi.");
    render();
    return true;
  }

  if (action === "adres-varsayilan") {
    const liste = adreslerim().map(x => Object.assign({}, x, { varsayilan: x.id === el.dataset.id }));
    adreslerimKaydet(liste);
    render();
    return true;
  }

  if (action === "adres-sil") {
    if (!confirm("Bu adres silinsin mi?")) return true;
    let liste = adreslerim().filter(x => x.id !== el.dataset.id);
    if (liste.length && !liste.some(x => x.varsayilan)) liste[0].varsayilan = true;
    adreslerimKaydet(liste);
    render();
    return true;
  }

  /* ---- Bilgilerim ---- */
  if (action === "hesap-bilgi-kaydet") {
    const p = Object.assign({}, state.userProfile || {}, {
      firstName: (document.getElementById("hb-ad")?.value || "").trim(),
      lastName: (document.getElementById("hb-soyad")?.value || "").trim(),
      phone: (document.getElementById("hb-tel")?.value || "").trim(),
      dogum: (document.getElementById("hb-dogum")?.value || "").trim()
    });
    state.userProfile = p;
    try { localStorage.setItem("nurdis_profile", JSON.stringify(p)); } catch (e) {}
    if (window.fb && window.fb.saveUserProfile && state.user && state.user.uid) {
      window.fb.saveUserProfile(state.user.uid, p).catch(() => {});
    }
    alert("✅ Bilgileriniz kaydedildi.");
    render();
    return true;
  }

  if (action === "hesap-sifre-degistir") {
    const email = (state.user || {}).email || "";
    if (!email) { alert("E-posta bulunamadı."); return true; }
    if (!confirm("Şifre sıfırlama bağlantısı " + email + " adresine gönderilsin mi?")) return true;
    if (window.fb && window.fb.sifreSifirla) {
      window.fb.sifreSifirla(email).then((r) => {
        alert(r.ok ? "✅ Bağlantı gönderildi. E-postanızı kontrol edin." : "Gönderilemedi.");
      });
    }
    return true;
  }

  return false;
}


/* Giriş durumuna göre doğru ekranı seç */
function hesapEkrani() {
  if (state.user && state.user.uid) return renderHesapMerkezi();
  return renderHesapGiris();
}
