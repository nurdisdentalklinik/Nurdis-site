/* =========================================================
   NUR DİŞ — YEDEKLEME SİSTEMİ v13
   • Tam yedek (JSON dışa aktarım / içe aktarım)
   • Otomatik günlük yedek hatırlatması
   • Yedek geçmişi takibi
   • Geri yükleme öncesi güvenlik yedeği
========================================================= */

/* Yedeklenmesi gereken tüm anahtarlar */
const YEDEK_ANAHTARLARI = [
  "accounting", "treatmentPrices", "autoExpenses", "treatments",
  "personnel", "sgkSettings", "demirbaslar", "accTamamlanan",
  "firmaBilgi", "stok", "stokHareket", "tedaviMalzeme",
  "kampanyalar", "hhAyar", "mesajSablon", "konumAyar",
  "randevuSablon", "anketler", "anketSablon", "bonusAyar"
];

/* Firebase'e kaydedilen tüm alanlar (saveAccountingToFirebase ile aynı) */
function yedekVerisiOlustur() {
  const veri = {
    _meta: {
      uygulama: "Nur Diş & Dental Klinik",
      surum: "13",
      tarih: new Date().toISOString(),
      tarihTR: new Date().toLocaleString("tr-TR"),
      cihaz: navigator.userAgent.substring(0, 80)
    },
    accounting: state.accounting || {},
    treatmentPrices: state.treatmentPrices || {},
    autoExpenses: state.autoExpenses || {},
    treatments: state.treatments || [],
    personnel: state.personnel || [],
    sgkSettings: state.sgkSettings || null,
    demirbaslar: state.demirbaslar || [],
    accTamamlanan: state.accTamamlanan || {},
    firmaBilgi: state.firmaBilgi || null,
    stok: state.stok || [],
    stokHareket: (state.stokHareket || []).slice(0, 800),
    tedaviMalzeme: state.tedaviMalzeme || {},
    kampanyalar: state.kampanyalar || [],
    hhAyar: state.hhAyar || null,
    mesajSablon: state.mesajSablon || null,
    konumAyar: state.konumAyar || null,
    randevuSablon: state.randevuSablon || null,
    anketler: (state.anketler || []).slice(0, 1500),
    anketSablon: state.anketSablon || null,
    bonusAyar: state.bonusAyar || null
  };

  // Randevular yerelde de tutuluyor
  try {
    const rv = JSON.parse(localStorage.getItem("nurdis_appointments") || "[]");
    if (rv.length) veri.appointments = rv;
  } catch (e) {}

  return veri;
}

/* Yedeğin istatistik özeti (kullanıcıya gösterilir) */
function yedekOzet(veri) {
  const v = veri || {};
  return {
    gelir: (v.accounting && v.accounting.incomes || []).length,
    gider: (v.accounting && v.accounting.expenses || []).length,
    personel: (v.personnel || []).length,
    stok: (v.stok || []).length,
    randevu: (v.appointments || []).length,
    anket: (v.anketler || []).length,
    demirbas: (v.demirbaslar || []).length,
    boyut: 0
  };
}

