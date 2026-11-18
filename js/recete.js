/* =====================================================================
   💊 REÇETE SİSTEMİ — doktor yazar, hasta portalında görür
   =====================================================================
   AKIŞ
   ----
   YÖNETİCİ PANELİ → "Hasta Tedavi Kaydet"
     • "💊 Reçete" bölümü açılır (isteğe bağlı — boş bırakılabilir)
     • Hazır ilaç listesinden tıklayarak eklenir VEYA elle yazılır
     • Her ilaç için: ad, doz (örn. 500 mg), kullanım (örn. günde 3×1),
       süre (örn. 5 gün), açıklama (örn. tok karnına)
     • "Reçeteyi Önizle" → A5 yazdırılabilir reçete çıktısı
     • Tedavi kaydedilirken reçete de aynı kayda yazılır

   HASTA PORTALI → 🦷 Tedaviler
     • Tedavi kartında "💊 Reçete" düğmesi
     • Ayrı "💊 Reçetelerim" sekmesi (tüm reçeteler bir arada)
     • Reçeteyi ekranda görme + PDF/yazdırma + WhatsApp'tan eczaneye gönderme

   VERİ MODELİ (treatment kaydının içinde)
     recete: {
       ilaclar: [{ ad, doz, kullanim, sure, aciklama }],
       tarih: "2026-11-11",
       hekim: "Dt. Ramazan DAĞ",
       not: "Bol sıvı alın…"
     }

   ⚠️ YASAL NOT: Bu modül reçete METNİ oluşturur, e-reçete göndermez.
   Türkiye'de e-reçete (MEDULA/Reçetem) yalnızca yetkili hekimlerce resmi
   sistemden düzenlenir. Buradaki çıktı bilgilendirme amaçlıdır; kullanıcıya
   bu not her reçetede gösterilir.
   ===================================================================== */

/* ---------------------------------------------------------------------
   HAZIR İLAÇ LİSTESİ (diş hekimliğinde en sık yazılanlar)
   ---------------------------------------------------------------------
   Dozlar YETİŞKİN başlangıç dozlarıdır; hekim hastaya göre değiştirebilir.
   Kategori: ağrı kesici / antibiyotik / gargara / diğer
   --------------------------------------------------------------------- */
const RECETE_ILACLAR = [
  /* --- Ağrı kesici / ateş düşürücü --- */
  { ad: "Parasetamol", doz: "500 mg", kullanim: "Günde 3 kez 1 tablet", sure: "3 gün", kategori: "Ağrı kesici" },
  { ad: "Parasetamol", doz: "1 g (1000 mg)", kullanim: "Günde 3 kez 1 tablet", sure: "3 gün", kategori: "Ağrı kesici" },
  { ad: "İbuprofen", doz: "400 mg", kullanim: "Günde 3 kez 1 tablet", sure: "3 gün", kategori: "Ağrı kesici" },
  { ad: "İbuprofen", doz: "600 mg", kullanim: "Günde 2 kez 1 tablet", sure: "3 gün", kategori: "Ağrı kesici" },
  { ad: "Naproksen sodyum", doz: "550 mg", kullanim: "Günde 2 kez 1 tablet", sure: "3 gün", kategori: "Ağrı kesici" },
  { ad: "Diklofenak potasyum", doz: "50 mg", kullanim: "Günde 2-3 kez 1 tablet", sure: "3 gün", kategori: "Ağrı kesici" },
  { ad: "Metamizol sodyum", doz: "500 mg", kullanim: "Günde 3 kez 1 tablet", sure: "2 gün", kategori: "Ağrı kesici" },

  /* --- Antibiyotik --- */
  { ad: "Amoksisilin", doz: "500 mg", kullanim: "Günde 3 kez 1 kapsül", sure: "7 gün", kategori: "Antibiyotik" },
  { ad: "Amoksisilin", doz: "1 g", kullanim: "Günde 2 kez 1 tablet", sure: "7 gün", kategori: "Antibiyotik" },
  { ad: "Amoksisilin + Klavulanik asit", doz: "1000 mg", kullanim: "Günde 2 kez 1 tablet", sure: "7 gün", kategori: "Antibiyotik" },
  { ad: "Amoksisilin + Klavulanik asit", doz: "625 mg", kullanim: "Günde 3 kez 1 tablet", sure: "7 gün", kategori: "Antibiyotik" },
  { ad: "Klindamisin", doz: "300 mg", kullanim: "Günde 4 kez 1 kapsül", sure: "7 gün", kategori: "Antibiyotik", not: "Penisilin alerjisi olanlarda tercih edilir" },
  { ad: "Metronidazol", doz: "500 mg", kullanim: "Günde 3 kez 1 tablet", sure: "5 gün", kategori: "Antibiyotik", not: "Alkol alınmamalıdır" },
  { ad: "Azitromisin", doz: "500 mg", kullanim: "Günde 1 kez 1 tablet", sure: "3 gün", kategori: "Antibiyotik" },
  { ad: "Sefuroksim aksetil", doz: "500 mg", kullanim: "Günde 2 kez 1 tablet", sure: "7 gün", kategori: "Antibiyotik" },
  { ad: "Sefdinir", doz: "300 mg", kullanim: "Günde 2 kez 1 kapsül", sure: "7 gün", kategori: "Antibiyotik" },
  { ad: "Siprofloksasin", doz: "500 mg", kullanim: "Günde 2 kez 1 tablet", sure: "5 gün", kategori: "Antibiyotik" },

  /* --- Gargara / ağız bakımı --- */
  { ad: "Klorheksidin diglukonat", doz: "%0,12 gargara", kullanim: "Günde 2 kez 10 ml, 1 dk gargara", sure: "7 gün", kategori: "Gargara", not: "Yutmadan tükürün" },
  { ad: "Povidon iyot", doz: "%10 gargara", kullanim: "Günde 2-3 kez, sulandırarak gargara", sure: "5 gün", kategori: "Gargara" },
  { ad: "Benzidamin HCl", doz: "Gargara", kullanim: "Günde 3-4 kez gargara", sure: "5 gün", kategori: "Gargara" },
  { ad: "Hidrojen peroksit", doz: "%1,5 gargara", kullanim: "Günde 2 kez 15 ml gargara", sure: "5 gün", kategori: "Gargara" },

  /* --- Ödem / antialerjik --- */
  { ad: "Dekspantenol + Klorheksidin jel", doz: "Jel", kullanim: "Günde 2-3 kez bölgeye uygulama", sure: "7 gün", kategori: "Diğer" },
  { ad: "Setirizin", doz: "10 mg", kullanim: "Günde 1 kez 1 tablet (gece)", sure: "5 gün", kategori: "Diğer" },
  { ad: "Prednizolon", doz: "5 mg", kullanim: "Günde 2 kez 1 tablet", sure: "3 gün", kategori: "Diğer", not: "Hekim kontrolünde kullanılmalı" },

  /* --- Mide koruyucu (antibiyotik/NSAİ ile birlikte) --- */
  { ad: "Pantoprazol", doz: "40 mg", kullanim: "Günde 1 kez 1 tablet (aç karnına)", sure: "7 gün", kategori: "Mide koruyucu" },
  { ad: "Omeprazol", doz: "20 mg", kullanim: "Günde 1 kez 1 kapsül (aç karnına)", sure: "7 gün", kategori: "Mide koruyucu" },

  /* --- Lokal / topikal --- */
  { ad: "Lidokain jel", doz: "%2 jel", kullanim: "Günde 2-3 kez bölgeye", sure: "5 gün", kategori: "Diğer" },
  { ad: "Tuzlu su / serum fizyolojik", doz: "Gargara", kullanim: "Günde 4-5 kez gargara", sure: "5 gün", kategori: "Gargara" }
];

