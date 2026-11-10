/* =====================================================================
   🌍 NUR DİŞ — ÇOK DİLLİ ARAYÜZ (i18n) · v1
   =====================================================================
   NE YAPAR
   --------
   1) Sözlük (NURDIS_SOZLUK): Türkçe metin → 4 dil (en / ar / de / es)
   2) DOM ÇEVİRİCİ (ceviriUygula): her render'dan sonra ekrandaki TÜM
      metinleri (buton, başlık, etiket, placeholder, title, alt) çevirir.
      Böylece 26 ayrı JS dosyasındaki yüzlerce metni tek tek değiştirmek
      gerekmez — tek merkezden yönetilir.
   3) RTL: Arapça seçilince <html dir="rtl"> + Arapça font yığını.
   4) Sayı/tarih biçimi seçilen dile göre (toLocaleString).
   5) Eksik çeviri olursa Türkçe kalır (kırık ekran yok) ve konsola
      eksik anahtar basılmaz (performans).

   NEDEN BÖYLE
   -----------
   Kodun tamamı Türkçe yazıldı (26 modül, ~1.1 MB). Her dosyayı tek tek
   t(key) çağrılarına çevirmek hem riskli hem gereksiz: DOM çevirici
   aynı işi tek geçişte yapıyor ve yeni eklenen ekranları da otomatik
   kapsıyor. Anahtar tabanlı sözlük ise t() çağrıları için korunuyor.

   KAPSAM
   ------
   ✅ Arayüz: menüler, butonlar, başlıklar, form alanları, hata mesajları,
      mağaza, sepet, siparişler, hesap, randevu, kargo, yorumlar, KVKK,
      ayarlar, fırçalama, chatbot, diş sağlığı ekranlarının BAŞLIK/ETİKETLERİ
   ⚠️ Uzun makale gövdeleri (diş sağlığı 12 sekmesinin içerikleri) şimdilik
      Türkçe — tıbbi içerik, hekim onayı olmadan çevrilmemeli.
   ===================================================================== */

