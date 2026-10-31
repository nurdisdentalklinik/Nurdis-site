/* =========================================================
   NUR DİŞ — OTOMASYON v15
   1) Gece hatırlatma kuralı (22:00-09:00 arası mesaj gönderilmez)
   2) Stok otomatik düşüm (tedavi → malzeme çıkışı)
   3) Google yorum yönlendirme (5⭐ → Google'a davet)
========================================================= */

/* =========================================================
   1) MESAJ GÖNDERİM SAATİ KURALI
   Gece hastayı rahatsız etmemek için 22:00-09:00 arası
   WhatsApp mesajı gönderilmez; kuyruğa alınır.
========================================================= */

const MESAJ_SAAT_BAS = 9;    // 09:00
const MESAJ_SAAT_SON = 22;   // 22:00

/* Şu an mesaj gönderilebilir mi? */
function mesajGonderilebilir() {
  const ayar = state.mesajSaatAyar || {};
  if (ayar.kapali === true) return true;   // kural kapatılmışsa her zaman
  const h = new Date().getHours();
  const bas = ayar.bas != null ? accNum(ayar.bas) : MESAJ_SAAT_BAS;
  const son = ayar.son != null ? accNum(ayar.son) : MESAJ_SAAT_SON;
  return h >= bas && h < son;
}

/* Gece ise ne zaman gönderileceğini söyle */
function sonrakiGonderimSaati() {
  const ayar = state.mesajSaatAyar || {};
  const bas = ayar.bas != null ? accNum(ayar.bas) : MESAJ_SAAT_BAS;
  const simdi = new Date();
  const h = simdi.getHours();
  if (h >= bas && h < (ayar.son != null ? accNum(ayar.son) : MESAJ_SAAT_SON)) return null;
  if (h < bas) return "bugün " + String(bas).padStart(2, "0") + ":00";
  return "yarın " + String(bas).padStart(2, "0") + ":00";
}

/* Kuyruğa mesaj ekle (gece ise) */
function mesajKuyrugunaEkle(tur, veri) {
  if (!state.mesajKuyrugu) state.mesajKuyrugu = [];
  state.mesajKuyrugu.push({
    id: "mq_" + Date.now() + "_" + Math.random().toString(36).slice(2, 5),
    tur,
    veri,
    olusturma: new Date().toISOString(),
    gonderildi: false
  });
  localStorage.setItem("nurdis_mesaj_kuyrugu", JSON.stringify(state.mesajKuyrugu));
}

/* Kuyruktaki mesajları göster */
function mesajKuyruguListesi() {
  return (state.mesajKuyrugu || []).filter(m => !m.gonderildi);
}

/* WhatsApp mesajı aç — gece ise onay sor */
function guvenliWhatsApp(tel, mesaj, baslik) {
  if (mesajGonderilebilir()) {
    window.open(waLink(tel, mesaj), "_blank");
    return { gonderildi: true };
  }

  const zaman = sonrakiGonderimSaati();
  const onay = confirm(
    "🌙 ŞU AN GECE SAATİ (" + new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }) + ")\n\n" +
    "Hastayı rahatsız etmemek için mesajlar " + 
    (state.mesajSaatAyar?.bas ?? MESAJ_SAAT_BAS) + ":00 – " + 
    (state.mesajSaatAyar?.son ?? MESAJ_SAAT_SON) + ":00 arası gönderilir.\n\n" +
    (baslik ? "Mesaj: " + baslik + "\n\n" : "") +
    "Şimdi yine de göndermek istiyor musunuz?\n\n" +
    "(Hayır derseniz kuyruğa alınır, " + zaman + " gönderilir)"
  );

  if (onay) {
    window.open(waLink(tel, mesaj), "_blank");
    return { gonderildi: true, geceZorla: true };
  }

  mesajKuyrugunaEkle(baslik || "Randevu mesajı", { tel, mesaj });
  alert("📥 Mesaj kuyruğa alındı.\n\n" + zaman + " gönderilecek.");
  return { gonderildi: false, kuyruk: true, zaman };
}

/* =========================================================
   2) STOK OTOMATİK DÜŞÜM
   Tedavi kaydedilince, o tedavinin malzeme reçetesi stoktan düşer
========================================================= */

