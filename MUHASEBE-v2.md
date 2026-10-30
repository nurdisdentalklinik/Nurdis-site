# Nur Diş — Muhasebe & Mali Müşavirlik Modülü v3

**Tarih:** 31 Ekim 2026 · **Sürüm:** v3 (Mali Müşavir Motoru)
**Klasör:** `/home/user/repo_push/` (Nur Diş projesi)
**Mevcut ekran:** Yönetici Paneli → 💰 Muhasebe

---

## 1. Ne eklendi?

Muhasebe sekmesi 1 sayfadan **6 alt sekmeye** çıkarıldı:

| Sekme | İçerik |
|---|---|
| 📊 Özet | Dönem seçici, gelir/gider/kâr kartları, KDV-stopaj-SGK kutuları, son işlemler |
| 💳 Gelir/Gider | Gelir ekle (POS + fatura), gider ekle, tüm işlemleri düzenle/sil |
| 👥 Personel & SGK | Personel listesi, otomatik prim hesabı, SGK özeti, resmî bağlantılar |
| 🧾 Vergi & Beyanname | KDV / stopaj / damga tablosu, GİB bağlantıları, ödeme takvimi |
| 📈 Raporlar | Gelir-gider dağılımı, 6 ay trend grafiği, CSV indir, yazdır |
| 🔄 Otomatik | Kira, elektrik, su, doğalgaz, SGK, vergi giderleri tek tuşla |

---

## 2. Personel & SGK primi

### Personel ekleme
Ad soyad, TC kimlik (11 hane kontrolü), görev, brüt ücret, çalışılan gün, işe giriş tarihi ve teşvik seçeneği.

### Otomatik hesaplanan kalemler
Her personel için aylık olarak:

- Prime esas kazanç (SPEK) — alt sınır ve tavana göre otomatik düzeltme
- İşçi SGK payı (%14)
- İşçi işsizlik payı (%1)
- İşveren SGK payı (%20,5 — teşvikli ise 5 puan indirimle %15,5)
- İşveren işsizlik payı (%2)
- Gelir vergisi (kümülatif dilim + asgari ücret istisnası)
- Damga vergisi (‰7,59, asgari ücret istisnalı)
- Net ücret ve **işverene toplam maliyet**

### 2026 varsayılan parametreleri
```
Brüt asgari ücret ......... 33.030 ₺
Tavan çarpanı ............. 9 kat (297.270 ₺)
İşçi SGK .................. %14
İşçi işsizlik ............. %1
İşveren SGK ............... %20,5
İşveren işsizlik .......... %2
Teşvik indirimi ........... 5 puan
Damga oranı ............... ‰7,59
```
Asgari ücret değişince **Personel & SGK → SGK Parametreleri** bölümünden güncellenebilir.

### Kontrol testi (gerçek hesap)
| Personel | Brüt | SPEK | Toplam prim | Net |
|---|---|---|---|---|
| Asistan (asgari ücret) | 33.030 | 33.030 | 10.734,75 | **28.075,50** ✅ |
| Diş hekimi (teşvikli) | 85.000 | 85.000 | 27.625,00 | 59.481,77 |
| Sekreter (15 gün) | 40.000 | 20.000 | 7.500,00 | 16.381,10 |

Asgari ücretli personelin neti **28.075,50 ₺** çıkıyor — 2026 resmî net asgari ücretle **birebir aynı**. Hesap motoru doğrulandı.

### SGK'ya gönderim
Resmî sistemler üçüncü taraf uygulamalardan doğrudan belge kabul etmediği için şu akış kuruldu:

1. **📋 Özeti Kopyala** → tüm personelin prim dökümü panoya kopyalanır
2. **🔗 e-Bildirge** → `https://ebildirge.sgk.gov.tr/` açılır
3. Yapıştır → kontrol et → onayla

Ek butonlar: 🖨️ Yazdır, ➕ Bu ayın primini gider olarak kaydet (muhasebeye tek tuşla işler).

---

## 3. Vergi & Beyanname

- Dönem KDV tablosu: brüt gelir, hesaplanan KDV, indirilecek KDV, **ödenecek KDV**, stopaj, damga, net kâr
- **📋 Özeti Kopyala** → beyanname hazırlığı için metin
- Bağlantılar:
  - 📄 e-Beyanname → `https://ebeyanname.gib.gov.tr/`
  - 💳 Dijital Vergi Dairesi → `https://dijital.gib.gov.tr/`
  - 🧾 İnteraktif Vergi Dairesi → `https://ivd.gib.gov.tr/`
- Ödeme takvimi hatırlatması (KDV/stopaj 26'sı, SGK 23'ü, ödeme ay sonu)

---

## 4. Raporlar

Dönem seçenekleri: **Hafta · Ay · 3 Ay · 6 Ay · Yıl · Özel tarih aralığı**