const NURDIS_SOZLUK = {
  "Şifreniz": { en: "Your password", ar: "كلمة المرور", de: "Dein Passwort", es: "Tu contraseña" },
  "Diş sağlığı hakkında soru sormak ve fotoğraf göndermek için önce giriş yapmanız gerekiyor.": { en: "You need to sign in first to ask about dental health and send a photo.", ar: "تحتاج إلى تسجيل الدخول أولًا للسؤال عن صحة الأسنان وإرسال صورة.", de: "Du musst dich zuerst anmelden, um zur Zahngesundheit zu fragen und ein Foto zu senden.", es: "Primero debes iniciar sesión para preguntar sobre salud dental y enviar una foto." },
  "Arayüz dili Türkçe olarak ayarlandı.": { en: "Interface language set to Turkish.", ar: "تم تعيين لغة الواجهة إلى التركية.", de: "Sprache auf Türkisch gesetzt.", es: "Idioma de la interfaz establecido en turco." },
  "— Fark etmez —": { en: "— No preference —", ar: "— لا فرق —", de: "— Egal —", es: "— Sin preferencia —" },
  "Fark etmez": { en: "No preference", ar: "لا فرق", de: "Egal", es: "Sin preferencia" },
  "Fırça": { en: "Brush", ar: "الفرشاة", de: "Bürste", es: "Cepillo" },
  "Klinikten teslim": { en: "Pick up at clinic", ar: "الاستلام من العيادة", de: "Abholung in der Klinik", es: "Recogida en clínica" },
  "Muayene": { en: "Examination", ar: "فحص", de: "Untersuchung", es: "Examen" },
  "Seçiniz": { en: "Select", ar: "اختر", de: "Auswählen", es: "Seleccionar" },
  "Seçin": { en: "Select", ar: "اختر", de: "Auswählen", es: "Seleccionar" },
  "Zorunlu": { en: "Required", ar: "إلزامي", de: "Erforderlich", es: "Obligatorio" },
  "Toplam": { en: "Total", ar: "الإجمالي", de: "Gesamt", es: "Total" },
  "Adet": { en: "Quantity", ar: "الكمية", de: "Menge", es: "Cantidad" },
  "Sepet": { en: "Cart", ar: "السلة", de: "Warenkorb", es: "Carrito" },
  "Sepetim": { en: "My Cart", ar: "سلتي", de: "Mein Warenkorb", es: "Mi carrito" },
  "Devam Et": { en: "Continue", ar: "متابعة", de: "Weiter", es: "Continuar" },
  "Ücretsiz": { en: "Free", ar: "مجاني", de: "Kostenlos", es: "Gratis" },
  "Giriş yapıldı": { en: "Signed in", ar: "تم تسجيل الدخول", de: "Angemeldet", es: "Sesión iniciada" },
  "Bugün": { en: "Today", ar: "اليوم", de: "Heute", es: "Hoy" },
  "Yarın": { en: "Tomorrow", ar: "غدًا", de: "Morgen", es: "Mañana" },
  "HAZIR": { en: "READY", ar: "جاهز", de: "BEREIT", es: "LISTO" },
  "DURDUR": { en: "STOP", ar: "إيقاف", de: "STOPP", es: "DETENER" },
  "SIFIRLA": { en: "RESET", ar: "إعادة", de: "RESET", es: "REINICIAR" },
  "ℹ️ Arapça seçildiğinde ekran yönü sağdan sola (RTL) olur ve Arapça font kullanılır. Çeviri anında uygulanır; uygulamayı yeniden başlatman gerekmez.": { en: "ℹ️ When Arabic is selected, the screen direction becomes right-to-left (RTL) and an Arabic font is used. The translation applies instantly; no restart needed.", ar: "ℹ️ عند اختيار العربية يصبح اتجاه الشاشة من اليمين إلى اليسار ويُستخدم خط عربي. يُطبَّق الترجمة فورًا دون إعادة تشغيل التطبيق.", de: "ℹ️ Bei Auswahl von Arabisch wird die Bildschirmrichtung rechts-nach-links (RTL) und eine arabische Schrift verwendet. Die Übersetzung wird sofort angewendet, kein Neustart nötig.", es: "ℹ️ Al elegir árabe, la pantalla pasa a derecha-izquierda (RTL) y se usa una fuente árabe. La traducción se aplica al instante, sin reiniciar." },
  "Arapça seçildiğinde ekran yönü sağdan sola (RTL) olur ve Arapça font kullanılır. Çeviri anında uygulanır; uygulamayı yeniden başlatman gerekmez.": { en: "When Arabic is selected, the screen becomes right-to-left (RTL) and an Arabic font is used. Translation applies instantly; no restart needed.", ar: "عند اختيار العربية يصبح اتجاه الشاشة من اليمين إلى اليسار ويُستخدم خط عربي، وتُطبَّق الترجمة فورًا دون إعادة تشغيل التطبيق.", de: "Bei Auswahl von Arabisch wird die Ansicht rechts-nach-links (RTL) und eine arabische Schrift verwendet. Die Übersetzung erfolgt sofort, ohne Neustart.", es: "Al elegir árabe, la pantalla pasa a derecha-izquierda (RTL) y se usa una fuente árabe. La traducción se aplica al instante, sin reiniciar." },
  "Diş sağlığı asistanınız.": { en: "Your dental health assistant.", ar: "مساعدك لصحة الأسنان.", de: "Dein Zahngesundheits-Assistent.", es: "Tu asistente de salud dental." },
  "Diş sağlığı hakkında soru sormak ve fotoğraf göndermek için giriş yapın.": { en: "Sign in to ask about dental health and send a photo.", ar: "سجّل الدخول للسؤال عن صحة الأسنان وإرسال صورة.", de: "Melde dich an, um zur Zahngesundheit zu fragen und ein Foto zu senden.", es: "Inicia sesión para preguntar sobre salud dental y enviar una foto." },
  "Diş sağlığı hakkında soru sormak ve fotoğraf göndermek için": { en: "To ask about dental health and send a photo,", ar: "للسؤال عن صحة الأسنان وإرسال صورة،", de: "Um zur Zahngesundheit zu fragen und ein Foto zu senden,", es: "Para preguntar sobre salud dental y enviar una foto," },
  "giriş yapın.": { en: "sign in.", ar: "سجّل الدخول.", de: "melde dich an.", es: "inicia sesión." },
  "Nur Diş & Dental Klinik": { en: "Nur Diş & Dental Clinic", ar: "نور دیش وعيادة الأسنان", de: "Nur Diş & Zahnklinik", es: "Nur Diş & Clínica Dental" },
  "Hizmetler": { en: "Services", ar: "الخدمات", de: "Leistungen", es: "Servicios" },
  "Yeni sürüm hazır — yenilemek için dokun": { en: "New version ready — tap to refresh", ar: "إصدار جديد جاهز — اضغط للتحديث", de: "Neue Version bereit — zum Aktualisieren tippen", es: "Nueva versión lista — toca para actualizar" },
  "Ana Sayfa": { en: "Home", ar: "الرئيسية", de: "Startseite", es: "Inicio" },
  "Randevu": { en: "Appointment", ar: "موعد", de: "Termin", es: "Cita" },
  "Diğer": { en: "More", ar: "المزيد", de: "Mehr", es: "Más" },
  "Gülümsemenin adresi": { en: "The address of your smile", ar: "عنوان ابتسامتك", de: "Die Adresse deines Lächelns", es: "La dirección de tu sonrisa" },
  "Yeni ürün": { en: "New product", ar: "منتج جديد", de: "Neues Produkt", es: "Producto nuevo" },
  "Sepete Ekle": { en: "Add to cart", ar: "أضف إلى السلة", de: "In den Warenkorb", es: "Añadir al carrito" },
  "Geç →": { en: "Skip →", ar: "تخطي →", de: "Überspringen →", es: "Saltar →" },
  "GÜLÜŞÜNÜ TASARLA": { en: "DESIGN YOUR SMILE", ar: "صمّم ابتسامتك", de: "LÄCHELN GESTALTEN", es: "DISEÑA TU SONRISA" },
  "Hoş geldiniz!": { en: "Welcome!", ar: "أهلاً وسهلاً!", de: "Willkommen!", es: "¡Bienvenido!" },
  "Diş Muayenesi & Kontrol": { en: "Dental Exam & Check-up", ar: "فحص وتقييم الأسنان", de: "Zahnuntersuchung & Kontrolle", es: "Examen y control dental" },
  "Diş Temizliği (Detertraj)": { en: "Teeth Cleaning (Scaling)", ar: "تنظيف الأسنان (إزالة الجير)", de: "Zahnreinigung (Zahnsteinentfernung)", es: "Limpieza dental (detartraje)" },
  "Dolgu": { en: "Filling", ar: "حشوة", de: "Füllung", es: "Empaste" },
  "Kanal Tedavisi": { en: "Root Canal Treatment", ar: "علاج قناة الجذر", de: "Wurzelbehandlung", es: "Endodoncia" },
  "Diş Çekimi": { en: "Tooth Extraction", ar: "خلع الأسنان", de: "Zahnextraktion", es: "Extracción dental" },
  "Diş Beyazlatma": { en: "Teeth Whitening", ar: "تبييض الأسنان", de: "Zahnaufhellung", es: "Blanqueamiento dental" },
  "Giriş Yap": { en: "Sign In", ar: "تسجيل الدخول", de: "Anmelden", es: "Iniciar sesión" },
  "5 olası neden · 1-3 gün": { en: "5 possible causes · 1-3 days", ar: "5 أسباب محتملة · 1-3 أيام", de: "5 mögliche Ursachen · 1-3 Tage", es: "5 posibles causas · 1-3 días" },
  "6 olası neden · Rutin": { en: "6 possible causes · Routine", ar: "6 أسباب محتملة · روتيني", de: "6 mögliche Ursachen · Routine", es: "6 posibles causas · Rutina" },
  "Mardin, Kızıltepe TOKİ'de güven veren bakım.": { en: "Trusted care in Kızıltepe TOKİ, Mardin.", ar: "رعاية موثوقة في كيزيلتيبي توكي، ماردين.", de: "Vertrauensvolle Betreuung in Kızıltepe TOKİ, Mardin.", es: "Atención de confianza en Kızıltepe TOKİ, Mardin." },
  "Hızlı randevu": { en: "Quick appointment", ar: "موعد سريع", de: "Schneller Termin", es: "Cita rápida" },
  "60 saniyede muayene randevusu oluştur, biz seni arayalım.": { en: "Create an appointment in 60 seconds, we will call you.", ar: "احجز موعد الفحص في 60 ثانية وسنتصل بك.", de: "Erstelle in 60 Sekunden einen Termin, wir rufen dich an.", es: "Crea una cita en 60 segundos, nosotros te llamamos." },
  "Randevu al →": { en: "Book now →", ar: "احجز الآن →", de: "Termin buchen →", es: "Reservar cita →" },
  "Klinik sorumlu hekimi · 5 yıl deneyim": { en: "Chief dentist · 5 years experience", ar: "الطبيب المسؤول عن العيادة · خبرة 5 سنوات", de: "Leitender Zahnarzt · 5 Jahre Erfahrung", es: "Odontólogo responsable · 5 años de experiencia" },
  "Yıllık Deneyim": { en: "Years of Experience", ar: "سنوات الخبرة", de: "Jahre Erfahrung", es: "Años de experiencia" },
  "Years Experience": { en: "Years of Experience", ar: "سنوات الخبرة", de: "Jahre Erfahrung", es: "Años de experiencia" },
  "Tedavi Çeşidi": { en: "Treatment Types", ar: "أنواع العلاجات", de: "Behandlungsarten", es: "Tipos de tratamiento" },
  "Treatment Types": { en: "Treatment Types", ar: "أنواع العلاجات", de: "Behandlungsarten", es: "Tipos de tratamiento" },
  "Gün Açık": { en: "Days Open", ar: "أيام العمل", de: "Tage geöffnet", es: "Días abiertos" },
  "Days Open": { en: "Days Open", ar: "أيام العمل", de: "Tage geöffnet", es: "Días abiertos" },
  "Steril Ortam": { en: "Sterile Environment", ar: "بيئة معقمة", de: "Sterile Umgebung", es: "Ambiente estéril" },
  "Sterile Care": { en: "Sterile Care", ar: "بيئة معقمة", de: "Sterile Umgebung", es: "Ambiente estéril" },
  "HIZLI ERİŞİM": { en: "QUICK ACCESS", ar: "وصول سريع", de: "SCHNELLZUGRIFF", es: "ACCESO RÁPIDO" },
  "RANDEVU AL": { en: "BOOK APPOINTMENT", ar: "احجز موعد", de: "TERMIN BUCHEN", es: "RESERVAR CITA" },
  "DİŞ SAĞLIĞI": { en: "DENTAL HEALTH", ar: "صحة الأسنان", de: "ZAHNGESUNDHEIT", es: "SALUD DENTAL" },
  "DOKTORLAR": { en: "DOCTORS", ar: "الأطباء", de: "ÄRZTE", es: "DOCTORES" },
  "MAĞAZA": { en: "STORE", ar: "المتجر", de: "SHOP", es: "TIENDA" },
  "KAMPANYA": { en: "CAMPAIGNS", ar: "العروض", de: "AKTIONEN", es: "PROMOCIONES" },
  "HESABIM": { en: "MY ACCOUNT", ar: "حسابي", de: "MEIN KONTO", es: "MI CUENTA" },
  "Öne çıkan hizmetler": { en: "Featured services", ar: "خدمات مميزة", de: "Empfohlene Leistungen", es: "Servicios destacados" },
  "Modern teknoloji ve uzman kadromuzla sağlıklı gülüşler tasarlıyoruz.": { en: "We design healthy smiles with modern technology and our expert team.", ar: "نصمم ابتسامات صحية بأحدث التقنيات وفريقنا المتخصص.", de: "Mit moderner Technologie und unserem Expertenteam gestalten wir gesunde Lächeln.", es: "Diseñamos sonrisas saludables con tecnología moderna y nuestro equipo experto." },
  "TÜM MENÜ →": { en: "ALL MENU →", ar: "كل القائمة →", de: "GESAMTES MENÜ →", es: "MENÚ COMPLETO →" },
  "Nur Diş Mağaza": { en: "Nur Diş Store", ar: "متجر نور دیش", de: "Nur Diş Shop", es: "Tienda Nur Diş" },
  "Kayıt Ol": { en: "Sign Up", ar: "إنشاء حساب", de: "Registrieren", es: "Registrarse" },
  "Hasta Portalı": { en: "Patient Portal", ar: "بوابة المريض", de: "Patientenportal", es: "Portal del paciente" },
  "Kartlara dokunarak detay, görsel ve tanıtım videosunu görebilirsin.": { en: "Tap the cards to see details, images and the promotional video.", ar: "اضغط على البطاقات لعرض التفاصيل والصور والفيديو التعريفي.", de: "Tippe auf die Karten, um Details, Bilder und das Werbevideo zu sehen.", es: "Toca las tarjetas para ver detalles, imágenes y el vídeo promocional." },
  "Genel ağız sağlığı kontrolü ve yönlendirme.": { en: "General oral health check-up and guidance.", ar: "فحص عام لصحة الفم والإرشاد.", de: "Allgemeine Mundgesundheitskontrolle und Beratung.", es: "Revisión general de salud bucal y orientación." },
  "Diş taşı ve leke temizliği, parlatma.": { en: "Tartar and stain removal, polishing.", ar: "إزالة الجير والتصبغات والتلميع.", de: "Zahnstein- und Verfärbungsentfernung, Polieren.", es: "Eliminación de sarro y manchas, pulido." },
  "Estetik kompozit dolgu uygulamaları.": { en: "Aesthetic composite filling applications.", ar: "حشوات تجميلية مركبة.", de: "Ästhetische Kompositfüllungen.", es: "Empastes compuestos estéticos." },
  "Ağrısız kanal tedavisi, tek/çok seans.": { en: "Painless root canal treatment, single/multiple sessions.", ar: "علاج قناة الجذر بدون ألم، جلسة واحدة أو أكثر.", de: "Schmerzfreie Wurzelbehandlung, eine oder mehrere Sitzungen.", es: "Endodoncia sin dolor, una o varias sesiones." },
  "Basit ve cerrahi çekim işlemleri.": { en: "Simple and surgical extraction procedures.", ar: "عمليات خلع بسيطة وجراحية.", de: "Einfache und chirurgische Extraktionen.", es: "Extracciones simples y quirúrgicas." },
  "Ofis tipi profesyonel beyazlatma.": { en: "Office-type professional whitening.", ar: "تبييض احترافي في العيادة.", de: "Professionelles Bleaching in der Praxis.", es: "Blanqueamiento profesional en clínica." },
  "İmplant": { en: "Implant", ar: "زراعة الأسنان", de: "Implantat", es: "Implante" },
  "Tek dişten tam çeneye implant çözümleri.": { en: "Implant solutions from a single tooth to a full jaw.", ar: "حلول زراعة من سن واحد إلى الفك الكامل.", de: "Implantatlösungen vom Einzelzahn bis zum ganzen Kiefer.", es: "Soluciones de implantes desde un diente hasta una mandíbula completa." },
  "Zirkonyum Kaplama": { en: "Zirconia Crown", ar: "تلبيسة الزيركون", de: "Zirkonkrone", es: "Corona de zirconio" },
  "Doğal görünümlü, dayanıklı diş kaplaması.": { en: "Natural-looking, durable dental crown.", ar: "تلبيسة أسنان متينة بمظهر طبيعي.", de: "Natürlich aussehende, langlebige Zahnkrone.", es: "Corona dental duradera de aspecto natural." },
  "Ortodonti (Tel Tedavisi)": { en: "Orthodontics (Braces)", ar: "تقويم الأسنان", de: "Kieferorthopädie (Zahnspange)", es: "Ortodoncia (Brackets)" },
  "Şeffaf plak ve metal braket seçenekleri.": { en: "Clear aligner and metal bracket options.", ar: "خيارات التقويم الشفاف والأقواس المعدنية.", de: "Optionen für transparente Schienen und Metallbrackets.", es: "Opciones de alineadores transparentes y brackets metálicos." },
  "Şeffaf Plak": { en: "Clear Aligner", ar: "التقويم الشفاف", de: "Transparente Schiene", es: "Alineador transparente" },
  "Görünmez, çıkarılabilir diş düzeltme plakları.": { en: "Invisible, removable dental alignment trays.", ar: "أطباق تقويم غير مرئية وقابلة للإزالة.", de: "Unsichtbare, herausnehmbare Zahnschienen.", es: "Férulas de alineación invisibles y removibles." },
  "Köprü": { en: "Bridge", ar: "الجسر", de: "Brücke", es: "Puente" },
  "Eksik dişler için sabit köprü protezi.": { en: "Fixed bridge prosthesis for missing teeth.", ar: "جسر ثابت لتعويض الأسنان المفقودة.", de: "Feste Brückenprothese für fehlende Zähne.", es: "Prótesis de puente fijo para dientes faltantes." },
  "Doktorlarımız": { en: "Our Doctors", ar: "أطباؤنا", de: "Unsere Ärzte", es: "Nuestros doctores" },
  "Kliniğimizde görev yapan uzman hekimler": { en: "Specialist dentists working at our clinic", ar: "أطباء متخصصون في عيادتنا", de: "Spezialisten in unserer Klinik", es: "Odontólogos especialistas de nuestra clínica" },
  "Diş Hekimi — Klinik Sorumlusu": { en: "Dentist — Clinical Director", ar: "طبيب أسنان — مسؤول العيادة", de: "Zahnarzt — Klinikleitung", es: "Odontólogo — Responsable clínico" },
  "Henüz değerlendirilmedi": { en: "Not rated yet", ar: "لم يُقيَّم بعد", de: "Noch nicht bewertet", es: "Aún sin valorar" },
  "Genel Diş Hekimliği": { en: "General Dentistry", ar: "طب الأسنان العام", de: "Allgemeine Zahnheilkunde", es: "Odontología general" },
  "5 yıllık klinik deneyim.": { en: "5 years of clinical experience.", ar: "خبرة سريرية 5 سنوات.", de: "5 Jahre klinische Erfahrung.", es: "5 años de experiencia clínica." },
  "Doktorunu seç:": { en: "Choose your doctor:", ar: "اختر طبيبك:", de: "Wähle deinen Arzt:", es: "Elige a tu doctor:" },
  "Randevu alırken hekim tercihini belirtebilirsin.": { en: "You can specify your doctor preference when booking an appointment.", ar: "يمكنك تحديد الطبيب المفضل عند الحجز.", de: "Bei der Terminbuchung kannst du deinen Wunscharzt angeben.", es: "Puedes indicar tu doctor preferido al reservar." },
  "Her hekimin uzmanlık alanı ve hasta değerlendirmeleri aşağıda.": { en: "Each doctor's specialty and patient reviews are below.", ar: "تخصص كل طبيب وتقييمات المرضى أدناه.", de: "Fachgebiet und Patientenbewertungen jedes Arztes findest du unten.", es: "La especialidad y las valoraciones de cada doctor están abajo." },
  "Cihazlarımız": { en: "Our Devices", ar: "أجهزتنا", de: "Unsere Geräte", es: "Nuestros equipos" },
  "Son teknoloji, yapay zeka destekli görüntüleme ve üretim cihazları. Kartlara dokunarak tanıtım videosunu izleyebilirsin.": { en: "State-of-the-art, AI-supported imaging and production devices. Tap the cards to watch the promotional video.", ar: "أجهزة تصوير وإنتاج حديثة مدعومة بالذكاء الاصطناعي. اضغط على البطاقات لمشاهدة الفيديو التعريفي.", de: "Modernste, KI-gestützte Bildgebungs- und Fertigungsgeräte. Tippe auf die Karten, um das Video zu sehen.", es: "Equipos de imagen y producción de última generación con IA. Toca las tarjetas para ver el vídeo." },
  "CBCT (Konik Işınlı Bilgisayarlı Tomografi)": { en: "CBCT (Cone Beam Computed Tomography)", ar: "التصوير المقطعي المحوسب بالأشعة المخروطية (CBCT)", de: "CBCT (Digitale Volumentomographie)", es: "CBCT (Tomografía computarizada de haz cónico)" },
  "Çene ve diş yapısını 3 boyutlu olarak, milimetrik hassasiyetle görüntüler. Özellikle implant planlamasında sinir kanalı, kemik yoğunluğu ve yapının tam konumunu görmemizi sağlar — bu da işlemi çok daha öngörülebilir ve güvenli hale getirir.": { en: "It images the jaw and tooth structure in 3D with millimetric precision. Especially in implant planning, it lets us see the nerve canal, bone density and exact position — making the procedure far more predictable and safe.", ar: "يصوّر الفك وبنية الأسنان ثلاثية الأبعاد بدقة ملليمترية. وفي تخطيط الزراعة يسمح برؤية قناة العصب وكثافة العظم والموضع الدقيق، مما يجعل العملية أكثر أمانًا وقابلية للتوقع.", de: "Es bildet Kiefer und Zahnstruktur in 3D mit millimetergenauer Präzision ab. Besonders bei der Implantatplanung sehen wir Nervenkanal, Knochendichte und exakte Lage — das macht den Eingriff vorhersehbarer und sicherer.", es: "Imagen 3D de la mandíbula y los dientes con precisión milimétrica. En la planificación de implantes permite ver el conducto nervioso, la densidad ósea y la posición exacta, haciendo el procedimiento más predecible y seguro." },
  "Ağız İçi 3D Tarayıcı (İntraoral Scanner)": { en: "Intraoral 3D Scanner", ar: "الماسح الضوئي داخل الفم ثلاثي الأبعاد", de: "Intraoraler 3D-Scanner", es: "Escáner intraoral 3D" },
  "Klasik ölçü kaşığı ve ölçü maddesi yerine ağız içini birkaç dakikada dijital olarak tarar. Kusma hissi ya da rahatsızlık olmadan, çok daha konforlu ve hassas bir ölçü alma deneyimi sunar.": { en: "Instead of the classic impression tray and material, it digitally scans the inside of the mouth in minutes. It offers a far more comfortable and precise impression experience without gagging or discomfort.", ar: "بدلاً من ملعقة الطبع التقليدية، يمسح داخل الفم رقميًا في دقائق، ويوفر تجربة طبع أكثر راحة ودقة دون شعور بالغثيان أو الانزعاج.", de: "Statt klassischem Abdrucklöffel und -material scannt er den Mundraum in Minuten digital. Das ist deutlich komfortabler und präziser, ohne Würgereiz oder Unbehagen.", es: "En lugar de la cubeta y el material clásicos, escanea digitalmente el interior de la boca en minutos. Ofrece una experiencia mucho más cómoda y precisa, sin náuseas ni molestias." },
  "3D Yazıcı": { en: "3D Printer", ar: "طابعة ثلاثية الأبعاد", de: "3D-Drucker", es: "Impresora 3D" },
  "Şeffaf plak, cerrahi rehber ve geçici protez modellerini dijital tasarımdan doğrudan üretir. Bu sayede üretim süresi kısalır ve hassasiyet artar.": { en: "It produces clear aligners, surgical guides and temporary prosthesis models directly from the digital design. This shortens production time and increases precision.", ar: "تُنتج التقويم الشفاف والأدلة الجراحية ونماذج التركيبات المؤقتة مباشرة من التصميم الرقمي، مما يقصر وقت الإنتاج ويزيد الدقة.", de: "Er fertigt transparente Schienen, chirurgische Schablonen und Prothesenmodelle direkt aus dem digitalen Design. Das verkürzt die Herstellungszeit und erhöht die Präzision.", es: "Produce alineadores transparentes, guías quirúrgicas y modelos de prótesis temporales directamente del diseño digital. Reduce el tiempo de producción y aumenta la precisión." },
  "Dijital Panoramik Röntgen": { en: "Digital Panoramic X-ray", ar: "الأشعة البانورامية الرقمية", de: "Digitales Panoramaschicht-Röntgen", es: "Radiografía panorámica digital" },
  "Tüm ağız yapısını, çeneleri ve diş köklerini tek karede, klasik filme göre çok daha düşük radyasyon dozuyla görüntüler. Sonuç saniyeler içinde ekranda incelenebilir.": { en: "It images the entire mouth, jaws and tooth roots in one frame with a much lower radiation dose than classic film. The result can be examined on screen within seconds.", ar: "تصوّر الفم والفكين وجذور الأسنان في صورة واحدة بجرعة إشعاع أقل بكثير من الفيلم التقليدي، ويمكن فحص النتيجة على الشاشة في ثوانٍ.", de: "Bildet den gesamten Mund, die Kiefer und Zahnwurzeln in einem Bild mit deutlich geringerer Strahlendosis als klassischer Film ab. Das Ergebnis ist in Sekunden am Bildschirm sichtbar.", es: "Captura toda la boca, mandíbulas y raíces en una sola imagen con mucha menos radiación que la película clásica. El resultado se ve en pantalla en segundos." },
  "Diş Taşı Temizleme Ünitesi (Ultrasonik Scaler)": { en: "Tartar Removal Unit (Ultrasonic Scaler)", ar: "وحدة إزالة الجير (مقياس فوق صوتي)", de: "Zahnsteinentfernungsgerät (Ultraschall-Scaler)", es: "Unidad de limpieza de sarro (ultrasonido)" },
  "Diş taşı ve renklenmeleri diş minesine zarar vermeden, ultrasonik titreşimle nazikçe temizler.": { en: "It gently removes tartar and stains with ultrasonic vibration without damaging the enamel.", ar: "يزيل الجير والتصبغات بلطف بالاهتزاز فوق الصوتي دون الإضرار بمينا الأسنان.", de: "Entfernt Zahnstein und Verfärbungen schonend durch Ultraschallvibration, ohne den Zahnschmelz zu schädigen.", es: "Elimina suavemente el sarro y las manchas con vibración ultrasónica sin dañar el esmalte." },
  "LED Beyazlatma Sistemi": { en: "LED Whitening System", ar: "نظام التبييض بالليد", de: "LED-Aufhellungssystem", es: "Sistema de blanqueamiento LED" },
  "Özel jel ile birlikte kullanılan LED ışık sistemi, tek seansta belirgin ve güvenli bir beyazlatma sonucu sağlar.": { en: "The LED light system used with a special gel provides a noticeable and safe whitening result in a single session.", ar: "نظام الليد المستخدم مع جل خاص يمنح نتيجة تبييض واضحة وآمنة في جلسة واحدة.", de: "Das LED-Lichtsystem mit Spezialgel sorgt in einer Sitzung für ein deutliches und sicheres Aufhellungsergebnis.", es: "El sistema LED con gel especial ofrece un resultado de blanqueamiento visible y seguro en una sola sesión." },
  "Yorumlar": { en: "Reviews", ar: "التقييمات", de: "Bewertungen", es: "Reseñas" },
  "Müşterilerimizin deneyimleri.": { en: "Our customers' experiences.", ar: "تجارب عملائنا.", de: "Erfahrungen unserer Kunden.", es: "Experiencias de nuestros clientes." },
  "Yorum yapmak için Google ile giriş yapman gerekiyor.": { en: "You need to sign in with Google to write a review.", ar: "تحتاج إلى تسجيل الدخول بجوجل لكتابة تقييم.", de: "Du musst dich mit Google anmelden, um eine Bewertung zu schreiben.", es: "Debes iniciar sesión con Google para escribir una reseña." },
  "Google ile Giriş Yap": { en: "Sign in with Google", ar: "تسجيل الدخول بجوجل", de: "Mit Google anmelden", es: "Iniciar sesión con Google" },
  "Henüz yorum yok — ilk yorumu sen yapabilirsin!": { en: "No reviews yet — you can be the first!", ar: "لا توجد تقييمات بعد — يمكنك أن تكون الأول!", de: "Noch keine Bewertungen — schreib die erste!", es: "Aún no hay reseñas — ¡puedes ser el primero!" },
  "Ağız Bakım Ürünleri": { en: "Oral Care Products", ar: "منتجات العناية بالفم", de: "Mundpflegeprodukte", es: "Productos de cuidado bucal" },
  "Hoş geldiniz!": { en: "Welcome!", ar: "أهلاً وسهلاً!", de: "Willkommen!", es: "¡Bienvenido!" },
  "Sipariş takibi ve kuponlar için giriş yapın": { en: "Sign in to track orders and use coupons", ar: "سجّل الدخول لمتابعة الطلبات والكوبونات", de: "Melde dich an für Bestellverfolgung und Gutscheine", es: "Inicia sesión para seguir pedidos y cupones" },
  "Giriş": { en: "Sign In", ar: "تسجيل الدخول", de: "Anmelden", es: "Entrar" },
  "Tümü": { en: "All", ar: "الكل", de: "Alle", es: "Todo" },
  "Çocuk Ürünleri": { en: "Kids' Products", ar: "منتجات الأطفال", de: "Kinderprodukte", es: "Productos infantiles" },
  "Yetişkin Ürünleri": { en: "Adult Products", ar: "منتجات البالغين", de: "Produkte für Erwachsene", es: "Productos para adultos" },
  "Önerilen": { en: "Recommended", ar: "موصى به", de: "Empfohlen", es: "Recomendado" },
  "Fiyat ↑": { en: "Price ↑", ar: "السعر ↑", de: "Preis ↑", es: "Precio ↑" },
  "Fiyat ↓": { en: "Price ↓", ar: "السعر ↓", de: "Preis ↓", es: "Precio ↓" },
  "İndirim": { en: "Discount", ar: "خصم", de: "Rabatt", es: "Descuento" },
  "Yeni": { en: "New", ar: "جديد", de: "Neu", es: "Nuevo" },
  "Favoriler": { en: "Favorites", ar: "المفضلة", de: "Favoriten", es: "Favoritos" },
  "Çocuk Diş Fırçası (Yumuşak, Karakterli)": { en: "Kids' Toothbrush (Soft, Character)", ar: "فرشاة أسنان للأطفال (ناعمة، بشخصيات)", de: "Kinderzahnbürste (weich, mit Motiv)", es: "Cepillo infantil (suave, con personaje)" },
  "Çocuk Diş Macunu (Florürsüz, Meyveli)": { en: "Kids' Toothpaste (Fluoride-free, Fruit)", ar: "معجون أسنان للأطفال (بدون فلورايد، بنكهة الفواكه)", de: "Kinderzahnpasta (fluoridfrei, Frucht)", es: "Pasta infantil (sin flúor, de frutas)" },
  "Diş Fırçası (Orta Sertlik)": { en: "Toothbrush (Medium)", ar: "فرشاة أسنان (متوسطة)", de: "Zahnbürste (mittelhart)", es: "Cepillo de dientes (medio)" },
  "Diş Macunu (Florürlü)": { en: "Toothpaste (Fluoride)", ar: "معجون أسنان (بالفلورايد)", de: "Zahnpasta (mit Fluorid)", es: "Pasta de dientes (con flúor)" },
  "Diş Macunu (Hassas Dişler İçin)": { en: "Toothpaste (For Sensitive Teeth)", ar: "معجون أسنان (للأسنان الحساسة)", de: "Zahnpasta (für empfindliche Zähne)", es: "Pasta de dientes (para dientes sensibles)" },
  "Ağız Gargarası (Alkolsüz)": { en: "Mouthwash (Alcohol-free)", ar: "غسول فم (بدون كحول)", de: "Mundspülung (alkoholfrei)", es: "Enjuague bucal (sin alcohol)" },
  "Diş İpi": { en: "Dental Floss", ar: "خيط الأسنان", de: "Zahnseide", es: "Hilo dental" },
  "Ağız Duşu (Irrigatör)": { en: "Oral Irrigator", ar: "جهاز تنظيف الأسنان بالماء", de: "Munddusche (Irrigator)", es: "Irrigador bucal" },
  "Ev Tipi Beyazlatma Kiti": { en: "Home Whitening Kit", ar: "طقم تبييض منزلي", de: "Heim-Aufhellungsset", es: "Kit de blanqueamiento casero" },
  "Ortodontik Fırça (Tel Tedavisi İçin)": { en: "Orthodontic Brush (For Braces)", ar: "فرشاة تقويم (للأقواس)", de: "Orthodontische Zahnbürste (für Zahnspange)", es: "Cepillo ortodóntico (para brackets)" },
  "Teslimat:": { en: "Delivery:", ar: "التوصيل:", de: "Lieferung:", es: "Entrega:" },
  "Klinikten teslim veya kargo": { en: "Pick-up at clinic or shipping", ar: "الاستلام من العيادة أو الشحن", de: "Abholung in der Klinik oder Versand", es: "Recogida en clínica o envío" },
  "Ödeme:": { en: "Payment:", ar: "الدفع:", de: "Zahlung:", es: "Pago:" },
  "Nakit, kredi kartı, havale": { en: "Cash, credit card, bank transfer", ar: "نقدًا، بطاقة ائتمان، تحويل بنكي", de: "Bargeld, Kreditkarte, Überweisung", es: "Efectivo, tarjeta de crédito, transferencia" },
  "Orijinal ürün garantisi": { en: "Original product guarantee", ar: "ضمان المنتج الأصلي", de: "Garantie auf Originalprodukt", es: "Garantía de producto original" },
  "Ürün, marka veya kategori ara...": { en: "Search product, brand or category...", ar: "ابحث عن منتج أو علامة أو فئة...", de: "Produkt, Marke oder Kategorie suchen...", es: "Buscar producto, marca o categoría..." },
  "Randevu Al": { en: "Book Appointment", ar: "احجز موعدًا", de: "Termin buchen", es: "Reservar cita" },
  "Giriş yapmadan da randevu alabilirsiniz.": { en: "You can book an appointment without signing in.", ar: "يمكنك الحجز دون تسجيل الدخول.", de: "Du kannst auch ohne Anmeldung einen Termin buchen.", es: "Puedes reservar cita sin iniciar sesión." },
  "Misafir olarak": { en: "As a guest", ar: "كضيف", de: "Als Gast", es: "Como invitado" },
  "randevu alabilirsiniz. Sadece ad ve telefon yeterli.": { en: "you can book an appointment. Just your name and phone number are enough.", ar: "يمكنك الحجز. يكفي الاسم ورقم الهاتف فقط.", de: "kannst du einen Termin buchen. Name und Telefonnummer genügen.", es: "puedes reservar cita. Solo tu nombre y teléfono son suficientes." },
  "Hizmet": { en: "Service", ar: "الخدمة", de: "Leistung", es: "Servicio" },
  "Tarih": { en: "Date", ar: "التاريخ", de: "Datum", es: "Fecha" },
  "Saat": { en: "Time", ar: "الوقت", de: "Uhrzeit", es: "Hora" },
  "24 saat açık · 15 dk aralık": { en: "24 hours open · 15 min intervals", ar: "متاح 24 ساعة · فترات 15 دقيقة", de: "24 Stunden geöffnet · 15-Minuten-Intervalle", es: "Abierto 24 horas · intervalos de 15 min" },
  "Saat seçin, ardından dakikayı seçin": { en: "Choose the hour, then the minute", ar: "اختر الساعة ثم الدقيقة", de: "Wähle die Stunde, dann die Minuten", es: "Elige la hora y luego los minutos" },
  "Hekim Tercihi": { en: "Doctor Preference", ar: "تفضيل الطبيب", de: "Arztwahl", es: "Preferencia de doctor" },
  "isteğe bağlı": { en: "optional", ar: "اختياري", de: "optional", es: "opcional" },
  "Hekim seçmezseniz uygun hekim atanır": { en: "If you don't choose, a suitable doctor will be assigned", ar: "إن لم تختر، سيتم تعيين طبيب مناسب", de: "Ohne Auswahl wird ein passender Arzt zugewiesen", es: "Si no eliges, se asignará un doctor adecuado" },
  "Bu alanı boş bırakın": { en: "Leave this field blank", ar: "اترك هذا الحقل فارغًا", de: "Dieses Feld leer lassen", es: "Deja este campo vacío" },
  "Ad Soyad": { en: "Full Name", ar: "الاسم الكامل", de: "Vollständiger Name", es: "Nombre completo" },
  "Telefon": { en: "Phone", ar: "الهاتف", de: "Telefon", es: "Teléfono" },
  "Not (isteğe bağlı)": { en: "Note (optional)", ar: "ملاحظة (اختياري)", de: "Notiz (optional)", es: "Nota (opcional)" },
  "Kişisel verilerimin işlenmesine onay veriyorum.": { en: "I consent to the processing of my personal data.", ar: "أوافق على معالجة بياناتي الشخصية.", de: "Ich stimme der Verarbeitung meiner personenbezogenen Daten zu.", es: "Doy mi consentimiento al tratamiento de mis datos personales." },
  "Randevu ve tedavi amacıyla ad, telefon ve sağlık bilgilerimin": { en: "For appointment and treatment purposes, my name, phone and health information", ar: "لأغراض الموعد والعلاج، اسمي وهاتفي ومعلوماتي الصحية", de: "Zum Zweck von Termin und Behandlung meine Angaben zu Name, Telefon und Gesundheit", es: "Con fines de cita y tratamiento, mi nombre, teléfono y datos de salud" },
  "KVKK Aydınlatma Metni": { en: "KVKK Privacy Notice", ar: "إشعار حماية البيانات KVKK", de: "KVKK-Datenschutzhinweis", es: "Aviso de privacidad KVKK" },
  "kapsamında işlenmesini kabul ediyorum.": { en: "I accept the processing within its scope.", ar: "أقبل معالجتها في نطاقه.", de: "Ich akzeptiere die Verarbeitung im Rahmen dieser Erklärung.", es: "Acepto su tratamiento dentro de ese marco." },
  "Randevuyu Onayla": { en: "Confirm Appointment", ar: "تأكيد الموعد", de: "Termin bestätigen", es: "Confirmar cita" },
  "Kliniğimiz": { en: "Our Clinic", ar: "عيادتنا", de: "Unsere Klinik", es: "Nuestra clínica" },
  "Mardin, Kızıltepe, TOKİ Mahallesi": { en: "Mardin, Kızıltepe, TOKİ District", ar: "ماردين، كيزيلتيبي، حي توكي", de: "Mardin, Kızıltepe, TOKİ-Viertel", es: "Mardin, Kızıltepe, barrio TOKİ" },
  "Haritada Aç": { en: "Open in Maps", ar: "افتح في الخريطة", de: "In Karten öffnen", es: "Abrir en el mapa" },
  "Adınız Soyadınız": { en: "Your Full Name", ar: "اسمك الكامل", de: "Dein Vor- und Nachname", es: "Tu nombre completo" },
  "Örn: diş ağrım var": { en: "e.g. I have a toothache", ar: "مثال: عندي ألم في الأسنان", de: "z. B. Ich habe Zahnschmerzen", es: "p. ej. me duele un diente" },
  "Yapay zeka ile yeni gülüşünü gör.": { en: "See your new smile with artificial intelligence.", ar: "شاهد ابتسامتك الجديدة بالذكاء الاصطناعي.", de: "Sieh dein neues Lächeln mit künstlicher Intelligenz.", es: "Mira tu nueva sonrisa con inteligencia artificial." },
  "Fotoğrafını yükle, AI ile yeni gülüşünü gör!": { en: "Upload your photo, see your new smile with AI!", ar: "ارفع صورتك وشاهد ابتسامتك الجديدة بالذكاء الاصطناعي!", de: "Lade dein Foto hoch und sieh dein neues Lächeln mit KI!", es: "¡Sube tu foto y mira tu nueva sonrisa con IA!" },
  "Nasıl Kullanılır:": { en: "How to use:", ar: "كيفية الاستخدام:", de: "Anleitung:", es: "Cómo usarlo:" },
  "1. Fotoğrafını yükle (yüzün net görünsün)": { en: "1. Upload your photo (face clearly visible)", ar: "1. ارفع صورتك (يظهر وجهك بوضوح)", de: "1. Lade dein Foto hoch (Gesicht deutlich sichtbar)", es: "1. Sube tu foto (rostro bien visible)" },
  "2. \"Liberty\" smile engine'i seç (ücretsiz)": { en: "2. Choose the \"Liberty\" smile engine (free)", ar: "2. اختر محرك الابتسامة \"Liberty\" (مجاني)", de: "2. Wähle die \"Liberty\"-Smile-Engine (kostenlos)", es: "2. Elige el motor de sonrisa \"Liberty\" (gratis)" },
  "3. Hollywood gülüşünü gör ve indir!": { en: "3. See and download your Hollywood smile!", ar: "3. شاهد ابتسامتك الهوليوودية وحمّلها!", de: "3. Sieh dein Hollywood-Lächeln und lade es herunter!", es: "3. ¡Mira y descarga tu sonrisa de Hollywood!" },
  "İpucu:": { en: "Tip:", ar: "نصيحة:", de: "Tipp:", es: "Consejo:" },
  "\"Liberty\" smile engine ücretsizdir. Fotoğrafını yükle, Hollywood gülüşünü gör, indir ve kliniğimize getir!": { en: "The \"Liberty\" smile engine is free. Upload your photo, see your Hollywood smile, download it and bring it to our clinic!", ar: "محرك الابتسامة \"Liberty\" مجاني. ارفع صورتك، شاهد ابتسامتك الهوليوودية، حمّلها وأحضرها إلى عيادتنا!", de: "Die \"Liberty\"-Smile-Engine ist kostenlos. Lade dein Foto hoch, sieh dein Hollywood-Lächeln, lade es herunter und bring es in unsere Klinik!", es: "¡El motor de sonrisa \"Liberty\" es gratis! Sube tu foto, mira tu sonrisa de Hollywood, descárgala y tráela a nuestra clínica." },
  "Diş Sağlığı Bilgileri": { en: "Dental Health Information", ar: "معلومات صحة الأسنان", de: "Zahngesundheitsinformationen", es: "Información de salud dental" },
  "Semptom kontrolü, tedavi rehberi ve yaş gruplarına göre bilgiler.": { en: "Symptom checker, treatment guide and information by age group.", ar: "فحص الأعراض ودليل العلاج ومعلومات حسب الفئة العمرية.", de: "Symptomcheck, Behandlungsleitfaden und Infos nach Altersgruppe.", es: "Comprobador de síntomas, guía de tratamientos e información por edad." },
  "Semptom Kontrol": { en: "Symptom Checker", ar: "فحص الأعراض", de: "Symptomcheck", es: "Comprobador de síntomas" },
  "Tedavi Rehberi": { en: "Treatment Guide", ar: "دليل العلاج", de: "Behandlungsleitfaden", es: "Guía de tratamientos" },
  "Acil Durum": { en: "Emergency", ar: "حالة طارئة", de: "Notfall", es: "Emergencia" },
  "Bebek": { en: "Baby", ar: "رضيع", de: "Baby", es: "Bebé" },
  "Çocuk": { en: "Child", ar: "طفل", de: "Kind", es: "Niño" },
  "Yetişkin": { en: "Adult", ar: "بالغ", de: "Erwachsener", es: "Adulto" },
  "65+ Yaş": { en: "Age 65+", ar: "فوق 65 سنة", de: "Ab 65 Jahren", es: "Mayores de 65" },
  "Özel Durumlar": { en: "Special Cases", ar: "حالات خاصة", de: "Besondere Fälle", es: "Casos especiales" },
  "Karşılaştırma": { en: "Comparison", ar: "مقارنة", de: "Vergleich", es: "Comparación" },
  "Doğru Bilinen Yanlışlar": { en: "Common Myths", ar: "مفاهيم خاطئة شائعة", de: "Verbreitete Irrtümer", es: "Mitos comunes" },
  "Şifalı Bitkiler": { en: "Medicinal Herbs", ar: "أعشاب طبية", de: "Heilpflanzen", es: "Plantas medicinales" },
  "Bilgi Testi": { en: "Knowledge Quiz", ar: "اختبار المعلومات", de: "Wissenstest", es: "Cuestionario" },
  "Fırçalama": { en: "Brushing", ar: "تنظيف الأسنان", de: "Zähneputzen", es: "Cepillado" },
  "Zamanlayıcı": { en: "Timer", ar: "المؤقت", de: "Timer", es: "Temporizador" },
  "Şikayetinizi seçin": { en: "Choose your complaint", ar: "اختر شكواك", de: "Wähle deine Beschwerde", es: "Elige tu molestia" },
  "Olası nedenleri, şimdi ne yapmanız gerektiğini ve ne zaman gelmeniz gerektiğini görün.": { en: "See possible causes, what to do now and when you should come in.", ar: "اطّلع على الأسباب المحتملة وما يجب فعله الآن ومتى يجب أن تحضر.", de: "Sieh mögliche Ursachen, was jetzt zu tun ist und wann du kommen solltest.", es: "Consulta posibles causas, qué hacer ahora y cuándo deberías venir." },
  "Dişim ağrıyor / zonkluyor": { en: "My tooth aches / throbs", ar: "سنّي يؤلمني / ينبض", de: "Mein Zahn schmerzt / pocht", es: "Me duele / late un diente" },
  "Soğuk-sıcağa hassasiyet": { en: "Sensitivity to cold and heat", ar: "حساسية ضد البرد والحرارة", de: "Empfindlichkeit gegen Kälte und Hitze", es: "Sensibilidad al frío y al calor" },
  "Çiğnerken ağrı": { en: "Pain when chewing", ar: "ألم عند المضغ", de: "Schmerzen beim Kauen", es: "Dolor al masticar" },
  "Diş etim kanıyor": { en: "My gums bleed", ar: "لثتي تنزف", de: "Mein Zahnfleisch blutet", es: "Me encía sangra" },
  "Diş etim şiş / kızarık": { en: "My gums are swollen / red", ar: "لثتي متورمة / محمرة", de: "Mein Zahnfleisch ist geschwollen / gerötet", es: "Mis encías están hinchadas / rojas" },
  "Ağız kokusu": { en: "Bad breath", ar: "رائحة الفم الكريهة", de: "Mundgeruch", es: "Mal aliento" },
  "Dişim sallanıyor": { en: "My tooth is loose", ar: "سنّي متحرك", de: "Mein Zahn wackelt", es: "Se me mueve un diente" },
  "Dişim kırıldı / çatladı": { en: "My tooth broke / cracked", ar: "سنّي مكسور / متشقق", de: "Mein Zahn ist gebrochen / gesprungen", es: "Se me rompió / partió un diente" },
  "Ağzımda yara / aft": { en: "Sore / canker in my mouth", ar: "تقرح في فمي", de: "Wunde / Aphthe im Mund", es: "Herida / afta en la boca" },
  "Çenem kilitleniyor / ses geliyor": { en: "My jaw locks / clicks", ar: "فكي يتوقف / يحدث صوت", de: "Mein Kiefer blockiert / knackt", es: "Se me bloquea la mandíbula / hace ruido" },
  "Dişlerim sarardı / renklendi": { en: "My teeth are yellowed / stained", ar: "أسناني اصفرّت / تصبغت", de: "Meine Zähne sind gelb / verfärbt", es: "Mis dientes se han amarilleado" },
  "Protezim vuruyor / oturmuyor": { en: "My prosthesis rubs / doesn't fit", ar: "طقمي يجرح / لا يستقر", de: "Meine Prothese drückt / sitzt nicht", es: "Mi prótesis roza / no se asienta" },
  "Çocuğumun dişi çürüdü": { en: "My child has a cavity", ar: "سنّ طفلي مسوس", de: "Mein Kind hat Karies", es: "Mi hijo tiene caries" },
  "Bu bölüm": { en: "This section", ar: "هذا القسم", de: "Dieser Bereich", es: "Esta sección" },
  "yalnızca genel bilgilendirme": { en: "is for general information only", ar: "مخصص للمعلومات العامة فقط", de: "dient nur der allgemeinen Information", es: "es solo informativo general" },
  "amaçlıdır; tanı veya tedavi önerisi değildir.": { en: "; it is not a diagnosis or treatment recommendation.", ar: "، وليس تشخيصًا أو توصية علاجية.", de: "und ist keine Diagnose oder Behandlungsempfehlung.", es: "y no es un diagnóstico ni una recomendación de tratamiento." },
  "Şikayetiniz sürüyor ya da şiddetleniyorsa mutlaka diş hekimine başvurun.": { en: "If your complaint persists or worsens, be sure to see a dentist.", ar: "إذا استمرت شكواك أو تفاقمت فراجع طبيب أسنان.", de: "Wenn die Beschwerden anhalten oder zunehmen, suche unbedingt einen Zahnarzt auf.", es: "Si tu molestia persiste o empeora, acude sin falta a un dentista." },
  "Ara: ağrı, implant, hamilelik, çocuk…": { en: "Search: pain, implant, pregnancy, child…", ar: "ابحث: ألم، زراعة، حمل، طفل…", de: "Suchen: Schmerz, Implantat, Schwangerschaft, Kind…", es: "Buscar: dolor, implante, embarazo, niño…" },
  "Kampanyalar": { en: "Campaigns", ar: "العروض", de: "Aktionen", es: "Promociones" },
  "İndirimli ürünler ve kupon fırsatları.": { en: "Discounted products and coupon offers.", ar: "منتجات مخفضة وعروض كوبونات.", de: "Reduzierte Produkte und Gutscheinangebote.", es: "Productos rebajados y ofertas de cupones." },
  "Kampanya Zamanı": { en: "Campaign Time", ar: "وقت العروض", de: "Aktionszeit", es: "Tiempo de ofertas" },
  "Şu an aktif kampanya yok.": { en: "There is no active campaign right now.", ar: "لا يوجد عرض نشط حاليًا.", de: "Derzeit ist keine Aktion aktiv.", es: "Ahora no hay campañas activas." },
  "Şu an kampanya yok": { en: "No campaigns right now", ar: "لا توجد عروض حاليًا", de: "Derzeit keine Aktionen", es: "Ahora no hay ofertas" },
  "Yeni fırsatlar için mağazamıza göz atın.": { en: "Check our store for new offers.", ar: "تصفح متجرنا للعروض الجديدة.", de: "Schau in unserem Shop nach neuen Angeboten.", es: "Visita nuestra tienda para nuevas ofertas." },
  "Mağazaya Git": { en: "Go to Store", ar: "اذهب إلى المتجر", de: "Zum Shop", es: "Ir a la tienda" },
  "Sadakat puanınız": { en: "Your loyalty points", ar: "نقاط الولاء الخاصة بك", de: "Deine Bonuspunkte", es: "Tus puntos de fidelidad" },
  "Her alışverişinizde puan kazanırsınız. Hesabınızdan puanlarınızı görüp sepette kullanabilirsiniz.": { en: "You earn points with every purchase. You can see your points in your account and use them in the cart.", ar: "تكسب نقاطًا مع كل عملية شراء. يمكنك رؤية نقاطك في حسابك واستخدامها في السلة.", de: "Du sammelst bei jedem Einkauf Punkte. In deinem Konto siehst du sie und kannst sie im Warenkorb einlösen.", es: "Ganas puntos con cada compra. Puedes verlos en tu cuenta y usarlos en el carrito." },
  "Puanlarımı Gör": { en: "See My Points", ar: "اعرض نقاطي", de: "Meine Punkte ansehen", es: "Ver mis puntos" },
  "Hesabım": { en: "My Account", ar: "حسابي", de: "Mein Konto", es: "Mi cuenta" },
  "Siparişlerinizi takip etmek için giriş yapın.": { en: "Sign in to track your orders.", ar: "سجّل الدخول لمتابعة طلباتك.", de: "Melde dich an, um deine Bestellungen zu verfolgen.", es: "Inicia sesión para seguir tus pedidos." },
  "Siparişleriniz, adresleriniz ve kuponlarınız tek yerde.": { en: "Your orders, addresses and coupons in one place.", ar: "طلباتك وعناوينك وكوبوناتك في مكان واحد.", de: "Deine Bestellungen, Adressen und Gutscheine an einem Ort.", es: "Tus pedidos, direcciones y cupones en un solo lugar." },
  "E-posta": { en: "Email", ar: "البريد الإلكتروني", de: "E-Mail", es: "Correo electrónico" },
  "Şifre": { en: "Password", ar: "كلمة المرور", de: "Passwort", es: "Contraseña" },
  "Şifremi unuttum": { en: "Forgot my password", ar: "نسيت كلمة المرور", de: "Passwort vergessen", es: "Olvidé mi contraseña" },
  "veya": { en: "or", ar: "أو", de: "oder", es: "o" },
  "Google ile devam et": { en: "Continue with Google", ar: "المتابعة بجوجل", de: "Mit Google fortfahren", es: "Continuar con Google" },
  "Hesabınız yoksa önce": { en: "If you don't have an account, first", ar: "إن لم يكن لديك حساب، أولًا", de: "Wenn du kein Konto hast, erstelle zuerst", es: "Si no tienes cuenta, primero" },
  "sekmesinden oluşturun.": { en: "create one from the", ar: "أنشئ حسابًا من تبويب", de: "im Tab", es: "crea una desde la pestaña" },
  "Sipariş vermek için hesap gereklidir.": { en: "An account is required to place an order.", ar: "يلزم حساب لإتمام الطلب.", de: "Für eine Bestellung ist ein Konto erforderlich.", es: "Se requiere una cuenta para hacer un pedido." },
  "KARGO TAKİP": { en: "CARGO TRACKING", ar: "تتبع الشحنة", de: "SENDUNGSVERFOLGUNG", es: "SEGUIMIENTO DE ENVÍO" },
  "Takip numaranızla kargonuzun nerede olduğunu görün.": { en: "See where your cargo is with your tracking number.", ar: "اعرف مكان شحنتك برقم التتبع.", de: "Sieh mit deiner Sendungsnummer, wo dein Paket ist.", es: "Mira dónde está tu envío con tu número de seguimiento." },
  "Kendi tedavi kayıtlarınızı görün": { en: "See your own treatment records", ar: "اطّلع على سجلات علاجك", de: "Sieh deine eigenen Behandlungsunterlagen", es: "Consulta tus propios registros de tratamiento" },
  "Tedavi geçmişinizi, faturalarınızı ve belgelerinizi görmek için giriş yapın.": { en: "Sign in to see your treatment history, invoices and documents.", ar: "سجّل الدخول لرؤية تاريخ علاجك وفواتيرك ومستنداتك.", de: "Melde dich an, um deine Behandlungsgeschichte, Rechnungen und Dokumente zu sehen.", es: "Inicia sesión para ver tu historial de tratamientos, facturas y documentos." },
  "Giriş Yap / Hesap Aç": { en: "Sign In / Create Account", ar: "تسجيل الدخول / إنشاء حساب", de: "Anmelden / Konto erstellen", es: "Entrar / Crear cuenta" },
  "Neler görebilirsiniz?": { en: "What can you see?", ar: "ماذا يمكنك أن ترى؟", de: "Was kannst du sehen?", es: "¿Qué puedes ver?" },
  "Geçmiş tedavileriniz ve hekim notları": { en: "Your past treatments and doctor notes", ar: "علاجاتك السابقة وملاحظات الطبيب", de: "Deine bisherigen Behandlungen und Arztnotizen", es: "Tus tratamientos pasados y notas del doctor" },
  "Tedavi ücretleri ve faturalar": { en: "Treatment fees and invoices", ar: "أجور العلاج والفواتير", de: "Behandlungskosten und Rechnungen", es: "Tarifas de tratamiento y facturas" },
  "e-Nabız belgeleriniz, röntgenleriniz": { en: "Your e-Nabız documents and X-rays", ar: "مستندات e-Nabız والأشعة", de: "Deine e-Nabız-Dokumente und Röntgenbilder", es: "Tus documentos de e-Nabız y radiografías" },
  "Doktorunuza not gönderme": { en: "Sending a note to your doctor", ar: "إرسال ملاحظة إلى طبيبك", de: "Eine Notiz an deinen Arzt senden", es: "Enviar una nota a tu doctor" },
  "Gizlilik & KVKK": { en: "Privacy & KVKK", ar: "الخصوصية و KVKK", de: "Datenschutz & KVKK", es: "Privacidad y KVKK" },
  "Kişisel verilerinizin korunması": { en: "Protection of your personal data", ar: "حماية بياناتك الشخصية", de: "Schutz deiner personenbezogenen Daten", es: "Protección de tus datos personales" },
  "Aydınlatma": { en: "Notice", ar: "الإشعار", de: "Hinweis", es: "Aviso" },
  "Haklarım": { en: "My Rights", ar: "حقوقي", de: "Meine Rechte", es: "Mis derechos" },
  "Çerezler": { en: "Cookies", ar: "ملفات تعريف الارتباط", de: "Cookies", es: "Cookies" },
  "KVKK Aydınlatma Metni": { en: "KVKK Privacy Notice", ar: "إشعار حماية البيانات KVKK", de: "KVKK-Datenschutzhinweis", es: "Aviso de privacidad KVKK" },
  "6698 sayılı Kanun m.10 kapsamında": { en: "Under Article 10 of Law No. 6698", ar: "بموجب المادة 10 من القانون رقم 6698", de: "Gemäß Artikel 10 des Gesetzes Nr. 6698", es: "En virtud del artículo 10 de la Ley n.º 6698" },
  "Son güncelleme:": { en: "Last update:", ar: "آخر تحديث:", de: "Letzte Aktualisierung:", es: "Última actualización:" },
  "Veri Sorumlusu": { en: "Data Controller", ar: "المسؤول عن البيانات", de: "Verantwortlicher", es: "Responsable del tratamiento" },
  "Adres:": { en: "Address:", ar: "العنوان:", de: "Adresse:", es: "Dirección:" },
  "Telefon:": { en: "Phone:", ar: "الهاتف:", de: "Telefon:", es: "Teléfono:" },
  "E-posta:": { en: "Email:", ar: "البريد الإلكتروني:", de: "E-Mail:", es: "Correo:" },
  "İşlenen Kişisel Veriler": { en: "Personal Data Processed", ar: "البيانات الشخصية المعالجة", de: "Verarbeitete personenbezogene Daten", es: "Datos personales tratados" },
  "Kliniğimiz, hizmet sunumu kapsamında aşağıdaki verilerinizi işlemektedir:": { en: "Our clinic processes the following data within the scope of service provision:", ar: "تعالج عيادتنا البيانات التالية في نطاق تقديم الخدمة:", de: "Unsere Klinik verarbeitet im Rahmen der Leistungserbringung folgende Daten:", es: "Nuestra clínica trata los siguientes datos en el marco de la prestación de servicios:" },
  "Kimlik:": { en: "Identity:", ar: "الهوية:", de: "Identität:", es: "Identidad:" },
  "Ad, soyad, T.C. kimlik numarası": { en: "Name, surname, T.R. ID number", ar: "الاسم واللقب ورقم الهوية التركية", de: "Name, Nachname, T.R.-Ausweisnummer", es: "Nombre, apellido, número de identidad turca" },
  "İletişim:": { en: "Contact:", ar: "الاتصال:", de: "Kontakt:", es: "Contacto:" },
  "Telefon, e-posta, adres": { en: "Phone, email, address", ar: "الهاتف، البريد الإلكتروني، العنوان", de: "Telefon, E-Mail, Adresse", es: "Teléfono, correo, dirección" },
  "Sağlık (özel nitelikli):": { en: "Health (special category):", ar: "الصحة (فئة خاصة):", de: "Gesundheit (besondere Kategorie):", es: "Salud (categoría especial):" },
  "Tedavi bilgileri, röntgen görüntüleri, alerji bilgisi, hekim notları": { en: "Treatment information, X-ray images, allergy information, doctor notes", ar: "معلومات العلاج وصور الأشعة ومعلومات الحساسية وملاحظات الطبيب", de: "Behandlungsdaten, Röntgenbilder, Allergieangaben, Arztnotizen", es: "Información de tratamiento, radiografías, alergias y notas del doctor" },
  "Finansal:": { en: "Financial:", ar: "المالية:", de: "Finanziell:", es: "Financiero:" },
  "Ödeme kayıtları, fatura bilgileri": { en: "Payment records, invoice information", ar: "سجلات الدفع وبيانات الفاتورة", de: "Zahlungsnachweise, Rechnungsdaten", es: "Registros de pago, datos de factura" },
  "İşlem güvenliği:": { en: "Transaction security:", ar: "أمن العمليات:", de: "Transaktionssicherheit:", es: "Seguridad de la transacción:" },
  "IP adresi, tarayıcı bilgisi": { en: "IP address, browser information", ar: "عنوان IP ومعلومات المتصفح", de: "IP-Adresse, Browserinformationen", es: "Dirección IP, información del navegador" },
  "İşleme Amaçları": { en: "Purposes of Processing", ar: "أغراض المعالجة", de: "Verarbeitungszwecke", es: "Fines del tratamiento" },
  "Randevu oluşturma ve hatırlatma": { en: "Creating and reminding appointments", ar: "إنشاء المواعيد وتذكيرها", de: "Terminvergabe und Erinnerung", es: "Creación y recordatorio de citas" },
  "Teşhis, tedavi ve tıbbi takip": { en: "Diagnosis, treatment and medical follow-up", ar: "التشخيص والعلاج والمتابعة الطبية", de: "Diagnose, Behandlung und medizinische Nachsorge", es: "Diagnóstico, tratamiento y seguimiento médico" },
  "Tedavi geçmişinizin kaydı": { en: "Recording your treatment history", ar: "تسجيل تاريخ علاجك", de: "Aufzeichnung deiner Behandlungsgeschichte", es: "Registro de tu historial de tratamiento" },
  "Fatura ve muhasebe işlemleri": { en: "Invoicing and accounting operations", ar: "عمليات الفواتير والمحاسبة", de: "Rechnungs- und Buchhaltungsvorgänge", es: "Operaciones de facturación y contabilidad" },
  "Yasal bildirim yükümlülükleri (SGK, vergi)": { en: "Legal reporting obligations (SGK, tax)", ar: "التزامات الإبلاغ القانونية (الضمان الاجتماعي، الضرائب)", de: "Gesetzliche Meldepflichten (SGK, Steuern)", es: "Obligaciones legales de notificación (SGK, impuestos)" },
  "Acil durumlarda iletişim": { en: "Contact in emergencies", ar: "التواصل في الحالات الطارئة", de: "Kontakt in Notfällen", es: "Contacto en emergencias" },
  "Hizmet kalitesi ölçümü (memnuniyet anketi)": { en: "Service quality measurement (satisfaction survey)", ar: "قياس جودة الخدمة (استبيان الرضا)", de: "Servicequalitätsmessung (Zufriedenheitsumfrage)", es: "Medición de calidad (encuesta de satisfacción)" },
  "Hukuki Sebepler": { en: "Legal Grounds", ar: "الأسباب القانونية", de: "Rechtsgrundlagen", es: "Fundamentos legales" },
  "Verileriniz KVKK m.5 ve m.6 kapsamında şu sebeplerle işlenir:": { en: "Your data is processed under KVKK Art. 5 and 6 for the following reasons:", ar: "تُعالج بياناتك بموجب المادتين 5 و6 من KVKK للأسباب التالية:", de: "Deine Daten werden nach Art. 5 und 6 KVKK aus folgenden Gründen verarbeitet:", es: "Tus datos se tratan conforme a los art. 5 y 6 de la KVKK por los siguientes motivos:" },
  "Sözleşmenin kurulması veya ifası": { en: "Establishment or performance of the contract", ar: "إنشاء العقد أو تنفيذه", de: "Abschluss oder Erfüllung des Vertrags", es: "Celebración o ejecución del contrato" },
  "Hukuki yükümlülüğün yerine getirilmesi": { en: "Fulfilment of a legal obligation", ar: "الوفاء بالتزام قانوني", de: "Erfüllung einer rechtlichen Verpflichtung", es: "Cumplimiento de una obligación legal" },
  "Meşru menfaat": { en: "Legitimate interest", ar: "المصلحة المشروعة", de: "Berechtigtes Interesse", es: "Interés legítimo" },
  "Sağlık hizmeti sunan kuruluşlarca özel nitelikli veri işleme": { en: "Processing of special category data by health service providers", ar: "معالجة بيانات الفئة الخاصة من قبل مؤسسات الرعاية الصحية", de: "Verarbeitung besonderer Kategorien durch Gesundheitsdienstleister", es: "Tratamiento de datos especiales por proveedores sanitarios" },
  "Sağlık verileriniz yalnızca sır saklama yükümlülüğü altındaki hekim ve sağlık personeli tarafından işlenir.": { en: "Your health data is processed only by doctors and health personnel under a duty of confidentiality.", ar: "تُعالج بياناتك الصحية فقط من قبل الأطباء والكوادر الصحية الملتزمين بالسرية.", de: "Deine Gesundheitsdaten werden nur von Ärzten und Gesundheitspersonal unter Schweigepflicht verarbeitet.", es: "Tus datos de salud solo los tratan médicos y personal sanitario sujetos a deber de confidencialidad." },
  "Verilerin Aktarılması": { en: "Transfer of Data", ar: "نقل البيانات", de: "Datenübermittlung", es: "Transferencia de datos" },
  "Verileriniz": { en: "Your data", ar: "بياناتك", de: "Deine Daten", es: "Tus datos" },
  "üçüncü kişilerle ticari amaçla paylaşılmaz.": { en: "is not shared with third parties for commercial purposes.", ar: "لا تُشارك مع أطراف ثالثة لأغراض تجارية.", de: "wird nicht zu kommerziellen Zwecken an Dritte weitergegeben.", es: "no se comparte con terceros con fines comerciales." },
  "Yalnızca:": { en: "Only:", ar: "فقط:", de: "Nur:", es: "Solo:" },
  "sigorta bildirimleri (yasal zorunluluk)": { en: "insurance notifications (legal obligation)", ar: "إشعارات التأمين (التزام قانوني)", de: "Versicherungsmeldungen (gesetzliche Pflicht)", es: "notificaciones de seguros (obligación legal)" },
  "vergi beyannameleri (yasal zorunluluk)": { en: "tax declarations (legal obligation)", ar: "الإقرارات الضريبية (التزام قانوني)", de: "Steuererklärungen (gesetzliche Pflicht)", es: "declaraciones fiscales (obligación legal)" },
  "protez/kaplama üretimi (yalnızca gerekli bilgi)": { en: "prosthesis/crown production (only necessary information)", ar: "إنتاج التركيبات/التلبيسات (المعلومات الضرورية فقط)", de: "Prothesen-/Kronenfertigung (nur nötige Angaben)", es: "fabricación de prótesis/coronas (solo datos necesarios)" },
  "Bulut hizmet sağlayıcı": { en: "Cloud service provider", ar: "مزود خدمة السحابة", de: "Cloud-Dienstleister", es: "Proveedor de servicios en la nube" },
  "Google Firebase (veri işleyen sıfatıyla)": { en: "Google Firebase (as data processor)", ar: "Google Firebase (بصفته معالج بيانات)", de: "Google Firebase (als Auftragsverarbeiter)", es: "Google Firebase (como encargado del tratamiento)" },
  "Yurt dışına aktarım yapılmamaktadır.": { en: "No transfer abroad is made.", ar: "لا يتم نقل البيانات إلى الخارج.", de: "Es erfolgt keine Übermittlung ins Ausland.", es: "No se realiza transferencia al extranjero." },
  "Saklama Süresi": { en: "Storage Period", ar: "مدة الاحتفاظ", de: "Aufbewahrungsdauer", es: "Plazo de conservación" },
  "Sağlık kayıtları:": { en: "Health records:", ar: "السجلات الصحية:", de: "Gesundheitsakten:", es: "Registros de salud:" },
  "Tedavi sonrası": { en: "After treatment", ar: "بعد العلاج", de: "Nach der Behandlung", es: "Tras el tratamiento" },
  "(Sağlık Bakanlığı mevzuatı)": { en: "(Ministry of Health legislation)", ar: "(تشريعات وزارة الصحة)", de: "(Vorschriften des Gesundheitsministeriums)", es: "(normativa del Ministerio de Salud)" },
  "Muhasebe kayıtları:": { en: "Accounting records:", ar: "السجلات المحاسبية:", de: "Buchhaltungsunterlagen:", es: "Registros contables:" },
  "Randevu kayıtları:": { en: "Appointment records:", ar: "سجلات المواعيد:", de: "Terminunterlagen:", es: "Registros de citas:" },
  "Anket verileri:": { en: "Survey data:", ar: "بيانات الاستبيان:", de: "Umfragedaten:", es: "Datos de encuestas:" },
  "Süre sonunda verileriniz": { en: "At the end of the period, your data", ar: "في نهاية المدة، تتم", de: "Nach Ablauf der Frist werden deine Daten", es: "Al final del plazo, tus datos" },
  "silinir, yok edilir veya anonim hâle getirilir.": { en: "is deleted, destroyed or anonymised.", ar: "حذف أو إتلاف أو إخفاء هوية بياناتك.", de: "gelöscht, vernichtet oder anonymisiert.", es: "se eliminan, destruyen o anonimizan." },
  "KVKK m.11 Haklarınız": { en: "Your Rights under KVKK Art. 11", ar: "حقوقك بموجب المادة 11 من KVKK", de: "Deine Rechte nach KVKK Art. 11", es: "Tus derechos según el art. 11 de la KVKK" },
  "Kişisel verilerinizin işlenip işlenmediğini öğrenme": { en: "Learning whether your personal data is processed", ar: "معرفة ما إذا كانت بياناتك تُعالج", de: "Erfahren, ob deine Daten verarbeitet werden", es: "Saber si se tratan tus datos" },
  "İşlenmişse buna ilişkin bilgi talep etme": { en: "Requesting information if it has been processed", ar: "طلب معلومات إن كانت قد عولجت", de: "Auskunft verlangen, wenn sie verarbeitet wurden", es: "Solicitar información si se han tratado" },
  "İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme": { en: "Learning the purpose of processing and whether it is used accordingly", ar: "معرفة غرض المعالجة وما إذا كانت تُستخدم وفقًا له", de: "Zweck der Verarbeitung und zweckgemäße Nutzung erfahren", es: "Conocer el fin del tratamiento y si se usa conforme a él" },
  "Yurt içinde/yurt dışında aktarıldığı üçüncü kişileri bilme": { en: "Knowing the third parties to whom it is transferred domestically/abroad", ar: "معرفة الأطراف الثالثة التي نُقلت إليها داخل البلاد أو خارجها", de: "Kenntnis der Empfänger im In- und Ausland", es: "Conocer los terceros a los que se transfiere" },
  "Eksik veya yanlış işlenmişse": { en: "If processed incompletely or incorrectly", ar: "إذا عولجت بشكل ناقص أو خاطئ", de: "Bei unvollständiger oder falscher Verarbeitung", es: "Si se tratan de forma incompleta o incorrecta" },
  "düzeltilmesini": { en: "correction", ar: "التصحيح", de: "Berichtigung", es: "rectificación" },
  "Silinmesini veya yok edilmesini": { en: "Deletion or destruction", ar: "الحذف أو الإتلاف", de: "Löschung oder Vernichtung", es: "supresión o destrucción" },
  "Aktarıldığı üçüncü kişilere bunları bildirme": { en: "Notifying third parties to whom it was transferred", ar: "إبلاغ الأطراف الثالثة التي نُقلت إليها", de: "Benachrichtigung der Empfänger", es: "Notificar a los terceros destinatarios" },
  "Otomatik sistemlerle analiz sonucu aleyhinize çıkan sonuca": { en: "Objecting to a result against you from automated analysis", ar: "الاعتراض على نتيجة غير مواتية من التحليل الآلي", de: "Widerspruch gegen ein Ergebnis automatisierter Analyse", es: "oponerse a un resultado adverso de análisis automatizado" },
  "itiraz": { en: "objection", ar: "الاعتراض", de: "Widerspruch", es: "objeción" },
  "Kanuna aykırı işleme sebebiyle zarara uğramanız hâlinde": { en: "Claiming compensation if you suffer damage due to unlawful processing", ar: "المطالبة بالتعويض إذا لحق بك ضرر بسبب معالجة غير قانونية", de: "Schadensersatz bei rechtswidriger Verarbeitung", es: "reclamar indemnización por tratamiento ilícito" },
  "tazminat": { en: "compensation", ar: "التعويض", de: "Schadensersatz", es: "indemnización" },
  "talep etme": { en: "claiming", ar: "المطالبة", de: "verlangen", es: "reclamar" },
  "Başvuru Yolu": { en: "How to Apply", ar: "طريقة التقديم", de: "Antragsweg", es: "Vía de solicitud" },
  "Haklarınızı kullanmak için:": { en: "To exercise your rights:", ar: "لممارسة حقوقك:", de: "Zur Ausübung deiner Rechte:", es: "Para ejercer tus derechos:" },
  "Başvurunuz en geç": { en: "Your application will be answered free of charge", ar: "تتم الإجابة على طلبك مجانًا", de: "Dein Antrag wird spätestens", es: "Tu solicitud se responderá gratuitamente" },
  "içinde ücretsiz olarak yanıtlanır.": { en: "within at the latest 30 days, free of charge.", ar: "خلال 30 يومًا على الأكثر وبدون مقابل.", de: "innerhalb von 30 Tagen kostenlos beantwortet.", es: "en un plazo máximo de 30 días." },
  "Yasal Uyarı": { en: "Legal Notice", ar: "تنبيه قانوني", de: "Rechtlicher Hinweis", es: "Aviso legal" },
  "Bu metin 6698 sayılı KVKK ve ilgili ikincil mevzuat kapsamında hazırlanmıştır.": { en: "This text has been prepared under Law No. 6698 (KVKK) and related secondary legislation.", ar: "أُعدّ هذا النص بموجب القانون رقم 6698 KVKK والتشريعات الثانوية ذات الصلة.", de: "Dieser Text wurde gemäß Gesetz Nr. 6698 (KVKK) und der zugehörigen Sekundärgesetzgebung erstellt.", es: "Este texto se ha redactado conforme a la Ley n.º 6698 (KVKK) y su normativa secundaria." },
  "Metnin hukuki geçerliliği için klinik bilgilerinin doğru olması gerekir.": { en: "For the legal validity of the text, the clinic information must be accurate.", ar: "لكي يكون النص صالحًا قانونيًا يجب أن تكون معلومات العيادة صحيحة.", de: "Für die rechtliche Gültigkeit müssen die Klinikangaben korrekt sein.", es: "Para la validez legal, los datos de la clínica deben ser correctos." },
  "Nihai hukuki danışmanlık için bir avukata danışmanız önerilir.": { en: "For final legal advice, consulting a lawyer is recommended.", ar: "يُنصح باستشارة محامٍ للحصول على مشورة قانونية نهائية.", de: "Für eine abschließende Rechtsberatung wird ein Anwalt empfohlen.", es: "Se recomienda consultar a un abogado para asesoría legal definitiva." },
  "Bu metnin Türkçe aslı geçerlidir.": { en: "The Turkish original of this text prevails.", ar: "النص التركي الأصلي هو المعتمد.", de: "Der türkische Originaltext ist maßgeblich.", es: "Prevalece la versión original en turco." },
  "Ayarlar": { en: "Settings", ar: "الإعدادات", de: "Einstellungen", es: "Ajustes" },
  "Uygulama tercihlerini buradan yönetebilirsin.": { en: "Manage your app preferences here.", ar: "يمكنك إدارة تفضيلات التطبيق من هنا.", de: "Hier kannst du deine App-Einstellungen verwalten.", es: "Gestiona aquí las preferencias de la app." },
  "Uygulama sesleri": { en: "App sounds", ar: "أصوات التطبيق", de: "App-Töne", es: "Sonidos de la app" },
  "Tıklama, giriş ve bildirim sesleri": { en: "Click, login and notification sounds", ar: "أصوات النقر والدخول والإشعارات", de: "Klick-, Anmelde- und Benachrichtigungstöne", es: "Sonidos de clic, inicio y notificaciones" },
  "Açık": { en: "On", ar: "مفعّل", de: "Ein", es: "Activado" },
  "Kapalı": { en: "Off", ar: "متوقف", de: "Aus", es: "Desactivado" },
  "Uygulama dili": { en: "App language", ar: "لغة التطبيق", de: "App-Sprache", es: "Idioma de la app" },
  "Menüler, başlıklar, butonlar ve form alanları seçtiğin dile döner. Sağlık makaleleri ile KVKK metni Türkçe aslıyla gösterilir.": { en: "Menus, headings, buttons and form fields switch to your chosen language. Health articles and the KVKK notice display with their Turkish original.", ar: "تتحول القوائم والعناوين والأزرار وحقول النموذج إلى لغتك المختارة. تُعرض المقالات الصحية ونص KVKK مع الأصل التركي.", de: "Menüs, Überschriften, Buttons und Formularfelder wechseln in deine Sprache. Gesundheitsartikel und KVKK-Text werden mit dem türkischen Original angezeigt.", es: "Los menús, títulos, botones y campos cambian a tu idioma. Los artículos de salud y el texto KVKK se muestran con su original en turco." },
  "Fırçalama Zamanlayıcısı": { en: "Brushing Timer", ar: "مؤقت تنظيف الأسنان", de: "Zähnputz-Timer", es: "Temporizador de cepillado" },
  "2 dakika · 4 bölge · günde 2 kez": { en: "2 minutes · 4 areas · twice a day", ar: "دقيقتان · 4 مناطق · مرتان يوميًا", de: "2 Minuten · 4 Bereiche · 2-mal täglich", es: "2 minutos · 4 zonas · 2 veces al día" },
  "Hazır": { en: "Ready", ar: "جاهز", de: "Bereit", es: "Listo" },
  "Başlat": { en: "Start", ar: "ابدأ", de: "Starten", es: "Empezar" },
  "Durdur": { en: "Stop", ar: "إيقاف", de: "Stopp", es: "Detener" },
  "Sıfırla": { en: "Reset", ar: "إعادة تعيين", de: "Zurücksetzen", es: "Reiniciar" },
  "4 bölge · her biri 30 saniye": { en: "4 areas · 30 seconds each", ar: "4 مناطق · 30 ثانية لكل منها", de: "4 Bereiche · je 30 Sekunden", es: "4 zonas · 30 segundos cada una" },
  "Sağ üst": { en: "Upper right", ar: "أعلى يمين", de: "Oben rechts", es: "Arriba derecha" },
  "Sağ alt": { en: "Lower right", ar: "أسفل يمين", de: "Unten rechts", es: "Abajo derecha" },
  "Sol alt": { en: "Lower left", ar: "أسفل يسار", de: "Unten links", es: "Abajo izquierda" },
  "Sol üst": { en: "Upper left", ar: "أعلى يسار", de: "Oben links", es: "Arriba izquierda" },
  "Doğru fırçalama tekniği": { en: "Correct brushing technique", ar: "طريقة التنظيف الصحيحة", de: "Richtige Putztechnik", es: "Técnica de cepillado correcta" },
  "Fırçayı diş etine": { en: "Place the brush on the gum line", ar: "ضع الفرشاة على خط اللثة", de: "Setze die Bürste am Zahnfleischrand an", es: "Coloca el cepillo en la línea de la encía" },
  "45 derece": { en: "at a 45 degree", ar: "بزاوية 45 درجة", de: "im 45-Grad-Winkel", es: "en un ángulo de 45 grados" },
  "açıyla yerleştir.": { en: "angle.", ar: ".ضعها بزاوية", de: "Winkel an.", es: "colócalo en ángulo." },
  "Küçük dairesel hareketler — ileri geri testere gibi değil.": { en: "Small circular movements — not sawing back and forth.", ar: "حركات دائرية صغيرة — وليس كالمنشار ذهابًا وإيابًا.", de: "Kleine Kreisbewegungen — nicht hin und her sägen.", es: "Movimientos circulares pequeños, no como un serrucho." },
  "Bölge başına": { en: "Per area", ar: "لكل منطقة", de: "Pro Bereich", es: "Por zona" },
  "30 saniye": { en: "30 seconds", ar: "30 ثانية", de: "30 Sekunden", es: "30 segundos" },
  ", toplam": { en: ", in total", ar: "، الإجمالي", de: ", insgesamt", es: ", en total" },
  "2 dakika": { en: "2 minutes", ar: "دقيقتان", de: "2 Minuten", es: "2 minutos" },
  "İç yüzeyleri, dış yüzeyleri ve": { en: "Brush the inner, outer and", ar: "نظّف الأسطح الداخلية والخارجية و", de: "Putze die Innen-, Außen- und", es: "Cepilla las superficies internas, externas y" },
  "çiğneme yüzeyini": { en: "chewing surfaces", ar: "أسطح المضغ", de: "Kauflächen", es: "superficies de masticación" },
  "ayrı ayrı fırçala.": { en: "separately.", ar: "بشكل منفصل.", de: "separat.", es: "por separado." },
  "Dil sırtını da temizle.": { en: "Also clean the tongue surface.", ar: "نظّف أيضًا سطح اللسان.", de: "Reinige auch die Zungenoberfläche.", es: "Limpia también la superficie de la lengua." },
  "Son olarak": { en: "Finally", ar: "أخيرًا", de: "Zum Schluss", es: "Por último" },
  "diş ipi": { en: "dental floss", ar: "خيط الأسنان", de: "Zahnseide", es: "hilo dental" },
  "kullan — fırça diş aralarına ulaşmaz.": { en: "use it — a brush does not reach between teeth.", ar: "استخدمه — الفرشاة لا تصل بين الأسنان.", de: "verwenden — eine Bürste erreicht die Zahnzwischenräume nicht.", es: "úsalo, el cepillo no llega entre los dientes." },
  "Sertçe bastırma; mine ve diş eti zarar görür.": { en: "Don't press hard; enamel and gums get damaged.", ar: "لا تضغط بقوة؛ يتضرر المينا واللثة.", de: "Nicht fest drücken; Schmelz und Zahnfleisch werden geschädigt.", es: "No presiones fuerte; se dañan el esmalte y las encías." },
  "Fırçalama serisi": { en: "Brushing streak", ar: "سلسلة التنظيف", de: "Putz-Serie", es: "Racha de cepillado" },
  "Fırçaladım": { en: "I brushed", ar: "نظّفت أسناني", de: "Ich habe geputzt", es: "Me cepillé" },
  "gün": { en: "days", ar: "أيام", de: "Tage", es: "días" },
  "Gün": { en: "Days", ar: "أيام", de: "Tage", es: "Días" },
  "yıl": { en: "years", ar: "سنوات", de: "Jahre", es: "años" },
  "yaş": { en: "years old", ar: "سنة", de: "Jahre", es: "años" },
  "Yıl": { en: "Years", ar: "سنوات", de: "Jahre", es: "Años" },
  "Muayene sonrası": { en: "After examination", ar: "بعد الفحص", de: "Nach der Untersuchung", es: "Tras el examen" },
  "Lokal anestezi ile ağrısız": { en: "Painless with local anesthesia", ar: "بدون ألم بتخدير موضعي", de: "Schmerzfrei mit lokaler Betäubung", es: "Sin dolor con anestesia local" },
  "Günde 2-3 kez": { en: "2-3 times a day", ar: "2-3 مرات يوميًا", de: "2-3 mal täglich", es: "2-3 veces al día" },
  "7-10 gün": { en: "7-10 days", ar: "7-10 أيام", de: "7-10 Tage", es: "7-10 días" },
  "10 yıl": { en: "10 years", ar: "10 سنوات", de: "10 Jahre", es: "10 años" },
  "2 yıl": { en: "2 years", ar: "سنتان", de: "2 Jahre", es: "2 años" },
  "Müşteri": { en: "Customer", ar: "عميل", de: "Kunde", es: "Cliente" },
  "Müşteri Yorumları": { en: "Customer Reviews", ar: "تقييمات العملاء", de: "Kundenbewertungen", es: "Reseñas de clientes" },
  "Yönetici Girişi": { en: "Admin Login", ar: "دخول المدير", de: "Admin-Login", es: "Acceso administrador" },
  "TÜM MENÜ": { en: "ALL MENU", ar: "كل القائمة", de: "GESAMTES MENÜ", es: "MENÚ COMPLETO" },
  "Klinik & İletişim": { en: "Clinic & Contact", ar: "العيادة والتواصل", de: "Klinik & Kontakt", es: "Clínica y contacto" },
  "Sağlık Araçları": { en: "Health Tools", ar: "أدوات الصحة", de: "Gesundheitswerkzeuge", es: "Herramientas de salud" },
  "CİHAZLAR": { en: "DEVICES", ar: "الأجهزة", de: "GERÄTE", es: "EQUIPOS" },
  "ADRES": { en: "ADDRESS", ar: "العنوان", de: "ADRESSE", es: "DIRECCIÓN" },
  "İLETİŞİM": { en: "CONTACT", ar: "التواصل", de: "KONTAKT", es: "CONTACTO" },
  "YORUMLAR": { en: "REVIEWS", ar: "التقييمات", de: "BEWERTUNGEN", es: "RESEÑAS" },
  "FIRÇALAMA": { en: "BRUSHING", ar: "التنظيف", de: "ZÄHNEPUTZEN", es: "CEPILLADO" },
  "OYUN": { en: "GAME", ar: "لعبة", de: "SPIEL", es: "JUEGO" },
  "HASTA PORTALI": { en: "PATIENT PORTAL", ar: "بوابة المريض", de: "PATIENTENPORTAL", es: "PORTAL DEL PACIENTE" },
  "GİZLİLİK": { en: "PRIVACY", ar: "الخصوصية", de: "DATENSCHUTZ", es: "PRIVACIDAD" },
  "AYARLAR": { en: "SETTINGS", ar: "الإعدادات", de: "EINSTELLUNGEN", es: "AJUSTES" },
  "Sık kullanılanlar ana sayfada — burada tekrar edilmez.": { en: "Frequently used items are on the home page — not repeated here.", ar: "العناصر الشائعة في الصفحة الرئيسية — لا تتكرر هنا.", de: "Häufig genutzte Elemente sind auf der Startseite — hier nicht wiederholt.", es: "Los elementos frecuentes están en la página de inicio, no se repiten aquí." },
  "Siparişleriniz, adresleriniz ve kuponlarınız.": { en: "Your orders, addresses and coupons.", ar: "طلباتك وعناوينك وكوبوناتك.", de: "Deine Bestellungen, Adressen und Gutscheine.", es: "Tus pedidos, direcciones y cupones." },
  "Çıkış": { en: "Log out", ar: "خروج", de: "Abmelden", es: "Salir" },
  "Siparişlerim": { en: "My Orders", ar: "طلباتي", de: "Meine Bestellungen", es: "Mis pedidos" },
  "Adreslerim": { en: "My Addresses", ar: "عناويني", de: "Meine Adressen", es: "Mis direcciones" },
  "İadelerim": { en: "My Returns", ar: "إرجاعاتي", de: "Meine Rücksendungen", es: "Mis devoluciones" },
  "Puanlarım": { en: "My Points", ar: "نقاطي", de: "Meine Punkte", es: "Mis puntos" },
  "Kuponlarım": { en: "My Coupons", ar: "كوبوناتي", de: "Meine Gutscheine", es: "Mis cupones" },
  "Favorilerim": { en: "My Favorites", ar: "المفضلة", de: "Meine Favoriten", es: "Mis favoritos" },
  "Bilgilerim": { en: "My Details", ar: "بياناتي", de: "Meine Daten", es: "Mis datos" },
  "Hesabımı Sil": { en: "Delete My Account", ar: "حذف حسابي", de: "Konto löschen", es: "Eliminar mi cuenta" },
  "Ürün bulunamadı.": { en: "No products found.", ar: "لا توجد منتجات.", de: "Keine Produkte gefunden.", es: "No se encontraron productos." },
  "KARGODA": { en: "IN TRANSIT", ar: "قيد الشحن", de: "UNTERWEGS", es: "EN TRÁNSITO" },
  "Kodu Kopyala": { en: "Copy Code", ar: "نسخ الرمز", de: "Code kopieren", es: "Copiar código" },
  "Takip Et": { en: "Track", ar: "تتبع", de: "Verfolgen", es: "Seguir" },
  "Kayıtlı adresiniz yok. Sipariş verirken bu adresleri kullanabilirsiniz.": { en: "You have no saved addresses. You can use these addresses when ordering.", ar: "لا توجد عناوين محفوظة. يمكنك استخدام هذه العناوين عند الطلب.", de: "Du hast keine gespeicherten Adressen. Du kannst sie bei der Bestellung nutzen.", es: "No tienes direcciones guardadas. Puedes usarlas al hacer un pedido." },
  "Yeni Adres Ekle": { en: "Add New Address", ar: "إضافة عنوان جديد", de: "Neue Adresse hinzufügen", es: "Añadir dirección" },
  "İade/değişim talebiniz yok": { en: "You have no return/exchange requests", ar: "لا توجد طلبات إرجاع/استبدال", de: "Du hast keine Rückgabe-/Umtauschanträge", es: "No tienes solicitudes de devolución" },
  "Teslim edilen veya kargodaki bir siparişiniz için": { en: "For a delivered or shipped order", ar: "لطلب تم تسليمه أو قيد الشحن", de: "Für eine gelieferte oder versandte Bestellung", es: "Para un pedido entregado o enviado" },
  "bölümünden talep oluşturabilirsiniz.": { en: "you can create a request from the", ar: "يمكنك إنشاء طلب من قسم", de: "kannst du einen Antrag im Bereich", es: "puedes crear una solicitud en la sección" },
  "Puan Bakiyem": { en: "My Point Balance", ar: "رصيد نقاطي", de: "Mein Punktestand", es: "Mi saldo de puntos" },
  "indirim değeri": { en: "discount value", ar: "قيمة الخصم", de: "Rabattwert", es: "valor de descuento" },
  "Bronz": { en: "Bronze", ar: "برونزي", de: "Bronze", es: "Bronce" },
  "puan": { en: "points", ar: "نقطة", de: "Punkte", es: "puntos" },
  "Gümüş": { en: "Silver", ar: "فضي", de: "Silber", es: "Plata" },
  "Nasıl çalışır?": { en: "How does it work?", ar: "كيف يعمل؟", de: "Wie funktioniert es?", es: "¿Cómo funciona?" },
  "Her": { en: "Every", ar: "كل", de: "Jeder", es: "Cada" },
  "alışveriş": { en: "purchase", ar: "عملية شراء", de: "Einkauf", es: "compra" },
  "1 puan": { en: "earns 1 point", ar: "يُكسبك نقطة واحدة", de: "bringt 1 Punkt", es: "gana 1 punto" },
  "100 puan": { en: "100 points", ar: "100 نقطة", de: "100 Punkte", es: "100 puntos" },
  "indirim": { en: "discount", ar: "خصم", de: "Rabatt", es: "descuento" },
  "Sepette en az": { en: "At least in the cart", ar: "في السلة على الأقل", de: "Im Warenkorb mindestens", es: "En el carrito al menos" },
  "500 puan": { en: "500 points", ar: "500 نقطة", de: "500 Punkte", es: "500 puntos" },
  "kullanılabilir": { en: "can be used", ar: "يمكن استخدام", de: "können genutzt werden", es: "se pueden usar" },
  "Şu an kuponunuz yok. Kampanyalarımızı kaçırmamak için sosyal medyada bizi takip edin.": { en: "You have no coupons right now. Follow us on social media so you don't miss our campaigns.", ar: "ليست لديك كوبونات الآن. تابعنا على وسائل التواصل لمتابعة عروضنا.", de: "Du hast derzeit keine Gutscheine. Folge uns in den sozialen Medien, um keine Aktion zu verpassen.", es: "No tienes cupones ahora. Síguenos en redes sociales para no perderte nuestras campañas." },
  "Beğendiğiniz ürünleri kalp ile işaretleyin, burada saklanır.": { en: "Mark the products you like with a heart, they are saved here.", ar: "أضف قلبًا على المنتجات التي تحبها لتُحفظ هنا.", de: "Markiere Produkte, die dir gefallen, mit einem Herz — sie werden hier gespeichert.", es: "Marca con un corazón los productos que te gustan, se guardan aquí." },
  "Kişisel Bilgiler": { en: "Personal Information", ar: "المعلومات الشخصية", de: "Persönliche Daten", es: "Datos personales" },
  "Ad": { en: "First name", ar: "الاسم", de: "Vorname", es: "Nombre" },
  "Soyad": { en: "Last name", ar: "اللقب", de: "Nachname", es: "Apellido" },
  "Doğum tarihi": { en: "Date of birth", ar: "تاريخ الميلاد", de: "Geburtsdatum", es: "Fecha de nacimiento" },
  "Bilgileri Kaydet": { en: "Save Details", ar: "حفظ البيانات", de: "Daten speichern", es: "Guardar datos" },
  "Güvenlik": { en: "Security", ar: "الأمان", de: "Sicherheit", es: "Seguridad" },
  "Şifre Değiştir / Sıfırla": { en: "Change / Reset Password", ar: "تغيير / إعادة تعيين كلمة المرور", de: "Passwort ändern / zurücksetzen", es: "Cambiar / restablecer contraseña" },
  "KVKK & Gizlilik": { en: "KVKK & Privacy", ar: "KVKK والخصوصية", de: "KVKK & Datenschutz", es: "KVKK y privacidad" },
  "Çıkış Yap": { en: "Log Out", ar: "تسجيل الخروج", de: "Abmelden", es: "Cerrar sesión" },
  "Adınız": { en: "Your name", ar: "اسمك", de: "Dein Vorname", es: "Tu nombre" },
  "Soyadınız": { en: "Your surname", ar: "لقبك", de: "Dein Nachname", es: "Tu apellido" },
  "Siparişi Tamamla": { en: "Complete Order", ar: "إتمام الطلب", de: "Bestellung abschließen", es: "Completar pedido" },
  "Teslimat bilgilerinizi kontrol edin.": { en: "Check your delivery details.", ar: "تحقق من بيانات التوصيل.", de: "Überprüfe deine Lieferdaten.", es: "Revisa tus datos de entrega." },
  "Sipariş özeti": { en: "Order summary", ar: "ملخص الطلب", de: "Bestellübersicht", es: "Resumen del pedido" },
  "Teslimat bilgileri": { en: "Delivery details", ar: "بيانات التوصيل", de: "Lieferdaten", es: "Datos de entrega" },
  "Ad Soyad *": { en: "Full Name *", ar: "الاسم الكامل *", de: "Vollständiger Name *", es: "Nombre completo *" },
  "Telefon *": { en: "Phone *", ar: "الهاتف *", de: "Telefon *", es: "Teléfono *" },
  "Açık Adres *": { en: "Full Address *", ar: "العنوان الكامل *", de: "Genaue Adresse *", es: "Dirección completa *" },
  "İndirim kuponu": { en: "Discount coupon", ar: "كوبون الخصم", de: "Rabattgutschein", es: "Cupón de descuento" },
  "Uygula": { en: "Apply", ar: "تطبيق", de: "Anwenden", es: "Aplicar" },
  "Ara toplam": { en: "Subtotal", ar: "المجموع الفرعي", de: "Zwischensumme", es: "Subtotal" },
  "Ödenecek": { en: "Total to pay", ar: "المبلغ المستحق", de: "Zu zahlen", es: "A pagar" },
  "Siparişi Onayla": { en: "Confirm Order", ar: "تأكيد الطلب", de: "Bestellung bestätigen", es: "Confirmar pedido" },
  "Mağazaya dön": { en: "Back to store", ar: "العودة إلى المتجر", de: "Zurück zum Shop", es: "Volver a la tienda" },
  "Ödeme:": { en: "Payment:", ar: "الدفع:", de: "Zahlung:", es: "Pago:" },
  "klinik IBAN'ına havale/EFT (yönetici panelinden IBAN eklenebilir).": { en: "bank transfer/EFT to the clinic IBAN (IBAN can be added from the admin panel).", ar: "تحويل بنكي إلى IBAN العيادة (يمكن إضافة IBAN من لوحة الإدارة).", de: "Überweisung auf die Klinik-IBAN (IBAN im Admin-Panel hinzufügbar).", es: "transferencia al IBAN de la clínica (el IBAN se añade desde el panel de administración)." },
  "Kupon kodu": { en: "Coupon code", ar: "رمز الكوبون", de: "Gutscheincode", es: "Código de cupón" },
  "Ürün": { en: "Product", ar: "المنتج", de: "Produkt", es: "Producto" },
  "Doktor": { en: "Doctor", ar: "الطبيب", de: "Arzt", es: "Doctor" },
  "Doktor bulunamadı.": { en: "No doctor found.", ar: "لم يُعثر على طبيب.", de: "Kein Arzt gefunden.", es: "No se encontró doctor." },
  "İade Talebi": { en: "Return Request", ar: "طلب إرجاع", de: "Rücksendeantrag", es: "Solicitud de devolución" },
  "Sipariş bulunamadı.": { en: "Order not found.", ar: "لم يُعثر على الطلب.", de: "Bestellung nicht gefunden.", es: "Pedido no encontrado." },
  "Yorum Yaz": { en: "Write a Review", ar: "اكتب تقييمًا", de: "Bewertung schreiben", es: "Escribir una reseña" },
  "Hesap ve Veri Silme": { en: "Account and Data Deletion", ar: "حذف الحساب والبيانات", de: "Konto- und Datenlöschung", es: "Eliminación de cuenta y datos" },
  "Haklarınız ve süreç": { en: "Your rights and the process", ar: "حقوقك والعملية", de: "Deine Rechte und der Ablauf", es: "Tus derechos y el proceso" },
  "kapsamında kişisel verilerinizin silinmesini talep edebilirsiniz.": { en: "you may request the deletion of your personal data.", ar: "يمكنك طلب حذف بياناتك الشخصية.", de: "kannst du die Löschung deiner personenbezogenen Daten beantragen.", es: "puedes solicitar la eliminación de tus datos personales." },
  "Hesabınız": { en: "Your account", ar: "حسابك", de: "Dein Konto", es: "Tu cuenta" },
  "sipariş kaydınız var": { en: "order records", ar: "سجلات طلبات", de: "Bestellungen vorhanden", es: "registros de pedidos" },
  "Silinecek veriler": { en: "Data to be deleted", ar: "البيانات التي ستُحذف", de: "Zu löschende Daten", es: "Datos que se eliminarán" },
  "Profil bilgileri (ad, e-posta, telefon, doğum tarihi)": { en: "Profile information (name, email, phone, date of birth)", ar: "معلومات الملف (الاسم، البريد، الهاتف، تاريخ الميلاد)", de: "Profildaten (Name, E-Mail, Telefon, Geburtsdatum)", es: "Datos de perfil (nombre, correo, teléfono, nacimiento)" },
  "Kayıtlı teslimat adresleri": { en: "Saved delivery addresses", ar: "عناوين التوصيل المحفوظة", de: "Gespeicherte Lieferadressen", es: "Direcciones guardadas" },
  "Hasta portalı notları ve yüklediğiniz belgeler": { en: "Patient portal notes and documents you uploaded", ar: "ملاحظات بوابة المريض والمستندات التي رفعتها", de: "Patientenportal-Notizen und hochgeladene Dokumente", es: "Notas del portal y documentos subidos" },
  "Sadakat puanları ve puan geçmişi": { en: "Loyalty points and point history", ar: "نقاط الولاء وسجل النقاط", de: "Bonuspunkte und Punkteverlauf", es: "Puntos y historial de puntos" },
  "Fırçalama serisi ve rozetler": { en: "Brushing streak and badges", ar: "سلسلة التنظيف والشارات", de: "Putz-Serie und Abzeichen", es: "Racha de cepillado e insignias" },
  "Ürün değerlendirmeleriniz": { en: "Your product reviews", ar: "تقييماتك للمنتجات", de: "Deine Produktbewertungen", es: "Tus reseñas de productos" },
  "Hesabınız (Firebase Authentication)": { en: "Your account (Firebase Authentication)", ar: "حسابك (Firebase Authentication)", de: "Dein Konto (Firebase Authentication)", es: "Tu cuenta (Firebase Authentication)" },
  "Saklanan veriler": { en: "Data retained", ar: "البيانات المحفوظة", de: "Gespeicherte Daten", es: "Datos conservados" },
  "Sipariş ve fatura kayıtları": { en: "Order and invoice records", ar: "سجلات الطلبات والفواتير", de: "Bestell- und Rechnungsdaten", es: "Registros de pedidos y facturas" },
  "yasal zorunluluk nedeniyle": { en: "due to legal obligation", ar: "بسبب التزام قانوني", de: "aufgrund gesetzlicher Pflicht", es: "por obligación legal" },
  "(adınız, telefonunuz ve adresiniz silinir.)": { en: "(your name, phone and address are deleted.)", ar: "(يُحذف اسمك وهاتفك وعنوانك.)", de: "(Name, Telefon und Adresse werden gelöscht.)", es: "(se eliminan tu nombre, teléfono y dirección)." },
  "adınız, telefonunuz ve adresiniz silinir.": { en: "your name, phone and address are deleted.", ar: "يُحذف اسمك وهاتفك وعنوانك.", de: "Name, Telefon und Adresse werden gelöscht.", es: "se eliminan tu nombre, teléfono y dirección." },
  "Kayıtlar anonim hâle getirilir.": { en: "Records are anonymised.", ar: "تُخفى هوية السجلات.", de: "Die Daten werden anonymisiert.", es: "Los registros se anonimizan." },
  "Süreç": { en: "Process", ar: "العملية", de: "Ablauf", es: "Proceso" },
  "Onay ekranında": { en: "On the confirmation screen", ar: "في شاشة التأكيد", de: "Im Bestätigungsbildschirm", es: "En la pantalla de confirmación" },
  "yazıp onaylarsınız": { en: "you type and confirm", ar: "تكتب وتؤكد", de: "tippst du und bestätigst", es: "escribes y confirmas" },
  "Verileriniz": { en: "Your data", ar: "بياناتك", de: "Deine Daten", es: "Tus datos" },
  "anında": { en: "instantly", ar: "فورًا", de: "sofort", es: "al instante" },
  "silinir": { en: "is deleted", ar: "تُحذف", de: "gelöscht", es: "se eliminan" },
  "Oturumunuz kapatılır": { en: "Your session is closed", ar: "يُغلق جلسك", de: "Deine Sitzung wird beendet", es: "Tu sesión se cierra" },
  "Hesabımı Silmek İstiyorum": { en: "I Want to Delete My Account", ar: "أريد حذف حسابي", de: "Ich möchte mein Konto löschen", es: "Quiero eliminar mi cuenta" },
  "Vazgeç": { en: "Cancel", ar: "إلغاء", de: "Abbrechen", es: "Cancelar" },
  "Gönderiliyor…": { en: "Sending…", ar: "جارٍ الإرسال…", de: "Wird gesendet…", es: "Enviando…" },
  "Gönder": { en: "Send", ar: "إرسال", de: "Senden", es: "Enviar" },
  "Kaydet": { en: "Save", ar: "حفظ", de: "Speichern", es: "Guardar" },
  "Sil": { en: "Delete", ar: "حذف", de: "Löschen", es: "Eliminar" },
  "SİL": { en: "DELETE", ar: "حذف", de: "LÖSCHEN", es: "ELIMINAR" },
  "Düzenle": { en: "Edit", ar: "تعديل", de: "Bearbeiten", es: "Editar" },
  "Ekle": { en: "Add", ar: "إضافة", de: "Hinzufügen", es: "Añadir" },
  "Kapat": { en: "Close", ar: "إغلاق", de: "Schließen", es: "Cerrar" },
  "Geri": { en: "Back", ar: "رجوع", de: "Zurück", es: "Atrás" },
  "Devam": { en: "Continue", ar: "متابعة", de: "Weiter", es: "Continuar" },
  "Evet": { en: "Yes", ar: "نعم", de: "Ja", es: "Sí" },
  "Hayır": { en: "No", ar: "لا", de: "Nein", es: "No" },
  "Ara": { en: "Search", ar: "بحث", de: "Suchen", es: "Buscar" },
  "Yükle": { en: "Upload", ar: "رفع", de: "Hochladen", es: "Subir" },
  "İndir": { en: "Download", ar: "تنزيل", de: "Herunterladen", es: "Descargar" },
  "Paylaş": { en: "Share", ar: "مشاركة", de: "Teilen", es: "Compartir" },
  "Kopyala": { en: "Copy", ar: "نسخ", de: "Kopieren", es: "Copiar" },
  "Diş sağlığı hakkında soru sor, dişinin fotoğrafını da gönderebilirsin.": { en: "Ask about dental health — you can also send a photo of your tooth.", ar: "اسأل عن صحة الأسنان — يمكنك أيضًا إرسال صورة لسنّك.", de: "Frag zur Zahngesundheit — du kannst auch ein Foto deines Zahns senden.", es: "Pregunta sobre salud dental; también puedes enviar una foto de tu diente." },
  "Bir şey sor...": { en: "Ask something...", ar: "اسأل شيئًا...", de: "Frag etwas...", es: "Pregunta algo..." }
};

