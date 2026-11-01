/* =========================================================
   NUR DİŞ — FIREBASE — bağlantı, bildirim, senkron, yedekleme
   app.js'ten bölündü · index.html yükleme sırası önemli
========================================================= */

/* ---------------- FIREBASE BAĞLANTISI ---------------- */
/* firebase-init.js (bir ES module) yüklenip window.fb hazır olunca
   "fb-ready" olayını fırlatır. O ana kadar app.js zaten localStorage
   yedeğiyle çalışabilir durumda olur. */

let unsubReviews = null, unsubProducts = null, unsubAppointments = null, unsubOrders = null;

/* ============ BİLDİRİM SİSTEMİ ============ */
let _notifFirstLoad = { reviews: true, appointments: true, orders: true };

function requestNotifPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}

function showNotif(title, body, sesTipi) {
  // Sesli uyarı
  try {
    if (typeof playSound === "function") playSound(sesTipi || "notif");
  } catch (e) {}

  // Sayfa bildirim (her zaman çalışır)
  _showInAppNotif(title, body);

  // Browser bildirimi (izin gerekli)
  if ("Notification" in window && Notification.permission === "granted") {
    try {
      const n = new Notification(title, { body, icon: "./icon-192.png", badge: "./icon-192.png", tag: "nurdis-" + Date.now(), renotify: true });
      n.onclick = () => { window.focus(); n.close(); };
      setTimeout(() => { try { n.close(); } catch (e) {} }, 12000);
    } catch (e) {}
  }

  // Titreşim (mobil)
  try { if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 200]); } catch (e) {}
}

/* Sekme başlığını yanıp söndür (masaüstünde dikkat çeker) */
let _baslikTimer = null;
function _baslikYanipSonsun() {
  if (_baslikTimer) return;
  const orj = document.title;
  let n = 0;
  _baslikTimer = setInterval(() => {
    document.title = (n % 2 === 0) ? "🔔 YENİ RANDEVU!" : orj;
    n++;
    if (n >= 12) { clearInterval(_baslikTimer); _baslikTimer = null; document.title = orj; }
  }, 700);
  // Sekmeye dönünce durdur
  const durdur = () => { if (_baslikTimer) { clearInterval(_baslikTimer); _baslikTimer = null; } document.title = orj; document.removeEventListener("visibilitychange", durdur); };
  document.addEventListener("visibilitychange", () => { if (!document.hidden) durdur(); });
  setTimeout(durdur, 12000);
}

function _showInAppNotif(title, body) {
  const el = document.createElement("div");
  el.className = "in-app-notif";
  el.innerHTML = `<b>${escapeHtml(title)}</b><br><span>${escapeHtml(body)}</span>`;
  document.body.appendChild(el);
  setTimeout(() => el.classList.add("show"), 50);
  setTimeout(() => { el.classList.remove("show"); setTimeout(() => el.remove(), 400); }, 5000);
}

/* ============ HATIRLATMA PLANLAMA ============ */
let _brushReminderInterval = null;
let _checkupTimeout = null;

function scheduleBrushReminder(time) {
  if (_brushReminderInterval) clearInterval(_brushReminderInterval);
  if (!state.userProfile?.notificationsEnabled) return;
  
  const [hours, minutes] = time.split(":").map(Number);
  
  _brushReminderInterval = setInterval(() => {
    const now = new Date();
    if (now.getHours() === hours && now.getMinutes() === minutes && now.getSeconds() < 2) {
      if (state.lastBrushDate !== now.toDateString()) {
        showNotif("🪥 Diş Fırçalama Zamanı!", "Dişlerini fırçalamayı unutma! 🔥 Serini koru!");
      }
    }
  }, 1000);
}

function scheduleCheckupReminder() {
  if (_checkupTimeout) clearTimeout(_checkupTimeout);
  if (!state.userProfile?.notificationsEnabled || !state.userProfile?.lastCheckup) return;
  
  const lastCheckup = new Date(state.userProfile.lastCheckup);
  const nextCheckup = new Date(lastCheckup.getTime() + 180*24*60*60*1000);
  const msUntilReminder = nextCheckup.getTime() - Date.now();
  
  // Eğer hatırlatma zamanı geçmişse hemen bildir
  if (msUntilReminder <= 0) {
    showNotif("🏥 Diş Kontrolü Zamanı!", "6 aylık diş kontrolünüz geldi. Randevu almayı unutmayın!");
    return;
  }
  
  // Makul bir zaman aşımı (max 24 saat = 86400000ms)
  if (msUntilReminder <= 86400000) {
    _checkupTimeout = setTimeout(() => {
      showNotif("🏥 Diş Kontrolü Zamanı!", "6 aylık diş kontrolünüz geldi. Randevu almayı unutmayın!");
    }, msUntilReminder);
  }
}

function loadUserProfile() {
  try {
    const saved = localStorage.getItem("nurdis_user_profile");
    if (saved) state.userProfile = JSON.parse(saved);
  } catch(e) {}
  try {
    state.brushStreak = parseInt(localStorage.getItem("nurdis_brush_streak") || "0");
    state.lastBrushDate = localStorage.getItem("nurdis_last_brush") || null;
  } catch(e) {}
  try {
    state.familyMembers = JSON.parse(localStorage.getItem("nurdis_family_members") || "[]");
  } catch(e) { state.familyMembers = []; }
  try {
    state.badges = JSON.parse(localStorage.getItem("nurdis_badges") || "[]");
  } catch(e) { state.badges = []; }
  
  // Streak kontrolü - eğer son fırçalama dün değilse ve bugün de değilse seri kırılmış
  if (state.lastBrushDate) {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (state.lastBrushDate !== today && state.lastBrushDate !== yesterday) {
      state.brushStreak = 0;
      localStorage.setItem("nurdis_brush_streak", "0");
    }
  }
  
  // Günlük ipucu seç
  pickDailyTip();

  // Hatırlatmaları planla
  if (state.userProfile?.brushReminderTime) {
    scheduleBrushReminder(state.userProfile.brushReminderTime);
  }
  if (state.userProfile?.lastCheckup) {
    scheduleCheckupReminder();
  }
}

function pickDailyTip() {
  // Firebase'den gelen ipuçları varsa onları kullan, yoksa varsayılanları
  const tips = (state.healthTips && state.healthTips.length > 0) 
    ? state.healthTips.map(t => t.text || t)
    : DEFAULT_HEALTH_TIPS;
  // Bugünün tarihine göre deterministik seçim (her gün aynı ipucu)
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  state.dailyTip = tips[dayOfYear % tips.length] || "";
}

