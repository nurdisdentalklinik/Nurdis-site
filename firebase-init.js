/* =========================================================
   NUR DİŞ & DENTAL KLİNİK — Firebase bağlantısı
   Bu dosya bir ES module'dür (index.html'de type="module" ile
   yüklenir). Firebase Authentication (Google + admin e-posta/şifre)
   ve Firestore (gerçek zamanlı senkron veri) burada kurulur ve
   window.fb üzerinden app.js'in kullanımına açılır.
========================================================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signOut,
  signInWithEmailAndPassword, onAuthStateChanged,
  signInWithRedirect, getRedirectResult,
  getMultiFactorResolver, TotpMultiFactorGenerator,
  PhoneAuthProvider, PhoneMultiFactorGenerator
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp,
  doc, setDoc, updateDoc, deleteDoc, getDocs, getDoc, where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDbLNDyGs-9TQkdEwd85SeR464gIjNipog",
  authDomain: "nur-dis-klinik.firebaseapp.com",
  projectId: "nur-dis-klinik",
  storageBucket: "nur-dis-klinik.firebasestorage.app",
  messagingSenderId: "1022892629591",
  appId: "1:1022892629591:web:a3eb7abe4bb730390b8d12"
};

/* ÖNEMLİ: Yönetici panelini yalnızca bu e-postaya kilitliyoruz.
   Firebase konsolunda Authentication > Users kısmından bu e-posta
   ile bir kullanıcı oluşturman gerekiyor (şifreyi orada belirlersin). */
const ADMIN_EMAIL = "nurdisdentalklinik@gmail.com";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

/* ---------------- AUTH ---------------- */

async function signInGoogle() {
  try {
    const sonuc = await _googleGirisDene();
    if (sonuc.tip === "redirect") return { ok: false, redirect: true };
    return { ok: true, user: sonuc.user };
  } catch (err) {
    console.error("Google giriş hatası:", err);
    return { ok: false, error: _googleHataMesaji(err) };
  }
}

/* ---------------- ÇOK FAKTÖRLÜ DOĞRULAMA (MFA) ----------------
   İki yöntem desteklenir:
     A) Google ile giriş → Google hesabının kendi 2 adımlı doğrulaması
        devreye girer. ÜCRETSİZ, ek plan gerekmez.
     B) Firebase TOTP MFA (authenticator uygulaması: Google Authenticator,
        Microsoft Authenticator, Authy). Bunun için Firebase projesinin
        "Identity Platform" sürümüne yükseltilmesi gerekir (Blaze planı).
   Kod her iki duruma da hazırdır. */

let _bekleyenMfa = null;

async function adminSignIn(email, password) {
  try {
    const res = await signInWithEmailAndPassword(auth, email, password);
    if (res.user.email !== ADMIN_EMAIL) {
      await signOut(auth);
      return { ok: false, error: "Bu hesap yönetici olarak tanımlı değil." };
    }
    return { ok: true, user: res.user };
  } catch (err) {
    /* Şifre doğru ama ikinci faktör isteniyorsa panel kilitlenmesin */
    if (err && (err.code === "auth/multi-factor-auth-required" || err.code === "auth/need-second-factor")) {
      try {
        const resolver = getMultiFactorResolver(auth, err);
        const ipucu = (resolver.hints || []).find(h => h.factorId === "totp") || (resolver.hints || [])[0];
        _bekleyenMfa = { resolver, ipucu };
        return {
          ok: false,
          mfa: true,
          yontem: ipucu && ipucu.factorId === "totp" ? "totp" : "sms",
          ipucu: ipucu ? (ipucu.displayName || "") : ""
        };
      } catch (e) {
        return { ok: false, error: "İkinci faktör başlatılamadı: " + (e.message || "") };
      }
    }
    return { ok: false, error: "E-posta veya şifre hatalı." };
  }
}