/* ---------------------------------------------------------------------
   YARDIMCILAR
   --------------------------------------------------------------------- */

const NURDIS_DILLER = ["tr", "en", "ar", "de", "es"];
const NURDIS_DIL_ETIKET = { tr:"Türkçe", en:"English", ar:"العربية", de:"Deutsch", es:"Español" };

function dilGetir() {
  try {
    return (state && state.settings && state.settings.lang) || "tr";
  } catch (e) { return "tr"; }
}

/* Metni normalize et: boşlukları sadeleştir, baş/son boşluğu at */
function _norm(s) {
  return String(s || "").replace(/\s+/g, " ").trim();
}

/* Emoji / simge önekini ayır:  "📦 Siparişlerim" → ["📦 ", "Siparişlerim"] */
const _EMOJI_ONEK = /^([^\p{L}\p{N}]{1,6})\s*/u;   /* emoji, •, —, ✓ gibi önekler */

/* ---------------------------------------------------------------------
   ANA ÇEVİRİ FONKSİYONU
   dönüş: çeviri varsa STRING, yoksa null  (Türkçe bırakılır)
   --------------------------------------------------------------------- */
function ceviriAl(metin, lang) {
  if (!metin) return null;
  lang = lang || dilGetir();
  if (lang === "tr") return null;

  /* ÖNEMLİ: satır sonlarını KORUYARAK dene (çok satırlı metinler için) */
  const ham = String(metin);
  if (ham.indexOf("\n") !== -1) {
    const satirlar = ham.split("\n").map((x) => _norm(x)).filter(Boolean);
    if (satirlar.length > 1) {
      const cevrilmis = satirlar.map((x) => {
        const b = NURDIS_SOZLUK[x];
        return b && b[lang] ? b[lang] : null;
      });
      if (cevrilmis.every(Boolean)) return cevrilmis.join(" ");
    }
  }

  const s = _norm(metin);
  if (!s) return null;

  /* 1) birebir */
  let k = NURDIS_SOZLUK[s];
  if (k && k[lang]) return k[lang];

  /* 2) emoji öneki ayır → gövdeyi çevir, emoji korunur */
  const em = s.match(_EMOJI_ONEK);
  if (em) {
    const govde = s.slice(em[0].length).trim();
    if (govde) {
      const t2 = _govdeCevir(govde, lang);
      if (t2) return (em[1].endsWith(" ") ? em[1] : em[1] + " ") + t2;
    }
  }

  /* 3) emoji yok → gövde kuralları */
  return _govdeCevir(s, lang);
}

