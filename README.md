# samet akın — portfolio

kişisel portföy sitesi. astro + react + tailwind css + framer motion + mdx.

## nasıl çalıştırılır

```bash
npm install
npm run dev
```

site `http://localhost:4321` adresinde açılır.

## nasıl içerik eklenir

### yeni yazı

`src/content/blog/` klasörüne `.md` dosyası ekle:

```md
---
title: "yazı başlığı"
description: "kısa açıklama"
pubDate: 2026-05-01
readingTime: "~8 dk okuma"
tags: ["rag", "llm"]
draft: false
---

yazı içeriği buraya...
```

`draft: true` yapılırsa "taslak" rozetiyle gözükür.

### cv güncelleme

`public/assets/cv/samet-akin-cv.pdf` dosyasını değiştir. /cv sayfasındaki
"pdf indir" butonu bu dosyaya yönlendirir.

### youtube channel id

`src/lib/youtube.ts` dosyasında channel id'yi değiştir. build sırasında
rss feed'den son videolar çekilir.

### projeler

`src/data/projects.ts` dosyasında düzenle. her proje: id, title, tag,
summary, subtitle alanlarına sahip.

### bio

`src/data/bio.ts` dosyasında düzenle. hero bölümündeki bio metni ve
tech stack buradan gelir.

## yapı

```
src/
  components/
    ui/          buton, toggle, mobil menü
    home/        hero, now panel, metrics, çalışmalar, videolar, yazılar
    layout/      navbar, footer, layout wrapper
  content/
    blog/        .md yazılar buraya
  data/          projects.ts, bio.ts
  lib/           youtube.ts, cn.ts
  pages/         index, yazilar, videolar, cv, iletisim
  styles/        global.css
```

## deploy

deploy Prompt 4 ile yapılacak. öncesinde kullanıcı lokalde gözden geçirir.

### deploy öncesi yapılacaklar

- [ ] `public/assets/cv/samet-akin-cv.pdf` dosyasını ekle
- [ ] `public/assets/og/default.png` og görseli üret ve ekle
- [ ] `astro.config.mjs` dosyasında `site` değerini gerçek url ile güncelle
- [ ] github repo oluştur ve push et
