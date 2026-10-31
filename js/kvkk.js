/* =========================================================
   NUR DİŞ — KVKK / KİŞİSEL VERİ KORUMA v14
   6698 sayılı Kişisel Verilerin Korunması Kanunu uyumu
   • Aydınlatma metni
   • Açık rıza onayı
   • Veri sahibi hakları (silme, düzeltme, itiraz)
   • Veri işleme envanteri
   • Çerez politikası
========================================================= */

/* Klinik bilgileri (aydınlatma metninde kullanılır) */
function kvkkKlinikBilgi() {
  const fb = state.firmaBilgi || {};
  return {
    unvan: fb.unvan || "Nur Diş & Dental Klinik",
    adres: fb.adres || "Mardin, Kızıltepe, TOKİ Mahallesi",
    telefon: fb.telefon || "0505 105 03 02",
    eposta: fb.eposta || "nurdisdentalklinik@gmail.com",
    vergiNo: fb.vergiNo || ""
  };
}

/* Veri işleme envanteri — KVKK m.10 bilgilendirme yükümlülüğü */
const VERI_ENVANTERI = [
  {
    kategori: "Kimlik Verisi",
    ornekler: "Ad, soyad, T.C. kimlik no",
    amac: "Hasta kayıt, randevu, tedavi takibi, SGK bildirgesi",
    hukuki: "KVKK m.5/2-c (sözleşmenin ifası), m.5/2-f (meşru menfaat)",
    sure: "Tedavi sonrası 10 yıl (sağlık kayıtları için yasal saklama)",
    yer: "Firebase (Google Cloud), cihaz hafızası"
  },
  {
    kategori: "İletişim Verisi",
    ornekler: "Telefon, e-posta, adres",
    amac: "Randevu hatırlatma, bilgilendirme, acil iletişim",
    hukuki: "KVKK m.5/2-c, m.5/2-f",
    sure: "Son işlemden itibaren 10 yıl",
    yer: "Firebase, cihaz hafızası"
  },
  {
    kategori: "Sağlık Verisi (ÖZEL NİTELİKLİ)",
    ornekler: "Tedavi türü, diş/çene durumu, röntgen, notlar, alerji",
    amac: "Teşhis, tedavi, tıbbi kayıt tutma, yasal yükümlülük",
    hukuki: "KVKK m.6/3 (sağlık hizmeti veren kuruluş), m.5/2-f",
    sure: "10 yıl (TTB ve Sağlık Bakanlığı mevzuatı)",
    yer: "Firebase — erişim yalnızca yönetici",
    hassas: true
  },
  {
    kategori: "Finansal Veri",
    ornekler: "Ödeme tutarı, fatura, borç durumu",
    amac: "Muhasebe, vergi beyanı, yasal kayıt",
    hukuki: "VUK m.253 (5 yıl saklama zorunluluğu)",
    sure: "10 yıl (Türk Ticaret Kanunu)",
    yer: "Firebase, cihaz hafızası"
  },
  {
    kategori: "İşlem Güvenliği",
    ornekler: "IP, tarayıcı bilgisi, oturum kaydı",
    amac: "Güvenlik, hata takibi, kötüye kullanım engelleme",
    hukuki: "KVKK m.5/2-f",
    sure: "2 yıl",
    yer: "Firebase Analytics"
  }
];

/* =========================================================
   RENDER: KVKK AYDINLATMA METNİ (hasta tarafı)
========================================================= */