/* ============ ROZET SİSTEMİ ============ */
function checkBadges() {
  if (!state.badges) state.badges = [];
  let newBadge = null;

  const addBadge = (id) => {
    if (!state.badges.includes(id)) {
      state.badges.push(id);
      const def = BADGE_DEFS.find(b => b.id === id);
      if (def) {
        newBadge = def;
        showNotif("🏆 Yeni Rozet!", `${def.icon} ${def.name} — ${def.desc}`);
      }
    }
  };

  // Yorum rozeti
  if (state.reviews.some(r => r.uid === state.user?.uid)) addBadge("first_review");

  // Randevu rozeti
  if (state.appointments.some(a => a.uid === state.user?.uid)) addBadge("first_appointment");

  // Streak rozetleri
  if (state.brushStreak >= 7) addBadge("7_day_streak");
  if (state.brushStreak >= 14) addBadge("14_day_streak");
  if (state.brushStreak >= 30) addBadge("30_day_streak");
  if (state.brushStreak >= 60) addBadge("60_day_streak");
  if (state.brushStreak >= 100) addBadge("100_day_streak");
  if (state.brushStreak >= 365) addBadge("365_day_streak");

  // Aile rozeti
  if ((state.familyMembers || []).length > 0) addBadge("family_member");

  // Tam profil rozeti
  const p = state.userProfile || {};
  if (p.firstName && p.lastName && p.age && p.weight && p.height) addBadge("profile_complete");

  // Kaydet
  localStorage.setItem("nurdis_badges", JSON.stringify(state.badges));
  if (window.fb && state.fbReady && state.user) {
    window.fb.saveUserProfile(state.user.uid, { ...state.userProfile, badges: state.badges, familyMembers: state.familyMembers }).catch(() => {});
  }
}

// Firebase'e accounting verilerini kaydet
// NOT: Doktor fotoğrafı / diploma / ürün görseli gibi base64 medyalar
// settings/accounting içine KONMAZ — ayrı dokümanlara gider. Sebep:
// Firestore 1 MB doküman limiti; medya gömülünce limit aşılıp tüm
// bulut senkronu sessizce duruyordu.
// Alan adları: doktor → foto + diplomalar[], ürün → gorsel
const _medyaCache = {};
const _b64 = (s) => typeof s === "string" && s.indexOf("data:") === 0;

function _medyaYaz(tur, id, icerik) {
  if (!(window.fb && window.fb.saveMedya) || !id) return null;
  const anahtar = tur + "_" + id;
  const json = JSON.stringify(icerik);
  if (_medyaCache[anahtar] === json) return null;   // değişmedi → gereksiz yazma yok
  _medyaCache[anahtar] = json;
  return window.fb.saveMedya(tur, id, icerik).catch(() => {});
}

/* Ana dokümana gidecek hafif kopyayı üret (medya boşaltılmış) */
function _doktorHafif(d) {
  const fotoB64 = _b64(d.foto);
  const diplomaVar = (d.diplomalar || []).some(x => _b64(x && x.dataUrl));
  if (!fotoB64 && !diplomaVar) return { hafif: d, medya: null };   // yol/boş → ayrım gerekmez

  const hafif = { ...d };
  if (fotoB64) hafif.foto = "";
  if (diplomaVar) {
    hafif.diplomalar = (d.diplomalar || []).map(x => ({ ...x, dataUrl: "" }));
  }
  const medya = {};
  if (fotoB64) medya.foto = d.foto;
  if (diplomaVar) medya.diplomalar = d.diplomalar;
  return { hafif, medya };
}

function _urunHafif(p) {
  const gorselB64 = _b64(p.gorsel);
  if (!gorselB64) return { hafif: p, medya: null };
  return { hafif: { ...p, gorsel: "" }, medya: { gorsel: p.gorsel } };
}

function saveAccountingToFirebase() {
  if (window.fb && window.fb.saveAccountingData) {
    const doktorlar = state.doctors || [];
    const urunler = state.products || [];

    const dHafif = doktorlar.map(d => {
      const r = _doktorHafif(d);
      if (r.medya) _medyaYaz("doktor", d.id, r.medya);
      return r.hafif;
    });
    const uHafif = urunler.map(p => {
      const r = _urunHafif(p);
      if (r.medya) _medyaYaz("urun", p.id, r.medya);
      return r.hafif;
    });

    // Ana dokümana medyasız hâlini gönder
    return window.fb.saveAccountingData({
      accounting: state.accounting,
      treatmentPrices: state.treatmentPrices,
      autoExpenses: state.autoExpenses,
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
      bonusAyar: state.bonusAyar || null,
      kvkkTalepler: (state.kvkkTalepler || []).slice(0, 200),
      products: uHafif,
      doctors: dHafif
    });
  }
  return Promise.resolve();
}

// Buluttaki medya dokümanlarını yerel doktor/ürün kayıtlarıyla birleştir
function medyaBirlestir() {
  if (!(window.fb && window.fb.loadMedya)) return Promise.resolve();
  const ds = state.doctors || [];
  const ps = state.products || [];
  if (!ds.length && !ps.length) return Promise.resolve();

  const isler = [];
  ds.forEach(d => {
    isler.push(window.fb.loadMedya("doktor", d.id).then(s => {
      if (!(s && s.exists())) return;
      const m = s.data() || {};
      if (!d.foto && m.foto) d.foto = m.foto;                       // yerelde yoksa buluttan al
      if ((m.diplomalar || []).length) {
        const yerel = d.diplomalar || [];
        d.diplomalar = (m.diplomalar || []).map((x, i) => {
          // yereldeki dataUrl varsa onu koru, yoksa buluttakini kullan
          const y = yerel[i] || {};
          return { ...x, dataUrl: (y.dataUrl || x.dataUrl || "") };
        });
      }
    }).catch(() => {}));
  });
  ps.forEach(p => {
    isler.push(window.fb.loadMedya("urun", p.id).then(s => {
      if (!(s && s.exists())) return;
      const m = s.data() || {};
      if (!p.gorsel && m.gorsel) p.gorsel = m.gorsel;
    }).catch(() => {}));
  });

  return Promise.all(isler).then(() => {
    try {
      localStorage.setItem("nurdis_doctors", JSON.stringify(state.doctors || []));
      localStorage.setItem("nurdis_products", JSON.stringify(state.products || []));
    } catch (e) {}
    render();
  });
}

