/* =========================================================
   NUR DİŞ — MUHASEBE — KDV, vergi, mizan, yevmiye, bilanço, e-fatura
   app.js'ten bölündü · index.html yükleme sırası önemli
========================================================= */

/* =========================================================
   NUR DİŞ & DENTAL KLİNİK — MUHASEBE MODÜLÜ v2
   • Personel & SGK primi otomasyonu (2026 parametreleri)
   • Vergi / beyanname özeti + GİB & SGK resmî bağlantıları
   • Haftalık / aylık / 3 aylık / 6 aylık / yıllık raporlar
   • Her gelir ve gider kaydını düzenleme
========================================================= */

/* ---------------- YARDIMCI ---------------- */

function accTL(n) {
  return "₺" + (Number(n) || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function accTL0(n) {
  return "₺" + Math.round(Number(n) || 0).toLocaleString("tr-TR");
}
function accNum(v) { const n = parseFloat(v); return isNaN(n) ? 0 : n; }
function accToday() { return new Date().toISOString().split("T")[0]; }

/* 2026 resmî parametreler (brüt asgari ücret 33.030 ₺, tavan 9 kat) */
const SGK_DEFAULTS = {
  minWage: 33030,
  tavanCarpan: 9,
  isciSgk: 14,
  isciIssizlik: 1,
  isverenSgk: 20.5,
  isverenIssizlik: 2,
  tesvikPuan: 5,
  damgaOran: 0.00759,
  vergiDilimleri: [
    { ust: 190000, oran: 0.15 },
    { ust: 400000, oran: 0.20 },
    { ust: 1000000, oran: 0.27 },
    { ust: 5300000, oran: 0.35 },
    { ust: null, oran: 0.40 }
  ]
};

function sgkSet() {
  return Object.assign({}, SGK_DEFAULTS, state.sgkSettings || {});
}

/* Kümülatif gelir vergisi dilim hesabı */
function accGelirVergisi(matrah, dilimler) {
  const d = dilimler || SGK_DEFAULTS.vergiDilimleri;
  let vergi = 0, alt = 0;
  for (let i = 0; i < d.length; i++) {
    const ust = (d[i].ust == null) ? Infinity : d[i].ust;
    if (matrah > alt) {
      const kismi = Math.min(matrah, ust) - alt;
      if (kismi > 0) vergi += kismi * d[i].oran;
    }
    alt = ust;
    if (matrah <= ust) break;
  }
  return vergi;
}

/* Bir personelin tek aylık bordrosu */
function accPayroll(p) {
  const s = sgkSet();
  const gun = Math.max(0, Math.min(30, accNum(p.days) || 30));
  const oran = gun / 30;
  const brut = accNum(p.grossSalary);

  const alt = s.minWage * oran;
  const ust = s.minWage * (s.tavanCarpan || 9) * oran;

  let pek = brut * oran;
  let uyari = "";
  if (pek < alt) { pek = alt; uyari = "Brüt ücret asgari ücretin altında — prime esas kazanç alt sınıra çekildi."; }
  if (pek > ust) { pek = ust; uyari = "Prime esas kazanç tavanı aşıldı — tavan tutardan hesaplandı."; }

  const isciSgk = pek * s.isciSgk / 100;
  const isciIssiz = pek * s.isciIssizlik / 100;
  const isverenSgkOran = Math.max(0, s.isverenSgk - (p.tesvikli ? s.tesvikPuan : 0));
  const isverenSgk = pek * isverenSgkOran / 100;
  const isverenIssiz = pek * s.isverenIssizlik / 100;

  const gvMatrah = pek - isciSgk - isciIssiz;
  const asgariMatrah = Math.max(0, alt - (alt * (s.isciSgk + s.isciIssizlik) / 100));
  const vergiBrut = accGelirVergisi(gvMatrah * 12, s.vergiDilimleri) / 12;
  const vergiIstisna = accGelirVergisi(asgariMatrah * 12, s.vergiDilimleri) / 12;
  const gelirVergisi = Math.max(0, vergiBrut - vergiIstisna);

  const damga = Math.max(0, pek * s.damgaOran - alt * s.damgaOran);

  const net = pek - isciSgk - isciIssiz - gelirVergisi - damga;
  const toplamSgk = isciSgk + isciIssiz + isverenSgk + isverenIssiz;
  const isvereneMaliyet = pek + isverenSgk + isverenIssiz;

  return {
    gun, brut, pek, alt, ust,
    isciSgk, isciIssiz, isverenSgk, isverenSgkOran, isverenIssiz,
    gvMatrah, gelirVergisi, damga, net, toplamSgk, isvereneMaliyet, uyari
  };
}

/* Aktif personelin toplam SGK yükü */
function accPayrollTotal(list) {
  const arr = (list || state.personnel || []).filter(p => p.aktif !== false);
  const t = { kisi: arr.length, brut: 0, pek: 0, isciSgk: 0, isciIssiz: 0, isverenSgk: 0, isverenIssiz: 0, gelirVergisi: 0, damga: 0, net: 0, toplamSgk: 0, isvereneMaliyet: 0 };
  arr.forEach(p => {
    const c = accPayroll(p);
    t.brut += c.brut; t.pek += c.pek;
    t.isciSgk += c.isciSgk; t.isciIssiz += c.isciIssiz;
    t.isverenSgk += c.isverenSgk; t.isverenIssiz += c.isverenIssiz;
    t.gelirVergisi += c.gelirVergisi; t.damga += c.damga;
    t.net += c.net; t.toplamSgk += c.toplamSgk; t.isvereneMaliyet += c.isvereneMaliyet;
  });
  return t;
}

/* ---------------- DÖNEM ARALIĞI ---------------- */

function accRangeStart(key) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  if (key === "ozel" && state.accFrom) return new Date(state.accFrom + "T00:00:00");
  switch (key) {
    case "hafta": { const k = (d.getDay() + 6) % 7; d.setDate(d.getDate() - k); return d; }
    case "ay": return new Date(d.getFullYear(), d.getMonth(), 1);
    case "3ay": return new Date(d.getFullYear(), d.getMonth() - 2, 1);
    case "6ay": return new Date(d.getFullYear(), d.getMonth() - 5, 1);
    case "yil": return new Date(d.getFullYear(), 0, 1);
    default: return new Date(d.getFullYear(), d.getMonth(), 1);
  }
}
function accRangeEnd(key) {
  if (key === "ozel" && state.accTo) {
    const d = new Date(state.accTo + "T23:59:59");
    return d;
  }
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}
function accRangeLabel(key) {
  const map = { hafta: "Bu Hafta", ay: "Bu Ay", "3ay": "Son 3 Ay", "6ay": "Son 6 Ay", yil: "Bu Yıl", ozel: "Özel Aralık" };
  if (key === "ozel") return (state.accFrom || "—") + " → " + (state.accTo || "—");
  return map[key] || "Bu Ay";
}
function accInRange(items) {
  const bas = accRangeStart(state.accRange).getTime();
  const bit = accRangeEnd(state.accRange).getTime();
  return (items || []).filter(x => {
    if (!x || !x.date) return false;
    const t = new Date(x.date).getTime();
    return t >= bas && t <= bit;
  });
}
function accSum(items, field) {
  return (items || []).reduce((s, x) => s + accNum(x[field]), 0);
}
function accGroupBy(items, field) {
  const m = {};
  (items || []).forEach(x => {
    const k = x[field] || "Diğer";
    if (!m[k]) m[k] = { toplam: 0, adet: 0 };
    m[k].toplam += accNum(x.amount);
    m[k].adet++;
  });
  return Object.entries(m).sort((a, b) => b[1].toplam - a[1].toplam);
}

/* ---------------- RESMÎ BAĞLANTILAR ---------------- */

const ACC_LINKS = {
  sgkEBildirge: "https://ebildirge.sgk.gov.tr/",
  sgkEDevlet: "https://www.turkiye.gov.tr/",
  gibEBeyanname: "https://ebeyanname.gib.gov.tr/",
  gibDijital: "https://dijital.gib.gov.tr/",
  gibInteraktif: "https://ivd.gib.gov.tr/"
};

function accCopy(text) {
  const bitir = (ok) => alert(ok ? "✅ Kopyalandı. Resmî sisteme yapıştırabilirsiniz." : "Kopyalanamadı — metni elle seçip kopyalayın.");
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => bitir(true)).catch(() => bitir(false));
  } else {
    const ta = document.createElement("textarea");
    ta.value = text; document.body.appendChild(ta); ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    ta.remove(); bitir(ok);
  }
}

