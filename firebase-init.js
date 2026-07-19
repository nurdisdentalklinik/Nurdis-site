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
  signInWithEmailAndPassword, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp,
  doc, setDoc, updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-functions.js";

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
const functions = getFunctions(app, "europe-west1");
const googleProvider = new GoogleAuthProvider();

/* Cloud Functions'a çağrılar */
const chatWithAIFunc = httpsCallable(functions, "chatWithAI");
const analyzeToothPhotoFunc = httpsCallable(functions, "analyzeToothPhoto");

/* ---------------- AUTH ---------------- */

async function signInGoogle() {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    return { ok: true, user: res.user };
  } catch (err) {
    console.error("Google giriş hatası:", err);
    return { ok: false, error: err.message };
  }
}

async function adminSignIn(email, password) {
  try {
    const res = await signInWithEmailAndPassword(auth, email, password);
    if (res.user.email !== ADMIN_EMAIL) {
      await signOut(auth);
      return { ok: false, error: "Bu hesap yönetici olarak tanımlı değil." };
    }
    return { ok: true, user: res.user };
  } catch (err) {
    return { ok: false, error: "Giriş başarısız: kullanıcı adı ya da şifre hatalı." };
  }
}

function signOutUser() { return signOut(auth); }

function onAuthChange(cb) {
  onAuthStateChanged(auth, (user) => {
    cb(user ? { uid: user.uid, name: user.displayName || user.email, email: user.email, isAdmin: user.email === ADMIN_EMAIL } : null);
  });
}

/* ---------------- AI CHATBOT (Gemini via Cloud Functions) ----------------*/

async function callChatWithAI(message) {
  try {
    const result = await chatWithAIFunc({ message });
    return { ok: true, reply: result.data.reply };
  } catch (err) {
    console.error("AI Chat Error:", err);
    return { ok: false, error: err.message };
  }
}

async function callAnalyzeToothPhoto(imageBase64, userMessage) {
  try {
    const result = await analyzeToothPhotoFunc({ imageBase64, message: userMessage });
    return { ok: true, analysis: result.data.analysis };
  } catch (err) {
    console.error("Tooth Photo Analysis Error:", err);
    return { ok: false, error: err.message };
  }
}

/* ---------------- FIRESTORE: canlı koleksiyonlar ----------------*/
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

function addItem(colName, data) {
  return addDoc(collection(db, colName), { ...data, createdAt: serverTimestamp() });
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

/* Sosyal Medya Ayarları */
function subscribeSocialMedia(cb) {
  return subscribeMap("social_media", cb);
}

function setSocialMedia(platform, url) {
  return setMapValue("social_media", platform, url);
}

/* Kampanyalar */
function subscribeCampaigns(cb) {
  return subscribe("campaigns", cb, 50);
}

function addCampaign(data) {
  return addItem("campaigns", data);
}

function updateCampaign(id, data) {
  return updateDoc(doc(db, "campaigns", id), { ...data, updatedAt: serverTimestamp() });
}

function deleteCampaign(id) {
  return updateDoc(doc(db, "campaigns", id), { deleted: true });
}

/* Bilgi Bölümü (Dinamik) */
function subscribeInfoArticles(cb) {
  return subscribe("info_articles", cb, 200);
}

function addInfoArticle(data) {
  return addItem("info_articles", data);
}

function updateInfoArticle(id, data) {
  return updateDoc(doc(db, "info_articles", id), { ...data, updatedAt: serverTimestamp() });
}

/* Yorum Cevapları (Nested) */
function subscribeReviewReplies(reviewId, cb) {
  const q = query(
    collection(db, "reviews", reviewId, "replies"),
    orderBy("createdAt", "asc")
  );
  return onSnapshot(q, (snap) => {
    const replies = [];
    snap.forEach(d => replies.push({ id: d.id, ...d.data() }));
    cb(replies);
  });
}

function addReplyToReview(reviewId, data) {
  return addDoc(collection(db, "reviews", reviewId, "replies"), {
    ...data,
    createdAt: serverTimestamp()
  });
}

/* Uygulama Ayarları (Genel) */
function subscribeSettings(cb) {
  return subscribeMap("app_settings", cb);
}

function updateSettings(key, value) {
  return setMapValue("app_settings", key, value);
}

/* ---------------- window.fb üzerinden dışa aç ----------------*/

window.fb = {
  ready: true,
  signInGoogle, adminSignIn, signOutUser, onAuthChange,
  
  // AI Chatbot
  callChatWithAI, callAnalyzeToothPhoto,
  
  // Reviews (eski sistem)
  subscribeReviews: (cb) => subscribe("reviews", cb),
  addReview: (data) => addItem("reviews", data),
  replyToReview: (id, text) => replyToReview(id, text),
  
  // Review Replies (yeni sistem - nested)
  subscribeReviewReplies, addReplyToReview,
  
  // Products
  subscribeProducts: (cb) => subscribe("products_custom", cb),
  addProduct: (data) => addItem("products_custom", data),
  
  // Appointments
  subscribeAppointments: (cb) => subscribe("appointments", cb),
  addAppointment: (data) => addItem("appointments", data),
  
  // Orders
  subscribeOrders: (cb) => subscribe("orders", cb),
  addOrder: (data) => addItem("orders", data),
  addMessage: (data) => addItem("messages", data),
  
  // Media (Videos & Images)
  subscribeServiceVideos: (cb) => subscribeMap("service_videos", cb),
  setServiceVideo: (id, url) => setMapValue("service_videos", id, url),
  subscribeProductImages: (cb) => subscribeMap("product_images", cb),
  setProductImage: (id, url) => setMapValue("product_images", id, url),
  subscribeDeviceVideos: (cb) => subscribeMap("device_videos", cb),
  setDeviceVideo: (id, url) => setMapValue("device_videos", id, url),
  
  // Sosyal Medya
  subscribeSocialMedia, setSocialMedia,
  
  // Kampanyalar
  subscribeCampaigns, addCampaign, updateCampaign, deleteCampaign,
  
  // Bilgi Bölümü
  subscribeInfoArticles, addInfoArticle, updateInfoArticle,
  
  // Ayarlar
  subscribeSettings, updateSettings,
};

window.dispatchEvent(new Event("fb-ready"));