/* Gövde çevirisi: sözlük + sayı/tarih desenleri */
function _govdeCevir(s, lang) {
  let k = NURDIS_SOZLUK[s];
  if (k && k[lang]) return k[lang];

  /* --- "GÜLÜŞÜNÜ TASARLA →" gibi sonu ok işaretli metinler --- */
  let m0 = s.match(/^(.+?)\s*(→|➜|»)$/);
  if (m0) {
    const b0 = NURDIS_SOZLUK[m0[1].trim()];
    if (b0 && b0[lang]) return b0[lang] + " " + m0[2];
  }

  /* --- "(isteğe bağlı)" gibi parantez içi metinler --- */
  m0 = s.match(/^\((.+)\)$/);
  if (m0) {
    const b0 = NURDIS_SOZLUK[m0[1].trim()];
    if (b0 && b0[lang]) return "(" + b0[lang] + ")";
  }

  /* --- "Kliniğimiz..." gibi sonu üç nokta olan metinler --- */
  m0 = s.match(/^(.+?)(\.\.\.|…)$/);
  if (m0) {
    const b0 = NURDIS_SOZLUK[m0[1].trim()];
    if (b0 && b0[lang]) return b0[lang] + m0[2];
  }

  /* --- Çok satırlı metin: satır satır çevir, hepsi çevrildiyse birleştir --- */
  if (s.indexOf("\n") !== -1) {
    const parcalar = s.split("\n").map((x) => _norm(x)).filter(Boolean);
    if (parcalar.length > 1) {
      const cevrilmis = parcalar.map((x) => {
        const b = NURDIS_SOZLUK[x];
        return b && b[lang] ? b[lang] : null;
      });
      if (cevrilmis.every(Boolean)) return cevrilmis.join(" ");
    }
  }

  /* --- "Başlık (3)" → sözlük(başlık) + " (3)" --- */
  let m = s.match(/^(.+?)\s*\((\d+)\)$/);
  if (m) {
    const b = NURDIS_SOZLUK[m[1]];
    if (b && b[lang]) return b[lang] + " (" + m[2] + ")";
  }

  /* --- "2. İşlenen Kişisel Veriler" gibi numaralı başlıklar --- */
  m = s.match(/^(\d+)\.\s+(.+)$/);
  if (m) {
    const b = NURDIS_SOZLUK[m[2].trim()];
    if (b && b[lang]) return m[1] + ". " + b[lang];
  }

  /* --- "Son güncelleme: 10.11.2026" gibi "Etiket: değer" --- */
  m = s.match(/^([^:]{3,60}):\s*(.+)$/);
  if (m) {
    let b = NURDIS_SOZLUK[m[1].trim() + ":"];
    if (b && b[lang]) return b[lang] + " " + m[2];
    b = NURDIS_SOZLUK[m[1].trim()];
    if (b && b[lang]) return b[lang] + ": " + m[2];
  }

  /* --- "10 ürün" --- */
  m = s.match(/^(\d[\d.]*)\s*ürün$/);
  if (m) return lang === "en" ? m[1] + " products" : lang === "ar" ? m[1] + " منتجات"
        : lang === "de" ? m[1] + " Produkte" : m[1] + " productos";

  /* --- "5 olası neden · Rutin / 1-3 gün / Acil" --- */
  m = s.match(/^(\d+)\s*olası neden\s*·\s*(.+)$/);
  if (m) {
    const alt = { "Rutin": {en:"Routine",ar:"روتيني",de:"Routine",es:"Rutina"},
                  "Acil": {en:"Urgent",ar:"طارئ",de:"Dringend",es:"Urgente"},
                  "1-3 gün": {en:"1-3 days",ar:"1-3 أيام",de:"1-3 Tage",es:"1-3 días"},
                  "1-7 gün": {en:"1-7 days",ar:"1-7 أيام",de:"1-7 Tage",es:"1-7 días"},
                  "Rutin kontrol": {en:"Routine check",ar:"فحص روتيني",de:"Routinekontrolle",es:"Revisión rutinaria"} };
    const b = alt[m[2].trim()];
    const bT = b && b[lang] ? b[lang] : (NURDIS_SOZLUK[m[2].trim()] || {})[lang];
    if (bT) {
      const onek = { en: m[1] + " possible causes", ar: m[1] + " أسباب محتملة",
                     de: m[1] + " mögliche Ursachen", es: m[1] + " posibles causas" }[lang];
      return onek + " · " + bT;
    }
  }

  /* --- "0 puan" / "1.250 puan" --- */
  m = s.match(/^([\d.,]+)\s*puan$/);
  if (m) return lang === "en" ? m[1] + " points" : lang === "ar" ? m[1] + " نقطة"
        : lang === "de" ? m[1] + " Punkte" : m[1] + " puntos";

  /* --- "2.000 puan → Gümüş" --- */
  m = s.match(/^([\d.,]+)\s*puan\s*→\s*(.+)$/);
  if (m) {
    const sev = NURDIS_SOZLUK[m[2].trim()];
    if (sev && sev[lang]) {
      const birim = { en:"points → ", ar:" نقطة → ", de:" Punkte → ", es:" puntos → " }[lang];
      return m[1] + birim + sev[lang];
    }
  }

  /* --- "1× Diş Macunu" --- */
  m = s.match(/^(\d+)\s*[×x]\s*(.+)$/);
  if (m) {
    const urun = NURDIS_SOZLUK[m[2].trim()];
    if (urun && urun[lang]) return m[1] + "× " + urun[lang];
  }

  /* --- "1 sipariş kaydınız var" --- */
  m = s.match(/^(\d+)\s*sipariş kaydınız var$/);
  if (m) return lang === "en" ? m[1] + " order records"
        : lang === "ar" ? m[1] + " سجلات طلبات"
        : lang === "de" ? m[1] + " Bestellungen" : m[1] + " registros de pedidos";

  /* --- "0 gün" / "12 gün" --- */
  m = s.match(/^(\d+)\s*gün$/);
  if (m) return lang === "en" ? m[1] + " days" : lang === "ar" ? m[1] + " أيام"
        : lang === "de" ? m[1] + " Tage" : m[1] + " días";

  /* --- "≈ ₺0,00 indirim değeri" --- */
  m = s.match(/^≈\s*(.+?)\s*indirim değeri$/);
  if (m) {
    const birim = { en:" discount value", ar:" قيمة الخصم", de:" Rabattwert", es:" valor de descuento" }[lang];
    return "≈ " + m[1] + birim;
  }

  return null;
}