function accSgkOzetMetni() {
  const s = sgkSet();
  const ay = new Date();
  const donem = String(ay.getMonth() + 1).padStart(2, "0") + "/" + ay.getFullYear();
  const t = accPayrollTotal();
  let m = "NUR DİŞ & DENTAL KLİNİK\n";
  m += "AYLIK PRİM VE HİZMET BELGESİ ÖZETİ\n";
  m += "Dönem: " + donem + "\n";
  m += "Asgari ücret (brüt): " + accTL(s.minWage) + " · Tavan: " + accTL(s.minWage * s.tavanCarpan) + "\n";
  m += "--------------------------------------------------\n";
  (state.personnel || []).filter(p => p.aktif !== false).forEach((p, i) => {
    const c = accPayroll(p);
    m += (i + 1) + ". " + (p.name || "-") + (p.tcNo ? " (TC: " + p.tcNo + ")" : "") + "\n";
    m += "   Görev: " + (p.position || "-") + " · Gün: " + c.gun + " · SPEK: " + accTL(c.pek) + "\n";
    m += "   İşçi payı: " + accTL(c.isciSgk + c.isciIssiz) + " · İşveren payı: " + accTL(c.isverenSgk + c.isverenIssiz) + "\n";
    m += "   Toplam prim: " + accTL(c.toplamSgk) + " · Net ücret: " + accTL(c.net) + "\n";
  });
  m += "--------------------------------------------------\n";
  m += "TOPLAM SİGORTA PRİMİ: " + accTL(t.toplamSgk) + "\n";
  m += "  İşçi payı toplamı: " + accTL(t.isciSgk + t.isciIssiz) + "\n";
  m += "  İşveren payı toplamı: " + accTL(t.isverenSgk + t.isverenIssiz) + "\n";
  m += "TOPLAM İŞVEREN MALİYETİ: " + accTL(t.isvereneMaliyet) + "\n";
  m += "\nBu özet ön hazırlıktır; resmî bildirim e-Bildirge üzerinden yapılır.\n";
  return m;
}

function accVergiOzetMetni() {
  const inc = accInRange(state.accounting.incomes);
  const exp = accInRange(state.accounting.expenses);
  const brut = inc.reduce((s, i) => s + accNum(i.grossAmount || i.amount), 0);
  const kdv = accSum(inc, "kdv");
  const stopaj = accSum(inc, "stopaj");
  const damga = accSum(inc, "damga");
  const gider = accSum(exp, "amount");
  const kdvGider = exp.reduce((s, e) => s + (accNum(e.kdv) || 0), 0);
  let m = "NUR DİŞ & DENTAL KLİNİK\n";
  m += "BEYANNAME ÖN ÖZETİ — " + accRangeLabel(state.accRange) + "\n";
  m += "--------------------------------------------------\n";
  m += "Brüt gelir: " + accTL(brut) + "\n";
  m += "Hesaplanan KDV (%10): " + accTL(kdv) + "\n";
  m += "İndirilecek KDV (gider): " + accTL(kdvGider) + "\n";
  m += "ÖDENECEK KDV: " + accTL(Math.max(0, kdv - kdvGider)) + "\n";
  m += "--------------------------------------------------\n";
  m += "Stopaj (%20): " + accTL(stopaj) + "\n";
  m += "Damga vergisi: " + accTL(damga) + "\n";
  m += "Toplam gider: " + accTL(gider) + "\n";
  m += "Net kâr: " + accTL(brut - gider) + "\n";
  m += "\nBu özet ön hazırlıktır; beyanname GİB e-Beyanname üzerinden verilir.\n";
  return m;
}

/* ---------------- RENDER: ANA GİRİŞ ---------------- */

/* =========================================================
   NUR DİŞ — MALİ MÜŞAVİR MOTORU v3
   Beyanname takvimi, KDV/Geçici/Yıllık vergi, amortisman,
   cari hesap (alacak takibi) ve merkezi uyarı motoru.
   2026 resmî parametreleri.
========================================================= */

/* ---------------- 2026 VERGİ DİLİMLERİ (GVK m.103) ---------------- */
const GV_2026_TICARI = [
  { ust: 190000,   oran: 0.15, taban: 0 },
  { ust: 400000,   oran: 0.20, taban: 28500 },
  { ust: 1000000,  oran: 0.27, taban: 70500 },
  { ust: 5300000,  oran: 0.35, taban: 232500 },
  { ust: null,     oran: 0.40, taban: 1737500 }
];

/* Kümülatif dilim hesabı — 2026 ücret dışı/taciri kazanç tarifesi */
function gvHesapla(matrah) {
  if (!(matrah > 0)) return 0;
  let alt = 0;
  for (const d of GV_2026_TICARI) {
    const ust = d.ust == null ? Infinity : d.ust;
    if (matrah <= ust) return d.taban + (matrah - alt) * d.oran;
    alt = ust;
  }
  return 0;
}
/* Bir sonraki dilime kalan tutar (bilgi amaçlı) */
function gvDilimBilgi(matrah) {
  let alt = 0;
  for (const d of GV_2026_TICARI) {
    const ust = d.ust == null ? Infinity : d.ust;
    if (matrah < ust) return { oran: d.oran, kalan: ust === Infinity ? null : ust - matrah, ust };
    alt = ust;
  }
  return { oran: 0.40, kalan: null, ust: null };
}

/* ---------------- BEYANNAME TAKVİMİ ---------------- */
/* Türkiye'de mali müşavirliğin omurgası: hangi beyanname ne zaman */
const BEYAN_TURLERI = [
  { id: "kdv",        ad: "KDV Beyannamesi",              gun: 28, ayKaydir: 1, kurum: "GİB",  link: "gibEBeyanname", aciklama: "Aylık KDV beyanı ve ödemesi" },
  { id: "muhtasar",   ad: "Muhtasar ve Prim Hizmet",      gun: 26, ayKaydir: 1, kurum: "GİB",  link: "gibEBeyanname", aciklama: "Stopaj + SGK primi bildirimi" },
  { id: "damga",      ad: "Damga Vergisi",                gun: 26, ayKaydir: 1, kurum: "GİB",  link: "gibEBeyanname", aciklama: "Sözleşme/damga vergisi" },
  { id: "sgk",        ad: "SGK Prim Ödemesi",             gun: 26, ayKaydir: 1, kurum: "SGK",  link: "sgkEBildirge",  aciklama: "Aylık prim ve hizmet bedeli" }
];

const GECICI_VERGI_DONEM = [
  { d: 1, aylar: "Ocak-Mart",      son: [4, 17],  kapsam: [1, 3] },
  { d: 2, aylar: "Nisan-Haziran",  son: [7, 17],  kapsam: [4, 6] },
  { d: 3, aylar: "Temmuz-Eylül",   son: [10, 17], kapsam: [7, 9] }
];

/* Bugüne en yakın (geçmiş + gelecek) beyanname listesi üretir */
function accBeyannameListesi(aySayisi) {
  const liste = [];
  const simdi = new Date();
  const geri = aySayisi || 2;
  const ileri = 3;

  for (let offset = -geri; offset <= ileri; offset++) {
    const donem = new Date(simdi.getFullYear(), simdi.getMonth() + offset, 1);
    const yil = donem.getFullYear();
    const ay = donem.getMonth(); // 0-11

    BEYAN_TURLERI.forEach(t => {
      const vade = new Date(yil, ay + t.ayKaydir, t.gun);
      liste.push({
        id: t.id + "_" + yil + "_" + (ay + 1),
        ad: t.ad,
        donem: donem.toLocaleDateString("tr-TR", { month: "long", year: "numeric" }),
        donemKey: yil + "-" + String(ay + 1).padStart(2, "0"),
        vade,
        kurum: t.kurum,
        link: t.link,
        aciklama: t.aciklama
      });
    });
  }

  // Geçici vergi dönemleri (içinde bulunulan yıla ait)
  GECICI_VERGI_DONEM.forEach(g => {
    const vade = new Date(simdi.getFullYear(), g.son[0], g.son[1]);
    liste.push({
      id: "gecici_" + g.d,
      ad: g.d + ". Dönem Geçici Vergi",
      donem: g.aylar + " " + simdi.getFullYear(),
      donemKey: "G" + g.d,
      vade,
      kurum: "GİB",
      link: "gibEBeyanname",
      aciklama: "Kümülatif kâr üzerinden %15-40",
      geciciDonem: g.d
    });
  });

  // Yıllık gelir vergisi + taksitler
  liste.push({
    id: "yillik_gv_" + (simdi.getFullYear() - 1),
    ad: "Yıllık Gelir Vergisi Beyannamesi",
    donem: (simdi.getFullYear() - 1) + " yılı",
    donemKey: "YGV",
    vade: new Date(simdi.getFullYear(), 2, 31),
    kurum: "GİB",
    link: "gibEBeyanname",
    aciklama: "Önceki yıl kazancı — 1. taksit"
  });
  liste.push({
    id: "gv_taksit2_" + simdi.getFullYear(),
    ad: "Gelir Vergisi 2. Taksit",
    donem: (simdi.getFullYear() - 1) + " yılı",
    donemKey: "GV2",
    vade: new Date(simdi.getFullYear(), 6, 31),
    kurum: "GİB",
    link: "gibDijital",
    aciklama: "Yıllık GV ikinci taksit"
  });

  // Bağ-Kur / 4-b primi (aylık)
  for (let offset = 0; offset <= 1; offset++) {
    const donem = new Date(simdi.getFullYear(), simdi.getMonth() + offset, 1);
    liste.push({
      id: "bagkur_" + donem.getFullYear() + "_" + (donem.getMonth() + 1),
      ad: "Bağ-Kur (4/b) Primi",
      donem: donem.toLocaleDateString("tr-TR", { month: "long", year: "numeric" }),
      donemKey: donem.getFullYear() + "-" + String(donem.getMonth() + 1).padStart(2, "0"),
      vade: new Date(donem.getFullYear(), donem.getMonth() + 1, 1),
      kurum: "SGK",
      link: "sgkEDevlet",
      aciklama: "Aylık isteğe bağlı / zorunlu 4-b primi"
    });
  }

  liste.sort((a, b) => a.vade - b.vade);
  return liste;
}