- Gelir dağılımı (kategori bazlı yatay bar)
- Gider dağılımı
- Son 6 ay gelir/gider trend grafiği
- Dönem tablosu (toplam gelir, gider, net, ortalama günlük gelir)
- **⬇️ CSV İndir** (Excel'de açılır, Türkçe karakter destekli)
- **🖨️ Rapor Yazdır** (A4 çıktı)

---

## 5. Gelir / gider düzenleme

Her satırda **✏️ düzenle** ve **🗑️ sil** butonu:

- Tarih, açıklama, tutar, kategori, firma, fatura no düzenlenebilir
- Gelirde ödeme şekli ve hasta tipi (stopaj) değiştirilebilir
- Tutar değişince **KDV, stopaj, damga, net tutar otomatik yeniden hesaplanır**
- Bağlı fatura kaydı da birlikte güncellenir
- Silmede fatura kaydı da temizlenir (eski sürümde bu hata vardı — düzeltildi)

---

## 6. Düzeltilen hatalar

| Hata | Durum |
|---|---|
| Gelir silinince fatura kaydı silinmiyordu | ✅ Düzeltildi |
| Gider eklerken tarih girilemiyordu | ✅ Tarih alanı eklendi |
| Giderde KDV girilemiyordu (indirilecek KDV hesabı bozuktu) | ✅ KDV alanı eklendi |
| "Gülüşünü Tasarla" ekranı açılırken JS hatası veriyordu | ✅ Düzeltildi |

---

## 7. Veri saklama

- **Yerel:** `localStorage` → `nurdis_accounting`, `nurdis_personnel`, `nurdis_sgk_settings`
- **Bulut:** Firebase `settings/accounting` dokümanı (personel + SGK ayarları dahil)
- Tüm cihazlarda senkron

---

## 8. Yayına alma ✅ TAMAMLANDI

**Canlı:** https://nurdis.pages.dev
**Deploy ID:** d51cf48d-nurdis.pages.dev
**Tarih:** 31 Ekim 2026 · **Sürüm:** v3 (Mali Müşavir Motoru)
**Hesap:** Nurdisdentalklinik@gmail.com's Account (`2ca714018fc59d1b7ccb5ac80716b986`)

Doğrulama:
- nurdis.pages.dev → HTTP 200 ✅
- Yeni muhasebe kodu canlıda (17 eşleşme) ✅
- Muhasebe sekmeleri ve Personel ekle butonu çalışıyor ✅
- Firebase `nur-dis-klinik` bağlı ✅
- Konsol hatası yok ✅

### ✅ GitHub bağlantısı güncellendi
Repo: `nurdisdentalklinik/Nurdis-site`
Commit: `e9b0289` (Muhasebe modulu v2)
Cloudflare otomatik deploy: `54bfe8d1` ✅ success

Artık repo ile canlı site **senkron**. Repoya yeni commit atıldığında muhasebe v2 korunur.

### Tekrar deploy
```bash
cd /home/user
./deploy-nurdis.sh <NUR_DIS_API_TOKEN>
```

---

## 10. v3 — MALİ MÜŞAVİR MOTORU

Nur Diş'te mali müşavir yok; bu yüzden tüm mali müşavirlik süreçleri programa gömüldü.

### 10.1 Beyanname Takvimi (🔔 Takvim & Uyarı)
Otomatik oluşan takvim — 2026 resmî tarihleri:

| Beyanname | Son gün | Kurum |
|---|---|---|
| KDV-1 | Her ayın 28'i | GİB |
| Muhtasar + Prim Hizmet | Her ayın 26'sı | GİB/SGK |
| Damga Vergisi | Her ayın 26'sı | GİB |
| SGK Prim Ödemesi | Her ayın 26'sı | SGK |
| Geçici Vergi | 17 Mayıs · 17 Ağustos · 17 Kasım | GİB |
| Yıllık Gelir Vergisi | 31 Mart (1. taksit) · 31 Temmuz (2. taksit) | GİB |
| Bağ-Kur (4/b) | Her ayın 1'i | SGK |

Her satırda **✓ Tamamlandı** butonu var. İşaretlenen beyanname uyarı listesinden düşer.
Eski dönemler varsayılan olarak gizli (+ butonla açılır).

### 10.2 Uyarı Motoru (otomatik, 10 kural)
| Uyarı | Kural |
|---|---|
| 🔴 Kritik | Beyanname bugün/3 gün içinde veya gecikmiş |
| 🔴 Kritik | Personelde eksik TC kimlik no (SGK bildirgesi verilemez) |
| 🟠 Uyarı | 7 gün içinde beyanname |
| 🟠 Uyarı | 30+ gün tahsil edilmeyen alacak |
| 🟠 Uyarı | KDV hesaplanmamış gelir kaydı (beyanname eksik çıkar) |
| 🟠 Uyarı | Aylık SGK primi (personel varsa) |
| 🔵 Bilgi | Ödenecek KDV tutarı |
| 🔵 Bilgi | Devreden KDV |
| 🔵 Bilgi | Geçici vergi yaklaşıyor (30 gün) + tahmini tutar |
| 🔵 Bilgi | Demirbaş kaydı yok (amortisman kaçıyor) |
| 🔵 Bilgi | Bu ay gelir kaydı yok |

### 10.3 KDV Beyannamesi (📑 KDV Beyanı)
- Yıl + ay seçici
- **Devreden KDV zinciri**: her ay önceki devreden otomatik düşülür
- KDV-1 tablosu: brüt gelir, hesaplanan KDV, indirilecek KDV, önceki devir, **ödenecek**, **sonraki devir**
- Yıllık KDV özeti + Dijital Vergi Dairesi ödeme linki

### 10.4 Gelir Vergisi (🧮 Gelir Vergisi)
**Geçici vergi** (1-2-3. dönem):
- Kümülatif gelir/gider → ticari kâr → matrah
- Kümülatif vergi − önceki dönem mahsubu = **bu dönem ödenecek**
- Son tarih ve e-Beyanname linki

**Yıllık gelir vergisi** (projeksiyon):
- Yıllık gelir − gider − **amortisman** = matrah
- Vergi − ödenen geçici vergiler = **kalan**
- 1. ve 2. taksit tutarları

**2026 vergi dilimleri (GVK m.103 — 332 Seri No'lu Tebliğ):**
```
     0 –   190.000  →  %15
190.000 –   400.000  →  %20
400.000 – 1.000.000  →  %27
1.000.000 – 5.300.000 → %35
5.300.000 +          →  %40
```
⚠️ v2'de 2025 rakamları (158.000/330.000/800.000) kullanılıyordu — **düzeltildi**.

Doğrulama: 600.000 matrah → **124.500 ₺** ✅ (resmî örnekle birebir)

### 10.5 Amortisman (🏗️ Amortisman)
VUK 333 faydalı ömürler:
| Kategori | Ömür |
|---|---|
| Bilgisayar / yazılım | 4 yıl |
| Tıbbi cihaz (küçük) | 5 yıl |
| Tıbbi cihaz (röntgen) | 10 yıl |
| Dental ünite / koltuk | 10 yıl |
| Mobilya ve demirbaş | 10 yıl |
| Bina | 40 yıl |
| Binek otomobil | 5 yıl |

- **Kıst amortisman**: alındığı yıl kalan ay kadar gider
- Yıllık amortisman otomatik olarak gelir vergisi hesabından düşülür
- Birikmiş amortisman ve kalan değer takibi

### 10.6 Cari Hesap (💳 Cari Hesap)
- Gelir kaydederken **"Veresiye / ödenmedi"** işaretlenirse buraya düşer
- Hasta/firma bazlı bakiye
- Gecikme yaşı (30/60 gün renk kodu)
- **✓ Ödendi** butonu → tahsilat kaydı

---

## 11. Yasal Sınırlar (önemli)

Program **mali müşavir yerine geçecek şekilde** tasarlandı ama şu sınırlar var:

| Yapılabilir ✅ | Yapılamaz ❌ |
|---|---|
| Beyanname tutarlarını hesaplama | GİB'e doğrudan beyanname gönderme |
| Özet hazırlama, kopyalama | SGK'ya doğrudan bildirge gönderme |
| Vade takibi ve uyarı | e-İmza gerektiren resmî işlemler |
| Amortisman/vergi hesabı | Defter tasdiki, YMM raporu |

**Neden?** GİB e-Beyanname ve SGK e-Bildirge sistemleri **e-İmza / mali mühür** ile kişiye özel giriş ister. Üçüncü taraf uygulamanın oraya otomatik veri göndermesi yasal olarak mümkün değil.

**Çözüm (uygulandı):** Program tutarı hesaplar → özet çıkarır → **tek tıkla resmî sisteme gider** → kopyala-yapıştır ile beyan edersin. Manuel hesap yükü sıfırlanır, sadece son onay sende kalır.


## 9. Yasal not

Bu modül **ön muhasebe ve hazırlık** aracıdır.
- SGK ve GİB sistemlerine üçüncü taraf uygulamalardan otomatik belge gönderimi yasal olarak mümkün değildir; bu yüzden özet + resmî bağlantı yöntemi kullanıldı.
- Hesaplamalar 2026 resmî parametrelerine göre yapılır; teşvik, engelli indirimi, kısmi süre gibi özel durumlar için mali müşavir kontrolü önerilir.
- Beyanname ve bildirge sorumluluğu mükellefte/mali müşavirdedir.
