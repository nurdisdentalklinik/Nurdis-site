/* =========================================================
   NUR DİŞ — ÇEKİRDEK — veri, state, ana ekranlar, olay yönetimi
   app.js'ten bölündü · index.html yükleme sırası önemli
========================================================= */

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
    { id:"c1", name:"Çocuk Diş Fırçası (Yumuşak, Karakterli)", price:80, gorsel:"urunler/c1.jpg",
      marka:"Nur Diş", aciklama:"Yumuşak kıllı, küçük başlı — 2-7 yaş çocuklar için.\n\n• Ekstra yumuşak naylon kıllar\n• Kaymaz tutamak\n• Eğlenceli karakter tasarımı\n• Diş etine zarar vermez" },
    { id:"c2", name:"Çocuk Diş Macunu (Florürsüz, Meyveli)", price:70, gorsel:"urunler/c2.jpg",
      marka:"Nur Diş", aciklama:"3 yaş altı çocuklar için florürsüz, yutulabilir formül.\n\n• Meyve aromalı\n• Şekersiz\n• Çocukların seveceği tat\n• Diş hekimi onaylı" },
  ]},
  { id:"yetiskin", name:"Yetişkin Ürünleri", items:[
    { id:"y1", name:"Diş Fırçası (Orta Sertlik)", price:60, gorsel:"urunler/y1.jpg",
      marka:"Nur Diş", aciklama:"Günlük kullanım için ideal orta sertlikte diş fırçası.\n\n• Ergonomik tutamak\n• Ulaşılması zor bölgelere uygun baş\n• Kıl uçları yuvarlatılmış\n• Diş etini tahriş etmez" },
    { id:"y2", name:"Diş Macunu (Florürlü)", price:90, gorsel:"urunler/y2.jpg",
      marka:"Nur Diş", aciklama:"Günlük florürlü koruma — çürük önleyici.\n\n• 1450 ppm florür\n• Diş minesini güçlendirir\n• Ferah nefes\n• 75 ml" },
    { id:"y3", name:"Diş Macunu (Hassas Dişler İçin)", price:110, gorsel:"urunler/y3.jpg",
      marka:"Nur Diş", aciklama:"Hassas dişler ve çekilmiş diş eti için özel formül.\n\n• Sinir uçlarını korur\n• Sıcak-soğuk hassasiyetini azaltır\n• Nazik temizlik\n• 75 ml" },
    { id:"y4", name:"Ağız Gargarası (Alkolsüz)", price:120, gorsel:"urunler/y4.jpg",
      marka:"Nur Diş", aciklama:"Alkol içermeyen, günlük kullanıma uygun gargara.\n\n• 12 saat nefes koruması\n• Diş eti sağlığını destekler\n• Ağız kokusunu önler\n• 500 ml" },
    { id:"y5", name:"Diş İpi", price:40, gorsel:"urunler/y5.jpg",
      marka:"Nur Diş", aciklama:"Diş aralarındaki plak ve yemek artıklarını temizler.\n\n• Mumlu yapı — kolay kayar\n• Kopmaz\n• Nane aromalı\n• 50 metre" },
    { id:"y6", name:"Ağız Duşu (Irrigatör)", price:650, gorsel:"urunler/y6.jpg",
      marka:"Nur Diş", aciklama:"Diş aralarını su basıncıyla derinlemesine temizler.\n\n• 3 basınç kademesi\n• 300 ml hazne\n• Şarj edilebilir\n• Su geçirmez (IPX7)\n• Braket ve implant kullananlar için ideal" },
    { id:"y7", name:"Ev Tipi Beyazlatma Kiti", price:950, gorsel:"urunler/y7.jpg",
      marka:"Nur Diş", aciklama:"Diş hekimi kontrolünde evde beyazlatma.\n\n• Kişiye özel kalıp\n• Jel + uygulama seti\n• 2 haftalık kür\n• Mine dostu formül\n\n⚠️ Kullanım öncesi hekiminize danışın." },
    { id:"y8", name:"Ortodontik Fırça (Tel Tedavisi İçin)", price:75, gorsel:"urunler/y8.jpg",
      marka:"Nur Diş", aciklama:"Braket ve tellerin etrafını temizlemek için özel V kesim.\n\n• V şeklinde kıl kesimi\n• Tel aralarına girer\n• Yumuşak kıllar\n• Ortodonti hastaları için" },
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

/* Randevu saat dilimleri: 24 saat, 15 dakika aralıkla (acil/gece randevusu dahil) */
const RANDEVU_ARALIK_DK = 15;
const TIME_SLOTS = (() => {
  const arr = [];
  for (let saat = 0; saat < 24; saat++) {
    for (let dk = 0; dk < 60; dk += RANDEVU_ARALIK_DK) {
      arr.push(String(saat).padStart(2, "0") + ":" + String(dk).padStart(2, "0"));
    }
  }
  return arr;
})();

/* Saate göre gruplama (0-23) */
function saatDilimGrubu(hour) {
  return TIME_SLOTS.filter(t => parseInt(t.split(":")[0]) === hour);
}

/* Gece mi? (22:00 - 07:00) */
function geceMi(time) {
  if (!time) return false;
  const h = parseInt(time.split(":")[0]);
  return h >= 22 || h < 7;
}

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
  { id:"kargo-takip", label:"Kargo Takip", img:"icon-store.png" },
  { id:"address", label:"Adresimiz", img:"icon-address.png" },
  { id:"contact", label:"İletişim", img:"icon-contact.png" },
  { id:"info", label:"Diş Sağlığı Bilgileri", img:"icon-info.png" },
  { id:"admin-login", label:"Yönetici Girişi", img:"icon-admin.png" },
  { id:"portal", label:"Hasta Portalı", img:"icon-account.png" },
  { id:"kvkk", label:"Gizlilik & KVKK", img:"icon-admin.png" },
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
  infoTab: "semptom",
  infoArama: "",        // Diş sağlığı bilgileri arama metni
  infoAcik: null,       // Açık (genişletilmiş) bilgi kartı anahtarı
  testSira: 0,          // Bilgi testi: soru sırası
  testPuan: 0,          // Bilgi testi: doğru sayısı
  testCevap: null,      // Bilgi testi: seçilen şık
  bzKalan: 120,         // Fırçalama zamanlayıcısı: kalan saniye
  bzAktif: false,
  bzBitti: false,
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
  rvFiltre: "gelecek",
  rvSaatGrup: null,
  rvArama: "",
  rvEdit: undefined,
  konumAyar: null,
  randevuSablon: null,
  anketler: [],
  anketTab: "bekleyen",
  anketSablon: null,
  hatirlatmaLog: [],
  yedekGecmis: [],
  kvkkTab: "aydinlatma",
  kvkkTalepler: [],
  mesajSaatAyar: null,
  mesajKuyrugu: [],
  stokOtoAktif: true,
  portalTab: "tedaviler",
  portalAdminTab: "notlar",
  patientFiles: [],
  patientNotes: [],
  senkronKuyrugu: [],
  senkronBekleyen: 0,
  products: [],
  magazaArama: "",
  magazaKategori: "tumu",
  magazaSirala: "onerilen",
  magazaFavori: false,
  magazaUrunId: null,
  magazaUrunEdit: undefined,
  doctors: [],
  doktorEdit: undefined,
  doktorId: null,
  doktorDiplomaId: null,
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
  bookingForm: { date:"", time:"", name:"", phone:"", note:"", kvkk:false, doctor:"" },
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
  hesapMod: "giris",        // Hesabım: giris | kayit | sifre
  hesapForm: {},            // Hesabım form değerleri
  hesapHata: "",
  hesapBusy: false,
  hesapSekme: "siparisler", // Hesap merkezi sekmesi
  hesapSiparisAcik: null,   // Açık sipariş
  adresForm: null,          // Adres düzenleme
  kuponlar: null,           // Kupon listesi
  kullanilanKuponlar: null, // Kullanılmış kupon kodları
  kargoNo: "",              // Kargo takip: girilen numara
  kargoFirma: "",           // Kargo takip: seçilen firma
  kargoSonuc: null,         // API sonucu (varsa)
  kargoAraniyor: false,
  kargoFirmalari: null,       // Kargo firması listesi (yönetici düzenleyebilir)
  siparisFiltre: "tumu",     // Sipariş yönetimi: durum filtresi
  siparisArama: "",          // Sipariş yönetimi: arama
  siparisSirala: "yeni",      // Sipariş yönetimi: sıralama
  siparisAcik: null,          // Açık sipariş kartı
  adminMfa: false,          // İki adımlı doğrulama adımı
  adminMfaYontem: null,     // 'totp' veya 'sms'
  adminGoogleErr: false,
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

/* ⚠️ ÖNEMLİ: loadAll() uygulama açılışında BİR KEZ çağrılmalı.
   Bu çağrı olmadan localStorage'daki veriler state'e yüklenmez ve
   offline açılışta tüm veriler kaybolmuş gibi görünür. */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => { try { loadAll(); } catch (e) { console.error("loadAll hatası:", e); } });
} else {
  try { loadAll(); } catch (e) { console.error("loadAll hatası:", e); }
}

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
  try { state.konumAyar = JSON.parse(localStorage.getItem("nurdis_konum_ayar") || "null"); } catch(e){ state.konumAyar = null; }
  try { state.randevuSablon = JSON.parse(localStorage.getItem("nurdis_randevu_sablon") || "null"); } catch(e){ state.randevuSablon = null; }
  try { state.anketler = JSON.parse(localStorage.getItem("nurdis_anketler") || "[]"); } catch(e){ state.anketler = []; }
  try { state.anketSablon = JSON.parse(localStorage.getItem("nurdis_anket_sablon") || "null"); } catch(e){ state.anketSablon = null; }
  try { state.hatirlatmaLog = JSON.parse(localStorage.getItem("nurdis_hatirlatma_log") || "[]"); } catch(e){ state.hatirlatmaLog = []; }
  try { state.yedekGecmis = JSON.parse(localStorage.getItem("nurdis_yedek_gecmis") || "[]"); } catch(e){ state.yedekGecmis = []; }
  try { state.kvkkTalepler = JSON.parse(localStorage.getItem("nurdis_kvkk_talepler") || "[]"); } catch(e){ state.kvkkTalepler = []; }
  try { state.mesajSaatAyar = JSON.parse(localStorage.getItem("nurdis_mesaj_saat") || "null"); } catch(e){ state.mesajSaatAyar = null; }
  try { state.mesajKuyrugu = JSON.parse(localStorage.getItem("nurdis_mesaj_kuyrugu") || "[]"); } catch(e){ state.mesajKuyrugu = []; }
  try { const so = localStorage.getItem("nurdis_stok_oto"); if (so !== null) state.stokOtoAktif = so === "1"; } catch(e){}
  try { state.patientFiles = JSON.parse(localStorage.getItem("nurdis_patient_files") || "[]"); } catch(e){ state.patientFiles = []; }
  try { state.patientNotes = JSON.parse(localStorage.getItem("nurdis_patient_notes") || "[]"); } catch(e){ state.patientNotes = []; }
  try { state.senkronKuyrugu = JSON.parse(localStorage.getItem("nurdis_senkron_kuyrugu") || "[]"); state.senkronBekleyen = state.senkronKuyrugu.length; } catch(e){}
  try { state.products = JSON.parse(localStorage.getItem("nurdis_products") || "[]"); } catch(e){ state.products = []; }
  try { state.doctors = JSON.parse(localStorage.getItem("nurdis_doctors") || "[]"); } catch(e){ state.doctors = []; }
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
  return renderDoctorsV2();
}

