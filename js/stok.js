/* =========================================================
   NUR DİŞ — STOK — malzeme takibi, amortisman, cari hesap
   app.js'ten bölündü · index.html yükleme sırası önemli
========================================================= */

/* =========================================================
   NUR DİŞ — STOK VE MALZEME TAKİBİ v5
   • Gider kaydından otomatik stoğa aktarma
   • Giriş / çıkış / sayım hareketleri
   • Kritik seviye uyarısı, stok değeri, tedarikçi takibi
========================================================= */

const STOK_BIRIMLER = ["Adet", "Kutu", "Paket", "Şişe", "Tüp", "Kg", "Litre", "Metre", "Rulo", "Takım"];

const STOK_KATEGORI = [
  "Sarf Malzeme", "Anestezi / İlaç", "Ölçü Malzemesi", "Kanal Tedavisi",
  "İmplant Malzemesi", "Protez / Kaide", "Beyazlatma", "Dezenfeksiyon",
  "Eldiven / Maske", "Röntgen Filmi", "Kırtasiye", "Temizlik", "Diğer"
];

/* ---------------- YARDIMCILAR ---------------- */

function stokBul(id) {
  return (state.stok || []).find(x => x.id === id);
}

function stokDeger(x) {
  return accNum(x.miktar) * accNum(x.birimFiyat);
}

function stokToplamDeger() {
  return (state.stok || []).reduce((s, x) => s + stokDeger(x), 0);
}

/* Kritik seviyede veya altında olanlar */
function stokKritikler() {
  return (state.stok || []).filter(x => accNum(x.miktar) <= accNum(x.minSeviye) && accNum(x.minSeviye) > 0);
}

/* Son hareket tarihi */
function stokSonHareket(stokId) {
  const h = (state.stokHareket || []).filter(x => x.stokId === stokId)
    .sort((a, b) => new Date(b.tarih) - new Date(a.tarih));
  return h[0] || null;
}

/* Hareket ekle (giriş +, çıkış −) */
function stokHareketEkle(stokId, tip, miktar, aciklama, birimFiyat, ekstra) {
  if (!state.stokHareket) state.stokHareket = [];
  const s = stokBul(stokId);
  if (!s) return null;

  const m = accNum(miktar);
  if (m <= 0) return null;

  if (tip === "giris") {
    s.miktar = accNum(s.miktar) + m;
    // Ağırlıklı ortalama maliyet
    if (accNum(birimFiyat) > 0) {
      const eskiDeger = accNum(s.miktar) - m > 0 ? (accNum(s.miktar) - m) * accNum(s.birimFiyat) : 0;
      s.birimFiyat = (eskiDeger + m * accNum(birimFiyat)) / accNum(s.miktar);
    }
    s.sonAlim = accToday();
  } else if (tip === "cikis") {
    s.miktar = Math.max(0, accNum(s.miktar) - m);
    s.sonKullanim = accToday();
  } else if (tip === "sayim") {
    s.miktar = m;
  }

  const hareket = {
    id: "sth_" + Date.now() + "_" + Math.random().toString(36).slice(2, 5),
    stokId, tip, miktar: m,
    birimFiyat: accNum(birimFiyat) || accNum(s.birimFiyat),
    tarih: accToday(),
    aciklama: aciklama || (tip === "giris" ? "Stok girişi" : tip === "cikis" ? "Stok kullanımı" : "Sayım düzeltmesi"),
    kalan: accNum(s.miktar),
    ...(ekstra || {})
  };
  state.stokHareket.unshift(hareket);
  return hareket;
}

/* Stok adından otomatik bul veya oluştur (gider→stok köprüsü için) */
function stokBulVeyaOlustur(ad, kategori, birim) {
  if (!state.stok) state.stok = [];
  const normalize = s => (s || "").toLowerCase().trim();
  let s = state.stok.find(x => normalize(x.ad) === normalize(ad));
  if (s) return s;

  s = {
    id: "stk_" + Date.now() + "_" + Math.random().toString(36).slice(2, 5),
    ad: ad,
    kategori: kategori || "Sarf Malzeme",
    birim: birim || "Adet",
    miktar: 0,
    minSeviye: 0,
    birimFiyat: 0,
    tedarikci: "",
    notlar: "",
    olusturma: accToday()
  };
  state.stok.push(s);
  return s;
}

function stokKaydet() {
  localStorage.setItem("nurdis_stok", JSON.stringify(state.stok || []));
  localStorage.setItem("nurdis_stok_hareket", JSON.stringify((state.stokHareket || []).slice(0, 800)));
  if (typeof saveAccountingToFirebase === "function") saveAccountingToFirebase();
}

/* =========================================================
   RENDER: STOK SEKMESİ
========================================================= */

/* =========================================================
   NUR DİŞ — ANALİZ PAKETİ v6
   1) Hasta Bazlı Kârlılık
   2) Nakit Akış Projeksiyonu
   3) Malzeme Maliyeti (tedavi başına)
========================================================= */

