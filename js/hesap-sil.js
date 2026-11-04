/* =====================================================================
   🗑️ HESAP VE VERİ SİLME  (KVKK m.7 + Google Play / App Store zorunluluğu)
   ---------------------------------------------------------------------
   Kalıcı adres: https://nurdis.pages.dev/#hesap-sil

   MAĞAZA ŞARTI:
     • Google Play  — 2023'ten beri zorunlu (User Data policy)
     • Apple        — 2022'den beri zorunlu (Guideline 5.1.1(v))
   Başvuru formunda "veri silme talebi URL'si" istenir. Yoksa ret.

   YASAL ÇERÇEVE (Türkiye):
     • KVKK m.7  : Kişisel verilerin silinmesi hakkı
     • TTK m.82  : Ticari defter ve belgeler 10 yıl saklanır
     • VUK m.253 : Fatura/muhasebe kayıtları 10 yıl saklanır

   Bu yüzden silme İKİ KADEMELİ:
     1) SİLİNEN : profil, adres, sağlık notu, dosya, puan, fırçalama serisi
     2) ANONİMLEŞTİRİLEN : sipariş/fatura kayıtları (tutar+tarih kalır,
        ad-telefon-adres silinir)  → yasal saklama yükümlülüğü
   ===================================================================== */

/* Türkçe büyük/küçük harf duyarsız karşılaştırma.
   "sil", "SİL", "SIL" hepsi kabul edilir. */
function silmeOnayGecerliMi(metin) {
  const n = (metin || "").trim().toUpperCase()
    .replace(/İ/g, "I").replace(/I/g, "I").replace(/ı/g, "I");
  return n === "SIL" || n === "SİL";
}

function silmeAdimDurumu() {
  return state.silmeAdim || "bilgi";   // "bilgi" | "onay" | "isleniyor" | "tamam"
}

