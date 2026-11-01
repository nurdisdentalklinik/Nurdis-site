/* =====================================================================
   DİŞ SAĞLIĞI BİLGİLERİ — genişletilmiş modül
   ---------------------------------------------------------------------
   Kaynak yaklaşımı: diş hekimliğinde yerleşik kabul gören bilgiler.
   Her ekranın altında "tanı/tedavi yerine geçmez" uyarısı bulunur.

   BÖLÜMLER
    1. Veri katmanı  (makale, tedavi, semptom, acil, özel grup, kıyas, test)
    2. Ana ekran renderInfo()  — arama + sekmeler
    3. Sekme render'ları
    4. Fırçalama zamanlayıcısı (2 dk, 4 bölge)
    5. Olay yakalayıcı bilgiAction()
   ===================================================================== */

/* =====================================================================
   1. VERİ KATMANI
   ===================================================================== */

/* --- Makaleler (yaş gruplarına göre) --- */
const BI_MAKALE = [
  /* ---- BEBEKLER (0-3 yaş) ---- */
  { grup:"Bebekler", ikon:"👶", baslik:"İlk diş ne zaman çıkar?",
    ozet:"Genellikle 6. ayda, 3-14 ay arası normal.",
    govde:"İlk süt dişi genellikle 6 ay civarında çıkar; 3-14 ay arasında çıkması normal kabul edilir. Genellikle önce alt ön kesici dişler görünür. 18 ayda hiç diş çıkmadıysa çocuk diş hekimine danışılmalıdır." },
  { grup:"Bebekler", ikon:"👶", baslik:"Diş çıkarma belirtileri",
    ozet:"Salya, huzursuzluk, diş eti hassasiyeti.",
    govde:"Huzursuzluk, diş eti hassasiyeti, salya artışı ve hafif sıcaklık artışı diş çıkarmayla ilişkilendirilebilir. Ancak yüksek ateş, döküntü, ishal gibi belirtiler diş çıkarmayla açıklanamaz — çocuk doktoruna danışılmalıdır." },
  { grup:"Bebekler", ikon:"👶", baslik:"Diş çıkarmada rahatlatma",
    ozet:"Soğutulmuş kaşıyıcı, temiz parmakla masaj.",
    govde:"Temiz, soğutulmuş (dondurulmamış) bir diş kaşıyıcı, temiz bir parmakla nazik masaj ya da soğuk kaşık rahatsızlığı hafifletir. İçi sıvı dolu veya kolay kırılan plastik kaşıyıcılardan kaçınılmalıdır." },
  { grup:"Bebekler", ikon:"👶", baslik:"Bebeğin ağız bakımına ne zaman başlanır?",
    ozet:"İlk diş çıkmadan önce bile gazlı bezle silinebilir.",
    govde:"İlk diş çıkmadan önce bile her beslenme sonrası diş etleri temiz, nemli bir gazlı bezle nazikçe silinebilir. İlk diş çıkar çıkmaz, macun kullanmadan parmak fırça ile fırçalamaya başlanabilir." },
  { grup:"Bebekler", ikon:"👶", baslik:"Biberon çürüğü (early childhood caries)",
    ozet:"Gece biberonla uyutmak en büyük risk.",
    govde:"Bebeğin biberonla uykuya dalması, özellikle gece boyunca ağızda şekerli sıvı kalması, ön dişlerde hızla çürük oluşturur. Gece beslenmesinden sonra ağzın su ile çalkalanması veya dişlerin silinmesi önerilir." },
  { grup:"Bebekler", ikon:"👶", baslik:"İlk diş hekimi ziyareti ne zaman?",
    ozet:"İlk diş çıkınca ve en geç 1 yaşında.",
    govde:"Uluslararası kabul gören öneri: ilk diş çıktığında ve en geç 1 yaşında ilk diş hekimi muayenesi yapılmalıdır. Amaç tedavi değil, çürük riskini değerlendirmek ve aileye doğru alışkanlıkları öğretmektir." },
  { grup:"Bebekler", ikon:"👶", baslik:"Emzik ve parmak emme",
    ozet:"Uzun süreli kullanım diş dizilimini bozabilir.",
    govde:"2-3 yaşından sonra devam eden yoğun emzik/parmak emme, ön dişlerde açıklık ve damak şeklinde değişikliğe yol açabilir. Damak yapısına uyumlu (ortodontik) emzikler daha az etkili olur; bırakma süreci kademeli yapılmalıdır." },
  { grup:"Bebekler", ikon:"👶", baslik:"Bebeğe şekerli içecek ne zaman?",
    ozet:"İlk 2 yıl şeker ilavesiz beslenme önerilir.",
    govde:"Dünya Sağlık Örgütü ve çocuk diş hekimliği dernekleri ilk 2 yılda ilave şekerden kaçınılmasını önerir. Meyve suları, hazır meyveli yoğurtlar ve bebek bisküvileri sık görülen gizli şeker kaynaklarıdır." },

  /* ---- ÇOCUKLAR (3-12 yaş) ---- */
  { grup:"Çocuklar", ikon:"🧒", baslik:"Süt dişleri neden önemli?",
    ozet:"Çene gelişimi, konuşma ve kalıcı diş konumu için kritik.",
    govde:"Süt dişleri yalnızca çiğneme için değil; çene-yüz gelişimi, konuşma becerisi ve kalıcı dişlerin doğru yerden çıkması için de kritik rol oynar. Erken kaybedilen bir süt dişi, kalıcı dişte sıralanma bozukluğuna yol açabilir." },
  { grup:"Çocuklar", ikon:"🧒", baslik:"Çocuklarda fırçalama eğitimi",
    ozet:"5-6 yaşa kadar yetişkin kontrolü şart.",
    govde:"5-6 yaşına kadar fırçalamayı bir yetişkin yapmalı veya yakından kontrol etmelidir. 3 yaşına kadar bezelye tanesi büyüklüğünde florürsüz, sonrasında florürlü diş macunu kullanımı önerilir." },
  { grup:"Çocuklar", ikon:"🧒", baslik:"Süt dişleri ne zaman dökülür?",
    ozet:"5,5-6 yaşında başlar, 11-12 yaşına kadar sürer.",
    govde:"Süt dişleri genellikle 5,5-6 yaş civarında dökülmeye başlar ve bu süreç yaklaşık 11-12 yaşına kadar sürer. Toplam 20 süt dişinin yerini kalıcı dişler alır." },
  { grup:"Çocuklar", ikon:"🧒", baslik:"Fissür örtücü (koruyucu dolgu) nedir?",
    ozet:"Azı dişlerinde çürüğü önleyen ağrısız uygulama.",
    govde:"Azı dişlerinin çiğneme yüzeyindeki derin çukur ve oyuklara uygulanan koruyucu bir tabakadır. Diş dokusu kesilmeden, ağrısız yapılır ve çürük oluşumunu belirgin şekilde azaltır. Genellikle 6 yaş dişleri ve 12 yaş dişleri çıktıktan hemen sonra uygulanır." },
  { grup:"Çocuklar", ikon:"🧒", baslik:"Çocuğumun diş hekimi korkusu var",
    ozet:"Sakin anlatım, korkutucu kelimelerden kaçınma.",
    govde:"Ziyaret öncesi sakince ve basit dille anlatım yapılmalı, 'iğne' gibi korkutucu kelimelerden kaçınılmalı, geçmişteki kötü deneyimler çocuğun yanında konuşulmamalıdır. Çocuk diş hekimliği (pedodonti) yaklaşımı süreci çok kolaylaştırır." },
  { grup:"Çocuklar", ikon:"🧒", baslik:"Diş çürüğü bulaşıcı mı?",
    ozet:"Evet — tükürük yoluyla bulaşabilir.",
    govde:"Çürüğe neden olan bakteriler, özellikle bakım veren kişilerin tükürüğü yoluyla bebeğe geçebilir. Kaşığı ortak kullanmamak, emziği ağza alıp temizlememek gibi basit önlemler bulaşmayı azaltır." },
  { grup:"Çocuklar", ikon:"🧒", baslik:"Okul çağında beslenme ve kantin",
    ozet:"Öğün arası atıştırmalık, çürük riskini artırır.",
    govde:"Çürük riskinde öğün sayısı kadar atıştırma sıklığı da belirleyicidir. Günde 3 ana öğün + en fazla 1 ara öğün önerilir. Kuru meyve, kraker ve meyveli süt gibi 'sağlıklı görünen' ürünler dişe yapışıp uzun süre kalabilir." },
  { grup:"Çocuklar", ikon:"🧒", baslik:"Diş koruyucu (mouthguard) ne zaman?",
    ozet:"Temas sporlarında diş travmasını önler.",
    govde:"Basketbol, boks, güreş, futbol gibi temas sporlarında kişiye özel diş koruyucu kullanımı, diş kırılması ve avülsiyon (dişin tamamen çıkması) riskini belirgin azaltır. Hazır olanlar yerine hekimin hazırladığı koruyucular daha iyi korur." },
  { grup:"Çocuklar", ikon:"🧒", baslik:"Flör (florür) uygulaması güvenli mi?",
    ozet:"Doğru dozlama ile güvenli ve etkilidir.",
    govde:"Hekim tarafından uygulanan topikal florür verniği/jeli, çürük riskini azaltan, güvenli ve ağrısız bir koruyucu işlemdir. Sıklığı çürük riskine göre 6 ayda bir veya yılda bir olarak belirlenir." },
  { grup:"Çocuklar", ikon:"🧒", baslik:"Çocukta diş ağrısı gece artıyorsa",
    ozet:"Genellikle diş siniri etkilenmiş demektir.",
    govde:"Gece artan, uykudan uyandıran zonklayıcı ağrı çoğunlukla diş sinirinin (pulpa) etkilendiğini gösterir. Bu durumda geçici ağrı kesici dışında evde kalıcı çözüm yoktur; mümkün olan en kısa sürede muayene gerekir." },

  /* ---- YETİŞKİNLER ---- */
  { grup:"Yetişkinler", ikon:"🧑", baslik:"Diş eti iltihabı (gingivitis)",
    ozet:"Geri döndürülebilir ilk evre.",
    govde:"Diş eti hastalığının ilk ve geri döndürülebilir evresidir. Diş etlerinde kızarıklık, şişlik ve fırçalarken kanama görülür. Düzenli fırçalama, diş ipi ve profesyonel temizlikle tamamen iyileşebilir." },
  { grup:"Yetişkinler", ikon:"🧑", baslik:"Periodontitis (ileri diş eti hastalığı)",
    ozet:"Erişkinlerde diş kaybının önde gelen nedeni.",
    govde:"Tedavi edilmeyen gingivitis, dişleri destekleyen kemik ve dokularda geri dönüşü zor hasara yol açan periodontitise ilerleyebilir. Erişkinlerde diş kaybının en sık nedenlerinden biridir; erken teşhis çok önemlidir." },
  { grup:"Yetişkinler", ikon:"🧑", baslik:"Diş eti çekilmesini önlemek",
    ozet:"Yumuşak fırça, 6 aylık kontrol, taş temizliği.",
    govde:"Düzenli 6 aylık kontroller, doğru teknikle ve çok sert olmayan kıllı fırça kullanımı, düzenli profesyonel diş taşı temizliği diş eti çekilmesi riskini azaltır. Sert fırçalama ve diş gıcırdatma en sık hızlandırıcı etkenlerdir." },
  { grup:"Yetişkinler", ikon:"🧑", baslik:"Diş beyazlatma güvenli mi?",
    ozet:"Hekim kontrolünde güvenli; hamilelikte ertelenmeli.",
    govde:"Diş hekimi kontrolünde yapılan profesyonel beyazlatma, mineye kalıcı hasar vermeden güvenli şekilde uygulanır. Hamilelikte, emzirme döneminde ve aşırı hassasiyet durumunda ertelenmesi önerilir." },
  { grup:"Yetişkinler", ikon:"🧑", baslik:"Sigara ağız sağlığını nasıl etkiler?",
    ozet:"İyileşmeyi yavaşlatır, implant riskini artırır.",
    govde:"Sigara ve tütün ürünleri periodontal hastalık riskini belirgin artırır, iyileşmeyi yavaşlatır ve implant başarısızlığı riskini yükseltir. Ağız kokusu, dişte renklenme ve tat alma azalması da sık görülür. Bırakmak diş eti sağlığı için en etkili adımlardan biridir." },
  { grup:"Yetişkinler", ikon:"🧑", baslik:"Diş eti sağlığı ve genel sağlık",
    ozet:"Ağızdaki kronik iltihap vücudu etkiler.",
    govde:"Bilimsel çalışmalar, ağızdaki kronik iltihabın vücudun başka bölgelerini de etkileyebileceğini; periodontal hastalığın kalp-damar sağlığı ve kan şekeri kontrolüyle ilişkili olabileceğini göstermektedir. Bu da düzenli diş eti bakımını genel sağlık için önemli kılar." },
  { grup:"Yetişkinler", ikon:"🧑", baslik:"Elektrikli mi, manuel fırça mı?",
    ozet:"Elektrikli avantajlı; doğru teknik şart.",
    govde:"Çalışmalar elektrikli (özellikle osilasyon-dönüş yapan) fırçaların plak temizliğinde manuel fırçalara göre klinik olarak daha etkili olabildiğini gösteriyor. Ancak doğru teknikle kullanılan manuel fırça da yeterli temizliği sağlayabilir. Önemli olan 2 dakika ve tüm yüzeylere ulaşmaktır." },
  { grup:"Yetişkinler", ikon:"🧑", baslik:"Beslenme ve diş eti sağlığı",
    ozet:"Şeker azalt, omega-3 ve kalsiyum artır.",
    govde:"Şeker ve rafine karbonhidratı sınırlamak; kalsiyum-magnezyum açısından zengin besinler (süt ürünleri, badem, yeşil yapraklılar) ve omega-3 tüketmek diş eti iltihabına karşı koruyucu olabilir." },
  { grup:"Yetişkinler", ikon:"🧑", baslik:"Diş gıcırdatma (bruksizm)",
    ozet:"Sabah çene ağrısı ve aşınma varsa muayene.",
    govde:"Uykuda istemsiz diş sıkma/gıcırdatma; diş minesinde aşınma, çatlak, çene eklemi ağrısı ve baş ağrısına yol açabilir. Hekimin hazırladığı gece plağı (gece koruyucusu) dişleri ve eklemi korur." },
  { grup:"Yetişkinler", ikon:"🧑", baslik:"Ne sıklıkla kontrol?",
    ozet:"Genel öneri 6 ayda bir; risk durumuna göre değişir.",
    govde:"Çoğu kişi için 6 ayda bir kontrol ve temizlik uygundur. Diş eti hastalığı geçirdiyseniz, sigara kullanıyorsanız, diyabetiniz varsa veya ağız kuruluğu ilacı kullanıyorsanız hekiminiz 3-4 aylık aralık önerebilir." },
  { grup:"Yetişkinler", ikon:"🧑", baslik:"Ağız kuruluğu (kserostomi)",
    ozet:"Tükürük azalınca çürük ve diş eti riski artar.",
    govde:"Tükürük koruyucu bir kalkandır. Bazı ilaçlar (antidepresan, tansiyon, alerji ilaçları), şeker hastalığı ve radyoterapi tükürüğü azaltır. Su içmek, şekersiz sakız (ksilitol) çiğnemek ve florürlü ürünler kullanmak riski azaltır." },

  /* ---- 65 YAŞ VE ÜZERİ ---- */
  { grup:"Yaşlılar", ikon:"🧓", baslik:"65 yaş sonrası ağız sağlığı",
    ozet:"Ağız kuruluğu, kök çürüğü ve diş eti öne çıkar.",
    govde:"Yaşla birlikte tükürük azalması, diş eti çekilmesi ve kök yüzeyi çürükleri sıklaşır. Kök yüzeyi minesiz olduğu için çürük daha hızlı ilerler. Florürlü ürünler ve düzenli kontrol bu grupta daha da önemlidir." },
  { grup:"Yaşlılar", ikon:"🧓", baslik:"Protez (takma diş) bakımı",
    ozet:"Her yemekten sonra çıkarıp temizleyin.",
    govde:"Hareketli protezler her yemekten sonra çıkarılıp akan su altında fırçalanmalı, gece çıkarılıp temiz suda bekletilmelidir. Protez altında kalan mukoza her gün kontrol edilmelidir — uzun süre iyileşmeyen yaralar mutlaka değerlendirilmelidir." },
  { grup:"Yaşlılar", ikon:"🧓", baslik:"İlaç kullanımı ve diş sağlığı",
    ozet:"Birçok ilaç ağız kuruluğu yapar.",
    govde:"Tansiyon, depresyon, alerji ve idrar söktürücü ilaçların önemli kısmı ağız kuruluğuna yol açar. İlaçlarınızı kesinlikle kendi başınıza bırakmayın; hekiminize kullandığınız ilaçları söyleyin, koruyucu önlem planlanabilir." },
  { grup:"Yaşlılar", ikon:"🧓", baslik:"Ağız kanseri farkındalığı",
    ozet:"2 haftadan uzun süren yara takip edilmeli.",
    govde:"Ağız içinde 2 haftadan uzun süren, iyileşmeyen yara; beyaz veya kırmızı plak; açıklanamayan kanama veya uyuşma mutlaka değerlendirilmelidir. Sigara ve alkol kullanımı riski artırır. Erken teşhis hayat kurtarır." },

  /* ---- ÖZEL DURUMLAR ---- */
  { grup:"Özel Durumlar", ikon:"🤰", baslik:"Hamilelikte diş sağlığı",
    ozet:"Tedavi için en uygun dönem 2. trimester.",
    govde:"Hamilelikte hormonal değişikliklere bağlı diş eti şişmesi ve kanama artar ('hamilelik gingivitisi'). Acil olmayan tedaviler için genellikle 2. trimester (14-20. hafta) tercih edilir. Rutin kontrol ve temizlik her trimesterde yapılabilir. Diş hekiminize hamile olduğunuzu mutlaka söyleyin." },
  { grup:"Özel Durumlar", ikon:"🤱", baslik:"Emzirme döneminde diş sağlığı",
    ozet:"Emzirme dişlerden kalsiyum çekmez — bu bir mittir.",
    govde:"Emzirmenin dişlerden kalsiyum çektiği inanışı doğru değildir. Ancak sık ve uzun emzirme, özellikle gece beslenmesi bebekte çürük riskini artırabilir. Annede ise uykusuzluk ve atlanan fırçalama diş eti sorunlarını artırabilir." },
  { grup:"Özel Durumlar", ikon:"🩸", baslik:"Diyabet ve diş sağlığı",
    ozet:"Çift yönlü ilişki: kan şekeri ↔ diş eti.",
    govde:"Kan şekeri kontrolü bozuk olduğunda diş eti iltihabı daha sık ve şiddetli görülür; diş eti iltihabı da kan şekeri kontrolünü zorlaştırır. Diyabetli hastalarda 3-4 aylık kontrol ve titiz ağız bakımı önerilir. İşlem öncesi kan şekeri durumu hekimle paylaşılmalıdır." },
  { grup:"Özel Durumlar", ikon:"❤️", baslik:"Kalp hastalığı ve diş tedavisi",
    ozet:"Bazı durumlarda işlem öncesi koruyucu antibiyotik.",
    govde:"Kalp kapak hastalığı, kapak protezi veya geçirilmiş endokardit öyküsü varsa bazı diş işlemleri öncesi koruyucu antibiyotik gerekebilir. Kan sulandırıcı kullanıyorsanız işlem öncesi hekiminize ve kardiyoloğunuza danışın; ilacı kendi başınıza bırakmayın." },
  { grup:"Özel Durumlar", ikon:"🎗️", baslik:"Kanser tedavisi görenlerde ağız bakımı",
    ozet:"İşlem öncesi diş kontrolü önem taşır.",
    govde:"Kemoterapi ve özellikle baş-boyun radyoterapisi ağızda yara, kuruluk ve enfeksiyon riskini artırır. Mümkünse tedavi başlamadan önce diş kontrolü yapılmalı ve enfeksiyon kaynakları giderilmelidir. Yumuşak fırça ve tuzlu-karbonatlı gargara sık önerilir." },
  { grup:"Özel Durumlar", ikon:"🚭", baslik:"Sigara bırakma ve ağız sağlığı",
    ozet:"Bıraktıktan sonra iyileşme hızla düzelir.",
    govde:"Sigara bırakıldıktan sonra diş eti kan dolaşımı ve iyileşme kapasitesi belirgin şekilde düzelir. Diş eti kanaması bırakma sonrası kısa süre artabilir — bu iyileşmenin işaretidir, korkulmamalıdır. İmplant planlanan hastalarda sigara bırakma başarı oranını belirgin artırır." },
  { grup:"Özel Durumlar", ikon:"🧠", baslik:"Diş hekimi korkusu (dental anksiyete)",
    ozet:"Söylemekten çekinmeyin — planlanabilir bir durum.",
    govde:"Diş hekimi korkusu çok yaygındır ve utanılacak bir şey değildir. Randevu öncesi bunu ekibe söylemek; yavaş ilerleme, işaretle durdurma anlaşması, kulaklıkla müzik gibi yöntemlerin planlanmasını sağlar. Ağrısız (lokal anestezi) yaklaşım tüm işlemlerde uygulanır." },
  { grup:"Özel Durumlar", ikon:"♿", baslik:"Engelli bireylerde ağız bakımı",
    ozet:"Düzenli kısa seanslar, destekleyici yaklaşım.",
    govde:"Fiziksel veya bilişsel engeli olan bireylerde ağız bakımı desteğe ihtiyaç duyabilir. Özel tutamaçlı fırçalar, elektrikli fırça ve oturmaya uygun pozisyonlama işleri kolaylaştırır. Kısa ve sık seanslar, tanıdık ekip ve rutin oluşturmak tedaviye uyumu artırır." },
  { grup:"Özel Durumlar", ikon:"🌙", baslik:"Ramazan'da ağız sağlığı",
    ozet:"İftar sonrası fırçalama, sahurda su.",
    govde:"Oruç ağız kuruluğunu artırabilir. İftar sonrası ve yatmadan önce fırçalamak, sahurda su içmek ve ağız kokusunu bastırmak için diş ipi kullanmak etkilidir. Oruçluyken diş macunu yutma riskine karşı fırçalamayı iftar-sahur arasına almak daha rahattır. Ağız kokusu ısrarcıysa altta yatan diş eti sorunu araştırılmalıdır." },
];

