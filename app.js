/* =========================================================
   NUR DİŞ & DENTAL KLİNİK — kapsamlı offline PWA
   Vanilla JS + localStorage. Gerçek çok-kullanıcı senkronu,
   gerçek ödeme, gerçek Google girişi ve gerçek SMS/e-posta
   bildirimleri için bir sunucu (ör. Firebase) gerekir — bu
   dosyada bu noktalar açıkça yorum satırıyla işaretlendi.
========================================================= */

/* ---------------- VERİ ---------------- */

const SERVICES = [
  { id:"muayene", name:"Diş Muayenesi & Kontrol", price:"500 ₺", desc:"Genel ağız sağlığı kontrolü ve yönlendirme.", icon:"🩺", tone:"teal",
    info:"İlk muayenede ağız içi kontrol edilir, gerekiyorsa röntgen çekilir ve size özel tedavi planı çıkarılır.", before:null, after:null, video:null },
  { id:"temizlik", name:"Diş Temizliği (Detertraj)", price:"900 ₺", desc:"Diş taşı ve leke temizliği, parlatma.", icon:"✨", tone:"teal",
    info:"Ultrasonik cihazla diş taşları temizlenir, ardından parlatma işlemi yapılır. Ortalama 20-30 dakika sürer, ağrısızdır.", before:null, after:null, video:null },
  { id:"dolgu", name:"Dolgu", price:"700–1.500 ₺", desc:"Estetik kompozit dolgu uygulamaları.", icon:"🧩", tone:"teal",
    info:"Çürük temizlenir, diş rengiyle uyumlu kompozit malzeme ile doldurulur. Tek seansta tamamlanır.", before:null, after:"assets/treatment-process.jpg", video:null },
  { id:"kanal", name:"Kanal Tedavisi", price:"2.500–4.000 ₺", desc:"Ağrısız kanal tedavisi, tek/çok seans.", icon:"🌀", tone:"teal",
    info:"Lokal anestezi ile ağrısız şekilde uygulanır. Diş içindeki iltihaplı doku temizlenir, kanallar doldurulur.", before:null, after:"assets/treatment-process.jpg", video:"placeholder" },
  { id:"cekim", name:"Diş Çekimi", price:"800–2.000 ₺", desc:"Basit ve cerrahi çekim işlemleri.", icon:"✂️", tone:"teal",
    info:"Lokal anestezi altında yapılır. Gömülü/yirmilik diş gibi zor vakalarda cerrahi yöntem uygulanabilir.", before:null, after:null, video:null },
  { id:"beyazlatma", name:"Diş Beyazlatma", price:"3.000 ₺", desc:"Ofis tipi profesyonel beyazlatma.", icon:"☀️", tone:"teal",
    info:"Diş minesine zarar vermeyen özel jel ve ışık sistemi ile 1 seansta belirgin fark elde edilir.", before:"assets/whitening-before-after.jpg", after:null, video:null },
  { id:"implant", name:"İmplant", price:"12.000–18.000 ₺", desc:"Tek dişten tam çeneye implant çözümleri.", icon:"⚓", tone:"teal",
    info:"Eksik diş kökünün yerine titanyum vida yerleştirilir, üzerine kalıcı diş yapılır. Süreç ortalama 3-6 ay sürer, ara dönemde geçici diş kullanılır.", before:null, after:null, video:"placeholder" },
  { id:"zirkonyum", name:"Zirkonyum Kaplama", price:"4.500–7.000 ₺ / diş", desc:"Doğal görünümlü, dayanıklı diş kaplaması.", icon:"💎", tone:"blue",
    info:"Diş az miktarda küçültülür, ölçü alınır, zirkonyum kaplama üretilip yapıştırılır. Işığı doğal diş gibi yansıtır.", before:null, after:null, video:"placeholder" },
  { id:"ortodonti", name:"Ortodonti (Tel Tedavisi)", price:"Muayene sonrası", desc:"Şeffaf plak ve metal braket seçenekleri.", icon:"⭕", tone:"blue",
    info:"Diş sıralaması ve kapanış bozukluklarını düzeltmek için tel veya şeffaf plak kullanılır. Süreç 6 ay - 2 yıl arasında değişir.", before:null, after:null, video:"placeholder" },
  { id:"seffafplak", name:"Şeffaf Plak", price:"Muayene sonrası", desc:"Görünmez, çıkarılabilir diş düzeltme plakları.", icon:"◯", tone:"blue",
    info:"Şeffaf, çıkarılabilir plaklar ile fark edilmeden diş düzeltme yapılır. Günde 20-22 saat takılması önerilir.", before:null, after:null, video:null },
  { id:"kopru", name:"Köprü", price:"4.000–9.000 ₺ / diş", desc:"Eksik dişler için sabit köprü protezi.", icon:"🔗", tone:"blue",
    info:"Eksik dişin iki yanındaki dişler destek alınarak köprü protezi yapılır, sabittir ve çıkarılmaz.", before:null, after:null, video:null },
];

const DOCTORS = [
  { name:"Dt. Ramazan DAĞ", title:"Diş Hekimi — Klinik Sorumlusu", photo:"assets/doctor-photo.jpg",
    school:"Çukurova Üniversitesi Diş Hekimliği Fakültesi mezunu.",
    experience:"5 yıllık klinik deneyim.",
    focus:"İlgi alanları: kanal tedavisi, estetik diş hekimliği (zirkonyum/şeffaf plak) ve implantoloji." },
];

const DEVICES = [
  { name:"CBCT (3 Boyutlu Görüntüleme)", desc:"Çene ve diş yapısını 3 boyutlu olarak görüntüleyen ileri teknoloji cihaz. İmplant planlamasında hassas ölçüm sağlar.", icon:"🩻" },
  { name:"Ağız İçi 3D Tarayıcı", desc:"Ölçü almak için eski yöntemler yerine ağız içini dijital olarak tarar, hasta konforu artar.", icon:"📷" },
  { name:"3D Yazıcı", desc:"Şeffaf plak ve model üretiminde kullanılan hassas üretim cihazı.", icon:"🖨️" },
  { name:"Dijital Panoramik Röntgen", desc:"Düşük radyasyonla tüm ağız yapısının net görüntüsünü verir.", icon:"🦷" },
];

const SMILE_STYLES = [
  { id:"hollywood", name:"Hollywood Gülüşü", desc:"Parlak, maksimum beyazlık, simetrik kesim.", tint:"rgba(255,255,255,0.92)", glow:"rgba(255,255,255,0.35)" },
  { id:"dogal", name:"Doğal Gülüş", desc:"Hafif fildişi tonu, doğal diş dokusu hissi.", tint:"rgba(250,244,225,0.55)", glow:"rgba(255,250,235,0.15)" },
  { id:"zirkonyum", name:"Zirkonyum Estetik", desc:"Parlak yüzey, hafif mavi-beyaz yansıma.", tint:"rgba(235,248,255,0.85)", glow:"rgba(180,230,255,0.4)" },
  { id:"plak", name:"Şeffaf Plak Önizleme", desc:"Diş sıralamasının nasıl düzeleceğine dair kaba önizleme.", tint:"rgba(255,255,255,0.5)", glow:"rgba(160,255,220,0.25)" },
];

