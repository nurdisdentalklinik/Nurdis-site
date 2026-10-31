/* =========================================================
   NUR DİŞ — MALİ DETAY — e-fatura, mutabakat, mizan, tablolar, yıllık rapor
   app.js'ten bölündü · index.html yükleme sırası önemli
========================================================= */

/* =========================================================
   GİDER FORMUNA "STOĞA EKLE" ALANI
========================================================= */

function stokGiderFormu() {
  return `
    <div style="margin-top:10px;padding:10px;background:#E0F7FA;border:1px solid #80DEEA;border-radius:10px;">
      <label style="font-size:12px;display:flex;align-items:center;gap:8px;font-weight:700;color:#006064;cursor:pointer;">
        <input type="checkbox" id="exp-stok-ekle" onchange="document.getElementById('exp-stok-alanlari').style.display=this.checked?'block':'none';" />
        <span>📦 Bu alımı stoğa da ekle</span>
      </label>
      <div id="exp-stok-alanlari" style="display:none;margin-top:9px;">
        <div class="field" style="margin-bottom:8px;">
          <label style="font-size:10px;color:#00838F;">Malzeme adı</label>
          <input class="input" id="exp-stok-ad" placeholder="Örn: Kompozit dolgu A2" style="font-size:11.5px;padding:8px;" list="stok-adlari" />
          <datalist id="stok-adlari">${(state.stok || []).map(s => `<option value="${escapeAttr(s.ad)}"></option>`).join("")}</datalist>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;">
          <div>
            <label style="font-size:10px;color:#00838F;">Miktar</label>
            <input class="input" type="number" id="exp-stok-miktar" placeholder="10" style="font-size:11.5px;padding:8px;" />
          </div>
          <div>
            <label style="font-size:10px;color:#00838F;">Birim</label>
            <select class="input" id="exp-stok-birim" style="font-size:11.5px;padding:8px;">
              ${STOK_BIRIMLER.map(b => `<option>${b}</option>`).join("")}
            </select>
          </div>
          <div>
            <label style="font-size:10px;color:#00838F;">Kategori</label>
            <select class="input" id="exp-stok-kategori" style="font-size:11.5px;padding:8px;">
              ${STOK_KATEGORI.map(k => `<option>${k}</option>`).join("")}
            </select>
          </div>
        </div>
        <div class="field" style="margin:8px 0 0;">
          <label style="font-size:10px;color:#00838F;">Kritik seviye (altına düşünce uyarır)</label>
          <input class="input" type="number" id="exp-stok-min" placeholder="Örn: 3" style="font-size:11.5px;padding:8px;" />
        </div>
        <p style="font-size:9.5px;color:#00838F;margin:7px 0 0;line-height:1.5;">
          Malzeme adı daha önce eklenmişse mevcut kayda <b>eklenir</b>, yoksa yeni oluşturulur.
          Birim fiyat gider tutarından otomatik hesaplanır.
        </p>
      </div>
    </div>`;
}

function renderAccBordro() {
  const simdi = new Date();
  const yil = state.bordroYil || simdi.getFullYear();
  const ay = state.bordroAy || (simdi.getMonth() + 1);
  const liste = accBordroTumu(yil, ay);
  const t = accPayrollTotal();

  const yilChip = [yil - 1, yil, yil + 1].map(y =>
    `<button data-action="bordro-yil" data-yil="${y}" style="flex:1;padding:7px;border-radius:9px;font-size:11.5px;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif;border:1px solid ${y === yil ? "#00695C" : "var(--line)"};background:${y === yil ? "#00695C" : "rgba(255,255,255,.7)"};color:${y === yil ? "#fff" : "var(--ink)"};cursor:pointer;">${y}</button>`).join("");

  const ayChip = Array.from({ length: 12 }, (_, i) => i + 1).map(m => {
    const aktif = m === ay;
    return `<button data-action="bordro-ay" data-ay="${m}" style="flex:0 0 auto;min-width:38px;padding:6px 4px;border-radius:8px;font-size:11px;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif;border:1px solid ${aktif ? "#00695C" : "var(--line)"};background:${aktif ? "#00695C" : "rgba(255,255,255,.7)"};color:${aktif ? "#fff" : "var(--ink)"};cursor:pointer;">${m}</button>`;
  }).join("");

  const kartlar = liste.map(b => `
    <div class="card p3 mb2">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
        <div style="flex:1;min-width:0;">
          <p style="font-size:12.5px;font-weight:700;margin:0;">${escapeHtml(b.personel.name)}</p>
          <p style="font-size:10px;color:var(--muted);margin:2px 0 0;">${escapeHtml(b.personel.position || "")} · ${b.gun} gün</p>
          <p style="font-size:10.5px;color:#2E7D32;margin:3px 0 0;font-weight:700;">Net: ${accTL(b.netUcret)}</p>
          <p style="font-size:9.5px;color:#888;margin:1px 0 0;">Brüt ${accTL(b.brutUcret)} · Kesinti ${accTL(b.kesintiToplam)}</p>
        </div>
        <button data-action="bordro-tek" data-id="${b.personel.id}" style="background:#E0F2F1;border:none;border-radius:6px;padding:6px 9px;cursor:pointer;font-size:11px;">🖨️</button>
      </div>
    </div>`).join("") || `<p class="footnote">Bu dönem için aktif personel yok.</p>`;

  return `
    <div style="display:flex;gap:6px;margin-bottom:8px;">${yilChip}</div>
    <div style="display:flex;gap:5px;overflow-x:auto;padding-bottom:6px;margin-bottom:12px;">${ayChip}</div>

    <div class="card p4 mb3" style="background:linear-gradient(135deg,#004D40,#00695C);color:#fff;border:none;">
      <p style="font-size:13px;font-weight:700;margin:0 0 2px;">📄 ${accAyAdi(yil, ay)} Bordrosu</p>
      <p style="font-size:10.5px;opacity:.85;margin:0 0 10px;">${liste.length} personel</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:8px;">
          <p style="font-size:9px;margin:0;opacity:.85;">TOPLAM NET</p>
          <p style="font-size:15px;font-weight:800;margin:2px 0 0;">${accTL0(liste.reduce((s, b) => s + b.netUcret, 0))}</p>
        </div>
        <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:8px;">
          <p style="font-size:9px;margin:0;opacity:.85;">İŞVERENE MALİYET</p>
          <p style="font-size:15px;font-weight:800;margin:2px 0 0;">${accTL0(liste.reduce((s, b) => s + b.isvereneMaliyet, 0))}</p>
        </div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px;">
      <button class="btn-primary" style="background:#00695C;font-size:11.5px;padding:11px;" data-action="bordro-hepsi">🖨️ Tüm Bordroyu Yazdır</button>
      <button class="btn-primary" style="background:#0E93AC;font-size:11.5px;padding:11px;" data-action="bordro-csv">⬇️ CSV İndir</button>
    </div>

    <p class="section-label">Personel Bordroları (${liste.length})</p>
    ${kartlar}

    <div class="card p4 mb3" style="background:#E0F2F1;border:1px solid #80CBC4;">
      <p style="font-size:11.5px;font-weight:700;color:#00695C;margin:0 0 6px;">💡 Bordro nedir, neden gerekli?</p>
      <p style="font-size:10.5px;color:#00897B;margin:0;line-height:1.6;">
        Bordro, işçiye ödenen ücretin yasal dökümüdür. SGK denetiminde, iş davalarında ve
        personelin imzasıyla birlikte <b>ispat belgesi</b> niteliği taşır.
        Her ay yazdırıp imzalatmanız önerilir.
      </p>
    </div>
  `;
}

/* =========================================================
   2) e-FATURA / e-ARŞİV (UBL-TR)
========================================================= */