function wireFirebase() {
  if (!window.fb || !window.fb.ready) return;
  state.fbReady = true;

  window.fb.onAuthChange((user) => {
    state.user = user;
    if (user) {
      // Kullanıcı giriş yaptı - profilini yükle
      window.fb.loadUserProfile(user.uid).then(profile => {
        if (profile) {
          state.userProfile = profile;
          localStorage.setItem("nurdis_user_profile", JSON.stringify(profile));
          if (profile.brushReminderTime) scheduleBrushReminder(profile.brushReminderTime);
          if (profile.lastCheckup) scheduleCheckupReminder();
        }
        render();
      }).catch(() => {});
      window.fb.loadBrushStreak(user.uid).then(data => {
        if (data) {
          state.brushStreak = data.streak || 0;
          state.lastBrushDate = data.lastDate || null;
          localStorage.setItem("nurdis_brush_streak", state.brushStreak);
          localStorage.setItem("nurdis_last_brush", state.lastBrushDate || "");
        }
        render();
      }).catch(() => {});
    } else {
      state.userProfile = null;
    }
    render();
  });

  // Herkese açık, gerçek zamanlı veriler:
  unsubReviews = window.fb.subscribeReviews((items) => {
    // Bildirim: yeni yorum geldi mi kontrol et
    if (!_notifFirstLoad.reviews && items.length > state.reviews.length) {
      const yeni = items.find(i => !state.reviews.some(r => r.id === i.id));
      if (yeni) showNotif("⭐ Yeni Yorum!", `${yeni.name}: "${(yeni.text||"").substring(0,60)}..."`);
    }
    _notifFirstLoad.reviews = false;
    state.reviews = items; render();
  });
  
  // Engellenen kullanıcıları Firebase'den yükle
  if (window.fb.subscribeBlockedUsers) {
    window.fb.subscribeBlockedUsers((blocked) => {
      state.blockedUsers = blocked;
      localStorage.setItem("nurdis_blocked_users", JSON.stringify(blocked));
      render();
    });
  }
  
  // Sosyal medya linklerini Firebase'den yükle
  if (window.fb.subscribeSocialMedia) {
    window.fb.subscribeSocialMedia((social) => {
      state.socialMedia = social;
      localStorage.setItem("nurdis_social_media", JSON.stringify(social));
      render();
    });
  }
  unsubProducts = window.fb.subscribeProducts((items) => { state.customProducts = items; render(); });
  window.fb.subscribeServiceVideos((map) => { state.serviceVideos = map; render(); });
  window.fb.subscribeDeviceVideos((map) => { state.deviceVideos = map; render(); });
  window.fb.subscribeProductImages((map) => { state.productImages = map; render(); });

  // Bildirim izni iste
  requestNotifPermission();

  // Kullanıcı profilini Firebase'den yükle
  if (state.user) {
    window.fb.loadUserProfile(state.user.uid).then(profile => {
      if (profile) {
        state.userProfile = profile;
        localStorage.setItem("nurdis_user_profile", JSON.stringify(profile));
        // Hatırlatmaları yeniden planla
        if (profile.brushReminderTime) scheduleBrushReminder(profile.brushReminderTime);
        if (profile.lastCheckup) scheduleCheckupReminder();
        render();
      }
    }).catch(() => {});
    window.fb.loadBrushStreak(state.user.uid).then(data => {
      if (data) {
        state.brushStreak = data.streak || 0;
        state.lastBrushDate = data.lastDate || null;
        localStorage.setItem("nurdis_brush_streak", state.brushStreak);
        localStorage.setItem("nurdis_last_brush", state.lastBrushDate || "");
        render();
      }
    }).catch(() => {});
  }

  // Brushing video URL'sini yükle (herkes için)
  window.fb.subscribeBrushingVideo((url) => {
    state.brushingVideoUrl = url || "";
    render();
  });

  // Hasta portalı — dosyalar ve notlar
  if (window.fb.subscribePatientFiles) {
    window.fb.subscribePatientFiles((items) => {
      state.patientFiles = items;
      render();
    });
  }
  if (window.fb.subscribePatientNotes) {
    window.fb.subscribePatientNotes((items) => {
      state.patientNotes = items;
      render();
    });
  }

  // Sağlık ipuçlarını yükle
  window.fb.subscribeHealthTips((tips) => {
    state.healthTips = tips;
    pickDailyTip();
    render();
  });

  // Duyuruları yükle
  if (window.fb.subscribeAnnouncements) {
    window.fb.subscribeAnnouncements((announcements) => {
      const prevCount = (state.announcements || []).length;
      state.announcements = announcements;
      // Yeni duyuru geldiğinde bildirim göster
      if (announcements.length > prevCount && prevCount > 0) {
        const newest = announcements[0];
        if (newest) {
          showNotif("📢 Yeni Duyuru!", newest.title || "Yeni bir duyuru yayınlandı");
        }
      }
      render();
    });
  }

  // Kullanıcı tedavilerini yükle (admin ekler)
  if (window.fb.subscribeTreatments) {
    window.fb.subscribeTreatments((treatments) => {
      state.treatments = treatments;
      render();
    });
  }

  render();
}

function startAdminSubscriptions() {
  if (!window.fb || !state.fbReady) return;
  unsubAppointments = window.fb.subscribeAppointments((items) => {
    // Bildirim: yeni randevu
    if (!_notifFirstLoad.appointments && items.length > state.appointments.length) {
      const yeni = items.find(i => !state.appointments.some(r => r.id === i.id));
      if (yeni) {
        showNotif("📅 YENİ RANDEVU!", `${yeni.name} — ${yeni.date || ""} ${yeni.time || ""}${yeni.phone ? " · " + yeni.phone : ""}`, "appointment");
        // Masaüstü başlığı da yanıp sönsün
        _baslikYanipSonsun();
      }
    }
    _notifFirstLoad.appointments = false;
    state.appointments = items; render();
  });
  unsubOrders = window.fb.subscribeOrders((items) => {
    // Bildirim: yeni sipariş
    if (!_notifFirstLoad.orders && items.length > state.orders.length) {
      const yeni = items.find(i => !state.orders.some(r => r.id === i.id));
      if (yeni) showNotif("📦 Yeni Sipariş!", `${yeni.name} — ${yeni.total||0} ₺`);
    }
    _notifFirstLoad.orders = false;
    state.orders = items; render();
  });

  // Firebase'den accounting verilerini yükle
  if (window.fb.loadAccountingData) {
    window.fb.loadAccountingData().then(docSnap => {
      if (docSnap.exists()) {
        const data = docSnap.data();

        /* KORUMA: Buluttaki veri tamamen boşsa ve yerelde veri varsa, yerel veriyi koru.
           (Geri yükleme sonrası bulut henüz güncellenmemişse veri kaybını önler) */
        const bulutBos = !(data.accounting && ((data.accounting.incomes||[]).length || (data.accounting.expenses||[]).length))
                       && !(data.personnel && data.personnel.length)
                       && !(data.stok && data.stok.length);
        const yerelVar = (() => {
          try {
            const a = JSON.parse(localStorage.getItem("nurdis_accounting") || "{}");
            const p = JSON.parse(localStorage.getItem("nurdis_personnel") || "[]");
            return ((a.incomes||[]).length + (a.expenses||[]).length) > 0 || p.length > 0;
          } catch (e) { return false; }
        })();

        if (bulutBos && yerelVar) {
          console.warn("Bulut boş, yerel veri korunuyor. Yerel veri buluta gönderiliyor.");
          try { saveAccountingToFirebase(); } catch (e) {}
          medyaBirlestir();   // yereldeki doktor/ürün görselleri buluttan tamamlanır
          return;   // yerel veriyi EZME
        }

        if (data.accounting) state.accounting = data.accounting;
        if (data.treatmentPrices) state.treatmentPrices = data.treatmentPrices;
        if (data.autoExpenses) state.autoExpenses = data.autoExpenses;
        if (data.treatments) state.treatments = data.treatments;
        if (data.personnel) { state.personnel = data.personnel; localStorage.setItem("nurdis_personnel", JSON.stringify(state.personnel)); }
        if (data.sgkSettings) { state.sgkSettings = data.sgkSettings; localStorage.setItem("nurdis_sgk_settings", JSON.stringify(state.sgkSettings)); }
        if (data.demirbaslar) { state.demirbaslar = data.demirbaslar; localStorage.setItem("nurdis_demirbaslar", JSON.stringify(state.demirbaslar)); }
        if (data.accTamamlanan) { state.accTamamlanan = data.accTamamlanan; localStorage.setItem("nurdis_beyan_tamam", JSON.stringify(state.accTamamlanan)); }
        if (data.firmaBilgi) { state.firmaBilgi = data.firmaBilgi; localStorage.setItem("nurdis_firma_bilgi", JSON.stringify(state.firmaBilgi)); }
        if (data.stok) { state.stok = data.stok; localStorage.setItem("nurdis_stok", JSON.stringify(state.stok)); }
        if (data.stokHareket) { state.stokHareket = data.stokHareket; localStorage.setItem("nurdis_stok_hareket", JSON.stringify(state.stokHareket)); }
        if (data.tedaviMalzeme) { state.tedaviMalzeme = data.tedaviMalzeme; localStorage.setItem("nurdis_tedavi_malzeme", JSON.stringify(state.tedaviMalzeme)); }
        if (data.kampanyalar) { state.kampanyalar = data.kampanyalar; localStorage.setItem("nurdis_kampanyalar", JSON.stringify(state.kampanyalar)); }
        if (data.hhAyar) { state.hhAyar = data.hhAyar; localStorage.setItem("nurdis_hh_ayar", JSON.stringify(state.hhAyar)); }
        if (data.mesajSablon) { state.mesajSablon = data.mesajSablon; localStorage.setItem("nurdis_mesaj_sablon", JSON.stringify(state.mesajSablon)); }
        if (data.konumAyar) { state.konumAyar = data.konumAyar; localStorage.setItem("nurdis_konum_ayar", JSON.stringify(state.konumAyar)); }
        if (data.randevuSablon) { state.randevuSablon = data.randevuSablon; localStorage.setItem("nurdis_randevu_sablon", JSON.stringify(state.randevuSablon)); }
        if (data.anketler) { state.anketler = data.anketler; localStorage.setItem("nurdis_anketler", JSON.stringify(state.anketler)); }
        if (data.anketSablon) { state.anketSablon = data.anketSablon; localStorage.setItem("nurdis_anket_sablon", JSON.stringify(state.anketSablon)); }
        if (data.bonusAyar) { state.bonusAyar = data.bonusAyar; localStorage.setItem("nurdis_bonus_ayar", JSON.stringify(state.bonusAyar)); }
        if (data.kvkkTalepler) { state.kvkkTalepler = data.kvkkTalepler; localStorage.setItem("nurdis_kvkk_talepler", JSON.stringify(state.kvkkTalepler)); }
        if (data.products && data.products.length && !(state.products || []).length) { state.products = data.products; localStorage.setItem("nurdis_products", JSON.stringify(state.products)); }
        if (data.doctors && data.doctors.length && !(state.doctors || []).length) { state.doctors = data.doctors; localStorage.setItem("nurdis_doctors", JSON.stringify(state.doctors)); }
        localStorage.setItem("nurdis_accounting", JSON.stringify(state.accounting));
        localStorage.setItem("nurdis_treatment_prices", JSON.stringify(state.treatmentPrices));
        localStorage.setItem("nurdis_auto_expenses", JSON.stringify(state.autoExpenses));
        if (data.treatments) localStorage.setItem("nurdis_treatments_local", JSON.stringify(data.treatments));
        render();
        // Doktor fotoğrafı / diploma / ürün görselleri ayrı dokümanlardan çekilip birleştirilir
        medyaBirlestir();
      }
    }).catch(() => {});
  }
}