function renderKvkk() {
  const k = kvkkKlinikBilgi();
  const altTab = state.kvkkTab || "aydinlatma";

  const chip = (id, label) => {
    const aktif = altTab === id;
    return `<button data-action="kvkk-tab" data-tab="${id}" style="flex:1;padding:8px 3px;border-radius:9px;font-size:10px;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif;border:1px solid ${aktif ? "#00695C" : "var(--line)"};background:${aktif ? "#00695C" : "rgba(255,255,255,.7)"};color:${aktif ? "#fff" : "var(--ink)"};cursor:pointer;line-height:1.3;">${label}</button>`;
  };

  let icerik = "";

  if (altTab === "aydinlatma") {
    icerik = `
      <div class="card p4 mb3" style="background:linear-gradient(135deg,#004D40,#00695C);color:#fff;border:none;">
        <p style="font-size:13px;font-weight:700;margin:0 0 2px;">🔒 KVKK Aydınlatma Metni</p>
        <p style="font-size:10.5px;opacity:.85;margin:0;">6698 sayılı Kanun m.10 kapsamında</p>
        <p style="font-size:9.5px;opacity:.75;margin:6px 0 0;">Son güncelleme: ${accTarihTR()}</p>
      </div>

      <div class="card p4 mb3">
        <p style="font-size:12px;font-weight:700;color:#00695C;margin:0 0 8px;">1. Veri Sorumlusu</p>
        <p style="font-size:11px;line-height:1.75;margin:0;color:#333;">
          <b>${escapeHtml(k.unvan)}</b><br/>
          Adres: ${escapeHtml(k.adres)}<br/>
          Telefon: ${escapeHtml(k.telefon)}<br/>
          E-posta: ${escapeHtml(k.eposta)}
          ${k.vergiNo ? "<br/>Vergi No: " + escapeHtml(k.vergiNo) : ""}
        </p>
      </div>

      <div class="card p4 mb3">
        <p style="font-size:12px;font-weight:700;color:#00695C;margin:0 0 8px;">2. İşlenen Kişisel Veriler</p>
        <p style="font-size:11px;line-height:1.75;margin:0 0 8px;color:#333;">
          Kliniğimiz, hizmet sunumu kapsamında aşağıdaki verilerinizi işlemektedir:
        </p>
        <div style="font-size:10.5px;line-height:1.9;color:#333;">
          <b>• Kimlik:</b> Ad, soyad, T.C. kimlik numarası<br/>
          <b>• İletişim:</b> Telefon, e-posta, adres<br/>
          <b>• Sağlık (özel nitelikli):</b> Tedavi bilgileri, röntgen görüntüleri, alerji bilgisi, hekim notları<br/>
          <b>• Finansal:</b> Ödeme kayıtları, fatura bilgileri<br/>
          <b>• İşlem güvenliği:</b> IP adresi, tarayıcı bilgisi
        </div>
      </div>

      <div class="card p4 mb3">
        <p style="font-size:12px;font-weight:700;color:#00695C;margin:0 0 8px;">3. İşleme Amaçları</p>
        <div style="font-size:11px;line-height:1.85;color:#333;">
          • Randevu oluşturma ve hatırlatma<br/>
          • Teşhis, tedavi ve tıbbi takip<br/>
          • Tedavi geçmişinizin kaydı<br/>
          • Fatura ve muhasebe işlemleri<br/>
          • Yasal bildirim yükümlülükleri (SGK, vergi)<br/>
          • Acil durumlarda iletişim<br/>
          • Hizmet kalitesi ölçümü (memnuniyet anketi)
        </div>
      </div>

      <div class="card p4 mb3">
        <p style="font-size:12px;font-weight:700;color:#00695C;margin:0 0 8px;">4. Hukuki Sebepler</p>
        <div style="font-size:11px;line-height:1.85;color:#333;">
          Verileriniz KVKK m.5 ve m.6 kapsamında şu sebeplerle işlenir:<br/><br/>
          <b>• m.5/2-c</b> — Sözleşmenin kurulması veya ifası<br/>
          <b>• m.5/2-e</b> — Hukuki yükümlülüğün yerine getirilmesi<br/>
          <b>• m.5/2-f</b> — Meşru menfaat<br/>
          <b>• m.6/3</b> — Sağlık hizmeti sunan kuruluşlarca özel nitelikli veri işleme<br/><br/>
          <span style="background:#FFF3E0;padding:2px 5px;border-radius:3px;font-size:10px;">Sağlık verileriniz yalnızca sır saklama yükümlülüğü altındaki hekim ve sağlık personeli tarafından işlenir.</span>
        </div>
      </div>

      <div class="card p4 mb3">
        <p style="font-size:12px;font-weight:700;color:#00695C;margin:0 0 8px;">5. Verilerin Aktarılması</p>
        <div style="font-size:11px;line-height:1.85;color:#333;">
          Verileriniz <b>üçüncü kişilerle ticari amaçla paylaşılmaz.</b> Yalnızca:<br/><br/>
          • <b>SGK</b> — sigorta bildirimleri (yasal zorunluluk)<br/>
          • <b>GİB</b> — vergi beyannameleri (yasal zorunluluk)<br/>
          • <b>Laboratuvar</b> — protez/kaplama üretimi (yalnızca gerekli bilgi)<br/>
          • <b>Bulut hizmet sağlayıcı</b> — Google Firebase (veri işleyen sıfatıyla)<br/><br/>
          Yurt dışına aktarım yapılmamaktadır.
        </div>
      </div>

      <div class="card p4 mb3">
        <p style="font-size:12px;font-weight:700;color:#00695C;margin:0 0 8px;">6. Saklama Süresi</p>
        <div style="font-size:11px;line-height:1.85;color:#333;">
          • <b>Sağlık kayıtları:</b> Tedavi sonrası <b>10 yıl</b> (Sağlık Bakanlığı mevzuatı)<br/>
          • <b>Muhasebe kayıtları:</b> <b>10 yıl</b> (TTK)<br/>
          • <b>Randevu kayıtları:</b> 2 yıl<br/>
          • <b>Anket verileri:</b> 2 yıl<br/><br/>
          Süre sonunda verileriniz <b>silinir, yok edilir veya anonim hâle getirilir.</b>
        </div>
      </div>

      <div class="card p4 mb3" style="background:#E8F5E9;border:1px solid #A5D6A7;">
        <p style="font-size:12px;font-weight:700;color:#1B5E20;margin:0 0 8px;">7. KVKK m.11 Haklarınız</p>
        <div style="font-size:11px;line-height:1.9;color:#2E7D32;">
          ✓ Kişisel verilerinizin işlenip işlenmediğini öğrenme<br/>
          ✓ İşlenmişse buna ilişkin bilgi talep etme<br/>
          ✓ İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme<br/>
          ✓ Yurt içinde/yurt dışında aktarıldığı üçüncü kişileri bilme<br/>
          ✓ Eksik veya yanlış işlenmişse <b>düzeltilmesini</b> isteme<br/>
          ✓ <b>Silinmesini veya yok edilmesini</b> isteme<br/>
          ✓ Aktarıldığı üçüncü kişilere bunları bildirme<br/>
          ✓ Otomatik sistemlerle analiz sonucu aleyhinize çıkan sonuca <b>itiraz</b> etme<br/>
          ✓ Kanuna aykırı işleme sebebiyle zarara uğramanız hâlinde <b>tazminat</b> talep etme
        </div>
      </div>

      <div class="card p4 mb3" style="background:#E0F2F1;border:1px solid #80CBC4;">
        <p style="font-size:12px;font-weight:700;color:#00695C;margin:0 0 8px;">8. Başvuru Yolu</p>
        <p style="font-size:11px;line-height:1.75;color:#00695C;margin:0;">
          Haklarınızı kullanmak için:<br/><br/>
          📧 <b>${escapeHtml(k.eposta)}</b><br/>
          📞 <b>${escapeHtml(k.telefon)}</b><br/>
          📍 ${escapeHtml(k.adres)}<br/><br/>
          Başvurunuz en geç <b>30 gün</b> içinde ücretsiz olarak yanıtlanır.
        </p>
      </div>

      <div class="card p4 mb3" style="background:#FFF8E1;border:1px solid #FFD54F;">
        <p style="font-size:11px;font-weight:700;color:#E65100;margin:0 0 6px;">⚖️ Yasal Uyarı</p>
        <p style="font-size:10px;color:#8D6E00;margin:0;line-height:1.65;">
          Bu metin 6698 sayılı KVKK ve ilgili ikincil mevzuat kapsamında hazırlanmıştır.
          Metnin hukuki geçerliliği için klinik bilgilerinin doğru olması gerekir.
          Nihai hukuki danışmanlık için bir avukata danışmanız önerilir.
        </p>
      </div>
    `;
  }

  if (altTab === "haklarim") {
    icerik = renderKvkkHaklarim();
  }

  if (altTab === "cerezler") {
    icerik = renderKvkkCerez();
  }

  return `${topbar("Gizlilik & KVKK", "Kişisel verilerinizin korunması", { back: "home" })}
    <div class="content">
      <div style="display:flex;gap:5px;margin-bottom:12px;">
        ${chip("aydinlatma", "Aydınlatma")}
        ${chip("haklarim", "Haklarım")}
        ${chip("cerezler", "Çerezler")}
      </div>
      ${icerik}
    </div>`;
}

