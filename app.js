/* =========================================================
   NUR DİŞ & DENTAL KLİNİK — kapsamlı offline PWA
   Vanilla JS + localStorage. Gerçek çok-kullanıcı senkronu,
   gerçek ödeme, gerçek Google girişi ve gerçek SMS/e-posta
   bildirimleri için bir sunucu (ör. Firebase) gerekir — bu
   dosyada bu noktalar açıkça yorum satırıyla işaretlendi.
========================================================= */

/* ---------------- VERİ ---------------- */

const SERVICES = [
  { id:"muayene", name:"Diş Muayenesi & Kontrol", price:"500 ₺", desc:"Genel ağız sağlığı kontrolü ve yönlendirme.", icon:"stethoscope", tone:"teal",
    info:"İlk muayenede ağız içi kontrol edilir, gerekiyorsa röntgen çekilir ve size özel tedavi planı çıkarılır.", before:null, after:null, video:null },
  { id:"temizlik", name:"Diş Temizliği (Detertraj)", price:"900 ₺", desc:"Diş taşı ve leke temizliği, parlatma.", icon:"sparkle", tone:"teal",
    info:"Ultrasonik cihazla diş taşları temizlenir, ardından parlatma işlemi yapılır. Ortalama 20-30 dakika sürer, ağrısızdır.", before:null, after:null, video:null },
  { id:"dolgu", name:"Dolgu", price:"700–1.500 ₺", desc:"Estetik kompozit dolgu uygulamaları.", icon:"tooth", tone:"teal",
    info:"Çürük temizlenir, diş rengiyle uyumlu kompozit malzeme ile doldurulur. Tek seansta tamamlanır.", before:null, after:"treatment-process.jpg", video:null },
  { id:"kanal", name:"Kanal Tedavisi", price:"2.500–4.000 ₺", desc:"Ağrısız kanal tedavisi, tek/çok seans.", icon:"spiral", tone:"teal",
    info:"Lokal anestezi ile ağrısız şekilde uygulanır. Diş içindeki iltihaplı doku temizlenir, kanallar doldurulur.", before:null, after:"treatment-process.jpg", video:"placeholder" },
  { id:"cekim", name:"Diş Çekimi", price:"800–2.000 ₺", desc:"Basit ve cerrahi çekim işlemleri.", icon:"extract", tone:"teal",
    info:"Lokal anestezi altında yapılır. Gömülü/yirmilik diş gibi zor vakalarda cerrahi yöntem uygulanabilir.", before:null, after:null, video:null },
  { id:"beyazlatma", name:"Diş Beyazlatma", price:"3.000 ₺", desc:"Ofis tipi profesyonel beyazlatma.", icon:"sun", tone:"teal",
    info:"Diş minesine zarar vermeyen özel jel ve ışık sistemi ile 1 seansta belirgin fark elde edilir.", before:"whitening-before-after.jpg", after:null, video:null },
  { id:"implant", name:"İmplant", price:"12.000–18.000 ₺", desc:"Tek dişten tam çeneye implant çözümleri.", icon:"implant", tone:"teal",
    info:"Eksik diş kökünün yerine titanyum vida yerleştirilir, üzerine kalıcı diş yapılır. Süreç ortalama 3-6 ay sürer, ara dönemde geçici diş kullanılır.", before:null, after:null, video:"placeholder" },
  { id:"zirkonyum", name:"Zirkonyum Kaplama", price:"4.500–7.000 ₺ / diş", desc:"Doğal görünümlü, dayanıklı diş kaplaması.", icon:"gem", tone:"blue",
    info:"Diş az miktarda küçültülür, ölçü alınır, zirkonyum kaplama üretilip yapıştırılır. Işığı doğal diş gibi yansıtır.", before:null, after:null, video:"placeholder" },
  { id:"ortodonti", name:"Ortodonti (Tel Tedavisi)", price:"Muayene sonrası", desc:"Şeffaf plak ve metal braket seçenekleri.", icon:"brace", tone:"blue",
    info:"Diş sıralaması ve kapanış bozukluklarını düzeltmek için tel veya şeffaf plak kullanılır. Süreç 6 ay - 2 yıl arasında değişir.", before:null, after:null, video:"placeholder" },
  { id:"seffafplak", name:"Şeffaf Plak", price:"Muayene sonrası", desc:"Görünmez, çıkarılabilir diş düzeltme plakları.", icon:"tray", tone:"blue",
    info:"Şeffaf, çıkarılabilir plaklar ile fark edilmeden diş düzeltme yapılır. Günde 20-22 saat takılması önerilir.", before:null, after:null, video:null },
  { id:"kopru", name:"Köprü", price:"4.000–9.000 ₺ / diş", desc:"Eksik dişler için sabit köprü protezi.", icon:"link", tone:"blue",
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
  { id:"cbct", name:"CBCT (Konik Işınlı Bilgisayarlı Tomografi)", icon:"scan3d",
    desc:"Çene ve diş yapısını 3 boyutlu olarak, milimetrik hassasiyetle görüntüler. Özellikle implant planlamasında sinir kanalı, kemik yoğunluğu ve yapının tam konumunu görmemizi sağlar — bu da işlemi çok daha öngörülebilir ve güvenli hale getirir." },
  { id:"scanner", name:"Ağız İçi 3D Tarayıcı (İntraoral Scanner)", icon:"wand",
    desc:"Klasik ölçü kaşığı ve ölçü maddesi yerine ağız içini birkaç dakikada dijital olarak tarar. Kusma hissi ya da rahatsızlık olmadan, çok daha konforlu ve hassas bir ölçü alma deneyimi sunar." },
  { id:"printer3d", name:"3D Yazıcı", icon:"printer",
    desc:"Şeffaf plak, cerrahi rehber ve geçici protez modellerini dijital tasarımdan doğrudan üretir. Bu sayede üretim süresi kısalır ve hassasiyet artar." },
  { id:"panoramic", name:"Dijital Panoramik Röntgen", icon:"jaw",
    desc:"Tüm ağız yapısını, çeneleri ve diş köklerini tek karede, klasik filme göre çok daha düşük radyasyon dozuyla görüntüler. Sonuç saniyeler içinde ekranda incelenebilir." },
  { id:"scaler", name:"Diş Taşı Temizleme Ünitesi (Ultrasonik Scaler)", icon:"sparkle",
    desc:"Diş taşı ve renklenmeleri diş minesine zarar vermeden, ultrasonik titreşimle nazikçe temizler." },
  { id:"ledwhite", name:"LED Beyazlatma Sistemi", icon:"sun",
    desc:"Özel jel ile birlikte kullanılan LED ışık sistemi, tek seansta belirgin ve güvenli bir beyazlatma sonucu sağlar." },
];

const SMILE_STYLES = [
  { id:"hollywood", name:"Hollywood Gülüşü", desc:"Parlak, maksimum beyazlık, simetrik kesim.", icon:"sun", tint:"rgba(255,255,255,0.92)", glow:"rgba(255,255,255,0.35)" },
  { id:"dogal", name:"Doğal Gülüş", desc:"Hafif fildişi tonu, doğal diş dokusu hissi.", icon:"tooth", tint:"rgba(250,244,225,0.55)", glow:"rgba(255,250,235,0.15)" },
  { id:"zirkonyum", name:"Zirkonyum Estetik", desc:"Parlak yüzey, hafif mavi-beyaz yansıma.", icon:"gem", tint:"rgba(235,248,255,0.85)", glow:"rgba(180,230,255,0.4)" },
  { id:"plak", name:"Şeffaf Plak Önizleme", desc:"Diş sıralamasının nasıl düzeleceğine dair kaba önizleme.", icon:"tray", tint:"rgba(255,255,255,0.5)", glow:"rgba(160,255,220,0.25)" },
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
  { id:"home", label:"Ana Sayfa", icon:"home" },
  { id:"services", label:"Hizmetler", icon:"sparkle" },
  { id:"booking", label:"Randevu", icon:"calendar" },
  { id:"chatbot", label:"Sohbet", icon:"chat" },
  { id:"more", label:"Diğer", icon:"dots" },
];

const MORE_ITEMS = [
  { id:"account", label:"Hesabım", icon:"login" },
  { id:"doctors", label:"Doktorlarımız", icon:"user" },
  { id:"devices", label:"Cihazlarımız", icon:"monitor" },
  { id:"smile", label:"Gülüşünü Tasarla", icon:"smile" },
  { id:"reviews", label:"Yorumlar", icon:"star" },
  { id:"store", label:"Mağaza", icon:"box" },
  { id:"address", label:"Adresimiz", icon:"pin" },
  { id:"contact", label:"İletişim", icon:"mail" },
  { id:"info", label:"Diş Sağlığı Bilgileri", icon:"book" },
  { id:"admin-login", label:"Yönetici Girişi", icon:"lock" },
  { id:"settings", label:"Ayarlar", icon:"dots" },
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
  { keys:["zirkonyum"], reply:"Zirkonyum kaplama doğal diş görünümüne çok yakın, dayanıklı ve estetik bir çözümdür. Gülüşünü Tasarla sekmesinden kamerayla nasıl görüneceğini önizleyebilirsin.", goto:"services", expand:"zirkonyum" },
  { keys:["şeffaf plak","plak","invisalign"], reply:"Şeffaf plaklar görünmez şekilde diş düzeltir, günde 20-22 saat takılması gerekir. Tel tedavisine göre daha konforlu bir alternatiftir.", goto:"services", expand:"seffafplak" },
  { keys:["ortodonti","diş teli","tel tedavisi"], reply:"Ortodonti, diş sıralaması ve kapanış bozukluklarını düzeltir; tel ya da şeffaf plak ile uygulanabilir. Hem çocuk hem yetişkinlerde uygulanabilir, yaş sınırı yoktur.", goto:"services", expand:"ortodonti" },
  { keys:["merhaba","selam","iyi günler","günaydın","hey","selamun"], reply:"Merhaba! Nur Diş & Dental Klinik asistanınızım. Diş ağrısı, tedaviler, randevu ya da merak ettiğin herhangi bir konuda sorabilirsin." },
  { keys:["nasılsın","naber","ne haber","iyi misin"], reply:"Ben bir yazılımım, o yüzden günüm falan yok ama hazır ve nazırım 😊 Sen nasılsın, dişlerinle ilgili bir şey mi merak ediyorsun?" },
  { keys:["iyiyim","ben de iyi","güzel","süper","harika"], reply:"Duymak güzel! Diş sağlığınla ilgili merak ettiğin bir şey varsa ya da randevu almak istersen buradayım." },
  { keys:["adın ne","ismin ne","adin"], reply:"Benim özel bir adım yok, Nur Diş & Dental Klinik'in dijital asistanıyım. Bana istediğin şeyi sorabilirsin." },
  { keys:["kaç yaşındasın","yaşın kaç"], reply:"Ben bir yapay zeka asistanıyım, yaşım yok 😄 Ama sana yardımcı olmak için buradayım." },
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
  { keys:["gülüşünü tasarla","ar","kamera"], reply:"Gülüşünü Tasarla sekmesinde kameranı açarak farklı gülüş stillerini gerçek zamanlı önizleyebilirsin.", goto:"smile" },
  { keys:["yorum","değerlendirme"], reply:"Yorumlar sekmesinde diğer hastalarımızın deneyimlerini okuyabilir, Google ile giriş yapıp kendi yorumunu da bırakabilirsin.", goto:"reviews" },
  { keys:["kim", "sen kimsin", "asistan mısın"], reply:"Ben Nur Diş & Dental Klinik'in dijital asistanıyım — diş sağlığı sorularını yanıtlar, kliniğimiz hakkında bilgi veririm ve istersen randevunu da hemen oluşturabilirim." },
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
const AI_ENDPOINT_URL = "";
const AI_ENDPOINT_READY = !!AI_ENDPOINT_URL;https://lively-rice-58e1.nurdisdentalklinik.workers.dev

const CHATBOT_FALLBACK = "Bu soruyu tam karşılayamadım ama elimden geleni yapayım: diş ağrısı, tedaviler (kanal, implant, beyazlatma, zirkonyum, şeffaf plak vb.), randevu, fiyatlandırma mantığı, çalışma saatlerimiz veya genel ağız bakımı hakkında sorabilirsin. İstersen bu konuyu doğrudan Dt. Ramazan DAĞ'ın Dijitali'ne sormak için hemen randevu oluşturabilirim — ister misin?";

/* ---------------- STATE ---------------- */

let state = {
  updateAvailable: false,
  expandedDoctor: null,
  lightboxPhoto: null,
  infoTab: "Bebekler",
  screen: "home",
  moreOpen: false,
  appointments: [],
  myAppointments: [],
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
  smileScale: 1,
  smileCapturedPhoto: null,
  settings: { muted: false, lang: "tr" },
  adminLoggedIn: false,
  adminForm: { email:"", pass:"" },
  adminError: "",
  customProducts: [],
  orders: [],
  serviceVideos: {},   // { serviceId: youtubeUrl }
  productImages: {},   // { productId: imageUrl }
  deviceVideos: {},    // { deviceId: youtubeUrl }
  expandedDevice: null,
  expandedService: null,
  user: null,        // Firebase Google ile giriş yapan kullanıcı (null = giriş yapılmamış)
  fbReady: false,     // firebase-init.js yüklenip window.fb hazır olunca true olur
  authBusy: false,
};

/* ---------------- STORAGE ---------------- */
/* localStorage burada yalnızca Firebase bağlantısı kurulana kadar (ya da
   internetsizken) geçici/offline yedek olarak kullanılır. Firebase hazır
   olduğunda reviews/products/appointments/orders artık Firestore'dan
   gerçek zamanlı gelir — bkz. initFirebaseSync() en alttaki başlatma
   bölümünde. */
function loadAll() {
  try { state.appointments = JSON.parse(localStorage.getItem("nurdis_appointments") || "[]"); } catch(e){ state.appointments = []; }
  try { state.reviews = JSON.parse(localStorage.getItem("nurdis_reviews") || "[]"); } catch(e){ state.reviews = []; }
  try { state.customProducts = JSON.parse(localStorage.getItem("nurdis_custom_products") || "[]"); } catch(e){ state.customProducts = []; }
  try { const s = JSON.parse(localStorage.getItem("nurdis_settings")); if (s) state.settings = { ...state.settings, ...s }; } catch(e){}
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
"const AI_ENDPOINT_URL = "https://lively-rice-58e1.nurdisdentalklinik.workers.dev";"
/* ---------------- HOME ---------------- */

function renderHome() {
  const grid = MORE_ITEMS.map(i => `
    <button class="grid-item" data-action="goto" data-screen="${i.id}">
      <span class="grid-icon">${icon(i.icon,22)}</span><span class="grid-label">${t(i.id)}</span>
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
          <div class="badge badge-teal">${icon("sparkle",20)}</div>
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

      <p class="section-label">Hızlı erişim</p>
      <div class="menu-grid mb5">${grid}</div>

      <p class="section-label">Öne çıkan hizmetler</p>
      <div class="hscroll mb5">
        ${SERVICES.slice(0,6).map(s => `
          <div class="mini-card" data-action="goto-service" data-id="${s.id}">
            <div>${icon(s.icon,18)}</div>
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
        <div class="badge ${s.tone==='blue'?'badge-blue':'badge-teal'}">${icon(s.icon,20)}</div>
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
        <div class="badge badge-blue">${icon(d.icon,22)}</div>
        <div><p class="name" style="font-size:15px;">${d.name}</p><p class="desc">${d.desc}</p></div>
      </div>
      ${detail}
    </div>`;
  }).join("");
  return `${topbar("Cihazlarımız","Son teknoloji, yapay zeka destekli görüntüleme ve üretim cihazları. Kartlara dokunarak tanıtım videosunu izleyebilirsin.", {back:"home"})}
    <div class="content">${cards}</div>`;
}

/* ---------------- GÜLÜŞÜNÜ TASARLA (kamera + yüz takibi) ---------------- */

function renderSmile() {
  if (state.smileCapturedPhoto) {
    return `${topbar("Gülüşünü Tasarla","Fotoğrafın hazır!", {back:"home"})}
      <div class="content">
        <div class="card p4 mb4" style="text-align:center;">
          <img src="${state.smileCapturedPhoto}" style="width:100%;border-radius:14px;display:block;" />
        </div>
        <a class="btn-primary" style="text-decoration:none;display:flex;margin-bottom:10px;" href="${state.smileCapturedPhoto}" download="gulusum.jpg">${icon("box",16)} Fotoğrafı İndir</a>
        <button class="btn-primary" style="background:var(--tealLight);" data-action="smile-retake">${icon("monitor",16)} Tekrar Dene</button>
      </div>`;
  }

  const styleBtns = SMILE_STYLES.map(s => `
    <button class="chip ${state.smileStyle===s.id?'chip-active':''}" data-action="pick-smile-style" data-id="${s.id}">${icon(s.icon,15)} ${s.name}</button>`).join("");
  const activeDesc = SMILE_STYLES.find(s=>s.id===state.smileStyle)?.desc || "";

  return `${topbar("Gülüşünü Tasarla","Kameranı aç, gülümse ve farklı gülüş stillerini gerçek zamanlı önizle.", {back:"home"})}
    <div class="content">
      <div class="card p4 mb4">
        <p class="desc" style="margin-bottom:10px;">Bu özellik yüz takibi teknolojisiyle (gerçek zamanlı yüz/ağız algılama) çalışır — kameran cihazında işlenir, hiçbir görüntü sunucuya gönderilmez.</p>
        <div class="chip-row mb3">${styleBtns}</div>
        <p class="footnote" style="margin-bottom:10px;">${activeDesc}</p>
        <div class="field mb3">
          <label>Diş boyutu (küçült / büyüt)</label>
          <input type="range" min="80" max="130" value="${Math.round(state.smileScale*100)}" data-action-input="smile-scale" id="smile-scale-slider" style="width:100%;" />
        </div>
        <div id="smile-cam-wrap" class="cam-wrap">
          <video id="smile-video" playsinline muted style="display:none;"></video>
          <canvas id="smile-canvas"></canvas>
          <div id="smile-status" class="cam-status">Kamerayı başlatmak için butona bas</div>
        </div>
        <button class="btn-primary" data-action="toggle-camera" style="margin-top:12px;">
          ${state.smileCameraOn ? icon("monitor",16)+" Kamerayı Kapat" : icon("monitor",16)+" Kamerayı Aç ve Gülüşünü Gör"}
        </button>
        ${state.smileCameraOn ? `<button class="btn-primary" style="margin-top:10px;background:var(--tealLight);" data-action="smile-capture">📸 Fotoğrafını Çek</button>` : ""}
      </div>
    </div>`;
}

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
  tr: { home:"Ana Sayfa", services:"Hizmetler", booking:"Randevu", chatbot:"Sohbet", more:"Diğer",
    account:"Hesabım", doctors:"Doktorlarımız", devices:"Cihazlarımız", smile:"Gülüşünü Tasarla",
    reviews:"Yorumlar", store:"Mağaza", address:"Adresimiz", contact:"İletişim", info:"Diş Sağlığı Bilgileri",
    "admin-login":"Yönetici Girişi", settings:"Ayarlar", campaigns:"Kampanyalar", save:"Kaydet", send:"Gönder" },
  en: { home:"Home", services:"Services", booking:"Appointment", chatbot:"Chat", more:"More",
    account:"My Account", doctors:"Our Doctors", devices:"Our Devices", smile:"Design Your Smile",
    reviews:"Reviews", store:"Store", address:"Our Address", contact:"Contact", info:"Dental Health Info",
    "admin-login":"Admin Login", settings:"Settings", campaigns:"Campaigns", save:"Save", send:"Send" },
  ar: { home:"الرئيسية", services:"الخدمات", booking:"موعد", chatbot:"محادثة", more:"المزيد",
    account:"حسابي", doctors:"أطباؤنا", devices:"أجهزتنا", smile:"صمم ابتسامتك",
    reviews:"التقييمات", store:"المتجر", address:"عنواننا", contact:"تواصل معنا", info:"معلومات صحة الأسنان",
    "admin-login":"دخول المدير", settings:"الإعدادات", campaigns:"العروض", save:"حفظ", send:"إرسال" },
  de: { home:"Start", services:"Leistungen", booking:"Termin", chatbot:"Chat", more:"Mehr",
    account:"Mein Konto", doctors:"Unsere Ärzte", devices:"Unsere Geräte", smile:"Lächeln gestalten",
    reviews:"Bewertungen", store:"Shop", address:"Unsere Adresse", contact:"Kontakt", info:"Zahngesundheit",
    "admin-login":"Admin-Login", settings:"Einstellungen", campaigns:"Aktionen", save:"Speichern", send:"Senden" },
  es: { home:"Inicio", services:"Servicios", booking:"Cita", chatbot:"Chat", more:"Más",
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

function renderAccount() {
  if (!state.user) {
    return `${topbar("Hesabım","Randevu almak, yorum yapmak ve sipariş vermek için giriş yap.", {back:"home"})}
      <div class="content">${authGate("Henüz giriş yapmadın.")}</div>`;
  }
  return `${topbar("Hesabım","", {back:"home"})}
    <div class="content">
      <div class="card p4 mb4 row">
        <div class="badge badge-teal">${icon("user",20)}</div>
        <div><p class="name" style="font-size:14px;">${escapeHtml(state.user.name || "")}</p><p class="desc">${escapeHtml(state.user.email || "")}</p></div>
      </div>
      <button class="btn-primary" style="background:var(--bad);" data-action="sign-out">Çıkış Yap</button>
    </div>`;
}

function renderReviews() {
  const r = state.reviewForm;
  const list = state.reviews.length ? state.reviews.slice().reverse().map(rv => `
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
  const msgs = state.chatLog.map(m => `
    <div class="chat-msg ${m.from==='user' ? 'chat-user':'chat-bot'}">${m.image ? `<img src="${m.image}" style="width:100%;border-radius:10px;margin-bottom:6px;display:block;" />` : ""}${escapeHtml(m.text)}</div>`).join("");
  return `${topbar("Dt. Ramazan DAĞ'ın Dijitali","Diş sağlığı hakkında soru sor, dişinin fotoğrafını da gönderebilirsin.")}
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

function renderAdminPanel() {
  const apps = state.appointments.slice().reverse().map(a=>`<div class="card p3 mb2"><p class="desc" style="margin:0;">${a.date||""} ${a.time||""} · ${escapeHtml(a.name)} · ${escapeHtml(a.phone)}</p></div>`).join("") || `<p class="footnote">Henüz randevu yok.</p>`;
  const ords = state.orders.slice().reverse().map(o=>`<div class="card p3 mb2"><p class="desc" style="margin:0;">${escapeHtml(o.name)} · ${escapeHtml(o.phone)} · ${o.total} ₺</p><p class="footnote" style="margin:2px 0 0;">${escapeHtml(o.address||"")}</p></div>`).join("") || `<p class="footnote">Henüz sipariş yok.</p>`;

  const videoRows = SERVICES.map(s => `
    <div class="card p3 mb2">
      <p class="desc" style="margin:0 0 6px;font-weight:500;color:var(--ink);">${s.name}</p>
      <div style="display:flex;gap:6px;">
        <input class="input" id="vid-${s.id}" placeholder="YouTube linki" value="${escapeAttr(state.serviceVideos[s.id]||"")}" style="flex:1;" />
        <button class="qty-btn" style="width:auto;padding:0 12px;" data-action="save-video" data-id="${s.id}">Kaydet</button>
      </div>
    </div>`).join("");

  const imgRows = allProducts().flatMap(cat => cat.items).map(p => `
    <div class="card p3 mb2">
      <p class="desc" style="margin:0 0 6px;font-weight:500;color:var(--ink);">${p.name}</p>
      <div style="display:flex;gap:6px;">
        <input class="input" id="img-${p.id}" placeholder="Görsel URL'si" value="${escapeAttr(state.productImages[p.id]||"")}" style="flex:1;" />
        <button class="qty-btn" style="width:auto;padding:0 12px;" data-action="save-product-image" data-id="${p.id}">Kaydet</button>
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

  const reviewRows = state.reviews.slice().reverse().map(rv => `
    <div class="card p3 mb2">
      <p class="desc" style="margin:0 0 2px;"><b>${escapeHtml(rv.name)}</b> ${stars(rv.rating)}</p>
      <p class="desc" style="margin:0 0 6px;">${escapeHtml(rv.text)}</p>
      <div style="display:flex;gap:6px;">
        <input class="input" id="rvreply-${rv.id}" placeholder="Yanıt yaz (herkes görür)" value="${escapeAttr(rv.adminReply||"")}" style="flex:1;" />
        <button class="qty-btn" style="width:auto;padding:0 12px;" data-action="save-review-reply" data-id="${rv.id}">Kaydet</button>
      </div>
    </div>`).join("") || `<p class="footnote">Henüz yorum yok.</p>`;

  return `${topbar("Yönetici Paneli","Randevular ve ürün yönetimi.", {back:"home"})}
    <div class="content">
      <p class="section-label">Gelen randevular (canlı)</p>
      <div class="mb4">${apps}</div>
      <p class="section-label">Gelen siparişler (canlı)</p>
      <div class="mb4">${ords}</div>
      <p class="section-label">Yeni ürün ekle</p>
      <div class="card p5 mb4">
        <div class="field"><label>Ürün adı</label><input class="input" id="np-name" /></div>
        <div class="field"><label>Fiyat (₺)</label><input class="input" id="np-price" type="number" /></div>
        <button class="btn-primary" data-action="admin-add-product">Ürünü Ekle</button>
      </div>
      <p class="section-label">Ürün görselleri</p>
      <p class="footnote" style="margin-top:-4px;">Görseli bir yere yükleyip (ör. Google Drive'da "herkese açık" paylaşım linki, Imgur vb.) buraya linkini yapıştır.</p>
      <div class="mb4">${imgRows}</div>
      <p class="section-label">Hizmet tanıtım videoları</p>
      <p class="footnote" style="margin-top:-4px;">YouTube'a yüklediğin videonun linkini ilgili hizmetin yanına yapıştır.</p>
      <div class="mb4">${videoRows}</div>
      <p class="section-label">Cihaz tanıtım videoları</p>
      <p class="footnote" style="margin-top:-4px;">Cihazın nasıl çalıştığını gösteren YouTube videosunun linkini yapıştır.</p>
      <div class="mb4">${deviceVideoRows}</div>
      <p class="section-label">Yorumlara yanıt ver</p>
      <p class="footnote" style="margin-top:-4px;">Yazdığın yanıt, o yorumun altında tüm kullanıcılara görünür.</p>
      <div class="mb4">${reviewRows}</div>
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
  smile: renderSmile, reviews: renderReviews, booking: renderBooking, store: renderStore,
  address: renderAddress, contact: renderContact, info: renderInfo, chatbot: renderChatbot,
  "admin-login": renderAdminLogin, "admin-panel": renderAdminPanel, account: renderAccount,
  settings: renderSettings,
};

function renderNav() {
  return NAV_TABS.map(tab => `
    <button class="navbtn ${state.screen===tab.id || (tab.id==='more' && state.moreOpen) ?'active':''}" data-action="${tab.id==='more'?'toggle-more':'goto'}" data-screen="${tab.id}">
      <span class="icon">${icon(tab.icon,20)}</span><span>${t(tab.id)}</span>
    </button>`).join("");
}

function renderMoreSheet() {
  if (!state.moreOpen) return "";
  const items = MORE_ITEMS.map(i => `
    <button class="grid-item" data-action="goto" data-screen="${i.id}">
      <span class="grid-icon">${icon(i.icon,22)}</span><span class="grid-label">${t(i.id)}</span>
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
  if (state.screen === "smile") {
    const sl = $("smile-scale-slider");
    if (sl) sl.oninput = e => { state.smileScale = parseInt(e.target.value,10)/100; };
  }
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
  const text = (state.chatInput||"").trim();
  if (!text && !imageBase64) return;
  state.chatLog.push({ from:"user", text: text || "📷 Fotoğraf gönderildi", image: imageBase64 ? ("data:image/jpeg;base64,"+imageBase64) : null });
  state.chatInput = "";
  render();
  playSound("click");

  if (AI_ENDPOINT_READY) {
    fetch(AI_ENDPOINT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, image: imageBase64 || null }),
    })
      .then(r => r.json())
      .then(data => {
        state.chatLog.push({ from:"bot", text: data.reply || CHATBOT_FALLBACK });
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
  if (action === "pick-smile-style") { state.smileStyle = el.dataset.id; render(); }
  if (action === "toggle-camera") {
    state.smileCameraOn = !state.smileCameraOn;
    render();
  }
  if (action === "smile-capture") {
    captureSmilePhoto();
  }
  if (action === "smile-retake") {
    state.smileCapturedPhoto = null;
    state.smileCameraOn = false;
    render();
  }
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
  if (action === "google-signin") {
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
        state.adminLoggedIn = true; state.adminError = ""; state.screen = "admin-panel";
        startAdminSubscriptions();
        playSound("login");
      } else {
        state.adminError = res.error || "Giriş başarısız.";
        playSound("error");
      }
      render();
    });
  }
  if (action === "admin-logout") {
    stopAdminSubscriptions();
    if (window.fb) window.fb.signOutUser();
    state.adminLoggedIn = false; state.screen = "home"; render();
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
  if (action === "save-review-reply") {
    const id = el.dataset.id;
    const val = document.getElementById(`rvreply-${id}`)?.value || "";
    if (!window.fb || !state.fbReady) { alert("Firebase bağlantısı hazır değil."); return; }
    window.fb.replyToReview(id, val).then(() => alert("Yanıt kaydedildi.")).catch(() => alert("Kaydedilemedi."));
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

function wireFirebase() {
  if (!window.fb || !window.fb.ready) return;
  state.fbReady = true;

  window.fb.onAuthChange((user) => {
    state.user = user;
    render();
  });

  // Herkese açık, gerçek zamanlı veriler:
  unsubReviews = window.fb.subscribeReviews((items) => { state.reviews = items; render(); });
  unsubProducts = window.fb.subscribeProducts((items) => { state.customProducts = items; render(); });
  window.fb.subscribeServiceVideos((map) => { state.serviceVideos = map; render(); });
  window.fb.subscribeDeviceVideos((map) => { state.deviceVideos = map; render(); });
  window.fb.subscribeProductImages((map) => { state.productImages = map; render(); });

  render();
}

function startAdminSubscriptions() {
  if (!window.fb || !state.fbReady) return;
  unsubAppointments = window.fb.subscribeAppointments((items) => { state.appointments = items; render(); });
  unsubOrders = window.fb.subscribeOrders((items) => { state.orders = items; render(); });
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