/* Vadeye kalan gün → durum rengi */
function accVadeDurum(vade, id) {
  const bugun = new Date();
  bugun.setHours(0, 0, 0, 0);
  const v = new Date(vade);
  v.setHours(0, 0, 0, 0);
  const gun = Math.round((v - bugun) / 86400000);
  const tamam = id ? !!(state.accTamamlanan || {})[id] : false;

  if (tamam) return { gun, renk: "#2E7D32", etiket: "✅ Tamamlandı", gecti: false, tamam: true };

  let renk = "#2E7D32", etiket = "";
  if (gun < -45) { renk = "#9E9E9E"; etiket = "Geçmiş dönem"; }
  else if (gun < 0) { renk = "#C62828"; etiket = Math.abs(gun) + " gün geçti — beyan edildi mi?"; }
  else if (gun === 0) { renk = "#D32F2F"; etiket = "BUGÜN SON GÜN"; }
  else if (gun <= 3) { renk = "#E65100"; etiket = gun + " gün kaldı"; }
  else if (gun <= 7) { renk = "#F9A825"; etiket = gun + " gün kaldı"; }
  else { renk = "#2E7D32"; etiket = gun + " gün kaldı"; }
  return { gun, renk, etiket, gecti: gun < 0, tamam: false };
}

/* ---------------- KDV BEYANNAMESİ ---------------- */
/* Devreden KDV zinciri: yıl başından itibaren kümülatif */
function accKdvSeri(yil) {
  const aylar = [];
  let devreden = 0;
  for (let m = 0; m < 12; m++) {
    const inc = (state.accounting.incomes || []).filter(x => {
      const d = new Date(x.date); return d.getFullYear() === yil && d.getMonth() === m;
    });
    const exp = (state.accounting.expenses || []).filter(x => {
      const d = new Date(x.date); return d.getFullYear() === yil && d.getMonth() === m;
    });
    const hesaplanan = inc.reduce((s, x) => s + accNum(x.kdv), 0);
    const indirilecek = exp.reduce((s, x) => s + accNum(x.kdv), 0);

    const oncekiDevir = devreden;
    let odenecek = 0;
    const toplamIndirim = indirilecek + oncekiDevir;
    if (hesaplanan > toplamIndirim) {
      odenecek = hesaplanan - toplamIndirim;
      devreden = 0;
    } else {
      odenecek = 0;
      devreden = toplamIndirim - hesaplanan;
    }

    aylar.push({
      ay: m + 1,
      etiket: new Date(yil, m, 1).toLocaleDateString("tr-TR", { month: "long" }),
      hesaplanan, indirilecek, oncekiDevir, odenecek,
      sonrakiDevir: devreden,
      brutGelir: inc.reduce((s, x) => s + accNum(x.grossAmount || x.amount), 0),
      islemSayisi: inc.length
    });
  }
  return aylar;
}

function accKdvDonem(yil, ay) { // ay: 1-12
  const seri = accKdvSeri(yil);
  return seri[ay - 1] || null;
}

/* ---------------- GEÇİCİ VERGİ ---------------- */
/* Kümülatif ticari kâr üzerinden hesaplanır, önceki dönemler mahsup edilir. */
function accGeciciVergi(yil, donem) {
  const g = GECICI_VERGI_DONEM.find(x => x.d === donem);
  if (!g) return null;
  const sonAy = g.kapsam[1]; // 1-12

  const inc = (state.accounting.incomes || []).filter(x => {
    const d = new Date(x.date); return d.getFullYear() === yil && (d.getMonth() + 1) <= sonAy;
  });
  const exp = (state.accounting.expenses || []).filter(x => {
    const d = new Date(x.date); return d.getFullYear() === yil && (d.getMonth() + 1) <= sonAy;
  });

  // Geçici vergi matrahı: brüt gelir - giderler (KDV hariç)
  const gelir = inc.reduce((s, x) => s + accNum(x.grossAmount || x.amount), 0);
  const gider = exp.reduce((s, x) => s + accNum(x.amount), 0);
  const kar = gelir - gider;
  const matrah = Math.max(0, kar);

  const kumulatifVergi = gvHesapla(matrah);

  // Önceki dönemlerde hesaplanan geçici vergiler
  let oncekiVergi = 0;
  for (let d = 1; d < donem; d++) {
    const prev = accGeciciVergi(yil, d);
    if (prev) oncekiVergi += prev.odenecek;
  }
  const odenecek = Math.max(0, kumulatifVergi - oncekiVergi);

  return {
    donem, kapsam: g.aylar, sonTarih: new Date(yil, g.son[0], g.son[1]),
    gelir, gider, kar, matrah, kumulatifVergi, oncekiVergi, odenecek,
    efektifOran: matrah > 0 ? (kumulatifVergi / matrah * 100) : 0
  };
}

/* ---------------- YILLIK GELİR VERGİSİ ---------------- */
function accYillikGelirVergisi(yil) {
  const inc = (state.accounting.incomes || []).filter(x => new Date(x.date).getFullYear() === yil);
  const exp = (state.accounting.expenses || []).filter(x => new Date(x.date).getFullYear() === yil);

  const gelir = inc.reduce((s, x) => s + accNum(x.grossAmount || x.amount), 0);
  const gider = exp.reduce((s, x) => s + accNum(x.amount), 0);
  // Amortisman gideri
  const amort = accAmortismanYillik(yil);
  const toplamGider = gider + amort;
  const kar = gelir - toplamGider;
  const matrah = Math.max(0, kar);

  const vergi = gvHesapla(matrah);
  // Geçici vergi mahsubu
  let geciciToplam = 0;
  for (let d = 1; d <= 3; d++) {
    const g = accGeciciVergi(yil, d);
    if (g) geciciToplam += g.odenecek;
  }
  // 4. dönem geçici vergi yok — yıllıkta hesaplaşılır
  const kalan = Math.max(0, vergi - geciciToplam);
  // Damga vergisi (beyanname)
  const beyannameDamga = matrah > 0 ? Math.max(0, matrah * 0.000568) : 0;

  return {
    yil, gelir, gider, amortisman: amort, toplamGider, kar, matrah,
    vergi, geciciToplam, kalan, beyannameDamga,
    taksit1: kalan / 2, taksit2: kalan / 2,
    efektifOran: matrah > 0 ? (vergi / matrah * 100) : 0
  };
}

/* ---------------- AMORTİSMAN (VUK 333) ---------------- */
const AMORT_OMURLER = [
  { ad: "Bilgisayar / yazılım", yil: 4 },
  { ad: "Mobilya ve demirbaş", yil: 10 },
  { ad: "Tıbbi cihaz (küçük)", yil: 5 },
  { ad: "Tıbbi cihaz (büyük / röntgen)", yil: 10 },
  { ad: "Dental ünite / koltuk", yil: 10 },
  { ad: "Bina", yil: 40 },
  { ad: "Binek otomobil", yil: 5 },
  { ad: "Diğer", yil: 5 }
];

function accAmortYil(demirbas) {
  const omur = accNum(demirbas.omur) || 5;
  const maliyet = accNum(demirbas.maliyet);
  return maliyet / omur;
}
/* Belirli bir yılın amortisman gideri (kıst amortisman basit usul) */
function accAmortYilTutar(demirbas, yil) {
  const alis = new Date(demirbas.alisTarihi || demirbas.date || "2000-01-01");
  if (alis.getFullYear() > yil) return 0;
  const omur = accNum(demirbas.omur) || 5;
  const maliyet = accNum(demirbas.maliyet);
  const yillik = maliyet / omur;
  // Alındığı yıl: kalan ay kadar (kıst)
  if (alis.getFullYear() === yil) {
    const kalanAy = 12 - alis.getMonth();
    return yillik * (kalanAy / 12);
  }
  // Ömür dolduysa dur
  const gecenYil = yil - alis.getFullYear();
  if (gecenYil >= omur) return 0;
  return yillik;
}
function accAmortToplam(demirbas) {
  const alis = new Date(demirbas.alisTarihi || demirbas.date || "2000-01-01");
  const omur = accNum(demirbas.omur) || 5;
  const maliyet = accNum(demirbas.maliyet);
  const gecenYil = new Date().getFullYear() - alis.getFullYear();
  return Math.min(maliyet, maliyet / omur * Math.min(omur, gecenYil + 1));
}
function accAmortismanYillik(yil) {
  return (state.demirbaslar || []).reduce((s, d) => s + accAmortYilTutar(d, yil), 0);
}

/* ---------------- CARİ HESAP (ALACAK TAKİBİ) ---------------- */
/* Ödenmemiş tedavi/fatura kayıtları + tahsilat geçmişi */
function accCariListe() {
  const inc = state.accounting.incomes || [];
  const map = {};
  inc.forEach(x => {
    if (x.paid !== false) return;          // ödenmişse cari dışı
    const k = (x.firm || x.description || "Diğer").trim();
    if (!map[k]) map[k] = { ad: k, toplam: 0, kayitlar: [] };
    map[k].toplam += accNum(x.amount);
    map[k].kayitlar.push(x);
  });
  return Object.values(map).sort((a, b) => b.toplam - a.toplam);
}
function accCariToplam() {
  return accCariListe().reduce((s, c) => s + c.toplam, 0);
}
function accCariGecikme(kayit) {
  const d = new Date(kayit.date || Date.now());
  return Math.max(0, Math.round((new Date() - d) / 86400000));
}