const RECETE_KATEGORILER = ["Ağrı kesici", "Antibiyotik", "Gargara", "Mide koruyucu", "Diğer"];

/* ---------------------------------------------------------------------
   TEDAVİYE GÖRE HAZIR REÇETE ŞABLONLARI
   ---------------------------------------------------------------------
   Doktor "Kanal Tedavisi" seçtiğinde tek tuşla mantıklı bir reçete gelir;
   sonra istediği gibi değiştirir.
   --------------------------------------------------------------------- */
const RECETE_SABLONLARI = {
  "Diş Çekimi": ["Amoksisilin + Klavulanik asit|1000 mg", "Parasetamol|500 mg", "Klorheksidin diglukonat|%0,12 gargara"],
  "Cerrahi Çekim": ["Amoksisilin + Klavulanik asit|1000 mg", "Parasetamol|500 mg", "Klorheksidin diglukonat|%0,12 gargara", "Metronidazol|500 mg"],
  "Kanal Tedavisi": ["Amoksisilin|500 mg", "İbuprofen|400 mg", "Klorheksidin diglukonat|%0,12 gargara"],
  "İmplant": ["Amoksisilin + Klavulanik asit|1000 mg", "İbuprofen|600 mg", "Klorheksidin diglukonat|%0,12 gargara", "Pantoprazol|40 mg"],
  "Dolgu": ["Parasetamol|500 mg"],
  "Diş Taşı Temizliği": ["Klorheksidin diglukonat|%0,12 gargara"],
  "Diş Beyazlatma": ["Parasetamol|500 mg", "Lidokain jel|%2 jel"],
  "Zirkonyum Kaplama": ["İbuprofen|400 mg", "Klorheksidin diglukonat|%0,12 gargara"],
  "Protez": ["Parasetamol|500 mg", "Klorheksidin diglukonat|%0,12 gargara"],
  "Ortodonti": ["Parasetamol|500 mg", "Benzidamin HCl|Gargara"],
  "Şeffaf Plak": ["Parasetamol|500 mg"],
  "Lamine Veneer": ["İbuprofen|400 mg"],
  "Köprü": ["İbuprofen|400 mg", "Klorheksidin diglukonat|%0,12 gargara"],
  "Muayene": []
};

/* ---------------------------------------------------------------------
   YARDIMCILAR
   --------------------------------------------------------------------- */
function receteIlacBul(ad, doz) {
  return RECETE_ILACLAR.find((i) => i.ad === ad && i.doz === (doz || i.doz)) ||
         RECETE_ILACLAR.find((i) => i.ad === ad) || null;
}

function receteVarMi(t) {
  return !!(t && t.recete && Array.isArray(t.recete.ilaclar) && t.recete.ilaclar.length);
}

/* Doktorun şu an yazdığı reçete (state üzerinde tutulur) */
function receteTaslak() {
  if (!Array.isArray(state.receteTaslak)) state.receteTaslak = [];
  return state.receteTaslak;
}

/* ---------------------------------------------------------------------
   YÖNETİCİ FORMU — REÇETE BÖLÜMÜ
   --------------------------------------------------------------------- */