/* =========================================================
   VERİ SAHİBİ HAKLARI (Silme / Düzeltme / Talep)
========================================================= */

function renderKvkkHaklarim() {
  const talepler = (state.kvkkTalepler || []).slice(0, 20);

  const talepSatirlar = talepler.map(t => `
    <div style="padding:7px 0;border-bottom:1px solid var(--line);">
      <div style="display:flex;justify-content:space-between;gap:8px;">
        <div style="flex:1;min-width:0;">
          <p style="font-size:11.5px;font-weight:600;margin:0;">${escapeHtml(t.tipAd || t.tip)}</p>
          <p style="font-size:9.5px;color:var(--muted);margin:2px 0 0;">${accTarihTR(t.tarih)} · ${escapeHtml(t.ad || "")}</p>
          ${t.aciklama ? `<p style="font-size:9.5px;color:#666;margin:2px 0 0;">${escapeHtml(t.aciklama)}</p>` : ""}
        </div>
        <span style="font-size:9px;font-weight:700;color:${t.durum === "tamam" ? "#2E7D32" : "#E65100"};flex-shrink:0;">${t.durum === "tamam" ? "✓ Tamam" : "⏳ Bekliyor"}</span>
      </div>
    </div>`).join("") || `<p class="footnote">Henüz talep yok.</p>`;

  return `
    <div class="card p4 mb3" style="background:linear-gradient(135deg,#1565C0,#1976D2);color:#fff;border:none;">
      <p style="font-size:13px;font-weight:700;margin:0 0 2px;">Haklarınızı Kullanın</p>
      <p style="font-size:10.5px;opacity:.85;margin:0;">KVKK m.11 kapsamında</p>
    </div>

    <div class="card p4 mb3">
      <p style="font-size:12px;font-weight:700;color:#1565C0;margin:0 0 10px;">Verilerimle Ne Yapabilirim?</p>
      <div style="display:grid;gap:6px;">
        <button class="btn-primary" style="background:#2E7D32;font-size:11.5px;padding:11px;text-align:left;justify-content:flex-start;" data-action="kvkk-talep" data-tip="erisim">📋 Verilerimi Görmek İstiyorum</button>
        <button class="btn-primary" style="background:#E65100;font-size:11.5px;padding:11px;text-align:left;justify-content:flex-start;" data-action="kvkk-talep" data-tip="duzeltme">✏️ Verimi Düzeltmek İstiyorum</button>
        <button class="btn-primary" style="background:#C62828;font-size:11.5px;padding:11px;text-align:left;justify-content:flex-start;" data-action="kvkk-talep" data-tip="silme">🗑️ Verilerimin Silinmesini İstiyorum</button>
        <button class="btn-primary" style="background:#6A1B9A;font-size:11.5px;padding:11px;text-align:left;justify-content:flex-start;" data-action="kvkk-talep" data-tip="itiraz">⚖️ İtiraz Etmek İstiyorum</button>
      </div>
    </div>

    <div class="card p4 mb3" style="background:#FFF3E0;border:1px solid #FFB74D;">
      <p style="font-size:11px;font-weight:700;color:#E65100;margin:0 0 6px;">⏱️ Süreç nasıl işler?</p>
      <p style="font-size:10px;color:#BF360C;margin:0;line-height:1.7;">
        1. Talebiniz kaydedilir ve kliniğe bildirilir<br/>
        2. En geç <b>30 gün</b> içinde yanıt verilir<br/>
        3. Silme talebinde verileriniz <b>geri alınamaz</b> şekilde silinir<br/>
        4. Talebiniz için kimlik doğrulaması yapılabilir
      </p>
    </div>

    <p class="section-label">Taleplerim (${talepSatirlar ? talepler.length : 0})</p>
    <div class="card p4 mb3">${talepSatirlar}</div>

    <div class="card p4 mb3" style="background:#E3F2FD;border:1px solid #90CAF9;">
      <p style="font-size:11px;font-weight:700;color:#0D47A1;margin:0 0 6px;">ℹ️ Önemli</p>
      <p style="font-size:10px;color:#1565C0;margin:0;line-height:1.7;">
        Yasal saklama süresi dolmamış <b>sağlık ve muhasebe kayıtları</b> silinemez
        (Sağlık Bakanlığı ve Vergi Usul Kanunu gereği). Bu durumda verileriniz
        anonim hâle getirilir veya erişim kısıtlanır.
      </p>
    </div>
  `;
}