/* --- Tedavi rehberi (prosedür rehberleri: en çok dönüşen içerik türü) --- */
const BI_TEDAVI = [
  { id:"muayene", ad:"Muayene ve Kontrol", ikon:"🩺",
    nedir:"Ağız içi dokuların ve dişlerin sistematik değerlendirilmesi.",
    neZaman:"6 ayda bir, şikayet olmasa da.",
    seans:"1", sure:"15-20 dk", agri:"Yok",
    sonrasi:"Gerekirse röntgen alınır, size özel tedavi planı çıkarılır.",
    bakim:"Yılda 2 kez tekrarlanması önerilir." },
  { id:"temizlik", ad:"Diş Taşı Temizliği (Detertraj)", ikon:"🪥",
    nedir:"Ultrasonik cihazla diş taşı ve plak temizliği, ardından parlatma.",
    neZaman:"6 ayda bir; diş eti kanaması varsa daha sık.",
    seans:"1", sure:"20-30 dk", agri:"Yok (hafif hassasiyet olabilir)",
    sonrasi:"İlk 1-2 gün soğuk-sıcak hassasiyeti normaldir, kendiliğinden geçer.",
    bakim:"Günde 2 kez fırçalama + günlük diş ipi." },
  { id:"dolgu", ad:"Dolgu (Kompozit)", ikon:"🦷",
    nedir:"Çürüğün temizlenip diş rengiyle uyumlu kompozit malzeme ile doldurulması.",
    neZaman:"Çürük diş sinirine ulaşmadan önce.",
    seans:"1", sure:"20-40 dk", agri:"Lokal anestezi ile ağrısız",
    sonrasi:"Anestezi geçene kadar (2-3 saat) yemek yenmemeli. Dolgu yüksekliği varsa kontrol ettirin.",
    bakim:"Şeker sıklığını azaltmak, düzenli fırçalama." },
  { id:"kanal", ad:"Kanal Tedavisi (Endodonti)", ikon:"🔬",
    nedir:"Diş içindeki iltihaplı sinir dokusunun temizlenip kanalların doldurulması.",
    neZaman:"Gece ağrısı, soğuk-sıcağa uzun süren tepki, apse varsa.",
    seans:"1-3", sure:"45-90 dk / seans", agri:"Lokal anestezi ile ağrısız",
    sonrasi:"İşlem sonrası 1-2 gün hafif hassasiyet normaldir. Geçici dolgu sertleşene kadar çiğnemeyin.",
    bakim:"Kanal tedavili diş kırılgandır — genellikle üzerine kaplama önerilir ve düzenli kontrol gerekir." },
  { id:"cekim", ad:"Diş Çekimi", ikon:"🩹",
    nedir:"Kurtarılamayan dişin çıkarılması.",
    neZaman:"İleri çürük, ileri diş eti hastalığı, kırık, gömülü diş.",
    seans:"1", sure:"15-45 dk", agri:"Lokal anestezi ile ağrısız",
    sonrasi:"İlk 24 saat: tükürmeyin, sigara içmeyin, sıcak içecek içmeyin, kanamayı ısırarak baskı uygulayın, yüzü soğuk uygulayın. Pipet kullanmayın (pıhtıyı bozar).",
    bakim:"Çekim boşluğu 3-6 ayda kapanır; eksik diş için implant veya köprü planlanabilir." },
  { id:"gomulu", ad:"Gömülü 20'lik Diş", ikon:"🦷",
    nedir:"Çene kemiği içinde kalmış, tam çıkamamış yirmilik diş.",
    neZaman:"Ağrı, çevre dişe baskı, çürük, kist veya ortodonti planı varsa.",
    seans:"1", sure:"30-60 dk", agri:"Lokal anestezi ile ağrısız",
    sonrasi:"Çenede 3-5 gün hafif şişlik ve ağrı normaldir. Önerilen ilaçları düzenli kullanın, soğuk kompres uygulayın, yumuşak gıda tüketin.",
    bakim:"İlk 24 saat sigara ve sıcak yiyecek yok. Dikiş varsa kontrol randevusuna gelin." },
  { id:"beyazlatma", ad:"Diş Beyazlatma", ikon:"✨",
    nedir:"Mineye zarar vermeyen özel jel ve ışık sistemiyle diş renginin açılması.",
    neZaman:"Renklenme şikayeti varsa; dolgu ve kaplamalar önce değerlendirilir.",
    seans:"1", sure:"45-60 dk", agri:"Yok (geçici hassasiyet olabilir)",
    sonrasi:"İlk 48 saat boya yapıcı besinlerden kaçının (kahve, çay, kırmızı şarap, sigara, kırmızı sos).",
    bakim:"Sonuç kalıcı değildir; beslenme ve sigara alışkanlığına göre 6-18 ayda tazelenir." },
  { id:"implant", ad:"İmplant", ikon:"🔩",
    nedir:"Eksik diş kökünün yerine titanyum vida yerleştirilip üzerine kalıcı diş yapılması.",
    neZaman:"Eksik diş/ dişler varsa, kemik yeterliyse.",
    seans:"2-3 (cerrahi + üst yapı)", sure:"Kemik kaynaşması ortalama 3-6 ay", agri:"Lokal anestezi ile ağrısız",
    sonrasi:"Cerrahi sonrası birkaç gün şişlik ve hafif ağrı olabilir. İlk hafta sert gıda yok, sigara yok.",
    bakim:"Diş eti hastalığı olan hastalarda idame kritik. 6 ayda bir kontrol + özel ara yüz fırçası ile bakım gerekir." },
  { id:"zirkonyum", ad:"Zirkonyum Kaplama", ikon:"💎",
    nedir:"Dişin az miktarda küçültülüp zirkonyum kaplama ile kaplanması.",
    neZaman:"İleri renklenme, kırık, kanal tedavisi sonrası, şekil düzeltme.",
    seans:"2-3", sure:"7-10 gün", agri:"Lokal anestezi ile ağrısız",
    sonrasi:"Geçici kaplama döneminde sert gıda dikkatli. Yapıştırma sonrası 24 saat çok sıcak-soğuk yemeyin.",
    bakim:"Işığı doğal diş gibi yansıtır, dayanıklıdır; gece plağı sıkma alışkanlığı varsa önerilir." },
  { id:"lamina", ad:"Lamina (Yaprak Porselen)", ikon:"🎨",
    nedir:"Ön dişlerin yalnızca ön yüzeyine yapıştırılan ince porselen tabakalar.",
    neZaman:"Estetik şikayet, renk veya şekil bozukluğu; diş yapısı yeterliyse.",
    seans:"2-3", sure:"7-10 gün", agri:"Lokal anestezi ile ağrısız",
    sonrasi:"İlk gün yapıştırma sonrası diş ipini dikkatli kullanın. Tırnakla açma, sert ısırma gibi alışkanlıklardan kaçının.",
    bakim:"Minimum doku kaybı avantajı sağlar; düzenli kontrol ve doğru bakım ile uzun ömürlüdür." },
  { id:"kopru", ad:"Köprü Protezi", ikon:"🌉",
    nedir:"Eksik dişin iki yanındaki dişler destek alınarak yapılan sabit protez.",
    neZaman:"İmplant uygun değilse ve komşu dişler desteklenebiliyorsa.",
    seans:"2-3", sure:"7-10 gün", agri:"Lokal anestezi ile ağrısız",
    sonrasi:"Köprü altı temizliği zordur; özel iplik fırçası kullanımı öğretilir.",
    bakim:"Destek dişler sağlıklı tutulmazsa köprü başarısız olur — düzenli kontrol şart." },
  { id:"ortodonti", ad:"Ortodonti (Telli Tedavi)", ikon:"📐",
    nedir:"Diş sıralaması ve kapanış bozukluklarının braket-tel sistemiyle düzeltilmesi.",
    neZaman:"Çapraşıklık, kapanış bozukluğu, gömülü diş, çene darlığı.",
    seans:"Aylık kontrol", sure:"6 ay - 2 yıl", agri:"İlk hafta ve her kontrolde hafif ağrı",
    sonrasi:"Tellerin arkasına diş fırçası ulaşmadığı için ara yüz fırçası ve gargara gerekir. Sert-yapışkan gıda telleri koparır.",
    bakim:"Tedavi sonrası pekiştirme (retainer) kullanımı zorunludur, aksi halde dişler geri döner." },
  { id:"plak", ad:"Şeffaf Plak (Clear Aligner)", ikon:"🦷",
    nedir:"Şeffaf, çıkarılabilir plaklarla fark edilmeden diş düzeltme.",
    neZaman:"Hafif-orta çapraşıklık, estetik kaygı ön plandaysa.",
    seans:"4-6 haftada bir kontrol", sure:"6-18 ay", agri:"Plak değişiminde 1-2 gün baskı hissi",
    sonrasi:"Plaklar günde 20-22 saat takılmalı; sadece yemek ve fırçalama için çıkarılır.",
    bakim:"Her çıkarmada yıkanmalı; plakla birlikte su dışında içecek içilmemelidir. Retainer gerekir." },
  { id:"protez", ad:"Hareketli Protez (Takma Diş)", ikon:"🦿",
    nedir:"Tam veya kısmi diş eksikliğinde kullanılan çıkarılabilir protez.",
    neZaman:"Çok sayıda diş eksikse ve sabit çözüm uygun değilse.",
    seans:"3-4", sure:"2-4 hafta", agri:"Genellikle ağrısız, uyum sürecinde vuruk olabilir",
    sonrasi:"İlk günlerde yemek ve konuşma alışması gerekir; vuruk noktaları için ara kontrol yapılır.",
    bakim:"Her yemekten sonra temizlenmeli, gece çıkarılıp temiz suda bekletilmelidir." },
];