/* ---------------- ORTAK: TEDAVİLER ---------------- */

const TEDAVI_LISTESI = [
  "Muayene", "Dolgu", "Kanal Tedavisi", "İmplant", "Zirkonyum Kaplama",
  "Diş Beyazlatma", "Ortodonti", "Protez", "Diş Taşı Temizliği",
  "Diş Çekimi", "Köprü", "Lamine Veneer", "Şeffaf Plak", "Cerrahi Çekim"
];

function accTumFiyatlar() {
  const def = {
    "Muayene": 0, "Dolgu": 2000, "Kanal Tedavisi": 4000, "İmplant": 15000,
    "Zirkonyum Kaplama": 5000, "Diş Beyazlatma": 3000, "Ortodonti": 25000,
    "Protez": 12000, "Diş Taşı Temizliği": 1000, "Diş Çekimi": 1500,
    "Köprü": 8000, "Lamine Veneer": 6000, "Şeffaf Plak": 20000, "Cerrahi Çekim": 3000
  };
  return { ...def, ...(state.treatmentPrices || {}) };
}

/* =========================================================
   1) MALZEME MALİYETİ (tedavi başına)
   Tedavi → hangi malzemeden kaç birim kullanılıyor
========================================================= */

/* state.tedaviMalzeme = { "Dolgu": [{stokId, miktar}], ... } */

function tedaviMalzemeListesi(tedavi) {
  return (state.tedaviMalzeme || {})[tedavi] || [];
}

/* Tedavinin toplam malzeme maliyeti */
function tedaviMalzemeMaliyeti(tedavi) {
  return tedaviMalzemeListesi(tedavi).reduce((sum, k) => {
    const s = stokBul(k.stokId);
    if (!s) return sum;
    return sum + accNum(s.birimFiyat) * accNum(k.miktar);
  }, 0);
}

/* Tedavi kârlılığı: fiyat − malzeme maliyeti */
function tedaviKar(tedavi) {
  const fiyat = accNum(accTumFiyatlar()[tedavi]);
  const maliyet = tedaviMalzemeMaliyeti(tedavi);
  const kar = fiyat - maliyet;
  const marj = fiyat > 0 ? (kar / fiyat) * 100 : 0;
  return { tedavi, fiyat, maliyet, kar, marj };
}

/* =========================================================
   NUR DİŞ — İŞLETME ANALİZİ v7
   1) Randevu & Ciro Tahmini (doluluk, no-show, beklenen ciro)
   2) Personel Verimliliği (hekim başına ciro ve kârlılık)
   3) Kampanya Yönetimi (indirim etki analizi)
   4) Bayat Stok (hareketsiz malzeme, bağlı sermaye)
========================================================= */

/* =========================================================
   1) RANDEVU & CİRO TAHMİNİ
========================================================= */

/* Günlük kapasite (TIME_SLOTS uzunluğu) — ayarlanabilir */
function randevuKapasite() {
  return accNum((state.randevuAyar || {}).gunlukKapasite) || TIME_SLOTS.length; // 96 (24 saat × 4)
}

/* Bir tarihin kapalı olup olmadığı (Pazar kapalı varsayımı) */
function randevuKapali(d) {
  const ayar = state.randevuAyar || {};
  const pazarKapali = ayar.pazarKapali !== false;
  return pazarKapali && new Date(d).getDay() === 0;
}

/* Dönem içindeki çalışma günü sayısı */
function calismaGunuSayisi(baslangic, bitis) {
  let n = 0;
  const d = new Date(baslangic);
  const b = new Date(bitis);
  while (d <= b) {
    if (!randevuKapali(d)) n++;
    d.setDate(d.getDate() + 1);
  }
  return n;
}