function renderHesapSil() {
  const girisVar = !!(state.user && state.user.uid);
  const adim = silmeAdimDurumu();

  /* ---------- Giriş yok ---------- */
  if (!girisVar) {
    return `${topbar("Hesap Silme", "Hesabınızı ve verilerinizi silin.", { back: "home" })}
      <div class="content">

        <div class="card p4 mb3" style="background:#FFF3E0;border-color:#FFCC80;">
          <p style="font-size:12px;font-weight:800;color:#E65100;margin:0 0 5px;">🗑️ Hesap ve Veri Silme</p>
          <p class="desc" style="margin:0;font-size:11.5px;color:#EF6C00;line-height:1.55;">
            Nur Diş uygulamasındaki hesabınızı ve kişisel verilerinizi silmek için
            önce giriş yapmanız gerekir.
          </p>
        </div>

        <div class="card p4 mb3">
          <p class="section-label" style="margin:0 0 9px;">Silme hakkında</p>
          <p class="desc" style="margin:0 0 7px;font-size:11.5px;line-height:1.6;">
            KVKK m.7 uyarınca kişisel verilerinizin silinmesini talep etme hakkınız vardır.
            Hesabınızı sildiğinizde:
          </p>
          <p class="desc" style="margin:0 0 4px;font-size:11.5px;line-height:1.6;">• Profil bilgileriniz silinir</p>
          <p class="desc" style="margin:0 0 4px;font-size:11.5px;line-height:1.6;">• Kayıtlı adresleriniz silinir</p>
          <p class="desc" style="margin:0 0 4px;font-size:11.5px;line-height:1.6;">• Hasta portalındaki not ve dosyalarınız silinir</p>
          <p class="desc" style="margin:0 0 4px;font-size:11.5px;line-height:1.6;">• Sadakat puanlarınız silinir</p>
          <p class="desc" style="margin:0 0 0;font-size:11.5px;line-height:1.6;">
            • Sipariş kayıtlarınız <b>anonimleştirilir</b> (ad, telefon ve adres silinir;
            yasal saklama zorunluluğu nedeniyle tutar ve tarih kalır)
          </p>
        </div>

        <button class="btn-primary" style="width:100%;" data-action="goto" data-screen="account">Giriş Yap / Hesap Oluştur</button>

        <div class="card p4 mb3" style="margin-top:14px;">
          <p class="section-label" style="margin:0 0 6px;">Giriş yapamıyor musunuz?</p>
          <p class="desc" style="margin:0 0 10px;font-size:11.5px;line-height:1.55;">
            Hesabınıza erişemiyorsanız silme talebinizi bize yazın; kimlik doğrulaması
            sonrası 30 gün içinde işleme alınır.
          </p>
          <a href="https://wa.me/905051050302?text=${encodeURIComponent("Hesap silme talebi: (ad soyad ve kayıtlı e-posta yazın)")}"
             target="_blank" rel="noopener" class="btn-primary"
             style="display:block;text-align:center;text-decoration:none;font-size:12.5px;padding:10px;">
            💬 WhatsApp'tan Talep Et
          </a>
        </div>
      </div>`;
  }

  /* ---------- İşleniyor ---------- */
  if (adim === "isleniyor") {
    return `${topbar("Hesap Silme", "İşleniyor…", { back: "home" })}
      <div class="content">
        <div class="card p5" style="text-align:center;padding:40px 20px;">
          <p style="font-size:44px;margin:0 0 14px;">⏳</p>
          <p class="name" style="font-size:15px;margin:0 0 6px;">Verileriniz siliniyor</p>
          <p class="desc" style="margin:0;font-size:11.5px;line-height:1.6;">Lütfen bu ekranı kapatmayın.</p>
        </div>
      </div>`;
  }

  /* ---------- Tamamlandı ---------- */
  if (adim === "tamam") {
    return `${topbar("Hesap Silindi", "", { back: "home" })}
      <div class="content">
        <div class="card p5" style="text-align:center;padding:36px 20px;">
          <p style="font-size:48px;margin:0 0 14px;">✅</p>
          <p class="name" style="font-size:16px;margin:0 0 8px;">Hesabınız silindi</p>
          <p class="desc" style="margin:0 0 16px;font-size:12px;line-height:1.65;">
            Kişisel verileriniz sistemlerimizden kaldırıldı.<br/>
            Sipariş kayıtlarınız yasal saklama yükümlülüğü nedeniyle
            anonimleştirildi (ad, telefon ve adres silindi).
          </p>
          <div style="background:var(--bg);border-radius:10px;padding:12px;margin-bottom:16px;text-align:left;">
            <p class="desc" style="margin:0;font-size:11px;line-height:1.7;">
              <b>Silinenler:</b> profil, adresler, notlar, dosyalar, puanlar<br/>
              <b>Anonimleştirilen:</b> sipariş kayıtları<br/>
              <b>Silinme tarihi:</b> ${new Date().toLocaleString("tr-TR")}
            </p>
          </div>
          <button class="btn-primary" style="width:100%;" data-action="goto" data-screen="home">Ana Sayfaya Dön</button>
        </div>
      </div>`;
  }

  /* ---------- Onay adımı ---------- */
  if (adim === "onay") {
    const p = state.userProfile || {};
    const onayMetni = state.silmeOnay || "";
    const dogruMu = silmeOnayGecerliMi(onayMetni);

    return `${topbar("Hesap Silme", "Onay", { back: "hesap-sil" })}
      <div class="content">

        <div class="card p4 mb3" style="background:#FFEBEE;border-color:#EF9A9A;">
          <p style="font-size:13px;font-weight:800;color:#C62828;margin:0 0 6px;">⚠️ Bu işlem geri alınamaz</p>
          <p class="desc" style="margin:0;font-size:11.5px;color:#C62828;line-height:1.55;">
            Hesabınız ve kişisel verileriniz kalıcı olarak silinecek.
            Aynı e-posta ile yeni bir hesap oluşturabilirsiniz ama <b>eski verileriniz geri gelmez.</b>
          </p>
        </div>

        <div class="card p4 mb3">
          <p class="section-label" style="margin:0 0 9px;">Silinecek hesap</p>
          <p class="desc" style="margin:0 0 3px;font-size:12px;">👤 ${escapeHtml(((p.firstName || "") + " " + (p.lastName || "")).trim() || state.user.name || "—")}</p>
          <p class="desc" style="margin:0;font-size:12px;">✉️ ${escapeHtml(state.user.email || "—")}</p>
        </div>

        <div class="card p4 mb3">
          <p class="section-label" style="margin:0 0 9px;">Neler olacak?</p>
          <div style="font-size:11.5px;line-height:1.9;">
            <p style="margin:0;color:#C62828;">🗑️ <b>Silinir:</b> profil, adresler, sağlık notları, dosyalar, puanlar</div>
            <p style="margin:0;color:#E65100;">📄 <b>Anonimleştirilir:</b> sipariş kayıtları (ad, telefon, adres silinir)</p>
            <p style="margin:0;color:#2E7D32;">🔓 <b>Oturumunuz</b> kapatılır</p>
          </div>
        </div>

        <div class="card p4 mb3">
          <p class="section-label" style="margin:0 0 6px;">Onaylamak için <b style="color:#C62828;">SİL</b> yazın</p>
          <input class="input" id="silme-onay" value="${escapeAttr(onayMetni)}"
            placeholder="SİL" autocomplete="off"
            style="font-size:16px;letter-spacing:2px;text-align:center;font-weight:700;text-transform:uppercase;" />
        </div>

        ${state.silmeHata ? `<p class="status-err" style="margin-bottom:10px;">${escapeHtml(state.silmeHata)}</p>` : ""}

        <button class="btn-primary" data-action="silme-uygula" ${dogruMu ? "" : "disabled"}
          style="width:100%;background:${dogruMu ? "#C62828" : "var(--muted)"};">
          🗑️ Hesabımı Kalıcı Olarak Sil
        </button>
        <button class="btn-primary" style="width:100%;margin-top:8px;background:var(--surface);color:var(--ink);border:1px solid var(--line);"
          data-action="silme-iptal">Vazgeç</button>
      </div>`;
  }

  /* ---------- Bilgi adımı ---------- */
  const p = state.userProfile || {};
  const silinecek = (typeof benimSiparislerim === "function") ? benimSiparislerim().length : 0;

  return `${topbar("Hesap ve Veri Silme", "Haklarınız ve süreç", { back: "account" })}
    <div class="content">

      <div class="card p4 mb3" style="background:linear-gradient(135deg,#455A64,#607D8B);color:#fff;border:none;">
        <p style="font-size:13px;font-weight:800;margin:0 0 4px;">🗑️ Hesabımı Sil</p>
        <p style="font-size:11px;opacity:.92;margin:0;line-height:1.55;">
          KVKK m.7 kapsamında kişisel verilerinizin silinmesini talep edebilirsiniz.
        </p>
      </div>

      <div class="card p4 mb3">
        <p class="section-label" style="margin:0 0 9px;">Hesabınız</p>
        <p class="desc" style="margin:0 0 3px;font-size:12px;">👤 ${escapeHtml(((p.firstName || "") + " " + (p.lastName || "")).trim() || state.user.name || "—")}</p>
        <p class="desc" style="margin:0 0 3px;font-size:12px;">✉️ ${escapeHtml(state.user.email || "—")}</p>
        ${silinecek ? `<p class="desc" style="margin:0;font-size:12px;">📦 ${silinecek} sipariş kaydınız var</p>` : ""}
      </div>

      <div class="card p4 mb3">
        <p class="section-label" style="margin:0 0 9px;">Silinecek veriler</p>
        <div style="font-size:11.5px;line-height:1.95;color:var(--ink);">
          <p style="margin:0;">✓ Profil bilgileri (ad, e-posta, telefon, doğum tarihi)</p>
          <p style="margin:0;">✓ Kayıtlı teslimat adresleri</p>
          <p style="margin:0;">✓ Hasta portalı notları ve yüklediğiniz belgeler</p>
          <p style="margin:0;">✓ Sadakat puanları ve puan geçmişi</p>
          <p style="margin:0;">✓ Fırçalama serisi ve rozetler</p>
          <p style="margin:0;">✓ Ürün değerlendirmeleriniz</p>
          <p style="margin:0;">✓ Hesabınız (Firebase Authentication)</p>
        </div>
      </div>

      <div class="card p4 mb3" style="background:#FFF8E8;border-color:#F0DFAF;">
        <p class="section-label" style="margin:0 0 7px;color:#8A6D1D;">Saklanan veriler</p>
        <p class="desc" style="margin:0;font-size:11px;color:#8A6D1D;line-height:1.6;">
          <b>Sipariş ve fatura kayıtları</b> yasal zorunluluk nedeniyle
          (TTK m.82 ve VUK m.253 — 10 yıl saklama) silinemez, ancak
          <b>adınız, telefonunuz ve adresiniz silinir.</b> Kayıtlar anonim hâle getirilir.
        </p>
      </div>

      <div class="card p4 mb3">
        <p class="section-label" style="margin:0 0 7px;">Süreç</p>
        <p class="desc" style="margin:0 0 4px;font-size:11.5px;line-height:1.75;">1. Onay ekranında <b>SİL</b> yazıp onaylarsınız</p>
        <p class="desc" style="margin:0 0 4px;font-size:11.5px;line-height:1.75;">2. Verileriniz <b>anında</b> silinir</p>
        <p class="desc" style="margin:0;font-size:11.5px;line-height:1.75;">3. Oturumunuz kapatılır</p>
      </div>

      <button class="btn-primary" data-action="silme-basla"
        style="width:100%;background:#C62828;">
        Hesabımı Silmek İstiyorum
      </button>
      <button class="btn-primary" style="width:100%;margin-top:8px;background:var(--surface);color:var(--ink);border:1px solid var(--line);"
        data-action="goto" data-screen="account">Vazgeç</button>
    </div>`;
}