/* Türkiye e-Fatura standartı: UBL-TR 1.2 */
function accUblTR(fatura) {
  const now = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const id = (fatura.invoiceNo || ("NUR" + Date.now())).replace(/\s/g, "");
  const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
  });
  const kdvOran = fatura.kdvOran != null ? fatura.kdvOran : 0.10;
  const brut = accNum(fatura.grossAmount || fatura.amount);
  const kdv = accNum(fatura.kdv) || brut * kdvOran;
  const matrah = brut;
  const toplam = matrah + kdv;
  const vknTckn = (fatura.tcNo || fatura.vkn || "").replace(/\D/g, "");
  const saticiVkn = (state.firmaBilgi && state.firmaBilgi.vergiNo ? state.firmaBilgi.vergiNo : "").replace(/\D/g, "");

  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>TR1.2</cbc:CustomizationID>
  <cbc:ProfileID>EARSIVFATURA</cbc:ProfileID>
  <cbc:ID>${id}</cbc:ID>
  <cbc:CopyIndicator>false</cbc:CopyIndicator>
  <cbc:UUID>${uuid}</cbc:UUID>
  <cbc:IssueDate>${(fatura.date || accToday())}</cbc:IssueDate>
  <cbc:IssueTime>${new Date().toTimeString().slice(0, 8)}</cbc:IssueTime>
  <cbc:InvoiceTypeCode>SATIS</cbc:InvoiceTypeCode>
  <cbc:Note>${escapeHtml(fatura.notes || "Dis Tedavi Hizmeti")}</cbc:Note>
  <cbc:DocumentCurrencyCode>TRY</cbc:DocumentCurrencyCode>
  <cbc:LineCountNumeric>1</cbc:LineCountNumeric>

  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="VKN">${saticiVkn || "0000000000"}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyName>
        <cbc:Name>${escapeHtml((state.firmaBilgi && state.firmaBilgi.unvan) || "NUR DIS & DENTAL KLINIK")}</cbc:Name>
      </cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>${escapeHtml((state.firmaBilgi && state.firmaBilgi.adres) || "Mardin Kiziltepe TOKI")}</cbc:StreetName>
        <cbc:CitySubdivisionName>${escapeHtml((state.firmaBilgi && state.firmaBilgi.ilce) || "Kiziltepe")}</cbc:CitySubdivisionName>
        <cbc:CityName>${escapeHtml((state.firmaBilgi && state.firmaBilgi.il) || "Mardin")}</cbc:CityName>
        <cac:Country>
          <cbc:Name>Turkiye</cbc:Name>
        </cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cac:TaxScheme>
          <cbc:Name>Kiziltepe</cbc:Name>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:Contact>
        <cbc:Telephone>${escapeHtml((state.firmaBilgi && state.firmaBilgi.telefon) || "05051050302")}</cbc:Telephone>
        <cbc:ElectronicMail>${escapeHtml((state.firmaBilgi && state.firmaBilgi.eposta) || "nurdisdentalklinik@gmail.com")}</cbc:ElectronicMail>
      </cac:Contact>
    </cac:Party>
  </cac:AccountingSupplierParty>

  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="${vknTckn.length === 10 ? "VKN" : "TCKN"}">${vknTckn || "11111111111"}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyName>
        <cbc:Name>${escapeHtml(fatura.firm || fatura.description || "Musteri")}</cbc:Name>
      </cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>-</cbc:StreetName>
        <cbc:CitySubdivisionName>-</cbc:CitySubdivisionName>
        <cbc:CityName>-</cbc:CityName>
        <cac:Country><cbc:Name>Turkiye</cbc:Name></cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cac:TaxScheme><cbc:Name>-</cbc:Name></cac:TaxScheme>
      </cac:PartyTaxScheme>
    </cac:Party>
  </cac:AccountingCustomerParty>

  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="TRY">${kdv.toFixed(2)}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="TRY">${matrah.toFixed(2)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="TRY">${kdv.toFixed(2)}</cbc:TaxAmount>
      <cbc:Percent>${(kdvOran * 100).toFixed(0)}</cbc:Percent>
      <cac:TaxCategory>
        <cac:TaxScheme><cbc:Name>KDV</cbc:Name><cbc:TaxTypeCode>0015</cbc:TaxTypeCode></cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>

  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="TRY">${matrah.toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="TRY">${matrah.toFixed(2)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="TRY">${toplam.toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="TRY">${toplam.toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>

  <cac:InvoiceLine>
    <cbc:ID>1</cbc:ID>
    <cbc:InvoicedQuantity unitCode="C62">1</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="TRY">${matrah.toFixed(2)}</cbc:LineExtensionAmount>
    <cac:TaxTotal>
      <cbc:TaxAmount currencyID="TRY">${kdv.toFixed(2)}</cbc:TaxAmount>
      <cac:TaxSubtotal>
        <cbc:TaxableAmount currencyID="TRY">${matrah.toFixed(2)}</cbc:TaxableAmount>
        <cbc:TaxAmount currencyID="TRY">${kdv.toFixed(2)}</cbc:TaxAmount>
        <cbc:Percent>${(kdvOran * 100).toFixed(0)}</cbc:Percent>
        <cac:TaxCategory>
          <cac:TaxScheme><cbc:Name>KDV</cbc:Name><cbc:TaxTypeCode>0015</cbc:TaxTypeCode></cac:TaxScheme>
        </cac:TaxCategory>
      </cac:TaxSubtotal>
    </cac:TaxTotal>
    <cac:Item>
      <cbc:Name>${escapeHtml(fatura.category || "Dis Tedavi Hizmeti")}</cbc:Name>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="TRY">${matrah.toFixed(2)}</cbc:PriceAmount>
    </cac:Price>
  </cac:InvoiceLine>
</Invoice>`;
}

function renderAccEFatura() {
  const inc = (state.accounting.incomes || []).slice().sort((a, b) => new Date(b.date) - new Date(a.date));
  const buAy = inc.filter(x => accKey(x.date) === accKey());
  const fb = state.firmaBilgi || {};

  const son = inc.slice(0, 15).map(x => `
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--line);">
      <div style="flex:1;min-width:0;">
        <p style="font-size:11.5px;font-weight:600;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(x.description || "")}</p>
        <p style="font-size:9.5px;color:var(--muted);margin:2px 0 0;">${escapeHtml(x.invoiceNo || "fatura no yok")} · ${accTarihTR(x.date)} · ${accTL(x.grossAmount || x.amount)}</p>
      </div>
      <button data-action="efatura-indir" data-id="${x.id}" style="background:#E3F2FD;border:none;border-radius:6px;padding:5px 8px;cursor:pointer;font-size:10px;font-weight:700;color:#1565C0;">XML</button>
    </div>`).join("") || `<p class="footnote">Henüz fatura kaydı yok.</p>`;

  return `
    <div class="card p4 mb3" style="background:linear-gradient(135deg,#0D47A1,#1565C0);color:#fff;border:none;">
      <p style="font-size:13px;font-weight:700;margin:0 0 2px;">🧾 e-Fatura / e-Arşiv</p>
      <p style="font-size:10.5px;opacity:.85;margin:0 0 10px;">UBL-TR 1.2 formatında · ${inc.length} fatura</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:8px;">
          <p style="font-size:9px;margin:0;opacity:.85;">BU AY</p>
          <p style="font-size:15px;font-weight:800;margin:2px 0 0;">${buAy.length}</p>
        </div>
        <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:8px;">
          <p style="font-size:9px;margin:0;opacity:.85;">BU AY TOPLAM</p>
          <p style="font-size:15px;font-weight:800;margin:2px 0 0;">${accTL0(buAy.reduce((s, x) => s + accNum(x.grossAmount || x.amount), 0))}</p>
        </div>
      </div>
    </div>

    <div class="card p4 mb3" style="background:#E8EAF6;border:1px solid #9FA8DA;">
      <p style="font-size:12px;font-weight:700;color:#283593;margin:0 0 8px;">🏢 Firma Bilgileri (faturada kullanılır)</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
        <input class="input" id="fb-unvan" placeholder="Ünvan" value="${escapeAttr(fb.unvan || "NUR DİŞ & DENTAL KLİNİK")}" style="font-size:11px;padding:6px;" />
        <input class="input" id="fb-vergi" placeholder="Vergi / TC No" value="${escapeAttr(fb.vergiNo || "")}" style="font-size:11px;padding:6px;" />
        <input class="input" id="fb-vergiDaire" placeholder="Vergi Dairesi" value="${escapeAttr(fb.vergiDaire || "")}" style="font-size:11px;padding:6px;" />
        <input class="input" id="fb-telefon" placeholder="Telefon" value="${escapeAttr(fb.telefon || "")}" style="font-size:11px;padding:6px;" />
        <input class="input" id="fb-il" placeholder="İl" value="${escapeAttr(fb.il || "Mardin")}" style="font-size:11px;padding:6px;" />
        <input class="input" id="fb-ilce" placeholder="İlçe" value="${escapeAttr(fb.ilce || "Kızıltepe")}" style="font-size:11px;padding:6px;" />
      </div>
      <button class="btn-primary" style="margin-top:8px;background:#283593;font-size:11.5px;padding:10px;" data-action="firma-save">💾 Kaydet</button>
      <p style="font-size:9.5px;color:#5C6BC0;margin:6px 0 0;">Bu bilgiler e-Fatura XML'ine ve yazdırılan belgelere otomatik eklenir.</p>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px;">
      <a href="${ACC_LINKS.gibDijital}" target="_blank" rel="noopener" class="btn-primary" style="text-decoration:none;background:#2E7D32;font-size:11.5px;padding:11px;">🔗 e-Arşiv Portal</a>
      <button class="btn-primary" style="background:#1565C0;font-size:11.5px;padding:11px;" data-action="efatura-hepsi">⬇️ Tüm XML</button>
    </div>

    <p class="section-label">Son Faturalar</p>
    <div class="card p4 mb3">${son}</div>

    <div class="card p4 mb3" style="background:#FFF8E1;border:1px solid #FFD54F;">
      <p style="font-size:11.5px;font-weight:700;color:#E65100;margin:0 0 6px;">⚖️ Yasal Durum</p>
      <p style="font-size:10.5px;color:#8D6E00;margin:0;line-height:1.65;">
        XML dosyasını indirip <b>GİB e-Arşiv Portalı'na</b> yükleyerek faturayı resmîleştirebilirsiniz.
        Belirli ciro üstü mükellefler için e-Fatura zorunludur; e-Arşiv tüm mükelleflere açıktır.
        GİB'e gönderim <b>mali mühür / e-imza</b> gerektirdiği için son adım sizde.
      </p>
    </div>
  `;
}

/* =========================================================
   3) BANKA MUTABAKATI
========================================================= */

/* CSV/TXT banka ekstresini ayrıştırır (tarih; açıklama; tutar) */
function accParseBankCsv(text) {
  const satirlar = text.split(/\r?\n/).filter(s => s.trim());
  const sonuc = [];
  let ayirici = ";";
  if (satirlar.length && satirlar[0].split(",").length > satirlar[0].split(";").length) ayirici = ",";

  satirlar.forEach((s, i) => {
    const p = s.split(ayirici).map(x => x.trim().replace(/^"|"$/g, ""));
    if (p.length < 2) return;

    // Tarih bul
    let tarih = null, tutar = null, aciklama = "";
    for (const alan of p) {
      if (!tarih) {
        const m = alan.match(/^(\d{1,2})[\.\/](\d{1,2})[\.\/](\d{2,4})$/);
        if (m) {
          let y = parseInt(m[3]); if (y < 100) y += 2000;
          tarih = y + "-" + String(parseInt(m[2])).padStart(2, "0") + "-" + String(parseInt(m[1])).padStart(2, "0");
          continue;
        }
        const iso = alan.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (iso) { tarih = alan; continue; }
      }
      // Tutar bul (ondalıklı ve binlik ayraçlı)
      const temiz = alan.replace(/\s/g, "");
      if (tutar === null && /^-?[\d\.]+,\d{2}$/.test(temiz)) {
        tutar = parseFloat(temiz.replace(/\./g, "").replace(",", ".")); continue;
      }
      if (tutar === null && /^-?[\d,]+\.\d{2}$/.test(temiz)) {
        tutar = parseFloat(temiz.replace(/,/g, "")); continue;
      }
      if (tutar === null && /^-?\d+$/.test(temiz) && Math.abs(parseInt(temiz)) > 0 && alan.length <= 12) {
        tutar = parseInt(temiz); continue;
      }
      if (alan.length > aciklama.length && !/^\d+$/.test(alan)) aciklama = alan;
    }

    if (tarih && tutar !== null) {
      sonuc.push({ tarih, tutar, aciklama: aciklama || "Banka hareketi", satir: i + 1 });
    }
  });
  return sonuc;
}

/* Basit benzerlik skoru (kelime örtüşmesi) */
function accBenzerlik(a, b) {
  const norm = s => (s || "").toLowerCase()
    .replace(/[^a-z0-9ğüşıöç\s]/g, " ")
    .split(/\s+/).filter(w => w.length > 2);
  const A = norm(a), B = norm(b);
  if (!A.length || !B.length) return 0;
  let esles = 0;
  A.forEach(w => { if (B.some(x => x === w || (x.length > 3 && w.length > 3 && (x.includes(w) || w.includes(x))))) esles++; });
  return esles / Math.max(A.length, B.length);
}

function accMutabakat(text) {
  const banka = accParseBankCsv(text);
  const kayitlar = [
    ...(state.accounting.incomes || []).map(x => ({ ...x, tip: "gelir" })),
    ...(state.accounting.expenses || []).map(x => ({ ...x, tip: "gider" }))
  ];

  const sonuc = banka.map(b => {
    let enIyi = null, enIyiSkor = 0;
    const absTutar = Math.abs(b.tutar);
    kayitlar.forEach(k => {
      const netTutar = accNum(k.amount);
      const brutTutar = accNum(k.grossAmount || k.amount);
      // Net tutar, brüt tutar veya KDV'li toplam eşleşebilir
      const tutarFark = Math.min(
        Math.abs(netTutar - absTutar),
        Math.abs(brutTutar - absTutar)
      );
      const gunFark = Math.abs((new Date(b.tarih) - new Date(k.date)) / 86400000);
      if (tutarFark > 1 || gunFark > 12) return;
      let skor = 0.55 + (1 - gunFark / 12) * 0.20;
      skor += accBenzerlik(b.aciklama, (k.description || "") + " " + (k.firm || "") + " " + (k.category || "")) * 0.25;
      if (skor > enIyiSkor) { enIyiSkor = skor; enIyi = k; }
    });
    return { banka: b, eslesme: enIyi, skor: enIyiSkor };
  });

  return { banka, sonuc, eslesen: sonuc.filter(x => x.eslesme).length };
}

function renderAccMutabakat() {
  const sonuc = state.mutabakatSonuc;
  const fb = state.firmaBilgi || {};

  let sonucHtml = "";
  if (sonuc) {
    const satirlar = sonuc.sonuc.map(x => {
      const b = x.banka;
      const esl = x.eslesme;
      const renk = esl ? (x.skor > 0.78 ? "#2E7D32" : "#F9A825") : "#C62828";
      return `<div style="padding:8px 0;border-bottom:1px solid var(--line);">
        <div style="display:flex;justify-content:space-between;gap:8px;">
          <div style="flex:1;min-width:0;">
            <p style="font-size:11.5px;font-weight:600;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(b.aciklama)}</p>
            <p style="font-size:9.5px;color:var(--muted);margin:2px 0 0;">${accTarihTR(b.tarih)} · ${accTL(Math.abs(b.tutar))}</p>
          </div>
          <span style="font-size:9.5px;font-weight:700;color:${renk};flex-shrink:0;">${esl ? (x.skor > 0.78 ? "✓ Eşleşti" : "~ Benzer") : "✗ Eşleşmedi"}</span>
        </div>
        ${esl ? `<p style="font-size:9px;color:#666;margin:3px 0 0;padding-left:2px;">→ ${escapeHtml(esl.description || "")} · ${accTL(esl.amount)} · %${Math.round(x.skor * 100)}</p>` : ""}
      </div>`;
    }).join("");

    sonucHtml = `<div class="card p4 mb3" style="background:#E8F5E9;border:1px solid #A5D6A7;">
      <p style="font-size:12.5px;font-weight:700;color:#1B5E20;margin:0 0 6px;">📊 Sonuç: ${sonuc.eslesen}/${sonuc.banka.length} eşleşti</p>
      <p style="font-size:10.5px;color:#2E7D32;margin:0;">Eşleşmeyen ${sonuc.banka.length - sonuc.eslesen} hareket için muhasebe kaydı eksik olabilir.</p>
    </div>
    <div class="card p4 mb3">
      <p style="font-size:12.5px;font-weight:700;margin:0 0 8px;">Banka Hareketleri</p>
      ${satirlar}
    </div>`;
  }

  return `
    <div class="card p4 mb3" style="background:linear-gradient(135deg,#1A237E,#283593);color:#fff;border:none;">
      <p style="font-size:13px;font-weight:700;margin:0 0 2px;">🏦 Banka Mutabakatı</p>
      <p style="font-size:10.5px;opacity:.85;margin:0;">Banka ekstrenizi yükleyin, muhasebe kayıtlarıyla otomatik eşleştirelim</p>
    </div>

    <div class="card p4 mb3">
      <p style="font-size:12px;font-weight:700;margin:0 0 8px;">📎 Ekstre Dosyası (CSV / TXT)</p>
      <input type="file" id="mutabakat-file" accept=".csv,.txt" style="font-size:11.5px;width:100%;margin-bottom:10px;" />
      <div style="background:#F5F5F5;border-radius:8px;padding:9px;margin-bottom:10px;">
        <p style="font-size:10px;color:#666;margin:0;line-height:1.6;">
          <b>Beklenen format:</b> her satırda tarih ve tutar olmalı.<br/>
          Örnek:<br/>
          <code style="font-size:9.5px;">01.10.2026;POS TAHSİLAT;5000,00</code><br/>
          <code style="font-size:9.5px;">2026-10-02;HAVALE ALİ V;3000.00</code>
        </p>
      </div>
      <button class="btn-primary" style="background:#283593;font-size:12px;padding:11px;" data-action="mutabakat-yukle">🔄 Ekstreyi Yükle ve Eşleştir</button>
    </div>

    ${sonucHtml}

    <div class="card p4 mb3" style="background:#FFF3E0;border:1px solid #FFB74D;">
      <p style="font-size:11.5px;font-weight:700;color:#E65100;margin:0 0 6px;">💡 Nasıl çalışır?</p>
      <p style="font-size:10.5px;color:#BF360C;margin:0;line-height:1.6;">
        Ekstreyi yükleyince program <b>tutar + tarih + açıklama benzerliğine</b> göre eşleştirir.
        Eşleşmeyen hareket = muhasebede eksik kayıt. Bu, kayıp gelir/gider bulmanın en hızlı yoludur.
      </p>
    </div>
  `;
}

/* =========================================================
   4) YEVMİYE DEFTERİ
========================================================= */

/* Türk muhasebe standartı: tek düzen hesap planı */
const HESAP_PLANI = {
  kasa: { kod: "100", ad: "Kasa" },
  banka: { kod: "102", ad: "Bankalar" },
  alicilar: { kod: "120", ad: "Alıcılar" },
  saticilar: { kod: "320", ad: "Satıcılar" },
  kdvHesaplanan: { kod: "391", ad: "Hesaplanan KDV" },
  kdvIndirilecek: { kod: "191", ad: "İndirilecek KDV" },
  gelirler: { kod: "600", ad: "Yurt İçi Satışlar" },
  giderler: { kod: "770", ad: "Genel Yönetim Giderleri" },
  amortisman: { kod: "730", ad: "Amortisman Giderleri" },
  personel: { kod: "335", ad: "Personele Borçlar" },
  sgk: { kod: "361", ad: "Ödenecek SGK Primi" },
  vergi: { kod: "360", ad: "Ödenecek Vergi ve Fonlar" }
};

/* Gelir kaydından yevmiye fişi üretir (çift kayıt sistemi) */
function accYevmiyeGelir(x, sira) {
  const brut = accNum(x.grossAmount || x.amount);
  const kdv = accNum(x.kdv);
  const stopaj = accNum(x.stopaj);
  const tahsil = accNum(x.amount);
  const satirlar = [];

  // Borç: Kasa/Banka
  satirlar.push({ hesap: tahsil > 0 ? "kasa" : "alicilar", borc: tahsil, alacak: 0, aciklama: x.description });
  if (stopaj > 0) {
    satirlar.push({ hesap: "vergi", borc: 0, alacak: stopaj, aciklama: "Stopaj" });
  }
  // Alacak: Gelir
  satirlar.push({ hesap: "gelirler", borc: 0, alacak: brut, aciklama: x.category });
  // Alacak: KDV
  if (kdv > 0) {
    satirlar.push({ hesap: "kdvHesaplanan", borc: 0, alacak: kdv, aciklama: "KDV %10" });
  }
  return { tarih: x.date, fisNo: "Y-" + String(sira).padStart(4, "0"), tip: "Gelir", aciklama: x.description, satirlar };
}

function accYevmiyeGider(x, sira) {
  const tutar = accNum(x.amount);
  const kdv = accNum(x.kdv);
  const net = tutar - kdv;
  const satirlar = [];
  satirlar.push({ hesap: "giderler", borc: net > 0 ? net : tutar, alacak: 0, aciklama: x.description });
  if (kdv > 0) satirlar.push({ hesap: "kdvIndirilecek", borc: kdv, alacak: 0, aciklama: "KDV" });
  satirlar.push({ hesap: "kasa", borc: 0, alacak: tutar, aciklama: x.description });
  return { tarih: x.date, fisNo: "Y-" + String(sira).padStart(4, "0"), tip: "Gider", aciklama: x.description, satirlar };
}

function accYevmiyeListesi(yil, ay) {
  const filtre = x => {
    if (!x.date) return false;
    const d = new Date(x.date);
    if (d.getFullYear() !== yil) return false;
    if (ay && (d.getMonth() + 1) !== ay) return false;
    return true;
  };
  const inc = (state.accounting.incomes || []).filter(filtre);
  const exp = (state.accounting.expenses || []).filter(filtre);

  const fisler = [];
  let sira = 1;
  inc.forEach(x => fisler.push(accYevmiyeGelir(x, sira++)));
  exp.forEach(x => fisler.push(accYevmiyeGider(x, sira++)));

  // Amortisman fişi (yıl sonu)
  if (!ay) {
    const amort = accAmortismanYillik(yil);
    if (amort > 0) {
      fisler.push({
        tarih: yil + "-12-31", fisNo: "Y-" + String(sira++).padStart(4, "0"), tip: "Amortisman",
        aciklama: yil + " yılı amortisman kaydı",
        satirlar: [
          { hesap: "amortisman", borc: amort, alacak: 0, aciklama: "Yıllık amortisman" },
          { hesap: "giderler", borc: 0, alacak: amort, aciklama: "Birikmiş amortisman" }
        ]
      });
    }
  }

  fisler.sort((a, b) => new Date(a.tarih) - new Date(b.tarih));
  return fisler;
}

function renderAccYevmiye() {
  const simdi = new Date();
  const yil = state.yevmiyeYil || simdi.getFullYear();
  const ay = state.yevmiyeAy || 0; // 0 = tüm yıl
  const fisler = accYevmiyeListesi(yil, ay || null);

  const toplamBorc = fisler.reduce((s, f) => s + f.satirlar.reduce((a, x) => a + x.borc, 0), 0);
  const toplamAlacak = fisler.reduce((s, f) => s + f.satirlar.reduce((a, x) => a + x.alacak, 0), 0);

  const yilChip = [yil - 1, yil, yil + 1].map(y =>
    `<button data-action="yevmiye-yil" data-yil="${y}" style="flex:1;padding:7px;border-radius:9px;font-size:11.5px;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif;border:1px solid ${y === yil ? "#4A148C" : "var(--line)"};background:${y === yil ? "#4A148C" : "rgba(255,255,255,.7)"};color:${y === yil ? "#fff" : "var(--ink)"};cursor:pointer;">${y}</button>`).join("");

  const ayChip = [{ v: 0, l: "Tümü" }, ...Array.from({ length: 12 }, (_, i) => ({ v: i + 1, l: String(i + 1) }))].map(x => {
    const aktif = x.v === (ay || 0);
    return `<button data-action="yevmiye-ay" data-ay="${x.v}" style="flex:0 0 auto;min-width:${x.v === 0 ? 56 : 38}px;padding:6px 4px;border-radius:8px;font-size:11px;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif;border:1px solid ${aktif ? "#4A148C" : "var(--line)"};background:${aktif ? "#4A148C" : "rgba(255,255,255,.7)"};color:${aktif ? "#fff" : "var(--ink)"};cursor:pointer;">${x.l}</button>`;
  }).join("");

  const fisHtml = fisler.slice(0, 25).map(f => {
    const satirlar = f.satirlar.filter(s => s.borc > 0 || s.alacak > 0).map(s => {
      const h = HESAP_PLANI[s.hesap] || { kod: "?", ad: s.hesap };
      return `<div style="display:flex;justify-content:space-between;font-size:10px;padding:2px 0 ${s.borc ? "" : "0 0"};color:${s.borc > 0 ? "#1565C0" : "#C62828"};">
        <span style="flex:1;padding-left:${s.borc > 0 ? 0 : 12}px;">${h.kod} ${h.ad}</span>
        <span style="width:78px;text-align:right;font-family:monospace;">${s.borc > 0 ? accTL0(s.borc) : ""}</span>
        <span style="width:78px;text-align:right;font-family:monospace;">${s.alacak > 0 ? accTL0(s.alacak) : ""}</span>
      </div>`;
    }).join("");
    return `<div style="padding:7px 0;border-bottom:1px solid var(--line);">
      <div style="display:flex;justify-content:space-between;font-size:10.5px;margin-bottom:3px;">
        <span style="font-weight:700;">${f.fisNo} · ${accTarihTR(f.tarih)}</span>
        <span style="color:var(--muted);font-size:9.5px;">${f.tip}</span>
      </div>
      <p style="font-size:10px;color:#555;margin:0 0 3px;">${escapeHtml(f.aciklama || "")}</p>
      ${satirlar}
    </div>`;
  }).join("") || `<p class="footnote">Bu dönemde kayıt yok.</p>`;

  return `
    <div style="display:flex;gap:6px;margin-bottom:8px;">${yilChip}</div>
    <div style="display:flex;gap:5px;overflow-x:auto;padding-bottom:6px;margin-bottom:12px;">${ayChip}</div>

    <div class="card p4 mb3" style="background:linear-gradient(135deg,#311B92,#4A148C);color:#fff;border:none;">
      <p style="font-size:13px;font-weight:700;margin:0 0 2px;">📚 Yevmiye Defteri (${fisler.length} fiş)</p>
      <p style="font-size:10.5px;opacity:.85;margin:0 0 10px;">Çift kayıt sistemi · Tek düzen hesap planı</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:8px;">
          <p style="font-size:9px;margin:0;opacity:.85;">TOPLAM BORÇ</p>
          <p style="font-size:14px;font-weight:800;margin:2px 0 0;">${accTL0(toplamBorc)}</p>
        </div>
        <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:8px;">
          <p style="font-size:9px;margin:0;opacity:.85;">TOPLAM ALACAK</p>
          <p style="font-size:14px;font-weight:800;margin:2px 0 0;">${accTL0(toplamAlacak)}</p>
        </div>
      </div>
      <p style="font-size:9.5px;margin:8px 0 0;opacity:.9;">${Math.abs(toplamBorc - toplamAlacak) < 1 ? "✅ Borç = Alacak (denk)" : "⚠️ Denge yok: " + accTL(Math.abs(toplamBorc - toplamAlacak))}</p>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px;">
      <button class="btn-primary" style="background:#4A148C;font-size:11.5px;padding:11px;" data-action="yevmiye-yazdir">🖨️ Defteri Yazdır</button>
      <button class="btn-primary" style="background:#0E93AC;font-size:11.5px;padding:11px;" data-action="yevmiye-csv">⬇️ CSV</button>
    </div>

    <p class="section-label">Yevmiye Fişleri ${fisler.length > 25 ? "(ilk 25)" : ""}</p>
    <div class="card p4 mb3">${fisHtml}</div>

    <div class="card p4 mb3" style="background:#EDE7F6;border:1px solid #B39DDB;">
      <p style="font-size:11.5px;font-weight:700;color:#4527A0;margin:0 0 6px;">📖 Tek Düzen Hesap Planı</p>
      <p style="font-size:10px;color:#5E35B1;margin:0;line-height:1.7;">
        100 Kasa · 102 Bankalar · 120 Alıcılar · 191 İndirilecek KDV<br/>
        320 Satıcılar · 335 Personele Borçlar · 360 Ödenecek Vergi<br/>
        361 Ödenecek SGK · 391 Hesaplanan KDV · 600 Yurt İçi Satışlar<br/>
        730 Amortisman · 770 Genel Yönetim Giderleri
      </p>
    </div>
  `;
}

/* =========================================================
   5) MİZAN
========================================================= */

function accMizan(yil) {
  const fisler = accYevmiyeListesi(yil, null);
  const hesaplar = {};

  fisler.forEach(f => f.satirlar.forEach(s => {
    const h = HESAP_PLANI[s.hesap] || { kod: "?", ad: s.hesap };
    const k = h.kod;
    if (!hesaplar[k]) hesaplar[k] = { kod: h.kod, ad: h.ad, borc: 0, alacak: 0 };
    hesaplar[k].borc += s.borc;
    hesaplar[k].alacak += s.alacak;
  }));

  return Object.values(hesaplar)
    .map(h => ({ ...h, bakiye: h.borc - h.alacak }))
    .sort((a, b) => a.kod.localeCompare(b.kod));
}

function renderAccMizan() {
  const yil = state.mizanYil || new Date().getFullYear();
  const m = accMizan(yil);
  const tb = m.reduce((s, h) => s + h.borc, 0);
  const ta = m.reduce((s, h) => s + h.alacak, 0);

  const yilChip = [yil - 1, yil, yil + 1].map(y =>
    `<button data-action="mizan-yil" data-yil="${y}" style="flex:1;padding:7px;border-radius:9px;font-size:11.5px;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif;border:1px solid ${y === yil ? "#BF360C" : "var(--line)"};background:${y === yil ? "#BF360C" : "rgba(255,255,255,.7)"};color:${y === yil ? "#fff" : "var(--ink)"};cursor:pointer;">${y}</button>`).join("");

  const satirlar = m.map(h => `
    <tr style="border-bottom:1px solid var(--line);">
      <td style="padding:5px 3px;font-size:10px;">${h.kod}</td>
      <td style="padding:5px 3px;font-size:10px;">${escapeHtml(h.ad)}</td>
      <td style="padding:5px 3px;font-size:10px;text-align:right;font-family:monospace;">${h.borc > 0 ? accTL0(h.borc) : "—"}</td>
      <td style="padding:5px 3px;font-size:10px;text-align:right;font-family:monospace;">${h.alacak > 0 ? accTL0(h.alacak) : "—"}</td>
      <td style="padding:5px 3px;font-size:10px;text-align:right;font-family:monospace;font-weight:700;color:${h.bakiye >= 0 ? "#1565C0" : "#C62828"};">${accTL0(Math.abs(h.bakiye))}</td>
    </tr>`).join("") || `<tr><td colspan="5" style="padding:12px;text-align:center;font-size:11px;color:#888;">Kayıt yok</td></tr>`;

  return `
    <div style="display:flex;gap:6px;margin-bottom:12px;">${yilChip}</div>

    <div class="card p4 mb3" style="background:linear-gradient(135deg,#BF360C,#E64A19);color:#fff;border:none;">
      <p style="font-size:13px;font-weight:700;margin:0 0 2px;">⚖️ ${yil} Yılı Mizanı</p>
      <p style="font-size:10.5px;opacity:.85;margin:0;">${m.length} hesap</p>
    </div>

    <div class="card p4 mb3" style="padding:10px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr style="background:#FBE9E7;">
          <th style="text-align:left;padding:6px 3px;font-size:9px;color:#BF360C;">KOD</th>
          <th style="text-align:left;padding:6px 3px;font-size:9px;color:#BF360C;">HESAP</th>
          <th style="text-align:right;padding:6px 3px;font-size:9px;color:#BF360C;">BORÇ</th>
          <th style="text-align:right;padding:6px 3px;font-size:9px;color:#BF360C;">ALACAK</th>
          <th style="text-align:right;padding:6px 3px;font-size:9px;color:#BF360C;">BAKİYE</th>
        </tr>
        ${satirlar}
        <tr style="background:#FFF3E0;border-top:2px solid #BF360C;">
          <td colspan="2" style="padding:7px 3px;font-size:10.5px;font-weight:800;">TOPLAM</td>
          <td style="padding:7px 3px;font-size:10.5px;text-align:right;font-weight:800;font-family:monospace;">${accTL0(tb)}</td>
          <td style="padding:7px 3px;font-size:10.5px;text-align:right;font-weight:800;font-family:monospace;">${accTL0(ta)}</td>
          <td style="padding:7px 3px;font-size:10.5px;text-align:right;font-weight:800;">${Math.abs(tb - ta) < 1 ? "✅" : "⚠️"}</td>
        </tr>
      </table>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px;">
      <button class="btn-primary" style="background:#BF360C;font-size:11.5px;padding:11px;" data-action="mizan-yazdir">🖨️ Mizan Yazdır</button>
      <button class="btn-primary" style="background:#0E93AC;font-size:11.5px;padding:11px;" data-action="mizan-csv">⬇️ CSV</button>
    </div>

    <div class="card p4 mb3" style="background:#FFF3E0;border:1px solid #FFB74D;">
      <p style="font-size:11.5px;font-weight:700;color:#E65100;margin:0 0 6px;">💡 Mizan nedir?</p>
      <p style="font-size:10.5px;color:#BF360C;margin:0;line-height:1.6;">
        Tüm hesapların borç-alacak dökümü. <b>Borç = Alacak</b> olmak zorundadır —
        değilse kayıtta hata var. Mali müşavirin her ay ilk baktığı belgedir.
      </p>
    </div>
  `;
}

/* =========================================================
   6) GELİR TABLOSU + BİLANÇO
========================================================= */

function accGelirTablosu(yil) {
  const inc = (state.accounting.incomes || []).filter(x => new Date(x.date).getFullYear() === yil);
  const exp = (state.accounting.expenses || []).filter(x => new Date(x.date).getFullYear() === yil);

  const brutSatis = inc.reduce((s, x) => s + accNum(x.grossAmount || x.amount), 0);
  const kdvToplam = inc.reduce((s, x) => s + accNum(x.kdv), 0);
  const netSatis = brutSatis;

  // Giderleri kategoriye göre grupla
  const giderGruplari = {};
  exp.forEach(x => {
    const k = x.category || "Diğer";
    giderGruplari[k] = (giderGruplari[k] || 0) + accNum(x.amount);
  });
  const toplamGider = exp.reduce((s, x) => s + accNum(x.amount), 0);
  const amort = accAmortismanYillik(yil);
  const faaliyetKari = netSatis - toplamGider - amort;
  const vergi = gvHesapla(Math.max(0, faaliyetKari));
  const netKar = faaliyetKari - vergi;

  return { yil, brutSatis, netSatis, kdvToplam, giderGruplari, toplamGider, amort, faaliyetKari, vergi, netKar };
}

function accBilanco(yil) {
  const inc = (state.accounting.incomes || []).filter(x => new Date(x.date).getFullYear() === yil);
  const exp = (state.accounting.expenses || []).filter(x => new Date(x.date).getFullYear() === yil);

  // Nakit: tahsil edilen gelir − ödenen gider
  const tahsilEdilen = inc.filter(x => x.paid !== false).reduce((s, x) => s + accNum(x.amount), 0);
  const odenen = exp.reduce((s, x) => s + accNum(x.amount), 0);
  const nakit = tahsilEdilen - odenen;

  // Alacaklar: veresiye
  const alacaklar = inc.filter(x => x.paid === false).reduce((s, x) => s + accNum(x.amount), 0);

  // Borçlar: tahakkuk eden vergiler
  const gt = accGelirTablosu(yil);
  const kdvSeri = accKdvSeri(yil);
  const kdvBorcu = kdvSeri.reduce((s, x) => s + x.odenecek, 0);
  const gelirVergisiBorcu = Math.max(0, gt.vergi);
  const sgkBorcu = accPayrollTotal().toplamSgk;

  const aktifToplam = nakit + alacaklar;
  const borcToplam = kdvBorcu + gelirVergisiBorcu + sgkBorcu;
  // Öz kaynak: denkleştirici kalem (Aktif = Borç + Öz Kaynak)
  const ozkaynak = aktifToplam - borcToplam;

  return {
    yil,
    nakit, alacaklar, aktifToplam,
    kdvBorcu, gelirVergisiBorcu, sgkBorcu, borcToplam,
    ozkaynak,
    pasifToplam: borcToplam + ozkaynak,
    gt
  };
}

function renderAccTablolar() {
  const yil = state.tabloYil || new Date().getFullYear();
  const gt = accGelirTablosu(yil);
  const bl = accBilanco(yil);

  const yilChip = [yil - 1, yil, yil + 1].map(y =>
    `<button data-action="tablo-yil" data-yil="${y}" style="flex:1;padding:7px;border-radius:9px;font-size:11.5px;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif;border:1px solid ${y === yil ? "#1B5E20" : "var(--line)"};background:${y === yil ? "#1B5E20" : "rgba(255,255,255,.7)"};color:${y === yil ? "#fff" : "var(--ink)"};cursor:pointer;">${y}</button>`).join("");

  const giderSatirlar = Object.entries(gt.giderGruplari).sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `<tr><td style="padding:4px 0;font-size:11px;">${escapeHtml(k)}</td><td style="padding:4px 0;font-size:11px;text-align:right;font-family:monospace;">${accTL(v)}</td></tr>`).join("");

  return `
    <div style="display:flex;gap:6px;margin-bottom:12px;">${yilChip}</div>

    <div class="card p4 mb3" style="background:linear-gradient(135deg,#1B5E20,#2E7D32);color:#fff;border:none;">
      <p style="font-size:13px;font-weight:700;margin:0 0 2px;">📈 ${yil} Gelir Tablosu</p>
      <p style="font-size:10.5px;opacity:.85;margin:0 0 10px;">Dönem sonu finansal sonuç</p>
      <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:10px;">
        <p style="font-size:9.5px;margin:0;opacity:.85;">NET KÂR</p>
        <p style="font-size:20px;font-weight:800;margin:2px 0 0;">${accTL0(gt.netKar)}</p>
      </div>
    </div>

    <div class="card p4 mb3">
      <p style="font-size:12.5px;font-weight:700;margin:0 0 8px;color:#1B5E20;">📊 GELİR TABLOSU</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr style="border-bottom:1px solid var(--line);"><td style="padding:5px 0;font-size:11px;font-weight:600;">Brüt Satışlar</td><td style="padding:5px 0;font-size:11px;text-align:right;font-weight:700;">${accTL(gt.brutSatis)}</td></tr>
        <tr style="border-bottom:1px solid var(--line);"><td style="padding:5px 0;font-size:11px;padding-left:10px;">KDV (bilgi)</td><td style="padding:5px 0;font-size:11px;text-align:right;color:#E65100;">${accTL(gt.kdvToplam)}</td></tr>
        <tr><td colspan="2" style="padding:8px 0 4px;font-size:10.5px;font-weight:700;color:#C62828;">FAALİYET GİDERLERİ</td></tr>
        ${giderSatirlar || '<tr><td colspan="2" style="font-size:10.5px;color:#888;padding:4px 0;">Gider kaydı yok</td></tr>'}
        ${gt.amort > 0 ? `<tr><td style="padding:4px 0;font-size:11px;">Amortisman</td><td style="padding:4px 0;font-size:11px;text-align:right;font-family:monospace;">${accTL(gt.amort)}</td></tr>` : ""}
        <tr style="border-top:1px solid var(--line);"><td style="padding:5px 0;font-size:11px;font-weight:700;">Toplam Gider</td><td style="padding:5px 0;font-size:11px;text-align:right;font-weight:700;color:#C62828;">${accTL(gt.toplamGider + gt.amort)}</td></tr>
        <tr style="background:#E8F5E9;"><td style="padding:6px 0;font-size:11.5px;font-weight:800;">FAALİYET KÂRI</td><td style="padding:6px 0;font-size:11.5px;text-align:right;font-weight:800;color:${gt.faaliyetKari >= 0 ? "#2E7D32" : "#C62828"};">${accTL(gt.faaliyetKari)}</td></tr>
        <tr><td style="padding:4px 0;font-size:11px;">Gelir Vergisi Karşılığı</td><td style="padding:4px 0;font-size:11px;text-align:right;color:#E65100;">-${accTL(gt.vergi)}</td></tr>
        <tr style="background:#C8E6C9;"><td style="padding:7px 0;font-size:12px;font-weight:800;">DÖNEM NET KÂRI</td><td style="padding:7px 0;font-size:12px;text-align:right;font-weight:800;color:#1B5E20;">${accTL(gt.netKar)}</td></tr>
      </table>
    </div>

    <div class="card p4 mb3">
      <p style="font-size:12.5px;font-weight:700;margin:0 0 8px;color:#0D47A1;">⚖️ FİNANSAL DURUM (${yil})</p>
      <table style="width:100%;border-collapse:collapse;font-size:11px;">
        <tr style="background:#E3F2FD;"><th style="text-align:left;padding:6px 4px;font-size:10px;">AKTİF (VARLIKLAR)</th><th style="text-align:right;padding:6px 4px;font-size:10px;">TUTAR</th></tr>
        <tr><td style="padding:4px;font-size:10.5px;">Nakit (kasa + banka)</td><td style="padding:4px;text-align:right;font-family:monospace;color:${bl.nakit >= 0 ? "#2E7D32" : "#C62828"};">${accTL(bl.nakit)}</td></tr>
        <tr><td style="padding:4px;font-size:10.5px;">Alacaklar (veresiye)</td><td style="padding:4px;text-align:right;font-family:monospace;">${accTL(bl.alacaklar)}</td></tr>
        <tr style="background:#E3F2FD;"><td style="padding:6px 4px;font-weight:800;font-size:11px;">AKTİF TOPLAM</td><td style="padding:6px 4px;text-align:right;font-weight:800;font-family:monospace;">${accTL(bl.aktifToplam)}</td></tr>
      </table>
      <table style="width:100%;border-collapse:collapse;font-size:11px;margin-top:10px;">
        <tr style="background:#FFEBEE;"><th style="text-align:left;padding:6px 4px;font-size:10px;">PASİF (KAYNAKLAR)</th><th style="text-align:right;padding:6px 4px;font-size:10px;">TUTAR</th></tr>
        <tr><td style="padding:4px;font-size:10.5px;">Ödenecek KDV (yıllık)</td><td style="padding:4px;text-align:right;font-family:monospace;">${accTL(bl.kdvBorcu)}</td></tr>
        <tr><td style="padding:4px;font-size:10.5px;">Ödenecek gelir vergisi</td><td style="padding:4px;text-align:right;font-family:monospace;">${accTL(bl.gelirVergisiBorcu)}</td></tr>
        <tr><td style="padding:4px;font-size:10.5px;">Ödenecek SGK primi</td><td style="padding:4px;text-align:right;font-family:monospace;">${accTL(bl.sgkBorcu)}</td></tr>
        <tr><td style="padding:4px;font-size:10.5px;font-weight:600;">Borçlar toplamı</td><td style="padding:4px;text-align:right;font-family:monospace;font-weight:600;">${accTL(bl.borcToplam)}</td></tr>
        <tr><td style="padding:4px;font-size:10.5px;">Öz kaynak</td><td style="padding:4px;text-align:right;font-family:monospace;color:${bl.ozkaynak >= 0 ? "#2E7D32" : "#C62828"};">${accTL(bl.ozkaynak)}</td></tr>
        <tr style="background:#FFEBEE;"><td style="padding:6px 4px;font-weight:800;font-size:11px;">PASİF TOPLAM</td><td style="padding:6px 4px;text-align:right;font-weight:800;font-family:monospace;">${accTL(bl.pasifToplam)}</td></tr>
      </table>
      <p style="font-size:9.5px;color:${Math.abs(bl.aktifToplam - bl.pasifToplam) < 1 ? "#2E7D32" : "#C62828"};margin:8px 0 0;text-align:center;font-weight:600;">
        ${Math.abs(bl.aktifToplam - bl.pasifToplam) < 1 ? "✅ Aktif = Pasif (denk)" : "⚠️ Denge yok"}
      </p>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px;">
      <button class="btn-primary" style="background:#1B5E20;font-size:11.5px;padding:11px;" data-action="tablolar-yazdir">🖨️ Yazdır</button>
      <button class="btn-primary" style="background:#0E93AC;font-size:11.5px;padding:11px;" data-action="yillik-rapor">📑 Yıllık Rapor</button>
    </div>
  `;
}

/* =========================================================
   7) YILLIK MALİ RAPOR (kapsamlı)
========================================================= */

function accYillikRaporHTML(yil) {
  const gt = accGelirTablosu(yil);
  const bl = accBilanco(yil);
  const mz = accMizan(yil);
  const kdvSeri = accKdvSeri(yil);
  const bordro = (state.personnel || []).filter(p => p.aktif !== false).map(p => accBordro(p, yil, new Date().getMonth() + 1));
  const pt = accPayrollTotal();
  const demirbas = state.demirbaslar || [];

  const kdvToplamOdenecek = kdvSeri.reduce((s, x) => s + x.odenecek, 0);
  const kdvToplamHesaplanan = kdvSeri.reduce((s, x) => s + x.hesaplanan, 0);
  const kdvToplamIndirilecek = kdvSeri.reduce((s, x) => s + x.indirilecek, 0);

  return `
    <h2 style="margin:0 0 4px;font-size:20px;color:#0B6E86;">NUR DİŞ &amp; DENTAL KLİNİK</h2>
    <div style="font-size:12px;color:#666;margin-bottom:4px;">${yil} YILI MALİ FAALİYET RAPORU</div>
    <div style="font-size:10px;color:#999;margin-bottom:18px;">Düzenleme tarihi: ${accTarihUzun()}</div>

    <h3 style="font-size:14px;color:#0B6E86;border-bottom:2px solid #0B6E86;padding-bottom:3px;margin:18px 0 10px;">1. ÖZET GÖSTERGELER</h3>
    <table style="width:100%;font-size:11px;border-collapse:collapse;">
      <tr><td style="padding:4px 0;">Brüt Satış / Gelir</td><td style="text-align:right;font-weight:700;">${accTL(gt.brutSatis)}</td></tr>
      <tr><td style="padding:4px 0;">Toplam Gider</td><td style="text-align:right;color:#C62828;font-weight:700;">${accTL(gt.toplamGider + gt.amort)}</td></tr>
      <tr><td style="padding:4px 0;border-top:1px solid #ccc;"><b>Net Kâr</b></td><td style="text-align:right;border-top:1px solid #ccc;font-weight:800;color:${gt.netKar >= 0 ? "#2E7D32" : "#C62828"};">${accTL(gt.netKar)}</td></tr>
      <tr><td style="padding:4px 0;">Hesaplanan Gelir Vergisi</td><td style="text-align:right;color:#E65100;">${accTL(gt.vergi)}</td></tr>
      <tr><td style="padding:4px 0;">Efektif Vergi Oranı</td><td style="text-align:right;">%${(gt.faaliyetKari > 0 ? (gt.vergi / gt.faaliyetKari * 100) : 0).toFixed(1)}</td></tr>
    </table>

    <h3 style="font-size:14px;color:#0B6E86;border-bottom:2px solid #0B6E86;padding-bottom:3px;margin:18px 0 10px;">2. KDV DÖKÜMÜ</h3>
    <table style="width:100%;font-size:10.5px;border-collapse:collapse;">
      <tr style="background:#f5f5f5;"><th style="text-align:left;padding:5px;">Ay</th><th style="text-align:right;padding:5px;">Hesaplanan</th><th style="text-align:right;padding:5px;">İndirilecek</th><th style="text-align:right;padding:5px;">Ödenen</th></tr>
      ${kdvSeri.map(x => `<tr style="border-bottom:1px solid #eee;"><td style="padding:4px;">${x.etiket}</td><td style="text-align:right;padding:4px;">${x.hesaplanan > 0 ? accTL(x.hesaplanan) : "—"}</td><td style="text-align:right;padding:4px;">${x.indirilecek > 0 ? accTL(x.indirilecek) : "—"}</td><td style="text-align:right;padding:4px;font-weight:700;">${x.odenecek > 0 ? accTL(x.odenecek) : "—"}</td></tr>`).join("")}
      <tr style="background:#FFF3E0;font-weight:800;"><td style="padding:5px;">TOPLAM</td><td style="text-align:right;padding:5px;">${accTL(kdvToplamHesaplanan)}</td><td style="text-align:right;padding:5px;">${accTL(kdvToplamIndirilecek)}</td><td style="text-align:right;padding:5px;color:#E65100;">${accTL(kdvToplamOdenecek)}</td></tr>
    </table>

    <h3 style="font-size:14px;color:#0B6E86;border-bottom:2px solid #0B6E86;padding-bottom:3px;margin:18px 0 10px;">3. PERSONEL VE SGK</h3>
    <table style="width:100%;font-size:10.5px;border-collapse:collapse;">
      <tr style="background:#f5f5f5;"><th style="text-align:left;padding:5px;">Personel</th><th style="text-align:right;padding:5px;">Brüt</th><th style="text-align:right;padding:5px;">SGK Primi</th><th style="text-align:right;padding:5px;">Net</th></tr>
      ${bordro.map(b => `<tr style="border-bottom:1px solid #eee;"><td style="padding:4px;">${escapeHtml(b.personel.name)}</td><td style="text-align:right;padding:4px;">${accTL(b.brutUcret)}</td><td style="text-align:right;padding:4px;">${accTL(b.toplamSgk)}</td><td style="text-align:right;padding:4px;font-weight:700;">${accTL(b.netUcret)}</td></tr>`).join("") || '<tr><td colspan="4" style="padding:6px;color:#888;">Personel kaydı yok</td></tr>'}
      <tr style="background:#EDE7F6;font-weight:800;"><td style="padding:5px;">TOPLAM</td><td style="text-align:right;padding:5px;">${accTL(pt.brut)}</td><td style="text-align:right;padding:5px;">${accTL(pt.toplamSgk)}</td><td style="text-align:right;padding:5px;">${accTL(pt.net)}</td></tr>
    </table>

    <h3 style="font-size:14px;color:#0B6E86;border-bottom:2px solid #0B6E86;padding-bottom:3px;margin:18px 0 10px;">4. AMORTİSMAN</h3>
    <table style="width:100%;font-size:10.5px;border-collapse:collapse;">
      ${demirbas.map(d => `<tr style="border-bottom:1px solid #eee;"><td style="padding:4px;">${escapeHtml(d.ad)}</td><td style="padding:4px;">${accNum(d.omur)} yıl</td><td style="text-align:right;padding:4px;">${accTL(accAmortYilTutar(d, yil))}</td></tr>`).join("") || '<tr><td colspan="3" style="padding:6px;color:#888;">Demirbaş kaydı yok</td></tr>'}
      <tr style="background:#E0F2F1;font-weight:800;"><td colspan="2" style="padding:5px;">YILLIK AMORTİSMAN</td><td style="text-align:right;padding:5px;">${accTL(gt.amort)}</td></tr>
    </table>

    <h3 style="font-size:14px;color:#0B6E86;border-bottom:2px solid #0B6E86;padding-bottom:3px;margin:18px 0 10px;">5. GELİR TABLOSU</h3>
    <table style="width:100%;font-size:11px;border-collapse:collapse;">
      ${Object.entries(gt.giderGruplari).sort((a, b) => b[1] - a[1]).map(([k, v]) => `<tr><td style="padding:4px;">${escapeHtml(k)}</td><td style="text-align:right;padding:4px;">${accTL(v)}</td></tr>`).join("")}
      ${gt.amort > 0 ? `<tr><td style="padding:4px;">Amortisman</td><td style="text-align:right;padding:4px;">${accTL(gt.amort)}</td></tr>` : ""}
      <tr style="background:#E8F5E9;font-weight:800;"><td style="padding:5px;">NET KÂR</td><td style="text-align:right;padding:5px;">${accTL(gt.netKar)}</td></tr>
    </table>

    <h3 style="font-size:14px;color:#0B6E86;border-bottom:2px solid #0B6E86;padding-bottom:3px;margin:18px 0 10px;">6. BİLANÇO</h3>
    <table style="width:100%;font-size:10.5px;border-collapse:collapse;">
      <tr style="background:#E3F2FD;"><th style="text-align:left;padding:5px;">AKTİF</th><th style="text-align:right;padding:5px;">TUTAR</th></tr>
      <tr><td style="padding:4px;">Kasa + Banka</td><td style="text-align:right;padding:4px;">${accTL(Math.max(0, bl.donenVarliklar.kasa) + Math.max(0, bl.donenVarliklar.banka))}</td></tr>
      <tr><td style="padding:4px;">Alıcılar</td><td style="text-align:right;padding:4px;">${accTL(Math.max(0, bl.donenVarliklar.alicilar))}</td></tr>
      <tr style="font-weight:800;"><td style="padding:5px;">AKTİF TOPLAM</td><td style="text-align:right;padding:5px;">${accTL(bl.aktifToplam)}</td></tr>
      <tr style="background:#FFEBEE;"><th style="text-align:left;padding:5px;">PASİF</th><th style="text-align:right;padding:5px;">TUTAR</th></tr>
      <tr><td style="padding:4px;">Borçlar</td><td style="text-align:right;padding:4px;">${accTL(bl.borclar.toplam)}</td></tr>
      <tr><td style="padding:4px;">Öz Kaynak</td><td style="text-align:right;padding:4px;">${accTL(bl.ozkaynak)}</td></tr>
      <tr style="font-weight:800;"><td style="padding:5px;">PASİF TOPLAM</td><td style="text-align:right;padding:5px;">${accTL(bl.pasifToplam)}</td></tr>
    </table>

    <h3 style="font-size:14px;color:#0B6E86;border-bottom:2px solid #0B6E86;padding-bottom:3px;margin:18px 0 10px;">7. MİZAN ÖZETİ</h3>
    <table style="width:100%;font-size:10px;border-collapse:collapse;">
      <tr style="background:#f5f5f5;"><th style="text-align:left;padding:4px;">Kod</th><th style="text-align:left;padding:4px;">Hesap</th><th style="text-align:right;padding:4px;">Borç</th><th style="text-align:right;padding:4px;">Alacak</th></tr>
      ${mz.map(h => `<tr style="border-bottom:1px solid #eee;"><td style="padding:3px;">${h.kod}</td><td style="padding:3px;">${escapeHtml(h.ad)}</td><td style="text-align:right;padding:3px;">${h.borc > 0 ? accTL0(h.borc) : "—"}</td><td style="text-align:right;padding:3px;">${h.alacak > 0 ? accTL0(h.alacak) : "—"}</td></tr>`).join("")}
    </table>

    <div style="margin-top:24px;padding-top:10px;border-top:1px solid #ccc;font-size:9px;color:#888;line-height:1.6;">
      Bu rapor Nur Diş &amp; Dental Klinik muhasebe programı tarafından ${accTarihUzun()} tarihinde otomatik oluşturulmuştur.
      Resmî beyanname ve bildirimlerde GİB ve SGK sistemlerindeki kayıtlar esas alınır.
      Hesaplamalar 2026 vergi mevzuatı parametreleriyle yapılmıştır.
    </div>
  `;
}

function renderAccounting() {
  const tab = state.accTab || "ozet";
  const subs = [
    { id: "ozet", label: "📊 Özet" },
    { id: "takvim", label: "🔔 Takvim & Uyarı" },
    { id: "islem", label: "💳 Gelir/Gider" },
    { id: "kdv", label: "📑 KDV Beyanı" },
    { id: "gv", label: "🧮 Gelir Vergisi" },
    { id: "personel", label: "👥 Personel & SGK" },
    { id: "stok", label: "📦 Stok" },
    { id: "malzeme", label: "🧪 Malzeme Maliyeti" },
    { id: "hasta", label: "👤 Hasta Kârlılık" },
    { id: "nakit", label: "💰 Nakit Akış" },
    { id: "randevu", label: "📅 Randevu & Ciro" },
    { id: "verimlilik", label: "👥 Personel Verim" },
    { id: "kampanya", label: "🎯 Kampanya" },
    { id: "bayat", label: "📦 Bayat Stok" },
    { id: "hatirlatma", label: "🔔 Hasta Hatırlatma" },
    { id: "prim", label: "🎁 Prim / Bonus" },
    { id: "rwhatir", label: "⏰ Randevu Hatırlat" },
    { id: "anket", label: "⭐ Memnuniyet Anketi" },
    { id: "yedek", label: "💾 Yedek" },
    { id: "otomasyon", label: "⚙️ Otomasyon" },
    { id: "kvkk", label: "🔒 KVKK" },
    { id: "cari", label: "💳 Cari Hesap" },
    { id: "demirbas", label: "🏗️ Amortisman" },
    { id: "bordro", label: "📄 Bordro" },
    { id: "efatura", label: "🧾 e-Fatura" },
    { id: "mutabakat", label: "🏦 Banka Mutabakatı" },
    { id: "yevmiye", label: "📚 Yevmiye" },
    { id: "mizan", label: "⚖️ Mizan" },
    { id: "tablolar", label: "📈 Gelir Tablosu" },
    { id: "vergi", label: "🧾 Vergi Özeti" },
    { id: "rapor", label: "📊 Raporlar" },
    { id: "otomatik", label: "🔄 Otomatik" }
  ];
  const bar = subs.map(s => `<button class="admin-tab ${tab === s.id ? "active" : ""}" data-action="acc-tab" data-tab="${s.id}">${s.label}</button>`).join("");
  let body = "";
  if (tab === "ozet") body = renderAccOzet();
  else if (tab === "takvim") body = renderAccTakvim();
  else if (tab === "islem") body = renderAccIslem();
  else if (tab === "kdv") body = renderAccKdv();
  else if (tab === "gv") body = renderAccGv();
  else if (tab === "personel") body = renderAccPersonel();
  else if (tab === "stok") body = renderAccStok();
  else if (tab === "malzeme") body = renderAccMalzemeMaliyet();
  else if (tab === "hasta") body = renderAccHastaKar();
  else if (tab === "nakit") body = renderAccNakit();
  else if (tab === "randevu") body = renderAccRandevu();
  else if (tab === "verimlilik") body = renderAccVerimlilik();
  else if (tab === "kampanya") body = renderAccKampanya();
  else if (tab === "bayat") body = renderAccBayat();
  else if (tab === "hatirlatma") body = renderAccHastaHatirlatma();
  else if (tab === "prim") body = renderAccPrim();
  else if (tab === "rwhatir") body = renderAccRandevuHatirlatma();
  else if (tab === "anket") body = renderAccAnket();
  else if (tab === "yedek") body = renderAccYedek();
  else if (tab === "otomasyon") body = renderAccOtomasyon();
  else if (tab === "kvkk") body = renderAccKvkk();
  else if (tab === "cari") body = renderAccCari();
  else if (tab === "demirbas") body = renderAccDemirbas();
  else if (tab === "bordro") body = renderAccBordro();
  else if (tab === "efatura") body = renderAccEFatura();
  else if (tab === "mutabakat") body = renderAccMutabakat();
  else if (tab === "yevmiye") body = renderAccYevmiye();
  else if (tab === "mizan") body = renderAccMizan();
  else if (tab === "tablolar") body = renderAccTablolar();
  else if (tab === "vergi") body = renderAccVergi();
  else if (tab === "rapor") body = renderAccRapor();
  else if (tab === "otomatik") body = renderAccOtomatik();
  return `<div class="admin-tabs" style="margin-bottom:10px;flex-wrap:wrap;">${bar}</div>${body}`;
}

/* ---------------- ÖZET ---------------- */

function renderAccOzet() {
  const acc = state.accounting;
  const inc = accInRange(acc.incomes);
  const exp = accInRange(acc.expenses);
  const gelir = accSum(inc, "amount");
  const gider = accSum(exp, "amount");
  const net = gelir - gider;
  const kdv = accSum(inc, "kdv");
  const stopaj = accSum(inc, "stopaj");
  const personel = accPayrollTotal();
  const bekleyenSGK = personel.toplamSgk;

  const chip = (id, label) => `<button data-action="acc-range" data-range="${id}" style="flex:0 0 auto;padding:7px 13px;border-radius:20px;font-size:11.5px;font-weight:600;font-family:'Plus Jakarta Sans',sans-serif;border:1px solid ${state.accRange === id ? "var(--teal)" : "var(--line)"};background:${state.accRange === id ? "var(--teal)" : "rgba(255,255,255,.7)"};color:${state.accRange === id ? "#fff" : "var(--ink)"};cursor:pointer;">${label}</button>`;
  const chips = ["hafta", "ay", "3ay", "6ay", "yil"].map((k, i) => chip(k, ["Hafta", "Ay", "3 Ay", "6 Ay", "Yıl"][i])).join("");
  const ozel = state.accRange === "ozel"
    ? `<div style="display:flex;gap:6px;margin-top:8px;align-items:center;">
         <input class="input" type="date" id="acc-from" value="${escapeAttr(state.accFrom || "")}" style="font-size:11px;padding:6px;" />
         <span style="font-size:11px;">→</span>
         <input class="input" type="date" id="acc-to" value="${escapeAttr(state.accTo || "")}" style="font-size:11px;padding:6px;" />
         <button class="btn-primary" style="width:auto;padding:6px 10px;font-size:11px;" data-action="acc-range-apply">Uygula</button>
       </div>`
    : "";

  return `
    <div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:6px;margin-bottom:10px;">${chips}${chip("ozel", "Özel")}</div>
    ${ozel}
    <p style="font-size:11px;color:var(--muted);margin:0 0 10px;">Dönem: <b>${accRangeLabel(state.accRange)}</b> · ${inc.length} gelir, ${exp.length} gider kaydı</p>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">
      <div class="card p3" style="text-align:center;background:linear-gradient(135deg,#E8F5E9,#C8E6C9);border:1px solid #A5D6A7;">
        <p style="font-size:10px;color:#2E7D32;margin:0;font-weight:700;">GELİR</p>
        <p style="font-size:16px;font-weight:800;color:#1B5E20;margin:3px 0;">${accTL0(gelir)}</p>
      </div>
      <div class="card p3" style="text-align:center;background:linear-gradient(135deg,#FFEBEE,#FFCDD2);border:1px solid #EF9A9A;">
        <p style="font-size:10px;color:#C62828;margin:0;font-weight:700;">GİDER</p>
        <p style="font-size:16px;font-weight:800;color:#B71C1C;margin:3px 0;">${accTL0(gider)}</p>
      </div>
    </div>
    <div class="card p3" style="text-align:center;margin-bottom:10px;background:${net >= 0 ? "linear-gradient(135deg,#E3F2FD,#BBDEFB)" : "linear-gradient(135deg,#FFF3E0,#FFE0B2)"};border:1px solid ${net >= 0 ? "#90CAF9" : "#FFB74D"};">
      <p style="font-size:10px;color:#555;margin:0;font-weight:700;">${net >= 0 ? "NET KÂR" : "ZARAR"}</p>
      <p style="font-size:20px;font-weight:800;color:${net >= 0 ? "#0D47A1" : "#BF360C"};margin:3px 0;">${accTL(Math.abs(net))}</p>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:12px;">
      <div class="card p2" style="text-align:center;"><p style="font-size:9px;color:#666;margin:0;">KDV</p><p style="font-size:12.5px;font-weight:700;color:#E65100;margin:2px 0;">${accTL0(kdv)}</p></div>
      <div class="card p2" style="text-align:center;"><p style="font-size:9px;color:#666;margin:0;">Stopaj</p><p style="font-size:12.5px;font-weight:700;color:#1565C0;margin:2px 0;">${accTL0(stopaj)}</p></div>
      <div class="card p2" style="text-align:center;background:#F3E5F5;border:1px solid #CE93D8;"><p style="font-size:9px;color:#6A1B9A;margin:0;">SGK Primi</p><p style="font-size:12.5px;font-weight:700;color:#4A148C;margin:2px 0;">${accTL0(bekleyenSGK)}</p></div>
    </div>

    <div class="card p3 mb3" style="background:${stokKritikler().length ? "#FFF3E0" : "#E0F7FA"};border:1px solid ${stokKritikler().length ? "#FFB74D" : "#80DEEA"};">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div>
          <p style="font-size:11.5px;font-weight:700;color:#006064;margin:0;">📦 Stok Durumu</p>
          <p style="font-size:10px;color:#00838F;margin:2px 0 0;">${(state.stok||[]).length} kalem · ${accTL0(stokToplamDeger())} değer${stokKritikler().length ? " · ⚠️ " + stokKritikler().length + " kritik" : ""}</p>
        </div>
        <button data-action="acc-tab" data-tab="stok" style="background:#00838F;border:none;border-radius:7px;color:#fff;padding:7px 11px;font-size:10.5px;font-weight:700;cursor:pointer;">Aç →</button>
      </div>
    </div>

    <div class="card p3 mb3" style="background:#EDE7F6;border:1px solid #B39DDB;">
      <p style="font-size:11.5px;font-weight:700;color:#4527A0;margin:0 0 6px;">👥 Personel durumu</p>
      <p style="font-size:11px;color:#5E35B1;margin:0;">${personel.kisi} aktif personel · Aylık SGK primi <b>${accTL(personel.toplamSgk)}</b> · İşveren maliyeti <b>${accTL(personel.isvereneMaliyet)}</b></p>
      <button class="btn-primary" style="margin-top:8px;font-size:11.5px;padding:9px;background:#5E35B1;" data-action="acc-tab" data-tab="personel">SGK Primini Görüntüle →</button>
    </div>

    <div class="card p4 mb3">
      <p style="font-size:13px;font-weight:700;margin:0 0 10px;">⚡ Hızlı İşlem</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <button class="btn-primary" style="font-size:12px;padding:11px;background:#2E7D32;" data-action="acc-tab" data-tab="islem">💰 Gelir Ekle</button>
        <button class="btn-primary" style="font-size:12px;padding:11px;background:var(--bad);" data-action="acc-tab" data-tab="islem">📉 Gider Ekle</button>
      </div>
    </div>

    ${renderAccUyariKisa()}

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">
      <button class="btn-primary" style="background:#0D47A1;font-size:11.5px;padding:11px;" data-action="acc-tab" data-tab="kdv">📑 KDV Beyanı</button>
      <button class="btn-primary" style="background:#4527A0;font-size:11.5px;padding:11px;" data-action="acc-tab" data-tab="gv">🧮 Gelir Vergisi</button>
    </div>

    ${renderAccRecent(8)}
  `;
}

/* Özet ekranındaki kısa uyarı bloğu */
function renderAccUyariKisa() {
  const u = accUyarilar();
  if (!u.length) return "";
  const kritik = u.filter(x => x.seviye === "kritik");
  const uyari = u.filter(x => x.seviye === "uyari");
  const goster = [...kritik, ...uyari].slice(0, 3);
  if (!goster.length) return "";

  const satirlar = goster.map(x => {
    const renk = x.seviye === "kritik" ? "#C62828" : "#E65100";
    const bg = x.seviye === "kritik" ? "#FFEBEE" : "#FFF8E1";
    const bd = x.seviye === "kritik" ? "#EF9A9A" : "#FFD54F";
    return `<div style="display:flex;gap:8px;align-items:flex-start;padding:7px 0;border-bottom:1px solid ${bd}55;">
      <span style="font-size:13px;">${x.seviye === "kritik" ? "🔴" : "🟠"}</span>
      <div style="flex:1;min-width:0;">
        <p style="font-size:11.5px;font-weight:700;margin:0;color:${renk};">${escapeHtml(x.baslik)}</p>
        <p style="font-size:10px;margin:1px 0 0;color:${renk};opacity:.8;">${escapeHtml(x.mesaj)}</p>
      </div>
    </div>`;
  }).join("");

  return `<div class="card p4 mb3" style="background:linear-gradient(135deg,#FFF8E1,#FFECB3);border:1px solid #FFD54F;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
      <p style="font-size:12.5px;font-weight:700;color:#E65100;margin:0;">🔔 Mali Uyarılar (${u.length})</p>
      <button data-action="acc-tab" data-tab="takvim" style="background:none;border:none;font-size:10.5px;font-weight:700;color:#E65100;cursor:pointer;">Tümü →</button>
    </div>
    ${satirlar}
  </div>`;
}

/* Son işlemler listesi (düzenle + sil) */
function renderAccRecent(limit) {
  const acc = state.accounting;
  const all = [...(acc.incomes || []).map(i => ({ ...i, txType: "income" })), ...(acc.expenses || []).map(e => ({ ...e, txType: "expense" }))]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit || 15);
  return `<div class="card p4 mb3">
    <p style="font-size:13px;font-weight:700;margin:0 0 10px;">📋 Son İşlemler (${all.length})</p>
    ${all.length === 0 ? '<p class="footnote">Henüz kayıt yok.</p>' : all.map(tx => {
      const kdv = accNum(tx.kdv), stopaj = accNum(tx.stopaj);
      return `<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid var(--line);gap:8px;">
        <div style="flex:1;min-width:0;">
          <p style="font-size:12px;margin:0;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${tx.txType === "income" ? "💰" : "📉"} ${escapeHtml(tx.description || "")}</p>
          <p style="font-size:10px;color:var(--muted);margin:2px 0 0;">${escapeHtml(tx.category || "")}${tx.firm ? " · " + escapeHtml(tx.firm) : ""} · ${escapeHtml(tx.date || "")}${tx.invoiceNo ? " · F:" + escapeHtml(tx.invoiceNo) : ""}</p>
          ${(kdv || stopaj) ? `<p style="font-size:9px;color:#888;margin:1px 0 0;">KDV ${accTL(kdv)} · Stopaj ${accTL(stopaj)}</p>` : ""}
        </div>
        <div style="text-align:right;display:flex;align-items:center;gap:5px;flex-shrink:0;">
          <p style="font-size:12.5px;font-weight:700;color:${tx.txType === "income" ? "#2E7D32" : "#C62828"};margin:0;">${tx.txType === "income" ? "+" : "-"}${accTL0(tx.amount)}</p>
          <button data-action="acc-edit" data-id="${tx.id}" data-type="${tx.txType}" style="background:#E3F2FD;border:none;border-radius:6px;padding:5px 7px;cursor:pointer;font-size:11px;">✏️</button>
          <button data-action="acc-delete" data-id="${tx.id}" data-type="${tx.txType}" style="background:#FFEBEE;border:none;border-radius:6px;padding:5px 7px;cursor:pointer;font-size:11px;color:#C62828;">🗑️</button>
        </div>
      </div>`;
    }).join("")}
  </div>`;
}

/* ---------------- GELİR / GİDER SEKMESİ ---------------- */

function renderAccIslem() {
  const acc = state.accounting;
  const edit = state.accEdit;
  let editHtml = "";
  if (edit) {
    const src = edit.type === "income" ? (acc.incomes || []) : (acc.expenses || []);
    const r = src.find(x => x.id === edit.id);
    if (r) {
      editHtml = `<div class="card p4 mb3" style="border:2px solid var(--teal);background:#F1F8FE;">
        <p style="font-size:13px;font-weight:700;margin:0 0 10px;">✏️ ${edit.type === "income" ? "Gelir" : "Gider"} Kaydını Düzenle</p>
        <div class="field"><label>Tarih</label><input class="input" type="date" id="ed-date" value="${escapeAttr(r.date || "")}" /></div>
        <div class="field"><label>Açıklama</label><input class="input" id="ed-desc" value="${escapeAttr(r.description || "")}" /></div>
        <div class="field"><label>Tutar (₺)</label><input class="input" type="number" step="0.01" id="ed-amount" value="${accNum(r.amount)}" /></div>
        <div class="field"><label>Kategori</label><input class="input" id="ed-cat" value="${escapeAttr(r.category || "")}" list="acc-cats" /></div>
        <datalist id="acc-cats">
          ${["Muayene", "Dolgu", "Kanal Tedavisi", "İmplant", "Zirkonyum", "Beyazlatma", "Ortodonti", "Protez", "Diş Taşı Temizliği", "Kira", "Personel Maaş", "SGK Primi", "Malzeme", "Vergi", "Damga Vergisi", "Sigorta", "Elektrik/Su/İnternet", "Cihaz Bakım", "Muhasebeci", "Bağ-Kur", "Diğer"].map(c => `<option value="${c}"></option>`).join("")}
        </datalist>
        <div class="field"><label>Firma / Hasta</label><input class="input" id="ed-firm" value="${escapeAttr(r.firm || "")}" /></div>
        <div class="field"><label>Fatura No</label><input class="input" id="ed-invoice" value="${escapeAttr(r.invoiceNo || "")}" /></div>
        ${edit.type === "income" ? `
        <div class="field"><label>Ödeme Şekli</label>
          <select class="input" id="ed-payment">
            ${["Nakit", "Kredi Kartı", "POS", "Temassız", "Karekod", "Havale/EFT"].map(p => `<option ${r.paymentMethod === p ? "selected" : ""}>${p}</option>`).join("")}
          </select>
        </div>
        <div class="field"><label>Hasta Tipi (stopaj)</label>
          <select class="input" id="ed-ptype">
            <option value="kisi" ${r.patientType === "kisi" ? "selected" : ""}>Şahıs (Stopaj yok)</option>
            <option value="mukellef" ${r.patientType === "mukellef" ? "selected" : ""}>Vergi Mükellefi (Stopaj %20)</option>
          </select>
        </div>` : ""}
        <div style="display:flex;gap:8px;">
          <button class="btn-primary" style="background:#2E7D32;" data-action="acc-edit-save" data-id="${edit.id}" data-type="${edit.type}">💾 Güncelle</button>
          <button class="btn-primary" style="background:#757575;" data-action="acc-edit-cancel">İptal</button>
        </div>
      </div>`;
    }
  }

  return `
    ${editHtml}
    <div class="card p4 mb3" style="background:linear-gradient(135deg,#1A237E,#283593);color:white;border:none;">
      <p style="font-size:14px;font-weight:700;margin:0 0 8px;">💳 Gelir Ekle / Ödeme Al</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <input class="input" id="pos-desc" placeholder="Açıklama / Hasta" style="background:rgba(255,255,255,0.15);color:white;border:1px solid rgba(255,255,255,0.3);" />
        <input class="input" id="pos-amount" type="number" placeholder="Tutar (₺)" style="background:rgba(255,255,255,0.15);color:white;border:1px solid rgba(255,255,255,0.3);" />
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:8px;">
        <select class="input" id="pos-category" style="background:rgba(255,255,255,0.15);color:white;border:1px solid rgba(255,255,255,0.3);font-size:11px;">
          <option>Muayene</option><option>Dolgu</option><option>Kanal Tedavisi</option><option>İmplant</option><option>Zirkonyum</option><option>Beyazlatma</option><option>Ortodonti</option><option>Protez</option><option>Diş Taşı Temizliği</option><option>Diğer</option>
        </select>
        <select class="input" id="pos-payment" style="background:rgba(255,255,255,0.15);color:white;border:1px solid rgba(255,255,255,0.3);font-size:11px;">
          <option>Kredi Kartı</option><option>Temassız</option><option>Karekod</option><option>Nakit</option><option>Havale/EFT</option>
        </select>
        <select class="input" id="pos-patient-type" style="background:rgba(255,255,255,0.15);color:white;border:1px solid rgba(255,255,255,0.3);font-size:11px;">
          <option value="kisi">Şahıs (Stopaj Yok)</option><option value="mukellef">Vergi Mükellefi (Stopaj %20)</option>
        </select>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;">
        <input class="input" id="pos-firm" placeholder="Firma / Hasta (isteğe bağlı)" style="background:rgba(255,255,255,0.15);color:white;border:1px solid rgba(255,255,255,0.3);font-size:11px;" />
        <input class="input" id="pos-tc" placeholder="TC / Vergi No" style="background:rgba(255,255,255,0.15);color:white;border:1px solid rgba(255,255,255,0.3);font-size:11px;" />
      </div>
      <select class="input" id="pos-doctor" style="margin-top:8px;background:rgba(255,255,255,0.15);color:white;border:1px solid rgba(255,255,255,0.3);font-size:11px;">
        <option value="">— İşlemi yapan hekim (isteğe bağlı) —</option>
        ${(state.personnel || []).filter(p => p.aktif !== false).map(p => `<option value="${escapeAttr(p.id)}">${escapeHtml(p.name)}</option>`).join("")}
      </select>
      <label style="display:flex;align-items:center;gap:7px;margin-top:8px;font-size:11px;color:rgba(255,255,255,.9);">
        <input type="checkbox" id="pos-unpaid" />
        <span>Veresiye / ödenmedi (cari hesaba işlenir)</span>
      </label>
      <button class="btn-primary" style="margin-top:10px;background:linear-gradient(135deg,#4CAF50,#66BB6A);font-size:14px;font-weight:700;" data-action="pos-pay">💳 Kaydet & Fatura Kes</button>
      <p style="font-size:10px;margin:6px 0 0;opacity:0.7;">KDV %10 · Damga ‰9,48 · Stopaj mükelleften %20</p>
    </div>

    <div class="card p4 mb3">
      <p style="font-size:13px;font-weight:700;color:var(--bad);margin:0 0 8px;">📉 Gider Ekle</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <input class="input" id="acc-exp-desc" placeholder="Açıklama (firma, detay)" style="font-size:12px;" />
        <input class="input" id="acc-exp-amount" type="number" placeholder="Tutar (₺)" />
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:8px;">
        <select class="input" id="acc-exp-cat" style="font-size:11px;">
          <option>Kira</option><option>Personel Maaş</option><option>SGK Primi</option><option>Malzeme</option><option>Vergi</option><option>Damga Vergisi</option><option>Sigorta</option><option>Elektrik/Su/İnternet</option><option>Cihaz Bakım</option><option>Muhasebeci</option><option>Bağ-Kur</option><option>Depozito</option><option>İade</option><option>Diğer</option>
        </select>
        <input class="input" id="acc-exp-firm" placeholder="Firma" style="font-size:11px;" />
        <input class="input" id="acc-exp-invoice" placeholder="Fatura No" style="font-size:11px;" />
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px;">
        <input class="input" id="acc-exp-date" type="date" value="${accToday()}" style="font-size:11px;" />
        <input class="input" id="acc-exp-kdv" type="number" placeholder="KDV (₺, varsa)" style="font-size:11px;" />
      </div>
      <div style="margin-top:8px;">
        <label style="font-size:11px;display:flex;align-items:center;gap:6px;">
          <input type="checkbox" id="acc-exp-stopaj" /> Kira ödemesi (Stopaj %20 otomatik)
        </label>
      </div>
      ${stokGiderFormu()}
      <button class="btn-primary" style="margin-top:10px;background:var(--bad);" data-action="acc-add-expense">📉 Gider Kaydet</button>
    </div>

    ${renderAccRecent(30)}
  `;
}

/* ---------------- PERSONEL & SGK ---------------- */

function renderAccPersonel() {
  const s = sgkSet();
  const list = (state.personnel || []);
  const aktif = list.filter(p => p.aktif !== false);
  const t = accPayrollTotal();

  const rows = list.map(p => {
    const c = accPayroll(p);
    const pasif = p.aktif === false;
    return `<div class="card p3 mb2" style="opacity:${pasif ? 0.55 : 1};">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
        <div style="flex:1;min-width:0;">
          <p style="font-size:13px;font-weight:700;margin:0;">${escapeHtml(p.name || "-")} ${pasif ? "· (pasif)" : ""}</p>
          <p style="font-size:10.5px;color:var(--muted);margin:2px 0 0;">${escapeHtml(p.position || "-")}${p.tcNo ? " · TC " + escapeHtml(p.tcNo) : ""} · ${c.gun} gün · Brüt ${accTL(c.brut)}</p>
          <p style="font-size:10.5px;color:#6A1B9A;margin:3px 0 0;font-weight:600;">SGK primi: ${accTL(c.toplamSgk)} · Net: ${accTL(c.net)}</p>
          <p style="font-size:10px;color:#888;margin:1px 0 0;">İşçi ${accTL(c.isciSgk + c.isciIssiz)} · İşveren ${accTL(c.isverenSgk + c.isverenIssiz)} · GV ${accTL(c.gelirVergisi)}</p>
          ${c.uyari ? `<p style="font-size:9.5px;color:#E65100;margin:3px 0 0;">⚠️ ${c.uyari}</p>` : ""}
        </div>
        <div style="display:flex;flex-direction:column;gap:4px;">
          <button data-action="personel-edit" data-id="${p.id}" style="background:#E3F2FD;border:none;border-radius:6px;padding:5px 8px;cursor:pointer;font-size:11px;">✏️</button>
          <button data-action="personel-toggle" data-id="${p.id}" style="background:#FFF8E1;border:none;border-radius:6px;padding:5px 8px;cursor:pointer;font-size:11px;">${pasif ? "▶️" : "⏸️"}</button>
          <button data-action="personel-delete" data-id="${p.id}" style="background:#FFEBEE;border:none;border-radius:6px;padding:5px 8px;cursor:pointer;font-size:11px;color:#C62828;">🗑️</button>
        </div>
      </div>
    </div>`;
  }).join("") || '<p class="footnote">Henüz personel eklenmedi.</p>';

  const ed = state.personelEdit;
  let formHtml = "";
  if (ed !== null && ed !== undefined) {
    const p = list.find(x => x.id === ed) || { id: "", name: "", tcNo: "", position: "", grossSalary: s.minWage, days: 30, tesvikli: true, startDate: "" };
    formHtml = `<div class="card p4 mb3" style="border:2px solid #5E35B1;background:#F3E5F5;">
      <p style="font-size:13px;font-weight:700;margin:0 0 10px;color:#4527A0;">${p.id ? "✏️ Personeli Düzenle" : "➕ Yeni Personel"}</p>
      <div class="field"><label>Ad Soyad</label><input class="input" id="pr-name" value="${escapeAttr(p.name || "")}" placeholder="Örn: Ayşe Yılmaz" /></div>
      <div class="field"><label>TC Kimlik No</label><input class="input" id="pr-tc" value="${escapeAttr(p.tcNo || "")}" placeholder="11 haneli" maxlength="11" /></div>
      <div class="field"><label>Görev / Unvan</label><input class="input" id="pr-position" value="${escapeAttr(p.position || "")}" placeholder="Örn: Diş Hekimi, Asistan, Sekreter" list="pos-list" /></div>
      <datalist id="pos-list"><option value="Diş Hekimi"></option><option value="Asistan"></option><option value="Sekreter"></option><option value="Temizlik Personeli"></option><option value="Muhasebe"></option></datalist>
      <div class="field"><label>Brüt Ücret (₺ / ay)</label><input class="input" type="number" id="pr-gross" value="${accNum(p.grossSalary)}" /></div>
      <div class="field"><label>Çalışılan Gün (ay)</label><input class="input" type="number" id="pr-days" min="0" max="30" value="${accNum(p.days) || 30}" /></div>
      <div class="field"><label>İşe Giriş Tarihi</label><input class="input" type="date" id="pr-start" value="${escapeAttr(p.startDate || "")}" /></div>
      <label style="font-size:12px;display:flex;align-items:center;gap:8px;margin-bottom:12px;">
        <input type="checkbox" id="pr-tesvik" ${p.tesvikli !== false ? "checked" : ""} />
        <span>5 puanlık işveren prim indirimi uygulanacak</span>
      </label>
      <div style="display:flex;gap:8px;">
        <button class="btn-primary" style="background:#5E35B1;" data-action="personel-save" data-id="${p.id || ""}">💾 Kaydet</button>
        <button class="btn-primary" style="background:#757575;" data-action="personel-cancel">İptal</button>
      </div>
    </div>`;
  }

  return `
    <div class="card p4 mb3" style="background:linear-gradient(135deg,#4527A0,#5E35B1);color:white;border:none;">
      <p style="font-size:14px;font-weight:700;margin:0 0 4px;">🏥 Aylık SGK Prim Özeti</p>
      <p style="font-size:11px;opacity:.85;margin:0 0 10px;">${aktif.length} aktif personel · ${new Date().getFullYear()} parametreleri</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:8px;">
          <p style="font-size:9.5px;margin:0;opacity:.85;">TOPLAM SGK PRİMİ</p>
          <p style="font-size:15px;font-weight:800;margin:2px 0;">${accTL0(t.toplamSgk)}</p>
        </div>
        <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:8px;">
          <p style="font-size:9.5px;margin:0;opacity:.85;">İŞVEREN MALİYETİ</p>
          <p style="font-size:15px;font-weight:800;margin:2px 0;">${accTL0(t.isvereneMaliyet)}</p>
        </div>
      </div>
      <p style="font-size:10px;margin:8px 0 0;opacity:.8;">İşçi payı ${accTL0(t.isciSgk + t.isciIssiz)} · İşveren payı ${accTL0(t.isverenSgk + t.isverenIssiz)}</p>
    </div>

    <div class="card p3 mb3">
      <p style="font-size:12px;font-weight:700;margin:0 0 8px;">🔗 SGK'ya Gönderim</p>
      <p style="font-size:10.5px;color:var(--muted);margin:0 0 8px;line-height:1.5;">Aşağıdaki özeti kopyalayın, resmî e-Bildirge sistemine yapıştırıp onaylayın. (Güvenlik nedeniyle resmî sistemlere üçüncü taraf uygulamalardan doğrudan gönderim yapılamaz.)</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
        <a href="${ACC_LINKS.sgkEBildirge}" target="_blank" rel="noopener" class="btn-primary" style="text-decoration:none;background:#C62828;font-size:11.5px;padding:11px;">🔗 e-Bildirge</a>
        <a href="${ACC_LINKS.sgkEDevlet}" target="_blank" rel="noopener" class="btn-primary" style="text-decoration:none;background:#1565C0;font-size:11.5px;padding:11px;">🔗 e-Devlet</a>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px;">
        <button class="btn-primary" style="background:#fff;color:var(--ink);border:1px solid var(--line);font-size:11.5px;padding:11px;" data-action="acc-copy-sgk">📋 Özeti Kopyala</button>
        <button class="btn-primary" style="background:#fff;color:var(--ink);border:1px solid var(--line);font-size:11.5px;padding:11px;" data-action="acc-print-sgk">🖨️ Yazdır</button>
      </div>
      <button class="btn-primary" style="margin-top:6px;background:#5E35B1;font-size:11.5px;padding:11px;" data-action="acc-sgk-expense">➕ Bu Ayın Primini Gider Olarak Kaydet</button>
    </div>

    ${formHtml}
    ${ed === null || ed === undefined ? `<button class="btn-primary mb3" style="background:#5E35B1;" data-action="personel-new">➕ Personel Ekle</button>` : ""}

    <p class="section-label">Personel Listesi (${list.length})</p>
    ${rows}

    <div class="card p4 mb3" style="background:#F3E5F5;border:1px solid #CE93D8;">
      <p style="font-size:12px;font-weight:700;color:#4527A0;margin:0 0 8px;">⚙️ SGK Parametreleri</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
        <div><label style="font-size:10px;color:#666;">Brüt Asgari Ücret</label><input class="input" type="number" id="sg-min" value="${s.minWage}" style="font-size:11px;padding:6px;" /></div>
        <div><label style="font-size:10px;color:#666;">Tavan (kat)</label><input class="input" type="number" id="sg-carpan" value="${s.tavanCarpan}" style="font-size:11px;padding:6px;" /></div>
        <div><label style="font-size:10px;color:#666;">İşçi SGK %</label><input class="input" type="number" step="0.01" id="sg-isci" value="${s.isciSgk}" style="font-size:11px;padding:6px;" /></div>
        <div><label style="font-size:10px;color:#666;">İşçi İşsizlik %</label><input class="input" type="number" step="0.01" id="sg-isciis" value="${s.isciIssizlik}" style="font-size:11px;padding:6px;" /></div>
        <div><label style="font-size:10px;color:#666;">İşveren SGK %</label><input class="input" type="number" step="0.01" id="sg-isveren" value="${s.isverenSgk}" style="font-size:11px;padding:6px;" /></div>
        <div><label style="font-size:10px;color:#666;">İşveren İşsizlik %</label><input class="input" type="number" step="0.01" id="sg-isverenis" value="${s.isverenIssizlik}" style="font-size:11px;padding:6px;" /></div>
        <div><label style="font-size:10px;color:#666;">Teşvik indirimi (puan)</label><input class="input" type="number" step="0.01" id="sg-tesvik" value="${s.tesvikPuan}" style="font-size:11px;padding:6px;" /></div>
        <div><label style="font-size:10px;color:#666;">Damga oranı (‰)</label><input class="input" type="number" step="0.001" id="sg-damga" value="${(s.damgaOran * 1000).toFixed(3)}" style="font-size:11px;padding:6px;" /></div>
      </div>
      <button class="btn-primary" style="margin-top:8px;background:#5E35B1;font-size:11.5px;padding:10px;" data-action="sgk-settings-save">💾 Parametreleri Kaydet</button>
      <p style="font-size:9.5px;color:#888;margin:6px 0 0;line-height:1.5;">2026 varsayılanları: brüt asgari ücret 33.030 ₺, tavan 9 kat. Asgari ücret değiştiğinde buradan güncelleyin.</p>
    </div>
  `;
}

/* ---------------- VERGİ & BEYANNAME ---------------- */

function renderAccVergi() {
  const inc = accInRange(state.accounting.incomes);
  const exp = accInRange(state.accounting.expenses);
  const brut = inc.reduce((s, i) => s + accNum(i.grossAmount || i.amount), 0);
  const kdv = accSum(inc, "kdv");
  const stopaj = accSum(inc, "stopaj");
  const damga = accSum(inc, "damga");
  const gider = accSum(exp, "amount");
  const kdvGider = exp.reduce((s, e) => s + accNum(e.kdv), 0);
  const odenecekKdv = Math.max(0, kdv - kdvGider);
  const netKar = brut - gider;

  const now = new Date();
  const donem = String(now.getMonth() + 1).padStart(2, "0") + "/" + now.getFullYear();
  const ceyrek = Math.floor(now.getMonth() / 3) + 1;

  return `
    <div class="card p4 mb3" style="background:linear-gradient(135deg,#E65100,#F57C00);color:white;border:none;">
      <p style="font-size:14px;font-weight:700;margin:0 0 4px;">🧾 Beyanname Ön Özeti</p>
      <p style="font-size:11px;opacity:.9;margin:0 0 10px;">Dönem: ${donem} · ${ceyrek}. çeyrek · ${accRangeLabel(state.accRange)}</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:8px;">
          <p style="font-size:9.5px;margin:0;opacity:.85;">ÖDENECEK KDV</p>
          <p style="font-size:15px;font-weight:800;margin:2px 0;">${accTL0(odenecekKdv)}</p>
        </div>
        <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:8px;">
          <p style="font-size:9.5px;margin:0;opacity:.85;">STOPAJ</p>
          <p style="font-size:15px;font-weight:800;margin:2px 0;">${accTL0(stopaj)}</p>
        </div>
      </div>
    </div>

    <div class="card p4 mb3">
      <p style="font-size:13px;font-weight:700;margin:0 0 8px;">📄 Dönem Vergi Tablosu</p>
      <table style="width:100%;font-size:11.5px;border-collapse:collapse;">
        <tr style="border-bottom:1px solid var(--line);"><td style="padding:5px 0;">Brüt Gelir</td><td style="text-align:right;font-weight:600;">${accTL(brut)}</td></tr>
        <tr style="border-bottom:1px solid var(--line);"><td style="padding:5px 0;">Hesaplanan KDV (%10)</td><td style="text-align:right;color:#E65100;font-weight:600;">${accTL(kdv)}</td></tr>
        <tr style="border-bottom:1px solid var(--line);"><td style="padding:5px 0;">İndirilecek KDV</td><td style="text-align:right;color:#2E7D32;font-weight:600;">-${accTL(kdvGider)}</td></tr>
        <tr style="border-bottom:1px solid var(--line);background:#FFF3E0;"><td style="padding:5px 0;font-weight:700;">Ödenecek KDV</td><td style="text-align:right;font-weight:800;color:#E65100;">${accTL(odenecekKdv)}</td></tr>
        <tr style="border-bottom:1px solid var(--line);"><td style="padding:5px 0;">Stopaj (%20)</td><td style="text-align:right;color:#1565C0;font-weight:600;">${accTL(stopaj)}</td></tr>
        <tr style="border-bottom:1px solid var(--line);"><td style="padding:5px 0;">Damga Vergisi (‰9,48)</td><td style="text-align:right;color:#7B1FA2;font-weight:600;">${accTL(damga)}</td></tr>
        <tr style="border-bottom:1px solid var(--line);"><td style="padding:5px 0;">Toplam Gider</td><td style="text-align:right;color:#C62828;font-weight:600;">-${accTL(gider)}</td></tr>
        <tr><td style="padding:6px 0;font-weight:700;">Net Kâr</td><td style="text-align:right;font-weight:800;color:${netKar >= 0 ? "#2E7D32" : "#C62828"};">${accTL(netKar)}</td></tr>
      </table>
    </div>

    <div class="card p4 mb3">
      <p style="font-size:13px;font-weight:700;margin:0 0 8px;">🔗 GİB — Gelir İdaresi Başkanlığı</p>
      <p style="font-size:10.5px;color:var(--muted);margin:0 0 10px;line-height:1.5;">Beyannameyi aşağıdaki resmî sistemden verip ödemeyi Dijital Vergi Dairesi'nden yapabilirsiniz.</p>
      <a href="${ACC_LINKS.gibEBeyanname}" target="_blank" rel="noopener" class="btn-primary" style="text-decoration:none;background:#C62828;margin-bottom:6px;">📄 e-Beyanname (Beyanname Ver)</a>
      <a href="${ACC_LINKS.gibDijital}" target="_blank" rel="noopener" class="btn-primary" style="text-decoration:none;background:#2E7D32;margin-bottom:6px;">💳 Dijital Vergi Dairesi (Ödeme)</a>
      <a href="${ACC_LINKS.gibInteraktif}" target="_blank" rel="noopener" class="btn-primary" style="text-decoration:none;background:#1565C0;margin-bottom:6px;">🧾 İnteraktif Vergi Dairesi</a>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:4px;">
        <button class="btn-primary" style="background:#fff;color:var(--ink);border:1px solid var(--line);font-size:11.5px;padding:11px;" data-action="acc-copy-vergi">📋 Özeti Kopyala</button>
        <button class="btn-primary" style="background:#fff;color:var(--ink);border:1px solid var(--line);font-size:11.5px;padding:11px;" data-action="acc-print-vergi">🖨️ Yazdır</button>
      </div>
    </div>

    <div class="card p4 mb3" style="background:#FFF8E1;border:1px solid #FFD54F;">
      <p style="font-size:12px;font-weight:700;color:#E65100;margin:0 0 6px;">📅 Ödeme Takvimi Hatırlatması</p>
      <p style="font-size:10.5px;color:#8D6E00;margin:0;line-height:1.6;">
        • KDV / Muhtasar beyanname: her ayın <b>26'sı</b> akşamına kadar<br/>
        • SGK aylık prim bildirgesi: her ayın <b>23'ü</b><br/>
        • Ödeme: beyanname sonrası ayın <b>sonuna</b> kadar<br/>
        • Yıllık gelir vergisi: Mart sonu
      </p>
      <p style="font-size:9.5px;color:#A1887F;margin:6px 0 0;">Bu tarihler genel bilgidir; resmî takvimi GİB/SGK'dan doğrulayın.</p>
    </div>
  `;
}

/* ---------------- RAPORLAR ---------------- */

function renderAccRapor() {
  const acc = state.accounting;
  const inc = accInRange(acc.incomes);
  const exp = accInRange(acc.expenses);
  const gelir = accSum(inc, "amount");
  const gider = accSum(exp, "amount");
  const net = gelir - gider;

  const incCats = accGroupBy(inc, "category");
  const expCats = accGroupBy(exp, "category");
  const maxInc = incCats.length ? incCats[0][1].toplam : 0;
  const maxExp = expCats.length ? expCats[0][1].toplam : 0;

  const bar = (name, data, max, color) => `
    <div style="margin-bottom:7px;">
      <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:2px;">
        <span style="font-weight:600;">${escapeHtml(name)}</span>
        <span style="color:${color};font-weight:700;">${accTL0(data.toplam)} <span style="color:#aaa;font-weight:400;">(${data.adet})</span></span>
      </div>
      <div style="height:7px;background:#EEE;border-radius:4px;overflow:hidden;">
        <div style="height:100%;width:${max ? Math.max(3, data.toplam / max * 100) : 0}%;background:${color};border-radius:4px;"></div>
      </div>
    </div>`;

  /* Son 6 ay trendi */
  const aylar = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const y = d.getFullYear(), m = d.getMonth();
    const i2 = (acc.incomes || []).filter(x => { const t = new Date(x.date); return t.getFullYear() === y && t.getMonth() === m; });
    const e2 = (acc.expenses || []).filter(x => { const t = new Date(x.date); return t.getFullYear() === y && t.getMonth() === m; });
    aylar.push({
      etiket: d.toLocaleDateString("tr-TR", { month: "short", year: "2-digit" }),
      gelir: accSum(i2, "amount"),
      gider: accSum(e2, "amount")
    });
  }
  const maxTrend = Math.max(1, ...aylar.map(a => Math.max(a.gelir, a.gider)));

  const chip = (id, label) => `<button data-action="acc-range" data-range="${id}" style="flex:0 0 auto;padding:7px 13px;border-radius:20px;font-size:11.5px;font-weight:600;font-family:'Plus Jakarta Sans',sans-serif;border:1px solid ${state.accRange === id ? "var(--teal)" : "var(--line)"};background:${state.accRange === id ? "var(--teal)" : "rgba(255,255,255,.7)"};color:${state.accRange === id ? "#fff" : "var(--ink)"};cursor:pointer;">${label}</button>`;
  const chips = ["hafta", "ay", "3ay", "6ay", "yil"].map((k, i) => chip(k, ["Hafta", "Ay", "3 Ay", "6 Ay", "Yıl"][i])).join("");

  return `
    <div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:6px;margin-bottom:10px;">${chips}</div>
    <p style="font-size:11px;color:var(--muted);margin:0 0 10px;">Dönem: <b>${accRangeLabel(state.accRange)}</b></p>

    <div class="card p4 mb3">
      <p style="font-size:13px;font-weight:700;margin:0 0 10px;">💰 Gelir Dağılımı</p>
      ${incCats.length ? incCats.map(([k, v]) => bar(k, v, maxInc, "#2E7D32")).join("") : '<p class="footnote">Bu dönemde gelir kaydı yok.</p>'}
    </div>

    <div class="card p4 mb3">
      <p style="font-size:13px;font-weight:700;margin:0 0 10px;">📉 Gider Dağılımı</p>
      ${expCats.length ? expCats.map(([k, v]) => bar(k, v, maxExp, "#C62828")).join("") : '<p class="footnote">Bu dönemde gider kaydı yok.</p>'}
    </div>

    <div class="card p4 mb3">
      <p style="font-size:13px;font-weight:700;margin:0 0 10px;">📊 Son 6 Ay Trendi</p>
      <div style="display:flex;align-items:flex-end;gap:8px;height:130px;padding-top:8px;">
        ${aylar.map(a => `
          <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;">
            <div style="display:flex;gap:2px;align-items:flex-end;height:100%;width:100%;justify-content:center;">
              <div title="Gelir: ${accTL0(a.gelir)}" style="width:40%;background:#2E7D32;border-radius:3px 3px 0 0;height:${Math.max(2, a.gelir / maxTrend * 100)}%;"></div>
              <div title="Gider: ${accTL0(a.gider)}" style="width:40%;background:#C62828;border-radius:3px 3px 0 0;height:${Math.max(2, a.gider / maxTrend * 100)}%;"></div>
            </div>
            <span style="font-size:9px;color:#888;margin-top:4px;">${a.etiket}</span>
          </div>`).join("")}
      </div>
      <div style="display:flex;gap:14px;justify-content:center;margin-top:8px;font-size:10px;">
        <span><span style="display:inline-block;width:9px;height:9px;background:#2E7D32;border-radius:2px;"></span> Gelir</span>
        <span><span style="display:inline-block;width:9px;height:9px;background:#C62828;border-radius:2px;"></span> Gider</span>
      </div>
    </div>

    <div class="card p4 mb3">
      <p style="font-size:13px;font-weight:700;margin:0 0 10px;">📋 Dönem Tablosu</p>
      <table style="width:100%;font-size:11.5px;border-collapse:collapse;">
        <tr style="border-bottom:1px solid var(--line);"><td style="padding:5px 0;">Toplam Gelir</td><td style="text-align:right;font-weight:700;color:#2E7D32;">${accTL(gelir)}</td></tr>
        <tr style="border-bottom:1px solid var(--line);"><td style="padding:5px 0;">Toplam Gider</td><td style="text-align:right;font-weight:700;color:#C62828;">${accTL(gider)}</td></tr>
        <tr style="border-bottom:1px solid var(--line);"><td style="padding:5px 0;">Net</td><td style="text-align:right;font-weight:800;color:${net >= 0 ? "#0D47A1" : "#BF360C"};">${accTL(net)}</td></tr>
        <tr style="border-bottom:1px solid var(--line);"><td style="padding:5px 0;">Ortalama günlük gelir</td><td style="text-align:right;">${accTL(gelir / Math.max(1, Math.round((accRangeEnd(state.accRange) - accRangeStart(state.accRange)) / 86400000)))}</td></tr>
        <tr><td style="padding:5px 0;">Kayıt sayısı</td><td style="text-align:right;">${inc.length} gelir · ${exp.length} gider</td></tr>
      </table>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
      <button class="btn-primary" style="background:#0E93AC;font-size:12px;padding:12px;" data-action="acc-export-csv">⬇️ CSV İndir</button>
      <button class="btn-primary" style="background:#5E35B1;font-size:12px;padding:12px;" data-action="acc-print-rapor">🖨️ Rapor Yazdır</button>
    </div>
  `;
}

