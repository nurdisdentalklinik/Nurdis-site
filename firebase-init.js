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

/* ---------------- window.fb üzerinden dışa aç ---------------- */

window.fb = {
  ready: true,
  signInGoogle, adminSignIn, signOutUser, onAuthChange,
  subscribeReviews: (cb) => subscribe("reviews", cb),
  addReview: (data) => addItem("reviews", data),
  subscribeProducts: (cb) => subscribe("products_custom", cb),
  addProduct: (data) => addItem("products_custom", data),
  subscribeAppointments: (cb) => subscribe("appointments", cb),
  addAppointment: (data) => addItem("appointments", data),
  subscribeOrders: (cb) => subscribe("orders", cb),
  addOrder: (data) => addItem("orders", data),
  addMessage: (data) => addItem("messages", data),
  subscribeServiceVideos: (cb) => subscribeMap("service_videos", cb),
  setServiceVideo: (id, url) => setMapValue("service_videos", id, url),
  subscribeProductImages: (cb) => subscribeMap("product_images", cb),
  setProductImage: (id, url) => setMapValue("product_images", id, url),
  subscribeDeviceVideos: (cb) => subscribeMap("device_videos", cb),
  setDeviceVideo: (id, url) => setMapValue("device_videos", id, url),
  replyToReview: (id, text) => replyToReview(id, text),
};

window.dispatchEvent(new Event("fb-ready"));