/* ---------------- MERKEZİ UYARI MOTORU ---------------- */
function accUyarilar() {
  const u = [];
  const bugun = new Date();
  const yil = bugun.getFullYear();
  const ay = bugun.getMonth() + 1;

  /* 1) Yaklaşan / geciken beyannameler (tamamlananlar ve 45+ gün geçmiş olanlar hariç) */
  accBeyannameListesi(1).forEach(b => {
    const d = accVadeDurum(b.vade, b.id);
    if (d.tamam) return;
    if (d.gun > 7 || d.gun < -45) return;
    u.push({
      seviye: (d.gecti || d.gun <= 3) ? "kritik" : "uyari",
      baslik: b.ad + " · " + b.donem,
      mesaj: d.etiket + " · Son gün: " + b.vade.toLocaleDateString("tr-TR"),
      link: b.link, linkAd: b.kurum + " →",
      beyanId: b.id
    });
  });

  /* 2) KDV ödemesi uyarısı */
  const kdvSeri = accKdvSeri(yil);
  const gecenAyKdv = ay === 1 ? null : kdvSeri[ay - 2];
  if (gecenAyKdv && gecenAyKdv.odenecek > 0) {
    u.push({
      seviye: "bilgi",
      baslik: "Bu ay ödenecek KDV: " + accTL(gecenAyKdv.odenecek),
      mesaj: gecenAyKdv.etiket + " dönemi KDV'si · Son gün: 28 " + bugun.toLocaleDateString("tr-TR", { month: "long" }),
      link: "gibDijital", linkAd: "Ödeme →"
    });
  }
  /* 3) Devreden KDV varsa bilgilendir */
  if (gecenAyKdv && gecenAyKdv.sonrakiDevir > 0) {
    u.push({
      seviye: "bilgi",
      baslik: "Devreden KDV: " + accTL(gecenAyKdv.sonrakiDevir),
      mesaj: "Bu tutar sonraki dönemlerde indirim olarak kullanılacak.",
      link: "kdv", linkAd: "Detay →"
    });
  }

  /* 4) Personel SGK primi */
  const pt = accPayrollTotal();
  if (pt.kisi > 0 && pt.toplamSgk > 0) {
    u.push({
      seviye: "uyari",
      baslik: "Aylık SGK primi: " + accTL(pt.toplamSgk),
      mesaj: pt.kisi + " personel · Son bildirim günü: 26 " + bugun.toLocaleDateString("tr-TR", { month: "long" }),
      link: "sgkEBildirge", linkAd: "e-Bildirge →"
    });
  }
  /* 5) Personel TC eksik */
  const tcEksik = (state.personnel || []).filter(p => p.aktif !== false && (!p.tcNo || p.tcNo.length !== 11));
  if (tcEksik.length) {
    u.push({
      seviye: "kritik",
      baslik: tcEksik.length + " personelin TC kimlik no'su eksik",
      mesaj: "SGK bildirgesi TC olmadan verilemez: " + tcEksik.map(p => p.name).join(", "),
      link: "personel", linkAd: "Personel →"
    });
  }

  /* 6) Vadesi geçen alacaklar */
  const cari = accCariListe();
  const gecikmis = cari.filter(c => c.kayitlar.some(k => accCariGecikme(k) > 30));
  if (gecikmis.length) {
    u.push({
      seviye: "uyari",
      baslik: gecikmis.length + " hastadan 30+ gün tahsilat yok",
      mesaj: "Toplam bekleyen: " + accTL(cari.reduce((s, c) => s + c.toplam, 0)),
      link: "cari", linkAd: "Cari Hesap →"
    });
  }

  /* 7) Geçici vergi dönemi yaklaşıyor */
  const sonrakiGecici = GECICI_VERGI_DONEM
    .map(g => ({ g, vade: new Date(yil, g.son[0], g.son[1]) }))
    .filter(x => x.vade >= bugun)
    .sort((a, b) => a.vade - b.vade)[0];
  if (sonrakiGecici) {
    const gun = Math.round((sonrakiGecici.vade - bugun) / 86400000);
    if (gun <= 30) {
      const gv = accGeciciVergi(yil, sonrakiGecici.g.d);
      u.push({
        seviye: gun <= 10 ? "kritik" : "uyari",
        baslik: sonrakiGecici.g.d + ". dönem geçici vergi: " + gun + " gün",
        mesaj: gv ? ("Tahmini ödenecek: " + accTL(gv.odenecek) + " · Matrah: " + accTL(gv.matrah)) : "Hesaplama için kayıt girin",
        link: "gv", linkAd: "Hesapla →"
      });
    }
  }

  /* 8) Amortisman girilmemiş demirbaş */
  if ((state.demirbaslar || []).length === 0) {
    u.push({
      seviye: "bilgi",
      baslik: "Demirbaş kaydı yok",
      mesaj: "Koltuk, röntgen, bilgisayar gibi alımlar amortismanla giderleşir — vergiyi düşürür.",
      link: "demirbas", linkAd: "Demirbaş →"
    });
  }

  /* 8.5) Kritik stok uyarısı */
  const kritikStok = stokKritikler();
  if (kritikStok.length) {
    u.push({
      seviye: kritikStok.some(s => accNum(s.miktar) <= 0) ? "kritik" : "uyari",
      baslik: kritikStok.length + " malzeme kritik seviyede",
      mesaj: kritikStok.slice(0, 3).map(s => s.ad + " (" + accNum(s.miktar) + " " + s.birim + ")").join(", ") + (kritikStok.length > 3 ? "…" : ""),
      link: "stok", linkAd: "Stok →"
    });
  }

  /* 9) Bu ay hiç kayıt yok */
  const buAyKayit = (state.accounting.incomes || []).filter(x => {
    const d = new Date(x.date); return d.getFullYear() === yil && d.getMonth() + 1 === ay;
  }).length;
  if (buAyKayit === 0) {
    u.push({
      seviye: "bilgi",
      baslik: "Bu ay için gelir kaydı yok",
      mesaj: "KDV beyannamesi için ay sonuna kadar kayıtları tamamlayın.",
      link: "islem", linkAd: "Gelir Ekle →"
    });
  }

  /* 10) KDV'siz gelir kaydı */
  const kdvsiz = (state.accounting.incomes || []).filter(x => {
    const d = new Date(x.date);
    return d.getFullYear() === yil && d.getMonth() + 1 === ay && !accNum(x.kdv) && accNum(x.grossAmount || x.amount) > 0;
  });
  if (kdvsiz.length) {
    u.push({
      seviye: "uyari",
      baslik: kdvsiz.length + " gelir kaydında KDV hesaplanmamış",
      mesaj: "KDV beyannamesi eksik çıkar: " + accTL(kdvsiz.reduce((s, x) => s + accNum(x.grossAmount || x.amount), 0)),
      link: "islem", linkAd: "Düzelt →"
    });
  }

  // Mükerrer uyarıları temizle
  const gorulen = new Set();
  const tekil = u.filter(x => {
    const k = x.baslik + "|" + x.mesaj;
    if (gorulen.has(k)) return false;
    gorulen.add(k);
    return true;
  });

  const sira = { kritik: 0, uyari: 1, bilgi: 2 };
  return tekil.sort((a, b) => sira[a.seviye] - sira[b.seviye]);
}

