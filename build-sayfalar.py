#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
=============================================================================
 NUR DIŞ — STATİK SAYFA ÜRETECİ (madde 13)
=============================================================================
 SORUN: Site tek sayfa + JS ile yükleniyordu. Google "İmplant Kızıltepe"
 aramasında tek bir URL görüyordu; 11 hizmet ve 42 bilgi makalesi
 indekslenemiyordu. En büyük SEO eksiği buydu.

 ÇÖZÜM: Her hizmet ve her makale için AYRI, SUNUCUDAN GELEN HTML sayfası
 üretilir. İçerik JS'e bağımlı değildir (arama motoru okuyabilir),
 her birinde gerçek <title>, <meta description>, canonical ve
 JSON-LD yapısal verisi bulunur.

 KAYNAK VERİ: js/core.js (SERVICES), js/bilgi.js (BI_TEDAVI, BI_MAKALE)
 ÜRETİLEN:
   hizmet/<slug>.html        (11 sayfa)
   rehber/<slug>.html        (14 sayfa)
   bilgi/<slug>.html         (42 sayfa)
   sitemap.xml               (67 URL + ana sayfa)
   blog.html                 (tüm yazıların listesi)

 KULLANIM: python3 build-sayfalar.py
=============================================================================
"""
import re
import os
import json
import html
import datetime

KOK = os.path.dirname(os.path.abspath(__file__))
SITE = "https://nurdis.pages.dev"
KLINIK = "Nur Diş & Dental Klinik"
TEL = "+905051050302"
TEL_GORUNUM = "0505 105 03 02"
ADRES = "TOKİ Mahallesi, Kızıltepe, Mardin"

# ---------------------------------------------------------------------------
# VERİ ÇIKARMA — JS dosyalarından
# ---------------------------------------------------------------------------

def js_oku(dosya):
    with open(os.path.join(KOK, dosya), encoding="utf-8") as f:
        return f.read()


def dizi_cikar(kaynak, ad):
    """const AD = [ ... ]; bloğunu metin olarak döndürür."""
    m = re.search(r"const %s = \[(.*?)\n\];" % ad, kaynak, re.S)
    return m.group(1) if m else ""


def alan(blok, ad):
    """basit \"ad\":\"deger\" alanını çeker (kaçış destekli)."""
    m = re.search(r'%s:\s*"((?:[^"\\]|\\.)*)"' % ad, blok)
    if not m:
        return ""
    return m.group(1).replace('\\"', '"').replace("\\n", " ")


def kayitlara_ayir(blok):
    """Üst seviye { ... } kayıtlarını ayırır."""
    kayitlar = []
    derinlik = 0
    bas = None
    tirnak = False
    kacis = False
    for i, ch in enumerate(blok):
        if kacis:
            kacis = False
            continue
        if ch == "\\":
            kacis = True
            continue
        if ch == '"':
            tirnak = not tirnak
            continue
        if tirnak:
            continue
        if ch == "{":
            if derinlik == 0:
                bas = i
            derinlik += 1
        elif ch == "}":
            derinlik -= 1
            if derinlik == 0 and bas is not None:
                kayitlar.append(blok[bas:i + 1])
                bas = None
    return kayitlar


def slug(deger):
    """Türkçe karakterleri koruyarak URL-güvenli slug üretir."""
    tr = {"ı": "i", "İ": "i", "ş": "s", "Ş": "s", "ğ": "g", "Ğ": "g",
          "ü": "u", "Ü": "u", "ö": "o", "Ö": "o", "ç": "c", "Ç": "c"}
    d = "".join(tr.get(c, c) for c in deger)
    d = re.sub(r"[^a-zA-Z0-9]+", "-", d).strip("-").lower()
    return d or "sayfa"


# ---------------------------------------------------------------------------
# SAYFA ŞABLONU
# ---------------------------------------------------------------------------