/* Eski doktorlar (referans) */
function renderDoctorsEski() {
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
/* ---------------- MİSAFİR (GİRİŞSİZ) OTURUM ----------------
   Hastaların giriş yapmadan randevu alabilmesi için yerel misafir kimliği.
   Firebase'e kaydederken uid gerekir — bu fonksiyon onu üretir. */
function guestUser() {
  let g = null;
  try { g = JSON.parse(localStorage.getItem("nurdis_guest") || "null"); } catch (e) { g = null; }
  if (!g || !g.uid) {
    g = {
      uid: "guest_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8),
      name: "Misafir",
      email: "",
      isGuest: true
    };
    localStorage.setItem("nurdis_guest", JSON.stringify(g));
  }
  return g;
}

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
    reviews:"Yorumlar", store:"Mağaza", address:"Adresimiz", contact:"İletişim", info:"Diş Sağlığı Bilgileri", "kargo-takip":"Kargo Takip",
    "admin-login":"Yönetici Girişi", settings:"Ayarlar", campaigns:"Kampanyalar", save:"Kaydet", send:"Gönder" },
  en: { home:"Home", services:"Services", booking:"Appointment", chatbot:"DİJİ RAMO", more:"More",
    account:"My Account", doctors:"Our Doctors", devices:"Our Devices", smile:"Design Your Smile",
    reviews:"Reviews", store:"Store", address:"Our Address", contact:"Contact", info:"Dental Health Info", "kargo-takip":"Cargo Tracking",
    "admin-login":"Admin Login", settings:"Settings", campaigns:"Campaigns", save:"Save", send:"Send" },
  ar: { home:"الرئيسية", services:"الخدمات", booking:"موعد", chatbot:"DİJİ RAMO", more:"المزيد",
    account:"حسابي", doctors:"أطباؤنا", devices:"أجهزتنا", smile:"صمم ابتسامتك",
    reviews:"التقييمات", store:"المتجر", address:"عنواننا", contact:"تواصل معنا", info:"معلومات صحة الأسنان", "kargo-takip":"تتبع الشحنة",
    "admin-login":"دخول المدير", settings:"الإعدادات", campaigns:"العروض", save:"حفظ", send:"إرسال" },
  de: { home:"Start", services:"Leistungen", booking:"Termin", chatbot:"DİJİ RAMO", more:"Mehr",
    account:"Mein Konto", doctors:"Unsere Ärzte", devices:"Unsere Geräte", smile:"Lächeln gestalten",
    reviews:"Bewertungen", store:"Shop", address:"Unsere Adresse", contact:"Kontakt", info:"Zahngesundheit", "kargo-takip":"Sendungsverfolgung",
    "admin-login":"Admin-Login", settings:"Einstellungen", campaigns:"Aktionen", save:"Speichern", send:"Senden" },
  es: { home:"Inicio", services:"Servicios", booking:"Cita", chatbot:"DİJİ RAMO", more:"Más",
    account:"Mi Cuenta", doctors:"Nuestros Doctores", devices:"Nuestros Equipos", smile:"Diseña tu Sonrisa",
    reviews:"Reseñas", store:"Tienda", address:"Nuestra Dirección", contact:"Contacto", info:"Salud Dental", "kargo-takip":"Seguimiento de Envío",
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
        <div style="display:flex;justify-content:space-between;align-items:center;margin:0 0 12px;">
          <p class="section-label" style="margin:0;">🦷 Tedavi Geçmişim</p>
          <button data-action="goto" data-screen="portal" style="background:#00695C;border:none;border-radius:7px;color:#fff;padding:6px 11px;font-size:10px;font-weight:700;cursor:pointer;">Hasta Portalı →</button>
        </div>
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
  return renderBookingV2();
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
  return renderStoreV2();
}