/* ---------------- RENDER: TAKVİM ---------------- */
function renderAccTakvim() {
  const tumListe = accBeyannameListesi(2);
  const gosterEski = state.accTakvimEski || false;
  const liste = gosterEski ? tumListe : tumListe.filter(b => {
    const d = accVadeDurum(b.vade, b.id);
    return d.tamam || d.gun >= -45;
  });
  const gizliSayi = tumListe.length - liste.length;
  const uyarilar = accUyarilar();
  const bugun = new Date();

  const uyarRenk = { kritik: ["#FFEBEE", "#C62828", "#EF9A9A"], uyari: ["#FFF8E1", "#E65100", "#FFD54F"], bilgi: ["#E3F2FD", "#1565C0", "#90CAF9"] };

  const uyarHtml = uyarilar.length ? uyarilar.map(u => {
    const c = uyarRenk[u.seviye] || uyarRenk.bilgi;
    return `<div class="card p3 mb2" style="background:${c[0]};border:1px solid ${c[2]};">
      <p style="font-size:12.5px;font-weight:700;margin:0 0 3px;color:${c[1]};">${escapeHtml(u.baslik)}</p>
      <p style="font-size:11px;margin:0;color:${c[1]};opacity:.85;line-height:1.45;">${escapeHtml(u.mesaj)}</p>
      ${u.link ? (u.link.startsWith("http")
        ? `<a href="${u.link}" target="_blank" rel="noopener" style="display:inline-block;margin-top:7px;font-size:11px;font-weight:700;color:${c[1]};">${escapeHtml(u.linkAd)}</a>`
        : `<button data-action="acc-tab" data-tab="${u.link}" style="margin-top:7px;background:none;border:none;padding:0;font-size:11px;font-weight:700;color:${c[1]};cursor:pointer;">${escapeHtml(u.linkAd)}</button>`) : ""}
    </div>`;
  }).join("") : `<div class="card p4" style="text-align:center;background:#E8F5E9;border:1px solid #A5D6A7;">
      <p style="font-size:13px;margin:0;color:#1B5E20;font-weight:600;">✅ Şu an acil bir uyarı yok</p>
    </div>`;

  const takvimHtml = liste.map(b => {
    const d = accVadeDurum(b.vade, b.id);
    const cokEski = d.gun < -45;
    return `<div style="display:flex;gap:10px;align-items:flex-start;padding:9px 0;border-bottom:1px solid var(--line);${d.tamam ? "opacity:.5;" : (cokEski ? "opacity:.55;" : "")}">
      <div style="flex:0 0 52px;text-align:center;background:${d.renk}15;border:1px solid ${d.renk}40;border-radius:9px;padding:5px 2px;">
        <p style="font-size:15px;font-weight:800;margin:0;color:${d.renk};line-height:1;">${b.vade.getDate()}</p>
        <p style="font-size:8.5px;margin:1px 0 0;color:${d.renk};text-transform:uppercase;">${b.vade.toLocaleDateString("tr-TR", { month: "short" })}</p>
      </div>
      <div style="flex:1;min-width:0;">
        <p style="font-size:12.5px;font-weight:700;margin:0;${d.tamam ? "text-decoration:line-through;" : ""}">${escapeHtml(b.ad)}</p>
        <p style="font-size:10.5px;color:var(--muted);margin:2px 0 0;">${escapeHtml(b.donem)} · ${escapeHtml(b.aciklama || "")}</p>
        <p style="font-size:10px;font-weight:700;margin:3px 0 0;color:${d.renk};">${d.etiket}</p>
        <div style="display:flex;gap:5px;margin-top:6px;">
          ${d.tamam
            ? `<button data-action="beyan-geri-al" data-id="${b.id}" style="background:#EEEEEE;border:none;border-radius:6px;padding:4px 8px;font-size:9.5px;color:#666;cursor:pointer;">↩️ Geri al</button>`
            : `<button data-action="beyan-tamamla" data-id="${b.id}" style="background:#E8F5E9;border:none;border-radius:6px;padding:4px 8px;font-size:9.5px;color:#2E7D32;font-weight:700;cursor:pointer;">✓ Tamamlandı</button>`}
          ${!d.tamam ? `<a href="${ACC_LINKS[b.link]}" target="_blank" rel="noopener" style="background:${d.renk};color:#fff;text-decoration:none;border-radius:6px;padding:4px 8px;font-size:9.5px;font-weight:700;">${b.kurum}</a>` : ""}
        </div>
      </div>
    </div>`;
  }).join("");

  const kritikSayisi = uyarilar.filter(x => x.seviye === "kritik").length;

  return `
    ${kritikSayisi ? `<div class="card p3 mb3" style="background:linear-gradient(135deg,#C62828,#E53935);color:#fff;border:none;">
      <p style="font-size:13px;font-weight:800;margin:0;">⚠️ ${kritikSayisi} acil uyarı var — aşağıya bakın</p>
    </div>` : ""}

    <p class="section-label">🔔 Uyarı Merkezi (${uyarilar.length})</p>
    ${uyarHtml}

    <p class="section-label" style="margin-top:16px;">📅 Beyanname ve Ödeme Takvimi</p>
    <p class="footnote" style="margin-top:-4px;">2026 takvimi · Resmî tarihler GİB/SGK tarafından duyurulur, teyit edin.</p>
    <div class="card p4 mb3">${takvimHtml}</div>

    ${gizliSayi > 0 ? `<button data-action="takvim-eski" style="width:100%;margin-bottom:12px;background:rgba(11,110,134,.08);border:1px solid var(--line);color:var(--teal);border-radius:10px;padding:10px;font-size:11.5px;font-weight:600;font-family:'Plus Jakarta Sans',sans-serif;cursor:pointer;">${gosterEski ? "− Eski dönemleri gizle" : "+ " + gizliSayi + " eski dönemi göster"}</button>` : ""}

    <p class="section-label">📌 Sürekli Hatırlatma</p>
    <div class="card p4 mb3" style="background:#F3E5F5;border:1px solid #CE93D8;">
      <p style="font-size:11px;color:#4A148C;margin:0;line-height:1.8;">
        • <b>KDV:</b> her ayın <b>28'i</b><br/>
        • <b>Muhtasar + SGK Primi:</b> her ayın <b>26'sı</b><br/>
        • <b>Geçici vergi:</b> 17 Mayıs · 17 Ağustos · 17 Kasım<br/>
        • <b>Yıllık gelir vergisi:</b> 31 Mart (1. taksit) · 31 Temmuz (2. taksit)<br/>
        • <b>Bağ-Kur (4/b):</b> her ayın sonuna kadar
      </p>
    </div>
  `;
}