/* İkinci faktör kodunu doğrula (TOTP veya SMS) */
async function adminMfaDogrula(kod) {
  if (!_bekleyenMfa) return { ok: false, error: "Doğrulama oturumu bulunamadı, tekrar giriş yapın." };
  const temiz = (kod || "").replace(/\s/g, "");
  if (!/^[0-9]{6,8}$/.test(temiz)) return { ok: false, error: "6 haneli kodu girin." };

  try {
    const { resolver, ipucu } = _bekleyenMfa;
    let assertion;

    if (ipucu && ipucu.factorId === "totp") {
      assertion = TotpMultiFactorGenerator.assertionForSignIn(ipucu.uid, temiz);
    } else if (ipucu && ipucu.factorId === "phone") {
      const cred = PhoneAuthProvider.credential(ipucu.sessionInfo.verificationId, temiz);
      assertion = PhoneMultiFactorGenerator.assertion(cred);
    } else {
      return { ok: false, error: "Desteklenmeyen ikinci faktör türü." };
    }

    const res = await resolver.resolveSignIn(assertion);
    if (res.user.email !== ADMIN_EMAIL) {
      await signOut(auth);
      return { ok: false, error: "Bu hesap yönetici olarak tanımlı değil." };
    }
    _bekleyenMfa = null;
    return { ok: true, user: res.user };
  } catch (err) {
    return { ok: false, error: "Kod hatalı veya süresi dolmuş." };
  }
}

/* Google ile giriş — İKİ AŞAMALI DAYANIKLI YÖNTEM
   1) Popup denenir (hızlı, sayfa yenilenmez)
   2) Popup engellenirse veya tarayıcı desteklemezse tam sayfa
      yönlendirmesine (redirect) geçilir.
   Mobil tarayıcılarda (Instagram/WhatsApp içi tarayıcı, Safari ITP)
   popup sık engellendiği için redirect yedek yolu şart. */
async function _googleGirisDene() {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    return { tip: "popup", user: res.user };
  } catch (err) {
    const kod = (err && err.code) || "";
    const gecici = /popup-blocked|popup-closed-by-user|cancelled-popup-request|internal-error|operation-not-supported|web-storage-unsupported/i.test(kod);
    if (!gecici) throw err;                 // gerçek hata: yukarı fırlat
    await signInWithRedirect(auth, googleProvider);
    return { tip: "redirect" };             // sayfa yönlenecek, buradan dönülmez
  }
}

async function adminGoogleSignIn() {
  try {
    const sonuc = await _googleGirisDene();
    if (sonuc.tip === "redirect") return { ok: false, redirect: true, error: "" };

    const email = (sonuc.user.email || "").toLowerCase();
    if (email !== ADMIN_EMAIL.toLowerCase()) {
      await signOut(auth);
      return { ok: false, error: "Bu Google hesabı yönetici olarak tanımlı değil." };
    }
    const ikinciFaktor = (sonuc.user.multiFactor && sonuc.user.multiFactor.enrolledFactors) || [];
    return { ok: true, user: sonuc.user, mfaSayisi: ikinciFaktor.length };
  } catch (err) {
    return { ok: false, error: _googleHataMesaji(err) };
  }
}

/* Teknik hata kodlarını anlaşılır Türkçeye çevir */
function _googleHataMesaji(err) {
  const kod = (err && err.code) || "";
  if (kod.indexOf("unauthorized-domain") !== -1) {
    return "Bu site adresi Firebase'de yetkili değil. Firebase Konsolu → Authentication → Settings → Authorized domains listesine nurdis.pages.dev eklenmeli.";
  }
  if (kod.indexOf("operation-not-allowed") !== -1) {
    return "Google ile giriş yöntemi Firebase'de kapalı. Authentication → Sign-in method → Google → Enable.";
  }
  if (kod.indexOf("popup-blocked") !== -1) {
    return "Tarayıcı giriş penceresini engelledi. Popup engelleyiciyi kapatıp tekrar deneyin.";
  }
  if (kod.indexOf("network") !== -1) {
    return "İnternet bağlantısı sorunu. Bağlantınızı kontrol edip tekrar deneyin.";
  }
  return "Google girişi başarısız: " + (kod || "bilinmeyen hata");
}