function receteFormuHTML() {
  const ilaclar = receteTaslak();
  const kat = state.receteKategori || "Ağrı kesici";

  const kategoriChipler = RECETE_KATEGORILER.map((k) => `
    <button data-action="recete-kategori" data-k="${k}"
      style="flex-shrink:0;padding:5px 11px;border-radius:99px;border:1px solid ${kat === k ? "#7B1FA2" : "var(--line)"};
      background:${kat === k ? "#7B1FA2" : "var(--surface)"};color:${kat === k ? "#fff" : "var(--muted)"};
      font-family:inherit;font-size:10px;font-weight:700;cursor:pointer;white-space:nowrap;">${k}</button>`).join("");

  const ilacButonlari = RECETE_ILACLAR
    .filter((i) => i.kategori === kat)
    .map((i) => `
      <button data-action="recete-ilac-ekle" data-ad="${escapeAttr(i.ad)}" data-doz="${escapeAttr(i.doz)}"
        style="width:100%;text-align:left;padding:8px 10px;border-radius:9px;border:1px solid #E1BEE7;background:#fff;
        font-family:inherit;font-size:10.5px;cursor:pointer;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center;gap:6px;">
        <span style="min-width:0;">
          <b style="color:#4A148C;">${escapeHtml(i.ad)}</b>
          <span style="color:#7B1FA2;"> ${escapeHtml(i.doz)}</span>
          <span style="display:block;color:#888;font-size:9px;margin-top:1px;">${escapeHtml(i.kullanim)} · ${escapeHtml(i.sure)}</span>
        </span>
        <span style="color:#7B1FA2;font-size:14px;font-weight:800;flex-shrink:0;">+</span>
      </button>`).join("");

  const yazilanlar = ilaclar.length ? ilaclar.map((x, i) => `
    <div style="background:#fff;border:1px solid #CE93D8;border-radius:10px;padding:9px 11px;margin-bottom:6px;">
      <div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start;">
        <div style="flex:1;min-width:0;">
          <p style="margin:0;font-size:11.5px;font-weight:800;color:#4A148C;">${i + 1}. ${escapeHtml(x.ad)} <span style="font-weight:600;color:#7B1FA2;">${escapeHtml(x.doz || "")}</span></p>
          <p style="margin:2px 0 0;font-size:10px;color:#555;line-height:1.5;">${escapeHtml(x.kullanim || "")}${x.sure ? " · " + escapeHtml(x.sure) : ""}</p>
          ${x.aciklama ? `<p style="margin:2px 0 0;font-size:9.5px;color:#888;">ℹ️ ${escapeHtml(x.aciklama)}</p>` : ""}
        </div>
        <button data-action="recete-ilac-sil" data-i="${i}"
          style="width:24px;height:24px;border-radius:50%;border:none;background:#FFEBEE;color:#C62828;font-size:14px;
          line-height:1;cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center;">×</button>
      </div>
    </div>`).join("") : `<p style="margin:0;font-size:10.5px;color:#888;text-align:center;padding:8px;">Henüz ilaç eklenmedi.</p>`;

  return `
  <div class="card p4 mb3" style="background:linear-gradient(135deg,#F3E5F5,#EDE7F6);border:1px solid #CE93D8;">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:4px;">
      <p style="font-size:13.5px;font-weight:800;margin:0;color:#4A148C;">💊 Reçete</p>
      <span style="font-size:9px;background:#7B1FA2;color:#fff;padding:2px 8px;border-radius:99px;font-weight:800;">İSTEĞE BAĞLI</span>
    </div>
    <p style="font-size:10px;color:#6A1B9A;margin:0 0 10px;line-height:1.55;">
      İlaç seç → tedaviyle birlikte kaydedilir, hasta portalında görünür ve yazdırılabilir.
    </p>

    ${ilaclar.length ? `<div style="margin-bottom:9px;">${yazilanlar}</div>` : ""}

    <div style="background:#fff;border-radius:10px;padding:9px;margin-bottom:8px;">
      <p style="margin:0 0 6px;font-size:9.5px;font-weight:800;color:#7B1FA2;letter-spacing:.03em;">HAZIR İLAÇ LİSTESİ</p>
      <div style="display:flex;gap:5px;overflow-x:auto;padding-bottom:6px;margin-bottom:6px;">${kategoriChipler}</div>
      <div style="max-height:200px;overflow-y:auto;">${ilacButonlari}</div>
    </div>

    <details style="margin-bottom:8px;">
      <summary style="font-size:10.5px;font-weight:700;color:#6A1B9A;cursor:pointer;padding:4px 0;">✏️ Listede olmayan ilacı elle yaz</summary>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-top:6px;">
        <input class="input" id="rec-elle-ad" placeholder="İlaç adı" style="font-size:10.5px;" />
        <input class="input" id="rec-elle-doz" placeholder="Doz (500 mg)" style="font-size:10.5px;" />
        <input class="input" id="rec-elle-kullanim" placeholder="Kullanım (günde 3×1)" style="font-size:10.5px;" />
        <input class="input" id="rec-elle-sure" placeholder="Süre (7 gün)" style="font-size:10.5px;" />
      </div>
      <input class="input" id="rec-elle-aciklama" placeholder="Açıklama (tok karnına…)" style="font-size:10.5px;margin-top:5px;" />
      <button class="btn-primary" style="width:100%;margin-top:6px;background:#7B1FA2;font-size:11px;padding:8px;" data-action="recete-elle-ekle">+ Reçeteye Ekle</button>
    </details>

    <div class="field" style="margin:0;">
      <label style="font-size:10.5px;">Reçete notu (isteğe bağlı)</label>
      <textarea id="rec-not" placeholder="Örn: İlaçları tok karnına alın, bol sıvı tüketin. 7 gün sonra kontrol."
        style="width:100%;min-height:52px;font-size:10.5px;padding:8px;border:1px solid var(--line);border-radius:8px;font-family:inherit;line-height:1.5;resize:vertical;">${escapeHtml(state.receteNot || "")}</textarea>
    </div>

    <div style="display:flex;gap:6px;margin-top:8px;">
      <button class="btn-primary" style="flex:1;background:#4A148C;font-size:11px;padding:9px;" data-action="recete-onizle">👁 Reçeteyi Önizle</button>
      <button class="btn-primary" style="flex:1;background:#fff;color:#7B1FA2;border:1px solid #CE93D8;font-size:11px;padding:9px;" data-action="recete-sablon">⚡ Hazır Şablon</button>
    </div>
    ${ilaclar.length ? `<button class="linklike" style="margin-top:8px;font-size:10px;color:#C62828;" data-action="recete-temizle">🗑 Reçeteyi temizle</button>` : ""}
  </div>`;
}