/* ---------------- RENDER: KDV BEYANNAMESİ ---------------- */
function renderAccKdv() {
  const yil = state.kdvYil || new Date().getFullYear();
  const seri = accKdvSeri(yil);
  const secili = state.kdvAy || (new Date().getMonth() + 1);
  const d = seri[secili - 1];

  const ayChip = seri.map(x => {
    const aktif = x.ay === secili;
    const varKayit = x.islemSayisi > 0;
    return `<button data-action="kdv-ay" data-ay="${x.ay}" style="flex:0 0 auto;min-width:44px;padding:7px 6px;border-radius:9px;font-size:11px;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif;border:1px solid ${aktif ? "var(--teal)" : "var(--line)"};background:${aktif ? "var(--teal)" : (varKayit ? "#E8F5E9" : "rgba(255,255,255,.7)")};color:${aktif ? "#fff" : "var(--ink)"};cursor:pointer;">${x.ay}</button>`;
  }).join("");

  const yilChip = [yil - 1, yil, yil + 1].map(y =>
    `<button data-action="kdv-yil" data-yil="${y}" style="flex:1;padding:7px;border-radius:9px;font-size:11.5px;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif;border:1px solid ${y === yil ? "var(--teal)" : "var(--line)"};background:${y === yil ? "var(--teal)" : "rgba(255,255,255,.7)"};color:${y === yil ? "#fff" : "var(--ink)"};cursor:pointer;">${y}</button>`).join("");

  const detay = d ? `
    <div class="card p4 mb3" style="background:linear-gradient(135deg,#1A237E,#283593);color:#fff;border:none;">
      <p style="font-size:13px;font-weight:700;margin:0 0 2px;">${d.etiket} ${yil} KDV Beyannamesi</p>
      <p style="font-size:10.5px;opacity:.8;margin:0 0 10px;">${d.islemSayisi} gelir kaydı · ${accTL(d.brutGelir)} brüt</p>
      <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:10px;">
        <p style="font-size:9.5px;margin:0;opacity:.85;">ÖDENECEK KDV</p>
        <p style="font-size:22px;font-weight:800;margin:2px 0 0;">${accTL(d.odenecek)}</p>
      </div>
    </div>

    <div class="card p4 mb3">
      <p style="font-size:13px;font-weight:700;margin:0 0 10px;">📄 KDV-1 Beyanname Tablosu</p>
      <table style="width:100%;font-size:11.5px;border-collapse:collapse;">
        <tr style="border-bottom:1px solid var(--line);"><td style="padding:5px 0;">Brüt Gelir (matrah)</td><td style="text-align:right;font-weight:600;">${accTL(d.brutGelir)}</td></tr>
        <tr style="border-bottom:1px solid var(--line);"><td style="padding:5px 0;">Hesaplanan KDV</td><td style="text-align:right;color:#E65100;font-weight:600;">${accTL(d.hesaplanan)}</td></tr>
        <tr style="border-bottom:1px solid var(--line);"><td style="padding:5px 0;">İndirilecek KDV (giderler)</td><td style="text-align:right;color:#2E7D32;font-weight:600;">-${accTL(d.indirilecek)}</td></tr>
        <tr style="border-bottom:1px solid var(--line);"><td style="padding:5px 0;">Önceki dönemden devreden</td><td style="text-align:right;color:#1565C0;font-weight:600;">-${accTL(d.oncekiDevir)}</td></tr>
        <tr style="background:#FFF3E0;"><td style="padding:6px 0;font-weight:800;">ÖDENECEK KDV</td><td style="text-align:right;font-weight:800;color:#E65100;">${accTL(d.odenecek)}</td></tr>
        <tr><td style="padding:5px 0;font-weight:600;">Sonraki döneme devreden</td><td style="text-align:right;font-weight:700;color:#1565C0;">${accTL(d.sonrakiDevir)}</td></tr>
      </table>
    </div>

    <div class="card p4 mb3" style="background:#FFF8E1;border:1px solid #FFD54F;">
      <p style="font-size:11.5px;font-weight:700;color:#E65100;margin:0 0 6px;">📅 Bu dönemin son günü</p>
      <p style="font-size:11px;color:#8D6E00;margin:0;">${d.ay === 12 ? "31 Aralık" : ""}${new Date(yil, d.ay, 28).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })} — beyan ve ödeme</p>
      ${d.odenecek > 0 ? `<a href="${ACC_LINKS.gibDijital}" target="_blank" rel="noopener" class="btn-primary" style="margin-top:10px;text-decoration:none;background:#2E7D32;font-size:12px;padding:11px;">💳 Dijital Vergi Dairesi'nde Öde</a>` : `<p style="font-size:11px;color:#2E7D32;font-weight:700;margin:8px 0 0;">✅ Bu dönem ödenecek KDV yok</p>`}
    </div>` : "";

  const ozetSatir = seri.filter(x => x.islemSayisi > 0 || x.odenecek > 0).map(x => `
    <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--line);font-size:11px;">
      <span>${x.etiket}</span>
      <span style="font-weight:700;color:${x.odenecek > 0 ? "#C62828" : "#2E7D32"};">${x.odenecek > 0 ? accTL0(x.odenecek) : "—"}</span>
    </div>`).join("") || `<p class="footnote">Bu yıl kayıt yok.</p>`;

  return `
    <div style="display:flex;gap:6px;margin-bottom:10px;">${yilChip}</div>
    <div style="display:flex;gap:5px;overflow-x:auto;padding-bottom:6px;margin-bottom:12px;">${ayChip}</div>
    ${detay}
    <div class="card p4 mb3">
      <p style="font-size:13px;font-weight:700;margin:0 0 10px;">📊 ${yil} Yılı KDV Özeti</p>
      ${ozetSatir}
    </div>
  `;
}

/* ---------------- RENDER: GELİR VERGİSİ (Geçici + Yıllık) ---------------- */
function renderAccGv() {
  const yil = new Date().getFullYear();
  const seciliDonem = state.gvDonem || 1;
  const g = accGeciciVergi(yil, seciliDonem);
  const yillik = accYillikGelirVergisi(yil);

  const donemChip = GECICI_VERGI_DONEM.map(x => {
    const aktif = x.d === seciliDonem;
    return `<button data-action="gv-donem" data-donem="${x.d}" style="flex:1;padding:8px 5px;border-radius:10px;font-size:11px;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif;border:1px solid ${aktif ? "#1565C0" : "var(--line)"};background:${aktif ? "#1565C0" : "rgba(255,255,255,.7)"};color:${aktif ? "#fff" : "var(--ink)"};cursor:pointer;">${x.d}. Dönem<br/><span style="font-size:8.5px;font-weight:500;">${x.aylar}</span></button>`;
  }).join("");

  const dilimHtml = GV_2026_TICARI.map((d, i) => {
    const alt = i === 0 ? 0 : GV_2026_TICARI[i - 1].ust;
    const ust = d.ust == null ? "üzeri" : d.ust.toLocaleString("tr-TR");
    const aktif = g && g.matrah > alt;
    return `<div style="display:flex;justify-content:space-between;font-size:10.5px;padding:4px 0;${aktif ? "font-weight:700;color:#1565C0;" : "color:#999;"}">
      <span>${alt.toLocaleString("tr-TR")} – ${ust}</span><span>%${(d.oran * 100).toFixed(0)}</span>
    </div>`;
  }).join("");

  return `
    <div class="card p4 mb3" style="background:linear-gradient(135deg,#0D47A1,#1565C0);color:#fff;border:none;">
      <p style="font-size:13px;font-weight:700;margin:0 0 2px;">🧮 ${yil} Geçici Vergi</p>
      <p style="font-size:10.5px;opacity:.85;margin:0 0 10px;">Kümülatif kâr üzerinden · ${g ? g.kapsam : ""}</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:8px;">
          <p style="font-size:9px;margin:0;opacity:.85;">ÖDENECEK</p>
          <p style="font-size:16px;font-weight:800;margin:2px 0 0;">${accTL0(g ? g.odenecek : 0)}</p>
        </div>
        <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:8px;">
          <p style="font-size:9px;margin:0;opacity:.85;">MATRAH</p>
          <p style="font-size:16px;font-weight:800;margin:2px 0 0;">${accTL0(g ? g.matrah : 0)}</p>
        </div>
      </div>
    </div>

    <div style="display:flex;gap:6px;margin-bottom:10px;">${donemChip}</div>

    ${g ? `<div class="card p4 mb3">
      <p style="font-size:13px;font-weight:700;margin:0 0 10px;">📄 ${g.donem}. Dönem Hesabı (${g.kapsam})</p>
      <table style="width:100%;font-size:11.5px;border-collapse:collapse;">
        <tr style="border-bottom:1px solid var(--line);"><td style="padding:5px 0;">Kümülatif gelir</td><td style="text-align:right;font-weight:600;">${accTL(g.gelir)}</td></tr>
        <tr style="border-bottom:1px solid var(--line);"><td style="padding:5px 0;">Kümülatif gider</td><td style="text-align:right;color:#C62828;font-weight:600;">-${accTL(g.gider)}</td></tr>
        <tr style="border-bottom:1px solid var(--line);"><td style="padding:5px 0;font-weight:600;">Ticari kâr / matrah</td><td style="text-align:right;font-weight:700;color:${g.matrah > 0 ? "#2E7D32" : "#C62828"};">${accTL(g.matrah)}</td></tr>
        <tr style="border-bottom:1px solid var(--line);"><td style="padding:5px 0;">Kümülatif vergi</td><td style="text-align:right;font-weight:600;">${accTL(g.kumulatifVergi)}</td></tr>
        <tr style="border-bottom:1px solid var(--line);"><td style="padding:5px 0;">Önceki dönemlerde ödenen</td><td style="text-align:right;color:#1565C0;font-weight:600;">-${accTL(g.oncekiVergi)}</td></tr>
        <tr style="background:#E3F2FD;"><td style="padding:6px 0;font-weight:800;">BU DÖNEM ÖDENECEK</td><td style="text-align:right;font-weight:800;color:#0D47A1;">${accTL(g.odenecek)}</td></tr>
      </table>
      <p style="font-size:10px;color:var(--muted);margin:8px 0 0;">Son gün: ${g.sonTarih.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })} · Efektif oran: %${g.efektifOran.toFixed(1)}</p>
      <a href="${ACC_LINKS.gibEBeyanname}" target="_blank" rel="noopener" class="btn-primary" style="margin-top:10px;text-decoration:none;background:#1565C0;font-size:12px;padding:11px;">📄 e-Beyanname'de Ver</a>
    </div>` : ""}

    <div class="card p4 mb3">
      <p style="font-size:13px;font-weight:700;margin:0 0 8px;">📊 2026 Vergi Dilimleri (ticari kazanç)</p>
      ${dilimHtml}
      <p style="font-size:9.5px;color:#888;margin:8px 0 0;">GVK m.103 · 332 Seri No'lu GVK Genel Tebliği</p>
    </div>

    <div class="card p4 mb3" style="background:linear-gradient(135deg,#4527A0,#5E35B1);color:#fff;border:none;">
      <p style="font-size:13px;font-weight:700;margin:0 0 2px;">📋 ${yil} Yıllık Gelir Vergisi (tahmini)</p>
      <p style="font-size:10.5px;opacity:.85;margin:0 0 10px;">Yıl sonu projeksiyonu · Amortisman dahil</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:8px;">
          <p style="font-size:9px;margin:0;opacity:.85;">YILLIK VERGİ</p>
          <p style="font-size:15px;font-weight:800;margin:2px 0 0;">${accTL0(yillik.vergi)}</p>
        </div>
        <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:8px;">
          <p style="font-size:9px;margin:0;opacity:.85;">GEÇİCİ MAHSUP</p>
          <p style="font-size:15px;font-weight:800;margin:2px 0 0;">${accTL0(yillik.geciciToplam)}</p>
        </div>
      </div>
    </div>

    <div class="card p4 mb3">
      <p style="font-size:13px;font-weight:700;margin:0 0 10px;">📄 Yıllık Beyan Özeti</p>
      <table style="width:100%;font-size:11.5px;border-collapse:collapse;">
        <tr style="border-bottom:1px solid var(--line);"><td style="padding:5px 0;">Yıllık gelir</td><td style="text-align:right;font-weight:600;">${accTL(yillik.gelir)}</td></tr>
        <tr style="border-bottom:1px solid var(--line);"><td style="padding:5px 0;">İşletme giderleri</td><td style="text-align:right;color:#C62828;">-${accTL(yillik.gider)}</td></tr>
        <tr style="border-bottom:1px solid var(--line);"><td style="padding:5px 0;">Amortisman gideri</td><td style="text-align:right;color:#C62828;">-${accTL(yillik.amortisman)}</td></tr>
        <tr style="border-bottom:1px solid var(--line);"><td style="padding:5px 0;font-weight:600;">Vergi matrahı</td><td style="text-align:right;font-weight:700;">${accTL(yillik.matrah)}</td></tr>
        <tr style="border-bottom:1px solid var(--line);"><td style="padding:5px 0;">Hesaplanan gelir vergisi</td><td style="text-align:right;font-weight:700;color:#E65100;">${accTL(yillik.vergi)}</td></tr>
        <tr style="border-bottom:1px solid var(--line);"><td style="padding:5px 0;">Ödenen geçici vergiler</td><td style="text-align:right;color:#1565C0;">-${accTL(yillik.geciciToplam)}</td></tr>
        <tr style="background:#EDE7F6;"><td style="padding:6px 0;font-weight:800;">KALAN VERGİ</td><td style="text-align:right;font-weight:800;color:#4527A0;">${accTL(yillik.kalan)}</td></tr>
        <tr><td style="padding:5px 0;font-size:10.5px;">1. taksit (Mart sonu)</td><td style="text-align:right;font-size:10.5px;">${accTL(yillik.taksit1)}</td></tr>
        <tr><td style="padding:5px 0;font-size:10.5px;">2. taksit (Temmuz sonu)</td><td style="text-align:right;font-size:10.5px;">${accTL(yillik.taksit2)}</td></tr>
      </table>
      <p style="font-size:9.5px;color:#888;margin:8px 0 0;">Bu bir projeksiyondur — kesin hesap yıl sonunda yapılır.</p>
    </div>
  `;
}