/* ---------------------------------------------------------------------
   t(key) — sözlükten anahtar çevirisi (mevcut çağrılar için)
   --------------------------------------------------------------------- */
function ceviriAnahtar(key, lang) {
  lang = lang || dilGetir();
  if (!key) return key;
  const k = NURDIS_SOZLUK[key];
  if (k && k[lang]) return k[lang];
  if (k && k.tr) return k.tr;
  return null;
}

/* ---------------------------------------------------------------------
   DOM ÇEVİRİCİ — her render sonrası çalışır
   --------------------------------------------------------------------- */
const _CEVRILMEZ_ETIKET = { SCRIPT:1, STYLE:1, CODE:1, PRE:1, TEXTAREA:1, NOSCRIPT:1 };

function ceviriUygula(kok) {
  const lang = dilGetir();
  const root = kok || document.body;
  if (!root) return;

  /* Türkçe seçiliyse hiç dokunma (sıfır maliyet) */
  if (lang === "tr") return;

  /* 🏥 SADECE YÖNETİCİ EKRANLARI Türkçe kalır (mali kayıt, SGK/vergi dili
     çeviri kaldırmaz). ÖNEMLİ: "adminLoggedIn" ile KİLİTLEME YOK — klinik
     sahibi sürekli yönetici olarak girişli olduğu için o kilit tüm
     uygulamanın çevirisini kapatıyordu (v60b hatası). */
  try {
    const cevrilmezEkranlar = ["admin-panel", "admin-login"];
    if (cevrilmezEkranlar.indexOf(state.screen) !== -1) return;
  } catch (e) {}

  /* --- 1) Metin düğümleri --- */
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const p = node.parentElement;
      if (!p) return NodeFilter.FILTER_REJECT;
      if (_CEVRILMEZ_ETIKET[p.tagName]) return NodeFilter.FILTER_REJECT;
      /* zaten çevrilmişse tekrar çevirme */
      if (p.dataset && p.dataset.cevrildi === "1") return NodeFilter.FILTER_REJECT;
      const t = node.nodeValue;
      if (!t || !t.trim() || t.trim().length < 2) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  const dugumler = [];
  let n;
  let sayac = 0;
  while ((n = walker.nextNode()) && sayac < 6000) { dugumler.push(n); sayac++; }

  for (const node of dugumler) {
    const orijinal = node.nodeValue;
    const ceviri = ceviriAl(orijinal, lang);
    if (ceviri && ceviri !== orijinal) {
      /* Türkçe aslı sakla — dil değişince geri dönebilmek için */
      const p = node.parentElement;
      if (p && !p.dataset.trAsil) p.dataset.trAsil = _norm(orijinal);
      /* Baştaki/sondaki boşlukları KORU — yoksa "Uhrzeit(24 ..." gibi bitişir */
      const sol = (orijinal.match(/^\s*/) || [""])[0];
      const sag = (orijinal.match(/\s*$/) || [""])[0];
      node.nodeValue = sol + ceviri + sag;
    }
  }

  /* --- 2) Öznitelikler: placeholder / title / alt / aria-label --- */
  const etiketli = root.querySelectorAll("[placeholder],[title],[alt],[aria-label]");
  etiketli.forEach((el) => {
    ["placeholder", "title", "alt", "aria-label"].forEach((attr) => {
      const v = el.getAttribute(attr);
      if (!v || v.length < 2) return;
      const c = ceviriAl(v, lang);
      if (c && c !== v) {
        if (!el.dataset["tr_" + attr]) el.dataset["tr_" + attr] = v;
        el.setAttribute(attr, c);
      }
    });
  });

  /* --- 3) Sayfa dili + yön --- */
  dilYonuUygula(lang);
}

