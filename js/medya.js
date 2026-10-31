/* =========================================================
   NUR DİŞ — MEDYA — kamera, yüz takibi
   app.js'ten bölündü · index.html yükleme sırası önemli
========================================================= */

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
