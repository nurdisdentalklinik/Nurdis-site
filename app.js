/* =========================================================
   NUR DİŞ & DENTAL KLİNİK — kapsamlı offline PWA
   Vanilla JS + localStorage. Gerçek çok-kullanıcı senkronu,
   gerçek ödeme, gerçek Google girişi ve gerçek SMS/e-posta
   bildirimleri için bir sunucu (ör. Firebase) gerekir — bu
   dosyada bu noktalar açıkça yorum satırıyla işaretlendi.
========================================================= */

/* ---------------- VERİ ---------------- */

const SERVICES = [
  { id:"muayene", name:"Diş Muayenesi & Kontrol", price:"Ücretsiz", desc:"Genel ağız sağlığı kontrolü ve yönlendirme.", img:"icon-muayene.png", tone:"teal",
    info:"İlk muayenede ağız içi kontrol edilir, gerekiyorsa röntgen çekilir ve size özel tedavi planı çıkarılır.", before:null, after:null, video:null },
  { id:"temizlik", name:"Diş Temizliği (Detertraj)", price:"900 ₺", desc:"Diş taşı ve leke temizliği, parlatma.", img:"icon-temizlik.png", tone:"teal",
    info:"Ultrasonik cihazla diş taşları temizlenir, ardından parlatma işlemi yapılır. Ortalama 20-30 dakika sürer, ağrısızdır.", before:null, after:null, video:null },
  { id:"dolgu", name:"Dolgu", price:"700–1.500 ₺", desc:"Estetik kompozit dolgu uygulamaları.", img:"icon-dolgu.png", tone:"teal",
    info:"Çürük temizlenir, diş rengiyle uyumlu kompozit malzeme ile doldurulur. Tek seansta tamamlanır.", before:null, after:null, video:null },
  { id:"kanal", name:"Kanal Tedavisi", price:"2.500–4.000 ₺", desc:"Ağrısız kanal tedavisi, tek/çok seans.", img:"icon-kanal.png", tone:"teal",
    info:"Lokal anestezi ile ağrısız şekilde uygulanır. Diş içindeki iltihaplı doku temizlenir, kanallar doldurulur.", before:null, after:null, video:"placeholder" },
  { id:"cekim", name:"Diş Çekimi", price:"800–2.000 ₺", desc:"Basit ve cerrahi çekim işlemleri.", img:"icon-cekim.png", tone:"teal",
    info:"Lokal anestezi altında yapılır. Gömülü/yirmilik diş gibi zor vakalarda cerrahi yöntem uygulanabilir.", before:null, after:null, video:null },
  { id:"beyazlatma", name:"Diş Beyazlatma", price:"3.000 ₺", desc:"Ofis tipi profesyonel beyazlatma.", img:"icon-beyazlatma.png", tone:"teal",
    info:"Diş minesine zarar vermeyen özel jel ve ışık sistemi ile 1 seansta belirgin fark elde edilir.", before:null, after:null, video:null },
  { id:"implant", name:"İmplant", price:"12.000–18.000 ₺", desc:"Tek dişten tam çeneye implant çözümleri.", img:"icon-implant.png", tone:"teal",
    info:"Eksik diş kökünün yerine titanyum vida yerleştirilir, üzerine kalıcı diş yapılır. Süreç ortalama 3-6 ay sürer, ara dönemde geçici diş kullanılır.", before:null, after:null, video:"placeholder" },
  { id:"zirkonyum", name:"Zirkonyum Kaplama", price:"4.500–7.000 ₺ / diş", desc:"Doğal görünümlü, dayanıklı diş kaplaması.", img:"icon-zirkonyum.png", tone:"blue",
    info:"Diş az miktarda küçültülür, ölçü alınır, zirkonyum kaplama üretilip yapıştırılır. Işığı doğal diş gibi yansıtır.", before:null, after:null, video:"placeholder" },
  { id:"ortodonti", name:"Ortodonti (Tel Tedavisi)", price:"Muayene sonrası", desc:"Şeffaf plak ve metal braket seçenekleri.", img:"icon-ortodonti.png", tone:"blue",
    info:"Diş sıralaması ve kapanış bozukluklarını düzeltmek için tel veya şeffaf plak kullanılır. Süreç 6 ay - 2 yıl arasında değişir.", before:null, after:null, video:"placeholder" },
  { id:"seffafplak", name:"Şeffaf Plak", price:"Muayene sonrası", desc:"Görünmez, çıkarılabilir diş düzeltme plakları.", img:"icon-seffafplak.png", tone:"blue",
    info:"Şeffaf, çıkarılabilir plaklar ile fark edilmeden diş düzeltme yapılır. Günde 20-22 saat takılması önerilir.", before:null, after:null, video:null },
  { id:"kopru", name:"Köprü", price:"4.000–9.000 ₺ / diş", desc:"Eksik dişler için sabit köprü protezi.", img:"icon-kopru.png", tone:"blue",
    info:"Eksik dişin iki yanındaki dişler destek alınarak köprü protezi yapılır, sabittir ve çıkarılmaz.", before:null, after:null, video:null },
];

const DOCTORS = [
  { id:"ramazan", name:"Dt. Ramazan DAĞ", title:"Diş Hekimi — Klinik Sorumlusu", photo:"doctor-photo.jpg",
    school:"Çukurova Üniversitesi Diş Hekimliği Fakültesi mezunu.",
    experience:"5 yıllık klinik deneyim.",
    focus:"İlgi alanları: kanal tedavisi, estetik diş hekimliği (zirkonyum/şeffaf plak) ve implantoloji.",
    bio:"Mesleğe başladığı ilk günden bu yana hastalarının sadece dişlerini değil, kendilerini de rahat hissettikleri bir ortam yaratmayı önceliği haline getirdi. Kanal tedavisi ve implantoloji alanında kendini sürekli güncel tutuyor, her vakayı kendi vakasıymış gibi titizlikle planlıyor. \"Bir hastanın yıllardır sakladığı gülüşünü yeniden özgürce göstermesini izlemek\" diyor, mesleğinin en çok sevdiği anı için — bu yüzden estetik diş hekimliğine ayrı bir tutkuyla yaklaşıyor. Kliniğinde hijyen ve hasta konforunu en az tedavi başarısı kadar önemsiyor." },
];

const DEVICES = [
  { id:"cbct", name:"CBCT (Konik Işınlı Bilgisayarlı Tomografi)", img:"icon-cbct.png",
    desc:"Çene ve diş yapısını 3 boyutlu olarak, milimetrik hassasiyetle görüntüler. Özellikle implant planlamasında sinir kanalı, kemik yoğunluğu ve yapının tam konumunu görmemizi sağlar — bu da işlemi çok daha öngörülebilir ve güvenli hale getirir." },
  { id:"scanner", name:"Ağız İçi 3D Tarayıcı (İntraoral Scanner)", img:"icon-scanner.png",
    desc:"Klasik ölçü kaşığı ve ölçü maddesi yerine ağız içini birkaç dakikada dijital olarak tarar. Kusma hissi ya da rahatsızlık olmadan, çok daha konforlu ve hassas bir ölçü alma deneyimi sunar." },
  { id:"printer3d", name:"3D Yazıcı", img:"icon-printer3d.png",
    desc:"Şeffaf plak, cerrahi rehber ve geçici protez modellerini dijital tasarımdan doğrudan üretir. Bu sayede üretim süresi kısalır ve hassasiyet artar." },
  { id:"panoramic", name:"Dijital Panoramik Röntgen", img:"icon-panoramic.png",
    desc:"Tüm ağız yapısını, çeneleri ve diş köklerini tek karede, klasik filme göre çok daha düşük radyasyon dozuyla görüntüler. Sonuç saniyeler içinde ekranda incelenebilir." },
  { id:"scaler", name:"Diş Taşı Temizleme Ünitesi (Ultrasonik Scaler)", img:"icon-scaler.png",
    desc:"Diş taşı ve renklenmeleri diş minesine zarar vermeden, ultrasonik titreşimle nazikçe temizler." },
  { id:"ledwhite", name:"LED Beyazlatma Sistemi", img:"icon-ledwhite.png",
    desc:"Özel jel ile birlikte kullanılan LED ışık sistemi, tek seansta belirgin ve güvenli bir beyazlatma sonucu sağlar." },
];

/* SMILE_STYLES kaldırıldı - Dişini Tasarla yeni kod bekleniyor */

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
  { group:"Bebekler", title:"İlk diş ne zaman çıkar?", body:"İlk süt dişi genellikle 6 ay civarında çıkar, ancak 3-14 ay arasında çıkması normal kabul edilir. Genellikle önce alt ön kesici dişler görünür. 18 ayda hiç diş çıkmadıysa çocuk diş hekimine danışılması önerilir." },
  { group:"Bebekler", title:"Diş çıkarma belirtileri nelerdir?", body:"Huzursuzluk, diş eti hassasiyeti, salya artışı ve hafif sıcaklık artışı diş çıkarmayla ilişkilendirilebilir. Ancak yüksek ateş, kızarıklık, ishal gibi belirtiler diş çıkarmayla açıklanamaz ve çocuk doktoruna danışılmalıdır." },
  { group:"Bebekler", title:"Diş çıkarma sırasında rahatlatma", body:"Temiz, soğutulmuş (dondurulmamış) bir diş kaşıyıcı, temiz bir parmakla nazik masaj ya da soğuk bir kaşık diş etindeki rahatsızlığı hafifletebilir. Sıvı içerikli ya da kolay kırılabilen plastik kaşıyıcılardan kaçınılmalıdır." },
  { group:"Bebekler", title:"Biberon çürüğü nedir?", body:"Bebeğin gece boyu şekerli sıvı (meyve suyu, şekerli süt) ile emzirilmesi ya da biberonla uyutulması, özellikle üst ön dişlerde hızlı ve yaygın çürümeye yol açabilir. Gece biberonuna sadece su konması önerilir." },
  { group:"Bebekler", title:"Bebeğin ağız bakımına ne zaman başlanmalı?", body:"İlk diş çıkmadan önce bile, her beslenme sonrası diş etleri temiz ve nemli bir gazlı bezle nazikçe silinebilir. İlk diş çıkar çıkmaz, macun kullanmadan parmak fırça ile fırçalamaya başlanabilir." },
  { group:"Bebekler", title:"İlk diş hekimi ziyareti ne zaman olmalı?", body:"Dünya Sağlık Örgütü ve birçok pedodonti uzmanı, ilk diş hekimi ziyaretinin ilk diş çıktıktan sonra, en geç 1 yaşına kadar yapılmasını önerir. Bu ziyaret erken teşhis ve ebeveynlere beslenme/bakım rehberliği açısından önemlidir." },
  { group:"Çocuklar", title:"Süt dişleri neden önemli?", body:"Süt dişleri yalnızca çiğneme için değil, çene ve yüz gelişimi, konuşma becerisi ve kalıcı dişlerin doğru yerden çıkması için de kritik rol oynar. Erken kaybedilen bir süt dişi, kalıcı dişte sıralanma bozukluğuna yol açabilir." },
  { group:"Çocuklar", title:"Çocuklarda fırçalama eğitimi", body:"5-6 yaşına kadar fırçalamayı bir yetişkin yapmalı ya da yakından kontrol etmelidir. 3 yaşına kadar bezelye tanesi büyüklüğünde florürsüz, sonrasında florürlü diş macunu kullanımı önerilir." },
  { group:"Çocuklar", title:"Süt dişleri ne zaman dökülmeye başlar?", body:"Süt dişleri genellikle 5,5-6 yaş civarında dökülmeye başlar ve bu süreç yaklaşık 11-12 yaşına kadar sürer. Toplam 20 süt dişinin yerini kalıcı dişler alır." },
  { group:"Çocuklar", title:"Fissür örtücü (çukur dolgu) nedir?", body:"Azı dişlerinin çiğneme yüzeyindeki derin çukur ve oyuklara uygulanan koruyucu bir tabakadır. Diş dokusu kesilmeden, ağrısız şekilde yapılır ve çürük oluşumunu önemli ölçüde azaltır." },
  { group:"Çocuklar", title:"Çocuğumun diş hekimi korkusu var, ne yapmalıyım?", body:"Ziyaret öncesi sakinleştirici, basit bir dille anlatım yapılması, 'iğne' gibi korkutucu kelimelerden kaçınılması ve geçmişteki kötü deneyimlerin çocuğun yanında konuşulmaması önerilir. Çocuğa özel (pedodonti) yaklaşım süreci çok kolaylaştırır." },
  { group:"Çocuklar", title:"Diş çürüğü bulaşıcı mıdır?", body:"Çürüğe neden olan bakteriler, özellikle bakım veren kişilerin (anne, yakın çevre) tükürüğü yoluyla bebeğe geçebilir. Kaşığı ortak kullanmamak, emziği ağza alıp temizlememek gibi basit önlemler bulaşmayı azaltır." },
  { group:"Yetişkinler", title:"Diş eti iltihabı (gingivitis) nedir?", body:"Diş eti hastalığının ilk ve geri döndürülebilir evresidir. Diş etlerinde kızarıklık, şişlik ve fırçalarken kanama görülür. Düzenli fırçalama, diş ipi ve profesyonel temizlikle tamamen iyileşebilir." },
  { group:"Yetişkinler", title:"Periodontitis (ileri diş eti hastalığı) nedir?", body:"Tedavi edilmeyen gingivitis, dişleri destekleyen kemik ve dokularda geri dönüşü zor hasara yol açan periodontitise ilerleyebilir. Erişkinlerde diş kaybının en sık nedenlerinden biridir; erken teşhis çok önemlidir." },
  { group:"Yetişkinler", title:"Diş eti çekilmesini önlemek", body:"Düzenli 6 aylık kontroller, doğru teknikle ve çok sert olmayan kıllı fırça kullanımı, düzenli profesyonel diş taşı temizliği diş eti çekilmesi riskini azaltır." },
  { group:"Yetişkinler", title:"Diş beyazlatma güvenli mi?", body:"Diş hekimi kontrolünde yapılan profesyonel beyazlatma, mineye kalıcı hasar vermeden güvenli şekilde uygulanır. Hamilelikte, emzirme döneminde ve aşırı hassasiyet durumunda ertelenmesi önerilir." },
  { group:"Yetişkinler", title:"Sigara ağız sağlığını nasıl etkiler?", body:"Sigara ve tütün ürünleri periodontal hastalık riskini belirgin şekilde artırır, iyileşmeyi yavaşlatır ve implant başarısızlığı riskini yükseltir. Bırakmak diş eti sağlığı için en etkili adımlardan biridir." },
  { group:"Yetişkinler", title:"Diş eti sağlığı ile genel sağlık ilişkisi", body:"Bilimsel çalışmalar, ağızdaki kronik iltihabın vücudun başka bölgelerini de etkileyebileceğini, örneğin periodontal hastalığın kalp-damar sağlığı riskiyle ilişkili olabileceğini göstermektedir. Bu da düzenli diş eti bakımını genel sağlık için önemli kılar." },
  { group:"Yetişkinler", title:"Elektrikli fırça mı, manuel fırça mı?", body:"Çalışmalar, elektrikli diş fırçalarının plak temizliğinde manuel fırçalara göre klinik olarak daha etkili olabildiğini gösteriyor. Ancak doğru teknikle kullanılan manuel fırça da yeterli temizliği sağlayabilir." },
  { group:"Yetişkinler", title:"Beslenme ve diş eti sağlığı", body:"Şeker ve rafine karbonhidratı sınırlamak, kalsiyum ve magnezyum açısından zengin besinler (süt ürünleri, badem, yeşil yapraklılar) ve omega-3 tüketmek diş eti iltihabına karşı koruyucu olabilir." },
];

const MYTHS = [
  { wrong:"Diş eti kanaması normaldir, önemli değildir.", right:"Kanama genellikle diş eti iltihabının belirtisidir; kontrole gidilmelidir." },
  { wrong:"Sadece şeker dişe zarar verir.", right:"Asitli içecekler ve meyve suları da diş minesini aşındırır." },
  { wrong:"Diş ağrısı geçtiyse sorun kalmamıştır.", right:"Ağrının kesilmesi bazen sinirin hasar gördüğü anlamına gelir, tedavi şarttır." },
  { wrong:"Süt dişleri önemli değildir, nasılsa dökülecek.", right:"Süt dişleri çene gelişimi ve kalıcı dişlerin konumu için kritik rol oynar." },
  { wrong:"Sert fırçalamak dişleri daha iyi temizler.", right:"Sert fırçalama diş eti çekilmesine ve mine aşınmasına yol açar." },
  { wrong:"Diş beyazlatma dişlere zarar verir.", right:"Hekim kontrolünde yapılan profesyonel beyazlatma mineye kalıcı zarar vermez." },
  { wrong:"Diş eti kanaması olduğunda fırçalamayı bırakmalıyım.", right:"Aksine, nazik ama düzenli fırçalamaya devam etmek iyileşmeyi hızlandırır." },
  { wrong:"Diş ipi sadece büyük parçalar sıkıştığında gerekir.", right:"Diş ipi, fırçanın ulaşamadığı diş aralarındaki günlük plağı temizlemek için her gün kullanılmalıdır." },
  { wrong:"Ağız kokusu her zaman ağız temizliğiyle ilgilidir.", right:"Bazen mide, sinüs ya da sistemik nedenlerden de kaynaklanabilir; geçmiyorsa muayene gerekir." },
  { wrong:"Süt dişi çürüğü kalıcı dişi etkilemez.", right:"Tedavi edilmeyen süt dişi çürüğü altındaki kalıcı diş tomurcuğuna da zarar verebilir." },
];

/* ---------------- ŞİFALI BİTKİLER (yalnızca bilgi amaçlıdır) ----------------
   Bu bölüm tıbbi tavsiye yerine geçmez; tedavi öneren bir kaynak DEĞİLDİR.
   Sorumluluk kullanıcıya aittir, ciddi/uzun süren şikayetlerde mutlaka
   diş hekimine başvurulmalıdır. */
const HERBS = [
  { name:"Karanfil (Karanfil Yağı)", helps:"Geçici diş ağrısı, ağız kokusu", how:"Bir-iki damla karanfil yağı temiz bir pamuğa damlatılıp ağrıyan bölgeye nazikçe dokundurulabilir.", amount:"Günde birkaç kez, az miktarda", caution:"Yutulmamalı, dişetine doğrudan ve fazla miktarda uygulanmamalıdır — tahriş yapabilir." },
  { name:"Adaçayı", helps:"Ağız içi iltihap, boğaz ve diş eti rahatsızlığı", how:"Kaynar suda demlenip ılınmış adaçayı ile gargara yapılabilir.", amount:"Günde 2-3 kez gargara", caution:"Hamilelikte ve uzun süreli yüksek dozda kullanımdan kaçınılmalıdır." },
  { name:"Tuzlu Su", helps:"Diş çekimi sonrası, hafif diş eti iltihabı", how:"Ilık suya bir tatlı kaşığı tuz karıştırılıp nazikçe gargara yapılır.", amount:"Günde 2-3 kez", caution:"Yutulmamalı, çekim sonrası ilk 24 saatte hekim talimatına uyulmalıdır." },
  { name:"Nane", helps:"Ağız kokusu, ferahlık hissi", how:"Taze nane çiğnenebilir ya da nane çayı gargara olarak kullanılabilir.", amount:"Günde birkaç kez", caution:"Ciddi bir yan etkisi bilinmemektedir, ancak reflü hastalarında mide yakınmasını artırabilir." },
  { name:"Papatya", helps:"Ağız içi tahriş, hafif iltihap, rahatlama", how:"Papatya çayı demlenip ılıtıldıktan sonra gargara yapılabilir ya da içilebilir.", amount:"Günde 2-3 kez", caution:"Papatyaya karşı alerjisi olanlar kullanmamalıdır." },
];

const TIME_SLOTS = ["09:00","10:00","11:00","12:00","14:00","15:00","16:00","17:00"];

const NAV_TABS = [
  { id:"home", label:"Ana Sayfa", icon:"home", img:"tab-home.png" },
  { id:"services", label:"Hizmetler", icon:"sparkle", img:"tab-services.png" },
  { id:"booking", label:"Randevu", icon:"calendar", img:"tab-booking.png" },
  { id:"chatbot", label:"DİJİ RAMO", icon:"chat", img:"tab-chatbot.png" },
  { id:"more", label:"Diğer", icon:"dots", img:"tab-more.png" },
];

const MORE_ITEMS = [
  { id:"account", label:"Hesabım", img:"icon-account.png" },
  { id:"doctors", label:"Doktorlarımız", img:"icon-doctors.png" },
  { id:"devices", label:"Cihazlarımız", img:"icon-devices.png" },
  { id:"smile", label:"Gülüşünü Tasarla", img:"icon-smile.png" },
  { id:"dentist-game", label:"Dentist Oyunu", img:"dentist-game-logo.png" },

  { id:"reviews", label:"Yorumlar", img:"icon-reviews.png" },
  { id:"store", label:"Mağaza", img:"icon-store.png" },
  { id:"address", label:"Adresimiz", img:"icon-address.png" },
  { id:"contact", label:"İletişim", img:"icon-contact.png" },
  { id:"info", label:"Diş Sağlığı Bilgileri", img:"icon-info.png" },
  { id:"admin-login", label:"Yönetici Girişi", img:"icon-admin.png" },
  { id:"settings", label:"Ayarlar", img:"icon-settings.png" },
];

/* Basit chatbot bilgi tabanı (kural bazlı, gerçek LLM değil — bkz. yorum en altta) */
/* ---------------- ÖZEL ÇİZİLMİŞ İKON KÜTÜPHANESİ ----------------
   Hepsi orijinal, elle çizilmiş SVG path'leri — hiçbir dış ikon
   setinden veya görselden kopyalanmadı, telif riski yoktur. */