/* --- Semptom kontrol (yüksek niyetli arama: en çok ilgi gören içerik) --- */
const BI_SEMPTOM = [
  { id:"agri", ad:"Dişim ağrıyor / zonkluyor", ikon:"😖", acil:"orta",
    nedenler:["Derin çürük (sinire yaklaşmış)", "Diş siniri iltihabı (pulpitis)", "Apse / iltihap birikmesi", "Çatlak diş sendromu", "Yeni dolgu/kaplama yüksekliği"],
    yap:"Ağrıyan tarafı çok sıcak-soğuk ile zorlamayın. Ağrı kesici alabilirsiniz, ancak ağrıyı geçirmek sorunu çözmez. Yüzde şişlik varsa beklemeyin.",
    tedavi:"kanal", sure:"Ağrı kesiciyle 1-2 gün idare edilebilir; gece ağrısı veya şişlik varsa aynı gün muayene." },
  { id:"hassas", ad:"Soğuk-sıcağa hassasiyet", ikon:"🧊", acil:"dusuk",
    nedenler:["Diş eti çekilmesi (kök yüzeyi açığa çıkmış)", "Mine aşınması / sert fırçalama", "Diş taşı temizliği sonrası geçici hassasiyet", "Çürük başlangıcı", "Beyazlatma sonrası"],
    yap:"Hassasiyet giderici diş macunu (florür/potasyum nitrat) 2-4 hafta düzenli kullanın. Sert fırçalamayı bırakın, yatay fırçalamayın.",
    tedavi:"temizlik", sure:"2 haftada geçmezse veya tek bir dişte lokalize ise muayene." },
  { id:"cignerken", ad:"Çiğnerken ağrı", ikon:"🍽️", acil:"orta",
    nedenler:["Yüksek dolgu/kaplama", "Çatlak diş", "Sinir iltihabı", "Periodontal (diş eti) hastalığı", "Çene eklemi sorunu"],
    yap:"O tarafı mümkünse kullanmayın. Ağrının tam olarak hangi dişte olduğunu not edin — hekime çok yardımcı olur.",
    tedavi:"dolgu", sure:"1-3 gün içinde muayene." },
  { id:"kanama", ad:"Diş etim kanıyor", ikon:"🩸", acil:"dusuk",
    nedenler:["Gingivitis (diş eti iltihabı) — en sık", "Sert fırçalama", "Diş taşı birikimi", "İlaç etkisi (kan sulandırıcı)", "Hamilelik hormonları", "Vitamın K/C eksikliği (nadir)"],
    yap:"Kanama nedeniyle fırçalamayı BIRAKMAYIN — yumuşak fırça ile günde 2 kez devam edin, diş ipi ekleyin. Ilık tuzlu su gargarası rahatlatır.",
    tedavi:"temizlik", sure:"2 hafta düzelmezse mutlaka muayene; diş taşı temizliği gerekebilir." },
  { id:"sis", ad:"Diş etim şiş / kızarık", ikon:"🔴", acil:"orta",
    nedenler:["Diş eti iltihabı", "Diş arası apse", "Gömülü diş çevresi iltihabı (perikoronit)", "Protez/dolgu kenarı tahrişi"],
    yap:"Ilık tuzlu su gargarası yapın. Şişlik yüz veya göz altına yayılıyorsa, ateş varsa ACİL değerlendirme gerekir.",
    tedavi:"temizlik", sure:"24-48 saat içinde muayene." },
  { id:"koku", ad:"Ağız kokusu", ikon:"😷", acil:"dusuk",
    nedenler:["Dil sırtındaki bakteriler (%85 kaynak)", "Diş eti hastalığı / cep", "Çürük", "Ağız kuruluğu", "Geniz eti / sinüzit / reflü", "Mide kaynaklı (daha nadir)"],
    yap:"Dil sırtını özel temizleyici veya fırça ile günde 1 kez temizleyin, diş ipi kullanın, bol su için. Şekersiz sakız tükürüğü artırır.",
    tedavi:"temizlik", sure:"2-3 hafta sürerse muayene — kaynağın bulunması gerekir." },
  { id:"sallanma", ad:"Dişim sallanıyor", ikon:"🦷", acil:"orta",
    nedenler:["İleri periodontal hastalık (kemik kaybı)", "Travma", "Apse", "Gebelik hormonları", "Bruksizm (gıcırdatma)"],
    yap:"Çok sert gıda yemeyin, dişi dilinizle sürekli kontrol etmeyin. Sallanan diş çekilmek zorunda değildir — erken müdahale ile tutulabilir.",
    tedavi:"temizlik", sure:"1-3 gün içinde muayene. Diş eti tedavisi planlanır." },
  { id:"kirik", ad:"Dişim kırıldı / çatladı", ikon:"💥", acil:"yuksek",
    nedenler:["Travma / darbe", "Sert bir şeye ısırma", "Kanal tedavili dişin kırılganlığı", "Bruksizm"],
    yap:"Kırık parçayı saklayın (mümkünse süt/tuzlu su içinde). Sivri kenar dilinizi kesiyorsa diş mumu veya şekersiz sakız ile kapatın. Ağrı varsa ağrı kesici alın.",
    tedavi:"dolgu", sure:"Aynı gün muayene önerilir." },
  { id:"yara", ad:"Ağzımda yara / aft", ikon:"😣", acil:"dusuk",
    nedenler:["Aft (rekürren aftöz stomatit)", "Travma (sert fırça, sıcak yemek)", "Uçuk (herpes)", "Stres / uykusuzluk", "B12-demir-folat eksikliği", "Nadir: ağız kanseri"],
    yap:"Sert-baharatlı-asitli gıdadan kaçının, yumuşak fırça kullanın. 2 haftadan uzun süren yara kesinlikle değerlendirilmeli.",
    tedavi:"muayene", sure:"2 haftayı geçtiyse mutlaka muayene." },
  { id:"cene", ad:"Çenem kilitleniyor / ses geliyor", ikon:"🦴", acil:"dusuk",
    nedenler:["Temporomandibular eklem (TME) disfonksiyonu", "Bruksizm / gece sıkma", "Stres ve kas spazmı", "Kapanış bozukluğu"],
    yap:"Çok sert-sakız çiğnemeyi azaltın, çenenizi dinlendirin. Sıcak kompres kasları gevşetir. Ağzınızı çok geniş açmayın (esnerken destekleyin).",
    tedavi:"muayene", sure:"Şikayet sürüyorsa muayene + gece plağı değerlendirmesi." },
  { id:"sari", ad:"Dişlerim sarardı / renklendi", ikon:"🎨", acil:"dusuk",
    nedenler:["Kahve, çay, sigara, kırmızı şarap", "Yaşlanma ile mine incelmesi", "Tetikrasiklin gibi bazı ilaçlar", "Ağız gargarası (klorheksidin) kullanımı", "İç kaynaklı renklenme"],
    yap:"Boya yapıcı içeceklerden sonra su ile çalkalayın, pipet kullanın. Kömür/sert aşındırıcı ürünlerden kaçının — mineyi çizer.",
    tedavi:"beyazlatma", sure:"Rutin muayene ile değerlendirilir; tedavi planı kişiye özeldir." },
  { id:"takma", ad:"Protezim vuruyor / oturmuyor", ikon:"🦿", acil:"dusuk",
    nedenler:["Kemik erimesi sonrası uyum kaybı", "Vuruk noktası", "Protez kırılması", "Yetersiz temizlik sonrası mantar"],
    yap:"Protezi kendiniz zımparalamayın — bu uyumu daha da bozar. Gece çıkarıp dinlendirin, temiz tutun.",
    tedavi:"protez", sure:"1 hafta içinde kontrol; vuruk düzeltmesi kısa bir işlemdir." },
  { id:"cocuk_curuk", ad:"Çocuğumun dişi çürüdü", ikon:"🧒", acil:"orta",
    nedenler:["Biberon/emzik alışkanlığı", "Sık şekerli atıştırma", "Yetersiz fırçalama", "Florür eksikliği"],
    yap:"'Nasılsa dökülecek' diye beklemeyin — süt dişi çürüğü alttaki kalıcı dişi de etkiler. Şeker sıklığını azaltın, fırçalamayı yetişkin yapsın.",
    tedavi:"dolgu", sure:"1 hafta içinde muayene. Ağrı/şişlik varsa daha acil." },
];

