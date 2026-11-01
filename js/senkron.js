/* =========================================================
   NUR DİŞ — SENKRON KUYRUĞU v17
   Buluta yazılamayan kayıtları yerelde tutar,
   bağlantı/yetki gelince otomatik gönderir.
========================================================= */

const KUYRUK_KEY = "nurdis_senkron_kuyrugu";
const KUYRUK_MAX = 300;

function kuyrukAl() {
  try { return JSON.parse(localStorage.getItem(KUYRUK_KEY) || "[]"); } catch (e) { return []; }
}

function kuyrukKaydet(q) {
  try { localStorage.setItem(KUYRUK_KEY, JSON.stringify((q || []).slice(-KUYRUK_MAX))); } catch (e) {}
  state.senkronKuyrugu = kuyrukAl();
}

/* Kuyruğa ekle — aynı kaydı iki kez eklemez */
function kuyrugaEkle(tur, veri, hata) {
  const q = kuyrukAl();
  const imza = tur + "|" + (veri.date || "") + "|" + (veri.time || "") + "|" + (veri.name || "") + "|" + (veri.phone || "");
  if (q.some(x => x.imza === imza)) return;
  q.push({
    imza, tur, veri,
    hata: hata || "",
    tarih: new Date().toISOString(),
    deneme: 0
  });
  kuyrukKaydet(q);
  kuyrukRozetiGuncelle();
}

function kuyruktanSil(imza) {
  const q = kuyrukAl().filter(x => x.imza !== imza);
  kuyrukKaydet(q);
  kuyrukRozetiGuncelle();
}

function kuyrukRozetiGuncelle() {
  state.senkronBekleyen = kuyrukAl().length;
}

/* Kuyruktaki kayıtları göndermeyi dene */
let _kuyrukCalisiyor = false;
function kuyrukGonder() {
  if (_kuyrukCalisiyor) return Promise.resolve({ gonderilen: 0 });
  const q = kuyrukAl();
  if (!q.length || !window.fb || !state.fbReady) return Promise.resolve({ gonderilen: 0 });

  _kuyrukCalisiyor = true;
  let gonderilen = 0;
  let basarisiz = 0;

  const tekGonder = (item) => {
    let p;
    if (item.tur === "appointment") p = window.fb.addAppointment(item.veri);
    else if (item.tur === "patient_note") p = window.fb.addPatientNote(item.veri);
    else if (item.tur === "patient_file") p = window.fb.addPatientFile(item.veri);
    else if (item.tur === "order") p = window.fb.addOrder(item.veri);
    else if (item.tur === "review") p = window.fb.addReview(item.veri);
    else if (item.tur === "message") p = window.fb.addMessage(item.veri);
    else return Promise.reject(new Error("bilinmeyen tür: " + item.tur));

    return Promise.resolve(p).then(() => {
      kuyruktanSil(item.imza);
      gonderilen++;
    }).catch((e) => {
      basarisiz++;
      const q2 = kuyrukAl().map(x => {
        if (x.imza === item.imza) {
          x.deneme = (x.deneme || 0) + 1;
          x.hata = (e && e.code) || (e && e.message) || "";
        }
        return x;
      });
      kuyrukKaydet(q2);
    });
  };

  // Sırayla gönder
  return q.reduce((acc, item) => acc.then(() => tekGonder(item)), Promise.resolve())
    .then(() => {
      _kuyrukCalisiyor = false;
      kuyrukRozetiGuncelle();
      return { gonderilen, basarisiz };
    });
}

/* Buluta yazma denemesi + kuyruk yedeği */
function bulutaYaz(tur, veri, opts) {
  const o = opts || {};
  return new Promise((resolve) => {
    if (!window.fb || !state.fbReady) {
      kuyrugaEkle(tur, veri, "firebase-hazir-degil");
      resolve({ ok: false, kuyruk: true, neden: "bağlantı yok" });
      return;
    }

    let p;
    try {
      if (tur === "appointment") p = window.fb.addAppointment(veri);
      else if (tur === "patient_note") p = window.fb.addPatientNote(veri);
      else if (tur === "patient_file") p = window.fb.addPatientFile(veri);
      else if (tur === "order") p = window.fb.addOrder(veri);
      else if (tur === "review") p = window.fb.addReview(veri);
      else if (tur === "message") p = window.fb.addMessage(veri);
      else { resolve({ ok: false, neden: "bilinmeyen tür" }); return; }
    } catch (e) {
      kuyrugaEkle(tur, veri, e && e.code);
      resolve({ ok: false, kuyruk: true, neden: (e && e.code) || "hata" });
      return;
    }

    Promise.resolve(p).then((ref) => {
      // Başarılı — kuyrukta varsa temizle
      if (o.imza) kuyruktanSil(o.imza);
      resolve({ ok: true, id: ref && ref.id });
    }).catch((e) => {
      const kod = (e && e.code) || "";
      kuyrugaEkle(tur, veri, kod);
      resolve({
        ok: false,
        kuyruk: true,
        neden: kod,
        izinHatasi: kod === "permission-denied"
      });
    });
  });
}

/* Kuyruk arayüzü (yönetici için) */
function kuyrukOzeti() {
  const q = kuyrukAl();
  const turler = {};
  q.forEach(x => { turler[x.tur] = (turler[x.tur] || 0) + 1; });
  return { toplam: q.length, turler, kayitlar: q };
}

/* Otomatik deneme — uygulama açılışında ve her 60 sn'de bir */
function kuyrukOtomatikBaslat() {
  setTimeout(() => { kuyrukGonder().catch(() => {}); }, 6000);
  setInterval(() => {
    if (kuyrukAl().length > 0) kuyrukGonder().catch(() => {});
  }, 60000);
}
