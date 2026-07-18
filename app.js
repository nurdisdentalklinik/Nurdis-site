/* NUR DİŞ DENTAL KLİNİK - FULL APP */

const LANGUAGES = {
  tr: { name: 'Türkçe', flag: '🇹🇷' },
  ar: { name: 'العربية', flag: '🇸🇦' },
  en: { name: 'English', flag: '🇬🇧' },
  de: { name: 'Deutsch', flag: '🇩🇪' },
  es: { name: 'Español', flag: '🇪🇸' },
};

const TRANS = {
  tr: { home: 'Ana Sayfa', services: 'Hizmetler', booking: 'Randevu', camera: 'Kamera', settings: 'Ayarlar', takePhoto: 'Fotoğraf Çek', brighten: 'Parlat', enlarge: 'Büyüt', selectLang: 'Dil Seç', sound: 'Ses' },
  ar: { home: 'الرئيسية', services: 'الخدمات', booking: 'حجز', camera: 'الكاميرا', settings: 'الإعدادات', takePhoto: 'التقط صورة', brighten: 'تفتيح', enlarge: 'تكبير', selectLang: 'اختر اللغة', sound: 'الصوت' },
  en: { home: 'Home', services: 'Services', booking: 'Booking', camera: 'Camera', settings: 'Settings', takePhoto: 'Take Photo', brighten: 'Brighten', enlarge: 'Enlarge', selectLang: 'Select Language', sound: 'Sound' },
  de: { home: 'Startseite', services: 'Dienstleistungen', booking: 'Buchung', camera: 'Kamera', settings: 'Einstellungen', takePhoto: 'Foto machen', brighten: 'Aufhellen', enlarge: 'Vergrößern', selectLang: 'Sprache wählen', sound: 'Ton' },
  es: { home: 'Inicio', services: 'Servicios', booking: 'Reserva', camera: 'Cámara', settings: 'Configuración', takePhoto: 'Tomar foto', brighten: 'Aclarar', enlarge: 'Ampliar', selectLang: 'Seleccionar idioma', sound: 'Sonido' },
};

const SERVICES = [
  { id: 'muayene', name: 'Diş Muayenesi', price: '500₺', icon: '🔍' },
  { id: 'temizlik', name: 'Diş Temizliği', price: '900₺', icon: '✨' },
  { id: 'dolgu', name: 'Dolgu', price: '700₺', icon: '🦷' },
  { id: 'kanal', name: 'Kanal Tedavisi', price: '2500₺', icon: '🔧' },
  { id: 'implant', name: 'İmplant', price: '12000₺', icon: '👑' },
  { id: 'beyazlatma', name: 'Diş Beyazlatma', price: '3000₺', icon: '⭐' },
];

const DOCTORS = [
  { name: 'Dt. Ramazan DAĞ', title: 'Diş Hekimi - Klinik Müdürü', exp: '5 yıl deneyim', photo: 'doctor-photo.jpg' },
];

let state = {
  screen: 'home',
  language: localStorage.getItem('lang') || 'tr',
  soundOn: localStorage.getItem('sound') !== 'off',
  cameraOn: false,
  brightness: 0,
  zoom: 0,
  selectedAppointment: null,
};

function t(key) {
  return TRANS[state.language]?.[key] || TRANS.tr[key] || key;
}

function playSound(freq = 720, dur = 0.1) {
  if (!state.soundOn) return;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    const ctx = new AC();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + dur);
  } catch (e) {}
}

function renderHome() {
  return `
    <div class="screen">
      <div class="hero">🦷 NUR DİŞ KLİNİĞİ</div>
      <button onclick="goto('services')">📋 ${t('services')}</button>
      <button onclick="goto('camera')">📷 ${t('camera')}</button>
      <button onclick="goto('booking')">📅 ${t('booking')}</button>
      <button onclick="goto('settings')">⚙️ ${t('settings')}</button>
    </div>
  `;
}

function renderServices() {
  return `
    <div class="screen">
      <h2>HİZMETLER</h2>
      ${SERVICES.map(s => `<div class="card">${s.icon} ${s.name} - ${s.price}</div>`).join('')}
      <button onclick="goto('home')">← GERI</button>
    </div>
  `;
}

