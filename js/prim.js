/* =========================================================
   NUR DİŞ — PRİM & ANALİZ — prim, verimlilik, kampanya, bayat stok
   app.js'ten bölündü · index.html yükleme sırası önemli
========================================================= */

/* =========================================================
   2) PERSONEL PRİM / BONUS
========================================================= */

/* Bonus tipleri:
   - "yuzde"    : cironun %X'i
   - "esik"     : eşik üstü cironun %X'i
   - "kademeli" : dilimli prim
   - "sabit"    : sabit tutar
*/
const BONUS_TIPLERI = [
  { id: "yuzde", ad: "Cironun Yüzdesi", aciklama: "Aylık cironun %X'i" },
  { id: "esik", ad: "Eşik Üstü Yüzde", aciklama: "Belirlenen cironun üstünün %X'i" },
  { id: "kademeli", ad: "Kademeli Prim", aciklama: "Hedefin üstünde artan oran" },
  { id: "sabit", ad: "Sabit Prim", aciklama: "Aylık sabit tutar" }
];

function bonusAyarlar() {
  return state.bonusAyar || {
    tip: "esik",
    oran: 5,
    esik: 100000,
    hedef: 150000,
    sabit: 5000,
    personelOzel: {}
  };
}

/* Bir personel için prim hesapla (aylık ciro bazlı) */
function primHesapla(p) {
  const ayar = bonusAyarlar();
  const ozel = (ayar.personelOzel || {})[p.id] || {};
  const tip = ozel.tip || ayar.tip || "esik";
  const oran = accNum(ozel.oran != null ? ozel.oran : ayar.oran);
  const esik = accNum(ozel.esik != null ? ozel.esik : ayar.esik);
  const hedef = accNum(ozel.hedef != null ? ozel.hedef : ayar.hedef);
  const sabit = accNum(ozel.sabit != null ? ozel.sabit : ayar.sabit);

  const v = personelVerimlilik().find(x => x.personel.id === p.id);
  const ciro = v ? v.ciro : 0;

  let prim = 0, aciklama = "";

  if (tip === "yuzde") {
    prim = ciro * oran / 100;
    aciklama = "Cironun %" + oran + "'i";
  } else if (tip === "esik") {
    const fazla = Math.max(0, ciro - esik);
    prim = fazla * oran / 100;
    aciklama = accTL0(esik) + " üstü cironun %" + oran + "'i";
  } else if (tip === "kademeli") {
    // Hedefin altı: yarı oran, hedefin üstü: tam oran
    if (ciro >= hedef) {
      prim = (ciro * oran / 100);
      aciklama = "Hedef (" + accTL0(hedef) + ") aşıldı → %" + oran;
    } else if (ciro >= hedef * 0.75) {
      prim = (ciro * oran / 200);
      aciklama = "Hedefin %75'i → yarı oran (%" + (oran / 2) + ")";
    } else {
      prim = 0;
      aciklama = "Hedefin altında → prim yok";
    }
  } else {
    prim = sabit;
    aciklama = "Sabit aylık prim";
  }

  const maliyet = (v ? v.aylikMaliyet : accPayroll(p).isvereneMaliyet);
  const toplamMaliyet = maliyet + prim;
  const primOran = ciro > 0 ? (prim / ciro) * 100 : 0;

  return {
    personel: p, ad: p.name, gorev: p.position || "",
    ciro, tip, oran, esik, hedef, sabit,
    prim, aciklama, primOran,
    maliyet, toplamMaliyet,
    netKar: ciro - toplamMaliyet   // (malzeme hariç, basit görünüm)
  };
}

function renderAccPrim() {
  const ayar = bonusAyarlar();
  const personeller = (state.personnel || []).filter(p => p.aktif !== false);
  const hesaplar = personeller.map(primHesapla);
  const toplamPrim = hesaplar.reduce((s, x) => s + x.prim, 0);
  const toplamCiro = hesaplar.reduce((s, x) => s + x.ciro, 0);
  const toplamMaliyet = hesaplar.reduce((s, x) => s + x.toplamMaliyet, 0);
  const primOran = toplamCiro > 0 ? (toplamPrim / toplamCiro) * 100 : 0;

  const tipChip = BONUS_TIPLERI.map(t => {
    const aktif = ayar.tip === t.id;
    return `<button data-action="prim-tip" data-tip="${t.id}" style="flex:1;padding:8px 3px;border-radius:9px;font-size:9.5px;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif;border:1px solid ${aktif ? "#6A1B9A" : "var(--line)"};background:${aktif ? "#6A1B9A" : "rgba(255,255,255,.7)"};color:${aktif ? "#fff" : "var(--ink)"};cursor:pointer;line-height:1.25;">${t.ad}</button>`;
  }).join("");

  const kartlar = hesaplar.map(h => {
    const renk = h.prim > 0 ? "#2E7D32" : "#999";
    return `<div class="card p3 mb2">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
        <div style="flex:1;min-width:0;">
          <p style="font-size:12.5px;font-weight:700;margin:0;">${escapeHtml(h.ad)}</p>
          <p style="font-size:10px;color:var(--muted);margin:2px 0 0;">${escapeHtml(h.gorev)}</p>
          <p style="font-size:10.5px;color:#555;margin:4px 0 0;">Aylık ciro: <b>${accTL0(h.ciro)}</b></p>
          <p style="font-size:9.5px;color:#888;margin:2px 0 0;">${escapeHtml(h.aciklama)}</p>
          <p style="font-size:9.5px;color:#888;margin:2px 0 0;">Maaş ${accTL0(h.maliyet)} + Prim ${accTL0(h.prim)} = ${accTL0(h.toplamMaliyet)}</p>
        </div>
        <div style="text-align:right;flex-shrink:0;">
          <p style="font-size:15px;font-weight:800;margin:0;color:${renk};">${accTL0(h.prim)}</p>
          <p style="font-size:8.5px;color:#999;margin:1px 0 0;">prim</p>
          <p style="font-size:9px;color:${renk};margin:3px 0 0;font-weight:700;">%${h.primOran.toFixed(1)} ciro</p>
        </div>
      </div>
    </div>`;
  }).join("") || `<p class="footnote">Aktif personel yok.</p>`;

  return `
    <div class="card p4 mb3" style="background:linear-gradient(135deg,#4A148C,#6A1B9A);color:#fff;border:none;">
      <p style="font-size:13px;font-weight:700;margin:0 0 2px;">🎁 Personel Prim / Bonus</p>
      <p style="font-size:10.5px;opacity:.85;margin:0 0 10px;">${personeller.length} personel · ${BONUS_TIPLERI.find(t => t.id === ayar.tip)?.ad || ""}</p>
      <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:10px;">
        <p style="font-size:9.5px;margin:0;opacity:.85;">BU AY TOPLAM PRİM</p>
        <p style="font-size:22px;font-weight:800;margin:2px 0 0;">${accTL(toplamPrim)}</p>
      </div>
      <p style="font-size:10px;margin:8px 0 0;opacity:.9;">Ciroya oranı: <b>%${primOran.toFixed(1)}</b> · Toplam personel maliyeti: ${accTL0(toplamMaliyet)}</p>
    </div>

    <p class="section-label">Prim Sistemi</p>
    <div style="display:flex;gap:4px;margin-bottom:12px;">${tipChip}</div>

    <div class="card p4 mb3">
      <p style="font-size:12px;font-weight:700;margin:0 0 10px;color:#4A148C;">⚙️ Prim Ayarları</p>
      ${ayar.tip === "yuzde" ? `
        <div class="field"><label>Ciro yüzdesi (%)</label><input class="input" type="number" step="0.5" id="pb-oran" value="${accNum(ayar.oran)}" /></div>
      ` : ayar.tip === "esik" ? `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <div class="field"><label>Eşik ciro (₺)</label><input class="input" type="number" id="pb-esik" value="${accNum(ayar.esik)}" /></div>
          <div class="field"><label>Eşik üstü (%)</label><input class="input" type="number" step="0.5" id="pb-oran" value="${accNum(ayar.oran)}" /></div>
        </div>
      ` : ayar.tip === "kademeli" ? `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <div class="field"><label>Hedef ciro (₺)</label><input class="input" type="number" id="pb-hedef" value="${accNum(ayar.hedef)}" /></div>
          <div class="field"><label>Tam oran (%)</label><input class="input" type="number" step="0.5" id="pb-oran" value="${accNum(ayar.oran)}" /></div>
        </div>
        <p class="footnote" style="margin:-6px 0 10px;">Hedefin %75'i → yarı oran · Hedef aşılırsa → tam oran · Altında → prim yok</p>
      ` : `
        <div class="field"><label>Aylık sabit prim (₺)</label><input class="input" type="number" id="pb-sabit" value="${accNum(ayar.sabit)}" /></div>
      `}
      <button class="btn-primary" style="background:#6A1B9A;font-size:12px;padding:11px;" data-action="prim-kaydet">💾 Ayarları Kaydet</button>
    </div>

    <p class="section-label">Personel Primleri</p>
    ${kartlar}

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px;">
      <button class="btn-primary" style="background:#6A1B9A;font-size:11.5px;padding:11px;" data-action="prim-yazdir">🖨️ Prim Bordrosu</button>
      <button class="btn-primary" style="background:#0E93AC;font-size:11.5px;padding:11px;" data-action="prim-csv">⬇️ CSV İndir</button>
    </div>

    <div class="card p4 mb3" style="background:#F3E5F5;border:1px solid #CE93D8;">
      <p style="font-size:11.5px;font-weight:700;color:#4A148C;margin:0 0 8px;">📊 4 prim modeli</p>
      <table style="width:100%;font-size:10px;border-collapse:collapse;">
        <tr style="border-bottom:1px solid #E1BEE7;">
          <td style="padding:5px 0;font-weight:700;">Cironun Yüzdesi</td>
          <td style="padding:5px 0;color:#6A1B9A;">Aylık cironun %X'i — basit ve şeffaf</td>
        </tr>
        <tr style="border-bottom:1px solid #E1BEE7;">
          <td style="padding:5px 0;font-weight:700;">Eşik Üstü</td>
          <td style="padding:5px 0;color:#6A1B9A;">Belirlenen cironun üstünün %X'i — maliyet güvenli</td>
        </tr>
        <tr style="border-bottom:1px solid #E1BEE7;">
          <td style="padding:5px 0;font-weight:700;">Kademeli</td>
          <td style="padding:5px 0;color:#6A1B9A;">Hedefe yaklaştıkça artan — motivasyon yüksek</td>
        </tr>
        <tr>
          <td style="padding:5px 0;font-weight:700;">Sabit</td>
          <td style="padding:5px 0;color:#6A1B9A;">Her ay aynı tutar — öngörülebilir</td>
        </tr>
      </table>
      <p style="font-size:9.5px;color:#8E24AA;margin:8px 0 0;line-height:1.5;">
        Personel bazlı farklı oran için ileride "Personel Özel" ayarı eklenecek.
        Prim, personel maliyetine eklenerek toplam maliyet hesaplanır.
      </p>
    </div>
  `;
}