/* ---------------------------------------------------------------------
   REÇETE ÇIKTISI (yazdırılabilir HTML)
   --------------------------------------------------------------------- */
function receteYazdirilabilir(recete, hastaAdi, tedaviAdi, tarih) {
  const hekim = "Dt. Ramazan DAĞ";
  const ilacSatirlari = (recete.ilaclar || []).map((x, i) => `
    <tr>
      <td style="padding:7px 8px;border-bottom:1px solid #DDD;font-size:12px;vertical-align:top;width:22px;">${i + 1}</td>
      <td style="padding:7px 8px;border-bottom:1px solid #DDD;font-size:12px;vertical-align:top;">
        <b>${escapeHtml(x.ad || "")}</b> ${escapeHtml(x.doz || "")}
        ${x.aciklama ? `<div style="font-size:10px;color:#666;margin-top:2px;">${escapeHtml(x.aciklama)}</div>` : ""}
      </td>
      <td style="padding:7px 8px;border-bottom:1px solid #DDD;font-size:11.5px;vertical-align:top;">${escapeHtml(x.kullanim || "")}</td>
      <td style="padding:7px 8px;border-bottom:1px solid #DDD;font-size:11.5px;vertical-align:top;white-space:nowrap;">${escapeHtml(x.sure || "")}</td>
    </tr>`).join("");

  return `<!DOCTYPE html>
<html lang="tr"><head><meta charset="utf-8" />
<title>Reçete — ${escapeHtml(hastaAdi || "")}</title>
<style>
  @page { size: A5; margin: 12mm; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color:#222; margin:0; padding:14px; }
  .baslik { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2.5px solid #0B6E86; padding-bottom:9px; margin-bottom:12px; }
  .klinik { font-size:16px; font-weight:800; color:#0B6E86; margin:0; }
  .alt { font-size:9.5px; color:#666; margin:2px 0 0; line-height:1.5; }
  .rx { font-size:26px; font-weight:800; color:#0B6E86; }
  table { width:100%; border-collapse:collapse; margin-top:6px; }
  th { text-align:left; font-size:9.5px; text-transform:uppercase; letter-spacing:.05em; color:#666;
       border-bottom:1.5px solid #0B6E86; padding:5px 8px; }
  .not { margin-top:12px; background:#F5F5F5; border-left:3px solid #0B6E86; padding:8px 10px; font-size:10.5px; line-height:1.55; }
  .imza { margin-top:26px; text-align:right; font-size:11px; }
  .imza .cizgi { border-top:1px solid #666; width:150px; margin-left:auto; margin-bottom:4px; }
  .uyari { margin-top:14px; font-size:8.5px; color:#888; line-height:1.5; border-top:1px dashed #CCC; padding-top:8px; }
</style></head>
<body>
  <div class="baslik">
    <div>
      <p class="klinik">Nur Diş &amp; Dental Klinik</p>
      <p class="alt">Mardin, Kızıltepe, TOKİ Mah. · Tel: 0505 105 03 02<br/>nurdisdentalklinik@gmail.com</p>
    </div>
    <div class="rx">℞</div>
  </div>

  <table style="margin-bottom:10px;">
    <tr>
      <td style="font-size:11px;padding:2px 0;"><b>Hasta:</b> ${escapeHtml(hastaAdi || "")}</td>
      <td style="font-size:11px;padding:2px 0;text-align:right;"><b>Tarih:</b> ${escapeHtml(tarih || "")}</td>
    </tr>
    <tr>
      <td style="font-size:11px;padding:2px 0;"><b>Tedavi:</b> ${escapeHtml(tedaviAdi || "")}</td>
      <td style="font-size:11px;padding:2px 0;text-align:right;"><b>Hekim:</b> ${escapeHtml(hekim)}</td>
    </tr>
  </table>

  <table>
    <thead><tr><th>#</th><th>İlaç</th><th>Kullanım</th><th>Süre</th></tr></thead>
    <tbody>${ilacSatirlari || `<tr><td colspan="4" style="padding:10px;font-size:11px;color:#888;">İlaç eklenmedi.</td></tr>`}</tbody>
  </table>

  ${recete.not ? `<div class="not"><b>Hekim notu:</b> ${escapeHtml(recete.not)}</div>` : ""}

  <div class="imza"><div class="cizgi"></div>${escapeHtml(hekim)}</div>

  <div class="uyari">
    Bu belge bilgilendirme amaçlıdır; resmî e-reçete yerine geçmez.
    İlaçları eczaneden alırken bu belgeyi gösteriniz. Dozları değiştirmeyiniz; yan etki görürseniz hekiminize başvurunuz.
  </div>
</body></html>`;
}