/* ---------------- RENDER: DEMİRBAŞ / AMORTİSMAN ---------------- */
function renderAccDemirbas() {
  const liste = state.demirbaslar || [];
  const yil = new Date().getFullYear();
  const toplamMaliyet = liste.reduce((s, d) => s + accNum(d.maliyet), 0);
  const buYilAmort = accAmortismanYillik(yil);
  const toplamAmort = liste.reduce((s, d) => s + accAmortToplam(d), 0);

  const ed = state.demirbasEdit;
  let formHtml = "";
  if (ed !== null && ed !== undefined) {
    const d = liste.find(x => x.id === ed) || { id: "", ad: "", maliyet: "", alisTarihi: accToday(), omur: 10, kategori: "Tıbbi cihaz (büyük / röntgen)" };
    formHtml = `<div class="card p4 mb3" style="border:2px solid #00695C;background:#E0F2F1;">
      <p style="font-size:13px;font-weight:700;margin:0 0 10px;color:#00695C;">${d.id ? "✏️ Demirbaşı Düzenle" : "➕ Yeni Demirbaş"}</p>
      <div class="field"><label>Demirbaş adı</label><input class="input" id="db-ad" value="${escapeAttr(d.ad || "")}" placeholder="Örn: Dental ünite, Panoramik röntgen" /></div>
      <div class="field"><label>Kategori (faydalı ömür)</label>
        <select class="input" id="db-kategori">
          ${AMORT_OMURLER.map(o => `<option value="${o.ad}|${o.yil}" ${d.kategori === o.ad ? "selected" : ""}>${o.ad} — ${o.yil} yıl</option>`).join("")}
        </select>
      </div>
      <div class="field"><label>Alış bedeli (₺)</label><input class="input" type="number" id="db-maliyet" value="${accNum(d.maliyet)}" /></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div class="field"><label>Alış tarihi</label><input class="input" type="date" id="db-tarih" value="${escapeAttr(d.alisTarihi || "")}" /></div>
        <div class="field"><label>Faydalı ömür (yıl)</label><input class="input" type="number" id="db-omur" value="${accNum(d.omur) || 10}" /></div>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn-primary" style="background:#00695C;" data-action="demirbas-save" data-id="${d.id || ""}">💾 Kaydet</button>
        <button class="btn-primary" style="background:#757575;" data-action="demirbas-cancel">İptal</button>
      </div>
    </div>`;
  }

  const satirlar = liste.map(d => {
    const yillik = accAmortYilTutar(d, yil);
    const birikmis = accAmortToplam(d);
    const kalan = Math.max(0, accNum(d.maliyet) - birikmis);
    const omurDoldu = kalan <= 0.01;
    return `<div class="card p3 mb2" style="opacity:${omurDoldu ? 0.55 : 1};">
      <div style="display:flex;justify-content:space-between;gap:8px;">
        <div style="flex:1;min-width:0;">
          <p style="font-size:12.5px;font-weight:700;margin:0;">${escapeHtml(d.ad)} ${omurDoldu ? "· (amortisman tamamlandı)" : ""}</p>
          <p style="font-size:10px;color:var(--muted);margin:2px 0 0;">${escapeHtml(d.kategori || "")} · Alış: ${escapeHtml(d.alisTarihi || "")} · ${accNum(d.omur)} yıl</p>
          <p style="font-size:10.5px;color:#00695C;margin:3px 0 0;font-weight:600;">Yıllık amortisman: ${accTL(yillik)}</p>
          <p style="font-size:9.5px;color:#888;margin:1px 0 0;">Maliyet ${accTL(accNum(d.maliyet))} · Birikmiş ${accTL(birikmis)} · Kalan ${accTL(kalan)}</p>
        </div>
        <div style="display:flex;flex-direction:column;gap:4px;">
          <button data-action="demirbas-edit" data-id="${d.id}" style="background:#E0F2F1;border:none;border-radius:6px;padding:5px 8px;cursor:pointer;font-size:11px;">✏️</button>
          <button data-action="demirbas-delete" data-id="${d.id}" style="background:#FFEBEE;border:none;border-radius:6px;padding:5px 8px;cursor:pointer;font-size:11px;color:#C62828;">🗑️</button>
        </div>
      </div>
    </div>`;
  }).join("") || `<p class="footnote">Henüz demirbaş eklenmedi.</p>`;

  return `
    <div class="card p4 mb3" style="background:linear-gradient(135deg,#004D40,#00695C);color:#fff;border:none;">
      <p style="font-size:13px;font-weight:700;margin:0 0 2px;">🏗️ Amortisman Takibi</p>
      <p style="font-size:10.5px;opacity:.85;margin:0 0 10px;">${liste.length} demirbaş · VUK 333</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:8px;">
          <p style="font-size:9px;margin:0;opacity:.85;">${yil} AMORTİSMAN</p>
          <p style="font-size:15px;font-weight:800;margin:2px 0 0;">${accTL0(buYilAmort)}</p>
        </div>
        <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:8px;">
          <p style="font-size:9px;margin:0;opacity:.85;">TOPLAM MALİYET</p>
          <p style="font-size:15px;font-weight:800;margin:2px 0 0;">${accTL0(toplamMaliyet)}</p>
        </div>
      </div>
      <p style="font-size:10px;margin:8px 0 0;opacity:.8;">Bu yılın amortismanı, gelir vergisi hesabında otomatik gider olarak düşülür.</p>
    </div>

    ${formHtml}
    ${ed === null || ed === undefined ? `<button class="btn-primary mb3" style="background:#00695C;" data-action="demirbas-new">➕ Demirbaş Ekle</button>` : ""}

    <p class="section-label">Demirbaş Listesi (${liste.length})</p>
    ${satirlar}

    <div class="card p4 mb3" style="background:#F1F8E9;border:1px solid #AED581;">
      <p style="font-size:11.5px;font-weight:700;color:#33691E;margin:0 0 6px;">💡 Neden önemli?</p>
      <p style="font-size:10.5px;color:#558B2F;margin:0;line-height:1.6;">
        Koltuk, röntgen, bilgisayar gibi alımlar tek seferde gider yazılmaz — faydalı ömre bölünerek giderleşir.
        Bu da her yıl <b>vergi matrahını düşürür</b>. Kaydetmezsen fazla vergi ödersin.
      </p>
    </div>
  `;
}

/* ---------------- RENDER: CARİ HESAP (ALACAK) ---------------- */
function renderAccCari() {
  const cari = accCariListe();
  const toplam = accCariToplam();
  const gecikmis30 = cari.filter(c => c.kayitlar.some(k => accCariGecikme(k) > 30));

  // Ödenmemiş tüm kayıtlar, gecikmeye göre sıralı
  const bekleyen = [];
  (state.accounting.incomes || []).forEach(x => {
    if (x.paid === false) bekleyen.push(x);
  });
  bekleyen.sort((a, b) => accCariGecikme(b) - accCariGecikme(a));

  const kartlar = cari.map(c => `
    <div class="card p3 mb2">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
        <div style="flex:1;min-width:0;">
          <p style="font-size:12.5px;font-weight:700;margin:0;">${escapeHtml(c.ad)}</p>
          <p style="font-size:10px;color:var(--muted);margin:2px 0 0;">${c.kayitlar.length} açık kayıt</p>
        </div>
        <p style="font-size:13px;font-weight:800;color:#C62828;margin:0;">${accTL0(c.toplam)}</p>
      </div>
    </div>`).join("") || `<p class="footnote">Ödenmemiş kayıt yok — her şey tahsil edilmiş. 👍</p>`;

  const bekleyenSatir = bekleyen.slice(0, 20).map(x => {
    const gun = accCariGecikme(x);
    const renk = gun > 60 ? "#C62828" : gun > 30 ? "#E65100" : "#2E7D32";
    return `<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--line);">
      <div style="flex:1;min-width:0;">
        <p style="font-size:12px;font-weight:600;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(x.description || "")}</p>
        <p style="font-size:10px;color:var(--muted);margin:2px 0 0;">${escapeHtml(x.date || "")} · ${gun} gün önce</p>
      </div>
      <div style="display:flex;align-items:center;gap:6px;">
        <p style="font-size:12px;font-weight:700;color:${renk};margin:0;">${accTL0(x.amount)}</p>
        <button data-action="cari-ode" data-id="${x.id}" style="background:#E8F5E9;border:none;border-radius:6px;padding:5px 8px;cursor:pointer;font-size:10px;color:#2E7D32;font-weight:700;">✓ Ödendi</button>
      </div>
    </div>`;
  }).join("") || `<p class="footnote">Bekleyen tahsilat yok.</p>`;

  return `
    <div class="card p4 mb3" style="background:linear-gradient(135deg,#B71C1C,#C62828);color:#fff;border:none;">
      <p style="font-size:13px;font-weight:700;margin:0 0 2px;">💳 Tahsil Edilmeyen Alacak</p>
      <p style="font-size:10.5px;opacity:.85;margin:0 0 10px;">${cari.length} hasta/firma · ${bekleyen.length} açık kayıt</p>
      <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:10px;">
        <p style="font-size:9.5px;margin:0;opacity:.85;">TOPLAM BEKLEYEN</p>
        <p style="font-size:22px;font-weight:800;margin:2px 0 0;">${accTL(toplam)}</p>
      </div>
      ${gecikmis30.length ? `<p style="font-size:10px;margin:8px 0 0;opacity:.9;">⚠️ ${gecikmis30.length} hastada 30 günü aşan gecikme var</p>` : ""}
    </div>

    <div class="card p4 mb3">
      <p style="font-size:13px;font-weight:700;margin:0 0 6px;">ℹ️ Nasıl kullanılır?</p>
      <p style="font-size:10.5px;color:var(--muted);margin:0;line-height:1.6;">
        Gelir kaydederken <b>"Veresiye / ödenmedi"</b> seçeneğini işaretlersen kayıt burada birikir.
        Hasta ödeme yapınca <b>✓ Ödendi</b> butonuna bas — muhasebeye de yansır.
      </p>
    </div>

    <p class="section-label">👤 Hasta / Firma Bazlı Bakiye</p>
    ${kartlar}

    <p class="section-label" style="margin-top:14px;">⏳ Bekleyen Tahsilatlar (${bekleyen.length})</p>
    <div class="card p4 mb3">${bekleyenSatir}</div>
  `;
}