/* Eski mağaza (kullanılmıyor - referans için) */
function renderStoreEski() {
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

  /* ---- HESAP ZORUNLU (Trendyol mantığı) ---- */
  if (!state.user || !state.user.uid) {
    return `${topbar("Siparişi Tamamla", "Devam etmek için giriş yapın.", { back: "store" })}
      <div class="content">
        <div class="card p4 mb3">
          <p class="name" style="font-size:14px;margin:0 0 8px;">Sipariş özeti</p>
          ${lines.map(l => `<p class="desc" style="margin:2px 0;font-size:12px;">${l}</p>`).join("")}
          <div style="display:flex;justify-content:space-between;border-top:1px solid var(--line);margin-top:8px;padding-top:8px;">
            <span style="font-weight:800;font-size:13px;">Toplam</span>
            <span style="font-weight:800;font-size:15px;color:var(--teal);">${accTL(cartTotal())}</span>
          </div>
        </div>

        <div class="card p4 mb3" style="background:linear-gradient(135deg,#0B6E86,#0E8FA8);color:#fff;border:none;text-align:center;">
          <p style="font-size:32px;margin:0 0 6px;">🔐</p>
          <p style="font-size:14px;font-weight:800;margin:0 0 4px;">Hesap gerekli</p>
          <p style="font-size:11.5px;opacity:.92;margin:0;line-height:1.5;">
            Siparişinizi takip edebilmeniz için hesap oluşturmanız gerekiyor.
            Sadece 10 saniye sürer.
          </p>
        </div>

        <button class="btn-primary" style="width:100%;margin-bottom:8px;" data-action="checkout-giris">Giriş Yap / Hesap Oluştur</button>
        <button class="btn-primary" style="width:100%;background:var(--surface);color:var(--ink);border:1px solid var(--line);" data-action="back-to-store">← Mağazaya dön</button>
      </div>`;
  }

  /* ---- VARSAYILAN ADRES KISAYOLU ---- */
  const va = (typeof varsayilanAdres === "function") ? varsayilanAdres() : null;
  const adresler = (typeof adreslerim === "function") ? adreslerim() : [];

  /* ---- KUPON ---- */
  const kupon = state.sepetKupon ? (typeof kuponlarim === "function"
      ? kuponlarim().find(k => k.kod === state.sepetKupon) : null) : null;
  const indirim = (kupon && typeof kuponIndirimi === "function") ? kuponIndirimi(kupon, cartTotal()) : 0;
  const odenecek = Math.max(0, cartTotal() - indirim);

  return `${topbar("Siparişi Tamamla", "Teslimat bilgilerinizi kontrol edin.", { back: "store" })}
    <div class="content">

      <!-- Ürünler -->
      <div class="card p4 mb3">
        <p class="name" style="font-size:13.5px;margin:0 0 8px;">🛒 Sipariş özeti</p>
        ${lines.map(l => `<p class="desc" style="margin:2px 0;font-size:11.5px;">${l}</p>`).join("")}
      </div>

      <!-- Adres seçimi -->
      ${adresler.length ? `
      <div class="card p4 mb3">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <p class="name" style="font-size:13px;margin:0;">📍 Kayıtlı adreslerim</p>
          <button data-action="goto" data-screen="account"
            style="background:none;border:none;color:var(--teal);font-size:10.5px;font-weight:700;cursor:pointer;">Yönet →</button>
        </div>
        ${adresler.map(a => `
          <button data-action="checkout-adres" data-id="${a.id}"
            style="width:100%;text-align:left;padding:9px 11px;border-radius:9px;margin-bottom:6px;cursor:pointer;
            border:1.5px solid ${(state.checkoutAdresId === a.id || (!state.checkoutAdresId && a.varsayilan)) ? "var(--teal)" : "var(--line)"};
            background:${(state.checkoutAdresId === a.id || (!state.checkoutAdresId && a.varsayilan)) ? "#E0F3F7" : "var(--surface)"};">
            <p style="margin:0;font-size:11.5px;font-weight:800;">${escapeHtml(a.baslik || "Adres")}</p>
            <p class="desc" style="margin:2px 0 0;font-size:10.5px;line-height:1.4;">${escapeHtml(a.ad || "")} · ${escapeHtml(a.tel || "")}<br/>${escapeHtml((a.il || "") + " " + (a.acik || ""))}</p>
          </button>`).join("")}
      </div>` : ""}

      <!-- Teslimat formu -->
      <div class="card p4 mb3">
        <p class="name" style="font-size:13px;margin:0 0 10px;">Teslimat bilgileri</p>
        <div class="field"><label>Ad Soyad *</label><input class="input" id="ck-name" value="${escapeAttr(c.name)}" placeholder="Ad Soyad" /></div>
        <div class="field"><label>Telefon *</label><input class="input" id="ck-phone" type="tel" placeholder="05xx xxx xx xx" value="${escapeAttr(c.phone)}" inputmode="tel" /></div>
        <div class="field"><label>Açık Adres *</label><textarea class="input" id="ck-address" rows="3" placeholder="Mahalle, sokak, no, daire…">${escapeHtml(c.address)}</textarea></div>
      </div>

      <!-- Kupon -->
      <div class="card p4 mb3">
        <p class="name" style="font-size:13px;margin:0 0 8px;">🎟️ İndirim kuponu</p>
        ${kupon ? `
          <div style="display:flex;justify-content:space-between;align-items:center;background:#E8F5E9;border-radius:9px;padding:9px 11px;">
            <div>
              <p style="margin:0;font-size:12px;font-weight:800;color:#2E7D32;">${escapeHtml(kupon.kod)}</p>
              <p style="margin:1px 0 0;font-size:10.5px;color:#388E3C;">− ${accTL(indirim)} indirim uygulandı</p>
            </div>
            <button data-action="kupon-kaldir" style="background:none;border:none;color:#C62828;font-size:11px;font-weight:700;cursor:pointer;">Kaldır</button>
          </div>` : `
          <div style="display:flex;gap:6px;">
            <input class="input" id="ck-kupon" placeholder="Kupon kodu" style="flex:1;font-size:12.5px;text-transform:uppercase;" />
            <button class="qty-btn" style="width:auto;padding:0 14px;font-size:11.5px;" data-action="kupon-uygula">Uygula</button>
          </div>`}
      </div>

      <!-- Toplam -->
      <div class="card p4 mb3">
        <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px;">
          <span class="desc">Ara toplam</span><span>${accTL(cartTotal())}</span>
        </div>
        ${indirim ? `<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px;color:#2E7D32;">
          <span>Kupon indirimi</span><span>− ${accTL(indirim)}</span>
        </div>` : ""}
        <div style="display:flex;justify-content:space-between;border-top:1px solid var(--line);margin-top:8px;padding-top:8px;">
          <span style="font-weight:800;font-size:13.5px;">Ödenecek</span>
          <span style="font-weight:800;font-size:17px;color:var(--teal);">${accTL(odenecek)}</span>
        </div>
      </div>

      <button class="btn-primary" style="width:100%;" data-action="submit-order" ${!canSubmit ? "disabled" : ""}>Siparişi Onayla</button>
      <button class="btn-primary" style="width:100%;margin-top:8px;background:var(--surface);color:var(--ink);border:1px solid var(--line);" data-action="back-to-store">← Mağazaya dön</button>

      <div class="card p4 mb3" style="margin-top:12px;">
        <p class="footnote" style="margin:0;line-height:1.55;">💳 Ödeme: klinik IBAN'ına havale/EFT (yönetici panelinden IBAN eklenebilir). Dekontu WhatsApp ile iletin. Kargo takip numarası WhatsApp'tan gönderilir.</p>
      </div>
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
        ${typeof gvTuzakAlani === "function" ? gvTuzakAlani() : ""}
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

/* ---------------- BİLGİ ----------------
   Diş Sağlığı Bilgileri ekranı js/bilgi.js içinde tanımlıdır (renderInfo).
   ARTICLES / MYTHS / HERBS verileri burada kalır; yeni modül bunları kullanır. */

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

  /* İkinci faktör adımı: şifre doğru, şimdi 6 haneli kod isteniyor */
  if (state.adminMfa) {
    return `${topbar("İki Adımlı Doğrulama","Hesabınızı korumak için ikinci adım.", {back:"admin-login"})}
      <div class="content">
        <div class="card p5" style="text-align:center;">
          <div style="font-size:40px;margin-bottom:10px;">🔐</div>
          <p class="name" style="font-size:15px;margin:0 0 6px;">Doğrulama kodu</p>
          <p class="desc" style="margin:0 0 16px;font-size:12px;line-height:1.5;">
            ${state.adminMfaYontem === "totp"
              ? "Authenticator uygulamanızdaki (Google Authenticator, Microsoft Authenticator) 6 haneli kodu girin."
              : "Telefonunuza gönderilen kodu girin."}
          </p>
          <input class="input" id="ad-mfa-kod" inputmode="numeric" autocomplete="one-time-code"
            placeholder="123456" maxlength="8"
            style="text-align:center;font-size:24px;letter-spacing:8px;font-weight:700;" />
          ${state.adminError ? `<p class="status-err" style="margin-top:12px;">${state.adminError}</p>` : ""}
          <button class="btn-primary" style="margin-top:14px;" data-action="admin-mfa-dogrula" ${state.authBusy ? "disabled" : ""}>
            ${state.authBusy ? "Doğrulanıyor…" : "Doğrula ve Giriş Yap"}
          </button>
          <button class="btn-primary" style="margin-top:8px;background:var(--surface);color:var(--ink);border:1px solid var(--line);"
            data-action="admin-mfa-iptal">Vazgeç</button>
        </div>
      </div>`;
  }

  return `${topbar("Yönetici Girişi","Sadece klinik yönetimi içindir.", {back:"home"})}
    <div class="content">

      <div class="card p4 mb3" style="background:linear-gradient(135deg,#0B6E86,#0E8FA8);color:#fff;">
        <p style="font-size:12.5px;font-weight:700;margin:0 0 4px;">🔐 Güvenli giriş önerilir</p>
        <p style="font-size:11px;opacity:.92;margin:0;line-height:1.5;">
          Google hesabınızda 2 adımlı doğrulama açıksa, aşağıdaki Google butonu şifreniz çalınsa bile hesabınızı korur.
        </p>
      </div>

      <div class="card p5 mb3">
        <button class="btn-primary" data-action="admin-google-giris"
          style="width:100%;background:#fff;color:#3c4043;border:1px solid #dadce0;display:flex;align-items:center;justify-content:center;gap:10px;font-weight:600;">
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
          Google ile Giriş Yap
        </button>
        ${state.adminError ? `<p class="status-err" style="margin-top:12px;">${state.adminError}</p>` : ""}
        <p class="footnote" style="margin:10px 0 0;text-align:center;">Google hesabınızda 2 adımlı doğrulama açıksa bu yöntem en güvenlisidir.</p>
      </div>

      <div style="display:flex;align-items:center;gap:10px;margin:4px 0 14px;">
        <div style="flex:1;height:1px;background:var(--line);"></div>
        <span style="font-size:11px;color:var(--muted);font-weight:600;">veya e-posta ile</span>
        <div style="flex:1;height:1px;background:var(--line);"></div>
      </div>

      <div class="card p5">
        <div class="field"><label>Yönetici e-postası</label><input class="input" id="ad-email" value="${escapeAttr(f.email)}" autocomplete="username" /></div>
        <div class="field"><label>Şifre</label><input class="input" type="password" id="ad-pass" value="${escapeAttr(f.pass)}" autocomplete="current-password" /></div>
        ${state.adminError && !state.adminGoogleErr ? `<p class="status-err">${state.adminError}</p>` : ""}
        <button class="btn-primary" data-action="admin-login" ${state.authBusy?"disabled":""}>${state.authBusy?"Giriş yapılıyor…":"Giriş Yap"}</button>
        <p class="footnote">İki adımlı doğrulama açıksa girişten sonra kod istenir.</p>
      </div>
    </div>`;
}