/* =========================================================
   ÇEREZ POLİTİKASI
========================================================= */

function renderKvkkCerez() {
  return `
    <div class="card p4 mb3" style="background:linear-gradient(135deg,#4A148C,#6A1B9A);color:#fff;border:none;">
      <p style="font-size:13px;font-weight:700;margin:0 0 2px;">🍪 Çerez Politikası</p>
      <p style="font-size:10.5px;opacity:.85;margin:0;">Hangi verileri, neden saklıyoruz?</p>
    </div>

    <div class="card p4 mb3">
      <p style="font-size:12px;font-weight:700;color:#6A1B9A;margin:0 0 10px;">Kullanılan Çerezler ve Depolama</p>

      <div style="border-left:3px solid #2E7D32;padding-left:10px;margin-bottom:12px;">
        <p style="font-size:11.5px;font-weight:700;margin:0;color:#2E7D32;">✓ Zorunlu (kapatılamaz)</p>
        <p style="font-size:10px;color:#555;margin:4px 0 0;line-height:1.6;">
          <b>Oturum bilgisi</b> — giriş durumunuzu korur<br/>
          <b>Yerel veri (localStorage)</b> — randevu, tedavi geçmişi, sepet<br/>
          <b>Güvenlik</b> — Firebase kimlik doğrulama
        </p>
        <p style="font-size:9px;color:#888;margin:3px 0 0;">Süre: Oturum sonuna kadar veya siz silene kadar</p>
      </div>

      <div style="border-left:3px solid #1565C0;padding-left:10px;margin-bottom:12px;">
        <p style="font-size:11.5px;font-weight:700;margin:0;color:#1565C0;">ℹ️ İşlevsel</p>
        <p style="font-size:10px;color:#555;margin:4px 0 0;line-height:1.6;">
          <b>Tercihler</b> — dil, tema, bildirim ayarları<br/>
          <b>Son görülen ekran</b> — kaldığınız yerden devam
        </p>
        <p style="font-size:9px;color:#888;margin:3px 0 0;">Süre: 1 yıl</p>
      </div>

      <div style="border-left:3px solid #E65100;padding-left:10px;">
        <p style="font-size:11.5px;font-weight:700;margin:0;color:#E65100;">📊 Analitik (isteğe bağlı)</p>
        <p style="font-size:10px;color:#555;margin:4px 0 0;line-height:1.6;">
          <b>Firebase Analytics</b> — hangi sayfalar kullanılıyor, hata oranı<br/>
          <b>Anonim</b> — kimliğinizle ilişkilendirilmez
        </p>
        <p style="font-size:9px;color:#888;margin:3px 0 0;">Süre: 2 yıl</p>
      </div>
    </div>

    <div class="card p4 mb3">
      <p style="font-size:12px;font-weight:700;color:#6A1B9A;margin:0 0 8px;">🚫 Reklam Çerezi Kullanmıyoruz</p>
      <p style="font-size:10.5px;color:#555;margin:0;line-height:1.65;">
        Sitemizde <b>reklam çerezi, izleme pikseli veya üçüncü taraf reklam ağı yoktur.</b>
        Verileriniz reklam amacıyla kullanılmaz ve satılmaz.
      </p>
    </div>

    <div class="card p4 mb3" style="background:#FFF3E0;border:1px solid #FFB74D;">
      <p style="font-size:12px;font-weight:700;color:#E65100;margin:0 0 8px;">🗑️ Çerezleri Nasıl Silersiniz?</p>
      <p style="font-size:10.5px;color:#BF360C;margin:0;line-height:1.75;">
        <b>Chrome (Android):</b> Ayarlar → Site ayarları → Veri temizle<br/>
        <b>Safari (iOS):</b> Ayarlar → Safari → Gelişmiş → Web sitesi verilerini sil<br/>
        <b>Uygulama içinden:</b> Ayarlar → "Verilerimi Temizle" butonu
      </p>
    </div>

    <div class="card p4 mb3" style="background:#E0F2F1;border:1px solid #80CBC4;">
      <p style="font-size:11px;font-weight:700;color:#00695C;margin:0 0 6px;">💡 Bilmeniz gereken</p>
      <p style="font-size:10px;color:#00695C;margin:0;line-height:1.7;">
        Çerezleri tamamen kapatırsanız <b>randevu alamaz, geçmişinizi göremezsiniz.</b>
        Randevu bilgileriniz kaybolur. Bu nedenle zorunlu çerezler devre dışı bırakılamaz.
      </p>
    </div>
  `;
}