function renderCamera() {
  return `
    <div class="screen">
      <h2>KAMERA & AR</h2>
      <video id="cam" playsinline style="width:100%;height:300px;border-radius:10px;background:#000;"></video>
      <div>
        <label>Parlat: <input type="range" id="bright" min="-100" max="100" value="0" oninput="state.brightness = this.value; updateCamera()" style="width:100%;"/></label>
        <label>Büyüt: <input type="range" id="zoom" min="0" max="100" value="0" oninput="state.zoom = this.value; updateCamera()" style="width:100%;"/></label>
      </div>
      <button onclick="takePhoto()">📸 Fotoğraf Çek</button>
      <button onclick="goto('home')">← GERI</button>
    </div>
  `;
}

function renderBooking() {
  return `
    <div class="screen">
      <h2>RANDEVU AL</h2>
      <input type="date" id="appDate" style="width:100%;padding:10px;margin:10px 0;border-radius:8px;border:1px solid #ccc;" />
      <select id="appTime" style="width:100%;padding:10px;margin:10px 0;border-radius:8px;border:1px solid #ccc;">
        <option>09:00</option><option>10:00</option><option>11:00</option><option>14:00</option><option>15:00</option><option>16:00</option>
      </select>
      <input type="text" id="appName" placeholder="Adınız" style="width:100%;padding:10px;margin:10px 0;border-radius:8px;border:1px solid #ccc;" />
      <input type="tel" id="appPhone" placeholder="Telefon" style="width:100%;padding:10px;margin:10px 0;border-radius:8px;border:1px solid #ccc;" />
      <button onclick="saveAppointment()">✅ RANDEVUYU ONAYLA</button>
      <button onclick="goto('home')">← GERI</button>
    </div>
  `;
}

function renderSettings() {
  return `
    <div class="screen">
      <h2>AYARLAR</h2>
      <h3>${t('selectLang')}</h3>
      ${Object.entries(LANGUAGES).map(([code, lang]) => `
        <button onclick="setLanguage('${code}')" style="${state.language === code ? 'background:#075E70;color:white;' : ''}">
          ${lang.flag} ${lang.name}
        </button>
      `).join('')}
      <h3>${t('sound')}</h3>
      <button onclick="toggleSound()" style="background:${state.soundOn ? '#075E70' : '#ccc'};color:${state.soundOn ? 'white' : 'black'};">
        ${state.soundOn ? '🔊 SES AÇIK' : '🔇 SES KAPALI'}
      </button>
      <button onclick="goto('home')">← GERI</button>
    </div>
  `;
}

function goto(screen) {
  playSound(720, 0.05);
  state.screen = screen;
  render();
}

function setLanguage(lang) {
  playSound(720, 0.05);
  state.language = lang;
  localStorage.setItem('lang', lang);
  render();
}

function toggleSound() {
  playSound(720, 0.05);
  state.soundOn = !state.soundOn;
  localStorage.setItem('sound', state.soundOn ? 'on' : 'off');
  render();
}

async function startCamera() {
  const video = document.getElementById('cam');
  if (!video) return;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
    video.srcObject = stream;
    state.cameraOn = true;
  } catch (e) {
    alert('Kamerayla erişilemedi!');
  }
}

function updateCamera() {
  // AR efektleri burada uygulanacak
}

function takePhoto() {
  playSound(800, 0.1);
  alert('📸 Fotoğraf kaydedildi!');
}

function saveAppointment() {
  playSound(880, 0.15);
  const date = document.getElementById('appDate').value;
  const time = document.getElementById('appTime').value;
  const name = document.getElementById('appName').value;
  const phone = document.getElementById('appPhone').value;
  
  if (!date || !name || !phone) {
    alert('Lütfen tüm alanları doldurun!');
    return;
  }
  
  let apps = JSON.parse(localStorage.getItem('appointments') || '[]');
  apps.push({ date, time, name, phone });
  localStorage.setItem('appointments', JSON.stringify(apps));
  alert('✅ Randevunuz kaydedildi!');
  goto('home');
}

function render() {
  const app = document.getElementById('app');
  const screens = {
    home: renderHome,
    services: renderServices,
    camera: renderCamera,
    booking: renderBooking,
    settings: renderSettings,
  };
  
  app.innerHTML = (screens[state.screen] || renderHome)();
  
  if (state.screen === 'camera') {
    setTimeout(startCamera, 100);
  }
}

window.addEventListener('popstate', () => {
  if (state.screen !== 'home') {
    state.screen = 'home';
    render();
  }
});

render();