/* ---------------- OTOMATİK GİDERLER ---------------- */

function renderAccOtomatik() {
  const ae = state.autoExpenses || {};
  const rows = [
    ["kira", "🏠 Kira", 50000], ["elektrik", "⚡ Elektrik", 3000], ["su", "💧 Su", 1500],
    ["dogalgaz", "🔥 Doğalgaz", 2000], ["sgk", "🏥 SGK/Prim", 8000], ["vergi", "📋 Vergi/Beyanname", 5000]
  ];
  return `
    <div class="card p4 mb3" style="background:linear-gradient(135deg,#FFF3E0,#FFE0B2);border:1px solid #FFB74D;">
      <p style="font-size:14px;font-weight:700;margin:0 0 6px;color:#E65100;">🔄 Otomatik Aylık Giderler</p>
      <p style="font-size:11px;color:#BF360C;margin:0 0 10px;">Her ay tek dokunuşla muhasebeye işlenir. Tutarları güncelleyebilirsiniz.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
        ${rows.map(([k, lbl, def]) => `
          <div style="display:flex;align-items:center;gap:4px;">
            <span style="font-size:11px;flex:1;">${lbl}</span>
            <input class="input" style="width:82px;padding:5px 6px;font-size:11px;text-align:right;" type="number" value="${accNum(ae[k]) || def}" data-auto="${k}" />
          </div>`).join("")}
      </div>
      <div style="display:flex;gap:8px;margin-top:10px;">
        <button class="btn-primary" style="flex:1;font-size:12px;background:var(--bad);" data-action="save-auto-expenses">💾 Kaydet</button>
        <button class="btn-primary" style="flex:1;font-size:12px;background:#E65100;" data-action="run-auto-expenses">⚡ Bu Ay İşle</button>
      </div>
      <p style="font-size:10px;color:#888;margin:8px 0 0;">Toplam: ${accTL(rows.reduce((s, [k, , def]) => s + (accNum(ae[k]) || def), 0))}</p>
    </div>
    ${renderAccRecent(10)}
  `;
}