/* =========================================================
   YÖNETİCİ: VERİ İŞLEME ENVANTERİ + TALEP YÖNETİMİ
========================================================= */

function renderAccKvkk() {
  const talepler = state.kvkkTalepler || [];
  const bekleyen = talepler.filter(t => t.durum !== "tamam");
  const k = kvkkKlinikBilgi();

  const envanterSatir = VERI_ENVANTERI.map(v => `
    <div class="card p3 mb2" style="${v.hassas ? "border-left:4px solid #C62828;" : ""}">
      <p style="font-size:12px;font-weight:700;margin:0;">${v.hassas ? "🔴 " : ""}${escapeHtml(v.kategori)}</p>
      <p style="font-size:10px;color:#666;margin:3px 0 0;">${escapeHtml(v.ornekler)}</p>
      <div style="display:flex;gap:8px;margin-top:5px;font-size:9px;color:#888;flex-wrap:wrap;">
        <span>📋 ${escapeHtml(v.sure)}</span>
        <span>💾 ${escapeHtml(v.yer)}</span>
      </div>
      <p style="font-size:9.5px;color:#555;margin:4px 0 0;">Amaç: ${escapeHtml(v.amac)}</p>
      <p style="font-size:9px;color:#777;margin:2px 0 0;">Dayanak: ${escapeHtml(v.hukuki)}</p>
    </div>`).join("");

  const talepSatir = talepler.slice(0, 30).map(t => `
    <div class="card p3 mb2" style="${t.durum === "tamam" ? "opacity:.55;" : "border-left:3px solid #E65100;"}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
        <div style="flex:1;min-width:0;">
          <p style="font-size:12px;font-weight:700;margin:0;">${escapeHtml(t.tipAd || t.tip)}</p>
          <p style="font-size:10px;color:var(--muted);margin:2px 0 0;">${escapeHtml(t.ad || "")}${t.telefon ? " · " + escapeHtml(t.telefon) : ""}</p>
          <p style="font-size:9.5px;color:#888;margin:2px 0 0;">${accTarihTR(t.tarih)}${t.aciklama ? " · " + escapeHtml(t.aciklama) : ""}</p>
        </div>
        <div style="display:flex;flex-direction:column;gap:4px;flex-shrink:0;">
          ${t.durum !== "tamam"
            ? `<button data-action="kvkk-tamamla" data-id="${t.id}" style="background:#E8F5E9;border:none;border-radius:6px;padding:5px 8px;cursor:pointer;font-size:10px;color:#2E7D32;font-weight:700;">✓ Tamamla</button>`
            : `<span style="font-size:10px;color:#2E7D32;font-weight:700;">✓ Tamam</span>`}
          <button data-action="kvkk-sil-talep" data-id="${t.id}" style="background:#FFEBEE;border:none;border-radius:6px;padding:5px 8px;cursor:pointer;font-size:10px;color:#C62828;">🗑️</button>
        </div>
      </div>
    </div>`).join("") || `<p class="footnote">Henüz talep yok.</p>`;

  return `
    <div class="card p4 mb3" style="background:linear-gradient(135deg,#004D40,#00695C);color:#fff;border:none;">
      <p style="font-size:13px;font-weight:700;margin:0 0 2px;">🔒 KVKK Uyum Paneli</p>
      <p style="font-size:10.5px;opacity:.85;margin:0 0 10px;">Veri sorumlusu yükümlülükleri</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:8px;">
          <p style="font-size:9px;margin:0;opacity:.85;">BEKLEYEN TALEP</p>
          <p style="font-size:16px;font-weight:800;margin:2px 0 0;">${bekleyen.length}</p>
        </div>
        <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:8px;">
          <p style="font-size:9px;margin:0;opacity:.85;">VERİ KATEGORİSİ</p>
          <p style="font-size:16px;font-weight:800;margin:2px 0 0;">${VERI_ENVANTERI.length}</p>
        </div>
      </div>
    </div>

    ${bekleyen.length ? `<div class="card p3 mb3" style="background:#FFEBEE;border:1px solid #EF9A9A;">
      <p style="font-size:12px;font-weight:700;color:#C62828;margin:0;">⚠️ ${bekleyen.length} bekleyen veri talebi</p>
      <p style="font-size:10px;color:#B71C1C;margin:3px 0 0;">KVKK m.13 gereği 30 gün içinde yanıtlanmalı.</p>
    </div>` : ""}

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px;">
      <button class="btn-primary" style="background:#00695C;font-size:11px;padding:11px;" data-action="kvkk-metin-yazdir">🖨️ Aydınlatma Metni</button>
      <button class="btn-primary" style="background:#0E93AC;font-size:11px;padding:11px;" data-action="kvkk-envanter-yazdir">📋 Envanter</button>
    </div>

    <p class="section-label">📋 Veri İşleme Envanteri</p>
    <p class="footnote" style="margin-top:-4px;">KVKK m.10 ve VERBİS uyumu için gerekli</p>
    ${envanterSatir}

    <p class="section-label" style="margin-top:16px;">📨 Veri Sahibi Talepleri (${talepler.length})</p>
    ${talepSatir}

    <div class="card p4 mb3" style="background:#E0F2F1;border:1px solid #80CBC4;margin-top:12px;">
      <p style="font-size:11.5px;font-weight:700;color:#00695C;margin:0 0 8px;">⚖️ Yasal Yükümlülükler</p>
      <table style="width:100%;font-size:10px;color:#00695C;">
        <tr style="border-bottom:1px solid #B2DFDB;">
          <td style="padding:4px 0;font-weight:700;">Aydınlatma (m.10)</td>
          <td style="text-align:right;">✓ Sitede mevcut</td>
        </tr>
        <tr style="border-bottom:1px solid #B2DFDB;">
          <td style="padding:4px 0;font-weight:700;">Veri güvenliği (m.12)</td>
          <td style="text-align:right;">✓ Şifreli bağlantı, yetkili erişim</td>
        </tr>
        <tr style="border-bottom:1px solid #B2DFDB;">
          <td style="padding:4px 0;font-weight:700;">Başvuru yanıtı (m.13)</td>
          <td style="text-align:right;">⚠️ 30 gün — takip edin</td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-weight:700;">VERBİS kaydı</td>
          <td style="text-align:right;">${(state.personnel||[]).length > 0 ? "⚠️ Gerekli olabilir" : "Muaf (çalışan yok)"}</td>
        </tr>
      </table>
    </div>

    <div class="card p4 mb3" style="background:#FFF8E1;border:1px solid #FFD54F;">
      <p style="font-size:11px;font-weight:700;color:#E65100;margin:0 0 6px;">⚠️ VERBİS Kaydı Hakkında</p>
      <p style="font-size:10px;color:#8D6E00;margin:0;line-height:1.7;">
        Yıllık çalışan sayısı <b>50'den az</b> ve bilanço toplamı <b>25 milyon TL'den düşük</b> olan
        mükellefler VERBİS'e kayıt olmak zorunda değildir. Ancak <b>özel nitelikli veri
        (sağlık verisi)</b> işleyenler için istisna geçerli olmayabilir.<br/><br/>
        <b>Öneri:</b> Bir avukat veya KVKK danışmanına danışın.
      </p>
    </div>

    <div class="card p4 mb3" style="background:#E3F2FD;border:1px solid #90CAF9;">
      <p style="font-size:11px;font-weight:700;color:#0D47A1;margin:0 0 6px;">✅ Alınan Teknik Tedbirler</p>
      <p style="font-size:10px;color:#1565C0;margin:0;line-height:1.8;">
        ✓ HTTPS (şifreli bağlantı)<br/>
        ✓ Firebase kimlik doğrulama (e-posta/şifre)<br/>
        ✓ Yönetici paneli tek e-posta ile sınırlı<br/>
        ✓ Hasta verileri yalnızca yönetici tarafından görülebilir<br/>
        ✓ Düzenli yedekleme (veri kaybına karşı)<br/>
        ✓ Reklam çerezi yok, üçüncü tarafa satış yok
      </p>
    </div>
  `;
}