/* Yönlendirmeden dönen kullanıcıyı yakala (sayfa yeniden yüklendiğinde) */
let _redirectSonucu = null;
const _redirectHazir = getRedirectResult(auth).then((res) => {
  if (res && res.user) {
    _redirectSonucu = { email: res.user.email, uid: res.user.uid };
  }
  return _redirectSonucu;
}).catch(() => null);

function signOutUser() { return signOut(auth); }

function onAuthChange(cb) {
  onAuthStateChanged(auth, (user) => {
    cb(user ? { uid: user.uid, name: user.displayName || user.email, email: user.email, isAdmin: user.email === ADMIN_EMAIL } : null);
  });
}

/* ---------------- FIRESTORE: canlı koleksiyonlar ---------------- */
/* Her fonksiyon bir onSnapshot aboneliği kurar ve her değişiklikte
   cb(listesi) çağırır — yani bir kullanıcı yorum eklediğinde TÜM
   kullanıcıların ekranı anında güncellenir. */

function subscribe(colName, cb, max=100) {
  const q = query(collection(db, colName), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const items = [];
    snap.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
    cb(items.slice(0, max));
  }, (err) => { console.error(`${colName} dinleme hatası:`, err); cb([]); });
}

/* ------------------------------------------------------------------
   GİRİŞ TEMİZLİĞİ (halka açık formlar)
   Randevu / sipariş / mesaj / yorum alanları halktan gelir. Buraya
   "<img src=x onerror=...>" gibi HTML yazılırsa yönetici panelinde
   çalışabilir (CSP script'i engeller ama sahte form/arayüz enjekte
   edilebilir). Bu yüzden kayıt daha veritabanına yazılmadan temizlenir:
   açı/burun işaretleri ve kontrol karakterleri atılır, uzunluk kısılır.
   ------------------------------------------------------------------ */
function _temizMetin(v, max) {
  if (typeof v !== "string") return v;
  return v
    .replace(/[<>]/g, "")              // HTML etiketi kurmayı imkânsız kıl
    .replace(/[\u0000-\u001F\u007F]/g, " ")  // kontrol karakterleri
    .replace(/\s{3,}/g, "  ")
    .trim()
    .slice(0, max || 500);
}

const _PUBLIC_ALANLAR = {
  name: 80, phone: 20, date: 10, time: 5, note: 300, address: 400,
  msg: 1500, text: 1000, email: 120, doctor: 60, treatment: 80,
  subject: 120, items: 0
};

function _temizPaket(data) {
  const cikti = {};
  Object.keys(data || {}).forEach((k) => {
    const v = data[k];
    if (typeof v === "string") {
      cikti[k] = _temizMetin(v, _PUBLIC_ALANLAR[k] || 400);
    } else {
      cikti[k] = v;   // sayı, dizi, boolean olduğu gibi
    }
  });
  return cikti;
}

function addItem(colName, data) {
  return addDoc(collection(db, colName), { ..._temizPaket(data), createdAt: serverTimestamp() });
}

/* Basit anahtar->deger haritaları (id -> {url}) — hizmet videoları ve
   ürün görselleri için. Herkes okuyabilir, sadece admin yazar (bkz.
   Firestore güvenlik kuralları). */
function subscribeMap(colName, cb) {
  return onSnapshot(collection(db, colName), (snap) => {
    const map = {};
    snap.forEach(d => { map[d.id] = d.data().url || ""; });
    cb(map);
  }, (err) => { console.error(`${colName} dinleme hatası:`, err); cb({}); });
}

function setMapValue(colName, id, url) {
  return setDoc(doc(db, colName, id), { url, updatedAt: serverTimestamp() });
}

