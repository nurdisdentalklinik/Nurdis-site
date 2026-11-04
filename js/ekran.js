/* =========================================================
   NUR DİŞ — EKRANLAR — escape, render, nav, admin panel
   app.js'ten bölündü · index.html yükleme sırası önemli
========================================================= */

/* ---------------- YARDIMCI: ESCAPE ---------------- */
function escapeHtml(s){ return (s||"").replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function escapeAttr(s){ return escapeHtml(s); }

/* ---------------- ANA RENDER / NAV ---------------- */



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
  /* İlk çizimde URL hash'ini uygula (#hesap-sil gibi doğrudan bağlantılar) */
  if (!window.__hashIlkYukleme) {
    window.__hashIlkYukleme = 1;
    try { if (typeof hashUygula === "function") hashUygula(); } catch (e) {}
  }
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


/* ---------------- HASH ROUTING ----------------
   Mağazalar (Google Play / App Store) "veri silme URL'si" ister.
   https://nurdis.pages.dev/#hesap-sil gibi doğrudan bağlantı çalışmalı. */
function hashUygula() {
  const h = (location.hash || "").replace(/^#/, "").trim();
  if (!h) return false;
  const hedef = h.split("?")[0];
  if (!SCREEN_MAP[hedef]) return false;
  state.screen = hedef;
  state.moreOpen = false;
  return true;
}

window.addEventListener("hashchange", () => {
  if (hashUygula()) { render(); window.scrollTo(0, 0); }
});

function refreshDisabled() {
  const map = {
    "submit-booking": () => !(state.bookingForm.date && state.bookingForm.time && state.bookingForm.name && state.bookingForm.phone && state.bookingForm.kvkk),
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
    const d=$("f-date"), n=$("f-name"), p=$("f-phone"), k=$("f-kvkk");
    if (d) d.onchange = e => { state.bookingForm.date = e.target.value; state.bookingStatus="idle"; render(); };
    if (n) n.oninput = e => { state.bookingForm.name = e.target.value; refreshDisabled(); };
    if (p) p.oninput = e => { state.bookingForm.phone = e.target.value; refreshDisabled(); };
    if (k) k.onchange = e => { state.bookingForm.kvkk = e.target.checked; render(); };
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



/* Sipariş arama — yazarken canlı filtreleme */
let _sipAramaZaman = null;
document.addEventListener("input", (e) => {
  const t = e.target;
  if (!t || t.id !== "sip-arama") return;
  const v = t.value || "";
  state.siparisArama = v;
  const imlec = t.selectionStart;
  if (_sipAramaZaman) clearTimeout(_sipAramaZaman);
  _sipAramaZaman = setTimeout(() => {
    render();
    const y = document.getElementById("sip-arama");
    if (y) { y.focus(); try { y.setSelectionRange(imlec, imlec); } catch (err) {} }
  }, 240);
}, true);


/* Hesap silme onayı — "SİL" yazılınca buton aktifleşir (yeniden çizim yok) */
document.addEventListener("input", (e) => {
  const t = e.target;
  if (!t || t.id !== "silme-onay") return;
  state.silmeOnay = t.value || "";
  const btn = document.querySelector('[data-action="silme-uygula"]');
  if (btn) {
    const gecerli = (typeof silmeOnayGecerliMi === "function")
      ? silmeOnayGecerliMi(t.value)
      : /^(sil|s[iı]l)$/i.test((t.value || "").trim());
    btn.disabled = !gecerli;
    btn.style.background = gecerli ? "#C62828" : "var(--muted)";
  }
}, true);

/* ---------------- DEĞİŞİM (change) OLAYLARI ----------------
   Satır içi onchange="" CSP tarafından engellendiği için
   data-change özniteliği ile merkezi olarak yönetilir. */
document.addEventListener("change", (e) => {
  const el = e.target.closest("[data-change]");
  if (!el) return;
  const tur = el.dataset.change;

  if (tur === "exp-stok-toggle") {
    const kutu = document.getElementById("exp-stok-alanlari");
    if (kutu) kutu.style.display = el.checked ? "block" : "none";
    return;
  }

  if (tur === "set-booking-doctor") {
    if (!state.bookingForm) state.bookingForm = {};
    state.bookingForm.doctor = el.value;
    return;
  }

  if (tur === "yedek-dosya") {
    if (typeof yedekDosyaSecildi === "function" && el.files && el.files[0]) {
      yedekDosyaSecildi(el);
    }
    return;
  }
});

/* ---------------- TIKLAMA OLAYLARI ---------------- */

let _entrySoundPlayed = false;
document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-action]");
  if (!el) return;
  const action = el.dataset.action;

  if (!_entrySoundPlayed) { _entrySoundPlayed = true; playSound("login"); }
  else if (action !== "send-chat") playSound("click"); // sendChat kendi tık sesini zaten çalıyor

  // Doktorlar
  if (typeof doktorAction === "function" && doktorAction(action, el)) return;

  // Hesap ve veri silme (KVKK / mağaza zorunluluğu)
  if (typeof hesapSilAction === "function" && hesapSilAction(el, action)) return;

  // İade/değişim + ürün yorumları + harita
  if (typeof iadeAction === "function" && iadeAction(el, action)) return;

  // Hesap merkezi (kayıt, giriş, siparişler, adresler, kuponlar)
  if (typeof hesapAction === "function" && hesapAction(el, action)) return;

  // Kargo takip (müşteri)
  if (typeof kargoAction === "function" && kargoAction(el, action)) return;

  // Diş sağlığı bilgileri / fırçalama zamanlayıcısı / bilgi testi
  if (typeof bilgiAction === "function" && bilgiAction(el, action)) return;

  // Mağaza
  if (typeof magazaAction === "function" && magazaAction(action, el)) return;

  // Hasta portalı
  if (typeof portalAction === "function" && portalAction(action, el)) return;

  // KVKK modülü
  if (typeof kvkkAction === "function" && kvkkAction(action, el)) return;

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
  if (action === "pick-time") {
    state.bookingForm.time = el.dataset.time;
    state.rvSaatGrup = parseInt(el.dataset.time.split(":")[0]);
    state.bookingStatus = "idle";
    render();
  }
  if (action === "submit-booking") {
    const f = state.bookingForm;
    if (!(f.date && f.time && f.name && f.phone)) return;
    // Bot tuzağı: görünmez alan doldurulmuşsa sessizce durdur
    if (typeof gvTuzakDolu === "function" && gvTuzakDolu()) return;
    if (!f.kvkk) { alert("Devam etmek için KVKK aydınlatma metnini onaylamanız gerekir."); return; }

    const booker = state.user || guestUser();
    const note = document.getElementById("f-note")?.value?.trim() || "";

    state.bookingStatus = "saving"; render();

    const entry = {
      date: f.date, time: f.time, name: f.name, phone: f.phone,
      note, service: "Muayene",
      doctor: f.doctor || "",
      status: "bekliyor",
      kvkkOnay: true,
      kvkkTarih: new Date().toISOString(),
      uid: booker.uid,
      misafir: !state.user || state.user.isGuest,
      createdAt: new Date().toISOString()
    };

    (async () => {
      /* Her durumda YERELE kaydet — asla kaybolmasın */
      const yerelKayit = { id: "rv_" + Date.now(), ...entry };
      state.appointments.push(yerelKayit);
      persist("nurdis_appointments", state.appointments);

      /* Buluta gönder — başarısız olursa kuyruğa girer */
      let bulutOk = false;
      if (typeof bulutaYaz === "function") {
        const r = await bulutaYaz("appointment", entry);
        bulutOk = !!r.ok;
        if (!bulutOk) {
          console.warn("Randevu kuyruğa alındı:", r.neden, r.izinHatasi ? "(yetki)" : "");
        }
      }

      state.lastBooking = entry;
      state.myAppointments.push({ id: Date.now(), ...entry });
      state.bookingStatus = bulutOk ? "done" : "done_offline";
      state.bookingForm = { date: "", time: "", name: "", phone: "", note: "", kvkk: false, doctor: "" };
      playSound("success");
      render();
      window.scrollTo(0, 0);
    })();
  }

  if (action === "submit-contact") {
    const c = state.contactForm;
    if (!(c.name && c.msg)) return;
    // Bot tuzağı: görünmez alan doldurulmuşsa sessizce durdur
    if (typeof gvTuzakDolu === "function" && gvTuzakDolu()) return;
    state.contactStatus = "saving"; render();
    (async () => {
      try {
        if (window.fb && state.fbReady) {
          await Promise.race([
            window.fb.addMessage(c),
            new Promise((r) => setTimeout(r, 8000))
          ]).catch(() => {});
        }
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
  if (action === "checkout-giris") {
    state.hesapMod = "kayit";
    state.screen = "account";
    state.checkoutStatus = "idle";
    render();
    window.scrollTo(0, 0);
    return;
  }

  if (action === "puan-kullan") {
    const deger = parseInt((document.getElementById("ck-puan")?.value || "0").replace(/\D/g, "")) || 0;
    const pd = (typeof puanlarim === "function") ? puanlarim() : { bakiye: 0 };
    if (deger < 500) { alert("En az 500 puan kullanabilirsiniz."); return; }
    if (deger > pd.bakiye) { alert("Bakiyeniz yetersiz. Mevcut: " + pd.bakiye + " puan"); return; }
    const ust = Math.floor(cartTotal() * 100);
    if (deger > ust) { alert("Sepet tutarından fazla puan kullanamazsınız."); return; }
    state.kullanPuan = deger;
    render();
    return;
  }

  if (action === "puan-tumu") {
    const pd = (typeof puanlarim === "function") ? puanlarim() : { bakiye: 0 };
    const ust = Math.floor(cartTotal() * 100);
    state.kullanPuan = Math.min(pd.bakiye, ust);
    render();
    return;
  }

  if (action === "puan-kaldir") {
    state.kullanPuan = 0;
    render();
    return;
  }

  if (action === "kargo-etiket") {
    const o = (state.orders || []).find(x => x.id === el.dataset.id);
    if (o && typeof kargoEtiketiYazdir === "function") kargoEtiketiYazdir(o);
    return;
  }

  if (action === "checkout-adres") {
    const a = (typeof adreslerim === "function") ? adreslerim().find(x => x.id === el.dataset.id) : null;
    if (!a) return;
    state.checkoutAdresId = a.id;
    state.checkoutForm = {
      name: a.ad || "", phone: a.tel || "",
      address: ((a.il || "") + " " + (a.acik || "")).trim()
    };
    render();
    return;
  }

  if (action === "kupon-uygula") {
    const kod = (document.getElementById("ck-kupon")?.value || "").trim().toUpperCase();
    if (!kod) { alert("Kupon kodu girin."); return; }
    const liste = (typeof kuponlarim === "function") ? kuponlarim() : [];
    const k = liste.find(x => x.kod === kod);
    if (!k) { alert("Böyle bir kupon bulunamadı."); return; }
    const uygun = (typeof kuponGecerliMi === "function") ? kuponGecerliMi(k, cartTotal()) : { ok: true };
    if (!uygun.ok) { alert("Kupon kullanılamıyor:\n\n" + uygun.mesaj); return; }
    state.sepetKupon = kod;
    render();
    return;
  }

  if (action === "kupon-kaldir") {
    state.sepetKupon = null;
    render();
    return;
  }

  if (action === "goto-checkout") {
    /* Kapı: giriş yapmamış kullanıcı sipariş akışına giremez */
    if (!state.user || !state.user.uid || state.user.isGuest) {
      state.hesapMod = "kayit";
      state.screen = "account";
      state.hesapHata = "";
      render();
      window.scrollTo(0, 0);
      return;
    }
    state.checkoutStatus = "form";
    render();
  }
  if (action === "back-to-store") { state.checkoutStatus = "idle"; render(); }
  if (action === "submit-order") {
    const c = state.checkoutForm;

    /* ============ KAPI 1: HESAP ZORUNLU ============
       Misafir (giriş yapmamış) kullanıcı ASLA sipariş veremez.
       Hem arayüzde hem burada kontrol ediliyor. */
    if (!state.user || !state.user.uid || state.user.isGuest) {
      state.hesapMod = "kayit";
      state.screen = "account";
      state.hesapHata = "";
      state.checkoutStatus = "idle";
      if (typeof showNotif === "function") showNotif("🔐 Giriş gerekli", "Sipariş vermek için hesap oluşturun.");
      render();
      window.scrollTo(0, 0);
      return;
    }

    /* ============ KAPI 2: ZORUNLU ALANLAR ============ */
    if (!(c.name && c.phone && c.address)) {
      alert("Lütfen ad soyad, telefon ve adres alanlarını doldurun.");
      return;
    }
    if (!(state.cart && Object.keys(state.cart).length)) {
      alert("Sepetiniz boş.");
      return;
    }

    /* ============ SEPET ============ */
    const items = [];
    const all = allProducts();
    for (const cat of all) for (const pr of cat.items) {
      if (state.cart[pr.id]) items.push({ id: pr.id, name: pr.name, qty: state.cart[pr.id], price: pr.price });
    }

    /* ============ KUPON ============ */
    let indirim = 0;
    if (state.sepetKupon && typeof kuponlarim === "function") {
      const k = kuponlarim().find(x => x.kod === state.sepetKupon);
      if (k) indirim = kuponIndirimi(k, cartTotal());
    }

    /* ============ PUAN ============ */
    let puanInd = 0, kullanilanPuan = 0;
    if ((accNum(state.kullanPuan) || 0) > 0 && typeof puanParaDegeri === "function") {
      kullanilanPuan = accNum(state.kullanPuan);
      puanInd = puanParaDegeri(kullanilanPuan);
    }

    const toplam = Math.max(0, cartTotal() - indirim - puanInd);

    const entry = Object.assign({}, c, {
      items, total: toplam,
      araToplam: cartTotal(),
      indirim: indirim || 0,
      puanIndirim: puanInd || 0,
      kullanilanPuan: kullanilanPuan || 0,
      kupon: state.sepetKupon || "",
      durum: "yeni",
      uid: state.user.uid,
      musteriEmail: state.user.email || ""
    });

    (async () => {
      let yeniId = null;
      try {
        if (window.fb && state.fbReady) {
          const ref = await Promise.race([
            window.fb.addOrder(entry),
            new Promise((r) => setTimeout(() => r(null), 8000))
          ]).catch(() => null);
          if (ref && ref.id) yeniId = ref.id;
        } else {
          let list = [];
          try { list = JSON.parse(localStorage.getItem("nurdis_orders") || "[]"); } catch (e) {}
          yeniId = "o" + Date.now();
          list.push(Object.assign({ id: yeniId }, entry));
          persist("nurdis_orders", list);
        }

        /* Siparişi ANINDA listeye ekle (müşteri hemen görsün) */
        try {
          const yerel = Object.assign({}, entry, {
            id: yeniId || ("o" + Date.now()),
            createdAt: new Date().toISOString()
          });
          if (!Array.isArray(state.orders)) state.orders = [];
          if (!state.orders.some(o => o.id === yerel.id)) state.orders.unshift(yerel);
          try { localStorage.setItem("nurdis_orders_cache", JSON.stringify(state.orders)); } catch (e) {}
        } catch (e) {}

        /* Kuponu kullanıldı işaretle */
        if (state.sepetKupon) {
          try {
            const kk = JSON.parse(localStorage.getItem("nurdis_kullanilan_kupon") || "[]");
            if (kk.indexOf(state.sepetKupon) === -1) kk.push(state.sepetKupon);
            localStorage.setItem("nurdis_kullanilan_kupon", JSON.stringify(kk));
            state.kullanilanKuponlar = kk;
          } catch (e) {}
        }

        /* Puan harca */
        if (kullanilanPuan > 0 && typeof puanHarca === "function") {
          puanHarca(kullanilanPuan, "Siparişte kullanıldı");
        }

        /* Stok düşümü */
        if (typeof stokDusumSiparis === "function") {
          try { stokDusumSiparis(entry); } catch (e) {}
        }

        /* Puan kazan */
        if (typeof puanKazan === "function") {
          try {
            const kaz = puanKazan({ total: toplam, id: yeniId || Date.now() });
            if (kaz > 0) setTimeout(() => {
              if (typeof showNotif === "function") showNotif("💎 " + kaz + " puan kazandınız!", "Hesabınızdan takip edebilirsiniz.");
            }, 700);
          } catch (e) {}
        }

        /* Temizlik + Siparişlerim'e yönlendir */
        state.kullanilanPuan = 0;
        state.sepetKupon = null;
        state.cart = {};
        state.checkoutForm = { name: "", phone: "", address: "" };
        state.checkoutAdresId = null;
        state.checkoutStatus = "idle";
        state.screen = "account";
        state.hesapSekme = "siparisler";
        state.hesapSiparisAcik = yeniId || null;

        try {
          if (typeof showNotif === "function") showNotif("✅ Siparişiniz alındı", "Siparişlerim bölümünden takip edebilirsiniz.");
        } catch (e) {}
        render();
        window.scrollTo(0, 0);
      } catch (err) {
        state.checkoutStatus = "idle";
        alert("Sipariş oluşturulamadı.\n\n" + (err && err.message ? err.message : "Bilinmeyen hata"));
        render();
      }
    })();
    return;
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

    /* STOK OTOMATİK DÜŞÜM — tedaviye tanımlı malzemeler stoktan düşer */
    let stokMesaji = "";
    if (state.stokOtoAktif !== false && typeof stokOtomatikDusum === "function") {
      try {
        const islemId = "tr_" + Date.now();
        const sd = stokOtomatikDusum(treatmentName, islemId);
        if (sd && sd.yapildi && sd.detay && sd.detay.length) {
          const eksik = sd.detay.filter(d => d.yetersiz);
          const tamam = sd.detay.filter(d => !d.yetersiz);
          if (tamam.length) {
            stokMesaji += "\n\n📦 Stoktan düşüldü:\n" + tamam.map(d => "  • " + d.ad + " " + d.dusecek.toFixed(2) + " " + d.birim + " (kalan " + d.kalan.toFixed(2) + ")").join("\n");
          }
          if (eksik.length) {
            stokMesaji += "\n\n⚠️ Stok yetersiz:\n" + eksik.map(d => "  • " + d.ad + " (mevcut " + d.mevcut + " " + d.birim + ", gereken " + d.istenen.toFixed(2) + ")").join("\n");
          }
          treatmentData.stokDusum = sd.detay;
        }
      } catch (err) { console.warn("Stok düşüm hatası:", err); }
    }

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
        msg += stokMesaji;
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
  if (action === "yazdir") { try { window.print(); } catch (e) {} return; }
  if (action === "set-info-tab") {
    state.infoTab = el.dataset.id;
    render();
  }
  if (action === "guvenlik-yedek") {
    if (typeof yedekIndir === "function") {
      yedekIndir();
      try { localStorage.setItem("nurdis_son_yedek", new Date().toISOString()); } catch (e) {}
      if (typeof gvDenetim === "function") gvDenetim("yedek", "Güvenlik panelinden yedek alındı");
      render();
    }
    return;
  }

  if (action === "guvenlik-log-temizle") {
    if (!confirm("Güvenlik kayıtları temizlensin mi?\n\n(Buluttaki admin_log kayıtları silinmez, orada durur.)")) return;
    try { localStorage.removeItem("nurdis_gv_log"); } catch (e) {}
    render();
    return;
  }

  if (action === "admin-google-giris") {
    if (!window.fb || !window.fb.adminGoogleSignIn) { state.adminError = "Giriş sistemi hazır değil, birkaç saniye sonra dene."; render(); return; }
    state.authBusy = true; state.adminError = ""; render();
    window.fb.adminGoogleSignIn().then((res) => {
      state.authBusy = false;
      if (res.ok) {
        gvBasariliGiris();
        state.adminLoggedIn = true;
        localStorage.setItem("nurdis_admin_logged_in", "true");
        state.adminError = ""; state.screen = "admin-panel";
        gvOturumBaslat();
        startAdminSubscriptions();
        playSound("login");
        gvDenetim("giris", "Google ile yönetici girişi");
        state.adminGoogleUsed = true;
        try { localStorage.setItem("nurdis_gv_google", "1"); } catch (e) {}
      } else {
        gvHataliGiris();
        state.adminError = res.error || "Google girişi başarısız.";
        playSound("error");
      }
      render();
    }).catch(() => { state.authBusy = false; render(); });
    return;
  }

  if (action === "admin-mfa-dogrula") {
    if (!window.fb || !window.fb.adminMfaDogrula) return;
    const kod = (document.getElementById("ad-mfa-kod") || {}).value || "";
    state.authBusy = true; state.adminError = ""; render();
    window.fb.adminMfaDogrula(kod).then((res) => {
      state.authBusy = false;
      if (res.ok) {
        state.adminMfa = false; state.adminMfaYontem = null;
        gvBasariliGiris();
        state.adminLoggedIn = true;
        localStorage.setItem("nurdis_admin_logged_in", "true");
        state.adminError = ""; state.screen = "admin-panel";
        gvOturumBaslat();
        startAdminSubscriptions();
        playSound("login");
        gvDenetim("giris", "İki adımlı doğrulama ile giriş");
      } else {
        state.adminError = res.error || "Kod doğrulanamadı.";
        playSound("error");
      }
      render();
    }).catch(() => { state.authBusy = false; render(); });
    return;
  }

  if (action === "admin-mfa-iptal") {
    state.adminMfa = false; state.adminMfaYontem = null; state.adminError = "";
    if (window.fb && window.fb.signOutNow) { try { window.fb.signOutNow(); } catch (e) {} }
    render();
    return;
  }

  if (action === "admin-login") {
    if (!window.fb) { state.adminError = "Giriş sistemi henüz hazır değil, birkaç saniye sonra tekrar dene."; render(); return; }

    /* GÜVENLİK: kaba kuvvet (brute force) koruması
       5 hatalı denemeden sonra 15 dakika kilit. */
    const kilit = (typeof gvKilitDurumu === "function") ? gvKilitDurumu() : { kilitli: false, deneme: 0 };
    if (kilit.kilitli) {
      state.adminError = "Çok fazla hatalı deneme. Güvenlik için " + kilit.kalanDk + " dakika sonra tekrar deneyin.";
      playSound("error"); render(); return;
    }

    state.authBusy = true; state.adminError = ""; render();
    window.fb.adminSignIn(state.adminForm.email, state.adminForm.pass).then((res) => {
      state.authBusy = false;
      if (res.ok) {
        gvBasariliGiris();
        state.adminLoggedIn = true;
        localStorage.setItem("nurdis_admin_logged_in", "true");
        state.adminError = ""; state.screen = "admin-panel";
        state.adminGoogleUsed = false;
        try { localStorage.removeItem("nurdis_gv_google"); } catch (e) {}
        gvOturumBaslat();          // zaman aşımı sayacı başlar
        startAdminSubscriptions();
        playSound("login");
      } else if (res.mfa) {
        /* Şifre doğru, ikinci faktör gerekiyor */
        state.adminMfa = true;
        state.adminMfaYontem = res.yontem || "totp";
        state.adminError = "";
        state.authBusy = false;
        render();
        setTimeout(() => {
          const el = document.getElementById("ad-mfa-kod");
          if (el) el.focus();
        }, 120);
        return;
      } else {
        const k = gvHataliGiris();
        /* E-posta mı şifre mi yanlış — SÖYLENMEZ (hesap keşfini engeller) */
        state.adminError = k.kilitli
          ? "Çok fazla hatalı deneme. " + GV.KILIT_DK + " dakika kilitlendi."
          : "E-posta veya şifre hatalı. (" + k.deneme + "/" + GV.DENEME_LIMIT + ")";
        playSound("error");
      }
      render();
    }).catch(() => { state.authBusy = false; render(); });
  }
  if (action === "admin-tab") {
    state.adminTab = el.dataset.tab;
    render();
  }
  if (action === "admin-logout") {
    stopAdminSubscriptions();
    if (window.fb) window.fb.signOutUser();
    gvOturumBitir("cikis");
    state.screen = "home"; render();
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