function stopAdminSubscriptions() {
  if (unsubAppointments) { unsubAppointments(); unsubAppointments = null; }
  if (unsubOrders) { unsubOrders(); unsubOrders = null; }
  state.appointments = []; state.orders = [];
}

window.addEventListener("fb-ready", wireFirebase);
// firebase-init.js modülü app.js'ten önce yüklenip olayı kaçırmış olabilir ihtimaline karşı:
if (window.fb && window.fb.ready) wireFirebase();

/* ---------------- SES EFEKTLERİ ----------------
   Dışarıdan ses dosyası yüklemeden, Web Audio API ile anlık
   üretilen kısa efektler. İlk çalma bir kullanıcı etkileşimi
   (tıklama) içinden tetiklenmeli — tarayıcı kuralı budur, tüm
   playSound() çağrılarımız zaten click handler'ları içinde. */
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function tone(ctx, freq, start, dur, type="sine", peakGain=0.09) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
  gain.gain.setValueAtTime(0, ctx.currentTime + start);
  gain.gain.linearRampToValueAtTime(peakGain, ctx.currentTime + start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + dur);
  osc.connect(gain); gain.connect(ctx.destination);
  osc.start(ctx.currentTime + start);
  osc.stop(ctx.currentTime + start + dur + 0.02);
}

function playSound(kind) {
  if (state.settings && state.settings.muted) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    if (kind === "click") {
      tone(ctx, 720, 0, 0.05, "sine", 0.05);
    } else if (kind === "success") {
      // "healing" tarzı yükselen üçlü — oyunlardaki can yenileme sesi gibi
      tone(ctx, 523.25, 0.00, 0.16, "sine", 0.08);   // Do
      tone(ctx, 659.25, 0.08, 0.16, "sine", 0.08);   // Mi
      tone(ctx, 783.99, 0.16, 0.28, "sine", 0.09);   // Sol
    } else if (kind === "appointment") {
      // Yeni randevu zili — dikkat çekici, tekrarlı (2 kez)
      [0, 0.55].forEach(gecikme => {
        tone(ctx, 880.00, gecikme + 0.00, 0.12, "sine", 0.13);   // La5
        tone(ctx, 1108.73, gecikme + 0.12, 0.12, "sine", 0.13);  // Do#6
        tone(ctx, 880.00, gecikme + 0.24, 0.12, "sine", 0.12);   // La5
        tone(ctx, 1318.51, gecikme + 0.36, 0.22, "sine", 0.11);  // Mi6
      });
    } else if (kind === "notif") {
      // Kısa bildirim sesi
      tone(ctx, 1046.50, 0.00, 0.10, "sine", 0.10);
      tone(ctx, 1396.91, 0.10, 0.18, "sine", 0.09);
    } else if (kind === "error") {
      tone(ctx, 300, 0.00, 0.16, "sawtooth", 0.05);
      tone(ctx, 220, 0.10, 0.22, "sawtooth", 0.05);
    } else if (kind === "login") {
      tone(ctx, 440.00, 0.00, 0.14, "sine", 0.07);
      tone(ctx, 554.37, 0.07, 0.14, "sine", 0.07);
      tone(ctx, 659.25, 0.14, 0.30, "sine", 0.08);
    }
  } catch (e) { /* ses çalınamazsa sessizce geç */ }
}


/* SCREEN_MAP — tüm render fonksiyonları tanımlandıktan sonra */
const SCREEN_MAP = {
  home: renderHome, services: renderServices, doctors: renderDoctors, devices: renderDevices,
  "dentist-game": renderDentistGame,
  smile: renderSmile,
  reviews: renderReviews, booking: renderBooking, store: renderStore,
  address: renderAddress, contact: renderContact, info: renderInfo, chatbot: renderChatbot,
  "admin-login": renderAdminLogin, "admin-panel": renderAdminPanel, account: renderAccount,
  "profile-edit": renderProfileEdit, "brushing-video": renderBrushingVideo, "family-add": renderFamilyAdd,
  settings: renderSettings, kvkk: renderKvkk, portal: renderPortal, "magaza-urun": renderMagazaUrun, "doktor-detay": renderDoktorDetay, fircalama: renderFircalama,
};

const validScreens = Object.keys(SCREEN_MAP);
const hash = window.location.hash.replace("#","");
if (validScreens.includes(hash)) state.screen = hash;
history.replaceState({ screen: state.screen }, "", "#" + state.screen);
render();

/* Otomatik yedek hatırlatması — günde bir kez, 5 sn sonra */
setTimeout(() => {
  try { if (typeof yedekHatirlatmaKontrol === "function") yedekHatirlatmaKontrol(); } catch (e) {}
}, 5000);

/* Senkron kuyruğunu otomatik başlat */
setTimeout(() => {
  try { if (typeof kuyrukOtomatikBaslat === "function") kuyrukOtomatikBaslat(); } catch (e) {}
}, 3000);