def sayfa_html(baslik, aciklama, yol, icerik, jsonld, tur="hizmet", dil="tr", hreflang=""):
    """Tam HTML sayfa üretir. Tasarım mevcut siteyle aynı (aynı CSS).
       dil="ar" verilirse RTL düzeni ve Arapça font uygulanır."""
    tam_url = SITE + "/" + yol
    ld = json.dumps(jsonld, ensure_ascii=False, indent=2)
    yon = "rtl" if dil == "ar" else "ltr"
    font_yigin = ("'Noto Naskh Arabic','Segoe UI',Tahoma,Arial,sans-serif"
                  if dil == "ar" else
                  "'Plus Jakarta Sans',system-ui,-apple-system,sans-serif")

    return f"""<!doctype html>
<html lang="{dil}" dir="{yon}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>{html.escape(baslik)}</title>
<meta name="description" content="{html.escape(aciklama)}" />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="{tam_url}" />
{hreflang}

<meta property="og:type" content="article" />
<meta property="og:title" content="{html.escape(baslik)}" />
<meta property="og:description" content="{html.escape(aciklama)}" />
<meta property="og:url" content="{tam_url}" />
<meta property="og:image" content="{SITE}/icon-512.png" />
<meta property="og:locale" content="tr_TR" />
<meta name="twitter:card" content="summary" />

<script type="application/ld+json">
{ld}
</script>

<link rel="icon" href="/icon-192.png" />
<link rel="apple-touch-icon" href="/icon-192.png" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

<style>
  :root {{
    --teal:#0B6E86; --teal-dark:#075668; --ink:#16323B; --muted:#5D7480;
    --bg:#EAF7FC; --surface:#FFFFFF; --line:#CFE3EC; --cta:#E53935;
  }}
  * {{ box-sizing:border-box; }}
  body {{
    margin:0; background:var(--bg); color:var(--ink);
    font-family:{font_yigin};
    font-size:16px; line-height:1.65; -webkit-font-smoothing:antialiased;
  }}
  a {{ color:var(--teal); }}
  .kap {{ max-width:760px; margin:0 auto; padding:0 16px 60px; }}

  header.ust {{
    background:linear-gradient(160deg,#0B6E86,#0E8FA8); color:#fff;
    padding:16px 16px 22px;
  }}
  .ust-ic {{ max-width:760px; margin:0 auto; display:flex; align-items:center; gap:11px; }}
  .ust-ic img {{ width:44px; height:44px; border-radius:12px; }}
  .ust-ic .marka {{ font-size:10px; letter-spacing:.14em; text-transform:uppercase; opacity:.85; margin:0;
    font-family:'Manrope',sans-serif; font-weight:700; }}
  .ust-ic .ad {{ font-size:16px; font-weight:800; margin:1px 0 0; }}

  .kirinti {{ font-size:12px; color:var(--muted); padding:14px 0 0; }}
  .kirinti a {{ text-decoration:none; }}

  h1 {{ font-family:'Manrope',sans-serif; font-size:27px; line-height:1.25; margin:14px 0 8px; letter-spacing:-.01em; }}
  .ozet {{ font-size:15px; color:var(--muted); margin:0 0 20px; }}

  .kart {{
    background:var(--surface); border:1px solid var(--line); border-radius:16px;
    padding:20px; margin-bottom:14px;
  }}
  .kart h2 {{ font-family:'Manrope',sans-serif; font-size:16px; margin:0 0 8px; color:var(--teal); }}
  .kart p {{ margin:0; font-size:14.5px; }}
  .kart p + p {{ margin-top:9px; }}

  .fiyat {{
    display:inline-block; background:#FFF3E0; color:#E65100; font-weight:800;
    font-size:14px; padding:6px 14px; border-radius:99px; margin-bottom:14px;
  }}

  .cta {{
    display:block; text-align:center; text-decoration:none;
    background:linear-gradient(135deg,#E53935,#FF6F00); color:#fff;
    border-radius:14px; padding:17px; font-weight:800; font-size:16px;
    box-shadow:0 6px 20px rgba(229,57,53,.3); margin:22px 0 12px;
  }}
  .cta-alt {{
    display:flex; gap:9px; margin-bottom:22px;
  }}
  .cta-alt a {{
    flex:1; text-align:center; text-decoration:none; padding:13px;
    border-radius:12px; font-weight:800; font-size:13.5px; color:#fff;
  }}
  .ara {{ background:var(--teal); }}
  .wa {{ background:#25D366; }}

  .ilgili {{ margin-top:26px; }}
  .ilgili h2 {{ font-family:'Manrope',sans-serif; font-size:15px; color:var(--muted);
    text-transform:uppercase; letter-spacing:.09em; margin:0 0 10px; }}
  .ilgili a {{
    display:block; background:var(--surface); border:1px solid var(--line);
    border-radius:12px; padding:13px 15px; margin-bottom:8px; text-decoration:none;
    color:var(--ink); font-size:14px; font-weight:600;
  }}
  .ilgili a span {{ color:var(--muted); font-weight:400; }}

  footer {{ margin-top:34px; padding-top:18px; border-top:1px solid var(--line);
    font-size:12.5px; color:var(--muted); }}
  footer a {{ color:var(--teal); text-decoration:none; }}

  .uyari {{ background:#FFF8E1; border:1px solid #FFE082; border-radius:12px;
    padding:13px 15px; font-size:12.5px; color:#7A5C00; margin-bottom:14px; }}
</style>
</head>
<body>

<header class="ust">
  <div class="ust-ic">
    <img src="/icon-192.png" alt="Nur Diş logo" />
    <div>
      <p class="marka">{html.escape(KLINIK)}</p>
      <p class="ad">Gülümsemenin adresi</p>
    </div>
  </div>
</header>

<div class="kap">
  <p class="kirinti"><a href="/">Ana Sayfa</a> · <a href="/blog.html">Bilgi Merkezi</a></p>

  {icerik}

  <footer>
    <p><b>{html.escape(KLINIK)}</b><br/>{html.escape(ADRES)}<br/>
    <a href="tel:{TEL}">{TEL_GORUNUM}</a> · <a href="/">nurdis.pages.dev</a></p>
    <p style="margin-top:10px;">Bu sayfadaki bilgiler genel bilgilendirme amaçlıdır, hekim muayenesinin yerine geçmez.</p>
  </footer>
</div>

</body>
</html>
"""