/* Yazdırma penceresi aç */
function receteYazdir(recete, hastaAdi, tedaviAdi, tarih) {
  const html = receteYazdirilabilir(recete, hastaAdi, tedaviAdi, tarih);
  const w = window.open("", "_blank");
  if (!w) { alert("Yazdırma penceresi engellendi.\n\nLütfen tarayıcı ayarlarından açılır pencerelere izin verin."); return; }
  w.document.write(html);
  w.document.close();
  setTimeout(() => { try { w.focus(); w.print(); } catch (e) {} }, 400);
}

/* ---------------------------------------------------------------------
   DOKTOR PANELİ — "REÇETELER" LİSTESİ
   ---------------------------------------------------------------------
   Yazılan tüm reçeteler tek yerde; hekim istediği zaman yeniden yazdırır.
   --------------------------------------------------------------------- */
function recetelerListesiHTML() {
  const receteliler = (state.treatments || []).filter(receteVarMi).slice().reverse();

  if (!receteliler.length) {
    return `<div class="card p4" style="text-align:center;">
      <p style="font-size:30px;margin:0 0 8px;">💊</p>
      <p style="font-size:12.5px;font-weight:700;margin:0 0 4px;">Henüz reçete yazılmadı</p>
      <p class="footnote" style="margin:0;">Tedavi kaydederken alttaki "💊 Reçete" bölümünden ilaç seçebilirsiniz.</p>
    </div>`;
  }

  return `<p class="section-label">💊 Yazılan Reçeteler (${receteliler.length})</p>
  ${receteliler.map(t => `
    <div class="card p3 mb2" style="border-left:3px solid #7B1FA2;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
        <div style="flex:1;min-width:0;">
          <p style="font-size:12.5px;font-weight:700;margin:0;">${escapeHtml(t.userName || "Bilinmeyen hasta")}</p>
          <p style="font-size:10.5px;color:var(--muted);margin:2px 0 0;">
            🦷 ${escapeHtml(t.treatmentName || "")} · 📅 ${escapeHtml(t.recete.tarih || t.date || "")}
          </p>
          <p style="font-size:10.5px;color:#6A1B9A;margin:4px 0 0;line-height:1.5;">
            💊 ${(t.recete.ilaclar || []).map(x => escapeHtml(x.ad || "")).join(", ")}
          </p>
          ${t.uid
            ? `<p style="font-size:9px;color:#2E7D32;margin:3px 0 0;">✓ Hasta portalında görünüyor</p>`
            : `<p style="font-size:9px;color:#E65100;margin:3px 0 0;">⚠ Hasta hesabı eşleşmedi — sadece yazdırılabilir</p>`}
        </div>
        <div style="display:flex;flex-direction:column;gap:4px;flex-shrink:0;">
          <button data-action="recete-listeyazdir" data-id="${escapeAttr(t.id)}"
            style="background:#4A148C;color:#fff;border:none;border-radius:7px;padding:6px 10px;font-family:inherit;
            font-size:10px;font-weight:800;cursor:pointer;white-space:nowrap;">🖨️ Yazdır</button>
          <button data-action="recete-listesil" data-id="${escapeAttr(t.id)}"
            style="background:#FFF3E0;color:#E65100;border:none;border-radius:7px;padding:5px 10px;font-family:inherit;
            font-size:9.5px;cursor:pointer;">Reçeteyi sil</button>
        </div>
      </div>
    </div>`).join("")}`;
}

/* Kayıtlı hasta seçimi (portal eşleşmesi için) */
function hastaSelectHTML() {
  const rehber = hastaRehberi();
  if (!rehber.length) return `<input type="hidden" id="tr-uid" value="" />`;
  return `<select class="input" id="tr-uid" style="grid-column:1/-1;font-size:10.5px;">
    <option value="">👤 Hasta hesabı seç (portalda görünsün)</option>
    ${rehber.map(h => `<option value="${escapeAttr(h.uid)}">${escapeHtml(h.ad)}${h.tel ? " — " + escapeHtml(h.tel) : ""}</option>`).join("")}
  </select>`;
}

/* ---------------------------------------------------------------------
   KAYITLI HASTA REHBERİ
   ---------------------------------------------------------------------
   Reçetenin hasta portalında görünmesi için tedavi kaydında hastanın
   uid'si olmalı. Rehber iki kaynaktan beslenir:
     • Geçmiş tedavi kayıtları (uid taşıyanlar)
     • Mağaza siparişleri (ad + telefon)
   Gizlilik: portal tarafı YALNIZCA kendi uid'sini görür; bu rehber
   yalnızca doktor panelinde, zaten tüm tedavi kayıtlarını gören
   yönetici oturumunda oluşturulur.
   --------------------------------------------------------------------- */
function hastaRehberi() {
  if (Array.isArray(state.hastaRehberi) && state.hastaRehberi.length) return state.hastaRehberi;
  const harita = new Map();

  (state.treatments || []).forEach((t) => {
    if (!t || !t.uid || !t.userName) return;
    if (!harita.has(t.uid)) harita.set(t.uid, { uid: t.uid, ad: t.userName, tel: "" });
  });

  (state.orders || []).forEach((o) => {
    if (!o || !o.uid) return;
    const ad = (o.name || "").trim();
    if (!ad) return;
    if (!harita.has(o.uid)) harita.set(o.uid, { uid: o.uid, ad, tel: (o.phone || "").replace(/\D/g, "") });
  });

  state.hastaRehberi = Array.from(harita.values()).sort((a, b) => a.ad.localeCompare(b.ad, "tr"));
  return state.hastaRehberi;
}

/* İsme göre rehberde TEK eşleşme var mı? (reçeteyi portala bağlamak için) */
function hastaIsimdenBul(ad) {
  const hedef = String(ad || "").trim().toLocaleLowerCase("tr");
  if (!hedef) return null;
  const esles = hastaRehberi().filter(h => String(h.ad || "").trim().toLocaleLowerCase("tr") === hedef);
  return esles.length === 1 ? esles[0] : null;
}