const ICONS = {
  home: '<path d="M4 11.5 12 4l8 7.5" /><path d="M6 10v9a1 1 0 0 0 1 1h4v-6h2v6h4a1 1 0 0 0 1-1v-9" />',
  sparkle: '<path d="M12 3l1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6z" />',
  calendar: '<rect x="4" y="5.5" width="16" height="14" rx="2"/><path d="M4 10h16M8 3.5v3M16 3.5v3"/>',
  chat: '<path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7A2.5 2.5 0 0 1 17.5 16H10l-4.5 4v-4H6.5A2.5 2.5 0 0 1 4 13.5z"/>',
  dots: '<circle cx="6" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="18" cy="12" r="1.4"/>',
  user: '<circle cx="12" cy="8" r="3.4"/><path d="M5 20c0-3.6 3.2-6 7-6s7 2.4 7 6"/>',
  monitor: '<rect x="3.5" y="5" width="17" height="12" rx="1.6"/><path d="M9 20h6M12 17v3"/>',
  smile: '<circle cx="12" cy="12" r="8"/><path d="M8.5 13.5c1 1.6 2.2 2.4 3.5 2.4s2.5-.8 3.5-2.4"/><circle cx="9" cy="10" r=".9" fill="currentColor" stroke="none"/><circle cx="15" cy="10" r=".9" fill="currentColor" stroke="none"/>',
  star: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z"/>',
  box: '<path d="M12 3.5 20 8v8l-8 4.5L4 16V8z"/><path d="M4 8l8 4.5L20 8M12 12.5V21"/>',
  pin: '<path d="M12 21s-6.5-6-6.5-11A6.5 6.5 0 0 1 18.5 10c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
  mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="1.8"/><path d="M4 6.5l8 6.5 8-6.5"/>',
  book: '<path d="M4 5.5c2.4-1 5-1 7 .3v13c-2-1.3-4.6-1.3-7-.3z"/><path d="M20 5.5c-2.4-1-5-1-7 .3v13c2-1.3 4.6-1.3 7-.3z"/>',
  lock: '<rect x="5" y="10.5" width="14" height="9.5" rx="1.8"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
  login: '<path d="M11 4H6.5A1.5 1.5 0 0 0 5 5.5v13A1.5 1.5 0 0 0 6.5 20H11"/><path d="M14 8l4 4-4 4M18 12H9"/>',
  stethoscope: '<path d="M7 4v5a4 4 0 0 0 8 0V4"/><path d="M11 13v2a5 5 0 0 0 10 0v-1.5"/><circle cx="21" cy="12.3" r="1.4"/><circle cx="7" cy="4" r="1.2"/><circle cx="11" cy="4" r="1.2"/>',
  tooth: '<path d="M12 4c-2.4 0-4 1.3-5.4.4-1.4-1-3 .3-2.7 2.4.3 2 .9 3 1.3 5 .4 2 1 4 2.3 4 1.4 0 1.4-2.6 2.6-2.6s1.2 2.6 2.6 2.6c1.3 0 1.9-2 2.3-4 .4-2 1-3 1.3-5 .3-2.1-1.3-3.4-2.7-2.4C16 5.3 14.4 4 12 4z"/>',
  spiral: '<path d="M12 20a3 3 0 1 1 0-6 5 5 0 1 1 0-10 7 7 0 1 1 0 14"/>',
  extract: '<path d="M9 3v9c0 2.8 1.3 5 3 5s3-2.2 3-5V3"/><path d="M7 21l2.5-4M17 21l-2.5-4"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v3M12 18.5v3M4.5 12h-3M22.5 12h-3M6 6l-2-2M20 6l-2-2M6 18l-2 2M20 18l2 2"/>',
  implant: '<path d="M8 3h8l-1 6H9z"/><path d="M9.5 9v3.5a2.5 2.5 0 0 0 5 0V9"/><path d="M11.2 12.5l-.6 7.5M12.8 12.5l.6 7.5"/>',
  gem: '<path d="M5 9l3.5-5.5h7L19 9l-7 11.5z"/><path d="M5 9h14M8.5 3.5L9.5 9l2.5 11.5M15.5 3.5L14.5 9 12 20.5"/>',
  brace: '<path d="M4 12h2l1.5-3L9 15l1.5-6L12 12h2l1.5-3L17 15l1.5-6h1.5"/>',
  tray: '<path d="M4.5 9.5c0-2.5 3.4-4.5 7.5-4.5s7.5 2 7.5 4.5-3.4 4.5-7.5 4.5-7.5-2-7.5-4.5z"/><path d="M6 12v2.5c0 2 2.7 3.5 6 3.5s6-1.5 6-3.5V12"/>',
  link: '<circle cx="7" cy="12" r="3.2"/><circle cx="17" cy="12" r="3.2"/><path d="M10 12h4"/>',
  scan3d: '<circle cx="12" cy="12" r="7.5"/><path d="M4.5 12a7.5 3 0 0 0 15 0 7.5 3 0 0 0-15 0z"/><path d="M12 4.5v15"/>',
  printer: '<rect x="5" y="9" width="14" height="7" rx="1.4"/><path d="M7.5 9V4.5h9V9M7.5 16v3.5h9V16"/>',
  wand: '<path d="M5 19l9-9"/><path d="M15.5 3.5l1 2 2 1-2 1-1 2-1-2-2-1 2-1z"/><circle cx="6" cy="18" r="1.3"/>',
  jaw: '<path d="M4 9c0 6 3.6 10 8 10s8-4 8-10"/><path d="M8 9v3M11 9v4M14 9v4M17 9v3"/>',
};
function icon(name, size=20) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]||''}</svg>`;
}

const CHATBOT_KB = [
  { keys:["ağrı","acıyor","acı","sızlıyor"], reply:"Diş ağrısı genelde çürük, iltihap ya da kırık dişten kaynaklanır. Ağrı kesici geçici rahatlatabilir ama kaynağı ortadan kaldırmaz — en kısa sürede muayene randevusu almanı öneririm, kliniğimizde aynı gün bakılabiliyoruz.", goto:"booking" },
  { keys:["sgk","sosyal güvenlik","anlaşmalı mı","devlet"], reply:"Şu an için SGK anlaşmamız bulunmuyor. Ama muayene ücretsiz, tedavi fiyatlarımız da makul seviyede tutuyoruz." },
  { keys:["fiyat","ücret","ne kadar","kaç para","pahalı","ucuz"], reply:"Muayene tamamen ücretsizdir! Diğer tedavilerin fiyatı ağzının durumuna göre değişir, net rakamı muayeneden sonra hekimimiz söyler. İstersen hemen ücretsiz muayene randevusu oluşturayım mı?", goto:"booking" },
  { keys:["implant"], reply:"İmplant, eksik diş kökü yerine yerleştirilen titanyum bir vida ve üzerine yapılan kalıcı diştir. Süreç genelde 3-6 ay sürer ama ara dönemde geçici diş kullanılır, günlük hayatını etkilemez. Dr. Ramazan DAĞ implant konusunda deneyimli, muayeneye gelip planını çıkarabiliriz.", goto:"services", expand:"implant" },
  { keys:["kanal","kanal tedavisi"], reply:"Kanal tedavisi lokal anestezi ile tamamen ağrısız yapılır — çoğu hasta işlem sırasında hiçbir şey hissetmez. Diş içindeki iltihaplı doku temizlenip kanallar doldurulur. Merak etme, korkulacak bir şey yok.", goto:"services", expand:"kanal" },
  { keys:["beyazlatma","sarı diş","sararma"], reply:"Profesyonel diş beyazlatma diş hekimi kontrolünde tamamen güvenlidir, mineye zarar vermez. Tek seansta belirgin fark görülür. Hamilelikte önerilmez, aşırı hassasiyette hekim değerlendirmesi gerekir.", goto:"services", expand:"beyazlatma" },
  { keys:["dolgu"], reply:"Dolgu, çürük temizlendikten sonra diş rengiyle uyumlu kompozit malzeme ile boşluğun doldurulmasıdır. Tek seansta, ağrısız şekilde tamamlanır.", goto:"services", expand:"dolgu" },
  { keys:["çekim","diş çekimi"], reply:"Diş çekimi lokal anestezi altında ağrısız şekilde yapılır. Gömülü ya da yirmilik diş gibi zor vakalarda cerrahi yöntem uygulanabilir.", goto:"services", expand:"cekim" },
  { keys:["köprü","kopru"], reply:"Köprü, eksik dişin iki yanındaki dişler destek alınarak yapılan sabit bir protezdir, çıkarılmaz.", goto:"services", expand:"kopru" },
  { keys:["randevu","muayene ol","görüşmek istiyorum"], reply:"Hemen Randevu sekmesine yönlendiriyorum, 60 saniyede ücretsiz muayene randevunu oluşturabilirsin.", goto:"booking" },
  { keys:["çocuk","bebek","çocuğum"], reply:"Çocuklarda ilk diş hekimi ziyareti genelde ilk dişin çıkmasıyla ya da 1 yaş civarında önerilir. Kliniğimizde çocuklara özel, ürkütmeyen bir yaklaşımımız var. Bilgi sekmesinde çocuk diş sağlığı hakkında yazılarımız da var.", goto:"info" },
  { keys:["korku","korkuyorum","panik","kaygı"], reply:"Diş hekimi korkusu çok yaygın, yalnız değilsin. Kliniğimizde adım adım anlatarak, acele etmeden ilerliyoruz. İstersen önce sadece tanışma/muayene için gel, hiçbir işlem baskısı olmadan." },
  { keys:["adres","nerede","konum"], reply:"Kliniğimiz Mardin, Kızıltepe, TOKİ'de. Adresimiz sekmesinden QR kodla harita konumuna direkt ulaşabilirsin.", goto:"address" },
  { keys:["telefon","iletişim","numara"], reply:"Bize 0505 105 03 02 numarasından ulaşabilirsin, ya da İletişim sekmesinden mesaj bırakabilirsin.", goto:"contact" },
  { keys:["zirkonyum"], reply:"Zirkonyum kaplama doğal diş görünümüne çok yakın, dayanıklı ve estetik bir çözümdür. Detaylı bilgi için randevu alabilirsin.", goto:"services", expand:"zirkonyum" },
  { keys:["şeffaf plak","plak","invisalign"], reply:"Şeffaf plaklar görünmez şekilde diş düzeltir, günde 20-22 saat takılması gerekir. Tel tedavisine göre daha konforlu bir alternatiftir.", goto:"services", expand:"seffafplak" },
  { keys:["ortodonti","diş teli","tel tedavisi"], reply:"Ortodonti, diş sıralaması ve kapanış bozukluklarını düzeltir; tel ya da şeffaf plak ile uygulanabilir. Hem çocuk hem yetişkinlerde uygulanabilir, yaş sınırı yoktur.", goto:"services", expand:"ortodonti" },
  { keys:["merhaba","selam","iyi günler","günaydın","hey","selamun"], reply:"Merhaba! Nur Diş & Dental Klinik DİJİ RAMO'yum. Diş ağrısı, tedaviler, randevu ya da merak ettiğin herhangi bir konuda sorabilirsin." },
  { keys:["nasılsın","naber","ne haber","iyi misin"], reply:"Ben bir yazılımım, o yüzden günüm falan yok ama hazır ve nazırım 😊 Sen nasılsın, dişlerinle ilgili bir şey mi merak ediyorsun?" },
  { keys:["iyiyim","ben de iyi","güzel","süper","harika"], reply:"Duymak güzel! Diş sağlığınla ilgili merak ettiğin bir şey varsa ya da randevu almak istersen buradayım." },
  { keys:["adın ne","ismin ne","adin"], reply:"Ben DİJİ RAMO, Nur Diş & Dental Klinik'in yapay zeka asistanıyım 😊 Bana diş sağlığın hakkında her şeyi sorabilirsin." },
  { keys:["kaç yaşındasın","yaşın kaç"], reply:"Ben DİJİ RAMO, bir yapay zeka asistanıyım, yaşım yok 😄 Ama sana yardımcı olmak için buradayım." },
  { keys:["görüşürüz","hoşça kal","bay bay","kapat"], reply:"Görüşmek üzere! İhtiyacın olursa yine buradayım. İyi günler 👋" },
  { keys:["evet"], reply:"Harika, o zaman seni Randevu sekmesine yönlendiriyorum.", goto:"booking" },
  { keys:["hayır","yok"], reply:"Tamam, sorun değil. Başka merak ettiğin bir şey olursa buradayım." },
  { keys:["şaka","komik","güldürüyorsun"], reply:"😄 Diş hekimliğinde gülmek serbest, hatta önerilir! Başka bir konuda yardımcı olabilir miyim?" },
  { keys:["teşekkür","sağol","eyvallah"], reply:"Rica ederim! Başka bir sorun olursa buradayım. İyi günler dilerim 😊" },
  { keys:["hassasiyet","hassas diş","soğuk sıcak"], reply:"Sıcak-soğuğa hassasiyet genelde mine aşınması, diş eti çekilmesi ya da çürükten kaynaklanır. Hassasiyet macunları geçici rahatlatır ama nedeni bulup tedavi etmek kalıcı çözümdür — bir muayene ile netleştirebiliriz.", goto:"booking" },
  { keys:["diş eti","kanama","kanıyor"], reply:"Diş eti kanaması genelde diş eti iltihabının (gingivit) ilk belirtisidir. Erken fark edilirse detertraj (diş taşı temizliği) ile kolayca düzelir, ihmal edilirse periodontitise ilerleyebilir." },
  { keys:["hamile","hamilelik","gebelik"], reply:"Hamilelikte diş eti daha hassas olabilir, rutin kontrol ve diş temizliği güvenlidir. Röntgen ve bazı tedaviler genelde 2. trimestıra ertelenir, hekimin doktorunla koordineli çalışır." },
  { keys:["şeker hastası","diyabet"], reply:"Diyabet diş eti hastalıklarına yatkınlığı artırır, bu yüzden diyabet hastalarında düzenli diş kontrolü daha da önemlidir. Muayenede şeker durumunu hekimimizle paylaşman yeterli." },
  { keys:["sigara","tütün"], reply:"Sigara diş eti hastalığı, leke, kötü koku ve implant başarısızlığı riskini artırır. Bırakmak zor olsa da diş sağlığın için en büyük iyiliklerden biri olur." },
  { keys:["ağız kokusu","nefes kokusu","kötü koku"], reply:"Ağız kokusunun en sık nedeni diş taşı, çürük ya da dil üzerindeki bakteri birikimidir. Bazen mide/sinüs kaynaklı da olabilir. Detertraj ve düzenli diş ipi kullanımı çoğu vakada işe yarar." },
  { keys:["20 yaş","yirmilik","gömülü diş"], reply:"Yirmilik dişler bazen düzgün çıkamayıp gömülü kalabilir ve ağrı/şişlik yapabilir. Röntgenle durumuna bakıp basit ya da cerrahi çekim gerekip gerekmediğine karar veririz." },
  { keys:["diş gıcırdatma","bruksizm","gece diş sıkma"], reply:"Uykuda diş gıcırdatma (bruksizm) dişlerde aşınma ve çene ağrısına yol açabilir. Gece plağı (night guard) dişlerini korumada oldukça etkilidir, muayenede ölçü alabiliriz." },
  { keys:["çene ağrısı","tme","çenem"], reply:"Çene ekleminde ağrı/tıkırtı (TME rahatsızlığı) stres, diş sıkma ya da kapanış bozukluğundan kaynaklanabilir. Muayenede değerlendirip uygun yönlendirmeyi yaparız." },
  { keys:["aft","yara","mouth ulser"], reply:"Ağız içi aftlar genelde 1-2 haftada kendiliğinden iyileşir. Sık tekrarlıyorsa ya da 2 haftadan uzun sürüyorsa mutlaka kontrol ettirmelisin." },
  { keys:["diş ipi","flos","nasıl kullan"], reply:"Diş ipini dişler arasına nazikçe kaydırıp her dişin yan yüzeyini C harfi şeklinde sararak temizle. Günde en az 1 kez, tercihen gece fırçalamadan önce kullanmalısın." },
  { keys:["elektrikli fırça","manuel fırça"], reply:"Elektrikli fırçalar genelde daha tutarlı ve etkili temizlik sağlar, özellikle diş eti hastalığı olanlarda faydalıdır. Ama doğru teknikle kullanılan manuel fırça da yeterli olabilir." },
  { keys:["kaplama","veneer","kron farkı","laminate"], reply:"Veneer (laminate) dişin sadece ön yüzeyine ince bir kaplama yapar, estetik odaklıdır. Kron (kaplama) ise dişi tüm çevresiyle sarar, daha çok kırık/çürük büyük dişlerde kullanılır." },
  { keys:["kırıldı","düştü","kaza","acil"], reply:"Diş kırılması ya da düşmesi acil bir durumdur! Düşen dişi (kökünden tutmadan) süt ya da tükürükte saklayıp en kısa sürede kliniğe gel — ilk 30-60 dakika çok kritik. Hemen İletişim sekmesinden bize ulaş.", goto:"contact" },
  { keys:["sedasyon","uyutarak","narkoz"], reply:"Aşırı korku ya da uzun işlemlerde sedasyon (bilinç açık ama rahatlamış hal) seçeneğimiz mevcut. Detaylarını muayenede konuşabiliriz." },
  { keys:["taksit","kredi kartı","ödeme planı"], reply:"Tedavi tutarına göre taksit seçeneklerimiz olabilir, detayları resepsiyonumuzdan ya da muayene sırasında öğrenebilirsin." },
  { keys:["çalışma saat","kaçta açık","ne zaman açık"], reply:"Hafta içi 09:00–18:00, Cumartesi 10:00–14:00 arası hizmet veriyoruz. Pazar günleri kapalıyız." },
  { keys:["doktor","hekim","ramazan dağ","kim bakıyor"], reply:"Kliniğimizin sorumlu hekimi Dt. Ramazan DAĞ, Çukurova Üniversitesi mezunu ve 5 yıllık klinik deneyime sahip. Kanal tedavisi, estetik diş hekimliği ve implantoloji alanlarında uzmanlaşmış.", goto:"doctors" },
  { keys:["diyet","beslenme","şekerli"], reply:"Asitli ve şekerli yiyecek/içecekler diş minesini aşındırır. Ana öğünlerle sınırlı tüketim, sonrasında su ile ağzı çalkalamak dişlerini korur." },
  { keys:["röntgen","radyasyon","zararlı mı"], reply:"Dijital diş röntgenleri çok düşük dozda radyasyon içerir, günlük hayattaki doğal radyasyona kıyasla oldukça güvenlidir. Gerekli olmadıkça sık çekilmez." },
  { keys:["ikinci görüş","başka doktor","emin değilim"], reply:"Elbette, kararını rahat verebilmen için ikinci bir görüş almak tamamen normal. Muayenemiz zaten ücretsiz, önce bir gel görüşelim." },
  { keys:["diş çekimi sonrası","çekim sonrası ne yapmalı"], reply:"Çekim sonrası ilk 24 saat sıcak/sert yiyecekten kaçın, çekim bölgesine dilinle/fırçayla dokunma, hafif tuzlu suyla nazikçe çalkala ve doktorun verdiği ilaçları düzenli kullan." },
  { keys:["implant sonrası","implant bakım"], reply:"İmplant sonrası ilk günlerde yumuşak gıdalarla beslenmen, sigaradan uzak durman ve düzenli ağız bakımı yapman iyileşmeyi hızlandırır. Kontrol randevularını aksatmaman önemli." },
  { keys:["sarımsı diş eti","diş eti çekilmesi"], reply:"Diş eti çekilmesi sert fırçalama, diş taşı ya da diş gıcırdatmadan kaynaklanabilir. İlerlemesini durdurmak için erken muayene önemli." },
  { keys:["ne zaman gelmeliyim","6 ayda bir","kontrole ne zaman"], reply:"Sorun olmasa bile 6 ayda bir rutin kontrol öneriyoruz — birçok problem erken evrede hiç belirti vermez." },
  { keys:["ürün","macun","fırça satıyor musunuz"], reply:"Evet, Mağaza sekmesinden çocuk ve yetişkin diş fırçası, macun, gargara, diş ipi ve beyazlatma kiti gibi ürünleri inceleyip sipariş verebilirsin.", goto:"store" },
  { keys:["diş tasarımı","gülüş tasarımı"], reply:"Gülüş tasarımı hakkında detaylı bilgi için kliniğimizi ziyaret edebilirsin. Muayene ücretsizdir!", goto:"services" },
  { keys:["yorum","değerlendirme"], reply:"Yorumlar sekmesinde diğer hastalarımızın deneyimlerini okuyabilir, Google ile giriş yapıp kendi yorumunu da bırakabilirsin.", goto:"reviews" },
  { keys:["kim", "sen kimsin", "asistan mısın"], reply:"Ben DİJİ RAMO, Nur Diş & Dental Klinik'in yapay zeka asistanıyım — diş sağlığı sorularını yanıtlar, kliniğimiz hakkında bilgi veririm ve istersen randevunu da hemen oluşturabilirim." },
  { keys:["dental turizm","yurt dışı","yabancı hasta"], reply:"Yurt dışından gelen hastalarımız da oluyor. Tedavi planını ve süreci muayeneden sonra netleştirip sana özel bir program çıkarabiliriz." },
  { keys:["engelli","özel gereksinim"], reply:"Engelli bireyler ve özel gereksinimli hastalarımız için sabırlı ve esnek bir yaklaşımımız var, ihtiyacına göre randevu süresini ayarlayabiliriz." },
  { keys:["protez bakım","takma diş bakımı"], reply:"Protezler her gün fırçalanmalı, gece ağızda unutulmadan çıkarılıp temiz suda bekletilmeli. Uyumsuzluk hissedilirse kontrol ettirilmesi önerilir." },
  { keys:["apse","şişlik","kist"], reply:"Diş kökünde apse ya da kist, tedavi edilmeyen bir çürük veya enfeksiyonun ilerlemesiyle oluşabilir. Şişlik, zonklama ağrısı varsa beklemeden gelmelisin.", goto:"booking" },
  { keys:["süt dişi implant","süt dişine implant"], reply:"Süt dişlerine implant yapılmaz — çene gelişimi tamamlanmadan implant uygulanamaz. Süt dişi erken kaybedilirse boşluk koruyucu gibi farklı çözümler kullanılır." },
  { keys:["ağız kuruluğu","tükürük azlığı"], reply:"Ağız kuruluğu bazı ilaçların yan etkisi olabilir ve çürük riskini artırır. Bol su tüketimi ve şekersiz sakız çiğnemek tükürük akışını destekleyebilir." },
  { keys:["diş renklenmesi","kahve","çay lekesi"], reply:"Çay, kahve ve sigara diş yüzeyinde zamanla renklenmeye yol açar. Düzenli diş taşı temizliği ve gerekirse profesyonel beyazlatma bu görünümü düzeltir." },
  { keys:["gargara","ağız koruyucu spor"], reply:"Spor yaparken diş travmasına karşı ağız koruyucu (mouthguard) kullanılması önerilir, özellikle temaslı sporlarda diş kırılmalarını önemli ölçüde azaltır." },
];
/* Cloudflare Worker'ı kurduktan sonra aldığın adresi (örn.
   https://nurdis-ai.SENIN-ADIN.workers.dev) aşağıya yapıştır. Boş kaldığı
   sürece asistan otomatik olarak yerel bilgi tabanını kullanır. */
const AI_ENDPOINT_URL = "https://nurdis-worker.nurdisdentalklinik.workers.dev";
const AI_ENDPOINT_READY = !!AI_ENDPOINT_URL;

const CHATBOT_FALLBACK = "Bu soruyu tam karşılayamadım ama elimden geleni yapayım: diş ağrısı, tedaviler (kanal, implant, beyazlatma, zirkonyum, şeffaf plak vb.), randevu, fiyatlandırma mantığı, çalışma saatlerimiz veya genel ağız bakımı hakkında sorabilirsin. İstersen bu konuyu doğrudan DİJİ RAMO'ya sormak için hemen randevu oluşturabilirim — ister misin?";

/* ---------------- STATE ---------------- */

// Küfürlü/argo/ahlaksız kelimeler listesi
const BLOCKED_WORDS = [
  // Küfürler
  "amk", "aq", "amına", "amına koyayım", "sikerim", "sikeyim", "sikim", "sikik",
  "orospu", "orospu çocuğu", "piç", "piç kurusu", "pezevenk", "ibne", "göt",
  "götveren", "yarrak", "yarrak yemek", "am", "amcık", "döl", "döle",
  // Argo
  "lan", "ulan", "oç", "oçocuğu", "pezevenk", "şerefsiz", "namussuz",
  "haysiyetsiz", "alçak", "kaltak", "kaşar", "sürtük", "fahişe",
  // Ahlaksız
  "sikiş", "seks", "porno", "porn", "çingene", "çingene çocuğu",
  "aptal", "gerizekalı", "salak", "mal", "dangalak", "beyinsiz",
  "bok", "bok yemek", "boktan", "pislik", "iğrenç", "rezil"
];

let state = {
  updateAvailable: false,
  expandedDoctor: null,
  lightboxPhoto: null,
  infoTab: "Bebekler",
  screen: "home",
  moreOpen: false,
  appointments: [],
  myAppointments: [],
  announcements: [],
  accounting: { incomes: [], expenses: [], firms: [], bankAccounts: [], invoices: [] },
  personnel: [],
  sgkSettings: null,
  accTab: "ozet",
  accRange: "ay",
  accFrom: "",
  accTo: "",
  accEdit: null,
  personelEdit: undefined,
  demirbaslar: [],
  demirbasEdit: undefined,
  accTamamlanan: {},
  bordroYil: null,
  bordroAy: null,
  yevmiyeYil: null,
  yevmiyeAy: 0,
  mizanYil: null,
  tabloYil: null,
  firmaBilgi: null,
  mutabakatSonuc: null,
  stok: [],
  stokHareket: [],
  stokEdit: undefined,
  tedaviMalzeme: {},
  mmTedavi: null,
  hkSirala: "ciro",
  hkDetay: null,
  nakitAy: 3,
  randevuDonem: 30,
  verimDonem: 30,
  hhTab: "kontrol",
  hhSablonAcik: false,
  mesajSablon: null,
  hhAyar: null,
  bonusAyar: null,
  randevuAyar: null,
  kampanyalar: [],
  kampanyaEdit: undefined,
  bayatAyar: null,
  kdvYil: null,
  kdvAy: null,
  gvDonem: 1,
  treatmentPrices: {},
  autoExpenses: { kira:50000, elektrik:3000, su:1500, dogalgaz:2000, sgk:8000, vergi:5000 },
  bookingForm: { date:"", time:"", name:"", phone:"" },
  bookingStatus: "idle",
  contactForm: { name:"", phone:"", msg:"" },
  contactStatus: "idle",
  reviews: [],
  reviewForm: { name:"", rating:5, text:"" },
  cart: {}, // productId -> qty
  checkoutForm: { name:"", phone:"", address:"" },
  checkoutStatus: "idle",
  chatLog: [{ from:"bot", text:"Merhaba! Ben DİJİ RAMO 😊 Nur Diş & Dental Klinik'in yapay zeka asistanıyım. Diş ağrısı, fiyatlar, randevu ya da aklına takılan her şeyi sorabilirsin." }],
  chatInput: "",
  /* smile state kaldırıldı - Dişini Tasarla yeni kod bekleniyor */
  settings: { muted: false, lang: "tr" },
  adminLoggedIn: false,
  adminForm: { email:"", pass:"" },
  adminError: "",
  blockedUsers: [],  // Engellenen kullanıcı e-postaları
  blockedChatUsers: [],  // DİJİ RAMO'da engellenen kullanıcılar (anonymous ID)
  socialMedia: {},  // Sosyal medya linkleri (youtube, instagram, twitter vb.)
  customProducts: [],
  orders: [],
  serviceVideos: {},   // { serviceId: youtubeUrl }
  productImages: {},   // { productId: imageUrl }
  deviceVideos: {},    // { deviceId: youtubeUrl }
  expandedDevice: null,
  expandedService: null,
  user: null,        // Firebase Google ile giriş yapan kullanıcı (null = giriş yapılmamış)
  fbReady: false,     // firebase-init.js yüklenip window.fb hazır olunca true olur
  adminTab: "appointments", // Yönetici paneli aktif sekme
  authBusy: false,
  // Kullanıcı profili
  userProfile: null,  // { firstName, lastName, age, weight, height, brushReminderTime, notificationsEnabled }
  familyMembers: [],  // [{id, name, relation, age, brushReminderTime, streak, lastBrushDate}]
  treatments: [],     // [{id, uid, treatmentName, date, notes, addedBy}]
  badges: [],         // ["first_review", "7_day_streak", ...]
  healthTips: [],     // [{id, text}] - Firebase'den
  dailyTip: "",       // Bugünün ipucu
  brushStreak: 0,     // Diş fırçalama serisi (gün)
  lastBrushDate: null, // Son fırçalama tarihi
  brushingVideoUrl: "", // Çocuklar için diş fırçalama videosu (yönetici ekler)
};

/* ---------------- STORAGE ---------------- */
/* localStorage burada yalnızca Firebase bağlantısı kurulana kadar (ya da
   internetsizken) geçici/offline yedek olarak kullanılır. Firebase hazır
   olduğunda reviews/products/appointments/orders artık Firestore'dan
   gerçek zamanlı gelir — bkz. initFirebaseSync() en alttaki başlatma
   bölümünde. */
function loadAll() {
  // Anonymous chat ID oluştur (eğer yoksa)
  if (!localStorage.getItem('nurdis_chat_id')) {
    localStorage.setItem('nurdis_chat_id', 'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9));
  }
  
  try { state.appointments = JSON.parse(localStorage.getItem("nurdis_appointments") || "[]"); } catch(e){ state.appointments = []; }
  try { state.reviews = JSON.parse(localStorage.getItem("nurdis_reviews") || "[]"); } catch(e){ state.reviews = []; }
  try { state.blockedUsers = JSON.parse(localStorage.getItem("nurdis_blocked_users") || "[]"); } catch(e){ state.blockedUsers = []; }
  try { state.blockedChatUsers = JSON.parse(localStorage.getItem("nurdis_blocked_chat_users") || "[]"); } catch(e){ state.blockedChatUsers = []; }
  try { state.socialMedia = JSON.parse(localStorage.getItem("nurdis_social_media") || "{}"); } catch(e){ state.socialMedia = {}; }
  try { state.accounting = JSON.parse(localStorage.getItem("nurdis_accounting") || '{"incomes":[],"expenses":[],"firms":[],"bankAccounts":[],"invoices":[]}'); } catch(e){ state.accounting = {incomes:[],expenses:[],firms:[],bankAccounts:[],invoices:[]}; }
  try { state.treatmentPrices = JSON.parse(localStorage.getItem("nurdis_treatment_prices") || '{}'); } catch(e){ state.treatmentPrices = {}; }
  try { state.autoExpenses = JSON.parse(localStorage.getItem("nurdis_auto_expenses") || '{"kira":50000,"elektrik":3000,"su":1500,"dogalgaz":2000,"sgk":8000,"vergi":5000}'); } catch(e){}
  try { state.personnel = JSON.parse(localStorage.getItem("nurdis_personnel") || "[]"); } catch(e){ state.personnel = []; }
  try { const sg = JSON.parse(localStorage.getItem("nurdis_sgk_settings") || "null"); if (sg) state.sgkSettings = sg; } catch(e){}
  try { state.demirbaslar = JSON.parse(localStorage.getItem("nurdis_demirbaslar") || "[]"); } catch(e){ state.demirbaslar = []; }
  try { state.accTamamlanan = JSON.parse(localStorage.getItem("nurdis_beyan_tamam") || "{}"); } catch(e){ state.accTamamlanan = {}; }
  try { state.firmaBilgi = JSON.parse(localStorage.getItem("nurdis_firma_bilgi") || "null"); } catch(e){ state.firmaBilgi = null; }
  try { state.stok = JSON.parse(localStorage.getItem("nurdis_stok") || "[]"); } catch(e){ state.stok = []; }
  try { state.stokHareket = JSON.parse(localStorage.getItem("nurdis_stok_hareket") || "[]"); } catch(e){ state.stokHareket = []; }
  try { state.tedaviMalzeme = JSON.parse(localStorage.getItem("nurdis_tedavi_malzeme") || "{}"); } catch(e){ state.tedaviMalzeme = {}; }
  try { state.kampanyalar = JSON.parse(localStorage.getItem("nurdis_kampanyalar") || "[]"); } catch(e){ state.kampanyalar = []; }
  try { state.randevuAyar = JSON.parse(localStorage.getItem("nurdis_randevu_ayar") || "null"); } catch(e){ state.randevuAyar = null; }
  try { state.bayatAyar = JSON.parse(localStorage.getItem("nurdis_bayat_ayar") || "null"); } catch(e){ state.bayatAyar = null; }
  try { state.hhAyar = JSON.parse(localStorage.getItem("nurdis_hh_ayar") || "null"); } catch(e){ state.hhAyar = null; }
  try { state.mesajSablon = JSON.parse(localStorage.getItem("nurdis_mesaj_sablon") || "null"); } catch(e){ state.mesajSablon = null; }
  try { state.bonusAyar = JSON.parse(localStorage.getItem("nurdis_bonus_ayar") || "null"); } catch(e){ state.bonusAyar = null; }
  try { state.customProducts = JSON.parse(localStorage.getItem("nurdis_custom_products") || "[]"); } catch(e){ state.customProducts = []; }
  try { const s = JSON.parse(localStorage.getItem("nurdis_settings")); if (s) state.settings = { ...state.settings, ...s }; } catch(e){}
  
  // Kullanıcı profili ve streak
  loadUserProfile();
}
function persist(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

/* Yönetici girişi artık Firebase Authentication (e-posta/şifre) ile yapılır.
   Hangi e-postanın yönetici sayıldığı firebase-init.js içindeki ADMIN_EMAIL
   sabitinde tanımlıdır — o dosyada kendi admin e-postanla değiştirmen ve
   Firebase konsolunda Authentication > Users kısmından o hesabı oluşturman
   gerekir. */

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
        <img src="icon-192.png" class="logo-badge-img" alt="Nur Diş logo" />
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
      ${i.img ? `<img src="${i.img}" class="grid-icon" style="width:52px;height:52px;border-radius:12px;object-fit:cover;" />` : `<span class="grid-icon">${icon(i.icon,22)}</span>`}<span class="grid-label">${t(i.id)}</span>
    </button>`).join("");

  const stats = [
    { n:"5+", tr:"Yıllık Deneyim", en:"Years Experience" },
    { n:String(SERVICES.length)+"+", tr:"Tedavi Çeşidi", en:"Treatment Types" },
    { n:"6", tr:"Gün Açık", en:"Days Open" },
    { n:"%100", tr:"Steril Ortam", en:"Sterile Care" },
  ];

  const quickLinks = [
    { id:"services", label:"Hizmetler" }, { id:"devices", label:"Cihazlarımız" },
    { id:"info", label:"Bilgiler" }, { id:"reviews", label:"Yorumlar" },
    { id:"store", label:"Mağaza" }, { id:"contact", label:"İletişim" },
  ];

  return `
    <div class="topbar" style="background:none;padding:0;">
      <div class="hero" style="background-image:linear-gradient(160deg, rgba(10,92,82,.88), rgba(46,143,192,.82)), url('clinic-hero.jpg');">
        <div class="hero-inner">
          <img src="icon-192.png" class="logo-badge-img" alt="Nur Diş logo" />
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
          <img src="tab-quickbook.png" style="width:48px;height:48px;border-radius:12px;object-fit:contain;" />
          <div>
            <p class="name" style="font-size:17px;">Hızlı randevu</p>
            <p class="desc">60 saniyede muayene randevusu oluştur, biz seni arayalım.</p>
            <button class="linklike" data-action="goto" data-screen="booking">Randevu al &rarr;</button>
          </div>
        </div>
      </div>

      <div class="card p4 mb5 row">
        <img src="doctor-photo.jpg" class="avatar-sm" alt="Dt. Ramazan DAĞ" />
        <div>
          <p class="name" style="font-size:14px;">Dt. Ramazan DAĞ</p>
          <p class="desc">Klinik sorumlu hekimi · 5 yıl deneyim</p>
        </div>
      </div>

      <div class="stats-band mb5">
        ${stats.map(s => `<div class="stat-cell"><p class="stat-num">${s.n}</p><p class="stat-tr">${s.tr}</p><p class="stat-en">${s.en}</p></div>`).join("")}
      </div>

      ${(state.announcements || []).length > 0 ? `
      <p class="section-label">📢 Duyurular</p>
      <div class="mb5">
        ${(state.announcements || []).slice(0,3).map(a => `
          <div class="card p4 mb3" style="border-left:3px solid var(--cta);">
            <p class="name" style="font-size:14px;margin:0;">📢 ${escapeHtml(a.title || "")}</p>
            <p class="desc" style="margin:6px 0;line-height:1.5;">${escapeHtml(a.text || "")}</p>
            ${a.imageUrl ? `<img src="${a.imageUrl}" style="width:100%;border-radius:12px;margin-top:8px;display:block;" />` : ''}
            ${a.videoUrl ? `<div style="margin-top:8px;"><a href="${escapeAttr(a.videoUrl)}" target="_blank" class="btn-primary" style="text-decoration:none;display:flex;padding:10px;font-size:13px;">🎥 Videoyu İzle</a></div>` : ''}
            <p class="footnote" style="margin-top:6px;">${a.createdAt ? new Date(a.createdAt).toLocaleDateString("tr-TR", {day:'numeric',month:'long',year:'numeric'}) : ''}</p>
          </div>
        `).join("")}
      </div>
      ` : ''}

      <p class="section-label">Hızlı erişim</p>
      <div class="menu-grid mb5">${grid}</div>

      <p class="section-label">Öne çıkan hizmetler</p>
      <div class="hscroll mb5">
        ${SERVICES.slice(0,6).map(s => `
          <div class="mini-card" data-action="goto-service" data-id="${s.id}">
            ${s.img ? `<img src="${s.img}" style="width:40px;height:40px;border-radius:8px;object-fit:cover;" />` : `<div>${icon(s.icon,18)}</div>`}
            <p class="name">${s.name}</p>
          </div>`).join("")}
      </div>

      <div class="footer-band">
        <p class="footer-tagline">Modern teknoloji ve uzman kadromuzla sağlıklı gülüşler tasarlıyoruz.</p>
        <div class="footer-links">
          ${quickLinks.map(l => `<button class="footer-link" data-action="goto" data-screen="${l.id}">${l.label}</button>`).join("")}
        </div>
        <p class="footer-phone">${icon("mail",14)} 0505 105 03 02</p>
      </div>
    </div>`;
}

/* ---------------- HİZMETLER ---------------- */

function youtubeEmbedUrl(url) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

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
      const ytUrl = state.serviceVideos[s.id];
      const embed = youtubeEmbedUrl(ytUrl);
      let video = "";
      if (embed) {
        video = `<div class="video-box"><iframe src="${embed}" style="width:100%;aspect-ratio:16/9;border:none;border-radius:12px;" allowfullscreen loading="lazy"></iframe></div>`;
      } else {
        video = `<div class="video-box"><div class="video-placeholder">▶️<br/><span>Tanıtım videosu yakında eklenecek</span></div></div>`;
      }
      detail = `<div class="service-detail">
        <p class="desc" style="margin-bottom:10px;">${s.info}</p>
        ${media}${video}
      </div>`;
    }
    return `
    <div class="card p4 mb3">
      <div class="row" data-action="toggle-service" data-id="${s.id}" style="cursor:pointer;">
        ${s.img ? `<img src="${s.img}" style="width:52px;height:52px;border-radius:12px;object-fit:cover;flex-shrink:0;" />` : `<div class="badge ${s.tone==='blue'?'badge-blue':'badge-teal'}">${icon(s.icon,20)}</div>`}
        <div style="flex:1;padding-right:8px;">
          <p class="name">${s.name}</p>
          <p class="desc">${s.desc}</p>
        </div>
      </div>
      ${detail}
    </div>`;
  }).join("");
  return `${topbar("Hizmetler","Kartlara dokunarak detay, görsel ve tanıtım videosunu görebilirsin.")}
    <div class="content">${items}</div>`;
}

/* ---------------- DOKTORLAR ---------------- */

function renderDoctors() {
  const cards = DOCTORS.map(d => {
    const expanded = state.expandedDoctor === d.id;
    return `
    <div class="card p5 mb3">
      <div class="row-start" data-action="toggle-doctor" data-id="${d.id}" style="cursor:pointer;">
        <img src="${d.photo}" class="avatar-lg" alt="${d.name}" data-action="open-lightbox" data-src="${d.photo}" style="cursor:zoom-in;" />
        <div>
          <p class="name" style="font-size:18px;">${d.name}</p>
          <p class="desc" style="color:var(--tealLight);font-weight:500;margin-top:2px;">${d.title}</p>
          <p class="desc" style="margin-top:8px;">${d.school}</p>
          <p class="desc">${d.experience}</p>
          <p class="desc">${d.focus}</p>
        </div>
      </div>
      ${expanded ? `<div class="service-detail"><p class="desc">${d.bio}</p></div>` : `<button class="linklike" style="margin-top:10px;" data-action="toggle-doctor" data-id="${d.id}">Daha fazla oku →</button>`}
    </div>`;
  }).join("");
  return `${topbar("Doktorlarımız","Kliniğimizde görev yapan uzman hekimler.", {back:"home"})}<div class="content">${cards}</div>`;
}

/* ---------------- CİHAZLARIMIZ ---------------- */

function renderDevices() {
  const cards = DEVICES.map(d => {
    const expanded = state.expandedDevice === d.id;
    let detail = "";
    if (expanded) {
      const ytUrl = state.deviceVideos[d.id];
      const embed = youtubeEmbedUrl(ytUrl);
      detail = `<div class="service-detail">
        ${embed
          ? `<div class="video-box"><iframe src="${embed}" style="width:100%;aspect-ratio:16/9;border:none;border-radius:12px;" allowfullscreen loading="lazy"></iframe></div>`
          : `<div class="video-box"><div class="video-placeholder">${icon("monitor",22)}<br/><span>Bu cihazın tanıtım videosu yakında eklenecek</span></div></div>`}
      </div>`;
    }
    return `
    <div class="card p4 mb3">
      <div class="row" data-action="toggle-device" data-id="${d.id}" style="cursor:pointer;">
        ${d.img ? `<img src="${d.img}" style="width:52px;height:52px;border-radius:12px;object-fit:cover;flex-shrink:0;" />` : `<div class="badge badge-blue">${icon(d.icon,22)}</div>`}
        <div><p class="name" style="font-size:15px;">${d.name}</p><p class="desc">${d.desc}</p></div>
      </div>
      ${detail}
    </div>`;
  }).join("");
  return `${topbar("Cihazlarımız","Son teknoloji, yapay zeka destekli görüntüleme ve üretim cihazları. Kartlara dokunarak tanıtım videosunu izleyebilirsin.", {back:"home"})}
    <div class="content">${cards}</div>`;
}

/* ---------------- GÜLÜŞÜNÜ TASARLA (kamera + yüz takibi) ---------------- */

/* ---------------- REFERANSLAR ---------------- */

/* ---------------- GİRİŞ GEREKTİREN İŞLEMLER İÇİN ORTAK KART ---------------- */
function authGate(message) {
  if (state.user) return "";
  return `<div class="card p4 mb4" style="text-align:center;">
    <p class="desc" style="margin-bottom:10px;">${message}</p>
    <button class="btn-primary" data-action="google-signin" ${state.authBusy?"disabled":""}>${state.authBusy ? "Giriş yapılıyor…" : "🔵 Google ile Giriş Yap"}</button>
  </div>`;
}

const LANGS = [
  { id:"tr", label:"Türkçe" }, { id:"en", label:"English" }, { id:"ar", label:"العربية" },
  { id:"de", label:"Deutsch" }, { id:"es", label:"Español" },
];

/* Arayüz (menü/başlık/buton) çevirileri. İçerik (makaleler, asistan
   cevapları) şimdilik yalnızca Türkçedir — bu ayrı, çok daha büyük bir iştir. */