/* --- Acil durumlar --- */
const BI_ACIL = [
  { id:"avulsiyon", ad:"Diş tamamen çıktı (travma)", ikon:"🚨",
    adimlar:["Dişi kökünden DEĞİL, tacından (beyaz kısmından) tutun.", "Dişi ovmayın, kurulamayın, suyla yıkamayın.", "Kökünü süt, tuzlu su veya kendi tükürüğünüzde tutun; mümkünse yerine yerleştirin ve hafifçe ısırın.", "Mümkün değilse dişi süt içinde bir kapta taşıyın.", "30 DAKİKA İÇİNDE diş hekimine ulaşın — bu süre başarı şansını belirler."],
    not:"Süt dişi ise yerine yerleştirmeye çalışmayın, kalıcı dişe zarar verebilirsiniz. Vakit kaybetmeden gelin." },
  { id:"kirik", ad:"Diş kırıldı", ikon:"💥",
    adimlar:["Kırık parçayı saklayın (nemli ortamda).", "Ağzı ılık su ile çalkalayın, kanama varsa temiz gazlı bezle 10 dk baskı uygulayın.", "Sivri kenar varsa diş mumu veya şekersiz sakız ile kapatın.", "Soğuk kompres uygulayın (şişlik için).", "Aynı gün kliniğe gelin."],
    not:"Kırıkta sinir açığa çıktıysa hassasiyet ve ağrı olur; geciktirmeyin." },
  { id:"apse", ad:"Yüzde şişlik / apse", ikon:"😰",
    adimlar:["Şişliği SIKMAYIN, açmaya çalışmayın.", "Yüzünüze dışarıdan soğuk kompres uygulayın (10 dk uygula-10 dk dinlen).", "Ağrı kesici alabilirsiniz.", "Bol su için, yeterli uyuyun.", "EN KISA SÜREDE kliniğe gelin."],
    not:"⚠️ Göz altına yayılan şişlik, göz kapanması, yutma güçlüğü, nefes darlığı, yüksek ateş varsa ACİL SERVİSE gidin — bu tablo hayati risk taşıyabilir." },
  { id:"dolgu", ad:"Dolgu/kaplama düştü", ikon:"🦷",
    adimlar:["Boşluğu temiz tutun, çok sıcak-soğuk ve tatlıdan kaçının.", "Diş hassassa hassasiyet giderici macun kullanın.", "Boşluğa pamuk/kalem gibi şeyler sokmayın.", "1-2 gün içinde gelin; dolgu her zaman tekrar yapılabilir."],
    not:"Eski dolgu düştüyse altında çürük olabilir — hekim değerlendirmelidir." },
  { id:"implant", ad:"İmplant gevşedi / kaplama düştü", ikon:"🔩",
    adimlar:["İmplantı zorla sıkıştırmayın, çevirmeyin.", "Üzerindeki dişi (kaplama) çıkardıysanız saklayın, kendiniz yapıştırmayın.", "O bölgeyle çiğnemeyin.", "En kısa sürede gelin."],
    not:"İmplantın tamamen kaybedilmemesi için erken müdahale önemlidir." },
  { id:"kanama", ad:"Kanama durmuyor", ikon:"🩸",
    adimlar:["Temiz gazlı bezi katlayıp bölgeye yerleştirin, 15-20 dakika KESİNTİSİZ ısırın.", "Ara ara kontrol için bez çıkarmayın — pıhtıyı bozar.", "Başınızı yüksekte tutun, oturun (uzanmayın).", "Tükürmeyin, çalkalamayın, pipet kullanmayın.", "20 dk sonra durmadıysa kliniğe gelin."],
    not:"Kan sulandırıcı kullanıyorsanız ve kanama durmuyorsa acil servise başvurun." },
  { id:"cene", ad:"Çene çıktı / kilitlendi", ikon:"🦴",
    adimlar:["Çenenizi zorla kapatmaya çalışmayın.", "Ağzınızı çok geniş açmayın, esnerken elinizle destekleyin.", "Sıcak kompres ile kasları gevşetin.", "Yumuşak gıda tüketin.", "Kliniğe gelin — çıkık ise hekim tarafından yerine oturtulur."],
    not:"Geçici çene kilitlenmesi (ağız açamama) sık görülür ve genellikle tedavi edilebilir." },
  { id:"tel", ad:"Ortodontik tel battı", ikon:"📐",
    adimlar:["Batan ucu ortodontik mumu ile kapatın (yoksa şekersiz sakız).", "Teli kendiniz kesmeyin.", "Ağzı ılık tuzlu su ile çalkalayın.", "Klinikten randevu alın; telin ucu kısaltılır."],
    not:"Uzun süre batmış tel diş etinde yara ve enfeksiyon yapabilir." },
];

/* --- Karşılaştırmalar (karar aşamasındaki hastayı en çok etkileyen içerik) --- */
const BI_KIYAS = [
  { id:"implant_kopru", ad:"İmplant mı, Köprü mü?", ikon:"⚖️",
    a:{ ad:"İmplant", madde:["Komşu dişlere dokunulmaz", "Kemik erimesini durdurur", "Daha uzun ömürlü", "Cerrahi işlem, 3-6 ay süreç", "Kemik yeterliliği gerekir"] },
    b:{ ad:"Köprü", madde:["Daha kısa sürede biter (7-10 gün)", "Cerrahi yok", "Komşu dişler küçültülür", "Altı temizliği zor", "Kemik erimesini durdurmaz"] },
    karar:"Tek diş eksikliğinde ve kemik yeterliyse genellikle implant; komşu dişler zaten kaplama gerektiriyorsa köprü de uygun olabilir. Karar klinik değerlendirme ile verilir." },
  { id:"zirkon_lamina", ad:"Zirkonyum mu, Lamina mı?", ikon:"💎",
    a:{ ad:"Zirkonyum", madde:["Tüm dişi kaplar", "Daha fazla doku kaybı", "Renk ve şekil düzeltmede güçlü", "Kırılma dayanımı yüksek"] },
    b:{ ad:"Lamina", madde:["Yalnızca ön yüzeye yapılır", "Minimum doku kaybı", "Doğal görünüm", "Diş yapısı yeterli olmalı"] },
    karar:"Amaç estetik ve diş yapısı sağlamsa lamina; yapısal sorun, ileri renklenme veya kanal tedavisi öyküsü varsa zirkonyum öne çıkar." },
  { id:"tel_plak", ad:"Telli Ortodonti mi, Şeffaf Plak mı?", ikon:"📐",
    a:{ ad:"Telli", madde:["Karmaşık vakalarda daha güçlü", "Maliyeti genellikle daha düşük", "Görünür", "Yemek kısıtlaması var", "Temizliği zor"] },
    b:{ ad:"Şeffaf Plak", madde:["Neredeyse görünmez", "Çıkarılabilir, yemek serbest", "Temizliği kolay", "Günde 20-22 saat disiplin gerekir", "Her vakaya uygun değil"] },
    karar:"Hafif-orta çapraşıklıkta ve disiplinli kullanımda plak çok iyi sonuç verir. İskeletsel sorunlar ve karmaşık vakalarda tel tercih edilir." },
  { id:"beyaz_klinik", ad:"Klinikte mi, Evde mi Beyazlatma?", ikon:"✨",
    a:{ ad:"Klinikte", madde:["Tek seansta belirgin sonuç", "Hekim kontrolünde", "Daha hızlı", "Geçici hassasiyet olabilir"] },
    b:{ ad:"Evde", madde:["Daha yavaş (2-3 hafta)", "Daha kademeli, az hassasiyet", "Hekimin verdiği plan şart", "Hazır market ürünleri önerilmez"] },
    karar:"Hızlı sonuç isteyene klinik, hassasiyete yatkınlığı olana evde (hekim planıyla) uygun. Hazır/merdiven altı ürünlerden kaçının." },
  { id:"kanal_cekim", ad:"Kanal mı, Çekim mi?", ikon:"🔬",
    a:{ ad:"Kanal Tedavisi", madde:["Doğal diş korunur", "Çene kemiği korunur", "Genellikle 1-3 seans", "Sonrasında kaplama önerilir"] },
    b:{ ad:"Çekim", madde:["Sorun kökten kalkar", "Daha hızlı", "Sonrasında implant/köprü gerekir", "Kemikte erime başlar"] },
    karar:"Diş kurtarılabilir durumdaysa kanal tedavisi hemen her zaman önceliklidir. Çekim son çaredir; yerine mutlaka çözüm planlanmalıdır." },
];