/* Tedavi kaydı listesinde reçete özeti (doktor tarafı) */
function receteOzetHTML(t) {
  if (!receteVarMi(t)) return "";
  const adlar = (t.recete.ilaclar || []).map(x => escapeHtml(x.ad || "")).join(", ");
  return `<div style="margin-top:6px;background:#F3E5F5;border:1px solid #CE93D8;border-radius:7px;padding:6px 9px;">
    <p style="font-size:10.5px;color:#4A148C;margin:0;line-height:1.5;"><b>💊 Reçete:</b> ${adlar}</p>
    <button data-action="recete-listeyazdir" data-id="${escapeAttr(t.id)}"
      style="margin-top:4px;background:#7B1FA2;color:#fff;border:none;border-radius:6px;padding:3px 9px;
      font-family:inherit;font-size:9.5px;font-weight:700;cursor:pointer;">🖨️ Reçeteyi Yazdır</button>
  </div>`;
}

/* ---------------------------------------------------------------------
   HASTA PORTALI — REÇETE KARTI
   --------------------------------------------------------------------- */
function receteKartiHTML(t) {
  if (!receteVarMi(t)) return "";
  const ilaclar = t.recete.ilaclar || [];
  return `
  <div style="margin-top:6px;background:linear-gradient(135deg,#F3E5F5,#EDE7F6);border:1px solid #CE93D8;border-radius:9px;padding:8px 10px;">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;">
      <p style="margin:0;font-size:10.5px;font-weight:800;color:#4A148C;">💊 Reçete (${ilaclar.length} ilaç)</p>
      <button data-action="portal-recete-ac" data-id="${escapeAttr(t.id)}"
        style="background:#7B1FA2;color:#fff;border:none;border-radius:7px;padding:4px 10px;font-family:inherit;
        font-size:9.5px;font-weight:800;cursor:pointer;">Görüntüle</button>
    </div>
    <p style="margin:4px 0 0;font-size:9.5px;color:#6A1B9A;line-height:1.5;">
      ${ilaclar.slice(0, 3).map(x => escapeHtml(x.ad || "")).join(", ")}${ilaclar.length > 3 ? "…" : ""}
    </p>
  </div>`;
}

/* Hasta portalı — reçete tam ekran */
function portalReceteHTML() {
  const tedaviler = (typeof hastaTedavileri === "function") ? hastaTedavileri() : [];
  const t = tedaviler.find((x) => x.id === state.portalReceteId);

  if (!t || !receteVarMi(t)) {
    return `${topbar("Reçetem", "Reçete bulunamadı", { back: "portal" })}
      <div class="content"><div class="card p4"><p class="desc" style="margin:0;">Bu reçete bulunamadı veya kaldırılmış.</p></div></div>`;
  }

  const r = t.recete;
  const satirlar = (r.ilaclar || []).map((x, i) => `
    <div style="background:#fff;border-radius:10px;padding:10px 12px;margin-bottom:7px;border-left:3px solid #7B1FA2;">
      <p style="margin:0;font-size:12.5px;font-weight:800;color:#4A148C;">${i + 1}. ${escapeHtml(x.ad || "")} <span style="font-weight:600;color:#7B1FA2;">${escapeHtml(x.doz || "")}</span></p>
      <p style="margin:3px 0 0;font-size:11.5px;color:#333;">🕐 ${escapeHtml(x.kullanim || "")}${x.sure ? ` · ⏳ ${escapeHtml(x.sure)}` : ""}</p>
      ${x.aciklama ? `<p style="margin:3px 0 0;font-size:10.5px;color:#777;">ℹ️ ${escapeHtml(x.aciklama)}</p>` : ""}
    </div>`).join("");

  return `${topbar("Reçetem", t.treatmentName || "Tedavi", { back: "portal" })}
    <div class="content">
      <div class="card p4 mb3" style="background:linear-gradient(135deg,#4A148C,#7B1FA2);color:#fff;border:none;">
        <p style="margin:0 0 3px;font-size:16px;">℞</p>
        <p style="margin:0;font-size:14px;font-weight:800;">${escapeHtml(t.treatmentName || "Tedavi")}</p>
        <p style="margin:3px 0 0;font-size:11px;opacity:.9;">
          📅 ${typeof accTarihTR === "function" ? accTarihTR(r.tarih || t.date) : (r.tarih || t.date || "")}
          · 👨‍⚕️ ${escapeHtml(r.hekim || "Dt. Ramazan DAĞ")}
        </p>
      </div>

      <p class="section-label">İlaçlar (${(r.ilaclar || []).length})</p>
      ${satirlar || `<p class="footnote">İlaç kaydı yok.</p>`}

      ${r.not ? `<div class="card p3 mb3" style="background:#FFF8E1;border:1px solid #FFE082;">
        <p style="margin:0 0 3px;font-size:10px;font-weight:800;color:#F57F17;">👨‍⚕️ HEKİM NOTU</p>
        <p style="margin:0;font-size:11.5px;line-height:1.65;color:#5D4037;">${escapeHtml(r.not)}</p>
      </div>` : ""}

      <div style="display:flex;gap:7px;margin-bottom:9px;">
        <button class="btn-primary" style="flex:1;background:#4A148C;font-size:12px;padding:11px;" data-action="portal-recete-yazdir" data-id="${escapeAttr(t.id)}">🖨️ Yazdır / PDF</button>
        <a href="https://wa.me/?text=${encodeURIComponent("Nur Diş & Dental Klinik reçetem:\n\n" + (r.ilaclar || []).map((x, i) => (i + 1) + ". " + x.ad + " " + (x.doz || "") + " — " + (x.kullanim || "") + (x.sure ? " (" + x.sure + ")" : "")).join("\n") + (r.not ? "\n\nNot: " + r.not : ""))}"
          target="_blank" rel="noopener"
          style="flex:1;text-align:center;padding:11px;border-radius:10px;background:#25D366;color:#fff;font-size:12px;font-weight:700;text-decoration:none;">💬 Eczaneye Gönder</a>
      </div>

      <div class="card p3 mb3" style="background:var(--bg);border-color:var(--line);">
        <p style="margin:0;font-size:10px;color:var(--muted);line-height:1.65;">
          ⚠️ Bu belge bilgilendirme amaçlıdır; resmî e-reçete yerine geçmez.
          İlaçları eczaneden alırken bu belgeyi gösteriniz. Dozları değiştirmeyiniz; yan etki görürseniz kliniğimizi arayınız (0505 105 03 02).
        </p>
      </div>

      <button class="btn-primary" style="width:100%;background:var(--surface);color:var(--ink);border:1px solid var(--line);font-size:12px;padding:11px;"
        data-action="portal-git" data-tab="tedaviler">← Tedavilerime dön</button>
    </div>`;
}