# ---------------------------------------------------------------------------
# ARAPÇA ÇEVİRİLER (madde 15)
# ---------------------------------------------------------------------------
# Kızıltepe/Mardin bölgesinde Arapça gerçek bir rekabet avantajı. Arayüzde
# zaten 4 dil var; burada ARAPÇA İNDEKSlenebilir sayfalar üretilir.
# Yalnızca hizmetler ve ana bilgi başlıkları çevrilir — tıbbi makale
# gövdeleri hekim onayı olmadan çevrilmemeli (yanlış anlaşılma riski).

AR_HIZMET = {
    "muayene":     ("فحص الأسنان", "فحص شامل لصحة الفم وتخطيط العلاج. الفحص الأول مجاني."),
    "temizlik":    ("تنظيف الأسنان (إزالة الجير)", "إزالة الجير والتصبغات وتلميع الأسنان. غير مؤلم ويستغرق 20-30 دقيقة."),
    "dolgu":       ("حشو الأسنان", "حشوات تجميلية بلون الأسنان. تُنجز في جلسة واحدة."),
    "kanal":       ("علاج قناة الجذر", "علاج عصب الأسنان بدون ألم، في جلسة أو جلستين."),
    "cekim":       ("خلع الأسنان", "خلع بسيط وجراحي تحت التخدير الموضعي."),
    "beyazlatma":  ("تبييض الأسنان", "تبييض احترافي في العيادة بجلسة واحدة ونتيجة واضحة."),
    "implant":     ("زراعة الأسنان", "زراعة من سن واحد إلى الفك الكامل. مدة العلاج 3-6 أشهر."),
    "zirkonyum":   ("تلبيسات الزيركون", "تلبيسات متينة بمظهر طبيعي تعكس الضوء كالأسنان الطبيعية."),
    "ortodonti":   ("تقويم الأسنان", "خيارات التقويم الشفاف والمعدني حسب حالتك."),
    "seffafplak":  ("التقويم الشفاف", "أطقم شفافة قابلة للإزالة لتصحيح الأسنان دون أن يلاحظ أحد."),
    "kopru":       ("جسر الأسنان", "جسر ثابت لتعويض الأسنان المفقودة."),
}

AR_SABLON = {
    "randevu": "احجز موعدًا — الفحص مجاني",
    "ara": "اتصل الآن",
    "wa": "واتساب",
    "nedir": "ما هو هذا العلاج؟",
    "surec": "مراحل العلاج",
    "uyari": "⚠️ هذه الصفحة للمعلومات العامة فقط. التشخيص الدقيق وخطة العلاج تحتاج إلى فحص الطبيب.",
    "diger": "علاجات أخرى",
    "adres": "حي TOKİ، قزلتَبه، ماردين",
    "ana": "الصفحة الرئيسية",
    "bilgi": "مركز المعلومات",
}