/* Android/tarayıcı GERİ tuşu: uygulamadan çıkmak yerine önceki ekrana dönsün.
   Zaten "home" ekranındaysak ve geri basılırsa, tarayıcının/uygulamanın
   normal davranışına (gerçekten çıkış) izin veriyoruz. */
window.addEventListener("popstate", (event) => {
  const target = (event.state && event.state.screen) || "home";
  if (target === state.screen) return;
  state.screen = target;
  state.moreOpen = false;
  render();
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => { navigator.serviceWorker.register("sw.js").catch(()=>{}); });
  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data && event.data.type === "NURDIS_UPDATED") {
      state.updateAvailable = true;
      render();
    }
  });
}

/* Dişini Tasarla - yeni kod entegrasyonu bekleniyor */




/* ============ GÜLÜŞ STİLİNİ TASARLA - Apiframe GPT Image 2 ============ */
let _gsPhotoBase64 = null;
let _gsSelectedStyle = 'hollywood';

const SMILE_PROMPTS = {
  hollywood: 'Give a Hollywood smile: slightly prominent upper front teeth, golden ratio, perfect symmetry, bright white celebrity-like dazzling teeth.',
  inci: 'Give a pearl-like smile: teeth smaller, rounded, evenly aligned like pearls with warm natural white shade.',
  iri: 'Give larger, fuller teeth creating a powerful attractive bold smile.',
  kopek: 'Slightly elongate and sharpen the canine teeth for a characterful prominent look.',
  lamine: 'Apply thin porcelain veneer shells bonded to the front of teeth for a refined elegant smile.',
  kompozit: 'Apply composite veneers for aesthetic corrections with minimal preparation, natural looking.',
  metal: 'Apply metal-backed porcelain crowns with slightly reduced light translucency.',
  implant: 'Fill missing tooth gaps with natural-looking dental implant ceramic crowns.',
  dislek: 'Make the two upper front teeth slightly protrude outward and appear longer, rabbit-like.',
  ortodonti: 'Add realistic orthodontic braces (dental braces / diş teli) to both upper and lower teeth. Each tooth should have a small square metal bracket bonded to its front surface. A thin horizontal metal archwire should connect all brackets on the upper arch and another on the lower arch. Keep the natural tooth color and shape — only add the metal brackets and archwire on top. Make it look like a real orthodontic treatment in progress.'
};




/* ============ 🎮 KÜÇÜK DİŞ DOKTORU OYUNU v2 - 3D Görsel ============ */
const GAME_PATIENTS = [
  { id:1, emoji:"🐻", name:"Ayıcık", color:"#8B4513", complaint:"Çok tatlı yedim, dişim sızlıyor...", problem:"cavity", problemLabel:"Çürük", treatment:"Dolgu", tool:"drill", toolEmoji:"🔧" },
  { id:2, emoji:"🐰", name:"Tavşancık", color:"#FFB6C1", complaint:"Havuç kemirirken dişim kırıldı!", problem:"broken", problemLabel:"Kırık Diş", treatment:"Kaplama", tool:"crown", toolEmoji:"👑" },
  { id:3, emoji:"🐱", name:"Kedicik", color:"#FFA500", complaint:"Dişlerim sarardı, beyazlatmak istiyorum!", problem:"yellow", problemLabel:"Sararma", treatment:"Beyazlatma", tool:"whitening", toolEmoji:"💡" },
  { id:4, emoji:"🐶", name:"Köpecik", color:"#D2691E", complaint:"Diş etim şişti, çok ağrıyor!", problem:"abscess", problemLabel:"Apse", treatment:"Kanal Tedavisi", tool:"rootcanal", toolEmoji:"💉" },
  { id:5, emoji:"🦊", name:"Tilkicik", color:"#FF4500", complaint:"Dişlerimde taşlar birikti!", problem:"tartar", problemLabel:"Diş Taşı", treatment:"Temizlik", tool:"scaler", toolEmoji:"🪥" },
];

const GAME_TOOLS_ALL = [
  { id:"drill", emoji:"🔧", name:"Matkap + Dolgu" },
  { id:"crown", emoji:"👑", name:"Kaplama" },
  { id:"whitening", emoji:"💡", name:"LED + Jel" },
  { id:"rootcanal", emoji:"💉", name:"Kanal Aleti" },
  { id:"scaler", emoji:"🪥", name:"Skaler" },
  { id:"brush", emoji:"🪥", name:"Diş Fırçası" },
  { id:"pliers", emoji:"🔨", name:"Pense" },
  { id:"mirror", emoji:"🪞", name:"Ayna" },
];

let gameState = { screen:"waiting", patientIndex:0, score:0, stars:0, treatClicks:0, treatTarget:12, message:"", badToothIndex:3, shaking:false, sparkle:false, pulling:false, pullProgress:0 };

function resetGame() {
  gameState = { screen:"waiting", patientIndex:0, score:0, stars:0, treatClicks:0, treatTarget:12, message:"", badToothIndex: Math.floor(Math.random()*8), shaking:false, sparkle:false, pulling:false, pullProgress:0 };
}

/* Diş SVG çizimi */
function toothSVG(color, isProblem, problemType, index, isPulling, pullProgress) {
  const baseColor = isProblem ? getProblemColor(problemType) : color || "#FFFEF5";
  const gumColor = isProblem && problemType === "abscess" ? "#FF6B6B" : "#FFB5B5";
  const rootColor = "#F5E6D3";
  const shakeAnim = isProblem ? `animation:toothShake 0.5s ease-in-out infinite;` : '';
  const pullTransform = isPulling ? `transform:translateY(-${pullProgress}px) rotate(${pullProgress * 2}deg);` : '';
  const sparkle = isProblem ? `<circle cx="25" cy="18" r="3" fill="${getSparkleColor(problemType)}" opacity="0.7"><animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite"/></circle>` : '';
  
  return `<svg viewBox="0 0 50 70" style="width:100%;height:100%;${shakeAnim}${pullTransform}filter:drop-shadow(0 2px 4px rgba(0,0,0,0.2));">
    <!-- Diş eti -->
    <ellipse cx="25" cy="22" rx="18" ry="8" fill="${gumColor}"/>
    <!-- Diş gövdesi (mine) -->
    <rect x="10" y="14" width="30" height="28" rx="6" fill="${baseColor}" stroke="#E8E0D0" stroke-width="0.5"/>
    <!-- Diş kökleri -->
    <path d="M15 42 L13 58 Q14 62 16 60 L18 44" fill="${rootColor}"/>
    <path d="M32 42 L34 58 Q33 62 31 60 L29 44" fill="${rootColor}"/>
    <!-- Mine parlaklığı -->
    <rect x="14" y="16" width="8" height="12" rx="3" fill="rgba(255,255,255,0.3)"/>
    ${sparkle}
    ${isProblem && problemType === 'cavity' ? '<circle cx="30" cy="28" r="5" fill="#3D2B1F" opacity="0.8"/><circle cx="30" cy="28" r="3" fill="#1A0F0A"/>' : ''}
    ${isProblem && problemType === 'broken' ? '<path d="M20 14 L28 22 L22 30" stroke="#CCC" stroke-width="2" fill="none"/><rect x="28" y="14" width="12" height="14" rx="2" fill="none" stroke="#CCC" stroke-dasharray="2,2"/>' : ''}
    ${isProblem && problemType === 'tartar' ? '<rect x="8" y="36" width="34" height="6" rx="2" fill="#A0A050" opacity="0.7"/><rect x="10" y="34" width="30" height="4" rx="1" fill="#808040" opacity="0.5"/>' : ''}
  </svg>`;
}