/* ---------------------------------------------------------------------
   SİLME İŞLEMİ
   --------------------------------------------------------------------- */

async function hesapSil() {
  const uid = state.user && state.user.uid;
  if (!uid) return { ok: false, error: "Giriş yapılmış hesap bulunamadı." };

  const sonuc = { silinen: [], anonim: 0, hatalar: [] };

  try {
    /* 1) Hasta portalı not ve dosyaları */
    if (window.fb) {
      if (window.fb.silKullaniciVerileri) {
        const r = await window.fb.silKullaniciVerileri(uid).catch(e => ({ hata: String(e) }));
        if (r && r.hata) sonuc.hatalar.push("Sunucu verileri: " + r.hata);
        else if (r && r.silinen) sonuc.silinen.push(...r.silinen);
      }
    }

    /* 2) Siparişleri anonimleştir (yasal saklama) */
    const siparisler = (state.orders || []).filter(o => o.uid === uid);
    for (const o of siparisler) {
      try {
        if (window.fb && window.fb.anonimlestirSiparis) {
          await window.fb.anonimlestirSiparis(o.id);
          sonuc.anonim++;
        }
      } catch (e) {
        sonuc.hatalar.push("Sipariş: " + (e && e.message));
      }
    }

    /* 3) Yerel (cihazdaki) veriler */
    const yerelAnahtarlar = [
      "nurdis_profile", "nurdis_user_profile", "nurdis_family_members",
      "nurdis_badges", "nurdis_brush_streak", "nurdis_last_brush",
      "nurdis_adresler_" + uid, "nurdis_puan_" + uid,
      "nurdis_orders_cache", "nurdis_patient_notes", "nurdis_patient_files",
      "nurdis_kullanilan_kupon"
    ];
    yerelAnahtarlar.forEach(k => { try { localStorage.removeItem(k); } catch (e) {} });

    /* 4) Firebase Auth hesabını sil */
    if (window.fb && window.fb.hesapSilAuth) {
      const r = await window.fb.hesapSilAuth();
      if (!r.ok) sonuc.hatalar.push("Hesap kapatma: " + (r.error || "bilinmeyen"));
    }

    /* 5) Uygulama durumunu temizle */
    state.user = null;
    state.userProfile = null;
    state.orders = [];
    state.cart = {};
    state.hesapSekme = "siparisler";

    return { ok: true, sonuc };
  } catch (e) {
    return { ok: false, error: e && e.message ? e.message : "Bilinmeyen hata", sonuc };
  }
}