/* Hasta portalı — TÜM reçeteler listesi */
function portalRecetelerHTML() {
  const tedaviler = (typeof hastaTedavileri === "function") ? hastaTedavileri() : [];
  const receteliler = tedaviler.filter(receteVarMi);

  if (!receteliler.length) {
    return `<div class="card p4" style="text-align:center;padding:26px 18px;">
      <p style="font-size:34px;margin:0 0 8px;">💊</p>
      <p style="font-size:13px;font-weight:700;margin:0 0 5px;">Henüz reçeteniz yok</p>
      <p class="desc" style="margin:0;font-size:11px;line-height:1.6;">Tedaviniz sonrası hekiminiz reçete yazdığında burada görünecek.</p>
    </div>`;
  }

  return receteliler.map((t) => `
    <div class="card p3 mb2" style="border-left:3px solid #7B1FA2;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
        <div style="flex:1;min-width:0;">
          <p style="margin:0;font-size:12.5px;font-weight:700;">🦷 ${escapeHtml(t.treatmentName || "Tedavi")}</p>
          <p style="margin:2px 0 0;font-size:10px;color:var(--muted);">
            📅 ${typeof accTarihTR === "function" ? accTarihTR(t.recete.tarih || t.date) : (t.recete.tarih || t.date || "")}
            · 💊 ${(t.recete.ilaclar || []).length} ilaç
          </p>
          <p style="margin:4px 0 0;font-size:10.5px;color:#6A1B9A;line-height:1.5;">
            ${(t.recete.ilaclar || []).slice(0, 3).map(x => escapeHtml(x.ad || "")).join(", ")}${(t.recete.ilaclar || []).length > 3 ? "…" : ""}
          </p>
        </div>
        <button data-action="portal-recete-ac" data-id="${escapeAttr(t.id)}"
          style="background:#7B1FA2;color:#fff;border:none;border-radius:8px;padding:7px 11px;font-family:inherit;
          font-size:10.5px;font-weight:800;cursor:pointer;flex-shrink:0;">Aç</button>
      </div>
    </div>`).join("");
}

/* ---------------------------------------------------------------------
   OLAYLAR
   --------------------------------------------------------------------- */
/* ---------------------------------------------------------------------
   FORM HAFIZASI
   ---------------------------------------------------------------------
   İlaç ekleyince render() çalışıyor ve form sıfırlanıyordu: doktor hasta
   adını, tarihi, notu yeniden yazmak zorunda kalıyordu. Doktor formundaki
   tüm alanlar aşağıdaki listede tutulur ve her çizimde geri doldurulur.
   --------------------------------------------------------------------- */
const RECETE_FORM_ALANLARI = ["tr-user", "tr-name", "tr-date", "tr-payment", "tr-patient-type", "tr-notes", "tr-uid"];

function receteFormHatirla() {
  if (!state.receteForm) state.receteForm = {};
  RECETE_FORM_ALANLARI.forEach((id) => {
    const el = document.getElementById(id);
    if (el) state.receteForm[id] = el.value;
  });
  const notEl = document.getElementById("rec-not");
  if (notEl) state.receteNot = notEl.value;
}

function receteFormGeriYukle() {
  const f = state.receteForm || {};
  Object.keys(f).forEach((id) => {
    const el = document.getElementById(id);
    if (el && el.value !== f[id]) el.value = f[id];
  });
  const notEl = document.getElementById("rec-not");
  if (notEl && state.receteNot && notEl.value !== state.receteNot) notEl.value = state.receteNot;
}