/* --- Bilgi testi --- */
const BI_TEST = [
  { s:"Günde kaç kez ve ne kadar süre diş fırçalanmalı?", sec:["Günde 1 kez, 30 saniye", "Günde 2 kez, 2 dakika", "Günde 3 kez, 1 dakika", "Sadece yemekten sonra"], d:1,
    ac:"Günde en az 2 kez, 2 dakika. Sabah ve özellikle gece yatmadan önce en kritik olanıdır." },
  { s:"Diş eti kanaması olduğunda ne yapmalı?", sec:["Fırçalamayı bırakmalı", "Daha sert fırçalamalı", "Yumuşak fırçayla devam etmeli", "Sadece gargara yapmalı"], d:2,
    ac:"Kanama genellikle iltihap belirtisidir; fırçalamayı bırakmak durumu kötüleştirir. Yumuşak fırça + diş ipi ile devam edilmeli." },
  { s:"Diş ipi ne sıklıkla kullanılmalı?", sec:["Haftada bir", "Ayda bir", "Her gün", "Sadece bir şey sıkışınca"], d:2,
    ac:"Fırça diş aralarına ulaşamaz. Diş ipi (veya ara yüz fırçası) her gün, tercihen gece kullanılmalıdır." },
  { s:"Aşağıdakilerden hangisi diş minesini aşındırır?", sec:["Su", "Süt", "Kola ve asitli içecekler", "Yeşil çay"], d:2,
    ac:"Asitli içecekler mineyi yumuşatır. Yumuşamış mineyi hemen fırçalamak aşındırmayı artırır — 30 dakika beklemek daha iyidir." },
  { s:"Süt dişi çürüğü tedavi edilmezse ne olur?", sec:["Hiçbir şey, nasılsa dökülecek", "Altındaki kalıcı diş de zarar görebilir", "Sadece ağrı olur", "Sadece renk değişir"], d:1,
    ac:"Tedavi edilmeyen süt dişi çürüğü sinire, kemiğe ve altındaki kalıcı diş tomurcuğuna zarar verebilir." },
  { s:"Fırçalamadan sonra ağzı ne kadar suyla çalkalamalı?", sec:["Bol suyla, iyice", "Az miktar suyla, hafifçe veya hiç", "Limonlu suyla", "Gargara ile"], d:1,
    ac:"Bol su çalkalamak florürü uzaklaştırır. Az suyla hafifçe çalkalamak veya tükürmekle yetinmek daha koruyucudur." },
  { s:"Ne sıklıkla diş hekimine gidilmeli?", sec:["Sadece ağrı olunca", "Yılda bir", "6 ayda bir", "5 yılda bir"], d:2,
    ac:"Çoğu kişi için 6 ayda bir uygundur. Diş eti hastalığı, diyabet veya sigara kullanımında 3-4 aylık aralık önerilebilir." },
  { s:"Diş çekiminden sonra ilk 24 saatte hangisi yapılmamalı?", sec:["Soğuk kompres", "Yumuşak gıda", "Pipetle içmek ve tükürmek", "Başı yüksekte tutmak"], d:2,
    ac:"Pipet ve tükürme emme basıncı oluşturup koruyucu pıhtıyı bozar; bu da 'dry socket' denilen ağrılı duruma yol açar." },
  { s:"Diş gıcırdatması (bruksizm) ne yapar?", sec:["Bir şey yapmaz", "Mine aşınması ve çene ağrısı", "Sadece ses çıkarır", "Diş etini güçlendirir"], d:1,
    ac:"Uzun vadede mine aşınması, çatlak, çene eklemi ağrısı ve baş ağrısına yol açar. Gece plağı koruyucudur." },
  { s:"Diş beyazlatma sonrası ilk 48 saat ne yapılmamalı?", sec:["Ilık su içmek", "Kahve ve sigara", "Diş fırçalamak", "Yumuşak gıda yemek"], d:1,
    ac:"Beyazlatma sonrası mine geçici olarak gözeneklidir; boya yapıcı içecek ve sigara sonucu tersine çevirir." },
  { s:"Ağız kokusunun en sık kaynağı neresidir?", sec:["Mide", "Dil sırtındaki bakteriler", "Sinüsler", "Akciğerler"], d:1,
    ac:"Vakaların büyük kısmı dil sırtındaki bakterilerden kaynaklanır. Dil temizliği, diş ipi ve bol su en etkili adımlardır." },
  { s:"Çocukta ilk diş hekimi ziyareti en geç ne zaman olmalı?", sec:["İlkokula başlayınca", "1 yaşında (veya ilk diş çıkınca)", "6 yaşında", "Süt dişleri dökülünce"], d:1,
    ac:"Uluslararası öneri: ilk diş çıkınca ve en geç 1 yaşında. Amaç tedavi değil, koruyucu alışkanlık kazandırmaktır." },
];

/* =====================================================================
   2. ANA EKRAN — renderInfo()
   ===================================================================== */

const BI_SEKME = [
  { id:"semptom",  et:"Semptom Kontrol", ikon:"🔍" },
  { id:"tedavi",   et:"Tedavi Rehberi",  ikon:"🦷" },
  { id:"acil",     et:"Acil Durum",      ikon:"⚡" },
  { id:"bebek",    et:"Bebek",           ikon:"👶" },
  { id:"cocuk",    et:"Çocuk",           ikon:"🧒" },
  { id:"yetiskin", et:"Yetişkin",        ikon:"🧑" },
  { id:"yasli",    et:"65+ Yaş",         ikon:"🧓" },
  { id:"ozel",     et:"Özel Durumlar",   ikon:"🤰" },
  { id:"kiyas",    et:"Karşılaştırma",   ikon:"⚖️" },
  { id:"yanlis",   et:"Doğru Bilinen Yanlışlar", ikon:"❌" },
  { id:"bitki",    et:"Şifalı Bitkiler", ikon:"🌿" },
  { id:"test",     et:"Bilgi Testi",     ikon:"🎯" },
];

function renderInfo() {
  const aktif = (state.infoTab && BI_SEKME.some(s => s.id === state.infoTab)) ? state.infoTab : "semptom";
  const arama = (state.infoArama || "").trim();

  const sekmeler = BI_SEKME.map(s => `
    <button class="chip ${aktif === s.id && !arama ? "chip-active" : ""}"
      data-action="bilgi-sekme" data-id="${s.id}"
      style="white-space:nowrap;flex-shrink:0;">${s.ikon} ${s.et}</button>`).join("");

  const icerik = arama ? bilgiAramaHTML(arama) : bilgiSekmeHTML(aktif);

  return `${topbar("Diş Sağlığı Bilgileri", "Semptom kontrolü, tedavi rehberi ve yaş gruplarına göre bilgiler.", { back: "home" })}
    <div class="content">

      <!-- Arama -->
      <div class="card p4 mb3" style="padding:10px 14px;">
        <div style="display:flex;align-items:center;gap:9px;">
          <span style="font-size:17px;">🔍</span>
          <input id="bilgi-arama" class="input" placeholder="Ara: ağrı, implant, hamilelik, çocuk…"
            value="${escapeAttr(arama)}" autocomplete="off"
            style="border:none;background:transparent;padding:0;font-size:14px;flex:1;outline:none;" />
          ${arama ? `<button data-action="bilgi-arama-temizle" style="background:#ECEFF1;border:none;border-radius:50%;width:26px;height:26px;cursor:pointer;font-size:13px;color:#546E7A;">✕</button>` : ""}
        </div>
      </div>

      ${arama ? "" : `<div class="chip-row mb3" style="flex-wrap:nowrap;overflow-x:auto;gap:7px;padding-bottom:4px;-webkit-overflow-scrolling:touch;">${sekmeler}</div>`}

      ${arama ? "" : `
      <!-- Hızlı erişim -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px;">
        <button data-action="goto" data-screen="fircalama"
          style="display:flex;align-items:center;gap:8px;padding:11px 12px;border-radius:11px;border:1px solid var(--line);background:linear-gradient(135deg,#0B6E86,#0E8FA8);color:#fff;cursor:pointer;text-align:left;">
          <span style="font-size:17px;">⏱️</span>
          <span style="font-size:11.5px;font-weight:700;line-height:1.3;">Fırçalama<br/>Zamanlayıcı</span>
        </button>
        <button data-action="bilgi-sekme" data-id="test"
          style="display:flex;align-items:center;gap:8px;padding:11px 12px;border-radius:11px;border:1px solid var(--line);background:linear-gradient(135deg,#5E35B1,#7E57C2);color:#fff;cursor:pointer;text-align:left;">
          <span style="font-size:17px;">🎯</span>
          <span style="font-size:11.5px;font-weight:700;line-height:1.3;">Bilgi<br/>Testi</span>
        </button>
      </div>`}

      ${icerik}

      <div class="card p4 mb4" style="background:#FFF8E8;border-color:#F0DFAF;">
        <p class="desc" style="margin:0;color:#8A6D1D;font-size:11.5px;line-height:1.5;">
          ⚠️ Bu bölüm <b>yalnızca genel bilgilendirme</b> amaçlıdır; tanı veya tedavi önerisi değildir.
          Şikayetiniz sürüyor ya da şiddetleniyorsa mutlaka diş hekimine başvurun.
        </p>
      </div>
    </div>`;
}

/* --- Arama sonuçları --- */
function bilgiAramaHTML(q) {
  const kucuk = (s) => (s || "").toLocaleLowerCase("tr");
  const esles = (s) => kucuk(s).indexOf(kucuk(q)) !== -1;
  const sonuc = [];

  BI_SEMPTOM.forEach(x => {
    if (esles(x.ad) || (x.nedenler || []).some(esles) || esles(x.yap)) {
      sonuc.push({ tur:"Semptom", ikon:x.ikon, baslik:x.ad,
        ozet:(x.nedenler || [])[0] || "", git:"semptom", id:x.id });
    }
  });
  BI_TEDAVI.forEach(x => {
    if (esles(x.ad) || esles(x.nedir) || esles(x.neZaman)) {
      sonuc.push({ tur:"Tedavi", ikon:x.ikon, baslik:x.ad, ozet:x.nedir, git:"tedavi", id:x.id });
    }
  });
  BI_MAKALE.forEach(x => {
    if (esles(x.baslik) || esles(x.ozet) || esles(x.govde)) {
      sonuc.push({ tur:"Makale", ikon:x.ikon, baslik:x.baslik, ozet:x.ozet, git:x.grup, id:null });
    }
  });
  BI_ACIL.forEach(x => {
    if (esles(x.ad) || (x.adimlar || []).some(esles)) {
      sonuc.push({ tur:"Acil", ikon:x.ikon, baslik:x.ad, ozet:"Acil durum adımları", git:"acil", id:x.id });
    }
  });
  BI_KIYAS.forEach(x => {
    if (esles(x.ad) || esles(x.karar)) {
      sonuc.push({ tur:"Karşılaştırma", ikon:x.ikon, baslik:x.ad, ozet:x.karar, git:"kiyas", id:x.id });
    }
  });
  (typeof MYTHS !== "undefined" ? MYTHS : []).forEach(x => {
    if (esles(x.wrong) || esles(x.right)) {
      sonuc.push({ tur:"Yanlış Bilinen", ikon:"❌", baslik:x.wrong, ozet:x.right, git:"yanlis", id:null });
    }
  });
  (typeof HERBS !== "undefined" ? HERBS : []).forEach(x => {
    if (esles(x.name) || esles(x.helps)) {
      sonuc.push({ tur:"Bitki", ikon:"🌿", baslik:x.name, ozet:x.helps, git:"bitki", id:null });
    }
  });

  if (!sonuc.length) {
    return `<div class="card p4 mb4" style="text-align:center;">
      <p style="font-size:26px;margin:0 0 8px;">🔍</p>
      <p class="name" style="font-size:14px;">Sonuç bulunamadı</p>
      <p class="desc">"${escapeHtml(q)}" için içerik yok. Farklı bir kelime deneyin (örn. "ağrı", "implant", "hamile").</p>
      <button class="btn-primary" style="margin-top:12px;" data-action="goto" data-screen="booking">Randevu Al</button>
    </div>`;
  }

  const kartlar = sonuc.slice(0, 40).map((s, i) => `
    <div class="card p4 mb2" ${s.id ? `data-action="bilgi-ac" data-git="${s.git}" data-id="${s.id}"` : `data-action="bilgi-sekme" data-id="${s.git}"`} style="cursor:pointer;">
      <div style="display:flex;gap:11px;align-items:flex-start;">
        <div style="font-size:19px;flex-shrink:0;">${s.ikon}</div>
        <div style="flex:1;min-width:0;">
          <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:3px;">
            <span style="font-size:9.5px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--teal);background:#E0F3F7;padding:2px 6px;border-radius:5px;">${s.tur}</span>
          </div>
          <p class="name" style="font-size:13.5px;margin:0;">${escapeHtml(s.baslik)}</p>
          ${s.ozet ? `<p class="desc" style="margin:3px 0 0;font-size:11.5px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">${escapeHtml(s.ozet)}</p>` : ""}
        </div>
      </div>
    </div>`).join("");

  return `<p class="desc mb3" style="font-size:12px;"><b>${sonuc.length}</b> sonuç — "${escapeHtml(q)}"</p>${kartlar}`;
}