/* ---------------- EK İŞLEMLER ---------------- */

/* Kayıt düzenleme: gelirde vergi alanları yeniden hesaplanır */
function accRecalcIncome(rec) {
  const gross = rec.grossAmount != null ? accNum(rec.grossAmount) : accNum(rec.amount);
  rec.grossAmount = gross;
  rec.kdvOran = rec.kdvOran != null ? accNum(rec.kdvOran) : 0.10;
  rec.kdv = gross * rec.kdvOran;
  rec.stopajOran = rec.patientType === "mukellef" ? 0.20 : 0;
  rec.stopaj = gross * rec.stopajOran;
  rec.damga = gross * 0.00948;
  rec.amount = gross - rec.stopaj + rec.kdv;
  return rec;
}

function accPrint(title, bodyHtml) {
  const w = window.open("", "_blank");
  if (!w) { alert("Açılır pencere engellendi. Lütfen izin verin."); return; }
  w.document.write(`<html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
    <style>body{font-family:Arial,Helvetica,sans-serif;padding:24px;color:#222;font-size:13px;line-height:1.6;}
    h2{margin:0 0 4px;font-size:20px;} .sub{color:#777;font-size:12px;margin-bottom:16px;}
    table{width:100%;border-collapse:collapse;margin:10px 0;font-size:12px;}
    td,th{border-bottom:1px solid #ddd;padding:6px 4px;text-align:left;}
    th{background:#f5f5f5;} .r{text-align:right;}
    pre{background:#f7f7f7;padding:12px;border-radius:6px;font-size:12px;white-space:pre-wrap;}
    @media print{.noprint{display:none;}}</style></head><body>
    <h2>NUR DİŞ & DENTAL KLİNİK</h2>
    <div class="sub">${escapeHtml(title)} · ${new Date().toLocaleString("tr-TR")}</div>
    ${bodyHtml}
    <p class="noprint" style="margin-top:24px;"><button onclick="window.print()" style="padding:10px 20px;font-size:14px;">🖨️ Yazdır</button></p>
    </body></html>`);
  w.document.close();
}

