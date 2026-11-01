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

  function closeSplash() {
    if (splashClosed) return;
    splashClosed = true;
    var splash = document.getElementById('splash-screen');
    if (splash) { splash.classList.add('hide'); setTimeout(function() { splash.remove(); }, 1000); }
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
    if (splashClosed) { clearInterval(slideInterval); return; }
    if (currentSlide < totalSlides - 1) {
      slides[currentSlide].classList.remove('active');
      currentSlide++;
      slides[currentSlide].classList.add('active');
      if (sceneLabel) sceneLabel.textContent = sceneLabels[currentSlide];
      if (bar) bar.style.width = ((currentSlide+1)/totalSlides*100) + '%';
    }
  }, 1000);

  setTimeout(function() { clearInterval(slideInterval); closeSplash(); }, 7000);

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