function renderAccRandevu() {
  const donem = state.randevuDonem || 30;
  const r = randevuAnaliz(donem);

  const chip = (v, l) => {
    const aktif = donem === v;
    return `<button data-action="randevu-donem" data-gun="${v}" style="flex:1;padding:7px;border-radius:9px;font-size:11px;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif;border:1px solid ${aktif ? "#0277BD" : "var(--line)"};background:${aktif ? "#0277BD" : "rgba(255,255,255,.7)"};color:${aktif ? "#fff" : "var(--ink)"};cursor:pointer;">${l}</button>`;
  };

  const haftaBar = r.haftalar.map(h => {
    const max = Math.max(1, ...r.haftalar.map(x => x.ciro));
    return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;">
      <div style="width:70%;background:#0277BD;border-radius:3px 3px 0 0;height:${Math.max(4, h.ciro / max * 100)}%;" title="${accTL0(h.ciro)} — ${h.adet} randevu"></div>
      <span style="font-size:8px;color:#888;margin-top:3px;">${h.etiket.split(" ")[0]}</span>
    </div>`;
  }).join("");

  const gunBar = r.gunAdlari.map((ad, i) => {
    const v = r.gunDagilim[i] || 0;
    const max = Math.max(1, ...Object.values(r.gunDagilim));
    return `<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
      <span style="font-size:10px;width:64px;color:#666;">${ad}</span>
      <div style="flex:1;height:14px;background:#F0F0F0;border-radius:4px;overflow:hidden;">
        <div style="height:100%;width:${v / max * 100}%;background:#0277BD;border-radius:4px;"></div>
      </div>
      <span style="font-size:10px;font-weight:700;width:24px;text-align:right;color:#0277BD;">${v}</span>
    </div>`;
  }).join("");

  const saatBar = TIME_SLOTS.map(t => {
    const v = r.saatDagilim[t] || 0;
    const max = Math.max(1, ...Object.values(r.saatDagilim));
    return `<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
      <span style="font-size:9.5px;width:36px;color:#666;font-family:monospace;">${t}</span>
      <div style="flex:1;height:11px;background:#F0F0F0;border-radius:3px;overflow:hidden;">
        <div style="height:100%;width:${v / max * 100}%;background:#00838F;border-radius:3px;"></div>
      </div>
      <span style="font-size:9px;font-weight:700;width:20px;text-align:right;color:#00838F;">${v}</span>
    </div>`;
  }).join("");

  const noShowRenk = r.noShowOrani > 25 ? "#C62828" : r.noShowOrani > 12 ? "#E65100" : "#2E7D32";

  return `
    <div style="display:flex;gap:5px;margin-bottom:12px;">
      ${chip(30, "30 Gün")}${chip(60, "60 Gün")}${chip(90, "90 Gün")}
    </div>

    <div class="card p4 mb3" style="background:linear-gradient(135deg,#01579B,#0277BD);color:#fff;border:none;">
      <p style="font-size:13px;font-weight:700;margin:0 0 2px;">📅 Randevu &amp; Ciro Tahmini</p>
      <p style="font-size:10.5px;opacity:.85;margin:0 0 10px;">Gelecek ${donem} gün · ${r.gelecek.length} randevu</p>
      <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:10px;">
        <p style="font-size:9.5px;margin:0;opacity:.85;">BEKLENEN CİRO</p>
        <p style="font-size:22px;font-weight:800;margin:2px 0 0;">${accTL(r.beklenenCiro)}</p>
      </div>
      <p style="font-size:10px;margin:8px 0 0;opacity:.9;">
        ${r.ekRandevu > 0
          ? "Boş " + r.bosSlot + " slottan " + r.ekRandevu + " tanesi dolarsa: <b>" + accTL(r.potansiyelCiro) + "</b>"
          : "Randevular dolu görünüyor"}
      </p>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:12px;">
      <div class="card p2" style="text-align:center;">
        <p style="font-size:8.5px;color:#666;margin:0;">DOLULUK</p>
        <p style="font-size:14px;font-weight:800;color:#0277BD;margin:2px 0;">%${r.doluluk.toFixed(0)}</p>
      </div>
      <div class="card p2" style="text-align:center;background:#FFF8E1;">
        <p style="font-size:8.5px;color:${noShowRenk};margin:0;">GELMEYEN</p>
        <p style="font-size:14px;font-weight:800;color:${noShowRenk};margin:2px 0;">%${r.noShowOrani.toFixed(0)}</p>
      </div>
      <div class="card p2" style="text-align:center;">
        <p style="font-size:8.5px;color:#666;margin:0;">İŞLEM ORT.</p>
        <p style="font-size:14px;font-weight:800;color:#2E7D32;margin:2px 0;">${accTL0(r.ortIslemDeger)}</p>
      </div>
    </div>

    ${r.noShowOrani > 20 ? `<div class="card p3 mb3" style="background:#FFEBEE;border:1px solid #EF9A9A;">
      <p style="font-size:11.5px;font-weight:700;color:#C62828;margin:0;">⚠️ Randevuların %${r.noShowOrani.toFixed(0)}'ine gelinmiyor</p>
      <p style="font-size:10px;color:#B71C1C;margin:3px 0 0;">Kayıp ciro (${donem} günde): <b>${accTL(r.gecmis.length * r.randevuBasinaCiro - r.gecmisCiro)}</b><br/>Hatırlatma SMS'i veya ön ödeme bu kaybı büyük ölçüde kapatır.</p>
    </div>` : ""}

    <div class="card p4 mb3">
      <p style="font-size:12.5px;font-weight:700;margin:0 0 10px;">📈 Haftalık Ciro Projeksiyonu</p>
      <div style="display:flex;align-items:flex-end;gap:6px;height:110px;">${haftaBar}</div>
    </div>

    <div class="card p4 mb3">
      <p style="font-size:12.5px;font-weight:700;margin:0 0 8px;color:#0277BD;">📆 Hangi Gün Daha Yoğun?</p>
      ${gunBar}
    </div>

    <div class="card p4 mb3">
      <p style="font-size:12.5px;font-weight:700;margin:0 0 8px;color:#00838F;">🕐 Hangi Saat Daha Yoğun?</p>
      ${saatBar}
    </div>

    <div class="card p4 mb3" style="background:#E1F5FE;border:1px solid #81D4FA;">
      <p style="font-size:11.5px;font-weight:700;color:#01579B;margin:0 0 6px;">💡 Nasıl hesaplanıyor?</p>
      <p style="font-size:10.5px;color:#0277BD;margin:0;line-height:1.65;">
        <b>Beklenen ciro</b> = Gelecek randevu sayısı × randevu başına gerçek ciro<br/>
        Randevu başına ciro, geçmişte randevuya gelen hastaların tedavi kayıtlarından hesaplanır.
        Günlük kapasite <b>${r.kapasite} slot</b> (Ayarlar'dan değiştirilebilir).
      </p>
    </div>
  `;
}

/* =========================================================
   2) PERSONEL VERİMLİLİĞİ
========================================================= */

function personelVerimlilik() {
  // ÖNEMLİ: Aylık personel maliyeti ile AYLIK ciro karşılaştırılır.
  // Tüm zamanın cirosuyla aylık maliyeti bölmek yanlış sonuç verirdi.
  const donemGun = accNum((state.verimDonem || 30)) || 30;
  const esik = new Date(Date.now() - donemGun * 86400000);
  const inc = (state.accounting.incomes || []).filter(x => new Date(x.date) >= esik);
  const personel = state.personnel || [];
  const ayKatsayi = 30 / donemGun; // ciro dönemini 30 güne normalize et

  return personel.map(p => {
    const maliyet = accPayroll(p);
    // Hekime atanmış işlemler
    const islemler = inc.filter(x => x.doctor === p.id || x.doctor === p.name);
    const ciro = islemler.reduce((s, x) => s + accNum(x.grossAmount || x.amount), 0);
    const islemSayisi = islemler.length;
    const hastaSet = new Set(islemler.map(x => (x.firm || x.description || "").split(" - ")[0].trim()));
    const hastaSayisi = hastaSet.size;
    const ortalamaSepet = islemSayisi ? ciro / islemSayisi : 0;

    // Malzeme maliyeti (atanmış işlemlerin)
    const malzeme = islemler.reduce((s, x) => s + tedaviMalzemeMaliyeti(x.category || ""), 0);

    const aylikMaliyet = maliyet.isvereneMaliyet;
    const katki = (ciro - malzeme) * ayKatsayi;      // brüt katkı (aylığa normalize)
    const net = katki - aylikMaliyet;                 // personel maliyeti düşüldükten sonra
    const roi = aylikMaliyet > 0 ? (katki / aylikMaliyet) * 100 : 0;  // %
    const verim = aylikMaliyet > 0 ? katki / aylikMaliyet : 0;        // kat sayı

    return {
      personel: p, ad: p.name, gorev: p.position || "",
      ciro: ciro * ayKatsayi, islemSayisi, hastaSayisi, ortalamaSepet,
      malzeme: malzeme * ayKatsayi, katki,
      aylikMaliyet, net, roi, verim,
      donemGun,
      atanmis: islemSayisi > 0
    };
  }).sort((a, b) => b.ciro - a.ciro);
}

function renderAccVerimlilik() {
  const liste = personelVerimlilik();
  const atanmisCiro = liste.reduce((s, x) => s + x.ciro, 0);
  const toplamIslem = (state.accounting.incomes || []).length;
  const atanmisIslem = liste.reduce((s, x) => s + x.islemSayisi, 0);
  const atamaOrani = toplamIslem ? (atanmisIslem / toplamIslem) * 100 : 0;
  const toplamMaliyet = liste.reduce((s, x) => s + x.aylikMaliyet, 0);
  const toplamKatki = liste.reduce((s, x) => s + x.katki, 0);

  const kartlar = liste.map(x => {
    const renk = x.verim >= 3 ? "#2E7D32" : x.verim >= 1.5 ? "#F9A825" : x.aylikMaliyet > 0 ? "#C62828" : "#888";
    const etiket = x.verim >= 3 ? "Çok verimli" : x.verim >= 1.5 ? "Dengeli" : x.aylikMaliyet > 0 ? "Maliyetini karşılamıyor" : "—";
    return `<div class="card p3 mb2">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
        <div style="flex:1;min-width:0;">
          <p style="font-size:12.5px;font-weight:700;margin:0;">${escapeHtml(x.ad)}</p>
          <p style="font-size:10px;color:var(--muted);margin:2px 0 0;">${escapeHtml(x.gorev)}</p>
          ${x.atanmis ? `
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px;margin-top:6px;font-size:9.5px;color:#666;">
            <span>Ciro: <b style="color:#2E7D32;">${accTL0(x.ciro)}</b></span>
            <span>Hasta: <b>${x.hastaSayisi}</b></span>
            <span>İşlem: <b>${x.islemSayisi}</b></span>
            <span>Sepet: <b>${accTL0(x.ortalamaSepet)}</b></span>
          </div>
          <p style="font-size:9.5px;color:#888;margin:4px 0 0;">Maliyet ${accTL0(x.aylikMaliyet)} · Katkı ${accTL0(x.katki)}</p>
          ` : `<p style="font-size:10px;color:#E65100;margin:5px 0 0;">⚠️ Henüz işlem atanmamış</p>`}
        </div>
        <div style="text-align:right;flex-shrink:0;">
          ${x.atanmis ? `<p style="font-size:13px;font-weight:800;margin:0;color:${renk};">${x.verim.toFixed(1)}x</p>
          <p style="font-size:8.5px;color:${renk};margin:1px 0 0;font-weight:700;">${etiket}</p>
          <p style="font-size:9.5px;color:${x.net >= 0 ? "#2E7D32" : "#C62828"};margin:4px 0 0;font-weight:700;">${accTL0(x.net)}</p>
          <p style="font-size:8px;color:#999;margin:0;">net katkı</p>` : ""}
        </div>
      </div>
    </div>`;
  }).join("") || `<p class="footnote">Personel kaydı yok.</p>`;

  /* Atanmamış işlemler */
  const atanmamis = (state.accounting.incomes || []).filter(x => !x.doctor);
  const atanmamisCiro = atanmamis.reduce((s, x) => s + accNum(x.grossAmount || x.amount), 0);

  return `
    <div class="card p4 mb3" style="background:linear-gradient(135deg,#1B5E20,#2E7D32);color:#fff;border:none;">
      <p style="font-size:13px;font-weight:700;margin:0 0 2px;">👥 Personel Verimliliği</p>
      <p style="font-size:10.5px;opacity:.85;margin:0 0 10px;">${liste.length} personel · ${atanmisIslem}/${toplamIslem} işlem atanmış</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:8px;">
          <p style="font-size:9px;margin:0;opacity:.85;">ATANMIŞ CİRO</p>
          <p style="font-size:15px;font-weight:800;margin:2px 0 0;">${accTL0(atanmisCiro)}</p>
        </div>
        <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:8px;">
          <p style="font-size:9px;margin:0;opacity:.85;">PERSONEL MALİYETİ</p>
          <p style="font-size:15px;font-weight:800;margin:2px 0 0;">${accTL0(toplamMaliyet)}</p>
        </div>
      </div>
      <p style="font-size:10px;margin:8px 0 0;opacity:.9;">Genel verim: <b>${toplamMaliyet > 0 ? (toplamKatki / toplamMaliyet).toFixed(1) + "x" : "—"}</b> · Katkı ${accTL0(toplamKatki)}</p>
    </div>

    ${atamaOrani < 80 ? `<div class="card p3 mb3" style="background:#FFF3E0;border:1px solid #FFB74D;">
      <p style="font-size:11.5px;font-weight:700;color:#E65100;margin:0;">📌 İşlemlerin %${(100 - atamaOrani).toFixed(0)}'i bir personele atanmamış</p>
      <p style="font-size:10px;color:#BF360C;margin:3px 0 0;">Doğru verimlilik analizi için gelir kaydederken <b>"Hekim"</b> alanını seçin.<br/>Atanmamış ciro: <b>${accTL0(atanmamisCiro)}</b></p>
    </div>` : ""}

    <div style="display:flex;gap:5px;margin:10px 0;">
      ${[30, 90, 180].map(v => `<button data-action="verim-donem" data-gun="${v}" style="flex:1;padding:7px;border-radius:9px;font-size:10.5px;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif;border:1px solid ${(state.verimDonem || 30) === v ? "#2E7D32" : "var(--line)"};background:${(state.verimDonem || 30) === v ? "#2E7D32" : "rgba(255,255,255,.7)"};color:${(state.verimDonem || 30) === v ? "#fff" : "var(--ink)"};cursor:pointer;">Son ${v} Gün</button>`).join("")}
    </div>

    <p class="section-label">Personel Bazlı Verim (aylığa normalize)</p>
    ${kartlar}

    <div class="card p4 mb3" style="background:#E8F5E9;border:1px solid #A5D6A7;">
      <p style="font-size:11.5px;font-weight:700;color:#1B5E20;margin:0 0 6px;">💡 Verim katsayısı nedir?</p>
      <p style="font-size:10.5px;color:#2E7D32;margin:0;line-height:1.65;">
        <b>Verim = (Ciro − Malzeme maliyeti) ÷ Personel maliyeti</b><br/>
        • <b>3x ve üzeri</b> → çok verimli<br/>
        • <b>1,5 – 3x</b> → dengeli<br/>
        • <b>1,5x altı</b> → maliyetini karşılamıyor, eğitim veya görev dağılımı gerekir
      </p>
    </div>
  `;
}

/* =========================================================
   3) KAMPANYA YÖNETİMİ
========================================================= */

function kampanyaDurum(k) {
  const bugun = new Date(); bugun.setHours(0, 0, 0, 0);
  const bas = new Date(k.baslangic);
  const bit = new Date(k.bitis);
  if (bugun < bas) return { kod: "bekliyor", etiket: "Başlamadı", renk: "#1565C0" };
  if (bugun > bit) return { kod: "bitti", etiket: "Bitti", renk: "#888" };
  const kalan = Math.round((bit - bugun) / 86400000);
  return { kod: "aktif", etiket: kalan + " gün kaldı", renk: "#2E7D32" };
}

function kampanyaEtki(k) {
  const fiyat = accNum(accTumFiyatlar()[k.tedavi]);
  const indirimli = fiyat * (1 - accNum(k.indirim) / 100);
  const malzeme = tedaviMalzemeMaliyeti(k.tedavi);
  const karNormal = fiyat - malzeme;
  const karIndirimli = indirimli - malzeme;
  const kayip = karNormal - karIndirimli;
  // Aynı kârı korumak için kaç ek hasta gerekiyor
  const ekHasta = karIndirimli > 0 ? kayip / karIndirimli : Infinity;
  return {
    fiyat, indirimli, malzeme, karNormal, karIndirimli, kayip,
    marjNormal: fiyat > 0 ? (karNormal / fiyat) * 100 : 0,
    marjIndirimli: indirimli > 0 ? (karIndirimli / indirimli) * 100 : 0,
    ekHasta: isFinite(ekHasta) ? Math.ceil(ekHasta) : null
  };
}

function renderAccKampanya() {
  const liste = state.kampanyalar || [];
  const ed = state.kampanyaEdit;

  let formHtml = "";
  if (ed !== null && ed !== undefined) {
    const k = liste.find(x => x.id === ed) || {
      id: "", ad: "", tedavi: TEDAVI_LISTESI[1], indirim: 10,
      baslangic: accToday(), bitis: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      kullanim: 0, notlar: ""
    };
    formHtml = `<div class="card p4 mb3" style="border:2px solid #E65100;background:#FFF3E0;">
      <p style="font-size:13px;font-weight:700;margin:0 0 10px;color:#BF360C;">${k.id ? "✏️ Kampanyayı Düzenle" : "➕ Yeni Kampanya"}</p>
      <div class="field"><label>Kampanya adı</label><input class="input" id="kp-ad" value="${escapeAttr(k.ad || "")}" placeholder="Örn: Ekim implant fırsatı" /></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div class="field"><label>Tedavi</label>
          <select class="input" id="kp-tedavi">
            ${TEDAVI_LISTESI.map(t => `<option ${k.tedavi === t ? "selected" : ""}>${t}</option>`).join("")}
          </select>
        </div>
        <div class="field"><label>İndirim %</label><input class="input" type="number" min="0" max="90" step="1" id="kp-indirim" value="${accNum(k.indirim)}" /></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div class="field"><label>Başlangıç</label><input class="input" type="date" id="kp-bas" value="${escapeAttr(k.baslangic || "")}" /></div>
        <div class="field"><label>Bitiş</label><input class="input" type="date" id="kp-bit" value="${escapeAttr(k.bitis || "")}" /></div>
      </div>
      <div class="field"><label>Kullanım sayısı</label><input class="input" type="number" id="kp-kullanim" value="${accNum(k.kullanim)}" /></div>
      <div style="display:flex;gap:8px;">
        <button class="btn-primary" style="background:#E65100;" data-action="kp-save" data-id="${k.id || ""}">💾 Kaydet</button>
        <button class="btn-primary" style="background:#757575;" data-action="kp-cancel">İptal</button>
      </div>
    </div>`;
  }

  const kartlar = liste.map(k => {
    const d = kampanyaDurum(k);
    const e = kampanyaEtki(k);
    return `<div class="card p3 mb2" style="border-left:4px solid ${d.renk};">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
        <div style="flex:1;min-width:0;">
          <p style="font-size:12.5px;font-weight:700;margin:0;">${escapeHtml(k.ad)}</p>
          <p style="font-size:10px;color:var(--muted);margin:2px 0 0;">${escapeHtml(k.tedavi)} · %${accNum(k.indirim)} indirim · ${accNum(k.kullanim)} kullanım</p>
          <p style="font-size:9.5px;color:${d.renk};font-weight:700;margin:3px 0 0;">${d.etiket}</p>
          <div style="display:flex;gap:10px;margin-top:5px;font-size:9.5px;">
            <span style="color:#888;">Normal ${accTL0(e.fiyat)} → <b style="color:#E65100;">${accTL0(e.indirimli)}</b></span>
          </div>
          <p style="font-size:9.5px;color:#666;margin:3px 0 0;">Kâr: ${accTL0(e.karNormal)} → <b style="color:${e.karIndirimli >= 0 ? "#2E7D32" : "#C62828"};">${accTL0(e.karIndirimli)}</b> (marj %${e.marjIndirimli.toFixed(0)})</p>
        </div>
        <div style="display:flex;flex-direction:column;gap:4px;">
          <button data-action="kp-edit" data-id="${k.id}" style="background:#FFF3E0;border:none;border-radius:6px;padding:5px 8px;cursor:pointer;font-size:11px;">✏️</button>
          <button data-action="kp-delete" data-id="${k.id}" style="background:#FFEBEE;border:none;border-radius:6px;padding:5px 8px;cursor:pointer;font-size:11px;color:#C62828;">🗑️</button>
        </div>
      </div>
    </div>`;
  }).join("") || `<p class="footnote">Henüz kampanya yok.</p>`;

  const aktifSayisi = liste.filter(k => kampanyaDurum(k).kod === "aktif").length;
  const toplamKullanim = liste.reduce((s, k) => s + accNum(k.kullanim), 0);

  return `
    <div class="card p4 mb3" style="background:linear-gradient(135deg,#E65100,#F57C00);color:#fff;border:none;">
      <p style="font-size:13px;font-weight:700;margin:0 0 2px;">🎯 Kampanya Yönetimi</p>
      <p style="font-size:10.5px;opacity:.85;margin:0 0 10px;">${liste.length} kampanya · ${aktifSayisi} aktif</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:8px;">
          <p style="font-size:9px;margin:0;opacity:.85;">TOPLAM KULLANIM</p>
          <p style="font-size:15px;font-weight:800;margin:2px 0 0;">${toplamKullanim}</p>
        </div>
        <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:8px;">
          <p style="font-size:9px;margin:0;opacity:.85;">AKTİF</p>
          <p style="font-size:15px;font-weight:800;margin:2px 0 0;">${aktifSayisi}</p>
        </div>
      </div>
    </div>

    ${formHtml}
    ${ed === null || ed === undefined ? `<button class="btn-primary mb3" style="background:#E65100;" data-action="kp-new">➕ Yeni Kampanya</button>` : ""}

    <p class="section-label">Kampanyalar (${liste.length})</p>
    ${kartlar}

    <div class="card p4 mb3" style="background:#FFF3E0;border:1px solid #FFB74D;">
      <p style="font-size:11.5px;font-weight:700;color:#E65100;margin:0 0 6px;">🧮 İndirim kâra nasıl yansıyor?</p>
      <p style="font-size:10.5px;color:#BF360C;margin:0;line-height:1.7;">
        Her kampanyada program otomatik gösteriyor:
      </p>
      <ul style="font-size:10px;color:#BF360C;margin:6px 0 0;padding-left:16px;line-height:1.8;">
        <li>İndirimli fiyat ve yeni kâr</li>
        <li>Yeni kâr marjı</li>
        <li><b>Aynı kârı korumak için kaç ek hasta gerekiyor</b></li>
      </ul>
      <p style="font-size:10px;color:#E65100;margin:8px 0 0;font-weight:600;">
        %20 indirim yaptığında aynı parayı kazanmak için yaklaşık <b>%25 daha fazla hasta</b> görmen gerekir.
      </p>
    </div>
  `;
}

/* =========================================================
   4) BAYAT STOK
========================================================= */

function bayatStok(gunEsik) {
  const esik = gunEsik || (accNum((state.bayatAyar || {}).gun) || 90);
  const bugun = new Date();
  const stoklar = state.stok || [];
  const hareketler = state.stokHareket || [];

  return stoklar.map(s => {
    const sHareket = hareketler.filter(h => h.stokId === s.id);
    const sonCikis = sHareket.filter(h => h.tip === "cikis")
      .sort((a, b) => new Date(b.tarih) - new Date(a.tarih))[0];
    const sonHerhangi = sHareket.sort((a, b) => new Date(b.tarih) - new Date(a.tarih))[0];

    const sonTarih = sonCikis ? new Date(sonCikis.tarih) : (s.sonKullanim ? new Date(s.sonKullanim) : (sonHerhangi ? new Date(sonHerhangi.tarih) : new Date(s.olusturma || "2000-01-01")));
    const gun = Math.round((bugun - sonTarih) / 86400000);
    const deger = stokDeger(s);
    const hicKullanilmadi = !sonCikis;
    const bayat = gun >= esik;

    // Aylık tüketim hızı
    const son90Cikis = sHareket.filter(h => h.tip === "cikis" && (bugun - new Date(h.tarih)) / 86400000 <= 90);
    const aylikTuketim = son90Cikis.reduce((t, h) => t + accNum(h.miktar), 0) / 3;
    const kalanAy = aylikTuketim > 0 ? accNum(s.miktar) / aylikTuketim : null;

    return {
      ...s, gunBayat: gun, deger, hicKullanilmadi, bayat, aylikTuketim, kalanAy,
      sonTarih, sHareketSayisi: sHareket.length
    };
  }).filter(x => x.bayat || x.hicKullanilmadi)
    .sort((a, b) => b.deger - a.deger);
}

function renderAccBayat() {
  const esik = accNum((state.bayatAyar || {}).gun) || 90;
  const liste = bayatStok(esik);
  const toplamDeger = liste.reduce((s, x) => s + x.deger, 0);
  const toplamStokDeger = stokToplamDeger();
  const oran = toplamStokDeger > 0 ? (toplamDeger / toplamStokDeger) * 100 : 0;

  const chip = (v, l) => {
    const aktif = esik === v;
    return `<button data-action="bayat-esik" data-gun="${v}" style="flex:1;padding:7px;border-radius:9px;font-size:10.5px;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif;border:1px solid ${aktif ? "#6D4C41" : "var(--line)"};background:${aktif ? "#6D4C41" : "rgba(255,255,255,.7)"};color:${aktif ? "#fff" : "var(--ink)"};cursor:pointer;">${l}</button>`;
  };

  const kartlar = liste.map(x => {
    const renk = x.hicKullanilmadi ? "#C62828" : x.gunBayat >= esik * 2 ? "#C62828" : x.gunBayat >= esik ? "#E65100" : "#666";
    const etiket = x.hicKullanilmadi ? "Hiç kullanılmadı" : x.gunBayat + " gündür kullanılmıyor";
    return `<div class="card p3 mb2" style="border-left:4px solid ${renk};">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
        <div style="flex:1;min-width:0;">
          <p style="font-size:12.5px;font-weight:700;margin:0;">${escapeHtml(x.ad)}</p>
          <p style="font-size:10px;color:${renk};font-weight:600;margin:2px 0 0;">${etiket}</p>
          <p style="font-size:10px;color:var(--muted);margin:2px 0 0;">${accNum(x.miktar).toLocaleString("tr-TR")} ${escapeHtml(x.birim)} · ${escapeHtml(x.kategori || "")}</p>
          <p style="font-size:10px;color:#888;margin:2px 0 0;">
            ${x.aylikTuketim > 0 ? "Aylık tüketim " + x.aylikTuketim.toFixed(1) + " · " + (x.kalanAy ? x.kalanAy.toFixed(0) + " ay yeter" : "") : "Tüketim kaydı yok"}
          </p>
        </div>
        <div style="text-align:right;flex-shrink:0;">
          <p style="font-size:12.5px;font-weight:800;margin:0;color:${renk};">${accTL0(x.deger)}</p>
          <p style="font-size:8.5px;color:#999;margin:1px 0 0;">bağlı sermaye</p>
          <button data-action="bayat-sil" data-id="${x.id}" style="margin-top:5px;background:#FFEBEE;border:none;border-radius:6px;padding:4px 7px;font-size:9.5px;color:#C62828;cursor:pointer;">Zayiat</button>
        </div>
      </div>
    </div>`;
  }).join("") || `<div class="card p4" style="text-align:center;background:#E8F5E9;border:1px solid #A5D6A7;">
      <p style="font-size:12.5px;margin:0;color:#1B5E20;font-weight:700;">✅ Bayat malzeme yok</p>
      <p style="font-size:10px;color:#2E7D32;margin:4px 0 0;">Tüm stok ${esik} gün içinde hareket görmüş.</p>
    </div>`;

  return `
    <div style="display:flex;gap:5px;margin-bottom:12px;">
      ${chip(60, "60 Gün")}${chip(90, "90 Gün")}${chip(180, "180 Gün")}
    </div>

    <div class="card p4 mb3" style="background:linear-gradient(135deg,#3E2723,#6D4C41);color:#fff;border:none;">
      <p style="font-size:13px;font-weight:700;margin:0 0 2px;">📦 Bayat Stok Analizi</p>
      <p style="font-size:10.5px;opacity:.85;margin:0 0 10px;">${esik} gündür hareket görmeyen malzemeler</p>
      <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:10px;">
        <p style="font-size:9.5px;margin:0;opacity:.85;">BAĞLI SERMAYE</p>
        <p style="font-size:22px;font-weight:800;margin:2px 0 0;">${accTL(toplamDeger)}</p>
      </div>
      <p style="font-size:10px;margin:8px 0 0;opacity:.9;">
        ${liste.length} kalem · toplam stoğun <b>%${oran.toFixed(0)}</b>'ı
      </p>
    </div>

    ${oran > 30 ? `<div class="card p3 mb3" style="background:#FFEBEE;border:1px solid #EF9A9A;">
      <p style="font-size:11.5px;font-weight:700;color:#C62828;margin:0;">⚠️ Stoğun %${oran.toFixed(0)}'ı hareketsiz</p>
      <p style="font-size:10px;color:#B71C1C;margin:3px 0 0;">Bu tutar kasada değil rafta bekliyor. Sipariş miktarlarını gözden geçir.</p>
    </div>` : ""}

    <p class="section-label">Hareketsiz Malzemeler (${liste.length})</p>
    ${kartlar}

    <div class="card p4 mb3" style="background:#EFEBE9;border:1px solid #BCAAA4;">
      <p style="font-size:11.5px;font-weight:700;color:#4E342E;margin:0 0 6px;">💡 Ne yapmalı?</p>
      <p style="font-size:10.5px;color:#5D4037;margin:0;line-height:1.7;">
        • <b>Kampanya</b> yaparak bu malzemeyi kullanan tedaviyi indirime sok<br/>
        • Son kullanma tarihi yaklaşanları <b>öncelikli kullan</b><br/>
        • Bozulanları <b>"Zayiat"</b> butonuyla stoktan düş (gider olarak işlenir)<br/>
        • Bir daha aynı miktarda <b>sipariş verme</b>
      </p>
    </div>
  `;
}

function renderAccMalzemeMaliyet() {
  const secili = state.mmTedavi || TEDAVI_LISTESI[1];
  const kullanim = tedaviMalzemeListesi(secili);
  const stoklar = state.stok || [];

  const tumKar = TEDAVI_LISTESI.map(t => tedaviKar(t)).filter(x => x.fiyat > 0);

  /* Seçili tedavinin satırları */
  const satirlar = kullanim.map((k, i) => {
    const s = stokBul(k.stokId);
    if (!s) return "";
    const tutar = accNum(s.birimFiyat) * accNum(k.miktar);
    return `<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--line);">
      <div style="flex:1;min-width:0;">
        <p style="font-size:11.5px;font-weight:600;margin:0;">${escapeHtml(s.ad)}</p>
        <p style="font-size:9.5px;color:var(--muted);margin:2px 0 0;">${accNum(k.miktar)} ${escapeHtml(s.birim)} × ${accTL(accNum(s.birimFiyat))}</p>
      </div>
      <div style="display:flex;align-items:center;gap:6px;">
        <p style="font-size:11.5px;font-weight:700;margin:0;color:#C62828;">${accTL(tutar)}</p>
        <button data-action="mm-sil" data-tedavi="${escapeAttr(secili)}" data-i="${i}" style="background:#FFEBEE;border:none;border-radius:6px;padding:4px 7px;cursor:pointer;font-size:10px;color:#C62828;">🗑️</button>
      </div>
    </div>`;
  }).join("") || `<p class="footnote">Bu tedaviye henüz malzeme tanımlanmadı.</p>`;

  const tk = tedaviKar(secili);

  /* Tüm tedaviler kârlılık tablosu */
  const tablo = tumKar.sort((a, b) => b.marj - a.marj).map(x => {
    const renk = x.marj >= 60 ? "#2E7D32" : x.marj >= 35 ? "#F9A825" : "#C62828";
    return `<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--line);">
      <div style="flex:1;min-width:0;">
        <p style="font-size:11.5px;font-weight:600;margin:0;">${escapeHtml(x.tedavi)}</p>
        <p style="font-size:9.5px;color:var(--muted);margin:2px 0 0;">Fiyat ${accTL0(x.fiyat)} · Maliyet ${accTL0(x.maliyet)}</p>
      </div>
      <div style="text-align:right;flex-shrink:0;">
        <p style="font-size:11.5px;font-weight:700;margin:0;color:${renk};">${accTL0(x.kar)}</p>
        <p style="font-size:9px;color:${renk};margin:1px 0 0;font-weight:600;">%${x.marj.toFixed(0)} marj</p>
      </div>
    </div>`;
  }).join("");

  const tedaviChip = TEDAVI_LISTESI.map(t => {
    const aktif = t === secili;
    const varMi = tedaviMalzemeListesi(t).length > 0;
    return `<button data-action="mm-tedavi" data-tedavi="${escapeAttr(t)}" style="flex:0 0 auto;padding:6px 11px;border-radius:16px;font-size:11px;font-weight:600;font-family:'Plus Jakarta Sans',sans-serif;border:1px solid ${aktif ? "#6A1B9A" : "var(--line)"};background:${aktif ? "#6A1B9A" : (varMi ? "#F3E5F5" : "rgba(255,255,255,.7)")};color:${aktif ? "#fff" : "var(--ink)"};cursor:pointer;">${escapeHtml(t)}</button>`;
  }).join("");

  /* Ortalama marj */
  const ortMarj = tumKar.length ? tumKar.reduce((s, x) => s + x.marj, 0) / tumKar.length : 0;
  const enKarli = tumKar[0];
  const enZarar = tumKar[tumKar.length - 1];

  return `
    <div class="card p4 mb3" style="background:linear-gradient(135deg,#4A148C,#6A1B9A);color:#fff;border:none;">
      <p style="font-size:13px;font-weight:700;margin:0 0 2px;">🧪 Malzeme Maliyeti Analizi</p>
      <p style="font-size:10.5px;opacity:.85;margin:0 0 10px;">Hangi tedavi gerçekten kâr getiriyor?</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:8px;">
          <p style="font-size:9px;margin:0;opacity:.85;">ORTALAMA MARJ</p>
          <p style="font-size:15px;font-weight:800;margin:2px 0 0;">%${ortMarj.toFixed(0)}</p>
        </div>
        <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:8px;">
          <p style="font-size:9px;margin:0;opacity:.85;">TANIMLI TEDAVİ</p>
          <p style="font-size:15px;font-weight:800;margin:2px 0 0;">${tumKar.filter(x => x.maliyet > 0).length}/${tumKar.length}</p>
        </div>
      </div>
    </div>

    <p class="section-label">Tedavi Seç</p>
    <div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:8px;margin-bottom:12px;">${tedaviChip}</div>

    <div class="card p4 mb3" style="border:2px solid #6A1B9A;">
      <p style="font-size:13px;font-weight:700;margin:0 0 10px;color:#4A148C;">${escapeHtml(secili)} — Maliyet Dökümü</p>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:12px;">
        <div style="text-align:center;background:#E8F5E9;border-radius:9px;padding:7px;">
          <p style="font-size:9px;color:#2E7D32;margin:0;">FİYAT</p>
          <p style="font-size:13px;font-weight:800;color:#1B5E20;margin:2px 0 0;">${accTL0(tk.fiyat)}</p>
        </div>
        <div style="text-align:center;background:#FFEBEE;border-radius:9px;padding:7px;">
          <p style="font-size:9px;color:#C62828;margin:0;">MALZEME</p>
          <p style="font-size:13px;font-weight:800;color:#B71C1C;margin:2px 0 0;">${accTL0(tk.maliyet)}</p>
        </div>
        <div style="text-align:center;background:#E3F2FD;border-radius:9px;padding:7px;">
          <p style="font-size:9px;color:#1565C0;margin:0;">KÂR</p>
          <p style="font-size:13px;font-weight:800;color:${tk.kar >= 0 ? "#0D47A1" : "#C62828"};margin:2px 0 0;">${accTL0(tk.kar)}</p>
        </div>
      </div>

      ${satirlar}

      <div style="margin-top:12px;padding-top:10px;border-top:2px dashed var(--line);">
        <p style="font-size:11px;font-weight:700;margin:0 0 8px;color:#4A148C;">Malzeme Ekle</p>
        <div style="display:grid;grid-template-columns:1fr 70px;gap:6px;margin-bottom:6px;">
          <select class="input" id="mm-stok" style="font-size:11px;padding:8px;">
            <option value="">— Malzeme seç —</option>
            ${stoklar.map(s => `<option value="${escapeAttr(s.id)}">${escapeHtml(s.ad)} (${accTL(accNum(s.birimFiyat))}/${escapeHtml(s.birim)})</option>`).join("")}
          </select>
          <input class="input" type="number" step="0.1" id="mm-miktar" placeholder="Miktar" style="font-size:11px;padding:8px;" />
        </div>
        ${stoklar.length ? `<button class="btn-primary" style="background:#6A1B9A;font-size:11.5px;padding:10px;" data-action="mm-ekle" data-tedavi="${escapeAttr(secili)}">➕ Maliyete Ekle</button>`
          : `<p class="footnote">Önce <b>Stok</b> sekmesinden malzeme ekleyin.</p>`}
      </div>
    </div>

    <p class="section-label" style="margin-top:14px;">📊 Tüm Tedavilerin Kârlılığı</p>
    <div class="card p4 mb3">${tablo}</div>

    ${enKarli && enZarar && enKarli.tedavi !== enZarar.tedavi ? `<div class="card p4 mb3" style="background:#F3E5F5;border:1px solid #CE93D8;">
      <p style="font-size:11.5px;font-weight:700;color:#4A148C;margin:0 0 6px;">💡 Öne çıkanlar</p>
      <p style="font-size:10.5px;color:#6A1B9A;margin:0;line-height:1.7;">
        <b>En kârlı:</b> ${escapeHtml(enKarli.tedavi)} — %${enKarli.marj.toFixed(0)} marj, ${accTL0(enKarli.kar)} net<br/>
        <b>En düşük marj:</b> ${escapeHtml(enZarar.tedavi)} — %${enZarar.marj.toFixed(0)} marj<br/><br/>
        Marjı düşük tedavilerde ya fiyatı gözden geçir ya da daha ekonomik malzeme kullan.
      </p>
    </div>` : ""}
  `;
}

/* =========================================================
   2) HASTA BAZLI KÂRLILIK
========================================================= */

/* Gelir kayıtlarını hasta adına göre gruplar */
function accHastaListesi() {
  const inc = state.accounting.incomes || [];
  const map = {};

  inc.forEach(x => {
    // Hasta adı: firm (POS'ta girilen ad) veya description içindeki isim
    let ad = (x.firm || "").trim();
    if (!ad) {
      // "Ayşe K. - İmplant" → "Ayşe K."
      const m = (x.description || "").split(" - ")[0].trim();
      ad = m || "Bilinmeyen";
    }
    const k = ad.toLowerCase();
    if (!map[k]) {
      map[k] = {
        ad, toplam: 0, adet: 0, tahsil: 0, veresiye: 0,
        kdv: 0, maliyet: 0, islemler: [], sonTarih: null, ilkTarih: null
      };
    }
    const h = map[k];
    const brut = accNum(x.grossAmount || x.amount);
    const malz = tedaviMalzemeMaliyeti(x.category || "");
    h.toplam += brut;
    h.maliyet += malz;
    h.adet++;
    h.kdv += accNum(x.kdv);
    if (x.paid === false) h.veresiye += accNum(x.amount);
    else h.tahsil += accNum(x.amount);
    h.islemler.push(x);
    const d = new Date(x.date);
    if (!h.sonTarih || d > h.sonTarih) h.sonTarih = d;
    if (!h.ilkTarih || d < h.ilkTarih) h.ilkTarih = d;
  });

  return Object.values(map).map(h => {
    // Genel gider payı: ciro oranında
    // ÖNEMLİ: Malzeme giderleri hariç tutulur — çünkü malzeme maliyeti ayrıca düşülüyor (çift sayım olmasın)
    const tumCiro = inc.reduce((s, x) => s + accNum(x.grossAmount || x.amount), 0);
    const payOrani = tumCiro > 0 ? h.toplam / tumCiro : 0;
    const MALZEME_KAT = ["Malzeme", "Sarf Malzeme", "İmplant Malzemesi", "Ölçü Malzemesi", "Kanal Tedavisi"];
    const tumGider = (state.accounting.expenses || [])
      .filter(x => !MALZEME_KAT.includes(x.category))
      .reduce((s, x) => s + accNum(x.amount), 0);
    const genelGider = tumGider * payOrani;

    const netKar = h.toplam - h.maliyet - genelGider;
    const marj = h.toplam > 0 ? (netKar / h.toplam) * 100 : 0;
    const ortalama = h.adet > 0 ? h.toplam / h.adet : 0;
    const gunFark = h.sonTarih ? Math.round((new Date() - h.sonTarih) / 86400000) : null;

    return {
      ...h,
      genelGider, netKar, marj, ortalama,
      gunFark,
      tekrar: h.adet > 1
    };
  }).sort((a, b) => b.toplam - a.toplam);
}

function renderAccHastaKar() {
  const liste = accHastaListesi();
  const sirala = state.hkSirala || "ciro";

  const sirali = liste.slice().sort((a, b) => {
    if (sirala === "kar") return b.netKar - a.netKar;
    if (sirala === "adet") return b.adet - a.adet;
    return b.toplam - a.toplam;
  });

  const toplamCiro = liste.reduce((s, h) => s + h.toplam, 0);
  const toplamKar = liste.reduce((s, h) => s + h.netKar, 0);
  const tekrarEden = liste.filter(h => h.tekrar).length;
  const tekrarOrani = liste.length ? (tekrarEden / liste.length) * 100 : 0;
  const ortHasta = liste.length ? toplamCiro / liste.length : 0;
  const enIyi = liste.slice().sort((a, b) => b.netKar - a.netKar)[0];
  const kayip = liste.filter(h => h.netKar < 0);

  const chip = (v, l) => {
    const aktif = sirala === v;
    return `<button data-action="hk-sirala" data-v="${v}" style="flex:1;padding:7px;border-radius:9px;font-size:10.5px;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif;border:1px solid ${aktif ? "#AD1457" : "var(--line)"};background:${aktif ? "#AD1457" : "rgba(255,255,255,.7)"};color:${aktif ? "#fff" : "var(--ink)"};cursor:pointer;">${l}</button>`;
  };

  const kartlar = sirali.slice(0, 30).map((h, i) => {
    const renk = h.netKar >= 0 ? "#2E7D32" : "#C62828";
    const madalya = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "";
    const gecikme = h.veresiye > 0 ? (h.gunFark > 30 ? "🔴" : "🟠") : "";
    return `<div class="card p3 mb2">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
        <div style="flex:1;min-width:0;">
          <p style="font-size:12.5px;font-weight:700;margin:0;">${madalya} ${escapeHtml(h.ad)} ${gecikme}</p>
          <p style="font-size:9.5px;color:var(--muted);margin:2px 0 0;">${h.adet} işlem · ortalama ${accTL0(h.ortalama)}${h.gunFark !== null ? " · son " + h.gunFark + " gün önce" : ""}</p>
          ${h.veresiye > 0 ? `<p style="font-size:9.5px;color:#C62828;margin:2px 0 0;font-weight:600;">⚠️ Veresiye: ${accTL(h.veresiye)}</p>` : ""}
          <div style="display:flex;gap:10px;margin-top:4px;font-size:9px;color:#888;">
            <span>Ciro ${accTL0(h.toplam)}</span>
            <span>Malzeme ${accTL0(h.maliyet)}</span>
            <span>Gider payı ${accTL0(h.genelGider)}</span>
          </div>
        </div>
        <div style="text-align:right;flex-shrink:0;">
          <p style="font-size:12.5px;font-weight:800;margin:0;color:${renk};">${accTL0(h.netKar)}</p>
          <p style="font-size:9px;color:${renk};margin:1px 0 0;font-weight:600;">%${h.marj.toFixed(0)} marj</p>
          <button data-action="hk-detay" data-ad="${escapeAttr(h.ad)}" style="margin-top:5px;background:#FCE4EC;border:none;border-radius:6px;padding:4px 7px;font-size:9.5px;color:#AD1457;cursor:pointer;font-weight:600;">Detay</button>
        </div>
      </div>
    </div>`;
  }).join("") || `<p class="footnote">Henüz hasta kaydı yok.</p>`;

  /* Detay modal */
  let detayHtml = "";
  if (state.hkDetay) {
    const h = liste.find(x => x.ad === state.hkDetay);
    if (h) {
      const islemler = h.islemler.sort((a, b) => new Date(b.date) - new Date(a.date)).map(x => `
        <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--line);">
          <div style="flex:1;min-width:0;">
            <p style="font-size:11px;margin:0;font-weight:600;">${escapeHtml(x.category || "")}</p>
            <p style="font-size:9.5px;color:var(--muted);margin:1px 0 0;">${accTarihTR(x.date)}${x.paid === false ? " · ⚠️ Veresiye" : ""}</p>
          </div>
          <p style="font-size:11px;font-weight:700;margin:0;color:#2E7D32;">${accTL(x.grossAmount || x.amount)}</p>
        </div>`).join("");
      detayHtml = `<div class="card p4 mb3" style="border:2px solid #AD1457;background:#FCE4EC;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <p style="font-size:13px;font-weight:700;margin:0;color:#880E4F;">${escapeHtml(h.ad)}</p>
          <button data-action="hk-kapat" style="background:none;border:none;font-size:16px;cursor:pointer;color:#AD1457;">✕</button>
        </div>
        <table style="width:100%;font-size:11px;border-collapse:collapse;margin-bottom:10px;">
          <tr><td style="padding:3px 0;">Toplam ciro</td><td style="text-align:right;font-weight:700;">${accTL(h.toplam)}</td></tr>
          <tr><td style="padding:3px 0;">Tahsil edilen</td><td style="text-align:right;color:#2E7D32;">${accTL(h.tahsil)}</td></tr>
          ${h.veresiye > 0 ? `<tr><td style="padding:3px 0;">Veresiye</td><td style="text-align:right;color:#C62828;font-weight:700;">${accTL(h.veresiye)}</td></tr>` : ""}
          <tr><td style="padding:3px 0;">Malzeme maliyeti</td><td style="text-align:right;color:#C62828;">-${accTL(h.maliyet)}</td></tr>
          <tr><td style="padding:3px 0;">Genel gider payı</td><td style="text-align:right;color:#C62828;">-${accTL(h.genelGider)}</td></tr>
          <tr style="border-top:1px solid #E1BEE7;"><td style="padding:5px 0;font-weight:800;">NET KÂR</td><td style="text-align:right;font-weight:800;color:${h.netKar >= 0 ? "#2E7D32" : "#C62828"};">${accTL(h.netKar)}</td></tr>
        </table>
        <p style="font-size:11px;font-weight:700;margin:0 0 6px;color:#880E4F;">İşlemler (${h.adet})</p>
        ${islemler}
      </div>`;
    }
  }

  return `
    <div class="card p4 mb3" style="background:linear-gradient(135deg,#880E4F,#AD1457);color:#fff;border:none;">
      <p style="font-size:13px;font-weight:700;margin:0 0 2px;">👤 Hasta Bazlı Kârlılık</p>
      <p style="font-size:10.5px;opacity:.85;margin:0 0 10px;">${liste.length} hasta · ${accTL0(toplamCiro)} ciro</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:8px;">
          <p style="font-size:9px;margin:0;opacity:.85;">TOPLAM NET KÂR</p>
          <p style="font-size:15px;font-weight:800;margin:2px 0 0;">${accTL0(toplamKar)}</p>
        </div>
        <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:8px;">
          <p style="font-size:9px;margin:0;opacity:.85;">TEKRAR GELEN</p>
          <p style="font-size:15px;font-weight:800;margin:2px 0 0;">%${tekrarOrani.toFixed(0)}</p>
        </div>
      </div>
      <p style="font-size:10px;margin:8px 0 0;opacity:.9;">Hasta başına ortalama ciro: <b>${accTL0(ortHasta)}</b></p>
    </div>

    ${detayHtml}

    <div style="display:flex;gap:5px;margin-bottom:10px;">
      ${chip("ciro", "Ciro")}${chip("kar", "Kâr")}${chip("adet", "İşlem")}
    </div>

    ${kayip.length ? `<div class="card p3 mb3" style="background:#FFEBEE;border:1px solid #EF9A9A;">
      <p style="font-size:11.5px;font-weight:700;color:#C62828;margin:0;">⚠️ ${kayip.length} hasta zararda</p>
      <p style="font-size:10px;color:#B71C1C;margin:3px 0 0;">Genel gider payı ciroya göre dağıtıldığında bu hastalar kâr getirmiyor. Fiyatlama veya tedavi süresini gözden geçir.</p>
    </div>` : ""}

    <p class="section-label">Hastalar (${liste.length})</p>
    ${kartlar}

    <div class="card p4 mb3" style="background:#FCE4EC;border:1px solid #F8BBD0;">
      <p style="font-size:11.5px;font-weight:700;color:#880E4F;margin:0 0 6px;">💡 Nasıl hesaplanıyor?</p>
      <p style="font-size:10.5px;color:#AD1457;margin:0;line-height:1.65;">
        <b>Net kâr</b> = Ciro − Malzeme maliyeti − Genel gider payı<br/>
        Genel gider (kira, maaş, elektrik…) her hastaya <b>ciro oranında</b> dağıtılır.
        Bu yüzden çok işlem yapan hasta daha çok gider payı alır.
      </p>
    </div>
  `;
}

/* =========================================================
   3) NAKİT AKIŞ PROJEKSİYONU
========================================================= */

function accNakitAkim(aySayisi) {
  const ay = aySayisi || 3;

  /* Bugünkü nakit */
  const inc = state.accounting.incomes || [];
  const exp = state.accounting.expenses || [];
  const tahsilEdilen = inc.filter(x => x.paid !== false).reduce((s, x) => s + accNum(x.amount), 0);
  const odenen = exp.reduce((s, x) => s + accNum(x.amount), 0);
  const mevcutNakit = tahsilEdilen - odenen;

  /* Bekleyen alacaklar (veresiye) */
  const alacaklar = inc.filter(x => x.paid === false)
    .map(x => ({ ...x, gun: Math.round((new Date() - new Date(x.date)) / 86400000) }))
    .sort((a, b) => b.gun - a.gun);

  /* Ortalama aylık gelir/gider (son 3 ay — gerçek kayıtlar) */
  const son3 = [0, 1, 2].map(i => {
    const d = new Date(); d.setMonth(d.getMonth() - i);
    const k = accKey(d);
    return inc.filter(x => accKey(x.date) === k).reduce((s, x) => s + accNum(x.grossAmount || x.amount), 0);
  });
  const ortAylikGelir = son3.reduce((a, b) => a + b, 0) / 3;

  // Gerçek gider ortalaması (personel hariç — o ayrıca ekleniyor)
  const MALZEME_KAT2 = ["Malzeme", "Sarf Malzeme", "İmplant Malzemesi"];
  const son3Gider = [0, 1, 2].map(i => {
    const d = new Date(); d.setMonth(d.getMonth() - i);
    const k = accKey(d);
    return exp.filter(x => accKey(x.date) === k && !MALZEME_KAT2.includes(x.category))
      .reduce((s, x) => s + accNum(x.amount), 0);
  });
  const ortAylikGider = son3Gider.reduce((a, b) => a + b, 0) / 3;

  /* Aylık sabit giderler */
  const ae = state.autoExpenses || { kira: 50000, elektrik: 3000, su: 1500, dogalgaz: 2000, sgk: 8000, vergi: 5000 };
  const pt = accPayrollTotal();

  // Personel varsa SGK autoExpenses'ten çıkarılır (personel maliyeti içinde zaten var) — çift sayım olmasın
  const sabitGider = Object.keys(ae).reduce((s, k) => {
    if (k === "sgk" && pt.kisi > 0) return s;
    if (k === "vergi") return s; // vergiler ayrıca hesaplanıyor
    return s + accNum(ae[k]);
  }, 0);
  const personelMaliyet = pt.isvereneMaliyet;

  const bugun = new Date();
  const projeksiyon = [];

  for (let i = 0; i < ay; i++) {
    const d = new Date(bugun.getFullYear(), bugun.getMonth() + i, 1);
    const yil = d.getFullYear();
    const ayNo = d.getMonth() + 1;
    const key = accKey(d);

    // Beklenen gelir: ortalama + vadesi gelen veresiye
    const vadesiGelenAlacak = i === 0 ? alacaklar.slice(0, 3).reduce((s, x) => s + accNum(x.amount), 0) : 0;
    const beklenenGelir = ortAylikGelir + vadesiGelenAlacak;

    // KDV (önceki ayın)
    const kdvSeri = accKdvSeri(yil);
    const kdvOdenecek = ayNo === 1 ? 0 : (kdvSeri[ayNo - 2]?.odenecek || 0);

    // Geçici vergi
    let gecici = 0;
    GECICI_VERGI_DONEM.forEach(g => {
      const v = new Date(yil, g.son[0], g.son[1]);
      if (v.getFullYear() === d.getFullYear() && v.getMonth() === d.getMonth()) {
        const gv = accGeciciVergi(yil, g.d);
        gecici += gv ? gv.odenecek : 0;
      }
    });

    // Yıllık GV taksitleri
    let yillikGV = 0;
    if (ayNo === 3) { // Mart
      const ygv = accYillikGelirVergisi(yil - 1);
      yillikGV = ygv.taksit1;
    }
    if (ayNo === 7) { // Temmuz
      const ygv = accYillikGelirVergisi(yil - 1);
      yillikGV = ygv.taksit2;
    }

    // Gerçek gider kaydı varsa onu kullan, yoksa sabit gider tahmini
    const isletmeGider = ortAylikGider > 0 ? ortAylikGider : sabitGider;
    const toplamGider = isletmeGider + personelMaliyet + kdvOdenecek + gecici + yillikGV;
    const net = beklenenGelir - toplamGider;

    projeksiyon.push({
      donem: accAyAdi(yil, ayNo),
      kisa: d.toLocaleDateString("tr-TR", { month: "short" }),
      yil, ay: ayNo,
      gelir: beklenenGelir,
      gider: toplamGider,
      detay: { sabitGider: isletmeGider, personelMaliyet, kdvOdenecek, gecici, yillikGV, vadesiGelenAlacak },
      net
    });
  }

  /* Kümülatif nakit */
  let kumulatif = mevcutNakit;
  projeksiyon.forEach(p => {
    kumulatif += p.net;
    p.kumulatif = kumulatif;
  });

  const enDusuk = Math.min(...projeksiyon.map(p => p.kumulatif));
  const riskAy = projeksiyon.find(p => p.kumulatif < 0);

  return {
    mevcutNakit, alacaklar, ortAylikGelir, ortAylikGider,
    sabitGider, personelMaliyet,
    projeksiyon, enDusuk, riskAy
  };
}

function renderAccNakit() {
  const aySayisi = state.nakitAy || 3;
  const n = accNakitAkim(aySayisi);

  const chip = (v, l) => {
    const aktif = aySayisi === v;
    return `<button data-action="nakit-ay" data-ay="${v}" style="flex:1;padding:7px;border-radius:9px;font-size:11px;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif;border:1px solid ${aktif ? "#006064" : "var(--line)"};background:${aktif ? "#006064" : "rgba(255,255,255,.7)"};color:${aktif ? "#fff" : "var(--ink)"};cursor:pointer;">${l}</button>`;
  };

  const maxVal = Math.max(1, ...n.projeksiyon.map(p => Math.max(p.gelir, p.gider)));

  const bar = n.projeksiyon.map(p => `
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;">
      <div style="display:flex;gap:2px;align-items:flex-end;height:100%;width:100%;justify-content:center;">
        <div title="Gelir ${accTL0(p.gelir)}" style="width:38%;background:#2E7D32;border-radius:3px 3px 0 0;height:${Math.max(3, p.gelir / maxVal * 100)}%;"></div>
        <div title="Gider ${accTL0(p.gider)}" style="width:38%;background:#C62828;border-radius:3px 3px 0 0;height:${Math.max(3, p.gider / maxVal * 100)}%;"></div>
      </div>
      <span style="font-size:9px;color:#888;margin-top:4px;">${p.kisa}</span>
    </div>`).join("");

  const ayKartlari = n.projeksiyon.map(p => {
    const renk = p.kumulatif >= 0 ? "#2E7D32" : "#C62828";
    return `<div class="card p3 mb2">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <p style="font-size:12px;font-weight:700;margin:0;">${escapeHtml(p.donem)}</p>
        <span style="font-size:9.5px;font-weight:700;color:${renk};background:${renk}15;padding:3px 7px;border-radius:10px;">
          Bakiye ${accTL0(p.kumulatif)}
        </span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:10.5px;margin-bottom:3px;">
        <span style="color:#2E7D32;font-weight:600;">+ Gelir ${accTL0(p.gelir)}</span>
        <span style="color:#C62828;font-weight:600;">− Gider ${accTL0(p.gider)}</span>
      </div>
      <div style="height:5px;background:#EEE;border-radius:3px;overflow:hidden;margin-bottom:5px;">
        <div style="height:100%;width:${Math.min(100, p.gelir / Math.max(1, p.gider) * 50)}%;background:#2E7D32;"></div>
      </div>
      <p style="font-size:9.5px;color:var(--muted);margin:0;line-height:1.6;">
        Sabit ${accTL0(p.detay.sabitGider)} · Personel ${accTL0(p.detay.personelMaliyet)}
        ${p.detay.kdvOdenecek > 0 ? " · KDV " + accTL0(p.detay.kdvOdenecek) : ""}
        ${p.detay.gecici > 0 ? " · Geçici V. " + accTL0(p.detay.gecici) : ""}
        ${p.detay.yillikGV > 0 ? " · Yıllık GV " + accTL0(p.detay.yillikGV) : ""}
      </p>
    </div>`;
  }).join("");

  const alacakSatir = n.alacaklar.slice(0, 10).map(x => {
    const renk = x.gun > 60 ? "#C62828" : x.gun > 30 ? "#E65100" : "#2E7D32";
    return `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--line);">
      <div style="flex:1;min-width:0;">
        <p style="font-size:11px;margin:0;font-weight:600;">${escapeHtml((x.firm || x.description || "").substring(0, 28))}</p>
        <p style="font-size:9px;color:var(--muted);margin:1px 0 0;">${x.gun} gün bekliyor</p>
      </div>
      <p style="font-size:11px;font-weight:700;margin:0;color:${renk};">${accTL0(x.amount)}</p>
    </div>`;
  }).join("") || `<p class="footnote">Bekleyen alacak yok.</p>`;

  return `
    <div style="display:flex;gap:5px;margin-bottom:12px;">
      ${chip(3, "3 Ay")}${chip(6, "6 Ay")}${chip(12, "12 Ay")}
    </div>

    <div class="card p4 mb3" style="background:linear-gradient(135deg,${n.mevcutNakit >= 0 ? "#004D40,#00695C" : "#B71C1C,#C62828"});color:#fff;border:none;">
      <p style="font-size:13px;font-weight:700;margin:0 0 2px;">💰 Nakit Akış Projeksiyonu</p>
      <p style="font-size:10.5px;opacity:.85;margin:0 0 10px;">Bugünkü kasa + gelecek ${aySayisi} ay</p>
      <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:10px;">
        <p style="font-size:9.5px;margin:0;opacity:.85;">MEVCUT NAKİT</p>
        <p style="font-size:22px;font-weight:800;margin:2px 0 0;">${accTL(n.mevcutNakit)}</p>
      </div>
      <p style="font-size:10px;margin:8px 0 0;opacity:.9;">Ortalama aylık gelir: <b>${accTL0(n.ortAylikGelir)}</b> · Sabit gider: <b>${accTL0(n.sabitGider + n.personelMaliyet)}</b></p>
    </div>

    ${n.riskAy ? `<div class="card p3 mb3" style="background:#FFEBEE;border:1px solid #EF9A9A;">
      <p style="font-size:12px;font-weight:700;color:#C62828;margin:0;">🔴 Risk: ${escapeHtml(n.riskAy.donem)} ayında nakit eksiye düşüyor</p>
      <p style="font-size:10px;color:#B71C1C;margin:3px 0 0;">Tahmini açık: ${accTL(Math.abs(n.riskAy.kumulatif))} — tahsilatları hızlandırın veya giderleri erteleyin.</p>
    </div>` : `<div class="card p3 mb3" style="background:#E8F5E9;border:1px solid #A5D6A7;">
      <p style="font-size:12px;font-weight:700;color:#1B5E20;margin:0;">✅ ${aySayisi} aylık projeksiyonda nakit yeterli</p>
      <p style="font-size:10px;color:#2E7D32;margin:3px 0 0;">En düşük bakiye: ${accTL(n.enDusuk)}</p>
    </div>`}

    <div class="card p4 mb3">
      <p style="font-size:12.5px;font-weight:700;margin:0 0 10px;">📊 Gelir / Gider Karşılaştırma</p>
      <div style="display:flex;align-items:flex-end;gap:8px;height:120px;padding-top:8px;">${bar}</div>
      <div style="display:flex;gap:14px;justify-content:center;margin-top:8px;font-size:10px;">
        <span><span style="display:inline-block;width:9px;height:9px;background:#2E7D32;border-radius:2px;"></span> Gelir</span>
        <span><span style="display:inline-block;width:9px;height:9px;background:#C62828;border-radius:2px;"></span> Gider</span>
      </div>
    </div>

    <p class="section-label">Aylık Detay</p>
    ${ayKartlari}

    ${n.alacaklar.length ? `<p class="section-label" style="margin-top:14px;">💳 Tahsil Bekleyen (${n.alacaklar.length})</p>
    <div class="card p4 mb3">
      <p style="font-size:10px;color:var(--muted);margin:0 0 8px;">Toplam: <b>${accTL(n.alacaklar.reduce((s, x) => s + accNum(x.amount), 0))}</b></p>
      ${alacakSatir}
    </div>` : ""}

    <div class="card p4 mb3" style="background:#E0F7FA;border:1px solid #80DEEA;">
      <p style="font-size:11.5px;font-weight:700;color:#006064;margin:0 0 6px;">💡 Nasıl hesaplanıyor?</p>
      <p style="font-size:10.5px;color:#00838F;margin:0;line-height:1.65;">
        <b>Gelir:</b> son 3 ayın ortalaması + vadesi gelen veresiye<br/>
        <b>Gider:</b> otomatik giderler + personel maliyeti + KDV + geçici vergi + yıllık taksitler<br/>
        Amaç: <b>hangi ayda para sıkışacaksın</b> önceden görmek.
      </p>
    </div>
  `;
}

function renderAccStok() {
  const liste = state.stok || [];
  const kritik = stokKritikler();
  const toplamDeger = stokToplamDeger();
  const toplamKalem = liste.length;
  const buAyHareket = (state.stokHareket || []).filter(h => accKey(h.tarih) === accKey()).length;

  const ed = state.stokEdit;
  let formHtml = "";
  if (ed !== null && ed !== undefined) {
    const s = liste.find(x => x.id === ed) || { id: "", ad: "", kategori: "Sarf Malzeme", birim: "Adet", miktar: "", minSeviye: "", birimFiyat: "", tedarikci: "", notlar: "" };
    formHtml = `<div class="card p4 mb3" style="border:2px solid #00838F;background:#E0F7FA;">
      <p style="font-size:13px;font-weight:700;margin:0 0 10px;color:#006064;">${s.id ? "✏️ Malzemeyi Düzenle" : "➕ Yeni Malzeme"}</p>
      <div class="field"><label>Malzeme adı</label><input class="input" id="st-ad" value="${escapeAttr(s.ad || "")}" placeholder="Örn: Kompozit dolgu A2" /></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div class="field"><label>Kategori</label>
          <select class="input" id="st-kategori">
            ${STOK_KATEGORI.map(k => `<option ${s.kategori === k ? "selected" : ""}>${k}</option>`).join("")}
          </select>
        </div>
        <div class="field"><label>Birim</label>
          <select class="input" id="st-birim">
            ${STOK_BIRIMLER.map(b => `<option ${s.birim === b ? "selected" : ""}>${b}</option>`).join("")}
          </select>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div class="field"><label>Mevcut miktar</label><input class="input" type="number" id="st-miktar" value="${accNum(s.miktar)}" /></div>
        <div class="field"><label>Kritik seviye</label><input class="input" type="number" id="st-min" value="${accNum(s.minSeviye)}" placeholder="Altına düşünce uyarır" /></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div class="field"><label>Birim fiyat (₺)</label><input class="input" type="number" step="0.01" id="st-fiyat" value="${accNum(s.birimFiyat)}" /></div>
        <div class="field"><label>Tedarikçi</label><input class="input" id="st-tedarikci" value="${escapeAttr(s.tedarikci || "")}" /></div>
      </div>
      <div class="field"><label>Not</label><input class="input" id="st-not" value="${escapeAttr(s.notlar || "")}" placeholder="Marka, lot no, raf..." /></div>
      <div style="display:flex;gap:8px;">
        <button class="btn-primary" style="background:#00838F;" data-action="stok-save" data-id="${s.id || ""}">💾 Kaydet</button>
        <button class="btn-primary" style="background:#757575;" data-action="stok-cancel">İptal</button>
      </div>
    </div>`;
  }

  const satirlar = liste.slice().sort((a, b) => {
    const ka = accNum(a.miktar) <= accNum(a.minSeviye) ? 0 : 1;
    const kb = accNum(b.miktar) <= accNum(b.minSeviye) ? 0 : 1;
    return ka - kb || (a.ad || "").localeCompare(b.ad || "", "tr");
  }).map(s => {
    const miktar = accNum(s.miktar);
    const min = accNum(s.minSeviye);
    const kritikMi = min > 0 && miktar <= min;
    const bitmis = miktar <= 0;
    const renk = bitmis ? "#C62828" : kritikMi ? "#E65100" : "#2E7D32";
    const bg = bitmis ? "#FFEBEE" : kritikMi ? "#FFF8E1" : "transparent";
    const oran = min > 0 ? Math.min(100, (miktar / (min * 3)) * 100) : 100;

    return `<div class="card p3 mb2" style="background:${bg};">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
        <div style="flex:1;min-width:0;">
          <p style="font-size:12.5px;font-weight:700;margin:0;">${bitmis ? "🔴" : kritikMi ? "🟠" : "🟢"} ${escapeHtml(s.ad)}</p>
          <p style="font-size:10px;color:var(--muted);margin:2px 0 0;">${escapeHtml(s.kategori || "")}${s.tedarikci ? " · " + escapeHtml(s.tedarikci) : ""}</p>
          <p style="font-size:13px;font-weight:800;color:${renk};margin:4px 0 0;">${miktar.toLocaleString("tr-TR")} ${escapeHtml(s.birim || "")}${kritikMi ? " ⚠️" : ""}</p>
          ${min > 0 ? `<div style="height:5px;background:#EEE;border-radius:3px;margin-top:5px;overflow:hidden;">
            <div style="height:100%;width:${oran}%;background:${renk};border-radius:3px;"></div>
          </div>
          <p style="font-size:9px;color:#888;margin:3px 0 0;">Kritik: ${min} ${escapeHtml(s.birim || "")}</p>` : ""}
          ${accNum(s.birimFiyat) > 0 ? `<p style="font-size:9.5px;color:#666;margin:2px 0 0;">Değer: ${accTL(stokDeger(s))} · Birim: ${accTL(accNum(s.birimFiyat))}</p>` : ""}
        </div>
        <div style="display:flex;flex-direction:column;gap:4px;flex-shrink:0;">
          <button data-action="stok-giris" data-id="${s.id}" title="Stok girişi" style="background:#E8F5E9;border:none;border-radius:6px;padding:5px 8px;cursor:pointer;font-size:11px;">➕</button>
          <button data-action="stok-cikis" data-id="${s.id}" title="Kullanım" style="background:#FFF3E0;border:none;border-radius:6px;padding:5px 8px;cursor:pointer;font-size:11px;">➖</button>
          <button data-action="stok-edit" data-id="${s.id}" style="background:#E0F7FA;border:none;border-radius:6px;padding:5px 8px;cursor:pointer;font-size:11px;">✏️</button>
          <button data-action="stok-delete" data-id="${s.id}" style="background:#FFEBEE;border:none;border-radius:6px;padding:5px 8px;cursor:pointer;font-size:11px;color:#C62828;">🗑️</button>
        </div>
      </div>
    </div>`;
  }).join("") || `<div class="card p4" style="text-align:center;"><p class="footnote" style="margin:0;">Henüz malzeme eklenmedi.<br/>Gider kaydı eklerken <b>"stoğa da ekle"</b> işaretleyerek başlayabilirsiniz.</p></div>`;

  /* Son hareketler */
  const hareketler = (state.stokHareket || []).slice(0, 12).map(h => {
    const s = stokBul(h.stokId);
    const tipRenk = h.tip === "giris" ? "#2E7D32" : h.tip === "cikis" ? "#E65100" : "#1565C0";
    const tipIkon = h.tip === "giris" ? "➕" : h.tip === "cikis" ? "➖" : "📋";
    return `<div style="display:flex;justify-content:space-between;gap:8px;padding:7px 0;border-bottom:1px solid var(--line);">
      <div style="flex:1;min-width:0;">
        <p style="font-size:11.5px;margin:0;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${tipIkon} ${escapeHtml(s ? s.ad : "Silinmiş malzeme")}</p>
        <p style="font-size:9.5px;color:var(--muted);margin:2px 0 0;">${accTarihTR(h.tarih)} · ${escapeHtml(h.aciklama || "")}</p>
      </div>
      <div style="text-align:right;flex-shrink:0;">
        <p style="font-size:11.5px;font-weight:700;margin:0;color:${tipRenk};">${h.tip === "cikis" ? "−" : "+"}${accNum(h.miktar).toLocaleString("tr-TR")} ${escapeHtml(s ? s.birim : "")}</p>
        <p style="font-size:9px;color:#999;margin:1px 0 0;">Kalan: ${accNum(h.kalan).toLocaleString("tr-TR")}</p>
      </div>
    </div>`;
  }).join("") || `<p class="footnote">Hareket kaydı yok.</p>`;

  return `
    <div class="card p4 mb3" style="background:linear-gradient(135deg,#004D40,#00695C);color:#fff;border:none;">
      <p style="font-size:13px;font-weight:700;margin:0 0 2px;">📦 Stok ve Malzeme Takibi</p>
      <p style="font-size:10.5px;opacity:.85;margin:0 0 10px;">${toplamKalem} kalem · bu ay ${buAyHareket} hareket</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:8px;">
          <p style="font-size:9px;margin:0;opacity:.85;">STOK DEĞERİ</p>
          <p style="font-size:15px;font-weight:800;margin:2px 0 0;">${accTL0(toplamDeger)}</p>
        </div>
        <div style="background:rgba(255,255,255,.${kritik.length ? "3" : "15"});border-radius:10px;padding:8px;${kritik.length ? "border:1px solid rgba(255,180,180,.5);" : ""}">
          <p style="font-size:9px;margin:0;opacity:.85;">KRİTİK KALEM</p>
          <p style="font-size:15px;font-weight:800;margin:2px 0 0;">${kritik.length}${kritik.length ? " ⚠️" : ""}</p>
        </div>
      </div>
      ${kritik.length ? `<p style="font-size:10px;margin:8px 0 0;opacity:.95;">⚠️ Sipariş vermeniz gereken: ${kritik.slice(0, 3).map(x => x.ad).join(", ")}${kritik.length > 3 ? " ve " + (kritik.length - 3) + " tane daha" : ""}</p>` : ""}
    </div>

    ${formHtml}
    ${ed === null || ed === undefined ? `<button class="btn-primary mb3" style="background:#00838F;" data-action="stok-new">➕ Yeni Malzeme Ekle</button>` : ""}

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px;">
      <button class="btn-primary" style="background:#0E93AC;font-size:11.5px;padding:11px;" data-action="stok-csv">⬇️ CSV İndir</button>
      <button class="btn-primary" style="background:#00695C;font-size:11.5px;padding:11px;" data-action="stok-yazdir">🖨️ Stok Listesi</button>
    </div>

    <p class="section-label">Malzemeler (${liste.length})</p>
    ${satirlar}

    <p class="section-label" style="margin-top:16px;">📋 Son Hareketler</p>
    <div class="card p4 mb3">${hareketler}</div>

    <div class="card p4 mb3" style="background:#E0F7FA;border:1px solid #80DEEA;">
      <p style="font-size:11.5px;font-weight:700;color:#006064;margin:0 0 6px;">💡 Nasıl çalışır?</p>
      <p style="font-size:10.5px;color:#00838F;margin:0;line-height:1.65;">
        <b>Gider eklerken</b> "Stoğa da ekle" kutusunu işaretlersen, aldığın malzeme
        otomatik buraya düşer — muhasebe ve stok tek işlemde güncellenir.<br/>
        <b>➕</b> ile dışarıdan gelen malzeme, <b>➖</b> ile kullanım (tedavi sırasında harcanan) kaydı girersin.
        Kritik seviyeye düşen malzeme <b>uyarı merkezinde</b> görünür.
      </p>
    </div>
  `;
}