/* KVKK aksiyonları */
function kvkkAction(action, el) {
  /* --- hasta tarafı --- */
  if (action === "kvkk-tab") { state.kvkkTab = el.dataset.tab; render(); return true; }

  if (action === "kvkk-talep") {
    const tip = el.dataset.tip;
    const tipAdlari = {
      erisim: "Verilerimin Gösterilmesi",
      duzeltme: "Veri Düzeltme",
      silme: "Veri Silme",
      itiraz: "İtiraz"
    };
    const ad = prompt("Adınız Soyadınız:");
    if (!ad) return true;
    const telefon = prompt("Telefon numaranız (size dönüş için):");
    if (!telefon) return true;
    const aciklama = tip === "silme" || tip === "itiraz"
      ? (prompt("Kısa açıklama (isteğe bağlı):") || "")
      : "";

    if (tip === "silme" && !confirm("⚠️ DİKKAT!\n\nVerilerinizin silinmesini talep etmek üzeresiniz.\n\nSilme sonrası tedavi geçmişiniz, randevularınız ve sağlık kayıtlarınız erişilemez hale gelir.\n\nDevam etmek istiyor musunuz?")) return true;

    if (!state.kvkkTalepler) state.kvkkTalepler = [];
    state.kvkkTalepler.unshift({
      id: "kv_" + Date.now(),
      tip, tipAd: tipAdlari[tip] || tip,
      ad, telefon, aciklama,
      tarih: new Date().toISOString(),
      durum: "bekliyor"
    });
    localStorage.setItem("nurdis_kvkk_talepler", JSON.stringify(state.kvkkTalepler));
    if (typeof saveAccountingToFirebase === "function") saveAccountingToFirebase();

    alert("✅ Talebiniz alındı.\n\n" +
      "Konu: " + (tipAdlari[tip] || tip) + "\n" +
      "En geç 30 gün içinde " + telefon + " numarasından size dönüş yapılacaktır.\n\n" +
      "Talebiniz kliniğe iletildi.");
    render();
    return true;
  }

  /* --- yönetici tarafı --- */
  if (action === "kvkk-tamamla") {
    const t = (state.kvkkTalepler || []).find(x => x.id === el.dataset.id);
    if (!t) return true;
    t.durum = "tamam";
    t.tamamTarihi = new Date().toISOString();
    localStorage.setItem("nurdis_kvkk_talepler", JSON.stringify(state.kvkkTalepler));
    if (typeof saveAccountingToFirebase === "function") saveAccountingToFirebase();
    render();
    return true;
  }

  if (action === "kvkk-sil-talep") {
    if (!confirm("Bu talep kaydı silinsin mi?\n\n(Uyarı: Yasal olarak talep kayıtlarını 2 yıl saklamanız gerekir.)")) return true;
    state.kvkkTalepler = (state.kvkkTalepler || []).filter(x => x.id !== el.dataset.id);
    localStorage.setItem("nurdis_kvkk_talepler", JSON.stringify(state.kvkkTalepler));
    if (typeof saveAccountingToFirebase === "function") saveAccountingToFirebase();
    render();
    return true;
  }

  if (action === "kvkk-metin-yazdir") {
    accPrint("KVKK Aydınlatma Metni", `
      <h3 style="color:#00695C;">1. Veri Sorumlusu</h3>
      <p>${escapeHtml(kvkkKlinikBilgi().unvan)}<br/>${escapeHtml(kvkkKlinikBilgi().adres)}<br/>${escapeHtml(kvkkKlinikBilgi().telefon)}<br/>${escapeHtml(kvkkKlinikBilgi().eposta)}</p>
      <h3 style="color:#00695C;">2. İşlenen Veriler ve Amaçları</h3>
      <table style="width:100%;border-collapse:collapse;font-size:10px;">
        <tr style="background:#f0f0f0;"><th style="padding:5px;border:1px solid #ddd;text-align:left;">Kategori</th><th style="padding:5px;border:1px solid #ddd;text-align:left;">Örnekler</th><th style="padding:5px;border:1px solid #ddd;text-align:left;">Amaç</th><th style="padding:5px;border:1px solid #ddd;text-align:left;">Süre</th></tr>
        ${VERI_ENVANTERI.map(v => `<tr><td style="padding:4px;border:1px solid #ddd;">${escapeHtml(v.kategori)}</td><td style="padding:4px;border:1px solid #ddd;">${escapeHtml(v.ornekler)}</td><td style="padding:4px;border:1px solid #ddd;">${escapeHtml(v.amac)}</td><td style="padding:4px;border:1px solid #ddd;">${escapeHtml(v.sure)}</td></tr>`).join("")}
      </table>
      <h3 style="color:#00695C;">3. Haklarınız (KVKK m.11)</h3>
      <p style="font-size:10.5px;line-height:1.8;">Verilerinizin işlenip işlenmediğini öğrenme, bilgi talep etme, düzeltilmesini veya silinmesini isteme, itiraz etme ve zarara uğramanız hâlinde tazminat talep etme haklarına sahipsiniz.</p>
      <h3 style="color:#00695C;">4. Başvuru</h3>
      <p style="font-size:10.5px;">${escapeHtml(kvkkKlinikBilgi().eposta)} · ${escapeHtml(kvkkKlinikBilgi().telefon)}<br/>Başvurular en geç 30 gün içinde yanıtlanır.</p>
    `);
    return true;
  }

  if (action === "kvkk-envanter-yazdir") {
    accPrint("Veri İşleme Envanteri", `
      <h3 style="color:#00695C;">Kişisel Veri İşleme Envanteri</h3>
      <p style="font-size:10px;color:#666;">Düzenleme: ${accTarihTR()} · ${escapeHtml(kvkkKlinikBilgi().unvan)}</p>
      <table style="width:100%;border-collapse:collapse;font-size:9.5px;">
        <tr style="background:#f0f0f0;">
          <th style="padding:5px;border:1px solid #ddd;text-align:left;">Kategori</th>
          <th style="padding:5px;border:1px solid #ddd;text-align:left;">Örnekler</th>
          <th style="padding:5px;border:1px solid #ddd;text-align:left;">Amaç</th>
          <th style="padding:5px;border:1px solid #ddd;text-align:left;">Hukuki Dayanak</th>
          <th style="padding:5px;border:1px solid #ddd;text-align:left;">Saklama</th>
          <th style="padding:5px;border:1px solid #ddd;text-align:left;">Yer</th>
        </tr>
        ${VERI_ENVANTERI.map(v => `<tr${v.hassas ? ' style="background:#FFEBEE;"' : ''}><td style="padding:4px;border:1px solid #ddd;">${escapeHtml(v.kategori)}</td><td style="padding:4px;border:1px solid #ddd;">${escapeHtml(v.ornekler)}</td><td style="padding:4px;border:1px solid #ddd;">${escapeHtml(v.amac)}</td><td style="padding:4px;border:1px solid #ddd;">${escapeHtml(v.hukuki)}</td><td style="padding:4px;border:1px solid #ddd;">${escapeHtml(v.sure)}</td><td style="padding:4px;border:1px solid #ddd;">${escapeHtml(v.yer)}</td></tr>`).join("")}
      </table>
    `);
    return true;
  }

  return false;
}