/* --- Sekme içerikleri --- */
function bilgiSekmeHTML(sekme) {
  switch (sekme) {
    case "semptom":  return biSemptomHTML();
    case "tedavi":   return biTedaviHTML();
    case "acil":     return biAcilHTML();
    case "kiyas":    return biKiyasHTML();
    case "yanlis":   return biYanlisHTML();
    case "bitki":    return biBitkiHTML();
    case "test":     return biTestHTML();
    default:         return biMakaleHTML(sekme);
  }
}

function biKartAcik(x) {
  return state.infoAcik === x;
}

/* Aç/kapa oku — SVG (emoji font desteğine bağımlı değil) */
function biOk(acik, renk) {
  return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${renk || "#90A4AE"}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"
    style="flex-shrink:0;transition:transform .2s;transform:rotate(${acik ? 180 : 0}deg);"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
}

function biDetayKart(anahtar, baslik, icerik, renk) {
  const acik = biKartAcik(anahtar);
  return `<div class="card p4 mb2" style="padding:0;overflow:hidden;border-left:3px solid ${renk || "var(--teal)"};">
    <button data-action="bilgi-ac" data-id="${anahtar}"
      style="width:100%;background:none;border:none;text-align:left;padding:13px 14px;cursor:pointer;display:flex;gap:10px;align-items:flex-start;">
      <div style="flex:1;min-width:0;"><p class="name" style="font-size:13.5px;margin:0;">${baslik}</p></div>
      ${biOk(acik)}
    </button>
    ${acik ? `<div style="padding:0 14px 14px;">${icerik}</div>` : ""}
  </div>`;
}

/* --- SEMPTOM --- */
function biSemptomHTML() {
  const seviye = { yuksek:{ t:"Acil", r:"#C62828", b:"#FFEBEE" }, orta:{ t:"1-3 gün", r:"#E65100", b:"#FFF3E0" }, dusuk:{ t:"Rutin", r:"#2E7D32", b:"#E8F5E9" } };

  const kartlar = BI_SEMPTOM.map(s => {
    const sv = seviye[s.acil] || seviye.dusuk;
    const ted = BI_TEDAVI.find(t => t.id === s.tedavi);
    const icerik = `
      <div style="margin-bottom:10px;">
        <span style="font-size:9.5px;font-weight:800;background:${sv.b};color:${sv.r};padding:3px 8px;border-radius:6px;">${sv.t}</span>
      </div>
      <p style="font-size:11px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin:0 0 5px;">Olası nedenler</p>
      <ul style="margin:0 0 11px;padding-left:17px;font-size:12.5px;color:var(--ink);line-height:1.65;">
        ${s.nedenler.map(n => `<li>${escapeHtml(n)}</li>`).join("")}
      </ul>
      <p style="font-size:11px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin:0 0 5px;">Şimdi ne yapmalı</p>
      <p class="desc" style="margin:0 0 11px;font-size:12.5px;line-height:1.6;">${escapeHtml(s.yap)}</p>
      <p style="font-size:11px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin:0 0 5px;">Ne zaman gelinmeli</p>
      <p class="desc" style="margin:0 0 12px;font-size:12.5px;line-height:1.6;">${escapeHtml(s.sure)}</p>
      <div style="display:flex;gap:7px;">
        <button class="btn-primary" style="flex:1;font-size:12.5px;padding:9px;" data-action="goto" data-screen="booking">Randevu Al</button>
        ${ted ? `<button style="flex:1;font-size:12.5px;padding:9px;border-radius:10px;border:1px solid var(--line);background:var(--surface);cursor:pointer;font-weight:600;" data-action="bilgi-ac" data-git="tedavi" data-id="${ted.id}">${ted.ikon} ${escapeHtml(ted.ad)}</button>` : ""}
      </div>`;

    return `<div class="card p4 mb2" style="padding:0;overflow:hidden;border-left:3px solid ${sv.r};">
      <button data-action="bilgi-ac" data-id="sem-${s.id}"
        style="width:100%;background:none;border:none;text-align:left;padding:13px 14px;cursor:pointer;display:flex;gap:11px;align-items:center;">
        <div style="font-size:20px;flex-shrink:0;">${s.ikon}</div>
        <div style="flex:1;min-width:0;">
          <p class="name" style="font-size:13.5px;margin:0;">${escapeHtml(s.ad)}</p>
          <p class="desc" style="margin:2px 0 0;font-size:11px;">${s.nedenler.length} olası neden · ${sv.t}</p>
        </div>
        ${biOk(biKartAcik("sem-" + s.id))}
      </button>
      ${biKartAcik("sem-" + s.id) ? `<div style="padding:0 14px 14px;">${icerik}</div>` : ""}
    </div>`;
  }).join("");

  return `
    <div class="card p4 mb3" style="background:linear-gradient(135deg,#0B6E86,#0E8FA8);color:#fff;">
      <p style="font-size:13px;font-weight:800;margin:0 0 4px;">🔍 Şikayetinizi seçin</p>
      <p style="font-size:11.5px;opacity:.9;margin:0;line-height:1.5;">Olası nedenleri, şimdi ne yapmanız gerektiğini ve ne zaman gelmeniz gerektiğini görün.</p>
    </div>
    ${kartlar}`;
}

/* --- TEDAVİ REHBERİ --- */
function biTedaviHTML() {
  const kartlar = BI_TEDAVI.map(t => {
    const icerik = `
      <p class="desc" style="margin:0 0 11px;font-size:12.5px;line-height:1.6;">${escapeHtml(t.nedir)}</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:11px;">
        <div style="background:var(--bg);border-radius:9px;padding:8px 10px;">
          <p style="font-size:9.5px;font-weight:800;color:var(--muted);margin:0;text-transform:uppercase;letter-spacing:.04em;">Ne zaman</p>
          <p style="font-size:11.5px;margin:3px 0 0;line-height:1.4;">${escapeHtml(t.neZaman)}</p>
        </div>
        <div style="background:var(--bg);border-radius:9px;padding:8px 10px;">
          <p style="font-size:9.5px;font-weight:800;color:var(--muted);margin:0;text-transform:uppercase;letter-spacing:.04em;">Seans</p>
          <p style="font-size:11.5px;margin:3px 0 0;line-height:1.4;">${escapeHtml(t.seans)}</p>
        </div>
        <div style="background:var(--bg);border-radius:9px;padding:8px 10px;">
          <p style="font-size:9.5px;font-weight:800;color:var(--muted);margin:0;text-transform:uppercase;letter-spacing:.04em;">Süre</p>
          <p style="font-size:11.5px;margin:3px 0 0;line-height:1.4;">${escapeHtml(t.sure)}</p>
        </div>
        <div style="background:var(--bg);border-radius:9px;padding:8px 10px;">
          <p style="font-size:9.5px;font-weight:800;color:var(--muted);margin:0;text-transform:uppercase;letter-spacing:.04em;">Ağrı</p>
          <p style="font-size:11.5px;margin:3px 0 0;line-height:1.4;">${escapeHtml(t.agri)}</p>
        </div>
      </div>
      <p style="font-size:11px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin:0 0 5px;">İşlem sonrası</p>
      <p class="desc" style="margin:0 0 11px;font-size:12.5px;line-height:1.6;">${escapeHtml(t.sonrasi)}</p>
      <p style="font-size:11px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin:0 0 5px;">Uzun vadeli bakım</p>
      <p class="desc" style="margin:0 0 12px;font-size:12.5px;line-height:1.6;">${escapeHtml(t.bakim)}</p>
      <button class="btn-primary" style="width:100%;font-size:12.5px;padding:9px;" data-action="goto" data-screen="booking">Bu tedavi için randevu al</button>`;

    return `<div class="card p4 mb2" style="padding:0;overflow:hidden;">
      <button data-action="bilgi-ac" data-id="ted-${t.id}"
        style="width:100%;background:none;border:none;text-align:left;padding:13px 14px;cursor:pointer;display:flex;gap:11px;align-items:center;">
        <div style="font-size:19px;flex-shrink:0;">${t.ikon}</div>
        <div style="flex:1;min-width:0;"><p class="name" style="font-size:13.5px;margin:0;">${escapeHtml(t.ad)}</p>
          <p class="desc" style="margin:2px 0 0;font-size:11px;">${escapeHtml(t.seans)} seans · ${escapeHtml(t.sure)}</p>
        </div>
        ${biOk(biKartAcik("ted-" + t.id))}
      </button>
      ${biKartAcik("ted-" + t.id) ? `<div style="padding:0 14px 14px;">${icerik}</div>` : ""}
    </div>`;
  }).join("");

  return `<div class="card p4 mb3" style="background:linear-gradient(135deg,#0B6E88,#12738C);color:#fff;">
      <p style="font-size:13px;font-weight:800;margin:0 0 4px;">🦷 Tedavi rehberi</p>
      <p style="font-size:11.5px;opacity:.9;margin:0;line-height:1.5;">Her tedavi için süre, seans, ağrı durumu ve sonrası bakım bilgisi.</p>
    </div>${kartlar}`;
}

/* --- ACİL --- */
function biAcilHTML() {
  const kartlar = BI_ACIL.map(a => {
    const anahtar = "aci-" + a.id;
    const icerik = `
      <div style="background:#FFEBEE;border-radius:9px;padding:10px 12px;margin-bottom:11px;">
        <p style="font-size:11px;font-weight:800;color:#C62828;margin:0 0 6px;text-transform:uppercase;letter-spacing:.04em;">Yapılacaklar (sırayla)</p>
        <ol style="margin:0;padding-left:17px;font-size:12.5px;line-height:1.75;color:#B71C1C;">
          ${a.adimlar.map(x => `<li>${escapeHtml(x)}</li>`).join("")}
        </ol>
      </div>
      <p class="desc" style="margin:0 0 12px;font-size:11.5px;line-height:1.55;color:#E65100;">⚠️ ${escapeHtml(a.not)}</p>
      <a href="tel:05051050302" class="btn-primary" style="display:block;text-align:center;text-decoration:none;font-size:12.5px;padding:10px;">📞 Hemen Ara: 0505 105 03 02</a>`;

    return `<div class="card p4 mb2" style="padding:0;overflow:hidden;border-left:3px solid #C62828;">
      <button data-action="bilgi-ac" data-id="${anahtar}"
        style="width:100%;background:none;border:none;text-align:left;padding:13px 14px;cursor:pointer;display:flex;gap:11px;align-items:center;">
        <div style="font-size:20px;flex-shrink:0;">${a.ikon}</div>
        <div style="flex:1;min-width:0;"><p class="name" style="font-size:13.5px;margin:0;">${escapeHtml(a.ad)}</p></div>
        ${biOk(biKartAcik(anahtar))}
      </button>
      ${biKartAcik(anahtar) ? `<div style="padding:0 14px 14px;">${icerik}</div>` : ""}
    </div>`;
  }).join("");

  return `<div class="card p4 mb3" style="background:linear-gradient(135deg,#C62828,#E53935);color:#fff;">
      <p style="font-size:13px;font-weight:800;margin:0 0 4px;">⚡ Acil durumlar</p>
      <p style="font-size:11.5px;opacity:.92;margin:0;line-height:1.5;">Diş travması, apse, durmayan kanama… Ne yapacağınızı adım adım okuyun.</p>
    </div>
    ${kartlar}
    <div class="card p4 mb3" style="background:#FFF3E0;border-color:#FFCC80;">
      <p class="desc" style="margin:0;font-size:11.5px;color:#E65100;line-height:1.55;">
        <b>Unutmayın:</b> Yüzdeki şişlik göz altına yayılıyor, yutma veya nefes almada zorluk varsa vakit kaybetmeden <b>acil servise</b> gidin.
      </p>
    </div>`;
}

