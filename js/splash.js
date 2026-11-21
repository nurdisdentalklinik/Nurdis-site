/* Açılış (splash) ekranı — CSP uyumu için index.html'den taşındı.
   Satır içi <script> yasak olduğundan ayrı dosyada çalışır. */
(function() {
  /* ═══════════════════════════════════════════════════════════════
     KULLANICI ŞİKAYETİ: "Splash giriş çok ağır, giriş tekrar ediyor"

     ÇÖZÜMLER:
       1) Tek seferlik  : aynı OTURUMDA splash bir daha gösterilmez
                          (sessionStorage). Uygulamayı her açışta 4 saniye
                          beklemek zorunda kalmazsınız.
       2) Hızlandırıldı : 5 sahne x 620 ms = 3.1 sn, kapanma 4.2 sn
                          (önce 7 sahne x 800 ms = 5.6 sn / kapanma 7 sn)
       3) 'Geç' + dokunma aynı: anında kapanır

     ⚠️ Aynı oturumda bir kez gösterilir; tarayıcı/uygulama tamamen
        kapatılıp açılırsa yeniden gösterilir (marka karşılaması).
     ═══════════════════════════════════════════════════════════════ */
  /* ⚠️ v75: sessionStorage yerine localStorage kullanılıyor.
     KULLANICI: "Ben o geç sekmesini her seferinde izlemek zorunda
     kalmayalım diye koydum. İLK DEFA GİRENLER GÖRSÜN YETER, isteyen
     geçsin hemen ama beyaz ekran da beklemesin."

     • localStorage → splash yalnızca İLK ziyarette çıkar, sonra bir
       daha çıkmaz (tarayıcı verisi silinmedikçe).
     • "Geç" basıldığında hemen kapanır, beyaz ekran görünmez. */
  var ATLA_ANAHTAR = "nurdis_splash_gosterildi";
  try {
    if (localStorage.getItem(ATLA_ANAHTAR) === "1") {
      /* Bu oturumda zaten gösterildi → splash DOM'dan hemen kaldır.
         (CSS yüzünden kısa bir an görünmemesi için anında silinir.) */
      var esk = document.getElementById("splash-screen");
      if (esk && esk.parentNode) esk.parentNode.removeChild(esk);
      return;
    }
  } catch (e) {}

  var splashClosed = false;
  var currentSlide = 0;
  var totalSlides = 5;
  /* Sahne etiketleri — 7 slayt, GÖRSELLERLE BİREBİR eşleşir:
       s1 space.webp      → açılış
       s2 continents.jpg  → bölge
       s3 turkey.jpg      → ülke
       s4 mardin.jpg      → şehir
       s5 toki.jpg        → mahalle
       s6 clinic.jpg      → klinik
       s7 door.webp       → karşılama
     ⚠️ KULLANICI İSTEĞİ: "Uzaydan geliyoruz" ve "Kıtalar görünüyor /
     dünya" ifadeleri KALDIRILDI. Görsel sayısı 7 olduğu için etiket de
     7 olmak ZORUNDA — eksik olursa slayt takılır (daha önce bozulmuştu). */
  var sceneLabels = [
    'Uzaydan dünyaya',
    'Türkiye',
    'Mardin',
    'Kızıltepe',
    'Nur Diş & Dental Klinik'
  ];

  /* =====================================================================
     "GEÇ" → ANINDA KAPAN (v65)
     ---------------------------------------------------------------------
     KULLANICI İSTEĞİ: "Hazırlanıyor ekranı çıkmasın, sadece splash kalsın,
     geç deyince hemen açılsın, müzik de kesilsin."

     ESKİ DAVRANIŞ (kaldırıldı): Geç'e basınca uygulama henüz çizilmemişse
     splash kaybolmuyor, yerine "Hazırlanıyor…" yazan ayrı bir markalı
     bekleme ekranı geliyordu. Kullanıcı iki aşamalı bekleme görüyordu.

     YENİ DAVRANIŞ:
       1) Geç / dokunma → splash 180 ms içinde kaybolur, HİÇBİR ara ekran yok
       2) Müzik anında kesilir (AudioContext.close + tüm osilatörler durur)
       3) Uygulama çizilmemişse splash'in arkasında zaten hazırlanıyor olur;
          splash saydamlaşarak kaybolduğu için boş ekran görünmez
     ===================================================================== */
  /* ═══════════════════════════════════════════════════════════════
     BEYAZ EKRAN DÜZELTMESİ (v75)
     ───────────────────────────────────────────────────────────────
     SORUN: "Geç'e basınca beyaz ekran geliyor, aynı süre bekliyor."

     KÖK NEDEN: İlk ekranı çizen render() fonksiyonu yalnızca
     firebase.js içinde çağrılıyordu ve firebase.js EN SON yüklenen
     dosyaydı (type=module, ağ gecikmesi). "Geç"e erken basıldığında
     splash kaldırılıyor ama #screen HENÜZ BOŞ oluyordu → BEYAZ EKRAN.

     ÇÖZÜM:
       1) Splash içinde erken çizim yapılır (render/SCREEN_MAP hazır
          olmasa bile basit bir karşılama ekranı çizilir).
       2) Uygulama gerçekten hazır olana kadar splash BEKLETİLMEZ;
          bunun yerine #screen'e yükleme göstergesi konur.
       3) Hazır olunca (fb-ready / render mevcut) otomatik geçilir.
     ═══════════════════════════════════════════════════════════════ */

  /* Uygulama çizildi mi? (#screen içi dolu mu) */
  function ekranHazirMi() {
    var el = document.getElementById("screen");
    return !!(el && el.innerHTML && el.innerHTML.length > 200);
  }

  /* Uygulama hazır değilse #screen'e yükleme göstergesi koy.
     Böylece "Geç"e basınca BEYAZ EKRAN değil, markalı bir ekran görünür. */
  function yuklemeGoster() {
    var el = document.getElementById("screen");
    if (!el) return;
    if (ekranHazirMi()) return;
    el.innerHTML =
      '<div style="min-height:70vh;display:flex;flex-direction:column;' +
      'align-items:center;justify-content:center;gap:14px;padding:24px;text-align:center;">' +
      '<img src="icon-192.png" alt="" style="width:64px;height:64px;border-radius:16px;" />' +
      '<p style="font-size:15px;font-weight:800;color:#0E7C5B;margin:0;">Nur Diş &amp; Dental Klinik</p>' +
      '<p style="font-size:12.5px;color:#607D8B;margin:0;">Gülümsemenin adresi</p>' +
      '<div style="width:120px;height:3px;border-radius:99px;background:rgba(14,124,91,.15);overflow:hidden;">' +
      '<div style="width:40%;height:100%;background:#0E7C5B;border-radius:99px;' +
      'animation:splashYukle 1.1s ease-in-out infinite;"></div></div>' +
      '</div>';
  }

  /* Uygulama hazır olunca gerçek ekranı çiz */
  function gercekEkraniCiz() {
    try {
      if (typeof render === "function" && typeof SCREEN_MAP !== "undefined" && SCREEN_MAP) {
        render();
        return true;
      }
    } catch (e) {}
    return false;
  }

  /* Hazır olana kadar bekle (en fazla ~6 sn), sonra pes et */
  function hazirOluncaGec(dnm) {
    dnm = dnm || 0;
    if (gercekEkraniCiz()) return;
    if (dnm > 40) return;                 /* ~6 sn sonra bırak */
    setTimeout(function () { hazirOluncaGec(dnm + 1); }, 150);
  }

  function splashKaldir(splash, hizli) {
    if (!splash) return;
    splash.classList.add('hide');
    setTimeout(function () { if (splash.parentNode) splash.remove(); }, hizli ? 140 : 400);
  }

  function closeSplash() {
    if (splashClosed) return;
    splashClosed = true;

    /* Bu oturumda bir daha gösterme (tekrar eden splash sorunu) */
    try { localStorage.setItem(ATLA_ANAHTAR, "1"); } catch (e) {}

    /* 1) MÜZİK ANINDA KESİLSİN */
    muzigiKes();

    var splash = document.getElementById('splash-screen');
    if (!splash) return;

    /* 2) Slayt döngüsünü durdur */
    if (window.__splashInterval) { clearInterval(window.__splashInterval); window.__splashInterval = null; }

    /* 3) BEYAZ EKRAN KORUMASI: uygulama henüz çizilmediyse #screen'e
          yükleme göstergesi koy, sonra hazır olunca gerçek ekranı çiz. */
    if (!gercekEkraniCiz()) {
      yuklemeGoster();
      hazirOluncaGec(0);
    }

    /* 4) Ara ekran YOK — doğrudan kapat */
    splashKaldir(splash, true);
  }

  /* ---------------------------------------------------------------------
     MÜZİK KESME
     ---------------------------------------------------------------------
     ÖNCEKİ HATA: Geç'e basılınca müzik devam ediyordu; hatta splash
     kapandıktan sonra da piyano melodisi çalıyordu. Çünkü sadece ekran
     gizleniyordu, AudioContext ve zamanlanmış osilatörler (7 saniyelik
     melodi) çalışmaya devam ediyordu.
     ÇÖZÜM: tüm osilatör düğümleri kaydedilir, kapatmada durdurulur ve
     AudioContext tamamen kapatılır (close).
     --------------------------------------------------------------------- */
  function muzigiKes() {
    /* (a) ANA SES DÜĞÜMÜNÜ SIFIRLA — bu, çalan her sesi ANINDA keser.
       (Osilatör stop() bazı tarayıcılarda planlanmış notaları kaçırabilir;
        gain'i 0 yapmak garantili yöntemdir.) */
    try {
      var anaGain = window.__splashAnaGain;
      var c0 = window.__splashAudioCtx;
      if (anaGain && c0) {
        try {
          anaGain.gain.cancelScheduledValues(0);
          anaGain.gain.value = 0;              /* doğrudan sıfır — anında sessizlik */
          anaGain.gain.setValueAtTime(0, c0.currentTime);
        } catch (e) {}
      }
    } catch (e) {}

    /* (b) Kayıtlı osilatörleri sustur */
    try {
      (window.__splashOsc || []).forEach(function (o) {
        try { o.stop(0); } catch (e) {}
        try { o.disconnect(); } catch (e) {}
      });
      window.__splashOsc = [];
    } catch (e) {}

    /* (c) Ses düğümünü tamamen kapat — kalan tüm ses anında susar */
    try {
      var c = window.__splashAudioCtx;
      if (c && c.state !== 'closed') { try { c.close(); } catch (e) {} }
      window.__splashAudioCtx = null;
    } catch (e) {}

    /* (d) Müziği başlatan bekleyen dokunma dinleyicilerini kaldır */
    try {
      if (window.__splashResume) {
        document.removeEventListener('click', window.__splashResume);
        document.removeEventListener('touchstart', window.__splashResume);
        window.__splashResume = null;
      }
    } catch (e) {}
  }
  window.__splashMuzikKes = muzigiKes;

  // "Geç" butonu
  var skipBtn = document.getElementById('splash-skip');
  if (skipBtn) {
    skipBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      closeSplash();
    });
  }

  // Slayt gösterisi - OTOMATIK BAŞLAR
  var slides = document.querySelectorAll('.splash-slide');
  var sceneLabel = document.getElementById('splash-scene');
  var bar = document.getElementById('splash-bar');
  if (slides[0]) slides[0].classList.add('active');
  if (bar) bar.style.width = (1/totalSlides*100) + '%';

  var slideInterval = setInterval(function() {
    setTimeout(function(){ if (typeof ceviriUygula === 'function') { try { ceviriUygula(document.body); } catch(e){} } }, 60);
    if (splashClosed) { clearInterval(slideInterval); return; }
    if (currentSlide < totalSlides - 1) {
      slides[currentSlide].classList.remove('active');
      currentSlide++;
      slides[currentSlide].classList.add('active');
      if (sceneLabel) sceneLabel.textContent = sceneLabels[currentSlide];
      if (bar) bar.style.width = ((currentSlide+1)/totalSlides*100) + '%';
    }
  }, 620);
  window.__splashInterval = slideInterval;

  setTimeout(closeSplash, 4200);

  // Dokunma ile atla
  var splash = document.getElementById('splash-screen');
  if (splash) {
    splash.addEventListener('click', closeSplash);
    splash.addEventListener('touchstart', closeSplash);
  }

  /* MÜZİK — tarayıcı izin verirse otomatik başlar.
     NOT: AudioContext window.__splashAudioCtx'e, osilatörler
     window.__splashOsc'e kaydedilir; böylece "Geç" denince
     muzigiKes() hepsini anında susturup ses düğümünü kapatabilir. */
  try {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (AC) {
      var ctx = new AC();
      window.__splashAudioCtx = ctx;
      if (ctx.state === 'suspended') {
        /* Tarayıcı otomatik çalmayı engelledi → ilk dokunuşta başlat.
           "Geç" butonuna basıldığında da bu dinleyici tetiklenir ama
           closeSplash önce çalışıp splashClosed=true yaptığı için
           müzik başlamaz (aşağıdaki kontrol). */
        var resume = function () {
          document.removeEventListener('click', resume);
          document.removeEventListener('touchstart', resume);
          window.__splashResume = null;
          if (splashClosed) return;          /* splash kapandıysa müzik başlatma */
          try { ctx.resume(); } catch (e) {}
          startSplashMusic(ctx);
        };
        window.__splashResume = resume;
        document.addEventListener('click', resume);
        document.addEventListener('touchstart', resume);
      } else {
        startSplashMusic(ctx);
      }
    }
  } catch(e) {}

  function startSplashMusic(ctx) {
    if (ctx._started || splashClosed) return;
    ctx._started = true;
    if (!window.__splashOsc) window.__splashOsc = [];
    var KAYDET = function (o) { window.__splashOsc.push(o); return o; };
    /* TÜM sesler bu ana gain üzerinden geçer → tek hamlede susdurulabilir */
    var anaGain = ctx.createGain();
    anaGain.gain.value = 1;
    anaGain.connect(ctx.destination);
    window.__splashAnaGain = anaGain;
    var HEDEF = anaGain;
    var t = ctx.currentTime;
    // Güzel piyano benzeri melodi - C majör arpej + melodi
    var melody = [
      // Arpej giriş (yumuşak, akan)
      {f:523.25, s:0.0, d:0.6},  // C5
      {f:659.25, s:0.15, d:0.5}, // E5
      {f:783.99, s:0.3, d:0.5},  // G5
      {f:1046.5, s:0.5, d:0.8},  // C6
      // Melodi (duygusal, sıcak)
      {f:880.0, s:1.3, d:0.5},   // A5
      {f:783.99, s:1.7, d:0.4},  // G5
      {f:698.46, s:2.1, d:0.6},  // F5
      {f:659.25, s:2.6, d:0.5},  // E5
      // Orta bölüm (huzur)
      {f:587.33, s:3.2, d:0.5},  // D5
      {f:523.25, s:3.6, d:0.6},  // C5
      {f:587.33, s:4.1, d:0.4},  // D5
      {f:659.25, s:4.4, d:0.5},  // E5
      // Final (çözüm, yükseliş)
      {f:698.46, s:5.0, d:0.4},  // F5
      {f:783.99, s:5.3, d:0.5},  // G5
      {f:880.0, s:5.7, d:0.4},   // A5
      {f:1046.5, s:6.0, d:1.0},  // C6 (uzun final)
    ];
    melody.forEach(function(n) {
      // Ana ton (piyano benzeri - sine + hafif triangle karışımı)
      var osc = KAYDET(ctx.createOscillator());
      var gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = n.f;
      gain.gain.setValueAtTime(0, t + n.s);
      gain.gain.linearRampToValueAtTime(0.12, t + n.s + 0.03);
      gain.gain.setValueAtTime(0.10, t + n.s + n.d * 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, t + n.s + n.d);
      osc.connect(gain); gain.connect(HEDEF);
      osc.start(t + n.s); osc.stop(t + n.s + n.d + 0.05);
      // Harmonik (oktav üstü, çok hafif)
      var osc2 = KAYDET(ctx.createOscillator());
      var gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.value = n.f * 2;
      gain2.gain.setValueAtTime(0, t + n.s);
      gain2.gain.linearRampToValueAtTime(0.02, t + n.s + 0.03);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + n.s + n.d * 0.7);
      osc2.connect(gain2); gain2.connect(HEDEF);
      osc2.start(t + n.s); osc2.stop(t + n.s + n.d + 0.05);
    });
    // Pad (arka plan ambiyans - C majör akor)
    [261.63, 329.63, 392.00].forEach(function(freq) {
      var osc = KAYDET(ctx.createOscillator());
      var gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.025, t + 1.5);
      gain.gain.setValueAtTime(0.025, t + 5.5);
      gain.gain.linearRampToValueAtTime(0, t + 7);
      osc.connect(gain); gain.connect(HEDEF);
      osc.start(t); osc.stop(t + 7.1);
    });
    // Chime (parlak dokunuşlar)
    [{f:2093, s:0.5}, {f:1568, s:2.1}, {f:1760, s:4.4}, {f:2093, s:6.0}].forEach(function(c) {
      var osc = KAYDET(ctx.createOscillator());
      var gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = c.f;
      gain.gain.setValueAtTime(0.05, t + c.s);
      gain.gain.exponentialRampToValueAtTime(0.001, t + c.s + 1.0);
      osc.connect(gain); gain.connect(HEDEF);
      osc.start(t + c.s); osc.stop(t + c.s + 1.1);
    });
  }
})();