/* Tedavi için malzeme düşümü yap */
function stokOtomatikDusum(tedaviAdi, islemId, miktarKatsayi) {
  const recete = (state.tedaviMalzeme || {})[tedaviAdi] || [];
  if (!recete.length) return { yapildi: false, neden: "reçete yok", detay: [] };

  const kat = miktarKatsayi || 1;
  const detay = [];
  let hata = false;

  recete.forEach(r => {
    const s = stokBul(r.stokId);
    if (!s) return;
    const dusecek = accNum(r.miktar) * kat;
    if (dusecek <= 0) return;

    if (accNum(s.miktar) < dusecek) {
      hata = true;
      detay.push({
        ad: s.ad, istenen: dusecek, mevcut: accNum(s.miktar),
        yetersiz: true, birim: s.birim
      });
      return;
    }

    stokHareketEkle(s.id, "cikis", dusecek, "Tedavi: " + tedaviAdi, s.birimFiyat, { islemId });
    detay.push({
      ad: s.ad, dusecek, kalan: accNum(s.miktar), birim: s.birim, yetersiz: false
    });
  });

  stokKaydet();
  return { yapildi: true, detay, hata };
}

/* Düşümü geri al (tedavi silinirse) */
function stokDusumGeriAl(islemId) {
  const hareketler = (state.stokHareket || []).filter(h => h.islemId === islemId && h.tip === "cikis");
  if (!hareketler.length) return false;
  hareketler.forEach(h => {
    const s = stokBul(h.stokId);
    if (s) {
      s.miktar = accNum(s.miktar) + accNum(h.miktar);
      h.tip = "iade";
      h.aciklama = "İade: " + (h.aciklama || "");
    }
  });
  stokKaydet();
  return true;
}

/* =========================================================
   3) GOOGLE YORUM YÖNLENDİRME
========================================================= */

const GOOGLE_YORUM_MSG =
`Sayın {ad}

Bizimle deneyiminizi paylaştığınız için çok teşekkür ederiz 🤍

Kliniğimizi başkalarına da önerebilmeniz için Google'da kısa bir değerlendirme bırakır mısınız? 30 saniyenizi alır, bize çok büyük destek olur.

{link}

Nur Diş & Dental Klinik`;

function googleYorumLinki() {
  const k = klinikKonumAyar();
  if (k.googleYorum) return k.googleYorum;
  // Google Maps arama linki (klinik adı + adres)
  return "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent((k.adres || "Mardin Kızıltepe TOKİ") + " diş kliniği");
}

function googleYorumMesaji(ad) {
  const ozel = (state.anketSablon || {}).google;
  let m = (ozel && ozel.trim()) ? ozel : GOOGLE_YORUM_MSG;
  return m.replace(/\{ad\}/g, ad || "hastamız").replace(/\{link\}/g, googleYorumLinki());
}

/* Google yorum istatistikleri */
function googleYorumIstatistik() {
  const l = state.anketler || [];
  const yuksek = l.filter(a => accNum(a.puan) >= 4);
  const davetEdilen = yuksek.filter(a => a.googleDavet);
  return {
    toplamYuksek: yuksek.length,
    davetEdilen: davetEdilen.length,
    oran: yuksek.length ? (davetEdilen.length / yuksek.length) * 100 : 0
  };
}

/* =========================================================
   RENDER: OTOMASYON SEKMESİ
========================================================= */