/* Türkçeye dönerken orijinal metinleri geri koy */
function ceviriyiGeriAl(root) {
  const r = root || document.body;
  if (!r) return;
  const walker = document.createTreeWalker(r, NodeFilter.SHOW_TEXT, null);
  let n;
  const dugumler = [];
  while ((n = walker.nextNode())) dugumler.push(n);
  for (const node of dugumler) {
    const p = node.parentElement;
    if (p && p.dataset && p.dataset.trAsil) node.nodeValue = p.dataset.trAsil;
  }
  r.querySelectorAll("[data-tr_placeholder],[data-tr_title],[data-tr_alt],[data-tr_aria-label]").forEach((el) => {
    ["placeholder", "title", "alt", "aria-label"].forEach((attr) => {
      const v = el.dataset["tr_" + attr];
      if (v) el.setAttribute(attr, v);
    });
  });
}

/* ---------------------------------------------------------------------
   DİL YÖNÜ (RTL) + <html lang>
   --------------------------------------------------------------------- */
function dilYonuUygula(lang) {
  const html = document.documentElement;
  if (!html) return;
  html.setAttribute("lang", lang);
  if (lang === "ar") {
    html.setAttribute("dir", "rtl");
    html.classList.add("dil-ar");
  } else {
    html.setAttribute("dir", "ltr");
    html.classList.remove("dil-ar");
  }
}

