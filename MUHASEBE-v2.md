# Nur Diş — Muhasebe Modülü v2

**Tarih:** 31 Ekim 2026
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
**Tarih:** 31 Ekim 2026
**Hesap:** Nurdisdentalklinik@gmail.com's Account (`2ca714018fc59d1b7ccb5ac80716b986`)

Doğrulama:
- nurdis.pages.dev → HTTP 200 ✅
- Yeni muhasebe kodu canlıda (17 eşleşme) ✅
- Muhasebe sekmeleri ve Personel ekle butonu çalışıyor ✅
- Firebase `nur-dis-klinik` bağlı ✅
- Konsol hatası yok ✅

### ⚠️ Dikkat: GitHub bağlantısı
Cloudflare projesi `nurdisdentalklinik/Nurdis-site` reposuna bağlı. Repo'daki kod **eski** (muhasebe v2 yok).

Bu yüzden:
- Repo'ya yeni bir commit atılırsa **eski sürüm geri gelir**
- Önce repo'yu güncellemek gerekiyor (GitHub token'ı ile)

### Tekrar deploy
```bash
cd /home/user
./deploy-nurdis.sh <NUR_DIS_API_TOKEN>
```

## 9. Yasal not

Bu modül **ön muhasebe ve hazırlık** aracıdır.
- SGK ve GİB sistemlerine üçüncü taraf uygulamalardan otomatik belge gönderimi yasal olarak mümkün değildir; bu yüzden özet + resmî bağlantı yöntemi kullanıldı.
- Hesaplamalar 2026 resmî parametrelerine göre yapılır; teşvik, engelli indirimi, kısmi süre gibi özel durumlar için mali müşavir kontrolü önerilir.
- Beyanname ve bildirge sorumluluğu mükellefte/mali müşavirdedir.