function renderAccOtomasyon() {
  const saatAyar = state.mesajSaatAyar || {};
  const kuyruk = mesajKuyruguListesi();
  const gy = googleYorumIstatistik();
  const gonderilebilir = mesajGonderilebilir();
  const zaman = sonrakiGonderimSaati();

  /* Reçetesi olan tedaviler */
  const receteli = Object.keys(state.tedaviMalzeme || {}).filter(k => (state.tedaviMalzeme[k] || []).length > 0);

  return `
    <!-- 1) MESAJ SAATİ -->
    <div class="card p4 mb3" style="background:linear-gradient(135deg,${gonderilebilir ? "#1B5E20,#2E7D32" : "#4A148C,#6A1B9A"});color:#fff;border:none;">
      <p style="font-size:13px;font-weight:700;margin:0 0 2px;">🌙 Mesaj Gönderim Saati</p>
      <p style="font-size:10.5px;opacity:.85;margin:0 0 10px;">
        ${gonderilebilir ? "Şu an mesaj gönderilebilir" : "Gece saatleri — mesajlar sabaha ertelenir"}
      </p>
      <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:10px;text-align:center;">
        <p style="font-size:9.5px;margin:0;opacity:.85;">GÖNDERİM ARALIĞI</p>
        <p style="font-size:18px;font-weight:800;margin:3px 0 0;">${saatAyar.bas ?? MESAJ_SAAT_BAS}:00 – ${saatAyar.son ?? MESAJ_SAAT_SON}:00</p>
      </div>
      ${!gonderilebilir ? `<p style="font-size:10px;margin:8px 0 0;opacity:.95;">⏰ Sonraki gönderim: <b>${zaman}</b></p>` : ""}
    </div>

    <div class="card p4 mb3">
      <p style="font-size:12px;font-weight:700;margin:0 0 10px;color:#4A148C;">⚙️ Saat Ayarları</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div class="field" style="margin-bottom:0;"><label style="font-size:10px;">Başlangıç</label>
          <input class="input" type="number" min="0" max="23" id="ms-bas" value="${saatAyar.bas ?? MESAJ_SAAT_BAS}" style="font-size:12px;padding:8px;" />
        </div>
        <div class="field" style="margin-bottom:0;"><label style="font-size:10px;">Bitiş</label>
          <input class="input" type="number" min="0" max="23" id="ms-son" value="${saatAyar.son ?? MESAJ_SAAT_SON}" style="font-size:12px;padding:8px;" />
        </div>
      </div>
      <label style="display:flex;align-items:center;gap:8px;font-size:11px;margin:10px 0;cursor:pointer;">
        <input type="checkbox" id="ms-kapali" ${saatAyar.kapali ? "checked" : ""} />
        <span>Kuralı kapat (her saatte gönder)</span>
      </label>
      <button class="btn-primary" style="background:#6A1B9A;font-size:11.5px;padding:10px;" data-action="otomasyon-saat-kaydet">💾 Kaydet</button>
      <p style="font-size:9.5px;color:#888;margin:7px 0 0;line-height:1.5;">
        Bu aralık dışında WhatsApp mesajı göndermeye çalışırsanız program sizi uyarır ve
        mesajı kuyruğa alır. Gece 03:00'te hasta rahatsız edilmez.
      </p>
    </div>

    ${kuyruk.length ? `<div class="card p4 mb3" style="background:#FFF3E0;border:1px solid #FFB74D;">
      <p style="font-size:12px;font-weight:700;color:#E65100;margin:0 0 8px;">📥 Mesaj Kuyruğu (${kuyruk.length})</p>
      ${kuyruk.slice(0, 8).map(m => `
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #FFE0B2;">
          <div style="flex:1;min-width:0;">
            <p style="font-size:11px;font-weight:600;margin:0;">${escapeHtml(m.tur)}</p>
            <p style="font-size:9px;color:#BF360C;margin:2px 0 0;">${new Date(m.olusturma).toLocaleString("tr-TR")}</p>
          </div>
          ${gonderilebilir ? `<button data-action="kuyruk-gonder" data-id="${m.id}" style="background:#25D366;border:none;border-radius:6px;padding:5px 9px;font-size:10px;color:#fff;font-weight:700;cursor:pointer;">Gönder</button>` : ""}
          <button data-action="kuyruk-sil" data-id="${m.id}" style="background:#FFEBEE;border:none;border-radius:6px;padding:5px 7px;font-size:10px;color:#C62828;cursor:pointer;">✕</button>
        </div>`).join("")}
      ${gonderilebilir ? `<button class="btn-primary" style="margin-top:8px;background:#2E7D32;font-size:11px;padding:10px;" data-action="kuyruk-hepsi">📤 Tümünü Gönder</button>` : ""}
    </div>` : ""}

    <!-- 2) STOK OTOMATİK -->
    <div class="card p4 mb3" style="background:linear-gradient(135deg,#004D40,#00695C);color:#fff;border:none;">
      <p style="font-size:13px;font-weight:700;margin:0 0 2px;">📦 Stok Otomatik Düşüm</p>
      <p style="font-size:10.5px;opacity:.85;margin:0 0 10px;">Tedavi yapılınca malzeme stoktan düşer</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:8px;text-align:center;">
          <p style="font-size:9px;margin:0;opacity:.85;">REÇETELİ TEDAVİ</p>
          <p style="font-size:16px;font-weight:800;margin:2px 0 0;">${receteli.length}</p>
        </div>
        <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:8px;text-align:center;">
          <p style="font-size:9px;margin:0;opacity:.85;">DURUM</p>
          <p style="font-size:11px;font-weight:800;margin:4px 0 0;">${state.stokOtoAktif !== false ? "AKTİF" : "KAPALI"}</p>
        </div>
      </div>
    </div>

    <div class="card p4 mb3">
      <p style="font-size:12px;font-weight:700;margin:0 0 8px;color:#00695C;">⚙️ Otomatik Düşüm Ayarları</p>
      <label style="display:flex;align-items:center;gap:8px;font-size:11px;margin-bottom:10px;cursor:pointer;">
        <input type="checkbox" id="stok-oto" ${state.stokOtoAktif !== false ? "checked" : ""} />
        <span>Tedavi kaydında malzemeyi otomatik düş</span>
      </label>

      ${receteli.length ? `
        <p style="font-size:10.5px;color:#666;margin:0 0 6px;font-weight:600;">Tanımlı reçeteler:</p>
        ${receteli.slice(0, 8).map(t => {
          const maliyet = tedaviMalzemeMaliyeti(t);
          const adet = (state.tedaviMalzeme[t] || []).length;
          return `<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--line);font-size:11px;">
            <span>${escapeHtml(t)}</span>
            <span style="color:#00695C;font-weight:700;">${adet} malzeme · ${accTL0(maliyet)}</span>
          </div>`;
        }).join("")}
      ` : `<p class="footnote">Henüz reçete tanımlanmadı. <b>Malzeme Maliyeti</b> sekmesinden tedaviye malzeme ekleyin.</p>`}

      <button class="btn-primary" style="margin-top:10px;background:#00695C;font-size:11.5px;padding:10px;" data-action="otomasyon-stok-kaydet">💾 Kaydet</button>
    </div>

    <!-- 3) GOOGLE YORUM -->
    <div class="card p4 mb3" style="background:linear-gradient(135deg,#0D47A1,#1565C0);color:#fff;border:none;">
      <p style="font-size:13px;font-weight:700;margin:0 0 2px;">⭐ Google Yorum Daveti</p>
      <p style="font-size:10.5px;opacity:.85;margin:0 0 10px;">4-5 yıldız veren hastaları Google'a yönlendir</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:8px;text-align:center;">
          <p style="font-size:9px;margin:0;opacity:.85;">DAVET EDİLEN</p>
          <p style="font-size:16px;font-weight:800;margin:2px 0 0;">${gy.davetEdilen}/${gy.toplamYuksek}</p>
        </div>
        <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:8px;text-align:center;">
          <p style="font-size:9px;margin:0;opacity:.85;">ORAN</p>
          <p style="font-size:16px;font-weight:800;margin:2px 0 0;">%${gy.oran.toFixed(0)}</p>
        </div>
      </div>
    </div>

    <div class="card p4 mb3">
      <p style="font-size:12px;font-weight:700;margin:0 0 8px;color:#1565C0;">🔗 Google Yorum Bağlantısı</p>
      <div class="field"><label style="font-size:10px;">Google Maps işletme bağlantısı</label>
        <input class="input" id="gy-link" value="${escapeAttr(klinikKonumAyar().googleYorum || "")}" placeholder="https://g.page/r/... veya Maps linki" style="font-size:11px;padding:8px;" />
      </div>
      <p style="font-size:9.5px;color:#888;margin:-6px 0 10px;line-height:1.5;">
        Google İşletme Profilinizden "Yorum bağlantısı" alıp buraya yapıştırın.
        Boş bırakırsanız klinik adıyla Maps araması yapılır.
      </p>
      <button class="btn-primary" style="background:#1565C0;font-size:11.5px;padding:10px;" data-action="google-link-kaydet">💾 Kaydet</button>
      <a href="${googleYorumLinki()}" target="_blank" rel="noopener" class="btn-primary" style="margin-top:6px;text-decoration:none;background:#fff;color:#1565C0;border:1px solid var(--line);font-size:11px;padding:10px;">🔍 Bağlantıyı Test Et</a>
    </div>

    <div class="card p4 mb3" style="background:#E3F2FD;border:1px solid #90CAF9;">
      <p style="font-size:11.5px;font-weight:700;color:#0D47A1;margin:0 0 6px;">💡 Neden 4-5 yıldız?</p>
      <p style="font-size:10.5px;color:#1565C0;margin:0;line-height:1.7;">
        Sadece <b>memnun hastaları</b> Google'a yönlendirmek etik ve etkili yöntemdir.
        1-3 yıldız veren hastaya <b>telafi mesajı</b> gider, Google'a değil.<br/><br/>
        5 yıldızlı bir Google yorumu, <b>10 yeni hasta</b> kazandırabilir.
      </p>
    </div>
  `;
}