const PRODUCT_CATEGORIES = [
  { id:"cocuk", name:"Çocuk Ürünleri", items:[
    { id:"c1", name:"Çocuk Diş Fırçası (Yumuşak, Karakterli)", price:80 },
    { id:"c2", name:"Çocuk Diş Macunu (Florürsüz, Meyveli)", price:70 },
  ]},
  { id:"yetiskin", name:"Yetişkin Ürünleri", items:[
    { id:"y1", name:"Diş Fırçası (Orta Sertlik)", price:60 },
    { id:"y2", name:"Diş Macunu (Florürlü)", price:90 },
    { id:"y3", name:"Diş Macunu (Hassas Dişler İçin)", price:110 },
    { id:"y4", name:"Ağız Gargarası (Alkolsüz)", price:120 },
    { id:"y5", name:"Diş İpi", price:40 },
    { id:"y6", name:"Ağız Duşu (Irrigatör)", price:650 },
    { id:"y7", name:"Ev Tipi Beyazlatma Kiti", price:950 },
    { id:"y8", name:"Ortodontik Fırça (Tel Tedavisi İçin)", price:75 },
  ]},
];

const ARTICLES = [
  { group:"Bebekler", title:"İlk diş ne zaman çıkar?", body:"Bebeklerde ilk süt dişi genellikle 6-10 ay arasında çıkar. Diş çıkarma döneminde huzursuzluk, hafif ateş ve salya artışı görülebilir. Diş eti kaşıyıcıları ve soğutulmuş (dondurulmamış) diş kaşıyıcı halkalar rahatlatabilir." },
  { group:"Bebekler", title:"Biberon çürüğü nedir?", body:"Bebeğin geceleri şekerli sıvı (meyve suyu, şekerli süt) ile uyutulması ön dişlerde hızlı çürümeye yol açabilir. Gece emzirme/biberon sonrası nemli gazlı bezle diş etleri silinmelidir." },
  { group:"Çocuklar", title:"Süt dişleri neden önemli?", body:"Süt dişleri sadece çiğneme için değil, çene gelişimi ve kalıcı dişlerin doğru yerden çıkması için de kritik rol oynar. Erken çekilen süt dişi kalıcı dişte sıralanma bozukluğuna yol açabilir." },
  { group:"Çocuklar", title:"Çocuklarda fırçalama eğitimi", body:"6 yaşına kadar fırçalamayı bir yetişkin yapmalı veya kontrol etmelidir. Bezelye tanesi kadar florürlü macun kullanımı bu yaştan itibaren güvenlidir." },
  { group:"Yetişkinler", title:"Diş eti hastalıkları", body:"Diş eti kanaması, kızarıklık ve kötü ağız kokusu diş eti iltihabının (gingivitis) erken belirtileridir. Tedavi edilmezse periodontitise, sonrasında diş kaybına yol açabilir." },
  { group:"Yetişkinler", title:"Diş beyazlatma güvenli mi?", body:"Diş hekimi kontrolünde yapılan profesyonel beyazlatma güvenlidir. Minede kalıcı hasar bırakmaz, ancak hamilelikte ve aşırı hassasiyet durumunda ertelenmesi önerilir." },
];

const MYTHS = [
  { wrong:"Diş eti kanaması normaldir, önemli değildir.", right:"Kanama genellikle diş eti iltihabının belirtisidir; kontrole gidilmelidir." },
  { wrong:"Sadece şeker dişe zarar verir.", right:"Asitli içecekler ve meyve suları da diş minesini aşındırır." },
  { wrong:"Diş ağrısı geçtiyse sorun kalmamıştır.", right:"Ağrının kesilmesi bazen sinirin hasar gördüğü anlamına gelir, tedavi şarttır." },
  { wrong:"Süt dişleri önemli değildir, nasılsa dökülecek.", right:"Süt dişleri çene gelişimi ve kalıcı dişlerin konumu için kritik rol oynar." },
  { wrong:"Sert fırçalamak dişleri daha iyi temizler.", right:"Sert fırçalama diş eti çekilmesine ve mine aşınmasına yol açar." },
];

const TIME_SLOTS = ["09:00","10:00","11:00","12:00","14:00","15:00","16:00","17:00"];

const NAV_TABS = [
  { id:"home", label:"Ana Sayfa", icon:"🏠" },
  { id:"services", label:"Hizmetler", icon:"✨" },
  { id:"booking", label:"Randevu", icon:"📅" },
  { id:"chatbot", label:"Sohbet", icon:"💬" },
  { id:"more", label:"Diğer", icon:"⋯" },
];

const MORE_ITEMS = [
  { id:"doctors", label:"Doktorlarımız", icon:"👤" },
  { id:"devices", label:"Cihazlarımız", icon:"🖥️" },
  { id:"smile", label:"Gülüşünü Tasarla", icon:"😁" },
  { id:"reviews", label:"Referanslar", icon:"⭐" },
  { id:"store", label:"Mağaza", icon:"📦" },
  { id:"address", label:"Adresimiz", icon:"📍" },
  { id:"contact", label:"İletişim", icon:"✉️" },
  { id:"info", label:"Diş Sağlığı Bilgileri", icon:"📘" },
  { id:"admin-login", label:"Yönetici Girişi", icon:"🔒" },
];