/* ---------------------------------------------------------------------
   DİL DEĞİŞTİR
   --------------------------------------------------------------------- */
function dilDegistir(lang) {
  if (NURDIS_DILLER.indexOf(lang) === -1) lang = "tr";
  const oncekiDil = dilGetir();

  if (!state.settings) state.settings = { muted: false, lang: "tr" };
  state.settings.lang = lang;
  try { localStorage.setItem("nurdis_settings", JSON.stringify(state.settings)); } catch (e) {}

  /* Türkçeye dönüyorsak önce orijinalleri geri koy */
  if (lang === "tr" && oncekiDil !== "tr") ceviriyiGeriAl();

  dilYonuUygula(lang);
  if (typeof render === "function") render();

  try {
    if (typeof showNotif === "function") {
      const mesaj = {
        tr: "Arayüz dili Türkçe olarak ayarlandı.",
        en: "Interface language set to English.",
        ar: "تم تعيين لغة الواجهة إلى العربية.",
        de: "Sprache der Benutzeroberfläche auf Deutsch gesetzt.",
        es: "Idioma de la interfaz establecido en español."
      }[lang];
      showNotif("🌍 " + NURDIS_DIL_ETIKET[lang], mesaj);
    }
  } catch (e) {}
}

/* ---------------------------------------------------------------------
   BAŞLANGIÇ — kayıtlı dil varsa uygula
   --------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", function () {
  const lang = dilGetir();
  dilYonuUygula(lang);
});

/* Yedek plandan gelen "dil bekliyor" isteği varsa uygula */
try {
  const bekleyen = localStorage.getItem("nurdis_dil_bekliyor");
  if (bekleyen) {
    localStorage.removeItem("nurdis_dil_bekliyor");
    if (!state.settings) state.settings = { muted: false, lang: "tr" };
    if (["tr","en","ar","de","es"].indexOf(bekleyen) !== -1) state.settings.lang = bekleyen;
    try { localStorage.setItem("nurdis_settings", JSON.stringify(state.settings)); } catch (e) {}
  }
} catch (e) {}

/* Sayfa ilk açıldığında da (DOMContentLoaded kaçırılırsa) */
try { dilYonuUygula(dilGetir()); } catch (e) {}

/* İlk çizimden sonra kayıtlı dil hemen uygulanır (kullanıcı Ayarlar'a
   girmeden de arayüz seçili dilde açılır) */
document.addEventListener("DOMContentLoaded", function () {
  setTimeout(function () {
    try { if (typeof ceviriUygula === "function") ceviriUygula(document.body); } catch (e) {}
  }, 120);
});