const I18N = {
  tr: { home:"Ana Sayfa", services:"Hizmetler", booking:"Randevu", chatbot:"DİJİ RAMO", more:"Diğer",
    account:"Hesabım", doctors:"Doktorlarımız", devices:"Cihazlarımız",
    reviews:"Yorumlar", store:"Mağaza", address:"Adresimiz", contact:"İletişim", info:"Diş Sağlığı Bilgileri",
    "admin-login":"Yönetici Girişi", settings:"Ayarlar", campaigns:"Kampanyalar", save:"Kaydet", send:"Gönder" },
  en: { home:"Home", services:"Services", booking:"Appointment", chatbot:"DİJİ RAMO", more:"More",
    account:"My Account", doctors:"Our Doctors", devices:"Our Devices", smile:"Design Your Smile",
    reviews:"Reviews", store:"Store", address:"Our Address", contact:"Contact", info:"Dental Health Info",
    "admin-login":"Admin Login", settings:"Settings", campaigns:"Campaigns", save:"Save", send:"Send" },
  ar: { home:"الرئيسية", services:"الخدمات", booking:"موعد", chatbot:"DİJİ RAMO", more:"المزيد",
    account:"حسابي", doctors:"أطباؤنا", devices:"أجهزتنا", smile:"صمم ابتسامتك",
    reviews:"التقييمات", store:"المتجر", address:"عنواننا", contact:"تواصل معنا", info:"معلومات صحة الأسنان",
    "admin-login":"دخول المدير", settings:"الإعدادات", campaigns:"العروض", save:"حفظ", send:"إرسال" },
  de: { home:"Start", services:"Leistungen", booking:"Termin", chatbot:"DİJİ RAMO", more:"Mehr",
    account:"Mein Konto", doctors:"Unsere Ärzte", devices:"Unsere Geräte", smile:"Lächeln gestalten",
    reviews:"Bewertungen", store:"Shop", address:"Unsere Adresse", contact:"Kontakt", info:"Zahngesundheit",
    "admin-login":"Admin-Login", settings:"Einstellungen", campaigns:"Aktionen", save:"Speichern", send:"Senden" },
  es: { home:"Inicio", services:"Servicios", booking:"Cita", chatbot:"DİJİ RAMO", more:"Más",
    account:"Mi Cuenta", doctors:"Nuestros Doctores", devices:"Nuestros Equipos", smile:"Diseña tu Sonrisa",
    reviews:"Reseñas", store:"Tienda", address:"Nuestra Dirección", contact:"Contacto", info:"Salud Dental",
    "admin-login":"Acceso Admin", settings:"Ajustes", campaigns:"Promociones", save:"Guardar", send:"Enviar" },
};
function t(key) {
  const lang = (state.settings && state.settings.lang) || "tr";
  return (I18N[lang] && I18N[lang][key]) || I18N.tr[key] || key;
}

function renderSettings() {
  const s = state.settings;
  return `${topbar("Ayarlar","Uygulama tercihlerini buradan yönetebilirsin.", {back:"home"})}
    <div class="content">
      <div class="card p4 mb4 row" style="justify-content:space-between;">
        <div><p class="name" style="font-size:14px;">Uygulama sesleri</p><p class="desc">Tıklama, giriş ve bildirim sesleri</p></div>
        <button class="chip ${s.muted?'':'chip-active'}" data-action="toggle-mute">${s.muted ? "Kapalı" : "Açık"}</button>
      </div>
      <p class="section-label">Uygulama dili</p>
      <p class="footnote" style="margin-top:-6px;">Menü ve başlıklar seçtiğin dile döner. (Not: makale/asistan içerikleri şimdilik yalnızca Türkçedir.)</p>
      <div class="chip-row mb4" style="flex-wrap:wrap;">
        ${LANGS.map(l => `<button class="chip ${s.lang===l.id?'chip-active':''}" data-action="set-lang" data-id="${l.id}">${l.label}</button>`).join("")}
      </div>
    </div>`;
}

/* ============ ROZET TANIMLARI ============ */
const BADGE_DEFS = [
  { id: "first_review", name: "İlk Yorum", icon: "⭐", desc: "İlk yorumunu yazdı" },
  { id: "first_appointment", name: "İlk Randevu", icon: "📅", desc: "İlk randevusunu aldı" },
  { id: "7_day_streak", name: "7 Gün", icon: "🔥", desc: "7 gün üst üste fırçaladı" },
  { id: "14_day_streak", name: "14 Gün", icon: "💪", desc: "14 gün üst üste fırçaladı" },
  { id: "30_day_streak", name: "30 Gün", icon: "🏅", desc: "30 gün üst üste fırçaladı" },
  { id: "60_day_streak", name: "60 Gün", icon: "🥇", desc: "60 gün üst üste fırçaladı" },
  { id: "100_day_streak", name: "100 Gün", icon: "👑", desc: "100 gün üst üste fırçaladı" },
  { id: "365_day_streak", name: "365 Gün", icon: "🏆", desc: "Bir yıl üst üste fırçaladı!" },
  { id: "family_member", name: "Aile", icon: "👨‍👩‍👧", desc: "Aile üyesi ekledi" },
  { id: "profile_complete", name: "Tam Profil", icon: "✅", desc: "Tüm profil bilgilerini doldurdu" },
];

const DEFAULT_HEALTH_TIPS = [
  "Günde en az 2 kez, 2 dakika diş fırçalamak diş sağlığınız için en önemli adımdır.",
  "Diş ipi kullanmak diş eti hastalıklarını %40 oranında azaltır.",
  "Şekerli yiyeceklerden sonra ağzınızı su ile çalkalamak çürük riskini azaltır.",
  "Diş fırçanızı her 3 ayda bir değiştirmeyi unutmayın.",
  "Florürlü diş macunu kullanmak diş minesini güçlendirir.",
  "Düzenli diş kontrolü, sorunları erken teşhis etmenin en iyi yoludur.",
  "Çay ve kahve dişlerde lekelenmeye neden olabilir, ardından su için.",
  "Sert kıllı diş fırçası diş etlerine zarar verebilir, yumuşak kıllı tercih edin.",
  "Dil temizliği ağız kokusunu %70 oranında azaltır.",
  "Süt ürünleri kalsiyum açısından zengindir ve dişleri güçlendirir.",
  "Çocuklarda diş fırçalama alışkanlığı 2 yaşından itibaren kazandırılmalıdır.",
  "Diş sıkma ve gıcırdatma, dişlere ciddi zarar verebilir — farkında olun.",
  "Elma ve havuç gibi sert meyveler doğal diş temizleyici görevi görür.",
  "Sigara diş eti hastalıklarının en büyük nedenlerinden biridir.",
  "Ağız gargarası, fırçalamanın ulaşamadığı bölgeleri temizlemeye yardımcı olur.",
];

function renderAccount() {
  if (!state.user) {
    return `${topbar("Hesabım","Randevu almak, yorum yapmak ve sipariş vermek için giriş yap.", {back:"home"})}
      <div class="content">
        <div class="card p5" style="text-align:center;">
          <div style="font-size:64px;margin-bottom:16px;">👤</div>
          <p class="name" style="font-size:18px;margin-bottom:8px;">Hoş Geldiniz!</p>
          <p class="desc" style="margin-bottom:24px;">Randevu almak, yorum yapmak ve profilinizi yönetmek için Google ile giriş yapın.</p>
          <button class="btn-primary" data-action="sign-in-google" style="display:inline-flex;align-items:center;gap:10px;padding:14px 28px;font-size:16px;">
            <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
            Google ile Giriş Yap
          </button>
        </div>
      </div>`;
  }

  const p = state.userProfile || {};
  const bmi = (p.weight && p.height) ? (p.weight / Math.pow(p.height/100, 2)).toFixed(1) : null;
  const bmiLabel = bmi ? (bmi < 18.5 ? "Zayıf" : bmi < 25 ? "Normal" : bmi < 30 ? "Fazla Kilolu" : "Obez") : "";
  const bmiColor = bmi ? (bmi < 18.5 ? "#3498db" : bmi < 25 ? "#27ae60" : bmi < 30 ? "#f39c12" : "#e74c3c") : "";
  const streak = state.brushStreak || 0;
  const todayBrushed = state.lastBrushDate === new Date().toDateString();

  // 6 aylık kontrol hatırlatma
  const lastCheckup = p.lastCheckup ? new Date(p.lastCheckup) : null;
  const nextCheckup = lastCheckup ? new Date(lastCheckup.getTime() + 180*24*60*60*1000) : null;
  const daysUntilCheckup = nextCheckup ? Math.ceil((nextCheckup - new Date()) / (24*60*60*1000)) : null;

  return `${topbar("Profilim","Kişisel bilgileriniz ve diş sağlığı araçlarınız.", {back:"home"})}
    <div class="content">
      
      <!-- Profil Kartı -->
      <div class="card p4 mb4">
        <div class="row" style="justify-content:space-between;align-items:center;">
          <div class="row" style="gap:12px;">
            <div class="badge badge-teal">${icon("user",22)}</div>
            <div>
              <p class="name" style="font-size:16px;">${escapeHtml(p.firstName && p.lastName ? p.firstName + " " + p.lastName : (state.user.name || "Kullanıcı"))}</p>
              <p class="desc">${escapeHtml(state.user.email || "")}</p>
            </div>
          </div>
          <button class="qty-btn" style="width:auto;padding:8px 16px;" data-action="edit-profile">✏️ Düzenle</button>
        </div>
      </div>

      <!-- Diş Fırçalama Serisi -->
      <div class="card p4 mb4" style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);color:white;">
        <div style="text-align:center;">
          <div style="font-size:48px;margin-bottom:8px;">🔥</div>
          <p style="font-size:32px;font-weight:700;margin:0;">${streak} Gün</p>
          <p style="font-size:14px;opacity:0.9;margin:4px 0 16px;">Diş Fırçalama Serisi</p>
          ${todayBrushed 
            ? `<button class="btn-primary" style="background:rgba(255,255,255,0.2);color:white;border:2px solid white;" disabled>✅ Bugün Fırçaladın!</button>`
            : `<button class="btn-primary" style="background:white;color:#764ba2;" data-action="brush-teeth">🪥 Fırçaladım!</button>`
          }
        </div>
      </div>

      <!-- BMI Hesaplama -->
      ${p.weight && p.height ? `
      <div class="card p4 mb4">
        <p class="section-label" style="margin:0 0 12px;">⚖️ Vücut Kitle İndeksi</p>
        <div style="text-align:center;">
          <p style="font-size:42px;font-weight:700;color:${bmiColor};margin:0;">${bmi}</p>
          <p style="font-size:16px;color:${bmiColor};font-weight:600;margin:4px 0;">${bmiLabel}</p>
          <p class="footnote" style="margin:8px 0 0;">${p.weight} kg · ${p.height} cm${p.age ? " · " + p.age + " yaş" : ""}</p>
        </div>
      </div>` : `
      <div class="card p4 mb4" style="border:2px dashed var(--border);">
        <p class="desc" style="text-align:center;margin:0;">⚖️ BMI hesaplama için profilinizi düzenleyip kilo ve boy bilgilerinizi girin.</p>
      </div>`}

      <!-- Diş Fırçalama Videosu (Çocuklar İçin) -->
      ${state.brushingVideoUrl ? `
      <div class="card p4 mb4">
        <p class="section-label" style="margin:0 0 12px;">🎬 Eğlenceli Diş Fırçalama (2 dk)</p>
        <p class="footnote" style="margin:0 0 12px;">Çocuklar için eğlenceli 2 dakikalık diş fırçalama videosu. Videoyu izlerken dişlerini fırçala!</p>
        <button class="btn-primary" data-action="watch-brush-video" style="width:100%;">▶️ Videoyu İzle</button>
      </div>` : ""}

      <!-- Günlük İpucu -->
      ${state.dailyTip ? `
      <div class="card p4 mb4" style="background:linear-gradient(135deg, #f093fb 0%, #f5576c 100%);color:white;">
        <p style="font-size:12px;font-weight:600;opacity:0.9;margin:0 0 6px;">💡 GÜNÜN DİŞ SAĞLIĞI İPUCU</p>
        <p style="font-size:15px;margin:0;line-height:1.5;">${escapeHtml(state.dailyTip)}</p>
      </div>` : ""}

      <!-- Rozetler -->
      ${state.badges.length > 0 ? `
      <div class="card p4 mb4">
        <p class="section-label" style="margin:0 0 12px;">🏆 Rozetlerim</p>
        <div style="display:flex;flex-wrap:wrap;gap:8px;">
          ${state.badges.map(b => {
            const badgeDef = BADGE_DEFS.find(d => d.id === b);
            return badgeDef ? `<div style="background:var(--bg);border-radius:12px;padding:8px 12px;text-align:center;min-width:80px;">
              <div style="font-size:24px;">${badgeDef.icon}</div>
              <p style="font-size:11px;margin:4px 0 0;font-weight:500;">${badgeDef.name}</p>
            </div>` : "";
          }).join("")}
        </div>
      </div>` : ""}

      <!-- Aile Üyeleri -->
      <div class="card p4 mb4">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <p class="section-label" style="margin:0;">👨‍👩‍👧‍👦 Aile Üyeleri</p>
          <button class="qty-btn" style="width:auto;padding:6px 14px;" data-action="add-family-member">+ Ekle</button>
        </div>
        ${(state.familyMembers || []).length > 0 ? state.familyMembers.map(fm => `
          <div class="card p3 mb2" style="background:var(--bg);">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <div>
                <p class="desc" style="margin:0;font-weight:600;">${escapeHtml(fm.name)} <span style="font-weight:400;opacity:0.7;">(${escapeHtml(fm.relation || "")})</span></p>
                <p class="footnote" style="margin:2px 0 0;">${fm.age ? fm.age + " yaş" : ""} · 🔥 ${fm.streak || 0} gün seri</p>
              </div>
              <div style="display:flex;gap:6px;">
                <button class="qty-btn" style="padding:4px 8px;" data-action="edit-family-member" data-id="${fm.id}">✏️</button>
                <button class="qty-btn" style="padding:4px 8px;background:var(--bad);color:#fff;" data-action="remove-family-member" data-id="${fm.id}">🗑️</button>
              </div>
            </div>
          </div>
        `).join("") : `<p class="footnote">Henüz aile üyesi eklenmedi. Çocuklarınızın diş fırçalama takibini buradan yapabilirsiniz.</p>`}
      </div>

      <!-- Tedavi Geçmişi -->
      <div class="card p4 mb4">
        <p class="section-label" style="margin:0 0 12px;">🦷 Tedavi Geçmişim</p>
        ${(() => {
          const email = state.user?.email || "";
          const fullName = ((p.firstName || "") + " " + (p.lastName || "")).trim();
          const myTreatments = (state.treatments || []).filter(t => 
            t.userName === email || t.userName === fullName || t.userName === (p.firstName || "") || t.uid === state.user?.uid
          );
          return myTreatments.length > 0 ? myTreatments.slice().reverse().map(t => `
            <div class="card p3 mb2" style="background:var(--bg);">
              <p class="desc" style="margin:0;font-weight:600;">${escapeHtml(t.treatmentName)}</p>
              <p class="footnote" style="margin:2px 0 0;">📅 ${escapeHtml(t.date || "")} ${t.notes ? "· " + escapeHtml(t.notes) : ""}</p>
            </div>
          `).join("") : `<p class="footnote">Henüz tedavi kaydı yok. Yönetici tarafından eklendiğinde burada görünecek.</p>`;
        })()}
      </div>

      <!-- Randevu Geçmişi -->
      <div class="card p4 mb4">
        <p class="section-label" style="margin:0 0 12px;">📅 Randevu Geçmişim</p>
        ${(state.appointments || []).filter(a => a.uid === state.user?.uid).slice().reverse().map(a => `
          <div class="card p3 mb2" style="background:var(--bg);">
            <p class="desc" style="margin:0;">${escapeHtml(a.date || "")} ${escapeHtml(a.time || "")}</p>
          </div>
        `).join("") || `<p class="footnote">Henüz randevu geçmişiniz yok.</p>`}
      </div>

      <!-- Hatırlatmalar -->
      <div class="card p4 mb4">
        <p class="section-label" style="margin:0 0 16px;">🔔 Hatırlatmalar</p>
        
        <div style="margin-bottom:16px;">
          <p class="desc" style="margin:0 0 8px;font-weight:500;">🪥 Diş Fırçalama Hatırlatması</p>
          <div style="display:flex;gap:8px;align-items:center;">
            <input type="time" class="input" id="brush-time" value="${escapeAttr(p.brushReminderTime || "21:00")}" style="flex:1;" />
            <button class="qty-btn" style="width:auto;padding:8px 16px;" data-action="save-brush-time">Kaydet</button>
          </div>
        </div>

        <div style="margin-bottom:16px;">
          <p class="desc" style="margin:0 0 8px;font-weight:500;">🏥 6 Aylık Diş Kontrolü</p>
          ${daysUntilCheckup !== null ? `
            <p class="desc" style="margin:0;color:${daysUntilCheckup <= 30 ? 'var(--bad)' : 'var(--teal)'};">
              ${daysUntilCheckup > 0 ? `📅 ${daysUntilCheckup} gün sonra (${nextCheckup.toLocaleDateString("tr-TR")})` : "⚠️ Kontrol zamanı geldi! Randevu alın."}
            </p>
            <button class="qty-btn" style="margin-top:8px;width:auto;padding:8px 16px;" data-action="mark-checkup-done">✓ Kontrolü Yapıldı İşaretle</button>
          ` : `
            <p class="footnote" style="margin:0;">Henüz kontrol tarihi kaydedilmedi.</p>
            <button class="qty-btn" style="margin-top:8px;width:auto;padding:8px 16px;" data-action="mark-checkup-done">📅 Bugün Kontrol Vardı</button>
          `}
        </div>

        <div>
          <p class="desc" style="margin:0 0 8px;font-weight:500;">🔕 Bildirim Ayarları</p>
          <label style="display:flex;align-items:center;gap:10px;cursor:pointer;">
            <input type="checkbox" ${p.notificationsEnabled !== false ? 'checked' : ''} data-action="toggle-notifications" style="width:20px;height:20px;" />
            <span class="desc" style="margin:0;">Bildirimleri etkinleştir</span>
          </label>
        </div>
      </div>

      <!-- Çıkış -->
      <button class="btn-primary" style="background:var(--bad);width:100%;" data-action="sign-out">Çıkış Yap</button>
    </div>`;
}

function renderProfileEdit() {
  const p = state.userProfile || {};
  return `${topbar("Profili Düzenle","Kişisel bilgilerinizi güncelleyin.", {back:"account"})}
    <div class="content">
      <div class="card p5">
        <div class="field"><label>Ad</label><input class="input" id="pf-first" placeholder="Adınız" value="${escapeAttr(p.firstName||"")}" /></div>
        <div class="field"><label>Soyad</label><input class="input" id="pf-last" placeholder="Soyadınız" value="${escapeAttr(p.lastName||"")}" /></div>
        <div class="field"><label>Yaş</label><input class="input" id="pf-age" type="number" placeholder="Yaşınız" value="${escapeAttr(p.age||"")}" /></div>
        <div class="field"><label>Kilo (kg)</label><input class="input" id="pf-weight" type="number" placeholder="Kilonuz" value="${escapeAttr(p.weight||"")}" /></div>
        <div class="field"><label>Boy (cm)</label><input class="input" id="pf-height" type="number" placeholder="Boyunuz" value="${escapeAttr(p.height||"")}" /></div>
        <button class="btn-primary" data-action="save-profile" style="width:100%;margin-top:12px;">💾 Kaydet</button>
      </div>
    </div>`;
}

function renderBrushingVideo() {
  if (!state.brushingVideoUrl) {
    return `${topbar("Diş Fırçalama","Video bulunamadı.", {back:"account"})}
      <div class="content"><p class="footnote">Henüz diş fırçalama videosu eklenmemiş.</p></div>`;
  }
  // YouTube embed
  let embedUrl = state.brushingVideoUrl;
  const ytMatch = state.brushingVideoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (ytMatch) embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;

  return `${topbar("🪥 Diş Fırçala!","Videoyu izle, dişlerini fırçala!", {back:"account"})}
    <div class="content">
      <div class="card p4" style="text-align:center;">
        <div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;">
          <iframe src="${embedUrl}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;" allow="autoplay;encrypted-media" allowfullscreen></iframe>
        </div>
        <p class="desc" style="margin:16px 0 8px;">🎵 Müzik eşliğinde 2 dakika dişlerini fırçala!</p>
        <button class="btn-primary" data-action="brush-teeth" style="margin-top:8px;">✅ Fırçalamayı Bitirdim!</button>
      </div>
    </div>`;
}

function renderFamilyAdd() {
  const editingId = state._editingFamilyMember;
  const member = editingId ? (state.familyMembers || []).find(m => m.id === editingId) : null;
  return `${topbar(editingId ? "Üyeyi Düzenle" : "Aile Üyesi Ekle", editingId ? "Bilgileri güncelleyin." : "Çocuğunuz veya aile üyenizi ekleyin.", {back:"account"})}
    <div class="content">
      <div class="card p5">
        <div class="field"><label>Ad Soyad</label><input class="input" id="fm-name" placeholder="Ad soyad" value="${escapeAttr(member?.name || "")}" /></div>
        <div class="field"><label>Yakınlık</label>
          <select class="input" id="fm-relation">
            <option value="Çocuğum" ${member?.relation === "Çocuğum" ? "selected" : ""}>Çocuğum</option>
            <option value="Eşim" ${member?.relation === "Eşim" ? "selected" : ""}>Eşim</option>
            <option value="Kardeşim" ${member?.relation === "Kardeşim" ? "selected" : ""}>Kardeşim</option>
            <option value="Annem/Babam" ${member?.relation === "Annem/Babam" ? "selected" : ""}>Annem/Babam</option>
            <option value="Diğer" ${member?.relation === "Diğer" ? "selected" : ""}>Diğer</option>
          </select>
        </div>
        <div class="field"><label>Yaş</label><input class="input" id="fm-age" type="number" placeholder="Yaş" value="${escapeAttr(member?.age || "")}" /></div>
        <div class="field"><label>Fırçalama Hatırlatma Saati</label><input type="time" class="input" id="fm-brush-time" value="${escapeAttr(member?.brushReminderTime || "20:00")}" /></div>
        <button class="btn-primary" data-action="save-family-member" style="width:100%;margin-top:12px;">💾 Kaydet</button>
      </div>
    </div>`;
}