function receteAction(el, action) {
  /* --- Doktor tarafı --- */
  if (action === "recete-kategori") {
    receteFormHatirla();
    state.receteKategori = el.dataset.k;
    render();
    receteFormGeriYukle();
    return true;
  }

  if (action === "recete-ilac-ekle") {
    receteFormHatirla();
    const tam = receteIlacBul(el.dataset.ad, el.dataset.doz);
    const t = receteTaslak();
    /* Aynı ilaç + doz zaten yazıldıysa ikinci kez eklenmez */
    if (t.some(x => x.ad === el.dataset.ad && x.doz === (el.dataset.doz || (tam ? tam.doz : "")))) {
      if (typeof showNotif === "function") showNotif("ℹ️ Zaten ekli", el.dataset.ad + " reçetede var.");
      return true;
    }
    t.push({
      ad: el.dataset.ad,
      doz: el.dataset.doz || (tam ? tam.doz : ""),
      kullanim: tam ? tam.kullanim : "",
      sure: tam ? tam.sure : "",
      aciklama: tam && tam.not ? tam.not : ""
    });
    render();
    receteFormGeriYukle();
    return true;
  }

  if (action === "recete-elle-ekle") {
    receteFormHatirla();
    const ad = (document.getElementById("rec-elle-ad")?.value || "").trim();
    if (!ad) { alert("İlaç adı girin."); return true; }
    receteTaslak().push({
      ad,
      doz: (document.getElementById("rec-elle-doz")?.value || "").trim(),
      kullanim: (document.getElementById("rec-elle-kullanim")?.value || "").trim(),
      sure: (document.getElementById("rec-elle-sure")?.value || "").trim(),
      aciklama: (document.getElementById("rec-elle-aciklama")?.value || "").trim()
    });
    render();
    receteFormGeriYukle();
    return true;
  }

  if (action === "recete-ilac-sil") {
    receteFormHatirla();
    const i = parseInt(el.dataset.i, 10) || 0;
    receteTaslak().splice(i, 1);
    render();
    receteFormGeriYukle();
    return true;
  }

  if (action === "recete-temizle") {
    if (!confirm("Reçetedeki tüm ilaçlar silinsin mi?")) return true;
    receteFormHatirla();
    state.receteTaslak = [];
    state.receteNot = "";
    const notEl = document.getElementById("rec-not");
    if (notEl) notEl.value = "";
    render();
    receteFormGeriYukle();
    return true;
  }

  if (action === "recete-sablon") {
    receteFormHatirla();
    const tedavi = (document.getElementById("tr-name")?.value) || state.receteForm?.["tr-name"] || "";
    const sablon = RECETE_SABLONLARI[tedavi];
    if (!sablon || !sablon.length) {
      alert("«" + (tedavi || "Bu tedavi") + "» için hazır şablon yok.\n\nİlaçları listeden tek tek seçebilirsin.");
      return true;
    }
    const mevcut = receteTaslak();
    let eklenen = 0, atlanan = 0;
    sablon.forEach((kod) => {
      const [ad, doz] = kod.split("|");
      const tam = receteIlacBul(ad, doz);
      if (!tam) return;
      /* Zaten yazılmış ilaç varsa tekrar eklenmez */
      if (mevcut.some(x => x.ad === tam.ad && x.doz === tam.doz)) { atlanan++; return; }
      eklenen++;
      mevcut.push({
        ad: tam.ad, doz: tam.doz, kullanim: tam.kullanim, sure: tam.sure,
        aciklama: tam.not || ""
      });
    });
    render();
    receteFormGeriYukle();
    if (typeof showNotif === "function") {
      showNotif("⚡ Şablon uygulandı",
        "«" + tedavi + "» için " + eklenen + " ilaç eklendi" + (atlanan ? " (" + atlanan + " zaten vardı)" : "") + ".");
    }
    return true;
  }

  if (action === "recete-onizle") {
    const ilaclar = receteTaslak();
    if (!ilaclar.length) { alert("Önce reçeteye ilaç ekleyin."); return true; }
    const hasta = (document.getElementById("tr-user")?.value || "").trim() || "Hasta";
    const tedavi = (document.getElementById("tr-name")?.value || "").trim();
    const tarih = (document.getElementById("tr-date")?.value || "") || new Date().toISOString().slice(0, 10);
    const not = (document.getElementById("rec-not")?.value || "").trim();
    receteYazdir({ ilaclar, not, hekim: "Dt. Ramazan DAĞ", tarih }, hasta, tedavi, tarih);
    return true;
  }

  /* --- Doktor: reçete listesinden yazdır / sil --- */
  if (action === "recete-listeyazdir") {
    const t = (state.treatments || []).find(x => x.id === el.dataset.id);
    if (!t || !receteVarMi(t)) { alert("Reçete bulunamadı."); return true; }
    receteYazdir(t.recete, t.userName, t.treatmentName, t.recete.tarih || t.date);
    return true;
  }

  if (action === "recete-listesil") {
    if (!confirm("Bu reçete silinsin mi? Tedavi ve fatura kaydı korunur.")) return true;
    const id = el.dataset.id;
    const t = (state.treatments || []).find(x => x.id === id);
    if (!t) return true;
    if (window.fb && state.fbReady && window.fb.updateTreatment) {
      window.fb.updateTreatment(id, { recete: null })
        .then(() => render())
        .catch(() => alert("Silinemedi."));
    } else {
      t.recete = null;
      render();
    }
    return true;
  }

  /* --- Hasta portalı --- */
  if (action === "portal-recete-ac") {
    state.portalReceteId = el.dataset.id;
    state.screen = "portal-recete";
    render();
    window.scrollTo(0, 0);
    return true;
  }

  if (action === "portal-recete-yazdir") {
    const tedaviler = (typeof hastaTedavileri === "function") ? hastaTedavileri() : [];
    const t = tedaviler.find((x) => x.id === el.dataset.id);
    if (!t || !receteVarMi(t)) return true;
    const ad = (state.userProfile && state.userProfile.firstName)
      ? (state.userProfile.firstName + " " + (state.userProfile.lastName || "")).trim()
      : (state.user && state.user.name) || "Hasta";
    receteYazdir(t.recete, ad, t.treatmentName, t.recete.tarih || t.date);
    return true;
  }

  return false;
}

/* Reçete notu canlı takip */
document.addEventListener("input", function (e) {
  if (e.target && e.target.id === "rec-not") state.receteNot = e.target.value;
}, true);