function getProblemColor(type) {
  switch(type) {
    case "cavity": return "#FFF8E1";
    case "broken": return "#FFE0E0";
    case "yellow": return "#FFD54F";
    case "abscess": return "#FFCDD2";
    case "tartar": return "#E8E0C0";
    default: return "#FFFEF5";
  }
}

function getSparkleColor(type) {
  switch(type) {
    case "cavity": return "#FF5722";
    case "broken": return "#F44336";
    case "yellow": return "#FF9800";
    case "abscess": return "#E91E63";
    case "tartar": return "#8BC34A";
    default: return "#FFF";
  }
}

/* Ağız görünümü - 8 diş */
function renderMouth(patient, badIndex, examMode, treatMode, treatProgress) {
  let teeth = '';
  for (let i = 0; i < 8; i++) {
    const isBad = i === badIndex;
    const isPulling = treatMode && isBad;
    const pp = isPulling ? Math.min(treatProgress * 3, 20) : 0;
    const toothColor = "#FFFEF5";
    
    teeth += `<div data-action="${examMode ? 'game-tooth' : ''}" data-bad="${isBad}" style="
      width:calc(12.5% - 4px); min-width:40px; aspect-ratio:5/7;
      cursor:${examMode ? 'pointer' : 'default'};
      transition: transform 0.2s, box-shadow 0.2s;
      position:relative;
      ${examMode && isBad ? 'z-index:2;' : ''}
    ">
      ${toothSVG(toothColor, isBad, patient.problem, i, isPulling, pp)}
    </div>`;
  }
  
  return `<div style="
    background: linear-gradient(180deg, #FF9E9E 0%, #FFB5B5 30%, #FF8080 100%);
    border-radius: 50% 50% 50% 50% / 30% 30% 70% 70%;
    padding: 20px 12px 30px;
    position: relative;
    box-shadow: inset 0 -10px 20px rgba(0,0,0,0.15), 0 8px 30px rgba(0,0,0,0.1);
    perspective: 500px;
    transform: rotateX(5deg);
  ">
    <!-- Üst dudak -->
    <div style="position:absolute;top:-8px;left:10%;right:10%;height:16px;background:linear-gradient(180deg,#FF6B6B,#FF8080);border-radius:50% 50% 0 0;"></div>
    <!-- Dişler -->
    <div style="display:flex;justify-content:center;gap:3px;align-items:flex-end;padding-top:8px;">
      ${teeth}
    </div>
    <!-- Alt dudak -->
    <div style="position:absolute;bottom:-5px;left:15%;right:15%;height:12px;background:linear-gradient(0deg,#FF6B6B,#FF8080);border-radius:0 0 50% 50%;"></div>
  </div>`;
}

/* Parçacık efekti */
function sparkleEffect() {
  let sparkles = '';
  for (let i = 0; i < 8; i++) {
    const x = 20 + Math.random() * 60;
    const y = 20 + Math.random() * 60;
    const delay = Math.random() * 0.5;
    sparkles += `<div style="position:absolute;left:${x}%;top:${y}%;width:8px;height:8px;background:gold;border-radius:50%;animation:sparkleFloat 0.8s ease-out ${delay}s both;">✨</div>`;
  }
  return sparkles;
}