function renderReviews() {
  const r = state.reviewForm;
  // Engellenen kullanıcıların yorumlarını gizle
  const filteredReviews = state.reviews.filter(rv => !rv.uid || !state.blockedUsers.includes(rv.uid));
  const list = filteredReviews.length ? filteredReviews.slice().reverse().map(rv => `
    <div class="card p4 mb3">
      <div class="row" style="justify-content:space-between;">
        <p class="name" style="font-size:14px;">${escapeHtml(rv.name)}</p>
        ${stars(rv.rating)}
      </div>
      <p class="desc" style="margin-top:6px;">${escapeHtml(rv.text)}</p>
      ${rv.adminReply ? `<div style="margin-top:10px;padding:10px 12px;background:var(--bg);border-radius:10px;border-left:3px solid var(--tealLight);">
        <p class="footnote" style="margin:0 0 3px;color:var(--tealLight);font-weight:600;">Nur Diş & Dental Klinik yanıtı</p>
        <p class="desc" style="margin:0;">${escapeHtml(rv.adminReply)}</p>
      </div>` : ""}
    </div>`).join("") : `<p class="footnote">Henüz yorum yok — ilk yorumu sen yapabilirsin!</p>`;

  const ratingBtns = [1,2,3,4,5].map(n => `<button class="star-btn ${r.rating===n?'star-active':''}" data-action="pick-rating" data-n="${n}">★</button>`).join("");

  return `${topbar("Yorumlar","Müşterilerimizin deneyimleri.", {back:"home"})}
    <div class="content">
      ${authGate("Yorum yapmak için Google ile giriş yapman gerekiyor.")}
      ${state.user ? `<div class="card p5 mb5">
        <p class="name" style="font-size:16px;margin-bottom:10px;">Yorum bırak</p>
        <div class="field"><label>Adın</label><input class="input" id="rv-name" placeholder="Adın" value="${escapeAttr(r.name)}" /></div>
        <div class="field"><label>Puan</label><div class="star-row">${ratingBtns}</div></div>
        <div class="field"><label>Yorumun</label><textarea id="rv-text" placeholder="Deneyimini paylaş">${escapeHtml(r.text)}</textarea></div>
        <button class="btn-primary" data-action="submit-review" ${!(r.name && r.text) ? "disabled":""}>Yorumu Paylaş</button>
      </div>` : ""}
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

  const list = state.myAppointments.slice().reverse().map(a => `
    <div class="card p4 mb3 row" style="justify-content:space-between;">
      <div><p class="name" style="font-size:14px;">Muayene</p><p class="desc">${escapeHtml(a.name)} · ${escapeHtml(a.phone)}</p></div>
      <span style="font-size:12px;color:var(--tealLight);font-family:'IBM Plex Mono',monospace;">${a.date} ${a.time}</span>
    </div>`).join("");

  return `${topbar("Randevu Al","Sadece muayene randevusu alınır — hangi tedaviye uygun olduğuna hekimimiz muayenede karar verir.")}
    <div class="content">
      ${authGate("Randevu almak için Google ile giriş yapman gerekiyor.")}
      ${state.user ? `<div class="card p5 mb5">
        <div class="field"><label>Hizmet</label><input class="input" value="Muayene" disabled style="background:#EEF6F4;color:var(--muted);" /></div>
        <div class="field"><label>Tarih</label><input class="input" type="date" id="f-date" value="${f.date}" /></div>
        <div class="field"><label>Saat</label><div class="slot-grid">${slots}</div></div>
        <div class="field"><label>Ad Soyad</label><input class="input" id="f-name" placeholder="Adınız Soyadınız" value="${escapeAttr(f.name)}" /></div>
        <div class="field"><label>Telefon</label><input class="input" id="f-phone" placeholder="05xx xxx xx xx" value="${escapeAttr(f.phone)}" /></div>
        <button class="btn-primary" data-action="submit-booking" ${!canSubmit || state.bookingStatus==='saving' ? 'disabled':''}>
          ${state.bookingStatus==='saving' ? 'Kaydediliyor…' : icon('calendar',16)+' Randevuyu Onayla'}
        </button>
        ${statusHtml}
      </div>` : ""}
      ${state.myAppointments.length ? `<p class="section-label">Bu oturumda oluşturduğun randevular</p>${list}` : ""}
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
      ${cat.items.map(p => {
        const img = state.productImages[p.id];
        const thumb = img
          ? `<img src="${img}" style="width:52px;height:52px;border-radius:10px;object-fit:cover;flex-shrink:0;" />`
          : `<div class="badge badge-blue" style="width:52px;height:52px;">${icon("box",22)}</div>`;
        return `
        <div class="card p4 mb3 row" style="justify-content:space-between;">
          ${thumb}
          <div style="flex:1;"><p class="name" style="font-size:14px;">${p.name}</p><p class="desc">${p.price} ₺</p></div>
          <div class="qty-row">
            <button class="qty-btn" data-action="cart-dec" data-id="${p.id}">−</button>
            <span class="qty-val">${state.cart[p.id]||0}</span>
            <button class="qty-btn" data-action="cart-inc" data-id="${p.id}">+</button>
          </div>
        </div>`;
      }).join("")}
    </div>`).join("");

  const count = cartCount();
  return `${topbar("Mağaza","Klinikten temin edebileceğiniz ağız bakım ürünleri.", {back:"home"})}
    <div class="content" style="padding-bottom:90px;">
      ${cats}
      <p class="footnote">Ürünler örnektir — yönetici panelinden yeni ürün ekleyebilir ve görsellerini güncelleyebilirsiniz.</p>
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
      ${authGate("Sipariş verebilmek için Google ile giriş yapman gerekiyor.")}
      ${state.user ? `<div class="card p5 mb4">
        <div class="field"><label>Ad Soyad</label><input class="input" id="ck-name" value="${escapeAttr(c.name)}" /></div>
        <div class="field"><label>Telefon</label><input class="input" id="ck-phone" placeholder="05xx xxx xx xx" value="${escapeAttr(c.phone)}" /></div>
        <div class="field"><label>Teslimat Adresi</label><textarea id="ck-address" placeholder="Açık adres">${escapeHtml(c.address)}</textarea></div>
        <button class="btn-primary" data-action="submit-order" ${!canSubmit?"disabled":""}>Siparişi Onayla</button>
      </div>` : ""}
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
      <div class="card p4 mb4 row"><div>${icon("pin",18)}</div><p style="margin:0;font-size:14px;">Mardin, Kızıltepe, TOKİ Mahallesi</p></div>
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
        <div class="card p4 mb3 row"><div>${icon("pin",18)}</div><p style="margin:0;font-size:14px;">Mardin, Kızıltepe, TOKİ</p></div>
        <div class="card p4 mb3 row"><div>${icon("mail",18)}</div><p style="margin:0;font-size:14px;">0505 105 03 02</p></div>
        <div class="card p4 mb3 row"><div>${icon("calendar",18)}</div><p style="margin:0;font-size:14px;">Hafta içi 09:00–18:00, Cumartesi 10:00–14:00</p></div>
        <div class="card p4 row"><div>${icon("user",18)}</div><p style="margin:0;font-size:14px;">Dt. Ramazan DAĞ</p></div>
      </div>
      
      ${Object.keys(state.socialMedia).length > 0 ? `
      <div class="card p4 mb5">
        <p class="name" style="font-size:16px;margin-bottom:12px;">📱 Bizi Takip Edin</p>
        ${state.socialMedia.youtube ? `<a href="${state.socialMedia.youtube}" target="_blank" class="card p3 mb2 row" style="text-decoration:none;color:var(--ink);"><div>📺</div><p style="margin:0;font-size:14px;">YouTube</p></a>` : ''}
        ${state.socialMedia.instagram ? `<a href="${state.socialMedia.instagram}" target="_blank" class="card p3 mb2 row" style="text-decoration:none;color:var(--ink);"><div>📷</div><p style="margin:0;font-size:14px;">Instagram</p></a>` : ''}
        ${state.socialMedia.twitter ? `<a href="${state.socialMedia.twitter}" target="_blank" class="card p3 mb2 row" style="text-decoration:none;color:var(--ink);"><div>🐦</div><p style="margin:0;font-size:14px;">Twitter / X</p></a>` : ''}
        ${state.socialMedia.facebook ? `<a href="${state.socialMedia.facebook}" target="_blank" class="card p3 mb2 row" style="text-decoration:none;color:var(--ink);"><div>📘</div><p style="margin:0;font-size:14px;">Facebook</p></a>` : ''}
        ${state.socialMedia.whatsapp ? `<a href="${state.socialMedia.whatsapp.startsWith('http') ? escapeAttr(state.socialMedia.whatsapp) : 'https://wa.me/' + state.socialMedia.whatsapp.replace(/\D/g, '')}" target="_blank" class="card p3 mb2 row" style="text-decoration:none;color:var(--ink);"><div>📱</div><p style="margin:0;font-size:14px;">WhatsApp</p></a>` : ''}
      </div>` : ''}
      <div class="card p5">
        <p class="name" style="font-size:17px;margin-bottom:12px;">Mesaj bırak</p>
        <div class="field"><label>Ad Soyad</label><input class="input" id="c-name" value="${escapeAttr(c.name)}" /></div>
        <div class="field"><label>Telefon (opsiyonel)</label><input class="input" id="c-phone" value="${escapeAttr(c.phone)}" /></div>
        <div class="field"><label>Mesajınız</label><textarea id="c-msg" placeholder="Sorunuzu yazın">${escapeHtml(c.msg)}</textarea></div>
        <button class="btn-primary" data-action="submit-contact" ${!canSubmit || state.contactStatus==='saving' ? 'disabled':''}>
          ${state.contactStatus==='saving' ? 'Gönderiliyor…' : icon('mail',16)+' Mesajı Gönder'}
        </button>
        ${statusHtml}
      </div>
    </div>`;
}

/* ---------------- BİLGİ ---------------- */

function renderInfo() {
  const tabs = [
    { id:"Bebekler", label:"Bebekler" },
    { id:"Çocuklar", label:"Çocuklar" },
    { id:"Yetişkinler", label:"Yetişkinler" },
    { id:"Yanlışlar", label:"Doğru Bilinen Yanlışlar" },
    { id:"Bitkiler", label:"Şifalı Bitkiler" },
  ];
  const active = state.infoTab || "Bebekler";

  const tabBtns = tabs.map(t => `
    <button class="chip ${active===t.id?'chip-active':''}" data-action="set-info-tab" data-id="${t.id}">${t.label}</button>`).join("");

  let body = "";
  if (active === "Yanlışlar") {
    body = MYTHS.map(m => `
      <div class="card p4 mb3">
        <div class="row-start mb3"><div class="myth-x">✕</div><p class="desc" style="margin:0;">${m.wrong}</p></div>
        <div class="row-start"><div class="myth-check">✓</div><p class="name" style="font-size:14px;">${m.right}</p></div>
      </div>`).join("");
  } else if (active === "Bitkiler") {
    body = `
      <div class="card p4 mb4" style="background:#FFF8E8;border-color:#F0DFAF;">
        <p class="desc" style="margin:0;color:#8A6D1D;">⚠️ Bu bölüm yalnızca genel bilgi amaçlıdır, tıbbi tavsiye ya da tedavi önerisi değildir. Sorumluluk kullanıcıya aittir. Şikayetin devam etmesi veya şiddetlenmesi durumunda mutlaka diş hekimine başvurunuz.</p>
      </div>
      ${HERBS.map(h => `
        <div class="card p4 mb3">
          <p class="name" style="font-size:14px;">${h.name}</p>
          <p class="desc" style="margin-top:6px;"><b>Ne için iyi gelir:</b> ${h.helps}</p>
          <p class="desc"><b>Nasıl kullanılır:</b> ${h.how}</p>
          <p class="desc"><b>Miktar:</b> ${h.amount}</p>
          <p class="desc" style="color:var(--bad);"><b>Dikkat:</b> ${h.caution}</p>
        </div>`).join("")}`;
  } else {
    body = ARTICLES.filter(a=>a.group===active).map(a => `
      <div class="card p4 mb3">
        <p class="name" style="font-size:14px;">${a.title}</p>
        <p class="desc" style="margin-top:6px;">${a.body}</p>
      </div>`).join("");
    if (active === "Bebekler") {
      body = `<div class="card p4 mb4" style="padding:0;overflow:hidden;"><img src="info-toothache.jpg" style="width:100%;display:block;" alt="Diş ağrısı bilgi kartı" /></div>` + body;
    }
  }

  return `${topbar("Diş Sağlığı Bilgileri","Bebeklerden yetişkinlere, doğru bilinen yanlışlar ve şifalı bitkiler dahil.", {back:"home"})}
    <div class="content">
      <div class="chip-row mb4" style="flex-wrap:wrap;">${tabBtns}</div>
      ${body}
    </div>`;
}

/* ---------------- CHATBOT ---------------- */

function findChatReply(text) {
  const lower = text.toLocaleLowerCase("tr");
  for (const item of CHATBOT_KB) {
    for (const k of item.keys) if (lower.includes(k)) return item;
  }
  return { reply: CHATBOT_FALLBACK };
}

function renderChatbot() {
  if (!state.user) {
    return `${topbar("DİJİ RAMO","Diş sağlığı asistanınız.")}
      <div class="content">
        <div class="card p5" style="text-align:center;">
          <div style="font-size:64px;margin-bottom:16px;">🤖</div>
          <p class="name" style="font-size:18px;margin-bottom:8px;">DİJİ RAMO ile Sohbet</p>
          <p class="desc" style="margin-bottom:24px;">Diş sağlığı hakkında soru sormak ve fotoğraf göndermek için önce giriş yapmanız gerekiyor.</p>
          <button class="btn-primary" data-action="sign-in-google" style="display:inline-flex;align-items:center;gap:10px;padding:14px 28px;font-size:16px;">
            <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
            Google ile Giriş Yap
          </button>
        </div>
      </div>`;
  }
  const msgs = state.chatLog.map(m => `
    <div class="chat-msg ${m.from==='user' ? 'chat-user':'chat-bot'}">${m.image ? `<img src="${m.image}" style="width:100%;border-radius:10px;margin-bottom:6px;display:block;" />` : ""}${escapeHtml(m.text)}${m.bookingBtn ? `<br><button class="btn-primary" style="margin-top:10px;padding:10px 16px;font-size:13px;" data-action="goto" data-screen="booking">📅 Randevu Al</button>` : ""}</div>`).join("");
  return `${topbar("DİJİ RAMO","Diş sağlığı hakkında soru sor, dişinin fotoğrafını da gönderebilirsin.")}
    <div class="content" style="padding-bottom:100px;">
      ${!AI_ENDPOINT_READY ? `<p class="footnote" style="margin-bottom:10px;">ℹ️ Şu an genişletilmiş bilgi tabanıyla cevap veriyorum. Yapay zeka bağlantısı aktif olunca (yönetici tarafından kurulacak) her konuya cevap verebileceğim.</p>` : ""}
      <div class="chat-log" id="chat-log">${msgs}</div>
    </div>
    <div class="chat-input-bar">
      <input type="file" accept="image/*" id="chat-photo-input" style="display:none;" data-action-change="chat-photo" />
      <button class="qty-btn" style="width:auto;padding:0 12px;" data-action="chat-photo-pick">📷</button>
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
        <div class="field"><label>Yönetici e-postası</label><input class="input" id="ad-email" value="${escapeAttr(f.email)}" /></div>
        <div class="field"><label>Şifre</label><input class="input" type="password" id="ad-pass" value="${escapeAttr(f.pass)}" /></div>
        ${state.adminError ? `<p class="status-err">${state.adminError}</p>` : ""}
        <button class="btn-primary" data-action="admin-login" ${state.authBusy?"disabled":""}>${state.authBusy?"Giriş yapılıyor…":"Giriş Yap"}</button>
        <p class="footnote">Bu e-posta/şifre, Firebase konsolunda Authentication &gt; Users kısmında oluşturduğun yönetici hesabıdır.</p>
      </div>
    </div>`;
}

/* =========================================================
   NUR DİŞ & DENTAL KLİNİK — MUHASEBE MODÜLÜ v2
   • Personel & SGK primi otomasyonu (2026 parametreleri)
   • Vergi / beyanname özeti + GİB & SGK resmî bağlantıları
   • Haftalık / aylık / 3 aylık / 6 aylık / yıllık raporlar
   • Her gelir ve gider kaydını düzenleme
========================================================= */

/* ---------------- YARDIMCI ---------------- */

function accTL(n) {
  return "₺" + (Number(n) || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function accTL0(n) {
  return "₺" + Math.round(Number(n) || 0).toLocaleString("tr-TR");
}
function accNum(v) { const n = parseFloat(v); return isNaN(n) ? 0 : n; }
function accToday() { return new Date().toISOString().split("T")[0]; }

/* 2026 resmî parametreler (brüt asgari ücret 33.030 ₺, tavan 9 kat) */
const SGK_DEFAULTS = {
  minWage: 33030,
  tavanCarpan: 9,
  isciSgk: 14,
  isciIssizlik: 1,
  isverenSgk: 20.5,
  isverenIssizlik: 2,
  tesvikPuan: 5,
  damgaOran: 0.00759,
  vergiDilimleri: [
    { ust: 190000, oran: 0.15 },
    { ust: 400000, oran: 0.20 },
    { ust: 1000000, oran: 0.27 },
    { ust: 5300000, oran: 0.35 },
    { ust: null, oran: 0.40 }
  ]
};

function sgkSet() {
  return Object.assign({}, SGK_DEFAULTS, state.sgkSettings || {});
}

/* Kümülatif gelir vergisi dilim hesabı */
function accGelirVergisi(matrah, dilimler) {
  const d = dilimler || SGK_DEFAULTS.vergiDilimleri;
  let vergi = 0, alt = 0;
  for (let i = 0; i < d.length; i++) {
    const ust = (d[i].ust == null) ? Infinity : d[i].ust;
    if (matrah > alt) {
      const kismi = Math.min(matrah, ust) - alt;
      if (kismi > 0) vergi += kismi * d[i].oran;
    }
    alt = ust;
    if (matrah <= ust) break;
  }
  return vergi;
}

/* Bir personelin tek aylık bordrosu */
function accPayroll(p) {
  const s = sgkSet();
  const gun = Math.max(0, Math.min(30, accNum(p.days) || 30));
  const oran = gun / 30;
  const brut = accNum(p.grossSalary);

  const alt = s.minWage * oran;
  const ust = s.minWage * (s.tavanCarpan || 9) * oran;

  let pek = brut * oran;
  let uyari = "";
  if (pek < alt) { pek = alt; uyari = "Brüt ücret asgari ücretin altında — prime esas kazanç alt sınıra çekildi."; }
  if (pek > ust) { pek = ust; uyari = "Prime esas kazanç tavanı aşıldı — tavan tutardan hesaplandı."; }

  const isciSgk = pek * s.isciSgk / 100;
  const isciIssiz = pek * s.isciIssizlik / 100;
  const isverenSgkOran = Math.max(0, s.isverenSgk - (p.tesvikli ? s.tesvikPuan : 0));
  const isverenSgk = pek * isverenSgkOran / 100;
  const isverenIssiz = pek * s.isverenIssizlik / 100;

  const gvMatrah = pek - isciSgk - isciIssiz;
  const asgariMatrah = Math.max(0, alt - (alt * (s.isciSgk + s.isciIssizlik) / 100));
  const vergiBrut = accGelirVergisi(gvMatrah * 12, s.vergiDilimleri) / 12;
  const vergiIstisna = accGelirVergisi(asgariMatrah * 12, s.vergiDilimleri) / 12;
  const gelirVergisi = Math.max(0, vergiBrut - vergiIstisna);

  const damga = Math.max(0, pek * s.damgaOran - alt * s.damgaOran);

  const net = pek - isciSgk - isciIssiz - gelirVergisi - damga;
  const toplamSgk = isciSgk + isciIssiz + isverenSgk + isverenIssiz;
  const isvereneMaliyet = pek + isverenSgk + isverenIssiz;

  return {
    gun, brut, pek, alt, ust,
    isciSgk, isciIssiz, isverenSgk, isverenSgkOran, isverenIssiz,
    gvMatrah, gelirVergisi, damga, net, toplamSgk, isvereneMaliyet, uyari
  };
}

/* Aktif personelin toplam SGK yükü */
function accPayrollTotal(list) {
  const arr = (list || state.personnel || []).filter(p => p.aktif !== false);
  const t = { kisi: arr.length, brut: 0, pek: 0, isciSgk: 0, isciIssiz: 0, isverenSgk: 0, isverenIssiz: 0, gelirVergisi: 0, damga: 0, net: 0, toplamSgk: 0, isvereneMaliyet: 0 };
  arr.forEach(p => {
    const c = accPayroll(p);
    t.brut += c.brut; t.pek += c.pek;
    t.isciSgk += c.isciSgk; t.isciIssiz += c.isciIssiz;
    t.isverenSgk += c.isverenSgk; t.isverenIssiz += c.isverenIssiz;
    t.gelirVergisi += c.gelirVergisi; t.damga += c.damga;
    t.net += c.net; t.toplamSgk += c.toplamSgk; t.isvereneMaliyet += c.isvereneMaliyet;
  });
  return t;
}

/* ---------------- DÖNEM ARALIĞI ---------------- */

function accRangeStart(key) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  if (key === "ozel" && state.accFrom) return new Date(state.accFrom + "T00:00:00");
  switch (key) {
    case "hafta": { const k = (d.getDay() + 6) % 7; d.setDate(d.getDate() - k); return d; }
    case "ay": return new Date(d.getFullYear(), d.getMonth(), 1);
    case "3ay": return new Date(d.getFullYear(), d.getMonth() - 2, 1);
    case "6ay": return new Date(d.getFullYear(), d.getMonth() - 5, 1);
    case "yil": return new Date(d.getFullYear(), 0, 1);
    default: return new Date(d.getFullYear(), d.getMonth(), 1);
  }
}
function accRangeEnd(key) {
  if (key === "ozel" && state.accTo) {
    const d = new Date(state.accTo + "T23:59:59");
    return d;
  }
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}
function accRangeLabel(key) {
  const map = { hafta: "Bu Hafta", ay: "Bu Ay", "3ay": "Son 3 Ay", "6ay": "Son 6 Ay", yil: "Bu Yıl", ozel: "Özel Aralık" };
  if (key === "ozel") return (state.accFrom || "—") + " → " + (state.accTo || "—");
  return map[key] || "Bu Ay";
}
function accInRange(items) {
  const bas = accRangeStart(state.accRange).getTime();
  const bit = accRangeEnd(state.accRange).getTime();
  return (items || []).filter(x => {
    if (!x || !x.date) return false;
    const t = new Date(x.date).getTime();
    return t >= bas && t <= bit;
  });
}
function accSum(items, field) {
  return (items || []).reduce((s, x) => s + accNum(x[field]), 0);
}
function accGroupBy(items, field) {
  const m = {};
  (items || []).forEach(x => {
    const k = x[field] || "Diğer";
    if (!m[k]) m[k] = { toplam: 0, adet: 0 };
    m[k].toplam += accNum(x.amount);
    m[k].adet++;
  });
  return Object.entries(m).sort((a, b) => b[1].toplam - a[1].toplam);
}

/* ---------------- RESMÎ BAĞLANTILAR ---------------- */

const ACC_LINKS = {
  sgkEBildirge: "https://ebildirge.sgk.gov.tr/",
  sgkEDevlet: "https://www.turkiye.gov.tr/",
  gibEBeyanname: "https://ebeyanname.gib.gov.tr/",
  gibDijital: "https://dijital.gib.gov.tr/",
  gibInteraktif: "https://ivd.gib.gov.tr/"
};

function accCopy(text) {
  const bitir = (ok) => alert(ok ? "✅ Kopyalandı. Resmî sisteme yapıştırabilirsiniz." : "Kopyalanamadı — metni elle seçip kopyalayın.");
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => bitir(true)).catch(() => bitir(false));
  } else {
    const ta = document.createElement("textarea");
    ta.value = text; document.body.appendChild(ta); ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    ta.remove(); bitir(ok);
  }
}

function accSgkOzetMetni() {
  const s = sgkSet();
  const ay = new Date();
  const donem = String(ay.getMonth() + 1).padStart(2, "0") + "/" + ay.getFullYear();
  const t = accPayrollTotal();
  let m = "NUR DİŞ & DENTAL KLİNİK\n";
  m += "AYLIK PRİM VE HİZMET BELGESİ ÖZETİ\n";
  m += "Dönem: " + donem + "\n";
  m += "Asgari ücret (brüt): " + accTL(s.minWage) + " · Tavan: " + accTL(s.minWage * s.tavanCarpan) + "\n";
  m += "--------------------------------------------------\n";
  (state.personnel || []).filter(p => p.aktif !== false).forEach((p, i) => {
    const c = accPayroll(p);
    m += (i + 1) + ". " + (p.name || "-") + (p.tcNo ? " (TC: " + p.tcNo + ")" : "") + "\n";
    m += "   Görev: " + (p.position || "-") + " · Gün: " + c.gun + " · SPEK: " + accTL(c.pek) + "\n";
    m += "   İşçi payı: " + accTL(c.isciSgk + c.isciIssiz) + " · İşveren payı: " + accTL(c.isverenSgk + c.isverenIssiz) + "\n";
    m += "   Toplam prim: " + accTL(c.toplamSgk) + " · Net ücret: " + accTL(c.net) + "\n";
  });
  m += "--------------------------------------------------\n";
  m += "TOPLAM SİGORTA PRİMİ: " + accTL(t.toplamSgk) + "\n";
  m += "  İşçi payı toplamı: " + accTL(t.isciSgk + t.isciIssiz) + "\n";
  m += "  İşveren payı toplamı: " + accTL(t.isverenSgk + t.isverenIssiz) + "\n";
  m += "TOPLAM İŞVEREN MALİYETİ: " + accTL(t.isvereneMaliyet) + "\n";
  m += "\nBu özet ön hazırlıktır; resmî bildirim e-Bildirge üzerinden yapılır.\n";
  return m;
}

function accVergiOzetMetni() {
  const inc = accInRange(state.accounting.incomes);
  const exp = accInRange(state.accounting.expenses);
  const brut = inc.reduce((s, i) => s + accNum(i.grossAmount || i.amount), 0);
  const kdv = accSum(inc, "kdv");
  const stopaj = accSum(inc, "stopaj");
  const damga = accSum(inc, "damga");
  const gider = accSum(exp, "amount");
  const kdvGider = exp.reduce((s, e) => s + (accNum(e.kdv) || 0), 0);
  let m = "NUR DİŞ & DENTAL KLİNİK\n";
  m += "BEYANNAME ÖN ÖZETİ — " + accRangeLabel(state.accRange) + "\n";
  m += "--------------------------------------------------\n";
  m += "Brüt gelir: " + accTL(brut) + "\n";
  m += "Hesaplanan KDV (%10): " + accTL(kdv) + "\n";
  m += "İndirilecek KDV (gider): " + accTL(kdvGider) + "\n";
  m += "ÖDENECEK KDV: " + accTL(Math.max(0, kdv - kdvGider)) + "\n";
  m += "--------------------------------------------------\n";
  m += "Stopaj (%20): " + accTL(stopaj) + "\n";
  m += "Damga vergisi: " + accTL(damga) + "\n";
  m += "Toplam gider: " + accTL(gider) + "\n";
  m += "Net kâr: " + accTL(brut - gider) + "\n";
  m += "\nBu özet ön hazırlıktır; beyanname GİB e-Beyanname üzerinden verilir.\n";
  return m;
}

/* ---------------- RENDER: ANA GİRİŞ ---------------- */

/* =========================================================
   NUR DİŞ — MALİ MÜŞAVİR MOTORU v3
   Beyanname takvimi, KDV/Geçici/Yıllık vergi, amortisman,
   cari hesap (alacak takibi) ve merkezi uyarı motoru.
   2026 resmî parametreleri.
========================================================= */

/* ---------------- 2026 VERGİ DİLİMLERİ (GVK m.103) ---------------- */
const GV_2026_TICARI = [
  { ust: 190000,   oran: 0.15, taban: 0 },
  { ust: 400000,   oran: 0.20, taban: 28500 },
  { ust: 1000000,  oran: 0.27, taban: 70500 },
  { ust: 5300000,  oran: 0.35, taban: 232500 },
  { ust: null,     oran: 0.40, taban: 1737500 }
];

/* Kümülatif dilim hesabı — 2026 ücret dışı/taciri kazanç tarifesi */
function gvHesapla(matrah) {
  if (!(matrah > 0)) return 0;
  let alt = 0;
  for (const d of GV_2026_TICARI) {
    const ust = d.ust == null ? Infinity : d.ust;
    if (matrah <= ust) return d.taban + (matrah - alt) * d.oran;
    alt = ust;
  }
  return 0;
}
/* Bir sonraki dilime kalan tutar (bilgi amaçlı) */
function gvDilimBilgi(matrah) {
  let alt = 0;
  for (const d of GV_2026_TICARI) {
    const ust = d.ust == null ? Infinity : d.ust;
    if (matrah < ust) return { oran: d.oran, kalan: ust === Infinity ? null : ust - matrah, ust };
    alt = ust;
  }
  return { oran: 0.40, kalan: null, ust: null };
}

/* ---------------- BEYANNAME TAKVİMİ ---------------- */
/* Türkiye'de mali müşavirliğin omurgası: hangi beyanname ne zaman */
const BEYAN_TURLERI = [
  { id: "kdv",        ad: "KDV Beyannamesi",              gun: 28, ayKaydir: 1, kurum: "GİB",  link: "gibEBeyanname", aciklama: "Aylık KDV beyanı ve ödemesi" },
  { id: "muhtasar",   ad: "Muhtasar ve Prim Hizmet",      gun: 26, ayKaydir: 1, kurum: "GİB",  link: "gibEBeyanname", aciklama: "Stopaj + SGK primi bildirimi" },
  { id: "damga",      ad: "Damga Vergisi",                gun: 26, ayKaydir: 1, kurum: "GİB",  link: "gibEBeyanname", aciklama: "Sözleşme/damga vergisi" },
  { id: "sgk",        ad: "SGK Prim Ödemesi",             gun: 26, ayKaydir: 1, kurum: "SGK",  link: "sgkEBildirge",  aciklama: "Aylık prim ve hizmet bedeli" }
];

const GECICI_VERGI_DONEM = [
  { d: 1, aylar: "Ocak-Mart",      son: [4, 17],  kapsam: [1, 3] },
  { d: 2, aylar: "Nisan-Haziran",  son: [7, 17],  kapsam: [4, 6] },
  { d: 3, aylar: "Temmuz-Eylül",   son: [10, 17], kapsam: [7, 9] }
];

/* Bugüne en yakın (geçmiş + gelecek) beyanname listesi üretir */
function accBeyannameListesi(aySayisi) {
  const liste = [];
  const simdi = new Date();
  const geri = aySayisi || 2;
  const ileri = 3;

  for (let offset = -geri; offset <= ileri; offset++) {
    const donem = new Date(simdi.getFullYear(), simdi.getMonth() + offset, 1);
    const yil = donem.getFullYear();
    const ay = donem.getMonth(); // 0-11

    BEYAN_TURLERI.forEach(t => {
      const vade = new Date(yil, ay + t.ayKaydir, t.gun);
      liste.push({
        id: t.id + "_" + yil + "_" + (ay + 1),
        ad: t.ad,
        donem: donem.toLocaleDateString("tr-TR", { month: "long", year: "numeric" }),
        donemKey: yil + "-" + String(ay + 1).padStart(2, "0"),
        vade,
        kurum: t.kurum,
        link: t.link,
        aciklama: t.aciklama
      });
    });
  }

  // Geçici vergi dönemleri (içinde bulunulan yıla ait)
  GECICI_VERGI_DONEM.forEach(g => {
    const vade = new Date(simdi.getFullYear(), g.son[0], g.son[1]);
    liste.push({
      id: "gecici_" + g.d,
      ad: g.d + ". Dönem Geçici Vergi",
      donem: g.aylar + " " + simdi.getFullYear(),
      donemKey: "G" + g.d,
      vade,
      kurum: "GİB",
      link: "gibEBeyanname",
      aciklama: "Kümülatif kâr üzerinden %15-40",
      geciciDonem: g.d
    });
  });

  // Yıllık gelir vergisi + taksitler
  liste.push({
    id: "yillik_gv_" + (simdi.getFullYear() - 1),
    ad: "Yıllık Gelir Vergisi Beyannamesi",
    donem: (simdi.getFullYear() - 1) + " yılı",
    donemKey: "YGV",
    vade: new Date(simdi.getFullYear(), 2, 31),
    kurum: "GİB",
    link: "gibEBeyanname",
    aciklama: "Önceki yıl kazancı — 1. taksit"
  });
  liste.push({
    id: "gv_taksit2_" + simdi.getFullYear(),
    ad: "Gelir Vergisi 2. Taksit",
    donem: (simdi.getFullYear() - 1) + " yılı",
    donemKey: "GV2",
    vade: new Date(simdi.getFullYear(), 6, 31),
    kurum: "GİB",
    link: "gibDijital",
    aciklama: "Yıllık GV ikinci taksit"
  });

  // Bağ-Kur / 4-b primi (aylık)
  for (let offset = 0; offset <= 1; offset++) {
    const donem = new Date(simdi.getFullYear(), simdi.getMonth() + offset, 1);
    liste.push({
      id: "bagkur_" + donem.getFullYear() + "_" + (donem.getMonth() + 1),
      ad: "Bağ-Kur (4/b) Primi",
      donem: donem.toLocaleDateString("tr-TR", { month: "long", year: "numeric" }),
      donemKey: donem.getFullYear() + "-" + String(donem.getMonth() + 1).padStart(2, "0"),
      vade: new Date(donem.getFullYear(), donem.getMonth() + 1, 1),
      kurum: "SGK",
      link: "sgkEDevlet",
      aciklama: "Aylık isteğe bağlı / zorunlu 4-b primi"
    });
  }

  liste.sort((a, b) => a.vade - b.vade);
  return liste;
}

/* Vadeye kalan gün → durum rengi */
function accVadeDurum(vade, id) {
  const bugun = new Date();
  bugun.setHours(0, 0, 0, 0);
  const v = new Date(vade);
  v.setHours(0, 0, 0, 0);
  const gun = Math.round((v - bugun) / 86400000);
  const tamam = id ? !!(state.accTamamlanan || {})[id] : false;

  if (tamam) return { gun, renk: "#2E7D32", etiket: "✅ Tamamlandı", gecti: false, tamam: true };

  let renk = "#2E7D32", etiket = "";
  if (gun < -45) { renk = "#9E9E9E"; etiket = "Geçmiş dönem"; }
  else if (gun < 0) { renk = "#C62828"; etiket = Math.abs(gun) + " gün geçti — beyan edildi mi?"; }
  else if (gun === 0) { renk = "#D32F2F"; etiket = "BUGÜN SON GÜN"; }
  else if (gun <= 3) { renk = "#E65100"; etiket = gun + " gün kaldı"; }
  else if (gun <= 7) { renk = "#F9A825"; etiket = gun + " gün kaldı"; }
  else { renk = "#2E7D32"; etiket = gun + " gün kaldı"; }
  return { gun, renk, etiket, gecti: gun < 0, tamam: false };
}

/* ---------------- KDV BEYANNAMESİ ---------------- */
/* Devreden KDV zinciri: yıl başından itibaren kümülatif */
function accKdvSeri(yil) {
  const aylar = [];
  let devreden = 0;
  for (let m = 0; m < 12; m++) {
    const inc = (state.accounting.incomes || []).filter(x => {
      const d = new Date(x.date); return d.getFullYear() === yil && d.getMonth() === m;
    });
    const exp = (state.accounting.expenses || []).filter(x => {
      const d = new Date(x.date); return d.getFullYear() === yil && d.getMonth() === m;
    });
    const hesaplanan = inc.reduce((s, x) => s + accNum(x.kdv), 0);
    const indirilecek = exp.reduce((s, x) => s + accNum(x.kdv), 0);

    const oncekiDevir = devreden;
    let odenecek = 0;
    const toplamIndirim = indirilecek + oncekiDevir;
    if (hesaplanan > toplamIndirim) {
      odenecek = hesaplanan - toplamIndirim;
      devreden = 0;
    } else {
      odenecek = 0;
      devreden = toplamIndirim - hesaplanan;
    }

    aylar.push({
      ay: m + 1,
      etiket: new Date(yil, m, 1).toLocaleDateString("tr-TR", { month: "long" }),
      hesaplanan, indirilecek, oncekiDevir, odenecek,
      sonrakiDevir: devreden,
      brutGelir: inc.reduce((s, x) => s + accNum(x.grossAmount || x.amount), 0),
      islemSayisi: inc.length
    });
  }
  return aylar;
}

function accKdvDonem(yil, ay) { // ay: 1-12
  const seri = accKdvSeri(yil);
  return seri[ay - 1] || null;
}

/* ---------------- GEÇİCİ VERGİ ---------------- */
/* Kümülatif ticari kâr üzerinden hesaplanır, önceki dönemler mahsup edilir. */
function accGeciciVergi(yil, donem) {
  const g = GECICI_VERGI_DONEM.find(x => x.d === donem);
  if (!g) return null;
  const sonAy = g.kapsam[1]; // 1-12

  const inc = (state.accounting.incomes || []).filter(x => {
    const d = new Date(x.date); return d.getFullYear() === yil && (d.getMonth() + 1) <= sonAy;
  });
  const exp = (state.accounting.expenses || []).filter(x => {
    const d = new Date(x.date); return d.getFullYear() === yil && (d.getMonth() + 1) <= sonAy;
  });

  // Geçici vergi matrahı: brüt gelir - giderler (KDV hariç)
  const gelir = inc.reduce((s, x) => s + accNum(x.grossAmount || x.amount), 0);
  const gider = exp.reduce((s, x) => s + accNum(x.amount), 0);
  const kar = gelir - gider;
  const matrah = Math.max(0, kar);

  const kumulatifVergi = gvHesapla(matrah);

  // Önceki dönemlerde hesaplanan geçici vergiler
  let oncekiVergi = 0;
  for (let d = 1; d < donem; d++) {
    const prev = accGeciciVergi(yil, d);
    if (prev) oncekiVergi += prev.odenecek;
  }
  const odenecek = Math.max(0, kumulatifVergi - oncekiVergi);

  return {
    donem, kapsam: g.aylar, sonTarih: new Date(yil, g.son[0], g.son[1]),
    gelir, gider, kar, matrah, kumulatifVergi, oncekiVergi, odenecek,
    efektifOran: matrah > 0 ? (kumulatifVergi / matrah * 100) : 0
  };
}

/* ---------------- YILLIK GELİR VERGİSİ ---------------- */
function accYillikGelirVergisi(yil) {
  const inc = (state.accounting.incomes || []).filter(x => new Date(x.date).getFullYear() === yil);
  const exp = (state.accounting.expenses || []).filter(x => new Date(x.date).getFullYear() === yil);

  const gelir = inc.reduce((s, x) => s + accNum(x.grossAmount || x.amount), 0);
  const gider = exp.reduce((s, x) => s + accNum(x.amount), 0);
  // Amortisman gideri
  const amort = accAmortismanYillik(yil);
  const toplamGider = gider + amort;
  const kar = gelir - toplamGider;
  const matrah = Math.max(0, kar);

  const vergi = gvHesapla(matrah);
  // Geçici vergi mahsubu
  let geciciToplam = 0;
  for (let d = 1; d <= 3; d++) {
    const g = accGeciciVergi(yil, d);
    if (g) geciciToplam += g.odenecek;
  }
  // 4. dönem geçici vergi yok — yıllıkta hesaplaşılır
  const kalan = Math.max(0, vergi - geciciToplam);
  // Damga vergisi (beyanname)
  const beyannameDamga = matrah > 0 ? Math.max(0, matrah * 0.000568) : 0;

  return {
    yil, gelir, gider, amortisman: amort, toplamGider, kar, matrah,
    vergi, geciciToplam, kalan, beyannameDamga,
    taksit1: kalan / 2, taksit2: kalan / 2,
    efektifOran: matrah > 0 ? (vergi / matrah * 100) : 0
  };
}

/* ---------------- AMORTİSMAN (VUK 333) ---------------- */
const AMORT_OMURLER = [
  { ad: "Bilgisayar / yazılım", yil: 4 },
  { ad: "Mobilya ve demirbaş", yil: 10 },
  { ad: "Tıbbi cihaz (küçük)", yil: 5 },
  { ad: "Tıbbi cihaz (büyük / röntgen)", yil: 10 },
  { ad: "Dental ünite / koltuk", yil: 10 },
  { ad: "Bina", yil: 40 },
  { ad: "Binek otomobil", yil: 5 },
  { ad: "Diğer", yil: 5 }
];

function accAmortYil(demirbas) {
  const omur = accNum(demirbas.omur) || 5;
  const maliyet = accNum(demirbas.maliyet);
  return maliyet / omur;
}
/* Belirli bir yılın amortisman gideri (kıst amortisman basit usul) */
function accAmortYilTutar(demirbas, yil) {
  const alis = new Date(demirbas.alisTarihi || demirbas.date || "2000-01-01");
  if (alis.getFullYear() > yil) return 0;
  const omur = accNum(demirbas.omur) || 5;
  const maliyet = accNum(demirbas.maliyet);
  const yillik = maliyet / omur;
  // Alındığı yıl: kalan ay kadar (kıst)
  if (alis.getFullYear() === yil) {
    const kalanAy = 12 - alis.getMonth();
    return yillik * (kalanAy / 12);
  }
  // Ömür dolduysa dur
  const gecenYil = yil - alis.getFullYear();
  if (gecenYil >= omur) return 0;
  return yillik;
}
function accAmortToplam(demirbas) {
  const alis = new Date(demirbas.alisTarihi || demirbas.date || "2000-01-01");
  const omur = accNum(demirbas.omur) || 5;
  const maliyet = accNum(demirbas.maliyet);
  const gecenYil = new Date().getFullYear() - alis.getFullYear();
  return Math.min(maliyet, maliyet / omur * Math.min(omur, gecenYil + 1));
}
function accAmortismanYillik(yil) {
  return (state.demirbaslar || []).reduce((s, d) => s + accAmortYilTutar(d, yil), 0);
}

/* ---------------- CARİ HESAP (ALACAK TAKİBİ) ---------------- */
/* Ödenmemiş tedavi/fatura kayıtları + tahsilat geçmişi */
function accCariListe() {
  const inc = state.accounting.incomes || [];
  const map = {};
  inc.forEach(x => {
    if (x.paid !== false) return;          // ödenmişse cari dışı
    const k = (x.firm || x.description || "Diğer").trim();
    if (!map[k]) map[k] = { ad: k, toplam: 0, kayitlar: [] };
    map[k].toplam += accNum(x.amount);
    map[k].kayitlar.push(x);
  });
  return Object.values(map).sort((a, b) => b.toplam - a.toplam);
}
function accCariToplam() {
  return accCariListe().reduce((s, c) => s + c.toplam, 0);
}
function accCariGecikme(kayit) {
  const d = new Date(kayit.date || Date.now());
  return Math.max(0, Math.round((new Date() - d) / 86400000));
}

/* ---------------- MERKEZİ UYARI MOTORU ---------------- */
function accUyarilar() {
  const u = [];
  const bugun = new Date();
  const yil = bugun.getFullYear();
  const ay = bugun.getMonth() + 1;

  /* 1) Yaklaşan / geciken beyannameler (tamamlananlar ve 45+ gün geçmiş olanlar hariç) */
  accBeyannameListesi(1).forEach(b => {
    const d = accVadeDurum(b.vade, b.id);
    if (d.tamam) return;
    if (d.gun > 7 || d.gun < -45) return;
    u.push({
      seviye: (d.gecti || d.gun <= 3) ? "kritik" : "uyari",
      baslik: b.ad + " · " + b.donem,
      mesaj: d.etiket + " · Son gün: " + b.vade.toLocaleDateString("tr-TR"),
      link: b.link, linkAd: b.kurum + " →",
      beyanId: b.id
    });
  });

  /* 2) KDV ödemesi uyarısı */
  const kdvSeri = accKdvSeri(yil);
  const gecenAyKdv = ay === 1 ? null : kdvSeri[ay - 2];
  if (gecenAyKdv && gecenAyKdv.odenecek > 0) {
    u.push({
      seviye: "bilgi",
      baslik: "Bu ay ödenecek KDV: " + accTL(gecenAyKdv.odenecek),
      mesaj: gecenAyKdv.etiket + " dönemi KDV'si · Son gün: 28 " + bugun.toLocaleDateString("tr-TR", { month: "long" }),
      link: "gibDijital", linkAd: "Ödeme →"
    });
  }
  /* 3) Devreden KDV varsa bilgilendir */
  if (gecenAyKdv && gecenAyKdv.sonrakiDevir > 0) {
    u.push({
      seviye: "bilgi",
      baslik: "Devreden KDV: " + accTL(gecenAyKdv.sonrakiDevir),
      mesaj: "Bu tutar sonraki dönemlerde indirim olarak kullanılacak.",
      link: "kdv", linkAd: "Detay →"
    });
  }

  /* 4) Personel SGK primi */
  const pt = accPayrollTotal();
  if (pt.kisi > 0 && pt.toplamSgk > 0) {
    u.push({
      seviye: "uyari",
      baslik: "Aylık SGK primi: " + accTL(pt.toplamSgk),
      mesaj: pt.kisi + " personel · Son bildirim günü: 26 " + bugun.toLocaleDateString("tr-TR", { month: "long" }),
      link: "sgkEBildirge", linkAd: "e-Bildirge →"
    });
  }
  /* 5) Personel TC eksik */
  const tcEksik = (state.personnel || []).filter(p => p.aktif !== false && (!p.tcNo || p.tcNo.length !== 11));
  if (tcEksik.length) {
    u.push({
      seviye: "kritik",
      baslik: tcEksik.length + " personelin TC kimlik no'su eksik",
      mesaj: "SGK bildirgesi TC olmadan verilemez: " + tcEksik.map(p => p.name).join(", "),
      link: "personel", linkAd: "Personel →"
    });
  }

  /* 6) Vadesi geçen alacaklar */
  const cari = accCariListe();
  const gecikmis = cari.filter(c => c.kayitlar.some(k => accCariGecikme(k) > 30));
  if (gecikmis.length) {
    u.push({
      seviye: "uyari",
      baslik: gecikmis.length + " hastadan 30+ gün tahsilat yok",
      mesaj: "Toplam bekleyen: " + accTL(cari.reduce((s, c) => s + c.toplam, 0)),
      link: "cari", linkAd: "Cari Hesap →"
    });
  }

  /* 7) Geçici vergi dönemi yaklaşıyor */
  const sonrakiGecici = GECICI_VERGI_DONEM
    .map(g => ({ g, vade: new Date(yil, g.son[0], g.son[1]) }))
    .filter(x => x.vade >= bugun)
    .sort((a, b) => a.vade - b.vade)[0];
  if (sonrakiGecici) {
    const gun = Math.round((sonrakiGecici.vade - bugun) / 86400000);
    if (gun <= 30) {
      const gv = accGeciciVergi(yil, sonrakiGecici.g.d);
      u.push({
        seviye: gun <= 10 ? "kritik" : "uyari",
        baslik: sonrakiGecici.g.d + ". dönem geçici vergi: " + gun + " gün",
        mesaj: gv ? ("Tahmini ödenecek: " + accTL(gv.odenecek) + " · Matrah: " + accTL(gv.matrah)) : "Hesaplama için kayıt girin",
        link: "gv", linkAd: "Hesapla →"
      });
    }
  }

  /* 8) Amortisman girilmemiş demirbaş */
  if ((state.demirbaslar || []).length === 0) {
    u.push({
      seviye: "bilgi",
      baslik: "Demirbaş kaydı yok",
      mesaj: "Koltuk, röntgen, bilgisayar gibi alımlar amortismanla giderleşir — vergiyi düşürür.",
      link: "demirbas", linkAd: "Demirbaş →"
    });
  }

  /* 8.5) Kritik stok uyarısı */
  const kritikStok = stokKritikler();
  if (kritikStok.length) {
    u.push({
      seviye: kritikStok.some(s => accNum(s.miktar) <= 0) ? "kritik" : "uyari",
      baslik: kritikStok.length + " malzeme kritik seviyede",
      mesaj: kritikStok.slice(0, 3).map(s => s.ad + " (" + accNum(s.miktar) + " " + s.birim + ")").join(", ") + (kritikStok.length > 3 ? "…" : ""),
      link: "stok", linkAd: "Stok →"
    });
  }

  /* 9) Bu ay hiç kayıt yok */
  const buAyKayit = (state.accounting.incomes || []).filter(x => {
    const d = new Date(x.date); return d.getFullYear() === yil && d.getMonth() + 1 === ay;
  }).length;
  if (buAyKayit === 0) {
    u.push({
      seviye: "bilgi",
      baslik: "Bu ay için gelir kaydı yok",
      mesaj: "KDV beyannamesi için ay sonuna kadar kayıtları tamamlayın.",
      link: "islem", linkAd: "Gelir Ekle →"
    });
  }

  /* 10) KDV'siz gelir kaydı */
  const kdvsiz = (state.accounting.incomes || []).filter(x => {
    const d = new Date(x.date);
    return d.getFullYear() === yil && d.getMonth() + 1 === ay && !accNum(x.kdv) && accNum(x.grossAmount || x.amount) > 0;
  });
  if (kdvsiz.length) {
    u.push({
      seviye: "uyari",
      baslik: kdvsiz.length + " gelir kaydında KDV hesaplanmamış",
      mesaj: "KDV beyannamesi eksik çıkar: " + accTL(kdvsiz.reduce((s, x) => s + accNum(x.grossAmount || x.amount), 0)),
      link: "islem", linkAd: "Düzelt →"
    });
  }

  // Mükerrer uyarıları temizle
  const gorulen = new Set();
  const tekil = u.filter(x => {
    const k = x.baslik + "|" + x.mesaj;
    if (gorulen.has(k)) return false;
    gorulen.add(k);
    return true;
  });

  const sira = { kritik: 0, uyari: 1, bilgi: 2 };
  return tekil.sort((a, b) => sira[a.seviye] - sira[b.seviye]);
}

/* ---------------- RENDER: TAKVİM ---------------- */
function renderAccTakvim() {
  const tumListe = accBeyannameListesi(2);
  const gosterEski = state.accTakvimEski || false;
  const liste = gosterEski ? tumListe : tumListe.filter(b => {
    const d = accVadeDurum(b.vade, b.id);
    return d.tamam || d.gun >= -45;
  });
  const gizliSayi = tumListe.length - liste.length;
  const uyarilar = accUyarilar();
  const bugun = new Date();

  const uyarRenk = { kritik: ["#FFEBEE", "#C62828", "#EF9A9A"], uyari: ["#FFF8E1", "#E65100", "#FFD54F"], bilgi: ["#E3F2FD", "#1565C0", "#90CAF9"] };

  const uyarHtml = uyarilar.length ? uyarilar.map(u => {
    const c = uyarRenk[u.seviye] || uyarRenk.bilgi;
    return `<div class="card p3 mb2" style="background:${c[0]};border:1px solid ${c[2]};">
      <p style="font-size:12.5px;font-weight:700;margin:0 0 3px;color:${c[1]};">${escapeHtml(u.baslik)}</p>
      <p style="font-size:11px;margin:0;color:${c[1]};opacity:.85;line-height:1.45;">${escapeHtml(u.mesaj)}</p>
      ${u.link ? (u.link.startsWith("http")
        ? `<a href="${u.link}" target="_blank" rel="noopener" style="display:inline-block;margin-top:7px;font-size:11px;font-weight:700;color:${c[1]};">${escapeHtml(u.linkAd)}</a>`
        : `<button data-action="acc-tab" data-tab="${u.link}" style="margin-top:7px;background:none;border:none;padding:0;font-size:11px;font-weight:700;color:${c[1]};cursor:pointer;">${escapeHtml(u.linkAd)}</button>`) : ""}
    </div>`;
  }).join("") : `<div class="card p4" style="text-align:center;background:#E8F5E9;border:1px solid #A5D6A7;">
      <p style="font-size:13px;margin:0;color:#1B5E20;font-weight:600;">✅ Şu an acil bir uyarı yok</p>
    </div>`;

  const takvimHtml = liste.map(b => {
    const d = accVadeDurum(b.vade, b.id);
    const cokEski = d.gun < -45;
    return `<div style="display:flex;gap:10px;align-items:flex-start;padding:9px 0;border-bottom:1px solid var(--line);${d.tamam ? "opacity:.5;" : (cokEski ? "opacity:.55;" : "")}">
      <div style="flex:0 0 52px;text-align:center;background:${d.renk}15;border:1px solid ${d.renk}40;border-radius:9px;padding:5px 2px;">
        <p style="font-size:15px;font-weight:800;margin:0;color:${d.renk};line-height:1;">${b.vade.getDate()}</p>
        <p style="font-size:8.5px;margin:1px 0 0;color:${d.renk};text-transform:uppercase;">${b.vade.toLocaleDateString("tr-TR", { month: "short" })}</p>
      </div>
      <div style="flex:1;min-width:0;">
        <p style="font-size:12.5px;font-weight:700;margin:0;${d.tamam ? "text-decoration:line-through;" : ""}">${escapeHtml(b.ad)}</p>
        <p style="font-size:10.5px;color:var(--muted);margin:2px 0 0;">${escapeHtml(b.donem)} · ${escapeHtml(b.aciklama || "")}</p>
        <p style="font-size:10px;font-weight:700;margin:3px 0 0;color:${d.renk};">${d.etiket}</p>
        <div style="display:flex;gap:5px;margin-top:6px;">
          ${d.tamam
            ? `<button data-action="beyan-geri-al" data-id="${b.id}" style="background:#EEEEEE;border:none;border-radius:6px;padding:4px 8px;font-size:9.5px;color:#666;cursor:pointer;">↩️ Geri al</button>`
            : `<button data-action="beyan-tamamla" data-id="${b.id}" style="background:#E8F5E9;border:none;border-radius:6px;padding:4px 8px;font-size:9.5px;color:#2E7D32;font-weight:700;cursor:pointer;">✓ Tamamlandı</button>`}
          ${!d.tamam ? `<a href="${ACC_LINKS[b.link]}" target="_blank" rel="noopener" style="background:${d.renk};color:#fff;text-decoration:none;border-radius:6px;padding:4px 8px;font-size:9.5px;font-weight:700;">${b.kurum}</a>` : ""}
        </div>
      </div>
    </div>`;
  }).join("");

  const kritikSayisi = uyarilar.filter(x => x.seviye === "kritik").length;

  return `
    ${kritikSayisi ? `<div class="card p3 mb3" style="background:linear-gradient(135deg,#C62828,#E53935);color:#fff;border:none;">
      <p style="font-size:13px;font-weight:800;margin:0;">⚠️ ${kritikSayisi} acil uyarı var — aşağıya bakın</p>
    </div>` : ""}

    <p class="section-label">🔔 Uyarı Merkezi (${uyarilar.length})</p>
    ${uyarHtml}

    <p class="section-label" style="margin-top:16px;">📅 Beyanname ve Ödeme Takvimi</p>
    <p class="footnote" style="margin-top:-4px;">2026 takvimi · Resmî tarihler GİB/SGK tarafından duyurulur, teyit edin.</p>
    <div class="card p4 mb3">${takvimHtml}</div>

    ${gizliSayi > 0 ? `<button data-action="takvim-eski" style="width:100%;margin-bottom:12px;background:rgba(11,110,134,.08);border:1px solid var(--line);color:var(--teal);border-radius:10px;padding:10px;font-size:11.5px;font-weight:600;font-family:'Plus Jakarta Sans',sans-serif;cursor:pointer;">${gosterEski ? "− Eski dönemleri gizle" : "+ " + gizliSayi + " eski dönemi göster"}</button>` : ""}

    <p class="section-label">📌 Sürekli Hatırlatma</p>
    <div class="card p4 mb3" style="background:#F3E5F5;border:1px solid #CE93D8;">
      <p style="font-size:11px;color:#4A148C;margin:0;line-height:1.8;">
        • <b>KDV:</b> her ayın <b>28'i</b><br/>
        • <b>Muhtasar + SGK Primi:</b> her ayın <b>26'sı</b><br/>
        • <b>Geçici vergi:</b> 17 Mayıs · 17 Ağustos · 17 Kasım<br/>
        • <b>Yıllık gelir vergisi:</b> 31 Mart (1. taksit) · 31 Temmuz (2. taksit)<br/>
        • <b>Bağ-Kur (4/b):</b> her ayın sonuna kadar
      </p>
    </div>
  `;
}

/* ---------------- RENDER: KDV BEYANNAMESİ ---------------- */
function renderAccKdv() {
  const yil = state.kdvYil || new Date().getFullYear();
  const seri = accKdvSeri(yil);
  const secili = state.kdvAy || (new Date().getMonth() + 1);
  const d = seri[secili - 1];

  const ayChip = seri.map(x => {
    const aktif = x.ay === secili;
    const varKayit = x.islemSayisi > 0;
    return `<button data-action="kdv-ay" data-ay="${x.ay}" style="flex:0 0 auto;min-width:44px;padding:7px 6px;border-radius:9px;font-size:11px;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif;border:1px solid ${aktif ? "var(--teal)" : "var(--line)"};background:${aktif ? "var(--teal)" : (varKayit ? "#E8F5E9" : "rgba(255,255,255,.7)")};color:${aktif ? "#fff" : "var(--ink)"};cursor:pointer;">${x.ay}</button>`;
  }).join("");

  const yilChip = [yil - 1, yil, yil + 1].map(y =>
    `<button data-action="kdv-yil" data-yil="${y}" style="flex:1;padding:7px;border-radius:9px;font-size:11.5px;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif;border:1px solid ${y === yil ? "var(--teal)" : "var(--line)"};background:${y === yil ? "var(--teal)" : "rgba(255,255,255,.7)"};color:${y === yil ? "#fff" : "var(--ink)"};cursor:pointer;">${y}</button>`).join("");

  const detay = d ? `
    <div class="card p4 mb3" style="background:linear-gradient(135deg,#1A237E,#283593);color:#fff;border:none;">
      <p style="font-size:13px;font-weight:700;margin:0 0 2px;">${d.etiket} ${yil} KDV Beyannamesi</p>
      <p style="font-size:10.5px;opacity:.8;margin:0 0 10px;">${d.islemSayisi} gelir kaydı · ${accTL(d.brutGelir)} brüt</p>
      <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:10px;">
        <p style="font-size:9.5px;margin:0;opacity:.85;">ÖDENECEK KDV</p>
        <p style="font-size:22px;font-weight:800;margin:2px 0 0;">${accTL(d.odenecek)}</p>
      </div>
    </div>

    <div class="card p4 mb3">
      <p style="font-size:13px;font-weight:700;margin:0 0 10px;">📄 KDV-1 Beyanname Tablosu</p>
      <table style="width:100%;font-size:11.5px;border-collapse:collapse;">
        <tr style="border-bottom:1px solid var(--line);"><td style="padding:5px 0;">Brüt Gelir (matrah)</td><td style="text-align:right;font-weight:600;">${accTL(d.brutGelir)}</td></tr>
        <tr style="border-bottom:1px solid var(--line);"><td style="padding:5px 0;">Hesaplanan KDV</td><td style="text-align:right;color:#E65100;font-weight:600;">${accTL(d.hesaplanan)}</td></tr>
        <tr style="border-bottom:1px solid var(--line);"><td style="padding:5px 0;">İndirilecek KDV (giderler)</td><td style="text-align:right;color:#2E7D32;font-weight:600;">-${accTL(d.indirilecek)}</td></tr>
        <tr style="border-bottom:1px solid var(--line);"><td style="padding:5px 0;">Önceki dönemden devreden</td><td style="text-align:right;color:#1565C0;font-weight:600;">-${accTL(d.oncekiDevir)}</td></tr>
        <tr style="background:#FFF3E0;"><td style="padding:6px 0;font-weight:800;">ÖDENECEK KDV</td><td style="text-align:right;font-weight:800;color:#E65100;">${accTL(d.odenecek)}</td></tr>
        <tr><td style="padding:5px 0;font-weight:600;">Sonraki döneme devreden</td><td style="text-align:right;font-weight:700;color:#1565C0;">${accTL(d.sonrakiDevir)}</td></tr>
      </table>
    </div>

    <div class="card p4 mb3" style="background:#FFF8E1;border:1px solid #FFD54F;">
      <p style="font-size:11.5px;font-weight:700;color:#E65100;margin:0 0 6px;">📅 Bu dönemin son günü</p>
      <p style="font-size:11px;color:#8D6E00;margin:0;">${d.ay === 12 ? "31 Aralık" : ""}${new Date(yil, d.ay, 28).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })} — beyan ve ödeme</p>
      ${d.odenecek > 0 ? `<a href="${ACC_LINKS.gibDijital}" target="_blank" rel="noopener" class="btn-primary" style="margin-top:10px;text-decoration:none;background:#2E7D32;font-size:12px;padding:11px;">💳 Dijital Vergi Dairesi'nde Öde</a>` : `<p style="font-size:11px;color:#2E7D32;font-weight:700;margin:8px 0 0;">✅ Bu dönem ödenecek KDV yok</p>`}
    </div>` : "";

  const ozetSatir = seri.filter(x => x.islemSayisi > 0 || x.odenecek > 0).map(x => `
    <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--line);font-size:11px;">
      <span>${x.etiket}</span>
      <span style="font-weight:700;color:${x.odenecek > 0 ? "#C62828" : "#2E7D32"};">${x.odenecek > 0 ? accTL0(x.odenecek) : "—"}</span>
    </div>`).join("") || `<p class="footnote">Bu yıl kayıt yok.</p>`;

  return `
    <div style="display:flex;gap:6px;margin-bottom:10px;">${yilChip}</div>
    <div style="display:flex;gap:5px;overflow-x:auto;padding-bottom:6px;margin-bottom:12px;">${ayChip}</div>
    ${detay}
    <div class="card p4 mb3">
      <p style="font-size:13px;font-weight:700;margin:0 0 10px;">📊 ${yil} Yılı KDV Özeti</p>
      ${ozetSatir}
    </div>
  `;
}

/* ---------------- RENDER: GELİR VERGİSİ (Geçici + Yıllık) ---------------- */
function renderAccGv() {
  const yil = new Date().getFullYear();
  const seciliDonem = state.gvDonem || 1;
  const g = accGeciciVergi(yil, seciliDonem);
  const yillik = accYillikGelirVergisi(yil);

  const donemChip = GECICI_VERGI_DONEM.map(x => {
    const aktif = x.d === seciliDonem;
    return `<button data-action="gv-donem" data-donem="${x.d}" style="flex:1;padding:8px 5px;border-radius:10px;font-size:11px;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif;border:1px solid ${aktif ? "#1565C0" : "var(--line)"};background:${aktif ? "#1565C0" : "rgba(255,255,255,.7)"};color:${aktif ? "#fff" : "var(--ink)"};cursor:pointer;">${x.d}. Dönem<br/><span style="font-size:8.5px;font-weight:500;">${x.aylar}</span></button>`;
  }).join("");

  const dilimHtml = GV_2026_TICARI.map((d, i) => {
    const alt = i === 0 ? 0 : GV_2026_TICARI[i - 1].ust;
    const ust = d.ust == null ? "üzeri" : d.ust.toLocaleString("tr-TR");
    const aktif = g && g.matrah > alt;
    return `<div style="display:flex;justify-content:space-between;font-size:10.5px;padding:4px 0;${aktif ? "font-weight:700;color:#1565C0;" : "color:#999;"}">
      <span>${alt.toLocaleString("tr-TR")} – ${ust}</span><span>%${(d.oran * 100).toFixed(0)}</span>
    </div>`;
  }).join("");

  return `
    <div class="card p4 mb3" style="background:linear-gradient(135deg,#0D47A1,#1565C0);color:#fff;border:none;">
      <p style="font-size:13px;font-weight:700;margin:0 0 2px;">🧮 ${yil} Geçici Vergi</p>
      <p style="font-size:10.5px;opacity:.85;margin:0 0 10px;">Kümülatif kâr üzerinden · ${g ? g.kapsam : ""}</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:8px;">
          <p style="font-size:9px;margin:0;opacity:.85;">ÖDENECEK</p>
          <p style="font-size:16px;font-weight:800;margin:2px 0 0;">${accTL0(g ? g.odenecek : 0)}</p>
        </div>
        <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:8px;">
          <p style="font-size:9px;margin:0;opacity:.85;">MATRAH</p>
          <p style="font-size:16px;font-weight:800;margin:2px 0 0;">${accTL0(g ? g.matrah : 0)}</p>
        </div>
      </div>
    </div>

    <div style="display:flex;gap:6px;margin-bottom:10px;">${donemChip}</div>

    ${g ? `<div class="card p4 mb3">
      <p style="font-size:13px;font-weight:700;margin:0 0 10px;">📄 ${g.donem}. Dönem Hesabı (${g.kapsam})</p>
      <table style="width:100%;font-size:11.5px;border-collapse:collapse;">
        <tr style="border-bottom:1px solid var(--line);"><td style="padding:5px 0;">Kümülatif gelir</td><td style="text-align:right;font-weight:600;">${accTL(g.gelir)}</td></tr>
        <tr style="border-bottom:1px solid var(--line);"><td style="padding:5px 0;">Kümülatif gider</td><td style="text-align:right;color:#C62828;font-weight:600;">-${accTL(g.gider)}</td></tr>
        <tr style="border-bottom:1px solid var(--line);"><td style="padding:5px 0;font-weight:600;">Ticari kâr / matrah</td><td style="text-align:right;font-weight:700;color:${g.matrah > 0 ? "#2E7D32" : "#C62828"};">${accTL(g.matrah)}</td></tr>
        <tr style="border-bottom:1px solid var(--line);"><td style="padding:5px 0;">Kümülatif vergi</td><td style="text-align:right;font-weight:600;">${accTL(g.kumulatifVergi)}</td></tr>
        <tr style="border-bottom:1px solid var(--line);"><td style="padding:5px 0;">Önceki dönemlerde ödenen</td><td style="text-align:right;color:#1565C0;font-weight:600;">-${accTL(g.oncekiVergi)}</td></tr>
        <tr style="background:#E3F2FD;"><td style="padding:6px 0;font-weight:800;">BU DÖNEM ÖDENECEK</td><td style="text-align:right;font-weight:800;color:#0D47A1;">${accTL(g.odenecek)}</td></tr>
      </table>
      <p style="font-size:10px;color:var(--muted);margin:8px 0 0;">Son gün: ${g.sonTarih.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })} · Efektif oran: %${g.efektifOran.toFixed(1)}</p>
      <a href="${ACC_LINKS.gibEBeyanname}" target="_blank" rel="noopener" class="btn-primary" style="margin-top:10px;text-decoration:none;background:#1565C0;font-size:12px;padding:11px;">📄 e-Beyanname'de Ver</a>
    </div>` : ""}

    <div class="card p4 mb3">
      <p style="font-size:13px;font-weight:700;margin:0 0 8px;">📊 2026 Vergi Dilimleri (ticari kazanç)</p>
      ${dilimHtml}
      <p style="font-size:9.5px;color:#888;margin:8px 0 0;">GVK m.103 · 332 Seri No'lu GVK Genel Tebliği</p>
    </div>

    <div class="card p4 mb3" style="background:linear-gradient(135deg,#4527A0,#5E35B1);color:#fff;border:none;">
      <p style="font-size:13px;font-weight:700;margin:0 0 2px;">📋 ${yil} Yıllık Gelir Vergisi (tahmini)</p>
      <p style="font-size:10.5px;opacity:.85;margin:0 0 10px;">Yıl sonu projeksiyonu · Amortisman dahil</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:8px;">
          <p style="font-size:9px;margin:0;opacity:.85;">YILLIK VERGİ</p>
          <p style="font-size:15px;font-weight:800;margin:2px 0 0;">${accTL0(yillik.vergi)}</p>
        </div>
        <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:8px;">
          <p style="font-size:9px;margin:0;opacity:.85;">GEÇİCİ MAHSUP</p>
          <p style="font-size:15px;font-weight:800;margin:2px 0 0;">${accTL0(yillik.geciciToplam)}</p>
        </div>
      </div>
    </div>

    <div class="card p4 mb3">
      <p style="font-size:13px;font-weight:700;margin:0 0 10px;">📄 Yıllık Beyan Özeti</p>
      <table style="width:100%;font-size:11.5px;border-collapse:collapse;">
        <tr style="border-bottom:1px solid var(--line);"><td style="padding:5px 0;">Yıllık gelir</td><td style="text-align:right;font-weight:600;">${accTL(yillik.gelir)}</td></tr>
        <tr style="border-bottom:1px solid var(--line);"><td style="padding:5px 0;">İşletme giderleri</td><td style="text-align:right;color:#C62828;">-${accTL(yillik.gider)}</td></tr>
        <tr style="border-bottom:1px solid var(--line);"><td style="padding:5px 0;">Amortisman gideri</td><td style="text-align:right;color:#C62828;">-${accTL(yillik.amortisman)}</td></tr>
        <tr style="border-bottom:1px solid var(--line);"><td style="padding:5px 0;font-weight:600;">Vergi matrahı</td><td style="text-align:right;font-weight:700;">${accTL(yillik.matrah)}</td></tr>
        <tr style="border-bottom:1px solid var(--line);"><td style="padding:5px 0;">Hesaplanan gelir vergisi</td><td style="text-align:right;font-weight:700;color:#E65100;">${accTL(yillik.vergi)}</td></tr>
        <tr style="border-bottom:1px solid var(--line);"><td style="padding:5px 0;">Ödenen geçici vergiler</td><td style="text-align:right;color:#1565C0;">-${accTL(yillik.geciciToplam)}</td></tr>
        <tr style="background:#EDE7F6;"><td style="padding:6px 0;font-weight:800;">KALAN VERGİ</td><td style="text-align:right;font-weight:800;color:#4527A0;">${accTL(yillik.kalan)}</td></tr>
        <tr><td style="padding:5px 0;font-size:10.5px;">1. taksit (Mart sonu)</td><td style="text-align:right;font-size:10.5px;">${accTL(yillik.taksit1)}</td></tr>
        <tr><td style="padding:5px 0;font-size:10.5px;">2. taksit (Temmuz sonu)</td><td style="text-align:right;font-size:10.5px;">${accTL(yillik.taksit2)}</td></tr>
      </table>
      <p style="font-size:9.5px;color:#888;margin:8px 0 0;">Bu bir projeksiyondur — kesin hesap yıl sonunda yapılır.</p>
    </div>
  `;
}