/* Randevu analizi */
function randevuAnaliz(donemGun) {
  const gun = donemGun || 30;
  const bugun = new Date();
  bugun.setHours(0, 0, 0, 0);
  const gecmisBas = new Date(bugun.getTime() - gun * 86400000);
  const gelecekSon = new Date(bugun.getTime() + gun * 86400000);

  const randevular = (state.appointments || []).filter(a => a && a.date);
  const gecmis = randevular.filter(a => { const d = new Date(a.date); return d >= gecmisBas && d < bugun; });
  const gelecek = randevular.filter(a => { const d = new Date(a.date); return d >= bugun && d <= gelecekSon; });

  const kapasite = randevuKapasite();
  const gecmisGun = calismaGunuSayisi(gecmisBas, new Date(bugun.getTime() - 86400000));
  const gelecekGun = calismaGunuSayisi(bugun, gelecekSon);
  const gecmisKapasite = Math.max(1, gecmisGun * kapasite);
  const gelecekKapasite = Math.max(1, gelecekGun * kapasite);

  /* Gerçekleşen: randevu tarihinde aynı isimle tedavi kaydı var mı? */
  const norm = s => (s || "").toLowerCase().replace(/[^a-zğüşıöç0-9]/g, "");
  const inc = state.accounting.incomes || [];

  const gecmisDetay = gecmis.map(a => {
    const hastaAdi = norm((a.name || "").split(" ")[0]);
    const eslesme = inc.find(x => {
      const d = new Date(x.date);
      const aD = new Date(a.date);
      const gunFark = Math.abs((d - aD) / 86400000);
      if (gunFark > 7) return false;
      const desc = norm((x.firm || "") + " " + (x.description || ""));
      return hastaAdi.length > 2 && desc.includes(hastaAdi);
    });
    return { ...a, geldi: !!eslesme, ciro: eslesme ? accNum(eslesme.grossAmount || eslesme.amount) : 0 };
  });

  const gelenSayisi = gecmisDetay.filter(x => x.geldi).length;
  const noShowOrani = gecmis.length ? ((gecmis.length - gelenSayisi) / gecmis.length) * 100 : 0;
  const doluluk = Math.min(100, (gecmis.length / gecmisKapasite) * 100);
  const gelecekDoluluk = Math.min(100, (gelecek.length / gelecekKapasite) * 100);

  /* Ortalama işlem değeri */
  const son30 = inc.filter(x => new Date(x.date) >= gecmisBas);
  const ortIslemDeger = son30.length ? son30.reduce((s, x) => s + accNum(x.grossAmount || x.amount), 0) / son30.length : 0;
  const ortIslemSayisi = son30.length;

  /* Geçmiş cironun randevuya bölümü (gerçek dönüşüm) */
  const gecmisCiro = gecmisDetay.reduce((s, x) => s + x.ciro, 0);
  const eslesmeOrani = gecmis.length ? (gelenSayisi / gecmis.length) : 0;

  /* Randevu başına ciro — güvenilir hesap:
     Az sayıda eşleşme varsa istatistik yanıltıcı olur.
     Bu yüzden genel ortalama işlem değeriyle harmanlanır (Bayes benzeri). */
  const eslesmeSayisi = gecmisDetay.filter(x => x.geldi).length;
  const eslesmeOrt = eslesmeSayisi > 0 ? gecmisCiro / eslesmeSayisi : 0;
  const GUVEN_ESIK = 10;                       // 10 eşleşmeden az ise harmanla
  const guven = Math.min(1, eslesmeSayisi / GUVEN_ESIK);
  const randevuBasinaCiro = (guven * eslesmeOrt + (1 - guven) * ortIslemDeger) * eslesmeOrani;

  /* Beklenen ciro: gelecek randevu × randevu başına ortalama ciro */
  const beklenenCiro = gelecek.length * (randevuBasinaCiro || ortIslemDeger);
  /* Potansiyel: boş slotların gerçekçi kısmı dolarsa
     (her slotun dolması gerçekçi değil — mevcut doluluk + %25 iyileşme hedefi) */
  const bosSlot = Math.max(0, gelecekKapasite - gelecek.length);
  const hedefDoluluk = Math.min(90, gelecekDoluluk + 25);          // %25 iyileşme hedefi
  const ekRandevu = Math.max(0, Math.round(gelecekKapasite * hedefDoluluk / 100) - gelecek.length);
  const potansiyelCiro = beklenenCiro + ekRandevu * (randevuBasinaCiro || ortIslemDeger);
  const teorikMaks = beklenenCiro + bosSlot * (randevuBasinaCiro || ortIslemDeger);

  /* En yoğun günler */
  const gunDagilim = {};
  gecmis.forEach(a => {
    const d = new Date(a.date).getDay();
    gunDagilim[d] = (gunDagilim[d] || 0) + 1;
  });
  const gunAdlari = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

  /* Saat dağılımı */
  const saatDagilim = {};
  gecmis.forEach(a => { saatDagilim[a.time] = (saatDagilim[a.time] || 0) + 1; });

  /* Haftalık projeksiyon (gelecek 8 hafta) */
  const haftalar = [];
  for (let w = 0; w < 8; w++) {
    const bas = new Date(bugun.getTime() + w * 7 * 86400000);
    const bit = new Date(bas.getTime() + 7 * 86400000);
    const haftaRandevu = gelecek.filter(a => { const d = new Date(a.date); return d >= bas && d < bit; });
    haftalar.push({
      etiket: bas.toLocaleDateString("tr-TR", { day: "numeric", month: "short" }),
      adet: haftaRandevu.length,
      ciro: haftaRandevu.length * (randevuBasinaCiro || ortIslemDeger)
    });
  }

  return {
    gecmis, gelecek, gecmisDetay, gelenSayisi, noShowOrani, doluluk, gelecekDoluluk,
    ortIslemDeger, gecmisCiro, randevuBasinaCiro, beklenenCiro, potansiyelCiro,
    bosSlot, gelecekKapasite, gecmisKapasite, gunDagilim, gunAdlari, saatDagilim, haftalar,
    kapasite, hedefDoluluk, ekRandevu, teorikMaks
  };
}