/* ---------------------------------------------------------------------
   OLAYLAR
   --------------------------------------------------------------------- */

function hesapSilAction(el, action) {
  if (action === "silme-basla") {
    state.silmeAdim = "onay";
    state.silmeOnay = "";
    state.silmeHata = "";
    render();
    window.scrollTo(0, 0);
    return true;
  }

  if (action === "silme-iptal") {
    state.silmeAdim = "bilgi";
    state.silmeOnay = "";
    state.silmeHata = "";
    state.screen = "account";
    render();
    return true;
  }

  if (action === "silme-uygula") {
    const onay = (document.getElementById("silme-onay")?.value || "");
    if (!silmeOnayGecerliMi(onay)) {
      state.silmeHata = "Onaylamak için büyük harflerle SİL yazmalısınız.";
      render();
      return true;
    }
    if (!confirm("SON ONAY\n\nHesabınız ve tüm kişisel verileriniz kalıcı olarak silinecek.\n\nBu işlem GERİ ALINAMAZ. Devam edilsin mi?")) return true;

    state.silmeAdim = "isleniyor";
    state.silmeHata = "";
    render();

    hesapSil().then((r) => {
      if (r.ok) {
        state.silmeAdim = "tamam";
        if (typeof showNotif === "function") showNotif("Hesabınız silindi", "Kişisel verileriniz kaldırıldı.");
      } else {
        state.silmeAdim = "onay";
        state.silmeHata = "Silme işlemi tamamlanamadı: " + (r.error || "bilinmeyen") +
          "\n\nLütfen tekrar deneyin veya bizimle iletişime geçin.";
      }
      render();
      window.scrollTo(0, 0);
    });
    return true;
  }

  return false;
}