def hreflang_etiketleri(yol_tr, yol_ar=None):
    """TR/AR sayfa çiftleri için hreflang etiketleri (Google'a 'bunlar
       aynı içeriğin iki dili' der, iki ayrı site saymaz)."""
    cikti = ['<link rel="alternate" hreflang="tr" href="%s/%s" />' % (SITE, yol_tr)]
    if yol_ar:
        cikti.append('<link rel="alternate" hreflang="ar" href="%s/%s" />' % (SITE, yol_ar))
        cikti.append('<link rel="alternate" hreflang="x-default" href="%s/%s" />' % (SITE, yol_tr))
    return "\n".join(cikti)


def arapca_hizmet_sayfasi(s, ar_veri, digerleri):
    sid = s["id"]
    ad_ar, aciklama_ar = ar_veri
    yol = "ar/hizmet/%s.html" % sid
    yol_tr = "hizmet/%s.html" % sid
    baslik = "%s — قزلتَبه ماردين | %s" % (ad_ar, KLINIK)

    p = []
    p.append('<p class="kirinti"><a href="/ar/">%s</a></p>' % AR_SABLON["ana"])
    p.append('<h1>%s</h1>' % html.escape(ad_ar))
    if s["price"] and s["price"].lower() != "muayene sonrası":
        p.append('<div class="fiyat">%s</div>' % html.escape(s["price"]))
    p.append('<p class="ozet">%s</p>' % html.escape(aciklama_ar))

    p.append('<a class="cta" href="/#booking">🦷 %s</a>' % AR_SABLON["randevu"])
    p.append('<div class="cta-alt"><a class="ara" href="tel:%s">📞 %s</a>'
             '<a class="wa" href="https://wa.me/905051050302">💬 %s</a></div>'
             % (TEL, AR_SABLON["ara"], AR_SABLON["wa"]))

    p.append('<div class="kart"><h2>%s</h2><p>%s</p></div>' % (AR_SABLON["nedir"], html.escape(aciklama_ar)))
    p.append('<div class="uyari">%s</div>' % AR_SABLON["uyari"])

    if digerleri:
        bag = "".join('<a href="/ar/hizmet/%s.html">%s</a>' % (d["id"], html.escape(AR_HIZMET[d["id"]][0]))
                      for d in digerleri[:5] if d["id"] in AR_HIZMET)
        p.append('<div class="ilgili"><h2>%s</h2>%s</div>' % (AR_SABLON["diger"], bag))

    jsonld = {
        "@context": "https://schema.org",
        "@type": "MedicalProcedure",
        "name": ad_ar,
        "description": aciklama_ar,
        "inLanguage": "ar",
        "provider": {
            "@type": "Dentist", "name": KLINIK, "telephone": TEL,
            "address": {"@type": "PostalAddress", "addressLocality": "Kızıltepe",
                        "addressRegion": "Mardin", "addressCountry": "TR"},
            "url": SITE
        }
    }
    return yol, baslik, aciklama_ar, sayfa_html(
        baslik, aciklama_ar, yol, "".join(p), jsonld, dil="ar",
        hreflang=hreflang_etiketleri(yol_tr, yol))


# ---------------------------------------------------------------------------
# İÇERİK ÜRETİCİLERİ
# ---------------------------------------------------------------------------