/* Yedeği indir */
function yedekIndir(sessizce) {
  try {
    const veri = yedekVerisiOlustur();
    const json = JSON.stringify(veri, null, 2);
    const boyut = new Blob([json]).size;

    const ad = "nur-dis-yedek-" + new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-") + ".json";
    const blob = new Blob([json], { type: "application/json;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = ad;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);

    // Geçmişe kaydet
    if (!state.yedekGecmis) state.yedekGecmis = [];
    state.yedekGecmis.unshift({
      tarih: new Date().toISOString(),
      dosya: ad,
      boyut: boyut,
      ozet: yedekOzet(veri)
    });
    state.yedekGecmis = state.yedekGecmis.slice(0, 20);
    localStorage.setItem("nurdis_yedek_gecmis", JSON.stringify(state.yedekGecmis));
    localStorage.setItem("nurdis_son_yedek", new Date().toISOString());

    if (!sessizce) {
      const o = yedekOzet(veri);
      alert("✅ Yedek indirildi\n\n" +
        "📁 " + ad + "\n" +
        "📦 " + (boyut / 1024).toFixed(0) + " KB\n\n" +
        "İçerik: " + o.gelir + " gelir, " + o.gider + " gider, " +
        o.personel + " personel, " + o.stok + " stok kalemi, " + o.randevu + " randevu\n\n" +
        "⚠️ Bu dosyayı telefonunuzda veya Google Drive'da saklayın.");
    }
    return { ok: true, dosya: ad, boyut };
  } catch (e) {
    if (!sessizce) alert("Yedek alınamadı: " + (e && e.message ? e.message : ""));
    return { ok: false, hata: e && e.message };
  }
}

/* Son yedekten kaç gün geçti */
function yedekYasGun() {
  try {
    const son = localStorage.getItem("nurdis_son_yedek");
    if (!son) return null;
    return Math.floor((new Date() - new Date(son)) / 86400000);
  } catch (e) { return null; }
}

/* Otomatik hatırlatma kontrolü */
function yedekHatirlatmaKontrol() {
  const gun = yedekYasGun();
  const hatirlatildi = localStorage.getItem("nurdis_yedek_hatirlatma_" + accToday());
  if (hatirlatildi) return;

  if (gun === null || gun >= 7) {
    localStorage.setItem("nurdis_yedek_hatirlatma_" + accToday(), "1");
    setTimeout(() => {
      const mesaj = gun === null
        ? "⚠️ Hiç yedek almadınız!\n\nVerileriniz kaybolursa geri getirilemez.\n\nŞimdi yedek almak ister misiniz?"
        : "⚠️ Son yedeğiniz " + gun + " gün önce alındı.\n\nHaftada en az bir kez yedek almanız önerilir.\n\nŞimdi yedek almak ister misiniz?";
      if (confirm(mesaj)) yedekIndir();
    }, 3000);
  }
}

/* Yedeği geri yükle */
function yedekYukle(dosya) {
  return new Promise((resolve, reject) => {
    if (!dosya) { reject(new Error("Dosya seçilmedi")); return; }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Dosya okunamadı"));
    reader.onload = (e) => {
      try {
        const veri = JSON.parse(e.target.result);

        // Doğrulama
        if (!veri || typeof veri !== "object") throw new Error("Geçersiz dosya");
        if (!veri._meta && !veri.accounting) throw new Error("Bu bir Nur Diş yedek dosyası değil");
        if (veri._meta && veri._meta.uygulama && !veri._meta.uygulama.includes("Nur Diş")) {
          throw new Error("Bu yedek başka bir kliniğe ait");
        }

        const o = yedekOzet(veri);
        const onay = confirm(
          "📥 YEDEKTEN GERİ YÜKLEME\n\n" +
          (veri._meta ? "Yedek tarihi: " + (veri._meta.tarihTR || veri._meta.tarih) + "\n\n" : "") +
          "İçerik:\n" +
          "• " + o.gelir + " gelir, " + o.gider + " gider kaydı\n" +
          "• " + o.personel + " personel\n" +
          "• " + o.stok + " stok kalemi\n" +
          "• " + o.randevu + " randevu\n" +
          "• " + o.anket + " anket\n\n" +
          "⚠️ MEVCUT VERİLERİNİZİN ÜZERİNE YAZILACAK!\n\n" +
          "Devam etmek istiyor musunuz?"
        );
        if (!onay) { resolve({ ok: false, iptal: true }); return; }

        // Önce mevcut durumu yedekle (geri alma şansı)
        yedekIndir(true);
        localStorage.setItem("nurdis_geri_alma_yedek", JSON.stringify(yedekVerisiOlustur()));

        // Geri yükle
        if (veri.accounting) state.accounting = veri.accounting;
        if (veri.treatmentPrices) state.treatmentPrices = veri.treatmentPrices;
        if (veri.autoExpenses) state.autoExpenses = veri.autoExpenses;
        if (veri.treatments) state.treatments = veri.treatments;
        if (veri.personnel) state.personnel = veri.personnel;
        if (veri.sgkSettings) state.sgkSettings = veri.sgkSettings;
        if (veri.demirbaslar) state.demirbaslar = veri.demirbaslar;
        if (veri.accTamamlanan) state.accTamamlanan = veri.accTamamlanan;
        if (veri.firmaBilgi) state.firmaBilgi = veri.firmaBilgi;
        if (veri.stok) state.stok = veri.stok;
        if (veri.stokHareket) state.stokHareket = veri.stokHareket;
        if (veri.tedaviMalzeme) state.tedaviMalzeme = veri.tedaviMalzeme;
        if (veri.kampanyalar) state.kampanyalar = veri.kampanyalar;
        if (veri.hhAyar) state.hhAyar = veri.hhAyar;
        if (veri.mesajSablon) state.mesajSablon = veri.mesajSablon;
        if (veri.konumAyar) state.konumAyar = veri.konumAyar;
        if (veri.randevuSablon) state.randevuSablon = veri.randevuSablon;
        if (veri.anketler) state.anketler = veri.anketler;
        if (veri.anketSablon) state.anketSablon = veri.anketSablon;
        if (veri.bonusAyar) state.bonusAyar = veri.bonusAyar;

        // localStorage'a yaz
        const LS = {
          accounting: "nurdis_accounting",
          treatmentPrices: "nurdis_treatment_prices",
          autoExpenses: "nurdis_auto_expenses",
          personnel: "nurdis_personnel",
          sgkSettings: "nurdis_sgk_settings",
          demirbaslar: "nurdis_demirbaslar",
          accTamamlanan: "nurdis_beyan_tamam",
          firmaBilgi: "nurdis_firma_bilgi",
          stok: "nurdis_stok",
          stokHareket: "nurdis_stok_hareket",
          tedaviMalzeme: "nurdis_tedavi_malzeme",
          kampanyalar: "nurdis_kampanyalar",
          hhAyar: "nurdis_hh_ayar",
          mesajSablon: "nurdis_mesaj_sablon",
          konumAyar: "nurdis_konum_ayar",
          randevuSablon: "nurdis_randevu_sablon",
          anketler: "nurdis_anketler",
          anketSablon: "nurdis_anket_sablon",
          bonusAyar: "nurdis_bonus_ayar"
        };
        Object.entries(LS).forEach(([k, lsKey]) => {
          if (veri[k] !== undefined) {
            localStorage.setItem(lsKey, JSON.stringify(veri[k]));
          }
        });

        // Randevular
        if (veri.appointments) {
          persist("nurdis_appointments", veri.appointments);
          state.appointments = veri.appointments;
        }

        // Firebase'e gönder (ve sonucu bekle)
        let bulutaYazildi = false;
        if (typeof saveAccountingToFirebase === "function" && window.fb && state.fbReady) {
          try {
            const p = saveAccountingToFirebase();
            if (p && p.then) {
              p.then(() => { bulutaYazildi = true; }).catch(() => { bulutaYazildi = false; });
            }
          } catch (e) {}
        }

        // Firebase'deki randevuları da yaz
        if (veri.appointments && window.fb && state.fbReady) {
          veri.appointments.forEach((a, i) => {
            setTimeout(() => {
              try { window.fb.addAppointment(a); } catch (e) {}
            }, i * 200);
          });
        }

        render();
        setTimeout(() => resolve({ ok: true, ozet: o, bulut: bulutaYazildi }), 1200);
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsText(dosya, "UTF-8");
  });
}

/* =========================================================
   ARAYÜZ
========================================================= */

function renderAccYedek() {
  const gecmis = state.yedekGecmis || [];
  const gun = yedekYasGun();
  const durumRenk = gun === null ? "#C62828" : gun >= 7 ? "#E65100" : "#2E7D32";
  const durumMetin = gun === null ? "Hiç yedek alınmadı"
    : gun === 0 ? "Bugün yedek alındı"
    : gun + " gün önce yedek alındı";

  const satirlar = gecmis.map((y, i) => {
    const d = new Date(y.tarih);
    const o = y.ozet || {};
    return `<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--line);">
      <div style="flex:1;min-width:0;">
        <p style="font-size:11.5px;font-weight:600;margin:0;">${d.toLocaleDateString("tr-TR")} ${d.toLocaleTimeString("tr-TR", {hour:"2-digit",minute:"2-digit"})}</p>
        <p style="font-size:9.5px;color:var(--muted);margin:2px 0 0;">${Math.round((y.boyut||0)/1024)} KB · ${o.gelir||0} gelir · ${o.randevu||0} randevu</p>
      </div>
      <span style="font-size:9.5px;color:#2E7D32;font-weight:700;">✓</span>
    </div>`;
  }).join("") || `<p class="footnote">Henüz yedek alınmadı.</p>`;

  const geriAlmaVar = !!localStorage.getItem("nurdis_geri_alma_yedek");

  return `
    <div class="card p4 mb3" style="background:linear-gradient(135deg,${gun === null ? "#B71C1C,#C62828" : gun >= 7 ? "#E65100,#F57C00" : "#1B5E20,#2E7D32"});color:#fff;border:none;">
      <p style="font-size:13px;font-weight:700;margin:0 0 2px;">💾 Veri Yedekleme</p>
      <p style="font-size:10.5px;opacity:.85;margin:0 0 10px;">${durumMetin}</p>
      <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:10px;text-align:center;">
        <p style="font-size:9.5px;margin:0;opacity:.85;">SON YEDEK</p>
        <p style="font-size:16px;font-weight:800;margin:3px 0 0;">${gun === null ? "—" : gun === 0 ? "Bugün" : gun + " gün önce"}</p>
      </div>
      ${gun === null || gun >= 7 ? `<p style="font-size:10px;margin:8px 0 0;opacity:.95;">⚠️ Yedek almanız önerilir — veri kaybı riski</p>` : ""}
    </div>

    ${!state.fbReady ? `<div class="card p3 mb3" style="background:#FFF3E0;border:1px solid #FFB74D;">
      <p style="font-size:11px;color:#E65100;margin:0;line-height:1.5;">⚠️ <b>Bulut bağlantısı yok</b> — geri yükleme yalnızca bu cihaza yazılır. Yönetici girişi yapıp tekrar deneyin.</p>
    </div>` : ""}

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">
      <button class="btn-primary" style="background:#2E7D32;font-size:12px;padding:13px;" data-action="yedek-al">⬇️ Yedek Al</button>
      <button class="btn-primary" style="background:#1565C0;font-size:12px;padding:13px;" data-action="yedek-yukle-btn">⬆️ Geri Yükle</button>
    </div>

    <input type="file" id="yedek-dosya" accept=".json,application/json" style="display:none;" onchange="yedekDosyaSecildi(this)" />

    ${geriAlmaVar ? `<button class="btn-primary mb3" style="background:#6A1B9A;font-size:11.5px;padding:11px;" data-action="yedek-geri-al">↩️ Son Geri Yüklemeden Önceki Hâle Dön</button>` : ""}

    <div class="card p4 mb3" style="background:#E8F5E9;border:1px solid #A5D6A7;">
      <p style="font-size:11.5px;font-weight:700;color:#1B5E20;margin:0 0 8px;">📦 Yedeğe neler giriyor?</p>
      <table style="width:100%;font-size:10.5px;color:#2E7D32;">
        <tr><td style="padding:2px 0;">💰 Muhasebe</td><td style="text-align:right;">${((state.accounting||{}).incomes||[]).length} gelir · ${((state.accounting||{}).expenses||[]).length} gider</td></tr>
        <tr><td style="padding:2px 0;">👥 Personel</td><td style="text-align:right;">${(state.personnel||[]).length} kişi</td></tr>
        <tr><td style="padding:2px 0;">📦 Stok</td><td style="text-align:right;">${(state.stok||[]).length} kalem</td></tr>
        <tr><td style="padding:2px 0;">📅 Randevu</td><td style="text-align:right;">${(state.appointments||[]).length} kayıt</td></tr>
        <tr><td style="padding:2px 0;">⭐ Anket</td><td style="text-align:right;">${(state.anketler||[]).length} kayıt</td></tr>
        <tr><td style="padding:2px 0;">🏗️ Demirbaş</td><td style="text-align:right;">${(state.demirbaslar||[]).length} kalem</td></tr>
      </table>
    </div>

    <p class="section-label">Yedek Geçmişi (${gecmis.length})</p>
    <div class="card p4 mb3">${satirlar}</div>

    <div class="card p4 mb3" style="background:#FFF3E0;border:1px solid #FFB74D;">
      <p style="font-size:11.5px;font-weight:700;color:#E65100;margin:0 0 6px;">💡 Yedek neden hayati?</p>
      <p style="font-size:10.5px;color:#BF360C;margin:0;line-height:1.7;">
        Firebase'de veri bozulursa, hesap kapanırsa veya yanlışlıkla silinirse
        <b class="slide">geri getirmenin tek yolu bu dosyadır.</b><br/><br/>
        <b>Öneri:</b> Haftada bir yedek al, dosyayı <b>Google Drive</b> veya
        <b>WhatsApp'tan kendine gönder</b>. Telefonda tek başına durmasın.
      </p>
    </div>

    <div class="card p4 mb3" style="background:#E3F2FD;border:1px solid #90CAF9;">
      <p style="font-size:11.5px;font-weight:700;color:#0D47A1;margin:0 0 6px;">🔄 Geri yükleme nasıl çalışır?</p>
      <p style="font-size:10.5px;color:#1565C0;margin:0;line-height:1.7;">
        1. Yedek dosyasını seç<br/>
        2. İçerik özetini gör, onayla<br/>
        3. <b>Önce mevcut durum otomatik yedeklenir</b> (geri dönüş şansı)<br/>
        4. Veriler geri yüklenir ve buluta gönderilir
      </p>
    </div>
  `;
}

/* Dosya seçildiğinde doğrudan çağrılır (onchange) */
function yedekDosyaSecildi(inp) {
  const dosya = inp && inp.files && inp.files[0];
  if (!dosya) return;
  yedekYukle(dosya).then((r) => {
    if (r && r.ok) {
      alert("✅ Geri yükleme tamamlandı\n\n" +
        r.ozet.gelir + " gelir, " + r.ozet.gider + " gider, " +
        r.ozet.personel + " personel, " + r.ozet.stok + " stok, " +
        r.ozet.randevu + " randevu geri yüklendi.\n\n" +
        "Sayfayı yenilemeniz önerilir.");
      if (confirm("Sayfa şimdi yenilensin mi?")) location.reload();
    }
  }).catch((err) => {
    alert("❌ Geri yüklenemedi\n\n" + (err && err.message ? err.message : "Bilinmeyen hata"));
  });
}

/* Yedek aksiyonları (accAction içinden çağrılır) */
function yedekAction(action, el) {
  if (action === "yedek-al") { yedekIndir(); render(); return true; }

  if (action === "yedek-yukle-btn") {
    const inp = document.getElementById("yedek-dosya");
    if (inp) inp.click();
    return true;
  }

  if (action === "yedek-dosya-sec") {
    const inp = el || document.getElementById("yedek-dosya");
    const dosya = inp && inp.files && inp.files[0];
    if (!dosya) return true;
    yedekYukle(dosya).then((r) => {
      if (r && r.ok) {
        alert("✅ Geri yükleme tamamlandı\n\n" +
          r.ozet.gelir + " gelir, " + r.ozet.gider + " gider, " +
          r.ozet.personel + " personel, " + r.ozet.stok + " stok, " +
          r.ozet.randevu + " randevu geri yüklendi.\n\n" +
          "Sayfayı yenilemeniz önerilir.");
        if (confirm("Sayfa şimdi yenilensin mi?")) location.reload();
      }
    }).catch((err) => {
      alert("❌ Geri yüklenemedi\n\n" + (err && err.message ? err.message : "Bilinmeyen hata"));
    });
    return true;
  }

  if (action === "yedek-geri-al") {
    const raw = localStorage.getItem("nurdis_geri_alma_yedek");
    if (!raw) { alert("Geri alınacak yedek bulunamadı."); return true; }
    if (!confirm("Son geri yükleme ÖNCESİ hâle dönmek istiyor musunuz?\n\nŞu anki veriler kaybolacak.")) return true;

    try {
      const veri = JSON.parse(raw);
      const blob = new Blob([JSON.stringify(veri)], { type: "application/json" });
      const file = new File([blob], "geri-alma.json", { type: "application/json" });
      yedekYukle(file).then((r) => {
        if (r && r.ok) {
          localStorage.removeItem("nurdis_geri_alma_yedek");
          alert("✅ Önceki hâle dönüldü.");
          location.reload();
        }
      }).catch((e) => alert("Geri alınamadı: " + e.message));
    } catch (e) {
      alert("Geri alma yedeği bozuk: " + e.message);
    }
    return true;
  }

  return false;
}