/* ---------------- RENDER: DEMİRBAŞ / AMORTİSMAN ---------------- */
function renderAccDemirbas() {
  const liste = state.demirbaslar || [];
  const yil = new Date().getFullYear();
  const toplamMaliyet = liste.reduce((s, d) => s + accNum(d.maliyet), 0);
  const buYilAmort = accAmortismanYillik(yil);
  const toplamAmort = liste.reduce((s, d) => s + accAmortToplam(d), 0);

  const ed = state.demirbasEdit;
  let formHtml = "";
  if (ed !== null && ed !== undefined) {
    const d = liste.find(x => x.id === ed) || { id: "", ad: "", maliyet: "", alisTarihi: accToday(), omur: 10, kategori: "Tıbbi cihaz (büyük / röntgen)" };
    formHtml = `<div class="card p4 mb3" style="border:2px solid #00695C;background:#E0F2F1;">
      <p style="font-size:13px;font-weight:700;margin:0 0 10px;color:#00695C;">${d.id ? "✏️ Demirbaşı Düzenle" : "➕ Yeni Demirbaş"}</p>
      <div class="field"><label>Demirbaş adı</label><input class="input" id="db-ad" value="${escapeAttr(d.ad || "")}" placeholder="Örn: Dental ünite, Panoramik röntgen" /></div>
      <div class="field"><label>Kategori (faydalı ömür)</label>
        <select class="input" id="db-kategori">
          ${AMORT_OMURLER.map(o => `<option value="${o.ad}|${o.yil}" ${d.kategori === o.ad ? "selected" : ""}>${o.ad} — ${o.yil} yıl</option>`).join("")}
        </select>
      </div>
      <div class="field"><label>Alış bedeli (₺)</label><input class="input" type="number" id="db-maliyet" value="${accNum(d.maliyet)}" /></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div class="field"><label>Alış tarihi</label><input class="input" type="date" id="db-tarih" value="${escapeAttr(d.alisTarihi || "")}" /></div>
        <div class="field"><label>Faydalı ömür (yıl)</label><input class="input" type="number" id="db-omur" value="${accNum(d.omur) || 10}" /></div>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn-primary" style="background:#00695C;" data-action="demirbas-save" data-id="${d.id || ""}">💾 Kaydet</button>
        <button class="btn-primary" style="background:#757575;" data-action="demirbas-cancel">İptal</button>
      </div>
    </div>`;
  }

  const satirlar = liste.map(d => {
    const yillik = accAmortYilTutar(d, yil);
    const birikmis = accAmortToplam(d);
    const kalan = Math.max(0, accNum(d.maliyet) - birikmis);
    const omurDoldu = kalan <= 0.01;
    return `<div class="card p3 mb2" style="opacity:${omurDoldu ? 0.55 : 1};">
      <div style="display:flex;justify-content:space-between;gap:8px;">
        <div style="flex:1;min-width:0;">
          <p style="font-size:12.5px;font-weight:700;margin:0;">${escapeHtml(d.ad)} ${omurDoldu ? "· (amortisman tamamlandı)" : ""}</p>
          <p style="font-size:10px;color:var(--muted);margin:2px 0 0;">${escapeHtml(d.kategori || "")} · Alış: ${escapeHtml(d.alisTarihi || "")} · ${accNum(d.omur)} yıl</p>
          <p style="font-size:10.5px;color:#00695C;margin:3px 0 0;font-weight:600;">Yıllık amortisman: ${accTL(yillik)}</p>
          <p style="font-size:9.5px;color:#888;margin:1px 0 0;">Maliyet ${accTL(accNum(d.maliyet))} · Birikmiş ${accTL(birikmis)} · Kalan ${accTL(kalan)}</p>
        </div>
        <div style="display:flex;flex-direction:column;gap:4px;">
          <button data-action="demirbas-edit" data-id="${d.id}" style="background:#E0F2F1;border:none;border-radius:6px;padding:5px 8px;cursor:pointer;font-size:11px;">✏️</button>
          <button data-action="demirbas-delete" data-id="${d.id}" style="background:#FFEBEE;border:none;border-radius:6px;padding:5px 8px;cursor:pointer;font-size:11px;color:#C62828;">🗑️</button>
        </div>
      </div>
    </div>`;
  }).join("") || `<p class="footnote">Henüz demirbaş eklenmedi.</p>`;

  return `
    <div class="card p4 mb3" style="background:linear-gradient(135deg,#004D40,#00695C);color:#fff;border:none;">
      <p style="font-size:13px;font-weight:700;margin:0 0 2px;">🏗️ Amortisman Takibi</p>
      <p style="font-size:10.5px;opacity:.85;margin:0 0 10px;">${liste.length} demirbaş · VUK 333</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:8px;">
          <p style="font-size:9px;margin:0;opacity:.85;">${yil} AMORTİSMAN</p>
          <p style="font-size:15px;font-weight:800;margin:2px 0 0;">${accTL0(buYilAmort)}</p>
        </div>
        <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:8px;">
          <p style="font-size:9px;margin:0;opacity:.85;">TOPLAM MALİYET</p>
          <p style="font-size:15px;font-weight:800;margin:2px 0 0;">${accTL0(toplamMaliyet)}</p>
        </div>
      </div>
      <p style="font-size:10px;margin:8px 0 0;opacity:.8;">Bu yılın amortismanı, gelir vergisi hesabında otomatik gider olarak düşülür.</p>
    </div>

    ${formHtml}
    ${ed === null || ed === undefined ? `<button class="btn-primary mb3" style="background:#00695C;" data-action="demirbas-new">➕ Demirbaş Ekle</button>` : ""}

    <p class="section-label">Demirbaş Listesi (${liste.length})</p>
    ${satirlar}

    <div class="card p4 mb3" style="background:#F1F8E9;border:1px solid #AED581;">
      <p style="font-size:11.5px;font-weight:700;color:#33691E;margin:0 0 6px;">💡 Neden önemli?</p>
      <p style="font-size:10.5px;color:#558B2F;margin:0;line-height:1.6;">
        Koltuk, röntgen, bilgisayar gibi alımlar tek seferde gider yazılmaz — faydalı ömre bölünerek giderleşir.
        Bu da her yıl <b>vergi matrahını düşürür</b>. Kaydetmezsen fazla vergi ödersin.
      </p>
    </div>
  `;
}

