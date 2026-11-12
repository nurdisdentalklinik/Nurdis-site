/* Açılış (splash) ekranı — CSP uyumu için index.html'den taşındı.
   Satır içi <script> yasak olduğundan ayrı dosyada çalışır. */
(function() {
  var splashClosed = false;
  var currentSlide = 0;
  var totalSlides = 7;
  var sceneLabels = [
    '🌍 Uzaydan geliyoruz...',
    '🌏 Kıtalar görünüyor...',
    '🇹🇷 Türkiye...',
    '🏛️ Mardin...',
    '🏘️ Kızıltepe TOKİ...',
    '🏥 Kliniğimiz...',
    '🚪 Hoş geldiniz!'
  ];

  /* =====================================================================
     "GEÇ" → BEYAZ EKRAN SORUNU DÜZELTMESİ
     ---------------------------------------------------------------------
     ESKİ DAVRANIŞ: Geç'e basınca splash 1 saniye boyunca saydam oluyor,
     arkada uygulama henüz çizilmemişse BOŞ/BEYAZ ekran görünüyordu.
     (Uygulama 26 JS dosyası + Firebase bağlantısı ile ~0.5-3 sn sürebiliyor.)

     YENİ DAVRANIŞ:
       1) Uygulama hazırsa → splash 220 ms'de kaybolur (beyaz kare yok)
       2) Uygulama hazır değilse → splash KALDIRILMAZ; içeriği markalı
          "hazırlanıyor" ekranına dönüşür, ekran dolunca kaybolur
       3) En fazla 6 sn bekler, sonra yine de kapatır (sonsuz bekleme yok)
     ===================================================================== */
  function uygulamaHazirMi() {
    var scr = document.getElementById('screen');
    return !!(scr && scr.children.length > 0);
  }

  function markaliBeklemeEkrani(splash) {
    if (!splash || splash.dataset.bekleme === '1') return;
    splash.dataset.bekleme = '1';
    var slaytlar = splash.querySelectorAll('.splash-slide');
    for (var i = 0; i < slaytlar.length; i++) slaytlar[i].classList.remove('active');
    var skip = document.getElementById('splash-skip');
    if (skip) skip.style.display = 'none';
    var sahne = document.getElementById('splash-scene');
    if (sahne) sahne.style.display = 'none';
    var cubuk = document.getElementById('splash-bar');
    if (cubuk) cubuk.parentElement.style.display = 'none';

    var kutu = document.createElement('div');
    kutu.setAttribute('style', 'position:relative;z-index:5;display:flex;flex-direction:column;align-items:center;gap:16px;color:#fff;text-align:center;padding:0 24px;');
    kutu.innerHTML =
      '<img src="icon-192.png" alt="Nur Diş" style="width:84px;height:84px;border-radius:22px;box-shadow:0 8px 32px rgba(0,0,0,.35);" />' +
      '<p style="margin:0;font-size:17px;font-weight:800;letter-spacing:.02em;">Nur Diş &amp; Dental Klinik</p>' +
      '<div class="splash-hazirlik-cubuk"><span></span></div>' +
      '<p style="margin:0;font-size:12px;opacity:.85;">Hazırlanıyor…</p>';
    /* Arka planı klinik rengine çevir — beyaz/boş görünmesin */
    splash.style.background = 'linear-gradient(160deg,#0B6E86,#0E8FA8)';
    splash.appendChild(kutu);
  }

  function splashKaldir(splash, hizli) {
    if (!splash) return;
    splash.classList.add('hide');
    setTimeout(function () { if (splash.parentNode) splash.remove(); }, hizli ? 220 : 400);
  }

  function closeSplash() {
    if (splashClosed) return;
    splashClosed = true;
    var splash = document.getElementById('splash-screen');
    if (!splash) return;

    /* Slayt döngüsünü durdur */
    if (window.__splashInterval) { clearInterval(window.__splashInterval); window.__splashInterval = null; }

    if (uygulamaHazirMi()) {
      splashKaldir(splash, true);           /* anında kapat */
      return;
    }

    /* Uygulama henüz çizilmedi → beyaz ekran yerine markalı bekleme */
    markaliBeklemeEkrani(splash);
    var baslangic = Date.now();
    var kontrol = setInterval(function () {
      if (uygulamaHazirMi() || Date.now() - baslangic > 6000) {
        clearInterval(kontrol);
        splashKaldir(splash, true);
      }
    }, 120);
  }

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
  }, 1000);
  window.__splashInterval = slideInterval;

  setTimeout(closeSplash, 7000);

  // Dokunma ile atla
  var splash = document.getElementById('splash-screen');
  if (splash) {
    splash.addEventListener('click', closeSplash);
    splash.addEventListener('touchstart', closeSplash);
  }

  // MÜZİK - OTOMATIK BAŞLAR (tarayıcı izin verirse)
  try {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (AC) {
      var ctx = new AC();
      // Eğer suspended ise kullanıcı etkileşimi bekle
      if (ctx.state === 'suspended') {
        var resume = function() { ctx.resume(); startSplashMusic(ctx); document.removeEventListener('click', resume); document.removeEventListener('touchstart', resume); };
        document.addEventListener('click', resume);
        document.addEventListener('touchstart', resume);
      } else {
        startSplashMusic(ctx);
      }
    }
  } catch(e) {}

  function startSplashMusic(ctx) {
    if (ctx._started) return;
    ctx._started = true;
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
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = n.f;
      gain.gain.setValueAtTime(0, t + n.s);
      gain.gain.linearRampToValueAtTime(0.12, t + n.s + 0.03);
      gain.gain.setValueAtTime(0.10, t + n.s + n.d * 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, t + n.s + n.d);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(t + n.s); osc.stop(t + n.s + n.d + 0.05);
      // Harmonik (oktav üstü, çok hafif)
      var osc2 = ctx.createOscillator();
      var gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.value = n.f * 2;
      gain2.gain.setValueAtTime(0, t + n.s);
      gain2.gain.linearRampToValueAtTime(0.02, t + n.s + 0.03);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + n.s + n.d * 0.7);
      osc2.connect(gain2); gain2.connect(ctx.destination);
      osc2.start(t + n.s); osc2.stop(t + n.s + n.d + 0.05);
    });
    // Pad (arka plan ambiyans - C majör akor)
    [261.63, 329.63, 392.00].forEach(function(freq) {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.025, t + 1.5);
      gain.gain.setValueAtTime(0.025, t + 5.5);
      gain.gain.linearRampToValueAtTime(0, t + 7);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(t); osc.stop(t + 7.1);
    });
    // Chime (parlak dokunuşlar)
    [{f:2093, s:0.5}, {f:1568, s:2.1}, {f:1760, s:4.4}, {f:2093, s:6.0}].forEach(function(c) {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = c.f;
      gain.gain.setValueAtTime(0.05, t + c.s);
      gain.gain.exponentialRampToValueAtTime(0.001, t + c.s + 1.0);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(t + c.s); osc.stop(t + c.s + 1.1);
    });
  }
})();