/* Basit chatbot bilgi tabanı (kural bazlı, gerçek LLM değil — bkz. yorum en altta) */
const CHATBOT_KB = [
  { keys:["ağrı","acıyor","acı","sızlıyor"], reply:"Diş ağrısı genelde çürük, iltihap ya da kırık dişten kaynaklanır. Ağrı kesici geçici rahatlatabilir ama kaynağı ortadan kaldırmaz — en kısa sürede muayene randevusu almanı öneririm, kliniğimizde aynı gün bakılabiliyoruz." },
  { keys:["fiyat","ücret","ne kadar","kaç para"], reply:"Fiyatlar tedaviye göre değişir, Hizmetler sekmesinde başlangıç fiyatlarını görebilirsin. Net fiyat için muayene sonrası netleşir, ilk muayene 500₺. İstersen hemen randevu oluşturayım mı?" },
  { keys:["implant"], reply:"İmplant, eksik diş kökü yerine yerleştirilen titanyum bir vida ve üzerine yapılan kalıcı diştir. Süreç genelde 3-6 ay sürer ama ara dönemde geçici diş kullanılır, günlük hayatını etkilemez. Dr. Ramazan DAĞ implant konusunda deneyimli, muayeneye gelip planını çıkarabiliriz." },
  { keys:["kanal","kanal tedavisi"], reply:"Kanal tedavisi lokal anestezi ile tamamen ağrısız yapılır — çoğu hasta işlem sırasında hiçbir şey hissetmez. Diş içindeki iltihaplı doku temizlenip kanallar doldurulur. Merak etme, korkulacak bir şey yok." },
  { keys:["beyazlatma","sarı diş","sararma"], reply:"Profesyonel diş beyazlatma diş hekimi kontrolünde tamamen güvenlidir, mineye zarar vermez. Tek seansta belirgin fark görülür. Hamilelikte önerilmez, aşırı hassasiyette hekim değerlendirmesi gerekir." },
  { keys:["randevu","muayene"], reply:"Randevu sekmesinden 60 saniyede muayene randevusu oluşturabilirsin, biz seni arayıp teyit ederiz. Şimdi Randevu sekmesine geçmemi ister misin?" },
  { keys:["çocuk","bebek","çocuğum"], reply:"Çocuklarda ilk diş hekimi ziyareti genelde ilk dişin çıkmasıyla ya da 1 yaş civarında önerilir. Kliniğimizde çocuklara özel, ürkütmeyen bir yaklaşımımız var. Bilgi sekmesinde çocuk diş sağlığı hakkında yazılarımız da var." },
  { keys:["korku","korkuyorum","panik","kaygı"], reply:"Diş hekimi korkusu çok yaygın, yalnız değilsin. Kliniğimizde adım adım anlatarak, acele etmeden ilerliyoruz. İstersen önce sadece tanışma/muayene için gel, hiçbir işlem baskısı olmadan." },
  { keys:["adres","nerede","konum"], reply:"Kliniğimiz Mardin, Kızıltepe, TOKİ'de. Adresimiz sekmesinden QR kodla harita konumuna direkt ulaşabilirsin." },
  { keys:["telefon","iletişim","numara"], reply:"Bize 0505 105 03 02 numarasından ulaşabilirsin, ya da İletişim sekmesinden mesaj bırakabilirsin." },
  { keys:["zirkonyum"], reply:"Zirkonyum kaplama doğal diş görünümüne çok yakın, dayanıklı ve estetik bir çözümdür. Gülüşünü Tasarla sekmesinden kamerayla nasıl görüneceğini önizleyebilirsin." },
  { keys:["şeffaf plak","plak","invisalign"], reply:"Şeffaf plaklar görünmez şekilde diş düzeltir, günde 20-22 saat takılması gerekir. Tel tedavisine göre daha konforlu bir alternatiftir." },
  { keys:["merhaba","selam","iyi günler"], reply:"Merhaba! Nur Diş & Dental Klinik asistanınızım. Diş ağrısı, tedavi fiyatları, randevu ya da merak ettiğin herhangi bir konuda sorabilirsin." },
];
const CHATBOT_FALLBACK = "Bunu tam olarak yanıtlayamadım ama merak etme — Dr. Ramazan DAĞ ile muayenede bu konuyu detaylıca konuşabilirsin. İstersen hemen randevu oluşturayım mı, yoksa başka bir soru mu sormak istersin?";

/* ---------------- STATE ---------------- */

let state = {
  screen: "home",
  moreOpen: false,
  appointments: [],
  bookingForm: { date:"", time:"", name:"", phone:"" },
  bookingStatus: "idle",
  contactForm: { name:"", phone:"", msg:"" },
  contactStatus: "idle",
  reviews: [],
  reviewForm: { name:"", rating:5, text:"" },
  cart: {}, // productId -> qty
  checkoutForm: { name:"", phone:"", address:"" },
  checkoutStatus: "idle",
  chatLog: [{ from:"bot", text:"Merhaba! Nur Diş & Dental Klinik asistanıyım 😊 Diş ağrısı, fiyatlar, randevu ya da aklına takılan her şeyi sorabilirsin." }],
  chatInput: "",
  smileStyle: SMILE_STYLES[0].id,
  smileCameraOn: false,
  adminLoggedIn: false,
  adminForm: { user:"", pass:"" },
  adminError: "",
  customProducts: [],
  expandedService: null,
};