function accCsvDownload(filename, rows) {
  const csv = rows.map(r => r.map(c => {
    const s = String(c == null ? "" : c);
    return /[";\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }).join(";")).join("\r\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

/* ---------------- AKSİYON YÖNLENDİRİCİ ---------------- */

function accAction(action, el) {
  // Yedekleme aksiyonları
  if (typeof yedekAction === "function" && yedekAction(action, el)) return true;

  const A = (name) => action === name;

  if (A("acc-tab")) {
    state.accTab = el.dataset.tab;
    state.accEdit = null; state.personelEdit = undefined;
    render();
    return true;
  }
  if (A("acc-range")) {
    state.accRange = el.dataset.range;
    render();
    return true;
  }
  if (A("acc-range-apply")) {
    state.accFrom = document.getElementById("acc-from")?.value || "";
    state.accTo = document.getElementById("acc-to")?.value || "";
    render();
    return true;
  }

  /* ---- düzenleme ---- */
  if (A("acc-edit")) {
    state.accEdit = { type: el.dataset.type, id: el.dataset.id };
    state.accTab = "islem";
    render();
    window.scrollTo(0, 0);
    return true;
  }
  if (A("acc-edit-cancel")) {
    state.accEdit = null;
    render();
    return true;
  }
  if (A("acc-edit-save")) {
    const type = el.dataset.type, id = el.dataset.id;
    const acc = state.accounting;
    const arr = type === "income" ? acc.incomes : acc.expenses;
    const rec = (arr || []).find(x => x.id === id);
    if (!rec) { state.accEdit = null; render(); return true; }

    rec.date = document.getElementById("ed-date")?.value || rec.date;
    rec.description = (document.getElementById("ed-desc")?.value || "").trim() || rec.description;
    rec.category = (document.getElementById("ed-cat")?.value || "").trim() || rec.category;
    rec.firm = (document.getElementById("ed-firm")?.value || "").trim();
    rec.invoiceNo = (document.getElementById("ed-invoice")?.value || "").trim();

    if (type === "income") {
      rec.paymentMethod = document.getElementById("ed-payment")?.value || rec.paymentMethod;
      const newType = document.getElementById("ed-ptype")?.value || rec.patientType || "kisi";
      const oldAmount = accNum(rec.amount);
      rec.patientType = newType;
      const gross = accNum(document.getElementById("ed-amount")?.value);
      if (gross > 0) {
        // Kullanıcı net tahsil edilen tutarı değiştirdiyse brüt'ü geri hesapla
        rec.grossAmount = Math.abs(gross - oldAmount) > 0.005 ? gross : accNum(rec.grossAmount);
      }
      accRecalcIncome(rec);
      if (rec.invoiceNo) {
        const inv = (acc.invoices || []).find(v => v.no === rec.invoiceNo);
        if (inv) {
          inv.date = rec.date; inv.description = rec.description; inv.category = rec.category;
          inv.grossAmount = rec.grossAmount; inv.kdv = rec.kdv; inv.stopaj = rec.stopaj;
          inv.damga = rec.damga; inv.netAmount = rec.amount; inv.firm = rec.firm;
          inv.paymentMethod = rec.paymentMethod;
        }
      }
    } else {
      rec.amount = accNum(document.getElementById("ed-amount")?.value) || rec.amount;
      rec.grossAmount = rec.amount;
    }

    localStorage.setItem("nurdis_accounting", JSON.stringify(acc));
    if (typeof saveAccountingToFirebase === "function") saveAccountingToFirebase();
    state.accEdit = null;
    alert("✅ Kayıt güncellendi.");
    render();
    return true;
  }

  /* ---- SGK ---- */
  if (A("personel-new")) { state.personelEdit = ""; render(); window.scrollTo(0, 0); return true; }
  if (A("personel-edit")) { state.personelEdit = el.dataset.id; render(); window.scrollTo(0, 0); return true; }
  if (A("personel-cancel")) { state.personelEdit = undefined; render(); return true; }
  if (A("personel-save")) {
    const id = el.dataset.id;
    const rec = {
      id: id || ("prs_" + Date.now()),
      name: (document.getElementById("pr-name")?.value || "").trim(),
      tcNo: (document.getElementById("pr-tc")?.value || "").trim(),
      position: (document.getElementById("pr-position")?.value || "").trim(),
      grossSalary: accNum(document.getElementById("pr-gross")?.value),
      days: accNum(document.getElementById("pr-days")?.value) || 30,
      startDate: document.getElementById("pr-start")?.value || "",
      tesvikli: !!document.getElementById("pr-tesvik")?.checked,
      aktif: true
    };
    if (!rec.name) { alert("Personel adı gerekli."); return true; }
    if (rec.tcNo && rec.tcNo.length !== 11) { alert("TC kimlik no 11 haneli olmalı."); return true; }
    if (!(rec.grossSalary > 0)) { alert("Brüt ücret giriniz."); return true; }

    if (!state.personnel) state.personnel = [];
    if (id) {
      const old = state.personnel.find(p => p.id === id);
      Object.assign(old, rec, { aktif: old.aktif !== false });
    } else {
      state.personnel.push(rec);
    }
    localStorage.setItem("nurdis_personnel", JSON.stringify(state.personnel));
    if (typeof saveAccountingToFirebase === "function") saveAccountingToFirebase();
    state.personelEdit = undefined;
    alert("✅ Personel kaydedildi. SGK primi otomatik hesaplandı.");
    render();
    return true;
  }
  if (A("personel-toggle")) {
    const p = (state.personnel || []).find(x => x.id === el.dataset.id);
    if (p) {
      p.aktif = p.aktif === false;
      localStorage.setItem("nurdis_personnel", JSON.stringify(state.personnel));
      if (typeof saveAccountingToFirebase === "function") saveAccountingToFirebase();
      render();
    }
    return true;
  }
  if (A("personel-delete")) {
    if (!confirm("Bu personeli silmek istediğinize emin misiniz?")) return true;
    state.personnel = (state.personnel || []).filter(x => x.id !== el.dataset.id);
    localStorage.setItem("nurdis_personnel", JSON.stringify(state.personnel));
    if (typeof saveAccountingToFirebase === "function") saveAccountingToFirebase();
    render();
    return true;
  }
  if (A("sgk-settings-save")) {
    const s = state.sgkSettings || {};
    s.minWage = accNum(document.getElementById("sg-min")?.value) || SGK_DEFAULTS.minWage;
    s.tavanCarpan = accNum(document.getElementById("sg-carpan")?.value) || SGK_DEFAULTS.tavanCarpan;
    s.isciSgk = accNum(document.getElementById("sg-isci")?.value);
    s.isciIssizlik = accNum(document.getElementById("sg-isciis")?.value);
    s.isverenSgk = accNum(document.getElementById("sg-isveren")?.value);
    s.isverenIssizlik = accNum(document.getElementById("sg-isverenis")?.value);
    s.tesvikPuan = accNum(document.getElementById("sg-tesvik")?.value);
    s.damgaOran = accNum(document.getElementById("sg-damga")?.value) / 1000;
    if (!s.vergiDilimleri) s.vergiDilimleri = SGK_DEFAULTS.vergiDilimleri;
    state.sgkSettings = s;
    localStorage.setItem("nurdis_sgk_settings", JSON.stringify(s));
    if (typeof saveAccountingToFirebase === "function") saveAccountingToFirebase();
    alert("✅ SGK parametreleri kaydedildi.");
    render();
    return true;
  }
  if (A("acc-sgk-expense")) {
    const t = accPayrollTotal();
    if (!t.kisi) { alert("Önce personel ekleyin."); return true; }
    if (t.toplamSgk <= 0) { alert("Hesaplanan prim yok."); return true; }
    if (!confirm("Bu ayın SGK primini (" + accTL(t.toplamSgk) + ") gider olarak kaydetmek istiyor musunuz?")) return true;
    const d = new Date();
    const ayAdi = d.toLocaleDateString("tr-TR", { month: "long", year: "numeric" });
    if (!state.accounting) state.accounting = { incomes: [], expenses: [], firms: [], bankAccounts: [], invoices: [] };
    state.accounting.expenses.push({
      id: "exp_sgk_" + Date.now(),
      description: "SGK Prim Ödemesi — " + ayAdi + " (" + t.kisi + " personel)",
      amount: Math.round(t.toplamSgk * 100) / 100,
      category: "SGK Primi",
      firm: "SGK",
      date: accToday(),
      invoiceNo: "",
      createdAt: new Date().toISOString()
    });
    localStorage.setItem("nurdis_accounting", JSON.stringify(state.accounting));
    if (typeof saveAccountingToFirebase === "function") saveAccountingToFirebase();
    alert("✅ SGK primi gider olarak kaydedildi: " + accTL(t.toplamSgk));
    render();
    return true;
  }

  /* ---- RANDEVU MESAJ / KONUM (gece kuralı) ---- */
  if (A("rv-mesaj")) {
    const r = (state.appointments || []).find(x => x.id === el.dataset.id);
    if (!r) return true;
    const res = guvenliWhatsApp(r.phone, randevuMesaj("onay", r), "Randevu bilgisi — " + r.name);
    render();
    return true;
  }
  if (A("rv-konum")) {
    const r = (state.appointments || []).find(x => x.id === el.dataset.id);
    if (!r) return true;
    guvenliWhatsApp(r.phone, randevuMesaj("konum", r), "Konum — " + r.name);
    render();
    return true;
  }

  /* ---- OTOMASYON ---- */
  if (A("otomasyon-saat-kaydet")) {
    const bas = parseInt(document.getElementById("ms-bas")?.value);
    const son = parseInt(document.getElementById("ms-son")?.value);
    const kapali = !!document.getElementById("ms-kapali")?.checked;
    if (bas < 0 || bas > 23 || son < 0 || son > 23) { alert("Saat 0-23 arası olmalı."); return true; }
    if (bas >= son) { alert("Başlangıç saati bitişten küçük olmalı."); return true; }
    state.mesajSaatAyar = { bas, son, kapali };
    localStorage.setItem("nurdis_mesaj_saat", JSON.stringify(state.mesajSaatAyar));
    if (typeof saveAccountingToFirebase === "function") saveAccountingToFirebase();
    alert("✅ Mesaj saatleri kaydedildi.\n\nGönderim aralığı: " + bas + ":00 – " + son + ":00" + (kapali ? "\n(Kural kapalı)" : ""));
    render();
    return true;
  }
  if (A("otomasyon-stok-kaydet")) {
    state.stokOtoAktif = !!document.getElementById("stok-oto")?.checked;
    localStorage.setItem("nurdis_stok_oto", state.stokOtoAktif ? "1" : "0");
    if (typeof saveAccountingToFirebase === "function") saveAccountingToFirebase();
    alert("✅ Stok otomatik düşüm " + (state.stokOtoAktif ? "AÇIK" : "KAPALI"));
    render();
    return true;
  }
  if (A("google-link-kaydet")) {
    const link = (document.getElementById("gy-link")?.value || "").trim();
    state.konumAyar = Object.assign({}, state.konumAyar || {}, { googleYorum: link });
    localStorage.setItem("nurdis_konum_ayar", JSON.stringify(state.konumAyar));
    if (typeof saveAccountingToFirebase === "function") saveAccountingToFirebase();
    alert("✅ Google yorum bağlantısı kaydedildi.");
    render();
    return true;
  }
  if (A("kuyruk-gonder")) {
    const m2 = (state.mesajKuyrugu || []).find(x => x.id === el.dataset.id);
    if (!m2) return true;
    window.open(waLink(m2.veri.tel, m2.veri.mesaj), "_blank");
    m2.gonderildi = true;
    localStorage.setItem("nurdis_mesaj_kuyrugu", JSON.stringify(state.mesajKuyrugu));
    render();
    return true;
  }
  if (A("kuyruk-sil")) {
    state.mesajKuyrugu = (state.mesajKuyrugu || []).filter(x => x.id !== el.dataset.id);
    localStorage.setItem("nurdis_mesaj_kuyrugu", JSON.stringify(state.mesajKuyrugu));
    render();
    return true;
  }
  if (A("kuyruk-hepsi")) {
    const liste = mesajKuyruguListesi();
    if (!liste.length) return true;
    if (!confirm(liste.length + " mesaj gönderilecek. Devam?")) return true;
    liste.forEach((m2, i) => setTimeout(() => {
      window.open(waLink(m2.veri.tel, m2.veri.mesaj), "_blank");
      m2.gonderildi = true;
      localStorage.setItem("nurdis_mesaj_kuyrugu", JSON.stringify(state.mesajKuyrugu));
    }, i * 700));
    setTimeout(() => render(), 1500);
    return true;
  }

  /* ---- ANKET ---- */
  if (A("anket-tab")) { state.anketTab = el.dataset.tab; render(); return true; }

  if (A("anket-gonder")) {
    const a = (state.anketler || []).find(x => x.id === el.dataset.id);
    if (!a) return true;
    const r = guvenliWhatsApp(a.phone, anketMesaj(a.name), "Memnuniyet anketi");
    if (r.gonderildi) {
      a.gonderildi = true;
      a.gonderimTarihi = new Date().toISOString();
      anketKaydet();
      setTimeout(() => { state.anketTab = "yanit"; render(); }, 400);
    }
    render();
    return true;
  }

  if (A("anket-gonderildi")) {
    const a = (state.anketler || []).find(x => x.id === el.dataset.id);
    if (a) {
      a.gonderildi = true;
      a.gonderimTarihi = new Date().toISOString();
      anketKaydet();
      setTimeout(() => { state.anketTab = "yanit"; render(); }, 400);
    }
    return true; // WhatsApp bağlantısı açılsın
  }

  if (A("anket-puan")) {
    const a = (state.anketler || []).find(x => x.id === el.dataset.id);
    if (!a) return true;
    a.puan = parseInt(el.dataset.puan);
    a.yanitTarihi = new Date().toISOString();
    anketKaydet();
    const p = a.puan;

    if (p >= 4) {
      // ⭐ YÜKSEK PUAN → Google yorum daveti
      if (a.phone && typeof googleYorumMesaji === "function") {
        if (confirm("🌟 " + p + " yıldız alındı!\n\n" + a.name + " adlı hastaya Google'da yorum bırakması için davet mesajı gönderilsin mi?\n\n(Google yorumları yeni hasta kazandırır)")) {
          const r = guvenliWhatsApp(a.phone, googleYorumMesaji(a.name), "Google yorum daveti");
          if (r.gonderildi) {
            a.googleDavet = true;
            a.googleDavetTarihi = new Date().toISOString();
            anketKaydet();
          }
        }
      }
    } else {
      // 🔴 DÜŞÜK PUAN → telafi mesajı
      if (a.phone && confirm("Düşük puan (" + p + "⭐) alındı.\n\nHastaya özür/telafi mesajı gönderilsin mi?")) {
        guvenliWhatsApp(a.phone, anketMesaj(a.name, true), "Telafi mesajı");
      }
    }
    render();
    return true;
  }

  /* ---- RANDEVU HATIRLATMA ---- */
  if (A("hatirlat-gonderildi")) {
    const r = (state.appointments || []).find(x => x.id === el.dataset.id);
    if (r) {
      if (!state.hatirlatmaLog) state.hatirlatmaLog = [];
      state.hatirlatmaLog.unshift({ id: r.id, name: r.name, tarih: new Date().toISOString() });
      state.hatirlatmaLog = state.hatirlatmaLog.slice(0, 100);
      localStorage.setItem("nurdis_hatirlatma_log", JSON.stringify(state.hatirlatmaLog));
      if (r.status === "bekliyor") r.status = "onaylandi";
      persist("nurdis_appointments", state.appointments);
      render();
    }
    return true; // WhatsApp açılsın
  }

  if (A("hatirlat-toplu")) {
    const bugun = new Date(); bugun.setHours(0, 0, 0, 0);
    const yarin = (state.appointments || []).filter(a => {
      if (a.status === "iptal" || !a.phone) return false;
      const d = new Date(a.date + "T00:00:00");
      return Math.round((d - bugun) / 86400000) === 1;
    });
    if (!yarin.length) { alert("Yarın için telefon numarası olan randevu yok."); return true; }
    if (!confirm(yarin.length + " hastaya WhatsApp hatırlatma penceresi açılacak.\n\nDevam?")) return true;
    yarin.forEach((a, i) => setTimeout(() => {
      window.open(waLink(a.phone, randevuMesaj("hatirlatma", a)), "_blank");
    }, i * 600));
    if (!state.hatirlatmaLog) state.hatirlatmaLog = [];
    yarin.forEach(a => state.hatirlatmaLog.unshift({ id: a.id, name: a.name, tarih: new Date().toISOString() }));
    state.hatirlatmaLog = state.hatirlatmaLog.slice(0, 100);
    localStorage.setItem("nurdis_hatirlatma_log", JSON.stringify(state.hatirlatmaLog));
    render();
    return true;
  }

  /* ---- SAAT GRUBU SEÇİMİ ---- */
  if (A("saat-grup")) {
    state.rvSaatGrup = parseInt(el.dataset.h);
    // Dakika seçimini sıfırla (yeni saat grubunda farklı dakikalar var)
    if (state.bookingForm.time) {
      const h = parseInt(state.bookingForm.time.split(":")[0]);
      if (h !== state.rvSaatGrup) state.bookingForm.time = "";
    }
    render();
    return true;
  }

  /* ---- RANDEVU YÖNETİMİ ---- */
  if (A("rv-filtre")) { state.rvFiltre = el.dataset.f; render(); return true; }
  if (A("rv-new")) { state.rvEdit = ""; render(); window.scrollTo(0, 0); return true; }
  if (A("rv-edit")) { state.rvEdit = el.dataset.id; render(); window.scrollTo(0, 0); return true; }
  if (A("rv-cancel")) { state.rvEdit = undefined; render(); return true; }

  if (A("rv-save")) {
    const id = el.dataset.id;
    const rec = {
      id: id || ("rv_" + Date.now()),
      date: document.getElementById("rv-date")?.value || accToday(),
      time: document.getElementById("rv-time")?.value || "09:00",
      name: (document.getElementById("rv-name")?.value || "").trim(),
      phone: (document.getElementById("rv-phone")?.value || "").trim(),
      service: document.getElementById("rv-service")?.value || "Muayene",
      status: document.getElementById("rv-status")?.value || "bekliyor",
      note: (document.getElementById("rv-note")?.value || "").trim()
    };
    if (!rec.name) { alert("Hasta adı gerekli."); return true; }
    if (!rec.phone) { alert("Telefon gerekli."); return true; }

    if (!state.appointments) state.appointments = [];
    if (id) {
      const old = state.appointments.find(x => x.id === id);
      Object.assign(old, rec);
    } else {
      state.appointments.push(rec);
    }
    persist("nurdis_appointments", state.appointments);
    if (window.fb && state.fbReady) {
      try { window.fb.addAppointment(rec).catch(() => {}); } catch (e) {}
    }
    state.rvEdit = undefined;
    alert("✅ Randevu kaydedildi.");
    render();
    return true;
  }

  if (A("rv-delete")) {
    const r = (state.appointments || []).find(x => x.id === el.dataset.id);
    if (!r) return true;
    if (!confirm("\"" + (r.name || "") + "\" randevusu silinsin mi?\n\n" + accTarihTR(r.date) + " " + (r.time || ""))) return true;
    state.appointments = state.appointments.filter(x => x.id !== el.dataset.id);
    persist("nurdis_appointments", state.appointments);
    if (window.fb && state.fbReady) {
      try { window.fb.deleteAppointment?.(el.dataset.id); } catch (e) {}
    }
    render();
    return true;
  }

  if (A("rv-durum")) {
    const r = (state.appointments || []).find(x => x.id === el.dataset.id);
    if (!r) return true;
    r.status = el.dataset.st;
    persist("nurdis_appointments", state.appointments);
    if (r.status === "geldi") anketOlustur(r);
    render();
    return true;
  }

  if (A("rv-arama")) {
    state.rvArama = document.getElementById("rv-arama")?.value || "";
    render();
    return true;
  }

  if (A("rv-csv")) {
    const rows = [["Tarih", "Saat", "Ad Soyad", "Telefon", "Hizmet", "Durum", "Not"]];
    (state.appointments || []).slice().sort((a, b) => new Date(b.date) - new Date(a.date))
      .forEach(r => rows.push([
        r.date || "", r.time || "", r.name || "", r.phone || "",
        r.service || "", (RANDEVU_DURUM[r.status] || RANDEVU_DURUM.bekliyor).ad, r.note || ""
      ]));
    accCsvDownload("randevular-" + accToday() + ".csv", rows);
    return true;
  }

  if (A("konum-kaydet")) {
    state.konumAyar = {
      adres: (document.getElementById("kon-adres")?.value || "").trim(),
      lat: (document.getElementById("kon-lat")?.value || "").trim(),
      lon: (document.getElementById("kon-lon")?.value || "").trim()
    };
    localStorage.setItem("nurdis_konum_ayar", JSON.stringify(state.konumAyar));
    if (typeof saveAccountingToFirebase === "function") saveAccountingToFirebase();
    alert("✅ Konum kaydedildi.\n\n" + konumLinki());
    render();
    return true;
  }

  if (A("slot-dolu")) {
    alert("Bu saat dilimi dolu. Lütfen başka bir saat seçin.");
    return true;
  }

  /* ---- HASTA HATIRLATMA ---- */
  if (A("hh-tab")) { state.hhTab = el.dataset.tab; render(); return true; }
  if (A("hh-sablon-ac")) { state.hhSablonAcik = !state.hhSablonAcik; render(); return true; }
  if (A("hh-sablon-kaydet")) {
    const tip = el.dataset.tip;
    const metin = document.getElementById("hh-sablon")?.value || "";
    if (!state.mesajSablon) state.mesajSablon = {};
    state.mesajSablon[tip] = metin.trim();
    localStorage.setItem("nurdis_mesaj_sablon", JSON.stringify(state.mesajSablon));
    if (typeof saveAccountingToFirebase === "function") saveAccountingToFirebase();
    state.hhSablonAcik = false;
    alert("✅ Mesaj şablonu kaydedildi.\n\nArtık WhatsApp butonları bu metni kullanacak.");
    render();
    return true;
  }
  if (A("hh-sablon-sifirla")) {
    const tip = el.dataset.tip;
    if (!confirm("Mesajı varsayılana döndürmek istiyor musunuz?")) return true;
    if (state.mesajSablon) delete state.mesajSablon[tip];
    localStorage.setItem("nurdis_mesaj_sablon", JSON.stringify(state.mesajSablon || {}));
    if (typeof saveAccountingToFirebase === "function") saveAccountingToFirebase();
    alert("✅ Varsayılan mesaj geri yüklendi.");
    render();
    return true;
  }
  if (A("hh-esik")) {
    state.hhAyar = { ay: parseInt(el.dataset.ay) };
    localStorage.setItem("nurdis_hh_ayar", JSON.stringify(state.hhAyar));
    render();
    return true;
  }
  if (A("hh-kopyala")) {
    const ayEsik = accNum((state.hhAyar || {}).ay) || 6;
    const liste = hastaKontrolListesi(ayEsik);
    const metin = "NUR DİŞ — KONTROL ZAMANI GELEN HASTALAR\n" +
      "Tarih: " + accTarihTR() + "\n" + "-".repeat(40) + "\n" +
      liste.map((h, i) => (i + 1) + ". " + h.ad + " | " + (h.tel || "tel yok") + " | " + Math.floor(h.ayFark) + " ay | Son: " + (h.sonIslemAdi || "-")).join("\n") +
      "\n" + "-".repeat(40) + "\nToplam: " + liste.length + " hasta";
    accCopy(metin);
    return true;
  }
  if (A("hh-yazdir")) {
    const ayEsik = accNum((state.hhAyar || {}).ay) || 6;
    const liste = hastaKontrolListesi(ayEsik);
    let h = '<p style="font-size:12px;margin:0 0 12px;">Kontrol zamanı gelen ' + liste.length + ' hasta (' + ayEsik + ' ay eşiği)</p>';
    h += '<table style="width:100%;border-collapse:collapse;font-size:11px;">';
    h += '<tr style="background:#f0f0f0;"><th style="padding:5px;border:1px solid #ddd;text-align:left;">#</th><th style="padding:5px;border:1px solid #ddd;text-align:left;">Hasta</th><th style="padding:5px;border:1px solid #ddd;">Telefon</th><th style="padding:5px;border:1px solid #ddd;text-align:center;">Geçen</th><th style="padding:5px;border:1px solid #ddd;">Son İşlem</th><th style="padding:5px;border:1px solid #ddd;">Aranacak</th></tr>';
    liste.forEach((x, i) => {
      h += '<tr><td style="padding:4px;border:1px solid #ddd;">' + (i + 1) + '</td>';
      h += '<td style="padding:4px;border:1px solid #ddd;">' + escapeHtml(x.ad) + '</td>';
      h += '<td style="padding:4px;border:1px solid #ddd;">' + escapeHtml(x.tel || "-") + '</td>';
      h += '<td style="padding:4px;border:1px solid #ddd;text-align:center;">' + Math.floor(x.ayFark) + ' ay</td>';
      h += '<td style="padding:4px;border:1px solid #ddd;">' + escapeHtml(x.sonIslemAdi || "-") + '</td>';
      h += '<td style="padding:4px;border:1px solid #ddd;">☐</td></tr>';
    });
    h += '</table>';
    accPrint("Hasta Kontrol Listesi", h);
    return true;
  }

  /* ---- PRİM / BONUS ---- */
  if (A("prim-tip")) {
    const tip = el.dataset.tip;
    state.bonusAyar = Object.assign({}, bonusAyarlar(), { tip });
    localStorage.setItem("nurdis_bonus_ayar", JSON.stringify(state.bonusAyar));
    if (typeof saveAccountingToFirebase === "function") saveAccountingToFirebase();
    render();
    return true;
  }
  if (A("prim-kaydet")) {
    const ayar = bonusAyarlar();
    const oran = accNum(document.getElementById("pb-oran")?.value);
    const esik = accNum(document.getElementById("pb-esik")?.value);
    const hedef = accNum(document.getElementById("pb-hedef")?.value);
    const sabit = accNum(document.getElementById("pb-sabit")?.value);
    if (oran > 0) ayar.oran = oran;
    if (esik > 0) ayar.esik = esik;
    if (hedef > 0) ayar.hedef = hedef;
    if (sabit > 0) ayar.sabit = sabit;
    state.bonusAyar = ayar;
    localStorage.setItem("nurdis_bonus_ayar", JSON.stringify(ayar));
    if (typeof saveAccountingToFirebase === "function") saveAccountingToFirebase();
    const toplam = (state.personnel || []).filter(p => p.aktif !== false).map(primHesapla).reduce((s, x) => s + x.prim, 0);
    alert("✅ Prim ayarları kaydedildi.\n\nBu ay toplam prim: " + accTL(toplam));
    render();
    return true;
  }
  if (A("prim-yazdir")) {
    const hesaplar = (state.personnel || []).filter(p => p.aktif !== false).map(primHesapla);
    let h = '<p style="font-size:12px;margin:0 0 12px;">Dönem: ' + accAyAdi(new Date().getFullYear(), new Date().getMonth() + 1) + '</p>';
    h += '<table style="width:100%;border-collapse:collapse;font-size:11px;">';
    h += '<tr style="background:#f0f0f0;"><th style="padding:5px;border:1px solid #ddd;text-align:left;">Personel</th><th style="padding:5px;border:1px solid #ddd;">Görev</th><th style="padding:5px;border:1px solid #ddd;text-align:right;">Ciro</th><th style="padding:5px;border:1px solid #ddd;text-align:right;">Maaş</th><th style="padding:5px;border:1px solid #ddd;text-align:right;">Prim</th><th style="padding:5px;border:1px solid #ddd;text-align:right;">Toplam</th><th style="padding:5px;border:1px solid #ddd;">İmza</th></tr>';
    let tc = 0, tm = 0, tp = 0;
    hesaplar.forEach(x => {
      tc += x.ciro; tm += x.maliyet; tp += x.prim;
      h += '<tr><td style="padding:4px;border:1px solid #ddd;">' + escapeHtml(x.ad) + '</td>';
      h += '<td style="padding:4px;border:1px solid #ddd;">' + escapeHtml(x.gorev) + '</td>';
      h += '<td style="padding:4px;border:1px solid #ddd;text-align:right;">' + accTL0(x.ciro) + '</td>';
      h += '<td style="padding:4px;border:1px solid #ddd;text-align:right;">' + accTL0(x.maliyet) + '</td>';
      h += '<td style="padding:4px;border:1px solid #ddd;text-align:right;font-weight:bold;">' + accTL0(x.prim) + '</td>';
      h += '<td style="padding:4px;border:1px solid #ddd;text-align:right;">' + accTL0(x.toplamMaliyet) + '</td>';
      h += '<td style="padding:4px;border:1px solid #ddd;"></td></tr>';
    });
    h += '<tr style="background:#f3e5f5;font-weight:bold;"><td colspan="2" style="padding:5px;border:1px solid #ddd;">TOPLAM</td>';
    h += '<td style="padding:5px;border:1px solid #ddd;text-align:right;">' + accTL0(tc) + '</td>';
    h += '<td style="padding:5px;border:1px solid #ddd;text-align:right;">' + accTL0(tm) + '</td>';
    h += '<td style="padding:5px;border:1px solid #ddd;text-align:right;">' + accTL0(tp) + '</td>';
    h += '<td style="padding:5px;border:1px solid #ddd;text-align:right;">' + accTL0(tm + tp) + '</td><td style="border:1px solid #ddd;"></td></tr>';
    h += '</table>';
    accPrint("Personel Prim Bordrosu", h);
    return true;
  }
  if (A("prim-csv")) {
    const hesaplar = (state.personnel || []).filter(p => p.aktif !== false).map(primHesapla);
    const rows = [["Personel", "Görev", "Aylık Ciro", "Maaş (işveren maliyeti)", "Prim", "Toplam Maliyet", "Prim Açıklaması"]];
    hesaplar.forEach(x => rows.push([
      x.ad, x.gorev, x.ciro.toFixed(2), x.maliyet.toFixed(2),
      x.prim.toFixed(2), x.toplamMaliyet.toFixed(2), x.aciklama
    ]));
    accCsvDownload("prim-bordrosu-" + accKey() + ".csv", rows);
    return true;
  }

  /* ---- RANDEVU & CİRO ---- */
  if (A("randevu-donem")) { state.randevuDonem = parseInt(el.dataset.gun); render(); return true; }
  if (A("verim-donem")) { state.verimDonem = parseInt(el.dataset.gun); render(); return true; }

  /* ---- KAMPANYA ---- */
  if (A("kp-new")) { state.kampanyaEdit = ""; render(); window.scrollTo(0, 0); return true; }
  if (A("kp-edit")) { state.kampanyaEdit = el.dataset.id; render(); window.scrollTo(0, 0); return true; }
  if (A("kp-cancel")) { state.kampanyaEdit = undefined; render(); return true; }
  if (A("kp-save")) {
    const id = el.dataset.id;
    const rec = {
      id: id || ("kmp_" + Date.now()),
      ad: (document.getElementById("kp-ad")?.value || "").trim(),
      tedavi: document.getElementById("kp-tedavi")?.value || "Dolgu",
      indirim: accNum(document.getElementById("kp-indirim")?.value),
      baslangic: document.getElementById("kp-bas")?.value || accToday(),
      bitis: document.getElementById("kp-bit")?.value || accToday(),
      kullanim: accNum(document.getElementById("kp-kullanim")?.value)
    };
    if (!rec.ad) { alert("Kampanya adı gerekli."); return true; }
    if (rec.indirim <= 0 || rec.indirim >= 90) { alert("İndirim %1 ile %89 arasında olmalı."); return true; }
    if (!state.kampanyalar) state.kampanyalar = [];
    if (id) {
      const old = state.kampanyalar.find(x => x.id === id);
      Object.assign(old, rec);
    } else {
      state.kampanyalar.push(rec);
    }
    localStorage.setItem("nurdis_kampanyalar", JSON.stringify(state.kampanyalar));
    if (typeof saveAccountingToFirebase === "function") saveAccountingToFirebase();
    state.kampanyaEdit = undefined;
    const e = kampanyaEtki(rec);
    alert("✅ Kampanya kaydedildi.\n\n" + rec.tedavi + " · %" + rec.indirim + " indirim\n" +
      accTL0(e.fiyat) + " → " + accTL0(e.indirimli) + "\n" +
      "Kâr: " + accTL0(e.karNormal) + " → " + accTL0(e.karIndirimli) + "\n" +
      (e.ekHasta !== null ? "Aynı kâr için " + e.ekHasta + " ek hasta gerekir." : ""));
    render();
    return true;
  }
  if (A("kp-delete")) {
    if (!confirm("Bu kampanya silinsin mi?")) return true;
    state.kampanyalar = (state.kampanyalar || []).filter(x => x.id !== el.dataset.id);
    localStorage.setItem("nurdis_kampanyalar", JSON.stringify(state.kampanyalar));
    if (typeof saveAccountingToFirebase === "function") saveAccountingToFirebase();
    render();
    return true;
  }

  /* ---- BAYAT STOK ---- */
  if (A("bayat-esik")) {
    state.bayatAyar = { gun: parseInt(el.dataset.gun) };
    localStorage.setItem("nurdis_bayat_ayar", JSON.stringify(state.bayatAyar));
    render();
    return true;
  }
  if (A("bayat-sil")) {
    const s = stokBul(el.dataset.id);
    if (!s) return true;
    const miktar = accNum(s.miktar);
    if (miktar <= 0) { alert("Stokta malzeme yok."); return true; }
    if (!confirm("\"" + s.ad + "\" zayiat olarak düşülsün mü?\n\n" + miktar + " " + s.birim + " · Değer: " + accTL(stokDeger(s)) + "\n\nBu işlem stoktan düşer.")) return true;
    stokHareketEkle(s.id, "cikis", miktar, "Zayiat / bozulma", s.birimFiyat);
    stokKaydet();
    alert("✅ Zayiat kaydedildi. Stok: " + accNum(s.miktar) + " " + s.birim);
    render();
    return true;
  }

  /* ---- MALZEME MALİYETİ ---- */
  if (A("mm-tedavi")) { state.mmTedavi = el.dataset.tedavi; render(); return true; }
  if (A("mm-ekle")) {
    const tedavi = el.dataset.tedavi;
    const stokId = document.getElementById("mm-stok")?.value;
    const miktar = accNum(document.getElementById("mm-miktar")?.value);
    if (!stokId) { alert("Malzeme seçin."); return true; }
    if (miktar <= 0) { alert("Geçerli bir miktar girin."); return true; }
    if (!state.tedaviMalzeme) state.tedaviMalzeme = {};
    if (!state.tedaviMalzeme[tedavi]) state.tedaviMalzeme[tedavi] = [];
    state.tedaviMalzeme[tedavi].push({ stokId, miktar });
    localStorage.setItem("nurdis_tedavi_malzeme", JSON.stringify(state.tedaviMalzeme));
    if (typeof saveAccountingToFirebase === "function") saveAccountingToFirebase();
    const tk = tedaviKar(tedavi);
    alert("✅ " + tedavi + " için malzeme eklendi.\n\nYeni malzeme maliyeti: " + accTL(tk.maliyet) + "\nKalan kâr: " + accTL(tk.kar) + " (%" + tk.marj.toFixed(0) + " marj)");
    render();
    return true;
  }
  if (A("mm-sil")) {
    const tedavi = el.dataset.tedavi;
    const i = parseInt(el.dataset.i);
    if (!confirm("Bu malzemeyi tedaviden çıkarmak istiyor musunuz?")) return true;
    const arr = (state.tedaviMalzeme || {})[tedavi];
    if (arr) arr.splice(i, 1);
    localStorage.setItem("nurdis_tedavi_malzeme", JSON.stringify(state.tedaviMalzeme));
    if (typeof saveAccountingToFirebase === "function") saveAccountingToFirebase();
    render();
    return true;
  }

  /* ---- HASTA KÂRLILIK ---- */
  if (A("hk-sirala")) { state.hkSirala = el.dataset.v; render(); return true; }
  if (A("hk-detay")) { state.hkDetay = el.dataset.ad; render(); window.scrollTo(0, 0); return true; }
  if (A("hk-kapat")) { state.hkDetay = null; render(); window.scrollTo(0, 0); return true; }

  /* ---- NAKİT AKIŞ ---- */
  if (A("nakit-ay")) { state.nakitAy = parseInt(el.dataset.ay); render(); return true; }

  /* ---- STOK ---- */
  if (A("stok-new")) { state.stokEdit = ""; render(); window.scrollTo(0, 0); return true; }
  if (A("stok-edit")) { state.stokEdit = el.dataset.id; render(); window.scrollTo(0, 0); return true; }
  if (A("stok-cancel")) { state.stokEdit = undefined; render(); return true; }
  if (A("stok-save")) {
    const id = el.dataset.id;
    const rec = {
      id: id || ("stk_" + Date.now()),
      ad: (document.getElementById("st-ad")?.value || "").trim(),
      kategori: document.getElementById("st-kategori")?.value || "Sarf Malzeme",
      birim: document.getElementById("st-birim")?.value || "Adet",
      miktar: accNum(document.getElementById("st-miktar")?.value),
      minSeviye: accNum(document.getElementById("st-min")?.value),
      birimFiyat: accNum(document.getElementById("st-fiyat")?.value),
      tedarikci: (document.getElementById("st-tedarikci")?.value || "").trim(),
      notlar: (document.getElementById("st-not")?.value || "").trim()
    };
    if (!rec.ad) { alert("Malzeme adı gerekli."); return true; }
    if (!state.stok) state.stok = [];
    if (id) {
      const old = state.stok.find(x => x.id === id);
      const eskiMiktar = accNum(old.miktar);
      Object.assign(old, rec);
      if (Math.abs(rec.miktar - eskiMiktar) > 0.001) {
        if (!state.stokHareket) state.stokHareket = [];
        state.stokHareket.unshift({
          id: "sth_" + Date.now(), stokId: id, tip: "sayim",
          miktar: rec.miktar, birimFiyat: rec.birimFiyat, tarih: accToday(),
          aciklama: "Manuel düzeltme (" + eskiMiktar + " → " + rec.miktar + ")", kalan: rec.miktar
        });
      }
    } else {
      state.stok.push(rec);
      if (rec.miktar > 0) stokHareketEkle(rec.id, "giris", rec.miktar, "İlk kayıt", rec.birimFiyat);
    }
    stokKaydet();
    state.stokEdit = undefined;
    alert("✅ Malzeme kaydedildi.");
    render();
    return true;
  }
  if (A("stok-delete")) {
    const id = el.dataset.id;
    const s = stokBul(id);
    if (!s) return true;
    if (!confirm("\"" + s.ad + "\" silinsin mi?\n\nStok hareketleri de silinir.")) return true;
    state.stok = (state.stok || []).filter(x => x.id !== id);
    state.stokHareket = (state.stokHareket || []).filter(h => h.stokId !== id);
    stokKaydet();
    render();
    return true;
  }
  if (A("stok-giris") || A("stok-cikis")) {
    const s = stokBul(el.dataset.id);
    if (!s) return true;
    const giris = A("stok-giris");
    const soru = giris
      ? "📦 " + s.ad + "\n\nKaç " + s.birim + " geldi?\n(Mevcut: " + accNum(s.miktar) + " " + s.birim + ")"
      : "➖ " + s.ad + "\n\nKaç " + s.birim + " kullanıldı?\n(Mevcut: " + accNum(s.miktar) + " " + s.birim + ")";
    const cevap = prompt(soru, "1");
    if (cevap === null) return true;
    const miktar = accNum(cevap);
    if (miktar <= 0) { alert("Geçerli bir miktar girin."); return true; }
    if (!giris && miktar > accNum(s.miktar)) {
      alert("Stokta yeterli malzeme yok.\nMevcut: " + accNum(s.miktar) + " " + s.birim);
      return true;
    }
    const neden = prompt(giris ? "Nereden geldi? (tedarikçi / not)" : "Nerede kullanıldı? (tedavi / not)", giris ? (s.tedarikci || "Alım") : "Tedavi");
    stokHareketEkle(s.id, giris ? "giris" : "cikis", miktar, neden || (giris ? "Stok girişi" : "Kullanım"), s.birimFiyat);
    stokKaydet();
    alert("✅ " + (giris ? "Giriş" : "Çıkış") + " kaydedildi.\nYeni stok: " + accNum(s.miktar) + " " + s.birim);
    render();
    return true;
  }
  if (A("stok-csv")) {
    const rows = [["Malzeme", "Kategori", "Birim", "Miktar", "Kritik Seviye", "Birim Fiyat", "Toplam Değer", "Tedarikçi", "Not"]];
    (state.stok || []).forEach(s => rows.push([
      s.ad, s.kategori || "", s.birim || "", accNum(s.miktar), accNum(s.minSeviye),
      accNum(s.birimFiyat).toFixed(2), stokDeger(s).toFixed(2), s.tedarikci || "", s.notlar || ""
    ]));
    accCsvDownload("stok-" + accToday() + ".csv", rows);
    return true;
  }
  if (A("stok-yazdir")) {
    const liste = state.stok || [];
    let h = '<p style="font-size:12px;margin:0 0 12px;">Toplam ' + liste.length + ' kalem · Stok değeri: <b>' + accTL(stokToplamDeger()) + '</b></p>';
    h += '<table style="width:100%;border-collapse:collapse;font-size:11px;">';
    h += '<tr style="background:#f0f0f0;"><th style="padding:5px;border:1px solid #ddd;text-align:left;">Malzeme</th><th style="padding:5px;border:1px solid #ddd;">Kategori</th><th style="padding:5px;border:1px solid #ddd;text-align:right;">Miktar</th><th style="padding:5px;border:1px solid #ddd;text-align:right;">Kritik</th><th style="padding:5px;border:1px solid #ddd;text-align:right;">Değer</th></tr>';
    liste.sort((a, b) => (a.ad || "").localeCompare(b.ad || "", "tr")).forEach(s => {
      const krit = accNum(s.minSeviye) > 0 && accNum(s.miktar) <= accNum(s.minSeviye);
      h += '<tr' + (krit ? ' style="background:#FFF3E0;"' : '') + '>';
      h += '<td style="padding:4px;border:1px solid #ddd;">' + escapeHtml(s.ad) + (krit ? ' ⚠️' : '') + '</td>';
      h += '<td style="padding:4px;border:1px solid #ddd;">' + escapeHtml(s.kategori || "") + '</td>';
      h += '<td style="padding:4px;border:1px solid #ddd;text-align:right;">' + accNum(s.miktar).toLocaleString("tr-TR") + ' ' + escapeHtml(s.birim || "") + '</td>';
      h += '<td style="padding:4px;border:1px solid #ddd;text-align:right;">' + accNum(s.minSeviye) + '</td>';
      h += '<td style="padding:4px;border:1px solid #ddd;text-align:right;">' + accTL(stokDeger(s)) + '</td>';
      h += '</tr>';
    });
    h += '</table>';
    accPrint("Stok Listesi", h);
    return true;
  }

  /* ---- BORDRO ---- */
  if (A("bordro-yil")) { state.bordroYil = parseInt(el.dataset.yil); render(); return true; }
  if (A("bordro-ay")) { state.bordroAy = parseInt(el.dataset.ay); render(); return true; }
  if (A("bordro-tek")) {
    const p = (state.personnel || []).find(x => x.id === el.dataset.id);
    if (!p) return true;
    const yil = state.bordroYil || new Date().getFullYear();
    const ay = state.bordroAy || (new Date().getMonth() + 1);
    accPrint("Maaş Pusulası — " + p.name, accBordroHTML(accBordro(p, yil, ay)));
    return true;
  }
  if (A("bordro-hepsi")) {
    const yil = state.bordroYil || new Date().getFullYear();
    const ay = state.bordroAy || (new Date().getMonth() + 1);
    const liste = accBordroTumu(yil, ay);
    if (!liste.length) { alert("Bu dönem için personel yok."); return true; }
    accPrint("Bordro — " + accAyAdi(yil, ay), liste.map(accBordroHTML).join(""));
    return true;
  }
  if (A("bordro-csv")) {
    const yil = state.bordroYil || new Date().getFullYear();
    const ay = state.bordroAy || (new Date().getMonth() + 1);
    const liste = accBordroTumu(yil, ay);
    const rows = [["Ad Soyad", "TC", "Görev", "Gün", "Brüt", "SGK İşçi", "İşsizlik", "Gelir V.", "Damga", "Net", "İşveren SGK", "Maliyet"]];
    liste.forEach(b => rows.push([
      b.personel.name, b.personel.tcNo || "", b.personel.position || "", b.gun,
      b.brutUcret.toFixed(2), b.isciSgk.toFixed(2), b.isciIssiz.toFixed(2),
      b.gelirVergisi.toFixed(2), b.damga.toFixed(2), b.netUcret.toFixed(2),
      (b.isverenSgk + b.isverenIssiz).toFixed(2), b.isvereneMaliyet.toFixed(2)
    ]));
    accCsvDownload("bordro-" + yil + "-" + String(ay).padStart(2, "0") + ".csv", rows);
    return true;
  }

  /* ---- e-FATURA ---- */
  if (A("firma-save")) {
    state.firmaBilgi = {
      unvan: document.getElementById("fb-unvan")?.value?.trim() || "NUR DİŞ & DENTAL KLİNİK",
      vergiNo: document.getElementById("fb-vergi")?.value?.trim() || "",
      vergiDaire: document.getElementById("fb-vergiDaire")?.value?.trim() || "",
      telefon: document.getElementById("fb-telefon")?.value?.trim() || "",
      il: document.getElementById("fb-il")?.value?.trim() || "Mardin",
      ilce: document.getElementById("fb-ilce")?.value?.trim() || "Kızıltepe"
    };
    localStorage.setItem("nurdis_firma_bilgi", JSON.stringify(state.firmaBilgi));
    if (typeof saveAccountingToFirebase === "function") saveAccountingToFirebase();
    alert("✅ Firma bilgileri kaydedildi.");
    render();
    return true;
  }
  if (A("efatura-indir")) {
    const x = (state.accounting.incomes || []).find(r => r.id === el.dataset.id);
    if (!x) return true;
    const xml = accUblTR(x);
    const blob = new Blob([xml], { type: "application/xml;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "fatura-" + (x.invoiceNo || x.id) + ".xml";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    return true;
  }
  if (A("efatura-hepsi")) {
    const inc = state.accounting.incomes || [];
    if (!inc.length) { alert("Fatura kaydı yok."); return true; }
    if (!confirm(inc.length + " fatura XML olarak indirilecek. Devam?")) return true;
    inc.forEach((x, i) => setTimeout(() => {
      const blob = new Blob([accUblTR(x)], { type: "application/xml;charset=utf-8" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "fatura-" + (x.invoiceNo || x.id) + ".xml";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    }, i * 350));
    return true;
  }

  /* ---- BANKA MUTABAKATI ---- */
  if (A("mutabakat-yukle")) {
    const f = document.getElementById("mutabakat-file")?.files?.[0];
    if (!f) { alert("Önce bir dosya seçin."); return true; }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const r = accMutabakat(e.target.result);
        if (!r.banka.length) { alert("Dosyada tarih + tutar içeren satır bulunamadı.\n\nÖrnek format:\n01.10.2026;POS TAHSİLAT;5000,00"); return; }
        state.mutabakatSonuc = r;
        render();
      } catch (err) {
        alert("Dosya okunamadı: " + (err && err.message ? err.message : ""));
      }
    };
    reader.readAsText(f, "UTF-8");
    return true;
  }

  /* ---- YEVMİYE ---- */
  if (A("yevmiye-yil")) { state.yevmiyeYil = parseInt(el.dataset.yil); render(); return true; }
  if (A("yevmiye-ay")) { state.yevmiyeAy = parseInt(el.dataset.ay); render(); return true; }
  if (A("yevmiye-yazdir")) {
    const yil = state.yevmiyeYil || new Date().getFullYear();
    const ay = state.yevmiyeAy || null;
    const fisler = accYevmiyeListesi(yil, ay);
    let h = '<table style="width:100%;border-collapse:collapse;font-size:10px;">';
    h += '<tr style="background:#f0f0f0;"><th style="padding:4px;border:1px solid #ddd;">Tarih</th><th style="padding:4px;border:1px solid #ddd;">Fiş</th><th style="padding:4px;border:1px solid #ddd;">Hesap</th><th style="padding:4px;border:1px solid #ddd;text-align:right;">Borç</th><th style="padding:4px;border:1px solid #ddd;text-align:right;">Alacak</th></tr>';
    fisler.forEach(f => {
      f.satirlar.filter(s => s.borc > 0 || s.alacak > 0).forEach((s, i) => {
        const hp = HESAP_PLANI[s.hesap] || { kod: "?", ad: s.hesap };
        h += '<tr>';
        if (i === 0) h += '<td style="padding:3px;border:1px solid #ddd;" rowspan="' + f.satirlar.length + '">' + accTarihTR(f.tarih) + '</td><td style="padding:3px;border:1px solid #ddd;" rowspan="' + f.satirlar.length + '">' + f.fisNo + '</td>';
        h += '<td style="padding:3px;border:1px solid #ddd;">' + hp.kod + ' ' + escapeHtml(hp.ad) + '</td>';
        h += '<td style="padding:3px;border:1px solid #ddd;text-align:right;">' + (s.borc > 0 ? accTL(s.borc) : "") + '</td>';
        h += '<td style="padding:3px;border:1px solid #ddd;text-align:right;">' + (s.alacak > 0 ? accTL(s.alacak) : "") + '</td>';
        h += '</tr>';
      });
    });
    h += '</table>';
    accPrint("Yevmiye Defteri — " + yil + (ay ? " / " + ay : ""), h);
    return true;
  }
  if (A("yevmiye-csv")) {
    const yil = state.yevmiyeYil || new Date().getFullYear();
    const ay = state.yevmiyeAy || null;
    const fisler = accYevmiyeListesi(yil, ay);
    const rows = [["Tarih", "Fiş No", "Tip", "Açıklama", "Hesap Kodu", "Hesap Adı", "Borç", "Alacak"]];
    fisler.forEach(f => f.satirlar.forEach(s => {
      const hp = HESAP_PLANI[s.hesap] || { kod: "", ad: s.hesap };
      rows.push([f.tarih, f.fisNo, f.tip, f.aciklama || "", hp.kod, hp.ad, s.borc.toFixed(2), s.alacak.toFixed(2)]);
    }));
    accCsvDownload("yevmiye-" + yil + (ay ? "-" + ay : "") + ".csv", rows);
    return true;
  }

  /* ---- MİZAN ---- */
  if (A("mizan-yil")) { state.mizanYil = parseInt(el.dataset.yil); render(); return true; }
  if (A("mizan-yazdir")) {
    const yil = state.mizanYil || new Date().getFullYear();
    const m = accMizan(yil);
    let h = '<table style="width:100%;border-collapse:collapse;font-size:11px;">';
    h += '<tr style="background:#f0f0f0;"><th style="padding:5px;border:1px solid #ddd;text-align:left;">Kod</th><th style="padding:5px;border:1px solid #ddd;text-align:left;">Hesap</th><th style="padding:5px;border:1px solid #ddd;text-align:right;">Borç</th><th style="padding:5px;border:1px solid #ddd;text-align:right;">Alacak</th><th style="padding:5px;border:1px solid #ddd;text-align:right;">Bakiye</th></tr>';
    m.forEach(x => {
      h += '<tr><td style="padding:4px;border:1px solid #ddd;">' + x.kod + '</td><td style="padding:4px;border:1px solid #ddd;">' + escapeHtml(x.ad) + '</td><td style="padding:4px;border:1px solid #ddd;text-align:right;">' + (x.borc > 0 ? accTL(x.borc) : "") + '</td><td style="padding:4px;border:1px solid #ddd;text-align:right;">' + (x.alacak > 0 ? accTL(x.alacak) : "") + '</td><td style="padding:4px;border:1px solid #ddd;text-align:right;">' + accTL(Math.abs(x.bakiye)) + '</td></tr>';
    });
    const tb = m.reduce((s, x) => s + x.borc, 0), ta = m.reduce((s, x) => s + x.alacak, 0);
    h += '<tr style="background:#fff3e0;font-weight:bold;"><td colspan="2" style="padding:5px;border:1px solid #ddd;">TOPLAM</td><td style="padding:5px;border:1px solid #ddd;text-align:right;">' + accTL(tb) + '</td><td style="padding:5px;border:1px solid #ddd;text-align:right;">' + accTL(ta) + '</td><td></td></tr>';
    h += '</table>';
    accPrint("Mizan — " + yil, h);
    return true;
  }
  if (A("mizan-csv")) {
    const yil = state.mizanYil || new Date().getFullYear();
    const m = accMizan(yil);
    const rows = [["Kod", "Hesap", "Borç", "Alacak", "Bakiye"]];
    m.forEach(x => rows.push([x.kod, x.ad, x.borc.toFixed(2), x.alacak.toFixed(2), x.bakiye.toFixed(2)]));
    accCsvDownload("mizan-" + yil + ".csv", rows);
    return true;
  }

  /* ---- TABLOLAR / YILLIK RAPOR ---- */
  if (A("tablo-yil")) { state.tabloYil = parseInt(el.dataset.yil); render(); return true; }
  if (A("tablolar-yazdir")) {
    const yil = state.tabloYil || new Date().getFullYear();
    accPrint("Gelir Tablosu ve Bilanço — " + yil, accYillikRaporHTML(yil));
    return true;
  }
  if (A("yillik-rapor")) {
    const yil = state.tabloYil || new Date().getFullYear();
    accPrint(yil + " Yılı Mali Faaliyet Raporu", accYillikRaporHTML(yil));
    return true;
  }

  /* ---- TAKVİM FİLTRESİ ---- */
  if (A("takvim-eski")) {
    state.accTakvimEski = !state.accTakvimEski;
    render();
    return true;
  }

  /* ---- BEYANNAME TAMAMLANDI ---- */
  if (A("beyan-tamamla")) {
    if (!state.accTamamlanan) state.accTamamlanan = {};
    state.accTamamlanan[el.dataset.id] = { tarih: accToday(), ts: Date.now() };
    localStorage.setItem("nurdis_beyan_tamam", JSON.stringify(state.accTamamlanan));
    if (typeof saveAccountingToFirebase === "function") saveAccountingToFirebase();
    render();
    return true;
  }
  if (A("beyan-geri-al")) {
    if (state.accTamamlanan) delete state.accTamamlanan[el.dataset.id];
    localStorage.setItem("nurdis_beyan_tamam", JSON.stringify(state.accTamamlanan || {}));
    if (typeof saveAccountingToFirebase === "function") saveAccountingToFirebase();
    render();
    return true;
  }

  /* ---- KDV / GV SEKMELERİ ---- */
  if (A("kdv-ay")) { state.kdvAy = parseInt(el.dataset.ay); render(); return true; }
  if (A("kdv-yil")) { state.kdvYil = parseInt(el.dataset.yil); render(); return true; }
  if (A("gv-donem")) { state.gvDonem = parseInt(el.dataset.donem); render(); return true; }

  /* ---- DEMİRBAŞ ---- */
  if (A("demirbas-new")) { state.demirbasEdit = ""; render(); window.scrollTo(0, 0); return true; }
  if (A("demirbas-edit")) { state.demirbasEdit = el.dataset.id; render(); window.scrollTo(0, 0); return true; }
  if (A("demirbas-cancel")) { state.demirbasEdit = undefined; render(); return true; }
  if (A("demirbas-save")) {
    const id = el.dataset.id;
    const katVal = document.getElementById("db-kategori")?.value || "Diğer|5";
    const [kat, katOmur] = katVal.split("|");
    const rec = {
      id: id || ("dmb_" + Date.now()),
      ad: (document.getElementById("db-ad")?.value || "").trim(),
      kategori: kat,
      maliyet: accNum(document.getElementById("db-maliyet")?.value),
      alisTarihi: document.getElementById("db-tarih")?.value || accToday(),
      omur: accNum(document.getElementById("db-omur")?.value) || accNum(katOmur) || 5
    };
    if (!rec.ad) { alert("Demirbaş adı gerekli."); return true; }
    if (!(rec.maliyet > 0)) { alert("Alış bedeli giriniz."); return true; }
    if (!state.demirbaslar) state.demirbaslar = [];
    if (id) {
      const old = state.demirbaslar.find(d => d.id === id);
      Object.assign(old, rec);
    } else {
      state.demirbaslar.push(rec);
    }
    localStorage.setItem("nurdis_demirbaslar", JSON.stringify(state.demirbaslar));
    if (typeof saveAccountingToFirebase === "function") saveAccountingToFirebase();
    state.demirbasEdit = undefined;
    alert("✅ Demirbaş kaydedildi.\nYıllık amortisman: " + accTL(accAmortYilTutar(rec, new Date().getFullYear())));
    render();
    return true;
  }
  if (A("demirbas-delete")) {
    if (!confirm("Bu demirbaşı silmek istediğinize emin misiniz?")) return true;
    state.demirbaslar = (state.demirbaslar || []).filter(d => d.id !== el.dataset.id);
    localStorage.setItem("nurdis_demirbaslar", JSON.stringify(state.demirbaslar));
    if (typeof saveAccountingToFirebase === "function") saveAccountingToFirebase();
    render();
    return true;
  }

  /* ---- CARİ HESAP: tahsilat ---- */
  if (A("cari-ode")) {
    const id = el.dataset.id;
    const rec = (state.accounting.incomes || []).find(x => x.id === id);
    if (!rec) return true;
    if (!confirm("Bu alacağı tahsil edildi olarak işaretlemek istiyor musunuz?\n\n" + (rec.description || "") + " — " + accTL(rec.amount))) return true;
    rec.paid = true;
    rec.paidDate = accToday();
    localStorage.setItem("nurdis_accounting", JSON.stringify(state.accounting));
    if (typeof saveAccountingToFirebase === "function") saveAccountingToFirebase();
    alert("✅ Tahsilat kaydedildi: " + accTL(rec.amount));
    render();
    return true;
  }

  /* ---- kopyala / yazdır ---- */
  if (A("acc-copy-sgk")) { accCopy(accSgkOzetMetni()); return true; }
  if (A("acc-copy-vergi")) { accCopy(accVergiOzetMetni()); return true; }
  if (A("acc-print-sgk")) {
    accPrint("SGK Aylık Prim ve Hizmet Özeti", "<pre>" + escapeHtml(accSgkOzetMetni()) + "</pre>");
    return true;
  }
  if (A("acc-print-vergi")) {
    accPrint("Beyanname Ön Özeti", "<pre>" + escapeHtml(accVergiOzetMetni()) + "</pre>");
    return true;
  }

  /* ---- dışa aktarım ---- */
  if (A("acc-export-csv")) {
    const inc = accInRange(state.accounting.incomes);
    const exp = accInRange(state.accounting.expenses);
    const rows = [["Tür", "Tarih", "Açıklama", "Kategori", "Firma", "Fatura No", "Tutar", "KDV", "Stopaj", "Ödeme"]];
    inc.forEach(i => rows.push(["Gelir", i.date || "", i.description || "", i.category || "", i.firm || "", i.invoiceNo || "", accNum(i.amount), accNum(i.kdv), accNum(i.stopaj), i.paymentMethod || ""]));
    exp.forEach(e => rows.push(["Gider", e.date || "", e.description || "", e.category || "", e.firm || "", e.invoiceNo || "", accNum(e.amount), accNum(e.kdv), 0, ""]));
    accCsvDownload("nur-dis-muhasebe-" + accRangeLabel(state.accRange).replace(/[^a-z0-9]/gi, "-").toLowerCase() + ".csv", rows);
    return true;
  }
  if (A("acc-print-rapor")) {
    const inc = accInRange(state.accounting.incomes);
    const exp = accInRange(state.accounting.expenses);
    const gelir = accSum(inc, "amount"), gider = accSum(exp, "amount");
    let h = `<p><b>Dönem:</b> ${escapeHtml(accRangeLabel(state.accRange))}</p>`;
    h += `<table><tr><th>Özet</th><th class="r">Tutar</th></tr>
      <tr><td>Toplam Gelir</td><td class="r">${accTL(gelir)}</td></tr>
      <tr><td>Toplam Gider</td><td class="r">${accTL(gider)}</td></tr>
      <tr><td><b>Net</b></td><td class="r"><b>${accTL(gelir - gider)}</b></td></tr></table>`;
    h += `<h3 style="font-size:14px;margin-top:18px;">Gelirler</h3><table><tr><th>Tarih</th><th>Açıklama</th><th>Kategori</th><th class="r">Tutar</th></tr>`;
    inc.forEach(i => h += `<tr><td>${escapeHtml(i.date || "")}</td><td>${escapeHtml(i.description || "")}</td><td>${escapeHtml(i.category || "")}</td><td class="r">${accTL(i.amount)}</td></tr>`);
    h += `</table><h3 style="font-size:14px;margin-top:18px;">Giderler</h3><table><tr><th>Tarih</th><th>Açıklama</th><th>Kategori</th><th class="r">Tutar</th></tr>`;
    exp.forEach(e => h += `<tr><td>${escapeHtml(e.date || "")}</td><td>${escapeHtml(e.description || "")}</td><td>${escapeHtml(e.category || "")}</td><td class="r">${accTL(e.amount)}</td></tr>`);
    h += `</table>`;
    accPrint("Muhasebe Raporu", h);
    return true;
  }

  return false;
}

function renderAdminPanel() {
  const tabs = [
    { id: "appointments", label: "📅 Randevular", count: state.appointments.length },
    { id: "orders", label: "📦 Siparişler", count: state.orders.length },
    { id: "products", label: "🛍️ Ürünler", count: 0 },
    { id: "videos", label: "🎥 Videolar", count: 0 },
    { id: "social", label: "📱 Sosyal Medya", count: 0 },
    { id: "reviews", label: "⭐ Yorumlar", count: state.reviews.length },
    { id: "treatments", label: "🦷 Tedaviler", count: state.treatments.length },
    { id: "tips", label: "💡 İpuçları", count: state.healthTips.length },
    { id: "announcements", label: "📢 Duyurular", count: state.announcements.length },
    { id: "portal", label: "🏥 Hasta Portalı", count: (state.patientNotes || []).filter(n => !n.doktorYanit).length + (state.patientFiles || []).filter(f => !f.doktorGordu).length },
    { id: "accounting", label: "💰 Muhasebe", count: 0 }
  ];

  const tabButtons = tabs.map(t => `
    <button class="admin-tab ${state.adminTab === t.id ? 'active' : ''}" data-action="admin-tab" data-tab="${t.id}">
      ${t.label}${t.count > 0 ? ` <span class="tab-badge">${t.count}</span>` : ''}
    </button>
  `).join("");

  let tabContent = "";

  if (state.adminTab === "appointments") {
    tabContent = renderAppointmentsAdmin();
  }

  if (state.adminTab === "orders") {
    const ords = state.orders.slice().reverse().map(o=>`<div class="card p3 mb2"><p class="desc" style="margin:0;">${escapeHtml(o.name)} · ${escapeHtml(o.phone)} · ${o.total} ₺</p><p class="footnote" style="margin:2px 0 0;">${escapeHtml(o.address||"")}</p></div>`).join("") || `<p class="footnote">Henüz sipariş yok.</p>`;
    tabContent = `
      <p class="section-label">Gelen siparişler (canlı)</p>
      <div class="mb4">${ords}</div>
    `;
  }

  if (state.adminTab === "products") {
    const imgRows = allProducts().flatMap(cat => cat.items).map(p => `
      <div class="card p3 mb2">
        <p class="desc" style="margin:0 0 6px;font-weight:500;color:var(--ink);">${p.name}</p>
        <div style="display:flex;gap:6px;">
          <input class="input" id="img-${p.id}" placeholder="Görsel URL'si" value="${escapeAttr(state.productImages[p.id]||"")}" style="flex:1;" />
          <button class="qty-btn" style="width:auto;padding:0 12px;" data-action="save-product-image" data-id="${p.id}">Kaydet</button>
        </div>
      </div>`).join("");

    tabContent = `
      <p class="section-label">Yeni ürün ekle</p>
      <div class="card p5 mb4">
        <div class="field"><label>Ürün adı</label><input class="input" id="np-name" /></div>
        <div class="field"><label>Fiyat (₺)</label><input class="input" id="np-price" type="number" /></div>
        <button class="btn-primary" data-action="admin-add-product">Ürünü Ekle</button>
      </div>
      <p class="section-label">Ürün görselleri</p>
      <p class="footnote" style="margin-top:-4px;">Görseli bir yere yükleyip (ör. Google Drive'da "herkese açık" paylaşım linki, Imgur vb.) buraya linkini yapıştır.</p>
      <div class="mb4">${imgRows}</div>
    `;
  }

  if (state.adminTab === "videos") {
    const videoRows = SERVICES.map(s => `
      <div class="card p3 mb2">
        <p class="desc" style="margin:0 0 6px;font-weight:500;color:var(--ink);">${s.name}</p>
        <div style="display:flex;gap:6px;">
          <input class="input" id="vid-${s.id}" placeholder="YouTube linki" value="${escapeAttr(state.serviceVideos[s.id]||"")}" style="flex:1;" />
          <button class="qty-btn" style="width:auto;padding:0 12px;" data-action="save-video" data-id="${s.id}">Kaydet</button>
        </div>
      </div>`).join("");

    const deviceVideoRows = DEVICES.map(d => `
      <div class="card p3 mb2">
        <p class="desc" style="margin:0 0 6px;font-weight:500;color:var(--ink);">${d.name}</p>
        <div style="display:flex;gap:6px;">
          <input class="input" id="dvid-${d.id}" placeholder="YouTube linki" value="${escapeAttr(state.deviceVideos[d.id]||"")}" style="flex:1;" />
          <button class="qty-btn" style="width:auto;padding:0 12px;" data-action="save-device-video" data-id="${d.id}">Kaydet</button>
        </div>
      </div>`).join("");

    tabContent = `
      <p class="section-label">🪥 Çocuklar İçin Diş Fırçalama Videosu</p>
      <p class="footnote" style="margin-top:-4px;">Çocukların izleyerek diş fırçalayacağı eğlenceli 2 dakikalık YouTube videosu. Boş bırakılırsa profil sayfasında görünmez.</p>
      <div class="card p3 mb4">
        <div style="display:flex;gap:6px;">
          <input class="input" id="brush-video-url" placeholder="YouTube linki (örn: https://youtube.com/watch?v=...)" value="${escapeAttr(state.brushingVideoUrl||"")}" style="flex:1;" />
          <button class="qty-btn" style="width:auto;padding:0 12px;" data-action="save-brush-video">Kaydet</button>
        </div>
      </div>
      <p class="section-label">Hizmet tanıtım videoları</p>
      <p class="footnote" style="margin-top:-4px;">YouTube'a yüklediğin videonun linkini ilgili hizmetin yanına yapıştır.</p>
      <div class="mb4">${videoRows}</div>
      <p class="section-label">Cihaz tanıtım videoları</p>
      <p class="footnote" style="margin-top:-4px;">Cihazın nasıl çalıştığını gösteren YouTube videosunun linkini yapıştır.</p>
      <div class="mb4">${deviceVideoRows}</div>
    `;
  }

  if (state.adminTab === "social") {
    const socialMediaRows = `
      <div class="card p3 mb2">
        <p class="desc" style="margin:0 0 6px;font-weight:500;color:var(--ink);">📺 YouTube</p>
        <div style="display:flex;gap:6px;">
          <input class="input" id="sm-youtube" placeholder="YouTube kanal linki" value="${escapeAttr(state.socialMedia.youtube||"")}" style="flex:1;" />
          <button class="qty-btn" style="width:auto;padding:0 12px;" data-action="save-social" data-id="youtube">Kaydet</button>
        </div>
      </div>
      <div class="card p3 mb2">
        <p class="desc" style="margin:0 0 6px;font-weight:500;color:var(--ink);">📷 Instagram</p>
        <div style="display:flex;gap:6px;">
          <input class="input" id="sm-instagram" placeholder="Instagram profil linki" value="${escapeAttr(state.socialMedia.instagram||"")}" style="flex:1;" />
          <button class="qty-btn" style="width:auto;padding:0 12px;" data-action="save-social" data-id="instagram">Kaydet</button>
        </div>
      </div>
      <div class="card p3 mb2">
        <p class="desc" style="margin:0 0 6px;font-weight:500;color:var(--ink);">🐦 Twitter / X</p>
        <div style="display:flex;gap:6px;">
          <input class="input" id="sm-twitter" placeholder="Twitter/X profil linki" value="${escapeAttr(state.socialMedia.twitter||"")}" style="flex:1;" />
          <button class="qty-btn" style="width:auto;padding:0 12px;" data-action="save-social" data-id="twitter">Kaydet</button>
        </div>
      </div>
      <div class="card p3 mb2">
        <p class="desc" style="margin:0 0 6px;font-weight:500;color:var(--ink);">📘 Facebook</p>
        <div style="display:flex;gap:6px;">
          <input class="input" id="sm-facebook" placeholder="Facebook sayfa linki" value="${escapeAttr(state.socialMedia.facebook||"")}" style="flex:1;" />
          <button class="qty-btn" style="width:auto;padding:0 12px;" data-action="save-social" data-id="facebook">Kaydet</button>
        </div>
      </div>
      <div class="card p3 mb2">
        <p class="desc" style="margin:0 0 6px;font-weight:500;color:var(--ink);">📱 WhatsApp</p>
        <div style="display:flex;gap:6px;">
          <input class="input" id="sm-whatsapp" placeholder="WhatsApp linki (https://chat.whatsapp.com/... veya numara)" value="${escapeAttr(state.socialMedia.whatsapp||"")}" style="flex:1;" />
          <button class="qty-btn" style="width:auto;padding:0 12px;" data-action="save-social" data-id="whatsapp">Kaydet</button>
        </div>
      </div>`;

    tabContent = `
      <p class="section-label">Sosyal Medya Linkleri</p>
      <p class="footnote" style="margin-top:-4px;">İletişim sayfasında görünecek sosyal medya hesaplarınızın linklerini girin.</p>
      <div class="mb4">${socialMediaRows}</div>
    `;
  }

  if (state.adminTab === "reviews") {
    const reviewRows = state.reviews.slice().reverse().map(rv => {
      const isBlocked = rv.uid && state.blockedUsers.includes(rv.uid);
      return `
      <div class="card p3 mb2" style="${isBlocked ? 'opacity:0.5;' : ''}">
        <p class="desc" style="margin:0 0 2px;"><b>${escapeHtml(rv.name)}</b> ${stars(rv.rating)} ${isBlocked ? '<span style="color:var(--bad);font-size:11px;">(ENGELLİ)</span>' : ''}</p>
        <p class="desc" style="margin:0 0 6px;">${escapeHtml(rv.text)}</p>
        <div style="display:flex;gap:6px;margin-bottom:6px;">
          <input class="input" id="rvreply-${rv.id}" placeholder="Yanıt yaz (herkes görür)" value="${escapeAttr(rv.adminReply||"")}" style="flex:1;" />
          <button class="qty-btn" style="width:auto;padding:0 12px;" data-action="save-review-reply" data-id="${rv.id}">Kaydet</button>
        </div>
        <div style="display:flex;gap:6px;">
          <button class="qty-btn" style="width:auto;padding:0 12px;background:var(--bad);color:#fff;" data-action="delete-review" data-id="${rv.id}">🗑️ Sil</button>
          ${rv.uid ? `<button class="qty-btn" style="width:auto;padding:0 12px;background:${isBlocked ? 'var(--teal)' : 'var(--bad)'};color:#fff;" data-action="${isBlocked ? 'unblock-user' : 'block-user'}" data-uid="${rv.uid}">${isBlocked ? '✓ Engeli Kaldır' : '🚫 Kullanıcıyı Engelle'}</button>` : ''}
        </div>
      </div>`;
    }).join("") || `<p class="footnote">Henüz yorum yok.</p>`;

    tabContent = `
      <p class="section-label">Yorumlara yanıt ver</p>
      <p class="footnote" style="margin-top:-4px;">Yazdığın yanıt, o yorumun altında tüm kullanıcılara görünür.</p>
      <div class="mb4">${reviewRows}</div>
    `;
  }

  if (state.adminTab === "treatments") {
    // Tedavi fiyat listesi
    const priceList = state.treatmentPrices || {};
    const defaultPrices = {
      "Muayene": 0, "Dolgu": 2000, "Kanal Tedavisi": 4000, "İmplant": 15000,
      "Zirkonyum Kaplama": 5000, "Diş Beyazlatma": 3000, "Ortodonti": 25000,
      "Protez": 12000, "Diş Taşı Temizliği": 1000, "Diş Çekimi": 1500,
      "Köprü": 8000, "Lamine Veneer": 6000, "Şeffaf Plak": 20000, "Cerrahi Çekim": 3000
    };
    const allPrices = { ...defaultPrices, ...priceList };

    // Mevcut tedavi kayıtları
    const treatmentRows = (state.treatments || []).slice().reverse().map(t => `
      <div class="card p3 mb2">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
          <div>
            <p style="font-size:13px;font-weight:600;margin:0;">🦷 ${escapeHtml(t.treatmentName)} — ${escapeHtml(t.userName || "Bilinmeyen")}</p>
            <p style="font-size:11px;color:var(--muted);margin:2px 0 0;">📅 ${escapeHtml(t.date || "")} ${t.notes ? "· " + escapeHtml(t.notes) : ""}</p>
            ${t.amount ? `<p style="font-size:12px;font-weight:700;color:#2E7D32;margin:4px 0 0;">💰 ₺${parseFloat(t.amount).toLocaleString('tr-TR')} ${t.invoiceNo ? "· F: " + escapeHtml(t.invoiceNo) : ""}</p>` : ""}
          </div>
          <button data-action="delete-treatment" data-id="${t.id}" style="background:#FFEBEE;border:none;border-radius:6px;padding:4px 8px;cursor:pointer;font-size:11px;color:#C62828;">🗑️</button>
        </div>
      </div>
    `).join("") || '<p class="footnote">Henüz tedavi kaydı yok.</p>';

    // Otomatik giderler durumu
    const now = new Date();
    const autoExpenses = state.autoExpenses || { kira:50000, elektrik:3000, su:1500, dogalgaz:2000, sgk:8000, vergi:5000 };

    tabContent = `
      <!-- Tedavi Fiyat Listesi -->
      <div class="card p4 mb3">
        <p style="font-size:14px;font-weight:700;margin:0 0 10px;">💲 Tedavi Fiyat Listesi</p>
        <p style="font-size:11px;color:var(--muted);margin:0 0 10px;">Her tedavi için fiyat belirleyin. Tedavi kaydedildiğinde otomatik faturalanır.</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
          ${Object.entries(allPrices).map(([name, price]) => `
            <div style="display:flex;align-items:center;gap:4px;padding:4px 0;border-bottom:1px solid var(--line);">
              <span style="font-size:11px;flex:1;">${name}</span>
              <input class="input" style="width:80px;padding:4px 6px;font-size:11px;text-align:right;" type="number" value="${price}" data-price-name="${name}" data-action-blur="update-price" />
              <span style="font-size:10px;color:var(--muted);">₺</span>
            </div>
          `).join("")}
        </div>
        <div style="display:flex;gap:6px;margin-top:10px;">
          <input class="input" id="new-price-name" placeholder="Yeni tedavi adı" style="flex:1;font-size:11px;" />
          <input class="input" id="new-price-amount" type="number" placeholder="Fiyat" style="width:80px;font-size:11px;" />
          <button class="btn-primary" style="width:auto;padding:6px 12px;font-size:11px;" data-action="add-price">+ Ekle</button>
        </div>
      </div>

      <!-- Tedavi Kaydet (Hasta + Otomatik Fatura) -->
      <div class="card p4 mb3" style="background:linear-gradient(135deg,#E8F5E9,#C8E6C9);border:1px solid #A5D6A7;">
        <p style="font-size:14px;font-weight:700;margin:0 0 10px;color:#1B5E20;">🦷 Hasta Tedavi Kaydet</p>
        <p style="font-size:11px;color:#2E7D32;margin:0 0 10px;">Tedavi seçildiğinde otomatik fiyatlandırma + fatura + muhasebe kaydı yapılır.</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <input class="input" id="tr-user" placeholder="Hasta adı" />
          <select class="input" id="tr-name">
            ${Object.entries(allPrices).map(([name, price]) => `<option value="${name}" data-price="${price}">${name} — ₺${price.toLocaleString('tr-TR')}</option>`).join("")}
          </select>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:8px;">
          <input class="input" id="tr-date" type="date" value="${now.toISOString().split('T')[0]}" style="font-size:11px;" />
          <select class="input" id="tr-payment" style="font-size:11px;">
            <option>Nakit</option><option>Kredi Kartı</option><option>POS</option><option>Havale/EFT</option>
          </select>
          <select class="input" id="tr-patient-type" style="font-size:11px;">
            <option value="kisi">Şahıs</option><option value="mukellef">Vergi Mükellefi</option>
          </select>
        </div>
        <input class="input" id="tr-notes" placeholder="Not (isteğe bağlı)" style="margin-top:8px;font-size:11px;" />
        <button class="btn-primary" style="margin-top:10px;background:linear-gradient(135deg,#2E7D32,#43A047);" data-action="add-treatment">🦷 Tedavi Kaydet & Fatura Kes</button>
      </div>

      <!-- Mevcut Tedaviler -->
      <div class="card p4 mb3">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <p style="font-size:13px;font-weight:700;margin:0;">📋 Tedavi Kayıtları</p>
          <button class="btn-primary" style="width:auto;padding:4px 10px;font-size:10px;" data-action="print-treatments">🖨️ Çıktı Al</button>
        </div>
        ${treatmentRows}
      </div>
    `;
  }
  if (state.adminTab === "tips") {
    const tipRows = (state.healthTips || []).map(t => `
      <div class="card p3 mb2">
        <p class="desc" style="margin:0;">💡 ${escapeHtml(t.text || "")}</p>
        <button class="qty-btn" style="margin-top:8px;width:auto;padding:4px 12px;background:var(--bad);color:#fff;" data-action="delete-tip" data-id="${t.id}">🗑️ Sil</button>
      </div>
    `).join("") || `<p class="footnote">Henüz ipucu eklenmedi. Varsayılan ipuçları kullanılıyor.</p>`;

    tabContent = `
      <p class="section-label">Yeni İpucu Ekle</p>
      <p class="footnote" style="margin-top:-4px;">Kullanıcıların profilinde günlük olarak gösterilecek diş sağlığı ipuçları.</p>
      <div class="card p5 mb4">
        <div class="field"><label>İpucu Metni</label><textarea id="tip-text" placeholder="Örn: Günde 2 kez 2 dakika diş fırçalamak idealdir." style="min-height:60px;"></textarea></div>
        <button class="btn-primary" data-action="add-tip">💾 İpucu Ekle</button>
      </div>
      <p class="section-label">Mevcut İpuçları (${(state.healthTips || []).length})</p>
      <div class="mb4">${tipRows}</div>
    `;
  }

  if (state.adminTab === "announcements") {
    const annRows = (state.announcements || []).slice().reverse().map(a => `
      <div class="card p3 mb2">
        <p class="name" style="font-size:14px;margin:0;">📢 ${escapeHtml(a.title || "")}</p>
        <p class="desc" style="margin:4px 0;">${escapeHtml((a.text || "").substring(0,100))}${(a.text||"").length > 100 ? '...' : ''}</p>
        ${a.imageUrl ? `<img src="${a.imageUrl}" style="width:80px;height:80px;object-fit:cover;border-radius:8px;margin-top:4px;" />` : ''}
        ${a.videoUrl ? `<p class="footnote" style="margin:4px 0;">🎥 Video: ${escapeHtml(a.videoUrl.substring(0,40))}...</p>` : ''}
        <p class="footnote" style="margin:4px 0;">${a.createdAt ? new Date(a.createdAt).toLocaleString("tr-TR") : ''}</p>
        <button class="qty-btn" style="margin-top:6px;width:auto;padding:4px 12px;background:var(--bad);color:#fff;" data-action="delete-announcement" data-id="${a.id}">🗑️ Sil</button>
      </div>
    `).join("") || `<p class="footnote">Henüz duyuru yok.</p>`;

    tabContent = `
      <p class="section-label">Yeni Duyuru Oluştur</p>
      <p class="footnote" style="margin-top:-4px;">Duyuru yayınlandığında tüm kullanıcılara bildirim gönderilir.</p>
      <div class="card p5 mb4">
        <div class="field"><label>Duyuru Başlığı</label><input class="input" id="ann-title" placeholder="Örn: Klinik bayramda kapalı" /></div>
        <div class="field"><label>Duyuru Metni</label><textarea id="ann-text" placeholder="Detaylı açıklama..." style="min-height:80px;"></textarea></div>
        <div class="field"><label>Görsel (isteğe bağlı)</label><input type="file" id="ann-image" accept="image/*" style="font-size:12px;" /></div>
        <div class="field"><label>Video Linki (isteğe bağlı - YouTube)</label><input class="input" id="ann-video" placeholder="https://youtube.com/watch?v=..." /></div>
        <button class="btn-primary" data-action="add-announcement">📢 Duyuru Yayınla</button>
      </div>
      <p class="section-label">Mevcut Duyurular (${(state.announcements || []).length})</p>
      <div class="mb4">${annRows}</div>
    `;
  }

  if (state.adminTab === "portal") {
    tabContent = renderAccPortal();
  }

  if (state.adminTab === "accounting") {
    tabContent = renderAccounting();
  }

  return `${topbar("Yönetici Paneli","Menüden istediğiniz bölümü seçin.", {back:"home"})}
    <div class="content">
      <div class="admin-tabs">${tabButtons}</div>
      ${tabContent}
      <button class="linklike" data-action="admin-logout">Çıkış yap</button>
      <p class="footnote" style="margin-top:14px;">${state.fbReady ? "✓ Firebase'e bağlı — bu liste tüm cihazlarda anlık günceldir." : "⚠ Firebase bağlantısı bekleniyor, geçici olarak yalnızca bu cihazdaki veriler görünüyor."}</p>
    </div>`;
}