function renderDentistGame() {
  const gs = gameState;
  const patient = GAME_PATIENTS[gs.patientIndex] || GAME_PATIENTS[0];

  const scoreBar = `<div style="display:flex;justify-content:space-between;align-items:center;padding:14px 18px;background:linear-gradient(135deg,#1A237E,#283593);border-radius:20px;margin-bottom:16px;color:white;box-shadow:0 4px 15px rgba(26,35,126,0.3);">
    <div style="text-align:center;"><div style="font-size:22px;">⭐</div><div style="font-size:12px;font-weight:700;">${gs.score}</div></div>
    <div style="text-align:center;"><div style="font-size:14px;font-weight:600;">Hasta ${gs.patientIndex + 1}/${GAME_PATIENTS.length}</div><div style="font-size:11px;opacity:0.8;">Küçük Diş Doktoru</div></div>
    <div style="text-align:center;"><div style="font-size:22px;">${"⭐".repeat(gs.stars)}</div><div style="font-size:11px;opacity:0.8;">${gs.stars}/${GAME_PATIENTS.length}</div></div>
  </div>`;

  // CSS animasyonları
  const animCSS = `<style>
    @keyframes toothShake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-2px)} 75%{transform:translateX(2px)} }
    @keyframes sparkleFloat { 0%{opacity:1;transform:scale(1) translateY(0)} 100%{opacity:0;transform:scale(0) translateY(-30px)} }
    @keyframes toolSpin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
    @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
    @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }
    @keyframes slideIn { 0%{opacity:0;transform:translateX(100px)} 100%{opacity:1;transform:translateX(0)} }
    @keyframes fadeInUp { 0%{opacity:0;transform:translateY(20px)} 100%{opacity:1;transform:translateY(0)} }
    @keyframes drillShake { 0%,100%{transform:rotate(0)} 25%{transform:rotate(-5deg)} 75%{transform:rotate(5deg)} }
    @keyframes glowPulse { 0%,100%{box-shadow:0 0 10px rgba(255,215,0,0.3)} 50%{box-shadow:0 0 30px rgba(255,215,0,0.8)} }
  </style>`;

  // BEKLEME
  if (gs.screen === "waiting") {
    return `${topbar("🎮 Küçük Diş Doktoru","Hastalarını tedavi et!", {back:"home"})}${animCSS}
      <div class="content">
        <div class="card p5" style="text-align:center;background:linear-gradient(135deg,#E3F2FD,#BBDEFB);border:2px solid #90CAF9;">
          <img src="game-logo.png" style="width:140px;height:140px;border-radius:24px;margin-bottom:12px;box-shadow:0 8px 24px rgba(0,0,0,0.15);animation:bounce 2s ease-in-out infinite;" />
          <p class="name" style="font-size:24px;margin:12px 0 8px;color:#1A237E;">Küçük Diş Doktoru</p>
          <p style="font-size:14px;color:#455A64;margin-bottom:24px;">Merhaba Doktor! Bugün 5 sevimli hasta seni bekliyor.<br>Her birinin dişini muayene et, doğru tedaviyi seç ve uygula!</p>
          <div style="display:flex;justify-content:center;gap:8px;margin-bottom:24px;font-size:40px;">
            ${GAME_PATIENTS.map(p => `<span style="animation:slideIn 0.5s ease-out both;animation-delay:${p.id*0.1}s;">${p.emoji}</span>`).join('')}
          </div>
          <button class="btn-primary" style="font-size:18px;padding:18px;background:linear-gradient(135deg,#1A237E,#283593);border-radius:16px;box-shadow:0 4px 15px rgba(26,35,126,0.3);" data-action="game-start">🩺 Kliniği Aç!</button>
        </div>
      </div>`;
  }

  // OYUN BİTTİ
  if (gs.screen === "done") {
    return `${topbar("🏆 Oyun Bitti!","Tebrikler Doktor!", {back:"home"})}${animCSS}
      <div class="content">
        <div class="card p5" style="text-align:center;background:linear-gradient(135deg,#FFF8E1,#FFECB3);border:2px solid #FFD54F;">
          <div style="font-size:80px;animation:pulse 1.5s ease-in-out infinite;">🏆</div>
          <p class="name" style="font-size:24px;color:#E65100;margin:12px 0;">Tebrikler Doktor!</p>
          <div style="font-size:36px;margin:16px 0;">${"⭐".repeat(gs.stars)}${"☆".repeat(GAME_PATIENTS.length - gs.stars)}</div>
          <p style="font-size:28px;font-weight:800;color:#1A237E;">${gs.score} Puan</p>
          <p style="font-size:15px;color:#455A64;margin:16px 0;">${gs.stars >= 4 ? "🎉 Sen harika bir diş doktorusun!" : gs.stars >= 2 ? "👏 Güzel iş! Biraz daha pratik!" : "💪 Tekrar dene, daha iyi olacaksın!"}</p>
          <button class="btn-primary" style="font-size:18px;padding:18px;background:linear-gradient(135deg,#E65100,#FF8F00);border-radius:16px;" data-action="game-restart">🔄 Tekrar Oyna</button>
        </div>
      </div>`;
  }

  // MUAYENE
  if (gs.screen === "exam") {
    return `${topbar("🎮 Muayene","Sorunlu dişi bul!", {back:"home"})}${animCSS}
      <div class="content">
        ${scoreBar}
        <div class="card p4" style="text-align:center;animation:fadeInUp 0.5s ease-out;">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
            <div style="font-size:56px;animation:bounce 2s ease-in-out infinite;">${patient.emoji}</div>
            <div style="text-align:left;flex:1;">
              <p class="name" style="font-size:18px;color:#1A237E;">${patient.name}</p>
              <div style="background:#FFF3CD;border-radius:10px;padding:10px;margin-top:6px;border-left:4px solid #FFB300;">
                <p style="font-size:13px;margin:0;color:#795548;">💬 "${patient.complaint}"</p>
              </div>
            </div>
          </div>
          <p style="font-size:13px;color:#666;margin-bottom:12px;">🔍 Ayna ile ağzına bak — sorunlu dişi bul ve tıkla!</p>
          ${renderMouth(patient, gs.badToothIndex, true, false, 0)}
          ${gs.message ? `<div style="margin-top:12px;padding:10px;border-radius:10px;background:#FFEBEE;"><p style="margin:0;font-size:13px;color:#C62828;">${gs.message}</p></div>` : ''}
        </div>
      </div>`;
  }

  // TEŞHİS
  if (gs.screen === "diagnose") {
    const shuffled = [...GAME_PATIENTS].sort(() => Math.random() - 0.5);
    return `${topbar("🩺 Teşhis Koy","Bu hastanın sorunu ne?", {back:"home"})}${animCSS}
      <div class="content">
        ${scoreBar}
        <div class="card p4" style="text-align:center;animation:fadeInUp 0.5s ease-out;">
          <div style="font-size:56px;margin-bottom:8px;">${patient.emoji}</div>
          <p class="name" style="font-size:18px;color:#1A237E;">${patient.name}'in sorunu ne?</p>
          <div style="margin:12px 0;">
            ${renderMouth(patient, gs.badToothIndex, false, false, 0)}
          </div>
          ${gs.message ? `<div style="padding:10px;border-radius:10px;background:${gs.message.includes("Doğru") ? '#E8F5E9' : '#FFEBEE'};margin-bottom:12px;"><p style="margin:0;font-size:13px;color:${gs.message.includes("Doğru") ? '#2E7D32' : '#C62828'};">${gs.message}</p></div>` : ''}
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            ${shuffled.map(p => `<button data-action="game-diagnose" data-problem="${p.problem}" style="
              padding:14px 8px;border-radius:14px;border:2px solid #E0E0E0;background:white;cursor:pointer;
              font-size:13px;font-weight:600;color:#333;transition:all 0.2s;
              display:flex;flex-direction:column;align-items:center;gap:4px;
            ">${p.emoji}<br>${p.problemLabel}</button>`).join('')}
          </div>
        </div>
      </div>`;
  }

  // ALET SEÇİMİ
  if (gs.screen === "tools") {
    const shuffled = [...GAME_TOOLS_ALL].sort(() => Math.random() - 0.5);
    return `${topbar("🔧 Alet Seç","Doğru tedavi aletini seç!", {back:"home"})}${animCSS}
      <div class="content">
        ${scoreBar}
        <div class="card p4" style="text-align:center;animation:fadeInUp 0.5s ease-out;">
          <div style="font-size:48px;">${patient.emoji}</div>
          <p class="name" style="font-size:16px;color:#1A237E;">Teşhis: <span style="color:#E65100;">${patient.problemLabel}</span></p>
          <p style="font-size:13px;color:#666;margin-bottom:4px;">Tedavi: <b>${patient.treatment}</b></p>
          <p style="font-size:12px;color:#999;margin-bottom:12px;">Doğru aleti seç!</p>
          ${gs.message ? `<div style="padding:10px;border-radius:10px;background:#FFEBEE;margin-bottom:12px;"><p style="margin:0;font-size:13px;color:#C62828;">${gs.message}</p></div>` : ''}
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            ${shuffled.map(t => `<button data-action="game-tool" data-tool="${t.id}" style="
              padding:14px;border-radius:14px;border:2px solid #E0E0E0;background:white;cursor:pointer;
              transition:all 0.2s;display:flex;flex-direction:column;align-items:center;gap:6px;
            "><span style="font-size:30px;">${t.emoji}</span><span style="font-size:12px;font-weight:600;color:#333;">${t.name}</span></button>`).join('')}
          </div>
        </div>
      </div>`;
  }

  // TEDAVİ
  if (gs.screen === "treating") {
    const progress = Math.min(100, Math.round((gs.treatClicks / gs.treatTarget) * 100));
    const tool = GAME_TOOLS_ALL.find(t => t.id === patient.tool) || GAME_TOOLS_ALL[0];
    const isNearDone = progress > 70;
    
    return `${topbar("💊 Tedavi","Dişi tedavi et!", {back:"home"})}${animCSS}
      <div class="content">
        ${scoreBar}
        <div class="card p4" style="text-align:center;animation:fadeInUp 0.5s ease-out;">
          <div style="display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:12px;">
            <div style="font-size:48px;">${patient.emoji}</div>
            <div style="font-size:36px;${gs.treatClicks > 0 ? 'animation:drillShake 0.15s ease-in-out infinite;' : ''}">${tool.emoji}</div>
          </div>
          <p class="name" style="font-size:16px;color:#1A237E;">${patient.treatment} yapılıyor...</p>
          <div style="margin:16px 0;position:relative;">
            ${renderMouth(patient, gs.badToothIndex, false, true, gs.treatClicks)}
            ${gs.treatClicks > 0 ? `<div style="position:absolute;top:0;left:0;right:0;bottom:0;pointer-events:none;overflow:hidden;">${sparkleEffect()}</div>` : ''}
          </div>
          <!-- Progress bar -->
          <div style="width:100%;height:24px;background:#E0E0E0;border-radius:12px;overflow:hidden;margin:12px 0;box-shadow:inset 0 2px 4px rgba(0,0,0,0.1);">
            <div style="width:${progress}%;height:100%;background:linear-gradient(90deg,${isNearDone ? '#4CAF50,#66BB6A' : '#1A237E,#283593'});border-radius:12px;transition:width 0.15s;display:flex;align-items:center;justify-content:center;">
              <span style="color:white;font-size:12px;font-weight:700;">${progress}%</span>
            </div>
          </div>
          <button data-action="game-treat" style="
            width:100%;padding:20px;border-radius:16px;border:3px solid ${isNearDone ? '#4CAF50' : '#FFB300'};
            background:linear-gradient(135deg,${isNearDone ? '#E8F5E9,#C8E6C9' : '#FFF8E1,#FFECB3'});
            cursor:pointer;font-size:18px;font-weight:700;color:#333;
            animation:${gs.treatClicks > 0 ? 'pulse 0.3s' : 'glowPulse 2s infinite'};
            box-shadow:0 4px 15px rgba(0,0,0,0.1);transition:all 0.1s;
          ">${tool.emoji} TIKLA! (${gs.treatTarget - gs.treatClicks} kaldı)</button>
        </div>
      </div>`;
  }

  // SONUÇ
  if (gs.screen === "result") {
    return `${topbar("🎉 Tedavi Tamam!","${patient.name} çok mutlu!", {back:"home"})}${animCSS}
      <div class="content">
        ${scoreBar}
        <div class="card p5" style="text-align:center;background:linear-gradient(135deg,#E8F5E9,#C8E6C9);border:2px solid #66BB6A;animation:fadeInUp 0.5s ease-out;">
          <div style="font-size:80px;animation:bounce 1s ease-in-out infinite;">${patient.emoji}</div>
          <div style="font-size:40px;margin:8px 0;">😊✨</div>
          <p class="name" style="font-size:22px;color:#2E7D32;">${patient.name} çok mutlu!</p>
          <div style="background:white;border-radius:12px;padding:12px;margin:16px 0;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
            <p style="font-size:14px;color:#455A64;margin:0;">💬 "Teşekkürler Doktor! Artık dişim ağrımıyor!"</p>
          </div>
          <div style="display:flex;justify-content:center;gap:20px;margin:16px 0;">
            <div style="text-align:center;"><div style="font-size:28px;">⭐</div><div style="font-size:13px;font-weight:600;color:#E65100;">+1 Yıldız</div></div>
            <div style="text-align:center;"><div style="font-size:28px;">🎯</div><div style="font-size:13px;font-weight:600;color:#1A237E;">+20 Puan</div></div>
          </div>
          <button class="btn-primary" style="font-size:18px;padding:18px;background:linear-gradient(135deg,#2E7D32,#43A047);border-radius:16px;box-shadow:0 4px 15px rgba(46,125,50,0.3);" data-action="game-next">
            ${gs.patientIndex < GAME_PATIENTS.length - 1 ? '➡️ Sıradaki Hasta' : '🏆 Sonuçları Gör'}
          </button>
        </div>
      </div>`;
  }

  return "";
}

/* ============ GÜLÜŞÜNÜ TASARLA - Magic Hour AI ============ */
const MAGIC_HOUR_API_KEY = "mhk_live_f1grAFyq18bjWKCovOXuO9aQ62xAT8qavlRCQ0G61Kuy3FHmiNl2uwT8Y83JyWDHdHJwROiqt1mEO31I";

function renderSmile() {
  return `${topbar("Gülüşünü Tasarla","Yapay zeka ile Hollywood gülüşünü tasarla!", {back:"home"})}
    <div class="content">
      <div class="card p4" style="text-align:center;">
        <div style="font-size:60px;margin-bottom:12px;">✨</div>
        <p class="name" style="font-size:18px;margin-bottom:8px;">Hollywood Gülüş Tasarımı</p>
        <p class="desc" style="margin-bottom:16px;">Fotoğrafını yükle, AI ile yeni gülüşünü gör!</p>
        
        <div style="background:#f0f9ff;border:2px solid #38bdf8;border-radius:12px;padding:16px;margin-bottom:16px;">
          <p style="font-size:14px;color:#0c4a6e;margin:0;">
            <strong>🎯 Nasıl Kullanılır:</strong><br>
            1. Fotoğrafını yükle (yüzün net görünsün)<br>
            2. "Liberty" smile engine'i seç (ücretsiz)<br>
            3. Hollywood gülüşünü gör ve indir!
          </p>
        </div>
        
        <div style="border:2px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-bottom:16px;">
          <iframe 
            src="https://denta.bot/ai-smile-simulator" 
            width="100%" 
            height="900px"
            style="border:none;"
            allow="camera; microphone">
          </iframe>
        </div>
        
        <div style="background:#fef3c7;border:2px solid #f59e0b;border-radius:12px;padding:12px;">
          <p style="font-size:13px;color:#78350f;margin:0;">
            💡 <strong>İpucu:</strong> "Liberty" smile engine ücretsizdir. Fotoğrafını yükle, Hollywood gülüşünü gör, indir ve kliniğimize getir!
          </p>
        </div>
      </div>
    </div>`;
}

function initSmile() {
  const upload = document.getElementById("smile-upload");
  const fileInput = document.getElementById("smile-file");
  const preview = document.getElementById("smile-preview");
  const img = document.getElementById("smile-img");
  const intensity = document.getElementById("smile-intensity");
  const intensityVal = document.getElementById("smile-intensity-val");
  const generateBtn = document.getElementById("smile-generate");
  const loading = document.getElementById("smile-loading");
  const result = document.getElementById("smile-result");
  const resultImg = document.getElementById("smile-result-img");
  const downloadLink = document.getElementById("smile-download");
  const retryBtn = document.getElementById("smile-retry");
  const status = document.getElementById("smile-status");
  
  // Sayfa artık iframe tabanlı; eski form elemanları yoksa sessizce çık.
  if (!upload || !fileInput || !img) return;

  let imageBase64 = null;

  upload.onclick = () => fileInput.click();
  
  fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      imageBase64 = ev.target.result.split(",")[1];
      img.src = ev.target.result;
      upload.style.display = "none";
      preview.style.display = "block";
      result.style.display = "none";
      status.textContent = "";
    };
    reader.readAsDataURL(file);
  };
  
  intensity.oninput = () => {
    intensityVal.textContent = intensity.value + "%";
  };
  
  generateBtn.onclick = async () => {
    if (!imageBase64) return;
    preview.style.display = "none";
    loading.style.display = "block";
    result.style.display = "none";
    status.textContent = "";
    
    try {
      const res = await fetch("https://nurdis-worker.nurdisdentalklinik.workers.dev", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "smile",
          imageBase64: imageBase64,
          smileIntensity: parseInt(intensity.value) / 100
        })
      });
      const data = await res.json();
      loading.style.display = "none";
      
      if (data.imageUrl) {
        resultImg.src = data.imageUrl;
        downloadLink.href = data.imageUrl;
        result.style.display = "block";
        status.textContent = "✅ Gülüşün tasarlandı!";
      } else if (data.jobId) {
        status.textContent = "⏳ İşleniyor... Biraz bekle ve tekrar dene.";
        preview.style.display = "block";
      } else {
        throw new Error(data.error || "Bilinmeyen hata");
      }
    } catch (err) {
      loading.style.display = "none";
      preview.style.display = "block";
      status.textContent = "❌ Hata: " + err.message;
    }
  };
  
  retryBtn.onclick = () => {
    result.style.display = "none";
    preview.style.display = "block";
    status.textContent = "";
  };
}