/* ---------------- STORAGE ---------------- */
function loadAll() {
  try { state.appointments = JSON.parse(localStorage.getItem("nurdis_appointments") || "[]"); } catch(e){ state.appointments = []; }
  try { state.reviews = JSON.parse(localStorage.getItem("nurdis_reviews") || "[]"); } catch(e){ state.reviews = []; }
  try { state.customProducts = JSON.parse(localStorage.getItem("nurdis_custom_products") || "[]"); } catch(e){ state.customProducts = []; }
}
function persist(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

/* Admin demo kimlik bilgileri — SADECE DEMO. Gerçek güvenlik için bu bilgiler
   asla istemci tarafı kodda tutulmamalı; gerçek kurulumda bir backend + hash'li
   şifre + oturum token'ı gerekir. */
const ADMIN_USER = "admin";
const ADMIN_PASS = "nurdis2026";

function allProducts() {
  const extra = state.customProducts.length ? [{ id:"ozel", name:"Diğer Ürünler", items: state.customProducts }] : [];
  return [...PRODUCT_CATEGORIES, ...extra];
}

/* ---------------- YARDIMCI UI PARÇALARI ---------------- */

function scallop() {
  let d = "M0,10 ";
  for (let i=0;i<10;i++) d += `Q${i*10+5},0 ${i*10+10},10 `;
  d += "L100,10 Z";
  return `<svg class="scallop" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="${d}" fill="#F1FAF8"/></svg>`;
}

function topbar(title, subtitle, opts) {
  opts = opts || {};
  const backBtn = opts.back ? `<button class="backbtn" data-action="goto" data-screen="${opts.back}">←</button>` : "";
  return `
    <div class="topbar">
      <div class="topbar-inner">
        ${backBtn}
        <div class="logo-badge">🦷</div>
        <div>
          <p class="eyebrow">Nur Diş &amp; Dental Klinik</p>
          <h1 class="title">${title}</h1>
          ${subtitle ? `<p class="subtitle">${subtitle}</p>` : ""}
        </div>
      </div>
      ${scallop()}
    </div>`;
}

function stars(n) {
  let s = "";
  for (let i=1;i<=5;i++) s += i<=n ? "★" : "☆";
  return `<span class="stars">${s}</span>`;
}

/* ---------------- HOME ---------------- */

function renderHome() {
  const grid = MORE_ITEMS.map(i => `
    <button class="grid-item" data-action="goto" data-screen="${i.id}">
      <span class="grid-icon">${i.icon}</span><span class="grid-label">${i.label}</span>
    </button>`).join("");

  return `
    <div class="topbar" style="background:none;padding:0;">
      <div class="hero" style="background-image:linear-gradient(160deg, rgba(10,92,82,.88), rgba(46,143,192,.82)), url('assets/clinic-hero.jpg');">
        <div class="hero-inner">
          <div class="logo-badge">🦷</div>
          <p class="eyebrow">Nur Diş &amp; Dental Klinik</p>
          <h1 class="title" style="font-size:26px;">Gülümsemenin adresi</h1>
          <p class="subtitle">Mardin, Kızıltepe TOKİ'de güven veren bakım.</p>
        </div>
        ${scallop()}
      </div>
    </div>
    <div class="content">
      <div class="card p5 mb4" style="border-color:var(--cta);">
        <div class="row-start">
          <div class="badge badge-teal">✨</div>
          <div>
            <p class="name" style="font-size:17px;">Hızlı randevu</p>
            <p class="desc">60 saniyede muayene randevusu oluştur, biz seni arayalım.</p>
            <button class="linklike" data-action="goto" data-screen="booking">Randevu al &rarr;</button>
          </div>
        </div>
      </div>

      <div class="card p4 mb5 row">
        <img src="assets/doctor-photo.jpg" class="avatar-sm" alt="Dt. Ramazan DAĞ" />
        <div>
          <p class="name" style="font-size:14px;">Dt. Ramazan DAĞ</p>
          <p class="desc">Klinik sorumlu hekimi · 5 yıl deneyim</p>
        </div>
      </div>

      <p class="section-label">Hızlı erişim</p>
      <div class="menu-grid mb5">${grid}</div>

      <p class="section-label">Öne çıkan hizmetler</p>
      <div class="hscroll">
        ${SERVICES.slice(0,6).map(s => `
          <div class="mini-card" data-action="goto-service" data-id="${s.id}">
            <div style="font-size:18px;">${s.icon}</div>
            <p class="name">${s.name}</p>
            <p class="price">${s.price}</p>
          </div>`).join("")}
      </div>
    </div>`;
}

/* ---------------- HİZMETLER ---------------- */

function renderServices() {
  const items = SERVICES.map(s => {
    const expanded = state.expandedService === s.id;
    let detail = "";
    if (expanded) {
      let media = "";
      if (s.before || s.after) {
        media = `<div class="before-after">
          ${s.before ? `<div><span class="ba-label">Öncesi/Örnek</span><img src="${s.before}" /></div>` : ""}
          ${s.after ? `<div><span class="ba-label">Sonrası/Süreç</span><img src="${s.after}" /></div>` : ""}
        </div>`;
      }
      let video = "";
      if (s.video) {
        video = `<div class="video-box">
          <div class="video-placeholder">▶️<br/><span>Tanıtım videosu yakında eklenecek</span></div>
        </div>`;
      }
      detail = `<div class="service-detail">
        <p class="desc" style="margin-bottom:10px;">${s.info}</p>
        ${media}${video}
      </div>`;
    }
    return `
    <div class="card p4 mb3">
      <div class="row" data-action="toggle-service" data-id="${s.id}" style="cursor:pointer;">
        <div class="badge ${s.tone==='blue'?'badge-blue':'badge-teal'}">${s.icon}</div>
        <div style="flex:1;padding-right:8px;">
          <p class="name">${s.name}</p>
          <p class="desc">${s.desc}</p>
        </div>
        <span class="price-pill ${s.tone==='blue'?'pill-blue':'pill-teal'}">${s.price}</span>
      </div>
      ${detail}
    </div>`;
  }).join("");
  return `${topbar("Hizmetler","Fiyatlar başlangıç seviyesindedir; kartlara dokunarak detay ve görselleri görebilirsin.")}
    <div class="content">${items}</div>`;
}

/* ---------------- DOKTORLAR ---------------- */

function renderDoctors() {
  const cards = DOCTORS.map(d => `
    <div class="card p5 mb3">
      <div class="row-start">
        <img src="${d.photo}" class="avatar-lg" alt="${d.name}" />
        <div>
          <p class="name" style="font-size:18px;">${d.name}</p>
          <p class="desc" style="color:var(--tealLight);font-weight:500;margin-top:2px;">${d.title}</p>
          <p class="desc" style="margin-top:8px;">🎓 ${d.school}</p>
          <p class="desc">🕐 ${d.experience}</p>
          <p class="desc">🦷 ${d.focus}</p>
        </div>
      </div>
    </div>`).join("");
  return `${topbar("Doktorlarımız","Kliniğimizde görev yapan uzman hekimler.", {back:"home"})}<div class="content">${cards}</div>`;
}

/* ---------------- CİHAZLARIMIZ ---------------- */

function renderDevices() {
  const cards = DEVICES.map(d => `
    <div class="card p4 mb3 row">
      <div class="badge badge-blue" style="font-size:22px;">${d.icon}</div>
      <div><p class="name" style="font-size:15px;">${d.name}</p><p class="desc">${d.desc}</p></div>
    </div>`).join("");
  return `${topbar("Cihazlarımız","Son teknoloji, yapay zeka destekli görüntüleme ve üretim cihazları.", {back:"home"})}
    <div class="content">${cards}<p class="footnote">Cihaz görselleri şu an ikon olarak gösteriliyor — gerçek cihaz fotoğraflarınızı gönderirseniz yerlerine yerleştiririm.</p></div>`;
}

/* ---------------- GÜLÜŞÜNÜ TASARLA (kamera + yüz takibi) ---------------- */

function renderSmile() {
  const styleBtns = SMILE_STYLES.map(s => `
    <button class="chip ${state.smileStyle===s.id?'chip-active':''}" data-action="pick-smile-style" data-id="${s.id}">${s.name}</button>`).join("");
  const activeDesc = SMILE_STYLES.find(s=>s.id===state.smileStyle)?.desc || "";

  return `${topbar("Gülüşünü Tasarla","Kameranı aç, gülümse ve farklı gülüş stillerini gerçek zamanlı önizle.", {back:"home"})}
    <div class="content">
      <div class="card p4 mb4">
        <p class="desc" style="margin-bottom:10px;">Bu özellik yüz takibi teknolojisiyle (gerçek zamanlı yüz/ağız algılama) çalışır — kameran cihazında işlenir, hiçbir görüntü sunucuya gönderilmez.</p>
        <div class="chip-row mb3">${styleBtns}</div>
        <p class="footnote" style="margin-bottom:10px;">${activeDesc}</p>
        <div id="smile-cam-wrap" class="cam-wrap">
          <video id="smile-video" playsinline muted style="display:none;"></video>
          <canvas id="smile-canvas"></canvas>
          <div id="smile-status" class="cam-status">Kamerayı başlatmak için butona bas</div>
        </div>
        <button class="btn-primary" data-action="toggle-camera" style="margin-top:12px;">
          ${state.smileCameraOn ? "📷 Kamerayı Kapat" : "📷 Kamerayı Aç ve Gülüşünü Gör"}
        </button>
      </div>
    </div>`;
}

/* ---------------- REFERANSLAR ---------------- */

function renderReviews() {
  const r = state.reviewForm;
  const list = state.reviews.length ? state.reviews.slice().reverse().map(rv => `
    <div class="card p4 mb3">
      <div class="row" style="justify-content:space-between;">
        <p class="name" style="font-size:14px;">${escapeHtml(rv.name)}</p>
        ${stars(rv.rating)}
      </div>
      <p class="desc" style="margin-top:6px;">${escapeHtml(rv.text)}</p>
    </div>`).join("") : `<p class="footnote">Henüz yorum yok — ilk yorumu sen yapabilirsin!</p>`;

  const ratingBtns = [1,2,3,4,5].map(n => `<button class="star-btn ${r.rating===n?'star-active':''}" data-action="pick-rating" data-n="${n}">★</button>`).join("");

  return `${topbar("Referanslar","Müşterilerimizin deneyimleri.", {back:"home"})}
    <div class="content">
      <div class="card p5 mb5">
        <p class="name" style="font-size:16px;margin-bottom:10px;">Yorum bırak</p>
        <div class="field"><label>Adın</label><input class="input" id="rv-name" placeholder="Adın" value="${escapeAttr(r.name)}" /></div>
        <div class="field"><label>Puan</label><div class="star-row">${ratingBtns}</div></div>
        <div class="field"><label>Yorumun</label><textarea id="rv-text" placeholder="Deneyimini paylaş">${escapeHtml(r.text)}</textarea></div>
        <button class="btn-primary" data-action="submit-review" ${!(r.name && r.text) ? "disabled":""}>Yorumu Paylaş</button>
      </div>
      ${list}
    </div>`;
}

/* ---------------- RANDEVU (sadece muayene) ---------------- */

function renderBooking() {
  const f = state.bookingForm;
  const slots = TIME_SLOTS.map(t => `<div class="slot ${f.time===t?'active':''}" data-action="pick-time" data-time="${t}">${t}</div>`).join("");
  const canSubmit = f.date && f.time && f.name && f.phone;
  let statusHtml = "";
  if (state.bookingStatus==="done") statusHtml = `<p class="status-ok">✓ Randevun kaydedildi, en kısa sürede aranacaksın. Yöneticimize bilgi iletildi.</p>`;
  if (state.bookingStatus==="error") statusHtml = `<p class="status-err">Kaydedilemedi, lütfen tekrar dene.</p>`;

  const list = state.appointments.slice().reverse().map(a => `
    <div class="card p4 mb3 row" style="justify-content:space-between;">
      <div><p class="name" style="font-size:14px;">Muayene</p><p class="desc">${escapeHtml(a.name)} · ${escapeHtml(a.phone)}</p></div>
      <span style="font-size:12px;color:var(--tealLight);font-family:'IBM Plex Mono',monospace;">${a.date} ${a.time}</span>
    </div>`).join("");

  return `${topbar("Randevu Al","Sadece muayene randevusu alınır — hangi tedaviye uygun olduğuna hekimimiz muayenede karar verir.")}
    <div class="content">
      <div class="card p5 mb5">
        <div class="field"><label>Hizmet</label><input class="input" value="Muayene" disabled style="background:#EEF6F4;color:var(--muted);" /></div>
        <div class="field"><label>Tarih</label><input class="input" type="date" id="f-date" value="${f.date}" /></div>
        <div class="field"><label>Saat</label><div class="slot-grid">${slots}</div></div>
        <div class="field"><label>Ad Soyad</label><input class="input" id="f-name" placeholder="Adınız Soyadınız" value="${escapeAttr(f.name)}" /></div>
        <div class="field"><label>Telefon</label><input class="input" id="f-phone" placeholder="05xx xxx xx xx" value="${escapeAttr(f.phone)}" /></div>
        <button class="btn-primary" data-action="submit-booking" ${!canSubmit || state.bookingStatus==='saving' ? 'disabled':''}>
          ${state.bookingStatus==='saving' ? 'Kaydediliyor…' : '📅 Randevuyu Onayla'}
        </button>
        ${statusHtml}
      </div>
      ${state.appointments.length ? `<p class="section-label">Randevularım</p>${list}` : ""}
    </div>`;
}

/* ---------------- MAĞAZA ---------------- */

function cartCount() { return Object.values(state.cart).reduce((a,b)=>a+b,0); }
function cartTotal() {
  let total = 0;
  const all = allProducts();
  for (const cat of all) for (const p of cat.items) if (state.cart[p.id]) total += p.price * state.cart[p.id];
  return total;
}

function renderStore() {
  if (state.checkoutStatus === "form") return renderCheckout();
  const cats = allProducts().map(cat => `
    <p class="section-label">${cat.name}</p>
    <div class="mb4">
      ${cat.items.map(p => `
        <div class="card p4 mb3 row" style="justify-content:space-between;">
          <div style="flex:1;"><p class="name" style="font-size:14px;">${p.name}</p><p class="desc">${p.price} ₺</p></div>
          <div class="qty-row">
            <button class="qty-btn" data-action="cart-dec" data-id="${p.id}">−</button>
            <span class="qty-val">${state.cart[p.id]||0}</span>
            <button class="qty-btn" data-action="cart-inc" data-id="${p.id}">+</button>
          </div>
        </div>`).join("")}
    </div>`).join("");

  const count = cartCount();
  return `${topbar("Mağaza","Klinikten temin edebileceğiniz ağız bakım ürünleri.", {back:"home"})}
    <div class="content" style="padding-bottom:90px;">
      ${cats}
      <p class="footnote">Ürünler örnektir — yönetici panelinden yeni ürün ekleyebilirsiniz.</p>
    </div>
    ${count>0 ? `<div class="cart-bar"><span>${count} ürün · ${cartTotal()} ₺</span><button class="btn-primary" style="width:auto;padding:10px 18px;" data-action="goto-checkout">Sepeti Onayla</button></div>` : ""}`;
}

function renderCheckout() {
  const c = state.checkoutForm;
  const canSubmit = c.name && c.phone && c.address;
  const lines = [];
  const all = allProducts();
  for (const cat of all) for (const p of cat.items) if (state.cart[p.id]) lines.push(`${p.name} × ${state.cart[p.id]} = ${p.price*state.cart[p.id]} ₺`);
  return `${topbar("Siparişi Tamamla","Ödeme banka hesabı üzerinden yapılır, kargo bilgisi telefonunuza iletilir.")}
    <div class="content">
      <div class="card p4 mb4">
        <p class="name" style="font-size:14px;margin-bottom:8px;">Sipariş özeti</p>
        ${lines.map(l=>`<p class="desc">${l}</p>`).join("")}
        <p class="name" style="margin-top:8px;">Toplam: ${cartTotal()} ₺</p>
      </div>
      <div class="card p5 mb4">
        <div class="field"><label>Ad Soyad</label><input class="input" id="ck-name" value="${escapeAttr(c.name)}" /></div>
        <div class="field"><label>Telefon</label><input class="input" id="ck-phone" placeholder="05xx xxx xx xx" value="${escapeAttr(c.phone)}" /></div>
        <div class="field"><label>Teslimat Adresi</label><textarea id="ck-address" placeholder="Açık adres">${escapeHtml(c.address)}</textarea></div>
        <button class="btn-primary" data-action="submit-order" ${!canSubmit?"disabled":""}>Siparişi Onayla</button>
      </div>
      <div class="card p4">
        <p class="footnote" style="margin:0;">💳 Ödeme: klinik IBAN'ına havale/EFT ile yapılır (yönetici panelinden IBAN eklenebilir). Ödeme dekontu WhatsApp/telefon ile iletilmelidir. Kargo takip numarası SMS ile paylaşılır.</p>
      </div>
      <button class="linklike" style="margin-top:12px;" data-action="back-to-store">← Mağazaya dön</button>
    </div>`;
}

/* ---------------- ADRES ---------------- */

function renderAddress() {
  const mapsUrl = "https://www.google.com/maps/search/?api=1&query=Nur+Di%C5%9F+%26+Dental+Klinik+K%C4%B1z%C4%B1ltepe+Mardin";
  const qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=" + encodeURIComponent(mapsUrl);
  return `${topbar("Adresimiz","Bizi haritada bulun veya QR kodu okutun.", {back:"home"})}
    <div class="content">
      <div class="card p4 mb4 row"><div style="font-size:16px;">📍</div><p style="margin:0;font-size:14px;">Mardin, Kızıltepe, TOKİ Mahallesi</p></div>
      <div class="card p5 mb4" style="text-align:center;">
        <img src="${qrUrl}" alt="Konum QR kodu" style="width:200px;height:200px;margin:0 auto;display:block;border-radius:12px;" />
        <p class="footnote">QR kodu okutunca doğrudan harita konumumuz açılır.</p>
      </div>
      <a href="${mapsUrl}" target="_blank" class="btn-primary" style="text-decoration:none;display:flex;">🗺️ Haritada Aç</a>
    </div>`;
}

/* ---------------- İLETİŞİM ---------------- */

function renderContact() {
  const c = state.contactForm;
  const canSubmit = c.name && c.msg;
  let statusHtml = "";
  if (state.contactStatus==="done") statusHtml = `<p class="status-ok">✓ Mesajın iletildi, teşekkürler.</p>`;
  if (state.contactStatus==="error") statusHtml = `<p class="status-err">Gönderilemedi, lütfen tekrar dene.</p>`;
  return `${topbar("İletişim","Bize ulaş, ya da mesaj bırak.", {back:"home"})}
    <div class="content">
      <div class="mb5">
        <div class="card p4 mb3 row"><div style="font-size:16px;">📍</div><p style="margin:0;font-size:14px;">Mardin, Kızıltepe, TOKİ</p></div>
        <div class="card p4 mb3 row"><div style="font-size:16px;">📞</div><p style="margin:0;font-size:14px;">0505 105 03 02</p></div>
        <div class="card p4 mb3 row"><div style="font-size:16px;">🕐</div><p style="margin:0;font-size:14px;">Hafta içi 09:00–18:00, Cumartesi 10:00–14:00</p></div>
        <div class="card p4 row"><div style="font-size:16px;">👤</div><p style="margin:0;font-size:14px;">Dt. Ramazan DAĞ</p></div>
      </div>
      <div class="card p5">
        <p class="name" style="font-size:17px;margin-bottom:12px;">Mesaj bırak</p>
        <div class="field"><label>Ad Soyad</label><input class="input" id="c-name" value="${escapeAttr(c.name)}" /></div>
        <div class="field"><label>Telefon (opsiyonel)</label><input class="input" id="c-phone" value="${escapeAttr(c.phone)}" /></div>
        <div class="field"><label>Mesajınız</label><textarea id="c-msg" placeholder="Sorunuzu yazın">${escapeHtml(c.msg)}</textarea></div>
        <button class="btn-primary" data-action="submit-contact" ${!canSubmit || state.contactStatus==='saving' ? 'disabled':''}>
          ${state.contactStatus==='saving' ? 'Gönderiliyor…' : '💬 Mesajı Gönder'}
        </button>
        ${statusHtml}
      </div>
    </div>`;
}

/* ---------------- BİLGİ ---------------- */

function renderInfo() {
  const groups = ["Bebekler","Çocuklar","Yetişkinler"];
  const articleHtml = groups.map(g => `
    <p class="section-label">${g}</p>
    <div class="mb4">
      ${ARTICLES.filter(a=>a.group===g).map(a => `
        <div class="card p4 mb3">
          <p class="name" style="font-size:14px;">${a.title}</p>
          <p class="desc" style="margin-top:6px;">${a.body}</p>
        </div>`).join("")}
    </div>`).join("");

  const myths = MYTHS.map(m => `
    <div class="card p4 mb3">
      <div class="row-start mb3"><div class="myth-x">✕</div><p class="desc" style="margin:0;">${m.wrong}</p></div>
      <div class="row-start"><div class="myth-check">✓</div><p class="name" style="font-size:14px;">${m.right}</p></div>
    </div>`).join("");

  return `${topbar("Diş Sağlığı Bilgileri","Bebeklerden yetişkinlere, doğru bilinen yanlışlar dahil.", {back:"home"})}
    <div class="content">
      <div class="card p4 mb4" style="padding:0;overflow:hidden;">
        <img src="assets/info-toothache.jpg" style="width:100%;display:block;" alt="Diş ağrısı bilgi kartı" />
      </div>
      ${articleHtml}
      <p class="section-label">Doğru bilinen yanlışlar</p>
      ${myths}
    </div>`;
}

/* ---------------- CHATBOT ---------------- */

function findChatReply(text) {
  const lower = text.toLocaleLowerCase("tr");
  for (const item of CHATBOT_KB) {
    for (const k of item.keys) if (lower.includes(k)) return item.reply;
  }
  return CHATBOT_FALLBACK;
}

function renderChatbot() {
  const msgs = state.chatLog.map(m => `
    <div class="chat-msg ${m.from==='user' ? 'chat-user':'chat-bot'}">${escapeHtml(m.text)}</div>`).join("");
  return `${topbar("Uzman Asistan","Diş sağlığı hakkında soru sor, sana yardımcı olayım.")}
    <div class="content" style="padding-bottom:100px;">
      <div class="chat-log" id="chat-log">${msgs}</div>
    </div>
    <div class="chat-input-bar">
      <input class="input" id="chat-input" placeholder="Bir şey sor..." value="${escapeAttr(state.chatInput)}" />
      <button class="btn-primary" style="width:auto;padding:10px 16px;" data-action="send-chat">Gönder</button>
    </div>`;
}

/* ---------------- YÖNETİCİ ---------------- */

function renderAdminLogin() {
  const f = state.adminForm;
  return `${topbar("Yönetici Girişi","Sadece klinik yönetimi içindir.", {back:"home"})}
    <div class="content">
      <div class="card p5">
        <div class="field"><label>Kullanıcı adı</label><input class="input" id="ad-user" value="${escapeAttr(f.user)}" /></div>
        <div class="field"><label>Şifre</label><input class="input" type="password" id="ad-pass" value="${escapeAttr(f.pass)}" /></div>
        ${state.adminError ? `<p class="status-err">${state.adminError}</p>` : ""}
        <button class="btn-primary" data-action="admin-login">Giriş Yap</button>
        <p class="footnote">Demo giriş: admin / nurdis2026 — gerçek kullanımda bu bilgi değiştirilmeli ve sunucu tarafında saklanmalıdır.</p>
      </div>
    </div>`;
}

function renderAdminPanel() {
  const apps = state.appointments.slice().reverse().map(a=>`<div class="card p3 mb2"><p class="desc" style="margin:0;">${a.date} ${a.time} · ${escapeHtml(a.name)} · ${escapeHtml(a.phone)}</p></div>`).join("") || `<p class="footnote">Henüz randevu yok.</p>`;
  return `${topbar("Yönetici Paneli","Randevular ve ürün yönetimi.", {back:"home"})}
    <div class="content">
      <p class="section-label">Gelen randevular (bu cihaz)</p>
      <div class="mb4">${apps}</div>
      <p class="section-label">Yeni ürün ekle</p>
      <div class="card p5 mb4">
        <div class="field"><label>Ürün adı</label><input class="input" id="np-name" /></div>
        <div class="field"><label>Fiyat (₺)</label><input class="input" id="np-price" type="number" /></div>
        <button class="btn-primary" data-action="admin-add-product">Ürünü Ekle</button>
      </div>
      <button class="linklike" data-action="admin-logout">Çıkış yap</button>
      <p class="footnote" style="margin-top:14px;">Not: Bu panel tek cihazda çalışır (localStorage). Tüm kullanıcılarda anlık görünmesi ve gerçek bildirim için bir sunucu (Firebase vb.) entegrasyonu gerekir.</p>
    </div>`;
}

/* ---------------- YARDIMCI: ESCAPE ---------------- */
function escapeHtml(s){ return (s||"").replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function escapeAttr(s){ return escapeHtml(s); }

/* ---------------- ANA RENDER / NAV ---------------- */

const SCREEN_MAP = {
  home: renderHome, services: renderServices, doctors: renderDoctors, devices: renderDevices,
  smile: renderSmile, reviews: renderReviews, booking: renderBooking, store: renderStore,
  address: renderAddress, contact: renderContact, info: renderInfo, chatbot: renderChatbot,
  "admin-login": renderAdminLogin, "admin-panel": renderAdminPanel,
};

function renderNav() {
  return NAV_TABS.map(t => `
    <button class="navbtn ${state.screen===t.id || (t.id==='more' && state.moreOpen) ?'active':''}" data-action="${t.id==='more'?'toggle-more':'goto'}" data-screen="${t.id}">
      <span class="icon">${t.icon}</span><span>${t.label}</span>
    </button>`).join("");
}

function renderMoreSheet() {
  if (!state.moreOpen) return "";
  const items = MORE_ITEMS.map(i => `
    <button class="grid-item" data-action="goto" data-screen="${i.id}">
      <span class="grid-icon">${i.icon}</span><span class="grid-label">${i.label}</span>
    </button>`).join("");
  return `<div class="sheet-overlay" data-action="toggle-more">
    <div class="sheet">
      <div class="sheet-handle"></div>
      <p class="section-label" style="margin-top:4px;">Diğer</p>
      <div class="menu-grid">${items}</div>
    </div>
  </div>`;
}

function render() {
  stopCameraHardware();
  const screenEl = document.getElementById("screen");
  let target = state.screen;
  if (target === "store" && state.checkoutStatus === "form") target = "store"; // checkout handled inside renderStore
  const fn = SCREEN_MAP[target] || renderHome;
  screenEl.innerHTML = fn();
  document.getElementById("navbar").innerHTML = renderNav();
  document.getElementById("more-sheet").innerHTML = renderMoreSheet();
  bindFieldEvents();
  if (state.screen === "smile" && state.smileCameraOn) startCamera();
  if (state.screen === "chatbot") { const log = document.getElementById("chat-log"); if (log) log.scrollTop = log.scrollHeight; }
}

function refreshDisabled() {
  const map = {
    "submit-booking": () => !(state.bookingForm.date && state.bookingForm.time && state.bookingForm.name && state.bookingForm.phone),
    "submit-contact": () => !(state.contactForm.name && state.contactForm.msg),
    "submit-review": () => !(state.reviewForm.name && state.reviewForm.text),
    "submit-order": () => !(state.checkoutForm.name && state.checkoutForm.phone && state.checkoutForm.address),
  };
  for (const action in map) {
    const btn = document.querySelector(`[data-action="${action}"]`);
    if (btn) btn.disabled = map[action]();
  }
}

function bindFieldEvents() {
  const $ = id => document.getElementById(id);
  if (state.screen === "booking") {
    const d=$("f-date"), n=$("f-name"), p=$("f-phone");
    if (d) d.onchange = e => { state.bookingForm.date = e.target.value; state.bookingStatus="idle"; render(); };
    if (n) n.oninput = e => { state.bookingForm.name = e.target.value; refreshDisabled(); };
    if (p) p.oninput = e => { state.bookingForm.phone = e.target.value; refreshDisabled(); };
  }
  if (state.screen === "contact") {
    const n=$("c-name"), p=$("c-phone"), m=$("c-msg");
    if (n) n.oninput = e => { state.contactForm.name = e.target.value; refreshDisabled(); };
    if (p) p.oninput = e => { state.contactForm.phone = e.target.value; };
    if (m) m.oninput = e => { state.contactForm.msg = e.target.value; refreshDisabled(); };
  }
  if (state.screen === "reviews") {
    const n=$("rv-name"), t=$("rv-text");
    if (n) n.oninput = e => { state.reviewForm.name = e.target.value; refreshDisabled(); };
    if (t) t.oninput = e => { state.reviewForm.text = e.target.value; refreshDisabled(); };
  }
  if (state.screen === "admin-login") {
    const u=$("ad-user"), p=$("ad-pass");
    if (u) u.oninput = e => { state.adminForm.user = e.target.value; };
    if (p) p.oninput = e => { state.adminForm.pass = e.target.value; };
  }
  if (state.screen === "admin-panel") {
    const n=$("np-name"), p=$("np-price");
    if (n) n.oninput = e => { state._newProdName = e.target.value; };
    if (p) p.oninput = e => { state._newProdPrice = e.target.value; };
  }
  if (state.screen === "chatbot") {
    const i=$("chat-input");
    if (i) { i.oninput = e => { state.chatInput = e.target.value; };
      i.onkeydown = e => { if (e.key==="Enter") sendChat(); }; }
  }
  if (state.screen === "store" && state.checkoutStatus === "form") {
    const n=$("ck-name"), p=$("ck-phone"), a=$("ck-address");
    if (n) n.oninput = e => { state.checkoutForm.name = e.target.value; refreshDisabled(); };
    if (p) p.oninput = e => { state.checkoutForm.phone = e.target.value; refreshDisabled(); };
    if (a) a.oninput = e => { state.checkoutForm.address = e.target.value; refreshDisabled(); };
  }
}

function sendChat() {
  const text = (state.chatInput||"").trim();
  if (!text) return;
  state.chatLog.push({ from:"user", text });
  state.chatInput = "";
  render();
  setTimeout(() => {
    const reply = findChatReply(text);
    state.chatLog.push({ from:"bot", text: reply });
    render();
  }, 350);
}

/* ---------------- TIKLAMA OLAYLARI ---------------- */

document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-action]");
  if (!el) return;
  const action = el.dataset.action;

  if (action === "goto") {
    state.screen = el.dataset.screen;
    state.moreOpen = false;
    if (state.screen !== "store") state.checkoutStatus = state.checkoutStatus === "form" ? "idle" : state.checkoutStatus;
    window.scrollTo(0,0);
    render();
  }
  if (action === "goto-service") {
    state.screen = "services";
    state.expandedService = el.dataset.id;
    render();
  }
  if (action === "toggle-service") {
    state.expandedService = state.expandedService === el.dataset.id ? null : el.dataset.id;
    render();
  }
  if (action === "toggle-more") {
    state.moreOpen = !state.moreOpen;
    render();
  }
  if (action === "pick-time") { state.bookingForm.time = el.dataset.time; state.bookingStatus="idle"; render(); }
  if (action === "submit-booking") {
    const f = state.bookingForm;
    if (!(f.date && f.time && f.name && f.phone)) return;
    state.bookingStatus = "saving"; render();
    setTimeout(() => {
      const entry = { id:Date.now(), date:f.date, time:f.time, name:f.name, phone:f.phone };
      state.appointments.push(entry);
      persist("nurdis_appointments", state.appointments);
      state.bookingStatus = "done";
      state.bookingForm = { date:"", time:"", name:"", phone:"" };
      render();
    }, 300);
  }
  if (action === "submit-contact") {
    const c = state.contactForm;
    if (!(c.name && c.msg)) return;
    state.contactStatus = "saving"; render();
    setTimeout(() => {
      let list=[]; try{ list = JSON.parse(localStorage.getItem("nurdis_messages")||"[]"); }catch(e){}
      list.push({ id:Date.now(), ...c });
      persist("nurdis_messages", list);
      state.contactStatus = "done";
      state.contactForm = { name:"", phone:"", msg:"" };
      render();
    }, 300);
  }
  if (action === "pick-rating") { state.reviewForm.rating = parseInt(el.dataset.n,10); render(); }
  if (action === "submit-review") {
    const r = state.reviewForm;
    if (!(r.name && r.text)) return;
    state.reviews.push({ id:Date.now(), name:r.name, rating:r.rating, text:r.text });
    persist("nurdis_reviews", state.reviews);
    state.reviewForm = { name:"", rating:5, text:"" };
    render();
  }
  if (action === "cart-inc") { state.cart[el.dataset.id] = (state.cart[el.dataset.id]||0)+1; render(); }
  if (action === "cart-dec") { state.cart[el.dataset.id] = Math.max(0,(state.cart[el.dataset.id]||0)-1); render(); }
  if (action === "goto-checkout") { state.checkoutStatus = "form"; render(); }
  if (action === "back-to-store") { state.checkoutStatus = "idle"; render(); }
  if (action === "submit-order") {
    const c = state.checkoutForm;
    if (!(c.name && c.phone && c.address)) return;
    let list=[]; try{ list = JSON.parse(localStorage.getItem("nurdis_orders")||"[]"); }catch(e){}
    const items = []; const all = allProducts();
    for (const cat of all) for (const p of cat.items) if (state.cart[p.id]) items.push({name:p.name, qty:state.cart[p.id], price:p.price});
    list.push({ id:Date.now(), ...c, items, total:cartTotal() });
    persist("nurdis_orders", list);
    state.cart = {};
    state.checkoutForm = { name:"", phone:"", address:"" };
    state.checkoutStatus = "idle";
    state.screen = "home";
    render();
    alert("Siparişiniz alındı! Ödeme ve kargo bilgileri için sizinle iletişime geçilecektir.");
  }
  if (action === "send-chat") sendChat();
  if (action === "pick-smile-style") { state.smileStyle = el.dataset.id; render(); }
  if (action === "toggle-camera") {
    state.smileCameraOn = !state.smileCameraOn;
    render();
  }
  if (action === "admin-login") {
    if (state.adminForm.user === ADMIN_USER && state.adminForm.pass === ADMIN_PASS) {
      state.adminLoggedIn = true; state.adminError = ""; state.screen = "admin-panel";
    } else {
      state.adminError = "Kullanıcı adı veya şifre hatalı.";
    }
    render();
  }
  if (action === "admin-logout") { state.adminLoggedIn = false; state.screen = "home"; render(); }
  if (action === "admin-add-product") {
    const name = state._newProdName, price = parseFloat(state._newProdPrice);
    if (!name || !price) return;
    state.customProducts.push({ id:"cp"+Date.now(), name, price });
    persist("nurdis_custom_products", state.customProducts);
    state._newProdName = ""; state._newProdPrice = "";
    render();
  }
});