/* ---------------- RENDER: CARİ HESAP (ALACAK) ---------------- */
function renderAccCari() {
  const cari = accCariListe();
  const toplam = accCariToplam();
  const gecikmis30 = cari.filter(c => c.kayitlar.some(k => accCariGecikme(k) > 30));

  // Ödenmemiş tüm kayıtlar, gecikmeye göre sıralı
  const bekleyen = [];
  (state.accounting.incomes || []).forEach(x => {
    if (x.paid === false) bekleyen.push(x);
  });
  bekleyen.sort((a, b) => accCariGecikme(b) - accCariGecikme(a));

  const kartlar = cari.map(c => `
    <div class="card p3 mb2">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
        <div style="flex:1;min-width:0;">
          <p style="font-size:12.5px;font-weight:700;margin:0;">${escapeHtml(c.ad)}</p>
          <p style="font-size:10px;color:var(--muted);margin:2px 0 0;">${c.kayitlar.length} açık kayıt</p>
        </div>
        <p style="font-size:13px;font-weight:800;color:#C62828;margin:0;">${accTL0(c.toplam)}</p>
      </div>
    </div>`).join("") || `<p class="footnote">Ödenmemiş kayıt yok — her şey tahsil edilmiş. 👍</p>`;

  const bekleyenSatir = bekleyen.slice(0, 20).map(x => {
    const gun = accCariGecikme(x);
    const renk = gun > 60 ? "#C62828" : gun > 30 ? "#E65100" : "#2E7D32";
    return `<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--line);">
      <div style="flex:1;min-width:0;">
        <p style="font-size:12px;font-weight:600;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(x.description || "")}</p>
        <p style="font-size:10px;color:var(--muted);margin:2px 0 0;">${escapeHtml(x.date || "")} · ${gun} gün önce</p>
      </div>
      <div style="display:flex;align-items:center;gap:6px;">
        <p style="font-size:12px;font-weight:700;color:${renk};margin:0;">${accTL0(x.amount)}</p>
        <button data-action="cari-ode" data-id="${x.id}" style="background:#E8F5E9;border:none;border-radius:6px;padding:5px 8px;cursor:pointer;font-size:10px;color:#2E7D32;font-weight:700;">✓ Ödendi</button>
      </div>
    </div>`;
  }).join("") || `<p class="footnote">Bekleyen tahsilat yok.</p>`;

  return `
    <div class="card p4 mb3" style="background:linear-gradient(135deg,#B71C1C,#C62828);color:#fff;border:none;">
      <p style="font-size:13px;font-weight:700;margin:0 0 2px;">💳 Tahsil Edilmeyen Alacak</p>
      <p style="font-size:10.5px;opacity:.85;margin:0 0 10px;">${cari.length} hasta/firma · ${bekleyen.length} açık kayıt</p>
      <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:10px;">
        <p style="font-size:9.5px;margin:0;opacity:.85;">TOPLAM BEKLEYEN</p>
        <p style="font-size:22px;font-weight:800;margin:2px 0 0;">${accTL(toplam)}</p>
      </div>
      ${gecikmis30.length ? `<p style="font-size:10px;margin:8px 0 0;opacity:.9;">⚠️ ${gecikmis30.length} hastada 30 günü aşan gecikme var</p>` : ""}
    </div>

    <div class="card p4 mb3">
      <p style="font-size:13px;font-weight:700;margin:0 0 6px;">ℹ️ Nasıl kullanılır?</p>
      <p style="font-size:10.5px;color:var(--muted);margin:0;line-height:1.6;">
        Gelir kaydederken <b>"Veresiye / ödenmedi"</b> seçeneğini işaretlersen kayıt burada birikir.
        Hasta ödeme yapınca <b>✓ Ödendi</b> butonuna bas — muhasebeye de yansır.
      </p>
    </div>

    <p class="section-label">👤 Hasta / Firma Bazlı Bakiye</p>
    ${kartlar}

    <p class="section-label" style="margin-top:14px;">⏳ Bekleyen Tahsilatlar (${bekleyen.length})</p>
    <div class="card p4 mb3">${bekleyenSatir}</div>
  `;
}

/* =========================================================
   NUR DİŞ — TAM MALİ MÜŞAVİR PAKETİ v4
   Bordro · e-Fatura (UBL-TR) · Banka Mutabakatı
   Yevmiye Defteri · Mizan · Gelir Tablosu · Bilanço
   Yıllık Mali Rapor · Tahsilat Makbuzu
========================================================= */

/* ---------------- ORTAK YARDIMCILAR ---------------- */

function accTarihTR(d) {
  const t = d ? new Date(d) : new Date();
  return t.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });
}
function accTarihUzun(d) {
  const t = d ? new Date(d) : new Date();
  return t.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}
/* Yıl-ay anahtarı: 2026-10 */
function accKey(d) {
  const t = d ? new Date(d) : new Date();
  return t.getFullYear() + "-" + String(t.getMonth() + 1).padStart(2, "0");
}
function accAyAdi(yil, ay) { // ay 1-12
  return new Date(yil, ay - 1, 1).toLocaleDateString("tr-TR", { month: "long", year: "numeric" });
}

/* =========================================================
   1) BORDRO (Maaş Pusulası)
========================================================= */

function accBordro(p, donemYil, donemAy) {
  const c = accPayroll(p);
  const s = sgkSet();
  return {
    personel: p,
    donem: accAyAdi(donemYil, donemAy),
    donemKey: donemYil + "-" + String(donemAy).padStart(2, "0"),
    gun: c.gun,
    brutUcret: c.brut,
    pek: c.pek,
    isciSgk: c.isciSgk,
    isciIssiz: c.isciIssiz,
    gvMatrah: c.gvMatrah,
    gelirVergisi: c.gelirVergisi,
    damga: c.damga,
    kesintiToplam: c.isciSgk + c.isciIssiz + c.gelirVergisi + c.damga,
    netUcret: c.net,
    isverenSgk: c.isverenSgk,
    isverenIssiz: c.isverenIssiz,
    isvereneMaliyet: c.isvereneMaliyet,
    toplamSgk: c.toplamSgk,
    asgariUcret: s.minWage
  };
}

function accBordroTumu(donemYil, donemAy) {
  return (state.personnel || []).filter(p => p.aktif !== false)
    .map(p => accBordro(p, donemYil, donemAy));
}

/* A4 bordro HTML */
function accBordroHTML(b) {
  const p = b.personel;
  return `<div style="border:1px solid #ccc;border-radius:6px;padding:16px;margin-bottom:14px;page-break-inside:avoid;">
    <div style="display:flex;justify-content:space-between;border-bottom:2px solid #0B6E86;padding-bottom:8px;margin-bottom:10px;">
      <div>
        <div style="font-size:15px;font-weight:800;color:#0B6E86;">NUR DİŞ &amp; DENTAL KLİNİK</div>
        <div style="font-size:10px;color:#666;">ÜCRET BORDROSU / MAAŞ PUSULASI</div>
      </div>
      <div style="text-align:right;font-size:11px;">
        <div><b>Dönem:</b> ${b.donem}</div>
        <div style="color:#888;">Düzenleme: ${accTarihTR()}</div>
      </div>
    </div>

    <table style="width:100%;font-size:11px;margin-bottom:10px;">
      <tr>
        <td style="padding:3px 0;"><b>Ad Soyad:</b> ${escapeHtml(p.name || "-")}</td>
        <td style="padding:3px 0;"><b>TC Kimlik:</b> ${escapeHtml(p.tcNo || "-")}</td>
      </tr>
      <tr>
        <td style="padding:3px 0;"><b>Görev:</b> ${escapeHtml(p.position || "-")}</td>
        <td style="padding:3px 0;"><b>Çalışılan Gün:</b> ${b.gun}</td>
      </tr>
    </table>

    <table style="width:100%;font-size:11px;border-collapse:collapse;">
      <tr style="background:#f0f6f8;">
        <th style="text-align:left;padding:5px;border:1px solid #ddd;">KAZANÇLAR</th>
        <th style="text-align:right;padding:5px;border:1px solid #ddd;">TUTAR</th>
        <th style="text-align:left;padding:5px;border:1px solid #ddd;">KESİNTİLER</th>
        <th style="text-align:right;padding:5px;border:1px solid #ddd;">TUTAR</th>
      </tr>
      <tr>
        <td style="padding:5px;border:1px solid #ddd;">Brüt Ücret</td>
        <td style="padding:5px;border:1px solid #ddd;text-align:right;">${accTL(b.brutUcret)}</td>
        <td style="padding:5px;border:1px solid #ddd;">SGK İşçi Payı (%14)</td>
        <td style="padding:5px;border:1px solid #ddd;text-align:right;">${accTL(b.isciSgk)}</td>
      </tr>
      <tr>
        <td style="padding:5px;border:1px solid #ddd;color:#888;font-size:10px;">Prime Esas Kazanç</td>
        <td style="padding:5px;border:1px solid #ddd;text-align:right;color:#888;font-size:10px;">${accTL(b.pek)}</td>
        <td style="padding:5px;border:1px solid #ddd;">İşsizlik İşçi (%1)</td>
        <td style="padding:5px;border:1px solid #ddd;text-align:right;">${accTL(b.isciIssiz)}</td>
      </tr>
      <tr>
        <td style="padding:5px;border:1px solid #ddd;"></td><td style="padding:5px;border:1px solid #ddd;"></td>
        <td style="padding:5px;border:1px solid #ddd;">Gelir Vergisi</td>
        <td style="padding:5px;border:1px solid #ddd;text-align:right;">${accTL(b.gelirVergisi)}</td>
      </tr>
      <tr>
        <td style="padding:5px;border:1px solid #ddd;"></td><td style="padding:5px;border:1px solid #ddd;"></td>
        <td style="padding:5px;border:1px solid #ddd;">Damga Vergisi (‰7,59)</td>
        <td style="padding:5px;border:1px solid #ddd;text-align:right;">${accTL(b.damga)}</td>
      </tr>
      <tr style="background:#fff3e0;">
        <td style="padding:6px;border:1px solid #ddd;font-weight:700;">TOPLAM</td>
        <td style="padding:6px;border:1px solid #ddd;text-align:right;font-weight:700;">${accTL(b.brutUcret)}</td>
        <td style="padding:6px;border:1px solid #ddd;font-weight:700;">KESİNTİ TOPLAMI</td>
        <td style="padding:6px;border:1px solid #ddd;text-align:right;font-weight:700;">${accTL(b.kesintiToplam)}</td>
      </tr>
    </table>

    <div style="background:#0B6E86;color:#fff;padding:9px;border-radius:5px;margin-top:8px;display:flex;justify-content:space-between;font-size:13px;font-weight:800;">
      <span>NET ÖDENECEK ÜCRET</span><span>${accTL(b.netUcret)}</span>
    </div>

    <table style="width:100%;font-size:10px;margin-top:8px;color:#666;">
      <tr>
        <td>İşveren SGK (%${(sgkSet().isverenSgk - (p.tesvikli ? sgkSet().tesvikPuan : 0)).toFixed(2)}): ${accTL(b.isverenSgk)}</td>
        <td>İşveren İşsizlik (%2): ${accTL(b.isverenIssiz)}</td>
        <td style="text-align:right;"><b>İşverene Maliyet: ${accTL(b.isvereneMaliyet)}</b></td>
      </tr>
    </table>

    <div style="display:flex;justify-content:space-between;margin-top:18px;font-size:10px;">
      <div style="text-align:center;width:45%;">
        <div style="border-top:1px solid #999;padding-top:4px;">İşveren / Kaşe-İmza</div>
      </div>
      <div style="text-align:center;width:45%;">
        <div style="border-top:1px solid #999;padding-top:4px;">Personel İmzası<br/><span style="color:#aaa;">${escapeHtml(p.name || "")}</span></div>
      </div>
    </div>
  </div>`;
}

/* =========================================================
   NUR DİŞ — STOK VE MALZEME TAKİBİ v5
   • Gider kaydından otomatik stoğa aktarma
   • Giriş / çıkış / sayım hareketleri
   • Kritik seviye uyarısı, stok değeri, tedarikçi takibi
========================================================= */

const STOK_BIRIMLER = ["Adet", "Kutu", "Paket", "Şişe", "Tüp", "Kg", "Litre", "Metre", "Rulo", "Takım"];

const STOK_KATEGORI = [
  "Sarf Malzeme", "Anestezi / İlaç", "Ölçü Malzemesi", "Kanal Tedavisi",
  "İmplant Malzemesi", "Protez / Kaide", "Beyazlatma", "Dezenfeksiyon",
  "Eldiven / Maske", "Röntgen Filmi", "Kırtasiye", "Temizlik", "Diğer"
];

/* ---------------- YARDIMCILAR ---------------- */

function stokBul(id) {
  return (state.stok || []).find(x => x.id === id);
}

function stokDeger(x) {
  return accNum(x.miktar) * accNum(x.birimFiyat);
}

function stokToplamDeger() {
  return (state.stok || []).reduce((s, x) => s + stokDeger(x), 0);
}

/* Kritik seviyede veya altında olanlar */
function stokKritikler() {
  return (state.stok || []).filter(x => accNum(x.miktar) <= accNum(x.minSeviye) && accNum(x.minSeviye) > 0);
}

/* Son hareket tarihi */
function stokSonHareket(stokId) {
  const h = (state.stokHareket || []).filter(x => x.stokId === stokId)
    .sort((a, b) => new Date(b.tarih) - new Date(a.tarih));
  return h[0] || null;
}

/* Hareket ekle (giriş +, çıkış −) */
function stokHareketEkle(stokId, tip, miktar, aciklama, birimFiyat, ekstra) {
  if (!state.stokHareket) state.stokHareket = [];
  const s = stokBul(stokId);
  if (!s) return null;

  const m = accNum(miktar);
  if (m <= 0) return null;

  if (tip === "giris") {
    s.miktar = accNum(s.miktar) + m;
    // Ağırlıklı ortalama maliyet
    if (accNum(birimFiyat) > 0) {
      const eskiDeger = accNum(s.miktar) - m > 0 ? (accNum(s.miktar) - m) * accNum(s.birimFiyat) : 0;
      s.birimFiyat = (eskiDeger + m * accNum(birimFiyat)) / accNum(s.miktar);
    }
    s.sonAlim = accToday();
  } else if (tip === "cikis") {
    s.miktar = Math.max(0, accNum(s.miktar) - m);
    s.sonKullanim = accToday();
  } else if (tip === "sayim") {
    s.miktar = m;
  }

  const hareket = {
    id: "sth_" + Date.now() + "_" + Math.random().toString(36).slice(2, 5),
    stokId, tip, miktar: m,
    birimFiyat: accNum(birimFiyat) || accNum(s.birimFiyat),
    tarih: accToday(),
    aciklama: aciklama || (tip === "giris" ? "Stok girişi" : tip === "cikis" ? "Stok kullanımı" : "Sayım düzeltmesi"),
    kalan: accNum(s.miktar),
    ...(ekstra || {})
  };
  state.stokHareket.unshift(hareket);
  return hareket;
}

/* Stok adından otomatik bul veya oluştur (gider→stok köprüsü için) */
function stokBulVeyaOlustur(ad, kategori, birim) {
  if (!state.stok) state.stok = [];
  const normalize = s => (s || "").toLowerCase().trim();
  let s = state.stok.find(x => normalize(x.ad) === normalize(ad));
  if (s) return s;

  s = {
    id: "stk_" + Date.now() + "_" + Math.random().toString(36).slice(2, 5),
    ad: ad,
    kategori: kategori || "Sarf Malzeme",
    birim: birim || "Adet",
    miktar: 0,
    minSeviye: 0,
    birimFiyat: 0,
    tedarikci: "",
    notlar: "",
    olusturma: accToday()
  };
  state.stok.push(s);
  return s;
}

function stokKaydet() {
  localStorage.setItem("nurdis_stok", JSON.stringify(state.stok || []));
  localStorage.setItem("nurdis_stok_hareket", JSON.stringify((state.stokHareket || []).slice(0, 800)));
  if (typeof saveAccountingToFirebase === "function") saveAccountingToFirebase();
}

/* =========================================================
   RENDER: STOK SEKMESİ
========================================================= */

/* =========================================================
   NUR DİŞ — ANALİZ PAKETİ v6
   1) Hasta Bazlı Kârlılık
   2) Nakit Akış Projeksiyonu
   3) Malzeme Maliyeti (tedavi başına)
========================================================= */

/* ---------------- ORTAK: TEDAVİLER ---------------- */

const TEDAVI_LISTESI = [
  "Muayene", "Dolgu", "Kanal Tedavisi", "İmplant", "Zirkonyum Kaplama",
  "Diş Beyazlatma", "Ortodonti", "Protez", "Diş Taşı Temizliği",
  "Diş Çekimi", "Köprü", "Lamine Veneer", "Şeffaf Plak", "Cerrahi Çekim"
];

function accTumFiyatlar() {
  const def = {
    "Muayene": 0, "Dolgu": 2000, "Kanal Tedavisi": 4000, "İmplant": 15000,
    "Zirkonyum Kaplama": 5000, "Diş Beyazlatma": 3000, "Ortodonti": 25000,
    "Protez": 12000, "Diş Taşı Temizliği": 1000, "Diş Çekimi": 1500,
    "Köprü": 8000, "Lamine Veneer": 6000, "Şeffaf Plak": 20000, "Cerrahi Çekim": 3000
  };
  return { ...def, ...(state.treatmentPrices || {}) };
}

/* =========================================================
   1) MALZEME MALİYETİ (tedavi başına)
   Tedavi → hangi malzemeden kaç birim kullanılıyor
========================================================= */

/* state.tedaviMalzeme = { "Dolgu": [{stokId, miktar}], ... } */

function tedaviMalzemeListesi(tedavi) {
  return (state.tedaviMalzeme || {})[tedavi] || [];
}

/* Tedavinin toplam malzeme maliyeti */
function tedaviMalzemeMaliyeti(tedavi) {
  return tedaviMalzemeListesi(tedavi).reduce((sum, k) => {
    const s = stokBul(k.stokId);
    if (!s) return sum;
    return sum + accNum(s.birimFiyat) * accNum(k.miktar);
  }, 0);
}

/* Tedavi kârlılığı: fiyat − malzeme maliyeti */
function tedaviKar(tedavi) {
  const fiyat = accNum(accTumFiyatlar()[tedavi]);
  const maliyet = tedaviMalzemeMaliyeti(tedavi);
  const kar = fiyat - maliyet;
  const marj = fiyat > 0 ? (kar / fiyat) * 100 : 0;
  return { tedavi, fiyat, maliyet, kar, marj };
}

/* =========================================================
   NUR DİŞ — İŞLETME ANALİZİ v7
   1) Randevu & Ciro Tahmini (doluluk, no-show, beklenen ciro)
   2) Personel Verimliliği (hekim başına ciro ve kârlılık)
   3) Kampanya Yönetimi (indirim etki analizi)
   4) Bayat Stok (hareketsiz malzeme, bağlı sermaye)
========================================================= */

/* =========================================================
   1) RANDEVU & CİRO TAHMİNİ
========================================================= */

/* Günlük kapasite (TIME_SLOTS uzunluğu) — ayarlanabilir */
function randevuKapasite() {
  return accNum((state.randevuAyar || {}).gunlukKapasite) || TIME_SLOTS.length;
}

/* Bir tarihin kapalı olup olmadığı (Pazar kapalı varsayımı) */
function randevuKapali(d) {
  const ayar = state.randevuAyar || {};
  const pazarKapali = ayar.pazarKapali !== false;
  return pazarKapali && new Date(d).getDay() === 0;
}

/* Dönem içindeki çalışma günü sayısı */
function calismaGunuSayisi(baslangic, bitis) {
  let n = 0;
  const d = new Date(baslangic);
  const b = new Date(bitis);
  while (d <= b) {
    if (!randevuKapali(d)) n++;
    d.setDate(d.getDate() + 1);
  }
  return n;
}

/* Randevu analizi */
function randevuAnaliz(donemGun) {
  const gun = donemGun || 30;
  const bugun = new Date();
  bugun.setHours(0, 0, 0, 0);
  const gecmisBas = new Date(bugun.getTime() - gun * 86400000);
  const gelecekSon = new Date(bugun.getTime() + gun * 86400000);

  const randevular = (state.appointments || []).filter(a => a && a.date);
  const gecmis = randevular.filter(a => { const d = new Date(a.date); return d >= gecmisBas && d < bugun; });
  const gelecek = randevular.filter(a => { const d = new Date(a.date); return d >= bugun && d <= gelecekSon; });

  const kapasite = randevuKapasite();
  const gecmisGun = calismaGunuSayisi(gecmisBas, new Date(bugun.getTime() - 86400000));
  const gelecekGun = calismaGunuSayisi(bugun, gelecekSon);
  const gecmisKapasite = Math.max(1, gecmisGun * kapasite);
  const gelecekKapasite = Math.max(1, gelecekGun * kapasite);

  /* Gerçekleşen: randevu tarihinde aynı isimle tedavi kaydı var mı? */
  const norm = s => (s || "").toLowerCase().replace(/[^a-zğüşıöç0-9]/g, "");
  const inc = state.accounting.incomes || [];

  const gecmisDetay = gecmis.map(a => {
    const hastaAdi = norm((a.name || "").split(" ")[0]);
    const eslesme = inc.find(x => {
      const d = new Date(x.date);
      const aD = new Date(a.date);
      const gunFark = Math.abs((d - aD) / 86400000);
      if (gunFark > 7) return false;
      const desc = norm((x.firm || "") + " " + (x.description || ""));
      return hastaAdi.length > 2 && desc.includes(hastaAdi);
    });
    return { ...a, geldi: !!eslesme, ciro: eslesme ? accNum(eslesme.grossAmount || eslesme.amount) : 0 };
  });

  const gelenSayisi = gecmisDetay.filter(x => x.geldi).length;
  const noShowOrani = gecmis.length ? ((gecmis.length - gelenSayisi) / gecmis.length) * 100 : 0;
  const doluluk = Math.min(100, (gecmis.length / gecmisKapasite) * 100);
  const gelecekDoluluk = Math.min(100, (gelecek.length / gelecekKapasite) * 100);

  /* Ortalama işlem değeri */
  const son30 = inc.filter(x => new Date(x.date) >= gecmisBas);
  const ortIslemDeger = son30.length ? son30.reduce((s, x) => s + accNum(x.grossAmount || x.amount), 0) / son30.length : 0;
  const ortIslemSayisi = son30.length;

  /* Geçmiş cironun randevuya bölümü (gerçek dönüşüm) */
  const gecmisCiro = gecmisDetay.reduce((s, x) => s + x.ciro, 0);
  const eslesmeOrani = gecmis.length ? (gelenSayisi / gecmis.length) : 0;

  /* Randevu başına ciro — güvenilir hesap:
     Az sayıda eşleşme varsa istatistik yanıltıcı olur.
     Bu yüzden genel ortalama işlem değeriyle harmanlanır (Bayes benzeri). */
  const eslesmeSayisi = gecmisDetay.filter(x => x.geldi).length;
  const eslesmeOrt = eslesmeSayisi > 0 ? gecmisCiro / eslesmeSayisi : 0;
  const GUVEN_ESIK = 10;                       // 10 eşleşmeden az ise harmanla
  const guven = Math.min(1, eslesmeSayisi / GUVEN_ESIK);
  const randevuBasinaCiro = (guven * eslesmeOrt + (1 - guven) * ortIslemDeger) * eslesmeOrani;

  /* Beklenen ciro: gelecek randevu × randevu başına ortalama ciro */
  const beklenenCiro = gelecek.length * (randevuBasinaCiro || ortIslemDeger);
  /* Potansiyel: boş slotların gerçekçi kısmı dolarsa
     (her slotun dolması gerçekçi değil — mevcut doluluk + %25 iyileşme hedefi) */
  const bosSlot = Math.max(0, gelecekKapasite - gelecek.length);
  const hedefDoluluk = Math.min(90, gelecekDoluluk + 25);          // %25 iyileşme hedefi
  const ekRandevu = Math.max(0, Math.round(gelecekKapasite * hedefDoluluk / 100) - gelecek.length);
  const potansiyelCiro = beklenenCiro + ekRandevu * (randevuBasinaCiro || ortIslemDeger);
  const teorikMaks = beklenenCiro + bosSlot * (randevuBasinaCiro || ortIslemDeger);

  /* En yoğun günler */
  const gunDagilim = {};
  gecmis.forEach(a => {
    const d = new Date(a.date).getDay();
    gunDagilim[d] = (gunDagilim[d] || 0) + 1;
  });
  const gunAdlari = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

  /* Saat dağılımı */
  const saatDagilim = {};
  gecmis.forEach(a => { saatDagilim[a.time] = (saatDagilim[a.time] || 0) + 1; });

  /* Haftalık projeksiyon (gelecek 8 hafta) */
  const haftalar = [];
  for (let w = 0; w < 8; w++) {
    const bas = new Date(bugun.getTime() + w * 7 * 86400000);
    const bit = new Date(bas.getTime() + 7 * 86400000);
    const haftaRandevu = gelecek.filter(a => { const d = new Date(a.date); return d >= bas && d < bit; });
    haftalar.push({
      etiket: bas.toLocaleDateString("tr-TR", { day: "numeric", month: "short" }),
      adet: haftaRandevu.length,
      ciro: haftaRandevu.length * (randevuBasinaCiro || ortIslemDeger)
    });
  }

  return {
    gecmis, gelecek, gecmisDetay, gelenSayisi, noShowOrani, doluluk, gelecekDoluluk,
    ortIslemDeger, gecmisCiro, randevuBasinaCiro, beklenenCiro, potansiyelCiro,
    bosSlot, gelecekKapasite, gecmisKapasite, gunDagilim, gunAdlari, saatDagilim, haftalar,
    kapasite, hedefDoluluk, ekRandevu, teorikMaks
  };
}

/* =========================================================
   NUR DİŞ — HASTA İLİŞKİLERİ ve PRİM v8
   1) Hasta Hatırlatma (kontrol zamanı, randevu, geri kazanım)
   2) Personel Prim / Bonus Hesabı
========================================================= */

/* =========================================================
   1) HASTA HATIRLATMA
========================================================= */