/* --- MAKALELER (yaş grupları) --- */
function biMakaleHTML(grup) {
  const harita = { bebek:"Bebekler", cocuk:"Çocuklar", yetiskin:"Yetişkinler", yasli:"Yaşlılar", ozel:"Özel Durumlar" };
  const g = harita[grup] || "Yetişkinler";
  const liste = BI_MAKALE.filter(a => a.grup === g);

  // Eski ARTICLES dizisini de ekle (uyumluluk)
  const eski = (typeof ARTICLES !== "undefined" ? ARTICLES.filter(a => a.group === g) : []);

  const yeniKart = liste.map((a, i) => {
    const anahtar = "mak-" + grup + "-" + i;
    const acik = biKartAcik(anahtar);
    return `<div class="card p4 mb2" style="padding:0;overflow:hidden;">
      <button data-action="bilgi-ac" data-id="${anahtar}"
        style="width:100%;background:none;border:none;text-align:left;padding:13px 14px;cursor:pointer;display:flex;gap:11px;align-items:center;">
        <div style="font-size:18px;flex-shrink:0;">${a.ikon}</div>
        <div style="flex:1;min-width:0;">
          <p class="name" style="font-size:13.5px;margin:0;">${escapeHtml(a.baslik)}</p>
          <p class="desc" style="margin:2px 0 0;font-size:11px;">${escapeHtml(a.ozet)}</p>
        </div>
        ${biOk(acik)}
      </button>
      ${acik ? `<div style="padding:0 14px 14px;"><p class="desc" style="margin:0;font-size:12.5px;line-height:1.65;">${escapeHtml(a.govde)}</p></div>` : ""}
    </div>`;
  }).join("");

  const eskiKart = eski.map((a, i) => {
    const anahtar = "eski-" + grup + "-" + i;
    const acik = biKartAcik(anahtar);
    return `<div class="card p4 mb2" style="padding:0;overflow:hidden;">
      <button data-action="bilgi-ac" data-id="${anahtar}"
        style="width:100%;background:none;border:none;text-align:left;padding:13px 14px;cursor:pointer;display:flex;gap:11px;align-items:center;">
        <div style="font-size:18px;flex-shrink:0;">📄</div>
        <div style="flex:1;min-width:0;"><p class="name" style="font-size:13.5px;margin:0;">${escapeHtml(a.title)}</p></div>
        ${biOk(acik)}
      </button>
      ${acik ? `<div style="padding:0 14px 14px;"><p class="desc" style="margin:0;font-size:12.5px;line-height:1.65;">${escapeHtml(a.body)}</p></div>` : ""}
    </div>`;
  }).join("");

  const basliklar = { Bebekler:"👶 Bebekler (0-3 yaş)", Çocuklar:"🧒 Çocuklar (3-12 yaş)", Yetişkinler:"🧑 Yetişkinler", Yaşlılar:"🧓 65 yaş ve üzeri", "Özel Durumlar":"🤰 Özel durumlar" };

  return `
    <div class="card p4 mb3">
      <p style="font-size:13.5px;font-weight:800;margin:0;">${basliklar[g] || g}</p>
      <p class="desc" style="margin:4px 0 0;font-size:11.5px;">${liste.length + eski.length} bilgi kartı · başlığa dokunun</p>
    </div>
    ${grup === "bebek" ? `<div class="card p4 mb3" style="padding:0;overflow:hidden;"><img src="info-toothache.jpg" style="width:100%;display:block;" alt="Diş sağlığı bilgi kartı" /></div>` : ""}
    ${yeniKart}${eskiKart}`;
}