/* ---------------- KAMERA + YÜZ TAKİBİ (Gülüşünü Tasarla) ----------------
   face-api.js (tinyFaceDetector + 68 nokta yüz landmark modeli) kullanılır.
   Ağız konturunu bulup üzerine seçilen "gülüş stiline" göre yarı saydam bir
   katman çizer. Model dosyaları CDN'den yüklenir; bu nedenle bu özellik
   yalnızca gerçek internet bağlantısı olan bir cihazda/host'ta çalışır.
   Bu ortamda (offline sandbox) test edilememiştir — canlıya alındıktan
   sonra bir kez kontrol edilmesi önerilir. */

let smileStream = null;
let smileRAF = null;
let faceApiReady = false;
let faceApiLoading = false;

async function ensureFaceApi() {
  if (faceApiReady) return true;
  if (faceApiLoading) return false;
  faceApiLoading = true;
  try {
    if (!window.faceapi) {
      await loadScript("https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js");
    }
    const MODEL_URL = "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights";
    await window.faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await window.faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    faceApiReady = true;
    return true;
  } catch (err) {
    console.error("face-api yüklenemedi:", err);
    return false;
  } finally {
    faceApiLoading = false;
  }
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src; s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
}

async function startCamera() {
  const statusEl = document.getElementById("smile-status");
  const video = document.getElementById("smile-video");
  const canvas = document.getElementById("smile-canvas");
  if (!video || !canvas) return;

  if (statusEl) statusEl.textContent = "Yüz takibi modeli yükleniyor...";
  const ok = await ensureFaceApi();
  if (!state.smileCameraOn) return; // kullanıcı bu sırada kapattıysa
  if (!ok) { if (statusEl) statusEl.textContent = "Yüz takibi başlatılamadı (internet bağlantısını kontrol edin)."; return; }

  try {
    smileStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
  } catch (err) {
    if (statusEl) statusEl.textContent = "Kameraya erişilemedi. Lütfen izin verin.";
    return;
  }
  video.srcObject = smileStream;
  video.style.display = "block";
  await video.play();
  canvas.width = video.videoWidth || 480;
  canvas.height = video.videoHeight || 640;
  if (statusEl) statusEl.textContent = "";

  const ctx = canvas.getContext("2d");
  const loop = async () => {
    if (!state.smileCameraOn) return;
    try {
      const det = await window.faceapi.detectSingleFace(video, new window.faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      if (det) {
        const mouth = det.landmarks.getMouth(); // 20 nokta, dış+iç dudak
        const style = SMILE_STYLES.find(s=>s.id===state.smileStyle) || SMILE_STYLES[0];
        ctx.save();
        ctx.beginPath();
        mouth.slice(0,12).forEach((pt,i) => { i===0 ? ctx.moveTo(pt.x,pt.y) : ctx.lineTo(pt.x,pt.y); });
        ctx.closePath();
        ctx.fillStyle = style.tint;
        ctx.shadowColor = style.glow; ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      }
    } catch (err) { /* kare atlanır */ }
    smileRAF = requestAnimationFrame(loop);
  };
  loop();
}

function stopCameraHardware() {
  // Sadece donanımı/döngüyü durdurur, state.smileCameraOn'a dokunmaz.
  // Her render() başında çağrılır (ekran yeniden çizilince video/canvas
  // elemanları da yok olduğu için akan stream'i kapatmak gerekir).
  if (smileRAF) cancelAnimationFrame(smileRAF);
  if (smileStream) { smileStream.getTracks().forEach(t=>t.stop()); smileStream = null; }
}

/* ---------------- BAŞLAT ---------------- */
loadAll();
const validScreens = Object.keys(SCREEN_MAP);
const hash = window.location.hash.replace("#","");
if (validScreens.includes(hash)) state.screen = hash;
render();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => { navigator.serviceWorker.register("sw.js").catch(()=>{}); });
}