function replyToReview(reviewId, replyText) {
  return updateDoc(doc(db, "reviews", reviewId), { adminReply: replyText, adminReplyAt: serverTimestamp() });
}

function deleteItem(colName, id) {
  return deleteDoc(doc(db, colName, id));
}

function addToBlockedUsers(uid) {
  return setDoc(doc(db, "blocked_users", uid), { uid, blockedAt: serverTimestamp() });
}

function removeFromBlockedUsers(uid) {
  return deleteDoc(doc(db, "blocked_users", uid));
}

function subscribeBlockedUsers(cb) {
  return onSnapshot(collection(db, "blocked_users"), (snap) => {
    const blocked = [];
    snap.forEach(d => { blocked.push(d.id); });
    cb(blocked);
  }, (err) => { console.error("blocked_users dinleme hatası:", err); cb([]); });
}

function setSocialMedia(id, url) {
  return setDoc(doc(db, "social_media", id), { url, updatedAt: serverTimestamp() });
}

function subscribeSocialMedia(cb) {
  return onSnapshot(collection(db, "social_media"), (snap) => {
    const social = {};
    snap.forEach(d => { social[d.id] = d.data().url || ""; });
    cb(social);
  }, (err) => { console.error("social_media dinleme hatası:", err); cb({}); });
}

/* ---------------- KULLANICI PROFİLLERİ ---------------- */
function saveUserProfile(uid, profile) {
  return setDoc(doc(db, "user_profiles", uid), { ...profile, updatedAt: serverTimestamp() });
}

function loadUserProfile(uid) {
  return getDocs(query(collection(db, "user_profiles"), where("__name__", "==", uid))).then(snap => {
    if (!snap.empty) {
      const data = snap.docs[0].data();
      delete data.updatedAt;
      return data;
    }
    return null;
  });
}

function saveBrushStreak(uid, data) {
  return setDoc(doc(db, "brush_streaks", uid), { ...data, updatedAt: serverTimestamp() });
}

function loadBrushStreak(uid) {
  return getDocs(query(collection(db, "brush_streaks"), where("__name__", "==", uid))).then(snap => {
    if (!snap.empty) return snap.docs[0].data();
    return null;
  });
}

/* Yönetici: brushing video URL kaydet/oku */
function setBrushingVideo(url) {
  return setDoc(doc(db, "settings", "brushing_video"), { url, updatedAt: serverTimestamp() });
}

function subscribeBrushingVideo(cb) {
  return onSnapshot(doc(db, "settings", "brushing_video"), (d) => {
    cb(d.exists() ? (d.data().url || "") : "");
  }, (err) => { console.error("brushing_video dinleme hatası:", err); cb(""); });
}

/* ---------------- SAĞLIK İPUÇLARI ---------------- */
function subscribeHealthTips(cb) {
  return onSnapshot(collection(db, "health_tips"), (snap) => {
    const tips = [];
    snap.forEach(d => tips.push({ id: d.id, ...d.data() }));
    cb(tips);
  }, (err) => { console.error("health_tips dinleme hatası:", err); cb([]); });
}

function addHealthTip(text) {
  return addDoc(collection(db, "health_tips"), { text, createdAt: serverTimestamp() });
}

function deleteHealthTip(id) {
  return deleteDoc(doc(db, "health_tips", id));
}

/* ---------------- DUYURULAR ---------------- */
function subscribeAnnouncements(cb) {
  return onSnapshot(query(collection(db, "announcements"), orderBy("createdAt", "desc")), (snap) => {
    const items = [];
    snap.forEach(d => items.push({ id: d.id, ...d.data() }));
    cb(items);
  }, (err) => { console.error("announcements dinleme hatası:", err); cb([]); });
}

function addAnnouncement(data) {
  return addDoc(collection(db, "announcements"), { ...data, createdAt: data.createdAt || new Date().toISOString() });
}