def hizmet_sayfasi(s, tedavi, digerleri):
    sid = s["id"]
    ad = s["name"]
    fiyat = s["price"]
    desc = s["desc"]
    img = s["img"]
    info = s.get("info", "")

    yol = "hizmet/%s.html" % sid
    baslik = "%s — Kızıltepe Mardin | %s" % (ad, KLINIK)
    # Açıklama: nokta tekrarını temizle, 155 karakterle sınırla
    temiz_desc = desc.rstrip(".")
    temiz_info = info.rstrip(".")[:110]
    aciklama = ("%s — %s. %s. Mardin Kızıltepe'de ücretsiz muayene ile başlayın."
                % (ad, temiz_desc, temiz_info))[:155]

    parcalar = []
    parcalar.append(f'<h1>{html.escape(ad)}</h1>')
    if fiyat and fiyat.lower() != "muayene sonrası":
        parcalar.append('<div class="fiyat">%s</div>' % html.escape(fiyat))
    parcalar.append('<p class="ozet">%s</p>' % html.escape(desc))

    parcalar.append('<a class="cta" href="/#booking">🦷 Ücretsiz Muayene — Randevu Al</a>')
    parcalar.append('<div class="cta-alt"><a class="ara" href="tel:%s">📞 Hemen Ara</a>'
                    '<a class="wa" href="https://wa.me/905051050302?text=%s">💬 WhatsApp</a></div>'
                    % (TEL, html.escape("Merhaba, %s hakkında bilgi almak istiyorum." % ad)))

    parcalar.append('<div class="kart"><h2>Bu tedavi nedir?</h2><p>%s</p></div>' % html.escape(info or desc))

    if tedavi:
        satirlar = []
        if tedavi.get("neZaman"):
            satirlar.append("<p><b>Ne zaman yapılmalı?</b> %s</p>" % html.escape(tedavi["neZaman"]))
        if tedavi.get("seans") or tedavi.get("sure"):
            satirlar.append("<p><b>Seans / süre:</b> %s seans · %s</p>"
                            % (html.escape(tedavi.get("seans", "-")), html.escape(tedavi.get("sure", "-"))))
        if tedavi.get("agri"):
            satirlar.append("<p><b>Ağrı durumu:</b> %s</p>" % html.escape(tedavi["agri"]))
        if tedavi.get("sonrasi"):
            satirlar.append("<p><b>İşlem sonrası:</b> %s</p>" % html.escape(tedavi["sonrasi"]))
        if tedavi.get("bakim"):
            satirlar.append("<p><b>Bakım önerisi:</b> %s</p>" % html.escape(tedavi["bakim"]))
        if satirlar:
            parcalar.append('<div class="kart"><h2>Tedavi süreci</h2>%s</div>' % "".join(satirlar))

    parcalar.append('<div class="uyari">⚠️ Bu sayfa genel bilgi verir. Kesin teşhis ve tedavi planı '
                    'için hekim muayenesi gerekir.</div>')

    if digerleri:
        baglanti = "".join('<a href="/hizmet/%s.html">%s <span>· %s</span></a>'
                           % (d["id"], html.escape(d["name"]), html.escape(d["price"]))
                           for d in digerleri[:5])
        parcalar.append('<div class="ilgili"><h2>Diğer tedaviler</h2>%s</div>' % baglanti)

    jsonld = {
        "@context": "https://schema.org",
        "@type": "MedicalProcedure",
        "name": ad,
        "description": desc,
        "procedureType": "https://schema.org/TherapeuticProcedure",
        "howPerformed": info,
        "provider": {
            "@type": "Dentist",
            "name": KLINIK,
            "telephone": TEL,
            "address": {"@type": "PostalAddress", "streetAddress": "TOKİ Mahallesi",
                        "addressLocality": "Kızıltepe", "addressRegion": "Mardin",
                        "addressCountry": "TR"},
            "url": SITE
        }
    }
    return yol, baslik, aciklama, sayfa_html(baslik, aciklama, yol, "".join(parcalar), jsonld)


def rehber_sayfasi(t):
    tid = t["id"]
    ad = t.get("ad", tid)
    yol = "rehber/%s.html" % tid
    baslik = "%s — Aşama Aşama Rehber | %s" % (ad, KLINIK)
    aciklama = "%s: nedir, ne zaman yapılmalı, kaç seans sürer, sonrasında nelere dikkat edilmeli. %s" % (
        ad, t.get("nedir", "")[:120])

    p = []
    p.append(f'<h1>{html.escape(ad)}</h1>')
    p.append('<p class="ozet">%s</p>' % html.escape(t.get("nedir", "")))
    p.append('<a class="cta" href="/#booking">🦷 Ücretsiz Muayene — Randevu Al</a>')

    k = []
    for etiket, anahtar in [("Ne zaman yapılmalı?", "neZaman"), ("Kaç seans?", "seans"),
                            ("Ne kadar sürer?", "sure"), ("Ağrı olur mu?", "agri"),
                            ("İşlem sonrası", "sonrasi"), ("Bakım", "bakim")]:
        if t.get(anahtar):
            k.append("<p><b>%s</b> %s</p>" % (etiket, html.escape(t[anahtar])))
    if k:
        p.append('<div class="kart">%s</div>' % "".join(k))

    p.append('<div class="uyari">⚠️ Genel bilgilendirme amaçlıdır; hekim muayenesi yerine geçmez.</div>')

    jsonld = {
        "@context": "https://schema.org",
        "@type": "MedicalWebPage",
        "name": ad,
        "description": t.get("nedir", ""),
        "about": {"@type": "MedicalProcedure", "name": ad},
        "publisher": {"@type": "Organization", "name": KLINIK, "url": SITE}
    }
    return yol, baslik, aciklama, sayfa_html(baslik, aciklama, yol, "".join(p), jsonld)