/* =========================================================
   NUR DİŞ — TAM MALİ MÜŞAVİR PAKETİ v4
   Bordro · e-Fatura (UBL-TR) · Banka Mutabakatı
   Yevmiye Defteri · Mizan · Gelir Tablosu · Bilanço
   Yıllık Mali Rapor · Tahsilat Makbuzu
========================================================= */

/* ---------------- ORTAK YARDIMCILAR ---------------- */

function accTarihTR(d) {
  const t = d ? new Date(d) : new Date();
  return t.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });
}
function accTarihUzun(d) {
  const t = d ? new Date(d) : new Date();
  return t.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}
/* Yıl-ay anahtarı: 2026-10 */
function accKey(d) {
  const t = d ? new Date(d) : new Date();
  return t.getFullYear() + "-" + String(t.getMonth() + 1).padStart(2, "0");
}
function accAyAdi(yil, ay) { // ay 1-12
  return new Date(yil, ay - 1, 1).toLocaleDateString("tr-TR", { month: "long", year: "numeric" });
}

/* =========================================================
   1) BORDRO (Maaş Pusulası)
========================================================= */

function accBordro(p, donemYil, donemAy) {
  const c = accPayroll(p);
  const s = sgkSet();
  return {
    personel: p,
    donem: accAyAdi(donemYil, donemAy),
    donemKey: donemYil + "-" + String(donemAy).padStart(2, "0"),
    gun: c.gun,
    brutUcret: c.brut,
    pek: c.pek,
    isciSgk: c.isciSgk,
    isciIssiz: c.isciIssiz,
    gvMatrah: c.gvMatrah,
    gelirVergisi: c.gelirVergisi,
    damga: c.damga,
    kesintiToplam: c.isciSgk + c.isciIssiz + c.gelirVergisi + c.damga,
    netUcret: c.net,
    isverenSgk: c.isverenSgk,
    isverenIssiz: c.isverenIssiz,
    isvereneMaliyet: c.isvereneMaliyet,
    toplamSgk: c.toplamSgk,
    asgariUcret: s.minWage
  };
}

function accBordroTumu(donemYil, donemAy) {
  return (state.personnel || []).filter(p => p.aktif !== false)
    .map(p => accBordro(p, donemYil, donemAy));
}

/* A4 bordro HTML */
function accBordroHTML(b) {
  const p = b.personel;
  return `<div style="border:1px solid #ccc;border-radius:6px;padding:16px;margin-bottom:14px;page-break-inside:avoid;">
    <div style="display:flex;justify-content:space-between;border-bottom:2px solid #0B6E86;padding-bottom:8px;margin-bottom:10px;">
      <div>
        <div style="font-size:15px;font-weight:800;color:#0B6E86;">NUR DİŞ &amp; DENTAL KLİNİK</div>
        <div style="font-size:10px;color:#666;">ÜCRET BORDROSU / MAAŞ PUSULASI</div>
      </div>
      <div style="text-align:right;font-size:11px;">
        <div><b>Dönem:</b> ${b.donem}</div>
        <div style="color:#888;">Düzenleme: ${accTarihTR()}</div>
      </div>
    </div>

    <table style="width:100%;font-size:11px;margin-bottom:10px;">
      <tr>
        <td style="padding:3px 0;"><b>Ad Soyad:</b> ${escapeHtml(p.name || "-")}</td>
        <td style="padding:3px 0;"><b>TC Kimlik:</b> ${escapeHtml(p.tcNo || "-")}</td>
      </tr>
      <tr>
        <td style="padding:3px 0;"><b>Görev:</b> ${escapeHtml(p.position || "-")}</td>
        <td style="padding:3px 0;"><b>Çalışılan Gün:</b> ${b.gun}</td>
      </tr>
    </table>

    <table style="width:100%;font-size:11px;border-collapse:collapse;">
      <tr style="background:#f0f6f8;">
        <th style="text-align:left;padding:5px;border:1px solid #ddd;">KAZANÇLAR</th>
        <th style="text-align:right;padding:5px;border:1px solid #ddd;">TUTAR</th>
        <th style="text-align:left;padding:5px;border:1px solid #ddd;">KESİNTİLER</th>
        <th style="text-align:right;padding:5px;border:1px solid #ddd;">TUTAR</th>
      </tr>
      <tr>
        <td style="padding:5px;border:1px solid #ddd;">Brüt Ücret</td>
        <td style="padding:5px;border:1px solid #ddd;text-align:right;">${accTL(b.brutUcret)}</td>
        <td style="padding:5px;border:1px solid #ddd;">SGK İşçi Payı (%14)</td>
        <td style="padding:5px;border:1px solid #ddd;text-align:right;">${accTL(b.isciSgk)}</td>
      </tr>
      <tr>
        <td style="padding:5px;border:1px solid #ddd;color:#888;font-size:10px;">Prime Esas Kazanç</td>
        <td style="padding:5px;border:1px solid #ddd;text-align:right;color:#888;font-size:10px;">${accTL(b.pek)}</td>
        <td style="padding:5px;border:1px solid #ddd;">İşsizlik İşçi (%1)</td>
        <td style="padding:5px;border:1px solid #ddd;text-align:right;">${accTL(b.isciIssiz)}</td>
      </tr>
      <tr>
        <td style="padding:5px;border:1px solid #ddd;"></td><td style="padding:5px;border:1px solid #ddd;"></td>
        <td style="padding:5px;border:1px solid #ddd;">Gelir Vergisi</td>
        <td style="padding:5px;border:1px solid #ddd;text-align:right;">${accTL(b.gelirVergisi)}</td>
      </tr>
      <tr>
        <td style="padding:5px;border:1px solid #ddd;"></td><td style="padding:5px;border:1px solid #ddd;"></td>
        <td style="padding:5px;border:1px solid #ddd;">Damga Vergisi (‰7,59)</td>
        <td style="padding:5px;border:1px solid #ddd;text-align:right;">${accTL(b.damga)}</td>
      </tr>
      <tr style="background:#fff3e0;">
        <td style="padding:6px;border:1px solid #ddd;font-weight:700;">TOPLAM</td>
        <td style="padding:6px;border:1px solid #ddd;text-align:right;font-weight:700;">${accTL(b.brutUcret)}</td>
        <td style="padding:6px;border:1px solid #ddd;font-weight:700;">KESİNTİ TOPLAMI</td>
        <td style="padding:6px;border:1px solid #ddd;text-align:right;font-weight:700;">${accTL(b.kesintiToplam)}</td>
      </tr>
    </table>

    <div style="background:#0B6E86;color:#fff;padding:9px;border-radius:5px;margin-top:8px;display:flex;justify-content:space-between;font-size:13px;font-weight:800;">
      <span>NET ÖDENECEK ÜCRET</span><span>${accTL(b.netUcret)}</span>
    </div>

    <table style="width:100%;font-size:10px;margin-top:8px;color:#666;">
      <tr>
        <td>İşveren SGK (%${(sgkSet().isverenSgk - (p.tesvikli ? sgkSet().tesvikPuan : 0)).toFixed(2)}): ${accTL(b.isverenSgk)}</td>
        <td>İşveren İşsizlik (%2): ${accTL(b.isverenIssiz)}</td>
        <td style="text-align:right;"><b>İşverene Maliyet: ${accTL(b.isvereneMaliyet)}</b></td>
      </tr>
    </table>

    <div style="display:flex;justify-content:space-between;margin-top:18px;font-size:10px;">
      <div style="text-align:center;width:45%;">
        <div style="border-top:1px solid #999;padding-top:4px;">İşveren / Kaşe-İmza</div>
      </div>
      <div style="text-align:center;width:45%;">
        <div style="border-top:1px solid #999;padding-top:4px;">Personel İmzası<br/><span style="color:#aaa;">${escapeHtml(p.name || "")}</span></div>
      </div>
    </div>
  </div>`;
}