function deleteAnnouncement(id) {
  return deleteDoc(doc(db, "announcements", id));
}

/* ---------------- MUHASEBE ---------------- */
function addAccountingEntry(data) {
  const col = data.type === "income" ? "accounting_incomes" : "accounting_expenses";
  return addDoc(collection(db, col), { ...data, createdAt: data.createdAt || new Date().toISOString() });
}

function subscribeAccounting(type, cb) {
  const col = type === "income" ? "accounting_incomes" : "accounting_expenses";
  return onSnapshot(query(collection(db, col), orderBy("createdAt", "desc")), (snap) => {
    const items = [];
    snap.forEach(d => items.push({ id: d.id, ...d.data() }));
    cb(items);
  }, (err) => { console.error(col + " dinleme hatası:", err); cb([]); });
}

/* ---------------- TEDAVİLER (admin ekler, kullanıcı görür) ---------------- */
function subscribeTreatments(cb) {
  return onSnapshot(query(collection(db, "treatments"), orderBy("date", "desc")), (snap) => {
    const items = [];
    snap.forEach(d => items.push({ id: d.id, ...d.data() }));
    cb(items);
  }, (err) => { console.error("treatments dinleme hatası:", err); cb([]); });
}

function addTreatment(data) {
  return addDoc(collection(db, "treatments"), { ...data, createdAt: serverTimestamp() });
}

function deleteTreatment(id) {
  return deleteDoc(doc(db, "treatments", id));
}

/* ---------------- window.fb üzerinden dışa aç ---------------- */