def makale_sayfasi(m, sira):
    bas = m.get("baslik", "Bilgi")
    y = "bilgi/%s.html" % slug(bas)
    baslik = "%s | %s" % (bas, KLINIK)
    aciklama = m.get("ozet", "")[:155]

    p = []
    p.append('<p class="kirinti" style="padding-top:0;"><span style="color:#8FA9B5;">%s</span></p>'
             % html.escape(m.get("grup", "Bilgi")))
    p.append(f'<h1>{html.escape(bas)}</h1>')
    if m.get("ozet"):
        p.append('<p class="ozet">%s</p>' % html.escape(m["ozet"]))
    p.append('<div class="kart"><p>%s</p></div>' % html.escape(m.get("govde", "")))
    p.append('<a class="cta" href="/#booking">🦷 Ücretsiz Muayene — Randevu Al</a>')
    p.append('<div class="uyari">⚠️ Bu içerik genel bilgilendirme amaçlıdır. '
             'Şikayetiniz sürüyorsa hekiminize başvurun.</div>')
    p.append('<div class="ilgili"><h2>Diğer yazılar</h2><a href="/blog.html">← Bilgi Merkezine dön</a></div>')

    jsonld = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": bas,
        "description": m.get("ozet", ""),
        "articleBody": m.get("govde", ""),
        "articleSection": m.get("grup", ""),
        "author": {"@type": "Organization", "name": KLINIK},
        "publisher": {"@type": "Organization", "name": KLINIK, "url": SITE},
        "mainEntityOfPage": {"@type": "WebPage", "@id": SITE + "/" + y}
    }
    return y, baslik, aciklama, sayfa_html(baslik, aciklama, y, "".join(p), jsonld)


# ---------------------------------------------------------------------------
# ANA AKIŞ
# ---------------------------------------------------------------------------

