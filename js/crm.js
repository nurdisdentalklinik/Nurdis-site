/* =========================================================
   NUR DİŞ — CRM — hasta karlılık, nakit akış
   app.js'ten bölündü · index.html yükleme sırası önemli
========================================================= */

/* =========================================================
   NUR DİŞ — HASTA İLİŞKİLERİ ve PRİM v8
   1) Hasta Hatırlatma (kontrol zamanı, randevu, geri kazanım)
   2) Personel Prim / Bonus Hesabı
========================================================= */

/* =========================================================
   1) HASTA HATIRLATMA
========================================================= */

/* Hasta adından telefon bul (randevu kayıtlarından) */
function hastaTelefon(ad) {
  const norm = s => (s || "").toLowerCase().replace(/[^a-zğüşıöç0-9]/g, "");
  const hedef = norm(ad).split(" ")[0];
  if (!hedef || hedef.length < 3) return "";

  const aday = (state.appointments || [])
    .filter(a => a.phone && a.name)
    .filter(a => {
      const n = norm(a.name);
      return n.includes(hedef) || hedef.includes(n.split(" ")[0]);
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  return aday.length ? aday[0].phone : "";
}

/* WhatsApp bağlantısı */
function waLink(tel, mesaj) {
  const d = String(tel || "").replace(/\D/g, "");
  let num = d;
  if (d.length === 11 && d.startsWith("0")) num = "9" + d;
  else if (d.length === 10) num = "90" + d;
  return "https://wa.me/" + num + "?text=" + encodeURIComponent(mesaj);
}

/* Kontrol zamanı gelenler: son işlemden bu yana > 180 gün */
function hastaKontrolListesi(ayEsik) {
  const esik = ayEsik || 6;
  const hasta = accHastaListesi();
  const bugun = new Date();

  return hasta.map(h => {
    const gunFark = h.sonTarih ? Math.round((bugun - new Date(h.sonTarih)) / 86400000) : null;
    const ayFark = gunFark !== null ? gunFark / 30 : null;
    const gecti = ayFark !== null && ayFark >= esik;
    const tel = hastaTelefon(h.ad);
    // Yapılan son tedavi
    const sonIslem = h.islemler.slice().sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    return {
      ...h, gunFark, ayFark, kontrolGecti: gecti, tel,
      sonIslemAdi: sonIslem ? sonIslem.category || sonIslem.description : "",
      sonIslemTarihi: sonIslem ? sonIslem.date : null
    };
  }).filter(h => h.kontrolGecti)
    .sort((a, b) => b.gunFark - a.gunFark);
}

/* Uzun süredir gelmeyen (kayıp riski) */
function hastaKayipListesi(ayEsik) {
  const esik = ayEsik || 12;
  const hasta = accHastaListesi();
  const bugun = new Date();
  return hasta.map(h => {
    const gunFark = h.sonTarih ? Math.round((bugun - new Date(h.sonTarih)) / 86400000) : null;
    return { ...h, gunFark, tel: hastaTelefon(h.ad) };
  }).filter(h => h.gunFark !== null && h.gunFark >= esik * 30)
    .sort((a, b) => b.toplam - a.toplam);
}

/* Yaklaşan randevular (hatırlatma için) */
function yakinRandevular(gunAralik) {
  const aralik = gunAralik || 3;
  const bugun = new Date(); bugun.setHours(0, 0, 0, 0);
  const son = new Date(bugun.getTime() + aralik * 86400000);
  return (state.appointments || []).filter(a => {
    if (!a.date) return false;
    const d = new Date(a.date); d.setHours(0, 0, 0, 0);
    return d >= bugun && d <= son;
  }).sort((a, b) => new Date(a.date) - new Date(b.date));
}

/* ---------------- MESAJ ŞABLONLARI ---------------- */

const MESAJ_SABLON = {
  kontrol:
`İyi günler Sayın {ad}

Nur Diş & Dental Klinik'ten yazıyoruz. Son işleminiz ({islem}) üzerinden {ay} ay geçti.

Ücretsiz 6 aylık rutin kontrol için sizleri kliniğimize bekliyoruz.

Randevu için bize dönüş sağlayın.`,

  kayip:
`İyi günler Sayın {ad}

Nur Diş & Dental Klinik'ten yazıyoruz. Sizi {ay} aydır kliniğimizde göremedik.

Ağız ve diş sağlığınız için ücretsiz kontrole bekliyoruz.

Randevu için bize dönüş sağlayın.`,

  randevu:
`İyi günler Sayın {ad}

{gun} saat {saat} randevunuzu hatırlatmak isteriz.

Nur Diş & Dental Klinik
Randevu için bize dönüş sağlayın.`
};

/* Kullanıcı şablonu varsa onu, yoksa varsayılanı döndür */
function mesajSablonu(tip) {
  const ozel = (state.mesajSablon || {})[tip];
  return (ozel && ozel.trim()) ? ozel : MESAJ_SABLON[tip];
}

/* Şablonu değişkenlerle doldur */
function mesajDoldur(tip, veri) {
  let m = mesajSablonu(tip);
  m = m.replace(/\{ad\}/g, veri.ad || "")
       .replace(/\{islem\}/g, veri.islem || "tedavi")
       .replace(/\{ay\}/g, veri.ay != null ? veri.ay : "")
       .replace(/\{gun\}/g, veri.gun || "")
       .replace(/\{saat\}/g, veri.saat || "");
  return m;
}