window.fb = {
  ready: true,
  signInGoogle, adminSignIn, adminMfaDogrula, adminGoogleSignIn, signOutUser, onAuthChange,
  getRedirectResultSafe: () => _redirectHazir.then(() => _redirectSonucu),
  subscribeReviews: (cb) => subscribe("reviews", cb),
  addReview: (data) => addItem("reviews", data),
  subscribeProducts: (cb) => subscribe("products_custom", cb),
  addProduct: (data) => addItem("products_custom", data),
  subscribeAppointments: (cb) => subscribe("appointments", cb),
  addAppointment: (data) => addItem("appointments", data),
  subscribeOrders: (cb) => subscribe("orders", cb),
  addOrder: (data) => addItem("orders", data),
  addMessage: (data) => addItem("messages", data),
  // Hasta portalı
  subscribePatientFiles: (uid, cb) => window.fb.subscribeMine("patient_files", uid, cb),
  addPatientFile: (data) => addItem("patient_files", data),
  deletePatientFile: (id) => deleteItem("patient_files", id),
  subscribePatientNotes: (uid, cb) => window.fb.subscribeMine("patient_notes", uid, cb),
  addPatientNote: (data) => addItem("patient_notes", data),
  deletePatientNote: (id) => deleteItem("patient_notes", id),
  subscribeServiceVideos: (cb) => subscribeMap("service_videos", cb),
  setServiceVideo: (id, url) => setMapValue("service_videos", id, url),
  subscribeProductImages: (cb) => subscribeMap("product_images", cb),
  setProductImage: (id, url) => setMapValue("product_images", id, url),
  subscribeDeviceVideos: (cb) => subscribeMap("device_videos", cb),
  setDeviceVideo: (id, url) => setMapValue("device_videos", id, url),
  replyToReview: (id, text) => replyToReview(id, text),
  deleteReview: (id) => deleteItem("reviews", id),
  addToBlockedUsers: (uid) => addToBlockedUsers(uid),
  removeFromBlockedUsers: (uid) => removeFromBlockedUsers(uid),
  subscribeBlockedUsers: (cb) => subscribeBlockedUsers(cb),
  setSocialMedia: (id, url) => setSocialMedia(id, url),
  subscribeSocialMedia: (cb) => subscribeSocialMedia(cb),
  // Profil sistemi
  saveUserProfile: (uid, profile) => saveUserProfile(uid, profile),
  loadUserProfile: (uid) => loadUserProfile(uid),
  saveBrushStreak: (uid, data) => saveBrushStreak(uid, data),
  loadBrushStreak: (uid) => loadBrushStreak(uid),
  setBrushingVideo: (url) => setBrushingVideo(url),
  subscribeBrushingVideo: (cb) => subscribeBrushingVideo(cb),
  subscribeHealthTips: (cb) => subscribeHealthTips(cb),
  addHealthTip: (text) => addHealthTip(text),
  subscribeAnnouncements: (cb) => subscribeAnnouncements(cb),
  addAnnouncement: (data) => addAnnouncement(data),
  deleteAnnouncement: (id) => deleteAnnouncement(id),
  addAccountingEntry: (data) => addAccountingEntry(data),
  subscribeAccountingIncomes: (cb) => subscribeAccounting("income", cb),
  subscribeAccountingExpenses: (cb) => subscribeAccounting("expense", cb),
  /* Anlık oturum — yönetici kapısı bunu sunucudan doğrular */
  getCurrentUser: () => {
    const u = auth.currentUser;
    return u ? { uid: u.uid, email: u.email, isAdmin: u.email === ADMIN_EMAIL } : null;
  },
  signOutNow: () => signOut(auth),
  /* Denetim kaydı — kim ne zaman ne yaptı (yalnızca yönetici yazar/okur) */
  addAdminLog: (kayit) => addDoc(collection(db, "admin_log"),
    { ...kayit, createdAt: serverTimestamp() }),
  saveAccountingData: (data) => setDoc(doc(db, "settings", "accounting"), data),
  loadAccountingData: () => getDoc(doc(db, "settings", "accounting")),

  /* --- HALKA AÇIK KLİNİK VERİSİ ---
     Finansal veri (ciro, gider, personel maaşı) ile hasta kataloğu AYNI
     dokümanda tutulmamalı. Halka açık kısım burada, özel kısım
     settings/accounting'te (sadece yönetici). */
  savePublicData: (data) => setDoc(doc(db, "public", "klinik"), data),
  loadPublicData: () => getDoc(doc(db, "public", "klinik")),

  /* --- KENDİ KAYITLARIM ---
     Hasta yalnızca kendi kayıtlarını okuyabilir. Koleksiyonun tamamını
     çekmek güvenlik kuralı tarafından reddedilir (ve reddedilmelidir). */
  subscribeMine: (col, uid, cb) => {
    if (!uid) { cb([]); return () => {}; }
    const q = query(collection(db, col), where("uid", "==", uid));
    return onSnapshot(q,
      (snap) => { const items = []; snap.forEach(d => items.push({ id: d.id, ...d.data() })); cb(items); },
      () => cb([])
    );
  },
  /* --- MEDYA DEPOSU ---
     Firestore tek doküman limiti 1 MB. Doktor fotoğrafı, diploma, ürün görseli
     gibi base64 medyalar settings/accounting içine gömülürse limit kısa sürede
     aşılır ve TÜM bulut senkronu sessizce durur. Bu yüzden her medya kendi
     dokümanında tutulur: settings/doktor_<id>, settings/urun_<id>
     Aynı `settings/{id}` kuralı bunları da kapsar — ek kural gerekmez. */
  saveMedya: (tur, id, data) => setDoc(doc(db, "settings", `${tur}_${id}`), data),
  loadMedya: (tur, id) => getDoc(doc(db, "settings", `${tur}_${id}`)),
  deleteMedya: (tur, id) => deleteDoc(doc(db, "settings", `${tur}_${id}`)).catch(() => {}),
  deleteHealthTip: (id) => deleteHealthTip(id),
  subscribeTreatments: (cb) => subscribeTreatments(cb),
  addTreatment: (data) => addTreatment(data),
  deleteTreatment: (id) => deleteTreatment(id),
};

window.dispatchEvent(new Event("fb-ready"));