def main():
    core = js_oku("js/core.js")
    bilgi = js_oku("js/bilgi.js")

    # --- Hizmetler ---
    s_blok = dizi_cikar(core, "SERVICES")
    hizmetler = []
    for kayit in kayitlara_ayir(s_blok):
        hid = alan(kayit, "id") or re.search(r'id:\s*"([^"]+)"', kayit).group(1)
        hizmetler.append({
            "id": hid,
            "name": alan(kayit, "name"),
            "price": alan(kayit, "price"),
            "desc": alan(kayit, "desc"),
            "img": alan(kayit, "img"),
            "info": alan(kayit, "info"),
        })

    # --- Tedavi rehberleri ---
    t_blok = dizi_cikar(bilgi, "BI_TEDAVI")
    tedaviler = {}
    for kayit in kayitlara_ayir(t_blok):
        tid = alan(kayit, "id")
        tedaviler[tid] = {
            "id": tid, "ad": alan(kayit, "ad"),
            "nedir": alan(kayit, "nedir"), "neZaman": alan(kayit, "neZaman"),
            "seans": alan(kayit, "seans"), "sure": alan(kayit, "sure"),
            "agri": alan(kayit, "agri"), "sonrasi": alan(kayit, "sonrasi"),
            "bakim": alan(kayit, "bakim"),
        }

    # --- Makaleler ---
    m_blok = dizi_cikar(bilgi, "BI_MAKALE")
    makaleler = []
    for kayit in kayitlara_ayir(m_blok):
        makaleler.append({
            "grup": alan(kayit, "grup"), "ikon": alan(kayit, "ikon"),
            "baslik": alan(kayit, "baslik"), "ozet": alan(kayit, "ozet"),
            "govde": alan(kayit, "govde"),
        })

    print("Bulunan: %d hizmet, %d tedavi rehberi, %d makale" %
          (len(hizmetler), len(tedaviler), len(makaleler)))

    os.makedirs(os.path.join(KOK, "hizmet"), exist_ok=True)
    os.makedirs(os.path.join(KOK, "rehber"), exist_ok=True)
    os.makedirs(os.path.join(KOK, "bilgi"), exist_ok=True)

    urller = [("/", 1.0, "weekly")]

    # Hizmet sayfaları
    for i, s in enumerate(hizmetler):
        digerleri = [d for d in hizmetler if d["id"] != s["id"]]
        t = tedaviler.get(s["id"]) or (
            tedaviler.get("plak") if s["id"] == "seffafplak" else None)
        yol, baslik, aciklama, html_metin = hizmet_sayfasi(s, t, digerleri)
        with open(os.path.join(KOK, yol), "w", encoding="utf-8") as f:
            f.write(html_metin)
        urller.append(("/" + yol, 0.9, "monthly"))
        print("  hizmet/%s.html" % s["id"])

    # Rehber sayfaları
    for t in tedaviler.values():
        yol, baslik, aciklama, html_metin = rehber_sayfasi(t)
        with open(os.path.join(KOK, yol), "w", encoding="utf-8") as f:
            f.write(html_metin)
        urller.append(("/" + yol, 0.8, "monthly"))
    print("  %d rehber sayfası" % len(tedaviler))

    # Makale sayfaları
    for i, m in enumerate(makaleler):
        yol, baslik, aciklama, html_metin = makale_sayfasi(m, i)
        with open(os.path.join(KOK, yol), "w", encoding="utf-8") as f:
            f.write(html_metin)
        urller.append(("/" + yol, 0.7, "monthly"))
    print("  %d makale sayfası" % len(makaleler))

    # --- ARAPÇA SAYFALAR (madde 15) ---
    os.makedirs(os.path.join(KOK, "ar", "hizmet"), exist_ok=True)
    ar_sayfa = 0
    for s_h in hizmetler:
        if s_h["id"] not in AR_HIZMET:
            continue
        digerleri = [d for d in hizmetler if d["id"] != s_h["id"]]
        yol, baslik, aciklama, html_metin = arapca_hizmet_sayfasi(s_h, AR_HIZMET[s_h["id"]], digerleri)
        with open(os.path.join(KOK, yol), "w", encoding="utf-8") as f:
            f.write(html_metin)
        urller.append(("/" + yol, 0.8, "monthly"))
        ar_sayfa += 1

    # Arapça ana sayfa
    ar_kartlar = "".join(
        '<a href="/ar/hizmet/%s.html">%s <span>· %s</span></a>'
        % (h["id"], html.escape(AR_HIZMET[h["id"]][0]), html.escape(AR_HIZMET[h["id"]][1][:55]))
        for h in hizmetler if h["id"] in AR_HIZMET)
    ar_icerik = (
        '<h1>عيادة نور لطب الأسنان</h1>'
        '<p class="ozet">%s — %s</p>' % (ADRES, "رعاية أسنان موثوقة في قزلتَبه، ماردين")
        + '<a class="cta" href="/#booking">🦷 %s</a>' % AR_SABLON["randevu"]
        + '<div class="cta-alt"><a class="ara" href="tel:%s">📞 %s</a>'
          '<a class="wa" href="https://wa.me/905051050302">💬 %s</a></div>'
          % (TEL, AR_SABLON["ara"], AR_SABLON["wa"])
        + '<div class="ilgili"><h2>العلاجات</h2>%s</div>' % ar_kartlar
        + '<div class="uyari">%s</div>' % AR_SABLON["uyari"]
        + '<p style="font-size:13px;color:#5D7480;">الموقع بالتركية: '
          '<a href="/">nurdis.pages.dev</a></p>'
    )
    ar_jsonld = {
        "@context": "https://schema.org", "@type": "Dentist",
        "name": "Nur Diş & Dental Klinik", "alternateName": "عيادة نور لطب الأسنان",
        "telephone": TEL, "url": SITE + "/ar/", "inLanguage": "ar",
        "address": {"@type": "PostalAddress", "streetAddress": "TOKİ Mahallesi",
                    "addressLocality": "Kızıltepe", "addressRegion": "Mardin",
                    "addressCountry": "TR"},
        "openingHours": ["Mo-Fr 09:00-18:00", "Sa 10:00-14:00"]
    }
    ar_ana = sayfa_html("عيادة نور لطب الأسنان — قزلتَبه ماردين | Nur Diş",
                        "عيادة أسنان في قزلتَبه ماردين. زراعة، تقويم، تبييض، علاج عصب. الفحص الأول مجاني.",
                        "ar/index.html", ar_icerik, ar_jsonld, dil="ar",
                        hreflang=hreflang_etiketleri("index.html", "ar/index.html"))
    with open(os.path.join(KOK, "ar", "index.html"), "w", encoding="utf-8") as f:
        f.write(ar_ana)
    urller.append(("/ar/", 0.9, "monthly"))
    ar_sayfa += 1
    print("  %d Arapça sayfa (ar/)" % ar_sayfa)

    # --- sitemap.xml ---
    bugun = datetime.date.today().isoformat()
    satirlar = ['<?xml version="1.0" encoding="UTF-8"?>',
                '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    # Ana sayfa + mevcut statik
    for ek in ["", "blog.html"]:
        satirlar.append("  <url><loc>%s/%s</loc><lastmod>%s</lastmod>"
                        "<changefreq>weekly</changefreq><priority>1.0</priority></url>"
                        % (SITE, ek, bugun))
    for yol, oncelik, siklik in urller[1:]:
        satirlar.append("  <url><loc>%s%s</loc><lastmod>%s</lastmod>"
                        "<changefreq>%s</changefreq><priority>%.1f</priority></url>"
                        % (SITE, yol, bugun, siklik, oncelik))
    satirlar.append("</urlset>")
    with open(os.path.join(KOK, "sitemap.xml"), "w", encoding="utf-8") as f:
        f.write("\n".join(satirlar))
    print("  sitemap.xml (%d URL)" % (len(urller) + 1))

    # --- blog.html: bilgi merkezi ---
    gruplar = {}
    for m in makaleler:
        gruplar.setdefault(m.get("grup", "Genel"), []).append(m)

    bloklar = []
    bloklar.append('<h1>Bilgi Merkezi</h1>')
    bloklar.append('<p class="ozet">Ağız ve diş sağlığı hakkında %d yazı, '
                   '%d tedavi rehberi. Hekiminiz onaylı içerikler.</p>'
                   % (len(makaleler), len(tedaviler)))

    bloklar.append('<div class="ilgili"><h2>Tedavi rehberleri</h2>')
    for t in tedaviler.values():
        bloklar.append('<a href="/rehber/%s.html">%s <span>· aşama aşama</span></a>'
                       % (t["id"], html.escape(t["ad"])))
    bloklar.append('</div>')

    for grup, liste in gruplar.items():
        bloklar.append('<div class="ilgili"><h2>%s</h2>' % html.escape(grup))
        for m in liste:
            bloklar.append('<a href="/bilgi/%s.html">%s <span>· %s</span></a>'
                           % (slug(m["baslik"]), html.escape(m["baslik"]),
                              html.escape(m.get("ozet", "")[:60])))
        bloklar.append('</div>')

    bloklar.append('<a class="cta" href="/#booking">🦷 Ücretsiz Muayene — Randevu Al</a>')

    jsonld = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Bilgi Merkezi",
        "description": "Ağız ve diş sağlığı yazıları ve tedavi rehberleri",
        "publisher": {"@type": "Organization", "name": KLINIK, "url": SITE}
    }
    icerik = sayfa_html("Bilgi Merkezi — Ağız ve Diş Sağlığı Yazıları | " + KLINIK,
                        "Ağız ve diş sağlığı hakkında %d yazı ve %d tedavi rehberi."
                        % (len(makaleler), len(tedaviler)),
                        "blog.html", "".join(bloklar), jsonld)
    with open(os.path.join(KOK, "blog.html"), "w", encoding="utf-8") as f:
        f.write(icerik)
    print("  blog.html")

    # --- robots.txt: sitemap satırını güncelle ---
    robots_yolu = os.path.join(KOK, "robots.txt")
    if os.path.exists(robots_yolu):
        r = open(robots_yolu, encoding="utf-8").read()
        if "Sitemap:" not in r:
            r = r.rstrip() + "\n\nSitemap: %s/sitemap.xml\n" % SITE
            open(robots_yolu, "w", encoding="utf-8").write(r)
            print("  robots.txt: sitemap eklendi")

    print("\nTOPLAM: %d sayfa üretildi." % (len(hizmetler) + len(tedaviler) + len(makaleler) + 1))


if __name__ == "__main__":
    main()