/* Hasta adından telefon bul (randevu kayıtlarından) */
function hastaTelefon(ad) {
  const norm = s => (s || "").toLowerCase().replace(/[^a-zğüşıöç0-9]/g, "");
  const hedef = norm(ad).split(" ")[0];
  if (!hedef || hedef.length < 3) return "";

  const aday = (state.appointments || [])
    .filter(a => a.phone && a.name)
    .filter(a => {
      const n = norm(a.name);
      return n.includes(hedef) || hedef.includes(n.split(" ")[0]);
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  return aday.length ? aday[0].phone : "";
}

/* WhatsApp bağlantısı */
function waLink(tel, mesaj) {
  const d = String(tel || "").replace(/\D/g, "");
  let num = d;
  if (d.length === 11 && d.startsWith("0")) num = "9" + d;
  else if (d.length === 10) num = "90" + d;
  return "https://wa.me/" + num + "?text=" + encodeURIComponent(mesaj);
}

/* Kontrol zamanı gelenler: son işlemden bu yana > 180 gün */
function hastaKontrolListesi(ayEsik) {
  const esik = ayEsik || 6;
  const hasta = accHastaListesi();
  const bugun = new Date();

  return hasta.map(h => {
    const gunFark = h.sonTarih ? Math.round((bugun - new Date(h.sonTarih)) / 86400000) : null;
    const ayFark = gunFark !== null ? gunFark / 30 : null;
    const gecti = ayFark !== null && ayFark >= esik;
    const tel = hastaTelefon(h.ad);
    // Yapılan son tedavi
    const sonIslem = h.islemler.slice().sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    return {
      ...h, gunFark, ayFark, kontrolGecti: gecti, tel,
      sonIslemAdi: sonIslem ? sonIslem.category || sonIslem.description : "",
      sonIslemTarihi: sonIslem ? sonIslem.date : null
    };
  }).filter(h => h.kontrolGecti)
    .sort((a, b) => b.gunFark - a.gunFark);
}

/* Uzun süredir gelmeyen (kayıp riski) */
function hastaKayipListesi(ayEsik) {
  const esik = ayEsik || 12;
  const hasta = accHastaListesi();
  const bugun = new Date();
  return hasta.map(h => {
    const gunFark = h.sonTarih ? Math.round((bugun - new Date(h.sonTarih)) / 86400000) : null;
    return { ...h, gunFark, tel: hastaTelefon(h.ad) };
  }).filter(h => h.gunFark !== null && h.gunFark >= esik * 30)
    .sort((a, b) => b.toplam - a.toplam);
}

/* Yaklaşan randevular (hatırlatma için) */
function yakinRandevular(gunAralik) {
  const aralik = gunAralik || 3;
  const bugun = new Date(); bugun.setHours(0, 0, 0, 0);
  const son = new Date(bugun.getTime() + aralik * 86400000);
  return (state.appointments || []).filter(a => {
    if (!a.date) return false;
    const d = new Date(a.date); d.setHours(0, 0, 0, 0);
    return d >= bugun && d <= son;
  }).sort((a, b) => new Date(a.date) - new Date(b.date));
}

/* ---------------- MESAJ ŞABLONLARI ---------------- */

const MESAJ_SABLON = {
  kontrol:
`İyi günler Sayın {ad}

Nur Diş & Dental Klinik'ten yazıyoruz. Son işleminiz ({islem}) üzerinden {ay} ay geçti.

Ücretsiz 6 aylık rutin kontrol için sizleri kliniğimize bekliyoruz.

Randevu için bize dönüş sağlayın.`,

  kayip:
`İyi günler Sayın {ad}

Nur Diş & Dental Klinik'ten yazıyoruz. Sizi {ay} aydır kliniğimizde göremedik.

Ağız ve diş sağlığınız için ücretsiz kontrole bekliyoruz.

Randevu için bize dönüş sağlayın.`,

  randevu:
`İyi günler Sayın {ad}

{gun} saat {saat} randevunuzu hatırlatmak isteriz.

Nur Diş & Dental Klinik
Randevu için bize dönüş sağlayın.`
};

/* Kullanıcı şablonu varsa onu, yoksa varsayılanı döndür */
function mesajSablonu(tip) {
  const ozel = (state.mesajSablon || {})[tip];
  return (ozel && ozel.trim()) ? ozel : MESAJ_SABLON[tip];
}

/* Şablonu değişkenlerle doldur */
function mesajDoldur(tip, veri) {
  let m = mesajSablonu(tip);
  m = m.replace(/\{ad\}/g, veri.ad || "")
       .replace(/\{islem\}/g, veri.islem || "tedavi")
       .replace(/\{ay\}/g, veri.ay != null ? veri.ay : "")
       .replace(/\{gun\}/g, veri.gun || "")
       .replace(/\{saat\}/g, veri.saat || "");
  return m;
}

function renderAccHastaHatirlatma() {
  const altTab = state.hhTab || "kontrol";
  const ayEsik = accNum((state.hhAyar || {}).ay) || 6;
  const kontrol = hastaKontrolListesi(ayEsik);
  const kayip = hastaKayipListesi(12);
  const randevu = yakinRandevular(3);

  const chip = (id, label, adet) => {
    const aktif = altTab === id;
    return `<button data-action="hh-tab" data-tab="${id}" style="flex:1;padding:8px 4px;border-radius:10px;font-size:10.5px;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif;border:1px solid ${aktif ? "#00695C" : "var(--line)"};background:${aktif ? "#00695C" : "rgba(255,255,255,.7)"};color:${aktif ? "#fff" : "var(--ink)"};cursor:pointer;line-height:1.3;">${label}<br/><span style="font-size:12px;">${adet}</span></button>`;
  };

  let icerik = "";

  if (altTab === "kontrol") {
    icerik = kontrol.length ? kontrol.map(h => {
      const mesaj = mesajDoldur("kontrol", {
        ad: h.ad,
        islem: h.sonIslemAdi || "tedavi",
        ay: Math.floor(h.ayFark)
      });
      return `<div class="card p3 mb2">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
          <div style="flex:1;min-width:0;">
            <p style="font-size:12.5px;font-weight:700;margin:0;">${escapeHtml(h.ad)}</p>
            <p style="font-size:10px;color:var(--muted);margin:2px 0 0;">${escapeHtml(h.sonIslemAdi || "")} · ${accTarihTR(h.sonIslemTarihi)}</p>
            <p style="font-size:10.5px;color:#E65100;font-weight:700;margin:3px 0 0;">${Math.floor(h.ayFark)} ay geçti (${h.gunFark} gün)</p>
            <p style="font-size:9.5px;color:#888;margin:2px 0 0;">${h.adet} işlem · ${accTL0(h.toplam)} ciro${h.tel ? " · " + escapeHtml(h.tel) : " · ⚠️ telefon yok"}</p>
          </div>
          ${h.tel
            ? `<a href="${waLink(h.tel, mesaj)}" target="_blank" rel="noopener" style="background:#25D366;color:#fff;text-decoration:none;border-radius:7px;padding:7px 10px;font-size:11px;font-weight:700;flex-shrink:0;">💬</a>`
            : `<span style="font-size:18px;opacity:.3;">💬</span>`}
        </div>
      </div>`;
    }).join("") : `<div class="card p4" style="text-align:center;background:#E8F5E9;border:1px solid #A5D6A7;">
        <p style="font-size:12.5px;margin:0;color:#1B5E20;font-weight:700;">✅ Kontrol zamanı gelen hasta yok</p>
        <p style="font-size:10px;color:#2E7D32;margin:4px 0 0;">Son ${ayEsik} ay içinde tüm hastalar geldi.</p>
      </div>`;

    if (kontrol.length) {
      icerik += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:10px;">
        <button class="btn-primary" style="background:#00695C;font-size:11px;padding:10px;" data-action="hh-kopyala" data-tip="kontrol">📋 Tümünü Kopyala</button>
        <button class="btn-primary" style="background:#0E93AC;font-size:11px;padding:10px;" data-action="hh-yazdir" data-tip="kontrol">🖨️ Liste Yazdır</button>
      </div>`;
    }
  }

  if (altTab === "randevu") {
    icerik = randevu.length ? randevu.map(a => {
      const d = new Date(a.date);
      const gunAdi = d.toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" });
      const mesaj = mesajDoldur("randevu", {
        ad: a.name,
        gun: gunAdi,
        saat: a.time || ""
      });
      return `<div class="card p3 mb2">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
          <div style="flex:1;min-width:0;">
            <p style="font-size:12.5px;font-weight:700;margin:0;">${escapeHtml(a.name)}</p>
            <p style="font-size:10.5px;color:#0277BD;font-weight:700;margin:2px 0 0;">${gunAdi} · ${escapeHtml(a.time || "")}</p>
            <p style="font-size:9.5px;color:#888;margin:2px 0 0;">${escapeHtml(a.phone || "telefon yok")}</p>
          </div>
          ${a.phone
            ? `<a href="${waLink(a.phone, mesaj)}" target="_blank" rel="noopener" style="background:#25D366;color:#fff;text-decoration:none;border-radius:7px;padding:7px 10px;font-size:11px;font-weight:700;flex-shrink:0;">💬</a>`
            : `<span style="font-size:18px;opacity:.3;">💬</span>`}
        </div>
      </div>`;
    }).join("") : `<div class="card p4" style="text-align:center;"><p class="footnote" style="margin:0;">Gelecek 3 günde randevu yok.</p></div>`;
  }

  if (altTab === "kayip") {
    icerik = kayip.length ? kayip.map(h => {
      const mesaj = mesajDoldur("kayip", {
        ad: h.ad,
        ay: Math.floor(h.gunFark / 30)
      });
      return `<div class="card p3 mb2" style="border-left:3px solid #C62828;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
          <div style="flex:1;min-width:0;">
            <p style="font-size:12.5px;font-weight:700;margin:0;">${escapeHtml(h.ad)}</p>
            <p style="font-size:10.5px;color:#C62828;font-weight:700;margin:2px 0 0;">${Math.floor(h.gunFark / 30)} ay gelmedi</p>
            <p style="font-size:9.5px;color:#888;margin:2px 0 0;">${h.adet} işlem · ${accTL0(h.toplam)} toplam ciro</p>
          </div>
          ${h.tel
            ? `<a href="${waLink(h.tel, mesaj)}" target="_blank" rel="noopener" style="background:#25D366;color:#fff;text-decoration:none;border-radius:7px;padding:7px 10px;font-size:11px;font-weight:700;flex-shrink:0;">💬</a>`
            : `<span style="font-size:18px;opacity:.3;">💬</span>`}
        </div>
      </div>`;
    }).join("") : `<div class="card p4" style="text-align:center;"><p class="footnote" style="margin:0;">Kayıp hasta yok.</p></div>`;
  }

  const kayipCiro = kayip.reduce((s, h) => s + h.toplam, 0);
  const kontrolPotansiyel = kontrol.length * (kontrol.length ? kontrol.reduce((s, h) => s + h.ortalama, 0) / kontrol.length : 0);

  return `
    <div class="card p4 mb3" style="background:linear-gradient(135deg,#004D40,#00695C);color:#fff;border:none;">
      <p style="font-size:13px;font-weight:700;margin:0 0 2px;">🔔 Hasta Hatırlatma</p>
      <p style="font-size:10.5px;opacity:.85;margin:0 0 10px;">${kontrol.length} kontrol · ${randevu.length} randevu · ${kayip.length} kayıp</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:8px;">
          <p style="font-size:9px;margin:0;opacity:.85;">KONTROL POTANSİYELİ</p>
          <p style="font-size:15px;font-weight:800;margin:2px 0 0;">${accTL0(kontrolPotansiyel)}</p>
        </div>
        <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:8px;">
          <p style="font-size:9px;margin:0;opacity:.85;">KAYIP HASTA CİROSU</p>
          <p style="font-size:15px;font-weight:800;margin:2px 0 0;">${accTL0(kayipCiro)}</p>
        </div>
      </div>
    </div>

    <div style="display:flex;gap:5px;margin-bottom:12px;">
      ${chip("kontrol", "Kontrol Zamanı", kontrol.length)}
      ${chip("randevu", "Yaklaşan Randevu", randevu.length)}
      ${chip("kayip", "Kayıp Hasta", kayip.length)}
    </div>

    <!-- MESAJ ŞABLONU DÜZENLEME -->
    <div class="card p4 mb3" style="background:#F1F8E9;border:1px solid #C5E1A5;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <p style="font-size:12px;font-weight:700;color:#33691E;margin:0;">✏️ Hazır Mesaj Metni</p>
        <button data-action="hh-sablon-ac" style="background:#7CB342;border:none;border-radius:7px;color:#fff;padding:6px 11px;font-size:10.5px;font-weight:700;cursor:pointer;">${state.hhSablonAcik ? "Kapat" : "Düzenle"}</button>
      </div>
      ${state.hhSablonAcik ? `
      <p style="font-size:9.5px;color:#558B2F;margin:0 0 8px;line-height:1.5;">
        Değişkenler: <b>{ad}</b> hasta adı · <b>{islem}</b> tedavi · <b>{ay}</b> geçen ay
      </p>
      <textarea id="hh-sablon" style="width:100%;min-height:170px;font-size:11px;padding:9px;border:1px solid #C5E1A5;border-radius:8px;font-family:inherit;line-height:1.5;resize:vertical;">${escapeHtml(mesajSablonu(state.hhTab === "kayip" ? "kayip" : state.hhTab === "randevu" ? "randevu" : "kontrol"))}</textarea>
      <div style="display:flex;gap:6px;margin-top:8px;">
        <button class="btn-primary" style="background:#558B2F;font-size:11px;padding:10px;flex:1;" data-action="hh-sablon-kaydet" data-tip="${state.hhTab === "kayip" ? "kayip" : state.hhTab === "randevu" ? "randevu" : "kontrol"}">💾 Kaydet</button>
        <button class="btn-primary" style="background:#9E9E9E;font-size:11px;padding:10px;flex:1;" data-action="hh-sablon-sifirla" data-tip="${state.hhTab === "kayip" ? "kayip" : state.hhTab === "randevu" ? "randevu" : "kontrol"}">↺ Varsayılan</button>
      </div>
      ` : `<div style="background:#fff;border-radius:8px;padding:9px;font-size:10.5px;color:#33691E;line-height:1.55;white-space:pre-wrap;min-height:40px;">${escapeHtml(mesajSablonu(state.hhTab === "kayip" ? "kayip" : state.hhTab === "randevu" ? "randevu" : "kontrol").replace(/\{ad\}/g, "Ayşe K.").replace(/\{islem\}/g, "Dolgu").replace(/\{ay\}/g, "8").replace(/\{gun\}/g, "5 Kasım Çarşamba").replace(/\{saat\}/g, "14:00"))}</div>`}
    </div>

    <div style="display:flex;align-items:center;gap:6px;margin-bottom:10px;">
      <span style="font-size:10px;color:#666;">Kontrol eşiği:</span>
      ${[6, 12, 18, 24].map(v => `<button data-action="hh-esik" data-ay="${v}" style="padding:5px 10px;border-radius:14px;font-size:10px;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif;border:1px solid ${(state.hhAyar||{}).ay === v || (!state.hhAyar && v === 6) ? "#00695C" : "var(--line)"};background:${(state.hhAyar||{}).ay === v || (!state.hhAyar && v === 6) ? "#00695C" : "rgba(255,255,255,.7)"};color:${(state.hhAyar||{}).ay === v || (!state.hhAyar && v === 6) ? "#fff" : "var(--ink)"};cursor:pointer;">${v} ay</button>`).join("")}
    </div>

    ${icerik}

    <div class="card p4 mb3" style="background:#E0F2F1;border:1px solid #80CBC4;margin-top:12px;">
      <p style="font-size:11.5px;font-weight:700;color:#00695C;margin:0 0 6px;">💡 Kontrol hatırlatması neden önemli?</p>
      <p style="font-size:10.5px;color:#00897B;margin:0;line-height:1.65;">
        6 ayda bir kontrol, hem ağız sağlığı hem de klinik cirosu için kritik.
        <b>Yeni hasta bulmak, eski hastayı geri getirmekten 5 kat pahalıdır.</b>
        Her hatırlatma mesajı ortalama <b>%10-15 geri dönüş</b> sağlar.
      </p>
    </div>
  `;
}

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
    { id: "accounting", label: "💰 Muhasebe", count: 0 }
  ];

  const tabButtons = tabs.map(t => `
    <button class="admin-tab ${state.adminTab === t.id ? 'active' : ''}" data-action="admin-tab" data-tab="${t.id}">
      ${t.label}${t.count > 0 ? ` <span class="tab-badge">${t.count}</span>` : ''}
    </button>
  `).join("");

  let tabContent = "";

  if (state.adminTab === "appointments") {
    const apps = state.appointments.slice().reverse().map(a=>`<div class="card p3 mb2"><p class="desc" style="margin:0;">${a.date||""} ${a.time||""} · ${escapeHtml(a.name)} · ${escapeHtml(a.phone)}</p></div>`).join("") || `<p class="footnote">Henüz randevu yok.</p>`;
    tabContent = `
      <p class="section-label">Gelen randevular (canlı)</p>
      <div class="mb4">${apps}</div>
    `;
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

/* ---------------- YARDIMCI: ESCAPE ---------------- */
function escapeHtml(s){ return (s||"").replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function escapeAttr(s){ return escapeHtml(s); }

/* ---------------- ANA RENDER / NAV ---------------- */

const SCREEN_MAP = {
  home: renderHome, services: renderServices, doctors: renderDoctors, devices: renderDevices,
  "dentist-game": renderDentistGame,
  smile: renderSmile,
  reviews: renderReviews, booking: renderBooking, store: renderStore,
  address: renderAddress, contact: renderContact, info: renderInfo, chatbot: renderChatbot,
  "admin-login": renderAdminLogin, "admin-panel": renderAdminPanel, account: renderAccount,
  "profile-edit": renderProfileEdit, "brushing-video": renderBrushingVideo, "family-add": renderFamilyAdd,
  settings: renderSettings,
};

function renderNav() {
  return NAV_TABS.map(tab => `
    <button class="navbtn ${state.screen===tab.id || (tab.id==='more' && state.moreOpen) ?'active':''}" data-action="${tab.id==='more'?'toggle-more':'goto'}" data-screen="${tab.id}">
      <span class="icon">${tab.img ? `<img src="${tab.img}" style="width:30px;height:30px;border-radius:6px;object-fit:contain;" />` : icon(tab.icon,20)}</span><span>${t(tab.id)}</span>
    </button>`).join("");
}

function renderMoreSheet() {
  if (!state.moreOpen) return "";
  const items = MORE_ITEMS.map(i => `
    <button class="grid-item" data-action="goto" data-screen="${i.id}">
      ${i.img ? `<img src="${i.img}" class="grid-icon" style="width:52px;height:52px;border-radius:12px;object-fit:cover;" />` : `<span class="grid-icon">${icon(i.icon,22)}</span>`}<span class="grid-label">${t(i.id)}</span>
    </button>`).join("");
  return `<div class="sheet-overlay" data-action="toggle-more">
    <div class="sheet">
      <div class="sheet-handle"></div>
      <p class="section-label" style="margin-top:4px;">${t("more")}</p>
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
  const updateBar = document.getElementById("update-bar");
  if (updateBar) {
    updateBar.innerHTML = state.updateAvailable
      ? `<button data-action="reload-update" style="width:100%;border:none;background:var(--teal);color:#fff;padding:10px;font-size:13px;">🔄 Yeni sürüm hazır — yenilemek için dokun</button>`
      : "";
  }
  const lightbox = document.getElementById("lightbox");
  if (lightbox) {
    lightbox.innerHTML = state.lightboxPhoto
      ? `<div class="lightbox-overlay" data-action="close-lightbox"><img src="${state.lightboxPhoto}" class="lightbox-img" /></div>`
      : "";
  }
  bindFieldEvents();
  if (state.screen === "smile") initSmile();
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
  /* smile scale slider kaldırıldı */
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
    const u=$("ad-email"), p=$("ad-pass");
    if (u) u.oninput = e => { state.adminForm.email = e.target.value; };
    if (p) p.oninput = e => { state.adminForm.pass = e.target.value; };
  }
  if (state.screen === "admin-panel") {
    const n=$("np-name"), p=$("np-price");
    if (n) n.oninput = e => { state._newProdName = e.target.value; };
    if (p) p.oninput = e => { state._newProdPrice = e.target.value; };
  }
  if (state.screen === "chatbot") {
    const i=$("chat-input"), photo=$("chat-photo-input");
    if (i) { i.oninput = e => { state.chatInput = e.target.value; };
      i.onkeydown = e => { if (e.key==="Enter") sendChat(); }; }
    if (photo) photo.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (ev) => {
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxW = 700;
          const ratio = Math.min(1, maxW/img.width);
          canvas.width = img.width*ratio; canvas.height = img.height*ratio;
          canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          const base64 = dataUrl.split(",")[1];
          sendChat(base64);
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    };
  }
  if (state.screen === "store" && state.checkoutStatus === "form") {
    const n=$("ck-name"), p=$("ck-phone"), a=$("ck-address");
    if (n) n.oninput = e => { state.checkoutForm.name = e.target.value; refreshDisabled(); };
    if (p) p.oninput = e => { state.checkoutForm.phone = e.target.value; refreshDisabled(); };
    if (a) a.oninput = e => { state.checkoutForm.address = e.target.value; refreshDisabled(); };
  }
}

function sendChat(imageBase64) {
  if (!state.user) {
    state.chatLog.push({ from:"bot", text:"⚠️ DİJİ RAMO ile konuşmak için önce Google ile giriş yapmanız gerekiyor." });
    render();
    return;
  }
  const text = (state.chatInput||"").trim();
  if (!text && !imageBase64) return;
  
  // Engellenen kullanıcı kontrolü
  const userChatId = state.user.uid;
  if (state.blockedChatUsers.includes(userChatId)) {
    state.chatLog.push({ from:"bot", text:"⚠️ Hesabınız engellenmiştir. DİJİ RAMO ile konuşamazsınız. Lütfen yönetici ile iletişime geçin." });
    state.chatInput = "";
    render();
    return;
  }
  
  // Küfürlü/argo/ahlaksız kelime kontrolü
  if (text) {
    const lowerText = text.toLowerCase();
    const hasBlockedWord = BLOCKED_WORDS.some(word => {
      // Kısa kelimeler (3 harf ve altı) için kelime sınırı kontrolü
      if (word.length <= 3) {
        const regex = new RegExp('(^|[^a-züöçşığİÜÖÇŞIĞ])' + word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '($|[^a-züöçşığİÜÖÇŞIĞ])', 'i');
        return regex.test(lowerText);
      }
      // Uzun kelimeler için normal includes
      return lowerText.includes(word);
    });
    
    if (hasBlockedWord) {
      // Uyarı ver ve engelle
      state.chatLog.push({ from:"bot", text:"⚠️ Küfürlü, argo veya ahlaksız içerik tespit edildi. Bu tür mesajlar kabul edilmez. Tekrarlanması durumunda hesabınız engellenecektir." });
      
      // İlk ihlal: Uyarı
      const warnings = parseInt(localStorage.getItem('nurdis_chat_warnings_' + userChatId) || '0') + 1;
      localStorage.setItem('nurdis_chat_warnings_' + userChatId, warnings.toString());
      
      // 3. ihlal: Otomatik engelle
      if (warnings >= 3) {
        if (!state.blockedChatUsers.includes(userChatId)) {
          state.blockedChatUsers.push(userChatId);
          localStorage.setItem('nurdis_blocked_chat_users', JSON.stringify(state.blockedChatUsers));
          state.chatLog.push({ from:"bot", text:"🚫 Hesabınız küfürlü/argo/ahlaksız içerik nedeniyle engellenmiştir. Lütfen yönetici ile iletişime geçin." });
        }
      }
      
      state.chatInput = "";
      render();
      return;
    }
  }
  
  state.chatLog.push({ from:"user", text: text || "📷 Fotoğraf gönderildi", image: imageBase64 ? ("data:image/jpeg;base64,"+imageBase64) : null });
  state.chatInput = "";
  render();
  playSound("click");

  if (AI_ENDPOINT_READY) {
    // Chat geçmişi oluştur (son 10 mesaj)
    const recentMessages = state.chatLog.slice(-10).map(m => ({
      role: m.from === "user" ? "user" : "assistant",
      content: m.text
    }));
    if (text) recentMessages.push({ role: "user", content: text });

    fetch(AI_ENDPOINT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "chat", messages: recentMessages }),
    })
      .then(r => r.json())
      .then(data => {
        let replyText = data.reply || CHATBOT_FALLBACK;
        let showBookingBtn = false;
        if (replyText.includes("[RANDEVU_BUTONU]")) {
          replyText = replyText.replace("[RANDEVU_BUTONU]", "").trim();
          showBookingBtn = true;
        }
        state.chatLog.push({ from:"bot", text: replyText, bookingBtn: showBookingBtn });
        render();
      })
      .catch(() => {
        const item = findChatReply(text || "diş");
        state.chatLog.push({ from:"bot", text: item.reply });
        render();
      });
    return;
  }

  setTimeout(() => {
    const item = findChatReply(text || "diş");
    state.chatLog.push({ from:"bot", text: item.reply });
    render();
    if (item.goto) {
      setTimeout(() => {
        state.screen = item.goto;
        if (item.expand) state.expandedService = item.expand;
        window.scrollTo(0,0);
        render();
      }, 900);
    }
  }, 350);
}

/* ---------------- TIKLAMA OLAYLARI ---------------- */