/* --- KARŞILAŞTIRMA --- */
function biKiyasHTML() {
  return BI_KIYAS.map(k => {
    const anahtar = "kiy-" + k.id;
    const icerik = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:11px;">
        <div style="background:#E8F5E9;border-radius:9px;padding:10px;">
          <p style="font-size:11.5px;font-weight:800;color:#2E7D32;margin:0 0 6px;">${escapeHtml(k.a.ad)}</p>
          <ul style="margin:0;padding-left:14px;font-size:11px;line-height:1.6;color:#1B5E20;">
            ${k.a.madde.map(m => `<li>${escapeHtml(m)}</li>`).join("")}
          </ul>
        </div>
        <div style="background:#E3F2FD;border-radius:9px;padding:10px;">
          <p style="font-size:11.5px;font-weight:800;color:#1565C0;margin:0 0 6px;">${escapeHtml(k.b.ad)}</p>
          <ul style="margin:0;padding-left:14px;font-size:11px;line-height:1.6;color:#0D47A1;">
            ${k.b.madde.map(m => `<li>${escapeHtml(m)}</li>`).join("")}
          </ul>
        </div>
      </div>
      <p style="font-size:11px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin:0 0 5px;">Nasıl karar verilir</p>
      <p class="desc" style="margin:0 0 12px;font-size:12.5px;line-height:1.6;">${escapeHtml(k.karar)}</p>
      <button class="btn-primary" style="width:100%;font-size:12.5px;padding:9px;" data-action="goto" data-screen="booking">Muayene ile netleştir</button>`;

    return `<div class="card p4 mb2" style="padding:0;overflow:hidden;">
      <button data-action="bilgi-ac" data-id="${anahtar}"
        style="width:100%;background:none;border:none;text-align:left;padding:13px 14px;cursor:pointer;display:flex;gap:11px;align-items:center;">
        <div style="font-size:19px;flex-shrink:0;">${k.ikon}</div>
        <div style="flex:1;min-width:0;"><p class="name" style="font-size:13.5px;margin:0;">${escapeHtml(k.ad)}</p></div>
        ${biOk(biKartAcik(anahtar))}
      </button>
      ${biKartAcik(anahtar) ? `<div style="padding:0 14px 14px;">${icerik}</div>` : ""}
    </div>`;
  }).join("");
}

/* --- YANLIŞLAR --- */
function biYanlisHTML() {
  const liste = (typeof MYTHS !== "undefined" ? MYTHS : []);
  return `
    <div class="card p4 mb3" style="background:linear-gradient(135deg,#5E35B1,#7E57C2);color:#fff;">
      <p style="font-size:13px;font-weight:800;margin:0 0 4px;">❌ Doğru bilinen {n} yanlış</p>
      <p style="font-size:11.5px;opacity:.9;margin:0;line-height:1.5;">Toplumda en yaygın inanışlar ve bilimsel gerçekleri.</p>
    </div>
    ${liste.map(m => `
      <div class="card p4 mb2">
        <div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:9px;">
          <div style="background:#FFEBEE;color:#C62828;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;flex-shrink:0;">✕</div>
          <p class="desc" style="margin:0;font-size:12.5px;line-height:1.55;text-decoration:line-through;text-decoration-color:#EF9A9A;">${escapeHtml(m.wrong)}</p>
        </div>
        <div style="display:flex;gap:10px;align-items:flex-start;">
          <div style="background:#E8F5E9;color:#2E7D32;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;flex-shrink:0;">✓</div>
          <p class="name" style="font-size:12.5px;margin:0;line-height:1.55;font-weight:600;">${escapeHtml(m.right)}</p>
        </div>
      </div>`).join("")}`.replace("{n}", liste.length);
}

/* --- BİTKİLER --- */
function biBitkiHTML() {
  const liste = (typeof HERBS !== "undefined" ? HERBS : []);
  return `
    <div class="card p4 mb3" style="background:#FFF8E8;border-color:#F0DFAF;">
      <p class="desc" style="margin:0;color:#8A6D1D;font-size:11.5px;line-height:1.55;">
        ⚠️ Bu bölüm yalnızca genel bilgi amaçlıdır, tıbbi tavsiye veya tedavi önerisi değildir.
        Şikayetin sürmesi veya şiddetlenmesi durumunda mutlaka diş hekimine başvurunuz.
      </p>
    </div>
    ${liste.map(h => `
      <div class="card p4 mb2">
        <p class="name" style="font-size:13.5px;margin:0 0 7px;">🌿 ${escapeHtml(h.name)}</p>
        <p class="desc" style="margin:0 0 5px;font-size:12px;line-height:1.55;"><b>Ne için:</b> ${escapeHtml(h.helps)}</p>
        <p class="desc" style="margin:0 0 5px;font-size:12px;line-height:1.55;"><b>Nasıl:</b> ${escapeHtml(h.how)}</p>
        <p class="desc" style="margin:0 0 5px;font-size:12px;line-height:1.55;"><b>Miktar:</b> ${escapeHtml(h.amount)}</p>
        <p class="desc" style="margin:0;font-size:12px;line-height:1.55;color:var(--bad);"><b>Dikkat:</b> ${escapeHtml(h.caution)}</p>
      </div>`).join("")}`;
}

/* --- BİLGİ TESTİ --- */
function biTestHTML() {
  const sira = state.testSira || 0;
  const puan = state.testPuan || 0;
  const cevap = state.testCevap;   // seçilen şık index
  const bitti = sira >= BI_TEST.length;

  if (bitti) {
    const yuzde = Math.round((puan / BI_TEST.length) * 100);
    const seviye = yuzde >= 90 ? { t:"Mükemmel! 🏆", r:"#2E7D32", m:"Diş sağlığı bilginiz çok iyi." }
                 : yuzde >= 70 ? { t:"Çok iyi 👏", r:"#2E7D32", m:"İyi bir temeliniz var." }
                 : yuzde >= 50 ? { t:"Fena değil 🙂", r:"#E65100", m:"Birkaç noktayı gözden geçirebilirsiniz." }
                 : { t:"Öğrenmeye devam 🎓", r:"#C62828", m:"Bilgileri okumanızı öneririz — çoğu kolayca düzeltilebilir." };
    return `
      <div class="card p4 mb3" style="text-align:center;background:linear-gradient(135deg,#0B6E86,#0E8FA8);color:#fff;">
        <p style="font-size:11px;font-weight:700;opacity:.85;margin:0;text-transform:uppercase;letter-spacing:.06em;">Sonuç</p>
        <p style="font-size:44px;font-weight:800;margin:6px 0 0;line-height:1;">${puan}/${BI_TEST.length}</p>
        <p style="font-size:15px;font-weight:700;margin:8px 0 0;">${seviye.t}</p>
        <p style="font-size:12px;opacity:.9;margin:6px 0 0;">${seviye.m}</p>
      </div>
      <button class="btn-primary" style="width:100%;margin-bottom:10px;" data-action="bilgi-test-baslat">🔄 Tekrar Çöz</button>
      <button class="btn-primary" style="width:100%;background:var(--surface);color:var(--ink);border:1px solid var(--line);margin-bottom:14px;" data-action="goto" data-screen="booking">Randevu Al</button>`;
  }

  const s = BI_TEST[sira];
  const secenekler = s.sec.map((x, i) => {
    let arka = "var(--surface)", kenar = "var(--line)", renk = "var(--ink)";
    if (cevap !== null && cevap !== undefined) {
      if (i === s.d) { arka = "#E8F5E9"; kenar = "#66BB6A"; renk = "#1B5E20"; }
      else if (i === cevap) { arka = "#FFEBEE"; kenar = "#EF5350"; renk = "#B71C1C"; }
    }
    return `<button data-action="bilgi-test-cevap" data-i="${i}" ${cevap !== null && cevap !== undefined ? "disabled" : ""}
      style="width:100%;text-align:left;padding:11px 13px;margin-bottom:7px;border-radius:10px;border:1.5px solid ${kenar};background:${arka};color:${renk};font-size:12.5px;cursor:${cevap !== null && cevap !== undefined ? "default" : "pointer"};font-weight:600;line-height:1.45;">
      ${String.fromCharCode(65 + i)}) ${escapeHtml(x)}
    </button>`;
  }).join("");

  const aciklama = (cevap !== null && cevap !== undefined) ? `
    <div class="card p4 mb3" style="background:#E0F3F7;border-color:#80DEEA;margin-top:11px;">
      <p style="font-size:11px;font-weight:800;color:#006064;margin:0 0 5px;text-transform:uppercase;letter-spacing:.04em;">${cevap === s.d ? "✅ Doğru" : "❌ Doğru cevap: " + String.fromCharCode(65 + s.d)}</p>
      <p class="desc" style="margin:0;font-size:12.5px;line-height:1.6;color:#006064;">${escapeHtml(s.ac)}</p>
    </div>
    <button class="btn-primary" style="width:100%;margin-bottom:10px;" data-action="bilgi-test-ileri">${sira + 1 >= BI_TEST.length ? "Sonucu Gör" : "Sonraki Soru →"}</button>` : "";

  return `
    <div class="card p4 mb3">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:9px;">
        <p style="font-size:11px;font-weight:800;color:var(--muted);margin:0;text-transform:uppercase;letter-spacing:.05em;">Soru ${sira + 1} / ${BI_TEST.length}</p>
        <p style="font-size:11px;font-weight:700;color:var(--teal);margin:0;">${puan} doğru</p>
      </div>
      <div style="height:5px;background:var(--bg);border-radius:3px;overflow:hidden;margin-bottom:12px;">
        <div style="height:100%;width:${Math.round((sira / BI_TEST.length) * 100)}%;background:var(--teal);border-radius:3px;transition:width .3s;"></div>
      </div>
      <p class="name" style="font-size:14px;line-height:1.5;margin:0;font-weight:700;">${escapeHtml(s.s)}</p>
    </div>
    ${secenekler}
    ${aciklama}`;
}

/* =====================================================================
   3. FIRÇALAMA ZAMANLAYICISI
   ===================================================================== */

const BZ_SURE = 120;      // toplam saniye
const BZ_BOLGE = 30;      // her bölge saniye
const BZ_ADLAR = ["Sağ üst", "Sağ alt", "Sol alt", "Sol üst"];
let bzTimer = null;

function bzSes(frekans, sure) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = frekans || 880;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (sure || 0.22));
    osc.start(); osc.stop(ctx.currentTime + (sure || 0.22) + 0.02);
    setTimeout(() => { try { ctx.close(); } catch (e) {} }, ((sure || 0.22) + 0.3) * 1000);
  } catch (e) {}
}

function bzTitre() {
  try { if (navigator.vibrate) navigator.vibrate(160); } catch (e) {}
}

function bzBasla() {
  bzDurdur();
  state.bzKalan = BZ_SURE;
  state.bzAktif = true;
  render();
  bzTimer = setInterval(() => {
    state.bzKalan = (state.bzKalan || 0) - 1;
    const k = state.bzKalan;
    // bölge değişimlerinde ses
    if (k === 90 || k === 60 || k === 30) { bzSes(1046, 0.28); bzTitre(); }
    if (k <= 0) {
      bzDurdur();
      bzSes(880, 0.2);
      setTimeout(() => bzSes(1108, 0.2), 220);
      setTimeout(() => bzSes(1318, 0.35), 440);
      bzTitre();
      state.bzBitti = true;
      state.bzAktif = false;
      render();
      return;
    }
    // ekranı yeniden çiz (yalnız sayaç alanı)
    const el = document.getElementById("bz-sayac");
    const bar = document.getElementById("bz-bar");
    const bolge = document.getElementById("bz-bolge");
    if (el) {
      const dk = Math.floor(k / 60), sn = k % 60;
      el.textContent = dk + ":" + String(sn).padStart(2, "0");
    }
    if (bar) bar.style.width = Math.round(((BZ_SURE - k) / BZ_SURE) * 100) + "%";
    if (bolge) {
      const idx = Math.min(3, Math.floor((BZ_SURE - k) / BZ_BOLGE));
      bolge.textContent = BZ_ADLAR[idx];
    }
  }, 1000);
}

function bzDurdur() {
  if (bzTimer) { clearInterval(bzTimer); bzTimer = null; }
  state.bzAktif = false;
}

function renderFircalama() {
  const kalan = (state.bzKalan === undefined || state.bzKalan === null) ? BZ_SURE : state.bzKalan;
  const aktif = !!state.bzAktif;
  const bitti = !!state.bzBitti && kalan <= 0;
  const dk = Math.floor(kalan / 60), sn = kalan % 60;
  const idx = Math.min(3, Math.floor((BZ_SURE - kalan) / BZ_BOLGE));
  const streak = state.brushStreak || 0;

  return `${topbar("Fırçalama Zamanlayıcısı", "2 dakika · 4 bölge · günde 2 kez", { back: "info" })}
    <div class="content">
      <div class="card p4 mb3" style="text-align:center;background:linear-gradient(135deg,#0B6E86,#0E8FA8);color:#fff;padding:26px 18px;">
        <p id="bz-bolge" style="font-size:12px;font-weight:700;opacity:.9;margin:0 0 6px;text-transform:uppercase;letter-spacing:.08em;min-height:16px;">
          ${bitti ? "Tamamlandı! 🎉" : aktif ? BZ_ADLAR[idx] : "Hazır"}
        </p>
        <p id="bz-sayac" style="font-size:52px;font-weight:800;margin:0;line-height:1;font-variant-numeric:tabular-nums;">
          ${dk}:${String(sn).padStart(2, "0")}
        </p>
        <div style="height:7px;background:rgba(255,255,255,.22);border-radius:4px;overflow:hidden;margin:16px 0 0;">
          <div id="bz-bar" style="height:100%;width:${Math.round(((BZ_SURE - kalan) / BZ_SURE) * 100)}%;background:#fff;border-radius:4px;transition:width .9s linear;"></div>
        </div>
      </div>

      <div style="display:flex;gap:8px;margin-bottom:14px;">
        ${aktif
          ? `<button class="btn-primary" style="flex:1;background:#C62828;" data-action="bz-durdur">⏸ Durdur</button>`
          : `<button class="btn-primary" style="flex:1;" data-action="bz-basla">${bitti ? "🔄 Tekrar" : "▶️ Başlat"}</button>`}
      </div>

      ${bitti ? `
      <div class="card p4 mb3" style="background:#E8F5E9;border-color:#A5D6A7;text-align:center;">
        <p style="font-size:30px;margin:0 0 6px;">🎉</p>
        <p class="name" style="font-size:14px;margin:0 0 4px;">2 dakika tamamlandı!</p>
        <p class="desc" style="margin:0 0 12px;font-size:12px;">Dişlerini 2 dakika fırçaladın — bu, çürük riskini azaltan en etkili adım.</p>
        <button class="btn-primary" style="width:100%;" data-action="brush-teeth">🔥 Seriye Ekle</button>
      </div>` : ""}

      <div class="card p4 mb3">
        <p class="section-label" style="margin:0 0 10px;">4 bölge · her biri 30 saniye</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          ${BZ_ADLAR.map((b, i) => {
            const secili = aktif && i === idx;
            return `<div style="padding:11px;border-radius:10px;text-align:center;border:1.5px solid ${secili ? "#0B6E86" : "var(--line)"};background:${secili ? "#E0F3F7" : "var(--surface)"};">
              <p style="font-size:16px;margin:0 0 2px;">${["↖️","↙️","↘️","↗️"][i]}</p>
              <p style="font-size:11.5px;font-weight:700;margin:0;color:${secili ? "#006064" : "var(--ink)"};">${b}</p>
            </div>`;
          }).join("")}
        </div>
      </div>

      <div class="card p4 mb3">
        <p class="section-label" style="margin:0 0 10px;">Doğru fırçalama tekniği</p>
        <ol style="margin:0;padding-left:17px;font-size:12.5px;line-height:1.8;color:var(--ink);">
          <li>Fırçayı diş etine <b>45 derece</b> açıyla yerleştir.</li>
          <li>Küçük dairesel hareketler — ileri geri testere gibi değil.</li>
          <li>Bölge başına <b>30 saniye</b>, toplam <b>2 dakika</b>.</li>
          <li>İç yüzeyleri, dış yüzeyleri ve <b>çiğneme yüzeyini</b> ayrı ayrı fırçala.</li>
          <li>Dil sırtını da temizle.</li>
          <li>Son olarak <b>diş ipi</b> kullan — fırça diş aralarına ulaşmaz.</li>
          <li>Sertçe bastırma; mine ve diş eti zarar görür.</li>
        </ol>
      </div>

      <div class="card p4 mb3">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <p style="font-size:11px;font-weight:800;color:var(--muted);margin:0;text-transform:uppercase;letter-spacing:.05em;">Fırçalama serisi</p>
            <p style="font-size:24px;font-weight:800;margin:3px 0 0;">🔥 ${streak} gün</p>
          </div>
          <button class="btn-primary" style="width:auto;padding:9px 16px;font-size:12.5px;" data-action="brush-teeth">Fırçaladım</button>
        </div>
      </div>
    </div>`;
}

/* =====================================================================
   4. OLAY YAKALAYICI
   ===================================================================== */

function bilgiAction(el, action) {
  if (action === "bilgi-sekme") {
    state.infoTab = el.dataset.id;
    state.infoArama = "";
    state.infoAcik = null;
    render();
    return true;
  }

  if (action === "bilgi-ac") {
    const git = el.dataset.git;
    const id = el.dataset.id;
    if (git) {
      // kart içindeki "tedaviye git" butonu
      state.infoTab = git;
      state.infoArama = "";
      state.infoAcik = "ted-" + id;
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return true;
    }
    state.infoAcik = (state.infoAcik === id) ? null : id;
    render();
    return true;
  }

  if (action === "bilgi-arama-temizle") {
    state.infoArama = "";
    render();
    return true;
  }

  if (action === "bilgi-test-baslat") {
    state.testSira = 0;
    state.testPuan = 0;
    state.testCevap = null;
    render();
    return true;
  }

  if (action === "bilgi-test-cevap") {
    if (state.testCevap !== null && state.testCevap !== undefined) return true;
    const i = parseInt(el.dataset.i);
    const s = BI_TEST[state.testSira || 0];
    state.testCevap = i;
    if (i === s.d) {
      state.testPuan = (state.testPuan || 0) + 1;
      bzSes(1174, 0.16);
    } else {
      bzSes(392, 0.28);
    }
    render();
    return true;
  }

  if (action === "bilgi-test-ileri") {
    state.testSira = (state.testSira || 0) + 1;
    state.testCevap = null;
    render();
    return true;
  }

  if (action === "bz-basla") {
    state.bzBitti = false;
    bzBasla();
    return true;
  }

  if (action === "bz-durdur") {
    bzDurdur();
    state.bzKalan = BZ_SURE;
    render();
    return true;
  }

  return false;
}

/* Arama kutusu: yazarken canlı filtreleme.
   Yeniden çizim odağı kaybettirdiği için odak ve imleç konumu geri veriliyor.
   Gecikme (debounce) ile her tuşta tam render yapılmıyor. */
let _bilgiAramaZaman = null;
document.addEventListener("input", (e) => {
  const t = e.target;
  if (!t || t.id !== "bilgi-arama") return;
  const q = t.value || "";
  state.infoArama = q;
  state.infoAcik = null;
  const imlec = t.selectionStart;

  if (_bilgiAramaZaman) clearTimeout(_bilgiAramaZaman);
  _bilgiAramaZaman = setTimeout(() => {
    render();
    const yeni = document.getElementById("bilgi-arama");
    if (yeni) {
      yeni.focus();
      try { yeni.setSelectionRange(imlec, imlec); } catch (err) {}
    }
  }, 220);
}, true);