let _entrySoundPlayed = false;
document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-action]");
  if (!el) return;
  const action = el.dataset.action;

  if (!_entrySoundPlayed) { _entrySoundPlayed = true; playSound("login"); }
  else if (action !== "send-chat") playSound("click"); // sendChat kendi tık sesini zaten çalıyor

  // Muhasebe modülü kendi aksiyonlarını yönetir
  if (typeof accAction === "function" && accAction(action, el)) return;

  if (action === "goto") {
    state.screen = el.dataset.screen;
    state.moreOpen = false;
    if (state.screen !== "store") state.checkoutStatus = state.checkoutStatus === "form" ? "idle" : state.checkoutStatus;
    window.scrollTo(0,0);
    history.pushState({ screen: state.screen }, "", "#" + state.screen);
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
  if (action === "toggle-device") {
    state.expandedDevice = state.expandedDevice === el.dataset.id ? null : el.dataset.id;
    render();
  }
  if (action === "toggle-more") {
    state.moreOpen = !state.moreOpen;
    render();
  }
  if (action === "pick-time") { state.bookingForm.time = el.dataset.time; state.bookingStatus="idle"; render(); }
  if (action === "submit-booking") {
    const f = state.bookingForm;
    if (!(f.date && f.time && f.name && f.phone) || !state.user) return;
    state.bookingStatus = "saving"; render();
    const entry = { date:f.date, time:f.time, name:f.name, phone:f.phone, uid: state.user.uid };
    (async () => {
      try {
        if (window.fb && state.fbReady) await window.fb.addAppointment(entry);
        else { state.appointments.push({ id:Date.now(), ...entry }); persist("nurdis_appointments", state.appointments); }
        state.myAppointments.push({ id:Date.now(), ...entry });
        state.bookingStatus = "done";
        state.bookingForm = { date:"", time:"", name:"", phone:"" };
        playSound("success");
      } catch (e) { state.bookingStatus = "error"; playSound("error"); }
      render();
    })();
  }
  if (action === "submit-contact") {
    const c = state.contactForm;
    if (!(c.name && c.msg)) return;
    state.contactStatus = "saving"; render();
    (async () => {
      try {
        if (window.fb && state.fbReady) await window.fb.addMessage(c);
        else {
          let list=[]; try{ list = JSON.parse(localStorage.getItem("nurdis_messages")||"[]"); }catch(e){}
          list.push({ id:Date.now(), ...c });
          persist("nurdis_messages", list);
        }
        state.contactStatus = "done";
        state.contactForm = { name:"", phone:"", msg:"" };
        playSound("success");
      } catch (e) { state.contactStatus = "error"; playSound("error"); }
      render();
    })();
  }
  if (action === "pick-rating") { state.reviewForm.rating = parseInt(el.dataset.n,10); render(); }
  if (action === "submit-review") {
    const r = state.reviewForm;
    if (!(r.name && r.text) || !state.user) return;
    
    // Engellenen kullanıcı kontrolü
    if (state.blockedUsers.includes(state.user.uid)) {
      alert("Hesabınız engellenmiştir. Yorum yapamazsınız.");
      return;
    }
    
    const entry = { name:r.name, rating:r.rating, text:r.text, uid: state.user.uid };
    (async () => {
      try {
        if (window.fb && state.fbReady) await window.fb.addReview(entry);
        else { state.reviews.push({ id:Date.now(), ...entry }); persist("nurdis_reviews", state.reviews); }
        playSound("success");
      } catch (e) { /* sessiz geç, kullanıcıyı engellemeyelim */ }
      state.reviewForm = { name:"", rating:5, text:"" };
      render();
    })();
  }
  if (action === "cart-inc") { state.cart[el.dataset.id] = (state.cart[el.dataset.id]||0)+1; render(); }
  if (action === "cart-dec") { state.cart[el.dataset.id] = Math.max(0,(state.cart[el.dataset.id]||0)-1); render(); }
  if (action === "goto-checkout") { state.checkoutStatus = "form"; render(); }
  if (action === "back-to-store") { state.checkoutStatus = "idle"; render(); }
  if (action === "submit-order") {
    const c = state.checkoutForm;
    if (!(c.name && c.phone && c.address) || !state.user) return;
    const items = []; const all = allProducts();
    for (const cat of all) for (const p of cat.items) if (state.cart[p.id]) items.push({name:p.name, qty:state.cart[p.id], price:p.price});
    const entry = { ...c, items, total: cartTotal(), uid: state.user.uid };
    (async () => {
      try {
        if (window.fb && state.fbReady) await window.fb.addOrder(entry);
        else {
          let list=[]; try{ list = JSON.parse(localStorage.getItem("nurdis_orders")||"[]"); }catch(e){}
          list.push({ id:Date.now(), ...entry });
          persist("nurdis_orders", list);
        }
        state.cart = {};
        state.checkoutForm = { name:"", phone:"", address:"" };
        state.checkoutStatus = "idle";
        state.screen = "home";
        render();
        playSound("success");
        alert("Siparişiniz alındı! Ödeme ve kargo bilgileri için sizinle iletişime geçilecektir.");
      } catch (e) { playSound("error"); alert("Sipariş kaydedilemedi, lütfen tekrar dene."); }
    })();
  }
  if (action === "send-chat") sendChat();
  if (action === "chat-photo-pick") { document.getElementById("chat-photo-input")?.click(); }
  /* smile handler'lar kaldırıldı - Dişini Tasarla yeni kod bekleniyor */
  if (action === "toggle-mute") {
    state.settings.muted = !state.settings.muted;
    persist("nurdis_settings", state.settings);
    render();
  }
  if (action === "set-lang") {
    state.settings.lang = el.dataset.id;
    persist("nurdis_settings", state.settings);
    render();
  }
  if (action === "sign-in-google") {
    if (!window.fb) { alert("Giriş sistemi henüz hazır değil, birkaç saniye sonra tekrar dene."); return; }
    state.authBusy = true; render();
    window.fb.signInGoogle().then((res) => {
      state.authBusy = false;
      if (!res.ok) { playSound("error"); alert("Giriş yapılamadı: " + (res.error||"")); }
      else playSound("login");
      render();
    });
  }
  if (action === "sign-out") {
    if (window.fb) window.fb.signOutUser();
    state.userProfile = null;
    state.brushStreak = 0;
    state.lastBrushDate = null;
    localStorage.removeItem("nurdis_user_profile");
    localStorage.removeItem("nurdis_brush_streak");
    localStorage.removeItem("nurdis_last_brush");
    state.screen = "home";
    render();
  }

  /* ===== PROFİL SİSTEMİ ===== */
  if (action === "edit-profile") {
    state.screen = "profile-edit";
    render();
  }

  if (action === "save-profile") {
    const profile = {
      firstName: (document.getElementById("pf-first")?.value || "").trim(),
      lastName: (document.getElementById("pf-last")?.value || "").trim(),
      age: parseInt(document.getElementById("pf-age")?.value) || null,
      weight: parseFloat(document.getElementById("pf-weight")?.value) || null,
      height: parseFloat(document.getElementById("pf-height")?.value) || null,
      brushReminderTime: state.userProfile?.brushReminderTime || "21:00",
      notificationsEnabled: state.userProfile?.notificationsEnabled !== false,
      lastCheckup: state.userProfile?.lastCheckup || null,
    };
    state.userProfile = profile;
    localStorage.setItem("nurdis_user_profile", JSON.stringify(profile));
    // Firebase'e kaydet
    if (window.fb && state.fbReady && state.user) {
      window.fb.saveUserProfile(state.user.uid, profile).catch(e => console.error("Profil kaydedilemedi:", e));
    }
    state.screen = "account";
    render();
    showNotif("✅ Profil Kaydedildi", "Bilgileriniz güncellendi.");
  }

  if (action === "brush-teeth") {
    const today = new Date().toDateString();
    if (state.lastBrushDate === today) return; // Zaten bugün fırçalamış
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (state.lastBrushDate === yesterday) {
      state.brushStreak = (state.brushStreak || 0) + 1;
    } else {
      state.brushStreak = 1; // Seri kırılmış, yeniden başla
    }
    state.lastBrushDate = today;
    localStorage.setItem("nurdis_brush_streak", state.brushStreak);
    localStorage.setItem("nurdis_last_brush", today);
    // Firebase'e kaydet
    if (window.fb && state.fbReady && state.user) {
      window.fb.saveBrushStreak(state.user.uid, { streak: state.brushStreak, lastDate: today }).catch(() => {});
    }
    render();
    const milestones = [7, 14, 30, 60, 100, 365];
    const milestone = milestones.find(m => state.brushStreak === m);
    checkBadges();
    if (milestone) {
      showNotif("🏆 Tebrikler!", `${milestone} günlük diş fırçalama serisine ulaştın!`);
    } else {
      showNotif("🪥 Harika!", `${state.brushStreak} günlük seri! Devam et!`);
    }
  }

  if (action === "save-brush-time") {
    const time = document.getElementById("brush-time")?.value || "21:00";
    if (!state.userProfile) state.userProfile = {};
    state.userProfile.brushReminderTime = time;
    localStorage.setItem("nurdis_user_profile", JSON.stringify(state.userProfile));
    if (window.fb && state.fbReady && state.user) {
      window.fb.saveUserProfile(state.user.uid, state.userProfile).catch(() => {});
    }
    // Bildirim planla
    scheduleBrushReminder(time);
    render();
    showNotif("⏰ Hatırlatma Ayarlandı", `Her gün saat ${time}'de diş fırçalama hatırlatması alacaksınız.`);
  }

  if (action === "mark-checkup-done") {
    if (!state.userProfile) state.userProfile = {};
    state.userProfile.lastCheckup = new Date().toISOString();
    localStorage.setItem("nurdis_user_profile", JSON.stringify(state.userProfile));
    if (window.fb && state.fbReady && state.user) {
      window.fb.saveUserProfile(state.user.uid, state.userProfile).catch(() => {});
    }
    // 6 ay sonrası için bildirim planla
    scheduleCheckupReminder();
    render();
    showNotif("🏥 Kontrol Kaydedildi", "6 ay sonra bir sonraki kontrol hatırlatması alacaksınız.");
  }

  if (action === "toggle-notifications") {
    if (!state.userProfile) state.userProfile = {};
    state.userProfile.notificationsEnabled = el.checked;
    localStorage.setItem("nurdis_user_profile", JSON.stringify(state.userProfile));
    if (window.fb && state.fbReady && state.user) {
      window.fb.saveUserProfile(state.user.uid, state.userProfile).catch(() => {});
    }
    if (el.checked) requestNotifPermission();
  }

  if (action === "watch-brush-video") {
    state.screen = "brushing-video";
    render();
  }

  /* ===== AİLE ÜYESİ SİSTEMİ ===== */
  if (action === "add-family-member") {
    state._editingFamilyMember = null;
    state.screen = "family-add";
    render();
  }

  if (action === "edit-family-member") {
    state._editingFamilyMember = el.dataset.id;
    state.screen = "family-add";
    render();
  }

  if (action === "save-family-member") {
    const name = (document.getElementById("fm-name")?.value || "").trim();
    const relation = document.getElementById("fm-relation")?.value || "";
    const age = parseInt(document.getElementById("fm-age")?.value) || null;
    const brushReminderTime = document.getElementById("fm-brush-time")?.value || "20:00";
    if (!name) { alert("Ad soyad gerekli!"); return; }

    if (!state.familyMembers) state.familyMembers = [];
    
    if (state._editingFamilyMember) {
      // Düzenle
      const idx = state.familyMembers.findIndex(m => m.id === state._editingFamilyMember);
      if (idx !== -1) {
        state.familyMembers[idx] = { ...state.familyMembers[idx], name, relation, age, brushReminderTime };
      }
    } else {
      // Yeni ekle
      state.familyMembers.push({
        id: "fm_" + Date.now(),
        name, relation, age, brushReminderTime,
        streak: 0, lastBrushDate: null
      });
    }

    // Kaydet
    localStorage.setItem("nurdis_family_members", JSON.stringify(state.familyMembers));
    if (window.fb && state.fbReady && state.user) {
      window.fb.saveUserProfile(state.user.uid, { ...state.userProfile, familyMembers: state.familyMembers }).catch(() => {});
    }
    state._editingFamilyMember = null;
    checkBadges();
    state.screen = "account";
    render();
    showNotif("👨‍👩‍👧 Kaydedildi", `${name} aile üyelerinize eklendi.`);
  }

  if (action === "remove-family-member") {
    const id = el.dataset.id;
    if (!confirm("Bu aile üyesini silmek istediğinize emin misiniz?")) return;
    state.familyMembers = (state.familyMembers || []).filter(m => m.id !== id);
    localStorage.setItem("nurdis_family_members", JSON.stringify(state.familyMembers));
    if (window.fb && state.fbReady && state.user) {
      window.fb.saveUserProfile(state.user.uid, { ...state.userProfile, familyMembers: state.familyMembers }).catch(() => {});
    }
    render();
  }

  if (action === "save-brush-video") {
    const url = (document.getElementById("brush-video-url")?.value || "").trim();
    if (!window.fb || !state.fbReady) { alert("Firebase bağlantısı hazır değil."); return; }
    window.fb.setBrushingVideo(url).then(() => {
      state.brushingVideoUrl = url;
      alert("Diş fırçalama videosu kaydedildi.");
    }).catch(() => alert("Kaydedilemedi."));
  }

  /* ===== TEDAVİ YÖNETİMİ ===== */
  if (action === "add-treatment") {
    const userName = (document.getElementById("tr-user")?.value || "").trim();
    const treatmentName = (document.getElementById("tr-name")?.value || "").trim();
    const date = document.getElementById("tr-date")?.value || new Date().toISOString().split('T')[0];
    const notes = (document.getElementById("tr-notes")?.value || "").trim();
    const payment = document.getElementById("tr-payment")?.value || "Nakit";
    const patientType = document.getElementById("tr-patient-type")?.value || "kisi";
    if (!userName || !treatmentName) { alert("Hasta adı ve tedavi gerekli!"); return; }

    // Fiyat listesinden fiyatı al
    const defaultPrices = { "Muayene":0,"Dolgu":2000,"Kanal Tedavisi":4000,"İmplant":15000,"Zirkonyum Kaplama":5000,"Diş Beyazlatma":3000,"Ortodonti":25000,"Protez":12000,"Diş Taşı Temizliği":1000,"Diş Çekimi":1500,"Köprü":8000,"Lamine Veneer":6000,"Şeffaf Plak":20000,"Cerrahi Çekim":3000 };
    const allPrices = { ...defaultPrices, ...(state.treatmentPrices || {}) };
    const grossAmount = allPrices[treatmentName] || 0;

    // Tedavi kaydını Firebase'e ekle
    const treatmentData = { userName, treatmentName, date, notes, amount: grossAmount, paymentMethod: payment, patientType };

    // Otomatik fatura + muhasebe
    if (grossAmount > 0) {
      if (!state.accounting) state.accounting = { incomes:[], expenses:[], firms:[], bankAccounts:[], invoices:[] };
      const kdv = grossAmount * 0.10;
      const stopaj = patientType === "mukellef" ? grossAmount * 0.20 : 0;
      const damga = grossAmount * 0.00948;
      const netTahsil = grossAmount - stopaj + kdv;

      const now = new Date();
      const monthStr = String(now.getMonth()+1).padStart(2,'0');
      const yearStr = String(now.getFullYear());
      const thisMonthInv = (state.accounting.invoices||[]).filter(inv => inv.no && inv.no.startsWith(yearStr+'-'+monthStr));
      const invoiceNo = yearStr+'-'+monthStr+'-'+String((thisMonthInv.length||0)+1).padStart(5,'0');

      state.accounting.incomes.push({
        id:"inc_"+Date.now(), description: userName + " - " + treatmentName, amount: netTahsil, grossAmount,
        category: treatmentName, paymentMethod: payment, date, kdv, stopaj, damga, kdvOran:0.10, stopajOran: patientType==='mukellef'?0.20:0,
        invoiceNo, patientType, createdAt: new Date().toISOString()
      });
      if (!state.accounting.invoices) state.accounting.invoices = [];
      state.accounting.invoices.push({ no:invoiceNo, date, description:userName+' - '+treatmentName, grossAmount, kdv, stopaj, damga, netAmount:netTahsil, category:treatmentName, paymentMethod:payment });
      localStorage.setItem("nurdis_accounting", JSON.stringify(state.accounting)); saveAccountingToFirebase();
      treatmentData.invoiceNo = invoiceNo;
    }

    if (window.fb && state.fbReady) {
      window.fb.addTreatment(treatmentData).then(() => {
        let msg = "✅ Tedavi kaydedildi: " + treatmentName;
        if (grossAmount > 0) msg += "\n💰 ₺" + grossAmount.toLocaleString('tr-TR') + (treatmentData.invoiceNo ? "\n🧾 Fatura: " + treatmentData.invoiceNo : "");
        alert(msg);
        render();
      }).catch(() => alert("Kaydedilemedi."));
    } else {
      // Firebase yoksa local'e kaydet
      if (!state.treatments) state.treatments = [];
      state.treatments.push({ id:"tr_"+Date.now(), ...treatmentData });
      localStorage.setItem("nurdis_treatments_local", JSON.stringify(state.treatments));
      let msg = "✅ Tedavi kaydedildi: " + treatmentName;
      if (grossAmount > 0) msg += "\n💰 ₺" + grossAmount.toLocaleString('tr-TR');
      alert(msg);
      render();
    }
  }

  if (action === "delete-treatment") {
    const id = el.dataset.id;
    if (!confirm("Bu tedavi kaydını silmek istediğinize emin misiniz?")) return;
    // Local'den sil
    state.treatments = (state.treatments||[]).filter(t => t.id !== id);
    localStorage.setItem("nurdis_treatments_local", JSON.stringify(state.treatments));
    if (window.fb && state.fbReady) {
      window.fb.deleteTreatment(id).then(() => render()).catch(() => render());
    } else { render(); }
  }

  /* ===== FİYAT LİSTESİ YÖNETİMİ ===== */
  if (action === "add-price") {
    const name = document.getElementById("new-price-name")?.value?.trim();
    const amount = parseFloat(document.getElementById("new-price-amount")?.value);
    if (!name || isNaN(amount)) { alert("Tedavi adı ve fiyat gerekli!"); return; }
    if (!state.treatmentPrices) state.treatmentPrices = {};
    state.treatmentPrices[name] = amount;
    localStorage.setItem("nurdis_treatment_prices", JSON.stringify(state.treatmentPrices)); saveAccountingToFirebase();
    alert("✅ " + name + ": ₺" + amount.toLocaleString('tr-TR'));
    render();
  }

  if (action === "update-price") {
    const name = el.dataset.priceName;
    const amount = parseFloat(el.value);
    if (!name || isNaN(amount)) return;
    if (!state.treatmentPrices) state.treatmentPrices = {};
    state.treatmentPrices[name] = amount;
    localStorage.setItem("nurdis_treatment_prices", JSON.stringify(state.treatmentPrices)); saveAccountingToFirebase();
  }

  /* ===== OTOMATİK GİDER YÖNETİMİ ===== */
  if (action === "save-auto-expenses") {
    const inputs = document.querySelectorAll("[data-auto]");
    if (!state.autoExpenses) state.autoExpenses = {};
    inputs.forEach(inp => { state.autoExpenses[inp.dataset.auto] = parseFloat(inp.value) || 0; });
    localStorage.setItem("nurdis_auto_expenses", JSON.stringify(state.autoExpenses)); saveAccountingToFirebase();
    alert("✅ Otomatik gider tutarları kaydedildi.");
    render();
  }

  if (action === "run-auto-expenses") {
    if (!confirm("Bu ayın otomatik giderlerini şimdi muhasebeleştirmek istiyor musunuz?")) return;
    if (!state.accounting) state.accounting = { incomes:[], expenses:[], firms:[], bankAccounts:[], invoices:[] };
    const ae = state.autoExpenses || { kira:50000, elektrik:3000, su:1500, dogalgaz:2000, sgk:8000, vergi:5000 };
    const date = new Date().toISOString().split('T')[0];
    const autoItems = [
      { desc:"Kira Ödemesi", cat:"Kira", amount:ae.kira, firm:"", stopaj:ae.kira*0.20, isKiraStopaj:true },
      { desc:"Elektrik Faturası", cat:"Elektrik/Su/İnternet", amount:ae.elektrik, firm:"" },
      { desc:"Su Faturası", cat:"Elektrik/Su/İnternet", amount:ae.su, firm:"" },
      { desc:"Doğalgaz Faturası", cat:"Elektrik/Su/İnternet", amount:ae.dogalgaz, firm:"" },
      { desc:"SGK/Prim Ödemesi", cat:"SGK Primi", amount:ae.sgk, firm:"" },
      { desc:"Vergi Beyannamesi", cat:"Vergi", amount:ae.vergi, firm:"" },
    ];
    let total = 0;
    autoItems.forEach(item => {
      if (item.amount > 0) {
        state.accounting.expenses.push({
          id:"exp_auto_"+Date.now()+"_"+Math.random().toString(36).substr(2,4),
          description: item.desc, amount: item.amount, category: item.cat, firm: item.firm,
          date, stopaj: item.stopaj||0, isKiraStopaj: item.isKiraStopaj||false,
          createdAt: new Date().toISOString()
        });
        total += item.amount;
      }
    });
    localStorage.setItem("nurdis_accounting", JSON.stringify(state.accounting)); saveAccountingToFirebase();
    alert("✅ " + autoItems.filter(i=>i.amount>0).length + " otomatik gider muhasebeleştirildi.\nToplam: ₺" + total.toLocaleString('tr-TR'));
    render();
  }

  if (action === "print-treatments") {
    const printContent = document.querySelector('.card.p4.mb3:last-child')?.innerHTML || '';
    const w = window.open('', '_blank');
    w.document.write('<html><head><title>Tedavi Kayıtları</title><style>body{font-family:Arial;padding:20px;} .card{border:1px solid #ddd;padding:10px;margin:8px 0;border-radius:8px;}</style></head><body><h2>Nur Diş Klinik - Tedavi Kayıtları</h2>' + printContent + '</body></html>');
    w.document.close();
    w.print();
  }

  /* ===== İPUCU YÖNETİMİ ===== */
  if (action === "add-tip") {
    const text = (document.getElementById("tip-text")?.value || "").trim();
    if (!text) { alert("İpucu metni gerekli!"); return; }
    if (!window.fb || !state.fbReady) { alert("Firebase bağlantısı hazır değil."); return; }
    window.fb.addHealthTip(text).then(() => {
      alert("İpucu eklendi.");
      render();
    }).catch(() => alert("Eklenemedi."));
  }

  if (action === "delete-tip") {
    const id = el.dataset.id;
    if (!confirm("Bu ipucunu silmek istediğinize emin misiniz?")) return;
    if (window.fb && state.fbReady) {
      window.fb.deleteHealthTip(id).then(() => render()).catch(() => alert("Silinemedi."));
    }
  }

  if (action === "add-announcement") {
    const title = document.getElementById("ann-title")?.value?.trim();
    const text = document.getElementById("ann-text")?.value?.trim();
    const videoUrl = document.getElementById("ann-video")?.value?.trim() || "";
    const imageFile = document.getElementById("ann-image")?.files?.[0];
    if (!title || !text) { alert("Başlık ve metin gerekli!"); return; }

    const addAnnouncement = (imageUrl) => {
      if (window.fb && state.fbReady) {
        window.fb.addAnnouncement({ title, text, imageUrl: imageUrl || "", videoUrl, createdAt: new Date().toISOString() })
          .then(() => {
            alert("Duyuru yayınlandı! 📢");
            render();
          }).catch(e => alert("Yayınlanamadı: " + e.message));
      } else {
        alert("Firebase bağlantısı hazır değil.");
      }
    };

    if (imageFile) {
      const reader = new FileReader();
      reader.onload = (e) => addAnnouncement(e.target.result);
      reader.readAsDataURL(imageFile);
    } else {
      addAnnouncement("");
    }
  }

  if (action === "delete-announcement") {
    const id = el.dataset.id;
    if (!confirm("Bu duyuruyu silmek istediğinize emin misiniz?")) return;
    if (window.fb && state.fbReady) {
      window.fb.deleteAnnouncement(id).then(() => render()).catch(() => alert("Silinemedi."));
    }
  }

  if (action === "reload-update") {
    window.location.reload();
  }
  if (action === "toggle-doctor") {
    state.expandedDoctor = state.expandedDoctor === el.dataset.id ? null : el.dataset.id;
    render();
  }
  if (action === "open-lightbox") {
    state.lightboxPhoto = el.dataset.src;
    render();
  }
  if (action === "close-lightbox") {
    state.lightboxPhoto = null;
    render();
  }
  if (action === "set-info-tab") {
    state.infoTab = el.dataset.id;
    render();
  }
  if (action === "admin-login") {
    if (!window.fb) { state.adminError = "Giriş sistemi henüz hazır değil, birkaç saniye sonra tekrar dene."; render(); return; }
    state.authBusy = true; state.adminError = ""; render();
    window.fb.adminSignIn(state.adminForm.email, state.adminForm.pass).then((res) => {
      state.authBusy = false;
      if (res.ok) {
        state.adminLoggedIn = true; localStorage.setItem("nurdis_admin_logged_in", "true"); state.adminError = ""; state.screen = "admin-panel";
        startAdminSubscriptions();
        playSound("login");
      } else {
        state.adminError = res.error || "Giriş başarısız.";
        playSound("error");
      }
      render();
    });
  }
  if (action === "admin-tab") {
    state.adminTab = el.dataset.tab;
    render();
  }
  if (action === "admin-logout") {
    stopAdminSubscriptions();
    if (window.fb) window.fb.signOutUser();
    state.adminLoggedIn = false; localStorage.removeItem("nurdis_admin_logged_in"); state.screen = "home"; render();
  }

  /* ===== 🎮 DİŞ DOKTORU OYUNU HANDLER'LARI ===== */
  if (action === "game-start") {
    resetGame();
    gameState.screen = "exam";
    render();
  }

  if (action === "game-restart") {
    resetGame();
    gameState.screen = "exam";
    render();
  }

  if (action === "game-tooth") {
    const isBad = el.dataset.bad === "true";
    if (isBad) {
      gameState.screen = "diagnose";
      gameState.message = "";
      gameState.score += 10;
      render();
    } else {
      gameState.message = "❌ Bu diş sağlam! Sorunlu dişi bul!";
      render();
    }
  }

  if (action === "game-diagnose") {
    const patient = GAME_PATIENTS[gameState.patientIndex];
    const selected = el.dataset.problem;
    if (selected === patient.problem) {
      gameState.message = "✅ Doğru teşhis! " + patient.problemLabel + "!";
      gameState.score += 20;
      setTimeout(() => {
        gameState.screen = "tools";
        gameState.message = "";
        render();
      }, 1200);
      render();
    } else {
      gameState.message = "❌ Yanlış! Tekrar dene.";
      render();
    }
  }

  if (action === "game-tool") {
    const patient = GAME_PATIENTS[gameState.patientIndex];
    const selected = el.dataset.tool;
    if (selected === patient.tool) {
      gameState.message = "";
      gameState.screen = "treating";
      gameState.treatClicks = 0;
      gameState.treatTarget = 10 + Math.floor(Math.random() * 5);
      render();
    } else {
      gameState.message = "❌ Yanlış alet! " + patient.treatmentLabel + " için doğru aleti seç.";
      render();
    }
  }

  if (action === "game-treat") {
    gameState.treatClicks++;
    if (gameState.treatClicks >= gameState.treatTarget) {
      // Tedavi tamamlandı
      gameState.screen = "result";
      gameState.score += 20;
      gameState.stars++;
      render();
    } else {
      render();
    }
  }

  if (action === "game-next") {
    gameState.patientIndex++;
    if (gameState.patientIndex >= GAME_PATIENTS.length) {
      gameState.screen = "done";
    } else {
      gameState.screen = "exam";
      gameState.message = "";
      gameState.badToothIndex = Math.floor(Math.random() * 8);
    }
    render();
  }

  /* ===== 💰 MUHASEBE HANDLER'LARI ===== */
  if (action === "pos-pay") {
    const desc = document.getElementById("pos-desc")?.value?.trim();
    const amount = parseFloat(document.getElementById("pos-amount")?.value);
    const category = document.getElementById("pos-category")?.value;
    const payment = document.getElementById("pos-payment")?.value;
    const patientType = document.getElementById("pos-patient-type")?.value;
    const firm = document.getElementById("pos-firm")?.value?.trim() || "";
    const tc = document.getElementById("pos-tc")?.value?.trim() || "";
    const unpaid = !!document.getElementById("pos-unpaid")?.checked;
    const doctorId = document.getElementById("pos-doctor")?.value || "";
    if (!desc || !amount) { alert("Açıklama ve tutar gerekli!"); return; }
    if (!state.accounting) state.accounting = { incomes:[], expenses:[], firms:[], bankAccounts:[], invoices:[] };

    // Otomatik vergi hesaplama
    const grossAmount = amount; // Brüt tutar
    const kdvOran = 0.10; // Sağlık hizmetleri KDV %10
    const kdv = grossAmount * kdvOran;
    const stopajOran = patientType === "mukellef" ? 0.20 : 0;
    const stopaj = grossAmount * stopajOran;
    const damga = grossAmount * 0.00948; // Damga vergisi ‰9.48
    const netTahsil = grossAmount - stopaj + kdv;

    // Otomatik fatura no
    const now = new Date();
    const monthStr = String(now.getMonth()+1).padStart(2,'0');
    const yearStr = String(now.getFullYear());
    const thisMonthInvoices = (state.accounting.invoices||[]).filter(inv => inv.no && inv.no.startsWith(yearStr + '-' + monthStr));
    const invoiceNo = yearStr + '-' + monthStr + '-' + String((thisMonthInvoices.length || 0) + 1).padStart(5, '0');
    const date = now.toISOString().split('T')[0];

    // Gelir kaydı
    state.accounting.incomes.push({
      id: "inc_" + Date.now(), description: desc, amount: netTahsil, grossAmount: grossAmount,
      category: category, paymentMethod: payment, date: date, firm: firm, tcNo: tc,
      kdv: kdv, stopaj: stopaj, damga: damga, kdvOran: kdvOran, stopajOran: stopajOran,
      invoiceNo: invoiceNo, patientType: patientType,
      doctor: doctorId,
      paid: !unpaid, paidDate: unpaid ? null : date,
      createdAt: new Date().toISOString()
    });

    // Fatura kaydı
    if (!state.accounting.invoices) state.accounting.invoices = [];
    state.accounting.invoices.push({
      no: invoiceNo, date: date, description: desc, grossAmount: grossAmount,
      kdv: kdv, stopaj: stopaj, damga: damga, netAmount: netTahsil,
      category: category, paymentMethod: payment, firm: firm, tcNo: tc
    });

    localStorage.setItem("nurdis_accounting", JSON.stringify(state.accounting)); saveAccountingToFirebase();

    // Makbuz özeti
    let receipt = "✅ ÖDEME ALINDI!\n\n";
    receipt += "Fatura No: " + invoiceNo + "\n";
    receipt += "Hasta/Firma: " + desc + (firm ? " (" + firm + ")" : "") + "\n";
    receipt += "İşlem: " + category + "\n";
    receipt += "Ödeme: " + payment + "\n\n";
    receipt += "── Vergi Detayı ──\n";
    receipt += "Brüt Tutar: ₺" + grossAmount.toLocaleString('tr-TR',{minimumFractionDigits:2}) + "\n";
    receipt += "KDV (%10): ₺" + kdv.toLocaleString('tr-TR',{minimumFractionDigits:2}) + "\n";
    if (stopaj > 0) receipt += "Stopaj (%20): -₺" + stopaj.toLocaleString('tr-TR',{minimumFractionDigits:2}) + "\n";
    receipt += "Damga (‰9.48): ₺" + damga.toLocaleString('tr-TR',{minimumFractionDigits:2}) + "\n";
    receipt += "───\n";
    receipt += "NET TAHSİL: ₺" + netTahsil.toLocaleString('tr-TR',{minimumFractionDigits:2});
    if (unpaid) receipt += "\n\n⚠️ VERESİYE olarak işlendi — Cari Hesap sekmesinde takip edilecek.";

    alert(receipt);
    render();
  }

  if (action === "acc-add-expense") {
    const desc = document.getElementById("acc-exp-desc")?.value?.trim();
    const amount = parseFloat(document.getElementById("acc-exp-amount")?.value);
    const category = document.getElementById("acc-exp-cat")?.value;
    const firm = document.getElementById("acc-exp-firm")?.value?.trim() || "";
    const invoiceNo = document.getElementById("acc-exp-invoice")?.value?.trim() || "";
    const isKiraStopaj = document.getElementById("acc-exp-stopaj")?.checked;
    const expDate = document.getElementById("acc-exp-date")?.value || new Date().toISOString().split('T')[0];
    const expKdv = parseFloat(document.getElementById("acc-exp-kdv")?.value) || 0;
    const netFiyat = Math.max(0, amount - expKdv);
    if (!desc || !amount) { alert("Açıklama ve tutar gerekli!"); return; }
    if (!state.accounting) state.accounting = { incomes:[], expenses:[], firms:[], bankAccounts:[], invoices:[] };

    // Kira stopajı otomatik hesaplama
    let stopaj = 0;
    let grossAmount = amount;
    if (isKiraStopaj) {
      grossAmount = amount;
      stopaj = grossAmount * 0.20;
    }

    state.accounting.expenses.push({
      id: "exp_" + Date.now(), description: desc, amount: amount, grossAmount: grossAmount,
      category: category, firm: firm, date: expDate,
      invoiceNo: invoiceNo, stopaj: stopaj, isKiraStopaj: isKiraStopaj,
      kdv: expKdv,
      createdAt: new Date().toISOString()
    });
    const giderId = state.accounting.expenses[state.accounting.expenses.length - 1].id;

    // ---- STOĞA DA EKLE ----
    let stokMesaji = "";
    const stokEkle = !!document.getElementById("exp-stok-ekle")?.checked;
    if (stokEkle) {
      const stokAd = (document.getElementById("exp-stok-ad")?.value || "").trim() || desc;
      const stokMiktar = accNum(document.getElementById("exp-stok-miktar")?.value);
      const stokBirim = document.getElementById("exp-stok-birim")?.value || "Adet";
      const stokKat = document.getElementById("exp-stok-kategori")?.value || "Sarf Malzeme";
      const stokMin = accNum(document.getElementById("exp-stok-min")?.value);

      if (stokMiktar <= 0) {
        stokMesaji = "\n\n⚠️ Gider kaydedildi ancak stoğa eklenmedi: miktar girilmedi.";
      } else {
        const s = stokBulVeyaOlustur(stokAd, stokKat, stokBirim);
        if (!s.tedarikci && firm) s.tedarikci = firm;
        if (stokMin > 0) s.minSeviye = stokMin;
        const birimFiyat = (netFiyat > 0 && stokMiktar > 0) ? (netFiyat / stokMiktar) : (amount / stokMiktar);
        stokHareketEkle(s.id, "giris", stokMiktar, "Gider kaydından: " + desc, birimFiyat, { giderId, tedarikci: firm });
        stokKaydet();
        stokMesaji = "\n\n📦 Stoğa eklendi: " + stokMiktar.toLocaleString("tr-TR") + " " + stokBirim + " " + stokAd +
          "\nYeni stok: " + accNum(s.miktar).toLocaleString("tr-TR") + " " + stokBirim;
      }
    }

    localStorage.setItem("nurdis_accounting", JSON.stringify(state.accounting)); saveAccountingToFirebase();
    alert("✅ Gider kaydedildi: ₺" + amount.toLocaleString('tr-TR') + (stopaj > 0 ? "\nStopaj (%20): ₺" + stopaj.toLocaleString('tr-TR',{minimumFractionDigits:2}) : "") + stokMesaji);
    render();
  }

  if (action === "acc-delete") {
    const id = el.dataset.id;
    const type = el.dataset.type;
    if (!confirm("Bu kaydı silmek istediğinize emin misiniz?")) return;
    if (!state.accounting) return;
    if (type === "income") {
      // Önce silinecek kaydı bul (filtreden ÖNCE — yoksa fatura hiç temizlenmiyordu)
      const deletedIncome = (state.accounting.incomes||[]).find(i => i.id === id);
      state.accounting.incomes = (state.accounting.incomes||[]).filter(i => i.id !== id);
      if (deletedIncome && deletedIncome.invoiceNo) {
        state.accounting.invoices = (state.accounting.invoices||[]).filter(inv => inv.no !== deletedIncome.invoiceNo);
      }
    } else {
      state.accounting.expenses = (state.accounting.expenses||[]).filter(e => e.id !== id);
    }
    localStorage.setItem("nurdis_accounting", JSON.stringify(state.accounting)); saveAccountingToFirebase();
    render();
  }
  if (action === "admin-add-product") {
    const name = state._newProdName, price = parseFloat(state._newProdPrice);
    if (!name || !price) return;
    (async () => {
      try {
        if (window.fb && state.fbReady) await window.fb.addProduct({ name, price });
        else { state.customProducts.push({ id:"cp"+Date.now(), name, price }); persist("nurdis_custom_products", state.customProducts); }
      } catch (e) { alert("Ürün eklenemedi."); }
      state._newProdName = ""; state._newProdPrice = "";
      render();
    })();
  }
  if (action === "save-video") {
    const id = el.dataset.id;
    const val = document.getElementById(`vid-${id}`)?.value || "";
    if (!window.fb || !state.fbReady) { alert("Firebase bağlantısı hazır değil."); return; }
    window.fb.setServiceVideo(id, val).then(() => alert("Video linki kaydedildi.")).catch(() => alert("Kaydedilemedi."));
  }
  if (action === "save-product-image") {
    const id = el.dataset.id;
    const val = document.getElementById(`img-${id}`)?.value || "";
    if (!window.fb || !state.fbReady) { alert("Firebase bağlantısı hazır değil."); return; }
    window.fb.setProductImage(id, val).then(() => alert("Ürün görseli kaydedildi.")).catch(() => alert("Kaydedilemedi."));
  }
  if (action === "save-device-video") {
    const id = el.dataset.id;
    const val = document.getElementById(`dvid-${id}`)?.value || "";
    if (!window.fb || !state.fbReady) { alert("Firebase bağlantısı hazır değil."); return; }
    window.fb.setDeviceVideo(id, val).then(() => alert("Cihaz videosu kaydedildi.")).catch(() => alert("Kaydedilemedi."));
  }
  
  if (action === "save-social") {
    const id = el.dataset.id;
    const val = document.getElementById(`sm-${id}`)?.value || "";
    state.socialMedia[id] = val;
    localStorage.setItem("nurdis_social_media", JSON.stringify(state.socialMedia));
    
    if (window.fb && state.fbReady) {
      window.fb.setSocialMedia(id, val).then(() => alert("Sosyal medya linki kaydedildi (tüm cihazlarda).")).catch((err) => {
        console.error("Kaydedilemedi:", err);
        alert("Kaydedilemedi: " + err.message);
      });
    } else {
      alert("Sosyal medya linki kaydedildi (sadece bu cihazda).");
    }
  }
  if (action === "save-review-reply") {
    const id = el.dataset.id;
    const val = document.getElementById(`rvreply-${id}`)?.value || "";
    if (!window.fb || !state.fbReady) { alert("Firebase bağlantısı hazır değil."); return; }
    window.fb.replyToReview(id, val).then(() => alert("Yanıt kaydedildi.")).catch(() => alert("Kaydedilemedi."));
  }
  
  if (action === "delete-review") {
    if (!confirm("Bu yorumu silmek istediğinize emin misiniz?")) return;
    const id = el.dataset.id;
    
    // Önce state'i güncelle
    state.reviews = state.reviews.filter(r => r.id !== id);
    localStorage.setItem("nurdis_reviews", JSON.stringify(state.reviews));
    
    if (window.fb && state.fbReady) {
      window.fb.deleteReview(id).then(() => {
        alert("Yorum silindi (tüm cihazlarda).");
        // state.reviews otomatik güncellenecek (subscribe ile)
        render();
      }).catch((err) => {
        console.error("Yorum silinemedi:", err);
        alert("Yorum silindi (sadece bu cihazda): " + err.message);
        render();
      });
    } else {
      alert("Yorum silindi (sadece bu cihazda).");
      render();
    }
  }
  
  if (action === "block-user") {
    const uid = el.dataset.uid;
    if (!uid) { alert("Kullanıcı ID bulunamadı."); return; }
    if (!confirm("Bu kullanıcıyı engellemek istediğinize emin misiniz? Engellenen kullanıcı yorum yapamaz.")) return;
    if (!state.blockedUsers.includes(uid)) {
      state.blockedUsers.push(uid);
      localStorage.setItem("nurdis_blocked_users", JSON.stringify(state.blockedUsers));
      
      if (window.fb && state.fbReady) {
        window.fb.addToBlockedUsers(uid).then(() => {
          alert("Kullanıcı engellendi (tüm cihazlarda).");
          render();
        }).catch((err) => {
          console.error("Kullanıcı engellenemedi:", err);
          alert("Engellenemedi: " + err.message);
        });
      } else {
        alert("Kullanıcı engellendi (sadece bu cihazda).");
        render();
      }
    }
  }
  
  if (action === "unblock-user") {
    const uid = el.dataset.uid;
    if (!uid) { alert("Kullanıcı ID bulunamadı."); return; }
    if (!confirm("Bu kullanıcının engelini kaldırmak istediğinize emin misiniz?")) return;
    
    // Önce state'i güncelle
    state.blockedUsers = state.blockedUsers.filter(u => u !== uid);
    localStorage.setItem("nurdis_blocked_users", JSON.stringify(state.blockedUsers));
    
    if (window.fb && state.fbReady) {
      window.fb.removeFromBlockedUsers(uid).then(() => {
        alert("Kullanıcı engeli kaldırıldı (tüm cihazlarda).");
        // state.blockedUsers otomatik güncellenecek (subscribe ile)
        render();
      }).catch((err) => {
        console.error("Engel kaldırılamadı:", err);
        alert("Kullanıcı engeli kaldırıldı (sadece bu cihazda): " + err.message);
        render();
      });
    } else {
      alert("Kullanıcı engeli kaldırıldı (sadece bu cihazda).");
      render();
    }
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

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    if (statusEl) statusEl.textContent = "Bu tarayıcı kamera erişimini desteklemiyor.";
    state.smileCameraOn = false; render(); return;
  }

  if (statusEl) statusEl.textContent = "Kameraya erişim isteniyor...";
  try {
    smileStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
  } catch (err) {
    if (statusEl) statusEl.textContent = "Kameraya erişilemedi — tarayıcı ayarlarından bu site için kamera iznini kontrol et.";
    state.smileCameraOn = false; render(); return;
  }
  if (!state.smileCameraOn) { smileStream.getTracks().forEach(t=>t.stop()); return; }

  video.srcObject = smileStream;
  // ÖNEMLİ: video HİÇBİR ZAMAN görünür olmamalı — sadece canvas'a kaynak
  // olarak kullanılır. Önceki sürümde "block" yapılıyordu; .cam-wrap flex
  // kutusu olduğu için video ve canvas yan yana iki ayrı görüntü gibi dizilip
  // "ortadan ikiye bölünmüş" görüntü hatasına yol açıyordu. Kök sebep buydu.
  video.style.display = "none";
  await new Promise((resolve) => { video.onloadedmetadata = resolve; });
  await video.play();

  const vw = video.videoWidth || 480, vh = video.videoHeight || 640;
  canvas.width = vw;
  canvas.height = vh;
  const wrap = document.getElementById("smile-cam-wrap");
  if (wrap) wrap.style.aspectRatio = `${vw} / ${vh}`;
  canvas.style.transform = "scaleX(-1)"; // ön kamera aynası (doğal selfie görünümü)

  if (statusEl) statusEl.textContent = "Yüz takibi modeli yükleniyor...";
  const ok = await ensureFaceApi();
  if (!state.smileCameraOn) return;
  if (!ok && statusEl) statusEl.textContent = "Yüz takibi modeli yüklenemedi (internet bağlantısını kontrol et) — kamera görüntüsü gösteriliyor ama gülüş efekti uygulanamıyor.";
  else if (statusEl) statusEl.textContent = "";

  const ctx = canvas.getContext("2d");
  const loop = async () => {
    if (!state.smileCameraOn) return;
    try {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      if (ok && window.faceapi) {
        const det = await window.faceapi.detectSingleFace(video, new window.faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
        if (det) {
          const mouth = det.landmarks.getMouth();
          const style = SMILE_STYLES.find(s=>s.id===state.smileStyle) || SMILE_STYLES[0];
          const scale = state.smileScale || 1;
          const pts = mouth.slice(0,12);
          const cx = pts.reduce((s,p)=>s+p.x,0)/pts.length;
          const cy = pts.reduce((s,p)=>s+p.y,0)/pts.length;
          ctx.save();
          ctx.beginPath();
          pts.forEach((pt,i) => {
            const x = cx + (pt.x-cx)*scale, y = cy + (pt.y-cy)*scale;
            i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
          });
          ctx.closePath();
          ctx.fillStyle = style.tint;
          ctx.shadowColor = style.glow; ctx.shadowBlur = 8;
          ctx.fill();
          ctx.restore();
        }
      }
    } catch (err) { /* kare atlanır */ }
    smileRAF = requestAnimationFrame(loop);
  };
  loop();
}

function captureSmilePhoto() {
  const canvas = document.getElementById("smile-canvas");
  if (!canvas) return;
  try {
    state.smileCapturedPhoto = canvas.toDataURL("image/jpeg", 0.92);
    state.smileCameraOn = false;
    playSound("success");
    render();
  } catch (err) { playSound("error"); alert("Fotoğraf kaydedilemedi, tekrar dene."); }
}

function stopCameraHardware() {
  // Sadece donanımı/döngüyü durdurur, state.smileCameraOn'a dokunmaz.
  // Her render() başında çağrılır (ekran yeniden çizilince video/canvas
  // elemanları da yok olduğu için akan stream'i kapatmak gerekir).
  if (smileRAF) cancelAnimationFrame(smileRAF);
  if (smileStream) { smileStream.getTracks().forEach(t=>t.stop()); smileStream = null; }
}

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

function showNotif(title, body) {
  // Sayfa bildirim (her zaman çalışır)
  _showInAppNotif(title, body);
  // Browser bildirimi (izin gerekli)
  if ("Notification" in window && Notification.permission === "granted") {
    try { new Notification(title, { body, icon: "/icon-192.png" }); } catch(e) {}
  }
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
function saveAccountingToFirebase() {
  if (window.fb && window.fb.saveAccountingData) {
    window.fb.saveAccountingData({
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
      bonusAyar: state.bonusAyar || null
    }).catch(() => {});
  }
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
      if (yeni) showNotif("📅 Yeni Randevu!", `${yeni.name} — ${yeni.date||""} ${yeni.time||""}`);
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
        if (data.bonusAyar) { state.bonusAyar = data.bonusAyar; localStorage.setItem("nurdis_bonus_ayar", JSON.stringify(state.bonusAyar)); }
        localStorage.setItem("nurdis_accounting", JSON.stringify(state.accounting)); saveAccountingToFirebase();
        localStorage.setItem("nurdis_treatment_prices", JSON.stringify(state.treatmentPrices)); saveAccountingToFirebase();
        localStorage.setItem("nurdis_auto_expenses", JSON.stringify(state.autoExpenses)); saveAccountingToFirebase();
        if (data.treatments) localStorage.setItem("nurdis_treatments_local", JSON.stringify(data.treatments));
        render();
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


const validScreens = Object.keys(SCREEN_MAP);
const hash = window.location.hash.replace("#","");
if (validScreens.includes(hash)) state.screen = hash;
history.replaceState({ screen: state.screen }, "", "#" + state.screen);
render();

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
